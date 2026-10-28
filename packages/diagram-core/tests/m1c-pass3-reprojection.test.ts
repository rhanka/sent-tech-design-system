/**
 * M1-c pass-3 RED witness: removal reprojects a previously internal relation.
 * English in code.
 */
import { describe, expect, it } from "vitest";

import {
  SCOPED_CONSTRAINTS_ADAPTER,
  applyTransaction,
  bindingRowFor,
  canonicalise,
  createProfileRegistry,
  createView,
  foldedScene,
  projectView,
  text,
  validateView,
  generic2Profile,
  entityRef,
  occurrenceRef,
  relationRef,
  viewRef,
  type SemanticDocument,
  type ViewDocument,
} from "../src/index.js";
import { baseDocument, ent, rel } from "./m3-helpers.js";

function probeSetup(): {
  document: SemanticDocument;
  retained: ViewDocument;
  folded: ViewDocument;
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
  const folded = projectView(document, retained, [occurrenceRef("O")]);
  return { document, retained, folded, options };
}

function independentRemovedSource(retained: ViewDocument): ViewDocument {
  const { ["occurrence:I"]: _dropped, ...keptOccurrences } = retained.entityOccurrences;
  void _dropped;
  const { gi: _gi, ...keptGroups } = retained.groups;
  void _gi;
  const keptA = keptOccurrences["occurrence:A"];
  let nextOccurrences = keptOccurrences;
  if (keptA !== undefined && "group" in keptA) {
    const { group: _group, ...rest } = keptA;
    void _group;
    nextOccurrences = { ...keptOccurrences, ["occurrence:A"]: rest as typeof keptA };
  }
  return { ...retained, revision: 2, entityOccurrences: nextOccurrences, groups: keptGroups };
}

describe("previously internal relation is reprojected after removal", () => {
  it("remove-occurrence equals a fresh projectView of the retained source", () => {
    const { document, retained, folded, options } = probeSetup();
    expect(validateView(folded, document, options)).toEqual([]);
    const removed = applyTransaction(
      { document, views: { [folded.viewId]: folded } },
      {
        commandId: "remove-inner",
        baseRevision: 1,
        commands: [{ kind: "remove-occurrence", view: folded.viewId, occurrence: occurrenceRef("I") }],
      },
      options,
    );
    expect(removed.status).toBe("applied");
    if (removed.status !== "applied") return;
    const actual = removed.state.views[folded.viewId];
    expect(actual).toBeDefined();
    if (actual === undefined) return;
    const fresh = projectView(removed.state.document, independentRemovedSource(retained), [occurrenceRef("O")]);
    expect(canonicalise(actual.relationOccurrences)).toBe(canonicalise(fresh.relationOccurrences));
    expect(canonicalise(foldedScene(actual, removed.state.document))).toBe(
      canonicalise(foldedScene(fresh, removed.state.document)),
    );
    expect(validateView(actual, removed.state.document, options)).toEqual([]);
  });

  it("semantic delete-entity with cascade equals a fresh projectView of the retained source", () => {
    const { document, retained, folded, options } = probeSetup();
    expect(validateView(folded, document, options)).toEqual([]);
    const removed = applyTransaction(
      { document, views: { [folded.viewId]: folded } },
      {
        commandId: "remove-semantic-inner",
        baseRevision: 1,
        commands: [
          {
            kind: "delete-entity",
            entity: entityRef("I"),
            policy: { occurrences: "cascade", relations: "cascade", ports: "cascade" },
          },
        ],
      },
      options,
    );
    expect(removed.status).toBe("applied");
    if (removed.status !== "applied") return;
    const actual = removed.state.views[folded.viewId];
    expect(actual).toBeDefined();
    if (actual === undefined) return;
    const fresh = projectView(removed.state.document, independentRemovedSource(retained), [occurrenceRef("O")]);
    expect(canonicalise(actual.relationOccurrences)).toBe(canonicalise(fresh.relationOccurrences));
    expect(canonicalise(foldedScene(actual, removed.state.document))).toBe(
      canonicalise(foldedScene(fresh, removed.state.document)),
    );
    expect(validateView(actual, removed.state.document, options)).toEqual([]);
  });
});
