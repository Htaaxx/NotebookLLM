# -*- coding: utf-8 -*-
# File: app/services/rag_pipeline.py
import os
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_milvus import Zilliz
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI
from langchain import hub
from langchain_community.document_loaders import PyPDFLoader
from pymilvus import connections, Collection, utility  # Thêm utility
import tempfile
import time
from tqdm import tqdm
from langchain_core.prompts import ChatPromptTemplate
from sklearn.cluster import KMeans
from typing import Tuple, List, Dict, Any, Optional  # Thêm Dict, Any, Optional
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

# Define collection name
COLLECTION_NAME = "rag_collection"

# Initialize Zilliz vector store (LangChain wrapper)
vector_store = Zilliz(
    embedding_function=embeddings,
    connection_args={"uri": ZILLIZ_CLOUD_URI, "token": ZILLIZ_CLOUD_TOKEN},
    collection_name=COLLECTION_NAME,
    auto_id=True,
    vector_field="embedding",  # Name of your vector field
    text_field="content",  # Name of your text field
)

# Set up LLM
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2, openai_api_key=OPENAI_API_KEY)

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

    # Validate citations before returning (optional)
    final_response = validate_citations(response.content, citations)

    # # Append references section
    # references_text = "\n\nREFERENCES:\n"
    # for idx, details in citations.items():
    #     references_text += f"[{idx}] File: \"{details['file']}\", Trang: {details['page']}, Nội dung: \"{details['full_content']}\"\n"

    return final_response  # + references_text


"""
CITATION FORMATTING
"""


def validate_citations(response: str, citations: dict):
    # Kiểm tra mọi citation trong response đều có trong references
    used_citations = set(re.findall(r"\[(\d+)\]", response))
    defined_citations = set(citations.keys())

    # Check for citations used in text but not defined in references
    missing_in_references = used_citations - defined_citations
    if missing_in_references:
        print(
            f"Warning: Citations {missing_in_references} used in response but not found in generated references."
        )
        # Optionally append placeholders or modify response

    # Check for citations defined in references but not used in text (less critical)
    # unused_in_text = defined_citations - used_citations
    # if unused_in_text:
    #     print(f"Info: Citations {unused_in_text} defined in references but not used in response text.")

    return response  # Return original response for now


def format_citations(retrieved_docs):
    citations = {}
    for idx, doc in enumerate(retrieved_docs, 1):
        citations[str(idx)] = {
            "file": doc.metadata.get("filename", "unknown"),
            "page": doc.metadata.get("page_number", "N/A"),
            # "content_preview": doc.page_content[:80] + "...", # Shorter preview if needed
            "full_content": doc.page_content[:150]
            + "...",  # Slightly longer preview for reference
        }
    return citations


"""""" """""" """""" """""" """""" """""" """""" """""" """""" """""" """""" """""" """"""


def sanitize_metadata_keys(metadata: dict) -> dict:
    return {re.sub(r"[^a-zA-Z0-9_]", "_", k): v for k, v in metadata.items()}


def process_and_store_pdf(file_bytes: bytes, filename: str, doc_id: str) -> int:
    """Process PDF and store minimal metadata into Milvus. Return chunk count."""
    import fitz  # PyMuPDF

    # Check if document with this doc_id already exists
    existing_count = get_embedding_count_for_doc_id(doc_id)
    if existing_count > 0:
        print(
            f"Warning: Document with doc_id '{doc_id}' already exists ({existing_count} embeddings). Skipping embedding."
        )
        # Optionally, raise an exception or return a specific status
        # raise ValueError(f"Document with doc_id '{doc_id}' already exists.")
        return 0  # Indicate nothing new was added

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
        tmp_file.write(file_bytes)
        tmp_path = tmp_file.name

    try:
        # Get total number of pages (for UI use)
        doc = fitz.open(tmp_path)
        total_pages = len(doc)
        doc.close()  # Close the document after getting page count

        # Load PDF
        loader = PyPDFLoader(tmp_path)
        docs = loader.load()

        # Split into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, chunk_overlap=200
        )
        chunks = text_splitter.split_documents(docs)

        # Save minimal metadata
        prepared_chunks = []
        for i, chunk in enumerate(chunks):
            cleaned_metadata = {
                "doc_id": doc_id,  # Store the client-provided doc_id
                "chunk_id": f"{doc_id}_{i}",  # Create a unique ID for the chunk
                "chunk_index": i,
                "filename": filename,
                "page_number": chunk.metadata.get("page", -1)
                + 1,  # Adjust page number (PyPDFLoader is 0-based)
                "total_pages": total_pages,
            }
            # Create new Document objects with only the cleaned metadata
            prepared_chunks.append(
                Document(page_content=chunk.page_content, metadata=cleaned_metadata)
            )

        # Store in batches
        batch_size = 16  # Adjust batch size based on performance/memory
        for i in tqdm(
            range(0, len(prepared_chunks), batch_size),
            desc=f"Embedding chunks for {filename}",
        ):
            batch = prepared_chunks[i : i + batch_size]
            vector_store.add_documents(batch)

        print(
            f"Successfully added {len(prepared_chunks)} embeddings for doc_id '{doc_id}'."
        )
        return len(prepared_chunks)

    except Exception as e:
        print(f"Error processing PDF {filename} for doc_id {doc_id}: {e}")
        # Optionally, try to clean up embeddings if partial addition occurred
        # delete_embeddings(document_id=doc_id)
        raise e  # Re-raise the exception
    finally:
        # Ensure temporary file is deleted
        if "tmp_path" in locals() and os.path.exists(tmp_path):
            os.unlink(tmp_path)


# --- MODIFIED delete_embeddings FUNCTION ---
def delete_embeddings(
    filter_dict: Optional[Dict[str, Any]] = None, document_id: Optional[str] = None
) -> int:
    """
    Delete embeddings from the vector store based on a filter or document ID.

    Args:
        filter_dict: A dictionary defining filter conditions (e.g., {"filename": "example.pdf"}).
        document_id: The specific document ID (metadata field 'doc_id') to delete.

    Returns:
        The number of embeddings deleted.
    """
    try:
        if not utility.has_collection(COLLECTION_NAME):
            print(f"Collection '{COLLECTION_NAME}' does not exist. Nothing to delete.")
            return 0

        collection = Collection(
            COLLECTION_NAME
        )  # Get collection object for more control
        filter_expression = ""

        if document_id is not None:
            # **CORRECTED:** Delete documents matching the doc_id metadata field using a filter expression
            # Ensure proper quoting for string values in the expression
            filter_expression = f'doc_id == "{document_id}"'
            print(f"Attempting to delete embeddings with filter: {filter_expression}")

        elif filter_dict is not None and filter_dict:
            # Build filter expression from dictionary (simple 'and' logic for now)
            filter_parts = []
            for k, v in filter_dict.items():
                # Basic quoting for string values, assumes other types don't need quotes
                if isinstance(v, str):
                    filter_parts.append(f'{k} == "{v}"')
                else:
                    filter_parts.append(f"{k} == {v}")
            filter_expression = " and ".join(filter_parts)
            print(f"Attempting to delete embeddings with filter: {filter_expression}")

        else:
            # Delete all documents if neither document_id nor filter_dict is provided
            # Using 'id >= 0' relies on the auto-generated 'id' field (Int64 PK)
            # You could also use a known metadata field like 'doc_id != ""' if all docs have it
            filter_expression = "id >= 0"
            print(
                f"Attempting to delete ALL embeddings with filter: {filter_expression}"
            )

        if not filter_expression:
            print(
                "No valid delete condition provided (document_id, filter_dict, or delete all)."
            )
            return 0

        # Perform the delete operation using the filter expression
        res = collection.delete(expr=filter_expression)
        print(f"Deletion result: {res}")

        # Milvus delete is asynchronous by default, optionally wait for consistency
        # print("Flushing collection...")
        # collection.flush()
        # print("Flush complete.")

        # The result object 'res' might directly contain delete_count or similar attribute
        # Check the specific return type of collection.delete for your pymilvus version
        # Assuming res.delete_count or similar exists:
        deleted_count = getattr(res, "delete_count", 0)  # Safely get count
        if deleted_count == 0 and filter_expression != "id >= 0":
            # Check if entities actually existed before deletion attempt
            # This query runs *before* flush makes deletion fully visible sometimes
            # pre_delete_count = collection.query(expr=filter_expression, output_fields=["id"], limit=1)
            # if not pre_delete_count:
            #     print(f"No embeddings matched the filter '{filter_expression}' before deletion.")
            pass  # For now, just rely on the returned delete_count

        print(
            f"Successfully deleted {deleted_count} embeddings matching expression: '{filter_expression}'"
        )
        return deleted_count

    except Exception as e:
        print(f"Error deleting embeddings: {e}")
        # Consider logging the full traceback
        import traceback

        traceback.print_exc()
        raise e  # Re-raise the exception for the API layer to handle


# Helper function to check existence before embedding (optional)
def get_embedding_count_for_doc_id(doc_id: str) -> int:
    """Counts existing embeddings for a given doc_id."""
    try:
        if not utility.has_collection(COLLECTION_NAME):
            return 0
        collection = Collection(COLLECTION_NAME)
        filter_expression = f'doc_id == "{doc_id}"'
        # Use query with count=True for efficiency if supported, otherwise count results
        # Check pymilvus documentation for the most efficient way to count
        results = collection.query(
            expr=filter_expression, output_fields=["id"], limit=16384
        )  # Limit might be needed
        return len(results)
    except Exception as e:
        print(f"Error checking embedding count for doc_id '{doc_id}': {e}")
        return 0  # Assume none exist if error occurs


def get_document_embeddings(doc_id: str):
    try:
        if not utility.has_collection(COLLECTION_NAME):
            print(f"Collection '{COLLECTION_NAME}' does not exist.")
            return {"doc_id": doc_id, "total_chunks": 0, "embeddings": []}

        collection = Collection(COLLECTION_NAME)

        # Fetch necessary fields, including the vector ('embedding')
        output_fields = [
            "embedding",
            "chunk_id",
            "page_number",
            "content",
            "filename",
            "total_pages",
        ]

        # Query using the doc_id metadata field
        results = collection.query(
            expr=f'doc_id == "{doc_id}"',
            output_fields=output_fields,
            # consistency_level="Strong" # Optional: Ensure latest results after writes
        )

        formatted_embeddings = []
        total_chunks = len(results)

        if total_chunks > 0:
            # Assuming all results belong to the same document
            first_result = results[0]  # Get metadata from the first chunk
            doc_id_from_meta = first_result.get(
                "doc_id", doc_id
            )  # Use retrieved id if available

            for result in results:
                # Ensure all required fields are present, provide defaults if missing
                formatted_embeddings.append(
                    {
                        "chunk_id": result.get("chunk_id", "N/A"),
                        "embedding": result.get("embedding", []),  # Include the vector
                        "page_number": result.get("page_number", -1),
                        "content": result.get("content", ""),
                        # Optionally add other metadata if needed
                        # "filename": result.get("filename", "N/A"),
                        # "total_pages": result.get("total_pages", -1),
                    }
                )

            return {
                "doc_id": doc_id_from_meta,  # Return the ID found in metadata
                "total_chunks": total_chunks,
                "embeddings": formatted_embeddings,
            }
        else:
            # No embeddings found for this doc_id
            return {
                "doc_id": doc_id,
                "total_chunks": 0,
                "embeddings": [],
            }

    except Exception as e:
        print(f"Error retrieving embeddings for doc_id '{doc_id}': {e}")
        # Log traceback for debugging
        import traceback

        traceback.print_exc()
        # Re-raise a more specific error for the API layer
        raise ValueError(f"Lỗi khi lấy embeddings cho doc_id '{doc_id}': {str(e)}")


# mindmapppppppppppppppppppppppppp
# (Hàm get_smaller_branches_from_docs giữ nguyên như cũ)
# ... [rest of the file remains the same] ...
async def get_smaller_branches_from_docs(documentIDs: List[str], num_clusters: int = 5):
    all_chunks_content = []
    all_embeddings_vectors = []  # Store only the vectors for clustering

    print(f"Fetching embeddings for document IDs: {documentIDs}")

    for doc_id in documentIDs:
        try:
            # Use the existing function to get detailed embeddings data
            result = get_document_embeddings(doc_id)  # Changed to non-async call
            print(f"Retrieved {result['total_chunks']} chunks for doc_id: {doc_id}")

            if result["total_chunks"] > 0:
                for inner_chunk in result["embeddings"]:
                    # Ensure content and embedding are valid
                    content = inner_chunk.get("content")
                    embedding_vector = inner_chunk.get("embedding")

                    if content and embedding_vector:
                        all_chunks_content.append(content)
                        all_embeddings_vectors.append(embedding_vector)
                    else:
                        print(
                            f"Warning: Skipping chunk with missing content or embedding for doc_id {doc_id}"
                        )
            else:
                print(f"Warning: No embeddings found for doc_id {doc_id}")

        except Exception as e:
            print(f"Error fetching embeddings for doc_id {doc_id}: {e}")
            # Decide if you want to stop or continue with other IDs
            # raise HTTPException(status_code=500, detail=f"Error fetching data for {doc_id}: {str(e)}") from e

    if not all_chunks_content:
        print("No chunks found for any provided document ID.")
        # Return an empty structure or raise an error
        # return {"smaller_branches": "# root\n(No content found)"}
        raise ValueError(
            "Không tìm thấy nội dung chunk hợp lệ cho bất kỳ document ID nào được cung cấp."
        )
    if not all_embeddings_vectors:
        raise ValueError("Không tìm thấy vector embedding hợp lệ nào.")
    if len(all_chunks_content) != len(all_embeddings_vectors):
        raise ValueError("Mismatch between number of chunks and embeddings collected.")

    print(f"Total chunks collected: {len(all_chunks_content)}")
    print(f"Total embeddings collected: {len(all_embeddings_vectors)}")

    # check if num_clusters is greater than number of chunks
    actual_num_clusters = min(num_clusters, len(all_chunks_content))
    if actual_num_clusters < 1:
        raise ValueError("Cannot perform clustering with zero chunks.")

    if actual_num_clusters != num_clusters:
        print(
            f"Warning: Requested {num_clusters} clusters, but only {len(all_chunks_content)} chunks available. Using {actual_num_clusters} clusters."
        )

    print(f"Performing KMeans clustering with {actual_num_clusters} clusters...")
    # Clustering embeddings vectors
    try:
        kmeans_model = KMeans(
            n_clusters=actual_num_clusters, random_state=42, n_init=10
        )  # Set n_init explicitly
        kmeans_predictions = kmeans_model.fit_predict(all_embeddings_vectors)
        print(
            "KMeans predictions (cluster assignments for each chunk):",
            kmeans_predictions,
        )
    except Exception as cluster_error:
        print(f"Error during KMeans clustering: {cluster_error}")
        raise ValueError(
            f"Lỗi trong quá trình phân cụm: {cluster_error}"
        ) from cluster_error

    combined_chunks = combine_chunks(all_chunks_content, kmeans_predictions)
    print(f"Combined chunks into {len(combined_chunks)} clusters.")

    result = "# root\n"  # Start of the markdown result

    # Ensure processing happens for the actual number of clusters formed
    for i in range(actual_num_clusters):  # Iterate up to the actual number of clusters
        if i not in combined_chunks:
            print(
                f"Warning: Cluster index {i} not found in combined_chunks (this might indicate an issue). Skipping."
            )
            continue

        cluster_content = combined_chunks[i]
        print(f"\nProcessing cluster {i} (content length: {len(cluster_content)})...")

        try:
            # Ensure content is not empty before sending to LLM
            if not cluster_content.strip():
                print(
                    f"Cluster {i} has empty content after combining. Skipping LLM call."
                )
                continue

            print(f"Sending cluster {i} content to LLM for header extraction...")
            # Use await if llm.chat.completions.create is async, otherwise remove await
            # Assuming ChatOpenAI's invoke/create methods might be sync depending on usage context
            # Check langchain documentation for ChatOpenAI's specific methods used
            completion = llm.invoke(  # Changed to invoke which might be sync
                [
                    {
                        "role": "system",
                        "content": "Bạn là trợ lý hữu ích, định dạng lại văn bản thành markdown dễ đọc dùng \n# cho header 1, \n## cho header 2, \n### header 3 theo thứ tự. Chỉ trả về phần header theo cấu trúc cây.",
                        # "content": "You are a helpful assistant that reformats text to markdown using #, ##, ### for headers in hierarchical order. Extract only the hierarchical header structure from the provided text.",
                    },
                    {"role": "user", "content": cluster_content},
                ]
            )

            # Extract the content from the response
            # text = completion.choices[0].message.content
            text = completion.content  # Access content directly if using invoke
            print(
                f"LLM response for cluster {i}: {text[:200]}..."
            )  # Print partial response

            # Extract headers (ensure this function works as expected)
            header_text = extract_all_headers(text)
            print(f"Extracted headers for cluster {i}: {header_text.strip()}")

            # Append extracted headers, ensuring proper indentation if needed
            result += header_text  # Assumes extract_all_headers provides correct markdown hierarchy

            # Optionally write full reformatted text to file for debugging
            # write_to_file(f"cluster_{i}_reformatted.md", text)

        except Exception as e:
            print(
                f"Error generating completion or extracting headers for cluster {i}: {e}"
            )
            # Decide how to handle errors: skip cluster, add placeholder, etc.
            result += f"## Cluster {i} (Error Processing)\n"
            # Log traceback for detailed debugging
            import traceback

            traceback.print_exc()

    print("\nFinal generated markdown structure:")
    print(result)
    return result


def combine_chunks(chunks: List[str], predictions: List[int]) -> Dict[int, str]:
    """Combines text chunks based on cluster prediction index."""
    combined = {}
    if len(chunks) != len(predictions):
        print(
            f"Warning: Mismatch in length of chunks ({len(chunks)}) and predictions ({len(predictions)})."
        )
        # Handle error or return empty dict?
        return {}
    for i, chunk_content in enumerate(chunks):
        cluster_index = predictions[i]
        if cluster_index not in combined:
            combined[cluster_index] = chunk_content
        else:
            # Append with a space or newline depending on desired structure
            combined[cluster_index] += (
                "\n\n" + chunk_content
            )  # Use newline for better separation
    return combined


def extract_all_headers(text: str) -> str:
    """Extracts lines starting with #, ##, ### while preserving relative order."""
    header_text = ""
    lines = text.split("\n")
    for line in lines:
        stripped_line = line.strip()
        if stripped_line.startswith("#"):
            # Potentially add indentation based on header level for visual structure if needed
            # level = stripped_line.count('#', 0, 3) # Count '#' at the beginning
            # indentation = "  " * (level - 1) if level > 0 else ""
            # header_text += indentation + stripped_line + "\n"
            header_text += stripped_line + "\n"  # Keep it simple for now
    return header_text


# (Optional) Function to write content to a file, ensure correct encoding
def write_to_file(file_path: str, content: str):
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Successfully wrote content to {file_path}")
    except Exception as e:
        print(f"Error writing to file {file_path}: {e}")
