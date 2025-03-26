from create_mindmap.create_mindmap_api import get_smaller_branches_from_docs
from get_youtube_transcript_api.get_youtube_transcript_api import get_transcript
from ocr_image_api.ocr_image_api import ocr
from extract_file_content_api.extract_file_content_api import extract_text
from fastapi import FastAPI, File, UploadFile
from get_youtube_transcript_api.get_youtube_transcript_api import YouTubeLink
from rag_api.rag import query_openai, QueryRequest
import uvicorn
from typing import List
# init fastAPI

app = FastAPI()

@app.get("/")
async def read_root():
    return await {"message": "Welcome to the API"}

@app.post("/get_smaller_branches_from_docs")
async def get_smaller_branches_from_docs_api(docs: List[str], num_clusters: int):
    return await get_smaller_branches_from_docs(docs)
@app.post("/get_smaller_bracnches_from_branch")
async def get_smaller_branches_from_branch_api(docs: List[str], num_clusters: int):
    return await get_smaller_branches_from_docs(docs)
@app.post("/get_transcript")
async def get_transcript_api(link: YouTubeLink):
    return await get_transcript(link)

@app.post("/ocr")
async def ocr_api(file: UploadFile = File(...)):
    return await ocr(file)

@app.post("/extract_text")
async def extract_text_api(file: UploadFile = File(...)):
    return await extract_text(file)

@app.post("/get_LLM_response")
async def get_LLM_response_api(docs: QueryRequest, user_id: str):
    return await query_openai(docs, user_id)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)