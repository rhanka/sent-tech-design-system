/**
 * M1-b pass 2 RED tests — the two residual findings.
 *
 * Each finding has a probe that fails on 6fe0d8d7 and passes after the fix.
 * English in code. No network. No Python.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  DIAGRAM_PRESENTATION_SCHEMA_PIN,
  familyPinForProfile,
  generic2Profile,
  sha256Hex,
  validateView,
  type SemanticDocument,
} from "../src/index.js";
import { ent, scopedOptions, validGeneric2Document } from "./m3-helpers.js";
import { text } from "../src/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const packageDir = join(here, "..");
const srcDir = join(packageDir, "src");

function sourceFiles(dir: string): readonly string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return entry.name.endsWith(".ts") ? [path] : [];
  });
}

function validApplyParts() {
  const document = validGeneric2Document();
  const doc2: SemanticDocument = {
    ...document,
    entities: {
      ...document.entities,
      "entity:n": ent("n", "generic@2", "node", { name: text("N") }),
    },
  };
  return { document, doc2 };
}

async function validSourceView(documentId: string) {
  const { createView, viewRef, occurrenceRef, entityRef } = await import("../src/index.js");
  return {
    ...createView({ viewId: viewRef("gen"), semanticDocumentId: documentId as never }),
    entityOccurrences: {
      "occurrence:n": {
        id: occurrenceRef("n"),
        entity: entityRef("n"),
        geometry: { x: 0, y: 0, width: 460, height: 200 },
      },
      "occurrence:c": {
        id: occurrenceRef("c"),
        entity: entityRef("c"),
        geometry: { x: 0, y: 0, width: 460, height: 200 },
      },
      "occurrence:l": {
        id: occurrenceRef("l"),
        entity: entityRef("l"),
        geometry: { x: 0, y: 0, width: 460, height: 200 },
      },
      "occurrence:k": {
        id: occurrenceRef("k"),
        entity: entityRef("k1"),
        geometry: { x: 0, y: 0, width: 460, height: 200 },
      },
      "occurrence:k2": {
        id: occurrenceRef("k2"),
        entity: entityRef("k2"),
        geometry: { x: 0, y: 0, width: 460, height: 200 },
      },
    },
    relationOccurrences: {},
    presentation: {
      camera: { x: 0, y: 0, zoom: 1 },
      diagram: {
        contractPin: DIAGRAM_PRESENTATION_CONTRACT_PIN,
        entities: {
          "occurrence:n": { form: "card", text: {}, categoryRef: entityRef("k1") },
          "occurrence:c": { form: "container", text: {} },
          "occurrence:l": { form: "legend", text: {} },
          "occurrence:k": { form: "legend-key", text: {} },
          "occurrence:k2": { form: "legend-key", text: {} },
        },
        legends: { "occurrence:l": { order: [entityRef("k1"), entityRef("k2")] } },
        categoryTokens: [{ legendRef: entityRef("l"), category: "risk", token: "st-feedback-warning" }],
      },
    },
  };
}

const SHAPE_INVALID = {
  code: "occurrence-endpoint-mismatch",
  severity: "error",
  path: "presentation.diagram.contractPin",
  message: "diagram presentation fails check presentation-shape-invalid",
  refs: [],
  details: { check: "presentation-shape-invalid" },
};

const PIN_MISMATCH_ADAPTER = {
  code: "occurrence-endpoint-mismatch",
  severity: "error",
  path: "input.adapterPin",
  message: "diagram presentation fails check presentation-pin-mismatch",
  refs: [],
  details: { check: "presentation-pin-mismatch" },
};

describe("pass 2 finding 1: no public presentation catalog override", () => {
  it("ignores a consumer-supplied catalog and refuses with the packaged adapter refusal", async () => {
    const mod = (await import("../src/index.js")) as unknown as {
      applyPresentation: (input: unknown, options: unknown) => unknown;
    };
    const { document, doc2 } = validApplyParts();
    void document;
    const sourceView = await validSourceView(doc2.documentId);
    const familyPin = familyPinForProfile(generic2Profile);
    const consumerBytes = "export const consumerAdapter = \"consumer\";\n";
    const consumerDigest = sha256Hex(consumerBytes);
    const consumerPin = { id: "consumer-adapter", version: "1", contentDigest: consumerDigest };
    const consumerCatalog = {
      compatibilityAdapter: `${consumerPin.id}@${consumerPin.version}#sha256=${consumerPin.contentDigest}`,
      adapterBytes: consumerBytes,
      schemaPin: DIAGRAM_PRESENTATION_SCHEMA_PIN,
    };
    const baseOptions = scopedOptions([generic2Profile]) as unknown as Record<string, unknown>;
    const out = mod.applyPresentation(
      {
        familyPins: [familyPin],
        semanticDocument: doc2,
        sourceView,
        contractPin: DIAGRAM_PRESENTATION_CONTRACT_PIN,
        semanticCategoryPins: [],
        adapterPin: consumerPin,
      } as never,
      { ...baseOptions, presentationCatalog: consumerCatalog } as never,
    ) as { outcome: string; diagnostics: readonly unknown[]; view?: unknown };
    expect(out.outcome).toBe("refused");
    expect(out).toEqual({ outcome: "refused", diagnostics: [PIN_MISMATCH_ADAPTER] });
    expect("view" in out).toBe(false);
  });

  it("exposes no catalog override through the package surface", async () => {
    const pkg = (await import("../src/index.js")) as unknown as Record<string, unknown>;
    expect("presentationCatalog" in pkg).toBe(false);
    expect(Object.keys(pkg).filter((key) => key === "presentationCatalog")).toEqual([]);
    const offenders: string[] = [];
    for (const file of sourceFiles(srcDir)) {
      const code = readFileSync(file, "utf8");
      if (code.includes("presentationCatalog")) offenders.push(file.slice(packageDir.length + 1));
    }
    expect(offenders).toEqual([]);
  });
});

describe("pass 2 finding 2: nested contractPin shape before comparison", () => {
  it("refuses a deleted nested contractPin in application without throwing", async () => {
    const mod = (await import("../src/index.js")) as unknown as {
      applyPresentation: (input: unknown, options: unknown) => unknown;
    };
    const { doc2 } = validApplyParts();
    const sourceView = (await validSourceView(doc2.documentId)) as unknown as {
      presentation: { diagram: Record<string, unknown> };
    };
    delete sourceView.presentation.diagram["contractPin"];
    const familyPin = familyPinForProfile(generic2Profile);
    const adapterBytes = "export const testPresentationAdapter = \"adapter\";\n";
    const adapterPin = {
      id: "test-presentation-adapter",
      version: "1",
      contentDigest: sha256Hex(adapterBytes),
    };
    void DIAGRAM_PRESENTATION_SCHEMA_PIN;
    let out: unknown;
    expect(() => {
      out = mod.applyPresentation(
        {
          familyPins: [familyPin],
          semanticDocument: doc2,
          sourceView,
          contractPin: DIAGRAM_PRESENTATION_CONTRACT_PIN,
          semanticCategoryPins: [],
          adapterPin,
        } as never,
        scopedOptions([generic2Profile]),
      );
    }).not.toThrow();
    expect(out).toEqual({ outcome: "refused", diagnostics: [SHAPE_INVALID] });
  });

  it("refuses a null nested contractPin in application without throwing", async () => {
    const mod = (await import("../src/index.js")) as unknown as {
      applyPresentation: (input: unknown, options: unknown) => unknown;
    };
    const { doc2 } = validApplyParts();
    const sourceView = (await validSourceView(doc2.documentId)) as unknown as {
      presentation: { diagram: Record<string, unknown> };
    };
    sourceView.presentation.diagram["contractPin"] = null;
    const familyPin = familyPinForProfile(generic2Profile);
    const adapterBytes = "export const testPresentationAdapter = \"adapter\";\n";
    const adapterPin = {
      id: "test-presentation-adapter",
      version: "1",
      contentDigest: sha256Hex(adapterBytes),
    };
    void DIAGRAM_PRESENTATION_SCHEMA_PIN;
    let out: unknown;
    expect(() => {
      out = mod.applyPresentation(
        {
          familyPins: [familyPin],
          semanticDocument: doc2,
          sourceView,
          contractPin: DIAGRAM_PRESENTATION_CONTRACT_PIN,
          semanticCategoryPins: [],
          adapterPin,
        } as never,
        scopedOptions([generic2Profile]),
      );
    }).not.toThrow();
    expect(out).toEqual({ outcome: "refused", diagnostics: [SHAPE_INVALID] });
  });

  it("refuses a deleted nested contractPin in validateView", async () => {
    const { document } = validApplyParts();
    const sourceView = (await validSourceView(document.documentId)) as unknown as {
      presentation: { diagram: Record<string, unknown> };
    };
    delete sourceView.presentation.diagram["contractPin"];
    expect(validateView(sourceView as never, document as never, scopedOptions([generic2Profile]))).toEqual([
      SHAPE_INVALID,
    ]);
  });

  it("refuses a null nested contractPin in validateView", async () => {
    const { document } = validApplyParts();
    const sourceView = (await validSourceView(document.documentId)) as unknown as {
      presentation: { diagram: Record<string, unknown> };
    };
    sourceView.presentation.diagram["contractPin"] = null;
    expect(validateView(sourceView as never, document as never, scopedOptions([generic2Profile]))).toEqual([
      SHAPE_INVALID,
    ]);
  });
});
