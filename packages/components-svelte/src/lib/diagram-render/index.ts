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
} from "../diagramCardModel.js";
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
} from "../diagramCardModel.js";

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
