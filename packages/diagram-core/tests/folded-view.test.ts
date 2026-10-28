/**
 * M1-c folds, folded-edge projection and authored summary labels (RED).
 *
 * Every item below fails before the M1-c implementation lands and passes
 * after it. English in code.
 */
import { describe, expect, it } from "vitest";

import {
  applyDefaultFolds,
  applyInverse,
  applyTransaction,
  bindingRowFor,
  canonicalise,
  collapseAll,
  createProfileRegistry,
  createState,
  createView,
  defaultProfileRegistry,
  documentRef,
  entityRef,
  expandAll,
  foldedScene,
  generic2Profile,
  occurrenceRef,
  portRef,
  projectView,
  relationRef,
  resolveSummaries,
  SCOPED_CONSTRAINTS_ADAPTER,
  serialiseView,
  text,
  validateDocument,
  validateView,
  viewRef,
  type Profile,
  type OccurrenceRef,
  type SemanticDocument,
  type ViewDocument,
} from "../src/index.js";
import { baseDocument, ent, port, rel, scopedOptions } from "./m3-helpers.js";

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
      "relation:r-solid": rel("r-solid", "generic@2", "link", [
        { role: "source", target: "entity:CHAT" },
        { role: "target", target: "entity:TOPIC" },
      ]),
      "relation:r-dashed": rel("r-dashed", "generic@2", "link", [
        { role: "source", target: "entity:CHAT" },
        { role: "target", target: "entity:SUB" },
      ]),
    },
    ports: {},
  };
}

function foldSourceView(document: SemanticDocument): ViewDocument {
  const view = createView({ viewId: viewRef("fold"), semanticDocumentId: document.documentId });
  return {
    ...view,
    revision: document.revision,
    entityOccurrences: {
      "occurrence:CHAT": {
        id: occurrenceRef("CHAT"),
        entity: entityRef("CHAT"),
        geometry: { x: 1200, y: 240, width: 460, height: 200 },
      },
      "occurrence:MSGZ": {
        id: occurrenceRef("MSGZ"),
        entity: entityRef("MSGZ"),
        geometry: { x: 0, y: 0, width: 1000, height: 600 },
      },
      "occurrence:TOPIC": {
        id: occurrenceRef("TOPIC"),
        entity: entityRef("TOPIC"),
        geometry: { x: 40, y: 240, width: 460, height: 200 },
        group: "grp.4.MSGZ",
      },
      "occurrence:SUB": {
        id: occurrenceRef("SUB"),
        entity: entityRef("SUB"),
        geometry: { x: 540, y: 240, width: 460, height: 200 },
        group: "grp.4.MSGZ",
      },
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
    groups: {
      "grp.4.MSGZ": {
        id: "grp.4.MSGZ",
        occurrence: occurrenceRef("MSGZ"),
        collapsed: false,
      },
    },
    filters: [],
  };
}

describe("M1-c types", () => {
  it("adds exactly summaryLabels to VIEW_DOCUMENT_FIELDS", async () => {
    const mod = (await import("../src/index.js")) as Record<string, unknown>;
    const fields = mod["VIEW_DOCUMENT_FIELDS"] as readonly string[];
    expect([...fields].sort()).toEqual(
      [
        "entityOccurrences",
        "filters",
        "groups",
        "portOccurrences",
        "presentation",
        "relationOccurrences",
        "revision",
        "semanticDocumentId",
        "summaryLabels",
        "viewId",
      ].sort(),
    );
  });

  it("validates views without the new fields exactly as on main", () => {
    const document = foldDocument();
    const view = foldSourceView(document);
    expect(validateView(view, document, options())).toEqual([]);
  });
});

describe("B.1 single fold", () => {
  it("projects the hidden endpoint to the visible representative with provenance", () => {
    const document = foldDocument();
    const source = foldSourceView(document);
    const folded = projectView(document, source, [occurrenceRef("MSGZ")]);
    expect(folded.relationOccurrences["occurrence:link"]?.endpoints).toEqual([
      { role: "source", occurrence: occurrenceRef("CHAT") },
      {
        role: "target",
        occurrence: occurrenceRef("MSGZ"),
        semanticTarget: entityRef("TOPIC"),
        sourceOccurrence: occurrenceRef("TOPIC"),
      },
    ]);
    expect(validateView(folded, document, options())).toEqual([]);
  });

  it("empty collapse restores relation bytes exactly", () => {
    const document = foldDocument();
    const source = foldSourceView(document);
    const folded = projectView(document, source, [occurrenceRef("MSGZ")]);
    const restored = projectView(document, source, []);
    expect(canonicalise(restored.relationOccurrences)).toBe(canonicalise(source.relationOccurrences));
    expect(restored.relationOccurrences["occurrence:link"]?.endpoints[1]).toEqual({
      role: "target",
      occurrence: occurrenceRef("TOPIC"),
    });
    expect(folded.revision).toBe(source.revision);
    expect(restored.revision).toBe(source.revision);
  });

  it("repeated A→∅→A→∅ produces identical bytes at each repetition", () => {
    const document = foldDocument();
    const source = foldSourceView(document);
    const collapsed = [occurrenceRef("MSGZ")];
    const a1 = projectView(document, source, collapsed);
    const e1 = projectView(document, source, []);
    const a2 = projectView(document, source, collapsed);
    const e2 = projectView(document, source, []);
    expect(canonicalise(a2)).toBe(canonicalise(a1));
    expect(canonicalise(e2)).toBe(canonicalise(e1));
  });

  it("keeps strokeStyle presence and value byte-identical through fold and unfold", () => {
    const document = foldDocument();
    const source = foldSourceView(document);
    const withStyle: ViewDocument = {
      ...source,
      relationOccurrences: {
        ...source.relationOccurrences,
        "occurrence:link": { ...source.relationOccurrences["occurrence:link"]!, strokeStyle: "dashed" as const },
      },
    };
    const folded = projectView(document, withStyle, [occurrenceRef("MSGZ")]);
    expect(folded.relationOccurrences["occurrence:link"]?.strokeStyle).toBe("dashed");
    const restored = projectView(document, withStyle, []);
    expect(restored.relationOccurrences["occurrence:link"]?.strokeStyle).toBe("dashed");
    expect("strokeStyle" in (source.relationOccurrences["occurrence:link"] ?? {})).toBe(false);
    expect("strokeStyle" in (projectView(document, source, [occurrenceRef("MSGZ")]).relationOccurrences["occurrence:link"] ?? {})).toBe(false);
  });

  it("refuses a projected endpoint without semanticTarget (RED state of B.1)", () => {
    const document = foldDocument();
    const source = foldSourceView(document);
    const folded = projectView(document, source, [occurrenceRef("MSGZ")]);
    const broken: ViewDocument = {
      ...folded,
      relationOccurrences: {
        ...folded.relationOccurrences,
        "occurrence:link": {
          ...folded.relationOccurrences["occurrence:link"]!,
          endpoints: [
            { role: "source", occurrence: occurrenceRef("CHAT") },
            { role: "target", occurrence: occurrenceRef("MSGZ") },
          ],
        },
      },
    };
    expect(validateView(broken, document, options())).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "relationOccurrences.occurrence:link.endpoints[1].occurrence",
        message: "occurrence occurrence:MSGZ draws entity:MSGZ; role target of relation:link targets entity:TOPIC",
        refs: ["occurrence:MSGZ", "entity:MSGZ", "entity:TOPIC"],
        details: { role: "target" },
      },
    ]);
  });
});

describe("B.2 nested fold", () => {
  function nestedDocument(): SemanticDocument {
    const base = baseDocument(["generic@2"]);
    return {
      ...base,
      revision: 1,
      entities: {
        "entity:GCP": ent("GCP", "generic@2", "container", { name: text("GCP") }),
        "entity:PPROZ": ent("PPROZ", "generic@2", "container", { name: text("PPROZ") }),
        "entity:MSGZ": ent("MSGZ", "generic@2", "container", { name: text("MSGZ") }),
        "entity:TOPIC": ent("TOPIC", "generic@2", "node", { name: text("TOPIC") }),
        "entity:CHAT": ent("CHAT", "generic@2", "node", { name: text("CHAT") }),
      },
      relations: {
        "relation:gcp-pproz": rel("gcp-pproz", "generic@2", "contains", [
          { role: "parent", target: "entity:GCP" },
          { role: "child", target: "entity:PPROZ" },
        ]),
        "relation:pproz-msgz": rel("pproz-msgz", "generic@2", "contains", [
          { role: "parent", target: "entity:PPROZ" },
          { role: "child", target: "entity:MSGZ" },
        ]),
        "relation:msgz-topic": rel("msgz-topic", "generic@2", "contains", [
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
  }

  function nestedSource(document: SemanticDocument): ViewDocument {
    const view = createView({ viewId: viewRef("nested"), semanticDocumentId: document.documentId });
    return {
      ...view,
      revision: document.revision,
      entityOccurrences: {
        "occurrence:GCP": { id: occurrenceRef("GCP"), entity: entityRef("GCP"), geometry: { x: 0, y: 0, width: 1600, height: 900 } },
        "occurrence:PPROZ": { id: occurrenceRef("PPROZ"), entity: entityRef("PPROZ"), geometry: { x: 0, y: 0, width: 1400, height: 800 }, group: "grp.3.GCP" },
        "occurrence:MSGZ": { id: occurrenceRef("MSGZ"), entity: entityRef("MSGZ"), geometry: { x: 0, y: 0, width: 1000, height: 600 }, group: "grp.5.PPROZ" },
        "occurrence:TOPIC": { id: occurrenceRef("TOPIC"), entity: entityRef("TOPIC"), geometry: { x: 40, y: 240, width: 460, height: 200 }, group: "grp.4.MSGZ" },
        "occurrence:CHAT": { id: occurrenceRef("CHAT"), entity: entityRef("CHAT"), geometry: { x: 1700, y: 240, width: 460, height: 200 } },
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
      groups: {
        "grp.3.GCP": { id: "grp.3.GCP", occurrence: occurrenceRef("GCP"), collapsed: false },
        "grp.5.PPROZ": { id: "grp.5.PPROZ", occurrence: occurrenceRef("PPROZ"), collapsed: false },
        "grp.4.MSGZ": { id: "grp.4.MSGZ", occurrence: occurrenceRef("MSGZ"), collapsed: false },
      },
      filters: [],
    };
  }

  it("selects the outermost collapsed ancestor when every ancestor is folded", () => {
    const document = nestedDocument();
    const source = nestedSource(document);
    const folded = projectView(document, source, [occurrenceRef("GCP"), occurrenceRef("PPROZ"), occurrenceRef("MSGZ")]);
    expect(folded.relationOccurrences["occurrence:link"]?.endpoints[1]).toEqual({
      role: "target",
      occurrence: occurrenceRef("GCP"),
      semanticTarget: entityRef("TOPIC"),
      sourceOccurrence: occurrenceRef("TOPIC"),
    });
    expect(validateView(folded, document, options())).toEqual([]);
  });

  it("selects the inner container when only it is collapsed", () => {
    const document = nestedDocument();
    const source = nestedSource(document);
    const folded = projectView(document, source, [occurrenceRef("MSGZ")]);
    expect(folded.relationOccurrences["occurrence:link"]?.endpoints[1]?.occurrence).toBe("occurrence:MSGZ");
    expect(validateView(folded, document, options())).toEqual([]);
  });

  it("refuses projection-not-outermost for a hand-written inner representative", () => {
    const document = nestedDocument();
    const source = nestedSource(document);
    const folded = projectView(document, source, [occurrenceRef("GCP"), occurrenceRef("PPROZ"), occurrenceRef("MSGZ")]);
    const inner: ViewDocument = {
      ...folded,
      relationOccurrences: {
        ...folded.relationOccurrences,
        "occurrence:link": {
          ...folded.relationOccurrences["occurrence:link"]!,
          endpoints: [
            { role: "source", occurrence: occurrenceRef("CHAT") },
            {
              role: "target",
              occurrence: occurrenceRef("MSGZ"),
              semanticTarget: entityRef("TOPIC"),
              sourceOccurrence: occurrenceRef("TOPIC"),
            },
          ],
        },
      },
    };
    expect(validateView(inner, document, options())).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "relationOccurrences.occurrence:link.endpoints[1].occurrence",
        message: "projected endpoint for role target fails check projection-not-outermost",
        refs: ["occurrence:link", "occurrence:MSGZ"],
        details: { role: "target", check: "projection-not-outermost" },
      },
    ]);
  });
});

describe("independently folded duplicate occurrences", () => {
  it("folds one drawing of a container while the other stays expanded", () => {
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
        "relation:xk": rel("xk", "generic@2", "link", [
          { role: "source", target: "entity:X" },
          { role: "target", target: "entity:K" },
        ]),
      },
      ports: {},
    };
    const view = createView({ viewId: viewRef("dup"), semanticDocumentId: document.documentId });
    const source: ViewDocument = {
      ...view,
      revision: 1,
      entityOccurrences: {
        "occurrence:C1": { id: occurrenceRef("C1"), entity: entityRef("C"), geometry: { x: 0, y: 0, width: 1000, height: 600 } },
        "occurrence:K1": { id: occurrenceRef("K1"), entity: entityRef("K"), geometry: { x: 40, y: 240, width: 460, height: 200 }, group: "grp.2.C1" },
        "occurrence:C2": { id: occurrenceRef("C2"), entity: entityRef("C"), geometry: { x: 0, y: 700, width: 1000, height: 600 } },
        "occurrence:K2": { id: occurrenceRef("K2"), entity: entityRef("K"), geometry: { x: 40, y: 940, width: 460, height: 200 }, group: "grp.2.C2" },
        "occurrence:X": { id: occurrenceRef("X"), entity: entityRef("X"), geometry: { x: 1200, y: 240, width: 460, height: 200 } },
      },
      relationOccurrences: {
        "occurrence:r1": {
          id: occurrenceRef("r1"),
          relation: relationRef("xk"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("X") },
            { role: "target", occurrence: occurrenceRef("K1") },
          ],
        },
        "occurrence:r2": {
          id: occurrenceRef("r2"),
          relation: relationRef("xk"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("X") },
            { role: "target", occurrence: occurrenceRef("K2") },
          ],
        },
      },
      portOccurrences: {},
      groups: {
        "grp.2.C1": { id: "grp.2.C1", occurrence: occurrenceRef("C1"), collapsed: false },
        "grp.2.C2": { id: "grp.2.C2", occurrence: occurrenceRef("C2"), collapsed: false },
      },
      filters: [],
    };
    const folded = projectView(document, source, [occurrenceRef("C1")]);
    expect(folded.relationOccurrences["occurrence:r1"]?.endpoints[1]).toEqual({
      role: "target",
      occurrence: occurrenceRef("C1"),
      semanticTarget: entityRef("K"),
      sourceOccurrence: occurrenceRef("K1"),
    });
    expect(folded.relationOccurrences["occurrence:r2"]?.endpoints[1]).toEqual({
      role: "target",
      occurrence: occurrenceRef("K2"),
    });
    expect(validateView(folded, document, options())).toEqual([]);
  });
});

describe("ports and counterparts", () => {
  function portDocument(): SemanticDocument {
    const base = baseDocument(["generic@2"]);
    return {
      ...base,
      revision: 1,
      entities: {
        "entity:Z": ent("Z", "generic@2", "container", { name: text("Z") }),
        "entity:A": ent("A", "generic@2", "node", { name: text("A") }),
        "entity:EXT": ent("EXT", "generic@2", "node", { name: text("EXT") }),
      },
      relations: {
        "relation:za": rel("za", "generic@2", "contains", [
          { role: "parent", target: "entity:Z" },
          { role: "child", target: "entity:A" },
        ]),
        "relation:wire": rel("wire", "generic@2", "link", [
          { role: "source", target: "port:p-ext" },
          { role: "target", target: "port:p-a" },
        ]),
      },
      ports: {
        "port:p-a": port("p-a", "generic@2", "port", "A", "out"),
        "port:p-ext": port("p-ext", "generic@2", "port", "EXT", "out"),
        "port:p-z": port("p-z", "generic@2", "port", "Z", "out"),
      },
    };
  }

  function portSource(document: SemanticDocument): ViewDocument {
    const view = createView({ viewId: viewRef("ports"), semanticDocumentId: document.documentId });
    return {
      ...view,
      revision: 1,
      entityOccurrences: {
        "occurrence:Z": { id: occurrenceRef("Z"), entity: entityRef("Z"), geometry: { x: 0, y: 0, width: 1000, height: 600 } },
        "occurrence:A1": { id: occurrenceRef("A1"), entity: entityRef("A"), geometry: { x: 40, y: 240, width: 460, height: 200 }, group: "occurrence:Z" },
        "occurrence:EXT": { id: occurrenceRef("EXT"), entity: entityRef("EXT"), geometry: { x: 1200, y: 240, width: 460, height: 200 } },
      },
      relationOccurrences: {
        "occurrence:w": {
          id: occurrenceRef("w"),
          relation: relationRef("wire"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("p-ext") },
            { role: "target", occurrence: occurrenceRef("p-a") },
          ],
        },
      },
      portOccurrences: {
        "occurrence:p-a": { id: occurrenceRef("p-a"), port: portRef("p-a"), ownerOccurrence: occurrenceRef("A1"), side: "east", order: 0, anchor: 0.5 },
        "occurrence:p-ext": { id: occurrenceRef("p-ext"), port: portRef("p-ext"), ownerOccurrence: occurrenceRef("EXT"), side: "west", order: 0, anchor: 0.5 },
        "occurrence:p-z": { id: occurrenceRef("p-z"), port: portRef("p-z"), ownerOccurrence: occurrenceRef("Z"), side: "east", order: 0, anchor: 0.5 },
      },
      groups: {
        "occurrence:Z": { id: "occurrence:Z", occurrence: occurrenceRef("Z"), collapsed: false },
      },
      filters: [],
    };
  }

  it("projects a hidden port endpoint to the representative counterpart port", () => {
    const document = portDocument();
    const source = portSource(document);
    expect(validateView(source, document, options())).toEqual([]);
    const folded = projectView(document, source, [occurrenceRef("Z")]);
    expect(folded.relationOccurrences["occurrence:w"]?.endpoints[1]).toEqual({
      role: "target",
      occurrence: occurrenceRef("p-z"),
      semanticTarget: portRef("p-a"),
      sourceOccurrence: occurrenceRef("p-a"),
    });
    expect(validateView(folded, document, options())).toEqual([]);
    const restored = projectView(document, source, []);
    expect(restored.relationOccurrences["occurrence:w"]?.endpoints[1]).toEqual({
      role: "target",
      occurrence: occurrenceRef("p-a"),
    });
  });

  it("projects to the entity when the representative has no counterpart port", () => {
    const document = portDocument();
    const source = portSource(document);
    const noCounterpart: ViewDocument = {
      ...source,
      portOccurrences: {
        "occurrence:p-a": source.portOccurrences["occurrence:p-a"]!,
        "occurrence:p-ext": source.portOccurrences["occurrence:p-ext"]!,
      },
    };
    const folded = projectView(document, noCounterpart, [occurrenceRef("Z")]);
    expect(folded.relationOccurrences["occurrence:w"]?.endpoints[1]).toEqual({
      role: "target",
      occurrence: occurrenceRef("Z"),
      semanticTarget: portRef("p-a"),
      sourceOccurrence: occurrenceRef("p-a"),
    });
    expect(validateView(folded, document, options())).toEqual([]);
  });
});

describe("n-ary endpoints and visible self-links", () => {
  function naryDocument(): SemanticDocument {
    const base = baseDocument(["generic@2"]);
    return {
      ...base,
      revision: 1,
      entities: {
        "entity:ZONE-A": ent("ZONE-A", "generic@2", "container", { name: text("ZONE-A") }),
        "entity:ZONE-B": ent("ZONE-B", "generic@2", "container", { name: text("ZONE-B") }),
        "entity:A1": ent("A1", "generic@2", "node", { name: text("A1") }),
        "entity:B1": ent("B1", "generic@2", "node", { name: text("B1") }),
        "entity:EXT": ent("EXT", "generic@2", "node", { name: text("EXT") }),
      },
      relations: {
        "relation:za-a1": rel("za-a1", "generic@2", "contains", [
          { role: "parent", target: "entity:ZONE-A" },
          { role: "child", target: "entity:A1" },
        ]),
        "relation:zb-b1": rel("zb-b1", "generic@2", "contains", [
          { role: "parent", target: "entity:ZONE-B" },
          { role: "child", target: "entity:B1" },
        ]),
        "relation:assoc": rel("assoc", "generic@2", "association", [
          { role: "member", target: "entity:A1" },
          { role: "member", target: "entity:B1" },
          { role: "member", target: "entity:EXT" },
        ]),
      },
      ports: {},
    };
  }

  function narySource(document: SemanticDocument): ViewDocument {
    const view = createView({ viewId: viewRef("nary"), semanticDocumentId: document.documentId });
    return {
      ...view,
      revision: 1,
      entityOccurrences: {
        "occurrence:ZONE-A": { id: occurrenceRef("ZONE-A"), entity: entityRef("ZONE-A"), geometry: { x: 0, y: 0, width: 1000, height: 600 } },
        "occurrence:A1": { id: occurrenceRef("A1"), entity: entityRef("A1"), geometry: { x: 40, y: 240, width: 460, height: 200 }, group: "grp.6.ZONE-A" },
        "occurrence:ZONE-B": { id: occurrenceRef("ZONE-B"), entity: entityRef("ZONE-B"), geometry: { x: 0, y: 700, width: 1000, height: 600 } },
        "occurrence:B1": { id: occurrenceRef("B1"), entity: entityRef("B1"), geometry: { x: 40, y: 940, width: 460, height: 200 }, group: "grp.6.ZONE-B" },
        "occurrence:EXT": { id: occurrenceRef("EXT"), entity: entityRef("EXT"), geometry: { x: 1200, y: 240, width: 460, height: 200 } },
      },
      relationOccurrences: {
        "occurrence:m": {
          id: occurrenceRef("m"),
          relation: relationRef("assoc"),
          endpoints: [
            { role: "member", occurrence: occurrenceRef("A1") },
            { role: "member", occurrence: occurrenceRef("B1") },
            { role: "member", occurrence: occurrenceRef("EXT") },
          ],
        },
      },
      portOccurrences: {},
      groups: {
        "grp.6.ZONE-A": { id: "grp.6.ZONE-A", occurrence: occurrenceRef("ZONE-A"), collapsed: false },
        "grp.6.ZONE-B": { id: "grp.6.ZONE-B", occurrence: occurrenceRef("ZONE-B"), collapsed: false },
      },
      filters: [],
    };
  }

  it("B.3 projects each member independently across two collapsed branches", () => {
    const document = naryDocument();
    const source = narySource(document);
    const folded = projectView(document, source, [occurrenceRef("ZONE-A"), occurrenceRef("ZONE-B")]);
    expect(folded.relationOccurrences["occurrence:m"]?.endpoints).toEqual([
      { role: "member", occurrence: occurrenceRef("ZONE-A"), semanticTarget: entityRef("A1"), sourceOccurrence: occurrenceRef("A1") },
      { role: "member", occurrence: occurrenceRef("ZONE-B"), semanticTarget: entityRef("B1"), sourceOccurrence: occurrenceRef("B1") },
      { role: "member", occurrence: occurrenceRef("EXT") },
    ]);
    expect(validateView(folded, document, options())).toEqual([]);
  });

  it("leaves a visible self-link untouched", () => {
    const base = baseDocument(["generic@2"]);
    const document: SemanticDocument = {
      ...base,
      revision: 0,
      entities: {
        "entity:N": ent("N", "generic@2", "node", { name: text("N") }),
      },
      relations: {
        "relation:self": rel("self", "generic@2", "link", [
          { role: "source", target: "entity:N" },
          { role: "target", target: "entity:N" },
        ]),
      },
      ports: {},
    };
    const view = createView({ viewId: viewRef("self"), semanticDocumentId: document.documentId });
    const source: ViewDocument = {
      ...view,
      revision: 0,
      entityOccurrences: {
        "occurrence:N": { id: occurrenceRef("N"), entity: entityRef("N"), geometry: { x: 0, y: 0, width: 460, height: 200 } },
      },
      relationOccurrences: {
        "occurrence:s": {
          id: occurrenceRef("s"),
          relation: relationRef("self"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("N") },
            { role: "target", occurrence: occurrenceRef("N") },
          ],
        },
      },
      portOccurrences: {},
      groups: {},
      filters: [],
    };
    const folded = projectView(document, source, []);
    expect(folded.relationOccurrences["occurrence:s"]?.endpoints).toEqual([
      { role: "source", occurrence: occurrenceRef("N") },
      { role: "target", occurrence: occurrenceRef("N") },
    ]);
    expect(validateView(folded, document, options())).toEqual([]);
  });
});

describe("filter plus fold cause retention", () => {
  function filteredSummarySource(): { document: SemanticDocument; source: ViewDocument } {
    const document = foldDocument();
    const source = foldSourceView(document);
    return {
      document,
      source: {
        ...source,
        filters: [{ id: "f-hide-sub", kind: "entity-type", types: ["node"], mode: "exclude" }],
        summaryLabels: {
          "sum:overview-chat": {
            id: "sum:overview-chat",
            sourceOccurrence: occurrenceRef("CHAT"),
            targetOccurrence: occurrenceRef("MSGZ"),
            label: "Chat events",
            relationIds: [relationRef("link")],
            strokeStyle: "solid",
          },
        },
      },
    };
  }

  it("projects a filter-excluded endpoint identically and excludes it with the filter reason", () => {
    const { document, source } = filteredSummarySource();
    const folded = projectView(document, source, [occurrenceRef("MSGZ")]);
    expect(folded.filters).toEqual(source.filters);
    expect(folded.relationOccurrences["occurrence:link"]?.endpoints[1]).toEqual({
      role: "target",
      occurrence: occurrenceRef("MSGZ"),
      semanticTarget: entityRef("TOPIC"),
      sourceOccurrence: occurrenceRef("TOPIC"),
    });
    const scene = foldedScene(folded, document, [occurrenceRef("MSGZ")], {
      hiddenByFilter: [occurrenceRef("TOPIC")] as readonly OccurrenceRef[],
    });
    expect(scene.exclusions).toEqual([
      { occurrence: occurrenceRef("SUB"), kind: "group-collapsed", reason: "fold" },
      { occurrence: occurrenceRef("TOPIC"), kind: "group-collapsed", reason: "fold", cause: "filter" },
      { occurrence: occurrenceRef("link"), kind: "endpoint-hidden", reason: "filter" },
    ]);
    expect(scene.drawnRelations).not.toContain("occurrence:link");
    expect(validateView(folded, document, options())).toEqual([]);
  });

  it("a filtered member leaves drawn aggregates and active summaries", () => {
    const { document, source } = filteredSummarySource();
    const folded = projectView(document, source, [occurrenceRef("MSGZ")]);
    expect(validateView(folded, document, options())).toEqual([]);
    const active = resolveSummaries(folded, document, {
      filters: { hiddenByFilter: [occurrenceRef("TOPIC")] as readonly OccurrenceRef[] },
      registry: options().registry,
    });
    expect(active.size).toBe(0);
    const restored = resolveSummaries(folded, document, { registry: options().registry });
    expect(restored.get("(occurrence:CHAT,occurrence:MSGZ,solid)")?.definitionId).toBe("sum:overview-chat");
  });

  it("clearing either cause independently restores the correct drawing", () => {
    const { document, source } = filteredSummarySource();
    const folded = projectView(document, source, [occurrenceRef("MSGZ")]);
    const unfiltered = foldedScene(folded, document, [occurrenceRef("MSGZ")], { hiddenByFilter: [] });
    expect(unfiltered.exclusions).toEqual([
      { occurrence: occurrenceRef("SUB"), kind: "group-collapsed", reason: "fold" },
      { occurrence: occurrenceRef("TOPIC"), kind: "group-collapsed", reason: "fold" },
    ]);
    expect(unfiltered.drawnRelations).toContain("occurrence:link");
    const unfoldedFiltered = foldedScene(folded, document, [], {
      hiddenByFilter: [occurrenceRef("TOPIC")] as readonly OccurrenceRef[],
    });
    expect(unfoldedFiltered.exclusions).toEqual([
      { occurrence: occurrenceRef("link"), kind: "endpoint-hidden", reason: "filter" },
    ]);
    expect(unfoldedFiltered.drawnRelations).not.toContain("occurrence:link");
  });
});

describe("revision meaning and default folds", () => {
  it("fold-only changes keep revision 0 and validate at every step", () => {
    const base = baseDocument(["generic@2"]);
    const document: SemanticDocument = {
      ...base,
      revision: 0,
      entities: {
        "entity:C": ent("C", "generic@2", "container", { name: text("C") }),
        "entity:K": ent("K", "generic@2", "node", { name: text("K") }),
      },
      relations: {
        "relation:ck": rel("ck", "generic@2", "contains", [
          { role: "parent", target: "entity:C" },
          { role: "child", target: "entity:K" },
        ]),
      },
      ports: {},
    };
    const view = createView({ viewId: viewRef("rev0"), semanticDocumentId: document.documentId });
    const source: ViewDocument = {
      ...view,
      revision: 0,
      entityOccurrences: {
        "occurrence:C": { id: occurrenceRef("C"), entity: entityRef("C"), geometry: { x: 0, y: 0, width: 1000, height: 600 } },
        "occurrence:K": { id: occurrenceRef("K"), entity: entityRef("K"), geometry: { x: 40, y: 240, width: 460, height: 200 }, group: "grp.1.C" },
      },
      relationOccurrences: {},
      portOccurrences: {},
      groups: { "grp.1.C": { id: "grp.1.C", occurrence: occurrenceRef("C"), collapsed: false } },
      filters: [],
    };
    for (const collapsed of [[occurrenceRef("C")], [], [occurrenceRef("C")], []] as const) {
      const next = projectView(document, source, [...collapsed]);
      expect(next.revision).toBe(0);
      expect(validateView(next, document, options())).toEqual([]);
    }
    expect(canonicalise(document)).toBe(canonicalise({ ...document }));
  });

  it("fold-only changes keep revision 1 and distribute default folds", () => {
    const document = foldDocument();
    const source = foldSourceView(document);
    expect(source.revision).toBe(1);
    const folded = projectView(document, source, [occurrenceRef("MSGZ")]);
    expect(folded.revision).toBe(1);
    expect(validateView(folded, document, options())).toEqual([]);
    const applied = applyDefaultFolds(document, source, [occurrenceRef("MSGZ")]);
    expect(applied.groups["grp.4.MSGZ"]?.collapsed).toBe(true);
    expect(applied.revision).toBe(source.revision);
    expect(applied.relationOccurrences["occurrence:link"]?.endpoints[1]).toEqual({
      role: "target",
      occurrence: occurrenceRef("MSGZ"),
      semanticTarget: entityRef("TOPIC"),
      sourceOccurrence: occurrenceRef("TOPIC"),
    });
    expect(validateView(applied, document, options())).toEqual([]);
    const expanded = expandAll(document, source);
    expect(expanded.groups["grp.4.MSGZ"]?.collapsed).toBe(false);
    expect(canonicalise(expanded.relationOccurrences)).toBe(canonicalise(source.relationOccurrences));
    const collapsedAll = collapseAll(document, source);
    expect(collapsedAll.groups["grp.4.MSGZ"]?.collapsed).toBe(true);
    expect(collapsedAll.relationOccurrences["occurrence:link"]?.endpoints[1]).toEqual({
      role: "target",
      occurrence: occurrenceRef("MSGZ"),
      semanticTarget: entityRef("TOPIC"),
      sourceOccurrence: occurrenceRef("TOPIC"),
    });
    expect(validateView(collapsedAll, document, options())).toEqual([]);
  });

  it("every transition recomputes from the retained source, never from a projection", () => {
    const document = foldDocument();
    const source = foldSourceView(document);
    const folded = projectView(document, source, [occurrenceRef("MSGZ")]);
    const expanded = expandAll(document, source);
    expect(canonicalise(expanded.relationOccurrences)).toBe(canonicalise(source.relationOccurrences));
    expect(validateView(expanded, document, options())).toEqual([]);
    let refusal: unknown;
    try {
      expandAll(document, folded);
    } catch (error) {
      refusal = error;
    }
    expect(refusal).toEqual({
      code: "occurrence-endpoint-mismatch",
      severity: "error",
      path: "relationOccurrences.occurrence:link.endpoints[1].occurrence",
      message: "projected endpoint for role target fails check projection-source-projected",
      refs: ["occurrence:link", "occurrence:MSGZ"],
      details: { role: "target", check: "projection-source-projected" },
    });
  });
});

describe("C.4 projection arms", () => {
  function armView(mutator: (view: ViewDocument) => ViewDocument): { document: SemanticDocument; view: ViewDocument } {
    const document = foldDocument();
    const source = foldSourceView(document);
    return { document, view: mutator(projectView(document, source, [occurrenceRef("MSGZ")])) };
  }

  it("representative-hidden", () => {
    const base = foldDocument();
    const document: SemanticDocument = {
      ...base,
      relations: {
        ...base.relations,
        "relation:xm": rel("xm", "generic@2", "link", [
          { role: "source", target: "entity:CHAT" },
          { role: "target", target: "entity:MSGZ" },
        ]),
      },
    };
    const view = createView({ viewId: viewRef("hidden"), semanticDocumentId: document.documentId });
    const hidden: ViewDocument = {
      ...view,
      revision: 1,
      entityOccurrences: {
        "occurrence:S": { id: occurrenceRef("S"), entity: entityRef("MSGZ"), geometry: { x: 40, y: 240, width: 460, height: 200 }, group: "grp.1.S" },
        "occurrence:Z": { id: occurrenceRef("Z"), entity: entityRef("MSGZ"), geometry: { x: 0, y: 0, width: 1000, height: 600 }, group: "grp.1.Z" },
        "occurrence:X": { id: occurrenceRef("X"), entity: entityRef("CHAT"), geometry: { x: 1200, y: 240, width: 460, height: 200 } },
      },
      relationOccurrences: {
        "occurrence:r": {
          id: occurrenceRef("r"),
          relation: relationRef("xm"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("X") },
            {
              role: "target",
              occurrence: occurrenceRef("Z"),
              semanticTarget: entityRef("MSGZ"),
              sourceOccurrence: occurrenceRef("S"),
            },
          ],
        },
      },
      portOccurrences: {},
      groups: {
        "grp.1.S": { id: "grp.1.S", occurrence: occurrenceRef("Z"), collapsed: true },
        "grp.1.Z": { id: "grp.1.Z", occurrence: occurrenceRef("S"), collapsed: true },
      },
      filters: [],
    };
    expect(validateView(hidden, document, options())).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "relationOccurrences.occurrence:r.endpoints[1].occurrence",
        message: "projected endpoint for role target fails check representative-hidden",
        refs: ["occurrence:r", "occurrence:Z"],
        details: { role: "target", check: "representative-hidden" },
      },
    ]);
  });

  it("provenance-missing", () => {
    const { document, view } = armView((folded) => ({
      ...folded,
      relationOccurrences: {
        ...folded.relationOccurrences,
        "occurrence:link": {
          ...folded.relationOccurrences["occurrence:link"]!,
          endpoints: [
            { role: "source", occurrence: occurrenceRef("CHAT") },
            { role: "target", occurrence: occurrenceRef("MSGZ"), semanticTarget: entityRef("TOPIC") } as never,
          ],
        },
      },
    }));
    expect(validateView(view, document, options())).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "relationOccurrences.occurrence:link.endpoints[1].occurrence",
        message: "projected endpoint for role target fails check provenance-missing",
        refs: ["occurrence:link", "occurrence:MSGZ"],
        details: { role: "target", check: "provenance-missing" },
      },
    ]);
  });

  it("provenance-mismatch", () => {
    const { document, view } = armView((folded) => ({
      ...folded,
      relationOccurrences: {
        ...folded.relationOccurrences,
        "occurrence:link": {
          ...folded.relationOccurrences["occurrence:link"]!,
          endpoints: [
            { role: "source", occurrence: occurrenceRef("CHAT") },
            {
              role: "target",
              occurrence: occurrenceRef("MSGZ"),
              semanticTarget: entityRef("TOPIC"),
              sourceOccurrence: occurrenceRef("SUB"),
            },
          ],
        },
      },
    }));
    expect(validateView(view, document, options())).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "relationOccurrences.occurrence:link.endpoints[1].occurrence",
        message: "projected endpoint for role target fails check provenance-mismatch",
        refs: ["occurrence:link", "occurrence:MSGZ"],
        details: { role: "target", check: "provenance-mismatch" },
      },
    ]);
  });

  it("projection-not-folded on a stale projection after unfold", () => {
    const { document, view } = armView((folded) => ({
      ...folded,
      groups: {
        ...folded.groups,
        "grp.4.MSGZ": { id: "grp.4.MSGZ", occurrence: occurrenceRef("MSGZ"), collapsed: false },
      },
    }));
    expect(validateView(view, document, options())).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "relationOccurrences.occurrence:link.endpoints[1].occurrence",
        message: "projected endpoint for role target fails check projection-not-folded",
        refs: ["occurrence:link", "occurrence:MSGZ"],
        details: { role: "target", check: "projection-not-folded" },
      },
    ]);
  });

  it("representative-not-container", () => {
    const base = baseDocument(["generic@2"]);
    const document: SemanticDocument = {
      ...base,
      revision: 1,
      entities: {
        "entity:P": ent("P", "generic@2", "node", { name: text("P") }),
        "entity:K": ent("K", "generic@2", "node", { name: text("K") }),
        "entity:X": ent("X", "generic@2", "node", { name: text("X") }),
      },
      relations: {
        "relation:xk": rel("xk", "generic@2", "link", [
          { role: "source", target: "entity:X" },
          { role: "target", target: "entity:K" },
        ]),
      },
      ports: {},
    };
    const view = createView({ viewId: viewRef("rep"), semanticDocumentId: document.documentId });
    const source: ViewDocument = {
      ...view,
      revision: 1,
      entityOccurrences: {
        "occurrence:P": { id: occurrenceRef("P"), entity: entityRef("P"), geometry: { x: 0, y: 0, width: 460, height: 200 } },
        "occurrence:K": { id: occurrenceRef("K"), entity: entityRef("K"), geometry: { x: 0, y: 300, width: 460, height: 200 }, group: "grp.1.P" },
        "occurrence:X": { id: occurrenceRef("X"), entity: entityRef("X"), geometry: { x: 1200, y: 240, width: 460, height: 200 } },
      },
      relationOccurrences: {
        "occurrence:r": {
          id: occurrenceRef("r"),
          relation: relationRef("xk"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("X") },
            {
              role: "target",
              occurrence: occurrenceRef("P"),
              semanticTarget: entityRef("K"),
              sourceOccurrence: occurrenceRef("K"),
            },
          ],
        },
      },
      portOccurrences: {},
      groups: { "grp.1.P": { id: "grp.1.P", occurrence: occurrenceRef("P"), collapsed: true } },
      filters: [],
    };
    expect(validateView(source, document, options())).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "relationOccurrences.occurrence:r.endpoints[1].occurrence",
        message: "projected endpoint for role target fails check representative-not-container",
        refs: ["occurrence:r", "occurrence:P"],
        details: { role: "target", check: "representative-not-container" },
      },
    ]);
  });

  it("projection-source-projected returns the structured C.4 refusal", () => {
    const document = foldDocument();
    const source = foldSourceView(document);
    const projected = projectView(document, source, [occurrenceRef("MSGZ")]);
    let refusal: unknown;
    try {
      projectView(document, projected, [occurrenceRef("MSGZ")]);
    } catch (error) {
      refusal = error;
    }
    expect(refusal).toEqual({
      code: "occurrence-endpoint-mismatch",
      severity: "error",
      path: "relationOccurrences.occurrence:link.endpoints[1].occurrence",
      message: "projected endpoint for role target fails check projection-source-projected",
      refs: ["occurrence:link", "occurrence:MSGZ"],
      details: { role: "target", check: "projection-source-projected" },
    });
  });

  it("provenance-first priority applies to a missing drawn occurrence", () => {
    const document = foldDocument();
    const source = foldSourceView(document);
    const folded = projectView(document, source, [occurrenceRef("MSGZ")]);
    const broken: ViewDocument = {
      ...folded,
      relationOccurrences: {
        ...folded.relationOccurrences,
        "occurrence:link": {
          ...folded.relationOccurrences["occurrence:link"]!,
          endpoints: [
            { role: "source", occurrence: occurrenceRef("CHAT") },
            {
              role: "target",
              occurrence: occurrenceRef("gone"),
              semanticTarget: entityRef("TOPIC"),
              sourceOccurrence: occurrenceRef("SUB"),
            },
          ],
        },
      },
    };
    expect(validateView(broken, document, options())).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "relationOccurrences.occurrence:link.endpoints[1].occurrence",
        message: "projected endpoint for role target fails check provenance-mismatch",
        refs: ["occurrence:link", "occurrence:gone"],
        details: { role: "target", check: "provenance-mismatch" },
      },
    ]);
  });

  it("redundant provenance on an unchanged visible collapsed-container endpoint is refused", () => {
    const base = baseDocument(["generic@2"]);
    const document: SemanticDocument = {
      ...base,
      revision: 1,
      entities: {
        "entity:P": ent("P", "generic@2", "container", { name: text("P") }),
        "entity:K": ent("K", "generic@2", "node", { name: text("K") }),
        "entity:X": ent("X", "generic@2", "node", { name: text("X") }),
      },
      relations: {
        "relation:pk": rel("pk", "generic@2", "contains", [
          { role: "parent", target: "entity:P" },
          { role: "child", target: "entity:K" },
        ]),
        "relation:xp": rel("xp", "generic@2", "link", [
          { role: "source", target: "entity:X" },
          { role: "target", target: "entity:P" },
        ]),
      },
      ports: {},
    };
    const view = createView({ viewId: viewRef("redundant"), semanticDocumentId: document.documentId });
    const drawn: ViewDocument = {
      ...view,
      revision: 1,
      entityOccurrences: {
        "occurrence:P": { id: occurrenceRef("P"), entity: entityRef("P"), geometry: { x: 0, y: 0, width: 460, height: 200 } },
        "occurrence:K": { id: occurrenceRef("K"), entity: entityRef("K"), geometry: { x: 0, y: 300, width: 460, height: 200 }, group: "grp.1.P" },
        "occurrence:X": { id: occurrenceRef("X"), entity: entityRef("X"), geometry: { x: 1200, y: 240, width: 460, height: 200 } },
      },
      relationOccurrences: {
        "occurrence:r": {
          id: occurrenceRef("r"),
          relation: relationRef("xp"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("X") },
            {
              role: "target",
              occurrence: occurrenceRef("P"),
              semanticTarget: entityRef("P"),
              sourceOccurrence: occurrenceRef("P"),
            },
          ],
        },
      },
      portOccurrences: {},
      groups: { "grp.1.P": { id: "grp.1.P", occurrence: occurrenceRef("P"), collapsed: true } },
      filters: [],
    };
    expect(validateView(drawn, document, options())).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "relationOccurrences.occurrence:r.endpoints[1].occurrence",
        message: "projected endpoint for role target fails check projection-not-folded",
        refs: ["occurrence:r", "occurrence:P"],
        details: { role: "target", check: "projection-not-folded" },
      },
    ]);
  });

  it("relation-target-hidden via the harness mask", () => {
    const base = baseDocument(["generic@2"]);
    const document: SemanticDocument = {
      ...base,
      revision: 1,
      entities: {
        "entity:A": ent("A", "generic@2", "container", { name: text("A") }),
        "entity:B": ent("B", "generic@2", "node", { name: text("B") }),
        "entity:X": ent("X", "generic@2", "node", { name: text("X") }),
      },
      relations: {
        "relation:ab": rel("ab", "generic@2", "link", [
          { role: "source", target: "entity:A" },
          { role: "target", target: "entity:B" },
        ]),
        "relation:xb": rel("xb", "generic@2", "link", [
          { role: "source", target: "entity:X" },
          { role: "target", target: "entity:B" },
        ]),
      },
      ports: {},
    };
    const view = createView({ viewId: viewRef("mask"), semanticDocumentId: document.documentId });
    const source: ViewDocument = {
      ...view,
      revision: 1,
      entityOccurrences: {
        "occurrence:A": { id: occurrenceRef("A"), entity: entityRef("A"), geometry: { x: 0, y: 0, width: 1000, height: 600 } },
        "occurrence:B": { id: occurrenceRef("B"), entity: entityRef("B"), geometry: { x: 40, y: 240, width: 460, height: 200 }, group: "grp.1.A" },
        "occurrence:X": { id: occurrenceRef("X"), entity: entityRef("X"), geometry: { x: 1200, y: 240, width: 460, height: 200 } },
      },
      relationOccurrences: {
        "occurrence:inner": {
          id: occurrenceRef("inner"),
          relation: relationRef("ab"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("A") },
            { role: "target", occurrence: occurrenceRef("B") },
          ],
        },
        "occurrence:r": {
          id: occurrenceRef("r"),
          relation: relationRef("xb"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("X") },
            { role: "target", occurrence: occurrenceRef("inner") },
          ],
        },
      },
      portOccurrences: {},
      groups: { "grp.1.A": { id: "grp.1.A", occurrence: occurrenceRef("A"), collapsed: false } },
      filters: [],
    };
    const diagnostics = validateView(source, document, options(), {
      projectedHiddenRelationOccurrences: [occurrenceRef("inner")],
    });
    expect(diagnostics).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "relationOccurrences.occurrence:r.endpoints[1].occurrence",
        message: "projected endpoint for role target fails check relation-target-hidden",
        refs: ["occurrence:r", "occurrence:inner"],
        details: { role: "target", check: "relation-target-hidden" },
      },
    ]);
  });
});

describe("B.4 authored solid summary with a separate dashed group", () => {
  function summarySource(): { document: SemanticDocument; source: ViewDocument } {
    const document = foldDocument();
    const base = foldSourceView(document);
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
        "sum:overview-chat": {
          id: "sum:overview-chat",
          sourceOccurrence: occurrenceRef("CHAT"),
          targetOccurrence: occurrenceRef("MSGZ"),
          label: "Chat events",
          relationIds: [relationRef("r-solid")],
          strokeStyle: "solid",
        },
      },
    };
    return { document, source };
  }

  it("source-validates and activates only the solid aggregate after folding", async () => {
    const mod = (await import("../src/index.js")) as typeof import("../src/index.js");
    const { document, source } = summarySource();
    expect(validateView(source, document, options())).toEqual([]);
    const folded = projectView(document, source, [occurrenceRef("MSGZ")]);
    expect(validateView(folded, document, options())).toEqual([]);
    const active = resolveSummaries(folded, document);
    expect(active.get("(occurrence:CHAT,occurrence:MSGZ,solid)")).toEqual({
      key: "(occurrence:CHAT,occurrence:MSGZ,solid)",
      definitionId: "sum:overview-chat",
      label: "Chat events",
      members: ["occurrence:r-solid"],
      relationIds: ["relation:r-solid"],
    });
    expect(active.get("(occurrence:CHAT,occurrence:MSGZ,dashed)")).toBeUndefined();
  });

  it("solid-summary-does-not-include-dashed stays source-valid with empty diagnostics", () => {
    const { document, source } = summarySource();
    expect(validateView(source, document, options())).toEqual([]);
  });
});

describe("B.5 distinct source definitions colliding after projection", () => {
  function collidingSource(): { document: SemanticDocument; source: ViewDocument } {
    const base = baseDocument(["generic@2"]);
    const document: SemanticDocument = {
      ...base,
      revision: 1,
      entities: {
        "entity:P": ent("P", "generic@2", "container", { name: text("P") }),
        "entity:C": ent("C", "generic@2", "container", { name: text("C") }),
        "entity:X": ent("X", "generic@2", "node", { name: text("X") }),
      },
      relations: {
        "relation:pc": rel("pc", "generic@2", "contains", [
          { role: "parent", target: "entity:P" },
          { role: "child", target: "entity:C" },
        ]),
        "relation:cx": rel("cx", "generic@2", "link", [
          { role: "source", target: "entity:C" },
          { role: "target", target: "entity:X" },
        ]),
      },
      ports: {},
    };
    const view = createView({ viewId: viewRef("collide"), semanticDocumentId: document.documentId });
    const source: ViewDocument = {
      ...view,
      revision: 1,
      entityOccurrences: {
        "occurrence:P": { id: occurrenceRef("P"), entity: entityRef("P"), geometry: { x: 0, y: 0, width: 1600, height: 900 } },
        "occurrence:C": { id: occurrenceRef("C"), entity: entityRef("C"), geometry: { x: 40, y: 240, width: 1000, height: 600 }, group: "grp.1.P" },
        "occurrence:X": { id: occurrenceRef("X"), entity: entityRef("X"), geometry: { x: 1700, y: 240, width: 460, height: 200 } },
      },
      relationOccurrences: {
        "occurrence:cx": {
          id: occurrenceRef("cx"),
          relation: relationRef("cx"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("C") },
            { role: "target", occurrence: occurrenceRef("X") },
          ],
        },
      },
      portOccurrences: {},
      groups: {
        "grp.1.P": { id: "grp.1.P", occurrence: occurrenceRef("P"), collapsed: false },
        "grp.1.C": { id: "grp.1.C", occurrence: occurrenceRef("C"), collapsed: false },
      },
      filters: [],
      summaryLabels: {
        s1: {
          id: "s1",
          sourceOccurrence: occurrenceRef("P"),
          targetOccurrence: occurrenceRef("X"),
          label: "P to X",
          relationIds: [relationRef("cx")],
        },
        s2: {
          id: "s2",
          sourceOccurrence: occurrenceRef("C"),
          targetOccurrence: occurrenceRef("X"),
          label: "C to X",
          relationIds: [relationRef("cx")],
        },
      },
    };
    return { document, source };
  }

  it("both definitions validate in the source and collide after folding P", () => {
    const { document, source } = collidingSource();
    expect(validateView(source, document, options())).toEqual([]);
    const folded = projectView(document, source, [occurrenceRef("P")]);
    expect(validateView(folded, document, options())).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "summaryLabels.s2",
        message: "summary definition s2 fails check summary-active-key-conflict",
        refs: ["s2", "occurrence:C", "occurrence:X"],
        details: {
          check: "summary-active-key-conflict",
          firstId: "s1",
          sourceRepresentative: "occurrence:P",
          targetRepresentative: "occurrence:X",
          strokeStyle: "solid",
        },
      },
    ]);
  });

  it("removing one definition restores a unique candidate", () => {
    const { document, source } = collidingSource();
    const { s2: _dropped, ...rest } = source.summaryLabels!;
    const folded = projectView(document, { ...source, summaryLabels: rest }, [occurrenceRef("P")]);
    expect(validateView(folded, document, options())).toEqual([]);
  });
});

describe("B.6 same relation in two drawings and summary arms", () => {
  it("scope prevents another drawing from entering the key", () => {
    const base = baseDocument(["generic@2"]);
    const document: SemanticDocument = {
      ...base,
      revision: 1,
      entities: {
        "entity:C": ent("C", "generic@2", "container", { name: text("C") }),
        "entity:D": ent("D", "generic@2", "container", { name: text("D") }),
        "entity:X": ent("X", "generic@2", "node", { name: text("X") }),
      },
      relations: {
        "relation:ck": rel("ck", "generic@2", "contains", [
          { role: "parent", target: "entity:C" },
          { role: "child", target: "entity:X" },
        ]),
        "relation:r": rel("r", "generic@2", "link", [
          { role: "source", target: "entity:C" },
          { role: "target", target: "entity:X" },
        ]),
      },
      ports: {},
    };
    const view = createView({ viewId: viewRef("scope"), semanticDocumentId: document.documentId });
    const source: ViewDocument = {
      ...view,
      revision: 1,
      entityOccurrences: {
        "occurrence:C1": { id: occurrenceRef("C1"), entity: entityRef("C"), geometry: { x: 0, y: 0, width: 1000, height: 600 } },
        "occurrence:X1": { id: occurrenceRef("X1"), entity: entityRef("X"), geometry: { x: 40, y: 240, width: 460, height: 200 }, group: "grp.2.C1" },
        "occurrence:C2": { id: occurrenceRef("C2"), entity: entityRef("C"), geometry: { x: 0, y: 700, width: 1000, height: 600 } },
        "occurrence:X2": { id: occurrenceRef("X2"), entity: entityRef("X"), geometry: { x: 40, y: 940, width: 460, height: 200 }, group: "grp.2.C2" },
      },
      relationOccurrences: {
        "occurrence:r1": {
          id: occurrenceRef("r1"),
          relation: relationRef("r"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("C1") },
            { role: "target", occurrence: occurrenceRef("X1") },
          ],
        },
        "occurrence:r2": {
          id: occurrenceRef("r2"),
          relation: relationRef("r"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("C2") },
            { role: "target", occurrence: occurrenceRef("X2") },
          ],
        },
      },
      portOccurrences: {},
      groups: {
        "grp.2.C1": { id: "grp.2.C1", occurrence: occurrenceRef("C1"), collapsed: false },
        "grp.2.C2": { id: "grp.2.C2", occurrence: occurrenceRef("C2"), collapsed: false },
      },
      filters: [],
      summaryLabels: {
        s1: {
          id: "s1",
          sourceOccurrence: occurrenceRef("C1"),
          targetOccurrence: occurrenceRef("X1"),
          label: "first only",
          relationIds: [relationRef("r")],
          relationOccurrences: [occurrenceRef("r1")],
        },
      },
    };
    expect(validateView(source, document, options())).toEqual([]);
  });

  it("summary-constituents-mismatch", () => {
    const document = foldDocument();
    const source = foldSourceView(document);
    const bad: ViewDocument = {
      ...source,
      summaryLabels: {
        s2: {
          id: "s2",
          sourceOccurrence: occurrenceRef("CHAT"),
          targetOccurrence: occurrenceRef("MSGZ"),
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
        refs: ["s2", "occurrence:CHAT", "occurrence:MSGZ"],
        details: { check: "summary-constituents-mismatch" },
      },
    ]);
  });

  it("summary-duplicate-key", () => {
    const document = foldDocument();
    const source = foldSourceView(document);
    const bad: ViewDocument = {
      ...source,
      summaryLabels: {
        s1: {
          id: "s1",
          sourceOccurrence: occurrenceRef("CHAT"),
          targetOccurrence: occurrenceRef("MSGZ"),
          label: "one",
          relationIds: [relationRef("link")],
        },
        s2: {
          id: "s2",
          sourceOccurrence: occurrenceRef("CHAT"),
          targetOccurrence: occurrenceRef("MSGZ"),
          label: "two",
          relationIds: [relationRef("link")],
        },
      },
    };
    expect(validateView(bad, document, options())).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "summaryLabels.s2",
        message: "summary definition s2 fails check summary-duplicate-key",
        refs: ["s2", "occurrence:CHAT", "occurrence:MSGZ"],
        details: { check: "summary-duplicate-key", firstId: "s1" },
      },
    ]);
  });

  it("summary-occurrence-ambiguous", () => {
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
    const view = createView({ viewId: viewRef("amb"), semanticDocumentId: document.documentId });
    const source: ViewDocument = {
      ...view,
      revision: 1,
      entityOccurrences: {
        "occurrence:C": { id: occurrenceRef("C"), entity: entityRef("C"), geometry: { x: 0, y: 0, width: 1000, height: 600 } },
        "occurrence:K": { id: occurrenceRef("K"), entity: entityRef("K"), geometry: { x: 40, y: 240, width: 460, height: 200 }, group: "grp.1.C" },
        "occurrence:X": { id: occurrenceRef("X"), entity: entityRef("X"), geometry: { x: 1200, y: 240, width: 460, height: 200 } },
        "occurrence:K2": { id: occurrenceRef("K2"), entity: entityRef("K"), geometry: { x: 540, y: 240, width: 460, height: 200 }, group: "grp.1.C" },
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
        "occurrence:rb": {
          id: occurrenceRef("rb"),
          relation: relationRef("r"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("K2") },
            { role: "target", occurrence: occurrenceRef("X") },
          ],
        },
      },
      portOccurrences: {},
      groups: { "grp.1.C": { id: "grp.1.C", occurrence: occurrenceRef("C"), collapsed: false } },
      filters: [],
      summaryLabels: {
        s2: {
          id: "s2",
          sourceOccurrence: occurrenceRef("C"),
          targetOccurrence: occurrenceRef("X"),
          label: "ambiguous",
          relationIds: [relationRef("r")],
        },
      },
    };
    expect(validateView(source, document, options())).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "summaryLabels.s2",
        message: "summary definition s2 fails check summary-occurrence-ambiguous",
        refs: ["s2", "occurrence:C", "occurrence:X"],
        details: { check: "summary-occurrence-ambiguous", relationId: "relation:r" },
      },
    ]);
  });

  it("heterogeneous styles never aggregate together", async () => {
    const mod = (await import("../src/index.js")) as typeof import("../src/index.js");
    const base = baseDocument(["generic@2"]);
    const document: SemanticDocument = {
      ...base,
      revision: 1,
      entities: {
        "entity:C": ent("C", "generic@2", "container", { name: text("C") }),
        "entity:K": ent("K", "generic@2", "node", { name: text("K") }),
        "entity:J": ent("J", "generic@2", "node", { name: text("J") }),
      },
      relations: {
        "relation:ck": rel("ck", "generic@2", "contains", [
          { role: "parent", target: "entity:C" },
          { role: "child", target: "entity:K" },
        ]),
        "relation:cj": rel("cj", "generic@2", "contains", [
          { role: "parent", target: "entity:C" },
          { role: "child", target: "entity:J" },
        ]),
        "relation:solid": rel("solid", "generic@2", "link", [
          { role: "source", target: "entity:K" },
          { role: "target", target: "entity:J" },
        ]),
        "relation:dashed": rel("dashed", "generic@2", "link", [
          { role: "source", target: "entity:J" },
          { role: "target", target: "entity:J" },
        ]),
      },
      ports: {},
    };
    const view = createView({ viewId: viewRef("het"), semanticDocumentId: document.documentId });
    const source: ViewDocument = {
      ...view,
      revision: 1,
      entityOccurrences: {
        "occurrence:C": { id: occurrenceRef("C"), entity: entityRef("C"), geometry: { x: 0, y: 0, width: 1000, height: 600 } },
        "occurrence:K": { id: occurrenceRef("K"), entity: entityRef("K"), geometry: { x: 40, y: 240, width: 460, height: 200 }, group: "grp.1.C" },
        "occurrence:J": { id: occurrenceRef("J"), entity: entityRef("J"), geometry: { x: 540, y: 240, width: 460, height: 200 }, group: "grp.1.C" },
        "occurrence:EXT": { id: occurrenceRef("EXT"), entity: entityRef("J"), geometry: { x: 1200, y: 240, width: 460, height: 200 } },
      },
      relationOccurrences: {
        "occurrence:s": {
          id: occurrenceRef("s"),
          relation: relationRef("solid"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("K") },
            { role: "target", occurrence: occurrenceRef("EXT") },
          ],
        },
        "occurrence:d": {
          id: occurrenceRef("d"),
          relation: relationRef("dashed"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("J") },
            { role: "target", occurrence: occurrenceRef("EXT") },
          ],
          strokeStyle: "dashed",
        },
      },
      portOccurrences: {},
      groups: { "grp.1.C": { id: "grp.1.C", occurrence: occurrenceRef("C"), collapsed: false } },
      filters: [],
      summaryLabels: {
        "sum:solid": {
          id: "sum:solid",
          sourceOccurrence: occurrenceRef("C"),
          targetOccurrence: occurrenceRef("EXT"),
          label: "Solid",
          relationIds: [relationRef("solid")],
          strokeStyle: "solid",
        },
      },
    };
    expect(validateView(source, document, options())).toEqual([]);
    const folded = projectView(document, source, [occurrenceRef("C")]);
    expect(validateView(folded, document, options())).toEqual([]);
    const active = resolveSummaries(folded, document);
    expect(active.size).toBe(1);
  });
});

describe("B.7 relation-to-relation folded target", () => {
  function relationTargetProfile(): (typeof generic2Profile) {
    return {
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
  }

  function relationTargetDocument(): { document: SemanticDocument; source: ViewDocument; profile: (typeof generic2Profile) } {
    const profile = relationTargetProfile();
    const base = baseDocument(["relchain@2" as never]);
    const document: SemanticDocument = {
      ...base,
      revision: 1,
      entities: {
        "entity:junction": ent("junction", "relchain@2" as never, "grouping", { name: text("Claims grouping") }),
        "entity:actor": ent("actor", "relchain@2" as never, "business-actor", { name: text("Actor") }),
        "entity:component": ent("component", "relchain@2" as never, "application-component", { name: text("Component") }),
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
    const view = createView({ viewId: viewRef("relfold"), semanticDocumentId: document.documentId });
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
          waypoints: [{ x: 500, y: 200 }, { x: 270, y: 240 }],
        },
      },
      portOccurrences: {},
      groups: {
        "occurrence:Z": { id: "occurrence:Z", occurrence: occurrenceRef("Z"), collapsed: false },
      },
      filters: [],
    };
    return { document, source, profile };
  }

  it("folds the relation target to the collapsed container with RelationRef provenance", async () => {
    const { document, source, profile } = relationTargetDocument();
    const scoped = { registry: createProfileRegistry([profile as never]), bindings: { schemaVersion: "1" as const, rows: [bindingRowFor(profile as never, SCOPED_CONSTRAINTS_ADAPTER)] } };
    expect(validateView(source, document, scoped)).toEqual([]);
    const folded = projectView(document, source, [occurrenceRef("Z")]);
    expect(folded.relationOccurrences["occurrence:r"]?.endpoints).toEqual([
      { role: "source", occurrence: occurrenceRef("EXT") },
      {
        role: "target",
        occurrence: occurrenceRef("Z"),
        semanticTarget: relationRef("assignment"),
        sourceOccurrence: occurrenceRef("flow"),
      },
    ]);
    expect(folded.relationOccurrences["occurrence:flow"]?.endpoints).toEqual([
      { role: "source", occurrence: occurrenceRef("Z") },
      { role: "target", occurrence: occurrenceRef("A1") },
    ]);
    expect(validateView(folded, document, scoped)).toEqual([]);
    const scene = foldedScene(folded, document, [occurrenceRef("Z")]);
    expect(scene.groupCollapsed).toEqual(["occurrence:A1"]);
    expect(scene.endpointHidden).toEqual(["occurrence:flow"]);
    expect(scene.drawnRelations).toEqual(["occurrence:r"]);
    const unfolded = projectView(document, source, []);
    expect(unfolded.relationOccurrences["occurrence:r"]?.endpoints[1]).toEqual({
      role: "target",
      occurrence: occurrenceRef("flow"),
    });
    expect(canonicalise(unfolded.relationOccurrences)).toBe(canonicalise(source.relationOccurrences));
  });

  it("isolated provenance-missing variant", async () => {
    const { document, source, profile } = relationTargetDocument();
    const scoped = { registry: createProfileRegistry([profile as never]), bindings: { schemaVersion: "1" as const, rows: [bindingRowFor(profile as never, SCOPED_CONSTRAINTS_ADAPTER)] } };
    const folded = projectView(document, source, [occurrenceRef("Z")]);
    const broken: ViewDocument = {
      ...folded,
      relationOccurrences: {
        ...folded.relationOccurrences,
        "occurrence:r": {
          ...folded.relationOccurrences["occurrence:r"]!,
          endpoints: [
            { role: "source", occurrence: occurrenceRef("EXT") },
            { role: "target", occurrence: occurrenceRef("Z"), semanticTarget: relationRef("assignment") } as never,
          ],
        },
      },
    };
    expect(validateView(broken, document, scoped)).toEqual([
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

  it("isolated provenance-mismatch variant", async () => {
    const { document, source, profile } = relationTargetDocument();
    const scoped = { registry: createProfileRegistry([profile as never]), bindings: { schemaVersion: "1" as const, rows: [bindingRowFor(profile as never, SCOPED_CONSTRAINTS_ADAPTER)] } };
    const folded = projectView(document, source, [occurrenceRef("Z")]);
    const broken: ViewDocument = {
      ...folded,
      relationOccurrences: {
        ...folded.relationOccurrences,
        "occurrence:r": {
          ...folded.relationOccurrences["occurrence:r"]!,
          endpoints: [
            { role: "source", occurrence: occurrenceRef("EXT") },
            {
              role: "target",
              occurrence: occurrenceRef("Z"),
              semanticTarget: relationRef("assignment"),
              sourceOccurrence: occurrenceRef("r"),
            },
          ],
        },
      },
    };
    expect(validateView(broken, document, scoped)).toEqual([
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

  it("stale relation-target projection after unfold", async () => {
    const { document, source, profile } = relationTargetDocument();
    const scoped = { registry: createProfileRegistry([profile as never]), bindings: { schemaVersion: "1" as const, rows: [bindingRowFor(profile as never, SCOPED_CONSTRAINTS_ADAPTER)] } };
    const folded = projectView(document, source, [occurrenceRef("Z")]);
    const stale: ViewDocument = {
      ...folded,
      groups: {
        "occurrence:Z": { id: "occurrence:Z", occurrence: occurrenceRef("Z"), collapsed: false },
      },
    };
    expect(validateView(stale, document, scoped)).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "relationOccurrences.occurrence:r.endpoints[1].occurrence",
        message: "projected endpoint for role target fails check projection-not-folded",
        refs: ["occurrence:r", "occurrence:Z"],
        details: { role: "target", check: "projection-not-folded" },
      },
    ]);
  });

  it("separates semantic validity from view validity on the B.7 route", async () => {
    const { document, source, profile } = relationTargetDocument();
    const scoped = { registry: createProfileRegistry([profile as never]), bindings: { schemaVersion: "1" as const, rows: [bindingRowFor(profile as never, SCOPED_CONSTRAINTS_ADAPTER)] } };
    expect(validateDocument(document, scoped)).toEqual([]);
    expect(validateView(source, document, scoped)).toEqual([]);
  });

  it("accepts the still-visible projected-target alternative without provenance", async () => {
    const { document, source, profile } = relationTargetDocument();
    const scoped = { registry: createProfileRegistry([profile as never]), bindings: { schemaVersion: "1" as const, rows: [bindingRowFor(profile as never, SCOPED_CONSTRAINTS_ADAPTER)] } };
    const unfolded = projectView(document, source, []);
    expect(unfolded.relationOccurrences["occurrence:r"]?.endpoints[1]).toEqual({
      role: "target",
      occurrence: occurrenceRef("flow"),
    });
    expect(validateView(unfolded, document, scoped)).toEqual([]);
    expect(canonicalise(unfolded.relationOccurrences)).toBe(canonicalise(source.relationOccurrences));
  });
});

describe("conservation, round trips, deletion and semantic bytes", () => {
  it("source-valid inactive definition emits nothing", () => {
    const document = foldDocument();
    const source: ViewDocument = {
      ...foldSourceView(document),
      summaryLabels: {
        "sum:inactive": {
          id: "sum:inactive",
          sourceOccurrence: occurrenceRef("CHAT"),
          targetOccurrence: occurrenceRef("MSGZ"),
          label: "Inactive",
          relationIds: [relationRef("link")],
        },
      },
    };
    expect(validateView(source, document, options())).toEqual([]);
  });

  it("folding changes no semantic bytes", () => {
    const document = foldDocument();
    const before = canonicalise(document);
    const source = foldSourceView(document);
    projectView(document, source, [occurrenceRef("MSGZ")]);
    projectView(document, source, []);
    expect(canonicalise(document)).toBe(before);
    expect(serialiseView(source)).toContain('"revision":1');
  });

  it("projection never mutates its source input", () => {
    const document = foldDocument();
    const source = foldSourceView(document);
    const before = structuredClone(source);
    projectView(document, source, [occurrenceRef("MSGZ")]);
    projectView(document, source, []);
    expect(source).toEqual(before);
  });

  it("serialised views re-import byte-identically (folded, unfolded, summary-carrying)", () => {
    const document = foldDocument();
    const source = foldSourceView(document);
    const folded = projectView(document, source, [occurrenceRef("MSGZ")]);
    const withSummaries: ViewDocument = {
      ...source,
      summaryLabels: {
        "sum:overview-chat": {
          id: "sum:overview-chat",
          sourceOccurrence: occurrenceRef("CHAT"),
          targetOccurrence: occurrenceRef("MSGZ"),
          label: "Chat events",
          relationIds: [relationRef("link")],
          strokeStyle: "solid",
        },
      },
    };
    for (const view of [source, folded, withSummaries] as const) {
      const revived = JSON.parse(serialiseView(view)) as ViewDocument;
      expect(canonicalise(revived)).toBe(canonicalise(view));
    }
  });

  it("occurrence deletion plus undo restores the folded view byte for byte", () => {
    const document = foldDocument();
    const source = foldSourceView(document);
    const folded = projectView(document, source, [occurrenceRef("MSGZ")]);
    const state = createState(document, [folded]);
    const remove = {
      commandId: "rm-topic",
      baseRevision: document.revision,
      commands: [{ kind: "remove-occurrence", view: folded.viewId, occurrence: occurrenceRef("TOPIC") }],
    } as never;
    const removed = applyTransaction(state, remove, options());
    expect(removed.status).toBe("applied");
    if (removed.status !== "applied") return;
    expect(removed.state.views[folded.viewId]?.entityOccurrences["occurrence:TOPIC"]).toBeUndefined();
    expect(removed.state.views[folded.viewId]?.relationOccurrences["occurrence:link"]).toBeUndefined();
    expect(validateView(removed.state.views[folded.viewId]!, removed.state.document, options())).toEqual([]);
    const undone = applyInverse(removed.state, removed.inverse, { commandId: "undo-rm" }, options());
    expect(undone.status).toBe("applied");
    if (undone.status !== "applied") return;
    expect(canonicalise(undone.state.views[folded.viewId])).toBe(canonicalise({ ...folded, revision: undone.state.views[folded.viewId]!.revision }));
  });
});

describe("M1-c fix: conflicting active keys select no label", () => {
  function collidingSource(): { document: SemanticDocument; source: ViewDocument } {
    const base = baseDocument(["generic@2"]);
    const document: SemanticDocument = {
      ...base,
      revision: 1,
      entities: {
        "entity:P": ent("P", "generic@2", "container", { name: text("P") }),
        "entity:C": ent("C", "generic@2", "container", { name: text("C") }),
        "entity:X": ent("X", "generic@2", "node", { name: text("X") }),
      },
      relations: {
        "relation:pc": rel("pc", "generic@2", "contains", [
          { role: "parent", target: "entity:P" },
          { role: "child", target: "entity:C" },
        ]),
        "relation:cx": rel("cx", "generic@2", "link", [
          { role: "source", target: "entity:C" },
          { role: "target", target: "entity:X" },
        ]),
      },
      ports: {},
    };
    const view = createView({ viewId: viewRef("collide"), semanticDocumentId: document.documentId });
    const source: ViewDocument = {
      ...view,
      revision: 1,
      entityOccurrences: {
        "occurrence:P": { id: occurrenceRef("P"), entity: entityRef("P"), geometry: { x: 0, y: 0, width: 1600, height: 900 } },
        "occurrence:C": { id: occurrenceRef("C"), entity: entityRef("C"), geometry: { x: 40, y: 240, width: 1000, height: 600 }, group: "grp.1.P" },
        "occurrence:X": { id: occurrenceRef("X"), entity: entityRef("X"), geometry: { x: 1700, y: 240, width: 460, height: 200 } },
      },
      relationOccurrences: {
        "occurrence:cx": {
          id: occurrenceRef("cx"),
          relation: relationRef("cx"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("C") },
            { role: "target", occurrence: occurrenceRef("X") },
          ],
        },
      },
      portOccurrences: {},
      groups: {
        "grp.1.P": { id: "grp.1.P", occurrence: occurrenceRef("P"), collapsed: false },
        "grp.1.C": { id: "grp.1.C", occurrence: occurrenceRef("C"), collapsed: false },
      },
      filters: [],
      summaryLabels: {
        s1: {
          id: "s1",
          sourceOccurrence: occurrenceRef("P"),
          targetOccurrence: occurrenceRef("X"),
          label: "P to X",
          relationIds: [relationRef("cx")],
        },
        s2: {
          id: "s2",
          sourceOccurrence: occurrenceRef("C"),
          targetOccurrence: occurrenceRef("X"),
          label: "C to X",
          relationIds: [relationRef("cx")],
        },
      },
    };
    return { document, source };
  }

  it("B.5 selects no active label for a conflicting key and refuses the projection", () => {
    const { document, source } = collidingSource();
    const folded = projectView(document, source, [occurrenceRef("P")]);
    expect(validateView(folded, document, options())).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "summaryLabels.s2",
        message: "summary definition s2 fails check summary-active-key-conflict",
        refs: ["s2", "occurrence:C", "occurrence:X"],
        details: {
          check: "summary-active-key-conflict",
          firstId: "s1",
          sourceRepresentative: "occurrence:P",
          targetRepresentative: "occurrence:X",
          strokeStyle: "solid",
        },
      },
    ]);
    expect(resolveSummaries(folded, document).size).toBe(0);
  });
});

describe("M1-c fix: persisted identity rules", () => {
  it("requires summary key/id agreement", () => {
    const document = foldDocument();
    const source = foldSourceView(document);
    const bad: ViewDocument = {
      ...source,
      summaryLabels: {
        s1: {
          id: "s2",
          sourceOccurrence: occurrenceRef("CHAT"),
          targetOccurrence: occurrenceRef("MSGZ"),
          label: "renamed",
          relationIds: [relationRef("link")],
        },
      },
    };
    expect(validateView(bad, document, options())).toEqual([
      {
        code: "record-key-mismatch",
        severity: "error",
        path: "summaryLabels.s1",
        message: "record key s1 is not the summary definition id s2",
      },
    ]);
  });

  it("allows at most one fold group per occurrence", () => {
    const document = foldDocument();
    const source = foldSourceView(document);
    const bad: ViewDocument = {
      ...source,
      groups: {
        ...source.groups,
        "grp.9.DUP": { id: "grp.9.DUP", occurrence: occurrenceRef("MSGZ"), collapsed: false },
      },
    };
    expect(validateView(bad, document, options())).toEqual([
      {
        code: "occurrence-endpoint-mismatch",
        severity: "error",
        path: "groups.grp.9.DUP.occurrence",
        message:
          "fold group grp.9.DUP binds occurrence:MSGZ which is already bound by fold group grp.4.MSGZ; at most one fold group per occurrence",
        refs: ["occurrence:MSGZ"],
      },
    ]);
  });
});

describe("M1-c fix: fold group identity", () => {
  it("mints section 4.1.1 group ids for unbound collapsed occurrences", () => {
    const document = foldDocument();
    const source = foldSourceView(document);
    const groupless: ViewDocument = { ...source, groups: {} };
    const applied = applyDefaultFolds(document, groupless, [occurrenceRef("MSGZ")]);
    expect(Object.keys(applied.groups).sort()).toEqual(["grp.4.MSGZ"]);
    expect(applied.groups["grp.4.MSGZ"]).toEqual({
      id: "grp.4.MSGZ",
      occurrence: occurrenceRef("MSGZ"),
      collapsed: true,
    });
  });
});

describe("M1-c fix: B.3 further collapse selects the internal case", () => {
  function outerDocument(): SemanticDocument {
    const base = baseDocument(["generic@2"]);
    return {
      ...base,
      revision: 1,
      entities: {
        "entity:OUTER": ent("OUTER", "generic@2", "container", { name: text("OUTER") }),
        "entity:ZONE-A": ent("ZONE-A", "generic@2", "container", { name: text("ZONE-A") }),
        "entity:ZONE-B": ent("ZONE-B", "generic@2", "container", { name: text("ZONE-B") }),
        "entity:A1": ent("A1", "generic@2", "node", { name: text("A1") }),
        "entity:B1": ent("B1", "generic@2", "node", { name: text("B1") }),
        "entity:EXT": ent("EXT", "generic@2", "node", { name: text("EXT") }),
      },
      relations: {
        "relation:o-za": rel("o-za", "generic@2", "contains", [
          { role: "parent", target: "entity:OUTER" },
          { role: "child", target: "entity:ZONE-A" },
        ]),
        "relation:o-zb": rel("o-zb", "generic@2", "contains", [
          { role: "parent", target: "entity:OUTER" },
          { role: "child", target: "entity:ZONE-B" },
        ]),
        "relation:o-ext": rel("o-ext", "generic@2", "contains", [
          { role: "parent", target: "entity:OUTER" },
          { role: "child", target: "entity:EXT" },
        ]),
        "relation:za-a1": rel("za-a1", "generic@2", "contains", [
          { role: "parent", target: "entity:ZONE-A" },
          { role: "child", target: "entity:A1" },
        ]),
        "relation:zb-b1": rel("zb-b1", "generic@2", "contains", [
          { role: "parent", target: "entity:ZONE-B" },
          { role: "child", target: "entity:B1" },
        ]),
        "relation:assoc": rel("assoc", "generic@2", "association", [
          { role: "member", target: "entity:A1" },
          { role: "member", target: "entity:B1" },
          { role: "member", target: "entity:EXT" },
        ]),
      },
      ports: {},
    };
  }

  function outerSource(document: SemanticDocument): ViewDocument {
    const view = createView({ viewId: viewRef("outer"), semanticDocumentId: document.documentId });
    return {
      ...view,
      revision: 1,
      entityOccurrences: {
        "occurrence:OUTER": { id: occurrenceRef("OUTER"), entity: entityRef("OUTER"), geometry: { x: 0, y: 0, width: 2000, height: 1200 } },
        "occurrence:ZONE-A": { id: occurrenceRef("ZONE-A"), entity: entityRef("ZONE-A"), geometry: { x: 0, y: 0, width: 1000, height: 600 }, group: "grp.5.OUTER" },
        "occurrence:ZONE-B": { id: occurrenceRef("ZONE-B"), entity: entityRef("ZONE-B"), geometry: { x: 0, y: 700, width: 1000, height: 600 }, group: "grp.5.OUTER" },
        "occurrence:A1": { id: occurrenceRef("A1"), entity: entityRef("A1"), geometry: { x: 40, y: 240, width: 460, height: 200 }, group: "grp.6.ZONE-A" },
        "occurrence:B1": { id: occurrenceRef("B1"), entity: entityRef("B1"), geometry: { x: 40, y: 940, width: 460, height: 200 }, group: "grp.6.ZONE-B" },
        "occurrence:EXT": { id: occurrenceRef("EXT"), entity: entityRef("EXT"), geometry: { x: 1200, y: 240, width: 460, height: 200 }, group: "grp.5.OUTER" },
      },
      relationOccurrences: {
        "occurrence:m": {
          id: occurrenceRef("m"),
          relation: relationRef("assoc"),
          endpoints: [
            { role: "member", occurrence: occurrenceRef("A1") },
            { role: "member", occurrence: occurrenceRef("B1") },
            { role: "member", occurrence: occurrenceRef("EXT") },
          ],
        },
      },
      portOccurrences: {},
      groups: {
        "grp.5.OUTER": { id: "grp.5.OUTER", occurrence: occurrenceRef("OUTER"), collapsed: false },
        "grp.6.ZONE-A": { id: "grp.6.ZONE-A", occurrence: occurrenceRef("ZONE-A"), collapsed: false },
        "grp.6.ZONE-B": { id: "grp.6.ZONE-B", occurrence: occurrenceRef("ZONE-B"), collapsed: false },
      },
      filters: [],
    };
  }

  it("projects each member independently across two collapsed branches", () => {
    const document = outerDocument();
    const source = outerSource(document);
    const folded = projectView(document, source, [occurrenceRef("ZONE-A"), occurrenceRef("ZONE-B")]);
    expect(folded.relationOccurrences["occurrence:m"]?.endpoints).toEqual([
      { role: "member", occurrence: occurrenceRef("ZONE-A"), semanticTarget: entityRef("A1"), sourceOccurrence: occurrenceRef("A1") },
      { role: "member", occurrence: occurrenceRef("ZONE-B"), semanticTarget: entityRef("B1"), sourceOccurrence: occurrenceRef("B1") },
      { role: "member", occurrence: occurrenceRef("EXT") },
    ]);
    expect(validateView(folded, document, options())).toEqual([]);
  });

  it("collapsing the outer container internalises the association and draws nothing", () => {
    const document = outerDocument();
    const source = outerSource(document);
    const folded = projectView(document, source, [occurrenceRef("OUTER")]);
    expect(folded.relationOccurrences["occurrence:m"]?.endpoints).toEqual([
      { role: "member", occurrence: occurrenceRef("A1") },
      { role: "member", occurrence: occurrenceRef("B1") },
      { role: "member", occurrence: occurrenceRef("EXT") },
    ]);
    const scene = foldedScene(folded, document, [occurrenceRef("OUTER")]);
    expect(scene.endpointHidden).toEqual(["occurrence:m"]);
    expect(scene.drawnRelations).toEqual([]);
    expect(validateView(folded, document, options())).toEqual([]);
  });
});

describe("M1-c fix: B.6 activation beyond source validity", () => {
  function scopeSource(): { document: SemanticDocument; source: ViewDocument } {
    const base = baseDocument(["generic@2"]);
    const document: SemanticDocument = {
      ...base,
      revision: 1,
      entities: {
        "entity:C": ent("C", "generic@2", "container", { name: text("C") }),
        "entity:D": ent("D", "generic@2", "container", { name: text("D") }),
        "entity:X": ent("X", "generic@2", "node", { name: text("X") }),
      },
      relations: {
        "relation:ck": rel("ck", "generic@2", "contains", [
          { role: "parent", target: "entity:C" },
          { role: "child", target: "entity:X" },
        ]),
        "relation:r": rel("r", "generic@2", "link", [
          { role: "source", target: "entity:C" },
          { role: "target", target: "entity:X" },
        ]),
      },
      ports: {},
    };
    const view = createView({ viewId: viewRef("scope"), semanticDocumentId: document.documentId });
    const source: ViewDocument = {
      ...view,
      revision: 1,
      entityOccurrences: {
        "occurrence:C1": { id: occurrenceRef("C1"), entity: entityRef("C"), geometry: { x: 0, y: 0, width: 1000, height: 600 } },
        "occurrence:X1": { id: occurrenceRef("X1"), entity: entityRef("X"), geometry: { x: 40, y: 240, width: 460, height: 200 }, group: "grp.2.C1" },
        "occurrence:C2": { id: occurrenceRef("C2"), entity: entityRef("C"), geometry: { x: 0, y: 700, width: 1000, height: 600 } },
        "occurrence:X2": { id: occurrenceRef("X2"), entity: entityRef("X"), geometry: { x: 40, y: 940, width: 460, height: 200 }, group: "grp.2.C2" },
      },
      relationOccurrences: {
        "occurrence:r1": {
          id: occurrenceRef("r1"),
          relation: relationRef("r"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("C1") },
            { role: "target", occurrence: occurrenceRef("X1") },
          ],
        },
        "occurrence:r2": {
          id: occurrenceRef("r2"),
          relation: relationRef("r"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("C2") },
            { role: "target", occurrence: occurrenceRef("X2") },
          ],
        },
      },
      portOccurrences: {},
      groups: {
        "grp.2.C1": { id: "grp.2.C1", occurrence: occurrenceRef("C1"), collapsed: false },
        "grp.2.C2": { id: "grp.2.C2", occurrence: occurrenceRef("C2"), collapsed: false },
      },
      filters: [],
      summaryLabels: {
        s1: {
          id: "s1",
          sourceOccurrence: occurrenceRef("C1"),
          targetOccurrence: occurrenceRef("X1"),
          label: "first only",
          relationIds: [relationRef("r")],
          relationOccurrences: [occurrenceRef("r1")],
        },
        s2: {
          id: "s2",
          sourceOccurrence: occurrenceRef("C2"),
          targetOccurrence: occurrenceRef("X2"),
          label: "second only",
          relationIds: [relationRef("r")],
          relationOccurrences: [occurrenceRef("r2")],
        },
      },
    };
    return { document, source };
  }

  it("an unfolded aggregate acquires no summary without an actual fold projection", () => {
    const { document, source } = scopeSource();
    const folded = projectView(document, source, [occurrenceRef("C2")]);
    expect(validateView(folded, document, options())).toEqual([]);
    expect(resolveSummaries(folded, document).size).toBe(0);
    const scene = foldedScene(folded, document, [occurrenceRef("C2")]);
    expect(scene.endpointHidden).toEqual(["occurrence:r2"]);
    expect(scene.drawnRelations).toEqual(["occurrence:r1"]);
  });
});

describe("M1-c fix: native occurrence lookup ignores relation occurrences", () => {
  it("keeps dangling-reference for an endpoint on occurrence:flow-1", () => {
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
    expect(validateDocument(document, { registry: defaultProfileRegistry })).toEqual([]);
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

describe("M1-c fix: shared RelationRef carrier constraints", () => {
  function chainProfile(withMatrix: boolean): Profile {
    return {
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
        ...(withMatrix
          ? [{ kind: "relationship-matrix", matrixId: "m", sourceRole: "source", targetRole: "target", tuples: [{ relationType: "association", sourceType: "grouping", targetType: "business-actor" }, { relationType: "association", sourceType: "business-actor", targetType: "business-actor" }] } as never]
          : []),
      ],
      limits: {},
      notes: [],
    } as never;
  }

  it("refuses a cross-profile relation target without an admitted join", () => {
    const profile = chainProfile(false);
    const base = baseDocument(["relchain@2" as never, "generic@2"]);
    const document: SemanticDocument = {
      ...base,
      revision: 1,
      entities: {
        "entity:junction": ent("junction", "relchain@2" as never, "grouping", { name: text("Claims grouping") }),
        "entity:actor": ent("actor", "relchain@2" as never, "business-actor", { name: text("Actor") }),
        "entity:component": ent("component", "relchain@2" as never, "application-component", { name: text("Component") }),
        "entity:g-a": ent("g-a", "generic@2", "node", { name: text("A") }),
        "entity:g-b": ent("g-b", "generic@2", "node", { name: text("B") }),
      },
      relations: {
        "relation:serving": rel("serving", "relchain@2" as never, "groupingContainment", [
          { role: "parent", target: "entity:junction" },
          { role: "child", target: "entity:actor" },
        ]),
        "relation:assignment": rel("assignment", "generic@2", "link", [
          { role: "source", target: "entity:g-a" },
          { role: "target", target: "entity:g-b" },
        ]),
        "relation:flow": rel("flow", "relchain@2" as never, "association", [
          { role: "source", target: "entity:component" },
          { role: "target", target: "relation:assignment" },
        ]),
      },
      ports: {},
    };
    const scoped = {
      registry: createProfileRegistry([profile, generic2Profile]),
      bindings: { schemaVersion: "1" as const, rows: [bindingRowFor(profile, SCOPED_CONSTRAINTS_ADAPTER), bindingRowFor(generic2Profile, SCOPED_CONSTRAINTS_ADAPTER)] },
    };
    expect(validateDocument(document, scoped)).toEqual([
      {
        code: "endpoint-without-join",
        severity: "error",
        path: "relations.relation:flow.endpoints[1].target",
        message:
          "relation relation:flow applies relchain@2 association to relation relation:assignment owned by profile generic@2 with no admitted semantic join",
        refs: ["relation:assignment"],
        details: { profile: "relchain@2", targetProfile: "generic@2" },
      },
    ]);
  });

  it("classifies relation targets as @relation in matrix execution", () => {
    const profile = chainProfile(true);
    const base = baseDocument(["relchain@2" as never]);
    const document: SemanticDocument = {
      ...base,
      revision: 1,
      entities: {
        "entity:junction": ent("junction", "relchain@2" as never, "grouping", { name: text("Claims grouping") }),
        "entity:actor": ent("actor", "relchain@2" as never, "business-actor", { name: text("Actor") }),
        "entity:component": ent("component", "relchain@2" as never, "application-component", { name: text("Component") }),
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
    const scoped = {
      registry: createProfileRegistry([profile]),
      bindings: { schemaVersion: "1" as const, rows: [bindingRowFor(profile, SCOPED_CONSTRAINTS_ADAPTER)] },
    };
    expect(validateDocument(document, scoped)).toEqual([
      {
        code: "relationship-matrix-violation",
        severity: "error",
        path: "relations.relation:flow.endpoints",
        message: "relation relation:flow of type association is not allowed from application-component to @relation by matrix m",
        refs: ["relation:flow", "entity:component", "relation:assignment"],
        details: { matrixId: "m", relationType: "association", sourceType: "application-component", targetType: "@relation" },
      },
    ]);
  });
});

describe("M1-c fix: undirected summaries use the declared direction", () => {
  it("a source-valid reversed definition activates after folding", () => {
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

  it("an undirected relation with distinct role names matches swapped scopes", () => {
    const profile: Profile = {
      ...generic2Profile,
      id: "swap@2" as never,
      name: "swap",
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
          roles: [{ role: "source", cardinality: { min: 1, max: 1 }, targets: ["entity"] }, { role: "target", cardinality: { min: 1, max: 1 }, targets: ["entity"] }],
        },
      ],
      constraints: [],
      limits: {},
      notes: [],
    } as never;
    const base = baseDocument(["swap@2" as never]);
    const document: SemanticDocument = {
      ...base,
      revision: 1,
      entities: {
        "entity:Z": ent("Z", "swap@2" as never, "grouping", { name: text("Z") }),
        "entity:A1": ent("A1", "swap@2" as never, "business-actor", { name: text("A") }),
        "entity:EXT": ent("EXT", "swap@2" as never, "application-component", { name: text("E") }),
      },
      relations: {
        "relation:w": rel("w", "swap@2" as never, "association", [
          { role: "source", target: "entity:EXT" },
          { role: "target", target: "entity:A1" },
        ]),
      },
      ports: {},
    };
    const view = createView({ viewId: viewRef("swap"), semanticDocumentId: document.documentId });
    const source: ViewDocument = {
      ...view,
      revision: 1,
      entityOccurrences: {
        "occurrence:Z": { id: occurrenceRef("Z"), entity: entityRef("Z"), geometry: { x: 0, y: 0, width: 1000, height: 600 } },
        "occurrence:A1": { id: occurrenceRef("A1"), entity: entityRef("A1"), geometry: { x: 40, y: 240, width: 460, height: 200 }, group: "grp.1.Z" },
        "occurrence:EXT": { id: occurrenceRef("EXT"), entity: entityRef("EXT"), geometry: { x: 1200, y: 240, width: 460, height: 200 } },
      },
      relationOccurrences: {
        "occurrence:w": {
          id: occurrenceRef("w"),
          relation: relationRef("w"),
          endpoints: [
            { role: "source", occurrence: occurrenceRef("EXT") },
            { role: "target", occurrence: occurrenceRef("A1") },
          ],
        },
      },
      portOccurrences: {},
      groups: { "grp.1.Z": { id: "grp.1.Z", occurrence: occurrenceRef("Z"), collapsed: false } },
      filters: [],
      summaryLabels: {
        s1: {
          id: "s1",
          sourceOccurrence: occurrenceRef("Z"),
          targetOccurrence: occurrenceRef("EXT"),
          label: "swapped",
          relationIds: [relationRef("w")],
        },
      },
    };
    const scoped = {
      registry: createProfileRegistry([profile]),
      bindings: { schemaVersion: "1" as const, rows: [bindingRowFor(profile, SCOPED_CONSTRAINTS_ADAPTER)] },
    };
    expect(validateView(source, document, scoped)).toEqual([]);
  });
});

describe("M1-c fix: deletion cleans fold bindings and summary definitions", () => {
  function summarySource(): { document: SemanticDocument; source: ViewDocument } {
    const document = foldDocument();
    const base = foldSourceView(document);
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
      },
    };
    return { document, source };
  }

  it("removing a fold-owner occurrence cleans its group binding", () => {
    const document = foldDocument();
    const source = foldSourceView(document);
    const folded = projectView(document, source, [occurrenceRef("MSGZ")]);
    const state = createState(document, [folded]);
    const removed = applyTransaction(
      state,
      { commandId: "rm-msgz", baseRevision: document.revision, commands: [{ kind: "remove-occurrence", view: folded.viewId, occurrence: occurrenceRef("MSGZ") }] } as never,
      options(),
    );
    expect(removed.status).toBe("applied");
    if (removed.status !== "applied") return;
    const next = removed.state.views[folded.viewId]!;
    expect(next.entityOccurrences["occurrence:MSGZ"]).toBeUndefined();
    expect(next.relationOccurrences["occurrence:link"]).toBeUndefined();
    expect(next.groups).toEqual({});
    expect(next.entityOccurrences["occurrence:TOPIC"]).toMatchObject({ id: occurrenceRef("TOPIC") });
    expect(next.entityOccurrences["occurrence:TOPIC"]).not.toHaveProperty("group");
    expect(validateView(next, removed.state.document, options())).toEqual([]);
    const undone = applyInverse(removed.state, removed.inverse, { commandId: "undo-rm-msgz" }, options());
    expect(undone.status).toBe("applied");
    if (undone.status !== "applied") return;
    expect(canonicalise(undone.state.views[folded.viewId])).toBe(canonicalise({ ...folded, revision: undone.state.views[folded.viewId]!.revision }));
  });

  it("removing a summary member drops the emptied explicit definition", () => {
    const { document, source } = summarySource();
    expect(validateView(source, document, options())).toEqual([]);
    const state = createState(document, [source]);
    const removed = applyTransaction(
      state,
      { commandId: "rm-rsolid", baseRevision: document.revision, commands: [{ kind: "remove-occurrence", view: source.viewId, occurrence: occurrenceRef("r-solid") }] } as never,
      options(),
    );
    expect(removed.status).toBe("applied");
    if (removed.status !== "applied") return;
    const next = removed.state.views[source.viewId]!;
    expect(next.relationOccurrences["occurrence:r-solid"]).toBeUndefined();
    expect(next.summaryLabels ?? {}).toEqual({});
    expect(validateView(next, removed.state.document, options())).toEqual([]);
    const undone = applyInverse(removed.state, removed.inverse, { commandId: "undo-rm-rsolid" }, options());
    expect(undone.status).toBe("applied");
    if (undone.status !== "applied") return;
    expect(canonicalise(undone.state.views[source.viewId])).toBe(canonicalise({ ...source, revision: undone.state.views[source.viewId]!.revision }));
  });

  it("deleting a semantic relation prunes its ids and drops the emptied definition", () => {
    const { document, source } = summarySource();
    const state = createState(document, [source]);
    const removed = applyTransaction(
      state,
      { commandId: "del-rsolid", baseRevision: document.revision, commands: [{ kind: "delete-relation", relation: relationRef("r-solid"), policy: { occurrences: "cascade" } }] } as never,
      options(),
    );
    expect(removed.status).toBe("applied");
    if (removed.status !== "applied") return;
    const next = removed.state.views[source.viewId]!;
    expect(removed.state.document.relations["relation:r-solid"]).toBeUndefined();
    expect(next.relationOccurrences["occurrence:r-solid"]).toBeUndefined();
    expect(next.summaryLabels ?? {}).toEqual({});
    expect(validateView(next, removed.state.document, options())).toEqual([]);
    const undone = applyInverse(removed.state, removed.inverse, { commandId: "undo-del-rsolid" }, options());
    expect(undone.status).toBe("applied");
    if (undone.status !== "applied") return;
    expect(removed.state.document.revision).toBe(document.revision + 1);
    expect(canonicalise(undone.state.views[source.viewId])).toBe(canonicalise({ ...source, revision: undone.state.views[source.viewId]!.revision }));
    expect(undone.state.document.relations["relation:r-solid"]).toEqual(document.relations["relation:r-solid"]);
  });
});
