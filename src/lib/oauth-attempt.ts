const OAUTH_ATTEMPT_KEY = "lp_oauth_attempt_portal";

export function setOAuthAttemptPortal(portal: "agency" | "citizen") {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(OAUTH_ATTEMPT_KEY, portal);
}

export function getOAuthAttemptPortal() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(OAUTH_ATTEMPT_KEY);
}

export function clearOAuthAttemptPortal() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(OAUTH_ATTEMPT_KEY);
}
