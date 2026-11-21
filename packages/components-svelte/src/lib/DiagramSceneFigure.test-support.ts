/** Shared Node/jsdom contract for the two mounted hosts; never starts a browser. */
import { setImmediate as drain, setTimeout as realDelay } from "node:timers/promises";
import v8 from "node:v8";
import vm from "node:vm";
import * as canvas from "@sentropic/diagram-canvas";
import * as model from "@sentropic/diagram-canvas/diagramSceneModel";
import { CURRENT_SCHEMA_VERSION, DIAGRAM_PRESENTATION_CONTRACT_PIN, m3ProfileRegistry, shippedExecutorBindings } from "../../../diagram-core/dist/index.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

export interface MountedHost {
  readonly viewport: HTMLElement;
  readonly size: () => { width: number; height: number } | undefined;
  readonly toggle: () => Promise<void>;
  readonly pan: () => Promise<void>;
  readonly zoom: () => Promise<void>;
  readonly unmount: (clearTemplateRef?: boolean) => void;
}
export interface HostAdapter {
  readonly name: string;
  readonly mount: (props: Record<string, unknown>) => Promise<MountedHost>;
  readonly flush: () => Promise<unknown>;
}

const occurrence = (id: string) => `occurrence:e.${id}`;
const ids = ["zone", ...Array.from({ length: 6 }, (_, n) => `child${n}`)];
export const hostProps = {
  document: {
    documentId: "document:dc2b-host", schemaVersion: CURRENT_SCHEMA_VERSION, revision: 1,
    profileRefs: ["generic@2"], typeDefinitions: {}, ports: {}, resources: {}, extensions: [],
    entities: Object.fromEntries(ids.map(id => [`entity:${id}`, {
      id: `entity:${id}`, profile: "generic@2", type: id === "zone" ? "container" : "node",
      attributes: { name: { kind: "text", value: id } },
    }])),
    relations: Object.fromEntries(ids.slice(1).map(id => [`relation:contains.${id}`, {
      id: `relation:contains.${id}`, profile: "generic@2", type: "contains", attributes: {},
      endpoints: [{ role: "parent", target: "entity:zone" }, { role: "child", target: `entity:${id}` }],
    }])),
  },
  registry: m3ProfileRegistry, bindings: shippedExecutorBindings,
  presentation: { contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN }, legends: {}, categoryTokens: [],
    entities: Object.fromEntries(ids.map(id => [occurrence(id), { form: id === "zone" ? "container" : "card", text: { title: id, body: "A card" } }])),
  },
};

export function defineHostContract(adapter: HostAdapter): void {
  const stressGrowth: number[] = [], idleGrowth: number[] = [];
  describe(`${adapter.name} DC-2b mounted contract`, () => {
  let targets: Map<object, Set<Element>>;
  let observers: ReturnType<typeof vi.fn>[];
  const mounted = new Set<MountedHost>();
  beforeEach(() => {
    targets = new Map();
    observers = [];
    for (const name of ["ResizeObserver", "MutationObserver"]) {
      const observe = vi.fn(function(this: object, target: Element) {
        const set = targets.get(this) ?? new Set<Element>(); set.add(target); targets.set(this, set);
      });
      const construct = vi.fn();
      observers.push(construct, observe);
      vi.stubGlobal(name, class {
        constructor() { construct(); }
        observe = observe;
        unobserve(target: Element) { targets.get(this)?.delete(target); }
        disconnect() { targets.delete(this); }
        takeRecords() { return []; }
      });
    }
    Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 1280 });
    vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
    const computed = (vi.isMockFunction(window.getComputedStyle)
      ? window.getComputedStyle.getMockImplementation()!
      : window.getComputedStyle).bind(window);
    vi.spyOn(window, "getComputedStyle").mockImplementation(element => {
      const style = computed(element);
      return new Proxy(style, { get(target, key) {
        if (key === "getPropertyValue") return (name: string) => name.endsWith("transitionDuration") ? "240ms" : target.getPropertyValue(name);
        const value = Reflect.get(target, key); return typeof value === "function" ? value.bind(target) : value;
      } });
    });
  });
  afterEach(() => {
    for (const host of mounted) host.unmount();
    mounted.clear();
    vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals();
    delete (HTMLElement.prototype as { clientWidth?: number }).clientWidth;
  });
  async function mount(props: Record<string, unknown> = {}) {
    const host = await adapter.mount({ ...hostProps, ...props }); mounted.add(host); return host;
  }
  function unmount(host: MountedHost, clearRef = false) { host.unmount(clearRef); mounted.delete(host); }
  function fakeTime() {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "requestAnimationFrame", "cancelAnimationFrame", "performance"] });
  }
  async function settle() { await adapter.flush(); await vi.advanceTimersByTimeAsync(300); await adapter.flush(); }

    it("should publish and bind exactly once on mount, fold and unfold, with no work for 120 pan + 120 zoom events", async () => {
      fakeTime();
      const size = vi.fn(), layout = vi.spyOn(model, "layoutScene");
      const measureLines = vi.fn((request: canvas.MeasureRequest) => ({ lines: [request.text], width: request.text.length * 8, height: 24, overflow: false }));
      const host = await mount({ onSizeChange: size, measureLines });
      await settle();
      expect(size).toHaveBeenCalledTimes(1);
      const expanded = host.size();
      expect(expanded).toEqual(size.mock.calls[0]![0]);
      await host.toggle(); await settle();
      expect(size).toHaveBeenCalledTimes(2);
      expect(host.size()).toEqual(size.mock.calls[1]![0]);
      expect(host.size()!.height * host.size()!.width).toBeLessThan(expanded!.height * expanded!.width);
      await host.toggle(); await settle();
      expect(size).toHaveBeenCalledTimes(3);
      expect(host.size()).toEqual(expanded);
      layout.mockClear(); measureLines.mockClear(); size.mockClear();
      for (let n = 0; n < 120; n++) { await host.pan(); await host.zoom(); }
      window.dispatchEvent(new Event("resize")); await adapter.flush();
      expect(layout).not.toHaveBeenCalled(); expect(measureLines).not.toHaveBeenCalled(); expect(size).not.toHaveBeenCalled();
      expect(host.size()).toEqual(expanded);
    });

    it("should perform zero timer, RAF, observer or layout activity for 60 s after a real fold transition", async () => {
      fakeTime();
      const host = await mount();
      await host.toggle();
      expect(vi.getTimerCount()).toBeGreaterThan(0);
      await settle();
      expect(vi.getTimerCount()).toBe(0);
      const activity = [vi.spyOn(globalThis, "setTimeout"), vi.spyOn(globalThis, "setInterval"), vi.spyOn(globalThis, "requestAnimationFrame"), vi.spyOn(model, "layoutScene"), ...observers];
      activity.forEach(spy => spy.mockClear());
      await vi.advanceTimersByTimeAsync(60_000); await adapter.flush(); await drain(); await adapter.flush();
      for (const spy of activity) expect(spy).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    });

    it.each([1, 2, 3])("should bound mounted heap after 240 fold/unfold cycles and 60 s idle (sample %i)", async () => {
      fakeTime();
      // Measure retained mounted state without animation; the preceding contract
      // separately covers settling and idle activity with a 240 ms transition.
      vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
      v8.setFlagsFromString("--expose_gc");
      const gc = vm.runInNewContext("gc") as () => void;
      const heap = async () => { gc(); await drain(); gc(); return v8.getHeapStatistics().used_heap_size; };
      const cache = canvas.createLayoutCache();
      const host = await mount({ layoutCache: cache });
      const toggle = async () => {
        await host.toggle(); await adapter.flush();
        // Instrumentation must release the DOM and results it has observed.
        vi.mocked(window.getComputedStyle).mockClear();
        observers.forEach(spy => spy.mockClear());
      };
      for (let warm = 0; warm < 4; warm++) await toggle();
      const baseline = await heap();
      const before = cache.stats();
      for (let cycle = 0; cycle < 240; cycle++) { await toggle(); await toggle(); }
      expect(cache.stats()).toMatchObject({ entries: 2, misses: before.misses, hits: before.hits + 480, evictions: 0 });
      expect(cache.stats().bytes).toBeLessThanOrEqual(16 * 1024 * 1024);
      const afterCycles = await heap();
      const beforeIdle = cache.stats();
      await vi.advanceTimersByTimeAsync(60_000); await realDelay(500); await adapter.flush();
      expect(vi.getTimerCount()).toBe(0);
      expect(cache.stats()).toEqual(beforeIdle);
      const afterIdle = await heap();
      stressGrowth.push((afterCycles - baseline) / 1024 / 1024);
      idleGrowth.push((afterIdle - afterCycles) / 1024 / 1024);
      console.info(`DC-2b ${adapter.name} mounted AC-P1 sample: ${stressGrowth.at(-1)!.toFixed(3)} MiB <= 5 MiB; idle ${idleGrowth.at(-1)!.toFixed(3)} MiB <= 1 MiB`);
      unmount(host); cache.dispose();
      if (stressGrowth.length === 3) {
        const median = (values: number[]) => [...values].sort((a, b) => a - b)[1]!;
        console.info(`DC-2b ${adapter.name} mounted AC-P1 median-of-3: ${median(stressGrowth).toFixed(3)} MiB <= 5 MiB; idle ${median(idleGrowth).toFixed(3)} MiB <= 1 MiB`);
        expect(median(stressGrowth)).toBeLessThanOrEqual(5);
        expect(median(idleGrowth)).toBeLessThanOrEqual(1);
      }
    });

    it.each([1, 2, 3])("should restore listeners, observers and owned cache after ten mount/fold/zoom/unmount cycles (sample %i)", async () => {
      fakeTime();
      v8.setFlagsFromString("--expose_gc");
      const gc = vm.runInNewContext("gc") as () => void;
      const heap = async () => { gc(); await drain(); gc(); return v8.getHeapStatistics().used_heap_size; };
      const create = canvas.createLayoutCache;
      const caches: canvas.LayoutCache[] = [];
      const factory = vi.spyOn(canvas, "createLayoutCache").mockImplementation(() => { const cache = create(); caches.push(cache); return cache; });
      const active: { target: EventTarget; type: string; handler: unknown; capture: boolean }[] = [];
      const originalAdd = EventTarget.prototype.addEventListener, originalRemove = EventTarget.prototype.removeEventListener;
      const capture = (options: unknown) => typeof options === "boolean" ? options : (options as AddEventListenerOptions | undefined)?.capture ?? false;
      const add = vi.spyOn(EventTarget.prototype, "addEventListener").mockImplementation(function(this: EventTarget, type, handler, options) {
        // Framework template handlers die with their detached nodes. Track the
        // host's imperative viewport wheel listener and every window listener.
        if (this === window || type === "wheel" && this instanceof HTMLElement && this.classList.contains("st-diagramSceneFigure-viewport")) {
          if (!active.some(item => item.target === this && item.type === type && item.handler === handler && item.capture === capture(options))) active.push({ target: this, type, handler, capture: capture(options) });
        }
        originalAdd.call(this, type, handler, options);
      });
      const remove = vi.spyOn(EventTarget.prototype, "removeEventListener").mockImplementation(function(this: EventTarget, type, handler, options) {
        const index = active.findIndex(item => item.target === this && item.type === type && item.handler === handler && item.capture === capture(options));
        if (index >= 0) active.splice(index, 1);
        originalRemove.call(this, type, handler, options);
      });
      // Initialise the framework's one-time event delegation before sampling host resources.
      const warm = await mount(); await settle(); unmount(warm); await adapter.flush();
      const baselineListeners = [...active];
      let baseline = 0;
      for (let cycle = 0; cycle < 10; cycle++) {
        const host = await mount(); await host.toggle(); await host.zoom();
        expect(caches.at(-1)!.stats().entries).toBeGreaterThan(0);
        // Exercise cancellation while the transition still owns a pending RAF.
        expect(vi.getTimerCount()).toBeGreaterThan(0);
        unmount(host, adapter.name === "Vue"); await adapter.flush();
        // jsdom queues a zero-delay selectionchange when a focused node leaves.
        // Drain that turn; a leaked transition RAF would still be pending at 16 ms.
        await vi.advanceTimersByTimeAsync(0);
        expect(active).toEqual(baselineListeners);
        expect(targets.size).toBe(0); expect(vi.getTimerCount()).toBe(0);
        expect(caches.at(-1)!.stats()).toMatchObject({ entries: 0, bytes: 0 });
        caches.length = 0; factory.mockClear(); add.mockClear(); remove.mockClear();
        observers.forEach(spy => spy.mockClear());
        vi.mocked(window.getComputedStyle).mockClear();
        if (cycle === 0) baseline = await heap();
      }
      const delta = (await heap() - baseline) / 1024 / 1024;
      console.info(`DC-2b ${adapter.name} mounted AC-P5 sample: ${delta.toFixed(3)} MiB <= 2 MiB; 0 retained host listeners/observer targets/cache entries`);
      expect(delta).toBeLessThanOrEqual(2);
    });

    it("should preserve ownership of an injected cache on unmount", async () => {
      const cache = canvas.createLayoutCache(), dispose = vi.spyOn(cache, "dispose");
      const host = await mount({ layoutCache: cache });
      unmount(host);
      expect(dispose).not.toHaveBeenCalled(); expect(cache.stats().entries).toBeGreaterThan(0);
      cache.dispose();
    });
  });
}
