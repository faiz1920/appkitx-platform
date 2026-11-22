import { expect, test, type Locator, type Page } from "@playwright/test";
import { prepareClipboard } from "./clipboard";
import { tabTo } from "./keyboard";

const dateInput = (page: Page) => page.getByLabel("Date", { exact: true });
const timeInput = (page: Page) => page.getByLabel("Time", { exact: true });
const sourceZone = (page: Page) => page.getByLabel("From time zone");
const targetZone = (page: Page) => page.getByLabel("To time zone");
const targetTime = (page: Page) => page.locator("[data-target-time]");
const targetZoneValue = (page: Page) => page.locator("[data-target-zone]");
const targetDate = (page: Page) => page.locator("[data-target-date]");
const targetWeekday = (page: Page) => page.locator("[data-target-weekday]");
const sourceOffset = (page: Page) => page.locator("[data-source-offset]");
const targetOffset = (page: Page) => page.locator("[data-target-offset]");
const difference = (page: Page) => page.locator("[data-difference]");
const dayChange = (page: Page) => page.locator("[data-day-change]");
const dayBadge = (page: Page) => page.locator("[data-day-badge]");
const sourceSummary = (page: Page) => page.locator("[data-source-summary]");
const targetSummary = (page: Page) => page.locator("[data-target-summary]");
const ambiguousNotice = (page: Page) => page.locator("[data-ambiguous-notice]");
const ambiguousText = (page: Page) => page.locator("[data-ambiguous-text]");
const gapError = (page: Page) => page.locator("[data-error-gap]");
const gapText = (page: Page) => page.locator("[data-error-text-gap]");
const caption = (page: Page) => page.locator("[data-result-caption]");
const comparison = (page: Page) => page.locator("[data-comparison]");
const comparisonEmpty = (page: Page) => page.locator("[data-comparison-empty]");
const copy = (page: Page) => page.getByRole("button", { name: "Copy summary" });

const calculate = async (page: Page) => {
  await page.getByRole("button", { name: "Calculate" }).click();
};

const fillConversion = async (
  page: Page,
  values: {
    date: string;
    time: string;
    source: string;
    target: string;
  },
) => {
  await dateInput(page).fill(values.date);
  await timeInput(page).fill(values.time);
  await sourceZone(page).selectOption(values.source);
  await targetZone(page).selectOption(values.target);
};

const comparisonRow = (page: Page, zone: string) =>
  comparison(page).locator(`tbody tr[data-comparison-zone="${zone}"]`);

const ring = async (locator: Locator) => {
  await expect(locator).toHaveCSS("outline-width", "2px");
  await expect(locator).toHaveCSS("outline-style", "solid");
  await expect(locator).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(locator).toHaveCSS("outline-offset", "2px");
};

const deviceDate = async (page: Page) => {
  return page.evaluate(() => {
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  });
};

test("loads with the correct title, defaults, and an initial conversion", async ({
  page,
}) => {
  await page.goto("/time-zone-converter");

  await expect(page).toHaveTitle("Time Zone Converter — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Time Zone Converter",
  );

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(
    "Time Zone Converter",
  );

  const sourceValue = await sourceZone(page).inputValue();
  expect(
    await page.evaluate((zone) => {
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: zone });
        return true;
      } catch {
        return false;
      }
    }, sourceValue),
  ).toBe(true);
  expect(
    (await sourceZone(page).locator("option:checked").textContent())?.trim(),
  ).not.toBe("");

  const targetValue = await targetZone(page).inputValue();
  expect(targetValue).toBe(sourceValue === "UTC" ? "Europe/London" : "UTC");

  await expect(dateInput(page)).toHaveValue(await deviceDate(page));
  expect(await timeInput(page).inputValue()).toMatch(/^\d{2}:\d{2}$/);
  expect(
    await sourceZone(page).locator("option").count(),
  ).toBeGreaterThanOrEqual(20);

  await expect(targetTime(page)).not.toHaveText("—");
  await expect(copy(page)).toBeEnabled();
  await expect(ambiguousNotice(page)).toBeHidden();
  await expect(gapError(page)).toBeHidden();
  await expect(comparisonEmpty(page)).toBeHidden();
  await expect(comparison(page)).toBeVisible();
  await expect(
    comparison(page).locator("tbody tr[data-comparison-zone]"),
  ).toHaveCount(7);
  await expect(
    page.getByText(/Offsets and daylight-saving rules come from/),
  ).toBeVisible();
});

test("converts New York to Kolkata with a pinned result and comparison table", async ({
  page,
}) => {
  await page.goto("/time-zone-converter");
  await fillConversion(page, {
    date: "2026-11-22",
    time: "10:30",
    source: "America/New_York",
    target: "Asia/Kolkata",
  });
  await calculate(page);

  await expect(targetTime(page)).toHaveText("9:00 PM");
  await expect(targetZoneValue(page)).toHaveText("Kolkata (Asia/Kolkata)");
  await expect(targetDate(page)).toHaveText("November 22, 2026");
  await expect(targetWeekday(page)).toHaveText("Sunday");
  await expect(sourceOffset(page)).toHaveText("UTC−05:00");
  await expect(targetOffset(page)).toHaveText("UTC+05:30");
  await expect(difference(page)).toHaveText("10 h 30 min ahead");
  await expect(dayChange(page)).toHaveText("Same day");
  await expect(dayBadge(page)).toBeHidden();
  await expect(sourceSummary(page)).toHaveText(
    "10:30 AM, November 22, 2026 — New York (America/New_York)",
  );
  await expect(targetSummary(page)).toHaveText(
    "9:00 PM, November 22, 2026 — Kolkata (Asia/Kolkata)",
  );
  await expect(caption(page)).toHaveText(
    "Converted from 10:30 AM on November 22, 2026 in New York.",
  );
  await expect(ambiguousNotice(page)).toBeHidden();
  await expect(gapError(page)).toBeHidden();

  await expect(comparisonRow(page, "UTC").locator("td").nth(1)).toHaveText(
    "3:30 PM",
  );
  await expect(
    comparisonRow(page, "America/New_York").locator("td").nth(1),
  ).toHaveText("10:30 AM");
  await expect(
    comparisonRow(page, "Asia/Kolkata").locator("td").nth(1),
  ).toHaveText("9:00 PM");
  await expect(
    comparisonRow(page, "Asia/Tokyo").locator("td").nth(0),
  ).toHaveText("November 23, 2026");
  await expect(
    comparisonRow(page, "Asia/Tokyo").locator("td").nth(1),
  ).toHaveText("12:30 AM");
  await expect(
    comparisonRow(page, "Asia/Tokyo").locator("td").nth(3),
  ).toHaveText("Next day");

  const table = comparison(page).locator("table");
  await expect(table.locator("caption")).toHaveText("Time zone comparison");
  await expect(table.locator("th[scope='col']")).toHaveCount(5);
});

test("shows next-day and previous-day changes prominently", async ({
  page,
}) => {
  await page.goto("/time-zone-converter");
  await fillConversion(page, {
    date: "2026-01-01",
    time: "22:00",
    source: "America/New_York",
    target: "Asia/Tokyo",
  });
  await calculate(page);

  await expect(targetTime(page)).toHaveText("12:00 PM");
  await expect(targetDate(page)).toHaveText("January 2, 2026");
  await expect(dayBadge(page)).toBeVisible();
  await expect(dayBadge(page)).toHaveText("Next day");
  await expect(dayChange(page)).toHaveText("Next day");
  await expect(caption(page)).toContainText("in New York");

  await fillConversion(page, {
    date: "2026-01-01",
    time: "01:00",
    source: "Asia/Tokyo",
    target: "America/New_York",
  });
  await calculate(page);

  await expect(targetTime(page)).toHaveText("11:00 AM");
  await expect(targetDate(page)).toHaveText("December 31, 2025");
  await expect(dayBadge(page)).toHaveText("Previous day");
  await expect(dayChange(page)).toHaveText("Previous day");
});

test("rejects a spring-forward gap and recovers", async ({ page }) => {
  await page.goto("/time-zone-converter");
  await fillConversion(page, {
    date: "2026-03-08",
    time: "02:30",
    source: "America/New_York",
    target: "Europe/London",
  });
  await calculate(page);

  await expect(gapError(page)).toBeVisible();
  await expect(gapText(page)).toHaveText(
    "That local time does not exist in New York because the clocks move forward by 1 h for daylight saving. Choose a valid local time.",
  );
  await expect(targetTime(page)).toHaveText("—");
  await expect(comparison(page)).toBeHidden();
  await expect(comparisonEmpty(page)).toBeVisible();
  await expect(copy(page)).toBeDisabled();
  await expect(dateInput(page)).toHaveAttribute("aria-invalid", "true");
  await expect(timeInput(page)).toHaveAttribute("aria-invalid", "true");
  await expect(ambiguousNotice(page)).toBeHidden();

  await timeInput(page).fill("03:30");
  await calculate(page);

  await expect(gapError(page)).toBeHidden();
  await expect(targetTime(page)).not.toHaveText("—");
  await expect(targetTime(page)).toHaveText("7:30 AM");
  await expect(comparison(page)).toBeVisible();
});

test("selects the first fall-back occurrence and discloses it", async ({
  page,
}) => {
  await page.goto("/time-zone-converter");
  await fillConversion(page, {
    date: "2026-11-01",
    time: "01:30",
    source: "America/New_York",
    target: "Asia/Kolkata",
  });
  await calculate(page);

  await expect(targetTime(page)).toHaveText("11:00 AM");
  await expect(sourceOffset(page)).toHaveText("UTC−04:00");
  await expect(targetOffset(page)).toHaveText("UTC+05:30");
  await expect(difference(page)).toHaveText("9 h 30 min ahead");
  await expect(copy(page)).toBeEnabled();
  await expect(ambiguousNotice(page)).toBeVisible();
  await expect(ambiguousText(page)).toHaveText(
    "That local time occurs twice in New York because the clocks move back for daylight saving. The first occurrence (UTC−04:00) was selected.",
  );
});

test("Use current time preserves zones and refreshes the conversion", async ({
  page,
}) => {
  await page.goto("/time-zone-converter");
  await fillConversion(page, {
    date: "2000-01-01",
    time: "00:00",
    source: "Europe/Madrid",
    target: "Asia/Tokyo",
  });
  await calculate(page);
  await expect(targetTime(page)).not.toHaveText("—");

  await page.getByRole("button", { name: "Use current time" }).click();

  await expect(dateInput(page)).toHaveValue(await deviceDate(page));
  expect(await timeInput(page).inputValue()).toMatch(/^\d{2}:\d{2}$/);
  await expect(sourceZone(page)).toHaveValue("Europe/Madrid");
  await expect(targetZone(page)).toHaveValue("Asia/Tokyo");
  await expect(targetTime(page)).not.toHaveText("—");
  await expect(ambiguousNotice(page)).toBeHidden();
});

test("reset restores the documented defaults and focuses the date", async ({
  page,
}) => {
  await page.goto("/time-zone-converter");
  await fillConversion(page, {
    date: "2026-03-08",
    time: "02:30",
    source: "America/New_York",
    target: "Europe/London",
  });
  await calculate(page);
  await expect(gapError(page)).toBeVisible();

  await page.getByRole("button", { name: "Reset" }).click();

  await expect(gapError(page)).toBeHidden();
  await expect(dateInput(page)).toBeFocused();
  await expect(dateInput(page)).toHaveValue(await deviceDate(page));
  await expect(targetTime(page)).not.toHaveText("—");
  await expect(copy(page)).toBeEnabled();
  const sourceValue = await sourceZone(page).inputValue();
  await expect(targetZone(page)).toHaveValue(
    sourceValue === "UTC" ? "Europe/London" : "UTC",
  );
});

test("validates inputs, zones, and range, then recovers", async ({ page }) => {
  await page.goto("/time-zone-converter");

  await dateInput(page).fill("");
  await calculate(page);
  await expect(page.locator("[data-error-text-date]")).toHaveText(
    "Enter a valid date.",
  );
  await expect(targetTime(page)).toHaveText("—");
  await expect(comparison(page)).toBeHidden();

  await dateInput(page).fill("2026-11-22");
  await timeInput(page).fill("");
  await calculate(page);
  await expect(page.locator("[data-error-text-time]")).toHaveText(
    "Enter a valid time.",
  );

  await dateInput(page).evaluate((element) => {
    (element as HTMLInputElement).value = "1800-01-01";
  });
  await timeInput(page).fill("10:30");
  await calculate(page);
  await expect(page.locator("[data-error-text-date]")).toHaveText(
    "Enter a date between 1900 and 2100.",
  );

  await dateInput(page).fill("2026-11-22");
  await sourceZone(page).evaluate((element) => {
    const select = element as HTMLSelectElement;
    const option = document.createElement("option");
    option.value = "Not/AZone";
    option.textContent = "Bad zone";
    select.append(option);
    select.value = "Not/AZone";
  });
  await calculate(page);
  await expect(page.locator("[data-error-text-source]")).toHaveText(
    "Choose a supported source time zone.",
  );
  await expect(targetTime(page)).toHaveText("—");

  await sourceZone(page).selectOption("UTC");
  await targetZone(page).selectOption("Asia/Kolkata");
  await calculate(page);
  await expect(page.locator("[data-error-source]")).toBeHidden();
  await expect(targetTime(page)).toHaveText("4:00 PM");
});

test("clears stale results when inputs change", async ({ page }) => {
  await page.goto("/time-zone-converter");
  await fillConversion(page, {
    date: "2026-11-22",
    time: "10:30",
    source: "America/New_York",
    target: "Asia/Kolkata",
  });
  await calculate(page);
  await expect(targetTime(page)).toHaveText("9:00 PM");

  await dateInput(page).fill("2026-11-23");

  await expect(targetTime(page)).toHaveText("—");
  await expect(comparison(page)).toBeHidden();
  await expect(comparisonEmpty(page)).toBeVisible();
  await expect(copy(page)).toBeDisabled();
  await expect(ambiguousNotice(page)).toBeHidden();

  await calculate(page);
  await expect(targetTime(page)).not.toHaveText("—");
  await expect(comparison(page)).toBeVisible();
});

test("copies a meaningful summary", async ({ page, browserName }) => {
  await prepareClipboard(page, browserName);
  await page.goto("/time-zone-converter");
  await fillConversion(page, {
    date: "2026-11-22",
    time: "10:30",
    source: "America/New_York",
    target: "Asia/Kolkata",
  });
  await calculate(page);
  await copy(page).click();
  await expect(page.getByText("Copied to clipboard.")).toBeVisible();

  const copied = (
    await page.evaluate(() => navigator.clipboard.readText())
  ).replace(/\r\n/g, "\n");
  expect(copied).toBe(
    "Time zone conversion\n10:30 AM, November 22, 2026 — New York (America/New_York)\n→ 9:00 PM, November 22, 2026 — Kolkata (Asia/Kolkata)\nSource offset: UTC−05:00\nTarget offset: UTC+05:30\nTime difference: 10 h 30 min ahead",
  );
});

test("is keyboard operable with the design-system focus ring", async ({
  page,
  browserName,
}) => {
  await page.goto("/time-zone-converter");
  await fillConversion(page, {
    date: "2026-11-22",
    time: "10:30",
    source: "America/New_York",
    target: "Asia/Kolkata",
  });

  await page.getByRole("heading", { level: 1 }).click();
  await tabTo(page, browserName, dateInput(page));
  await ring(dateInput(page));
  await page.keyboard.press("Enter");

  await expect(targetTime(page)).toHaveText("9:00 PM");
  await expect(comparison(page)).toBeVisible();
});

test("stays usable at 320px with an internally scrolling comparison", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });

  for (const [path, labels] of [
    [
      "/time-zone-converter/",
      {
        date: "Date",
        time: "Time",
        source: "From time zone",
        target: "To time zone",
        calculate: "Calculate",
      },
    ],
    [
      "/es/time-zone-converter/",
      {
        date: "Fecha",
        time: "Hora",
        source: "Zona horaria de origen",
        target: "Zona horaria de destino",
        calculate: "Calcular",
      },
    ],
  ] as const) {
    await page.goto(path);
    await page.getByLabel(labels.date, { exact: true }).fill("2026-11-22");
    await page.getByLabel(labels.time, { exact: true }).fill("10:30");
    await page.getByLabel(labels.source).selectOption("America/New_York");
    await page.getByLabel(labels.target).selectOption("Asia/Kolkata");
    await page.getByRole("button", { name: labels.calculate }).click();

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, `${path} overflows horizontally`).toBeLessThanOrEqual(0);

    const region = comparison(page);
    await expect(region).toBeVisible();
    const metrics = await region.evaluate((element) => ({
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
    }));
    expect(metrics.scrollWidth).toBeGreaterThan(metrics.clientWidth);

    const button = await page
      .getByRole("button", { name: labels.calculate })
      .boundingBox();
    expect(button).not.toBeNull();
    if (button === null) throw new Error("Calculate has no box");
    expect(button.height).toBeGreaterThanOrEqual(44);
  }

  await page.screenshot({
    path: "test-results/time-zone-converter-320.png",
    fullPage: false,
  });
});

test("the Spanish page is localized and handles DST text", async ({ page }) => {
  await page.goto("/es/time-zone-converter");

  await expect(page).toHaveTitle("Conversor de zonas horarias — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Conversor de zonas horarias",
  );
  await expect(page.getByLabel("Fecha", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Hora", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Zona horaria de origen")).toBeVisible();
  await expect(page.getByLabel("Zona horaria de destino")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Usar la hora actual" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Restablecer" })).toBeVisible();

  await page.getByLabel("Fecha", { exact: true }).fill("2026-11-22");
  await page.getByLabel("Hora", { exact: true }).fill("10:30");
  await page
    .getByLabel("Zona horaria de origen")
    .selectOption("America/New_York");
  await page.getByLabel("Zona horaria de destino").selectOption("Asia/Kolkata");
  await page.getByRole("button", { name: "Calcular" }).click();

  await expect(targetTime(page)).toHaveText("21:00");
  await expect(targetZoneValue(page)).toHaveText("Calcuta (Asia/Kolkata)");
  await expect(targetDate(page)).toHaveText("22 de noviembre de 2026");
  await expect(targetWeekday(page)).toHaveText("domingo");
  await expect(sourceOffset(page)).toHaveText("UTC−05:00");
  await expect(targetOffset(page)).toHaveText("UTC+05:30");
  await expect(difference(page)).toHaveText("10 h 30 min por delante");
  await expect(dayChange(page)).toHaveText("Mismo día");
  await expect(caption(page)).toHaveText(
    "Convertido desde las 10:30 del 22 de noviembre de 2026 en Nueva York.",
  );

  await page.getByLabel("Fecha", { exact: true }).fill("2026-03-08");
  await page.getByLabel("Hora", { exact: true }).fill("02:30");
  await page
    .getByLabel("Zona horaria de origen")
    .selectOption("America/New_York");
  await page.getByRole("button", { name: "Calcular" }).click();

  await expect(gapText(page)).toHaveText(
    "Esa hora local no existe en Nueva York porque los relojes se adelantan 1 h por el horario de verano. Elige una hora local válida.",
  );
  await expect(targetTime(page)).toHaveText("—");
});

test("links to related tools and exposes SEO metadata", async ({ page }) => {
  await page.goto("/time-zone-converter");

  const related = page.locator("section").filter({ hasText: "Related tools" });
  await expect(
    related.getByRole("link", { name: /Date Calculator/ }),
  ).toHaveAttribute("href", "/date-calculator/");
  await expect(
    related.getByRole("link", { name: /Age Calculator/ }),
  ).toHaveAttribute("href", "/age-calculator/");
  await expect(related.getByRole("link", { name: "See all" })).toHaveAttribute(
    "href",
    "/date-time/",
  );

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://appkitx.com/time-zone-converter/",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute("href", "https://appkitx.com/time-zone-converter/");
  await expect(
    page.locator('link[rel="alternate"][hreflang="es"]'),
  ).toHaveAttribute("href", "https://appkitx.com/es/time-zone-converter/");
  await expect(
    page.locator('link[rel="alternate"][hreflang="x-default"]'),
  ).toHaveAttribute("href", "https://appkitx.com/time-zone-converter/");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Free time zone converter: convert a date and time between major IANA time zones, with UTC offsets, date changes, and daylight-saving warnings.",
  );

  const documents = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) =>
      scripts.map((script) => JSON.parse(script.textContent ?? "")),
    );
  expect(documents).toHaveLength(2);
  expect(
    documents.find((document) => document["@type"] === "BreadcrumbList"),
  ).toMatchObject({
    itemListElement: [
      { name: "Home", item: "https://appkitx.com/" },
      { name: "Time Zone Converter" },
    ],
  });
  expect(
    documents.find((document) => document["@type"] === "WebApplication"),
  ).toMatchObject({
    name: "Time Zone Converter",
    url: "https://appkitx.com/time-zone-converter/",
    inLanguage: "en",
  });

  await page.goto("/date-calculator");
  const dateRelated = page
    .locator("section")
    .filter({ hasText: "Related tools" });
  await expect(
    dateRelated.getByRole("link", { name: /Time Zone Converter/ }),
  ).toHaveAttribute("href", "/time-zone-converter/");

  await page.goto("/age-calculator");
  const ageRelated = page
    .locator("section")
    .filter({ hasText: "Related tools" });
  await expect(
    ageRelated.getByRole("link", { name: /Time Zone Converter/ }),
  ).toHaveAttribute("href", "/time-zone-converter/");
});

test("is linked from the homepage, category, footer, search, and sitemap", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.locator("#tools").getByRole("link", { name: "Time Zone Converter" }),
  ).toHaveAttribute("href", "/time-zone-converter/");
  await expect(
    page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Time Zone Converter" }),
  ).toHaveAttribute("href", "/time-zone-converter/");

  await page.goto("/date-time/");
  const card = page
    .getByRole("main")
    .getByRole("link")
    .filter({ hasText: "Time Zone Converter" });
  await expect(card).toHaveAttribute("href", "/time-zone-converter/");

  await page.goto("/es/date-time/");
  await expect(
    page
      .getByRole("main")
      .getByRole("link")
      .filter({ hasText: "Conversor de zonas horarias" }),
  ).toHaveAttribute("href", "/es/time-zone-converter/");

  await page.goto("/");
  await page.keyboard.press("Control+k");
  const palette = page.locator("[data-search-palette]");
  await palette.locator("[data-search-input]").fill("time zone");
  await expect(palette.getByRole("option")).toContainText(
    "Time Zone Converter",
  );
  await page.keyboard.press("Escape");

  const sitemap = await page.request.get("/sitemap-0.xml");
  expect(sitemap.status()).toBe(200);
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain("https://appkitx.com/time-zone-converter");
  expect(sitemapText).toContain("https://appkitx.com/es/time-zone-converter");
});

test("keeps the Date and Age calculators working", async ({ page }) => {
  await page.goto("/date-calculator");
  await page.getByLabel("Start date").fill("2026-03-01");
  await page.getByLabel("End date").fill("2026-03-15");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(page.locator("[data-days-value]")).toHaveText("14 days");

  await page.goto("/age-calculator");
  await page.getByLabel("Date of birth").fill("2000-01-01");
  await page.getByRole("button", { name: "Calculate" }).click();
  const age = (await page.locator("[data-age-value]").textContent()) ?? "";
  expect(age).not.toBe("—");
  expect(age).toContain("years");
});

test("keeps the PC Builder development-only and unlisted", async ({
  request,
}) => {
  expect((await request.get("/pc-builder/")).status()).toBe(404);
  expect((await request.get("/es/pc-builder/")).status()).toBe(404);

  const sitemap = await request.get("/sitemap-0.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).not.toContain("pc-builder");
});
