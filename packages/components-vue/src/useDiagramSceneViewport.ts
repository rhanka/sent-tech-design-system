import { computed, nextTick, onMounted, onUnmounted, shallowRef, watch } from 'vue';
import { clampZoom, FIT_ASPECT, zoomReadout, type Rect } from '@sentropic/diagram-canvas';
import { sceneCardMeasure, cardLineMeasurer, defaultCardMeasure, type CardLineMeasure } from './diagramCardModel.js';
import { DEFAULT_SCENE_TARGET_WIDTH, parseScale, resolveZoom, sceneFit, scenePlacement, WHEEL_ZOOM_RATE, ZOOM_STEP_RATIO, type SceneModel } from './diagramSceneModel.js';
import { measureRenderedBounds, shouldRefitRenderedBounds } from './diagramRenderedBounds.js';
import { measureRenderedSceneFont } from './diagramFontMeasure.js';
import type { DiagramSceneFigureProps, DiagramSceneCamera } from './DiagramSceneFigure.types.js';

/** Shared client measurement and camera policy for both Vue scene hosts. */
export function useDiagramSceneViewport(
    props: Readonly<DiagramSceneFigureProps>, getScene: () => SceneModel | undefined,
    onCameraChange: (camera: DiagramSceneCamera) => void,
    readExtraTokens?: (token: (name: string) => string | undefined) => void,
    transition?: { animating: () => boolean; settle: () => void },
) {
    const scene = computed(getScene);
    const browserMeasure = shallowRef<CardLineMeasure>();
    const measure = computed(() => sceneCardMeasure((props.measure === defaultCardMeasure ? undefined : props.measure) ?? browserMeasure.value ?? defaultCardMeasure));
    const tokenMetrics = shallowRef<Record<string, number>>({});
    const effectiveMetrics = computed(() => ({ ...tokenMetrics.value, ...props.metrics }));
    const measureLines = computed(() => props.measureLines ?? cardLineMeasurer(measure.value));

    const frameEl = shallowRef<HTMLElement>();
    const viewportEl = shallowRef<HTMLElement>();
    const frameWidth = shallowRef<number>();
    const viewWidth = shallowRef<number>();
    const windowHeight = shallowRef<number>();
    const scrollbarHeight = shallowRef(0);
    const maxDisplayScale = shallowRef<number>();
    const minReadableScale = shallowRef<number>();
    const requestedZoom = shallowRef<number>();
    let fittedFonts: Promise<FontFaceSet> | undefined;
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
        renderedBounds.value = { scene: scene.value, bounds };
    }
    onMounted(() => { watch([scene, animating], () => readRenderedBounds(), { immediate: true, flush: 'post' }); });
    function token(name: string) {
        return frameEl.value === undefined ? undefined : getComputedStyle(frameEl.value).getPropertyValue(name).trim();
    }
    function readCameraTokens() {
        const values: Record<string, number> = {};
        for (const key of ["gapMin","gapMinBlock","gapBase","gapBaseBlock","trackSpacing","trackSpacingBlock","labelBand","gapMax","bundleLabelMaxWidth","containerPadding"]) {
            const value = parseFloat(token('--st-component-diagramScene-' + key) ?? '');
            if (Number.isFinite(value)) values[key] = value;
        }
        const labelMargin = parseFloat(token('--st-component-diagramScene-labelPadding') ?? '');
        if (Number.isFinite(labelMargin)) values.labelMargin = labelMargin;
        if (JSON.stringify(values) !== JSON.stringify(tokenMetrics.value)) tokenMetrics.value = values;
        readExtraTokens?.(token);
        maxDisplayScale.value = parseScale(token('--st-component-diagramScene-maxDisplayScale'));
        minReadableScale.value = parseScale(token('--st-component-diagramScene-minReadableScale'));
    }
    function measureFrame(resize = false) {
        if (frameEl.value === undefined) return;
        const width = frameEl.value.clientWidth || undefined;
        // Zoom can resize the viewport through its scrollbars. Keep the
        // user zoom unless the frame width or the window actually resizes.
        const height = window.innerHeight > 0 ? window.innerHeight : undefined;
        const refit = resize || width !== frameWidth.value || height !== windowHeight.value;
        frameWidth.value = width;
        viewWidth.value = viewportEl.value?.clientWidth || width;
        scrollbarHeight.value = viewportEl.value === undefined ? 0 : viewportEl.value.offsetHeight - viewportEl.value.clientHeight;
        windowHeight.value = height;
        readCameraTokens();
        if (refit) {
            resetToFit();
            void nextTick(readRenderedBounds);
        }
    }
    const measured = computed(() => frameWidth.value !== undefined && windowHeight.value !== undefined);
    const fitInput = computed(() => ({
        ...(cameraBounds.value === undefined ? {} : { bounds: cameraBounds.value }),
        viewWidth: frameWidth.value ?? props.targetWidth ?? DEFAULT_SCENE_TARGET_WIDTH,
        windowHeight: windowHeight.value ?? Number.POSITIVE_INFINITY,
        ...(maxDisplayScale.value === undefined ? {} : { maxDisplayScale: maxDisplayScale.value }),
        ...(minReadableScale.value === undefined ? {} : { minReadableScale: minReadableScale.value }),
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
    let fonts: FontFaceSet | undefined;
    const onResize = () => measureFrame(true);
    onMounted(() => {
        measureFrame();
        window.addEventListener('resize', onResize);
        observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(() => measureFrame());
        if (frameEl.value)
            observer?.observe(frameEl.value);
        if (viewportEl.value)
            observer?.observe(viewportEl.value);
        mountedViewport = viewportEl.value;
        mountedViewport?.addEventListener('wheel', onWheel, { passive: false });
        fonts = document.fonts;
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
        fonts?.removeEventListener?.('loadingdone', refitForFonts);
        mountedViewport?.removeEventListener('wheel', onWheel);
        mountedViewport = undefined;
    });

    const edgeLabelLineHeight = computed(() => measureLines.value({ text: 'Mg', role: 'edge-label', availableWidth: 400, allocatedLines: 1, folded: false }).height);
    const viewportStyle = computed(() => `height:${viewportHeight.value}px;aspect-ratio:${FIT_ASPECT};overflow-x:${placement.value.overflowX ? 'auto' : 'hidden'};overflow-y:${placement.value.overflowY ? 'auto' : 'hidden'};--st-diagram-zoom:${zoom.value};--st-diagram-label-line-height:${edgeLabelLineHeight.value}px`);
    return { frameEl, viewportEl, measure, measureLines, effectiveMetrics, token,
        fit, zoom, readout, placement, viewportStyle, resetToFit,
        setZoom, zoomIn, zoomOut, fitToFrame, getCamera };
}
