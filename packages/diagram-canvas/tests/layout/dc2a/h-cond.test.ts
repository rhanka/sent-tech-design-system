import { describe, expect, it } from "vitest";
import { parentOccurrenceOf } from "@sentropic/diagram-core";
import { rectsIntersect } from "../../../src/index.js";
import { layoutScene, resolveScene, sceneFit, scenePlacement } from "../../../src/presentation/diagramSceneModel.js";
import { defaultCardMeasure, sceneCardMeasure, layoutCard, projectCardProps, projectZoneProps,
  zoneCollapsedCardProps } from "../../../src/presentation/diagramCardModel.js";
import { hCondInput } from "./h-cond.js";

describe("h-cond golden scenes", () => {
  it("should replace authored parallel routes with one visible bundle and a fresh bbox", () => {
    const source = hCondInput("architecture", true);
    const view = { ...source.view, relationOccurrences: Object.fromEntries(Object.entries(source.view.relationOccurrences)
      .map(([id, occurrence]) => [id, { ...occurrence, waypoints: [{ x: -10000, y: -10000 }, { x: -9000, y: -10000 }] }])) };
    const input = { ...source, view };
    const result = layoutScene(input);
    if (result.status !== "laid-out") throw new Error("fixture refused");
    const scene = resolveScene(result, input);
    expect(Object.keys(result.edgeBundles ?? {}).length).toBeGreaterThan(0);
    for (const bundle of Object.values(result.edgeBundles ?? {})) {
      expect(scene.edges.filter(edge => bundle.members.includes(edge.occurrence))).toHaveLength(1);
    }
    expect(scene.bounds!.x).toBeGreaterThan(-9000);
    expect(scene.bounds!.y).toBeGreaterThan(-9000);
  });
  for (const name of ["architecture", "ontology"] as const) for (const folded of [false, true]) for (const width of [1440, 390]) {
    it(`should keep ${name}/${folded ? "folded" : "unfolded"}/${width} complete and separated`, () => {
      const input = { ...hCondInput(name, folded), targetWidth: width };
      const result = layoutScene(input);
      expect(result.status).toBe("laid-out");
      if (result.status !== "laid-out") return;
      const scene = resolveScene(result, input);
      const cards = scene.nodes.filter(node => node.kind !== "zone" || node.collapsed);
      const headers = new Map(result.measurements!.headers.map(header => [header.occurrence, header.height]));
      for (const [i, a] of scene.nodes.entries()) {
        for (const b of scene.nodes.slice(i + 1)) {
          if (parentOccurrenceOf(result.view, a.occurrence) !== parentOccurrenceOf(result.view, b.occurrence)) continue;
          const dx = Math.max(b.rect.x - a.rect.x - a.rect.width, a.rect.x - b.rect.x - b.rect.width);
          const dy = Math.max(b.rect.y - a.rect.y - a.rect.height, a.rect.y - b.rect.y - b.rect.height);
          expect(Math.max(dx, dy), `${a.occurrence}/${b.occurrence} gap`).toBeGreaterThanOrEqual(24 - 0.01);
        }
        const parent = parentOccurrenceOf(result.view, a.occurrence);
        const parentNode = scene.nodes.find(node => node.occurrence === parent);
        if (parentNode !== undefined) {
          expect(a.rect.x).toBeGreaterThanOrEqual(parentNode.rect.x);
          expect(a.rect.y).toBeGreaterThanOrEqual(parentNode.rect.y);
          expect(a.rect.x + a.rect.width).toBeLessThanOrEqual(parentNode.rect.x + parentNode.rect.width + 0.01);
          expect(a.rect.y + a.rect.height).toBeLessThanOrEqual(parentNode.rect.y + parentNode.rect.height + 0.01);
        }
      }
      for (const [i, a] of cards.entries()) for (const b of cards.slice(i + 1)) expect(rectsIntersect(a.rect, b.rect), `${a.occurrence}/${b.occurrence}`).toBe(false);
      for (const card of cards) {
        const opts = { entityId: card.entity, resolveGlyph: () => ({ face: "" }) };
        const projected = card.kind === "zone"
          ? projectZoneProps(card.presentation, { ...opts, collapsed: true, toggleLabel: "toggle" })
          : projectCardProps(card.presentation, opts);
        if (projected.kind === "label") throw new Error("fixture card needs a presentation");
        const props = projected.kind === "zone" ? zoneCollapsedCardProps(projected.props) : projected.props;
        const measured = layoutCard({ ...props, autoSize: true, height: card.rect.height }, sceneCardMeasure(defaultCardMeasure));
        expect(measured.box.height, card.occurrence).toBeLessThanOrEqual(card.rect.height);
        expect(measured.bodyBottom, card.occurrence).toBeLessThanOrEqual(measured.bodyArea.bottom);
        expect(measured.box).toEqual({width:460,height:200});
        for (const diagnostic of measured.diagnostics.filter(diagnostic => diagnostic.code === "card-overflow")) {
          expect(diagnostic.severity).toBe("info");expect(diagnostic.reason).toBe("truncated");expect(diagnostic.hiddenLength).toBeGreaterThan(0);
        }
      }
      const blockers = scene.nodes.map(node => node.kind !== "zone" || node.collapsed ? node.rect
        : { ...node.rect, height: 16 + headers.get(node.occurrence)! });
      expect(scene.labels.length).toBeGreaterThan(0);
      for (const [i, label] of scene.labels.entries()) {
        for (const blocker of blockers) expect(rectsIntersect(label.box, blocker), `${label.occurrence} blocked`).toBe(false);
        for (const other of scene.labels.slice(i + 1)) expect(rectsIntersect(label.box, other.box)).toBe(false);
      }
      expect(result.warnings.filter(w => ["route-obstructed", "label-unplaced"].includes(w.code))).toEqual([]);
      for (const edge of scene.edges) {
        const occurrence = result.view.relationOccurrences[edge.occurrence]!;
        const ends = new Set(occurrence.endpoints.map(end => end.occurrence));
        for (const card of cards.filter(card => !ends.has(card.occurrence))) {
          for (let i = 1; i < edge.points.length; i += 1) {
            const a = edge.points[i - 1]!, b = edge.points[i]!;
            expect(rectsIntersect(card.rect, { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y),
              width: Math.abs(a.x - b.x), height: Math.abs(a.y - b.y) }), `${edge.occurrence}/${card.occurrence}`).toBe(false);
          }
        }
      }
      const bounds = scene.bounds!;
      const contains = (box: { x: number; y: number; width: number; height: number }) => {
        expect(box.x).toBeGreaterThanOrEqual(bounds.x - 0.01);
        expect(box.y).toBeGreaterThanOrEqual(bounds.y - 0.01);
        expect(box.x + box.width).toBeLessThanOrEqual(bounds.x + bounds.width + 0.01);
        expect(box.y + box.height).toBeLessThanOrEqual(bounds.y + bounds.height + 0.01);
      };
      scene.nodes.forEach(node => contains(node.rect));
      scene.labels.forEach(label => contains(label.box));
      scene.edges.forEach(edge => edge.points.forEach(point => contains({ ...point, width: 0, height: 0 })));
      const fit = sceneFit({ bounds, viewWidth: width, windowHeight: width === 1440 ? 900 : 844 });
      const placement = scenePlacement(bounds, fit.zoom, fit);
      expect(bounds.x * fit.zoom + placement.translateX).toBeGreaterThanOrEqual(0);
      expect(bounds.y * fit.zoom + placement.translateY).toBeGreaterThanOrEqual(0);
      expect(placement.contentWidth).toBeCloseTo(bounds.width * fit.zoom);
      expect({ nodes: scene.nodes.map(n => [n.occurrence, n.rect]), edges: scene.edges, labels: scene.labels, bounds }).toMatchSnapshot();
    });
  }
});
