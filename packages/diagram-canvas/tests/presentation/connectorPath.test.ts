import { describe, expect, it } from "vitest";
import {
  connectorPath,
  DEFAULT_EDGE_CORNER_RADIUS,
  parseConnectorPath,
} from "../../src/presentation/connectorPath.js";
import { cardLineMeasurer, defaultCardMeasure, sceneCardMeasure } from "../../src/presentation/diagramCardModel.js";
import { renderSceneSvg } from "../../src/presentation/renderSceneSvg.js";
import { nestedZoneFixture } from "../../test-support/nestedZoneFixture.js";
import { hCondInput } from "../layout/dc2a/h-cond.js";
import type { Rect, Vec2 } from "../../src/transform.js";

const measureLines = cardLineMeasurer(sceneCardMeasure(defaultCardMeasure));

function borderDistance(point: Vec2, rect: Rect): number {
  const dx = Math.max(rect.x - point.x, 0, point.x - rect.x - rect.width);
  const dy = Math.max(rect.y - point.y, 0, point.y - rect.y - rect.height);
  if (dx > 0 || dy > 0) return Math.hypot(dx, dy);
  return Math.min(point.x - rect.x, rect.x + rect.width - point.x, point.y - rect.y, rect.y + rect.height - point.y);
}

describe("connectorPath — DE-2 rounded elbows", () => {
  it("draws a straight two-point route from exact start dock to exact end dock", () => {
    expect(connectorPath([{ x: 10, y: 20 }, { x: 150, y: 20 }])).toBe("M10 20 L150 20");
    expect(parseConnectorPath("M10 20 L150 20")).toEqual([{ x: 10, y: 20 }, { x: 150, y: 20 }]);
  });

  it("rounds a 90-degree elbow with the default radius of 12 world units", () => {
    expect(DEFAULT_EDGE_CORNER_RADIUS).toBe(12);
    const d = connectorPath([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 80 },
    ]);
    expect(d).toBe("M0 0 L88 0 Q100 0 100 12 L100 80");
    const parsed = parseConnectorPath(d);
    expect(parsed[0]).toEqual({ x: 0, y: 0 });
    expect(parsed[parsed.length - 1]).toEqual({ x: 100, y: 80 });
  });

  it("caps corner radius at half the shorter adjoining leg so bends never overshoot", () => {
    const d = connectorPath([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 100 },
    ]);
    // Shorter leg is 10 -> radius capped at 5 (not 12).
    expect(d).toBe("M0 0 L5 0 Q10 0 10 5 L10 100");
    const parsed = parseConnectorPath(d);
    expect(parsed[0]).toEqual({ x: 0, y: 0 });
    expect(parsed[parsed.length - 1]).toEqual({ x: 10, y: 100 });
  });

  it("keeps two adjacent bends on a short shared leg strictly non-overlapping", () => {
    // Shared middle leg has length 16 -> both bends cap at 8 and meet seamlessly at (50, 8).
    const d = connectorPath([
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 50, y: 16 },
      { x: 120, y: 16 },
    ]);
    expect(d).toBe("M0 0 L42 0 Q50 0 50 8 Q50 16 58 16 L120 16");
    const parsed = parseConnectorPath(d);
    expect(parsed[0]).toEqual({ x: 0, y: 0 });
    expect(parsed[parsed.length - 1]).toEqual({ x: 120, y: 16 });
  });

  it("simplifies collinear and duplicate waypoints without losing dock endpoints", () => {
    const d = connectorPath([
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 40, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 60 },
    ]);
    expect(d).toBe("M0 0 L88 0 Q100 0 100 12 L100 60");
  });

  it("renders rounded <path> connectors (never <polyline>) in renderSceneSvg touching both docks across fold states", () => {
    for (const folded of [false, true]) {
      const input = hCondInput("architecture", folded);
      const { svg, scene, result } = renderSceneSvg(input);
      expect(svg).not.toContain("<polyline");
      const matches = [...svg.matchAll(/<path data-scene-edge="([^"]+)" d="([^"]+)"/g)];
      expect(matches).toHaveLength(scene.edges.length);
      const rects = new Map(scene.nodes.map((node) => [node.occurrence as string, node.rect]));
      let bentCount = 0;
      for (const match of matches) {
        const occurrence = match[1]!;
        const d = match[2]!;
        const edge = scene.edges.find((e) => e.occurrence === occurrence)!;
        expect(d).toBe(connectorPath(edge.points));
        if (d.includes("Q")) bentCount += 1;
        const parsed = parseConnectorPath(d);
        expect(parsed[0]!.x).toBeCloseTo(edge.points[0]!.x, 6);
        expect(parsed[0]!.y).toBeCloseTo(edge.points[0]!.y, 6);
        expect(parsed[parsed.length - 1]!.x).toBeCloseTo(edge.points[edge.points.length - 1]!.x, 6);
        expect(parsed[parsed.length - 1]!.y).toBeCloseTo(edge.points[edge.points.length - 1]!.y, 6);
        const relOcc = result.view.relationOccurrences[occurrence as keyof typeof result.view.relationOccurrences]!;
        const ends = [...relOcc.endpoints]
          .sort((a, b) => (a.role < b.role ? -1 : a.role > b.role ? 1 : 0))
          .map((end) => result.view.portOccurrences[end.occurrence]?.ownerOccurrence ?? end.occurrence);
        expect(borderDistance(parsed[0]!, rects.get(ends[0]!)!)).toBeLessThanOrEqual(0.01);
        expect(borderDistance(parsed[parsed.length - 1]!, rects.get(ends[ends.length - 1]!)!)).toBeLessThanOrEqual(0.01);
      }
      expect(bentCount).toBeGreaterThan(0);
    }

    // Fold / unfold round-trip on nested zones re-routes with rounded paths touching docks.
    const fixture = nestedZoneFixture({ outside: true });
    const unfolded = renderSceneSvg({ ...fixture, measureLines, collapsed: [] });
    const folded = renderSceneSvg({ ...fixture, measureLines, collapsed: [fixture.zones[1]!] });
    expect(unfolded.svg).not.toContain("<polyline");
    expect(folded.svg).not.toContain("<polyline");
    expect(folded.scene.edges).toHaveLength(1);
    const foldedMatch = /<path data-scene-edge="([^"]+)" d="([^"]+)"/.exec(folded.svg)!;
    expect(foldedMatch).not.toBeNull();
    const foldedPoints = parseConnectorPath(foldedMatch[2]!);
    expect(foldedPoints[0]!.x).toBeCloseTo(folded.scene.edges[0]!.points[0]!.x, 6);
    expect(foldedPoints[0]!.y).toBeCloseTo(folded.scene.edges[0]!.points[0]!.y, 6);
    expect(foldedPoints[foldedPoints.length - 1]!.x).toBeCloseTo(folded.scene.edges[0]!.points[folded.scene.edges[0]!.points.length - 1]!.x, 6);
    expect(foldedPoints[foldedPoints.length - 1]!.y).toBeCloseTo(folded.scene.edges[0]!.points[folded.scene.edges[0]!.points.length - 1]!.y, 6);
  });
});
