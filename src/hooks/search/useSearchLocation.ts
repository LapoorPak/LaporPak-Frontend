import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { SearchResult } from "@/types/search";

interface NominatimResponse {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    suburb?: string;
    city_district?: string;
    city?: string;
    village?: string;
    state?: string;
  };
}

export function useQuerySearchLocation(
  searchQuery: string,
  options?: Omit<UseQueryOptions<SearchResult[], Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: ["nominatim-search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim() || searchQuery.trim().length < 2) {
        return [];
      }
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=id&limit=6&addressdetails=1`,
        { headers: { "Accept-Language": "id" } }
      );
      if (!res.ok) throw new Error("Failed to search location");
      const data: NominatimResponse[] = await res.json();
      
      return data.map((item) => {
        const addr = item.address;
        const mainText = addr.road || addr.village || addr.suburb || item.display_name.split(",")[0];
        const subText = [addr.city_district, addr.city, addr.state].filter(Boolean).join(", ");
        return {
          name: mainText,
          sub: subText || "Indonesia",
          lng: parseFloat(item.lon),
          lat: parseFloat(item.lat),
        };
      });
    },
    ...options,
  });
}
