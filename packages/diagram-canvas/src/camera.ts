/**
 * DC-2a camera contract, the pure half (SPEC_EVOL_DC2A §5): maximum display
 * scale, fit on both axes against a 16:9 fit box, readability floor, clamp and
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
 * Readability floor of the fit: below it a fit stops shrinking and the host pans.
 * Re-pin 2026-11-12 (M1/BF-6): 0.45 keeps an 18px edge label readable at fit
 * (18 × 0.45 = 8.1 ≥ 8 CSS px); mirrors the `diagramScene.minReadableScale` token.
 */
export const DEFAULT_MIN_READABLE_SCALE = 0.45;
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
  readonly maxDisplayScale?: number;
  readonly minReadableScale?: number;
}

export interface CameraFit {
  /** The §5.1 fit box, CSS px. */
  readonly fitWidth: number;
  readonly fitHeight: number;
  /** Zoom framing the whole drawing on both axes, never above the maximum display scale. */
  readonly zoomFit: number;
  /** Zoom a fit or reset applies: `zoomFit`, held at the readability floor when the drawing is larger. */
  readonly zoom: number;
  /** Interactive range: zoom-out reaches `zoomFit`, zoom-in stops at the maximum display scale (Z-1, Z-2). */
  readonly minZoom: number;
  readonly maxZoom: number;
  /** True when the applied zoom shows only part of the drawing: the host pans. */
  readonly pans: boolean;
}

/** §5.1: `fitW = viewW`, `fitH = min(viewW × 9/16, 0.85 × windowH)`. */
export function fitBox(viewWidth: number, windowHeight: number): { readonly width: number; readonly height: number } {
  return { width: viewWidth, height: Math.min(viewWidth / FIT_ASPECT, FIT_WINDOW_HEIGHT_SHARE * windowHeight) };
}

export function cameraFit(input: CameraFitInput): CameraFit {
  const maxZoom = input.maxDisplayScale ?? DEFAULT_MAX_DISPLAY_SCALE;
  const floor = Math.min(input.minReadableScale ?? DEFAULT_MIN_READABLE_SCALE, maxZoom);
  const box = fitBox(input.viewWidth, input.windowHeight);
  const bounds = input.bounds;
  if (bounds === undefined || !(bounds.width > 0) || !(bounds.height > 0)) {
    // Empty scene: readout 100 %.
    return { fitWidth: box.width, fitHeight: box.height, zoomFit: maxZoom, zoom: maxZoom, minZoom: maxZoom, maxZoom, pans: false };
  }
  const zoomFit = Math.min(box.width / bounds.width, box.height / bounds.height, maxZoom);
  const zoom = Math.max(zoomFit, floor);
  return { fitWidth: box.width, fitHeight: box.height, zoomFit, zoom, minZoom: zoomFit, maxZoom, pans: zoom > zoomFit };
}

/** Z-1/Z-7: any requested zoom lands inside `[minZoom, maxZoom]` of the current fit. */
export function clampZoom(zoom: number, fit: Pick<CameraFit, "minZoom" | "maxZoom">): number {
  return Math.min(fit.maxZoom, Math.max(fit.minZoom, zoom));
}

/** Z-5: percentage readout, 100 % = the maximum display scale. */
export function zoomReadout(zoom: number, maxDisplayScale: number = DEFAULT_MAX_DISPLAY_SCALE): number {
  return Math.round((zoom / maxDisplayScale) * 100);
}
