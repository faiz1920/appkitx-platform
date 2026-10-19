import { expect, test } from "@playwright/test";
import { locales } from "../src/i18n/config";
import {
  localizedHref,
  stripLocalePrefix,
  translatedPagePaths,
} from "../src/i18n/routing";

const LOCALE_CODES = Object.keys(locales) as Array<keyof typeof locales>;
const INDEXABLE_ROUTES = LOCALE_CODES.flatMap((locale) =>
  translatedPagePaths().map((path) => localizedHref(path, locale)),
);

const NAV_LABELS: Record<
  string,
  { tools: string; categories: string; about: string }
> = {
  en: {
    tools: "Tools",
    categories: "Categories",
    about: "About",
  },
  es: {
    tools: "Herramientas",
    categories: "Categorías",
    about: "Acerca de",
  },
};

const REMOVED_FOOTER_LABELS: Record<string, string[]> = {
  en: ["About", "Contact", "Privacy", "Terms"],
  es: ["Acerca de", "Contacto", "Privacidad", "Términos"],
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
  expect(INDEXABLE_ROUTES).toHaveLength(20);

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
      nav.getByRole("link", { name: labels.about }),
      `${route} must not render an About link`,
    ).toHaveCount(0);

    await expect(footer.locator('a[href="#"]')).toHaveCount(0);
    for (const label of REMOVED_FOOTER_LABELS[locale]) {
      await expect(
        footer.getByRole("link", { name: label }),
        `${route} must not render a ${label} footer link`,
      ).toHaveCount(0);
    }

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
          page.locator(`#${target}`),
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

  for (const route of INDEXABLE_ROUTES) {
    expect(
      internalPaths.has(route),
      `${route} must be linked from the site chrome`,
    ).toBe(true);
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
