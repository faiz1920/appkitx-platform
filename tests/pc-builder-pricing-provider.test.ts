import { describe, expect, it } from "vitest";
import {
  MAX_PROVIDER_PAGE_ITEMS,
  isSyntheticProvider,
  normalizeOffer,
  providerFailure,
  providerSupportsCurrency,
  providerSupportsMarket,
  validateProviderPage,
  validateProviderRequest,
} from "../src/lib/pc-builder/pricing";
import type {
  PricingProvider,
  ProviderOfferRecord,
  ProviderPage,
  ProviderProductRecord,
  ProviderResult,
} from "../src/lib/pc-builder/pricing";
import {
  SYNTHETIC_NOW,
  normalizeContext,
  rawOffer,
} from "./pc-builder-pricing-fixtures";

function productPage(): ProviderPage<ProviderProductRecord> {
  return {
    items: [
      {
        providerProductId: "product-1",
        title: "AMD Ryzen 7 7800X3D",
        manufacturer: "AMD",
        manufacturerPartNumber: "100-100000910WOF",
        modelNumber: null,
        gtin: null,
        category: "cpu",
        productUrl: "https://retailer.example/products/1",
        region: null,
      },
    ],
    nextCursor: "next-page",
    observedAt: SYNTHETIC_NOW,
    rateLimit: {
      limit: 60,
      remaining: 59,
      resetAt: SYNTHETIC_NOW,
      retryAfterMs: null,
    },
  };
}

class SyntheticFixtureProvider implements PricingProvider {
  readonly id = "fixture-provider";
  readonly displayName = "Synthetic Fixture Provider";
  readonly supportedMarketIds = ["us", "in"];
  readonly supportedCurrencies = ["USD", "INR"];
  readonly dataOrigin = "synthetic" as const;
  lastCursor: string | null = null;

  async lookupProducts(
    request: Parameters<PricingProvider["lookupProducts"]>[0],
  ): Promise<ProviderResult<ProviderPage<ProviderProductRecord>>> {
    this.lastCursor = request.cursor;
    return { ok: true, value: productPage() };
  }

  async fetchOffers(
    _request: Parameters<PricingProvider["fetchOffers"]>[0],
  ): Promise<ProviderResult<ProviderPage<ProviderOfferRecord>>> {
    return {
      ok: true,
      value: {
        items: [rawOffer()],
        nextCursor: null,
        observedAt: SYNTHETIC_NOW,
        rateLimit: null,
      },
    };
  }

  async normalizeOffer(
    raw: unknown,
    context: Parameters<PricingProvider["normalizeOffer"]>[1],
  ) {
    return normalizeOffer(raw, context);
  }
}

describe("provider request validation", () => {
  it("accepts valid market, cursor and limit requests", () => {
    expect(
      validateProviderRequest({
        marketId: "us",
        cursor: null,
        limit: 50,
      }),
    ).toEqual({
      ok: true,
      value: { marketId: "us", cursor: null, limit: 50 },
    });
    expect(
      validateProviderRequest({
        marketId: "in",
        cursor: "page-2",
        limit: null,
      }).ok,
    ).toBe(true);
  });

  it("rejects unsafe or oversized request parameters", () => {
    for (const value of [
      null,
      [],
      { marketId: "US", cursor: null, limit: null },
      { marketId: "us", cursor: "", limit: 1 },
      { marketId: "us", cursor: "x".repeat(300), limit: 1 },
      { marketId: "us", cursor: null, limit: 0 },
      { marketId: "us", cursor: null, limit: 999 },
    ]) {
      expect(validateProviderRequest(value).ok).toBe(false);
    }
  });
});

describe("provider page validation", () => {
  it("accepts a bounded, timestamped page with continuation and rate limits", () => {
    const result = validateProviderPage(productPage());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.items).toHaveLength(1);
      expect(result.value.nextCursor).toBe("next-page");
      expect(result.value.observedAt).toBe(SYNTHETIC_NOW);
      expect(result.value.rateLimit?.remaining).toBe(59);
    }
  });

  it("rejects too many records, malformed cursors and invalid metadata", () => {
    const tooMany = {
      ...productPage(),
      items: Array.from({ length: MAX_PROVIDER_PAGE_ITEMS + 1 }, () => ({})),
    };
    expect(validateProviderPage(tooMany).ok).toBe(false);
    expect(
      validateProviderPage({ ...productPage(), nextCursor: "x".repeat(300) })
        .ok,
    ).toBe(false);
    expect(
      validateProviderPage({ ...productPage(), observedAt: "not-a-time" }).ok,
    ).toBe(false);
    expect(
      validateProviderPage({
        ...productPage(),
        rateLimit: { limit: -1, remaining: 0, resetAt: null, retryAfterMs: -1 },
      }).ok,
    ).toBe(false);
  });

  it("rejects oversized provider payloads", () => {
    const oversized = {
      ...productPage(),
      items: [{ note: "x".repeat(300 * 1024) }],
    };
    const result = validateProviderPage(oversized);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("invalid-response");
  });
});

describe("provider contract and synthetic isolation", () => {
  it("exposes identity, capability and pagination through the interface", async () => {
    const provider = new SyntheticFixtureProvider();
    expect(isSyntheticProvider(provider)).toBe(true);
    expect(providerSupportsMarket(provider, "us")).toBe(true);
    expect(providerSupportsMarket(provider, "de")).toBe(false);
    expect(providerSupportsCurrency(provider, "INR")).toBe(true);
    expect(providerSupportsCurrency(provider, "EUR")).toBe(false);

    const page = await provider.lookupProducts({
      marketId: "us",
      cursor: "page-2",
      limit: 20,
      query: {
        manufacturer: "AMD",
        manufacturerPartNumber: null,
        modelNumber: null,
        gtin: null,
        title: null,
        category: "cpu",
      },
    });
    expect(page.ok).toBe(true);
    expect(provider.lastCursor).toBe("page-2");
    if (page.ok) {
      expect(page.value.nextCursor).toBe("next-page");
      expect(page.value.items[0]?.providerProductId).toBe("product-1");
    }
  });

  it("normalizes provider offers through the shared offer contract", async () => {
    const provider = new SyntheticFixtureProvider();
    const offers = await provider.fetchOffers({
      marketId: "us",
      cursor: null,
      limit: null,
      componentIds: ["cpu-amd-ryzen-7-7800x3d"],
      currency: "USD",
    });
    expect(offers.ok).toBe(true);
    if (!offers.ok) return;
    const normalized = await provider.normalizeOffer(
      offers.value.items[0],
      normalizeContext(),
    );
    expect(normalized.ok).toBe(true);
    if (normalized.ok) {
      expect(normalized.value.provenance.dataOrigin).toBe("synthetic");
      expect(normalized.value.provenance.providerId).toBe("fixture-provider");
    }
  });

  it("reports provider failure and rate limiting without throwing", () => {
    const failure = providerFailure("unavailable", "Provider is unavailable.", {
      retryAfterMs: 5000,
      requestId: "req-1",
    });
    expect(failure.ok).toBe(false);
    if (!failure.ok) {
      expect(failure.error.code).toBe("unavailable");
      expect(failure.error.retryAfterMs).toBe(5000);
      expect(failure.error.requestId).toBe("req-1");
    }

    const rateLimited = providerFailure("rate-limited", "Slow down.", {
      retryAfterMs: 60_000,
    });
    expect(rateLimited.ok).toBe(false);
    if (!rateLimited.ok) {
      expect(rateLimited.error.code).toBe("rate-limited");
      expect(rateLimited.error.retryAfterMs).toBe(60_000);
    }
  });
});
