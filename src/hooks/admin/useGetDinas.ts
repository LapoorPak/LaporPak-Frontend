import { useQueryGetDinas, type GetDinasParams } from "@/api/admin/admin-queries";
import type { ListResponse, Dinas } from "@/types/admin";
import type { UseQueryOptions } from "@tanstack/react-query";

export const useGetDinas = (
  params?: GetDinasParams,
  options?: Omit<UseQueryOptions<ListResponse<Dinas>, Error, ListResponse<Dinas>, [string, GetDinasParams | undefined]>, "queryKey" | "queryFn">
) => {
  return useQueryGetDinas(params, options);
};
