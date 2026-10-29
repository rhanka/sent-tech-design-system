/**
 * M1-d footprints (§4.6.1), legend keys and overflow (§4.6.4/§4.6.5).
 * Fixed boxes are never enlarged; overflow keeps every character.
 */
import {
  CURRENT_SCHEMA_VERSION,
  defaultProfileRegistry,
  documentRef,
  entityRef,
  GENERIC_PROFILE_ID,
  occurrenceRef,
  relationRef,
  type Entity,
  type Relation,
  type SemanticDocument,
} from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import { layoutDocument, relationRoute } from "../../src/index.js";
import { measure } from "./fixtures.js";
import {
  buildMeasuredDocument,
  geometryOf,
  layMeasured,
  makePresentation,
  occurrenceOfEntity,
  wordWrapMeasurer,
} from "./m1d-fixtures.js";

const presentation = makePresentation({
  forms: { C: "container", a: "card", b: "card", lone: "card" },
  texts: {
    C: { kicker: "Zone", title: "Container", subtitle: "boxed" },
    a: { title: "Alpha", body: "alpha body" },
    b: { title: "Beta" },
    lone: { title: "Lone" },
  },
});

describe("fixed footprints", () => {
  it("keeps leaves at 460x200", () => {
    const measured = layMeasured(buildMeasuredDocument(), presentation, wordWrapMeasurer());
    expect(geometryOf(measured.view, "a")).toMatchObject({ width: 460, height: 200 });
    expect(geometryOf(measured.view, "lone")).toMatchObject({ width: 460, height: 200 });
  });

  it("draws a collapsed container at 460x200 with no child occurrences", () => {
    const measured = layMeasured(buildMeasuredDocument(), presentation, wordWrapMeasurer(), {
      collapsed: [occurrenceOfEntity("C")],
    });
    expect(geometryOf(measured.view, "C")).toMatchObject({ width: 460, height: 200 });
    expect(measured.view.entityOccurrences[occurrenceOfEntity("a")]).toBeUndefined();
    expect(measured.view.entityOccurrences[occurrenceOfEntity("b")]).toBeUndefined();
  });

  it("computes an expanded container from header, children and insets", () => {
    const measured = layMeasured(buildMeasuredDocument(), presentation, wordWrapMeasurer());
    const box = geometryOf(measured.view, "C");
    expect(box.width).toBeGreaterThanOrEqual(460);
    const header = measured.headers.find((entry) => entry.occurrence === occurrenceOfEntity("C"))!;
    // 16 top inset + header band + 16 rule gap + two 200-high cards + gap + 16 bottom.
    expect(box.height).toBe(16 + header.height + 16 + 200 + 200 + 24 + 16);
  });
});

function buildLegendDocument(): SemanticDocument {
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
  add("LG", "container");
  add("k1", "node");
  add("k2", "node");
  for (const child of ["k1", "k2"]) {
    const relation = relationRef(`contains.${child}`);
    relations[relation] = {
      id: relation,
      profile: GENERIC_PROFILE_ID,
      type: "contains",
      endpoints: [
        { role: "parent", target: entityRef("LG") },
        { role: "child", target: entityRef(child) },
      ],
      attributes: {},
    };
  }
  return {
    documentId: documentRef("m1d-legend"),
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

describe("legend keys", () => {
  it("sizes keys from the legend inner width at fixed height 64", () => {
    const legendPresentation = makePresentation({
      forms: { LG: "legend", k1: "legend-key", k2: "legend-key" },
      texts: {
        LG: { kicker: "Key", title: "Legend", subtitle: "tones" },
        k1: { title: "First tone" },
        k2: { title: "Second tone" },
      },
      legends: { LG: ["k1", "k2"] },
    });
    const measurer = wordWrapMeasurer({ charWidth: 8 });
    const measured = layMeasured(buildLegendDocument(), legendPresentation, measurer);
    const legend = geometryOf(measured.view, "LG");
    const key = geometryOf(measured.view, "k1");
    expect(key.height).toBe(64);
    expect(key.width).toBe(legend.width - 32);
    const labelCall = measurer.calls.find((call) => call.role === "legend-label" && call.text === "First tone")!;
    expect(labelCall.availableWidth).toBe(legend.width - 32 - 32);
  });
});

describe("measurement overflow", () => {
  it("reports card-overflow with the box and every character kept", () => {
    const longBody = Array.from({ length: 60 }, (_, index) => `word${index}`).join(" ");
    const overflowing = makePresentation({
      forms: { C: "container", a: "card", b: "card", lone: "card" },
      texts: {
        C: { title: "Container" },
        a: { title: "Alpha", body: longBody },
        b: { title: "Beta" },
        lone: { title: "Lone" },
      },
    });
    const measured = layMeasured(buildMeasuredDocument(), overflowing, wordWrapMeasurer({ charWidth: 8 }));
    const codes = measured.warnings.map((warning) => warning.code);
    expect(codes).toContain("card-overflow");
    expect(geometryOf(measured.view, "a")).toMatchObject({ width: 460, height: 200 });
    const body = measured.slots.find((slot) => slot.role === "body")!;
    expect(body.layout.overflow).toBe(true);
    expect(body.layout.lines.join(" ")).toBe(longBody);
  });

  it("reports zone-overflow for an expanded header without resizing it", () => {
    const longSubtitle = Array.from({ length: 60 }, (_, index) => `term${index}`).join(" ");
    const overflowing = makePresentation({
      forms: { C: "container", a: "card", b: "card", lone: "card" },
      texts: {
        C: { title: "Container", subtitle: longSubtitle },
        a: { title: "Alpha" },
        b: { title: "Beta" },
        lone: { title: "Lone" },
      },
    });
    const measured = layMeasured(buildMeasuredDocument(), overflowing, wordWrapMeasurer({ charWidth: 8 }));
    expect(measured.warnings.map((warning) => warning.code)).toContain("zone-overflow");
    const header = measured.headers.find((entry) => entry.occurrence === occurrenceOfEntity("C"))!;
    expect(header.overflow).toBe(true);
    expect(header.subtitle!.lines.join(" ")).toBe(longSubtitle);
  });
});

describe("docking overflow", () => {
  it("keeps the box, fits in declared order and routes every relation", () => {
    const entities: Record<string, Entity> = {};
    const relations: Record<string, Relation> = {};
    const add = (local: string): void => {
      const ref = entityRef(local);
      entities[ref] = {
        id: ref,
        profile: GENERIC_PROFILE_ID,
        type: "node",
        attributes: { name: { kind: "text", value: local } },
      };
    };
    add("hub");
    const targets: string[] = [];
    for (let index = 0; index < 45; index += 1) {
      const target = `t${String(index).padStart(2, "0")}`;
      targets.push(target);
      add(target);
      const relation = relationRef(`link.${target}`);
      relations[relation] = {
        id: relation,
        profile: GENERIC_PROFILE_ID,
        type: "link",
        endpoints: [
          { role: "source", target: entityRef("hub") },
          { role: "target", target: entityRef(target) },
        ],
        attributes: {},
      };
    }
    const document: SemanticDocument = {
      documentId: documentRef("m1d-dock"),
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
    const forms: Record<string, "card"> = { hub: "card" };
    for (const target of targets) forms[target] = "card";
    const measured = layMeasured(document, makePresentation({ forms }), wordWrapMeasurer());
    expect(geometryOf(measured.view, "hub")).toMatchObject({ width: 460, height: 200 });
    const docking = measured.warnings.filter((warning) => warning.code === "docking-overflow");
    expect(docking.length).toBe(1);
    expect(docking[0]!.refs.join(" ")).toContain("e.hub");
    for (const target of targets) {
      const route = relationRoute(measured.view, occurrenceRef(`r.link.${target}`));
      expect(route).toBeDefined();
      expect(route!.length).toBeGreaterThanOrEqual(2);
    }
    // The compatibility path still grows nodes for docks: fixed boxes are a
    // diagram-path policy, never a change to the pinned behaviour.
    const legacy = layoutDocument(document, { registry: defaultProfileRegistry, measureText: measure, targetWidth: 4000 });
    if (legacy.status !== "laid-out") throw new Error("legacy refused");
    expect(legacy.view.entityOccurrences[occurrenceRef("e.hub")]!.geometry).not.toMatchObject({ width: 460, height: 200 });
  });
});
