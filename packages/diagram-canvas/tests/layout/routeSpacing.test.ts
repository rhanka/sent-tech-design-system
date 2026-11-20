/**
 * DE-2 step 5 (OWNER-ADDENDA ask 2): minimum route spacing in the edge router
 * and built-in geometric conflict check.
 */
import {
  CURRENT_SCHEMA_VERSION,
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  documentRef,
  entityRef,
  m3ProfileRegistry,
  occurrenceRef,
  relationRef,
  shippedExecutorBindings,
  type Entity,
  type Relation,
  type SemanticDocument,
} from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import {
  channelCapacity,
  channelGap,
  channelMetrics,
  checkRouteSpacing,
  DEFAULT_ROUTE_BORDER_CLEARANCE,
  DEFAULT_ROUTE_SPACING,
  DEFAULT_ZONE_GUTTER,
  layoutDocument,
  subdivideChannelTracks,
  type CheckedRoute,
  type Rect,
} from "../../src/index.js";
import { layoutScene } from "../../src/presentation/diagramSceneModel.js";
import { measure } from "./fixtures.js";
import { hCondInput } from "./dc2a/h-cond.js";
import { pinnedMeasurer } from "./dc2a/scenes.js";

describe("channelCapacity and subdivideChannelTracks", () => {
  it("computes finite channel capacity from gap, routeSpacing and borderClearance", () => {
    // gap 72 with 15 clearance each side => 42 usable => floor(42/24)+1 = 2 tracks.
    expect(channelCapacity(72, 24, 15)).toBe(2);
    // gap 96 with 15 clearance each side => 66 usable => floor(66/24)+1 = 3 tracks.
    expect(channelCapacity(96, 24, 15)).toBe(3);
    // gap 120 => 90 usable => 4 tracks.
    expect(channelCapacity(120, 24, 15)).toBe(4);
    // gap narrower than 2 * borderClearance => 0 tracks.
    expect(channelCapacity(28, 24, 15)).toBe(0);
  });

  it("subdivides corridors symmetrically at routeSpacing pitch without halving even-track gutters", () => {
    // 72 px gutter -> grown corridor [15, 57], span = 42 -> 2 tracks at 24 and 48 (24 px apart, 24 px from raw borders).
    expect(subdivideChannelTracks(15, 57, 24)).toEqual([24, 48]);
    // 96 px gutter -> grown corridor [15, 81], span = 66 -> 3 tracks at 24, 48, 72.
    expect(subdivideChannelTracks(15, 81, 24)).toEqual([24, 48, 72]);
    // Narrow corridor (< routeSpacing) -> single midpoint track.
    expect(subdivideChannelTracks(10, 26, 24)).toEqual([18]);
  });
});

describe("checkRouteSpacing built-in geometric check", () => {
  const boxA: Rect = { x: 0, y: 0, width: 200, height: 100 };
  const boxB: Rect = { x: 400, y: 0, width: 200, height: 100 };
  const boxC: Rect = { x: 220, y: 200, width: 160, height: 100 };
  const rects = new Map<string, Rect>([
    ["a", boxA],
    ["b", boxB],
    ["c", boxC],
  ]);

  it("returns 0 conflicts for well-spaced orthogonal routes", () => {
    const routes: CheckedRoute[] = [
      {
        id: "r1",
        source: "a",
        target: "b",
        points: [
          { x: 200, y: 30 },
          { x: 400, y: 30 },
        ],
        arrowhead: "arrow",
      },
      {
        id: "r2",
        source: "a",
        target: "b",
        points: [
          { x: 200, y: 70 },
          { x: 400, y: 70 },
        ],
        arrowhead: "arrow",
      },
    ];
    const report = checkRouteSpacing({ rects, routes, routeSpacing: 24, borderClearance: 15 });
    expect(report.conflictCount).toBe(0);
    expect(report.conflicts).toEqual([]);
  });

  it("detects overlapping segments between distinct routes", () => {
    const routes: CheckedRoute[] = [
      {
        id: "r1",
        source: "a",
        target: "b",
        points: [
          { x: 200, y: 20 },
          { x: 300, y: 20 },
          { x: 300, y: 80 },
          { x: 400, y: 80 },
        ],
      },
      {
        id: "r2",
        source: "a",
        target: "b",
        points: [
          { x: 200, y: 80 },
          { x: 300, y: 80 },
          { x: 300, y: 20 },
          { x: 400, y: 20 },
        ],
      },
    ];
    const report = checkRouteSpacing({ rects, routes, routeSpacing: 24, borderClearance: 15 });
    expect(report.conflicts.some((c) => c.kind === "segment-overlap")).toBe(true);
    expect(report.conflictCount).toBeGreaterThan(0);
  });

  it("detects parallel segments closer than routeSpacing", () => {
    const routes: CheckedRoute[] = [
      {
        id: "r1",
        source: "a",
        target: "b",
        points: [
          { x: 200, y: 40 },
          { x: 400, y: 40 },
        ],
      },
      {
        id: "r2",
        source: "a",
        target: "b",
        points: [
          { x: 200, y: 52 },
          { x: 400, y: 52 },
        ],
      },
    ];
    const report = checkRouteSpacing({ rects, routes, routeSpacing: 24, borderClearance: 15 });
    expect(report.conflicts.some((c) => c.kind === "parallel-segment-spacing" && c.actual === 12)).toBe(true);
  });

  it("detects neighbouring elbows closer than routeSpacing", () => {
    const routes: CheckedRoute[] = [
      {
        id: "r1",
        source: "a",
        target: "b",
        points: [
          { x: 200, y: 20 },
          { x: 290, y: 20 },
          { x: 290, y: 150 },
          { x: 400, y: 150 },
        ],
      },
      {
        id: "r2",
        source: "a",
        target: "b",
        points: [
          { x: 200, y: 80 },
          { x: 300, y: 80 },
          { x: 300, y: 158 },
          { x: 400, y: 158 },
        ],
      },
    ];
    const report = checkRouteSpacing({ rects, routes, routeSpacing: 24, borderClearance: 15 });
    expect(report.conflicts.some((c) => c.kind === "elbow-spacing")).toBe(true);
  });

  it("detects ports and arrowheads closer than routeSpacing without double-counting same-entity arrowheads", () => {
    const routes: CheckedRoute[] = [
      {
        id: "r1",
        source: "a",
        target: "b",
        points: [
          { x: 200, y: 45 },
          { x: 260, y: 45 },
          { x: 260, y: 20 },
          { x: 340, y: 20 },
          { x: 340, y: 45 },
          { x: 400, y: 45 },
        ],
        arrowhead: "arrow",
      },
      {
        id: "r2",
        source: "a",
        target: "b",
        points: [
          { x: 200, y: 55 },
          { x: 260, y: 55 },
          { x: 260, y: 90 },
          { x: 340, y: 90 },
          { x: 340, y: 55 },
          { x: 400, y: 55 },
        ],
        arrowhead: "arrow",
      },
    ];
    const report = checkRouteSpacing({ rects, routes, routeSpacing: 24, borderClearance: 15 });
    // Source side (entity a, no arrowheads) reports port-spacing once; target side (entity b, both arrowed)
    // reports arrowhead-spacing once instead of double-counting as both port-spacing and arrowhead-spacing.
    expect(report.conflicts.filter((c) => c.kind === "port-spacing")).toHaveLength(1);
    expect(report.conflicts.filter((c) => c.kind === "arrowhead-spacing")).toHaveLength(1);
    expect(report.conflicts.find((c) => c.kind === "port-spacing")?.entity).toBe("a");
    expect(report.conflicts.find((c) => c.kind === "arrowhead-spacing")?.entity).toBe("b");
  });

  it("checks startArrowhead tips on backward flow edges", () => {
    const routes: CheckedRoute[] = [
      {
        id: "r1",
        source: "a",
        target: "b",
        points: [
          { x: 200, y: 45 },
          { x: 400, y: 20 },
        ],
        arrowhead: "none",
        startArrowhead: true,
      },
      {
        id: "r2",
        source: "a",
        target: "b",
        points: [
          { x: 200, y: 55 },
          { x: 400, y: 80 },
        ],
        arrowhead: "none",
        startArrowhead: true,
      },
    ];
    const report = checkRouteSpacing({ rects, routes, routeSpacing: 24, borderClearance: 15 });
    expect(report.conflicts.some((c) => c.kind === "arrowhead-spacing" && c.entity === "a")).toBe(true);
    expect(report.conflicts.some((c) => c.kind === "port-spacing" && c.entity === "a")).toBe(false);
  });

  it("audits passable expanded ancestor zone walls for 15 px link-to-border clearance", () => {
    const zoneRects = new Map<string, Rect>([
      ["z", { x: 0, y: 0, width: 600, height: 300 }],
      ["a", { x: 40, y: 60, width: 160, height: 100 }],
      ["b", { x: 700, y: 60, width: 160, height: 100 }],
    ]);
    // Segment runs parallel along y = 8, only 8 px inside passable ancestor zone z's top wall (y = 0).
    const routes: CheckedRoute[] = [
      {
        id: "r1",
        source: "a",
        target: "b",
        points: [
          { x: 120, y: 60 },
          { x: 120, y: 8 },
          { x: 780, y: 8 },
          { x: 780, y: 60 },
        ],
        passable: new Set(["z"]),
      },
    ];
    const report = checkRouteSpacing({ rects: zoneRects, routes, routeSpacing: 24, borderClearance: 15 });
    expect(report.conflicts.some((c) => c.kind === "link-to-border" && c.entity === "z" && c.actual === 8)).toBe(true);
  });

  it("detects link-to-border clearance violations against non-endpoint boxes", () => {
    // Passes y = 192, only 8 px above boxC (y = 200), violating borderClearance = 15.
    const routes: CheckedRoute[] = [
      {
        id: "r1",
        source: "a",
        target: "b",
        points: [
          { x: 100, y: 100 },
          { x: 100, y: 192 },
          { x: 500, y: 192 },
          { x: 500, y: 100 },
        ],
      },
    ];
    const report = checkRouteSpacing({ rects, routes, routeSpacing: 24, borderClearance: 15 });
    expect(report.conflicts.some((c) => c.kind === "link-to-border" && c.entity === "c" && c.actual === 8)).toBe(true);
  });

  it("detects longitudinal channel capacity exceeded", () => {
    const routes: CheckedRoute[] = [0, 1, 2].map((i) => ({
      id: `r${i}`,
      source: "a",
      target: "b",
      points: [
        { x: 200, y: 20 + i * 24 },
        { x: 240 + i * 16, y: 20 + i * 24 },
        { x: 240 + i * 16, y: 90 },
        { x: 400, y: 90 },
      ],
    }));
    const report = checkRouteSpacing({
      rects,
      routes,
      routeSpacing: 24,
      borderClearance: 15,
      channels: [
        {
          id: "ch1",
          axis: "horizontal",
          edges: ["r0", "r1", "r2"],
          strips: [{ x: 200, y: 0, width: 72, height: 100 }],
          n: 3,
          labelled: false,
          gap: 72,
          expected: 72,
          capacity: 2,
        },
      ],
    });
    expect(report.channelCapacity["ch1"]).toEqual({ capacity: 2, demand: 3, gap: 72 });
    expect(report.conflicts.some((c) => c.kind === "channel-capacity-exceeded" && c.channelId === "ch1")).toBe(true);
  });
});

describe("measured layout route spacing enforcement and diagnostics", () => {
  function multiZoneDocument(): {
    document: SemanticDocument;
    presentation: NonNullable<Parameters<typeof layoutDocument>[1]["presentation"]>;
  } {
    const entities: Record<string, Entity> = {};
    const relations: Record<string, Relation> = {};
    const add = (id: string, type: "node" | "container", name: string) => {
      entities[entityRef(id)] = {
        id: entityRef(id),
        profile: "generic@2",
        type,
        attributes: { name: { kind: "text", value: name } },
      };
    };
    add("z1", "container", "Zone Alpha");
    add("z2", "container", "Zone Beta");
    add("a1", "node", "Service A1");
    add("a2", "node", "Service A2");
    add("b1", "node", "Service B1");
    add("b2", "node", "Service B2");
    const contain = (p: string, c: string) => {
      const id = relationRef(`contains.${p}.${c}`);
      relations[id] = {
        id,
        profile: "generic@2",
        type: "contains",
        endpoints: [
          { role: "parent", target: entityRef(p) },
          { role: "child", target: entityRef(c) },
        ],
        attributes: {},
      };
    };
    contain("z1", "a1");
    contain("z1", "a2");
    contain("z2", "b1");
    contain("z2", "b2");
    const link = (id: string, src: string, dst: string) => {
      const ref = relationRef(id);
      relations[ref] = {
        id: ref,
        profile: "generic@2",
        type: "link",
        endpoints: [
          { role: "source", target: entityRef(src) },
          { role: "target", target: entityRef(dst) },
        ],
        attributes: {},
      };
    };
    link("l1", "a1", "b1");
    link("l2", "a2", "b2");
    link("l3", "a1", "b2");
    link("l4", "a1", "a2");
    const document: SemanticDocument = {
      documentId: documentRef("route-spacing-fold"),
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
    const presentation = {
      contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
      entities: {
        [occurrenceRef("e.z1")]: { form: "container" as const, text: { title: "Zone Alpha" } },
        [occurrenceRef("e.z2")]: { form: "container" as const, text: { title: "Zone Beta" } },
        [occurrenceRef("e.a1")]: { form: "card" as const, text: { title: "Service A1" } },
        [occurrenceRef("e.a2")]: { form: "card" as const, text: { title: "Service A2" } },
        [occurrenceRef("e.b1")]: { form: "card" as const, text: { title: "Service B1" } },
        [occurrenceRef("e.b2")]: { form: "card" as const, text: { title: "Service B2" } },
      },
      legends: {},
      categoryTokens: [],
    };
    return { document, presentation };
  }

  it("enforces zero route-spacing conflicts across unfolded and folded states", () => {
    const { document, presentation } = multiZoneDocument();
    for (const collapsed of [[], [occurrenceRef("e.z1")], [occurrenceRef("e.z2")], [occurrenceRef("e.z1"), occurrenceRef("e.z2")]]) {
      const result = layoutDocument(document, {
        registry: m3ProfileRegistry,
        bindings: shippedExecutorBindings,
        measureText: measure,
        measureLines: pinnedMeasurer,
        presentation,
        targetWidth: 1440,
        collapsed,
      });
      expect(result.status).toBe("laid-out");
      if (result.status !== "laid-out") continue;
      expect(result.routeSpacing).toBeDefined();
      expect(result.routeSpacing!.routeSpacing).toBe(DEFAULT_ROUTE_SPACING);
      expect(result.routeSpacing!.borderClearance).toBe(DEFAULT_ROUTE_BORDER_CLEARANCE);
      expect(result.routeSpacing!.conflictCount, JSON.stringify(result.routeSpacing!.conflicts)).toBe(0);
    }
  });

  it("reports non-blocking diagnostics when route spacing is impossible under tight custom metrics", () => {
    const { document, presentation } = multiZoneDocument();
    // Force an impossibly huge spacing token (180 px) so conflicts must be reported non-blockingly.
    const result = layoutDocument(document, {
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureText: measure,
      measureLines: pinnedMeasurer,
      presentation,
      targetWidth: 1440,
      metrics: { routeSpacing: 180, routeBorderClearance: 15 },
    });
    expect(result.status).toBe("laid-out");
    if (result.status !== "laid-out") return;
    expect(result.routeSpacing!.conflictCount).toBeGreaterThan(0);
    const spacingWarnings = result.warnings.filter(
      (w) => w.code === "route-spacing-conflict" || w.code === "channel-capacity-exceeded",
    );
    expect(spacingWarnings.length).toBe(result.routeSpacing!.conflictCount);
    expect(spacingWarnings.every((w) => w.severity === "info")).toBe(true);
  });

  it("enforces zero route-spacing conflicts on ALL visible fold states of the h-cond reference scenes (unfolded included, REQ-R7-13)", () => {
    let totalStates = 0;
    for (const name of ["architecture", "ontology"] as const) {
      const base = hCondInput(name, false);
      const parentEntityOf = new Map<string, string>();
      for (const rel of Object.values(base.document.relations)) {
        if (rel.type !== "contains") continue;
        const p = rel.endpoints.find((e) => e.role === "parent")?.target;
        const c = rel.endpoints.find((e) => e.role === "child")?.target;
        if (p !== undefined && c !== undefined) parentEntityOf.set(c, p);
      }
      const occByEntity = new Map<string, string>();
      const entityByOcc = new Map<string, string>();
      for (const [oid, occ] of Object.entries(base.view.entityOccurrences)) {
        occByEntity.set(occ.entity, oid);
        entityByOcc.set(oid, occ.entity);
      }
      const groups = Object.values(base.view.groups)
        .flatMap((g) => (g.occurrence === undefined ? [] : [g.occurrence]))
        .sort();
      const seen = new Set<string>();
      const totalMasks = 1 << groups.length;
      let sceneStates = 0;
      for (let mask = 0; mask < totalMasks; mask += 1) {
        const raw = new Set(groups.filter((_, i) => (mask & (1 << i)) !== 0));
        const isHidden = (oid: string): boolean => {
          let ent = parentEntityOf.get(entityByOcc.get(oid) ?? "");
          while (ent !== undefined) {
            const pOcc = occByEntity.get(ent);
            if (pOcc !== undefined && raw.has(pOcc as (typeof groups)[number])) return true;
            ent = parentEntityOf.get(ent);
          }
          return false;
        };
        const collapsed = [...raw].filter((oid) => !isHidden(oid)).sort();
        const key = collapsed.join(",");
        if (seen.has(key)) continue;
        seen.add(key);
        sceneStates += 1;

        const res = layoutScene({ ...base, collapsed });
        expect(res.status, `${name} [${key || "unfolded"}]`).toBe("laid-out");
        if (res.status !== "laid-out") continue;
        expect(res.routeSpacing, `${name} [${key || "unfolded"}]`).toBeDefined();
        expect(
          res.routeSpacing!.conflictCount,
          `${name} [${key || "unfolded"}] conflicts=${JSON.stringify(res.routeSpacing!.conflicts)}`,
        ).toBe(0);
        const obstructed = res.warnings.filter((w) => w.code === "route-obstructed");
        expect(obstructed, `${name} [${key || "unfolded"}] route-obstructed`).toEqual([]);
      }
      expect(sceneStates, `${name} distinct fold states`).toBeGreaterThanOrEqual(32);
      totalStates += sceneStates;
    }
    // 52 architecture + 32 ontology = 84 distinct visible fold states (>= 38 required by plan).
    expect(totalStates).toBe(84);
  }, 60_000);

  it("uses one fixed zoneGutter token (>= 96) between sibling zones on both axes and never widens it under traffic or fold (DE-2 ask 3)", () => {
    expect(DEFAULT_ZONE_GUTTER).toBeGreaterThanOrEqual(96);
    const params = channelMetrics({}, true);
    // channelGap never widens with route traffic or labels.
    expect(channelGap(0, false, params)).toBe(params.gapMin);
    expect(channelGap(8, true, params)).toBe(params.gapMin);

    // 4 sibling zones packed in 2x2 have both horizontal and vertical zone gutters.
    const entities: Record<string, Entity> = {};
    const relations: Record<string, Relation> = {};
    const presEntities: Record<string, { form: "container" | "card"; text: { title: string } }> = {};
    for (let z = 1; z <= 4; z += 1) {
      const zid = `z${z}`;
      const nid = `n${z}`;
      entities[entityRef(zid)] = {
        id: entityRef(zid),
        profile: "generic@2",
        type: "container",
        attributes: { name: { kind: "text", value: `Zone ${z}` } },
      };
      entities[entityRef(nid)] = {
        id: entityRef(nid),
        profile: "generic@2",
        type: "node",
        attributes: { name: { kind: "text", value: `Node ${z}` } },
      };
      presEntities[occurrenceRef(`e.${zid}`)] = { form: "container", text: { title: `Zone ${z}` } };
      presEntities[occurrenceRef(`e.${nid}`)] = { form: "card", text: { title: `Node ${z}` } };
      const cid = relationRef(`contains.${zid}.${nid}`);
      relations[cid] = {
        id: cid,
        profile: "generic@2",
        type: "contains",
        endpoints: [
          { role: "parent", target: entityRef(zid) },
          { role: "child", target: entityRef(nid) },
        ],
        attributes: {},
      };
    }
    // Add heavy inter-zone traffic across horizontal and vertical sibling gutters.
    for (const [idx, [s, t]] of [
      ["n1", "n2"],
      ["n1", "n3"],
      ["n1", "n4"],
      ["n2", "n3"],
      ["n2", "n4"],
      ["n3", "n4"],
    ].entries()) {
      const lid = relationRef(`l${idx}`);
      relations[lid] = {
        id: lid,
        profile: "generic@2",
        type: "link",
        endpoints: [
          { role: "source", target: entityRef(s!) },
          { role: "target", target: entityRef(t!) },
        ],
        attributes: { label: { kind: "text", value: `Long link label ${idx}` } },
      };
    }
    const document: SemanticDocument = {
      documentId: documentRef("fixed-zone-gutter"),
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
    const presentation = {
      contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
      entities: presEntities,
      legends: {},
      categoryTokens: [],
    };

    for (const collapsed of [[], [occurrenceRef("e.z1")]]) {
      const defaultRes = layoutDocument(document, {
        registry: m3ProfileRegistry,
        bindings: shippedExecutorBindings,
        measureText: measure,
        measureLines: pinnedMeasurer,
        presentation,
        targetWidth: 1440,
        collapsed,
      });
      expect(defaultRes.status).toBe("laid-out");
      if (defaultRes.status !== "laid-out") continue;
      const zoneChannels = (defaultRes.channels ?? []).filter((c) => c.zone);
      expect(zoneChannels.some((c) => c.axis === "horizontal")).toBe(true);
      expect(zoneChannels.some((c) => c.axis === "vertical")).toBe(true);
      for (const ch of zoneChannels) {
        expect(ch.gap, `${ch.id} (${ch.axis})`).toBe(DEFAULT_ZONE_GUTTER);
        expect(ch.expected, `${ch.id} expected`).toBe(DEFAULT_ZONE_GUTTER);
      }

      // Raising the single `zoneGutter` token moves BOTH horizontal and vertical zone gutters together.
      const customRes = layoutDocument(document, {
        registry: m3ProfileRegistry,
        bindings: shippedExecutorBindings,
        measureText: measure,
        measureLines: pinnedMeasurer,
        presentation,
        targetWidth: 1440,
        collapsed,
        metrics: { zoneGutter: 128 },
      });
      expect(customRes.status).toBe("laid-out");
      if (customRes.status !== "laid-out") continue;
      for (const ch of (customRes.channels ?? []).filter((c) => c.zone)) {
        expect(ch.gap, `custom ${ch.id} (${ch.axis})`).toBe(128);
      }
    }
  });
});
