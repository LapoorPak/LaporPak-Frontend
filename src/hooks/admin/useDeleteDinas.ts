import { useMutationDeleteDinas } from "@/api/admin/admin-queries";
import type { BaseResponse } from "@/types/admin";
import type { UseMutationOptions } from "@tanstack/react-query";

export const useDeleteDinas = (
  options?: Omit<UseMutationOptions<BaseResponse<null>, Error, string>, "mutationFn">
) => {
  return useMutationDeleteDinas(options);
};
