from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import pytesseract
from pdf2image import convert_from_bytes
from PIL import Image
import io
import re

app = FastAPI()

# Configure the path to the Tesseract executable if necessary
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'


def clean_ocr_text(text):
    """
    Cleans up the OCR text by:
    - Removing excessive newlines.
    - Merging lines into paragraphs.
    - Trimming unnecessary whitespace.
    """
    # Replace multiple newlines with a single space
    text = re.sub(r"\n+", " ", text)

    # Replace multiple spaces with a single space
    text = re.sub(r"\s+", " ", text)

    # Trim leading and trailing whitespace
    text = text.strip()

    return text


@app.post("/ocr/")
async def ocr(file: UploadFile = File(...)):
    try:
        # Check if the uploaded file is a PDF or an image
        if file.content_type == "application/pdf":
            # Convert PDF pages to images
            images = convert_from_bytes(await file.read())
            text = ""
            for img in images:
                page_text = pytesseract.image_to_string(img)
                text += page_text + " "  # Add a space between pages
        elif file.content_type.startswith("image/"):
            # Read the image directly
            image = Image.open(io.BytesIO(await file.read()))
            text = pytesseract.image_to_string(image)
        else:
            return JSONResponse(
                status_code=400,
                content={
                    "message": "Unsupported file type. Please upload a PDF or an image."
                },
            )

        # Clean up the OCR text
        cleaned_text = clean_ocr_text(text)

        return {"text": cleaned_text}

    except Exception as e:
        return JSONResponse(
            status_code=500, content={"message": f"An error occurred: {str(e)}"}
        )


# Run with: uvicorn app:app --host 0.0.0.0 --port 8000
