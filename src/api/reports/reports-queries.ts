import { keepPreviousData, useInfiniteQuery, useQuery, useMutation, type UseQueryOptions, type UseMutationOptions } from "@tanstack/react-query";
import { QUERY_KEYS } from "../queryKeys";
import { apiClient } from "@/config/api-client";
import { Api } from "@/constants/api";

export type ReportsScope = "mine" | "all";
export type ReportOwnership = "mine" | "other";
export type ReportStatus = "pending" | "verified" | "in_progress" | "clarification_requested" | "resolved" | "rejected";
export type ReportVoteValue = -1 | 0 | 1;

// Base Types Based on the contract
export interface ReportCategory {
  id: string;
  code: string;
  name: string;
  dinas: {
    id: string;
    code: string;
    type: string;
    name: string;
  };
}

export interface AiReview {
  statusAi: "diterima" | "ditolak";
  diterimaAi: boolean;
  ditolakAi: boolean;
  confidence: number;
  alasanAi: string;
  saranPerbaikanAi: string | null;
  skorKejelasanAi: number;
  skorKeseriusanAi: number;
  kodePenolakanAi: string | null;
  gambarDiterimaAi: string[];
  gambarDiabaikanAi: string[];
  petunjukGambarAi: string | null;
}

export interface ReportLocation {
  id: string;
  title: string;
  description?: string;
  lat: number;
  lng: number;
  status: ReportStatus;
  routingStatus: string;
  urgencyScore?: number;
  createdAt: string;
  updatedAt: string;
  kategori?: ReportCategory | null;
  dinas?: {
    id: string;
    code: string;
    type: string;
    name: string;
  } | null;
  cabangDinas?: {
    id: string;
    name: string;
    wilayah: string;
  } | null;
  canEdit?: boolean;
  ownership?: ReportOwnership;
  agencyNote?: string | null;
  resolutionNote?: string | null;
  resolutionImages?: string[];
  assignedTo?: {
    id: string;
    name: string;
  } | null;
  createdBy?: {
    id: string;
    name: string;
  } | null;
  upvotes: number;
  downvotes: number;
  voteScore: number;
  myVote: ReportVoteValue | null;
  rating?: ReportRating | null;
  aiReview?: AiReview | null;
  images?: string[];
  timeline?: ReportTimelineItem[];
}

export interface ReportRating {
  id: string;
  score: number;
  note: string | null;
  userId: string;
  dinasId: string | null;
  cabangDinasId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportTimelineItem {
  id: string;
  status: ReportStatus;
  note: string | null;
  images: string[];
  actorRole: string | null;
  createdAt: string;
}

export interface LocationStats {
  total: number;
  byStatus: { status: string; total: number }[];
  byCategory: {
    kategoriId: string;
    kategoriCode: string;
    kategoriName: string;
    total: number;
  }[];
}

export interface GetReportLocationsResponse {
  data: ReportLocation[];
  stats: LocationStats;
  meta?: {
    page: number;
    limit: number;
    take: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateReportRequest {
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  kategoriId?: string;
  address?: string;
  images?: File[];
}

export interface CreateReportResponse {
  data: ReportLocation;
}

export interface GetReportLocationsRequest {
  scope?: ReportsScope;
  page?: number;
  limit?: number;
  take?: number;
  status?: string;
  kategoriId?: string;
  dinasId?: string;
  cabangDinasId?: string;
  createdById?: string;
  search?: string;
  sort?: "top" | "newest";
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
}

export interface GetMyReportsRequest {
  page?: number;
  limit?: number;
  take?: number;
  status?: string;
  kategoriId?: string;
  search?: string;
}

export type ReportsDashboardTabKey = "semua" | "baru" | "diproses" | "klarifikasi" | "tuntas";
export type ReportStatusTone = "success" | "warning" | "danger" | "info";

export interface DashboardReportItem {
  id: string;
  referenceCode: string;
  title: string;
  status: ReportLocation["status"];
  statusLabel: string;
  statusTone: ReportStatusTone;
  dashboardGroup: Exclude<ReportsDashboardTabKey, "semua">;
  date: string;
  dateLabel: string;
  agencyName: string;
  canEdit?: boolean;
  ownership?: ReportOwnership;
  dinas?: ReportLocation["dinas"];
  cabangDinas?: ReportLocation["cabangDinas"];
  kategori?: Pick<ReportCategory, "id" | "code" | "name"> | null;
}

export interface ReportsDashboardSummary {
  totalTarget: number;
  laporanBaru: number;
  diproses: number;
  klarifikasi?: number;
  tuntas: number;
  byStatusRaw: Record<string, number>;
}

export interface ReportsDashboardTab {
  key: ReportsDashboardTabKey;
  label: string;
  total: number;
}

export interface GetReportsDashboardRequest {
  scope?: ReportsScope;
  tab?: ReportsDashboardTabKey;
  page?: number;
  limit?: number;
  take?: number;
  search?: string;
  dinasId?: string;
  cabangDinasId?: string;
  kategoriId?: string;
}

export interface GetReportsDashboardResponse {
  data: DashboardReportItem[];
  meta: NonNullable<GetReportLocationsResponse["meta"]>;
  stats: {
    total: number;
    activeTab: ReportsDashboardTabKey;
    summary: ReportsDashboardSummary;
    tabs: ReportsDashboardTab[];
  };
}

export interface UpdateReportStatusRequest {
  status: ReportLocation["status"];
  agencyNote?: string | null;
  catatanDinas?: string | null;
  resolutionNote?: string | null;
  images?: File[];
}

export interface ResolveReportRequest {
  agencyNote?: string | null;
  catatanDinas?: string | null;
  resolutionNote?: string | null;
  resolutionImages?: File[];
}

export interface SubmitReportClarificationRequest {
  note: string;
  images?: File[];
}

export interface VoteReportRequest {
  vote: ReportVoteValue;
}

export interface RateReportRequest {
  score: number;
  note?: string | null;
}

export interface UpdateReportMutationResponse {
  data: Pick<
    ReportLocation,
    "id" | "status" | "agencyNote" | "resolutionNote" | "assignedTo" | "canEdit" | "ownership"
  > & {
    resolvedAt?: string | null;
  };
}

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
      { data: Pick<ReportLocation, "id" | "rating"> },
      Error,
      { id: string; payload: RateReportRequest }
    >,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: RateReportRequest }) => {
      const response = await apiClient.post<{ data: Pick<ReportLocation, "id" | "rating"> }>(
        Api.reportRating(id),
        payload,
      );
      return response.data;
    },
    ...options,
  });
}
