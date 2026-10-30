import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CSP_REPORT_MAX_BODY_BYTES,
  CSP_REPORT_MAX_REPORTS,
  CSP_REPORT_PATH,
  CSP_REPORT_SCHEMA_VERSION,
  createAnalyticsEngineSink,
  detectBrowserFamily,
  handleCspReportRequest,
  type CspReportSink,
  type NormalizedCspReport,
} from "../src/lib/csp-report";

const BASE_URL = `https://appkitx.com${CSP_REPORT_PATH}`;
const CHROME_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36";

function legacyBody(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    "document-uri":
      "https://appkitx.com/percentage-calculator/?secret=query#fragment",
    referrer: "https://private.example/path?token=secret",
    "violated-directive": "script-src 'self' 'sha256-approved'",
    "effective-directive": "script-src-elem",
    "original-policy": "default-src 'none'; script-src 'self'",
    disposition: "report",
    "blocked-uri": "https://evil.example/steal.js?token=secret#frag",
    "line-number": 12,
    "column-number": 34,
    "source-file": "https://appkitx.com/app.js?secret=1",
    "status-code": 200,
    "script-sample": "alert('secret')",
    ...overrides,
  };
}

function legacyPayload(overrides: Record<string, unknown> = {}) {
  return { "csp-report": legacyBody(overrides) };
}

function reportingBody(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    documentURL:
      "https://appkitx.com/percentage-calculator/?secret=query#fragment",
    referrer: "https://private.example/path?token=secret",
    blockedURL: "https://evil.example/steal.js?token=secret#frag",
    effectiveDirective: "script-src-elem",
    originalPolicy: "default-src 'none'; script-src 'self'",
    disposition: "report",
    sample: "alert('secret')",
    sourceFile: "https://appkitx.com/app.js?secret=1",
    statusCode: 200,
    lineNumber: 12,
    columnNumber: 34,
    ...overrides,
  };
}

function reportingPayload(bodies: Record<string, unknown>[]) {
  return bodies.map((body) => ({
    type: "csp-violation",
    age: 10,
    url: "https://appkitx.com/percentage-calculator/?secret=query#frag",
    user_agent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36",
    body,
  }));
}

function reportRequest(
  body: string,
  contentType = "application/csp-report",
  extraHeaders: Record<string, string> = {},
) {
  return new Request(BASE_URL, {
    method: "POST",
    headers: {
      "content-type": contentType,
      "user-agent": CHROME_UA,
      ...extraHeaders,
    },
    body,
  });
}

function createSink() {
  const records: NormalizedCspReport[] = [];
  const sink: CspReportSink = {
    record(report) {
      records.push(report);
    },
  };

  return { records, sink };
}

async function call(
  request: Request,
  sink: CspReportSink | undefined = createSink().sink,
) {
  return handleCspReportRequest(request, sink);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CSP report endpoint", () => {
  it("accepts a valid legacy report and stores only normalized fields", async () => {
    const { records, sink } = createSink();
    const response = await call(
      reportRequest(JSON.stringify(legacyPayload())),
      sink,
    );

    expect(response.status).toBe(204);
    expect(records).toHaveLength(1);
    expect(records[0]).toEqual({
      effectiveDirective: "script-src-elem",
      violatedDirective: "script-src",
      disposition: "report",
      blockedOrigin: "https://evil.example",
      documentPath: "/percentage-calculator/",
      browserFamily: "chromium",
      count: 1,
    });
  });

  it("accepts WebKit's hybrid csp-report envelope", async () => {
    const { records, sink } = createSink();
    const response = await call(
      reportRequest(
        JSON.stringify({
          type: "csp-violation",
          url: "https://appkitx.com/",
          "csp-report": legacyBody(),
        }),
      ),
      sink,
    );

    expect(response.status).toBe(204);
    expect(records).toHaveLength(1);
    expect(records[0]?.effectiveDirective).toBe("script-src-elem");
  });

  it("accepts a valid Reporting API report", async () => {
    const { records, sink } = createSink();
    const response = await call(
      reportRequest(
        JSON.stringify(reportingPayload([reportingBody()])),
        "application/reports+json",
      ),
      sink,
    );

    expect(response.status).toBe(204);
    expect(records).toHaveLength(1);
    expect(records[0]?.effectiveDirective).toBe("script-src-elem");
    expect(records[0]?.documentPath).toBe("/percentage-calculator/");
    expect(records[0]?.blockedOrigin).toBe("https://evil.example");
  });

  it("accepts multiple Reporting API reports in one batch", async () => {
    const { records, sink } = createSink();
    const response = await call(
      reportRequest(
        JSON.stringify(
          reportingPayload([
            reportingBody(),
            reportingBody({
              effectiveDirective: "img-src",
              documentURL: "https://appkitx.com/es/age-calculator/",
              blockedURL: "inline",
            }),
          ]),
        ),
        "application/reports+json",
      ),
      sink,
    );

    expect(response.status).toBe(204);
    expect(records).toHaveLength(2);
    expect(records[1]?.effectiveDirective).toBe("img-src");
    expect(records[1]?.blockedOrigin).toBe("inline");
  });

  it("accepts a content type with a charset parameter", async () => {
    const response = await call(
      reportRequest(
        JSON.stringify(legacyPayload()),
        "application/csp-report; charset=utf-8",
      ),
    );

    expect(response.status).toBe(204);
  });

  it("rejects unsupported methods with an Allow header", async () => {
    const response = await call(new Request(BASE_URL, { method: "GET" }));

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("POST");
  });

  it("rejects unsupported content types", async () => {
    const response = await call(
      reportRequest(JSON.stringify(legacyPayload()), "application/json"),
    );

    expect(response.status).toBe(415);
  });

  it("rejects invalid JSON without reflecting the body", async () => {
    const response = await call(reportRequest('{"secret":"do-not-reflect"'));

    expect(response.status).toBe(400);
    expect(await response.text()).not.toContain("do-not-reflect");
  });

  it("rejects an empty payload", async () => {
    const response = await call(reportRequest(""));

    expect(response.status).toBe(400);
  });

  it("rejects an oversized declared body", async () => {
    const response = await call(
      reportRequest("{}", "application/csp-report", {
        "content-length": String(CSP_REPORT_MAX_BODY_BYTES + 1),
      }),
    );

    expect(response.status).toBe(413);
  });

  it("rejects an oversized streamed body", async () => {
    const response = await call(
      reportRequest("x".repeat(CSP_REPORT_MAX_BODY_BYTES + 1)),
    );

    expect(response.status).toBe(413);
  });

  it("rejects a body stream error without throwing", async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.error(new Error("stream failure"));
      },
    });
    const request = new Request(BASE_URL, {
      method: "POST",
      headers: { "content-type": "application/csp-report" },
      body: stream,
      duplex: "half",
    } as RequestInit & { duplex: "half" });

    const response = await call(request);

    expect(response.status).toBe(400);
  });

  it("rejects an excessive Reporting API batch", async () => {
    const bodies = Array.from({ length: CSP_REPORT_MAX_REPORTS + 1 }, () =>
      reportingBody(),
    );
    const response = await call(
      reportRequest(
        JSON.stringify(reportingPayload(bodies)),
        "application/reports+json",
      ),
    );

    expect(response.status).toBe(413);
  });

  it("rejects invalid legacy and Reporting API schemas", async () => {
    const cases: Array<[string, string]> = [
      ["application/csp-report", JSON.stringify({})],
      [
        "application/csp-report",
        JSON.stringify({ "csp-report": "not-an-object" }),
      ],
      ["application/reports+json", JSON.stringify([])],
      [
        "application/reports+json",
        JSON.stringify([{ type: "csp-violation", body: {} }]),
      ],
      [
        "application/reports+json",
        JSON.stringify([{ type: "deprecation", body: {} }]),
      ],
      ["application/reports+json", JSON.stringify([{ body: reportingBody() }])],
    ];

    for (const [contentType, body] of cases) {
      const response = await call(reportRequest(body, contentType));
      expect(response.status, `${contentType} ${body}`).toBe(400);
    }
  });

  it("normalizes malformed URLs without rejecting the report", async () => {
    const { records, sink } = createSink();
    const response = await call(
      reportRequest(
        JSON.stringify(
          legacyPayload({
            "document-uri": "not a url",
            "blocked-uri": "http://[",
          }),
        ),
      ),
      sink,
    );

    expect(response.status).toBe(204);
    expect(records[0]?.documentPath).toBe("invalid");
    expect(records[0]?.blockedOrigin).toBe("unknown");
  });

  it("defaults missing optional fields without storing arbitrary values", async () => {
    const { records, sink } = createSink();
    const body = legacyBody();
    delete body.disposition;
    delete body["blocked-uri"];
    delete body["document-uri"];

    const response = await call(
      reportRequest(JSON.stringify({ "csp-report": body })),
      sink,
    );

    expect(response.status).toBe(204);
    expect(records[0]?.disposition).toBe("unknown");
    expect(records[0]?.blockedOrigin).toBe("unknown");
    expect(records[0]?.documentPath).toBe("unknown");
  });

  it("discards unexpected fields and never stores samples, referrers, or request metadata", async () => {
    const { records, sink } = createSink();
    const response = await call(
      reportRequest(
        JSON.stringify(
          legacyPayload({
            unexpected: "discard-me",
            cookie: "session=secret",
            authorization: "Bearer secret",
            "user-agent": CHROME_UA,
          }),
        ),
        "application/csp-report",
        {
          cookie: "session=secret",
          authorization: "Bearer secret",
          "x-forwarded-for": "203.0.113.7",
        },
      ),
      sink,
    );
    const serialized = JSON.stringify(records);

    expect(response.status).toBe(204);
    expect(Object.keys(records[0] ?? {}).sort()).toEqual([
      "blockedOrigin",
      "browserFamily",
      "count",
      "disposition",
      "documentPath",
      "effectiveDirective",
      "violatedDirective",
    ]);
    expect(serialized).not.toContain("secret");
    expect(serialized).not.toContain("discard-me");
    expect(serialized).not.toContain("203.0.113.7");
    expect(serialized).not.toContain("Mozilla/5.0");
    expect(serialized).not.toContain("referrer");
    expect(serialized).not.toContain("source-file");
  });

  it("bounds long paths and blocked origins", async () => {
    const { records, sink } = createSink();
    const response = await call(
      reportRequest(
        JSON.stringify(
          legacyPayload({
            "document-uri": `https://appkitx.com/${"a".repeat(500)}`,
            "blocked-uri": `https://${"b".repeat(300)}.example/path?secret=1`,
          }),
        ),
      ),
      sink,
    );

    expect(response.status).toBe(204);
    expect(records[0]?.documentPath.length).toBeLessThanOrEqual(128);
    expect(records[0]?.blockedOrigin.length).toBeLessThanOrEqual(64);
    expect(records[0]?.blockedOrigin).not.toContain("secret");
  });

  it("classifies blocked resource keywords and schemes", async () => {
    const cases: Array<[string, string]> = [
      ["inline", "inline"],
      ["eval", "eval"],
      ["data:text/html,secret", "data"],
      ["blob:https://appkitx.com/123", "blob"],
      ["about:blank", "about"],
      ["chrome-extension://abc/script.js", "extension"],
      ["/local-script.js", "self"],
    ];

    for (const [blocked, expected] of cases) {
      const { records, sink } = createSink();
      const response = await call(
        reportRequest(
          JSON.stringify(legacyPayload({ "blocked-uri": blocked })),
        ),
        sink,
      );

      expect(response.status, blocked).toBe(204);
      expect(records[0]?.blockedOrigin, blocked).toBe(expected);
    }
  });

  it("rejects cross-origin submissions", async () => {
    const response = await call(
      reportRequest(JSON.stringify(legacyPayload()), "application/csp-report", {
        origin: "https://evil.example",
      }),
    );

    expect(response.status).toBe(403);
  });

  it("accepts a same-origin Origin header", async () => {
    const response = await call(
      reportRequest(JSON.stringify(legacyPayload()), "application/csp-report", {
        origin: "https://appkitx.com",
      }),
    );

    expect(response.status).toBe(204);
  });

  it("accepts WebKit's Origin: null reporting request", async () => {
    const response = await call(
      reportRequest(JSON.stringify(legacyPayload()), "application/csp-report", {
        origin: "null",
        "sec-fetch-site": "same-origin",
      }),
    );

    expect(response.status).toBe(204);
  });

  it("rejects a cross-site request that uses Origin: null", async () => {
    const response = await call(
      reportRequest(JSON.stringify(legacyPayload()), "application/csp-report", {
        origin: "null",
        "sec-fetch-site": "cross-site",
      }),
    );

    expect(response.status).toBe(403);
  });

  it("returns a generic 503 when storage is not configured", async () => {
    const response = await handleCspReportRequest(
      reportRequest(JSON.stringify(legacyPayload())),
      undefined,
    );

    expect(response.status).toBe(503);
    expect(response.headers.get("retry-after")).toBe("3600");
    expect(await response.text()).toBe("Service Unavailable");
  });

  it("acknowledges storage failures without exposing details or crashing", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const sink: CspReportSink = {
      record() {
        throw new Error("sensitive storage detail");
      },
    };
    const response = await call(
      reportRequest(JSON.stringify(legacyPayload())),
      sink,
    );
    const body = await response.text();

    expect(response.status).toBe(204);
    expect(body).toBe("");
    expect(error).toHaveBeenCalledWith("csp_report_storage_failed");
    expect(JSON.stringify(error.mock.calls)).not.toContain(
      "sensitive storage detail",
    );
    expect(JSON.stringify(error.mock.calls)).not.toContain("secret");
  });

  it("returns no-store and nosniff headers", async () => {
    const response = await call(reportRequest(JSON.stringify(legacyPayload())));

    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("content-type")).toBeNull();
  });
});

describe("browser family detection", () => {
  it("derives only a coarse family", () => {
    expect(detectBrowserFamily(CHROME_UA)).toBe("chromium");
    expect(detectBrowserFamily("Mozilla/5.0 ... Firefox/157.0")).toBe(
      "firefox",
    );
    expect(
      detectBrowserFamily(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.2 Safari/605.1.15",
      ),
    ).toBe("webkit");
    expect(detectBrowserFamily("curl/8.0")).toBe("other");
    expect(detectBrowserFamily(null)).toBe("unknown");
  });
});

describe("Analytics Engine sink", () => {
  it("writes the documented bounded schema", () => {
    const points: Array<{
      blobs: string[];
      doubles: number[];
      indexes: string[];
    }> = [];
    const sink = createAnalyticsEngineSink({
      writeDataPoint(point) {
        points.push(point);
      },
    });

    sink.record({
      effectiveDirective: "script-src-elem",
      violatedDirective: "script-src",
      disposition: "report",
      blockedOrigin: "https://evil.example",
      documentPath: "/percentage-calculator/",
      browserFamily: "chromium",
      count: 1,
    });

    expect(points).toEqual([
      {
        blobs: [
          "script-src-elem",
          "script-src",
          "report",
          "https://evil.example",
          "/percentage-calculator/",
          "chromium",
          CSP_REPORT_SCHEMA_VERSION,
        ],
        doubles: [1],
        indexes: ["csp-report"],
      },
    ]);
  });
});
