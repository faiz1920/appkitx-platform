import { expect, test, type Locator, type Page } from "@playwright/test";
import { prepareClipboard } from "./clipboard";
import { tabTo } from "./keyboard";

/*
 * Word Counter: live statistics, Unicode and whitespace behavior, copy and
 * reset actions, Spanish localization, keyboard access, 320px layout, and the
 * promise that entered text never leaves the page.
 */

const input = (page: Page) => page.locator("[data-word-counter] textarea");
const stat = (page: Page, key: string) => page.locator(`[data-stat="${key}"]`);
const copy = (page: Page) => page.getByRole("button", { name: "Copy text" });
const reset = (page: Page) => page.getByRole("button", { name: "Reset" });

const ring = async (locator: Locator) => {
  await expect(locator).toHaveCSS("outline-width", "2px");
  await expect(locator).toHaveCSS("outline-style", "solid");
  await expect(locator).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(locator).toHaveCSS("outline-offset", "2px");
};

test("loads with the correct title, heading, and empty state", async ({
  page,
}) => {
  await page.goto("/word-counter");

  await expect(page).toHaveTitle("Word Counter — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Word Counter",
  );

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(breadcrumb.getByText("Word Counter")).toBeVisible();

  await expect(input(page)).toHaveValue("");
  for (const key of [
    "words",
    "characters",
    "charactersNoSpaces",
    "sentences",
    "paragraphs",
    "lines",
  ]) {
    await expect(stat(page, key), key).toHaveText("0");
  }
  await expect(stat(page, "readingTime")).toHaveText("0 s");
  await expect(stat(page, "speakingTime")).toHaveText("0 s");
  await expect(copy(page)).toBeDisabled();
  await expect(
    page.getByText("Start typing or paste text to see live counts."),
  ).toBeVisible();
  await expect(page.getByText("Counted in your browser")).toBeVisible();
});

test("exposes labels, statistics semantics, and non-noisy feedback", async ({
  page,
}) => {
  await page.goto("/word-counter");

  const textarea = page.getByLabel("Your text", { exact: true });
  await expect(textarea).toHaveAccessibleName("Your text");
  await expect(textarea).toHaveAccessibleDescription(
    "Paste or type text; the statistics update as you go.",
  );

  const statsList = page.locator("[data-word-counter] dl");
  await expect(statsList.locator("dt")).toHaveCount(8);
  await expect(statsList.locator("dd")).toHaveCount(8);
  expect(
    await statsList.evaluate(
      (element) => element.closest("[aria-live]") !== null,
    ),
    "the statistics panel must not be a live region",
  ).toBe(false);

  const status = page.locator('[data-word-counter] [role="status"]');
  await expect(status).toHaveAttribute("aria-live", "polite");
  await expect(page.getByRole("button", { name: "Copy text" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
});

test("updates every statistic as text is entered", async ({ page }) => {
  await page.goto("/word-counter");

  await input(page).fill("Hello world. This is a test.");

  await expect(stat(page, "words")).toHaveText("6");
  await expect(stat(page, "characters")).toHaveText("28");
  await expect(stat(page, "charactersNoSpaces")).toHaveText("23");
  await expect(stat(page, "sentences")).toHaveText("2");
  await expect(stat(page, "paragraphs")).toHaveText("1");
  await expect(stat(page, "lines")).toHaveText("1");
  await expect(stat(page, "readingTime")).toHaveText("2 s");
  await expect(stat(page, "speakingTime")).toHaveText("3 s");
  await expect(copy(page)).toBeEnabled();
  await expect(
    page.getByText("Start typing or paste text to see live counts."),
  ).toBeHidden();

  await page.screenshot({
    path: "test-results/word-counter.png",
    fullPage: true,
  });

  await input(page).pressSequentially(" More.");
  await expect(stat(page, "words")).toHaveText("7");
  await expect(stat(page, "sentences")).toHaveText("3");
});

test("handles large pastes and rapid edits without stale statistics", async ({
  page,
}) => {
  await page.goto("/word-counter");

  const largeText = Array.from(
    { length: 5_000 },
    (_, index) => `word${index}`,
  ).join(" ");

  await input(page).fill(largeText);
  await expect(stat(page, "words")).toHaveText("5,000");
  await expect(copy(page)).toBeEnabled();

  await page.evaluate(() => {
    const textarea = document.querySelector<HTMLTextAreaElement>(
      "[data-word-counter] textarea",
    );
    if (!textarea) throw new Error("Word Counter textarea is missing");

    for (let count = 1; count <= 100; count += 1) {
      textarea.value = "word ".repeat(count).trim();
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
  await expect(stat(page, "words")).toHaveText("100");

  await input(page).fill(largeText);
  await reset(page).click();
  await expect(stat(page, "words")).toHaveText("0");
  await expect(stat(page, "characters")).toHaveText("0");
  await expect(copy(page)).toBeDisabled();

  await input(page).fill("one two three");
  await expect(stat(page, "words")).toHaveText("3");
});

test("handles repeated whitespace, paragraphs, and lines", async ({ page }) => {
  await page.goto("/word-counter");

  await input(page).fill("one   two\n\nthree\nfour");

  await expect(stat(page, "words")).toHaveText("4");
  await expect(stat(page, "sentences")).toHaveText("2");
  await expect(stat(page, "paragraphs")).toHaveText("2");
  await expect(stat(page, "lines")).toHaveText("3");
});

test("counts Spanish, Hindi, and punctuation-only text correctly", async ({
  page,
}) => {
  await page.goto("/word-counter");

  await input(page).fill("¡Hola! ¿Cómo estás? Bien.");
  await expect(stat(page, "words")).toHaveText("4");
  await expect(stat(page, "sentences")).toHaveText("3");

  await input(page).fill("नमस्ते दुनिया। यह एक परीक्षण है।");
  await expect(stat(page, "words")).toHaveText("6");
  await expect(stat(page, "sentences")).toHaveText("2");

  await input(page).fill("!!! ... ???");
  await expect(stat(page, "words")).toHaveText("0");
  await expect(stat(page, "sentences")).toHaveText("0");
  await expect(stat(page, "characters")).not.toHaveText("0");
});

test("copies the entered text", async ({ page, browserName }) => {
  await prepareClipboard(page, browserName);
  await page.goto("/word-counter");
  await input(page).fill("Copy this text.");

  await copy(page).click();
  await expect(page.getByText("Text copied to the clipboard.")).toBeVisible();

  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe("Copy this text.");
});

test("resets the text, statistics, and focus", async ({ page }) => {
  await page.goto("/word-counter");
  await input(page).fill("Some text to clear.");
  await expect(stat(page, "words")).toHaveText("4");

  await reset(page).click();

  await expect(input(page)).toHaveValue("");
  await expect(stat(page, "words")).toHaveText("0");
  await expect(stat(page, "characters")).toHaveText("0");
  await expect(stat(page, "readingTime")).toHaveText("0 s");
  await expect(copy(page)).toBeDisabled();
  await expect(input(page)).toBeFocused();
});

test("the Spanish page is localized and counts the same text", async ({
  page,
}) => {
  await page.goto("/es/word-counter");

  await expect(page).toHaveTitle("Contador de palabras — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Contador de palabras",
  );
  await expect(page.getByText("Estadísticas", { exact: true })).toBeVisible();
  await expect(page.getByText("Palabras", { exact: true })).toBeVisible();
  await expect(page.getByText("Contado en tu navegador")).toBeVisible();

  await page
    .locator("[data-word-counter] textarea")
    .fill("Hola mundo. Esto es una prueba.");
  await expect(stat(page, "words")).toHaveText("6");
  await expect(stat(page, "sentences")).toHaveText("2");
  await expect(stat(page, "readingTime")).toHaveText("2 s");
  await expect(stat(page, "speakingTime")).toHaveText("3 s");
});

test("is keyboard operable and shows the design-system focus ring", async ({
  page,
  browserName,
}) => {
  await page.goto("/word-counter");

  await tabTo(page, browserName, input(page));
  await ring(input(page));
  await page.keyboard.type("hello world");
  await expect(stat(page, "words")).toHaveText("2");

  await tabTo(page, browserName, copy(page));
  await ring(copy(page));
  await tabTo(page, browserName, reset(page));
  await ring(reset(page));
});

test("keeps the form and statistics usable at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/word-counter");
  await input(page).fill("A short sentence for the mobile layout.");

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(input(page)).toBeVisible();
  await expect(stat(page, "words")).toBeVisible();
  await expect(stat(page, "readingTime")).toBeVisible();
  await expect(copy(page)).toBeVisible();
});

test("does not transmit or store entered text", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    requests.push(`${request.url()} ${request.postData() ?? ""}`);
  });

  await page.goto("/word-counter");
  const secret = "privatewordcounter4f8a2c";
  await input(page).fill(secret);
  await expect(stat(page, "words")).toHaveText("1");
  await page.waitForTimeout(300);

  expect(
    requests.some((request) => request.includes(secret)),
    "Word Counter content must never appear in a request URL or body",
  ).toBe(false);

  const origin = new URL(page.url()).origin;
  expect(
    requests.every((request) => request.startsWith(origin)),
    "Word Counter must not call a third-party service",
  ).toBe(true);

  const storage = await page.evaluate(() =>
    JSON.stringify({ local: localStorage, session: sessionStorage }),
  );
  expect(storage).not.toContain(secret);
});
