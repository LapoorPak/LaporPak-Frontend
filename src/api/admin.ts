import { apiClient } from "@/config/api-client";
import { AdminApi } from "@/constants/api";
import type { BaseResponse, ListResponse, AdminOverview, Dinas, Cabang, Kategori, User } from "@/types/admin";

export const adminApi = {
  // Overview
  getOverview: async () => {
    const response = await apiClient.get<BaseResponse<AdminOverview>>(AdminApi.overview);
    return response.data;
  },

  // Dinas
  getDinas: async (params?: { search?: string; isActive?: boolean; page?: number; limit?: number }) => {
    const response = await apiClient.get<ListResponse<Dinas>>(AdminApi.dinas, { params });
    return response.data;
  },
  createDinas: async (data: Partial<Dinas>) => {
    const response = await apiClient.post<BaseResponse<Dinas>>(AdminApi.dinas, data);
    return response.data;
  },
  updateDinas: async (id: string, data: Partial<Dinas>) => {
    const response = await apiClient.patch<BaseResponse<Dinas>>(AdminApi.dinasById(id), data);
    return response.data;
  },
  deleteDinas: async (id: string) => {
    const response = await apiClient.delete<BaseResponse<null>>(AdminApi.dinasById(id));
    return response.data;
  },

  // Cabang
  getCabang: async (params?: { search?: string; dinasId?: string; wilayah?: string; cityRegency?: string; isRoutingEnabled?: boolean; page?: number; limit?: number }) => {
    const response = await apiClient.get<ListResponse<Cabang>>(AdminApi.cabang, { params });
    return response.data;
  },
  createCabang: async (data: Partial<Cabang>) => {
    const response = await apiClient.post<BaseResponse<Cabang>>(AdminApi.cabang, data);
    return response.data;
  },
  updateCabang: async (id: string, data: Partial<Cabang>) => {
    const response = await apiClient.patch<BaseResponse<Cabang>>(AdminApi.cabangById(id), data);
    return response.data;
  },
  deleteCabang: async (id: string) => {
    const response = await apiClient.delete<BaseResponse<null>>(AdminApi.cabangById(id));
    return response.data;
  },

  // Kategori
  getKategori: async (params?: { search?: string; dinasId?: string; isActive?: boolean; page?: number; limit?: number }) => {
    const response = await apiClient.get<ListResponse<Kategori>>(AdminApi.kategori, { params });
    return response.data;
  },
  createKategori: async (data: Partial<Kategori>) => {
    const response = await apiClient.post<BaseResponse<Kategori>>(AdminApi.kategori, data);
    return response.data;
  },
  updateKategori: async (id: string, data: Partial<Kategori>) => {
    const response = await apiClient.patch<BaseResponse<Kategori>>(AdminApi.kategoriById(id), data);
    return response.data;
  },
  deleteKategori: async (id: string) => {
    const response = await apiClient.delete<BaseResponse<null>>(AdminApi.kategoriById(id));
    return response.data;
  },

  // Users
  getUsers: async (params?: { search?: string; role?: string; banned?: boolean; hasPetugas?: boolean; page?: number; limit?: number }) => {
    const response = await apiClient.get<ListResponse<User>>(AdminApi.users, { params });
    return response.data;
  },
  getUser: async (id: string) => {
    const response = await apiClient.get<BaseResponse<User>>(AdminApi.userById(id));
    return response.data;
  },
  updateUser: async (id: string, data: Partial<User>) => {
    const response = await apiClient.patch<BaseResponse<User>>(AdminApi.userById(id), data);
    return response.data;
  },
  resetUserPassword: async (id: string, newPassword?: string) => {
    const response = await apiClient.post<BaseResponse<null>>(AdminApi.userResetPassword(id), { newPassword });
    return response.data;
  },
  assignPetugas: async (id: string, data: { cabangDinasId: string; nip?: string }) => {
    const response = await apiClient.post<BaseResponse<User>>(AdminApi.userAssignPetugas(id), data);
    return response.data;
  },
  removePetugas: async (id: string) => {
    const response = await apiClient.delete<BaseResponse<null>>(AdminApi.userAssignPetugas(id));
    return response.data;
  },
};
