from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
import os
import re
import unicodedata
import docx
import pytesseract # Please download/install pytesseract before importing
import docx2txt
import PyPDF2
from PIL import Image

# If you are using windows, please change the path to suit your machine
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

app = FastAPI()

class PageData(BaseModel):
    page_id: int
    text: str

class FileContentResponse(BaseModel):
    file_id: str
    pages: list[PageData]

def clean_transcript(text: str) -> str:
    text = unicodedata.normalize("NFKC", text)
    text = re.sub(r"\s+", " ", text).strip()
    text = re.sub(r"\n+", " ", text)
    text = re.sub(r"\s*([,.!?;:])\s*", r"\1 ", text)
    return text

def extract_text_from_pdf(file_path: str):
    text_data = {}
    try:
        with open(file_path, "rb") as pdf_file:
            reader = PyPDF2.PdfReader(pdf_file)
            for page_id, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    text_data[page_id + 1] = clean_transcript(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading PDF: {str(e)}")

    return text_data

def extract_text_from_docx(file_path: str):
    text_data = {}

    try:
        doc = docx.Document(file_path)
        paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
        text_content = " ".join(clean_transcript(para) for para in paragraphs)
        if text_content:
            text_data[1] = text_content

        image_folder = "docx_images"
        os.makedirs(image_folder, exist_ok=True)
        docx2txt.process(file_path, image_folder)

        image_files = [f for f in os.listdir(image_folder) if f.endswith((".png", ".jpg", ".jpeg"))]
        extracted_text = ""

        for image_file in image_files:
            image_path = os.path.join(image_folder, image_file)
            ocr_text = pytesseract.image_to_string(Image.open(image_path), lang="eng")
            extracted_text += " " + clean_transcript(ocr_text)

        if extracted_text.strip():
            text_data[2] = extracted_text

        for image_file in image_files:
            os.remove(os.path.join(image_folder, image_file))
        os.rmdir(image_folder)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing DOCX: {str(e)}")

    return text_data

def extract_text_from_txt(file_path: str):
    text_data = {}
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            content = file.read()
            if content.strip():
                text_data[1] = clean_transcript(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading TXT: {str(e)}")

    return text_data

@app.post("/extract_text/", response_model=FileContentResponse)
async def extract_text(file: UploadFile = File(...)):
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in ["pdf", "docx", "txt"]:
        raise HTTPException(status_code=400, detail="Only supports PDF, DOCX, TXT")

    file_path = f"temp_{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())

    text_data = {}

    try:
        if file_extension == "pdf":
            text_data = extract_text_from_pdf(file_path)
        elif file_extension == "docx":
            text_data = extract_text_from_docx(file_path)
        elif file_extension == "txt":
            text_data = extract_text_from_txt(file_path)
    finally:
        os.remove(file_path)

    if not text_data:
        raise HTTPException(status_code=500, detail="No text extracted from the file")

    return {
        "file_id": file.filename,
        "pages": [{"page_id": page_id, "text": text} for page_id, text in text_data.items()]
    }

# Run API: uvicorn extract_file_content_api:app --reload
