import { API_BASE } from "@/config/api-client";

const DIRECT_IMAGE_PROTOCOL = /^(?:https?:|blob:|data:)/i;
const BUCKET_IMAGE_FOLDERS = /^(?:report-images|report-updates|resolution-images|agency-photos)\//i;

function toBucketProxyUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    const key = parsedUrl.pathname.replace(/^\/+/, "");
    const isKnownBucketImage =
      BUCKET_IMAGE_FOLDERS.test(key) ||
      parsedUrl.hostname.endsWith(".storageapi.dev") ||
      parsedUrl.hostname === "storageapi.dev";

    if (!isKnownBucketImage) return null;

    const encodedKey = key
      .split("/")
      .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
      .join("/");

    return `${API_BASE}/api/upload/object/${encodedKey}`;
  } catch {
    return null;
  }
}

export function resolvePhotoUrl(url: string) {
  if (!url) return url;
  if (DIRECT_IMAGE_PROTOCOL.test(url)) {
    return toBucketProxyUrl(url) ?? url;
  }

  return `${API_BASE}${url}`;
}
