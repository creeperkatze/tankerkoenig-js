import {
  COMPLAINT_TYPES,
  NO_CORRECTION_COMPLAINT_TYPES,
  NUMBER_CORRECTION_COMPLAINT_TYPES,
} from '../types/complaints.js';
import type { ComplaintOptions } from '../types/complaints.js';
import type { TankerkoenigClientCore } from './core.js';

/** API resource for reporting incorrect station data. */
export class ComplaintsApi {
  constructor(private readonly core: TankerkoenigClientCore) {}

  /** Reports wrong station data to the MTS-K via the Tankerkönig API. */
  async report({ id, type, correction, ts }: ComplaintOptions): Promise<void> {
    if (!id || typeof id !== 'string') {
      throw new TypeError('id must be a non-empty string');
    }
    if (!(COMPLAINT_TYPES as readonly string[]).includes(type)) {
      throw new TypeError(`type must be one of: ${COMPLAINT_TYPES.join(', ')}`);
    }

    if ((NO_CORRECTION_COMPLAINT_TYPES as readonly string[]).includes(type)) {
      if (correction !== undefined) {
        throw new TypeError(`correction must not be provided for type "${type}"`);
      }
    } else if ((NUMBER_CORRECTION_COMPLAINT_TYPES as readonly string[]).includes(type)) {
      if (typeof correction !== 'number' || !isFinite(correction) || correction <= 0) {
        throw new TypeError(`correction must be a positive finite number for type "${type}"`);
      }
    } else if (type === 'wrongPetrolStationLocation') {
      if (typeof correction !== 'string') {
        throw new TypeError(
          `correction must be a string of two comma-separated coordinates for type "wrongPetrolStationLocation"`,
        );
      }
      const parts = correction.split(',');
      if (parts.length !== 2 || parts.some((p) => !isFinite(Number(p.trim())))) {
        throw new TypeError(
          `correction must be two comma-separated floats (e.g. "52.29162,10.06117") for type "wrongPetrolStationLocation"`,
        );
      }
    } else {
      if (typeof correction !== 'string' || correction.trim() === '') {
        throw new TypeError(`correction must be a non-empty string for type "${type}"`);
      }
    }

    if (ts !== undefined && (typeof ts !== 'number' || !Number.isInteger(ts) || ts <= 0)) {
      throw new TypeError('ts must be a positive integer');
    }

    const body: Record<string, string | number> = { id, type };
    if (correction !== undefined) body.correction = correction;
    if (ts !== undefined) body.ts = ts;

    await this.core.post('complaint.php', body);
  }
}
