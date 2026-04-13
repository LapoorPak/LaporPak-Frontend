import { useMutationUpdateDinas } from "@/api/admin/admin-queries";
import type { BaseResponse, Dinas } from "@/types/admin";
import type { UseMutationOptions } from "@tanstack/react-query";

export const useUpdateDinas = (
  options?: Omit<UseMutationOptions<BaseResponse<Dinas>, Error, { id: string; data: Partial<Dinas> }>, "mutationFn">
) => {
  return useMutationUpdateDinas(options);
};
