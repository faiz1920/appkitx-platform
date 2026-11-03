/*
 * Shared SEO document builders (audit M2). Pure, dependency-free helpers
 * behind the Open Graph tags in BaseLayout and the JSON-LD scripts rendered
 * into every page head.
 *
 * Contract:
 * - Builders emit factual fields only — no ratings, reviews, prices, offers,
 *   or other unsupported claims.
 * - Every JSON-LD document passes through serializeJsonLd before it is
 *   injected into a page; that single serializer is the escaping choke point
 *   for hostile input.
 * - URLs are normalized to the canonical form (absolute, trailing slash) so
 *   structured data, the canonical link, and the sitemap always agree.
 */

/** Product name used in structured data and social cards. Not translated. */
export const SITE_NAME = "AppKitX";

/** Shared social preview image, served from the public directory. */
export const SOCIAL_IMAGE_PATH = "/images/appkitx-og.png";
export const SOCIAL_IMAGE_WIDTH = 1200;
export const SOCIAL_IMAGE_HEIGHT = 630;

export interface BreadcrumbEntry {
  label: string;
  href?: string;
}

export interface BreadcrumbListItemJsonLd {
  "@type": "ListItem";
  position: number;
  name: string;
  item?: string;
}

export interface BreadcrumbListJsonLd {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: BreadcrumbListItemJsonLd[];
}

export interface WebSiteJsonLd {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  inLanguage: string;
}

export interface WebApplicationJsonLd {
  "@context": "https://schema.org";
  "@type": "WebApplication";
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  isAccessibleForFree: true;
  inLanguage: string;
}

export interface CollectionPageJsonLd {
  "@context": "https://schema.org";
  "@type": "CollectionPage";
  name: string;
  description: string;
  url: string;
  inLanguage: string;
}

export interface ArticleJsonLd {
  "@context": "https://schema.org";
  "@type": "Article";
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  author: {
    "@type": "Organization";
    name: string;
    url: string;
  };
  publisher: {
    "@type": "Organization";
    name: string;
    url: string;
  };
  mainEntityOfPage: string;
  inLanguage: string;
  articleSection: string;
  keywords: string[];
}

/**
 * Every JSON-LD document the site can render into a page head. New document
 * types join this union so BaseLayout's prop surface stays closed.
 */
export type JsonLdDocument =
  | BreadcrumbListJsonLd
  | WebSiteJsonLd
  | WebApplicationJsonLd
  | CollectionPageJsonLd
  | ArticleJsonLd;

function requireNonEmpty(value: string, field: string): string {
  if (value.trim() === "") {
    throw new Error(`SEO configuration error: ${field} must not be empty`);
  }
  return value;
}

function requireAbsoluteUrl(value: string, field: string): string {
  requireNonEmpty(value, field);
  try {
    return new URL(value).href;
  } catch {
    throw new Error(
      `SEO configuration error: ${field} must be an absolute URL`,
    );
  }
}

/*
 * Resolve a site-relative path against the configured origin. Throws when the
 * path escapes the configured origin or the site is not configured.
 */
function resolveSiteUrl(path: string, site: URL | string | undefined): URL {
  if (site === undefined) {
    throw new Error("SEO configuration error: site is not configured");
  }
  const base = new URL(site);
  const resolved = new URL(path, base);
  if (resolved.origin !== base.origin) {
    throw new Error(
      `SEO configuration error: ${path} resolves outside ${base.origin}`,
    );
  }
  return resolved;
}

/*
 * Resolve a site-relative path to the canonical absolute URL form: absolute
 * with a trailing slash (directory pages), matching canonicals and the
 * sitemap.
 */
export function siteUrl(path: string, site: URL | string | undefined): string {
  const resolved = resolveSiteUrl(path, site);
  if (!resolved.pathname.endsWith("/")) {
    resolved.pathname = `${resolved.pathname}/`;
  }
  return resolved.href;
}

/*
 * Resolve a static asset path to an absolute URL without the trailing-slash
 * normalization used for pages. Used by Open Graph and Twitter image tags.
 */
export function siteAssetUrl(
  path: string,
  site: URL | string | undefined,
): string {
  return resolveSiteUrl(path, site).href;
}

/** Absolute URL of the shared social preview image. */
export function socialImageUrl(site: URL | string | undefined): string {
  return siteAssetUrl(SOCIAL_IMAGE_PATH, site);
}

/*
 * Serialize a JSON-LD document for inline <script type="application/ld+json">
 * injection. Escapes every character sequence that could terminate the
 * script element or corrupt the payload (<, >, &) plus the U+2028/U+2029
 * line separators. The escaped output still parses with JSON.parse.
 *
 * Accepts any object so hostile-input tests can exercise arbitrary payloads;
 * it is the single serialization choke point for JSON-LD output.
 */
export function serializeJsonLd(document: object): string {
  return JSON.stringify(document)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function buildWebSiteJsonLd(options: {
  url: string;
  inLanguage: string;
}): WebSiteJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: requireAbsoluteUrl(options.url, "WebSite url"),
    inLanguage: requireNonEmpty(options.inLanguage, "WebSite inLanguage"),
  };
}

export function buildBreadcrumbJsonLd(options: {
  entries: readonly BreadcrumbEntry[];
  site: URL | string | undefined;
}): BreadcrumbListJsonLd {
  const { entries, site } = options;
  if (entries.length === 0) {
    throw new Error(
      "SEO configuration error: breadcrumb entries must not be empty",
    );
  }
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: entries.map((entry, index) => {
      const name = requireNonEmpty(
        entry.label,
        `breadcrumb entry ${index + 1} label`,
      );
      return entry.href === undefined
        ? { "@type": "ListItem", position: index + 1, name }
        : {
            "@type": "ListItem",
            position: index + 1,
            name,
            item: siteUrl(entry.href, site),
          };
    }),
  };
}

export function buildWebApplicationJsonLd(options: {
  name: string;
  description: string;
  url: string;
  inLanguage: string;
  applicationCategory?: string;
}): WebApplicationJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: requireNonEmpty(options.name, "WebApplication name"),
    description: requireNonEmpty(
      options.description,
      "WebApplication description",
    ),
    url: requireAbsoluteUrl(options.url, "WebApplication url"),
    applicationCategory: requireNonEmpty(
      options.applicationCategory ?? "UtilitiesApplication",
      "WebApplication applicationCategory",
    ),
    isAccessibleForFree: true,
    inLanguage: requireNonEmpty(
      options.inLanguage,
      "WebApplication inLanguage",
    ),
  };
}

/*
 * Category landing pages are collections of tool pages: CollectionPage is the
 * factual Schema.org type for a page that primarily links a set of related
 * items. It carries only the same fields as WebSite/WebApplication — no
 * ItemList, ratings, or other unverifiable claims.
 */
export function buildCollectionPageJsonLd(options: {
  name: string;
  description: string;
  url: string;
  inLanguage: string;
}): CollectionPageJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: requireNonEmpty(options.name, "CollectionPage name"),
    description: requireNonEmpty(
      options.description,
      "CollectionPage description",
    ),
    url: requireAbsoluteUrl(options.url, "CollectionPage url"),
    inLanguage: requireNonEmpty(
      options.inLanguage,
      "CollectionPage inLanguage",
    ),
  };
}

function requireIsoDate(value: string, field: string): string {
  requireNonEmpty(value, field);
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00Z`)
    : null;
  if (
    parsed === null ||
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    throw new Error(
      `SEO configuration error: ${field} must be an ISO 8601 calendar date`,
    );
  }
  return value;
}

/*
 * Article structured data for editorial guides. The byline is an
 * Organization because AppKitX has no verified individual author; emitting a
 * Person would invent an identity. No ratings, reviews, prices, offers, or
 * testing claims are emitted.
 */
export function buildArticleJsonLd(options: {
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  authorUrl: string;
  publisherName: string;
  publisherUrl: string;
  url: string;
  inLanguage: string;
  articleSection: string;
  keywords: readonly string[];
}): ArticleJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: requireNonEmpty(options.headline, "Article headline"),
    description: requireNonEmpty(options.description, "Article description"),
    datePublished: requireIsoDate(
      options.datePublished,
      "Article datePublished",
    ),
    dateModified: requireIsoDate(options.dateModified, "Article dateModified"),
    author: {
      "@type": "Organization",
      name: requireNonEmpty(options.authorName, "Article author name"),
      url: requireAbsoluteUrl(options.authorUrl, "Article author url"),
    },
    publisher: {
      "@type": "Organization",
      name: requireNonEmpty(options.publisherName, "Article publisher name"),
      url: requireAbsoluteUrl(options.publisherUrl, "Article publisher url"),
    },
    mainEntityOfPage: requireAbsoluteUrl(
      options.url,
      "Article mainEntityOfPage",
    ),
    inLanguage: requireNonEmpty(options.inLanguage, "Article inLanguage"),
    articleSection: requireNonEmpty(
      options.articleSection,
      "Article articleSection",
    ),
    keywords: options.keywords.map((keyword, index) =>
      requireNonEmpty(keyword, `Article keyword ${index + 1}`),
    ),
  };
}
