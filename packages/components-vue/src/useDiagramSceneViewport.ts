import { computed, nextTick, onMounted, onUnmounted, shallowRef, watch } from 'vue';
import { clampZoom, FIT_ASPECT, isR7ConnectorPresentation, zoomReadout, type Rect } from '@sentropic/diagram-canvas';
import { sceneCardMeasure, cardLineMeasurer, defaultCardMeasure, type CardLineMeasure } from './diagramCardModel.js';
import { DEFAULT_EDGE_LABEL_SIZE, DEFAULT_SCENE_TARGET_WIDTH, parseCssLengthPx, parseScale, resolveEdgeLabelSizeToken, resolveZoom, scaleEdgeLabelMeasurer, sceneFit, scenePlacement, WHEEL_ZOOM_RATE, ZOOM_STEP_RATIO, type SceneModel } from './diagramSceneModel.js';
import { measureRenderedBounds, shouldRefitRenderedBounds } from './diagramRenderedBounds.js';
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

    const frameEl = shallowRef<HTMLElement>();
    const viewportEl = shallowRef<HTMLElement>();
    const viewWidth = shallowRef<number>();
    const windowHeight = shallowRef<number>();
    const scrollbarHeight = shallowRef(0);
    const maxDisplayScale = shallowRef<number>();
    const minReadableScale = shallowRef<number>();
    const requestedZoom = shallowRef<number>();
    let atFit = true;
    const renderedBounds = shallowRef<{ scene: SceneModel; bounds: Rect }>();
    const cameraBounds = computed(() => renderedBounds.value?.scene === scene.value ? renderedBounds.value?.bounds : scene.value?.bounds);
    // `zoom` is the scale the world is painted at: the fit is quantised once,
    // in `sceneFit`, and printed as it is, so painted rects divide back by it.
    // The first read of a scene fits; a later one refits only when it differs
    // from that read by more than the measurement granularity. A read that
    // comes back as the model bounds is a read like any other: it replaces an
    // earlier, larger one, and the next one is compared to it.
    // A fold transition paints interpolated rectangles and fading layers: no
    // read happens while it runs, one happens when it settles.
    const animating = () => transition?.animating() ?? false;
    function readRenderedBounds() {
        if (frameEl.value === undefined || scene.value === undefined || animating()) return;
        const bounds = measureRenderedBounds(frameEl.value, scene.value.bounds, zoom.value);
        const previous = renderedBounds.value?.scene === scene.value ? renderedBounds.value.bounds : undefined;
        if (bounds === undefined || !shouldRefitRenderedBounds(previous, bounds)) return;
        if (atFit) requestedZoom.value = undefined;
        renderedBounds.value = { scene: scene.value, bounds };
    }
    onMounted(() => { watch([scene, animating], () => readRenderedBounds(), { immediate: true, flush: 'post' }); });
    function token(name: string) {
        return frameEl.value === undefined ? undefined : getComputedStyle(frameEl.value).getPropertyValue(name).trim();
    }
    function lengthToken(name: string): number | undefined {
        if (frameEl.value === undefined) return undefined;
        const raw = token(name);
        if (raw === undefined || raw === '') return undefined;
        const docEl = frameEl.value.ownerDocument?.documentElement;
        const rootFontSize = docEl ? parseFloat(getComputedStyle(docEl).fontSize) : Number.NaN;
        const elementFontSize = parseFloat(getComputedStyle(frameEl.value).fontSize);
        return parseCssLengthPx(raw, {
            ...(Number.isFinite(rootFontSize) && rootFontSize > 0 ? { rootFontSize } : {}),
            ...(Number.isFinite(elementFontSize) && elementFontSize > 0 ? { elementFontSize } : {}),
        });
    }
    const r7Mode = computed(() => isR7ConnectorPresentation(props.presentation, props.view, props.document));
    function readCameraTokens() {
        const values: Record<string, number> = {};
        const baseKeys = ["gapMin","gapMinBlock","gapBase","gapBaseBlock","trackSpacing","trackSpacingBlock","labelBand","gapMax","bundleLabelMaxWidth","containerPadding"];
        const r7Keys = ["zoneGutter","routeSpacing","routeBorderClearance","edgeCornerRadius","linkStrokeWidth","linkEmphasisStrokeWidth"];
        for (const key of r7Mode.value ? [...baseKeys, ...r7Keys] : baseKeys) {
            const value = lengthToken('--st-component-diagramScene-' + key);
            if (value !== undefined && Number.isFinite(value)) values[key] = value;
        }
        const edgeLabelSize = resolveEdgeLabelSizeToken(
            lengthToken('--st-component-diagramScene-edgeLabelSize'),
            lengthToken('--st-component-diagramScene-edgeLabelFontSize'),
        );
        if (edgeLabelSize !== undefined) values.edgeLabelSize = edgeLabelSize;
        const labelMargin = lengthToken('--st-component-diagramScene-labelPadding');
        if (labelMargin !== undefined && Number.isFinite(labelMargin)) values.labelMargin = labelMargin;
        if (JSON.stringify(values) !== JSON.stringify(tokenMetrics.value)) {
            onTokenMetricsChange?.();
            tokenMetrics.value = values;
        }
        readExtraTokens?.(token);
        maxDisplayScale.value = parseScale(token('--st-component-diagramScene-maxDisplayScale'));
        minReadableScale.value = parseScale(token('--st-component-diagramScene-minReadableScale'));
    }
    function measureFrame() {
        if (frameEl.value === undefined)
            return;
        const width = viewportEl.value?.clientWidth || frameEl.value.clientWidth;
        viewWidth.value = width > 0 ? width : undefined;
        scrollbarHeight.value = viewportEl.value === undefined ? 0 : viewportEl.value.offsetHeight - viewportEl.value.clientHeight;
        windowHeight.value = window.innerHeight > 0 ? window.innerHeight : undefined;
        readCameraTokens();
        if (atFit)
            requestedZoom.value = undefined;
    }
    const measured = computed(() => viewWidth.value !== undefined && windowHeight.value !== undefined);
    const fit = computed(() => sceneFit({
        ...(cameraBounds.value === undefined ? {} : { bounds: cameraBounds.value }),
        viewWidth: viewWidth.value ?? props.targetWidth ?? DEFAULT_SCENE_TARGET_WIDTH,
        windowHeight: windowHeight.value ?? Number.POSITIVE_INFINITY,
        scrollbarHeight: scrollbarHeight.value,
        ...(maxDisplayScale.value === undefined ? {} : { maxDisplayScale: maxDisplayScale.value }),
        ...(minReadableScale.value === undefined ? {} : { minReadableScale: minReadableScale.value }),
        ...(props.fitToWindow ? { fitToWindow: true } : {}),
    }));
    const zoom = computed(() => resolveZoom(requestedZoom.value, fit.value));
    const readout = computed(() => zoomReadout(zoom.value, fit.value.maxZoom));
    const placement = computed(() => scenePlacement(cameraBounds.value, zoom.value, fit.value));
    const camera = computed<DiagramSceneCamera>(() => ({
        zoom: zoom.value, readout: readout.value, minZoom: fit.value.minZoom,
        maxZoom: fit.value.maxZoom, fitZoom: fit.value.zoom,
        pans: placement.value.overflowX || placement.value.overflowY,
    }));
    watch(() => props.document.documentId, () => { atFit = true; requestedZoom.value = undefined; browserMeasure.value = undefined; renderedBounds.value = undefined; });
    onMounted(() => {
        watch([measured, zoom, fit], () => {
            if (!measured.value) return;
            if (!atFit) requestedZoom.value = zoom.value;
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
        // The DOM still shows the scene as it was before this call: a running
        // transition is ended here and read once its end state is patched in,
        // as is a scene the tokens read below have just replaced.
        const painted = animating() ? undefined : scene.value;
        if (animating()) transition?.settle();
        readCameraTokens();
        if (scene.value === painted) readRenderedBounds();
        atFit = true;
        requestedZoom.value = undefined;
        void nextTick(() => {
            if (viewportEl.value) {
                viewportEl.value.scrollLeft = 0;
                viewportEl.value.scrollTop = 0;
            }
        });
    }
    function getCamera() { return camera.value; }

    function refitOnFold() {
        atFit = true;
        requestedZoom.value = undefined;
        void nextTick(() => {
            if (viewportEl.value) {
                if (viewportEl.value.scrollLeft !== 0) viewportEl.value.scrollLeft = 0;
                if (viewportEl.value.scrollTop !== 0) viewportEl.value.scrollTop = 0;
            }
        });
    }
    function onWheel(event: WheelEvent) {
        if (!event.ctrlKey && !event.metaKey) return;
        event.preventDefault();
        setZoom(zoom.value * Math.exp(-event.deltaY * WHEEL_ZOOM_RATE));
    }
    let observer: ResizeObserver | undefined;
    let mountedViewport: HTMLElement | undefined;
    let fontsActive = true;
    onMounted(() => {
        measureFrame();
        window.addEventListener('resize', measureFrame);
        observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measureFrame);
        if (frameEl.value)
            observer?.observe(frameEl.value);
        if (viewportEl.value)
            observer?.observe(viewportEl.value);
        mountedViewport = viewportEl.value;
        mountedViewport?.addEventListener('wheel', onWheel, { passive: false });
        {
            watch([scene, () => props.measure, () => props.measureLines], ([current], _previous, cleanup) => {
                if ((props.measure !== undefined && props.measure !== defaultCardMeasure) || props.measureLines !== undefined) return;
                if (current === undefined || browserMeasure.value !== undefined) return;
                let active = true;
                cleanup(() => { active = false; });
                void document.fonts?.ready.then(() => {
                    if (active && fontsActive && frameEl.value !== undefined)
                        browserMeasure.value = measureRenderedSceneFont(frameEl.value, current, measure.value);
                });
            }, { immediate: true, flush: 'post' });
        }
    });
    onUnmounted(() => {
        fontsActive = false;
        observer?.disconnect();
        window.removeEventListener('resize', measureFrame);
        mountedViewport?.removeEventListener('wheel', onWheel);
        mountedViewport = undefined;
    });

    const edgeLabelLineHeight = computed(() => scaleEdgeLabelMeasurer(measureLines.value, effectiveMetrics.value.edgeLabelSize)({ text: 'Mg', role: 'edge-label', availableWidth: 400, allocatedLines: 1, folded: false }).height);
    const metricPaintVars = computed(() =>
        (props.metrics?.edgeLabelSize !== undefined ||
            (effectiveMetrics.value.edgeLabelSize !== undefined && effectiveMetrics.value.edgeLabelSize !== DEFAULT_EDGE_LABEL_SIZE)
            ? `;--st-diagram-edge-label-size:${effectiveMetrics.value.edgeLabelSize}px`
            : '') +
        (props.metrics?.linkStrokeWidth !== undefined ? `;--st-diagram-link-stroke-width:${props.metrics.linkStrokeWidth}px` : '') +
        (props.metrics?.linkEmphasisStrokeWidth !== undefined ? `;--st-diagram-link-emphasis-stroke-width:${props.metrics.linkEmphasisStrokeWidth}px` : ''),
    );
    const viewportStyle = computed(() => `height:${fit.value.fitHeight + scrollbarHeight.value}px;${props.fitToWindow ? 'max-height:calc(100vh - 24px);max-width:100%;margin-inline:auto;' : `aspect-ratio:${FIT_ASPECT};`}overflow-x:${placement.value.overflowX ? 'auto' : 'hidden'};overflow-y:${placement.value.overflowY ? 'auto' : 'hidden'};--st-diagram-zoom:${zoom.value};--st-diagram-label-line-height:${edgeLabelLineHeight.value}px${metricPaintVars.value}`);
    return { frameEl, viewportEl, measure, measureLines, effectiveMetrics, token,
        fit, zoom, readout, placement, viewportStyle, refitOnFold,
        setZoom, zoomIn, zoomOut, fitToFrame, getCamera };
}
