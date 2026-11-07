/**
 * `renderZoneSvg` — pure wrapping-card (zone) SVG renderer (DC-2 static
 * half, spec §6).
 *
 * Plain TypeScript, no Svelte import. Ships on the
 * `@sentropic/design-system-svelte/diagram-render` subpath next to
 * `renderCardSvg`. Both renderers consume the same geometry source
 * (`../diagramCardModel.js`): collapsed, the zone IS the atomic card
 * (§6.2 — the card content is emitted inside a translated `<g>`); expanded,
 * the frame carries the shared header, the header rule and the children.
 *
 * No hack from the hrpn FOLDED-CARD-HACKS list survives here: no
 * `diagram-card-box` rect, no regex surgery on rendered output, no
 * `foreignObject` toggle, no title pre-fitting (`FOLD_TITLE`), no
 * function/detail re-roling (DH-08), no tint injection — the toggle is the
 * same slot glyph as the card's and the subtitle is one body string.
 */
import {
  CARD_GEOMETRY,
  ZONE_GEOMETRY,
  defaultCardMeasure,
  layoutZone,
  projectZoneProps,
  zoneCollapsedCardProps,
  type CardLineMeasure,
  type DiagramZoneProps,
  type DiagramGlyphPaths,
  type ZoneChildSpec,
  type ZoneDiagnostic,
  type ZoneLayout,
  type ZonePresentationInput,
} from "../diagramCardModel.js";
import { getDiagramGlyph } from "../diagram-icons/registry.js";
import { iconGroupFor, renderCardContent, toggleGlyph } from "./renderCardSvg.js";

export type {
  CardLineMeasure,
  DiagramGlyphPaths,
  DiagramZoneProps,
  ZoneChildSpec,
  ZoneDiagnostic,
  ZonePresentationInput,
};
export { projectZoneProps };

function escapeXml(value: string): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const FONT_STACK = "var(--st-font-sans, system-ui, sans-serif)";

function textLines(
  lines: readonly { text: string; x: number; baseline: number; size: number; weight: number; anchor?: "start" | "middle" }[],
  className: string,
  fill: string,
  extra: string,
): string {
  return lines
    .map(
      (line) =>
        `<text class="${className}" x="${line.x}" y="${line.baseline}" text-anchor="${line.anchor === "middle" ? "middle" : "start"}" font-size="${line.size}" font-weight="${line.weight}" fill="${fill}"${extra}>${escapeXml(line.text)}</text>`,
    )
    .join("");
}

function childContent(
  child: ZoneChildSpec,
  measure: CardLineMeasure,
): { content: string; diagnostics: readonly ZoneDiagnostic[] } {
  if (child.kind === "card") {
    if (child.card === undefined) throw new Error("fixture-error: card child without card props");
    const { content } = renderCardContent(child.card, measure);
    return { content, diagnostics: [] };
  }
  if (child.zone === undefined) throw new Error("fixture-error: zone child without zone props");
  const rendered = zoneContent(child.zone, child.children ?? [], measure);
  return { content: rendered.content, diagnostics: rendered.diagnostics };
}

/**
 * Zone-local content (no outer `<svg>`): collapsed, the translated card
 * content; expanded, frame + header + rule + children. Coordinates are
 * zone-local (the caller wraps in `translate(x y)`).
 */
export function zoneContent(
  props: DiagramZoneProps,
  children: readonly ZoneChildSpec[],
  measure: CardLineMeasure,
): { content: string; layout: ZoneLayout; diagnostics: readonly ZoneDiagnostic[] } {
  const g = ZONE_GEOMETRY;
  const layout = layoutZone(props, measure, children);
  const x = layout.box.x;
  const y = layout.box.y;
  const parts: string[] = [];

  if (layout.collapsed) {
    const cardProps = zoneCollapsedCardProps(props);
    const { content } = renderCardContent(cardProps, measure);
    parts.push(content);
    return { content: parts.join(""), layout, diagnostics: layout.diagnostics };
  }

  const header = layout.header;
  if (header === undefined) throw new Error("fixture-error: expanded zone without header layout");
  const width = layout.box.width;
  const height = layout.box.height;

  // Frame (expanded only; collapsed is the card border, §6.4).
  parts.push(
    `<rect class="st-diagramZone-frame" x="0" y="0" width="${width}" height="${height}" rx="${g.radius}" fill="var(--st-component-diagramZone-surface, var(--st-semantic-surface-raised))" stroke="var(--st-component-diagramZone-border, var(--st-semantic-border-strong))" stroke-width="${g.borderWidth}"/>`,
  );
  if (header.iconBox !== undefined && props.icon !== undefined) {
    parts.push(
      iconGroupFor(props.icon, props.iconGlyph, header.iconBox.x - x, header.iconBox.y - y, header.iconBox.size),
    );
  }
  if (header.kicker.length > 0) {
    parts.push(
      textLines(
        header.kicker.map((line) => ({ ...line, x: line.x - x, baseline: line.baseline - y })),
        "st-diagramZone-kicker",
        "var(--st-component-diagramZone-secondaryText, var(--st-semantic-text-secondary))",
        ` letter-spacing="0.04em" style="text-transform:uppercase"`,
      ),
    );
  }
  if (header.title.length > 0) {
    parts.push(
      textLines(
        header.title.map((line) => ({ ...line, x: line.x - x, baseline: line.baseline - y })),
        "st-diagramZone-title",
        "var(--st-component-diagramZone-text, var(--st-semantic-text-primary))",
        "",
      ),
    );
  }
  if (header.subtitle.length > 0) {
    parts.push(
      textLines(
        header.subtitle.map((line) => ({ ...line, x: line.x - x, baseline: line.baseline - y })),
        "st-diagramZone-subtitle",
        "var(--st-component-diagramZone-text, var(--st-semantic-text-primary))",
        "",
      ),
    );
  }
  // Header rule: same rule as the card footer rule (1 px, border-subtle,
  // same insets), 4 px under the subtitle or the header block (§6.2).
  parts.push(
    `<line class="st-diagramZone-rule" x1="${g.ruleInsetStart}" x2="${width - g.ruleInsetEnd}" y1="${header.ruleY - y}" y2="${header.ruleY - y}" stroke="var(--st-component-diagramZone-rule, var(--st-semantic-border-subtle))" stroke-width="${g.ruleHeight}" vector-effect="non-scaling-stroke"/>`,
  );
  if (header.toggleBox !== undefined && props.toggleLabel !== undefined) {
    parts.push(
      toggleGlyph(
        { collapsed: false, label: props.toggleLabel },
        { x: header.toggleBox.x - x, y: header.toggleBox.y - y, size: header.toggleBox.size },
      ),
    );
  }
  for (const child of children) {
    const rendered = childContent(child, measure);
    parts.push(
      `<g class="st-diagramZone-child" data-child-kind="${child.kind}" transform="translate(${child.x - x} ${child.y - y})">${rendered.content}</g>`,
    );
  }
  return { content: parts.join(""), layout, diagnostics: layout.diagnostics };
}

/**
 * Render one zone as a standalone SVG string. Collapsed: the atomic card
 * at the zone occurrence (460 × 200, plus the "+" toggle slot). Expanded:
 * the frame with header, rule and children. `measure` defaults to the
 * deterministic greedy wrapper.
 */
export function renderZoneSvg(
  props: DiagramZoneProps,
  opts: { children?: readonly ZoneChildSpec[]; measure?: CardLineMeasure } = {},
): { readonly svg: string; readonly diagnostics: readonly ZoneDiagnostic[]; readonly layout: ZoneLayout } {
  const measure = opts.measure ?? defaultCardMeasure;
  const children = opts.children ?? [];
  const { content, layout, diagnostics } = zoneContent(props, children, measure);
  const { x, y, width, height } = layout.box;
  const overflowSlots = diagnostics
    .filter((diagnostic) => diagnostic.code === "zone-overflow")
    .map((diagnostic) => diagnostic.slot);
  const unknownIcon = diagnostics.some((diagnostic) => diagnostic.code === "zone-icon-unknown");
  const firstOverflow = overflowSlots.length === 0 ? undefined : overflowSlots[0];
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" class="st-diagramZoneSvg" width="${x + width}" height="${y + height}" viewBox="0 0 ${x + width} ${y + height}" role="img" aria-label="${escapeXml(props.title)}" style="font-family:${FONT_STACK}">` +
    `<title>${escapeXml(props.title)}</title>` +
    `<g class="st-diagramZone${layout.collapsed ? " st-diagramZone--collapsed" : " st-diagramZone--expanded"}" data-entity="${escapeXml(props.entityId)}" data-collapsed="${layout.collapsed ? "true" : "false"}"${props.tone === undefined ? "" : ` data-tone="${escapeXml(props.tone)}"`}${firstOverflow === undefined ? "" : ` data-zone-overflow="${firstOverflow}"`}${unknownIcon ? ` data-zone-icon-unknown=""` : ""} transform="translate(${x} ${y})">` +
    content +
    `</g>` +
    `</svg>`;
  return { svg, diagnostics, layout };
}

/**
 * Convenience: project an `EntityPresentation` then render the zone.
 * Returns `{ kind: "label" }` when the view carries no zone presentation
 * for the entity (L-R12).
 */
export function renderZoneSvgFromPresentation(
  presentation: ZonePresentationInput | undefined,
  opts: {
    entityId: string;
    collapsed: boolean;
    toggleLabel?: string;
    align?: "left" | "center";
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    children?: readonly ZoneChildSpec[];
    measure?: CardLineMeasure;
  },
): { kind: "zone"; svg: string; diagnostics: readonly ZoneDiagnostic[] } | { kind: "label" } {
  const resolved = projectZoneProps(presentation, {
    entityId: opts.entityId,
    collapsed: opts.collapsed,
    ...(opts.toggleLabel === undefined ? {} : { toggleLabel: opts.toggleLabel }),
    ...(opts.align === undefined ? {} : { align: opts.align }),
    ...(opts.x === undefined ? {} : { x: opts.x }),
    ...(opts.y === undefined ? {} : { y: opts.y }),
    ...(opts.width === undefined ? {} : { width: opts.width }),
    ...(opts.height === undefined ? {} : { height: opts.height }),
    resolveGlyph: getDiagramGlyph,
  });
  if (resolved.kind !== "zone") return { kind: "label" };
  const rendered = renderZoneSvg(resolved.props, {
    children: opts.children,
    measure: opts.measure,
  });
  return { kind: "zone", svg: rendered.svg, diagnostics: rendered.diagnostics };
}

// Re-exported for the zone parity corpus: the card geometry the collapsed
// zone reuses (DC-D13 — no second size).
export { CARD_GEOMETRY };
