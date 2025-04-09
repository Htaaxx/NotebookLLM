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
    user_id: str = Field(..., description="User ID performing the delete operation")
    filter: Optional[Dict[str, Any]] = Field(None, description="Filter dictionary")
    document_id: Optional[str] = Field(None, description="Document ID to delete")
    # Thêm validator nếu muốn đảm bảo filter hoặc document_id được cung cấp khi user_id có
    # @validator(...)


class MindmapRequest(BaseModel):
    user_id: str = Field(..., description="User ID for retrieving documents")
    documentIDs: List[str] = Field(..., description="List of document IDs")


router = APIRouter()


@router.post("/", response_model=EmbedPDFResponse)
async def embed_pdf(
    # Nhận user_id và doc_id như các trường form khác cùng với file
    user_id: str = Body(..., embed=True),
    doc_id: str = Body(..., embed=True),
    file: UploadFile = File(..., description="PDF file to process"),
):
    """
    Upload và embed file PDF. Yêu cầu user_id và doc_id trong request body (multipart/form-data).
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        contents = await file.read()
        # Truyền user_id nhận được vào service
        chunk_count = process_and_store_pdf(
            user_id=user_id,  # Truyền user_id đã nhận
            file_bytes=contents,
            filename=file.filename,
            doc_id=doc_id,
        )
        # ... (response logic) ...
        message = f"PDF processed. Added {chunk_count} embeddings for user {user_id}."
        return EmbedPDFResponse(
            message=message,
            doc_id=doc_id,
            chunk_count=chunk_count,
            filename=file.filename,
        )
    except ValueError as ve:
        raise HTTPException(status_code=409, detail=str(ve))
    except Exception as e:
        print(f"Failed to process PDF for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")


# --- SỬA ĐỔI ENDPOINT DELETE / ---
@router.delete("/")
async def delete_embed(
    user_id: str = Query(
        ..., description="User ID performing the delete"
    ),  # User ID bắt buộc qua query
    request_body: Optional[DeleteEmbedRequest] = Body(
        None
    ),  # Filter/doc_id tùy chọn qua body
):
    """
    Xóa embeddings cho user_id được cung cấp.
    - Cung cấp user_id qua query parameter.
    - Nếu muốn xóa cụ thể (theo filter hoặc document_id), gửi chúng trong request body.
    - Nếu không gửi request body (hoặc body rỗng), xóa TẤT CẢ embeddings của user_id đó.
    """
    try:
        deleted_count = 0
        filter_to_use = None
        doc_id_to_use = None

        if request_body:
            # Nếu có body, lấy filter hoặc doc_id từ đó
            # Không cần user_id trong body nữa vì đã lấy từ query
            filter_to_use = request_body.filter
            doc_id_to_use = request_body.document_id
            if filter_to_use and doc_id_to_use:
                raise HTTPException(
                    status_code=400,
                    detail="Provide either filter or document_id, not both.",
                )

        # Gọi service với user_id từ query và filter/doc_id từ body (nếu có)
        deleted_count = delete_embeddings(
            user_id=user_id, filter_dict=filter_to_use, document_id=doc_id_to_use
        )

        # Tạo message dựa trên việc có filter/doc_id hay không
        if doc_id_to_use:
            message = f"Deleted {deleted_count} embeddings for doc ID {doc_id_to_use} for user {user_id}"
        elif filter_to_use:
            message = (
                f"Deleted {deleted_count} embeddings matching filter for user {user_id}"
            )
        else:
            message = f"Deleted all {deleted_count} embeddings for user {user_id}."

        return {"message": message, "deleted_count": deleted_count}
    except Exception as e:
        print(f"Error during delete operation for user {user_id}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to delete embeddings: {str(e)}"
        )


@router.delete("/{document_id}")
async def delete_embed_by_id(
    document_id: str,
    user_id: str = Query(
        ..., description="User ID owning the document"
    ),  # User ID bắt buộc qua query
):
    """
    Xóa document cụ thể bằng ID, yêu cầu user_id qua query parameter.
    """
    if not document_id:
        raise HTTPException(status_code=400, detail="Document ID cannot be empty.")
    try:
        # Truyền user_id từ query vào service
        deleted_count = delete_embeddings(user_id=user_id, document_id=document_id)
        # ... (response logic) ...
        if deleted_count > 0:
            message = f"Successfully deleted {deleted_count} embeddings for document ID: {document_id} for user {user_id}"
        else:
            message = f"No embeddings found or deleted for document ID: {document_id} for user {user_id}"
        return {"message": message, "deleted_count": deleted_count}
    except Exception as e:
        print(f"Error deleting doc {document_id} for user {user_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete embeddings for document ID {document_id}: {str(e)}",
        )


@router.get("/embeddings/{document_id}", response_model=DocumentEmbeddingsResponse)
async def get_embeddings(
    document_id: str,
    user_id: str = Query(
        ..., description="User ID owning the document"
    ),  # User ID bắt buộc qua query
):
    """
    Lấy embeddings cho document cụ thể, yêu cầu user_id qua query parameter.
    """
    try:
        # Truyền user_id từ query vào service
        embeddings_data = get_document_embeddings(user_id=user_id, doc_id=document_id)
        print(
            f"Đã lấy embeddings cho user {user_id}, doc_id '{document_id}': {embeddings_data}"
        )
        # ... (response logic giữ nguyên) ...
        return DocumentEmbeddingsResponse(
            document_id=embeddings_data["doc_id"],
            total_chunks=embeddings_data["total_chunks"],
            embeddings=[
                EmbeddingResponse(**chunk)
                for chunk in embeddings_data.get("embeddings", [])
            ],
        )
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        print(f"Lỗi khi lấy embeddings cho user {user_id}, doc_id '{document_id}': {e}")
        raise HTTPException(
            status_code=500, detail=f"Lỗi máy chủ khi lấy embeddings: {str(e)}"
        )


@router.post("/get_smaller_branches_from_docs")
async def get_smaller_branches_from_docs_api(
    request_data: MindmapRequest,  # Sử dụng Pydantic model mới
    num_clusters: int = Query(5, description="Number of clusters"),
):
    """
    Tạo mindmap từ các document IDs. Yêu cầu user_id và documentIDs trong JSON body.
    """
    if not request_data.documentIDs:
        raise HTTPException(status_code=400, detail="Document ID list cannot be empty.")

    try:
        # Truyền user_id và documentIDs từ request_data vào service
        smaller_branches = await get_smaller_branches_from_docs(
            user_id=request_data.user_id,
            documentIDs=request_data.documentIDs,
            num_clusters=num_clusters,
        )
        return {"smaller_branches": smaller_branches}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(
            f"Error getting smaller branches for user {request_data.user_id}, docs {request_data.documentIDs}: {e}"
        )
        raise HTTPException(
            status_code=500, detail=f"Lỗi máy chủ khi tạo nhánh con: {str(e)}"
        )
