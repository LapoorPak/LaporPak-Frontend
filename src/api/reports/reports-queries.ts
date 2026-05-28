import { keepPreviousData, useInfiniteQuery, useQuery, useMutation, type UseQueryOptions, type UseMutationOptions } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/api/queryKeys";
import { apiClient } from "@/config/api-client";
import { Api } from "@/constants/api";
import type {
  CreateReportRequest,
  CreateReportResponse,
  GetMyReportsRequest,
  GetReportLocationsRequest,
  GetReportLocationsResponse,
  GetReportsDashboardRequest,
  GetReportsDashboardResponse,
  RateReportRequest,
  ReportLocation,
  ResolveReportRequest,
  SubmitReportClarificationRequest,
  UpdateReportMutationResponse,
  UpdateReportStatusRequest,
  VoteReportRequest,
} from "@/types/reports";

export type {
  AiReview,
  CreateReportRequest,
  CreateReportResponse,
  DashboardReportItem,
  GetMyReportsRequest,
  GetReportLocationsRequest,
  GetReportLocationsResponse,
  GetReportsDashboardRequest,
  GetReportsDashboardResponse,
  LocationStats,
  RateReportRequest,
  ReportCategory,
  ReportLocation,
  ReportOwnership,
  ReportRating,
  ReportsDashboardSummary,
  ReportsDashboardTab,
  ReportsDashboardTabKey,
  ReportsScope,
  ReportStatus,
  ReportStatusTone,
  ReportTimelineItem,
  ReportVoteValue,
  ResolveReportRequest,
  SubmitReportClarificationRequest,
  UpdateReportMutationResponse,
  UpdateReportStatusRequest,
  VoteReportRequest,
} from "@/types/reports";

export function useQueryGetMyReports<TData = GetReportLocationsResponse, TError = Error>(
  params?: GetMyReportsRequest,
  options?: Omit<
    UseQueryOptions<GetReportLocationsResponse, TError, TData, [string, GetMyReportsRequest | undefined]>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: [QUERY_KEYS.MY_REPORTS, params],
    queryFn: async () => {
      const response = await apiClient.get<GetReportLocationsResponse>(Api.myReports, {
        params,
      });
      return response.data;
    },
    ...options,
  });
}

export function useQueryGetReportsDashboard<TData = GetReportsDashboardResponse, TError = Error>(
  params?: GetReportsDashboardRequest,
  options?: Omit<
    UseQueryOptions<GetReportsDashboardResponse, TError, TData, [string, GetReportsDashboardRequest | undefined]>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: [QUERY_KEYS.REPORTS_DASHBOARD, params],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await apiClient.get<GetReportsDashboardResponse>(Api.reportsDashboard, {
        params,
      });

      return response.data;
    },
    ...options,
  });
}

// Hook for GET /api/reports/locations
export function useQueryGetReportLocations<TData = GetReportLocationsResponse, TError = Error>(
  params?: GetReportLocationsRequest,
  options?: Omit<
    UseQueryOptions<GetReportLocationsResponse, TError, TData, [string, GetReportLocationsRequest | undefined]>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: [QUERY_KEYS.REPORTS_LOCATIONS, params],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await apiClient.get<GetReportLocationsResponse>(Api.reportLocations, {
        params,
      });
      return response.data;
    },
    ...options,
  });
}

export function useInfiniteQueryGetReportLocations(
  params?: GetReportLocationsRequest,
  options?: { enabled?: boolean },
) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.REPORTS_LOCATIONS, "infinite", params],
    initialPageParam: params?.page ?? 1,
    enabled: options?.enabled ?? true,
    queryFn: async ({ pageParam }) => {
      const response = await apiClient.get<GetReportLocationsResponse>(Api.reportLocations, {
        params: {
          ...params,
          page: pageParam,
        },
      });
      return response.data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });
}

// Hook for POST /api/reports
export function useMutationCreateReport(
  options?: Omit<UseMutationOptions<CreateReportResponse, Error, CreateReportRequest>, "mutationFn">
) {
  return useMutation({
    mutationFn: async (payload: CreateReportRequest) => {
      const formData = new FormData();
      formData.append("title", payload.title);
      formData.append("description", payload.description);
      formData.append("latitude", payload.latitude.toString());
      formData.append("longitude", payload.longitude.toString());
      
      if (payload.kategoriId) formData.append("kategoriId", payload.kategoriId);
      if (payload.address) formData.append("address", payload.address);
      if (payload.images && payload.images.length > 0) {
        payload.images.forEach((file) => formData.append("images", file));
      }

      const response = await apiClient.post<CreateReportResponse>(Api.reports, formData);
      return response.data;
    },
    ...options
  });
}

export function useMutationUpdateReportStatus(
  options?: Omit<
    UseMutationOptions<
      UpdateReportMutationResponse,
      Error,
      { id: string; payload: UpdateReportStatusRequest }
    >,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateReportStatusRequest }) => {
      if (payload.images?.length) {
        const formData = new FormData();
        formData.append("status", payload.status);
        if (payload.agencyNote) formData.append("agencyNote", payload.agencyNote);
        if (payload.catatanDinas) formData.append("catatanDinas", payload.catatanDinas);
        if (payload.resolutionNote) formData.append("resolutionNote", payload.resolutionNote);
        payload.images.forEach((file) => formData.append("images", file));

        const response = await apiClient.post<UpdateReportMutationResponse>(Api.reportStatus(id), formData);
        return response.data;
      }

      const response = await apiClient.post<UpdateReportMutationResponse>(Api.reportStatus(id), payload);
      return response.data;
    },
    ...options,
  });
}

export function useMutationResolveReport(
  options?: Omit<
    UseMutationOptions<
      UpdateReportMutationResponse,
      Error,
      { id: string; payload: ResolveReportRequest }
    >,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ResolveReportRequest }) => {
      const formData = new FormData();
      if (payload.agencyNote) formData.append("agencyNote", payload.agencyNote);
      if (payload.catatanDinas) formData.append("catatanDinas", payload.catatanDinas);
      if (payload.resolutionNote) formData.append("resolutionNote", payload.resolutionNote);
      payload.resolutionImages?.forEach((file) => formData.append("resolutionImages", file));

      const response = await apiClient.post<UpdateReportMutationResponse>(Api.reportResolve(id), formData);
      return response.data;
    },
    ...options,
  });
}

export function useMutationClaimReport(
  options?: Omit<
    UseMutationOptions<UpdateReportMutationResponse, Error, string>,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<UpdateReportMutationResponse>(
        Api.reportClaim(id),
      );
      return response.data;
    },
    ...options,
  });
}

export function useMutationSubmitReportClarification(
  options?: Omit<
    UseMutationOptions<
      UpdateReportMutationResponse,
      Error,
      { id: string; payload: SubmitReportClarificationRequest }
    >,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: SubmitReportClarificationRequest }) => {
      if (payload.images?.length) {
        const formData = new FormData();
        formData.append("note", payload.note);
        payload.images.forEach((file) => formData.append("images", file));

        const response = await apiClient.post<UpdateReportMutationResponse>(Api.reportClarification(id), formData);
        return response.data;
      }

      const response = await apiClient.post<UpdateReportMutationResponse>(Api.reportClarification(id), {
        note: payload.note,
      });
      return response.data;
    },
    ...options,
  });
}

export function useMutationVoteReport(
  options?: Omit<
    UseMutationOptions<
      { data: Pick<ReportLocation, "id" | "upvotes" | "downvotes" | "voteScore" | "myVote"> },
      Error,
      { id: string; payload: VoteReportRequest }
    >,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: VoteReportRequest }) => {
      const response = await apiClient.post<{ data: Pick<ReportLocation, "id" | "upvotes" | "downvotes" | "voteScore" | "myVote"> }>(
        Api.reportVote(id),
        payload,
      );
      return response.data;
    },
    ...options,
  });
}

export function useMutationRateReport(
  options?: Omit<
    UseMutationOptions<
      { data: Pick<ReportLocation, "id" | "rating" | "averageRating" | "ratingCount"> },
      Error,
      { id: string; payload: RateReportRequest }
    >,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: RateReportRequest }) => {
      const response = await apiClient.post<{ data: Pick<ReportLocation, "id" | "rating" | "averageRating" | "ratingCount"> }>(
        Api.reportRating(id),
        payload,
      );
      return response.data;
    },
    ...options,
  });
}
