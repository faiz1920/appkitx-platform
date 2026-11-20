/*
 * QR customization options shared by the form, the preview, and exports.
 * Kept free of the QR encoder so server rendering can import the constants
 * without pulling the encoder into the build.
 */

export const QR_SIZE_PRESETS = {
  small: { preview: 160, export: 256 },
  medium: { preview: 200, export: 512 },
  large: { preview: 240, export: 1024 },
} as const;

export type QrSizePreset = keyof typeof QR_SIZE_PRESETS;

/** Size options in the order the form presents them. */
export const QR_SIZE_PRESET_ORDER: readonly QrSizePreset[] = [
  "small",
  "medium",
  "large",
];

export const QR_DEFAULT_SIZE: QrSizePreset = "medium";

export const QR_ECC_LEVELS = ["L", "M", "Q", "H"] as const;

export type QrEccLevel = (typeof QR_ECC_LEVELS)[number];

export const QR_DEFAULT_ECC: QrEccLevel = "M";

/** Standard quiet zone width in modules. */
export const QR_QUIET_ZONE_MODULES = 4;
