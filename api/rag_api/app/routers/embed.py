from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Depends
from pydantic import BaseModel
from app.services.rag_pipeline import vector_store, process_and_store_pdf, delete_embeddings, get_document_embeddings
from typing import Optional, Dict, Any, List

from pydantic import BaseModel, Field
from typing import Optional


class EmbeddingResponse(BaseModel):
    chunk_id: str
    embedding: List[float]
    page_number: int
    content_preview: str

class DocumentEmbeddingsResponse(BaseModel):
    document_id: str
    total_chunks: int
    embeddings: List[EmbeddingResponse]

class EmbedPDFRequest(BaseModel):
    doc_id: str = Field(..., description="Unique document ID provided by client")
    file: UploadFile = File(..., description="PDF file to process")

class EmbedPDFResponse(BaseModel):
    message: str
    doc_id: str
    chunk_count: int
    filename: str

class DeleteEmbedRequest(BaseModel):
    filter: Optional[Dict[str, Any]] = None
    document_id: Optional[str] = None

router = APIRouter()


@router.post("/")
async def embed_pdf(
    request: EmbedPDFRequest = Depends(), 
    file: UploadFile = File(...)
):
    """
    Upload and embed a PDF file with provided doc_id
    
    Request Body:
    - doc_id: Unique document identifier (provided by client)
    - file: PDF file to process
    
    Returns:
        doc_id: The provided document identifier
        chunk_count: Number of chunks generated
        filename: Original filename
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        contents = await file.read()
        chunk_count = process_and_store_pdf(
            file_bytes=contents,
            filename=file.filename,
            doc_id=request.doc_id  # Sử dụng doc_id từ request
        )
        
        return EmbedPDFResponse(
            message="PDF processed successfully",
            doc_id=request.doc_id,
            chunk_count=chunk_count,
            filename=file.filename
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process PDF: {str(e)}"
        )


@router.delete("/")
async def delete_embed(request: DeleteEmbedRequest = None):
    """
    Delete embeddings from the vector store.
    
    If no filter or document_id is provided, all embeddings will be deleted.
    If a document_id is provided, only that specific document will be deleted.
    If a filter is provided (and no document_id), only embeddings matching the filter will be deleted.
    
    Examples:
        {"filter": {"filename": "example.pdf"}}
        {"document_id": "1234567890"}
    """
    try:
        if request is None:
            # Delete all documents
            deleted_count = delete_embeddings()
            return {"message": "Successfully deleted all embeddings."}
        
        if request.document_id is not None:
            # Delete by document ID (PK)
            deleted_count = delete_embeddings(document_id=request.document_id)
            return {"message": f"Successfully deleted document with ID: {request.document_id}"}
        
        # Delete by filter
        filter_dict = request.filter
        deleted_count = delete_embeddings(filter_dict=filter_dict)
        
        if filter_dict:
            return {"message": f"Successfully deleted {deleted_count} embeddings matching the filter."}
        else:
            return {"message": "Successfully deleted all embeddings."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{document_id}")
async def delete_embed_by_id(document_id: str):
    """
    Delete a specific document by its ID (primary key).
    
    Args:
        document_id: The primary key of the document to delete
        
    Returns:
        A message indicating the success of the operation
    """
    try:
        deleted_count = delete_embeddings(document_id=document_id)
        return {"message": f"Successfully deleted document with ID: {document_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/embeddings/{document_id}", response_model=DocumentEmbeddingsResponse)
async def get_embeddings(document_id: str):
    """
    Lấy tất cả embeddings của các chunk thuộc về một tài liệu
    
    Args:
        document_id: Tên file hoặc ID của tài liệu
    
    Returns:
        DocumentEmbeddingsResponse: 
        - document_id: ID tài liệu
        - total_chunks: Tổng số chunks
        - embeddings: Danh sách các embeddings với metadata
    """
    try:
        # Kết nối trực tiếp với Milvus client
        client = vector_store.client
        
        # Tạo filter để query tất cả chunks thuộc document_id
        filter_expr = f"filename == '{document_id}'"
        
        # Query để lấy primary keys và embeddings
        results = client.query(
            collection_name="rag_collection",
            filter=filter_expr,
            output_fields=["id", "embedding", "page_number", "content"]
        )
        
        # Format kết quả theo Pydantic model
        embeddings_list = []
        for item in results:
            embeddings_list.append(EmbeddingResponse(
                chunk_id=str(item["id"]),
                embedding=item["embedding"],
                page_number=item["page_number"],
                content_preview=item["content"][:200] + "..."  # Lấy preview
            ))
        
        return DocumentEmbeddingsResponse(
            document_id=document_id,
            total_chunks=len(embeddings_list),
            embeddings=embeddings_list
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving document embeddings: {str(e)}"
        )