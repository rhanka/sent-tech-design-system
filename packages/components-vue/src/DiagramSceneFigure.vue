<script setup lang="ts">
defineOptions({ name: 'DiagramSceneFigure' });
import { computed, nextTick, onMounted, onUnmounted, shallowRef, watch } from 'vue';
import { renderErdCardSvg, renderErdTable, clampZoom, FIT_ASPECT, zoomReadout, type Rect, type LayoutResult } from '@sentropic/diagram-canvas';
import DiagramCard from './DiagramCard.vue';
import DiagramZone from './DiagramZone.vue';
import DiagramControlGlyph from './DiagramControlGlyph.vue';
import { cardLineMeasurer, defaultCardMeasure, projectCardProps, projectZoneProps } from './diagramCardModel.js';
import { collapsedOccurrencesOf, DEFAULT_SCENE_TARGET_WIDTH, displayedRects, layoutScene, parseDurationMs, parseEasing, parseScale, rectsOf, resolveScene, resolveZoom, sameRects, sceneFit, scenePlacement, WHEEL_ZOOM_RATE, ZOOM_STEP_RATIO, type SceneNodeModel, type SceneOccurrenceRef, type SceneOrientations, } from './diagramSceneModel.js';
import type { DiagramSceneFigureProps, DiagramSceneFigureLabels, DiagramSceneCamera } from './DiagramSceneFigure.types.js';
const props = defineProps<DiagramSceneFigureProps>();
const emit = defineEmits<{
    foldChange: [
        collapsed: readonly SceneOccurrenceRef[],
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
const defaults: DiagramSceneFigureLabels = {
    controls: 'Zoom', zoomIn: 'Zoom in', zoomOut: 'Zoom out', fit: 'Fit',
    zoomLevel: percent => `Zoom ${percent} %`, viewport: 'Diagram',
    expand: title => `Expand ${title}`, collapse: title => `Collapse ${title}`,
};
const strings = computed(() => ({ ...defaults, ...props.labels }));
const measure = computed(() => props.measure ?? defaultCardMeasure);
const measureLines = computed(() => props.measureLines ?? cardLineMeasurer(measure.value));
const folds = shallowRef<readonly SceneOccurrenceRef[]>(props.defaultFolds ?? collapsedOccurrencesOf(props.view));
const collapsedNow = computed(() => props.collapsed ?? folds.value);
let previousOrientation: SceneOrientations | undefined;
let orientationDocument: string | undefined;
const layoutResult = computed(() => {
    if (orientationDocument !== props.document.documentId) {
        orientationDocument = props.document.documentId;
        previousOrientation = undefined;
    }
    const result = layoutScene({
        document: props.document, registry: props.registry, presentation: props.presentation,
        measureLines: measureLines.value, collapsed: collapsedNow.value,
        ...(props.view === undefined ? {} : { view: props.view }),
        ...(props.bindings === undefined ? {} : { bindings: props.bindings }),
        ...(props.hints === undefined ? {} : { hints: props.hints }),
        ...(props.metrics === undefined ? {} : { metrics: props.metrics }),
        ...(props.rowPack === undefined ? {} : { rowPack: props.rowPack }),
        ...(props.targetWidth === undefined ? {} : { targetWidth: props.targetWidth }),
        ...(previousOrientation === undefined ? {} : { previousOrientation }),
    });
    if (result.status === 'laid-out' && result.orientations !== undefined)
        previousOrientation = result.orientations;
    return result;
});
const scene = computed(() => layoutResult.value.status === 'laid-out'
    ? resolveScene(layoutResult.value, {
        document: props.document, presentation: props.presentation, measureLines: measureLines.value,
        ...(props.metrics === undefined ? {} : { metrics: props.metrics }),
    }) : undefined);
const sceneRects = computed<ReadonlyMap<string, Rect>>(() => scene.value === undefined ? new Map() : rectsOf(scene.value));
onMounted(() => {
    watch(layoutResult, result => emit('layout', result), { immediate: true });
});
const frameEl = shallowRef<HTMLElement>();
const viewportEl = shallowRef<HTMLElement>();
const viewWidth = shallowRef<number>();
const windowHeight = shallowRef<number>();
const maxDisplayScale = shallowRef<number>();
const minReadableScale = shallowRef<number>();
const requestedZoom = shallowRef<number>();
let atFit = true;
function token(name: string) {
    return frameEl.value === undefined ? undefined : getComputedStyle(frameEl.value).getPropertyValue(name).trim();
}
function readCameraTokens() {
    maxDisplayScale.value = parseScale(token('--st-component-diagramScene-maxDisplayScale'));
    minReadableScale.value = parseScale(token('--st-component-diagramScene-minReadableScale'));
}
function measureFrame() {
    if (frameEl.value === undefined)
        return;
    const width = viewportEl.value?.clientWidth || frameEl.value.clientWidth;
    viewWidth.value = width > 0 ? width : undefined;
    windowHeight.value = window.innerHeight > 0 ? window.innerHeight : undefined;
    readCameraTokens();
    if (atFit)
        requestedZoom.value = undefined;
}
const measured = computed(() => viewWidth.value !== undefined && windowHeight.value !== undefined);
const fit = computed(() => sceneFit({
    ...(scene.value?.bounds === undefined ? {} : { bounds: scene.value.bounds }),
    viewWidth: viewWidth.value ?? props.targetWidth ?? DEFAULT_SCENE_TARGET_WIDTH,
    windowHeight: windowHeight.value ?? Number.POSITIVE_INFINITY,
    ...(maxDisplayScale.value === undefined ? {} : { maxDisplayScale: maxDisplayScale.value }),
    ...(minReadableScale.value === undefined ? {} : { minReadableScale: minReadableScale.value }),
}));
const zoom = computed(() => resolveZoom(requestedZoom.value, fit.value));
const readout = computed(() => zoomReadout(zoom.value, fit.value.maxZoom));
const placement = computed(() => scenePlacement(scene.value?.bounds, zoom.value, fit.value));
const camera = computed<DiagramSceneCamera>(() => ({
    zoom: zoom.value, readout: readout.value, minZoom: fit.value.minZoom,
    maxZoom: fit.value.maxZoom, fitZoom: fit.value.zoom,
    pans: placement.value.overflowX || placement.value.overflowY,
}));
watch(() => props.document.documentId, () => { atFit = true; requestedZoom.value = undefined; });
watch([measured, zoom, fit], () => {
    if (!measured.value)
        return;
    requestedZoom.value = zoom.value;
    if (zoom.value !== fit.value.zoom)
        atFit = false;
});
onMounted(() => {
    watch(camera, value => emit('cameraChange', value), { immediate: true });
});
function setZoom(next: number) {
    if (!Number.isFinite(next))
        return;
    readCameraTokens();
    const before = zoom.value;
    const target = clampZoom(next, fit.value);
    atFit = target === fit.value.zoom;
    if (target === before)
        return;
    const element = viewportEl.value;
    const centre = element === undefined ? undefined : {
        x: (element.scrollLeft + element.clientWidth / 2 - placement.value.translateX) / before,
        y: (element.scrollTop + element.clientHeight / 2 - placement.value.translateY) / before,
    };
    requestedZoom.value = target;
    if (element !== undefined && centre !== undefined)
        void nextTick(() => {
            element.scrollLeft = centre.x * zoom.value + placement.value.translateX - element.clientWidth / 2;
            element.scrollTop = centre.y * zoom.value + placement.value.translateY - element.clientHeight / 2;
        });
}
function zoomIn() { setZoom(zoom.value * ZOOM_STEP_RATIO); }
function zoomOut() { setZoom(zoom.value / ZOOM_STEP_RATIO); }
function fitToFrame() {
    readCameraTokens();
    atFit = true;
    requestedZoom.value = fit.value.zoom;
    void nextTick(() => {
        if (viewportEl.value) {
            viewportEl.value.scrollLeft = 0;
            viewportEl.value.scrollTop = 0;
        }
    });
}
function getCamera() { return camera.value; }
defineExpose({ setZoom, zoomIn, zoomOut, fitToFrame, getCamera });
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
function onWheel(event: WheelEvent) {
    if (!event.ctrlKey && !event.metaKey)
        return;
    event.preventDefault();
    setZoom(zoom.value * Math.exp(-event.deltaY * WHEEL_ZOOM_RATE));
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
    if (pinch !== undefined && pinch.distance > 0)
        setZoom(pinch.zoom * touchDistance() / pinch.distance);
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
let observer: ResizeObserver | undefined;
onMounted(() => {
    measureFrame();
    window.addEventListener('resize', measureFrame);
    observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measureFrame);
    if (frameEl.value)
        observer?.observe(frameEl.value);
    viewportEl.value?.addEventListener('wheel', onWheel, { passive: false });
});
onUnmounted(() => {
    stopFrames();
    observer?.disconnect();
    window.removeEventListener('resize', measureFrame);
    viewportEl.value?.removeEventListener('wheel', onWheel);
});
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
        ...(props.resolveGlyph === undefined ? {} : { resolveGlyph: props.resolveGlyph }) });
    return projected.kind === 'card' ? projected.props : undefined;
}
function zonePropsOf(node: SceneNodeModel) {
    const title = node.presentation?.text.title ?? '';
    const rect = rectOf(node);
    const projected = projectZoneProps(node.presentation, { entityId: node.entity, collapsed: node.collapsed,
        toggleLabel: node.collapsed ? strings.value.expand(title) : strings.value.collapse(title),
        ...(node.collapsed ? {} : { width: rect.width, height: rect.height }),
        ...(props.resolveGlyph === undefined ? {} : { resolveGlyph: props.resolveGlyph }) });
    return projected.kind === 'zone' ? projected.props : undefined;
}
const erdTable = computed(() => props.document.profileRefs.includes("erd@1") ? renderErdTable(props.document) : "");
const viewportStyle = computed(() => `${measured.value ? `height:${fit.value.fitHeight}px` : `aspect-ratio:${FIT_ASPECT}`};--st-diagram-zoom:${zoom.value}`);
const worldStyle = computed(() => `transform:translate(${placement.value.translateX}px,${placement.value.translateY}px) scale(${zoom.value})`);
</script>

<template>
  <figure :class="['st-diagramSceneFigure', { 'st-diagramSceneFigure--compact': compact }]"
    :aria-label="label ?? title" :data-zoom="zoom" :data-zoom-readout="readout"
    :data-scene-refused="layoutResult.status === 'refused' ? layoutResult.refusals[0]?.code : undefined">
    <figcaption v-if="title !== undefined" class="st-diagramSceneFigure-title">{{ title }}</figcaption>
    <div class="st-diagramSceneFigure-controls" role="group" :aria-label="strings.controls">
      <button type="button" class="st-iconButton st-iconButton--sm st-iconButton--secondary" :aria-label="strings.zoomOut" :disabled="zoom <= fit.minZoom" @click="zoomOut">
        <DiagramControlGlyph size="var(--st-component-button-anatomy-density-sm-fontSize)" />
      </button>
      <output class="st-diagramSceneFigure-readout" aria-live="polite" :aria-label="strings.zoomLevel(readout)">{{ readout }} %</output>
      <button type="button" class="st-iconButton st-iconButton--sm st-iconButton--secondary" :aria-label="strings.zoomIn" :disabled="zoom >= fit.maxZoom" @click="zoomIn">
        <DiagramControlGlyph plus size="var(--st-component-button-anatomy-density-sm-fontSize)" />
      </button>
      <button type="button" class="st-button st-button--secondary st-button--sm" @click="fitToFrame">{{ strings.fit }}</button>
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
              <svg class="st-diagramSceneFigure-edges" aria-hidden="true" :style="animating ? `opacity:${eased}` : undefined">
                <polyline v-for="edge in scene.edges" :key="edge.occurrence" class="st-diagramSceneFigure-edge" :data-scene-edge="edge.occurrence" :points="edge.points.map(point => `${point.x},${point.y}`).join(' ')" />
                <g v-for="edge in scene.edges.filter(edge => edge.markers)" :key="edge.occurrence" v-html="edge.markers" />
                <polyline v-for="edgeLabel in scene.labels.filter(label => label.leader)" :key="edgeLabel.occurrence" class="st-diagramSceneFigure-edge" :points="edgeLabel.leader!.map(point => point.x + ',' + point.y).join(' ')" />
              </svg>
              <div v-for="node in scene.nodes" :key="node.occurrence" class="st-diagramSceneFigure-node" :data-scene-occurrence="node.occurrence" :data-scene-kind="node.kind" :style="nodeStyle(node)">
                <template v-if="node.kind === 'erd' && node.erd">
                  <button class="st-diagramErd-toggle" type="button" :aria-label="node.collapsed ? strings.expand(node.erd.title) : strings.collapse(node.erd.title)" :aria-expanded="!node.collapsed" :style="`--st-erd-header-height: ${node.erd.headerHeight}px`" @click="toggleFold(node)">{{ node.erd.title }}</button>
                  <div class="st-diagramErd-svg" v-html="renderErdCardSvg(node.erd)" />
                </template>
                <template v-else-if="node.kind === 'card'">
                  <DiagramCard v-if="cardPropsOf(node) !== undefined" v-bind="cardPropsOf(node)!" :measure="measure" @select="emit('select', $event)" />
                </template>
                <template v-else-if="node.kind === 'zone'">
                  <DiagramZone v-if="zonePropsOf(node) !== undefined" v-bind="zonePropsOf(node)!" :measure="measure" @select="emit('select', $event)" @toggle="toggleFold(node)" />
                </template>
                <div v-else class="st-diagramSceneFigure-label" :data-entity="node.entity">{{ node.text }}</div>
              </div>
              <div v-for="edgeLabel in scene.labels" :key="edgeLabel.occurrence" class="st-diagramSceneFigure-edgeLabel" :data-scene-label="edgeLabel.occurrence" :data-erd-label="edgeLabel.erd || undefined"
                :style="`left:${edgeLabel.box.x}px;top:${edgeLabel.box.y}px;width:${edgeLabel.box.width}px;height:${edgeLabel.box.height}px${animating ? `;opacity:${eased}` : ''}`">
                <span v-for="(line, index) in edgeLabel.lines" :key="index">{{ line }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div v-if="erdTable" class="st-diagramErd-fallback" v-html="erdTable" />
  </figure>
</template>

<style>
  .st-diagramErd-toggle { position: absolute; inset: 0 0 auto; height: var(--st-erd-header-height); width: 100%; background: transparent; border: 0; color: transparent; cursor: pointer; }
  .st-diagramErd-svg { height: 100%; width: 100%; }

  .st-diagramSceneFigure-edgeLabel[data-erd-label] { background: var(--st-semantic-surface-default); }
  .st-diagramErd-fallback { grid-column: 1 / -1; overflow: auto; color: var(--st-semantic-text-primary); }
  .st-diagramErd-toggle:focus-visible { outline: var(--st-component-diagramErd-strokeWidth) solid var(--st-semantic-border-interactive); outline-offset: calc(-1 * var(--st-component-diagramErd-strokeWidth)); }
  .st-diagramSceneFigure {
    /* Title and camera controls share the first row; the frame spans both. */
    align-items: center;
    display: grid;
    gap: var(--st-spacing-2);
    grid-template-columns: minmax(0, 1fr) auto;
    margin: 0;
    min-width: 0;
  }
  .st-diagramSceneFigure--compact {
    gap: var(--st-spacing-1);
  }
  .st-diagramSceneFigure-title {
    color: var(--st-semantic-text-primary);
    grid-column: 1;
    font-weight: var(--st-component-button-anatomy-typography-weight);
  }
  .st-diagramSceneFigure--compact .st-diagramSceneFigure-title {
    font-size: var(--st-component-button-anatomy-density-sm-fontSize);
  }
  .st-diagramSceneFigure-controls {
    align-items: center;
    display: inline-flex;
    gap: var(--st-spacing-1);
    grid-column: 2;
  }
  .st-diagramSceneFigure-readout {
    color: var(--st-semantic-text-secondary);
    font-size: var(--st-component-button-anatomy-density-sm-fontSize);
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
    font-family: var(--st-component-diagramCard-fontFamily);
    font-size: var(--st-component-diagramCard-bodyFontSize);
    height: 100%;
    line-height: var(--st-component-diagramCard-bodyLineHeight);
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
    stroke: var(--st-component-diagramCard-border, var(--st-semantic-border-strong));
    stroke-linejoin: round;
    stroke-width: var(--st-component-diagramZone-borderWidth);
    vector-effect: non-scaling-stroke;
  }
  .st-diagramSceneFigure-edgeLabel {
    align-items: center;
    color: var(--st-semantic-text-secondary);
    display: flex;
    flex-direction: column;
    font-family: var(--st-component-diagramCard-fontFamily);
    font-size: var(--st-component-diagramScene-edgeLabelFontSize);
    justify-content: center;
    line-height: var(--st-component-diagramCard-bodyLineHeight);
    pointer-events: none;
    position: absolute;
    white-space: nowrap;
  }
</style>
