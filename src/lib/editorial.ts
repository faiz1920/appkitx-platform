/*
 * Editorial metadata for AppKitX guides and information pages.
 *
 * M10.15.1 makes the editorial and information surface bilingual. English is
 * the source locale and Spanish is the existing provisional locale; every
 * guide slug, information page, hreflang alternate, sitemap pair, and language
 * switcher entry derives from this module and src/i18n/routing.ts.
 *
 * This module is deliberately free of Astro imports so unit tests can cover
 * the pure helpers (dates, reading time, related-guide selection) directly.
 */

import { defaultLocale, type LocaleCode } from "../i18n/config";

/** Approved organizational byline for both English and Spanish content. */
export const EDITORIAL_NAME = "AppKitX Editorial";

/** Canonical English path for the guide index (no trailing slash). */
export const GUIDES_PATH = "/guides";

/** Canonical English path for the affiliate disclosure page. */
export const AFFILIATE_DISCLOSURE_PATH = "/affiliate-disclosure";

/**
 * Verified public contact address, approved by the owner for general
 * enquiries and support. Never replace this with an unverified address.
 */
export const CONTACT_EMAIL = "appkitx@gmail.com";

/** Date shown on legal drafts; update when owner/legal review lands. */
export const LEGAL_LAST_UPDATED = "2026-11-01";

/** Date shown on the privacy draft after factual corrections. */
export const PRIVACY_LAST_UPDATED = "2026-11-02";

/** Date shown on company pages. */
export const COMPANY_LAST_UPDATED = "2026-11-01";

/** Intended jurisdiction confirmed by the owner; not a legal conclusion. */
export const INTENDED_JURISDICTION = "India";

/**
 * Guide categories. The enum key is stable across locales; the visible label
 * is localized through GUIDE_CATEGORY_LABELS.
 */
export const GUIDE_CATEGORIES = [
  "Choosing components",
  "Compatibility",
  "Building & upgrades",
  "Buying advice",
] as const;

export type GuideCategory = (typeof GUIDE_CATEGORIES)[number];

export const GUIDE_CATEGORY_LABELS: Record<
  LocaleCode,
  Record<GuideCategory, string>
> = {
  en: {
    "Choosing components": "Choosing components",
    Compatibility: "Compatibility",
    "Building & upgrades": "Building & upgrades",
    "Buying advice": "Buying advice",
  },
  es: {
    "Choosing components": "Elegir componentes",
    Compatibility: "Compatibilidad",
    "Building & upgrades": "Montaje y actualizaciones",
    "Buying advice": "Consejos de compra",
  },
};

/**
 * Stable guide slugs shared by both locales. The English and Spanish
 * Markdown files must pair on these slugs; tests enforce the pairing.
 */
export const GUIDE_SLUGS = [
  "how-to-choose-a-cpu",
  "gpu-buying-guide",
  "how-to-choose-a-compatible-motherboard",
  "ddr4-vs-ddr5",
  "how-much-ram-for-gaming",
  "ssd-buying-guide",
  "how-to-choose-the-right-power-supply",
  "pc-cooling-explained",
  "how-to-check-pc-component-compatibility",
  "a-practical-guide-to-building-your-first-desktop-pc",
] as const;

export type GuideSlug = (typeof GUIDE_SLUGS)[number];

export interface GuideCopy {
  breadcrumbGuides: string;
  bylinePrefix: string;
  publishedLabel: string;
  updatedLabel: string;
  readingTimeSuffix: string;
  inThisGuide: string;
  references: string;
  referencesIntro: string;
  relatedGuides: string;
  allGuides: string;
  readGuide: string;
  guideIndexTitle: string;
  guideIndexDescription: string;
  guideIndexMetaDescription: string;
  guideCountSuffix: string;
  latestUpdateLabel: string;
  articleFallbackSuffix: string;
  authorNote: string;
  editorialPrinciplesLink: string;
  aboutAuthor: string;
}

export const GUIDE_COPY: Record<LocaleCode, GuideCopy> = {
  en: {
    breadcrumbGuides: "Guides",
    bylinePrefix: "By",
    publishedLabel: "Published",
    updatedLabel: "Updated",
    readingTimeSuffix: "min read",
    inThisGuide: "In this guide",
    references: "References",
    referencesIntro:
      "These sources document standards, platform requirements, or manufacturer specifications referenced in this guide. They are starting points, not endorsements; check the exact product documentation before buying.",
    relatedGuides: "Related guides",
    allGuides: "All guides",
    readGuide: "Read guide",
    guideIndexTitle: "PC hardware guides",
    guideIndexDescription:
      "Practical, source-checked guides to choosing PC components, checking compatibility, and building or upgrading a desktop. Written for a global audience, with the reasoning and trade-offs explained.",
    guideIndexMetaDescription:
      "Practical PC hardware guides: choosing a CPU, GPU, motherboard, memory, storage, power supply, and cooling, checking compatibility, and building your first desktop.",
    guideCountSuffix: "guides",
    latestUpdateLabel: "Latest update",
    articleFallbackSuffix: "AppKitX Guides",
    authorNote:
      "AppKitX Editorial writes practical guidance from manufacturer documentation, published standards, and established building practice. It does not claim hands-on testing, benchmark results, or product ownership.",
    editorialPrinciplesLink: "Read the editorial principles",
    aboutAuthor: "About the author",
  },
  es: {
    breadcrumbGuides: "Guías",
    bylinePrefix: "Por",
    publishedLabel: "Publicado",
    updatedLabel: "Actualizado",
    readingTimeSuffix: "min de lectura",
    inThisGuide: "En esta guía",
    references: "Referencias",
    referencesIntro:
      "Estas fuentes documentan estándares, requisitos de plataforma o especificaciones del fabricante citadas en esta guía. Son puntos de partida, no endorsos; consulta la documentación exacta del producto antes de comprar.",
    relatedGuides: "Guías relacionadas",
    allGuides: "Todas las guías",
    readGuide: "Leer guía",
    guideIndexTitle: "Guías de hardware para PC",
    guideIndexDescription:
      "Guías prácticas y documentadas para elegir componentes, comprobar la compatibilidad y montar o actualizar un PC de sobremesa. Escritas para un público global, con el razonamiento y las contrapartidas explicadas.",
    guideIndexMetaDescription:
      "Guías prácticas de hardware: elegir CPU, GPU, placa base, memoria, almacenamiento, fuente de alimentación y refrigeración, comprobar la compatibilidad y montar tu primer PC.",
    guideCountSuffix: "guías",
    latestUpdateLabel: "Última actualización",
    articleFallbackSuffix: "Guías de AppKitX",
    authorNote:
      "AppKitX Editorial escribe guías prácticas a partir de documentación de fabricantes, estándares publicados y prácticas de montaje establecidas. No afirma haber realizado pruebas físicas, benchmarks ni haber poseído los productos.",
    editorialPrinciplesLink: "Leer los principios editoriales",
    aboutAuthor: "Sobre la autoría",
  },
};

/** Static English information routes; localized paths derive from these. */
export const INFO_PAGE_PATHS = {
  about: "/about",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
  affiliateDisclosure: AFFILIATE_DISCLOSURE_PATH,
} as const;

export type InfoPageKey = keyof typeof INFO_PAGE_PATHS;

export interface InfoCopy {
  lastUpdated: string;
  information: string;
  infoAria: string;
  guidesLink: string;
  pageLabels: Record<InfoPageKey, string>;
}

export const INFO_COPY: Record<LocaleCode, InfoCopy> = {
  en: {
    lastUpdated: "Last updated",
    information: "Information",
    infoAria: "AppKitX information",
    guidesLink: "PC hardware guides",
    pageLabels: {
      about: "About AppKitX",
      contact: "Contact",
      privacy: "Privacy policy",
      terms: "Terms of use",
      affiliateDisclosure: "Affiliate disclosure",
    },
  },
  es: {
    lastUpdated: "Última actualización",
    information: "Información",
    infoAria: "Información de AppKitX",
    guidesLink: "Guías de hardware",
    pageLabels: {
      about: "Acerca de AppKitX",
      contact: "Contacto",
      privacy: "Política de privacidad",
      terms: "Términos de uso",
      affiliateDisclosure: "Divulgación de afiliados",
    },
  },
};

export interface GuideSummary {
  slug: string;
  lang: LocaleCode;
  title: string;
  description: string;
  category: GuideCategory;
  published: Date;
  updated: Date;
  readingMinutes: number;
  tags: readonly string[];
  /** Explicit related slugs from frontmatter, in author order. */
  related?: readonly string[];
}

/** Minimal content-entry shape needed to build a guide summary. */
export interface GuideEntryLike {
  id: string;
  body?: string;
  data: {
    slug: string;
    lang: LocaleCode;
    title: string;
    description: string;
    category: GuideCategory;
    published: Date;
    updated: Date;
    tags: readonly string[];
    related?: readonly string[];
  };
}

/** Map a validated content entry to the pure summary used by layouts. */
export function toGuideSummary(entry: GuideEntryLike): GuideSummary {
  return {
    slug: entry.data.slug,
    lang: entry.data.lang,
    title: entry.data.title,
    description: entry.data.description,
    category: entry.data.category,
    published: entry.data.published,
    updated: entry.data.updated,
    readingMinutes: estimateReadingMinutes(entry.body ?? ""),
    tags: entry.data.tags,
    related: entry.data.related,
  };
}

/** Group guides by category, preserving GUIDE_CATEGORIES order. */
export function groupGuidesByCategory(
  guides: readonly GuideSummary[],
): Array<{ category: GuideCategory; guides: GuideSummary[] }> {
  return GUIDE_CATEGORIES.map((category) => ({
    category,
    guides: guides.filter((guide) => guide.category === category),
  })).filter((group) => group.guides.length > 0);
}

/** Site-relative guide-index path without a trailing slash. */
export function guideIndexPath(locale: LocaleCode = defaultLocale): string {
  return locale === defaultLocale ? GUIDES_PATH : `/${locale}${GUIDES_PATH}`;
}

/** Canonical guide-index href. */
export function guideIndexHref(locale: LocaleCode = defaultLocale): string {
  return `${guideIndexPath(locale)}/`;
}

/** Site-relative guide path without a trailing slash. */
export function guidePath(
  slug: string,
  locale: LocaleCode = defaultLocale,
): string {
  return `${guideIndexPath(locale)}/${slug}`;
}

/** Canonical guide href with a trailing slash. */
export function guideHref(
  slug: string,
  locale: LocaleCode = defaultLocale,
): string {
  return `${guidePath(slug, locale)}/`;
}

/** Localized path for a static information page, without a trailing slash. */
export function infoPagePath(
  key: InfoPageKey,
  locale: LocaleCode = defaultLocale,
): string {
  const path = INFO_PAGE_PATHS[key];
  return locale === defaultLocale ? path : `/${locale}${path}`;
}

/** Canonical localized href for a static information page. */
export function infoPageHref(
  key: InfoPageKey,
  locale: LocaleCode = defaultLocale,
): string {
  return `${infoPagePath(key, locale)}/`;
}

/** ISO 8601 calendar date (UTC) for <time datetime> and JSON-LD. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Human-readable publication date for the requested locale. */
export function formatEditorialDate(
  date: Date,
  locale: LocaleCode = defaultLocale,
): string {
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Approximate reading time at 220 words per minute. Deliberately an estimate:
 * the page labels it "min read" and never presents it as measured data.
 */
export function estimateReadingMinutes(markdown: string): number {
  const words = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`[\]()|-]/g, " ")
    .split(/\s+/)
    .filter((word) => /[A-Za-z0-9]/.test(word)).length;
  return Math.max(1, Math.ceil(words / 220));
}

/**
 * Related guides: explicit frontmatter references first (in author order),
 * then same-category guides, then the remaining guides by publication date.
 * Deterministic and duplicate-free. The caller passes guides from one locale.
 */
export function selectRelatedGuides(
  guides: readonly GuideSummary[],
  currentSlug: string,
  limit = 3,
): GuideSummary[] {
  const current = guides.find((guide) => guide.slug === currentSlug);
  if (current === undefined) return [];

  const bySlug = new Map(guides.map((guide) => [guide.slug, guide]));
  const selected: GuideSummary[] = [];
  const seen = new Set<string>([currentSlug]);

  for (const slug of current.related ?? []) {
    const guide = bySlug.get(slug);
    if (guide !== undefined && !seen.has(guide.slug)) {
      selected.push(guide);
      seen.add(guide.slug);
    }
  }

  const remaining = guides
    .filter((guide) => !seen.has(guide.slug))
    .sort((a, b) => {
      const sameCategoryA = a.category === current.category ? 0 : 1;
      const sameCategoryB = b.category === current.category ? 0 : 1;
      if (sameCategoryA !== sameCategoryB) return sameCategoryA - sameCategoryB;
      return b.published.getTime() - a.published.getTime();
    });

  for (const guide of remaining) {
    if (selected.length >= limit) break;
    selected.push(guide);
    seen.add(guide.slug);
  }

  return selected.slice(0, limit);
}

/** Publication order: newest first, slug as a stable tiebreak. */
export function sortGuidesByDate(
  guides: readonly GuideSummary[],
): GuideSummary[] {
  return [...guides].sort((a, b) => {
    const delta = b.published.getTime() - a.published.getTime();
    return delta !== 0 ? delta : a.slug.localeCompare(b.slug);
  });
}
