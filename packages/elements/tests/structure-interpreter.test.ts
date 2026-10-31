/**
 * The oracle of the browser structure seam (§4.3, §6.4): the eval-free
 * interpreter (`src/structure/interpreter.ts`) must behave EXACTLY like the
 * ajv 2020-12 bridge (`src/structure/ajv.ts`) on the committed documents —
 * same acceptances, same refusals, same (pointer, keyword, param) issue
 * sets. ajv is the oracle because it IS the Node-side seam the catalogue
 * was generated and pinned against (§5.2); the interpreter exists only
 * because ajv materialises validators through `new Function`, which the
 * pilot and strict CSP rows of §6.4 forbid in the browser core.
 *
 * The corpus is mechanical: every committed envelope fixture, then every
 * single-key deletion / null-out / type-flip mutation up to depth three
 * (objects and array elements), applied at BOTH layers — the envelope
 * schema through `validateEnvelope`, the component entry through
 * `validateComponent`. Hand-pinned cases fix the issue conventions the
 * §4.5 diagnostics build on (object-level pointers for required /
 * additional / unevaluated, value-level for type / enum / const / pattern,
 * no anyOf umbrella, oneOf umbrella) and the drift gate's loudness.
 */

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import catalogJson from "../catalog.json";
import envelopeJson from "../envelope.json";
import { a2uiCommonTypes } from "../src/generated/a2ui-common-types.js";
import { createAjvStructure } from "../src/structure/ajv.js";
import { createInterpreterStructure } from "../src/structure/interpreter.js";
import type { StructureIssue, StructureValidator } from "../src/validate/structure.js";

interface Fixture {
  readonly name: string;
  readonly envelope: Record<string, unknown>;
}

const FIXTURE_DIR = new URL("./fixtures/", import.meta.url);
const FIXTURE_NAMES = [
  "bar-chart-pdata-1.json",
  "bar-chart-pdata-2.json",
  "bar-chart-pdata-3.json",
  "bar-chart-pdata-4.json",
  "bar-chart-pdata-5.json",
  "bar-chart-invalid.json",
  "bpmn-order-process.json",
  "decision-dossier.json",
];

function loadFixtures(): readonly Fixture[] {
  return FIXTURE_NAMES.map((name) => ({
    name,
    envelope: JSON.parse(readFileSync(new URL(name, FIXTURE_DIR), "utf8")) as Record<string, unknown>,
  }));
}

const fixtures = loadFixtures();

const ajvStructure = createAjvStructure({
  catalog: catalogJson as never,
  envelopeSchema: envelopeJson as never,
  commonTypes: a2uiCommonTypes as never,
});

const interpreterStructure = createInterpreterStructure({
  catalog: catalogJson as never,
  envelopeSchema: envelopeJson as never,
  commonTypes: a2uiCommonTypes as never,
});

/** The comparable signature of one issue (param fields included). */
function signatureOf(issue: StructureIssue): string {
  const row = {
    pointer: issue.pointer,
    keyword: issue.keyword,
    ...(issue.missingProperty === undefined ? {} : { missingProperty: issue.missingProperty }),
    ...(issue.additionalProperty === undefined ? {} : { additionalProperty: issue.additionalProperty }),
  };
  return JSON.stringify(row);
}

function signaturesOf(issues: readonly StructureIssue[]): string[] {
  return issues.map(signatureOf).sort();
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clone(value: unknown): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

/** One wrong-typed replacement for a mutation, by the original's JSON kind. */
function wrongValueFor(value: unknown): unknown {
  if (typeof value === "string") return 4242;
  if (typeof value === "number") return "not-a-number";
  if (typeof value === "boolean") return "not-a-boolean";
  if (value === null) return "not-null";
  if (Array.isArray(value)) return { not: "an-array" };
  if (isPlainObject(value)) return ["not", "an", "object"];
  return null;
}

/**
 * Every single-key mutation of one value, deterministic and depth-capped:
 * deletion, null-out and type-flip at each object key and array index, up
 * to `depth` levels into objects and arrays.
 */
function mutationsOf(value: unknown, depth: number, labelPrefix: string): Array<[string, unknown]> {
  const out: Array<[string, unknown]> = [];
  if (depth === 0 || value === null) return out;
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const label = `${labelPrefix}/${index}`;
      if (value.length > 1) {
        out.push([`${label}:delete`, [...value.slice(0, index), ...value.slice(index + 1)]]);
      }
      out.push([`${label}:null`, [...value.slice(0, index), null, ...value.slice(index + 1)]]);
      const flipped = wrongValueFor(item);
      out.push([`${label}:flip`, [...value.slice(0, index), flipped, ...value.slice(index + 1)]]);
      for (const [subLabel, subValue] of mutationsOf(item, depth - 1, label)) {
        out.push([
          subLabel,
          [...value.slice(0, index), subValue, ...value.slice(index + 1)],
        ]);
      }
    });
    return out;
  }
  if (!isPlainObject(value)) return out;
  for (const key of Object.keys(value)) {
    const label = labelPrefix === "" ? key : `${labelPrefix}/${key}`;
    const without: Record<string, unknown> = { ...value };
    delete without[key];
    out.push([`${label}:delete`, without]);
    const nulled: Record<string, unknown> = { ...value, [key]: null };
    out.push([`${label}:null`, nulled]);
    const flipped: Record<string, unknown> = { ...value, [key]: wrongValueFor(value[key]) };
    out.push([`${label}:flip`, flipped]);
    for (const [subLabel, subValue] of mutationsOf(value[key], depth - 1, label)) {
      const nested: Record<string, unknown> = { ...value, [key]: subValue };
      out.push([subLabel, nested]);
    }
  }
  return out;
}

/** Asserts both seams produce the same issue signatures for one input. */
function expectSameIssues(name: string, run: (structure: StructureValidator) => readonly StructureIssue[]): void {
  const fromAjv = signaturesOf(run(ajvStructure));
  const fromInterpreter = signaturesOf(run(interpreterStructure));
  expect(fromInterpreter, `interpreter diverges from ajv on "${name}"`).toEqual(fromAjv);
}

describe("structure interpreter: construction over the committed documents", () => {
  it("audits and accepts every registered document (no drift)", () => {
    expect(interpreterStructure).toBeDefined();
  });

  it("refuses a standard 2020-12 keyword outside the implemented set (drift gate)", () => {
    expect(() =>
      createInterpreterStructure({
        catalog: {
          ...(catalogJson as object),
          components: {
            BarChart: {
              allOf: [{ $ref: "https://a2ui.org/specification/v0_9_1/common_types.json#/$defs/ComponentCommon" }],
              properties: {
                component: { const: "BarChart" },
                name: { type: "string", minLength: 1 },
              },
              type: "object",
            },
          },
        } as never,
        envelopeSchema: envelopeJson as never,
        commonTypes: a2uiCommonTypes as never,
      }),
    ).toThrow(/minLength/);
  });

  it("refuses the legacy tuple form of items", () => {
    expect(() =>
      createInterpreterStructure({
        catalog: {
          ...(catalogJson as object),
          components: {
            BarChart: {
              properties: { rows: { type: "array", items: [{ type: "string" }] } },
            },
          },
        } as never,
        envelopeSchema: envelopeJson as never,
        commonTypes: a2uiCommonTypes as never,
      }),
    ).toThrow(/tuple/);
  });

  it("throws on a $ref that names no registered document", () => {
    const structure = createInterpreterStructure({
      catalog: catalogJson as never,
      envelopeSchema: { $id: "https://example.com/envelope.json", type: "object", $ref: "https://example.com/missing.json" } as never,
      commonTypes: a2uiCommonTypes as never,
    });
    expect(() => structure.validateEnvelope({})).toThrow(/registered document/);
  });
});

describe("structure interpreter: envelope layer", () => {
  for (const fixture of fixtures) {
    it(`accepts/refuses the committed fixture like ajv: ${fixture.name}`, () => {
      expectSameIssues(fixture.name, (structure) => structure.validateEnvelope(fixture.envelope));
    });
  }

  const mutatedEnvelopeCorpus: Array<[string, unknown]> = [];
  for (const fixture of fixtures) {
    for (const [label, value] of mutationsOf(fixture.envelope, 2, "")) {
      mutatedEnvelopeCorpus.push([`${fixture.name} ${label}`, value]);
    }
  }

  it(`matches ajv on ${mutatedEnvelopeCorpus.length} envelope mutations`, () => {
    for (const [name, value] of mutatedEnvelopeCorpus) {
      expectSameIssues(name, (structure) => structure.validateEnvelope(value));
    }
  });

  it("pins the envelope issue conventions (§4.5 paths)", () => {
    const base = fixtures.find((fixture) => fixture.name === "bar-chart-pdata-1.json")?.envelope;
    if (base === undefined) throw new Error("bar-chart-pdata-1.json is missing from the corpus");
    const extra = { ...clone(base), extra: 1 } as Record<string, unknown>;
    expect(signaturesOf(interpreterStructure.validateEnvelope(extra))).toEqual(
      signaturesOf(ajvStructure.validateEnvelope(extra)),
    );
    expect(signaturesOf(interpreterStructure.validateEnvelope(extra))).toEqual([
      JSON.stringify({ pointer: "", keyword: "unevaluatedProperties", additionalProperty: "extra" }),
    ]);

    const noContract = { ...clone(base) } as Record<string, unknown>;
    delete noContract.contract;
    expect(signaturesOf(interpreterStructure.validateEnvelope(noContract))).toEqual([
      JSON.stringify({ pointer: "", keyword: "required", missingProperty: "contract" }),
    ]);

    const pattern = { ...clone(base), contract: "abc" } as Record<string, unknown>;
    expect(signaturesOf(interpreterStructure.validateEnvelope(pattern))).toEqual([
      JSON.stringify({ pointer: "/contract", keyword: "pattern" }),
    ]);

    const mode = { ...clone(base), mode: "weird" } as Record<string, unknown>;
    expect(signaturesOf(interpreterStructure.validateEnvelope(mode))).toEqual([
      JSON.stringify({ pointer: "/mode", keyword: "enum" }),
    ]);
  });
});

describe("structure interpreter: component layer", () => {
  for (const fixture of fixtures) {
    const component = (fixture.envelope.root as Record<string, unknown> | undefined)?.component;
    if (typeof component !== "string") continue;
    it(`validates the fixture root like ajv: ${fixture.name}`, () => {
      expectSameIssues(fixture.name, (structure) =>
        structure.validateComponent(component, fixture.envelope.root),
      );
    });

    const rootMutations = mutationsOf(fixture.envelope.root, 3, "");
    it(`matches ajv on ${rootMutations.length} root mutations: ${fixture.name}`, () => {
      for (const [label, root] of rootMutations) {
        expectSameIssues(`${fixture.name} ${label}`, (structure) => structure.validateComponent(component, root));
      }
    });
  }

  it("pins the component issue conventions (§4.5 paths)", () => {
    const base = fixtures.find((fixture) => fixture.name === "bar-chart-pdata-1.json")?.envelope;
    if (base === undefined) throw new Error("bar-chart-pdata-1.json is missing from the corpus");
    const root = base.root as Record<string, unknown>;

    const notArray = { ...clone(root), data: "not-an-array" } as Record<string, unknown>;
    expect(signaturesOf(interpreterStructure.validateComponent("BarChart", notArray))).toEqual([
      JSON.stringify({ pointer: "/data", keyword: "type" }),
    ]);

    const extraRootProp = { ...clone(root), extra: 1 } as Record<string, unknown>;
    expect(signaturesOf(interpreterStructure.validateComponent("BarChart", extraRootProp))).toEqual([
      JSON.stringify({ pointer: "", keyword: "unevaluatedProperties", additionalProperty: "extra" }),
    ]);

    const wrongMarker = { ...clone(root), annotations: [{ kind: "point", x: 1, y: 2, marker: "hexagon" }] } as Record<string, unknown>;
    const markerIssues = interpreterStructure.validateComponent("BarChart", wrongMarker);
    expect(signaturesOf(markerIssues)).toEqual(signaturesOf(ajvStructure.validateComponent("BarChart", wrongMarker)));
    expect(markerIssues.some((issue) => issue.keyword === "enum" && issue.pointer === "/annotations/0/marker")).toBe(true);
    expect(markerIssues.some((issue) => issue.keyword === "anyOf" && issue.pointer === "/annotations/0")).toBe(true);

    const dossier = fixtures.find((fixture) => fixture.name === "decision-dossier.json")?.envelope;
    if (dossier === undefined) throw new Error("decision-dossier.json is missing from the corpus");
    const dossierRoot = dossier.root as Record<string, unknown>;
    const document = clone(dossierRoot.document) as Record<string, unknown>;
    document.sections = [{ kind: "nonsense" }];
    const wrongKind = { ...clone(dossierRoot), document } as Record<string, unknown>;
    const kindIssues = interpreterStructure.validateComponent("DecisionDossier", wrongKind);
    expect(signaturesOf(kindIssues)).toEqual(signaturesOf(ajvStructure.validateComponent("DecisionDossier", wrongKind)));
    expect(kindIssues.some((issue) => issue.keyword === "oneOf" && issue.pointer === "/document/sections/0")).toBe(true);

    const bpmn = fixtures.find((fixture) => fixture.name === "bpmn-order-process.json")?.envelope;
    if (bpmn === undefined) throw new Error("bpmn-order-process.json is missing from the corpus");
    const bpmnRoot = bpmn.root as Record<string, unknown>;
    const bpmnDocument = clone(bpmnRoot.document) as Record<string, unknown>;
    bpmnDocument.extraTopLevel = "allowed-by-the-empty-schema";
    const extraDoc = { ...clone(bpmnRoot), document: bpmnDocument } as Record<string, unknown>;
    expect(interpreterStructure.validateComponent("BpmnCanvas", extraDoc)).toEqual([]);
    expect(ajvStructure.validateComponent("BpmnCanvas", extraDoc)).toEqual([]);
  });
});
