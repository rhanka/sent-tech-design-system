// validateReport (§2.3): the frozen JSON Schema plus the checks a schema
// cannot state — done ≤ of, verdict/unverified equal computeVerdict(...),
// X1/X2 tallies equal foldStates when the step ran, and every editSubset code
// declared by a refused loss.
import Ajv2020 from "ajv/dist/2020.js";
import { computeVerdict } from "../harness/verdict.js";
import type { Outcome } from "../harness/types.js";
import { REPORT_SCHEMA, type BijectionReport, type StepResult } from "./schema.js";

const ajv = new Ajv2020({ allErrors: true, strict: true });
const validateSchema = ajv.compile(REPORT_SCHEMA);

export function validateReport(value: unknown): Outcome<BijectionReport> {
  if (!validateSchema(value)) {
    const details = (validateSchema.errors ?? []).map((e) => `${e.instancePath || "/"} ${e.message ?? ""}`).join("; ");
    return {
      ok: false,
      diagnostics: [{ origin: "ds-harness", code: "report-schema-invalid", message: `report fails ds.diagram-bijection-report/1: ${details}` }],
    };
  }
  const report = value as BijectionReport;
  const problems: string[] = [];

  const { allowedMapped, forbiddenRefused } = report.editSubset;
  if (allowedMapped.done > allowedMapped.of) problems.push("allowedMapped.done > of");
  if (forbiddenRefused.done > forbiddenRefused.of) problems.push("forbiddenRefused.done > of");

  // verdict and unverified must equal computeVerdict(...) — the report's own
  // unverified list plays the role of the declared strings, so the check is a
  // fixed point: computed ⊆ reported, sorted and unique, and the verdict equal.
  const computed = computeVerdict(report.steps, report.checks, report.pins, report.unverified);
  if (computed.verdict !== report.verdict) problems.push(`verdict ${report.verdict} != computed ${computed.verdict}`);
  if (computed.unverified.join("\n") !== [...report.unverified].sort().join("\n")) {
    problems.push("unverified differs from computeVerdict(...)");
  }

  // §2.1 verdict rules on the tallies: x1.fail + x2.fail > 0 is never
  // demonstrated; demonstrated requires x1.pass >= 1, x2.pass >= 1 and both
  // edit fractions complete with of >= 1.
  if (report.x1.fail + report.x2.fail > 0 && report.verdict !== "not demonstrated") {
    problems.push("x1.fail + x2.fail > 0 but verdict is not \"not demonstrated\"");
  }
  if (report.verdict === "demonstrated") {
    if (report.x1.pass < 1 || report.x2.pass < 1) problems.push("demonstrated requires x1.pass >= 1 and x2.pass >= 1");
    if (!(allowedMapped.done === allowedMapped.of && allowedMapped.of >= 1)) {
      problems.push("demonstrated requires allowedMapped done = of >= 1");
    }
    if (!(forbiddenRefused.done === forbiddenRefused.of && forbiddenRefused.of >= 1)) {
      problems.push("demonstrated requires forbiddenRefused done = of >= 1");
    }
  }

  // §2.3: when S2 ran, x1.pass + x1.fail equals foldStates (same for S3 and
  // x2). A vacuous step (no state exported) did not run its comparison, so a
  // zero tally is only admissible together with harness-vacuous.
  const ranComparison = (s: StepResult): boolean =>
    s.status === "pass" || (s.status === "fail" && !(s.codes ?? []).includes("harness-vacuous"));
  if (ranComparison(report.steps.S2) && report.x1.pass + report.x1.fail !== report.foldStates) {
    problems.push("x1 tally != foldStates when S2 ran");
  }
  if (ranComparison(report.steps.S3) && report.x2.pass + report.x2.fail !== report.foldStates) {
    problems.push("x2 tally != foldStates when S3 ran");
  }

  const refusedCodes = new Set(
    report.losses.filter((l) => l.class === "refused" && l.code !== undefined).map((l) => l.code as string),
  );
  for (const code of report.editSubset.codes) {
    if (!refusedCodes.has(code)) problems.push(`editSubset code ${code} has no refused loss`);
  }

  if (problems.length > 0) {
    return {
      ok: false,
      diagnostics: problems.map((message) => ({ origin: "ds-harness" as const, code: "report-semantic-invalid", message })),
    };
  }
  return { ok: true, value: report };
}
