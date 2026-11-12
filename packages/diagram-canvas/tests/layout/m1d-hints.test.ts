/**
 * M1-d recursive layout hints (§4.7): interleaved items, refusals, stretch,
 * independent axis gaps, rankGap and insertion-order independence. The §8.7
 * oracle trees below are input data copied from the spec, never parsed from a
 * scene and never carrying source coordinates.
 */
import {
  CURRENT_SCHEMA_VERSION,
  defaultProfileRegistry,
  documentRef,
  entityRef,
  GENERIC_PROFILE_ID,
  relationRef,
  serialiseView,
  type Entity,
  type EntityRef,
  type Relation,
  type SemanticDocument,
} from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import { layoutDocument, type LayoutHints } from "../../src/index.js";
type Geometry = { readonly x: number; readonly y: number; readonly width: number; readonly height: number };
import { measure } from "./fixtures.js";
import {
  asGeneric2Document,
  buildMeasuredDocument,
  geometryOf,
  layMeasured,
  layMeasured2,
  makePresentation,
  occurrenceOfEntity,
  wordWrapMeasurer,
} from "./m1d-fixtures.js";

function buildZoneDocument(children: readonly string[], extraRoots: readonly string[] = []): SemanticDocument {
  const entities: Record<string, Entity> = {};
  const relations: Record<string, Relation> = {};
  const add = (local: string, type: "node" | "container"): void => {
    const ref = entityRef(local);
    entities[ref] = {
      id: ref,
      profile: GENERIC_PROFILE_ID,
      type,
      attributes: { name: { kind: "text", value: local } },
    };
  };
  add("P", "container");
  for (const child of [...children, ...extraRoots]) add(child, "node");
  for (const child of children) {
    const relation = relationRef(`contains.${child}`);
    relations[relation] = {
      id: relation,
      profile: GENERIC_PROFILE_ID,
      type: "contains",
      endpoints: [
        { role: "parent", target: entityRef("P") },
        { role: "child", target: entityRef(child) },
      ],
      attributes: {},
    };
  }
  return {
    documentId: documentRef("m1d-hints"),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    revision: 1,
    profileRefs: [GENERIC_PROFILE_ID],
    typeDefinitions: {},
    entities,
    relations,
    ports: {},
    resources: {},
    extensions: [],
  };
}

describe("ordering", () => {
  it("places siblings in the authored order", () => {
    const document = buildZoneDocument(["a", "b", "c"]);
    const forms = { P: "card" as const, a: "card" as const, b: "card" as const, c: "card" as const };
    const hints: LayoutHints = { ordering: { [entityRef("P")]: [entityRef("c"), entityRef("a")] } };
    const measured = layMeasured(document, makePresentation({ forms }), wordWrapMeasurer(), { hints });
    // DC-2a re-pin (AC-2, AC-4): three siblings pack as 2 + 1 instead of one
    // column; the authored order is the reading order, rows left to right
    // then top to bottom.
    const [c, a, b] = ["c", "a", "b"].map((local) => geometryOf(measured.view, local)) as [Geometry, Geometry, Geometry];
    expect(a.y).toBe(c.y);
    expect(a.x).toBeGreaterThan(c.x);
    expect(b.y).toBeGreaterThan(c.y);
    expect(b.x).toBe(c.x);
  });

  it("feeds the A2 RUNZ ordering as input data with UTF-16 fallback", () => {
    // §8.7 A2 ordering for entity:RUNZ, transcribed verbatim.
    const runz = ["APP", "PUSH", "CONS", "CHATCLI", "AGENT", "QUERY", "ADMINT"];
    const document = buildZoneDocument([...runz, "ZED"]);
    const forms: Record<string, "card"> = { P: "card" };
    for (const child of [...runz, "ZED"]) forms[child] = "card";
    const hints: LayoutHints = {
      ordering: { [entityRef("P")]: runz.map((local) => entityRef(local)) },
    };
    const measured = layMeasured(document, makePresentation({ forms }), wordWrapMeasurer(), { hints });
    const order = [...runz, "ZED"].sort(
      (left, right) => geometryOf(measured.view, left).y - geometryOf(measured.view, right).y,
    );
    expect(order).toEqual([...runz, "ZED"]);
  });
});

describe("oracle zone orderings", () => {
  it("feeds A2 orderings over two zones as input data", () => {
    // §8.7 A2 ordering for entity:GCP and entity:PROJ, transcribed verbatim.
    const gcp = ["PROJ", "SSMPROJ", "PRODZ"];
    const proj = ["LBIAP", "NET", "MSGZ", "RUNZ", "AEZ", "STATEZ", "VERTEXZ", "OBSZ", "CICDZ"];
    const entities: Record<string, Entity> = {};
    const relations: Record<string, Relation> = {};
    const add = (local: string, type: "node" | "container"): void => {
      const ref = entityRef(local);
      entities[ref] = {
        id: ref,
        profile: GENERIC_PROFILE_ID,
        type,
        attributes: { name: { kind: "text", value: local } },
      };
    };
    add("GCP", "container");
    add("PROJ", "container");
    for (const local of [...gcp.filter((entry) => entry !== "PROJ"), ...proj, "EXTRA"]) add(local, "node");
    const contain = (parent: string, child: string): void => {
      const relation = relationRef(`contains.${child}`);
      relations[relation] = {
        id: relation,
        profile: GENERIC_PROFILE_ID,
        type: "contains",
        endpoints: [
          { role: "parent", target: entityRef(parent) },
          { role: "child", target: entityRef(child) },
        ],
        attributes: {},
      };
    };
    for (const child of gcp) contain("GCP", child);
    for (const child of proj) contain("PROJ", child);
    contain("PROJ", "EXTRA");
    const document: SemanticDocument = {
      documentId: documentRef("m1d-a2"),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: [GENERIC_PROFILE_ID],
      typeDefinitions: {},
      entities,
      relations,
      ports: {},
      resources: {},
      extensions: [],
    };
    const forms: Record<string, "card"> = { GCP: "card", PROJ: "card" };
    for (const local of [...gcp.filter((entry) => entry !== "PROJ"), ...proj, "EXTRA"]) forms[local] = "card";
    const hints: LayoutHints = {
      ordering: {
        [entityRef("GCP")]: gcp.map((local) => entityRef(local)),
        [entityRef("PROJ")]: proj.map((local) => entityRef(local)),
      },
    };
    const measured = layMeasured(document, makePresentation({ forms }), wordWrapMeasurer(), { hints });
    const orderOf = (parent: string, members: readonly string[]): string[] =>
      [...members].sort((left, right) => geometryOf(measured.view, left).y - geometryOf(measured.view, right).y);
    expect(orderOf("GCP", gcp)).toEqual(gcp);
    // Unlisted siblings follow in UTF-16 reference order: EXTRA sorts last here.
    expect(orderOf("PROJ", [...proj, "EXTRA"])).toEqual([...proj, "EXTRA"]);
  });
});

describe("oracle A5 grouping", () => {
  it("feeds the HRPN kit grouping with interleaving and local stretch as input data", () => {
    // §8.7 A5 hints.grouping, transcribed verbatim (entity: prefix included).
    const entities: Record<string, Entity> = {};
    const relations: Record<string, Relation> = {};
    const add = (local: string, type: "node" | "container"): void => {
      const ref = entityRef(local);
      entities[ref] = {
        id: ref,
        profile: "generic@2",
        type,
        attributes: { name: { kind: "text", value: local } },
      };
    };
    for (const local of ["PEOPLE", "WS", "GCP", "PX", "MSGZ", "INGZ", "STATEZ", "VERTEXZ", "CHATAPI", "APP", "AGENT", "GITHUBZ", "GITLABZ", "AWSCI"]) {
      add(local, "node");
    }
    for (const local of ["LEGEND", "OUT", "PRODZ", "PPROZ", "RUNZ", "PSHARED"]) add(local, "container");
    const contain = (parent: string, child: string): void => {
      const relation = relationRef(`contains.${child}`);
      relations[relation] = {
        id: relation,
        profile: "generic@2",
        type: "contains",
        endpoints: [
          { role: "parent", target: entityRef(parent) },
          { role: "child", target: entityRef(child) },
        ],
        attributes: {},
      };
    };
    contain("PRODZ", "PPROZ");
    contain("PRODZ", "PSHARED");
    contain("PSHARED", "PX");
    contain("PPROZ", "MSGZ");
    contain("PPROZ", "INGZ");
    contain("PPROZ", "RUNZ");
    contain("PPROZ", "STATEZ");
    contain("PPROZ", "VERTEXZ");
    contain("RUNZ", "CHATAPI");
    contain("RUNZ", "APP");
    contain("RUNZ", "AGENT");
    contain("OUT", "GITHUBZ");
    contain("OUT", "GITLABZ");
    contain("OUT", "AWSCI");
    const document: SemanticDocument = {
      documentId: documentRef("m1d-a5"),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: ["generic@2"],
      typeDefinitions: {},
      entities,
      relations,
      ports: {},
      resources: {},
      extensions: [],
    };
    const forms: Record<string, "card" | "container"> = {
      PEOPLE: "card",
      WS: "card",
      LEGEND: "container",
      GCP: "card",
      OUT: "container",
      PRODZ: "container",
      PPROZ: "container",
      RUNZ: "container",
      PSHARED: "container",
    };
    for (const local of ["PX", "MSGZ", "INGZ", "STATEZ", "VERTEXZ", "CHATAPI", "APP", "AGENT", "GITHUBZ", "GITLABZ", "AWSCI"]) {
      forms[local] = "card";
    }
    const hints: LayoutHints = {
      grouping: [
        {
          id: "root",
          direction: "columns",
          items: [
            { id: "left", direction: "rows", items: [entityRef("PEOPLE"), entityRef("WS"), entityRef("LEGEND")] },
            { id: "right", direction: "rows", stretch: true, items: [entityRef("GCP"), entityRef("OUT")] },
          ],
        },
        { id: "PRODZ", direction: "rows", stretch: true, items: [entityRef("PPROZ"), entityRef("PSHARED")] },
        {
          id: "PPROZ",
          direction: "rows",
          items: [
            {
              id: "PPROZ-row",
              direction: "columns",
              items: [
                { id: "PPROZ-left", direction: "rows", items: [entityRef("MSGZ"), entityRef("INGZ")] },
                entityRef("RUNZ"),
                { id: "PPROZ-right", direction: "rows", items: [entityRef("STATEZ"), entityRef("VERTEXZ")] },
              ],
            },
          ],
        },
        { id: "RUNZ", direction: "rows", items: [entityRef("CHATAPI"), entityRef("APP"), entityRef("AGENT")] },
        { id: "OUT", direction: "columns", items: [entityRef("GITHUBZ"), entityRef("GITLABZ"), entityRef("AWSCI")] },
      ],
    };
    const measured = layMeasured2(document, makePresentation({ forms }), wordWrapMeasurer(), {
      hints,
      collapsed: [occurrenceOfEntity("LEGEND")],
    });
    // Fixed footprints are unchanged under the oracle trees.
    for (const local of ["PEOPLE", "WS", "GCP", "PX", "MSGZ", "CHATAPI", "GITHUBZ"]) {
      expect(geometryOf(measured.view, local)).toMatchObject({ width: 460, height: 200 });
    }
    expect(geometryOf(measured.view, "LEGEND")).toMatchObject({ width: 460, height: 200 });
    // DC-2a re-pin (§3.7, both redefinitions): a `rows` group is packed
    // horizontal shelves read left to right then top to bottom, a `columns`
    // group packed vertical shelves read top to bottom then left to right —
    // no longer one vertical stack and one horizontal row. Every group keeps
    // its authored reading order (AC-4).
    const at = (local: string): Geometry => geometryOf(measured.view, local);
    const readsAsRows = (locals: readonly string[]): void => {
      const read = [...locals].sort((left, right) => at(left).y - at(right).y || at(left).x - at(right).x);
      expect(read).toEqual(locals);
    };
    const readsAsColumns = (locals: readonly string[]): void => {
      const read = [...locals].sort((left, right) => at(left).x - at(right).x || at(left).y - at(right).y);
      expect(read).toEqual(locals);
    };
    readsAsRows(["PEOPLE", "WS", "LEGEND"]);
    readsAsRows(["GCP", "OUT"]);
    // The root group is `columns`: its two sub-groups never stack in one single column (BF-1).
    expect(at("GCP").x).toBeGreaterThan(at("PEOPLE").x);
    readsAsRows(["MSGZ", "INGZ"]);
    readsAsRows(["STATEZ", "VERTEXZ"]);
    readsAsColumns(["MSGZ", "RUNZ", "STATEZ"]);
    readsAsColumns(["GITHUBZ", "GITLABZ", "AWSCI"]);
    // PRODZ local stretch widens the expanded PSHARED to PPROZ, never the cards.
    expect(geometryOf(measured.view, "PSHARED").width).toBe(geometryOf(measured.view, "PPROZ").width);
    expect(geometryOf(measured.view, "PPROZ").width).toBeGreaterThan(460);
  });
});

describe("hint refusals", () => {
  it("refuses duplicate leaf membership in one context", () => {
    const document = buildZoneDocument(["a", "b"]);
    const forms = { P: "card" as const, a: "card" as const, b: "card" as const };
    const hints: LayoutHints = {
      grouping: [
        { id: "dup", direction: "rows", items: [entityRef("a"), entityRef("b"), entityRef("a")] },
      ],
    };
    const result = layoutDocument(document, {
      registry: defaultProfileRegistry,
      measureText: measure,
      targetWidth: 4000,
      presentation: makePresentation({ forms }),
      measureLines: wordWrapMeasurer(),
      hints,
    });
    expect(result.status).toBe("refused");
    if (result.status === "refused") {
      expect(result.refusals.map((refusal) => refusal.code)).toContain("layout-hint-invalid");
    }
  });

  it("refuses a reference outside its sibling context", () => {
    const document = buildZoneDocument(["a", "b"], ["stranger"]);
    const forms = {
      P: "card" as const,
      a: "card" as const,
      b: "card" as const,
      stranger: "card" as const,
    };
    const hints: LayoutHints = {
      grouping: [{ id: "scope", direction: "rows", items: [entityRef("a"), entityRef("stranger")] }],
    };
    const result = layoutDocument(document, {
      registry: defaultProfileRegistry,
      measureText: measure,
      targetWidth: 4000,
      presentation: makePresentation({ forms }),
      measureLines: wordWrapMeasurer(),
      hints,
    });
    expect(result.status).toBe("refused");
    if (result.status === "refused") {
      expect(result.refusals.map((refusal) => refusal.code)).toContain("layout-hint-invalid");
    }
  });
});

function buildColumnsDocument(): SemanticDocument {
  const entities: Record<string, Entity> = {};
  const relations: Record<string, Relation> = {};
  const add = (local: string, type: "node" | "container"): void => {
    const ref = entityRef(local);
    entities[ref] = {
      id: ref,
      profile: GENERIC_PROFILE_ID,
      type,
      attributes: { name: { kind: "text", value: local } },
    };
  };
  for (const local of ["PEOPLE", "WS", "GCP", "OUT", "k"]) add(local, "node");
  for (const local of ["G", "E1", "E2"]) add(local, "container");
  const contain = (parent: string, child: string): void => {
    const relation = relationRef(`contains.${child}`);
    relations[relation] = {
      id: relation,
      profile: GENERIC_PROFILE_ID,
      type: "contains",
      endpoints: [
        { role: "parent", target: entityRef(parent) },
        { role: "child", target: entityRef(child) },
      ],
      attributes: {},
    };
  };
  contain("G", "E1");
  contain("G", "E2");
  contain("E1", "k");
  return {
    documentId: documentRef("m1d-columns"),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    revision: 1,
    profileRefs: [GENERIC_PROFILE_ID],
    typeDefinitions: {},
    entities,
    relations,
    ports: {},
    resources: {},
    extensions: [],
  };
}

const columnsForms = {
  PEOPLE: "card",
  WS: "card",
  GCP: "card",
  OUT: "card",
  G: "card",
  E1: "card",
  E2: "card",
  k: "card",
} as const;

/** A5-style root interleaving with local stretch, as input data. */
function a5RootHints(): LayoutHints {
  return {
    grouping: [
      {
        id: "root",
        direction: "columns",
        items: [
          { id: "left", direction: "rows", items: [entityRef("PEOPLE"), entityRef("WS")] },
          {
            id: "right",
            direction: "rows",
            stretch: true,
            items: [entityRef("GCP"), entityRef("G"), entityRef("OUT")],
          },
        ],
      },
    ],
  };
}

describe("recursive grouping with local stretch", () => {
  it("keeps fixed cards while widening expanded boxes only", () => {
    const measured = layMeasured(buildColumnsDocument(), makePresentation({ forms: columnsForms }), wordWrapMeasurer(), {
      hints: a5RootHints(),
    });
    // Fixed footprints are unchanged under every hint.
    for (const local of ["PEOPLE", "WS", "GCP", "OUT", "k"]) {
      expect(geometryOf(measured.view, local)).toMatchObject({ width: 460, height: 200 });
    }
    // DC-2a re-pin (§3.7): the `rows` groups are horizontal shelves read
    // left to right then top to bottom, no longer vertical stacks; the root
    // `columns` group keeps its two sub-groups out of one single column (BF-1).
    const at = (local: string): Geometry => geometryOf(measured.view, local);
    for (const locals of [["PEOPLE", "WS"], ["GCP", "G", "OUT"]]) {
      expect([...locals].sort((left, right) => at(left).y - at(right).y || at(left).x - at(right).x)).toEqual(locals);
    }
    expect(at("WS").y).toBe(at("PEOPLE").y);
    expect(at("GCP").x).toBeGreaterThan(at("PEOPLE").x);
    // Local stretch widens the childless expanded E1 to E2, never the cards.
    expect(geometryOf(measured.view, "E1").width).toBe(geometryOf(measured.view, "E2").width);
    expect(geometryOf(measured.view, "E2").width).toBeGreaterThan(460);
  });

  it("lets local stretch override a false global stretch", () => {
    const hints: LayoutHints = {
      stretch: false,
      grouping: [
        {
          id: "root",
          direction: "rows",
          items: [
            {
              id: "inner",
              direction: "rows",
              stretch: true,
              items: [entityRef("G")],
            },
            entityRef("PEOPLE"),
          ],
        },
      ],
    };
    const measured = layMeasured(buildColumnsDocument(), makePresentation({ forms: columnsForms }), wordWrapMeasurer(), {
      hints,
    });
    expect(geometryOf(measured.view, "E1").width).toBe(geometryOf(measured.view, "E2").width);
    expect(geometryOf(measured.view, "PEOPLE")).toMatchObject({ width: 460, height: 200 });
  });
});

describe("independent axis gaps", () => {
  it("separates x effects from y effects", () => {
    const base = layMeasured(buildColumnsDocument(), makePresentation({ forms: columnsForms }), wordWrapMeasurer(), {
      hints: a5RootHints(),
    });
    const wideX = layMeasured(
      buildColumnsDocument(),
      makePresentation({ forms: columnsForms }),
      wordWrapMeasurer(),
      // DC-2a re-pin (AC-3, DEC-6): sibling gaps are capped at 32 px on both
      // axes and an override above the cap refuses, so the wide gap is 32.
      { hints: { ...a5RootHints(), cardGapX: 32, zoneGapX: 32 } },
    );
    for (const local of ["PEOPLE", "WS", "GCP", "OUT", "G", "E1", "E2", "k"]) {
      expect(geometryOf(wideX.view, local).y).toBe(geometryOf(base.view, local).y);
    }
    expect(geometryOf(wideX.view, "GCP").x - geometryOf(wideX.view, "PEOPLE").x).toBeGreaterThan(
      geometryOf(base.view, "GCP").x - geometryOf(base.view, "PEOPLE").x,
    );
    const tallY = layMeasured(
      buildColumnsDocument(),
      makePresentation({ forms: columnsForms }),
      wordWrapMeasurer(),
      { hints: { ...a5RootHints(), cardGapY: 32, zoneGapY: 32 } },
    );
    for (const local of ["PEOPLE", "WS", "GCP", "OUT", "G", "E1", "E2", "k"]) {
      expect(geometryOf(tallY.view, local).x).toBe(geometryOf(base.view, local).x);
    }
    // DC-2a re-pin: PEOPLE and WS now share a row; the y gap shows between
    // the two rows of the stretched right group (G wraps under GCP).
    expect(geometryOf(tallY.view, "OUT").y - geometryOf(tallY.view, "GCP").y).toBeGreaterThan(
      geometryOf(base.view, "OUT").y - geometryOf(base.view, "GCP").y,
    );
  });

  it("refuses a sibling gap above the axis cap instead of capping it (AC-3)", () => {
    const result = layoutDocument(buildColumnsDocument(), {
      registry: defaultProfileRegistry,
      measureText: measure,
      targetWidth: 4000,
      presentation: makePresentation({ forms: columnsForms }),
      measureLines: wordWrapMeasurer(),
      hints: { cardGapY: 160 },
    });
    expect(result.status).toBe("refused");
    if (result.status !== "refused") return;
    expect(result.refusals.map((refusal) => [refusal.code, refusal.path])).toEqual([["layout-hint-invalid", "hints.cardGapY"]]);
  });

  // DC-2a re-pin (§3.5): measured roots are seated with the token gaps of the
  // packer, never with `rankGap`, which belongs to the compatibility path.
  it("ignores rankGap on the measured path: roots take the token gaps", () => {
    const narrow = layMeasured(buildMeasuredDocument(), makePresentation({
      forms: { C: "card", a: "card", b: "card", lone: "card" },
    }), wordWrapMeasurer(), { hints: { rankGap: 40 } });
    const wide = layMeasured(buildMeasuredDocument(), makePresentation({
      forms: { C: "card", a: "card", b: "card", lone: "card" },
    }), wordWrapMeasurer(), { hints: { rankGap: 200 } });
    expect(serialiseView(wide.view)).toBe(serialiseView(narrow.view));
    const c = geometryOf(wide.view, "C");
    const lone = geometryOf(wide.view, "lone");
    // Two roots on one row, 24 px apart.
    expect(lone.y).toBe(c.y);
    expect(lone.x - (c.x + c.width)).toBe(24);
  });
});

describe("insertion-order independence", () => {
  it("places the same ordered tree identically under reordered records", () => {
    const kinds: EntityRef[] = [];
    const reversed = (): SemanticDocument => {
      const source = buildMeasuredDocument();
      const entities = Object.fromEntries(Object.entries(source.entities).reverse());
      const relations = Object.fromEntries(Object.entries(source.relations).reverse());
      kinds.push(...Object.keys(entities).map((key) => key as EntityRef));
      return { ...source, entities, relations };
    };
    const forms = { C: "card", a: "card", b: "card", lone: "card" } as const;
    const hints: LayoutHints = { ordering: { [entityRef("C")]: [entityRef("b"), entityRef("a")] } };
    const first = layMeasured(buildMeasuredDocument(), makePresentation({ forms }), wordWrapMeasurer(), { hints });
    const second = layMeasured(reversed(), makePresentation({ forms }), wordWrapMeasurer(), { hints });
    expect(kinds.length).toBeGreaterThan(0);
    expect(serialiseView(second.view)).toBe(serialiseView(first.view));
  });
});
