/*
 * Explicitly synthetic pricing fixtures for M10.7 tests.
 *
 * Nothing here is a real retailer, price, stock claim or product match. Seller
 * names and URLs use reserved example domains; every offer is marked
 * `dataOrigin: "synthetic"`.
 */

import { componentById } from "../src/lib/pc-builder/catalogue";
import { moneyFromMinorUnits } from "../src/lib/pc-builder/pricing/money";
import { EXAMPLE_MARKETS } from "../src/lib/pc-builder/pricing/regions";
import type {
  CatalogueProductIdentity,
  Money,
  NormalizeOfferContext,
  Offer,
  ProductMatch,
  ProviderOfferRecord,
  Seller,
} from "../src/lib/pc-builder/pricing/types";

export const SYNTHETIC_NOW = "2026-10-31T12:00:00.000Z";
export const SYNTHETIC_NOW_DATE = new Date(SYNTHETIC_NOW);
export const SYNTHETIC_CPU_ID = "cpu-amd-ryzen-7-7800x3d";
export const SYNTHETIC_GPU_ID = "gpu-nvidia-geforce-rtx-4070-fe";
export const SYNTHETIC_GTIN = "4006381333931";

export function money(amountMinor: number, currency = "USD"): Money {
  const result = moneyFromMinorUnits(amountMinor, currency);
  if (!result.ok) throw new Error(`Invalid synthetic money: ${currency}`);
  return result.value;
}

export function usd(amountMinor: number): Money {
  return money(amountMinor, "USD");
}

export function syntheticSeller(overrides: Partial<Seller> = {}): Seller {
  return {
    id: "synthetic-retail",
    displayName: "Synthetic Example Retail",
    websiteUrl: "https://retailer.example",
    sellerType: "retailer",
    countryCodes: ["US", "IN", "GB", "DE"],
    marketIds: ["us", "in", "gb", "de"],
    parentMarketplaceId: null,
    providerId: "fixture-provider",
    logoUrl: null,
    dataOrigin: "synthetic",
    ...overrides,
  };
}

export function syntheticMarketplaceSeller(
  overrides: Partial<Seller> = {},
): Seller {
  return syntheticSeller({
    id: "synthetic-marketplace-seller",
    displayName: "Synthetic Marketplace Seller",
    websiteUrl: "https://seller.example",
    sellerType: "marketplace-seller",
    parentMarketplaceId: "synthetic-marketplace",
    ...overrides,
  });
}

export function identity(
  componentId = SYNTHETIC_CPU_ID,
  overrides: Partial<CatalogueProductIdentity> = {},
): CatalogueProductIdentity {
  const component = componentById(componentId);
  if (!component)
    throw new Error(`Unknown synthetic component: ${componentId}`);
  return {
    componentId: component.id,
    category: component.category,
    manufacturer: component.manufacturer,
    name: component.name,
    model: component.model,
    // Test-only stand-in for a future verified MPN source.
    manufacturerPartNumber: component.model,
    gtin: null,
    region: null,
    ...overrides,
  };
}

export function syntheticMatch(
  componentId = SYNTHETIC_CPU_ID,
  status: ProductMatch["status"] = "verified",
): ProductMatch {
  return {
    status,
    componentId,
    confidence: status === "verified" ? 100 : 85,
    reasons: ["Synthetic test match."],
    evidence: {
      manufacturer: true,
      manufacturerPartNumber: status === "verified",
      gtin: false,
      modelNumber: status !== "verified",
      titleSimilarity: 1,
    },
  };
}

export function syntheticOffer(overrides: Partial<Offer> = {}): Offer {
  const base: Offer = {
    id: "fixture-provider:offer-1",
    componentId: SYNTHETIC_CPU_ID,
    sellerId: "synthetic-retail",
    marketplaceId: null,
    marketId: "us",
    countryCode: "US",
    price: usd(34_999),
    listPrice: usd(39_999),
    discount: usd(5_000),
    discountPercent: 12.5,
    shipping: usd(0),
    taxInclusion: "included",
    taxAmount: null,
    availability: { state: "in-stock", observedAt: SYNTHETIC_NOW },
    restrictions: [],
    provenance: {
      providerId: "fixture-provider",
      providerOfferId: "offer-1",
      providerProductId: "product-1",
      productUrl: "https://retailer.example/products/1",
      observedAt: SYNTHETIC_NOW,
      lastVerifiedAt: SYNTHETIC_NOW,
      providerUpdatedAt: SYNTHETIC_NOW,
      collectionMethod: "fixture",
      dataOrigin: "synthetic",
      matchStatus: "verified",
    },
  };
  return {
    ...base,
    ...overrides,
    availability: overrides.availability ?? base.availability,
    provenance: overrides.provenance ?? base.provenance,
  };
}

export function rawOffer(
  overrides: Partial<ProviderOfferRecord> = {},
): ProviderOfferRecord {
  return {
    providerOfferId: "offer-1",
    providerProductId: "product-1",
    productUrl: "https://retailer.example/products/1",
    marketId: "us",
    countryCode: "US",
    currency: "USD",
    amount: "349.99",
    listAmount: "399.99",
    shippingAmount: "0",
    taxInclusion: "included",
    taxAmount: null,
    availability: "in-stock",
    availabilityObservedAt: SYNTHETIC_NOW,
    observedAt: SYNTHETIC_NOW,
    lastVerifiedAt: SYNTHETIC_NOW,
    providerUpdatedAt: SYNTHETIC_NOW,
    collectionMethod: "fixture",
    restrictions: null,
    ...overrides,
  };
}

export function normalizeContext(
  overrides: Partial<NormalizeOfferContext> = {},
): NormalizeOfferContext {
  const market = EXAMPLE_MARKETS.find((entry) => entry.id === "us");
  if (!market) throw new Error("Missing US synthetic market");
  return {
    providerId: "fixture-provider",
    dataOrigin: "synthetic",
    market,
    seller: syntheticSeller(),
    match: syntheticMatch(),
    ...overrides,
  };
}
