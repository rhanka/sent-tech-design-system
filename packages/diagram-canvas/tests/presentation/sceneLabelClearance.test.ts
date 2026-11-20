import { describe, expect, it } from "vitest";

import { rectsIntersect } from "../../src/geometry.js";
import { clearSceneLabels } from "../../src/presentation/sceneLabelClearance.js";

describe("scene label clearance", () => {
  it("should choose the nearest exterior boundary of a negative-extent obstacle", () => {
    const label = { box: { x: 68, y: 30, width: 4, height: 18 } };
    const obstacle = { x: 100, y: 50, width: -40, height: -20 };
    // Horizontal exits are cheaper than either vertical exit. The raw edges
    // generate only inward horizontal candidates for this persisted rectangle.
    const cleared = clearSceneLabels([label], [], [obstacle], 2);
    expect(cleared[0]!.box).toEqual({ x: 54, y: 30, width: 4, height: 18 });
    expect(cleared).toEqual(clearSceneLabels([label], [], [{ x: 60, y: 30, width: 40, height: 20 }], 2));
    expect(rectsIntersect({ x: 52, y: 28, width: 8, height: 22 }, obstacle)).toBe(false);
  });

  it("should retain an unobstructed label and its leader", () => {
    const label = { box: { x: 10, y: 10, width: 20, height: 10 }, leader: [{ x: 0, y: 0 }, { x: 10, y: 10 }] };
    expect(clearSceneLabels([label], [], [], 2)).toEqual([label]);
    expect(clearSceneLabels([label], [], [], 2)[0]).toBe(label);
  });

  it("should preserve cost/y/x placement order and leader anchors in a dense scene", () => {
    const labels = Array.from({ length: 8 }, (_, id) => ({
      id, box: { x: 0, y: 0, width: 20, height: 10 },
      leader: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
    }));
    const routes = [[{ x: -50, y: 0 }, { x: 50, y: 0 }], [{ x: 0, y: -50 }, { x: 0, y: 50 }]];
    const shapes = [{ x: 0, y: 0, width: 30, height: 20 }, { x: -30, y: -20, width: 10, height: 10 }];
    const cleared = clearSceneLabels(labels, routes, shapes, 2);
    // Pin the placements of the original sorted-frontier search, including ties.
    expect(cleared.map(({ box: { x, y } }) => [x, y])).toEqual([
      [2, -12], [-22, 2], [2, 22], [2, -24], [32, 2], [24, -12], [-22, 14], [2, 34],
    ]);
    for (const [index, label] of cleared.entries()) {
      expect(label).toMatchObject({ id: index, box: { width: 20, height: 10 } });
      expect(label.leader[0]).toBe(labels[index]!.leader[0]);
      const end = label.leader.at(-1)!;
      expect(end.x).toBe(Math.max(label.box.x, Math.min(0, label.box.x + label.box.width)));
      expect(end.y).toBe(Math.max(label.box.y, Math.min(0, label.box.y + label.box.height)));
      const padded = { x: label.box.x - 2, y: label.box.y - 2, width: 24, height: 14 };
      for (const obstacle of [...shapes, ...cleared.slice(0, index).map(other => other.box),
        { x: -50, y: 0, width: 100, height: 0 }, { x: 0, y: -50, width: 0, height: 100 }]) {
        expect(rectsIntersect(padded, obstacle)).toBe(false);
      }
    }
    expect(labels.every(label => label.box.x === 0 && label.box.y === 0)).toBe(true);
  });

  it("should keep a label clear of rounded-elbow arcs inside a 90-degree bend (DE-2)", () => {
    const route = [{ x: 300, y: 100 }, { x: 100, y: 100 }, { x: 100, y: 0 }];
    const clearance = 6.777777777777778;
    // A label positioned at sharp-corner clearance inside the elbow would clear
    // both straight legs but fall inside the rounded corner (radius 12) chord.
    const insideElbow = { box: { x: 100 + clearance, y: 100 - clearance - 22, width: 70, height: 22 } };
    const cleared = clearSceneLabels([insideElbow], [route], [], clearance, 12);
    const box = cleared[0]!.box;
    // The quadratic Bézier midpoint is (103, 97); the cleared label must clear
    // both chord segments (112,100)-(103,97) and (103,97)-(100,88) by >= clearance.
    const chordPts = [{ x: 112, y: 100 }, { x: 103, y: 97 }, { x: 100, y: 88 }];
    const segDist = (a: { x: number; y: number }, b: { x: number; y: number }) => {
      const dx = b.x - a.x, dy = b.y - a.y;
      const p2b = (p: { x: number; y: number }) =>
        Math.hypot(Math.max(box.x - p.x, 0, p.x - (box.x + box.width)), Math.max(box.y - p.y, 0, p.y - (box.y + box.height)));
      const p2s = (x: number, y: number) => {
        const t = dx === 0 && dy === 0 ? 0 : Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy)));
        return Math.hypot(x - a.x - t * dx, y - a.y - t * dy);
      };
      return Math.min(
        p2b(a),
        p2b(b),
        ...[box.x, box.x + box.width].flatMap(x => [box.y, box.y + box.height].map(y => p2s(x, y))),
      );
    };
    expect(segDist(chordPts[0]!, chordPts[1]!)).toBeGreaterThanOrEqual(clearance - 1e-6);
    expect(segDist(chordPts[1]!, chordPts[2]!)).toBeGreaterThanOrEqual(clearance - 1e-6);
  });
});
