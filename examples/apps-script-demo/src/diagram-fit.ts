// Which fold state the diagram opens in, for the room the figure has.
//
// `DiagramSceneFigure` frames the drawing down to its readable scale (0.45: an
// edge label is then about 8 CSS px) and scrolls past it. Whether a state can be
// framed therefore depends on the size of the figure. The page asks the layout
// engine the figure uses for the extent of each fold state, and opens the most
// detailed one that the figure frames whole. No DOM here: the size comes in.
import { cardLineMeasurer, defaultCardMeasure, sceneCardMeasure } from "@sentropic/diagram-canvas/diagramCardModel";
import { layoutScene, resolveScene, sceneFit } from "@sentropic/diagram-canvas/diagramSceneModel";
import { m3ProfileRegistry, shippedExecutorBindings } from "@sentropic/diagram-core";
import { diagramDocument, diagramFoldLevels, diagramPresentation } from "./data.js";

/**
 * Room kept free on both axes. The extents below are measured with the
 * component's fallback text metrics; in a browser the figure measures the
 * loaded font and its painted boxes, which moves label boxes by a few px.
 */
export const FIT_MARGIN = 1.03;

export interface SceneExtent { x: number; y: number; width: number; height: number }

let extents: readonly SceneExtent[] | undefined;

/** Drawing extent (boxes and placed labels) of each fold state, in scene units. */
export function foldLevelExtents(): readonly SceneExtent[] {
  extents ??= diagramFoldLevels.map((collapsed, level) => {
    const input = {
      document: diagramDocument,
      presentation: diagramPresentation,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureLines: cardLineMeasurer(sceneCardMeasure(defaultCardMeasure)),
      collapsed,
    };
    const result = layoutScene(input);
    const bounds = result.status === "laid-out" ? resolveScene(result, input).bounds : undefined;
    if (bounds === undefined) throw new Error(`Fold level ${level} of the diagram has no layout`);
    return bounds;
  });
  return extents;
}

/** True when a figure of that width, in a window of that height, frames the fold state whole. */
export function framesWhole(level: number, viewWidth: number, windowHeight: number, margin = FIT_MARGIN): boolean {
  const bounds = foldLevelExtents()[level];
  if (bounds === undefined || !(viewWidth > 0) || !(windowHeight > 0)) return false;
  return !sceneFit({ bounds, viewWidth: viewWidth / margin, windowHeight: windowHeight / margin }).pans;
}

/** The most detailed fold state framed whole; the last one (a single card) when none is. */
export function pickFoldLevel(viewWidth: number, windowHeight: number): number {
  const last = diagramFoldLevels.length - 1;
  for (let level = 0; level < last; level += 1) {
    if (framesWhole(level, viewWidth, windowHeight)) return level;
  }
  return last;
}
