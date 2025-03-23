const express = require("express");
const { uploadFile, deleteFile } = require("../controllers/uploadController");

const router = express.Router();

// Route upload file lên Cloudinary
router.post("/upload", uploadFile);

// Route xóa file trên Cloudinary
router.post("/delete", deleteFile);

module.exports = router;
