import type { AuthPortal } from "./auth-portal";

const PORTAL_ERROR_COOKIE = "lp_portal_error";
const DEFAULT_PORTAL_ERROR_MESSAGE =
  "Akun Anda tidak bisa masuk melalui portal ini.";

type PortalErrorPayload = {
  code: string;
  message: string;
};

type AuthScreen = "login" | "register";

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

function getSignupDisabledMessage(
  portal: AuthPortal,
  screen: AuthScreen,
) {

  if (screen === "register" ) {
    return "Pendaftaran dengan Google sedang tidak tersedia. Coba lagi beberapa saat lagi.";
  }

  if (portal === "citizen" ) {
    return "Akun belum terdaftar. Silakan daftar terlebih dahulu melalui halaman register.";
  }

  if (portal === "agency") {
    return "Akun dinas belum dibuat. Hubungi administrator untuk pembuatan akun sebelum login.";
  }

  return "Akun admin belum dibuat. Hubungi super admin untuk pembuatan akun sebelum login.";
}

export function getAuthErrorMessage(params: {
  code?: string | null;
  message?: string | null;
  portal: AuthPortal;
  screen: AuthScreen;
}) {
  const normalizedMessage =
    typeof params.message === "string" ? params.message.trim() : "";
  if (normalizedMessage) {
    return normalizedMessage;
  }

  switch (params.code) {
    case "signup_disabled":
      return getSignupDisabledMessage(params.portal, params.screen);
    case "account_not_linked":
      return "Akun ini sudah ada, tetapi belum terhubung dengan Google. Silakan gunakan metode login yang sebelumnya dipakai.";
    default:
      return DEFAULT_PORTAL_ERROR_MESSAGE;
  }
}
