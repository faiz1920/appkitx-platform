import { expect, test, type Locator, type Page } from "@playwright/test";
import { prepareClipboard } from "./clipboard";

/*
 * M7 Phase 2 Age Calculator: age as of the device's local calendar date,
 * birthday-today boundaries, leap-day births, future-date rejection,
 * localized copy, copy feedback, keyboard access, and Spanish localization.
 *
 * Boundary cases run against dynamically computed dates so the suite is
 * deterministic on any run day; the expected totals are computed with plain
 * UTC arithmetic, independent of the tool's own module.
 */

interface DateParts {
  year: number;
  month: number;
  day: number;
}

const isLeap = (year: number) =>
  year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

const pad = (value: number) => String(value).padStart(2, "0");

const todayParts = (): DateParts => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
};

const isoDate = (parts: DateParts) =>
  `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;

const daysBetween = (from: DateParts, to: DateParts) =>
  Math.round(
    (Date.UTC(to.year, to.month - 1, to.day) -
      Date.UTC(from.year, from.month - 1, from.day)) /
      86_400_000,
  );

const addDays = (parts: DateParts, days: number): DateParts => {
  const date = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day + days),
  );
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
};

/* A birth date exactly `yearsAgo` years before today, skipping Feb 29 targets in non-leap years. */
const birthdayBirth = () => {
  const today = todayParts();
  for (const yearsAgo of [30, 28, 32, 36, 24, 40]) {
    const year = today.year - yearsAgo;
    if (today.month === 2 && today.day === 29 && !isLeap(year)) continue;
    return { year, month: today.month, day: today.day, yearsAgo };
  }
  throw new Error("no valid birth year for today's date");
};

const formatDays = (value: number, locale = "en-US") =>
  new Intl.NumberFormat(locale, {
    style: "unit",
    unit: "day",
    unitDisplay: "long",
  }).format(value);

const formatLongDate = (parts: DateParts, locale = "en-US") => {
  const date = new Date(0);
  date.setUTCFullYear(parts.year, parts.month - 1, parts.day);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
};

const ageValue = (page: Page) => page.locator("[data-age-value]");
const daysValue = (page: Page) => page.locator("[data-days-value]");
const caption = (page: Page) => page.locator("[data-result-caption]");
const copy = (page: Page) => page.getByRole("button", { name: "Copy result" });
const birthInput = (page: Page) => page.getByLabel("Date of birth");

const ring = async (locator: Locator) => {
  await expect(locator).toHaveCSS("outline-width", "2px");
  await expect(locator).toHaveCSS("outline-style", "solid");
  await expect(locator).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(locator).toHaveCSS("outline-offset", "2px");
};

test("loads with the correct title, heading, and empty state", async ({
  page,
}) => {
  await page.goto("/age-calculator");

  await expect(page).toHaveTitle("Age Calculator — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Age Calculator",
  );

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );

  await expect(birthInput(page)).toBeVisible();
  await expect(page.locator("#age-calc-hint-birth")).toContainText(
    "Feb 29 birthdays count on Feb 28",
  );
  await expect(ageValue(page)).toHaveText("—");
  await expect(daysValue(page)).toHaveText("—");
  await expect(caption(page)).toHaveText("Results appear here");
  await expect(copy(page)).toBeDisabled();
});

test("increments on the birthday itself as of the local calendar date", async ({
  page,
}) => {
  await page.goto("/age-calculator");

  const birth = birthdayBirth();
  const today = todayParts();

  await birthInput(page).fill(isoDate(birth));
  await page.getByRole("button", { name: "Calculate" }).click();

  await expect(ageValue(page)).toHaveText(
    `${birth.yearsAgo} years, 0 months, and 0 days`,
  );
  await expect(daysValue(page)).toHaveText(
    formatDays(daysBetween(birth, today)),
  );
  await expect(caption(page)).toHaveText(`As of ${formatLongDate(today)}.`);
  await expect(copy(page)).toBeEnabled();

  await page.screenshot({
    path: "test-results/age-calculator-en.png",
    fullPage: true,
  });
});

test("counts the day after a birthday as years, months, and days", async ({
  page,
}) => {
  await page.goto("/age-calculator");

  /* Born yesterday's month/day N years ago: the Nth birthday was yesterday. */
  const birth = addDays(birthdayBirth(), -1);

  await birthInput(page).fill(isoDate(birth));
  await page.getByRole("button", { name: "Calculate" }).click();

  await expect(ageValue(page)).toHaveText(
    `${birthdayBirth().yearsAgo} years, 0 months, and 1 day`,
  );
});

test("rejects empty and future birth dates with localized errors", async ({
  page,
}) => {
  await page.goto("/age-calculator");

  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(page.locator("[data-error-text-birth]")).toHaveText(
    "Enter a date of birth.",
  );
  await expect(birthInput(page)).toHaveAttribute("aria-invalid", "true");
  await expect(ageValue(page)).toHaveText("—");

  const tomorrow = addDays(todayParts(), 1);
  await birthInput(page).fill(isoDate(tomorrow));
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(page.locator("[data-error-text-birth]")).toHaveText(
    "Date of birth can't be in the future.",
  );
  await expect(ageValue(page)).toHaveText("—");
});

test("handles a Feb 29 birth date", async ({ page }) => {
  await page.goto("/age-calculator");

  const birth = { year: 2000, month: 2, day: 29 };
  await birthInput(page).fill(isoDate(birth));
  await page.getByRole("button", { name: "Calculate" }).click();

  await expect(page.locator("[data-error-birth]")).toBeHidden();
  await expect(ageValue(page)).toContainText("years");
  await expect(daysValue(page)).toHaveText(
    formatDays(daysBetween(birth, todayParts())),
  );
});

test("copies the result with accessible success feedback", async ({
  page,
  browserName,
}) => {
  await prepareClipboard(page, browserName);
  await page.goto("/age-calculator");

  const birth = birthdayBirth();
  await birthInput(page).fill(isoDate(birth));
  await page.getByRole("button", { name: "Calculate" }).click();
  await copy(page).click();

  const success = page.locator("[data-copy-status-success]");
  await expect(success).toBeVisible();
  await expect(success).toContainText("Copied to clipboard.");

  const age = await ageValue(page).textContent();
  const days = await daysValue(page).textContent();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied.replace(/\r\n/g, "\n")).toBe(
    `Age: ${age}\nTotal days lived: ${days}`,
  );
});

test("reset clears the result and returns focus to the input", async ({
  page,
}) => {
  await page.goto("/age-calculator");

  await birthInput(page).fill(isoDate(birthdayBirth()));
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(ageValue(page)).not.toHaveText("—");

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(birthInput(page)).toHaveValue("");
  await expect(ageValue(page)).toHaveText("—");
  await expect(caption(page)).toHaveText("Results appear here");
  await expect(copy(page)).toBeDisabled();
  await expect(birthInput(page)).toBeFocused();
});

test("shows the design-system focus ring and 44px targets", async ({
  page,
}) => {
  await page.goto("/age-calculator");

  await birthInput(page).focus();
  await ring(birthInput(page));

  for (const name of ["Calculate", "Reset"]) {
    const box = await page.getByRole("button", { name }).boundingBox();
    if (!box) throw new Error(`${name} button is not visible`);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }

  await page.getByRole("button", { name: "Calculate" }).focus();
  await ring(page.getByRole("button", { name: "Calculate" }));
});

test("the Spanish page is localized and computes", async ({ page }) => {
  await page.goto("/es/age-calculator");

  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Calculadora de edad",
  );
  await expect(page.getByLabel("Fecha de nacimiento")).toBeVisible();
  await expect(page.locator("#age-calc-hint-birth")).toContainText(
    "29 de febrero",
  );

  const birth = { year: 2000, month: 1, day: 15 };
  await page.getByLabel("Fecha de nacimiento").fill(isoDate(birth));
  await page.getByRole("button", { name: "Calcular" }).click();

  await expect(ageValue(page)).toContainText("años");
  await expect(daysValue(page)).toHaveText(
    formatDays(daysBetween(birth, todayParts()), "es-ES"),
  );
  await expect(caption(page)).toContainText("A fecha de ");

  await page.screenshot({
    path: "test-results/age-calculator-es.png",
    fullPage: true,
  });
});

test("keeps layout at 320px in both locales", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });

  for (const path of ["/age-calculator", "/es/age-calculator"]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, `${path} overflows horizontally`).toBeLessThanOrEqual(0);
  }
});
