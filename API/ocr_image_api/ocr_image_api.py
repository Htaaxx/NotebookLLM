import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import io
import re
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from pdf2image import convert_from_bytes

app = FastAPI()


def clean_text(text):
    """Cleans OCR text output."""
    text = re.sub(r"\n+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def preprocess_image(image):
    """Enhances image quality for better OCR."""
    image = image.convert("L")  # Convert to grayscale
    image = ImageEnhance.Contrast(image).enhance(2)  # Increase contrast
    image = image.filter(ImageFilter.SHARPEN)  # Sharpen the image
    return image


def ocr_image(image):
    """Extracts text from an image using pytesseract."""
    image = preprocess_image(image)
    extracted_text = pytesseract.image_to_string(
        image, lang="vie+eng"
    )  # Specify languages as 'vie+eng'
    return clean_text(extracted_text)


def extract_text_pdf(file_bytes):
    """Extracts text from a native text-based PDF."""
    text = ""
    images = convert_from_bytes(file_bytes, dpi=300)
    for image in images:
        text += ocr_image(image)  # Process each page as an image
    return text


@app.post("/ocr/")
async def ocr(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()

        if file.content_type == "application/pdf":
            extracted_text = extract_text_pdf(file_bytes)

        elif file.content_type.startswith("image/"):
            image = Image.open(io.BytesIO(file_bytes))
            extracted_text = ocr_image(image)

        else:
            return JSONResponse(
                status_code=400, content={"message": "Unsupported file type."}
            )

        return {"text": extracted_text}

    except Exception as e:
        return JSONResponse(
            status_code=500, content={"message": f"An error occurred: {str(e)}"}
        )
