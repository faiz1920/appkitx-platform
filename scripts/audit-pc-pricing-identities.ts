/*
 * Read-only catalogue identity audit for India pricing readiness (M10.8).
 *
 * The pricing domain uses bundler-style extensionless imports, so bundle the
 * script before running it with Node:
 *
 *   npx esbuild scripts/audit-pc-pricing-identities.ts \
 *     --bundle --platform=node --format=esm --outfile=/tmp/pc-identity-audit.mjs
 *   node /tmp/pc-identity-audit.mjs
 *
 * The audit never writes catalogue data and never claims that an MPN-shaped
 * model string is a verified manufacturer part number.
 */
import { catalogue } from "../src/lib/pc-builder/catalogue/index.ts";
import {
  auditCatalogueIdentities,
  catalogueIdentity,
} from "../src/lib/pc-builder/pricing/index.ts";

const identities = catalogue.map(catalogueIdentity);
const audit = auditCatalogueIdentities(identities);

const lines = [
  "PC Builder pricing identity audit",
  `Total components: ${audit.total}`,
  `Verified-match ready (explicit MPN or GTIN): ${audit.verifiedMatchReady}`,
  `Explicit MPN: ${audit.explicitMpn}`,
  `Explicit GTIN: ${audit.explicitGtin}`,
  `MPN-shaped model strings (unverified candidates): ${audit.modelMpnShaped}`,
  `Descriptive model names: ${audit.modelDescriptive}`,
  `Missing model: ${audit.missingModel}`,
  `Duplicate normalized models: ${audit.duplicateModels.length}`,
  "",
  "By category (total / verified / mpn-shaped / descriptive):",
];

for (const category of audit.byCategory) {
  lines.push(
    `  ${category.category}: ${category.total} / ${category.verifiedMatchReady} / ${category.modelMpnShaped} / ${category.modelDescriptive}`,
  );
}

if (audit.duplicateModels.length > 0) {
  lines.push("", "Duplicate models:");
  for (const duplicate of audit.duplicateModels) {
    lines.push(`  ${duplicate.model}: ${duplicate.componentIds.join(", ")}`);
  }
}

lines.push(
  "",
  "No MPN, GTIN or retailer SKU is inferred. Explicit identity metadata must",
  "come from a manufacturer or verified identifier source before matching can",
  "produce a verified purchase option.",
);

process.stdout.write(`${lines.join("\n")}\n`);
