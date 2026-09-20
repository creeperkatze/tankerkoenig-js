import type { ComplaintOptions, ListOptions, PriceEntry, Station, StationDetail } from '../types/index.js';
import { ComplaintsApi } from './complaints.js';
import { TankerkoenigClientCore } from './core.js';
import { StationsApi } from './stations.js';

/**
 * Client for the Tankerkönig gas prices API.
 * @example
 * ```ts
 * import TankerkoenigClient from 'tankerkoenig-js';
 *
 * const client = new TankerkoenigClient('your-api-key');
 * const stations = await client.list({ lat: 52.521, lng: 13.438, rad: 5, type: 'diesel' });
 * ```
 */
export class TankerkoenigClient {
  readonly #stations: StationsApi;
  readonly #complaints: ComplaintsApi;

  constructor(apiKey: string) {
    const core = new TankerkoenigClientCore(apiKey);
    this.#stations = new StationsApi(core);
    this.#complaints = new ComplaintsApi(core);
  }

  /** Returns all stations within a given radius, with current prices. */
  list(options: ListOptions): Promise<Station[]> {
    return this.#stations.list(options);
  }

  /** Returns current prices for up to 10 stations by ID. */
  prices(ids: string[]): Promise<Record<string, PriceEntry>> {
    return this.#stations.prices(ids);
  }

  /** Returns full station info including opening times. */
  detail(id: string): Promise<StationDetail> {
    return this.#stations.detail(id);
  }

  /** Reports wrong station data to the MTS-K via the Tankerkönig API. */
  complaint(options: ComplaintOptions): Promise<void> {
    return this.#complaints.report(options);
  }
}
