export { renderSceneSvg } from "./renderSceneSvg.js";
export {
  ARROW_DIRECTION_CONVENTION,
  DEFAULT_ZONE_TAG_ACRONYM_ALLOWLIST,
  isOpaqueAcronymZoneTag,
  lintArrowDirection,
  lintDiagramConventions,
  lintZoneTagAcronyms,
  type ArrowDirectionEdgeInput,
  type DiagramConventionLintOptions,
  type LintArrowDirectionInput,
  type LintDiagramConventionsInput,
  type LintZoneTagAcronymsInput,
  type ZoneTagLintEntry,
} from "../layout/conventions.js";
export { connectorPath, parseConnectorPath, DEFAULT_EDGE_CORNER_RADIUS } from "./connectorPath.js";
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
} from "./connectorStyle.js";
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
} from "./linkLegend.js";
import {
  renderCardSvg,
  renderCardSvgFromPresentation,
  projectCardProps,
  type CardSvgResult,
} from "./renderCardSvg.js";
import {
  renderZoneSvg,
  renderZoneSvgFromPresentation,
  projectZoneProps,
  zoneContent,
  type ZoneSvgResult,
} from "./renderZoneSvg.js";
import {
  cardLineMeasurer,
  type CardLineLayout,
  type CardMeasureRequest,
} from "./diagramCardModel.js";
import type {
  CardDiagnostic,
  CardLayout,
  CardLineMeasure,
  CardPresentationInput,
  DiagramCardProps,
  DiagramGlyphPaths,
} from "./renderCardSvg.js";
import type {
  DiagramZoneProps,
  ZoneChildSpec,
  ZoneDiagnostic,
  ZoneLayout,
  ZonePresentationInput,
} from "./diagramCardModel.js";

export { renderCardSvg, renderCardSvgFromPresentation, projectCardProps };
export { renderZoneSvg, renderZoneSvgFromPresentation, projectZoneProps, zoneContent };
/**
 * The canvas `LineMeasurer` bridge (diagram-canvas `MeasureRequest` shape):
 * pass `cardLineMeasurer()` straight as the injected measurer. Exported
 * through this subpath so hosts never reach into the barrel.
 */
export { cardLineMeasurer };
export type { CardSvgResult, ZoneSvgResult };
export type {
  CardDiagnostic,
  CardLayout,
  CardLineLayout,
  CardLineMeasure,
  CardMeasureRequest,
  CardPresentationInput,
  DiagramCardProps,
  DiagramGlyphPaths,
};
export type {
  DiagramZoneProps,
  ZoneChildSpec,
  ZoneDiagnostic,
  ZoneLayout,
  ZonePresentationInput,
};

export { ERD_GEOMETRY, measureErdCard, renderErdCardSvg, erdMarkerGeometry, renderErdMarkerSvg, renderErdTable } from "./erd.js";
export type { ErdCard, ErdRow, ErdMarker } from "./erd.js";
