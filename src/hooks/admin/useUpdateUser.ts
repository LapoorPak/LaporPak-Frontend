import { useMutationUpdateUser } from "@/api/admin/admin-queries";
import type { BaseResponse, User } from "@/types/admin";
import type { UseMutationOptions } from "@tanstack/react-query";

export const useUpdateUser = (
  options?: Omit<UseMutationOptions<BaseResponse<User>, Error, { id: string; data: Partial<User> }>, "mutationFn">
) => {
  return useMutationUpdateUser(options);
};
