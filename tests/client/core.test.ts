import { describe, it, expect } from 'vitest';
import { TankerkoenigClient } from '../../src/client/tankerkoenig.js';
import { TankerkoenigError } from '../../src/errors.js';
import { createTestClient } from '../utils/client.js';
import { jsonResponse } from '../utils/http.js';

describe('TankerkoenigError', () => {
  it('has name TankerkoenigError', () => {
    const err = new TankerkoenigError('test');
    expect(err.name).toBe('TankerkoenigError');
  });

  it('stores response', () => {
    const res = { ok: false } as Response;
    const err = new TankerkoenigError('oops', res);
    expect(err.response).toBe(res);
  });

  it('response is undefined when not provided', () => {
    const err = new TankerkoenigError('oops');
    expect(err.response).toBeUndefined();
  });
});

describe('TankerkoenigClient constructor', () => {
  it('throws TypeError for empty string', () => {
    expect(() => new TankerkoenigClient('')).toThrow(TypeError);
  });

  it('throws TypeError for non-string', () => {
    expect(() => new TankerkoenigClient(null as unknown as string)).toThrow(TypeError);
  });

  it('creates instance with a valid apiKey', () => {
    const client = new TankerkoenigClient('my-key');
    expect(client).toBeInstanceOf(TankerkoenigClient);
  });
});

describe('error handling', () => {
  it('throws TankerkoenigError on non-2xx HTTP response', async () => {
    const { client } = createTestClient([jsonResponse({ ok: false, message: 'not found' }, 404, 'Not Found')]);
    const err = await client.detail('abc').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(TankerkoenigError);
    expect((err as TankerkoenigError).message).toMatch(/404/);
  });

  it('throws TankerkoenigError when API returns ok: false', async () => {
    const { client } = createTestClient([jsonResponse({ ok: false, message: 'invalid api key' })]);
    const err = await client.detail('abc').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(TankerkoenigError);
    expect((err as TankerkoenigError).message).toBe('invalid api key');
  });

  it('uses fallback message when API error has no message', async () => {
    const { client } = createTestClient([jsonResponse({ ok: false })]);
    const err = await client.detail('abc').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(TankerkoenigError);
    expect((err as TankerkoenigError).message).toBe('Unknown API error');
  });

  it('attaches response to TankerkoenigError', async () => {
    const { client } = createTestClient([
      jsonResponse({ ok: false, message: 'error' }, 500, 'Internal Server Error'),
    ]);
    const err = await client.detail('abc').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(TankerkoenigError);
    expect((err as TankerkoenigError).response).toBeDefined();
  });
});
