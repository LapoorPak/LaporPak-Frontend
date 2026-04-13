import { useMutationRemovePetugas } from "@/api/admin/admin-queries";
import type { BaseResponse } from "@/types/admin";
import type { UseMutationOptions } from "@tanstack/react-query";

export const useRemovePetugas = (
  options?: Omit<UseMutationOptions<BaseResponse<null>, Error, string>, "mutationFn">
) => {
  return useMutationRemovePetugas(options);
};
