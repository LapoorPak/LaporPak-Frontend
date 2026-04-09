import { lazy } from "react";
import type { Route } from "@/types/route";

const Home = lazy(() => import("@/pages/home"));
const Login = lazy(() => import("@/pages/login"));
const Register = lazy(() => import("@/pages/register"));
const VerifyEmail = lazy(() => import("@/pages/verify-email"));
const AgencyLogin = lazy(() => import("@/pages/agency-login"));
const AdminLogin = lazy(() => import("@/pages/admin/login"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const HowItWorks = lazy(() => import("@/pages/how-it-works"));
const HelpCenter = lazy(() => import("@/pages/help-center"));
const NotFound = lazy(() => import("@/pages/not-found"));
export const routes: Route[] = [
  {
    key: "home",
    title: "Home",
    path: "/",
    component: Home,
    isEnabled: true,
    isUnguarded: true,
    noLayout: true,
  },
  {
    key: "cara-kerja",
    title: "Cara Kerja",
    path: "/cara-kerja",
    component: HowItWorks,
    isEnabled: true,
    isUnguarded: true,
    noLayout: true,
  },
  {
    key: "bantuan",
    title: "Bantuan",
    path: "/bantuan",
    component: HelpCenter,
    isEnabled: true,
    isUnguarded: true,
    noLayout: true,
  },
  {
    key: "login",
    title: "Login",
    path: "/login",
    component: Login,
    isEnabled: true,
    isPublic: true,
    portal: "citizen",
  },
  {
    key: "register",
    title: "Register",
    path: "/register",
    component: Register,
    isEnabled: true,
    isPublic: true,
    portal: "citizen",
  },
  {
    key: "verify-email",
    title: "Verifikasi Email",
    path: "/verify-email",
    component: VerifyEmail,
    isEnabled: true,
    isPublic: true,
    portal: "citizen",
  },
  {
    key: "agency-login",
    title: "Agency Login",
    path: "/agency/login",
    component: AgencyLogin,
    isEnabled: true,
    isPublic: true,
    portal: "agency",
  },
  {
    key: "admin-login",
    title: "Admin Login",
    path: "/admin/login",
    component: AdminLogin,
    isEnabled: true,
    isPublic: true,
    portal: "admin",
  },
  {
    key: "dashboard",
    title: "Dashboard",
    path: "/dashboard",
    component: Dashboard,
    isEnabled: true,
    portal: "citizen",
  },
  {
    key: "agency-dashboard",
    title: "Agency Dashboard",
    path: "/agency/dashboard",
    component: Dashboard,
    isEnabled: true,
    portal: "agency",
  },
  {
    key: "admin-dashboard",
    title: "Admin Dashboard",
    path: "/admin/dashboard",
    component: Dashboard,
    isEnabled: true,
    portal: "admin",
  },
  {
    key: "not-found",
    title: "Not Found",
    path: "*",
    component: NotFound,
    isEnabled: true,
    isUnguarded: true,
    noLayout: true,
  },
];
