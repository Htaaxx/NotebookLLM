const Redis = require("ioredis");
const redis = new Redis("redis://localhost:6379"); // URL Redis server

/**
 * Cập nhật trạng thái của tài liệu trong Redis
 * @param {string} docId - ID của tài liệu
 * @param {number} isActive - Giá trị mới cho is_active (0 hoặc 1)
 */
async function updateDocumentStatus(docId, isActive) {
  try {
    // Lấy tất cả các key liên quan đến docId
    const keys = await redis.keys(`chunk:${docId}-*`);
    if (keys.length === 0) {
      throw new Error(`Document with docId=${docId} not found.`);
    }

    // Cập nhật trạng thái is_active cho từng chunk
    for (const key of keys) {
      const chunk = JSON.parse(await redis.get(key)); // Lấy dữ liệu chunk
      chunk.is_active = isActive; // Cập nhật is_active
      await redis.set(key, JSON.stringify(chunk)); // Lưu lại vào Redis
    }

    console.log(`Document ${docId} status updated to ${isActive}.`);
    return { message: `Document ${docId} status updated to ${isActive}.` };
  } catch (error) {
    console.error("Error updating document status:", error.message);
    throw error;
  }
}

// Ví dụ sử dụng
(async () => {
  try {
    const result = await updateDocumentStatus("123abc", 0); // Chuyển trạng thái is_active = 0
    console.log(result);
  } catch (error) {
    console.error(error);
  } finally {
    redis.disconnect();
  }
})();
