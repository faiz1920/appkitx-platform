import { expect, test, type Page } from "@playwright/test";
import {
  CONTACT_EMAIL,
  INFO_COPY,
  INFO_PAGE_PATHS,
  INTENDED_JURISDICTION,
  infoPageHref,
  type InfoPageKey,
} from "../src/lib/editorial";

const LOCALES = ["en", "es"] as const;
const INFO_KEYS = Object.keys(INFO_PAGE_PATHS) as InfoPageKey[];

const INFO_PAGES = LOCALES.flatMap((locale) =>
  INFO_KEYS.map((key) => ({
    locale,
    key,
    route: infoPageHref(key, locale),
    heading: INFO_COPY[locale].pageLabels[key],
  })),
);

const readJsonLd = async (page: Page): Promise<Record<string, unknown>[]> => {
  const scripts = page.locator('script[type="application/ld+json"]');
  const count = await scripts.count();
  const documents: Record<string, unknown>[] = [];
  for (let index = 0; index < count; index++) {
    documents.push(JSON.parse((await scripts.nth(index).textContent()) ?? ""));
  }
  return documents;
};

test("information pages are indexable, canonical, and breadcrumb-linked in both locales", async ({
  page,
}) => {
  for (const item of INFO_PAGES) {
    const response = await page.goto(item.route);
    expect(response?.status(), `${item.route} must return 200`).toBe(200);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      item.heading,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://appkitx.com${item.route}`,
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /.{50,}/,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      "content",
      "website",
    );

    const documents = await readJsonLd(page);
    const breadcrumb = documents.find(
      (document) => document["@type"] === "BreadcrumbList",
    );
    expect(
      breadcrumb,
      `${item.route} must emit BreadcrumbList JSON-LD`,
    ).toBeDefined();
  }
});

test("contact page shows the approved address in both locales", async ({
  page,
}) => {
  for (const locale of LOCALES) {
    await page.goto(infoPageHref("contact", locale));
    await expect(page.getByText(CONTACT_EMAIL).first()).toBeVisible();
    await expect(
      page.locator(`a[href="mailto:${CONTACT_EMAIL}"]`).first(),
    ).toBeVisible();
    await expect(page.locator("[data-contact-pending]")).toHaveCount(0);
  }
});

test("legal drafts identify the review requirement, India, and translation provenance", async ({
  page,
}) => {
  for (const locale of LOCALES) {
    for (const key of ["privacy", "terms", "affiliateDisclosure"] as const) {
      await page.goto(infoPageHref(key, locale));
      await expect(
        page.getByText(
          locale === "es"
            ? /Borrador para revisión del propietario y legal/i
            : /Draft for owner and legal review/i,
        ),
        `${locale}/${key} must show the draft notice`,
      ).toBeVisible();
      await expect(
        page.getByText(INTENDED_JURISDICTION).first(),
        `${locale}/${key} must mention the intended jurisdiction`,
      ).toBeVisible();
      if (locale === "es") {
        await expect(
          page.getByText(/Traducción al español provisional/i).first(),
        ).toBeVisible();
      }
    }
  }

  await page.goto(infoPageHref("privacy", "en"));
  await expect(page.getByText(/appkitx\.locale/).first()).toBeVisible();
  await expect(page.getByText(/__csp-report/).first()).toBeVisible();
  await expect(page.getByText(/Cloudflare/).first()).toBeVisible();
  await expect(page.getByText(/Google Search Console/).first()).toBeVisible();

  await page.goto(infoPageHref("privacy", "es"));
  await expect(page.getByText(/appkitx\.locale/).first()).toBeVisible();
  await expect(page.getByText(/__csp-report/).first()).toBeVisible();
  await expect(page.getByText(/Cloudflare/).first()).toBeVisible();
  await expect(page.getByText(/Google Search Console/).first()).toBeVisible();

  await page.goto(infoPageHref("terms", "en"));
  await expect(page.getByText(/Governing law and jurisdiction/i)).toBeVisible();
  await expect(
    page.getByText(/not yet legally registered/i).first(),
  ).toBeVisible();

  await page.goto(infoPageHref("terms", "es"));
  await expect(page.getByText(/Ley aplicable y jurisdicción/i)).toBeVisible();
  await expect(
    page.getByText(/todavía no está legalmente registrada/i).first(),
  ).toBeVisible();

  for (const locale of LOCALES) {
    await page.goto(infoPageHref("affiliateDisclosure", locale));
    await expect(
      page
        .getByText(
          locale === "es"
            ? /no participa actualmente en ningún programa de afiliados/i
            : /does not currently participate in any affiliate program/i,
        )
        .first(),
    ).toBeVisible();
    await expect(page.getByText(/As an Amazon Associate/i)).toHaveCount(0);
    await expect(page.locator('a[href*="amazon."]')).toHaveCount(0);
  }
});

test("no public AppKitX page mentions Nexverra or exposes the PC Builder", async ({
  page,
}) => {
  for (const item of INFO_PAGES) {
    await page.goto(item.route);
    await expect(page.getByText(/Nexverra/i)).toHaveCount(0);
    await expect(page.locator('a[href*="pc-builder"]')).toHaveCount(0);
  }
});

test("privacy pages desktop visual proof in both locales", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const locale of LOCALES) {
    await page.goto(infoPageHref("privacy", locale));
    await page.screenshot({
      path: `test-results/privacy-${locale}-desktop.png`,
      fullPage: true,
    });
  }
});

test("information pages remain readable at 320px without overflow in both locales", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 700 });

  for (const item of INFO_PAGES) {
    await page.goto(item.route);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(
      overflow,
      `${item.route} overflows horizontally`,
    ).toBeLessThanOrEqual(0);
  }

  await page.screenshot({
    path: "test-results/info-320.png",
    fullPage: false,
  });
});
