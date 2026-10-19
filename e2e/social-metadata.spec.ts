import { expect, test, type Page } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { getDictionary, locales } from "../src/i18n/config";
import {
  localizedHref,
  stripLocalePrefix,
  translatedPagePaths,
} from "../src/i18n/routing";
import {
  SOCIAL_IMAGE_HEIGHT,
  SOCIAL_IMAGE_PATH,
  SOCIAL_IMAGE_WIDTH,
} from "../src/lib/seo";

const DIST_DIR = join(process.cwd(), "dist");
const ORIGIN = "https://appkitx.com";

function walkFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(path) : [path];
  });
}

/** Enumerate the actual built indexable HTML files, excluding 404.html. */
function builtIndexableRoutes(): string[] {
  return walkFiles(DIST_DIR)
    .filter((path) => path.endsWith("index.html"))
    .map((path) => {
      const builtPath = relative(DIST_DIR, path).split(sep).join("/");
      return builtPath === "index.html"
        ? "/"
        : `/${builtPath.slice(0, -"index.html".length)}`;
    })
    .sort();
}

/** Routes derived from the same locale and page registries that build them. */
function registryRoutes(): string[] {
  return Object.values(locales)
    .flatMap((locale) =>
      translatedPagePaths().map((path) => localizedHref(path, locale.code)),
    )
    .sort();
}

interface HeadMetadata {
  lang: string;
  dir: string;
  dataLocale: string;
  title: string;
  description: string[];
  robots: string[];
  canonical: string[];
  hreflang: Array<{ hreflang: string; href: string }>;
  og: {
    type: string[];
    siteName: string[];
    title: string[];
    description: string[];
    url: string[];
    image: string[];
    imageType: string[];
    imageWidth: string[];
    imageHeight: string[];
    imageAlt: string[];
    locale: string[];
    alternateLocale: string[];
  };
  twitter: {
    card: string[];
    title: string[];
    description: string[];
    image: string[];
    imageAlt: string[];
  };
  jsonLd: string[];
}

async function readHead(page: Page): Promise<HeadMetadata> {
  return page.evaluate(() => {
    const meta = (selector: string): string[] =>
      Array.from(document.head.querySelectorAll<HTMLMetaElement>(selector)).map(
        (element) => element.content,
      );
    const link = (selector: string): string[] =>
      Array.from(document.head.querySelectorAll<HTMLLinkElement>(selector)).map(
        (element) => element.href,
      );

    return {
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
      dataLocale: document.documentElement.dataset.locale ?? "",
      title: document.title,
      description: meta('meta[name="description"]'),
      robots: meta('meta[name="robots"]'),
      canonical: link('link[rel="canonical"]'),
      hreflang: Array.from(
        document.head.querySelectorAll<HTMLLinkElement>(
          'link[rel="alternate"][hreflang]',
        ),
      ).map((element) => ({
        hreflang: element.hreflang,
        href: element.href,
      })),
      og: {
        type: meta('meta[property="og:type"]'),
        siteName: meta('meta[property="og:site_name"]'),
        title: meta('meta[property="og:title"]'),
        description: meta('meta[property="og:description"]'),
        url: meta('meta[property="og:url"]'),
        image: meta('meta[property="og:image"]'),
        imageType: meta('meta[property="og:image:type"]'),
        imageWidth: meta('meta[property="og:image:width"]'),
        imageHeight: meta('meta[property="og:image:height"]'),
        imageAlt: meta('meta[property="og:image:alt"]'),
        locale: meta('meta[property="og:locale"]'),
        alternateLocale: meta('meta[property="og:locale:alternate"]'),
      },
      twitter: {
        card: meta('meta[name="twitter:card"]'),
        title: meta('meta[name="twitter:title"]'),
        description: meta('meta[name="twitter:description"]'),
        image: meta('meta[name="twitter:image"]'),
        imageAlt: meta('meta[name="twitter:image:alt"]'),
      },
      jsonLd: Array.from(
        document.head.querySelectorAll<HTMLScriptElement>(
          'script[type="application/ld+json"]',
        ),
      ).map((element) => element.textContent ?? ""),
    };
  });
}

function single(values: string[], label: string): string {
  expect(values, `${label} must occur exactly once`).toHaveLength(1);
  return values[0] ?? "";
}

const actualRoutes = builtIndexableRoutes();
const expectedRoutes = registryRoutes();

test("build output contains exactly the registry-derived indexable routes", () => {
  expect(actualRoutes).toEqual(expectedRoutes);
});

test("social preview image is copied to the build as a 1200x630 PNG", () => {
  const image = readFileSync(join(DIST_DIR, "images", "appkitx-og.png"));
  const pngSignature = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);

  expect(image.subarray(0, 8)).toEqual(pngSignature);
  expect(image.readUInt32BE(8)).toBe(13);
  expect(image.subarray(12, 16).toString("ascii")).toBe("IHDR");
  expect(image.readUInt32BE(16)).toBe(SOCIAL_IMAGE_WIDTH);
  expect(image.readUInt32BE(20)).toBe(SOCIAL_IMAGE_HEIGHT);
  expect(image.length).toBeGreaterThan(1024);
});

test("social preview image is served at the published metadata path", async ({
  request,
}) => {
  const response = await request.get(SOCIAL_IMAGE_PATH);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
});

test("indexable titles and descriptions are unique and non-empty", () => {
  const entries = actualRoutes.map((route) => {
    const builtPath =
      route === "/" ? "index.html" : `${route.slice(1)}index.html`;
    const html = readFileSync(join(DIST_DIR, builtPath), "utf8");
    const title = (html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "").trim();
    const description = (
      html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? ""
    ).trim();
    return { route, title, description };
  });

  for (const entry of entries) {
    expect(entry.title, `${entry.route} title`).not.toBe("");
    expect(entry.description, `${entry.route} description`).not.toBe("");
  }
  expect(new Set(entries.map((entry) => entry.title)).size).toBe(
    entries.length,
  );
  expect(new Set(entries.map((entry) => entry.description)).size).toBe(
    entries.length,
  );
});

for (const route of actualRoutes) {
  test(`social metadata: ${route}`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.status(), `${route} must return 200`).toBe(200);

    const head = await readHead(page);
    const { locale, path } = stripLocalePrefix(route);
    const localeMeta = locales[locale];
    const dictionary = getDictionary(locale);
    const canonical = `${ORIGIN}${route}`;
    const image = `${ORIGIN}${SOCIAL_IMAGE_PATH}`;

    expect(head.lang).toBe(localeMeta.hreflang);
    expect(head.dir).toBe(localeMeta.dir);
    expect(head.dataLocale).toBe(localeMeta.code);

    const title = head.title.trim();
    const description = single(head.description, `${route} description`);
    expect(title).not.toBe("");
    expect(description).not.toBe("");

    const ogTitle = single(head.og.title, `${route} og:title`);
    const ogDescription = single(
      head.og.description,
      `${route} og:description`,
    );
    expect(ogTitle).toBe(title);
    expect(ogDescription).toBe(description);
    expect(single(head.og.type, `${route} og:type`)).toBe("website");
    expect(single(head.og.siteName, `${route} og:site_name`)).toBe("AppKitX");
    expect(single(head.og.url, `${route} og:url`)).toBe(canonical);
    expect(single(head.og.locale, `${route} og:locale`)).toBe(
      localeMeta.ogLocale,
    );

    const alternateLocale = Object.values(locales).find(
      (meta) => meta.code !== localeMeta.code,
    );
    if (alternateLocale !== undefined) {
      expect(
        single(head.og.alternateLocale, `${route} og:locale:alternate`),
      ).toBe(alternateLocale.ogLocale);
    }

    expect(single(head.canonical, `${route} canonical`)).toBe(canonical);

    const ogImage = single(head.og.image, `${route} og:image`);
    expect(ogImage).toBe(image);
    expect(new URL(ogImage).protocol).toBe("https:");
    expect(single(head.og.imageType, `${route} og:image:type`)).toBe(
      "image/png",
    );
    expect(single(head.og.imageWidth, `${route} og:image:width`)).toBe(
      String(SOCIAL_IMAGE_WIDTH),
    );
    expect(single(head.og.imageHeight, `${route} og:image:height`)).toBe(
      String(SOCIAL_IMAGE_HEIGHT),
    );
    const ogImageAlt = single(head.og.imageAlt, `${route} og:image:alt`);
    expect(ogImageAlt).toBe(dictionary.layout.socialImageAlt);
    expect(ogImageAlt.trim()).not.toBe("");

    expect(single(head.twitter.card, `${route} twitter:card`)).toBe(
      "summary_large_image",
    );
    expect(single(head.twitter.title, `${route} twitter:title`)).toBe(title);
    expect(
      single(head.twitter.description, `${route} twitter:description`),
    ).toBe(description);
    expect(single(head.twitter.image, `${route} twitter:image`)).toBe(image);
    expect(single(head.twitter.imageAlt, `${route} twitter:image:alt`)).toBe(
      ogImageAlt,
    );

    expect(head.robots, `${route} must stay indexable`).toHaveLength(0);
    expect(head.hreflang, `${route} hreflang alternates`).toEqual([
      {
        hreflang: "en",
        href: `${ORIGIN}${localizedHref(path, "en")}`,
      },
      {
        hreflang: "es",
        href: `${ORIGIN}${localizedHref(path, "es")}`,
      },
      {
        hreflang: "x-default",
        href: `${ORIGIN}${localizedHref(path, "en")}`,
      },
    ]);

    const expectedJsonLdCount = path === "/" ? 1 : 2;
    expect(head.jsonLd, `${route} structured data`).toHaveLength(
      expectedJsonLdCount,
    );
    for (const raw of head.jsonLd) {
      const document = JSON.parse(raw) as Record<string, unknown>;
      expect(document["@context"]).toBe("https://schema.org");
      expect(typeof document["@type"]).toBe("string");
    }
  });
}
