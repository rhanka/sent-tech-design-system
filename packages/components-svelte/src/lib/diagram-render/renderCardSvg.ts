/**
 * `renderCardSvg` — pure atomic-card SVG renderer (DC-1).
 *
 * Plain TypeScript, no Svelte import. Ships on the
 * `@sentropic/design-system-svelte/diagram-render` subpath. Consumes the
 * same geometry source as the Svelte `DiagramCard`: the `diagramCard`
 * component tokens plus the `diagram-canvas` `measure.ts` constants, via
 * `../diagramCardModel.js` (shared projection + line layout).
 *
 * Exactly one rule element, drawn non-scaling (§5.4, DIF-07, DH-04); fixed
 * 460 × 200 box; square corners; footer pinned at 9.25; no shortening —
 * over-long slots are reported through the returned diagnostics (DC-D4) and
 * the result is refused (no `svg`): overflow = refusal, never a truncation.
 */
import {
  CARD_GEOMETRY,
  defaultCardMeasure,
  firstOverflowDiagnostic,
  layoutCard,
  projectCardProps,
  type CardDiagnostic,
  type CardLayout,
  type CardLineMeasure,
  type CardPresentationInput,
  type DiagramCardProps,
  type DiagramGlyphPaths,
} from "../diagramCardModel.js";
import {
  DIAGRAM_GLYPH_BASE,
  getDiagramGlyph,
} from "../diagram-icons/registry.js";

export type {
  CardDiagnostic,
  CardLayout,
  CardLineMeasure,
  CardPresentationInput,
  DiagramCardProps,
  DiagramGlyphPaths,
};
export { projectCardProps };

function escapeXml(value: string): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const FONT_STACK = "var(--st-font-sans, system-ui, sans-serif)";

/** Icon pictogram group at (x, y) in the caller's coordinate space. */
export function iconGroupFor(
  name: string,
  glyph: DiagramGlyphPaths | undefined,
  x: number,
  y: number,
  size: number,
): string {
  if (glyph === undefined) return "";
  const scale = size / 64;
  const lineStroke = glyph.darkLine === true
    ? "var(--st-component-diagramIcon-lineDarkStroke, var(--st-semantic-feedback-info))"
    : "var(--st-component-diagramIcon-lineStroke, var(--st-semantic-surface-raised))";
  return `<g class="st-diagramCard-icon" data-diagram-icon="${escapeXml(name)}" transform="translate(${x} ${y}) scale(${scale})" aria-hidden="true">` +
    `<path d="${DIAGRAM_GLYPH_BASE}" fill="var(--st-component-diagramIcon-baseFill, color-mix(in srgb, var(--st-semantic-feedback-info) 18%, var(--st-semantic-surface-raised)))"/>` +
    `<path d="${escapeXml(glyph.face)}" fill="var(--st-component-diagramIcon-faceFill, color-mix(in srgb, var(--st-semantic-feedback-info) 75%, var(--st-semantic-surface-raised)))" stroke="var(--st-component-diagramIcon-faceStroke, var(--st-semantic-feedback-info))" stroke-width="1.5" stroke-linejoin="round"/>` +
    (glyph.line === undefined
      ? ""
      : `<path d="${escapeXml(glyph.line)}" fill="none" stroke="${lineStroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`) +
    (glyph.text === undefined
      ? ""
      : `<text x="32" y="47" text-anchor="middle" fill="var(--st-component-diagramIcon-lineStroke, var(--st-semantic-surface-raised))" font-size="13" font-weight="750">${escapeXml(glyph.text)}</text>`) +
    `</g>`;
}

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

/**
 * Card-local content (border, accent bar, icon, slots, rule, footer,
 * toggle) with no `<svg>` root — shared by `renderCardSvg` (wrapped in a
 * standalone root) and `renderZoneSvg` (wrapped in a translated `<g>` for
 * the collapsed zone, §6.2: the zone IS the card).
 */
export function renderCardContent(
  props: DiagramCardProps,
  measure: CardLineMeasure = defaultCardMeasure,
): { readonly content: string; readonly layout: ReturnType<typeof layoutCard> } {
  const layout = layoutCard(props, measure);
  const g = { ...CARD_GEOMETRY, height: layout.box.height };
  const parts: string[] = [];
  // Border, then the accent bar over the left stroke (border-left look).
  // A proposed card is always drawn dashed, independently of the tint
  // (owner criterion 5); the dash pattern is the kit's `4 5`.
  parts.push(
    `<rect x="1" y="1" width="${g.width - 2}" height="${g.height - 2}" fill="var(--st-component-diagramCard-surface, var(--st-semantic-surface-raised))" stroke="var(--st-component-diagramCard-border, var(--st-semantic-border-strong))" stroke-width="${g.borderWidth}"${props.proposed === true ? ` stroke-dasharray="var(--st-component-diagramCard-proposedDashArray, 4 5)"` : ""}/>`,
  );
  parts.push(
    `<rect x="0" y="0" width="${g.accentWidth}" height="${g.height}" fill="var(--st-component-diagramCard-accent, var(--st-semantic-data-category1))"/>`,
  );
  if (layout.iconBox !== undefined && props.icon !== undefined) {
    parts.push(
      iconGroupFor(props.icon, props.iconGlyph, layout.iconBox.x, layout.iconBox.y, layout.iconBox.size),
    );
  }
  if (layout.kicker.length > 0) {
    parts.push(
      textLines(
        layout.kicker,
        "st-diagramCard-kicker",
        "var(--st-component-diagramCard-secondaryText, var(--st-semantic-text-secondary))",
        ` letter-spacing="0.04em" style="text-transform:uppercase"`,
      ),
    );
  }
  if (layout.title.length > 0) {
    parts.push(
      textLines(
        layout.title,
        "st-diagramCard-title",
        "var(--st-component-diagramCard-text, var(--st-semantic-text-primary))",
        "",
      ),
    );
  }
  if (layout.body.length > 0) {
    const secondary = layout.body.filter((line) => line.secondary);
    const primary = layout.body.filter((line) => !line.secondary);
    if (primary.length > 0) {
      parts.push(
        textLines(
          primary,
          "st-diagramCard-body",
          "var(--st-component-diagramCard-text, var(--st-semantic-text-primary))",
          "",
        ),
      );
    }
    if (secondary.length > 0) {
      parts.push(
        textLines(
          secondary,
          "st-diagramCard-detail",
          "var(--st-component-diagramCard-secondaryText, var(--st-semantic-text-secondary))",
          "",
        ),
      );
    }
  }
  if (layout.ruleY !== undefined) {
    parts.push(
      `<line class="st-diagramCard-rule" x1="${layout.ruleX1}" x2="${layout.ruleX2}" y1="${layout.ruleY}" y2="${layout.ruleY}" stroke="var(--st-component-diagramCard-rule, var(--st-semantic-border-subtle))" stroke-width="${g.ruleHeight}" vector-effect="non-scaling-stroke"/>`,
    );
  }
  if (layout.footerLines.length > 0) {
    parts.push(
      textLines(
        layout.footerLines,
        "st-diagramCard-footer",
        "var(--st-component-diagramCard-text, var(--st-semantic-text-primary))",
        "",
      ),
    );
  }
  if (layout.toggleBox !== undefined && props.toggle !== undefined) {
    parts.push(toggleGlyph(props.toggle, layout.toggleBox));
  }
  return { content: parts.join(""), layout };
}

/** The +/- toggle glyph in its slot box (card-local coordinates). */
export function toggleGlyph(
  toggle: { collapsed: boolean; label: string },
  box: { x: number; y: number; size: number },
): string {
  const center = box.size / 2;
  const arm = 7;
  const glyph = toggle.collapsed
    ? `<path d="M ${center - arm} ${center} H ${center + arm} M ${center} ${center - arm} V ${center + arm}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`
    : `<path d="M ${center - arm} ${center} H ${center + arm}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`;
  return `<g class="st-diagramCard-toggle" data-toggle="true" data-collapsed="${toggle.collapsed ? "true" : "false"}" transform="translate(${box.x} ${box.y})" color="var(--st-semantic-text-primary)" aria-hidden="true"><title>${escapeXml(toggle.label)}</title><rect width="${box.size}" height="${box.size}" fill="transparent"/>${glyph}</g>`;
}

/**
 * The card render result. Overflow = refusal (owner criterion): when the
 * layout raises `card-overflow` — a too-wide line, a line-count overflow, or
 * a header+body height that does not fit above the pinned rule — the result
 * is `{ kind: "refused" }` with NO `svg`: no normal card is emitted until the
 * content fits. The diagnostics carry the original slot text so the host
 * knows what to shorten. The Svelte `DiagramCard` renders the matching
 * refusal state (`data-card-refused`) on the same predicate — one contract,
 * both renderers.
 */
export type CardSvgResult =
  | {
      readonly kind: "rendered";
      readonly svg: string;
      readonly diagnostics: readonly CardDiagnostic[];
      readonly layout: CardLayout;
    }
  | {
      readonly kind: "refused";
      readonly diagnostics: readonly CardDiagnostic[];
      readonly layout: CardLayout;
    };

/**
 * Render one atomic card as a standalone SVG string. `measure` defaults to
 * the deterministic greedy wrapper; production hosts pass their measured
 * `LineMeasurer` adapter. Returns a refused result (no `svg`) when the
 * content overflows its frozen allocation.
 */
export function renderCardSvg(
  props: DiagramCardProps,
  measure: CardLineMeasure = defaultCardMeasure,
): CardSvgResult {
  const { content, layout } = renderCardContent(props, measure);
  const g = { ...CARD_GEOMETRY, height: layout.box.height };
  const refused = firstOverflowDiagnostic(layout.diagnostics);
  if (refused !== undefined) {
    return { kind: "refused", diagnostics: layout.diagnostics, layout };
  }
  const overflowSlots = layout.diagnostics
    .filter((diagnostic) => diagnostic.code === "card-overflow")
    .map((diagnostic) => diagnostic.slot);
  const unknownIcon = layout.diagnostics.some(
    (diagnostic) => diagnostic.code === "card-icon-unknown",
  );
  const firstOverflow = overflowSlots.length === 0 ? undefined : overflowSlots[0];
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" class="st-diagramCard" data-entity="${escapeXml(props.entityId)}"${props.tone === undefined ? "" : ` data-tone="${escapeXml(props.tone)}"`}${props.proposed === true ? ' data-proposed="true"' : ""}${firstOverflow === undefined ? "" : ` data-card-overflow="${firstOverflow}"`}${unknownIcon ? ` data-card-icon-unknown=""` : ""} width="${g.width}" height="${g.height}" viewBox="0 0 ${g.width} ${g.height}" role="img" aria-label="${escapeXml(props.title)}" style="font-family:${FONT_STACK}">` +
    `<title>${escapeXml(props.title)}</title>` +
    content +
    `</svg>`;
  return {
    kind: "rendered",
    svg,
    diagnostics: layout.diagnostics,
    layout,
  };
}

/**
 * Convenience: project an `EntityPresentation` then render it. Returns
 * `{ kind: "label" }` when the view carries no card presentation for the
 * entity — the host renders a simple label node and no card — and
 * `{ kind: "card", result }` otherwise, where `result` is the refused or
 * rendered `CardSvgResult`.
 */
export function renderCardSvgFromPresentation(
  presentation: CardPresentationInput | undefined,
  opts: { entityId: string; toggle?: DiagramCardProps["toggle"]; measure?: CardLineMeasure },
): { kind: "card"; result: CardSvgResult } | { kind: "label" } {
  const resolved = projectCardProps(presentation, {
    entityId: opts.entityId,
    ...(opts.toggle === undefined ? {} : { toggle: opts.toggle }),
    resolveGlyph: getDiagramGlyph,
  });
  if (resolved.kind !== "card") return { kind: "label" };
  return { kind: "card", result: renderCardSvg(resolved.props, opts.measure) };
}
