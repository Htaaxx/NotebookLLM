const express = require("express");
const { uploadFile, deleteFile } = require("../controllers/uploadController");

const router = express.Router();

// Route upload file to Cloudinary
router.post("/upload", uploadFile);

// Route delete file in Cloudinary
router.delete("/delete", deleteFile);

module.exports = router;
