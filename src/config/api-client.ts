import axios from "axios";
import { getLoginPathForPortal, getPortalFromPathname } from "@/lib/auth-portal";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    skipAuthRedirect?: boolean;
  }
}

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
let suppressAuthRedirect = false;

export const apiClient = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
});

export function setAuthRedirectSuppressed(value: boolean) {
  suppressAuthRedirect = value;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !suppressAuthRedirect &&
      !error.config?.skipAuthRedirect
    ) {
      const portal = getPortalFromPathname(window.location.pathname);
      window.location.replace(getLoginPathForPortal(portal));
    }

    return Promise.reject(error);
  },
);
