from ocr_image_api.ocr_image_api import ocr
from fastapi import FastAPI, File, UploadFile, Form
from rag_api.rag import query_openai, QueryRequest, store_embeddings, get_smaller_branches_from_docs
import uvicorn
from typing import List
# init fastAPI

from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

@app.get("/")
async def read_root():
    return await {"message": "Welcome to the API"}

@app.post("/get_smaller_branches_from_docs")
async def get_smaller_branches_from_docs_api(docs: List[str], num_clusters: int):
    return await get_smaller_branches_from_docs(docs)

@app.post("/ocr")
async def ocr_api(file: UploadFile = File(...)):
    return await ocr(file)

# @app.post("/extract_text")
# async def extract_text_api(file: UploadFile = File(...)):
#     return await extract_text(file)

@app.post("/get_LLM_response")
async def get_LLM_response_api(docs: QueryRequest, user_id: str):
    return await query_openai(docs, user_id)
@app.post("/store_embeddings")
async def store_embeddings_api(documentID: str = None, file: UploadFile = File(None), url: str = Form(None)):
    return await store_embeddings(documentID, file, url)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)