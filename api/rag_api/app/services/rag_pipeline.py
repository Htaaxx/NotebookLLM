import os
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_milvus import Zilliz
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI
from langchain import hub
from langchain_community.document_loaders import PyPDFLoader
from pymilvus import connections, Collection
import tempfile
import time
from tqdm import tqdm
from langchain_core.prompts import ChatPromptTemplate
from sklearn.cluster import KMeans
from typing import Tuple, List
import re

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
connections.connect(alias="default", uri=ZILLIZ_CLOUD_URI, token=ZILLIZ_CLOUD_TOKEN)

# Initialize Zilliz vector store (LangChain wrapper)
vector_store = Zilliz(
    embedding_function=embeddings,
    connection_args={"uri": ZILLIZ_CLOUD_URI, "token": ZILLIZ_CLOUD_TOKEN},
    collection_name="rag_collection",
    auto_id=True,
    vector_field="embedding",  # Name of your vector field
    text_field="content",  # Name of your text field
)

# Set up LLM
llm = ChatOpenAI(
    model="gpt-4o-mini", temperature=0.2, openai_api_key=OPENAI_API_KEY
)  # Fixed model name

# Prompt from LangChain hub
prompt = ChatPromptTemplate.from_template(
    """
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
"""
)


def ask_question(question: str) -> str:
    # Tăng số documents retrieved
    retrieved_docs = vector_store.similarity_search(
        question, k=8, params={"metric_type": "IP", "params": {"nprobe": 64}}
    )

    # Format citations
    citations = format_citations(retrieved_docs)

    # Chuẩn bị context với citation markers
    context_parts = []
    for idx, doc in enumerate(retrieved_docs, 1):
        context_parts.append(
            f"[DOCUMENT {idx}]\nFile: {doc.metadata.get('filename')}\nPage: {doc.metadata.get('page_number')}\nContent: {doc.page_content[:300]}..."
        )

    # Gọi LLM
    messages = prompt.invoke(
        {"question": question, "context": "\n\n".join(context_parts)}
    )
    response = llm.invoke(messages)

    return response.content


"""
CITATION FORMATTING
"""


def validate_citations(response: str, citations: dict):
    # Kiểm tra mọi citation trong response đều có trong references
    import re

    used_citations = set(re.findall(r"\[(\d+)\]", response))
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
            "full_content": doc.page_content[:500] + "...",  # Giới hạn độ dài
        }
    return citations


"""""" """""" """""" """""" """""" """""" """""" """""" """""" """""" """""" """""" """"""


def sanitize_metadata_keys(metadata: dict) -> dict:
    return {re.sub(r"[^a-zA-Z0-9_]", "_", k): v for k, v in metadata.items()}


def process_and_store_pdf(file_bytes: bytes, filename: str, doc_id: str) -> int:
    """Process PDF and store minimal metadata into Milvus. Return chunk count."""
    import fitz  # PyMuPDF

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
        tmp_file.write(file_bytes)
        tmp_path = tmp_file.name

    # Get total number of pages (for UI use)
    doc = fitz.open(tmp_path)
    total_pages = len(doc)

    # Load PDF
    loader = PyPDFLoader(tmp_path)
    docs = loader.load()

    # Split into chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_documents(docs)

    # Save minimal metadata
    for i, chunk in enumerate(chunks):
        cleaned_metadata = {
            "doc_id": doc_id,
            "chunk_id": f"{doc_id}_{i}",
            "chunk_index": i,
            "filename": filename,
            "page_number": chunk.metadata.get("page", 0) + 1,
            "total_pages": total_pages,
        }
        chunk.metadata = cleaned_metadata

    # Store in batches
    batch_size = 16
    for i in tqdm(range(0, len(chunks), batch_size), desc="Embedding PDF chunks"):
        batch = chunks[i : i + batch_size]
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
                collection_name="rag_collection", pks=[document_id]
            )
        elif filter_dict is not None:
            # Delete documents matching the filter
            return vector_store.client.delete(
                collection_name="rag_collection", filter=filter_dict
            )
        else:
            # Delete all documents (but keep collection)
            res = vector_store.client.delete(
                collection_name="rag_collection",
                filter="id >= 0",  # Filter that matches all documents
            )
            return res.delete_count
    except Exception as e:
        print(f"Error deleting embeddings: {e}")
        raise e


# def get_document_embeddings(doc_id: str):
#     try:
#         client = vector_store.client
#         collection = client.get_collection("rag_collection")
#         collection.load()

#         # Step 1: Truy xuất các metadata và pk theo doc_id
#         metadata_results = collection.query(
#             expr=f'doc_id == "{doc_id}"',
#             output_fields=[
#                 "pk",
#                 "chunk_id",
#                 "chunk_index",
#                 "page_number",
#                 "content",
#                 "filename",
#             ],
#         )

#         pk_list = [item["pk"] for item in metadata_results]

#         # Step 2: Truy xuất embedding cho các pk
#         embedding_results = collection.query(
#             expr=f'pk in [{",".join(map(str, pk_list))}]',
#             output_fields=["pk", "embedding"],
#         )

#         # Mapping pk -> embedding
#         pk_to_embedding = {item["pk"]: item["embedding"] for item in embedding_results}

#         # Gộp lại metadata + embedding
#         combined_chunks = []
#         for item in metadata_results:
#             combined_chunks.append(
#                 {
#                     "chunk_id": item["chunk_id"],
#                     "chunk_index": item["chunk_index"],
#                     "page_number": item["page_number"],
#                     "content_preview": item["content"][:200] + "...",
#                     "embedding": pk_to_embedding.get(item["pk"]),
#                 }
#             )

#         return {
#             "doc_id": doc_id,
#             "filename": (
#                 metadata_results[0]["filename"] if metadata_results else "unknown"
#             ),
#             "total_chunks": len(combined_chunks),
#             "embeddings": combined_chunks,
#         }

#     except Exception as e:
#         raise ValueError(f"Error retrieving full embeddings: {str(e)}")


def get_document_embeddings(doc_id: str):
    try:
        collection = Collection("rag_collection")

        results = collection.query(
            expr=f'doc_id == "{doc_id}"',
            output_fields=["embedding", "chunk_id", "page_number", "content"],
        )

        if (
            results and results[0]
        ):  # Kiểm tra xem có kết quả trả về và có phần tử đầu tiên
            # Giả định rằng tất cả các kết quả đều thuộc về cùng một doc_id
            # Bạn có thể cần điều chỉnh logic này nếu có trường hợp khác
            first_result = results[0]
            formatted_embeddings = []
            for result in results:
                formatted_embeddings.append(
                    {
                        "chunk_id": result.get("chunk_id"),
                        "page_number": result.get("page_number"),
                        "embedding": result.get("embedding"),
                        "content": result.get("content"),
                    }
                )

            return {
                "doc_id": doc_id,
                "total_chunks": len(results),
                "embeddings": formatted_embeddings,
            }
        else:
            return {
                "doc_id": doc_id,
                "total_chunks": 0,
                "embeddings": [],
            }

    except Exception as e:
        raise ValueError(f"Error retrieving embeddings: {str(e)}")


# mindmapppppppppppppppppppppppppp
def combine_chunks(chunks, predictions):
    combined_chunks = {}
    for i, chunk in enumerate(chunks):
        if predictions[i] not in combined_chunks:
            combined_chunks[predictions[i]] = chunk
        else:
            combined_chunks[predictions[i]] += " " + chunk
    return combined_chunks


def extract_all_headers(text):
    """
    Extract headers from text.
    --------
    """
    header_text = ""
    lines = text.split("\n")
    for line in lines:
        if line.startswith("#"):
            header_text += "#" + line + "\n"
    return header_text


def write_to_file(file_path, content):
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)


async def get_smaller_branches_from_docs(documentIDs: List[str], num_clusters: int = 5):
    all_chunks = []
    embeddings = []
    for doc_id in documentIDs:
        result = await get_document_embeddings(doc_id)
        for inner_chunk in result["embeddings"]:
            chunk = inner_chunk["content"]
            embeddings = inner_chunk["embeddings"]

    # check if num_clusters is greater than number of chunks
    if num_clusters > len(all_chunks):
        num_clusters = len(all_chunks)

    if not all_chunks or not embeddings:
        raise ValueError("No valid chunks or embeddings found.")

    # # Clustering embeddings
    kmeans_model = KMeans(n_clusters=num_clusters, random_state=42)
    kmeans_predictions = kmeans_model.fit_predict(embeddings)
    print("kmeans_predictions:", kmeans_predictions)
    combined_chunks = combine_chunks(all_chunks, kmeans_predictions)
    # print('combined_chunks:', combined_chunks)
    result = "# root\n"
    for i in range(num_clusters):
        try:
            completion = llm.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that reformats to markdown text for better readability with \n"
                        "# for header 1, \n ## for header 2, \n ### header 3 and the doc. \n the header must appear in order # -> ## -> ###",
                    },
                    {"role": "user", "content": combined_chunks[i]},
                ],
            )
            # Extract the content from the response
            text = completion.choices[0].message.content
            # Extract headers
            header_text = extract_all_headers(text)
            result += header_text
            write_to_file(f"cluster_{i}.txt", completion.choices[0].message.content)

        except Exception as e:
            print(f"Error generating completion: {e}")

    return result
