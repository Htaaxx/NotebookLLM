from ocr_image_api.ocr_image_api import ocr
from fastapi import FastAPI, File, UploadFile, Form

# from rag_api.rag import query_openai, QueryRequest, store_embeddings, get_smaller_branches_from_docs
from rag_api.app.routers import embed, query, recall
import uvicorn
from typing import List
import sys
import io
import os
# --- THÊM IMPORT NÀY ---
from fastapi.middleware.cors import CORSMiddleware

# --- KẾT THÚC THÊM IMPORT ---

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

# init fastAPI

from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# --- THÊM ĐOẠN CẤU HÌNH CORS NÀY ---
# Danh sách các origin được phép truy cập API của bạn
# Thay đổi cho phù hợp với địa chỉ frontend của bạn
origins = [
    "http://localhost:3000",  # Địa chỉ React app khi chạy local
    "http://127.0.0.1:3000",  # Thêm IP nếu cần
    os.getenv("FRONTEND_API_URL"),
    # "https://your-deployed-frontend.com", # Thêm địa chỉ frontend khi đã deploy
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Cho phép các origin trong danh sách truy cập
    allow_credentials=True,  # Cho phép gửi cookie/credentials
    allow_methods=["*"],  # Cho phép tất cả các phương thức HTTP (GET, POST, etc.)
    allow_headers=["*"],  # Cho phép tất cả các header
)
# --- KẾT THÚC ĐOẠN CẤU HÌNH CORS ---


@app.get("/")
def read_root():
    return {"message": "Hello may cu"}


# ... (các route và include_router khác của bạn giữ nguyên) ...

# @app.post("/get_smaller_branches_from_docs")
# async def get_smaller_branches_from_docs_api(docs: List[str], num_clusters: int):
#     return await get_smaller_branches_from_docs(docs)


@app.post("/ocr")
async def ocr_api(file: UploadFile = File(...)):
    return await ocr(file)


# @app.post("/extract_text")
# async def extract_text_api(file: UploadFile = File(...)):
#     return await extract_text(file)

# @app.post("/get_LLM_response")
# async def get_LLM_response_api(docs: QueryRequest, user_id: str):
#     return await query_openai(docs, user_id)

app.include_router(embed.router, prefix="/embed", tags=["Embedding"])
app.include_router(query.router, prefix="/query", tags=["Query"])
app.include_router(recall.router, prefix="/recall", tags=["Active Recall"])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
