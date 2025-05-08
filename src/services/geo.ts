/**
 * Represents a geographical location with latitude and longitude coordinates.
 */
export interface Location {
  /**
   * The latitude of the location.
   */
  lat: number;
  /**
   * The longitude of the location.
   */
  lng: number;
}

/**
 * Finds workers near a given location.
 *
 * @param location The location to search near.
 * @param radiusInKm The search radius in kilometers.
 * @returns A promise that resolves to a list of worker IDs.
 */
export async function findWorkersNear(location: Location, radiusInKm: number): Promise<string[]> {
  // TODO: Implement this by calling the GeoFire API.
  return [
    'worker1',
    'worker2',
  ];
}
