import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { Ajv2020 } from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";
import {
  canonicalBytes,
  DS_LAYOUT_HINTS_V2_RULES,
  DS_LAYOUT_HINTS_V2_SCHEMA,
  DS_LAYOUT_V2_VOCABULARY,
  DS_LAYOUT_V2_VOCABULARY_PIN,
  DS_LAYOUT_VOCABULARY,
  type DsLayoutHintsV2,
  entityRef,
  lowerLayoutHints,
  lowerLayoutHintsV2,
  validateAnyLayoutHints,
  validateLayoutHints,
  validateLayoutHintsV2,
} from "../src/index.js";

const V = DS_LAYOUT_V2_VOCABULARY;
const PIN = "f67182ff68bbd5119575c7cb482f2115616b033b59af4455d03fca6f7b64b4a7";
const accepts = new Ajv2020({ strict: true }).compile(DS_LAYOUT_HINTS_V2_SCHEMA);
const a = entityRef("a");
const b = entityRef("b");
const c = entityRef("c");
const stage = {
  vocabulary: V,
  mode: "stage-columns",
  grids: {
    root: {
      stage_columns: ["s1", "s2"],
      transverse_bands: [{ id: "first", items: [a] }, { id: "last", items: [b] }],
      cells: { [a]: { column: "s1" }, [b]: { column: "s2" } },
    },
  },
} as const satisfies DsLayoutHintsV2;

const fixtureDir = new URL("fixtures/layout-hints-2/", import.meta.url);
const fixtures = readdirSync(fixtureDir).filter((name) => name.endsWith(".json")).map((name) => ({
  name, ...JSON.parse(readFileSync(new URL(name, fixtureDir), "utf8")) as { carries: string[]; hints: unknown },
}));

function replaceRoot(overrides: Record<string, unknown>) {
  return { ...stage, grids: { root: { ...stage.grids.root, ...overrides } } };
}

describe("ds-layout-hints@2 pin", () => {
  it("ships and exports the exact canonical schema and its pinned digest", () => {
    const base = new URL("../schemas/ds-layout-hints-2", import.meta.url);
    const schema = readFileSync(`${base.pathname}.json`, "utf8");
    const digest = createHash("sha256").update(schema).digest("hex");
    expect(digest).toBe(PIN);
    expect(schema).toBe(canonicalBytes(DS_LAYOUT_HINTS_V2_SCHEMA));
    expect(readFileSync(`${base.pathname}.sha256`, "utf8")).toBe(`${digest}\n`);
    expect(DS_LAYOUT_V2_VOCABULARY_PIN).toEqual({
      id: "https://sentropic.dev/schemas/diagram/layout-hints/v2", version: V, contentDigest: digest,
    });
    const metadata = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
    for (const ext of ["json", "sha256"]) {
      const path = `./schemas/ds-layout-hints-2.${ext}`;
      expect(metadata.exports[path]).toBe(path);
    }
  });

  it("freezes the refusal tables with the schema and contains only nonnumeric value types", () => {
    const visit = (value: unknown): void => {
      if (typeof value !== "object" || value === null) return;
      expect(Object.isFrozen(value)).toBe(true);
      expect((value as { type?: unknown }).type).not.toBe("number");
      expect((value as { type?: unknown }).type).not.toBe("integer");
      for (const child of Object.values(value)) visit(child);
    };
    visit(DS_LAYOUT_HINTS_V2_SCHEMA);
    visit(DS_LAYOUT_HINTS_V2_RULES);
    visit(DS_LAYOUT_V2_VOCABULARY_PIN);
    expect(DS_LAYOUT_HINTS_V2_SCHEMA.$defs.forbiddenHint.enum).toEqual(DS_LAYOUT_HINTS_V2_RULES.hints.forbidden);
    expect(DS_LAYOUT_HINTS_V2_SCHEMA.$defs.futureHint.enum).toEqual(DS_LAYOUT_HINTS_V2_RULES.hints.future);
    for (const [mode, rule] of Object.entries(DS_LAYOUT_HINTS_V2_RULES.modeScope)) {
      expect(DS_LAYOUT_HINTS_V2_SCHEMA.$defs.modeScope[mode]?.enum).toEqual(rule);
    }
  });
});

describe("ds-layout-hints@2 validation", () => {
  it("accepts all thirteen whole-figure payloads through both validators", () => {
    expect(fixtures).toHaveLength(13);
    for (const { name, hints, carries } of fixtures) {
      expect(carries.length, name).toBeGreaterThan(0);
      expect(accepts(hints), name).toBe(true);
      expect(validateLayoutHintsV2(hints), name).toEqual([]);
    }
  });
  it("allows an empty band only when spanned from an earlier staged band (I-13)", () => {
    const spanning = replaceRoot({
      cells: { [a]: { column: "s1", to_band: "last" } },
      transverse_bands: [{ id: "first", items: [a] }, { id: "last", items: [] }],
    });
    expect(validateLayoutHintsV2(spanning)).toEqual([]);
    for (const root of [
      { ...spanning.grids.root, cells: { [a]: { column: "s1" } } },
      { transverse_bands: [{ id: "empty", items: [] }] },
    ]) {
      expect(validateLayoutHintsV2({ ...stage, grids: { root } })).toContainEqual(expect.objectContaining({ code: "layout-hint-conflict" }));
    }
  });
  it.each([
    ["I-1", replaceRoot({ stage_columns: ["s1", "first"] })],
    ["I-1 inherit", {
      ...stage,
      grids: {
        ...stage.grids,
        [a]: { stage_columns: "inherit", transverse_bands: [{ id: "s1", items: [c] }], cells: { [c]: { column: "s1" } } },
      },
    }],
    ["I-2", replaceRoot({ peripheral_columns: [{ id: "side", side: "end", items: [a] }] })],
    ["I-3", replaceRoot({ cells: { ...stage.grids.root.cells, [c]: { column: "s1" } } })],
    ["I-4", replaceRoot({ cells: { [a]: { column: "s1" } } })],
    ["I-5", { ...stage, grids: { root: { transverse_bands: [{ id: "band", items: [a] }], cells: { [a]: { justify: "start" } } } } }],
    ["I-6", replaceRoot({ cells: { ...stage.grids.root.cells, [a]: { column: "unknown" } } })],
    ["I-7 column", replaceRoot({ cells: { ...stage.grids.root.cells, [a]: { column: "s2", to_column: "s1" } } })],
    ["I-7 band", replaceRoot({ cells: { ...stage.grids.root.cells, [b]: { column: "s2", to_band: "first" } } })],
    ["I-8", replaceRoot({ cells: { ...stage.grids.root.cells, [a]: { column: "s2", to_band: "last" } } })],
    ["I-9 root", replaceRoot({ stage_columns: "inherit" })],
    ["I-9 no parent cell", { ...stage, grids: { ...stage.grids, [c]: { stage_columns: "inherit", transverse_bands: [{ id: "band", items: [entityRef("child")] }] } } }],
    ["I-10", replaceRoot({ peripheral_columns: [{ id: "side", side: "end", items: [c], from_band: "unknown" }] })],
    ["I-11", { ...stage, grids: { ...stage.grids, [a]: { transverse_bands: [{ id: "inner", items: [c] }] } }, stacks: { [a]: { axis: "row" } } }],
  ])("reports a conflict for %s", (_, value) => {
    expect(validateLayoutHintsV2(value)).toContainEqual(expect.objectContaining({ code: "layout-hint-conflict" }));
  });
  it("requires the root grid (I-12)", () => {
    const value = { ...stage, grids: {} };
    expect(accepts(value)).toBe(false);
    expect(validateLayoutHintsV2(value)).toContainEqual(expect.objectContaining({ code: "layout-hints-invalid", path: "layout.grids.root" }));
  });
  it("distinguishes future hints and superseded modes", () => {
    for (const key of DS_LAYOUT_HINTS_V2_RULES.hints.future) {
      expect(validateLayoutHintsV2({ ...stage, [key]: true })).toEqual([
        expect.objectContaining({ code: "layout-hint-not-implemented", details: { hint: key, vocabulary: "ds-layout-hints@3" } }),
      ]);
    }
    expect(validateLayoutHintsV2(replaceRoot({ transverse_bands: "inherit" }))).toContainEqual(
      expect.objectContaining({ code: "layout-hint-not-implemented", path: "layout.grids.root.transverse_bands" }),
    );
    for (const mode of ["tree", "lane-stack", "matrix-grid"]) {
      const details = mode === "tree" ? { vocabulary: "ds-layout-hints@3" } : { supersededBy: "stage-columns" };
      expect(validateLayoutHintsV2({ vocabulary: V, mode })).toEqual([
        expect.objectContaining({ code: "layout-mode-not-implemented", details: { mode, ...details } }),
      ]);
    }
  });
  it("refuses geometry at all object levels and numeric values inside unknown keys", () => {
    for (const key of DS_LAYOUT_HINTS_V2_RULES.hints.forbidden) {
      const value = {
        ...stage,
        [key]: 1,
        grids: {
          root: {
            ...stage.grids.root,
            [key]: true,
            transverse_bands: [{ id: "band", items: [a], [key]: true }],
            peripheral_columns: [{ id: "col", side: "end", items: [b], [key]: true }],
            cells: { [a]: { column: "s1", [key]: true } },
          },
        },
        stacks: { [c]: { axis: "row", [key]: true } },
        extra: { list: [41] },
      };
      const findings = validateLayoutHintsV2(value);
      expect(accepts(value)).toBe(false);
      expect(findings.filter(({ code }) => code === "layout-hint-forbidden")).toHaveLength(6);
      expect(findings.filter(({ code }) => code === "layout-hints-invalid").map(({ path }) => path)).toEqual(
        [`layout.${key}`, "layout.extra.list.0"].sort(),
      );
    }
  });
  it("forbids each out-of-scope word for its mode", () => {
    const context = { profiles: ["generic@1"], diagramPresentation: false };
    const extras = {
      ...stage, stacks: {}, aspect: "free", fanIn: "comb", fanOut: "comb", legend: "none",
      grouping: [], grouping_axis: "rows", rootOrder: [], ordering: {}, stretch: true,
    };
    for (const mode of DS_LAYOUT_HINTS_V2_RULES.modes.implemented) {
      for (const key of DS_LAYOUT_HINTS_V2_RULES.modeScope[mode]) {
        const base = mode === "stage-columns" ? stage : { vocabulary: V, mode };
        const value = { ...base, [key]: extras[key] };
        expect(accepts(value)).toBe(false);
        expect(validateLayoutHintsV2(value, context)).toContainEqual(expect.objectContaining({
          code: "layout-hint-out-of-scope", path: `layout.${key}`,
        }));
      }
    }
  });
  it("reports in sorted order and handles non-JSON inputs without invoking getters", () => {
    const value = Object.freeze({ ...stage, extra: true, anchor: true });
    const findings = validateLayoutHintsV2(value);
    expect(findings.map(({ path }) => path)).toEqual(["layout.anchor", "layout.extra"]);
    expect(validateLayoutHintsV2(Object.fromEntries(Object.entries(value).reverse()))).toEqual(findings);
    const cycle = { ...stage, extra: {} };
    cycle.extra = cycle;
    const accessor = { ...stage, get extra(): never { throw new Error("getter invoked"); } };
    const { proxy, revoke } = Proxy.revocable(stage, {});
    revoke();
    for (const hostile of [cycle, accessor, proxy, { ...stage, extra: [, a] }]) {
      expect(validateLayoutHintsV2(hostile)).toContainEqual(expect.objectContaining({ code: "layout-hints-invalid" }));
    }
  });
  it("fails closed in each version and dispatches the two versions", () => {
    const twin = { vocabulary: DS_LAYOUT_VOCABULARY, mode: "auto-pack" } as const;
    expect(validateLayoutHints(stage).map(({ code }) => code)).toEqual(["layout-vocabulary-unknown"]);
    for (const vocabulary of [DS_LAYOUT_VOCABULARY, "ds-layout-hints@7"]) {
      expect(validateLayoutHintsV2({ ...stage, vocabulary }).map(({ code }) => code)).toEqual(["layout-vocabulary-unknown"]);
    }
    expect(validateAnyLayoutHints(stage)).toEqual([]);
    expect(validateAnyLayoutHints(twin)).toEqual([]);
    expect(validateAnyLayoutHints({ ...stage, vocabulary: "ds-layout-hints@7" }).map(({ code }) => code)).toEqual(["layout-vocabulary-unknown"]);
  });
});

describe("ds-layout-hints@2 lowering", () => {
  it.each([
    {},
    { rootOrder: [b, a], ordering: { [c]: [b, a] }, stretch: false },
    { grouping_axis: "rows" as const, rootOrder: [c] },
    { grouping: [{ id: "vertical", direction: "columns" as const, stretch: true, items: [a, b] }] },
  ])("matches the @1 auto-pack twin for %j", (fields) => {
    const shared = { mode: "auto-pack", ...fields } as const;
    expect(lowerLayoutHintsV2({ vocabulary: V, ...shared }, [c, b, a])).toEqual(
      lowerLayoutHints({ vocabulary: DS_LAYOUT_VOCABULARY, ...shared }, [c, b, a]),
    );
  });
  it("lowers stage-columns with defaults and layered-flow without hints", () => {
    const lowered = lowerLayoutHintsV2(stage);
    expect(lowered).toStrictEqual({
      composition: { grids: stage.grids, stacks: {}, aspect: "free", fanIn: "separate", fanOut: "separate", legend: "host" },
    });
    expect(Object.values(lowered)).not.toContain(undefined);
    expect(Object.values(lowered.composition ?? {})).not.toContain(undefined);
    expect(lowerLayoutHintsV2({ vocabulary: V, mode: "layered-flow" })).toStrictEqual({});
  });
});
