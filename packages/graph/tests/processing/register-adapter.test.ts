import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

import { buildRenderGraphBuffers } from "../../src/index";
import { computeHierarchyAwarePositions } from "../../src/processing/hierarchy-layout.js";
import type { HierarchyLayoutForest } from "../../src/processing/hierarchy-layout.js";
import {
  FORCE_FA2_LAYOUT_ID,
  forceFa2Layout,
  HIERARCHY_AWARE_LAYOUT_ID,
  hierarchyAwareLayout,
  projectLayoutResults,
  resolveForceFa2Iterations,
  sentropicFastLayoutEnabled,
} from "../../src/processing/index.js";
import { defaultLayoutIterations } from "../../src/processing/graph-layout.js";
import { getLayout, hasLayout, listLayouts } from "../../src/index";

const ENV_KEYS = ["SENTROPIC_FAST_LAYOUT", "GRAPHIFY_FAST_LAYOUT", "ENGRAM_FAST_LAYOUT"] as const;
const savedEnv = new Map<string, string | undefined>();
for (const key of ENV_KEYS) savedEnv.set(key, process.env[key]);

afterEach(() => {
  for (const key of ENV_KEYS) {
    const saved = savedEnv.get(key);
    if (saved === undefined) delete process.env[key];
    else process.env[key] = saved;
  }
});

function clearLayoutEnv() {
  for (const key of ENV_KEYS) delete process.env[key];
}

function starGraph(count = 12) {
  const nodes = Array.from({ length: count }, (_, i) => ({ id: `n${i}` }));
  const edges: Array<{ source: string; target: string }> = [];
  for (let i = 1; i < count; i++) {
    edges.push({ source: `n${i}`, target: "n0" });
    if (i > 1) edges.push({ source: `n${i}`, target: `n${i - 1}` });
  }
  return { nodes, edges };
}

function buffers(count = 12) {
  const { nodes, edges } = starGraph(count);
  return buildRenderGraphBuffers({ nodes, edges });
}

describe("processing registration", () => {
  it("registers force-fa2 and hierarchy-aware alongside the seven built-ins", () => {
    expect(FORCE_FA2_LAYOUT_ID).toBe("force-fa2");
    expect(HIERARCHY_AWARE_LAYOUT_ID).toBe("hierarchy-aware");
    expect(hasLayout("force-fa2")).toBe(true);
    expect(hasLayout("hierarchy-aware")).toBe(true);
    expect(listLayouts()).toEqual(
      expect.arrayContaining([
        "force",
        "typed-layer",
        "time-oriented",
        "git-flow",
        "radial",
        "grid",
        "metro",
        "force-fa2",
        "hierarchy-aware",
      ]),
    );
    expect(getLayout("force-fa2")).toBe(forceFa2Layout);
    expect(getLayout("hierarchy-aware")).toBe(hierarchyAwareLayout);
  });

  it("every registered id returns a Float32Array of length 2 * nodeCount", () => {
    const graph = buffers();
    for (const id of listLayouts()) {
      if (id === "test-fill-7") continue;
      const out = getLayout(id)?.(graph, { iterations: 40 });
      expect(out).toBeInstanceOf(Float32Array);
      expect(out!.length).toBe(graph.nodeIds.length * 2);
    }
  });
});

describe("projectLayoutResults — id re-keying", () => {
  it("projects id-keyed results onto node order", () => {
    const out = projectLayoutResults(["b", "a", "c"], [
      { id: "a", x: 1, y: 2 },
      { id: "b", x: 3, y: 4 },
      { id: "c", x: 5, y: 6 },
    ]);
    expect(Array.from(out)).toEqual([3, 4, 1, 2, 5, 6]);
  });

  it("throws naming the missing id", () => {
    expect(() =>
      projectLayoutResults(["a", "b"], [{ id: "a", x: 0, y: 0 }]),
    ).toThrow('layout result missing node id "b"');
  });

  it("throws naming the extra id", () => {
    expect(() =>
      projectLayoutResults(["a"], [
        { id: "a", x: 0, y: 0 },
        { id: "zzz", x: 1, y: 1 },
      ]),
    ).toThrow('layout result for unknown node id "zzz"');
  });
});

describe("force-fa2 adapter", () => {
  it("returns finite node-order-keyed positions", () => {
    const graph = buffers();
    const out = forceFa2Layout(graph, { iterations: 60 });
    expect(out).toBeInstanceOf(Float32Array);
    expect(out.length).toBe(graph.nodeIds.length * 2);
    for (const v of out) expect(Number.isFinite(v)).toBe(true);
  });

  it("holds pinned nodes fixed at their baked positions", () => {
    const graph = buildRenderGraphBuffers({
      nodes: [
        { id: "a", fx: 123, fy: -45 },
        { id: "b" },
        { id: "c", fx: 0, fy: 0 },
      ],
      edges: [
        { source: "a", target: "b" },
        { source: "b", target: "c" },
      ],
    });
    const out = forceFa2Layout(graph, { iterations: 60 });
    expect([out[0], out[1]]).toEqual([123, -45]);
    expect([out[4], out[5]]).toEqual([0, 0]);
  });

  it("ignores LayoutOptions.seed: the effective seed is stableSeed(sorted node ids)", () => {
    // Tranche 1, option (b): force-fa2 derives its seed internally from the
    // sorted node ids (stableSeed FNV-1a + mulberry32 in graph-layout.ts), so
    // two runs that differ ONLY by LayoutOptions.seed must be byte-identical.
    const graph = buffers();
    const a = forceFa2Layout(graph, { iterations: 60, seed: "caller-seed" });
    const b = forceFa2Layout(graph, { iterations: 60, seed: 12345 });
    const c = forceFa2Layout(graph, { iterations: 60 });
    expect(Array.from(a)).toEqual(Array.from(b));
    expect(Array.from(a)).toEqual(Array.from(c));
  });

  it("is deterministic across two successive executions", () => {
    const graph = buffers();
    const a = forceFa2Layout(graph, { iterations: 60 });
    const b = forceFa2Layout(graph, { iterations: 60 });
    expect(Array.from(a)).toEqual(Array.from(b));
  });

  it("is deterministic across two distinct processes", () => {
    const dir = mkdtempSync(join(tmpdir(), "gdproc-det-"));
    try {
      const { nodes, edges } = starGraph(12);
      const inputPath = join(dir, "input.json");
      writeFileSync(inputPath, JSON.stringify({ nodes: nodes.map((n) => n.id), edges, iterations: 60 }));
      const here = dirname(fileURLToPath(import.meta.url));
      const child = join(here, "determinism-child.mjs");
      const run = () => {
        const env = { ...process.env };
        for (const key of ENV_KEYS) delete env[key];
        const result = spawnSync(process.execPath, [child, inputPath], { env, encoding: "utf8" });
        expect(result.status).toBe(0);
        return result.stdout;
      };
      const first = run();
      const second = run();
      expect(second).toBe(first);
      const graph = buildRenderGraphBuffers({ nodes, edges });
      const inProcess = JSON.stringify(Array.from(forceFa2Layout(graph, { iterations: 60 })));
      expect(first).toBe(inProcess);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("fast-layout environment (tranche 2)", () => {
  it("is OFF by default", () => {
    clearLayoutEnv();
    expect(sentropicFastLayoutEnabled()).toBe(false);
  });

  it("reads SENTROPIC_FAST_LAYOUT first, GRAPHIFY_FAST_LAYOUT as fallback", () => {
    clearLayoutEnv();
    for (const v of ["1", "true", "on", "YES"]) {
      process.env.SENTROPIC_FAST_LAYOUT = v;
      expect(sentropicFastLayoutEnabled()).toBe(true);
      delete process.env.SENTROPIC_FAST_LAYOUT;
    }
    process.env.SENTROPIC_FAST_LAYOUT = "0";
    expect(sentropicFastLayoutEnabled()).toBe(false);
    delete process.env.SENTROPIC_FAST_LAYOUT;

    process.env.GRAPHIFY_FAST_LAYOUT = "1";
    expect(sentropicFastLayoutEnabled()).toBe(true);
    // The scoped name wins when both are set.
    process.env.SENTROPIC_FAST_LAYOUT = "0";
    expect(sentropicFastLayoutEnabled()).toBe(false);
  });

  it("an explicit iterations always wins over the environment", () => {
    clearLayoutEnv();
    const small = resolveForceFa2Iterations(40, { iterations: 50 });
    expect(small).toBe(50);
    process.env.SENTROPIC_FAST_LAYOUT = "1";
    expect(resolveForceFa2Iterations(40, { iterations: 50 })).toBe(50);
    // Without an explicit value the env selects the adaptive budget…
    expect(resolveForceFa2Iterations(600)).toBe(defaultLayoutIterations(600));
    expect(defaultLayoutIterations(600)).toBeLessThan(300);
    // …and without the env the flat 300 applies.
    clearLayoutEnv();
    expect(resolveForceFa2Iterations(600)).toBe(300);
  });

  it("the adaptive layout differs from the flat-300 layout (budget applied)", () => {
    const graph = buffers(600);
    clearLayoutEnv();
    const flat = forceFa2Layout(graph);
    process.env.SENTROPIC_FAST_LAYOUT = "1";
    const fast = forceFa2Layout(graph);
    let differs = false;
    for (let i = 0; i < flat.length; i++) {
      if (Math.abs(flat[i]! - fast[i]!) > 1e-6) {
        differs = true;
        break;
      }
    }
    expect(differs).toBe(true);
  });
});

describe("hierarchy-aware adapter", () => {
  const forest: HierarchyLayoutForest = {
    root_ids: ["DE", "EN"],
    nodes_by_id: {
      DE: { parent_id: null, child_ids: ["DE.AI", "DE.PA"] },
      "DE.AI": { parent_id: "DE", child_ids: ["DE.AI.01"] },
      "DE.AI.01": { parent_id: "DE.AI", child_ids: [] },
      "DE.PA": { parent_id: "DE", child_ids: [] },
      EN: { parent_id: null, child_ids: [] },
    },
  };
  const ids = ["DE", "DE.AI", "DE.AI.01", "DE.PA", "EN"];

  function hierarchyGraph() {
    return buildRenderGraphBuffers({ nodes: ids.map((id) => ({ id })), edges: [] });
  }

  it("transports LayoutOptions.hierarchies to the computation", () => {
    const graph = hierarchyGraph();
    const out = hierarchyAwareLayout(graph, { hierarchies: { t: forest } });
    expect(out).toBeInstanceOf(Float32Array);
    expect(out.length).toBe(ids.length * 2);
    // Same input through the core, narrowed the same way, is identical.
    const direct = computeHierarchyAwarePositions(
      ids.map((id) => ({ id })),
      { t: forest },
    );
    expect(Array.from(out)).toEqual(Array.from(new Float32Array(direct.positions)));
    expect(direct.hierarchyNodeCount).toBe(5);
  });

  it("narrowing 64→32 bits is lossy but the 32-bit output is reproducible", () => {
    const graph = hierarchyGraph();
    const direct = computeHierarchyAwarePositions(
      ids.map((id) => ({ id })),
      { t: forest },
    );
    const narrowed = new Float32Array(direct.positions);
    let lossy = false;
    for (let i = 0; i < direct.positions.length; i++) {
      if (Math.abs(direct.positions[i]! - narrowed[i]!) > 0) {
        lossy = true;
        break;
      }
    }
    expect(lossy).toBe(true);
    const a = hierarchyAwareLayout(graph, { hierarchies: { t: forest } });
    const b = hierarchyAwareLayout(graph, { hierarchies: { t: forest } });
    expect(Array.from(a)).toEqual(Array.from(b));
  });

  it("degrades to force-fa2 with no usable forest", () => {
    const graph = hierarchyGraph();
    const degraded = hierarchyAwareLayout(graph, {
      hierarchies: { empty: { root_ids: [], nodes_by_id: {} } },
      iterations: 60,
    });
    const direct = forceFa2Layout(graph, { iterations: 60 });
    expect(Array.from(degraded)).toEqual(Array.from(direct));
  });

  it("forwards hierarchyLayout tuning", () => {
    // A wide ring, where nodeGap sets the scale (on a tiny forest the ringGap
    // floor dominates and the tuning would be — correctly — invisible).
    const childIds = Array.from({ length: 120 }, (_, i) => `R.${String(i).padStart(3, "0")}`);
    const wide: HierarchyLayoutForest = {
      root_ids: ["R"],
      nodes_by_id: {
        R: { parent_id: null, child_ids: childIds },
        ...Object.fromEntries(childIds.map((id) => [id, { parent_id: "R", child_ids: [] }])),
      },
    };
    const wideIds = ["R", ...childIds];
    const graph = buildRenderGraphBuffers({ nodes: wideIds.map((id) => ({ id })), edges: [] });
    const a = hierarchyAwareLayout(graph, { hierarchies: { wide } });
    const b = hierarchyAwareLayout(graph, { hierarchies: { wide }, hierarchyLayout: { nodeGap: 200 } });
    expect(Array.from(a)).not.toEqual(Array.from(b));
    for (const v of b) expect(Number.isFinite(v)).toBe(true);
  });
});
