/*
 * Pure QR payload construction and field validation.
 *
 * The module is locale-free: it returns stable issue codes that the UI maps
 * to localized messages. Payload formats follow the conventions scanners
 * implement:
 * - URL: an http(s) URL; https:// is added when the scheme is omitted.
 * - Email: mailto: URI.
 * - Phone: tel: URI with separators removed.
 * - SMS: sms: URI (RFC 5724) with an optional encoded body.
 * - Wi-Fi: WIFI:T:<security>;S:<ssid>;P:<password>;H:<hidden>;;
 * - vCard: vCard 3.0 with CRLF line endings.
 *
 * Nothing here touches the network or browser storage.
 */

export const QR_CONTENT_TYPES = [
  "url",
  "text",
  "email",
  "phone",
  "sms",
  "wifi",
  "vcard",
] as const;

export type QrContentType = (typeof QR_CONTENT_TYPES)[number];

export const QR_WIFI_SECURITIES = ["WPA", "WEP", "nopass"] as const;

export type QrWifiSecurity = (typeof QR_WIFI_SECURITIES)[number];

export type QrField =
  | "url"
  | "text"
  | "email"
  | "phone"
  | "smsPhone"
  | "wifiSsid"
  | "wifiPassword"
  | "vcardName"
  | "vcardPhone"
  | "vcardEmail"
  | "vcardWebsite";

export type QrIssueCode =
  | "required"
  | "invalidEmail"
  | "invalidUrl"
  | "invalidPhone"
  | "wifiPasswordRequired";

export interface QrValidationIssue {
  field: QrField;
  code: QrIssueCode;
}

export interface QrFormValues {
  type: QrContentType;
  url: string;
  text: string;
  email: string;
  phone: string;
  smsPhone: string;
  smsMessage: string;
  wifiSsid: string;
  wifiPassword: string;
  wifiSecurity: QrWifiSecurity;
  wifiHidden: boolean;
  vcardName: string;
  vcardPhone: string;
  vcardEmail: string;
  vcardOrganization: string;
  vcardWebsite: string;
}

export type QrPayloadResult =
  { ok: true; payload: string } | { ok: false; issues: QrValidationIssue[] };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Phone input may contain spaces, dashes, dots, and parentheses around digits. */
const PHONE_CHARS_PATTERN = /^[+\d\s().-]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

/** Add https:// when the user omits a scheme; preserve an explicit scheme. */
export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (trimmed === "") return "";
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
}

export function isValidHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === "" || /\s/.test(trimmed)) return false;

  const normalized = normalizeUrl(trimmed);
  if (normalized === "") return false;

  try {
    const url = new URL(normalized);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.hostname !== ""
    );
  } catch {
    return false;
  }
}

/** Strip visual separators while preserving a single leading plus. */
export function normalizePhone(value: string): string {
  const trimmed = value.trim();
  const plus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return `${plus ? "+" : ""}${digits}`;
}

export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === "" || !PHONE_CHARS_PATTERN.test(trimmed)) return false;

  const compact = trimmed.replace(/[\s().-]/g, "");
  return /^\+?\d{3,15}$/.test(compact);
}

/** Escape the characters that delimit fields in the WIFI: payload. */
export function escapeWifiValue(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

/** Escape vCard 3.0 text values (backslash, newline, semicolon, comma). */
export function escapeVCardValue(value: string): string {
  return (
    value
      .replace(/\\/g, "\\\\")
      .replace(/\r\n|\r|\n/g, "\\n")
      /* Drop control characters that cannot appear safely on a content line. */
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/g, "")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
  );
}

/** Remove control characters from a URI property without text-escaping it. */
function sanitizeVCardUri(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f-\u009f]/g, "");
}

const VCARD_LINE_OCTET_LIMIT = 75;

/**
 * Fold a vCard 3.0 content line at 75 UTF-8 octets. Continuation lines begin
 * with one space after CRLF, so unfolding (removing CRLF + space) restores the
 * original logical line. Iterating code points guarantees that a multibyte
 * UTF-8 character is never split across physical lines.
 */
export function foldVCardLine(line: string): string {
  const encoder = new TextEncoder();
  const chunks: string[] = [];
  let current = "";
  let bytes = 0;

  for (const character of line) {
    const characterBytes = encoder.encode(character).length;

    if (bytes + characterBytes > VCARD_LINE_OCTET_LIMIT) {
      chunks.push(current);
      current = " ";
      bytes = 1;
    }

    current += character;
    bytes += characterBytes;
  }

  chunks.push(current);
  return chunks.join("\r\n");
}

function buildWifiPayload(values: QrFormValues): string {
  let payload = `WIFI:T:${values.wifiSecurity};S:${escapeWifiValue(
    values.wifiSsid,
  )};`;

  if (values.wifiSecurity !== "nopass") {
    payload += `P:${escapeWifiValue(values.wifiPassword)};`;
  }
  if (values.wifiHidden) {
    payload += "H:true;";
  }

  return `${payload};`;
}

function buildVCardPayload(values: QrFormValues): string {
  const name = escapeVCardValue(values.vcardName.trim());
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${name}`, `N:;${name};;;`];

  const organization = values.vcardOrganization.trim();
  if (organization !== "") {
    lines.push(`ORG:${escapeVCardValue(organization)}`);
  }

  const phone = values.vcardPhone.trim();
  if (phone !== "") {
    lines.push(`TEL;TYPE=CELL:${normalizePhone(phone)}`);
  }

  const email = values.vcardEmail.trim();
  if (email !== "") {
    /*
     * EMAIL is a text value in vCard 3.0: commas, semicolons, and backslashes
     * in quoted local parts must be escaped rather than emitted raw.
     */
    lines.push(`EMAIL:${escapeVCardValue(email)}`);
  }

  const website = values.vcardWebsite.trim();
  if (website !== "") {
    /*
     * URL is a URI property, not a text value. Do not apply text escaping,
     * which would corrupt legitimate commas or semicolons in the URI.
     */
    lines.push(`URL:${sanitizeVCardUri(normalizeUrl(website))}`);
  }

  lines.push("END:VCARD");
  return lines.map(foldVCardLine).join("\r\n");
}

/**
 * Build the QR payload for the active content type.
 * Invalid input returns one issue per failing field, in form order.
 * Only the active type's fields are validated; hidden panels are ignored.
 */
export function buildQrPayload(values: QrFormValues): QrPayloadResult {
  const issues: QrValidationIssue[] = [];

  const required = (field: QrField, value: string): void => {
    if (value.trim() === "") issues.push({ field, code: "required" });
  };
  const email = (field: QrField, value: string): void => {
    if (value.trim() !== "" && !isValidEmail(value)) {
      issues.push({ field, code: "invalidEmail" });
    }
  };
  const phone = (field: QrField, value: string): void => {
    if (value.trim() !== "" && !isValidPhone(value)) {
      issues.push({ field, code: "invalidPhone" });
    }
  };
  const url = (field: QrField, value: string): void => {
    if (value.trim() !== "" && !isValidHttpUrl(value)) {
      issues.push({ field, code: "invalidUrl" });
    }
  };
  const done = (payload: string): QrPayloadResult =>
    issues.length > 0 ? { ok: false, issues } : { ok: true, payload };

  switch (values.type) {
    case "url": {
      required("url", values.url);
      url("url", values.url);
      return done(normalizeUrl(values.url));
    }
    case "text": {
      required("text", values.text);
      return done(values.text.trim());
    }
    case "email": {
      required("email", values.email);
      email("email", values.email);
      return done(`mailto:${values.email.trim()}`);
    }
    case "phone": {
      required("phone", values.phone);
      phone("phone", values.phone);
      return done(`tel:${normalizePhone(values.phone)}`);
    }
    case "sms": {
      required("smsPhone", values.smsPhone);
      phone("smsPhone", values.smsPhone);
      const number = normalizePhone(values.smsPhone);
      const message = values.smsMessage.trim();
      return done(
        message === ""
          ? `sms:${number}`
          : `sms:${number}?body=${encodeURIComponent(message)}`,
      );
    }
    case "wifi": {
      required("wifiSsid", values.wifiSsid);
      if (
        values.wifiSecurity !== "nopass" &&
        values.wifiPassword.trim() === ""
      ) {
        issues.push({ field: "wifiPassword", code: "wifiPasswordRequired" });
      }
      return done(buildWifiPayload(values));
    }
    case "vcard": {
      required("vcardName", values.vcardName);
      phone("vcardPhone", values.vcardPhone);
      email("vcardEmail", values.vcardEmail);
      url("vcardWebsite", values.vcardWebsite);
      return done(buildVCardPayload(values));
    }
  }
}
