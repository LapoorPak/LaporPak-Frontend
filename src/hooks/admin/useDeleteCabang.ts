import { useMutationDeleteCabang } from "@/api/admin/admin-queries";
import type { BaseResponse } from "@/types/admin";
import type { UseMutationOptions } from "@tanstack/react-query";

export const useDeleteCabang = (
  options?: Omit<UseMutationOptions<BaseResponse<null>, Error, string>, "mutationFn">
) => {
  return useMutationDeleteCabang(options);
};
