import re
import uuid
from pathlib import Path

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".txt", ".doc", ".docx"}
ALLOWED_MIME_HINTS = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


def sanitize_filename(filename: str) -> str:
    name = Path(filename or "upload.bin").name
    name = re.sub(r"[^A-Za-z0-9._-]", "_", name)
    return name[:180] or "upload.bin"


def unique_stored_name(filename: str) -> str:
    stem = Path(sanitize_filename(filename)).stem[:80]
    suffix = Path(sanitize_filename(filename)).suffix.lower()
    return f"{stem}_{uuid.uuid4().hex[:12]}{suffix}"


def is_allowed_file(filename: str, content_type: str | None) -> bool:
    ext = Path(filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False
    if content_type and content_type.split(";")[0].strip() not in ALLOWED_MIME_HINTS:
        if ext in ALLOWED_EXTENSIONS:
            return True
    return True
