# -*- coding: utf-8 -*-
# File: app/services/rag_pipeline.py
import os
import io
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_milvus import Zilliz
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI
from langchain import hub
from langchain_community.document_loaders import PyPDFLoader
from pymilvus import connections, Collection, utility, Index  # Thêm utility
import tempfile
import time
from tqdm import tqdm
from langchain_core.prompts import ChatPromptTemplate
from sklearn.cluster import KMeans
from typing import Tuple, List, Dict, Any, Optional  # Thêm Dict, Any, Optional

import pymongo  # <--- THÊM IMPORT PYMONGO
from pymongo.collection import (
    Collection as MongoCollection,
)  # <--- Để tránh trùng tên với pymilvus

# File Processing & OCR
from PIL import Image, ImageEnhance, ImageFilter  # Thêm PIL
import pytesseract  # Thêm pytesseract
from pdf2image import convert_from_bytes  # Thêm pdf2image
from pypdf import PdfReader
import traceback  # Thêm traceback
import asyncio
import re

load_dotenv()

# Load env vars
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ZILLIZ_CLOUD_URI = os.getenv("ZILLIZ_CLOUD_URI")
ZILLIZ_CLOUD_TOKEN = os.getenv("ZILLIZ_CLOUD_TOKEN")

MONGO_URI = os.getenv("MONGO_URI")  # <--- Lấy URI MongoDB
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")  # <--- Lấy tên DB
MONGO_COLLECTION_NAME = os.getenv("MONGO_COLLECTION_NAME")  # <--- Lấy tên Collection

hnsw_index_params = {
    "metric_type": "COSINE", # Phải khớp với embedding của bạn
    "index_type": "HNSW",
    "params": {"M": 16, "efConstruction": 200}
}

mongo_client = None
if MONGO_URI:
    try:
        mongo_client = pymongo.MongoClient(MONGO_URI)
        print("Kết nối MongoDB thành công!")
    except pymongo.errors.ConfigurationError as e:
        print(f"Lỗi cấu hình MongoDB URI: {e}")
        mongo_client = None
    except Exception as e:
        print(f"Lỗi kết nối MongoDB khác: {e}")
        mongo_client = None
else:
    print(
        "Cảnh báo: MONGO_URI chưa được cấu hình trong .env. Không thể kết nối MongoDB."
    )


def get_mongo_collection() -> Optional[MongoCollection]:
    """Lấy đối tượng collection MongoDB."""
    if not mongo_client or not MONGO_DB_NAME or not MONGO_COLLECTION_NAME:
        print("Lỗi: Kết nối MongoDB hoặc tên DB/Collection chưa được cấu hình.")
        return None
    try:
        db = mongo_client[MONGO_DB_NAME]
        collection = db[MONGO_COLLECTION_NAME]
        # Kiểm tra kết nối nhanh (tùy chọn)
        # collection.count_documents({}) # Ví dụ kiểm tra
        return collection  # <--- CẦN THÊM DÒNG NÀY ĐỂ TRẢ VỀ COLLECTION KHI THÀNH CÔNG

    except Exception as e:
        print(f"Lỗi khi lấy MongoDB collection: {e}")
        return None


# Set up embedding
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"},
    encode_kwargs={"normalize_embeddings": True, "batch_size": 32},
)
# First connect to Zilliz (needed for collection management)
connections.connect(alias="default", uri=ZILLIZ_CLOUD_URI, token=ZILLIZ_CLOUD_TOKEN)

# Define collection name
COLLECTION_NAME = "rag_collection"

# Set up LLM
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2, openai_api_key=OPENAI_API_KEY)

# Prompt from LangChain hub
prompt = ChatPromptTemplate.from_template(
    """
Bạn là chuyên gia phân tích tài liệu. Nhiệm vụ của bạn là trả lời câu hỏi của người dùng.

**QUAN TRỌNG:** Trước tiên, hãy đánh giá câu hỏi của người dùng ({question}).
1.  **Nếu câu hỏi không rõ ràng, quá ngắn, không có ngữ nghĩa cụ thể để tìm kiếm thông tin (ví dụ: 'hello', '?', 'abc', 'bạn khỏe không?'), hoặc chỉ là lời chào hỏi đơn thuần:**
    * **BỎ QUA HOÀN TOÀN** phần TÀI LIỆU THAM KHẢO dưới đây.
    * **CHỈ trả lời MỘT TRONG CÁC CÂU SAU:** "Yêu cầu không có ngữ nghĩa." hoặc "Chưa xác định rõ yêu cầu của bạn, vui lòng cung cấp câu hỏi cụ thể hơn." (Chọn một câu phù hợp).
    * **KHÔNG** thêm bất kỳ thông tin nào khác, không giải thích, không thêm citation.

2.  **Nếu câu hỏi có vẻ hợp lệ và có thể trả lời được dựa trên tài liệu:**
    * Hãy sử dụng các TÀI LIỆU THAM KHẢO ({context}) để trả lời chi tiết cho câu hỏi ({question}).
    * **TUÂN THỦ NGHIÊM NGẶT CÁC YÊU CẦU SAU:**
        * Sử dụng chú thích vuông [number] NGAY SAU thông tin được lấy từ tài liệu tham khảo. Ví dụ: Fact A [1], Claim B [2].
        * Mỗi fact/claim trong câu trả lời PHẢI CÓ ít nhất một citation [number] tương ứng.
        * Giữ nguyên số citation [number] đã được đánh dấu trong phần TÀI LIỆU THAM KHẢO khi bạn trích dẫn chúng.
        * Câu trả lời phải chi tiết, mạch lạc.
        * Cuối cùng, thêm phần `REFERENCES:` liệt kê đầy đủ các tài liệu đã được trích dẫn trong câu trả lời, theo đúng format:
            [1] File: "tên file", Trang: X, Nội dung: "trích đoạn ngắn gọn từ context"
            [2] File: ... (tương tự)
            (Chỉ liệt kê những citation [number] bạn đã thực sự dùng trong câu trả lời).

CÂU HỎI: {question}

TÀI LIỆU THAM KHẢO (Chỉ dùng nếu câu hỏi hợp lệ):
{context}

CÂU TRẢ LỜI CỦA BẠN:
"""
)

# --- Ví dụ: Hàm tạo index IVF_FLAT (bạn cần gọi hàm này sau khi thêm dữ liệu) ---
def create_ivf_flat_index(user_id: str, nlist_value: int = 1024):
    """Tạo index IVF_FLAT nếu chưa có."""
    collection_name = get_user_collection_name(user_id)
    if not utility.has_collection(collection_name):
        print(f"Collection '{collection_name}' does not exist.")
        return

    try:
        collection = Collection(name=collection_name)
        vector_field_name = "embedding"

        if collection.has_index():
             index_info_list = collection.indexes # Lấy danh sách các index
             # Kiểm tra xem có index nào trên trường vector chưa
             vector_index_exists = any(idx.field_name == vector_field_name for idx in index_info_list)
             if vector_index_exists:
                  print(f"Index on field '{vector_field_name}' already exists for collection '{collection_name}'.")
                  # Có thể kiểm tra thêm index_type và params nếu muốn drop và tạo lại
                  # Ví dụ lấy params của index đầu tiên (cần kiểm tra đúng index)
                  # current_params = index_info_list[0].params
                  # print(f"Existing index params: {current_params}")
                  # collection.release()
                  # collection.drop_index()
                  # print("Dropped existing index.")
                  # --> Đi tiếp để tạo index mới
                  return # Bỏ qua nếu không muốn tạo lại

        print(f"Creating IVF_FLAT index for collection '{collection_name}' with nlist={nlist_value}")

        ivf_flat_index_params = {
            "metric_type": "COSINE",  # QUAN TRỌNG: Phải khớp với embedding của bạn
            "index_type": "IVF_FLAT",
            "params": {"nlist": nlist_value} # Tham số lúc xây dựng index
        }

        collection.create_index(field_name=vector_field_name, index_params=ivf_flat_index_params)
        collection.flush()
        print(f"Successfully created IVF_FLAT index on '{vector_field_name}'.")

        print(f"Loading collection '{collection_name}'...")
        collection.load() # Load collection để sẵn sàng search
        print(f"Collection '{collection_name}' loaded.")

    except Exception as e:
        print(f"Error creating or loading index for collection '{collection_name}': {e}")
        import traceback
        traceback.print_exc()


# --- THÊM HÀM HELPER ---
def get_user_collection_name(user_id: str) -> str:
    """Tạo tên collection chuẩn hóa cho user."""
    # Đảm bảo tên collection hợp lệ (loại bỏ ký tự đặc biệt nếu cần)
    safe_user_id = re.sub(r"[^a-zA-Z0-9_]", "_", user_id)
    return f"user_{safe_user_id}_rag"


def get_user_vector_store(user_id: str) -> Zilliz:
    """Lấy (hoặc tạo nếu chưa có) vector store cho user cụ thể."""
    collection_name = get_user_collection_name(user_id)

    vector_store_instance = Zilliz(
        embedding_function=embeddings,
        connection_args={"uri": ZILLIZ_CLOUD_URI, "token": ZILLIZ_CLOUD_TOKEN},
        collection_name=collection_name,
        auto_id=True,
        vector_field="embedding",
        text_field="content",
    )
    return vector_store_instance


# --- HÀM MỚI: LẤY DOC ID ĐÃ CHỌN TỪ MONGODB (TASK 3) ---
def get_selected_document_ids(
    user_id: str, mongo_coll: Optional[MongoCollection]
) -> List[str]:
    """
    Truy vấn MongoDB để lấy danh sách các document_id có trường 'status' là 1 (số nguyên)
    cho user_id cụ thể.
    """
    # --- SỬA LỖI LOGIC KIỂM TRA ---
    # Phải kiểm tra xem mongo_coll CÓ KHÔNG HỢP LỆ (None) hay không
    if mongo_coll is None:
        print(
            "Lỗi: Không thể truy vấn MongoDB do kết nối không hợp lệ (mongo_coll is None)."
        )
        return []  # Trả về rỗng nếu không có đối tượng collection\

    selected_ids = []
    try:
        # Tìm các document có user_id và status là số nguyên 1
        # Chỉ lấy trường 'document_id'
        cursor = mongo_coll.find(
            {
                "user_id": user_id,
                "status": 1,
            },  # <<< THAY ĐỔI: Dùng số nguyên 1 thay vì chuỗi "1"
            {
                "document_id": 1,
                "_id": 0,
            },  # Projection: chỉ lấy document_id, bỏ _id mặc định
        )

        # Lấy danh sách document_id từ cursor, đảm bảo document_id tồn tại
        # Cách 1: Dùng list comprehension với kiểm tra key (phổ biến)
        selected_ids = [doc["document_id"] for doc in cursor if "document_id" in doc]

        # Cách 2: Dùng .get() để an toàn hơn nếu key có thể thiếu (dù projection đã yêu cầu)
        # selected_ids = [doc.get("document_id") for doc in cursor if doc.get("document_id")]

        print(
            f"Tìm thấy {len(selected_ids)} document có status=1 cho user {user_id} từ MongoDB."
        )

    except Exception as e:
        # Ghi log lỗi sẽ tốt hơn là chỉ print trong môi trường production
        print(f"Lỗi khi truy vấn MongoDB lấy doc_id có status=1: {e}")
        return []  # Trả về rỗng nếu có lỗi xảy ra

    return selected_ids


def get_user_milvus_collection(user_id: str) -> Collection:
    """Lấy đối tượng Collection của pymilvus cho user."""
    collection_name = get_user_collection_name(user_id)
    if not utility.has_collection(collection_name):
        # Xử lý trường hợp collection chưa tồn tại (quan trọng cho các hàm delete, query trực tiếp)
        # Có thể raise lỗi hoặc trả về None/empty tùy logic mong muốn
        print(
            f"Warning: Collection '{collection_name}' for user '{user_id}' does not exist."
        )
        # Hoặc tạo collection ở đây nếu logic yêu cầu
        # raise ValueError(f"Collection for user {user_id} not found.")
        # Tạm thời trả về None, hàm gọi cần kiểm tra
        return None
    return Collection(collection_name)


def ask_question(user_id: str, question: str, headers: List[str] = []) -> str:
    """Trả lời câu hỏi DỰA TRÊN CÁC DOCUMENT ĐÃ CHỌN của user."""
    vector_store = get_user_vector_store(user_id)
    if len(headers) > 0:
        final_content = "\n".join(headers) + "\n" + question
    else:
        final_content = question

    # --- TASK 3: Kết nối MongoDB và lấy Doc ID đã chọn ---
    mongo_collection = get_mongo_collection()
    selected_ids = get_selected_document_ids(user_id, mongo_collection)
    # -----------------------------------------------------

    search_filter_expr = None  # Khởi tạo filter là None
    if not selected_ids:
        print(
            f"Không có document nào được chọn cho user {user_id}. Không thực hiện tìm kiếm."
        )
        return "Vui lòng chọn ít nhất một tài liệu để thực hiện tìm kiếm trong đó."
    else:
        search_filter_expr = f"doc_id in {selected_ids}"
        print(f"Thực hiện tìm kiếm với Milvus filter: {search_filter_expr}")
    try:
        nprobe_value = 64 
        search_params_config = {
            "metric_type": "COSINE", # Phải khớp metric lúc tạo index
            "params": {
                "nprobe": nprobe_value # Tham số tìm kiếm chính cho IVF_FLAT
            }
        }
        search_kwargs = {"search_params": search_params_config}
        if search_filter_expr:
            search_kwargs["expr"] = search_filter_expr
        
        k_value = 15
        retrieved_docs = vector_store.similarity_search(
            query=question,
            k=k_value,
            search_kwargs=search_kwargs 
        )
    except Exception as e:
        print(f"Lỗi trong quá trình similarity search (có thể do filter): {e}")
        return f"Đã xảy ra lỗi trong quá trình tìm kiếm tài liệu: {e}"

    if not retrieved_docs:
        if selected_ids:
            return "Không tìm thấy thông tin liên quan trong các tài liệu bạn đã chọn."
        else:
            return (
                "Không tìm thấy thông tin liên quan trong bất kỳ tài liệu nào của bạn."
            )
    docs_for_context = retrieved_docs[:10]

    citations = format_citations(docs_for_context)
    context_parts = []
    for idx, doc in enumerate(docs_for_context, 1):
            filename = doc.metadata.get("filename", "N/A")
            page_number = doc.metadata.get("page_number", "N/A")
            context_parts.append(
                f"[DOCUMENT {idx}]\nFile: {filename}\nPage: {page_number}\nContent: {doc.page_content[:300]}..."
        )

    # Gọi LLM với context đã lọc (hoặc không lọc nếu selected_ids rỗng và bạn chọn tìm tất cả)
    # Sử dụng prompt đã được sửa đổi để xử lý câu hỏi vô nghĩa
    messages = prompt.invoke(
        {"question": question, "context": "\n\n".join(context_parts)}
    )
    response = llm.invoke(messages)
    # references_text = "\n\nREFERENCES:\n"
    # for num, cit_data in citations.items():
    #         # Lấy nội dung preview ngắn gọn hơn từ full_content nếu cần
    #         content_preview = cit_data.get("full_content", "")[:100] + "..."
    #         references_text += f"[{num}] File: \"{cit_data['file']}\", Trang: {cit_data['page']}, Nội dung: \"{content_preview}\"\n"

    # Chỉ thêm references nếu có citations được dùng trong response (cần logic kiểm tra phức tạp hơn)
    # Hoặc đơn giản là luôn thêm nếu có citations được trả về
    # if citations:
    #         final_response = response.content + references_text
    # else:
    #         final_response = response.content

    return response.content


"""
CITATION FORMATTING
"""
def validate_citations(response: str, citations: dict):
    # Kiểm tra mọi citation trong response đều có trong references
    used_citations = set(re.findall(r"\[(\d+)\]", response))
    defined_citations = set(citations.keys())

    # Check for citations used in text but not defined in references
    missing_in_references = used_citations - defined_citations
    if missing_in_references:
        print(
            f"Warning: Citations {missing_in_references} used in response but not found in generated references."
        )
        # Optionally append placeholders or modify response

    # Check for citations defined in references but not used in text (less critical)
    # unused_in_text = defined_citations - used_citations
    # if unused_in_text:
    #     print(f"Info: Citations {unused_in_text} defined in references but not used in response text.")

    return response  # Return original response for now


def format_citations(retrieved_docs):
    citations = {}
    for idx, doc in enumerate(retrieved_docs, 1):
        citations[str(idx)] = {
            "file": doc.metadata.get("filename", "unknown"),
            "page": doc.metadata.get("page_number", "N/A"),
            # "content_preview": doc.page_content[:80] + "...", # Shorter preview if needed
            "full_content": doc.page_content[:150]
            + "...",  # Slightly longer preview for reference
        }
    return citations


"""""" """""" """""" """""" """""" """""" """""" """""" """""" """""" """""" """""" """"""


# --- CÁC HÀM HELPER OCR ---
def clean_text(text):
    """Làm sạch văn bản OCR."""
    text = re.sub(r"\n+", " ", text)  # Thay nhiều newline bằng 1 space
    text = re.sub(r" +", " ", text)  # Thay nhiều space bằng 1 space
    return text.strip()


def preprocess_image(image: Image.Image) -> Image.Image:
    """Cải thiện chất lượng ảnh cho OCR."""
    try:
        image = image.convert("L")  # Chuyển ảnh xám
        image = ImageEnhance.Contrast(image).enhance(2)  # Tăng tương phản
        image = image.filter(ImageFilter.SHARPEN)  # Làm nét
    except Exception as e:
        print(f"Cảnh báo: Lỗi tiền xử lý ảnh: {e}")
    return image


def ocr_image(image: Image.Image) -> str:
    """Trích xuất text từ ảnh PIL bằng pytesseract."""
    try:
        processed_image = preprocess_image(image)
        custom_config = r"--oem 3 --psm 6 -l vie+eng"  # Ngôn ngữ vie+eng
        extracted_text = pytesseract.image_to_string(
            processed_image, config=custom_config
        )
        return clean_text(extracted_text)
    except pytesseract.TesseractNotFoundError:
        print("LỖI: Không tìm thấy Tesseract. Đảm bảo đã cài đặt và cấu hình PATH.")
        raise RuntimeError("Tesseract OCR engine not found.")
    except Exception as e:
        print(f"Lỗi khi OCR ảnh: {e}")
        return ""


# --- KẾT THÚC HELPER OCR ---


def sanitize_metadata_keys(metadata: dict) -> dict:
    return {re.sub(r"[^a-zA-Z0-9_]", "_", k): v for k, v in metadata.items()}


# --- HÀM CHÍNH: Xử lý File (PDF/Ảnh) và Lưu trữ (VIẾT LẠI) ---
async def process_and_store_file(  # Đổi tên hàm và thêm content_type
    user_id: str,
    file_bytes: bytes,
    filename: str,
    doc_id: str,
    content_type: Optional[str],  # Thêm tham số content_type
) -> int:
    """
    Xử lý file PDF hoặc Ảnh, trích xuất text, chunk và lưu vào Milvus.
    Trả về số lượng chunk đã thêm.
    """
    print(f"Bắt đầu xử lý file: {filename} (doc_id: {doc_id}, type: {content_type})")

    # --- Kiểm tra tồn tại (Giữ logic kiểm tra từ code bạn cung cấp) ---
    existing_milvus_count = get_embedding_count_for_doc_id(user_id, doc_id)
    if existing_milvus_count > 0:
        print(
            f"Cảnh báo: Đã tìm thấy {existing_milvus_count} embeddings cho doc_id '{doc_id}' trong Milvus của user '{user_id}'. Bỏ qua embedding."
        )

    # --- Khởi tạo list lưu text các trang ---
    extracted_pages: List[Tuple[int, str]] = []  # List of (page_number, page_text)

    # --- Bước 1: Trích xuất Text ---
    try:
        if content_type == "application/pdf":
            print("Đang xử lý PDF...")
            pdf_text_extracted = False
            temp_text_check = ""
            num_pages = 0
            # Thử trích xuất text trực tiếp bằng pypdf
            try:
                reader = PdfReader(io.BytesIO(file_bytes))
                num_pages = len(reader.pages)
                print(f"PDF có {num_pages} trang. Thử trích xuất text trực tiếp...")
                page_data_temp = []  # Lưu tạm để quyết định fallback
                for i, page in enumerate(reader.pages):
                    page_num = i + 1
                    try:
                        page_text = (
                            page.extract_text() or ""
                        )  # Trả về chuỗi rỗng nếu extract_text() là None
                        page_data_temp.append((page_num, page_text.strip()))
                        temp_text_check += page_text
                    except Exception as page_extract_err:
                        print(
                            f"  - Lỗi trích xuất text trang {page_num}: {page_extract_err}. Xem như trang rỗng."
                        )
                        page_data_temp.append((page_num, ""))

                # Heuristic để quyết định có fallback không
                if len(temp_text_check.strip()) > max(
                    50, num_pages * 5
                ):  # Cần nhiều hơn 50 ký tự hoặc 5 ký tự/trang
                    print("Trích xuất text PDF trực tiếp thành công.")
                    extracted_pages = page_data_temp  # Sử dụng kết quả trực tiếp
                    pdf_text_extracted = True
                else:
                    print("Text PDF trực tiếp không đủ hoặc lỗi. Fallback sang OCR...")
                    # Không gán extracted_pages ở đây, để logic OCR xử lý

            except Exception as pypdf_err:
                print(f"Lỗi khi đọc PDF bằng pypdf: {pypdf_err}. Fallback sang OCR.")
                # extracted_pages sẽ rỗng, tự động fallback

            # Fallback sang OCR nếu cần
            if not pdf_text_extracted:
                print("Thực hiện OCR trên các trang PDF...")
                try:
                    images = convert_from_bytes(file_bytes, dpi=300)
                    print(f"Chuyển PDF thành {len(images)} ảnh để OCR.")
                    if not images:  # Nếu pdf2image không trả về ảnh nào
                        raise ValueError(
                            "Không thể chuyển đổi PDF thành ảnh (có thể file PDF lỗi hoặc trống)."
                        )
                    for i, image in enumerate(images):
                        page_num = i + 1
                        print(f"  - OCR trang {page_num}/{len(images)}...")
                        page_ocr_text = ocr_image(image)
                        extracted_pages.append((page_num, page_ocr_text))
                        image.close()
                    print("OCR PDF hoàn tất.")
                except Exception as pdf_ocr_err:
                    print(f"Lỗi trong quá trình OCR PDF: {pdf_ocr_err}")
                    # Nếu cả 2 cách đều lỗi, raise lỗi để báo thất bại
                    raise RuntimeError(
                        f"Không thể trích xuất text từ PDF bằng cả hai phương pháp: {pdf_ocr_err}"
                    ) from pdf_ocr_err

        elif content_type and content_type.startswith("image/"):
            print("Đang xử lý Ảnh...")
            try:
                image = Image.open(io.BytesIO(file_bytes))
                image_text = ocr_image(image)
                extracted_pages.append((1, image_text))  # Ảnh coi là 1 trang
                image.close()
                print("OCR ảnh hoàn tất.")
            except Exception as img_err:
                # Phân loại lỗi Pillow và các lỗi khác
                if isinstance(img_err, (IOError, SyntaxError)):  # Lỗi Pillow thường gặp
                    raise ValueError(
                        f"File ảnh không hợp lệ hoặc không được hỗ trợ: {img_err}"
                    ) from img_err
                else:  # Lỗi khác (ví dụ Tesseract)
                    raise RuntimeError(f"Lỗi khi xử lý ảnh: {img_err}") from img_err

        elif content_type == "text/plain":
            print("Đang xử lý file Text...")
            decoded_text = ""
            try:
                # Thử decode bằng UTF-8 trước, thay thế ký tự lỗi
                decoded_text = file_bytes.decode("utf-8", errors="replace")
                print("Decode file text bằng UTF-8 thành công.")
            except UnicodeDecodeError:
                print("Decode UTF-8 thất bại, thử decode bằng latin-1...")
                try:
                    # Thử fallback sang latin-1 (phổ biến cho một số file text)
                    decoded_text = file_bytes.decode("latin-1", errors="replace")
                    print("Decode file text bằng latin-1 thành công.")
                except Exception as decode_err:
                    # Nếu cả hai đều lỗi, báo lỗi
                    raise ValueError(
                        f"Không thể decode file text với UTF-8 hoặc latin-1: {decode_err}"
                    ) from decode_err
            except Exception as txt_err:
                raise ValueError(f"Lỗi khi xử lý file text: {txt_err}") from txt_err

            # Làm sạch và thêm vào danh sách trang (coi là 1 trang)
            cleaned_decoded_text = clean_text(decoded_text)  # Dùng hàm clean_text đã có
            if cleaned_decoded_text:
                extracted_pages.append((1, cleaned_decoded_text))
                print(
                    f"Trích xuất thành công {len(cleaned_decoded_text)} ký tự từ file text."
                )
            else:
                print(
                    "Cảnh báo: File text rỗng hoặc không có nội dung sau khi làm sạch."
                )
        elif content_type in ["text/markdown", "text/x-markdown"] or (
            filename and filename.lower().endswith((".md", ".markdown"))
        ):
            print("Processing Markdown file...")
            decoded_text = ""
            try:
                # Thử decode bằng UTF-8 trước, thay thế ký tự lỗi
                decoded_text = file_bytes.decode("utf-8", errors="replace")
                print("Decode file Markdown bằng UTF-8 thành công.")
            except UnicodeDecodeError:
                print("Decode UTF-8 thất bại cho Markdown, thử decode bằng latin-1...")
                try:
                    # Thử fallback sang latin-1
                    decoded_text = file_bytes.decode("latin-1", errors="replace")
                    print("Decode file Markdown bằng latin-1 thành công.")
                except Exception as decode_err:
                    # Nếu cả hai đều lỗi, báo lỗi
                    raise ValueError(
                        f"Không thể decode file Markdown: {decode_err}"
                    ) from decode_err
            except Exception as md_err:
                raise ValueError(f"Lỗi khi xử lý file Markdown: {md_err}") from md_err

            # Coi toàn bộ nội dung Markdown là trang 1
            cleaned_md_text = decoded_text.strip()  # Strip khoảng trắng thừa
            if cleaned_md_text:
                # Lưu raw markdown text vào extracted_pages
                extracted_pages.append((1, cleaned_md_text))
                print(
                    f"Trích xuất thành công {len(cleaned_md_text)} ký tự từ file Markdown."
                )
            else:
                print("Cảnh báo: File Markdown rỗng hoặc không có nội dung.")

        else:
            # Loại file không xác định hoặc không hỗ trợ
            raise ValueError(f"Loại file không được hỗ trợ: {content_type}")

    except (ValueError, RuntimeError, Exception) as extraction_err:
        # Bắt các lỗi đã raise và lỗi khác
        print(
            f"Lỗi nghiêm trọng trong giai đoạn trích xuất text cho {filename}: {extraction_err}"
        )
        traceback.print_exc()
        return 0  # Trả về 0 chunk

    # --- Kiểm tra lại nếu không trích xuất được gì ---
    if not extracted_pages or all(not text.strip() for _, text in extracted_pages):
        print(f"Cảnh báo: Không trích xuất được nội dung văn bản nào từ {filename}.")
        # Cập nhật trạng thái vào MongoDB
        mongo_coll = get_mongo_collection()
        if mongo_coll:
            mongo_coll.update_one(
                {"user_id": user_id, "document_id": doc_id},
                {"$set": {"processing_status": "no_text_extracted"}},
                upsert=True,
            )
        return 0

    # --- Bước 2: Tạo Langchain Documents ---
    docs: List[Document] = []
    total_pages_processed = len(extracted_pages)
    for page_num, page_text in extracted_pages:
        if page_text and page_text.strip():  # Chỉ tạo Document nếu page_text không rỗng
            metadata = {
                "doc_id": doc_id,
                "user_id": user_id,
                "filename": filename,
                "page_number": int(page_num),  # Đảm bảo là int
                "total_pages": int(total_pages_processed),  # Đảm bảo là int
            }
            docs.append(Document(page_content=page_text, metadata=metadata))

    if not docs:
        print(
            f"Cảnh báo: Không tạo được Document object nào sau trích xuất cho {filename}."
        )
        return 0
    print(f"Đã tạo {len(docs)} Document objects để chunking.")

    # --- Bước 3: Chunking ---
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=2500,
        chunk_overlap=500,
        length_function=len,
        is_separator_regex=False,
    )
    # Bọc split_documents trong try-except phòng lỗi chunking
    try:
        chunks = text_splitter.split_documents(docs)
    except Exception as chunk_err:
        print(f"Lỗi nghiêm trọng khi chunking document {doc_id}: {chunk_err}")
        traceback.print_exc()
        # Cập nhật trạng thái lỗi vào MongoDB
        mongo_coll = get_mongo_collection()
        if mongo_coll:
            mongo_coll.update_one(
                {"user_id": user_id, "document_id": doc_id},
                {
                    "$set": {
                        "processing_status": "chunking_failed",
                        "error_message": str(chunk_err),
                    }
                },
                upsert=True,
            )
        return 0

    final_chunks = []
    for i, chunk in enumerate(chunks):
        try:
            # Kế thừa metadata từ Document gốc
            chunk.metadata["chunk_id"] = f"{doc_id}_chunk_{i}"
            chunk.metadata["chunk_index"] = i
            # Chuyển đổi kiểu dữ liệu và xử lý None nếu cần cho Milvus
            chunk.metadata["page_number"] = int(chunk.metadata.get("page_number", -1))
            chunk.metadata["total_pages"] = int(chunk.metadata.get("total_pages", -1))
            chunk.metadata["chunk_index"] = int(chunk.metadata.get("chunk_index", -1))
            # Đảm bảo các trường string không phải None
            chunk.metadata["doc_id"] = str(chunk.metadata.get("doc_id", ""))
            chunk.metadata["user_id"] = str(chunk.metadata.get("user_id", ""))
            chunk.metadata["filename"] = str(chunk.metadata.get("filename", ""))
            chunk.metadata["chunk_id"] = str(chunk.metadata.get("chunk_id", ""))
            final_chunks.append(chunk)
        except Exception as meta_err:
            print(f"Lỗi khi xử lý metadata cho chunk {i} của doc {doc_id}: {meta_err}")
            # Bỏ qua chunk này hoặc xử lý khác

    if not final_chunks:
        print(f"Cảnh báo: Không có chunk hợp lệ nào được tạo cho {filename}.")
        return 0
    print(f"Đã chia thành {len(final_chunks)} chunks.")

    # --- Bước 4: Embedding và Lưu trữ ---
    try:
        vector_store = get_user_vector_store(user_id)
        batch_size = 32  # Điều chỉnh nếu cần
        num_added = 0
        for i in tqdm(
            range(0, len(final_chunks), batch_size),
            desc=f"Embedding chunks cho {filename} (User: {user_id})",
        ):
            batch = final_chunks[i : i + batch_size]
            # Thêm try-except quanh add_documents để bắt lỗi cụ thể hơn nếu cần
            try:
                vector_store.add_documents(batch)
                num_added += len(batch)
            except Exception as add_doc_err:
                print(f"Lỗi khi thêm batch {i//batch_size} vào Milvus: {add_doc_err}")
                # Quyết định dừng lại hay tiếp tục với batch khác
                raise add_doc_err  # Dừng lại nếu có lỗi nghiêm trọng

        print(
            f"Thêm thành công {num_added} embeddings cho doc_id '{doc_id}' của user '{user_id}'."
        )

        # --- BƯỚC 5: KIỂM TRA/TẠO INDEX SAU KHI THÊM DATA ---
        if num_added > 0: # Chỉ chạy nếu thực sự có thêm dữ liệu mới
            try:
                print(f"Bắt đầu kiểm tra/tạo index IVF_FLAT cho user {user_id}...")
                # **QUAN TRỌNG**: Chọn giá trị nlist phù hợp.
                # Giá trị này nên ổn định cho mỗi user hoặc lấy từ cấu hình.
                nlist_for_index = 1024 # Ví dụ, bạn cần xác định giá trị này
                # Chạy hàm đồng bộ create_ivf_flat_index trong một thread riêng
                await asyncio.to_thread(create_ivf_flat_index, user_id, nlist_for_index)
                print(f"Hoàn tất kiểm tra/tạo index cho user {user_id}.")
            except Exception as index_err:
                # Ghi log lỗi nhưng không nên dừng toàn bộ quá trình xử lý file
                print(f"LỖI trong quá trình kiểm tra/tạo index cho user {user_id}: {index_err}")
                traceback.print_exc()

        return num_added

    except Exception as e:
        print(
            f"Lỗi nghiêm trọng khi thêm documents vào Milvus cho doc_id {doc_id}, user {user_id}: {e}"
        )
        traceback.print_exc()
        raise RuntimeError(f"Không thể thêm embeddings vào vector store: {e}") from e


# Ví dụ sửa đổi hàm delete_embeddings
def delete_embeddings(
    user_id: str,  # Thêm user_id
    filter_dict: Optional[Dict[str, Any]] = None,
    document_id: Optional[str] = None,
) -> int:
    """Xóa embeddings từ collection của user."""
    collection_name = get_user_collection_name(user_id)
    if not utility.has_collection(collection_name):
        print(
            f"Collection '{collection_name}' for user '{user_id}' does not exist. Nothing to delete."
        )
        return 0

    # Lấy đối tượng Collection từ pymilvus để dùng hàm delete
    collection = get_user_milvus_collection(user_id)
    if (
        not collection
    ):  # Kiểm tra nếu collection không tồn tại (get_user_milvus_collection trả None)
        return 0

    filter_expression = ""
    # ... (logic tạo filter_expression giữ nguyên, nhưng nó sẽ áp dụng lên collection của user) ...
    if document_id is not None:
        filter_expression = f'doc_id == "{document_id}"'
        print(
            f"Attempting to delete from {collection_name} with filter: {filter_expression}"
        )
    elif filter_dict is not None and filter_dict:
        filter_parts = []
        for k, v in filter_dict.items():
            if isinstance(v, str):
                filter_parts.append(f'{k} == "{v}"')
            else:
                filter_parts.append(f"{k} == {v}")
        filter_expression = " and ".join(filter_parts)
        print(
            f"Attempting to delete from {collection_name} with filter: {filter_expression}"
        )
    else:
        # Xóa TẤT CẢ trong collection CỦA USER NÀY
        filter_expression = "id >= 0"  # Hoặc 'pk >= 0' tùy vào schema
        print(
            f"Attempting to delete ALL embeddings from {collection_name} with filter: {filter_expression}"
        )

    if not filter_expression:
        print("No valid delete condition provided.")
        return 0

    try:
        res = collection.delete(expr=filter_expression)
        # collection.flush() # Cân nhắc flush nếu cần thấy kết quả ngay
        deleted_count = getattr(res, "delete_count", 0)
        print(
            f"Successfully deleted {deleted_count} embeddings from {collection_name} matching: '{filter_expression}'"
        )
        return deleted_count
    except Exception as e:
        print(f"Error deleting embeddings from {collection_name}: {e}")
        import traceback

        traceback.print_exc()
        raise e


# Ví dụ sửa đổi hàm get_embedding_count_for_doc_id
def get_embedding_count_for_doc_id(user_id: str, doc_id: str) -> int:
    """Đếm số embedding cho doc_id trong collection của user."""
    collection = get_user_milvus_collection(user_id)
    if not collection:
        return 0
    try:
        filter_expression = f'doc_id == "{doc_id}"'
        results = collection.query(
            expr=filter_expression, output_fields=["id"], limit=1
        )  # Chỉ cần check tồn tại
        return len(results)
    except Exception as e:
        print(
            f"Error checking embedding count for user '{user_id}', doc_id '{doc_id}': {e}"
        )
        return 0


# Ví dụ sửa đổi hàm get_document_embeddings
def get_document_embeddings(user_id: str, doc_id: str):
    """Lấy embeddings cho doc_id từ collection của user."""
    collection = get_user_milvus_collection(user_id)
    if not collection:
        raise ValueError(
            f"Collection for user {user_id} not found."
        )  # Hoặc trả về rỗng

    try:
        output_fields = [
            "embedding",
            "chunk_id",
            "page_number",
            "content",
            "filename",
            # "total_pages",
        ]
        results = collection.query(
            expr=f'doc_id == "{doc_id}"',
            output_fields=output_fields,
        )
        # ... (phần còn lại của hàm format kết quả giữ nguyên) ...
        formatted_embeddings = []
        total_chunks = len(results)
        if total_chunks > 0:
            # ... (format results) ...
            for result in results:
                formatted_embeddings.append(
                    {
                        "chunk_id": result.get("chunk_id", "N/A"),
                        "embedding": result.get("embedding", []),
                        "page_number": result.get("page_number", -1),
                        "content": result.get("content", ""),
                    }
                )
            return {
                "doc_id": doc_id,  # Giả định doc_id là đúng
                "total_chunks": total_chunks,
                "embeddings": formatted_embeddings,
            }
        else:
            return {"doc_id": doc_id, "total_chunks": 0, "embeddings": []}

    except Exception as e:
        print(
            f"Error retrieving embeddings for user '{user_id}', doc_id '{doc_id}': {e}"
        )
        import traceback

        traceback.print_exc()
        raise ValueError(
            f"Lỗi khi lấy embeddings cho user '{user_id}', doc_id '{doc_id}': {str(e)}"
        )


# Ví dụ sửa đổi hàm get_smaller_branches_from_docs
async def get_smaller_branches_from_docs(
    user_id: str, documentIDs: List[str], num_clusters: int = 5
):
    """Lấy nhánh con từ các tài liệu trong collection của user."""
    all_chunks_content = []
    all_embeddings_vectors = []
    print(f"Fetching embeddings for user '{user_id}', doc IDs: {documentIDs}")

    for doc_id in documentIDs:
        try:
            # Gọi hàm đã sửa đổi để lấy data từ collection của user
            result = get_document_embeddings(user_id, doc_id)
            # ... (phần còn lại xử lý result, gộp chunk, clustering giữ nguyên) ...
            if result["total_chunks"] > 0:
                for inner_chunk in result["embeddings"]:
                    content = inner_chunk.get("content")
                    embedding_vector = inner_chunk.get("embedding")
                    if content and embedding_vector:
                        all_chunks_content.append(content)
                        all_embeddings_vectors.append(embedding_vector)
                    # ... (else log warning) ...
            # ... (else log warning) ...
        except Exception as e:
            print(
                f"Error fetching embeddings for user '{user_id}', doc_id {doc_id}: {e}"
            )

    # ... (phần clustering và tạo markdown giữ nguyên) ...
    if not all_chunks_content or not all_embeddings_vectors:
        raise ValueError("Không tìm thấy nội dung/embedding hợp lệ.")
    # ... (clustering logic) ...
    actual_num_clusters = min(num_clusters, len(all_chunks_content))
    # ... (kmeans) ...
    kmeans_model = KMeans(n_clusters=actual_num_clusters, random_state=42, n_init=10)
    kmeans_predictions = kmeans_model.fit_predict(all_embeddings_vectors)
    # ... (combine chunks, call LLM, extract headers) ...
    combined_chunks = combine_chunks(all_chunks_content, kmeans_predictions)
    result = "# root\n"
    for i in range(actual_num_clusters):
        print(f" combine chunks {i} for user {user_id}")
        print(f" cluster {i} content: {combined_chunks[i]}")
        if i not in combined_chunks:
            continue
        print("you passed")
        cluster_content = combined_chunks[i]
        if not cluster_content.strip():
            continue
        try:
            completion = llm.invoke(  # hoặc await nếu llm.invoke là async
                [
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that reformats to markdown text for better readability with \n"
                        "# for header 1, \n ## for header 2, \n ### header 3 and the doc. \n the header must appear in order # -> ## -> ###",
                    },
                    {"role": "user", "content": cluster_content},
                ]
            )
            text = completion.content
            header_text = add_hashtag_to_header(text)
            result += header_text
        except Exception as e:
            print(f"Error processing cluster {i} for user {user_id}: {e}")
            result += f"## Cluster {i} (Error Processing)\n"

    return result


def combine_chunks(chunks: List[str], predictions: List[int]) -> Dict[int, str]:
    """Combines text chunks based on cluster prediction index."""
    combined = {}
    if len(chunks) != len(predictions):
        print(
            f"Warning: Mismatch in length of chunks ({len(chunks)}) and predictions ({len(predictions)})."
        )
        # Handle error or return empty dict?
        return {}
    for i, chunk_content in enumerate(chunks):
        cluster_index = predictions[i]
        if cluster_index not in combined:
            combined[cluster_index] = chunk_content
        else:
            # Append with a space or newline depending on desired structure
            combined[cluster_index] += (
                "\n\n" + chunk_content
            )  # Use newline for better separation
    return combined


def extract_all_headers(text: str) -> str:
    """Extracts lines starting with #, ##, ### while preserving relative order."""
    header_text = ""
    lines = text.split("\n")
    for line in lines:
        stripped_line = line.strip()
        if stripped_line.startswith("#"):
            header_text += "#" + stripped_line + "\n" 
        else :
            header_text += stripped_line + "\n"
    return header_text
def add_hashtag_to_header(text: str) -> str:
    """Adds # to lines starting with #, ##, ### while preserving relative order."""
    header_text = ""
    lines = text.split("\n")
    for line in lines:
        stripped_line = line.strip()
        if stripped_line.startswith("#"):
            header_text += "#" + stripped_line + "\n" 
        else :
            header_text += stripped_line + "\n"
    return header_text
    

# (Optional) Function to write content to a file, ensure correct encoding
def write_to_file(file_path: str, content: str):
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Successfully wrote content to {file_path}")
    except Exception as e:
        print(f"Error writing to file {file_path}: {e}")
