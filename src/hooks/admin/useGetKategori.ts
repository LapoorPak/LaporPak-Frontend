import {
  useQueryGetKategori,
  useQueryGetKategoriActivity,
  type GetKategoriActivityParams,
  type GetKategoriParams,
} from "@/api/admin/admin-queries";
import type { BaseResponse, CategoryActivity, ListResponse, Kategori } from "@/types/admin";
import type { UseQueryOptions } from "@tanstack/react-query";

export const useGetKategori = (
  params?: GetKategoriParams,
  options?: Omit<UseQueryOptions<ListResponse<Kategori>, Error, ListResponse<Kategori>, [string, GetKategoriParams | undefined]>, "queryKey" | "queryFn">
) => {
  return useQueryGetKategori(params, options);
};

export const useGetKategoriActivity = (
  params?: GetKategoriActivityParams,
  options?: Omit<UseQueryOptions<BaseResponse<CategoryActivity>, Error, BaseResponse<CategoryActivity>, [string, GetKategoriActivityParams | undefined]>, "queryKey" | "queryFn">
) => {
  return useQueryGetKategoriActivity(params, options);
};
