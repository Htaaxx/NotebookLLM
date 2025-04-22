# File: app/services/rag_logic/processing/indexing.py
import time
import traceback
from typing import List, Dict, Tuple, Any, Optional
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pymilvus import Collection as MilvusCollection, utility, Index as MilvusIndex
from tqdm import tqdm
import asyncio

# Import từ các module khác trong services
from ..core import config  # <<< THAY ĐỔI IMPORT
from ..core.connections import (
    get_user_vector_store,
    get_user_milvus_collection,
)

# ============================================
# Các Hàm Xử Lý Document và Chunking
# ============================================


def create_langchain_documents(
    extracted_pages: List[Tuple[int, str]], metadata_base: Dict[str, Any]
) -> List[Document]:
    """Tạo danh sách Langchain Document từ text đã trích xuất."""
    # ... (code hàm như trước) ...
    docs: List[Document] = []
    total_pages_processed = len(extracted_pages)
    if not total_pages_processed:
        return docs
    doc_id = metadata_base.get("doc_id", "unknown_doc")
    print(f"    [{doc_id}] Tạo Langchain documents từ {total_pages_processed} trang...")
    for page_num, page_text in extracted_pages:
        if page_text and page_text.strip():
            metadata = metadata_base.copy()
            metadata["page_number"] = int(page_num)
            metadata["total_pages"] = int(total_pages_processed)
            docs.append(Document(page_content=page_text, metadata=metadata))
    print(f"    [{doc_id}] Đã tạo {len(docs)} Document objects.")
    return docs


def chunk_documents(docs: List[Document]) -> List[Document]:
    """Chia các Document thành các chunk nhỏ hơn và thêm metadata chunk."""
    # ... (code hàm như trước) ...
    if not docs:
        return []
    doc_id = docs[0].metadata.get("doc_id", "unknown_doc")
    print(f"    [{doc_id}] Bắt đầu chunking {len(docs)} documents...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=config.CHUNK_SIZE,
        chunk_overlap=config.CHUNK_OVERLAP,
        length_function=len,
        is_separator_regex=False,
    )
    try:
        chunks = text_splitter.split_documents(docs)
        print(f"    [{doc_id}] Đã chia thành {len(chunks)} chunks ban đầu.")
    except Exception as chunk_err:
        print(f"    [{doc_id}] Lỗi nghiêm trọng khi chunking: {chunk_err}")
        traceback.print_exc()
        raise RuntimeError(f"Lỗi khi chunking: {chunk_err}") from chunk_err
    final_chunks = []
    for i, chunk in enumerate(chunks):
        try:
            original_metadata = chunk.metadata.copy()
            chunk_metadata = {
                "doc_id": str(original_metadata.get("doc_id", "")),
                "user_id": str(original_metadata.get("user_id", "")),
                "filename": str(original_metadata.get("filename", "")),
                "page_number": int(original_metadata.get("page_number", -1)),
                "total_pages": int(original_metadata.get("total_pages", -1)),
                "chunk_id": f"{original_metadata.get('doc_id', 'unknown_doc')}_chunk_{i}",
                "chunk_index": i,
            }
            chunk.metadata = chunk_metadata
            final_chunks.append(chunk)
        except Exception as meta_err:
            print(f"    [{doc_id}] Lỗi xử lý metadata chunk {i}: {meta_err}")
    print(f"    [{doc_id}] Hoàn thành chunking, có {len(final_chunks)} chunks hợp lệ.")
    return final_chunks


# ============================================
# Hàm Lưu Trữ và Embedding
# ============================================


async def embed_and_store_chunks(user_id: str, chunks: List[Document]) -> int:
    """Embed và lưu các chunk vào Milvus theo batch."""
    # ... (code hàm như trước, sử dụng config.MILVUS_STORAGE_BATCH_SIZE) ...
    if not chunks:
        doc_id_log = "unknown"
        print(f"    [{doc_id_log}] Không có chunks để embed.")
        return 0
    else:
        doc_id_log = chunks[0].metadata.get("doc_id", "unknown")
    vector_store = get_user_vector_store(user_id)
    if vector_store is None:
        raise RuntimeError(f"Không thể lấy vector store cho user {user_id}.")
    num_added = 0
    filename = chunks[0].metadata.get("filename", "N/A")
    batch_size = config.MILVUS_STORAGE_BATCH_SIZE
    try:
        print(
            f"    [{doc_id_log}] Bắt đầu embedding {len(chunks)} chunks cho {filename} (User: {user_id})..."
        )
        total_batches = (len(chunks) + batch_size - 1) // batch_size
        current_batch = 0
        for i in range(0, len(chunks), batch_size):
            current_batch += 1
            batch = chunks[i : i + batch_size]
            print(
                f"      - Processing batch {current_batch}/{total_batches} ({len(batch)} chunks)"
            )
            try:
                await asyncio.to_thread(vector_store.add_documents, batch)
                num_added += len(batch)
            except Exception as add_doc_err:
                print(f"      Lỗi khi thêm batch {current_batch}: {add_doc_err}")
                traceback.print_exc()
                raise RuntimeError(
                    f"Lỗi thêm batch vào Milvus: {add_doc_err}"
                ) from add_doc_err
        print(f"    [{doc_id_log}] Thêm thành công {num_added} embeddings.")
        return num_added
    except Exception as e:
        print(f"    [{doc_id_log}] Lỗi nghiêm trọng embedding/lưu trữ: {e}")
        traceback.print_exc()
        raise RuntimeError(f"Không thể embed/lưu chunks: {e}") from e


# ============================================
# Hàm Quản lý Index và Embeddings
# ============================================


def create_ivf_flat_index(user_id: str):
    """(Đồng bộ) Tạo index IVF_FLAT nếu chưa có trên collection của user."""
    # ... (code hàm như trước, sử dụng config.*) ...
    collection = get_user_milvus_collection(user_id)
    if collection is None:
        return
    collection_name = collection.name
    vector_field_name = config.MILVUS_VECTOR_FIELD
    nlist_value = config.NLIST_VALUE
    try:
        if collection.has_index():
            vector_index_exists = any(
                idx.field_name == vector_field_name for idx in collection.indexes
            )
            if vector_index_exists:
                return
        print(
            f"    [{collection_name}] Creating IVF_FLAT index with nlist={nlist_value}"
        )
        ivf_flat_index_params = {
            "metric_type": config.MILVUS_METRIC_TYPE,
            "index_type": config.MILVUS_INDEX_TYPE,
            "params": {"nlist": nlist_value},
        }
        collection.create_index(
            field_name=vector_field_name, index_params=ivf_flat_index_params
        )
        collection.flush()
        print(f"    [{collection_name}] Successfully created IVF_FLAT index.")
        print(f"    [{collection_name}] Loading collection...")
        collection.load()
        print(f"    [{collection_name}] Collection loaded.")
    except Exception as e:
        print(f"    [{collection_name}] Error creating/loading IVF_FLAT index: {e}")
        traceback.print_exc()


def delete_embeddings(
    user_id: str,
    filter_dict: Optional[Dict[str, Any]] = None,
    document_id: Optional[str] = None,
) -> int:
    """(Đồng bộ) Xóa embeddings từ collection của user."""
    # ... (code hàm như trước) ...
    collection = get_user_milvus_collection(user_id)
    if collection is None:
        return 0
    collection_name = collection.name
    filter_expression = ""
    if document_id is not None:
        filter_expression = f'doc_id == "{document_id}"'
    elif filter_dict is not None and filter_dict:
        filter_parts = [
            f'{k} == "{v}"' if isinstance(v, str) else f"{k} == {v}"
            for k, v in filter_dict.items()
        ]
        filter_expression = " and ".join(filter_parts)
    else:
        filter_expression = "id >= 0"
    if not filter_expression:
        print(f"[{collection_name}] No valid delete condition.")
        return 0
    print(f"[{collection_name}] Attempting delete with filter: {filter_expression}")
    try:
        res = collection.delete(expr=filter_expression)
        deleted_count = getattr(res, "delete_count", 0)
        print(f"[{collection_name}] Successfully deleted {deleted_count} embeddings.")
        return deleted_count
    except Exception as e:
        print(f"[{collection_name}] Error deleting embeddings: {e}")
        traceback.print_exc()
        return 0


def get_embedding_count_for_doc_id(user_id: str, doc_id: str) -> int:
    """(Đồng bộ) Đếm số embedding cho doc_id trong collection của user."""
    # ... (code hàm như trước) ...
    collection = get_user_milvus_collection(user_id)
    if collection is None:
        return 0
    collection_name = collection.name
    try:
        filter_expression = f'doc_id == "{doc_id}"'
        count = collection.query(expr=filter_expression, output_fields=["count(*)"])[0][
            "count(*)"
        ]
        return count
    except Exception as e:
        print(
            f"[{collection_name}] Error counting embeddings for doc_id '{doc_id}': {e}"
        )
        return 0


def get_document_embeddings(user_id: str, doc_id: str) -> Dict[str, Any]:
    """(Đồng bộ) Lấy embeddings và metadata cho doc_id từ collection của user."""
    # ... (code hàm như trước) ...
    collection = get_user_milvus_collection(user_id)
    doc_result = {"doc_id": doc_id, "total_chunks": 0, "embeddings": []}
    if collection is None:
        print(f"Collection for user {user_id} not found.")
        return doc_result
    collection_name = collection.name
    try:
        collection.load()
        output_fields = ["embedding", "chunk_id", "page_number", "content", "filename"]
        results = collection.query(
            expr=f'doc_id == "{doc_id}"', output_fields=output_fields
        )
        total_chunks = len(results)
        doc_result["total_chunks"] = total_chunks
        if total_chunks > 0:
            formatted_embeddings = []
            for result in results:
                formatted_embeddings.append(
                    {
                        "chunk_id": result.get("chunk_id", "N/A"),
                        "embedding": [],
                        "page_number": result.get("page_number", -1),
                        "content": result.get("content", ""),
                        "filename": result.get("filename", "N/A"),
                    }
                )  # Bỏ embedding khỏi response
            doc_result["embeddings"] = formatted_embeddings
        return doc_result
    except Exception as e:
        print(
            f"[{collection_name}] Error retrieving embeddings for doc_id '{doc_id}': {e}"
        )
        traceback.print_exc()
        return doc_result
