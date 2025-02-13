const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const app = express();
const port = 3000;

// Cấu hình multer để xử lý file upload
const upload = multer({ dest: "uploads/" });

// Route upload file để gửi đến API OCR của FastAPI
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng tải lên một tệp tin" });
        }

        // Tạo FormData để gửi file đến FastAPI
        const formData = new FormData();
        formData.append("file", fs.createReadStream(req.file.path), req.file.originalname);

        // Gửi file đến API OCR chạy trên FastAPI (Uvicorn)
        const response = await axios.post("http://127.0.0.1:8000/ocr/", formData, {
            headers: {
                ...formData.getHeaders(),  // Thêm header từ formData
            },
        });

        // Xóa file sau khi upload xong
        fs.unlinkSync(req.file.path);

        // Trả kết quả từ FastAPI về cho client
        res.json(response.data);

    } catch (error) {
        console.error("Lỗi khi gọi API OCR:", error.message);
        res.status(500).json({ message: "Lỗi xử lý OCR", error: error.message });
    }
});

// Khởi động server Express
app.listen(port, () => {
    console.log(`🚀 Server Express chạy tại http://localhost:${port}`);
});
