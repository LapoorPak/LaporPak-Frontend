import { useMutationCreateReport } from "@/api/reports/reports-queries";
import type { UseMutationOptions } from "@tanstack/react-query";
import type { CreateReportRequest, CreateReportResponse } from "@/api/reports/reports-queries";

export const useCreateReport = (
  options?: Omit<UseMutationOptions<CreateReportResponse, Error, CreateReportRequest>, "mutationFn">
) => {
  const mutation = useMutationCreateReport(options);
  
  return mutation;
};
