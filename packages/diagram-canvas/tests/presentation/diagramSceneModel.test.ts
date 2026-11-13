import { setTimeout as realDelay } from "node:timers/promises";
import { m3ProfileRegistry, shippedExecutorBindings } from "@sentropic/diagram-core";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createLayoutCache, worldToView } from "../../src/index.js";
import * as sceneModule from "../../src/scene.js";
import * as labelsModule from "../../src/layout/labels.js";
import {
  layoutScene, resolveScene, resolveZoom, sceneContentSize, sceneFit, scenePlacement,
  type SceneLayoutInput,
} from "../../src/presentation/diagramSceneModel.js";
import { pinnedMeasurer, sceneInput } from "../layout/dc2a/scenes.js";

const witness = sceneInput("vue-globale", "after");
const input: SceneLayoutInput = {
  document: witness.document, registry: m3ProfileRegistry, bindings: shippedExecutorBindings,
  presentation: witness.presentation, measureLines: pinnedMeasurer, collapsed: witness.collapsed,
  hints: { ordering: witness.ordering, rootOrder: witness.rootOrder },
};
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("shared scene presentation (DC-2b)", () => {
  it("should use either cache entry point and preserve the uncached result", () => {
    const cache = createLayoutCache();
    const layout = vi.spyOn(cache, "layout");
    const folded = vi.spyOn(cache, "layoutFolded");
    const first = layoutScene({ ...input, cache });
    expect(layoutScene({ ...input, cache })).toBe(first);
    expect(layoutScene(input)).toEqual(first);
    if (first.status !== "laid-out") throw new Error("reference refused");
    const retained = { ...input, view: first.view, cache };
    const next = layoutScene(retained);
    expect(layoutScene(retained)).toBe(next);
    expect(folded).toHaveBeenCalledTimes(2);
    expect(layout).toHaveBeenCalledTimes(2);
  });

  it("should reuse emitted label boxes and lines without measurements or placement searches", () => {
    const measureLines = vi.fn(pinnedMeasurer);
    const cache = createLayoutCache();
    const result = layoutScene({ ...input, cache, measureLines });
    if (result.status !== "laid-out") throw new Error("reference refused");
    expect(Object.keys(result.labelBoxes ?? {}).length).toBeGreaterThan(0);
    measureLines.mockClear();
    const place = vi.spyOn(labelsModule, "placeEdgeLabels");
    const scene = resolveScene(result, { ...input, measureLines });
    expect(scene.labels.length).toBe(Object.keys(result.labelBoxes!).length);
    for (const label of scene.labels) {
      expect(label.box).toBe(result.labelBoxes![label.occurrence]);
      expect(label.lines).toBe(result.measurements!.slots.find((slot) => slot.occurrence === label.occurrence && slot.role === "edge-label")!.layout.lines);
    }
    expect(place).not.toHaveBeenCalled();
    expect(measureLines).not.toHaveBeenCalled();
    expect(layoutScene({ ...input, cache, measureLines })).toBe(result);
    expect(measureLines).not.toHaveBeenCalled();
    // Compatibility with a pre-DC-2a result still uses the legacy path.
    const { labelBoxes: _boxes, measurements: _measurements, ...legacy } = result;
    resolveScene(legacy, { ...input, measureLines });
    expect(place).toHaveBeenCalledTimes(1);
    expect(measureLines).toHaveBeenCalled();
  });

  it("should expose content size directly from layout and zero for refused, empty or absent results", () => {
    const result = layoutScene(input);
    if (result.status !== "laid-out") throw new Error("reference refused");
    expect(sceneContentSize(result)).toEqual({ width: result.fit.width, height: result.fit.height });
    expect(resolveScene(result, input).contentSize).toEqual(sceneContentSize(result));
    expect(sceneContentSize(undefined)).toEqual({ width: 0, height: 0 });
    expect(sceneContentSize(layoutScene({ ...input, targetWidth: 0 }))).toEqual({ width: 0, height: 0 });
    const empty = { ...input.document, entities: {}, relations: {} };
    const resultEmpty = layoutScene({ ...input, document: empty, hints: {}, presentation: { ...input.presentation, entities: {} }, collapsed: [] });
    expect(resultEmpty.status).toBe("laid-out");
    expect(sceneContentSize(resultEmpty)).toEqual({ width: 0, height: 0 });
  });

  it("should perform 120 pan and 120 zoom steps and a resize with no cache, scene or measurement work", () => {
    const cache = createLayoutCache();
    const measureLines = vi.fn(pinnedMeasurer);
    const result = layoutScene({ ...input, cache, measureLines });
    if (result.status !== "laid-out") throw new Error("reference refused");
    const scene = resolveScene(result, { ...input, measureLines });
    const before = cache.stats(), calls = measureLines.mock.calls.length;
    const build = vi.spyOn(sceneModule, "buildScene");
    const times: number[] = [];
    let scrollLeft = 0, scrollTop = 0;
    for (let n = 0; n < 240; n++) {
      const start = performance.now();
      const fit = sceneFit({ bounds: scene.bounds!, viewWidth: n === 120 ? 1024 : 1440, windowHeight: 768 });
      const zoom = resolveZoom(n < 120 ? undefined : 0.2 + (n % 12) / 10, fit);
      if (n < 120) { scrollLeft += 1; scrollTop += 2; }
      const placement = scenePlacement(scene.bounds, zoom, fit);
      const matrix = worldToView({ x: -placement.translateX / zoom, y: -placement.translateY / zoom, zoom });
      expect(matrix).toMatchObject({ a: zoom, d: zoom, e: placement.translateX, f: placement.translateY });
      times.push(performance.now() - start);
    }
    expect(scrollLeft).toBe(120); expect(scrollTop).toBe(240);
    expect(cache.stats()).toEqual(before);
    expect(measureLines).toHaveBeenCalledTimes(calls);
    expect(build).not.toHaveBeenCalled();
    const p95 = times.sort((a, b) => a - b)[227]!;
    console.info(`DC-2b AC-P4 model: 120 pan + 120 zoom, p95 ${p95.toFixed(3)} ms <= 16.7 ms; 0 cache/scene/measurement calls`);
    expect(p95).toBeLessThanOrEqual(16.7);
  });

  it("should stay quiet for 60 s virtual time plus 1 s real event-loop drain", async () => {
    const cache = createLayoutCache();
    layoutScene({ ...input, cache });
    const before = cache.stats();
    vi.useFakeTimers();
    const timeout = vi.spyOn(globalThis, "setTimeout"), interval = vi.spyOn(globalThis, "setInterval");
    const frame = vi.fn(), resize = vi.fn(), mutation = vi.fn(), worker = vi.fn();
    vi.stubGlobal("requestAnimationFrame", frame);
    vi.stubGlobal("ResizeObserver", resize); vi.stubGlobal("MutationObserver", mutation); vi.stubGlobal("Worker", worker);
    await vi.advanceTimersByTimeAsync(60_000);
    await realDelay(1000);
    expect(timeout).not.toHaveBeenCalled(); expect(interval).not.toHaveBeenCalled();
    for (const callback of [frame, resize, mutation, worker]) expect(callback).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    expect(cache.stats()).toEqual(before);
  });

  it("should keep the 600-action engine/model workload below 1800 ms with 240 stress toggles", () => {
    const cache = createLayoutCache();
    const seed = layoutScene(input);
    const seedClosed = layoutScene({ ...input,
      collapsed: [...input.collapsed, "occurrence:e.pkg-h2a" as SceneLayoutInput["collapsed"][number]],
      ...(seed.status === "laid-out" && seed.orientations !== undefined ? { previousOrientation: seed.orientations } : {}) });
    let result = layoutScene({ ...input, cache,
      ...(seedClosed.status === "laid-out" && seedClosed.orientations !== undefined ? { previousOrientation: seedClosed.orientations } : {}) });
    if (result.status !== "laid-out") throw new Error("reference refused");
    let scene = resolveScene(result, input);
    let worst = 0;
    for (let action = 0; action < 600; action++) {
      const start = performance.now();
      if (action < 240) {
        result = layoutScene({
          ...input, cache,
          collapsed: action % 2 === 0 ? [...input.collapsed, "occurrence:e.pkg-h2a" as SceneLayoutInput["collapsed"][number]] : input.collapsed,
          ...(result.status !== "laid-out" || result.orientations === undefined ? {} : { previousOrientation: result.orientations }),
        });
        if (result.status !== "laid-out") throw new Error("toggle refused");
        scene = resolveScene(result, input);
      } else {
        const before = cache.stats();
        const fit = sceneFit({ bounds: scene.bounds!, viewWidth: 1024, windowHeight: 768 });
        scenePlacement(scene.bounds, resolveZoom(0.2 + (action % 12) / 10, fit), fit);
        expect(cache.stats()).toEqual(before);
      }
      worst = Math.max(worst, performance.now() - start);
    }
    expect(cache.stats()).toMatchObject({ misses: 2, hits: 239, entries: 2, evictions: 0 });
    console.info(`DC-2b M3 engine/model: 600 actions / 240 stress toggles; worst ${worst.toFixed(3)} ms < 1800 ms`);
    expect(worst).toBeLessThan(1800);
  });
});
