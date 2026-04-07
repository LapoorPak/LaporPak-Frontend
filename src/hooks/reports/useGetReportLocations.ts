import { useQueryGetReportLocations, type GetReportLocationsRequest } from "@/api/reports/reports-queries";

export const useGetReportLocations = (params: GetReportLocationsRequest = {}) => {
  const query = useQueryGetReportLocations(params);
  
  return query;
};
