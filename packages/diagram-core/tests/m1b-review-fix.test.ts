/**
 * M1-b review pass 1 fixes — RED tests for the ten findings.
 *
 * Each test below fails on 1ccb33d3 and passes after the fix.
 * English in code. No network. No Python.
 */
import { describe, expect, it } from "vitest";

import {
  canonicalBytes,
  contentDiagramDigest,
  createProfileRegistry,
  generic2Profile,
  genericProfile,
  sha256Hex,
  validateDocument,
  validateView,
  type SemanticDocument,
} from "../src/index.js";
import { baseDocument, ent, rel, scopedOptions, validGeneric2Document } from "./m3-helpers.js";
import { text } from "../src/index.js";

const GENERIC2_PIN_DIGEST = "cb103606707577720eba48570c0e49aadd209d8e51a9a0bc2c725b7434f79283";

function viewRefs() {
  // Dynamic to avoid static import drift.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("../src/index.js") as typeof import("../src/index.js");
}

describe("fix 1: governed adapter authentication", () => {
  it("refuses the packaged unqualified adapter with presentation-pin-mismatch at input.adapterPin", async () => {
    const mod = (await import("../src/index.js")) as unknown as {
      applyPresentation: (input: unknown, options: unknown) => unknown;
      DIAGRAM_PRESENTATION_CONTRACT_PIN: { id: string; version: string; contentDigest: string };
      DIAGRAM_PRESENTATION_ADAPTER_PIN?: { id: string; version: string; contentDigest: string };
      familyPinForProfile: (profile: unknown) => { id: string; version: string; contentDigest: string };
    };
    const document = validGeneric2Document();
    const { createView, viewRef, occurrenceRef, entityRef } = (await import(
      "../src/index.js"
    )) as typeof import("../src/index.js");
    const doc2: SemanticDocument = {
      ...document,
      entities: {
        ...document.entities,
        "entity:n": ent("n", "generic@2", "node", { name: text("N") }),
      },
    };
    const sourceView = {
      ...createView({ viewId: viewRef("gen"), semanticDocumentId: document.documentId }),
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
          contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
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
    const familyPin = mod.familyPinForProfile(generic2Profile);
    // The invented pin on base would accept; the governed packaged catalog must refuse.
    const invented = (mod.DIAGRAM_PRESENTATION_ADAPTER_PIN ??
      ({ id: "ds-presentation-adapter", version: "1", contentDigest: "00".repeat(32) } as const)) as {
      id: string;
      version: string;
      contentDigest: string;
    };
    const out = mod.applyPresentation(
      {
        familyPins: [familyPin],
        semanticDocument: doc2,
        sourceView,
        contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
        semanticCategoryPins: [],
        adapterPin: invented,
      } as never,
      scopedOptions([generic2Profile]) as never,
    ) as { outcome: string; diagnostics: readonly unknown[] };
    expect(out).toEqual({
      outcome: "refused",
      diagnostics: [
        {
          code: "occurrence-endpoint-mismatch",
          severity: "error",
          path: "input.adapterPin",
          message: "diagram presentation fails check presentation-pin-mismatch",
          refs: [],
          details: { check: "presentation-pin-mismatch" },
        },
      ],
    });
  });

  it("accepts P-GEN through a test-only pinned adapter over actual bytes", async () => {
    const mod = (await import("../src/index.js")) as unknown as {
      applyPresentation: (input: unknown, options: unknown) => unknown;
      DIAGRAM_PRESENTATION_CONTRACT_PIN: { id: string; version: string; contentDigest: string };
      DIAGRAM_PRESENTATION_SCHEMA_PIN: { id: string; version: string; contentDigest: string };
      familyPinForProfile: (profile: unknown) => { id: string; version: string; contentDigest: string };
    };
    const document = validGeneric2Document();
    const { createView, viewRef, occurrenceRef, entityRef } = (await import(
      "../src/index.js"
    )) as typeof import("../src/index.js");
    const doc2: SemanticDocument = {
      ...document,
      entities: {
        ...document.entities,
        "entity:n": ent("n", "generic@2", "node", { name: text("N") }),
      },
    };
    const sourceView = {
      ...createView({ viewId: viewRef("gen"), semanticDocumentId: document.documentId }),
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
          contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
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
    const adapterBytes = "export const testPresentationAdapter = \"adapter\";\n";
    const adapterDigest = sha256Hex(adapterBytes);
    const adapterPin = { id: "test-presentation-adapter", version: "1", contentDigest: adapterDigest };
    const catalog = {
      compatibilityAdapter: `${adapterPin.id}@${adapterPin.version}#sha256=${adapterPin.contentDigest}`,
      adapterBytes,
      schemaPin: mod.DIAGRAM_PRESENTATION_SCHEMA_PIN,
    };
    const familyPin = mod.familyPinForProfile(generic2Profile);
    const baseOptions = scopedOptions([generic2Profile]) as unknown as Record<string, unknown>;
    const out = mod.applyPresentation(
      {
        familyPins: [familyPin],
        semanticDocument: doc2,
        sourceView,
        contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
        semanticCategoryPins: [],
        adapterPin,
      } as never,
      { ...baseOptions, presentationCatalog: catalog } as never,
    ) as { outcome: string; diagnostics: readonly unknown[] };
    expect(out.outcome).toBe("ok");
  });
});

describe("fix 2: categoryRef requires the legend-key selector", () => {
  it.each([
    ["node", "entity:n"],
    ["container", "entity:c"],
    ["legend", "entity:l"],
  ])("refuses categoryRef naming a %s with the Appendix C arm", async (_label, target) => {
    const mod = (await import("../src/index.js")) as unknown as {
      DIAGRAM_PRESENTATION_CONTRACT_PIN: { id: string; version: string; contentDigest: string };
    };
    const document = validGeneric2Document();
    const doc2: SemanticDocument = {
      ...document,
      entities: {
        ...document.entities,
        "entity:n": ent("n", "generic@2", "node", { name: text("N") }),
      },
    };
    const { createView, viewRef, occurrenceRef, entityRef } = (await import(
      "../src/index.js"
    )) as typeof import("../src/index.js");
    void entityRef;
    const view = {
      ...createView({ viewId: viewRef("v"), semanticDocumentId: doc2.documentId }),
      entityOccurrences: {
        "occurrence:n": {
          id: occurrenceRef("n"),
          entity: entityRef("n"),
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
          contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
          entities: {
            "occurrence:n": { form: "card", text: {}, categoryRef: target as never },
            "occurrence:l": { form: "legend", text: {} },
            "occurrence:k": { form: "legend-key", text: {} },
            "occurrence:k2": { form: "legend-key", text: {} },
          },
          legends: { "occurrence:l": { order: [entityRef("k1"), entityRef("k2")] } },
          categoryTokens: [{ legendRef: entityRef("l"), category: "risk", token: "st-feedback-warning" }],
        },
      },
    };
    const diagnostics = validateView(view as never, doc2 as never, scopedOptions([generic2Profile]));
    expect(diagnostics.length).toBe(1);
    expect(diagnostics[0]).toMatchObject({
      code: "reference-type-mismatch",
      path: "presentation.diagram.entities.occurrence:n.categoryRef",
    });
  });
});

describe("fix 3: binding category must be a direct key category", () => {
  it("refuses a binding category absent from the legend direct keys", async () => {
    const mod = (await import("../src/index.js")) as unknown as {
      DIAGRAM_PRESENTATION_CONTRACT_PIN: { id: string; version: string; contentDigest: string };
    };
    const document = validGeneric2Document();
    const { createView, viewRef, occurrenceRef, entityRef } = (await import(
      "../src/index.js"
    )) as typeof import("../src/index.js");
    const view = {
      ...createView({ viewId: viewRef("v"), semanticDocumentId: document.documentId }),
      entityOccurrences: {
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
          contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
          entities: {
            "occurrence:l": { form: "legend", text: {} },
            "occurrence:k": { form: "legend-key", text: {} },
            "occurrence:k2": { form: "legend-key", text: {} },
          },
          legends: { "occurrence:l": { order: [entityRef("k1"), entityRef("k2")] } },
          categoryTokens: [{ legendRef: entityRef("l"), category: "absent", token: "danger" }],
        },
      },
    };
    const diagnostics = validateView(view as never, document as never, scopedOptions([generic2Profile]));
    expect(diagnostics.length).toBe(1);
    expect(diagnostics[0]).toMatchObject({
      code: "tone-category-unknown",
      path: "presentation.diagram.categoryTokens[0].category",
    });
  });
});

describe("fix 4: owner-qualified selectors with explicit form predicate", () => {
  it("accepts a legend-key drawn as card", async () => {
    const mod = (await import("../src/index.js")) as unknown as {
      DIAGRAM_PRESENTATION_CONTRACT_PIN: { id: string; version: string; contentDigest: string };
    };
    const document = validGeneric2Document();
    const { createView, viewRef, occurrenceRef, entityRef } = (await import(
      "../src/index.js"
    )) as typeof import("../src/index.js");
    const view = {
      ...createView({ viewId: viewRef("v"), semanticDocumentId: document.documentId }),
      entityOccurrences: {
        "occurrence:k": {
          id: occurrenceRef("k"),
          entity: entityRef("k1"),
          geometry: { x: 0, y: 0, width: 460, height: 200 },
        },
      },
      relationOccurrences: {},
      presentation: {
        camera: { x: 0, y: 0, zoom: 1 },
        diagram: {
          contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
          entities: { "occurrence:k": { form: "card", text: {} } },
          legends: {},
          categoryTokens: [],
        },
      },
    };
    expect(validateView(view as never, document as never, scopedOptions([generic2Profile]))).toEqual([]);
  });

  it("accepts a legend drawn as container", async () => {
    const mod = (await import("../src/index.js")) as unknown as {
      DIAGRAM_PRESENTATION_CONTRACT_PIN: { id: string; version: string; contentDigest: string };
    };
    const document = validGeneric2Document();
    const { createView, viewRef, occurrenceRef, entityRef } = (await import(
      "../src/index.js"
    )) as typeof import("../src/index.js");
    const view = {
      ...createView({ viewId: viewRef("v"), semanticDocumentId: document.documentId }),
      entityOccurrences: {
        "occurrence:l": {
          id: occurrenceRef("l"),
          entity: entityRef("l"),
          geometry: { x: 0, y: 0, width: 460, height: 200 },
        },
      },
      relationOccurrences: {},
      presentation: {
        camera: { x: 0, y: 0, zoom: 1 },
        diagram: {
          contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
          entities: { "occurrence:l": { form: "container", text: {} } },
          legends: {},
          categoryTokens: [],
        },
      },
    };
    expect(validateView(view as never, document as never, scopedOptions([generic2Profile]))).toEqual([]);
  });

  it("gives no legend semantics to an unrelated family type named legend", async () => {
    const mod = (await import("../src/index.js")) as unknown as {
      DIAGRAM_PRESENTATION_CONTRACT_PIN: { id: string; version: string; contentDigest: string };
    };
    const otherProfile = {
      ...generic2Profile,
      id: "other@2",
      version: 2,
      entityTypes: [
        {
          id: "legend",
          label: "Legend",
          container: true,
          attributes: [{ name: "name", kind: "text", required: true, maxLength: 200 }],
        },
        {
          id: "legend-key",
          label: "Legend key",
          attributes: [
            { name: "name", kind: "text", required: true, maxLength: 120 },
            {
              name: "category",
              kind: "text",
              required: true,
              minLength: 1,
              maxLength: 40,
              pattern: "^[a-z][a-z0-9-]*$",
              patternName: "key",
            },
          ],
        },
      ],
      relationTypes: [
        {
          id: "contains",
          label: "Contains",
          direction: "directed",
          roles: [
            { role: "parent", cardinality: { min: 1, max: 1 }, targets: ["entity"], entityTypes: ["legend"] },
            { role: "child", cardinality: { min: 1, max: 1 }, targets: ["entity"] },
          ],
          hierarchy: { id: "containment", shape: "tree", parentRole: "parent", childRole: "child" },
        },
      ],
      constraints: [
        { kind: "hierarchy", relationType: "contains", hierarchyId: "containment", parentRole: "parent", childRole: "child" },
        { kind: "parent-family", hierarchyId: "containment", familyRoots: ["legend"] },
        {
          kind: "children-restricted",
          parentFamilyRoots: ["legend"],
          childTypes: ["legend-key"],
          hierarchyId: "containment",
        },
        {
          kind: "required-parent",
          childTypes: ["legend-key"],
          parentFamilyRoots: ["legend"],
          hierarchyId: "containment",
        },
        { kind: "acyclic-hierarchy", hierarchyId: "containment" },
      ],
    } as unknown as typeof generic2Profile;
    const document: SemanticDocument = {
      ...baseDocument(["other@2"] as never),
      entities: {
        "entity:o": ent("o", "other@2" as never, "legend", { name: text("O") }),
      },
    };
    const { createView, viewRef, occurrenceRef, entityRef } = (await import(
      "../src/index.js"
    )) as typeof import("../src/index.js");
    void entityRef;
    const view = {
      ...createView({ viewId: viewRef("v"), semanticDocumentId: document.documentId }),
      entityOccurrences: {
        "occurrence:o": {
          id: occurrenceRef("o"),
          entity: "entity:o" as never,
          geometry: { x: 0, y: 0, width: 460, height: 200 },
        },
      },
      relationOccurrences: {},
      presentation: {
        camera: { x: 0, y: 0, zoom: 1 },
        diagram: {
          contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
          entities: { "occurrence:o": { form: "legend", text: {} } },
          legends: {},
          categoryTokens: [],
        },
      },
    };
    const diagnostics = validateView(
      view as never,
      document as never,
      scopedOptions([otherProfile] as never) as never,
    );
    expect(diagnostics).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "presentation.diagram.entities.occurrence:o.form",
        message: "diagram presentation fails check form-selector-mismatch",
        refs: [],
        details: { check: "form-selector-mismatch" },
      },
    ]);
  });
});

describe("fix 5: strokeStyle runtime check", () => {
  it("refuses dotted strokeStyle on a contract-bearing view", async () => {
    const mod = (await import("../src/index.js")) as unknown as {
      DIAGRAM_PRESENTATION_CONTRACT_PIN: { id: string; version: string; contentDigest: string };
    };
    const document = validGeneric2Document();
    const { createView, viewRef, occurrenceRef, entityRef } = (await import(
      "../src/index.js"
    )) as typeof import("../src/index.js");
    const view = {
      ...createView({ viewId: viewRef("v"), semanticDocumentId: document.documentId }),
      entityOccurrences: {
        "occurrence:n": {
          id: occurrenceRef("n"),
          entity: entityRef("n"),
          geometry: { x: 0, y: 0, width: 460, height: 200 },
        },
      },
      relationOccurrences: {
        "occurrence:r": {
          id: occurrenceRef("r"),
          relation: "relation:cn" as never,
          endpoints: [],
          strokeStyle: "dotted" as never,
        },
      },
      presentation: {
        camera: { x: 0, y: 0, zoom: 1 },
        diagram: {
          contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
          entities: { "occurrence:n": { form: "card", text: {} } },
          legends: {},
          categoryTokens: [],
        },
      },
    };
    const diagnostics = validateView(view as never, document as never, scopedOptions([generic2Profile]));
    expect(diagnostics).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "relationOccurrences.occurrence:r.strokeStyle",
        message: "diagram presentation fails check presentation-shape-invalid",
        refs: [],
        details: { check: "presentation-shape-invalid" },
      },
    ]);
  });
});

describe("fix 6: closed application input", () => {
  it("refuses missing contractPin without throwing", async () => {
    const mod = (await import("../src/index.js")) as unknown as {
      applyPresentation: (input: unknown, options: unknown) => unknown;
      DIAGRAM_PRESENTATION_CONTRACT_PIN: { id: string; version: string; contentDigest: string };
      familyPinForProfile: (profile: unknown) => { id: string; version: string; contentDigest: string };
    };
    const document = validGeneric2Document();
    const { createView, viewRef, occurrenceRef, entityRef } = (await import(
      "../src/index.js"
    )) as typeof import("../src/index.js");
    const view = {
      ...createView({ viewId: viewRef("v"), semanticDocumentId: document.documentId }),
      entityOccurrences: {
        "occurrence:n": {
          id: occurrenceRef("n"),
          entity: entityRef("n"),
          geometry: { x: 0, y: 0, width: 460, height: 200 },
        },
      },
      relationOccurrences: {},
      presentation: {
        camera: { x: 0, y: 0, zoom: 1 },
        diagram: {
          contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
          entities: { "occurrence:n": { form: "card", text: {} } },
          legends: {},
          categoryTokens: [],
        },
      },
    };
    const familyPin = mod.familyPinForProfile(generic2Profile);
    const adapterBytes = "export const testPresentationAdapter = \"adapter\";\n";
    const adapterPin = {
      id: "test-presentation-adapter",
      version: "1",
      contentDigest: sha256Hex(adapterBytes),
    };
    const catalog = {
      compatibilityAdapter: `${adapterPin.id}@${adapterPin.version}#sha256=${adapterPin.contentDigest}`,
      adapterBytes,
      schemaPin: (mod as unknown as Record<string, unknown>)["DIAGRAM_PRESENTATION_SCHEMA_PIN"],
    };
    let out: unknown;
    expect(() => {
      out = mod.applyPresentation(
        {
          familyPins: [familyPin],
          semanticDocument: document,
          sourceView: view,
          semanticCategoryPins: [],
          adapterPin,
        } as never,
        { ...(scopedOptions([generic2Profile]) as unknown as Record<string, unknown>), presentationCatalog: catalog } as never,
      );
    }).not.toThrow();
    expect((out as { outcome: string }).outcome).toBe("refused");
  });

  it("refuses diagram null without throwing", async () => {
    const mod = (await import("../src/index.js")) as unknown as {
      applyPresentation: (input: unknown, options: unknown) => unknown;
      DIAGRAM_PRESENTATION_CONTRACT_PIN: { id: string; version: string; contentDigest: string };
      familyPinForProfile: (profile: unknown) => { id: string; version: string; contentDigest: string };
    };
    const document = validGeneric2Document();
    const { createView, viewRef, occurrenceRef, entityRef } = (await import(
      "../src/index.js"
    )) as typeof import("../src/index.js");
    void entityRef;
    void occurrenceRef;
    const view = {
      ...createView({ viewId: viewRef("v"), semanticDocumentId: document.documentId }),
      entityOccurrences: {},
      relationOccurrences: {},
      presentation: { camera: { x: 0, y: 0, zoom: 1 }, diagram: null as never },
    };
    const familyPin = mod.familyPinForProfile(generic2Profile);
    const adapterBytes = "export const testPresentationAdapter = \"adapter\";\n";
    const adapterPin = {
      id: "test-presentation-adapter",
      version: "1",
      contentDigest: sha256Hex(adapterBytes),
    };
    const catalog = {
      compatibilityAdapter: `${adapterPin.id}@${adapterPin.version}#sha256=${adapterPin.contentDigest}`,
      adapterBytes,
      schemaPin: (mod as unknown as Record<string, unknown>)["DIAGRAM_PRESENTATION_SCHEMA_PIN"],
    };
    let out: unknown;
    expect(() => {
      out = mod.applyPresentation(
        {
          familyPins: [familyPin],
          semanticDocument: document,
          sourceView: view,
          contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
          semanticCategoryPins: [],
          adapterPin,
        } as never,
        { ...(scopedOptions([generic2Profile]) as unknown as Record<string, unknown>), presentationCatalog: catalog } as never,
      );
    }).not.toThrow();
    expect((out as { outcome: string }).outcome).toBe("refused");
  });

  it("refuses extra input properties", async () => {
    const mod = (await import("../src/index.js")) as unknown as {
      applyPresentation: (input: unknown, options: unknown) => unknown;
      DIAGRAM_PRESENTATION_CONTRACT_PIN: { id: string; version: string; contentDigest: string };
      familyPinForProfile: (profile: unknown) => { id: string; version: string; contentDigest: string };
    };
    const document = validGeneric2Document();
    const { createView, viewRef, occurrenceRef, entityRef } = (await import(
      "../src/index.js"
    )) as typeof import("../src/index.js");
    const view = {
      ...createView({ viewId: viewRef("v"), semanticDocumentId: document.documentId }),
      entityOccurrences: {
        "occurrence:n": {
          id: occurrenceRef("n"),
          entity: entityRef("n"),
          geometry: { x: 0, y: 0, width: 460, height: 200 },
        },
      },
      relationOccurrences: {},
      presentation: {
        camera: { x: 0, y: 0, zoom: 1 },
        diagram: {
          contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
          entities: { "occurrence:n": { form: "card", text: {} } },
          legends: {},
          categoryTokens: [],
        },
      },
    };
    const familyPin = mod.familyPinForProfile(generic2Profile);
    const adapterBytes = "export const testPresentationAdapter = \"adapter\";\n";
    const adapterPin = {
      id: "test-presentation-adapter",
      version: "1",
      contentDigest: sha256Hex(adapterBytes),
    };
    const catalog = {
      compatibilityAdapter: `${adapterPin.id}@${adapterPin.version}#sha256=${adapterPin.contentDigest}`,
      adapterBytes,
      schemaPin: (mod as unknown as Record<string, unknown>)["DIAGRAM_PRESENTATION_SCHEMA_PIN"],
    };
    const out = mod.applyPresentation(
      {
        familyPins: [familyPin],
        semanticDocument: document,
        sourceView: view,
        contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
        semanticCategoryPins: [],
        adapterPin,
        extra: 1,
      } as never,
      { ...(scopedOptions([generic2Profile]) as unknown as Record<string, unknown>), presentationCatalog: catalog } as never,
    ) as { outcome: string; diagnostics: readonly { path: string }[] };
    expect(out.outcome).toBe("refused");
    expect(out.diagnostics.some((entry) => entry.path.includes("extra"))).toBe(true);
  });

  it("refuses duplicated semanticCategoryPins", async () => {
    const mod = (await import("../src/index.js")) as unknown as {
      applyPresentation: (input: unknown, options: unknown) => unknown;
      DIAGRAM_PRESENTATION_CONTRACT_PIN: { id: string; version: string; contentDigest: string };
      familyPinForProfile: (profile: unknown) => { id: string; version: string; contentDigest: string };
    };
    const document = validGeneric2Document();
    const { createView, viewRef, occurrenceRef, entityRef } = (await import(
      "../src/index.js"
    )) as typeof import("../src/index.js");
    const view = {
      ...createView({ viewId: viewRef("v"), semanticDocumentId: document.documentId }),
      entityOccurrences: {
        "occurrence:n": {
          id: occurrenceRef("n"),
          entity: entityRef("n"),
          geometry: { x: 0, y: 0, width: 460, height: 200 },
        },
      },
      relationOccurrences: {},
      presentation: {
        camera: { x: 0, y: 0, zoom: 1 },
        diagram: {
          contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
          entities: { "occurrence:n": { form: "card", text: {} } },
          legends: {},
          categoryTokens: [],
        },
      },
    };
    const familyPin = mod.familyPinForProfile(generic2Profile);
    const adapterBytes = "export const testPresentationAdapter = \"adapter\";\n";
    const adapterPin = {
      id: "test-presentation-adapter",
      version: "1",
      contentDigest: sha256Hex(adapterBytes),
    };
    const catalog = {
      compatibilityAdapter: `${adapterPin.id}@${adapterPin.version}#sha256=${adapterPin.contentDigest}`,
      adapterBytes,
      schemaPin: (mod as unknown as Record<string, unknown>)["DIAGRAM_PRESENTATION_SCHEMA_PIN"],
    };
    const out = mod.applyPresentation(
      {
        familyPins: [familyPin],
        semanticDocument: document,
        sourceView: view,
        contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
        semanticCategoryPins: [familyPin, familyPin],
        adapterPin,
      } as never,
      { ...(scopedOptions([generic2Profile]) as unknown as Record<string, unknown>), presentationCatalog: catalog } as never,
    ) as { outcome: string; diagnostics: readonly { path: string }[] };
    expect(out.outcome).toBe("refused");
    expect(
      out.diagnostics.some(
        (entry) => entry.path === "presentation.diagram.contractPin" || entry.path.includes("semanticCategoryPins"),
      ),
    ).toBe(true);
    expect(out.diagnostics.some((entry) => entry.path === "input.adapterPin")).toBe(false);
  });
});

describe("fix 7: normative order occurrences before presentation", () => {
  it("reports the occurrence diagnostic, not only the kicker", async () => {
    const mod = (await import("../src/index.js")) as unknown as {
      applyPresentation: (input: unknown, options: unknown) => unknown;
      DIAGRAM_PRESENTATION_CONTRACT_PIN: { id: string; version: string; contentDigest: string };
      familyPinForProfile: (profile: unknown) => { id: string; version: string; contentDigest: string };
    };
    const document = validGeneric2Document();
    const { createView, viewRef, occurrenceRef, entityRef } = (await import(
      "../src/index.js"
    )) as typeof import("../src/index.js");
    const view = {
      ...createView({ viewId: viewRef("v"), semanticDocumentId: document.documentId }),
      entityOccurrences: {
        "occurrence:bad": {
          id: occurrenceRef("bad"),
          entity: entityRef("missing"),
          geometry: { x: 0, y: 0, width: 460, height: 200 },
        },
        "occurrence:n": {
          id: occurrenceRef("n"),
          entity: entityRef("n"),
          geometry: { x: 0, y: 0, width: 460, height: 200 },
        },
      },
      relationOccurrences: {},
      presentation: {
        camera: { x: 0, y: 0, zoom: 1 },
        diagram: {
          contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
          entities: {
            "occurrence:bad": { form: "card", text: {} },
            "occurrence:n": { form: "card", text: { kicker: 7 as never } },
          },
          legends: {},
          categoryTokens: [],
        },
      },
    };
    const familyPin = mod.familyPinForProfile(generic2Profile);
    const adapterBytes = "export const testPresentationAdapter = \"adapter\";\n";
    const adapterPin = {
      id: "test-presentation-adapter",
      version: "1",
      contentDigest: sha256Hex(adapterBytes),
    };
    const catalog = {
      compatibilityAdapter: `${adapterPin.id}@${adapterPin.version}#sha256=${adapterPin.contentDigest}`,
      adapterBytes,
      schemaPin: (mod as unknown as Record<string, unknown>)["DIAGRAM_PRESENTATION_SCHEMA_PIN"],
    };
    const out = mod.applyPresentation(
      {
        familyPins: [familyPin],
        semanticDocument: document,
        sourceView: view,
        contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
        semanticCategoryPins: [],
        adapterPin,
      } as never,
      { ...(scopedOptions([generic2Profile]) as unknown as Record<string, unknown>), presentationCatalog: catalog } as never,
    ) as { outcome: string; diagnostics: readonly { path: string; code: string }[] };
    expect(out.outcome).toBe("refused");
    expect(out.diagnostics.some((entry) => entry.path === "entityOccurrences.occurrence:bad.entity")).toBe(true);
  });
});

describe("fix 8: legend selector and order references first", () => {
  it("refuses a node occurrence in legends even with an empty order", async () => {
    const mod = (await import("../src/index.js")) as unknown as {
      DIAGRAM_PRESENTATION_CONTRACT_PIN: { id: string; version: string; contentDigest: string };
    };
    const document = validGeneric2Document();
    const { createView, viewRef, occurrenceRef, entityRef } = (await import(
      "../src/index.js"
    )) as typeof import("../src/index.js");
    const view = {
      ...createView({ viewId: viewRef("v"), semanticDocumentId: document.documentId }),
      entityOccurrences: {
        "occurrence:n": {
          id: occurrenceRef("n"),
          entity: entityRef("n"),
          geometry: { x: 0, y: 0, width: 460, height: 200 },
        },
      },
      relationOccurrences: {},
      presentation: {
        camera: { x: 0, y: 0, zoom: 1 },
        diagram: {
          contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
          entities: { "occurrence:n": { form: "card", text: {} } },
          legends: { "occurrence:n": { order: [] } },
          categoryTokens: [],
        },
      },
    };
    const diagnostics = validateView(view as never, document as never, scopedOptions([generic2Profile]));
    expect(diagnostics.some((entry) => entry.path === "presentation.diagram.legends.occurrence:n")).toBe(true);
    expect(
      diagnostics.some(
        (entry) =>
          entry.path === "presentation.diagram.legends.occurrence:n.order" &&
          (entry.details as Record<string, unknown> | undefined)?.["check"] === "legend-order-invalid",
      ),
    ).toBe(false);
  });

  it("reports namespace and dangling arms at order[i]", async () => {
    const mod = (await import("../src/index.js")) as unknown as {
      DIAGRAM_PRESENTATION_CONTRACT_PIN: { id: string; version: string; contentDigest: string };
    };
    const document = validGeneric2Document();
    const { createView, viewRef, occurrenceRef, entityRef } = (await import(
      "../src/index.js"
    )) as typeof import("../src/index.js");
    const viewNs = {
      ...createView({ viewId: viewRef("v"), semanticDocumentId: document.documentId }),
      entityOccurrences: {
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
      },
      relationOccurrences: {},
      presentation: {
        camera: { x: 0, y: 0, zoom: 1 },
        diagram: {
          contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
          entities: {
            "occurrence:l": { form: "legend", text: {} },
            "occurrence:k": { form: "legend-key", text: {} },
          },
          legends: { "occurrence:l": { order: ["relation:k" as never] } },
          categoryTokens: [],
        },
      },
    };
    expect(validateView(viewNs as never, document as never, scopedOptions([generic2Profile]))).toEqual([
      {
        code: "reference-type-mismatch",
        severity: "error",
        path: "presentation.diagram.legends.occurrence:l.order[0]",
        message: "presentation reference relation:k must be a entity",
        refs: ["relation:k"],
        details: { expectedKind: "entity" },
      },
    ]);
    const viewDangling = {
      ...createView({ viewId: viewRef("v"), semanticDocumentId: document.documentId }),
      entityOccurrences: {
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
      },
      relationOccurrences: {},
      presentation: {
        camera: { x: 0, y: 0, zoom: 1 },
        diagram: {
          contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
          entities: {
            "occurrence:l": { form: "legend", text: {} },
            "occurrence:k": { form: "legend-key", text: {} },
          },
          legends: { "occurrence:l": { order: [entityRef("missing")] } },
          categoryTokens: [],
        },
      },
    };
    expect(validateView(viewDangling as never, document as never, scopedOptions([generic2Profile]))).toEqual([
      {
        code: "dangling-reference",
        severity: "error",
        path: "presentation.diagram.legends.occurrence:l.order[0]",
        message: "presentation reference entity:missing does not resolve",
        refs: ["entity:missing"],
        details: {},
      },
    ]);
  });
});

describe("fix 9: unknown profile keeps unknown-profile", () => {
  it("reports unknown-profile when the semantic profile is absent", async () => {
    const mod = (await import("../src/index.js")) as unknown as {
      applyPresentation: (input: unknown, options: unknown) => unknown;
      DIAGRAM_PRESENTATION_CONTRACT_PIN: { id: string; version: string; contentDigest: string };
    };
    const document: SemanticDocument = {
      ...baseDocument(["unknown@9" as never]),
      entities: {},
    };
    const { createView, viewRef, occurrenceRef } = (await import(
      "../src/index.js"
    )) as typeof import("../src/index.js");
    const view = {
      ...createView({ viewId: viewRef("v"), semanticDocumentId: document.documentId }),
      entityOccurrences: {},
      relationOccurrences: {},
      presentation: {
        camera: { x: 0, y: 0, zoom: 1 },
        diagram: {
          contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
          entities: {},
          legends: {},
          categoryTokens: [],
        },
      },
    };
    const adapterBytes = "export const testPresentationAdapter = \"adapter\";\n";
    const adapterPin = {
      id: "test-presentation-adapter",
      version: "1",
      contentDigest: sha256Hex(adapterBytes),
    };
    const catalog = {
      compatibilityAdapter: `${adapterPin.id}@${adapterPin.version}#sha256=${adapterPin.contentDigest}`,
      adapterBytes,
      schemaPin: (mod as unknown as Record<string, unknown>)["DIAGRAM_PRESENTATION_SCHEMA_PIN"],
    };
    const out = mod.applyPresentation(
      {
        familyPins: [{ id: "unknown", version: "9.0.0", contentDigest: "a".repeat(64) }],
        semanticDocument: document,
        sourceView: view,
        contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
        semanticCategoryPins: [],
        adapterPin,
      } as never,
      {
        ...(scopedOptions([generic2Profile]) as unknown as Record<string, unknown>),
        presentationCatalog: catalog,
      } as never,
    ) as { outcome: string; diagnostics: readonly { code: string }[] };
    expect(out.outcome).toBe("refused");
    expect(out.diagnostics[0]).toMatchObject({ code: "unknown-profile" });
  });
});

describe("fix 10: complete governed draft G0 record", () => {
  it("transcribes digests with pinsDigest and unresolved resultEvidence plus catalog binding", async () => {
    const mod = (await import("../src/index.js")) as unknown as Record<string, unknown>;
    const record = mod["DIAGRAM_PRESENTATION_RECORD"] as Record<string, unknown>;
    const digests = record["digests"] as Record<string, unknown>;
    expect(typeof digests["contentDigest"]).toBe("string");
    expect(typeof digests["pinsDigest"]).toBe("string");
    expect((digests["pinsDigest"] as string)).toMatch(/^[0-9a-f]{64}$/);
    expect(digests["resultEvidence"]).toEqual({ evidenceState: "unresolved" });
    expect(record["lifecycle"]).toBe("draft");
    expect(record["profileShape"]).toBe("mechanism-descriptor");
    expect(record["artifactKind"]).toBe("contract");
    const binding = mod["DIAGRAM_PRESENTATION_BINDING"] as Record<string, unknown>;
    expect(binding).toMatchObject({
      artifactKind: "contract",
      compatibilityMatrixVersion: "1",
    });
    expect(typeof (binding["schemaPin"] as { contentDigest: string }).contentDigest).toBe("string");
    // Qualification stays unresolved: no resolved evidence, no qualified adapter.
    const compatibility = mod["DIAGRAM_PRESENTATION_COMPATIBILITY"] as Record<string, string>;
    expect(compatibility["adapter"]).toMatch(/transitional:.*-unqualified/);
    // Contract bytes unchanged.
    expect((mod["DIAGRAM_PRESENTATION_CONTRACT_PIN"] as { contentDigest: string }).contentDigest).toBe(
      "74dadb9c31fff7653ca31692d8db3cfea782baea8d9268a3c20982ea8ab0aeae",
    );
    expect(contentDiagramDigest(generic2Profile)).toBe(GENERIC2_PIN_DIGEST);
  });
});

void viewRefs;
void canonicalBytes;
void createProfileRegistry;
void validateDocument;
void rel;
