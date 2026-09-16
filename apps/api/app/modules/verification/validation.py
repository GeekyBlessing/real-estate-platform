"""
File acceptance rules for a verification document upload. Deliberately
lighter than app/modules/media/processing.py: a listing photo is
re-encoded because it will be displayed publicly and its EXIF data
(GPS coordinates in particular) must never leak; a verification
document is never displayed to anyone but its owner and an admin, and
re-encoding a scanned ID or a PDF bill risks making it harder to read,
not safer. What still matters here is the same as any upload: reject
anything that is not actually a readable file of an allowed type
before it touches disk.
"""

import io

from fastapi import UploadFile
from PIL import Image

from app.common.exceptions import AppError

MAX_UPLOAD_BYTES = 15 * 1024 * 1024  # 15MB: a phone photo of a document or a scanned PDF can run larger than a listing photo.
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "application/pdf"}
EXTENSION_BY_CONTENT_TYPE = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf",
}


class InvalidDocumentError(AppError):
    status_code = 422


async def validate_document_upload(file: UploadFile) -> tuple[bytes, str]:
    """Returns (raw bytes, file extension) once the upload has passed every check, ready to be handed to storage."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise InvalidDocumentError(f"{file.filename}: only JPEG, PNG, WEBP, or PDF files are accepted.")

    raw = await file.read()
    if len(raw) == 0:
        raise InvalidDocumentError(f"{file.filename}: empty file.")
    if len(raw) > MAX_UPLOAD_BYTES:
        raise InvalidDocumentError(f"{file.filename}: files must be under 15MB.")

    if file.content_type != "application/pdf":
        try:
            image = Image.open(io.BytesIO(raw))
            image.verify()
        except Exception as exc:
            raise InvalidDocumentError(f"{file.filename}: this isn't a valid image ({exc}).")

    return raw, EXTENSION_BY_CONTENT_TYPE[file.content_type]
