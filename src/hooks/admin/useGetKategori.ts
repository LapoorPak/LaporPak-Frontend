import { useQueryGetKategori, type GetKategoriParams } from "@/api/admin/admin-queries";
import type { ListResponse, Kategori } from "@/types/admin";
import type { UseQueryOptions } from "@tanstack/react-query";

export const useGetKategori = (
  params?: GetKategoriParams,
  options?: Omit<UseQueryOptions<ListResponse<Kategori>, Error, ListResponse<Kategori>, [string, GetKategoriParams | undefined]>, "queryKey" | "queryFn">
) => {
  return useQueryGetKategori(params, options);
};
