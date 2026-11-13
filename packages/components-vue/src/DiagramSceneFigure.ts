import { computed, defineComponent, h, nextTick, onBeforeUnmount, onMounted, shallowRef, useId, watch, type PropType, type VNode } from "vue";
import { Minus, Plus } from "lucide-vue-next";
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
import { Button } from "./Button.js";
import { IconButton } from "./IconButton.js";
import { Select } from "./Select.js";
import { sceneNode } from "./diagramSceneNodes.js";
import type { DiagramSceneFigureProps as SharedSceneFigureProps, DiagramSceneFigureLabels, DiagramSceneCamera } from "@sentropic/diagram-canvas/diagramSceneModel";
export interface DiagramSceneFigureProps extends SharedSceneFigureProps {}
export type { DiagramSceneFigureLabels, DiagramSceneCamera } from "@sentropic/diagram-canvas/diagramSceneModel";

const DEFAULT_LABELS: DiagramSceneFigureLabels = {
  ...DEFAULT_FLOW_STRINGS, controls: "Zoom", zoomIn: "Zoom in", zoomOut: "Zoom out", fit: "Fit",
  zoomLevel: (percent) => `Zoom ${percent} %`, viewport: "Diagram", expand: (title) => `Expand ${title}`, collapse: (title) => `Collapse ${title}`,
};
const optional = <K extends keyof DiagramSceneFigureProps>(type: PropType<DiagramSceneFigureProps[K]>) => ({ type, default: undefined });
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Vue binding of the shared scene/layout and logical flow model. No layout work depends on interaction state. */
export const DiagramSceneFigure = defineComponent({
  name: "DiagramSceneFigure",
  props: {
    document: { type: Object as PropType<DiagramSceneFigureProps["document"]>, required: true },
    registry: { type: Object as PropType<DiagramSceneFigureProps["registry"]>, required: true },
    presentation: { type: Object as PropType<DiagramSceneFigureProps["presentation"]>, required: true },
    view: optional<"view">(Object as PropType<DiagramSceneFigureProps["view"]>),
    bindings: optional<"bindings">(Object as PropType<DiagramSceneFigureProps["bindings"]>),
    hints: optional<"hints">(Object as PropType<DiagramSceneFigureProps["hints"]>),
    metrics: optional<"metrics">(Object as PropType<DiagramSceneFigureProps["metrics"]>),
    rowPack: optional<"rowPack">(Object as PropType<DiagramSceneFigureProps["rowPack"]>),
    targetWidth: optional<"targetWidth">(Number as PropType<number>),
    measure: optional<"measure">(Function as PropType<DiagramSceneFigureProps["measure"]>),
    measureLines: optional<"measureLines">(Function as PropType<DiagramSceneFigureProps["measureLines"]>),
    collapsed: optional<"collapsed">(Array as PropType<DiagramSceneFigureProps["collapsed"]>),
    defaultFolds: optional<"defaultFolds">(Array as PropType<DiagramSceneFigureProps["defaultFolds"]>),
    title: optional<"title">(String), label: optional<"label">(String), compact: { type: Boolean, default: false },
    labels: optional<"labels">(Object as PropType<DiagramSceneFigureProps["labels"]>),
    resolveGlyph: optional<"resolveGlyph">(Function as PropType<DiagramSceneFigureProps["resolveGlyph"]>),
    layoutCache: optional<"layoutCache">(Object as PropType<DiagramSceneFigureProps["layoutCache"]>),
    contentSize: optional<"contentSize">(Object as PropType<DiagramSceneFigureProps["contentSize"]>),
    flows: optional<"flows">(Object as PropType<DiagramSceneFigureProps["flows"]>),
    scenario: optional<"scenario">(String), defaultScenario: optional<"defaultScenario">(String),
    activeStep: optional<"activeStep">(String), defaultActiveStep: optional<"defaultActiveStep">(String),
    onStepChange: optional<"onStepChange">(Function as PropType<DiagramSceneFigureProps["onStepChange"]>),
    onScenarioChange: optional<"onScenarioChange">(Function as PropType<DiagramSceneFigureProps["onScenarioChange"]>),
    onHighlightChange: optional<"onHighlightChange">(Function as PropType<DiagramSceneFigureProps["onHighlightChange"]>),
    onFoldChange: optional<"onFoldChange">(Function as PropType<DiagramSceneFigureProps["onFoldChange"]>),
    onSelect: optional<"onSelect">(Function as PropType<DiagramSceneFigureProps["onSelect"]>),
    onLayout: optional<"onLayout">(Function as PropType<DiagramSceneFigureProps["onLayout"]>),
    onCameraChange: optional<"onCameraChange">(Function as PropType<DiagramSceneFigureProps["onCameraChange"]>),
    onSizeChange: optional<"onSizeChange">(Function as PropType<DiagramSceneFigureProps["onSizeChange"]>),
  },
  emits: ["update:contentSize"],
  setup(props, { expose, emit }) {
    const ownedCache = createLayoutCache(), hostId = useId();
    const frame = shallowRef<HTMLElement>(), viewport = shallowRef<HTMLElement>();
    const strings = computed(() => ({ ...DEFAULT_LABELS, ...props.labels }));
    const flowOptions = computed(() => ({ ...props.flows, countTemplate: strings.value.count }));
    const tokens = shallowRef<FlowTokens>(DEFAULT_FLOW_TOKENS);
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
        ...(props.hints === undefined ? {} : { hints: props.hints }), ...(props.metrics === undefined ? {} : { metrics: props.metrics }),
        ...(props.rowPack === undefined ? {} : { rowPack: props.rowPack }), ...(props.targetWidth === undefined ? {} : { targetWidth: props.targetWidth }),
        ...(previousOrientation === undefined ? {} : { previousOrientation }),
      });
      if (result.status === "laid-out") previousOrientation = result.orientations;
      return result;
    });
    const scene = computed<SceneModel | undefined>(() => layout.value.status !== "laid-out" ? undefined : resolveScene(layout.value, { document: props.document, presentation: props.presentation, measureLines: measureLines.value, flows: flowOptions.value, ...(props.metrics === undefined ? {} : { metrics: props.metrics }) }));
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
    const fit = computed(() => sceneFit({ ...(scene.value?.bounds === undefined ? {} : { bounds: scene.value.bounds }), viewWidth: width.value ?? props.targetWidth ?? DEFAULT_SCENE_TARGET_WIDTH, windowHeight: windowHeight.value ?? Infinity, ...(maxScale.value === undefined ? {} : { maxDisplayScale: maxScale.value }), ...(minScale.value === undefined ? {} : { minReadableScale: minScale.value }) }));
    const zoom = computed(() => resolveZoom(requestedZoom.value, fit.value));
    const readout = computed(() => zoomReadout(zoom.value, fit.value.maxZoom));
    const placement = computed(() => scenePlacement(scene.value?.bounds, zoom.value, fit.value));
    function readTokens(): void {
      if (frame.value === undefined) return;
      const style = getComputedStyle(frame.value), value = (key: string) => style.getPropertyValue(`--st-component-diagramScene-${key}`).trim();
      const next = { ...DEFAULT_FLOW_TOKENS };
      for (const key of Object.keys(next) as (keyof FlowTokens)[]) { const token = value(key); if (key === "flowArrowPath") { if (token) next.flowArrowPath = token; } else { const parsed = parseScale(token); if (parsed !== undefined) (next as unknown as Record<string, number>)[key] = parsed; } }
      if (!same(next, tokens.value)) tokens.value = next;
      maxScale.value = parseScale(value("maxDisplayScale")); minScale.value = parseScale(value("minReadableScale"));
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
    function fitToFrame(): void { readTokens(); atFit = true; requestedZoom.value = fit.value.zoom; void nextTick(() => { if (viewport.value !== undefined) { viewport.value.scrollLeft = 0; viewport.value.scrollTop = 0; } }); }
    function getCamera(): DiagramSceneCamera { return { zoom: zoom.value, readout: readout.value, minZoom: fit.value.minZoom, maxZoom: fit.value.maxZoom, fitZoom: fit.value.zoom, pans: placement.value.overflowX || placement.value.overflowY }; }
    expose({ setZoom, zoomIn, zoomOut, fitToFrame, getCamera });
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
    return () => {
      const current = scene.value, labels = strings.value;
      const button = (text: string, action: () => void) => h(Button, { size: "sm", variant: "secondary", onClick: action }, { default: () => text });
      const world: VNode[] = current === undefined ? [] : [
        h("svg", { class: "st-diagramSceneFigure-edges", "aria-hidden": "true" }, current.edges.flatMap((edge) => [
          h("polyline", { key: edge.occurrence, class: "st-diagramSceneFigure-edge", "data-scene-edge": edge.occurrence, "data-flow-step": edge.flow?.relation, "data-flow-bundle": edge.bundle?.id, "data-flow-state": stateOf(edge.occurrence), points: points(edge.points) }),
          ...(edge.directed ? [h("polyline", { class: "st-diagramSceneFigure-flowHit", "data-flow-hit": edge.occurrence, points: points(edge.points) }), ...edge.arrows.map((arrow) => h("path", { class: "st-diagramSceneFigure-flowArrow", "data-flow-arrow": edge.occurrence, "data-flow-state": stateOf(edge.occurrence), d: tokens.value.flowArrowPath, transform: `translate(${arrow.tip.x} ${arrow.tip.y}) rotate(${arrow.angle}) translate(${-tokens.value.flowArrowLength} ${-tokens.value.flowArrowWidth / 2})` }))] : []),
        ])),
        ...current.nodes.map((node) => h("div", { key: node.occurrence, class: "st-diagramSceneFigure-node", "data-scene-occurrence": node.occurrence, "data-scene-kind": node.kind, "data-flow-state": stateOf(node.occurrence), style: boxStyle(node.rect) }, [sceneNode(node, { measure: measure.value, expand: labels.expand, collapse: labels.collapse, ...(props.resolveGlyph === undefined ? {} : { resolveGlyph: props.resolveGlyph }), select: () => { if (suppressClick) { suppressClick = false; return; } dispatch({ type: "activate", target: boxTarget(node.occurrence) }); props.onSelect?.({ entityId: node.entity }); }, toggle: () => toggle(node) })])),
        ...current.badges.flatMap((badge) => [h("button", { key: badge.id, type: "button", class: "st-diagramSceneFigure-flowBadge", "data-flow-badge": badge.id, "data-flow-state": stateOf(badge.occurrence), "aria-pressed": same(selected.value, badge.target), "aria-describedby": descriptionId("badge", badge.id), tabindex: badgeTab.value === badge.id ? 0 : -1, style: boxStyle(badge.box) }, badge.text), h("span", { class: "st-diagramSceneFigure-flowDescription", id: descriptionId("badge", badge.id) }, description(badge.target))]),
        ...current.nodeTargets.flatMap((target) => [h("button", { key: `node:${target.occurrence}`, type: "button", class: "st-diagramSceneFigure-flowNode", "data-flow-node": target.occurrence, "data-flow-state": stateOf(target.occurrence), "aria-label": description(boxTarget(target.occurrence)), "aria-pressed": selected.value?.kind === "box" && selected.value.occurrence === target.occurrence, "aria-describedby": descriptionId("node", target.occurrence), tabindex: nodeTab.value === target.occurrence ? 0 : -1, style: `left:${target.anchor.x}px;top:${target.anchor.y}px` }, labels.node), h("span", { class: "st-diagramSceneFigure-flowDescription", id: descriptionId("node", target.occurrence) }, description(boxTarget(target.occurrence)))]),
        ...current.labels.map((label) => h("div", { key: label.occurrence, class: "st-diagramSceneFigure-edgeLabel", "data-scene-label": label.occurrence, style: boxStyle(label.box) }, label.lines.map((line) => h("span", line)))),
      ];
      return h("figure", { class: ["st-diagramSceneFigure", props.compact ? "st-diagramSceneFigure--compact" : undefined], "aria-label": props.label ?? props.title, "data-zoom": zoom.value, "data-zoom-readout": readout.value, "data-scene-refused": layout.value.status === "refused" ? layout.value.refusals[0]?.code : undefined }, [
        props.title === undefined ? null : h("figcaption", { class: "st-diagramSceneFigure-title" }, props.title),
        h("div", { class: "st-diagramSceneFigure-controls", role: "group", "aria-label": labels.controls }, [h(IconButton, { size: "sm", variant: "secondary", "aria-label": labels.zoomOut, disabled: zoom.value <= fit.value.minZoom, onClick: zoomOut }, { default: () => h(Minus, { style: { width: "var(--st-component-button-anatomy-density-sm-fontSize)", height: "var(--st-component-button-anatomy-density-sm-fontSize)" }, "aria-hidden": "true" }) }), h("output", { class: "st-diagramSceneFigure-readout", "aria-live": "polite", "aria-label": labels.zoomLevel(readout.value) }, `${readout.value} %`), h(IconButton, { size: "sm", variant: "secondary", "aria-label": labels.zoomIn, disabled: zoom.value >= fit.value.maxZoom, onClick: zoomIn }, { default: () => h(Plus, { style: { width: "var(--st-component-button-anatomy-density-sm-fontSize)", height: "var(--st-component-button-anatomy-density-sm-fontSize)" }, "aria-hidden": "true" }) }), button(labels.fit, fitToFrame)]),
        steps.value.length === 0 ? null : h("div", { class: "st-diagramSceneFigure-flowNavigator", role: "group", "aria-label": labels.navigator }, [button(labels.previous, () => dispatch({ type: "previous" })), h("output", { "aria-label": labels.step }, current === undefined ? "" : announce(current, state.value, labels)), button(labels.next, () => dispatch({ type: "next" })), current === undefined || current.flows.scenarios.length < 2 ? null : h(Select, { label: labels.scenario, modelValue: state.value.scenario === undefined ? "all" : `scenario:${state.value.scenario}`, onChange: (event: Event) => { const value = (event.target as HTMLSelectElement).value; dispatch(value === "all" ? { type: "scenario" } : { type: "scenario", id: value.slice("scenario:".length) }); } }, { default: () => [h("option", { value: "all" }, labels.allScenarios), ...current.flows.scenarios.map((entry) => h("option", { value: `scenario:${entry.id}` }, entry.label || labels.scenario))] }), h("output", { class: "st-diagramSceneFigure-flowDescription", "aria-live": "polite" }, live.value)]),
        h("div", { ref: frame, class: "st-diagramSceneFigure-frame" }, [layout.value.status === "refused" ? h("p", { class: "st-diagramSceneFigure-refused", role: "alert" }, `Diagram unavailable (${layout.value.refusals[0]?.code ?? "refused"})`) : null,
          h("div", { ref: viewport, class: "st-diagramSceneFigure-viewport", role: "group", tabindex: 0, "aria-label": labels.viewport, "aria-keyshortcuts": steps.value.length > 0 ? "+ - 0 [ ] Escape" : "+ - 0", "aria-busy": "false", "data-pans": placement.value.overflowX || placement.value.overflowY ? "true" : "false", style: `${measured.value ? `height:${fit.value.fitHeight}px` : `aspect-ratio:${FIT_ASPECT}`};--st-diagram-zoom:${zoom.value}${steps.value.length > 0 ? `;--st-diagramSceneFigure-flowHit:${flowHitSize(zoom.value, tokens.value)}px` : ""}`,
            onKeydown: keydown, onPointerdown: pointerDown, onPointermove: pointerMove, onPointerup: pointerEnd, onPointercancel: pointerEnd,
            onPointerover: (e: PointerEvent) => dispatch({ type: "hover", target: targetAt(e.target) }), onPointerout: (e: PointerEvent) => dispatch({ type: "hover", target: targetAt(e.relatedTarget) }),
            onFocusin: (e: FocusEvent) => dispatch({ type: "focus", target: targetAt(e.target) }), onFocusout: (e: FocusEvent) => dispatch({ type: "focus", target: targetAt(e.relatedTarget) }), onClick: click, onClickCapture: captureClick,
          }, [h("div", { class: "st-diagramSceneFigure-extent", style: `width:${placement.value.contentWidth}px;height:${placement.value.contentHeight}px` }, [h("div", { class: "st-diagramSceneFigure-world", style: `transform:translate(${placement.value.translateX}px,${placement.value.translateY}px) scale(${zoom.value})`, "data-flow-active": highlight.value !== undefined && (highlight.value.primary.size > 0 || highlight.value.dimmed.size > 0) ? "true" : undefined }, world)])]),
        ]),
      ]);
    };
  },
});
