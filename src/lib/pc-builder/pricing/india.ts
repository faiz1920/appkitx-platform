/*
 * India-first pricing readiness (M10.8).
 *
 * India is the first rollout market, not an architectural special case. The
 * market itself is ordinary configuration in regions.ts; this module only
 * proves that the configured India entry satisfies the launch requirements:
 * ISO country IN, ISO currency INR, two minor-unit digits and the en-IN
 * display locale with the rupee symbol.
 *
 * Nothing here infers a purchaser's country. Callers must select the market
 * explicitly, exactly as with every other market.
 */

import { currencyInfo } from "./money";
import { EXAMPLE_MARKETS } from "./regions";
import type { Market } from "./types";

export const INDIA_MARKET_ID = "in";
export const INDIA_COUNTRY_CODE = "IN";
export const INDIA_CURRENCY = "INR";
export const INDIA_DISPLAY_LOCALE = "en-IN";
export const INDIA_CURRENCY_PRECISION = 2;
export const INDIA_CURRENCY_SYMBOL = "₹";

export interface MarketReadinessCheck {
  /** Stable check id for tests and reporting. */
  readonly id: string;
  readonly passed: boolean;
  readonly detail: string;
}

export interface IndiaMarketReadiness {
  readonly market: Market | null;
  readonly ready: boolean;
  readonly checks: readonly MarketReadinessCheck[];
}

function currencySymbol(market: Market): string | null {
  try {
    const parts = new Intl.NumberFormat(market.displayLocale, {
      style: "currency",
      currency: market.defaultCurrency,
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0);
    return parts.find((part) => part.type === "currency")?.value ?? null;
  } catch {
    return null;
  }
}

/** Explicit lookup only; returns null when the market is not configured. */
export function findIndiaMarket(
  markets: readonly Market[] = EXAMPLE_MARKETS,
): Market | null {
  return markets.find((market) => market.id === INDIA_MARKET_ID) ?? null;
}

/**
 * Assess the configured India market against the launch contract. A failed
 * check is reported rather than repaired, so a misconfigured market can never
 * silently become the launch market.
 */
export function assessIndiaMarketReadiness(
  market: Market | null = findIndiaMarket(),
): IndiaMarketReadiness {
  const checks: MarketReadinessCheck[] = [];

  checks.push({
    id: "market-configured",
    passed: market !== null,
    detail:
      market === null
        ? `No market with id "${INDIA_MARKET_ID}" is configured.`
        : `Market "${market.id}" is configured.`,
  });

  if (market === null) {
    return { market: null, ready: false, checks };
  }

  checks.push({
    id: "market-id",
    passed: market.id === INDIA_MARKET_ID,
    detail: `Market id is "${market.id}"; expected "${INDIA_MARKET_ID}".`,
  });
  checks.push({
    id: "country-code",
    passed: market.countryCode === INDIA_COUNTRY_CODE,
    detail: `Country code is "${market.countryCode}"; expected "${INDIA_COUNTRY_CODE}".`,
  });
  checks.push({
    id: "default-currency",
    passed: market.defaultCurrency === INDIA_CURRENCY,
    detail: `Default currency is "${market.defaultCurrency}"; expected "${INDIA_CURRENCY}".`,
  });
  checks.push({
    id: "supported-currency",
    passed: market.supportedCurrencies.includes(INDIA_CURRENCY),
    detail: `Supported currencies: ${market.supportedCurrencies.join(", ") || "none"}.`,
  });

  const precision = currencyInfo(market.defaultCurrency)?.precision ?? null;
  checks.push({
    id: "currency-precision",
    passed: precision === INDIA_CURRENCY_PRECISION,
    detail: `Resolved precision is ${precision ?? "unknown"}; expected ${INDIA_CURRENCY_PRECISION}.`,
  });
  checks.push({
    id: "display-locale",
    passed: market.displayLocale === INDIA_DISPLAY_LOCALE,
    detail: `Display locale is "${market.displayLocale}"; expected "${INDIA_DISPLAY_LOCALE}".`,
  });

  const symbol = currencySymbol(market);
  checks.push({
    id: "currency-symbol",
    passed: symbol === INDIA_CURRENCY_SYMBOL,
    detail: `Rendered symbol is "${symbol ?? "unknown"}"; expected "${INDIA_CURRENCY_SYMBOL}".`,
  });

  return {
    market,
    ready: checks.every((check) => check.passed),
    checks,
  };
}
