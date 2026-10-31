/*
 * Development-only synthetic pricing fixtures for the M10.7 preview.
 *
 * Every seller, URL, price, stock state and match here is synthetic. Seller
 * and product URLs use reserved example domains. No value may be presented as
 * a real retailer offer or a real market price.
 *
 * Product matching is simulated with synthetic manufacturer part numbers
 * attached to real catalogue component ids. This exercises the matching and
 * normalization path without pretending that the current catalogue has
 * verified MPN/GTIN metadata.
 */

import { componentById } from "../../lib/pc-builder/catalogue";
import {
  EXAMPLE_MARKETS,
  catalogueIdentity,
  matchProduct,
  normalizeOffer,
  normalizeSeller,
  type CatalogueProductIdentity,
  type Market,
  type Offer,
  type PricingResult,
  type ProductMatch,
  type ProviderOfferRecord,
  type ProviderProductRecord,
  type Seller,
} from "../../lib/pc-builder/pricing";

export const SYNTHETIC_PRICING_DISCLOSURE =
  "Synthetic development fixtures — not real retailer pricing, stock or product matches.";

export const PRICING_DEMO_COMPONENT_ID = "cpu-amd-ryzen-7-7800x3d";
export const PRICING_DEMO_COMPONENT_LABEL = "AMD Ryzen 7 7800X3D";

const PROVIDER_ID = "fixture-pricing";

function must<T>(result: PricingResult<T>, label: string): T {
  if (!result.ok) {
    throw new Error(
      `Synthetic pricing fixture ${label} is invalid: ${result.issues
        .map((issue) => issue.message)
        .join("; ")}`,
    );
  }
  return result.value;
}

const syntheticIdentities: CatalogueProductIdentity[] = [
  {
    ...catalogueIdentity(componentById(PRICING_DEMO_COMPONENT_ID)!),
    manufacturerPartNumber: "SYNTH-MPN-7800X3D",
  },
];

const syntheticProduct: ProviderProductRecord = {
  providerProductId: "synthetic-product-cpu",
  title: "AMD Ryzen 7 7800X3D",
  manufacturer: "AMD",
  manufacturerPartNumber: "SYNTH-MPN-7800X3D",
  modelNumber: null,
  gtin: null,
  category: "cpu",
  productUrl: "https://retailer.example/products/synthetic-cpu",
  region: null,
};

const syntheticMatch: ProductMatch = must(
  matchProduct(syntheticProduct, syntheticIdentities),
  "product match",
);

if (syntheticMatch.status !== "verified") {
  throw new Error("Synthetic pricing fixture match must be verified.");
}

const retailer: Seller = must(
  normalizeSeller({
    id: "synthetic-retail",
    displayName: "Synthetic Example Retail",
    websiteUrl: "https://retailer.example",
    sellerType: "retailer",
    countryCodes: ["US", "IN", "GB", "DE"],
    marketIds: ["us", "in", "gb", "de"],
    parentMarketplaceId: null,
    providerId: PROVIDER_ID,
    logoUrl: null,
    dataOrigin: "synthetic",
  }),
  "retailer",
);

const marketplaceSeller: Seller = must(
  normalizeSeller({
    id: "synthetic-market-seller",
    displayName: "Synthetic Marketplace Seller",
    websiteUrl: "https://seller.example",
    sellerType: "marketplace-seller",
    countryCodes: ["US", "IN", "GB", "DE"],
    marketIds: ["us", "in", "gb", "de"],
    parentMarketplaceId: "synthetic-marketplace",
    providerId: PROVIDER_ID,
    logoUrl: null,
    dataOrigin: "synthetic",
  }),
  "marketplace seller",
);

export interface SyntheticPricingScenario {
  readonly markets: readonly Market[];
  readonly sellers: readonly Seller[];
  readonly offers: readonly Offer[];
  readonly demoComponentId: string;
}

function isoAgo(now: Date, milliseconds: number): string {
  return new Date(now.getTime() - milliseconds).toISOString();
}

interface OfferSeed {
  readonly id: string;
  readonly market: Market;
  readonly seller: Seller;
  readonly amount: string;
  readonly listAmount: string | null;
  readonly shippingAmount: string | null;
  readonly taxInclusion: string | null;
  readonly taxAmount: string | null;
  readonly availability: string;
  readonly observedAgoMs: number;
  readonly availabilityObservedAgoMs: number | null;
}

function seedOffer(now: Date, seed: OfferSeed): Offer {
  const observedAt = isoAgo(now, seed.observedAgoMs);
  const availabilityObservedAt =
    seed.availabilityObservedAgoMs === null
      ? null
      : isoAgo(now, seed.availabilityObservedAgoMs);
  const raw: ProviderOfferRecord = {
    providerOfferId: seed.id,
    providerProductId: syntheticProduct.providerProductId,
    productUrl: `https://retailer.example/products/${seed.id}`,
    marketId: seed.market.id,
    countryCode: seed.market.countryCode,
    currency: seed.market.defaultCurrency,
    amount: seed.amount,
    listAmount: seed.listAmount,
    shippingAmount: seed.shippingAmount,
    taxInclusion: seed.taxInclusion,
    taxAmount: seed.taxAmount,
    availability: seed.availability,
    availabilityObservedAt,
    observedAt,
    lastVerifiedAt: observedAt,
    providerUpdatedAt: observedAt,
    collectionMethod: "fixture",
    restrictions: null,
  };

  return must(
    normalizeOffer(raw, {
      providerId: PROVIDER_ID,
      dataOrigin: "synthetic",
      market: seed.market,
      seller: seed.seller,
      match: syntheticMatch,
    }),
    `offer ${seed.id}`,
  );
}

export function createSyntheticPricingScenario(
  now = new Date(),
): SyntheticPricingScenario {
  const us = EXAMPLE_MARKETS.find((market) => market.id === "us")!;
  const india = EXAMPLE_MARKETS.find((market) => market.id === "in")!;
  const uk = EXAMPLE_MARKETS.find((market) => market.id === "gb")!;
  const germany = EXAMPLE_MARKETS.find((market) => market.id === "de")!;

  const offers: Offer[] = [
    seedOffer(now, {
      id: "us-retail-fresh",
      market: us,
      seller: retailer,
      amount: "349.99",
      listAmount: "399.99",
      shippingAmount: "0",
      taxInclusion: "included",
      taxAmount: null,
      availability: "in-stock",
      observedAgoMs: 5 * 60_000,
      availabilityObservedAgoMs: 5 * 60_000,
    }),
    seedOffer(now, {
      id: "us-market-aging",
      market: us,
      seller: marketplaceSeller,
      amount: "339.50",
      listAmount: null,
      shippingAmount: "12.00",
      taxInclusion: "unknown",
      taxAmount: null,
      availability: "limited",
      observedAgoMs: 2 * 3_600_000,
      availabilityObservedAgoMs: 2 * 3_600_000,
    }),
    seedOffer(now, {
      id: "us-retail-stale",
      market: us,
      seller: retailer,
      amount: "329.99",
      listAmount: null,
      shippingAmount: "0",
      taxInclusion: "included",
      taxAmount: null,
      availability: "in-stock",
      observedAgoMs: 30 * 3_600_000,
      availabilityObservedAgoMs: 30 * 3_600_000,
    }),
    seedOffer(now, {
      id: "us-retail-out-of-stock",
      market: us,
      seller: retailer,
      amount: "344.99",
      listAmount: null,
      shippingAmount: "0",
      taxInclusion: "included",
      taxAmount: null,
      availability: "out-of-stock",
      observedAgoMs: 10 * 60_000,
      availabilityObservedAgoMs: 10 * 60_000,
    }),
    seedOffer(now, {
      id: "in-retail-fresh",
      market: india,
      seller: retailer,
      amount: "29999",
      listAmount: "31999",
      shippingAmount: "199",
      taxInclusion: "included",
      taxAmount: null,
      availability: "in-stock",
      observedAgoMs: 10 * 60_000,
      availabilityObservedAgoMs: 10 * 60_000,
    }),
    seedOffer(now, {
      id: "in-market-aging",
      market: india,
      seller: marketplaceSeller,
      amount: "28999",
      listAmount: null,
      shippingAmount: "0",
      taxInclusion: "included",
      taxAmount: null,
      availability: "in-stock",
      observedAgoMs: 4 * 3_600_000,
      availabilityObservedAgoMs: 4 * 3_600_000,
    }),
    seedOffer(now, {
      id: "in-retail-stale",
      market: india,
      seller: retailer,
      amount: "27999",
      listAmount: null,
      shippingAmount: "0",
      taxInclusion: "included",
      taxAmount: null,
      availability: "in-stock",
      observedAgoMs: 40 * 3_600_000,
      availabilityObservedAgoMs: 40 * 3_600_000,
    }),
    seedOffer(now, {
      id: "in-retail-out-of-stock",
      market: india,
      seller: retailer,
      amount: "29499",
      listAmount: null,
      shippingAmount: "0",
      taxInclusion: "included",
      taxAmount: null,
      availability: "out-of-stock",
      observedAgoMs: 8 * 60_000,
      availabilityObservedAgoMs: 8 * 60_000,
    }),
    seedOffer(now, {
      id: "gb-retail-fresh",
      market: uk,
      seller: retailer,
      amount: "319.99",
      listAmount: null,
      shippingAmount: "4.99",
      taxInclusion: "included",
      taxAmount: null,
      availability: "in-stock",
      observedAgoMs: 15 * 60_000,
      availabilityObservedAgoMs: 15 * 60_000,
    }),
    seedOffer(now, {
      id: "gb-market-aging",
      market: uk,
      seller: marketplaceSeller,
      amount: "309.99",
      listAmount: null,
      shippingAmount: "0",
      taxInclusion: "unknown",
      taxAmount: null,
      availability: "limited",
      observedAgoMs: 3 * 3_600_000,
      availabilityObservedAgoMs: 3 * 3_600_000,
    }),
    seedOffer(now, {
      id: "de-retail-fresh",
      market: germany,
      seller: retailer,
      amount: "369.00",
      listAmount: "399.00",
      shippingAmount: "0",
      taxInclusion: "included",
      taxAmount: null,
      availability: "in-stock",
      observedAgoMs: 20 * 60_000,
      availabilityObservedAgoMs: 20 * 60_000,
    }),
    seedOffer(now, {
      id: "de-retail-stale",
      market: germany,
      seller: retailer,
      amount: "359.00",
      listAmount: null,
      shippingAmount: "0",
      taxInclusion: "included",
      taxAmount: null,
      availability: "in-stock",
      observedAgoMs: 30 * 3_600_000,
      availabilityObservedAgoMs: 30 * 3_600_000,
    }),
  ];

  return {
    markets: EXAMPLE_MARKETS,
    sellers: [retailer, marketplaceSeller],
    offers,
    demoComponentId: PRICING_DEMO_COMPONENT_ID,
  };
}

export function sellerById(
  sellers: readonly Seller[],
  id: string,
): Seller | null {
  return sellers.find((seller) => seller.id === id) ?? null;
}
