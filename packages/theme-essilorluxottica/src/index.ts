import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * EssilorLuxottica brand theme for the Sentropic token structure.
 *
 * EssilorLuxottica publishes no tokenised public design system, and its
 * corporate site (essilorluxottica.com, Next.js) publishes no brand-owned
 * colour declaration at all: `body,html` declares neither `color` nor
 * `background`, and `a{color:inherit}`. The visible black is the user-agent
 * default, not a published value. The only `#000000` / `#ffffff` / `#e1e1e1`
 * occurrences in the official stylesheets (8 / 5 / 3 over the union of both
 * files linked from the homepage) all sit inside third-party blocks — the
 * Tealium consent banner (`#__tealiumGDPRecModal`, `#__tealiumGDPRcpPrefs`,
 * `.privacy_prompt`) and the swiper/slick carousels — and are excluded as
 * origins. This package is therefore a DERIVED monochrome mapping: the
 * black / white / hairline values below reuse those hexes as coherent
 * stand-ins, each flagged "à confirmer", and we reference the brand font
 * *names* (Avenir, Libre Caslon Display) only — never font binaries.
 * Sources and exact provenance are documented in MAPPING.md.
 *
 * EssilorLuxottica colour reference (light theme, all derived — à confirmer):
 *   Black (text / fills)                  #000000   (derived — à confirmer)
 *   White (background default)            #ffffff   (derived — à confirmer)
 *   Hairline grey (subtle borders)        #e1e1e1   (derived — à confirmer)
 *   Light surface alt                     #f4f4f4   (derived — à confirmer)
 *   Secondary text grey                   #525252   (derived, AA — à confirmer)
 *   Muted grey                            #616161   (derived, AA — à confirmer)
 *   Strong border grey                    #767676   (derived, AA — à confirmer)
 *   Black hover                           #2b2b2b   (derived — à confirmer)
 *   Success green                         #1f7a3d   (derived, AA — à confirmer)
 *   Warning amber                         #b35900   (derived, AA — à confirmer)
 *   Error red                             #c62828   (derived, AA — à confirmer)
 *   Info blue                             #1565c0   (derived, AA — à confirmer)
 */

// --- EssilorLuxottica raw colour palette (all derived — à confirmer) -----------
const essilorLuxotticaColor = {
  // Black stand-in. The 8 `#000`/`#000000` occurrences over the union of both
  // official stylesheets all sit in third-party blocks (Tealium consent banner,
  // swiper preloader) and are excluded as origins; no brand-owned rule declares
  // a colour. Used as the action / text family (à confirmer).
  black: {
    primary: "#000000", // derived black stand-in (text / fills) (à confirmer)
    hover: "#2b2b2b" // derived softer black for hover (à confirmer)
  },
  // Neutral grey scale. The white and hairline hexes reuse third-party-block
  // values as coherent stand-ins; the other steps are a coherent derived ramp
  // (à confirmer). The `#525252` / `#616161` / `#767676` steps are chosen
  // neutrals (not stop-rule outputs): 7.81:1, 6.19:1 and 4.54:1 on white.
  grey: {
    0: "#ffffff", // derived white stand-in / body background (à confirmer)
    50: "#f4f4f4", // derived light surface alt (à confirmer)
    200: "#e1e1e1", // derived hairline grey stand-in / subtle border (à confirmer)
    400: "#767676", // derived strong border grey, AA on white (à confirmer)
    500: "#616161", // derived muted text grey, AA on white (à confirmer)
    600: "#525252", // derived secondary text grey, AA on white (à confirmer)
    800: "#000000", // derived black / primary text (à confirmer)
    900: "#000000" // derived black / darkest (à confirmer)
  },
  // System / status colours (derived — à confirmer). The brand publishes no
  // UI system palette; each hue clears WCAG AA on white (see MAPPING.md).
  system: {
    success: "#1f7a3d", // derived success green (5.37:1 on white) (à confirmer)
    warning: "#b35900", // derived warning amber (4.83:1 on white) (à confirmer)
    error: "#c62828", // derived error red (5.62:1 on white) (à confirmer)
    info: "#1565c0" // derived info blue (5.75:1 on white) (à confirmer)
  }
} as const;

// --- foundation (EssilorLuxottica-specific values) --------------------------
const foundation = {
  color: {
    // EssilorLuxottica has no brand BLUE; the Sentropic "blue" role family
    // (primary action / link / interactive) carries the derived black —
    // the stand-in for the site's default-black text.
    blue: {
      10: essilorLuxotticaColor.grey[50], // #f4f4f4 light surface tint
      60: essilorLuxotticaColor.black.primary, // #000000 derived black (primary) (à confirmer)
      80: essilorLuxotticaColor.black.hover // #2b2b2b softer black hover
    },
    // EssilorLuxottica has no second brand colour; the Sentropic "cyan"
    // accent slot carries neutral deep-grey accents (à confirmer).
    cyan: {
      10: essilorLuxotticaColor.grey[50], // light grey tint (à confirmer)
      50: essilorLuxotticaColor.grey[600], // #525252 deep grey accent (à confirmer)
      70: essilorLuxotticaColor.black.hover // #2b2b2b darkest accent (à confirmer)
    },
    // Sentropic "slate" role family mapped onto the neutral scale.
    slate: {
      0: essilorLuxotticaColor.grey[0], // derived white (à confirmer)
      10: essilorLuxotticaColor.grey[50], // derived surface alt (à confirmer)
      20: essilorLuxotticaColor.grey[200], // derived hairline (à confirmer)
      60: essilorLuxotticaColor.grey[600], // derived secondary text (à confirmer)
      80: essilorLuxotticaColor.grey[800], // derived black primary text (à confirmer)
      90: essilorLuxotticaColor.grey[900] // derived black darkest (à confirmer)
    },
    feedback: {
      success: essilorLuxotticaColor.system.success,
      warning: essilorLuxotticaColor.system.warning,
      error: essilorLuxotticaColor.system.error,
      info: essilorLuxotticaColor.system.info
    }
  },
  // EssilorLuxottica's corporate site ships the Avenir family for body text
  // (`.main-wrapper{font-family:var(--AvenirRegular),Sans-Serif}` is the only
  // brand-owned body rule; the 8 `var(--AvenirLight)` usages are all inside
  // the Tealium consent-banner block). Titles are AvenirMedium by brand rule
  // (`h1,h2,h3,h4,h5{font-family:var(--AvenirMedium),sans-serif;
  // font-weight:500}`); Libre Caslon Display is declared (`@font-face` +
  // `.__className_55dfc7{font-family:LibreCaslonDisplayRegular,…}`), so the
  // name is valid but the display role is inferred (à confirmer). We use
  // Avenir for body/controls and Libre Caslon Display for display; mono is
  // the system stack. We reference the font *names* only, not binaries.
  font: {
    sans: "'AvenirRegular', 'Avenir', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'LibreCaslonDisplayRegular', Georgia, 'Times New Roman', serif", // display role inferred (à confirmer)
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; the brand publishes no usable spacing tokens).
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
  // EssilorLuxottica's aesthetic is minimal and sharp: near-square controls
  // and slightly rounded cards (à confirmer — no brand radius published).
  radius: {
    none: "0",
    sm: "0.125rem", // 2px
    md: "0.125rem", // 2px — button / input / tabs
    lg: "0.25rem", // 4px — cards
    pill: "999px" // tags / pills
  },
  // Light, neutral elevation tinted with black. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.10)",
    medium: "0 4px 12px rgb(0 0 0 / 0.14)",
    floating: "0 8px 24px rgb(0 0 0 / 0.18)"
  },
  // Motion durations are not tokenised publicly by the brand; aligned with
  // the reference theme package's geometry (à confirmer — not the Sentropic
  // base: base easing is `cubic-bezier(0.16, 1, 0.3, 1)`).
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)" // (à confirmer)
  },
  // z-index roles are not brand-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (EssilorLuxottica) --------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // field border 1px
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Control density. The brand publishes no usable geometry. Only `controlHeight`
  // (`2rem`/`2.5rem`/`3rem`) and the `iconSize` scale match the Sentropic base;
  // the paddings, gaps and the extra `fontSize` key are aligned with the
  // reference theme package's geometry (à confirmer — checked against
  // `packages/tokens/src/foundation.ts`).
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.5rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" }, // (à confirmer)
    md: { controlHeight: "2.5rem", paddingBlock: "0.375rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" }, // (à confirmer)
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" } // (à confirmer)
  },
  // EssilorLuxottica typography: Avenir for interactive/fields/labels,
  // Libre Caslon Display for display titles (role inferred — à confirmer).
  // The control (500) and label (700) weights are aligned with the reference
  // package without a brand source (à confirmer); the only measured brand
  // weight is 500 on `h1..h5`.
  typography: {
    control: { family: "'AvenirRegular', 'Avenir', system-ui, sans-serif", size: "1rem", weight: "500", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" }, // weight (à confirmer)
    field: { family: "'AvenirRegular', 'Avenir', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'AvenirRegular', 'Avenir', system-ui, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" }, // weight (à confirmer)
    // Brand links inherit the body colour (the site declares
    // `a{color:inherit;text-decoration:none;display:block}`), not underlined
    // at rest. No `:hover` rule with `text-decoration` exists in either
    // stylesheet, so the hover underline is derived (à confirmer).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto" // hover underline (à confirmer)
    }
  },
  disabledOpacity: "0.5", // disabled controls dim to 0.5 (à confirmer)
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "ease-in-out" }, // aligned with the reference package (à confirmer)
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // FOCUS = a high-contrast OUTLINE in derived black (à confirmer — the brand
  // stylesheets publish no focus declaration; `outline:none` appears only on
  // the third-party carousel).
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: essilorLuxotticaColor.black.primary, // #000000 derived black focus outline (à confirmer)
    inset: "0"
  },
  // Form fields are BOXED (outline, derived — à confirmer): a white fill, a
  // 1px hairline grey border and a 2px radius. The stylesheets publish no
  // field declaration at all — the only `input|select|textarea|button` rules
  // in either file belong to Tealium and slick/swiper — so `style: "outline"`
  // is derived: it makes the builder draw four equal borders from
  // `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: essilorLuxotticaColor.grey[0], // #ffffff
    underlineColor: essilorLuxotticaColor.grey[200], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in derived black with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23000000' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: a subtle 1px hairline border + slight radius, light hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: essilorLuxotticaColor.grey[50] // #f4f4f4
  },
  // Secondary button = OUTLINED in derived black: transparent fill, black
  // border + text, light grey fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: essilorLuxotticaColor.black.primary, // #000000 stroke
    hoverBackground: essilorLuxotticaColor.grey[50] // #f4f4f4 light fill on hover
  },
  // Tabs / top-nav: active tab = black label with a bottom black underline.
  tabs: {
    activeText: essilorLuxotticaColor.black.primary, // #000000 black label
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // Pagination: borderless black text links; active page = filled black
  // with white text for contrast.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: essilorLuxotticaColor.black.primary, // #000000 link text
    activeBackground: essilorLuxotticaColor.black.primary, // #000000 filled active page
    activeText: "#ffffff", // white text on black for contrast
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb: black links, grey trail, black current page.
  breadcrumb: {
    linkText: essilorLuxotticaColor.black.primary, // #000000
    text: essilorLuxotticaColor.grey[600], // #525252 trail text
    currentText: essilorLuxotticaColor.black.primary, // #000000 current page
    separator: essilorLuxotticaColor.grey[600], // #525252
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem", // 24px
    currentWeight: "700"
  },
  // Alert / notice: a coloured LEFT accent filet on a transparent box.
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0.25rem", // 4px ::before accent bar
    paddingTop: "1rem", // 16px
    paddingRight: "1rem", // 16px
    paddingBottom: "1rem", // 16px
    paddingLeft: "1.25rem", // 20px (clears the left filet)
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Accordion / details: a black bold summary trigger.
  accordion: {
    text: essilorLuxotticaColor.black.primary, // #000000 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "700",
    lineHeight: "1.5rem" // 24px
  },
  // Tag: a small 2px-radius light-grey chip.
  tag: {
    radius: "2px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: essilorLuxotticaColor.grey[50], // #f4f4f4
    neutralText: essilorLuxotticaColor.black.primary // #000000
  },
  // Badge: a 2px-radius filled badge in derived black with white text.
  badge: {
    radius: "2px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: essilorLuxotticaColor.black.primary, // #000000
    infoText: "#ffffff" // white text on black
  },
  // Checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: essilorLuxotticaColor.black.primary // #000000
  },
  // Search input.
  search: {
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: essilorLuxotticaColor.black.primary // #000000
  }
} as const;

// --- semantic (EssilorLuxottica-specific role mapping) -----------------------
const semantic = {
  surface: {
    default: essilorLuxotticaColor.grey[0], // derived white (à confirmer)
    subtle: essilorLuxotticaColor.grey[50], // #f4f4f4 derived surface alt (à confirmer)
    raised: essilorLuxotticaColor.grey[0], // derived white (à confirmer)
    inverse: essilorLuxotticaColor.black.primary, // #000000 derived black inverse surface (à confirmer)
    overlay: "rgb(0 0 0 / 0.6)" // derived modal backdrop, no brand overlay published (à confirmer)
  },
  text: {
    primary: essilorLuxotticaColor.black.primary, // #000000 derived (links inherit body colour) (à confirmer)
    secondary: essilorLuxotticaColor.grey[600], // #525252 derived (AA on white) (à confirmer)
    muted: essilorLuxotticaColor.grey[500], // #616161 derived muted (AA on white) (à confirmer)
    inverse: essilorLuxotticaColor.grey[0], // white on dark surfaces (à confirmer)
    link: essilorLuxotticaColor.black.primary // #000000 derived (site links inherit body colour) (à confirmer)
  },
  border: {
    subtle: essilorLuxotticaColor.grey[200], // #e1e1e1 derived hairline (à confirmer)
    strong: essilorLuxotticaColor.grey[400], // #767676 derived (AA on white) (à confirmer)
    interactive: essilorLuxotticaColor.black.primary // #000000 derived black interactive (à confirmer)
  },
  action: {
    primary: essilorLuxotticaColor.black.primary, // #000000 derived black primary (à confirmer)
    primaryHover: essilorLuxotticaColor.black.hover, // #2b2b2b derived softer hover (à confirmer)
    primaryText: "#ffffff", // white text on black (21:1 contrast) (à confirmer)
    secondary: essilorLuxotticaColor.grey[50], // #f4f4f4 derived secondary surface (à confirmer)
    secondaryHover: essilorLuxotticaColor.grey[200], // #e1e1e1 derived hairline hover (à confirmer)
    secondaryText: essilorLuxotticaColor.black.primary, // #000000 (à confirmer)
    danger: essilorLuxotticaColor.system.error // #c62828 derived error red (à confirmer)
  },
  feedback: {
    success: essilorLuxotticaColor.system.success,
    warning: essilorLuxotticaColor.system.warning,
    error: essilorLuxotticaColor.system.error,
    info: essilorLuxotticaColor.system.info
  },
  status: {
    pending: essilorLuxotticaColor.system.warning,
    processing: essilorLuxotticaColor.system.info,
    completed: essilorLuxotticaColor.system.success,
    failed: essilorLuxotticaColor.system.error
  },
  // Categorical data-vis palette: the brand is monochrome, so this is a
  // coherent proposal led by the black/grey ramp with derived system hues
  // for variety (see MAPPING.md, "à confirmer").
  data: {
    category1: essilorLuxotticaColor.black.primary, // #000000 derived black (à confirmer)
    category2: essilorLuxotticaColor.grey[600], // #525252 deep grey
    category3: essilorLuxotticaColor.system.info, // #1565c0 info blue
    category4: essilorLuxotticaColor.system.warning, // #b35900 amber
    category5: essilorLuxotticaColor.system.error, // #c62828 red
    category6: essilorLuxotticaColor.system.success, // #1f7a3d green
    category7: essilorLuxotticaColor.grey[400], // #767676 mid grey
    category8: essilorLuxotticaColor.grey[200] // #e1e1e1 hairline grey
  }
} as const;

/**
 * The EssilorLuxottica theme as a Sentropic `TenantTheme`. The `tokens` tree
 * is complete: `foundation` and `semantic` carry EssilorLuxottica-specific
 * values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so the derived black reaches the
 * components (buttons, tabs, pagination, chat bubbles…), not just the
 * elements that read semantic vars directly.
 */
export const essilorluxotticaTheme: TenantTheme = {
  id: "essilorluxottica",
  label: "EssilorLuxottica",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default essilorluxotticaTheme;
