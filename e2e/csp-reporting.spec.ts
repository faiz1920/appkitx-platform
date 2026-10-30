import { expect, test, type APIRequestContext } from "@playwright/test";

const REPORT_PATH = "/__csp-report";

const CHROME_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36";

function legacyPayload(overrides: Record<string, unknown> = {}) {
  return {
    "csp-report": {
      "document-uri":
        "http://127.0.0.1:4399/percentage-calculator/?secret=query#fragment",
      referrer: "https://private.example/path?token=secret",
      "violated-directive": "script-src 'self'",
      "effective-directive": "script-src-elem",
      "original-policy": "default-src 'none'; script-src 'self'",
      disposition: "report",
      "blocked-uri": "https://evil.example/steal.js?token=secret#frag",
      "line-number": 12,
      "column-number": 34,
      "source-file": "http://127.0.0.1:4399/app.js?secret=1",
      "status-code": 200,
      "script-sample": "alert('secret')",
      ...overrides,
    },
  };
}

function reportingPayload(bodies: Record<string, unknown>[]) {
  return bodies.map((body) => ({
    type: "csp-violation",
    age: 10,
    url: "http://127.0.0.1:4399/percentage-calculator/?secret=query#frag",
    user_agent: CHROME_UA,
    body,
  }));
}

function reportingBody(overrides: Record<string, unknown> = {}) {
  return {
    documentURL: "http://127.0.0.1:4399/percentage-calculator/",
    blockedURL: "https://evil.example/steal.js?token=secret#frag",
    effectiveDirective: "script-src-elem",
    originalPolicy: "default-src 'none'; script-src 'self'",
    disposition: "report",
    sample: "alert('secret')",
    sourceFile: "http://127.0.0.1:4399/app.js?secret=1",
    statusCode: 200,
    lineNumber: 12,
    columnNumber: 34,
    ...overrides,
  };
}

function post(
  request: APIRequestContext,
  body: string,
  contentType = "application/csp-report",
  headers: Record<string, string> = {},
) {
  return request.post(REPORT_PATH, {
    headers: {
      "content-type": contentType,
      "user-agent": CHROME_UA,
      ...headers,
    },
    data: body,
  });
}

test("accepts a legacy CSP report and does not cache the response", async ({
  request,
}) => {
  const response = await post(request, JSON.stringify(legacyPayload()));

  expect(response.status()).toBe(204);
  expect(response.headers()["cache-control"]).toBe("no-store");
  expect(response.headers()["content-type"]).toBeUndefined();
  expect(await response.text()).toBe("");
});

test("accepts a Reporting API report", async ({ request }) => {
  const response = await post(
    request,
    JSON.stringify(reportingPayload([reportingBody()])),
    "application/reports+json",
  );

  expect(response.status()).toBe(204);
});

test("accepts multiple reports in one bounded batch", async ({ request }) => {
  const response = await post(
    request,
    JSON.stringify(
      reportingPayload([
        reportingBody(),
        reportingBody({
          effectiveDirective: "img-src",
          blockedURL: "inline",
        }),
      ]),
    ),
    "application/reports+json",
  );

  expect(response.status()).toBe(204);
});

test("rejects unsupported methods", async ({ request }) => {
  const response = await request.get(REPORT_PATH);

  expect(response.status()).toBe(405);
  expect(response.headers()["allow"]).toBe("POST");
});

test("rejects unsupported media types", async ({ request }) => {
  const response = await post(
    request,
    JSON.stringify(legacyPayload()),
    "application/json",
  );

  expect(response.status()).toBe(415);
});

test("rejects invalid JSON without reflecting it", async ({ request }) => {
  const response = await post(request, '{"secret":"do-not-reflect"');

  expect(response.status()).toBe(400);
  expect(await response.text()).not.toContain("do-not-reflect");
});

test("rejects an empty payload", async ({ request }) => {
  const response = await post(request, "");

  expect(response.status()).toBe(400);
});

test("rejects an oversized payload", async ({ request }) => {
  const response = await post(request, "x".repeat(33 * 1024));

  expect(response.status()).toBe(413);
});

test("rejects an excessive Reporting API batch", async ({ request }) => {
  const response = await post(
    request,
    JSON.stringify(
      reportingPayload(Array.from({ length: 21 }, () => reportingBody())),
    ),
    "application/reports+json",
  );

  expect(response.status()).toBe(413);
});

test("accepts reports with malformed URLs and missing optional fields", async ({
  request,
}) => {
  const malformed = await post(
    request,
    JSON.stringify(
      legacyPayload({
        "document-uri": "not a url",
        "blocked-uri": "http://[",
        disposition: undefined,
      }),
    ),
  );
  const missing = await post(
    request,
    JSON.stringify({ "csp-report": { "effective-directive": "script-src" } }),
  );

  expect(malformed.status()).toBe(204);
  expect(missing.status()).toBe(204);
});

test("accepts unexpected fields but does not expose them", async ({
  request,
}) => {
  const response = await post(
    request,
    JSON.stringify(
      legacyPayload({
        unexpected: "discard-me",
        cookie: "session=secret",
      }),
    ),
    "application/csp-report",
    { cookie: "session=secret", authorization: "Bearer secret" },
  );

  expect(response.status()).toBe(204);
});

test("rejects cross-origin submissions", async ({ request }) => {
  const response = await post(
    request,
    JSON.stringify(legacyPayload()),
    "application/csp-report",
    { origin: "https://evil.example" },
  );

  expect(response.status()).toBe(403);
});

test("browser delivers a report-only violation to the collector", async ({
  page,
}) => {
  const deliveries: Array<{
    contentType: string;
    body: string;
    status: number;
  }> = [];

  page.on("response", (response) => {
    if (new URL(response.url()).pathname !== REPORT_PATH) {
      return;
    }

    const request = response.request();

    deliveries.push({
      contentType: request.headers()["content-type"] ?? "",
      body: request.postData() ?? "",
      status: response.status(),
    });
  });

  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    const script = document.createElement("script");
    script.textContent =
      'window.__cspReportingDeliveryProbe = "report-delivery";';
    document.head.append(script);
  });

  await expect
    .poll(() => deliveries.length, { timeout: 15_000 })
    .toBeGreaterThan(0);

  const serialized = deliveries.map((delivery) => delivery.body).join("\n");

  expect(serialized).toContain("script-src");

  for (const delivery of deliveries) {
    const mediaType = delivery.contentType.split(";")[0].trim();

    expect(delivery.status).toBe(204);
    expect(["application/csp-report", "application/reports+json"]).toContain(
      mediaType,
    );

    const payload = JSON.parse(delivery.body) as unknown;

    if (mediaType === "application/csp-report") {
      expect(
        (payload as { "csp-report"?: unknown })["csp-report"],
      ).toBeTruthy();
    } else {
      expect(Array.isArray(payload)).toBe(true);
      expect(
        (payload as Array<{ type?: string }>).some(
          (report) => report.type === "csp-violation",
        ),
      ).toBe(true);
    }
  }
});
