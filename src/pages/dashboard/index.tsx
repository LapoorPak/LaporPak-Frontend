import { authClient } from "@/lib/auth-client";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { lazy, Suspense } from "react";

const CitizenDashboard = lazy(() =>
  import("./components").then((module) => ({ default: module.CitizenDashboard }))
);
const AgencyDashboard = lazy(() =>
  import("./components").then((module) => ({ default: module.AgencyDashboard }))
);

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <LoadingSpinner />;

  if (session?.user?.role && session.user.role !== "warga") {
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
