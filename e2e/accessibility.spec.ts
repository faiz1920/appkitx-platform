import { expect, test, type Page } from "@playwright/test";
import {
  GUIDE_COPY,
  INFO_COPY,
  guideHref,
  guideIndexHref,
  infoPageHref,
} from "../src/lib/editorial";
import { pressTab, tabTo } from "./keyboard";

/*
 * Dependency-free accessibility checks. These assertions cover the
 * AppKitX-Design.md invariants that can be verified from the rendered DOM:
 * landmarks, heading order, skip link, names, language metadata, focus
 * geometry, target sizes, reduced motion, and representative contrast.
 *
 * They are not a substitute for a manual screen-reader pass. No axe-core or
 * other accessibility package is installed or required.
 */

const REPRESENTATIVE_ROUTES = [
  { path: "/", lang: "en" },
  { path: "/es/", lang: "es" },
  { path: guideIndexHref("en"), lang: "en" },
  { path: guideIndexHref("es"), lang: "es" },
  { path: guideHref("how-to-choose-a-cpu", "en"), lang: "en" },
  { path: guideHref("how-to-choose-a-cpu", "es"), lang: "es" },
  { path: infoPageHref("privacy", "en"), lang: "en" },
  { path: infoPageHref("privacy", "es"), lang: "es" },
  { path: infoPageHref("contact", "en"), lang: "en" },
  { path: "/this-page-does-not-exist/", lang: "en", notFound: true },
] as const;

const headingLevels = async (page: Page): Promise<number[]> =>
  page
    .locator("h1, h2, h3, h4, h5, h6")
    .evaluateAll((elements) =>
      elements.map((element) => Number.parseInt(element.tagName.slice(1), 10)),
    );

const parseTime = (value: string): number[] =>
  value
    .split(",")
    .map((part) => part.trim())
    .map((part) =>
      part.endsWith("ms")
        ? Number.parseFloat(part) / 1000
        : Number.parseFloat(part),
    );

test("every representative page has one H1, ordered headings, landmarks, and a working skip link", async ({
  page,
  browserName,
}) => {
  for (const route of REPRESENTATIVE_ROUTES) {
    const response = await page.goto(route.path);
    if ("notFound" in route) {
      expect(response?.status(), `${route.path} must be the 404 page`).toBe(
        404,
      );
    } else {
      expect(response?.status(), `${route.path} must return 200`).toBe(200);
    }

    await expect(page.locator("html")).toHaveAttribute("lang", route.lang);
    await expect(page.locator("main#main")).toHaveCount(1);
    await expect(page.locator("footer")).toHaveCount(1);
    await expect(page.locator("nav[aria-label]").first()).toBeVisible();

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

    const levels = await headingLevels(page);
    expect(levels[0], `${route.path} must start with an H1`).toBe(1);
    for (let index = 1; index < levels.length; index += 1) {
      expect(
        levels[index],
        `${route.path} skips from H${levels[index - 1]} to H${levels[index]}`,
      ).toBeLessThanOrEqual(levels[index - 1] + 1);
    }

    await pressTab(page, browserName);
    await expect(
      page.locator("a.skip-link"),
      `${route.path} skip link must be the first focusable element`,
    ).toBeFocused();
    await expect(page.locator("a.skip-link")).toHaveAttribute("href", "#main");
  }
});

test("article and information layouts expose accessible names and current-language state", async ({
  page,
}) => {
  await page.goto(guideHref("how-to-check-pc-component-compatibility", "en"));
  const articleTitle = (
    await page.getByRole("heading", { level: 1 }).textContent()
  )?.trim();
  expect(articleTitle).toBeTruthy();
  await expect(page.locator("article")).toHaveAccessibleName(articleTitle!);
  await expect(page.locator("aside nav")).toHaveAccessibleName(
    GUIDE_COPY.en.inThisGuide,
  );
  await expect(
    page.locator(
      "details[data-language-switcher]:visible a[aria-current='page']",
    ),
  ).toHaveCount(1);
  await expect(
    page.locator(
      "details[data-language-switcher]:visible a[data-locale-choice='en']",
    ),
  ).toHaveAttribute("aria-current", "page");

  await page.goto(infoPageHref("privacy", "en"));
  await expect(page.locator("aside nav")).toHaveAccessibleName(
    INFO_COPY.en.infoAria,
  );

  await page.goto("/this-page-does-not-exist/");
  await expect(page.locator("footer h2")).toHaveCount(4);
  await expect(page.locator("footer h3")).toHaveCount(0);
});

test("visible links, buttons, and form controls have accessible names", async ({
  page,
}) => {
  for (const route of REPRESENTATIVE_ROUTES) {
    await page.goto(route.path);
    const controls = page.locator(
      "header a, header button, header summary, main a, main button, main input, main select, main textarea",
    );
    const count = await controls.count();
    for (let index = 0; index < count; index += 1) {
      const control = controls.nth(index);
      if (!(await control.isVisible())) continue;
      await expect(
        control,
        `${route.path} control ${index} (${await control.evaluate((element) =>
          element.tagName.toLowerCase(),
        )}) must have an accessible name`,
      ).toHaveAccessibleName(/\S/);
    }
  }
});

test("images have alt attributes and inline icons are decorative or named", async ({
  page,
}) => {
  for (const route of REPRESENTATIVE_ROUTES) {
    await page.goto(route.path);

    const imagesWithoutAlt = await page
      .locator("img")
      .evaluateAll((images) =>
        images
          .filter((image) => !image.hasAttribute("alt"))
          .map((image) => image.getAttribute("src") ?? "(inline)"),
      );
    expect(imagesWithoutAlt, `${route.path} images must all carry alt`).toEqual(
      [],
    );

    const unnamedIcons = await page.locator("svg").evaluateAll((icons) =>
      icons
        .filter((icon) => {
          if (icon.getAttribute("aria-hidden") === "true") return false;
          if (icon.closest('[aria-hidden="true"]')) return false;
          if (icon.getAttribute("aria-label")) return false;
          if (icon.querySelector("title")?.textContent?.trim()) return false;
          return true;
        })
        .map((icon) => icon.outerHTML.slice(0, 120)),
    );
    expect(
      unnamedIcons,
      `${route.path} icons must be aria-hidden, labelled, or titled`,
    ).toEqual([]);
  }
});

test("guide cards and primary navigation meet focus-ring and target-size invariants", async ({
  page,
  browserName,
}) => {
  await page.goto(guideIndexHref("en"));

  const card = page.locator(
    `main a[href="${guideHref("how-to-choose-a-cpu", "en")}"]`,
  );
  await tabTo(page, browserName, card, 20);
  await expect(card).toHaveCSS("outline-width", "2px");
  await expect(card).toHaveCSS("outline-style", "solid");
  await expect(card).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(card).toHaveCSS("outline-offset", "2px");

  const cardBox = await card.boundingBox();
  expect(cardBox?.height ?? 0).toBeGreaterThanOrEqual(44);

  const headerLink = page.locator("header nav a").first();
  const headerLinkBox = await headerLink.boundingBox();
  expect(headerLinkBox?.height ?? 0).toBeGreaterThanOrEqual(44);

  const summary = page.locator(
    "header details[data-language-switcher]:visible summary",
  );
  const summaryBox = await summary.boundingBox();
  expect(summaryBox?.height ?? 0).toBeGreaterThanOrEqual(44);

  await page
    .locator("header details[data-language-switcher]:visible summary")
    .click();
  const languageLink = page.locator(
    "header details[data-language-switcher]:visible a[data-locale-choice='es']",
  );
  const languageBox = await languageLink.boundingBox();
  expect(languageBox?.height ?? 0).toBeGreaterThanOrEqual(44);
});

test("reduced-motion preference collapses transitions and animations", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const durations = await page.evaluate(() => {
    const selectors = [".lang-chevron", ".btn", "main a"];
    return selectors.map((selector) => {
      const element = document.querySelector(selector);
      if (!element) return { selector, transition: "0s", animation: "0s" };
      const styles = getComputedStyle(element);
      return {
        selector,
        transition: styles.transitionDuration,
        animation: styles.animationDuration,
      };
    });
  });

  for (const entry of durations) {
    for (const value of [
      ...parseTime(entry.transition),
      ...parseTime(entry.animation),
    ]) {
      expect(
        value,
        `${entry.selector} must not animate when reduced motion is requested`,
      ).toBeLessThanOrEqual(0.001);
    }
  }
});

test("representative text pairings meet WCAG AA contrast", async ({ page }) => {
  const contrast = async (selector: string): Promise<number> =>
    page
      .locator(selector)
      .first()
      .evaluate((element) => {
        const parse = (value: string): [number, number, number, number] => {
          const match = value.match(/rgba?\(([^)]+)\)/);
          if (!match) return [0, 0, 0, 1];
          const parts = match[1]
            .split(",")
            .map((part) => Number.parseFloat(part));
          return [parts[0], parts[1], parts[2], parts[3] ?? 1];
        };
        const background = (
          node: Element,
        ): [number, number, number, number] => {
          let current: Element | null = node;
          while (current) {
            const color = parse(getComputedStyle(current).backgroundColor);
            if (color[3] > 0) return color;
            current = current.parentElement;
          }
          return [255, 255, 255, 1];
        };
        const luminance = ([r, g, b]: [
          number,
          number,
          number,
          number,
        ]): number => {
          const channel = (value: number): number => {
            const normalized = value / 255;
            return normalized <= 0.03928
              ? normalized / 12.92
              : ((normalized + 0.055) / 1.055) ** 2.4;
          };
          return (
            0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
          );
        };
        const foreground = parse(getComputedStyle(element).color);
        const backdrop = background(element);
        const lighter = Math.max(luminance(foreground), luminance(backdrop));
        const darker = Math.min(luminance(foreground), luminance(backdrop));
        return (lighter + 0.05) / (darker + 0.05);
      });

  await page.goto("/guides/");
  expect(await contrast("main nav[aria-label]")).toBeGreaterThanOrEqual(4.5);
  expect(await contrast("footer h2")).toBeGreaterThanOrEqual(4.5);
  expect(await contrast("footer a")).toBeGreaterThanOrEqual(4.5);
  expect(await contrast("main a[href^='/guides/']")).toBeGreaterThanOrEqual(
    4.5,
  );

  await page.goto(infoPageHref("privacy", "en"));
  expect(await contrast("[role='note']")).toBeGreaterThanOrEqual(4.5);
  expect(await contrast("aside nav a")).toBeGreaterThanOrEqual(4.5);
});
