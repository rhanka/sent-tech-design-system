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
import { measure } from "./fixtures.js";
import {
  buildMeasuredDocument,
  geometryOf,
  layMeasured,
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
    const forms = { P: "container" as const, a: "card" as const, b: "card" as const, c: "card" as const };
    const hints: LayoutHints = { ordering: { [entityRef("P")]: [entityRef("c"), entityRef("a")] } };
    const measured = layMeasured(document, makePresentation({ forms }), wordWrapMeasurer(), { hints });
    const ys = ["c", "a", "b"].map((local) => geometryOf(measured.view, local).y);
    expect(ys).toEqual([...ys].sort((left, right) => left - right));
    expect(ys[0]!).toBeLessThan(ys[1]!);
    expect(ys[1]!).toBeLessThan(ys[2]!);
  });

  it("feeds the A2 RUNZ ordering as input data with UTF-16 fallback", () => {
    // §8.7 A2 ordering for entity:RUNZ, transcribed verbatim.
    const runz = ["APP", "PUSH", "CONS", "CHATCLI", "AGENT", "QUERY", "ADMINT"];
    const document = buildZoneDocument([...runz, "ZED"]);
    const forms: Record<string, "container" | "card"> = { P: "container" };
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
    const forms: Record<string, "container" | "card"> = { GCP: "container", PROJ: "container" };
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
        profile: GENERIC_PROFILE_ID,
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
        profile: GENERIC_PROFILE_ID,
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
      profileRefs: [GENERIC_PROFILE_ID],
      typeDefinitions: {},
      entities,
      relations,
      ports: {},
      resources: {},
      extensions: [],
    };
    const forms: Record<string, "container" | "card" | "legend"> = {
      PEOPLE: "card",
      WS: "card",
      LEGEND: "legend",
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
    const measured = layMeasured(document, makePresentation({ forms }), wordWrapMeasurer(), {
      hints,
      collapsed: [occurrenceOfEntity("LEGEND")],
    });
    // Fixed footprints are unchanged under the oracle trees.
    for (const local of ["PEOPLE", "WS", "GCP", "PX", "MSGZ", "CHATAPI", "GITHUBZ"]) {
      expect(geometryOf(measured.view, local)).toMatchObject({ width: 460, height: 200 });
    }
    expect(geometryOf(measured.view, "LEGEND")).toMatchObject({ width: 460, height: 200 });
    // Root interleaving: one shared x per column, right of left.
    expect(geometryOf(measured.view, "PEOPLE").x).toBe(geometryOf(measured.view, "WS").x);
    expect(geometryOf(measured.view, "GCP").x).toBe(geometryOf(measured.view, "OUT").x);
    expect(geometryOf(measured.view, "GCP").x).toBeGreaterThan(geometryOf(measured.view, "PEOPLE").x);
    // PPROZ interleaving: RUNZ between the left and right columns.
    expect(geometryOf(measured.view, "MSGZ").x).toBe(geometryOf(measured.view, "INGZ").x);
    expect(geometryOf(measured.view, "STATEZ").x).toBe(geometryOf(measured.view, "VERTEXZ").x);
    expect(geometryOf(measured.view, "RUNZ").x).toBeGreaterThan(geometryOf(measured.view, "MSGZ").x);
    expect(geometryOf(measured.view, "RUNZ").x).toBeLessThan(geometryOf(measured.view, "STATEZ").x);
    // OUT columns run horizontally.
    expect(geometryOf(measured.view, "GITHUBZ").x).toBeLessThan(geometryOf(measured.view, "GITLABZ").x);
    expect(geometryOf(measured.view, "GITLABZ").x).toBeLessThan(geometryOf(measured.view, "AWSCI").x);
    // PRODZ local stretch widens the expanded PSHARED to PPROZ, never the cards.
    expect(geometryOf(measured.view, "PSHARED").width).toBe(geometryOf(measured.view, "PPROZ").width);
    expect(geometryOf(measured.view, "PPROZ").width).toBeGreaterThan(460);
  });
});

describe("hint refusals", () => {
  it("refuses duplicate leaf membership in one context", () => {
    const document = buildZoneDocument(["a", "b"]);
    const forms = { P: "container" as const, a: "card" as const, b: "card" as const };
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
      P: "container" as const,
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
  G: "container",
  E1: "container",
  E2: "container",
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
    // Columns interleave: one shared x per column.
    expect(geometryOf(measured.view, "PEOPLE").x).toBe(geometryOf(measured.view, "WS").x);
    expect(geometryOf(measured.view, "GCP").x).toBe(geometryOf(measured.view, "G").x);
    expect(geometryOf(measured.view, "GCP").x).toBeGreaterThan(geometryOf(measured.view, "PEOPLE").x);
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
      { hints: { ...a5RootHints(), cardGapX: 160, zoneGapX: 160 } },
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
      { hints: { ...a5RootHints(), cardGapY: 160, zoneGapY: 160 } },
    );
    for (const local of ["PEOPLE", "WS", "GCP", "OUT", "G", "E1", "E2", "k"]) {
      expect(geometryOf(tallY.view, local).x).toBe(geometryOf(base.view, local).x);
    }
    expect(geometryOf(tallY.view, "WS").y - geometryOf(tallY.view, "PEOPLE").y).toBeGreaterThan(
      geometryOf(base.view, "WS").y - geometryOf(base.view, "PEOPLE").y,
    );
  });

  it("drives bands from rankGap with absent values inheriting metrics", () => {
    const narrow = layMeasured(buildMeasuredDocument(), makePresentation({
      forms: { C: "container", a: "card", b: "card", lone: "card" },
    }), wordWrapMeasurer(), { hints: { rankGap: 40 } });
    const wide = layMeasured(buildMeasuredDocument(), makePresentation({
      forms: { C: "container", a: "card", b: "card", lone: "card" },
    }), wordWrapMeasurer(), { hints: { rankGap: 200 } });
    expect(geometryOf(wide.view, "lone").y - geometryOf(wide.view, "C").y).toBeGreaterThan(
      geometryOf(narrow.view, "lone").y - geometryOf(narrow.view, "C").y,
    );
    expect(geometryOf(wide.view, "lone").x).toBe(geometryOf(narrow.view, "lone").x);
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
    const forms = { C: "container", a: "card", b: "card", lone: "card" } as const;
    const hints: LayoutHints = { ordering: { [entityRef("C")]: [entityRef("b"), entityRef("a")] } };
    const first = layMeasured(buildMeasuredDocument(), makePresentation({ forms }), wordWrapMeasurer(), { hints });
    const second = layMeasured(reversed(), makePresentation({ forms }), wordWrapMeasurer(), { hints });
    expect(kinds.length).toBeGreaterThan(0);
    expect(serialiseView(second.view)).toBe(serialiseView(first.view));
  });
});
