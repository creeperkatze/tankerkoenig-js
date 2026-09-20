/** Fuel types accepted by the `type` query parameter. */
export const FUEL_TYPES = ['e5', 'e10', 'diesel', 'all'] as const;

/** A fuel type accepted by the `type` query parameter. */
export type FuelType = (typeof FUEL_TYPES)[number];

/** Sort orders accepted by {@link ListOptions.sort}. */
export const SORT_OPTIONS = ['price', 'dist'] as const;

/** A sort order accepted by {@link ListOptions.sort}. */
export type SortOption = (typeof SORT_OPTIONS)[number];

/** A gas station with current prices, as returned by a radius search. */
export interface Station {
  id: string;
  name: string;
  brand: string;
  street: string;
  houseNumber: string;
  postCode: number;
  place: string;
  lat: number;
  lng: number;
  dist: number;
  e5: number | false;
  e10: number | false;
  diesel: number | false;
  isOpen: boolean;
}

/** A single opening-hours entry on a {@link StationDetail}. */
export interface OpeningTime {
  text: string;
  start: string;
  end: string;
}

/** Full station info, including opening times and price overrides. */
export interface StationDetail {
  id: string;
  name: string;
  brand: string;
  street: string;
  houseNumber: string;
  postCode: number;
  place: string;
  lat: number;
  lng: number;
  e5: number | false;
  e10: number | false;
  diesel: number | false;
  isOpen: boolean;
  wholeDay: boolean;
  state: string | null;
  openingTimes: OpeningTime[];
  overrides: string[];
}

/** Current prices for a single station, as returned by a bulk price check. */
export interface PriceEntry {
  status: 'open' | 'closed' | 'no prices';
  e5?: number | false;
  e10?: number | false;
  diesel?: number | false;
}

/** Options for {@link TankerkoenigClient.list}. */
export interface ListOptions {
  lat: number;
  lng: number;
  rad: number;
  type: FuelType;
  sort?: SortOption;
}
