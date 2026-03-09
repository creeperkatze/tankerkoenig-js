import type { COMPLAINT_TYPES, FUEL_TYPES, SORT_OPTIONS } from "./constants.js";

export type FuelType = (typeof FUEL_TYPES)[number];
export type SortOption = (typeof SORT_OPTIONS)[number];
export type ComplaintType = (typeof COMPLAINT_TYPES)[number];

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

export interface OpeningTime {
    text: string;
    start: string;
    end: string;
}

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

export interface PriceEntry {
    status: "open" | "closed" | "no prices";
    e5?: number | false;
    e10?: number | false;
    diesel?: number | false;
}

export interface ListOptions {
    lat: number;
    lng: number;
    rad: number;
    type: FuelType;
    sort?: SortOption;
}

export interface ComplaintOptions {
    id: string;
    type: ComplaintType;
    correction?: string | number;
    ts?: number;
}
