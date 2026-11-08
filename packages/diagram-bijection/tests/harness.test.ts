/**
 * §2.9 witnesses of the harness skeleton: W-DL0.1 (runHarness on both
 * structure fixtures), W-DL0.2 (three broken codecs), W-DL0.3
 * (enumerateFoldStates) and W-DL0.5 (computeVerdict matrix).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { runHarness } from "../src/harness/run.js";
import { enumerateFoldStates } from "../src/harness/fold-states.js";
import { computeVerdict } from "../src/harness/verdict.js";
import { fixtureGoldenStore } from "../src/harness/goldens.js";
import type { HarnessRun, LoadedFixture, FormatCodec, FoldContext, StepId } from "../src/harness/types.js";
import { loadStructureFixture, stubCardsRenderer, stubJsonCodec } from "../src/formats/stub-json.js";
import { readFixturePins, type FixturePin } from "../src/pins/fixture-pins.js";
import { validateReport } from "../src/report/validate.js";
import type { BijectionReport, StepResult } from "../src/report/schema.js";

const pkgRoot = fileURLToPath(new URL("..", import.meta.url));
const fixturesRoot = join(pkgRoot, "fixtures");
const pins = readFixturePins(join(fixturesRoot, "pins.json"));
const repoPin = (id: string): FixturePin => {
  const pin = pins.pins.find((p) => p.id === id);
  if (pin === undefined) throw new Error(`pin ${id} missing`);
  return pin;
};

const CLEAN_COMMIT = "0123456789abcdef0123456789abcdef01234567";
const PINS = {
  dsCommit: CLEAN_COMMIT,
  engram: "pending",
  bpmnCanvas: "not-applicable",
  mermaidPreview: "not-applicable",
  rasterizer: "not-run",
} as const;

const STUB_LOSSES = [
  { what: "stub top-level key refusal", class: "refused", code: "stub-edit-unsupported", count: 1 },
  { what: "stub non-canonical refusal", class: "refused", code: "stub-noncanonical", count: 1 },
] as const;

function loadFixtureBytes(pin: FixturePin): Uint8Array {
  return new Uint8Array(readFileSync(join(pkgRoot, "..", "..", pin.path)));
}

function makeRun(pinId: string, codecOverride?: (codec: FormatCodec) => FormatCodec): { run: HarnessRun; loaded: LoadedFixture } {
  const pin = repoPin(pinId);
  const bytes = loadFixtureBytes(pin);
  const loadedOr = loadStructureFixture(bytes);
  if (!loadedOr.ok) throw new Error(`fixture ${pinId} does not load`);
  const loaded = loadedOr.value;
  const base = stubJsonCodec(loaded.folds);
  const codec = codecOverride === undefined ? base : codecOverride(base);
  const run: HarnessRun = {
    fixture: pin,
    load: () => ({ ok: true, value: loaded }),
    codec,
    renderer: stubCardsRenderer(),
    goldens: fixtureGoldenStore(fixturesRoot),
    pins: PINS,
    losses: STUB_LOSSES,
    checks: [],
  };
  return { run, loaded };
}

const io = (pin: FixturePin, bytes: Uint8Array) => ({ readFixture: async () => bytes });

describe("W-DL0.1 runHarness with stub-json on both structure fixtures", () => {
  it.each([
    ["s2-target-anon", 25],
    ["tiny", 5],
  ])("%s: every step has a status, the report validates, S5 not-run, S6 pass, X1/X2 %s/0", async (pinId, states) => {
    const { run } = makeRun(pinId);
    const bytes = loadFixtureBytes(run.fixture);
    const report = await runHarness(run, io(run.fixture, bytes));
    const stepIds: readonly StepId[] = ["S0", "S1", "S2", "S3", "S4", "S5", "S6"];
    for (const id of stepIds) {
      expect(report.steps[id], `step ${id} has a status`).toBeDefined();
      expect(["pass", "fail", "not-run", "not-applicable"]).toContain(report.steps[id].status);
    }
    const validated = validateReport(report);
    expect(validated.ok, `report validates: ${validated.ok ? "" : validated.diagnostics.map((d: { message: string }) => d.message).join("; ")}`).toBe(true);
    expect(report.steps.S5.status).toBe("not-run");
    expect(report.steps.S5.reason).toBe("foreign tool not pinned");
    expect(report.steps.S6.status).toBe("pass");
    expect(report.foldStates).toBe(states);
    expect(report.x1).toEqual({ pass: states, fail: 0 });
    expect(report.x2).toEqual({ pass: states, fail: 0 });
    // Clean commit pin, no failing step: the computed verdict is demonstrated.
    expect(report.verdict).toBe("demonstrated");
    expect(report.unverified).toEqual(["S5 not run (foreign tool not pinned)"]);
  });
});

describe("W-DL0.2 three broken stub codecs", () => {
  it("import dropping one record entry fails S2 and gives not demonstrated", async () => {
    const { run } = makeRun("tiny", (base) => ({
      ...base,
      importFile(file) {
        const result = base.importFile(file);
        if (!result.ok) return result;
        const records = [...result.value.model.records];
        records.pop();
        return { ok: true, value: { ...result.value, model: { records } } };
      },
    }));
    const bytes = loadFixtureBytes(run.fixture);
    const report = await runHarness(run, io(run.fixture, bytes));
    expect(report.verdict).toBe("not demonstrated");
    expect(report.steps.S2.status).toBe("fail");
    expect(report.steps.S2.codes).toContain("harness-x1-mismatch");
  });

  it("re-export appending one byte fails S1/S3 and gives not demonstrated", async () => {
    const { run } = makeRun("tiny", (base) => ({
      ...base,
      exportFile(model, fold) {
        const result = base.exportFile(model, fold);
        if (!result.ok) return result;
        const bytes = new Uint8Array(result.value.bytes.length + 1);
        bytes.set(result.value.bytes, 0);
        bytes[result.value.bytes.length] = 0x20;
        return { ok: true, value: { ...result.value, bytes } };
      },
    }));
    const bytes = loadFixtureBytes(run.fixture);
    const report = await runHarness(run, io(run.fixture, bytes));
    expect(report.verdict).toBe("not demonstrated");
    const failing = (["S1", "S2", "S3"] as const).filter((id) => report.steps[id].status === "fail");
    expect(failing.length).toBeGreaterThan(0);
  });

  it("a forbidden probe that is accepted fails S4 and gives not demonstrated", async () => {
    const { run } = makeRun("tiny", (base) => ({
      ...base,
      probes: base.probes.map((p) =>
        p.kind === "forbidden" ? { ...p, apply: (file) => file, expect: { kind: "model", record: "structure.json", patch: [] } } : p,
      ),
    }));
    const bytes = loadFixtureBytes(run.fixture);
    const report = await runHarness(run, io(run.fixture, bytes));
    expect(report.verdict).toBe("not demonstrated");
    expect(report.steps.S4.status).toBe("fail");
    expect(report.steps.S4.codes).toContain("harness-probe-unexpected");
  });
});

describe("W-DL0.3 enumerateFoldStates", () => {
  it("gives 25 states for the s2-target-anon context, in the stated order", () => {
    const { loaded } = makeRun("s2-target-anon");
    const ctx = loaded.folds[0];
    if (ctx === undefined) throw new Error("no fold context");
    const states = enumerateFoldStates(ctx);
    expect(states.length).toBe(25);
    expect(states[0]?.id).toBe("default");
    expect(states[1]?.id).toBe("all-expanded");
    expect(states[2]?.id).toBe("all-folded");
    const toggles = states.slice(3);
    expect(toggles.map((s) => s.id)).toEqual(ctx.containers.map((c) => `toggle:${c}`));
    // Each toggle differs from default by exactly one container.
    const def = new Set(states[0]?.collapsed ?? []);
    for (const t of toggles) {
      const cur = new Set(t.collapsed);
      const diff = [...ctx.containers].filter((c) => def.has(c) !== cur.has(c));
      expect(diff.length, `toggle ${t.id} differs by exactly one container`).toBe(1);
    }
  });

  it("gives 13 states for a context of 10 containers (central-711 shape)", () => {
    const ctx: FoldContext = {
      view: "view:main",
      containers: Array.from({ length: 10 }, (_, i) => `z${String(i + 1).padStart(2, "0")}`),
      defaultCollapsed: ["z01", "z02"],
    };
    const states = enumerateFoldStates(ctx);
    expect(states.length).toBe(13);
    expect(states.map((s) => s.id)).toEqual([
      "default",
      "all-expanded",
      "all-folded",
      ...ctx.containers.map((c) => `toggle:${c}`),
    ]);
  });
});

describe("W-DL0.5 computeVerdict matrix", () => {
  const passStep = (over: Partial<StepResult> = {}): StepResult => ({ status: "pass", ...over });
  const allPass = (s5: StepResult): Record<StepId, StepResult> => ({
    S0: passStep(),
    S1: passStep({ pass: 1, fail: 0 }),
    S2: passStep({ pass: 1, fail: 0 }),
    S3: passStep({ pass: 1, fail: 0 }),
    S4: passStep({ pass: 1, fail: 0 }),
    S5: s5,
    S6: passStep({ pass: 1, fail: 0 }),
  });

  it("any fail gives not demonstrated", () => {
    const steps = allPass(passStep());
    steps.S3 = { status: "fail", pass: 0, fail: 1, codes: ["harness-x2-mismatch"] };
    expect(computeVerdict(steps, [], PINS, []).verdict).toBe("not demonstrated");
  });

  it("all pass with S5 not-run gives demonstrated with S5 listed", () => {
    const steps = allPass({ status: "not-run", reason: "foreign tool not pinned" });
    const { verdict, unverified } = computeVerdict(steps, [], PINS, []);
    expect(verdict).toBe("demonstrated");
    expect(unverified).toEqual(["S5 not run (foreign tool not pinned)"]);
  });

  it("S6 not-run gives partial", () => {
    const steps = allPass(passStep());
    steps.S6 = { status: "not-run", reason: "dependency lot missing" };
    expect(computeVerdict(steps, [], PINS, []).verdict).toBe("partial");
  });

  it("a dirty commit gives at most partial", () => {
    const steps = allPass({ status: "not-run", reason: "foreign tool not pinned" });
    const dirty = { ...PINS, dsCommit: `${CLEAN_COMMIT}+dirty` };
    const { verdict, unverified } = computeVerdict(steps, [], dirty, []);
    expect(verdict).toBe("partial");
    expect(unverified).toContain("dsCommit dirty");
  });

  it("a codec that exports no state gives harness-vacuous and not demonstrated", async () => {
    const { run, loaded } = makeRun("tiny");
    const empty: HarnessRun = { ...run, load: () => ({ ok: true, value: { ...loaded, folds: [] } }) };
    const bytes = loadFixtureBytes(run.fixture);
    const report = await runHarness(empty, io(run.fixture, bytes));
    expect(report.verdict).toBe("not demonstrated");
    expect(report.steps.S1.codes).toContain("harness-vacuous");
  });

  it("a probe list with no forbidden probe gives harness-vacuous and not demonstrated", async () => {
    const { run } = makeRun("tiny", (base) => ({ ...base, probes: base.probes.filter((p) => p.kind === "allowed") }));
    const bytes = loadFixtureBytes(run.fixture);
    const report = await runHarness(run, io(run.fixture, bytes));
    expect(report.verdict).toBe("not demonstrated");
    expect(report.steps.S4.codes).toContain("harness-vacuous");
  });

  it("validateReport rejects a report whose verdict differs from the computed one", async () => {
    const { run } = makeRun("tiny");
    const bytes = loadFixtureBytes(run.fixture);
    const report = await runHarness(run, io(run.fixture, bytes));
    const tampered: BijectionReport = { ...report, verdict: "not demonstrated" };
    const validated = validateReport(tampered);
    expect(validated.ok).toBe(false);
  });
});
