import numpy as np
import fitz  # PyMuPDF (Fast text extraction)
import easyocr
import pdfplumber
import io
import re
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from pdf2image import convert_from_bytes
from PIL import Image
import multiprocessing

app = FastAPI()

# Initialize EasyOCR reader
reader = easyocr.Reader(["en", "vi"])


def clean_ocr_text(text):
    """Cleans OCR text output."""
    text = re.sub(r"\n+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def extract_text_pdf(file_bytes):
    """Extracts text from a native text-based PDF."""
    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text.strip()


def pil_to_numpy(image):
    """Converts a PIL image to a NumPy array."""
    return np.array(image)


def ocr_image(image):
    """Extracts text from an image using EasyOCR."""
    np_image = pil_to_numpy(image)
    result = reader.readtext(np_image)
    return " ".join([res[1] for res in result])


def ocr_pdf(file_bytes):
    """Performs OCR on a scanned PDF."""
    images = convert_from_bytes(file_bytes, dpi=300)
    with multiprocessing.Pool() as pool:
        text_list = pool.map(ocr_image, images)  # Process pages in parallel
    return " ".join(text_list)


@app.post("/ocr/")
async def ocr(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()

        if file.content_type == "application/pdf":
            extracted_text = extract_text_pdf(file_bytes)
            if extracted_text:  # If text is found, return it
                cleaned_text = clean_ocr_text(extracted_text)
                return {"text": cleaned_text}

            # Otherwise, apply OCR (for scanned PDFs)
            text = ocr_pdf(file_bytes)

        elif file.content_type.startswith("image/"):
            image = Image.open(io.BytesIO(file_bytes))
            text = ocr_image(image)

        else:
            return JSONResponse(
                status_code=400, content={"message": "Unsupported file type."}
            )

        cleaned_text = clean_ocr_text(text)
        return {"text": cleaned_text}

    except Exception as e:
        return JSONResponse(
            status_code=500, content={"message": f"An error occurred: {str(e)}"}
        )
