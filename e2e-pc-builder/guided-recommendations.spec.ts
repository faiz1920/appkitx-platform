import { expect, test, type Page } from "@playwright/test";

/*
 * Guided recommendation development-preview tests (M10.4).
 *
 * These run against the same dev-only /pc-builder route as the manual builder
 * suite. They never touch the production build or a public route.
 */

async function openGuided(page: Page): Promise<void> {
  await page
    .locator('label:has(input[name="builder-mode"][value="guided"])')
    .click();
  await expect(page.locator('[data-mode-panel="guided"]')).toBeVisible();
}

async function generate(page: Page, budget = "1400"): Promise<void> {
  await page.locator("#guided-budget").fill(budget);
  await page.getByRole("button", { name: "Generate recommendation" }).click();
  await expect(page.locator("[data-guided-results]")).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/pc-builder");
  await openGuided(page);
});

test("validates the budget before generating a recommendation", async ({
  page,
}) => {
  await expect(page.locator("[data-guided-step]")).toHaveText(
    "Step 1 of 2 — Requirements",
  );

  await page.locator("#guided-budget").fill("0");
  await page.getByRole("button", { name: "Generate recommendation" }).click();

  await expect(page.locator("[data-guided-budget-error]")).toBeVisible();
  await expect(page.locator("[data-guided-budget-error]")).toContainText(
    "greater than 0",
  );
  await expect(page.locator("#guided-budget")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page.locator("[data-guided-results]")).toBeHidden();

  await page.locator("#guided-budget").fill("1400");
  await expect(page.locator("[data-guided-budget-error]")).toBeHidden();
  await page.getByRole("button", { name: "Generate recommendation" }).click();

  await expect(page.locator("[data-guided-results]")).toBeVisible();
  await expect(page.locator("[data-guided-step]")).toHaveText(
    "Step 2 of 2 — Recommendation",
  );
  await expect(page.locator("[data-guided-selection]")).toHaveCount(9);
  await expect(page.locator("[data-guided-result-headline]")).not.toBeEmpty();
  await expect(page.locator("[data-guided-result-status]")).not.toBeEmpty();
  await expect(page.locator("[data-guided-count-incompatible]")).toHaveText(
    "0",
  );
  await expect(page.locator("[data-guided-budget-rows] > tr")).toHaveCount(9);
  await expect(page.locator("[data-guided-budget-note]")).toContainText(
    "no component prices",
  );
  await expect(page.locator("[data-guided-confidence-label]")).toContainText(
    "data confidence",
  );
  await expect(page.locator("[data-guided-transfer]")).toBeEnabled();
  await expect(page.locator("[data-announcer]")).toContainText(
    "Recommendation generated",
  );
});

test("renders compatibility, power, budget, confidence and limitations", async ({
  page,
}) => {
  await generate(page);

  await expect(page.locator("[data-guided-compat-badge]")).not.toBeEmpty();
  await expect(page.locator("[data-guided-count-unknown]")).not.toHaveText("");
  await expect(page.locator("[data-guided-power-load]")).toContainText("W");
  await expect(page.locator("[data-guided-power-recommended]")).toContainText(
    "W",
  );
  await expect(page.locator("[data-guided-power-selected]")).toContainText("W");
  await expect(page.locator("[data-guided-power-headroom]")).toContainText(
    "recommended PSU",
  );
  await expect(page.locator("[data-guided-result-meta]")).toContainText(
    "Price data: Unverified",
  );
  await expect(page.locator("[data-guided-limitations]")).toContainText(
    "no prices",
  );
  await expect(page.locator("[data-guided-limitations]")).toContainText(
    "No benchmark database",
  );
});

test("replaces an individual component with a compatible alternative", async ({
  page,
}) => {
  await generate(page);
  const gpuCard = page.locator('[data-guided-selection="gpu"]');
  const alternative = gpuCard
    .getByRole("button", { name: /alternative/i })
    .first();
  await expect(alternative).toBeVisible();
  const alternativeName = (await alternative.textContent()) ?? "";
  await alternative.click();

  await expect(gpuCard).not.toContainText("Incompatible");
  await expect(gpuCard).toContainText(/Selection fit \d+\/100/);
  await expect(page.locator("[data-guided-power-load]")).toContainText("W");
  await expect(page.locator("[data-announcer]")).toContainText(
    "Replaced Graphics card (GPU)",
  );
  expect(alternativeName.length).toBeGreaterThan(0);
});

test("transfers the recommendation into the existing manual builder", async ({
  page,
}) => {
  await generate(page);
  const gpuName = (
    await page.locator('[data-guided-selection="gpu"] h3').textContent()
  )?.trim();
  expect(gpuName).toBeTruthy();

  await page
    .getByRole("button", { name: "Transfer to manual builder" })
    .click();

  await expect(
    page.getByRole("radio", { name: "Manual", exact: true }),
  ).toBeChecked();
  await expect(page.locator('[data-mode-panel="manual"]')).toBeVisible();
  await expect(page.locator('[data-slot="gpu"]')).toContainText(gpuName!);
  await expect(page.locator("[data-overall-badge]")).not.toHaveText(
    "No components selected",
  );
});

test("requires confirmation before replacing an existing manual build", async ({
  page,
}) => {
  await page
    .locator('label:has(input[name="builder-mode"][value="manual"])')
    .click();
  await page.getByRole("button", { name: "Select CPU", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Select AMD Ryzen 5 5600/ })
    .click();
  await expect(page.locator('[data-slot="cpu"]')).toContainText(
    "AMD Ryzen 5 5600",
  );

  await openGuided(page);
  await generate(page);
  await page
    .getByRole("button", { name: "Transfer to manual builder" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Replace the existing manual build?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.locator('[data-mode-panel="manual"]')).toBeHidden();

  await page
    .getByRole("button", { name: "Transfer to manual builder" })
    .click();
  await page.getByRole("button", { name: "Replace build" }).click();
  await expect(page.locator('[data-mode-panel="manual"]')).toBeVisible();
  await expect(page.locator('[data-slot="cpu"]')).not.toContainText(
    "AMD Ryzen 5 5600",
  );
});

test("keyboard users can edit the budget and generate results", async ({
  page,
}) => {
  const budget = page.locator("#guided-budget");
  await budget.fill("");
  await budget.fill("1500");
  await budget.focus();
  const generateButton = page.getByRole("button", {
    name: "Generate recommendation",
  });
  await generateButton.focus();
  await expect(generateButton).toBeFocused();
  await generateButton.press("Enter");
  await expect(page.locator("[data-guided-results]")).toBeVisible();
  await expect(page.locator("[data-guided-selection]")).toHaveCount(9);
});

test("edits requirements, regenerates, and starts over", async ({ page }) => {
  await generate(page, "1400");
  await page.getByRole("button", { name: "Edit requirements" }).click();
  await expect(page.locator("#guided-budget")).toBeFocused();

  await page.locator("#guided-budget").fill("");
  await page.locator("#guided-budget").fill("3000");
  await expect(page.locator("[data-guided-stale]")).toBeVisible();
  await page.getByRole("button", { name: "Regenerate" }).click();
  await expect(page.locator("[data-guided-results]")).toBeVisible();
  await expect(page.locator("[data-guided-stale]")).toBeHidden();

  await page
    .locator("[data-guided-results]")
    .getByRole("button", { name: "Start over" })
    .click();
  await expect(page.locator("[data-guided-results]")).toBeHidden();
  await expect(page.locator("[data-guided-step]")).toHaveText(
    "Step 1 of 2 — Requirements",
  );
  await expect(page.locator("#guided-budget")).toHaveValue("1200");
});

test("guided layout has no horizontal overflow at 320px and tablet width", async ({
  page,
}) => {
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/pc-builder");
    await openGuided(page);
    await generate(page);

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, `overflow at ${width}px`).toBeLessThanOrEqual(1);
  }
});

test("guided layout is single-column on mobile without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await openGuided(page);
  await generate(page);

  const formGrid = page.locator("[data-guided-form] > div.grid");
  const formColumns = await formGrid.evaluate(
    (element) =>
      getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(formColumns).toBe(1);

  const resultGrid = page.locator("[data-guided-selections]");
  const resultColumns = await resultGrid.evaluate(
    (element) =>
      getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(resultColumns).toBe(1);

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("guided results use two columns on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.reload();
  await openGuided(page);
  await generate(page);

  const resultGrid = page.locator("[data-guided-selections]");
  const columns = await resultGrid.evaluate(
    (element) =>
      getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(columns).toBe(2);
});
