import { TankerkoenigError } from '../errors.js';

const DEFAULT_BASE_URL = 'https://creativecommons.tankerkoenig.de/json';

interface ApiResponse {
  ok: boolean;
  message?: string;
}

/** Low-level HTTP client used internally by all API resource classes. */
export class TankerkoenigClientCore {
  readonly #apiKey: string;
  readonly #baseUrl: string;

  constructor(apiKey: string) {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new TypeError('apiKey must be a non-empty string');
    }
    this.#apiKey = apiKey;
    this.#baseUrl = DEFAULT_BASE_URL;
  }

  /** Sends a GET request with query parameters and returns the parsed JSON body. */
  async get<T>(path: string, params: Record<string, string | number>): Promise<T> {
    const url = new URL(`${this.#baseUrl}/${path}`);
    url.searchParams.set('apikey', this.#apiKey);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }

    const response = await fetch(url.toString());
    return this.#parse<T>(response);
  }

  /** Sends a POST request with a form-urlencoded body and returns the parsed JSON body. */
  async post<T>(path: string, body: Record<string, string | number>): Promise<T> {
    const formData = new URLSearchParams({ apikey: this.#apiKey });
    for (const [key, value] of Object.entries(body)) {
      formData.set(key, String(value));
    }

    const response = await fetch(`${this.#baseUrl}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    return this.#parse<T>(response);
  }

  async #parse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw new TankerkoenigError(`HTTP ${response.status}: ${response.statusText}`, response);
    }

    const data = (await response.json()) as ApiResponse;
    if (!data.ok) {
      throw new TankerkoenigError(data.message ?? 'Unknown API error', response);
    }

    return data as unknown as T;
  }
}
