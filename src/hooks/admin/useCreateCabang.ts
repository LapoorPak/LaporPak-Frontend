import { useMutationCreateCabang } from "@/api/admin/admin-queries";
import type { BaseResponse, Cabang } from "@/types/admin";
import type { UseMutationOptions } from "@tanstack/react-query";

export const useCreateCabang = (
  options?: Omit<UseMutationOptions<BaseResponse<Cabang>, Error, Partial<Cabang>>, "mutationFn">
) => {
  return useMutationCreateCabang(options);
};
