# import time
# import traceback
# import asyncio
# from typing import Optional, List, Dict, Any


# # Sửa các import sau:
# from .rag_logic.core.connections import get_mongo_collection  # <<< Sửa đường dẫn
# from .rag_logic.processing.indexing import (  # <<< Sửa đường dẫn
#     get_embedding_count_for_doc_id,
#     create_langchain_documents,
#     chunk_documents,
#     embed_and_store_chunks,
#     create_ivf_flat_index,
# )
# from .rag_logic.processing.text_processing import extract_text  # <<< Sửa đường dẫn
# from .rag_logic.processing.status_tracking import (
#     update_processing_status,
# )  # <<< Sửa đường dẫn


# # ============================================
# # Hàm Chính Điều Phối
# # ============================================


# async def process_and_store_file(
#     user_id: str,
#     file_bytes: bytes,
#     filename: str,
#     doc_id: str,
#     content_type: Optional[str],
# ) -> int:
#     """
#     (Điều phối) Xử lý file, trích xuất text, chunk, embed và lưu vào Milvus.
#     Trả về số lượng chunk đã thêm.
#     """
#     start_time = time.time()
#     log_prefix = f"[{user_id}][{doc_id}]"  # Tiền tố log thống nhất
#     print(f"{log_prefix} Bắt đầu xử lý file: {filename} (Type: {content_type})")
#     num_added = 0

#     # --- 1. Kiểm tra tồn tại ---
#     try:
#         # Chạy kiểm tra đồng bộ trong thread
#         existing_milvus_count = await asyncio.to_thread(
#             get_embedding_count_for_doc_id, user_id, doc_id
#         )
#         if existing_milvus_count > 0:
#             print(
#                 f"{log_prefix} Cảnh báo: Đã tồn tại {existing_milvus_count} embeddings. Bỏ qua."
#             )
#             # Không cần cập nhật status ở đây, hoặc có thể thêm status 'already_exists'
#             return 0
#     except Exception as check_err:
#         print(f"{log_prefix} Lỗi khi kiểm tra embedding tồn tại: {check_err}")
#         # Báo lỗi và dừng lại
#         await asyncio.to_thread(
#             update_processing_status,
#             user_id,
#             doc_id,
#             "processing_failed",
#             f"Lỗi kiểm tra tồn tại: {check_err}",
#         )
#         return 0

#     try:
#         # Cập nhật trạng thái bắt đầu xử lý
#         await asyncio.to_thread(
#             update_processing_status, user_id, doc_id, "processing_started"
#         )

#         # --- 2. Trích xuất Text ---
#         print(f"{log_prefix} Bước 1: Trích xuất text...")
#         extracted_pages = await asyncio.to_thread(
#             extract_text, file_bytes, content_type, filename
#         )

#         # --- 3. Kiểm tra kết quả trích xuất ---
#         if not extracted_pages or all(not text.strip() for _, text in extracted_pages):
#             print(f"{log_prefix} Cảnh báo: Không trích xuất được nội dung văn bản.")
#             await asyncio.to_thread(
#                 update_processing_status, user_id, doc_id, "no_text_extracted"
#             )
#             return 0
#         print(
#             f"{log_prefix} Trích xuất thành công text từ {len(extracted_pages)} trang/phần."
#         )

#         # --- 4. Tạo Langchain Documents ---
#         print(f"{log_prefix} Bước 2: Tạo Langchain Documents...")
#         metadata_base = {"doc_id": doc_id, "user_id": user_id, "filename": filename}
#         # Hàm này thường nhanh, có thể chạy trực tiếp hoặc trong thread tùy độ phức tạp
#         docs = await asyncio.to_thread(
#             create_langchain_documents, extracted_pages, metadata_base
#         )
#         if not docs:
#             print(f"{log_prefix} Cảnh báo: Không tạo được Document object nào.")
#             await asyncio.to_thread(
#                 update_processing_status,
#                 user_id,
#                 doc_id,
#                 "processing_failed",
#                 "Không tạo được document object",
#             )
#             return 0
#         print(f"{log_prefix} Đã tạo {len(docs)} Document objects.")

#         # --- 5. Chunk Documents ---
#         print(f"{log_prefix} Bước 3: Chunking Documents...")
#         # Chạy trong thread vì có thể CPU bound
#         final_chunks = await asyncio.to_thread(chunk_documents, docs)
#         if not final_chunks:
#             print(f"{log_prefix} Cảnh báo: Không có chunk hợp lệ nào được tạo.")
#             await asyncio.to_thread(
#                 update_processing_status,
#                 user_id,
#                 doc_id,
#                 "chunking_failed",
#                 "Không tạo được chunk hợp lệ",
#             )
#             return 0
#         print(f"{log_prefix} Đã chia thành {len(final_chunks)} chunks.")

#         # --- 6. Embedding và Lưu trữ ---
#         print(f"{log_prefix} Bước 4: Embedding và Lưu trữ...")
#         # Hàm này đã là async hoặc chạy trong thread
#         num_added = await embed_and_store_chunks(user_id, final_chunks)

#         # --- 7. Tạo/Cập nhật Index ---
#         if num_added > 0:
#             print(f"{log_prefix} Bước 5: Kiểm tra/Tạo Index...")
#             try:
#                 # Index creation là blocking, chạy trong thread
#                 await asyncio.to_thread(
#                     create_ivf_flat_index, user_id
#                 )  # Không cần truyền nlist nếu dùng giá trị mặc định từ config
#                 print(f"{log_prefix} Hoàn tất kiểm tra/tạo index.")
#             except Exception as index_err:
#                 print(
#                     f"{log_prefix} LỖI trong quá trình kiểm tra/tạo index: {index_err}"
#                 )
#                 traceback.print_exc()
#                 # Không dừng, chỉ log lỗi, vì đã lưu thành công
#                 # Có thể cập nhật trạng thái phụ là "index_error"
#         else:
#             print(f"{log_prefix} Không có chunk nào được thêm, bỏ qua index.")

#         # --- 8. Cập nhật trạng thái thành công ---
#         await asyncio.to_thread(
#             update_processing_status, user_id, doc_id, "processed_successfully"
#         )
#         print(
#             f"{log_prefix} HOÀN TẤT xử lý {filename} sau {time.time() - start_time:.2f}s. Added {num_added} chunks."
#         )
#         return num_added

#     # --- Xử lý lỗi tổng quát ---
#     except (ValueError, RuntimeError, Exception) as processing_err:
#         error_msg = str(processing_err)
#         print(f"{log_prefix} LỖI NGHIÊM TRỌNG: {error_msg}")
#         traceback.print_exc()
#         await asyncio.to_thread(
#             update_processing_status, user_id, doc_id, "processing_failed", error_msg
#         )
#         return 0  # Trả về 0 khi lỗi

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
from pymilvus import connections, Collection, utility
import tempfile
import time
from tqdm import tqdm
from langchain_core.prompts import ChatPromptTemplate
from sklearn.cluster import KMeans
from typing import Tuple, List, Dict, Any, Optional

from langchain_google_genai import ChatGoogleGenerativeAI
import google.generativeai as genai

import pymongo
from pymongo.collection import (
    Collection as MongoCollection,
)

from PIL import Image, ImageEnhance, ImageFilter
import pytesseract
from pdf2image import convert_from_bytes
from pypdf import PdfReader
import traceback
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

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    print(
        "Cảnh báo: GOOGLE_API_KEY chưa được cấu hình trong .env. Không thể sử dụng Gemini."
    )
    # Có thể raise lỗi hoặc đặt llm = None tùy logic xử lý của bạn
else:
    try:
        genai.configure(api_key=GOOGLE_API_KEY)
        print("Đã cấu hình thành công Google API Key.")
    except Exception as e:
        print(f"Lỗi khi cấu hình Google API Key: {e}")

hnsw_index_params = {
    "metric_type": "COSINE",  # Phải khớp với embedding của bạn
    "index_type": "HNSW",
    "params": {"M": 16, "efConstruction": 200},
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
    if mongo_client is None or not MONGO_DB_NAME or not MONGO_COLLECTION_NAME:
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
# llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2, openai_api_key=OPENAI_API_KEY)

GEMINI_MODEL_NAME = "gemini-1.5-flash-latest"  # Hoặc "gemini-1.5-pro-latest", etc.

# Khởi tạo LLM (Thay thế ChatOpenAI)
if GOOGLE_API_KEY:  # Chỉ khởi tạo nếu có API Key
    try:
        llm = ChatGoogleGenerativeAI(
            model=GEMINI_MODEL_NAME,
            google_api_key=GOOGLE_API_KEY,
            temperature=0.5,  # Điều chỉnh nhiệt độ nếu cần
            convert_system_message_to_human=False,  # Model mới hỗ trợ SystemMessage
            # Thêm các tham số khác nếu cần, ví dụ: safety_settings
        )
        print(f"Sử dụng mô hình LLM: Google Gemini ({GEMINI_MODEL_NAME})")
    except Exception as e:
        print(f"Lỗi khi khởi tạo ChatGoogleGenerativeAI model {GEMINI_MODEL_NAME}: {e}")
        llm = None  # Đặt llm là None nếu khởi tạo lỗi
else:
    print("Không thể khởi tạo LLM do thiếu GOOGLE_API_KEY.")
    llm = None

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
            index_info_list = collection.indexes  # Lấy danh sách các index
            vector_index_exists = any(
                idx.field_name == vector_field_name for idx in index_info_list
            )
            if vector_index_exists:
                print(
                    f"Index on field '{vector_field_name}' already exists for collection '{collection_name}'."
                )
                # Có thể kiểm tra thêm index_type và params nếu muốn drop và tạo lại
                # Ví dụ lấy params của index đầu tiên (cần kiểm tra đúng index)
                # current_params = index_info_list[0].params
                # print(f"Existing index params: {current_params}")
                # collection.release()
                # collection.drop_index()
                # print("Dropped existing index.")
                # --> Đi tiếp để tạo index mới
                return  # Bỏ qua nếu không muốn tạo lại

        print(
            f"Creating IVF_FLAT index for collection '{collection_name}' with nlist={nlist_value}"
        )

        ivf_flat_index_params = {
            "metric_type": "COSINE",  # QUAN TRỌNG: Phải khớp với embedding của bạn
            "index_type": "IVF_FLAT",
            "params": {"nlist": nlist_value},  # Tham số lúc xây dựng index
        }

        collection.create_index(
            field_name=vector_field_name, index_params=ivf_flat_index_params
        )
        collection.flush()
        print(f"Successfully created IVF_FLAT index on '{vector_field_name}'.")

        print(f"Loading collection '{collection_name}'...")
        collection.load()  # Load collection để sẵn sàng search
        print(f"Collection '{collection_name}' loaded.")

    except Exception as e:
        print(
            f"Error creating or loading index for collection '{collection_name}': {e}"
        )
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


SUMMARIZATION_KEYWORDS = ["tổng hợp", "tóm tắt", "summarize", "summary"]


def check_summarization_intent(question: str) -> bool:
    """Kiểm tra xem câu hỏi có phải là yêu cầu tóm tắt không."""
    query_lower = question.lower()
    for keyword in SUMMARIZATION_KEYWORDS:
        if keyword in query_lower:
            # Có thể thêm logic kiểm tra ngữ cảnh để tránh false positive
            # Ví dụ: "Sự khác biệt giữa tổng hợp và phân tích là gì?" -> không phải tóm tắt
            # Hiện tại, kiểm tra đơn giản:
            return True
    return False


SUMMARIZATION_PROMPT_TEMPLATE = ChatPromptTemplate.from_template(
    """Bạn là một trợ lý AI giỏi tóm tắt văn bản. Dựa vào nội dung dưới đây được trích xuất từ một tài liệu, hãy viết một bản tóm tắt ngắn gọn, nêu bật những ý chính và thông tin quan trọng nhất.

NỘI DUNG TÀI LIỆU:
---
{document_content}
---

BẢN TÓM TẮT (Ngắn gọn, súc tích):
"""
)


def get_content_and_filename(
    user_id: str, doc_id: str
) -> Tuple[Optional[str], Optional[str]]:
    """Lấy toàn bộ nội dung text và filename của các chunks cho một doc_id."""
    collection = get_user_milvus_collection(user_id)
    if not collection:
        print(f"Collection for user {user_id} not found.")
        return None, None
    try:
        # Yêu cầu trả về cả filename
        results = collection.query(
            expr=f'doc_id == "{doc_id}"',
            output_fields=[
                "content",
                "page_number",
                "chunk_index",
                "filename",
            ],  # Thêm filename
        )
        if not results:
            return None, None

        # Sắp xếp chunk nếu cần
        results.sort(key=lambda x: (x.get("page_number", 0), x.get("chunk_index", 0)))

        # Lấy filename từ kết quả đầu tiên (giả định filename là nhất quán)
        filename = results[0].get("filename") if results else None

        # Ghép nối nội dung
        full_content = "\n\n".join([res.get("content", "") for res in results])
        return full_content, filename  # Trả về cả hai
    except Exception as e:
        print(
            f"Error retrieving content/filename for doc_id '{doc_id}', user '{user_id}': {e}"
        )
        return None, None


def ask_question(
    user_id: str, question: str, headers: List[str] = []
) -> Dict[str, Any]:
    """Trả lời câu hỏi DỰA TRÊN CÁC DOCUMENT ĐÃ CHỌN của user, trả về cấu trúc dữ liệu cho citation."""

    if not llm:
        return {
            "answer": "Lỗi: LLM chưa được khởi tạo. Vui lòng kiểm tra cấu hình.",
            "citations": {},
        }

    # ===== KIỂM TRA INTENT SUMMARIZATION =====
    if check_summarization_intent(question):
        print(f"Detected summarization intent for query: '{question}'")
        mongo_collection = get_mongo_collection()
        if not mongo_collection:
            return {
                "answer": "Lỗi kết nối cơ sở dữ liệu để kiểm tra tài liệu.",
                "citations": {},
            }

        selected_ids = get_selected_document_ids(user_id, mongo_collection)

        if not selected_ids:
            # Trả về cấu trúc dict
            return {"answer": "Vui lòng chọn một tài liệu để tóm tắt.", "citations": {}}
        elif len(selected_ids) > 1:
            # Trả về cấu trúc dict
            doc_list_str = ", ".join(selected_ids[:3]) + (
                "..." if len(selected_ids) > 3 else ""
            )
            return {
                "answer": f"Bạn đang chọn nhiều tài liệu ({len(selected_ids)}): {doc_list_str}. Vui lòng chỉ chọn một tài liệu hoặc chỉ định tên file bạn muốn tóm tắt.",
                "citations": {},
            }
        else:
            target_doc_id = selected_ids[0]
            print(f"Target document for summarization: {target_doc_id}")

        full_content, target_filename = get_content_and_filename(user_id, target_doc_id)

        if not full_content:
            # Trả về cấu trúc dict
            return {
                "answer": f"Không thể lấy được nội dung của tài liệu ID '{target_doc_id}' để tóm tắt.",
                "citations": {},
            }

        display_name = (
            f"'{target_filename}'" if target_filename else f"ID {target_doc_id}"
        )

        try:
            messages = SUMMARIZATION_PROMPT_TEMPLATE.invoke(
                {"document_content": full_content}
            )
            summary_response = llm.invoke(messages)
            # Trả về cấu trúc dict
            return {
                "answer": f"**Tóm tắt cho tài liệu {display_name}:**\n\n{summary_response.content}",
                "citations": {},
            }
        except Exception as e:
            print(f"Lỗi khi gọi LLM tóm tắt: {e}")
            # Trả về cấu trúc dict
            return {
                "answer": f"Đã xảy ra lỗi trong quá trình tóm tắt tài liệu {display_name}.",
                "citations": {},
            }

    # ===== LUỒNG RAG CHÍNH =====
    else:
        vector_store = get_user_vector_store(user_id)
        # Không cần final_content nếu không dùng headers nữa

        mongo_collection = get_mongo_collection()
        if mongo_collection is None:
            return {
                "answer": "Lỗi kết nối cơ sở dữ liệu để kiểm tra tài liệu.",
                "citations": {},
            }
        selected_ids = get_selected_document_ids(user_id, mongo_collection)

        search_filter_expr = None
        if not selected_ids:
            # Trả về cấu trúc dict
            return {
                "answer": "Vui lòng chọn ít nhất một tài liệu để thực hiện tìm kiếm trong đó.",
                "citations": {},
            }
        else:
            # Format list ID thành chuỗi cho Milvus 'in' operator
            selected_ids_str = ", ".join([f'"{id_}"' for id_ in selected_ids])
            search_filter_expr = (
                f"doc_id in [{selected_ids_str}]"  # Format đúng cho Milvus
            )
            print(f"Thực hiện tìm kiếm với Milvus filter: {search_filter_expr}")

        try:
            # Cấu hình search_kwargs - bỏ search_params nếu không dùng IVF_FLAT hoặc index có params khác
            search_kwargs = {"expr": search_filter_expr}
            # Ví dụ nếu dùng IVF_FLAT:
            k_value = 10  # Số lượng chunk lấy về
            retrieved_docs = vector_store.similarity_search(
                query=question, k=k_value, search_kwargs=search_kwargs
            )
        except Exception as e:
            print(f"Lỗi trong quá trình similarity search: {e}")
            import traceback

            traceback.print_exc()
            # Trả về cấu trúc dict
            return {
                "answer": f"Đã xảy ra lỗi trong quá trình tìm kiếm tài liệu: {e}",
                "citations": {},
            }

        if not retrieved_docs:
            # Trả về cấu trúc dict
            return {
                "answer": "Không tìm thấy thông tin liên quan trong các tài liệu bạn đã chọn.",
                "citations": {},
            }

        # --- Bước 1: Chuẩn bị Context và Lưu Mapping ---
        docs_for_context = retrieved_docs  # Sử dụng các docs đã lấy
        context_parts = []
        source_mapping = {}  # Dict để map index trong context -> thông tin gốc

        print(f"Chuẩn bị context từ {len(docs_for_context)} tài liệu retrieved.")
        for idx, doc in enumerate(docs_for_context, 1):
            metadata = doc.metadata
            filename = metadata.get("filename", "N/A")
            # Đảm bảo page_number là int, xử lý None hoặc string
            page_number_raw = metadata.get("page_number")
            page_number = -1  # Mặc định nếu không hợp lệ
            try:
                if page_number_raw is not None:
                    page_number = int(page_number_raw)
            except (ValueError, TypeError):
                print(
                    f"Cảnh báo: Không thể chuyển đổi page_number '{page_number_raw}' thành số nguyên cho chunk {metadata.get('chunk_id', 'N/A')}."
                )
                pass  # Giữ giá trị mặc định -1

            doc_id = metadata.get("doc_id", "N/A")
            chunk_id = metadata.get("chunk_id", None)  # Lấy chunk_id nếu có
            content = doc.page_content

            if not chunk_id:
                print(
                    f"Cảnh báo: Thiếu 'chunk_id' trong metadata cho doc_id {doc_id}, page {page_number}. Citation có thể không chính xác."
                )

            # Tạo context cho LLM
            context_parts.append(
                f"[DOCUMENT {idx}]\nFile: {filename}\nPage: {page_number}\nContent: {content[:400]}..."  # Tăng nhẹ preview
            )

            # Lưu thông tin chi tiết để map lại sau này
            source_mapping[idx] = {
                "doc_id": doc_id,
                "chunk_id": chunk_id,  # Có thể là None
                "page_number": page_number,
                "filename": filename,
                "content_preview": content[:200]
                + "...",  # Preview ngắn hơn cho frontend
            }

        context_string = "\n\n".join(context_parts)

        # --- Bước 2: Gọi LLM ---
        try:
            print("Đang gọi LLM để tạo câu trả lời...")
            messages = prompt.invoke({"question": question, "context": context_string})
            llm_response = llm.invoke(messages)
            llm_response_content = llm_response.content
            print("LLM đã phản hồi.")
        except Exception as e:
            print(f"Lỗi khi gọi LLM: {e}")
            import traceback

            traceback.print_exc()
            return {"answer": f"Lỗi khi tạo câu trả lời từ LLM: {e}", "citations": {}}

        # --- Bước 3: Phân tích Kết quả LLM và Tạo Cấu trúc Trả về ---
        answer_text = llm_response_content
        references_section = ""
        citations_details = {}  # Format: {"1": {...}, "2": {...}}

        # Tìm vị trí "REFERENCES:" (không phân biệt hoa thường, tìm từ cuối lên để tránh trùng trong text)
        ref_marker = "REFERENCES:"
        ref_pos = llm_response_content.upper().rfind(ref_marker.upper())

        if ref_pos != -1:
            answer_text = llm_response_content[:ref_pos].strip()
            # Lấy phần sau marker, bỏ qua marker và khoảng trắng/newline
            references_section = llm_response_content[
                ref_pos + len(ref_marker) :
            ].strip()
            print(
                f"Đã tách phần REFERENCES:\n{references_section[:200]}..."
            )  # Log phần đầu references

            # Phân tích từng dòng trong REFERENCES:
            # Pattern: Bắt đầu bằng [số], theo sau là bất kỳ ký tự nào
            ref_line_pattern = re.compile(r"^\s*\[(\d+)\]\s*(.*)$")
            parsed_citations = set()  # Tránh xử lý trùng lặp nếu LLM lặp lại số

            for line in references_section.splitlines():
                match = ref_line_pattern.match(line)
                if match:
                    try:
                        citation_number_str = match.group(1)
                        citation_number_int = int(citation_number_str)
                        # reference_content_llm = match.group(2).strip() # Nội dung LLM viết cho reference này (ít dùng)

                        if citation_number_int not in parsed_citations:
                            # Lấy thông tin gốc từ mapping
                            original_source = source_mapping.get(citation_number_int)

                            if original_source:
                                # Lưu vào dict kết quả, key là số citation dạng string
                                citations_details[citation_number_str] = original_source
                                parsed_citations.add(citation_number_int)
                                # print(f"Đã map citation [{citation_number_str}] tới chunk: {original_source.get('chunk_id', 'N/A')}")
                            else:
                                print(
                                    f"Cảnh báo: Không tìm thấy source gốc cho citation số {citation_number_int} trong mapping (có {len(source_mapping)} sources)."
                                )

                    except (ValueError, IndexError) as parse_err:
                        print(
                            f"Lỗi khi phân tích dòng reference: '{line}'. Lỗi: {parse_err}"
                        )
        else:
            # Nếu không tìm thấy "REFERENCES:", toàn bộ là câu trả lời
            print(
                "Cảnh báo: Không tìm thấy phần 'REFERENCES:' trong phản hồi của LLM. Trả về toàn bộ nội dung."
            )
            answer_text = llm_response_content.strip()  # Vẫn trả về answer text

        print(f"Trả về {len(citations_details)} chi tiết citation.")
        # Trả về dictionary hoàn chỉnh
        return {"answer": answer_text, "citations": citations_details}


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


def sanitize_metadata_keys(metadata: dict) -> dict:
    return {re.sub(r"[^a-zA-Z0-9_]", "_", k): v for k, v in metadata.items()}


# ============================================
# Các Hàm Trích Xuất Text Chuyên Biệt
# ============================================


def _extract_text_from_pdf(file_bytes: bytes) -> List[Tuple[int, str]]:
    """Trích xuất text từ file PDF, thử trực tiếp trước, fallback OCR."""
    extracted_pages: List[Tuple[int, str]] = []
    pdf_text_extracted = False
    num_pages = 0

    # 1. Thử trích xuất trực tiếp bằng pypdf
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        num_pages = len(reader.pages)
        print(f"PDF có {num_pages} trang. Thử trích xuất text trực tiếp...")
        page_data_temp = []
        temp_text_check = ""
        for i, page in enumerate(reader.pages):
            page_num = i + 1
            try:
                page_text = page.extract_text() or ""
                page_data_temp.append((page_num, page_text.strip()))
                temp_text_check += page_text
            except Exception as page_extract_err:
                print(
                    f"  - Lỗi trích xuất text trang {page_num}: {page_extract_err}. Xem như trang rỗng."
                )
                page_data_temp.append((page_num, ""))

        # Heuristic quyết định fallback
        if len(temp_text_check.strip()) > max(50, num_pages * 5):
            print("Trích xuất text PDF trực tiếp thành công.")
            extracted_pages = page_data_temp
            pdf_text_extracted = True
        else:
            print("Text PDF trực tiếp không đủ hoặc lỗi. Fallback sang OCR...")

    except Exception as pypdf_err:
        print(f"Lỗi khi đọc PDF bằng pypdf: {pypdf_err}. Fallback sang OCR.")

    # 2. Fallback sang OCR nếu cần
    if not pdf_text_extracted:
        print("Thực hiện OCR trên các trang PDF...")
        try:
            images = convert_from_bytes(file_bytes, dpi=300)
            print(f"Chuyển PDF thành {len(images)} ảnh để OCR.")
            if not images:
                raise ValueError("Không thể chuyển đổi PDF thành ảnh.")
            for i, image in enumerate(images):
                page_num = i + 1
                print(f"  - OCR trang {page_num}/{len(images)}...")
                page_ocr_text = ocr_image(image)
                extracted_pages.append((page_num, page_ocr_text))
                image.close()  # Giải phóng bộ nhớ ảnh
            print("OCR PDF hoàn tất.")
        except Exception as pdf_ocr_err:
            print(f"Lỗi trong quá trình OCR PDF: {pdf_ocr_err}")
            # Nếu cả hai cách đều lỗi, ném lỗi để hàm gọi xử lý
            raise RuntimeError(
                f"Không thể trích xuất text từ PDF: {pdf_ocr_err}"
            ) from pdf_ocr_err

    return extracted_pages


def _extract_text_from_image(file_bytes: bytes) -> List[Tuple[int, str]]:
    """Trích xuất text từ file ảnh bằng OCR."""
    print("Đang xử lý Ảnh...")
    try:
        image = Image.open(io.BytesIO(file_bytes))
        image_text = ocr_image(image)
        image.close()  # Giải phóng bộ nhớ ảnh
        print("OCR ảnh hoàn tất.")
        # Ảnh coi như 1 trang, trả về list chứa 1 tuple
        return [(1, image_text)] if image_text else []
    except Exception as img_err:
        if isinstance(img_err, (IOError, SyntaxError)):
            raise ValueError(
                f"File ảnh không hợp lệ hoặc không được hỗ trợ: {img_err}"
            ) from img_err
        else:
            raise RuntimeError(f"Lỗi khi xử lý ảnh: {img_err}") from img_err


def _extract_text_from_plain(file_bytes: bytes) -> List[Tuple[int, str]]:
    """Trích xuất text từ file plain text."""
    print("Đang xử lý file Text...")
    decoded_text = ""
    try:
        decoded_text = file_bytes.decode("utf-8", errors="replace")
    except UnicodeDecodeError:
        print("Decode UTF-8 thất bại, thử decode bằng latin-1...")
        try:
            decoded_text = file_bytes.decode("latin-1", errors="replace")
        except Exception as decode_err:
            raise ValueError(
                f"Không thể decode file text: {decode_err}"
            ) from decode_err
    except Exception as txt_err:
        raise ValueError(f"Lỗi khi xử lý file text: {txt_err}") from txt_err

    cleaned_text = clean_text(decoded_text)
    if cleaned_text:
        print(f"Trích xuất thành công {len(cleaned_text)} ký tự từ file text.")
        return [(1, cleaned_text)]  # Coi là 1 trang
    else:
        print("Cảnh báo: File text rỗng hoặc không có nội dung sau khi làm sạch.")
        return []


def _extract_text_from_markdown(file_bytes: bytes) -> List[Tuple[int, str]]:
    """Trích xuất text từ file Markdown."""
    print("Processing Markdown file...")
    decoded_text = ""
    try:
        decoded_text = file_bytes.decode("utf-8", errors="replace")
    except UnicodeDecodeError:
        print("Decode UTF-8 thất bại cho Markdown, thử latin-1...")
        try:
            decoded_text = file_bytes.decode("latin-1", errors="replace")
        except Exception as decode_err:
            raise ValueError(
                f"Không thể decode file Markdown: {decode_err}"
            ) from decode_err
    except Exception as md_err:
        raise ValueError(f"Lỗi khi xử lý file Markdown: {md_err}") from md_err

    cleaned_md_text = decoded_text.strip()
    if cleaned_md_text:
        print(f"Trích xuất thành công {len(cleaned_md_text)} ký tự từ file Markdown.")
        return [(1, cleaned_md_text)]  # Coi là 1 trang
    else:
        print("Cảnh báo: File Markdown rỗng.")
        return []


# --- Hàm Dispatcher để chọn phương thức trích xuất ---
def _extract_text(
    file_bytes: bytes, content_type: Optional[str], filename: str
) -> List[Tuple[int, str]]:
    """Chọn và gọi hàm trích xuất text phù hợp dựa trên content_type hoặc filename."""
    if content_type == "application/pdf":
        return _extract_text_from_pdf(file_bytes)
    elif content_type and content_type.startswith("image/"):
        return _extract_text_from_image(file_bytes)
    elif content_type == "text/plain":
        return _extract_text_from_plain(file_bytes)
    elif content_type in ["text/markdown", "text/x-markdown"] or (
        filename and filename.lower().endswith((".md", ".markdown"))
    ):
        return _extract_text_from_markdown(file_bytes)
    else:
        # Cố gắng đoán dựa trên đuôi file nếu không có content_type
        if filename:
            if filename.lower().endswith(".pdf"):
                print(
                    f"Warning: Content-Type không xác định, đoán là PDF dựa trên tên file '{filename}'."
                )
                return _extract_text_from_pdf(file_bytes)
            elif filename.lower().endswith((".txt", ".text")):
                print(
                    f"Warning: Content-Type không xác định, đoán là text dựa trên tên file '{filename}'."
                )
                return _extract_text_from_plain(file_bytes)
            elif filename.lower().endswith((".md", ".markdown")):
                print(
                    f"Warning: Content-Type không xác định, đoán là markdown dựa trên tên file '{filename}'."
                )
                return _extract_text_from_markdown(file_bytes)
            elif filename.lower().endswith(
                (".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".gif")
            ):
                print(
                    f"Warning: Content-Type không xác định, đoán là image dựa trên tên file '{filename}'."
                )
                return _extract_text_from_image(file_bytes)

        raise ValueError(
            f"Loại file không được hỗ trợ hoặc không xác định: {content_type}, filename: {filename}"
        )


# ============================================
# Các Hàm Xử Lý Document và Chunking
# ============================================


def _create_langchain_documents(
    extracted_pages: List[Tuple[int, str]], metadata_base: Dict[str, Any]
) -> List[Document]:
    """Tạo danh sách Langchain Document từ text đã trích xuất."""
    docs: List[Document] = []
    total_pages_processed = len(extracted_pages)
    if not total_pages_processed:
        return docs

    for page_num, page_text in extracted_pages:
        if page_text and page_text.strip():
            # Copy metadata base và thêm thông tin trang
            metadata = metadata_base.copy()
            metadata["page_number"] = int(page_num)
            metadata["total_pages"] = int(
                total_pages_processed
            )  # Thêm total_pages vào đây
            docs.append(Document(page_content=page_text, metadata=metadata))
    return docs


def _chunk_documents(
    docs: List[Document], chunk_size: int = 2500, chunk_overlap: int = 500
) -> List[Document]:
    """Chia các Document thành các chunk nhỏ hơn và thêm metadata chunk."""
    if not docs:
        return []

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        is_separator_regex=False,
    )

    try:
        chunks = text_splitter.split_documents(docs)
    except Exception as chunk_err:
        print(f"Lỗi nghiêm trọng khi chunking: {chunk_err}")
        traceback.print_exc()
        # Ném lỗi để hàm gọi xử lý hoặc trả về list rỗng tùy logic
        raise RuntimeError(f"Lỗi khi chunking tài liệu: {chunk_err}") from chunk_err

    final_chunks = []
    doc_id = docs[0].metadata.get("doc_id", "unknown_doc")  # Lấy doc_id từ doc đầu tiên

    for i, chunk in enumerate(chunks):
        try:
            # Kế thừa và bổ sung metadata
            # Đảm bảo metadata từ trang gốc được giữ lại và thêm chunk_id/index
            chunk.metadata["chunk_id"] = f"{doc_id}_chunk_{i}"
            chunk.metadata["chunk_index"] = i

            # Chuyển đổi/đảm bảo kiểu dữ liệu cho metadata
            chunk.metadata["page_number"] = int(chunk.metadata.get("page_number", -1))
            chunk.metadata["total_pages"] = int(chunk.metadata.get("total_pages", -1))
            chunk.metadata["chunk_index"] = int(chunk.metadata.get("chunk_index", -1))
            chunk.metadata["doc_id"] = str(chunk.metadata.get("doc_id", ""))
            chunk.metadata["user_id"] = str(chunk.metadata.get("user_id", ""))
            chunk.metadata["filename"] = str(chunk.metadata.get("filename", ""))
            chunk.metadata["chunk_id"] = str(chunk.metadata.get("chunk_id", ""))

            final_chunks.append(chunk)
        except Exception as meta_err:
            print(f"Lỗi khi xử lý metadata cho chunk {i} của doc {doc_id}: {meta_err}")
            # Có thể bỏ qua chunk lỗi hoặc xử lý khác

    return final_chunks


# ============================================
# Hàm Lưu Trữ và Embedding
# ============================================


async def _embed_and_store_chunks(
    user_id: str, chunks: List[Document], batch_size: int = 32
) -> int:
    """Embed và lưu các chunk vào Milvus theo batch."""
    if not chunks:
        return 0

    vector_store = get_user_vector_store(user_id)  # Lấy vector store của user
    num_added = 0
    filename = chunks[0].metadata.get("filename", "N/A")  # Lấy filename để log

    try:
        # Sử dụng vòng lặp và tqdm như cũ
        # Cân nhắc chạy vector_store.add_documents trong asyncio.to_thread nếu nó blocking
        # Tuy nhiên, Langchain Zilliz có thể đã xử lý non-blocking bên trong
        # Tạm thời gọi trực tiếp, nếu thấy hiệu năng kém thì bọc trong thread
        print(
            f"Bắt đầu embedding {len(chunks)} chunks cho {filename} (User: {user_id})..."
        )
        for i in tqdm(
            range(0, len(chunks), batch_size),
            desc=f"Embedding chunks cho {filename} (User: {user_id})",
            unit="batch",
        ):
            batch = chunks[i : i + batch_size]
            try:
                # await asyncio.to_thread(vector_store.add_documents, batch) # Nếu add_documents là blocking
                vector_store.add_documents(batch)  # Thử gọi trực tiếp trước
                num_added += len(batch)
            except Exception as add_doc_err:
                print(
                    f"\nLỗi khi thêm batch {i//batch_size+1} vào Milvus: {add_doc_err}"
                )
                traceback.print_exc()
                # Có thể chọn dừng lại hoặc tiếp tục với batch khác
                # Hiện tại ném lỗi ra ngoài để hàm gọi xử lý
                raise RuntimeError(
                    f"Lỗi khi thêm batch vào Milvus: {add_doc_err}"
                ) from add_doc_err

        print(f"\nThêm thành công {num_added} embeddings.")
        return num_added

    except Exception as e:
        print(f"\nLỗi nghiêm trọng trong quá trình embedding/lưu trữ: {e}")
        traceback.print_exc()
        raise RuntimeError(f"Không thể embed/lưu chunks: {e}") from e


# ============================================
# Hàm Cập Nhật Trạng Thái (Ví dụ)
# ============================================


def _update_processing_status(
    mongo_coll: Optional[MongoCollection],
    user_id: str,
    doc_id: str,
    status: str,
    error_message: Optional[str] = None,
):
    """(Đồng bộ) Cập nhật trạng thái xử lý vào MongoDB."""
    if mongo_coll is None:
        print("Không thể cập nhật trạng thái: MongoDB collection không hợp lệ.")
        return

    update_data = {"$set": {"processing_status": status, "last_updated": time.time()}}
    if error_message:
        update_data["$set"]["error_message"] = error_message
    else:
        # Xóa thông báo lỗi cũ nếu xử lý thành công
        update_data["$unset"] = {"error_message": ""}

    try:
        result = mongo_coll.update_one(
            {"user_id": user_id, "document_id": doc_id},
            update_data,
            upsert=True,  # Tạo mới nếu chưa có document status
        )
        # print(f"Cập nhật trạng thái MongoDB cho doc '{doc_id}': Status='{status}', Matched={result.matched_count}, Modified={result.modified_count}, UpsertedId={result.upserted_id}")
    except Exception as e:
        print(f"Lỗi khi cập nhật trạng thái MongoDB cho doc '{doc_id}': {e}")


# ============================================
# Hàm Chính Điều Phối (Đã Refactor)
# ============================================


async def process_and_store_file(
    user_id: str,
    file_bytes: bytes,
    filename: str,
    doc_id: str,
    content_type: Optional[str],
) -> int:
    """
    (Điều phối) Xử lý file, trích xuất text, chunk, embed và lưu vào Milvus.
    Trả về số lượng chunk đã thêm.
    """
    start_time = time.time()
    print(
        f"[{doc_id}] Bắt đầu xử lý file: {filename} (Type: {content_type}) cho user: {user_id}"
    )
    num_added = 0
    mongo_coll = get_mongo_collection()  # Lấy collection MongoDB một lần

    # --- 1. Kiểm tra tồn tại ---
    try:
        # Chạy kiểm tra đồng bộ trong thread để không block event loop nếu nó có I/O
        existing_milvus_count = await asyncio.to_thread(
            get_embedding_count_for_doc_id, user_id, doc_id
        )
        if existing_milvus_count > 0:
            print(
                f"[{doc_id}] Cảnh báo: Đã tồn tại {existing_milvus_count} embeddings. Bỏ qua xử lý."
            )
            # Cập nhật trạng thái là đã tồn tại (tùy chọn)
            await asyncio.to_thread(
                _update_processing_status, mongo_coll, user_id, doc_id, "skipped_exists"
            )
            return 0
    except Exception as check_err:
        print(f"[{doc_id}] Lỗi khi kiểm tra embedding tồn tại: {check_err}")
        # Có thể dừng hoặc tiếp tục tùy logic
        # Tạm thời bỏ qua và tiếp tục xử lý

    try:
        # --- 2. Trích xuất Text ---
        print(f"[{doc_id}] Bước 1: Trích xuất text...")
        # Chạy hàm trích xuất (có thể CPU/IO bound) trong thread
        extracted_pages = await asyncio.to_thread(
            _extract_text, file_bytes, content_type, filename
        )

        # --- 3. Kiểm tra kết quả trích xuất ---
        if not extracted_pages or all(not text.strip() for _, text in extracted_pages):
            print(f"[{doc_id}] Cảnh báo: Không trích xuất được nội dung văn bản.")
            await asyncio.to_thread(
                _update_processing_status,
                mongo_coll,
                user_id,
                doc_id,
                "no_text_extracted",
            )
            return 0
        print(
            f"[{doc_id}] Trích xuất thành công text từ {len(extracted_pages)} trang/phần."
        )

        # --- 4. Tạo Langchain Documents ---
        print(f"[{doc_id}] Bước 2: Tạo Langchain Documents...")

        metadata_base = {"doc_id": doc_id, "user_id": user_id, "filename": filename}
        docs = _create_langchain_documents(extracted_pages, metadata_base)
        if not docs:
            print(f"[{doc_id}] Cảnh báo: Không tạo được Document object nào.")
            await asyncio.to_thread(  # Cập nhật trạng thái
                _update_processing_status,
                mongo_coll,
                user_id,
                doc_id,
                "processing_failed",
                "Không tạo được document object",
            )
            return 0
        print(f"[{doc_id}] Đã tạo {len(docs)} Document objects.")

        # --- 5. Chunk Documents ---
        print(f"[{doc_id}] Bước 3: Chunking Documents...")

        chunk_size = 2500  # Lấy từ config nếu cần
        chunk_overlap = 500  # Lấy từ config nếu cần
        final_chunks = await asyncio.to_thread(
            _chunk_documents, docs, chunk_size, chunk_overlap
        )

        if not final_chunks:
            print(f"[{doc_id}] Cảnh báo: Không có chunk hợp lệ nào được tạo.")
            await asyncio.to_thread(
                _update_processing_status,
                mongo_coll,
                user_id,
                doc_id,
                "chunking_failed",
                "Không tạo được chunk hợp lệ",
            )
            return 0
        print(f"[{doc_id}] Đã chia thành {len(final_chunks)} chunks.")

        # --- 6. Embedding và Lưu trữ ---
        print(f"[{doc_id}] Bước 4: Embedding và Lưu trữ...")
        # Hàm này đã là async hoặc cần chạy trong thread nếu blocking
        num_added = await _embed_and_store_chunks(user_id, final_chunks)

        # --- 7. Tạo/Cập nhật Index ---
        if num_added > 0:
            print(f"[{doc_id}] Bước 5: Kiểm tra/Tạo Index...")
            try:
                nlist_for_index = 1024  # Lấy từ config nếu cần
                # Index creation là blocking IO, chạy trong thread
                await asyncio.to_thread(create_ivf_flat_index, user_id, nlist_for_index)
                print(f"[{doc_id}] Hoàn tất kiểm tra/tạo index.")
            except Exception as index_err:
                # Ghi log lỗi nhưng không dừng quy trình vì đã lưu thành công
                print(f"[{doc_id}] LỖI trong quá trình kiểm tra/tạo index: {index_err}")
                traceback.print_exc()
        else:
            print(
                f"[{doc_id}] Không có chunk nào được thêm, bỏ qua bước tạo/cập nhật index."
            )

        # --- 8. Cập nhật trạng thái thành công ---
        await asyncio.to_thread(
            _update_processing_status,
            mongo_coll,
            user_id,
            doc_id,
            "processed_successfully",
        )
        print(
            f"[{doc_id}] Hoàn tất xử lý file {filename} thành công sau {time.time() - start_time:.2f} giây. Đã thêm {num_added} chunks."
        )
        return num_added

    # --- Xử lý lỗi tổng quát ---
    except (ValueError, RuntimeError, Exception) as processing_err:
        error_msg = str(processing_err)
        print(
            f"[{doc_id}] LỖI NGHIÊM TRỌNG trong quá trình xử lý file {filename}: {error_msg}"
        )
        traceback.print_exc()
        # Cập nhật trạng thái lỗi vào MongoDB (chạy trong thread)
        await asyncio.to_thread(
            _update_processing_status,
            mongo_coll,
            user_id,
            doc_id,
            "processing_failed",
            error_msg,
        )
        return 0  # Trả về 0 chunk khi có lỗi


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
                "doc_id": doc_id,
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

    if not all_chunks_content or not all_embeddings_vectors:
        raise ValueError("Không tìm thấy nội dung/embedding hợp lệ.")

    actual_num_clusters = min(num_clusters, len(all_chunks_content))

    kmeans_model = KMeans(n_clusters=actual_num_clusters, random_state=42, n_init=10)
    kmeans_predictions = kmeans_model.fit_predict(all_embeddings_vectors)

    combined_chunks = combine_chunks(all_chunks_content, kmeans_predictions)
    result = "# root\n"
    for i in range(actual_num_clusters):
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
        else:
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
        else:
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
