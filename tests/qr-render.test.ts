import { describe, expect, it } from "vitest";
import { buildQrSvg, qrFilename } from "../src/lib/qr-render";

describe("buildQrSvg", () => {
  it("sets the requested dimensions, colors, and crisp module edges", () => {
    const svg = buildQrSvg("https://appkitx.com", {
      size: 320,
      ecc: "M",
      border: 4,
      foreground: "#112233",
      background: "#ffffff",
    });

    expect(svg).toContain("<svg ");
    expect(svg).toContain('width="320"');
    expect(svg).toContain('height="320"');
    expect(svg).toContain('shape-rendering="crispEdges"');
    expect(svg).toContain('fill="#112233"');
    expect(svg).toContain('fill="#ffffff"');
    expect(svg).not.toContain("<script");
  });

  it("encodes the payload into path data rather than raw markup", () => {
    const payload = "hello <script>alert(1)</script>";
    const svg = buildQrSvg(payload, {
      size: 256,
      ecc: "L",
      border: 0,
      foreground: "#000000",
      background: "#ffffff",
    });

    expect(svg).not.toContain(payload);
    expect(svg).not.toContain("<script");
    expect(svg).toContain("<path ");
  });
});

describe("qrFilename", () => {
  it("uses descriptive, content-free names per type", () => {
    expect(qrFilename("url", "png")).toBe("appkitx-qr-url.png");
    expect(qrFilename("text", "svg")).toBe("appkitx-qr-text.svg");
    expect(qrFilename("email", "png")).toBe("appkitx-qr-email.png");
    expect(qrFilename("phone", "png")).toBe("appkitx-qr-phone.png");
    expect(qrFilename("sms", "png")).toBe("appkitx-qr-sms.png");
    expect(qrFilename("wifi", "png")).toBe("appkitx-qr-wifi.png");
    expect(qrFilename("vcard", "png")).toBe("appkitx-qr-contact.png");
  });
});
