import time
import traceback
import asyncio
from typing import Optional, List, Dict, Any


# Sửa các import sau:
from .rag_logic.core.connections import get_mongo_collection  # <<< Sửa đường dẫn
from .rag_logic.processing.indexing import (  # <<< Sửa đường dẫn
    get_embedding_count_for_doc_id,
    create_langchain_documents,
    chunk_documents,
    embed_and_store_chunks,
    create_ivf_flat_index,
)
from .rag_logic.processing.text_processing import extract_text  # <<< Sửa đường dẫn
from .rag_logic.processing.status_tracking import (
    update_processing_status,
)  # <<< Sửa đường dẫn


# ============================================
# Hàm Chính Điều Phối
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
    log_prefix = f"[{user_id}][{doc_id}]"  # Tiền tố log thống nhất
    print(f"{log_prefix} Bắt đầu xử lý file: {filename} (Type: {content_type})")
    num_added = 0

    # --- 1. Kiểm tra tồn tại ---
    try:
        # Chạy kiểm tra đồng bộ trong thread
        existing_milvus_count = await asyncio.to_thread(
            get_embedding_count_for_doc_id, user_id, doc_id
        )
        if existing_milvus_count > 0:
            print(
                f"{log_prefix} Cảnh báo: Đã tồn tại {existing_milvus_count} embeddings. Bỏ qua."
            )
            # Không cần cập nhật status ở đây, hoặc có thể thêm status 'already_exists'
            return 0
    except Exception as check_err:
        print(f"{log_prefix} Lỗi khi kiểm tra embedding tồn tại: {check_err}")
        # Báo lỗi và dừng lại
        await asyncio.to_thread(
            update_processing_status,
            user_id,
            doc_id,
            "processing_failed",
            f"Lỗi kiểm tra tồn tại: {check_err}",
        )
        return 0

    try:
        # Cập nhật trạng thái bắt đầu xử lý
        await asyncio.to_thread(
            update_processing_status, user_id, doc_id, "processing_started"
        )

        # --- 2. Trích xuất Text ---
        print(f"{log_prefix} Bước 1: Trích xuất text...")
        extracted_pages = await asyncio.to_thread(
            extract_text, file_bytes, content_type, filename
        )

        # --- 3. Kiểm tra kết quả trích xuất ---
        if not extracted_pages or all(not text.strip() for _, text in extracted_pages):
            print(f"{log_prefix} Cảnh báo: Không trích xuất được nội dung văn bản.")
            await asyncio.to_thread(
                update_processing_status, user_id, doc_id, "no_text_extracted"
            )
            return 0
        print(
            f"{log_prefix} Trích xuất thành công text từ {len(extracted_pages)} trang/phần."
        )

        # --- 4. Tạo Langchain Documents ---
        print(f"{log_prefix} Bước 2: Tạo Langchain Documents...")
        metadata_base = {"doc_id": doc_id, "user_id": user_id, "filename": filename}
        # Hàm này thường nhanh, có thể chạy trực tiếp hoặc trong thread tùy độ phức tạp
        docs = await asyncio.to_thread(
            create_langchain_documents, extracted_pages, metadata_base
        )
        if not docs:
            print(f"{log_prefix} Cảnh báo: Không tạo được Document object nào.")
            await asyncio.to_thread(
                update_processing_status,
                user_id,
                doc_id,
                "processing_failed",
                "Không tạo được document object",
            )
            return 0
        print(f"{log_prefix} Đã tạo {len(docs)} Document objects.")

        # --- 5. Chunk Documents ---
        print(f"{log_prefix} Bước 3: Chunking Documents...")
        # Chạy trong thread vì có thể CPU bound
        final_chunks = await asyncio.to_thread(chunk_documents, docs)
        if not final_chunks:
            print(f"{log_prefix} Cảnh báo: Không có chunk hợp lệ nào được tạo.")
            await asyncio.to_thread(
                update_processing_status,
                user_id,
                doc_id,
                "chunking_failed",
                "Không tạo được chunk hợp lệ",
            )
            return 0
        print(f"{log_prefix} Đã chia thành {len(final_chunks)} chunks.")

        # --- 6. Embedding và Lưu trữ ---
        print(f"{log_prefix} Bước 4: Embedding và Lưu trữ...")
        # Hàm này đã là async hoặc chạy trong thread
        num_added = await embed_and_store_chunks(user_id, final_chunks)

        # --- 7. Tạo/Cập nhật Index ---
        if num_added > 0:
            print(f"{log_prefix} Bước 5: Kiểm tra/Tạo Index...")
            try:
                # Index creation là blocking, chạy trong thread
                await asyncio.to_thread(
                    create_ivf_flat_index, user_id
                )  # Không cần truyền nlist nếu dùng giá trị mặc định từ config
                print(f"{log_prefix} Hoàn tất kiểm tra/tạo index.")
            except Exception as index_err:
                print(
                    f"{log_prefix} LỖI trong quá trình kiểm tra/tạo index: {index_err}"
                )
                traceback.print_exc()
                # Không dừng, chỉ log lỗi, vì đã lưu thành công
                # Có thể cập nhật trạng thái phụ là "index_error"
        else:
            print(f"{log_prefix} Không có chunk nào được thêm, bỏ qua index.")

        # --- 8. Cập nhật trạng thái thành công ---
        await asyncio.to_thread(
            update_processing_status, user_id, doc_id, "processed_successfully"
        )
        print(
            f"{log_prefix} HOÀN TẤT xử lý {filename} sau {time.time() - start_time:.2f}s. Added {num_added} chunks."
        )
        return num_added

    # --- Xử lý lỗi tổng quát ---
    except (ValueError, RuntimeError, Exception) as processing_err:
        error_msg = str(processing_err)
        print(f"{log_prefix} LỖI NGHIÊM TRỌNG: {error_msg}")
        traceback.print_exc()
        await asyncio.to_thread(
            update_processing_status, user_id, doc_id, "processing_failed", error_msg
        )
        return 0  # Trả về 0 khi lỗi
