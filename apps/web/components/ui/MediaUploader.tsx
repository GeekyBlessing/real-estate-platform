"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import { apiFetch, apiUpload, ApiError } from "@/lib/api-client";
import { CameraIcon, UploadIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";

export interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl: string;
  isPrimary: boolean;
}

interface MediaOut {
  id: string;
  url: string;
  thumbnail_url: string;
  is_primary: boolean;
}

function toItem(raw: MediaOut): MediaItem {
  return { id: raw.id, url: raw.url, thumbnailUrl: raw.thumbnail_url, isPrimary: raw.is_primary };
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_BYTES = 10 * 1024 * 1024;

export interface MediaUploaderProps {
  minRequired?: number;
  maxPhotos?: number;
  /** Who's looking at the first photo: a vehicle only has buyers, a property listing can have either. Defaults to the property phrasing. */
  viewerLabel?: string;
  /** Fires with the current photo count and ordered ids on every change, so a parent step can gate "Continue" on real uploaded photos. */
  onChange?: (items: MediaItem[]) => void;
}

/**
 * The real photo step: calls the actual media API
 * (apps/api/app/modules/media/router.py) rather than collecting a
 * bare filename the way this step's DocumentSlot predecessor did.
 * Uploads land unattached to this signed-in seller (see
 * ListingMedia's backend docstring); the listing itself attaches them
 * once a real listing-creation endpoint exists, which this pass does
 * not add, so PropertyListingFlow/SellACarFlow still end their own
 * submission the same honest simulated way they already did. What's
 * real here is the photos themselves: really uploaded, really
 * compressed, really stored, really deletable and reorderable.
 *
 * Reordering uses explicit earlier/later buttons rather than drag and
 * drop: reliable on both touch and desktop, and doesn't require a
 * pointer-drag library for what's fundamentally a short list.
 */
export function MediaUploader({ minRequired = 3, maxPhotos = 12, viewerLabel = "buyers or tenants", onChange }: MediaUploaderProps) {
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!accessToken) {
      setLoadingInitial(false);
      return;
    }
    let cancelled = false;
    apiFetch<MediaOut[]>("/media/uploads", { accessToken })
      .then((data) => {
        if (cancelled) return;
        setItems(data.map(toItem));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoadingInitial(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // Notify the parent step (PropertyListingFlow / SellACarFlow) from its own
  // effect, never from inside a handler that's still in the middle of a
  // render or an async callback that resolved during another component's
  // render pass. Every place below that changes `items` (the initial
  // fetch, upload, delete, set-primary, reorder, and their rollbacks) goes
  // through setItems only; this single effect is the one place that calls
  // onChange, always after commit, which is what stopped React's "Cannot
  // update a component while rendering a different component" warning.
  useEffect(() => {
    onChange?.(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    if (!accessToken) {
      showToast("Sign in again to upload photos.", "danger");
      return;
    }
    const room = Math.max(0, maxPhotos - items.length);
    if (room === 0) {
      showToast(`You can add up to ${maxPhotos} photos.`, "danger");
      return;
    }
    const files = Array.from(fileList).slice(0, room);

    const badType = files.find((file) => !ACCEPTED_TYPES.includes(file.type));
    if (badType) {
      showToast(`${badType.name} isn't a JPEG, PNG, or WEBP photo.`, "danger");
      return;
    }
    const tooLarge = files.find((file) => file.size > MAX_FILE_BYTES);
    if (tooLarge) {
      showToast(`${tooLarge.name} is over 10MB.`, "danger");
      return;
    }

    setUploading(true);
    try {
      const uploaded = await apiUpload<MediaOut[]>("/media/uploads", files, accessToken);
      setItems((prev) => [...prev, ...uploaded.map(toItem)]);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Upload failed. Try again.", "danger");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    if (!accessToken) return;
    const wasPrimary = items.find((item) => item.id === id)?.isPrimary ?? false;
    const previous = items;
    let next = items.filter((item) => item.id !== id);
    // Mirror the backend's own rule (router.py's delete_media): deleting the
    // cover photo promotes whichever photo now sorts first, so a gallery
    // with photos left in it never optimistically shows no cover until the
    // next page load reveals what the server already did.
    if (wasPrimary && next.length > 0 && !next.some((item) => item.isPrimary)) {
      next = next.map((item, index) => (index === 0 ? { ...item, isPrimary: true } : item));
    }
    setItems(next);
    try {
      await apiFetch(`/media/${id}`, { method: "DELETE", accessToken });
    } catch {
      setItems(previous);
      showToast("Couldn't delete that photo. Try again.", "danger");
    }
  }

  async function handleSetPrimary(id: string) {
    if (!accessToken) return;
    const previous = items;
    const next = items.map((item) => ({ ...item, isPrimary: item.id === id }));
    setItems(next);
    try {
      await apiFetch(`/media/${id}`, { method: "PATCH", accessToken, body: { is_primary: true } });
    } catch {
      setItems(previous);
      showToast("Couldn't set that as the cover photo. Try again.", "danger");
    }
  }

  async function move(id: string, direction: -1 | 1) {
    if (!accessToken) return;
    const index = items.findIndex((item) => item.id === id);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved!);
    const previous = items;
    setItems(next);
    try {
      await apiFetch("/media/reorder", { method: "POST", accessToken, body: { media_ids: next.map((item) => item.id) } });
    } catch {
      setItems(previous);
      showToast("Couldn't save that order. Try again.", "danger");
    }
  }

  if (loadingInitial) {
    return <div className="h-32 animate-pulse rounded-sm bg-paper-deep" aria-hidden="true" />;
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />

      {items.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center gap-2 rounded-sm border border-dashed border-line-strong py-10 text-center transition-colors hover:border-ink disabled:opacity-60"
        >
          <CameraIcon size={28} className="text-clay" />
          <span className="text-body-sm font-semibold text-ink">{uploading ? "Uploading..." : "Add photos"}</span>
          <span className="text-caption text-ink-soft">JPEG, PNG, or WEBP. Up to 10MB each.</span>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item, index) => (
            <div key={item.id} className="relative aspect-square overflow-hidden rounded-sm border border-line bg-paper-deep">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover" />
              {item.isPrimary && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-parchment">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                aria-label="Delete photo"
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-ink/70 text-parchment transition-transform active:scale-90"
              >
                <TrashIcon size={14} active />
              </button>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-ink/65 px-1.5 py-1">
                <button
                  type="button"
                  onClick={() => move(item.id, -1)}
                  disabled={index === 0}
                  aria-label="Move earlier"
                  className="flex h-6 w-6 items-center justify-center rounded-full text-parchment disabled:opacity-30"
                >
                  <ChevronLeftIcon size={14} active />
                </button>
                {!item.isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(item.id)}
                    className="text-[10px] font-semibold text-parchment underline underline-offset-2"
                  >
                    Make cover
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => move(item.id, 1)}
                  disabled={index === items.length - 1}
                  aria-label="Move later"
                  className="flex h-6 w-6 items-center justify-center rounded-full text-parchment disabled:opacity-30"
                >
                  <ChevronRightIcon size={14} active />
                </button>
              </div>
            </div>
          ))}
          {items.length < maxPhotos && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-sm border border-dashed border-line-strong text-ink-soft transition-colors hover:border-ink disabled:opacity-60"
            >
              <UploadIcon size={20} />
              <span className="text-caption font-semibold">{uploading ? "Uploading..." : "Add more"}</span>
            </button>
          )}
        </div>
      )}

      <p className="text-caption text-ink-soft">
        {items.length} of {maxPhotos} photos
        {items.length < minRequired ? `, at least ${minRequired} required. ` : ". "}
        The first photo is the one {viewerLabel} see first; use the arrows to change the order.
      </p>
    </div>
  );
}
