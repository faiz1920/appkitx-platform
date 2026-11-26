import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  formatUuid,
  generateUuid,
  generateUuids,
  isValidUuidCount,
  parseUuidCount,
  UUID_DEFAULT_COUNT,
  UUID_MAX_COUNT,
  UUID_MIN_COUNT,
  uuidCryptoAvailable,
  UuidUnsupportedError,
  type UuidRandomSource,
} from "../src/lib/uuid";

/*
 * UUID v4 contract: canonical lowercase hyphenated output, version and RFC
 * variant bits, the randomUUID fast path, the getRandomValues fallback, a
 * typed failure when Web Crypto is unavailable, strict quantity parsing, and
 * formatting that transforms an existing value instead of generating one.
 */

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const counterSource = (): UuidRandomSource & { calls: () => number } => {
  let calls = 0;
  return {
    randomUUID: () => {
      calls += 1;
      return `aaaaaaaa-bbbb-4ccc-8ddd-${String(calls).padStart(12, "0")}`;
    },
    calls: () => calls,
  };
};

const byteSource = (seed: number): UuidRandomSource => ({
  getRandomValues: (array) => {
    array.fill(seed);
    return array;
  },
});

describe("generateUuid", () => {
  it("prefers crypto.randomUUID and normalizes it to lowercase", () => {
    const source = counterSource();
    expect(generateUuid(source)).toBe("aaaaaaaa-bbbb-4ccc-8ddd-000000000001");
    expect(source.calls()).toBe(1);
  });

  it("does not call getRandomValues when randomUUID exists", () => {
    const source: UuidRandomSource = {
      randomUUID: () => "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
      getRandomValues: () => {
        throw new Error("getRandomValues must not be used");
      },
    };
    expect(generateUuid(source)).toBe("aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee");
  });

  it("falls back to getRandomValues and sets the version 4 bits", () => {
    const value = generateUuid(byteSource(0x00));
    expect(value).toBe("00000000-0000-4000-8000-000000000000");
    expect(value[14]).toBe("4");
  });

  it("sets the RFC variant bits for every byte-8 pattern", () => {
    for (const [seed, variant] of [
      [0x00, "8"],
      [0x10, "9"],
      [0x20, "a"],
      [0xff, "b"],
    ] as const) {
      const value = generateUuid(byteSource(seed));
      expect(value[19], `seed ${seed.toString(16)}`).toBe(variant);
    }
  });

  it("produces canonical lowercase hyphenated UUIDs", () => {
    const value = generateUuid(byteSource(0xab));
    expect(value).toMatch(UUID_V4);
    expect(value).toMatch(/^[0-9a-f-]+$/);
  });

  it("throws a typed error when Web Crypto is unavailable", () => {
    expect(() => generateUuid({})).toThrow(UuidUnsupportedError);
  });
});

describe("generateUuids", () => {
  it("returns the requested number of unique canonical values", () => {
    const source = counterSource();
    const values = generateUuids(100, source);

    expect(values).toHaveLength(100);
    expect(new Set(values).size).toBe(100);
    expect(source.calls()).toBe(100);
    for (const value of values) expect(value).toMatch(UUID_V4);
  });

  it("accepts the quantity boundaries 1 and 100", () => {
    expect(generateUuids(1, counterSource())).toHaveLength(UUID_MIN_COUNT);
    expect(generateUuids(100, counterSource())).toHaveLength(UUID_MAX_COUNT);
  });

  it("rejects quantities outside 1-100 or non-integers", () => {
    for (const count of [
      0,
      101,
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
    ]) {
      expect(() => generateUuids(count, counterSource())).toThrow(RangeError);
    }
  });

  it("propagates the unsupported error instead of using a weak source", () => {
    expect(() => generateUuids(2, {})).toThrow(UuidUnsupportedError);
  });
});

describe("quantity parsing", () => {
  it("accepts whole numbers from 1 to 100", () => {
    expect(UUID_DEFAULT_COUNT).toBe(5);
    expect(parseUuidCount("1")).toEqual({ ok: true, value: 1 });
    expect(parseUuidCount("5")).toEqual({ ok: true, value: 5 });
    expect(parseUuidCount(" 100 ")).toEqual({ ok: true, value: 100 });
  });

  it("distinguishes empty, malformed, and out-of-range input", () => {
    expect(parseUuidCount("")).toEqual({ ok: false, issue: "empty" });
    expect(parseUuidCount("   ")).toEqual({ ok: false, issue: "empty" });
    expect(parseUuidCount("abc")).toEqual({ ok: false, issue: "invalid" });
    expect(parseUuidCount("1.5")).toEqual({ ok: false, issue: "invalid" });
    expect(parseUuidCount("1e2")).toEqual({ ok: false, issue: "invalid" });
    expect(parseUuidCount("-1")).toEqual({ ok: false, issue: "invalid" });
    expect(parseUuidCount("0")).toEqual({ ok: false, issue: "range" });
    expect(parseUuidCount("101")).toEqual({ ok: false, issue: "range" });
  });

  it("validates counts independently of the raw string", () => {
    expect(isValidUuidCount(1)).toBe(true);
    expect(isValidUuidCount(100)).toBe(true);
    expect(isValidUuidCount(0)).toBe(false);
    expect(isValidUuidCount(101)).toBe(false);
    expect(isValidUuidCount(2.5)).toBe(false);
  });
});

describe("uuidCryptoAvailable", () => {
  it("accepts either Web Crypto method", () => {
    expect(uuidCryptoAvailable({ randomUUID: () => "" })).toBe(true);
    expect(uuidCryptoAvailable({ getRandomValues: (array) => array })).toBe(
      true,
    );
  });

  it("rejects missing or non-function methods", () => {
    expect(uuidCryptoAvailable({})).toBe(false);
    expect(
      uuidCryptoAvailable({
        randomUUID: undefined,
        getRandomValues: undefined,
      }),
    ).toBe(false);
  });
});

describe("formatUuid", () => {
  const value = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";

  it("defaults to canonical lowercase hyphenated output", () => {
    expect(formatUuid(value)).toBe(value);
    expect(formatUuid(value.toUpperCase())).toBe(value);
    expect(formatUuid("aaaaaaaabbbb4ccc8dddeeeeeeeeeeee")).toBe(value);
  });

  it("applies uppercase without changing the identifier", () => {
    expect(formatUuid(value, { uppercase: true })).toBe(
      "AAAAAAAA-BBBB-4CCC-8DDD-EEEEEEEEEEEE",
    );
  });

  it("removes hyphens without changing the identifier", () => {
    expect(formatUuid(value, { hyphens: false })).toBe(
      "aaaaaaaabbbb4ccc8dddeeeeeeeeeeee",
    );
    expect(formatUuid(value, { uppercase: true, hyphens: false })).toBe(
      "AAAAAAAABBBB4CCC8DDDEEEEEEEEEEEE",
    );
  });

  it("formats existing values without generating new ones", () => {
    const source = counterSource();
    const values = generateUuids(3, source);

    const formatted = values.map((item) =>
      formatUuid(item, { uppercase: true, hyphens: false }),
    );

    expect(source.calls()).toBe(3);
    expect(formatted).toHaveLength(3);
    expect(formatted[0]).toMatch(/^[0-9A-F]{32}$/);
    expect(formatted.map((item) => item.toLowerCase())).toEqual(
      values.map((item) => item.replace(/-/g, "")),
    );
  });
});

describe("randomness policy", () => {
  it("never reaches for Math.random", () => {
    const source = readFileSync(
      new URL("../src/lib/uuid.ts", import.meta.url),
      "utf8",
    );
    expect(source).not.toContain("Math.random");
  });
});
