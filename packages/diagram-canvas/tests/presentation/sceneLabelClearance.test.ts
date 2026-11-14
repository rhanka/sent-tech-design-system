import { describe, expect, it } from "vitest";

import { rectsIntersect } from "../../src/geometry.js";
import { clearSceneLabels } from "../../src/presentation/sceneLabelClearance.js";

describe("scene label clearance", () => {
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
});
