import os
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_milvus import Zilliz
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI
from langchain import hub
from langchain_community.document_loaders import PyPDFLoader
from pymilvus import connections
import tempfile
import time
from tqdm import tqdm
from langchain_core.prompts import ChatPromptTemplate

import uuid
from typing import Tuple

load_dotenv()

# Load env vars
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ZILLIZ_CLOUD_URI = os.getenv("ZILLIZ_CLOUD_URI")
ZILLIZ_CLOUD_TOKEN = os.getenv("ZILLIZ_CLOUD_TOKEN")

# Set up embedding
embeddings = HuggingFaceEmbeddings(
    model_name="BAAI/bge-m3",
    model_kwargs={"device": "cpu"},
    encode_kwargs={"normalize_embeddings": True, "batch_size": 32},
)
# First connect to Zilliz (needed for collection management)
connections.connect(
    alias="default",
    uri=ZILLIZ_CLOUD_URI,
    token=ZILLIZ_CLOUD_TOKEN
)

# Initialize Zilliz vector store (LangChain wrapper)
vector_store = Zilliz(
    embedding_function=embeddings,
    connection_args={
        "uri": ZILLIZ_CLOUD_URI,
        "token": ZILLIZ_CLOUD_TOKEN
    },
    collection_name="rag_collection",
    auto_id=True,
    vector_field="embedding",  # Name of your vector field
    text_field="content"      # Name of your text field
)

# Set up LLM
llm = ChatOpenAI(model="gpt-4", temperature=0.2, openai_api_key=OPENAI_API_KEY)  # Fixed model name

# Prompt from LangChain hub
prompt = ChatPromptTemplate.from_template("""
Bạn là chuyên gia phân tích tài liệu. Hãy trả lời câu hỏi với các yêu cầu:

1. Sử dụng chú thích vuông [number] khi dùng thông tin từ tài liệu
2. Mỗi fact/claim phải có ít nhất 1 citation
3. Giữ nguyên số citation trong cả response

CÂU HỎI: {question}

TÀI LIỆU THAM KHẢO:
{context}

YÊU CẦU FORMAT:
- Câu trả lời chi tiết với citations [1][2]...
- Phần REFERENCES cuối cùng liệt kê đầy đủ:
  [1] File: "tên file", Trang: X, Nội dung: "trích đoạn"
  [2] File: ... (tương tự)
""")

def split_text(text: str):
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    docs = splitter.split_documents([Document(page_content=text)])
    return docs

def add_to_vector_store(docs):
    vector_store.add_documents(documents=docs)

def ask_question(question: str) -> str:
    # Tăng số documents retrieved
    retrieved_docs = vector_store.similarity_search(
        question, 
        k=8,
        params={"metric_type": "IP", "params": {"nprobe": 64}}
    )
    
    # Format citations
    citations = format_citations(retrieved_docs)
    
    # Chuẩn bị context với citation markers
    context_parts = []
    for idx, doc in enumerate(retrieved_docs, 1):
        context_parts.append(f"[DOCUMENT {idx}]\nFile: {doc.metadata.get('filename')}\nPage: {doc.metadata.get('page_number')}\nContent: {doc.page_content[:300]}...")
    
    # Gọi LLM
    messages = prompt.invoke({
        "question": question,
        "context": "\n\n".join(context_parts)
    })
    response = llm.invoke(messages)
    
    # Thêm phần references
    references_section = "\n\nREFERENCES:\n" + "\n".join(
        f"[{idx}] File: \"{cit['file']}\", Trang: {cit['page']}, Nội dung: \"{cit['content']}\""
        for idx, cit in citations.items()
    )
    
    return response.content + references_section

'''
CITATION FORMATTING
'''

def validate_citations(response: str, citations: dict):
    # Kiểm tra mọi citation trong response đều có trong references
    import re
    used_citations = set(re.findall(r'\[(\d+)\]', response))
    missing = [c for c in used_citations if c not in citations]
    if missing:
        print(f"Warning: Missing citations {missing} in references")
    return response

def format_citations(retrieved_docs):
    citations = {}
    for idx, doc in enumerate(retrieved_docs, 1):
        citations[str(idx)] = {
            "file": doc.metadata.get("filename", "unknown"),
            "page": doc.metadata.get("page_number", "N/A"),
            "content": doc.metadata.get("content_preview", "N/A"),
            "full_content": doc.page_content[:500] + "..."  # Giới hạn độ dài
        }
    return citations

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
def process_and_store_pdf(file_bytes: bytes, filename: str, doc_id: str) -> int:
    """Process PDF and return chunk count"""
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
        tmp_file.write(file_bytes)
        tmp_path = tmp_file.name

    loader = PyPDFLoader(tmp_path)
    docs = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_documents(docs)

    # Thêm metadata ĐẦY ĐỦ tất cả fields cần thiết
    for i, chunk in enumerate(chunks):
        chunk.metadata.update({
            "doc_id": doc_id,
            "chunk_id": f"{doc_id}_{i}",
            "chunk_index": i,  # <-- THÊM DÒNG NÀY
            "filename": filename,
            "page_number": chunk.metadata.get("page", 0) + 1,
            "created_at": int(time.time())
        })

    # Store in batches
    batch_size = 16
    for i in tqdm(range(0, len(chunks), batch_size), desc="Embedding PDF chunks"):
        batch = chunks[i:i + batch_size]
        vector_store.add_documents(batch)

    return len(chunks)

def delete_embeddings(filter_dict=None, document_id=None):
    """
    Delete embeddings from the vector store based on a filter or document ID.
    """
    try:
        if document_id is not None:
            # Delete a specific document by its primary key
            return vector_store.client.delete(
                collection_name="rag_collection",
                pks=[document_id]
            )
        elif filter_dict is not None:
            # Delete documents matching the filter
            return vector_store.client.delete(
                collection_name="rag_collection",
                filter=filter_dict
            )
        else:
            # Delete all documents (but keep collection)
            res = vector_store.client.delete(
                collection_name="rag_collection",
                filter="id >= 0"  # Filter that matches all documents
            )
            return res.delete_count
    except Exception as e:
        print(f"Error deleting embeddings: {e}")
        raise e

def get_document_embeddings(doc_id: str):
    """
    Get all embeddings for a document by doc_id
    
    Args:
        doc_id: UUID document identifier
        
    Returns:
        List of embeddings with metadata
    """
    try:
        client = vector_store.client
        
        # Query by doc_id instead of filename
        results = client.query(
            collection_name="rag_collection",
            filter=f"doc_id == '{doc_id}'",
            output_fields=["chunk_id", "embedding", "page_number", "content", "filename"]
        )
        
        return {
            "doc_id": doc_id,
            "filename": results[0]["filename"] if results else "unknown",
            "total_chunks": len(results),
            "embeddings": [
                {
                    "chunk_id": item["chunk_id"],
                    "embedding": item["embedding"],
                    "page_number": item["page_number"],
                    "content_preview": item["content"][:200] + "..."
                }
                for item in results
            ]
        }
        
    except Exception as e:
        raise ValueError(f"Error retrieving embeddings: {str(e)}")