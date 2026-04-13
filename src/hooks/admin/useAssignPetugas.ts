import { useMutationAssignPetugas } from "@/api/admin/admin-queries";
import type { BaseResponse, User } from "@/types/admin";
import type { UseMutationOptions } from "@tanstack/react-query";

export const useAssignPetugas = (
  options?: Omit<UseMutationOptions<BaseResponse<User>, Error, { id: string; data: { cabangDinasId: string; nip?: string } }>, "mutationFn">
) => {
  return useMutationAssignPetugas(options);
};
