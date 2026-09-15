"""
A small storage abstraction so the router never touches a filesystem
path or an S3 client directly. LocalDiskStorage was the original
implementation for local development; S3Storage (added with the R2
storage fix) is what production actually uses now. Swapping between
them is a config change (see r2_configured in app/core/config.py), not
a router rewrite, since MediaStorage is the only surface the router
depends on.

Why this changed: LocalDiskStorage's known, disclosed limitation was
that Render's filesystem is ephemeral on the free tier this project
runs on, so an uploaded file did not survive the instance restarting,
which happens roughly every fifteen minutes of no traffic. That is
what "file uploads not working for some users" traced back to: an
upload always succeeded at the moment it happened, then the photo
quietly vanished the next time the container recycled. S3Storage
against Cloudflare R2 fixes this because the file lives in R2, not in
the container, so it survives restarts, redeploys, and everything else
that resets the container's own disk.
"""

import io
import os
import uuid
from abc import ABC, abstractmethod

import boto3
from botocore.config import Config as BotoConfig

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


class S3Storage(MediaStorage):
    """
    Cloudflare R2 is S3-compatible, so this talks to it with boto3's
    regular S3 client pointed at R2's endpoint (settings.r2_endpoint_url),
    not a Cloudflare-specific SDK. public_base_url is the bucket's public
    R2.dev (or custom domain) URL: R2 buckets are private by default, so
    save() writing an object does not by itself make it reachable, the
    bucket's own public access setting is what does that (see the
    r2_media_bucket setup this was configured with).
    """

    def __init__(self, bucket: str, public_base_url: str):
        self.bucket = bucket
        self.public_base_url = public_base_url.rstrip("/")
        self.client = boto3.client(
            "s3",
            endpoint_url=settings.r2_endpoint_url,
            aws_access_key_id=settings.r2_access_key_id,
            aws_secret_access_key=settings.r2_secret_access_key,
            config=BotoConfig(signature_version="s3v4"),
            region_name="auto",
        )

    def save(self, data: bytes, extension: str) -> str:
        filename = f"{uuid.uuid4().hex}.{extension}"
        content_type = "image/jpeg" if extension == "jpg" else f"image/{extension}"
        self.client.upload_fileobj(
            io.BytesIO(data),
            self.bucket,
            filename,
            ExtraArgs={"ContentType": content_type},
        )
        return f"{self.public_base_url}/{filename}"

    def delete(self, url: str) -> None:
        filename = url.rsplit("/", 1)[-1]
        if "/" in filename or ".." in filename:
            return
        # Best effort, same contract as LocalDiskStorage.delete: a file
        # already gone (or a bucket hiccup) is not an error the caller
        # needs to see, deleting a photo should never fail a request over
        # storage cleanup that can just as well be handled by hand later.
        try:
            self.client.delete_object(Bucket=self.bucket, Key=filename)
        except Exception:
            pass


_storage: MediaStorage | None = None


def get_storage() -> MediaStorage:
    global _storage
    if _storage is None:
        if settings.r2_configured:
            _storage = S3Storage(bucket=settings.r2_media_bucket, public_base_url=settings.r2_media_public_url)
        else:
            # media_public_base_url, not media_base_url: LocalDiskStorage's
            # save() just concatenates base_url + filename, so base_url has
            # to already be the absolute origin-qualified URL (see
            # config.py's media_public_base_url docstring for why a bare
            # relative path breaks image loading from the frontend's own,
            # different origin). Only reached when R2 is not configured,
            # i.e. local development.
            _storage = LocalDiskStorage(root=settings.media_root, base_url=settings.media_public_base_url)
    return _storage
