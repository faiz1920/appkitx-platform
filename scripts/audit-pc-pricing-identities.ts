/*
 * Read-only verified identity audit for the PC Builder catalogue (M10.9).
 *
 * The pricing domain uses bundler-style extensionless imports, so bundle the
 * script before running it with Node:
 *
 *   npx esbuild scripts/audit-pc-pricing-identities.ts \
 *     --bundle --platform=node --format=esm --outfile=/tmp/pc-identity-audit.mjs
 *   node /tmp/pc-identity-audit.mjs
 *
 * The audit never writes catalogue data and never treats an MPN-shaped model
 * string or a provisional record as verified evidence.
 */
import { catalogue } from "../src/lib/pc-builder/catalogue/index.ts";
import { identifierRegistry } from "../src/lib/pc-builder/catalogue/identifiers.ts";
import { auditIdentifierRegistry } from "../src/lib/pc-builder/pricing/index.ts";

const audit = auditIdentifierRegistry(catalogue, identifierRegistry, {
  now: new Date(),
});

if (!audit.ok) {
  const lines = [
    "PC Builder pricing identity audit: FAILED",
    "Registry validation rejected the following records:",
    ...audit.issues.map(
      (entry) => `  ${entry.path} [${entry.code}]: ${entry.message}`,
    ),
  ];
  process.stdout.write(`${lines.join("\n")}\n`);
  process.exitCode = 1;
} else {
  const result = audit.value;
  const lines = [
    "PC Builder pricing identity audit",
    `Total components: ${result.totalComponents}`,
    `Registry records: ${result.totalRecords}`,
    `Source-verified records: ${result.sourceVerifiedRecords}`,
    `Provisional records: ${result.provisionalRecords}`,
    `Human-reviewed records: ${result.humanReviewedRecords}`,
    `Awaiting human review: ${result.awaitingHumanReviewRecords}`,
    `Needs correction: ${result.needsCorrectionRecords}`,
    `Rejected: ${result.rejectedRecords}`,
    `Needs revalidation: ${result.needsRevalidationRecords}`,
    `Invalidated reviews: ${result.invalidatedReviewRecords}`,
    `Stale source verifications: ${result.staleSourceVerificationRecords}`,
    `Stale human reviews: ${result.staleHumanReviewRecords}`,
    `Duplicate MPN records: ${result.duplicateMpnRecords}`,
    `Duplicate GTIN records: ${result.duplicateGtinRecords}`,
    `Conflicting component records: ${result.conflictingComponentRecords}`,
    `Records with MPN: ${result.mpnRecords}`,
    `Records with GTIN: ${result.gtinRecords}`,
    `Records with both MPN and GTIN: ${result.bothRecords}`,
    `Components with source-verified identity: ${result.sourceVerifiedComponents}`,
    `Components with source-verified MPN: ${result.sourceVerifiedMpn}`,
    `Components with source-verified GTIN: ${result.sourceVerifiedGtin}`,
    `Components with both: ${result.both}`,
    `Components without source-verified identity: ${result.withoutSourceVerified}`,
    `Catalogue audit — source-verified matching-ready: ${result.catalogue.verifiedMatchReady}`,
    `Catalogue audit — explicit MPN identities: ${result.catalogue.explicitMpn}`,
    `Catalogue audit — explicit GTIN-only identities: ${result.catalogue.explicitGtin}`,
    `Catalogue audit — MPN-shaped candidates remaining: ${result.catalogue.modelMpnShaped}`,
    `Catalogue audit — descriptive model names remaining: ${result.catalogue.modelDescriptive}`,
    `Catalogue audit — duplicate normalized models: ${result.catalogue.duplicateModels.length}`,
    "",
    "By category (total / source-verified / MPN / GTIN / both / without / human-reviewed):",
  ];

  for (const category of result.byCategory) {
    lines.push(
      `  ${category.category}: ${category.total} / ${category.sourceVerifiedComponents} / ${category.sourceVerifiedMpn} / ${category.sourceVerifiedGtin} / ${category.both} / ${category.withoutSourceVerified} / ${category.humanReviewedComponents}`,
    );
  }

  if (result.provisionalComponentIds.length > 0) {
    lines.push(
      "",
      `Provisional components (not eligible for verified matching): ${result.provisionalComponentIds.join(", ")}`,
    );
  }
  if (result.humanReviewedComponentIds.length > 0) {
    lines.push(
      "",
      `Human-reviewed components: ${result.humanReviewedComponentIds.join(", ")}`,
    );
  }
  if (result.needsCorrectionComponentIds.length > 0) {
    lines.push(
      "",
      `Needs-correction components: ${result.needsCorrectionComponentIds.join(", ")}`,
    );
  }
  if (result.rejectedComponentIds.length > 0) {
    lines.push(
      "",
      `Rejected components: ${result.rejectedComponentIds.join(", ")}`,
    );
  }
  if (result.needsRevalidationComponentIds.length > 0) {
    lines.push(
      "",
      `Needs-revalidation components: ${result.needsRevalidationComponentIds.join(", ")}`,
    );
  }
  if (result.invalidatedReviewComponentIds.length > 0) {
    lines.push(
      "",
      `Invalidated-review components: ${result.invalidatedReviewComponentIds.join(", ")}`,
    );
  }
  if (result.staleSourceVerificationComponentIds.length > 0) {
    lines.push(
      "",
      `Stale source-verification components: ${result.staleSourceVerificationComponentIds.join(", ")}`,
    );
  }
  if (result.staleHumanReviewComponentIds.length > 0) {
    lines.push(
      "",
      `Stale human-review components: ${result.staleHumanReviewComponentIds.join(", ")}`,
    );
  }
  if (result.catalogue.duplicateModels.length > 0) {
    lines.push("", "Duplicate catalogue models:");
    for (const duplicate of result.catalogue.duplicateModels) {
      lines.push(`  ${duplicate.model}: ${duplicate.componentIds.join(", ")}`);
    }
  }

  lines.push(
    "",
    "Matching eligibility is based on source verification, not human approval.",
    "Human review is a separate governance gate and does not gate matching in M10.11.",
    "Invalidated reviews are reported as needs-revalidation, never as reviewed.",
    "Provisional records and MPN-shaped model strings are never counted as",
    "verified matches, and no retailer SKU or provider identifier is inferred.",
  );

  process.stdout.write(`${lines.join("\n")}\n`);
}
