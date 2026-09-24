import { describe, expect, it } from "vitest";

import {
  buildRenderGraphBuffers,
  createLayoutEngine,
  createPositionFrame,
  DEFAULT_LAYOUT_ID,
  getLayout,
  resolveLayout,
  toPositions,
  type LayoutFn,
  type LayoutOutcome,
  type PositionFrame,
} from "../../src/index";

function sampleGraph() {
  return buildRenderGraphBuffers({
    nodes: [
      { id: "a", x: 1, y: 2 },
      { id: "b", x: 3, y: 4 },
      { id: "c", x: 5, y: 6 },
    ],
    edges: [{ source: "a", target: "b" }],
  });
}

const SEVEN_IDS = ["force", "typed-layer", "time-oriented", "git-flow", "radial", "grid", "metro"];

describe("registry compatibility — the seven registered ids with today's calling code", () => {
  it("every id resolves and returns a Float32Array of length 2 * nodeCount", () => {
    const graph = sampleGraph();
    for (const id of SEVEN_IDS) {
      const fn = resolveLayout(id);
      expect(fn).toBe(getLayout(id));
      const out = fn(graph);
      expect(out).toBeInstanceOf(Float32Array);
      expect(out.length).toBe(graph.nodeIds.length * 2);
      for (const v of out) expect(Number.isFinite(v)).toBe(true);
    }
  });

  it("the DEFAULT is unchanged: force stays the baked-positions passthrough", () => {
    expect(DEFAULT_LAYOUT_ID).toBe("force");
    const graph = sampleGraph();
    const out = (getLayout(DEFAULT_LAYOUT_ID) as LayoutFn)(graph);
    expect(Array.from(out)).toEqual(Array.from(graph.positions));
    expect(out).not.toBe(graph.positions);
  });

  it("resolveLayout still never throws and degrades unknown ids to the default", () => {
    expect(resolveLayout("does-not-exist")).toBe(getLayout(DEFAULT_LAYOUT_ID));
    expect(resolveLayout()).toBe(getLayout(DEFAULT_LAYOUT_ID));
  });
});

describe("rich results — toPositions and createLayoutEngine on both return forms", () => {
  it("toPositions passes a Float32Array through and unwraps a LayoutOutcome", () => {
    const plain = new Float32Array([1, 2, 3, 4, 5, 6]);
    expect(toPositions(plain)).toBe(plain);
    const outcome: LayoutOutcome = {
      positions: new Float32Array([9, 8, 7, 6, 5, 4]),
      nodes: ["a", "b", "c"],
      inverse: { projectedIndex: [0, 1, 2], resultIds: ["a", "b", "c"] },
    };
    expect(toPositions(outcome)).toBe(outcome.positions);
    expect(Array.from(toPositions(outcome))).toEqual([9, 8, 7, 6, 5, 4]);
  });

  it("createLayoutEngine wraps a Float32Array layout as a single static frame", () => {
    const graph = sampleGraph();
    const frames = [...(createLayoutEngine("grid").run(graph) as Iterable<PositionFrame>)];
    expect(frames).toHaveLength(1);
    expect(frames[0]!.positions).toBeInstanceOf(Float32Array);
    expect(frames[0]!.positions.length).toBe(graph.nodeIds.length * 2);
    expect(frames[0]!.tick).toBe(0);
  });

  it("createLayoutEngine wraps a LayoutOutcome layout via toPositions", () => {
    const graph = sampleGraph();
    const outcome: LayoutOutcome = {
      positions: new Float32Array([9, 8, 7, 6, 5, 4]),
      nodes: ["a", "b", "c"],
    };
    const frames = [
      ...(
        {
          *run(): Iterable<PositionFrame> {
            yield createPositionFrame(toPositions(outcome), { alpha: 0, tick: 0 });
          },
        }.run(graph) as Iterable<PositionFrame>
      ),
    ];
    expect(frames).toHaveLength(1);
    expect(Array.from(frames[0]!.positions)).toEqual([9, 8, 7, 6, 5, 4]);
  });
});
