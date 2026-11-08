// runHarness (§2.1): the S0–S6 algorithm, made exact. The report it returns
// is validated against ds.diagram-bijection-report/1 before being returned;
// a report that fails validation is a harness defect (thrown), never written.
import { createHash } from "node:crypto";
import type { BijectionReport, CheckResult, StepResult } from "../report/schema.js";
import { validateReport } from "../report/validate.js";
import { computeVerdict } from "./verdict.js";
import { applyJsonPatch, modelFromRecords, modelsEqual } from "./model.js";
import { defaultFoldState, enumerateFoldStates } from "./fold-states.js";
import type { ExportedFile, FoldState, HarnessIo, HarnessRun, ImportedFile, LoadedFixture, StepId } from "./types.js";

function sha256HexBytes(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

// X1 compares the persisted fold content (view + collapsed). Identical sets
// keep their own entries (§2.1), so the entry id is a harness-side label and
// is not part of the comparison.
function foldEquals(a: FoldState, b: FoldState): boolean {
  return (
    a.view === b.view &&
    a.collapsed.length === b.collapsed.length &&
    [...a.collapsed].sort().every((v, i) => v === [...b.collapsed].sort()[i])
  );
}

function codesOf(diagnostics: readonly { code: string }[]): readonly string[] {
  return [...new Set(diagnostics.map((d) => d.code))];
}

const STEP_IDS: readonly StepId[] = ["S0", "S1", "S2", "S3", "S4", "S5", "S6"];

export async function runHarness(run: HarnessRun, io: HarnessIo): Promise<BijectionReport> {
  const steps = {} as Record<StepId, StepResult>;

  // --- S0: read, pin check, load -------------------------------------------
  let loaded: LoadedFixture | undefined;
  let s0: StepResult;
  const bytesOrUnavailable = await io.readFixture(run.fixture);
  if ("unavailable" in bytesOrUnavailable) {
    s0 = { status: "not-run", reason: "raw fixture unavailable" };
  } else if (sha256HexBytes(bytesOrUnavailable) !== run.fixture.sha256 || bytesOrUnavailable.length !== run.fixture.bytes) {
    s0 = { status: "fail", pass: 0, fail: 1, codes: ["harness-pin-mismatch"] };
  } else {
    const result = run.load(bytesOrUnavailable);
    if (!result.ok) {
      s0 = { status: "fail", pass: 0, fail: 1, codes: codesOf(result.diagnostics) };
    } else {
      loaded = result.value;
      s0 = { status: "pass", pass: 1, fail: 0 };
    }
  }
  steps.S0 = s0;

  if (s0.status !== "pass" || loaded === undefined) {
    const reason = s0.status === "not-run" ? s0.reason : "prerequisite failed";
    for (const id of STEP_IDS.slice(1)) steps[id] = { status: "not-run", reason };
    const report = assemble(run, steps, { pass: 0, fail: 0 }, { pass: 0, fail: 0 }, emptyEditSubset(), 1);
    return finish(report);
  }

  const M = loaded.model;
  const folds = loaded.folds;
  const states: FoldState[] = run.codec.perFoldState
    ? folds.flatMap((ctx) => enumerateFoldStates(ctx))
    : folds.map((ctx) => defaultFoldState(ctx));
  const foldStates = states.length > 0 ? states.length : 1;

  // --- S1: export each fold state, compare with the golden digest ----------
  const exported = new Map<FoldState, ExportedFile>();
  let s1Pass = 0;
  let s1Fail = 0;
  const s1Codes: string[] = [];
  for (const state of states) {
    const file = run.codec.exportFile(M, state);
    if (!file.ok) {
      s1Fail += 1;
      s1Codes.push(...codesOf(file.diagnostics));
      continue;
    }
    const golden = run.goldens.digest(run.codec.format, run.fixture.id, state);
    const digest = sha256HexBytes(file.value.bytes);
    if (golden === undefined) {
      s1Fail += 1;
      s1Codes.push("harness-golden-missing");
    } else if (golden !== digest) {
      s1Fail += 1;
      s1Codes.push("harness-golden-mismatch");
    } else {
      s1Pass += 1;
      exported.set(state, file.value);
    }
  }
  steps.S1 =
    states.length === 0
      ? { status: "fail", pass: 0, fail: 1, codes: ["harness-vacuous"] }
      : { status: s1Fail > 0 ? "fail" : "pass", pass: s1Pass, fail: s1Fail, codes: [...new Set(s1Codes)] };

  // --- S2: X1 import round-trip --------------------------------------------
  const imported = new Map<FoldState, ImportedFile>();
  let x1Pass = 0;
  let x1Fail = 0;
  const s2Codes: string[] = [];
  for (const [state, file] of exported) {
    const result = run.codec.importFile(file);
    if (result.ok && modelsEqual(result.value.model, M).equal && foldEquals(result.value.fold, state)) {
      x1Pass += 1;
      imported.set(state, result.value);
    } else {
      x1Fail += 1;
      s2Codes.push("harness-x1-mismatch");
    }
  }
  steps.S2 =
    exported.size === 0
      ? { status: "fail", pass: 0, fail: 1, codes: ["harness-vacuous"] }
      : { status: x1Fail > 0 ? "fail" : "pass", pass: x1Pass, fail: x1Fail, codes: [...new Set(s2Codes)] };

  // --- S3: X2 re-export byte equality ---------------------------------------
  let x2Pass = 0;
  let x2Fail = 0;
  const s3Codes: string[] = [];
  for (const [state, imp] of imported) {
    const file = exported.get(state);
    if (file === undefined) continue;
    const again = run.codec.exportFile(imp.model, imp.fold);
    if (again.ok && bytesEqual(again.value.bytes, file.bytes)) x2Pass += 1;
    else {
      x2Fail += 1;
      s3Codes.push("harness-x2-mismatch");
    }
  }
  steps.S3 =
    imported.size === 0
      ? { status: "fail", pass: 0, fail: 1, codes: ["harness-vacuous"] }
      : { status: x2Fail > 0 ? "fail" : "pass", pass: x2Pass, fail: x2Fail, codes: [...new Set(s3Codes)] };

  // --- S4: edit probes on the first view's default state --------------------
  const firstDefault = states.find((s) => s.id === "default") ?? states[0];
  const allowed = run.codec.probes.filter((p) => p.kind === "allowed");
  const forbidden = run.codec.probes.filter((p) => p.kind === "forbidden");
  let editSubset = emptyEditSubset();
  if (firstDefault === undefined || allowed.length === 0 || forbidden.length === 0) {
    steps.S4 = { status: "fail", pass: 0, fail: 1, codes: ["harness-vacuous"] };
  } else {
    let baseFile = exported.get(firstDefault);
    if (baseFile === undefined) {
      const re = run.codec.exportFile(M, firstDefault);
      if (!re.ok) {
        steps.S4 = { status: "fail", pass: 0, fail: 1, codes: codesOf(re.diagnostics) };
      } else {
        baseFile = re.value;
      }
    }
    let allowedDone = 0;
    let forbiddenDone = 0;
    let probeFail = 0;
    const probeCodes: string[] = [];
    if (baseFile !== undefined) {
      const records: Record<string, unknown> = {};
      for (const record of M.records) records[record.name] = JSON.parse(record.jcs);
      for (const probe of run.codec.probes) {
        const patched = probe.apply(baseFile);
        const result = run.codec.importFile(patched);
        if (probe.kind === "allowed") {
          if (probe.expect.kind !== "model") {
            probeFail += 1;
            probeCodes.push("harness-probe-unexpected");
            continue;
          }
          const target = records[probe.expect.record];
          const patchedRecord = target === undefined ? undefined : applyJsonPatch(target, probe.expect.patch);
          const expectedModel = modelFromRecords({ ...records, [probe.expect.record]: patchedRecord });
          if (result.ok && modelsEqual(result.value.model, expectedModel).equal) allowedDone += 1;
          else {
            probeFail += 1;
            probeCodes.push("harness-probe-unexpected");
          }
        } else {
          if (probe.expect.kind !== "refused") {
            probeFail += 1;
            probeCodes.push("harness-probe-unexpected");
            continue;
          }
          const got = result.ok ? [] : codesOf(result.diagnostics);
          if (!result.ok && got.length === 1 && got[0] === probe.expect.code) forbiddenDone += 1;
          else {
            probeFail += 1;
            probeCodes.push("harness-probe-unexpected");
          }
        }
      }
    }
    const codes = [
      ...new Set(forbidden.map((p) => (p.expect.kind === "refused" ? p.expect.code : "")).filter((c) => c.length > 0)),
    ];
    steps.S4 = {
      status: probeFail > 0 ? "fail" : "pass",
      pass: allowedDone + forbiddenDone,
      fail: probeFail,
      codes: [...new Set([...probeCodes, ...codes])],
    };
    editSubset = {
      allowedMapped: { done: allowedDone, of: allowed.length },
      forbiddenRefused: { done: forbiddenDone, of: forbidden.length },
      codes,
    };
  }

  // --- S5: foreign save ------------------------------------------------------
  const foreign = run.codec.foreignSave;
  if (foreign === undefined) {
    steps.S5 = { status: "not-run", reason: "foreign tool not pinned" };
  } else if (foreign === "not-applicable") {
    steps.S5 = { status: "not-applicable" };
  } else {
    const baseFile = firstDefault !== undefined ? exported.get(firstDefault) : undefined;
    if (baseFile === undefined) {
      steps.S5 = { status: "not-run", reason: "prerequisite failed" };
    } else {
      const saved = await foreign.save(baseFile);
      const result = run.codec.importFile(saved);
      if (result.ok && modelsEqual(result.value.model, M).equal) {
        steps.S5 = { status: "pass", pass: 1, fail: 0 };
      } else {
        steps.S5 = { status: "fail", pass: 0, fail: 1, codes: ["harness-foreign-mismatch"] };
      }
    }
  }

  // --- S6: render both models in every fold state ----------------------------
  if (run.renderer === undefined) {
    steps.S6 = { status: "not-run", reason: "dependency lot missing" };
  } else if (states.length === 0) {
    steps.S6 = { status: "fail", pass: 0, fail: 1, codes: ["harness-vacuous"] };
  } else if (imported.size === 0) {
    // S1/S2 produced no imported model: there is no I.model to render, so S6
    // cannot run its pass rule (§2.1) — never compare M against itself.
    steps.S6 = { status: "not-run", reason: "prerequisite failed" };
  } else {
    let rPass = 0;
    let rFail = 0;
    const rCodes: string[] = [];
    const encoder = new TextEncoder();
    for (const state of states) {
      const imp = imported.get(state);
      const a = run.renderer.render(M, state);
      if (imp === undefined) {
        // No imported model for this state (S2 failed for it): equivalence is
        // not demonstrated for it.
        rFail += 1;
        rCodes.push("harness-render-mismatch");
        continue;
      }
      const b = run.renderer.render(imp.model, imp.fold);
      if (!a.ok || !b.ok) {
        rFail += 1;
        rCodes.push("harness-render-refused");
        continue;
      }
      if (sha256HexBytes(encoder.encode(a.value.svg)) === sha256HexBytes(encoder.encode(b.value.svg))) rPass += 1;
      else {
        rFail += 1;
        rCodes.push("harness-render-mismatch");
      }
    }
    steps.S6 = { status: rFail > 0 ? "fail" : "pass", pass: rPass, fail: rFail, codes: [...new Set(rCodes)] };
  }

  const report = assemble(run, steps, { pass: x1Pass, fail: x1Fail }, { pass: x2Pass, fail: x2Fail }, editSubset, foldStates);
  return finish(report);
}

function emptyEditSubset(): BijectionReport["editSubset"] {
  return { allowedMapped: { done: 0, of: 0 }, forbiddenRefused: { done: 0, of: 0 }, codes: [] };
}

function assemble(
  run: HarnessRun,
  steps: Record<StepId, StepResult>,
  x1: { pass: number; fail: number },
  x2: { pass: number; fail: number },
  editSubset: BijectionReport["editSubset"],
  foldStates: number,
): BijectionReport {
  const checks: readonly CheckResult[] = run.checks ?? [];
  const { verdict, unverified } = computeVerdict(steps, checks, run.pins, run.unverified ?? []);
  return {
    schema: "ds.diagram-bijection-report/1",
    format: run.codec.format,
    chain: run.codec.chain,
    fixture: { id: run.fixture.id, path: run.fixture.path, sha256: run.fixture.sha256 },
    pins: run.pins,
    perFoldState: run.codec.perFoldState,
    foldStates,
    steps,
    x1,
    x2,
    editSubset,
    checks,
    losses: run.losses,
    unverified,
    verdict,
  };
}

function finish(report: BijectionReport): BijectionReport {
  const validated = validateReport(report);
  if (!validated.ok) {
    const details = validated.diagnostics.map((d) => d.message).join("; ");
    throw new Error(`harness defect: report failed ds.diagram-bijection-report/1 validation: ${details}`);
  }
  return validated.value;
}
