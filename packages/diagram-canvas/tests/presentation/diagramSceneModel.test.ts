import { setTimeout as realDelay } from "node:timers/promises";
import { m3ProfileRegistry, shippedExecutorBindings } from "@sentropic/diagram-core";
import { afterEach, describe, expect, it, vi } from "vitest";

import { cameraFit, createLayoutCache, floorToQuantum, worldToView } from "../../src/index.js";
import * as sceneModule from "../../src/scene.js";
import * as labelsModule from "../../src/layout/labels.js";
import {
  FIT_QUANTUM, layoutScene, resolveScene, resolveZoom, sceneContentSize, sceneFit, scenePlacement,
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
  it.each([0, 15, 20])('should keep drawing content reachable with a %i px horizontal scrollbar', (scrollbarHeight) => {
    for (const height of [200, 472.015625, 800]) {
      const bounds = { x: -20, y: -26, width: 1500, height };
      const fit = sceneFit({ bounds, viewWidth: 390, windowHeight: 844, scrollbarHeight });
      const placement = scenePlacement(bounds, fit.zoom, fit);
      const viewportHeight = fit.fitHeight + scrollbarHeight;
      expect(fit.zoom).toBe(.45);
      expect(placement.overflowX).toBe(true);
      expect(viewportHeight).toBeLessThanOrEqual(390 * 9 / 16);
      expect(placement.overflowY).toBe(height === 800 || (height === 472.015625 && scrollbarHeight > 0));
      if (!placement.overflowY) {
        expect(placement.translateY + bounds.y * fit.zoom + bounds.height * fit.zoom)
          .toBeLessThanOrEqual(viewportHeight - scrollbarHeight);
      }
    }
  });
  it('should floor an uncapped fit to the fit quantum, never above the fit, with the cap and the floor exact', () => {
    // 1204 / 2405.5 = 0.500519…: the applied zoom is the quantum below it.
    const bounds = { x: 0, y: 0, width: 2405.5, height: 500 };
    const fit = sceneFit({ bounds, viewWidth: 1206, windowHeight: 900 });
    expect(fit.zoomFit).toBe(1204 / 2405.5);
    expect([fit.zoom, fit.minZoom, fit.pans]).toEqual([0.5, 0.5, false]);
    expect(fit.fitHeight).toBeGreaterThanOrEqual(bounds.height * fit.zoom + 2);
    expect(fit.fitHeight).toBeLessThan(bounds.height * fit.zoom + 2 + 1 / 64);
    expect(scenePlacement(bounds, fit.zoom, fit)).toMatchObject({ overflowX: false, overflowY: false });
    // 1204 / 2672 = 0.450599…: rounding to the nearest quantum (0.451) would
    // paint 1 + 2672 × 0.451 = 1206.07 px wide in a 1206 px frame.
    const tight = sceneFit({ bounds: { x: 0, y: 0, width: 2672, height: 400 }, viewWidth: 1206, windowHeight: 900 });
    expect(tight.zoom).toBe(0.45);
    expect(tight.pans).toBe(false);
    expect(2672 * tight.zoom + 2).toBeLessThanOrEqual(1206);
    // An exact multiple stays where it is: 501 / 1000 × 1000 is not 501 in
    // floating point, and must not fall to the step below.
    expect(sceneFit({ bounds: { x: 0, y: 0, width: 1000, height: 100 }, viewWidth: 503, windowHeight: 900 }).zoom).toBe(0.501);
    for (let width = 1950; width < 2700; width += 7.3) {
      const swept = sceneFit({ bounds: { x: -3, y: -5, width, height: 300 }, viewWidth: 1206, windowHeight: 900 });
      expect(swept.zoom, String(width)).toBeLessThanOrEqual(Math.max(0.45, swept.zoomFit));
      expect(swept.zoomFit - swept.zoom, String(width)).toBeLessThan(FIT_QUANTUM);
      // On the grid: the printed scale has three decimals at most.
      expect(swept.zoom, String(width)).toBe(Number(swept.zoom.toFixed(3)));
      expect(sceneFit({ bounds: { x: -3, y: -5, width, height: 300 }, viewWidth: 1206, windowHeight: 900 })).toEqual(swept);
    }
    // Token values are not quantised: an off-grid cap or floor applies as it is.
    const capped = sceneFit({ bounds: { x: 0, y: 0, width: 460, height: 200 }, viewWidth: 1206, windowHeight: 900, maxDisplayScale: 0.6255 });
    expect([capped.zoom, capped.maxZoom]).toEqual([0.6255, 0.6255]);
    const floored = sceneFit({ bounds: { x: 0, y: 0, width: 1204 / 0.4557, height: 100 }, viewWidth: 1206, windowHeight: 900, minReadableScale: 0.4555 });
    expect(floored.zoomFit).toBeGreaterThan(0.4555);
    expect([floored.zoom, floored.pans]).toEqual([0.4555, false]);
    // The camera contract itself keeps the exact fit unless a quantum is given.
    expect(cameraFit({ bounds, viewWidth: 1206, windowHeight: 900 }).zoom).toBe(1204 / 2405.5);
    expect(floorToQuantum(0.4999999, FIT_QUANTUM)).toBe(0.499);
    expect(floorToQuantum(0.62, FIT_QUANTUM)).toBe(0.62);
  });
  it('should shrink a width-constrained frame to painted content and scroll only the overflowing axis at the floor', () => {
    const bounds = { x: -20.015625, y: -26, width: 1200, height: 200 };
    const fit = sceneFit({ bounds, viewWidth: 660, windowHeight: 900 });
    expect(fit.zoom).toBeGreaterThan(.45);
    expect(fit.zoom).toBeLessThan(.62);
    expect(fit.fitHeight).toBeGreaterThanOrEqual(bounds.height * fit.zoom + 2);
    expect(fit.fitHeight).toBeLessThan(bounds.height * fit.zoom + 2 + 1 / 64);
    expect(scenePlacement(bounds, fit.zoom, fit)).toMatchObject({ overflowX: false, overflowY: false });
    const narrow = sceneFit({ bounds, viewWidth: 400, windowHeight: 900 });
    expect(narrow.zoom).toBe(.45);
    const placement = scenePlacement(bounds, narrow.zoom, narrow);
    expect(placement).toMatchObject({ overflowX: true, overflowY: false });
    expect(placement.translateX + bounds.x * narrow.zoom).toBe(1);
    expect(placement.contentWidth - bounds.width * narrow.zoom).toBe(2);
  });
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

  it("should preserve measured label sizes and lines while clearing connector paint without remeasuring", () => {
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
      expect(label.box).toMatchObject({ width: result.labelBoxes![label.occurrence]!.width, height: result.labelBoxes![label.occurrence]!.height });
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
      expect(matrix).toMatchObject({ a: zoom, d: zoom });
      expect(matrix.e).toBeCloseTo(placement.translateX,12);expect(matrix.f).toBeCloseTo(placement.translateY,12);
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
