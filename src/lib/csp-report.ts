export const CSP_REPORT_PATH = "/__csp-report";
export const CSP_REPORT_MAX_BODY_BYTES = 32 * 1024;
export const CSP_REPORT_MAX_REPORTS = 20;
export const CSP_REPORT_SCHEMA_VERSION = "v1";
export const CSP_REPORT_INDEX = "csp-report";

const MAX_DIRECTIVE_LENGTH = 64;
const MAX_ORIGIN_LENGTH = 64;
const MAX_PATH_LENGTH = 128;
const MAX_URL_LENGTH = 2048;

const KNOWN_DIRECTIVES = new Set([
  "base-uri",
  "block-all-mixed-content",
  "child-src",
  "connect-src",
  "default-src",
  "font-src",
  "form-action",
  "frame-ancestors",
  "frame-src",
  "img-src",
  "manifest-src",
  "media-src",
  "object-src",
  "prefetch-src",
  "require-trusted-types-for",
  "sandbox",
  "script-src",
  "script-src-attr",
  "script-src-elem",
  "style-src",
  "style-src-attr",
  "style-src-elem",
  "trusted-types",
  "upgrade-insecure-requests",
  "worker-src",
]);

const BLOCKED_KEYWORDS = new Set([
  "inline",
  "eval",
  "wasm-eval",
  "data",
  "blob",
  "filesystem",
  "self",
]);

export type CspBrowserFamily =
  "chromium" | "firefox" | "webkit" | "other" | "unknown";

export type CspDisposition = "report" | "enforce" | "unknown";

export interface NormalizedCspReport {
  effectiveDirective: string;
  violatedDirective: string;
  disposition: CspDisposition;
  blockedOrigin: string;
  documentPath: string;
  browserFamily: CspBrowserFamily;
  count: number;
}

export interface CspReportSink {
  record(report: NormalizedCspReport): void;
}

export interface AnalyticsEngineDatasetLike {
  writeDataPoint(point: {
    blobs: string[];
    doubles: number[];
    indexes: string[];
  }): void;
}

type LegacyOrReportingReport = {
  body: Record<string, unknown>;
  envelopeUrl?: string;
};

type BodyReadResult =
  { kind: "ok"; bytes: Uint8Array } | { kind: "empty" } | { kind: "too-large" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function singleLine(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, "").trim();
}

function bound(value: string, maximum: number): string {
  const normalized = singleLine(value);

  if (normalized.length <= maximum) {
    return normalized;
  }

  return `${normalized.slice(0, maximum - 3)}...`;
}

function pickString(
  record: Record<string, unknown>,
  keys: readonly string[],
): string | undefined {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
  }

  return undefined;
}

function normalizeDirective(value: string | undefined): string {
  if (!value) {
    return "unknown";
  }

  const firstToken = value.trim().split(/\s+/)[0]?.toLowerCase() ?? "";

  return KNOWN_DIRECTIVES.has(firstToken) ? firstToken : "unknown";
}

function normalizeDocumentPath(value: string | undefined): string {
  if (!value) {
    return "unknown";
  }

  if (value.length > MAX_URL_LENGTH) {
    return "invalid";
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return "invalid";
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return bound(url.protocol.replace(/:$/, "") || "unknown", 32);
  }

  const path = url.pathname || "/";
  const safe = path.replace(/[^A-Za-z0-9/_.~-]/g, "_");

  return bound(safe, MAX_PATH_LENGTH);
}

function normalizeBlockedOrigin(value: string | undefined): string {
  if (!value) {
    return "unknown";
  }

  const raw = singleLine(value);
  const lower = raw.toLowerCase();

  if (BLOCKED_KEYWORDS.has(lower)) {
    return lower;
  }

  if (lower === "about:blank" || lower === "about:srcdoc") {
    return "about";
  }

  if (/^(chrome|moz|safari|safari-web)-extension:/.test(lower)) {
    return "extension";
  }

  if (raw.length > MAX_URL_LENGTH) {
    return "unknown";
  }

  if (!/^[a-z][a-z0-9+.-]*:/i.test(raw)) {
    return "self";
  }

  try {
    const url = new URL(raw);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return bound(url.origin, MAX_ORIGIN_LENGTH);
    }

    return bound(url.protocol.replace(/:$/, "") || "unknown", 32);
  } catch {
    return "unknown";
  }
}

export function detectBrowserFamily(
  userAgent: string | null,
): CspBrowserFamily {
  if (!userAgent) {
    return "unknown";
  }

  if (/Firefox\/|FxiOS\//i.test(userAgent)) {
    return "firefox";
  }

  if (/Edg\/|EdgiOS\/|Chrome\/|CriOS\/|Chromium\//i.test(userAgent)) {
    return "chromium";
  }

  if (/Safari\//i.test(userAgent)) {
    return "webkit";
  }

  return "other";
}

function normalizeReport(
  report: LegacyOrReportingReport,
  browserFamily: CspBrowserFamily,
): NormalizedCspReport | null {
  const effectiveSource = pickString(report.body, [
    "effective-directive",
    "effectiveDirective",
  ]);
  const violatedSource = pickString(report.body, [
    "violated-directive",
    "violatedDirective",
  ]);

  if (!effectiveSource && !violatedSource) {
    return null;
  }

  const documentUrl =
    pickString(report.body, ["document-uri", "documentURL"]) ??
    report.envelopeUrl;
  const disposition = pickString(report.body, ["disposition"])?.toLowerCase();
  const blocked =
    pickString(report.body, ["blocked-uri", "blockedURL"]) ?? undefined;

  return {
    effectiveDirective: bound(
      normalizeDirective(effectiveSource ?? violatedSource),
      MAX_DIRECTIVE_LENGTH,
    ),
    violatedDirective: bound(
      normalizeDirective(violatedSource ?? effectiveSource),
      MAX_DIRECTIVE_LENGTH,
    ),
    disposition:
      disposition === "report" || disposition === "enforce"
        ? disposition
        : "unknown",
    blockedOrigin: normalizeBlockedOrigin(blocked),
    documentPath: normalizeDocumentPath(documentUrl),
    browserFamily,
    count: 1,
  };
}

function parseLegacyPayload(
  payload: unknown,
): LegacyOrReportingReport[] | null {
  if (Array.isArray(payload)) {
    return parseReportingPayload(payload);
  }

  if (!isRecord(payload)) {
    return null;
  }

  if (payload.type === "csp-violation") {
    const body = isRecord(payload.body)
      ? payload.body
      : isRecord(payload["csp-report"])
        ? payload["csp-report"]
        : null;

    if (!body) {
      return null;
    }

    return [
      {
        body,
        envelopeUrl: typeof payload.url === "string" ? payload.url : undefined,
      },
    ];
  }

  const keys = Object.keys(payload);

  if (keys.length !== 1 || keys[0] !== "csp-report") {
    return null;
  }

  const report = payload["csp-report"];

  if (!isRecord(report)) {
    return null;
  }

  return [{ body: report }];
}

function parseReportingPayload(
  payload: unknown,
): LegacyOrReportingReport[] | null {
  if (!Array.isArray(payload) || payload.length === 0) {
    return null;
  }

  const reports: LegacyOrReportingReport[] = [];

  for (const item of payload) {
    if (!isRecord(item) || typeof item.type !== "string") {
      return null;
    }

    if (item.type !== "csp-violation") {
      continue;
    }

    if (!isRecord(item.body)) {
      return null;
    }

    reports.push({
      body: item.body,
      envelopeUrl: typeof item.url === "string" ? item.url : undefined,
    });
  }

  return reports.length > 0 ? reports : null;
}

function contentTypeOf(request: Request): "legacy" | "reporting" | null {
  const header = request.headers.get("content-type");
  const mediaType = header?.split(";")[0]?.trim().toLowerCase();

  if (mediaType === "application/csp-report") {
    return "legacy";
  }

  if (mediaType === "application/reports+json") {
    return "reporting";
  }

  return null;
}

async function readBody(request: Request): Promise<BodyReadResult> {
  const declaredLength = request.headers.get("content-length");

  if (declaredLength !== null) {
    const length = Number.parseInt(declaredLength, 10);

    if (Number.isFinite(length) && length > CSP_REPORT_MAX_BODY_BYTES) {
      return { kind: "too-large" };
    }
  }

  if (request.body === null) {
    return { kind: "empty" };
  }

  let reader: ReadableStreamDefaultReader<Uint8Array>;

  try {
    reader = request.body.getReader();
  } catch {
    return { kind: "empty" };
  }

  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      if (!value) {
        continue;
      }

      total += value.byteLength;

      if (total > CSP_REPORT_MAX_BODY_BYTES) {
        await reader.cancel().catch(() => undefined);
        return { kind: "too-large" };
      }

      chunks.push(value);
    }
  } catch {
    return { kind: "empty" };
  } finally {
    reader.releaseLock();
  }

  if (total === 0) {
    return { kind: "empty" };
  }

  const bytes = new Uint8Array(total);
  let offset = 0;

  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return { kind: "ok", bytes };
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");

  if (origin === null) {
    return true;
  }

  // WebKit's same-origin reporting request uses no-cors and sends
  // "Origin: null". The endpoint is intentionally unauthenticated; the Origin
  // check only rejects obviously cross-origin browser submissions.
  if (origin === "null") {
    const site = request.headers.get("sec-fetch-site");

    return site === null || site === "same-origin";
  }

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function response(
  status: number,
  message = "",
  headers: Record<string, string> = {},
): Response {
  return new Response(message === "" ? null : message, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...(message === ""
        ? {}
        : { "Content-Type": "text/plain; charset=utf-8" }),
      ...headers,
    },
  });
}

export async function handleCspReportRequest(
  request: Request,
  sink: CspReportSink | undefined,
): Promise<Response> {
  if (request.method !== "POST") {
    return response(405, "Method Not Allowed", { Allow: "POST" });
  }

  if (!isSameOrigin(request)) {
    return response(403, "Forbidden");
  }

  const contentType = contentTypeOf(request);

  if (contentType === null) {
    return response(415, "Unsupported Media Type");
  }

  if (!sink) {
    return response(503, "Service Unavailable", { "Retry-After": "3600" });
  }

  const body = await readBody(request);

  if (body.kind === "too-large") {
    return response(413, "Payload Too Large");
  }

  if (body.kind === "empty") {
    return response(400, "Bad Request");
  }

  let payload: unknown;

  try {
    payload = JSON.parse(new TextDecoder().decode(body.bytes));
  } catch {
    return response(400, "Bad Request");
  }

  const incoming =
    contentType === "legacy"
      ? parseLegacyPayload(payload)
      : parseReportingPayload(payload);

  if (incoming === null) {
    return response(400, "Bad Request");
  }

  if (incoming.length > CSP_REPORT_MAX_REPORTS) {
    return response(413, "Payload Too Large");
  }

  const browserFamily = detectBrowserFamily(request.headers.get("user-agent"));
  const normalized = incoming
    .map((report) => normalizeReport(report, browserFamily))
    .filter((report): report is NormalizedCspReport => report !== null);

  if (normalized.length === 0) {
    return response(400, "Bad Request");
  }

  for (const report of normalized) {
    try {
      sink.record(report);
    } catch {
      console.error("csp_report_storage_failed");
    }
  }

  return response(204);
}

export function createAnalyticsEngineSink(
  dataset: AnalyticsEngineDatasetLike,
): CspReportSink {
  return {
    record(report) {
      dataset.writeDataPoint({
        blobs: [
          report.effectiveDirective,
          report.violatedDirective,
          report.disposition,
          report.blockedOrigin,
          report.documentPath,
          report.browserFamily,
          CSP_REPORT_SCHEMA_VERSION,
        ],
        doubles: [report.count],
        indexes: [CSP_REPORT_INDEX],
      });
    },
  };
}
