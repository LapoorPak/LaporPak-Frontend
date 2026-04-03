import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/config/api-client";
import { Api } from "@/constants/api";
import { QUERY_KEYS } from "@/api/queryKeys";
import type { Report, ReportStatus } from "@/types/report";
import type { PaginatedResponse } from "@/types/api";

export const useQueryReports = (params?: {
  status?: ReportStatus;
  kategoriId?: string;
  page?: number;
  limit?: number;
}) =>
  useQuery<PaginatedResponse<Report>>({
    queryKey: [QUERY_KEYS.REPORTS, params],
    queryFn: () => apiClient.get(Api.reports, { params }).then((r) => r.data),
  });

export const useQueryReportDetail = (id: string) =>
  useQuery<Report>({
    queryKey: [QUERY_KEYS.REPORT_DETAIL, id],
    queryFn: () => apiClient.get(Api.reportDetail(id)).then((r) => r.data),
    enabled: !!id,
  });

export const useQueryMyReports = () =>
  useQuery<Report[]>({
    queryKey: [QUERY_KEYS.MY_REPORTS],
    queryFn: () => apiClient.get(Api.myReports).then((r) => r.data),
  });

export const useQueryNearbyReports = (lat: number, lng: number, radius?: number) =>
  useQuery<Report[]>({
    queryKey: [QUERY_KEYS.NEARBY_REPORTS, lat, lng, radius],
    queryFn: () =>
      apiClient.get(Api.nearbyReports, { params: { lat, lng, radius } }).then((r) => r.data),
    enabled: !!lat && !!lng,
  });

export const useMutationCreateReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      kategoriId: string;
      image: string;
      latitude: number;
      longitude: number;
      address: string;
    }) => apiClient.post(Api.reports, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.MY_REPORTS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.REPORTS] });
    },
  });
};

export const useMutationUpdateStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReportStatus }) =>
      apiClient.put(Api.reportStatus(id), { status }).then((r) => r.data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.REPORT_DETAIL, id] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.REPORTS] });
    },
  });
};

export const useMutationAssignReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, petugasId }: { id: string; petugasId: string }) =>
      apiClient.put(Api.reportAssign(id), { petugasId }).then((r) => r.data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.REPORT_DETAIL, id] });
    },
  });
};
