# Fast API
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from typing import List
import os

# Automatic API testing
from pydantic import BaseModel, HttpUrl

# import PyPDF2
import pandas as pd
from sentence_transformers import SentenceTransformer
from langchain.text_splitter import RecursiveCharacterTextSplitter
from pdfminer.high_level import extract_text

# Redis
from redisvl.query import VectorQuery
from redisvl.index import SearchIndex
from redis import Redis
import numpy as np

# Model
import openai

# env
from dotenv import load_dotenv
import requests
import io

# unique id for doc
from uuid import uuid4

# File implementation
import json
import requests

# import cosine similarity
from sklearn.metrics.pairwise import cosine_similarity

load_dotenv()

app = FastAPI()
hf = SentenceTransformer("all-MiniLM-L6-v2")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not found in environment variables")

openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "")
REDIS_URL = f"redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}"


def process_file(file: UploadFile):
    """
    Process PDF, DOCX, TXT, JPG files and return chunks with metadata.
    """
    try:
        # Đọc nội dung file
        file_content = file.file.read()
        ext = file.filename.split(".")[-1].lower()

        # Danh sách chunk với metadata
        chunks_with_metadata = []

        if ext in ["pdf", "docx", "txt"]:
            # Gọi API extract_text cho các file PDF, DOCX, TXT
            response = requests.post(
                "http://localhost:8004/extract_text/",
                files={
                    "file": (
                        file.filename,
                        io.BytesIO(file_content),
                        f"application/{ext}",
                    )
                },
            )
            if response.status_code != 200:
                return None, f"Text extraction error: {response.content.decode()}"

            # Lấy chunks_with_metadata từ response
            chunks_with_metadata = response.json().get("chunks", [])

        elif ext in ["jpg", "jpeg", "png"]:
            # Gọi OCR API cho các file hình ảnh
            response = requests.post(
                "http://localhost:8002/ocr/",
                files={
                    "file": (file.filename, io.BytesIO(file_content), f"image/{ext}")
                },
            )
            if response.status_code != 200:
                return None, f"OCR error: {response.content.decode()}"

            ocr_text = response.json().get("text", "")
            # Chia văn bản OCR thành các chunk
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=2500, chunk_overlap=0)
            ocr_chunks = text_splitter.split_text(ocr_text)
            for chunk in ocr_chunks:
                chunks_with_metadata.append({
                    "page_number": 1,  # Hình ảnh không có khái niệm trang, mặc định là 1
                    "bounding_box": None,  # OCR không cung cấp bounding box
                    "text": chunk
                })

        else:
            return None, "Unsupported file format"

        # Nếu không có chunk nào, trả về lỗi
        if not chunks_with_metadata:
            return None, "No text could be extracted from the document"

        return chunks_with_metadata, None

    except Exception as e:
        return None, f"Error processing file: {str(e)}"




def process_youtube_url(url):
    """
    Youtube Link Transcript Extraction
    """
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=2500, chunk_overlap=0)

    response = requests.post("http://localhost:8003/get_transcript/", json={"url": url})

    if response.status_code != 200:
        return None, f"Error processing input video: {response.content.decode()}"

    response = response.json()
    text = response.get("text")

    if not text:
        return None, "No transcript text found in response"

    chunks = text_splitter.split_text(text)

    return chunks, None


def embed_texts(chunks):
    """Embed chunks using SentenceTransformer."""
    return hf.encode(
        [f"passage: {chunk}" for chunk in chunks],
        batch_size=16,
        show_progress_bar=True,
    ).tolist()


index_name = "redisvl"
schema = {
    "index": {"name": index_name, "prefix": "chunk"},
    "fields": [
        {"name": "chunk_id", "type": "tag", "attrs": {"sortable": True}},  # ID của chunk
        {"name": "doc_id", "type": "tag"},  # ID của tài liệu
        {"name": "content", "type": "text"},  # Nội dung chunk
        {"name": "is_active", "type": "numeric"},  # Trạng thái
        {"name": "page_number", "type": "numeric"},  # Số trang
        {"name": "bounding_box", "type": "text"},  # Bounding box (JSON)
        {
            "name": "text_embedding",  # Embedding vector
            "type": "vector",
            "attrs": {
                "dims": 384,  # Kích thước embedding
                "distance_metric": "cosine",  # Metric để so sánh
                "algorithm": "hnsw",  # Thuật toán tìm kiếm
                "datatype": "float32",
            },
        },
    ],
}



# Create Redis index
client = Redis.from_url(REDIS_URL)
index = SearchIndex.from_dict(schema)
index.set_client(client)
index.create(overwrite=True, drop=True)


def store_message(conversation_id, role, message):
    """
    LLM chat history
    """
    key = f"conversation:{conversation_id}"
    history = client.get(key)

    if history:
        history = json.loads(history)
    else:
        history = []

    # Tính embedding
    embedding = hf.encode(f"{role}: {message}")

    history.append({"role": role, "message": message, "embedding": embedding.tolist()})

    client.set(key, json.dumps(history), ex=86400)  # Đặt TTL = 24 giờ

def get_relevant_history(query_embedding, conversation_history, top_k=3):
    """
    Take relevant chat history and find the most relevant messages.
    """
    # Đảm bảo query_embedding là 2D (1, n_features)
    query_embedding = np.array(query_embedding).reshape(1, -1)
    
    # Tính độ tương đồng và sắp xếp
    relevant = sorted(
        conversation_history,
        key=lambda msg: float(cosine_similarity(query_embedding, np.array(msg["embedding"]).reshape(1, -1))),
        reverse=True,
    )
    return relevant[:top_k]



def get_conversation_history(conversation_id):
    """
    Retrieve chat history
    """
    key = f"conversation:{conversation_id}"
    history = client.get(key)
    if history:
        return json.loads(history)
    return []


class URLData(BaseModel):
    url: HttpUrl


@app.post("/store_embeddings/")
async def store_embeddings(file: UploadFile = File(None), url: str = Form(None)):
    # Process file or URL
    if file is None and url is None:
        raise HTTPException(status_code=400, detail="No file or URL provided")

    chunks, error = [], None

    if file:
        chunks, error = process_file(file)
    elif url:
        chunks, error = process_youtube_url(url)

    if error:
        raise HTTPException(status_code=400, detail=error)
    
    print(chunks)

    if error:
        return {"error": error}
    embeddings = embed_texts(chunks)

    # Temporary
    doc_id = str(uuid4())

    # Convert embeddings to Redis-storable format
    data = [
    {
        "chunk_id": f"{doc_id}-{i}",
        "doc_id": doc_id,
        "content": chunk["text"],
        "is_active": 1,  # Đảm bảo thêm trường is_active
        "page_number": chunk["page_number"],  # Thêm số trang
        "bounding_box": json.dumps(chunk["bounding_box"]),  # Chuyển bounding box thành JSON
        "text_embedding": np.array(embeddings[i], dtype="float32").tobytes(),  # Embedding
    }
    for i, chunk in enumerate(chunks)
]


    keys = index.load(data, id_field="chunk_id")
    return {
        "message": "Embeddings stored successfully",
        "doc_id": doc_id,
        "num_chunks": len(chunks),
        "keys": keys,
    }


class QueryRequest(BaseModel):
    query: str


async def query_openai(request: QueryRequest, user_id: str):
    """
    Retrieve context from Redis and query OpenAI.
    """ 
    conversation_history = get_conversation_history(user_id)

    # Tạo embedding cho câu hỏi
    query_embedding = hf.encode(f"query: {request.query}")

    # Lấy lịch sử hội thoại liên quan
    relevant_history = get_relevant_history(query_embedding, conversation_history)
    formatted_history = "\n".join(
        [f"{msg['role']}: {msg['message']}" for msg in relevant_history]
    )

    # Truy vấn vector để lấy context
    vector_query = VectorQuery(
        vector=query_embedding,
        vector_field_name="text_embedding",
        num_results=3,  # tăng số lượng kết quả để cải thiện độ phủ
        return_fields=["chunk_id", "doc_id", "page_number", "bounding_box", "content", "is_active"],
        return_score=True,
    )

    result = index.query(vector_query)

    print("Results:", result)
    for r in result:
        print("Record:", r)
        print("is_active value:", r.get("is_active"))

    # Lọc các chunk đang hoạt động 
    filtered_result = [r for r in result if r.get("is_active") == "1"]  # Convert to int and handle missing field

    print(filtered_result)


    if not filtered_result:
        raise HTTPException(status_code=404, detail="No relevant context found.")

    # Chuẩn bị context từ kết quả tìm kiếm
    context_chunks = []
    ui_data = []  # Lưu thông tin bounding_box và page_number cho UI

    for r in filtered_result:
        chunk_id = r["chunk_id"]  # Example: "123abc-0"
        doc_id = chunk_id.split("-")[0]  # Extract doc_id -> "123abc"
        page_number = r["page_number"]
        bounding_box = json.loads(r["bounding_box"])  # Chuyển bounding_box từ JSON thành list
        content = r["content"]

        # Thêm vào context để gửi đến LLM
        context_chunks.append(f"[{doc_id}] {content}")

        # Thêm thông tin vào dữ liệu UI
        ui_data.append({
            "doc_id": doc_id,
            "page_number": page_number,
            "bounding_box": bounding_box,
            "content": content
        })

    # Xây dựng prompt đầy đủ
    context = "\n\n".join(context_chunks)
    full_prompt = f"""
    Hãy giúp tôi trả lời câu hỏi dựa vào context đã cung cấp. Đây là những tài nguyên bạn có thể dùng để tạo ra câu trả lời:

    **Lịch sử trò chuyện:**
    {formatted_history}
    
    **Context:**  
    {context}
    
    **Câu hỏi của người dùng:**  
    {request.query}
    """

    try:
        # Gửi yêu cầu đến OpenAI với lịch sử hội thoại
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Bạn là một trợ lý AI có thể trả lời các câu hỏi dựa trên dữ liệu được cung cấp.",
                },
                {"role": "user", "content": full_prompt},
            ],
            temperature=0.2,
            max_tokens=500,
        )
        llm_response = response.choices[0].message.content

        # Lưu lịch sử hội thoại
        store_message(user_id, "user", request.query)
        store_message(user_id, "assistant", llm_response)

        # Trả về kết quả, thông tin bounding box và page id
        return {
            "response": llm_response,
            "full_prompt": full_prompt,
            "chunks": ui_data  # Trả về thông tin bounding box và page_number cho UI
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying OpenAI: {str(e)}")
