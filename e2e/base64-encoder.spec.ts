import { expect, test, type Locator, type Page } from "@playwright/test";

/*
 * M7 Phase 1 Base64 Encoder: encode/decode behavior against the production
 * build, the approved decoding policy (whitespace, padding, URL-safe input,
 * malformed rejection), localized errors, copy feedback, keyboard access,
 * and Spanish localization.
 */

const input = (page: Page) => page.locator("textarea[data-input]");
const output = (page: Page) => page.locator("textarea[data-output]");
const error = (page: Page) => page.locator("[data-error]");
const status = (page: Page) => page.locator("[data-status]");
const copy = (page: Page) => page.getByRole("button", { name: "Copy result" });

const selectMode = async (page: Page, name: string) => {
  await page.locator(".segmented label").filter({ hasText: name }).click();
  await expect(page.getByRole("radio", { name })).toBeChecked();
};

const ring = async (locator: Locator) => {
  await expect(locator).toHaveCSS("outline-width", "2px");
  await expect(locator).toHaveCSS("outline-style", "solid");
  await expect(locator).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(locator).toHaveCSS("outline-offset", "2px");
};

test("loads with the correct title, heading, and empty state", async ({
  page,
}) => {
  await page.goto("/base64-encoder");

  await expect(page).toHaveTitle("Base64 Encoder — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Base64 Encoder",
  );

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(breadcrumb.getByText("Base64 Encoder")).toBeVisible();

  await expect(input(page)).toHaveValue("");
  await expect(output(page)).toHaveValue("");
  await expect(status(page)).toHaveText("");
  await expect(copy(page)).toBeDisabled();
});

test("encodes text to Base64 with status counts", async ({ page }) => {
  await page.goto("/base64-encoder");

  await input(page).fill("hello");
  await page.getByRole("button", { name: "Encode" }).click();

  await expect(output(page)).toHaveValue("aGVsbG8=");
  await expect(status(page)).toHaveText(
    "Input: 5 characters · Output: 8 characters",
  );
  await expect(copy(page)).toBeEnabled();
  await expect(error(page)).toBeHidden();

  await page.screenshot({
    path: "test-results/base64-encoder-en.png",
    fullPage: true,
  });
});

test("encodes Unicode text from UTF-8 bytes", async ({ page }) => {
  await page.goto("/base64-encoder");

  await input(page).fill("héllo 🚀");
  await page.getByRole("button", { name: "Encode" }).click();

  await expect(output(page)).toHaveValue("aMOpbGxvIPCfmoA=");
});

test("decodes Base64 ignoring whitespace and accepting missing padding", async ({
  page,
}) => {
  await page.goto("/base64-encoder");

  await selectMode(page, "Decode");
  await input(page).fill(" aGVs\nbG8 ");
  await page.getByRole("button", { name: "Decode" }).click();

  await expect(output(page)).toHaveValue("hello");
  await expect(error(page)).toBeHidden();
});

test("decodes URL-safe Base64", async ({ page }) => {
  await page.goto("/base64-encoder");

  await selectMode(page, "Decode");
  await input(page).fill("Pz8-");
  await page.getByRole("button", { name: "Decode" }).click();

  await expect(output(page)).toHaveValue("??>");
});

test("rejects malformed Base64 and keeps the last valid output", async ({
  page,
}) => {
  await page.goto("/base64-encoder");

  await selectMode(page, "Decode");
  await input(page).fill("aGVsbG8=");
  await page.getByRole("button", { name: "Decode" }).click();
  await expect(output(page)).toHaveValue("hello");

  await input(page).fill("not base64!!");
  await page.getByRole("button", { name: "Decode" }).click();

  await expect(error(page)).toBeVisible();
  await expect(error(page)).toContainText(
    "This isn't valid Base64 — check the characters and padding.",
  );
  await expect(input(page)).toHaveAttribute("aria-invalid", "true");
  await expect(output(page)).toHaveValue("hello");

  await input(page).fill("aGVsbG8=");
  await page.getByRole("button", { name: "Decode" }).click();
  await expect(error(page)).toBeHidden();
});

test("requires input in each mode", async ({ page }) => {
  await page.goto("/base64-encoder");

  await page.getByRole("button", { name: "Encode" }).click();
  await expect(error(page)).toContainText("Enter the text you want to encode.");
  await expect(input(page)).toHaveAttribute("aria-invalid", "true");

  await selectMode(page, "Decode");
  await page.getByRole("button", { name: "Decode" }).click();
  await expect(error(page)).toContainText(
    "Enter the Base64 you want to decode.",
  );
});

test("switching modes updates labels and resets the output", async ({
  page,
}) => {
  await page.goto("/base64-encoder");

  await input(page).fill("hello");
  await page.getByRole("button", { name: "Encode" }).click();
  await expect(output(page)).toHaveValue("aGVsbG8=");

  await selectMode(page, "Decode");
  await expect(page.getByLabel("Base64")).toBeVisible();
  await expect(page.getByLabel("Text")).toBeVisible();
  await expect(output(page)).toHaveValue("");
  await expect(status(page)).toHaveText("");
  await expect(copy(page)).toBeDisabled();
});

test("clear resets the tool and returns focus to the input", async ({
  page,
}) => {
  await page.goto("/base64-encoder");

  await input(page).fill("hello");
  await page.getByRole("button", { name: "Encode" }).click();
  await page.getByRole("button", { name: "Clear" }).click();

  await expect(input(page)).toHaveValue("");
  await expect(output(page)).toHaveValue("");
  await expect(status(page)).toHaveText("");
  await expect(copy(page)).toBeDisabled();
  await expect(input(page)).toBeFocused();
});

test("copies the output with accessible success feedback", async ({ page }) => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/base64-encoder");

  await input(page).fill("hello");
  await page.getByRole("button", { name: "Encode" }).click();
  await copy(page).click();

  const success = page.locator("[data-copy-status-success]");
  await expect(success).toBeVisible();
  await expect(success).toContainText("Copied to clipboard.");

  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe("aGVsbG8=");
});

test("shows the design-system focus ring and 44px targets", async ({
  page,
}) => {
  await page.goto("/base64-encoder");

  await input(page).focus();
  await ring(input(page));

  for (const name of ["Encode", "Clear"]) {
    const box = await page.getByRole("button", { name }).boundingBox();
    if (!box) throw new Error(`${name} button is not visible`);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }

  await page.getByRole("button", { name: "Encode" }).focus();
  await ring(page.getByRole("button", { name: "Encode" }));
});

test("the Spanish page is localized and encodes", async ({ page }) => {
  await page.goto("/es/base64-encoder");

  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Codificador Base64",
  );
  await expect(page.getByLabel("Texto")).toBeVisible();
  await expect(page.getByLabel("Base64")).toBeVisible();

  await input(page).fill("hola");
  await page.getByRole("button", { name: "Codificar" }).click();

  await expect(output(page)).toHaveValue("aG9sYQ==");
  await expect(status(page)).toContainText("Entrada: 4 caracteres");

  await page.screenshot({
    path: "test-results/base64-encoder-es.png",
    fullPage: true,
  });
});

test("keeps layout at 320px in both locales", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });

  for (const path of ["/base64-encoder", "/es/base64-encoder"]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, `${path} overflows horizontally`).toBeLessThanOrEqual(0);
  }
});
