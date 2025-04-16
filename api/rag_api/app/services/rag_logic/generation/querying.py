# File: app/services/rag_logic/generation/querying.py
import re
import traceback
from typing import List, Dict, Any, Optional, Tuple
from langchain_core.prompts import ChatPromptTemplate

from ..core import config  # <<< Sửa đường dẫn
from ..core.connections import (
    llm,
    get_user_vector_store,
    get_user_milvus_collection,
    get_mongo_collection,
)
from ..processing.status_tracking import get_selected_document_ids  # <<< Sửa đường dẫn

# --- Prompts ---
# ... (Định nghĩa prompt và SUMMARIZATION_PROMPT_TEMPLATE như trước) ...
prompt = ChatPromptTemplate.from_template(
    """
Bạn là chuyên gia phân tích tài liệu. Nhiệm vụ của bạn là trả lời câu hỏi của người dùng.

**QUAN TRỌNG:** Trước tiên, hãy đánh giá câu hỏi của người dùng ({question}).
1.  **Nếu câu hỏi không rõ ràng, quá ngắn, không có ngữ nghĩa cụ thể để tìm kiếm thông tin (ví dụ: 'hello', '?', 'abc', 'bạn khỏe không?'), hoặc chỉ là lời chào hỏi đơn thuần:**
    * **BỎ QUA HOÀN TOÀN** phần TÀI LIỆU THAM KHẢO dưới đây.
    * **CHỈ trả lời MỘT TRONG CÁC CÂU SAU:** "Yêu cầu không có ngữ nghĩa." hoặc "Chưa xác định rõ yêu cầu của bạn, vui lòng cung cấp câu hỏi cụ thể hơn." (Chọn một câu phù hợp).
    * **KHÔNG** thêm bất kỳ thông tin nào khác, không giải thích, không thêm citation.

2.  **Nếu câu hỏi có vẻ hợp lệ và có thể trả lời được dựa trên tài liệu:**
    * Hãy sử dụng các TÀI LIỆU THAM KHẢO ({context}) để trả lời chi tiết cho câu hỏi ({question}).
    * **TUÂN THỦ NGHIÊM NGẶT CÁC YÊU CẦU SAU:**
        * Sử dụng chú thích vuông [number] NGAY SAU thông tin được lấy từ tài liệu tham khảo. Ví dụ: Fact A [1], Claim B [2].
        * Mỗi fact/claim trong câu trả lời PHẢI CÓ ít nhất một citation [number] tương ứng.
        * Giữ nguyên số citation [number] đã được đánh dấu trong phần TÀI LIỆU THAM KHẢO khi bạn trích dẫn chúng.
        * Câu trả lời phải chi tiết, mạch lạc.
        * Cuối cùng, thêm phần `REFERENCES:` liệt kê đầy đủ các tài liệu đã được trích dẫn trong câu trả lời, theo đúng format:
            [1] File: "tên file", Trang: X, Nội dung: "trích đoạn ngắn gọn từ context"
            [2] File: ... (tương tự)
            (Chỉ liệt kê những citation [number] bạn đã thực sự dùng trong câu trả lời).

CÂU HỎI: {question}

TÀI LIỆU THAM KHẢO (Chỉ dùng nếu câu hỏi hợp lệ):
{context}

CÂU TRẢ LỜI CỦA BẠN:
"""
)

SUMMARIZATION_PROMPT_TEMPLATE = ChatPromptTemplate.from_template(
    """Bạn là một trợ lý AI giỏi tóm tắt văn bản. Dựa vào nội dung dưới đây được trích xuất từ một tài liệu, hãy viết một bản tóm tắt ngắn gọn, nêu bật những ý chính và thông tin quan trọng nhất.

NỘI DUNG TÀI LIỆU:
---
{document_content}
---

BẢN TÓM TẮT (Ngắn gọn, súc tích):
"""
)


# --- Helper Functions ---
def check_summarization_intent(question: str) -> bool:
    """Kiểm tra xem câu hỏi có phải là yêu cầu tóm tắt không."""
    # ... (code hàm như trước, sử dụng config.SUMMARIZATION_KEYWORDS) ...
    query_lower = question.lower()
    for keyword in config.SUMMARIZATION_KEYWORDS:
        if keyword in query_lower:
            return True
    return False


def get_content_and_filename(
    user_id: str, doc_id: str
) -> Tuple[Optional[str], Optional[str]]:
    """Lấy toàn bộ nội dung text và filename của các chunks cho một doc_id."""
    # ... (code hàm như trước, gọi get_user_milvus_collection) ...
    collection = get_user_milvus_collection(user_id)
    if collection is None:
        print(f"[{doc_id}] Collection for user {user_id} not found.")
        return None, None
    try:
        collection.load()
        results = collection.query(
            expr=f'doc_id == "{doc_id}"',
            output_fields=["content", "page_number", "chunk_index", "filename"],
        )
        if not results:
            print(f"[{doc_id}] No chunks found in Milvus.")
            return None, None
        results.sort(key=lambda x: (x.get("page_number", 0), x.get("chunk_index", 0)))
        filename = results[0].get("filename") if results else None
        full_content = "\n\n".join([res.get("content", "") for res in results])
        return full_content, filename
    except Exception as e:
        print(f"[{doc_id}] Error retrieving content/filename: {e}")
        return None, None


def ask_question(
    user_id: str, question: str, headers: List[str] = []
) -> Dict[str, Any]:
    """Trả lời câu hỏi RAG hoặc tóm tắt, trả về cấu trúc dict."""
    # ... (Code hàm ask_question đầy đủ như đã sửa ở các bước trước) ...
    # ... (Đảm bảo gọi đúng các hàm đã import: llm, check_summarization_intent, ...) ...
    # ... (get_mongo_collection, get_selected_document_ids, get_content_and_filename, ...) ...
    # ... (get_user_vector_store, prompt, ...) ...
    # ... (Phần xử lý RAG, chuẩn bị context, gọi LLM, phân tích citation, re-index) ...
    if llm is None:
        return {"answer": "Lỗi: LLM chưa được khởi tạo.", "citations": {}}
    if check_summarization_intent(question):
        print(f"[{user_id}] Intent: Summarization")
        mongo_coll = get_mongo_collection()
        if mongo_coll is None:
            return {"answer": "Lỗi kết nối DB.", "citations": {}}
        selected_ids = get_selected_document_ids(user_id, mongo_coll)
        if not selected_ids:
            return {"answer": "Chọn tài liệu để tóm tắt.", "citations": {}}
        elif len(selected_ids) > 1:
            doc_list_str = ", ".join(selected_ids[:3]) + (
                "..." if len(selected_ids) > 3 else ""
            )
            return {
                "answer": f"Chọn 1 tài liệu ({len(selected_ids)}): {doc_list_str}.",
                "citations": {},
            }
        else:
            target_doc_id = selected_ids[0]
            print(f"[{user_id}] Target for summarization: {target_doc_id}")
            full_content, target_filename = get_content_and_filename(
                user_id, target_doc_id
            )
            if full_content is None:
                return {
                    "answer": f"Không lấy được nội dung doc ID '{target_doc_id}'.",
                    "citations": {},
                }
            display_name = (
                f"'{target_filename}'" if target_filename else f"ID {target_doc_id}"
            )
            try:
                messages = SUMMARIZATION_PROMPT_TEMPLATE.invoke(
                    {"document_content": full_content}
                )
                summary_response = llm.invoke(messages)
                return {
                    "answer": f"**Tóm tắt {display_name}:**\n\n{summary_response.content}",
                    "citations": {},
                }
            except Exception as e:
                print(f"[{user_id}] Lỗi LLM tóm tắt doc {target_doc_id}: {e}")
                return {"answer": f"Lỗi khi tóm tắt {display_name}.", "citations": {}}
    else:  # RAG
        print(f"[{user_id}] Intent: RAG Query")
        vector_store = get_user_vector_store(user_id)
        if vector_store is None:
            return {"answer": "Lỗi vector store.", "citations": {}}
        mongo_coll = get_mongo_collection()
        if mongo_coll is None:
            return {"answer": "Lỗi kết nối DB.", "citations": {}}
        selected_ids = get_selected_document_ids(user_id, mongo_coll)
        if not selected_ids:
            return {"answer": "Chọn tài liệu để tìm kiếm.", "citations": {}}
        else:
            selected_ids_str = ", ".join([f'"{id_}"' for id_ in selected_ids])
            search_filter_expr = f"doc_id in [{selected_ids_str}]"
            print(f"[{user_id}] Filter: {search_filter_expr}")
        try:
            search_kwargs = {"expr": search_filter_expr}
            k_value = 10
            retrieved_docs = vector_store.similarity_search(
                query=question, k=k_value, search_kwargs=search_kwargs
            )
        except Exception as e:
            print(f"[{user_id}] Lỗi similarity search: {e}")
            return {"answer": f"Lỗi tìm kiếm: {e}", "citations": {}}
        if not retrieved_docs:
            return {"answer": "Không tìm thấy thông tin liên quan.", "citations": {}}
        docs_for_context = retrieved_docs
        context_parts = []
        source_mapping = {}
        print(f"[{user_id}] Preparing context from {len(docs_for_context)} docs.")
        for idx, doc in enumerate(docs_for_context, 1):
            metadata = doc.metadata
            filename = metadata.get("filename", "N/A")
            page_number_raw = metadata.get("page_number")
            page_number = -1
            try:
                page_number = (
                    int(page_number_raw) if page_number_raw is not None else -1
                )
            except:
                pass
            doc_id = metadata.get("doc_id", "N/A")
            chunk_id = metadata.get("chunk_id", None)
            content = doc.page_content
            context_parts.append(
                f"[DOCUMENT {idx}]\nFile: {filename}\nPage: {page_number}\nContent: {content[:400]}..."
            )
            source_mapping[idx] = {
                "doc_id": doc_id,
                "chunk_id": chunk_id,
                "page_number": page_number,
                "filename": filename,
                "content_preview": content[:200] + "...",
            }
        context_string = "\n\n".join(context_parts)
        try:
            print(f"[{user_id}] Calling LLM RAG...")
            messages = prompt.invoke({"question": question, "context": context_string})
            llm_response = llm.invoke(messages)
            llm_response_content = llm_response.content
            print(f"[{user_id}] LLM RAG OK.")
        except Exception as e:
            print(f"[{user_id}] Lỗi LLM RAG: {e}")
            return {"answer": f"Lỗi tạo câu trả lời: {e}", "citations": {}}
        answer_text_raw = llm_response_content
        references_section = ""
        citations_details_raw = {}
        new_citations_details = {}
        old_to_new_mapping = {}
        ref_marker = "REFERENCES:"
        ref_pos = llm_response_content.upper().rfind(ref_marker.upper())
        if ref_pos != -1:
            answer_text_raw = llm_response_content[:ref_pos].strip()
            references_section = llm_response_content[
                ref_pos + len(ref_marker) :
            ].strip()
            print(f"[{user_id}] Parsing REFERENCES...")
            ref_line_pattern = re.compile(r"^\s*\[(\d+)\]\s*(.*)$")
            parsed_citations_nums_int = set()
            for line in references_section.splitlines():
                match = ref_line_pattern.match(line)
                if match:
                    try:
                        citation_number_str = match.group(1)
                        citation_number_int = int(citation_number_str)
                        if citation_number_int not in parsed_citations_nums_int:
                            original_source = source_mapping.get(citation_number_int)
                            if original_source:
                                citations_details_raw[citation_number_str] = (
                                    original_source
                                )
                                parsed_citations_nums_int.add(citation_number_int)
                    except:
                        pass
            if citations_details_raw:
                sorted_old_keys_int = sorted(
                    [int(k) for k in citations_details_raw.keys()]
                )
                print(f"[{user_id}] Re-indexing {len(sorted_old_keys_int)} citations.")
                for new_idx, old_key_int in enumerate(sorted_old_keys_int, 1):
                    old_key_str = str(old_key_int)
                    new_key_str = str(new_idx)
                    old_to_new_mapping[old_key_str] = new_key_str
                    new_citations_details[new_key_str] = citations_details_raw[
                        old_key_str
                    ]

                def replace_citation(match):
                    old_num_str = match.group(1)
                    return f"[{old_to_new_mapping.get(old_num_str, old_num_str)}]"

                citation_pattern = re.compile(r"\[(\d+)\]")
                final_answer_text = citation_pattern.sub(
                    replace_citation, answer_text_raw
                )
            else:
                final_answer_text = answer_text_raw
        else:
            print(f"[{user_id}] Warning: No 'REFERENCES:' section found.")
            final_answer_text = answer_text_raw
        print(
            f"[{user_id}] Returning RAG answer with {len(new_citations_details)} citations."
        )
        return {"answer": final_answer_text, "citations": new_citations_details}
