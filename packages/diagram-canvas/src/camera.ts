/**
 * DC-2a camera contract, the pure half (SPEC_EVOL_DC2A §5): maximum display
 * scale, fit on both axes against a 16:9 fit box, clamp and
 * readout. No DOM and no camera UI live here: a scene host passes its measured
 * figure width and window height in, and applies the returned zoom as a
 * transform. Zoom never changes geometry (Z-6).
 *
 * The numbers mirror the DS tokens `diagramScene.maxDisplayScale` and
 * `diagramScene.minReadableScale`; a host resolves the tokens and passes them.
 */

/** Display scale at readout 100 % (Z-5): a 460 × 200 card renders at ≈ 285 × 124 CSS px. */
export const DEFAULT_MAX_DISPLAY_SCALE = 0.62;
/**
 * Hard display floor: fit scales down to it, then the viewport scrolls.
 * R7 owner decision (21/11): default to fitting the whole figure down to 30 %.
 */
export const DEFAULT_MIN_READABLE_SCALE = 0.30;
/** World font size of an edge label, px (token `diagramScene.edgeLabelFontSize`). */
export const DEFAULT_EDGE_LABEL_FONT_SIZE = 18;
/** World line box of an edge label, px (token `diagramScene.edgeLabelLineHeight`). */
export const DEFAULT_EDGE_LABEL_LINE_HEIGHT = 22;
/** Original DC-2a edge-label readability reference, CSS px. */
export const MIN_EDGE_LABEL_CSS_PX = 8;
/** Share of the window height a figure may take (§5.1 fit box). */
export const FIT_WINDOW_HEIGHT_SHARE = 0.85;
/** Fit box aspect (§5.1): 16:9. */
export const FIT_ASPECT = 16 / 9;

export interface CameraFitInput {
  /** Scene bounds (DEC-5: nodes, edges, ports and label boxes). Absent or empty: nothing to frame. */
  readonly bounds?: { readonly width: number; readonly height: number };
  /** Figure content width, CSS px. */
  readonly viewWidth: number;
  /** `window.innerHeight`, CSS px. */
  readonly windowHeight: number;
  /** Measured horizontal scrollbar thickness (`offsetHeight - clientHeight`), CSS px. */
  readonly scrollbarHeight?: number;
  readonly maxDisplayScale?: number;
  /** Optional higher readability floor; never lowers the absolute 0.30 floor. */
  readonly minReadableScale?: number;
  /**
   * Grid the applied fit zoom lands on, scale units. The fit is floored to
   * it, never rounded: an applied zoom above `zoomFit` would paint past the
   * fit box. The display cap and the readability floor are token values and
   * stay exact. Absent: the applied zoom is the exact fit.
   */
  readonly zoomQuantum?: number;
}

export interface CameraFit {
  /** The usable §5.1 fit box, excluding scrollbars, CSS px. */
  readonly fitWidth: number;
  readonly fitHeight: number;
  /** Zoom framing the whole drawing on both axes, never above the maximum display scale. */
  readonly zoomFit: number;
  /** Zoom a fit or reset applies: `zoomFit`, floored to `zoomQuantum` when one is given, clamped to the readability floor. */
  readonly zoom: number;
  /** Interactive range: zoom-out stops at the readable fit, zoom-in at the display cap. */
  readonly minZoom: number;
  readonly maxZoom: number;
  /** True when the applied zoom shows only part of the drawing: the host pans. */
  readonly pans: boolean;
}

/** Screen-space inset for non-scaling strokes and CSS layout rounding. */
export const FIT_PAINT_INSET = 1;

/** Largest multiple of `quantum` that is not above `value`. A quantum that
 * is not a finite positive number defines no grid: the value is returned. */
export function floorToQuantum(value: number, quantum: number): number {
  if (!(quantum > 0) || !Number.isFinite(quantum) || !Number.isFinite(value)) return value;
  const perUnit = 1 / quantum;
  let steps = Math.floor(value * perUnit);
  // The product is rounded: it can land one ulp on either side of an exact
  // multiple (0.501 × 1000 = 500.99999999999994). Settle on the largest
  // step that is not above the value, so the result never exceeds it.
  if (steps / perUnit > value) steps -= 1;
  else if ((steps + 1) / perUnit <= value) steps += 1;
  return steps / perUnit;
}

/** §5.1: `fitW = viewW`, `fitH = min(viewW × 9/16, 0.85 × windowH)`. */
export function fitBox(viewWidth: number, windowHeight: number): { readonly width: number; readonly height: number } {
  return { width: viewWidth, height: Math.min(viewWidth / FIT_ASPECT, FIT_WINDOW_HEIGHT_SHARE * windowHeight) };
}

export function cameraFit(input: CameraFitInput): CameraFit {
  const maxZoom = Math.max(DEFAULT_MIN_READABLE_SCALE, input.maxDisplayScale ?? DEFAULT_MAX_DISPLAY_SCALE);
  const readableFloor = Math.min(maxZoom, Math.max(DEFAULT_MIN_READABLE_SCALE, input.minReadableScale ?? DEFAULT_MIN_READABLE_SCALE));
  const frame = fitBox(input.viewWidth, input.windowHeight);
  // Hosts add the scrollbar back to the outer height; fit and placement use
  // only the drawable area, keeping the combined height inside the fit box.
  const box = { width: frame.width, height: Math.max(0, frame.height - (input.scrollbarHeight ?? 0)) };
  const bounds = input.bounds;
  if (bounds === undefined || !(bounds.width > 0) || !(bounds.height > 0)) {
    // Empty scene: readout 100 %.
    return { fitWidth: box.width, fitHeight: box.height, zoomFit: maxZoom, zoom: maxZoom, minZoom: maxZoom, maxZoom, pans: false };
  }
  const zoomFit = Math.min(Math.max(0, box.width - 2 * FIT_PAINT_INSET) / bounds.width, Math.max(0, box.height - 2 * FIT_PAINT_INSET) / bounds.height, maxZoom);
  // The applied zoom is quantised here, once, and downward: every consumer
  // (transform, camera state, painted-bounds read) gets this single value,
  // and the fit height below is the one of the drawing at that same zoom.
  const applied = input.zoomQuantum === undefined || zoomFit >= maxZoom ? zoomFit : floorToQuantum(zoomFit, input.zoomQuantum);
  // All hosts and camera inputs share this range. A small frame or a large
  // unfolded scene reaches the floor, then scrolls to expose the rest.
  const zoom = Math.max(readableFloor, applied);
  const fitHeight = Math.min(box.height, Math.ceil((bounds.height * zoom + 2 * FIT_PAINT_INSET) * 64) / 64);
  return { fitWidth: box.width, fitHeight, zoomFit, zoom, minZoom: zoom, maxZoom, pans: zoom > zoomFit };
}

/** Z-1/Z-7: any requested zoom lands inside `[minZoom, maxZoom]` of the current fit. */
export function clampZoom(zoom: number, fit: Pick<CameraFit, "minZoom" | "maxZoom">): number {
  return Math.min(fit.maxZoom, Math.max(fit.minZoom, zoom));
}

/** §5.3: rendered edge-label font size at a zoom, CSS px. */
export function edgeLabelCssPx(zoom: number, fontSize: number = DEFAULT_EDGE_LABEL_FONT_SIZE): number {
  return fontSize * zoom;
}

/** Z-5: percentage readout, 100 % = the maximum display scale. */
export function zoomReadout(zoom: number, maxDisplayScale: number = DEFAULT_MAX_DISPLAY_SCALE): number {
  return Math.round((zoom / maxDisplayScale) * 100);
}
