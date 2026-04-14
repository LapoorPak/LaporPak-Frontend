import { useMutationAssignAdminLaporan } from "@/api/admin/admin-queries";
import type { UseMutationOptions } from "@tanstack/react-query";
import type { BaseResponse, AdminLaporan } from "@/types/admin";

export const useAssignAdminLaporan = (
  options?: Omit<UseMutationOptions<BaseResponse<AdminLaporan>, Error, { id: string; cabangDinasId: string }>, "mutationFn">
) => {
  return useMutationAssignAdminLaporan(options);
};
