/*
 * Deterministic integrity fingerprints for provider product mapping (M10.12).
 *
 * These are 64-bit FNV-1a hashes rendered as 16 lowercase hexadecimal
 * characters. They are integrity checks, not cryptographic signatures, and
 * must never be presented as proof of human approval.
 */

const FINGERPRINT_PATTERN = /^[0-9a-f]{16}$/;

export function fnv1a64Hex(value: string): string {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= BigInt(value.charCodeAt(index));
    hash = BigInt.asUintN(64, hash * prime);
  }
  return hash.toString(16).padStart(16, "0");
}

export function isFingerprint(value: unknown): value is string {
  return typeof value === "string" && FINGERPRINT_PATTERN.test(value);
}
