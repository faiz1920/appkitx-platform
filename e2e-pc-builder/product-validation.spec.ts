import { expect, test, type Page } from "@playwright/test";

/*
 * M10.6 product validation journeys.
 *
 * These tests exercise the complete development-preview experience:
 * guided recommendations -> manual customisation -> save -> share -> restore.
 * Tests tagged @cross-browser also run in Firefox and WebKit (see
 * playwright.pc-builder.config.ts). Clipboard-specific assertions stay in the
 * Chromium-only saved-builds suite because permission support differs.
 */

const CATEGORY_LABELS = {
  cpu: "CPU",
  gpu: "Graphics card (GPU)",
  motherboard: "Motherboard",
  ram: "RAM",
  cooler: "CPU cooler",
  storage: "Storage",
  psu: "Power supply (PSU)",
  case: "PC case",
  "case-fan": "Case fans",
} as const;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function openManual(page: Page): Promise<void> {
  await page
    .locator('label:has(input[name="builder-mode"][value="manual"])')
    .click();
  await expect(page.locator('[data-mode-panel="manual"]')).toBeVisible();
}

async function openGuided(page: Page): Promise<void> {
  await page
    .locator('label:has(input[name="builder-mode"][value="guided"])')
    .click();
  await expect(page.locator('[data-mode-panel="guided"]')).toBeVisible();
}

async function generate(page: Page, budget = "1400"): Promise<void> {
  if (await page.locator("[data-guided-results]").isVisible()) {
    await page.getByRole("button", { name: "Edit requirements" }).click();
  }
  await page.locator("#guided-budget").fill(budget);
  await page.getByRole("button", { name: "Generate recommendation" }).click();
  await expect(page.locator("[data-guided-results]")).toBeVisible();
  await expect(page.locator("[data-guided-selection]")).toHaveCount(9);
}

async function openPicker(page: Page, category: string): Promise<void> {
  await page
    .getByRole("button", {
      name: new RegExp(`^(Select|Change|Add) ${escapeRegExp(category)}$`),
    })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

async function pick(page: Page, category: string, name: string): Promise<void> {
  await openPicker(page, category);
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("button", {
      name: new RegExp(
        `^(Select|Add) ${escapeRegExp(name)}(?: to the build)?$`,
      ),
    })
    .click();
  await expect(dialog).toBeHidden();
}

async function saveAsNew(page: Page, name: string): Promise<void> {
  await page.getByRole("button", { name: "Save as new", exact: true }).click();
  await expect(page.locator("[data-save-dialog]")).toBeVisible();
  await page.locator("#save-build-name").fill(name);
  await page.getByRole("button", { name: "Save build", exact: true }).click();
  await expect(page.locator("[data-save-dialog]")).toBeHidden();
  await expect(
    page
      .locator("[data-saved-build-name]")
      .filter({ hasText: new RegExp(`^${escapeRegExp(name)}$`) }),
  ).toHaveCount(1);
}

async function shareLinkFor(page: Page, name: string): Promise<string> {
  await page.getByRole("button", { name: `Share ${name}` }).click();
  await expect(page.locator("[data-share-dialog]")).toBeVisible();
  const link = await page.locator("[data-share-link]").inputValue();
  await page.locator("[data-share-close]").click();
  await expect(page.locator("[data-share-dialog]")).toBeHidden();
  return link;
}

async function clearManual(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Clear build", exact: true }).click();
  const dialog = page.locator("[data-confirm-dialog]");
  if (await dialog.isVisible()) {
    await dialog
      .getByRole("button", { name: "Clear build", exact: true })
      .click();
  }
  await expect(page.getByText("Not selected yet.")).toHaveCount(9);
}

/** Build a deterministic compact share payload in the URL fragment. */
function shareHash(payload: unknown): string {
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  return `#build=${encoded}`;
}

test.beforeEach(async ({ page }) => {
  await page.goto("/pc-builder");
});

test.describe("journey 1: first-time guided user @cross-browser", () => {
  test("builds, inspects, replaces a component and regenerates", async ({
    page,
  }) => {
    await expect(page.locator("#guided-budget")).toHaveValue("1200");
    await expect(page.locator("[data-guided-requirements]")).toBeVisible();

    await page.locator("#guided-budget").fill("1400");
    await page.locator("#guided-use-case").selectOption("gaming");
    await page.locator("#guided-resolution").selectOption("1440p");
    await page.locator("#guided-priority").selectOption("balanced");
    await page.getByRole("button", { name: "Generate recommendation" }).click();

    await expect(page.locator("[data-guided-results]")).toBeVisible();
    await expect(page.locator("[data-guided-requirements]")).toBeHidden();
    await expect(page.locator("[data-guided-selection]")).toHaveCount(9);
    await expect(page.locator("[data-guided-result-headline]")).not.toBeEmpty();
    await expect(page.locator("[data-guided-result-status]")).not.toBeEmpty();
    await expect(
      page.locator("[data-guided-selections-heading]"),
    ).toBeVisible();
    await expect(
      page.locator("[data-guided-selections-heading]"),
    ).toContainText("not a benchmark, FPS estimate or price score");

    // All nine selected categories are inspectable.
    for (const category of Object.keys(CATEGORY_LABELS) as Array<
      keyof typeof CATEGORY_LABELS
    >) {
      const card = page.locator(`[data-guided-selection="${category}"]`);
      await expect(card).toBeVisible();
      await expect(card.locator("h3")).not.toBeEmpty();
      await expect(card).toContainText(/Selection fit \d+\/100/);
    }

    // The summary precedes the component list so it is immediately readable.
    const compatibilityTop = await page
      .locator("#guided-compat-heading")
      .evaluate((element) => element.getBoundingClientRect().top + scrollY);
    const selectionsTop = await page
      .locator("[data-guided-selections]")
      .evaluate((element) => element.getBoundingClientRect().top + scrollY);
    expect(compatibilityTop).toBeLessThan(selectionsTop);

    await expect(page.locator("[data-guided-count-incompatible]")).toHaveText(
      "0",
    );
    await expect(page.locator("[data-guided-power-load]")).toContainText("W");
    await expect(page.locator("[data-guided-power-recommended]")).toContainText(
      "W",
    );
    await expect(page.locator("[data-guided-limitations]")).toContainText(
      "No benchmark database",
    );
    await expect(page.locator("[data-guided-limitations]")).toContainText(
      "no prices",
    );

    // Alternatives are collapsed by default but remain discoverable.
    const gpuCard = page.locator('[data-guided-selection="gpu"]');
    const alternatives = gpuCard.locator("details[data-guided-alternatives]");
    await expect(alternatives).toBeVisible();
    await expect(alternatives).not.toHaveAttribute("open", "");
    await alternatives.locator("summary").click();
    const alternative = gpuCard
      .getByRole("button", { name: /alternative/i })
      .first();
    await expect(alternative).toBeVisible();
    const alternativeName = (await alternative.textContent()) ?? "";
    const previousGpu = await gpuCard.locator("h3").textContent();
    await alternative.click();
    await expect(gpuCard.locator("h3")).not.toHaveText(previousGpu ?? "");
    expect(alternativeName.length).toBeGreaterThan(0);
    await expect(page.locator("[data-announcer]")).toContainText(
      "Replaced Graphics card (GPU)",
    );

    // Returning to the requirements clears the stale result.
    await page.getByRole("button", { name: "Edit requirements" }).click();
    await expect(page.locator("#guided-budget")).toBeFocused();
    await page.locator("#guided-budget").fill("1800");
    await expect(page.locator("[data-guided-results]")).toBeHidden();
    await expect(page.locator("[data-guided-stale]")).toBeVisible();
    await page.getByRole("button", { name: "Generate recommendation" }).click();
    await expect(page.locator("[data-guided-results]")).toBeVisible();
    await expect(page.locator("[data-guided-stale]")).toBeHidden();
  });
});

test.describe("journey 2: experienced manual builder @cross-browser", () => {
  test("searches, adds multi-slot parts, repairs incompatibility and removes", async ({
    page,
  }) => {
    await openManual(page);

    // Search narrows the CPU catalogue before selection.
    await openPicker(page, "CPU");
    const pickerResults = page.locator("[data-picker-results] > li");
    await page.getByLabel("Search components").fill("intel");
    await expect(pickerResults.first()).toBeVisible();
    await expect(page.locator("[data-picker-count]")).toContainText("match");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /Select Intel Core i5-14600K/ })
      .click();
    await expect(page.getByRole("dialog")).toBeHidden();

    await pick(page, "Motherboard", "Gigabyte Z790 AORUS ELITE AX");
    await pick(page, "RAM", "Corsair Vengeance 32GB (2 x 16GB) DDR5-6000 CL30");
    await pick(page, "RAM", "G.SKILL Flare X5 32GB (2 x 16GB) DDR5-6000 CL30");
    await expect(page.locator('[data-slot-meta="ram"]')).toHaveText(
      "2 selected",
    );
    await expect(page.locator("[data-selected-summary]")).toHaveText(
      "4 components selected",
    );

    // The compatible Intel socket passes; the BIOS check remains Unknown.
    await expect(page.locator("[data-overall-badge]")).toHaveText("Unknown");
    await expect(page.locator("[data-count-incompatible]")).toHaveText("0");

    // Introduce a confirmed CPU/motherboard conflict.
    await pick(page, "Motherboard", "MSI B650 TOMAHAWK WIFI");
    await expect(page.locator("[data-overall-badge]")).toHaveText(
      "Incompatible",
    );
    await expect(page.locator("[data-overall-message]")).toContainText(
      "confirmed conflict",
    );
    await expect(page.locator("[data-findings]")).toContainText(
      "cannot be installed",
    );

    // The picker explains the conflict before a replacement is chosen.
    await openPicker(page, "CPU");
    await expect(
      page
        .locator("[data-picker-results] p")
        .filter({ hasText: "With the current build: Incompatible" })
        .first(),
    ).toBeVisible();
    await page.keyboard.press("Escape");

    // Replace the motherboard with a compatible board and recheck power.
    const loadBefore = await page.locator("[data-load]").textContent();
    await pick(page, "Motherboard", "Gigabyte Z790 AORUS ELITE AX");
    await expect(page.locator("[data-overall-badge]")).toHaveText("Unknown");
    await expect(page.locator("[data-count-incompatible]")).toHaveText("0");
    await expect(page.locator("[data-load]")).toContainText("W");
    expect(loadBefore).toContain("W");

    // Removing a multi-slot item updates counts and state consistently.
    await page
      .getByRole("button", {
        name: "Remove G.SKILL Flare X5 32GB (2 x 16GB) DDR5-6000 CL30 from RAM",
      })
      .click();
    await expect(page.locator('[data-slot-meta="ram"]')).toHaveText(
      "1 selected",
    );
    await expect(page.locator("[data-selected-summary]")).toHaveText(
      "3 components selected",
    );

    // Remove the CPU and confirm no stale findings remain.
    await page
      .getByRole("button", {
        name: "Remove Intel Core i5-14600K from CPU",
      })
      .click();
    await expect(page.locator('[data-slot="cpu"]')).toContainText(
      "Not selected yet.",
    );
    await expect(page.locator("[data-count-unknown]")).toHaveText("0");
    await expect(page.locator("[data-findings] > li")).toHaveCount(0);

    // Mobile users still see the live build status while scrolling.
    await page.setViewportSize({ width: 390, height: 844 });
    await pick(page, "CPU", "Intel Core i5-14600K");
    await expect(page.locator("[data-mobile-status]")).toBeVisible();
    await expect(page.locator("[data-mobile-badge]")).toHaveText("Unknown");
    await expect(page.locator("[data-mobile-counts]")).toContainText("unknown");
    await page.getByRole("button", { name: "Details" }).click();
    await expect(page.locator("#compatibility-heading")).toBeFocused();
  });
});

test.describe("journey 3: guided to manual transition @cross-browser", () => {
  test("transfers without corrupting the recommendation state", async ({
    page,
  }) => {
    await generate(page);
    const recommendedGpu = (
      await page.locator('[data-guided-selection="gpu"] h3').textContent()
    )?.trim();
    const recommendedCpu = (
      await page.locator('[data-guided-selection="cpu"] h3').textContent()
    )?.trim();
    expect(recommendedGpu).toBeTruthy();
    expect(recommendedCpu).toBeTruthy();

    await page
      .getByRole("button", { name: "Transfer to manual builder" })
      .click();
    await expect(page.locator('[data-mode-panel="manual"]')).toBeVisible();
    await expect(page.locator('[data-slot="gpu"]')).toContainText(
      recommendedGpu!,
    );
    await expect(page.locator('[data-slot="cpu"]')).toContainText(
      recommendedCpu!,
    );

    // Saving the transferred build in Manual mode makes it active and
    // updateable even though its provenance stays Guided.
    await saveAsNew(page, "Transferred guided build");
    await expect(page.locator("[data-active-saved]")).toContainText(
      "Active saved build: Transferred guided build (Guided). Up to date.",
    );
    await expect(page.locator("[data-save-update]")).toBeEnabled();

    // Replacing a manual component does not alter the guided recommendation.
    await pick(
      page,
      "Graphics card (GPU)",
      "NVIDIA GeForce RTX 4070 Founders Edition",
    );
    await expect(page.locator('[data-slot="gpu"]')).toContainText(
      "NVIDIA GeForce RTX 4070 Founders Edition",
    );
    await expect(page.locator("[data-active-saved]")).toContainText(
      "Modified since the last save",
    );

    await openGuided(page);
    await expect(page.locator("[data-guided-results]")).toBeVisible();
    await expect(page.locator('[data-guided-selection="gpu"] h3')).toHaveText(
      recommendedGpu!,
    );
    await expect(page.locator('[data-guided-selection="cpu"] h3')).toHaveText(
      recommendedCpu!,
    );

    // A second transfer asks before replacing the existing manual build.
    await page
      .getByRole("button", { name: "Transfer to manual builder" })
      .click();
    const dialog = page.getByRole("dialog", {
      name: "Replace the existing manual build?",
    });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await openManual(page);
    await expect(page.locator('[data-slot="gpu"]')).toContainText(
      "NVIDIA GeForce RTX 4070 Founders Edition",
    );
  });
});

test.describe("journey 4: save and restore @cross-browser", () => {
  test("saves, tracks modifications, updates, renames, duplicates and restores", async ({
    page,
  }) => {
    await openManual(page);
    await pick(page, "CPU", "Intel Core i5-14600K");
    await pick(page, "Motherboard", "Gigabyte Z790 AORUS ELITE AX");
    await saveAsNew(page, "Daily workstation");

    await expect(page.locator("[data-active-saved]")).toContainText(
      "Active saved build: Daily workstation (Manual). Up to date.",
    );
    await expect(page.locator("[data-save-update]")).toBeEnabled();

    await pick(page, "CPU", "Intel Core i5-13600K");
    await expect(page.locator("[data-active-saved]")).toContainText(
      "Modified since the last save",
    );
    await page.getByRole("button", { name: "Update saved build" }).click();
    await expect(page.locator("[data-active-saved]")).toContainText(
      "Up to date",
    );
    await expect(page.locator("[data-saved-build-id]")).toContainText(
      "Intel Core i5-13600K",
    );

    // Save the modified build as a second entry.
    await saveAsNew(page, "Second workstation");
    await expect(page.locator("[data-saved-build-id]")).toHaveCount(2);
    await expect(page.locator("[data-active-saved]")).toContainText(
      "Active saved build: Second workstation",
    );

    // Rename and verify focus is restored to the re-rendered card.
    await page
      .getByRole("button", { name: "Rename Daily workstation" })
      .click();
    await page.locator("#rename-build-name").fill("Primary workstation");
    await page
      .getByRole("button", { name: "Rename build", exact: true })
      .click();
    await expect(page.locator("[data-rename-dialog]")).toBeHidden();
    await expect(
      page.getByRole("button", { name: "Rename Primary workstation" }),
    ).toBeFocused();

    await page
      .getByRole("button", { name: "Duplicate Primary workstation" })
      .click();
    await expect(page.locator("[data-saved-build-id]")).toHaveCount(3);
    await expect(
      page.getByRole("button", { name: "Rename Primary workstation (copy)" }),
    ).toBeFocused();

    await page
      .getByRole("button", { name: "Delete Primary workstation (copy)" })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Delete build", exact: true })
      .click();
    await expect(page.locator("[data-saved-build-id]")).toHaveCount(2);
    await expect(
      page.getByRole("button", { name: "Rename Primary workstation" }),
    ).toBeFocused();

    // Reload the original and verify every selection is restored.
    await clearManual(page);
    await page
      .getByRole("button", { name: "Load Primary workstation" })
      .click();
    await expect(page.locator('[data-slot="cpu"]')).toContainText(
      "Intel Core i5-13600K",
    );
    await expect(page.locator('[data-slot="motherboard"]')).toContainText(
      "Gigabyte Z790 AORUS ELITE AX",
    );
    await expect(page.locator("[data-active-saved]")).toContainText(
      "Active saved build: Primary workstation",
    );

    await page.reload();
    await expect(page.locator("[data-saved-build-id]")).toHaveCount(2);
    await expect(
      page
        .locator("[data-saved-build-name]")
        .filter({ hasText: /^Primary workstation$/ }),
    ).toHaveCount(1);
  });
});

test.describe("journey 5: share and import @cross-browser", () => {
  test("shares read-only, saves a copy and imports only after confirmation", async ({
    page,
    browser,
  }) => {
    await openManual(page);
    await pick(page, "CPU", "AMD Ryzen 5 7600");
    await pick(page, "Motherboard", "MSI B650 TOMAHAWK WIFI");
    await saveAsNew(page, "Portable AMD build");
    const link = await shareLinkFor(page, "Portable AMD build");

    expect(link).toContain("/pc-builder#build=");
    expect(link).not.toContain("?build=");
    expect(link).not.toContain("Portable AMD build");

    const isolated = await browser.newContext();
    try {
      const sharedPage = await isolated.newPage();
      await sharedPage.goto(link);
      await expect(sharedPage.locator("[data-shared-view]")).toBeVisible();
      await expect(
        sharedPage.locator('[data-mode-panel="manual"]'),
      ).toBeHidden();
      await expect(sharedPage.locator("[data-saved-builds]")).toBeHidden();
      await expect(sharedPage.locator("[data-shared-name]")).toHaveText(
        "Portable AMD build",
      );
      await expect(sharedPage.locator("[data-shared-component]")).toHaveCount(
        2,
      );
      await expect(sharedPage.locator("[data-shared-compat-badge]")).toHaveText(
        "Unknown",
      );
      await expect(
        sharedPage.locator("[data-shared-power-load]"),
      ).toContainText("W");
      await expect(
        sharedPage.locator("[data-shared-limitations]"),
      ).toContainText("no quote");

      await sharedPage.locator("[data-shared-save]").click();
      await expect(sharedPage.locator("[data-shared-feedback]")).toContainText(
        "Saved a copy",
      );
      await sharedPage
        .getByRole("button", { name: "Return to builder" })
        .click();
      await expect(sharedPage.locator("[data-saved-build-name]")).toHaveText(
        "Portable AMD build",
      );

      await sharedPage.goto(link);
      await sharedPage.locator("[data-shared-import]").click();
      await expect(sharedPage.locator("[data-shared-view]")).toBeHidden();
      await expect(sharedPage.locator('[data-slot="cpu"]')).toContainText(
        "AMD Ryzen 5 7600",
      );
      await expect(
        sharedPage.locator('[data-slot="motherboard"]'),
      ).toContainText("MSI B650 TOMAHAWK WIFI");
    } finally {
      await isolated.close();
    }

    // Importing over a different build requires explicit confirmation.
    await clearManual(page);
    await pick(page, "CPU", "Intel Core i5-14600K");
    await pick(page, "Motherboard", "Gigabyte Z790 AORUS ELITE AX");
    const hash = new URL(link).hash;
    await page.evaluate((nextHash) => {
      window.location.hash = nextHash;
    }, hash);
    await expect(page.locator("[data-shared-view]")).toBeVisible();
    await page.locator("[data-shared-import]").click();
    const confirm = page.locator("[data-confirm-dialog]");
    await expect(confirm).toBeVisible();
    await confirm.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(page.locator("[data-shared-view]")).toBeVisible();
    await page.getByRole("button", { name: "Return to builder" }).click();
    await expect(page.locator('[data-slot="cpu"]')).toContainText(
      "Intel Core i5-14600K",
    );

    await page.evaluate((nextHash) => {
      window.location.hash = nextHash;
    }, hash);
    await page.locator("[data-shared-import]").click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Import and replace" })
      .click();
    await expect(page.locator("[data-shared-view]")).toBeHidden();
    await expect(page.locator('[data-slot="cpu"]')).toContainText(
      "AMD Ryzen 5 7600",
    );
  });
});

test.describe("browser navigation @cross-browser", () => {
  test("back and forward switch the shared view without mutating the build", async ({
    page,
  }) => {
    await openManual(page);
    await pick(page, "CPU", "AMD Ryzen 5 7600");
    await saveAsNew(page, "History build");
    const link = await shareLinkFor(page, "History build");

    await page.goto(link);
    await expect(page.locator("[data-shared-view]")).toBeVisible();
    await expect(page.locator("[data-saved-builds]")).toBeHidden();

    await page.goBack();
    await expect(page.locator("[data-shared-view]")).toBeHidden();
    await expect(page.locator("[data-saved-builds]")).toBeVisible();
    await expect(page.locator('[data-slot="cpu"]')).toContainText(
      "AMD Ryzen 5 7600",
    );

    await page.goForward();
    await expect(page.locator("[data-shared-view]")).toBeVisible();
    await expect(page.locator("[data-shared-name]")).toHaveText(
      "History build",
    );
  });
});

test.describe("journey 6: invalid and outdated data @cross-browser", () => {
  test("rejects malformed, oversized and unsupported share payloads", async ({
    page,
  }) => {
    await page.goto("/pc-builder#build=not-valid!");
    await expect(page.locator("[data-shared-view]")).toBeVisible();
    await expect(page.locator("[data-shared-error]")).toBeVisible();
    await expect(page.locator("[data-shared-error-message]")).toContainText(
      "valid URL-safe base64",
    );
    await page.getByRole("button", { name: "Return to builder" }).click();
    await expect(page.locator("[data-saved-builds]")).toBeVisible();
    await expect(page.getByText("Not selected yet.")).toHaveCount(9);

    await page.goto(
      `/pc-builder${shareHash({
        v: 2,
        n: "Future build",
        s: "manual",
        c: [["cpu", ["cpu-intel-core-i5-14600k"]]],
      })}`,
    );
    await expect(page.locator("[data-shared-error-message]")).toContainText(
      "schema version 2",
    );
    await page.getByRole("button", { name: "Return to builder" }).click();

    await page.goto(`/pc-builder#build=${"A".repeat(9000)}`);
    await expect(page.locator("[data-shared-error-message]")).toContainText(
      "longer than the supported payload limit",
    );
    await page.getByRole("button", { name: "Return to builder" }).click();

    await page.goto(
      `/pc-builder${shareHash({
        v: 1,
        n: "Nothing resolves",
        s: "manual",
        c: [["cpu", ["cpu-missing-model-999"]]],
      })}`,
    );
    await expect(page.locator("[data-shared-error-message]")).toContainText(
      "None of the component references",
    );
    await page.getByRole("button", { name: "Return to builder" }).click();
    await expect(page.getByText("Not selected yet.")).toHaveCount(9);
    await expect(page.locator("[data-announcer]")).toHaveText("");
  });

  test("reports missing and discontinued references instead of substituting them", async ({
    page,
  }) => {
    await page.goto(
      `/pc-builder${shareHash({
        v: 1,
        n: "Catalogue drift build",
        s: "manual",
        c: [
          ["cpu", ["cpu-intel-core-i5-14600k"]],
          ["gpu", ["gpu-amd-radeon-rx-6800-xt"]],
          ["case", ["case-missing-model-999"]],
        ],
      })}`,
    );

    await expect(page.locator("[data-shared-view]")).toBeVisible();
    await expect(page.locator("[data-shared-component]")).toHaveCount(2);
    await expect(page.locator("[data-shared-warnings]")).toContainText(
      "case-missing-model-999",
    );
    await expect(page.locator("[data-shared-warnings]")).toContainText(
      "not recorded as in production",
    );
    await expect(page.locator("[data-shared-limitations]")).toContainText(
      "unavailable and excluded",
    );

    await page.locator("[data-shared-import]").click();
    await expect(page.locator("[data-shared-view]")).toBeHidden();
    await expect(page.locator('[data-slot="cpu"]')).toContainText(
      "Intel Core i5-14600K",
    );
    await expect(page.locator('[data-slot="gpu"]')).toContainText(
      "AMD Radeon RX 6800 XT",
    );
    await expect(page.locator('[data-slot="case"]')).toContainText(
      "Not selected yet.",
    );

    // The revalidated current compatibility is shown, not a stored verdict.
    await expect(page.locator("[data-count-incompatible]")).toHaveText("0");
    await expect(page.locator("[data-count-compatible]")).toHaveText("0");
  });
});

test.describe("storage failure recovery", () => {
  test("keeps saved builds intact when storage is corrupt until explicit reset", async ({
    page,
  }) => {
    await page.evaluate(() =>
      localStorage.setItem("appkitx.pc-builder.saved-builds.v1", "{not-json"),
    );
    await page.reload();
    await expect(page.locator("[data-saved-corrupt]")).toBeVisible();
    await expect(page.locator("[data-saved-corrupt-message]")).toContainText(
      "could not be read",
    );
    await openManual(page);
    await pick(page, "CPU", "Intel Core i5-14600K");
    await expect(page.locator("[data-save-new]")).toBeDisabled();
    await expect(page.locator("[data-share-current]")).toBeEnabled();

    await page.locator("[data-saved-reset]").click();
    await expect(page.locator("[data-confirm-dialog]")).toBeVisible();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Cancel", exact: true })
      .click();
    await expect(page.locator("[data-saved-corrupt]")).toBeVisible();
    expect(
      await page.evaluate(() =>
        localStorage.getItem("appkitx.pc-builder.saved-builds.v1"),
      ),
    ).toBe("{not-json");

    await page.locator("[data-saved-reset]").click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Reset saved builds" })
      .click();
    await expect(page.locator("[data-saved-corrupt]")).toBeHidden();
    expect(
      await page.evaluate(() =>
        localStorage.getItem("appkitx.pc-builder.saved-builds.v1"),
      ),
    ).toBeNull();
    await expect(page.getByText("Not selected yet.")).toHaveCount(8);
  });

  test("distinguishes unsupported storage versions and leaves them untouched", async ({
    page,
  }) => {
    const store = JSON.stringify({ schemaVersion: 2, builds: [] });
    await page.evaluate(
      (value) =>
        localStorage.setItem("appkitx.pc-builder.saved-builds.v1", value),
      store,
    );
    await page.reload();
    await expect(page.locator("[data-saved-corrupt]")).toBeVisible();
    await expect(page.locator("[data-saved-corrupt-message]")).toContainText(
      "newer storage format",
    );
    expect(
      await page.evaluate(() =>
        localStorage.getItem("appkitx.pc-builder.saved-builds.v1"),
      ),
    ).toBe(store);

    await page.locator("[data-saved-reset]").click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Reset saved builds" })
      .click();
    await expect(page.locator("[data-saved-corrupt]")).toBeHidden();
    expect(
      await page.evaluate(() =>
        localStorage.getItem("appkitx.pc-builder.saved-builds.v1"),
      ),
    ).toBeNull();
  });

  test("reports quota failures without losing the current build", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (key === "appkitx.pc-builder.saved-builds.v1") {
          throw new DOMException("Quota exceeded", "QuotaExceededError");
        }
        return original.call(this, key, value);
      };
    });
    await page.goto("/pc-builder");
    await openManual(page);
    await pick(page, "CPU", "Intel Core i5-14600K");
    await page
      .getByRole("button", { name: "Save as new", exact: true })
      .click();
    await page.locator("#save-build-name").fill("Quota build");
    await page.getByRole("button", { name: "Save build", exact: true }).click();

    await expect(page.locator("[data-save-dialog]")).toBeVisible();
    await expect(page.locator("[data-save-error]")).toContainText(
      "storage is full",
    );
    await expect(page.locator("[data-saved-build-id]")).toHaveCount(0);
    await expect(page.locator('[data-slot="cpu"]')).toContainText(
      "Intel Core i5-14600K",
    );
    await expect(page.locator("[data-share-current]")).toBeEnabled();
    expect(
      await page.evaluate(() =>
        localStorage.getItem("appkitx.pc-builder.saved-builds.v1"),
      ),
    ).toBeNull();
  });

  test("stays usable when browser storage is unavailable", async ({ page }) => {
    await page.addInitScript(() => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (String(key).includes("storage-probe")) {
          throw new DOMException("Storage disabled", "SecurityError");
        }
        return original.call(this, key, value);
      };
    });
    await page.goto("/pc-builder");
    await expect(page.locator("[data-saved-empty]")).toContainText(
      "Saved builds are unavailable",
    );
    await openManual(page);
    await pick(page, "CPU", "Intel Core i5-14600K");
    await expect(page.locator("[data-save-new]")).toBeDisabled();
    await expect(page.locator("[data-share-current]")).toBeEnabled();
    await page.getByRole("button", { name: "Share current build" }).click();
    await expect(page.locator("[data-share-dialog]")).toBeVisible();
    await expect(page.locator("[data-share-link]")).toHaveValue(/#build=/);
    await expect(page.locator("#share-link-help")).toContainText(
      "development PC Builder preview",
    );
  });
});

test.describe("state integrity", () => {
  test("prevents multi-slot selections beyond the saveable limit", async ({
    page,
  }) => {
    await openManual(page);
    for (let index = 0; index < 8; index += 1) {
      await openPicker(page, "RAM");
      await page
        .getByRole("dialog")
        .getByRole("button", { name: /^Add / })
        .filter({ hasNotText: "Added" })
        .first()
        .click();
      await expect(page.getByRole("dialog")).toBeHidden();
    }

    await expect(page.locator('[data-slot-meta="ram"]')).toHaveText(
      "8 selected · limit reached",
    );
    await expect(
      page.getByRole("button", { name: "RAM limit reached" }),
    ).toBeDisabled();
    await expect(page.locator('[data-slot="ram"]')).toContainText(
      "Maximum of 8 selections reached for RAM",
    );
    await expect(page.locator("[data-save-new]")).toBeEnabled();

    await saveAsNew(page, "Eight RAM kits");
    await expect(page.locator("[data-saved-build-id]")).toContainText(
      "8 of 8 component(s) resolve",
    );
  });
});

test.describe("accessibility checks", () => {
  test("associates every questionnaire control with a description", async ({
    page,
  }) => {
    const selectIds = [
      "guided-use-case",
      "guided-resolution",
      "guided-priority",
      "guided-cpu-brand",
      "guided-gpu-brand",
      "guided-cooling",
      "guided-build-size",
      "guided-upgrade",
    ];
    for (const id of selectIds) {
      const describedBy = await page
        .locator(`#${id}`)
        .getAttribute("aria-describedby");
      expect(describedBy, `${id} aria-describedby`).toBeTruthy();
      const description = await page.locator(`#${describedBy}`).textContent();
      expect(description?.trim().length, `${id} description`).toBeGreaterThan(
        0,
      );
    }

    await page.locator("#guided-upgrade").selectOption("high");
    await expect(page.locator("[data-guided-upgrade-help]")).toHaveText(
      "Favour more memory slots, storage and PSU headroom.",
    );
    await expect(page.locator("[data-guided-budget]")).toHaveAttribute(
      "aria-describedby",
      /guided-budget-help/,
    );
  });

  test("restores focus after save, rename, duplicate, delete and Escape", async ({
    page,
  }) => {
    await openManual(page);
    await pick(page, "CPU", "Intel Core i5-14600K");

    const saveTrigger = page.getByRole("button", {
      name: "Save as new",
      exact: true,
    });
    await saveTrigger.click();
    await expect(page.locator("#save-build-name")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-save-dialog]")).toBeHidden();
    await expect(saveTrigger).toBeFocused();

    await saveAsNew(page, "Focus build");

    await page.getByRole("button", { name: "Rename Focus build" }).click();
    await expect(page.locator("#rename-build-name")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-rename-dialog]")).toBeHidden();
    await expect(
      page.getByRole("button", { name: "Rename Focus build" }),
    ).toBeFocused();

    await page.getByRole("button", { name: "Rename Focus build" }).click();
    await page.locator("#rename-build-name").fill("Focus renamed");
    await page
      .getByRole("button", { name: "Rename build", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Rename Focus renamed" }),
    ).toBeFocused();

    await page.getByRole("button", { name: "Duplicate Focus renamed" }).click();
    await expect(
      page.getByRole("button", { name: "Rename Focus renamed (copy)" }),
    ).toBeFocused();

    await page
      .getByRole("button", { name: "Delete Focus renamed (copy)" })
      .click();
    await expect(page.locator("[data-confirm-dialog]")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-confirm-dialog]")).toBeHidden();
    await expect(
      page.getByRole("button", { name: "Delete Focus renamed (copy)" }),
    ).toBeFocused();
  });

  test("meets minimum target sizes and exposes summary toggles", async ({
    page,
  }) => {
    await openManual(page);
    const powerSummary = page.getByText("Power breakdown", { exact: true });
    const powerBox = await powerSummary.boundingBox();
    expect(powerBox?.height ?? 0).toBeGreaterThanOrEqual(44);

    await openGuided(page);
    await generate(page);
    const assumptions = page.getByText("Power assumptions", { exact: true });
    const assumptionsBox = await assumptions.boundingBox();
    expect(assumptionsBox?.height ?? 0).toBeGreaterThanOrEqual(44);

    const alternativesSummary = page
      .locator('[data-guided-selection="gpu"] summary')
      .first();
    const alternativesBox = await alternativesSummary.boundingBox();
    expect(alternativesBox?.height ?? 0).toBeGreaterThanOrEqual(44);

    const saveButton = page.getByRole("button", {
      name: "Transfer to manual builder",
    });
    const saveBox = await saveButton.boundingBox();
    expect(saveBox?.height ?? 0).toBeGreaterThanOrEqual(44);
  });
});

test.describe("clipboard fallback @cross-browser", () => {
  test("selects the link and explains manual copying when clipboard access fails", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: undefined,
      });
    });
    await page.goto("/pc-builder");
    await openManual(page);
    await pick(page, "CPU", "Intel Core i5-14600K");
    await page.getByRole("button", { name: "Share current build" }).click();
    await expect(page.locator("[data-share-dialog]")).toBeVisible();
    const link = await page.locator("[data-share-link]").inputValue();
    expect(link).toContain("#build=");

    await page.getByRole("button", { name: "Copy link", exact: true }).click();
    await expect(page.locator("[data-share-feedback]")).toContainText(
      "Clipboard access is unavailable",
    );
    await expect(page.locator("[data-share-link]")).toBeFocused();
    const selection = await page.evaluate(() => {
      const input =
        document.querySelector<HTMLInputElement>("[data-share-link]");
      return input
        ? [input.selectionStart, input.selectionEnd, input.value.length]
        : null;
    });
    expect(selection).toEqual([0, link.length, link.length]);
  });
});

test.describe("responsive validation", () => {
  test("has no overflow and keeps dialogs usable at every target width", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    const widths = [320, 390, 768, 1024, 1440, 1920];
    const longName = "X".repeat(80);

    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/pc-builder");
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        ),
        `guided form overflow at ${width}`,
      ).toBeLessThanOrEqual(1);

      await openManual(page);
      await pick(page, "CPU", "Intel Core i5-14600K");
      await saveAsNew(page, longName);
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        ),
        `saved build overflow at ${width}`,
      ).toBeLessThanOrEqual(1);

      await page.getByRole("button", { name: `Rename ${longName}` }).click();
      const renameBox = await page
        .locator("[data-rename-dialog]")
        .boundingBox();
      expect(renameBox).not.toBeNull();
      expect(renameBox!.width).toBeLessThanOrEqual(width);
      expect(renameBox!.x).toBeGreaterThanOrEqual(0);
      await page.keyboard.press("Escape");

      await openPicker(page, "CPU");
      const dialogBox = await page.getByRole("dialog").boundingBox();
      expect(dialogBox).not.toBeNull();
      expect(dialogBox!.width).toBeLessThanOrEqual(width);
      expect(dialogBox!.height).toBeLessThanOrEqual(900);
      expect(dialogBox!.x).toBeGreaterThanOrEqual(0);
      await page.keyboard.press("Escape");

      const link = await shareLinkFor(page, longName);
      await page.goto(link);
      await expect(page.locator("[data-shared-view]")).toBeVisible();
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        ),
        `shared view overflow at ${width}`,
      ).toBeLessThanOrEqual(1);
    }

    // Short mobile viewports: the dialog scrolls its results, not its header.
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/pc-builder");
    await openManual(page);
    await openPicker(page, "Graphics card (GPU)");
    const header = page.locator("[data-picker] > div").first();
    const headerTop = await header.evaluate(
      (element) => element.getBoundingClientRect().top,
    );
    await page.locator("[data-picker-results]").evaluate((element) => {
      element.parentElement!.scrollTop = 1200;
    });
    expect(
      await header.evaluate((element) => element.getBoundingClientRect().top),
    ).toBeCloseTo(headerTop, 0);
    const dialog = await page.getByRole("dialog").boundingBox();
    expect(dialog!.height).toBeLessThanOrEqual(568);
    expect(dialog!.y).toBeGreaterThanOrEqual(0);
    expect(dialog!.y + dialog!.height).toBeLessThanOrEqual(568);
  });
});

test.describe("guided questionnaire matrix", () => {
  test("covers every supported option value without invalid results", async ({
    page,
  }) => {
    test.setTimeout(240_000);
    const dimensions: Array<{
      id: string;
      values: string[];
    }> = [
      {
        id: "guided-use-case",
        values: ["gaming", "productivity", "workstation", "general"],
      },
      {
        id: "guided-resolution",
        values: ["1080p", "1440p", "4k", "not-applicable"],
      },
      {
        id: "guided-priority",
        values: ["gpu-focused", "cpu-focused", "balanced", "value-focused"],
      },
      { id: "guided-cpu-brand", values: ["no-preference", "AMD", "Intel"] },
      { id: "guided-gpu-brand", values: ["no-preference", "NVIDIA", "AMD"] },
      {
        id: "guided-cooling",
        values: ["no-preference", "air", "liquid"],
      },
      {
        id: "guided-build-size",
        values: ["no-preference", "standard", "compact"],
      },
      {
        id: "guided-upgrade",
        values: ["balanced", "high", "low"],
      },
    ];

    for (const dimension of dimensions) {
      for (const value of dimension.values) {
        await openGuided(page);
        if (await page.locator("[data-guided-results]").isVisible()) {
          await page.getByRole("button", { name: "Edit requirements" }).click();
        }
        await page.locator(`#${dimension.id}`).selectOption(value);
        await page.locator("#guided-budget").fill("1500");
        await page
          .getByRole("button", { name: "Generate recommendation" })
          .click();
        await expect(
          page.locator("[data-guided-results]"),
          `${dimension.id}=${value}`,
        ).toBeVisible();
        await expect(page.locator("[data-guided-selection]")).toHaveCount(9);
        await expect(
          page.locator("[data-guided-result-status]"),
        ).not.toHaveText("Invalid questionnaire");
        await expect(page.locator("[data-guided-form-error]")).toBeHidden();
      }
    }
  });
});
