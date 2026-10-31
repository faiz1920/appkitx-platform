/* Presentation labels and user-facing messages for saved builds (M10.5). */

import type { BuildSource, SavedBuildError, ShareError } from "./types";

export const BUILD_SOURCE_LABELS: Record<BuildSource, string> = {
  manual: "Manual",
  guided: "Guided",
};

export const SAVED_BUILD_STORAGE_NOTE =
  "Saved builds live in this browser only. There is no account, cloud sync or server copy.";

export const SHARE_LINK_NOTE =
  "Share links work only where the development PC Builder preview is available. They are not public or permanently hosted.";

export function savedBuildErrorMessage(error: SavedBuildError): string {
  return error.message;
}

export function shareErrorMessage(error: ShareError): string {
  return error.message;
}
