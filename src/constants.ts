export const BASE_URL = "https://creativecommons.tankerkoenig.de/json" as const;

export const FUEL_TYPES = ["e5", "e10", "diesel", "all"] as const;
export const SORT_OPTIONS = ["price", "dist"] as const;
export const COMPLAINT_TYPES = ["wrongPetrolStationName", "wrongStatusOpen", "wrongStatusClosed", "wrongPriceE5", "wrongPriceE10", "wrongPriceDiesel", "wrongPetrolStationBrand", "wrongPetrolStationStreet", "wrongPetrolStationHouseNumber", "wrongPetrolStationPostcode", "wrongPetrolStationPlace", "wrongPetrolStationLocation"] as const;

export const NO_CORRECTION_COMPLAINT_TYPES = ["wrongStatusOpen", "wrongStatusClosed"] as const;
export const NUMBER_CORRECTION_COMPLAINT_TYPES = ["wrongPriceE5", "wrongPriceE10", "wrongPriceDiesel"] as const;
export const STRING_CORRECTION_COMPLAINT_TYPES = ["wrongPetrolStationName", "wrongPetrolStationBrand", "wrongPetrolStationStreet", "wrongPetrolStationHouseNumber", "wrongPetrolStationPostcode", "wrongPetrolStationPlace"] as const;
