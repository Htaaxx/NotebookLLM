from fastapi import FastAPI, File, UploadFile, HTTPException
from typing import List
import os

# Automatic API testing
from pydantic import BaseModel

# import PyPDF2
import pandas as pd
from sentence_transformers import SentenceTransformer
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import PyPDFLoader, CSVLoader, TextLoader

# Redis
from redisvl.query import VectorQuery
from redisvl.index import SearchIndex
from redis import Redis
import numpy as np

# Model
import openai


app = FastAPI()

# Load embedding model
hf = SentenceTransformer("all-MiniLM-L6-v2")

# Load LLM Model
OPENAI_API_KEY = ""
openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "")
REDIS_URL = f"redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}"

"""
    Support functions
"""


def process_file(file: UploadFile):
    """Load and process file based on its type."""
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(file.file.read())

    ext = file.filename.split(".")[-1].lower()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=2500, chunk_overlap=0)

    if ext == "pdf":
        loader = PyPDFLoader(temp_path)
    elif ext == "csv":
        loader = CSVLoader(temp_path)
    elif ext == "txt":
        loader = TextLoader(temp_path)
    else:
        return None, "Unsupported file type"

    chunks = loader.load_and_split(text_splitter)
    os.remove(temp_path)
    return chunks, None


def embed_texts(chunks):
    """Embed chunks using SentenceTransformer."""
    return hf.encode(
        [f"passage: {chunk.page_content}" for chunk in chunks],
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
                "dims": 1024,
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


@app.post("/store_embeddings")
async def store_embeddings(file: UploadFile = File(...)):
    chunks, error = process_file(file)
    if error:
        return {"error": error}
    embeddings = embed_texts(chunks)

    # Convert embeddings to Redis-storable format
    data = [
        {
            "chunk_id": i,
            "content": chunk.page_content,
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


@app.post("/query")
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
