import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import { validateDecisionDossierDocument } from "@sentropic/focus/validate";
import catalog from "../catalog.json";
import envelopeSchema from "../envelope.json";
import fixture from "./fixtures/dossier-diagram-ref.json";
import inputsFixture from "./fixtures/dossier-inputs.json";
import trackFixture from "./fixtures/dossier-track.json";
import { a2uiCommonTypes } from "../src/generated/a2ui-common-types.js";
import { createAjvStructure } from "../src/structure/ajv.js";
import { createInterpreterStructure } from "../src/structure/interpreter.js";
import { createEnvelopeValidatorCore, type CatalogDocument } from "../src/validate/envelope.js";
import { createFocusPort } from "../src/ports/focus.js";
import { decisionDossierContract } from "../src/contracts/decision-dossier.js";
import type { StructureIssue } from "../src/validate/structure.js";

const documents = { catalog, envelopeSchema, commonTypes: a2uiCommonTypes };
const ajv = createAjvStructure(documents);
// Construction itself audits every schema keyword in the new catalogue (B8).
const interpreter = createInterpreterStructure(documents);
const validator = (doc: CatalogDocument = catalog) => createEnvelopeValidatorCore({
  ...documents, catalog: doc, structure: doc === catalog ? interpreter : createInterpreterStructure({ ...documents, catalog: doc }),
  ports: { focus: createFocusPort(validateDecisionDossierDocument) },
});

const inline = { kind: "diagram", id: "diagram", targetRef: "decision-l2", alt: "Decision flow", syntax: "mermaid", source: "graph TD; start --> finish" };
const reference = { kind: "diagram", id: "diagram", targetRef: "decision-l2", alt: "Decision flow", sourceRef: "engram:diagram", renderComponent: "GanttChart" };
const prose = { kind: "prose", id: "context", targetRef: "decision-l2", markdown: "Decision context." };
const question = { kind: "question", id: "question", targetRef: "decision-l2", question: "Which path?", state: "open" };
const input = { ref: "engram:notes", kind: "document", label: "Decision notes" };
function omit(value: Record<string, unknown>, ...keys: string[]) {
  return Object.fromEntries(Object.entries(value).filter(([key]) => !keys.includes(key)));
}
const corpus: [string, Record<string, unknown>, boolean][] = [
  ["inline", inline, true], ["inline scene", { ...inline, scene: {} }, true],
  ["reference", reference, true], ["upper-case scheme", { ...reference, sourceRef: "ENGRAM:x" }, true],
  ["mixed-case scheme", { ...reference, sourceRef: "Engram:x" }, true],
  ["both", { ...inline, ...reference }, false],
  ["neither", omit(inline, "source", "syntax"), false],
  ["stray syntax", omit(inline, "source"), false],
  ["stray component", omit(reference, "sourceRef"), false],
  ["inline component", { ...inline, renderComponent: "GanttChart" }, false],
  ["reference syntax", { ...reference, syntax: "mermaid" }, false],
  ["reference scene", { ...reference, scene: {} }, false],
  ["blank alt", { ...reference, alt: " \t" }, false],
  ["missing alt", omit(reference, "alt"), false],
  ["blank source", { ...inline, source: "\n" }, false],
  ["blank reference", { ...reference, sourceRef: " " }, false],
  ["bad scheme", { ...reference, sourceRef: "1engram:x" }, false],
  ["reference whitespace", { ...reference, sourceRef: "engram:two words" }, false],
  ["blank component", { ...reference, renderComponent: " " }, false],
  ["bad component", { ...reference, renderComponent: "Gantt/Chart" }, false],
  ["prose inputs", { ...prose, inputs: [input] }, true],
  ["question inputs", { ...question, inputs: [input] }, true],
  ["input no label", { ...question, inputs: [omit(input, "label")] }, true],
  ["input missing ref", { ...prose, inputs: [omit(input, "ref")] }, false],
  ["input missing kind", { ...question, inputs: [omit(input, "kind")] }, false],
  ["blank input ref", { ...prose, inputs: [{ ...input, ref: "\n" }] }, false],
  ["blank input kind", { ...question, inputs: [{ ...input, kind: "\t" }] }, false],
  ["blank input label", { ...prose, inputs: [{ ...input, label: " " }] }, false],
  ["prose criterion", { ...prose, completionCriterion: "The context is clear." }, true],
  ["question criterion", { ...question, completionCriterion: "The team agrees." }, true],
  ["blank prose criterion", { ...prose, completionCriterion: " " }, false],
  ["blank question criterion", { ...question, completionCriterion: "\n" }, false],
];
const signatures = (issues: readonly StructureIssue[]) => issues.map(({ pointer, keyword, missingProperty, additionalProperty }) =>
  JSON.stringify({ pointer, keyword, missingProperty, additionalProperty })).sort();

describe("diagram contract 1.1 and interpreter subset (B1, B7, B8, B16, B17)", () => {
  it.each(corpus)("should give matching AJV/interpreter verdicts and pointers for %s", (_name, section, valid) => {
    const root = structuredClone(fixture.root) as Record<string, unknown>;
    (root.document as Record<string, unknown>).sections = [section];
    const expected = ajv.validateComponent("DecisionDossier", root);
    const actual = interpreter.validateComponent("DecisionDossier", root);
    expect(signatures(actual)).toEqual(signatures(expected));
    expect(actual.length === 0).toBe(valid);
  });

  it("should accept reference/inputs/criterion with both embed and real focus, retaining legacy Track", () => {
    for (const envelope of [fixture, inputsFixture, trackFixture]) {
      expect(validateDecisionDossierDocument(envelope.root.document).ok).toBe(true);
      expect(validator().validate(envelope)).toEqual([]);
    }
  });

  it("should pin the installed focus 1.1.0 bytes and keep exactly three catalogue entries", () => {
    const require = createRequire(import.meta.url);
    const bytes = readFileSync(require.resolve("@sentropic/focus/schemas/decision-dossier-document.v1"));
    expect(JSON.parse(bytes.toString()).$id).toBe("urn:sentropic:focus:DecisionDossierDocument:1.1.0");
    expect(decisionDossierContract.semantic?.sha256).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(decisionDossierContract.semantic?.runtimePackage).toBe("@sentropic/focus@0.6.0");
    expect(Object.keys(catalog.components).sort()).toEqual(["BarChart", "BpmnCanvas", "DecisionDossier"]);
  });

  it("should install the declared owner release reproducibly for elements 0.3.0", () => {
    const manifest = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
    const lock = JSON.parse(readFileSync(new URL("../../../package-lock.json", import.meta.url), "utf8"));
    const require = createRequire(import.meta.url);
    const installed = JSON.parse(readFileSync(require.resolve("@sentropic/focus/package.json"), "utf8"));
    const locked = lock.packages["packages/elements"];
    expect(locked.dependencies["@sentropic/focus"]).toBe(manifest.dependencies["@sentropic/focus"]);
    expect(lock.packages["node_modules/@sentropic/focus"].version).toBe(manifest.dependencies["@sentropic/focus"]);
    expect(installed.version).toBe(manifest.dependencies["@sentropic/focus"]);
    expect(manifest.dependencies["@sentropic/focus"]).toBe("0.6.0");
    expect(manifest.version).toBe("0.3.0");
    expect(locked.version).toBe(manifest.version);
  });

  it("should refuse malformed diagrams as envelope schema violations before focus semantics", () => {
    const envelope = structuredClone(fixture);
    Object.assign(envelope.root.document.sections.at(-1)!, { syntax: "mermaid" });
    const diagnostics = validator().validate(envelope);
    expect(diagnostics.length).toBeGreaterThan(0);
    expect(diagnostics.every((found) => found.code === "schema-violation" && found.source === "catalog" && found.path.startsWith("/root/document/"))).toBe(true);
    expect(diagnostics.some((found) => found.code.startsWith("diagram-"))).toBe(false);
  });

  it("should accept the J1-shaped G3 at 1.1 and return unsupported-contract on a pre-1.1 entry", () => {
    expect(validator().validate(fixture)).toEqual([]);
    const old = structuredClone(catalog);
    old.components.DecisionDossier["x-sentropic"].contract = "1.0";
    expect(validator(old).validate(fixture)).toEqual([expect.objectContaining({ code: "unsupported-contract", path: "/contract", severity: "error" })]);
    const legacyEnvelope = { ...fixture, contract: "1.0" };
    expect(validator().validate(legacyEnvelope)).toEqual([]);
  });
});
