import os
from .rag_logic.core.connections import (
    llm,
    get_user_vector_store,
)

from langchain_core.prompts import ChatPromptTemplate
from typing import List, Dict, Optional

# (Tạm thời) Session Management đơn giản bằng Dictionary
# Thực tế nên dùng Redis hoặc DB
active_sessions: Dict[str, Dict] = {}


# Ví dụ sửa đổi hàm start_recall_session
def start_recall_session(user_id: str, topic: str, session_id: str) -> Optional[str]:
    """Bắt đầu phiên recall, lấy context TỪ COLLECTION CỦA USER."""
    try:
        # 1. Lấy context từ RAG của user
        vector_store = get_user_vector_store(user_id)  # Lấy store của user
        retrieved_docs = vector_store.similarity_search(topic, k=5)
        if not retrieved_docs:
            print(
                f"No context found for topic '{topic}' in user '{user_id}' collection."
            )
            return None

        context = "\n\n".join([doc.page_content for doc in retrieved_docs])

        # 2. Tạo câu hỏi (giữ nguyên)
        first_question = generate_recall_question(topic, context)
        if not first_question:
            return None

        # 3. Lưu session (có thể thêm user_id vào session data nếu cần)
        active_sessions[session_id] = {
            "user_id": user_id,  # Lưu user_id vào session
            "topic": topic,
            "context": context,  # Context này là của user
            "last_question": first_question,
            "history": [],
        }
        print(f"Session {session_id} started for user '{user_id}', topic '{topic}'.")
        return first_question

    except Exception as e:
        print(
            f"Error starting recall session for user '{user_id}', topic '{topic}': {e}"
        )
        return None


def generate_recall_question(topic: str, context: str) -> Optional[str]:
    """Sử dụng LLM để tạo câu hỏi active recall."""
    prompt_template = ChatPromptTemplate.from_template(
        """Bạn là một trợ lý học tập chuyên về Active Recall.
        Dựa vào thông tin dưới đây về chủ đề "{topic}", hãy tạo ra MỘT câu hỏi mở, sâu sắc để giúp người dùng chủ động gợi nhớ kiến thức.
        Câu hỏi nên khuyến khích giải thích, so sánh, hoặc nêu ví dụ, không chỉ hỏi sự kiện đơn lẻ.

        Context Tham Khảo:
        ---
        {context}
        ---

        Câu hỏi gợi nhớ (chỉ trả về câu hỏi):"""
    )
    try:
        chain = prompt_template | llm
        response = chain.invoke({"topic": topic, "context": context})
        question = response.content.strip()
        # Có thể thêm kiểm tra/lọc kết quả nếu LLM trả về nhiều hơn 1 câu
        return question if question else None
    except Exception as e:
        print(f"Error generating recall question: {e}")
        return None


def evaluate_answer(question: str, user_answer: str, context: str) -> str:
    """Sử dụng LLM để đánh giá câu trả lời dựa trên context."""
    prompt_template = ChatPromptTemplate.from_template(
        """Bạn là một người đánh giá kiến thức khách quan.
        Câu hỏi được đặt ra là: "{question}"
        Câu trả lời của người dùng là: "{user_answer}"

        Dựa CHỦ YẾU vào Context Tham Khảo dưới đây, hãy đánh giá câu trả lời của người dùng:
        1. Mức độ chính xác so với context?
        2. Mức độ đầy đủ (có bỏ sót ý quan trọng trong context không)?
        3. Đưa ra nhận xét ngắn gọn và mang tính xây dựng (ví dụ: "Chính xác và đầy đủ", "Khá tốt nhưng cần bổ sung ý...", "Chưa chính xác, hãy xem lại phần...", "Câu trả lời lạc đề").

        Context Tham Khảo:
        ---
        {context}
        ---

        Đánh giá của bạn:"""
    )
    try:
        chain = prompt_template | llm
        response = chain.invoke(
            {"question": question, "user_answer": user_answer, "context": context}
        )
        return response.content.strip()
    except Exception as e:
        print(f"Error evaluating answer: {e}")
        return "Lỗi trong quá trình đánh giá."


def list_key_points(topic: str, context: str) -> List[str]:
    """Sử dụng LLM để liệt kê các điểm chính."""
    prompt_template = ChatPromptTemplate.from_template(
        """Dựa vào Context Tham Khảo về chủ đề "{topic}", hãy liệt kê các ý chính hoặc khái niệm quan trọng nhất dưới dạng gạch đầu dòng ngắn gọn.

          Context Tham Khảo:
          ---
          {context}
          ---

          Các ý chính (mỗi ý trên một dòng bắt đầu bằng '-'):"""
    )
    try:
        chain = prompt_template | llm
        response = chain.invoke({"topic": topic, "context": context})
        points = [
            p.strip("- ").strip()
            for p in response.content.strip().split("\n")
            if p.strip()
        ]
        return points
    except Exception as e:
        print(f"Error listing key points: {e}")
        return ["Lỗi khi tóm tắt ý chính."]


def process_user_answer(session_id: str, user_answer: str) -> Dict:
    """Xử lý câu trả lời, đánh giá và quyết định bước tiếp theo."""
    if session_id not in active_sessions:
        return {"error": "Session not found."}

    session_data = active_sessions[session_id]
    last_question = session_data["last_question"]
    context = session_data["context"]
    topic = session_data["topic"]

    # 1. Đánh giá câu trả lời
    feedback = evaluate_answer(last_question, user_answer, context)

    # 2. (Tùy chọn) Liệt kê key points
    key_points = list_key_points(topic, context)

    # 3. (Tùy chọn) Tạo câu hỏi tiếp theo
    # Logic đơn giản: luôn tạo câu hỏi mới cho cùng topic
    next_question = generate_recall_question(topic, context)
    if next_question:
        active_sessions[session_id][
            "last_question"
        ] = next_question  # Cập nhật câu hỏi mới cho session
        active_sessions[session_id].setdefault("history", []).append(
            {"question": last_question, "answer": user_answer, "feedback": feedback}
        )

    # Xóa session nếu không có câu hỏi tiếp theo? Hoặc để client quyết định?
    # if not next_question:
    #     del active_sessions[session_id]

    return {
        "feedback": feedback,
        "key_points": key_points,
        "next_question": next_question,
    }


def get_session(session_id: str) -> Optional[Dict]:
    return active_sessions.get(session_id)


def end_session(session_id: str):
    if session_id in active_sessions:
        del active_sessions[session_id]
        print(f"Session {session_id} ended.")
