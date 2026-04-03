import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/config/api-client";
import { Api } from "@/constants/api";
import { QUERY_KEYS } from "@/api/queryKeys";
import type { ReportCategory } from "@/types/report";

export const useQueryCategories = () =>
  useQuery<ReportCategory[]>({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: () => apiClient.get(Api.categories).then((r) => r.data),
  });
