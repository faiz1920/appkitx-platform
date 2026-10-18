/*
 * Pure Base64 encode/decode for the Base64 Encoder tool (M7 Phase 1).
 *
 * Policy (approved in the M7 Phase 0 decision report):
 * - Encode: text is encoded as UTF-8 bytes, then represented with the
 *   standard alphabet and '=' padding.
 * - Decode: whitespace anywhere is ignored (wrapped output from other tools
 *   decodes as-is); the standard and URL-safe alphabets are both accepted
 *   (URL-safe characters are normalized); padding is optional; characters
 *   outside the alphabet, misplaced padding, impossible lengths, and byte
 *   sequences that are not valid UTF-8 are rejected.
 * - Empty or whitespace-only input reports the "empty" issue so the UI can
 *   show a specific message instead of "decoding" nothing.
 *
 * Decoding deliberately does not enforce canonical trailing bits (for
 * example "QR==" decodes to "A" in mainstream tools), matching the behavior
 * of browser atob/atob-style decoders.
 *
 * The module is dependency-free and uses only TextEncoder/TextDecoder, so it
 * runs unchanged in the client script and in Vitest.
 */

const BASE64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export type Base64Issue = "empty" | "invalid";

export type Base64DecodeResult =
  { ok: true; value: string } | { ok: false; issue: Base64Issue };

/** Encode text as UTF-8 bytes in standard, padded Base64. */
export function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let result = "";
  for (let index = 0; index < bytes.length; index += 3) {
    const byte1 = bytes[index] ?? 0;
    const byte2 = bytes[index + 1];
    const byte3 = bytes[index + 2];
    const hasSecond = byte2 !== undefined;
    const hasThird = byte3 !== undefined;
    const chunk = (byte1 << 16) | ((byte2 ?? 0) << 8) | (byte3 ?? 0);
    result += BASE64_CHARS[(chunk >> 18) & 63];
    result += BASE64_CHARS[(chunk >> 12) & 63];
    result += hasSecond ? BASE64_CHARS[(chunk >> 6) & 63] : "=";
    result += hasThird ? BASE64_CHARS[chunk & 63] : "=";
  }
  return result;
}

/** Decode Base64 (standard or URL-safe, padding optional) as UTF-8 text. */
export function decodeBase64(input: string): Base64DecodeResult {
  const compact = input.replace(/\s+/g, "");
  if (compact === "") return { ok: false, issue: "empty" };

  const normalized = compact.replace(/-/g, "+").replace(/_/g, "/");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) {
    return { ok: false, issue: "invalid" };
  }

  const withoutPadding = normalized.replace(/=+$/, "");
  const remainder = withoutPadding.length % 4;
  if (remainder === 1) return { ok: false, issue: "invalid" };
  const padded =
    remainder === 0
      ? withoutPadding
      : withoutPadding.padEnd(withoutPadding.length + (4 - remainder), "=");

  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(
      base64ToBytes(padded),
    );
    return { ok: true, value: text };
  } catch {
    return { ok: false, issue: "invalid" };
  }
}

function base64ToBytes(value: string): Uint8Array {
  const bytes: number[] = [];
  for (let index = 0; index < value.length; index += 4) {
    const c0 = BASE64_CHARS.indexOf(value[index] ?? "");
    const c1 = BASE64_CHARS.indexOf(value[index + 1] ?? "");
    const third = value[index + 2];
    const fourth = value[index + 3];
    const c2 =
      third === "=" || third === undefined ? -1 : BASE64_CHARS.indexOf(third);
    const c3 =
      fourth === "=" || fourth === undefined
        ? -1
        : BASE64_CHARS.indexOf(fourth);
    const chunk =
      (c0 << 18) |
      (c1 << 12) |
      ((c2 === -1 ? 0 : c2) << 6) |
      (c3 === -1 ? 0 : c3);
    bytes.push((chunk >> 16) & 0xff);
    if (c2 !== -1) bytes.push((chunk >> 8) & 0xff);
    if (c3 !== -1) bytes.push(chunk & 0xff);
  }
  return Uint8Array.from(bytes);
}
