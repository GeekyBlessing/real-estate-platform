"""
What actually happens to a photo between a seller's phone and a
listing's gallery. Every image is re-decoded and re-encoded, never
stored byte-for-byte as uploaded: that's what strips EXIF (a phone
photo carries GPS coordinates by default, and a listing's exact
address is deliberately not public, see LocationPreview on the
frontend) and what guarantees the "image" a client claims to be
uploading is actually a decodable image, not a renamed file.
"""

import io

from fastapi import UploadFile
from PIL import Image, ImageOps

from app.common.exceptions import AppError

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10MB, checked before decoding, so a huge file fails fast.
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
FULL_MAX_DIMENSION = 2000
THUMBNAIL_MAX_DIMENSION = 480
JPEG_QUALITY_FULL = 85
JPEG_QUALITY_THUMBNAIL = 80


class InvalidImageError(AppError):
    status_code = 422


class ProcessedImage:
    def __init__(self, full_bytes: bytes, thumbnail_bytes: bytes, width: int, height: int, byte_size: int):
        self.full_bytes = full_bytes
        self.thumbnail_bytes = thumbnail_bytes
        self.width = width
        self.height = height
        self.byte_size = byte_size


def _resized_jpeg_bytes(image: Image.Image, max_dimension: int, quality: int) -> bytes:
    resized = image.copy()
    resized.thumbnail((max_dimension, max_dimension), Image.LANCZOS)
    buffer = io.BytesIO()
    resized.save(buffer, format="JPEG", quality=quality, optimize=True)
    return buffer.getvalue()


async def process_upload(file: UploadFile) -> ProcessedImage:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise InvalidImageError(f"{file.filename}: only JPEG, PNG, and WEBP photos are accepted.")

    raw = await file.read()
    if len(raw) > MAX_UPLOAD_BYTES:
        raise InvalidImageError(f"{file.filename}: photos must be under 10MB.")
    if len(raw) == 0:
        raise InvalidImageError(f"{file.filename}: empty file.")

    try:
        image = Image.open(io.BytesIO(raw))
        image.verify()  # Confirms it's a real, undamaged image before we trust it further.
        image = Image.open(io.BytesIO(raw))  # verify() consumes the file handle; reopen to actually use it.
        # EXIF orientation is applied then stripped, not just dropped, so a
        # photo taken in portrait doesn't silently come out sideways.
        image = ImageOps.exif_transpose(image)
        if image is None:
            raise InvalidImageError(f"{file.filename}: could not read this image.")
        image = image.convert("RGB")
    except InvalidImageError:
        raise
    except Exception as exc:  # Pillow raises several distinct exception types for a bad file; all mean the same thing here.
        raise InvalidImageError(f"{file.filename}: this isn't a valid photo ({exc}).")

    full_bytes = _resized_jpeg_bytes(image, FULL_MAX_DIMENSION, JPEG_QUALITY_FULL)
    thumbnail_bytes = _resized_jpeg_bytes(image, THUMBNAIL_MAX_DIMENSION, JPEG_QUALITY_THUMBNAIL)
    full_image = Image.open(io.BytesIO(full_bytes))

    return ProcessedImage(
        full_bytes=full_bytes,
        thumbnail_bytes=thumbnail_bytes,
        width=full_image.width,
        height=full_image.height,
        byte_size=len(full_bytes),
    )
