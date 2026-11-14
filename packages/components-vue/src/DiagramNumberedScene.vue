<script setup lang="ts">
defineOptions({ name: "DiagramSceneFigure" });
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, useId, watch } from "vue";
import { getDiagramGlyph } from './diagram-icons/registry.js';
import { clampZoom, createLayoutCache, DEFAULT_FLOW_TOKENS, FIT_ASPECT, zoomReadout, type FlowTokens, type Rect } from "@sentropic/diagram-canvas";
import { cardLineMeasurer, defaultCardMeasure } from "@sentropic/diagram-canvas/diagramCardModel";
import {
  INITIAL_FLOW_STATE, DEFAULT_FLOW_STRINGS, visibleOf, effectiveTarget, highlightOf, flowStateOf,
  reduce, describeTarget, announce, flowHitSize, stepChange, stepsOf,
  type FlowState, type FlowAction, type Visible,
} from "@sentropic/diagram-canvas/flowModel";
import {
  collapsedOccurrencesOf, sceneContentSize, DEFAULT_SCENE_TARGET_WIDTH, layoutScene, resolveScene,
  resolveZoom, sceneFit, scenePlacement, parseScale, WHEEL_ZOOM_RATE, ZOOM_STEP_RATIO,
  type SceneModel, type SceneNodeModel, type SceneOrientations, type SceneOccurrenceRef,
} from "@sentropic/diagram-canvas/diagramSceneModel";
import SceneNode from "./DiagramFlowNode.vue";
import DiagramControlGlyph from "./DiagramControlGlyph.vue";
import { measureRenderedBounds } from './diagramRenderedBounds.js';
import type { DiagramSceneFigureProps as SharedSceneFigureProps, DiagramSceneFigureLabels, DiagramSceneCamera } from "@sentropic/diagram-canvas/diagramSceneModel";
export interface DiagramSceneFigureProps extends SharedSceneFigureProps {}
export type { DiagramSceneFigureLabels, DiagramSceneCamera } from "@sentropic/diagram-canvas/diagramSceneModel";

const DEFAULT_LABELS: DiagramSceneFigureLabels = {
  ...DEFAULT_FLOW_STRINGS, controls: "Zoom", zoomIn: "Zoom in", zoomOut: "Zoom out", fit: "Fit",
  zoomLevel: (percent) => `Zoom ${percent} %`, viewport: "Diagram", expand: (title) => `Expand ${title}`, collapse: (title) => `Collapse ${title}`,
};
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const props = withDefaults(defineProps<DiagramSceneFigureProps>(), { compact: false });
const emit = defineEmits<{ "update:contentSize": [size: { width: number; height: number }] }>();
const ownedCache = createLayoutCache(), hostId = useId();
const arrowId = 'diagram-arrow-' + hostId;
const frame = shallowRef<HTMLElement>(), viewport = shallowRef<HTMLElement>();
const strings = computed(() => ({ ...DEFAULT_LABELS, ...props.labels }));
const flowOptions = computed(() => ({ ...props.flows, countTemplate: strings.value.count }));
const tokens = shallowRef<FlowTokens>(DEFAULT_FLOW_TOKENS);
const labelMargin = shallowRef<number>();
const effectiveMetrics = computed(() => ({ ...(labelMargin.value === undefined ? {} : { labelMargin: labelMargin.value }), ...props.metrics }));
const foldState = shallowRef<readonly SceneOccurrenceRef[]>(props.defaultFolds ?? collapsedOccurrencesOf(props.view));
const collapsedNow = computed(() => props.collapsed ?? foldState.value);
const measure = computed(() => props.measure ?? defaultCardMeasure);
const measureLines = computed(() => props.measureLines ?? cardLineMeasurer(measure.value));
let previousOrientation: SceneOrientations | undefined, orientationDocument: string | undefined;
const layout = computed(() => {
  if (orientationDocument !== props.document.documentId) { orientationDocument = props.document.documentId; previousOrientation = undefined; }
  const result = layoutScene({
    cache: props.layoutCache ?? ownedCache, document: props.document, registry: props.registry, presentation: props.presentation,
    measureLines: measureLines.value, collapsed: collapsedNow.value, flows: flowOptions.value, flowTokens: tokens.value,
    ...(props.view === undefined ? {} : { view: props.view }), ...(props.bindings === undefined ? {} : { bindings: props.bindings }),
    ...(props.hints === undefined ? {} : { hints: props.hints }), metrics: effectiveMetrics.value,
    ...(props.rowPack === undefined ? {} : { rowPack: props.rowPack }), ...(props.targetWidth === undefined ? {} : { targetWidth: props.targetWidth }),
    ...(previousOrientation === undefined ? {} : { previousOrientation }),
  });
  if (result.status === "laid-out") previousOrientation = result.orientations;
  return result;
});
const scene = computed<SceneModel | undefined>(() => layout.value.status !== "laid-out" ? undefined : resolveScene(layout.value, { document: props.document, presentation: props.presentation, measureLines: measureLines.value, flows: flowOptions.value, metrics: effectiveMetrics.value }));
watch(layout, (result) => props.onLayout?.(result), { immediate: true });
watch(() => sceneContentSize(layout.value), (size) => { props.onSizeChange?.(size); emit("update:contentSize", size); }, { immediate: true });

const local = shallowRef<FlowState>({ ...INITIAL_FLOW_STATE, selection: props.defaultActiveStep === undefined ? null : { kind: "step", relation: props.defaultActiveStep }, ...(props.defaultScenario === undefined ? {} : { scenario: props.defaultScenario }) });
const state = computed<FlowState>(() => {
  const { scenario: _filter, ...rest } = local.value;
  const filter = props.scenario === undefined ? local.value.scenario : props.scenario ?? undefined;
  return { ...rest, selection: props.activeStep === undefined ? local.value.selection : props.activeStep === null ? null : { kind: "step", relation: props.activeStep }, ...(filter === undefined ? {} : { scenario: filter }) };
});
const selected = computed(() => scene.value === undefined ? null : visibleOf(scene.value, state.value.selection));
const highlight = computed(() => scene.value === undefined ? undefined : highlightOf(scene.value, state.value));
const steps = computed(() => scene.value === undefined ? [] : stepsOf(scene.value));
const live = shallowRef("");
const pendingNavigation = shallowRef<string>();
const badgeCursor = shallowRef<string>(), nodeCursor = shallowRef<string>();
const badgeTab = computed(() => scene.value?.badges.find((b) => b.id === badgeCursor.value)?.id ?? scene.value?.badges.find((b) => same(b.target, selected.value))?.id ?? scene.value?.badges[0]?.id);
const nodeTab = computed(() => scene.value?.nodeTargets.find((n) => n.occurrence === nodeCursor.value)?.occurrence ?? (selected.value?.kind === "box" ? scene.value?.nodeTargets.find((n) => n.occurrence === (selected.value as { occurrence: string }).occurrence)?.occurrence : undefined) ?? scene.value?.nodeTargets[0]?.occurrence);
const stateOf = (id: string) => highlight.value === undefined ? undefined : flowStateOf(highlight.value, id);
const boxTarget = (occurrence: string): Visible => ({ kind: "box", occurrence });
const description = (target: Visible) => scene.value === undefined ? "" : describeTarget(scene.value, target, strings.value);
const descriptionId = (group: string, id: string) => `${hostId}-${group}-${encodeURIComponent(id)}`;
function dispatch(action: FlowAction): void {
  const current = scene.value;
  if (current === undefined || steps.value.length === 0) return;
  const before = effectiveTarget(current, state.value), change = reduce(current, state.value, action);
  let next = change.state;
  if (props.activeStep !== undefined && change.emit.includes("step")) next = { ...next, selection: state.value.selection };
  if (props.scenario !== undefined && change.emit.includes("scenario")) { const { scenario: _filter, ...rest } = next; next = { ...rest, ...(state.value.scenario === undefined ? {} : { scenario: state.value.scenario }) }; }
  local.value = next;
  if (change.emit.includes("step")) props.onStepChange?.(stepChange(current, change.state.selection));
  if (change.emit.includes("scenario")) props.onScenarioChange?.(change.state.scenario ?? null);
  const displayed = effectiveTarget(current, next);
  if (!same(before, displayed)) props.onHighlightChange?.(displayed);
  if (["next", "previous", "first", "last"].includes(action.type) && change.emit.includes("step")) {
    if (props.activeStep === undefined) live.value = announce(current, next, strings.value);
    else pendingNavigation.value = change.state.selection?.kind === "step" ? change.state.selection.relation : undefined;
  } else if (change.emit.includes("step")) pendingNavigation.value = undefined;
}
watch([state, pendingNavigation], () => {
  if (scene.value !== undefined && pendingNavigation.value !== undefined && state.value.selection?.kind === "step" && state.value.selection.relation === pendingNavigation.value) {
    live.value = announce(scene.value, state.value, strings.value); pendingNavigation.value = undefined;
  }
});
function targetAt(element: EventTarget | null): Visible | null {
  if (!(element instanceof Element) || scene.value === undefined) return null;
  const target = element.closest<HTMLElement>("[data-flow-badge],[data-flow-node],[data-flow-hit],[data-scene-occurrence]");
  if (target === null) return null;
  if (target.dataset["flowBadge"] !== undefined) return scene.value.badges.find((b) => b.id === target.dataset["flowBadge"])?.target ?? null;
  const edge = scene.value.edges.find((e) => e.occurrence === target.dataset["flowHit"]);
  if (edge !== undefined) return edge.bundle === undefined ? { kind: "edge", occurrence: edge.occurrence } : { kind: "bundle", id: edge.bundle.id };
  const node = target.dataset["flowNode"] ?? target.dataset["sceneOccurrence"];
  return node !== undefined && scene.value.nodeTargets.some((n) => n.occurrence === node) ? boxTarget(node) : null;
}
let suppressClick = false;
function click(event: MouseEvent): void {
  if (suppressClick) { suppressClick = false; return; }
  const element = event.target as Element;
  if (element.closest("button[aria-expanded],input,select,textarea,a,[contenteditable=true]")) return;
  const target = targetAt(element);
  if (target !== null) { if (element.closest("[data-flow-badge],[data-flow-node],[data-flow-hit]")) dispatch({ type: "activate", target }); }
  else if (!element.closest("button")) dispatch({ type: "escape" });
}
function toggle(node: SceneNodeModel): void {
  requestedZoom.value = zoom.value;
  atFit = false;
  const next = node.collapsed ? collapsedNow.value.filter((id) => id !== node.occurrence) : [...collapsedNow.value, node.occurrence];
  if (props.collapsed === undefined) foldState.value = next;
  props.onFoldChange?.(next, { occurrence: node.occurrence, collapsed: !node.collapsed });
  void nextTick(() => [...(viewport.value?.querySelectorAll<HTMLElement>("[data-scene-occurrence]") ?? [])].find((el) => el.dataset["sceneOccurrence"] === node.occurrence)?.querySelector<HTMLElement>("button[aria-expanded]")?.focus({ preventScroll: true }));
}
function captureClick(event: MouseEvent): void {
  if (steps.value.length === 0) return;
  if (event.detail === 0) suppressClick = false;
  if (suppressClick) { suppressClick = false; event.preventDefault(); event.stopPropagation(); return; }
  const element = (event.target as Element).closest("button[aria-expanded]")?.closest<HTMLElement>("[data-scene-occurrence]");
  const node = scene.value?.nodes.find((n) => n.occurrence === element?.dataset["sceneOccurrence"]);
  if (node !== undefined) { event.stopPropagation(); toggle(node); }
}
function rove(event: KeyboardEvent): boolean {
  const element = event.target as HTMLElement;
  const group = element.hasAttribute("data-flow-badge") ? "[data-flow-badge]" : element.hasAttribute("data-flow-node") ? "[data-flow-node]" : undefined;
  if (group === undefined || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return false;
  const candidates = [...(viewport.value?.querySelectorAll<HTMLElement>(group) ?? [])], current = candidates.indexOf(element);
  const index = event.key === "Home" ? 0 : event.key === "End" ? candidates.length - 1 : Math.max(0, Math.min(candidates.length - 1, current + (["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1)));
  const next = candidates[index];
  if (next !== undefined) { if (group === "[data-flow-badge]") badgeCursor.value = next.dataset["flowBadge"]; else nodeCursor.value = next.dataset["flowNode"]; next.focus(); }
  event.preventDefault(); return true;
}
function keydown(event: KeyboardEvent): void {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const target = event.target as HTMLElement;
  if (target !== event.currentTarget && target.closest("input,textarea,select,[contenteditable]")) return;
  if (!event.shiftKey && rove(event)) return;
  if (!event.shiftKey && steps.value.length > 0 && ["]", "[", "Escape"].includes(event.key)) { dispatch({ type: event.key === "]" ? "next" : event.key === "[" ? "previous" : "escape" }); event.preventDefault(); return; }
  if (event.key === "+" || event.key === "=") zoomIn(); else if (event.key === "-" || event.key === "_") zoomOut(); else if (event.key === "0") fitToFrame(); else return;
  event.preventDefault();
}
let removedSelection: string | undefined;
watch(scene, (current, previous) => {
  if (current === undefined || previous === undefined) return;
  const focused = viewport.value?.ownerDocument.activeElement as HTMLElement | null;
  const group = focused?.hasAttribute("data-flow-badge") ? "[data-flow-badge]" : focused?.hasAttribute("data-flow-node") ? "[data-flow-node]" : undefined;
  if (group !== undefined) void nextTick(() => { if (focused != null && !focused.isConnected) (viewport.value?.querySelector<HTMLElement>(`${group}[tabindex="0"]`) ?? viewport.value)?.focus({ preventScroll: true }); });
  const before = state.value, repaired = reduce(current, before, { type: "repair" });
  local.value = { ...repaired.state, selection: props.activeStep === undefined ? repaired.state.selection : before.selection };
  if (before.selection?.kind === "step" && repaired.state.selection === null && removedSelection !== before.selection.relation) { removedSelection = before.selection.relation; props.onStepChange?.(null); }
  else if (repaired.state.selection !== null) removedSelection = undefined;
}, { flush: "pre" });
function scrollSelection(): void {
  const current = scene.value, element = viewport.value;
  if (current === undefined || element === undefined) return;
  const target = visibleOf(current, state.value.selection);
  const occurrence = target?.kind === "bundle" ? current.edges.find((e) => e.bundle?.id === target.id)?.occurrence : target?.occurrence;
  const points = current.edges.find((e) => e.occurrence === occurrence)?.points;
  const routeBox = points === undefined || points.length === 0 ? undefined : { x: Math.min(...points.map((p) => p.x)), y: Math.min(...points.map((p) => p.y)), width: Math.max(...points.map((p) => p.x)) - Math.min(...points.map((p) => p.x)), height: Math.max(...points.map((p) => p.y)) - Math.min(...points.map((p) => p.y)) };
  const box = current.badges.find((b) => b.occurrence === occurrence)?.box ?? current.nodes.find((n) => n.occurrence === occurrence)?.rect ?? routeBox;
  if (box === undefined) return;
  const left = box.x * zoom.value + placement.value.translateX, top = box.y * zoom.value + placement.value.translateY;
  if (left < element.scrollLeft) element.scrollLeft = left; else if (left + box.width * zoom.value > element.scrollLeft + element.clientWidth) element.scrollLeft = left + box.width * zoom.value - element.clientWidth;
  if (top < element.scrollTop) element.scrollTop = top; else if (top + box.height * zoom.value > element.scrollTop + element.clientHeight) element.scrollTop = top + box.height * zoom.value - element.clientHeight;
}
watch(() => JSON.stringify([state.value.selection, selected.value]), () => { badgeCursor.value = undefined; nodeCursor.value = undefined; void nextTick(scrollSelection); });

const width = shallowRef<number>(), windowHeight = shallowRef<number>(), maxScale = shallowRef<number>(), minScale = shallowRef<number>(), requestedZoom = shallowRef<number>();
let atFit = true;
const measured = computed(() => width.value !== undefined && windowHeight.value !== undefined);
const renderedBounds = shallowRef<{ scene: SceneModel; bounds: Rect }>();
const cameraBounds = computed(() => renderedBounds.value?.scene === scene.value ? renderedBounds.value?.bounds : scene.value?.bounds);
function readRenderedBounds(): void {
  if (frame.value === undefined || scene.value === undefined) return;
  const bounds = measureRenderedBounds(frame.value, scene.value.bounds, zoom.value);
  if (bounds !== undefined && bounds !== scene.value.bounds) renderedBounds.value = { scene: scene.value, bounds };
}
onMounted(() => { watch(scene, readRenderedBounds, { immediate: true, flush: 'post' }); });
const fit = computed(() => sceneFit({ ...(cameraBounds.value === undefined ? {} : { bounds: cameraBounds.value }), viewWidth: width.value ?? props.targetWidth ?? DEFAULT_SCENE_TARGET_WIDTH, windowHeight: windowHeight.value ?? Infinity, ...(maxScale.value === undefined ? {} : { maxDisplayScale: maxScale.value }), ...(minScale.value === undefined ? {} : { minReadableScale: minScale.value }) }));
const zoom = computed(() => resolveZoom(requestedZoom.value, fit.value));
const readout = computed(() => zoomReadout(zoom.value, fit.value.maxZoom));
const placement = computed(() => scenePlacement(cameraBounds.value, zoom.value, fit.value));
function readTokens(): void {
  if (frame.value === undefined) return;
  const style = getComputedStyle(frame.value), value = (key: string) => style.getPropertyValue(`--st-component-diagramScene-${key}`).trim();
  const next = { ...DEFAULT_FLOW_TOKENS };
  for (const key of Object.keys(next) as (keyof FlowTokens)[]) { const token = value(key); if (key === "flowArrowPath") { if (token) next.flowArrowPath = token; } else { const parsed = parseScale(token); if (parsed !== undefined) (next as unknown as Record<string, number>)[key] = parsed; } }
  if (!same(next, tokens.value)) tokens.value = next;
  maxScale.value = parseScale(value("maxDisplayScale")); minScale.value = parseScale(value("minReadableScale"));
  labelMargin.value = parseScale(value('labelPadding'));
}
function measureFrame(): void { if (frame.value === undefined) return; width.value = (viewport.value?.clientWidth || frame.value.clientWidth) || undefined; windowHeight.value = window.innerHeight || undefined; readTokens(); if (atFit) requestedZoom.value = undefined; }
function setZoom(next: number): void {
  if (!Number.isFinite(next)) return;
  readTokens(); const before = zoom.value, target = clampZoom(next, fit.value); atFit = target === fit.value.zoom;
  if (target === before) return;
  const element = viewport.value;
  const centre = element === undefined ? undefined : { x: (element.scrollLeft + element.clientWidth / 2 - placement.value.translateX) / before, y: (element.scrollTop + element.clientHeight / 2 - placement.value.translateY) / before };
  requestedZoom.value = target;
  if (element !== undefined && centre !== undefined) void nextTick(() => { element.scrollLeft = centre.x * zoom.value + placement.value.translateX - element.clientWidth / 2; element.scrollTop = centre.y * zoom.value + placement.value.translateY - element.clientHeight / 2; });
}
function zoomIn(): void { setZoom(zoom.value * ZOOM_STEP_RATIO); }
function zoomOut(): void { setZoom(zoom.value / ZOOM_STEP_RATIO); }
function fitToFrame(): void { readTokens(); readRenderedBounds(); atFit = true; requestedZoom.value = undefined; void nextTick(() => { if (viewport.value !== undefined) { viewport.value.scrollLeft = 0; viewport.value.scrollTop = 0; } }); }
function getCamera(): DiagramSceneCamera { return { zoom: zoom.value, readout: readout.value, minZoom: fit.value.minZoom, maxZoom: fit.value.maxZoom, fitZoom: fit.value.zoom, pans: placement.value.overflowX || placement.value.overflowY }; }
defineExpose({ setZoom, zoomIn, zoomOut, fitToFrame, getCamera });
watch(() => props.document.documentId, () => { atFit = true; requestedZoom.value = undefined; });
watch(getCamera, (camera) => props.onCameraChange?.(camera), { immediate: true });
const wheel = (event: WheelEvent) => { if (event.ctrlKey || event.metaKey) { event.preventDefault(); setZoom(zoom.value * Math.exp(-event.deltaY * WHEEL_ZOOM_RATE)); } };
let observer: ResizeObserver | undefined;
onMounted(() => { measureFrame(); window.addEventListener("resize", measureFrame); observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measureFrame); if (frame.value !== undefined) observer?.observe(frame.value); viewport.value?.addEventListener("wheel", wheel, { passive: false }); });
const touches = new Map<number, { x: number; y: number }>();
let touchOrigin: { x: number; y: number } | undefined, pinch: { distance: number; zoom: number } | undefined;
const distance = () => { const [a, b] = [...touches.values()]; return a === undefined || b === undefined ? 0 : Math.hypot(a.x - b.x, a.y - b.y); };
function pointerDown(event: PointerEvent): void { suppressClick = false; if (event.pointerType !== "touch") return; touchOrigin = { x: event.clientX, y: event.clientY }; touches.set(event.pointerId, touchOrigin); pinch = touches.size === 2 ? { distance: distance(), zoom: zoom.value } : undefined; }
function pointerMove(event: PointerEvent): void { if (!touches.has(event.pointerId)) return; if (touchOrigin !== undefined && (event.clientX !== touchOrigin.x || event.clientY !== touchOrigin.y)) suppressClick = true; touches.set(event.pointerId, { x: event.clientX, y: event.clientY }); if (pinch !== undefined && pinch.distance > 0) { event.preventDefault(); setZoom(pinch.zoom * distance() / pinch.distance); } }
const pointerEnd = (event: PointerEvent) => { touches.delete(event.pointerId); pinch = undefined; };
onBeforeUnmount(() => { window.removeEventListener("resize", measureFrame); observer?.disconnect(); viewport.value?.removeEventListener("wheel", wheel); touches.clear(); ownedCache.dispose(); });

const points = (items: readonly { x: number; y: number }[]) => items.map((p) => `${p.x},${p.y}`).join(" ");
const boxStyle = (rect: Rect) => `left:${rect.x}px;top:${rect.y}px;width:${rect.width}px;height:${rect.height}px`;

function selectNode(node: SceneNodeModel): void {
  if (suppressClick) { suppressClick = false; return; }
  dispatch({ type: "activate", target: boxTarget(node.occurrence) });
  props.onSelect?.({ entityId: node.entity });
}
function changeScenario(event: Event): void {
  const value = (event.target as HTMLSelectElement).value;
  dispatch(value === "all" ? { type: "scenario" } : { type: "scenario", id: value.slice("scenario:".length) });
}
const scenarioId = useId();
</script>

<template>
  <figure :class="['st-diagramSceneFigure', props.compact ? 'st-diagramSceneFigure--compact' : undefined]" :aria-label="props.label ?? props.title" :data-zoom="zoom" :data-zoom-readout="readout" :data-scene-refused="layout.status === 'refused' ? layout.refusals[0]?.code : undefined">
    <figcaption v-if="props.title !== undefined" class="st-diagramSceneFigure-title">{{ props.title }}</figcaption>
    <div class="st-diagramSceneFigure-controls" role="group" :aria-label="strings.controls">
      <button type="button" class="st-iconButton st-iconButton--sm st-iconButton--secondary" :aria-label="strings.zoomOut" :disabled="zoom <= fit.minZoom" @click="zoomOut"><DiagramControlGlyph size="var(--st-component-button-anatomy-density-sm-fontSize)" /></button>
      <output class="st-diagramSceneFigure-readout" aria-live="polite" :aria-label="strings.zoomLevel(readout)">{{ readout }} %</output>
      <button type="button" class="st-iconButton st-iconButton--sm st-iconButton--secondary" :aria-label="strings.zoomIn" :disabled="zoom >= fit.maxZoom" @click="zoomIn"><DiagramControlGlyph plus size="var(--st-component-button-anatomy-density-sm-fontSize)" /></button>
      <button type="button" class="st-button st-button--secondary st-button--sm" @click="fitToFrame">{{ strings.fit }}</button>
    </div>
    <div v-if="steps.length > 0" class="st-diagramSceneFigure-flowNavigator" role="group" :aria-label="strings.navigator">
      <button type="button" class="st-button st-button--secondary st-button--sm" @click="dispatch({ type: 'previous' })">{{ strings.previous }}</button>
      <output :aria-label="strings.step">{{ scene === undefined ? '' : announce(scene, state, strings) }}</output>
      <button type="button" class="st-button st-button--secondary st-button--sm" @click="dispatch({ type: 'next' })">{{ strings.next }}</button>
      <div v-if="scene !== undefined && scene.flows.scenarios.length >= 2" class="st-field">
        <label class="st-field__control" :for="scenarioId"><span class="st-field__label">{{ strings.scenario }}</span>
          <select :id="scenarioId" class="st-select st-select--md" :value="state.scenario === undefined ? 'all' : `scenario:${state.scenario}`" @change="changeScenario">
            <option value="all">{{ strings.allScenarios }}</option>
            <option v-for="entry in scene.flows.scenarios" :key="entry.id" :value="`scenario:${entry.id}`">{{ entry.label || strings.scenario }}</option>
          </select>
        </label>
      </div>
      <output class="st-diagramSceneFigure-flowDescription" aria-live="polite">{{ live }}</output>
    </div>
    <div ref="frame" class="st-diagramSceneFigure-frame">
      <p v-if="layout.status === 'refused'" class="st-diagramSceneFigure-refused" role="alert">Diagram unavailable ({{ layout.refusals[0]?.code ?? 'refused' }})</p>
      <div ref="viewport" class="st-diagramSceneFigure-viewport" role="group" tabindex="0" :aria-label="strings.viewport" :aria-keyshortcuts="steps.length > 0 ? '+ - 0 [ ] Escape' : '+ - 0'" aria-busy="false" :data-pans="placement.overflowX || placement.overflowY ? 'true' : 'false'"
        :style="`height:${fit.fitHeight}px;aspect-ratio:${FIT_ASPECT};overflow-x:${placement.overflowX ? 'auto' : 'hidden'};overflow-y:${placement.overflowY ? 'auto' : 'hidden'};--st-diagram-zoom:${zoom}${steps.length > 0 ? `;--st-diagramSceneFigure-flowHit:${flowHitSize(zoom, tokens)}px` : ''}`"
        @keydown="keydown" @pointerdown="pointerDown" @pointermove="pointerMove" @pointerup="pointerEnd" @pointercancel="pointerEnd"
        @pointerover="dispatch({ type: 'hover', target: targetAt($event.target) })" @pointerout="dispatch({ type: 'hover', target: targetAt($event.relatedTarget) })"
        @focusin="dispatch({ type: 'focus', target: targetAt($event.target) })" @focusout="dispatch({ type: 'focus', target: targetAt($event.relatedTarget) })" @click="click" @click.capture="captureClick">
        <div class="st-diagramSceneFigure-extent" :style="`width:${placement.contentWidth}px;height:${placement.contentHeight}px`">
          <div class="st-diagramSceneFigure-world" :style="`transform:translate(${placement.translateX}px,${placement.translateY}px) scale(${zoom})`" :data-flow-active="highlight !== undefined && (highlight.primary.size > 0 || highlight.dimmed.size > 0) ? 'true' : undefined">
            <template v-if="scene !== undefined">
              <svg class="st-diagramSceneFigure-edges" aria-hidden="true">
                <defs><marker :id="arrowId" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="var(--st-component-diagramScene-edgeStroke, #64748b)" /></marker></defs>
                <template v-for="edge in scene.edges" :key="edge.occurrence">
                  <polyline :marker-end="edge.markers === undefined && !edge.directed ? `url(#${arrowId})` : undefined" class="st-diagramSceneFigure-edge" :data-scene-edge="edge.occurrence" :data-flow-step="edge.flow?.relation" :data-flow-bundle="edge.bundle?.id" :data-flow-state="stateOf(edge.occurrence)" :points="points(edge.points)" />
                  <template v-if="edge.directed">
                    <polyline class="st-diagramSceneFigure-flowHit" :data-flow-hit="edge.occurrence" :points="points(edge.points)" />
                    <path v-for="(arrow, index) in edge.arrows" :key="index" class="st-diagramSceneFigure-flowArrow" :data-flow-arrow="edge.occurrence" :data-flow-state="stateOf(edge.occurrence)" :d="tokens.flowArrowPath" :transform="`translate(${arrow.tip.x} ${arrow.tip.y}) rotate(${arrow.angle}) translate(${-tokens.flowArrowLength} ${-tokens.flowArrowWidth / 2})`" />
                  </template>
                </template>
              </svg>
              <div v-for="node in scene.nodes" :key="node.occurrence" class="st-diagramSceneFigure-node" :data-scene-occurrence="node.occurrence" :data-scene-kind="node.kind" :data-flow-state="stateOf(node.occurrence)" :style="boxStyle(node.rect)">
                <SceneNode :node="node" :measure="measure" :expand="strings.expand" :collapse="strings.collapse" :resolve-glyph="props.resolveGlyph ?? getDiagramGlyph" :select="() => selectNode(node)" :toggle="() => toggle(node)" />
              </div>
              <template v-for="badge in scene.badges" :key="badge.id">
                <button type="button" class="st-diagramSceneFigure-flowBadge" :data-flow-badge="badge.id" :data-flow-state="stateOf(badge.occurrence)" :aria-pressed="same(selected, badge.target)" :aria-describedby="descriptionId('badge', badge.id)" :tabindex="badgeTab === badge.id ? 0 : -1" :style="boxStyle(badge.box)">{{ badge.text }}</button>
                <span class="st-diagramSceneFigure-flowDescription" :id="descriptionId('badge', badge.id)">{{ description(badge.target) }}</span>
              </template>
              <template v-for="target in scene.nodeTargets" :key="target.occurrence">
                <button type="button" class="st-diagramSceneFigure-flowNode" :data-flow-node="target.occurrence" :data-flow-state="stateOf(target.occurrence)" :aria-label="description(boxTarget(target.occurrence))" :aria-pressed="selected?.kind === 'box' && selected.occurrence === target.occurrence" :aria-describedby="descriptionId('node', target.occurrence)" :tabindex="nodeTab === target.occurrence ? 0 : -1" :style="`left:${target.anchor.x}px;top:${target.anchor.y}px`">{{ strings.node }}</button>
                <span class="st-diagramSceneFigure-flowDescription" :id="descriptionId('node', target.occurrence)">{{ description(boxTarget(target.occurrence)) }}</span>
              </template>
              <div v-for="label in scene.labels" :key="label.occurrence" class="st-diagramSceneFigure-edgeLabel" :data-scene-label="label.occurrence" :style="boxStyle(label.box)"><span v-for="(line, index) in label.lines" :key="index">{{ line }}</span></div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </figure>
</template>
