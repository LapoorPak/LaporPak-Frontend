export type AuthPortal = "citizen" | "agency" | "admin";

const PORTAL_PATHS: Record<
  AuthPortal,
  {
    loginPath: string;
    dashboardPath: string;
  }
> = {
  citizen: {
    loginPath: "/login",
    dashboardPath: "/dashboard",
  },
  agency: {
    loginPath: "/agency/login",
    dashboardPath: "/agency/dashboard",
  },
  admin: {
    loginPath: "/admin/login",
    dashboardPath: "/admin/dashboard",
  },
};

export function getPortalFromRole(role?: string | null): AuthPortal {
  if (role === "admin") {
    return "admin";
  }

  if (typeof role === "string" && role.trim().length > 0 && role !== "warga") {
    return "agency";
  }

  return "citizen";
}

export function getPortalFromPathname(pathname?: string | null): AuthPortal {
  if (pathname?.startsWith("/agency")) {
    return "agency";
  }

  if (pathname?.startsWith("/admin")) {
    return "admin";
  }

  return "citizen";
}

export function getLoginPathForPortal(portal: AuthPortal) {
  return PORTAL_PATHS[portal].loginPath;
}

export function getDashboardPathForPortal(portal: AuthPortal) {
  return PORTAL_PATHS[portal].dashboardPath;
}

export function getLoginPathForRole(role?: string | null) {
  return getLoginPathForPortal(getPortalFromRole(role));
}

export function getDashboardPathForRole(role?: string | null) {
  return getDashboardPathForPortal(getPortalFromRole(role));
}

export function isPortalAllowedForRole(
  portal: AuthPortal,
  role?: string | null,
) {
  return getPortalFromRole(role) === portal;
}
