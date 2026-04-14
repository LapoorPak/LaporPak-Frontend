import { useQueryGetAdminLaporan, type GetAdminLaporanParams } from "@/api/admin/admin-queries";
import type { UseQueryOptions } from "@tanstack/react-query";
import type { ListResponse } from "@/types/admin";
import type { AdminLaporan } from "@/types/admin";

export const useGetAdminLaporan = (
  params?: GetAdminLaporanParams,
  options?: Omit<UseQueryOptions<ListResponse<AdminLaporan>, Error, ListResponse<AdminLaporan>, [string, GetAdminLaporanParams | undefined]>, "queryKey" | "queryFn">
) => {
  return useQueryGetAdminLaporan(params, options);
};
