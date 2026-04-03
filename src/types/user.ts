export type UserRole =
  | "warga"
  | "dinas_pu"
  | "dinas_dlhk"
  | "dinas_bpbd"
  | "dinas_dishub"
  | "dinas_pln"
  | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}
