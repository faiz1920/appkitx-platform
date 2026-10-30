/*
 * Shared catalogue metadata.
 *
 * The catalogue grew from the 27-record M10.1 seed to 101 records in M10.3.
 * It is still NOT a representation of the complete global market. Every
 * record carries its source attribution and the date the record was last
 * verified against the manufacturer-published specification. Values the
 * source does not publish are recorded as explicit null (unknown) — never
 * guessed.
 */

import type { ComponentSource } from "../types.ts";

export const CATALOGUE_VERIFIED_DATE = "2026-10-31";

export function manufacturerSource(name: string, url: string): ComponentSource {
  return {
    name,
    url,
    accessedAt: CATALOGUE_VERIFIED_DATE,
  };
}
