import type { ComponentType } from "react";
import type { AuthPortal } from "@/lib/auth-portal";

export type Route = {
  key: string;
  title: string;
  description?: string;
  path?: string;
  component: ComponentType;
  isEnabled: boolean;
  noLayout?: boolean;
  isPublic?: boolean;
  isUnguarded?: boolean;
  portal?: AuthPortal;
  children?: Route[];
};
