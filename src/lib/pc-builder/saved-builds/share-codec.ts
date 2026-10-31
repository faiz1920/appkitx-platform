/*
 * Portable share-link codec for PC builds (M10.5).
 *
 * Format: JSON payload -> UTF-8 bytes -> unpadded base64url in the URL
 * fragment (`#build=<payload>`). The fragment is never sent to the server.
 *
 * The payload is intentionally small: schema version, name, source, component
 * ids, optional guided questionnaire metadata and an optional creation time.
 * No catalogue records, derived verdicts, power calculations, account data or
 * private storage state are included.
 *
 * There is no compression: the compact JSON is far smaller than the strict
 * encoded-size limit, and avoiding a compression dependency keeps decoding
 * deterministic and auditable.
 */

import { componentCategories } from "../types";
import { validateShareBuildPayload } from "./schema";
import {
  MAX_SHARE_ENCODED_LENGTH,
  MAX_SHARE_JSON_BYTES,
  SAVED_BUILD_SCHEMA_VERSION,
  type SavedBuild,
  type SavedBuildQuestionnaire,
  type SavedBuildSelection,
  type ShareBuildPayload,
  type ShareErrorCode,
  type ShareResult,
} from "./types";
import { byteLength } from "./serialize";

const BASE64URL_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

const BASE64URL_LOOKUP = new Map<string, number>(
  [...BASE64URL_ALPHABET].map((character, index) => [character, index]),
);

function encodeBase64Url(bytes: Uint8Array): string {
  let output = "";
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index] ?? 0;
    const second = bytes[index + 1];
    const third = bytes[index + 2];

    output += BASE64URL_ALPHABET[first >> 2];
    output += BASE64URL_ALPHABET[((first & 0b11) << 4) | ((second ?? 0) >> 4)];
    if (second !== undefined) {
      output +=
        BASE64URL_ALPHABET[((second & 0b1111) << 2) | ((third ?? 0) >> 6)];
    }
    if (third !== undefined) {
      output += BASE64URL_ALPHABET[third & 0b111111];
    }
  }
  return output;
}

function decodeBase64Url(value: string): Uint8Array | null {
  if (value.length % 4 === 1) return null;
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;

  for (const character of value) {
    const index = BASE64URL_LOOKUP.get(character);
    if (index === undefined) return null;
    buffer = (buffer << 6) | index;
    bits += 6;
    while (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
    buffer &= (1 << bits) - 1;
  }

  // Unpadded base64url must not leave non-zero trailing bits.
  if (bits > 0 && buffer !== 0) return null;
  return Uint8Array.from(bytes);
}

function shareError(
  code: ShareErrorCode,
  message: string,
): { ok: false; error: { code: ShareErrorCode; message: string } } {
  return { ok: false, error: { code, message } };
}

function canonicalSelections(
  selections: readonly SavedBuildSelection[],
): SavedBuildSelection[] {
  const byCategory = new Map(
    selections.map((selection) => [selection.category, selection.componentIds]),
  );
  return componentCategories
    .filter((category) => byCategory.has(category))
    .map((category) => ({
      category,
      componentIds: [...(byCategory.get(category) ?? [])],
    }));
}

function canonicalQuestionnaire(
  questionnaire: SavedBuildQuestionnaire,
): SavedBuildQuestionnaire {
  return {
    useCase: questionnaire.useCase,
    resolution: questionnaire.resolution,
    performancePriority: questionnaire.performancePriority,
    budget: questionnaire.budget,
    currency: questionnaire.currency,
  };
}

interface CompactQuestionnaire {
  u: string;
  r: string;
  p: string;
  b: number;
  cur: string;
}

interface CompactSharePayload {
  v: number;
  n: string;
  s: string;
  c: [string, string[]][];
  q?: CompactQuestionnaire;
  t?: string;
}

export function savedBuildToSharePayload(build: SavedBuild): ShareBuildPayload {
  return {
    schemaVersion: SAVED_BUILD_SCHEMA_VERSION,
    name: build.name,
    source: build.source,
    selections: canonicalSelections(build.selections),
    ...(build.questionnaire === undefined
      ? {}
      : { questionnaire: canonicalQuestionnaire(build.questionnaire) }),
    createdAt: build.createdAt,
  };
}

export interface SharePayloadInput {
  name: string;
  source: ShareBuildPayload["source"];
  selections: SavedBuildSelection[];
  questionnaire?: SavedBuildQuestionnaire | null;
  createdAt?: string;
}

export function createSharePayload(
  input: SharePayloadInput,
): ShareResult<ShareBuildPayload> {
  const candidate = {
    schemaVersion: SAVED_BUILD_SCHEMA_VERSION,
    name: input.name,
    source: input.source,
    selections: input.selections,
    ...(input.questionnaire === undefined || input.questionnaire === null
      ? {}
      : { questionnaire: input.questionnaire }),
    ...(input.createdAt === undefined ? {} : { createdAt: input.createdAt }),
  };
  const validated = validateShareBuildPayload(candidate);
  if (!validated.ok) {
    return shareError(
      "invalid-payload",
      validated.issues[0]?.message ?? "The share payload is invalid.",
    );
  }
  return { ok: true, value: validated.value };
}

export function encodeSharePayload(
  payload: ShareBuildPayload,
): ShareResult<string> {
  const validated = validateShareBuildPayload(payload);
  if (!validated.ok) {
    return shareError(
      "invalid-payload",
      validated.issues[0]?.message ?? "The share payload is invalid.",
    );
  }

  const complete = validated.value;
  const compact: CompactSharePayload = {
    v: SAVED_BUILD_SCHEMA_VERSION,
    n: complete.name,
    s: complete.source,
    c: canonicalSelections(complete.selections).map(
      (selection) =>
        [selection.category, selection.componentIds] as [string, string[]],
    ),
    ...(complete.questionnaire === undefined
      ? {}
      : {
          q: {
            u: complete.questionnaire.useCase,
            r: complete.questionnaire.resolution,
            p: complete.questionnaire.performancePriority,
            b: complete.questionnaire.budget,
            cur: complete.questionnaire.currency,
          },
        }),
    ...(complete.createdAt === undefined ? {} : { t: complete.createdAt }),
  };

  const json = JSON.stringify(compact);
  if (byteLength(json) > MAX_SHARE_JSON_BYTES) {
    return shareError(
      "oversized",
      `This build is too large to share (limit ${Math.round(
        MAX_SHARE_JSON_BYTES / 1024,
      )} KB of payload data).`,
    );
  }

  let encoded: string;
  try {
    encoded = encodeBase64Url(new TextEncoder().encode(json));
  } catch {
    return shareError(
      "invalid-payload",
      "The share payload could not be encoded.",
    );
  }

  if (encoded.length > MAX_SHARE_ENCODED_LENGTH) {
    return shareError(
      "oversized",
      `This build is too large to share (limit ${MAX_SHARE_ENCODED_LENGTH} encoded characters).`,
    );
  }
  return { ok: true, value: encoded };
}

export function decodeSharePayload(
  encoded: string,
): ShareResult<ShareBuildPayload> {
  if (typeof encoded !== "string" || encoded === "") {
    return shareError(
      "empty",
      "The share link does not contain a build payload.",
    );
  }
  if (encoded.length > MAX_SHARE_ENCODED_LENGTH) {
    return shareError(
      "oversized",
      "The share link is longer than the supported payload limit.",
    );
  }

  const bytes = decodeBase64Url(encoded);
  if (bytes === null) {
    return shareError(
      "malformed-encoding",
      "The share link payload is not valid URL-safe base64.",
    );
  }

  let json: string;
  try {
    json = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return shareError(
      "malformed-encoding",
      "The share link payload is not valid UTF-8 text.",
    );
  }

  if (byteLength(json) > MAX_SHARE_JSON_BYTES) {
    return shareError("oversized", "The decoded share payload is too large.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return shareError(
      "invalid-json",
      "The share link payload is not valid JSON.",
    );
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return shareError(
      "invalid-payload",
      "The share payload must be an object.",
    );
  }
  const compact = parsed as Record<string, unknown>;
  if (typeof compact.v !== "number") {
    return shareError(
      "invalid-payload",
      "The share payload has no schema version.",
    );
  }
  if (compact.v !== SAVED_BUILD_SCHEMA_VERSION) {
    return shareError(
      "unsupported-version",
      `This share link uses schema version ${compact.v}, which is not supported.`,
    );
  }
  if (typeof compact.n !== "string" || typeof compact.s !== "string") {
    return shareError(
      "invalid-payload",
      "The share payload is missing its name or source.",
    );
  }
  if (!Array.isArray(compact.c)) {
    return shareError(
      "invalid-payload",
      "The share payload has no component selections.",
    );
  }

  const selections: unknown[] = [];
  for (const entry of compact.c) {
    if (!Array.isArray(entry) || entry.length !== 2) {
      return shareError(
        "invalid-payload",
        "The share payload has a malformed component selection.",
      );
    }
    selections.push({ category: entry[0], componentIds: entry[1] });
  }

  let questionnaire: unknown;
  if (compact.q !== undefined) {
    const source = compact.q;
    if (
      typeof source !== "object" ||
      source === null ||
      Array.isArray(source)
    ) {
      return shareError(
        "invalid-payload",
        "The share payload has malformed questionnaire metadata.",
      );
    }
    const sourceRecord = source as Record<string, unknown>;
    questionnaire = {
      useCase: sourceRecord.u,
      resolution: sourceRecord.r,
      performancePriority: sourceRecord.p,
      budget: sourceRecord.b,
      currency: sourceRecord.cur,
    };
  }

  const candidate = {
    schemaVersion: SAVED_BUILD_SCHEMA_VERSION,
    name: compact.n,
    source: compact.s,
    selections,
    ...(questionnaire === undefined ? {} : { questionnaire }),
    ...(compact.t === undefined ? {} : { createdAt: compact.t }),
  };

  const validated = validateShareBuildPayload(candidate);
  if (!validated.ok) {
    return shareError(
      "invalid-payload",
      validated.issues[0]?.message ?? "The share payload is invalid.",
    );
  }
  return { ok: true, value: validated.value };
}

/**
 * Parse `#build=<payload>` from a location hash. Other fragments return null
 * so unrelated anchors keep working normally.
 */
export function extractSharePayloadFromHash(hash: string): string | null {
  if (hash === "#build") return "";
  if (!hash.startsWith("#build=")) return null;
  return hash.slice("#build=".length);
}

/** Build a portable link with the payload in the fragment, never the query. */
export function buildShareLink(
  baseUrl: string,
  encoded: string,
): ShareResult<string> {
  if (encoded === "") {
    return shareError("empty", "There is no share payload to link to.");
  }
  if (encoded.length > MAX_SHARE_ENCODED_LENGTH) {
    return shareError("oversized", "The encoded share payload is too long.");
  }
  if (!/^[A-Za-z0-9_-]+$/.test(encoded)) {
    return shareError(
      "malformed-encoding",
      "The encoded share payload is not URL-safe.",
    );
  }
  const base = baseUrl.split("#")[0]?.trim() ?? "";
  if (base === "") {
    return shareError(
      "invalid-payload",
      "A base URL is required for a share link.",
    );
  }
  return { ok: true, value: `${base}#build=${encoded}` };
}
