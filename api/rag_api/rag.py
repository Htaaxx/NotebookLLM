from fastapi import FastAPI, HTTPException, Depends
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File

from redis import Redis
from redisvl.index import SearchIndex
from redisvl.query import VectorQuery
from sentence_transformers import SentenceTransformer
import openai
import os
import pandas as pd
from dotenv import load_dotenv
from typing import List

# Simple Chunking Process
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter


# Load environment variables
load_dotenv("../../.env")
REDIS_URL = os.getenv("REDIS_URL")
OPENAI_API_KEY = os.getenv("OPENAI_KEY")
openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)

# Initialize FastAPI app
app = FastAPI()

# Redis connection
client = Redis.from_url(REDIS_URL)

# Load Sentence Transformer model
hf = SentenceTransformer("BAAI/bge-m3")

# Define Redis Index Schema
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
index = SearchIndex.from_dict(schema)
index.set_client(client)
index.create(overwrite=True, drop=True)

# @app.post("/embed")
# def embed_text(chunks: List[str]):
#     """Embeds text chunks and stores them in Redis."""
#     embeddings = hf.encode([f"passage: {chunk}" for chunk in chunks], batch_size=16)
#     data = [
#         {"chunk_id": i, "content": chunk, "text_embedding": embeddings[i].tolist()}
#         for i, chunk in enumerate(chunks)
#     ]
#     keys = index.load(data, id_field="chunk_id")
#     return {"message": "Embeddings stored successfully", "keys": keys}


@app.post("/embed")
def embed_documents(files: List[UploadFile] = File(...)):
    """Embeds documents and stores text chunks in Redis."""
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=2500, chunk_overlap=0)
    chunks = []

    for file in files:
        if file.filename.endswith(".pdf"):
            loader = PyPDFLoader(file.file)
            text_chunks = loader.load_and_split(text_splitter)
            chunks.extend([chunk.page_content for chunk in text_chunks])
        else:
            content = file.file.read().decode("utf-8")
            text_chunks = text_splitter.split_text(content)
            chunks.extend(text_chunks)

    if not chunks:
        raise HTTPException(
            status_code=400, detail="No valid text extracted from files."
        )

    try:
        embeddings = hf.encode([f"passage: {chunk}" for chunk in chunks], batch_size=16)
        data = [
            {"chunk_id": i, "content": chunk, "text_embedding": embeddings[i].tolist()}
            for i, chunk in enumerate(chunks)
        ]
        keys = index.load(data, id_field="chunk_id")
        return {"message": "Embeddings stored successfully", "keys": keys}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Embedding process failed: {str(e)}"
        )


@app.get("/retrieve")
def retrieve_context(query: str, top_k: int = 3):
    """Retrieves relevant context from Redis."""
    query_embedding = hf.encode(f"query: {query}")
    vector_query = VectorQuery(
        vector=query_embedding,
        vector_field_name="text_embedding",
        num_results=top_k,
        return_fields=["chunk_id", "content"],
        return_score=True,
    )
    result = index.query(vector_query)
    if result:
        return {"context": [r["content"] for r in result]}
    raise HTTPException(status_code=404, detail="No relevant context found")


@app.get("/ask")
def ask_openai(query: str):
    """Asks OpenAI GPT with retrieved context."""
    context = retrieve_context(query)
    if not context["context"]:
        raise HTTPException(status_code=500, detail="Context retrieval failed")
    full_prompt = f"""
    Hãy trả lời câu hỏi dựa vào context cung cấp:
    **Context:**  {context}
    **Câu hỏi:** {query}
    """
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Bạn là một trợ lý AI."},
            {"role": "user", "content": full_prompt},
        ],
        temperature=0.2,
        max_tokens=500,
    )
    return {"response": response.choices[0].message.content}
