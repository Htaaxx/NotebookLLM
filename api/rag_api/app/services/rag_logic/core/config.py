# File: app/services/rag_logic/core/config.py
import os
from dotenv import load_dotenv

load_dotenv()

# --- Biến môi trường ---
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ZILLIZ_CLOUD_URI = os.getenv("ZILLIZ_CLOUD_URI")
ZILLIZ_CLOUD_TOKEN = os.getenv("ZILLIZ_CLOUD_TOKEN")
MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")
MONGO_COLLECTION_NAME = os.getenv("MONGO_COLLECTION_NAME")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# --- Hằng số và Cấu hình ---
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_DEVICE = "cpu"
EMBEDDING_BATCH_SIZE = 32
GEMINI_MODEL_NAME = "gemini-1.5-flash-latest"
GEMINI_TEMPERATURE = 0.5
CHUNK_SIZE = 2500
CHUNK_OVERLAP = 500
MILVUS_METRIC_TYPE = "COSINE"
MILVUS_INDEX_TYPE = "IVF_FLAT"  # Hoặc HNSW
NLIST_VALUE = 1024
NPROBE_VALUE = 64
MILVUS_VECTOR_FIELD = "embedding"
MILVUS_TEXT_FIELD = "content"
MILVUS_STORAGE_BATCH_SIZE = 32
SUMMARIZATION_KEYWORDS = ["tổng hợp", "tóm tắt", "summarize", "summary"]
DEFAULT_NUM_CLUSTERS = 5
KMEANS_RANDOM_STATE = 42
KMEANS_N_INIT = 10
