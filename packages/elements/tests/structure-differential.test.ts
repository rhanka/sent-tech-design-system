/**
 * The differential witness of review 1 (json-render L2, Argon): the browser
 * structure seam — the eval-free interpreter — is the validator that decides
 * what renders (§6.2, §6.4), so it must agree with the ajv 2020-12 bridge on
 * every input the catalogue can see. This suite runs BOTH seams on the same
 * inputs and asserts identical accept/refuse verdicts and identical failing
 * (pointer, keyword, param) issue sets — the documented mapping the §4.5
 * diagnostics build on (object-level pointers for required / additional /
 * unevaluated, value-level for type / enum / const / pattern, no anyOf
 * umbrella, oneOf umbrella — pinned by tests/structure-interpreter.test.ts).
 *
 * Corpus (review 1, task 2):
 *   1. every component example (the three contract modules), envelope layer
 *      and component layer;
 *   2. every mutation of the existing catalogue tests (catalog.test.ts
 *      AC-L1: the BarChart value flip, the BpmnCanvas $type drop, the
 *      DecisionDossier title drop) and the envelope-structure cases of
 *      envelope-validator.test.ts (missing root, root.id, catalogId,
 *      FunctionCall / DataBinding / unknown key in accessibility, …);
 *   3. the B1–B6 reproductions, each on a dedicated custom document set
 *      (the committed documents never pair `not` with a non-empty subschema,
 *      `additionalProperties` with a foreign `unevaluatedProperties`, a
 *      non-BMP-sensitive `pattern`, or a cross-document `$ref` with sibling
 *      keywords — the divergences are only observable on documents that do);
 *   4. a seeded generated corpus over the three examples: type swaps,
 *      removed required props, extra props at each level, `undefined`
 *      values, A2UI function/binding objects, pattern edge cases with
 *      non-BMP characters. The generator is a fixed-seed PRNG (mulberry32),
 *      so the corpus is byte-identical on every run and every machine.
 *
 * THE JSON-FORM CONTRACT (B1, the review-1 decision): the envelope is a JSON
 * value (§4.3) and the envelope validator normalizes its input through one
 * JSON round-trip before measuring and validating it
 * (`normalizeEnvelopeInput` in src/validate/envelope.ts) — so BOTH seams
 * judge exactly the form the 1 MiB budget measures and the host transmits.
 * ajv's raw-JS-object behavior for `undefined` property values is internally
 * inconsistent (measured: `properties` skips a key whose value is
 * `undefined`, while `additionalProperties` / `unevaluatedProperties`
 * iterate `Object.keys` and fire on the same key), so the parity target is
 * NOT ajv-on-raw-JS but ajv-on-JSON — which the round-trip defines once for
 * both seams. This suite applies the same normalization before comparing
 * the seams, and separately asserts the two WIRED envelope validators
 * (ajv-backed, interpreter-backed) agree on the RAW JS inputs — the
 * property channel of §6.2.
 */

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import catalogJson from "../catalog.json";
import envelopeJson from "../envelope.json";
import { contracts } from "../src/contracts/index.js";
import { a2uiCommonTypes } from "../src/generated/a2ui-common-types.js";
import { createAjvStructure } from "../src/structure/ajv.js";
import { createInterpreterStructure } from "../src/structure/interpreter.js";
import { createEnvelopeValidatorCore, normalizeEnvelopeInput } from "../src/validate/envelope.js";
import type { Diagnostic } from "../src/validate/diagnostics.js";
import type { StructureIssue, StructureValidator } from "../src/validate/structure.js";

// ---------------------------------------------------------------------------
// The two seams over the committed documents, and the two WIRED envelope
// validators (the ajv-backed one is the L1 Node surface; the interpreter one
// is what the browser elements run).
// ---------------------------------------------------------------------------

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
const ajvEnvelopeValidator = createEnvelopeValidatorCore({
  catalog: catalogJson as never,
  envelopeSchema: envelopeJson as never,
  commonTypes: a2uiCommonTypes as never,
  structure: ajvStructure,
});
const interpreterEnvelopeValidator = createEnvelopeValidatorCore({
  catalog: catalogJson as never,
  envelopeSchema: envelopeJson as never,
  commonTypes: a2uiCommonTypes as never,
  structure: interpreterStructure,
});

// ---------------------------------------------------------------------------
// Comparators.
// ---------------------------------------------------------------------------

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

/** Both seams must produce the SAME issue signatures for the same input. */
function expectSeamsAgree(
  name: string,
  run: (structure: StructureValidator) => readonly StructureIssue[],
): void {
  const fromAjv = signaturesOf(run(ajvStructure));
  const fromInterpreter = signaturesOf(run(interpreterStructure));
  expect(
    fromInterpreter,
    `the interpreter diverges from ajv on "${name}"\najv:        ${JSON.stringify(fromAjv)}\ninterpreter: ${JSON.stringify(fromInterpreter)}`,
  ).toEqual(fromAjv);
}

/** Both WIRED envelope validators must agree on the RAW input (any JS value). */
function expectEnvelopeValidatorsAgree(name: string, raw: unknown): void {
  const fromAjv = ajvEnvelopeValidator.validate(raw).map(diagnosticSignature);
  const fromInterpreter = interpreterEnvelopeValidator.validate(raw).map(diagnosticSignature);
  expect(
    fromInterpreter,
    `the interpreter-backed envelope validator diverges from the ajv-backed one on "${name}"\najv:        ${JSON.stringify(fromAjv)}\ninterpreter: ${JSON.stringify(fromInterpreter)}`,
  ).toEqual(fromAjv);
}

function diagnosticSignature(diagnostic: Diagnostic): string {
  return JSON.stringify({
    code: diagnostic.code,
    path: diagnostic.path,
    message: diagnostic.message,
    severity: diagnostic.severity,
    source: diagnostic.source,
    keyword: (diagnostic.detail as { keyword?: string } | undefined)?.keyword,
  });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clone(value: unknown): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

function kebab(component: string): string {
  return component.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

/** The component a corpus name targets, by CamelCase or kebab-case match. */
function componentOf(name: string): string | undefined {
  for (const contract of contracts) {
    if (name.includes(contract.component) || name.includes(kebab(contract.component))) {
      return contract.component;
    }
  }
  return undefined;
}

/**
 * Runs one corpus input through BOTH comparison layers: the two structure
 * seams on the normalized value (the JSON-form contract), and the two wired
 * envelope validators on the RAW value. Returns how many inputs compared.
 */
function compareInput(name: string, raw: unknown): number {
  const normalized = normalizeEnvelopeInput(raw);
  expect(normalized.ok, `${name}: the corpus input must normalize`).toBe(true);
  if (!normalized.ok) return 0;
  expectSeamsAgree(`${name} (envelope layer)`, (structure) =>
    structure.validateEnvelope(normalized.value),
  );
  const root = (normalized.value as { root?: unknown }).root;
  const rootRecord = isPlainObject(root) ? root : undefined;
  const component =
    typeof rootRecord?.component === "string" ? rootRecord.component : componentOf(name);
  if (component !== undefined) {
    expectSeamsAgree(`${name} (component layer)`, (structure) =>
      structure.validateComponent(component, root),
    );
  }
  expectEnvelopeValidatorsAgree(name, raw);
  return 1;
}

// ---------------------------------------------------------------------------
// The corpus.
// ---------------------------------------------------------------------------

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
const fixtures: readonly Fixture[] = FIXTURE_NAMES.map((name) => ({
  name,
  envelope: JSON.parse(readFileSync(new URL(name, FIXTURE_DIR), "utf8")) as Record<string, unknown>,
}));

/** mulberry32: a tiny deterministic PRNG, so the corpus is reproducible. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A wrong-typed replacement, chosen deterministically from a pool. */
const SWAP_POOL: readonly unknown[] = [
  4242,
  "not-a-number",
  true,
  null,
  [],
  {},
  0.5,
  -1,
  "",
  "1.0",
  "12.34",
  "😀",
  "𝟏.𝟎",
  "١.٢",
  "1.0😀",
  "x\uD83Dy",
  "\u0000",
  "𝔘𝔫𝔦",
];
/** Pattern edge cases: astral, non-ASCII digits, lone surrogate, NUL. */
const PATTERN_EDGES: readonly unknown[] = ["😀", "𝟏.𝟎", "١.٢", "1.0😀", "x\uD83Dy", "\u0000"];
/** A2UI function-call shapes (§4.1: the envelope never carries a function). */
const FUNCTION_OBJECTS: readonly unknown[] = [
  { call: "core.log", args: {} },
  { call: "core.format", args: { locale: "fr" }, returnType: "string" },
  { function: "core.log", args: [] },
];
/** A2UI data-binding shapes (§4.1: the envelope never carries a binding). */
const BINDING_OBJECTS: readonly unknown[] = [{ path: "/data/0/value" }, { path: "" }];

/** One candidate mutation site: a path into the example, with its parent. */
interface Site {
  readonly label: string;
  readonly parent: Record<string, unknown> | unknown[];
  readonly key: string | number;
  readonly value: unknown;
}

/** Collects mutation sites up to `depth` levels into objects and arrays. */
function sitesOf(value: unknown, depth: number, label: string, out: Site[]): void {
  if (depth === 0 || value === null) return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const siteLabel = `${label}/${index}`;
      out.push({ label: siteLabel, parent: value, key: index, value: item });
      sitesOf(item, depth - 1, siteLabel, out);
    });
    return;
  }
  if (!isPlainObject(value)) return;
  for (const key of Object.keys(value)) {
    const siteLabel = label === "" ? key : `${label}/${key}`;
    out.push({ label: siteLabel, parent: value, key, value: value[key] });
    sitesOf(value[key], depth - 1, siteLabel, out);
  }
}

/** Applies one mutation deep inside a cloned envelope; returns the mutant. */
function mutantOf(
  envelope: Record<string, unknown>,
  label: string,
  apply: (site: Site) => void,
): unknown {
  const copy = clone(envelope);
  const segments = label.split("/");
  let container: Record<string, unknown> | unknown[] = copy;
  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index] as string;
    const next: unknown = Array.isArray(container) ? container[Number(segment)] : container[segment];
    if (!isPlainObject(next) && !Array.isArray(next)) {
      throw new Error(`the mutation site "${label}" walks through a non-container`);
    }
    container = next as Record<string, unknown> | unknown[];
  }
  const last = segments[segments.length - 1] as string;
  const key: string | number = /^\d+$/.test(last) ? Number(last) : last;
  const value: unknown = Array.isArray(container) ? container[key as number] : container[key as string];
  apply({ label, parent: container, key, value });
  return copy;
}

/** The mutation classes of the review-1 corpus (task 2). */
const CLASSES = ["swap", "remove", "extra", "undefined", "function", "binding", "pattern"] as const;
type MutationClass = (typeof CLASSES)[number];

const SEED = 0x5eed_5eed;
const PER_EXAMPLE = 350;

function pick(rand: () => number, pool: readonly unknown[]): unknown {
  return pool[Math.floor(rand() * pool.length)] ?? pool[0];
}

/** Wraps one component's root as its envelope (the contracts' §4.2 shape). */
function wrapAsEnvelope(component: string, root: unknown): Record<string, unknown> {
  const entry = contracts.find((contract) => contract.component === component);
  const contractVersion =
    entry && typeof entry.metadata?.contract === "string" ? entry.metadata.contract : "1.0";
  return { contract: contractVersion, mode: "select", root: { ...((root ?? {}) as Record<string, unknown>) } };
}

/**
 * The seeded corpus: for each of the three component examples, walk mutation
 * sites (depth 3) and, in a deterministic seeded order, apply the mutation
 * classes — type swap, key removal, extra prop at the parent level,
 * `undefined` value, A2UI function object, A2UI binding object, and pattern
 * edge (string leaves only) — then keep a seeded sample of PER_EXAMPLE
 * mutants per component so the suite stays fast.
 */
function seededCorpus(): Array<[string, unknown]> {
  const rand = mulberry32(SEED);
  const corpus: Array<[string, unknown]> = [];
  for (const contract of contracts) {
    const example = clone(contract.example);
    const sites: Site[] = [];
    sitesOf(example, 3, "", sites);
    const owned: Array<[string, unknown]> = [];
    for (const site of sites) {
      // Every applicable class at every site (no sampling): the corpus is
      // the full cross product, then a seeded shuffle + cap keeps the
      // suite fast while staying byte-identical on every run and machine.
      const chosen: MutationClass[] = [];
      for (const candidate of CLASSES) {
        if (candidate === "pattern" && typeof site.value !== "string") continue;
        chosen.push(candidate);
      }
      for (const candidate of chosen) {
        const name = `${contract.component} ${site.label}:${candidate}`;
        const mutant = mutantOf(example, site.label, (target) => {
          const parent = target.parent;
          if (Array.isArray(parent)) {
            const index = target.key as number;
            if (candidate === "swap") parent[index] = pick(rand, SWAP_POOL);
            else if (candidate === "remove") parent.splice(index, 1);
            else if (candidate === "extra") parent.push({ stExtra: true });
            else if (candidate === "undefined") parent[index] = undefined;
            else if (candidate === "function") parent[index] = pick(rand, FUNCTION_OBJECTS);
            else if (candidate === "binding") parent[index] = pick(rand, BINDING_OBJECTS);
            else if (candidate === "pattern") parent[index] = pick(rand, PATTERN_EDGES);
          } else {
            const key = target.key as string;
            if (candidate === "swap") parent[key] = pick(rand, SWAP_POOL);
            else if (candidate === "remove") delete parent[key];
            else if (candidate === "extra") parent[`${key}StExtra`] = pick(rand, SWAP_POOL);
            else if (candidate === "undefined") parent[key] = undefined;
            else if (candidate === "function") parent[key] = pick(rand, FUNCTION_OBJECTS);
            else if (candidate === "binding") parent[key] = pick(rand, BINDING_OBJECTS);
            else if (candidate === "pattern") parent[key] = pick(rand, PATTERN_EDGES);
          }
        });
        owned.push([name, wrapAsEnvelope(contract.component, mutant)]);
      }
    }
    for (let index = owned.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(rand() * (index + 1));
      const left = owned[index] as [string, unknown];
      owned[index] = owned[swapIndex] as [string, unknown];
      owned[swapIndex] = left;
    }
    corpus.push(...owned.slice(0, PER_EXAMPLE));
  }
  return corpus;
}

// ---------------------------------------------------------------------------
// 1. Every component example, every committed fixture, every existing
//    catalogue-test mutation, and the envelope-structure cases of
//    envelope-validator.test.ts — through both comparison layers.
// ---------------------------------------------------------------------------

const catalogueMutations: Array<[string, unknown]> = [
  [
    "catalog.test.ts BarChart data[1].value='eighteen'",
    (() => {
      const example = clone(contracts[0]!.example) as { data: Array<{ label: string; value: number | string }> };
      example.data[1]!.value = "eighteen";
      return wrapAsEnvelope("BarChart", example);
    })(),
  ],
  [
    "catalog.test.ts BpmnCanvas document.$type dropped",
    (() => {
      const example = clone(contracts[1]!.example) as { document: Record<string, unknown> };
      delete example.document.$type;
      return wrapAsEnvelope("BpmnCanvas", example);
    })(),
  ],
  [
    "catalog.test.ts DecisionDossier document.title dropped",
    (() => {
      const example = clone(contracts[2]!.example) as { document: Record<string, unknown> };
      delete example.document.title;
      return wrapAsEnvelope("DecisionDossier", example);
    })(),
  ],
];

const envelopeStructureCases: Array<[string, unknown]> = [
  ["envelope-validator: a missing root", { contract: "1.0" }],
  [
    "envelope-validator: root.id not 'root'",
    { contract: "1.0", root: { id: "not-root", component: "BarChart", label: "x", data: [] } },
  ],
  [
    "envelope-validator: an unknown root.component",
    { contract: "1.0", root: { id: "root", component: "NotAComponent", label: "x", data: [] } },
  ],
  [
    "envelope-validator: a FunctionCall in accessibility.label",
    (() => {
      const base = clone(contracts[0]!.example);
      base.accessibility = { label: { call: "core.log", args: {} } };
      return wrapAsEnvelope("BarChart", base);
    })(),
  ],
  [
    "envelope-validator: a DataBinding in accessibility.label",
    (() => {
      const base = clone(contracts[0]!.example);
      base.accessibility = { label: { path: "/data/0/value" } };
      return wrapAsEnvelope("BarChart", base);
    })(),
  ],
  [
    "envelope-validator: an unknown key under accessibility",
    (() => {
      const base = clone(contracts[0]!.example);
      base.accessibility = { label: "ok", stUnknown: 1 };
      return wrapAsEnvelope("BarChart", base);
    })(),
  ],
  [
    "envelope-validator: a plain literal accessibility validates",
    (() => {
      const base = clone(contracts[0]!.example);
      base.accessibility = { label: "ok" };
      return wrapAsEnvelope("BarChart", base);
    })(),
  ],
  [
    "envelope-validator: a mismatched catalogId",
    { ...clone(fixtures[0]!.envelope), catalogId: "https://elsewhere.invalid/catalog.json" },
  ],
  ["envelope-validator: mode preview is reserved", { ...clone(fixtures[0]!.envelope), mode: "preview" }],
  ["envelope-validator: an unknown envelope key", { ...clone(fixtures[0]!.envelope), stUnknownKey: 1 }],
  ["envelope-validator: contract not a version string", { ...clone(fixtures[0]!.envelope), contract: "abc" }],
];

describe("differential witness: interpreter vs ajv 2020-12 (review 1)", () => {
  const corpus = seededCorpus();

  it("agrees on every component example and every committed fixture", () => {
    let compared = 0;
    for (const contract of contracts) {
      compared += compareInput(
        `example ${contract.component}`,
        wrapAsEnvelope(contract.component, clone(contract.example)),
      );
    }
    for (const fixture of fixtures) compared += compareInput(`fixture ${fixture.name}`, fixture.envelope);
    expect(compared).toBe(contracts.length + fixtures.length);
  });

  it("agrees on every mutation of the existing catalogue tests", () => {
    let compared = 0;
    for (const [name, value] of catalogueMutations) compared += compareInput(name, value);
    expect(compared).toBe(3);
  });

  it("agrees on the envelope-structure cases of the existing envelope tests", () => {
    let compared = 0;
    for (const [name, value] of envelopeStructureCases) compared += compareInput(name, value);
    expect(compared).toBe(envelopeStructureCases.length);
  });

  it(`agrees on the ${corpus.length}-input seeded corpus over the three examples`, () => {
    let compared = 0;
    for (const [name, value] of corpus) compared += compareInput(name, value);
    expect(compared).toBe(corpus.length);
    // The corpus size the review-1 report quotes: this log is its source.
    console.log(
      `differential corpus: ${corpus.length} seeded mutants + ${contracts.length} examples + ${fixtures.length} fixtures + ${catalogueMutations.length} catalogue mutations + ${envelopeStructureCases.length} envelope cases — 0 divergences`,
    );
  });
});

// ---------------------------------------------------------------------------
// 2. The B1–B6 reproductions (custom document sets — the committed documents
//    cannot reach these keyword pairings, which is exactly why the review
//    found the divergences only by reading the interpreter).
// ---------------------------------------------------------------------------

const STUB_CATALOG = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://example.test/catalog.json",
  catalogId: "https://example.test/catalog.json",
  components: {},
} as const;

interface SeamPair {
  readonly ajv: StructureValidator;
  readonly interpreter: StructureValidator;
}

function customStructures(
  envelopeSchema: Record<string, unknown>,
  commonTypes: Record<string, unknown> = a2uiCommonTypes as never,
): SeamPair {
  return {
    ajv: createAjvStructure({
      catalog: STUB_CATALOG as never,
      envelopeSchema: envelopeSchema as never,
      commonTypes: commonTypes as never,
    }),
    interpreter: createInterpreterStructure({
      catalog: STUB_CATALOG as never,
      envelopeSchema: envelopeSchema as never,
      commonTypes: commonTypes as never,
    }),
  };
}

/** Compares the two CUSTOM structures' validateEnvelope on one value. */
function expectCustomSeamsAgree(structures: SeamPair, name: string, value: unknown): void {
  const fromAjv = signaturesOf(structures.ajv.validateEnvelope(value));
  const fromInterpreter = signaturesOf(structures.interpreter.validateEnvelope(value));
  expect(
    fromInterpreter,
    `the interpreter diverges from ajv on "${name}"\najv:        ${JSON.stringify(fromAjv)}\ninterpreter: ${JSON.stringify(fromInterpreter)}`,
  ).toEqual(fromAjv);
}

describe("differential witness: the B1–B6 reproductions", () => {
  it("B1: an undefined-valued OPTIONAL prop is accepted by both wired validators (the JSON round-trip drops it)", () => {
    const base = clone(fixtures[0]!.envelope);
    const raw = { ...base, root: { ...(base.root as Record<string, unknown>), width: undefined } };
    expectEnvelopeValidatorsAgree("BarChart root with width: undefined", raw);
    expect(ajvEnvelopeValidator.validate(raw)).toEqual([]);
    expect(interpreterEnvelopeValidator.validate(raw)).toEqual([]);
  });

  it("B1: an undefined-valued REQUIRED prop is refused with `required` by both wired validators", () => {
    const base = clone(fixtures[0]!.envelope);
    const raw = { ...base, root: { ...(base.root as Record<string, unknown>), label: undefined } };
    expectEnvelopeValidatorsAgree("BarChart root with label: undefined", raw);
    const diagnostics = interpreterEnvelopeValidator.validate(raw);
    expect(diagnostics.some((d) => d.code === "schema-violation" && d.path === "/root/label")).toBe(true);
    expect(ajvEnvelopeValidator.validate(raw).map(diagnosticSignature)).toEqual(
      diagnostics.map(diagnosticSignature),
    );
  });

  it("B1: the seams agree on the normalized (JSON) form of both cases", () => {
    const base = clone(fixtures[0]!.envelope);
    const optional = normalizeEnvelopeInput({
      ...base,
      root: { ...(base.root as Record<string, unknown>), width: undefined },
    });
    expect(optional.ok).toBe(true);
    if (optional.ok) {
      expectSeamsAgree("normalized width: undefined (envelope)", (structure) =>
        structure.validateEnvelope(optional.value),
      );
      expectSeamsAgree("normalized width: undefined (component)", (structure) =>
        structure.validateComponent("BarChart", (optional.value as { root: unknown }).root),
      );
      expect(
        signaturesOf(interpreterStructure.validateComponent("BarChart", (optional.value as { root: unknown }).root)),
      ).toEqual([]);
    }
    const required_ = normalizeEnvelopeInput({
      ...base,
      root: { ...(base.root as Record<string, unknown>), label: undefined },
    });
    expect(required_.ok).toBe(true);
    if (required_.ok) {
      expectSeamsAgree("normalized label: undefined (component)", (structure) =>
        structure.validateComponent("BarChart", (required_.value as { root: unknown }).root),
      );
    }
  });

  it("B2: `not` with a non-trivial subschema never leaks inner issues", () => {
    const structures = customStructures({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://example.test/envelope.json",
      type: "object",
      properties: { value: { not: { type: "null" } } },
      required: ["value"],
    });
    expectCustomSeamsAgree(structures, "not{type:null} against a string", { value: "str" });
    expectCustomSeamsAgree(structures, "not{type:null} against null (must refuse)", { value: null });
    expectCustomSeamsAgree(structures, "not{type:null} against an object", { value: { a: 1 } });
  });

  it("B3: construction refuses an unknown keyword instead of silently ignoring it", () => {
    const withUnknown = (keyword: string): Record<string, unknown> => ({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://example.test/envelope.json",
      type: "object",
      properties: { value: { type: "string", [keyword]: true } },
    });
    for (const keyword of ["discriminator", "format", "contentEncoding", "zzzTypoKeyword"]) {
      expect(
        () => customStructures(withUnknown(keyword)),
        `the audit must refuse the unknown keyword "${keyword}" loudly`,
      ).toThrow();
    }
  });

  it("B4: additionalProperties (true, false or schema) marks properties evaluated for unevaluatedProperties", () => {
    const asTrue = customStructures({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://example.test/envelope.json",
      type: "object",
      properties: { a: { type: "number" } },
      additionalProperties: true,
      unevaluatedProperties: false,
    });
    expectCustomSeamsAgree(asTrue, "additionalProperties:true + extra prop", { a: 1, extra: 2 });
    const asFalse = customStructures({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://example.test/envelope.json",
      type: "object",
      properties: { a: { type: "number" } },
      additionalProperties: false,
      unevaluatedProperties: false,
    });
    expectCustomSeamsAgree(asFalse, "additionalProperties:false + extra prop (one issue, not two)", {
      a: 1,
      extra: 2,
    });
    const allOf = customStructures({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://example.test/envelope.json",
      type: "object",
      properties: { b: { type: "number" } },
      allOf: [{ properties: { a: { type: "number" } }, additionalProperties: true }],
      unevaluatedProperties: false,
    });
    expectCustomSeamsAgree(allOf, "allOf branch additionalProperties:true + outer unevaluated:false", {
      a: 1,
      b: 2,
      extra: 3,
    });
    const failingSchema = customStructures({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://example.test/envelope.json",
      type: "object",
      additionalProperties: { type: "string" },
      unevaluatedProperties: false,
    });
    expectCustomSeamsAgree(failingSchema, "failing additionalProperties schema still evaluates (no unevaluated row)", {
      extra: 42,
    });
  });

  it("B5: patterns compile with the u flag, like ajv (non-BMP edge cases)", () => {
    const structures = customStructures({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://example.test/envelope.json",
      type: "object",
      properties: {
        code: { type: "string", pattern: "^.$" },
        script: { type: "string", pattern: "^\\p{Script=Latin}+$" },
      },
      required: ["code"],
    });
    expectCustomSeamsAgree(structures, "pattern ^.$ against an astral char", { code: "😀" });
    expectCustomSeamsAgree(structures, "pattern \\p{Script=Latin} against 'abc'", { code: "a", script: "abc" });
    expectCustomSeamsAgree(structures, "pattern \\p{Script=Latin} against astral (refuses)", {
      code: "a",
      script: "😀",
    });
    expectCustomSeamsAgree(structures, "pattern ^.$ against an astral multi-char string (refuses)", {
      code: "1.0😀",
    });
  });

  it("B6: a cross-document $ref never changes the sibling base URI", () => {
    const common = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://example.test/common.json",
      $defs: { A: { type: "string" }, B: { type: "number" } },
    };
    const structures = customStructures(
      {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        $id: "https://example.test/root.json",
        type: "object",
        properties: {
          x: {
            $ref: "common.json#/$defs/A",
            properties: { y: { $ref: "#/$defs/Y" } },
            required: ["y"],
            additionalProperties: false,
          },
        },
        required: ["x"],
        $defs: { Y: { type: "boolean" } },
      },
      common as never,
    );
    expectCustomSeamsAgree(structures, "sibling ref resolves against the ORIGINAL base", { x: { y: true } });
    expectCustomSeamsAgree(structures, "sibling ref invalid", { x: { y: 42 } });
    expectCustomSeamsAgree(structures, "the $ref branch alone", { x: "plain" });
  });
});
