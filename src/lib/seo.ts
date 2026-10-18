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

/**
 * Every JSON-LD document the site can render into a page head. New document
 * types join this union so BaseLayout's prop surface stays closed.
 */
export type JsonLdDocument =
  BreadcrumbListJsonLd | WebSiteJsonLd | WebApplicationJsonLd;

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
 * Resolve a site-relative path to the canonical absolute URL form: absolute
 * with a trailing slash (directory pages), matching canonicals and the
 * sitemap. Throws when the path escapes the configured origin or the site is
 * not configured.
 */
export function siteUrl(path: string, site: URL | string | undefined): string {
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
  if (!resolved.pathname.endsWith("/")) {
    resolved.pathname = `${resolved.pathname}/`;
  }
  return resolved.href;
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
