import { useMutationUpdateKategori } from "@/api/admin/admin-queries";
import type { BaseResponse, Kategori } from "@/types/admin";
import type { UseMutationOptions } from "@tanstack/react-query";

export const useUpdateKategori = (
  options?: Omit<UseMutationOptions<BaseResponse<Kategori>, Error, { id: string; data: Partial<Kategori> }>, "mutationFn">
) => {
  return useMutationUpdateKategori(options);
};
