import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import {
  buildInlineScriptInventory,
  type HtmlDocument,
} from "../src/lib/csp-inline-hashes";
import { CSP_REPORT_ONLY_HEADER } from "../src/lib/csp-report-only";

const CSP_HEADER = CSP_REPORT_ONLY_HEADER.toLowerCase();
const CSP_ROUTE_PATHS = [
  { path: "/", status: 200 },
  { path: "/es/", status: 200 },
  { path: "/percentage-calculator/", status: 200 },
  { path: "/es/json-formatter/", status: 200 },
  { path: "/date-time/", status: 200 },
  { path: "/es/calculators/", status: 200 },
  { path: "/404", status: 404 },
  { path: "/404.html", status: 404 },
  { path: "/definitely-not-a-real-csp-page", status: 404 },
] as const;

type CspViolationRecord = {
  directive: string;
  blockedURI: string;
  disposition: string;
  sample: string;
};

function collectHtmlFiles(directory: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectHtmlFiles(path));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(path);
    }
  }

  return files.sort();
}

function readBuildInventory() {
  const root = join(process.cwd(), "dist");
  let files: string[];

  try {
    files = collectHtmlFiles(root);
  } catch {
    throw new Error(
      `Cannot read the CSP inventory: ${root} was not found. Run "npm run build" first.`,
    );
  }

  const documents: HtmlDocument[] = files.map((path) => ({
    file: relative(root, path).split(sep).join("/"),
    html: readFileSync(path, "utf8"),
  }));

  return buildInlineScriptInventory(root, documents);
}

function parseCspHashes(policy: string): string[] {
  return [
    ...policy.matchAll(/'((?:sha256|sha384|sha512)-[A-Za-z0-9+/=]+)'/g),
  ].map((match) => match[1]);
}

async function installViolationCollector(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const windowWithViolations = window as Window & {
      __cspViolations?: CspViolationRecord[];
    };

    windowWithViolations.__cspViolations = [];

    document.addEventListener("securitypolicyviolation", (event) => {
      windowWithViolations.__cspViolations?.push({
        directive: event.effectiveDirective,
        blockedURI: event.blockedURI,
        disposition: event.disposition,
        sample: event.sample,
      });
    });
  });
}

async function getViolations(page: Page): Promise<CspViolationRecord[]> {
  return page.evaluate(() => {
    const windowWithViolations = window as Window & {
      __cspViolations?: CspViolationRecord[];
    };

    return windowWithViolations.__cspViolations ?? [];
  });
}

async function expectNoViolations(page: Page): Promise<void> {
  const violations = await getViolations(page);
  expect(violations, JSON.stringify(violations)).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await installViolationCollector(page);
});

test("the generated header matches the fresh build inventory", async ({
  request,
}) => {
  const inventory = readBuildInventory();
  const expectedHashes = inventory.uniqueExecutable
    .map((entry) => entry.hash)
    .sort();
  const response = await request.get("/");
  const headers = response.headers();
  const policy = headers[CSP_HEADER];

  expect(response.status()).toBe(200);
  expect(headers["content-security-policy"]).toBeUndefined();
  expect(policy, "the report-only CSP header is missing").toBeTruthy();
  expect(policy!.split("script-src")).toHaveLength(2);
  expect(expectedHashes).toHaveLength(6);
  expect(parseCspHashes(policy!).sort()).toEqual(expectedHashes);
  expect(policy).toContain("default-src 'none'");
  expect(policy).toContain("https://static.cloudflareinsights.com");
  expect(policy).toContain("connect-src 'self' https://cloudflareinsights.com");
  expect(policy).toContain("report-uri /__csp-report");
  expect(policy).not.toContain("report-to");
  expect(policy).not.toContain("'unsafe-inline'");
  expect(policy).not.toContain("'unsafe-eval'");
  expect(policy).not.toContain("'strict-dynamic'");
});

test("the generated _headers artifact preserves existing rules and has one CSP line", () => {
  const headers = readFileSync(join(process.cwd(), "dist", "_headers"), "utf8");
  const cspLines = headers
    .split(/\r?\n/)
    .filter((line) => line.trim().toLowerCase().startsWith(`${CSP_HEADER}:`));

  expect(cspLines).toHaveLength(1);
  expect(cspLines[0].length).toBeLessThanOrEqual(2000);
  expect(cspLines[0]).toContain("report-uri /__csp-report");
  expect(cspLines[0]).not.toContain("report-to");
  expect(headers).toContain("# Hashed build assets are content-addressed");
  expect(headers).toContain(
    "  Cache-Control: public, max-age=31536000, immutable",
  );
  expect(headers).toContain("  X-Content-Type-Options: nosniff");
  expect(headers).toContain(
    "  Referrer-Policy: strict-origin-when-cross-origin",
  );
  expect(headers).toContain("  X-Frame-Options: DENY");
  expect(headers).toContain(
    "  Permissions-Policy: camera=(), geolocation=(), microphone=()",
  );
});

test("the header is present on ordinary, tool, Spanish, and 404 responses", async ({
  request,
}) => {
  for (const { path, status } of CSP_ROUTE_PATHS) {
    const response = await request.get(path, { maxRedirects: 0 });
    const headers = response.headers();

    expect(response.status(), `${path} status`).toBe(status);
    expect(headers[CSP_HEADER], `${path} report-only header`).toBeTruthy();
    expect(
      headers["content-security-policy"],
      `${path} must not enforce CSP`,
    ).toBeUndefined();
  }
});

test("representative pages and interactions emit no report-only violations", async ({
  page,
}) => {
  for (const { path } of CSP_ROUTE_PATHS) {
    const response = await page.goto(path, { waitUntil: "networkidle" });
    expect(response?.status(), `${path} status`).toBe(
      CSP_ROUTE_PATHS.find((route) => route.path === path)?.status,
    );
    await expect(page.locator("body")).toBeVisible();
    await expectNoViolations(page);
  }

  await page.goto("/", { waitUntil: "networkidle" });
  await page.keyboard.press("Control+k");
  await expect(page.locator("[data-search-palette]")).toBeVisible();
  await page.locator("[data-search-input]").fill("percent");
  await expect(page.getByRole("option")).toHaveCount(1);
  await page.keyboard.press("Escape");

  await page.locator("[data-hero-search-input]").fill("markdown");
  await page.locator("[data-hero-search-input]").press("Enter");
  await expect(page.locator("[data-search-input]")).toHaveValue("markdown");
  await page.keyboard.press("Escape");

  const switcher = page.locator("[data-language-switcher]").first();
  await switcher.locator("summary").click();
  await expect(switcher).toHaveJSProperty("open", true);
  await switcher.locator("summary").press("Escape");
  await expect(switcher).toHaveJSProperty("open", false);

  await expectNoViolations(page);

  await page.goto("/percentage-calculator/", { waitUntil: "networkidle" });
  await page.getByLabel("Percentage (X%)").fill("25");
  await page.getByLabel("Value (Y)").fill("80");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(page.locator("[data-result-value]")).toHaveText("20");
  await expectNoViolations(page);
});

test("the mobile menu script runs without violations", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto("/es/", { waitUntil: "networkidle" });

  const menu = page.locator("#global-menu");
  await page.locator("[data-menu-toggle]").click();
  await expect(menu).not.toHaveAttribute("hidden");
  await page.locator("[data-menu-toggle]").click();
  await expect(menu).toHaveAttribute("hidden");

  await expectNoViolations(page);
});

test("all three 404 paths render the branded page and search works", async ({
  page,
}) => {
  for (const path of ["/404", "/404.html", "/definitely-not-a-real-csp-page"]) {
    const response = await page.goto(path, { waitUntil: "networkidle" });

    expect(response?.status(), `${path} status`).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Page not found",
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex",
    );

    await page.getByPlaceholder("Search free tools…").fill("markdown");
    await page.getByPlaceholder("Search free tools…").press("Enter");
    await expect(page.locator("[data-search-palette]")).toBeVisible();
    await expect(page.locator("[data-search-input]")).toHaveValue("markdown");

    await expectNoViolations(page);
  }
});

test("report-only mode records an unlisted inline script without blocking it", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });

  const executed = await page.evaluate(() => {
    const script = document.createElement("script");
    script.textContent = "window.__cspDeliberateViolation = true;";
    document.head.append(script);

    return (window as Window & { __cspDeliberateViolation?: boolean })
      .__cspDeliberateViolation;
  });

  expect(executed).toBe(true);
  await expect
    .poll(async () => (await getViolations(page)).length)
    .toBeGreaterThan(0);

  const violations = await getViolations(page);
  expect(violations[0]?.blockedURI).toBe("inline");
  expect(violations[0]?.disposition).toBe("report");
});

test("local RUM simulation exercises the external script host and same-origin beacon", async ({
  page,
}) => {
  const rumStub = `
    window.__cspRumStubLoaded = true;
    navigator.sendBeacon(
      "/cdn-cgi/rum",
      new Blob(["csp-rum-simulation"], { type: "application/json" }),
    );
  `;
  const beaconTag =
    '<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js/csp-test"></script>';
  const rumRequests: string[] = [];

  page.on("request", (request) => {
    if (request.url().includes("/cdn-cgi/rum")) {
      rumRequests.push(request.url());
    }
  });

  await page.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.hostname === "static.cloudflareinsights.com") {
      await route.fulfill({
        status: 200,
        contentType: "text/javascript",
        body: rumStub,
      });
      return;
    }

    if (url.pathname === "/cdn-cgi/rum") {
      await route.fulfill({ status: 204, body: "" });
      return;
    }

    if (request.resourceType() === "document") {
      const response = await route.fetch();
      const headers = { ...response.headers() };
      let body = await response.text();

      body = body.replace("</body>", `${beaconTag}</body>`);
      delete headers["content-encoding"];
      headers["content-length"] = String(Buffer.byteLength(body));

      await route.fulfill({
        status: response.status(),
        headers,
        body,
      });
      return;
    }

    await route.continue();
  });

  await page.goto("/", { waitUntil: "networkidle" });
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { __cspRumStubLoaded?: boolean })
            .__cspRumStubLoaded === true,
      ),
    )
    .toBe(true);
  await expect.poll(() => rumRequests.length).toBe(1);
  await expectNoViolations(page);
});

test("no page emits a CSP meta tag", async ({ page }) => {
  for (const path of ["/", "/es/", "/percentage-calculator/", "/404"]) {
    await page.goto(path);
    const count = await page.evaluate(
      () =>
        [...document.querySelectorAll("meta[http-equiv]")].filter(
          (meta) =>
            meta.getAttribute("http-equiv")?.toLowerCase() ===
            "content-security-policy",
        ).length,
    );

    expect(count, `${path} CSP meta tag`).toBe(0);
  }
});
