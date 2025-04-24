# File: app/routers/query.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any  # Thêm Dict, Optional, Any

from ..services.rag_pipeline import ask_question  # Đường dẫn cũ

router = APIRouter()


# --- Định nghĩa Response Models ---
class CitationDetail(BaseModel):
    doc_id: Optional[str] = None
    chunk_id: Optional[str] = None
    page_number: Optional[int] = None
    filename: Optional[str] = None
    content_preview: Optional[str] = None


class QueryResponseWithCitations(BaseModel):
    answer: str
    citations: Dict[
        str, CitationDetail
    ]  # Key là số citation (string), value là chi tiết


# --- Model Request giữ nguyên ---
class QueryRequest(BaseModel):
    user_id: str = Field(..., description="User ID making the query")
    question: str
    headers: List[str] = Field(
        default=[],  # Bỏ header mặc định nếu không cần
        description="Headers to be included in the request (optional)",
    )


@router.post(
    "/", response_model=QueryResponseWithCitations
)  # <-- Cập nhật response_model
def query_rag(req: QueryRequest):
    """
    Thực hiện query RAG và trả về câu trả lời cùng thông tin citation chi tiết.
    Yêu cầu user_id và question trong JSON body.
    """
    try:
        # Gọi hàm ask_question đã được sửa đổi
        result_data = ask_question(
            user_id=req.user_id, question=req.question, headers=req.headers
        )

        # Kiểm tra nếu ask_question trả về cấu trúc không mong muốn (ví dụ: summarization trả về string)
        # Cần xử lý nhất quán hơn ở ask_question nếu muốn cả summarization có citation
        if (
            not isinstance(result_data, dict)
            or "answer" not in result_data
            or "citations" not in result_data
        ):
            print(
                f"Cảnh báo: ask_question trả về định dạng không mong muốn: {result_data}"
            )
            # Có thể trả về lỗi hoặc định dạng lại
            # Tạm thời trả về lỗi
            raise HTTPException(
                status_code=500,
                detail="Lỗi xử lý nội bộ: Định dạng phản hồi không đúng.",
            )

        # FastAPI sẽ tự động validate và trả về dựa trên QueryResponseWithCitations
        return result_data

    except HTTPException as http_exc:
        raise http_exc  # Ném lại lỗi HTTPException để giữ status code và detail
    except Exception as e:
        print(
            f"Lỗi nghiêm trọng khi xử lý query cho user {req.user_id}: {e}"
        )  # Log lỗi chi tiết
        import traceback

        traceback.print_exc()  # In traceback để debug
        raise HTTPException(
            status_code=500, detail=f"Lỗi máy chủ khi xử lý query: {str(e)}"
        )
