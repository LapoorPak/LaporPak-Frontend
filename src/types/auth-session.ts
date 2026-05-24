export interface SessionDetailAgencyInfo {
  id: string;
  code: string;
  type: string;
  name: string;
  short?: string | null;
  wilayah?: string | null;
}

export interface SessionDetailBranchInfo {
  id: string;
  name: string;
  wilayah: string;
  photos?: string[];
  dinas?: SessionDetailAgencyInfo | null;
}

export interface SessionDetailPetugas {
  id: string;
  nip: string;
  cabangDinas?: SessionDetailBranchInfo | null;
  dinas?: SessionDetailAgencyInfo | null;
}

export interface SessionDetailUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  role: string | null;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
  phone: string | null;
}

export interface SessionDetailSession {
  id: string;
  token: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  ipAddress: string;
  userAgent: string;
}

export interface GetSessionDetailResponse {
  data: {
    session: SessionDetailSession;
    user: SessionDetailUser;
    petugas: SessionDetailPetugas | null;
  };
}
