/**
 * `ds-layout-hints@1`: schema, semantic validator, pin.
 *
 * Three gates:
 *   1. THE PIN. The digest is recomputed from the canonical schema bytes at
 *      test time and compared with the exported digest, the pin, the shipped
 *      `schemas/ds-layout-hints-1.{json,sha256}` files and a literal. Editing
 *      the schema without a new vocabulary version turns this red.
 *   2. THE SCHEMA. Ajv (2020-12, strict) compiles the exported schema; every
 *      vector below states whether the schema alone accepts it, and the
 *      hand-written validator must never accept what the schema refuses.
 *   3. THE VALIDATOR. Each refusal asserts its CODE and its path: a future
 *      mode is not an unknown mode, a forbidden knob is not an unknown hint.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { Ajv2020 } from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";

import {
  canonicalBytes,
  DS_LAYOUT_AXES,
  DS_LAYOUT_FORBIDDEN_HINTS,
  DS_LAYOUT_FUTURE_HINTS,
  DS_LAYOUT_FUTURE_MODES,
  DS_LAYOUT_HINTS_RULES,
  DS_LAYOUT_HINTS_SCHEMA,
  DS_LAYOUT_HINTS_SCHEMA_DIGEST,
  DS_LAYOUT_HINTS_SCHEMA_ID,
  DS_LAYOUT_MEASURED_HINTS,
  DS_LAYOUT_MODES,
  DS_LAYOUT_ROOT_GROUP_ID,
  DS_LAYOUT_VOCABULARY,
  DS_LAYOUT_VOCABULARY_PIN,
  entityRef,
  isLayoutHints,
  lowerLayoutHints,
  sha256Hex,
  validateLayoutHints,
  type DsLayoutHints,
  type LayoutHintsContext,
} from "../src/index.js";

const PIN_LITERAL = "e72fd3f3446e19585b2992071f57c3777685f27087165c932806e12354ced42c";
const V = DS_LAYOUT_VOCABULARY;
const GENERIC1: LayoutHintsContext = { profiles: ["generic@1"], diagramPresentation: false };

const ajv = new Ajv2020({ strict: true });
const schemaAccepts = ajv.compile(DS_LAYOUT_HINTS_SCHEMA as Record<string, unknown>);

function codesOf(value: unknown, context?: LayoutHintsContext): string[] {
  return validateLayoutHints(value, context).map((entry) => `${entry.code}@${entry.path}`);
}

function expectDeepFrozen(value: unknown): void {
  if (value === null || typeof value !== "object") return;
  expect(Object.isFrozen(value)).toBe(true);
  for (const child of Object.values(value)) expectDeepFrozen(child);
}

describe("ds-layout-hints@1 pin", () => {
  it("recomputes the digest from the canonical schema bytes", () => {
    const bytes = canonicalBytes(DS_LAYOUT_HINTS_SCHEMA);
    const recomputed = sha256Hex(bytes);
    expect(recomputed).toBe(DS_LAYOUT_HINTS_SCHEMA_DIGEST);
    expect(recomputed).toBe(DS_LAYOUT_VOCABULARY_PIN.contentDigest);
    expect(recomputed).toBe(PIN_LITERAL);
    // An independent SHA-256 over the same UTF-8 bytes agrees with the package's own.
    expect(createHash("sha256").update(bytes, "utf8").digest("hex")).toBe(PIN_LITERAL);
  });

  it("is a PresentationPin with a bare 64-hex digest", () => {
    expect(DS_LAYOUT_VOCABULARY_PIN).toEqual({
      id: "https://sentropic.dev/schemas/diagram/layout-hints/v1",
      version: "ds-layout-hints@1",
      contentDigest: PIN_LITERAL,
    });
    expect(Object.keys(DS_LAYOUT_VOCABULARY_PIN).sort()).toEqual(["contentDigest", "id", "version"]);
    expect(DS_LAYOUT_VOCABULARY_PIN.contentDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(DS_LAYOUT_VOCABULARY_PIN.id).toBe(DS_LAYOUT_HINTS_SCHEMA_ID);
    expect(DS_LAYOUT_HINTS_SCHEMA["$id"]).toBe(DS_LAYOUT_HINTS_SCHEMA_ID);
  });

  it("ships the exact canonical schema text and its digest", () => {
    const text = readFileSync(new URL("../schemas/ds-layout-hints-1.json", import.meta.url), "utf8");
    const digest = readFileSync(new URL("../schemas/ds-layout-hints-1.sha256", import.meta.url), "utf8");
    expect(text).toBe(canonicalBytes(DS_LAYOUT_HINTS_SCHEMA));
    expect(JSON.parse(text)).toEqual(DS_LAYOUT_HINTS_SCHEMA);
    expect(digest).toBe(`${PIN_LITERAL}\n`);
    expect(createHash("sha256").update(text, "utf8").digest("hex")).toBe(PIN_LITERAL);
  });

  it("is stable: key order and a detached copy do not move the digest, a content change does", () => {
    const copy = JSON.parse(JSON.stringify(DS_LAYOUT_HINTS_SCHEMA)) as Record<string, unknown>;
    const reordered = Object.fromEntries(Object.entries(copy).reverse());
    expect(sha256Hex(canonicalBytes(copy))).toBe(PIN_LITERAL);
    expect(sha256Hex(canonicalBytes(reordered))).toBe(PIN_LITERAL);
    const widened = JSON.parse(JSON.stringify(copy)) as { $defs: { mode: { enum: string[] } } };
    widened.$defs.mode.enum.push("lane-stack");
    expect(sha256Hex(canonicalBytes(widened))).not.toBe(PIN_LITERAL);
  });

  it("keeps schema, rules and pin deeply frozen", () => {
    expectDeepFrozen(DS_LAYOUT_HINTS_SCHEMA);
    expectDeepFrozen(DS_LAYOUT_HINTS_RULES);
    expectDeepFrozen(DS_LAYOUT_VOCABULARY_PIN);
    expect(() => Object.assign(DS_LAYOUT_VOCABULARY_PIN, { version: "ds-layout-hints@9" })).toThrow();
  });

  it("carries the refusal classification inside the pinned bytes", () => {
    const defs = DS_LAYOUT_HINTS_SCHEMA["$defs"] as Record<string, { enum?: readonly string[] }>;
    expect(defs["mode"]?.enum).toEqual([...DS_LAYOUT_MODES]);
    expect(defs["futureMode"]?.enum).toEqual([...DS_LAYOUT_FUTURE_MODES]);
    expect(defs["futureHint"]?.enum).toEqual([...DS_LAYOUT_FUTURE_HINTS]);
    expect(defs["forbiddenHint"]?.enum).toEqual([...DS_LAYOUT_FORBIDDEN_HINTS]);
    expect(defs["measuredHint"]?.enum).toEqual([...DS_LAYOUT_MEASURED_HINTS]);
    expect(defs["axis"]?.enum).toEqual([...DS_LAYOUT_AXES]);
    expect(DS_LAYOUT_HINTS_RULES.modes.implemented).toEqual(defs["mode"]?.enum);
    expect(DS_LAYOUT_HINTS_RULES.modes.future).toEqual(defs["futureMode"]?.enum);
    expect(DS_LAYOUT_HINTS_RULES.hints.future).toEqual(defs["futureHint"]?.enum);
    expect(DS_LAYOUT_HINTS_RULES.hints.forbidden).toEqual(defs["forbiddenHint"]?.enum);
    expect(DS_LAYOUT_HINTS_RULES.hints.measuredOnly).toEqual(defs["measuredHint"]?.enum);
  });

  it("states exactly the modes the layout engine executes", () => {
    expect([...DS_LAYOUT_MODES]).toEqual(["auto-pack", "layered-flow"]);
    expect([...DS_LAYOUT_FUTURE_MODES]).toEqual(["lane-stack", "matrix-grid", "tree"]);
    // No name is both admitted and refused.
    const all = [...DS_LAYOUT_MODES, ...DS_LAYOUT_FUTURE_MODES];
    expect(new Set(all).size).toBe(all.length);
    const names = [...DS_LAYOUT_MEASURED_HINTS, ...DS_LAYOUT_FUTURE_HINTS, ...DS_LAYOUT_FORBIDDEN_HINTS, "vocabulary", "mode"];
    expect(new Set(names).size).toBe(names.length);
  });
});

const A = "entity:a";
const B = "entity:b";
const C = "entity:c";

/** Payloads the schema AND the validator accept. `context` is what the validator needs beyond the payload. */
const ACCEPTED: readonly { name: string; value: unknown; context?: LayoutHintsContext }[] = [
  { name: "auto-pack, bare", value: { vocabulary: V, mode: "auto-pack" } },
  { name: "auto-pack with grouping_axis rows", value: { vocabulary: V, mode: "auto-pack", grouping_axis: "rows" } },
  { name: "auto-pack with grouping_axis columns", value: { vocabulary: V, mode: "auto-pack", grouping_axis: "columns" } },
  { name: "auto-pack with stretch", value: { vocabulary: V, mode: "auto-pack", stretch: true } },
  { name: "auto-pack with rootOrder", value: { vocabulary: V, mode: "auto-pack", rootOrder: [B, A] } },
  { name: "auto-pack with ordering", value: { vocabulary: V, mode: "auto-pack", ordering: { [A]: [C, B] } } },
  {
    name: "auto-pack with recursive grouping",
    value: {
      vocabulary: V,
      mode: "auto-pack",
      grouping: [
        { id: "top", direction: "rows", items: [A, { id: "inner", direction: "columns", items: [B], stretch: false }] },
        { id: "side", direction: "columns", items: [C], stretch: true },
      ],
    },
  },
  { name: "layered-flow on a generic@1 view", value: { vocabulary: V, mode: "layered-flow" }, context: GENERIC1 },
];

/** Payloads refused, with the exact diagnostics and whether the schema alone refuses them too. */
const REFUSED: readonly { name: string; value: unknown; context?: LayoutHintsContext; codes: readonly string[]; schema: boolean }[] = [
  { name: "not an object", value: "auto-pack", codes: ["layout-hints-invalid@layout"], schema: false },
  { name: "an array", value: [], codes: ["layout-hints-invalid@layout"], schema: false },
  { name: "vocabulary absent", value: { mode: "auto-pack" }, codes: ["layout-vocabulary-unknown@layout.vocabulary"], schema: false },
  {
    name: "another vocabulary version",
    value: { vocabulary: "ds-layout-hints@2", mode: "matrix-grid" },
    codes: ["layout-vocabulary-unknown@layout.vocabulary"],
    schema: false,
  },
  { name: "mode absent", value: { vocabulary: V }, codes: ["layout-hints-invalid@layout.mode"], schema: false },
  { name: "future mode matrix-grid", value: { vocabulary: V, mode: "matrix-grid" }, codes: ["layout-mode-not-implemented@layout.mode"], schema: false },
  { name: "future mode tree", value: { vocabulary: V, mode: "tree" }, codes: ["layout-mode-not-implemented@layout.mode"], schema: false },
  { name: "future mode lane-stack", value: { vocabulary: V, mode: "lane-stack" }, codes: ["layout-mode-not-implemented@layout.mode"], schema: false },
  { name: "unknown mode", value: { vocabulary: V, mode: "force-directed" }, codes: ["layout-mode-unknown@layout.mode"], schema: false },
  { name: "mode of another case", value: { vocabulary: V, mode: "Auto-Pack" }, codes: ["layout-mode-unknown@layout.mode"], schema: false },
  { name: "mode of another type", value: { vocabulary: V, mode: 1 }, codes: ["layout-mode-unknown@layout.mode"], schema: false },
  {
    name: "density",
    value: { vocabulary: V, mode: "auto-pack", density: "compact" },
    codes: ["layout-hint-forbidden@layout.density"],
    schema: false,
  },
  {
    name: "pixel and coordinate knobs",
    value: { vocabulary: V, mode: "auto-pack", cardGapX: 12, x: 0, width: 460 },
    codes: ["layout-hint-forbidden@layout.cardGapX", "layout-hint-forbidden@layout.width", "layout-hint-forbidden@layout.x"],
    schema: false,
  },
  {
    name: "sloped label orientation",
    value: { vocabulary: V, mode: "auto-pack", edge_label_orientation: "along-edge" },
    codes: ["layout-hint-forbidden@layout.edge_label_orientation"],
    schema: false,
  },
  {
    name: "rotate_labels (later vocabulary)",
    value: { vocabulary: V, mode: "auto-pack", rotate_labels: "auto" },
    codes: ["layout-hint-not-implemented@layout.rotate_labels"],
    schema: false,
  },
  {
    name: "direction (later vocabulary)",
    value: { vocabulary: V, mode: "auto-pack", direction: "left-to-right" },
    codes: ["layout-hint-not-implemented@layout.direction"],
    schema: false,
  },
  { name: "unmodelled property", value: { vocabulary: V, mode: "auto-pack", theme: "dark" }, codes: ["layout-hint-unknown@layout.theme"], schema: false },
  {
    name: "grouping together with grouping_axis",
    value: { vocabulary: V, mode: "auto-pack", grouping_axis: "rows", grouping: [{ id: "g", direction: "rows", items: [A] }] },
    codes: ["layout-hint-conflict@layout.grouping_axis"],
    schema: false,
  },
  { name: "grouping_axis outside the axes", value: { vocabulary: V, mode: "auto-pack", grouping_axis: "diagonal" }, codes: ["layout-hints-invalid@layout.grouping_axis"], schema: false },
  { name: "stretch of another type", value: { vocabulary: V, mode: "auto-pack", stretch: "yes" }, codes: ["layout-hints-invalid@layout.stretch"], schema: false },
  { name: "rootOrder of another namespace", value: { vocabulary: V, mode: "auto-pack", rootOrder: ["occurrence:a"] }, codes: ["layout-hints-invalid@layout.rootOrder.0"], schema: false },
  { name: "rootOrder listing a root twice", value: { vocabulary: V, mode: "auto-pack", rootOrder: [A, A] }, codes: ["layout-hint-conflict@layout.rootOrder.1"], schema: false },
  {
    name: "ordering keyed by a non-reference",
    value: { vocabulary: V, mode: "auto-pack", ordering: { parent: [A] } },
    codes: ["layout-hints-invalid@layout.ordering.parent"],
    schema: false,
  },
  {
    name: "group with a gap override",
    value: { vocabulary: V, mode: "auto-pack", grouping: [{ id: "g", direction: "rows", items: [A], gapAfter: 40 }] },
    codes: ["layout-hint-forbidden@layout.grouping.0.gapAfter"],
    schema: false,
  },
  {
    name: "group without items",
    value: { vocabulary: V, mode: "auto-pack", grouping: [{ id: "g", direction: "rows", items: [] }] },
    codes: ["layout-hints-invalid@layout.grouping.0.items"],
    schema: false,
  },
  {
    name: "group without id or direction",
    value: { vocabulary: V, mode: "auto-pack", grouping: [{ items: [A] }] },
    codes: ["layout-hints-invalid@layout.grouping.0.direction", "layout-hints-invalid@layout.grouping.0.id"],
    schema: false,
  },
  {
    name: "layered-flow with a measured hint",
    value: { vocabulary: V, mode: "layered-flow", grouping_axis: "rows", stretch: true },
    context: GENERIC1,
    codes: ["layout-hint-out-of-scope@layout.grouping_axis", "layout-hint-out-of-scope@layout.stretch"],
    schema: false,
  },
  // --- Semantic only: the schema has no word for these. -------------------
  { name: "layered-flow without a stated view", value: { vocabulary: V, mode: "layered-flow" }, codes: ["layout-mode-out-of-scope@layout.mode"], schema: true },
  {
    name: "layered-flow on a generic@2 view",
    value: { vocabulary: V, mode: "layered-flow" },
    context: { profiles: ["generic@2"], diagramPresentation: false },
    codes: ["layout-mode-out-of-scope@layout.mode"],
    schema: true,
  },
  {
    name: "layered-flow on a view with a typed presentation",
    value: { vocabulary: V, mode: "layered-flow" },
    context: { profiles: ["generic@1"], diagramPresentation: true },
    codes: ["layout-mode-out-of-scope@layout.mode"],
    schema: true,
  },
  {
    name: "layered-flow under diagram-notation@1",
    value: { vocabulary: V, mode: "layered-flow" },
    context: { ...GENERIC1, presentationVocabulary: "diagram-notation@1" },
    codes: ["layout-mode-out-of-scope@layout.mode"],
    schema: true,
  },
  {
    name: "two groups with one id",
    value: {
      vocabulary: V,
      mode: "auto-pack",
      grouping: [
        { id: "g", direction: "rows", items: [A] },
        { id: "g", direction: "rows", items: [B] },
      ],
    },
    codes: ["layout-hint-conflict@layout.grouping.1.id"],
    schema: true,
  },
  {
    name: "one leaf in two groups",
    value: {
      vocabulary: V,
      mode: "auto-pack",
      grouping: [
        { id: "g1", direction: "rows", items: [A] },
        { id: "g2", direction: "rows", items: [{ id: "g3", direction: "columns", items: [A] }] },
      ],
    },
    codes: ["layout-hint-conflict@layout.grouping.1.items.0.items.0"],
    schema: true,
  },
  {
    name: "one member ordered under two parents",
    value: { vocabulary: V, mode: "auto-pack", ordering: { [A]: [C], [B]: [C] } },
    codes: ["layout-hint-conflict@layout.ordering.entity:b"],
    schema: true,
  },
  {
    name: "a parent ordered under itself",
    value: { vocabulary: V, mode: "auto-pack", ordering: { [A]: [A] } },
    codes: ["layout-hint-conflict@layout.ordering.entity:a"],
    schema: true,
  },
];

describe("ds-layout-hints@1 schema and validator", () => {
  it("compiles under Ajv 2020-12 strict", () => {
    expect(typeof schemaAccepts).toBe("function");
  });

  it.each(DS_LAYOUT_MODES.map((mode) => [mode]))("accepts the implemented mode %s", (mode) => {
    const value = { vocabulary: V, mode };
    expect(schemaAccepts(value)).toBe(true);
    expect(codesOf(value, GENERIC1)).toEqual([]);
  });

  it.each(ACCEPTED.map((vector) => [vector.name, vector] as const))("accepts: %s", (_name, vector) => {
    expect(schemaAccepts(vector.value)).toBe(true);
    expect(codesOf(vector.value, vector.context)).toEqual([]);
    expect(isLayoutHints(vector.value, vector.context)).toBe(true);
  });

  it.each(REFUSED.map((vector) => [vector.name, vector] as const))("refuses: %s", (_name, vector) => {
    expect(codesOf(vector.value, vector.context)).toEqual([...vector.codes]);
    expect(schemaAccepts(vector.value)).toBe(vector.schema);
    expect(isLayoutHints(vector.value, vector.context)).toBe(false);
    for (const entry of validateLayoutHints(vector.value, vector.context)) expect(entry.severity).toBe("error");
  });

  it.each([...DS_LAYOUT_FUTURE_MODES, "layered-flow@2", "matrix-grid@2"].map((mode) => [mode]))(
    "never coerces the future or unknown mode %s to auto-pack",
    (mode) => {
      const value = { vocabulary: V, mode };
      expect(schemaAccepts(value)).toBe(false);
      const found = validateLayoutHints(value, GENERIC1);
      expect(found).toHaveLength(1);
      expect(found[0]?.path).toBe("layout.mode");
      expect(found[0]?.code).toBe(
        (DS_LAYOUT_FUTURE_MODES as readonly string[]).includes(mode) ? "layout-mode-not-implemented" : "layout-mode-unknown",
      );
    },
  );

  it("names the vocabulary a future mode waits for", () => {
    const [found] = validateLayoutHints({ vocabulary: V, mode: "matrix-grid" });
    expect(found?.details).toEqual({ mode: "matrix-grid", vocabulary: "ds-layout-hints@2" });
  });

  it.each(DS_LAYOUT_FORBIDDEN_HINTS.map((hint) => [hint]))("forbids %s at the root", (hint) => {
    const value = { vocabulary: V, mode: "auto-pack", [hint]: 1 };
    expect(schemaAccepts(value)).toBe(false);
    expect(codesOf(value)).toEqual([`layout-hint-forbidden@layout.${hint}`]);
  });

  it("never accepts what the schema refuses", () => {
    for (const vector of [...ACCEPTED, ...REFUSED]) {
      if (!schemaAccepts(vector.value)) expect(validateLayoutHints(vector.value, vector.context).length).toBeGreaterThan(0);
    }
  });

  it("sorts diagnostics by path then code, and is pure", () => {
    const value = { vocabulary: V, mode: "tree", zoneGapY: 1, density: "compact", bogus: 1 };
    const before = JSON.stringify(value);
    const first = validateLayoutHints(value);
    expect(first.map((entry) => entry.path)).toEqual(["layout.bogus", "layout.density", "layout.mode", "layout.zoneGapY"]);
    expect(validateLayoutHints(value)).toEqual(first);
    expect(JSON.stringify(value)).toBe(before);
  });

  it("never throws on hostile input", () => {
    const cyclic: Record<string, unknown> = { id: "g", direction: "rows" };
    cyclic["items"] = [cyclic];
    for (const value of [null, undefined, 0, Symbol("x"), () => 1, new Date(), { vocabulary: V, mode: "auto-pack", grouping: [cyclic] }]) {
      expect(() => validateLayoutHints(value)).not.toThrow();
      expect(validateLayoutHints(value).length).toBeGreaterThan(0);
    }
  });
});

describe("ds-layout-hints@1 lowering to engine hints", () => {
  const a = entityRef("a");
  const b = entityRef("b");
  const c = entityRef("c");

  it("drops vocabulary and mode, keeps authored hints verbatim", () => {
    const hints: DsLayoutHints = {
      vocabulary: V,
      mode: "auto-pack",
      ordering: { [a]: [c, b] },
      rootOrder: [b, a],
      grouping: [{ id: "g", direction: "rows", items: [a, { id: "h", direction: "columns", items: [b], stretch: true }] }],
      stretch: false,
    };
    expect(validateLayoutHints(hints)).toEqual([]);
    expect(lowerLayoutHints(hints)).toEqual({
      ordering: { [a]: [c, b] },
      rootOrder: [b, a],
      grouping: [{ id: "g", direction: "rows", items: [a, { id: "h", direction: "columns", items: [b], stretch: true }] }],
      stretch: false,
    });
  });

  it("lowers grouping_axis to one root group: listed roots first, the rest in UTF-16 order", () => {
    const hints: DsLayoutHints = { vocabulary: V, mode: "auto-pack", grouping_axis: "columns", rootOrder: [c] };
    expect(lowerLayoutHints(hints, [b, c, a])).toEqual({
      rootOrder: [c],
      grouping: [{ id: DS_LAYOUT_ROOT_GROUP_ID, direction: "columns", items: [c, a, b] }],
    });
  });

  it("lowers grouping_axis to nothing without roots, and layered-flow to no hint", () => {
    expect(lowerLayoutHints({ vocabulary: V, mode: "auto-pack", grouping_axis: "rows" })).toEqual({});
    expect(lowerLayoutHints({ vocabulary: V, mode: "layered-flow" }, [a])).toEqual({});
  });

  it("emits no key holding undefined", () => {
    const lowered = lowerLayoutHints({ vocabulary: V, mode: "auto-pack" });
    expect(Object.keys(lowered)).toEqual([]);
  });
});
