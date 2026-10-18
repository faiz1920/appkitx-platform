import { describe, expect, it } from "vitest";
import {
  defaultLocale,
  dictionaries,
  getDictionary,
  getLocale,
  locales,
} from "../src/i18n/config";
import { en } from "../src/i18n/dictionaries/en";
import type { Dictionary } from "../src/i18n/dictionary";
import { interpolate } from "../src/i18n/interpolate";

/*
 * Compile-time proof that Dictionary keeps its required keys closed: dropping
 * a key produces a shape that no longer satisfies Dictionary, so the sentinel
 * resolves to `true`. If the type ever stopped rejecting incomplete
 * dictionaries, the conditional would resolve to `never` and `npm run check`
 * would fail on the assignment below.
 */
type IncompleteDictionaryRejected =
  Omit<Dictionary, "nav"> extends Dictionary ? never : true;

const incompleteDictionaryRejected: IncompleteDictionaryRejected = true;

const collectStrings = (
  value: unknown,
  path: string,
  out: Array<[string, string]>,
): void => {
  if (typeof value === "string") {
    out.push([path, value]);
    return;
  }
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      collectStrings(child, `${path}.${key}`, out);
    }
    return;
  }
  throw new Error(`dictionary value at ${path} must be a plain string`);
};

describe("locale registry", () => {
  it("registers only supported locales with complete metadata", () => {
    for (const [code, meta] of Object.entries(locales)) {
      expect(meta.code).toBe(code);
      expect(meta.status).toBe("supported");
      expect(["ltr", "rtl"]).toContain(meta.dir);
      for (const value of [
        meta.nativeName,
        meta.englishName,
        meta.hreflang,
        meta.ogLocale,
        meta.intlLocale,
      ]) {
        expect(value.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("keeps BCP 47 codes and Open Graph locales explicitly distinct", () => {
    const meta = getLocale(defaultLocale);
    expect(meta.hreflang).toBe("en");
    expect(meta.ogLocale).toBe("en_US");
  });

  it("ships a dictionary for every registered locale and nothing else", () => {
    for (const code of Object.keys(locales)) {
      expect(Object.hasOwn(dictionaries, code)).toBe(true);
    }
    expect(Object.keys(dictionaries).sort()).toEqual(
      Object.keys(locales).sort(),
    );
  });

  it("resolves the default locale document attributes", () => {
    const meta = getLocale(defaultLocale);
    expect(meta.code).toBe("en");
    expect(meta.dir).toBe("ltr");
  });

  it("never falls back to another locale's dictionary", () => {
    expect(dictionaries.en).toBe(en);
    expect(getDictionary(defaultLocale)).toBe(en);
  });
});

describe("English dictionary", () => {
  it("populates every leaf with a non-empty string", () => {
    const leaves: Array<[string, string]> = [];
    collectStrings(en, "en", leaves);
    expect(leaves.length).toBeGreaterThan(80);
    for (const [path, value] of leaves) {
      expect(value.trim().length, `${path} must not be empty`).toBeGreaterThan(
        0,
      );
    }
  });

  it("stays JSON-serializable for client scripts", () => {
    expect(JSON.parse(JSON.stringify(en))).toEqual(en);
  });
});

describe("dictionary type safety", () => {
  it("rejects an incomplete dictionary at compile time", () => {
    expect(incompleteDictionaryRejected).toBe(true);
  });
});

describe("interpolate", () => {
  it("replaces named tokens", () => {
    expect(interpolate("{a} and {b}", { a: "x", b: "y" })).toBe("x and y");
  });

  it("replaces repeated tokens", () => {
    expect(interpolate("{a}+{a}", { a: "1" })).toBe("1+1");
  });

  it("accepts number values", () => {
    expect(interpolate("{count} tools", { count: 2 })).toBe("2 tools");
  });

  it("leaves unknown tokens visible", () => {
    expect(interpolate("No tools match {query}", {})).toBe(
      "No tools match {query}",
    );
  });
});
