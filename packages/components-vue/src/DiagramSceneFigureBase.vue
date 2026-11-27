<script setup lang="ts">
import DiagramErdNode from "./DiagramErdNode.vue";
import DiagramProcessNode from "./DiagramProcessNode.vue";
import DiagramSceneFallback from "./DiagramSceneFallback.vue";
defineOptions({ name: 'DiagramSceneFigureBase' });
import { useDiagramSceneViewport } from './useDiagramSceneViewport.js';
import { getDiagramGlyph } from './diagram-icons/registry.js';
import { computed, nextTick, onMounted, onUnmounted, shallowRef, useId, watch } from 'vue';
import { createLayoutCache, type Rect, type LayoutResult } from '@sentropic/diagram-canvas';
import { sceneContentSize, type DiagramSceneSize } from './diagramSceneModel.js';
import DiagramCard from './DiagramCard.vue';
import DiagramZone from './DiagramZone.vue';
import DiagramControlGlyph from './DiagramControlGlyph.vue';
import { projectCardProps, projectZoneProps } from './diagramCardModel.js';
import { collapsedOccurrencesOf, connectorDashArray, connectorDashPaint, connectorMarkerIds, connectorMarkerRef, connectorPath, DEFAULT_EDGE_CORNER_RADIUS, DEFAULT_SCENE_LABELS, displayedRects, extraConnectorMarkers, layoutScene, linkLegendBoxStyle, linkLegendSwatchGeometry, parseDurationMs, parseEasing, rectsOf, resolveScene, sameRects, sceneConnectorMask, scenePaintPlane, type SceneNodeModel, type SceneOccurrenceRef, type SceneOrientations, } from './diagramSceneModel.js';
import type { DiagramSceneFigureProps as SceneFigureProps, DiagramSceneFigureLabels, DiagramSceneCamera, SceneCollapsedOccurrences } from './DiagramSceneFigure.types.js';
export type DiagramSceneFigureProps = SceneFigureProps;
const props = withDefaults(defineProps<DiagramSceneFigureProps>(), { strictIcons: true });
const emit = defineEmits<{
    sizeChange: [size: DiagramSceneSize];
    'update:contentSize': [size: DiagramSceneSize];
    foldChange: [
        collapsed: SceneCollapsedOccurrences,
        change: {
            occurrence: SceneOccurrenceRef;
            collapsed: boolean;
        }
    ];
    select: [
        event: {
            entityId: string;
        }
    ];
    layout: [
        result: LayoutResult
    ];
    cameraChange: [
        camera: DiagramSceneCamera
    ];
}>();
const defaults = DEFAULT_SCENE_LABELS;
const strings = computed(() => ({ ...defaults, ...props.labels }));
const hostId = useId();
const arrowId = 'diagram-arrow-' + hostId;
const markerIds = connectorMarkerIds(arrowId);
const maskId = 'diagram-connector-mask-' + hostId;
const ownedCache = createLayoutCache();
const { figureEl, controlsEl, frameEl, viewportEl, measure, measureLines, effectiveMetrics, r7Mode, token,
    fit, zoom, readout, placement, viewportStyle, sceneFitInput, resetToFit,
    viewAll, fullscreen, fallbackFullscreen, fullscreenMode,
    setZoom, zoomIn, zoomOut, fitToFrame, setViewAll, toggleViewAll, toggleFullscreen, onFigureKeydown, getCamera } = useDiagramSceneViewport(
        props, () => scene.value, camera => emit('cameraChange', camera), undefined,
        { animating: () => animating.value, settle: () => settle() },
        () => ownedCache.clear());
defineExpose({ setZoom, zoomIn, zoomOut, fitToFrame, setViewAll, toggleViewAll, toggleFullscreen, getCamera });
const folds = shallowRef<readonly SceneOccurrenceRef[]>(props.defaultFolds ?? collapsedOccurrencesOf(props.view));
const collapsedNow = computed(() => props.collapsed ?? folds.value);
watch(() => [...collapsedNow.value].sort().join('\0'), resetToFit, { flush: 'pre' });
let previousOrientation: SceneOrientations | undefined;
let orientationDocument: string | undefined;
let orientationInputTuple: readonly unknown[] | undefined;
const orientationSeedByFold = new Map<string, SceneOrientations | undefined>();
const layoutResult = computed(() => {
    if (orientationDocument !== props.document.documentId) {
        orientationDocument = props.document.documentId;
        previousOrientation = undefined;
        orientationInputTuple = undefined;
        orientationSeedByFold.clear();
    }
    let orientationSeed: SceneOrientations | undefined = previousOrientation;
    if (r7Mode.value) {
        const nextInputs: readonly unknown[] = [
            props.document,
            props.document.revision,
            props.view,
            props.presentation,
            JSON.stringify(props.hints ?? null),
            JSON.stringify(effectiveMetrics.value),
            JSON.stringify(props.rowPack ?? null),
            props.targetWidth,
            measureLines.value,
            measureLines.value.version,
            props.iconBindings,
            props.strictIcons ?? true,
            props.depthParityStart,
        ];
        const sameNonFoldInputs =
            orientationInputTuple !== undefined &&
            orientationInputTuple.length === nextInputs.length &&
            nextInputs.every((value, index) => Object.is(value, orientationInputTuple![index]));
        if (!sameNonFoldInputs) {
            orientationInputTuple = nextInputs;
            orientationSeedByFold.clear();
        }
        const foldKey = [...collapsedNow.value].sort().join('\0');
        orientationSeed = orientationSeedByFold.has(foldKey)
            ? orientationSeedByFold.get(foldKey)
            : previousOrientation;
        if (!orientationSeedByFold.has(foldKey))
            orientationSeedByFold.set(foldKey, orientationSeed);
    } else if (orientationSeedByFold.size > 0 || orientationInputTuple !== undefined) {
        orientationInputTuple = undefined;
        orientationSeedByFold.clear();
    }
    const result = layoutScene({
        cache: props.layoutCache ?? ownedCache,
        document: props.document, registry: props.registry, presentation: props.presentation,
        ...(props.iconBindings === undefined ? {} : { iconBindings: props.iconBindings }),
        strictIcons: props.strictIcons ?? true,
        ...(props.depthParityStart === undefined ? {} : { depthParityStart: props.depthParityStart }),
        resolveGlyph: (props.resolveGlyph ?? getDiagramGlyph) as typeof getDiagramGlyph,
        measureLines: measureLines.value, collapsed: collapsedNow.value,
        ...(props.view === undefined ? {} : { view: props.view }),
        ...(props.bindings === undefined ? {} : { bindings: props.bindings }),
        ...(props.hints === undefined ? {} : { hints: props.hints }),
        ...(props.legend === undefined ? {} : { legend: props.legend }),
        ...(strings.value.legend === undefined ? {} : { legendTitle: strings.value.legend }),
        ...(props.legendLabels === undefined ? {} : { legendLabels: props.legendLabels }),
        metrics: effectiveMetrics.value,
        ...(props.rowPack === undefined ? {} : { rowPack: props.rowPack }),
        ...(props.targetWidth === undefined ? {} : { targetWidth: props.targetWidth }),
        ...(orientationSeed === undefined ? {} : { previousOrientation: orientationSeed }),
    });
    if (result.status === 'laid-out' && result.orientations !== undefined)
        previousOrientation = result.orientations;
    return result;
});
const scene = computed(() => layoutResult.value.status === 'laid-out'
    ? resolveScene(layoutResult.value, {
        document: props.document, presentation: props.presentation, measureLines: measureLines.value,
        ...(props.view === undefined ? {} : { view: props.view }),
        ...(props.iconBindings === undefined ? {} : { iconBindings: props.iconBindings }),
        strictIcons: props.strictIcons ?? true,
        ...(props.depthParityStart === undefined ? {} : { depthParityStart: props.depthParityStart }),
        ...(props.legend === undefined ? {} : { legend: props.legend }),
        ...(strings.value.legend === undefined ? {} : { legendTitle: strings.value.legend }),
        ...(props.legendLabels === undefined ? {} : { legendLabels: props.legendLabels }),
        resolveGlyph: (props.resolveGlyph ?? getDiagramGlyph) as typeof getDiagramGlyph,
        metrics: effectiveMetrics.value,
    }, props.fitToWindow ? sceneFitInput.value : undefined) : undefined);
const sceneRects = computed<ReadonlyMap<string, Rect>>(() => scene.value === undefined ? new Map() : rectsOf(scene.value));
onMounted(() => {
    watch(layoutResult, result => emit('layout', result), { immediate: true });
    let published: DiagramSceneSize | undefined;
    watch(layoutResult, result => {
        const size = sceneContentSize(result);
        if (published?.width === size.width && published?.height === size.height) return;
        published = size;
        emit('sizeChange', size);
        emit('update:contentSize', size);
    }, { immediate: true });
});
function onKeydown(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey || event.altKey)
        return;
    const target = event.target as HTMLElement | null;
    if (target !== null && target !== event.currentTarget &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable))
        return;
    if (event.key === '+' || event.key === '=')
        zoomIn();
    else if (event.key === '-' || event.key === '_')
        zoomOut();
    else if (event.key === '0')
        fitToFrame();
    else
        return;
    event.preventDefault();
}
const touches = new Map<number, {
    x: number;
    y: number;
}>();
let pinch: {
    distance: number;
    zoom: number;
} | undefined;
function touchDistance() {
    const [a, b] = [...touches.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
}
function onPointerDown(event: PointerEvent) {
    if (event.pointerType !== 'touch')
        return;
    touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
    pinch = touches.size === 2 ? { distance: touchDistance(), zoom: zoom.value } : undefined;
}
function onPointerMove(event: PointerEvent) {
    if (!touches.has(event.pointerId))
        return;
    touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinch !== undefined && pinch.distance > 0) {
        event.preventDefault();
        setZoom(pinch.zoom * touchDistance() / pinch.distance);
    }
}
function onPointerEnd(event: PointerEvent) { touches.delete(event.pointerId); pinch = undefined; }
const origin = shallowRef<ReadonlyMap<string, Rect>>();
const progress = shallowRef(1);
let easing = (value: number) => value;
let duration = 0;
let startedAt = 0;
let frameHandle: number | undefined;
let shown = sceneRects.value;
let shownDocument = props.document.documentId;
let pendingFocus: {
    occurrence: SceneOccurrenceRef;
    collapsed: boolean;
} | undefined;
const eased = computed(() => origin.value === undefined ? 1 : easing(progress.value));
const displayed = computed(() => origin.value === undefined ? sceneRects.value : displayedRects(origin.value, sceneRects.value, eased.value));
const animating = computed(() => origin.value !== undefined);
function stopFrames() {
    if (frameHandle !== undefined)
        cancelAnimationFrame(frameHandle);
    frameHandle = undefined;
}
function settle() { stopFrames(); origin.value = undefined; progress.value = 1; }
function step() {
    frameHandle = undefined;
    const elapsed = performance.now() - startedAt;
    if (elapsed >= duration) {
        settle();
        return;
    }
    progress.value = elapsed / duration;
    frameHandle = requestAnimationFrame(step);
}
watch(sceneRects, next => {
    const sameScene = shownDocument === props.document.documentId;
    shownDocument = props.document.documentId;
    if (!sameScene || sameRects(shown, next)) {
        settle();
        return;
    }
    const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    duration = reduced ? 0 : parseDurationMs(token('--st-component-diagramScene-transitionDuration'));
    if (duration <= 0) {
        settle();
        return;
    }
    stopFrames();
    easing = parseEasing(token('--st-foundation-motion-easing'));
    origin.value = shown;
    progress.value = 0;
    startedAt = performance.now();
    frameHandle = requestAnimationFrame(step);
}, { flush: 'pre' });
watch(displayed, value => { shown = value; }, { flush: 'post' });
onUnmounted(() => { ownedCache.dispose(); stopFrames(); });
function rectOf(node: SceneNodeModel) { return displayed.value.get(node.occurrence) ?? node.rect; }
function nodeStyle(node: SceneNodeModel) {
    const rect = rectOf(node);
    return `left:${rect.x}px;top:${rect.y}px;width:${rect.width}px;height:${rect.height}px${origin.value !== undefined && !origin.value.has(node.occurrence) ? `;opacity:${eased.value}` : ''}`;
}
function toggleFold(node: SceneNodeModel) {
    pendingFocus = { occurrence: node.occurrence, collapsed: !node.collapsed };
    const next = node.collapsed ? collapsedNow.value.filter(id => id !== node.occurrence) : [...collapsedNow.value, node.occurrence];
    if (props.collapsed === undefined)
        folds.value = next;
    emit('foldChange', next, { occurrence: node.occurrence, collapsed: !node.collapsed });
    void nextTick(restoreToggleFocus);
}
function restoreToggleFocus() {
    if (pendingFocus === undefined)
        return;
    for (const candidate of viewportEl.value?.querySelectorAll<HTMLElement>('[data-scene-occurrence]') ?? []) {
        if (candidate.dataset['sceneOccurrence'] === pendingFocus.occurrence) {
            candidate.querySelector<HTMLElement>('button[aria-expanded]')?.focus({ preventScroll: true });
            if (collapsedNow.value.includes(pendingFocus.occurrence) === pendingFocus.collapsed)
                pendingFocus = undefined;
            return;
        }
    }
}
watch(collapsedNow, () => { void nextTick(restoreToggleFocus); }, { flush: 'post' });
function cardPropsOf(node: SceneNodeModel) {
    const projected = projectCardProps(node.presentation, { entityId: node.entity,
        resolveGlyph: props.resolveGlyph ?? getDiagramGlyph });
    return projected.kind === 'card' ? { ...projected.props, autoSize: true, height: node.rect.height } : undefined;
}
function zonePropsOf(node: SceneNodeModel) {
    const title = node.presentation?.text.title ?? '';
    const rect = rectOf(node);
    const hideToggle = scene.value?.r7Connectors === true && node.presentation?.form === 'legend';
    const projected = projectZoneProps(node.presentation, {
      containerPadding: effectiveMetrics.value.containerPadding, entityId: node.entity, collapsed: node.collapsed,
        ...(hideToggle ? {} : { toggleLabel: node.collapsed ? strings.value.expand(title) : strings.value.collapse(title) }),
        ...(node.collapsed ? {} : { width: rect.width, height: rect.height }),
        resolveGlyph: props.resolveGlyph ?? getDiagramGlyph });
    return projected.kind === 'zone' ? { ...projected.props, autoSize: true, height: rect.height } : undefined;
}
const projectedNodes = computed(() => scene.value?.nodes.map(node => ({ node,
    cardProps: node.kind === 'card' ? cardPropsOf(node) : undefined,
    zoneProps: node.kind === 'zone' ? zonePropsOf(node) : undefined,
})) ?? []);
// Paint order (diagram-canvas `scenePaintPlane`): expanded zone frames, the
// connectors, then every box. A zone frame is opaque: painted after the
// connectors it would hide every route that runs inside it.
const paintLayers = computed(() => [
    { plane: 'frame' as const, nodes: projectedNodes.value.filter(entry => scenePaintPlane(entry.node) === 'frame') },
    { plane: 'connectors' as const, nodes: [] },
    { plane: 'box' as const, nodes: projectedNodes.value.filter(entry => scenePaintPlane(entry.node) === 'box') },
]);
// The connector layer is masked over the footer text a frame paints itself.
const connectorMask = computed(() => scene.value === undefined ? undefined : sceneConnectorMask(scene.value));
const extraMarkers = computed(() => scene.value === undefined ? [] : extraConnectorMarkers(scene.value.edges, markerIds));
const legendEntries = computed(() => scene.value?.linkLegend?.entries.map(entry => ({
    entry,
    swatch: linkLegendSwatchGeometry(entry, effectiveMetrics.value),
})) ?? []);
const edgeCornerRadius = computed(() => effectiveMetrics.value.edgeCornerRadius ?? DEFAULT_EDGE_CORNER_RADIUS);
const pathOf = (items: readonly { readonly x: number; readonly y: number }[], endTrim = 0) => connectorPath(items, edgeCornerRadius.value, endTrim);
const pointsOf = (items: readonly { readonly x: number; readonly y: number }[]) => items.map(point => `${point.x},${point.y}`).join(' ');
const worldStyle = computed(() => `transform:translate(${placement.value.translateX}px,${placement.value.translateY}px) scale(${zoom.value})`);
</script>

<template>
  <figure ref="figureEl" :class="['st-diagramSceneFigure', { 'st-diagramSceneFigure--compact': compact, 'st-diagramSceneFigure--fitToWindow': fitToWindow, 'st-diagramSceneFigure--fullscreen': fullscreen, 'st-diagramSceneFigure--fullscreenFallback': fallbackFullscreen }]"
    :aria-label="label ?? title" :data-zoom="zoom" :data-zoom-readout="readout"
    :data-fit-to-window="fitToWindow ? 'true' : undefined"
    :data-view-all="viewAll ? 'true' : undefined" :data-fullscreen="fullscreenMode"
    :data-scene-refused="layoutResult.status === 'refused' ? layoutResult.refusals[0]?.code : undefined"
    @keydown="onFigureKeydown">
    <figcaption v-if="title !== undefined" class="st-diagramSceneFigure-title">{{ title }}</figcaption>
    <div ref="controlsEl" class="st-diagramSceneFigure-controls" role="group" :aria-label="strings.controls">
      <button type="button" class="st-iconButton st-iconButton--sm st-iconButton--secondary" :aria-label="strings.zoomOut" :disabled="zoom <= fit.minZoom" @click="zoomOut">
        <DiagramControlGlyph size="var(--st-component-button-anatomy-density-sm-fontSize)" />
      </button>
      <output class="st-diagramSceneFigure-readout" aria-live="polite" :aria-label="strings.zoomLevel(readout)">{{ readout }} %</output>
      <button type="button" class="st-iconButton st-iconButton--sm st-iconButton--secondary" :aria-label="strings.zoomIn" :disabled="zoom >= fit.maxZoom" @click="zoomIn">
        <DiagramControlGlyph plus size="var(--st-component-button-anatomy-density-sm-fontSize)" />
      </button>
      <button type="button" class="st-button st-button--secondary st-button--sm" @click="fitToFrame">{{ strings.fit }}</button>
      <button type="button" class="st-button st-button--secondary st-button--sm st-diagramSceneFigure-viewAll" :aria-pressed="viewAll" @click="toggleViewAll">
        <DiagramControlGlyph kind="view-all" size="var(--st-component-diagramScene-controlIconSize, var(--st-component-button-anatomy-density-sm-fontSize))" />
        <span>{{ strings.viewAll }}</span>
      </button>
      <button type="button" class="st-iconButton st-iconButton--sm st-iconButton--secondary st-diagramSceneFigure-fullscreen" :aria-label="strings.fullscreen" :aria-pressed="fullscreen" @click="toggleFullscreen">
        <DiagramControlGlyph :kind="fullscreen ? 'exit-fullscreen' : 'fullscreen'" size="var(--st-component-diagramScene-controlIconSize, var(--st-component-button-anatomy-density-sm-fontSize))" />
      </button>
    </div>
    <div ref="frameEl" class="st-diagramSceneFigure-frame">
      <p v-if="layoutResult.status === 'refused'" class="st-diagramSceneFigure-refused" role="alert">Diagram unavailable ({{ layoutResult.refusals[0]?.code ?? 'refused' }})</p>
      <div ref="viewportEl" class="st-diagramSceneFigure-viewport" role="group" tabindex="0"
        :aria-label="strings.viewport" aria-keyshortcuts="+ - 0" :aria-busy="animating"
        :data-pans="placement.overflowX || placement.overflowY ? 'true' : 'false'" :style="viewportStyle"
        @keydown="onKeydown" @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerup="onPointerEnd" @pointercancel="onPointerEnd">
        <div class="st-diagramSceneFigure-extent" :style="`width:${placement.contentWidth}px;height:${placement.contentHeight}px`">
          <div class="st-diagramSceneFigure-world" :style="worldStyle">
            <template v-if="scene !== undefined">
              <template v-for="layer in paintLayers" :key="layer.plane">
              <svg v-if="layer.plane === 'connectors'" class="st-diagramSceneFigure-edges" :data-process-connectors="scene.processConnectors ? '' : undefined" aria-hidden="true" :style="animating ? `opacity:${eased}` : undefined">
                <defs><marker :id="arrowId" viewBox="0 0 10 10" refX="9" refY="5" :markerUnits="scene.r7Connectors ? 'userSpaceOnUse' : undefined" :markerWidth="scene.r7Connectors ? '10.5' : '7'" :markerHeight="scene.r7Connectors ? '10.5' : '7'" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" :fill="scene.r7Connectors && !scene.processConnectors ? 'var(--st-component-diagramScene-linkStroke, var(--st-semantic-text-primary, #0f172a))' : 'var(--st-component-diagramScene-edgeStroke, #64748b)'" /></marker><marker v-for="marker in extraMarkers" :key="marker.id" :id="marker.id" :data-arrowhead-kind="marker.kind" :data-arrowhead-emphasis="marker.emphasis" :viewBox="marker.viewBox" :refX="marker.refX" :refY="marker.refY" :markerUnits="marker.markerUnits" :markerWidth="marker.markerWidth" :markerHeight="marker.markerHeight" :orient="marker.orient"><path :d="marker.path" :fill="marker.fill" :stroke="marker.stroke" :stroke-width="marker.strokeWidth" /></marker><mask v-if="connectorMask !== undefined" :id="maskId" maskUnits="userSpaceOnUse" :x="connectorMask.region.x" :y="connectorMask.region.y" :width="connectorMask.region.width" :height="connectorMask.region.height"><rect :x="connectorMask.region.x" :y="connectorMask.region.y" :width="connectorMask.region.width" :height="connectorMask.region.height" fill="#fff" /><rect v-for="(cutout, index) in connectorMask.cutouts" :key="index" :data-scene-cutout="index" :x="cutout.x" :y="cutout.y" :width="cutout.width" :height="cutout.height" fill="#000" /></mask></defs>
                <g data-scene-connectors="" :mask="connectorMask === undefined ? undefined : `url(#${maskId})`">
                <template v-for="edge in scene.edges" :key="edge.occurrence">
                  <template v-if="edge.r7">
                    <path :marker-end="edge.head === undefined ? connectorMarkerRef(edge, markerIds) : undefined" :stroke-dasharray="connectorDashArray(edge.strokeStyle)" :style="connectorDashPaint(edge.strokeStyle)" class="st-diagramSceneFigure-edge" :data-scene-edge="edge.occurrence" data-connector-mode="r7" :data-edge-stroke="edge.strokeStyle" :data-edge-arrowhead="edge.arrowhead" :data-edge-emphasis="edge.emphasis" :data-edge-tip="edge.head === undefined ? undefined : `${edge.head.tip.x},${edge.head.tip.y}`" :data-edge-pullback="edge.head === undefined ? undefined : edge.head.pullbackWorld" :d="pathOf(edge.points, edge.head?.pullbackWorld ?? 0)" />
                    <path v-if="edge.head !== undefined" class="st-diagramSceneFigure-edgeHead" data-connector-part="head" :data-head-for="edge.occurrence" :data-edge-emphasis="edge.emphasis" :d="edge.head.path" :fill="edge.emphasis === 'emphasis' ? 'var(--st-component-diagramScene-linkEmphasisStroke, var(--st-semantic-border-interactive, #001f33))' : scene.processConnectors ? 'var(--st-component-diagramScene-edgeStroke, #64748b)' : 'var(--st-component-diagramScene-linkStroke, var(--st-semantic-text-primary, #0f172a))'" />
                  </template>
                  <polyline v-else :marker-end="edge.markers === undefined ? `url(#${arrowId})` : undefined" class="st-diagramSceneFigure-edge" :data-scene-edge="edge.occurrence" :points="pointsOf(edge.points)" />
                </template>
                <g v-for="edge in scene.edges.filter(edge => edge.markers)" :key="edge.occurrence" v-html="edge.markers" />
                <template v-for="edgeLabel in scene.labels.filter(label => label.leader)" :key="edgeLabel.occurrence">
                  <path v-if="scene.r7Connectors && !edgeLabel.erd" class="st-diagramSceneFigure-edge" data-connector-mode="r7" :d="pathOf(edgeLabel.leader!)" />
                  <polyline v-else class="st-diagramSceneFigure-edge" :points="pointsOf(edgeLabel.leader!)" />
                </template>
                </g>
              </svg>
              <template v-else>
              <div v-for="{ node, cardProps, zoneProps } in layer.nodes" :key="node.occurrence" class="st-diagramSceneFigure-node" :data-scene-occurrence="node.occurrence" :data-scene-kind="node.kind" :data-authored-legend="scene.r7Connectors && node.presentation?.form === 'legend' ? '' : undefined" :style="nodeStyle(node)">
                <DiagramErdNode v-if="node.kind === 'erd' && node.erd" :node="node" :expand="strings.expand" :collapse="strings.collapse" :toggle="() => toggleFold(node)" />
                <DiagramProcessNode v-else-if="node.kind === 'process' && node.processBox" :node="node" />
                <template v-else-if="node.kind === 'card'">
                  <DiagramCard v-if="cardProps !== undefined" v-bind="cardProps" :measure="measure" @select="emit('select', $event)" />
                </template>
                <template v-else-if="node.kind === 'zone'">
                  <DiagramZone v-if="zoneProps !== undefined" v-bind="zoneProps" :measure="measure" @select="emit('select', $event)" @toggle="toggleFold(node)" />
                  <div
                    v-if="node.combinedLegend !== undefined"
                    class="st-diagramSceneFigure-authoredCombined"
                    :style="`top:${node.combinedLegend.topOffset}px;left:${node.combinedLegend.padding}px;right:${node.combinedLegend.padding}px;--st-diagram-legend-header-gap:${node.combinedLegend.headerGap}px;--st-diagram-legend-row-height:${node.combinedLegend.rowHeight}px;--st-diagram-legend-row-gap:${node.combinedLegend.rowGap}px;--st-diagram-legend-swatch-width:${node.combinedLegend.swatchWidth}px;--st-diagram-legend-swatch-height:${node.combinedLegend.swatchHeight}px;--st-diagram-legend-swatch-gap:${node.combinedLegend.swatchGap}px;--st-diagram-legend-font-size:${node.combinedLegend.fontSize}px`"
                  >
                    <ul class="st-diagramSceneFigure-legendList">
                      <li
                        v-for="row in node.combinedLegend.entries.map(entry => ({ entry, swatch: linkLegendSwatchGeometry(entry, effectiveMetrics) }))"
                        :key="row.entry.key"
                        class="st-diagramSceneFigure-legendItem"
                        :data-legend-style="row.entry.key"
                        :data-edge-stroke="row.entry.strokeStyle"
                        :data-edge-arrowhead="row.entry.arrowhead"
                        :data-edge-emphasis="row.entry.emphasis"
                      >
                        <svg class="st-diagramSceneFigure-legendSwatch" :viewBox="row.swatch.viewBox" aria-hidden="true">
                          <path :data-legend-swatch="row.entry.key" :d="row.swatch.linePath" fill="none" :stroke="row.swatch.stroke" :stroke-width="row.swatch.strokeWidth" :stroke-dasharray="row.swatch.dashArray" :style="connectorDashPaint(row.entry.strokeStyle)" vector-effect="non-scaling-stroke" />
                          <path v-if="row.swatch.arrowPath !== undefined" :d="row.swatch.arrowPath" :fill="row.swatch.arrowFill" :stroke="row.swatch.arrowStroke" :stroke-width="row.swatch.arrowStrokeWidth" />
                        </svg>
                        <span class="st-diagramSceneFigure-legendLabel">{{ row.entry.label }}</span>
                      </li>
                      <li v-for="mark in node.combinedLegend.entityMarks ?? []" :key="mark.kind" class="st-diagramSceneFigure-legendItem" :data-legend-mark="mark.kind">
                        <svg class="st-diagramSceneFigure-legendSwatch" :viewBox="`0 0 ${node.combinedLegend.swatchWidth} ${node.combinedLegend.swatchHeight}`" aria-hidden="true">
                          <rect v-if="mark.kind === 'proposed'" x="10" y="1" width="24" height="14" rx="4" fill="none" stroke="var(--st-semantic-border-strong, #64748b)" stroke-width="1.5" stroke-dasharray="4 3" />
                          <template v-else>
                            <rect x="12" y="1" width="20" height="14" rx="3" fill="var(--st-semantic-surface-subtle, #f8fafc)" stroke="var(--st-semantic-border-strong, #64748b)" stroke-width="1.5" />
                            <text x="22" y="12" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor">+</text>
                          </template>
                        </svg>
                        <span class="st-diagramSceneFigure-legendLabel">{{ mark.label }}</span>
                      </li>
                    </ul>
                  </div>
                </template>
                <div v-else-if="node.kind === 'legend-key' && node.swatch !== undefined" class="st-diagramSceneFigure-label st-diagramSceneFigure-legendKey" :data-entity="node.entity">
                  <span class="st-diagramSceneFigure-legendKeySwatch" data-legend-key-swatch="" :style="`background:${node.swatch.fill};border-color:${node.swatch.stroke}`" aria-hidden="true"></span>
                  <span class="st-diagramSceneFigure-legendKeyText">{{ node.text }}</span>
                </div>
                <div v-else class="st-diagramSceneFigure-label" :data-entity="node.entity">{{ node.text }}</div>
              </div>
              </template>
              </template>
              <div v-for="edgeLabel in scene.labels" :key="edgeLabel.occurrence" class="st-diagramSceneFigure-edgeLabel" :data-scene-label="edgeLabel.occurrence" :data-connector-mode="scene.r7Connectors && !edgeLabel.erd ? 'r7' : undefined" :title="edgeLabel.title" :data-erd-label="edgeLabel.erd || undefined"
                :style="`left:${edgeLabel.box.x}px;top:${edgeLabel.box.y}px;width:${edgeLabel.box.width}px;height:${edgeLabel.box.height}px${animating ? `;opacity:${eased}` : ''}`">
                <template v-if="edgeLabel.bundle !== undefined">
                  <strong class="st-diagramSceneFigure-bundleHeader">{{ edgeLabel.bundle.header }}</strong>{{ ' ' }}<div v-for="(group, index) in edgeLabel.bundle.groups" :key="index" class="st-diagramSceneFigure-bundleRelation" :data-bundle-relation="index">
                    <span aria-hidden="true">•</span><div><span v-for="(line, i) in group.lines" :key="i">{{ line }}</span></div>
                  </div>
                </template>
                <template v-else><span v-for="(line, index) in edgeLabel.lines" :key="index">{{ line }}</span></template>
              </div>
              <aside v-if="scene.linkLegend !== undefined" class="st-diagramSceneFigure-legend" role="region" :aria-label="scene.linkLegend.title" data-scene-legend="" :data-legend-anchor="scene.linkLegend.anchor"
                :style="linkLegendBoxStyle(scene.linkLegend, animating ? eased : undefined)">
                <div class="st-diagramSceneFigure-legendTitle">{{ scene.linkLegend.title }}</div>
                <ul class="st-diagramSceneFigure-legendList">
                  <li v-for="{ entry, swatch } in legendEntries" :key="entry.key" class="st-diagramSceneFigure-legendItem" :data-legend-style="entry.key" :data-edge-stroke="entry.strokeStyle" :data-edge-arrowhead="entry.arrowhead" :data-edge-emphasis="entry.emphasis">
                    <svg class="st-diagramSceneFigure-legendSwatch" :viewBox="swatch.viewBox" aria-hidden="true">
                      <path :data-legend-swatch="entry.key" :d="swatch.linePath" fill="none" :stroke="swatch.stroke" :stroke-width="swatch.strokeWidth" :stroke-dasharray="swatch.dashArray" :style="connectorDashPaint(entry.strokeStyle)" vector-effect="non-scaling-stroke" />
                      <path v-if="swatch.arrowPath !== undefined" :d="swatch.arrowPath" :fill="swatch.arrowFill" :stroke="swatch.arrowStroke" :stroke-width="swatch.arrowStrokeWidth" />
                    </svg>
                    <span class="st-diagramSceneFigure-legendLabel">{{ entry.label }}</span>
                  </li>
                  <li v-for="mark in scene.linkLegend.entityMarks ?? []" :key="mark.kind" class="st-diagramSceneFigure-legendItem" :data-legend-mark="mark.kind">
                    <svg class="st-diagramSceneFigure-legendSwatch" :viewBox="`0 0 ${scene.linkLegend.swatchWidth} ${scene.linkLegend.swatchHeight}`" aria-hidden="true">
                      <rect v-if="mark.kind === 'proposed'" x="10" y="1" width="24" height="14" rx="4" fill="none" stroke="var(--st-semantic-border-strong, #64748b)" stroke-width="1.5" stroke-dasharray="4 3" />
                      <template v-else>
                        <rect x="12" y="1" width="20" height="14" rx="3" fill="var(--st-semantic-surface-subtle, #f8fafc)" stroke="var(--st-semantic-border-strong, #64748b)" stroke-width="1.5" />
                        <text x="22" y="12" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor">+</text>
                      </template>
                    </svg>
                    <span class="st-diagramSceneFigure-legendLabel">{{ mark.label }}</span>
                  </li>
                </ul>
              </aside>
            </template>
          </div>
        </div>
      </div>
    </div>
  <DiagramSceneFallback :scene="scene" :document="props.document" :contains-label="strings.contains" />
  </figure>
</template>

<style>
  .st-diagramSceneFigure {
    /* Title and camera controls share the first row; the frame spans both. */
    align-items: center;
    display: grid;
    gap: var(--st-spacing-2, 0.5rem);
    grid-template-columns: minmax(0, 1fr) auto;
    margin: 0;
    min-width: 0;
  }
  .st-diagramSceneFigure--compact {
    gap: var(--st-spacing-1, 0.25rem);
  }
  .st-diagramSceneFigure--fitToWindow {
    margin-inline: auto;
    max-width: 100%;
  }
  .st-diagramSceneFigure--fitToWindow .st-diagramSceneFigure-viewport {
    margin-inline: auto;
    max-height: calc(100vh - var(--st-spacing-6, 1.5rem));
    max-width: 100%;
  }
  .st-diagramSceneFigure-title {
    color: var(--st-semantic-text-primary);
    grid-column: 1;
    font-weight: var(--st-component-button-anatomy-typography-weight);
  }
  .st-diagramSceneFigure--compact .st-diagramSceneFigure-title {
    font-size: var(--st-component-button-anatomy-density-sm-fontSize, 0.875rem);
  }
  .st-diagramSceneFigure-controls {
    align-items: center;
    display: inline-flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-1, 0.25rem);
    grid-column: 2;
    justify-content: flex-end;
  }
  .st-diagramSceneFigure-controls .st-diagramSceneFigure-viewAll {
    gap: var(--st-component-diagramScene-controlGap, var(--st-spacing-1, 0.25rem));
  }
  .st-diagramSceneFigure-controls .st-diagramSceneFigure-viewAll[aria-pressed="true"],
  .st-diagramSceneFigure-controls .st-diagramSceneFigure-fullscreen[aria-pressed="true"],
  .st-diagramSceneFigure-controls .st-diagramSceneFigure-viewAll[aria-pressed="true"]:not(:disabled):hover,
  .st-diagramSceneFigure-controls .st-diagramSceneFigure-fullscreen[aria-pressed="true"]:not(:disabled):hover {
    background: var(--st-component-diagramScene-controlActiveBackground, var(--st-semantic-action-primary));
    border-color: var(--st-component-diagramScene-controlActiveBorder, var(--st-semantic-action-primary));
    color: var(--st-component-diagramScene-controlActiveText, var(--st-semantic-action-primaryText));
  }
  .st-diagramSceneFigure--fullscreen,
  .st-diagramSceneFigure:fullscreen {
    align-content: stretch;
    background: var(--st-component-diagramScene-fullscreenBackground, var(--st-semantic-surface-default));
    box-sizing: border-box;
    grid-template-rows: auto minmax(0, 1fr);
    height: 100vh;
    height: 100dvh;
    inset: 0;
    padding: var(--st-component-diagramScene-fullscreenPadding, var(--st-spacing-4, 1rem));
    width: 100vw;
  }
  .st-diagramSceneFigure--fullscreen:has(.st-diagramSceneFigure-flowNavigator),
  .st-diagramSceneFigure:fullscreen:has(.st-diagramSceneFigure-flowNavigator) {
    grid-template-rows: auto auto minmax(0, 1fr);
  }
  .st-diagramSceneFigure--fullscreenFallback {
    position: fixed;
    z-index: var(--st-component-diagramScene-fullscreenZIndex, var(--st-component-overlay-zIndex, 90));
  }
  .st-diagramSceneFigure--fullscreen .st-diagramSceneFigure-frame,
  .st-diagramSceneFigure:fullscreen .st-diagramSceneFigure-frame {
    height: 100%;
    min-height: 0;
  }
  .st-diagramSceneFigure--fullscreen .st-diagramSceneFigure-viewport,
  .st-diagramSceneFigure:fullscreen .st-diagramSceneFigure-viewport {
    max-height: none;
  }
  @media (prefers-reduced-motion: reduce) {
    .st-diagramSceneFigure-controls button {
      transition: none;
    }
  }
  .st-diagramSceneFigure-readout {
    color: var(--st-semantic-text-secondary);
    font-size: var(--st-component-button-anatomy-density-sm-fontSize, 0.875rem);
    font-variant-numeric: tabular-nums;
    min-width: var(--st-component-diagramScene-readoutMinWidth);
    text-align: center;
  }
  .st-diagramSceneFigure-frame {
    grid-column: 1 / -1;
    min-width: 0;
    width: 100%;
  }
  .st-diagramSceneFigure-viewport {
    /* The fit box: its height comes from the camera (inline). It scrolls
       only the axis the drawing overflows at the current zoom. */
    box-sizing: border-box;
    overflow: auto;
    position: relative;
    touch-action: pan-x pan-y;
    width: 100%;
  }
  .st-diagramSceneFigure-viewport:focus-visible {
    box-shadow: inset 0 0 0 var(--st-component-diagramCard-borderWidth) var(--st-component-iconButton-focusRing, var(--st-semantic-border-interactive));
    outline: none;
  }
  .st-diagramSceneFigure-extent {
    min-height: 100%;
    min-width: 100%;
    position: relative;
  }
  .st-diagramSceneFigure-world {
    left: 0;
    position: absolute;
    top: 0;
    transform-origin: 0 0;
  }
  .st-diagramSceneFigure-node {
    position: absolute;
  }
  .st-diagramSceneFigure-label {
    align-items: center;
    box-sizing: border-box;
    color: var(--st-component-diagramCard-text, var(--st-semantic-text-primary));
    display: flex;
    font-family: var(--st-component-diagramCard-fontFamily, var(--st-font-sans, Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif));
    font-size: var(--st-component-diagramCard-bodyFontSize, 24px);
    height: 100%;
    line-height: var(--st-component-diagramCard-bodyLineHeight, 1.3);
    width: 100%;
  }
  .st-diagramSceneFigure-edges {
    height: var(--st-component-diagramCard-ruleHeight);
    left: 0;
    overflow: visible;
    pointer-events: none;
    position: absolute;
    top: 0;
    width: var(--st-component-diagramCard-ruleHeight);
  }
  .st-diagramSceneFigure-edge {
    fill: none;
    stroke: var(--st-component-diagramScene-edgeStroke, var(--st-semantic-border-strong));
    stroke-linejoin: round;
    stroke-width: var(--st-component-diagramZone-borderWidth, 1.5px);
    vector-effect: non-scaling-stroke;
  }
  .st-diagramSceneFigure-edge[data-connector-mode="r7"] {
    stroke: var(--st-component-diagramScene-linkStroke, var(--st-semantic-text-primary, #0f172a));
    stroke-width: var(--st-diagram-link-stroke-width, var(--st-component-diagramScene-linkStrokeWidth, 3.5px));
  }
  .st-diagramSceneFigure-edge[data-connector-mode="r7"][data-edge-arrowhead="none"] {
    stroke-width: var(--st-diagram-link-related-stroke-width, var(--st-component-diagramScene-linkRelatedStrokeWidth, 3.5px));
  }
  .st-diagramSceneFigure-edges[data-process-connectors] .st-diagramSceneFigure-edge[data-connector-mode="r7"] {
    stroke: var(--st-component-diagramScene-edgeStroke, var(--st-semantic-border-strong));
    stroke-width: var(--st-component-diagramScene-processStrokeWidth, 2.5px);
  }
  .st-diagramSceneFigure-edge[data-connector-mode="r7"][data-edge-emphasis="emphasis"] {
    stroke: var(--st-component-diagramScene-linkEmphasisStroke, var(--st-semantic-border-interactive));
    stroke-width: var(--st-diagram-link-emphasis-stroke-width, var(--st-component-diagramScene-linkEmphasisStrokeWidth, 5px));
  }
  .st-diagramSceneFigure-edgeLabel {
    box-sizing: border-box;
    background: var(--st-component-diagramScene-labelSurface, var(--st-semantic-surface-raised));
    box-shadow: inset 0 0 0 var(--st-component-diagramScene-labelBorderWidth, 1px) var(--st-component-diagramScene-labelBorder, var(--st-semantic-border-subtle));
    align-items: center;
    color: var(--st-component-diagramScene-labelText, var(--st-semantic-text-primary));
    display: flex;
    flex-direction: column;
    font-family: var(--st-component-diagramCard-fontFamily, var(--st-font-sans, Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif));
    font-size: var(--st-component-diagramScene-edgeLabelFontSize, 18px);
    justify-content: center;
    line-height: var(--st-diagram-label-line-height, var(--st-component-diagramScene-edgeLabelLineHeight, 22px));
    pointer-events: none;
    position: absolute;
    white-space: nowrap;
  }
  .st-diagramSceneFigure-edgeLabel[data-connector-mode="r7"] {
    font-size: var(--st-diagram-overview-edge-label-size, var(--st-diagram-edge-label-size, var(--st-component-diagramScene-edgeLabelSize, var(--st-component-diagramScene-edgeLabelFontSize, 18px))));
    --st-diagram-edge-label-line-height: var(--st-diagram-overview-edge-label-line-height, var(--st-diagram-label-line-height, 22px));
    line-height: var(--st-diagram-edge-label-line-height);
  }
  .st-diagramSceneFigure-edgeLabel > span { display: block; flex: none; height: var(--st-diagram-edge-label-line-height, var(--st-diagram-label-line-height, 22px)); }
  .st-diagramSceneFigure-bundleHeader { display: block; padding: var(--st-component-diagramScene-labelPadding, 4px); font-weight: 400; }
  .st-diagramSceneFigure-bundleRelation { display: flex; align-self: stretch; gap: var(--st-component-diagramScene-bundleMarkerGap, 6px); padding: var(--st-component-diagramScene-labelPadding, 4px); box-shadow: inset 0 var(--st-component-diagramScene-labelBorderWidth, 1px) 0 var(--st-component-diagramScene-labelBorder, var(--st-semantic-border-subtle)); }
  .st-diagramSceneFigure-bundleRelation div { display: flex; flex-direction: column; }
  .st-diagramSceneFigure-legend {
    background: var(--st-component-diagramScene-labelSurface, var(--st-semantic-surface-raised));
    border-radius: var(--st-diagram-legend-radius, 8px);
    box-shadow: inset 0 0 0 var(--st-component-diagramZone-borderWidth, 1.5px) var(--st-component-diagramScene-labelBorder, var(--st-semantic-border-subtle));
    box-sizing: border-box;
    color: var(--st-component-diagramScene-labelText, var(--st-semantic-text-primary));
    display: flex;
    flex-direction: column;
    font-family: var(--st-component-diagramCard-fontFamily, var(--st-font-sans, Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif));
    font-size: var(--st-diagram-legend-font-size, var(--st-component-diagramScene-edgeLabelSize, var(--st-component-diagramScene-edgeLabelFontSize, 18px)));
    gap: var(--st-diagram-legend-header-gap);
    line-height: var(--st-diagram-label-line-height, var(--st-component-diagramScene-edgeLabelLineHeight, 22px));
    padding: var(--st-diagram-legend-padding);
    position: absolute;
  }
  .st-diagramSceneFigure-legendKey { gap: var(--st-spacing-2, 8px); }
  .st-diagramSceneFigure-legendKeySwatch {
    border: var(--st-component-diagramScene-labelBorderWidth, 1px) solid var(--st-semantic-border-default, #94a3b8);
    border-radius: var(--st-radius-sm, 4px);
    box-sizing: border-box;
    display: inline-block;
    flex: none;
    height: var(--st-diagram-legend-swatch-height, 16px);
    width: var(--st-spacing-6, 24px);
  }
  .st-diagramSceneFigure-authoredCombined {
    border-top: var(--st-component-diagramScene-labelBorderWidth, 1px) solid var(--st-component-diagramScene-labelBorder, var(--st-semantic-border-subtle));
    font-family: var(--st-component-diagramCard-fontFamily, var(--st-font-sans, Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif));
    font-size: var(--st-diagram-legend-font-size, var(--st-component-diagramScene-edgeLabelSize, 18px));
    padding-top: var(--st-diagram-legend-row-gap, 6px);
    position: absolute;
  }
  .st-diagramSceneFigure-legendTitle {
    align-items: center;
    border-bottom: var(--st-component-diagramScene-labelBorderWidth, 1px) solid var(--st-component-diagramScene-labelBorder, var(--st-semantic-border-subtle));
    box-sizing: border-box;
    display: flex;
    flex: none;
    font-weight: var(--st-component-diagramCard-titleFontWeight, 700);
    height: var(--st-diagram-legend-header-height);
    white-space: nowrap;
  }
  .st-diagramSceneFigure-legendList {
    display: flex;
    flex-direction: column;
    gap: var(--st-diagram-legend-row-gap);
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .st-diagramSceneFigure-legendItem {
    align-items: center;
    box-sizing: border-box;
    display: flex;
    flex: none;
    gap: var(--st-diagram-legend-swatch-gap);
    height: var(--st-diagram-legend-row-height);
    white-space: nowrap;
  }
  .st-diagramSceneFigure-legendSwatch {
    flex: none;
    height: var(--st-diagram-legend-swatch-height);
    overflow: visible;
    width: var(--st-diagram-legend-swatch-width);
  }
  .st-diagramSceneFigure-legendLabel { white-space: nowrap; }
</style>
