<script lang="ts">
  import { getDiagramGlyph } from "./diagram-icons/registry.js";
  import { tick, untrack } from "svelte";
  import { Minus, Plus } from "@lucide/svelte";
  import {
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
  import { measureRenderedSceneFont } from "./diagramFontMeasure.js";
  import {
    cardLineMeasurer,
    sceneCardMeasure,
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
    iconBindings?: import("@sentropic/diagram-canvas/diagramSceneModel").SceneIconBindings;
    strictIcons?: boolean;
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
    resolveGlyph = getDiagramGlyph,
    iconBindings,
    strictIcons = true,
    onFoldChange,
    onSelect,
    onLayout,
    onCameraChange,
    layoutCache,
    contentSize = $bindable({ width: 0, height: 0 }),
    onSizeChange,
  }: DiagramSceneFigureProps = $props();

  const ownedCache = createLayoutCache();
  let publishedSize: DiagramSceneSize | undefined;

  const strings = $derived({ ...DEFAULT_LABELS, ...labels });

  /* ── fold state and layout ─────────────────────────────────────── */

  let foldState = $state.raw<readonly SceneOccurrenceRef[]>(
    untrack(() => defaultFolds ?? collapsedOccurrencesOf(view)),
  );
  const collapsedNow = $derived(collapsed ?? foldState);
  let browserMeasure = $state.raw<CardLineMeasure>();
  const effectiveMeasure = $derived(sceneCardMeasure(browserMeasure ?? measure));
  let tokenMetrics = $state.raw<Partial<LayoutMetrics>>({});
  const effectiveMetrics = $derived({ ...tokenMetrics, ...metrics });
  const lineMeasurer = $derived<LineMeasurer>(measureLines ?? cardLineMeasurer(effectiveMeasure));

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
      ...(bindings === undefined ? {} : { bindings }),
      presentation,
      ...(iconBindings === undefined ? {} : { iconBindings }),
      strictIcons,
      resolveGlyph: resolveGlyph as typeof getDiagramGlyph,
      measureLines: lineMeasurer,
      collapsed: collapsedNow,
      ...(hints === undefined ? {} : { hints }),
      metrics: effectiveMetrics,
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
          ...(view === undefined ? {} : { view }),
          presentation,
      ...(iconBindings === undefined ? {} : { iconBindings }),
      strictIcons,
      resolveGlyph,
          measureLines: lineMeasurer,
          metrics: effectiveMetrics,
        })
      : undefined,
  );
  const sceneRects = $derived<ReadonlyMap<string, Rect>>(scene === undefined ? new Map() : rectsOf(scene));

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
  let viewWidth = $state<number>();
  let windowHeight = $state<number>();
  let maxDisplayScale = $state<number>();
  let minReadableScale = $state<number>();

  $effect(() => {
    const element = frameEl;
    const current = scene;
    if (element === undefined || current === undefined || browserMeasure !== undefined
      || measureLines !== undefined || measure !== defaultCardMeasure) return;
    let active = true;
    void document.fonts?.ready.then(() => {
      if (!active) return;
      browserMeasure = measureRenderedSceneFont(element, current, measure);
    });
    return () => { active = false; };
  });

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
    const values: Record<string, number> = {};
    for (const key of ["gapMin","gapMinBlock","gapBase","gapBaseBlock","trackSpacing","trackSpacingBlock","labelBand","gapMax","bundleLabelMaxWidth"]) {
      const value = parseFloat(tokenValue('--st-component-diagramScene-' + key) ?? '');
      if (Number.isFinite(value)) values[key] = value;
    }
    if (JSON.stringify(values) !== JSON.stringify(tokenMetrics)) tokenMetrics = values;
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
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) return;
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
  const touchDistance = (): number => {
    const [first, second] = [...touches.values()];
    return first === undefined || second === undefined ? 0 : Math.hypot(first.x - second.x, first.y - second.y);
  };
  function onPointerDown(event: PointerEvent): void {
    if (event.pointerType !== "touch") return;
    touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
    pinch = touches.size === 2 ? { distance: touchDistance(), zoom } : undefined;
  }
  function onPointerMove(event: PointerEvent): void {
    if (!touches.has(event.pointerId)) return;
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
    return projected.kind === "card" ? { ...projected.props, autoSize: true, height: node.rect.height } : undefined;
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
    return projected.kind === "zone" ? { ...projected.props, autoSize: true, height: rect.height } : undefined;
  };

  const pointsOf = (points: readonly { readonly x: number; readonly y: number }[]): string =>
    points.map((point) => `${point.x},${point.y}`).join(" ");

  const viewportStyle = $derived(
    `${measured ? `height:${fit.fitHeight}px` : `aspect-ratio:${FIT_ASPECT}`};--st-diagram-zoom:${zoom}`,
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
      aria-keyshortcuts="+ - 0"
      aria-busy={animating}
      data-pans={placement.overflowX || placement.overflowY ? "true" : "false"}
      style={viewportStyle}
      onkeydown={onKeydown}
      onpointerdown={onPointerDown}
      onpointermove={onPointerMove}
      onpointerup={onPointerEnd}
      onpointercancel={onPointerEnd}
    >
      <div
        class="st-diagramSceneFigure-extent"
        style={`width:${placement.contentWidth}px;height:${placement.contentHeight}px`}
      >
        <div class="st-diagramSceneFigure-world" style={worldStyle}>
          {#if scene !== undefined}
            <!-- m4: edges paint before nodes, labels last; edges and labels
                 fade in with the transition (T-1) while the boxes move. -->
            <svg
              class="st-diagramSceneFigure-edges"
              aria-hidden="true"
              style={animating ? `opacity:${eased}` : undefined}
            >
              {#each scene.edges as edge (edge.occurrence)}
                <polyline class="st-diagramSceneFigure-edge" data-scene-edge={edge.occurrence} points={pointsOf(edge.points)} />
              {/each}
            </svg>
            {#each scene.nodes as node (node.occurrence)}
              {@const rect = rectOf(node)}
              <div
                class="st-diagramSceneFigure-node"
                data-scene-occurrence={node.occurrence}
                data-scene-kind={node.kind}
                style={`left:${rect.x}px;top:${rect.y}px;width:${rect.width}px;height:${rect.height}px${entering(node) ? `;opacity:${eased}` : ""}`}
              >
                {#if node.kind === "card"}
                  {@const cardProps = cardPropsOf(node)}
                  {#if cardProps !== undefined}
                    <DiagramCard {...cardProps} measure={effectiveMeasure} {onSelect} />
                  {/if}
                {:else if node.kind === "zone"}
                  {@const zoneProps = zonePropsOf(node, rect)}
                  {#if zoneProps !== undefined}
                    <DiagramZone {...zoneProps} measure={effectiveMeasure} {onSelect} onToggle={() => toggleFold(node)} />
                  {/if}
                {:else}
                  <div class="st-diagramSceneFigure-label" data-entity={node.entity}>{node.text}</div>
                {/if}
              </div>
            {/each}
            {#each scene.labels as edgeLabel (edgeLabel.occurrence)}
              <div
                class="st-diagramSceneFigure-edgeLabel"
                data-scene-label={edgeLabel.occurrence}
                title={edgeLabel.title}
                style={`left:${edgeLabel.box.x}px;top:${edgeLabel.box.y}px;width:${edgeLabel.box.width}px;height:${edgeLabel.box.height}px${animating ? `;opacity:${eased}` : ""}`}
              >
                {#if edgeLabel.bundle !== undefined}
                  <strong class="st-diagramSceneFigure-bundleHeader">{edgeLabel.bundle.header}</strong>
                  {#each edgeLabel.bundle.groups as group, index (index)}
                    <div class="st-diagramSceneFigure-bundleRelation" data-bundle-relation={index}>
                      <span aria-hidden="true">•</span><div>{#each group.lines as line}<span>{line}</span>{/each}</div>
                    </div>
                  {/each}
                {:else}
                  {#each edgeLabel.lines as line, lineIndex (lineIndex)}<span>{line}</span>{/each}
                {/if}
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>
</figure>

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
  .st-diagramSceneFigure-title {
    color: var(--st-semantic-text-primary);
    grid-column: 1;
    font-weight: 600;
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
    min-width: 4ch;
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
    box-shadow: inset 0 0 0 2px var(--st-component-iconButton-focusRing, var(--st-semantic-border-interactive));
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
    height: 1px;
    left: 0;
    overflow: visible;
    pointer-events: none;
    position: absolute;
    top: 0;
    width: 1px;
  }
  .st-diagramSceneFigure-edge {
    fill: none;
    stroke: var(--st-component-diagramScene-edgeStroke, var(--st-semantic-border-strong));
    stroke-linejoin: round;
    stroke-width: var(--st-component-diagramZone-borderWidth, 1.5px);
    vector-effect: non-scaling-stroke;
  }
  .st-diagramSceneFigure-edgeLabel {
    box-sizing: border-box;
    background: var(--st-component-diagramScene-labelSurface, var(--st-semantic-surface-raised));
    border: var(--st-component-diagramScene-labelBorderWidth, 1px) solid var(--st-component-diagramScene-labelBorder, var(--st-semantic-border-subtle));
    align-items: center;
    color: var(--st-component-diagramScene-labelText, var(--st-semantic-text-primary));
    display: flex;
    flex-direction: column;
    font-family: var(--st-component-diagramCard-fontFamily, var(--st-font-sans, Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif));
    font-size: var(--st-component-diagramScene-edgeLabelFontSize, 18px);
    justify-content: center;
    line-height: var(--st-component-diagramScene-edgeLabelLineHeight, 22px);
    pointer-events: none;
    position: absolute;
    white-space: nowrap;
  }
  .st-diagramSceneFigure-bundleHeader { display: block; padding: var(--st-component-diagramScene-labelPadding, 4px); font-weight: 400; }
  .st-diagramSceneFigure-bundleRelation { display: flex; align-self: stretch; gap: var(--st-component-diagramScene-bundleMarkerGap, 6px); padding: var(--st-component-diagramScene-labelPadding, 4px); border-top: var(--st-component-diagramScene-labelBorderWidth, 1px) solid var(--st-component-diagramScene-labelBorder, var(--st-semantic-border-subtle)); }
  .st-diagramSceneFigure-bundleRelation div { display: flex; flex-direction: column; }
</style>
