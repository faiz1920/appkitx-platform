/*
 * QR color contrast checks.
 *
 * Scanners need dark modules on a light background and enough luminance
 * difference between them. The UI warns instead of blocking: unusual but
 * readable color pairs are still allowed, and the final decision belongs to
 * the user who can test the code.
 */

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export type QrContrastWarning = "inverted" | "lowContrast";

const MIN_CONTRAST_RATIO = 4.5;

export function parseHexColor(value: string): RgbColor | null {
  const hex = value.trim().replace(/^#/, "");

  if (/^[0-9a-f]{3}$/i.test(hex)) {
    return {
      r: Number.parseInt(hex[0] + hex[0], 16),
      g: Number.parseInt(hex[1] + hex[1], 16),
      b: Number.parseInt(hex[2] + hex[2], 16),
    };
  }

  if (/^[0-9a-f]{6}$/i.test(hex)) {
    return {
      r: Number.parseInt(hex.slice(0, 2), 16),
      g: Number.parseInt(hex.slice(2, 4), 16),
      b: Number.parseInt(hex.slice(4, 6), 16),
    };
  }

  return null;
}

function channelLuminance(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(color: RgbColor): number {
  return (
    0.2126 * channelLuminance(color.r) +
    0.7152 * channelLuminance(color.g) +
    0.0722 * channelLuminance(color.b)
  );
}

/** WCAG contrast ratio, or 0 when either color cannot be parsed. */
export function contrastRatio(foreground: string, background: string): number {
  const fg = parseHexColor(foreground);
  const bg = parseHexColor(background);
  if (!fg || !bg) return 0;

  const fgLuminance = relativeLuminance(fg);
  const bgLuminance = relativeLuminance(bg);
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Return the reliability warning for a color pair, if any.
 * Inverted codes (light modules on a dark background) are flagged even when
 * their contrast ratio is high.
 */
export function qrContrastWarning(
  foreground: string,
  background: string,
): QrContrastWarning | null {
  const fg = parseHexColor(foreground);
  const bg = parseHexColor(background);
  if (!fg || !bg) return "lowContrast";

  const fgLuminance = relativeLuminance(fg);
  const bgLuminance = relativeLuminance(bg);
  const ratio = contrastRatio(foreground, background);

  /*
   * Identical or effectively identical colors have no luminance separation.
   * Check this before the inversion branch so equal colors are reported as
   * low contrast rather than "inverted".
   */
  if (ratio <= 1.05) {
    return "lowContrast";
  }

  if (fgLuminance >= bgLuminance) {
    return "inverted";
  }

  return ratio < MIN_CONTRAST_RATIO ? "lowContrast" : null;
}
