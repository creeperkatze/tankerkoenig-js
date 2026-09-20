import { describe, it, expect } from 'vitest';
import { createTestClient } from '../utils/client.js';
import { jsonResponse } from '../utils/http.js';

describe('TankerkoenigClient#list', () => {
  it('throws TypeError when lat is not a number', async () => {
    const { client } = createTestClient();
    await expect(() =>
      client.list({ lat: 'bad' as unknown as number, lng: 13, rad: 5, type: 'e5' }),
    ).rejects.toThrow(TypeError);
  });

  it('throws TypeError when lng is not a number', async () => {
    const { client } = createTestClient();
    await expect(() =>
      client.list({ lat: 52, lng: 'bad' as unknown as number, rad: 5, type: 'e5' }),
    ).rejects.toThrow(TypeError);
  });

  it('throws RangeError when rad is 0', async () => {
    const { client } = createTestClient();
    await expect(() => client.list({ lat: 52, lng: 13, rad: 0, type: 'e5' })).rejects.toThrow(RangeError);
  });

  it('throws RangeError when rad exceeds 25', async () => {
    const { client } = createTestClient();
    await expect(() => client.list({ lat: 52, lng: 13, rad: 26, type: 'e5' })).rejects.toThrow(RangeError);
  });

  it('throws TypeError for invalid fuel type', async () => {
    const { client } = createTestClient();
    await expect(() => client.list({ lat: 52, lng: 13, rad: 5, type: 'kerosene' as never })).rejects.toThrow(
      TypeError,
    );
  });

  it('throws TypeError for invalid sort option', async () => {
    const { client } = createTestClient();
    await expect(() =>
      client.list({ lat: 52, lng: 13, rad: 5, type: 'e5', sort: 'name' as never }),
    ).rejects.toThrow(TypeError);
  });

  it('returns stations array on success', async () => {
    const stations = [{ id: 'abc', name: 'Shell' }];
    const { client } = createTestClient([jsonResponse({ ok: true, stations })]);
    const result = await client.list({ lat: 52.5, lng: 13.4, rad: 5, type: 'e5' });
    expect(result).toEqual(stations);
  });

  it('sends correct query parameters', async () => {
    const { client, mockFetch } = createTestClient([jsonResponse({ ok: true, stations: [] })]);
    await client.list({ lat: 52.5, lng: 13.4, rad: 5, type: 'diesel', sort: 'price' });
    const url = new URL(mockFetch.lastCall()!.url);
    expect(url.searchParams.get('lat')).toBe('52.5');
    expect(url.searchParams.get('lng')).toBe('13.4');
    expect(url.searchParams.get('rad')).toBe('5');
    expect(url.searchParams.get('type')).toBe('diesel');
    expect(url.searchParams.get('sort')).toBe('price');
    expect(url.searchParams.get('apikey')).toBe('test-key');
  });

  it("defaults sort to 'dist'", async () => {
    const { client, mockFetch } = createTestClient([jsonResponse({ ok: true, stations: [] })]);
    await client.list({ lat: 52.5, lng: 13.4, rad: 5, type: 'e10' });
    const url = new URL(mockFetch.lastCall()!.url);
    expect(url.searchParams.get('sort')).toBe('dist');
  });
});

describe('TankerkoenigClient#prices', () => {
  it('throws TypeError for non-array argument', async () => {
    const { client } = createTestClient();
    await expect(() => client.prices('abc' as unknown as string[])).rejects.toThrow(TypeError);
  });

  it('throws TypeError for empty array', async () => {
    const { client } = createTestClient();
    await expect(() => client.prices([])).rejects.toThrow(TypeError);
  });

  it('throws RangeError for more than 10 IDs', async () => {
    const { client } = createTestClient();
    const ids = Array.from({ length: 11 }, (_, i) => `id-${i}`);
    await expect(() => client.prices(ids)).rejects.toThrow(RangeError);
  });

  it('returns prices record on success', async () => {
    const prices = { 'id-1': { status: 'open', e5: 1.799 } };
    const { client } = createTestClient([jsonResponse({ ok: true, prices })]);
    const result = await client.prices(['id-1']);
    expect(result).toEqual(prices);
  });

  it('joins IDs with commas', async () => {
    const { client, mockFetch } = createTestClient([jsonResponse({ ok: true, prices: {} })]);
    await client.prices(['id-1', 'id-2', 'id-3']);
    const url = new URL(mockFetch.lastCall()!.url);
    expect(url.searchParams.get('ids')).toBe('id-1,id-2,id-3');
  });
});

describe('TankerkoenigClient#detail', () => {
  it('throws TypeError for empty id', async () => {
    const { client } = createTestClient();
    await expect(() => client.detail('')).rejects.toThrow(TypeError);
  });

  it('throws TypeError for non-string id', async () => {
    const { client } = createTestClient();
    await expect(() => client.detail(42 as unknown as string)).rejects.toThrow(TypeError);
  });

  it('returns station detail on success', async () => {
    const station = { id: 'abc', name: 'ARAL' };
    const { client } = createTestClient([jsonResponse({ ok: true, station })]);
    const result = await client.detail('abc');
    expect(result).toEqual(station);
  });

  it('sends the id parameter', async () => {
    const { client, mockFetch } = createTestClient([jsonResponse({ ok: true, station: {} })]);
    await client.detail('my-station-id');
    const url = new URL(mockFetch.lastCall()!.url);
    expect(url.searchParams.get('id')).toBe('my-station-id');
  });
});
