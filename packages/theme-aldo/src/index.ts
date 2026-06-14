import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * ALDO (aldoshoes.com — the Montréal-HQ footwear & fashion house) theme for the
 * Sentropic token structure.
 *
 * ALDO runs on a Shopify storefront and publishes no design-token file; the
 * values below are MEASURED from the live site's computed CSS
 * (https://www.aldoshoes.com, inspected in a real browser). We reference font
 * *names* only ("Helvetica Neue", Arial — a neo-grotesque sans stack), never
 * font binaries. Sources and the full mapping table are in MAPPING.md.
 *
 * ALDO's identity is a fashion BLACK-ON-WHITE system (square corners, thin
 * hairline borders, a black "Add to Bag" CTA) lit by a single SIGNATURE BRIGHT
 * YELLOW (#ffef71) — the dominant brand accent (measured 26×). The yellow is
 * the highlight: it appears as the foundation accent, the `action.secondary`
 * chip surface, a `data.*` category, and the selection/focus accent. Where
 * Sentropic needs a role ALDO never colours (a feedback hue), a restrained
 * system colour is used and the choice is noted "à confirmer" in MAPPING.md.
 *
 * ALDO colour reference (measured, light theme):
 *   Black (text / action / brand)      #000000   black CTA fill, ink
 *   Ink (primary text)                 #111111   measured body text
 *   White (surface default)            #ffffff   page background
 *   Signature yellow (accent)          #ffef71   dominant brand accent (26×)
 *   Yellow hover                        #ffe94d   à confirmer (one step deeper)
 *   Secondary text                     #5c5f62   measured
 *   Muted text                         #8a8d90   à confirmer
 *   Subtle surface                     #f7f7f7   à confirmer
 *   Subtle border / field border       #e2e2e2   à confirmer
 *   Strong border                      #5c5f62   measured
 */

// --- ALDO raw colour palette (measured from live computed CSS) --------------
const aldoColor = {
  // The fashion "brand" base is black: black CTA fill, black ink. ALDO's true
  // distinguishing mark, though, is the signature bright yellow.
  black: "#000000", // black CTA fill / action.primary / surface.inverse
  blackHover: "#111111", // measured primary hover (a hair off pure black)
  ink: "#111111", // measured body ink — text.primary
  white: "#ffffff", // page background — surface default
  // Signature bright yellow — the dominant ALDO accent (measured 26×). This is
  // the highlight colour: foundation accent, action.secondary chip surface,
  // a data category, and the selection/focus accent.
  yellow: "#ffef71", // signature brand yellow (accent / highlight)
  yellowHover: "#ffe94d", // one step deeper on hover — à confirmer
  // Monochrome grey scale (mix of measured + à confirmer, see MAPPING.md).
  grey: {
    50: "#f7f7f7", // subtle alt surface — à confirmer
    100: "#e2e2e2", // subtle / field border — à confirmer
    600: "#5c5f62", // secondary text / strong border — measured
    400: "#8a8d90" // muted text — à confirmer
  },
  // ALDO shows no measured success/warning/error/info hues. These are restrained
  // system colours chosen to stay legible (WCAG AA) on white. Mostly à confirmer.
  system: {
    success: "#2e7d32", // green — à confirmer (no ALDO source)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    error: "#c0202e", // red — à confirmer (no ALDO source)
    info: "#1169da" // blue — à confirmer (AA-safe)
  }
} as const;

// --- foundation (ALDO-specific values) --------------------------------------
const foundation = {
  color: {
    // ALDO has no brand blue. The Sentropic "blue" role family (action /
    // primary / link) is mapped onto the monochrome black scale — the ALDO
    // primary action IS black. (à confirmer: ALDO uses no decorative blue.)
    blue: {
      10: aldoColor.grey[50], // #f7f7f7 lightest neutral tint
      60: aldoColor.black, // #000000 primary action / link (ALDO black)
      80: aldoColor.blackHover // #111111 (measured hover step)
    },
    // ALDO's ONE accent is the signature yellow. The Sentropic "cyan" accent
    // slot carries it so the brand highlight reaches accent-driven roles.
    cyan: {
      10: "#fffbcf", // a pale wash of the signature yellow — à confirmer
      50: aldoColor.yellow, // #ffef71 signature bright yellow (the accent)
      70: aldoColor.yellowHover // #ffe94d one step deeper — à confirmer
    },
    // Sentropic "slate" role family mapped onto the ALDO monochrome grey scale.
    slate: {
      0: aldoColor.white, // #ffffff white
      10: aldoColor.grey[50], // #f7f7f7 faint alt surface
      20: aldoColor.grey[100], // #e2e2e2 hairline / subtle border
      60: aldoColor.grey[600], // #5c5f62 secondary text
      80: aldoColor.ink, // #111111 primary text (ink)
      90: aldoColor.black // #000000 darkest (terminal black)
    },
    feedback: {
      success: aldoColor.system.success,
      warning: aldoColor.system.warning,
      error: aldoColor.system.error,
      info: aldoColor.system.info
    }
  },
  // ALDO's Shopify theme serves a neo-grotesque sans; the exact licensed webfont
  // could not be isolated, so we reference the safe "Helvetica Neue" / Arial
  // family stack (names only). Mono is not part of ALDO — Sentropic mono kept.
  font: {
    sans: "'Helvetica Neue', Arial, sans-serif",
    display: "'Helvetica Neue', Arial, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale (ALDO's exact steps not strongly tokenised
  // publicly; kept aligned with the Sentropic base 4px scale — à confirmer).
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
  // ALDO is mostly SQUARE (fashion convention): controls/inputs are square, with
  // only a slight 2–4px softening on some surfaces. (radii à confirmer.)
  radius: {
    none: "0", // square default
    sm: "0", // controls square
    md: "2px", // buttons / inputs — a hair of softening
    lg: "4px", // cards — slightly soft
    pill: "999px" // tags / chips (the yellow chip can read as a pill)
  },
  // ALDO elevation is light — it relies on hairlines and whitespace more than
  // shadow. Kept conservative ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.14)"
  },
  // ALDO animates with short, standard eases; durations not fully tokenised
  // publicly; kept aligned with the base.
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not ALDO-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (ALDO) -------------------------------------------
  // ALDO borders are thin hairlines (#e2e2e2). Encoded as 1px.
  borderWidth: {
    none: "0",
    thin: "1px", // ALDO hairline
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // ALDO control density. Fashion CTAs run ~44–48px tall with generous
  // horizontal padding; nav text rows are small. md targets a ~44px touch
  // height; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.8125rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.875rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "0.9375rem" }
  },
  // ALDO typography = the Helvetica-family grotesque. Control labels are often
  // UPPERCASE (the bag/checkout CTAs); body/field text is sentence case.
  typography: {
    control: { family: "'Helvetica Neue', Arial, sans-serif", size: "0.875rem", weight: "600", lineHeight: "1.2", letterSpacing: "0.02em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Helvetica Neue', Arial, sans-serif", size: "0.875rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Helvetica Neue', Arial, sans-serif", size: "0.8125rem", weight: "500", lineHeight: "1.4", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // ALDO links are plain black text at rest; the hover affordance is an
    // underline appearing on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // ALDO dims disabled controls heavily
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "180ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // ALDO FOCUS = a crisp BLACK OUTLINE (fashion convention). We encode the black
  // outline strategy (2px). The signature yellow also reads as a selection /
  // highlight accent elsewhere in the system.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: aldoColor.black, // #000000 — ALDO focuses in black
    inset: "0"
  },
  // ALDO form fields are BOXED (outline): a white fill with a thin hairline
  // border (#e2e2e2) and square corners. `style: "outline"` makes the builder
  // draw four equal borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: aldoColor.white, // #ffffff
    underlineColor: aldoColor.grey[100], // #e2e2e2 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in pure black with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23000000' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // ALDO cards: lightly soft (4px), a thin hairline border, faint hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: aldoColor.grey[50] // #f7f7f7 faint hover tint
  },
  // ALDO secondary button = the SIGNATURE YELLOW chip: bright yellow fill with
  // dark ink text (the brand highlight as the secondary action), one step
  // deeper on hover.
  buttonSecondary: {
    background: aldoColor.yellow, // #ffef71 the signature yellow chip
    border: aldoColor.yellow, // #ffef71 (filled, borderless)
    hoverBackground: aldoColor.yellowHover // #ffe94d deeper yellow on hover
  },
  // ALDO tabs / sub-nav: active tab = black bold label with a black bottom
  // underline, transparent fill.
  tabs: {
    activeText: aldoColor.ink, // #111111
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.8125rem", // 13px
    lineHeight: "1rem", // 16px
    indicatorSide: "bottom", // black underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline
  },
  // ALDO pagination: borderless black text links; active page = filled black
  // square with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: aldoColor.ink, // #111111 link text
    activeBackground: aldoColor.black, // #000000 filled active page
    activeText: aldoColor.white, // white on black
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.8125rem", // 13px
    lineHeight: "1rem" // 16px
  },
  // ALDO breadcrumb: black links, grey trail, black current page, grey
  // separators — small grotesque type.
  breadcrumb: {
    linkText: aldoColor.ink, // #111111
    text: aldoColor.grey[600], // #5c5f62 trail text
    currentText: aldoColor.ink, // #111111 current page
    separator: aldoColor.grey[600], // #5c5f62
    fontSize: "0.75rem", // 12px
    lineHeight: "1rem", // 16px
    currentWeight: "500"
  },
  // ALDO notice / alert: a minimal box — a thin coloured filet on a white box.
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
  // ALDO accordion / disclosure: a black, plain-weight summary trigger,
  // hairline separated.
  accordion: {
    text: aldoColor.ink, // #111111 summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0",
    fontSize: "0.8125rem", // 13px
    fontWeight: "500",
    lineHeight: "1.25rem" // 20px
  },
  // ALDO tag: the signature yellow can read as a chip — kept as a pill chip in
  // the brand yellow with dark ink text.
  tag: {
    radius: "999px", // the yellow chip reads as a pill
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.625rem", // 10px
    fontSize: "0.6875rem", // 11px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: aldoColor.yellow, // #ffef71 signature yellow chip
    neutralText: aldoColor.ink // #111111 dark ink on yellow
  },
  // ALDO badge: a SQUARE filled badge — black fill / white text, uppercase.
  badge: {
    radius: "2px", // a hair of softening
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "uppercase",
    minHeight: "1.25rem", // 20px
    infoBackground: aldoColor.black, // #000000 (ALDO "info" emphasis = black)
    infoText: aldoColor.white // white on black
  },
  // ALDO checkbox/radio label: small black grotesque.
  choice: {
    labelFontSize: "0.8125rem", // 13px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: aldoColor.ink // #111111
  },
  // ALDO search input: a square hairline box, small type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.25rem" // 20px
  },
  // ALDO toggle / switch label: small black grotesque.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: aldoColor.ink // #111111
  }
} as const;

// --- semantic (ALDO-specific role mapping) ----------------------------------
const semantic = {
  surface: {
    default: aldoColor.white, // #ffffff white
    subtle: aldoColor.grey[50], // #f7f7f7 faint alt surface — à confirmer
    raised: aldoColor.white, // #ffffff white
    inverse: aldoColor.black, // #000000 black inverse surface (CTA/footer tone)
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop
  },
  text: {
    primary: aldoColor.ink, // #111111 (measured body ink)
    secondary: aldoColor.grey[600], // #5c5f62 (measured)
    muted: aldoColor.grey[400], // #8a8d90 — à confirmer
    inverse: aldoColor.white, // white on black / dark surfaces
    link: aldoColor.black // #000000 — ALDO links are black, not coloured
  },
  border: {
    subtle: aldoColor.grey[100], // #e2e2e2 subtle / field border — à confirmer
    strong: aldoColor.grey[600], // #5c5f62 strong border (measured)
    interactive: aldoColor.black // #000000 focus / interactive
  },
  action: {
    primary: aldoColor.black, // #000000 primary button (the black CTA)
    primaryHover: aldoColor.blackHover, // #111111 (measured)
    primaryText: aldoColor.white, // white text on black
    // The signature bright yellow is the SECONDARY action surface — ALDO's
    // brand highlight as the secondary chip.
    secondary: aldoColor.yellow, // #ffef71 the signature yellow chip
    secondaryHover: aldoColor.yellowHover, // #ffe94d (à confirmer)
    secondaryText: aldoColor.ink, // #111111 dark ink on yellow
    danger: aldoColor.system.error // #c0202e (à confirmer — no ALDO source)
  },
  feedback: {
    success: aldoColor.system.success,
    warning: aldoColor.system.warning,
    error: aldoColor.system.error,
    info: aldoColor.system.info
  },
  status: {
    pending: aldoColor.system.warning,
    processing: aldoColor.system.info,
    completed: aldoColor.system.success,
    failed: aldoColor.system.error
  },
  // Categorical data-vis palette. ALDO publishes no data-vis scale; this is a
  // coherent proposal STARTING with the signature yellow, then black + greys +
  // complementary system hues (see MAPPING.md, "à confirmer").
  data: {
    category1: aldoColor.yellow, // #ffef71 signature yellow (leads the scale)
    category2: aldoColor.black, // #000000
    category3: aldoColor.grey[600], // #5c5f62
    category4: aldoColor.grey[400], // #8a8d90
    category5: aldoColor.grey[100], // #e2e2e2
    category6: aldoColor.system.info, // restrained blue (à confirmer)
    category7: aldoColor.system.success, // restrained green (à confirmer)
    category8: aldoColor.system.error // restrained red (à confirmer)
  }
} as const;

/**
 * The ALDO theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry ALDO-specific values (black-on-white lit by
 * the signature yellow), and the `component` layer is REBUILT from this theme's
 * own semantic/foundation via `createComponent` — so ALDO's identity reaches the
 * components (buttons, tabs, pagination, chat bubbles…), not just the elements
 * that read semantic vars directly.
 */
export const aldoTheme: TenantTheme = {
  id: "aldo",
  label: "ALDO",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default aldoTheme;
