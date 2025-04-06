from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.rag_pipeline import ask_question

router = APIRouter()


class QueryRequest(BaseModel):
    question: str


@router.post("/")
def query_rag(req: QueryRequest):
    try:
        answer = ask_question(req.question)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
