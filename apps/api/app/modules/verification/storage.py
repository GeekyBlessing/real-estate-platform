"""
Private, non-public storage for verification documents, deliberately
separate from app/modules/media/storage.py: that storage is served by
a mounted StaticFiles route because listing photos are meant to be
public, and a government ID or a proof-of-address bill must never be
reachable that way. This module never returns a URL, only an opaque
reference the verification router resolves back to a real path after
checking the requester actually owns the document (or is an admin).

S3DocumentStorage (added with the R2 storage fix) replaces
LocalDiskDocumentStorage in production for the same reason
app/modules/media/storage.py's S3Storage replaced LocalDiskStorage:
Render's free tier disk is ephemeral, so a document uploaded there did
not survive the instance restarting. S3DocumentStorage writes to a
*private* R2 bucket, never given public access the way the media
bucket is, read() fetches the bytes directly through an authenticated
S3 API call rather than returning a URL, so a document is only ever
reachable through this module and the ownership-checked router that
calls it, exactly as before.
"""

import os
import uuid
from abc import ABC, abstractmethod

import boto3
from botocore.config import Config as BotoConfig
from botocore.exceptions import ClientError

from app.core.config import get_settings

settings = get_settings()


class DocumentStorage(ABC):
    @abstractmethod
    def save(self, data: bytes, extension: str) -> str:
        """Persist data, return an opaque reference (never a public URL)."""

    @abstractmethod
    def read(self, reference: str) -> bytes | None:
        """Return the stored bytes, or None if the reference does not resolve to a real file."""

    @abstractmethod
    def delete(self, reference: str) -> None:
        """Best effort: a file already gone is not an error the caller needs to handle."""


class LocalDiskDocumentStorage(DocumentStorage):
    def __init__(self, root: str):
        self.root = root
        os.makedirs(self.root, exist_ok=True)

    def _safe_path(self, reference: str) -> str | None:
        # reference is caller-supplied (read back from our own database, but
        # defense in depth costs nothing): refuse anything that isn't a bare
        # filename, since this must never be able to escape the storage root.
        if "/" in reference or "\\" in reference or ".." in reference:
            return None
        return os.path.join(self.root, reference)

    def save(self, data: bytes, extension: str) -> str:
        filename = f"{uuid.uuid4().hex}.{extension}"
        path = os.path.join(self.root, filename)
        with open(path, "wb") as handle:
            handle.write(data)
        return filename

    def read(self, reference: str) -> bytes | None:
        path = self._safe_path(reference)
        if not path or not os.path.exists(path):
            return None
        with open(path, "rb") as handle:
            return handle.read()

    def delete(self, reference: str) -> None:
        path = self._safe_path(reference)
        if path and os.path.exists(path):
            os.remove(path)


class S3DocumentStorage(DocumentStorage):
    def __init__(self, bucket: str):
        self.bucket = bucket
        self.client = boto3.client(
            "s3",
            endpoint_url=settings.r2_endpoint_url,
            aws_access_key_id=settings.r2_access_key_id,
            aws_secret_access_key=settings.r2_secret_access_key,
            config=BotoConfig(signature_version="s3v4"),
            region_name="auto",
        )

    def _safe_key(self, reference: str) -> str | None:
        if "/" in reference or "\\" in reference or ".." in reference:
            return None
        return reference

    def save(self, data: bytes, extension: str) -> str:
        filename = f"{uuid.uuid4().hex}.{extension}"
        self.client.put_object(Bucket=self.bucket, Key=filename, Body=data)
        return filename

    def read(self, reference: str) -> bytes | None:
        key = self._safe_key(reference)
        if not key:
            return None
        try:
            response = self.client.get_object(Bucket=self.bucket, Key=key)
            return response["Body"].read()
        except ClientError:
            # Covers NoSuchKey and similar: a reference that doesn't
            # resolve to a real object is a None, not an exception the
            # router needs to handle specially, same contract as
            # LocalDiskDocumentStorage.read's os.path.exists check.
            return None

    def delete(self, reference: str) -> None:
        key = self._safe_key(reference)
        if not key:
            return
        try:
            self.client.delete_object(Bucket=self.bucket, Key=key)
        except ClientError:
            pass


_storage: DocumentStorage | None = None


def get_document_storage() -> DocumentStorage:
    global _storage
    if _storage is None:
        if settings.r2_configured:
            _storage = S3DocumentStorage(bucket=settings.r2_documents_bucket)
        else:
            # Only reached when R2 is not configured, i.e. local development.
            _storage = LocalDiskDocumentStorage(root=settings.verification_documents_root)
    return _storage
