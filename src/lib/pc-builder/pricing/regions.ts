/*
 * Country and market configuration for commercial pricing (M10.7).
 *
 * A market is an explicit configuration record, not an inference from browser
 * language, timezone or geolocation. Language, country and currency are three
 * independent dimensions: the India example uses INR with an en-IN display
 * locale, while Germany uses EUR with de-DE.
 *
 * The four EXAMPLE_MARKETS below are illustrative configuration entries for
 * development and tests. They are not a restriction on future markets.
 */

import {
  failure,
  issue,
  success,
  validateStringArray,
  validateText,
} from "./validation";
import { normalizeCurrencyCode } from "./money";
import type { Market, PricingIssue, PricingResult } from "./types";

/** ISO 3166-1 alpha-2 officially assigned country codes. */
const ISO_COUNTRY_CODES = new Set(
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(
    " ",
  ),
);

export function isCountryCode(value: unknown): value is string {
  return typeof value === "string" && ISO_COUNTRY_CODES.has(value);
}

export function normalizeCountryCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  return isCountryCode(normalized) ? normalized : null;
}

export function isMarketId(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9][a-z0-9-]{1,31}$/.test(value);
}

function validateLocale(value: unknown): PricingResult<string> {
  const text = validateText(value, "displayLocale", 35);
  if (!text.ok) return text;
  try {
    const canonical = Intl.getCanonicalLocales(text.value)[0];
    if (!canonical) {
      return failure([
        issue(
          "displayLocale",
          "invalid-locale",
          "Expected a valid BCP-47 locale.",
        ),
      ]);
    }
    return success(canonical);
  } catch {
    return failure([
      issue(
        "displayLocale",
        "invalid-locale",
        "Expected a valid BCP-47 locale.",
      ),
    ]);
  }
}

export function validateMarket(value: unknown): PricingResult<Market> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return failure([
      issue("market", "invalid-type", "Market must be an object."),
    ]);
  }
  const record = value as Record<string, unknown>;
  const issues: PricingIssue[] = [];

  const id = record.id;
  if (!isMarketId(id)) {
    issues.push(
      issue(
        "market.id",
        "invalid-id",
        "Market id must be lowercase letters, digits or hyphens.",
      ),
    );
  }

  const country = normalizeCountryCode(record.countryCode);
  if (country === null) {
    issues.push(
      issue(
        "market.countryCode",
        "invalid-country",
        "Expected an ISO 3166-1 alpha-2 country code.",
      ),
    );
  }

  const name = validateText(record.name, "market.name", 80);
  if (!name.ok) issues.push(...name.issues);

  const defaultCurrency = normalizeCurrencyCode(record.defaultCurrency);
  if (defaultCurrency === null) {
    issues.push(
      issue(
        "market.defaultCurrency",
        "invalid-currency",
        "Expected a supported ISO 4217 currency code.",
      ),
    );
  }

  const locale = validateLocale(record.displayLocale);
  if (!locale.ok) issues.push(...locale.issues);

  const supportedRaw = validateStringArray(
    record.supportedCurrencies,
    "market.supportedCurrencies",
    { min: 1, max: 12, maxItemLength: 3, lowercaseOnly: false },
  );
  if (!supportedRaw.ok) {
    issues.push(...supportedRaw.issues);
  }

  const supportedCurrencies: string[] = [];
  if (supportedRaw.ok) {
    for (const [index, currency] of supportedRaw.value.entries()) {
      const normalized = normalizeCurrencyCode(currency);
      if (normalized === null) {
        issues.push(
          issue(
            `market.supportedCurrencies[${index}]`,
            "invalid-currency",
            "Expected a supported ISO 4217 currency code.",
          ),
        );
        continue;
      }
      if (supportedCurrencies.includes(normalized)) {
        issues.push(
          issue(
            `market.supportedCurrencies[${index}]`,
            "invalid-value",
            "Duplicate currency.",
          ),
        );
        continue;
      }
      supportedCurrencies.push(normalized);
    }
  }

  if (
    defaultCurrency !== null &&
    !supportedCurrencies.includes(defaultCurrency)
  ) {
    issues.push(
      issue(
        "market.supportedCurrencies",
        "invalid-value",
        "The default currency must be listed in supportedCurrencies.",
      ),
    );
  }

  if (issues.length > 0) {
    return failure(issues);
  }
  if (!name.ok) return name;
  if (!locale.ok) return locale;
  if (!isMarketId(id) || country === null || defaultCurrency === null) {
    return failure([
      issue("market", "invalid-market", "Market could not be normalized."),
    ]);
  }

  return success({
    id,
    countryCode: country,
    name: name.value,
    defaultCurrency,
    displayLocale: locale.value,
    supportedCurrencies,
  });
}

/** Explicit illustrative configurations; add markets as data, not branches. */
export const EXAMPLE_MARKETS: readonly Market[] = [
  {
    id: "us",
    countryCode: "US",
    name: "United States",
    defaultCurrency: "USD",
    displayLocale: "en-US",
    supportedCurrencies: ["USD"],
  },
  {
    id: "in",
    countryCode: "IN",
    name: "India",
    defaultCurrency: "INR",
    displayLocale: "en-IN",
    supportedCurrencies: ["INR"],
  },
  {
    id: "gb",
    countryCode: "GB",
    name: "United Kingdom",
    defaultCurrency: "GBP",
    displayLocale: "en-GB",
    supportedCurrencies: ["GBP"],
  },
  {
    id: "de",
    countryCode: "DE",
    name: "Germany",
    defaultCurrency: "EUR",
    displayLocale: "de-DE",
    supportedCurrencies: ["EUR"],
  },
];

export function marketById(
  id: string,
  markets: readonly Market[] = EXAMPLE_MARKETS,
): Market | null {
  return markets.find((market) => market.id === id) ?? null;
}

/** Explicit lookup only; never use this to infer a purchaser's geolocation. */
export function marketsByCountry(
  countryCode: string,
  markets: readonly Market[] = EXAMPLE_MARKETS,
): Market[] {
  const country = normalizeCountryCode(countryCode);
  if (country === null) return [];
  return markets.filter((market) => market.countryCode === country);
}
