import { useMutationUpdateAdminLaporanStatus } from "@/api/admin/admin-queries";
import type { UseMutationOptions } from "@tanstack/react-query";
import type { BaseResponse, AdminLaporan } from "@/types/admin";

export const useUpdateAdminLaporanStatus = (
  options?: Omit<UseMutationOptions<BaseResponse<AdminLaporan>, Error, { id: string; status: string; agencyNote?: string; resolutionNote?: string }>, "mutationFn">
) => {
  return useMutationUpdateAdminLaporanStatus(options);
};
