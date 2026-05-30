import { foundation } from "./foundation.js";
import { semantic } from "./semantic.js";
import type { ComponentAnatomy, DensityAnatomy, FieldAnatomy, TypographyAnatomy } from "./anatomy.js";

// Formes minimales requises par le builder (feuilles string/number), de sorte
// qu'un thème puisse passer son propre semantic/foundation (valeurs élargies en
// string) sans friction de types littéraux.
interface SemanticInput {
  surface: { default: string; subtle: string; raised: string; inverse: string; overlay: string };
  text: { primary: string; secondary: string; muted: string; inverse: string; link: string };
  action: { primary: string; primaryText: string; secondary: string; secondaryText: string; primaryHover?: string; secondaryHover?: string };
  border: { subtle: string; strong: string; interactive: string };
  feedback: { info: string; success: string; warning: string; error: string };
  data: { category1: string; category2: string; category3: string; category4: string };
}

// Density / typography / focus leaves a theme may or may not provide. Anatomy
// primitives are optional on the INPUT (a theme can omit them and fall back to
// the base) but the OUTPUT anatomy is fully typed via ComponentAnatomy.
type DensityInput = Partial<Record<"sm" | "md" | "lg", Partial<DensityAnatomy>>>;
type TypographyRolesInput = Partial<Record<"control" | "field" | "label" | "link", Partial<TypographyAnatomy>>>;

interface FocusInput {
  strategy?: string;
  width?: string;
  offset?: string;
  color?: string;
  inset?: string;
}

// Field style primitive a theme may or may not provide (v1.2.0). Optional on
// the INPUT (fallback = outline / base look); the OUTPUT FieldAnatomy is fully
// typed. `fillBg`/`underlineColor`/`underlineWidth` only matter when
// style = filled-underline; for outline the builder uses semantic roles.
interface FieldInput {
  style?: string;
  fillBg?: string;
  underlineColor?: string;
  underlineWidth?: string;
  // v1.3.0 (additive): top-corner radius override for the field. When omitted,
  // the field's top corners inherit the theme's own shape radius (no change).
  radiusTop?: string;
  // v1.3.0 (additive): how the filled-underline bottom rule is drawn.
  //  - "shadow": a `box-shadow inset` (the REAL DSFR « Champ de saisie »
  //    technique) — no geometric border, adds no box height.
  //  - "border" (default): a real `border-bottom` (the REAL Carbon « Text
  //    input » technique, which genuinely uses a 1px bottom border).
  // Kept a string (not a boolean) so the `foundation` object stays a TokenTree.
  underlineMode?: string;
  // v1.4.0 (additive, F5/F9 — native <select>): a native <select> with
  // `appearance: auto` has its line-height forced to `normal` by the browser, so
  // the anatomy line-height never lands; `appearance: none` lets it take effect
  // (the real DSFR/Carbon selects use `appearance: none`). Optional on the INPUT
  // (fallback = "auto" → base keeps its native arrow + render unchanged).
  selectAppearance?: string;
  // Custom chevron background drawn when selectAppearance === "none" (the native
  // arrow is suppressed). Fallback "none" (base keeps the native arrow).
  selectChevron?: string;
  // Right padding reserving the chevron gutter (F9). Fallback "2rem" (the prior
  // arrow gap → base unchanged); DSFR 40px, Carbon 48px.
  selectPaddingRight?: string;
}

// Card surface primitive a theme may or may not provide. Optional on the INPUT
// (fallback = base Sent Tech: a `borderWidth.thin` stroke + surface.raised fill).
// DSFR .fr-card / Carbon .bx--tile have NO border; Carbon's tile fill is the
// $layer-01 grey (#f4f4f4). `borderWidth` lets a theme drop the stroke to 0 and
// `background` lets it pick a layer tone — both without touching the base look.
interface CardInput {
  borderWidth?: string;
  background?: string;
  // F5 (additive): per-theme card body typography. The base card renders its
  // content with an inherited font-size, `line-height: normal` and
  // `letter-spacing: normal` (no explicit type) — so these default to values
  // that REPRODUCE that exact render (inherit / normal / normal). DSFR sets
  // lineHeight to 24px-equivalent (1.5) and Carbon pins its real tile body
  // metrics (14px / 14px / 0.16px) so `.st-card` matches the measured reference
  // instead of `normal`. Base Sent Tech stays untouched.
  fontSize?: string;
  lineHeight?: string;
  letterSpacing?: string;
}

// Tabs ACTIVE-tab primitive a theme may or may not provide (F7/F8, additive).
// The base Sent Tech tab renders its label with the control typography (600,
// line-height 1.2), an inherited font-size, a 12px/4px padding and a BOTTOM
// indicator; the active tab keeps a transparent background and the primary text
// colour. Every leaf below DEFAULTS to that exact render, so the base look is
// untouched; DSFR / Carbon set the real selected-tab metrics:
//  - DSFR « Onglet » actif: white fill, Bleu France text, weight 700, padding
//    8px/16px, and a TOP accent (no bottom border) — `indicatorSide: "top"`.
//  - Carbon « Tabs » actif: 14px / 16px line-height, 0 inline padding, a blue
//    BOTTOM indicator (the real selected-tab design; the mobile-base grey the
//    bench measures at <672px is a breakpoint artifact, justified in the tracker).
// Button SECONDARY-variant primitive a theme may or may not provide (G1, additive).
// The base Sent Tech secondary button is a FILLED neutral surface with a subtle
// 1px stroke (background = action.secondary, border = border.subtle, hover =
// action.secondaryHover). Every leaf below DEFAULTS to that exact render so the
// base look is byte-identical; a theme overrides only what its real secondary
// button needs. DSFR « Bouton secondaire » is an OUTLINED button: transparent
// fill, a 1px Bleu France border and Bleu France text (the light-blue FILL we
// rendered before was wrong) — `background: "transparent"`, `border: Bleu France`,
// a light Bleu France fill on hover. Carbon « Secondary button » stays a solid
// Gray 80 fill (the base default reproduces it — no override needed).
interface ButtonSecondaryInput {
  background?: string;      // secondary fill; default = semantic.action.secondary
  border?: string;          // secondary border colour; default = semantic.border.subtle
  hoverBackground?: string; // secondary :hover fill; default = action.secondaryHover ?? secondary
}

interface TabsInput {
  activeText?: string;        // active tab text colour; default = semantic.text.primary
  activeBackground?: string;  // active tab background; default "transparent"
  // G2 (additive): the RESTING (inactive) tab background. Default "transparent"
  // (current base/Carbon render). DSFR « Onglet » non sélectionné carries a
  // light grey-blue fill (--background-action-low-blue-france #e3e3fd) so the
  // active white tab reads as raised above the inactive ones.
  inactiveBackground?: string;
  activeWeight?: string;      // active tab font-weight; default = control weight
  paddingBlock?: string;      // tab vertical padding; default "0.75rem" (12px, current)
  paddingInline?: string;     // tab horizontal padding; default "0.25rem" (4px, current)
  fontSize?: string;          // tab font-size; default "inherit" (current inherited render)
  lineHeight?: string;        // tab line-height; default = control lineHeight
  indicatorSide?: string;     // "bottom" (base/Carbon) | "top" (DSFR); default "bottom"
  // HOW the active indicator is drawn (F7). "border" (default, base/Carbon): a
  // real per-side border on the indicator edge — its width/style/colour are
  // measured. "shadow" (DSFR): an inset `box-shadow` accent on the indicator
  // edge, so BOTH border sides stay `0 none` (the real DSFR technique — the
  // official `.fr-tabs__tab` accent is a background-image filet, not a border).
  indicatorMode?: string;
}

// F10 (additive) — Pagination ACTIVE-page primitive. Every leaf is optional and
// DEFAULTS to the current base render (1px subtle stroke, radius.md, 0 block /
// 12px inline padding, filled action.primary active page, inherited typography),
// so the base Sent Tech pagination is byte-identical. DSFR fills the active page
// with Bleu France (no border, 14px / 24px line-height); Carbon renders the
// active page as a borderless 48px square with 0.16px-tracked 14px/600 text.
interface PaginationInput {
  background?: string;        // resting page background; default = semantic.surface.default
  border?: string;           // page border colour; default = semantic.border.subtle
  borderWidth?: string;      // page border width; default = thin (1px)
  text?: string;             // resting page text colour; default = semantic.text.primary
  radius?: string;           // page corner radius; default = foundation.radius.md
  activeBackground?: string; // active page background; default = semantic.action.primary
  activeText?: string;       // active page text colour; default = semantic.action.primaryText
  activeBorder?: string;     // active page border colour; default = page `border`
  activeBorderWidth?: string;// active page border width; default = page `borderWidth`
  activeWeight?: string;     // active page font-weight; default = "inherit"
  disabledText?: string;     // disabled control text colour; default = semantic.text.muted
  paddingBlock?: string;     // page vertical padding; default "0" (current render)
  paddingInline?: string;    // page horizontal padding; default "0.75rem" (12px, current)
  minSize?: string;          // page min-width / min-height; default "2.25rem" (36px, current)
  fontSize?: string;         // page font-size; default "inherit" (current inherited render)
  lineHeight?: string;       // page line-height; default "normal" (current render)
  letterSpacing?: string;    // page letter-spacing; default "normal" (current render)
}

// F10 (additive) — Breadcrumb LINK/typography primitive. Every leaf is optional
// and DEFAULTS to the current base render (link reads semantic.text.link, no
// explicit font metrics → inherited 16px / normal). DSFR pins the grey 12px /
// 20px breadcrumb link; Carbon pins the 14px / 18px / 0.16px-tracked link.
interface BreadcrumbInput {
  text?: string;          // trail (non-link) text colour; default = semantic.text.secondary
  linkText?: string;      // link colour; default = semantic.text.link
  currentText?: string;   // current-page text colour; default = semantic.text.primary
  separator?: string;     // separator glyph colour; default = semantic.text.muted
  fontSize?: string;      // breadcrumb font-size; default "inherit" (current render)
  lineHeight?: string;    // breadcrumb line-height; default "normal" (current render)
  letterSpacing?: string; // breadcrumb letter-spacing; default "normal" (current render)
  currentWeight?: string; // current-page font-weight; default "600" (current render)
}

// P-B (additive) — Alert / inline-notification primitive. Every leaf is optional
// and DEFAULTS to the current base render: a `surface.raised` fill, a 1px
// `border.subtle` box, a 4px left accent coloured per severity, 16px padding on
// all sides and the inherited body typography (`normal` line-height). So the
// base Sent Tech alert is byte-identical. DSFR « Alerte » draws NO box border and
// NO fill — its severity accent is a left FILET drawn as a `::before` (not a
// border), so all four measured borders are 0; Carbon « inline notification » is
// a dark Gray-80 banner with white text and a 3px coloured LEFT BAR (a real
// border) and the rest of the padding carried by inner wrappers.
interface AlertInput {
  background?: string;       // alert fill; default = semantic.surface.raised
  text?: string;             // alert text colour; default = semantic.text.primary
  // Per-side border shorthands (`<width> <style> <color>` or `none`). Default =
  // the base 1px subtle box on top/right/bottom; the LEFT side is the accent edge
  // (default 4px, coloured per severity by the component). A theme can drop the
  // box (DSFR: all `none`) or keep only a coloured left bar (Carbon).
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  // The LEFT border WIDTH only (its colour is the per-severity accent, applied by
  // the component). Default "0.25rem" (4px, current). DSFR sets "0" (accent is a
  // ::before filet, not a border); Carbon sets "3px".
  accentWidth?: string;
  // The FILET width — a `::before` left bar coloured per severity, drawn INSIDE
  // the box so it adds NO measured border. Default "0" (no filet; base/Carbon use
  // a real left border). DSFR sets "0.25rem" (4px) AND accentWidth "0", so the
  // accent reads as a filet and all four measured borders stay 0 — matching the
  // real `.fr-alert`.
  filetWidth?: string;
  paddingTop?: string;       // default "1rem" (16px, current)
  paddingRight?: string;     // default "1rem"
  paddingBottom?: string;    // default "1rem"
  paddingLeft?: string;      // default "1rem"
  fontSize?: string;         // default "inherit" (current — title/message set their own)
  lineHeight?: string;       // default "normal" (current render)
  letterSpacing?: string;    // default "normal" (current render)
  // Per-severity accent colour overrides. Default = the matching `semantic.
  // feedback.*` role (base unchanged). Carbon's inline-notification accent is a
  // dedicated lighter Blue (#4589ff $support-info-inverse-ish), distinct from its
  // `feedback.info` ($0043ce), so it overrides `accentInfo` without touching the
  // shared feedback role other components read.
  accentInfo?: string;
  accentSuccess?: string;
  accentWarning?: string;
  accentError?: string;
}

// P-B (additive) — Accordion TRIGGER primitive. Every leaf is optional and
// DEFAULTS to the current base render (14px block / 8px inline padding, inherited
// font-size via `font: inherit`, weight 600, `normal` line-height, primary text).
// So the base Sent Tech accordion is byte-identical. DSFR « Accordéon » header:
// 12px/16px padding, 16px / 24px line-height, weight 500, Bleu France text.
// Carbon « Accordion » heading: 10px block / 0 inline padding, 14px font, weight
// 400, primary text.
interface AccordionInput {
  text?: string;             // trigger text colour; default = semantic.text.primary
  paddingBlock?: string;     // trigger vertical padding; default "0.875rem" (14px, current)
  paddingInline?: string;    // trigger horizontal padding; default "0.5rem" (8px, current)
  fontSize?: string;         // trigger font-size; default "inherit" (current render)
  fontWeight?: string;       // trigger font-weight; default "600" (current render)
  lineHeight?: string;       // trigger line-height; default "normal" (current render)
}

interface FoundationInput {
  radius: { none?: string; sm?: string; md: string; lg: string; pill: string };
  shadow: { subtle: string; medium: string; floating: string };
  spacing: { readonly [key: number]: string };
  z: { overlay: number; modal: number; toast: number };
  // Anatomy primitives (Phase 1) — optional so legacy callers still type-check.
  borderWidth?: { none?: string; thin?: string; thick?: string };
  borderStyle?: { solid?: string };
  density?: DensityInput;
  typography?: TypographyRolesInput;
  disabledOpacity?: string;
  transition?: { property?: string; duration?: string; easing?: string };
  cursor?: { interactive?: string; disabled?: string; text?: string };
  iconSize?: { sm?: string; md?: string; lg?: string };
  focus?: FocusInput;
  field?: FieldInput;
  card?: CardInput;
  tabs?: TabsInput;
  // G1 (additive): the SECONDARY-variant button surface. Optional — when omitted
  // (base/Carbon) the secondary button keeps the base render (filled neutral +
  // subtle stroke). DSFR sets a transparent fill + Bleu France border + text to
  // render its real OUTLINED « Bouton secondaire ».
  buttonSecondary?: ButtonSecondaryInput;
  // F10 (additive): per-theme Pagination / Breadcrumb anatomy. Optional — when
  // omitted (base) both keep the current render via the resolver defaults.
  pagination?: PaginationInput;
  breadcrumb?: BreadcrumbInput;
  // P-B (additive): per-theme Alert / Accordion anatomy. Optional — when omitted
  // (base) both keep the current render via the resolver defaults.
  alert?: AlertInput;
  accordion?: AccordionInput;
  // F9 (additive): a BUTTON-specific density override. The button shares the
  // control `density` scale with the fields (Input/Select/Textarea/Tabs all read
  // it), so a button-only geometry — e.g. Carbon's tall 48px primary button with
  // its asymmetric label-left padding (block 11px, left 16px, large right gutter)
  // — cannot live on the shared density without regressing the 100%-fidelity
  // fields. `buttonDensity` overrides ONLY the button anatomy's density per size.
  // Optional: when omitted (base/DSFR), the button keeps the shared density →
  // unchanged. `paddingInlineEnd` (optional) gives the trailing side a different
  // value from `paddingInline` for an asymmetric button (Carbon).
  buttonDensity?: Partial<Record<"sm" | "md" | "lg", Partial<DensityAnatomy> & { paddingInlineEnd?: string }>>;
}

// Defaults used when a theme omits an anatomy primitive. These mirror the base
// foundation so the OUTPUT is always a complete, typed ComponentAnatomy.
const FALLBACK = {
  borderWidth: { none: "0", thin: "1px", thick: "2px" },
  borderStyle: "solid",
  density: {
    // fontSize per size (v1.1.0): md mirrors the control typography size; sm/lg
    // carry the label scale so the font rides with the control geometry.
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.75rem", gap: "0.375rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1rem" }
  } satisfies Record<"sm" | "md" | "lg", DensityAnatomy>,
  typography: {
    control: { family: "var(--st-font-sans)", size: "0.9375rem", weight: "600", lineHeight: "1.2", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "var(--st-font-sans)", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "var(--st-font-sans)", size: "0.875rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Base/DSFR links are underlined at rest → underline on hover is a no-op.
    link: { family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none", textDecoration: "underline", decorationThickness: "auto", decorationOffset: "0.18em", textDecorationHover: "underline" }
  } satisfies Record<"control" | "field" | "label" | "link", TypographyAnatomy>,
  disabledOpacity: "0.55",
  transition: { property: "background-color, border-color, color, box-shadow, outline-color", duration: "120ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  focus: { strategy: "outline", width: "2px", offset: "2px", color: "var(--st-semantic-border-interactive)", inset: "0" },
  // Field style fallback = boxed outline (base Sent Tech). underlineColor /
  // underlineWidth are inert for outline; they only drive filled-underline.
  // radiusTop "" = inherit the theme's shape radius (resolved in fieldOf).
  // v1.4.0: selectAppearance "auto" (native arrow, base unchanged), no chevron,
  // and the prior 2rem right arrow gap.
  field: { style: "outline", fillBg: "", underlineColor: "", underlineWidth: "1px", radiusTop: "", selectAppearance: "auto", selectChevron: "none", selectPaddingRight: "2rem" }
} as const;

function densityOf(f: FoundationInput, size: "sm" | "md" | "lg"): DensityAnatomy {
  const base = FALLBACK.density[size];
  const themed = f.density?.[size] ?? {};
  return {
    controlHeight: themed.controlHeight ?? base.controlHeight,
    paddingBlock: themed.paddingBlock ?? base.paddingBlock,
    paddingInline: themed.paddingInline ?? base.paddingInline,
    gap: themed.gap ?? base.gap,
    minWidth: themed.minWidth ?? base.minWidth,
    fontSize: themed.fontSize ?? base.fontSize
  };
}

/**
 * Button density (F9): the shared control density for `size`, overlaid with any
 * BUTTON-specific override (`buttonDensity`). Adds an optional `paddingInlineEnd`
 * leaf so a button can be asymmetric (Carbon's large trailing gutter) without
 * touching the shared density the 100%-fidelity fields read. When the theme omits
 * `buttonDensity` (base/DSFR), this is identical to `densityOf` → no change, and
 * `paddingInlineEnd` mirrors `paddingInline` (symmetric).
 */
function buttonDensityOf(f: FoundationInput, size: "sm" | "md" | "lg"): DensityAnatomy {
  const base = densityOf(f, size);
  const override = f.buttonDensity?.[size] ?? {};
  const paddingInline = override.paddingInline ?? base.paddingInline;
  return {
    controlHeight: override.controlHeight ?? base.controlHeight,
    paddingBlock: override.paddingBlock ?? base.paddingBlock,
    paddingInline,
    gap: override.gap ?? base.gap,
    minWidth: override.minWidth ?? base.minWidth,
    fontSize: override.fontSize ?? base.fontSize,
    // Trailing inline padding: an explicit asymmetric value (Carbon) or = paddingInline.
    paddingInlineEnd: override.paddingInlineEnd ?? paddingInline
  };
}

/**
 * Tabs ACTIVE-tab resolution (F7/F8). Resolves the per-theme selected-tab
 * primitive into a flat, CSS-ready set the Tabs component consumes verbatim.
 * Every leaf DEFAULTS to the prior base render (12px/4px padding, inherited
 * font-size, control weight/line-height, transparent active bg, primary text,
 * BOTTOM indicator) so the base Sent Tech tab is byte-identical; DSFR / Carbon
 * override the real selected-tab metrics. `indicatorSide` resolves into two
 * border-width channels so a theme can put its accent on the top edge (DSFR,
 * which then has NO bottom border) or the bottom edge (base / Carbon).
 */
function tabsOf(
  f: FoundationInput,
  controlTypography: TypographyAnatomy,
  indicatorWidth: string,
  indicatorColor: string,
  activeTextDefault: string
): {
  activeText: string;
  activeBackground: string;
  inactiveBackground: string;
  activeWeight: string;
  paddingBlock: string;
  paddingInline: string;
  fontSize: string;
  lineHeight: string;
  indicatorSide: string;
  activeBorderTopWidth: string;
  activeBorderBottomWidth: string;
  activeShadow: string;
} {
  const t = f.tabs ?? {};
  const indicatorSide = t.indicatorSide ?? "bottom";
  const indicatorMode = t.indicatorMode ?? "border";
  // The indicator lives on ONE edge; the opposite edge collapses to 0 so the
  // active tab matches the reference (DSFR active = border-bottom 0 / top accent).
  const onTop = indicatorSide === "top";
  // "shadow" mode draws the accent as an inset box-shadow so BOTH border sides
  // stay 0 (DSFR, whose real accent is a background-image filet, not a border).
  // "border" mode keeps the real per-side border (base / Carbon) and no shadow.
  const isShadow = indicatorMode === "shadow";
  const shadowOffset = onTop ? indicatorWidth : `-${indicatorWidth}`;
  return {
    activeText: t.activeText || activeTextDefault,
    activeBackground: t.activeBackground || "transparent",
    // G2: resting-tab fill. Default "transparent" (base/Carbon unchanged); DSFR
    // sets a light grey-blue fill so the white active tab reads as raised.
    inactiveBackground: t.inactiveBackground || "transparent",
    activeWeight: t.activeWeight ?? controlTypography.weight,
    paddingBlock: t.paddingBlock ?? "0.75rem",
    paddingInline: t.paddingInline ?? "0.25rem",
    fontSize: t.fontSize ?? "inherit",
    lineHeight: t.lineHeight ?? controlTypography.lineHeight,
    indicatorSide,
    activeBorderTopWidth: isShadow ? "0" : onTop ? indicatorWidth : "0",
    activeBorderBottomWidth: isShadow ? "0" : onTop ? "0" : indicatorWidth,
    activeShadow: isShadow ? `inset 0 ${shadowOffset} 0 0 ${indicatorColor}` : "none"
  };
}

/**
 * Button SECONDARY-variant resolution (G1). Resolves the per-theme secondary
 * button surface into a flat, CSS-ready set the Button component consumes
 * verbatim (background / border colour / hover background). Every leaf DEFAULTS
 * to the prior base render (filled `action.secondary`, `border.subtle` stroke,
 * `action.secondaryHover` hover) so the base Sent Tech secondary button is
 * byte-identical; DSFR overrides them to render its OUTLINED secondary button
 * (transparent fill + Bleu France border + light fill on hover).
 */
function buttonSecondaryOf(semantic: SemanticInput, f: FoundationInput): {
  background: string;
  border: string;
  hoverBackground: string;
} {
  const b = f.buttonSecondary ?? {};
  return {
    background: b.background || semantic.action.secondary,
    border: b.border || semantic.border.subtle,
    hoverBackground: b.hoverBackground || semantic.action.secondaryHover || semantic.action.secondary
  };
}

/**
 * Pagination resolution (F10). Resolves the per-theme pagination primitive into
 * a flat, CSS-ready set the Pagination component consumes verbatim. Every leaf
 * DEFAULTS to the prior base render (1px subtle stroke, radius.md, 0 block /
 * 12px inline padding, 36px min size, filled action.primary active page,
 * inherited font metrics) so the base Sent Tech pagination is byte-identical.
 * DSFR / Carbon override the real active-page metrics.
 */
function paginationOf(semantic: SemanticInput, f: FoundationInput, thin: string, radiusMd: string): {
  background: string;
  border: string;
  borderWidth: string;
  text: string;
  radius: string;
  activeBackground: string;
  activeText: string;
  activeBorder: string;
  activeBorderWidth: string;
  activeWeight: string;
  disabledText: string;
  paddingBlock: string;
  paddingInline: string;
  minSize: string;
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
} {
  const p = f.pagination ?? {};
  const border = p.border || semantic.border.subtle;
  const borderWidth = p.borderWidth ?? thin;
  return {
    background: p.background || semantic.surface.default,
    border,
    borderWidth,
    text: p.text || semantic.text.primary,
    radius: p.radius ?? radiusMd,
    activeBackground: p.activeBackground || semantic.action.primary,
    activeText: p.activeText || semantic.action.primaryText,
    // The active page can drop its border (DSFR/Carbon active page has none);
    // default = the resting page border so the base render is unchanged.
    activeBorder: p.activeBorder || border,
    activeBorderWidth: p.activeBorderWidth ?? borderWidth,
    activeWeight: p.activeWeight ?? "inherit",
    disabledText: p.disabledText || semantic.text.muted,
    paddingBlock: p.paddingBlock ?? "0",
    paddingInline: p.paddingInline ?? "0.75rem",
    minSize: p.minSize ?? "2.25rem",
    fontSize: p.fontSize ?? "inherit",
    lineHeight: p.lineHeight ?? "normal",
    letterSpacing: p.letterSpacing ?? "normal"
  };
}

/**
 * Breadcrumb resolution (F10). Resolves the per-theme breadcrumb primitive into
 * a flat set the Breadcrumb component consumes verbatim. Every leaf DEFAULTS to
 * the prior base render (link = text.link, no explicit font metrics → inherited
 * 16px / normal, current 600 weight on the current page). DSFR / Carbon pin the
 * real breadcrumb link colour + typography.
 */
function breadcrumbOf(semantic: SemanticInput, f: FoundationInput): {
  text: string;
  linkText: string;
  currentText: string;
  separator: string;
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  currentWeight: string;
} {
  const b = f.breadcrumb ?? {};
  return {
    text: b.text || semantic.text.secondary,
    linkText: b.linkText || semantic.text.link,
    currentText: b.currentText || semantic.text.primary,
    separator: b.separator || semantic.text.muted,
    fontSize: b.fontSize ?? "inherit",
    lineHeight: b.lineHeight ?? "normal",
    letterSpacing: b.letterSpacing ?? "normal",
    currentWeight: b.currentWeight ?? "600"
  };
}

/**
 * Alert resolution (P-B). Resolves the per-theme alert primitive into a flat,
 * CSS-ready set the Alert component consumes verbatim. Every leaf DEFAULTS to the
 * prior base render (surface.raised fill, 1px subtle box on top/right/bottom, a
 * 4px left accent edge, 16px padding all sides, inherited font / `normal`
 * line-height) so the base Sent Tech alert is byte-identical. DSFR drops the box
 * + fill (accent becomes a `::before` filet → left border 0); Carbon paints a
 * dark banner with a 3px coloured left bar (a real border).
 */
function alertOf(semantic: SemanticInput, f: FoundationInput, thin: string, borderStyle: string): {
  background: string;
  text: string;
  borderTop: string;
  borderRight: string;
  borderBottom: string;
  accentWidth: string;
  filetWidth: string;
  paddingTop: string;
  paddingRight: string;
  paddingBottom: string;
  paddingLeft: string;
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  accentInfo: string;
  accentSuccess: string;
  accentWarning: string;
  accentError: string;
} {
  const a = f.alert ?? {};
  // The base box border = 1px subtle on top/right/bottom (the left edge is the
  // accent, sized by accentWidth and coloured per severity by the component).
  const box = `${thin} ${borderStyle} ${semantic.border.subtle}`;
  return {
    background: a.background || semantic.surface.raised,
    text: a.text || semantic.text.primary,
    borderTop: a.borderTop || box,
    borderRight: a.borderRight || box,
    borderBottom: a.borderBottom || box,
    accentWidth: a.accentWidth ?? "0.25rem", // 4px (current)
    filetWidth: a.filetWidth ?? "0",          // no filet (base/Carbon use a real left border)
    paddingTop: a.paddingTop ?? "1rem",
    paddingRight: a.paddingRight ?? "1rem",
    paddingBottom: a.paddingBottom ?? "1rem",
    paddingLeft: a.paddingLeft ?? "1rem",
    fontSize: a.fontSize ?? "inherit",
    lineHeight: a.lineHeight ?? "normal",
    letterSpacing: a.letterSpacing ?? "normal",
    accentInfo: a.accentInfo || semantic.feedback.info,
    accentSuccess: a.accentSuccess || semantic.feedback.success,
    accentWarning: a.accentWarning || semantic.feedback.warning,
    accentError: a.accentError || semantic.feedback.error
  };
}

/**
 * Accordion resolution (P-B). Resolves the per-theme accordion-trigger primitive
 * into a flat set the Accordion component consumes verbatim. Every leaf DEFAULTS
 * to the prior base render (14px block / 8px inline padding, inherited font-size,
 * weight 600, `normal` line-height, primary text) so the base Sent Tech accordion
 * is byte-identical. DSFR / Carbon pin the real header metrics.
 */
function accordionOf(semantic: SemanticInput, f: FoundationInput): {
  text: string;
  paddingBlock: string;
  paddingInline: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
} {
  const a = f.accordion ?? {};
  return {
    text: a.text || semantic.text.primary,
    paddingBlock: a.paddingBlock ?? "0.875rem", // 14px (current)
    paddingInline: a.paddingInline ?? "0.5rem", // 8px (current)
    fontSize: a.fontSize ?? "inherit",
    fontWeight: a.fontWeight ?? "600",
    lineHeight: a.lineHeight ?? "normal"
  };
}

function typographyOf(f: FoundationInput, role: "control" | "field" | "label" | "link"): TypographyAnatomy {
  // Widen to TypographyAnatomy so the optional textDecorationHover leaf is
  // readable across all roles (only `link` carries it in the FALLBACK literal).
  const base: TypographyAnatomy = FALLBACK.typography[role];
  const themed = f.typography?.[role] ?? {};
  return {
    family: themed.family ?? base.family,
    size: themed.size ?? base.size,
    weight: themed.weight ?? base.weight,
    lineHeight: themed.lineHeight ?? base.lineHeight,
    letterSpacing: themed.letterSpacing ?? base.letterSpacing,
    textTransform: themed.textTransform ?? base.textTransform,
    textDecoration: themed.textDecoration ?? base.textDecoration,
    decorationThickness: themed.decorationThickness ?? base.decorationThickness,
    decorationOffset: themed.decorationOffset ?? base.decorationOffset,
    textDecorationHover: themed.textDecorationHover ?? base.textDecorationHover
  };
}

function focusOf(f: FoundationInput): ComponentAnatomy["focus"] {
  const base = FALLBACK.focus;
  const themed = f.focus ?? {};
  const strategy = (themed.strategy ?? base.strategy) as ComponentAnatomy["focus"]["strategy"];
  const width = themed.width ?? base.width;
  const offset = themed.offset ?? base.offset;
  const color = themed.color ?? base.color;
  const inset = themed.inset ?? base.inset;
  // The focus STRATEGY is resolved here into the two CSS channels a shared
  // mixin needs: `outline` and `boxShadow`. A component applies BOTH on
  // :focus-visible; the strategy decides which is "live" (the other is a no-op).
  // This is what lets DSFR (offset outline) and Carbon (inset box-shadow) differ
  // by *technique*, not just values, while staying 100% token-driven.
  let outline = "none";
  let boxShadow = "none";
  switch (strategy) {
    case "outline":
      // DSFR-like: native outline, offset away from the box.
      outline = `${width} solid ${color}`;
      break;
    case "ring":
      // Base default: a soft ring drawn just outside the box.
      boxShadow = `0 0 0 ${width} ${color}`;
      break;
    case "inset":
      // Carbon: a ring drawn INSIDE the box via inset box-shadow.
      boxShadow = `inset 0 0 0 ${width} ${color}`;
      break;
    case "double":
      // Two-tone accessibility ring (outer color + inner light gap).
      outline = `${width} solid ${color}`;
      boxShadow = `0 0 0 ${inset} #ffffff`;
      break;
  }
  return { strategy, width, offset, color, inset, outline, boxShadow };
}

/**
 * Resolves the FIELD STYLE (v1.2.0) into a fully-typed FieldAnatomy: a fill
 * background + four per-side border shorthands a component applies verbatim.
 *
 * - `outline` (default, base Sent Tech): `fillBg = surface.default`, the four
 *   borders all = `<borderWidth.thin> solid <border.subtle>`. This reproduces
 *   the existing boxed input EXACTLY → no Sent Tech regression.
 * - `filled-underline` (DSFR / Carbon): `fillBg` = the theme's field fill tone,
 *   top/right/left = `none`, the bottom rule is the only stroke. HOW the bottom
 *   rule is drawn depends on the theme's real technique:
 *     · DSFR (`underlineAsShadow: true`) draws it as a `box-shadow inset` (its
 *       real CSS), so `borderBottom` is `none` and the rule adds no box height.
 *     · Carbon (default) genuinely uses a real `border-bottom: 1px solid` — so
 *       we keep the geometric `borderBottom` and leave `underline` = `none` to
 *       stay pixel-identical to the official `.bx--text-input`.
 *
 * v1.3.0 (additive): `radiusTop` rounds only the field's TOP corners (defaults
 * to the theme's `shapeRadius` so a boxed field stays uniform — no regression);
 * `underline` carries the filled-underline bottom rule as an inset box-shadow
 * when `underlineAsShadow` is set; `focusShadow` composes it with the focus ring.
 */
function fieldOf(
  semantic: SemanticInput,
  f: FoundationInput,
  bw: { none?: string; thin?: string; thick?: string },
  borderStyle: string,
  shapeRadius: string,
  focusBoxShadow: string
): FieldAnatomy {
  const themed = f.field ?? {};
  const style = (themed.style ?? FALLBACK.field.style) as FieldAnatomy["style"];
  const thin = bw.thin ?? "1px";
  // v1.4.0 (F5/F9) — native <select> rendering. These are independent of the
  // outline/filled-underline branch, so resolve them once and spread into each
  // returned FieldAnatomy. selectAppearance "auto" keeps the base native arrow
  // (and its UA-forced `line-height: normal`); "none" lets the anatomy
  // line-height take effect, the chevron then drawn by selectChevron.
  const selectAppearance = themed.selectAppearance ?? FALLBACK.field.selectAppearance;
  const selectChevron = themed.selectChevron ?? FALLBACK.field.selectChevron;
  const selectPaddingRight = themed.selectPaddingRight ?? FALLBACK.field.selectPaddingRight;
  const selectLeaves = { selectAppearance, selectChevron, selectPaddingRight };
  // Top corners inherit the theme's shape radius unless the theme rounds them
  // explicitly (DSFR field = 4px top). Bottom corners always keep shapeRadius.
  const radiusTop = themed.radiusTop || shapeRadius;
  // Compose the field focus box-shadow so the resting underline is never lost
  // incoherently: an outline-strategy theme (focusBoxShadow === "none") keeps
  // the underline; an inset/ring theme stacks its ring + the underline.
  const composeFocus = (underline: string): string => {
    const ring = focusBoxShadow && focusBoxShadow !== "none" ? focusBoxShadow : "";
    if (underline === "none") return ring || "none";
    if (!ring) return underline; // outline theme: keep the underline at focus
    return `${ring}, ${underline}`; // inset/ring theme: ring + underline
  };

  if (style === "filled-underline") {
    const fillBg = themed.fillBg || semantic.surface.subtle;
    const underlineColor = themed.underlineColor || semantic.border.strong;
    const underlineWidth = themed.underlineWidth || thin;
    // DSFR draws the rule as an inset box-shadow (its real technique, cf. rule
    // `underline-hardcoded-border`); Carbon keeps a real geometric border-bottom
    // (its real technique) so it stays pixel-identical to `.bx--text-input`.
    if (themed.underlineMode === "shadow") {
      const underline = `inset 0 -${underlineWidth} 0 0 ${underlineColor}`;
      return {
        style,
        fillBg,
        borderTop: "none",
        borderRight: "none",
        borderBottom: "none",
        borderLeft: "none",
        radiusTop,
        underline,
        focusShadow: composeFocus(underline),
        ...selectLeaves
      };
    }
    return {
      style,
      fillBg,
      borderTop: "none",
      borderRight: "none",
      borderBottom: `${underlineWidth} ${borderStyle} ${underlineColor}`,
      borderLeft: "none",
      radiusTop,
      underline: "none",
      focusShadow: composeFocus("none"),
      ...selectLeaves
    };
  }

  // outline (default): boxed, 4 equal borders — identical to the prior look.
  const fillBg = themed.fillBg || semantic.surface.default;
  const border = `${thin} ${borderStyle} ${semantic.border.subtle}`;
  return {
    style: "outline",
    fillBg,
    borderTop: border,
    borderRight: border,
    borderBottom: border,
    borderLeft: border,
    radiusTop,
    underline: "none",
    focusShadow: composeFocus("none"),
    ...selectLeaves
  };
}

/**
 * Construit la couche `component` à partir d'un `semantic` et d'un `foundation`
 * donnés. Les rôles composant sont CÂBLÉS sur les rôles semantic/foundation du
 * thème appelant — c'est ce qui permet à un thème (DSFR, Carbon, forge…) de
 * propager sa marque jusqu'aux composants. Réutiliser un `component` figé sur
 * une autre base rendrait les composants inertes au changement de thème.
 */
export function createComponent(semantic: SemanticInput, foundation: FoundationInput) {
  const bw = { ...FALLBACK.borderWidth, ...(foundation.borderWidth ?? {}) };
  const borderStyle = foundation.borderStyle?.solid ?? FALLBACK.borderStyle;
  const disabledOpacity = foundation.disabledOpacity ?? FALLBACK.disabledOpacity;
  const cursor = { ...FALLBACK.cursor, ...(foundation.cursor ?? {}) };
  const icon = { ...FALLBACK.iconSize, ...(foundation.iconSize ?? {}) };
  const focus = focusOf(foundation);

  // Anatomy block for the 5 pilot components. Typed against ComponentAnatomy so
  // a theme cannot drift the *shape*; values resolve from this theme's own
  // foundation (radius/density/typography/focus) → the brand reaches anatomy.
  const buttonAnatomy: ComponentAnatomy = {
    shape: { radius: foundation.radius.md, borderWidth: bw.thin, borderStyle },
    // F9: button-specific density (shared control density + optional button-only
    // override) so Carbon's tall, asymmetric primary button doesn't regress the
    // fields that share the control density. Base/DSFR get the shared density.
    density: { sm: buttonDensityOf(foundation, "sm"), md: buttonDensityOf(foundation, "md"), lg: buttonDensityOf(foundation, "lg") },
    typography: typographyOf(foundation, "control"),
    focus,
    icon: { size: icon.md, gap: densityOf(foundation, "md").gap },
    states: {
      // v1.1.0: hover bg sourced from the semantic layer (primaryHover, with a
      // fallback to primary so a theme that omits it stays inert, not blank).
      hover: { bg: semantic.action.primaryHover ?? semantic.action.primary, transform: "none" },
      active: { transform: "none" },
      disabled: { opacity: disabledOpacity }
    }
  };

  const inputAnatomy: ComponentAnatomy = {
    shape: { radius: foundation.radius.md, borderWidth: bw.thin, borderStyle },
    density: { sm: densityOf(foundation, "sm"), md: densityOf(foundation, "md"), lg: densityOf(foundation, "lg") },
    typography: typographyOf(foundation, "field"),
    focus,
    // Field style (v1.2.0): outline (boxed, base) vs filled-underline (DSFR/Carbon).
    // v1.3.0: radiusTop defaults to the field's own shape radius (radius.md);
    // the underline is an inset box-shadow, composed with the focus ring.
    field: fieldOf(semantic, foundation, bw, borderStyle, foundation.radius.md, focus.boxShadow),
    states: {
      hover: { border: semantic.border.strong },
      focus: { border: semantic.border.interactive },
      // Inputs convey disabled via bg + text, not via global dimming.
      disabled: { bg: semantic.surface.subtle, text: semantic.text.muted }
    }
  };

  const linkTypography = typographyOf(foundation, "link");
  const linkAnatomy: ComponentAnatomy = {
    shape: { radius: foundation.radius.sm ?? foundation.radius.md, borderWidth: bw.none, borderStyle },
    typography: linkTypography,
    focus,
    states: {
      // v1.1.0: hover decoration sourced from the link role typography
      // (textDecorationHover). DSFR/base = underline (no-op vs rest); Carbon
      // goes none → underline on hover. Fallback to underline if a theme omits.
      hover: { text: semantic.action.primary, decoration: linkTypography.textDecorationHover ?? "underline" },
      disabled: { text: semantic.text.muted, decoration: "none", opacity: disabledOpacity }
    }
  };

  // Card surface (additive): borderWidth defaults to the base `thin` stroke so
  // Sent Tech is unchanged; DSFR/Carbon set it to 0 (their cards/tiles have no
  // border). The fill defaults to surface.raised (base), Carbon overrides it to
  // its $layer-01 tone via `card.background`.
  const cardBorderWidth = foundation.card?.borderWidth ?? bw.thin;
  const cardBackground = foundation.card?.background || semantic.surface.raised;
  // F5 (additive): the card body typography. The base `.st-card` carries NO
  // explicit font-size / line-height / letter-spacing, so the defaults here
  // REPRODUCE that exact render (inherit / normal / normal). DSFR/Carbon pin
  // their real tile body metrics so the card text matches the measured
  // reference instead of `normal`. Family/weight stay on the field role (no
  // visible change — the card already inherits the brand sans + 400).
  const cardTypographyBase = typographyOf(foundation, "field");
  const cardTypography: TypographyAnatomy = {
    ...cardTypographyBase,
    size: foundation.card?.fontSize ?? "inherit",
    lineHeight: foundation.card?.lineHeight ?? "normal",
    letterSpacing: foundation.card?.letterSpacing ?? "normal"
  };
  const cardAnatomy: ComponentAnatomy = {
    shape: { radius: foundation.radius.lg, borderWidth: cardBorderWidth, borderStyle },
    typography: cardTypography,
    focus,
    states: {
      hover: { transform: "translateY(-1px)" }
    }
  };

  const tabsControlTypography = typographyOf(foundation, "control");
  const tabsAnatomy: ComponentAnatomy = {
    shape: { radius: foundation.radius.none ?? "0", borderWidth: bw.thin, borderStyle },
    density: { md: densityOf(foundation, "md") },
    typography: tabsControlTypography,
    focus,
    states: {
      hover: { text: semantic.text.primary },
      disabled: { opacity: disabledOpacity }
    }
  };
  // F7/F8 — active-tab metrics (additive, per-theme; base render unchanged).
  // The indicator width is the tab's stroke width (thin); `tabsOf` resolves it
  // onto the top edge (DSFR) or the bottom edge (base/Carbon), as a real border
  // (base/Carbon) or an inset box-shadow accent (DSFR).
  const tabsResolved = tabsOf(foundation, tabsControlTypography, bw.thin, semantic.action.primary, semantic.text.primary);

  // G1 — secondary button surface (per theme; base render unchanged). DSFR
  // overrides it to a transparent fill + Bleu France border + text; base/Carbon
  // keep the filled neutral default.
  const buttonSecondary = buttonSecondaryOf(semantic, foundation);

  // F10 — Pagination / Breadcrumb anatomy (per theme; base render unchanged).
  const paginationResolved = paginationOf(semantic, foundation, bw.thin, foundation.radius.md);
  const breadcrumbResolved = breadcrumbOf(semantic, foundation);

  // P-B — Alert / Accordion anatomy (per theme; base render unchanged).
  const alertResolved = alertOf(semantic, foundation, bw.thin, borderStyle);
  const accordionResolved = accordionOf(semantic, foundation);

  return {
    button: {
      radius: foundation.radius.md,
      primaryBackground: semantic.action.primary,
      primaryText: semantic.action.primaryText,
      // G1: the secondary surface is resolved per theme (transparent + bordered
      // for DSFR's outlined secondary; filled neutral for base/Carbon).
      secondaryBackground: buttonSecondary.background,
      secondaryBorder: buttonSecondary.border,
      secondaryHoverBackground: buttonSecondary.hoverBackground,
      secondaryText: semantic.action.secondaryText,
      anatomy: buttonAnatomy
    },
    link: {
      text: semantic.text.link,
      hoverText: semantic.action.primary,
      disabledText: semantic.text.muted,
      focusRing: semantic.border.interactive,
      anatomy: linkAnatomy
    },
    alert: {
      // Existing leaves keep their names (consumers/docs unchanged); background
      // and text now resolve through `alertOf` (identical defaults = unchanged base).
      background: alertResolved.background,
      text: alertResolved.text,
      border: semantic.border.subtle,
      // Per-severity accent colours now resolve through `alertOf` (default = the
      // matching feedback role → base unchanged; Carbon overrides accentInfo).
      infoBorder: alertResolved.accentInfo,
      successBorder: alertResolved.accentSuccess,
      warningBorder: alertResolved.accentWarning,
      errorBorder: alertResolved.accentError,
      radius: foundation.radius.lg,
      // P-B additive leaves — per-theme alert anatomy (base = unchanged).
      borderTop: alertResolved.borderTop,
      borderRight: alertResolved.borderRight,
      borderBottom: alertResolved.borderBottom,
      // Left accent: a real left border of `accentWidth` (base/Carbon) OR a
      // `::before` filet of `filetWidth` drawn inside the box (DSFR) so the
      // measured left border stays 0. Both coloured per severity by the component.
      accentWidth: alertResolved.accentWidth,
      filetWidth: alertResolved.filetWidth,
      paddingTop: alertResolved.paddingTop,
      paddingRight: alertResolved.paddingRight,
      paddingBottom: alertResolved.paddingBottom,
      paddingLeft: alertResolved.paddingLeft,
      fontSize: alertResolved.fontSize,
      lineHeight: alertResolved.lineHeight,
      letterSpacing: alertResolved.letterSpacing
    },
    accordion: {
      // P-B — per-theme accordion-trigger anatomy (base = unchanged).
      text: accordionResolved.text,
      paddingBlock: accordionResolved.paddingBlock,
      paddingInline: accordionResolved.paddingInline,
      fontSize: accordionResolved.fontSize,
      fontWeight: accordionResolved.fontWeight,
      lineHeight: accordionResolved.lineHeight
    },
    card: {
      background: cardBackground,
      border: semantic.border.subtle,
      radius: foundation.radius.lg,
      shadow: foundation.shadow.subtle,
      anatomy: cardAnatomy
    },
    menu: {
      background: semantic.surface.raised,
      border: semantic.border.subtle,
      text: semantic.text.primary,
      itemHoverBackground: semantic.surface.subtle,
      disabledText: semantic.text.muted,
      radius: foundation.radius.md,
      shadow: foundation.shadow.medium
    },
    popover: {
      background: semantic.surface.raised,
      border: semantic.border.subtle,
      text: semantic.text.primary,
      shadow: foundation.shadow.floating,
      radius: foundation.radius.lg,
      zIndex: foundation.z.overlay
    },
    dropdown: {
      background: semantic.surface.default,
      border: semantic.border.subtle,
      text: semantic.text.primary,
      optionHoverBackground: semantic.surface.subtle,
      selectedBackground: semantic.action.primary,
      selectedText: semantic.action.primaryText,
      radius: foundation.radius.md,
      shadow: foundation.shadow.medium
    },
    input: {
      background: semantic.surface.default,
      border: semantic.border.subtle,
      focusRing: semantic.border.interactive,
      radius: foundation.radius.md
    },
    field: {
      labelText: semantic.text.primary,
      helpText: semantic.text.secondary,
      errorText: semantic.feedback.error,
      gap: foundation.spacing[2],
      maxWidth: "28rem",
      labelTypography: typographyOf(foundation, "label")
    },
    control: {
      background: semantic.surface.default,
      text: semantic.text.primary,
      placeholderText: semantic.text.muted,
      border: semantic.border.subtle,
      hoverBorder: semantic.border.strong,
      focusRing: semantic.border.interactive,
      invalidBorder: semantic.feedback.error,
      disabledBackground: semantic.surface.subtle,
      disabledText: semantic.text.muted,
      radius: foundation.radius.md,
      smHeight: "2rem",
      mdHeight: "2.5rem",
      lgHeight: "3rem",
      anatomy: inputAnatomy
    },
    selection: {
      checkedBackground: semantic.action.primary,
      checkedText: semantic.action.primaryText,
      border: semantic.border.subtle,
      switchTrack: semantic.border.strong,
      switchTrackChecked: semantic.action.primary,
      switchThumb: semantic.surface.default
    },
    overlay: {
      backdrop: semantic.surface.overlay,
      surface: semantic.surface.raised,
      border: semantic.border.subtle,
      shadow: foundation.shadow.floating,
      radius: foundation.radius.lg,
      zIndex: foundation.z.modal
    },
    drawer: {
      backdrop: semantic.surface.overlay,
      surface: semantic.surface.raised,
      border: semantic.border.subtle,
      shadow: foundation.shadow.floating,
      width: "24rem",
      zIndex: foundation.z.modal
    },
    emptyState: {
      background: semantic.surface.subtle,
      border: semantic.border.subtle,
      titleText: semantic.text.primary,
      messageText: semantic.text.secondary,
      radius: foundation.radius.lg
    },
    loadingState: {
      indicator: semantic.action.primary,
      track: semantic.surface.subtle,
      text: semantic.text.secondary,
      radius: foundation.radius.pill
    },
    tooltip: {
      background: semantic.surface.inverse,
      text: semantic.text.inverse,
      radius: foundation.radius.md,
      shadow: foundation.shadow.medium,
      zIndex: foundation.z.overlay
    },
    toast: {
      background: semantic.surface.raised,
      text: semantic.text.primary,
      border: semantic.border.subtle,
      shadow: foundation.shadow.floating,
      radius: foundation.radius.lg,
      infoBorder: semantic.feedback.info,
      successBorder: semantic.feedback.success,
      warningBorder: semantic.feedback.warning,
      errorBorder: semantic.feedback.error,
      zIndex: foundation.z.toast
    },
    dataTable: {
      headerBackground: semantic.surface.subtle,
      rowBackground: semantic.surface.default,
      rowHoverBackground: semantic.surface.subtle,
      border: semantic.border.subtle,
      text: semantic.text.primary,
      captionText: semantic.text.secondary,
      radius: foundation.radius.lg
    },
    tabs: {
      // F7/F8: active-tab roles/metrics resolved per theme (base render = current).
      activeText: tabsResolved.activeText,
      activeBackground: tabsResolved.activeBackground,
      // G2: resting-tab fill (default transparent; DSFR = light grey-blue).
      inactiveBackground: tabsResolved.inactiveBackground,
      activeWeight: tabsResolved.activeWeight,
      inactiveText: semantic.text.secondary,
      border: semantic.border.subtle,
      indicator: semantic.action.primary,
      panelBackground: semantic.surface.default,
      tabPaddingBlock: tabsResolved.paddingBlock,
      tabPaddingInline: tabsResolved.paddingInline,
      tabFontSize: tabsResolved.fontSize,
      tabLineHeight: tabsResolved.lineHeight,
      activeBorderTopWidth: tabsResolved.activeBorderTopWidth,
      activeBorderBottomWidth: tabsResolved.activeBorderBottomWidth,
      activeShadow: tabsResolved.activeShadow,
      anatomy: tabsAnatomy
    },
    pagination: {
      // Existing leaves keep their names (consumers/docs unchanged); they now
      // resolve through `paginationOf` (identical defaults = unchanged base).
      background: paginationResolved.background,
      border: paginationResolved.border,
      text: paginationResolved.text,
      activeBackground: paginationResolved.activeBackground,
      activeText: paginationResolved.activeText,
      disabledText: paginationResolved.disabledText,
      radius: paginationResolved.radius,
      // F10 additive leaves — per-theme active-page metrics (base = unchanged).
      borderWidth: paginationResolved.borderWidth,
      activeBorder: paginationResolved.activeBorder,
      activeBorderWidth: paginationResolved.activeBorderWidth,
      activeWeight: paginationResolved.activeWeight,
      paddingBlock: paginationResolved.paddingBlock,
      paddingInline: paginationResolved.paddingInline,
      minSize: paginationResolved.minSize,
      fontSize: paginationResolved.fontSize,
      lineHeight: paginationResolved.lineHeight,
      letterSpacing: paginationResolved.letterSpacing
    },
    breadcrumb: {
      text: breadcrumbResolved.text,
      currentText: breadcrumbResolved.currentText,
      separator: breadcrumbResolved.separator,
      linkText: breadcrumbResolved.linkText,
      // F10 additive leaves — per-theme breadcrumb typography (base = unchanged).
      fontSize: breadcrumbResolved.fontSize,
      lineHeight: breadcrumbResolved.lineHeight,
      letterSpacing: breadcrumbResolved.letterSpacing,
      currentWeight: breadcrumbResolved.currentWeight
    },
    sideNav: {
      background: semantic.surface.default,
      border: semantic.border.subtle,
      itemText: semantic.text.secondary,
      activeBackground: semantic.surface.subtle,
      activeText: semantic.text.primary,
      width: "16rem"
    },
    chat: {
      userBubbleBackground: semantic.action.primary,
      userBubbleText: semantic.action.primaryText,
      assistantBubbleBackground: semantic.surface.subtle,
      assistantBubbleText: semantic.text.primary,
      composerSurface: semantic.surface.raised,
      toolCallSurface: semantic.surface.subtle
    },
    graph: {
      panelBackground: semantic.surface.inverse,
      panelText: semantic.text.inverse,
      edgeDefault: "rgb(226 232 240 / 0.56)",
      community1: semantic.data.category1,
      community2: semantic.data.category2,
      community3: semantic.data.category3,
      community4: semantic.data.category4
    }
  } as const;
}

export const component = createComponent(semantic, foundation);
