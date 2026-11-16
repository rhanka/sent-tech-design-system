import { setTimeout as realDelay, setImmediate as drain } from "node:timers/promises";
import v8 from "node:v8";
import vm from "node:vm";
import { defaultProfileRegistry, m3ProfileRegistry, occurrenceRef, serialiseView, shippedExecutorBindings } from "@sentropic/diagram-core";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

import { createLayoutCache, layoutDocument, type LayoutOptions, type LayoutResult } from "../../src/index.js";
import { buildDocument, largeDocumentSpec, measure } from "./fixtures.js";
import { pinnedMeasurer, sceneInput } from "./dc2a/scenes.js";
import * as presentation from "../../src/presentation/diagramSceneModel.js";

v8.setFlagsFromString("--expose_gc");
const forceGc = vm.runInNewContext("gc") as () => void;
async function retainedHeap(): Promise<number> {
  forceGc(); await drain(); forceGc();
  return v8.getHeapStatistics().used_heap_size;
}
const median = (values: number[]): number => values.sort((a, b) => a - b)[Math.floor(values.length / 2)]!;
const p95 = (values: number[]): number => values.sort((a, b) => a - b)[Math.ceil(values.length * 0.95) - 1]!;
const mib = (bytes: number): string => (bytes / 1024 / 1024).toFixed(3);
const input = sceneInput("vue-globale", "after");
const options: LayoutOptions = {
  registry: m3ProfileRegistry, bindings: shippedExecutorBindings,
  measureText: measure, measureLines: pinnedMeasurer, targetWidth: 1440,
  presentation: input.presentation, collapsed: input.collapsed,
  hints: { ordering: input.ordering, rootOrder: input.rootOrder },
};
const zone = Object.entries(input.presentation.entities).find(([id, value]) => id === "occurrence:e.pkg-h2a" && value.form === "container" && !input.collapsed.includes(occurrenceRef(id.replace(/^occurrence:/, ""))));
if (zone === undefined) throw new Error("reference scene needs an expanded zone");
const folded = [...input.collapsed, zone[0] as NonNullable<LayoutOptions["collapsed"]>[number]];
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });
const disposalDeltas: number[] = [];
afterAll(() => {
  if (disposalDeltas.length === 3) console.info(`DC-2b AC-P5 engine disposal V8 median-of-3: ${mib(median(disposalDeltas))} MiB <= 2 MiB`);
});

describe("DC-2b measured performance", () => {
  it("should revisit the first fixed-point fold states within 5 ms p95", () => {
    const cache = createLayoutCache();
    // Content growth changes the orientation's hysteresis boundary. Seed
    // the two-state fixed point before measuring cache revisits.
    const seed = layoutDocument(input.document, options);
    const seedClosed = layoutDocument(input.document, { ...options, collapsed: folded,
      ...(seed.status === "laid-out" && seed.orientations !== undefined ? { previousOrientation: seed.orientations } : {}) });
    const first = cache.layout(input.document, { ...options,
      ...(seedClosed.status === "laid-out" && seedClosed.orientations !== undefined ? { previousOrientation: seedClosed.orientations } : {}) });
    expect(first.status).toBe("laid-out");
    let previous = first.status === "laid-out" ? first.orientations : undefined;
    const coldStart = performance.now();
    const closed = cache.layout(input.document, { ...options, collapsed: folded, ...(previous === undefined ? {} : { previousOrientation: previous }) });
    const cold = performance.now() - coldStart;
    if (closed.status === "laid-out") previous = closed.orientations;
    const times: number[] = [];
    for (let n = 0; n < 240; n++) {
      const start = performance.now();
      const result = cache.layout(input.document, { ...options, ...(n % 2 === 0 ? {} : { collapsed: folded }), ...(previous === undefined ? {} : { previousOrientation: previous }) });
      times.push(performance.now() - start);
      expect(Object.is(result, n % 2 === 0 ? first : closed), JSON.stringify({ n, stats: cache.stats(), previous, first: first.status === "laid-out" ? first.orientations : first, closed: closed.status === "laid-out" ? closed.orientations : closed, result: result.status === "laid-out" ? result.orientations : result })).toBe(true);
      if (result.status === "laid-out") previous = result.orientations;
    }
    expect(cache.stats()).toMatchObject({ hits: 240, misses: 2, entries: 2, evictions: 0 });
    const latency = p95(times);
    console.info(`DC-2b AC-P3 vue-globale/after: 240 hits, p95 ${latency.toFixed(3)} ms <= 5 ms; cold folded ${cold.toFixed(3)} ms; ${cache.stats().entries} entries / ${cache.stats().bytes} bytes retained`);
    expect(latency).toBeLessThanOrEqual(5);
  });

  it("should preserve fresh result bytes and bound cold interactions on both reference scenes", () => {
    const witnesses = [
      { name: "vue-globale/after", document: input.document, options },
      { name: "largeDocumentSpec", document: buildDocument(largeDocumentSpec()), options: { registry: defaultProfileRegistry, measureText: measure, targetWidth: 1440 } },
    ];
    for (const witness of witnesses) {
      const coldTimes: number[] = [];
      // Warm the engine before measuring three independent cold cache calls.
      const fresh = layoutDocument(witness.document, witness.options);
      for (let run = 0; run < 3; run++) {
        const cache = createLayoutCache({ verifyImmutability: true });
        const start = performance.now();
        const result = cache.layout(witness.document, witness.options);
        coldTimes.push(performance.now() - start);
        expect(result).toEqual(fresh);
        expect(cache.layout(witness.document, witness.options)).toBe(result);
        if (result.status === "laid-out" && fresh.status === "laid-out") expect(serialiseView(result.view)).toBe(serialiseView(fresh.view));
        cache.dispose();
      }
      const worst = Math.max(...coldTimes);
      console.info(`DC-2b cold ${witness.name}: median ${median(coldTimes).toFixed(3)} ms, worst ${worst.toFixed(3)} ms < 1800 ms; worker trigger 900 ms`);
      expect(worst).toBeLessThan(1800);
    }
  });

  it("should retain <= 5 MiB after 240 fold/unfold cycles and <= 1 MiB over 60 s idle (median of 3)", async () => {
    const projection = vi.spyOn(presentation, "resolveScene");
    let projections = 0;
    const growth: number[] = [], idleGrowth: number[] = [];
    for (let sample = 0; sample < 3; sample++) {
      const cache = createLayoutCache();
      let previous: Extract<LayoutResult, { status: "laid-out" }>["orientations"];
      const toggle = (closed: boolean): void => {
        const result = cache.layout(input.document, { ...options, ...(closed ? { collapsed: folded } : {}), ...(previous === undefined ? {} : { previousOrientation: previous }) });
        if (result.status === "laid-out") {
          previous = result.orientations;
          presentation.resolveScene(result, { document: input.document, presentation: input.presentation, measureLines: pinnedMeasurer });
          projections += projection.mock.calls.length;
          // The measurement harness must not itself retain projected scenes.
          projection.mockClear();
        }
      };
      for (let warm = 0; warm < 2; warm++) { toggle(true); toggle(false); }
      const baseline = await retainedHeap();
      for (let cycle = 0; cycle < 240; cycle++) {
        toggle(true); toggle(false);
        expect(cache.stats().entries).toBeLessThanOrEqual(32);
        expect(cache.stats().bytes).toBeLessThanOrEqual(16 * 1024 * 1024);
      }
      const afterCycles = await retainedHeap();
      const beforeIdle = cache.stats();
      vi.useFakeTimers({ toFake: ["setTimeout", "setInterval"] });
      await vi.advanceTimersByTimeAsync(60_000);
      expect(vi.getTimerCount()).toBe(0);
      await realDelay(500);
      vi.useRealTimers();
      const afterIdle = await retainedHeap();
      expect(cache.stats()).toEqual(beforeIdle);
      growth.push(afterCycles - baseline); idleGrowth.push(afterIdle - afterCycles);
      cache.dispose();
    }
    console.info(`DC-2b AC-P1 V8 median-of-3: 240 fold/unfold cycles ${mib(median(growth))} MiB <= 5 MiB; 60 s virtual + 500 ms real idle ${mib(median(idleGrowth))} MiB <= 1 MiB; samples ${growth.map(mib).join(", ")} / ${idleGrowth.map(mib).join(", ")}`);
    expect(median(growth)).toBeLessThanOrEqual(5 * 1024 * 1024);
    expect(median(idleGrowth)).toBeLessThanOrEqual(1024 * 1024);
    expect(projections).toBe(3 * (4 + 240 * 2));
    projection.mockRestore();
  });

  it.each([1, 2, 3])("should release the cache across ten create/fold/dispose cycles within 2 MiB (sample %i)", async () => {
      let baseline = 0;
      for (let mount = 0; mount < 10; mount++) {
        const cache = createLayoutCache();
        cache.layout(input.document, options);
        cache.layout(input.document, { ...options, collapsed: folded });
        cache.dispose(); cache.dispose();
        expect(cache.stats()).toMatchObject({ entries: 0, bytes: 0 });
        if (mount === 0) baseline = await retainedHeap();
        if (mount === 9) {
          const delta = await retainedHeap() - baseline;
          disposalDeltas.push(delta);
          expect(delta).toBeLessThanOrEqual(2 * 1024 * 1024);
        }
      }
  });
});
