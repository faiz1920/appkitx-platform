import { expect, test, type Locator, type Page } from "@playwright/test";
import { prepareClipboard } from "./clipboard";

/*
 * M7 Phase 1 JSON Formatter: format/minify behavior against the production
 * build, two-space indentation, deterministic cross-browser parse-error
 * positions, localized errors, safe text-only rendering (no evaluation, no
 * HTML injection), copy feedback, keyboard access, and Spanish localization.
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
  await page.goto("/json-formatter");

  await expect(page).toHaveTitle("JSON Formatter — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "JSON Formatter",
  );

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(breadcrumb.getByText("JSON Formatter")).toBeVisible();

  await expect(input(page)).toHaveValue("");
  await expect(output(page)).toHaveValue("");
  await expect(status(page)).toHaveText("");
  await expect(copy(page)).toBeDisabled();
});

test("formats JSON with two-space indentation", async ({ page }) => {
  await page.goto("/json-formatter");

  await input(page).fill('{"b":1,"a":[1,2]}');
  await page.getByRole("button", { name: "Format" }).click();

  await expect(output(page)).toHaveValue(
    '{\n  "b": 1,\n  "a": [\n    1,\n    2\n  ]\n}',
  );
  await expect(status(page)).toContainText("Valid JSON");
  await expect(error(page)).toBeHidden();
  await expect(copy(page)).toBeEnabled();

  await page.screenshot({
    path: "test-results/json-formatter-en.png",
    fullPage: true,
  });
});

test("minifies JSON", async ({ page }) => {
  await page.goto("/json-formatter");

  await selectMode(page, "Minify");
  await input(page).fill('{\n  "a": [1, 2],\n  "b": {"c": true}\n}');
  await page.getByRole("button", { name: "Minify" }).click();

  await expect(output(page)).toHaveValue('{"a":[1,2],"b":{"c":true}}');
  await expect(status(page)).toContainText("Valid JSON");
});

test("reports deterministic cross-browser parse error positions", async ({
  page,
}) => {
  await page.goto("/json-formatter");

  const cases = [
    {
      input: '{\n  "a": 1,\n}',
      expected: "Invalid JSON at line 3, column 1.",
    },
    {
      input: '{"a": 1',
      expected: "Invalid JSON at line 1, column 8.",
    },
    {
      input: "nope",
      expected: "Invalid JSON at line 1, column 1.",
    },
    {
      input: "[1 2]",
      expected: "Invalid JSON at line 1, column 4.",
    },
    {
      input: '"abc',
      expected: "Invalid JSON at line 1, column 5.",
    },
  ];

  for (const malformed of cases) {
    await input(page).fill(malformed.input);
    await page.getByRole("button", { name: "Format" }).click();

    await expect(error(page)).toBeVisible();
    await expect(error(page), malformed.input).toHaveText(malformed.expected);
    await expect(input(page)).toHaveAttribute("aria-invalid", "true");
    await expect(status(page)).toContainText("Invalid JSON");
    await expect(output(page)).toHaveValue("");
  }
});

test("locates a malformed array entry at the offending token", async ({
  page,
}) => {
  await page.goto("/json-formatter");

  await input(page).fill("[1, 2,, 3]");
  await page.getByRole("button", { name: "Format" }).click();

  await expect(error(page)).toHaveText("Invalid JSON at line 1, column 7.");
  await expect(input(page)).toHaveAttribute("aria-invalid", "true");
});

test("keeps the last valid output when a later parse fails", async ({
  page,
}) => {
  await page.goto("/json-formatter");

  await input(page).fill('{"a":1}');
  await page.getByRole("button", { name: "Format" }).click();
  await expect(output(page)).toHaveValue('{\n  "a": 1\n}');

  await input(page).fill('{"a":1,,}');
  await page.getByRole("button", { name: "Format" }).click();
  await expect(error(page)).toBeVisible();
  await expect(output(page)).toHaveValue('{\n  "a": 1\n}');
});

test("requires JSON input", async ({ page }) => {
  await page.goto("/json-formatter");

  await page.getByRole("button", { name: "Format" }).click();
  await expect(error(page)).toContainText("Enter JSON to format.");
  await expect(input(page)).toHaveAttribute("aria-invalid", "true");
});

test("renders input as text only and never executes it", async ({ page }) => {
  await page.goto("/json-formatter");

  const payload = '{"x":"<\\/script><script>window.__pwned=1<\\/script>"}';
  await input(page).fill(payload);
  await page.getByRole("button", { name: "Format" }).click();

  await expect(output(page)).toHaveValue(
    '{\n  "x": "</script><script>window.__pwned=1</script>"\n}',
  );
  await expect(status(page)).toContainText("Valid JSON");
  const pwned = await page.evaluate(
    () => (window as unknown as { __pwned?: number }).__pwned,
  );
  expect(pwned).toBeUndefined();
});

test("switching modes updates the action and resets the output", async ({
  page,
}) => {
  await page.goto("/json-formatter");

  await input(page).fill('{"a":1}');
  await page.getByRole("button", { name: "Format" }).click();
  await expect(output(page)).toHaveValue('{\n  "a": 1\n}');

  await selectMode(page, "Minify");
  await expect(page.getByRole("button", { name: "Minify" })).toBeVisible();
  await expect(output(page)).toHaveValue("");
  await expect(status(page)).toHaveText("");
  await expect(copy(page)).toBeDisabled();
});

test("clear resets the tool and returns focus to the input", async ({
  page,
}) => {
  await page.goto("/json-formatter");

  await input(page).fill('{"a":1}');
  await page.getByRole("button", { name: "Format" }).click();
  await page.getByRole("button", { name: "Clear" }).click();

  await expect(input(page)).toHaveValue("");
  await expect(output(page)).toHaveValue("");
  await expect(status(page)).toHaveText("");
  await expect(copy(page)).toBeDisabled();
  await expect(input(page)).toBeFocused();
});

test("copies the output with accessible success feedback", async ({
  page,
  browserName,
}) => {
  await prepareClipboard(page, browserName);
  await page.goto("/json-formatter");

  await input(page).fill('{"a":1}');
  await page.getByRole("button", { name: "Format" }).click();
  await copy(page).click();

  const success = page.locator("[data-copy-status-success]");
  await expect(success).toBeVisible();
  await expect(success).toContainText("Copied to clipboard.");

  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied.replace(/\r\n/g, "\n")).toBe('{\n  "a": 1\n}');
});

test("is fully operable from the keyboard", async ({ page }) => {
  await page.goto("/json-formatter");

  /* Arrow keys switch the segmented mode control. */
  await page.getByRole("radio", { name: "Format" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "Minify" })).toBeChecked();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("radio", { name: "Format" })).toBeChecked();

  /* Typing and activating the action button with Enter (no pointer). */
  await input(page).focus();
  await page.keyboard.type('{"key":1}');
  await page.getByRole("button", { name: "Format" }).focus();
  await page.keyboard.press("Enter");

  await expect(output(page)).toHaveValue('{\n  "key": 1\n}');
});

test("shows the design-system focus ring and 44px targets", async ({
  page,
}) => {
  await page.goto("/json-formatter");

  await input(page).focus();
  await ring(input(page));

  const format = page.getByRole("button", { name: "Format" });
  const box = await format.boundingBox();
  if (!box) throw new Error("Format button is not visible");
  expect(box.height).toBeGreaterThanOrEqual(44);

  await format.focus();
  await ring(format);
});

test("the Spanish page is localized and reports positioned errors", async ({
  page,
}) => {
  await page.goto("/es/json-formatter");

  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Formateador JSON",
  );
  await expect(page.getByRole("button", { name: "Formatear" })).toBeVisible();

  await input(page).fill('{\n  "a": 1,\n}');
  await page.getByRole("button", { name: "Formatear" }).click();
  await expect(error(page)).toHaveText(
    "JSON no válido en la línea 3, columna 1.",
  );

  await input(page).fill("[1 2]");
  await page.getByRole("button", { name: "Formatear" }).click();
  await expect(error(page)).toHaveText(
    "JSON no válido en la línea 1, columna 4.",
  );

  await input(page).fill('{"b":1,"a":[1,2]}');
  await page.getByRole("button", { name: "Formatear" }).click();
  await expect(output(page)).toHaveValue(
    '{\n  "b": 1,\n  "a": [\n    1,\n    2\n  ]\n}',
  );

  await page.screenshot({
    path: "test-results/json-formatter-es.png",
    fullPage: true,
  });
});

test("keeps layout at 320px in both locales", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });

  for (const path of ["/json-formatter", "/es/json-formatter"]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, `${path} overflows horizontally`).toBeLessThanOrEqual(0);
  }
});
