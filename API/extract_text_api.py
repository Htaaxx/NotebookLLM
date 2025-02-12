from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
import os
import fitz
import docx
import re
import unicodedata

app = FastAPI()

class PageData(BaseModel):
    page_id: int
    text: str

class FileContentResponse(BaseModel):
    file_id: str
    pages: list[PageData]

import re
import unicodedata

def clean_transcript(text: str) -> str:
    text = unicodedata.normalize("NFKC", text)
    text = re.sub(r"\s+", " ", text).strip()
    text = re.sub(r"\n+", " ", text)
    text = re.sub(r"\s*([,.!?;:])\s*", r"\1 ", text)
    return text

def extract_text_from_pdf(file_path):
    doc = fitz.open(file_path)
    return {page_number + 1: clean_transcript(page.get_text("text")) for page_number, page in enumerate(doc)}

def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    return {i + 1: clean_transcript(para.text) for i, para in enumerate(doc.paragraphs) if para.text.strip()}

def extract_text_from_txt(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    return {i + 1: clean_transcript(line.strip()) for i, line in enumerate(lines) if line.strip()}

@app.post("/extract_text/", response_model=FileContentResponse)
async def extract_text(file: UploadFile = File(...)):
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in ["pdf", "docx", "txt"]:
        raise HTTPException(status_code=400, detail="Just support PDF, DOCX, TXT")

    file_path = f"temp_{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())

    try:
        if file_extension == "pdf":
            text_data = extract_text_from_pdf(file_path)
        elif file_extension == "docx":
            text_data = extract_text_from_docx(file_path)
        elif file_extension == "txt":
            text_data = extract_text_from_txt(file_path)
    finally:
        os.remove(file_path)

    response = {
        "file_id": file.filename,
        "pages": [{"page_id": page_id, "text": text} for page_id, text in text_data.items()]
    }
    return response

# uvicorn extract_text_api:app --reload