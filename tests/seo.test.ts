import { describe, expect, it } from "vitest";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildWebApplicationJsonLd,
  buildWebSiteJsonLd,
  serializeJsonLd,
  siteAssetUrl,
  siteUrl,
  SOCIAL_IMAGE_HEIGHT,
  SOCIAL_IMAGE_PATH,
  SOCIAL_IMAGE_WIDTH,
  socialImageUrl,
  SITE_NAME,
} from "../src/lib/seo";

const SITE = "https://appkitx.com";

describe("serializeJsonLd", () => {
  it("round-trips plain documents through JSON.parse", () => {
    const document = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "AppKitX",
    };
    expect(JSON.parse(serializeJsonLd(document))).toEqual(document);
  });

  it("escapes characters that could break out of the script element", () => {
    const hostile = {
      description: `</script><script>alert("x")</script>`,
    };
    const serialized = serializeJsonLd(hostile);
    expect(serialized).not.toContain("<");
    expect(serialized).not.toContain(">");
    expect(serialized).not.toContain("</script");
    expect(JSON.parse(serialized)).toEqual(hostile);
  });

  it("escapes ampersands and the U+2028/U+2029 line separators", () => {
    const text = "a & b\u2028c\u2029d";
    const serialized = serializeJsonLd({ text });
    expect(serialized).not.toContain("&");
    expect(serialized).not.toContain("\u2028");
    expect(serialized).not.toContain("\u2029");
    expect(JSON.parse(serialized)).toEqual({ text });
  });
});

describe("siteUrl", () => {
  it("normalizes page paths to the canonical trailing-slash form", () => {
    expect(siteUrl("/", SITE)).toBe("https://appkitx.com/");
    expect(siteUrl("/percentage-calculator", SITE)).toBe(
      "https://appkitx.com/percentage-calculator/",
    );
    expect(siteUrl("/percentage-calculator/", SITE)).toBe(
      "https://appkitx.com/percentage-calculator/",
    );
  });

  it("rejects URLs outside the configured origin", () => {
    expect(() => siteUrl("https://evil.example/steal", SITE)).toThrow(
      /outside/i,
    );
  });

  it("throws when the site is not configured", () => {
    expect(() => siteUrl("/x", undefined)).toThrow(/site is not configured/i);
  });
});

describe("social image", () => {
  it("publishes one shared 1200x630 PNG path", () => {
    expect(SOCIAL_IMAGE_PATH).toBe("/images/appkitx-og.png");
    expect(SOCIAL_IMAGE_WIDTH).toBe(1200);
    expect(SOCIAL_IMAGE_HEIGHT).toBe(630);
  });

  it("resolves the image to an absolute URL without a trailing slash", () => {
    expect(socialImageUrl(SITE)).toBe(
      "https://appkitx.com/images/appkitx-og.png",
    );
    expect(siteAssetUrl("/favicon.svg", SITE)).toBe(
      "https://appkitx.com/favicon.svg",
    );
  });

  it("rejects asset paths outside the configured origin", () => {
    expect(() => siteAssetUrl("https://evil.example/card.png", SITE)).toThrow(
      /outside/i,
    );
  });
});

describe("buildWebSiteJsonLd", () => {
  it("emits a factual WebSite document", () => {
    expect(
      buildWebSiteJsonLd({ url: "https://appkitx.com/", inLanguage: "en" }),
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: "https://appkitx.com/",
      inLanguage: "en",
    });
  });

  it("does not advertise a search action", () => {
    const document = buildWebSiteJsonLd({
      url: "https://appkitx.com/",
      inLanguage: "en",
    });
    expect(Object.keys(document)).not.toContain("potentialAction");
  });

  it("rejects empty or non-absolute required fields", () => {
    expect(() => buildWebSiteJsonLd({ url: "  ", inLanguage: "en" })).toThrow(
      /must not be empty/,
    );
    expect(() =>
      buildWebSiteJsonLd({ url: "not-a-url", inLanguage: "en" }),
    ).toThrow(/absolute URL/);
    expect(() =>
      buildWebSiteJsonLd({ url: "https://appkitx.com/", inLanguage: "" }),
    ).toThrow(/must not be empty/);
  });
});

describe("buildBreadcrumbJsonLd", () => {
  it("numbers items from 1 and resolves absolute item URLs", () => {
    expect(
      buildBreadcrumbJsonLd({
        entries: [
          { label: "Home", href: "/" },
          { label: "Percentage Calculator" },
        ],
        site: SITE,
      }),
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://appkitx.com/",
        },
        { "@type": "ListItem", position: 2, name: "Percentage Calculator" },
      ],
    });
  });

  it("omits the item URL for entries without an href", () => {
    const document = buildBreadcrumbJsonLd({
      entries: [{ label: "Home", href: "/" }, { label: "Current page" }],
      site: SITE,
    });
    expect(document.itemListElement[1]).not.toHaveProperty("item");
  });

  it("rejects an empty entry list", () => {
    expect(() => buildBreadcrumbJsonLd({ entries: [], site: SITE })).toThrow(
      /must not be empty/,
    );
  });

  it("rejects entries with an empty label", () => {
    expect(() =>
      buildBreadcrumbJsonLd({ entries: [{ label: "   " }], site: SITE }),
    ).toThrow(/must not be empty/);
  });
});

describe("buildWebApplicationJsonLd", () => {
  const input = {
    name: "Percentage Calculator",
    description:
      "Find a percentage of a number, work out what percent one number is of another, or measure the change between two values.",
    url: "https://appkitx.com/percentage-calculator/",
    inLanguage: "en",
  };

  it("emits the approved factual fields", () => {
    expect(buildWebApplicationJsonLd(input)).toEqual({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: input.name,
      description: input.description,
      url: input.url,
      applicationCategory: "UtilitiesApplication",
      isAccessibleForFree: true,
      inLanguage: "en",
    });
  });

  it("never emits ratings, reviews, prices, or offers", () => {
    const keys = Object.keys(buildWebApplicationJsonLd(input));
    for (const forbidden of [
      "aggregateRating",
      "review",
      "offers",
      "price",
      "author",
    ]) {
      expect(keys).not.toContain(forbidden);
    }
  });

  it("rejects empty or non-absolute required fields", () => {
    expect(() => buildWebApplicationJsonLd({ ...input, name: " " })).toThrow(
      /must not be empty/,
    );
    expect(() =>
      buildWebApplicationJsonLd({ ...input, description: "" }),
    ).toThrow(/must not be empty/);
    expect(() => buildWebApplicationJsonLd({ ...input, url: "nope" })).toThrow(
      /absolute URL/,
    );
  });
});

describe("buildCollectionPageJsonLd", () => {
  const input = {
    name: "Calculators",
    description:
      "Free calculators for percentages and discounts: find a percentage of a number, work out percent change, or see the final price after a discount.",
    url: "https://appkitx.com/calculators/",
    inLanguage: "en",
  };

  it("emits the approved factual fields", () => {
    expect(buildCollectionPageJsonLd(input)).toEqual({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: input.name,
      description: input.description,
      url: input.url,
      inLanguage: "en",
    });
  });

  it("never emits ratings, reviews, prices, offers, or item lists", () => {
    const keys = Object.keys(buildCollectionPageJsonLd(input));
    for (const forbidden of [
      "aggregateRating",
      "review",
      "offers",
      "price",
      "author",
      "mainEntity",
      "hasPart",
    ]) {
      expect(keys).not.toContain(forbidden);
    }
  });

  it("rejects empty or non-absolute required fields", () => {
    expect(() => buildCollectionPageJsonLd({ ...input, name: " " })).toThrow(
      /must not be empty/,
    );
    expect(() =>
      buildCollectionPageJsonLd({ ...input, description: "" }),
    ).toThrow(/must not be empty/);
    expect(() => buildCollectionPageJsonLd({ ...input, url: "nope" })).toThrow(
      /absolute URL/,
    );
    expect(() =>
      buildCollectionPageJsonLd({ ...input, inLanguage: "" }),
    ).toThrow(/must not be empty/);
  });
});

describe("buildArticleJsonLd", () => {
  const input = {
    headline: "How to Choose a CPU for Your PC Build",
    description:
      "A practical guide to cores, clocks, sockets, integrated graphics, cooling, and platform costs when choosing a desktop CPU.",
    datePublished: "2026-11-01",
    dateModified: "2026-11-01",
    authorName: "AppKitX Editorial",
    authorUrl: "https://appkitx.com/about/",
    publisherName: "AppKitX",
    publisherUrl: "https://appkitx.com/",
    url: "https://appkitx.com/guides/how-to-choose-a-cpu/",
    inLanguage: "en",
    articleSection: "Choosing components",
    keywords: ["cpu", "motherboard"],
  };

  it("emits an Article with an organizational byline", () => {
    expect(buildArticleJsonLd(input)).toEqual({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: input.headline,
      description: input.description,
      datePublished: "2026-11-01",
      dateModified: "2026-11-01",
      author: {
        "@type": "Organization",
        name: "AppKitX Editorial",
        url: "https://appkitx.com/about/",
      },
      publisher: {
        "@type": "Organization",
        name: "AppKitX",
        url: "https://appkitx.com/",
      },
      mainEntityOfPage: input.url,
      inLanguage: "en",
      articleSection: "Choosing components",
      keywords: ["cpu", "motherboard"],
    });
  });

  it("never emits ratings, reviews, prices, offers, or a Person author", () => {
    const document = buildArticleJsonLd(input);
    for (const forbidden of ["aggregateRating", "review", "offers", "price"]) {
      expect(document).not.toHaveProperty(forbidden);
    }
    expect(document.author["@type"]).toBe("Organization");
  });

  it("rejects invalid dates and empty required fields", () => {
    expect(() =>
      buildArticleJsonLd({ ...input, datePublished: "November 2026" }),
    ).toThrow(/ISO 8601/);
    expect(() =>
      buildArticleJsonLd({ ...input, dateModified: "2026-13-40" }),
    ).toThrow(/ISO 8601/);
    expect(() => buildArticleJsonLd({ ...input, headline: " " })).toThrow(
      /must not be empty/,
    );
    expect(() =>
      buildArticleJsonLd({ ...input, publisherUrl: "not-a-url" }),
    ).toThrow(/absolute URL/);
    expect(() =>
      buildArticleJsonLd({ ...input, keywords: ["cpu", ""] }),
    ).toThrow(/must not be empty/);
  });
});

describe("canonical consistency", () => {
  it("matches the canonical URL form for every shipped page", () => {
    const pages = [
      { path: "/", canonical: "https://appkitx.com/" },
      {
        path: "/percentage-calculator/",
        canonical: "https://appkitx.com/percentage-calculator/",
      },
      {
        path: "/discount-calculator/",
        canonical: "https://appkitx.com/discount-calculator/",
      },
      { path: "/es/", canonical: "https://appkitx.com/es/" },
      {
        path: "/es/percentage-calculator/",
        canonical: "https://appkitx.com/es/percentage-calculator/",
      },
      {
        path: "/es/discount-calculator/",
        canonical: "https://appkitx.com/es/discount-calculator/",
      },
      {
        path: "/calculators/",
        canonical: "https://appkitx.com/calculators/",
      },
      {
        path: "/es/calculators/",
        canonical: "https://appkitx.com/es/calculators/",
      },
    ];
    for (const { path, canonical } of pages) {
      expect(siteUrl(path, SITE)).toBe(canonical);
    }
  });
});
