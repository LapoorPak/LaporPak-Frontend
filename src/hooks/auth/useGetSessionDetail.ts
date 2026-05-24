import {
  useQueryGetSessionDetail,
  type GetSessionDetailResponse,
} from "@/api/auth/auth-queries";
import type { UseQueryOptions } from "@tanstack/react-query";

export const useGetSessionDetail = (
  options?: Omit<
    UseQueryOptions<GetSessionDetailResponse, Error, GetSessionDetailResponse, [string]>,
    "queryKey" | "queryFn"
  >,
) => {
  const query = useQueryGetSessionDetail(options);

  return query;
};
