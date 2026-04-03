import { lazy } from "react";
import type { Route } from "@/types/route";

const Home = lazy(() => import("@/pages/home"));
const Login = lazy(() => import("@/pages/login"));
const Register = lazy(() => import("@/pages/register"));

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
];
