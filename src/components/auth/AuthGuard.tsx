import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export function AuthGuard() {
  const { data: session, isPending } = useAuth();

  if (isPending) return <LoadingSpinner />;
  if (!session) return <Navigate to="/login" replace />;

  return <Outlet />;
}
