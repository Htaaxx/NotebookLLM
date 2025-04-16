# File: app/services/status_tracking.py
import time
from typing import Optional, List, Dict, Any
from pymongo.collection import Collection as MongoCollection

# Import connections để lấy mongo collection
from ..core.connections import get_mongo_collection  # <<< Đường dẫn mới chính xác


def get_selected_document_ids(
    user_id: str, mongo_coll: Optional[MongoCollection]  # Nhận mongo_coll làm tham số
) -> List[str]:
    """
    Truy vấn MongoDB để lấy danh sách các document_id có trường 'status' là 1 (số nguyên)
    cho user_id cụ thể.
    """
    if mongo_coll is None:
        print(
            f"[{user_id}] Lỗi: Không thể truy vấn MongoDB status (collection is None)."
        )
        return []

    selected_ids = []
    try:
        cursor = mongo_coll.find(
            {"user_id": user_id, "status": 1},
            {"document_id": 1, "_id": 0},
        )
        selected_ids = [doc["document_id"] for doc in cursor if "document_id" in doc]
        # print(f"[{user_id}] Found {len(selected_ids)} documents with status=1.")
    except Exception as e:
        print(f"[{user_id}] Lỗi khi truy vấn MongoDB lấy doc_id status=1: {e}")
        return []
    return selected_ids


def update_processing_status(
    user_id: str, doc_id: str, status: str, error_message: Optional[str] = None
):
    """(Đồng bộ) Cập nhật trạng thái xử lý vào MongoDB."""
    # Lấy collection bên trong hàm này
    mongo_coll = get_mongo_collection()
    if mongo_coll is None:
        print(
            f"[{doc_id}] Không thể cập nhật trạng thái: MongoDB collection không hợp lệ."
        )
        return

    update_data = {"$set": {"processing_status": status, "last_updated": time.time()}}
    if error_message:
        update_data["$set"]["error_message"] = error_message
    else:
        # Xóa thông báo lỗi cũ nếu xử lý thành công
        update_data["$unset"] = {"error_message": ""}

    try:
        result = mongo_coll.update_one(
            {"user_id": user_id, "document_id": doc_id},
            update_data,
            upsert=True,  # Tạo mới nếu chưa có document status
        )
        # print(f"[{doc_id}] Updated MongoDB status: '{status}'. Matched={result.matched_count}, Modified={result.modified_count}, UpsertedId={result.upserted_id}")
    except Exception as e:
        print(f"[{doc_id}] Lỗi khi cập nhật trạng thái MongoDB: {e}")
