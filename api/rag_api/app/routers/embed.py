# -*- coding: utf-8 -*-
# File: app/routers/embed.py
from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Query,
    Depends,
    Body,
)  # Thêm Body

# Đường dẫn import cần chính xác dựa trên cấu trúc thư mục của bạn
# Giả sử rag_api là thư mục gốc chứa app
from ..services.rag_pipeline import (
    # vector_store, # Không cần trực tiếp ở đây
    process_and_store_pdf,
    delete_embeddings,
    get_document_embeddings,
    get_smaller_branches_from_docs,  # Đổi tên hàm API cho nhất quán
)
from typing import Optional, Dict, Any, List

from pydantic import BaseModel, Field

# from typing import Optional # Đã import ở trên


class EmbeddingResponse(BaseModel):
    chunk_id: str
    embedding: List[float]
    page_number: int
    content: str


class DocumentEmbeddingsResponse(BaseModel):
    document_id: str
    total_chunks: int
    embeddings: List[EmbeddingResponse]  # Giữ nguyên list này


class EmbedPDFRequestData(BaseModel):  # Đổi tên để tránh trùng UploadFile
    doc_id: str = Field(..., description="Unique document ID provided by client")


# Dùng Body thay vì Depends cho data JSON khi có UploadFile
# class EmbedPDFRequest(BaseModel):
#     doc_id: str = Field(..., description="Unique document ID provided by client")
#     file: UploadFile = File(..., description="PDF file to process")


class EmbedPDFResponse(BaseModel):
    message: str
    doc_id: str
    chunk_count: int
    filename: str


class DeleteEmbedRequest(BaseModel):
    filter: Optional[Dict[str, Any]] = Field(
        None, description="Filter dictionary, e.g., {'filename': 'test.pdf'}"
    )
    document_id: Optional[str] = Field(None, description="Document ID to delete")

    # Validator để đảm bảo ít nhất một trường được cung cấp nếu muốn xóa cụ thể
    # @validator('*', pre=True, always=True)
    # def check_at_least_one_present(cls, v, values):
    #     if not values.get('filter') and not values.get('document_id'):
    #          # Điều này không cần thiết nữa vì logic endpoint xử lý case None
    #          pass
    #     return v


router = APIRouter()


# --- SỬA ĐỔI ENDPOINT POST / ---
# Sử dụng Body(...) cho data JSON và File(...) cho file upload
@router.post("/", response_model=EmbedPDFResponse)
async def embed_pdf(
    doc_id: str = Body(..., embed=True),
    file: UploadFile = File(..., description="PDF file to process"),
):
    """
    Upload và embed file PDF với doc_id được cung cấp.

    Gửi yêu cầu dạng `multipart/form-data` với:
    - trường `doc_id`: ID tài liệu unique.
    - trường `file`: file PDF cần xử lý.

    Returns:
        Thông tin về quá trình embedding.
    """
    # Lấy doc_id tùy theo cách bạn chọn nhận (Form, Body(embed=True), hoặc từ request_data)
    current_doc_id = (
        doc_id  # Giả sử dùng cách 1 với Body(..., embed=True) hoặc Form(...)
    )
    # if 'request_data' in locals(): # Nếu dùng Cách 2
    #     current_doc_id = request_data.doc_id

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        contents = await file.read()
        print(f"Processing file: {file.filename} for doc_id: {current_doc_id}")
        chunk_count = process_and_store_pdf(
            file_bytes=contents,
            filename=file.filename,
            doc_id=current_doc_id,
        )

        if chunk_count > 0:
            message = f"PDF processed successfully. Added {chunk_count} embeddings."
        elif chunk_count == 0:
            message = f"PDF processed, but 0 embeddings were added (document might already exist or be empty)."
        else:  # Trường hợp lỗi nội bộ trong process_and_store_pdf có thể trả về giá trị âm? (Không nên)
            message = "PDF processing finished with an unexpected result."

        return EmbedPDFResponse(
            message=message,
            doc_id=current_doc_id,
            chunk_count=chunk_count,
            filename=file.filename,
        )

    except ValueError as ve:  # Bắt lỗi cụ thể từ service nếu doc_id đã tồn tại
        raise HTTPException(status_code=409, detail=str(ve))  # 409 Conflict
    except Exception as e:
        print(f"Failed to process PDF {file.filename} for doc_id {current_doc_id}: {e}")
        # Log traceback
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")


# --- SỬA ĐỔI ENDPOINT DELETE / ---
@router.delete("/")
async def delete_embed(
    request: Optional[DeleteEmbedRequest] = Body(None),
):  # Nhận request body tùy chọn
    """
    Xóa embeddings từ vector store.

    - Nếu **không** có request body (hoặc body rỗng): Xóa TẤT CẢ embeddings.
    - Nếu có request body:
        - Ưu tiên `document_id`: Xóa tất cả embeddings thuộc `document_id` đó.
        - Nếu không có `document_id` nhưng có `filter`: Xóa embeddings khớp với `filter`.

    Ví dụ Request Body:
        {"document_id": "doc123"}
        {"filter": {"filename": "example.pdf"}}
        {} hoặc không gửi body -> Xóa tất cả
    """
    try:
        deleted_count = 0
        message = ""

        if request and request.document_id is not None:
            # Ưu tiên xóa bằng document_id nếu được cung cấp
            print(f"Received request to delete by document_id: {request.document_id}")
            deleted_count = delete_embeddings(document_id=request.document_id)
            if deleted_count > 0:
                message = f"Successfully deleted {deleted_count} embeddings for document ID: {request.document_id}"
            else:
                message = f"No embeddings found or deleted for document ID: {request.document_id}"

        elif (
            request and request.filter is not None and request.filter
        ):  # Đảm bảo filter không rỗng
            # Nếu không có document_id nhưng có filter hợp lệ
            filter_dict = request.filter
            print(f"Received request to delete by filter: {filter_dict}")
            deleted_count = delete_embeddings(filter_dict=filter_dict)
            message = f"Successfully deleted {deleted_count} embeddings matching the filter: {filter_dict}"

        else:
            # Trường hợp không có request body HOẶC body không có document_id và filter hợp lệ -> Xóa tất cả
            print("Received request to delete ALL embeddings.")
            deleted_count = delete_embeddings()  # Gọi không có tham số để xóa tất cả
            message = (
                f"Successfully deleted {deleted_count} embeddings (all documents)."
            )

        return {"message": message, "deleted_count": deleted_count}

    except Exception as e:
        print(f"Error during delete operation: {e}")
        # Log traceback
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500, detail=f"Failed to delete embeddings: {str(e)}"
        )


# --- SỬA ĐỔI ENDPOINT DELETE /{document_id} ---
@router.delete("/{document_id}")
async def delete_embed_by_id(document_id: str):
    """
    Xóa một tài liệu cụ thể (tất cả embeddings của nó) bằng document ID từ path.
    """
    if not document_id:
        raise HTTPException(status_code=400, detail="Document ID cannot be empty.")

    try:
        print(
            f"Received request to delete by path parameter document_id: {document_id}"
        )
        deleted_count = delete_embeddings(
            document_id=document_id
        )  # Gọi service với document_id

        if deleted_count > 0:
            message = f"Successfully deleted {deleted_count} embeddings for document ID: {document_id}"
        else:
            message = f"No embeddings found or deleted for document ID: {document_id}"

        return {"message": message, "deleted_count": deleted_count}

    except Exception as e:
        print(f"Error deleting document with ID {document_id}: {e}")
        # Log traceback
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete embeddings for document ID {document_id}: {str(e)}",
        )


# --- Endpoint GET và POST /get_smaller_branches_from_docs giữ nguyên ---
@router.get("/embeddings/{document_id}", response_model=DocumentEmbeddingsResponse)
async def get_embeddings(document_id: str):
    """Lấy thông tin embeddings cho một document ID cụ thể."""
    try:
        # Gọi hàm service đã được sửa lỗi (nếu có)
        embeddings_data = get_document_embeddings(document_id)

        # Kiểm tra lại cấu trúc trả về từ get_document_embeddings
        # Nó trả về dict {"doc_id": ..., "total_chunks": ..., "embeddings": [...]}
        # Trong đó mỗi embedding trong list là dict {"chunk_id": ..., "embedding": ..., ...}

        return DocumentEmbeddingsResponse(
            document_id=embeddings_data["doc_id"],
            total_chunks=embeddings_data["total_chunks"],
            # Đảm bảo map đúng các trường từ dict trong list embeddings_data["embeddings"]
            embeddings=[
                EmbeddingResponse(
                    chunk_id=str(chunk.get("chunk_id", "N/A")),  # Dùng get với default
                    embedding=chunk.get("embedding", []),
                    page_number=chunk.get("page_number", -1),
                    content=chunk.get("content", ""),
                )
                for chunk in embeddings_data.get(
                    "embeddings", []
                )  # Dùng get với default
            ],
        )

    except ValueError as ve:  # Bắt lỗi cụ thể từ service
        raise HTTPException(
            status_code=404, detail=str(ve)
        )  # Not Found nếu ID không tồn tại
    except Exception as e:
        print(f"Lỗi khi lấy embeddings cho doc_id '{document_id}': {e}")
        # Log traceback
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500, detail=f"Lỗi máy chủ khi lấy embeddings: {str(e)}"
        )


@router.post("/get_smaller_branches_from_docs")
async def get_smaller_branches_from_docs_api(  # Đổi tên hàm cho nhất quán
    # Nhận list document IDs từ request body dạng JSON
    documentIDs: List[str] = Body(
        ..., description="List of document IDs to process", embed=True
    ),  # embed=True để nhận dạng {"documentIDs": [...]}
    num_clusters: int = Query(5, description="Number of clusters to create"),
):
    """
    Lấy các nhánh con nhỏ hơn từ các tài liệu sử dụng clustering.

    Request Body (JSON):
    {
        "documentIDs": ["id1", "id2", ...]
    }

    Query Parameters:
    - num_clusters (optional, default=5)
    """
    if not documentIDs:
        raise HTTPException(status_code=400, detail="Document ID list cannot be empty.")

    try:
        # Gọi hàm service (đã sửa lỗi nếu cần trong file service)
        # Lưu ý: get_smaller_branches_from_docs trong service cần là async hoặc chạy trong executor nếu có I/O blocking
        smaller_branches = await get_smaller_branches_from_docs(
            documentIDs, num_clusters
        )
        return {"smaller_branches": smaller_branches}
    except ValueError as ve:  # Bắt lỗi cụ thể từ service
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"Error getting smaller branches for docs {documentIDs}: {e}")
        # Log traceback
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500, detail=f"Lỗi máy chủ khi tạo nhánh con: {str(e)}"
        )
