import { Client } from "minio";
import dotenv from "dotenv";

dotenv.config();

const minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT.replace("http://", "").replace("https://", ""),
    port: parseInt(process.env.MINIO_PORT, 10),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});

const uploadFile = async (file) => {
    try {
        const bucketName = process.env.MINIO_BUCKET_NAME;

        // Kiểm tra nếu bucket chưa tồn tại thì tạo mới
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) {
            await minioClient.makeBucket(bucketName);
            console.log(`Bucket '${bucketName}' created.`);
        }

        const metaData = { "Content-Type": file.mimetype };

        await minioClient.putObject(bucketName, file.originalname, file.buffer, metaData);
        return `File ${file.originalname} uploaded successfully to MinIO Local!`;
    } catch (error) {
        throw new Error("Upload failed: " + error.message);
    }
};

export { minioClient, uploadFile };
