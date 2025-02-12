from fastapi import FastAPI, File, UploadFile, HTTPException
from PIL import Image
import pytesseract

app = FastAPI()

# Ensure Tesseract is installed and accessible
# You may need to specify the path to the Tesseract executable if it's not in your PATH
# pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'  # Uncomment and adjust if needed


@app.post("/ocr/")
async def ocr(file: UploadFile = File(...)):
    # Validate the file type
    if not file.filename.lower().endswith(("png", "jpg", "jpeg")):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only PNG, JPG, and JPEG are allowed.",
        )

    # Open the uploaded image
    try:
        image = Image.open(file.file)
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Failed to process image: {str(e)}"
        )

    # Perform OCR using Tesseract
    try:
        extracted_text = pytesseract.image_to_string(image)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

    # Return the extracted text
    return {"text": extracted_text}
