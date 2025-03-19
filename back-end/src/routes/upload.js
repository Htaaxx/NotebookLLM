import express from "express";
import multer from "multer";
import { uploadFile } from "../services/minioService.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const result = await uploadFile(req.file);
        res.json({ message: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
