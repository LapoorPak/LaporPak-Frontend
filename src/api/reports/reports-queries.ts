import { useQuery, useMutation, type UseQueryOptions, type UseMutationOptions } from "@tanstack/react-query";
import { QUERY_KEYS } from "../queryKeys";
import { apiClient } from "@/config/api-client";
import { Api } from "@/constants/api";

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
  status: "pending" | "verified" | "in_progress" | "resolved" | "rejected";
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
  aiReview?: AiReview | null;
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
  status?: string;
  kategoriId?: string;
  dinasId?: string;
  cabangDinasId?: string;
  createdById?: string;
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

export type ReportsDashboardTabKey = "semua" | "baru" | "diproses" | "tuntas";
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
  dinas?: ReportLocation["dinas"];
  cabangDinas?: ReportLocation["cabangDinas"];
  kategori?: Pick<ReportCategory, "id" | "code" | "name"> | null;
}

export interface ReportsDashboardSummary {
  totalTarget: number;
  laporanBaru: number;
  diproses: number;
  tuntas: number;
  byStatusRaw: Record<string, number>;
}

export interface ReportsDashboardTab {
  key: ReportsDashboardTabKey;
  label: string;
  total: number;
}

export interface GetReportsDashboardRequest {
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
    queryFn: async () => {
      const response = await apiClient.get<GetReportLocationsResponse>(Api.reportLocations, {
        params,
      });
      return response.data;
    },
    ...options,
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
