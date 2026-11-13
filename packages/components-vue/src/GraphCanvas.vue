<script setup lang="ts">
defineOptions({ name: 'GraphCanvas' });
import { shallowRef, toRaw, watch } from 'vue';
import type { GraphEngineData, GraphIntent } from '@sentropic/graph/engine';
import type { GraphRendererOptions } from '@sentropic/graph';
import { EMPTY_GRAPH_SELECTION, useGraphEngine } from './useGraphEngine.js';
export interface GraphCanvasProps {
    graph: GraphEngineData['graph'];
    /** Resolved theme buffers, including colours and dimensions; no palette in this wrapper. */
    styles: GraphEngineData['style'];
    version?: number;
    label: string;
    selection?: readonly string[];
    hover?: string | null;
    viewport?: GraphIntent['viewport'];
    filters?: GraphIntent['filters'];
    options?: GraphRendererOptions;
}
const props = defineProps<GraphCanvasProps>();
const canvas = shallowRef<HTMLCanvasElement>();
const graph = useGraphEngine(canvas, props.options);
watch([() => toRaw(props.graph), () => toRaw(props.styles), () => props.version], () => graph.setGraph({ graph: props.graph, style: props.styles }), { immediate: true });
watch(() => [props.selection, props.hover, props.viewport, props.filters] as const, () => {
    graph.selection.value = props.selection ?? EMPTY_GRAPH_SELECTION;
    graph.hover.value = props.hover ?? null;
    graph.viewport.value = props.viewport;
    graph.filters.value = props.filters;
}, { immediate: true });
defineExpose({ invalidateGraph: graph.invalidateGraph });
</script>

<template>
  <canvas ref="canvas" class="st-graphCanvas" role="img" :aria-label="label">{{ label }}</canvas>
</template>

<style>
.st-graphCanvas { display: block; width: 100%; height: 100%; }
</style>
