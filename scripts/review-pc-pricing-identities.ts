/*
 * Read-only human-review queue for source-verified PC Builder identities
 * (M10.11).
 *
 * The pricing domain uses bundler-style extensionless imports, so bundle the
 * script before running it with Node:
 *
 *   npx esbuild scripts/review-pc-pricing-identities.ts \
 *     --bundle --platform=node --format=esm --outfile=/tmp/pc-identity-review.mjs
 *   node /tmp/pc-identity-review.mjs
 *
 * The queue never writes registry data, never invents reviewers and never
 * promotes a record to reviewed. A review decision must be supplied by a named
 * human and recorded in the registry by a separate change.
 */
import { catalogue } from "../src/lib/pc-builder/catalogue/index.ts";
import { identifierRegistry } from "../src/lib/pc-builder/catalogue/identifiers.ts";
import { buildIdentityReviewQueue } from "../src/lib/pc-builder/pricing/index.ts";

const queue = buildIdentityReviewQueue(catalogue, identifierRegistry, {
  now: new Date(),
});

if (!queue.ok) {
  const lines = [
    "PC Builder identity human-review queue: FAILED",
    "Registry validation rejected the following records:",
    ...queue.issues.map(
      (entry) => `  ${entry.path} [${entry.code}]: ${entry.message}`,
    ),
  ];
  process.stdout.write(`${lines.join("\n")}\n`);
  process.exitCode = 1;
} else {
  const result = queue.value;
  const lines = [
    "PC Builder identity human-review queue",
    `Total source-verified identities: ${result.total}`,
    `By status: ${result.byStatus
      .map((entry) => `${entry.status}=${entry.total}`)
      .join(", ")}`,
    `By category: ${result.byCategory
      .map((entry) => `${entry.category}=${entry.total}`)
      .join(", ")}`,
    "",
  ];

  for (const [index, entry] of result.entries.entries()) {
    const identity =
      entry.manufacturerPartNumber ?? entry.gtin ?? "(no explicit identifier)";
    lines.push(
      `${index + 1}. [${entry.category}] ${entry.componentId}`,
      `   identity: ${entry.manufacturer} / ${entry.model} / ${identity}`,
      `   MPN: ${entry.manufacturerPartNumber ?? "-"} | GTIN: ${entry.gtin ?? "-"} | region: ${entry.region ?? "-"}`,
      `   source: ${entry.sourceName} (${entry.sourceUrl})`,
      `   source accessed: ${entry.sourceAccessedAt} | source verified: ${entry.sourceVerifiedAt}`,
      `   review: ${entry.humanReviewStatus} (declared: ${entry.declaredHumanReviewStatus}, current: ${entry.reviewCurrent ? "yes" : "no"})`,
      `   concerns: ${
        entry.concerns.length > 0 ? entry.concerns.join(" ") : "none"
      }`,
    );
  }

  lines.push(
    "",
    "No record is marked reviewed unless a named human decision is recorded.",
    "Source outages are reported as needs-revalidation, not as identity defects.",
  );

  process.stdout.write(`${lines.join("\n")}\n`);
}
