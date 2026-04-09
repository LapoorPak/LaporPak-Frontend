import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { QUERY_KEYS } from "../queryKeys";
import { apiClient } from "@/config/api-client";
import { Api } from "@/constants/api";

export interface AgencyLocation {
  id: string;
  dinasId: string;
  dinasCode: string;
  dinasName: string;
  dinasShort: string;
  type: string;
  name: string;
  lat: number;
  lng: number;
  wilayah: string;
  address: string;
  phone: string;
  cityRegency: string;
  province: string;
  coverageRadiusKm: number;
  isRoutingEnabled: boolean;
  serviceTags: string[];
  photos: string[];
  photoUrl: string | null;
}

export interface AgencyStats {
  total: number;
  byType: {
    dinasId: string;
    type: string;
    dinasName: string;
    total: number;
  }[];
  byCityRegency: {
    cityRegency: string;
    total: number;
  }[];
}

export interface GetAgencyLocationsResponse {
  data: AgencyLocation[];
  stats: AgencyStats;
}

export interface GetAgencyLocationsRequest {
  search?: string;
  type?: string;
  dinasId?: string;
  cityRegency?: string;
  wilayah?: string;
}

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
