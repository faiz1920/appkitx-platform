import { expect, test, type Locator, type Page } from "@playwright/test";
import { prepareClipboard } from "./clipboard";
import { tabTo } from "./keyboard";

/*
 * Hash Generator: independent SHA-2 vectors, UTF-8 and multiline input,
 * algorithm switching without losing text, empty validation, loading and
 * failure states, clipboard feedback, localization, SEO, discovery, and
 * 320px layout.
 */

const VECTORS = {
  sha256Abc: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  sha384Abc:
    "cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7",
  sha512Abc:
    "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f",
  sha256Unicode:
    "d87b4a76e84eea9f187f77311aaa08530b086d1c5aebf4024357286b35cebdcb",
  sha256Multiline:
    "b6858b03a6cae635deeaeab09a74e598979b72c917cbfff0bb3fe2cd05111dbc",
} as const;

const input = (page: Page) => page.locator("textarea[data-hash-input]");
const value = (page: Page) => page.locator("[data-hash-value]");
const algorithmLabel = (page: Page) => page.locator("[data-hash-algorithm]");
const status = (page: Page) => page.locator("[data-hash-status]");
const feedback = (page: Page) => page.locator("[data-hash-feedback]");
const result = (page: Page) => page.locator("[data-hash-result]");
const error = (page: Page) => page.locator('[data-error-for="input"]');
const generate = (page: Page) =>
  page.getByRole("button", { name: "Generate hash" });
const clear = (page: Page) => page.getByRole("button", { name: "Clear" });
const copy = (page: Page) => page.getByRole("button", { name: "Copy hash" });

const selectAlgorithm = async (page: Page, name: string) => {
  await page.locator(".segmented label").filter({ hasText: name }).click();
  await expect(page.getByRole("radio", { name })).toBeChecked();
};

const ring = async (locator: Locator) => {
  await expect(locator).toHaveCSS("outline-width", "2px");
  await expect(locator).toHaveCSS("outline-style", "solid");
  await expect(locator).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(locator).toHaveCSS("outline-offset", "2px");
};

const generateFor = async (page: Page, text: string) => {
  await input(page).fill(text);
  await generate(page).click();
};

test("loads with the empty state and SHA-256 selected", async ({ page }) => {
  await page.goto("/hash-generator");

  await expect(page).toHaveTitle("Hash Generator — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Hash Generator",
  );

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(breadcrumb.getByText("Hash Generator")).toBeVisible();

  await expect(page.getByRole("radio", { name: "SHA-256" })).toBeChecked();
  await expect(algorithmLabel(page)).toHaveText("SHA-256");
  await expect(input(page)).toHaveValue("");
  await expect(value(page)).toHaveText("—");
  await expect(status(page)).toHaveText("");
  await expect(copy(page)).toBeDisabled();
  await expect(result(page)).toHaveAttribute("aria-busy", "false");
  await expect(
    page.getByText("Hashing is not encryption", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Computed locally", { exact: true }),
  ).toBeVisible();
});

test("generates the SHA-256 known vector for abc", async ({ page }) => {
  await page.goto("/hash-generator");
  await generateFor(page, "abc");

  await expect(value(page)).toHaveText(VECTORS.sha256Abc);
  await expect(algorithmLabel(page)).toHaveText("SHA-256");
  await expect(status(page)).toHaveText("SHA-256 · 64 hexadecimal characters");
  await expect(copy(page)).toBeEnabled();
  await expect(error(page)).toBeHidden();

  await page.screenshot({
    path: "test-results/hash-generator-sha256.png",
    fullPage: true,
  });
});

test("generates the SHA-384 known vector for abc", async ({ page }) => {
  await page.goto("/hash-generator");
  await selectAlgorithm(page, "SHA-384");
  await generateFor(page, "abc");

  await expect(value(page)).toHaveText(VECTORS.sha384Abc);
  await expect(algorithmLabel(page)).toHaveText("SHA-384");
  await expect(status(page)).toHaveText("SHA-384 · 96 hexadecimal characters");
});

test("generates the SHA-512 known vector for abc", async ({ page }) => {
  await page.goto("/hash-generator");
  await selectAlgorithm(page, "SHA-512");
  await generateFor(page, "abc");

  await expect(value(page)).toHaveText(VECTORS.sha512Abc);
  await expect(algorithmLabel(page)).toHaveText("SHA-512");
  await expect(status(page)).toHaveText("SHA-512 · 128 hexadecimal characters");
});

test("hashes UTF-8 and multiline input from its exact bytes", async ({
  page,
}) => {
  await page.goto("/hash-generator");

  await generateFor(page, "héllo 🚀");
  await expect(value(page)).toHaveText(VECTORS.sha256Unicode);

  await generateFor(page, "line one\nline two");
  await expect(value(page)).toHaveText(VECTORS.sha256Multiline);
});

test("switching algorithms recalculates without clearing the input", async ({
  page,
}) => {
  await page.goto("/hash-generator");
  await generateFor(page, "abc");
  await expect(value(page)).toHaveText(VECTORS.sha256Abc);

  await selectAlgorithm(page, "SHA-384");
  await expect(input(page)).toHaveValue("abc");
  await expect(value(page)).toHaveText(VECTORS.sha384Abc);

  await selectAlgorithm(page, "SHA-512");
  await expect(input(page)).toHaveValue("abc");
  await expect(value(page)).toHaveText(VECTORS.sha512Abc);
});

test("requires non-empty input and clears the error on typing", async ({
  page,
}) => {
  await page.goto("/hash-generator");
  await generate(page).click();

  await expect(error(page)).toContainText("Enter the text you want to hash.");
  await expect(input(page)).toHaveAttribute("aria-invalid", "true");
  await expect(input(page)).toBeFocused();
  await expect(value(page)).toHaveText("—");
  await expect(copy(page)).toBeDisabled();

  await input(page).fill("abc");
  await expect(error(page)).toBeHidden();
  await expect(input(page)).not.toHaveAttribute("aria-invalid");
});

test("clear resets the input and result but keeps the algorithm", async ({
  page,
}) => {
  await page.goto("/hash-generator");
  await selectAlgorithm(page, "SHA-512");
  await generateFor(page, "abc");
  await expect(value(page)).toHaveText(VECTORS.sha512Abc);

  await clear(page).click();

  await expect(input(page)).toHaveValue("");
  await expect(value(page)).toHaveText("—");
  await expect(status(page)).toHaveText("");
  await expect(copy(page)).toBeDisabled();
  await expect(input(page)).toBeFocused();
  await expect(page.getByRole("radio", { name: "SHA-512" })).toBeChecked();
  await expect(algorithmLabel(page)).toHaveText("SHA-512");
});

test("copies the hash with accessible success feedback", async ({
  page,
  browserName,
}) => {
  await prepareClipboard(page, browserName);
  await page.goto("/hash-generator");
  await generateFor(page, "abc");

  await copy(page).click();

  await expect(feedback(page)).toBeVisible();
  await expect(feedback(page)).toHaveText("Copied to clipboard.");
  await expect(feedback(page)).toHaveClass(/text-success/);
  await expect(page.locator("[data-hash-copied-icon]")).toBeVisible();

  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe(VECTORS.sha256Abc);
});

test("reports clipboard failure without losing the hash", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: () => Promise.reject(new Error("permission denied")),
      },
    });
  });
  await page.goto("/hash-generator");
  await generateFor(page, "abc");
  await copy(page).click();

  await expect(feedback(page)).toBeVisible();
  await expect(feedback(page)).toHaveText(
    "Copy failed — select the hash and copy it manually.",
  );
  await expect(feedback(page)).toHaveClass(/text-error/);
  await expect(value(page)).toHaveText(VECTORS.sha256Abc);
});

test("disables generation when crypto.subtle is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window.crypto, "subtle", {
      configurable: true,
      value: undefined,
    });
  });
  await page.goto("/hash-generator");

  const alert = page.locator("[data-hash-unsupported]");
  await expect(alert).toBeVisible();
  await expect(alert).toHaveAttribute("role", "alert");
  await expect(alert).toContainText("Web Crypto is unavailable");
  await expect(generate(page)).toBeDisabled();
  await expect(value(page)).toHaveText("—");
});

test("shows a digest failure without producing a fake hash", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window.crypto.subtle, "digest", {
      configurable: true,
      value: () => Promise.reject(new Error("digest failed")),
    });
  });
  await page.goto("/hash-generator");
  await generateFor(page, "abc");

  const failure = page.locator("[data-hash-failure]");
  await expect(failure).toBeVisible();
  await expect(failure).toHaveAttribute("role", "alert");
  await expect(failure).toContainText("Hashing failed");
  await expect(value(page)).toHaveText("—");
  await expect(copy(page)).toBeDisabled();
});

test("shows a loading state while the digest is computed", async ({ page }) => {
  await page.addInitScript(() => {
    const subtle = window.crypto.subtle;
    const original = subtle.digest.bind(subtle);
    Object.defineProperty(subtle, "digest", {
      configurable: true,
      value: async (algorithm: AlgorithmIdentifier, data: BufferSource) => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        return original(algorithm, data);
      },
    });
  });
  await page.goto("/hash-generator");
  await input(page).fill("abc");
  await generate(page).click();

  await expect(generate(page)).toBeDisabled();
  await expect(result(page)).toHaveAttribute("aria-busy", "true");
  await expect(status(page)).toHaveText("Generating SHA-256 hash…");
  await expect(value(page)).toHaveText("…");

  await expect(value(page)).toHaveText(VECTORS.sha256Abc);
  await expect(result(page)).toHaveAttribute("aria-busy", "false");
  await expect(generate(page)).toBeEnabled();
});

test("is keyboard operable and keeps 44px targets with focus rings", async ({
  page,
  browserName,
}) => {
  await page.goto("/hash-generator");

  await tabTo(page, browserName, input(page));
  await ring(input(page));
  await input(page).fill("abc");

  await page.keyboard.press(
    browserName === "webkit" ? "Shift+Alt+Tab" : "Shift+Tab",
  );
  const sha256 = page.getByRole("radio", { name: "SHA-256" });
  await expect(sha256).toBeFocused();
  await ring(sha256.locator(".."));

  await page.keyboard.press("ArrowRight");
  const sha384 = page.getByRole("radio", { name: "SHA-384" });
  await expect(sha384).toBeChecked();
  await expect(value(page)).toHaveText(VECTORS.sha384Abc);

  await tabTo(page, browserName, generate(page));
  await ring(generate(page));
  await page.keyboard.press("Enter");
  await expect(value(page)).toHaveText(VECTORS.sha384Abc);

  for (const button of [generate(page), clear(page), copy(page)]) {
    const box = await button.boundingBox();
    if (!box) throw new Error("button is not visible");
    expect(box.height).toBeGreaterThanOrEqual(44);
  }

  const algorithmLabelBox = await page
    .locator(".segmented label")
    .first()
    .boundingBox();
  if (!algorithmLabelBox) throw new Error("algorithm label is not visible");
  expect(algorithmLabelBox.height).toBeGreaterThanOrEqual(44);
});

test("the Spanish page is localized and hashes text", async ({ page }) => {
  await page.goto("/es/hash-generator");

  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Generador de hash",
  );
  await expect(page.getByLabel("Texto para hashear")).toBeVisible();
  await expect(page.getByText("Algoritmo", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Hashear no es cifrar", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Calculado localmente", { exact: true }),
  ).toBeVisible();

  await page.getByLabel("Texto para hashear").fill("abc");
  await page.getByRole("button", { name: "Generar hash" }).click();

  await expect(value(page)).toHaveText(VECTORS.sha256Abc);
  await expect(status(page)).toHaveText(
    "SHA-256 · 64 caracteres hexadecimales",
  );
  await expect(page.getByRole("button", { name: "Copiar hash" })).toBeEnabled();

  await page.screenshot({
    path: "test-results/hash-generator-es.png",
    fullPage: true,
  });
});

test("keeps SHA-512 output inside the viewport at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });

  for (const path of ["/hash-generator", "/es/hash-generator"]) {
    await page.goto(path);
    await page
      .locator(".segmented label")
      .filter({ hasText: "SHA-512" })
      .click();
    await page.locator("#hash-input").fill("abc");
    await page.locator("[data-hash-generate]").click();
    await expect(value(page)).toHaveText(VECTORS.sha512Abc);

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, `${path} overflows horizontally`).toBeLessThanOrEqual(0);
    await expect(value(page)).toBeVisible();
    const copyBox = await page.locator("[data-hash-copy]").boundingBox();
    if (!copyBox) throw new Error("copy button is not visible");
    expect(copyBox.height).toBeGreaterThanOrEqual(44);
  }
});

test("exposes canonical, alternates, structured data, and sitemap entries", async ({
  page,
  request,
}) => {
  await page.goto("/hash-generator/");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://appkitx.com/hash-generator/",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute("href", "https://appkitx.com/hash-generator/");
  await expect(
    page.locator('link[rel="alternate"][hreflang="es"]'),
  ).toHaveAttribute("href", "https://appkitx.com/es/hash-generator/");
  await expect(
    page.locator('link[rel="alternate"][hreflang="x-default"]'),
  ).toHaveAttribute("href", "https://appkitx.com/hash-generator/");

  const documents = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) =>
      scripts.map((script) => JSON.parse(script.textContent ?? "")),
    );

  const breadcrumb = documents.find(
    (document) => document["@type"] === "BreadcrumbList",
  );
  expect(breadcrumb).toBeDefined();

  const application = documents.find(
    (document) => document["@type"] === "WebApplication",
  );
  expect(application).toMatchObject({
    name: "Hash Generator",
    url: "https://appkitx.com/hash-generator/",
    applicationCategory: "UtilitiesApplication",
    isAccessibleForFree: true,
    inLanguage: "en",
  });
  expect(application).not.toHaveProperty("aggregateRating");
  expect(application).not.toHaveProperty("offers");

  await page.goto("/es/hash-generator/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://appkitx.com/es/hash-generator/",
  );

  const sitemap = await (await request.get("/sitemap-0.xml")).text();
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
    (match) => match[1],
  );
  expect(urls).toHaveLength(86);
  expect(urls).toContain("https://appkitx.com/hash-generator/");
  expect(urls).toContain("https://appkitx.com/es/hash-generator/");
  expect(sitemap).not.toContain("pc-builder");

  expect((await request.get("/pc-builder/")).status()).toBe(404);
  expect((await request.get("/es/pc-builder/")).status()).toBe(404);
});

test("is discoverable from the category, homepage, search, and related tools", async ({
  page,
}) => {
  await page.goto("/developer-tools/");
  await expect(
    page.getByRole("main").getByRole("link", { name: /Hash Generator/ }),
  ).toHaveAttribute("href", "/hash-generator/");

  await page.goto("/es/developer-tools/");
  await expect(
    page.getByRole("main").getByRole("link", { name: /Generador de hash/ }),
  ).toHaveAttribute("href", "/es/hash-generator/");

  await page.goto("/");
  await expect(
    page.locator("#tools").getByRole("link", { name: "Hash Generator" }),
  ).toHaveAttribute("href", "/hash-generator/");

  await page.waitForLoadState("load");
  await page.keyboard.press("Control+k");
  await expect(page.locator("[data-search-palette]")).toBeVisible();
  await page.locator("[data-search-input]").fill("hash");
  await expect(page.getByRole("option")).toHaveCount(1);
  await expect(page.getByRole("option")).toContainText("Hash Generator");
  await expect(page.getByRole("option")).toHaveAttribute(
    "href",
    "/hash-generator/",
  );

  await page.goto("/hash-generator/");
  await expect(
    page.getByRole("main").getByRole("link", { name: /Base64 Encoder/ }),
  ).toHaveAttribute("href", "/base64-encoder/");
  await expect(
    page.getByRole("main").getByRole("link", { name: /UUID Generator/ }),
  ).toHaveAttribute("href", "/uuid-generator/");
  await expect(
    page.getByRole("main").locator('.prose a[href="/base64-encoder/"]'),
  ).toHaveCount(1);
  await expect(
    page.getByRole("main").locator('.prose a[href="/uuid-generator/"]'),
  ).toHaveCount(1);

  await page.goto("/uuid-generator/");
  await expect(
    page.getByRole("main").locator('.prose a[href="/hash-generator/"]'),
  ).toHaveCount(1);
});

test("never transmits or stores input or hashes", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    requests.push(`${request.url()} ${request.postData() ?? ""}`);
  });

  await page.goto("/hash-generator");
  const secret = "private-hash-input-4f8a2c";
  await generateFor(page, secret);
  const digest = (await value(page).innerText()).trim();
  expect(digest).toHaveLength(64);

  await page.waitForTimeout(300);

  expect(
    requests.some(
      (request) => request.includes(secret) || request.includes(digest),
    ),
    "input and hash must never appear in a request URL or body",
  ).toBe(false);

  const origin = new URL(page.url()).origin;
  expect(
    requests.every((request) => request.startsWith(origin)),
    "hashing must not call a third-party service",
  ).toBe(true);

  const storage = await page.evaluate(() =>
    JSON.stringify({
      local: localStorage,
      session: sessionStorage,
    }),
  );
  expect(storage).not.toContain(secret);
  expect(storage).not.toContain(digest);
});
