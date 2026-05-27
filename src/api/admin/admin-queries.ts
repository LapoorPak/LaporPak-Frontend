import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import { apiClient } from "@/config/api-client";
import { Api } from "@/constants/api";
import { QUERY_KEYS } from "@/api/queryKeys";
import type { BaseResponse, ListResponse, AdminOverview, Dinas, DinasActivity, Cabang, CabangActivity, Kategori, CategoryActivity, User, UserActivity, ReportActivity, AdminLaporan } from "@/types/admin";

// ─── Param types ───────────────────────────────────────────────────────────────

export interface GetDinasParams {
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface GetDinasActivityParams {
  search?: string;
  isActive?: boolean;
}

export interface GetCabangParams {
  search?: string;
  dinasId?: string;
  wilayah?: string;
  cityRegency?: string;
  isRoutingEnabled?: boolean;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface GetCabangActivityParams {
  search?: string;
  dinasId?: string;
  wilayah?: string;
  cityRegency?: string;
  isRoutingEnabled?: boolean;
}

export interface GetKategoriParams {
  search?: string;
  dinasId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface GetKategoriActivityParams {
  search?: string;
  dinasId?: string;
  isActive?: boolean;
}

export interface GetUsersParams {
  search?: string;
  role?: string;
  banned?: boolean;
  hasPetugas?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface GetUserActivityParams {
  days?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface GetReportActivityParams {
  days?: number;
  search?: string;
  status?: string;
  dinasId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ─── Overview ──────────────────────────────────────────────────────────────────

export function useQueryGetOverview<TData = BaseResponse<AdminOverview>, TError = Error>(
  options?: Omit<UseQueryOptions<BaseResponse<AdminOverview>, TError, TData, [string]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN_OVERVIEW],
    queryFn: async () => {
      const response = await apiClient.get<BaseResponse<AdminOverview>>(Api.adminOverview);
      return response.data;
    },
    ...options,
  });
}

// ─── Dinas ─────────────────────────────────────────────────────────────────────

export function useQueryGetDinas<TData = ListResponse<Dinas>, TError = Error>(
  params?: GetDinasParams,
  options?: Omit<UseQueryOptions<ListResponse<Dinas>, TError, TData, [string, GetDinasParams | undefined]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN_DINAS, params],
    queryFn: async () => {
      const response = await apiClient.get<ListResponse<Dinas>>(Api.adminDinas, { params });
      return response.data;
    },
    ...options,
  });
}

export function useQueryGetDinasActivity<TData = BaseResponse<DinasActivity>, TError = Error>(
  params?: GetDinasActivityParams,
  options?: Omit<UseQueryOptions<BaseResponse<DinasActivity>, TError, TData, [string, GetDinasActivityParams | undefined]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN_DINAS_ACTIVITY, params],
    queryFn: async () => {
      const response = await apiClient.get<BaseResponse<DinasActivity>>(Api.adminDinasActivity, { params });
      return response.data;
    },
    ...options,
  });
}

export function useMutationCreateDinas(
  options?: Omit<UseMutationOptions<BaseResponse<Dinas>, Error, Partial<Dinas>>, "mutationFn">
) {
  return useMutation({
    mutationFn: async (data: Partial<Dinas>) => {
      const response = await apiClient.post<BaseResponse<Dinas>>(Api.adminDinas, data);
      return response.data;
    },
    ...options,
  });
}

export function useMutationUpdateDinas(
  options?: Omit<UseMutationOptions<BaseResponse<Dinas>, Error, { id: string; data: Partial<Dinas> }>, "mutationFn">
) {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Dinas> }) => {
      const response = await apiClient.patch<BaseResponse<Dinas>>(Api.adminDinasById(id), data);
      return response.data;
    },
    ...options,
  });
}

export function useMutationDeleteDinas(
  options?: Omit<UseMutationOptions<BaseResponse<null>, Error, string>, "mutationFn">
) {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<BaseResponse<null>>(Api.adminDinasById(id));
      return response.data;
    },
    ...options,
  });
}

// ─── Cabang ────────────────────────────────────────────────────────────────────

export function useQueryGetCabang<TData = ListResponse<Cabang>, TError = Error>(
  params?: GetCabangParams,
  options?: Omit<UseQueryOptions<ListResponse<Cabang>, TError, TData, [string, GetCabangParams | undefined]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN_CABANG, params],
    queryFn: async () => {
      const response = await apiClient.get<ListResponse<Cabang>>(Api.adminCabang, { params });
      return response.data;
    },
    ...options,
  });
}

export function useQueryGetCabangActivity<TData = BaseResponse<CabangActivity>, TError = Error>(
  params?: GetCabangActivityParams,
  options?: Omit<UseQueryOptions<BaseResponse<CabangActivity>, TError, TData, [string, GetCabangActivityParams | undefined]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN_CABANG_ACTIVITY, params],
    queryFn: async () => {
      const response = await apiClient.get<BaseResponse<CabangActivity>>(Api.adminCabangActivity, { params });
      return response.data;
    },
    ...options,
  });
}

export function useMutationCreateCabang(
  options?: Omit<UseMutationOptions<BaseResponse<Cabang>, Error, Partial<Cabang>>, "mutationFn">
) {
  return useMutation({
    mutationFn: async (data: Partial<Cabang>) => {
      const response = await apiClient.post<BaseResponse<Cabang>>(Api.adminCabang, data);
      return response.data;
    },
    ...options,
  });
}

export function useMutationUpdateCabang(
  options?: Omit<UseMutationOptions<BaseResponse<Cabang>, Error, { id: string; data: Partial<Cabang> }>, "mutationFn">
) {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Cabang> }) => {
      const response = await apiClient.patch<BaseResponse<Cabang>>(Api.adminCabangById(id), data);
      return response.data;
    },
    ...options,
  });
}

export function useMutationDeleteCabang(
  options?: Omit<UseMutationOptions<BaseResponse<null>, Error, string>, "mutationFn">
) {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<BaseResponse<null>>(Api.adminCabangById(id));
      return response.data;
    },
    ...options,
  });
}

// ─── Kategori ──────────────────────────────────────────────────────────────────

export function useQueryGetKategori<TData = ListResponse<Kategori>, TError = Error>(
  params?: GetKategoriParams,
  options?: Omit<UseQueryOptions<ListResponse<Kategori>, TError, TData, [string, GetKategoriParams | undefined]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN_KATEGORI, params],
    queryFn: async () => {
      const response = await apiClient.get<ListResponse<Kategori>>(Api.adminKategori, { params });
      return response.data;
    },
    ...options,
  });
}

export function useQueryGetKategoriActivity<TData = BaseResponse<CategoryActivity>, TError = Error>(
  params?: GetKategoriActivityParams,
  options?: Omit<UseQueryOptions<BaseResponse<CategoryActivity>, TError, TData, [string, GetKategoriActivityParams | undefined]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN_KATEGORI_ACTIVITY, params],
    queryFn: async () => {
      const response = await apiClient.get<BaseResponse<CategoryActivity>>(Api.adminKategoriActivity, { params });
      return response.data;
    },
    ...options,
  });
}

export function useMutationCreateKategori(
  options?: Omit<UseMutationOptions<BaseResponse<Kategori>, Error, Partial<Kategori>>, "mutationFn">
) {
  return useMutation({
    mutationFn: async (data: Partial<Kategori>) => {
      const response = await apiClient.post<BaseResponse<Kategori>>(Api.adminKategori, data);
      return response.data;
    },
    ...options,
  });
}

export function useMutationUpdateKategori(
  options?: Omit<UseMutationOptions<BaseResponse<Kategori>, Error, { id: string; data: Partial<Kategori> }>, "mutationFn">
) {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Kategori> }) => {
      const response = await apiClient.patch<BaseResponse<Kategori>>(Api.adminKategoriById(id), data);
      return response.data;
    },
    ...options,
  });
}

export function useMutationDeleteKategori(
  options?: Omit<UseMutationOptions<BaseResponse<null>, Error, string>, "mutationFn">
) {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<BaseResponse<null>>(Api.adminKategoriById(id));
      return response.data;
    },
    ...options,
  });
}

// ─── Users ─────────────────────────────────────────────────────────────────────

export function useQueryGetUsers<TData = ListResponse<User>, TError = Error>(
  params?: GetUsersParams,
  options?: Omit<UseQueryOptions<ListResponse<User>, TError, TData, [string, GetUsersParams | undefined]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN_USERS, params],
    queryFn: async () => {
      const response = await apiClient.get<ListResponse<User>>(Api.adminUsers, { params });
      return response.data;
    },
    ...options,
  });
}

export function useQueryGetUserActivity<TData = BaseResponse<UserActivity>, TError = Error>(
  params?: GetUserActivityParams,
  options?: Omit<UseQueryOptions<BaseResponse<UserActivity>, TError, TData, [string, GetUserActivityParams | undefined]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN_USER_ACTIVITY, params],
    queryFn: async () => {
      const response = await apiClient.get<BaseResponse<UserActivity>>(Api.adminUserActivity, { params });
      return response.data;
    },
    ...options,
  });
}

export function useMutationUpdateUser(
  options?: Omit<UseMutationOptions<BaseResponse<User>, Error, { id: string; data: Partial<User> }>, "mutationFn">
) {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const response = await apiClient.patch<BaseResponse<User>>(Api.adminUserById(id), data);
      return response.data;
    },
    ...options,
  });
}

export function useMutationResetUserPassword(
  options?: Omit<UseMutationOptions<BaseResponse<null>, Error, { id: string; newPassword?: string }>, "mutationFn">
) {
  return useMutation({
    mutationFn: async ({ id, newPassword }: { id: string; newPassword?: string }) => {
      const response = await apiClient.post<BaseResponse<null>>(Api.adminUserResetPassword(id), { newPassword });
      return response.data;
    },
    ...options,
  });
}

export function useMutationAssignPetugas(
  options?: Omit<UseMutationOptions<BaseResponse<User>, Error, { id: string; data: { cabangDinasId: string; nip?: string } }>, "mutationFn">
) {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { cabangDinasId: string; nip?: string } }) => {
      const response = await apiClient.post<BaseResponse<User>>(Api.adminUserAssignPetugas(id), data);
      return response.data;
    },
    ...options,
  });
}

export function useMutationRemovePetugas(
  options?: Omit<UseMutationOptions<BaseResponse<null>, Error, string>, "mutationFn">
) {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<BaseResponse<null>>(Api.adminUserAssignPetugas(id));
      return response.data;
    },
    ...options,
  });
}

// ─── Admin Laporan ──────────────────────────────────────────────────────────────

export interface GetAdminLaporanParams {
  search?: string;
  status?: string;
  dinasId?: string;
  cabangDinasId?: string;
  kategoriId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export function useQueryGetAdminLaporan<TData = ListResponse<AdminLaporan>, TError = Error>(
  params?: GetAdminLaporanParams,
  options?: Omit<UseQueryOptions<ListResponse<AdminLaporan>, TError, TData, [string, GetAdminLaporanParams | undefined]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN_LAPORAN, params],
    queryFn: async () => {
      const response = await apiClient.get<ListResponse<AdminLaporan>>(Api.adminLaporan, { params });
      return response.data;
    },
    ...options,
  });
}

export function useQueryGetReportActivity<TData = BaseResponse<ReportActivity>, TError = Error>(
  params?: GetReportActivityParams,
  options?: Omit<UseQueryOptions<BaseResponse<ReportActivity>, TError, TData, [string, GetReportActivityParams | undefined]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN_REPORT_ACTIVITY, params],
    queryFn: async () => {
      const response = await apiClient.get<BaseResponse<ReportActivity>>(Api.adminReportActivity, { params });
      return response.data;
    },
    ...options,
  });
}

export function useMutationUpdateAdminLaporanStatus(
  options?: Omit<UseMutationOptions<BaseResponse<AdminLaporan>, Error, { id: string; status: string; agencyNote?: string; resolutionNote?: string }>, "mutationFn">
) {
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const response = await apiClient.patch<BaseResponse<AdminLaporan>>(Api.adminLaporanStatus(id), data);
      return response.data;
    },
    ...options,
  });
}

export function useMutationAssignAdminLaporan(
  options?: Omit<UseMutationOptions<BaseResponse<AdminLaporan>, Error, { id: string; cabangDinasId: string }>, "mutationFn">
) {
  return useMutation({
    mutationFn: async ({ id, cabangDinasId }) => {
      const response = await apiClient.patch<BaseResponse<AdminLaporan>>(Api.adminLaporanAssign(id), { cabangDinasId });
      return response.data;
    },
    ...options,
  });
}

export function useMutationDeleteAdminLaporan(
  options?: Omit<UseMutationOptions<BaseResponse<null>, Error, string>, "mutationFn">
) {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<BaseResponse<null>>(Api.adminLaporanById(id));
      return response.data;
    },
    ...options,
  });
}
