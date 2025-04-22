# File: app/services/rag_logic/processing/text_processing.py
import re
import io
from typing import List, Tuple, Optional
from PIL import Image, ImageEnhance, ImageFilter
import pytesseract
from pdf2image import convert_from_bytes
from pypdf import PdfReader


# ============================================
# Các Hàm Helper OCR và Text Cleaning
# ============================================
def clean_text(text: str) -> str:
    """Làm sạch văn bản OCR."""
    # ... (code hàm như trước) ...
    if not isinstance(text, str):
        return ""
    text = re.sub(r"\n+", " ", text)
    text = re.sub(r" +", " ", text)
    return text.strip()


def preprocess_image(image: Image.Image) -> Image.Image:
    """Cải thiện chất lượng ảnh cho OCR."""
    # ... (code hàm như trước) ...
    try:
        image = image.convert("L")
        image = ImageEnhance.Contrast(image).enhance(2)
        image = image.filter(ImageFilter.SHARPEN)
    except Exception as e:
        print(f"Cảnh báo: Lỗi tiền xử lý ảnh: {e}")
    return image


def ocr_image(image: Image.Image) -> str:
    """Trích xuất text từ ảnh PIL bằng pytesseract."""
    # ... (code hàm như trước) ...
    try:
        processed_image = preprocess_image(image)
        custom_config = r"--oem 3 --psm 6 -l vie+eng"
        extracted_text = pytesseract.image_to_string(
            processed_image, config=custom_config
        )
        return clean_text(extracted_text)
    except pytesseract.TesseractNotFoundError:
        print("LỖI: Không tìm thấy Tesseract.")
        raise RuntimeError("Tesseract OCR engine not found.")
    except Exception as e:
        print(f"Lỗi khi OCR ảnh: {e}")
        return ""


# ============================================
# Các Hàm Trích Xuất Text Chuyên Biệt
# ============================================
def _extract_text_from_pdf(file_bytes: bytes) -> List[Tuple[int, str]]:
    """Trích xuất text từ file PDF, thử trực tiếp trước, fallback OCR."""
    # ... (code hàm như trước) ...
    extracted_pages: List[Tuple[int, str]] = []
    pdf_text_extracted = False
    num_pages = 0
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        num_pages = len(reader.pages)
        print(f"  PDF có {num_pages} trang. Thử trích xuất text trực tiếp...")
        page_data_temp = []
        temp_text_check = ""
        for i, page in enumerate(reader.pages):
            page_num = i + 1
            try:
                page_text = page.extract_text() or ""
                page_data_temp.append((page_num, page_text.strip()))
                temp_text_check += page_text
            except Exception as page_extract_err:
                print(
                    f"    - Lỗi trích xuất text trang {page_num}: {page_extract_err}."
                )
                page_data_temp.append((page_num, ""))
        if len(temp_text_check.strip()) > max(100, num_pages * 10):
            print("  Trích xuất text PDF trực tiếp thành công.")
            extracted_pages = page_data_temp
            pdf_text_extracted = True
        else:
            print("  Text PDF trực tiếp không đủ hoặc lỗi. Fallback sang OCR...")
    except Exception as pypdf_err:
        print(f"  Lỗi khi đọc PDF bằng pypdf: {pypdf_err}. Fallback sang OCR.")
    if not pdf_text_extracted:
        print("  Thực hiện OCR trên các trang PDF...")
        try:
            images = convert_from_bytes(file_bytes, dpi=300)
            print(f"  Chuyển PDF thành {len(images)} ảnh để OCR.")
            if not images:
                raise ValueError("Không thể chuyển đổi PDF thành ảnh.")
            for i, image in enumerate(images):
                page_num = i + 1
                print(f"    - OCR trang {page_num}/{len(images)}...")
                page_ocr_text = ocr_image(image)
                extracted_pages.append((page_num, page_ocr_text))
                image.close()
            print("  OCR PDF hoàn tất.")
        except Exception as pdf_ocr_err:
            print(f"  Lỗi trong quá trình OCR PDF: {pdf_ocr_err}")
            raise RuntimeError(
                f"Không thể trích xuất text từ PDF: {pdf_ocr_err}"
            ) from pdf_ocr_err
    return extracted_pages


def _extract_text_from_image(file_bytes: bytes) -> List[Tuple[int, str]]:
    """Trích xuất text từ file ảnh bằng OCR."""
    # ... (code hàm như trước) ...
    print("  Đang xử lý Ảnh...")
    try:
        image = Image.open(io.BytesIO(file_bytes))
        image_text = ocr_image(image)
        image.close()
        print("  OCR ảnh hoàn tất.")
        return [(1, image_text)] if image_text and image_text.strip() else []
    except Exception as img_err:
        print(f"  Lỗi khi xử lý ảnh: {img_err}")
        if isinstance(img_err, (IOError, SyntaxError)):
            raise ValueError(f"File ảnh không hợp lệ: {img_err}") from img_err
        else:
            raise RuntimeError(f"Lỗi khi xử lý ảnh: {img_err}") from img_err


def _extract_text_from_plain(file_bytes: bytes) -> List[Tuple[int, str]]:
    """Trích xuất text từ file plain text."""
    # ... (code hàm như trước) ...
    print("  Đang xử lý file Text...")
    decoded_text = ""
    try:
        decoded_text = file_bytes.decode("utf-8", errors="strict")
    except UnicodeDecodeError:
        print("  Decode UTF-8 thất bại, thử latin-1...")
    try:
        decoded_text = file_bytes.decode("latin-1", errors="replace")
    except Exception as decode_err:
        raise ValueError(f"Không thể decode file text: {decode_err}") from decode_err
    except Exception as txt_err:
        raise ValueError(f"Lỗi khi đọc file text: {txt_err}") from txt_err
    cleaned_text = clean_text(decoded_text)
    if cleaned_text:
        print(f"  Trích xuất thành công {len(cleaned_text)} ký tự.")
        return [(1, cleaned_text)]
    else:
        print("  Cảnh báo: File text rỗng.")
        return []


def _extract_text_from_markdown(file_bytes: bytes) -> List[Tuple[int, str]]:
    """Trích xuất text từ file Markdown."""
    # ... (code hàm như trước) ...
    print("  Processing Markdown file...")
    decoded_text = ""
    try:
        decoded_text = file_bytes.decode("utf-8", errors="strict")
    except UnicodeDecodeError:
        print("  Decode UTF-8 thất bại cho Markdown, thử latin-1...")
    try:
        decoded_text = file_bytes.decode("latin-1", errors="replace")
    except Exception as decode_err:
        raise ValueError(
            f"Không thể decode file Markdown: {decode_err}"
        ) from decode_err
    except Exception as md_err:
        raise ValueError(f"Lỗi khi xử lý file Markdown: {md_err}") from md_err
    cleaned_md_text = decoded_text.strip()
    if cleaned_md_text:
        print(f"  Trích xuất thành công {len(cleaned_md_text)} ký tự.")
        return [(1, cleaned_md_text)]
    else:
        print("  Cảnh báo: File Markdown rỗng.")
        return []


# --- Hàm Dispatcher để chọn phương thức trích xuất ---
def extract_text(
    file_bytes: bytes, content_type: Optional[str], filename: str
) -> List[Tuple[int, str]]:
    """Chọn và gọi hàm trích xuất text phù hợp dựa trên content_type hoặc filename."""
    # ... (code hàm như trước) ...
    content_type = content_type.lower() if content_type else None
    fname_lower = filename.lower() if filename else ""
    print(
        f"  Dispatching text extraction for type: {content_type}, filename: {filename}"
    )
    if content_type == "application/pdf":
        return _extract_text_from_pdf(file_bytes)
    elif content_type and content_type.startswith("image/"):
        return _extract_text_from_image(file_bytes)
    elif content_type == "text/plain":
        return _extract_text_from_plain(file_bytes)
    elif content_type in ["text/markdown", "text/x-markdown"] or fname_lower.endswith(
        (".md", ".markdown")
    ):
        return _extract_text_from_markdown(file_bytes)
    else:
        if fname_lower.endswith(".pdf"):
            print(f"  Warning: Đoán là PDF.")
            return _extract_text_from_pdf(file_bytes)
        elif fname_lower.endswith((".txt", ".text")):
            print(f"  Warning: Đoán là text.")
            return _extract_text_from_plain(file_bytes)
        elif fname_lower.endswith((".md", ".markdown")):
            print(f"  Warning: Đoán là markdown.")
            return _extract_text_from_markdown(file_bytes)
        elif fname_lower.endswith((".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".gif")):
            print(f"  Warning: Đoán là image.")
            return _extract_text_from_image(file_bytes)
        raise ValueError(
            f"Loại file không được hỗ trợ: type='{content_type}', filename='{filename}'"
        )
