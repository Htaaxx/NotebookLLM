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

load_dotenv()

app = FastAPI()

# Load embedding model
hf = SentenceTransformer("all-MiniLM-L6-v2")

# Load LLM Model
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not found in environment variables")

openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "")
REDIS_URL = f"redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}"


def process_file(file: UploadFile):
    """Load and process file based on its type."""
    try:
        # Read file content once
        file_content = file.file.read()
        ext = file.filename.split(".")[-1].lower()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=2500, chunk_overlap=0)

        if ext == "pdf":
            text = extract_text(
                io.BytesIO(file_content)
            )  # ✅ Fixed: Correctly passing file content
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


"""
    Database schema creation
"""

# Define Redis index schema
index_name = "redisvl"
schema = {
    "index": {"name": index_name, "prefix": "chunk"},
    "fields": [
        {"name": "chunk_id", "type": "tag", "attrs": {"sortable": True}},
        {"name": "content", "type": "text"},
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

    # Convert embeddings to Redis-storable format
    data = [
        {
            "chunk_id": i,
            "content": chunk,
            "text_embedding": np.array(embeddings[i], dtype="float32").tobytes(),
        }
        for i, chunk in enumerate(chunks)
    ]

    keys = index.load(data, id_field="chunk_id")
    return {
        "message": "Embeddings stored successfully",
        "num_chunks": len(chunks),
        "keys": keys,
    }


class QueryRequest(BaseModel):
    query: str


@app.post("/query/")
async def query_openai(request: QueryRequest):
    """Retrieve context from Redis and query OpenAI."""
    query_embedding = hf.encode(f"query: {request.query}")

    vector_query = VectorQuery(
        vector=query_embedding,
        vector_field_name="text_embedding",
        num_results=3,
        return_fields=["chunk_id", "content"],
        return_score=True,
    )

    result = index.query(vector_query)

    if not result:
        raise HTTPException(status_code=404, detail="No relevant context found.")

    context = "\n\n".join([r["content"] for r in result])
    full_prompt = f"""
    Hãy giúp tôi trả lời câu hỏi dựa vào context đã cung cấp
    
    **Context:**  
    {context}
    
    **Câu hỏi của người dùng:**  
    {request.query}
    """

    print(full_prompt)

    try:
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
        return {"response": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying OpenAI: {str(e)}")
