import { FUEL_TYPES, SORT_OPTIONS } from '../types/stations.js';
import type { ListOptions, PriceEntry, Station, StationDetail } from '../types/stations.js';
import type { TankerkoenigClientCore } from './core.js';

/** API resource for querying stations: radius search, bulk prices, and station detail. */
export class StationsApi {
  constructor(private readonly core: TankerkoenigClientCore) {}

  /** Returns all stations within a given radius, with current prices. */
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

    const data = await this.core.get<{ stations: Station[] }>('list.php', { lat, lng, rad, type, sort });
    return data.stations;
  }

  /** Returns current prices for up to 10 stations by ID. */
  async prices(ids: string[]): Promise<Record<string, PriceEntry>> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new TypeError('ids must be a non-empty array');
    }
    if (ids.length > 10) {
      throw new RangeError('ids must contain at most 10 station IDs');
    }

    const data = await this.core.get<{ prices: Record<string, PriceEntry> }>('prices.php', {
      ids: ids.join(','),
    });
    return data.prices;
  }

  /** Returns full station info including opening times. */
  async detail(id: string): Promise<StationDetail> {
    if (!id || typeof id !== 'string') {
      throw new TypeError('id must be a non-empty string');
    }

    const data = await this.core.get<{ station: StationDetail }>('detail.php', { id });
    return data.station;
  }
}
