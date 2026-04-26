import { API_BASE } from "@/config/api-client";

const DIRECT_IMAGE_PROTOCOL = /^(?:https?:|blob:|data:)/i;

export function resolvePhotoUrl(url: string) {
  if (!url) return url;
  return DIRECT_IMAGE_PROTOCOL.test(url) ? url : `${API_BASE}${url}`;
}
