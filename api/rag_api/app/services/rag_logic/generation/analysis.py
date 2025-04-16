# File: app/services/analysis.py
from typing import List, Dict, Any
from sklearn.cluster import KMeans
import re

from ..core import config  # <<< Đường dẫn mới chính xác
from ..core.connections import llm  # <<< Đường dẫn mới chính xác
from ..processing.indexing import get_document_embeddings  # <<< Đường dẫn mới chính xác


def combine_chunks(chunks: List[str], predictions: List[int]) -> Dict[int, str]:
    """Gộp các text chunk dựa trên cluster index."""
    combined = {}
    if len(chunks) != len(predictions):
        print(
            f"Warning: Lệch số lượng chunks ({len(chunks)}) và predictions ({len(predictions)})."
        )
        return {}
    for i, chunk_content in enumerate(chunks):
        cluster_index = predictions[i]
        # Đảm bảo chunk_content là string
        chunk_content_str = str(chunk_content) if chunk_content is not None else ""
        if cluster_index not in combined:
            combined[cluster_index] = chunk_content_str
        else:
            combined[cluster_index] += "\n\n" + chunk_content_str
    return combined


def add_hashtag_to_header(text: str) -> str:
    """Thêm # vào đầu các dòng là header (#, ##, ###) và giữ lại các dòng khác."""
    header_text = ""
    lines = text.split("\n")
    for line in lines:
        stripped_line = line.strip()
        # Chỉ thêm # nếu dòng bắt đầu bằng # và theo sau là khoảng trắng hoặc ký tự khác #
        if stripped_line.startswith("#") and (
            len(stripped_line) == 1 or stripped_line[1] != "#"
        ):
            header_text += "#" + stripped_line + "\n"  # Thêm # vào header cấp 1
        elif stripped_line.startswith("##") and (
            len(stripped_line) == 2 or stripped_line[2] != "#"
        ):
            header_text += "#" + stripped_line + "\n"  # Thêm # vào header cấp 2
        elif stripped_line.startswith("###") and (
            len(stripped_line) == 3 or stripped_line[3] != "#"
        ):
            header_text += "#" + stripped_line + "\n"  # Thêm # vào header cấp 3
        elif stripped_line.startswith(
            "#"
        ):  # Các trường hợp nhiều hơn 3 dấu # hoặc không có khoảng trắng
            header_text += (
                stripped_line + "\n"
            )  # Giữ nguyên các header > 3 hoặc lỗi format
        else:
            header_text += stripped_line + "\n"  # Giữ nguyên các dòng không phải header
    # Loại bỏ các dòng trống liên tiếp ở cuối
    return header_text.rstrip() + "\n"


async def get_smaller_branches_from_docs(
    user_id: str,
    documentIDs: List[str],
    num_clusters: int = config.DEFAULT_NUM_CLUSTERS,
) -> str:
    """Lấy nhánh con (dạng markdown) từ các tài liệu dùng K-Means và LLM."""
    all_chunks_content = []
    all_embeddings_vectors = []
    print(f"[{user_id}] Mindmap: Fetching embeddings for doc IDs: {documentIDs}")

    # Lấy embeddings (đồng bộ, có thể chạy trong thread nếu cần tối ưu async)
    for doc_id in documentIDs:
        try:
            # Gọi hàm get_document_embeddings (đồng bộ)
            result = get_document_embeddings(user_id, doc_id)  # Lấy từ indexing
            if result["total_chunks"] > 0:
                for inner_chunk in result["embeddings"]:
                    content = inner_chunk.get("content")
                    embedding_vector = inner_chunk.get("embedding")
                    if content and embedding_vector:
                        all_chunks_content.append(content)
                        all_embeddings_vectors.append(embedding_vector)
                    else:
                        print(
                            f"[{user_id}] Mindmap: Bỏ qua chunk không hợp lệ trong doc {doc_id}"
                        )
            else:
                print(f"[{user_id}] Mindmap: Không tìm thấy chunk nào cho doc {doc_id}")
        except Exception as e:
            print(f"[{user_id}] Mindmap: Lỗi khi lấy embeddings cho doc {doc_id}: {e}")

    if not all_chunks_content or not all_embeddings_vectors:
        raise ValueError("Không tìm thấy nội dung/embedding hợp lệ để tạo mindmap.")
    if len(all_chunks_content) != len(all_embeddings_vectors):
        raise ValueError(
            "Số lượng content và embedding không khớp."
        )  # Lỗi nghiêm trọng

    # Clustering
    actual_num_clusters = min(num_clusters, len(all_chunks_content))
    if actual_num_clusters <= 0:
        raise ValueError("Không đủ dữ liệu để clustering.")

    print(
        f"[{user_id}] Mindmap: Performing K-Means clustering with k={actual_num_clusters}"
    )
    kmeans_model = KMeans(
        n_clusters=actual_num_clusters,
        random_state=config.KMEANS_RANDOM_STATE,
        n_init=config.KMEANS_N_INIT,
    )
    try:
        kmeans_predictions = kmeans_model.fit_predict(all_embeddings_vectors)
    except Exception as kmeans_err:
        print(f"[{user_id}] Mindmap: Lỗi K-Means clustering: {kmeans_err}")
        raise RuntimeError("Lỗi trong quá trình gom cụm dữ liệu.") from kmeans_err

    combined_chunks = combine_chunks(all_chunks_content, kmeans_predictions)
    markdown_result = "# root\n"

    # Gọi LLM để tạo tiêu đề cho từng cụm
    if llm is None:
        print(f"[{user_id}] Mindmap: LLM chưa khởi tạo, không thể tạo tiêu đề.")
        # Trả về nội dung gốc của các cụm nếu không có LLM
        for i in range(actual_num_clusters):
            cluster_content = combined_chunks.get(i, "").strip()
            if cluster_content:
                markdown_result += f"## Cluster {i+1}\n{cluster_content}\n\n"
        return markdown_result.strip()

    print(
        f"[{user_id}] Mindmap: Calling LLM to generate headers for {actual_num_clusters} clusters..."
    )
    for i in range(actual_num_clusters):
        cluster_content = combined_chunks.get(i, "").strip()
        if not cluster_content:
            print(f"[{user_id}] Mindmap: Bỏ qua cluster {i} vì nội dung rỗng.")
            continue

        print(f"  - Processing cluster {i}...")
        try:
            # Có thể cần điều chỉnh prompt này
            system_prompt = (
                "Bạn là trợ lý AI giỏi tạo cấu trúc Markdown. "
                "Dựa vào nội dung sau, hãy tạo các tiêu đề cấp 1 (#), cấp 2 (##), cấp 3 (###) phù hợp "
                "để tóm tắt cấu trúc ý chính. Giữ lại nội dung chi tiết dưới các tiêu đề đó. "
                "Đảm bảo thứ tự tiêu đề hợp lý (# -> ## -> ###)."
            )
            user_prompt = f"Nội dung cụm {i+1}:\n{cluster_content}"

            # Gọi LLM (sync hoặc async tùy thuộc llm.invoke)
            # Giả sử llm.invoke là sync, chạy trong thread nếu cần
            completion = await asyncio.to_thread(
                llm.invoke,
                [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            )

            formatted_text = completion.content
            # Hàm add_hashtag_to_header có thể không cần thiết nếu LLM trả về đúng format
            markdown_result += (
                formatted_text + "\n\n"
            )  # Thêm khoảng cách giữa các cluster
        except Exception as e:
            print(f"[{user_id}] Mindmap: Lỗi khi xử lý LLM cho cluster {i}: {e}")
            # Thêm nội dung gốc nếu LLM lỗi
            markdown_result += (
                f"## Cluster {i+1} (Error Generating Headers)\n{cluster_content}\n\n"
            )

    return markdown_result.strip()
