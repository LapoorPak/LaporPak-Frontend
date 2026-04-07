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

export function useQueryGetMyReports<TData = GetReportLocationsResponse, TError = Error>(
  params?: GetMyReportsRequest,
  options?: Omit<
    UseQueryOptions<GetReportLocationsResponse, TError, TData, [string, GetMyReportsRequest | undefined]>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: ["my-reports", params],
    queryFn: async () => {
      const response = await apiClient.get<GetReportLocationsResponse>(Api.myReports, {
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

// Hook for GET /api/reports/me/locations
export function useQueryGetMyReportLocations<TData = GetReportLocationsResponse, TError = Error>(
  params?: Omit<GetReportLocationsRequest, "createdById">,
  options?: Omit<
    UseQueryOptions<GetReportLocationsResponse, TError, TData, [string, Omit<GetReportLocationsRequest, "createdById"> | undefined]>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: [QUERY_KEYS.MY_REPORTS_LOCATIONS, params],
    queryFn: async () => {
      const response = await apiClient.get<GetReportLocationsResponse>(Api.myReportsLocations, {
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
