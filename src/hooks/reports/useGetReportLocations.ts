import type { UseQueryOptions } from "@tanstack/react-query";
import {
  useQueryGetReportLocations,
  type GetReportLocationsRequest,
  type GetReportLocationsResponse,
} from "@/api/reports";

export const useGetReportLocations = (
  params: GetReportLocationsRequest = {},
  options?: Omit<
    UseQueryOptions<
      GetReportLocationsResponse,
      Error,
      GetReportLocationsResponse,
      [string, GetReportLocationsRequest | undefined]
    >,
    "queryKey" | "queryFn"
  >,
) => {
  const query = useQueryGetReportLocations(params, options);
  
  return query;
};
