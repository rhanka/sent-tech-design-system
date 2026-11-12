import { createGraphRenderer } from './renderer';
import type { CameraState, GraphRendererOptions, GraphStyleBuffers, RenderGraphInput, RenderGraphBuffers } from './types';

/** Small host intents; graph buffers stay with the engine. No framework state. */
export interface GraphIntent {
  selection?: readonly string[];
  hover?: string | null;
  viewport?: CameraState;
  /** When supplied, only these node ids (and edges between them) are visible. */
  filters?: readonly string[];
}
export interface GraphEngineData {
  graph: RenderGraphInput | RenderGraphBuffers;
  style: GraphStyleBuffers;
}

/** Preserve caller-owned style buffers while applying the renderer's masks. */
export function graphIntentStyle(data: GraphEngineData, intent: GraphIntent): GraphStyleBuffers {
  const { graph, style } = data;
  if (!intent.selection?.length && intent.hover == null && intent.filters === undefined) return style;
  const selected = new Set(intent.selection);
  if (intent.hover != null) selected.add(intent.hover);
  const visible = intent.filters === undefined ? undefined : new Set(intent.filters);
  const nodeColors = style.nodeColors.slice();
  const edgeColors = style.edgeColors.slice();
  const haloMask = selected.size === 0 ? style.haloMask?.slice() : new Uint8Array(graph.nodeIds.length);
  const edgeHaloMask = selected.size === 0 ? style.edgeHaloMask?.slice() : new Uint8Array(graph.edges.length / 2);
  graph.nodeIds.forEach((id, index) => {
    if (visible !== undefined && !visible.has(id)) nodeColors[index * 4 + 3] = 0;
    if (haloMask !== undefined && selected.size > 0) haloMask[index] = selected.has(id) ? 1 : 0;
  });
  for (let edge = 0; edge < graph.edges.length / 2; edge += 1) {
    const source = graph.nodeIds[graph.edges[edge * 2]!];
    const target = graph.nodeIds[graph.edges[edge * 2 + 1]!];
    if (visible !== undefined && (source === undefined || target === undefined || !visible.has(source) || !visible.has(target))) edgeColors[edge * 4 + 3] = 0;
    if (edgeHaloMask !== undefined && selected.size > 0) edgeHaloMask[edge] = (source !== undefined && selected.has(source)) || (target !== undefined && selected.has(target)) ? 1 : 0;
  }
  return { ...style, nodeColors, edgeColors, ...(haloMask === undefined ? {} : { haloMask }), ...(edgeHaloMask === undefined ? {} : { edgeHaloMask }) };
}

/**
 * Engine-owned dirty-frame loop. Multiple data/intent/resize pushes before the
 * next frame draw once; an idle graph schedules nothing. Framework adapters
 * never call render or maintain a second loop.
 */
export function createGraphEngine(canvas: HTMLCanvasElement, options: GraphRendererOptions = {}) {
  const renderer = createGraphRenderer(canvas, options);
  let data: GraphEngineData | undefined;
  let intent: GraphIntent = {};
  let graphDirty = false;
  let styleDirty = false;
  let frame: number | undefined;
  let destroyed = false;
  function draw() {
    frame = undefined;
    if (destroyed) return;
    if (data !== undefined) {
      if (graphDirty) { renderer.setGraph(data.graph); graphDirty = false; }
      if (styleDirty) { renderer.setStyle(graphIntentStyle(data, intent)); styleDirty = false; }
    }
    if (intent.viewport !== undefined) renderer.setCamera(intent.viewport);
    renderer.render();
  }
  function invalidate() {
    if (!destroyed && frame === undefined) frame = requestAnimationFrame(draw);
  }
  return {
    renderer,
    setData(next: GraphEngineData) { if (destroyed) return; data = next; graphDirty = true; styleDirty = true; invalidate(); },
    setIntent(next: GraphIntent) {
      if (destroyed) return;
      styleDirty ||= intent.selection !== next.selection || intent.hover !== next.hover || intent.filters !== next.filters;
      intent = { ...next }; invalidate();
    },
    resize(width: number, height: number, pixelRatio: number) {
      if (destroyed) return;
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      invalidate();
    },
    invalidate,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = undefined; data = undefined; renderer.destroy();
    },
  };
}
export type GraphEngine = ReturnType<typeof createGraphEngine>;
