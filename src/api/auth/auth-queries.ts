import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiClient } from "@/config/api-client";
import { Api } from "@/constants/api";
import { QUERY_KEYS } from "@/api/queryKeys";
import type { GetSessionDetailResponse } from "@/types/auth-session";

export type {
  GetSessionDetailResponse,
  SessionDetailAgencyInfo,
  SessionDetailBranchInfo,
  SessionDetailPetugas,
  SessionDetailSession,
  SessionDetailUser,
} from "@/types/auth-session";

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
