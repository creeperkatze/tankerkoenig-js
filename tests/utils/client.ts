import { TankerkoenigClient } from '../../src/client/tankerkoenig.js';
import { createMockFetch } from './http.js';

/** Creates a client backed by a mock fetch, since the client has no fetch-injection option. */
export function createTestClient(responses: Response[] = [], apiKey = 'test-key') {
  const mockFetch = createMockFetch(responses);
  globalThis.fetch = mockFetch as unknown as typeof fetch;
  const client = new TankerkoenigClient(apiKey);
  return { client, mockFetch };
}
