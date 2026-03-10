import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { TankerkoenigClient } from "./client.js";
import { TankerkoenigError } from "./errors.js";

type FetchCall = { url: string; init?: RequestInit };
let fetchCalls: FetchCall[] = [];

function mockFetch(body: unknown, httpOk = true, status = 200, statusText = "OK"): void {
    fetchCalls = [];
    (globalThis as unknown as { fetch: unknown }).fetch = async (url: string, init?: RequestInit): Promise<Response> => {
        fetchCalls.push({ url, init });
        return {
            ok: httpOk,
            status,
            statusText,
            json: async () => body,
        } as Response;
    };
}

beforeEach(() => {
    fetchCalls = [];
});

describe("TankerkoenigError", () => {
    it("has name TankerkoenigError", () => {
        const err = new TankerkoenigError("test");
        assert.equal(err.name, "TankerkoenigError");
    });

    it("stores response", () => {
        const res = { ok: false } as Response;
        const err = new TankerkoenigError("oops", res);
        assert.equal(err.response, res);
    });

    it("response is undefined when not provided", () => {
        const err = new TankerkoenigError("oops");
        assert.equal(err.response, undefined);
    });
});

describe("TankerkoenigClient constructor", () => {
    it("throws TypeError for empty string", () => {
        assert.throws(() => new TankerkoenigClient(""), TypeError);
    });

    it("throws TypeError for non-string", () => {
        assert.throws(() => new TankerkoenigClient(null as unknown as string), TypeError);
    });

    it("creates instance with a valid apiKey", () => {
        const client = new TankerkoenigClient("my-key");
        assert.ok(client instanceof TankerkoenigClient);
    });
});

describe("TankerkoenigClient#list", () => {
    const client = new TankerkoenigClient("test-key");

    it("throws TypeError when lat is not a number", async () => {
        await assert.rejects(
            () => client.list({ lat: "bad" as unknown as number, lng: 13, rad: 5, type: "e5" }),
            TypeError,
        );
    });

    it("throws TypeError when lng is not a number", async () => {
        await assert.rejects(
            () => client.list({ lat: 52, lng: "bad" as unknown as number, rad: 5, type: "e5" }),
            TypeError,
        );
    });

    it("throws RangeError when rad is 0", async () => {
        await assert.rejects(
            () => client.list({ lat: 52, lng: 13, rad: 0, type: "e5" }),
            RangeError,
        );
    });

    it("throws RangeError when rad exceeds 25", async () => {
        await assert.rejects(
            () => client.list({ lat: 52, lng: 13, rad: 26, type: "e5" }),
            RangeError,
        );
    });

    it("throws TypeError for invalid fuel type", async () => {
        await assert.rejects(
            () => client.list({ lat: 52, lng: 13, rad: 5, type: "kerosene" as never }),
            TypeError,
        );
    });

    it("throws TypeError for invalid sort option", async () => {
        await assert.rejects(
            () => client.list({ lat: 52, lng: 13, rad: 5, type: "e5", sort: "name" as never }),
            TypeError,
        );
    });

    it("returns stations array on success", async () => {
        const stations = [{ id: "abc", name: "Shell" }];
        mockFetch({ ok: true, stations });
        const result = await client.list({ lat: 52.5, lng: 13.4, rad: 5, type: "e5" });
        assert.deepEqual(result, stations);
    });

    it("sends correct query parameters", async () => {
        mockFetch({ ok: true, stations: [] });
        await client.list({ lat: 52.5, lng: 13.4, rad: 5, type: "diesel", sort: "price" });
        const url = new URL(fetchCalls[0]!.url);
        assert.equal(url.searchParams.get("lat"), "52.5");
        assert.equal(url.searchParams.get("lng"), "13.4");
        assert.equal(url.searchParams.get("rad"), "5");
        assert.equal(url.searchParams.get("type"), "diesel");
        assert.equal(url.searchParams.get("sort"), "price");
        assert.equal(url.searchParams.get("apikey"), "test-key");
    });

    it("defaults sort to 'dist'", async () => {
        mockFetch({ ok: true, stations: [] });
        await client.list({ lat: 52.5, lng: 13.4, rad: 5, type: "e10" });
        const url = new URL(fetchCalls[0]!.url);
        assert.equal(url.searchParams.get("sort"), "dist");
    });
});

describe("TankerkoenigClient#prices", () => {
    const client = new TankerkoenigClient("test-key");

    it("throws TypeError for non-array argument", async () => {
        await assert.rejects(() => client.prices("abc" as unknown as string[]), TypeError);
    });

    it("throws TypeError for empty array", async () => {
        await assert.rejects(() => client.prices([]), TypeError);
    });

    it("throws RangeError for more than 10 IDs", async () => {
        const ids = Array.from({ length: 11 }, (_, i) => `id-${i}`);
        await assert.rejects(() => client.prices(ids), RangeError);
    });

    it("returns prices record on success", async () => {
        const prices = { "id-1": { status: "open", e5: 1.799 } };
        mockFetch({ ok: true, prices });
        const result = await client.prices(["id-1"]);
        assert.deepEqual(result, prices);
    });

    it("joins IDs with commas", async () => {
        mockFetch({ ok: true, prices: {} });
        await client.prices(["id-1", "id-2", "id-3"]);
        const url = new URL(fetchCalls[0]!.url);
        assert.equal(url.searchParams.get("ids"), "id-1,id-2,id-3");
    });
});

describe("TankerkoenigClient#detail", () => {
    const client = new TankerkoenigClient("test-key");

    it("throws TypeError for empty id", async () => {
        await assert.rejects(() => client.detail(""), TypeError);
    });

    it("throws TypeError for non-string id", async () => {
        await assert.rejects(() => client.detail(42 as unknown as string), TypeError);
    });

    it("returns station detail on success", async () => {
        const station = { id: "abc", name: "ARAL" };
        mockFetch({ ok: true, station });
        const result = await client.detail("abc");
        assert.deepEqual(result, station);
    });

    it("sends the id parameter", async () => {
        mockFetch({ ok: true, station: {} });
        await client.detail("my-station-id");
        const url = new URL(fetchCalls[0]!.url);
        assert.equal(url.searchParams.get("id"), "my-station-id");
    });
});

describe("TankerkoenigClient#complaint", () => {
    const client = new TankerkoenigClient("test-key");

    it("throws TypeError for empty id", async () => {
        await assert.rejects(
            () => client.complaint({ id: "", type: "wrongPriceE5" }),
            TypeError,
        );
    });

    it("throws TypeError for invalid complaint type", async () => {
        await assert.rejects(
            () => client.complaint({ id: "abc", type: "badType" as never }),
            TypeError,
        );
    });

    it("resolves on success", async () => {
        mockFetch({ ok: true });
        await assert.doesNotReject(() => client.complaint({ id: "abc", type: "wrongPriceE5" }));
    });

    it("sends required fields in POST body", async () => {
        mockFetch({ ok: true });
        await client.complaint({ id: "station-1", type: "wrongPriceE10" });
        const body = new URLSearchParams(fetchCalls[0]!.init?.body as string);
        assert.equal(body.get("id"), "station-1");
        assert.equal(body.get("type"), "wrongPriceE10");
        assert.equal(body.get("apikey"), "test-key");
    });

    it("includes optional correction and ts when provided", async () => {
        mockFetch({ ok: true });
        await client.complaint({ id: "station-1", type: "wrongPriceDiesel", correction: 1.599, ts: 1700000000 });
        const body = new URLSearchParams(fetchCalls[0]!.init?.body as string);
        assert.equal(body.get("correction"), "1.599");
        assert.equal(body.get("ts"), "1700000000");
    });

    it("does not include correction/ts when omitted", async () => {
        mockFetch({ ok: true });
        await client.complaint({ id: "station-1", type: "wrongPriceE5" });
        const body = new URLSearchParams(fetchCalls[0]!.init?.body as string);
        assert.equal(body.get("correction"), null);
        assert.equal(body.get("ts"), null);
    });
});

describe("error handling", () => {
    const client = new TankerkoenigClient("test-key");

    it("throws TankerkoenigError on non-2xx HTTP response", async () => {
        mockFetch({ ok: false, message: "not found" }, false, 404, "Not Found");
        await assert.rejects(
            () => client.detail("abc"),
            (err: unknown) => {
                assert.ok(err instanceof TankerkoenigError);
                assert.match(err.message, /404/);
                return true;
            },
        );
    });

    it("throws TankerkoenigError when API returns ok: false", async () => {
        mockFetch({ ok: false, message: "invalid api key" });
        await assert.rejects(
            () => client.detail("abc"),
            (err: unknown) => {
                assert.ok(err instanceof TankerkoenigError);
                assert.equal(err.message, "invalid api key");
                return true;
            },
        );
    });

    it("uses fallback message when API error has no message", async () => {
        mockFetch({ ok: false });
        await assert.rejects(
            () => client.detail("abc"),
            (err: unknown) => {
                assert.ok(err instanceof TankerkoenigError);
                assert.equal(err.message, "Unknown API error");
                return true;
            },
        );
    });

    it("attaches response to TankerkoenigError", async () => {
        mockFetch({ ok: false, message: "error" }, false, 500, "Internal Server Error");
        await assert.rejects(
            () => client.detail("abc"),
            (err: unknown) => {
                assert.ok(err instanceof TankerkoenigError);
                assert.ok(err.response !== undefined);
                return true;
            },
        );
    });
});
