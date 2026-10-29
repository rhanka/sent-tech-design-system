/** Packaged catalog entry 2, transcribed from Engram 299b4535. No catalog mock. */
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import * as core from "../src/index.js";
import { resolveGovernedCatalog } from "../src/presentation-catalog.js";
import { ent, scopedOptions, validGeneric2Document } from "./m3-helpers.js";

const reference = JSON.parse(readFileSync(
  new URL("./fixtures/presentation-catalog-engram-299b4535.json", import.meta.url), "utf8",
)) as {
  entry1: Record<string, unknown>;
  entry2: Record<string, unknown>;
  revision: Record<string, unknown>;
};
const ENTRY_DIGEST = "c430ff66df3b04e6d792dd1a60e40e01dbeaffa47b206da0021a937ca83fa4f9";
const PREDECESSOR_DIGEST = "a83e2c1d0ea9612d38a0b3ad1a0f0ae4e93e7f7a10fcee49ab57a6a06659da0a";
const COMMIT = "e3bc10cc9e59d48bb807afc41173ba83f6698940";
const ADAPTER_SHA = "488d8499b8f4e624af56d0c4f4c07496cc09863ec1e65e9f522c6fc05a4db06e";
const ADAPTER_ID = "ds:rhanka/sent-tech-design-system/packages/diagram-core/src/presentation-validate.ts";
const ADAPTER_REF = `${ADAPTER_ID}@${COMMIT}#sha256=${ADAPTER_SHA}`;
const adapterPin: core.PresentationPin = { id: ADAPTER_ID, version: COMMIT, contentDigest: ADAPTER_SHA };

function packagedCatalog() {
  // Optional fields let these assertions run on the base commit as RED tests.
  return resolveGovernedCatalog() as core.PresentationContractCatalog & {
    readonly entry?: Record<string, unknown>;
    readonly predecessor?: Record<string, unknown>;
    readonly revision?: Record<string, unknown>;
  };
}

function applyInput(): core.ApplyPresentationInput {
  const document = validGeneric2Document();
  const semanticDocument: core.SemanticDocument = {
    ...document,
    entities: {
      ...document.entities,
      "entity:n": ent("n", "generic@2", "node", { name: core.text("N") }),
    },
  };
  const rows = [
    ["n", "n", "card"], ["c", "c", "container"], ["l", "l", "legend"],
    ["k", "k1", "legend-key"], ["k2", "k2", "legend-key"],
  ] as const;
  const sourceView: core.ViewDocument = {
    ...core.createView({ viewId: core.viewRef("pinned"), semanticDocumentId: document.documentId }),
    entityOccurrences: Object.fromEntries(rows.map(([id, entity]) => [
      `occurrence:${id}`,
      { id: core.occurrenceRef(id), entity: core.entityRef(entity), geometry: { x: 0, y: 0, width: 460, height: 200 } },
    ])),
    presentation: {
      camera: { x: 0, y: 0, zoom: 1 },
      diagram: {
        contractPin: { ...core.DIAGRAM_PRESENTATION_CONTRACT_PIN },
        entities: Object.fromEntries(rows.map(([id, , form]) => [
          `occurrence:${id}`,
          { form, text: {}, ...(id === "n" ? { categoryRef: core.entityRef("k1") } : {}) },
        ])),
        legends: { "occurrence:l": { order: [core.entityRef("k1"), core.entityRef("k2")] } },
        categoryTokens: [{ legendRef: core.entityRef("l"), category: "risk", token: "st-feedback-warning" }],
      },
    },
  };
  return {
    familyPins: [core.familyPinForProfile(core.generic2Profile)],
    semanticDocument, sourceView,
    contractPin: { ...core.DIAGRAM_PRESENTATION_CONTRACT_PIN },
    semanticCategoryPins: [], adapterPin: { ...adapterPin },
  };
}

function expectDeepFrozen(value: unknown): void {
  if (value === null || typeof value !== "object") return;
  expect(Object.isFrozen(value)).toBe(true);
  for (const child of Object.values(value)) expectDeepFrozen(child);
}

describe("qualified packaged presentation catalog", () => {
  it("should transcribe the complete entry 2 envelope from Engram", () => {
    expect(packagedCatalog().entry).toEqual(reference.entry2);
  });

  it("should compute the entry 2 P-ENTRY digest with DS canonical bytes", () => {
    const entry = packagedCatalog().entry;
    expect(entry).toBeDefined();
    if (entry === undefined) return;
    expect("entryDigest" in entry).toBe(false);
    const bytes = core.canonicalBytes(entry);
    const digest = core.sha256Hex(bytes);
    if (digest !== ENTRY_DIGEST) {
      writeFileSync(new URL("../../../catalog-entry2-preimage.json", import.meta.url), bytes);
    }
    expect(digest).toBe(ENTRY_DIGEST);
    expect(createHash("sha256").update(bytes, "utf8").digest("hex")).toBe(ENTRY_DIGEST);
  });

  it("should preserve entry 1 and the external entry 2 to entry 1 revision link", () => {
    const catalog = packagedCatalog();
    expect(catalog.predecessor).toEqual(reference.entry1);
    expect(catalog.revision).toEqual(reference.revision);
    if (catalog.predecessor === undefined || catalog.entry === undefined) return;
    expect(core.sha256Hex(core.canonicalBytes(catalog.predecessor))).toBe(PREDECESSOR_DIGEST);
    expect(catalog.entry).not.toHaveProperty("predecessor");
    expect(catalog.entry["ontology"]).not.toHaveProperty("predecessor");
    expect(catalog.entry["ontology"]).toHaveProperty("lineage", { parents: [], mappings: [], migrations: [] });
  });

  it("should bind the qualified adapter bytes and renderer reference to the unchanged schema", () => {
    const catalog = packagedCatalog();
    expect(catalog.compatibilityAdapter).toBe(ADAPTER_REF);
    expect(typeof catalog.adapterBytes).toBe("string");
    if (catalog.adapterBytes === undefined) return;
    expect(core.sha256Hex(catalog.adapterBytes)).toBe(ADAPTER_SHA);
    expect(catalog.schemaPin).toEqual(core.DIAGRAM_PRESENTATION_SCHEMA_PIN);
    expect(core.DIAGRAM_PRESENTATION_COMPATIBILITY).toEqual({
      adapter: ADAPTER_REF,
      renderer: `ds:rhanka/sent-tech-design-system/packages/diagram-core/src/presentation-apply.ts@${COMMIT}#sha256=28c3607e5c4868d44c137b66fe8e6f6ed99cb578fc52a52f67442cca41802cd8`,
    });
    expect(core.DIAGRAM_PRESENTATION_PACKAGED_CATALOG).toEqual({
      compatibilityAdapter: catalog.compatibilityAdapter, adapterBytes: catalog.adapterBytes, schemaPin: catalog.schemaPin,
    });
  });

  it("should keep the catalog records private and every nested value frozen", () => {
    const catalog = packagedCatalog();
    expect(catalog.entry).toBeDefined();
    expectDeepFrozen(catalog);
    expect(catalog).not.toBe(core.DIAGRAM_PRESENTATION_PACKAGED_CATALOG);
    expect(catalog.schemaPin).not.toBe(core.DIAGRAM_PRESENTATION_PACKAGED_CATALOG.schemaPin);
    expect(core).not.toHaveProperty("resolveGovernedCatalog");
    expect(core.DIAGRAM_PRESENTATION_PACKAGED_CATALOG).not.toHaveProperty("entry");
    expect(() => Object.assign(catalog, { compatibilityAdapter: "consumer-adapter" })).toThrow();
    const entry = catalog.entry;
    if (entry === undefined) return;
    expect(() => Object.assign(entry, { id: "consumer-entry" })).toThrow();
    const ontology = entry["ontology"] as { lineage: { parents: unknown[] } };
    expect(() => ontology.lineage.parents.push("consumer-parent")).toThrow();
    expect(packagedCatalog().entry).toEqual(reference.entry2);
  });

  it("should apply P-GEN through the packaged catalog without changing semantic bytes", () => {
    const input = applyInput();
    const before = core.canonicalBytes(input);
    const options = scopedOptions([core.generic2Profile]);
    expect(core.validateDocument(input.semanticDocument, options)).toEqual([]);
    expect(core.validateView(input.sourceView, input.semanticDocument, options)).toEqual([]);
    const output = core.applyPresentation(input, options);
    expect(output.outcome).toBe("ok");
    if (output.outcome !== "ok") return;
    expect(output.diagnostics).toEqual([]);
    expect(core.validateView(output.view, input.semanticDocument, options)).toEqual([]);
    expect(output.familyPins).toEqual(input.familyPins);
    expect(output.contractPin).toEqual(input.contractPin);
    expect(output.presentationDigest).toBe(core.sha256Hex(core.canonicalBytes(input.sourceView.presentation.diagram)));
    expect(core.canonicalBytes(input)).toBe(before);
  });

  it.each([
    ["transitional reference", "transitional:ds-schema-adapter-unqualified"],
    ["transitional pin", { ...adapterPin, id: "transitional:ds-schema-adapter-unqualified" }],
    ["wrong sha256", { ...adapterPin, contentDigest: "0".repeat(64) }],
    ["wrong commit", { ...adapterPin, version: "0".repeat(40) }],
  ])("should refuse %s at input.adapterPin", (_label, pin) => {
    const input = { ...applyInput(), adapterPin: pin as core.PresentationPin };
    const output = core.applyPresentation(input, scopedOptions([core.generic2Profile]));
    expect(output).toEqual({
      outcome: "refused",
      diagnostics: [{
        code: "occurrence-endpoint-mismatch", severity: "error", path: "input.adapterPin",
        message: "diagram presentation fails check presentation-pin-mismatch", refs: [],
        details: { check: "presentation-pin-mismatch" },
      }],
    });
    expect(output).not.toHaveProperty("view");
  });
});
