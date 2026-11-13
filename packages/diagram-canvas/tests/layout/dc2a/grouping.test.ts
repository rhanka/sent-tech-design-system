/**
 * DC-2a L2 — authored `grouping` sub-levels on the measured path
 * (SPEC_EVOL_DC2A §3.3, §3.7, AC-12; build finding C-11).
 *
 * Authored groups partition a level before packing: each group packs as its
 * own sub-level in its authored direction, the ungrouped siblings form one
 * more packed run, and the parts are packed together by the same function.
 * `rows` is packed horizontal shelves and `columns` packed vertical shelves:
 * both values changed meaning with DC-2a (before: `rows` one vertical stack,
 * `columns` one horizontal row).
 */
import {
  CURRENT_SCHEMA_VERSION,
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  documentRef,
  entityRef,
  formatDiagnostics,
  m3ProfileRegistry,
  occurrenceRef,
  relationRef,
  shippedExecutorBindings,
  validateView,
  type DiagramForm,
  type Entity,
  type PresentationText,
  type Relation,
  type SemanticDocument,
} from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import { layoutDocument, type LayoutGroup, type LayoutHints, type LayoutResult, type Rect } from "../../../src/index.js";
import { measure } from "../fixtures.js";
import { pinnedMeasurer } from "./scenes.js";

/** One expanded zone `Z` holding `count` cards `c0…`, plus `roots` loose root cards `r0…`. */
function build(count: number, roots = 0): { document: SemanticDocument; forms: Record<string, { form: DiagramForm; text: PresentationText }> } {
  const entities: Record<string, Entity> = {};
  const relations: Record<string, Relation> = {};
  const forms: Record<string, { form: DiagramForm; text: PresentationText }> = {};
  const add = (local: string, container: boolean, parent?: string): void => {
    const ref = entityRef(local);
    entities[ref] = { id: ref, profile: "generic@2", type: container ? "container" : "node", attributes: { name: { kind: "text", value: local } } };
    forms[occurrenceRef(`e.${local}`)] = { form: container ? "container" : "card", text: { title: local } };
    if (parent === undefined) return;
    const relation = relationRef(`contains.${local}`);
    relations[relation] = {
      id: relation,
      profile: "generic@2",
      type: "contains",
      endpoints: [
        { role: "parent", target: entityRef(parent) },
        { role: "child", target: ref },
      ],
      attributes: {},
    };
  };
  add("Z", true);
  for (let index = 0; index < count; index += 1) add(`c${String(index)}`, false, "Z");
  for (let index = 0; index < roots; index += 1) add(`r${String(index)}`, false);
  return {
    document: {
      documentId: documentRef(`dc2a-grouping-${String(count)}-${String(roots)}`),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: ["generic@2"],
      typeDefinitions: {},
      entities,
      relations,
      ports: {},
      resources: {},
      extensions: [],
    },
    forms,
  };
}

function lay(count: number, hints: LayoutHints, roots = 0): { result: LayoutResult; rect: (local: string) => Rect } {
  const { document, forms } = build(count, roots);
  const result = layoutDocument(document, {
    registry: m3ProfileRegistry,
    bindings: shippedExecutorBindings,
    measureText: measure,
    targetWidth: 1440,
    presentation: { contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN }, entities: forms, legends: {}, categoryTokens: [] },
    measureLines: pinnedMeasurer,
    hints,
  });
  if (result.status === "laid-out") {
    expect(formatDiagnostics(validateView(result.view, document, { registry: m3ProfileRegistry, bindings: shippedExecutorBindings }))).toBe("");
  }
  return {
    result,
    rect: (local) => {
      if (result.status !== "laid-out") throw new Error(`refused: ${JSON.stringify(result.refusals)}`);
      return result.view.entityOccurrences[occurrenceRef(`e.${local}`)]!.geometry;
    },
  };
}

const cards = (from: number, to: number) => Array.from({ length: to - from }, (_, index) => entityRef(`c${String(from + index)}`));
const group = (id: string, direction: LayoutGroup["direction"], items: LayoutGroup["items"], extra: Partial<LayoutGroup> = {}): LayoutGroup => ({
  id,
  direction,
  items,
  ...extra,
});
/** Cells of a list of boxes: [column index, row index] by their distinct left and top edges. */
const cellsOf = (rects: readonly Rect[]): [number, number][] => {
  const xs = [...new Set(rects.map((rect) => rect.x))].sort((left, right) => left - right);
  const ys = [...new Set(rects.map((rect) => rect.y))].sort((left, right) => left - right);
  return rects.map((rect) => [xs.indexOf(rect.x), ys.indexOf(rect.y)]);
};

describe("DC-2a authored grouping (§3.3, §3.7)", () => {
  it("§3.7 rows: a `rows` group is packed horizontal shelves — four cards read 2 × 2, left to right then down", () => {
    const { rect } = lay(4, { grouping: [group("g", "rows", cards(0, 4))] });
    expect(cellsOf(cards(0, 4).map((_, index) => rect(`c${String(index)}`)))).toEqual([
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ]);
  });

  it("§3.7 columns: a `columns` group is packed vertical shelves — four cards read 2 × 2, top to bottom then right", () => {
    const { rect } = lay(4, { grouping: [group("g", "columns", cards(0, 4))] });
    expect(cellsOf(cards(0, 4).map((_, index) => rect(`c${String(index)}`)))).toEqual([
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ]);
  });

  it("BF-1: neither direction stacks two cards in one single column", () => {
    for (const direction of ["rows", "columns"] as const) {
      const { rect } = lay(2, { grouping: [group("g", direction, cards(0, 2))] });
      expect(rect("c1").y, direction).toBe(rect("c0").y);
      expect(rect("c1").x - (rect("c0").x + 460), direction).toBe(96);
    }
  });

  it("§3.3: each group is its own sub-level and the ungrouped siblings form one more packed run", () => {
    // Seven cards: a `rows` group of four, a `columns` group of two, one card left over.
    const { result, rect } = lay(7, { grouping: [group("a", "rows", cards(0, 4)), group("b", "columns", cards(4, 6))] });
    if (result.status !== "laid-out") throw new Error("refused");
    // Group a: 2 × 2, rows.
    expect(cellsOf(cards(0, 4).map((_, index) => rect(`c${String(index)}`)))).toEqual([
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ]);
    // Group b: two cards side by side (BF-1), packed on their own.
    expect(rect("c5").y).toBe(rect("c4").y);
    // The three parts never interleave: each keeps its own bounding box.
    const boxOf = (locals: readonly string[]): Rect => {
      const rects = locals.map(rect);
      const x = Math.min(...rects.map((r) => r.x));
      const y = Math.min(...rects.map((r) => r.y));
      return { x, y, width: Math.max(...rects.map((r) => r.x + r.width)) - x, height: Math.max(...rects.map((r) => r.y + r.height)) - y };
    };
    const parts = [boxOf(["c0", "c1", "c2", "c3"]), boxOf(["c4", "c5"]), boxOf(["c6"])];
    parts.forEach((a, index) => {
      for (const b of parts.slice(index + 1)) {
        expect(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y).toBe(true);
      }
    });
    // The level reports its orientation; the ungrouped run reports its own; an authored group reports none.
    const zone = "occurrence:e.Z";
    expect(Object.keys(result.orientations ?? {}).sort()).toEqual([zone, `${zone}#rest`, "root"].sort());
    // Every gap between two parts is the base token gap.
    const [a, b] = parts as [Rect, Rect, Rect];
    expect(Math.min(Math.abs(b.x - (a.x + a.width)), Math.abs(b.y - (a.y + a.height)))).toBe(72);
  });

  it("nested groups pack bottom-up: a subgroup is one box of its parent group", () => {
    const { rect } = lay(4, {
      grouping: [group("outer", "rows", [group("left", "columns", cards(0, 2)), group("right", "columns", cards(2, 4))])],
    });
    // Each subgroup is a pair on one row (BF-1); the two pairs sit on one row of the outer group.
    expect(rect("c1").y).toBe(rect("c0").y);
    expect(rect("c3").y).toBe(rect("c2").y);
    expect(rect("c2").y).toBe(rect("c0").y);
    expect(rect("c2").x).toBeGreaterThan(rect("c1").x);
  });

  it("gapAfter replaces the base gap after its group, and refuses above the axis cap (§3.7, AC-3)", () => {
    const { rect } = lay(4, { grouping: [group("a", "rows", cards(0, 2), { gapAfter: 8 }), group("b", "rows", cards(2, 4))] });
    const first = { right: rect("c1").x + 460, bottom: rect("c0").y + 200 };
    // The two groups pack on one row or two; either way the gap after group a is 8.
    const gap = rect("c2").y === rect("c0").y ? rect("c2").x - first.right : rect("c2").y - first.bottom;
    expect(gap).toBe(96);
    const refused = lay(4, { grouping: [group("a", "rows", cards(0, 2), { gapAfter: 241 }), group("b", "rows", cards(2, 4))] }).result;
    expect(refused.status).toBe("refused");
    if (refused.status !== "refused") return;
    expect(refused.refusals.map((refusal) => [refusal.code, refusal.path])).toEqual([["layout-hint-invalid", "hints.grouping.a.gapAfter"]]);
  });

  it("root groups pack like zone groups: one function for the root and the zones (AC-5)", () => {
    const { result, rect } = lay(1, { grouping: [group("roots", "columns", [entityRef("r0"), entityRef("r1"), entityRef("r2"), entityRef("r3")])] }, 4);
    if (result.status !== "laid-out") throw new Error("refused");
    expect(cellsOf(["r0", "r1", "r2", "r3"].map(rect))).toEqual([
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ]);
    // The zone is the ungrouped root: it sits beside or under the group, one base gap away, never inside it.
    expect(Object.keys(result.orientations ?? {})).toContain("root#rest");
  });

  it("a group naming a hidden member is not applied: the level packs as one run", () => {
    const grouped = lay(4, { grouping: [group("g", "columns", cards(0, 4))] });
    const plain = lay(4, {});
    expect(grouped.rect("c1")).not.toEqual(plain.rect("c1"));
    // rootOrder is validated with the other hints (NB-3): a non-root entry refuses.
    const refused = lay(2, { rootOrder: [entityRef("c0")] }).result;
    expect(refused.status).toBe("refused");
    if (refused.status === "refused") expect(refused.refusals[0]).toMatchObject({ code: "layout-hint-invalid", path: "hints.rootOrder" });
  });
});
