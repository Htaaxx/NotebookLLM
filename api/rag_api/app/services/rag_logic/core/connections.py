# File: app/services/rag_logic/core/connections.py
import os
import re
from typing import Optional
import pymongo
from pymongo.collection import Collection as MongoCollection
from pymilvus import connections, Collection as MilvusCollection, utility
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_milvus import Zilliz
from langchain_google_genai import ChatGoogleGenerativeAI
import google.generativeai as genai

# Import config từ cùng thư mục 'core'
from . import config  # <<< THAY ĐỔI IMPORT

# --- MongoDB Connection ---
mongo_client = None
# ... (Code khởi tạo mongo_client như trước, sử dụng config.MONGO_URI, etc.) ...
if config.MONGO_URI:
    try:
        mongo_client = pymongo.MongoClient(config.MONGO_URI)
        print("Kết nối MongoDB thành công!")
    except pymongo.errors.ConfigurationError as e:
        print(f"Lỗi cấu hình MongoDB URI: {e}")
        mongo_client = None
    except Exception as e:
        print(f"Lỗi kết nối MongoDB khác: {e}")
        mongo_client = None
else:
    print("Cảnh báo: MONGO_URI chưa được cấu hình...")


def get_mongo_collection() -> Optional[MongoCollection]:
    """Lấy đối tượng collection MongoDB."""
    # ... (Code hàm như trước, sử dụng config.MONGO_DB_NAME, etc.) ...
    if (
        mongo_client is None
        or not config.MONGO_DB_NAME
        or not config.MONGO_COLLECTION_NAME
    ):
        return None
    try:
        db = mongo_client[config.MONGO_DB_NAME]
        collection = db[config.MONGO_COLLECTION_NAME]
        return collection
    except Exception as e:
        print(f"Lỗi khi lấy MongoDB collection: {e}")
        return None


# --- Milvus Connection ---
# ... (Code connections.connect như trước, sử dụng config.ZILLIZ_CLOUD_URI, etc.) ...
try:
    if config.ZILLIZ_CLOUD_URI and config.ZILLIZ_CLOUD_TOKEN:
        connections.connect(
            alias="default",
            uri=config.ZILLIZ_CLOUD_URI,
            token=config.ZILLIZ_CLOUD_TOKEN,
        )
        print("Đã thiết lập kết nối ban đầu đến Zilliz Cloud.")
    else:
        print("Cảnh báo: Zilliz URI/Token chưa được cấu hình.")
except Exception as e:
    print(f"Lỗi khi kết nối ban đầu đến Milvus: {e}")


def get_user_collection_name(user_id: str) -> str:
    """Tạo tên collection Milvus chuẩn hóa cho user."""
    # ... (Code hàm như trước) ...
    safe_user_id = re.sub(r"[^a-zA-Z0-9_]", "_", user_id)
    return f"user_{safe_user_id}_rag"


def get_user_milvus_collection(user_id: str) -> Optional[MilvusCollection]:
    """Lấy đối tượng Milvus Collection của pymilvus cho user."""
    # ... (Code hàm như trước) ...
    collection_name = get_user_collection_name(user_id)
    try:
        if not utility.has_collection(collection_name):
            # print(f"Warning: Collection '{collection_name}' for user '{user_id}' does not exist.")
            return None
        return MilvusCollection(collection_name)
    except Exception as e:
        print(f"Lỗi khi lấy Milvus collection '{collection_name}': {e}")
        return None


# --- Embedding Model ---
# ... (Code khởi tạo embeddings như trước, sử dụng config.EMBEDDING_MODEL_NAME, etc.) ...
embeddings = None
try:
    embeddings = HuggingFaceEmbeddings(
        model_name=config.EMBEDDING_MODEL_NAME,
        model_kwargs={"device": config.EMBEDDING_DEVICE},
        encode_kwargs={
            "normalize_embeddings": True,
            "batch_size": config.EMBEDDING_BATCH_SIZE,
        },
    )
    print(f"Đã khởi tạo embedding model: {config.EMBEDDING_MODEL_NAME}")
except Exception as e:
    print(f"Lỗi nghiêm trọng khi khởi tạo embedding model: {e}")
    embeddings = None

# --- LLM Model ---
# ... (Code khởi tạo llm như trước, sử dụng config.GOOGLE_API_KEY, etc.) ...
llm = None
if config.GOOGLE_API_KEY:
    try:
        genai.configure(api_key=config.GOOGLE_API_KEY)
        llm = ChatGoogleGenerativeAI(
            model=config.GEMINI_MODEL_NAME,
            google_api_key=config.GOOGLE_API_KEY,
            temperature=config.GEMINI_TEMPERATURE,
            convert_system_message_to_human=False,
        )
        print(f"Sử dụng mô hình LLM: Google Gemini ({config.GEMINI_MODEL_NAME})")
    except Exception as e:
        print(f"Lỗi khi khởi tạo ChatGoogleGenerativeAI: {e}")
        llm = None
else:
    print("Không thể khởi tạo LLM do thiếu GOOGLE_API_KEY.")
    llm = None


# --- Vector Store Function ---
def get_user_vector_store(user_id: str) -> Optional[Zilliz]:
    """Lấy (hoặc tạo nếu chưa có) vector store Langchain Zilliz cho user."""
    # ... (Code hàm như trước, sử dụng config.* và embeddings) ...
    collection_name = get_user_collection_name(user_id)
    if (
        not config.ZILLIZ_CLOUD_URI
        or not config.ZILLIZ_CLOUD_TOKEN
        or embeddings is None
    ):
        print(
            f"Lỗi: Thiếu cấu hình Zilliz/Token hoặc embedding model để tạo vector store cho user {user_id}."
        )
        return None

    try:
        vector_store_instance = Zilliz(
            embedding_function=embeddings,
            connection_args={
                "uri": config.ZILLIZ_CLOUD_URI,
                "token": config.ZILLIZ_CLOUD_TOKEN,
            },
            collection_name=collection_name,
            auto_id=True,
            vector_field=config.MILVUS_VECTOR_FIELD,
            text_field=config.MILVUS_TEXT_FIELD,
        )
        return vector_store_instance
    except Exception as e:
        print(
            f"Lỗi khi khởi tạo Zilliz vector store cho collection '{collection_name}': {e}"
        )
        return None
