import {
  useQueryGetAdminLaporan,
  useQueryGetReportActivity,
  type GetAdminLaporanParams,
  type GetReportActivityParams,
} from "@/api/admin/admin-queries";
import type { UseQueryOptions } from "@tanstack/react-query";
import type { BaseResponse, ListResponse } from "@/types/admin";
import type { AdminLaporan, ReportActivity } from "@/types/admin";

export const useGetAdminLaporan = (
  params?: GetAdminLaporanParams,
  options?: Omit<UseQueryOptions<ListResponse<AdminLaporan>, Error, ListResponse<AdminLaporan>, [string, GetAdminLaporanParams | undefined]>, "queryKey" | "queryFn">
) => {
  return useQueryGetAdminLaporan(params, options);
};

export const useGetReportActivity = (
  params?: GetReportActivityParams,
  options?: Omit<UseQueryOptions<BaseResponse<ReportActivity>, Error, BaseResponse<ReportActivity>, [string, GetReportActivityParams | undefined]>, "queryKey" | "queryFn">
) => {
  return useQueryGetReportActivity(params, options);
};
