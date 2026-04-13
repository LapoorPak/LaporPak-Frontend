import { useMutationCreateKategori } from "@/api/admin/admin-queries";
import type { BaseResponse, Kategori } from "@/types/admin";
import type { UseMutationOptions } from "@tanstack/react-query";

export const useCreateKategori = (
  options?: Omit<UseMutationOptions<BaseResponse<Kategori>, Error, Partial<Kategori>>, "mutationFn">
) => {
  return useMutationCreateKategori(options);
};
