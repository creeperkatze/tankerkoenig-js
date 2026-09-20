import { describe, it, expect } from 'vitest';
import { createTestClient } from '../utils/client.js';
import { jsonResponse } from '../utils/http.js';

describe('TankerkoenigClient#complaint', () => {
  it('throws TypeError for empty id', async () => {
    const { client } = createTestClient();
    await expect(() => client.complaint({ id: '', type: 'wrongPriceE5' })).rejects.toThrow(TypeError);
  });

  it('throws TypeError for invalid complaint type', async () => {
    const { client } = createTestClient();
    await expect(() => client.complaint({ id: 'abc', type: 'badType' as never })).rejects.toThrow(TypeError);
  });

  it('resolves on success for no-correction type', async () => {
    const { client } = createTestClient([jsonResponse({ ok: true })]);
    await client.complaint({ id: 'abc', type: 'wrongStatusClosed' });
  });

  it('sends required fields in POST body', async () => {
    const { client, mockFetch } = createTestClient([jsonResponse({ ok: true })]);
    await client.complaint({ id: 'station-1', type: 'wrongPriceE10', correction: 1.499 });
    const body = new URLSearchParams(await mockFetch.lastCall()!.text());
    expect(body.get('id')).toBe('station-1');
    expect(body.get('type')).toBe('wrongPriceE10');
    expect(body.get('apikey')).toBe('test-key');
  });

  it('includes correction and ts when provided', async () => {
    const { client, mockFetch } = createTestClient([jsonResponse({ ok: true })]);
    await client.complaint({ id: 'station-1', type: 'wrongPriceDiesel', correction: 1.599, ts: 1700000000 });
    const body = new URLSearchParams(await mockFetch.lastCall()!.text());
    expect(body.get('correction')).toBe('1.599');
    expect(body.get('ts')).toBe('1700000000');
  });

  it('does not include correction/ts when omitted for no-correction type', async () => {
    const { client, mockFetch } = createTestClient([jsonResponse({ ok: true })]);
    await client.complaint({ id: 'station-1', type: 'wrongStatusOpen' });
    const body = new URLSearchParams(await mockFetch.lastCall()!.text());
    expect(body.get('correction')).toBeNull();
    expect(body.get('ts')).toBeNull();
  });

  it('throws TypeError when correction provided for wrongStatusOpen', async () => {
    const { client } = createTestClient();
    await expect(() =>
      client.complaint({ id: 'abc', type: 'wrongStatusOpen', correction: 'oops' }),
    ).rejects.toThrow(TypeError);
  });

  it('throws TypeError when correction provided for wrongStatusClosed', async () => {
    const { client } = createTestClient();
    await expect(() =>
      client.complaint({ id: 'abc', type: 'wrongStatusClosed', correction: 'oops' }),
    ).rejects.toThrow(TypeError);
  });

  it('throws TypeError when price correction is not a number', async () => {
    const { client } = createTestClient();
    await expect(() =>
      client.complaint({ id: 'abc', type: 'wrongPriceE5', correction: '1.23' as never }),
    ).rejects.toThrow(TypeError);
  });

  it('throws TypeError when price correction is not positive', async () => {
    const { client } = createTestClient();
    await expect(() =>
      client.complaint({ id: 'abc', type: 'wrongPriceDiesel', correction: -1 }),
    ).rejects.toThrow(TypeError);
  });

  it('throws TypeError when string correction is a number', async () => {
    const { client } = createTestClient();
    await expect(() =>
      client.complaint({ id: 'abc', type: 'wrongPetrolStationPostcode', correction: 12345 as never }),
    ).rejects.toThrow(TypeError);
  });

  it('throws TypeError when string correction is empty', async () => {
    const { client } = createTestClient();
    await expect(() =>
      client.complaint({ id: 'abc', type: 'wrongPetrolStationName', correction: '   ' }),
    ).rejects.toThrow(TypeError);
  });

  it('resolves for location with valid coordinate string', async () => {
    const { client } = createTestClient([jsonResponse({ ok: true })]);
    await client.complaint({ id: 'abc', type: 'wrongPetrolStationLocation', correction: '52.29162,10.06117' });
  });

  it('throws TypeError when location correction is not a string', async () => {
    const { client } = createTestClient();
    await expect(() =>
      client.complaint({ id: 'abc', type: 'wrongPetrolStationLocation', correction: 52.29 as never }),
    ).rejects.toThrow(TypeError);
  });

  it('throws TypeError when location correction has wrong format', async () => {
    const { client } = createTestClient();
    await expect(() =>
      client.complaint({ id: 'abc', type: 'wrongPetrolStationLocation', correction: 'not,a,coord' }),
    ).rejects.toThrow(TypeError);
  });

  it('throws TypeError when ts is not a positive integer', async () => {
    const { client } = createTestClient();
    await expect(() => client.complaint({ id: 'abc', type: 'wrongStatusClosed', ts: 1.5 })).rejects.toThrow(
      TypeError,
    );
  });
});
