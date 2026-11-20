import { expect, test, type Locator, type Page } from "@playwright/test";
import { prepareClipboard } from "./clipboard";
import { pressTab, tabTo } from "./keyboard";

/*
 * Case Converter: every conversion mode, input preservation, copy and reset,
 * Spanish localization, keyboard access, 320px layout, and the promise that
 * entered text never leaves the page.
 */

const input = (page: Page) => page.locator("[data-case-input]");
const output = (page: Page) => page.locator("[data-case-output]");
const mode = (page: Page) => page.locator("[data-case-mode]");
const copy = (page: Page) => page.getByRole("button", { name: "Copy output" });
const reset = (page: Page) => page.getByRole("button", { name: "Reset" });

const ring = async (locator: Locator) => {
  await expect(locator).toHaveCSS("outline-width", "2px");
  await expect(locator).toHaveCSS("outline-style", "solid");
  await expect(locator).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(locator).toHaveCSS("outline-offset", "2px");
};

const expectations = {
  uppercase: "HELLO WORLD FROM APPKITX",
  lowercase: "hello world from appkitx",
  title: "Hello World From Appkitx",
  sentence: "Hello world from appkitx",
  capitalized: "Hello World From Appkitx",
  camel: "helloWorldFromAppkitx",
  pascal: "HelloWorldFromAppkitx",
  snake: "hello_world_from_appkitx",
  kebab: "hello-world-from-appkitx",
  constant: "HELLO_WORLD_FROM_APPKITX",
  alternating: "hElLo WoRlD fRoM aPpKiTx",
} as const;

test("loads with the correct title, heading, default mode, and empty state", async ({
  page,
}) => {
  await page.goto("/case-converter");

  await expect(page).toHaveTitle("Case Converter — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Case Converter",
  );

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(breadcrumb.getByText("Case Converter")).toBeVisible();

  await expect(mode(page)).toHaveValue("uppercase");
  await expect(input(page)).toHaveValue("");
  await expect(output(page)).toHaveValue("");
  await expect(output(page)).toHaveAttribute(
    "placeholder",
    "Converted text appears here.",
  );
  await expect(copy(page)).toBeDisabled();
  await expect(page.getByText("Converted in your browser")).toBeVisible();
});

test("supports every conversion mode without changing the input", async ({
  page,
}) => {
  await page.goto("/case-converter");
  const original = "hello world from appkitx";
  await input(page).fill(original);

  for (const [value, expected] of Object.entries(expectations)) {
    await mode(page).selectOption(value);
    await expect(output(page), value).toHaveValue(expected);
    await expect(input(page), `${value} must preserve the input`).toHaveValue(
      original,
    );
  }

  await mode(page).selectOption("title");
  await page.screenshot({
    path: "test-results/case-converter.png",
    fullPage: true,
  });
});

test("keeps ordinal suffixes lowercase across conversion modes", async ({
  page,
}) => {
  await page.goto("/case-converter");
  const original = "1st place on 42nd street";
  await input(page).fill(original);

  for (const [value, expected] of [
    ["title", "1st Place on 42nd Street"],
    ["capitalized", "1st Place On 42nd Street"],
    ["pascal", "1stPlaceOn42ndStreet"],
    ["camel", "1stPlaceOn42ndStreet"],
    ["snake", "1st_place_on_42nd_street"],
    ["kebab", "1st-place-on-42nd-street"],
    ["constant", "1ST_PLACE_ON_42ND_STREET"],
  ] as const) {
    await mode(page).selectOption(value);
    await expect(output(page), value).toHaveValue(expected);
    await expect(input(page), `${value} must preserve the input`).toHaveValue(
      original,
    );
  }
});

test("distinguishes title, capitalized, and sentence case", async ({
  page,
}) => {
  await page.goto("/case-converter");
  await input(page).fill("the lord of the rings");

  await mode(page).selectOption("title");
  await expect(output(page)).toHaveValue("The Lord of the Rings");
  await mode(page).selectOption("capitalized");
  await expect(output(page)).toHaveValue("The Lord Of The Rings");
  await mode(page).selectOption("sentence");
  await expect(output(page)).toHaveValue("The lord of the rings");
});

test("handles multiline, Spanish, Hindi, punctuation, and numbers", async ({
  page,
}) => {
  await page.goto("/case-converter");

  await input(page).fill("canción de prueba\nनमस्ते दुनिया");
  await mode(page).selectOption("uppercase");
  await expect(output(page)).toHaveValue("CANCIÓN DE PRUEBA\nनमस्ते दुनिया");

  await mode(page).selectOption("camel");
  await expect(output(page)).toHaveValue("canciónDePruebaनमस्तेदुनिया");

  await input(page).fill("version 3.14 and 42 items");
  await mode(page).selectOption("sentence");
  await expect(output(page)).toHaveValue("Version 3.14 and 42 items");
  await mode(page).selectOption("snake");
  await expect(output(page)).toHaveValue("version_3_14_and_42_items");
});

test("copies the converted output", async ({ page, browserName }) => {
  await prepareClipboard(page, browserName);
  await page.goto("/case-converter");
  await input(page).fill("hello world from appkitx");
  await mode(page).selectOption("title");

  await copy(page).click();
  await expect(page.getByText("Output copied to the clipboard.")).toBeVisible();

  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe("Hello World From Appkitx");
});

test("resets the input, output, mode, and focus", async ({ page }) => {
  await page.goto("/case-converter");
  await input(page).fill("hello world");
  await mode(page).selectOption("snake");
  await expect(output(page)).toHaveValue("hello_world");

  await reset(page).click();

  await expect(input(page)).toHaveValue("");
  await expect(output(page)).toHaveValue("");
  await expect(mode(page)).toHaveValue("uppercase");
  await expect(copy(page)).toBeDisabled();
  await expect(input(page)).toBeFocused();
});

test("the Spanish page is localized and converts text", async ({ page }) => {
  await page.goto("/es/case-converter");

  await expect(page).toHaveTitle(
    "Conversor de mayúsculas y minúsculas — AppKitX",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Conversor de mayúsculas y minúsculas",
  );
  await expect(page.getByText("Conversión", { exact: true })).toBeVisible();
  await expect(mode(page).locator('option[value="title"]')).toHaveText(
    "Tipo título",
  );
  await expect(page.getByText("Convertido en tu navegador")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Copiar resultado" }),
  ).toBeDisabled();

  await input(page).fill("hola mundo desde appkitx");
  await mode(page).selectOption("title");
  await expect(output(page)).toHaveValue("Hola Mundo desde Appkitx");
});

test("is keyboard operable and shows the design-system focus ring", async ({
  page,
  browserName,
}) => {
  await page.goto("/case-converter");

  await tabTo(page, browserName, input(page));
  await ring(input(page));
  await page.keyboard.type("hello world");
  await expect(output(page)).toHaveValue("HELLO WORLD");

  /* Copy and Reset precede the input in the DOM, so move backwards. */
  await pressTab(page, browserName, { shift: true });
  await ring(reset(page));
  await pressTab(page, browserName, { shift: true });
  await ring(copy(page));
});

test("keeps the input and output usable at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/case-converter");
  await input(page).fill("A short sentence for the mobile layout.");

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(input(page)).toBeVisible();
  await expect(output(page)).toBeVisible();
  await expect(copy(page)).toBeVisible();
});

test("does not transmit or store entered text", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    requests.push(`${request.url()} ${request.postData() ?? ""}`);
  });

  await page.goto("/case-converter");
  const secret = "private-case-converter-4f8a2c";
  await input(page).fill(secret);
  await expect(output(page)).toHaveValue(secret.toUpperCase());
  await page.waitForTimeout(300);

  expect(
    requests.some((request) => request.includes(secret)),
    "Case Converter content must never appear in a request URL or body",
  ).toBe(false);

  const origin = new URL(page.url()).origin;
  expect(
    requests.every((request) => request.startsWith(origin)),
    "Case Converter must not call a third-party service",
  ).toBe(true);

  const storage = await page.evaluate(() =>
    JSON.stringify({ local: localStorage, session: sessionStorage }),
  );
  expect(storage).not.toContain(secret);
});
