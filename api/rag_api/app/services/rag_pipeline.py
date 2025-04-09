# -*- coding: utf-8 -*-
# File: app/services/rag_pipeline.py
import os
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_milvus import Zilliz
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI
from langchain import hub
from langchain_community.document_loaders import PyPDFLoader
from pymilvus import connections, Collection, utility  # Thêm utility
import tempfile
import time
from tqdm import tqdm
from langchain_core.prompts import ChatPromptTemplate
from sklearn.cluster import KMeans
from typing import Tuple, List, Dict, Any, Optional  # Thêm Dict, Any, Optional
import re

load_dotenv()

# Load env vars
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ZILLIZ_CLOUD_URI = os.getenv("ZILLIZ_CLOUD_URI")
ZILLIZ_CLOUD_TOKEN = os.getenv("ZILLIZ_CLOUD_TOKEN")

# Set up embedding
embeddings = HuggingFaceEmbeddings(
    model_name="BAAI/bge-m3",
    model_kwargs={"device": "cpu"},
    encode_kwargs={"normalize_embeddings": True, "batch_size": 32},
)
# First connect to Zilliz (needed for collection management)
connections.connect(alias="default", uri=ZILLIZ_CLOUD_URI, token=ZILLIZ_CLOUD_TOKEN)

# Define collection name
COLLECTION_NAME = "rag_collection"

# # Initialize Zilliz vector store (LangChain wrapper)
# vector_store = Zilliz(
#     embedding_function=embeddings,
#     connection_args={"uri": ZILLIZ_CLOUD_URI, "token": ZILLIZ_CLOUD_TOKEN},
#     collection_name=COLLECTION_NAME,
#     auto_id=True,
#     vector_field="embedding",  # Name of your vector field
#     text_field="content",  # Name of your text field
# )

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


# --- THÊM HÀM HELPER ---
def get_user_collection_name(user_id: str) -> str:
    """Tạo tên collection chuẩn hóa cho user."""
    # Đảm bảo tên collection hợp lệ (loại bỏ ký tự đặc biệt nếu cần)
    safe_user_id = re.sub(r"[^a-zA-Z0-9_]", "_", user_id)
    return f"user_{safe_user_id}_rag"


def get_user_vector_store(user_id: str) -> Zilliz:
    """Lấy (hoặc tạo nếu chưa có) vector store cho user cụ thể."""
    collection_name = get_user_collection_name(user_id)
    # print(f"Accessing vector store for user: {user_id}, collection: {collection_name}") # Debug
    # Zilliz wrapper thường tự tạo collection nếu chưa có khi dùng lần đầu
    # Tuy nhiên, bạn có thể kiểm tra và tạo rõ ràng nếu muốn kiểm soát schema chặt chẽ hơn
    # if not utility.has_collection(collection_name):
    #     print(f"Collection {collection_name} not found, it will be created.")
    # Define schema if needed before initializing Zilliz
    # ... (code tạo schema) ...

    vector_store_instance = Zilliz(
        embedding_function=embeddings,
        connection_args={"uri": ZILLIZ_CLOUD_URI, "token": ZILLIZ_CLOUD_TOKEN},
        collection_name=collection_name,
        auto_id=True,
        vector_field="embedding",
        text_field="content",
    )
    return vector_store_instance


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


# --- SỬA ĐỔI CÁC HÀM SERVICE ---


# Ví dụ sửa đổi hàm ask_question
def ask_question(user_id: str, question: str) -> str:
    """Trả lời câu hỏi dựa trên collection của user."""
    vector_store = get_user_vector_store(user_id)
    retrieved_docs = vector_store.similarity_search(
        question, k=8, params={"metric_type": "IP", "params": {"nprobe": 64}}
    )
    # ... (phần còn lại của hàm giữ nguyên logic format, gọi LLM) ...
    citations = format_citations(retrieved_docs)
    context_parts = []
    for idx, doc in enumerate(retrieved_docs, 1):
        context_parts.append(
            f"[DOCUMENT {idx}]\nFile: {doc.metadata.get('filename')}\nPage: {doc.metadata.get('page_number')}\nContent: {doc.page_content[:300]}..."
        )
    messages = prompt.invoke(
        {"question": question, "context": "\n\n".join(context_parts)}
    )
    response = llm.invoke(messages)
    final_response = validate_citations(response.content, citations)
    return final_response


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


def sanitize_metadata_keys(metadata: dict) -> dict:
    return {re.sub(r"[^a-zA-Z0-9_]", "_", k): v for k, v in metadata.items()}


# Ví dụ sửa đổi hàm process_and_store_pdf
def process_and_store_pdf(
    user_id: str, file_bytes: bytes, filename: str, doc_id: str
) -> int:
    """Xử lý PDF và lưu vào collection của user."""
    # Kiểm tra sự tồn tại dựa trên collection của user
    existing_count = get_embedding_count_for_doc_id(user_id, doc_id)
    if existing_count > 0:
        print(
            f"Warning: Document with doc_id '{doc_id}' already exists in collection for user '{user_id}'. Skipping."
        )
        return 0

    vector_store = get_user_vector_store(user_id)  # Lấy vector store cho user này

    # ... (phần xử lý file, chunking giữ nguyên) ...
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
        tmp_file.write(file_bytes)
        tmp_path = tmp_file.name
    # ... (try/except/finally block giữ nguyên) ...
    try:
        # ... (load pdf, split chunks) ...
        loader = PyPDFLoader(tmp_path)
        docs = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, chunk_overlap=200
        )
        chunks = text_splitter.split_documents(docs)
        # ... (prepare metadata - có thể thêm user_id vào metadata nếu muốn) ...
        prepared_chunks = []
        for i, chunk in enumerate(chunks):
            cleaned_metadata = {
                "doc_id": doc_id,
                # "user_id": user_id, # Option: Lưu cả user_id vào metadata
                "chunk_id": f"{doc_id}_{i}",
                "chunk_index": i,
                "filename": filename,
                "page_number": chunk.metadata.get("page", -1) + 1,
                # "total_pages": total_pages, # Cần lấy total_pages trước đó
            }
            prepared_chunks.append(
                Document(page_content=chunk.page_content, metadata=cleaned_metadata)
            )

        # Lưu vào vector store của user
        batch_size = 16
        for i in tqdm(
            range(0, len(prepared_chunks), batch_size),
            desc=f"Embedding chunks for {filename} (User: {user_id})",
        ):
            batch = prepared_chunks[i : i + batch_size]
            vector_store.add_documents(batch)  # Sử dụng instance vector_store của user

        print(
            f"Successfully added {len(prepared_chunks)} embeddings for doc_id '{doc_id}' for user '{user_id}'."
        )
        return len(prepared_chunks)
    # ... (phần except, finally giữ nguyên) ...
    except Exception as e:
        print(
            f"Error processing PDF {filename} for user {user_id}, doc_id {doc_id}: {e}"
        )
        raise e
    finally:
        if "tmp_path" in locals() and os.path.exists(tmp_path):
            os.unlink(tmp_path)


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
                    {  "role": "system",
                        "content": "You are a helpful assistant that reformats to markdown text for better readability with \n"
                        "# for header 1, \n ## for header 2, \n ### header 3 and the doc. \n the header must appear in order # -> ## -> ###",
                    },
                    {"role": "user", "content": cluster_content},
                ]
            )
            text = completion.content
            header_text = extract_all_headers(text)
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
            # Potentially add indentation based on header level for visual structure if needed
            # level = stripped_line.count('#', 0, 3) # Count '#' at the beginning
            # indentation = "  " * (level - 1) if level > 0 else ""
            # header_text += indentation + stripped_line + "\n"
            header_text += '#' + stripped_line + "\n"  # Keep it simple for now
    return header_text


# (Optional) Function to write content to a file, ensure correct encoding
def write_to_file(file_path: str, content: str):
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Successfully wrote content to {file_path}")
    except Exception as e:
        print(f"Error writing to file {file_path}: {e}")
