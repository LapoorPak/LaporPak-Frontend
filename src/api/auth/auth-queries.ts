import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiClient } from "@/config/api-client";
import { Api } from "@/constants/api";
import { QUERY_KEYS } from "../queryKeys";

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

export function useQueryGetSessionDetail<
  TData = GetSessionDetailResponse,
  TError = Error,
>(
  options?: Omit<
    UseQueryOptions<GetSessionDetailResponse, TError, TData, [string]>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: [QUERY_KEYS.AUTH_SESSION_DETAIL],
    queryFn: async () => {
      const response = await apiClient.get<GetSessionDetailResponse>(Api.authSessionDetail);

      return response.data;
    },
    ...options,
  });
}
