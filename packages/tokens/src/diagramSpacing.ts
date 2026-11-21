/**
 * World units. Owner A9 is resolved: V1 (72 vertical / 96 horizontal); canvas defaults are generated.
 * `zoneGutter` (96) is the single fixed gutter token between sibling zones on both axes (DE-2 ask 3);
 * routing adapts inside the fixed gutter instead of widening it.
 * `routeSpacing` (24) is the minimum spacing between parallel route segments, neighbouring elbows,
 * ports and arrowheads; `routeBorderClearance` (15) is the minimum link-to-border clearance (DE-2 ask 2).
 */
export const DIAGRAM_SCENE_SPACING = {
  gapMin: 96, gapMinBlock: 72, gapBase: 64, gapBaseBlock: 8,
  trackSpacing: 14, trackSpacingBlock: 7, labelBand: 30, gapMax: 240,
  containerPadding: 16,
  zoneGutter: 96,
  routeSpacing: 24,
  routeBorderClearance: 15,
} as const;
