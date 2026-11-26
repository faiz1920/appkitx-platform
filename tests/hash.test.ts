import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  hashCryptoAvailable,
  hashText,
  HASH_ALGORITHMS,
  HASH_DEFAULT_ALGORITHM,
  HASH_HEX_LENGTHS,
  HashDigestError,
  HashUnsupportedError,
  isHashAlgorithm,
  type HashSource,
} from "../src/lib/hash";

/*
 * Hash contract: known SHA-2 vectors (not self-comparisons), UTF-8 input,
 * lowercase hexadecimal output at the standard lengths, deterministic
 * algorithm switching, and distinct typed failures for unavailable Web
 * Crypto and digest rejection.
 */

const VECTORS = {
  "SHA-256": {
    abc: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    empty: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    unicode: "d87b4a76e84eea9f187f77311aaa08530b086d1c5aebf4024357286b35cebdcb",
    multiline:
      "b6858b03a6cae635deeaeab09a74e598979b72c917cbfff0bb3fe2cd05111dbc",
    japanese:
      "77710aedc74ecfa33685e33a6c7df5cc83004da1bdcef7fb280f5c2b2e97e0a5",
  },
  "SHA-384": {
    abc: "cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7",
    empty:
      "38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b",
    unicode:
      "989574ec042f72129243a270305a57d2148558263a3e3ca6e2cda5823457b507f6f1708c28984822ee3a83df1bb94078",
    multiline:
      "93471665fb56ba932c6795acba0cb4c0111b7fc53ecc13a1480a49a1fa9ce32ed178ff9faefc51dfe2dc6fe31f7b16b0",
    japanese: null,
  },
  "SHA-512": {
    abc: "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f",
    empty:
      "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e",
    unicode:
      "a378de856d97ede9c231249d61347b7647ad43a0c4ad411d385cad7f47eaf443a0de14f4833b6b21cfb44015b525712500ebbd3be13f2afe80ca069a90bf991e",
    multiline:
      "38b290cd3b4aced1401bf2edea306e2d0bf95803adb08c798f0dcd6eaa55f6d9fef8e4df7f9ac300707f253263a01db4f240b35b9e37a8cb1911cc02cd1ebb16",
    japanese: null,
  },
} as const;

const TEXT = {
  abc: "abc",
  empty: "",
  unicode: "héllo 🚀",
  multiline: "line one\nline two",
  japanese: "日本語",
} as const;

describe("hashText", () => {
  for (const algorithm of HASH_ALGORITHMS) {
    it(`${algorithm} matches independent known vectors`, async () => {
      const vectors = VECTORS[algorithm];
      expect(await hashText(TEXT.abc, algorithm)).toBe(vectors.abc);
      expect(await hashText(TEXT.empty, algorithm)).toBe(vectors.empty);
      expect(await hashText(TEXT.unicode, algorithm)).toBe(vectors.unicode);
      expect(await hashText(TEXT.multiline, algorithm)).toBe(vectors.multiline);
    });

    it(`${algorithm} returns lowercase hex at the standard length`, async () => {
      const digest = await hashText(TEXT.abc, algorithm);
      expect(digest).toHaveLength(HASH_HEX_LENGTHS[algorithm]);
      expect(digest).toMatch(/^[0-9a-f]+$/);
    });
  }

  it("hashes non-ASCII text from its UTF-8 bytes", async () => {
    expect(await hashText(TEXT.japanese, "SHA-256")).toBe(
      VECTORS["SHA-256"].japanese,
    );
  });

  it("preserves line breaks rather than normalizing them", async () => {
    expect(await hashText(TEXT.multiline, "SHA-256")).not.toBe(
      await hashText("line one line two", "SHA-256"),
    );
    expect(await hashText(TEXT.multiline, "SHA-256")).toBe(
      VECTORS["SHA-256"].multiline,
    );
  });

  it("switches algorithms deterministically for the same input", async () => {
    const digests = await Promise.all(
      HASH_ALGORITHMS.map((algorithm) => hashText(TEXT.abc, algorithm)),
    );
    expect(digests).toEqual([
      VECTORS["SHA-256"].abc,
      VECTORS["SHA-384"].abc,
      VECTORS["SHA-512"].abc,
    ]);
    expect(new Set(digests).size).toBe(3);
  });

  it("defaults to SHA-256", async () => {
    expect(HASH_DEFAULT_ALGORITHM).toBe("SHA-256");
    expect(await hashText(TEXT.abc)).toBe(VECTORS["SHA-256"].abc);
  });

  it("throws a typed error when Web Crypto is unavailable", async () => {
    await expect(hashText("abc", "SHA-256", {})).rejects.toBeInstanceOf(
      HashUnsupportedError,
    );
    await expect(
      hashText("abc", "SHA-256", { subtle: {} }),
    ).rejects.toBeInstanceOf(HashUnsupportedError);
  });

  it("throws a typed error when the digest is rejected", async () => {
    const source: HashSource = {
      subtle: {
        digest: () => Promise.reject(new Error("operation failed")),
      },
    };
    await expect(hashText("abc", "SHA-256", source)).rejects.toBeInstanceOf(
      HashDigestError,
    );
  });
});

describe("hashCryptoAvailable", () => {
  it("accepts a source with a digest function", () => {
    expect(
      hashCryptoAvailable({
        subtle: { digest: async () => new ArrayBuffer(32) },
      }),
    ).toBe(true);
  });

  it("rejects missing or non-function digests", () => {
    expect(hashCryptoAvailable({})).toBe(false);
    expect(hashCryptoAvailable({ subtle: {} })).toBe(false);
  });
});

describe("isHashAlgorithm", () => {
  it("accepts only the supported algorithms", () => {
    for (const algorithm of HASH_ALGORITHMS) {
      expect(isHashAlgorithm(algorithm)).toBe(true);
    }
    expect(isHashAlgorithm("SHA-1")).toBe(false);
    expect(isHashAlgorithm("sha-256")).toBe(false);
    expect(isHashAlgorithm("MD5")).toBe(false);
  });
});

describe("randomness policy", () => {
  it("never reaches for Math.random", () => {
    const source = readFileSync(
      new URL("../src/lib/hash.ts", import.meta.url),
      "utf8",
    );
    expect(source).not.toContain("Math.random");
  });
});
