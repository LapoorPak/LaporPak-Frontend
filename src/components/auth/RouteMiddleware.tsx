import { Suspense } from "react";
import { Routes, Route as ReactRoute } from "react-router";
import { routes } from "@/config/routes";
import type { Route } from "@/types/route";
import { AuthGuard } from "./AuthGuard";
import { GuestGuard } from "./GuestGuard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import AuthLayout from "@/components/layout/AuthLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";

function renderRoute(route: Route) {
  if (!route.isEnabled) return null;
  const Component = route.component;

  return (
    <ReactRoute
      key={route.key}
      path={route.path}
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <Component />
        </Suspense>
      }
    />
  );
}

export function RouteMiddleware() {
  const unguardedRoutes = routes.filter((r) => r.isUnguarded && r.isEnabled);
  const publicRoutes = routes.filter((r) => r.isPublic && r.isEnabled);
  const protectedRoutes = routes.filter(
    (r) => !r.isPublic && !r.isUnguarded && r.isEnabled
  );

  const citizenRoutes = protectedRoutes.filter((r) => !r.path?.startsWith("/agency/"));

  return (
    <Routes>
      {/* Unguarded */}
      {unguardedRoutes.map(renderRoute)}

      {/* Public */}
      <ReactRoute element={<GuestGuard />}>
        <ReactRoute element={<AuthLayout />}>
          {publicRoutes.map(renderRoute)}
        </ReactRoute>
      </ReactRoute>

      {/* Protected */}
      <ReactRoute element={<AuthGuard />}>
        <ReactRoute element={<DashboardLayout />}>
          {citizenRoutes.map(renderRoute)}
        </ReactRoute>
      </ReactRoute>
    </Routes>
  );
}
