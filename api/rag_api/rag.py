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
    Pdf, doc, txt file processor
    """
    try:
        # Read file content once
        file_content = file.file.read()
        ext = file.filename.split(".")[-1].lower()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=2500, chunk_overlap=0)

        if ext == "pdf":
            text = extract_text(io.BytesIO(file_content))
            if not text.strip():
                # If no text found, use OCR
                response = requests.post(
                    "http://localhost:8002/ocr/",
                    files={
                        "file": (
                            file.filename,
                            io.BytesIO(file_content),
                            "application/pdf",
                        )
                    },
                )
                if response.status_code != 200:
                    return None, f"OCR error: {response.content.decode()}"
                text = response.json().get("text", "")
            else:
                response = requests.post(
                    "http://localhost:8004/extract_text/",
                    files={
                        "file": (
                            file.filename,
                            io.BytesIO(file_content),
                            "application/pdf",
                        )
                    },
                )
                if response.status_code != 200:
                    return None, f"Text extraction error: {response.content.decode()}"
                text_data = response.json().get("pages", [])
                text = "".join(page["text"] for page in text_data)

        elif ext in ["docx", "txt"]:
            response = requests.post(
                "http://localhost:8004/extract_text/",
                files={
                    "file": (
                        file.filename,
                        io.BytesIO(file_content),
                        "application/json",
                    )
                },
            )
            if response.status_code != 200:
                return None, f"Text extraction error: {response.content.decode()}"
            text_data = response.json().get("pages", [])
            text = "".join(page["text"] for page in text_data)

        elif ext in ["jpg", "jpeg", "png"]:
            response = requests.post(
                "http://localhost:8002/ocr/",
                files={
                    "file": (file.filename, io.BytesIO(file_content), f"image/{ext}")
                },
            )
            if response.status_code != 200:
                return None, f"OCR error: {response.content.decode()}"
            text = response.json().get("text", "")

        if not text:
            return None, "No text could be extracted from the document"

        chunks = text_splitter.split_text(text)
        return chunks, None

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
        {"name": "chunk_id", "type": "tag", "attrs": {"sortable": True}},
        {"name": "content", "type": "text"},
        {"name": "is_active", "type": "numeric"},
        {
            "name": "text_embedding",
            "type": "vector",
            "attrs": {
                "dims": 384,
                "distance_metric": "cosine",
                "algorithm": "hnsw",
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

    history.append({"role": role, "message": message})
    client.set(key, json.dumps(history))


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
            "content": chunk,
            "is_active": 1,  # Đảm bảo thêm trường is_active
            "text_embedding": np.array(embeddings[i], dtype="float32").tobytes(),
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


@app.post("/query/")
async def query_openai(request: QueryRequest, user_id: str):
    """
    Retrieve context from Redis and query OpenAI. 
    """
    conversation_history = get_conversation_history(user_id)
    formatted_history = "\n".join(
        [f"{msg['role']}: {msg['message']}" for msg in conversation_history]
    )

    # Tạo embedding cho câu hỏi
    query_embedding = hf.encode(f"query: {request.query}")

    # Truy vấn vector để lấy context
    vector_query = VectorQuery(
        vector=query_embedding,
        vector_field_name="text_embedding",
        num_results=3,  # tăng số lượng kết quả để cải thiện độ phủ
        return_fields=["chunk_id", "content", "doc_id", "is_active"],
        return_score=True,
    )

    result = index.query(vector_query)

    for r in result:
        print(r.get("is_active"))

    filtered_result = [r for r in result if r.get("is_active") == "1"]

    if not filtered_result:
        raise HTTPException(status_code=404, detail="No relevant context found.")

    # Chuẩn bị context từ kết quả tìm kiếm
    context_chunks = []
    for r in filtered_result:
        chunk_id = r["chunk_id"]  # Example: "123abc-0"
        doc_id = chunk_id.split("-")[0]  # Extract doc_id -> "123abc"
        context_chunks.append(f"[{doc_id}] {r['content']}")  # Format với doc_id

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

    print(full_prompt)

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

        store_message(user_id, "user", request.query)
        store_message(user_id, "assistant", llm_response)

        return {"response": llm_response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying OpenAI: {str(e)}")
