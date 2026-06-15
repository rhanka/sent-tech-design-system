import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * LION ELECTRIC (thelionelectric.com — the Saint-Jérôme, Québec all-electric
 * truck & school-bus manufacturer) theme for the Sentropic token structure.
 *
 * Lion Electric's public site is a WordPress + Elementor build (theme
 * `hello-elementor`, kit `elementor-kit-6`). Elementor compiles the brand design
 * into a "global kit" stylesheet (`/wp-content/uploads/elementor/css/post-6.css`)
 * that publishes the brand colour roles as CSS custom properties
 * (`--e-global-color-accent`, `--e-global-color-primary/secondary/text`, plus a set
 * of light-blue brand tints) and the brand typography (`--e-global-typography-*`).
 * Every value below is MEASURED from that live kit stylesheet and the per-page
 * Elementor sheets (post-213 / post-405 / post-410), fetched directly via curl:
 * the global colour roles, the heading/body typography, and the `.elementor-button`
 * + `.elementor-kit-6 button` rules (radius, padding, hover). We reference font
 * *names* only ("Roobert LE", the brand's proprietary geometric sans, measured from
 * the site's `--e-global-typography-*-font-family` and `@font-face` family names),
 * never font binaries. Sources and the full mapping are in MAPPING.md.
 *
 * Lion Electric's identity is BOLD, CLEAN and ELECTRIC: a vivid ELECTRIC-BLUE brand
 * colour (#4164FF — `--e-global-color-accent`, the primary CTA fill + brand accent)
 * against a pure WHITE canvas (#FFFFFF — `--e-global-color-primary`) and pure-BLACK
 * INK (#000000 — `--e-global-color-text`). A soft pale-blue-grey (#EBF0F3 —
 * `--e-global-color-secondary`) is the quiet surface tint, and a family of light
 * sky-blues (#72C6EF, #D4EBF6, #CEDBE2) carry secondary buttons and accents.
 * Buttons are MILDLY ROUNDED (measured `border-radius:10px`) with generous padding
 * (measured `20px 60px`), and the brand's signature CTA hover INVERTS the colours:
 * the blue fill becomes the pale-blue-grey secondary and the white label becomes the
 * electric blue (measured `.elementor-kit-6 .elementor-button:hover` →
 * `background:--e-global-color-secondary; color:--e-global-color-accent`). Where
 * Sentropic needs a role Lion Electric does not publish (form-field chrome, the
 * success/warning palette), the closest measured hex is used and the choice is noted
 * "à confirmer" in MAPPING.md.
 *
 * Lion Electric colour reference (measured hex, elementor-kit-6 stylesheet):
 *   Electric blue (action / brand / accent)   #4164FF   --e-global-color-accent — THE Lion CTA blue
 *   Button stroke blue (border variant)        #467ff7   measured .elementor-button border-color (post-405)
 *   Sky blue (bright accent)                   #72c6ef   --e-global-color-d837983 (bright sky accent)
 *   Pale sky tint                              #d4ebf6   --e-global-color-b009999 (pale sky tint)
 *   Steel-blue tint (secondary button fill)    #cedbe2   --e-global-color-6d66d00 (alt secondary button fill)
 *   Pale blue-grey (signature surface tint)    #ebf0f3   --e-global-color-secondary — quiet surface / hover fill
 *   Pure black ink (text / headings)           #000000   --e-global-color-text / --e-global-color-96b4d41
 *   White (canvas / CTA text)                  #ffffff   --e-global-color-primary — THE Lion canvas
 */

// --- LION ELECTRIC raw colour palette (measured hex, elementor-kit-6 sheet) ----
const lionColor = {
  // The brand IS the vivid electric-blue. Used for the brand accent and the primary
  // CTA fill (.elementor-button background:--e-global-color-accent).
  blue: {
    500: "#4164ff", // --e-global-color-accent — THE Lion electric-blue
    stroke: "#467ff7", // measured .elementor-button border-color (post-405) — blue stroke variant
    sky: "#72c6ef", // --e-global-color-d837983 — bright sky-blue accent
    pale: "#d4ebf6", // --e-global-color-b009999 — pale sky tint
    steel: "#cedbe2" // --e-global-color-6d66d00 — steel-blue tint (alt secondary button fill)
  },
  // Pale blue-grey quiet surface (the signature secondary tint + the CTA hover fill).
  surfaceTint: "#ebf0f3", // --e-global-color-secondary — quiet surface / button hover fill
  // Pure-black ink (Lion uses pure #000000 for body + headings).
  ink: "#000000", // --e-global-color-text / --e-global-color-96b4d41 — THE Lion ink
  white: "#ffffff", // --e-global-color-primary — THE Lion white canvas / CTA text
  // System / status colours. Lion's kit publishes no success/warning/error hue, so
  // these are AA-on-white defaults (error stays close to a clean brand red).
  system: {
    error: "#d12c2c", // AA-grade clean red (not brand-published — à confirmer)
    success: "#2e7d32", // AA-grade success green (not brand-published — à confirmer)
    warning: "#8a6d3b", // AA-grade amber ink (not brand-published — à confirmer)
    info: "#4164ff" // info reuses the brand electric-blue
  }
} as const;

// --- foundation (LION ELECTRIC-specific values) -----------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (action / primary / link) — Lion's PRIMARY ACTION
    // IS the electric-blue, so the action steps map onto the blue scale; the lightest
    // step is the pale sky tint.
    blue: {
      10: lionColor.blue.pale, // #d4ebf6 pale sky tint
      60: lionColor.blue[500], // #4164ff THE Lion electric-blue (primary action)
      80: "#2541cc" // darker electric-blue (active/pressed ground — derived, à confirmer)
    },
    // Sentropic "cyan" accent slot — Lion's cool accent is the bright sky-blue family.
    cyan: {
      10: lionColor.blue.pale, // #d4ebf6 pale sky tint
      50: lionColor.blue.sky, // #72c6ef bright sky accent
      70: lionColor.blue[500] // #4164ff electric-blue
    },
    // Sentropic "slate" neutral family — Lion's neutrals are pure white/black plus the
    // pale blue-grey surface tint.
    slate: {
      0: lionColor.white, // #ffffff white
      10: lionColor.surfaceTint, // #ebf0f3 pale blue-grey surface tint
      20: lionColor.blue.steel, // #cedbe2 steel-blue tint (subtle border)
      60: "#4a5560", // mid blue-grey secondary ink (derived from steel tint — à confirmer)
      80: lionColor.ink, // #000000 primary ink (pure black)
      90: lionColor.ink // #000000
    },
    feedback: {
      success: lionColor.system.success,
      warning: lionColor.system.warning,
      error: lionColor.system.error,
      info: lionColor.system.info
    }
  },
  // Lion Electric serves "Roobert LE" as its body/UI/control AND display sans
  // (measured `--e-global-typography-*-font-family:"Roobert LE"` for primary,
  // secondary, accent and text roles — one family across the whole site), with an
  // Arial fallback (measured `font-family:"Roobert LE", Arial`). We reference the
  // family NAME only. Mono is not part of Lion Electric — the Sentropic mono stack
  // is kept.
  font: {
    sans: "'Roobert LE', Arial, Helvetica, sans-serif",
    display: "'Roobert LE', Arial, Helvetica, sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Lion Electric spacing: Elementor's default 4/8px-based ramp. The measured CTA
  // padding is generous (`20px 60px` on the kit button); kept on the standard step
  // keys.
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
  // Lion Electric rounds its BUTTONS and CARDS to a soft 10px (measured
  // `.elementor-button` / kit button `border-radius:10px 10px 10px 10px`; some
  // utility elements are square `0px`). Mapped onto the Sentropic radius steps with
  // `lg` = the measured 10px button radius.
  radius: {
    none: "0", // square — Lion's `0px` utility elements
    sm: "4px", // small chips (derived soft step)
    md: "6px", // small card / control radius (derived soft step)
    lg: "10px", // buttons / cards — measured `.elementor-button` radius
    pill: "999px" // fully-rounded pill (chips / badges)
  },
  // Lion Electric elevation is light and clean (lots of white space, bold colour). The
  // kit publishes no single elevation ramp; restrained near-black-tinted shadows are
  // derived (à confirmer).
  shadow: {
    subtle: "0 1px 3px rgb(0 0 0 / 0.10)",
    medium: "0 4px 12px rgb(0 0 0 / 0.12)",
    floating: "0 12px 32px rgb(0 0 0 / 0.16), 0 2px 6px rgb(0 0 0 / 0.08)"
  },
  // Lion Electric page transitions are fade-based at 500ms (measured
  // `--e-page-transition-animation-duration:500ms`); interaction transitions kept on
  // the Sentropic ramp.
  motion: {
    fast: "150ms",
    normal: "250ms",
    slow: "500ms", // measured page-transition duration
    easing: "ease-in-out"
  },
  // z-index roles are not Lion-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (LION ELECTRIC) ----------------------------------
  // Lion's kit buttons publish no border at rest (some per-page buttons add a 1px
  // `#467ff7` blue stroke); divider/field strokes use the steel-blue tint. thick 2px
  // kept for emphasis.
  borderWidth: {
    none: "0",
    thin: "1px", // divider / subtle stroke
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Lion control density. The measured kit CTA is large (padding `20px 60px`, ~17–25px
  // label); per-page buttons are tighter (`15px 40px` / `10px 20px`). md targets a
  // comfortable ~48px control; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.5rem", paddingBlock: "0.625rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "0.875rem" },
    md: { controlHeight: "3rem", paddingBlock: "0.9375rem", paddingInline: "2.5rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1rem" },
    lg: { controlHeight: "3.5rem", paddingBlock: "1.25rem", paddingInline: "3.75rem", gap: "0.5rem", minWidth: "3.5rem", fontSize: "1.0625rem" }
  },
  // Lion typography = "Roobert LE" across every role. Headings are weight 500
  // (measured `--e-global-typography-primary/secondary/accent-font-weight:500`),
  // body/fields are weight 400 (measured `--e-global-typography-text-font-weight:400`,
  // base 17px desktop → 14px small). The CTA label is the accent role (weight 500,
  // ~17–25px). No uppercase / letter-spacing measured.
  typography: {
    control: { family: "'Roobert LE', Arial, sans-serif", size: "1.0625rem", weight: "500", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Roobert LE', Arial, sans-serif", size: "1.0625rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Roobert LE', Arial, sans-serif", size: "1rem", weight: "500", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Lion links: electric-blue ink, underlined on hover (Elementor default —
    // unsourced exact decoration, à confirmer).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.4", // Lion disables controls at ≈ 40% (à confirmer)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "250ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // LION ELECTRIC FOCUS = an electric-blue ring. The kit publishes no explicit focus
  // technique beyond the button :focus rule reusing the hover (secondary fill +
  // electric-blue text); we encode a clean electric-blue outline ring as the brand-
  // true focus indicator (à confirmer — exact focus chrome not separately published).
  focus: {
    strategy: "ring",
    width: "2px",
    offset: "2px",
    color: lionColor.blue[500] // #4164ff — electric-blue focus ring
  },
  // LION ELECTRIC form fields: the kit publishes no custom input chrome (Elementor's
  // default boxed input). We encode a clean BOXED outline (white fill, 1px steel-blue
  // tint stroke, soft 10px radius matching the button language). `style:"outline"`
  // draws four equal borders from `surface.default` + `border.subtle`. The native
  // <select> chevron is redrawn in the electric-blue with a 36px right gutter. The
  // field chrome is "à confirmer" — see MAPPING.md.
  field: {
    style: "outline",
    fillBg: lionColor.white, // #ffffff
    underlineColor: lionColor.blue.steel, // #cedbe2 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%234164ff' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.25rem"
  },
  // Lion cards: white surface, soft 10px radius (button language), steel-blue tint
  // border, a faint pale-blue-grey hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: lionColor.surfaceTint // #ebf0f3 faint pale-blue-grey hover
  },
  // Lion secondary button = the steel-blue / pale-blue ghost (measured per-page
  // buttons use `--e-global-color-6d66d00` #cedbe2 as a secondary fill with black
  // text); hovers to the pale-blue-grey surface tint.
  buttonSecondary: {
    background: lionColor.blue.steel, // #cedbe2 steel-blue secondary fill
    border: lionColor.blue.steel, // #cedbe2 matching stroke
    hoverBackground: lionColor.surfaceTint // #ebf0f3 pale-blue-grey hover fill
  },
  // Lion tabs / sub-nav: active tab = electric-blue bold label with an electric-blue
  // bottom indicator (the brand accent), transparent fill.
  tabs: {
    activeText: lionColor.blue[500], // #4164ff active label (brand electric-blue)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "500",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1.0625rem", // 17px (Lion base body type)
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // electric-blue underline on the bottom edge
    indicatorMode: "border"
  },
  // Lion pagination: borderless black link text; active page = filled electric-blue
  // pill (the brand fill) with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: lionColor.ink, // #000000 black link text
    activeBackground: lionColor.blue[500], // #4164ff filled active page (brand blue)
    activeText: lionColor.white, // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Lion breadcrumb: electric-blue links, black current page, steel-blue separators.
  breadcrumb: {
    linkText: lionColor.blue[500], // #4164ff
    text: lionColor.ink, // #000000 trail text
    currentText: lionColor.ink, // #000000 current page
    separator: lionColor.blue.steel, // #cedbe2
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.25rem", // 20px
    currentWeight: "500"
  },
  // Lion notice / alert: a tinted box with a coloured left filet matching the severity.
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
    paddingLeft: "1.25rem", // 20px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Lion accordion / disclosure: a medium black summary trigger.
  accordion: {
    text: lionColor.ink, // #000000 summary label (black)
    paddingBlock: "1rem", // 16px
    paddingInline: "1rem", // 16px
    fontSize: "1.0625rem", // 17px
    fontWeight: "500", // Lion headings/triggers are weight 500
    lineHeight: "1.5rem" // 24px
  },
  // Lion tag: a soft pale-blue chip with black ink (the brand surface-tint language).
  tag: {
    radius: "10px", // Lion's soft 10px button/card language
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: lionColor.surfaceTint, // #ebf0f3 pale-blue-grey fill
    neutralText: lionColor.ink // #000000 black
  },
  // Lion badge: a small filled badge — electric-blue fill / white text.
  badge: {
    radius: "999px", // pill
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: lionColor.blue[500], // #4164ff brand electric-blue
    infoText: lionColor.white // white on blue
  },
  // Lion checkbox/radio label: regular black type at base size.
  choice: {
    labelFontSize: "1.0625rem", // 17px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: lionColor.ink // #000000 black
  },
  // Lion search input: a boxed steel-blue-stroked field, base type.
  search: {
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "1.0625rem", // 17px
    lineHeight: "1.5rem" // 24px
  },
  // Lion toggle / switch label: regular black type.
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.5rem", // 24px
    textColor: lionColor.ink // #000000 black
  }
} as const;

// --- semantic (LION ELECTRIC-specific role mapping) -------------------------
const semantic = {
  surface: {
    default: lionColor.white, // #ffffff white (--e-global-color-primary)
    subtle: lionColor.surfaceTint, // #ebf0f3 pale-blue-grey tint (--e-global-color-secondary)
    raised: lionColor.white, // #ffffff white
    inverse: lionColor.ink, // #000000 black reversed surface
    overlay: "rgb(0 0 0 / 0.6)" // modal backdrop (black ink, 60%)
  },
  text: {
    primary: lionColor.ink, // #000000 black (--e-global-color-text / primary text)
    secondary: "#4a5560", // mid blue-grey secondary ink (derived — à confirmer)
    muted: "#4a5560", // mid blue-grey
    inverse: lionColor.white, // #ffffff white on dark
    link: lionColor.blue[500] // #4164ff electric-blue link ink
  },
  border: {
    subtle: lionColor.blue.steel, // #cedbe2 steel-blue tint (field stroke / divider)
    strong: "#4a5560", // mid blue-grey stronger outline (derived — à confirmer)
    interactive: lionColor.blue[500] // #4164ff brand electric-blue (interactive accent)
  },
  action: {
    primary: lionColor.blue[500], // #4164ff THE Lion electric-blue CTA
    primaryHover: lionColor.surfaceTint, // #ebf0f3 measured CTA hover → secondary fill (colour inverts)
    primaryText: lionColor.white, // white text on blue
    secondary: lionColor.blue.steel, // #cedbe2 steel-blue secondary surface
    secondaryHover: lionColor.surfaceTint, // #ebf0f3 pale-blue-grey hover
    secondaryText: lionColor.ink, // #000000 black secondary label
    danger: lionColor.system.error // #d12c2c clean red (à confirmer)
  },
  feedback: {
    success: lionColor.system.success, // #2e7d32
    warning: lionColor.system.warning, // #8a6d3b
    error: lionColor.system.error, // #d12c2c
    info: lionColor.system.info // #4164ff
  },
  status: {
    pending: lionColor.system.warning, // #8a6d3b
    processing: lionColor.system.info, // #4164ff
    completed: lionColor.system.success, // #2e7d32
    failed: lionColor.system.error // #d12c2c
  },
  // Categorical data-vis palette. Lion Electric publishes no single categorical token
  // list; the eight categories below are seeded from the measured brand hexes
  // (electric-blue lead, sky-blue, steel-blue, pale sky, plus AA-grade success/amber
  // and pure black) to give a legible brand-true scale.
  // See MAPPING.md, "à confirmer" — this is an assembled scale.
  data: {
    category1: lionColor.blue[500], // #4164ff electric-blue
    category2: lionColor.blue.sky, // #72c6ef sky-blue
    category3: lionColor.blue.steel, // #cedbe2 steel-blue
    category4: lionColor.blue.pale, // #d4ebf6 pale sky
    category5: lionColor.system.success, // #2e7d32 success green
    category6: lionColor.system.warning, // #8a6d3b amber
    category7: lionColor.blue.stroke, // #467ff7 blue stroke variant
    category8: lionColor.ink // #000000 black
  }
} as const;

/**
 * The LION ELECTRIC theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Lion-specific (bold electric-blue,
 * pure black/white) values, and the `component` layer is REBUILT from this theme's
 * own semantic/foundation via `createComponent` — so Lion's electric-blue CTA, black
 * ink, soft 10px radius and clean blue focus reach the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars directly.
 */
export const lionElectricTheme: TenantTheme = {
  id: "lion-electric",
  label: "Lion Electric",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default lionElectricTheme;
