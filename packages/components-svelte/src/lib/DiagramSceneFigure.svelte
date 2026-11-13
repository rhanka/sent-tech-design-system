<script lang="ts">
  import { tick, untrack } from "svelte";
  import { Minus, Plus } from "@lucide/svelte";
  import {
    renderErdCardSvg, renderErdTable,
    clampZoom,
    createLayoutCache,
    FIT_ASPECT,
    zoomReadout,
    type LayoutHints,
    type LayoutMetrics,
    type LayoutOptions,
    type LayoutResult,
    type LineMeasurer,
    type Rect,
    type RowPackOptions,
  } from "@sentropic/diagram-canvas";
  import Button from "./Button.svelte";
  import DiagramCard from "./DiagramCard.svelte";
  import DiagramZone from "./DiagramZone.svelte";
  import IconButton from "./IconButton.svelte";
  import Select from "./Select.svelte";
  import { DEFAULT_FLOW_TOKENS, type FlowTokens } from "@sentropic/diagram-canvas";
  import { INITIAL_FLOW_STATE, DEFAULT_FLOW_STRINGS, visibleOf, effectiveTarget, highlightOf, flowStateOf, reduce, describeTarget, announce, flowHitSize, stepChange, stepsOf, type FlowState, type FlowAction, type Visible, type StepChange, type EffectiveTarget, type FlowStrings } from "@sentropic/diagram-canvas/flowModel";
  import {
    cardLineMeasurer,
    defaultCardMeasure,
    projectCardProps,
    projectZoneProps,
    type CardLineMeasure,
    type DiagramGlyphPaths,
  } from "./diagramCardModel.js";
  import {
    collapsedOccurrencesOf,
    sceneContentSize,
    type DiagramSceneSize,
    type SceneLayoutCache,
    DEFAULT_SCENE_TARGET_WIDTH,
    displayedRects,
    layoutScene,
    parseDurationMs,
    parseEasing,
    parseScale,
    rectsOf,
    resolveScene,
    resolveZoom,
    sameRects,
    sceneFit,
    scenePlacement,
    WHEEL_ZOOM_RATE,
    ZOOM_STEP_RATIO,
    type Easing,
    type SceneDocument,
    type SceneModel,
    type SceneNodeModel,
    type SceneOccurrenceRef,
    type SceneOrientations,
    type ScenePresentation,
    type SceneView,
  } from "@sentropic/diagram-canvas/diagramSceneModel";

  /**
   * `DiagramSceneFigure` — the generic scene host (DC-2a lot L4,
   * SPEC_EVOL_DC2A §4.3, §5, §6.7 and Appendix D; CARDS §7.6).
   *
   * The figure lays a scene out with the `@sentropic/diagram-canvas`
   * row-pack engine and draws it at emitted geometry with `DiagramCard` /
   * `DiagramZone`. It keeps no packer of its own.
   *
   * Camera (Z-1–Z-8). Readout 100 % is the maximum display scale (token
   * `diagramScene.maxDisplayScale`), never zoom 1: no input — buttons,
   * keys, Ctrl + wheel, pinch, `setZoom` — goes above it. The fit frames
   * the scene bounds plus the placed label boxes on both axes inside the
   * fit box `viewW × min(viewW × 9/16, 0.85 × windowH)`; it holds at the
   * readability floor (token `diagramScene.minReadableScale`), where the
   * viewport scrolls the overflowing axis from its start, and zoom-out
   * still reaches the whole drawing. The camera is never seeded from the
   * layout fit report. Zoom is a transform: it re-runs no layout.
   *
   * Folds. A fold toggle re-runs the whole layout, feeding the previous
   * orientation record back so a level keeps its orientation inside the
   * hysteresis band (O-4), reclamps the zoom into the new range, then
   * moves every box from its displayed to its new rectangle over the
   * `diagramScene.transitionDuration` token with the
   * `foundation.motion.easing` token. Under `prefers-reduced-motion:
   * reduce`, read at toggle time, the new geometry applies at once. A
   * toggle during a transition retargets from the displayed rectangles.
   *
   * The figure owns no model: the documents are props, and the fold state
   * is either controlled (`collapsed` + `onFoldChange`) or starts from
   * `defaultFolds` / the source view's fold groups.
   *
   * SSR-safe: `window`, `document` and the observers are read in effects
   * and handlers only; a server render draws the scene at its fit in a
   * nominal 16:9 box.
   */
  export interface DiagramSceneFigureLabels {
    navigator: string;
    step: string;
    scenario: string;
    count: string;
    node: string;
    previous: string;
    next: string;
    allScenarios: string;
    /** Accessible name of the camera control group. */
    controls: string;
    zoomIn: string;
    zoomOut: string;
    /** Visible text of the fit / reset control (« Ajuster »). */
    fit: string;
    /** Accessible name of the readout, e.g. « Zoom 85 % ». */
    zoomLevel: (percent: number) => string;
    /** Accessible name of the scrollable drawing region. */
    viewport: string;
    expand: (title: string) => string;
    collapse: (title: string) => string;
  }

  export interface DiagramSceneCamera {
    readonly zoom: number;
    /** `round(zoom / maxDisplayScale × 100)`. */
    readonly readout: number;
    readonly minZoom: number;
    readonly maxZoom: number;
    /** The zoom a fit or reset applies. */
    readonly fitZoom: number;
    readonly pans: boolean;
  }

  export interface DiagramSceneFigureProps {
    flows?: { fanOutMax?: number };
    scenario?: string | null;
    defaultScenario?: string;
    activeStep?: string | null;
    defaultActiveStep?: string;
    onStepChange?: (change: StepChange | null) => void;
    onScenarioChange?: (scenario: string | null) => void;
    onHighlightChange?: (target: EffectiveTarget | null) => void;
    document: SceneDocument;
    /** Retained source view (occurrences, fold groups). Optional: the engine synthesises one. */
    view?: SceneView;
    registry: LayoutOptions["registry"];
    bindings?: LayoutOptions["bindings"];
    presentation: ScenePresentation;
    /** Declaration order (`rootOrder`, `ordering[parent]`) and the other layout hints. */
    hints?: LayoutHints;
    /** Runtime token numbers for the engine (gaps, caps). */
    metrics?: Partial<LayoutMetrics>;
    rowPack?: RowPackOptions;
    /** L-R7 report width. The measured path never re-packs on it (D-3). */
    targetWidth?: number;
    /** Card text measurer, shared by the cards, the zones and the layout. */
    measure?: CardLineMeasure;
    /** Layout line measurer. Defaults to the bridge over `measure`. */
    measureLines?: LineMeasurer;
    /** Controlled fold state: collapsed occurrence ids. */
    collapsed?: readonly SceneOccurrenceRef[];
    /** Initial collapsed occurrence ids when `collapsed` is not controlled. */
    defaultFolds?: readonly SceneOccurrenceRef[];
    title?: string;
    /** Accessible name of the figure. Defaults to `title`. */
    label?: string;
    compact?: boolean;
    labels?: Partial<DiagramSceneFigureLabels>;
    resolveGlyph?: (name: string) => DiagramGlyphPaths | undefined;
    onFoldChange?: (
      collapsed: readonly SceneOccurrenceRef[],
      change: { occurrence: SceneOccurrenceRef; collapsed: boolean },
    ) => void;
    onSelect?: (event: { entityId: string }) => void;
    /** One call per layout pass, with the engine result (warnings, refusals, orientations). */
    onLayout?: (result: LayoutResult) => void;
    onCameraChange?: (camera: DiagramSceneCamera) => void;
    layoutCache?: SceneLayoutCache;
    contentSize?: DiagramSceneSize;
    onSizeChange?: (size: DiagramSceneSize) => void;
  }

  const DEFAULT_LABELS: DiagramSceneFigureLabels = {
    ...DEFAULT_FLOW_STRINGS,
    controls: "Zoom",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    fit: "Fit",
    zoomLevel: (percent) => `Zoom ${percent} %`,
    viewport: "Diagram",
    expand: (title) => `Expand ${title}`,
    collapse: (title) => `Collapse ${title}`,
  };

  const TOKEN_MAX_DISPLAY_SCALE = "--st-component-diagramScene-maxDisplayScale";
  const TOKEN_MIN_READABLE_SCALE = "--st-component-diagramScene-minReadableScale";
  const TOKEN_TRANSITION_DURATION = "--st-component-diagramScene-transitionDuration";
  const TOKEN_EASING = "--st-foundation-motion-easing";
  const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

  let {
    document: semanticDocument,
    view,
    registry,
    bindings,
    presentation,
    hints,
    metrics,
    rowPack,
    targetWidth,
    measure = defaultCardMeasure,
    measureLines,
    collapsed,
    defaultFolds,
    title,
    label,
    compact = false,
    labels,
    resolveGlyph,
    onFoldChange,
    onSelect,
    onLayout,
    onCameraChange,
    layoutCache,
    contentSize = $bindable({ width: 0, height: 0 }),
    onSizeChange,
    flows,
    scenario,
    defaultScenario,
    activeStep,
    defaultActiveStep,
    onStepChange,
    onScenarioChange,
    onHighlightChange,
  }: DiagramSceneFigureProps = $props();

  const ownedCache = createLayoutCache();
  let publishedSize: DiagramSceneSize | undefined;

  const strings = $derived({ ...DEFAULT_LABELS, ...labels });
  const flowOptions = $derived({ ...flows, countTemplate: strings.count });
  let flowTokens = $state.raw<FlowTokens>(DEFAULT_FLOW_TOKENS);

  /* ── fold state and layout ─────────────────────────────────────── */

  let foldState = $state.raw<readonly SceneOccurrenceRef[]>(
    untrack(() => defaultFolds ?? collapsedOccurrencesOf(view)),
  );
  const collapsedNow = $derived(collapsed ?? foldState);
  const lineMeasurer = $derived<LineMeasurer>(measureLines ?? cardLineMeasurer(measure));

  // O-4: the orientation record last emitted, fed back to the next layout
  // call. Deliberately not reactive state: it is an input of the next pass,
  // never a reason to run one. A different document starts with no record.
  let previousOrientation: SceneOrientations | undefined;
  let orientationDocument: string | undefined;

  const layoutResult = $derived.by<LayoutResult>(() => {
    if (orientationDocument !== semanticDocument.documentId) {
      orientationDocument = semanticDocument.documentId;
      previousOrientation = undefined;
    }
    const result = layoutScene({
      cache: layoutCache ?? ownedCache,
      document: semanticDocument,
      ...(view === undefined ? {} : { view }),
      registry,
      flows: flowOptions,
      flowTokens,
      ...(bindings === undefined ? {} : { bindings }),
      presentation,
      measureLines: lineMeasurer,
      collapsed: collapsedNow,
      ...(hints === undefined ? {} : { hints }),
      ...(metrics === undefined ? {} : { metrics }),
      ...(rowPack === undefined ? {} : { rowPack }),
      ...(targetWidth === undefined ? {} : { targetWidth }),
      ...(previousOrientation === undefined ? {} : { previousOrientation }),
    });
    if (result.status === "laid-out" && result.orientations !== undefined) {
      previousOrientation = result.orientations;
    }
    return result;
  });

  const scene = $derived<SceneModel | undefined>(
    layoutResult.status === "laid-out"
      ? resolveScene(layoutResult, {
          document: semanticDocument,
          presentation,
          measureLines: lineMeasurer,
          flows: flowOptions,
          ...(metrics === undefined ? {} : { metrics }),
        })
      : undefined,
  );
  const sceneRects = $derived<ReadonlyMap<string, Rect>>(scene === undefined ? new Map() : rectsOf(scene));

  /* Logical flow state never participates in layout or scene resolution. */
  let flowLocal = $state.raw<FlowState>(untrack(() => ({ ...INITIAL_FLOW_STATE,
    selection: defaultActiveStep === undefined ? null : { kind: "step", relation: defaultActiveStep },
    ...(defaultScenario === undefined ? {} : { scenario: defaultScenario }),
  })));
  const flowState = $derived.by<FlowState>(() => {
    const { scenario: _localScenario, ...rest } = flowLocal;
    const filter = scenario === undefined ? flowLocal.scenario : scenario ?? undefined;
    return { ...rest,
      selection: activeStep === undefined ? flowLocal.selection : activeStep === null ? null : { kind: "step", relation: activeStep },
      ...(filter === undefined ? {} : { scenario: filter }),
    };
  });
  const flowHighlight = $derived(scene === undefined ? undefined : highlightOf(scene, flowState));
  const flowEffective = $derived(scene === undefined ? null : effectiveTarget(scene, flowState));
  const flowSteps = $derived(scene === undefined ? [] : stepsOf(scene));
  let flowAnnouncement = $state("");
  let pendingNavigation = $state<string>();
  let badgeCursor = $state<string>();
  let nodeCursor = $state<string>();
  const selectedVisible = $derived(scene === undefined ? null : visibleOf(scene, flowState.selection));
  const selectedBadge = $derived(scene?.badges.find((badge) => JSON.stringify(badge.target) === JSON.stringify(selectedVisible))?.id);
  const badgeTab = $derived(scene?.badges.some((b) => b.id === badgeCursor) ? badgeCursor : selectedBadge ?? scene?.badges[0]?.id);
  const nodeTab = $derived(scene?.nodeTargets.some((n) => n.occurrence === nodeCursor) ? nodeCursor : selectedVisible?.kind === "box" && scene?.nodeTargets.some((n) => n.occurrence === selectedVisible.occurrence) ? selectedVisible.occurrence : scene?.nodeTargets[0]?.occurrence);
  const stateOf = (id: string) => flowHighlight === undefined ? undefined : flowStateOf(flowHighlight, id);
  const descriptionId = (group: string, id: string) => `${hostId}-${group}-${encodeURIComponent(id)}`;
  const hostId = $props.id();
  const flowDescription = (target: Visible) => scene === undefined ? "" : describeTarget(scene, target, strings as FlowStrings);
  const boxTarget = (occurrence: string): Visible => ({ kind: "box", occurrence });
  function dispatchFlow(action: FlowAction): void {
    if (scene === undefined || flowSteps.length === 0) return;
    const before = flowEffective;
    const change = reduce(scene, flowState, action);
    let next = change.state;
    if (activeStep !== undefined && change.emit.includes("step")) next = { ...next, selection: flowState.selection };
    if (scenario !== undefined && change.emit.includes("scenario")) {
      const { scenario: _nextFilter, ...rest } = next;
      next = { ...rest, ...(flowState.scenario === undefined ? {} : { scenario: flowState.scenario }) };
    }
    flowLocal = next;
    if (change.emit.includes("step")) onStepChange?.(stepChange(scene, change.state.selection));
    if (change.emit.includes("scenario")) onScenarioChange?.(change.state.scenario ?? null);
    const displayed = effectiveTarget(scene, next);
    if (JSON.stringify(displayed) !== JSON.stringify(before)) onHighlightChange?.(displayed);
    if (["next", "previous", "first", "last"].includes(action.type) && change.emit.includes("step")) {
      if (activeStep === undefined) flowAnnouncement = announce(scene, next, strings);
      else pendingNavigation = change.state.selection?.kind === "step" ? change.state.selection.relation : undefined;
    } else if (change.emit.includes("step")) pendingNavigation = undefined;
    if (change.emit.includes("step") && activeStep === undefined) {
      badgeCursor = undefined; nodeCursor = undefined;

    }
  }
  $effect(() => {
    if (scene !== undefined && pendingNavigation !== undefined && flowState.selection?.kind === "step" && flowState.selection.relation === pendingNavigation) {
      flowAnnouncement = announce(scene, flowState, strings);
      pendingNavigation = undefined;
    }
  });
  function scrollFlowSelection(): void {
    if (scene === undefined || viewportEl === undefined) return;
    const target = visibleOf(scene, flowState.selection);
    const occurrence = target?.kind === "bundle" ? scene.edges.find((e) => e.bundle?.id === target.id)?.occurrence : target?.occurrence;
    const points = scene.edges.find((edge) => edge.occurrence === occurrence)?.points;
    const routeBox = points === undefined || points.length === 0 ? undefined : { x: Math.min(...points.map((p) => p.x)), y: Math.min(...points.map((p) => p.y)), width: Math.max(...points.map((p) => p.x)) - Math.min(...points.map((p) => p.x)), height: Math.max(...points.map((p) => p.y)) - Math.min(...points.map((p) => p.y)) };
    const box = scene.badges.find((b) => b.occurrence === occurrence)?.box ?? scene.nodes.find((n) => n.occurrence === occurrence)?.rect ?? routeBox;
    if (box === undefined) return;
    const left = box.x * zoom + placement.translateX, top = box.y * zoom + placement.translateY;
    if (left < viewportEl.scrollLeft) viewportEl.scrollLeft = left;
    else if (left + box.width * zoom > viewportEl.scrollLeft + viewportEl.clientWidth) viewportEl.scrollLeft = left + box.width * zoom - viewportEl.clientWidth;
    if (top < viewportEl.scrollTop) viewportEl.scrollTop = top;
    else if (top + box.height * zoom > viewportEl.scrollTop + viewportEl.clientHeight) viewportEl.scrollTop = top + box.height * zoom - viewportEl.clientHeight;
  }
  function targetAt(element: EventTarget | null): Visible | null {
    if (!(element instanceof Element) || scene === undefined) return null;
    const target = element.closest<HTMLElement>("[data-flow-badge],[data-flow-node],[data-flow-hit],[data-scene-occurrence]");
    if (target === null) return null;
    const badge = target.dataset["flowBadge"];
    if (badge !== undefined) return scene.badges.find((b) => b.id === badge)?.target ?? null;
    const edge = scene.edges.find((e) => e.occurrence === target.dataset["flowHit"]);
    if (edge !== undefined) return edge.bundle === undefined ? { kind: "edge", occurrence: edge.occurrence } : { kind: "bundle", id: edge.bundle.id };
    const node = target.dataset["flowNode"] ?? target.dataset["sceneOccurrence"];
    return node !== undefined && scene.nodeTargets.some((n) => n.occurrence === node) ? boxTarget(node) : null;
  }
  function flowPointer(event: PointerEvent, leaving: boolean): void {
    dispatchFlow({ type: "hover", target: targetAt(leaving ? event.relatedTarget : event.target) });
  }
  function flowFocus(event: FocusEvent, leaving: boolean): void {
    dispatchFlow({ type: "focus", target: targetAt(leaving ? event.relatedTarget : event.target) });
  }
  function flowClick(event: MouseEvent): void {
    if (suppressFlowClick) { suppressFlowClick = false; return; }
    const element = event.target as Element;
    if (element.closest("button[aria-expanded],input,select,textarea,a,[contenteditable=true]")) return;
    const target = targetAt(event.target);
    if (target !== null) {
      // Cards/zones dispatch through their existing onSelect callback below.
      if (element.closest("[data-flow-badge],[data-flow-node],[data-flow-hit]")) dispatchFlow({ type: "activate", target });
    } else if (!element.closest("button")) dispatchFlow({ type: "escape" });
  }
  function flowClickCapture(event: MouseEvent): void {
    if (flowSteps.length === 0) return;
    if (event.detail === 0) suppressFlowClick = false;
    if (suppressFlowClick) { suppressFlowClick = false; event.stopPropagation(); event.preventDefault(); return; }
    const toggle = (event.target as Element).closest("button[aria-expanded]");
    const occurrence = toggle?.closest<HTMLElement>("[data-scene-occurrence]")?.dataset["sceneOccurrence"];
    const node = scene?.nodes.find((entry) => entry.occurrence === occurrence);
    if (node !== undefined) { event.stopPropagation(); toggleFold(node); }
  }
  function selectNode(node: SceneNodeModel, event: { entityId: string }): void {
    if (suppressFlowClick) { suppressFlowClick = false; return; }
    dispatchFlow({ type: "activate", target: boxTarget(node.occurrence) });
    onSelect?.(event);
  }
  function roveFlow(event: KeyboardEvent): boolean {
    const target = event.target as HTMLElement;
    const group = target.dataset["flowBadge"] !== undefined ? "flowBadge" : target.dataset["flowNode"] !== undefined ? "flowNode" : undefined;
    if (group === undefined || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return false;
    const candidates = [...(viewportEl?.querySelectorAll<HTMLElement>(group === "flowBadge" ? "[data-flow-badge]" : "[data-flow-node]") ?? [])];
    const current = candidates.indexOf(target);
    const index = event.key === "Home" ? 0 : event.key === "End" ? candidates.length - 1 : Math.max(0, Math.min(candidates.length - 1, current + (["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1)));
    const next = candidates[index];
    if (next !== undefined) { if (group === "flowBadge") badgeCursor = next.dataset[group]; else nodeCursor = next.dataset[group]; next.focus(); }
    event.preventDefault(); return true;
  }
  let scrollIdentity: string | undefined;
  $effect(() => {
    const identity = JSON.stringify([flowState.selection,selectedVisible]);
    if (scrollIdentity !== undefined && scrollIdentity !== identity) {
      badgeCursor = undefined; nodeCursor = undefined;
      void tick().then(scrollFlowSelection);
    }
    scrollIdentity = identity;
  });
  let previousFlowScene: SceneModel | undefined;
  let removedSelection: string | undefined;
  $effect.pre(() => {
    const current = scene;
    untrack(() => {
      if (current === undefined) return;
      if (previousFlowScene !== undefined && previousFlowScene !== current) {
        const focused = viewportEl?.ownerDocument.activeElement as HTMLElement | null;
        const group = focused?.hasAttribute("data-flow-badge") ? "[data-flow-badge]" : focused?.hasAttribute("data-flow-node") ? "[data-flow-node]" : undefined;
        if (group !== undefined) void tick().then(() => { if (focused !== null && !focused.isConnected) (viewportEl?.querySelector<HTMLElement>(`${group}[tabindex="0"]`) ?? viewportEl)?.focus({ preventScroll: true }); });
        const before = flowState;
        const repaired = reduce(current, before, { type: "repair" });
        flowLocal = { ...repaired.state, selection: activeStep === undefined ? repaired.state.selection : before.selection };
        if (before.selection?.kind === "step" && repaired.state.selection === null && removedSelection !== before.selection.relation) {
          removedSelection = before.selection.relation;
          if (activeStep === undefined) flowLocal = repaired.state;
          onStepChange?.(null);
        } else if (repaired.state.selection !== null) removedSelection = undefined;
      }
      previousFlowScene = current;
    });
  });

  $effect(() => {
    const result = layoutResult;
    untrack(() => onLayout?.(result));
  });

  $effect(() => {
    const size = sceneContentSize(layoutResult);
    if (publishedSize?.width === size.width && publishedSize?.height === size.height) return;
    publishedSize = size;
    contentSize = size;
    untrack(() => onSizeChange?.(size));
  });

  /* ── measured frame and tokens (client only) ───────────────────── */

  let frameEl = $state<HTMLElement>();
  let viewportEl = $state<HTMLElement>();
  $effect(() => {
    const filter = flowState.scenario;
    if (scenario !== undefined) {
      const select = frameEl?.parentElement?.querySelector<HTMLSelectElement>(".st-diagramSceneFigure-flowNavigator select");
      if (select !== undefined && select !== null) select.value = filter === undefined ? "all" : `scenario:${filter}`;
    }
  });
  let viewWidth = $state<number>();
  let windowHeight = $state<number>();
  let maxDisplayScale = $state<number>();
  let minReadableScale = $state<number>();

  function tokenValue(name: string): string | undefined {
    if (frameEl === undefined) return undefined;
    const value = getComputedStyle(frameEl).getPropertyValue(name).trim();
    return value === "" ? undefined : value;
  }

  // The camera sits at the fit until an input moves it; a resize keeps a
  // camera that is still at the fit on the fit, and reclamps any other.
  let requestedZoom = $state<number>();
  let atFit = true;

  // m3: camera tokens are re-read on every measure and before every camera
  // input, so a post-mount theme change applies without waiting for a resize.
  function readCameraTokens(): void {
    const nextTokens = { ...DEFAULT_FLOW_TOKENS };
    for (const name of Object.keys(nextTokens) as (keyof FlowTokens)[]) {
      const value = tokenValue(`--st-component-diagramScene-${name}`);
      if (name === "flowArrowPath") { if (value?.trim()) nextTokens.flowArrowPath = value.trim(); }
      else { const number = parseScale(value); if (number !== undefined) (nextTokens as unknown as Record<string, number>)[name] = number; }
    }
    if (JSON.stringify(nextTokens) !== JSON.stringify(flowTokens)) flowTokens = nextTokens;
    maxDisplayScale = parseScale(tokenValue(TOKEN_MAX_DISPLAY_SCALE));
    minReadableScale = parseScale(tokenValue(TOKEN_MIN_READABLE_SCALE));
  }

  function measureFrame(): void {
    if (frameEl === undefined) return;
    // m6: the fit width is the viewport narrowed by its scrollbar, not the
    // frame wrapper.
    const viewportWidth = viewportEl?.clientWidth ?? 0;
    const width = viewportWidth > 0 ? viewportWidth : frameEl.clientWidth;
    viewWidth = width > 0 ? width : undefined;
    windowHeight = window.innerHeight > 0 ? window.innerHeight : undefined;
    readCameraTokens();
    if (atFit) requestedZoom = undefined;
  }

  $effect(() => {
    const element = frameEl;
    if (element === undefined) return;
    untrack(measureFrame);
    const onResize = (): void => measureFrame();
    window.addEventListener("resize", onResize);
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(onResize);
    observer?.observe(element);
    return () => {
      window.removeEventListener("resize", onResize);
      observer?.disconnect();
    };
  });

  /* ── camera (Z-1–Z-8) ──────────────────────────────────────────── */

  const measured = $derived(viewWidth !== undefined && windowHeight !== undefined);
  const fit = $derived(
    sceneFit({
      ...(scene?.bounds === undefined ? {} : { bounds: scene.bounds }),
      // Before the frame is measured (server render, hidden mount) the fit
      // box is the nominal 16:9 box of the layout target width.
      viewWidth: viewWidth ?? targetWidth ?? DEFAULT_SCENE_TARGET_WIDTH,
      windowHeight: windowHeight ?? Number.POSITIVE_INFINITY,
      ...(maxDisplayScale === undefined ? {} : { maxDisplayScale }),
      ...(minReadableScale === undefined ? {} : { minReadableScale }),
    }),
  );
  const zoom = $derived(resolveZoom(requestedZoom, fit));
  const readout = $derived(zoomReadout(zoom, fit.maxZoom));
  const placement = $derived(scenePlacement(scene?.bounds, zoom, fit));
  const canZoomIn = $derived(zoom < fit.maxZoom);
  const canZoomOut = $derived(zoom > fit.minZoom);

  // A new scene starts at its fit (Z-8).
  let cameraDocument: string | undefined;
  $effect.pre(() => {
    const id = semanticDocument.documentId;
    if (cameraDocument !== undefined && cameraDocument !== id) {
      atFit = true;
      requestedZoom = undefined;
    }
    cameraDocument = id;
  });

  // Z-7: once the frame is measured the camera holds a number, clamped to
  // the nearest bound of the current range; a zoom inside the range stays.
  $effect(() => {
    if (!measured) return;
    const current = zoom;
    const fitZoom = fit.zoom;
    untrack(() => {
      if (requestedZoom !== current) requestedZoom = current;
      if (current !== fitZoom) atFit = false;
    });
  });

  $effect(() => {
    const camera: DiagramSceneCamera = {
      zoom,
      readout,
      minZoom: fit.minZoom,
      maxZoom: fit.maxZoom,
      fitZoom: fit.zoom,
      pans: placement.overflowX || placement.overflowY,
    };
    untrack(() => onCameraChange?.(camera));
  });

  /** Z-1: any request lands inside the current range. The viewport centre is kept where scrolling allows. */
  export function setZoom(next: number): void {
    if (!Number.isFinite(next)) return;
    readCameraTokens();
    const before = zoom;
    const target = clampZoom(next, fit);
    atFit = target === fit.zoom;
    if (target === before) return;
    const element = viewportEl;
    const centre =
      element === undefined
        ? undefined
        : {
            x: (element.scrollLeft + element.clientWidth / 2 - placement.translateX) / before,
            y: (element.scrollTop + element.clientHeight / 2 - placement.translateY) / before,
          };
    requestedZoom = target;
    if (element === undefined || centre === undefined) return;
    void tick().then(() => {
      element.scrollLeft = centre.x * zoom + placement.translateX - element.clientWidth / 2;
      element.scrollTop = centre.y * zoom + placement.translateY - element.clientHeight / 2;
    });
  }

  export function zoomIn(): void {
    setZoom(zoom * ZOOM_STEP_RATIO);
  }

  export function zoomOut(): void {
    setZoom(zoom / ZOOM_STEP_RATIO);
  }

  /** Z-3/Z-4: fit and reset are one action. An overflowing axis scrolls from its start. */
  export function fitToFrame(): void {
    readCameraTokens();
    atFit = true;
    requestedZoom = fit.zoom;
    const element = viewportEl;
    if (element === undefined) return;
    void tick().then(() => {
      element.scrollLeft = 0;
      element.scrollTop = 0;
    });
  }

  export function getCamera(): DiagramSceneCamera {
    return {
      zoom,
      readout,
      minZoom: fit.minZoom,
      maxZoom: fit.maxZoom,
      fitZoom: fit.zoom,
      pans: placement.overflowX || placement.overflowY,
    };
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    // m5: shortcuts work from non-input descendants (card buttons, nodes);
    // only typing targets keep the keys.
    const target = event.target as HTMLElement | null;
    if (target !== null && target !== event.currentTarget) {
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable || target.closest("[contenteditable]")) return;
    }
    if (!event.shiftKey && roveFlow(event)) return;
    if (!event.shiftKey && flowSteps.length > 0 && ["]", "[", "Escape"].includes(event.key)) {
      dispatchFlow({ type: event.key === "]" ? "next" : event.key === "[" ? "previous" : "escape" }); event.preventDefault(); return;
    }
    if (event.key === "+" || event.key === "=") zoomIn();
    else if (event.key === "-" || event.key === "_") zoomOut();
    else if (event.key === "0") fitToFrame();
    else return;
    event.preventDefault();
  }

  // Ctrl + wheel (and the trackpad pinch browsers report as Ctrl + wheel)
  // zooms; a plain wheel scrolls. Registered non-passive so the page zoom
  // is not triggered as well.
  $effect(() => {
    const element = viewportEl;
    if (element === undefined) return;
    const onWheel = (event: WheelEvent): void => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      setZoom(zoom * Math.exp(-event.deltaY * WHEEL_ZOOM_RATE));
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  });

  // Two-finger pinch on a touch screen.
  const touches = new Map<number, { x: number; y: number }>();
  let pinch: { distance: number; zoom: number } | undefined;
  let touchOrigin: { x: number; y: number } | undefined;
  let suppressFlowClick = false;
  const touchDistance = (): number => {
    const [first, second] = [...touches.values()];
    return first === undefined || second === undefined ? 0 : Math.hypot(first.x - second.x, first.y - second.y);
  };
  function onPointerDown(event: PointerEvent): void {
    suppressFlowClick = false;
    if (event.pointerType !== "touch") return;
    touchOrigin = { x: event.clientX, y: event.clientY };
    touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
    pinch = touches.size === 2 ? { distance: touchDistance(), zoom } : undefined;
  }
  function onPointerMove(event: PointerEvent): void {
    if (!touches.has(event.pointerId)) return;
    if (touchOrigin !== undefined && (event.clientX !== touchOrigin.x || event.clientY !== touchOrigin.y)) suppressFlowClick = true;
    touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinch === undefined || pinch.distance <= 0) return;
    event.preventDefault();
    setZoom(pinch.zoom * (touchDistance() / pinch.distance));
  }
  function onPointerEnd(event: PointerEvent): void {
    touches.delete(event.pointerId);
    pinch = undefined;
  }

  /* ── fold transition (T-1–T-4) ─────────────────────────────────── */

  let origin = $state.raw<ReadonlyMap<string, Rect>>();
  let progress = $state(1);
  let easing: Easing = (value) => value;
  let duration = 0;
  let startedAt = 0;
  let frameHandle: number | undefined;
  // The rectangles on screen after the last render: the start of the next
  // transition, interpolated ones included (T-4).
  let shown: ReadonlyMap<string, Rect> | undefined;
  let shownDocument: string | undefined;

  const eased = $derived(origin === undefined ? 1 : easing(progress));
  const displayed = $derived(origin === undefined ? sceneRects : displayedRects(origin, sceneRects, eased));
  const animating = $derived(origin !== undefined);

  function stopFrames(): void {
    if (frameHandle !== undefined) cancelAnimationFrame(frameHandle);
    frameHandle = undefined;
  }

  function settle(): void {
    stopFrames();
    origin = undefined;
    progress = 1;
  }

  function step(): void {
    frameHandle = undefined;
    const elapsed = performance.now() - startedAt;
    if (elapsed >= duration) {
      settle();
      return;
    }
    progress = elapsed / duration;
    frameHandle = requestAnimationFrame(step);
  }

  // Runs before the DOM is patched with a new layout, so the first frame
  // of a transition already draws the displayed rectangles, never a jump.
  $effect.pre(() => {
    const next = sceneRects;
    const documentId = semanticDocument.documentId;
    untrack(() => {
      const from = shown;
      const sameScene = shownDocument === documentId;
      shownDocument = documentId;
      if (from === undefined || !sameScene || sameRects(from, next)) {
        settle();
        return;
      }
      // T-3: the reduced-motion preference is read at toggle time.
      const reduced = typeof window.matchMedia === "function" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
      duration = reduced ? 0 : parseDurationMs(tokenValue(TOKEN_TRANSITION_DURATION));
      if (duration <= 0) {
        settle();
        return;
      }
      // T-4: retarget from what is displayed; no queue of stale targets.
      stopFrames();
      easing = parseEasing(tokenValue(TOKEN_EASING));
      origin = from;
      progress = 0;
      startedAt = performance.now();
      frameHandle = requestAnimationFrame(step);
    });
  });

  $effect(() => {
    shown = displayed;
  });

  $effect(() => () => {
    stopFrames();
    touches.clear();
    pinch = undefined;
    ownedCache.dispose();
  });

  /* ── drawing ───────────────────────────────────────────────────── */

  const rectOf = (node: SceneNodeModel): Rect => displayed.get(node.occurrence) ?? node.rect;
  const entering = (node: SceneNodeModel): boolean => origin !== undefined && !origin.has(node.occurrence);

  function toggleFold(node: SceneNodeModel): void {
    const next = node.collapsed
      ? collapsedNow.filter((id) => id !== node.occurrence)
      : [...collapsedNow, node.occurrence];
    if (collapsed === undefined) foldState = next;
    onFoldChange?.(next, { occurrence: node.occurrence, collapsed: !node.collapsed });
    // The toggle button is re-created by the fold: give the focus back to it.
    const element = viewportEl;
    if (element === undefined) return;
    void tick().then(() => {
      for (const candidate of element.querySelectorAll<HTMLElement>("[data-scene-occurrence]")) {
        if (candidate.dataset["sceneOccurrence"] !== node.occurrence) continue;
        candidate.querySelector<HTMLElement>("button[aria-expanded]")?.focus({ preventScroll: true });
        return;
      }
    });
  }

  const cardPropsOf = (node: SceneNodeModel) => {
    const projected = projectCardProps(node.presentation, {
      entityId: node.entity,
      ...(resolveGlyph === undefined ? {} : { resolveGlyph }),
    });
    return projected.kind === "card" ? projected.props : undefined;
  };

  const zonePropsOf = (node: SceneNodeModel, rect: Rect) => {
    const zoneTitle = node.presentation?.text.title ?? "";
    const projected = projectZoneProps(node.presentation, {
      entityId: node.entity,
      collapsed: node.collapsed,
      toggleLabel: node.collapsed ? strings.expand(zoneTitle) : strings.collapse(zoneTitle),
      ...(node.collapsed ? {} : { width: rect.width, height: rect.height }),
      ...(resolveGlyph === undefined ? {} : { resolveGlyph }),
    });
    return projected.kind === "zone" ? projected.props : undefined;
  };

  const erdTable = $derived(semanticDocument.profileRefs.includes("erd@1") ? renderErdTable(semanticDocument) : "");

  const pointsOf = (points: readonly { readonly x: number; readonly y: number }[]): string =>
    points.map((point) => `${point.x},${point.y}`).join(" ");

  const viewportStyle = $derived(
    `${measured ? `height:${fit.fitHeight}px` : `aspect-ratio:${FIT_ASPECT}`};--st-diagram-zoom:${zoom}${flowSteps.length > 0 ? `;--st-diagramSceneFigure-flowHit:${flowHitSize(zoom, flowTokens)}px` : ""}`,
  );
  const worldStyle = $derived(
    `transform:translate(${placement.translateX}px,${placement.translateY}px) scale(${zoom})`,
  );
</script>

<figure
  class="st-diagramSceneFigure{compact ? " st-diagramSceneFigure--compact" : ""}"
  aria-label={label ?? title}
  data-zoom={zoom}
  data-zoom-readout={readout}
  data-scene-refused={layoutResult.status === "refused" ? layoutResult.refusals[0]?.code : undefined}
>
  {#if title !== undefined}
    <figcaption class="st-diagramSceneFigure-title">{title}</figcaption>
  {/if}
  <div class="st-diagramSceneFigure-controls" role="group" aria-label={strings.controls}>
    <IconButton size="sm" variant="secondary" aria-label={strings.zoomOut} disabled={!canZoomOut} onclick={zoomOut}>
      <Minus size="var(--st-component-button-anatomy-density-sm-fontSize)" aria-hidden="true" />
    </IconButton>
    <output class="st-diagramSceneFigure-readout" aria-live="polite" aria-label={strings.zoomLevel(readout)}>
      {readout} %
    </output>
    <IconButton size="sm" variant="secondary" aria-label={strings.zoomIn} disabled={!canZoomIn} onclick={zoomIn}>
      <Plus size="var(--st-component-button-anatomy-density-sm-fontSize)" aria-hidden="true" />
    </IconButton>
    <Button size="sm" variant="secondary" onclick={fitToFrame}>{strings.fit}</Button>
  </div>
  {#if flowSteps.length > 0}
    <div class="st-diagramSceneFigure-flowNavigator" role="group" aria-label={strings.navigator}>
      <Button size="sm" variant="secondary" onclick={() => dispatchFlow({ type: "previous" })}>{strings.previous}</Button>
      <output aria-label={strings.step}>{scene === undefined ? "" : announce(scene, flowState, strings)}</output>
      <Button size="sm" variant="secondary" onclick={() => dispatchFlow({ type: "next" })}>{strings.next}</Button>
      {#if scene !== undefined && scene.flows.scenarios.length >= 2}
        <Select label={strings.scenario} value={flowState.scenario === undefined ? "all" : `scenario:${flowState.scenario}`} onchange={(event) => { const value = event.currentTarget.value; dispatchFlow(value === "all" ? { type: "scenario" } : { type: "scenario", id: value.slice("scenario:".length) }); if (scenario !== undefined) { const select = event.currentTarget; void tick().then(() => { select.value = flowState.scenario === undefined ? "all" : `scenario:${flowState.scenario}`; }); } }}>
          <option value="all">{strings.allScenarios}</option>
          {#each scene.flows.scenarios as entry (entry.id)}<option value={`scenario:${entry.id}`}>{entry.label || strings.scenario}</option>{/each}
        </Select>
      {/if}
      <output class="st-diagramSceneFigure-flowDescription" aria-live="polite">{flowAnnouncement}</output>
    </div>
  {/if}
  <div class="st-diagramSceneFigure-frame" bind:this={frameEl}>
    <!-- m5: a refused layout draws visible text, not only the data attribute. -->
    {#if layoutResult.status === "refused"}
      <p class="st-diagramSceneFigure-refused" role="alert">
        Diagram unavailable ({layoutResult.refusals[0]?.code ?? "refused"})
      </p>
    {/if}
    <!-- The scrollable drawing region is focusable so the keyboard reaches
         both the scroll (arrow keys) and the camera keys (+, −, 0). -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="st-diagramSceneFigure-viewport"
      bind:this={viewportEl}
      role="group"
      tabindex="0"
      aria-label={strings.viewport}
      aria-keyshortcuts={flowSteps.length > 0 ? "+ - 0 [ ] Escape" : "+ - 0"}
      aria-busy={animating}
      data-pans={placement.overflowX || placement.overflowY ? "true" : "false"}
      style={viewportStyle}
      onkeydown={onKeydown}
      onpointerdown={onPointerDown}
      onpointermove={onPointerMove}
      onpointerup={onPointerEnd}
      onpointercancel={onPointerEnd}
      onpointerover={(event) => flowPointer(event, false)}
      onpointerout={(event) => flowPointer(event, true)}
      onfocusin={(event) => flowFocus(event, false)}
      onfocusout={(event) => flowFocus(event, true)}
      onclick={flowClick}
      onclickcapture={flowClickCapture}
    >
      <div
        class="st-diagramSceneFigure-extent"
        style={`width:${placement.contentWidth}px;height:${placement.contentHeight}px`}
      >
        <div class="st-diagramSceneFigure-world" style={worldStyle} data-flow-active={flowHighlight !== undefined && (flowHighlight.primary.size > 0 || flowHighlight.dimmed.size > 0) ? "true" : undefined}>
          {#if scene !== undefined}
            <!-- m4: edges paint before nodes, labels last; edges and labels
                 fade in with the transition (T-1) while the boxes move. -->
            <svg
              class="st-diagramSceneFigure-edges"
              aria-hidden="true"
              style={animating ? `opacity:${eased}` : undefined}
            >
              {#each scene.edges as edge (edge.occurrence)}
                <polyline class="st-diagramSceneFigure-edge" data-scene-edge={edge.occurrence} data-flow-step={edge.flow?.relation} data-flow-bundle={edge.bundle?.id} data-flow-state={stateOf(edge.occurrence)} points={pointsOf(edge.points)} />
                {#if edge.directed}
                  <polyline class="st-diagramSceneFigure-flowHit" data-flow-hit={edge.occurrence} points={pointsOf(edge.points)} />
                  {#each edge.arrows as arrow, index (index)}
                    <path class="st-diagramSceneFigure-flowArrow" data-flow-arrow={edge.occurrence} data-flow-state={stateOf(edge.occurrence)} d={flowTokens.flowArrowPath} transform={`translate(${arrow.tip.x} ${arrow.tip.y}) rotate(${arrow.angle}) translate(${-flowTokens.flowArrowLength} ${-flowTokens.flowArrowWidth / 2})`} />
                  {/each}
                {/if}
              {/each}
              {#each scene.edges as edge (edge.occurrence)}
                {#if edge.markers}<g>{@html edge.markers}</g>{/if}
              {/each}
              {#each scene.labels as edgeLabel (edgeLabel.occurrence)}
                {#if edgeLabel.leader}<polyline class="st-diagramSceneFigure-edge" points={pointsOf(edgeLabel.leader)} />{/if}
              {/each}
            </svg>
            {#each scene.nodes as node (node.occurrence)}
              {@const rect = rectOf(node)}
              <div
                class="st-diagramSceneFigure-node"
                data-scene-occurrence={node.occurrence}
                data-scene-kind={node.kind}
                data-flow-state={stateOf(node.occurrence)}
                style={`left:${rect.x}px;top:${rect.y}px;width:${rect.width}px;height:${rect.height}px${entering(node) ? `;opacity:${eased}` : ""}`}
              >
                {#if node.kind === "erd" && node.erd}
                  <button class="st-diagramErd-toggle" type="button" aria-label={node.collapsed ? strings.expand(node.erd.title) : strings.collapse(node.erd.title)} aria-expanded={!node.collapsed} style={`--st-erd-header-height: ${node.erd.headerHeight}px`} onclick={() => toggleFold(node)}>{node.erd.title}</button>
                  <div class="st-diagramErd-svg">{@html renderErdCardSvg(node.erd)}</div>
                {:else if node.kind === "card"}
                  {@const cardProps = cardPropsOf(node)}
                  {#if cardProps !== undefined}
                    <DiagramCard {...cardProps} {measure} onSelect={(event) => selectNode(node, event)} />
                  {/if}
                {:else if node.kind === "zone"}
                  {@const zoneProps = zonePropsOf(node, rect)}
                  {#if zoneProps !== undefined}
                    <DiagramZone {...zoneProps} {measure} onSelect={(event) => selectNode(node, event)} onToggle={() => toggleFold(node)} />
                  {/if}
                {:else}
                  <div class="st-diagramSceneFigure-label" data-entity={node.entity}>{node.text}</div>
                {/if}
              </div>
            {/each}
            {#each scene.badges as badge (badge.id)}
              <button type="button" class="st-diagramSceneFigure-flowBadge" data-flow-badge={badge.id} data-flow-state={stateOf(badge.occurrence)} aria-pressed={JSON.stringify(selectedVisible) === JSON.stringify(badge.target)} aria-describedby={descriptionId("badge", badge.id)} tabindex={badgeTab === badge.id ? 0 : -1} style={`left:${badge.box.x}px;top:${badge.box.y}px;width:${badge.box.width}px;height:${badge.box.height}px`}>{badge.text}</button>
              <span class="st-diagramSceneFigure-flowDescription" id={descriptionId("badge", badge.id)}>{flowDescription(badge.target)}</span>
            {/each}
            {#each scene.nodeTargets as target (target.occurrence)}
              <button type="button" class="st-diagramSceneFigure-flowNode" data-flow-node={target.occurrence} data-flow-state={stateOf(target.occurrence)} aria-label={flowDescription(boxTarget(target.occurrence))} aria-pressed={selectedVisible?.kind === "box" && selectedVisible.occurrence === target.occurrence} aria-describedby={descriptionId("node", target.occurrence)} tabindex={nodeTab === target.occurrence ? 0 : -1} style={`left:${target.anchor.x}px;top:${target.anchor.y}px`}>{strings.node}</button>
              <span class="st-diagramSceneFigure-flowDescription" id={descriptionId("node", target.occurrence)}>{flowDescription(boxTarget(target.occurrence))}</span>
            {/each}
            {#each scene.labels as edgeLabel (edgeLabel.occurrence)}
              <div
                class="st-diagramSceneFigure-edgeLabel"
                data-scene-label={edgeLabel.occurrence}
                data-erd-label={edgeLabel.erd || undefined}
                style={`left:${edgeLabel.box.x}px;top:${edgeLabel.box.y}px;width:${edgeLabel.box.width}px;height:${edgeLabel.box.height}px${animating ? `;opacity:${eased}` : ""}`}
              >
                {#each edgeLabel.lines as line, lineIndex (lineIndex)}
                  <span>{line}</span>
                {/each}
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>
  {#if erdTable}<div class="st-diagramErd-fallback">{@html erdTable}</div>{/if}
</figure>

<style>
  .st-diagramSceneFigure-flowNavigator { display: flex; align-items: center; gap: var(--st-spacing-2); grid-column: 1 / -1; }
  .st-diagramSceneFigure-flowHit { fill: none; stroke: var(--st-component-diagramScene-flowHitStroke); stroke-width: var(--st-component-diagramScene-flowHitWidth); pointer-events: stroke; cursor: pointer; }
  .st-diagramSceneFigure-edge[data-flow-step] { stroke: var(--st-component-diagramScene-flowStroke); stroke-width: var(--st-component-diagramScene-flowStrokeWidth); }
  .st-diagramSceneFigure-flowArrow { fill: var(--st-component-diagramScene-flowStroke); }
  .st-diagramSceneFigure-flowBadge, .st-diagramSceneFigure-flowNode { position: absolute; box-sizing: border-box; color: var(--st-component-diagramScene-flowBadgeText); background: var(--st-component-diagramScene-flowBadgeBackground); border: var(--st-component-diagramScene-flowStrokeWidth) solid var(--st-component-diagramScene-flowBadgeBorder); border-radius: var(--st-component-diagramScene-flowBadgeRadius); font-family: var(--st-component-diagramCard-fontFamily); font-size: var(--st-component-diagramScene-flowBadgeFontSize); line-height: var(--st-component-diagramScene-flowBadgeLineHeight); padding: 0; cursor: pointer; }
  .st-diagramSceneFigure-flowBadge::before { content: ""; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); min-width: 100%; min-height: 100%; width: var(--st-diagramSceneFigure-flowHit); height: var(--st-diagramSceneFigure-flowHit); }
  .st-diagramSceneFigure-flowNode { opacity: var(--st-component-diagramScene-flowHiddenOpacity); pointer-events: none; min-width: var(--st-diagramSceneFigure-flowHit); min-height: var(--st-diagramSceneFigure-flowHit); }
  .st-diagramSceneFigure-flowNode:focus-visible { pointer-events: auto; }
  .st-diagramSceneFigure-flowDescription { position: absolute; clip-path: inset(50%); width: 0; height: 0; overflow: hidden; }
  [data-flow-active] [data-flow-state="dim"] { opacity: var(--st-component-diagramScene-flowDimOpacity); }
  .st-diagramSceneFigure-edge[data-flow-state="primary"] { stroke: var(--st-component-diagramScene-flowPrimaryStroke); stroke-width: var(--st-component-diagramScene-flowPrimaryStrokeWidth); }
  .st-diagramSceneFigure-edge[data-flow-state="related"] { stroke: var(--st-component-diagramScene-flowStroke); stroke-width: var(--st-component-diagramScene-flowRelatedStrokeWidth); }
  .st-diagramSceneFigure-flowArrow[data-flow-state="primary"] { fill: var(--st-component-diagramScene-flowPrimaryStroke); }
  .st-diagramSceneFigure-node[data-flow-state="primary"] { outline: var(--st-component-diagramScene-flowOutlineWidth) solid var(--st-component-diagramScene-flowPrimaryStroke); }
  .st-diagramSceneFigure-flowBadge[aria-pressed="true"] { color: var(--st-component-diagramScene-flowBadgeBackground); background: var(--st-component-diagramScene-flowPrimaryStroke); }
  .st-diagramSceneFigure-flowNode:not(:focus-visible) { opacity: var(--st-component-diagramScene-flowHiddenOpacity); }
  .st-diagramSceneFigure-flowBadge:focus-visible, .st-diagramSceneFigure-flowNode:focus-visible { opacity: var(--st-component-diagramScene-flowFullOpacity); outline: var(--st-component-diagramScene-flowOutlineWidth) solid var(--st-component-diagramScene-flowFocusOutline); }
  .st-diagramErd-toggle { position: absolute; inset: 0 0 auto; height: var(--st-erd-header-height); width: 100%; background: transparent; border: 0; color: transparent; cursor: pointer; }
  .st-diagramErd-svg { height: 100%; width: 100%; }

  .st-diagramSceneFigure-edgeLabel[data-erd-label] { background: var(--st-semantic-surface-default); }
  .st-diagramErd-fallback { grid-column: 1 / -1; overflow: auto; color: var(--st-semantic-text-primary); }
  .st-diagramErd-toggle:focus-visible { outline: var(--st-component-diagramErd-strokeWidth) solid var(--st-semantic-border-interactive); outline-offset: calc(-1 * var(--st-component-diagramErd-strokeWidth)); }
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
    gap: var(--st-spacing-1, 0.25rem);
    grid-column: 2;
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
    font-family: var(--st-component-diagramCard-fontFamily, inherit);
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
    stroke: var(--st-component-diagramCard-border, var(--st-semantic-border-strong));
    stroke-linejoin: round;
    stroke-width: var(--st-component-diagramZone-borderWidth, 1.5px);
    vector-effect: non-scaling-stroke;
  }
  .st-diagramSceneFigure-edgeLabel {
    align-items: center;
    color: var(--st-semantic-text-secondary);
    display: flex;
    flex-direction: column;
    font-family: var(--st-component-diagramCard-fontFamily, inherit);
    font-size: var(--st-component-diagramScene-edgeLabelFontSize, 18px);
    justify-content: center;
    line-height: var(--st-component-diagramScene-edgeLabelLineHeight, 22px);
    pointer-events: none;
    position: absolute;
    white-space: nowrap;
  }
</style>
