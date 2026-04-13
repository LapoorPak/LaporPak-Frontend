import { useQueryGetCabang, type GetCabangParams } from "@/api/admin/admin-queries";
import type { ListResponse, Cabang } from "@/types/admin";
import type { UseQueryOptions } from "@tanstack/react-query";

export const useGetCabang = (
  params?: GetCabangParams,
  options?: Omit<UseQueryOptions<ListResponse<Cabang>, Error, ListResponse<Cabang>, [string, GetCabangParams | undefined]>, "queryKey" | "queryFn">
) => {
  return useQueryGetCabang(params, options);
};
