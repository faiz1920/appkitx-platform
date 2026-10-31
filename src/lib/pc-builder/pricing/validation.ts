/*
 * Shared validation primitives for untrusted pricing/provider data.
 *
 * These helpers never coerce a suspicious value into a plausible one. Invalid
 * input is reported with a path and code; optional commercial data is handled
 * explicitly by the calling module.
 */

import type { PricingIssue, PricingIssueCode, PricingResult } from "./types";

const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const MAX_URL_LENGTH = 2048;
const MAX_CURSOR_LENGTH = 256;

export function issue(
  path: string,
  code: PricingIssueCode,
  message: string,
): PricingIssue {
  return { path, code, message };
}

export function failure<T>(issues: readonly PricingIssue[]): PricingResult<T> {
  return { ok: false, issues: [...issues] };
}

export function success<T>(value: T): PricingResult<T> {
  return { ok: true, value };
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeKey(value: string): string {
  return value.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ");
}

export function isCanonicalTimestamp(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_TIMESTAMP_PATTERN.test(value)) {
    return false;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.toISOString() !== value) {
    return false;
  }
  return date.getUTCFullYear() >= 2000 && date.getUTCFullYear() <= 2100;
}

export function validateTimestamp(
  value: unknown,
  path: string,
  options: { optional?: boolean } = {},
): PricingResult<string | null> {
  if (value === null || value === undefined) {
    if (options.optional) return success(null);
    return failure([issue(path, "missing", "A timestamp is required.")]);
  }
  if (!isCanonicalTimestamp(value)) {
    return failure([
      issue(
        path,
        "invalid-timestamp",
        "Expected a canonical ISO 8601 UTC timestamp.",
      ),
    ]);
  }
  return success(value);
}

/** Canonical ISO timestamps compare lexicographically. */
export function isAtOrBefore(candidate: string, reference: string): boolean {
  return candidate <= reference;
}

export function validateText(
  value: unknown,
  path: string,
  maxLength: number,
): PricingResult<string> {
  if (typeof value !== "string") {
    return failure([issue(path, "invalid-type", "Expected text.")]);
  }
  const trimmed = value.trim();
  if (trimmed === "") {
    return failure([issue(path, "missing", "A non-empty value is required.")]);
  }
  if (trimmed.length > maxLength) {
    return failure([
      issue(path, "too-long", `Maximum length is ${maxLength} characters.`),
    ]);
  }
  if (CONTROL_CHARACTER_PATTERN.test(trimmed)) {
    return failure([
      issue(path, "invalid-value", "Control characters are not allowed."),
    ]);
  }
  return success(trimmed);
}

export function validateOptionalText(
  value: unknown,
  path: string,
  maxLength: number,
): PricingResult<string | null> {
  if (value === null || value === undefined) return success(null);
  const result = validateText(value, path, maxLength);
  return result.ok ? success(result.value) : result;
}

export function isStableId(
  value: unknown,
  lowercaseOnly = false,
): value is string {
  if (typeof value !== "string" || value.length < 2 || value.length > 160) {
    return false;
  }
  return lowercaseOnly
    ? /^[a-z0-9][a-z0-9._-]{1,63}$/.test(value)
    : /^[A-Za-z0-9][A-Za-z0-9._:-]{1,159}$/.test(value);
}

export function isComponentId(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9][a-z0-9-]{1,79}$/.test(value);
}

export function isJsonSafeByteLength(value: unknown, limit: number): boolean {
  try {
    const json = JSON.stringify(value);
    if (json === undefined) return false;
    return new TextEncoder().encode(json).byteLength <= limit;
  } catch {
    return false;
  }
}

export function validateHttpsUrl(
  value: unknown,
  path: string,
): PricingResult<string> {
  const text = validateText(value, path, MAX_URL_LENGTH);
  if (!text.ok) return text;
  if (CONTROL_CHARACTER_PATTERN.test(text.value)) {
    return failure([
      issue(path, "invalid-url", "URLs cannot contain control characters."),
    ]);
  }

  let url: URL;
  try {
    url = new URL(text.value);
  } catch {
    return failure([issue(path, "invalid-url", "Expected a valid URL.")]);
  }

  if (url.protocol !== "https:") {
    return failure([
      issue(path, "invalid-url", "Only HTTPS URLs are accepted."),
    ]);
  }
  if (url.username !== "" || url.password !== "") {
    return failure([
      issue(path, "invalid-url", "URLs cannot contain credentials."),
    ]);
  }
  if (url.hostname === "" || !url.hostname.includes(".")) {
    return failure([issue(path, "invalid-url", "Expected a public hostname.")]);
  }
  return success(text.value);
}

export function validateStringArray(
  value: unknown,
  path: string,
  options: {
    min: number;
    max: number;
    maxItemLength?: number;
    lowercaseOnly?: boolean;
  },
): PricingResult<string[]> {
  if (!Array.isArray(value)) {
    return failure([issue(path, "invalid-type", "Expected an array.")]);
  }
  if (value.length < options.min || value.length > options.max) {
    return failure([
      issue(
        path,
        "invalid-value",
        `Expected between ${options.min} and ${options.max} entries.`,
      ),
    ]);
  }

  const seen = new Set<string>();
  const output: string[] = [];
  for (const [index, entry] of value.entries()) {
    const entryPath = `${path}[${index}]`;
    if (typeof entry !== "string" || entry.trim() === "") {
      return failure([
        issue(entryPath, "invalid-value", "Expected a non-empty string."),
      ]);
    }
    const normalized = entry.trim();
    if (
      options.maxItemLength !== undefined &&
      normalized.length > options.maxItemLength
    ) {
      return failure([
        issue(
          entryPath,
          "too-long",
          `Maximum length is ${options.maxItemLength} characters.`,
        ),
      ]);
    }
    if (CONTROL_CHARACTER_PATTERN.test(normalized)) {
      return failure([
        issue(
          entryPath,
          "invalid-value",
          "Control characters are not allowed.",
        ),
      ]);
    }
    if (options.lowercaseOnly && normalized !== normalized.toLowerCase()) {
      return failure([
        issue(entryPath, "invalid-value", "Use lowercase identifiers."),
      ]);
    }
    if (seen.has(normalized)) {
      return failure([
        issue(entryPath, "invalid-value", "Duplicate entries are not allowed."),
      ]);
    }
    seen.add(normalized);
    output.push(normalized);
  }
  return success(output);
}

export function validateCursor(value: unknown): PricingResult<string | null> {
  if (value === null || value === undefined) return success(null);
  if (typeof value !== "string" || value.length === 0) {
    return failure([
      issue("cursor", "invalid-value", "Cursor must be a non-empty string."),
    ]);
  }
  if (value.length > MAX_CURSOR_LENGTH) {
    return failure([issue("cursor", "too-long", "Cursor is too long.")]);
  }
  if (CONTROL_CHARACTER_PATTERN.test(value)) {
    return failure([
      issue("cursor", "invalid-value", "Cursor contains control characters."),
    ]);
  }
  return success(value);
}
