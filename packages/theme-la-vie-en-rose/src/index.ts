import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * LA VIE EN ROSE (lavieenrose.com — the Montréal-HQ lingerie house) theme for
 * the Sentropic token structure.
 *
 * La Vie en Rose publishes no design-token file; the values below are MEASURED
 * from the live site's computed CSS (https://www.lavieenrose.com, inspected in a
 * real browser). We reference font *names* only ("Roboto", Arial, Helvetica — a
 * neo-grotesque sans stack), never font binaries. Sources and the full mapping
 * table are in MAPPING.md.
 *
 * The brand identity is a clean ROSE-ON-WHITE retail system: white surfaces,
 * grey ink, light hairline borders, lit by a single SIGNATURE ROSE (#d4667c —
 * the dominant brand accent, measured 44×). The rose is the highlight: it
 * carries the foundation accent, the `action.primary` CTA fill, the focus
 * outline, the `info` feedback hue, and a `data.*` category. Where Sentropic
 * needs a role La Vie en Rose never colours (most feedback hues), a restrained
 * system colour is used and the choice is noted "à confirmer" in MAPPING.md.
 *
 * La Vie en Rose colour reference (measured, light theme):
 *   Signature rose (action / accent)   #d4667c   dominant brand accent (44×)
 *   Rose hover                         #c25068   one step deeper — à confirmer
 *   Primary text (ink)                 #404040   measured body text
 *   Secondary text                     #7f7f7f   measured
 *   Muted text                         #bfbfbf   measured
 *   Dark ink (secondary btn text)      #212529   measured
 *   White (surface default)            #ffffff   page background
 *   Subtle surface                     #f9f9f9   measured
 *   Subtle border / field border       #e5e5e5   measured
 *   Strong border                      #7f7f7f   measured
 *   Inverse surface                    #212121   footer / dark tone
 *   Danger                             #c0203a   à confirmer (no isolated source)
 */

// --- La Vie en Rose raw colour palette (measured from live computed CSS) -----
const laVieEnRoseColor = {
  // The brand's true distinguishing mark is the signature rose — the CTA fill,
  // the accent, the focus colour. Measured 44× across the storefront.
  rose: "#d4667c", // signature brand rose (action.primary / accent / focus)
  roseHover: "#c25068", // one step deeper on hover — à confirmer
  white: "#ffffff", // page background — surface default
  // Monochrome ink / grey scale (measured).
  grey: {
    50: "#f9f9f9", // subtle alt surface — measured
    100: "#e5e5e5", // subtle / field border — measured
    400: "#bfbfbf", // muted text — measured
    600: "#7f7f7f", // secondary text / strong border — measured
    800: "#404040", // primary text (ink) — measured
    900: "#212529" // dark ink (secondary button text) — measured
  },
  // Inverse surface — the dark footer tone.
  inverse: "#212121", // surface.inverse — measured
  // System / feedback hues. Only `info` reuses the brand rose (measured). The
  // success / warning / danger hues are restrained AA-safe defaults, mostly
  // à confirmer (no isolated brand source).
  system: {
    success: "#2e7d32", // green — à confirmer (no source)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    danger: "#c0203a", // red — à confirmer (no isolated source)
    info: "#d4667c" // the signature rose carries "info" — à confirmer
  }
} as const;

// --- foundation (La Vie en Rose-specific values) ----------------------------
const foundation = {
  color: {
    // La Vie en Rose has no brand blue. The Sentropic "blue" role family
    // (action / primary / link) is mapped onto the signature rose — the brand
    // primary action IS rose. (à confirmer: the brand uses no decorative blue.)
    blue: {
      10: "#faecef", // a pale wash of the signature rose — à confirmer
      60: laVieEnRoseColor.rose, // #d4667c primary action / link (brand rose)
      80: laVieEnRoseColor.roseHover // #c25068 hover step — à confirmer
    },
    // The brand's ONE accent is the signature rose. The Sentropic "cyan" accent
    // slot carries it so the brand highlight reaches accent-driven roles.
    cyan: {
      10: "#faecef", // a pale wash of the signature rose — à confirmer
      50: laVieEnRoseColor.rose, // #d4667c signature rose (the accent)
      70: laVieEnRoseColor.roseHover // #c25068 one step deeper — à confirmer
    },
    // Sentropic "slate" role family mapped onto the monochrome grey scale.
    slate: {
      0: laVieEnRoseColor.white, // #ffffff white
      10: laVieEnRoseColor.grey[50], // #f9f9f9 faint alt surface
      20: laVieEnRoseColor.grey[100], // #e5e5e5 hairline / subtle border
      60: laVieEnRoseColor.grey[600], // #7f7f7f secondary text
      80: laVieEnRoseColor.grey[800], // #404040 primary text (ink)
      90: laVieEnRoseColor.grey[900] // #212529 darkest ink
    },
    feedback: {
      success: laVieEnRoseColor.system.success,
      warning: laVieEnRoseColor.system.warning,
      error: laVieEnRoseColor.system.danger,
      info: laVieEnRoseColor.system.info
    }
  },
  // The storefront serves a Roboto neo-grotesque sans; we reference the
  // "Roboto" / Arial / Helvetica family stack (names only). Mono is not part of
  // the brand — Sentropic mono kept.
  font: {
    sans: "'Roboto', Arial, Helvetica, sans-serif",
    display: "'Roboto', Arial, Helvetica, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale (exact steps not strongly tokenised publicly;
  // kept aligned with the Sentropic base 4px scale — à confirmer).
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
  // La Vie en Rose softens its surfaces gently: small controls/inputs round at
  // 2–4px, cards at 8px, chips read as pills. (radii à confirmer.)
  radius: {
    none: "0",
    sm: "2px", // controls — a hair of softening
    md: "4px", // buttons / inputs
    lg: "8px", // cards — soft
    pill: "999px" // tags / chips
  },
  // Light elevation — the brand relies on hairlines and whitespace more than
  // shadow. Kept conservative ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.14)"
  },
  // Short, standard eases; durations not fully tokenised publicly; kept aligned
  // with the base.
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not brand-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (La Vie en Rose) ---------------------------------
  // Borders are thin hairlines (#e5e5e5). Encoded as 1px.
  borderWidth: {
    none: "0",
    thin: "1px", // hairline
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Control density. Retail CTAs run ~40–48px tall with generous horizontal
  // padding; nav text rows are small. md targets a ~44px touch height.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.8125rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.875rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "0.9375rem" }
  },
  // Typography = the Roboto grotesque. Control labels (the bag/checkout CTAs)
  // are often UPPERCASE; body/field text is sentence case.
  typography: {
    control: { family: "'Roboto', Arial, Helvetica, sans-serif", size: "0.875rem", weight: "600", lineHeight: "1.2", letterSpacing: "0.02em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Roboto', Arial, Helvetica, sans-serif", size: "0.875rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Roboto', Arial, Helvetica, sans-serif", size: "0.8125rem", weight: "500", lineHeight: "1.4", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Links are plain grey text at rest; the rose / underline affordance appears
    // on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // dims disabled controls
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "180ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // FOCUS = a crisp ROSE OUTLINE (2px). The signature rose is the focus accent.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: laVieEnRoseColor.rose, // #d4667c — focuses in the signature rose
    inset: "0"
  },
  // Form fields are BOXED (outline): a white fill with a thin hairline border
  // (#e5e5e5) and softly-rounded corners. `style: "outline"` makes the builder
  // draw four equal borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: laVieEnRoseColor.white, // #ffffff
    underlineColor: laVieEnRoseColor.grey[100], // #e5e5e5 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the secondary ink with a 40px gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%237f7f7f' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: softly rounded (8px), a thin hairline border, faint hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: laVieEnRoseColor.grey[50] // #f9f9f9 faint hover tint
  },
  // Secondary button = a light neutral chip: subtle grey fill with dark ink
  // text, a step darker on hover.
  buttonSecondary: {
    background: laVieEnRoseColor.grey[50], // #f9f9f9 light neutral chip
    border: laVieEnRoseColor.grey[100], // #e5e5e5 hairline
    hoverBackground: laVieEnRoseColor.grey[100] // #e5e5e5 deeper on hover
  },
  // Tabs / sub-nav: active tab = ink bold label with a rose bottom underline,
  // transparent fill.
  tabs: {
    activeText: laVieEnRoseColor.grey[800], // #404040
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.8125rem", // 13px
    lineHeight: "1rem", // 16px
    indicatorSide: "bottom", // rose underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline
  },
  // Pagination: borderless ink text links; active page = filled rose square
  // with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: laVieEnRoseColor.grey[800], // #404040 link text
    activeBackground: laVieEnRoseColor.rose, // #d4667c filled active page
    activeText: laVieEnRoseColor.white, // white on rose
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.8125rem", // 13px
    lineHeight: "1rem" // 16px
  },
  // Breadcrumb: ink links, grey trail, ink current page, grey separators —
  // small grotesque type.
  breadcrumb: {
    linkText: laVieEnRoseColor.grey[800], // #404040
    text: laVieEnRoseColor.grey[600], // #7f7f7f trail text
    currentText: laVieEnRoseColor.grey[800], // #404040 current page
    separator: laVieEnRoseColor.grey[600], // #7f7f7f
    fontSize: "0.75rem", // 12px
    lineHeight: "1rem", // 16px
    currentWeight: "500"
  },
  // Notice / alert: a minimal box — a thin coloured filet on a white box.
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0.125rem", // 2px ::before accent bar
    paddingTop: "0.875rem", // 14px
    paddingRight: "1rem", // 16px
    paddingBottom: "0.875rem", // 14px
    paddingLeft: "1.125rem", // 18px (clears the left filet)
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.25rem" // 20px
  },
  // Accordion / disclosure: an ink, plain-weight summary trigger, hairline
  // separated.
  accordion: {
    text: laVieEnRoseColor.grey[800], // #404040 summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0",
    fontSize: "0.8125rem", // 13px
    fontWeight: "500",
    lineHeight: "1.25rem" // 20px
  },
  // Tag: a soft rose chip — the signature rose, pill-shaped, white text.
  tag: {
    radius: "999px", // the rose chip reads as a pill
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.625rem", // 10px
    fontSize: "0.6875rem", // 11px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: laVieEnRoseColor.rose, // #d4667c signature rose chip
    neutralText: laVieEnRoseColor.white // white on rose
  },
  // Badge: a softly-rounded filled badge — rose fill / white text, uppercase.
  badge: {
    radius: "4px", // a hair of softening
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "uppercase",
    minHeight: "1.25rem", // 20px
    infoBackground: laVieEnRoseColor.rose, // #d4667c ("info" emphasis = rose)
    infoText: laVieEnRoseColor.white // white on rose
  },
  // Checkbox/radio label: small ink grotesque.
  choice: {
    labelFontSize: "0.8125rem", // 13px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: laVieEnRoseColor.grey[800] // #404040
  },
  // Search input: a softly-rounded hairline box, small type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.25rem" // 20px
  },
  // Toggle / switch label: small ink grotesque.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: laVieEnRoseColor.grey[800] // #404040
  }
} as const;

// --- semantic (La Vie en Rose-specific role mapping) ------------------------
const semantic = {
  surface: {
    default: laVieEnRoseColor.white, // #ffffff white
    subtle: laVieEnRoseColor.grey[50], // #f9f9f9 faint alt surface
    raised: laVieEnRoseColor.white, // #ffffff white
    inverse: laVieEnRoseColor.inverse, // #212121 dark inverse surface (footer tone)
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop
  },
  text: {
    primary: laVieEnRoseColor.grey[800], // #404040 (measured body ink)
    secondary: laVieEnRoseColor.grey[600], // #7f7f7f (measured)
    muted: laVieEnRoseColor.grey[400], // #bfbfbf (measured)
    inverse: laVieEnRoseColor.white, // white on dark surfaces
    link: laVieEnRoseColor.rose // #d4667c — links lean into the brand rose
  },
  border: {
    subtle: laVieEnRoseColor.grey[100], // #e5e5e5 subtle / field border (measured)
    strong: laVieEnRoseColor.grey[600], // #7f7f7f strong border (measured)
    interactive: laVieEnRoseColor.rose // #d4667c focus / interactive
  },
  action: {
    primary: laVieEnRoseColor.rose, // #d4667c primary button (the rose CTA)
    primaryHover: laVieEnRoseColor.roseHover, // #c25068 (à confirmer)
    primaryText: laVieEnRoseColor.white, // white text on rose
    // Secondary action = a light neutral chip with dark ink.
    secondary: laVieEnRoseColor.grey[50], // #f9f9f9 light neutral chip
    secondaryHover: laVieEnRoseColor.grey[100], // #e5e5e5
    secondaryText: laVieEnRoseColor.grey[900], // #212529 dark ink on neutral
    danger: laVieEnRoseColor.system.danger // #c0203a (à confirmer — no source)
  },
  feedback: {
    success: laVieEnRoseColor.system.success,
    warning: laVieEnRoseColor.system.warning,
    error: laVieEnRoseColor.system.danger,
    info: laVieEnRoseColor.system.info
  },
  status: {
    pending: laVieEnRoseColor.system.warning,
    processing: laVieEnRoseColor.system.info,
    completed: laVieEnRoseColor.system.success,
    failed: laVieEnRoseColor.system.danger
  },
  // Categorical data-vis palette. The brand publishes no data-vis scale; this is
  // a coherent proposal STARTING with the signature rose, then greys + dark ink
  // + complementary system hues (see MAPPING.md, "à confirmer").
  data: {
    category1: laVieEnRoseColor.rose, // #d4667c signature rose (leads the scale)
    category2: laVieEnRoseColor.grey[900], // #212529 dark ink
    category3: laVieEnRoseColor.grey[600], // #7f7f7f
    category4: laVieEnRoseColor.grey[400], // #bfbfbf
    category5: laVieEnRoseColor.grey[100], // #e5e5e5
    category6: laVieEnRoseColor.system.info, // rose-info (à confirmer)
    category7: laVieEnRoseColor.system.success, // restrained green (à confirmer)
    category8: laVieEnRoseColor.system.danger // restrained red (à confirmer)
  }
} as const;

/**
 * The La Vie en Rose theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry the brand-specific values
 * (rose-on-white), and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so the brand identity reaches the
 * components (buttons, tabs, pagination, chat bubbles…), not just the elements
 * that read semantic vars directly.
 */
export const laVieEnRoseTheme: TenantTheme = {
  id: "la-vie-en-rose",
  label: "La Vie en Rose",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default laVieEnRoseTheme;
