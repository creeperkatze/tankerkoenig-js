export const BASE_URL = 'https://creativecommons.tankerkoenig.de/json' as const;

export const FUEL_TYPES = ['e5', 'e10', 'diesel', 'all'] as const;
export const SORT_OPTIONS = ['price', 'dist'] as const;
export const COMPLAINT_TYPES = [
  'wrongPetrolStationName',
  'wrongStatusOpen',
  'wrongStatusClosed',
  'wrongPriceE5',
  'wrongPriceE10',
  'wrongPriceDiesel',
  'wrongPetrolStationBrand',
  'wrongPetrolStationStreet',
  'wrongPetrolStationHouseNumber',
  'wrongPetrolStationPostcode',
  'wrongPetrolStationPlace',
  'wrongPetrolStationLocation',
] as const;
