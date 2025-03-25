import redis

# Kết nối tới Redis
r = redis.StrictRedis(host='localhost', port=6379, decode_responses=True)

# Nhập doc_id cần thay đổi
doc_id_to_update = "fef5d1d2-0908-40ab-96e7-308cdd740cc6"

# Lấy tất cả các khóa bắt đầu với "chunk:"
keys = r.keys("chunk:*")

# Duyệt qua từng key và cập nhật is_actives
for key in keys:
    doc_id = r.hget(key, "doc_id")
    if doc_id == doc_id_to_update:
        r.hset(key, "is_active", 0)

print(f"Updated all chunks with doc_id: {doc_id_to_update}")
