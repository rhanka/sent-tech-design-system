import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Cossette (cossette.com — the Montréal advertising agency) theme for the
 * Sentropic token structure.
 *
 * Cossette publishes no design-token file; the values below are MEASURED from
 * the live site's public CSS / meta (https://cossette.com, inspected in a real
 * browser). The signature is unmistakable: a BOLD YELLOW (#ffee00 — the meta
 * `theme-color` and the dominant hero hex) on a confident BLACK/white agency
 * monochrome. We only reference the font *names* here ("'Helvetica Neue',
 * Helvetica, Arial, sans-serif" — the measured bold agency grotesk), never font
 * binaries. Sources and the full mapping table are in MAPPING.md.
 *
 * Cossette's identity is a LOUD AGENCY system: a saturated yellow brand colour
 * carried on near-black ink and white, sharp/square corners (an agency grid,
 * not soft product rounding), an outline field style and a BLACK focus outline.
 *
 * CRITICAL — ON-YELLOW TEXT IS BLACK, NOT WHITE:
 *   The brand colour #ffee00 is a pure high-luminance yellow. White text on it
 *   fails WCAG contrast badly and is illegible; black reads cleanly. createComponent
 *   derives on-primary text from `semantic.action.primaryText`, so we set that to
 *   #111111 (near-black). Every other "text on the brand fill" role we control
 *   (badge infoText, pagination activeText, tabs activeText, breadcrumb current)
 *   is likewise driven to #111111 — see the per-token comments below. Anywhere
 *   the component layer would otherwise emit white on yellow, the black semantic
 *   value we set here overrides it.
 *
 * Cossette colour reference (measured, light theme):
 *   Brand yellow (action / CTA / accent)  #ffee00   meta theme-color + hero hex
 *   Brand yellow hover (darker)           #e6d600   à confirmer (derived ~-10% L)
 *   Near-black ink (text / inverse / on-yellow)  #111111
 *   Secondary text                        #555555
 *   Muted text                            #8a8a8a
 *   White (surface default)               #ffffff   page background
 *   Subtle fill surface                   #f5f5f5
 *   Border hairline                       #e0e0e0
 *   Danger / error                        #d32f2f
 */

// --- Cossette raw colour palette (measured from live computed CSS / meta) ----
const cossetteColor = {
  // The brand "colour" is a saturated yellow — the meta theme-color and the
  // dominant hero hex. Cossette uses it for primary CTAs, accents and brand fills.
  yellow: "#ffee00", // brand yellow — CTA / accent / brand fill
  // Darker step for hover. Cossette publishes no measured hover token; this is a
  // ~10% darker yellow chosen to read as a pressed state (à confirmer).
  yellowHover: "#e6d600", // brand yellow hover (à confirmer — derived)
  white: "#ffffff", // page background — surface default
  // Near-black ink. Used for body text, the inverse band, AND as the on-yellow
  // text colour (white on yellow is illegible — see header note).
  black: "#111111", // near-black ink / inverse surface / on-yellow text
  // Soft monochrome ink scale.
  ink: {
    secondary: "#555555", // secondary text
    muted: "#8a8a8a" // muted text
  },
  // Neutral surface / line greys.
  grey: {
    subtle: "#f5f5f5", // subtle fill surface
    border: "#e0e0e0" // subtle / field hairline border
  },
  // Cossette shows essentially no decorative colour beyond the brand yellow, so
  // it publishes no success/warning/info hues. The danger red is matched to a
  // measured error accent; the rest are "à confirmer" — legible AA-on-white
  // system colours chosen to stay quiet against the bold monochrome+yellow look.
  system: {
    danger: "#d32f2f", // red — error / danger accent (measured)
    success: "#2e7d32", // muted green — à confirmer (no Cossette source)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#111111" // Cossette would use its near-black ink, not blue — à confirmer
  }
} as const;

// --- foundation (Cossette-specific values) ----------------------------------
const foundation = {
  color: {
    // Cossette's "primary action" IS the brand yellow. The Sentropic "blue" role
    // family (action / primary / link) is mapped onto the yellow/ink scale.
    // (à confirmer: Cossette has no blue at all — the brand hue is yellow.)
    blue: {
      10: cossetteColor.grey.subtle, // #f5f5f5 lightest neutral tint
      60: cossetteColor.yellow, // #ffee00 primary action (Cossette yellow CTA)
      80: cossetteColor.yellowHover // #e6d600 darker step (hover)
    },
    // Cossette has no cyan/accent beyond the brand yellow. The Sentropic "cyan"
    // accent slot is mapped onto the yellow/ink scale. (à confirmer.)
    cyan: {
      10: cossetteColor.grey.subtle, // #f5f5f5 light neutral tint
      50: cossetteColor.yellow, // #ffee00 the only accent Cossette has is yellow
      70: cossetteColor.black // #111111
    },
    // Sentropic "slate" role family mapped onto the Cossette monochrome ink/grey
    // scale.
    slate: {
      0: cossetteColor.white, // #ffffff white
      10: cossetteColor.grey.subtle, // #f5f5f5 subtle fill surface
      20: cossetteColor.grey.border, // #e0e0e0 hairline / subtle border
      60: cossetteColor.ink.secondary, // #555555 secondary text
      80: cossetteColor.black, // #111111 primary text (near-black ink)
      90: cossetteColor.black // #111111 darkest (near-black)
    },
    feedback: {
      success: cossetteColor.system.success,
      warning: cossetteColor.system.warning,
      error: cossetteColor.system.danger,
      info: cossetteColor.system.info
    }
  },
  // Cossette sets its UI in a BOLD AGENCY GROTESK — measured "'Helvetica Neue',
  // Helvetica, Arial, sans-serif" across headings and body. We reference the
  // *names* only. Mono is not part of Cossette — the Sentropic mono stack is kept
  // (same stack as the Simons structural template).
  font: {
    sans: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    display: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. Cossette's grid is bold and generous but its raw
  // spacing steps are not strongly tokenised publicly; kept aligned with the
  // Sentropic base 4px scale ("à confirmer" exact steps).
  spacing: {
    0: "0",
    1: "0.25rem", // 4px
    2: "0.5rem", // 8px
    3: "0.75rem", // 12px
    4: "1rem", // 16px
    6: "1.5rem", // 24px
    8: "2rem", // 32px
    12: "3rem", // 48px
    16: "4rem" // 64px
  },
  // Cossette is a SHARP AGENCY system — square corners. Measured controls/cards
  // are square; only the largest cards carry a barely-there 2px. Pills stay
  // 999px for completeness (à confirmer exact steps).
  radius: {
    none: "0", // square slot
    sm: "0", // smallest controls — square
    md: "0", // button / input / tabs — SQUARE (sharp agency)
    lg: "2px", // cards — barely-there 2px
    pill: "999px" // tags / pills
  },
  // Cossette elevation is restrained — bold colour and grid do the work, with
  // soft low shadows on raised elements. Kept conservative and black-tinted
  // ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.14)"
  },
  // Cossette animates with short, standard eases (measured ≈ 150ms transitions).
  // Durations not fully tokenised publicly; kept aligned with the base.
  motion: {
    fast: "120ms",
    normal: "150ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Cossette-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Cossette) ---------------------------------------
  // Cossette borders are thin LIGHT-GREY hairlines (#e0e0e0 @1px). Encoded as 1px
  // thin / 2px thick.
  borderWidth: {
    none: "0",
    thin: "1px", // Cossette hairline (#e0e0e0)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Cossette control density. Measured CTA buttons sit ~44px tall with generous
  // horizontal padding; nav/body text is mid-sized grotesk. md targets a ~44px
  // touch height; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // Cossette typography = the bold grotesk. Control labels are mid/heavy-weight;
  // CTAs are often UPPERCASE-tracked on the live site (measured letter-spacing on
  // the primary buttons — an agency convention).
  typography: {
    control: { family: "'Helvetica Neue', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "600", lineHeight: "1.2", letterSpacing: "0.04em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Helvetica Neue', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Helvetica Neue', Helvetica, Arial, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.4", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Cossette links are plain ink at rest; the hover affordance is an underline.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.08em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // Cossette dims disabled controls
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // Cossette FOCUS = a crisp BLACK OUTLINE (~2px solid #111111). The brand yellow
  // is far too light to read as a focus ring against white, so focus is drawn in
  // near-black. We encode the black outline strategy. (focus.color = #111111.)
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: cossetteColor.black, // #111111 — Cossette focuses in black (yellow focus is invisible)
    inset: "0"
  },
  // Cossette form fields are BOXED (outline): a white fill with a thin light-grey
  // hairline border, square corners. `style: "outline"` makes the builder draw
  // four equal borders from `surface.default` + `border.subtle`. Measured
  // input/select border = #e0e0e0 @1px hairline.
  field: {
    style: "outline",
    fillBg: cossetteColor.white, // #ffffff
    underlineColor: cossetteColor.grey.border, // #e0e0e0 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in near-black ink with a 40px gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23111111' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cossette cards: square (barely-there 2px on the largest), a thin light-grey
  // hairline rather than a heavy box, with a faint hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: cossetteColor.grey.subtle // #f5f5f5 faint hover tint
  },
  // Cossette secondary button = a soft-grey filled chip (light #f5f5f5 fill, ink
  // text, slightly darker grey on hover) — the quiet alternative to the loud
  // yellow primary.
  buttonSecondary: {
    background: cossetteColor.grey.subtle, // #f5f5f5 soft fill
    border: cossetteColor.grey.border, // #e0e0e0 light hairline
    hoverBackground: cossetteColor.grey.border // #e0e0e0 on hover
  },
  // Cossette tabs / sub-nav: active tab = near-black bold grotesk label with a
  // YELLOW bottom underline (the brand indicator), transparent fill. The active
  // TEXT stays near-black (#111111) — never white-on-yellow.
  tabs: {
    activeText: cossetteColor.black, // #111111 (near-black active label)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem", // 18px
    indicatorSide: "bottom", // brand underline on the bottom edge
    indicatorMode: "border" // a real bottom filet (not a box-shadow)
  },
  // Cossette pagination: borderless ink text links; active page = filled YELLOW
  // box with NEAR-BLACK text (#111111) — the brand fill, legible (white on yellow
  // would be illegible).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: cossetteColor.black, // #111111 link text
    activeBackground: cossetteColor.yellow, // #ffee00 filled active page (brand)
    activeText: cossetteColor.black, // #111111 BLACK on yellow (NOT white — illegible otherwise)
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // Cossette breadcrumb: ink links, grey trail, near-black current page, grey
  // separators — all bold grotesk.
  breadcrumb: {
    linkText: cossetteColor.black, // #111111
    text: cossetteColor.ink.secondary, // #555555 trail text
    currentText: cossetteColor.black, // #111111 current page
    separator: cossetteColor.ink.secondary, // #555555
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.125rem", // 18px
    currentWeight: "600" // current page is emphasised
  },
  // Cossette notice / alert: a minimal box — a thin coloured left filet on a white
  // box, no fill. The severity accent is a slim left bar.
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0", // left border collapses (filet instead)
    filetWidth: "0.1875rem", // 3px ::before accent bar (bold-ish, agency)
    paddingTop: "0.875rem", // 14px
    paddingRight: "1rem", // 16px
    paddingBottom: "0.875rem", // 14px
    paddingLeft: "1.125rem", // 18px (clears the left filet)
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Cossette accordion / disclosure: an ink, mid-weight grotesk summary trigger,
  // square corners, hairline separated.
  accordion: {
    text: cossetteColor.black, // #111111 summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // rows are flush to the column
    fontSize: "0.875rem", // 14px
    fontWeight: "600", // mid-weight grotesk
    lineHeight: "1.25rem" // 20px
  },
  // Cossette tag: a small soft-grey chip with SQUARE corners.
  tag: {
    radius: "0", // square (matches md)
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: cossetteColor.grey.subtle, // #f5f5f5 subtle fill
    neutralText: cossetteColor.black // #111111
  },
  // Cossette badge: a small filled badge. The brand "info" badge = YELLOW fill
  // with NEAR-BLACK text (#111111) — white on yellow is illegible, so infoText is
  // black. Uppercase, square corners.
  badge: {
    radius: "0", // square
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "uppercase", // Cossette labels are often uppercase
    minHeight: "1.25rem", // 20px
    infoBackground: cossetteColor.yellow, // #ffee00 (Cossette "info" = brand yellow, not blue)
    infoText: cossetteColor.black // #111111 BLACK on yellow (NOT white — illegible otherwise)
  },
  // Cossette checkbox/radio label: small ink grotesk.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: cossetteColor.black // #111111
  },
  // Cossette search input: a boxed light hairline field, grotesk type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Cossette toggle / switch label: small ink grotesk.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: cossetteColor.black // #111111
  }
} as const;

// --- semantic (Cossette-specific role mapping) ------------------------------
const semantic = {
  surface: {
    default: cossetteColor.white, // #ffffff white
    subtle: cossetteColor.grey.subtle, // #f5f5f5 subtle fill surface
    raised: cossetteColor.white, // #ffffff white
    inverse: cossetteColor.black, // #111111 near-black inverse band
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop — black @50%
  },
  text: {
    primary: cossetteColor.black, // #111111 (measured near-black ink)
    secondary: cossetteColor.ink.secondary, // #555555
    muted: cossetteColor.ink.muted, // #8a8a8a
    inverse: cossetteColor.white, // white on the black inverse band
    link: cossetteColor.black // #111111 — Cossette links are near-black ink
  },
  border: {
    subtle: cossetteColor.grey.border, // #e0e0e0 light hairline (field / divider)
    strong: cossetteColor.ink.secondary, // #555555 stronger border
    interactive: cossetteColor.black // #111111 focus / interactive (NOT yellow — invisible)
  },
  action: {
    primary: cossetteColor.yellow, // #ffee00 primary button (the bold yellow CTA)
    primaryHover: cossetteColor.yellowHover, // #e6d600 darker yellow on hover (à confirmer)
    // CRITICAL: BLACK text on the yellow. createComponent derives on-primary text
    // from this value; white on #ffee00 fails contrast and is illegible.
    primaryText: cossetteColor.black, // #111111 black text on yellow (NOT white)
    secondary: cossetteColor.grey.subtle, // #f5f5f5 secondary surface
    secondaryHover: cossetteColor.grey.border, // #e0e0e0
    secondaryText: cossetteColor.black, // #111111
    danger: cossetteColor.system.danger // #d32f2f
  },
  feedback: {
    success: cossetteColor.system.success,
    warning: cossetteColor.system.warning,
    error: cossetteColor.system.danger,
    info: cossetteColor.system.info
  },
  status: {
    pending: cossetteColor.system.warning,
    processing: cossetteColor.system.info,
    completed: cossetteColor.system.success,
    failed: cossetteColor.system.danger
  },
  // Categorical data-vis palette. Cossette publishes no data-vis scale; this is a
  // coherent proposal that leads with the brand yellow then near-black, then a
  // grey ramp plus the restrained system hues, drawn to honour the bold agency
  // identity (see MAPPING.md, "à confirmer" — not an official scale).
  data: {
    category1: cossetteColor.yellow, // #ffee00 brand yellow
    category2: cossetteColor.black, // #111111 near-black
    category3: cossetteColor.ink.secondary, // #555555
    category4: cossetteColor.ink.muted, // #8a8a8a
    category5: cossetteColor.grey.border, // #e0e0e0
    category6: cossetteColor.system.danger, // restrained red (à confirmer)
    category7: cossetteColor.system.success, // restrained green (à confirmer)
    category8: cossetteColor.system.warning // restrained amber (à confirmer)
  }
} as const;

/**
 * The Cossette theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Cossette-specific (bold yellow-on-black/white
 * agency) values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so Cossette's loud yellow identity
 * reaches the components (buttons, tabs, pagination, chat bubbles…), with the
 * on-yellow text resolved to near-black (#111111) for legibility, not just the
 * elements that read semantic vars directly.
 */
export const cossetteTheme: TenantTheme = {
  id: "cossette",
  label: "Cossette",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default cossetteTheme;
