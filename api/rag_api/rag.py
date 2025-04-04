# Fast API
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from typing import List
import os
# encode tobyte
import base64

# Automatic API testing
from pydantic import BaseModel, HttpUrl

# import PyPDF2
import pandas as pd
from sentence_transformers import SentenceTransformer
from langchain.text_splitter import RecursiveCharacterTextSplitter
# Redis
from redisvl.query import VectorQuery
from redisvl.index import SearchIndex
from redis import Redis
import numpy as np

# Model
import openai

# env

import requests
import io

# unique id for doc
from uuid import uuid4

# File implementation
import json
import requests

# import cosine similarity
from sklearn.metrics.pairwise import cosine_similarity
# api
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from extract_file_content_api.extract_file_content_api import extract_text
# Kmean
from sklearn.cluster import KMeans
# load_dotenv()

from dotenv import load_dotenv
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
            chunks_with_metadata = extract_text(file_content, file.filename)

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
async def store_embeddings(documentID: str = None, file: UploadFile = File(None), url: str = Form(None)):
    # Process file or URL
    if file is None and url is None and documentID is None:
        raise HTTPException(status_code=400, detail="No file or URL provided")

    chunks, error = [], None

    if file:
        chunks, error = process_file(file)
    elif url:
        chunks, error = process_youtube_url(url)

    if error:
        raise HTTPException(status_code=400, detail=error)
    
    # print(chunks)
    # print('type chunk:',type(chunks))

    if error:
        return {"error": error}
    embeddings = embed_texts(chunks['chunks'])
    print('len embeddings:', len(embeddings))
    # Temporary
    
    doc_id = documentID

    # Convert embeddings to Redis-storable format
    data = [
    {
        "chunk_id": f"{doc_id}-{i}",
        "doc_id": doc_id,
        "content": chunk.get("text", ""),  # Nội dung chunk
        "is_active": 0,  # Đảm bảo thêm trường is_active
        "page_number": chunk["page_number"],  # Thêm số trang
        "bounding_box": json.dumps(chunk["bounding_box"]),  # Chuyển bounding box thành JSON
        "text_embedding": np.array(embeddings[i], dtype="float32").tobytes(),  # Embedding
    }
    for i, chunk in enumerate(chunks['chunks'])]

    keys = index.load(data, id_field="chunk_id")
    return {
        "message": "Embeddings stored successfully",
        "doc_id": doc_id,
        "num_chunks": len(chunks['chunks']),
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
        
         # Thêm thông tin vào dữ liệu UI
        ui_data.append({
            "doc_id": doc_id,
            "page_number": page_number,
            "bounding_box": bounding_box,
            "content": content
        })


        # Thêm vào context để gửi đến LLM
        context_chunks.append(f"[{doc_id}] {content} {ui_data}")

       
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
                    "content": f"Trả lời chi tiết câu hỏi: '{request.query}' bằng cách chỉ sử dụng thông tin từ tài liệu trích dẫn. Dưới đây là các tài liệu tham khảo có thể sử dụng:{context}. Mọi câu trả lời phải có trích dẫn dưới dạng [1], [2], [3]... tương ứng với tài liệu được sử dụng. Nếu một thông tin không có trong tài liệu, không được gán sai trích dẫn cho nó.",
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

def combine_chunks(chunks, predictions):
    combined_chunks = {}
    for i, chunk in enumerate(chunks):
        if predictions[i] not in combined_chunks:
            combined_chunks[predictions[i]] = chunk
        else:
            combined_chunks[predictions[i]] += ' ' + chunk
    return combined_chunks
def write_to_file(file_path, content):
    with open(file_path, "w") as f:
        f.write(content)


async def get_smaller_branches_from_docs(documentIDs: List[str], num_clusters: int = 5):
    all_chunks = []
    embeddings = []
    for document_id in documentIDs:
        query = f'@doc_id:{{{document_id}}}'
        # Perform the search
        results = index.search(query)
        # Extract documents safely
        docs = getattr(results, "docs", None)  # RediSearch results store documents in `.docs`
        print('docs:',docs)
        if not docs:
            raise TypeError(f"Unexpected search result format: {dir(results)}")

        # Iterate through extracted docs
        for doc in docs:
            chunk = getattr(doc, "content", None)
            all_chunks.append(chunk)
    embeddings = embed_texts(all_chunks)
    # check if num_clusters is greater than number of chunks
    if num_clusters > len(all_chunks):
        num_clusters = len(all_chunks)
    
    if not all_chunks or not embeddings:
        raise ValueError("No valid chunks or embeddings found.")

    # # Clustering embeddings
    kmeans_model = KMeans(n_clusters=num_clusters, random_state=42)
    kmeans_predictions = kmeans_model.fit_predict(embeddings)
    print('kmeans_predictions:', kmeans_predictions)
    combined_chunks = combine_chunks(all_chunks, kmeans_predictions)
    # print('combined_chunks:', combined_chunks)
    result = []
    for i in range(num_clusters):
        try:
            completion = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": 
                        "You are a helpful assistant that reformats to markdown text for better readability with \n # for header 1, \n ## for header 2, \n ### header 3 and the doc."},
                    {"role": "user", "content": combined_chunks[i]}
                ]
            )
            result.append(completion.choices[0].message.content)
            write_to_file(f"cluster_{i}.txt", completion.choices[0].message.content)
        except Exception as e:
            print(f"Error generating completion: {e}")
            result.append("Error processing this chunk.")

    return result

