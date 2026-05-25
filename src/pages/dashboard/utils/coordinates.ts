type Coordinates = {
  lat?: number | null;
  lng?: number | null;
};

export function hasValidLngLat(value: Coordinates | null | undefined) {
  return Number.isFinite(value?.lng) && Number.isFinite(value?.lat);
}

export function hasValidCoordinatePair(coords: [number, number] | null | undefined) {
  return Boolean(coords && Number.isFinite(coords[0]) && Number.isFinite(coords[1]));
}
