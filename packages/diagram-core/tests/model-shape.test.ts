/**
 * What the document and the view CONTAIN, and what they must never contain
 * (SPEC 3.3 and 3.4).
 *
 * Exclusions are asserted structurally, because "the type has no `x` field" is
 * only true until someone adds one: the field sets are exported constants, and a
 * new key on either shape fails here.
 */
import { describe, expect, it } from "vitest";

import {
  CURRENT_SCHEMA_VERSION,
  DEFAULT_PRESENTATION,
  GENERIC_PROFILE_ID,
  SEMANTIC_DOCUMENT_FIELDS,
  VIEW_DOCUMENT_FIELDS,
  createDocument,
  createState,
  createView,
  defaultProfileRegistry,
  documentRef,
  entityRef,
  formatDiagnostics,
  sameExtensionIdentity,
  scopeTargetOf,
  tryCanonicalise,
  validateDocument,
  validateState,
  viewOf,
  viewRef,
  viewRefsOf,
  type SemanticDocument,
} from "../src/index.js";
import { readFixture, stateOf } from "./fixtures.js";

const registry = defaultProfileRegistry;

describe("the semantic document", () => {
  const document = createDocument({ documentId: documentRef("shape"), profileRefs: [GENERIC_PROFILE_ID] });

  it("has exactly the declared fields, freshly created and as a fixture", () => {
    expect(Object.keys(document).sort()).toEqual([...SEMANTIC_DOCUMENT_FIELDS]);
    const fixture = stateOf(readFixture("valid/generic-state.json"));
    expect(Object.keys(fixture.document).sort()).toEqual([...SEMANTIC_DOCUMENT_FIELDS]);
  });

  it("excludes positions, camera, components and z-order BY NAME", () => {
    for (const excluded of ["positions", "camera", "geometry", "z", "components", "scene", "transform"]) {
      expect(SEMANTIC_DOCUMENT_FIELDS as readonly string[]).not.toContain(excluded);
    }
  });

  it("starts at the current schema version, revision 0, with nothing in it", () => {
    expect(document.schemaVersion).toEqual(CURRENT_SCHEMA_VERSION);
    expect(document.revision).toBe(0);
    expect(document.entities).toEqual({});
    expect(formatDiagnostics(validateDocument(document, { registry }))).toBe("");
  });

  it("cannot carry a function, even through an attribute", () => {
    const withFunction = {
      ...document,
      entities: {
        "entity:a": {
          id: entityRef("a"),
          profile: GENERIC_PROFILE_ID,
          type: "node",
          attributes: { name: { kind: "text", value: "A" }, computed: () => 1 },
        },
      },
    } as unknown as SemanticDocument;
    const codes = validateDocument(withFunction, { registry }).map((entry) => entry.code);
    // Two independent refusals: the attribute is not in the schema, AND the
    // value is not serialisable. Either one alone would be enough.
    expect(codes).toContain("attribute-not-in-schema");
    expect(codes).toContain("value-not-serialisable");
    expect(tryCanonicalise(withFunction).ok).toBe(false);
  });

  it("identifies an extension by namespace, schema version and scope", () => {
    const left = {
      namespace: "urn:x",
      schemaVersion: "1",
      scope: { kind: "entity", target: entityRef("a") },
      validation: "preserved-unvalidated",
      contentHash: "fnv1a64:0000000000000000",
    } as const;
    expect(sameExtensionIdentity(left, { ...left })).toBe(true);
    expect(sameExtensionIdentity(left, { ...left, schemaVersion: "2" })).toBe(false);
    expect(sameExtensionIdentity(left, { ...left, scope: { kind: "entity", target: entityRef("b") } })).toBe(false);
    expect(scopeTargetOf(left.scope)).toBe("entity:a");
    expect(scopeTargetOf({ kind: "document" })).toBeUndefined();
  });
});

describe("the view document", () => {
  const document = createDocument({ documentId: documentRef("shape"), profileRefs: [GENERIC_PROFILE_ID] });
  const view = createView({ viewId: viewRef("v"), semanticDocumentId: document.documentId });

  it("has exactly the declared fields, freshly created and as a fixture", () => {
    expect(Object.keys(view).sort()).toEqual([...VIEW_DOCUMENT_FIELDS]);
    const fixture = stateOf(readFixture("valid/generic-state.json"));
    for (const candidate of Object.values(fixture.views)) {
      expect(Object.keys(candidate).sort()).toEqual([...VIEW_DOCUMENT_FIELDS]);
    }
  });

  it("excludes transient state BY NAME", () => {
    for (const excluded of ["hover", "hovered", "selection", "selected", "dragging", "marquee", "focus"]) {
      expect(VIEW_DOCUMENT_FIELDS as readonly string[]).not.toContain(excluded);
    }
  });

  it("persists a camera and nothing a renderer owns", () => {
    expect(DEFAULT_PRESENTATION).toEqual({ camera: { x: 0, y: 0, zoom: 1 } });
    expect(Object.keys(view.presentation.camera).sort()).toEqual(["x", "y", "zoom"]);
  });

  it("refuses a view that points at another document", () => {
    const other = createView({ viewId: viewRef("v2"), semanticDocumentId: documentRef("elsewhere") });
    const codes = validateState({ document, views: { "view:v2": other } }, { registry }).map((entry) => entry.code);
    expect(codes).toContain("view-document-mismatch");
  });

  it("keys views by their own reference", () => {
    const state = createState(document, [view]);
    expect(viewRefsOf(state)).toEqual(["view:v"]);
    expect(viewOf(state, viewRef("v"))).toBe(view);
    expect(viewOf(state, viewRef("absent"))).toBeUndefined();
    expect(() => createState(document, [view, view])).toThrow(/given twice/);
  });

  it("refuses a state whose record key is not the view's id", () => {
    const codes = validateState({ document, views: { "view:wrong-key": view } }, { registry }).map(
      (entry) => entry.code,
    );
    expect(codes).toContain("record-key-mismatch");
  });
});
