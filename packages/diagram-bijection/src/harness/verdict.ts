// The computed verdict (§2.1) — never typed by the caller.
import type { CheckResult, ReportPins, StepResult, Verdict } from "../report/schema.js";
import type { StepId, StepStatus } from "./types.js";

const STEP_IDS: readonly StepId[] = ["S0", "S1", "S2", "S3", "S4", "S5", "S6"];

export function computeVerdict(
  steps: Readonly<Record<StepId, StepResult>>,
  checks: readonly CheckResult[],
  pins: ReportPins,
  declared: readonly string[],
): { readonly verdict: Verdict; readonly unverified: readonly string[] } {
  const stepFail = STEP_IDS.some((id) => steps[id].status === "fail");
  const checkFail = checks.some((c) => c.status === "fail");
  const s0Pass = steps.S0.status === "pass";
  const dirty = pins.dsCommit.endsWith("+dirty");

  let verdict: Verdict;
  if (!s0Pass || stepFail || checkFail) {
    verdict = "not demonstrated";
  } else if (
    STEP_IDS.every((id) => id === "S5" || steps[id].status === "pass") &&
    (steps.S5.status === "pass" || steps.S5.status === "not-run" || steps.S5.status === "not-applicable") &&
    checks.every((c) => c.status === "pass" || c.status === "not-applicable") &&
    !dirty
  ) {
    verdict = "demonstrated";
  } else {
    verdict = "partial";
  }

  const unverified: string[] = [];
  for (const id of STEP_IDS) {
    const step = steps[id];
    if (step.status === "not-run" && step.reason !== undefined) unverified.push(`${id} not run (${step.reason})`);
  }
  for (const check of checks) {
    if (check.status === "not-run" && check.reason !== undefined) unverified.push(`${check.id} not run (${check.reason})`);
  }
  if (dirty) unverified.push("dsCommit dirty");
  unverified.push(...declared);
  return { verdict, unverified: [...new Set(unverified)].sort() };
}

/** Step status helper: a step with at least one failure is `fail`. */
export function stepStatusOf(pass: number, fail: number, codes: readonly string[]): { status: StepStatus; pass: number; fail: number; codes: readonly string[] } {
  if (fail > 0) return { status: "fail", pass, fail, codes };
  return { status: "pass", pass, fail, codes };
}
