/*
 * QR rendering helpers around uqr.
 *
 * uqr returns a boolean module matrix (with the quiet zone included when a
 * border is requested). PNG drawing lives in the component because it needs
 * a canvas; the SVG string and export filenames are pure and testable.
 */

import { renderSVG } from "uqr";
import type { QrContentType } from "./qr-payload";
import type { QrEccLevel } from "./qr-options";

export interface QrSvgOptions {
  size: number;
  ecc: QrEccLevel;
  /** Quiet zone width in modules; 0 disables it. */
  border: number;
  foreground: string;
  background: string;
}

export function buildQrSvg(payload: string, options: QrSvgOptions): string {
  const svg = renderSVG(payload, {
    ecc: options.ecc,
    border: options.border,
    pixelSize: 1,
    blackColor: options.foreground,
    whiteColor: options.background,
  });

  return svg.replace(
    "<svg ",
    `<svg width="${options.size}" height="${options.size}" shape-rendering="crispEdges" `,
  );
}

const FILENAME_SLUGS: Record<QrContentType, string> = {
  url: "url",
  text: "text",
  email: "email",
  phone: "phone",
  sms: "sms",
  wifi: "wifi",
  vcard: "contact",
};

/** Descriptive, content-free filename; user data never reaches the name. */
export function qrFilename(
  type: QrContentType,
  extension: "png" | "svg",
): string {
  return `appkitx-qr-${FILENAME_SLUGS[type]}.${extension}`;
}
