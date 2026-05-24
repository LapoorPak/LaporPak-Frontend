import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/hooks/auth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  getDashboardPathForRole,
  getLoginPathForPortal,
  isPortalAllowedForRole,
  type AuthPortal,
} from "@/lib/auth-portal";

interface AuthGuardProps {
  portal: AuthPortal;
}

export function AuthGuard({ portal }: AuthGuardProps) {
  const { data: session, isPending } = useAuth();

  if (isPending) return <LoadingSpinner />;
  if (!session?.user) return <Navigate to={getLoginPathForPortal(portal)} replace />;
  
  if (session.user.emailVerified === false) {
    return <Navigate to={`/verify-email?email=${encodeURIComponent(session.user.email)}`} replace />;
  }

  if (!isPortalAllowedForRole(portal, session.user.role)) {
    return <Navigate to={getDashboardPathForRole(session.user.role)} replace />;
  }

  return <Outlet />;
}
