/** All complaint types accepted by {@link TankerkoenigClient.complaint}. */
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

/** A complaint type accepted by {@link TankerkoenigClient.complaint}. */
export type ComplaintType = (typeof COMPLAINT_TYPES)[number];

/** Complaint types that must not be sent with a {@link ComplaintOptions.correction}. */
export const NO_CORRECTION_COMPLAINT_TYPES = ['wrongStatusOpen', 'wrongStatusClosed'] as const;

/** Complaint types whose {@link ComplaintOptions.correction} must be a positive finite number. */
export const NUMBER_CORRECTION_COMPLAINT_TYPES = ['wrongPriceE5', 'wrongPriceE10', 'wrongPriceDiesel'] as const;

/** Complaint types whose {@link ComplaintOptions.correction} must be a non-empty string. */
export const STRING_CORRECTION_COMPLAINT_TYPES = [
  'wrongPetrolStationName',
  'wrongPetrolStationBrand',
  'wrongPetrolStationStreet',
  'wrongPetrolStationHouseNumber',
  'wrongPetrolStationPostcode',
  'wrongPetrolStationPlace',
] as const;

/** Options for {@link TankerkoenigClient.complaint}. */
export interface ComplaintOptions {
  id: string;
  type: ComplaintType;
  /**
   * Required for number-correction types (`wrongPriceE5`, `wrongPriceE10`, `wrongPriceDiesel`)
   * and string-correction types (all remaining types except the no-correction ones below), and
   * for `wrongPetrolStationLocation` (as `"lat,lng"`). Must be omitted for `wrongStatusOpen` and
   * `wrongStatusClosed`.
   */
  correction?: string | number;
  ts?: number;
}
