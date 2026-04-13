import { useMutationResetUserPassword } from "@/api/admin/admin-queries";
import type { BaseResponse } from "@/types/admin";
import type { UseMutationOptions } from "@tanstack/react-query";

export const useResetUserPassword = (
  options?: Omit<UseMutationOptions<BaseResponse<null>, Error, { id: string; newPassword?: string }>, "mutationFn">
) => {
  return useMutationResetUserPassword(options);
};
