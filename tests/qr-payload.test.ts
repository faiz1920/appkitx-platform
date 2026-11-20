import { describe, expect, it } from "vitest";
import {
  QR_CONTENT_TYPES,
  buildQrPayload,
  escapeVCardValue,
  escapeWifiValue,
  foldVCardLine,
  isValidEmail,
  isValidHttpUrl,
  isValidPhone,
  normalizePhone,
  normalizeUrl,
  type QrFormValues,
} from "../src/lib/qr-payload";

const base: QrFormValues = {
  type: "url",
  url: "",
  text: "",
  email: "",
  phone: "",
  smsPhone: "",
  smsMessage: "",
  wifiSsid: "",
  wifiPassword: "",
  wifiSecurity: "WPA",
  wifiHidden: false,
  vcardName: "",
  vcardPhone: "",
  vcardEmail: "",
  vcardOrganization: "",
  vcardWebsite: "",
};

const values = (overrides: Partial<QrFormValues>): QrFormValues => ({
  ...base,
  ...overrides,
});

const payloadOf = (overrides: Partial<QrFormValues>): string => {
  const result = buildQrPayload(values(overrides));
  if (!result.ok) {
    throw new Error(`Expected a payload, got ${JSON.stringify(result.issues)}`);
  }
  return result.payload;
};

const unfoldVCard = (payload: string): string => payload.replace(/\r\n /g, "");

const utf8Length = (value: string): number =>
  new TextEncoder().encode(value).length;

const expectFoldedVCard = (payload: string): void => {
  const physicalLines = payload.split("\r\n");
  for (const line of physicalLines) {
    expect(utf8Length(line), JSON.stringify(line)).toBeLessThanOrEqual(75);
  }
  expect(payload).toContain("\r\n");
  expect(payload.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/);
  expect(physicalLines.slice(1).some((line) => line.startsWith(" "))).toBe(
    true,
  );
  expect(unfoldVCard(payload)).toContain("BEGIN:VCARD");
  expect(unfoldVCard(payload)).toContain("END:VCARD");
};

describe("QR content types", () => {
  it("keeps the documented form order", () => {
    expect(QR_CONTENT_TYPES).toEqual([
      "url",
      "text",
      "email",
      "phone",
      "sms",
      "wifi",
      "vcard",
    ]);
  });
});

describe("URL payloads", () => {
  it("adds https:// when the scheme is omitted", () => {
    expect(normalizeUrl(" appkitx.com ")).toBe("https://appkitx.com");
    expect(payloadOf({ url: " appkitx.com " })).toBe("https://appkitx.com");
  });

  it("preserves an explicit http or https scheme", () => {
    expect(payloadOf({ url: "http://example.com/path" })).toBe(
      "http://example.com/path",
    );
    expect(payloadOf({ url: "https://example.com" })).toBe(
      "https://example.com",
    );
  });

  it("rejects empty, malformed, and non-http URLs", () => {
    expect(buildQrPayload(values({ url: "" }))).toEqual({
      ok: false,
      issues: [{ field: "url", code: "required" }],
    });
    expect(buildQrPayload(values({ url: "not a url" }))).toEqual({
      ok: false,
      issues: [{ field: "url", code: "invalidUrl" }],
    });
    expect(isValidHttpUrl("ftp://example.com")).toBe(false);
    expect(isValidHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isValidHttpUrl("not a url")).toBe(false);
    expect(isValidHttpUrl("https://not a url")).toBe(false);
  });

  it("only validates the active type", () => {
    expect(payloadOf({ url: "example.com", email: "not-an-email" })).toBe(
      "https://example.com",
    );
  });
});

describe("text payloads", () => {
  it("encodes text and trims only the outer whitespace", () => {
    expect(payloadOf({ type: "text", text: "  Hello\nworld  " })).toBe(
      "Hello\nworld",
    );
  });

  it("requires text", () => {
    expect(buildQrPayload(values({ type: "text", text: "   " }))).toEqual({
      ok: false,
      issues: [{ field: "text", code: "required" }],
    });
  });
});

describe("email payloads", () => {
  it("builds a mailto URI", () => {
    expect(payloadOf({ type: "email", email: "hello@example.com" })).toBe(
      "mailto:hello@example.com",
    );
  });

  it("validates the address", () => {
    expect(isValidEmail("hello@example.com")).toBe(true);
    expect(isValidEmail("hello.example.com")).toBe(false);
    expect(buildQrPayload(values({ type: "email", email: "nope" }))).toEqual({
      ok: false,
      issues: [{ field: "email", code: "invalidEmail" }],
    });
  });
});

describe("phone payloads", () => {
  it("normalizes separators and keeps a leading plus", () => {
    expect(normalizePhone("+1 (555) 123-4567")).toBe("+15551234567");
    expect(payloadOf({ type: "phone", phone: "+1 (555) 123-4567" })).toBe(
      "tel:+15551234567",
    );
    expect(payloadOf({ type: "phone", phone: "555 123 4567" })).toBe(
      "tel:5551234567",
    );
  });

  it("rejects letters and unrealistic digit counts", () => {
    expect(isValidPhone("call 5551234567")).toBe(false);
    expect(isValidPhone("12")).toBe(false);
    expect(isValidPhone("1234567890123456")).toBe(false);
    expect(buildQrPayload(values({ type: "phone", phone: "12" }))).toEqual({
      ok: false,
      issues: [{ field: "phone", code: "invalidPhone" }],
    });
  });
});

describe("SMS payloads", () => {
  it("builds an sms URI without a message", () => {
    expect(payloadOf({ type: "sms", smsPhone: "+1 (555) 123-4567" })).toBe(
      "sms:+15551234567",
    );
  });

  it("encodes the optional message", () => {
    expect(
      payloadOf({
        type: "sms",
        smsPhone: "+15551234567",
        smsMessage: "  Hello there  ",
      }),
    ).toBe("sms:+15551234567?body=Hello%20there");
  });
});

describe("Wi-Fi payloads", () => {
  it("builds a WPA payload", () => {
    expect(
      payloadOf({
        type: "wifi",
        wifiSsid: "Studio",
        wifiPassword: "secret123",
      }),
    ).toBe("WIFI:T:WPA;S:Studio;P:secret123;;");
  });

  it("adds H:true for hidden networks", () => {
    expect(
      payloadOf({
        type: "wifi",
        wifiSsid: "Studio",
        wifiPassword: "secret123",
        wifiHidden: true,
      }),
    ).toBe("WIFI:T:WPA;S:Studio;P:secret123;H:true;;");
  });

  it("omits the password for an open network", () => {
    expect(
      payloadOf({
        type: "wifi",
        wifiSsid: "Open",
        wifiPassword: "ignored",
        wifiSecurity: "nopass",
      }),
    ).toBe("WIFI:T:nopass;S:Open;;");
  });

  it("preserves leading and trailing SSID whitespace", () => {
    for (const ssid of [" Studio", "Studio ", "  Studio  "]) {
      expect(
        payloadOf({
          type: "wifi",
          wifiSsid: ssid,
          wifiPassword: "secret123",
        }),
        ssid,
      ).toBe(`WIFI:T:WPA;S:${ssid};P:secret123;;`);
    }
  });

  it("preserves password whitespace and escapes SSID delimiters", () => {
    expect(
      payloadOf({
        type: "wifi",
        wifiSsid: "  Cafe;Guest  ",
        wifiPassword: " secret ",
      }),
    ).toBe("WIFI:T:WPA;S:  Cafe\\;Guest  ;P: secret ;;");
  });

  it("escapes Wi-Fi delimiters", () => {
    expect(escapeWifiValue("Cafe;Guest")).toBe("Cafe\\;Guest");
    expect(escapeWifiValue('p:a,s"s\\s')).toBe('p\\:a\\,s\\"s\\\\s');
    expect(
      payloadOf({
        type: "wifi",
        wifiSsid: "Cafe;Guest",
        wifiPassword: 'p:a,s"s\\s',
      }),
    ).toBe('WIFI:T:WPA;S:Cafe\\;Guest;P:p\\:a\\,s\\"s\\\\s;;');
  });

  it("preserves leading and trailing SSID whitespace with escaping", () => {
    expect(
      payloadOf({
        type: "wifi",
        wifiSsid: "  Cafe;Guest  ",
        wifiPassword: "secret123",
      }),
    ).toBe("WIFI:T:WPA;S:  Cafe\\;Guest  ;P:secret123;;");
  });

  it("requires an SSID and a password for secured networks", () => {
    expect(
      buildQrPayload(values({ type: "wifi", wifiSsid: "", wifiPassword: "" })),
    ).toEqual({
      ok: false,
      issues: [
        { field: "wifiSsid", code: "required" },
        { field: "wifiPassword", code: "wifiPasswordRequired" },
      ],
    });
    expect(
      buildQrPayload(
        values({ type: "wifi", wifiSsid: "Studio", wifiPassword: "   " }),
      ),
    ).toEqual({
      ok: false,
      issues: [{ field: "wifiPassword", code: "wifiPasswordRequired" }],
    });
    expect(
      buildQrPayload(
        values({ type: "wifi", wifiSsid: "   ", wifiPassword: "secret" }),
      ),
    ).toEqual({
      ok: false,
      issues: [{ field: "wifiSsid", code: "required" }],
    });
  });

  it("does not require a password for an open network", () => {
    expect(
      payloadOf({
        type: "wifi",
        wifiSsid: "Open",
        wifiSecurity: "nopass",
      }),
    ).toBe("WIFI:T:nopass;S:Open;;");
  });

  it("keeps WEP and hidden-network behavior", () => {
    expect(
      payloadOf({
        type: "wifi",
        wifiSsid: " Legacy ",
        wifiPassword: "secret",
        wifiSecurity: "WEP",
        wifiHidden: true,
      }),
    ).toBe("WIFI:T:WEP;S: Legacy ;P:secret;H:true;;");
  });
});

describe("vCard payloads", () => {
  it("builds a minimal vCard with CRLF line endings", () => {
    expect(payloadOf({ type: "vcard", vcardName: "Ada Lovelace" })).toBe(
      [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "FN:Ada Lovelace",
        "N:;Ada Lovelace;;;",
        "END:VCARD",
      ].join("\r\n"),
    );
  });

  it("adds the optional contact fields in order", () => {
    expect(
      payloadOf({
        type: "vcard",
        vcardName: "Ada Lovelace",
        vcardPhone: "+1 (555) 123-4567",
        vcardEmail: "ada@example.com",
        vcardOrganization: "Analytical Engines",
        vcardWebsite: "example.com",
      }),
    ).toBe(
      [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "FN:Ada Lovelace",
        "N:;Ada Lovelace;;;",
        "ORG:Analytical Engines",
        "TEL;TYPE=CELL:+15551234567",
        "EMAIL:ada@example.com",
        "URL:https://example.com",
        "END:VCARD",
      ].join("\r\n"),
    );
  });

  it("escapes vCard text values", () => {
    expect(escapeVCardValue("Ada, Lovelace; \\")).toBe(
      "Ada\\, Lovelace\\; \\\\",
    );
    expect(escapeVCardValue("A\u0001B\r\nC")).toBe("AB\\nC");
    expect(escapeVCardValue("A\u0085B")).toBe("AB");
  });

  it("folds long Unicode names at 75 UTF-8 octets without splitting characters", () => {
    const name = `${"李".repeat(40)}é`;
    const payload = payloadOf({ type: "vcard", vcardName: name });

    expectFoldedVCard(payload);
    const logical = unfoldVCard(payload);
    expect(logical).toContain(`FN:${name}`);
    expect(logical).toContain(`N:;${name};;;`);
    expect(payload).not.toContain("\uFFFD");
  });

  it("folds a multibyte character that would cross the boundary", () => {
    const name = `${"a".repeat(72)}李${"b".repeat(20)}`;
    const payload = payloadOf({ type: "vcard", vcardName: name });

    expectFoldedVCard(payload);
    expect(unfoldVCard(payload)).toContain(`FN:${name}`);
    expect(payload).not.toContain("\uFFFD");
  });

  it("folds long organization names and preserves their content", () => {
    const organization = "Analytical Engines ".repeat(12).trim();
    const payload = payloadOf({
      type: "vcard",
      vcardName: "Ada Lovelace",
      vcardOrganization: organization,
    });

    expectFoldedVCard(payload);
    expect(unfoldVCard(payload)).toContain(`ORG:${organization}`);
  });

  it("keeps URI values intact while folding long URLs", () => {
    const website = `https://example.com/${"a".repeat(200)}?x=1,2;3`;
    const payload = payloadOf({
      type: "vcard",
      vcardName: "Ada Lovelace",
      vcardWebsite: website,
    });

    expectFoldedVCard(payload);
    expect(unfoldVCard(payload)).toContain(`URL:${website}`);
  });

  it("escapes supported characters in email values", () => {
    const email = "ada+news,alerts;ops@example.com";
    const payload = payloadOf({
      type: "vcard",
      vcardName: "Ada Lovelace",
      vcardEmail: email,
    });

    expect(unfoldVCard(payload)).toContain(
      "EMAIL:ada+news\\,alerts\\;ops@example.com",
    );
  });

  it("omits empty optional vCard fields", () => {
    const payload = payloadOf({ type: "vcard", vcardName: "Ada Lovelace" });
    const logical = unfoldVCard(payload);

    expect(logical).not.toContain("ORG:");
    expect(logical).not.toContain("TEL");
    expect(logical).not.toContain("EMAIL:");
    expect(logical).not.toContain("URL:");
  });

  it("folds direct content lines with CRLF and a single-space continuation", () => {
    const line = "x".repeat(200);
    const folded = foldVCardLine(line);
    const physicalLines = folded.split("\r\n");

    expect(physicalLines.every((part) => utf8Length(part) <= 75)).toBe(true);
    expect(physicalLines.slice(1).every((part) => part.startsWith(" "))).toBe(
      true,
    );
    expect(unfoldVCard(folded)).toBe(line);
  });

  it("requires a name and validates optional fields", () => {
    expect(buildQrPayload(values({ type: "vcard" }))).toEqual({
      ok: false,
      issues: [{ field: "vcardName", code: "required" }],
    });
    expect(
      buildQrPayload(
        values({
          type: "vcard",
          vcardName: "Ada",
          vcardPhone: "12",
          vcardEmail: "nope",
          vcardWebsite: "not a url",
        }),
      ),
    ).toEqual({
      ok: false,
      issues: [
        { field: "vcardPhone", code: "invalidPhone" },
        { field: "vcardEmail", code: "invalidEmail" },
        { field: "vcardWebsite", code: "invalidUrl" },
      ],
    });
  });
});
