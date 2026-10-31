import { expect, test, type Page } from "@playwright/test";

/*
 * Saved and shareable build tests (M10.5).
 *
 * These run against the development-only /pc-builder preview. Browser storage
 * is isolated per Playwright context, so each test starts with an empty
 * saved-build library unless it saves something itself.
 */

test.use({ permissions: ["clipboard-read", "clipboard-write"] });

async function openManual(page: Page): Promise<void> {
  await page
    .locator('label:has(input[name="builder-mode"][value="manual"])')
    .click();
  await expect(page.locator('[data-mode-panel="manual"]')).toBeVisible();
}

async function pick(
  page: Page,
  category: string,
  componentName: string,
): Promise<void> {
  await page
    .getByRole("button", {
      name: new RegExp(`^(Select|Change|Add) ${category}$`),
    })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog
    .getByRole("button", {
      name: new RegExp(`^(Select|Add) ${componentName}`),
    })
    .click();
  await expect(dialog).toBeHidden();
}

async function selectIntelBuild(page: Page): Promise<void> {
  await openManual(page);
  await pick(page, "CPU", "Intel Core i5-14600K");
  await pick(page, "Motherboard", "Gigabyte Z790 AORUS ELITE AX");
}

async function selectAmdBuild(page: Page): Promise<void> {
  await openManual(page);
  await pick(page, "CPU", "AMD Ryzen 5 7600");
  await pick(page, "Motherboard", "MSI B650 TOMAHAWK WIFI");
}

async function saveAsNew(page: Page, name: string): Promise<void> {
  await page.getByRole("button", { name: "Save as new", exact: true }).click();
  await expect(page.locator("[data-save-dialog]")).toBeVisible();
  await page.locator("#save-build-name").fill(name);
  await page.getByRole("button", { name: "Save build", exact: true }).click();
  await expect(page.locator("[data-save-dialog]")).toBeHidden();
  await expect(page.locator("[data-saved-build-name]")).toContainText(name);
}

async function generateRecommendation(page: Page): Promise<void> {
  await expect(page.locator('[data-mode-panel="guided"]')).toBeVisible();
  await page.locator("#guided-budget").fill("1400");
  await page.getByRole("button", { name: "Generate recommendation" }).click();
  await expect(page.locator("[data-guided-results]")).toBeVisible();
}

async function shareLinkFor(page: Page, name: string): Promise<string> {
  await page
    .getByRole("button", { name: `Share ${name}`, exact: true })
    .click();
  await expect(page.locator("[data-share-dialog]")).toBeVisible();
  const link = await page.locator("[data-share-link]").inputValue();
  await page.locator("[data-share-close]").click();
  await expect(page.locator("[data-share-dialog]")).toBeHidden();
  return link;
}

test.beforeEach(async ({ page }) => {
  await page.goto("/pc-builder");
});

test("shows an honest empty state and disables saving until a build exists", async ({
  page,
}) => {
  await expect(page.locator("[data-saved-empty]")).toBeVisible();
  await expect(page.locator("[data-saved-empty]")).toContainText(
    "No saved builds yet",
  );
  await expect(page.locator("[data-save-new]")).toBeDisabled();
  await expect(page.locator("[data-save-update]")).toBeDisabled();
  await expect(page.locator("[data-share-current]")).toBeDisabled();
  await expect(page.locator("[data-active-saved]")).toContainText(
    "No saved build is active",
  );
});

test("validates a blank saved-build name and keeps the dialog open", async ({
  page,
}) => {
  await selectIntelBuild(page);
  await page.getByRole("button", { name: "Save as new", exact: true }).click();
  await page.locator("#save-build-name").fill("   ");
  await page.getByRole("button", { name: "Save build", exact: true }).click();

  await expect(page.locator("[data-save-dialog]")).toBeVisible();
  await expect(page.locator("[data-save-error]")).toBeVisible();
  await expect(page.locator("[data-save-error]")).toContainText("build name");
  await expect(page.locator("#save-build-name")).toHaveAttribute(
    "aria-invalid",
    "true",
  );

  await page.locator("#save-build-name").fill("Valid name");
  await page.getByRole("button", { name: "Save build", exact: true }).click();
  await expect(page.locator("[data-save-dialog]")).toBeHidden();
  await expect(page.locator("[data-saved-build-name]")).toHaveText(
    "Valid name",
  );
});

test("saves a manual build, persists it and restores it without duplicating state", async ({
  page,
}) => {
  await selectIntelBuild(page);
  await saveAsNew(page, "Intel office build");

  const card = page.locator("[data-saved-build-id]").first();
  await expect(card).toContainText("Intel office build");
  await expect(card).toContainText("Manual");
  await expect(card).toContainText("2 of 2 component(s) resolve");
  await expect(page.locator("[data-active-saved]")).toContainText(
    "Active saved build: Intel office build (Manual). Up to date.",
  );
  await expect(page.locator("[data-save-update]")).toBeEnabled();

  await page.reload();
  await expect(page.locator("[data-saved-build-name]")).toHaveText(
    "Intel office build",
  );
  await page.getByRole("button", { name: "Load Intel office build" }).click();
  await expect(page.locator('[data-mode-panel="manual"]')).toBeVisible();
  await expect(page.locator('[data-slot="cpu"]')).toContainText(
    "Intel Core i5-14600K",
  );
  await expect(page.locator('[data-slot="motherboard"]')).toContainText(
    "Gigabyte Z790 AORUS ELITE AX",
  );
  await expect(page.locator("[data-active-saved]")).toContainText(
    "Active saved build: Intel office build",
  );
});

test("saves a guided recommendation with its provenance", async ({ page }) => {
  await generateRecommendation(page);
  await page
    .locator("[data-guided-results]")
    .getByRole("button", { name: "Save recommendation", exact: true })
    .click();
  await expect(page.locator("[data-save-dialog]")).toBeVisible();
  await expect(page.locator("[data-save-context]")).toContainText(
    "Guided recommendation",
  );
  await page.locator("#save-build-name").fill("Guided 1440p build");
  await page.getByRole("button", { name: "Save build", exact: true }).click();
  await expect(page.locator("[data-save-dialog]")).toBeHidden();

  const card = page.locator("[data-saved-build-id]").first();
  await expect(card).toContainText("Guided 1440p build");
  await expect(card).toContainText("Guided");
  await expect(card).toContainText("9 of 9 component(s) resolve");

  await page.reload();
  await page.getByRole("button", { name: "Load Guided 1440p build" }).click();
  await expect(page.locator('[data-mode-panel="manual"]')).toBeVisible();
  await expect(page.locator('[data-slot="cpu"]')).not.toContainText(
    "Not selected yet",
  );
  await expect(page.locator("[data-active-saved]")).toContainText("(Guided)");
});

test("renames, duplicates and deletes saved builds with confirmation", async ({
  page,
}) => {
  await selectIntelBuild(page);
  await saveAsNew(page, "Original build");

  await page.getByRole("button", { name: "Rename Original build" }).click();
  await expect(page.locator("[data-rename-dialog]")).toBeVisible();
  await page.locator("#rename-build-name").fill("Renamed build");
  await page.getByRole("button", { name: "Rename build", exact: true }).click();
  await expect(page.locator("[data-rename-dialog]")).toBeHidden();
  await expect(
    page
      .locator("[data-saved-build-name]")
      .filter({ hasText: /^Renamed build$/ }),
  ).toHaveCount(1);

  await page.getByRole("button", { name: "Duplicate Renamed build" }).click();
  await expect(page.locator("[data-saved-build-id]")).toHaveCount(2);
  await expect(
    page
      .locator("[data-saved-build-name]")
      .filter({ hasText: /^Renamed build \(copy\)$/ }),
  ).toHaveCount(1);

  await page
    .getByRole("button", { name: "Delete Renamed build (copy)" })
    .click();
  await expect(page.locator("[data-confirm-dialog]")).toBeVisible();
  await expect(page.locator("[data-confirm-title]")).toContainText(
    'Delete "Renamed build (copy)"',
  );
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator("[data-saved-build-id]")).toHaveCount(2);

  await page
    .getByRole("button", { name: "Delete Renamed build (copy)" })
    .click();
  await page.getByRole("button", { name: "Delete build", exact: true }).click();
  await expect(page.locator("[data-confirm-dialog]")).toBeHidden();
  await expect(page.locator("[data-saved-build-id]")).toHaveCount(1);
  await expect(page.locator("[data-saved-build-name]")).toHaveText(
    "Renamed build",
  );
});

test("warns before loading over unsaved manual changes and cancel keeps them", async ({
  page,
}) => {
  await selectIntelBuild(page);
  await saveAsNew(page, "Saved Intel build");

  await page.locator("[data-clear]").click();
  await selectAmdBuild(page);
  await expect(page.locator('[data-slot="cpu"]')).toContainText(
    "AMD Ryzen 5 7600",
  );

  await page.getByRole("button", { name: "Load Saved Intel build" }).click();
  await expect(page.locator("[data-confirm-dialog]")).toBeVisible();
  await expect(page.locator("[data-confirm-message]")).toContainText(
    "unsaved changes",
  );
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator("[data-confirm-dialog]")).toBeHidden();
  await expect(page.locator('[data-slot="cpu"]')).toContainText(
    "AMD Ryzen 5 7600",
  );

  await page.getByRole("button", { name: "Load Saved Intel build" }).click();
  await page.getByRole("button", { name: "Load saved build" }).click();
  await expect(page.locator("[data-confirm-dialog]")).toBeHidden();
  await expect(page.locator('[data-slot="cpu"]')).toContainText(
    "Intel Core i5-14600K",
  );
});

test("updates an existing saved build and preserves its creation time", async ({
  page,
}) => {
  await selectIntelBuild(page);
  await saveAsNew(page, "Updatable build");
  const card = page.locator("[data-saved-build-id]").first();
  const createdLine = await card.getByText(/^Created /).textContent();

  await pick(page, "CPU", "Intel Core i5-13600K");
  await expect(page.locator("[data-active-saved]")).toContainText(
    "Modified since the last save",
  );
  await page.getByRole("button", { name: "Update saved build" }).click();
  await expect(page.locator("[data-saved-build-id]")).toHaveCount(1);
  await expect(page.locator("[data-saved-build-id]")).toContainText(
    "Intel Core i5-13600K",
  );
  await expect(page.locator("[data-active-saved]")).toContainText("Up to date");
  await expect(
    page.locator("[data-saved-build-id]").getByText(/^Created /),
  ).toHaveText(createdLine ?? "");
});

test("generates a fragment share link and copies it", async ({ page }) => {
  await selectIntelBuild(page);
  await saveAsNew(page, "Shareable build");

  await page.getByRole("button", { name: "Share Shareable build" }).click();
  await expect(page.locator("[data-share-dialog]")).toBeVisible();
  const link = await page.locator("[data-share-link]").inputValue();
  expect(link).toContain("/pc-builder#build=");
  expect(link).not.toContain("?build=");
  expect(link).not.toContain("Shareable build");

  await page.getByRole("button", { name: "Copy link", exact: true }).click();
  await expect(page.locator("[data-share-feedback]")).toHaveText(
    "Link copied to the clipboard.",
  );
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe(link);
});

test("opens a shared build read-only and imports it explicitly", async ({
  page,
}) => {
  await selectIntelBuild(page);
  await saveAsNew(page, "Imported build");
  const link = await shareLinkFor(page, "Imported build");

  await page.goto(link);
  await expect(page.locator("[data-shared-view]")).toBeVisible();
  await expect(page.locator('[data-mode-panel="manual"]')).toBeHidden();
  await expect(page.locator("[data-saved-builds]")).toBeHidden();
  await expect(page.locator("[data-clear]")).toBeHidden();
  await expect(page.locator("[data-progress]")).toBeHidden();
  await expect(page.locator("[data-shared-name]")).toHaveText("Imported build");
  await expect(page.locator("[data-shared-source]")).toContainText("Manual");
  await expect(page.locator("[data-shared-component]")).toHaveCount(2);
  await expect(page.locator("[data-shared-compat-badge]")).not.toBeEmpty();
  await expect(page.locator("[data-shared-limitations]")).toContainText(
    "no quote",
  );
  await expect(page.locator('[data-slot="cpu"]')).toBeHidden();

  await page.locator("[data-shared-import]").click();
  await expect(page.locator("[data-shared-view]")).toBeHidden();
  await expect(page.locator('[data-mode-panel="manual"]')).toBeVisible();
  await expect(page.locator('[data-slot="cpu"]')).toContainText(
    "Intel Core i5-14600K",
  );
  expect(new URL(page.url()).hash).toBe("");
});

test("saves a local copy from a shared view in a fresh browser context", async ({
  page,
  browser,
}) => {
  await selectIntelBuild(page);
  await saveAsNew(page, "Portable build");
  const link = await shareLinkFor(page, "Portable build");

  const isolated = await browser.newContext();
  try {
    const sharedPage = await isolated.newPage();
    await sharedPage.goto(link);
    await expect(sharedPage.locator("[data-shared-view]")).toBeVisible();
    await expect(sharedPage.locator("[data-saved-empty]")).toBeHidden();

    await sharedPage.locator("[data-shared-save]").click();
    await expect(sharedPage.locator("[data-shared-feedback]")).toContainText(
      "Saved a copy",
    );
    await sharedPage.getByRole("button", { name: "Return to builder" }).click();
    await expect(sharedPage.locator("[data-saved-builds]")).toBeVisible();
    await expect(sharedPage.locator("[data-saved-build-name]")).toHaveText(
      "Portable build",
    );
    await expect(sharedPage.locator("[data-active-saved]")).toContainText(
      "No saved build is active",
    );
  } finally {
    await isolated.close();
  }
});

test("shows a useful error for a malformed share payload and allows return", async ({
  page,
}) => {
  await page.goto("/pc-builder#build=not-valid!");
  await expect(page.locator("[data-shared-view]")).toBeVisible();
  await expect(page.locator("[data-shared-error]")).toBeVisible();
  await expect(page.locator("[data-shared-error]")).toContainText(
    "valid URL-safe base64",
  );
  await expect(page.locator("[data-saved-builds]")).toBeHidden();

  await page.getByRole("button", { name: "Return to builder" }).click();
  await expect(page.locator("[data-shared-view]")).toBeHidden();
  await expect(page.locator("[data-saved-builds]")).toBeVisible();
  expect(new URL(page.url()).hash).toBe("");
});

test("requires confirmation before importing over an existing manual build", async ({
  page,
}) => {
  await selectIntelBuild(page);
  await saveAsNew(page, "Shared Intel build");
  const link = await shareLinkFor(page, "Shared Intel build");
  const hash = new URL(link).hash;

  await page.locator("[data-clear]").click();
  await selectAmdBuild(page);
  await expect(page.locator('[data-slot="cpu"]')).toContainText(
    "AMD Ryzen 5 7600",
  );

  await page.evaluate((nextHash) => {
    window.location.hash = nextHash;
  }, hash);
  await expect(page.locator("[data-shared-view]")).toBeVisible();
  await page.locator("[data-shared-import]").click();
  await expect(page.locator("[data-confirm-dialog]")).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator("[data-shared-view]")).toBeVisible();

  await page.getByRole("button", { name: "Return to builder" }).click();
  await expect(page.locator('[data-slot="cpu"]')).toContainText(
    "AMD Ryzen 5 7600",
  );

  await page.evaluate((nextHash) => {
    window.location.hash = nextHash;
  }, hash);
  await expect(page.locator("[data-shared-view]")).toBeVisible();
  await page.locator("[data-shared-import]").click();
  await page.getByRole("button", { name: "Import and replace" }).click();
  await expect(page.locator("[data-shared-view]")).toBeHidden();
  await expect(page.locator('[data-slot="cpu"]')).toContainText(
    "Intel Core i5-14600K",
  );
});

test("saved builds and the shared view have no horizontal overflow at responsive widths", async ({
  page,
}) => {
  await selectIntelBuild(page);
  await saveAsNew(page, "Responsive build with a reasonably long name");

  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/pc-builder");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, `overflow at ${width}px`).toBeLessThanOrEqual(1);
    await expect(page.locator("[data-saved-build-name]")).toBeVisible();
  }

  const columns = await page
    .locator("[data-saved-list]")
    .evaluate(
      (element) =>
        getComputedStyle(element).gridTemplateColumns.split(" ").length,
    );
  expect(columns).toBe(2);

  const link = await shareLinkFor(
    page,
    "Responsive build with a reasonably long name",
  );
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(link);
    await expect(page.locator("[data-shared-view]")).toBeVisible();
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, `shared overflow at ${width}px`).toBeLessThanOrEqual(1);
  }
});

test("keyboard users can save and rename a build", async ({ page }) => {
  await selectIntelBuild(page);
  const save = page.getByRole("button", { name: "Save as new", exact: true });
  await save.focus();
  await save.press("Enter");
  await expect(page.locator("[data-save-dialog]")).toBeVisible();
  await expect(page.locator("#save-build-name")).toBeFocused();
  await page.locator("#save-build-name").fill("Keyboard build");
  await page.locator("#save-build-name").press("Enter");
  await expect(page.locator("[data-save-dialog]")).toBeHidden();
  await expect(page.locator("[data-saved-build-name]")).toHaveText(
    "Keyboard build",
  );

  const rename = page.getByRole("button", { name: "Rename Keyboard build" });
  await rename.focus();
  await rename.press("Enter");
  await expect(page.locator("#rename-build-name")).toBeFocused();
  await page.locator("#rename-build-name").fill("Keyboard renamed");
  await page.locator("#rename-build-name").press("Enter");
  await expect(page.locator("[data-rename-dialog]")).toBeHidden();
  await expect(page.locator("[data-saved-build-name]")).toHaveText(
    "Keyboard renamed",
  );
});
