import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export function GuestGuard() {
  const { data: session, isPending } = useAuth();

  if (isPending) return <LoadingSpinner />;
  if (session) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
