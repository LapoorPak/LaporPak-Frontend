import { authClient } from "@/lib/auth-client";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { clearOAuthAttemptPortal } from "@/lib/oauth-attempt";
import { getPortalFromRole } from "@/lib/auth-portal";
import { lazy, Suspense, useEffect } from "react";

const CitizenDashboard = lazy(() =>
  import("./components").then((module) => ({ default: module.CitizenDashboard }))
);
const AgencyDashboard = lazy(() =>
  import("./components").then((module) => ({ default: module.AgencyDashboard }))
);

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();
  const userPortal = getPortalFromRole(session?.user?.role);

  useEffect(() => {
    if (session?.user) {
      clearOAuthAttemptPortal();
    }
  }, [session?.user]);

  if (isPending) return <LoadingSpinner />;

  if (userPortal !== "citizen") {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgencyDashboard />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CitizenDashboard />
    </Suspense>
  );
}
