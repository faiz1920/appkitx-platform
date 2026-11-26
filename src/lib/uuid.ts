/*
 * Standards-compliant UUID version 4 generation (RFC 9562).
 *
 * Policy:
 * - Prefer the platform's `crypto.randomUUID()` when it exists.
 * - Fall back to 16 bytes from `crypto.getRandomValues()`, then set the
 *   version and RFC variant bits explicitly: version 4 in byte 6 and the
 *   `10xx` variant in byte 8.
 * - Never fall back to a non-cryptographic random source; a UUID is only
 *   generated from Web Crypto. When it is unavailable the caller gets a
 *   typed error so the UI can explain the limitation instead of quietly
 *   producing a weaker identifier.
 * - Values are canonical lowercase and hyphenated at the boundary. Display
 *   formatting (uppercase, hyphen-free) is a pure transform over an already
 *   generated value and never generates a new one.
 *
 * The module is dependency-free and accepts an injected random source, so it
 * runs unchanged in the client script and in Vitest.
 */

export const UUID_MIN_COUNT = 1;
export const UUID_MAX_COUNT = 100;
/** Initial quantity shown in the form. */
export const UUID_DEFAULT_COUNT = 5;

/** Minimal surface of the Web Crypto API this module needs. */
export interface UuidRandomSource {
  randomUUID?: () => string;
  getRandomValues?: (array: Uint8Array) => Uint8Array;
}

export type UuidCountIssue = "empty" | "invalid" | "range";

export type UuidCountResult =
  { ok: true; value: number } | { ok: false; issue: UuidCountIssue };

export interface UuidFormatOptions {
  uppercase?: boolean;
  /** Default true; false returns the same 32 hexadecimal digits in one run. */
  hyphens?: boolean;
}

/** Raised when no cryptographic random source is available. */
export class UuidUnsupportedError extends Error {
  constructor() {
    super("Web Crypto is unavailable.");
    this.name = "UuidUnsupportedError";
  }
}

function defaultSource(): UuidRandomSource | undefined {
  if (typeof globalThis.crypto === "undefined") return undefined;
  /*
   * The DOM lib types getRandomValues generically over BufferSource, which
   * TypeScript will not narrow to this module's Uint8Array signature. The
   * runtime contract is the same 16-byte fill; the cast keeps the injected
   * test sources simple.
   */
  return globalThis.crypto as unknown as UuidRandomSource;
}

/** True when the source can generate UUIDs without a weaker fallback. */
export function uuidCryptoAvailable(
  source: UuidRandomSource | undefined = defaultSource(),
): boolean {
  return (
    typeof source?.randomUUID === "function" ||
    typeof source?.getRandomValues === "function"
  );
}

function bytesToUuid(bytes: Uint8Array): string {
  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Generate one canonical lowercase UUID v4. */
export function generateUuid(
  source: UuidRandomSource | undefined = defaultSource(),
): string {
  if (typeof source?.randomUUID === "function") {
    return source.randomUUID().toLowerCase();
  }

  if (typeof source?.getRandomValues !== "function") {
    throw new UuidUnsupportedError();
  }

  const bytes = new Uint8Array(16);
  source.getRandomValues(bytes);

  /* Version 4: high nibble of byte 6 is 0100. */
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  /* RFC 9562 variant: top two bits of byte 8 are 10. */
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;

  return bytesToUuid(bytes);
}

/** True for an integer quantity the generator accepts. */
export function isValidUuidCount(value: number): boolean {
  return (
    Number.isInteger(value) &&
    value >= UUID_MIN_COUNT &&
    value <= UUID_MAX_COUNT
  );
}

/** Parse the form's raw quantity without accepting fractions or exponents. */
export function parseUuidCount(raw: string): UuidCountResult {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: false, issue: "empty" };
  if (!/^[0-9]+$/.test(trimmed)) return { ok: false, issue: "invalid" };

  const value = Number(trimmed);
  if (!isValidUuidCount(value)) return { ok: false, issue: "range" };
  return { ok: true, value };
}

/** Generate a batch of canonical lowercase UUID v4 values. */
export function generateUuids(
  count: number,
  source: UuidRandomSource | undefined = defaultSource(),
): string[] {
  if (!isValidUuidCount(count)) {
    throw new RangeError(
      `UUID quantity must be an integer from ${UUID_MIN_COUNT} to ${UUID_MAX_COUNT}.`,
    );
  }
  return Array.from({ length: count }, () => generateUuid(source));
}

/**
 * Apply display formatting to an existing UUID. This is a pure transform:
 * it never generates a value and never changes the underlying identifier.
 */
export function formatUuid(
  value: string,
  options: UuidFormatOptions = {},
): string {
  const { uppercase = false, hyphens = true } = options;
  const plain = value.replace(/-/g, "").toLowerCase();
  const formatted = hyphens
    ? `${plain.slice(0, 8)}-${plain.slice(8, 12)}-${plain.slice(12, 16)}-${plain.slice(16, 20)}-${plain.slice(20)}`
    : plain;
  return uppercase ? formatted.toUpperCase() : formatted;
}
