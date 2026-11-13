import { getDiagramGlyph } from "./registry.js";
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
 *   `TOGGLE_ALLOCATION 66`, `CONTENT_INSET 16`, `RULE_GAP 4`).
 * The token↔constant agreement test asserts the sources agree.
 *
 * Line boxes use the kit's 1/64 px grid (`floor(size * 1.3 * 64) / 64`,
 * cf. `frameHeaderContent`): with those boxes the frozen content sums
 * exactly — footer text-box bottom at `198 − 9.25`, rule gaps 4/4 — instead
 * of drifting by fractional pixels (DIF-04). Text baselines follow the
 * kit's glyph bounds: a 24 px role sits 22 px above its baseline, the
 * 22 px kicker and the 32 px title at their own size (cf. the frozen SVG:
 * kicker baseline `headerY + 16 + 22`, title `+ 32`, subtitle `+ 22`).
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
  kicker: { size: 22, weight: 400, lineHeight: 1.3, letterSpacingEm: 0.04 },
  title: { size: 32, weight: 700, lineHeight: 1.3 },
  /** Header row → body block. */
  gap: 6,
  body: { size: 24, weight: 400, lineHeight: 1.3 },
  /**
   * Edge-label text (BF-6): 18px so one line plus margins fits the 32px
   * gutter cap (22 + 2 × 4 = 30 ≤ 32). Mirrors the
   * `diagramScene.edgeLabelFontSize` / `edgeLabelLineHeight` tokens;
   * additive, frozen card sizes unchanged.
   */
  edgeLabel: { size: 18, weight: 400, lineHeight: 22 / 18 },
  /** Accent-bar left edge → first body glyph. */
  bodyInsetFromBar: 14,
  ruleHeight: 1,
  ruleMargin: 4,
  ruleInsetStart: 16,
  ruleInsetEnd: 10,
  footer: { size: 24, weight: 700, lineHeight: 1.3 },
  /** Footer text-box bottom → inner edge of the bottom border. */
  footerBottomInset: 9.25,
  /**
   * Title/kicker width reservation when the toggle slot is present
   * (hrpn tints.css `header { padding-right: 66px }`: the 66 px the +/−
   * control needs in the header's inline-end).
   */
  toggleAllocation: 66,
  /** The toggle slot box itself: the 32 px DS IconButton (sm) square. */
  toggleBoxSize: 32,
  toggleInset: 8,
  /**
   * Header text width of a folded card (toggle present, icon present):
   * the owner-pinned 290 px — the hrpn folded-card title width
   * (356 − 66 = 290). Plain cards keep `contentRight − headerTextX`
   * (358 px with the icon).
   */
  foldedHeaderTextWidth: 290,
  /** Card allocations, frozen-box-derived (see module doc). */
  allocatedLines: { kicker: 1, title: 2, body: 2, footer: 1 },
} as const;

/**
 * Edge label typography (DC-2a, tokens `diagramScene.edgeLabelFontSize` /
 * `diagramScene.edgeLabelLineHeight`): 18 px on a 22 px line box. One line
 * plus the engine's two 4 px label margins is 30 px, inside the 32 px sibling
 * gap cap; at the 0.45 readability floor it renders at 8.1 CSS px.
 */
export const EDGE_LABEL_GEOMETRY = { size: 18, weight: 400, lineHeight: 22 } as const;

/** Line box height for a size at 1.3, on the 1/64 px grid. */
export function lineBoxHeight(size: number): number {
  return Math.floor(size * 1.3 * 64) / 64;
}

/**
 * Alphabetic baseline inside a line box starting at `top`, per the kit's
 * glyph bounds: 24 px roles (body/subtitle/footer) sit 22 px above the
 * baseline; the 22 px kicker and the 32 px title at their own size.
 */
export function baselineOf(top: number, size: number): number {
  return top + (size === 24 ? 22 : size);
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
  /** Neutral status prop: drawn as a dashed border, independent of tint. */
  readonly proposed?: boolean;
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
  /** Scene cards grow to keep every measured line above the footer. */
  readonly autoSize?: boolean;
  readonly height?: number;
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
  /**
   * Neutral status prop: `true` draws the border dashed (owner criterion:
   * a proposed state is always dashed), independently of `tone` — the tint
   * stays host-supplied legend meaning.
   */
  readonly proposed?: boolean;
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
  const icon = presentation.icon ?? "base";
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
      ...(presentation.proposed === undefined ? {} : { proposed: presentation.proposed }),
      ...(opts.toggle === undefined ? {} : { toggle: opts.toggle }),
    },
  };
}

/** Text wrapping injected by the host (the shipped `LineMeasurer` in
 *  production; a deterministic greedy wrapper in tests). `tooWide` is true
 *  when an emitted line exceeds `availableWidth` (typically one unbreakable
 *  word wider than the allocation) — the layout raises `card-overflow` for
 *  it exactly like for a line-count overflow (DC-D4). `lineWidths` carries
 *  the measured width of every emitted line so horizontal overflow is
 *  reported as `neededPx > allocatedPx` (Astra J4); hosts injecting a
 *  measurer without per-line widths still get the line-count diagnostic. */
export interface CardMeasuredText {
  readonly lines: readonly string[];
  readonly tooWide: boolean;
  readonly lineWidths?: readonly number[];
}

export type CardLineMeasure = (
  text: string,
  role: "kicker" | "title" | "body" | "footer",
  availableWidth: number,
  allocatedLines: number,
) => CardMeasuredText;

/** The same deterministic wrapper with widths supplied by a mounted host. */
export function createCardMeasure(
  widthOf: (text: string, role: "kicker" | "title" | "body" | "footer") => number,
  version: string,
  breakWords = false,
): CardLineMeasure {
  return Object.assign((text: string, role: "kicker" | "title" | "body" | "footer", availableWidth: number) => {
    const lines: string[] = [];
    let tooWide = false;
    for (const paragraph of text.split("\n")) {
      let line = "";
      let spaced = false;
      for (const token of paragraph.match(/\s+|[^\s·/_.-]+[·/_.-]?|[·/_.-]/gu) ?? []) {
        if (/^\s+$/.test(token)) { spaced = true; continue; }
        const join = spaced && line !== "" ? " " : "";
        spaced = false;
        const candidate = line + join + token;
        if (line !== "" && widthOf(candidate, role) > availableWidth) { lines.push(line); line = ""; }
        if (breakWords && widthOf(token, role) > availableWidth) {
          for (const char of token) {
            if (line !== "" && widthOf(line + char, role) > availableWidth) { lines.push(line); line = ""; }
            line += char;
            if (widthOf(char, role) > availableWidth) tooWide = true;
          }
        } else {
          line = line === "" ? token : candidate;
          if (widthOf(token, role) > availableWidth) tooWide = true;
        }
      }
      if (line !== "") lines.push(line);
    }
    return { lines, tooWide, lineWidths: lines.map(line => widthOf(line, role)) };
  }, { version });
}

/** Scene cards can reserve additional lines for long identifiers. */
export function sceneCardMeasure(measure: CardLineMeasure): CardLineMeasure {
  const version = (measure as { readonly version?: string }).version;
  if (version?.endsWith(":scene-wrap") || measure("Mm09", "body", 1000, 1).lineWidths === undefined) return measure;
  return createCardMeasure((text, role) => {
    const measured = measure(text, role, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
    const width = Math.max(0, ...(measured.lineWidths ?? [text.length * CARD_GEOMETRY[role].size]));
    return measure === defaultCardMeasure ? (width === 0 ? 0 : (width - 2) * CARD_FALLBACK_WIDTH_FACTOR + 2) : width;
  }, `${version ?? "inter-fallback-1.12-v2"}:scene-wrap`, true);
}

/**
 * Pinned per-character advances at 1 px (data, not code).
 *
 * Source: the pinned kit 'governance-font-metrics.js' (browser-measured
 * Inter 400 advances for body/kicker, Dossier Inter 700 advances for
 * title/footer — the same tables the reference layout wraps against).
 * The DS default measurer consumes them so static strings wrap exactly
 * where the reference wraps; production hosts inject their measured
 * LineMeasurer (Inter-stack advances) instead. Measurer version:
 * 'pinned-kit-1px'. Missing glyphs fall back to 0.7 em (the kit's
 * unknown-glyph advance).
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
 * Deterministic greedy wrapper over the pinned per-character advances.
 * Production hosts inject their measured ‘LineMeasurer’; tests and
 * static strings use this. It mirrors the frozen reference measurer
 * (`cardTextWidth`/`wrapText` of the pinned kit): every candidate line is
 * measured as a whole — `sum(advance × size) + 2` px safety — with the
 * unknown-glyph fallback at 0.7 em, and the kicker is uppercased and
 * tracked at 0.04 em before lookup (the kicker renders uppercase with
 * `letter-spacing: 0.04em`). Corpus fixtures wrap exactly where the
 * reference wraps; overflow fixtures overflow under every metric.
 */
export const CARD_FALLBACK_WIDTH_FACTOR = 1.12;
export const DEFAULT_CARD_MEASURER_VERSION = "inter-fallback-1.12-v2";

export function defaultCardMeasure(
  text: string,
  role: "kicker" | "title" | "body" | "footer",
  availableWidth: number,
): CardMeasuredText {
  const size =
    role === "kicker"
      ? CARD_GEOMETRY.kicker.size
      : role === "title"
        ? CARD_GEOMETRY.title.size
        : role === "footer"
          ? CARD_GEOMETRY.footer.size
          : CARD_GEOMETRY.body.size;
  const table = role === "title" || role === "footer" ? CARD_ADVANCES_TITLE : CARD_ADVANCES_BODY;
  const letterSpacing = role === "kicker" ? size * CARD_GEOMETRY.kicker.letterSpacingEm : 0;
  const measureString = (value: string): number => {
    if (value.length === 0) return 0;
    const normalized = role === "kicker" ? value.toUpperCase() : value;
    let sum = 0;
    for (const char of normalized) {
      sum += (table[char] ?? 0.7) * size + letterSpacing;
    }
    return sum + 2;
  };
  const lines: string[] = [];
  let tooWide = false;
  for (const word of String(text).split(/\s+/).filter(Boolean)) {
    const candidate = lines.length === 0 ? word : `${lines[lines.length - 1]} ${word}`;
    if (lines.length > 0 && measureString(candidate) <= availableWidth) {
      lines[lines.length - 1] = candidate;
    } else {
      if (measureString(word) > availableWidth) tooWide = true;
      lines.push(word);
    }
  }
  return { lines, tooWide, lineWidths: lines.map(measureString) };
}

/**
 * Structural twin of the `diagram-canvas` `MeasureRequest` (no import —
 * this module stays dependency-free): every canvas `TextRole` is listed,
 * so a `(request: CardMeasureRequest) => CardLineLayout` function is
 * assignable to the canvas `LineMeasurer` without a cast.
 */
export interface CardMeasureRequest {
  readonly text: string;
  readonly role: "kicker" | "title" | "body" | "footer" | "subtitle" | "detail" | "legend-label" | "edge-label";
  readonly availableWidth: number;
  readonly allocatedLines: number;
  readonly folded?: boolean;
}

/** Structural twin of the `diagram-canvas` `LineLayout`. */
export interface CardLineLayout {
  readonly lines: readonly string[];
  readonly width: number;
  readonly height: number;
  readonly overflow: boolean;
}

/**
 * Bridge from the card measurer to the canvas `LineMeasurer` shape: a host
 * pairing `diagram-canvas` with these renderers passes `cardLineMeasurer()`
 * straight as the injected `LineMeasurer` — no adapter, no role cast.
 * Every canvas role maps onto the card role with the same font size
 * (subtitle, detail and legend-label measure as body), `width` is the
 * widest emitted line, `height` the line count at the role's line box, and
 * `overflow` reports a too-wide line or a line-count overflow.
 *
 * The edge label has its own size (`EDGE_LABEL_GEOMETRY`, 18 px on 22 px):
 * it is the body face scaled by 18/24. The injected measure only knows the
 * four card roles, so the label is wrapped as body text in a width scaled up
 * by 24/18 and its line widths are scaled back down — advances are linear in
 * the font size, so this is the 18 px measurement.
 */
export function cardLineMeasurer(
  measure: CardLineMeasure = defaultCardMeasure,
): (request: CardMeasureRequest) => CardLineLayout {
  return Object.assign((request: CardMeasureRequest) => {
    const role: "kicker" | "title" | "body" | "footer" =
      request.role === "kicker" || request.role === "title" || request.role === "footer"
        ? request.role
        : "body";
    if (request.role === "edge-label") {
      const scale = EDGE_LABEL_GEOMETRY.size / CARD_GEOMETRY.body.size;
      const label = measure(request.text, "body", request.availableWidth / scale, request.allocatedLines);
      return {
        lines: label.lines,
        width:
          label.lineWidths === undefined ? request.availableWidth : Math.max(0, ...label.lineWidths) * scale,
        height: label.lines.length * EDGE_LABEL_GEOMETRY.lineHeight,
        overflow: label.tooWide || label.lines.length > request.allocatedLines,
      };
    }
    const measured = measure(request.text, role, request.availableWidth, request.allocatedLines);
    const size =
      role === "kicker"
        ? CARD_GEOMETRY.kicker.size
        : role === "title"
          ? CARD_GEOMETRY.title.size
          : CARD_GEOMETRY.body.size;
    const widest =
      measured.lineWidths === undefined
        ? request.availableWidth
        : Math.max(0, ...measured.lineWidths);
    return {
      lines: measured.lines,
      width: widest,
      height: measured.lines.length * lineBoxHeight(size),
      overflow: measured.tooWide || measured.lines.length > request.allocatedLines,
    };
  }, { version: (measure as { readonly version?: string }).version ?? DEFAULT_CARD_MEASURER_VERSION });
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
  readonly code: "card-overflow" | "card-icon-unknown" | "card-icon-missing" | "card-grown";
  readonly slot: string;
  readonly entityId: string;
  readonly neededPx: number;
  readonly allocatedPx: number;
  /**
   * Original, unwrapped slot text, retained alongside hard-cap diagnostics.
   */
  readonly text?: string;
}

/** First content diagnostic, for reporting only; renderers retain every slot. */
export function firstOverflowDiagnostic<D extends { readonly code: string }>(
  diagnostics: readonly D[],
): D | undefined {
  return diagnostics.find(diagnostic => diagnostic.code === "card-overflow" || diagnostic.code === "zone-overflow");
}

/**
 * Optional-slot header geometry, derived ONCE here and applied identically
 * by `layoutCard`, `layoutZone`, `renderCardSvg`/`renderZoneSvg` and the
 * Svelte header row (review pass 2, item 10). The 70 px icon floor applies
 * only when the icon slot is present: without an icon the header row is
 * exactly the kicker + title line boxes, so the body/subtitle start no
 * longer jumps by ~28 px between the model and the Svelte header. With an
 * icon, both the icon and the text band are centred in the block — the same
 * `align-items: center` the Svelte header row paints.
 */
export interface HeaderSlotGeometry {
  readonly kickerHeight: number;
  readonly titleHeight: number;
  /** Kicker + title line-box height (0 when both slots are omitted). */
  readonly contentHeight: number;
  /** Header row height: `max(icon 70, content)` with icon, `content` without. */
  readonly blockHeight: number;
  /** Text band top, relative to the block top: centred in the block. */
  readonly textTopOffset: number;
  /** Icon top, relative to the block top: centred in the block (0 without icon). */
  readonly iconTopOffset: number;
}

export function headerSlotGeometry(opts: {
  readonly hasIcon: boolean;
  readonly kickerLines: number;
  readonly titleLines: number;
}): HeaderSlotGeometry {
  const g = CARD_GEOMETRY;
  const kickerHeight = lineBoxHeight(g.kicker.size);
  const titleHeight = lineBoxHeight(g.title.size);
  const contentHeight = opts.kickerLines * kickerHeight + opts.titleLines * titleHeight;
  const blockHeight = opts.hasIcon ? Math.max(g.iconSize, contentHeight) : contentHeight;
  return {
    kickerHeight,
    titleHeight,
    contentHeight,
    blockHeight,
    textTopOffset: (blockHeight - contentHeight) / 2,
    iconTopOffset: opts.hasIcon ? (blockHeight - g.iconSize) / 2 : 0,
  };
}

export interface CardLayout {
  readonly icon: { readonly name: string; readonly glyph: DiagramGlyphPaths };
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
  /** Footer lines as measured (wrapped, never joined back), pinned bottom-up. */
  readonly footerLines: readonly LaidOutLine[];
  /** Footer text-box bottom (pinned at `height − border − 9.25`). */
  readonly footerBottom: number;
  readonly toggleBox?: { readonly x: number; readonly y: number; readonly size: number };
  readonly diagnostics: readonly CardDiagnostic[];
}

/**
 * Lay out every card slot, grow the content height and pin the footer.
 * Explicit hard caps produce diagnostics while retaining every character.
 * Missing glyphs use the visible unknown icon (owner A2/A11).
 */
export function layoutCard(props: DiagramCardProps, measure: CardLineMeasure): CardLayout {
  const icon = props.icon ?? "base";
  const missing = props.iconGlyph === undefined && getDiagramGlyph(icon) === undefined;
  props = { ...props, autoSize: props.autoSize ?? true, icon: missing ? "unknown" : icon,
    iconGlyph: props.iconGlyph ?? getDiagramGlyph(icon) ?? getDiagramGlyph("unknown")! };
  let g = { ...CARD_GEOMETRY, height: props.height ?? CARD_GEOMETRY.height };
  const diagnostics: CardDiagnostic[] = missing ? [{code:"card-icon-missing",slot:"icon",entityId:props.entityId,neededPx:1,allocatedPx:0}] : [];
  const align = props.align ?? "left";
  const bodyMode = props.bodyMode ?? "leaf";
  const contentTop = g.borderWidth + g.padding;
  const contentRight = g.width - g.borderWidth - g.padding;
  // The icon slot collapses when the glyph is missing (DIF-14): the header
  // text then starts at the content inset and no space is reserved.
  const hasIcon = props.icon !== undefined && props.iconGlyph !== undefined;
  const headerTextX = hasIcon ? g.headerInset + g.iconSize + g.iconTextGap : g.headerInset;
  const toggle = props.toggle !== undefined;
  // Toggle present: the header text keeps the owner-pinned folded width
  // (290 px with the icon — the hrpn folded-card title width 356 − 66);
  // the 66 px reservation covers the +/− control's inline-end room.
  const headerTextWidth = toggle
    ? hasIcon
      ? g.foldedHeaderTextWidth
      : contentRight - g.toggleAllocation - headerTextX
    : contentRight - headerTextX;
  const headerAnchor: "start" | "middle" = align === "center" ? "middle" : "start";
  const headerLineX = align === "center" ? headerTextX + headerTextWidth / 2 : headerTextX;

  // Overflow diagnostic (Astra J4): a too-wide line reports horizontal dims
  // (neededPx = widest measured line, allocatedPx = availableWidth, so
  // neededPx > allocatedPx always); a line-count overflow reports line dims.
  // `text` carries the original slot string: overflow is diagnosed, never
  // shortened, so the diagnostic preserves what the host must shorten.
  const pushOverflow = (
    slot: string,
    measured: CardMeasuredText,
    lineHeight: number,
    allocatedLines: number,
    availableWidth: number,
    text: string,
  ): void => {
    if (measured.tooWide) {
      const widest =
        measured.lineWidths === undefined ? availableWidth + 1 : Math.max(0, ...measured.lineWidths);
      diagnostics.push({
        code: "card-overflow",
        slot,
        entityId: props.entityId,
        neededPx: widest,
        allocatedPx: availableWidth,
        text,
      });
    } else {
      diagnostics.push({
        code: "card-overflow",
        slot,
        entityId: props.entityId,
        neededPx: measured.lines.length * lineHeight,
        allocatedPx: allocatedLines * lineHeight,
        text,
      });
    }
  };

  if (props.icon !== undefined && props.iconGlyph === undefined) {
    diagnostics.push({
      code: "card-icon-unknown",
      slot: "icon",
      entityId: props.entityId,
      neededPx: 1,
      allocatedPx: 0,
    });
  }

  const kickerResult =
    props.kicker === undefined
      ? undefined
      : measure(props.kicker, "kicker", headerTextWidth, g.allocatedLines.kicker);
  const kickerTexts = kickerResult === undefined ? [] : [...kickerResult.lines];
  const titleMeasured = measure(props.title, "title", headerTextWidth, g.allocatedLines.title);
  const titleTexts = [...titleMeasured.lines];
  // Optional slots (review pass 2, item 10): one shared derivation — the
  // 70 px icon floor applies only when the icon is present, and the text
  // band is centred in the block exactly like the Svelte header row.
  // Pass 3: the kicker/title line heights and the icon offset come from the
  // same derivation too — no header geometry is recomputed outside it.
  const headerGeo = headerSlotGeometry({
    hasIcon,
    kickerLines: kickerTexts.length,
    titleLines: titleTexts.length,
  });
  const kickerHeight = headerGeo.kickerHeight;
  const titleHeight = headerGeo.titleHeight;
  if (kickerResult !== undefined && ((!props.autoSize && kickerTexts.length > g.allocatedLines.kicker) || kickerResult.tooWide)) {
    pushOverflow("kicker", kickerResult, kickerHeight, g.allocatedLines.kicker, headerTextWidth, props.kicker ?? "");
  }
  if ((!props.autoSize && titleTexts.length > g.allocatedLines.title) || titleMeasured.tooWide) {
    pushOverflow("title", titleMeasured, titleHeight, g.allocatedLines.title, headerTextWidth, props.title);
  }
  const headerBlockHeight = headerGeo.blockHeight;
  const textTop = contentTop + headerGeo.textTopOffset;
  // Pass 3, item 11: the icon is centred in the header block exactly like
  // the Svelte header row (align-items: center), so both renderers place it
  // at contentTop + iconTopOffset.
  const iconBox = hasIcon
    ? { x: g.headerInset, y: contentTop + headerGeo.iconTopOffset, size: g.iconSize }
    : undefined;

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
  const bodyLineWidths: number[] = [];
  let detailLines = 0;
  let bodyTooWide = false;
  for (const [bodyIndex, line] of props.body.entries()) {
    const measured = measure(line, "body", bodyWidth, g.allocatedLines.body);
    wrappedBody.push(...measured.lines);
    if (bodyIndex >= props.body.length - (props.detailCount ?? 0)) detailLines += measured.lines.length;
    bodyLineWidths.push(...(measured.lineWidths ?? []));
    bodyTooWide = bodyTooWide || measured.tooWide;
  }
  const bodySlot = subtitleMode ? "collapsed-subtitle" : "body";
  const bodySourceText = props.body.join("\n");
  let bodyOverflowPushed = false;
  if ((!props.autoSize && wrappedBody.length > g.allocatedLines.body) || bodyTooWide) {
    pushOverflow(
      bodySlot,
      { lines: wrappedBody, tooWide: bodyTooWide, lineWidths: bodyLineWidths },
      bodyHeight,
      g.allocatedLines.body,
      bodyWidth,
      bodySourceText,
    );
    bodyOverflowPushed = true;
  }
  const footerHeight = lineBoxHeight(g.footer.size);
  if (props.autoSize) {
    const footerLines = props.footer === undefined ? 0 : measure(props.footer, "footer",
      subtitleMode ? contentRight - g.headerInset : bodyWidth, g.allocatedLines.footer).lines.length;
    const bottom = footerLines === 0 ? g.borderWidth + g.padding
      : footerLines * footerHeight + g.ruleHeight + 2 * g.ruleMargin + g.borderWidth + g.footerBottomInset;
    const required = Math.ceil(bodyY + wrappedBody.length * bodyHeight + bottom);
    if (required > g.height) {
      diagnostics.push({ code: "card-grown", slot: "content", entityId: props.entityId,
        neededPx: required, allocatedPx: g.height });
      g = { ...g, height: required };
    }
  }
  const footerBottom = g.height - g.borderWidth - g.footerBottomInset;
  // Footer: wrapped as measured (never joined back), pinned bottom-up — the
  // last line's box bottom sits at footerBottom; the rule stays ruleMargin
  // above the footer block (§5.4). No footer: no rule (DH-04).
  let footerLines: LaidOutLine[] = [];
  let ruleY: number | undefined;
  if (props.footer !== undefined) {
    const footerWidth = subtitleMode ? contentRight - g.headerInset : bodyWidth;
    const footerMeasured = measure(props.footer, "footer", footerWidth, g.allocatedLines.footer);
    const footerTexts = [...footerMeasured.lines];
    if ((!props.autoSize && footerTexts.length > g.allocatedLines.footer) || footerMeasured.tooWide) {
      pushOverflow("footer", footerMeasured, footerHeight, g.allocatedLines.footer, footerWidth, props.footer ?? "");
    }
    const footerAnchor: "start" | "middle" = align === "center" ? "middle" : "start";
    const footerLineX = footerAnchor === "middle" ? g.headerInset + footerWidth / 2 : g.headerInset;
    const footerBlockHeight = footerTexts.length * footerHeight;
    footerLines = footerTexts.map((text, index) => ({
      text,
      x: footerLineX,
      baseline: baselineOf(footerBottom - footerBlockHeight + index * footerHeight, g.footer.size),
      size: g.footer.size,
      weight: g.footer.weight,
      secondary: false,
      anchor: footerAnchor,
    }));
    ruleY = footerBottom - footerBlockHeight - g.ruleHeight - g.ruleMargin;
  }
  const bodyAreaBottom =
    ruleY === undefined ? g.height - g.borderWidth - g.padding : ruleY - g.ruleMargin;
  // Vertical overflow (second review, blocking): the combined header + body
  // height must fit the actual space above the pinned rule. The body starts
  // at bodyY (derived from the header block), and the rule is pinned to the
  // footer, so the body allocation is bodyAreaBottom − bodyY — a two-line
  // title already leaves less than one body line above the rule, and the
  // second body baseline would cross the footer baseline. Diagnosed here and
  // diagnosed against the explicit hard cap; all content remains rendered.
  const bodyBlockHeight = wrappedBody.length * bodyHeight;
  const bodyAreaHeight = bodyAreaBottom - bodyY;
  if (!bodyOverflowPushed && wrappedBody.length > 0 && bodyBlockHeight > bodyAreaHeight) {
    diagnostics.push({
      code: "card-overflow",
      slot: bodySlot,
      entityId: props.entityId,
      neededPx: bodyBlockHeight,
      allocatedPx: bodyAreaHeight,
      text: bodySourceText,
    });
  }
  // Subtitle mode centres the line block vertically inside the body area
  // (§6.2.1); leaf lines stay top-aligned (§5.2).
  const bodyBlockTop = subtitleMode
    ? bodyY + Math.max(0, (bodyAreaBottom - bodyY - wrappedBody.length * bodyHeight) / 2)
    : bodyY;
  const detailStart = wrappedBody.length - detailLines;
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

  const kicker: LaidOutLine[] = kickerTexts.map((text, index) => ({
    text,
    x: headerLineX,
    baseline: baselineOf(textTop + index * kickerHeight, g.kicker.size),
    size: g.kicker.size,
    weight: g.kicker.weight,
    secondary: true,
    anchor: headerAnchor,
  }));
  // Pass 3, item 10: title placement follows the MEASURED kicker-line
  // presence — an empty or whitespace-only kicker measures zero lines and
  // reserves no line, exactly like the shared header derivation above.
  const titleTop = textTop + kickerTexts.length * kickerHeight;
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
  // The slot box is the 32 px IconButton; the 66 px text reservation is
  // carried by headerTextWidth above.
  const toggleBox =
    props.toggle === undefined
      ? undefined
      : {
          x: g.width - g.toggleInset - g.toggleBoxSize,
          y: g.toggleInset,
          size: g.toggleBoxSize,
        };

  return {
    icon: { name: props.icon!, glyph: props.iconGlyph! },
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
    footerLines,
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
 * `LAST_CHILD_TO_BOTTOM_GAP 16`, `TOGGLE_ALLOCATION 66`,
 * `FIXED_CARD_WIDTH 460`, `FIXED_CARD_HEIGHT 200`); the token↔constant
 * agreement test asserts the sources agree. Fields shared with the atomic
 * card alias `CARD_GEOMETRY` directly — one geometry source (§5.6).
 */
export const ZONE_GEOMETRY = {
  radius: 0,
  borderWidth: 1.5,
  // Shared with the atomic card by construction (one geometry source §5.6):
  // every field below aliases CARD_GEOMETRY unless the zone frame differs.
  headerInset: CARD_GEOMETRY.headerInset,
  iconSize: CARD_GEOMETRY.iconSize,
  iconTextGap: CARD_GEOMETRY.iconTextGap,
  kicker: CARD_GEOMETRY.kicker,
  title: CARD_GEOMETRY.title,
  subtitle: CARD_GEOMETRY.body,
  /** Rendered title → subtitle gap: alias of the card `gap` (§6.4). */
  subtitleGap: CARD_GEOMETRY.gap,
  headerRuleGap: 4,
  contentInsetTop: 16,
  contentInsetBottom: 16,
  contentInsetInline: 16,
  ruleHeight: CARD_GEOMETRY.ruleHeight,
  ruleMargin: CARD_GEOMETRY.ruleMargin,
  ruleInsetStart: CARD_GEOMETRY.ruleInsetStart,
  ruleInsetEnd: CARD_GEOMETRY.ruleInsetEnd,
  footer: CARD_GEOMETRY.footer,
  footerBottomInset: CARD_GEOMETRY.footerBottomInset,
  toggleAllocation: CARD_GEOMETRY.toggleAllocation,
  toggleBoxSize: CARD_GEOMETRY.toggleBoxSize,
  /**
   * Expanded toggle top inset: the frozen SVG places every zone toggle at
   * `y + 10` (flush under the frame's top edge), while the header band
   * starts at `y + 16`.
   */
  toggleTopInset: CARD_GEOMETRY.toggleInset,
  toggleInset: CARD_GEOMETRY.toggleInset,
  /**
   * Expanded header text inset from the frame's left edge: the kit wraps
   * kicker/title at `width − 178` (icon 16 + 70 + gap 6, toggle room, right
   * inset) — 314 px at the PEOPLE width 492.
   */
  headerTextInset: 178,
  collapsedWidth: CARD_GEOMETRY.width,
  collapsedHeight: CARD_GEOMETRY.height,
  collapsedInset: 16,
  collapsedSubtitleMarginInline: 16,
  allocatedLines: { kicker: 1, title: 2, subtitle: 2, footer: 1 },
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
  readonly autoSize?: boolean;
  readonly entityId: string;
  readonly kicker?: string;
  readonly title: string;
  readonly subtitle?: string;
  /**
   * Zone footer, both states (§6.1): folding never changes the footer —
   * collapsed it pins the card rule, expanded it pins at the frame bottom.
   */
  readonly footer?: string;
  readonly icon?: string;
  readonly iconGlyph?: DiagramGlyphPaths;
  readonly tone?: string;
  /** Neutral status prop: dashed border in both states, independent of tint. */
  readonly proposed?: boolean;
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
  props = { ...props, icon: props.icon ?? "cluster" };
  return {
    ...(props.autoSize === undefined ? {} : { autoSize: props.autoSize }),
    ...(props.height === undefined ? {} : { height: props.height }),
    entityId: props.entityId,
    ...(props.kicker === undefined ? {} : { kicker: props.kicker }),
    title: props.title,
    body: props.subtitle === undefined || props.subtitle === "" ? [] : [props.subtitle],
    ...(props.footer === undefined ? {} : { footer: props.footer }),
    ...(props.icon === undefined ? {} : { icon: props.icon }),
    ...(props.iconGlyph === undefined ? {} : { iconGlyph: props.iconGlyph }),
    ...(props.tone === undefined ? {} : { tone: props.tone }),
    ...(props.proposed === undefined ? {} : { proposed: props.proposed }),
    ...(props.toggleLabel === undefined
      ? {}
      : { toggle: { collapsed: true, label: props.toggleLabel } }),
    ...(props.align === undefined ? {} : { align: props.align }),
    bodyMode: "subtitle",
  };
}

export interface ZoneDiagnostic {
  /**
   * `zone-overflow` / `zone-icon-unknown` are the zone's own; a descendant
   * card or nested zone keeps its own `card-overflow` / `card-icon-unknown`
   * code with its own `entityId` when `renderZoneSvg` aggregates them.
   */
  readonly code: "zone-overflow" | "zone-icon-unknown" | "card-icon-missing" | "zone-grown" | "card-overflow" | "card-icon-unknown" | "card-grown";
  readonly slot: string;
  readonly entityId: string;
  readonly neededPx: number;
  readonly allocatedPx: number;
  /** Original, unwrapped slot text retained with the diagnostic. */
  readonly text?: string;
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
  readonly icon: { readonly name: string; readonly glyph: DiagramGlyphPaths };
  readonly box: { readonly x: number; readonly y: number; readonly width: number; readonly height: number };
  readonly collapsed: boolean;
  /** Collapsed: the card layout of the folded card (same geometry source). */
  readonly card?: CardLayout;
  /** Expanded: header + rule + footer geometry inside the frame. */
  readonly header?: {
    readonly iconBox?: { readonly x: number; readonly y: number; readonly size: number } | undefined;
    readonly headerTextX: number;
    readonly headerTextWidth: number;
    readonly kicker: readonly LaidOutLine[];
    readonly title: readonly LaidOutLine[];
    readonly headerBlockHeight: number;
    readonly subtitle: readonly LaidOutLine[];
    /** Subtitle wrap width: `min(width, 460) − 26` — the single geometry
     *  source shared with `renderZoneSvg` and the Svelte header. */
    readonly subtitleWidth: number;
    readonly subtitleBottom: number;
    readonly ruleY: number;
    readonly contentTop: number;
    readonly toggleBox?: { readonly x: number; readonly y: number; readonly size: number } | undefined;
    /** Footer lines, pinned at the frame bottom in the expanded state too
     *  (§6.1: folding never changes the footer). */
    readonly footer: readonly LaidOutLine[];
    /** Rule above the footer block (same insets as the header rule). */
    readonly footerRuleY?: number;
    readonly footerBottom: number;
  };
  readonly diagnostics: readonly ZoneDiagnostic[];
}

/**
 * Layout height of one child spec (review pass 3, item 9): a card child is
 * the frozen 460 × 200; a zone child is laid out through `layoutZone` —
 * recursively, so an auto-sized child contributes its own computed header +
 * children + footer height, and an explicit or collapsed child its own box.
 * A parent never assumes a 200 px child.
 */
function childLayoutHeight(child: ZoneChildSpec, measure: CardLineMeasure): number {
  if (child.kind === "card") return child.card === undefined ? CARD_GEOMETRY.height : layoutCard(child.card, measure).box.height;
  if (child.zone === undefined) return ZONE_GEOMETRY.collapsedHeight;
  return layoutZone(child.zone, measure, child.children ?? []).box.height;
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
  const icon = props.icon ?? "cluster";
  const missing = props.iconGlyph === undefined && getDiagramGlyph(icon) === undefined;
  props = { ...props, autoSize: props.autoSize ?? true, icon: missing ? "unknown" : icon,
    iconGlyph: props.iconGlyph ?? getDiagramGlyph(icon) ?? getDiagramGlyph("unknown")! };
  const g = ZONE_GEOMETRY;
  const x = props.x ?? 0;
  const y = props.y ?? 0;
  const diagnostics: ZoneDiagnostic[] = missing ? [{code:"card-icon-missing",slot:"icon",entityId:props.entityId,neededPx:1,allocatedPx:0}] : [];

  if (props.collapsed) {
    const card = layoutCard(zoneCollapsedCardProps(props), measure);
    for (const diagnostic of card.diagnostics) {
      diagnostics.push({
        code: diagnostic.code === "card-icon-missing" ? "card-icon-missing" : diagnostic.code === "card-icon-unknown" ? "zone-icon-unknown" : diagnostic.code === "card-grown" ? "zone-grown" : "zone-overflow",
        slot: diagnostic.slot,
        entityId: diagnostic.entityId,
        neededPx: diagnostic.neededPx,
        allocatedPx: diagnostic.allocatedPx,
        ...(diagnostic.text === undefined ? {} : { text: diagnostic.text }),
      });
    }
    return {
      icon: { name: props.icon!, glyph: props.iconGlyph! },
      box: { x, y, width: g.collapsedWidth, height: card.box.height },
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
  // Kit header rule: with the icon and the toggle room both present,
  // kicker/title wrap at `width − 178` (314 px at the PEOPLE width 492).
  // Without the icon the text starts at the 16 px inset; without the
  // toggle there is no inline-end reservation — the 178 applies only when
  // icon and toggle are both there.
  const rightHeaderReserve =
    props.toggleLabel === undefined
      ? g.headerInset
      : g.headerTextInset - (g.headerInset + g.iconSize + g.iconTextGap);
  const headerTextWidth = Math.max(0, x + width - headerTextX - rightHeaderReserve);
  const align = props.align ?? "left";
  const headerAnchor: "start" | "middle" = align === "center" ? "middle" : "start";
  const headerLineX = align === "center" ? headerTextX + headerTextWidth / 2 : headerTextX;

  // Overflow diagnostic (Astra J4): a too-wide line reports horizontal dims
  // (neededPx = widest measured line > availableWidth = allocatedPx); a
  // line-count overflow reports line dims.
  const pushOverflow = (
    slot: string,
    measured: CardMeasuredText,
    lineHeight: number,
    allocatedLines: number,
    availableWidth: number,
    text: string,
  ): void => {
    if (measured.tooWide) {
      const widest =
        measured.lineWidths === undefined ? availableWidth + 1 : Math.max(0, ...measured.lineWidths);
      diagnostics.push({
        code: "zone-overflow",
        slot,
        entityId: props.entityId,
        neededPx: widest,
        allocatedPx: availableWidth,
        text,
      });
    } else {
      diagnostics.push({
        code: "zone-overflow",
        slot,
        entityId: props.entityId,
        neededPx: measured.lines.length * lineHeight,
        allocatedPx: allocatedLines * lineHeight,
        text,
      });
    }
  };

  if (props.icon !== undefined && props.iconGlyph === undefined) {
    diagnostics.push({
      code: "zone-icon-unknown",
      slot: "icon",
      entityId: props.entityId,
      neededPx: 1,
      allocatedPx: 0,
    });
  }

  // The kit stacks the 24 px subtitle at the raw 24 × 1.3 = 31.2 (not the
  // floored 1/64 grid) and ends its block 8 px under the last baseline.
  const subtitleLineHeight = g.subtitle.size * g.subtitle.lineHeight;
  const kickerResult =
    props.kicker === undefined
      ? undefined
      : measure(props.kicker, "kicker", headerTextWidth, g.allocatedLines.kicker);
  const kickerTexts = kickerResult === undefined ? [] : [...kickerResult.lines];
  const titleMeasured = measure(props.title, "title", headerTextWidth, g.allocatedLines.title);
  const titleTexts = [...titleMeasured.lines];
  // Optional slots (review pass 2, item 10): the same shared derivation as
  // the card — the 70 px icon floor applies only with the icon, and the
  // text band is centred in the block exactly like the Svelte header row
  // (align-items: center), so both renderers place it identically. Pass 3:
  // the kicker/title line heights come from the same derivation too.
  const headerGeo = headerSlotGeometry({
    hasIcon,
    kickerLines: kickerTexts.length,
    titleLines: titleTexts.length,
  });
  const kickerHeight = headerGeo.kickerHeight;
  const titleHeight = headerGeo.titleHeight;
  if (kickerResult !== undefined && ((!props.autoSize && kickerTexts.length > g.allocatedLines.kicker) || kickerResult.tooWide)) {
    pushOverflow("kicker", kickerResult, kickerHeight, g.allocatedLines.kicker, headerTextWidth, props.kicker ?? "");
  }
  if ((!props.autoSize && titleTexts.length > g.allocatedLines.title) || titleMeasured.tooWide) {
    pushOverflow("title", titleMeasured, titleHeight, g.allocatedLines.title, headerTextWidth, props.title);
  }
  const headerBlockHeight = headerGeo.blockHeight;
  const headerTop = y + g.headerInset;
  const textTop = headerTop + headerGeo.textTopOffset;

  const iconBox = hasIcon
    ? { x: x + g.headerInset, y: headerTop + headerGeo.iconTopOffset, size: g.iconSize }
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
  // Pass 3, item 10: title placement follows the MEASURED kicker-line
  // presence — an empty or whitespace-only kicker measures zero lines and
  // reserves no line, exactly like the shared header derivation above.
  const titleTop = textTop + kickerTexts.length * kickerHeight;
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
  // Kit rule: min(width, 460) − 26, i.e. the same 16/10 insets as the
  // header rule inside a box capped at the atomic card width.
  const subtitleX = x + g.headerInset;
  const subtitleWidth = Math.min(width, g.collapsedWidth) - g.ruleInsetStart - g.ruleInsetEnd;
  const subtitleAnchor: "start" | "middle" = align === "center" ? "middle" : "start";
  const subtitleLineX = align === "center" ? subtitleX + subtitleWidth / 2 : subtitleX;
  const subtitleMeasured =
    props.subtitle === undefined || props.subtitle === ""
      ? { lines: [] as string[], tooWide: false }
      : measure(props.subtitle, "body", subtitleWidth, g.allocatedLines.subtitle);
  const subtitleTexts = [...subtitleMeasured.lines];
  if ((!props.autoSize && subtitleTexts.length > g.allocatedLines.subtitle) || subtitleMeasured.tooWide) {
    pushOverflow("subtitle", subtitleMeasured, subtitleLineHeight, g.allocatedLines.subtitle, subtitleWidth, props.subtitle ?? "");
  }
  const subtitleTop = headerTop + headerBlockHeight + g.subtitleGap;
  const subtitle: LaidOutLine[] = subtitleTexts.map((text, index) => ({
    text,
    x: subtitleLineX,
    baseline: baselineOf(subtitleTop + index * subtitleLineHeight, g.subtitle.size),
    size: g.subtitle.size,
    weight: g.subtitle.weight,
    secondary: false,
    anchor: subtitleAnchor,
  }));
  // Kit subtitle block bottom: 8 px descent under the last baseline.
  const subtitleBottom =
    subtitleTexts.length === 0
      ? subtitleTop
      : subtitleTop + (subtitleTexts.length - 1) * subtitleLineHeight + 22 + 8;

  // Header rule 4 px under the subtitle last line, or under the header
  // block when there is no subtitle (§6.2, §6.4 headerRuleGap).
  const ruleY =
    subtitleTexts.length > 0
      ? subtitleBottom + g.headerRuleGap
      : headerTop + headerBlockHeight + g.headerRuleGap;
  const contentTop = ruleY + g.contentInsetTop;

  // Footer, expanded state too (§6.1: folding never changes the footer):
  // wrapped as measured, pinned bottom-up at the frame bottom like the
  // card, with its own rule ruleMargin above the footer block. Measured
  // before the default height so an auto-sized frame reserves the footer.
  const footerHeight = lineBoxHeight(g.footer.size);
  const footerX = x + g.contentInsetInline;
  const footerWidth = x + width - g.contentInsetInline - footerX;
  const footerMeasured =
    props.footer === undefined ? undefined : measure(props.footer, "footer", footerWidth, g.allocatedLines.footer);
  const footerTexts = footerMeasured === undefined ? [] : [...footerMeasured.lines];
  if (footerMeasured !== undefined && ((!props.autoSize && footerTexts.length > g.allocatedLines.footer) || footerMeasured.tooWide)) {
    pushOverflow("footer", footerMeasured, footerHeight, g.allocatedLines.footer, footerWidth, props.footer ?? "");
  }
  const footerBlockHeight = footerTexts.length * footerHeight;

  // Frame height (review pass 2, item 9; pass 3, item 9): the supplied box,
  // or — when the host lets the zone size itself — the full vertical
  // requirement: header + rule (contentTop) or children, whichever is
  // lower, plus the bottom content inset and the footer reserve (footer
  // block + rule + both rule gaps + bottom inset). Children contribute
  // their own recursively computed layout height (never an assumed 200 px),
  // so a nested auto-sized child is fully inside the frame. The old
  // formula ignored the header, so a tall header silently overflowed an
  // auto-sized 200 px frame.
  const childrenBottom = children.reduce(
    (bottom, child) => Math.max(bottom, child.y + childLayoutHeight(child, measure)),
    y,
  );
  const footerReserve =
    footerTexts.length === 0
      ? 0
      : footerBlockHeight + g.ruleHeight + 2 * g.ruleMargin + g.footerBottomInset;
  const requiredHeight = Math.max(childrenBottom, contentTop) + g.contentInsetBottom - y + footerReserve;
  const height = props.autoSize ? Math.max(props.height ?? g.collapsedHeight, requiredHeight)
    : props.height ?? Math.max(g.collapsedHeight, requiredHeight);
  // An explicitly undersized frame reports a hard-cap diagnostic.
  // Renderers retain all content (owner A11).
  if (!props.autoSize && props.height !== undefined && requiredHeight > props.height) {
    diagnostics.push({
      code: "zone-overflow",
      slot: "frame",
      entityId: props.entityId,
      neededPx: requiredHeight,
      allocatedPx: props.height,
      text: props.title,
    });
  }

  // Toggle slot: the frozen SVG places every expanded-zone toggle at
  // y + 10 (the header band itself starts at y + 16).
  const toggleBox =
    props.toggleLabel === undefined
      ? undefined
      : { x: x + width - g.toggleInset - g.toggleBoxSize, y: y + g.toggleInset, size: g.toggleBoxSize };

  const footerBottom = y + height - g.borderWidth - g.footerBottomInset;
  let footer: LaidOutLine[] = [];
  let footerRuleY: number | undefined;
  if (footerMeasured !== undefined) {
    const footerAnchor: "start" | "middle" = align === "center" ? "middle" : "start";
    const footerLineX = footerAnchor === "middle" ? footerX + footerWidth / 2 : footerX;
    footer = footerTexts.map((text, index) => ({
      text,
      x: footerLineX,
      baseline: baselineOf(footerBottom - footerBlockHeight + index * footerHeight, g.footer.size),
      size: g.footer.size,
      weight: g.footer.weight,
      secondary: false,
      anchor: footerAnchor,
    }));
    footerRuleY = footerBottom - footerBlockHeight - g.ruleHeight - g.ruleMargin;
  }

  return {
    icon: { name: props.icon!, glyph: props.iconGlyph! },
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
      subtitleWidth,
      subtitleBottom,
      ruleY,
      contentTop,
      ...(toggleBox === undefined ? {} : { toggleBox }),
      footer,
      ...(footerRuleY === undefined ? {} : { footerRuleY }),
      footerBottom,
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
  /** Neutral status prop: drawn as a dashed border, independent of tint. */
  readonly proposed?: boolean;
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
  const icon = presentation.icon ?? "cluster";
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
      ...(presentation.proposed === undefined ? {} : { proposed: presentation.proposed }),
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
