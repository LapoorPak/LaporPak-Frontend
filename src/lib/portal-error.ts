const PORTAL_ERROR_COOKIE = "lp_portal_error";

type PortalErrorPayload = {
  code: string;
  message: string;
};

export function consumePortalError(): PortalErrorPayload | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${PORTAL_ERROR_COOKIE}=`));

  if (!cookie) {
    return null;
  }

  const value = cookie.slice(`${PORTAL_ERROR_COOKIE}=`.length);
  document.cookie = `${PORTAL_ERROR_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;

  try {
    return JSON.parse(decodeURIComponent(value)) as PortalErrorPayload;
  } catch {
    return null;
  }
}
