import { useMutationUpdateCabang } from "@/api/admin/admin-queries";
import type { BaseResponse, Cabang } from "@/types/admin";
import type { UseMutationOptions } from "@tanstack/react-query";

export const useUpdateCabang = (
  options?: Omit<UseMutationOptions<BaseResponse<Cabang>, Error, { id: string; data: Partial<Cabang> }>, "mutationFn">
) => {
  return useMutationUpdateCabang(options);
};
