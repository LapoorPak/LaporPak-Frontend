import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/hooks/auth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { getDashboardPathForRole, type AuthPortal } from "@/lib/auth-portal";

interface GuestGuardProps {
  portal: AuthPortal;
}

export function GuestGuard(_props: GuestGuardProps) {
  const { data: session, isPending } = useAuth();

  if (isPending) return <LoadingSpinner />;
  if (session?.user) return <Navigate to={getDashboardPathForRole(session.user.role)} replace />;

  return <Outlet />;
}
