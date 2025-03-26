# Tóm tắt Open3DIS: Open-Vocabulary 3D Instance Segmentation with 2D Mask Guidance

## 1. Giới thiệu
- Open3DIS là phương pháp mới cho **phân đoạn thể hiện 3D mở rộng từ vựng** (OV-3DIS).
- Kết hợp dữ liệu từ **đám mây điểm 3D** và **mạng phân đoạn ảnh 2D** để cải thiện chất lượng phân đoạn.

## 2. Vấn đề & Giải pháp
### 2.1. Vấn đề
- Các phương pháp hiện tại (OpenMask3D, OVIR-3D) gặp khó khăn với:
  - Đối tượng nhỏ hoặc không phổ biến.
  - Hạn chế của mô hình 3D truyền thống.
### 2.2. Giải pháp của Open3DIS
- **Kết hợp phân đoạn từ 2D và 3D**: Ánh xạ mặt nạ thể hiện 2D vào không gian 3D.
- **Mô-đun đề xuất thể hiện 3D dẫn hướng bởi 2D**: Tổng hợp các mặt nạ 2D từ nhiều khung hình để cải thiện chất lượng phân đoạn 3D.
- **Trích xuất đặc trưng điểm ảnh (Pointwise Feature Extraction)**: Tạo không gian đặc trưng CLIP để so khớp với truy vấn văn bản.

## 3. Kết quả & Đánh giá
### 3.1. Hiệu suất
- Open3DIS đạt **hiệu suất vượt trội** trên bộ dữ liệu **ScanNet200, S3DIS, Replica**.
- Vượt trội hơn **1.5 lần** so với phương pháp trước trên ScanNet200.
### 3.2. Lợi ích của kết hợp 2D & 3D
- Cải thiện đáng kể độ chính xác, đặc biệt với **các lớp đối tượng hiếm**.

## 4. Kết luận & Hướng phát triển
### 4.1. Kết luận
- Open3DIS mở rộng khả năng phân đoạn 3D sang một phạm vi từ vựng mở.
### 4.2. Hướng phát triển
- **Tích hợp chặt chẽ hơn giữa mô-đun 3D và 2D** để tối ưu hóa quá trình xử lý.

