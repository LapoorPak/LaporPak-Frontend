const OAUTH_ATTEMPT_KEY = "lp_oauth_attempt_portal";

function clearLegacyOAuthAttemptStorage() {
  window.localStorage.removeItem(OAUTH_ATTEMPT_KEY);
}

export function setOAuthAttemptPortal(portal: "agency" | "citizen" | "admin") {
  if (typeof window === "undefined") {
    return;
  }

  clearLegacyOAuthAttemptStorage();
  window.sessionStorage.setItem(OAUTH_ATTEMPT_KEY, portal);
}

export function getOAuthAttemptPortal() {
  if (typeof window === "undefined") {
    return null;
  }

  clearLegacyOAuthAttemptStorage();
  return window.sessionStorage.getItem(OAUTH_ATTEMPT_KEY);
}

export function clearOAuthAttemptPortal() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(OAUTH_ATTEMPT_KEY);
  clearLegacyOAuthAttemptStorage();
}
