import { useQueryGetMyReportLocations, type GetReportLocationsRequest } from "@/api/reports/reports-queries";

export const useGetMyReportLocations = (params?: Omit<GetReportLocationsRequest, "createdById">, options = {}) => {
  const query = useQueryGetMyReportLocations(params, options);
  
  return query;
};
