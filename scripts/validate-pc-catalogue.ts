/*
 * Catalogue quality gate for the PC Builder dataset.
 *
 * Run with `npm run pc-builder:validate-catalogue`. Exits non-zero when a
 * record is invalid, ids collide, or provenance is missing. Unknown
 * specifications are reported for verification triage but do not fail the
 * command — explicit unknowns are valid data.
 */
import { catalogue } from "../src/lib/pc-builder/catalogue/index.ts";
import {
  buildCatalogueReport,
  formatCatalogueReport,
} from "../src/lib/pc-builder/catalogue-report.ts";

const report = buildCatalogueReport(catalogue);
process.stdout.write(`${formatCatalogueReport(report)}\n`);

if (!report.ok) {
  process.exitCode = 1;
}
