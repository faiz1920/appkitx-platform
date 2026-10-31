import { expect, test, type Page } from "@playwright/test";

/*
 * PC Builder development-preview UI tests (M10.2).
 *
 * Run with `npm run test:pc-builder`. These tests exercise the real page in
 * a browser against the M10.1 engine; they are separate from the production
 * e2e suite because /pc-builder is only mounted during `astro dev`.
 */

const CATEGORY_LABELS = [
  "CPU",
  "Graphics card (GPU)",
  "Motherboard",
  "RAM",
  "CPU cooler",
  "Storage",
  "Power supply (PSU)",
  "PC case",
  "Case fans",
] as const;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function openCategory(page: Page, label: string): Promise<void> {
  const action = new RegExp(`^(Select|Change|Add) ${escapeRegExp(label)}$`);
  await page.getByRole("button", { name: action }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

async function choose(page: Page, name: string | RegExp): Promise<void> {
  const pattern =
    typeof name === "string"
      ? new RegExp(`^(Select|Add) ${escapeRegExp(name)}`)
      : name;
  await page.getByRole("button", { name: pattern }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
}

async function selectFromCategory(
  page: Page,
  category: string,
  name: string | RegExp,
): Promise<void> {
  await openCategory(page, category);
  await choose(page, name);
}

async function openManual(page: Page): Promise<void> {
  await page
    .locator('label:has(input[name="builder-mode"][value="manual"])')
    .click();
  await expect(page.locator('[data-mode-panel="manual"]')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/pc-builder");
  await openManual(page);
});

test("exposes semantic landmarks, one h1, a skip link and unique ids", async ({
  page,
}) => {
  await expect(page.locator("main#main")).toHaveCount(1);
  await expect(page.getByRole("banner")).toHaveCount(1);
  await expect(page.getByRole("contentinfo")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

  // Scope to the builder: the Astro dev toolbar injects its own duplicate ids.
  const ids = await page
    .locator("[data-pc-builder] [id]")
    .evaluateAll((elements) => elements.map((element) => element.id));
  expect(ids.length).toBeGreaterThan(0);
  expect(new Set(ids).size).toBe(ids.length);

  await page.goto("/pc-builder");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
});

test("renders the development preview with all nine categories and an honest empty state", async ({
  page,
}) => {
  await expect(
    page.getByRole("heading", { level: 1, name: "PC Builder" }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex",
  );

  for (const label of CATEGORY_LABELS) {
    await expect(
      page.getByRole("heading", { level: 3, name: label, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: `Select ${label}`, exact: true }),
    ).toBeVisible();
  }
  await expect(page.getByText("Not selected yet.")).toHaveCount(9);

  await expect(page.locator("[data-overall-badge]")).toHaveText(
    "No components selected",
  );
  await expect(page.locator("[data-count-incompatible]")).toHaveText("0");
  await expect(page.locator("[data-count-warning]")).toHaveText("0");
  await expect(page.locator("[data-count-unknown]")).toHaveText("0");
  await expect(page.locator("[data-load]")).toHaveText("—");
  await expect(page.locator("[data-recommended-psu]")).toHaveText("—");
});

test("opens every category picker and closes it with Escape", async ({
  page,
}) => {
  for (const label of CATEGORY_LABELS) {
    await openCategory(page, label);
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: new RegExp(`^(Select|Add) ${escapeRegExp(label)}$`),
      }),
    ).toBeVisible();
    await expect(
      page.locator("[data-picker-results] > li").first(),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
  }
});

test("searches components by product name and reports empty results", async ({
  page,
}) => {
  await openCategory(page, "CPU");
  const results = page.locator("[data-picker-results] > li");

  await page.getByLabel("Search components").fill("ryzen");
  await expect(results).toHaveCount(9);
  await expect(
    page.getByText("AMD Ryzen 5 5600", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Intel Core i5-13600K", { exact: true }),
  ).toHaveCount(0);

  await page.getByLabel("Search components").fill("intel");
  await expect(results).toHaveCount(7);
  await expect(
    page.getByText("Intel Core i5-13600K", { exact: true }),
  ).toBeVisible();

  await page.getByLabel("Search components").fill("does-not-exist");
  await expect(results).toHaveCount(0);
  await expect(page.locator("[data-picker-empty]")).toBeVisible();
  await expect(page.locator("[data-picker-empty-message]")).toContainText(
    'No components match "does-not-exist"',
  );
  await expect(page.locator("[data-picker-count]")).toHaveText(
    "0 of 16 components match",
  );
});

test("filters components by manufacturer", async ({ page }) => {
  await openCategory(page, "Graphics card (GPU)");
  const results = page.locator("[data-picker-results] > li");

  await page.getByLabel("Manufacturer").selectOption("NVIDIA");
  await expect(results).toHaveCount(5);
  await expect(page.locator("[data-picker-count]")).toHaveText(
    "5 of 15 components match",
  );

  await page.getByLabel("Manufacturer").selectOption("AMD");
  await expect(results).toHaveCount(10);

  // Search and manufacturer filter combine.
  await page.getByLabel("Search components").fill("geforce");
  await expect(results).toHaveCount(0);
  await expect(page.locator("[data-picker-empty-message]")).toContainText(
    "manufacturer AMD",
  );
});

test("selects a component and updates the live build state", async ({
  page,
}) => {
  await selectFromCategory(page, "CPU", /AMD Ryzen 7 7800X3D/);

  await expect(page.locator('[data-slot="cpu"]')).toContainText(
    "AMD Ryzen 7 7800X3D",
  );
  await expect(page.locator('[data-slot="cpu"]')).toContainText(
    "In production",
  );
  await expect(page.locator("[data-overall-badge]")).toHaveText(
    "Not enough data",
  );
  await expect(page.locator("[data-progress]")).toContainText(
    "1 of 9 categories selected",
  );
  await expect(page.locator("[data-selected-summary]")).toHaveText(
    "1 component selected",
  );
  await expect(page.locator("[data-headroom]")).toContainText("20% headroom");
});

test("shows compatible and unknown results with explanations", async ({
  page,
}) => {
  await selectFromCategory(page, "CPU", /AMD Ryzen 7 7800X3D/);
  await selectFromCategory(page, "Motherboard", /MSI B650 TOMAHAWK WIFI/);

  await expect(page.locator("[data-overall-badge]")).toHaveText("Unknown");
  await expect(page.locator("[data-overall-message]")).toContainText(
    "could not be fully verified",
  );
  await expect(page.locator("[data-count-unknown]")).toHaveText("2");
  await expect(page.locator("[data-count-compatible]")).toHaveText("1");

  await expect(page.locator("[data-findings]")).toContainText(
    "BIOS compatibility",
  );
  await expect(page.locator("[data-findings]")).toContainText(
    "Chipset compatibility",
  );
  await expect(
    page.getByText("Show 1 compatible check", { exact: false }),
  ).toBeVisible();
});

test("shows incompatible results for an unsupported CPU socket", async ({
  page,
}) => {
  await selectFromCategory(page, "CPU", /AMD Ryzen 5 5600/);
  await selectFromCategory(page, "Motherboard", /MSI B650 TOMAHAWK WIFI/);

  await expect(page.locator("[data-overall-badge]")).toHaveText("Incompatible");
  await expect(page.locator("[data-overall-message]")).toContainText(
    "confirmed conflict",
  );
  await expect(page.locator("[data-count-incompatible]")).toHaveText("1");
  await expect(page.locator("[data-findings]")).toContainText(
    "cannot be installed",
  );
  await expect(page.locator("[data-findings]")).toContainText(
    "Recommended: Choose a motherboard with the matching CPU socket",
  );
});

test("shows warning-only results without calling them incompatible", async ({
  page,
}) => {
  await selectFromCategory(
    page,
    "Graphics card (GPU)",
    /RTX 4090 Founders Edition/,
  );
  await selectFromCategory(page, "Power supply (PSU)", /Corsair RM750x/);

  await expect(page.locator("[data-overall-badge]")).toHaveText("Warning");
  await expect(page.locator("[data-count-incompatible]")).toHaveText("0");
  await expect(page.locator("[data-findings]")).toContainText(
    "GPU manufacturer recommends at least 850 W",
  );
});

test("reports multiple simultaneous findings", async ({ page }) => {
  await selectFromCategory(page, "CPU", /AMD Ryzen 5 5600/);
  await selectFromCategory(page, "Motherboard", /MSI B650 TOMAHAWK WIFI/);
  await selectFromCategory(
    page,
    "RAM",
    "G.SKILL Ripjaws V 16GB (2 x 8GB) DDR4-3200 CL16",
  );
  await selectFromCategory(
    page,
    "Graphics card (GPU)",
    /RTX 4090 Founders Edition/,
  );
  await selectFromCategory(page, "Power supply (PSU)", /Corsair CV650/);

  const incompatible = Number(
    await page.locator("[data-count-incompatible]").textContent(),
  );
  expect(incompatible).toBeGreaterThanOrEqual(2);

  await expect(page.locator("[data-findings]")).toContainText(
    "cannot be installed",
  );
  await expect(page.locator("[data-findings]")).toContainText("DDR5 memory");
  await expect(page.locator("[data-findings]")).toContainText(
    "16-pin connector",
  );
});

test("removing a component refreshes results without stale findings", async ({
  page,
}) => {
  await selectFromCategory(page, "CPU", /AMD Ryzen 7 7800X3D/);
  await selectFromCategory(page, "Motherboard", /MSI B650 TOMAHAWK WIFI/);
  await expect(page.locator("[data-findings]")).toContainText(
    "BIOS compatibility",
  );

  await page
    .getByRole("button", {
      name: "Remove AMD Ryzen 7 7800X3D from CPU",
    })
    .click();

  await expect(page.locator('[data-slot="cpu"]')).toContainText(
    "Not selected yet.",
  );
  await expect(page.locator("[data-overall-badge]")).toHaveText(
    "Not enough data",
  );
  await expect(page.locator("[data-count-unknown]")).toHaveText("0");
  await expect(page.locator("[data-findings] > li")).toHaveCount(0);
  await expect(page.locator("[data-findings]")).not.toContainText("BIOS");
  await expect(page.locator("[data-selected-summary]")).toHaveText(
    "1 component selected",
  );
});

test("replacing a component preserves the rest of the build", async ({
  page,
}) => {
  await selectFromCategory(page, "CPU", /AMD Ryzen 7 7800X3D/);
  await selectFromCategory(page, "Motherboard", /MSI B650 TOMAHAWK WIFI/);
  await selectFromCategory(
    page,
    "Graphics card (GPU)",
    /RTX 4070 Founders Edition/,
  );

  await openCategory(page, "CPU");
  await choose(page, /AMD Ryzen 5 5600/);

  await expect(page.locator('[data-slot="cpu"]')).toContainText(
    "AMD Ryzen 5 5600",
  );
  await expect(page.locator('[data-slot="cpu"]')).not.toContainText("7800X3D");
  await expect(page.locator('[data-slot="motherboard"]')).toContainText(
    "MSI B650 TOMAHAWK WIFI",
  );
  await expect(page.locator('[data-slot="gpu"]')).toContainText(
    "RTX 4070 Founders Edition",
  );
  await expect(page.locator("[data-progress]")).toContainText(
    "3 of 9 categories selected",
  );
  await expect(page.locator("[data-overall-badge]")).toHaveText("Incompatible");
});

test("multi-slot categories add items, prevent duplicates and remove individually", async ({
  page,
}) => {
  await selectFromCategory(
    page,
    "RAM",
    "Corsair Vengeance 32GB (2 x 16GB) DDR5-6000 CL30",
  );

  await openCategory(page, "RAM");
  await expect(
    page.getByRole("button", {
      name: /Corsair Vengeance 32GB \(2 x 16GB\) DDR5-6000 CL30 is already added/,
    }),
  ).toBeDisabled();
  await choose(page, "G.SKILL Ripjaws V 16GB (2 x 8GB) DDR4-3200 CL16");

  await expect(page.locator('[data-slot="ram"]')).toContainText(
    "Corsair Vengeance",
  );
  await expect(page.locator('[data-slot="ram"]')).toContainText(
    "G.SKILL Ripjaws V",
  );
  await expect(page.locator("[data-slot-meta=ram]")).toHaveText("2 selected");
  await expect(page.locator("[data-selected-summary]")).toHaveText(
    "2 components selected",
  );

  await page
    .getByRole("button", {
      name: "Remove Corsair Vengeance 32GB (2 x 16GB) DDR5-6000 CL30 from RAM",
    })
    .click();
  await expect(page.locator('[data-slot="ram"]')).not.toContainText(
    "Corsair Vengeance",
  );
  await expect(page.locator('[data-slot="ram"]')).toContainText(
    "G.SKILL Ripjaws V",
  );
  await expect(page.locator("[data-slot-meta=ram]")).toHaveText("1 selected");
});

test("complete build evaluates every category without false incompatibilities", async ({
  page,
}) => {
  await selectFromCategory(page, "CPU", /AMD Ryzen 7 7800X3D/);
  await selectFromCategory(page, "Motherboard", /MSI B650 TOMAHAWK WIFI/);
  await selectFromCategory(
    page,
    "RAM",
    "Corsair Vengeance 32GB (2 x 16GB) DDR5-6000 CL30",
  );
  await selectFromCategory(
    page,
    "Graphics card (GPU)",
    /RTX 4070 Founders Edition/,
  );
  await selectFromCategory(page, "CPU cooler", /Noctua NH-D15/);
  await selectFromCategory(page, "Storage", /Samsung 990 PRO 1TB/);
  await selectFromCategory(page, "Power supply (PSU)", /MSI MPG A850G PCIE5/);
  await selectFromCategory(page, "PC case", /Corsair 4000D AIRFLOW/);
  await selectFromCategory(page, "Case fans", /Noctua NF-A12x25 PWM/);

  await expect(page.locator("[data-progress]")).toContainText(
    "9 of 9 categories selected",
  );
  await expect(page.locator("[data-selected-summary]")).toHaveText(
    "9 components selected",
  );
  await expect(page.locator("[data-count-incompatible]")).toHaveText("0");
  await expect(page.locator("[data-count-warning]")).toHaveText("0");
  const unknown = Number(
    await page.locator("[data-count-unknown]").textContent(),
  );
  expect(unknown).toBeGreaterThan(0);
  await expect(page.locator("[data-overall-badge]")).toHaveText("Unknown");

  await expect(page.locator("[data-load]")).toContainText("W");
  await expect(page.locator("[data-recommended-psu]")).toContainText("W");
});

test("power summary separates manufacturer figures from estimates", async ({
  page,
}) => {
  await selectFromCategory(page, "CPU", /AMD Ryzen 7 7800X3D/);
  await selectFromCategory(page, "Motherboard", /MSI B650 TOMAHAWK WIFI/);
  await selectFromCategory(
    page,
    "Graphics card (GPU)",
    /RTX 4070 Founders Edition/,
  );

  // 120 W CPU + 200 W GPU + 50 W motherboard estimate = 370 W
  await expect(page.locator("[data-load]")).toHaveText("370 W");
  await expect(page.locator("[data-recommended-psu]")).toHaveText("444 W");
  await expect(page.locator("[data-headroom]")).toContainText("20% headroom");

  await page.getByText("Power breakdown", { exact: true }).click();
  await expect(page.locator("[data-breakdown-body]")).toContainText(
    "Manufacturer figure",
  );
  await expect(page.locator("[data-breakdown-body]")).toContainText("Estimate");
  await expect(page.locator("[data-assumptions]")).toContainText(
    "generic estimates",
  );
  await expect(page.locator("[data-assumptions]")).toContainText("headroom");
});

test("power summary reports insufficient data instead of guessing", async ({
  page,
}) => {
  await selectFromCategory(page, "PC case", /Corsair 4000D AIRFLOW/);

  await expect(page.locator("[data-load]")).toHaveText("—");
  await expect(page.locator("[data-recommended-psu]")).toHaveText("—");
  await expect(page.locator("[data-assumptions]")).toContainText(
    "No manufacturer power data is available",
  );
  await expect(page.locator("[data-overall-badge]")).toHaveText(
    "Not enough data",
  );
});

test("keyboard users can open the picker, focus search, and return on Escape", async ({
  page,
}) => {
  const trigger = page.getByRole("button", {
    name: "Select CPU",
    exact: true,
  });
  await trigger.focus();
  await page.keyboard.press("Enter");

  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByLabel("Search components")).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("keyboard focus renders the standard focus ring", async ({ page }) => {
  const trigger = page.getByRole("button", {
    name: "Select CPU",
    exact: true,
  });
  await trigger.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");

  const styles = await trigger.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      outlineStyle: computed.outlineStyle,
      outlineWidth: computed.outlineWidth,
      outlineOffset: computed.outlineOffset,
    };
  });
  expect(styles.outlineStyle).toBe("solid");
  expect(styles.outlineWidth).toBe("2px");
  expect(styles.outlineOffset).toBe("2px");
});

test("selection changes are announced politely to assistive technology", async ({
  page,
}) => {
  const announcer = page.locator("[data-announcer]");
  await expect(announcer).toHaveAttribute("role", "status");
  await expect(announcer).toHaveAttribute("aria-live", "polite");

  await selectFromCategory(page, "CPU", /AMD Ryzen 7 7800X3D/);
  await expect(announcer).toContainText("Selected AMD Ryzen 7 7800X3D as CPU.");
  await expect(announcer).toContainText("Not enough data.");
  await expect(announcer).toContainText("0 incompatible");
});

test("status is communicated with text, not colour alone", async ({ page }) => {
  await selectFromCategory(page, "CPU", /AMD Ryzen 5 5600/);
  await selectFromCategory(page, "Motherboard", /MSI B650 TOMAHAWK WIFI/);

  const results = page.locator('aside[aria-label="Build results"]');
  await expect(
    results.getByText("Incompatible", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    results.getByText("Unknown", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    results.getByText("Incompatible", { exact: true }).first(),
  ).toHaveText("Incompatible");
});

test("mobile layout is a single column with no horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await openManual(page);

  const grid = page.locator("[data-pc-builder] > div.grid");
  const columns = await grid.evaluate(
    (element) =>
      getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(columns).toBe(1);

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);

  await openCategory(page, "CPU");
  const box = await page.getByRole("dialog").boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeLessThanOrEqual(390);
  expect(box!.height).toBeLessThanOrEqual(844);
});

test("desktop layout uses the two-column component/results grid", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.reload();
  await openManual(page);

  const grid = page.locator("[data-pc-builder] > div.grid");
  const columns = await grid.evaluate(
    (element) =>
      getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(columns).toBe(2);

  const aside = page.locator("aside[aria-label='Build results']");
  const position = await aside.evaluate(
    (element) => getComputedStyle(element).position,
  );
  expect(position).toBe("sticky");
});

test("clearing the build removes every selection and resets results", async ({
  page,
}) => {
  await selectFromCategory(page, "CPU", /AMD Ryzen 7 7800X3D/);
  await selectFromCategory(page, "Motherboard", /MSI B650 TOMAHAWK WIFI/);
  await expect(page.locator("[data-count-compatible]")).toHaveText("1");

  await page.getByRole("button", { name: "Clear build" }).click();
  await expect(page.locator("[data-confirm-dialog]")).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Clear build", exact: true })
    .click();

  await expect(page.getByText("Not selected yet.")).toHaveCount(9);
  await expect(page.locator("[data-count-compatible]")).toHaveText("0");
  await expect(page.locator("[data-count-unknown]")).toHaveText("0");
  await expect(page.locator("[data-overall-badge]")).toHaveText(
    "No components selected",
  );
  await expect(
    page.getByRole("button", { name: "Clear build" }),
  ).toBeDisabled();
});
