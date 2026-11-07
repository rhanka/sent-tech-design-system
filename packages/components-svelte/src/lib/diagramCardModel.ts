/**
 * DiagramCard shared model — geometry, projection and line layout (DC-1).
 *
 * Pure TypeScript, zero imports: the Svelte `DiagramCard` (barrel graph)
 * and the `diagram-render` pure renderer (subpath graph) both consume this
 * module, so it must live outside both subpath directories and import
 * nothing. Glyph path data arrives via props (resolved by the caller from
 * the `diagram-icons` subpath); this module never resolves a glyph name.
 *
 * One geometry source (§5.6): every number below is frozen by
 * spec/SPEC_EVOL_DS_DIAGRAM_CARDS.md §5.3/Appendix A and mirrors
 * - the `diagramCard` component tokens (`packages/tokens/src/component.ts`),
 * - `packages/diagram-canvas/src/layout/measure.ts`
 *   (`FIXED_CARD_WIDTH 460`, `FIXED_CARD_HEIGHT 200`,
 *   `TOGGLE_ALLOCATION 32`, `CONTENT_INSET 16`, `RULE_GAP 4`).
 * The token↔constant agreement test asserts the three sources agree.
 *
 * Line boxes use the kit's 1/64 px grid (`floor(size * 1.3 * 64) / 64`,
 * cf. `frameHeaderContent`): with those boxes the frozen content sums
 * exactly — footer text-box bottom at `198 − 9.25`, rule gaps 4/4 — instead
 * of drifting by fractional pixels (DIF-04).
 */

/** Frozen card geometry, in card pixels (spec §5.3, Appendix A). */
export const CARD_GEOMETRY = {
  width: 460,
  height: 200,
  borderWidth: 2,
  accentWidth: 8,
  padding: 8,
  /** Card left edge → header icon left edge (accent 8 + padding 8). */
  headerInset: 16,
  iconSize: 70,
  iconTextGap: 6,
  kicker: { size: 22, weight: 400, lineHeight: 1.3 },
  title: { size: 32, weight: 700, lineHeight: 1.3 },
  /** Header row → body block. */
  gap: 6,
  body: { size: 24, weight: 400, lineHeight: 1.3 },
  /** Accent-bar left edge → first body glyph. */
  bodyInsetFromBar: 14,
  ruleHeight: 1,
  ruleMargin: 4,
  ruleInsetStart: 16,
  ruleInsetEnd: 10,
  footer: { size: 24, weight: 700, lineHeight: 1.3 },
  /** Footer text-box bottom → inner edge of the bottom border. */
  footerBottomInset: 9.25,
  /** Title/kicker width reservation when the toggle slot is present. */
  toggleAllocation: 32,
  /** Card allocations, frozen-box-derived (see module doc). */
  allocatedLines: { kicker: 1, title: 2, body: 2, footer: 1 },
} as const;

/** Line box height for a size at 1.3, on the 1/64 px grid. */
export function lineBoxHeight(size: number): number {
  return Math.floor(size * 1.3 * 64) / 64;
}

/** Alphabetic baseline inside a line box starting at `top`. */
export function baselineOf(top: number, size: number): number {
  return top + lineBoxHeight(size) - size * 0.25;
}

/** Presentation-shaped input (structural subset of `EntityPresentation`,
 *  `diagram-presentation@1` — no import so this module stays dependency-free). */
export interface CardPresentationInput {
  readonly form: "card" | "container" | "legend" | "legend-key";
  readonly text: {
    readonly title?: string;
    readonly kicker?: string;
    readonly body?: string;
    readonly detail?: string;
    readonly subtitle?: string;
    readonly footer?: string;
  };
  readonly icon?: string;
  readonly categoryRef?: string;
}

/** Resolved glyph path data (structural twin of the `diagram-icons`
 *  registry record — no import so the barrel never resolves that graph). */
export interface DiagramGlyphPaths {
  readonly face: string;
  readonly line?: string;
  readonly darkLine?: true;
  readonly text?: string;
}

export interface DiagramCardToggle {
  readonly collapsed: boolean;
  readonly label: string;
  /**
   * Host wiring (Svelte `DiagramCard` calls it; the static SVG renderer
   * ignores it). Kept on the shared type so both renderers accept the same
   * toggle value.
   */
  readonly onToggle?: () => void;
}

export interface DiagramCardProps {
  readonly entityId: string;
  readonly kicker?: string;
  readonly title: string;
  /** Body lines in order; trailing `detailCount` lines render secondary. */
  readonly body: readonly string[];
  readonly detailCount?: number;
  readonly footer?: string;
  readonly icon?: string;
  readonly iconGlyph?: DiagramGlyphPaths;
  readonly tone?: string;
  readonly toggle?: DiagramCardToggle;
  /**
   * Owner variant: `"center"` centres every text slot horizontally inside its
   * frozen allocation (same 460 × 200 box). Default `"left"`.
   */
  readonly align?: "left" | "center";
  /**
   * Body rendering mode. `"leaf"` (default): left/top-aligned function/detail
   * lines at the body inset. `"subtitle"`: the collapsed-zone subtitle —
   * wrapped at the frozen 396 px measure and centred horizontally and
   * vertically inside the card body area (§6.2.1).
   */
  readonly bodyMode?: "leaf" | "subtitle";
}

export type CardResolveResult =
  | { readonly kind: "card"; readonly props: DiagramCardProps }
  | { readonly kind: "label" };

export interface ProjectCardOptions {
  readonly entityId: string;
  readonly toggle?: DiagramCardToggle;
  readonly resolveGlyph?: (name: string) => DiagramGlyphPaths | undefined;
}

/**
 * Shared `EntityPresentation` → props projection (§4.2), consumed by both
 * renderers. A missing presentation entry (or a non-card form, or no title)
 * resolves to `{ kind: "label" }`: the host renders a simple label node and
 * no card (L-R12). The glyph name maps through the injected resolver, which
 * the `diagram-render` subpath wires to the icon registry; a name with no
 * record yields no glyph and the layout raises `card-icon-unknown`.
 */
export function projectCardProps(
  presentation: CardPresentationInput | undefined,
  opts: ProjectCardOptions,
): CardResolveResult {
  if (presentation === undefined || presentation.form !== "card") return { kind: "label" };
  const title = presentation.text.title ?? "";
  if (title === "") return { kind: "label" };
  const bodyLines: string[] = [];
  if (presentation.text.body !== undefined && presentation.text.body !== "") {
    bodyLines.push(presentation.text.body);
  }
  let detailCount = 0;
  if (presentation.text.detail !== undefined && presentation.text.detail !== "") {
    bodyLines.push(presentation.text.detail);
    detailCount = 1;
  }
  const icon = presentation.icon;
  return {
    kind: "card",
    props: {
      entityId: opts.entityId,
      ...(presentation.text.kicker === undefined || presentation.text.kicker === ""
        ? {}
        : { kicker: presentation.text.kicker }),
      title,
      body: bodyLines,
      ...(detailCount === 0 ? {} : { detailCount }),
      ...(presentation.text.footer === undefined || presentation.text.footer === ""
        ? {}
        : { footer: presentation.text.footer }),
      ...(icon === undefined ? {} : { icon }),
      ...(icon === undefined || opts.resolveGlyph === undefined
        ? {}
        : (() => {
            const glyph = opts.resolveGlyph(icon);
            return glyph === undefined ? {} : { iconGlyph: glyph };
          })()),
      ...(presentation.categoryRef === undefined ? {} : { tone: presentation.categoryRef }),
      ...(opts.toggle === undefined ? {} : { toggle: opts.toggle }),
    },
  };
}

/** Text wrapping injected by the host (the shipped `LineMeasurer` in
 *  production; a deterministic greedy wrapper in tests). `tooWide` is true
 *  when an emitted line exceeds `availableWidth` (typically one unbreakable
 *  word wider than the allocation) — the layout raises `card-overflow` for
 *  it exactly like for a line-count overflow (DC-D4). */
export interface CardMeasuredText {
  readonly lines: readonly string[];
  readonly tooWide: boolean;
}

export type CardLineMeasure = (
  text: string,
  role: "kicker" | "title" | "body" | "footer",
  availableWidth: number,
  allocatedLines: number,
) => CardMeasuredText;

/**
 * Pinned per-character advances at 1 px (data, not code).
 *
 * Source: the pinned kit 'governance-font-metrics.js' (browser-measured
 * Inter 400 advances for body/kicker, Dossier Inter 700 advances for
 * title/footer — the same tables the reference layout wraps against).
 * The DS default measurer consumes them so static strings wrap exactly
 * where the reference wraps; production hosts inject their measured
 * LineMeasurer (Inter-stack advances) instead. Measurer version:
 * 'pinned-kit-1px'. Missing glyphs fall back to 0.6 em.
 */
const CARD_ADVANCES_TITLE: Readonly<Record<string, number>> = {
  "0": 0.67,
  "1": 0.43,
  "2": 0.63,
  "3": 0.65,
  "4": 0.68,
  "5": 0.62,
  "6": 0.65,
  "7": 0.58,
  "8": 0.65,
  "9": 0.65,
  "\n": 0.24,
  " ": 0.24,
  "\"": 0.55,
  "#": 0.65,
  "%": 1.02,
  "&": 0.67,
  "'": 0.34,
  "(": 0.38,
  ")": 0.38,
  "*": 0.56,
  "+": 0.68,
  ",": 0.33,
  "-": 0.47,
  ".": 0.33,
  "/": 0.39,
  ":": 0.33,
  ";": 0.34,
  "<": 0.68,
  "=": 0.68,
  ">": 0.68,
  "@": 1.02,
  "A": 0.75,
  "B": 0.66,
  "C": 0.74,
  "D": 0.72,
  "E": 0.61,
  "F": 0.59,
  "G": 0.75,
  "H": 0.75,
  "I": 0.28,
  "J": 0.58,
  "K": 0.72,
  "L": 0.57,
  "M": 0.93,
  "N": 0.76,
  "O": 0.77,
  "P": 0.65,
  "Q": 0.78,
  "R": 0.66,
  "S": 0.65,
  "T": 0.67,
  "U": 0.73,
  "V": 0.75,
  "W": 1.04,
  "X": 0.74,
  "Y": 0.73,
  "Z": 0.66,
  "[": 0.38,
  "\\": 0.39,
  "]": 0.38,
  "_": 0.48,
  "a": 0.58,
  "b": 0.63,
  "c": 0.59,
  "d": 0.63,
  "e": 0.6,
  "f": 0.4,
  "g": 0.63,
  "h": 0.62,
  "i": 0.27,
  "j": 0.27,
  "k": 0.58,
  "l": 0.27,
  "m": 0.91,
  "n": 0.62,
  "o": 0.61,
  "p": 0.63,
  "q": 0.63,
  "r": 0.41,
  "s": 0.56,
  "t": 0.37,
  "u": 0.62,
  "v": 0.6,
  "w": 0.85,
  "x": 0.58,
  "y": 0.6,
  "z": 0.57,
  "{": 0.47,
  "}": 0.47,
  "§": 0.57,
  "«": 0.66,
  "·": 0.33,
  "»": 0.66,
  "À": 0.75,
  "Ç": 0.74,
  "È": 0.61,
  "É": 0.61,
  "×": 0.68,
  "à": 0.58,
  "â": 0.58,
  "ç": 0.59,
  "è": 0.6,
  "é": 0.6,
  "ê": 0.6,
  "î": 0.27,
  "ô": 0.61,
  "ù": 0.62,
  "–": 0.5,
  "’": 0.31,
  "\u2026": 1,
  "→": 1,
  "↔": 1,
  "≠": 0.83203,
  "≥": 0.83203
};
const CARD_ADVANCES_BODY: Readonly<Record<string, number>> = {
  "0": 0.59961,
  "1": 0.59961,
  "2": 0.59961,
  "3": 0.59961,
  "4": 0.59961,
  "5": 0.59961,
  "6": 0.59961,
  "7": 0.59961,
  "8": 0.59961,
  "9": 0.59961,
  "\n": 0.2998,
  " ": 0.2998,
  "\"": 0.45996,
  "#": 0.59961,
  "%": 0.69922,
  "&": 0.67969,
  "'": 0.2998,
  "(": 0.2998,
  ")": 0.2998,
  "*": 0.59961,
  "+": 0.59961,
  ",": 0.2998,
  "-": 0.2998,
  ".": 0.2998,
  "/": 0.51953,
  ":": 0.2998,
  ";": 0.2998,
  "<": 0.59961,
  "=": 0.59961,
  ">": 0.59961,
  "@": 0.7998,
  "A": 0.55957,
  "B": 0.61914,
  "C": 0.61914,
  "D": 0.65918,
  "E": 0.55957,
  "F": 0.47949,
  "G": 0.65918,
  "H": 0.65918,
  "I": 0.25977,
  "J": 0.39941,
  "K": 0.61914,
  "L": 0.5,
  "M": 0.81934,
  "N": 0.65918,
  "O": 0.65918,
  "P": 0.55957,
  "Q": 0.65918,
  "R": 0.61914,
  "S": 0.61914,
  "T": 0.5,
  "U": 0.63965,
  "V": 0.55957,
  "W": 0.81934,
  "X": 0.53906,
  "Y": 0.55957,
  "Z": 0.53906,
  "[": 0.2998,
  "\\": 0.51953,
  "]": 0.2998,
  "_": 0.5,
  "a": 0.53906,
  "b": 0.53906,
  "c": 0.47949,
  "d": 0.53906,
  "e": 0.53906,
  "f": 0.2998,
  "g": 0.5,
  "h": 0.53906,
  "i": 0.23926,
  "j": 0.21973,
  "k": 0.5,
  "l": 0.23926,
  "m": 0.81934,
  "n": 0.53906,
  "o": 0.53906,
  "p": 0.53906,
  "q": 0.53906,
  "r": 0.31934,
  "s": 0.51953,
  "t": 0.31934,
  "u": 0.53906,
  "v": 0.43945,
  "w": 0.65918,
  "x": 0.43945,
  "y": 0.41992,
  "z": 0.41992,
  "{": 0.2998,
  "}": 0.2998,
  "§": 0.59961,
  "«": 0.39941,
  "·": 0.23926,
  "»": 0.39941,
  "À": 0.55957,
  "Ç": 0.61914,
  "È": 0.55957,
  "É": 0.55957,
  "×": 0.59961,
  "à": 0.53906,
  "â": 0.53906,
  "ç": 0.47949,
  "è": 0.53906,
  "é": 0.53906,
  "ê": 0.53906,
  "î": 0.23926,
  "ô": 0.53906,
  "ù": 0.53906,
  "–": 0.55566,
  "’": 0.22168,
  "\u2026": 1,
  "→": 1,
  "↔": 1,
  "≠": 0.83203,
  "≥": 0.83203
};

/**
 * Deterministic greedy word wrapper over the pinned per-character advances.
 * Production hosts inject their measured ‘LineMeasurer’; tests and
 * static strings use this. Corpus fixtures wrap exactly where the reference
 * wraps; overflow fixtures overflow under every metric.
 */
export function defaultCardMeasure(
  text: string,
  role: "kicker" | "title" | "body" | "footer",
  availableWidth: number,
): CardMeasuredText {
  const size = role === "kicker" ? 22 : role === "title" ? 32 : 24;
  const table = role === "title" || role === "footer" ? CARD_ADVANCES_TITLE : CARD_ADVANCES_BODY;
  const advance = (word: string): number => {
    let total = 0;
    for (const char of word) total += table[char] ?? 0.6;
    return total * size;
  };
  const lines: string[] = [];
  let tooWide = false;
  for (const word of String(text).split(/\s+/).filter(Boolean)) {
    if (advance(word) > availableWidth) tooWide = true;
    const candidate = lines.length === 0 ? word : `${lines[lines.length - 1]} ${word}`;
    if (lines.length > 0 && advance(candidate) <= availableWidth) {
      lines[lines.length - 1] = candidate;
    } else {
      lines.push(word);
    }
    if (advance(lines[lines.length - 1]) > availableWidth) tooWide = true;
  }
  return { lines, tooWide };
}

export interface LaidOutLine {
  readonly text: string;
  /** Anchor x: start edge for `"start"`, centre for `"middle"` (align variant). */
  readonly x: number;
  readonly baseline: number;
  readonly size: number;
  readonly weight: number;
  readonly secondary: boolean;
  readonly anchor: "start" | "middle";
}

export interface CardDiagnostic {
  readonly code: "card-overflow" | "card-icon-unknown";
  readonly slot: string;
  readonly entityId: string;
  readonly neededPx: number;
  readonly allocatedPx: number;
}

export interface CardLayout {
  readonly box: { readonly width: number; readonly height: number };
  readonly contentTop: number;
  readonly contentRight: number;
  readonly iconBox?: { readonly x: number; readonly y: number; readonly size: number };
  readonly headerTextX: number;
  readonly headerTextWidth: number;
  readonly kicker: readonly LaidOutLine[];
  readonly title: readonly LaidOutLine[];
  readonly headerBlockHeight: number;
  readonly bodyX: number;
  readonly bodyWidth: number;
  /** Body allocation: vertical centring reference in `subtitle` body mode (§6.2.1). */
  readonly bodyArea: { readonly top: number; readonly bottom: number };
  readonly body: readonly LaidOutLine[];
  readonly bodyBottom: number;
  /** Present only when `footer` is set: exactly one rule (§5.4, DH-04). */
  readonly ruleY?: number;
  readonly ruleX1: number;
  readonly ruleX2: number;
  readonly footerLine?: LaidOutLine;
  /** Footer text-box bottom (pinned at `height − border − 9.25`). */
  readonly footerBottom: number;
  readonly toggleBox?: { readonly x: number; readonly y: number; readonly size: number };
  readonly diagnostics: readonly CardDiagnostic[];
}

/**
 * Lay out one card: wrap every slot against its frozen allocation, position
 * every line, pin the footer, emit diagnostics. Never truncates or clips
 * (DC-D4): over-long slots render completely, keep the 460 × 200 box, and
 * raise `card-overflow`; an icon name with no glyph data raises
 * `card-icon-unknown` and the slot collapses.
 */
export function layoutCard(props: DiagramCardProps, measure: CardLineMeasure): CardLayout {
  const g = CARD_GEOMETRY;
  const diagnostics: CardDiagnostic[] = [];
  const align = props.align ?? "left";
  const bodyMode = props.bodyMode ?? "leaf";
  const contentTop = g.borderWidth + g.padding;
  const contentRight = g.width - g.borderWidth - g.padding;
  // The icon slot collapses when the glyph is missing (DIF-14): the header
  // text then starts at the content inset and no space is reserved.
  const hasIcon = props.icon !== undefined && props.iconGlyph !== undefined;
  const headerTextX = hasIcon ? g.headerInset + g.iconSize + g.iconTextGap : g.headerInset;
  const toggle = props.toggle !== undefined;
  const headerTextWidth = (toggle ? contentRight - g.toggleAllocation : contentRight) - headerTextX;
  const headerAnchor: "start" | "middle" = align === "center" ? "middle" : "start";
  const headerLineX = align === "center" ? headerTextX + headerTextWidth / 2 : headerTextX;

  const iconBox = hasIcon ? { x: g.headerInset, y: contentTop, size: g.iconSize } : undefined;
  if (props.icon !== undefined && props.iconGlyph === undefined) {
    diagnostics.push({
      code: "card-icon-unknown",
      slot: "icon",
      entityId: props.entityId,
      neededPx: 1,
      allocatedPx: 0,
    });
  }

  const kickerHeight = lineBoxHeight(g.kicker.size);
  const titleHeight = lineBoxHeight(g.title.size);
  const kickerResult =
    props.kicker === undefined
      ? undefined
      : measure(props.kicker, "kicker", headerTextWidth, g.allocatedLines.kicker);
  const kickerTexts = kickerResult === undefined ? [] : [...kickerResult.lines];
  const kickerMeasured = kickerResult;
  if (kickerTexts.length > g.allocatedLines.kicker || kickerMeasured?.tooWide === true) {
    diagnostics.push({
      code: "card-overflow",
      slot: "kicker",
      entityId: props.entityId,
      neededPx: kickerTexts.length * kickerHeight,
      allocatedPx: g.allocatedLines.kicker * kickerHeight,
    });
  }
  const titleMeasured = measure(props.title, "title", headerTextWidth, g.allocatedLines.title);
  const titleTexts = [...titleMeasured.lines];
  if (titleTexts.length > g.allocatedLines.title || titleMeasured.tooWide) {
    diagnostics.push({
      code: "card-overflow",
      slot: "title",
      entityId: props.entityId,
      neededPx: titleTexts.length * titleHeight,
      allocatedPx: g.allocatedLines.title * titleHeight,
    });
  }
  const headerContentHeight =
    (props.kicker === undefined ? 0 : kickerHeight) + titleTexts.length * titleHeight;
  const headerBlockHeight = Math.max(g.iconSize, headerContentHeight);
  const textTop = contentTop + (headerBlockHeight - headerContentHeight) / 2;

  const bodyHeight = lineBoxHeight(g.body.size);
  const bodyY = contentTop + headerBlockHeight + g.gap;
  // bodyInsetFromBar measures accent-bar edge → first glyph (14). The accent
  // bar occupies the card's left edge, so the body x is the token value
  // itself — 2 px left of the header icon edge (16). In `subtitle` body mode
  // (collapsed zone, §6.2.1) the body is the centred subtitle: wrapped at the
  // frozen 396 px measure (width − 2 × (collapsedInset + marginInline)).
  const subtitleMode = bodyMode === "subtitle";
  const subtitleMeasure =
    g.width - 2 * (ZONE_GEOMETRY.collapsedInset + ZONE_GEOMETRY.collapsedSubtitleMarginInline);
  const bodyTextX = subtitleMode ? (g.width - subtitleMeasure) / 2 : g.bodyInsetFromBar;
  const bodyWidth = subtitleMode ? subtitleMeasure : contentRight - bodyTextX;
  const bodyAnchor: "start" | "middle" =
    subtitleMode || align === "center" ? "middle" : "start";
  const bodyLineX = bodyAnchor === "middle" ? bodyTextX + bodyWidth / 2 : bodyTextX;
  const wrappedBody: string[] = [];
  let bodyTooWide = false;
  for (const line of props.body) {
    const measured = measure(line, "body", bodyWidth, g.allocatedLines.body);
    wrappedBody.push(...measured.lines);
    bodyTooWide = bodyTooWide || measured.tooWide;
  }
  if (wrappedBody.length > g.allocatedLines.body || bodyTooWide) {
    diagnostics.push({
      code: "card-overflow",
      slot: subtitleMode ? "collapsed-subtitle" : "body",
      entityId: props.entityId,
      neededPx: wrappedBody.length * bodyHeight,
      allocatedPx: g.allocatedLines.body * bodyHeight,
    });
  }
  const footerHeight = lineBoxHeight(g.footer.size);
  const footerBottom = g.height - g.borderWidth - g.footerBottomInset;
  const footerTopPinned = footerBottom - footerHeight;
  // Rule pinned to the footer when present (§5.4): rule → footer gap is
  // always ruleMargin; at the canonical two-line body the body → rule gap
  // is ruleMargin as well (4/4). No footer: no rule (DH-04).
  const ruleY = props.footer === undefined ? undefined : footerTopPinned - g.ruleHeight - g.ruleMargin;
  const bodyAreaBottom =
    ruleY === undefined ? g.height - g.borderWidth - g.padding : ruleY - g.ruleMargin;
  // Subtitle mode centres the line block vertically inside the body area
  // (§6.2.1); leaf lines stay top-aligned (§5.2).
  const bodyBlockTop = subtitleMode
    ? bodyY + Math.max(0, (bodyAreaBottom - bodyY - wrappedBody.length * bodyHeight) / 2)
    : bodyY;
  const detailStart = wrappedBody.length - (props.detailCount ?? 0);
  const body: LaidOutLine[] = wrappedBody.map((text, index) => ({
    text,
    x: bodyLineX,
    baseline: baselineOf(bodyBlockTop + index * bodyHeight, g.body.size),
    size: g.body.size,
    weight: g.body.weight,
    secondary: !subtitleMode && index >= detailStart && (props.detailCount ?? 0) > 0,
    anchor: bodyAnchor,
  }));
  const bodyBottom = bodyY + wrappedBody.length * bodyHeight;

  let footerLine: LaidOutLine | undefined;
  if (props.footer !== undefined) {
    const footerWidth = subtitleMode ? contentRight - g.headerInset : bodyWidth;
    const footerMeasured = measure(props.footer, "footer", footerWidth, g.allocatedLines.footer);
    const footerTexts = [...footerMeasured.lines];
    if (footerTexts.length > g.allocatedLines.footer || footerMeasured.tooWide) {
      diagnostics.push({
        code: "card-overflow",
        slot: "footer",
        entityId: props.entityId,
        neededPx: footerTexts.length * footerHeight,
        allocatedPx: g.allocatedLines.footer * footerHeight,
      });
    }
    const footerAnchor: "start" | "middle" = align === "center" ? "middle" : "start";
    footerLine = {
      text: footerTexts.join(" "),
      x: footerAnchor === "middle" ? g.headerInset + footerWidth / 2 : g.headerInset,
      baseline: baselineOf(footerTopPinned, g.footer.size),
      size: g.footer.size,
      weight: g.footer.weight,
      secondary: false,
      anchor: footerAnchor,
    };
  }

  const kicker: LaidOutLine[] = kickerTexts.map((text, index) => ({
    text,
    x: headerLineX,
    baseline: baselineOf(textTop + index * kickerHeight, g.kicker.size),
    size: g.kicker.size,
    weight: g.kicker.weight,
    secondary: true,
    anchor: headerAnchor,
  }));
  const titleTop = textTop + (props.kicker === undefined ? 0 : kickerHeight);
  const title: LaidOutLine[] = titleTexts.map((text, index) => ({
    text,
    x: headerLineX,
    baseline: baselineOf(titleTop + index * titleHeight, g.title.size),
    size: g.title.size,
    weight: g.title.weight,
    secondary: false,
    anchor: headerAnchor,
  }));

  // Toggle slot: top right of the content box with the card's own margins
  // (hrpn folded-card placement, y = content top = 10 at the frozen values).
  const toggleBox =
    props.toggle === undefined
      ? undefined
      : {
          x: contentRight - g.toggleAllocation,
          y: contentTop,
          size: g.toggleAllocation,
        };

  return {
    box: { width: g.width, height: g.height },
    contentTop,
    contentRight,
    ...(iconBox === undefined ? {} : { iconBox }),
    headerTextX,
    headerTextWidth,
    kicker,
    title,
    headerBlockHeight,
    bodyX: bodyTextX,
    bodyWidth,
    bodyArea: { top: bodyY, bottom: bodyAreaBottom },
    body,
    bodyBottom,
    ...(ruleY === undefined ? {} : { ruleY }),
    ruleX1: g.ruleInsetStart,
    ruleX2: g.width - g.ruleInsetEnd,
    ...(footerLine === undefined ? {} : { footerLine }),
    footerBottom,
    ...(toggleBox === undefined ? {} : { toggleBox }),
    diagnostics,
  };
}

/* ------------------------------------------------------------------ *
 * DC-2 static half — the wrapping card `DiagramZone` (spec §6).      *
 * Same module, same rules: zero imports, one geometry source.        *
 * ------------------------------------------------------------------ */

/**
 * Frozen zone geometry (spec §6.4). Mirrors the `diagramZone` component
 * tokens (`packages/tokens/src/component.ts`) and the `diagram-canvas`
 * `measure.ts` constants (`CONTENT_INSET 16`, `RULE_GAP 4`,
 * `SUBTITLE_TO_RULE_GAP 4`, `RULE_TO_FIRST_CHILD_GAP 16`,
 * `LAST_CHILD_TO_BOTTOM_GAP 16`, `TOGGLE_ALLOCATION 32`,
 * `FIXED_CARD_WIDTH 460`, `FIXED_CARD_HEIGHT 200`); the token↔constant
 * agreement test asserts the three sources agree.
 */
export const ZONE_GEOMETRY = {
  radius: 0,
  borderWidth: 1.5,
  headerInset: 16,
  iconSize: 70,
  iconTextGap: 6,
  kicker: { size: 22, weight: 400, lineHeight: 1.3 },
  title: { size: 32, weight: 700, lineHeight: 1.3 },
  subtitle: { size: 24, weight: 400, lineHeight: 1.3 },
  /** Rendered title → subtitle gap: alias of the card `gap` (§6.4). */
  subtitleGap: CARD_GEOMETRY.gap,
  headerRuleGap: 4,
  contentInsetTop: 16,
  contentInsetBottom: 16,
  contentInsetInline: 16,
  ruleHeight: 1,
  ruleMargin: CARD_GEOMETRY.ruleMargin,
  ruleInsetStart: 16,
  ruleInsetEnd: 10,
  toggleAllocation: 32,
  collapsedWidth: 460,
  collapsedHeight: 200,
  collapsedInset: 16,
  collapsedSubtitleMarginInline: 16,
  allocatedLines: { kicker: 1, title: 2, subtitle: 2 },
} as const;

/** Centred collapsed-subtitle measure (§6.2.1): 460 − 2 × (16 + 16). */
export const COLLAPSED_SUBTITLE_MEASURE =
  ZONE_GEOMETRY.collapsedWidth -
  2 * (ZONE_GEOMETRY.collapsedInset + ZONE_GEOMETRY.collapsedSubtitleMarginInline);

export interface DiagramZoneToggle {
  readonly collapsed: boolean;
  readonly label: string;
  readonly onToggle?: () => void;
}

export interface DiagramZoneProps {
  readonly entityId: string;
  readonly kicker?: string;
  readonly title: string;
  readonly subtitle?: string;
  /** Collapsed card only (§6.1): rule + pinned footer as a leaf card. */
  readonly footer?: string;
  readonly icon?: string;
  readonly iconGlyph?: DiagramGlyphPaths;
  readonly tone?: string;
  readonly collapsed: boolean;
  readonly toggleLabel?: string;
  /** Owner variant: `"center"` centres every text slot, both states. */
  readonly align?: "left" | "center";
  /**
   * Occurrence box supplied by the host layout (§6.1: the component paints
   * around the box it is given). Collapsed, the box is the frozen
   * 460 × 200 card; expanded, `width`/`height` size the frame.
   */
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
}

/**
 * Collapsed-zone → atomic-card props mapping (§6.2 field table): the
 * subtitle becomes the centred body (`bodyMode: "subtitle"`), the footer
 * pins the rule, the toggle takes the top-right slot. Shared by
 * `layoutZone` and both renderers so the collapsed zone is the card.
 */
export function zoneCollapsedCardProps(props: DiagramZoneProps): DiagramCardProps {
  return {
    entityId: props.entityId,
    ...(props.kicker === undefined ? {} : { kicker: props.kicker }),
    title: props.title,
    body: props.subtitle === undefined || props.subtitle === "" ? [] : [props.subtitle],
    ...(props.footer === undefined ? {} : { footer: props.footer }),
    ...(props.icon === undefined ? {} : { icon: props.icon }),
    ...(props.iconGlyph === undefined ? {} : { iconGlyph: props.iconGlyph }),
    ...(props.tone === undefined ? {} : { tone: props.tone }),
    ...(props.toggleLabel === undefined
      ? {}
      : { toggle: { collapsed: true, label: props.toggleLabel } }),
    ...(props.align === undefined ? {} : { align: props.align }),
    bodyMode: "subtitle",
  };
}

export interface ZoneDiagnostic {
  readonly code: "zone-overflow" | "zone-icon-unknown";
  readonly slot: string;
  readonly entityId: string;
  readonly neededPx: number;
  readonly allocatedPx: number;
}

export interface ZoneChildSpec {
  readonly kind: "card" | "zone";
  readonly x: number;
  readonly y: number;
  readonly card?: DiagramCardProps;
  readonly zone?: DiagramZoneProps;
  readonly children?: readonly ZoneChildSpec[];
}

export interface ZoneLayout {
  readonly box: { readonly x: number; readonly y: number; readonly width: number; readonly height: number };
  readonly collapsed: boolean;
  /** Collapsed: the card layout of the folded card (same geometry source). */
  readonly card?: CardLayout;
  /** Expanded: header + rule geometry inside the frame. */
  readonly header?: {
    readonly iconBox?: { readonly x: number; readonly y: number; readonly size: number } | undefined;
    readonly headerTextX: number;
    readonly headerTextWidth: number;
    readonly kicker: readonly LaidOutLine[];
    readonly title: readonly LaidOutLine[];
    readonly headerBlockHeight: number;
    readonly subtitle: readonly LaidOutLine[];
    readonly subtitleBottom: number;
    readonly ruleY: number;
    readonly contentTop: number;
    readonly toggleBox?: { readonly x: number; readonly y: number; readonly size: number } | undefined;
  };
  readonly diagnostics: readonly ZoneDiagnostic[];
}

/**
 * Lay out one zone. Collapsed, the zone IS the atomic card (§6.2): the
 * subtitle wraps at the frozen 396 px measure and centres in the card body
 * area (`bodyMode: "subtitle"`), the footer pins the rule, and the toggle
 * takes the top-right slot. Expanded, the frame carries the shared header
 * (icon 70 at the 16 px inset, text at x + 92), the subtitle under the
 * icon from the left inset, the header rule 4 px under the subtitle (or
 * the header block), and the content box 16 px under the rule.
 */
export function layoutZone(
  props: DiagramZoneProps,
  measure: CardLineMeasure,
  children: readonly ZoneChildSpec[] = [],
): ZoneLayout {
  const g = ZONE_GEOMETRY;
  const x = props.x ?? 0;
  const y = props.y ?? 0;
  const diagnostics: ZoneDiagnostic[] = [];

  if (props.collapsed) {
    const card = layoutCard(zoneCollapsedCardProps(props), measure);
    for (const diagnostic of card.diagnostics) {
      diagnostics.push({
        code: diagnostic.code === "card-icon-unknown" ? "zone-icon-unknown" : "zone-overflow",
        slot: diagnostic.slot,
        entityId: diagnostic.entityId,
        neededPx: diagnostic.neededPx,
        allocatedPx: diagnostic.allocatedPx,
      });
    }
    return {
      box: { x, y, width: g.collapsedWidth, height: g.collapsedHeight },
      collapsed: true,
      card,
      diagnostics,
    };
  }

  // Expanded frame.
  const width = props.width ?? g.collapsedWidth;
  const contentRight = x + width - g.contentInsetInline;
  const hasIcon = props.icon !== undefined && props.iconGlyph !== undefined;
  const headerTextX = hasIcon ? x + g.headerInset + g.iconSize + g.iconTextGap : x + g.headerInset;
  const headerTextWidth = contentRight - g.toggleAllocation - headerTextX;
  const align = props.align ?? "left";
  const headerAnchor: "start" | "middle" = align === "center" ? "middle" : "start";
  const headerLineX = align === "center" ? headerTextX + headerTextWidth / 2 : headerTextX;

  if (props.icon !== undefined && props.iconGlyph === undefined) {
    diagnostics.push({
      code: "zone-icon-unknown",
      slot: "icon",
      entityId: props.entityId,
      neededPx: 1,
      allocatedPx: 0,
    });
  }

  const kickerHeight = lineBoxHeight(g.kicker.size);
  const titleHeight = lineBoxHeight(g.title.size);
  const subtitleHeight = lineBoxHeight(g.subtitle.size);
  const kickerResult =
    props.kicker === undefined
      ? undefined
      : measure(props.kicker, "kicker", headerTextWidth, g.allocatedLines.kicker);
  const kickerTexts = kickerResult === undefined ? [] : [...kickerResult.lines];
  if (kickerTexts.length > g.allocatedLines.kicker || kickerResult?.tooWide === true) {
    diagnostics.push({
      code: "zone-overflow",
      slot: "kicker",
      entityId: props.entityId,
      neededPx: kickerTexts.length * kickerHeight,
      allocatedPx: g.allocatedLines.kicker * kickerHeight,
    });
  }
  const titleMeasured = measure(props.title, "title", headerTextWidth, g.allocatedLines.title);
  const titleTexts = [...titleMeasured.lines];
  if (titleTexts.length > g.allocatedLines.title || titleMeasured.tooWide) {
    diagnostics.push({
      code: "zone-overflow",
      slot: "title",
      entityId: props.entityId,
      neededPx: titleTexts.length * titleHeight,
      allocatedPx: g.allocatedLines.title * titleHeight,
    });
  }
  const headerContentHeight =
    (props.kicker === undefined ? 0 : kickerHeight) + titleTexts.length * titleHeight;
  const headerBlockHeight = Math.max(g.iconSize, headerContentHeight);
  const headerTop = y + g.headerInset;
  const textTop = headerTop + (headerBlockHeight - headerContentHeight) / 2;

  const iconBox = hasIcon
    ? { x: x + g.headerInset, y: headerTop + (headerBlockHeight - g.iconSize) / 2, size: g.iconSize }
    : undefined;

  const kicker: LaidOutLine[] = kickerTexts.map((text, index) => ({
    text,
    x: headerLineX,
    baseline: baselineOf(textTop + index * kickerHeight, g.kicker.size),
    size: g.kicker.size,
    weight: g.kicker.weight,
    secondary: true,
    anchor: headerAnchor,
  }));
  const titleTop = textTop + (props.kicker === undefined ? 0 : kickerHeight);
  const title: LaidOutLine[] = titleTexts.map((text, index) => ({
    text,
    x: headerLineX,
    baseline: baselineOf(titleTop + index * titleHeight, g.title.size),
    size: g.title.size,
    weight: g.title.weight,
    secondary: false,
    anchor: headerAnchor,
  }));

  // Subtitle wraps under the icon from the left inset at x + 16 (§6.2).
  const subtitleX = x + g.headerInset;
  const subtitleWidth = x + width - g.contentInsetInline - subtitleX;
  const subtitleAnchor: "start" | "middle" = align === "center" ? "middle" : "start";
  const subtitleLineX = align === "center" ? subtitleX + subtitleWidth / 2 : subtitleX;
  const subtitleMeasured =
    props.subtitle === undefined || props.subtitle === ""
      ? { lines: [] as string[], tooWide: false }
      : measure(props.subtitle, "body", subtitleWidth, g.allocatedLines.subtitle);
  const subtitleTexts = [...subtitleMeasured.lines];
  if (subtitleTexts.length > g.allocatedLines.subtitle || subtitleMeasured.tooWide) {
    diagnostics.push({
      code: "zone-overflow",
      slot: "subtitle",
      entityId: props.entityId,
      neededPx: subtitleTexts.length * subtitleHeight,
      allocatedPx: g.allocatedLines.subtitle * subtitleHeight,
    });
  }
  const subtitleTop = headerTop + headerBlockHeight + g.subtitleGap;
  const subtitle: LaidOutLine[] = subtitleTexts.map((text, index) => ({
    text,
    x: subtitleLineX,
    baseline: baselineOf(subtitleTop + index * subtitleHeight, g.subtitle.size),
    size: g.subtitle.size,
    weight: g.subtitle.weight,
    secondary: false,
    anchor: subtitleAnchor,
  }));
  const subtitleBottom = subtitleTop + subtitleTexts.length * subtitleHeight;

  // Header rule 4 px under the subtitle last line, or under the header
  // block when there is no subtitle (§6.2, §6.4 headerRuleGap).
  const ruleY =
    subtitleTexts.length > 0
      ? subtitleBottom + g.headerRuleGap
      : headerTop + headerBlockHeight + g.headerRuleGap;
  const contentTop = ruleY + g.contentInsetTop;

  // Frame height: the supplied box, or content + bottom inset when the
  // host lets the zone size itself around its children.
  const childrenBottom = children.reduce(
    (bottom, child) => Math.max(bottom, child.y + (child.kind === "card" ? CARD_GEOMETRY.height : (child.zone?.height ?? ZONE_GEOMETRY.collapsedHeight))),
    y,
  );
  const height = props.height ?? Math.max(g.collapsedHeight, childrenBottom + g.contentInsetBottom - y);

  const toggleBox =
    props.toggleLabel === undefined
      ? undefined
      : { x: contentRight - g.toggleAllocation, y: headerTop, size: g.toggleAllocation };

  return {
    box: { x, y, width, height },
    collapsed: false,
    header: {
      ...(iconBox === undefined ? {} : { iconBox }),
      headerTextX,
      headerTextWidth,
      kicker,
      title,
      headerBlockHeight,
      subtitle,
      subtitleBottom,
      ruleY,
      contentTop,
      ...(toggleBox === undefined ? {} : { toggleBox }),
    },
    diagnostics,
  };
}

/** Presentation-shaped zone input (structural subset of `EntityPresentation`). */
export interface ZonePresentationInput {
  readonly form: "card" | "container" | "legend" | "legend-key";
  readonly text: {
    readonly title?: string;
    readonly kicker?: string;
    readonly subtitle?: string;
    readonly footer?: string;
  };
  readonly icon?: string;
  readonly categoryRef?: string;
}

export type ZoneResolveResult =
  | { readonly kind: "zone"; readonly props: DiagramZoneProps }
  | { readonly kind: "label" };

export interface ProjectZoneOptions {
  readonly entityId: string;
  readonly collapsed: boolean;
  readonly toggleLabel?: string;
  readonly align?: "left" | "center";
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly resolveGlyph?: (name: string) => DiagramGlyphPaths | undefined;
}

/**
 * Shared `EntityPresentation` → zone props projection (§4.2/§6.1): container
 * and legend forms resolve to a zone; a missing entry or no title resolves
 * to `{ kind: "label" }` (L-R12).
 */
export function projectZoneProps(
  presentation: ZonePresentationInput | undefined,
  opts: ProjectZoneOptions,
): ZoneResolveResult {
  if (
    presentation === undefined ||
    (presentation.form !== "container" && presentation.form !== "legend")
  ) {
    return { kind: "label" };
  }
  const title = presentation.text.title ?? "";
  if (title === "") return { kind: "label" };
  const icon = presentation.icon;
  return {
    kind: "zone",
    props: {
      entityId: opts.entityId,
      ...(presentation.text.kicker === undefined || presentation.text.kicker === ""
        ? {}
        : { kicker: presentation.text.kicker }),
      title,
      ...(presentation.text.subtitle === undefined || presentation.text.subtitle === ""
        ? {}
        : { subtitle: presentation.text.subtitle }),
      ...(presentation.text.footer === undefined || presentation.text.footer === ""
        ? {}
        : { footer: presentation.text.footer }),
      ...(icon === undefined ? {} : { icon }),
      ...(icon === undefined || opts.resolveGlyph === undefined
        ? {}
        : (() => {
            const glyph = opts.resolveGlyph(icon);
            return glyph === undefined ? {} : { iconGlyph: glyph };
          })()),
      ...(presentation.categoryRef === undefined ? {} : { tone: presentation.categoryRef }),
      collapsed: opts.collapsed,
      ...(opts.toggleLabel === undefined ? {} : { toggleLabel: opts.toggleLabel }),
      ...(opts.align === undefined ? {} : { align: opts.align }),
      ...(opts.x === undefined ? {} : { x: opts.x }),
      ...(opts.y === undefined ? {} : { y: opts.y }),
      ...(opts.width === undefined ? {} : { width: opts.width }),
      ...(opts.height === undefined ? {} : { height: opts.height }),
    },
  };
}
