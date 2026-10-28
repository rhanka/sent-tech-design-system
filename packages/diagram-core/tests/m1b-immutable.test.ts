/**
 * M1-b immutable packaged catalog — RED tests for the residual pass-3 finding.
 *
 * The resolver reads privately owned frozen data; the public catalog export
 * is a detached frozen copy the resolver never reads. Object.assign or nested
 * mutation either throws or leaves application refusing with
 * presentation-pin-mismatch at input.adapterPin. English in code.
 */
import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DIAGRAM_PRESENTATION_BINDING,
  DIAGRAM_PRESENTATION_COMPATIBILITY,
  DIAGRAM_PRESENTATION_CONTRACT_DESCRIPTOR,
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  DIAGRAM_PRESENTATION_PACKAGED_CATALOG,
  DIAGRAM_PRESENTATION_RECORD,
  DIAGRAM_PRESENTATION_SCHEMA,
  DIAGRAM_PRESENTATION_SCHEMA_PIN,
  applyPresentation,
  familyPinForProfile,
  generic2Profile,
  isPresentationSchemaPin,
  isPresentationContractPin,
  sha256Hex,
  text,
  type SemanticDocument,
} from "../src/index.js";
import { ent, scopedOptions, validGeneric2Document } from "./m3-helpers.js";

const here = dirname(fileURLToPath(import.meta.url));

const PIN_MISMATCH_ADAPTER = {
  code: "occurrence-endpoint-mismatch",
  severity: "error",
  path: "input.adapterPin",
  message: "diagram presentation fails check presentation-pin-mismatch",
  refs: [],
  details: { check: "presentation-pin-mismatch" },
};

async function buildApplyParts() {
  const mod = await import("../src/index.js");
  const document = validGeneric2Document();
  const doc2: SemanticDocument = {
    ...document,
    entities: {
      ...document.entities,
      "entity:n": ent("n", "generic@2", "node", { name: text("N") }),
    },
  };
  const sourceView = {
    ...mod.createView({ viewId: mod.viewRef("gen"), semanticDocumentId: doc2.documentId }),
    entityOccurrences: {
      "occurrence:n": {
        id: mod.occurrenceRef("n"),
        entity: mod.entityRef("n"),
        geometry: { x: 0, y: 0, width: 460, height: 200 },
      },
      "occurrence:c": {
        id: mod.occurrenceRef("c"),
        entity: mod.entityRef("c"),
        geometry: { x: 0, y: 0, width: 460, height: 200 },
      },
      "occurrence:l": {
        id: mod.occurrenceRef("l"),
        entity: mod.entityRef("l"),
        geometry: { x: 0, y: 0, width: 460, height: 200 },
      },
      "occurrence:k": {
        id: mod.occurrenceRef("k"),
        entity: mod.entityRef("k1"),
        geometry: { x: 0, y: 0, width: 460, height: 200 },
      },
      "occurrence:k2": {
        id: mod.occurrenceRef("k2"),
        entity: mod.entityRef("k2"),
        geometry: { x: 0, y: 0, width: 460, height: 200 },
      },
    },
    relationOccurrences: {},
    presentation: {
      camera: { x: 0, y: 0, zoom: 1 },
      diagram: {
        contractPin: { ...mod.DIAGRAM_PRESENTATION_CONTRACT_PIN },
        entities: {
          "occurrence:n": { form: "card", text: {}, categoryRef: mod.entityRef("k1") },
          "occurrence:c": { form: "container", text: {} },
          "occurrence:l": { form: "legend", text: {} },
          "occurrence:k": { form: "legend-key", text: {} },
          "occurrence:k2": { form: "legend-key", text: {} },
        },
        legends: { "occurrence:l": { order: [mod.entityRef("k1"), mod.entityRef("k2")] } },
        categoryTokens: [{ legendRef: mod.entityRef("l"), category: "risk", token: "st-feedback-warning" }],
      },
    },
  };
  return { doc2, sourceView };
}

function consumerSetup() {
  const bytes = "export const consumerAdapter = \"consumer\";\n";
  const digest = sha256Hex(bytes);
  const pin = { id: "consumer-adapter", version: "1", contentDigest: digest };
  const catalog = {
    compatibilityAdapter: `${pin.id}@${pin.version}#sha256=${pin.contentDigest}`,
    adapterBytes: bytes,
    schemaPin: { ...DIAGRAM_PRESENTATION_SCHEMA_PIN },
  };
  return { bytes, pin, catalog };
}

describe("immutable packaged catalog", () => {
  it("refuses a consumer adapter with the packaged pin-mismatch before any mutation", async () => {
    const { doc2, sourceView } = await buildApplyParts();
    const { pin } = consumerSetup();
    const out = applyPresentation(
      {
        familyPins: [familyPinForProfile(generic2Profile)],
        semanticDocument: doc2,
        sourceView: sourceView as never,
        contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
        semanticCategoryPins: [],
        adapterPin: pin,
      } as never,
      scopedOptions([generic2Profile]),
    );
    expect(out).toEqual({ outcome: "refused", diagnostics: [PIN_MISMATCH_ADAPTER] });
  });

  it("Object.assign on the exported catalog throws or still refuses", async () => {
    const { doc2, sourceView } = await buildApplyParts();
    const { pin, catalog } = consumerSetup();
    const target = DIAGRAM_PRESENTATION_PACKAGED_CATALOG as unknown as Record<string, unknown>;
    const saved = {
      compatibilityAdapter: DIAGRAM_PRESENTATION_PACKAGED_CATALOG.compatibilityAdapter,
      adapterBytes: DIAGRAM_PRESENTATION_PACKAGED_CATALOG.adapterBytes,
      schemaPin: { ...DIAGRAM_PRESENTATION_PACKAGED_CATALOG.schemaPin },
    };
    let threw = false;
    try {
      Object.assign(target, catalog);
    } catch {
      threw = true;
    }
    const out = applyPresentation(
      {
        familyPins: [familyPinForProfile(generic2Profile)],
        semanticDocument: doc2,
        sourceView: sourceView as never,
        contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
        semanticCategoryPins: [],
        adapterPin: pin,
      } as never,
      scopedOptions([generic2Profile]),
    );
    try {
      Object.assign(target, saved);
    } catch {
      // Frozen exports refuse restoration; the failed mutation left no change.
    }
    expect(out).toEqual({ outcome: "refused", diagnostics: [PIN_MISMATCH_ADAPTER] });
    expect(Object.isFrozen(DIAGRAM_PRESENTATION_PACKAGED_CATALOG)).toBe(true);
    expect(threw).toBe(true);
  });

  it("nested adapter and schemaPin mutation throws and still refuses", async () => {
    const { doc2, sourceView } = await buildApplyParts();
    const { pin, catalog } = consumerSetup();
    const target = DIAGRAM_PRESENTATION_PACKAGED_CATALOG as unknown as {
      compatibilityAdapter: string;
      schemaPin: { contentDigest: string };
    };
    const savedAdapter = target.compatibilityAdapter;
    const savedDigest = target.schemaPin.contentDigest;
    let adapterThrew = false;
    let pinThrew = false;
    try {
      target.compatibilityAdapter = catalog.compatibilityAdapter;
    } catch {
      adapterThrew = true;
    }
    try {
      target.schemaPin.contentDigest = "0".repeat(64);
    } catch {
      pinThrew = true;
    }
    const out = applyPresentation(
      {
        familyPins: [familyPinForProfile(generic2Profile)],
        semanticDocument: doc2,
        sourceView: sourceView as never,
        contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
        semanticCategoryPins: [],
        adapterPin: pin,
      } as never,
      scopedOptions([generic2Profile]),
    );
    try {
      target.compatibilityAdapter = savedAdapter;
    } catch {
      // Frozen, no change to restore.
    }
    try {
      target.schemaPin.contentDigest = savedDigest;
    } catch {
      // Frozen, no change to restore.
    }
    expect(out).toEqual({ outcome: "refused", diagnostics: [PIN_MISMATCH_ADAPTER] });
    expect(Object.isFrozen(target.schemaPin)).toBe(true);
    expect(adapterThrew).toBe(true);
    expect(pinThrew).toBe(true);
  });

  it("keeps every governed export deeply frozen, including nested arrays", () => {
    expect(Object.isFrozen(DIAGRAM_PRESENTATION_PACKAGED_CATALOG)).toBe(true);
    expect(Object.isFrozen(DIAGRAM_PRESENTATION_PACKAGED_CATALOG.schemaPin)).toBe(true);
    expect(Object.isFrozen(DIAGRAM_PRESENTATION_SCHEMA_PIN)).toBe(true);
    expect(Object.isFrozen(DIAGRAM_PRESENTATION_CONTRACT_PIN)).toBe(true);
    expect(Object.isFrozen(DIAGRAM_PRESENTATION_SCHEMA)).toBe(true);
    expect(Object.isFrozen((DIAGRAM_PRESENTATION_SCHEMA as Record<string, unknown>)["properties"])).toBe(true);
    expect(Object.isFrozen((DIAGRAM_PRESENTATION_SCHEMA as Record<string, unknown>)["required"])).toBe(true);
    expect(Object.isFrozen(DIAGRAM_PRESENTATION_BINDING)).toBe(true);
    expect(
      Object.isFrozen((DIAGRAM_PRESENTATION_BINDING as unknown as Record<string, unknown>)["schemaPin"]),
    ).toBe(true);
    expect(Object.isFrozen(DIAGRAM_PRESENTATION_CONTRACT_DESCRIPTOR)).toBe(true);
    expect(
      Object.isFrozen(
        (DIAGRAM_PRESENTATION_CONTRACT_DESCRIPTOR as unknown as Record<string, unknown>)["schemaPin"],
      ),
    ).toBe(true);
    expect(Object.isFrozen(DIAGRAM_PRESENTATION_RECORD)).toBe(true);
    const record = DIAGRAM_PRESENTATION_RECORD as unknown as Record<string, unknown>;
    expect(Object.isFrozen(record["profileRef"])).toBe(true);
    expect(Object.isFrozen(record["lineage"])).toBe(true);
    expect(Object.isFrozen((record["lineage"] as Record<string, unknown>)["parents"])).toBe(true);
    expect(Object.isFrozen(record["consumers"])).toBe(true);
    expect(Object.isFrozen(DIAGRAM_PRESENTATION_COMPATIBILITY)).toBe(true);
    expect(() =>
      (DIAGRAM_PRESENTATION_RECORD as unknown as { consumers: unknown[] }).consumers.push("entity:evil"),
    ).toThrow();
    expect(() => ((DIAGRAM_PRESENTATION_SCHEMA as unknown as { required: unknown[] }).required.push("evil"))).toThrow();
    expect(isPresentationSchemaPin({ ...DIAGRAM_PRESENTATION_SCHEMA_PIN })).toBe(true);
    expect(isPresentationContractPin({ ...DIAGRAM_PRESENTATION_CONTRACT_PIN })).toBe(true);
  });

  it("refuses the bypass against the built dist entry outside Vitest", () => {
    const probe = join(here, "m1b-immutable-probe.mjs");
    const output = execFileSync("node", [probe], { encoding: "utf8" });
    expect(JSON.parse(output)).toEqual({ ok: true });
  });
});
