import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import type { Extension } from "@codemirror/state";

/**
 * Options for sentTechCodeMirror factory.
 *
 * Note: a dark variant is not yet available — no dark token set exists in the DS
 * (sent-tech.css has a single light-only block; no prefers-color-scheme / data-theme="dark"
 * overrides). This interface is kept for forward compatibility; `dark` is accepted but
 * silently ignored until a DS dark token set ships.
 */
export interface SentTechCodeMirrorOptions {
  /**
   * Reserved for future dark-mode support. Currently has no effect: the DS ships
   * a light-only token set, so passing `{ dark: true }` still renders a light editor.
   * @deprecated until DS dark tokens are available
   */
  dark?: boolean;
}

/**
 * DS CSS-variable aliases for structural/semantic tokens.
 * Source of truth: packages/themes/css/sent-tech.css
 */
const v = {
  // Surface / background
  bg:        "var(--st-semantic-surface-default)",  // #ffffff
  bgSubtle:  "var(--st-semantic-surface-subtle)",   // #f8fafc
  bgRaised:  "var(--st-semantic-surface-raised)",   // #ffffff

  // Text
  fg:          "var(--st-semantic-text-primary)",   // #0f172a
  fgSecondary: "var(--st-semantic-text-secondary)", // #475569  contrast 7.58:1 on white
  fgMuted:     "var(--st-semantic-text-muted)",     // #64748b  contrast 4.76:1 on white

  // Borders
  borderSubtle: "var(--st-semantic-border-subtle)",
  borderStrong: "var(--st-semantic-border-strong)",

  // Action / interactive
  actionPrimary:     "var(--st-semantic-action-primary)",
  actionPrimaryText: "var(--st-semantic-action-primaryText)",

  // Feedback
  error: "var(--st-semantic-feedback-error)", // #dc2626  contrast 4.83:1 on white

  // Font
  fontMono: "var(--st-font-mono)",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Syntax color palette — AA-safe (≥ 4.5:1) on both surface-default (#ffffff)
// and surface-subtle (#f8fafc, used by activeLine / gutters).
//
// Derivation strategy: original data-viz cat colors darkened by the minimum
// % of black needed to reach 4.5:1 on BOTH surfaces via linear blend
// (per-channel multiply). Ratios verified with WCAG relative-luminance formula.
//
// Token  Original   Derived    %black  white   subtle
// kw     #4E79A7    #4c75a2     3 %    4.80    4.59
// str    #F28E2B    #a7621e    31 %    4.76    4.55
// re     #E15759    #c24b4d    14 %    4.76    4.55
// type   #76B7B2    #4f7b77    33 %    4.74    4.53
// num    #59A14F    #467f3e    21 %    4.81    4.60
// fn     #EDC948    #857128    44 %    4.78    4.57
// prop   #B07AA1    #926586    17 %    4.74    4.53
// meta   #FF9DA7    #9e6168    38 %    4.81    4.60
// ─────────────────────────────────────────────────────────────────────────────
const syn = {
  /** keyword / storage / tagName — blue  #4c75a2  white 4.80 subtle 4.59 */
  kw:     "#4c75a2",
  /** string / char / attributeValue — amber #a7621e  white 4.76 subtle 4.55 */
  str:    "#a7621e",
  /** regexp / invalid / error — red   #c24b4d  white 4.76 subtle 4.55 */
  re:     "#c24b4d",
  /** typeName / className / namespace — teal  #4f7b77  white 4.74 subtle 4.53 */
  type:   "#4f7b77",
  /** number / bool / null / unit — green #467f3e  white 4.81 subtle 4.60 */
  num:    "#467f3e",
  /** function / variableName (def) — gold  #857128  white 4.78 subtle 4.57 */
  fn:     "#857128",
  /** propertyName / attributeName — mauve #926586  white 4.74 subtle 4.53 */
  prop:   "#926586",
  /** meta / annotation / special — rose  #9e6168  white 4.81 subtle 4.60 */
  meta:   "#9e6168",
} as const;

/**
 * Editor theme: maps CodeMirror structural classes onto DS CSS vars.
 *
 * The `dark` parameter is accepted for API compatibility but currently has no
 * effect — the DS does not yet ship a dark token set. Passing `{ dark: true }`
 * does NOT tell EditorView the theme is dark, which avoids CM applying its
 * dark-mode heuristics (autocomplete, scrollbar) on a light surface.
 */
function makeEditorTheme(_dark: boolean): Extension {
  return EditorView.theme(
    {
      // ── Root ──────────────────────────────────────────────────────────────
      "&": {
        color:           v.fg,
        backgroundColor: v.bg,
        fontFamily:      v.fontMono,
        fontSize:        "0.875rem",
        lineHeight:      "1.6",
        borderRadius:    "var(--st-radius-md)",
        border:          `1px solid ${v.borderSubtle}`,
      },

      // ── Content area ──────────────────────────────────────────────────────
      ".cm-content": {
        caretColor: v.actionPrimary,
        padding:    "var(--st-spacing-2) 0",
      },

      // ── Gutters ───────────────────────────────────────────────────────────
      ".cm-gutters": {
        backgroundColor: v.bgSubtle,
        color:           v.fgMuted,
        border:          "none",
        borderRight:     `1px solid ${v.borderSubtle}`,
      },
      ".cm-lineNumbers .cm-gutterElement": {
        padding:   "0 var(--st-spacing-3) 0 var(--st-spacing-2)",
        minWidth:  "2.5rem",
        textAlign: "right",
      },
      ".cm-foldGutter .cm-gutterElement": {
        padding: "0 var(--st-spacing-1)",
        cursor:  "pointer",
        color:   v.fgSecondary,
      },

      // ── Active line ───────────────────────────────────────────────────────
      ".cm-activeLine":      { backgroundColor: v.bgSubtle },
      ".cm-activeLineGutter": {
        backgroundColor: v.bgSubtle,
        color:           v.fg,
        fontWeight:      "600",
      },

      // ── Cursor ────────────────────────────────────────────────────────────
      ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: v.actionPrimary,
        borderLeftWidth: "2px",
      },

      // ── Selection — specific selectors beat CM drawSelection plugin ────────
      "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
        backgroundColor: `color-mix(in srgb, ${v.actionPrimary} 28%, transparent)`,
      },
      "& > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
        backgroundColor: `color-mix(in srgb, ${v.actionPrimary} 18%, transparent)`,
      },
      "::selection": {
        backgroundColor: `color-mix(in srgb, ${v.actionPrimary} 28%, transparent)`,
      },

      // ── Matching / non-matching brackets ──────────────────────────────────
      "&.cm-focused .cm-matchingBracket": {
        backgroundColor: `color-mix(in srgb, ${v.actionPrimary} 20%, transparent)`,
        outline:         `1px solid ${v.borderStrong}`,
        borderRadius:    "2px",
      },
      "&.cm-focused .cm-nonmatchingBracket": {
        backgroundColor: `color-mix(in srgb, ${v.error} 15%, transparent)`,
        outline:         `1px solid ${v.error}`,
        borderRadius:    "2px",
      },

      // ── Search highlight ──────────────────────────────────────────────────
      // cat6 original (#EDC948) was 1.61:1 — replaced with derived gold bg
      ".cm-searchMatch": {
        backgroundColor: `color-mix(in srgb, ${syn.fn} 25%, transparent)`,
        outline:         `1px solid ${syn.fn}`,
      },
      ".cm-searchMatch.cm-searchMatch-selected": {
        backgroundColor: `color-mix(in srgb, ${v.actionPrimary} 35%, transparent)`,
        outline:         `1px solid ${v.actionPrimary}`,
      },

      // ── Tooltip ───────────────────────────────────────────────────────────
      ".cm-tooltip": {
        border:       `1px solid ${v.borderSubtle}`,
        backgroundColor: v.bgRaised,
        color:        v.fg,
        borderRadius: "var(--st-radius-md)",
        boxShadow:    "var(--st-shadow-medium)",
        fontFamily:   v.fontMono,
        fontSize:     "0.8125rem",
      },
      ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
        backgroundColor: `color-mix(in srgb, ${v.actionPrimary} 12%, transparent)`,
        color:           v.fg,
      },
      ".cm-tooltip-section": {
        padding:    "var(--st-spacing-1) var(--st-spacing-2)",
        borderTop:  `1px solid ${v.borderSubtle}`,
      },
      ".cm-tooltip-arrow": {
        // CM renders ::before/::after pseudo-elements; color the fill
        color: v.bgRaised,
      },
      ".cm-tooltip-arrow:before": {
        borderTopColor:    v.borderSubtle,
        borderBottomColor: v.borderSubtle,
      },
      ".cm-tooltip-arrow:after": {
        borderTopColor:    v.bgRaised,
        borderBottomColor: v.bgRaised,
      },

      // ── Panels (search, lint…) ────────────────────────────────────────────
      ".cm-panels": {
        backgroundColor: v.bgSubtle,
        color:           v.fg,
        borderTop:       `1px solid ${v.borderSubtle}`,
      },
      ".cm-panels.cm-panels-top": {
        borderBottom: `1px solid ${v.borderSubtle}`,
        borderTop:    "none",
      },

      // ── CM search/lint dialog ─────────────────────────────────────────────
      ".cm-dialog": {
        backgroundColor: v.bgSubtle,
        color:           v.fg,
        padding:         "var(--st-spacing-2) var(--st-spacing-3)",
        borderTop:       `1px solid ${v.borderSubtle}`,
        fontFamily:      v.fontMono,
        fontSize:        "0.875rem",
      },

      // ── Panel inputs ──────────────────────────────────────────────────────
      ".cm-textfield": {
        background:   v.bg,
        color:        v.fg,
        border:       `1px solid ${v.borderStrong}`,
        borderRadius: "var(--st-radius-sm)",
        fontFamily:   v.fontMono,
        fontSize:     "0.875rem",
        padding:      "2px 6px",
        outline:      "none",
      },
      ".cm-textfield:focus": {
        borderColor: v.actionPrimary,
        boxShadow:   `0 0 0 2px color-mix(in srgb, ${v.actionPrimary} 20%, transparent)`,
      },
      // Legacy selector from CM search panel — kept for compatibility
      ".cm-panel input[type='text']": {
        background:   v.bg,
        color:        v.fg,
        border:       `1px solid ${v.borderStrong}`,
        borderRadius: "var(--st-radius-sm)",
        fontFamily:   v.fontMono,
        fontSize:     "0.875rem",
        padding:      "2px 6px",
        outline:      "none",
      },
      ".cm-panel input[type='text']:focus": {
        borderColor: v.actionPrimary,
        boxShadow:   `0 0 0 2px color-mix(in srgb, ${v.actionPrimary} 20%, transparent)`,
      },

      // ── Panel / dialog buttons (fixed: was font-size:70%) ─────────────────
      ".cm-button": {
        background:   v.actionPrimary,
        color:        v.actionPrimaryText,
        border:       "none",
        borderRadius: "var(--st-radius-sm)",
        padding:      "2px 8px",
        cursor:       "pointer",
        fontFamily:   v.fontMono,
        fontSize:     "0.875rem",
        lineHeight:   "1.6",
      },
      ".cm-button:hover": {
        opacity: "0.9",
      },
      // Legacy selector
      ".cm-panel button": {
        background:   v.actionPrimary,
        color:        v.actionPrimaryText,
        border:       "none",
        borderRadius: "var(--st-radius-sm)",
        padding:      "2px 8px",
        cursor:       "pointer",
        fontFamily:   "inherit",
        fontSize:     "0.875rem",
      },

      // ── Fold placeholder ──────────────────────────────────────────────────
      ".cm-foldPlaceholder": {
        backgroundColor: `color-mix(in srgb, ${v.actionPrimary} 12%, transparent)`,
        border:          `1px solid ${v.borderStrong}`,
        color:           v.fgSecondary,
        borderRadius:    "var(--st-radius-sm)",
        padding:         "0 4px",
        cursor:          "pointer",
      },

      // ── Scroller ──────────────────────────────────────────────────────────
      ".cm-scroller": {
        fontFamily: v.fontMono,
        lineHeight: "1.6",
      },

      // ── Readonly / disabled ───────────────────────────────────────────────
      // Note: CM does not emit a .cm-readonly class. Read-only state is reflected
      // via contenteditable="false" on .cm-content.
      ".cm-content[contenteditable='false']": {
        backgroundColor: v.bgSubtle,
      },
    },
    // Do NOT pass { dark: true } — the DS has no dark token set and doing so
    // would cause CM to apply dark-mode heuristics on a light surface.
  );
}

/**
 * Syntax highlighting style using AA-safe text colors.
 *
 * All colors are hardcoded hex values derived from the DS data-viz palette
 * by darkening each hue until it reaches ≥ 4.5:1 contrast on both
 * surface-default (#ffffff) and surface-subtle (#f8fafc).
 *
 * Palette:
 *  kw   #4c75a2 (blue)  → keyword, modifier, definitionKeyword, tagName     4.80/4.59
 *  str  #a7621e (amber) → string, character, attributeValue                  4.76/4.55
 *  re   #c24b4d (red)   → regexp, escape, invalid, deleted                   4.76/4.55
 *  type #4f7b77 (teal)  → typeName, className, namespace, typeOperator       4.74/4.53
 *  num  #467f3e (green) → number, bool, null, unit, inserted                 4.81/4.60
 *  fn   #857128 (gold)  → function, variableName (defs)                      4.78/4.57
 *  prop #926586 (mauve) → propertyName, attributeName, definition             4.74/4.53
 *  meta #9e6168 (rose)  → meta, annotation, special, macroName               4.81/4.60
 *  fgSecondary (#475569) → comment (italic)                                  7.58/7.24
 *  fgMuted     (#64748b) → punctuation, operator, bracket                    4.76/4.55
 */
const sentTechHighlightStyle = HighlightStyle.define([
  // ── Keywords ──────────────────────────────────────────────────────────────
  { tag: tags.keyword,           color: syn.kw, fontWeight: "bold" },
  { tag: tags.controlKeyword,    color: syn.kw, fontWeight: "bold" },
  { tag: tags.definitionKeyword, color: syn.kw },
  { tag: tags.moduleKeyword,     color: syn.kw },
  { tag: tags.modifier,          color: syn.kw },
  { tag: tags.self,              color: syn.kw, fontStyle: "italic" },
  { tag: tags.operatorKeyword,   color: syn.kw },

  // ── Strings & templates ───────────────────────────────────────────────────
  { tag: tags.string,                  color: syn.str },
  { tag: tags.special(tags.string),    color: syn.str },
  { tag: tags.character,               color: syn.str },
  { tag: tags.attributeValue,          color: syn.str },
  { tag: tags.escape,                  color: syn.re, fontWeight: "bold" },
  { tag: tags.regexp,                  color: syn.re },
  { tag: tags.url,                     color: syn.prop, textDecoration: "underline" },

  // ── Types ─────────────────────────────────────────────────────────────────
  { tag: tags.typeName,    color: syn.type },
  { tag: tags.className,   color: syn.type },
  { tag: tags.namespace,   color: syn.type },
  { tag: tags.typeOperator,color: syn.type },

  // ── Numbers / literals ────────────────────────────────────────────────────
  { tag: tags.number,   color: syn.num },
  { tag: tags.bool,     color: syn.num, fontWeight: "bold" },
  { tag: tags.null,     color: syn.num, fontWeight: "bold" },
  { tag: tags.unit,                    color: syn.num },
  { tag: tags.constant(tags.name),    color: syn.num, fontWeight: "bold" },
  { tag: tags.atom,                   color: syn.num },

  // ── Functions / variables ─────────────────────────────────────────────────
  { tag: tags.function(tags.variableName),                          color: syn.fn },
  { tag: tags.function(tags.propertyName),                          color: syn.fn },
  { tag: tags.definition(tags.variableName),                        color: syn.fn },
  { tag: tags.definition(tags.function(tags.variableName)),         color: syn.fn, fontWeight: "bold" },
  { tag: tags.variableName,                                         color: syn.fn },
  { tag: tags.name,                                                 color: syn.fn },
  { tag: tags.labelName,                                            color: syn.fn },

  // ── Properties / attributes ───────────────────────────────────────────────
  { tag: tags.propertyName,                    color: syn.prop },
  { tag: tags.attributeName,                   color: syn.prop },
  { tag: tags.definition(tags.propertyName),   color: syn.prop, fontStyle: "italic" },

  // ── Meta / special ────────────────────────────────────────────────────────
  { tag: tags.meta,                       color: syn.meta },
  { tag: tags.annotation,                 color: syn.meta },
  { tag: tags.special(tags.variableName), color: syn.meta },
  { tag: tags.processingInstruction,      color: syn.meta },
  { tag: tags.macroName,                  color: syn.meta },
  { tag: tags.documentMeta,               color: syn.meta, fontStyle: "italic" },

  // ── Comments ──────────────────────────────────────────────────────────────
  { tag: tags.comment,     color: "var(--st-semantic-text-secondary)", fontStyle: "italic" },
  { tag: tags.lineComment, color: "var(--st-semantic-text-secondary)", fontStyle: "italic" },
  { tag: tags.blockComment,color: "var(--st-semantic-text-secondary)", fontStyle: "italic" },
  { tag: tags.docComment,  color: "var(--st-semantic-text-secondary)", fontStyle: "italic", fontWeight: "500" },

  // ── Operators / punctuation ───────────────────────────────────────────────
  { tag: tags.operator,     color: "var(--st-semantic-text-muted)" },
  { tag: tags.punctuation,  color: "var(--st-semantic-text-muted)" },
  { tag: tags.bracket,      color: "var(--st-semantic-text-muted)" },
  { tag: tags.separator,    color: "var(--st-semantic-text-muted)" },
  { tag: tags.derefOperator,color: "var(--st-semantic-text-muted)" },

  // ── Errors / changes ──────────────────────────────────────────────────────
  { tag: tags.invalid, color: syn.re, textDecoration: "underline" },
  { tag: tags.deleted, color: syn.re },
  { tag: tags.changed, color: syn.str },

  // ── Diff / insertions ─────────────────────────────────────────────────────
  { tag: tags.inserted, color: syn.num },

  // ── Markdown / markup ─────────────────────────────────────────────────────
  { tag: tags.heading,       color: syn.kw, fontWeight: "bold" },
  { tag: tags.strong,        fontWeight: "bold" },
  { tag: tags.emphasis,      fontStyle: "italic" },
  { tag: tags.strikethrough, textDecoration: "line-through" },
  { tag: tags.link,          color: "var(--st-semantic-text-link)", textDecoration: "underline" },
  { tag: tags.quote,         color: "var(--st-semantic-text-secondary)", fontStyle: "italic" },
  { tag: tags.list,          color: syn.kw },
  { tag: tags.color,         color: syn.prop },

  // ── HTML / XML ────────────────────────────────────────────────────────────
  { tag: tags.tagName,      color: syn.kw },
  { tag: tags.angleBracket, color: "var(--st-semantic-text-muted)" },
  { tag: tags.content,      color: "var(--st-semantic-text-primary)" },
]);

/**
 * Factory that returns a CodeMirror Extension combining the editor theme
 * and syntax highlighting, both wired to DS CSS variables.
 *
 * All syntax colors meet WCAG AA (≥ 4.5:1) on both the light surface
 * (#ffffff) and the subtle surface (#f8fafc, used by active lines / gutters).
 *
 * @example
 * ```ts
 * import { sentTechCodeMirror } from "@sentropic/design-system-codemirror";
 * const extensions = [basicSetup, sentTechCodeMirror()];
 * ```
 */
export function sentTechCodeMirror(options: SentTechCodeMirrorOptions = {}): Extension {
  const { dark = false } = options;
  return [makeEditorTheme(dark), syntaxHighlighting(sentTechHighlightStyle)];
}
