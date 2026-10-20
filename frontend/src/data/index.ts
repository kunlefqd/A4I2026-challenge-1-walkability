import type { CityData } from '../types';
import { mockCityData } from './mock';

/**
 * Single entry point for everything the UI shows about the city.
 * Swap the body for a fetch to your backend once the data lane exposes one;
 * the rest of the UI only depends on the CityData shape.
 */
export async function loadCityData(): Promise<CityData> {
  return mockCityData();
}
