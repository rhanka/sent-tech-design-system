import { markRaw, onMounted, onUnmounted, shallowRef, toRaw, watch, type ShallowRef } from 'vue';
import { createGraphEngine, type GraphEngine, type GraphEngineData, type GraphIntent } from '@sentropic/graph/engine';
import type { GraphRendererOptions } from '@sentropic/graph';

/** One Vue boundary: heavy buffers are raw, only the version and intents signal changes. */
export const EMPTY_GRAPH_SELECTION: readonly string[] = Object.freeze([]);
export function useGraphEngine(canvas: ShallowRef<HTMLCanvasElement | undefined>, options?: GraphRendererOptions) {
  const data = shallowRef<GraphEngineData>();
  const version = shallowRef(0);
  const selection = shallowRef<readonly string[]>(EMPTY_GRAPH_SELECTION);
  const hover = shallowRef<string | null>(null);
  const viewport = shallowRef<GraphIntent['viewport']>();
  const filters = shallowRef<GraphIntent['filters']>();
  const engine = shallowRef<GraphEngine>();
  let observer: ResizeObserver | undefined;
  let mountedCanvas: HTMLCanvasElement | undefined;
  function setGraph(next: GraphEngineData) {
    data.value = markRaw({ graph: markRaw(toRaw(next.graph)), style: markRaw(toRaw(next.style)) });
    version.value += 1;
  }
  function invalidateGraph() { version.value += 1; }
  function resize() {
    const element = mountedCanvas;
    if (element === undefined) return;
    const box = element.getBoundingClientRect();
    engine.value?.resize(box.width, box.height, window.devicePixelRatio || 1);
  }
  function pushIntent() {
    engine.value?.setIntent({ selection: selection.value, hover: hover.value,
      ...(viewport.value === undefined ? {} : { viewport: viewport.value }),
      ...(filters.value === undefined ? {} : { filters: filters.value }),
    });
  }
  watch(version, () => { if (data.value !== undefined) engine.value?.setData(data.value); });
  watch([selection, hover, viewport, filters], pushIntent);
  onMounted(() => {
    mountedCanvas = canvas.value;
    if (mountedCanvas === undefined) return;
    engine.value = markRaw(createGraphEngine(mountedCanvas, options));
    if (data.value !== undefined) engine.value.setData(data.value);
    pushIntent(); resize();
    observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(resize);
    observer?.observe(mountedCanvas);
    window.addEventListener('resize', resize);
  });
  onUnmounted(() => {
    observer?.disconnect(); window.removeEventListener('resize', resize);
    engine.value?.destroy(); engine.value = undefined; mountedCanvas = undefined;
  });
  return { data, version, selection, hover, viewport, filters, engine, setGraph, invalidateGraph };
}
