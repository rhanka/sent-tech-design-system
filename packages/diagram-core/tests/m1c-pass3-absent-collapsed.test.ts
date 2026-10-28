/**
 * M1-c pass-3 RED witness: absent collapsed stays absent through undo.
 * English in code.
 */
import { describe, expect, it } from "vitest";

import {
  SCOPED_CONSTRAINTS_ADAPTER,
  applyInverse,
  applyTransaction,
  bindingRowFor,
  canonicalise,
  createProfileRegistry,
  createView,
  occurrenceRef,
  text,
  generic2Profile,
  entityRef,
  relationRef,
  viewRef,
  type SemanticDocument,
  type ViewDocument,
} from "../src/index.js";
import { baseDocument, ent, rel } from "./m3-helpers.js";

function probeSetup(): {
  document: SemanticDocument;
  retained: ViewDocument;
  options: { registry: ReturnType<typeof createProfileRegistry>; bindings: { schemaVersion: "1"; rows: ReturnType<typeof bindingRowFor>[] } };
} {
  const base = baseDocument(["generic@2"]);
  const document: SemanticDocument = {
    ...base,
    revision: 1,
    entities: {
      "entity:O": ent("O", "generic@2", "container", { name: text("O") }),
      "entity:I": ent("I", "generic@2", "container", { name: text("I") }),
      "entity:A": ent("A", "generic@2", "node", { name: text("A") }),
      "entity:B": ent("B", "generic@2", "node", { name: text("B") }),
    },
    relations: {
      "relation:oi": rel("oi", "generic@2", "contains", [
        { role: "parent", target: "entity:O" },
        { role: "child", target: "entity:I" },
      ]),
      "relation:ia": rel("ia", "generic@2", "contains", [
        { role: "parent", target: "entity:I" },
        { role: "child", target: "entity:A" },
      ]),
      "relation:ob": rel("ob", "generic@2", "contains", [
        { role: "parent", target: "entity:O" },
        { role: "child", target: "entity:B" },
      ]),
      "relation:ab": rel("ab", "generic@2", "link", [
        { role: "source", target: "entity:A" },
        { role: "target", target: "entity:B" },
      ]),
    },
    ports: {},
  };
  const registry = createProfileRegistry([generic2Profile]);
  const options = {
    registry,
    bindings: {
      schemaVersion: "1" as const,
      rows: [bindingRowFor(generic2Profile, SCOPED_CONSTRAINTS_ADAPTER)],
    },
  };
  const retained: ViewDocument = {
    ...createView({ viewId: viewRef("p"), semanticDocumentId: document.documentId }),
    revision: 1,
    entityOccurrences: {
      "occurrence:O": { id: occurrenceRef("O"), entity: entityRef("O"), geometry: { x: 0, y: 0, width: 460, height: 200 } },
      "occurrence:I": {
        id: occurrenceRef("I"),
        entity: entityRef("I"),
        geometry: { x: 0, y: 0, width: 460, height: 200 },
        group: "go",
      },
      "occurrence:A": {
        id: occurrenceRef("A"),
        entity: entityRef("A"),
        geometry: { x: 0, y: 0, width: 460, height: 200 },
        group: "gi",
      },
      "occurrence:B": {
        id: occurrenceRef("B"),
        entity: entityRef("B"),
        geometry: { x: 0, y: 0, width: 460, height: 200 },
        group: "go",
      },
    },
    relationOccurrences: {
      "occurrence:ab": {
        id: occurrenceRef("ab"),
        relation: relationRef("ab"),
        endpoints: [
          { role: "source", occurrence: occurrenceRef("A") },
          { role: "target", occurrence: occurrenceRef("B") },
        ],
      },
    },
    groups: {
      go: { id: "go", occurrence: occurrenceRef("O"), collapsed: false },
      gi: { id: "gi", occurrence: occurrenceRef("I"), collapsed: false },
    },
  };
  return { document, retained, options };
}

describe("absent collapsed stays absent through undo", () => {
  it("replacement and inverse restore the exact optional-field bytes", () => {
    const { document, retained, options } = probeSetup();
    const withoutCollapsed: ViewDocument = {
      ...retained,
      groups: {
        go: { id: "go", occurrence: occurrenceRef("O") },
        gi: { id: "gi", occurrence: occurrenceRef("I") },
      },
    };
    const before = canonicalise(withoutCollapsed);
    expect("collapsed" in withoutCollapsed.groups["go"]!).toBe(false);
    const replaced = applyTransaction(
      { document, views: { [withoutCollapsed.viewId]: withoutCollapsed } },
      {
        commandId: "collapse-absent",
        baseRevision: 1,
        commands: [{ kind: "replace-view", view: withoutCollapsed.viewId, source: withoutCollapsed, collapsed: [occurrenceRef("O")] }],
      },
      options,
    );
    expect(replaced.status).toBe("applied");
    if (replaced.status !== "applied") return;
    expect(replaced.inverse.kind).toBe("invertible");
    if (replaced.inverse.kind !== "invertible") return;
    const undone = applyInverse(replaced.state, replaced.inverse, { commandId: "undo-collapse-absent" }, options);
    expect(undone.status).toBe("applied");
    if (undone.status !== "applied") return;
    const restored = undone.state.views[withoutCollapsed.viewId];
    expect(restored).toBeDefined();
    if (restored === undefined) return;
    expect(canonicalise(restored)).toBe(before);
    expect("collapsed" in restored.groups["go"]!).toBe(false);
    expect("collapsed" in restored.groups["gi"]!).toBe(false);
  });
});
