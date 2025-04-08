from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
import uuid
from app.services import recall_service  # Import service mới
from typing import List, Optional

router = APIRouter()


class StartRecallRequest(BaseModel):
    topic: str


class StartRecallResponse(BaseModel):
    session_id: str
    first_question: str


class AnswerRequest(BaseModel):
    session_id: str
    user_answer: str


class AnswerResponse(BaseModel):
    feedback: str
    key_points: Optional[List[str]] = None
    next_question: Optional[str] = None


class ErrorResponse(BaseModel):
    detail: str


@router.post(
    "/start",
    response_model=StartRecallResponse,
    responses={404: {"model": ErrorResponse}},
)
async def start_session(request: StartRecallRequest):
    """Bắt đầu một phiên Active Recall mới cho một chủ đề."""
    session_id = str(uuid.uuid4())
    first_question = recall_service.start_recall_session(request.topic, session_id)

    if not first_question:
        # Có thể do không tìm thấy context hoặc lỗi tạo câu hỏi
        raise HTTPException(
            status_code=404,
            detail=f"Không thể bắt đầu phiên recall cho chủ đề: '{request.topic}'. Có thể chủ đề không có trong tài liệu hoặc có lỗi xảy ra.",
        )

    return StartRecallResponse(session_id=session_id, first_question=first_question)


@router.post(
    "/answer", response_model=AnswerResponse, responses={404: {"model": ErrorResponse}}
)
async def submit_answer(request: AnswerRequest):
    """Gửi câu trả lời của người dùng và nhận đánh giá/câu hỏi tiếp theo."""
    session_data = recall_service.get_session(request.session_id)
    if not session_data:
        raise HTTPException(
            status_code=404, detail="Session không hợp lệ hoặc đã kết thúc."
        )

    result = recall_service.process_user_answer(request.session_id, request.user_answer)

    if "error" in result:  # Xử lý trường hợp lỗi nội bộ nếu có
        raise HTTPException(status_code=500, detail=result["error"])

    return AnswerResponse(**result)


# (Tùy chọn) Endpoint để kết thúc session rõ ràng
@router.post("/end/{session_id}")
async def end_session_endpoint(session_id: str):
    recall_service.end_session(session_id)
    return {"message": "Session ended."}
