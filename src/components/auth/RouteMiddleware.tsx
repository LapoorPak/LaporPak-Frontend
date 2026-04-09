import { Suspense } from "react";
import { Routes, Route as ReactRoute } from "react-router";
import { routes } from "@/config/routes";
import type { Route } from "@/types/route";
import { AuthGuard } from "./AuthGuard";
import { GuestGuard } from "./GuestGuard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import AuthLayout from "@/components/layout/AuthLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import type { AuthPortal } from "@/lib/auth-portal";

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
  const getRoutesByPortal = (items: Route[], portal: AuthPortal) =>
    items.filter((route) => route.portal === portal);

  const citizenPublicRoutes = getRoutesByPortal(publicRoutes, "citizen");
  const agencyPublicRoutes = getRoutesByPortal(publicRoutes, "agency");
  const adminPublicRoutes = getRoutesByPortal(publicRoutes, "admin");
  const citizenProtectedRoutes = getRoutesByPortal(protectedRoutes, "citizen");
  const agencyProtectedRoutes = getRoutesByPortal(protectedRoutes, "agency");
  const adminProtectedRoutes = getRoutesByPortal(protectedRoutes, "admin");

  return (
    <Routes>
      {/* Unguarded */}
      {unguardedRoutes.map(renderRoute)}

      {/* Public */}
      <ReactRoute element={<GuestGuard portal="citizen" />}>
        <ReactRoute element={<AuthLayout />}>
          {citizenPublicRoutes.map(renderRoute)}
        </ReactRoute>
      </ReactRoute>

      <ReactRoute element={<GuestGuard portal="agency" />}>
        <ReactRoute element={<AuthLayout />}>
          {agencyPublicRoutes.map(renderRoute)}
        </ReactRoute>
      </ReactRoute>

      <ReactRoute element={<GuestGuard portal="admin" />}>
        <ReactRoute element={<AuthLayout />}>
          {adminPublicRoutes.map(renderRoute)}
        </ReactRoute>
      </ReactRoute>

      {/* Protected */}
      <ReactRoute element={<AuthGuard portal="citizen" />}>
        <ReactRoute element={<DashboardLayout />}>
          {citizenProtectedRoutes.map(renderRoute)}
        </ReactRoute>
      </ReactRoute>

      <ReactRoute element={<AuthGuard portal="agency" />}>
        <ReactRoute element={<DashboardLayout />}>
          {agencyProtectedRoutes.map(renderRoute)}
        </ReactRoute>
      </ReactRoute>

      <ReactRoute element={<AuthGuard portal="admin" />}>
        <ReactRoute element={<DashboardLayout />}>
          {adminProtectedRoutes.map(renderRoute)}
        </ReactRoute>
      </ReactRoute>
    </Routes>
  );
}
