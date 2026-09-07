"""
A small storage abstraction so the router never touches a filesystem
path or an S3 client directly (see requirements.txt's comment on why
boto3 isn't installed yet: nothing calls it, because there was no
upload pipeline to call it from). LocalDiskStorage is the real,
working implementation for this pass; swapping in an S3-backed one
later is a config change and a new class here, not a router rewrite,
since MediaStorage is the only surface the router depends on.

Known, disclosed limitation of LocalDiskStorage: Render's filesystem
is ephemeral across deploys on the free tier this project runs on, so
uploaded files do not currently survive a redeploy in production. That
is a hosting fact, not an architecture flaw: the interface below is
already shaped for a durable object store, and switching MEDIA_STORAGE
to an S3Storage implementation the day a bucket exists requires no
change to the upload/reorder/attach/delete endpoints at all.
"""

import os
import uuid
from abc import ABC, abstractmethod

from app.core.config import get_settings

settings = get_settings()


class MediaStorage(ABC):
    @abstractmethod
    def save(self, data: bytes, extension: str) -> str:
        """Persist data, return the public URL it's now reachable at."""

    @abstractmethod
    def delete(self, url: str) -> None:
        """Best effort: a file already gone is not an error the caller needs to handle."""


class LocalDiskStorage(MediaStorage):
    def __init__(self, root: str, base_url: str):
        self.root = root
        self.base_url = base_url.rstrip("/")
        os.makedirs(self.root, exist_ok=True)

    def save(self, data: bytes, extension: str) -> str:
        filename = f"{uuid.uuid4().hex}.{extension}"
        path = os.path.join(self.root, filename)
        with open(path, "wb") as handle:
            handle.write(data)
        return f"{self.base_url}/{filename}"

    def delete(self, url: str) -> None:
        filename = url.rsplit("/", 1)[-1]
        # Refuse anything that isn't a bare filename: url is caller-supplied
        # (it's read back from our own database, but defense in depth costs
        # nothing here) and this must never be able to escape media_root.
        if "/" in filename or ".." in filename:
            return
        path = os.path.join(self.root, filename)
        if os.path.exists(path):
            os.remove(path)


_storage: MediaStorage | None = None


def get_storage() -> MediaStorage:
    global _storage
    if _storage is None:
        # media_public_base_url, not media_base_url: LocalDiskStorage's
        # save() just concatenates base_url + filename, so base_url has to
        # already be the absolute origin-qualified URL (see config.py's
        # media_public_base_url docstring for why a bare relative path
        # breaks image loading from the frontend's own, different origin).
        _storage = LocalDiskStorage(root=settings.media_root, base_url=settings.media_public_base_url)
    return _storage
