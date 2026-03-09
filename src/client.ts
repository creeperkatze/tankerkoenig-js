import { BASE_URL, COMPLAINT_TYPES, FUEL_TYPES, SORT_OPTIONS } from './constants.js';
import { TankerkoenigError } from './errors.js';
import type {
  ComplaintOptions,
  ListOptions,
  PriceEntry,
  Station,
  StationDetail,
} from './types.js';

export class TankerkoenigClient {
  readonly #apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new TypeError('apiKey must be a non-empty string');
    }
    this.#apiKey = apiKey;
  }

  async #get(path: string, params: Record<string, string | number>): Promise<unknown> {
    const url = new URL(`${BASE_URL}/${path}`);
    url.searchParams.set('apikey', this.#apiKey);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new TankerkoenigError(`HTTP ${response.status}: ${response.statusText}`, response);
    }

    const data = await response.json() as { ok: boolean; message?: string };
    if (!data.ok) {
      throw new TankerkoenigError(data.message ?? 'Unknown API error', response);
    }

    return data;
  }

  async #post(path: string, body: Record<string, string | number>): Promise<unknown> {
    const formData = new URLSearchParams({ apikey: this.#apiKey });
    for (const [key, value] of Object.entries(body)) {
      formData.set(key, String(value));
    }

    const response = await fetch(`${BASE_URL}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new TankerkoenigError(`HTTP ${response.status}: ${response.statusText}`, response);
    }

    const data = await response.json() as { ok: boolean; message?: string };
    if (!data.ok) {
      throw new TankerkoenigError(data.message ?? 'Unknown API error', response);
    }

    return data;
  }

  async list({ lat, lng, rad, type, sort = 'dist' }: ListOptions): Promise<Station[]> {
    if (typeof lat !== 'number') throw new TypeError('lat must be a number');
    if (typeof lng !== 'number') throw new TypeError('lng must be a number');
    if (typeof rad !== 'number' || rad <= 0 || rad > 25) {
      throw new RangeError('rad must be a number between 0 and 25');
    }
    if (!(FUEL_TYPES as readonly string[]).includes(type)) {
      throw new TypeError(`type must be one of: ${FUEL_TYPES.join(', ')}`);
    }
    if (!(SORT_OPTIONS as readonly string[]).includes(sort)) {
      throw new TypeError(`sort must be one of: ${SORT_OPTIONS.join(', ')}`);
    }

    const data = await this.#get('list.php', { lat, lng, rad, type, sort }) as { stations: Station[] };
    return data.stations;
  }

  async prices(ids: string[]): Promise<Record<string, PriceEntry>> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new TypeError('ids must be a non-empty array');
    }
    if (ids.length > 10) {
      throw new RangeError('ids must contain at most 10 station IDs');
    }

    const data = await this.#get('prices.php', { ids: ids.join(',') }) as { prices: Record<string, PriceEntry> };
    return data.prices;
  }

  async detail(id: string): Promise<StationDetail> {
    if (!id || typeof id !== 'string') {
      throw new TypeError('id must be a non-empty string');
    }

    const data = await this.#get('detail.php', { id }) as { station: StationDetail };
    return data.station;
  }

  async complaint({ id, type, correction, ts }: ComplaintOptions): Promise<void> {
    if (!id || typeof id !== 'string') {
      throw new TypeError('id must be a non-empty string');
    }
    if (!(COMPLAINT_TYPES as readonly string[]).includes(type)) {
      throw new TypeError(`type must be one of: ${COMPLAINT_TYPES.join(', ')}`);
    }

    const body: Record<string, string | number> = { id, type };
    if (correction !== undefined) body.correction = correction;
    if (ts !== undefined) body.ts = ts;

    await this.#post('complaint.php', body);
  }
}
