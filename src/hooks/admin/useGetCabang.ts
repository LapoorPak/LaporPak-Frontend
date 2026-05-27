import {
  useQueryGetCabang,
  useQueryGetCabangActivity,
  type GetCabangActivityParams,
  type GetCabangParams,
} from "@/api/admin/admin-queries";
import type { BaseResponse, Cabang, CabangActivity, ListResponse } from "@/types/admin";
import type { UseQueryOptions } from "@tanstack/react-query";

export const useGetCabang = (
  params?: GetCabangParams,
  options?: Omit<UseQueryOptions<ListResponse<Cabang>, Error, ListResponse<Cabang>, [string, GetCabangParams | undefined]>, "queryKey" | "queryFn">
) => {
  return useQueryGetCabang(params, options);
};

export const useGetCabangActivity = (
  params?: GetCabangActivityParams,
  options?: Omit<UseQueryOptions<BaseResponse<CabangActivity>, Error, BaseResponse<CabangActivity>, [string, GetCabangActivityParams | undefined]>, "queryKey" | "queryFn">
) => {
  return useQueryGetCabangActivity(params, options);
};
