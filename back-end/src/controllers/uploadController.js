require("dotenv").config({ path: ".env.local" });
const cloudinary = require("cloudinary").v2;
const multer = require("multer");

// Setup Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Setup Multer to store temp file in memory
const storage = multer.memoryStorage();
const upload = multer({ storage }).single("file");

// API upload file to Cloudinary
const uploadFile = async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err) return res.status(500).json({ error: err.message });

            const { document_id } = req.body;

            if (!document_id) return res.status(400).json({ error: "Missing document_id" });

            cloudinary.uploader.upload_stream(
                { 
                    resource_type: "auto",
                    public_id: document_id || undefined
                }, 
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error);
                        return res.status(500).json({ error });
                    }
                    res.json({ url: result.secure_url, document_id: result.public_id });
                }
            ).end(req.file.buffer);
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: error.message });
    }
};


// API delete file in Cloudinary
const deleteFile = async (req, res) => {
    try {
        const { document_id } = req.body;
        if (!document_id) return res.status(400).json({ error: "Missing document_id" });

        await cloudinary.uploader.destroy(document_id);
        res.json({ message: "Document deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// API get list file - document_id
const getFiles = async (req, res) => {
    try {
        const { document_ids } = req.body;

        if (!Array.isArray(document_ids) || document_ids.length === 0) {
            return res.status(400).json({ error: "document_ids must be a non-empty array" });
        }

        const options = { max_results: 50 };

        const result = await cloudinary.api.resources(options);

        const matchedFiles = result.resources.filter(file => document_ids.includes(file.public_id));

        res.json({ files: matchedFiles });
    } catch (error) {
        console.error("Error fetching files:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { uploadFile, deleteFile, getFiles};
