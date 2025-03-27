const express = require("express");
const { uploadFile, deleteFile, getFiles } = require("../controllers/uploadController");

const router = express.Router();

// Route upload file to Cloudinary
router.post("/upload", uploadFile);

// Route delete file in Cloudinary
router.delete("/delete", deleteFile);

// Route get list files in Cloudinary
router.post("/getFiles", getFiles);

module.exports = router;
