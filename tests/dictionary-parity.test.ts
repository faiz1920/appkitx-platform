import { describe, expect, it } from "vitest";
import { defaultLocale, dictionaries } from "../src/i18n/config";

/*
 * M6 translation guards. The Dictionary type already rejects missing keys;
 * these tests protect the parts TypeScript cannot see: interpolation tokens
 * and inline-code markers must survive translation. A translator can change
 * every word, but not drop a {token} or an unmatched backtick.
 */

function collectStrings(
  value: unknown,
  path: string,
  out: Map<string, string>,
): void {
  if (typeof value === "string") {
    out.set(path, value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectStrings(item, `${path}[${index}]`, out);
    });
    return;
  }
  if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      collectStrings(child, path === "" ? key : `${path}.${key}`, out);
    }
  }
}

const tokens = (text: string): string[] =>
  (text.match(/\{[a-zA-Z]+\}/g) ?? []).sort();

const backticks = (text: string): number => (text.match(/`/g) ?? []).length;

const source = new Map<string, string>();
collectStrings(dictionaries[defaultLocale], "", source);

describe("dictionary token parity", () => {
  for (const [code, dictionary] of Object.entries(dictionaries)) {
    if (code === defaultLocale) continue;

    const translation = new Map<string, string>();
    collectStrings(dictionary, "", translation);

    it(`${code} preserves every interpolation token`, () => {
      for (const [path, english] of source) {
        const translated = translation.get(path);
        if (translated === undefined) continue;
        expect(tokens(translated), `${code}:${path}`).toEqual(tokens(english));
      }
    });

    it(`${code} preserves inline-code markers`, () => {
      for (const [path, english] of source) {
        const translated = translation.get(path);
        if (translated === undefined) continue;
        expect(backticks(translated), `${code}:${path}`).toBe(
          backticks(english),
        );
      }
    });
  }

  it("keeps every code-span marker balanced in every locale", () => {
    for (const [code, dictionary] of Object.entries(dictionaries)) {
      const leaves = new Map<string, string>();
      collectStrings(dictionary, "", leaves);
      for (const [path, text] of leaves) {
        expect(backticks(text) % 2, `${code}:${path}`).toBe(0);
      }
    }
  });

  it("never leaves an empty inline-code span", () => {
    for (const [code, dictionary] of Object.entries(dictionaries)) {
      const leaves = new Map<string, string>();
      collectStrings(dictionary, "", leaves);
      for (const [path, text] of leaves) {
        expect(text, `${code}:${path}`).not.toContain("``");
      }
    }
  });
});
