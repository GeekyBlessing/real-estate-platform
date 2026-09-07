/**
 * A thin wrapper over fetch for talking to the real backend
 * (apps/api), not a generated OpenAPI client yet (the architecture
 * doc's lib/api/ in section 7 describes that as the eventual shape).
 * Three things every call needs and would otherwise be easy to get
 * wrong in one call but not another: the base URL, credentials:
 * "include" so the httpOnly refresh cookie actually gets sent and
 * set, and turning a non-2xx response into a real thrown error with
 * the backend's own detail message rather than a generic "fetch
 * failed" the caller has to re-derive.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  /**
   * Set on any request that relies on the refresh cookie (refresh,
   * logout): the backend's require_same_origin_header dependency
   * (apps/api/app/modules/auth/dependencies.py) rejects a
   * cookie-authenticated mutation without it, as a CSRF defense.
   * Left off requests authenticated by a bearer token instead, which
   * a cross-site request can't attach in the first place.
   */
  sameOriginHeader?: boolean;
  accessToken?: string;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.sameOriginHeader) headers["X-Ile-Client"] = "web";
  if (options.accessToken) headers["Authorization"] = `Bearer ${options.accessToken}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    credentials: "include",
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : undefined;

  if (!response.ok) {
    const message = (data && typeof data === "object" && "detail" in data ? (data as { detail: string }).detail : undefined) ??
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}

/**
 * The one place a multipart upload is sent, same error-handling
 * contract as apiFetch above but deliberately not reusing it: a
 * FormData body must never be JSON.stringify'd, and the browser needs
 * to set its own multipart boundary in Content-Type, which means not
 * setting that header at all here. Used by MediaUploader
 * (components/ui/MediaUploader.tsx), the one place this app uploads
 * real files.
 */
export async function apiUpload<T>(path: string, files: File[], accessToken: string): Promise<T> {
  const formData = new FormData();
  for (const file of files) formData.append("files", file);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: "include",
    body: formData,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : undefined;

  if (!response.ok) {
    const message = (data && typeof data === "object" && "detail" in data ? (data as { detail: string }).detail : undefined) ??
      `Upload failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}
