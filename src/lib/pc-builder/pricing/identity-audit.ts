/*
 * Catalogue identity readiness audit for commercial matching (M10.8).
 *
 * The audit is read-only and does not invent MPNs, GTINs or provider SKUs. It
 * distinguishes explicit identity metadata from MPN-shaped model strings,
 * which are only candidates: an MPN-shaped `model` is still not a verified
 * manufacturer part number until a manufacturer or GS1-backed source records
 * it explicitly.
 *
 * A component is `verifiedMatchReady` only when explicit MPN evidence exists,
 * or explicit GTIN evidence exists alongside a manufacturer. This mirrors the
 * matching rules in product-matching.ts.
 */

import { componentCategories, type ComponentCategory } from "../types";
import { normalizeModelNumber } from "./product-matching";
import type { CatalogueProductIdentity } from "./types";

export type CatalogueIdentityEvidence =
  | "explicit-mpn"
  | "explicit-gtin"
  | "model-mpn-shaped"
  | "model-descriptive"
  | "missing-model";

export interface CatalogueIdentityAuditEntry {
  readonly componentId: string;
  readonly category: ComponentCategory;
  readonly manufacturer: string;
  readonly model: string;
  readonly evidence: CatalogueIdentityEvidence;
  readonly verifiedMatchReady: boolean;
}

export interface CatalogueIdentityCategoryAudit {
  readonly category: ComponentCategory;
  readonly total: number;
  readonly verifiedMatchReady: number;
  readonly modelMpnShaped: number;
  readonly modelDescriptive: number;
}

export interface DuplicateCatalogueModel {
  readonly model: string;
  readonly componentIds: readonly string[];
}

export interface CatalogueIdentityAudit {
  readonly total: number;
  readonly verifiedMatchReady: number;
  readonly explicitMpn: number;
  readonly explicitGtin: number;
  readonly modelMpnShaped: number;
  readonly modelDescriptive: number;
  readonly missingModel: number;
  readonly duplicateModels: readonly DuplicateCatalogueModel[];
  readonly byCategory: readonly CatalogueIdentityCategoryAudit[];
  readonly entries: readonly CatalogueIdentityAuditEntry[];
}

/**
 * Conservative MPN-shape heuristic: one token, at least five characters, at
 * least one letter and one digit, no whitespace. It is a triage signal only;
 * real model names such as "B650M" can match it and must not be treated as
 * verified part numbers.
 */
const MPN_SHAPED_MODEL =
  /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9][A-Za-z0-9._/-]{4,}$/;

export function isMpnShapedModel(model: string): boolean {
  return MPN_SHAPED_MODEL.test(model.trim());
}

function evidenceFor(
  identity: CatalogueProductIdentity,
): CatalogueIdentityEvidence {
  if (
    identity.manufacturerPartNumber !== null &&
    identity.manufacturerPartNumber.trim() !== ""
  ) {
    return "explicit-mpn";
  }
  if (identity.gtin !== null && identity.gtin.trim() !== "") {
    return "explicit-gtin";
  }
  const model = identity.model.trim();
  if (model === "") return "missing-model";
  return isMpnShapedModel(model) ? "model-mpn-shaped" : "model-descriptive";
}

function isVerifiedMatchReady(
  identity: CatalogueProductIdentity,
  evidence: CatalogueIdentityEvidence,
): boolean {
  if (evidence === "explicit-mpn") return true;
  return evidence === "explicit-gtin" && identity.manufacturer.trim() !== "";
}

export function auditCatalogueIdentities(
  identities: readonly CatalogueProductIdentity[],
): CatalogueIdentityAudit {
  const entries: CatalogueIdentityAuditEntry[] = identities.map((identity) => {
    const evidence = evidenceFor(identity);
    return {
      componentId: identity.componentId,
      category: identity.category,
      manufacturer: identity.manufacturer,
      model: identity.model,
      evidence,
      verifiedMatchReady: isVerifiedMatchReady(identity, evidence),
    };
  });

  const counts = {
    "explicit-mpn": 0,
    "explicit-gtin": 0,
    "model-mpn-shaped": 0,
    "model-descriptive": 0,
    "missing-model": 0,
  } satisfies Record<CatalogueIdentityEvidence, number>;
  for (const entry of entries) counts[entry.evidence] += 1;

  const models = new Map<string, string[]>();
  for (const identity of identities) {
    const model = normalizeModelNumber(identity.model);
    if (model === "") continue;
    const componentIds = models.get(model) ?? [];
    componentIds.push(identity.componentId);
    models.set(model, componentIds);
  }
  const duplicateModels: DuplicateCatalogueModel[] = [...models.entries()]
    .filter(([, componentIds]) => componentIds.length > 1)
    .map(([model, componentIds]) => ({ model, componentIds }))
    .sort((left, right) => left.model.localeCompare(right.model));

  const byCategory: CatalogueIdentityCategoryAudit[] = componentCategories
    .map((category) => {
      const categoryEntries = entries.filter(
        (entry) => entry.category === category,
      );
      return {
        category,
        total: categoryEntries.length,
        verifiedMatchReady: categoryEntries.filter(
          (entry) => entry.verifiedMatchReady,
        ).length,
        modelMpnShaped: categoryEntries.filter(
          (entry) => entry.evidence === "model-mpn-shaped",
        ).length,
        modelDescriptive: categoryEntries.filter(
          (entry) => entry.evidence === "model-descriptive",
        ).length,
      };
    })
    .filter((entry) => entry.total > 0);

  return {
    total: entries.length,
    verifiedMatchReady: entries.filter((entry) => entry.verifiedMatchReady)
      .length,
    explicitMpn: counts["explicit-mpn"],
    explicitGtin: counts["explicit-gtin"],
    modelMpnShaped: counts["model-mpn-shaped"],
    modelDescriptive: counts["model-descriptive"],
    missingModel: counts["missing-model"],
    duplicateModels,
    byCategory,
    entries,
  };
}
