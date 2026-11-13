/** The scene engine and both renderers share the same card/zone chrome. */
import type { EntityPresentation, OccurrenceRef } from "@sentropic/diagram-core";
import {
  layoutCard, layoutZone, projectCardProps, projectZoneProps, lineBoxHeight,
  CARD_GEOMETRY, ZONE_GEOMETRY, type CardLineMeasure,
} from "../presentation/diagramCardModel.js";
import { DEFAULT_ALLOCATED_LINES, type HeaderMeasurement, type LineMeasurer, type LineLayout } from "./measure.js";

export function measureSceneBox(
  presentation: EntityPresentation | undefined, occurrence: OccurrenceRef,
  width: number, collapsed: boolean, measure: LineMeasurer,
) {
  const zone = presentation?.form === "container" || presentation?.form === "legend";
  const measured = new Map<string, LineLayout>();
  const at = (text: string, role: Parameters<LineMeasurer>[0]["role"], availableWidth: number) => {
    const key = JSON.stringify([text, role, availableWidth]);
    let layout = measured.get(key);
    if (layout === undefined) {
      layout = measure({ text, role, availableWidth, allocatedLines: DEFAULT_ALLOCATED_LINES[role], folded: collapsed });
      measured.set(key, layout);
    }
    return layout;
  };
  const adapter: CardLineMeasure = (text, role, availableWidth, allocatedLines) => {
    const layout = at(text, zone && !collapsed && role === "body" ? "subtitle" : role, availableWidth);
    return { lines: layout.lines, tooWide: layout.width > availableWidth,
      lineWidths: layout.lines.map(() => layout.width) };
  };
  // Reserving an icon even when a host cannot resolve it is conservative.
  const resolveGlyph = () => ({ face: "" });
  const projected = zone
    ? projectZoneProps(presentation, { entityId: occurrence, collapsed, width, toggleLabel: "toggle", resolveGlyph })
    : projectCardProps(presentation, { entityId: occurrence, resolveGlyph });
  const props = projected.kind === "label" ? { entityId: occurrence, title: presentation?.text.title ?? "", body: [] } : projected.props;
  const layout = projected.kind === "zone"
    ? layoutZone({ ...projected.props, autoSize: true }, adapter)
    : layoutCard({ ...props, autoSize: true } as Parameters<typeof layoutCard>[0], adapter);
  const card = "collapsed" in layout ? layout.card : layout;
  const header = "collapsed" in layout ? layout.header : undefined;
  const textWidth = card?.headerTextWidth ?? header!.headerTextWidth;
  const kicker = presentation?.text.kicker === undefined ? undefined : at(presentation.text.kicker, "kicker", textWidth);
  const title = at(presentation?.text.title ?? "", "title", textWidth);
  const subtitle = header === undefined || presentation?.text.subtitle === undefined ? undefined
    : at(presentation.text.subtitle, "subtitle", header.subtitleWidth);
  const blockHeight = Math.max(projected.kind === "label" ? 0 : CARD_GEOMETRY.iconSize, (kicker?.height ?? 0) + title.height);
  const height = header === undefined ? blockHeight : blockHeight + ZONE_GEOMETRY.headerRuleGap
    + (subtitle === undefined || subtitle.lines.length === 0 ? 0 : ZONE_GEOMETRY.subtitleGap + subtitle.height);
  const measuredHeader: HeaderMeasurement = {
    occurrence,
    ...(kicker === undefined ? {} : { kicker }), title,
    ...(subtitle === undefined ? {} : { subtitle }), height,
    overflow: (kicker?.overflow ?? false) || title.overflow || (subtitle?.overflow ?? false),
  };
  const footerReserve = header === undefined || header.footer.length === 0 ? 0
    : header.footer.length * lineBoxHeight(CARD_GEOMETRY.footer.size)
      + ZONE_GEOMETRY.ruleHeight + 2 * ZONE_GEOMETRY.ruleMargin + ZONE_GEOMETRY.footerBottomInset;
  return { width: layout.box.width, height: layout.box.height, header: measuredHeader,
    bodyWidth: card?.bodyWidth ?? width - 32,
    footerWidth: card === undefined ? width - 32 : collapsed ? 434 : card.bodyWidth,
    footerReserve, diagnostics: layout.diagnostics };
}
