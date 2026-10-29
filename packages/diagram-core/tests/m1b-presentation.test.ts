/**
 * M1-b RED tests — diagram-presentation@1 contract, typed presentation join
 * and view validation (folds and measurement excluded).
 *
 * Each test below fails before the M1-b implementation and passes after it.
 * No archimate@2/uml@2, no folds, no measurement, no migrations.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/presentation-catalog.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/presentation-catalog.js")>();
  return { ...actual, resolveGovernedCatalog: vi.fn(actual.resolveGovernedCatalog) };
});

import {
  bindingRowFor,
  canonicalBytes,
  contentDiagramDigest,
  createProfileRegistry,
  generic2Profile,
  genericProfile,
  SCOPED_CONSTRAINTS_ADAPTER,
  sha256Hex,
  validateDocument,
  validateView,
  type SemanticDocument,
} from "../src/index.js";
import { resolveGovernedCatalog } from "../src/presentation-catalog.js";

beforeEach(() => {
  vi.mocked(resolveGovernedCatalog).mockReset();
});
import { baseDocument, ent, rel, scopedOptions, validGeneric2Document } from "./m3-helpers.js";
import { text } from "../src/index.js";

const CONTRACT_DIGEST = "74dadb9c31fff7653ca31692d8db3cfea782baea8d9268a3c20982ea8ab0aeae";
const SCHEMA_DIGEST = "f13d595793e17e1e4740c9203b19d8381fc55b90e37121d61f5037cb79f0281a";
const GENERIC2_DIGEST = "cb103606707577720eba48570c0e49aadd209d8e51a9a0bc2c725b7434f79283";

describe("M1-b contract artifact", () => {
  it("ships diagram-presentation@1 with the Engram-governed contentDigest", async () => {
    const mod = (await import("../src/index.js")) as Record<string, unknown>;
    const pin = mod["DIAGRAM_PRESENTATION_CONTRACT_PIN"] as
      | { id: string; version: string; contentDigest: string }
      | undefined;
    expect(pin).toEqual({ id: "diagram-presentation", version: "1", contentDigest: CONTRACT_DIGEST });
  });

  it("binds exactly artifactKind contract with schemaPin and compatibilityMatrixVersion 1", async () => {
    const mod = (await import("../src/index.js")) as Record<string, unknown>;
    const binding = mod["DIAGRAM_PRESENTATION_BINDING"] as unknown;
    const schemaPin = mod["DIAGRAM_PRESENTATION_SCHEMA_PIN"] as unknown;
    expect(binding).toEqual({
      artifactKind: "contract",
      schemaPin,
      compatibilityMatrixVersion: "1",
    });
    expect(Object.keys(binding as Record<string, unknown>).sort()).toEqual([
      "artifactKind",
      "compatibilityMatrixVersion",
      "schemaPin",
    ]);
  });

  it("is a mechanism-descriptor contract, not a diagram profile", async () => {
    const mod = (await import("../src/index.js")) as Record<string, unknown>;
    expect(mod["DIAGRAM_PRESENTATION_PROFILE_SHAPE"]).toBe("mechanism-descriptor");
    expect(mod["DIAGRAM_PRESENTATION_ARTIFACT_KIND"]).toBe("contract");
  });

  it("never accepts the contract in SemanticDocument.profileRefs", () => {
    const registry = createProfileRegistry([genericProfile, generic2Profile]);
    const document: SemanticDocument = {
      ...baseDocument(["generic@2", "diagram-presentation@1" as never]),
    };
    const diagnostics = validateDocument(document, { registry });
    expect(diagnostics.length).toBeGreaterThan(0);
  });

  it("ships the Engram-governed schema digest", async () => {
    const mod = (await import("../src/index.js")) as Record<string, unknown>;
    expect(mod["DIAGRAM_PRESENTATION_SCHEMA_DIGEST"]).toBe(SCHEMA_DIGEST);
    const pin = mod["DIAGRAM_PRESENTATION_SCHEMA_PIN"] as {
      id: string;
      version: string;
      contentDigest: string;
    };
    expect(pin).toEqual({
      id: "diagram-presentation-schema",
      version: "1",
      contentDigest: SCHEMA_DIGEST,
    });
  });

  it("computes the contract digest from the descriptor preimage", async () => {
    const mod = (await import("../src/index.js")) as Record<string, unknown>;
    const descriptor = mod["DIAGRAM_PRESENTATION_CONTRACT_DESCRIPTOR"] as unknown;
    expect(sha256Hex(canonicalBytes(descriptor))).toBe(CONTRACT_DIGEST);
  });

  it("never lists the contract in family lineage or semantic P-PINS layers", async () => {
    const mod = (await import("../src/index.js")) as Record<string, unknown>;
    const record = mod["DIAGRAM_PRESENTATION_RECORD"] as {
      lineage: { parents: readonly unknown[] };
    };
    expect(record.lineage.parents).toEqual([]);
    const bindings = mod["shippedExecutorBindings"] as
      | { rows: readonly { profileId: string }[] }
      | undefined;
    if (bindings !== undefined) {
      expect(bindings.rows.map((row) => row.profileId)).not.toContain("diagram-presentation@1");
    }
    const retained = mod["retainedExecutorBindings"] as
      | { rows: readonly { profileId: string }[] }
      | undefined;
    if (retained !== undefined) {
      expect(retained.rows.map((row) => row.profileId)).not.toContain("diagram-presentation@1");
    }
  });
});

describe("M1-b types", () => {
  it("keeps camera/grid/theme unchanged and adds optional diagram", async () => {
    const mod = (await import("../src/index.js")) as Record<string, unknown>;
    expect(typeof mod["DIAGRAM_PRESENTATION_CONTRACT_PIN"]).toBe("object");
    const { createView } = (await import("../src/index.js")) as typeof import("../src/index.js");
    const { documentRef, viewRef } = (await import("../src/index.js")) as typeof import("../src/index.js");
    const view = createView({ viewId: viewRef("t"), semanticDocumentId: documentRef("d") });
    expect(view.presentation.camera).toEqual({ x: 0, y: 0, zoom: 1 });
    expect("diagram" in view.presentation).toBe(false);
  });

  it("carries strokeStyle only on RelationOccurrence and preserves absence", async () => {
    const { createView, serialiseView } = (await import("../src/index.js")) as typeof import("../src/index.js");
    const { documentRef, viewRef } = (await import("../src/index.js")) as typeof import("../src/index.js");
    const view = createView({ viewId: viewRef("t"), semanticDocumentId: documentRef("d") });
    const withAbsent = {
      ...view,
      relationOccurrences: {
        "occurrence:r": {
          id: "occurrence:r" as never,
          relation: "relation:r" as never,
          endpoints: [],
        },
      },
    };
    const withSolid = {
      ...view,
      relationOccurrences: {
        "occurrence:r": {
          id: "occurrence:r" as never,
          relation: "relation:r" as never,
          endpoints: [],
          strokeStyle: "solid" as const,
        },
      },
    };
    expect(serialiseView(withAbsent as never)).not.toContain("strokeStyle");
    expect(serialiseView(withSolid as never)).toContain('"strokeStyle":"solid"');
  });
});

describe("M1-b P-GEN witness", () => {
  it("applies then validates with empty diagnostics and stable semantic bytes", async () => {
    const mod = (await import("../src/index.js")) as unknown as {
      applyPresentation: (input: unknown, options: unknown) => unknown;
      DIAGRAM_PRESENTATION_CONTRACT_PIN: { id: string; version: string; contentDigest: string };
      DIAGRAM_PRESENTATION_SCHEMA_PIN: { id: string; version: string; contentDigest: string };
      familyPinForProfile: (profile: unknown) => { id: string; version: string; contentDigest: string };
    };
    const document = validGeneric2Document();
    const before = canonicalBytes(document);
    const revision = document.revision;
    const semanticDigest = contentDiagramDigest(generic2Profile);
    const { createView, documentRef, viewRef, occurrenceRef, entityRef } = (await import(
      "../src/index.js"
    )) as typeof import("../src/index.js");
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
            "occurrence:n": {
              form: "card",
              text: {},
              categoryRef: entityRef("k1"),
            },
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
    const doc2: SemanticDocument = {
      ...document,
      entities: {
        ...document.entities,
        "entity:n": ent("n", "generic@2", "node", { name: text("N") }),
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
      schemaPin: mod.DIAGRAM_PRESENTATION_SCHEMA_PIN,
    };
    const input = {
      familyPins: [familyPin],
      semanticDocument: doc2,
      sourceView,
      contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
      semanticCategoryPins: [],
      adapterPin,
    };
    vi.mocked(resolveGovernedCatalog).mockReturnValue(catalog as never);
    const out = mod.applyPresentation(input, scopedOptions([generic2Profile])) as
      | { outcome: "ok"; view: unknown; presentationDigest: string; diagnostics: readonly unknown[] }
      | { outcome: "refused"; diagnostics: readonly unknown[] };
    expect(out.outcome).toBe("ok");
    if (out.outcome !== "ok") return;
    expect(out.diagnostics).toEqual([]);
    expect(validateView(out.view as never, doc2 as never, scopedOptions([generic2Profile]))).toEqual([]);
    expect(canonicalBytes(doc2)).toBe(canonicalBytes({ ...doc2, revision }));
    expect(canonicalBytes(document)).toBe(before);
    expect(contentDiagramDigest(generic2Profile)).toBe(semanticDigest);
    expect(out.presentationDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(out.presentationDigest).toBe(sha256Hex(canonicalBytes((sourceView.presentation as { diagram: unknown }).diagram)));
  });

  it("changing only the icon changes only presentationDigest", async () => {
    const mod = (await import("../src/index.js")) as unknown as {
      applyPresentation: (input: unknown, options: unknown) => { outcome: string; presentationDigest?: string };
      DIAGRAM_PRESENTATION_CONTRACT_PIN: { id: string; version: string; contentDigest: string };
      DIAGRAM_PRESENTATION_SCHEMA_PIN: { id: string; version: string; contentDigest: string };
      familyPinForProfile: (profile: unknown) => { id: string; version: string; contentDigest: string };
    };
    const document = validGeneric2Document();
    const { createView, documentRef, viewRef, occurrenceRef, entityRef } = (await import(
      "../src/index.js"
    )) as typeof import("../src/index.js");
    const baseDiagram = {
      contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
      entities: {
        "occurrence:n": { form: "card", text: {}, icon: "window", categoryRef: entityRef("k1") },
        "occurrence:l": { form: "legend", text: {} },
        "occurrence:k": { form: "legend-key", text: {} },
        "occurrence:k2": { form: "legend-key", text: {} },
      },
      legends: { "occurrence:l": { order: [entityRef("k1"), entityRef("k2")] } },
      categoryTokens: [{ legendRef: entityRef("l"), category: "risk", token: "st-feedback-warning" }],
    };
    const doc2: SemanticDocument = {
      ...document,
      entities: { ...document.entities, "entity:n": ent("n", "generic@2", "node", { name: text("N") }) },
    };
    const viewFor = (diagram: unknown) => ({
      ...createView({ viewId: viewRef("gen"), semanticDocumentId: document.documentId }),
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
      presentation: { camera: { x: 0, y: 0, zoom: 1 }, diagram },
    });
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
      schemaPin: mod.DIAGRAM_PRESENTATION_SCHEMA_PIN,
    };
    vi.mocked(resolveGovernedCatalog).mockReturnValue(catalog as never);
    const run = (diagram: unknown) =>
      mod.applyPresentation(
        {
          familyPins: [familyPin],
          semanticDocument: doc2,
          sourceView: viewFor(diagram),
          contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
          semanticCategoryPins: [],
          adapterPin,
        } as never,
        scopedOptions([generic2Profile]),
      ) as { outcome: string; presentationDigest: string };
    const before = canonicalBytes(doc2);
    const first = run(baseDiagram);
    const second = run({
      ...baseDiagram,
      entities: {
        ...baseDiagram.entities,
        "occurrence:n": { form: "card", text: {}, icon: "star", categoryRef: entityRef("k1") },
      },
    });
    expect(first.outcome).toBe("ok");
    expect(second.outcome).toBe("ok");
    expect(second.presentationDigest).not.toBe(first.presentationDigest);
    expect(canonicalBytes(doc2)).toBe(before);
    expect(doc2.revision).toBe(document.revision);
  });
});

describe("M1-b view validation", () => {
  it("refuses unknown closed fields with presentation-shape-invalid", async () => {
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
          entities: {
            "occurrence:n": { form: "card", text: { kicker: 7 as never } },
          },
          legends: {},
          categoryTokens: [],
        },
      },
    };
    expect(validateView(view as never, document as never, scopedOptions([generic2Profile]))).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "presentation.diagram.entities.occurrence:n.text.kicker",
        message: "diagram presentation fails check presentation-shape-invalid",
        refs: [],
        details: { check: "presentation-shape-invalid" },
      },
    ]);
  });

  it("refuses a node drawn as container with form-selector-mismatch", async () => {
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
          entities: { "occurrence:n": { form: "container", text: {} } },
          legends: {},
          categoryTokens: [],
        },
      },
    };
    expect(validateView(view as never, document as never, scopedOptions([generic2Profile]))).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "presentation.diagram.entities.occurrence:n.form",
        message: "diagram presentation fails check form-selector-mismatch",
        refs: [],
        details: { check: "form-selector-mismatch" },
      },
    ]);
  });

  it("refuses an empty legend order with legend-order-invalid", async () => {
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
          legends: { "occurrence:l": { order: [] } },
          categoryTokens: [],
        },
      },
    };
    expect(validateView(view as never, document as never, scopedOptions([generic2Profile]))).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "presentation.diagram.legends.occurrence:l.order",
        message: "diagram presentation fails check legend-order-invalid",
        refs: [],
        details: { check: "legend-order-invalid" },
      },
    ]);
  });

  it("refuses duplicate category bindings with token-binding-conflict and no output", async () => {
    const mod = (await import("../src/index.js")) as unknown as {
      DIAGRAM_PRESENTATION_CONTRACT_PIN: { id: string; version: string; contentDigest: string };
      DIAGRAM_PRESENTATION_SCHEMA_PIN: { id: string; version: string; contentDigest: string };
      familyPinForProfile: (profile: unknown) => { id: string; version: string; contentDigest: string };
      applyPresentation: (input: unknown, options: unknown) => unknown;
    };
    const document = validGeneric2Document();
    const { createView, viewRef, occurrenceRef, entityRef } = (await import(
      "../src/index.js"
    )) as typeof import("../src/index.js");
    const diagram = {
      contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
      entities: {
        "occurrence:l": { form: "legend", text: {} },
        "occurrence:k": { form: "legend-key", text: {} },
        "occurrence:k2": { form: "legend-key", text: {} },
      },
      legends: { "occurrence:l": { order: [entityRef("k1"), entityRef("k2")] } },
      categoryTokens: [
        { legendRef: entityRef("l"), category: "risk", token: "st-feedback-warning" },
        { legendRef: entityRef("l"), category: "risk", token: "st-feedback-warning" },
      ],
    };
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
      presentation: { camera: { x: 0, y: 0, zoom: 1 }, diagram },
    };
    expect(validateView(view as never, document as never, scopedOptions([generic2Profile]))).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "presentation.diagram.categoryTokens[1]",
        message: "diagram presentation fails check token-binding-conflict",
        refs: [],
        details: { check: "token-binding-conflict" },
      },
    ]);
    const adapterBytes = "export const testPresentationAdapter = \"adapter\";\n";
    const adapterPin = {
      id: "test-presentation-adapter",
      version: "1",
      contentDigest: sha256Hex(adapterBytes),
    };
    const catalog = {
      compatibilityAdapter: `${adapterPin.id}@${adapterPin.version}#sha256=${adapterPin.contentDigest}`,
      adapterBytes,
      schemaPin: mod.DIAGRAM_PRESENTATION_SCHEMA_PIN,
    };
    vi.mocked(resolveGovernedCatalog).mockReturnValue(catalog as never);
    const out = mod.applyPresentation(
      {
        familyPins: [mod.familyPinForProfile(generic2Profile)],
        semanticDocument: document,
        sourceView: view,
        contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
        semanticCategoryPins: [],
        adapterPin,
      },
      scopedOptions([generic2Profile]),
    ) as { outcome: string; view?: unknown; diagnostics: readonly unknown[] };
    expect(out.outcome).toBe("refused");
    expect("view" in out).toBe(false);
  });

  it("refuses a wrong contract pin with presentation-pin-mismatch", async () => {
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
          contractPin: {
            id: "diagram-presentation",
            version: "1",
            contentDigest: "b".repeat(64),
          },
          entities: { "occurrence:n": { form: "card", text: {} } },
          legends: {},
          categoryTokens: [],
        },
      },
    };
    expect(validateView(view as never, document as never, scopedOptions([generic2Profile]))).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "presentation.diagram.contractPin",
        message: "diagram presentation fails check presentation-pin-mismatch",
        refs: [],
        details: { check: "presentation-pin-mismatch" },
      },
    ]);
    expect(mod.DIAGRAM_PRESENTATION_CONTRACT_PIN.contentDigest).toBe(
      "74dadb9c31fff7653ca31692d8db3cfea782baea8d9268a3c20982ea8ab0aeae",
    );
  });

  it("refuses a wrong adapter pin before any selector check", async () => {
    const mod = (await import("../src/index.js")) as unknown as {
      DIAGRAM_PRESENTATION_CONTRACT_PIN: { id: string; version: string; contentDigest: string };
      DIAGRAM_PRESENTATION_ADAPTER_PIN: { id: string; version: string; contentDigest: string };
      familyPinForProfile: (profile: unknown) => { id: string; version: string; contentDigest: string };
      applyPresentation: (input: unknown, options: unknown) => unknown;
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
          entities: { "occurrence:n": { form: "container", text: {} } },
          legends: {},
          categoryTokens: [],
        },
      },
    };
    const out = mod.applyPresentation(
      {
        familyPins: [mod.familyPinForProfile(generic2Profile)],
        semanticDocument: document,
        sourceView: view,
        contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
        semanticCategoryPins: [],
        adapterPin: {
          id: "fixture:executor",
          version: "1",
          contentDigest: "ab8bea23f592a350e1a668edc06320d9811816734788ad838dab04dbccac2eaa",
        },
      },
      scopedOptions([generic2Profile]),
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

  it("reports category-undeclared for an unknown category value", async () => {
    const mod = (await import("../src/index.js")) as unknown as {
      DIAGRAM_PRESENTATION_CONTRACT_PIN: { id: string; version: string; contentDigest: string };
    };
    const document = validGeneric2Document();
    const { createView, viewRef, occurrenceRef, entityRef } = (await import(
      "../src/index.js"
    )) as typeof import("../src/index.js");
    const doc2: SemanticDocument = {
      ...document,
      entities: {
        ...document.entities,
        "entity:n": ent("n", "generic@2", "node", { name: text("N"), category: text("risk") }),
      },
    };
    const view = {
      ...createView({ viewId: viewRef("v"), semanticDocumentId: doc2.documentId }),
      entityOccurrences: {
        ...Object.fromEntries(
          Object.entries({
            "occurrence:l": entityRef("l"),
            "occurrence:k1": entityRef("k1"),
            "occurrence:k2": entityRef("k2"),
            "occurrence:c": entityRef("c"),
          }).map(([occ, entity]) => [
            occ,
            {
              id: occ as never,
              entity,
              geometry: { x: 0, y: 0, width: 460, height: 200 },
            },
          ]),
        ),
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
            "occurrence:n": { form: "card", text: {} },
            "occurrence:l": { form: "legend", text: {} },
            "occurrence:k1": { form: "legend-key", text: {} },
            "occurrence:k2": { form: "legend-key", text: {} },
            "occurrence:c": { form: "container", text: {} },
          },
          legends: { "occurrence:l": { order: [entityRef("k1"), entityRef("k2")] } },
          categoryTokens: [],
        },
      },
    };
    expect(validateView(view as never, doc2 as never, scopedOptions([generic2Profile]))).toEqual([
      {
        code: "tone-category-unknown",
        severity: "error",
        path: "presentation.diagram.entities.occurrence:n.categoryRef",
        message: "category risk on occurrence occurrence:n is not declared by any legend in this document",
        refs: ["occurrence:n"],
        details: { value: "risk", legendBinding: "undeclared", categoryType: "legend-key" },
      },
    ]);
  });

  it("reports dangling-reference when generic@2 is absent from profileRefs", async () => {
    const mod = (await import("../src/index.js")) as unknown as {
      DIAGRAM_PRESENTATION_CONTRACT_PIN: { id: string; version: string; contentDigest: string };
      DIAGRAM_PRESENTATION_ADAPTER_PIN: { id: string; version: string; contentDigest: string };
      familyPinForProfile: (profile: unknown) => { id: string; version: string; contentDigest: string };
      applyPresentation: (input: unknown, options: unknown) => unknown;
    };
    const { createView, viewRef, occurrenceRef, entityRef } = (await import(
      "../src/index.js"
    )) as typeof import("../src/index.js");
    const document: SemanticDocument = {
      ...baseDocument(["generic@1"]),
      entities: {
        "entity:n": ent("n", "generic@1", "node", { name: text("N") }),
      },
    };
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
          entities: {
            "occurrence:n": { form: "card", text: {}, categoryRef: entityRef("k1") },
          },
          legends: {},
          categoryTokens: [],
        },
      },
    };
    const diagnostics = validateView(
      view as never,
      document as never,
      scopedOptions([genericProfile]),
    );
    expect(diagnostics).toEqual([
      {
        code: "dangling-reference",
        severity: "error",
        path: "presentation.diagram.entities.occurrence:n.categoryRef",
        message: "presentation reference entity:k1 does not resolve",
        refs: ["entity:k1"],
        details: {},
      },
    ]);
    const out = mod.applyPresentation(
      {
        familyPins: [{ id: "generic", version: "1.0.0", contentDigest: "x".repeat(64) }],
        semanticDocument: document,
        sourceView: view,
        contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
        semanticCategoryPins: [],
        adapterPin: mod.DIAGRAM_PRESENTATION_ADAPTER_PIN,
      },
      scopedOptions([genericProfile]),
    ) as { outcome: string };
    expect(out.outcome).toBe("refused");
  });

  it("refuses a semantic name redeclaration through a fragment stack", () => {
    const registry = createProfileRegistry([generic2Profile]);
    const document: SemanticDocument = {
      ...validGeneric2Document(),
      typeDefinitions: {
        frag: {
          id: "frag",
          profile: "generic@2",
          baseType: "node",
          attributes: [{ name: "name", kind: "text" }],
        },
      },
    };
    const diagnostics = validateDocument(document, {
      registry,
      bindings: {
        schemaVersion: "1",
        rows: [bindingRowFor(generic2Profile, SCOPED_CONSTRAINTS_ADAPTER)],
      },
    });
    expect(diagnostics).toEqual([
      {
        code: "type-definition-conflict",
        severity: "error",
        path: "typeDefinitions.frag.attributes.name",
        message:
          "type definition frag redeclares name, which base type node already declares; refinements are additive only",
        details: { attribute: "name", baseType: "node" },
      },
    ]);
  });

  it("refuses a cross-profile contains without join", () => {
    const registry = createProfileRegistry([genericProfile, generic2Profile]);
    const bindings = {
      schemaVersion: "1" as const,
      rows: [
        bindingRowFor(genericProfile, "legacy-constraints@1" as never),
        bindingRowFor(generic2Profile, SCOPED_CONSTRAINTS_ADAPTER),
      ],
    };
    const document: SemanticDocument = {
      ...baseDocument(["generic@2", "generic@1"]),
      entities: {
        "entity:c": ent("c", "generic@2", "container", { name: text("C") }),
        "entity:n": ent("n", "generic@1", "node", { name: text("N") }),
      },
      relations: {
        "relation:x": rel("x", "generic@2", "contains", [
          { role: "parent", target: "entity:c" },
          { role: "child", target: "entity:n" },
        ]),
      },
    };
    expect(validateDocument(document, { registry, bindings: bindings as never })).toEqual([
      {
        code: "endpoint-without-join",
        severity: "error",
        path: "relations.relation:x.endpoints[1].target",
        message:
          "relation relation:x applies generic@2 contains to entity entity:n owned by profile generic@1 with no admitted semantic join",
        refs: ["entity:n"],
        details: { profile: "generic@2", targetProfile: "generic@1" },
      },
    ]);
  });

  it("reports category-ambiguous, bound-target-not-legend and icon grammar byte-exact", async () => {
    const mod = (await import("../src/index.js")) as unknown as {
      DIAGRAM_PRESENTATION_CONTRACT_PIN: { id: string; version: string; contentDigest: string };
    };
    const { createView, viewRef, occurrenceRef, entityRef } = (await import(
      "../src/index.js"
    )) as typeof import("../src/index.js");
    const baseDoc = validGeneric2Document();
    const docAmbiguous: SemanticDocument = {
      ...baseDoc,
      entities: {
        ...baseDoc.entities,
        "entity:k3": ent("k3", "generic@2", "legend-key", {
          name: text("K3"),
          category: text("risk"),
        }),
        "entity:l2": ent("l2", "generic@2", "legend", { name: text("L2") }),
        "entity:n": ent("n", "generic@2", "node", { name: text("N"), category: text("risk") }),
      },
      relations: {
        ...baseDoc.relations,
        "relation:lk3": rel("lk3", "generic@2", "contains", [
          { role: "parent", target: "entity:l2" },
          { role: "child", target: "entity:k3" },
        ]),
      },
    };
    const viewAmbiguous = {
      ...createView({ viewId: viewRef("v"), semanticDocumentId: docAmbiguous.documentId }),
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
        "occurrence:l2": {
          id: occurrenceRef("l2"),
          entity: entityRef("l2"),
          geometry: { x: 0, y: 0, width: 460, height: 200 },
        },
        "occurrence:k1": {
          id: occurrenceRef("k1"),
          entity: entityRef("k1"),
          geometry: { x: 0, y: 0, width: 460, height: 200 },
        },
        "occurrence:k2": {
          id: occurrenceRef("k2"),
          entity: entityRef("k2"),
          geometry: { x: 0, y: 0, width: 460, height: 200 },
        },
        "occurrence:k3": {
          id: occurrenceRef("k3"),
          entity: entityRef("k3"),
          geometry: { x: 0, y: 0, width: 460, height: 200 },
        },
      },
      relationOccurrences: {},
      presentation: {
        camera: { x: 0, y: 0, zoom: 1 },
        diagram: {
          contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
          entities: {
            "occurrence:n": { form: "card", text: {} },
            "occurrence:l": { form: "legend", text: {} },
            "occurrence:l2": { form: "legend", text: {} },
            "occurrence:k1": { form: "legend-key", text: {} },
            "occurrence:k2": { form: "legend-key", text: {} },
            "occurrence:k3": { form: "legend-key", text: {} },
          },
          legends: {
            "occurrence:l": { order: [entityRef("k1"), entityRef("k2")] },
            "occurrence:l2": { order: [entityRef("k3")] },
          },
          categoryTokens: [
            { legendRef: entityRef("l"), category: "risk", token: "st-feedback-warning" },
            { legendRef: entityRef("l2"), category: "risk", token: "st-feedback-error" },
          ],
        },
      },
    };
    expect(
      validateView(viewAmbiguous as never, docAmbiguous as never, scopedOptions([generic2Profile])),
    ).toEqual([
      {
        code: "tone-category-unknown",
        severity: "error",
        path: "presentation.diagram.entities.occurrence:n.categoryRef",
        message:
          "category risk on occurrence occurrence:n resolves ambiguously across legends; set categoryRef to bind it",
        refs: ["occurrence:n"],
        details: { value: "risk", legendBinding: "ambiguous", categoryType: "legend-key" },
      },
    ]);

    const docWrong = validGeneric2Document();
    const viewWrong = {
      ...createView({ viewId: viewRef("v"), semanticDocumentId: docWrong.documentId }),
      entityOccurrences: {
        "occurrence:l": {
          id: occurrenceRef("l"),
          entity: entityRef("l"),
          geometry: { x: 0, y: 0, width: 460, height: 200 },
        },
        "occurrence:k1": {
          id: occurrenceRef("k1"),
          entity: entityRef("k1"),
          geometry: { x: 0, y: 0, width: 460, height: 200 },
        },
        "occurrence:k2": {
          id: occurrenceRef("k2"),
          entity: entityRef("k2"),
          geometry: { x: 0, y: 0, width: 460, height: 200 },
        },
        "occurrence:c": {
          id: occurrenceRef("c"),
          entity: entityRef("c"),
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
            "occurrence:k1": { form: "legend-key", text: {} },
            "occurrence:k2": { form: "legend-key", text: {} },
            "occurrence:c": { form: "container", text: {} },
          },
          legends: { "occurrence:l": { order: [entityRef("k1"), entityRef("k2")] } },
          categoryTokens: [{ legendRef: entityRef("c"), category: "risk", token: "x.y" }],
        },
      },
    };
    expect(validateView(viewWrong as never, docWrong as never, scopedOptions([generic2Profile]))).toEqual([
      {
        code: "tone-category-unknown",
        severity: "error",
        path: "presentation.diagram.categoryTokens[0].legendRef",
        message: "legendRef names entity:c, which is not a legend",
        refs: ["entity:c"],
        details: { value: "risk", legendBinding: "bound-target-not-legend", categoryType: "legend-key" },
      },
    ]);

    const docIcon = validGeneric2Document();
    const viewIcon = {
      ...createView({ viewId: viewRef("v"), semanticDocumentId: docIcon.documentId }),
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
          entities: { "occurrence:n": { form: "card", text: {}, icon: "Bad Icon!" } },
          legends: {},
          categoryTokens: [],
        },
      },
    };
    const iconDiagnostics = validateView(viewIcon as never, docIcon as never, scopedOptions([generic2Profile]));
    expect(iconDiagnostics).toEqual([
      {
        code: "text-pattern-mismatch",
        severity: "error",
        path: "presentation.diagram.entities.occurrence:n.icon",
        message: "value does not match the key grammar",
        refs: [],
        details: { pattern: "key", length: 9, maxLength: 40 },
      },
    ]);

    const docSubtitle = validGeneric2Document();
    const { createView: createView2, viewRef: viewRef2, occurrenceRef: occurrenceRef2 } = (await import(
      "../src/index.js"
    )) as typeof import("../src/index.js");
    const viewSubtitle = {
      ...createView2({ viewId: viewRef2("v"), semanticDocumentId: docSubtitle.documentId }),
      entityOccurrences: {
        "occurrence:n": {
          id: occurrenceRef2("n"),
          entity: (await import("../src/index.js")).entityRef("n"),
          geometry: { x: 0, y: 0, width: 460, height: 200 },
        },
      },
      relationOccurrences: {},
      presentation: {
        camera: { x: 0, y: 0, zoom: 1 },
        diagram: {
          contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
          entities: { "occurrence:n": { form: "card", text: { subtitle: "not for cards" } } },
          legends: {},
          categoryTokens: [],
        },
      },
    };
    expect(validateView(viewSubtitle as never, docSubtitle as never, scopedOptions([generic2Profile]))).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "presentation.diagram.entities.occurrence:n.text.subtitle",
        message: "diagram presentation fails check presentation-shape-invalid",
        refs: [],
        details: { check: "presentation-shape-invalid" },
      },
    ]);
  });

  it("keeps views without diagram exactly as on main and the generic@2 digest", async () => {
    expect(contentDiagramDigest(generic2Profile)).toBe(GENERIC2_DIGEST);
    const { createView, viewRef, occurrenceRef, entityRef } = (await import(
      "../src/index.js"
    )) as typeof import("../src/index.js");
    const document = validGeneric2Document();
    const view = {
      ...createView({ viewId: viewRef("plain"), semanticDocumentId: document.documentId }),
      entityOccurrences: {
        "occurrence:c": {
          id: occurrenceRef("c"),
          entity: entityRef("c"),
          geometry: { x: 0, y: 0, width: 460, height: 200 },
        },
      },
      relationOccurrences: {},
    };
    expect(validateView(view as never, document as never, scopedOptions([generic2Profile]))).toEqual([]);
  });
});
