import { expect, test } from "@playwright/test";
import { locales } from "../src/i18n/config";
import {
  localizedHref,
  stripLocalePrefix,
  translatedPagePaths,
} from "../src/i18n/routing";
import {
  GUIDES_PATH,
  GUIDE_SLUGS,
  INFO_PAGE_PATHS,
} from "../src/lib/editorial";

const LOCALE_CODES = Object.keys(locales) as Array<keyof typeof locales>;
const INDEXABLE_ROUTES = LOCALE_CODES.flatMap((locale) =>
  translatedPagePaths().map((path) => localizedHref(path, locale)),
);

const GUIDE_ROUTES = LOCALE_CODES.flatMap((locale) =>
  GUIDE_SLUGS.map((slug) => localizedHref(`${GUIDES_PATH}/${slug}`, locale)),
);

const CHROME_PATHS = new Set([
  "/",
  ...translatedPagePaths().filter(
    (path) => !path.startsWith(`${GUIDES_PATH}/`),
  ),
]);

const NAV_LABELS: Record<
  string,
  { tools: string; categories: string; guides: string; about: string }
> = {
  en: {
    tools: "Tools",
    categories: "Categories",
    guides: "Guides",
    about: "About",
  },
  es: {
    tools: "Herramientas",
    categories: "Categorías",
    guides: "Guías",
    about: "Acerca de",
  },
};

const FOOTER_LABELS: Record<
  string,
  {
    about: string;
    contact: string;
    privacy: string;
    terms: string;
    affiliateDisclosure: string;
    guides: string;
  }
> = {
  en: {
    about: "About",
    contact: "Contact",
    privacy: "Privacy",
    terms: "Terms",
    affiliateDisclosure: "Affiliate disclosure",
    guides: "PC hardware guides",
  },
  es: {
    about: "Acerca de",
    contact: "Contacto",
    privacy: "Privacidad",
    terms: "Términos",
    affiliateDisclosure: "Divulgación de afiliados",
    guides: "Guías de hardware",
  },
};

const isExternal = (href: string): boolean =>
  /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(href) ||
  href.startsWith("mailto:") ||
  href.startsWith("tel:");

const routePath = (href: string): string => href.split(/[?#]/)[0];

test("all indexable routes keep canonical internal links and working chrome", async ({
  page,
  request,
}) => {
  expect(INDEXABLE_ROUTES).toHaveLength(52);

  const internalPaths = new Set<string>();

  for (const route of INDEXABLE_ROUTES) {
    const response = await page.goto(route);
    expect(response?.status(), `${route} must return 200`).toBe(200);

    const { locale } = stripLocalePrefix(route);
    const labels = NAV_LABELS[locale];
    const home = localizedHref("/", locale);
    const nav = page.getByRole("banner");
    const footer = page.getByRole("contentinfo");

    await expect(
      nav.getByRole("link", { name: labels.tools }).first(),
      `${route} Tools navigation`,
    ).toHaveAttribute("href", `${home}#tools`);
    await expect(
      nav.getByRole("link", { name: labels.categories }).first(),
      `${route} Categories navigation`,
    ).toHaveAttribute("href", `${home}#categories`);
    await expect(
      nav.getByRole("link", { name: labels.guides }),
      `${route} Guides navigation`,
    ).toHaveAttribute("href", localizedHref(GUIDES_PATH, locale));
    await expect(
      nav.getByRole("link", { name: labels.about }),
      `${route} must not render an About link in the global nav`,
    ).toHaveCount(0);

    await expect(footer.locator('a[href="#"]')).toHaveCount(0);

    const footerLinks = FOOTER_LABELS[locale];
    for (const [key, label] of [
      ["about", footerLinks.about],
      ["contact", footerLinks.contact],
      ["privacy", footerLinks.privacy],
      ["terms", footerLinks.terms],
      ["affiliateDisclosure", footerLinks.affiliateDisclosure],
    ] as const) {
      await expect(
        footer.getByRole("link", { name: label }),
        `${route} must render a ${label} footer link`,
      ).toHaveAttribute("href", localizedHref(INFO_PAGE_PATHS[key], locale));
    }
    await expect(
      footer.getByRole("link", { name: footerLinks.guides }),
      `${route} must link the localized guides index`,
    ).toHaveAttribute("href", localizedHref(GUIDES_PATH, locale));

    const hrefs = await page
      .locator("a[href]")
      .evaluateAll((anchors) =>
        anchors.map((anchor) => anchor.getAttribute("href") ?? ""),
      );

    for (const href of hrefs) {
      expect(href, `${route} must not contain href="#"`).not.toBe("#");

      if (href.startsWith("#")) {
        const target = href.slice(1);
        await expect(
          page.locator(`[id="${target}"]`),
          `${route} fragment ${href} must resolve on the page`,
        ).toHaveCount(1);
        continue;
      }

      if (isExternal(href)) continue;

      expect(
        href.startsWith("/"),
        `${route} has an unexpected internal href: ${href}`,
      ).toBe(true);

      const pathname = routePath(href);
      expect(
        pathname === "/" || pathname.endsWith("/"),
        `${route} link ${href} must use the canonical trailing slash`,
      ).toBe(true);
      internalPaths.add(pathname);
    }
  }

  for (const path of CHROME_PATHS) {
    for (const locale of LOCALE_CODES) {
      const route = localizedHref(path, locale);
      expect(
        internalPaths.has(route),
        `${route} must be linked from the site chrome`,
      ).toBe(true);
    }
  }

  for (const pathname of internalPaths) {
    const response = await request.get(pathname, { maxRedirects: 0 });
    expect(
      response.status(),
      `${pathname} must resolve without a redirect`,
    ).toBe(200);
  }

  for (const locale of LOCALE_CODES) {
    await page.goto(localizedHref("/", locale));
    await expect(page.locator("#tools")).toHaveCount(1);
    await expect(page.locator("#categories")).toHaveCount(1);
  }
});

test("both guide indexes link every localized guide", async ({ page }) => {
  for (const locale of LOCALE_CODES) {
    await page.goto(localizedHref(GUIDES_PATH, locale));
    for (const slug of GUIDE_SLUGS) {
      await expect(
        page.locator(
          `a[href="${localizedHref(`${GUIDES_PATH}/${slug}`, locale)}"]`,
        ),
        `${locale} guides index must link ${slug}`,
      ).toHaveCount(1);
    }
  }

  expect(GUIDE_ROUTES).toHaveLength(20);
});

test("Categories navigation clears the sticky header from a non-home page", async ({
  page,
}) => {
  await page.goto("/percentage-calculator/");
  await page
    .getByRole("banner")
    .getByRole("link", { name: "Categories" })
    .click();

  await expect(page).toHaveURL(/\/#categories$/);

  await expect
    .poll(() =>
      page.evaluate(() => {
        const header = document.querySelector("header");
        const categories = document.querySelector("#categories");
        if (
          !(header instanceof HTMLElement) ||
          !(categories instanceof HTMLElement)
        ) {
          throw new Error("missing header or categories target");
        }
        return (
          categories.getBoundingClientRect().top -
          header.getBoundingClientRect().bottom
        );
      }),
    )
    .toBeGreaterThanOrEqual(-1);
});

test("404 quick links use canonical internal URLs", async ({
  page,
  request,
}) => {
  const response = await page.goto("/a-page-that-does-not-exist");
  expect(response?.status()).toBe(404);

  const hrefs = await page
    .getByRole("main")
    .locator("a[href]")
    .evaluateAll((anchors) =>
      anchors.map((anchor) => anchor.getAttribute("href") ?? ""),
    );

  expect(hrefs).not.toContain("#");

  for (const href of hrefs) {
    if (isExternal(href)) continue;

    expect(href.startsWith("/"), `404 has an unexpected href: ${href}`).toBe(
      true,
    );

    const pathname = routePath(href);
    expect(
      pathname === "/" || pathname.endsWith("/"),
      `404 link ${href} must use the canonical trailing slash`,
    ).toBe(true);

    const target = await request.get(pathname, { maxRedirects: 0 });
    expect(target.status(), `${pathname} must resolve without a redirect`).toBe(
      200,
    );
  }
});
