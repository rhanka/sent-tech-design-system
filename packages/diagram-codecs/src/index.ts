/**
 * `@sentropic/diagram-codecs` — static string codecs over a resolved diagram
 * scene. Pure-string, DOM-free: the draw.io export and the SVG export are both
 * plain strings composed from the scene model.
 */

import { renderSceneSvg } from "@sentropic/diagram-canvas/diagram-render";

export { toDrawio } from "./toDrawio.js";
export type { ToDrawioOptions } from "./toDrawio.js";

/** Static SVG export, re-exporting `renderSceneSvg` from `@sentropic/diagram-canvas`. */
export const toSvg = renderSceneSvg;
