import { describe, it, beforeEach, expect } from "vitest";
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
        expect(err.name).toBe("TankerkoenigError");
    });

    it("stores response", () => {
        const res = { ok: false } as Response;
        const err = new TankerkoenigError("oops", res);
        expect(err.response).toBe(res);
    });

    it("response is undefined when not provided", () => {
        const err = new TankerkoenigError("oops");
        expect(err.response).toBeUndefined();
    });
});

describe("TankerkoenigClient constructor", () => {
    it("throws TypeError for empty string", () => {
        expect(() => new TankerkoenigClient("")).toThrow(TypeError);
    });

    it("throws TypeError for non-string", () => {
        expect(() => new TankerkoenigClient(null as unknown as string)).toThrow(TypeError);
    });

    it("creates instance with a valid apiKey", () => {
        const client = new TankerkoenigClient("my-key");
        expect(client).toBeInstanceOf(TankerkoenigClient);
    });
});

describe("TankerkoenigClient#list", () => {
    const client = new TankerkoenigClient("test-key");

    it("throws TypeError when lat is not a number", async () => {
        await expect(() => client.list({ lat: "bad" as unknown as number, lng: 13, rad: 5, type: "e5" })).rejects.toThrow(TypeError);
    });

    it("throws TypeError when lng is not a number", async () => {
        await expect(() => client.list({ lat: 52, lng: "bad" as unknown as number, rad: 5, type: "e5" })).rejects.toThrow(TypeError);
    });

    it("throws RangeError when rad is 0", async () => {
        await expect(() => client.list({ lat: 52, lng: 13, rad: 0, type: "e5" })).rejects.toThrow(RangeError);
    });

    it("throws RangeError when rad exceeds 25", async () => {
        await expect(() => client.list({ lat: 52, lng: 13, rad: 26, type: "e5" })).rejects.toThrow(RangeError);
    });

    it("throws TypeError for invalid fuel type", async () => {
        await expect(() => client.list({ lat: 52, lng: 13, rad: 5, type: "kerosene" as never })).rejects.toThrow(TypeError);
    });

    it("throws TypeError for invalid sort option", async () => {
        await expect(() => client.list({ lat: 52, lng: 13, rad: 5, type: "e5", sort: "name" as never })).rejects.toThrow(TypeError);
    });

    it("returns stations array on success", async () => {
        const stations = [{ id: "abc", name: "Shell" }];
        mockFetch({ ok: true, stations });
        const result = await client.list({ lat: 52.5, lng: 13.4, rad: 5, type: "e5" });
        expect(result).toEqual(stations);
    });

    it("sends correct query parameters", async () => {
        mockFetch({ ok: true, stations: [] });
        await client.list({ lat: 52.5, lng: 13.4, rad: 5, type: "diesel", sort: "price" });
        const url = new URL(fetchCalls[0]!.url);
        expect(url.searchParams.get("lat")).toBe("52.5");
        expect(url.searchParams.get("lng")).toBe("13.4");
        expect(url.searchParams.get("rad")).toBe("5");
        expect(url.searchParams.get("type")).toBe("diesel");
        expect(url.searchParams.get("sort")).toBe("price");
        expect(url.searchParams.get("apikey")).toBe("test-key");
    });

    it("defaults sort to 'dist'", async () => {
        mockFetch({ ok: true, stations: [] });
        await client.list({ lat: 52.5, lng: 13.4, rad: 5, type: "e10" });
        const url = new URL(fetchCalls[0]!.url);
        expect(url.searchParams.get("sort")).toBe("dist");
    });
});

describe("TankerkoenigClient#prices", () => {
    const client = new TankerkoenigClient("test-key");

    it("throws TypeError for non-array argument", async () => {
        await expect(() => client.prices("abc" as unknown as string[])).rejects.toThrow(TypeError);
    });

    it("throws TypeError for empty array", async () => {
        await expect(() => client.prices([])).rejects.toThrow(TypeError);
    });

    it("throws RangeError for more than 10 IDs", async () => {
        const ids = Array.from({ length: 11 }, (_, i) => `id-${i}`);
        await expect(() => client.prices(ids)).rejects.toThrow(RangeError);
    });

    it("returns prices record on success", async () => {
        const prices = { "id-1": { status: "open", e5: 1.799 } };
        mockFetch({ ok: true, prices });
        const result = await client.prices(["id-1"]);
        expect(result).toEqual(prices);
    });

    it("joins IDs with commas", async () => {
        mockFetch({ ok: true, prices: {} });
        await client.prices(["id-1", "id-2", "id-3"]);
        const url = new URL(fetchCalls[0]!.url);
        expect(url.searchParams.get("ids")).toBe("id-1,id-2,id-3");
    });
});

describe("TankerkoenigClient#detail", () => {
    const client = new TankerkoenigClient("test-key");

    it("throws TypeError for empty id", async () => {
        await expect(() => client.detail("")).rejects.toThrow(TypeError);
    });

    it("throws TypeError for non-string id", async () => {
        await expect(() => client.detail(42 as unknown as string)).rejects.toThrow(TypeError);
    });

    it("returns station detail on success", async () => {
        const station = { id: "abc", name: "ARAL" };
        mockFetch({ ok: true, station });
        const result = await client.detail("abc");
        expect(result).toEqual(station);
    });

    it("sends the id parameter", async () => {
        mockFetch({ ok: true, station: {} });
        await client.detail("my-station-id");
        const url = new URL(fetchCalls[0]!.url);
        expect(url.searchParams.get("id")).toBe("my-station-id");
    });
});

describe("TankerkoenigClient#complaint", () => {
    const client = new TankerkoenigClient("test-key");

    it("throws TypeError for empty id", async () => {
        await expect(() => client.complaint({ id: "", type: "wrongPriceE5" })).rejects.toThrow(TypeError);
    });

    it("throws TypeError for invalid complaint type", async () => {
        await expect(() => client.complaint({ id: "abc", type: "badType" as never })).rejects.toThrow(TypeError);
    });

    it("resolves on success for no-correction type", async () => {
        mockFetch({ ok: true });
        await client.complaint({ id: "abc", type: "wrongStatusClosed" });
    });

    it("sends required fields in POST body", async () => {
        mockFetch({ ok: true });
        await client.complaint({ id: "station-1", type: "wrongPriceE10", correction: 1.499 });
        const body = new URLSearchParams(fetchCalls[0]!.init?.body as string);
        expect(body.get("id")).toBe("station-1");
        expect(body.get("type")).toBe("wrongPriceE10");
        expect(body.get("apikey")).toBe("test-key");
    });

    it("includes correction and ts when provided", async () => {
        mockFetch({ ok: true });
        await client.complaint({ id: "station-1", type: "wrongPriceDiesel", correction: 1.599, ts: 1700000000 });
        const body = new URLSearchParams(fetchCalls[0]!.init?.body as string);
        expect(body.get("correction")).toBe("1.599");
        expect(body.get("ts")).toBe("1700000000");
    });

    it("does not include correction/ts when omitted for no-correction type", async () => {
        mockFetch({ ok: true });
        await client.complaint({ id: "station-1", type: "wrongStatusOpen" });
        const body = new URLSearchParams(fetchCalls[0]!.init?.body as string);
        expect(body.get("correction")).toBeNull();
        expect(body.get("ts")).toBeNull();
    });

    it("throws TypeError when correction provided for wrongStatusOpen", async () => {
        await expect(() => client.complaint({ id: "abc", type: "wrongStatusOpen", correction: "oops" })).rejects.toThrow(TypeError);
    });

    it("throws TypeError when correction provided for wrongStatusClosed", async () => {
        await expect(() => client.complaint({ id: "abc", type: "wrongStatusClosed", correction: "oops" })).rejects.toThrow(TypeError);
    });

    it("throws TypeError when price correction is not a number", async () => {
        await expect(() => client.complaint({ id: "abc", type: "wrongPriceE5", correction: "1.23" as never })).rejects.toThrow(TypeError);
    });

    it("throws TypeError when price correction is not positive", async () => {
        await expect(() => client.complaint({ id: "abc", type: "wrongPriceDiesel", correction: -1 })).rejects.toThrow(TypeError);
    });

    it("throws TypeError when string correction is a number", async () => {
        await expect(() => client.complaint({ id: "abc", type: "wrongPetrolStationPostcode", correction: 12345 as never })).rejects.toThrow(TypeError);
    });

    it("throws TypeError when string correction is empty", async () => {
        await expect(() => client.complaint({ id: "abc", type: "wrongPetrolStationName", correction: "   " })).rejects.toThrow(TypeError);
    });

    it("resolves for location with valid coordinate string", async () => {
        mockFetch({ ok: true });
        await client.complaint({ id: "abc", type: "wrongPetrolStationLocation", correction: "52.29162,10.06117" });
    });

    it("throws TypeError when location correction is not a string", async () => {
        await expect(() => client.complaint({ id: "abc", type: "wrongPetrolStationLocation", correction: 52.29 as never })).rejects.toThrow(TypeError);
    });

    it("throws TypeError when location correction has wrong format", async () => {
        await expect(() => client.complaint({ id: "abc", type: "wrongPetrolStationLocation", correction: "not,a,coord" })).rejects.toThrow(TypeError);
    });

    it("throws TypeError when ts is not a positive integer", async () => {
        await expect(() => client.complaint({ id: "abc", type: "wrongStatusClosed", ts: 1.5 })).rejects.toThrow(TypeError);
    });
});

describe("error handling", () => {
    const client = new TankerkoenigClient("test-key");

    it("throws TankerkoenigError on non-2xx HTTP response", async () => {
        mockFetch({ ok: false, message: "not found" }, false, 404, "Not Found");
        const err = await client.detail("abc").catch((e: unknown) => e);
        expect(err).toBeInstanceOf(TankerkoenigError);
        expect((err as TankerkoenigError).message).toMatch(/404/);
    });

    it("throws TankerkoenigError when API returns ok: false", async () => {
        mockFetch({ ok: false, message: "invalid api key" });
        const err = await client.detail("abc").catch((e: unknown) => e);
        expect(err).toBeInstanceOf(TankerkoenigError);
        expect((err as TankerkoenigError).message).toBe("invalid api key");
    });

    it("uses fallback message when API error has no message", async () => {
        mockFetch({ ok: false });
        const err = await client.detail("abc").catch((e: unknown) => e);
        expect(err).toBeInstanceOf(TankerkoenigError);
        expect((err as TankerkoenigError).message).toBe("Unknown API error");
    });

    it("attaches response to TankerkoenigError", async () => {
        mockFetch({ ok: false, message: "error" }, false, 500, "Internal Server Error");
        const err = await client.detail("abc").catch((e: unknown) => e);
        expect(err).toBeInstanceOf(TankerkoenigError);
        expect((err as TankerkoenigError).response).toBeDefined();
    });
});
