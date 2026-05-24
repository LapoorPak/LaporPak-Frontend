import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/api/queryKeys";
import { apiClient } from "@/config/api-client";
import { Api } from "@/constants/api";
import type {
  GetAgencyLocationsRequest,
  GetAgencyLocationsResponse,
} from "@/types/agencies";

export type {
  AgencyLocation,
  AgencyStats,
  GetAgencyLocationsRequest,
  GetAgencyLocationsResponse,
} from "@/types/agencies";

export function useQueryGetAgencyLocations<TData = GetAgencyLocationsResponse, TError = Error>(
  params?: GetAgencyLocationsRequest,
  options?: Omit<
    UseQueryOptions<GetAgencyLocationsResponse, TError, TData, [string, GetAgencyLocationsRequest | undefined]>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: [QUERY_KEYS.AGENCIES_LOCATIONS, params],
    queryFn: async () => {
      const response = await apiClient.get<GetAgencyLocationsResponse>(Api.agencyLocations, {
        params,
      });
      return response.data;
    },
    ...options,
  });
}
