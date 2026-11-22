import { computed, nextTick, onMounted, onUnmounted, shallowRef, watch } from 'vue';
import { clampZoom, DEFAULT_MIN_READABLE_SCALE, FIT_ASPECT, isR7ConnectorPresentation, zoomReadout, type Rect } from '@sentropic/diagram-canvas';
import { sceneCardMeasure, cardLineMeasurer, defaultCardMeasure, type CardLineMeasure } from './diagramCardModel.js';
import { DEFAULT_EDGE_LABEL_SIZE, DEFAULT_SCENE_TARGET_WIDTH, parseCssLengthPx, parseScale, resolveEdgeLabelSizeToken, resolveZoom, scaleEdgeLabelMeasurer, sceneFit, scenePlacement, WHEEL_ZOOM_RATE, ZOOM_STEP_RATIO, type SceneModel } from './diagramSceneModel.js';
import { committedWorldScale, measureRenderedBounds, shouldRefitRenderedBounds } from './diagramRenderedBounds.js';
import { measureRenderedSceneFont } from './diagramFontMeasure.js';
import type { DiagramSceneFigureProps, DiagramSceneCamera } from './DiagramSceneFigure.types.js';

/** Shared client measurement and camera policy for both Vue scene hosts. */
export function useDiagramSceneViewport(
    props: Readonly<DiagramSceneFigureProps>, getScene: () => SceneModel | undefined,
    onCameraChange: (camera: DiagramSceneCamera) => void,
    readExtraTokens?: (token: (name: string) => string | undefined) => void,
    transition?: { animating: () => boolean; settle: () => void },
    onTokenMetricsChange?: () => void,
) {
    const scene = computed(getScene);
    const browserMeasure = shallowRef<CardLineMeasure>();
    const measure = computed(() => sceneCardMeasure((props.measure === defaultCardMeasure ? undefined : props.measure) ?? browserMeasure.value ?? defaultCardMeasure));
    const tokenMetrics = shallowRef<Record<string, number>>({});
    const effectiveMetrics = computed(() => ({ ...tokenMetrics.value, ...props.metrics }));
    const measureLines = computed(() => props.measureLines ?? cardLineMeasurer(measure.value));

    const figureEl = shallowRef<HTMLElement>();
    const controlsEl = shallowRef<HTMLElement>();
    const frameEl = shallowRef<HTMLElement>();
    const viewportEl = shallowRef<HTMLElement>();
    const frameWidth = shallowRef<number>();
    const viewWidth = shallowRef<number>();
    const windowHeight = shallowRef<number>();
    const measuredFrameHeight = shallowRef<number>();
    const controlsHeight = shallowRef(0);
    const scrollbarHeight = shallowRef(0);
    const maxDisplayScale = shallowRef<number>();
    const minReadableScale = shallowRef<number>();
    const requestedZoom = shallowRef<number>();
    const viewAll = shallowRef(false);
    const nativeFullscreen = shallowRef(false);
    const fallbackFullscreen = shallowRef(false);
    const fullscreen = computed(() => nativeFullscreen.value || fallbackFullscreen.value);
    const fullscreenMode = computed<'native' | 'fallback' | undefined>(() =>
        nativeFullscreen.value ? 'native' : fallbackFullscreen.value ? 'fallback' : undefined);
    let fittedFonts: Promise<FontFaceSet> | undefined;
    const renderedBounds = shallowRef<{ scene: SceneModel; bounds: Rect; scale: number }>();
    const cameraBounds = computed(() => renderedBounds.value?.scene === scene.value ? renderedBounds.value?.bounds : scene.value?.bounds);
    // `zoom` is the scale the world is painted at: the fit is quantised once,
    // in `sceneFit`, and printed as it is, so painted rects divide back by it.
    // The first read of a scene fits; a later one refits only when it differs
    // from that read by more than the measurement granularity at the minimum
    // scale of the two reads. A read that comes back as the model bounds is a
    // read like any other: it replaces an earlier, larger one, and the next one
    // is compared to it. A fold transition paints interpolated rectangles and
    // fading layers: no read happens while it runs, one happens when it settles.
    const animating = () => transition?.animating() ?? false;
    function readRenderedBounds() {
        if (frameEl.value === undefined || scene.value === undefined || animating()) return;
        const readScale = committedWorldScale(frameEl.value, zoom.value);
        const strokeFloor = Math.min(DEFAULT_MIN_READABLE_SCALE, fit.value.minZoom, readScale);
        const bounds = measureRenderedBounds(frameEl.value, scene.value.bounds, zoom.value, strokeFloor);
        const previous = renderedBounds.value?.scene === scene.value ? renderedBounds.value : undefined;
        const toleranceScale = previous === undefined ? readScale : Math.min(previous.scale, readScale);
        if (bounds === undefined || !shouldRefitRenderedBounds(previous?.bounds, bounds, toleranceScale)) return;
        renderedBounds.value = { scene: scene.value, bounds, scale: readScale };
    }
    onMounted(() => {
        watch([scene, animating], () => {
            const current = scene.value;
            if (current === undefined || animating()) return;
            void nextTick(() => {
                if (scene.value === current && !animating()) readRenderedBounds();
            });
        }, { immediate: true, flush: 'post' });
    });
    function token(name: string, style?: CSSStyleDeclaration) {
        return frameEl.value === undefined ? undefined : (style ?? getComputedStyle(frameEl.value)).getPropertyValue(name).trim();
    }
    function lengthToken(
        name: string,
        style?: CSSStyleDeclaration,
        context?: { readonly rootFontSize?: number; readonly elementFontSize?: number },
    ): number | undefined {
        if (frameEl.value === undefined) return undefined;
        const raw = token(name, style);
        if (raw === undefined || raw === '') return undefined;
        const resolvedContext = context ?? (() => {
            const docEl = frameEl.value!.ownerDocument?.documentElement;
            const rootFontSize = docEl ? parseFloat(getComputedStyle(docEl).fontSize) : Number.NaN;
            const elementFontSize = parseFloat((style ?? getComputedStyle(frameEl.value!)).fontSize);
            return { rootFontSize, elementFontSize };
        })();
        const parsed = parseCssLengthPx(raw, resolvedContext);
        if (parsed !== undefined || !/^(calc|min|max|clamp)\(/i.test(raw)) return parsed;
        const probe = frameEl.value.ownerDocument.createElement("span");
        probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none";
        probe.style.fontSize = raw;
        if (probe.style.fontSize === "") return undefined;
        frameEl.value.appendChild(probe);
        try {
          return parseCssLengthPx(getComputedStyle(probe).fontSize, resolvedContext);
        } finally {
          probe.remove();
        }
    }
    const r7Mode = computed(() => isR7ConnectorPresentation(props.presentation, props.view, props.document));
    function readCameraTokens() {
        const style = frameEl.value === undefined ? undefined : getComputedStyle(frameEl.value);
        const values: Record<string, number> = {};
        const baseKeys = ["gapMin","gapMinBlock","gapBase","gapBaseBlock","trackSpacing","trackSpacingBlock","labelBand","gapMax","bundleLabelMaxWidth","containerPadding"];
        const r7Keys = ["zoneGutter","routeSpacing","routeBorderClearance","edgeCornerRadius","linkStrokeWidth","linkRelatedStrokeWidth","linkEmphasisStrokeWidth"];
        for (const key of baseKeys) {
          const value = parseFloat(token("--st-component-diagramScene-" + key, style) ?? "");
          if (Number.isFinite(value)) values[key] = value;
        }
        const labelMargin = parseFloat(token("--st-component-diagramScene-labelPadding", style) ?? "");
        if (Number.isFinite(labelMargin)) values.labelMargin = labelMargin;
        if (r7Mode.value && frameEl.value !== undefined) {
          const docEl = frameEl.value.ownerDocument?.documentElement;
          const rootFontSize = docEl ? parseFloat(getComputedStyle(docEl).fontSize) : Number.NaN;
          const elementFontSize = parseFloat((style ?? getComputedStyle(frameEl.value)).fontSize);
          const lengthContext = { rootFontSize, elementFontSize };
          for (const key of r7Keys) {
            const value = lengthToken("--st-component-diagramScene-" + key, style, lengthContext);
            if (value !== undefined && Number.isFinite(value)) values[key] = value;
          }
          const edgeLabelSize = resolveEdgeLabelSizeToken(
            lengthToken("--st-component-diagramScene-edgeLabelSize", style, lengthContext),
            lengthToken("--st-component-diagramScene-edgeLabelFontSize", style, lengthContext),
          );
          if (edgeLabelSize !== undefined) values.edgeLabelSize = edgeLabelSize;
        }

        if (JSON.stringify(values) !== JSON.stringify(tokenMetrics.value)) {
            onTokenMetricsChange?.();
            tokenMetrics.value = values;
        }
        readExtraTokens?.((name) => token(name, style));
        maxDisplayScale.value = parseScale(token('--st-component-diagramScene-maxDisplayScale', style));
        minReadableScale.value = parseScale(token('--st-component-diagramScene-minReadableScale', style));
    }
    let previousFrameHeight: number | undefined;
    let previousViewportHeight = 0;

    function measureFrame(resize = false) {
        if (frameEl.value === undefined) return;
        const rawWidth = frameEl.value.clientWidth;
        const width = rawWidth > 0
            ? rawWidth
            : fullscreen.value && window.innerWidth > 0
                ? window.innerWidth
                : undefined;
        const frameHeight = frameEl.value.clientHeight;
        const viewportOuterHeight = viewportEl.value?.offsetHeight ?? 0;
        // The frame can grow with its viewport when a scrollbar appears.
        // Refit when the frame height changes independently of that growth.
        const frameHeightChanged = previousFrameHeight !== undefined
            && frameHeight !== previousFrameHeight
            && frameHeight - previousFrameHeight !== viewportOuterHeight - previousViewportHeight;
        previousFrameHeight = frameHeight;
        previousViewportHeight = viewportOuterHeight;
        const height = window.innerHeight > 0 ? window.innerHeight : undefined;
        const refit = resize || width !== frameWidth.value || frameHeightChanged || height !== windowHeight.value;
        frameWidth.value = width;
        measuredFrameHeight.value = frameHeight > 0 ? frameHeight : undefined;
        controlsHeight.value = controlsEl.value?.offsetHeight ?? 0;
        viewWidth.value = viewportEl.value?.clientWidth || width;
        scrollbarHeight.value = viewportOuterHeight - (viewportEl.value?.clientHeight ?? 0);
        windowHeight.value = height;
        readCameraTokens();
        if (refit) {
            resetToFit();
            void nextTick(readRenderedBounds);
        }
    }
    const measured = computed(() => frameWidth.value !== undefined && windowHeight.value !== undefined);
    const fullscreenViewHeight = computed(() => fullscreen.value
        ? (measuredFrameHeight.value !== undefined && measuredFrameHeight.value > 0
            ? measuredFrameHeight.value
            : windowHeight.value !== undefined
                ? Math.max(0, windowHeight.value - controlsHeight.value)
                : undefined)
        : undefined);
    const sceneFitInput = computed(() => ({
        viewWidth: frameWidth.value ?? props.targetWidth ?? DEFAULT_SCENE_TARGET_WIDTH,
        windowHeight: windowHeight.value ?? Number.POSITIVE_INFINITY,
        ...(fullscreenViewHeight.value === undefined ? {} : { viewHeight: fullscreenViewHeight.value }),
        ...(viewAll.value ? { unconstrained: true } : {}),
        ...(maxDisplayScale.value === undefined ? {} : { maxDisplayScale: maxDisplayScale.value }),
        ...(minReadableScale.value === undefined ? {} : { minReadableScale: minReadableScale.value }),
        ...(props.fitToWindow ? { fitToWindow: true } : {}),
    }));
    const fitInput = computed(() => ({
        ...(cameraBounds.value === undefined ? {} : { bounds: cameraBounds.value }),
        ...sceneFitInput.value,
    }));
    // Try the full width before reserving space for any scrollbar.
    const frameFit = computed(() => sceneFit(fitInput.value));
    const fit = computed(() => frameFit.value.pans ? sceneFit({ ...fitInput.value,
        viewWidth: viewWidth.value ?? fitInput.value.viewWidth, scrollbarHeight: scrollbarHeight.value,
    }) : frameFit.value);
    const viewportHeight = computed(() => fit.value.fitHeight + (frameFit.value.pans ? scrollbarHeight.value : 0));
    const zoom = computed(() => resolveZoom(requestedZoom.value, fit.value));
    const readout = computed(() => zoomReadout(zoom.value, fit.value.maxZoom));
    const placement = computed(() => scenePlacement(cameraBounds.value, zoom.value, zoom.value > fit.value.zoom
        ? { fitWidth: viewWidth.value ?? fit.value.fitWidth, fitHeight: Math.max(0, viewportHeight.value - scrollbarHeight.value) }
        : fit.value));
    const camera = computed<DiagramSceneCamera>(() => ({
        zoom: zoom.value, readout: readout.value, minZoom: fit.value.minZoom,
        maxZoom: fit.value.maxZoom, fitZoom: fit.value.zoom,
        pans: placement.value.overflowX || placement.value.overflowY,
    }));
    watch(() => props.document.documentId, () => {
        viewAll.value = false;
        if (fullscreen.value) exitFullscreen();
        resetToFit();
        fittedFonts = undefined;
        browserMeasure.value = undefined;
        renderedBounds.value = undefined;
    });
    onMounted(() => {
        watch([measured, zoom, fit], () => {
            if (!measured.value) return;
            if (requestedZoom.value !== undefined) requestedZoom.value = zoom.value;
        });
        watch(camera, onCameraChange, { immediate: true });
        watch(r7Mode, () => readCameraTokens());
    });
    function setZoom(next: number) {
        if (!Number.isFinite(next))
            return;
        readCameraTokens();
        const before = zoom.value;
        const target = clampZoom(next, fit.value);
        if (target === before) {
            if (target === fit.value.zoom) requestedZoom.value = undefined;
            return;
        }
        const element = viewportEl.value;
        const centre = element === undefined ? undefined : {
            x: (element.scrollLeft + element.clientWidth / 2 - placement.value.translateX) / before,
            y: (element.scrollTop + element.clientHeight / 2 - placement.value.translateY) / before,
        };
        requestedZoom.value = target === fit.value.zoom ? undefined : target;
        if (element !== undefined && centre !== undefined)
            void nextTick(() => {
                element.scrollLeft = centre.x * zoom.value + placement.value.translateX - element.clientWidth / 2;
                element.scrollTop = centre.y * zoom.value + placement.value.translateY - element.clientHeight / 2;
            });
    }
    function zoomIn() { setZoom(zoom.value * ZOOM_STEP_RATIO); }
    function zoomOut() { setZoom(zoom.value / ZOOM_STEP_RATIO); }
    function fitToFrame() {
        // The DOM still shows the scene as it was before this call: a running
        // transition is ended here and read once its end state is patched in,
        // as is a scene the tokens read below have just replaced.
        const painted = animating() ? undefined : scene.value;
        if (animating()) transition?.settle();
        readCameraTokens();
        if (scene.value === painted) readRenderedBounds();
        resetToFit();
    }
    function enterFullscreen() {
        const target = figureEl.value;
        if (target === undefined) return;
        if (renderedBounds.value !== undefined && renderedBounds.value.scale < DEFAULT_MIN_READABLE_SCALE) renderedBounds.value = undefined;
        const doc = target.ownerDocument;
        const canNative = typeof target.requestFullscreen === 'function' && doc.fullscreenEnabled !== false;
        if (canNative) {
            try {
                const pending = target.requestFullscreen();
                if (pending !== undefined && typeof pending.then === 'function') {
                    void pending.then(
                        () => {
                            if (doc.fullscreenElement === target) {
                                nativeFullscreen.value = true;
                                fallbackFullscreen.value = false;
                            } else {
                                nativeFullscreen.value = false;
                                fallbackFullscreen.value = true;
                            }
                            void nextTick(() => measureFrame(true));
                        },
                        () => {
                            nativeFullscreen.value = false;
                            fallbackFullscreen.value = true;
                            void nextTick(() => measureFrame(true));
                        },
                    );
                    return;
                }
                if (doc.fullscreenElement === target) {
                    nativeFullscreen.value = true;
                    fallbackFullscreen.value = false;
                    void nextTick(() => measureFrame(true));
                    return;
                }
            } catch {
                // Fall back to fixed-position overlay below.
            }
        }
        nativeFullscreen.value = false;
        fallbackFullscreen.value = true;
        void nextTick(() => measureFrame(true));
    }
    function exitFullscreen() {
        const target = figureEl.value;
        const doc = target?.ownerDocument;
        const wasActive = nativeFullscreen.value || fallbackFullscreen.value;
        if (wasActive && renderedBounds.value !== undefined && renderedBounds.value.scale < DEFAULT_MIN_READABLE_SCALE) renderedBounds.value = undefined;
        fallbackFullscreen.value = false;
        if (doc !== undefined && doc.fullscreenElement === target && typeof doc.exitFullscreen === 'function') {
            try {
                const pending = doc.exitFullscreen();
                if (pending !== undefined && typeof pending.then === 'function') {
                    void pending.then(
                        () => {
                            nativeFullscreen.value = doc.fullscreenElement === target;
                            void nextTick(() => measureFrame(true));
                        },
                        () => {
                            nativeFullscreen.value = false;
                            void nextTick(() => measureFrame(true));
                        },
                    );
                    return;
                }
            } catch {
                // Clear local state below.
            }
        }
        nativeFullscreen.value = false;
        if (wasActive) void nextTick(() => measureFrame(true));
    }
    function toggleFullscreen() {
        readCameraTokens();
        if (renderedBounds.value !== undefined && renderedBounds.value.scale < DEFAULT_MIN_READABLE_SCALE) renderedBounds.value = undefined;
        if (fullscreen.value) exitFullscreen();
        else enterFullscreen();
    }
    function setViewAll(enabled: boolean) {
        const next = Boolean(enabled);
        if (next === viewAll.value) return;
        if (animating()) transition?.settle();
        readCameraTokens();
        const exitingFullscreen = !next && fullscreen.value;
        renderedBounds.value = undefined;
        viewAll.value = next;
        if (exitingFullscreen) exitFullscreen();
        resetToFit();
        if (!exitingFullscreen) {
            const targetScene = scene.value;
            void nextTick(() => {
                if (scene.value === targetScene && viewAll.value === next) readRenderedBounds();
            });
        }
    }
    function toggleViewAll() { setViewAll(!viewAll.value); }
    function onFigureKeydown(event: KeyboardEvent) {
        if (event.key !== 'Escape' || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
        if (fallbackFullscreen.value) {
            exitFullscreen();
            event.preventDefault();
            return;
        }
        if (viewAll.value && !fullscreen.value) {
            setViewAll(false);
            event.preventDefault();
        }
    }
    function getCamera() { return camera.value; }

    function resetToFit() {
        requestedZoom.value = undefined;
        const element = viewportEl.value;
        if (element === undefined) return;
        void nextTick(() => {
            element.scrollLeft = 0;
            element.scrollTop = 0;
        });
    }
    function refitForFonts() {
        const ready = document.fonts?.ready;
        const frame = frameEl.value;
        const current = scene.value;
        const useBrowserMeasure = props.measureLines === undefined && (props.measure === undefined || props.measure === defaultCardMeasure);
        if (frame === undefined || current === undefined) return;
        const fontsChanged = ready !== fittedFonts;
        if (!fontsChanged && (!useBrowserMeasure || browserMeasure.value !== undefined)) return;
        fittedFonts = ready;
        // A later scene can supply a card to measure within the same font load.
        if (useBrowserMeasure) {
            browserMeasure.value = measureRenderedSceneFont(frame, current, measure.value);
        }
        if (fontsChanged) resetToFit();
        else if (browserMeasure.value === undefined) return;
        void nextTick(readRenderedBounds);
    }
    function onWheel(event: WheelEvent) {
        if (!event.ctrlKey && !event.metaKey) return;
        event.preventDefault();
        setZoom(zoom.value * Math.exp(-event.deltaY * WHEEL_ZOOM_RATE));
    }
    let observer: ResizeObserver | undefined;
    let mountedViewport: HTMLElement | undefined;
    let mountedDocument: Document | undefined;
    let fonts: FontFaceSet | undefined;
    const onResize = () => measureFrame(true);
    const onFullscreenChange = () => {
        const target = figureEl.value;
        const active = target !== undefined && mountedDocument?.fullscreenElement === target;
        if (active !== nativeFullscreen.value) {
            if (renderedBounds.value !== undefined && renderedBounds.value.scale < DEFAULT_MIN_READABLE_SCALE) renderedBounds.value = undefined;
            nativeFullscreen.value = active;
            if (active) fallbackFullscreen.value = false;
            void nextTick(() => measureFrame(true));
        }
    };
    onMounted(() => {
        measureFrame();
        window.addEventListener('resize', onResize);
        mountedDocument = frameEl.value?.ownerDocument ?? document;
        mountedDocument.addEventListener('fullscreenchange', onFullscreenChange);
        observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(() => measureFrame());
        if (frameEl.value)
            observer?.observe(frameEl.value);
        if (viewportEl.value)
            observer?.observe(viewportEl.value);
        mountedViewport = viewportEl.value;
        mountedViewport?.addEventListener('wheel', onWheel, { passive: false });
        fonts = mountedDocument.fonts;
        fonts?.addEventListener?.('loadingdone', refitForFonts);
        watch(scene, (current, _previous, cleanup) => {
            if (current === undefined || browserMeasure.value !== undefined) return;
            let active = true;
            cleanup(() => { active = false; });
            void fonts?.ready.then(() => { if (active) refitForFonts(); });
        }, { immediate: true, flush: 'post' });
    });
    onUnmounted(() => {
        observer?.disconnect();
        window.removeEventListener('resize', onResize);
        mountedDocument?.removeEventListener('fullscreenchange', onFullscreenChange);
        if (figureEl.value !== undefined && mountedDocument?.fullscreenElement === figureEl.value && typeof mountedDocument.exitFullscreen === 'function') {
            try { void mountedDocument.exitFullscreen()?.catch?.(() => undefined); } catch { /* ignore */ }
        }
        mountedDocument = undefined;
        fonts?.removeEventListener?.('loadingdone', refitForFonts);
        mountedViewport?.removeEventListener('wheel', onWheel);
        mountedViewport = undefined;
    });

    const edgeLabelLineHeight = computed(() => scaleEdgeLabelMeasurer(measureLines.value, r7Mode.value ? effectiveMetrics.value.edgeLabelSize : undefined)({ text: 'Mg', role: 'edge-label', availableWidth: 400, allocatedLines: 1, folded: false }).height);
    const metricPaintVars = computed(() =>
        !r7Mode.value ? "" :
        (props.metrics?.edgeLabelSize !== undefined ||
            (effectiveMetrics.value.edgeLabelSize !== undefined && effectiveMetrics.value.edgeLabelSize !== DEFAULT_EDGE_LABEL_SIZE)
            ? `;--st-diagram-edge-label-size:${effectiveMetrics.value.edgeLabelSize}px`
            : '') +
        (props.metrics?.linkStrokeWidth !== undefined ? `;--st-diagram-link-stroke-width:${props.metrics.linkStrokeWidth}px` : '') +
        (props.metrics?.linkRelatedStrokeWidth !== undefined ? `;--st-diagram-link-related-stroke-width:${props.metrics.linkRelatedStrokeWidth}px` : "") +
        (props.metrics?.linkEmphasisStrokeWidth !== undefined ? `;--st-diagram-link-emphasis-stroke-width:${props.metrics.linkEmphasisStrokeWidth}px` : ''),
    );
    const overviewLabelPaintVars = computed(() => {
        const size = scene.value?.overviewEdgeLabelSize;
        if (size === undefined) return "";
        const lineHeight = edgeLabelLineHeight.value * size / (effectiveMetrics.value.edgeLabelSize ?? DEFAULT_EDGE_LABEL_SIZE);
        return `;--st-diagram-overview-edge-label-size:${size}px;--st-diagram-overview-edge-label-line-height:${lineHeight}px`;
    });
    const viewportStyle = computed(() => `height:${viewportHeight.value}px;${fullscreen.value ? '' : props.fitToWindow ? 'max-height:calc(100vh - 24px);max-width:100%;margin-inline:auto;' : `aspect-ratio:${FIT_ASPECT};`}overflow-x:${placement.value.overflowX ? 'auto' : 'hidden'};overflow-y:${placement.value.overflowY ? 'auto' : 'hidden'};--st-diagram-zoom:${zoom.value};--st-diagram-label-line-height:${edgeLabelLineHeight.value}px${metricPaintVars.value}${overviewLabelPaintVars.value}`);
    return { figureEl, controlsEl, frameEl, viewportEl, measure, measureLines, effectiveMetrics, r7Mode, token,
        fit, zoom, readout, placement, viewportStyle, sceneFitInput, resetToFit,
        viewAll, fullscreen, fallbackFullscreen, fullscreenMode,
        setZoom, zoomIn, zoomOut, fitToFrame, setViewAll, toggleViewAll, toggleFullscreen, exitFullscreen, onFigureKeydown, getCamera };
}
