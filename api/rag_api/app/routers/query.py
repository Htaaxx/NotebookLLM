# File: app/routers/query.py
from fastapi import APIRouter, HTTPException  # Bỏ Depends
from pydantic import BaseModel, Field  # Thêm Field
from typing import List  # Thêm List
# Vẫn import hàm service đã sửa
from ..services.rag_pipeline import ask_question

router = APIRouter()


class QueryRequest(BaseModel):
    user_id: str = Field(..., description="User ID making the query")
    question: str
    headers: List[str] = Field(
        default=["Content-Type: application/json"],
        description="Headers to be included in the request",
    )


@router.post("/")
def query_rag(req: QueryRequest):  # Nhận model đã cập nhật
    """
    Thực hiện query RAG. Yêu cầu user_id và question trong JSON body.
    """
    try:
        # Truyền user_id và question từ request model vào service
        answer = ask_question(user_id=req.user_id, question=req.question, headers=req.headers)
        return {"answer": answer}
    except Exception as e:
        # Cân nhắc log lỗi chi tiết hơn ở đây
        raise HTTPException(status_code=500, detail=f"Lỗi khi xử lý query: {str(e)}")
