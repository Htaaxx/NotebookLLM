from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field  # Thêm Field
import uuid
from rag_api.app.services import recall_service  # Import service mới
from typing import List, Optional

router = APIRouter()


class StartRecallRequest(BaseModel):
    user_id: str = Field(..., description="User ID starting the session")
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
async def start_session(request: StartRecallRequest):  # Nhận model đã cập nhật
    """
    Bắt đầu phiên Active Recall. Yêu cầu user_id và topic trong JSON body.
    """
    session_id = str(uuid.uuid4())
    try:
        # Truyền user_id và topic từ request model vào service
        first_question = recall_service.start_recall_session(
            user_id=request.user_id, topic=request.topic, session_id=session_id
        )

        if not first_question:
            raise HTTPException(
                status_code=404,
                detail=f"Không thể bắt đầu phiên recall cho chủ đề: '{request.topic}' của user '{request.user_id}'.",
            )

        return StartRecallResponse(session_id=session_id, first_question=first_question)
    except Exception as e:
        # Log lỗi chi tiết hơn
        print(
            f"Error in /recall/start for user {request.user_id}, topic {request.topic}: {e}"
        )
        raise HTTPException(
            status_code=500, detail="Lỗi máy chủ khi bắt đầu phiên recall."
        )


@router.post(
    "/answer", response_model=AnswerResponse, responses={404: {"model": ErrorResponse}}
)
async def submit_answer(request: AnswerRequest):
    # ... (logic giữ nguyên) ...
    session_data = recall_service.get_session(request.session_id)
    if not session_data:
        raise HTTPException(
            status_code=404, detail="Session không hợp lệ hoặc đã kết thúc."
        )
    # user_id = session_data.get("user_id") # Có thể lấy user_id từ đây nếu cần

    result = recall_service.process_user_answer(request.session_id, request.user_answer)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return AnswerResponse(**result)


@router.post("/end/{session_id}")
async def end_session_endpoint(session_id: str):
    # ... (logic giữ nguyên) ...
    recall_service.end_session(session_id)
    return {"message": "Session ended."}
