import { useMutationCreateDinas } from "@/api/admin/admin-queries";
import type { BaseResponse, Dinas } from "@/types/admin";
import type { UseMutationOptions } from "@tanstack/react-query";

export const useCreateDinas = (
  options?: Omit<UseMutationOptions<BaseResponse<Dinas>, Error, Partial<Dinas>>, "mutationFn">
) => {
  return useMutationCreateDinas(options);
};
