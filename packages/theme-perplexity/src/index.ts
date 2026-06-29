import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Perplexity (perplexity.ai) brand theme for the Sentropic token structure.
 *
 * The colour anchors and font *names* below are taken from PUBLIC Perplexity
 * brand references (brand standards site, public colour catalogues, the
 * Smith & Diction case study). We only reference the typeface *names*
 * ("FK Grotesk Neue", "Berkeley Mono") — never font binaries (both are
 * commercial licences). Sources are documented in MAPPING.md.
 *
 * The live perplexity.ai CSS is served behind a Cloudflare challenge, so the
 * exact anatomy scalars (radius, density, focus, per-component metrics) could
 * not be machine-measured; they are set to faithful values for Perplexity's
 * sober/editorial aesthetic and every such value is flagged "à confirmer" in
 * MAPPING.md. The brand COLOURS and FONTS are sourced.
 *
 * Perplexity colour reference (light theme):
 *   True Turquoise (primary / action)   #20808d   (brand "True Turquoise")
 *   Peacock / bright cyan accent         #1fb8cd   (bright accent)
 *   Deep peacock (dark teal accent)      #13343b   (deep/inky teal)
 *   Paper White (background)             #fbfaf4   (warm off-white)
 *   Off-white soft (alt surface)         #f7f7f2
 *   Off-white contrast (subtle bg/border)#f3f3ee
 *   Offblack (quasi-noir text)           #091717
 */

// --- Perplexity raw colour palette (public brand references) ----------------
const perplexityColor = {
  // True Turquoise — the primary brand / action family.
  teal: {
    true: "#20808d", // "True Turquoise" — primary action / link / brand
    bright: "#1fb8cd", // bright peacock cyan accent
    deep: "#13343b", // deep / inky peacock teal (dark accent, strong borders on teal)
    dark: "#1a6d78", // darker True Turquoise for hover/active (derived — à confirmer)
    light: "#d8eaec" // light teal tint for low-emphasis surfaces (derived — à confirmer)
  },
  // Warm off-white "paper" family — the calm editorial backdrop.
  paper: {
    white: "#fbfaf4", // Paper White — page background
    soft: "#f7f7f2", // softer off-white (alt surface)
    contrast: "#f3f3ee", // off-white contrast (subtle bg / hover / borders)
    deeper: "#e8e8e0" // deeper off-white for secondary-button hover (derived — à confirmer)
  },
  // Ink / neutral scale anchored on the brand Offblack.
  ink: {
    0: "#ffffff", // pure white (raised cards / input fill)
    black: "#091717", // Offblack — primary text / inverse surface
    strong: "#1a2a2a", // strong text (derived — à confirmer)
    secondary: "#4b5b5b", // secondary text (derived — à confirmer)
    muted: "#8a9999", // muted / placeholder (derived — à confirmer)
    border: "#d9dedd" // subtle border (derived — à confirmer)
  },
  // System / status colours. Perplexity does not publish a status palette, so
  // these are brand-harmonious values picked to keep WCAG AA on white.
  system: {
    success: "#1f7a40", // green (à confirmer — not an official Perplexity token)
    error: "#c2192e", // red (à confirmer)
    warning: "#b35900", // amber, darkened for AA on white (à confirmer)
    info: "#20808d" // True Turquoise reused for info (à confirmer)
  }
} as const;

// --- foundation (Perplexity-specific values) --------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto True Turquoise.
    blue: {
      10: perplexityColor.teal.light, // lightest teal tint (derived — à confirmer)
      60: perplexityColor.teal.true, // True Turquoise (primary)
      80: perplexityColor.teal.deep // deep peacock (darker interactive)
    },
    // Sentropic "cyan" accent slot maps onto the bright peacock cyan.
    cyan: {
      10: "#dff4f7", // light cyan tint (derived — à confirmer)
      50: perplexityColor.teal.bright, // bright peacock #1fb8cd accent
      70: "#178a9b" // darker cyan (derived — à confirmer)
    },
    // Sentropic "slate" role family mapped onto the paper/ink neutral scale.
    slate: {
      0: perplexityColor.ink[0], // white (raised)
      10: perplexityColor.paper.white, // paper white (page background)
      20: perplexityColor.paper.contrast, // off-white contrast / subtle border
      60: perplexityColor.ink.secondary, // secondary text
      80: perplexityColor.ink.strong, // strong text
      90: perplexityColor.ink.black // offblack (title / primary text)
    },
    feedback: {
      success: perplexityColor.system.success,
      warning: perplexityColor.system.warning,
      error: perplexityColor.system.error,
      info: perplexityColor.system.info
    }
  },
  // Perplexity types in "FK Grotesk Neue" (sans/display) with "Berkeley Mono"
  // for code. We reference the font *names* only, never the binaries.
  font: {
    sans: "'FK Grotesk Neue', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'FK Grotesk Neue', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'Berkeley Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // Standard 4px-based rem spacing scale (kept aligned with the Sentropic base;
  // Perplexity's grid is not publicly tokenised — à confirmer).
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
  // Perplexity aesthetic is softly rounded: the "Ask anything" box and cards
  // carry a generous radius, controls a moderate one. Exact px "à confirmer".
  radius: {
    none: "0",
    sm: "0.375rem", // 6px
    md: "0.5rem", // 8px — button / input / tabs
    lg: "0.75rem", // 12px — cards / search box
    pill: "999px" // tags / pills
  },
  // Soft, neutral elevation (warm-grey tinted). Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(9 23 23 / 0.06)",
    medium: "0 4px 12px rgb(9 23 23 / 0.10)",
    floating: "0 8px 24px rgb(9 23 23 / 0.14)"
  },
  // Motion durations are not tokenised by Perplexity publicly; kept aligned
  // with the Sentropic base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Perplexity-specific; kept aligned with the base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Perplexity) -------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Comfortable control density (md ≈ 40px). sm/lg follow a standard scale.
  // Exact heights/paddings "à confirmer" (live CSS behind Cloudflare).
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.875rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" }
  },
  // Perplexity typography = FK Grotesk Neue. Quiet weights, no transform.
  typography: {
    control: { family: "'FK Grotesk Neue', system-ui, sans-serif", size: "1rem", weight: "500", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'FK Grotesk Neue', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'FK Grotesk Neue', system-ui, sans-serif", size: "0.9375rem", weight: "500", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Perplexity links are quiet: True Turquoise text, underline on HOVER only
    // (no rest underline). Geometry "à confirmer".
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "0.15em",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "0.15em"
    }
  },
  disabledOpacity: "0.55", // Perplexity dims disabled controls (à confirmer)
  transition: { property: "background-color, border-color, color, box-shadow, outline-color", duration: "150ms", easing: "ease" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // Perplexity FOCUS = a soft RING in True Turquoise (sober editorial look).
  // Strategy / width "à confirmer".
  focus: {
    strategy: "ring",
    width: "3px",
    offset: "0",
    color: perplexityColor.teal.true, // #20808d True Turquoise ring
    inset: "0"
  },
  // Perplexity form fields are BOXED (outline): a white fill with a 1px subtle
  // border and a rounded corner (the "Ask anything" box family). `style:
  // "outline"` draws four equal borders from the field fill + border.subtle.
  field: {
    style: "outline",
    fillBg: perplexityColor.ink[0], // #ffffff white input box
    underlineColor: perplexityColor.ink.border, // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in True Turquoise with a 40px gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2320808d' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Perplexity cards: a hairline subtle border + soft radius on white, with a
  // gentle off-white hover. (à confirmer)
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: perplexityColor.paper.contrast // #f3f3ee
  },
  // Perplexity secondary button = quiet FILLED off-white chip (transparent of
  // the brand teal; the teal is reserved for the primary CTA). (à confirmer)
  buttonSecondary: {
    background: perplexityColor.paper.contrast, // #f3f3ee off-white fill
    border: "transparent",
    hoverBackground: perplexityColor.paper.deeper // #e8e8e0 deeper off-white on hover
  },
  // Perplexity tabs: active tab = True Turquoise label with a bottom turquoise
  // underline; inactive transparent. (à confirmer)
  tabs: {
    activeText: perplexityColor.teal.true, // #20808d
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // Perplexity pagination: borderless teal text links; active = filled teal.
  // (à confirmer)
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: perplexityColor.teal.true, // #20808d link text
    activeBackground: perplexityColor.teal.true, // filled active page
    activeText: perplexityColor.ink[0], // white on teal
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem" // 24px
  },
  // Perplexity breadcrumb: muted grey trail, teal links, offblack current.
  // (à confirmer)
  breadcrumb: {
    linkText: perplexityColor.teal.true, // #20808d
    text: perplexityColor.ink.secondary, // #4b5b5b trail text
    currentText: perplexityColor.ink.black, // #091717 current page
    separator: perplexityColor.ink.muted, // #8a9999
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem", // 24px
    currentWeight: "500"
  },
  // Perplexity alert / notice: a coloured LEFT accent filet on a soft box.
  // (à confirmer)
  alert: {
    background: perplexityColor.paper.contrast, // soft off-white box
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0", // left border collapses (filet instead)
    filetWidth: "0.25rem", // 4px ::before accent bar
    paddingTop: "1rem", // 16px
    paddingRight: "1rem", // 16px
    paddingBottom: "1rem", // 16px
    paddingLeft: "1.25rem", // 20px (clears the left filet)
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Perplexity accordion: a quiet offblack medium-weight summary. (à confirmer)
  accordion: {
    text: perplexityColor.ink.black, // #091717 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "500",
    lineHeight: "1.5rem" // 24px
  },
  // Perplexity tag: a small pill-rounded off-white chip. (à confirmer)
  tag: {
    radius: "999px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: perplexityColor.paper.contrast, // #f3f3ee
    neutralText: perplexityColor.ink.black // #091717
  },
  // Perplexity badge: a small rounded filled badge. (à confirmer)
  badge: {
    radius: "6px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "600",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: perplexityColor.teal.true, // #20808d
    infoText: perplexityColor.ink[0] // white
  },
  // Perplexity checkbox/radio label. (à confirmer)
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: perplexityColor.ink.black // #091717
  },
  // Perplexity search input. (à confirmer)
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Perplexity toggle / switch label. (à confirmer)
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: perplexityColor.ink.black // #091717
  }
} as const;

// --- semantic (Perplexity-specific role mapping) ----------------------------
const semantic = {
  surface: {
    default: perplexityColor.paper.white, // #fbfaf4 paper white page background
    subtle: perplexityColor.paper.contrast, // #f3f3ee off-white contrast
    raised: perplexityColor.ink[0], // #ffffff white cards / inputs
    inverse: perplexityColor.ink.black, // #091717 offblack inverse surface
    overlay: "rgb(9 23 23 / 0.50)" // modal backdrop (offblack tint)
  },
  text: {
    primary: perplexityColor.ink.black, // #091717 offblack body / control text
    secondary: perplexityColor.ink.secondary, // #4b5b5b secondary text
    muted: perplexityColor.ink.muted, // #8a9999 muted / placeholder
    inverse: perplexityColor.paper.white, // paper white on dark / coloured surfaces
    link: perplexityColor.teal.true // #20808d True Turquoise links
  },
  border: {
    subtle: perplexityColor.ink.border, // #d9dedd subtle border
    strong: perplexityColor.ink.muted, // #8a9999 strong border
    interactive: perplexityColor.teal.true // #20808d focus / interactive
  },
  action: {
    primary: perplexityColor.teal.true, // #20808d primary button = True Turquoise
    primaryHover: perplexityColor.teal.dark, // #1a6d78 darker turquoise hover
    primaryText: perplexityColor.ink[0], // white text on teal
    secondary: perplexityColor.paper.contrast, // #f3f3ee secondary surface
    secondaryHover: perplexityColor.paper.deeper, // #e8e8e0
    secondaryText: perplexityColor.ink.black, // #091717 offblack on light secondary
    danger: perplexityColor.system.error // #c2192e
  },
  feedback: {
    success: perplexityColor.system.success,
    warning: perplexityColor.system.warning,
    error: perplexityColor.system.error,
    info: perplexityColor.system.info
  },
  status: {
    pending: perplexityColor.system.warning,
    processing: perplexityColor.system.info,
    completed: perplexityColor.system.success,
    failed: perplexityColor.system.error
  },
  // Categorical data-vis palette built from the Perplexity teal family plus a
  // warm accent. Perplexity does not publish an 8-colour sequential scale, so
  // this is a coherent proposal (see MAPPING.md, "à confirmer").
  data: {
    category1: perplexityColor.teal.true, // True Turquoise
    category2: perplexityColor.teal.bright, // bright peacock cyan
    category3: perplexityColor.teal.deep, // deep peacock
    category4: "#e8956b", // warm coral accent (à confirmer)
    category5: perplexityColor.ink.secondary, // slate grey
    category6: perplexityColor.system.success, // green
    category7: perplexityColor.system.warning, // amber
    category8: "#178a9b" // mid cyan
  }
} as const;

/**
 * The Perplexity theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Perplexity-specific values, and
 * the `component` layer is REBUILT from this theme's own semantic/foundation
 * via `createComponent` — so the Perplexity brand reaches the components
 * (buttons, tabs, pagination, chat bubbles…), not just the elements that read
 * semantic vars directly.
 */
export const perplexityTheme: TenantTheme = {
  id: "perplexity",
  label: "Perplexity",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default perplexityTheme;
