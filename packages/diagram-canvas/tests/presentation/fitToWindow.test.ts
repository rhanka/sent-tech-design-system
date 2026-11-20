/**
 * DE-2 step 8 (OWNER-ADDENDA ask 9): fit-to-window framing for figure/comparison
 * hosts (`max-height: calc(100vh - 24px)`, `max-width: 100%`, centred) while
 * keeping the component default (`0.85 × windowH`, Z-3 / AC-23) untouched.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  cameraFit,
  DEFAULT_MAX_DISPLAY_SCALE,
  FIT_ASPECT,
  FIT_WINDOW_HEIGHT_SHARE,
  FIT_WINDOW_MARGIN_PX,
  fitBox,
} from "../../src/camera.js";
import { sceneFit, scenePlacement } from "../../src/presentation/diagramSceneModel.js";

describe("fit-to-window host framing (DE-2 ask 9)", () => {
  it("preserves the Z-3 / AC-23 default fit box (0.85 × windowH capped at 16:9) when fitToWindow is omitted or false", () => {
    expect(FIT_WINDOW_MARGIN_PX).toBe(24);
    expect(fitBox(1440, 900)).toEqual({ width: 1440, height: Math.min(1440 / FIT_ASPECT, FIT_WINDOW_HEIGHT_SHARE * 900) });
    expect(fitBox(1440, 900, false)).toEqual(fitBox(1440, 900));
    expect(fitBox(1600, 500)).toEqual({ width: 1600, height: 0.85 * 500 });
  });

  it("frames against calc(100vh - 24px) × 100% and centres the drawing when fitToWindow is true", () => {
    expect(fitBox(1440, 900, true)).toEqual({ width: 1440, height: 876 });
    expect(fitBox(1600, 500, true)).toEqual({ width: 1600, height: 476 });
    // SSR / unmeasured window height falls back to 16:9 without returning Infinity.
    expect(fitBox(1280, Number.POSITIVE_INFINITY, true)).toEqual({ width: 1280, height: 1280 / FIT_ASPECT });

    const bounds = { x: 0, y: 0, width: 1800, height: 1500 };
    const defaultFit = sceneFit({ bounds, viewWidth: 1440, windowHeight: 900 });
    const windowFit = sceneFit({ bounds, viewWidth: 1440, windowHeight: 900, fitToWindow: true });
    // fitToWindow gains the full window height minus 24 px (876 vs 765), yielding a larger fit zoom.
    expect(windowFit.zoom).toBeGreaterThan(defaultFit.zoom);
    expect(windowFit.fitHeight).toBeLessThanOrEqual(900 - FIT_WINDOW_MARGIN_PX);
    expect(windowFit.zoom).toBeLessThanOrEqual(DEFAULT_MAX_DISPLAY_SCALE);
    expect(windowFit.pans).toBe(false);

    const placed = scenePlacement(bounds, windowFit.zoom, windowFit);
    expect(placed.overflowX).toBe(false);
    expect(placed.overflowY).toBe(false);
    expect(placed.translateX).toBeCloseTo((1440 - bounds.width * windowFit.zoom) / 2, 6);
    expect(placed.translateY).toBeCloseTo((windowFit.fitHeight - bounds.height * windowFit.zoom) / 2, 6);

    // Horizontal scrollbar thickness stays inside windowHeight - 24 so CSS max-height never clips.
    const withBar = cameraFit({ bounds, viewWidth: 1440, windowHeight: 900, scrollbarHeight: 16, fitToWindow: true });
    expect(withBar.fitHeight + 16).toBeLessThanOrEqual(900 - FIT_WINDOW_MARGIN_PX);
  });

  it("enables fit-to-window by default on the diagram-first-paint figure/comparison host", () => {
    const html = readFileSync(new URL("../../../../tools/diagram-first-paint/index.html", import.meta.url), "utf8");
    const main = readFileSync(new URL("../../../../tools/diagram-first-paint/main.js", import.meta.url), "utf8");
    expect(html).toContain("max-height: calc(100vh - 24px)");
    expect(html).toContain("max-width: 100%");
    expect(html).toContain("margin-inline: auto");
    expect(main).toContain("fitToWindow");
  });
});
