/**
 * AC-L1 witnesses on the envelope validator and its diagnostics (§4.3–§4.5).
 *
 * RED HISTORY (observed before the implementation existed, 2026-10-30): every
 * test in this file failed at that point — `src/validate/index.js` and
 * `src/generator/canonical.js` were not resolvable modules. This suite is the
 * RED witness for the AC-L1 items covering §4.4's contract rule (envelope 1.1
 * for a component at 1.0 refused, 1.0 for 1.1 accepted) and for "every §4.5
 * code is produced at least once".
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { CATALOG_ID, contracts } from "../src/contracts/index.js";
import { a2uiCommonTypes } from "../src/generated/a2ui-common-types.js";
import {
  createBpmnCanvasPort,
  createEnvelopeValidator,
  createFocusPort,
  engineLoadFailed,
  hostCapabilityMissing,
  type CatalogDocument,
  type Diagnostic,
} from "../src/validate/index.js";
import { validateDecisionDossierDocument as realFocusValidate } from "@sentropic/focus/validate";

const here = dirname(fileURLToPath(import.meta.url));
const packageDir = join(here, "..");

const catalog = JSON.parse(readFileSync(join(packageDir, "catalog.json"), "utf8")) as CatalogDocument;
const envelopeSchema = JSON.parse(readFileSync(join(packageDir, "envelope.json"), "utf8")) as Record<string, unknown>;
const commonTypes = a2uiCommonTypes as unknown as Record<string, unknown>;

const barChartExample = contracts[0]!.example;
const bpmnExample = contracts[1]!.example;
const dossierExample = contracts[2]!.example;

const focusPort = createFocusPort(realFocusValidate);
/** Accept-everything stub standing in for the absent BPMN engine (L6 injects the real one). */
const bpmnStub = { source: "bpmn-canvas" as const, validate: () => [] };

function validateEnvelope(input: unknown, ports?: Record<string, unknown>): readonly Diagnostic[] {
  return createEnvelopeValidator({
    catalog: JSON.parse(JSON.stringify(catalog)) as CatalogDocument,
    envelopeSchema,
    commonTypes,
    ports: (ports as never) ?? { focus: focusPort, "bpmn-canvas": bpmnStub },
  }).validate(input);
}

function envelope(overrides: Record<string, unknown>): Record<string, unknown> {
  return {
    catalogId: CATALOG_ID,
    contract: "1.0",
    mode: "snapshot",
    root: JSON.parse(JSON.stringify(barChartExample)),
    ...overrides,
  };
}

const codes = (diagnostics: readonly Diagnostic[]): readonly string[] => diagnostics.map((diagnostic) => diagnostic.code);

/**
 * Builds a BarChart envelope of an EXACT UTF-8 size: the label is ASCII
 * padding, and one padding character is exactly one byte of the envelope,
 * so the target size is reached by measurement, never by arithmetic on the
 * example's own label (which is multi-byte).
 */
function sizedEnvelope(targetBytes: number): Record<string, unknown> {
  const encoder = new TextEncoder();
  const bytes = (value: unknown): number => encoder.encode(JSON.stringify(value)).length;
  const withLabel = (label: string): Record<string, unknown> => {
    const root = JSON.parse(JSON.stringify(barChartExample)) as { label: string };
    root.label = label;
    return envelope({ root: { ...root, component: "BarChart" } });
  };
  const pad = targetBytes - bytes(withLabel(""));
  if (pad < 0) throw new Error(`target ${targetBytes} is smaller than the example envelope`);
  return withLabel("x".repeat(pad));
}

describe("the diagnostic shape is uniform everywhere (§4.5)", () => {
  const samples: readonly Diagnostic[] = [
    hostCapabilityMissing("bpmn-canvas hydrate"),
    engineLoadFailed("bpmn-canvas", "chunk fetch failed"),
    ...validateEnvelope(envelope({ mode: "preview" })),
    ...validateEnvelope(envelope({ root: { ...barChartExample, component: "Gauge" } })),
  ];

  it("every diagnostic carries code, path, message, severity and source", () => {
    expect(samples.length).toBeGreaterThanOrEqual(4);
    for (const diagnostic of samples) {
      expect(diagnostic.code).toEqual(expect.any(String));
      expect(diagnostic.path).toEqual(expect.any(String));
      expect(diagnostic.message).toEqual(expect.any(String));
      expect(["error", "warning"]).toContain(diagnostic.severity);
      expect(["catalog", "diagram-core", "bpmn-canvas", "focus", "host"]).toContain(diagnostic.source);
    }
  });

  it("every path is a JSON Pointer (RFC 6901) into the envelope", () => {
    for (const diagnostic of samples) {
      expect(diagnostic.path === "" || diagnostic.path.startsWith("/")).toBe(true);
      expect(diagnostic.path).not.toMatch(/~[^01]|\/$/);
    }
  });
});

describe("§4.4 contract rule", () => {
  it("envelope 1.1 for a component at 1.0 is refused with unsupported-contract", () => {
    const diagnostics = validateEnvelope(envelope({ contract: "1.1" }));
    expect(codes(diagnostics)).toContain("unsupported-contract");
    const hit = diagnostics.find((diagnostic) => diagnostic.code === "unsupported-contract");
    expect(hit?.path).toBe("/contract");
    expect(hit?.detail).toMatchObject({ expected: "1.0", found: "1.1" });
    // Never rendered partially: no other diagnostic hides the refusal.
    expect(codes(diagnostics)).toEqual(["unsupported-contract"]);
  });

  it("envelope 1.0 for a component at 1.1 is accepted (minors are additive)", () => {
    const bumped = JSON.parse(JSON.stringify(catalog)) as CatalogDocument;
    const bar = bumped.components.BarChart as { "x-sentropic": { contract: string } };
    bar["x-sentropic"].contract = "1.1";
    const diagnostics = createEnvelopeValidator({
      catalog: bumped,
      envelopeSchema,
      commonTypes,
      ports: { focus: focusPort, "bpmn-canvas": bpmnStub },
    }).validate(envelope({}));
    expect(diagnostics).toEqual([]);
  });

  it("a different major is refused", () => {
    const diagnostics = validateEnvelope(envelope({ contract: "2.0" }));
    expect(codes(diagnostics)).toEqual(["unsupported-contract"]);
  });
});

describe("§4.5: every code is produced at least once", () => {
  it("unknown-component", () => {
    const diagnostics = validateEnvelope(envelope({ root: { ...JSON.parse(JSON.stringify(barChartExample)), component: "Gauge" } }));
    expect(codes(diagnostics)).toEqual(["unknown-component"]);
    expect(diagnostics[0]!.path).toBe("/root/component");
    expect(diagnostics[0]!.source).toBe("catalog");
  });

  it("component-unavailable (an entry with x-sentropic.status unknown, §5.2)", () => {
    const withStub = JSON.parse(JSON.stringify(catalog)) as CatalogDocument & {
      components: Record<string, Record<string, unknown>>;
    };
    withStub.components["StubPanel"] = JSON.parse(JSON.stringify(withStub.components.BarChart!));
    const local = withStub.components["StubPanel"]!.allOf as Record<string, unknown>[];
    (local[2]! as { properties: Record<string, unknown> }).properties.component = { const: "StubPanel" };
    (withStub.components["StubPanel"]!["x-sentropic"] as Record<string, unknown>)["status"] = "unknown";
    const diagnostics = createEnvelopeValidator({
      catalog: withStub,
      envelopeSchema,
      commonTypes,
      ports: { focus: focusPort, "bpmn-canvas": bpmnStub },
    }).validate({
      catalogId: CATALOG_ID,
      contract: "1.0",
      mode: "snapshot",
      root: { id: "root", component: "StubPanel" },
    });
    expect(codes(diagnostics)).toEqual(["component-unavailable"]);
    expect(diagnostics[0]!.path).toBe("/root/component");
  });

  it("unsupported-contract — covered above", () => {
    expect(codes(validateEnvelope(envelope({ contract: "1.1" })))).toContain("unsupported-contract");
  });

  it("unsupported-mode (preview is reserved, §10.3)", () => {
    const diagnostics = validateEnvelope(envelope({ mode: "preview" }));
    expect(codes(diagnostics)).toEqual(["unsupported-mode"]);
    expect(diagnostics[0]!.path).toBe("/mode");
  });

  it("schema-violation (component level, JSON Pointer into the envelope)", () => {
    const root = JSON.parse(JSON.stringify(barChartExample)) as { data: { value: number | string }[] };
    root.data[1]!.value = "eighteen";
    const diagnostics = validateEnvelope(envelope({ root: { ...root, component: "BarChart" } }));
    expect(codes(diagnostics)).toContain("schema-violation");
    expect(diagnostics.some((diagnostic) => diagnostic.path === "/root/data/1/value")).toBe(true);
  });

  it("schema-violation (envelope level: an unknown key is refused, §4.3 strictness)", () => {
    const diagnostics = validateEnvelope({ ...envelope({}), theme: "dsfr" });
    expect(codes(diagnostics)).toContain("schema-violation");
    expect(diagnostics.some((diagnostic) => diagnostic.path === "/theme")).toBe(true);
  });

  it("semantic-invalid (focus: the pinned runtime's code is kept in detail.code)", () => {
    const root = JSON.parse(JSON.stringify(dossierExample)) as {
      document: { sections: { kind: string; id: string; targetRef: string; markdown: string }[] };
    };
    root.document.sections.push({ kind: "prose", id: "p1", targetRef: "decision-1", markdown: "first" });
    root.document.sections.push({ kind: "prose", id: "p1", targetRef: "decision-1", markdown: "duplicate id" });
    const diagnostics = validateEnvelope(envelope({ contract: "1.0", root }));
    expect(codes(diagnostics)).toEqual(["semantic-invalid"]);
    const hit = diagnostics[0]!;
    expect(hit.source).toBe("focus");
    expect(hit.detail?.code).toBe("duplicate_id");
    expect(hit.path).toBe("/root/document/sections/3/id");
  });

  it("semantic-invalid (bpmn-canvas: an injected engine port returning a failure)", () => {
    const port = createBpmnCanvasPort(() => ({ ok: false, code: "unsupported-type", message: "F1 refused this document" }));
    const diagnostics = validateEnvelope(envelope({ contract: "1.0", root: JSON.parse(JSON.stringify(bpmnExample)) }), {
      focus: focusPort,
      "bpmn-canvas": port,
    });
    expect(codes(diagnostics)).toEqual(["semantic-invalid"]);
    expect(diagnostics[0]!.source).toBe("bpmn-canvas");
    expect(diagnostics[0]!.detail?.code).toBe("unsupported-type");
  });

  it("payload-too-large (1 MiB UTF-8, §4.3 item 3)", () => {
    const over = sizedEnvelope(1048577);
    expect(new TextEncoder().encode(JSON.stringify(over)).length).toBe(1048577);
    const diagnostics = validateEnvelope(over);
    expect(codes(diagnostics)).toEqual(["payload-too-large"]);
    expect(diagnostics[0]!.detail).toMatchObject({ limitBytes: 1048576 });
    expect(diagnostics[0]!.source).toBe("catalog");
  });

  it("exactly 1 MiB is accepted (the limit is inclusive)", () => {
    const at = sizedEnvelope(1048576);
    expect(new TextEncoder().encode(JSON.stringify(at)).length).toBe(1048576);
    const diagnostics = validateEnvelope(at);
    expect(diagnostics).toEqual([]);
  });

  it("host-capability-missing (a lazy engine whose runtime the host did not inject)", () => {
    const diagnostics = validateEnvelope(envelope({ contract: "1.0", root: JSON.parse(JSON.stringify(bpmnExample)) }), {
      focus: focusPort,
    });
    expect(codes(diagnostics)).toEqual(["host-capability-missing"]);
    expect(diagnostics[0]!.source).toBe("host");
  });

  it("host-capability-missing and engine-load-failed factories exist for hosts (§4.5 sources)", () => {
    const missing = hostCapabilityMissing("Canvas 2D context");
    expect(missing.code).toBe("host-capability-missing");
    expect(missing.source).toBe("host");
    expect(missing.severity).toBe("error");
    const failed = engineLoadFailed("bpmn-canvas", "import failed");
    expect(failed.code).toBe("engine-load-failed");
    expect(failed.source).toBe("host");
    expect(failed.detail).toMatchObject({ chunk: "bpmn-canvas", cause: "import failed" });
  });

  it("engine-load-failed (a semantic port that THROWS mid-validation, through the real validator)", () => {
    const port = createBpmnCanvasPort(() => {
      throw new Error("chunk fetch failed");
    });
    const diagnostics = validateEnvelope(envelope({ contract: "1.0", root: JSON.parse(JSON.stringify(bpmnExample)) }), {
      focus: focusPort,
      "bpmn-canvas": port,
    });
    expect(diagnostics.length).toBe(1);
    expect(diagnostics[0]).toMatchObject({
      code: "engine-load-failed",
      severity: "error",
      path: "/root/document",
      source: "host",
    });
    expect(diagnostics[0]!.detail).toMatchObject({ chunk: "bpmn-canvas", cause: "chunk fetch failed" });
  });

  it("watermark-refused (pass-through warning from the engine port, severity warning)", () => {
    const port = createBpmnCanvasPort(() => ({
      ok: true,
      warnings: [{ code: "watermark-refused", message: "the engine rendered without the watermark layer" }],
    }));
    const diagnostics = validateEnvelope(envelope({ contract: "1.0", root: JSON.parse(JSON.stringify(bpmnExample)) }), {
      focus: focusPort,
      "bpmn-canvas": port,
    });
    expect(diagnostics.length).toBe(1);
    expect(diagnostics[0]!.code).toBe("watermark-refused");
    expect(diagnostics[0]!.severity).toBe("warning");
    expect(diagnostics[0]!.source).toBe("bpmn-canvas");
  });
});

describe("envelope structure (§4.2)", () => {
  it("a missing root is a schema-violation at /root", () => {
    const diagnostics = validateEnvelope({ catalogId: CATALOG_ID, contract: "1.0", mode: "snapshot" });
    expect(codes(diagnostics)).toContain("schema-violation");
    expect(diagnostics.some((diagnostic) => diagnostic.path === "/root")).toBe(true);
  });

  it("root.id is fixed to \"root\"", () => {
    const root = JSON.parse(JSON.stringify(barChartExample)) as { id: string };
    root.id = "other";
    const diagnostics = validateEnvelope(envelope({ root: { ...root, component: "BarChart" } }));
    expect(codes(diagnostics)).toContain("schema-violation");
  });

  it("a mismatched catalogId is refused (the default is the renderer's catalogue)", () => {
    const diagnostics = validateEnvelope(envelope({ catalogId: "https://example.com/other/catalog.json" }));
    expect(codes(diagnostics)).toContain("schema-violation");
    expect(diagnostics.some((diagnostic) => diagnostic.path === "/catalogId")).toBe(true);
  });

  it("an ABSENT catalogId is accepted: absent means the renderer's own catalogue (§4.2)", () => {
    expect(validateEnvelope({ contract: "1.0", root: JSON.parse(JSON.stringify(barChartExample)) })).toEqual([]);
    expect(validateEnvelope({ contract: "1.0", root: JSON.parse(JSON.stringify(bpmnExample)) })).toEqual([]);
    expect(validateEnvelope({ contract: "1.0", root: JSON.parse(JSON.stringify(dossierExample)) })).toEqual([]);
  });

  it("a clean envelope of every component validates with zero diagnostics", () => {
    expect(validateEnvelope(envelope({}))).toEqual([]);
    expect(validateEnvelope(envelope({ contract: "1.0", root: JSON.parse(JSON.stringify(bpmnExample)) }))).toEqual([]);
    expect(validateEnvelope(envelope({ contract: "1.0", root: JSON.parse(JSON.stringify(dossierExample)) }))).toEqual([]);
  });
});

describe("BLOCKING-3: no A2UI function or data binding validates anywhere (§4.1, §4.2, §5.2)", () => {
  /**
   * RED HISTORY (observed 2026-11-04, before the fix): all three payloads
   * were ACCEPTED with `[]` — `accessibility` was a free-shape object (the
   * A2UI `ComponentCommon` reference accepts `FunctionCall` and
   * `DataBinding` values for `label`). The fix closes `accessibility` to
   * literal strings; §5.2's two allOf references are kept.
   */
  const withAccessibility = (accessibility: Record<string, unknown>): Record<string, unknown> =>
    envelope({ root: { ...JSON.parse(JSON.stringify(barChartExample)), accessibility } });

  it("a FunctionCall in accessibility.label is refused with schema-violation", () => {
    const diagnostics = validateEnvelope(
      withAccessibility({ label: { call: "formatString", args: { value: "x" }, returnType: "string" } }),
    );
    expect(codes(diagnostics)).toContain("schema-violation");
    expect(diagnostics.some((diagnostic) => diagnostic.path === "/root/accessibility/label")).toBe(true);
  });

  it("a DataBinding in accessibility.label is refused with schema-violation", () => {
    const diagnostics = validateEnvelope(withAccessibility({ label: { path: "/x" } }));
    expect(codes(diagnostics)).toContain("schema-violation");
    expect(diagnostics.some((diagnostic) => diagnostic.path === "/root/accessibility/label")).toBe(true);
  });

  it("an unknown key under accessibility is refused with schema-violation (closed literal-only object)", () => {
    const diagnostics = validateEnvelope(withAccessibility({ label: "Répartition des ventes", surprise: 123 }));
    expect(codes(diagnostics)).toContain("schema-violation");
    expect(diagnostics.some((diagnostic) => diagnostic.path === "/root/accessibility/surprise")).toBe(true);
  });

  it("a plain literal accessibility still validates (the legitimate use is kept)", () => {
    const diagnostics = validateEnvelope(
      withAccessibility({ label: "Répartition des ventes", description: "Ventes par trimestre" }),
    );
    expect(diagnostics).toEqual([]);
  });
});
