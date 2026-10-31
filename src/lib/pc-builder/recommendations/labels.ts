/* Presentation labels for the guided recommendation UI (M10.4). */

import type {
  AlternativeKind,
  DataConfidence,
  RecommendationStatus,
} from "./types";

export const RECOMMENDATION_STATUS_LABELS: Record<
  RecommendationStatus,
  string
> = {
  recommended: "Recommended",
  "recommended-with-caveats": "Recommended with caveats",
  "needs-review": "Needs review",
  "no-safe-recommendation": "No safe recommendation",
  "invalid-questionnaire": "Check requirements",
};

export const RECOMMENDATION_STATUS_DESCRIPTIONS: Record<
  RecommendationStatus,
  string
> = {
  recommended:
    "All applicable compatibility checks passed with published specification data.",
  "recommended-with-caveats":
    "The build is compatible, but some checks or preferences need attention before purchase.",
  "needs-review":
    "A critical compatibility check could not be verified from the available data.",
  "no-safe-recommendation":
    "No complete configuration passed the known compatibility checks.",
  "invalid-questionnaire":
    "Some questionnaire fields need correction before a recommendation can be generated.",
};

export const DATA_CONFIDENCE_LABELS: Record<DataConfidence["level"], string> = {
  high: "High data confidence",
  medium: "Medium data confidence",
  low: "Low data confidence",
};

export const ALTERNATIVE_KIND_LABELS: Record<AlternativeKind, string> = {
  performance: "Performance-oriented alternative",
  value: "Value-oriented alternative",
  brand: "Brand alternative",
  similar: "Similar option",
};
