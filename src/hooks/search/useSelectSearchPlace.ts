import { useCallback } from "react";
import type { DashboardViewMode } from "@/context/dashboard-view-mode";
import type { SearchResult } from "@/types/search";

type SelectedSearchLocation = {
  name: string;
  coords: [number, number];
};

type UseSelectSearchPlaceOptions = {
  focusMapOnCoordinates: (coords: [number, number], zoom?: number) => void;
  setSearchedLocation: (location: SelectedSearchLocation) => void;
  setSearchQuery: (query: string) => void;
  setShowSearch: (isOpen: boolean) => void;
  setViewMode?: (mode: DashboardViewMode) => void;
  zoom?: number;
};

export function useSelectSearchPlace({
  focusMapOnCoordinates,
  setSearchedLocation,
  setSearchQuery,
  setShowSearch,
  setViewMode,
  zoom = 15,
}: UseSelectSearchPlaceOptions) {
  return useCallback(
    (place: SearchResult) => {
      const coords: [number, number] = [place.lng, place.lat];

      setViewMode?.("map");
      focusMapOnCoordinates(coords, zoom);
      setSearchedLocation({ name: place.name, coords });
      setSearchQuery("");
      setShowSearch(false);
    },
    [
      focusMapOnCoordinates,
      setSearchQuery,
      setSearchedLocation,
      setShowSearch,
      setViewMode,
      zoom,
    ],
  );
}
