/**
 * The element-runtime witnesses of review 1 (json-render L2): the shared
 * orchestration of the three element wrappers (§6.2, §6.6) is what decides
 * whether an engine chunk loads and what renders.
 *
 *   B7 — the elements are COMPONENT-BOUND: `<st-bar-chart>` accepts only
 *        `root.component === "BarChart"` (same for the other two). A
 *        mismatching envelope must render the §4.5 error panel (never
 *        another component, never a blank box).
 *   B8 — §6.6: an invalid envelope renders its diagnostics WITHOUT loading
 *        an engine chunk: the validator and the error panel are core; the
 *        lazy chunk loads only for a renderable envelope. The browser-level
 *        witness (zero chunk requests) lives in the Chromium suite; here the
 *        two engine modules are MOCKED with load counters.
 *   B1 — the property channel feeds JS objects: the runtime normalizes the
 *        envelope through the JSON round-trip before validating (and
 *        renders the normalized form), so `undefined`-valued optional props
 *        behave exactly as their serialized form.
 *
 * RED HISTORY (observed on 1bd68035 before the fix): the DecisionDossier
 * runtime accepted a valid BarChart envelope as `rendered` with an empty
 * article and empty diagnostics; both lazy elements loaded their engine
 * chunk for structurally invalid envelopes; a `width: undefined` prop was
 * rendered into the payload instead of vanishing with the JSON form.
 *
 * ORDERING (measured 2026-10-31): `vi.resetModules()` does NOT re-evaluate
 * the mocked engine modules on re-import (a second fresh registry reuses
 * the first evaluation — probed: the factory ran once, the second ingest
 * loaded nothing new), so per-test absolute load counters are meaningless.
 * This file therefore shares ONE module registry and asserts load DELTAS
 * in declaration order: every refusal (B7, then B8-invalid) runs while its
 * engine is still unloaded, so a load-first implementation would show a
 * +1 delta; the two valid-envelope renders run last and show exactly +1.
 * Vitest runs the `it` blocks of one file sequentially in declaration
 * order, so the deltas are deterministic.
 */

import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

import { createElementRuntime, type ElementComponent } from "../src/element/dom/element-runtime.svelte.js";
import type { Diagnostic } from "../src/validate/diagnostics.js";

/** The mocked engines' shared state: evaluation counters and fake ports. */
const engines = vi.hoisted(() => ({
  bpmnLoads: 0,
  focusLoads: 0,
  bpmnPort: { source: "bpmn-canvas", validate: () => [] },
  focusPort: { source: "focus", validate: () => [] },
}));

// The paths use the .ts form: vitest keys the mock registry by resolved module
// id, and the id the runtime's dynamic `import("./engines/…")` resolves to is
// the .ts one — a .js specifier in vi.mock does not match it and the mock
// silently never applies (probed: the factory only ran with the .ts form).
vi.mock("../src/element/dom/engines/bpmn-canvas.ts", () => {
  engines.bpmnLoads += 1;
  return {
    port: engines.bpmnPort,
    // The real toXml refuses an undefined document (semantic-invalid);
    // the mock mirrors that so the pre-fix behaviour is observable.
    toXml: async (document: unknown) =>
      document === undefined
        ? { ok: false as const, code: "st-no-document", message: "the document is missing" }
        : { ok: true as const, xml: "<svg></svg>", warnings: [] },
    renderBpmn: async () => () => {},
  };
});
vi.mock("../src/element/dom/engines/focus-renderer.ts", () => {
  engines.focusLoads += 1;
  return { port: engines.focusPort, renderDossier: () => () => {} };
});

const FIXTURE_DIR = new URL("./fixtures/", import.meta.url);

function fixture(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(new URL(name, FIXTURE_DIR), "utf8")) as Record<string, unknown>;
}

/** One envelope with a deep mutation inside `root`. */
function withRootMutation(name: string, mutate: (root: Record<string, unknown>) => void) {
  const envelope = fixture(name);
  const root = envelope.root as Record<string, unknown>;
  mutate(root);
  return envelope;
}

const errorDiagnostics = (diagnostics: readonly Diagnostic[]): readonly Diagnostic[] =>
  diagnostics.filter((diagnostic) => diagnostic.severity === "error");

/** Runs one ingest and returns the focus/bpmn load DELTA it caused. */
async function ingestDelta(
  component: ElementComponent,
  envelope: unknown,
): Promise<{ readonly state: string; readonly diagnostics: readonly Diagnostic[]; readonly payload: unknown; readonly focus: number; readonly bpmn: number }> {
  const beforeFocus = engines.focusLoads;
  const beforeBpmn = engines.bpmnLoads;
  const runtime = createElementRuntime(component);
  await runtime.ingest(envelope, undefined);
  return {
    state: runtime.state,
    diagnostics: runtime.diagnostics,
    payload: runtime.payload,
    focus: engines.focusLoads - beforeFocus,
    bpmn: engines.bpmnLoads - beforeBpmn,
  };
}

describe("element runtime: component-bound envelopes (B7, review 1)", () => {
  it("refuses a valid BarChart envelope on <st-decision-dossier> with the §4.5 panel, and loads no engine", async () => {
    const observed = await ingestDelta("DecisionDossier", fixture("bar-chart-pdata-1.json"));
    expect(observed.state).toBe("refused");
    expect(observed.payload).toBeNull();
    const errors = errorDiagnostics(observed.diagnostics);
    expect(errors.length).toBe(1);
    expect(errors[0]!.code).toBe("unknown-component");
    expect(errors[0]!.path).toBe("/root/component");
    expect(errors[0]!.message).toContain("DecisionDossier");
    expect(errors[0]!.message).toContain("BarChart");
    expect(observed.focus).toBe(0);
    expect(observed.bpmn).toBe(0);
  });

  it("refuses a valid DecisionDossier envelope on <st-bar-chart>", async () => {
    const observed = await ingestDelta("BarChart", fixture("decision-dossier.json"));
    expect(observed.state).toBe("refused");
    expect(observed.payload).toBeNull();
    const errors = errorDiagnostics(observed.diagnostics);
    expect(errors.length).toBe(1);
    expect(errors[0]!.code).toBe("unknown-component");
    expect(errors[0]!.path).toBe("/root/component");
    expect(observed.focus).toBe(0);
  });

  it("refuses a valid BarChart envelope on <st-bpmn-canvas> (never renders a chart, never converts)", async () => {
    const observed = await ingestDelta("BpmnCanvas", fixture("bar-chart-pdata-1.json"));
    expect(observed.state).toBe("refused");
    expect(observed.payload).toBeNull();
    const errors = errorDiagnostics(observed.diagnostics);
    expect(errors.length).toBe(1);
    expect(errors[0]!.code).toBe("unknown-component");
    expect(errors[0]!.path).toBe("/root/component");
    expect(observed.bpmn).toBe(0);
  });

  it("refuses a valid BpmnCanvas envelope on <st-decision-dossier>", async () => {
    const observed = await ingestDelta("DecisionDossier", fixture("bpmn-order-process.json"));
    expect(observed.state).toBe("refused");
    const errors = errorDiagnostics(observed.diagnostics);
    expect(errors.length).toBe(1);
    expect(errors[0]!.code).toBe("unknown-component");
    expect(observed.focus).toBe(0);
    expect(observed.bpmn).toBe(0);
  });
});

describe("element runtime: no engine load for an invalid envelope (B8, §6.6)", () => {
  it("<st-decision-dossier> refuses a schema-invalid envelope without loading the focus chunk", async () => {
    const invalid = withRootMutation("decision-dossier.json", (root) => {
      const document = root.document as Record<string, unknown>;
      delete document.title;
    });
    const observed = await ingestDelta("DecisionDossier", invalid);
    expect(observed.state).toBe("refused");
    expect(
      observed.diagnostics.some((d) => d.code === "schema-violation" && d.path === "/root/document/title"),
    ).toBe(true);
    expect(observed.focus).toBe(0);
  });

  it("<st-bpmn-canvas> refuses a schema-invalid envelope without loading the bpmn chunk", async () => {
    const invalid = withRootMutation("bpmn-order-process.json", (root) => {
      const document = root.document as Record<string, unknown>;
      delete document.$type;
    });
    const observed = await ingestDelta("BpmnCanvas", invalid);
    expect(observed.state).toBe("refused");
    expect(observed.diagnostics.some((d) => d.code === "schema-violation")).toBe(true);
    expect(observed.bpmn).toBe(0);
  });

  it("a VALID envelope still loads its engine exactly once and renders", async () => {
    const dossier = await ingestDelta("DecisionDossier", fixture("decision-dossier.json"));
    expect(dossier.state).toBe("rendered");
    expect(dossier.focus).toBe(1);

    const bpmn = await ingestDelta("BpmnCanvas", fixture("bpmn-order-process.json"));
    expect(bpmn.state).toBe("rendered");
    expect(bpmn.bpmn).toBe(1);
  });
});

describe("element runtime: JS-object envelopes normalize to their JSON form (B1)", () => {
  it("an undefined-valued OPTIONAL prop (the TS caller's `width: undefined`) renders as its serialized form", async () => {
    const base = fixture("bar-chart-pdata-1.json");
    const raw = { ...base, root: { ...(base.root as Record<string, unknown>), width: undefined } };
    const observed = await ingestDelta("BarChart", raw);
    expect(observed.state).toBe("rendered");
    expect(observed.diagnostics).toEqual([]);
    const payload = observed.payload as { kind: string; props: Record<string, unknown> } | null;
    expect(payload?.kind).toBe("bar-chart");
    expect(Object.hasOwn(payload?.props ?? {}, "width")).toBe(false);
    expect(Object.hasOwn(payload?.props ?? {}, "label")).toBe(true);
  });

  it("an undefined-valued REQUIRED prop is refused with `required`, like the serialized form", async () => {
    const base = fixture("bar-chart-pdata-1.json");
    const raw = { ...base, root: { ...(base.root as Record<string, unknown>), label: undefined } };
    const observed = await ingestDelta("BarChart", raw);
    expect(observed.state).toBe("refused");
    const errors = errorDiagnostics(observed.diagnostics);
    const first = errors[0];
    expect(first?.code).toBe("schema-violation");
    expect(first?.path).toBe("/root/label");
    expect((first?.detail as { keyword?: string } | undefined)?.keyword).toBe("required");
  });
});
