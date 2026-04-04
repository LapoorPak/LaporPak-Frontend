import { lazy } from "react";
import type { Route } from "@/types/route";

const Home = lazy(() => import("@/pages/home"));
const Login = lazy(() => import("@/pages/login"));
const Register = lazy(() => import("@/pages/register"));
const AgencyLogin = lazy(() => import("@/pages/agency-login"));
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
  },
  {
    key: "register",
    title: "Register",
    path: "/register",
    component: Register,
    isEnabled: true,
    isPublic: true,
  },
  {
    key: "agency-login",
    title: "Agency Login",
    path: "/agency/login",
    component: AgencyLogin,
    isEnabled: true,
    isPublic: true,
  },
  {
    key: "dashboard",
    title: "Dashboard",
    path: "/dashboard",
    component: Dashboard,
    isEnabled: true,
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
