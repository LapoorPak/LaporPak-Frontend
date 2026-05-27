import {
  useQueryGetDinas,
  useQueryGetDinasActivity,
  type GetDinasActivityParams,
  type GetDinasParams,
} from "@/api/admin/admin-queries";
import type { BaseResponse, Dinas, DinasActivity, ListResponse } from "@/types/admin";
import type { UseQueryOptions } from "@tanstack/react-query";

export const useGetDinas = (
  params?: GetDinasParams,
  options?: Omit<UseQueryOptions<ListResponse<Dinas>, Error, ListResponse<Dinas>, [string, GetDinasParams | undefined]>, "queryKey" | "queryFn">
) => {
  return useQueryGetDinas(params, options);
};

export const useGetDinasActivity = (
  params?: GetDinasActivityParams,
  options?: Omit<UseQueryOptions<BaseResponse<DinasActivity>, Error, BaseResponse<DinasActivity>, [string, GetDinasActivityParams | undefined]>, "queryKey" | "queryFn">
) => {
  return useQueryGetDinasActivity(params, options);
};
