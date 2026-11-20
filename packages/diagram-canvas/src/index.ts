/**
 * `@sentropic/diagram-canvas` - the headless scene and its hit test.
 *
 * The package is PUBLISHABLE since DC-2a (BF-5): the Svelte scene host
 * `DiagramSceneFigure` in `@sentropic/design-system-svelte` depends on it, and
 * a published package naming a private one installs broken for every
 * consumer. Its only dependency, `@sentropic/diagram-core`, is public. The
 * publish workflow and the tag line in `docs/release.md` are not written yet.
 * See README, "Publication".
 *
 * No DOM, no renderer, no framework, no design system package. Its ONLY bare
 * import specifier is `@sentropic/diagram-core`, which is the edge
 * `docs/graph-dataviz-architecture-dag.json` declares; a test asserts there is no
 * second one.
 *
 * Read `README.md` for the contracts this lot fixes and for what it leaves out.
 */

export * from "./transform.js";
export * from "./camera.js";
export * from "./geometry.js";
export * from "./visibility.js";
export * from "./scene.js";
export * from "./hit.js";
export * from "./layout/index.js";

export * from "./presentation/erd.js";
export { connectorPath, parseConnectorPath, DEFAULT_EDGE_CORNER_RADIUS } from "./presentation/connectorPath.js";
export {
  ARROWHEAD_MARKER_GEOMETRY,
  connectorDashArray,
  connectorMarkerIds,
  connectorMarkerKind,
  connectorMarkerRef,
  extraConnectorMarkers,
  type ConnectorMarkerEdgeInput,
  type ConnectorMarkerIds,
  type ConnectorMarkerSpec,
} from "./presentation/connectorStyle.js";
export {
  buildSceneLinkLegend,
  collectLinkLegendStyles,
  defaultLinkStyleLabel,
  LINK_LEGEND_ARROWHEAD_ORDER,
  LINK_LEGEND_EMPHASIS_ORDER,
  LINK_LEGEND_FONT_SIZE,
  LINK_LEGEND_GAP,
  LINK_LEGEND_HEADER_HEIGHT,
  LINK_LEGEND_MIN_WIDTH,
  LINK_LEGEND_PADDING,
  LINK_LEGEND_ROW_GAP,
  LINK_LEGEND_ROW_HEIGHT,
  LINK_LEGEND_STROKE_ORDER,
  LINK_LEGEND_SWATCH_GAP,
  LINK_LEGEND_SWATCH_WIDTH,
  linkLegendSwatchGeometry,
  linkStyleKey,
  type BuildSceneLinkLegendInput,
  type LinkLegendAnchor,
  type LinkLegendEdgeInput,
  type LinkLegendEntry,
  type LinkLegendStyleKey,
  type LinkLegendSwatchGeometry,
  type SceneLinkLegend,
} from "./presentation/linkLegend.js";
