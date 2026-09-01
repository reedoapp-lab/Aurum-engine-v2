import base64
import io
from pdf2image import convert_from_path

def pdf_to_base64_images(pdf_path: str) -> list[str]:
    # Render all pages in the document
    images = convert_from_path(pdf_path, dpi=200)
    base64_frames = []
    for img in images:
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=85)
        base64_frames.append(base64.b64encode(buffer.getvalue()).decode("utf-8"))
    return base64_frames