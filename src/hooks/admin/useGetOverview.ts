import { useQueryGetOverview } from "@/api/admin/admin-queries";
import type { BaseResponse, AdminOverview } from "@/types/admin";
import type { UseQueryOptions } from "@tanstack/react-query";

export const useGetOverview = (
  options?: Omit<UseQueryOptions<BaseResponse<AdminOverview>, Error, BaseResponse<AdminOverview>, [string]>, "queryKey" | "queryFn">
) => {
  return useQueryGetOverview(options);
};
