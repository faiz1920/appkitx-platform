import { describe, expect, it } from "vitest";
import {
  buildInlineScriptInventory,
  computeCspHash,
} from "../src/lib/csp-inline-hashes";
import {
  buildCspReportOnlyPolicy,
  CSP_REPORT_ONLY_HEADER,
  CSP_REPORT_ONLY_MAX_LINE_LENGTH,
  updateCspReportOnlyHeader,
} from "../src/lib/csp-report-only";

const BODIES = ["one()", "two()", "three()", "four()", "five()", "six()"];

const HEADERS = `# Hashed build assets are content-addressed and can be cached forever.
/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: camera=(), geolocation=(), microphone=()
`;

function inventoryWith(
  bodies: readonly string[] = BODIES,
  dataBodies: readonly string[] = [],
) {
  const html = [
    ...bodies.map((body) => `<script>${body}</script>`),
    ...dataBodies.map(
      (body) => `<script type="application/ld+json">${body}</script>`,
    ),
  ].join("");

  return buildInlineScriptInventory("dist", [{ file: "dist/page.html", html }]);
}

function expectedHashes(bodies: readonly string[]): string {
  return bodies
    .map((body) => `'${computeCspHash(body)}'`)
    .sort()
    .join(" ");
}

function policyFor(bodies: readonly string[] = BODIES): string {
  return buildCspReportOnlyPolicy(inventoryWith(bodies));
}

function cspLines(headers: string): string[] {
  return headers
    .split(/\r?\n/)
    .filter((line) =>
      line
        .trim()
        .toLowerCase()
        .startsWith(`${CSP_REPORT_ONLY_HEADER.toLowerCase()}:`),
    );
}

describe("buildCspReportOnlyPolicy", () => {
  it("builds the exact report-only policy from the current inventory shape", () => {
    const policy = policyFor();

    expect(policy).toBe(
      [
        "default-src 'none'",
        `script-src 'self' https://static.cloudflareinsights.com ${expectedHashes(BODIES)}`,
        "style-src 'self'",
        "img-src 'self'",
        "font-src 'self' data:",
        "connect-src 'self' https://cloudflareinsights.com",
        "base-uri 'none'",
        "form-action 'none'",
        "frame-ancestors 'none'",
        "object-src 'none'",
        "worker-src 'none'",
      ].join("; "),
    );
  });

  it("includes every executable hash and excludes JSON-LD data hashes", () => {
    const dataBody = '{"@type":"Thing"}';
    const policy = buildCspReportOnlyPolicy(
      inventoryWith(["real()"], [dataBody]),
    );

    expect(policy).toContain(`'${computeCspHash("real()")}'`);
    expect(policy).not.toContain(computeCspHash(dataBody));
  });

  it("is deterministic regardless of document and body order", () => {
    const forward = buildInlineScriptInventory("dist", [
      { file: "dist/z.html", html: "<script>z()</script>" },
      { file: "dist/a.html", html: "<script>a()</script>" },
    ]);
    const reverse = buildInlineScriptInventory("dist", [
      { file: "dist/a.html", html: "<script>a()</script>" },
      { file: "dist/z.html", html: "<script>z()</script>" },
    ]);

    expect(buildCspReportOnlyPolicy(forward)).toBe(
      buildCspReportOnlyPolicy(reverse),
    );
  });

  it("does not allow inline, eval, strict-dynamic, or reporting directives", () => {
    const policy = policyFor();

    expect(policy).not.toContain("'unsafe-inline'");
    expect(policy).not.toContain("'unsafe-eval'");
    expect(policy).not.toContain("'strict-dynamic'");
    expect(policy).not.toContain("report-uri");
    expect(policy).not.toContain("report-to");
  });

  it("rejects an inventory with no executable inline scripts", () => {
    const inventory = inventoryWith([], ['{"@type":"Thing"}']);

    expect(() => buildCspReportOnlyPolicy(inventory)).toThrow(
      /no executable inline scripts/i,
    );
  });
});

describe("updateCspReportOnlyHeader", () => {
  it("inserts exactly one header into the global block and preserves existing rules", () => {
    const policy = policyFor();
    const updated = updateCspReportOnlyHeader(HEADERS, policy);
    const lines = cspLines(updated);

    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe(`  ${CSP_REPORT_ONLY_HEADER}: ${policy}`);
    expect(updated).toContain(
      "# Hashed build assets are content-addressed and can be cached forever.",
    );
    expect(updated).toContain(
      "  Cache-Control: public, max-age=31536000, immutable",
    );
    expect(updated).toContain("  X-Content-Type-Options: nosniff");
    expect(updated).toContain(
      "  Referrer-Policy: strict-origin-when-cross-origin",
    );
    expect(updated).toContain("  X-Frame-Options: DENY");
    expect(updated).toContain(
      "  Permissions-Policy: camera=(), geolocation=(), microphone=()",
    );
  });

  it("is idempotent and removes only the inserted header when reverted", () => {
    const policy = policyFor();
    const updated = updateCspReportOnlyHeader(HEADERS, policy);

    expect(updateCspReportOnlyHeader(updated, policy)).toBe(updated);

    const withoutHeader = updated
      .split("\n")
      .filter((line) => !line.includes(CSP_REPORT_ONLY_HEADER))
      .join("\n");

    expect(withoutHeader).toBe(HEADERS);
  });

  it("places the header inside the global block, before a following rule", () => {
    const policy = policyFor();
    const headers = `${HEADERS}\n/extra/*\n  X-Extra: yes\n`;
    const updated = updateCspReportOnlyHeader(headers, policy);
    const lines = updated.split("\n");
    const globalIndex = lines.indexOf("/*");
    const extraIndex = lines.indexOf("/extra/*");
    const cspIndex = lines.findIndex((line) =>
      line.includes(CSP_REPORT_ONLY_HEADER),
    );

    expect(globalIndex).toBeGreaterThan(-1);
    expect(cspIndex).toBeGreaterThan(globalIndex);
    expect(cspIndex).toBeLessThan(extraIndex);
  });

  it("replaces an existing value instead of adding a second header", () => {
    const policy = policyFor();
    const existing = HEADERS.replace(
      "  Permissions-Policy: camera=(), geolocation=(), microphone=()\n",
      "  Permissions-Policy: camera=(), geolocation=(), microphone=()\n  Content-Security-Policy-Report-Only: default-src 'none'\n",
    );
    const updated = updateCspReportOnlyHeader(existing, policy);

    expect(cspLines(updated)).toHaveLength(1);
    expect(cspLines(updated)[0]).not.toBe(
      "  Content-Security-Policy-Report-Only: default-src 'none'",
    );
    expect(cspLines(updated)[0]).toContain(policy);
    expect(updateCspReportOnlyHeader(updated, policy)).toBe(updated);
  });

  it("collapses duplicate existing headers to exactly one", () => {
    const policy = policyFor();
    const duplicate = HEADERS.replace(
      "  Permissions-Policy: camera=(), geolocation=(), microphone=()\n",
      "  Permissions-Policy: camera=(), geolocation=(), microphone=()\n  Content-Security-Policy-Report-Only: old-one\n  Content-Security-Policy-Report-Only: old-two\n",
    );
    const updated = updateCspReportOnlyHeader(duplicate, policy);

    expect(cspLines(updated)).toHaveLength(1);
    expect(updated).not.toContain("old-one");
    expect(updated).not.toContain("old-two");
    expect(cspLines(updated)[0]).toContain(policy);
  });

  it("keeps the header line within Cloudflare's limit", () => {
    const policy = policyFor();
    const line = `  ${CSP_REPORT_ONLY_HEADER}: ${policy}`;

    expect(line.length).toBeLessThanOrEqual(CSP_REPORT_ONLY_MAX_LINE_LENGTH);
  });

  it("preserves CRLF line endings", () => {
    const policy = policyFor();
    const crlf = HEADERS.replace(/\n/g, "\r\n");
    const updated = updateCspReportOnlyHeader(crlf, policy);

    expect(updated).toContain("\r\n");
    expect(updated).not.toMatch(/[^\r]\n/);
    expect(cspLines(updated)).toHaveLength(1);
  });

  it("fails when the global block is missing", () => {
    expect(() =>
      updateCspReportOnlyHeader(
        "# comment\n/_astro/*\n  Cache-Control: public, max-age=31536000, immutable\n",
        policyFor(),
      ),
    ).toThrow(/global "\/\*" block was not found/i);
  });

  it("fails when multiple global blocks exist", () => {
    expect(() =>
      updateCspReportOnlyHeader(
        `${HEADERS}\n/*\n  X-Second: yes\n`,
        policyFor(),
      ),
    ).toThrow(/multiple global "\/\*" blocks/i);
  });

  it("fails when a report-only header exists outside the global block", () => {
    const headers = [
      "# comment",
      "/*",
      "  X-Test: yes",
      "",
      "/_astro/*",
      "  Content-Security-Policy-Report-Only: default-src 'none'",
      "",
    ].join("\n");

    expect(() => updateCspReportOnlyHeader(headers, policyFor())).toThrow(
      /outside the global "\/\*" block/i,
    );
  });

  it("fails when an enforcing CSP header is present", () => {
    const headers = HEADERS.replace(
      "  Permissions-Policy: camera=(), geolocation=(), microphone=()\n",
      "  Content-Security-Policy: default-src 'none'\n  Permissions-Policy: camera=(), geolocation=(), microphone=()\n",
    );

    expect(() => updateCspReportOnlyHeader(headers, policyFor())).toThrow(
      /enforcing Content-Security-Policy header/i,
    );
  });

  it("rejects unsafe tokens and line breaks in the policy", () => {
    expect(() =>
      updateCspReportOnlyHeader(
        HEADERS,
        "default-src 'none'; script-src 'unsafe-inline'",
      ),
    ).toThrow(/'unsafe-inline'/);
    expect(() =>
      updateCspReportOnlyHeader(
        HEADERS,
        "default-src 'none';\nscript-src 'self'",
      ),
    ).toThrow(/line break/i);
    expect(() =>
      updateCspReportOnlyHeader(
        HEADERS,
        "default-src 'none'; report-to csp-endpoint",
      ),
    ).toThrow(/report-to/);
    expect(() =>
      updateCspReportOnlyHeader(HEADERS, "default-src 'none'; report-uri /csp"),
    ).toThrow(/report-uri/);
  });

  it("rejects a header line over the limit", () => {
    expect(() => updateCspReportOnlyHeader(HEADERS, "a".repeat(2000))).toThrow(
      /longer than 2000 characters/i,
    );
  });
});
