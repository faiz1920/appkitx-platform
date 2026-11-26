/*
 * Browser-native cryptographic hashing for the Hash Generator tool.
 *
 * Policy:
 * - Use `crypto.subtle.digest()` only; no hash algorithm is implemented here.
 * - Encode input as UTF-8 with TextEncoder before hashing.
 * - Return lowercase hexadecimal digests at the standard lengths:
 *   SHA-256 = 64 chars, SHA-384 = 96, SHA-512 = 128.
 * - Distinguish an unavailable Web Crypto API from a digest failure so the
 *   UI can show the correct message and never produce a fake result.
 * - The module is dependency-free and accepts an injected source, so it runs
 *   unchanged in the client script and in Vitest.
 */

export const HASH_ALGORITHMS = ["SHA-256", "SHA-384", "SHA-512"] as const;

export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number];

export const HASH_DEFAULT_ALGORITHM: HashAlgorithm = "SHA-256";

/** Lowercase hexadecimal length of each supported digest. */
export const HASH_HEX_LENGTHS: Record<HashAlgorithm, number> = {
  "SHA-256": 64,
  "SHA-384": 96,
  "SHA-512": 128,
};

/** Minimal surface of SubtleCrypto used by this module. */
export interface HashSubtle {
  digest?: (algorithm: HashAlgorithm, data: Uint8Array) => Promise<ArrayBuffer>;
}

export interface HashSource {
  subtle?: HashSubtle;
}

/** Raised when the browser does not expose crypto.subtle.digest. */
export class HashUnsupportedError extends Error {
  constructor() {
    super("Web Crypto is unavailable.");
    this.name = "HashUnsupportedError";
  }
}

/** Raised when the browser exposes Web Crypto but the digest fails. */
export class HashDigestError extends Error {
  constructor() {
    super("The digest could not be computed.");
    this.name = "HashDigestError";
  }
}

function defaultSource(): HashSource | undefined {
  if (
    typeof globalThis.crypto === "undefined" ||
    typeof globalThis.crypto.subtle === "undefined"
  ) {
    return undefined;
  }
  /*
   * The DOM lib types SubtleCrypto.digest over AlgorithmIdentifier and
   * BufferSource; this module only passes a HashAlgorithm string and UTF-8
   * bytes. The cast keeps the injected test sources simple.
   */
  return globalThis.crypto as unknown as HashSource;
}

/** True when the source can compute a digest. */
export function hashCryptoAvailable(
  source: HashSource | undefined = defaultSource(),
): boolean {
  return typeof source?.subtle?.digest === "function";
}

export function isHashAlgorithm(value: string): value is HashAlgorithm {
  return (HASH_ALGORITHMS as readonly string[]).includes(value);
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

/**
 * Hash UTF-8 text with the selected algorithm and return lowercase hex.
 * Empty text is valid at this layer; the page requires non-empty input.
 */
export async function hashText(
  text: string,
  algorithm: HashAlgorithm = HASH_DEFAULT_ALGORITHM,
  source: HashSource | undefined = defaultSource(),
): Promise<string> {
  if (typeof source?.subtle?.digest !== "function") {
    throw new HashUnsupportedError();
  }

  const data = new TextEncoder().encode(text);

  let digest: ArrayBuffer;
  try {
    digest = await source.subtle.digest(algorithm, data);
  } catch {
    throw new HashDigestError();
  }

  return bytesToHex(new Uint8Array(digest));
}
