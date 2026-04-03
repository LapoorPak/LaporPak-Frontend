import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/config/api-client";
import { Api } from "@/constants/api";
import { QUERY_KEYS } from "@/api/queryKeys";
import type { Agency } from "@/types/agency";
import type { AgencyStats, PaginatedResponse } from "@/types/api";
import type { Report } from "@/types/report";

export const useQueryAgencies = () =>
  useQuery<Agency[]>({
    queryKey: [QUERY_KEYS.AGENCIES],
    queryFn: () => apiClient.get(Api.agencies).then((r) => r.data),
  });

export const useQueryAgencyDetail = (id: string) =>
  useQuery<Agency>({
    queryKey: [QUERY_KEYS.AGENCY_DETAIL, id],
    queryFn: () => apiClient.get(Api.agencyDetail(id)).then((r) => r.data),
    enabled: !!id,
  });

export const useQueryAgencyStats = (id: string) =>
  useQuery<AgencyStats>({
    queryKey: [QUERY_KEYS.AGENCY_STATS, id],
    queryFn: () => apiClient.get(Api.agencyStats(id)).then((r) => r.data),
    enabled: !!id,
  });

export const useQueryAgencyReports = (
  id: string,
  params?: { status?: string; page?: number; limit?: number }
) =>
  useQuery<PaginatedResponse<Report>>({
    queryKey: [QUERY_KEYS.AGENCY_REPORTS, id, params],
    queryFn: () =>
      apiClient.get(Api.agencyReports(id), { params }).then((r) => r.data),
    enabled: !!id,
  });
