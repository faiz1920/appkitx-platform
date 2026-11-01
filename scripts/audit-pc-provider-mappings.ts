/*
 * Read-only provider mapping audit for the PC Builder catalogue (M10.12).
 *
 * The pricing domain uses bundler-style extensionless imports, so bundle the
 * script before running it with Node:
 *
 *   npx esbuild scripts/audit-pc-provider-mappings.ts \
 *     --bundle --platform=node --format=esm --outfile=/tmp/pc-provider-mapping-audit.mjs
 *   node /tmp/pc-provider-mapping-audit.mjs
 *
 * The script audits the committed synthetic fixture dataset. It never writes
 * registry data, never contacts a provider and never promotes a mapping. The
 * fixture verified mapping is a test-only review, not a real approval.
 */
import { catalogue } from "../src/lib/pc-builder/catalogue/index.ts";
import { identifierRegistry } from "../src/lib/pc-builder/catalogue/identifiers.ts";
import {
  auditProviderMappingDataset,
  auditProviderProductIdentifiers,
} from "../src/lib/pc-builder/provider-mapping/index.ts";
import { syntheticProviderMappingDataset } from "../src/dev/pc-builder/provider-mapping-fixtures.ts";

const audit = auditProviderMappingDataset(
  catalogue,
  syntheticProviderMappingDataset,
  {
    now: new Date(),
    identifierRegistry,
    allowSyntheticData: false,
  },
);

if (!audit.ok) {
  const lines = [
    "PC Builder provider mapping audit: FAILED",
    "Dataset validation rejected the following records:",
    ...audit.issues.map(
      (entry) => `  ${entry.path} [${entry.code}]: ${entry.message}`,
    ),
  ];
  process.stdout.write(`${lines.join("\n")}\n`);
  process.exitCode = 1;
} else {
  const result = audit.value;
  const coverage = auditProviderProductIdentifiers(
    syntheticProviderMappingDataset.products,
  );
  const lines = [
    "PC Builder provider mapping audit",
    "Dataset: SYNTHETIC fixture dataset — not real retailer or provider data.",
    `Total provider products: ${result.totalProviderProducts}`,
    `Total mappings: ${result.totalMappings}`,
    `Verified mappings: ${result.verifiedMappings}`,
    `Candidate mappings: ${result.candidateMappings}`,
    `Needs-review mappings: ${result.needsReviewMappings}`,
    `Rejected mappings: ${result.rejectedMappings}`,
    `Effective verified mappings: ${result.effectiveVerifiedMappings}`,
    `Effective needs-review mappings: ${result.effectiveNeedsReviewMappings}`,
    `Invalidated reviews: ${result.invalidatedReviewMappings}`,
    `Duplicate external product IDs: ${result.duplicateExternalProductIds}`,
    `Conflicting catalogue associations: ${result.conflictingCatalogueAssociations}`,
    `Component variant conflicts: ${result.componentVariantConflicts}`,
    `Regional mismatches: ${result.regionalMismatches}`,
    `Invalid identifiers: ${result.invalidIdentifiers}`,
    `Missing-identifier products: ${result.missingIdentifierProducts}`,
    `Unmapped provider products: ${result.unmappedProviderProducts}`,
    `Ambiguous matches: ${result.ambiguousMatches}`,
    `Provider product identifier changes: ${result.productIdentifierChanges}`,
    `Discontinued provider products: ${result.discontinuedProviderProducts}`,
    `Superseded provider products: ${result.supersededProviderProducts}`,
    `Discontinued catalogue targets: ${result.discontinuedCatalogueTargets}`,
    `Stale provider-product mappings: ${result.staleProviderProductMappings}`,
    `Stale catalogue-evidence mappings: ${result.staleCatalogueMappings}`,
    `Pricing-eligible mappings (synthetic excluded): ${result.pricingEligibleMappings}`,
    `Identifier coverage — manufacturer: ${coverage.withManufacturer}/${coverage.totalProducts}`,
    `Identifier coverage — MPN: ${coverage.withManufacturerPartNumber}/${coverage.totalProducts}`,
    `Identifier coverage — model: ${coverage.withModelNumber}/${coverage.totalProducts}`,
    `Identifier coverage — GTIN: ${coverage.withGtin}/${coverage.totalProducts}`,
    `Identifier coverage — no exact identifier: ${coverage.withoutExactIdentifier}/${coverage.totalProducts}`,
    `Identifier coverage — provider SKU only: ${coverage.providerSkuOnly}/${coverage.totalProducts}`,
  ];

  if (result.unmappedProviderProductKeys.length > 0) {
    lines.push(
      "",
      `Unmapped provider products: ${result.unmappedProviderProductKeys.join(", ")}`,
    );
  }
  if (result.ambiguousProviderProductKeys.length > 0) {
    lines.push(
      "",
      `Ambiguous provider products: ${result.ambiguousProviderProductKeys.join(", ")}`,
    );
  }
  if (result.regionalMismatchMappingIds.length > 0) {
    lines.push(
      "",
      `Regional mismatch mappings: ${result.regionalMismatchMappingIds.join(", ")}`,
    );
  }
  if (result.discontinuedCatalogueTargetMappingIds.length > 0) {
    lines.push(
      "",
      `Discontinued catalogue target mappings: ${result.discontinuedCatalogueTargetMappingIds.join(", ")}`,
    );
  }

  lines.push("", `Audit issues: ${result.issues.length}`);
  for (const entry of result.issues) {
    const subject = [
      entry.providerId ?? "",
      entry.externalProductId ?? "",
      entry.mappingId ?? "",
    ]
      .filter((part) => part !== "")
      .join(" / ");
    lines.push(
      `  [${entry.severity}] ${entry.code}: ${entry.message}${subject === "" ? "" : ` (${subject})`}`,
    );
  }

  lines.push(
    "",
    "Automatic matching never creates a verified mapping.",
    "The verified fixture is a synthetic test-only approval, not a real review.",
    "Synthetic fixtures are excluded from pricing eligibility by default.",
    "No provider request, retailer integration or live data exists in M10.12.",
  );

  process.stdout.write(`${lines.join("\n")}\n`);
}
