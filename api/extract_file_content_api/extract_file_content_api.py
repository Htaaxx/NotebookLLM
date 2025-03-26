from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import os
import re
import unicodedata
import docx
import pytesseract  # Please download/install pytesseract before importing
import docx2txt
import PyPDF2
from PIL import Image

# Langchain
from langchain.text_splitter import RecursiveCharacterTextSplitter
import fitz

# If you are using windows, please change the path to suit your machine
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

app = FastAPI()


class ChunkWithMetadata(BaseModel):
    page_number: int
    bounding_box: List[float] = None
    text: str

class FileContentResponse(BaseModel):
    file_id: str
    chunks: List[ChunkWithMetadata] # Định nghĩa đúng cấu trúc trả về


def clean_transcript(text: str) -> str:
    text = unicodedata.normalize("NFKC", text)
    text = re.sub(r"\s+", " ", text).strip()
    text = re.sub(r"\n+", " ", text)
    text = re.sub(r"\s*([,.!?;:])\s*", r"\1 ", text)
    
    unwanted_chars = ["", "•"]
    for char in unwanted_chars:
        text = text.replace(char, "")

    return text


def extract_text_from_pdf(file_path: str):
    """
    Extract text from a PDF file, split it into chunks, and include bounding box metadata.
    """
    chunks_with_metadata = []
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=2500, chunk_overlap=200)

    try:
        # Mở tài liệu PDF
        pdf_document = fitz.open(file_path)

        for page_id in range(len(pdf_document)):
            page = pdf_document[page_id]

            # Trích xuất các block văn bản với thông tin bounding box
            blocks = page.get_text("blocks")  # List các block: [(x0, y0, x1, y1, "text", ...)]

            # Ghép tất cả các block trên trang thành một chuỗi văn bản duy nhất
            page_text = ""
            bounding_boxes = []

            for block in blocks:
                x0, y0, x1, y1, block_text = *block[:4], block[4]
                block_text = block_text.strip()
                if block_text:
                    page_text += block_text + "\n"  # Ghép block vào chuỗi văn bản
                    bounding_boxes.append([x0, y0, x1, y1])  # Lưu bounding box

            # Nếu không có nội dung trên trang, bỏ qua
            if not page_text.strip():
                continue

            # Chia toàn bộ văn bản trang thành các chunk
            page_chunks = text_splitter.split_text(clean_transcript(page_text))

            # Tính bounding box bao phủ toàn bộ các block trên chunk
            for chunk in page_chunks:
                # Bounding box tổng hợp
                merged_bbox = merge_bounding_boxes(bounding_boxes)
                chunks_with_metadata.append({
                    "page_number": page_id + 1,  # Số trang (bắt đầu từ 1)
                    "bounding_box": merged_bbox,  # Bounding box tổng hợp
                    "text": chunk,  # Nội dung chunk
                })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading PDF: {str(e)}")

    return chunks_with_metadata


def merge_bounding_boxes(bounding_boxes):
    """
    Tính bounding box tổng hợp bao phủ tất cả các bounding box trên một chunk.
    """
    if not bounding_boxes:
        return None
    x0 = min(b[0] for b in bounding_boxes)
    y0 = min(b[1] for b in bounding_boxes)
    x1 = max(b[2] for b in bounding_boxes)
    y1 = max(b[3] for b in bounding_boxes)
    return [x0, y0, x1, y1]


import os
import pytesseract
from PIL import Image
import docx
from langchain.text_splitter import RecursiveCharacterTextSplitter

def extract_text_from_docx(file_path: str):
    """
    Extract text and images from a DOCX file, split into chunks, and add metadata (including bounding box).
    """
    chunks_with_metadata = []
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=2500, chunk_overlap=200)

    try:
        # Extract paragraphs from DOCX
        doc = docx.Document(file_path)
        paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
        doc_text = " ".join(clean_transcript(para) for para in paragraphs)
        
        # Split text into chunks with metadata
        if doc_text.strip():
            doc_chunks = text_splitter.split_text(doc_text)
            for chunk in doc_chunks:
                chunks_with_metadata.append({
                    "page_number": 1,  # DOCX không có khái niệm trang, mặc định là trang 1
                    "bounding_box": None,  # Không có thông tin bounding box cho văn bản
                    "text": chunk
                })

        # Extract text from images in the DOCX
        image_folder = "docx_images"
        os.makedirs(image_folder, exist_ok=True)
        docx2txt.process(file_path, image_folder)

        # OCR on extracted images
        image_files = [
            f for f in os.listdir(image_folder) if f.endswith((".png", ".jpg", ".jpeg"))
        ]
        ocr_text = ""
        for image_file in image_files:
            image_path = os.path.join(image_folder, image_file)
            ocr_text += " " + pytesseract.image_to_string(Image.open(image_path), lang="eng")
        
        if ocr_text.strip():
            ocr_chunks = text_splitter.split_text(clean_transcript(ocr_text))
            for chunk in ocr_chunks:
                chunks_with_metadata.append({
                    "page_number": 2,  # Đặt OCR từ hình ảnh là trang 2
                    "bounding_box": None,  # Không có thông tin bounding box cho OCR
                    "text": chunk
                })

        # Cleanup temporary image files
        for image_file in image_files:
            os.remove(os.path.join(image_folder, image_file))
        os.rmdir(image_folder)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing DOCX: {str(e)}")

    return chunks_with_metadata

def extract_text_from_txt(file_path: str):
    """
    Extract text from a TXT file, split into chunks, and add metadata (including bounding box).
    """
    chunks_with_metadata = []
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=2500, chunk_overlap=200)

    try:
        with open(file_path, "r", encoding="utf-8") as file:
            content = file.read()
            if content.strip():
                content = clean_transcript(content)
                txt_chunks = text_splitter.split_text(content)
                for chunk in txt_chunks:
                    chunks_with_metadata.append({
                        "page_number": 1,  # TXT không có khái niệm trang, mặc định là trang 1
                        "bounding_box": None,  # Không có thông tin bounding box cho văn bản TXT
                        "text": chunk
                    })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading TXT: {str(e)}")

    return chunks_with_metadata


def extract_text(file_content: str, filename: str): 
    """
    Process file and return chunks with metadata.
    """
    file_extension = filename.split(".")[-1].lower()
    if file_extension not in ["pdf", "docx", "txt"]:
        raise HTTPException(status_code=400, detail="Only supports PDF, DOCX, TXT")

    file_path = f"temp_{filename}"
    with open(file_path, "wb") as f:
        f.write(file_content)

    chunks_with_metadata = []

    try:
        if file_extension == "pdf":
            chunks_with_metadata = extract_text_from_pdf(file_path)
            print(chunks_with_metadata)
        elif file_extension == "docx":
            chunks_with_metadata = extract_text_from_docx(file_path)
        elif file_extension == "txt":
            chunks_with_metadata = extract_text_from_txt(file_path)
    finally:
        os.remove(file_path)


    if not chunks_with_metadata:
        raise HTTPException(status_code=500, detail="No text extracted from the file")

    return {
        "file_id": filename,
        "chunks": chunks_with_metadata,
    }



# @app.get("/")
# def read_root():
#     return {"message": "YouTube Transcript API is running"}

# Run API: uvicorn extract_file_content_api:app --reload
