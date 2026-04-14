import { useMutationDeleteAdminLaporan } from "@/api/admin/admin-queries";
import type { UseMutationOptions } from "@tanstack/react-query";
import type { BaseResponse } from "@/types/admin";

export const useDeleteAdminLaporan = (
  options?: Omit<UseMutationOptions<BaseResponse<null>, Error, string>, "mutationFn">
) => {
  return useMutationDeleteAdminLaporan(options);
};
