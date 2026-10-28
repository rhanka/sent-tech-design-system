/**
 * M1-c pass-2 RED probes (must fail on 0e4a9c1f, pass after fix).
 * English in code.
 */
import { describe, expect, it } from "vitest";

import {
  applyInverse,
  applyTransaction,
  bindingRowFor,
  canonicalise,
  createProfileRegistry,
  createState,
  createView,
  documentRef,
  entityRef,
  occurrenceRef,
  portRef,
  projectView,
  relationRef,
  resolveSummaries,
  foldedScene,
  serialiseContent,
  validateView,
  viewRef,
  SCOPED_CONSTRAINTS_ADAPTER,
  LEGACY_CONSTRAINTS_ADAPTER,
  type DiagramState,
  type SemanticDocument,
  type ViewDocument,
} from "../src/index.js";
import { baseDocument, ent, rel, port, scopedOptions } from "./m3-helpers.js";
import { generic2Profile } from "../src/index.js";
import { text } from "../src/index.js";

const options = () => scopedOptions([generic2Profile]);

function foldDocument(): SemanticDocument {
  const base = baseDocument(["generic@2"]);
  return {
    ...base,
    revision: 1,
    entities: {
      "entity:MSGZ": ent("MSGZ", "generic@2", "container", { name: text("MSGZ") }),
      "entity:CHAT": ent("CHAT", "generic@2", "node", { name: text("CHAT") }),
      "entity:TOPIC": ent("TOPIC", "generic@2", "node", { name: text("TOPIC") }),
      "entity:SUB": ent("SUB", "generic@2", "node", { name: text("SUB") }),
    },
    relations: {
      "relation:contains-msgz-topic": rel("contains-msgz-topic", "generic@2", "contains", [
        { role: "parent", target: "entity:MSGZ" },
        { role: "child", target: "entity:TOPIC" },
      ]),
      "relation:contains-msgz-sub": rel("contains-msgz-sub", "generic@2", "contains", [
        { role: "parent", target: "entity:MSGZ" },
        { role: "child", target: "entity:SUB" },
      ]),
      "relation:link": rel("link", "generic@2", "link", [
        { role: "source", target: "entity:CHAT" },
        { role: "target", target: "entity:TOPIC" },
      ]),
    },
    ports: {},
  };
}

function foldSource(document: SemanticDocument): ViewDocument {
  const view = createView({ viewId: viewRef("fold"), semanticDocumentId: document.documentId });
  return {
    ...view,
    revision: document.revision,
    entityOccurrences: {
      "occurrence:CHAT": { id: occurrenceRef("CHAT"), entity: entityRef("CHAT"), geometry: { x: 1200, y: 240, width: 460, height: 200 } },
      "occurrence:MSGZ": { id: occurrenceRef("MSGZ"), entity: entityRef("MSGZ"), geometry: { x: 0, y: 0, width: 1000, height: 600 } },
      "occurrence:TOPIC": { id: occurrenceRef("TOPIC"), entity: entityRef("TOPIC"), geometry: { x: 40, y: 240, width: 460, height: 200 }, group: "grp.4.MSGZ" },
      "occurrence:SUB": { id: occurrenceRef("SUB"), entity: entityRef("SUB"), geometry: { x: 40, y: 500, width: 460, height: 200 }, group: "grp.4.MSGZ" },
    },
    relationOccurrences: {
      "occurrence:link": {
        id: occurrenceRef("link"),
        relation: relationRef("link"),
        endpoints: [
          { role: "source", occurrence: occurrenceRef("CHAT") },
          { role: "target", occurrence: occurrenceRef("TOPIC") },
        ],
      },
    },
    portOccurrences: {},
    groups: { "grp.4.MSGZ": { id: "grp.4.MSGZ", occurrence: occurrenceRef("MSGZ"), collapsed: false } },
    filters: [],
  };
}

describe("RED finding 1: undo restores complete removal closure", () => {
  function closureProfile(): typeof generic2Profile {
    return {
      ...generic2Profile,
      id: "relchain@2" as never,
      name: "relchain",
      entityTypes: [
        { id: "grouping", label: "Grouping", container: true, attributes: [{ name: "name", kind: "text", required: true, maxLength: 200 }] },
        { id: "business-actor", label: "Business actor", attributes: [{ name: "name", kind: "text", required: true, maxLength: 200 }] },
      ],
      relationTypes: [
        {
          id: "association",
          label: "Association",
          direction: "undirected",
          roles: [{ role: "source", cardinality: { min: 1, max: 1 }, targets: ["entity", "port", "relation"] as never[] }, { role: "target", cardinality: { min: 1, max: 1 }, targets: ["entity", "port", "relation"] as never[] }],
        },
        {
          id: "groupingContainment",
          label: "Grouping containment",
          direction: "directed",
          roles: [{ role: "parent", cardinality: { min: 1, max: 1 }, targets: ["entity"] }, { role: "child", cardinality: { min: 1, max: 1 }, targets: ["entity"] }],
          hierarchy: { id: "containment", shape: "tree", parentRole: "parent", childRole: "child" },
        },
      ],
      constraints: [{ kind: "hierarchy", relationType: "groupingContainment", hierarchyId: "containment", parentRole: "parent", childRole: "child" }],
      limits: {},
      notes: [],
    } as never;
  }
  function closureScene(): { document: SemanticDocument; folded: ViewDocument; scoped: ReturnType<typeof scopedOptions> } {
    const profile = closureProfile();
    const base = baseDocument(["relchain@2" as never]);
    const document: SemanticDocument = {
      ...base,
      revision: 1,
      entities: {
        "entity:OUTER": ent("OUTER", "relchain@2" as never, "grouping", { name: text("OUTER") }),
        "entity:INNER": ent("INNER", "relchain@2" as never, "grouping", { name: text("INNER") }),
        "entity:LEAF": ent("LEAF", "relchain@2" as never, "business-actor", { name: text("LEAF") }),
        "entity:EXT": ent("EXT", "relchain@2" as never, "business-actor", { name: text("EXT") }),
      },
      relations: {
        "relation:o-i": rel("o-i", "relchain@2" as never, "groupingContainment", [
          { role: "parent", target: "entity:OUTER" },
          { role: "child", target: "entity:INNER" },
        ]),
        "relation:i-l": rel("i-l", "relchain@2" as never, "groupingContainment", [
          { role: "parent", target: "entity:INNER" },
          { role: "child", target: "entity:LEAF" },
        ]),
        "relation:flow": rel("flow", "relchain@2" as never, "association", [
          { role: "source", target: "entity:EXT" },
          { role: "target", target: "entity:LEAF" },
        ]),
        "relation:rrel": rel("rrel", "relchain@2" as never, "association", [
          { role: "source", target: "entity:EXT" },
          { role: "target", target: "relation:flow" },
        ]),
      },
      ports: {},
    };
    const scoped = { registry: createProfileRegistry([profile as never]), bindings: { schemaVersion: "1" as const, rows: [bindingRowFor(profile as never, SCOPED_CONSTRAINTS_ADAPTER)] } };
    const view = createView({ viewId: viewRef("closure"), semanticDocumentId: document.documentId });
    const source: ViewDocument = {
      ...view,
      revision: 1,
      entityOccurrences: {
        "occurrence:OUTER": { id: occurrenceRef("OUTER"), entity: entityRef("OUTER"), geometry: { x: 0, y: 0, width: 1600, height: 900 } },
        "occurrence:INNER": { id: occurrenceRef("INNER"), entity: entityRef("INNER"), geometry: { x: 0, y: 0, width: 1000, height: 600 }, group: "grp.5.OUTER" },
        "occurrence:LEAF": { id: occurrenceRef("LEAF"), entity: entityRef("LEAF"), geometry: { x: 40, y: 240, width: 460, height: 200 }, group: "grp.5.INNER" },
        "occurrence:EXT": { id: occurrenceRef("EXT"), entity: entityRef("EXT"), geometry: { x: 1200, y: 240, width: 460, height: 200 } },
      },
      relationOccurrences: {
        "occurrence:flow": {
          id: occurrenceRef("flow"),
          relation: relationRef("flow"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("EXT") },
            { role: "target", occurrence: occurrenceRef("LEAF") },
          ],
        },
        "occurrence:r": {
          id: occurrenceRef("r"),
          relation: relationRef("rrel"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("EXT") },
            { role: "target", occurrence: occurrenceRef("flow") },
          ],
        },
      },
      portOccurrences: {},
      groups: {
        "grp.5.OUTER": { id: "grp.5.OUTER", occurrence: occurrenceRef("OUTER"), collapsed: false },
        "grp.5.INNER": { id: "grp.5.INNER", occurrence: occurrenceRef("INNER"), collapsed: false },
      },
      filters: [],
    };
    expect(validateView(source, document, scoped)).toEqual([]);
    const folded = projectView(document, source, [occurrenceRef("OUTER")]);
    expect(validateView(folded, document, scoped)).toEqual([]);
    return { document, folded, scoped };
  }

  it("remove-occurrence undo restores attaching occurrence:r", () => {
    const { document, folded, scoped } = closureScene();
    const state = createState(document, [folded]);
    const removed = applyTransaction(
      state,
      { commandId: "rm-inner", baseRevision: document.revision, commands: [{ kind: "remove-occurrence", view: folded.viewId, occurrence: occurrenceRef("INNER") }] } as never,
      scoped,
    );
    expect(removed.status).toBe("applied");
    if (removed.status !== "applied") return;
    const undone = applyInverse(removed.state, removed.inverse, { commandId: "undo-rm-inner" }, scoped);
    expect(undone.status).toBe("applied");
    if (undone.status !== "applied") return;
    expect(undone.state.views[folded.viewId]?.relationOccurrences["occurrence:r"]).toBeDefined();
    expect(canonicalise(undone.state.views[folded.viewId])).toBe(
      canonicalise({ ...folded, revision: undone.state.views[folded.viewId]!.revision }),
    );
  });

  it("semantic delete undo restores attaching occurrence:r", () => {
    const { document, folded, scoped } = closureScene();
    const state = createState(document, [folded]);
    const removed = applyTransaction(
      state,
      { commandId: "del-inner", baseRevision: document.revision, commands: [{ kind: "delete-entity", entity: entityRef("INNER"), policy: { occurrences: "cascade", relations: "cascade", ports: "cascade" } }] } as never,
      scoped,
    );
    expect(removed.status).toBe("applied");
    if (removed.status !== "applied") return;
    const undone = applyInverse(removed.state, removed.inverse, { commandId: "undo-del-inner" }, scoped);
    expect(undone.status).toBe("applied");
    if (undone.status !== "applied") return;
    expect(undone.state.views[folded.viewId]?.relationOccurrences["occurrence:r"]).toBeDefined();
  });
});

describe("RED findings 2+3+9: revision-preserving view replacement", () => {
  it("standalone summary edit keeps revision and semantic bytes", () => {
    const document = foldDocument();
    const source = foldSource(document);
    const state = createState(document, [source]);
    const before = canonicalise(document);
    const applied = applyTransaction(
      state,
      {
        commandId: "sum-edit",
        baseRevision: document.revision,
        commands: [
          {
            kind: "replace-view",
            view: source.viewId,
            source: { ...source, summaryLabels: { s1: { id: "s1", sourceOccurrence: occurrenceRef("CHAT"), targetOccurrence: occurrenceRef("MSGZ"), label: "hi", relationIds: [relationRef("link")] } } },
            collapsed: [],
          },
        ],
      } as never,
      options(),
    );
    expect(applied.status).toBe("applied");
    if (applied.status !== "applied") return;
    expect(applied.state.document.revision).toBe(document.revision);
    expect(canonicalise(applied.state.document)).toBe(before);
  });

  it("remove-and-recreate fold group yields projectView result", () => {
    const document = foldDocument();
    const source = foldSource(document);
    const state = createState(document, [source]);
    const collapsedSource: ViewDocument = {
      ...source,
      groups: { "grp.4.MSGZ": { id: "grp.4.MSGZ", occurrence: occurrenceRef("MSGZ"), collapsed: true } },
    };
    const applied = applyTransaction(
      state,
      { commandId: "fold-replace", baseRevision: document.revision, commands: [{ kind: "replace-view", view: source.viewId, source: collapsedSource, collapsed: [occurrenceRef("MSGZ")] }] } as never,
      options(),
    );
    expect(applied.status).toBe("applied");
    if (applied.status !== "applied") return;
    const expected = projectView(document, collapsedSource, [occurrenceRef("MSGZ")]);
    expect(canonicalise(applied.state.views[source.viewId])).toBe(canonicalise({ ...expected, revision: applied.state.views[source.viewId]!.revision }));
    expect(applied.state.views[source.viewId]?.relationOccurrences["occurrence:link"]?.endpoints[1]).toEqual({
      role: "target",
      occurrence: occurrenceRef("MSGZ"),
      semanticTarget: entityRef("TOPIC"),
      sourceOccurrence: occurrenceRef("TOPIC"),
    });
  });

  it("summaryLabels:{} round trip keeps presence", () => {
    const document = foldDocument();
    const source: ViewDocument = { ...foldSource(document), summaryLabels: {} };
    const state = createState(document, [source]);
    const withDef: ViewDocument = {
      ...source,
      summaryLabels: { s1: { id: "s1", sourceOccurrence: occurrenceRef("CHAT"), targetOccurrence: occurrenceRef("MSGZ"), label: "hi", relationIds: [relationRef("link")] } },
    };
    const applied = applyTransaction(
      state,
      { commandId: "sum-add", baseRevision: document.revision, commands: [{ kind: "replace-view", view: source.viewId, source: withDef, collapsed: [] }] } as never,
      options(),
    );
    expect(applied.status).toBe("applied");
    if (applied.status !== "applied") return;
    const undone = applyInverse(applied.state, applied.inverse, { commandId: "undo-sum-add" }, options());
    expect(undone.status).toBe("applied");
    if (undone.status !== "applied") return;
    expect("summaryLabels" in (undone.state.views[source.viewId] as object)).toBe(true);
    expect(undone.state.views[source.viewId]?.summaryLabels).toEqual({});
  });
});

describe("RED finding 4: occurrence deletion recomputes summary constituents", () => {
  function summaryDoc(): { document: SemanticDocument; source: ViewDocument } {
    const baseDoc = foldDocument();
    const document: SemanticDocument = {
      ...baseDoc,
      relations: {
        ...baseDoc.relations,
        "relation:r-solid": rel("r-solid", "generic@2", "link", [
          { role: "source", target: "entity:CHAT" },
          { role: "target", target: "entity:TOPIC" },
        ]),
        "relation:r-dashed": rel("r-dashed", "generic@2", "link", [
          { role: "source", target: "entity:CHAT" },
          { role: "target", target: "entity:SUB" },
        ]),
      },
    };
    const base = foldSource(document);
    const source: ViewDocument = {
      ...base,
      relationOccurrences: {
        "occurrence:r-solid": {
          id: occurrenceRef("r-solid"),
          relation: relationRef("r-solid"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("CHAT") },
            { role: "target", occurrence: occurrenceRef("TOPIC") },
          ],
        },
        "occurrence:r-dashed": {
          id: occurrenceRef("r-dashed"),
          relation: relationRef("r-dashed"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("CHAT") },
            { role: "target", occurrence: occurrenceRef("SUB") },
          ],
          strokeStyle: "dashed",
        },
      },
      summaryLabels: {
        "sum:explicit": {
          id: "sum:explicit",
          sourceOccurrence: occurrenceRef("CHAT"),
          targetOccurrence: occurrenceRef("MSGZ"),
          label: "Chat events",
          relationIds: [relationRef("r-solid")],
          relationOccurrences: [occurrenceRef("r-solid")],
          strokeStyle: "solid",
        },
        "sum:implicit": {
          id: "sum:implicit",
          sourceOccurrence: occurrenceRef("CHAT"),
          targetOccurrence: occurrenceRef("MSGZ"),
          label: "Implicit",
          relationIds: [relationRef("link")],
        },
      },
    };
    return { document, source };
  }

  it("removing sole implicit member drops definition and undoes byte-identically", () => {
    const base = baseDocument(["generic@2"]);
    const document: SemanticDocument = {
      ...base,
      revision: 1,
      entities: {
        "entity:CHAT": ent("CHAT", "generic@2", "node", { name: text("CHAT") }),
        "entity:MSGZ": ent("MSGZ", "generic@2", "container", { name: text("MSGZ") }),
        "entity:TOPIC": ent("TOPIC", "generic@2", "node", { name: text("TOPIC") }),
      },
      relations: {
        "relation:contains": rel("contains", "generic@2", "contains", [
          { role: "parent", target: "entity:MSGZ" },
          { role: "child", target: "entity:TOPIC" },
        ]),
        "relation:link": rel("link", "generic@2", "link", [
          { role: "source", target: "entity:CHAT" },
          { role: "target", target: "entity:TOPIC" },
        ]),
      },
      ports: {},
    };
    const view = createView({ viewId: viewRef("sole"), semanticDocumentId: document.documentId });
    const source: ViewDocument = {
      ...view,
      revision: 1,
      entityOccurrences: {
        "occurrence:CHAT": { id: occurrenceRef("CHAT"), entity: entityRef("CHAT"), geometry: { x: 0, y: 0, width: 460, height: 200 } },
        "occurrence:MSGZ": { id: occurrenceRef("MSGZ"), entity: entityRef("MSGZ"), geometry: { x: 0, y: 0, width: 1000, height: 600 } },
        "occurrence:TOPIC": { id: occurrenceRef("TOPIC"), entity: entityRef("TOPIC"), geometry: { x: 40, y: 240, width: 460, height: 200 }, group: "grp.4.MSGZ" },
      },
      relationOccurrences: {
        "occurrence:link": {
          id: occurrenceRef("link"),
          relation: relationRef("link"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("CHAT") },
            { role: "target", occurrence: occurrenceRef("TOPIC") },
          ],
        },
      },
      portOccurrences: {},
      groups: { "grp.4.MSGZ": { id: "grp.4.MSGZ", occurrence: occurrenceRef("MSGZ"), collapsed: false } },
      filters: [],
      summaryLabels: {
        "sum:sole": {
          id: "sum:sole",
          sourceOccurrence: occurrenceRef("CHAT"),
          targetOccurrence: occurrenceRef("MSGZ"),
          label: "sole",
          relationIds: [relationRef("link")],
        },
      },
    };
    expect(validateView(source, document, options())).toEqual([]);
    const state = createState(document, [source]);
    const removed = applyTransaction(
      state,
      { commandId: "rm-link", baseRevision: document.revision, commands: [{ kind: "remove-occurrence", view: source.viewId, occurrence: occurrenceRef("link") }] } as never,
      options(),
    );
    expect(removed.status).toBe("applied");
    if (removed.status !== "applied") return;
    expect(removed.state.views[source.viewId]?.summaryLabels ?? {}).toEqual({});
    expect(validateView(removed.state.views[source.viewId]!, removed.state.document, options())).toEqual([]);
    const undone = applyInverse(removed.state, removed.inverse, { commandId: "undo-rm-link" }, options());
    expect(undone.status).toBe("applied");
    if (undone.status !== "applied") return;
    expect(canonicalise(undone.state.views[source.viewId])).toBe(canonicalise({ ...source, revision: undone.state.views[source.viewId]!.revision }));
  });

  it("removing one of two explicit members prunes both sets", () => {
    const { document, source } = summaryDoc();
    const two: ViewDocument = {
      ...source,
      summaryLabels: {
        "sum:two": {
          id: "sum:two",
          sourceOccurrence: occurrenceRef("CHAT"),
          targetOccurrence: occurrenceRef("MSGZ"),
          label: "two",
          relationIds: [relationRef("r-dashed"), relationRef("r-solid")].sort() as never,
          relationOccurrences: [occurrenceRef("r-dashed"), occurrenceRef("r-solid")].sort() as never,
          strokeStyle: "solid",
        },
      },
    };
    // NOTE: solid+dashed never aggregate (heterogeneous styles); this probe uses two solid relations instead.
    const solidTwoDoc: SemanticDocument = {
      ...document,
      relations: {
        ...document.relations,
        "relation:r-second": rel("r-second", "generic@2", "link", [
          { role: "source", target: "entity:CHAT" },
          { role: "target", target: "entity:SUB" },
        ]),
      },
    };
    const solidTwo: ViewDocument = {
      ...source,
      relationOccurrences: {
        ...source.relationOccurrences,
        "occurrence:r-second": {
          id: occurrenceRef("r-second"),
          relation: relationRef("r-second"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("CHAT") },
            { role: "target", occurrence: occurrenceRef("SUB") },
          ],
        },
      },
      summaryLabels: {
        "sum:two": {
          id: "sum:two",
          sourceOccurrence: occurrenceRef("CHAT"),
          targetOccurrence: occurrenceRef("MSGZ"),
          label: "two",
          relationIds: [relationRef("r-second"), relationRef("r-solid")].sort() as never,
          relationOccurrences: [occurrenceRef("r-second"), occurrenceRef("r-solid")].sort() as never,
        },
      },
    };
    expect(validateView(solidTwo, solidTwoDoc, options())).toEqual([]);
    const state = createState(solidTwoDoc, [solidTwo]);
    const removed = applyTransaction(
      state,
      { commandId: "rm-one", baseRevision: solidTwoDoc.revision, commands: [{ kind: "remove-occurrence", view: solidTwo.viewId, occurrence: occurrenceRef("r-second") }] } as never,
      options(),
    );
    expect(removed.status).toBe("applied");
    if (removed.status !== "applied") return;
    expect(removed.state.views[solidTwo.viewId]?.summaryLabels?.["sum:two"]?.relationOccurrences).toEqual([occurrenceRef("r-solid")]);
    expect(removed.state.views[solidTwo.viewId]?.summaryLabels?.["sum:two"]?.relationIds).toEqual([relationRef("r-solid")]);
    const undone = applyInverse(removed.state, removed.inverse, { commandId: "undo-rm-one" }, options());
    expect(undone.status).toBe("applied");
    if (undone.status !== "applied") return;
    expect(canonicalise(undone.state.views[solidTwo.viewId])).toBe(canonicalise({ ...solidTwo, revision: undone.state.views[solidTwo.viewId]!.revision }));
  });
});

describe("RED finding 5: filters on drawn endpoints and relations", () => {
  it('hiddenByFilter ["occurrence:MSGZ"] excludes folded edge and deactivates summary', () => {
    const document = foldDocument();
    const source = foldSource(document);
    const withSummary: ViewDocument = {
      ...source,
      summaryLabels: {
        "sum:overview-chat": {
          id: "sum:overview-chat",
          sourceOccurrence: occurrenceRef("CHAT"),
          targetOccurrence: occurrenceRef("MSGZ"),
          label: "Chat events",
          relationIds: [relationRef("link")],
        },
      },
    };
    const folded = projectView(document, withSummary, [occurrenceRef("MSGZ")]);
    const scene = foldedScene(folded, document, [occurrenceRef("MSGZ")], { hiddenByFilter: [occurrenceRef("MSGZ")] });
    expect(scene.drawnRelations).not.toContain("occurrence:link");
    const active = resolveSummaries(folded, document, { filters: { hiddenByFilter: [occurrenceRef("MSGZ")] }, registry: options().registry });
    expect(active.size).toBe(0);
  });

  it('hiddenByFilter ["occurrence:link"] excludes folded edge and deactivates summary', () => {
    const document = foldDocument();
    const source = foldSource(document);
    const withSummary: ViewDocument = {
      ...source,
      summaryLabels: {
        "sum:overview-chat": {
          id: "sum:overview-chat",
          sourceOccurrence: occurrenceRef("CHAT"),
          targetOccurrence: occurrenceRef("MSGZ"),
          label: "Chat events",
          relationIds: [relationRef("link")],
        },
      },
    };
    const folded = projectView(document, withSummary, [occurrenceRef("MSGZ")]);
    const scene = foldedScene(folded, document, [occurrenceRef("MSGZ")], { hiddenByFilter: [occurrenceRef("link")] });
    expect(scene.drawnRelations).not.toContain("occurrence:link");
    const active = resolveSummaries(folded, document, { filters: { hiddenByFilter: [occurrenceRef("link")] }, registry: options().registry });
    expect(active.size).toBe(0);
  });
});

describe("RED finding 6: admitted adapter lookup", () => {
  it("rejected generic@1 -> scoped row leaves native dangling-reference", async () => {
    const mod = await import("../src/index.js");
    const genericProfile = (mod as Record<string, unknown>)["genericProfile"] as Parameters<typeof bindingRowFor>[0];
    const registry = createProfileRegistry([genericProfile]);
    const base = baseDocument(["generic@1"]);
    const document: SemanticDocument = {
      ...base,
      revision: 0,
      entities: {
        "entity:a": ent("a", "generic@1", "node", { name: text("a") }),
        "entity:b": ent("b", "generic@1", "node", { name: text("b") }),
      },
      relations: {
        "relation:r": rel("r", "generic@1", "link", [
          { role: "source", target: "entity:a" },
          { role: "target", target: "entity:b" },
        ]),
      },
      ports: {},
    };
    const view = createView({ viewId: viewRef("native"), semanticDocumentId: document.documentId });
    const native: ViewDocument = {
      ...view,
      revision: 0,
      entityOccurrences: {
        "occurrence:a": { id: occurrenceRef("a"), entity: entityRef("a"), geometry: { x: 0, y: 0, width: 460, height: 200 } },
        "occurrence:b": { id: occurrenceRef("b"), entity: entityRef("b"), geometry: { x: 600, y: 0, width: 460, height: 200 } },
      },
      relationOccurrences: {
        "occurrence:flow-1": {
          id: occurrenceRef("flow-1"),
          relation: relationRef("r"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("a") },
            { role: "target", occurrence: occurrenceRef("b") },
          ],
        },
        "occurrence:r2": {
          id: occurrenceRef("r2"),
          relation: relationRef("r"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("flow-1") },
            { role: "target", occurrence: occurrenceRef("b") },
          ],
        },
      },
      portOccurrences: {},
      groups: {},
      filters: [],
    };
    const rejected = { registry, bindings: { schemaVersion: "1" as const, rows: [bindingRowFor(genericProfile, SCOPED_CONSTRAINTS_ADAPTER)] } };
    expect(validateView(native, document, rejected)).toEqual([
      {
        code: "dangling-reference",
        severity: "error",
        path: "relationOccurrences.occurrence:r2.endpoints[0].occurrence",
        message: "occurrence:flow-1 is no entity or port occurrence of this view",
        refs: ["occurrence:flow-1"],
      },
    ]);
  });

  it("no table for retained @1 stays native", async () => {
    const mod = await import("../src/index.js");
    const registry = (mod as Record<string, unknown>)["defaultProfileRegistry"] as Parameters<typeof createProfileRegistry>[0] extends never ? never : import("../src/index.js").ProfileRegistry;
    void registry;
    const base = baseDocument(["generic@1"]);
    const document: SemanticDocument = {
      ...base,
      revision: 0,
      entities: {
        "entity:a": ent("a", "generic@1", "node", { name: text("a") }),
        "entity:b": ent("b", "generic@1", "node", { name: text("b") }),
      },
      relations: {
        "relation:r": rel("r", "generic@1", "link", [
          { role: "source", target: "entity:a" },
          { role: "target", target: "entity:b" },
        ]),
      },
      ports: {},
    };
    const view = createView({ viewId: viewRef("native"), semanticDocumentId: document.documentId });
    const native: ViewDocument = {
      ...view,
      revision: 0,
      entityOccurrences: {
        "occurrence:a": { id: occurrenceRef("a"), entity: entityRef("a"), geometry: { x: 0, y: 0, width: 460, height: 200 } },
        "occurrence:b": { id: occurrenceRef("b"), entity: entityRef("b"), geometry: { x: 600, y: 0, width: 460, height: 200 } },
      },
      relationOccurrences: {
        "occurrence:r2": {
          id: occurrenceRef("r2"),
          relation: relationRef("r"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("flow-1") },
            { role: "target", occurrence: occurrenceRef("b") },
          ],
        },
      },
      portOccurrences: {},
      groups: {},
      filters: [],
    };
    const { defaultProfileRegistry } = (await import("../src/index.js")) as typeof import("../src/index.js");
    expect(validateView(native, document, { registry: defaultProfileRegistry })).toEqual([
      {
        code: "dangling-reference",
        severity: "error",
        path: "relationOccurrences.occurrence:r2.endpoints[0].occurrence",
        message: "occurrence:flow-1 is no entity or port occurrence of this view",
        refs: ["occurrence:flow-1"],
      },
    ]);
  });
});

describe("RED findings 7+8: declared-role orientation", () => {
  it("reversed generic association activates with declared registry", () => {
    const base = baseDocument(["generic@2"]);
    const document: SemanticDocument = {
      ...base,
      revision: 1,
      entities: {
        "entity:C": ent("C", "generic@2", "container", { name: text("C") }),
        "entity:K": ent("K", "generic@2", "node", { name: text("K") }),
        "entity:X": ent("X", "generic@2", "node", { name: text("X") }),
      },
      relations: {
        "relation:ck": rel("ck", "generic@2", "contains", [
          { role: "parent", target: "entity:C" },
          { role: "child", target: "entity:K" },
        ]),
        "relation:ax": rel("ax", "generic@2", "association", [
          { role: "member", target: "entity:K" },
          { role: "member", target: "entity:X" },
        ]),
      },
      ports: {},
    };
    const view = createView({ viewId: viewRef("rev"), semanticDocumentId: document.documentId });
    const source: ViewDocument = {
      ...view,
      revision: 1,
      entityOccurrences: {
        "occurrence:C": { id: occurrenceRef("C"), entity: entityRef("C"), geometry: { x: 0, y: 0, width: 1000, height: 600 } },
        "occurrence:K": { id: occurrenceRef("K"), entity: entityRef("K"), geometry: { x: 40, y: 240, width: 460, height: 200 }, group: "grp.1.C" },
        "occurrence:X": { id: occurrenceRef("X"), entity: entityRef("X"), geometry: { x: 1200, y: 240, width: 460, height: 200 } },
      },
      relationOccurrences: {
        "occurrence:m": {
          id: occurrenceRef("m"),
          relation: relationRef("ax"),
          endpoints: [
            { role: "member", occurrence: occurrenceRef("K") },
            { role: "member", occurrence: occurrenceRef("X") },
          ],
        },
      },
      portOccurrences: {},
      groups: { "grp.1.C": { id: "grp.1.C", occurrence: occurrenceRef("C"), collapsed: false } },
      filters: [],
      summaryLabels: {
        srev: {
          id: "srev",
          sourceOccurrence: occurrenceRef("X"),
          targetOccurrence: occurrenceRef("C"),
          label: "reversed",
          relationIds: [relationRef("ax")],
        },
      },
    };
    expect(validateView(source, document, options())).toEqual([]);
    const folded = projectView(document, source, [occurrenceRef("C")]);
    expect(validateView(folded, document, options())).toEqual([]);
    expect(resolveSummaries(folded, document, { registry: options().registry }).get("(occurrence:C,occurrence:X,solid)")?.definitionId).toBe("srev");
  });

  it("reversed link endpoint array validates with same definition", () => {
    const document = foldDocument();
    const source = foldSource(document);
    const reversed: ViewDocument = {
      ...source,
      relationOccurrences: {
        "occurrence:link": {
          id: occurrenceRef("link"),
          relation: relationRef("link"),
          endpoints: [
            { role: "target", occurrence: occurrenceRef("TOPIC") },
            { role: "source", occurrence: occurrenceRef("CHAT") },
          ],
        },
      },
      summaryLabels: {
        s1: {
          id: "s1",
          sourceOccurrence: occurrenceRef("CHAT"),
          targetOccurrence: occurrenceRef("MSGZ"),
          label: "Chat events",
          relationIds: [relationRef("link")],
        },
      },
    };
    expect(validateView(reversed, document, options())).toEqual([]);
  });
});

describe("finding 10: frozen C.6 negatives replayed literally", () => {
  function frozenBase(): { document: SemanticDocument; viewId: ReturnType<typeof viewRef> } {
    const base = baseDocument(["generic@2"]);
    const document: SemanticDocument = {
      ...base,
      revision: 1,
      entities: {
        "entity:C": ent("C", "generic@2", "container", { name: text("C") }),
        "entity:Z": ent("Z", "generic@2", "container", { name: text("Z") }),
        "entity:X": ent("X", "generic@2", "node", { name: text("X") }),
        "entity:K": ent("K", "generic@2", "node", { name: text("K") }),
        "entity:A1": ent("A1", "generic@2", "node", { name: text("A1") }),
        "entity:OUTER": ent("OUTER", "generic@2", "container", { name: text("OUTER") }),
      },
      relations: {
        "relation:r": rel("r", "generic@2", "link", [
          { role: "source", target: "entity:C" },
          { role: "target", target: "entity:Z" },
        ]),
        "relation:ck": rel("ck", "generic@2", "contains", [
          { role: "parent", target: "entity:C" },
          { role: "child", target: "entity:K" },
        ]),
        "relation:za1": rel("za1", "generic@2", "contains", [
          { role: "parent", target: "entity:Z" },
          { role: "child", target: "entity:A1" },
        ]),
      },
      ports: {},
    };
    return { document, viewId: viewRef("frozen") };
  }

  it("provenance-missing", () => {
    const { document, viewId } = frozenBase();
    const view = createView({ viewId, semanticDocumentId: document.documentId });
    const bad: ViewDocument = {
      ...view,
      revision: 1,
      entityOccurrences: {
        "occurrence:C": { id: occurrenceRef("C"), entity: entityRef("C"), geometry: { x: 0, y: 0, width: 460, height: 200 } },
        "occurrence:Z": { id: occurrenceRef("Z"), entity: entityRef("Z"), geometry: { x: 600, y: 0, width: 460, height: 200 } },
      },
      relationOccurrences: {
        "occurrence:r": {
          id: occurrenceRef("r"),
          relation: relationRef("r"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("C") },
            { role: "target", occurrence: occurrenceRef("Z"), semanticTarget: entityRef("Z") } as never,
          ],
        },
      },
      portOccurrences: {},
      groups: {},
      filters: [],
    };
    expect(validateView(bad, document, options())).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "relationOccurrences.occurrence:r.endpoints[1].occurrence",
        message: "projected endpoint for role target fails check provenance-missing",
        refs: ["occurrence:r", "occurrence:Z"],
        details: { role: "target", check: "provenance-missing" },
      },
    ]);
  });

  it("provenance-mismatch", () => {
    const { document, viewId } = frozenBase();
    const view = createView({ viewId, semanticDocumentId: document.documentId });
    const bad: ViewDocument = {
      ...view,
      revision: 1,
      entityOccurrences: {
        "occurrence:C": { id: occurrenceRef("C"), entity: entityRef("C"), geometry: { x: 0, y: 0, width: 460, height: 200 } },
        "occurrence:Z": { id: occurrenceRef("Z"), entity: entityRef("Z"), geometry: { x: 600, y: 0, width: 460, height: 200 } },
        "occurrence:X": { id: occurrenceRef("X"), entity: entityRef("X"), geometry: { x: 1200, y: 0, width: 460, height: 200 } },
      },
      relationOccurrences: {
        "occurrence:r": {
          id: occurrenceRef("r"),
          relation: relationRef("r"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("C") },
            {
              role: "target",
              occurrence: occurrenceRef("Z"),
              semanticTarget: entityRef("X"),
              sourceOccurrence: occurrenceRef("Z"),
            },
          ],
        },
      },
      portOccurrences: {},
      groups: {},
      filters: [],
    };
    expect(validateView(bad, document, options())).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "relationOccurrences.occurrence:r.endpoints[1].occurrence",
        message: "projected endpoint for role target fails check provenance-mismatch",
        refs: ["occurrence:r", "occurrence:Z"],
        details: { role: "target", check: "provenance-mismatch" },
      },
    ]);
  });

  it("projection-not-outermost", () => {
    const base = baseDocument(["generic@2"]);
    const document: SemanticDocument = {
      ...base,
      revision: 1,
      entities: {
        "entity:OUTER": ent("OUTER", "generic@2", "container", { name: text("OUTER") }),
        "entity:Z": ent("Z", "generic@2", "container", { name: text("Z") }),
        "entity:A1": ent("A1", "generic@2", "node", { name: text("A1") }),
        "entity:EXT": ent("EXT", "generic@2", "node", { name: text("EXT") }),
      },
      relations: {
        "relation:oz": rel("oz", "generic@2", "contains", [
          { role: "parent", target: "entity:OUTER" },
          { role: "child", target: "entity:Z" },
        ]),
        "relation:za1": rel("za1", "generic@2", "contains", [
          { role: "parent", target: "entity:Z" },
          { role: "child", target: "entity:A1" },
        ]),
        "relation:r": rel("r", "generic@2", "link", [
          { role: "source", target: "entity:EXT" },
          { role: "target", target: "entity:A1" },
        ]),
      },
      ports: {},
    };
    const view = createView({ viewId: viewRef("outer"), semanticDocumentId: document.documentId });
    const bad: ViewDocument = {
      ...view,
      revision: 1,
      entityOccurrences: {
        "occurrence:OUTER": { id: occurrenceRef("OUTER"), entity: entityRef("OUTER"), geometry: { x: 0, y: 0, width: 1600, height: 900 } },
        "occurrence:Z": { id: occurrenceRef("Z"), entity: entityRef("Z"), geometry: { x: 0, y: 0, width: 1000, height: 600 }, group: "grp.OUTER" },
        "occurrence:A1": { id: occurrenceRef("A1"), entity: entityRef("A1"), geometry: { x: 40, y: 240, width: 460, height: 200 }, group: "grp.Z" },
        "occurrence:EXT": { id: occurrenceRef("EXT"), entity: entityRef("EXT"), geometry: { x: 1200, y: 240, width: 460, height: 200 } },
      },
      relationOccurrences: {
        "occurrence:r": {
          id: occurrenceRef("r"),
          relation: relationRef("r"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("EXT") },
            {
              role: "target",
              occurrence: occurrenceRef("Z"),
              semanticTarget: entityRef("A1"),
              sourceOccurrence: occurrenceRef("A1"),
            },
          ],
        },
      },
      portOccurrences: {},
      groups: {
        "grp.OUTER": { id: "grp.OUTER", occurrence: occurrenceRef("OUTER"), collapsed: true },
        "grp.Z": { id: "grp.Z", occurrence: occurrenceRef("Z"), collapsed: true },
      },
      filters: [],
    };
    expect(validateView(bad, document, options())).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "relationOccurrences.occurrence:r.endpoints[1].occurrence",
        message: "projected endpoint for role target fails check projection-not-outermost",
        refs: ["occurrence:r", "occurrence:Z"],
        details: { role: "target", check: "projection-not-outermost" },
      },
    ]);
  });

  it("projection-source-projected", () => {
    const base = baseDocument(["generic@2"]);
    const document: SemanticDocument = {
      ...base,
      revision: 1,
      entities: {
        "entity:OUTER": ent("OUTER", "generic@2", "container", { name: text("OUTER") }),
        "entity:Z": ent("Z", "generic@2", "container", { name: text("Z") }),
        "entity:A1": ent("A1", "generic@2", "node", { name: text("A1") }),
        "entity:EXT": ent("EXT", "generic@2", "node", { name: text("EXT") }),
      },
      relations: {
        "relation:oz": rel("oz", "generic@2", "contains", [
          { role: "parent", target: "entity:OUTER" },
          { role: "child", target: "entity:Z" },
        ]),
        "relation:za1": rel("za1", "generic@2", "contains", [
          { role: "parent", target: "entity:Z" },
          { role: "child", target: "entity:A1" },
        ]),
        "relation:flow": rel("flow", "generic@2", "link", [
          { role: "source", target: "entity:EXT" },
          { role: "target", target: "entity:A1" },
        ]),
        "relation:r": rel("r", "generic@2", "link", [
          { role: "source", target: "entity:EXT" },
          { role: "target", target: "entity:Z" },
        ]),
      },
      ports: {},
    };
    const view = createView({ viewId: viewRef("srcproj"), semanticDocumentId: document.documentId });
    const folded: ViewDocument = {
      ...view,
      revision: 1,
      entityOccurrences: {
        "occurrence:OUTER": { id: occurrenceRef("OUTER"), entity: entityRef("OUTER"), geometry: { x: 0, y: 0, width: 1600, height: 900 } },
        "occurrence:Z": { id: occurrenceRef("Z"), entity: entityRef("Z"), geometry: { x: 0, y: 0, width: 1000, height: 600 }, group: "grp.OUTER" },
        "occurrence:A1": { id: occurrenceRef("A1"), entity: entityRef("A1"), geometry: { x: 40, y: 240, width: 460, height: 200 }, group: "grp.Z" },
        "occurrence:EXT": { id: occurrenceRef("EXT"), entity: entityRef("EXT"), geometry: { x: 1200, y: 240, width: 460, height: 200 } },
        "occurrence:flow": {
          id: occurrenceRef("flow"),
          relation: relationRef("flow"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("EXT") },
            {
              role: "target",
              occurrence: occurrenceRef("Z"),
              semanticTarget: entityRef("A1"),
              sourceOccurrence: occurrenceRef("A1"),
            },
          ],
        } as never,
      },
      relationOccurrences: {
        "occurrence:r": {
          id: occurrenceRef("r"),
          relation: relationRef("r"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("EXT") },
            {
              role: "target",
              occurrence: occurrenceRef("Z"),
              semanticTarget: entityRef("Z"),
              sourceOccurrence: occurrenceRef("flow"),
            },
          ],
        } as never,
      },
      portOccurrences: {},
      groups: {
        "grp.OUTER": { id: "grp.OUTER", occurrence: occurrenceRef("OUTER"), collapsed: true },
        "grp.Z": { id: "grp.Z", occurrence: occurrenceRef("Z"), collapsed: true },
      },
      filters: [],
    };
    // NOTE: occurrence:flow is an entity occurrence drawing a relation target here
    // to keep the frozen refs [r,Z] with a projected source; the setup documents
    // the substitution (flow as entity occurrence, not relation occurrence).
    let refusal: unknown;
    try {
      projectView(document, folded, [occurrenceRef("OUTER")]);
    } catch (error) {
      refusal = error;
    }
    expect(refusal).toEqual({
      code: "occurrence-endpoint-mismatch",
      severity: "error",
      path: "relationOccurrences.occurrence:r.endpoints[1].occurrence",
      message: "projected endpoint for role target fails check projection-source-projected",
      refs: ["occurrence:r", "occurrence:Z"],
      details: { role: "target", check: "projection-source-projected" },
    });
  });

  it("summary-constituents-mismatch", () => {
    const base = baseDocument(["generic@2"]);
    const document: SemanticDocument = {
      ...base,
      revision: 1,
      entities: {
        "entity:C": ent("C", "generic@2", "container", { name: text("C") }),
        "entity:K": ent("K", "generic@2", "node", { name: text("K") }),
        "entity:X": ent("X", "generic@2", "node", { name: text("X") }),
      },
      relations: {
        "relation:ck": rel("ck", "generic@2", "contains", [
          { role: "parent", target: "entity:C" },
          { role: "child", target: "entity:K" },
        ]),
        "relation:r": rel("r", "generic@2", "link", [
          { role: "source", target: "entity:K" },
          { role: "target", target: "entity:X" },
        ]),
      },
      ports: {},
    };
    const view = createView({ viewId: viewRef("mismatch"), semanticDocumentId: document.documentId });
    const bad: ViewDocument = {
      ...view,
      revision: 1,
      entityOccurrences: {
        "occurrence:C": { id: occurrenceRef("C"), entity: entityRef("C"), geometry: { x: 0, y: 0, width: 1000, height: 600 } },
        "occurrence:K": { id: occurrenceRef("K"), entity: entityRef("K"), geometry: { x: 40, y: 240, width: 460, height: 200 }, group: "grp.C" },
        "occurrence:X": { id: occurrenceRef("X"), entity: entityRef("X"), geometry: { x: 1200, y: 240, width: 460, height: 200 } },
      },
      relationOccurrences: {
        "occurrence:ra": {
          id: occurrenceRef("ra"),
          relation: relationRef("r"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("K") },
            { role: "target", occurrence: occurrenceRef("X") },
          ],
        },
      },
      portOccurrences: {},
      groups: { "grp.C": { id: "grp.C", occurrence: occurrenceRef("C"), collapsed: false } },
      filters: [],
      summaryLabels: {
        s2: {
          id: "s2",
          sourceOccurrence: occurrenceRef("C"),
          targetOccurrence: occurrenceRef("X"),
          label: "bad",
          relationIds: [relationRef("nope")],
        },
      },
    };
    expect(validateView(bad, document, options())).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "summaryLabels.s2",
        message: "summary definition s2 fails check summary-constituents-mismatch",
        refs: ["s2", "occurrence:C", "occurrence:X"],
        details: { check: "summary-constituents-mismatch" },
      },
    ]);
  });

  it("summary-duplicate-key", () => {
    const base = baseDocument(["generic@2"]);
    const document: SemanticDocument = {
      ...base,
      revision: 1,
      entities: {
        "entity:C": ent("C", "generic@2", "container", { name: text("C") }),
        "entity:K": ent("K", "generic@2", "node", { name: text("K") }),
        "entity:X": ent("X", "generic@2", "node", { name: text("X") }),
      },
      relations: {
        "relation:ck": rel("ck", "generic@2", "contains", [
          { role: "parent", target: "entity:C" },
          { role: "child", target: "entity:K" },
        ]),
        "relation:r": rel("r", "generic@2", "link", [
          { role: "source", target: "entity:K" },
          { role: "target", target: "entity:X" },
        ]),
      },
      ports: {},
    };
    const view = createView({ viewId: viewRef("dup"), semanticDocumentId: document.documentId });
    const bad: ViewDocument = {
      ...view,
      revision: 1,
      entityOccurrences: {
        "occurrence:C": { id: occurrenceRef("C"), entity: entityRef("C"), geometry: { x: 0, y: 0, width: 1000, height: 600 } },
        "occurrence:K": { id: occurrenceRef("K"), entity: entityRef("K"), geometry: { x: 40, y: 240, width: 460, height: 200 }, group: "grp.C" },
        "occurrence:X": { id: occurrenceRef("X"), entity: entityRef("X"), geometry: { x: 1200, y: 240, width: 460, height: 200 } },
      },
      relationOccurrences: {
        "occurrence:ra": {
          id: occurrenceRef("ra"),
          relation: relationRef("r"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("K") },
            { role: "target", occurrence: occurrenceRef("X") },
          ],
        },
      },
      portOccurrences: {},
      groups: { "grp.C": { id: "grp.C", occurrence: occurrenceRef("C"), collapsed: false } },
      filters: [],
      summaryLabels: {
        s1: {
          id: "s1",
          sourceOccurrence: occurrenceRef("C"),
          targetOccurrence: occurrenceRef("X"),
          label: "one",
          relationIds: [relationRef("r")],
        },
        s2: {
          id: "s2",
          sourceOccurrence: occurrenceRef("C"),
          targetOccurrence: occurrenceRef("X"),
          label: "two",
          relationIds: [relationRef("r")],
        },
      },
    };
    expect(validateView(bad, document, options())).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "summaryLabels.s2",
        message: "summary definition s2 fails check summary-duplicate-key",
        refs: ["s2", "occurrence:C", "occurrence:X"],
        details: { check: "summary-duplicate-key", firstId: "s1" },
      },
    ]);
  });

  it("B.6 positive scoped activation with explicit r1", () => {
    // Same semantic relation link in two drawings: occurrence:link crosses
    // (CHAT,MSGZ), occurrence:link-2 draws the same relation outside the scope
    // (different drawings CHAT2/TOPIC2 of the same entities, ungrouped).
    // Explicit [link] activates; scope prevents link-2 from entering.
    const document = foldDocument();
    const view = createView({ viewId: viewRef("b6pos"), semanticDocumentId: document.documentId });
    const baseSource = foldSource(document);
    const source: ViewDocument = {
      ...baseSource,
      entityOccurrences: {
        ...baseSource.entityOccurrences,
        "occurrence:CHAT2": { id: occurrenceRef("CHAT2"), entity: entityRef("CHAT"), geometry: { x: 1700, y: 0, width: 460, height: 200 } },
        "occurrence:TOPIC2": { id: occurrenceRef("TOPIC2"), entity: entityRef("TOPIC"), geometry: { x: 1700, y: 300, width: 460, height: 200 } },
      },
      relationOccurrences: {
        ...baseSource.relationOccurrences,
        "occurrence:link-2": {
          id: occurrenceRef("link-2"),
          relation: relationRef("link"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("CHAT2") },
            { role: "target", occurrence: occurrenceRef("TOPIC2") },
          ],
        },
      },
      summaryLabels: {
        s1: {
          id: "s1",
          sourceOccurrence: occurrenceRef("CHAT"),
          targetOccurrence: occurrenceRef("MSGZ"),
          label: "first only",
          relationIds: [relationRef("link")],
          relationOccurrences: [occurrenceRef("link")],
        },
      },
    };
    expect(validateView(source, document, options())).toEqual([]);
    const folded = projectView(document, source, [occurrenceRef("MSGZ")]);
    expect(validateView(folded, document, options())).toEqual([]);
    const active = resolveSummaries(folded, document, { registry: options().registry });
    expect(active.get("(occurrence:CHAT,occurrence:MSGZ,solid)")?.members).toEqual(["occurrence:link"]);
    expect(active.get("(occurrence:CHAT,occurrence:MSGZ,solid)")?.definitionId).toBe("s1");
  });

  it("B.7 boundary-crossing target while fold stays active", () => {
    // Substitutions documented: pinned archimate/generic fixtures disallow
    // relation targets (link/association target entity/port only), so relchain@2
    // substitutes the profile to allow association source/target -> relation.
    // grouping/business-actor/application-component stand in for pinned
    // container/node types; Z/EXT/A1/flow/r map to the frozen B.7 route
    // (junction/component/actor/assignment/flow). Fold stays active ([Z]);
    // r crosses the boundary (EXT outside -> Z boundary) with RelationRef
    // provenance (flow), and flow itself crosses (Z boundary -> A1 hidden).
    const profile = {
      ...generic2Profile,
      id: "relchain@2" as never,
      name: "relchain",
      entityTypes: [
        { id: "grouping", label: "Grouping", container: true, attributes: [{ name: "name", kind: "text", required: true, maxLength: 200 }] },
        { id: "business-actor", label: "Business actor", attributes: [{ name: "name", kind: "text", required: true, maxLength: 200 }] },
        { id: "application-component", label: "Application component", attributes: [{ name: "name", kind: "text", required: true, maxLength: 200 }] },
      ],
      relationTypes: [
        {
          id: "association",
          label: "Association",
          direction: "undirected",
          roles: [{ role: "source", cardinality: { min: 1, max: 1 }, targets: ["entity", "port", "relation"] as never[] }, { role: "target", cardinality: { min: 1, max: 1 }, targets: ["entity", "port", "relation"] as never[] }],
        },
        {
          id: "groupingContainment",
          label: "Grouping containment",
          direction: "directed",
          roles: [{ role: "parent", cardinality: { min: 1, max: 1 }, targets: ["entity"] }, { role: "child", cardinality: { min: 1, max: 1 }, targets: ["entity"] }],
          hierarchy: { id: "containment", shape: "tree", parentRole: "parent", childRole: "child" },
        },
      ],
      constraints: [
        { kind: "hierarchy", relationType: "groupingContainment", hierarchyId: "containment", parentRole: "parent", childRole: "child" },
      ],
      limits: {},
      notes: [],
    } as never;
    const base = baseDocument(["relchain@2" as never]);
    const document: SemanticDocument = {
      ...base,
      revision: 1,
      entities: {
        "entity:junction": ent("junction", "relchain@2" as never, "grouping", { name: text("J") }),
        "entity:actor": ent("actor", "relchain@2" as never, "business-actor", { name: text("A1") }),
        "entity:component": ent("component", "relchain@2" as never, "application-component", { name: text("EXT") }),
      },
      relations: {
        "relation:assignment": rel("assignment", "relchain@2" as never, "association", [
          { role: "source", target: "entity:junction" },
          { role: "target", target: "entity:actor" },
        ]),
        "relation:serving": rel("serving", "relchain@2" as never, "groupingContainment", [
          { role: "parent", target: "entity:junction" },
          { role: "child", target: "entity:actor" },
        ]),
        "relation:flow": rel("flow", "relchain@2" as never, "association", [
          { role: "source", target: "entity:component" },
          { role: "target", target: "relation:assignment" },
        ]),
      },
      ports: {},
    };
    const scoped = { registry: createProfileRegistry([profile as never]), bindings: { schemaVersion: "1" as const, rows: [bindingRowFor(profile as never, SCOPED_CONSTRAINTS_ADAPTER)] } };
    const view = createView({ viewId: viewRef("b7cross"), semanticDocumentId: document.documentId });
    const source: ViewDocument = {
      ...view,
      revision: 1,
      entityOccurrences: {
        "occurrence:Z": { id: occurrenceRef("Z"), entity: entityRef("junction"), geometry: { x: 0, y: 0, width: 1000, height: 600 } },
        "occurrence:A1": { id: occurrenceRef("A1"), entity: entityRef("actor"), geometry: { x: 40, y: 240, width: 460, height: 200 }, group: "occurrence:Z" },
        "occurrence:EXT": { id: occurrenceRef("EXT"), entity: entityRef("component"), geometry: { x: 1200, y: 240, width: 460, height: 200 } },
      },
      relationOccurrences: {
        "occurrence:r": {
          id: occurrenceRef("r"),
          relation: relationRef("flow"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("EXT") },
            { role: "target", occurrence: occurrenceRef("flow") },
          ],
        },
        "occurrence:flow": {
          id: occurrenceRef("flow"),
          relation: relationRef("assignment"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("Z") },
            { role: "target", occurrence: occurrenceRef("A1") },
          ],
        },
      },
      portOccurrences: {},
      groups: { "occurrence:Z": { id: "occurrence:Z", occurrence: occurrenceRef("Z"), collapsed: false } },
      filters: [],
    };
    expect(validateView(source, document, scoped)).toEqual([]);
    const folded = projectView(document, source, [occurrenceRef("Z")]);
    expect(validateView(folded, document, scoped)).toEqual([]);
    expect(folded.relationOccurrences["occurrence:r"]?.endpoints[1]).toEqual({
      role: "target",
      occurrence: occurrenceRef("Z"),
      semanticTarget: relationRef("assignment"),
      sourceOccurrence: occurrenceRef("flow"),
    });
    const scene = foldedScene(folded, document, [occurrenceRef("Z")]);
    expect(scene.drawnRelations).toEqual(["occurrence:r"]);
  });
});
