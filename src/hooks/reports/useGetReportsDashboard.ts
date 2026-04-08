import {
  useQueryGetReportsDashboard,
  type GetReportsDashboardRequest,
  type GetReportsDashboardResponse,
} from "@/api/reports/reports-queries";
import type { UseQueryOptions } from "@tanstack/react-query";

export const useGetReportsDashboard = (
  params: GetReportsDashboardRequest = {},
  options?: Omit<
    UseQueryOptions<
      GetReportsDashboardResponse,
      Error,
      GetReportsDashboardResponse,
      [string, GetReportsDashboardRequest | undefined]
    >,
    "queryKey" | "queryFn"
  >
) => {
  const query = useQueryGetReportsDashboard(params, options);

  return query;
};
