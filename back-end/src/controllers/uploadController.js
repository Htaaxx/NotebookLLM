import multer from "multer";
import { uploadFile } from "../services/minioService";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadHandler = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await uploadFile("uploads", file);
    res.json({ message: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const youtubeLinks = [];

const saveYoutubeLink = (req, res) => {
  const { url } = req.body;
  if (!url || !url.includes("youtube.com")) {
    return res.status(400).json({ message: "Invalid YouTube URL" });
  }

  youtubeLinks.push(url);
  res.json({
    message: "YouTube link saved successfully!",
    links: youtubeLinks,
  });
};

export { upload, uploadHandler, saveYoutubeLink };
