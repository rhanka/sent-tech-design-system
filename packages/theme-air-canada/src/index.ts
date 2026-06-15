import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * AIR CANADA (aircanada.com — the Montréal-HQ flag carrier, Canada's largest
 * airline) theme for the Sentropic token structure.
 *
 * Air Canada's storefront is an Angular ("ngx-ac") build whose brand layer is the
 * "Compass" design language. Unlike many sites it ships a COMPLETE `:root` token
 * map of CSS custom properties (`--colour-*`, `--spacing-*`) inside its single
 * stylesheet bundle (`/home/styles.5314a14036859140.css`, fetched directly via
 * curl with the homepage referer). Every value below is MEASURED from that live
 * token map and the rules that consume it; the few derived/unsourceable values are
 * flagged "à confirmer" inline and in MAPPING.md. Font *names* only ("AC Nord
 * Text" body/UI + "AC Nord Display" headings — the airline's two proprietary
 * faces, measured from the `--ac-font-family-text` / `--ac-font-family-display`
 * tokens, the `@font-face` declarations and the preloaded
 * `/home/assets/font/ac-nord/AC_Nord_Text-*.woff2` binaries), never font binaries.
 *
 * Air Canada's identity is a BLUE-PRIMARY / MAPLE-RED-BRAND airline system. The
 * iconic RED maple-leaf "rondelle" mark is the brand accent (`--colour-text-brand`
 * #d8292f, bright `--colour-bg-fill-brand-secondary` #ff333a, and the logo glyph
 * #f01428), BUT every primary UI ACTION is the Air Canada UI BLUE
 * (`--colour-bg-fill-primary` #1460aa — the single most-used brand hex, 20×, with
 * measured hover #003d78 / pressed #002345). Ink is near-BLACK (#000 text-primary)
 * over WHITE surfaces (#fff) on a faint grey page (#f9f9f9); secondary text and the
 * "everyday" grey are #6d6d6f; borders/dividers are #c9cacc. Corners are SQUARE-ish
 * (measured 4px field/focus radius, 16px on raised cards). Form fields are BOXED
 * outlines (white fill, thin #c9cacc stroke) and focus is a DOUBLE RING — a dark
 * #333 (`--colour-border-tertiary`) 1px ring with a 1px white (`--colour-bg-surface`)
 * separator halo, drawn via a `:focus-visible::after` pseudo-element. The focus hue
 * is deliberately neutral-dark (not the blue primary nor the red brand) so the
 * indicator survives on any control.
 *
 * Air Canada colour reference (measured hex, Compass `:root` token map):
 *   UI blue (PRIMARY action / fill)     #1460aa   --colour-bg-fill-primary / -text-link / -border-primary (20× — THE Air Canada UI blue)
 *   UI blue hover                       #003d78   --colour-bg-fill-primary-hover / -text-label-hover
 *   UI blue pressed                     #002345   --colour-bg-fill-primary-pressed
 *   Legacy deep-teal CTA (alt)          #005078   legacy .primary button background (booking widget)
 *   Brand maple red (brand accent)      #d8292f   --colour-text-brand / -bg-fill-brand-primary / -icon-brand-primary
 *   Brand red bright (brand secondary)  #ff333a   --colour-bg-fill-brand-secondary / -text-brand-secondary
 *   Logo glyph red                      #f01428   --colour-icon-logo (the rondelle maple-leaf mark)
 *   Error / deep brand red ink          #851109   --colour-text-error / -icon-error / -bg-fill-error-toast
 *   Ink near-black (text primary)       #000000   --colour-text-primary / -icon-secondary
 *   Secondary text / "everyday" grey    #6d6d6f   --colour-text-secondary / -bg-fill-everyday
 *   Disabled secondary text grey        #a3a4a6   --colour-text-secondary-disabled
 *   White (surface / inverse text)      #ffffff   --colour-bg-surface / -text-inverse
 *   Page grey (subtle surface)          #f9f9f9   --colour-bg-primary / -bg-fill-tertiary
 *   Panel grey (secondary surface)      #eff0f2   --colour-bg-secondary / -bg-fill-alt
 *   Border / divider grey               #c9cacc   --colour-border-secondary / -border-divider / -border-disabled
 *   Dark fill (nav / footer ink)        #1e1e1e   --colour-bg-fill-nav-active / -bg-surface-footer
 *   Focus ring dark                     #333333   --colour-border-tertiary (focus-visible ::after ring)
 *   Success green                       #20842f   --colour-bg-fill-promo / -text-promo / -bg-fill-success-toast
 *   Success accent green                #439943   --colour-icon-success
 *   Warning amber                       #eb9c00   --colour-icon-warning
 *   Warning amber ink                   #996600   --colour-text-warning (#960)
 *   Info steel blue                     #78a1b4   --colour-icon-information / -border-information
 */

// --- AIR CANADA raw colour palette (measured hex, Compass :root token map) ----
const acColor = {
  // The UI system colour: Air Canada's PRIMARY ACTION is BLUE. Used for primary
  // CTAs, links, primary borders and primary icons.
  blue: {
    500: "#1460aa", // --colour-bg-fill-primary / -text-link / -border-primary (20× — THE Air Canada UI blue)
    600: "#003d78", // --colour-bg-fill-primary-hover / -text-label-hover
    700: "#002345", // --colour-bg-fill-primary-pressed
    teal: "#005078", // legacy .primary button background (booking widget alt CTA)
    10: "#f1f7fb" // --colour-bg-fill-information faint blue tint
  },
  // The Air Canada maple-leaf RED brand. Brand mark / accents only — NOT the
  // primary action.
  red: {
    500: "#d8292f", // --colour-text-brand / -bg-fill-brand-primary — THE Air Canada brand red
    bright: "#ff333a", // --colour-bg-fill-brand-secondary / -text-brand-secondary
    logo: "#f01428", // --colour-icon-logo (the rondelle maple-leaf glyph)
    error: "#851109", // --colour-text-error / -icon-error (deep brand red error ink, AA on white)
    100: "#fff1f0" // --colour-bg-fill-error faint red tint
  },
  // Neutral ink scale (Air Canada uses pure black for primary text).
  ink: {
    black: "#000000", // --colour-text-primary / -icon-secondary
    nav: "#1e1e1e", // --colour-bg-fill-nav-active / -bg-surface-footer (dark surface)
    tertiary: "#333333" // --colour-border-tertiary (focus ring) / -bg-fill-nav-hover
  },
  // Grey neutral scale (page greys, panel fills, field/divider strokes).
  grey: {
    50: "#f9f9f9", // --colour-bg-primary / -bg-fill-tertiary (page grey)
    100: "#eff0f2", // --colour-bg-secondary / -bg-fill-alt (panel grey)
    200: "#e2e3e5", // --colour-bg-fill-tertiary-hover / -text-tertiary
    300: "#c9cacc", // --colour-border-secondary / -border-divider / -border-disabled
    secondary: "#6d6d6f", // --colour-text-secondary / -bg-fill-everyday
    disabled: "#a3a4a6" // --colour-text-secondary-disabled
  },
  white: "#ffffff", // --colour-bg-surface / -text-inverse
  // System / status colours (measured Compass feedback tokens).
  system: {
    success: "#20842f", // --colour-text-promo / -bg-fill-success-toast
    successIcon: "#439943", // --colour-icon-success
    warning: "#996600", // --colour-text-warning (#960) — AA-grade amber ink on white
    warningIcon: "#eb9c00", // --colour-icon-warning
    error: "#851109", // --colour-text-error (deep brand red)
    info: "#78a1b4" // --colour-icon-information / -border-information
  }
} as const;

// --- foundation (AIR CANADA-specific values) --------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (action / primary / link). Air Canada's PRIMARY
    // ACTION IS BLUE, so the action steps map directly to the UI blue scale.
    blue: {
      10: acColor.blue[10], // #f1f7fb faint blue tint
      60: acColor.blue[500], // #1460aa THE Air Canada UI blue (primary action)
      80: acColor.blue[600] // #003d78 deep blue (hover/active ground)
    },
    // Sentropic "cyan" accent slot. Air Canada's signature warm accent is the maple
    // RED brand; mapped here so the iconic brand red survives as a distinct accent
    // (à confirmer — the Sentropic "cyan" slot is repurposed for the brand red).
    cyan: {
      10: acColor.red[100], // #fff1f0 faint red tint
      50: acColor.red[500], // #d8292f Air Canada brand red
      70: acColor.red.error // #851109 deep brand red
    },
    // Sentropic "slate" neutral family mapped onto Air Canada's black ink + grey ramp.
    slate: {
      0: acColor.white, // #ffffff white
      10: acColor.grey[50], // #f9f9f9 page grey
      20: acColor.grey[300], // #c9cacc divider / subtle border
      60: acColor.grey.secondary, // #6d6d6f secondary text
      80: acColor.ink.black, // #000000 primary text (black)
      90: acColor.ink.nav // #1e1e1e darkest surface ink
    },
    feedback: {
      success: acColor.system.success,
      warning: acColor.system.warning,
      error: acColor.system.error,
      info: acColor.system.info
    }
  },
  // Air Canada serves its proprietary "AC Nord Text" sans across body/UI/controls
  // and "AC Nord Display" on headings (both measured from the `--ac-font-family-*`
  // tokens, the `@font-face` rules, and the preloaded AC_Nord_Text-*.woff2 binaries;
  // the brand's own fallback is Open Sans → Arial). We reference family NAMES only,
  // never font binaries. Mono is not part of Air Canada — the Sentropic mono stack
  // is kept (à confirmer).
  font: {
    sans: "'AC Nord Text', 'Open Sans', Arial, sans-serif",
    display: "'AC Nord Display', 'AC Nord Text', 'Open Sans', Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Air Canada spacing: the Compass `--spacing-*` ramp is a strict 8px-based scale
  // (000:0, 025:2px, 050:4px, 100:8px, 150:12px, 200:16px, 300:24px, 400:32px,
  // 600:48px, 800:64px). Aligned to the Sentropic step keys.
  spacing: {
    0: "0",
    1: "0.25rem", // 4px (--spacing-050)
    2: "0.5rem", // 8px (--spacing-100)
    3: "0.75rem", // 12px (--spacing-150)
    4: "1rem", // 16px (--spacing-200)
    6: "1.5rem", // 24px (--spacing-300)
    8: "2rem", // 32px (--spacing-400)
    12: "3rem", // 48px (--spacing-600)
    16: "4rem" // 64px (--spacing-800)
  },
  // Air Canada corners are SQUARE-ish: measured 4px on fields / focus-visible ring,
  // 16px on raised "kilo" cards. The brand has no pill-button language; the pill
  // step is kept for chips/badges only (à confirmer — Air Canada uses minimal
  // rounding, mostly 4px).
  radius: {
    none: "0", // square (base `button{border-radius:0}`)
    sm: "2px", // small chips (--spacing-025 grade)
    md: "4px", // measured field / focus-visible ::after radius
    lg: "16px", // measured raised card radius
    pill: "999px" // chips/badges only (no Air Canada button pill)
  },
  // Air Canada elevation (measured raised-container box-shadows: hover
  // `0 10px 15px #0003`, soft `0 0 15px #0003`, deep `0 1rem 3rem #0000002d`).
  // Mapped to the three Sentropic slots.
  shadow: {
    subtle: "0 0 15px rgb(0 0 0 / 0.12)", // measured soft raised shadow
    medium: "0 10px 15px rgb(0 0 0 / 0.2)", // measured hover raised shadow
    floating: "0 16px 48px rgb(0 0 0 / 0.18), 0 2px 4px rgb(0 0 0 / 0.08)"
  },
  // Air Canada transitions are short and standard (measured `.2s` UI transitions).
  // Exact easing ramp not separately tokenised; kept aligned with the base
  // ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "200ms", // measured .2s UI transition
    slow: "320ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Air Canada-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (AIR CANADA) -------------------------------------
  // Air Canada dividers/field strokes measured at 1px solid #c9cacc; primary borders
  // 2px (legacy .primary button `border:2px`); the thick 2px is kept for emphasis.
  borderWidth: {
    none: "0",
    thin: "1px", // measured divider / field stroke (#c9cacc)
    thick: "2px" // measured primary button border-width
  },
  borderStyle: { solid: "solid" },
  // Air Canada control density. The legacy .primary CTA is tall (measured
  // min-height:5.2rem at the brand's 10px base = ~52px, padding 0 3rem). md targets
  // a comfortable ~48px control; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "3rem", paddingBlock: "0.75rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0.875rem", paddingInline: "2rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1rem" }
  },
  // Air Canada typography = "AC Nord Text" (body/controls) + "AC Nord Display"
  // (display). Brand weights are measured: regular 400 (light 300), semi-bold 600
  // (500), bold 700. Letter-spacing is 0 across the brand (53× `letter-spacing:0`).
  typography: {
    control: { family: "'AC Nord Text', 'Open Sans', Arial, sans-serif", size: "1rem", weight: "600", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'AC Nord Text', 'Open Sans', Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.375", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'AC Nord Text', 'Open Sans', Arial, sans-serif", size: "0.875rem", weight: "600", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Air Canada links: UI blue, underlined (measured `.ac-hyperlinks-*`
    // `color:#1460aa; text-decoration:underline`).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // Air Canada disabled states measured at ~50% (greyed #d6d7d9 fills / opacity:.5)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "200ms", easing: "ease-in-out" }, // measured .2s UI transition
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // AIR CANADA FOCUS = a DOUBLE RING. The measured `*:focus-visible::after` draws a
  // 1px solid #333 (`--colour-border-tertiary`) border inset by -2px, wrapped in a
  // 1px white (`--colour-bg-surface`) separator halo (`box-shadow:0 0 0 1px #fff`),
  // radius 4px. The focus hue is deliberately neutral-dark — neither the blue
  // primary nor the red brand — so the indicator survives on every control. Encoded
  // as a double-ring strategy with the measured dark ring colour.
  focus: {
    strategy: "double",
    width: "1px", // measured 1px ::after ring
    offset: "2px", // measured inset:-2px
    color: acColor.ink.tertiary, // #333 — neutral-dark focus ring (--colour-border-tertiary)
    inset: "0"
  },
  // AIR CANADA form fields are BOXED (outline): a white fill (`--colour-bg-surface`
  // #fff) with a thin grey stroke (`--colour-border-secondary` / `-border-divider`
  // #c9cacc, 1px) and a 4px radius. `style:"outline"` makes the builder draw four
  // equal borders from `surface.default` + `border.subtle`. The native <select>
  // chevron is redrawn in the UI blue (#1460aa, the primary-icon colour) with a 36px
  // right gutter (appearance:none).
  field: {
    style: "outline",
    fillBg: acColor.white, // #ffffff (--colour-bg-surface)
    underlineColor: acColor.grey[300], // #c9cacc (unused for outline, kept for completeness)
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%231460aa' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.25rem"
  },
  // Air Canada cards: white surface, generously rounded (measured raised "kilo"
  // container 16px), a soft grey border and a faint grey page hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: acColor.grey[50] // #f9f9f9 faint grey hover (--colour-bg-fill-tertiary)
  },
  // Air Canada secondary button = OUTLINED: white fill, blue text + blue border,
  // faint grey fill on hover (measured `--colour-bg-fill-secondary` #fff /
  // `-secondary-hover` #f9f9f9 with the blue border/label).
  buttonSecondary: {
    background: acColor.white, // #ffffff (--colour-bg-fill-secondary)
    border: acColor.blue[500], // #1460aa blue stroke (--colour-border-primary)
    hoverBackground: acColor.grey[50] // #f9f9f9 (--colour-bg-fill-secondary-hover)
  },
  // Air Canada tabs / sub-nav: active tab = blue bold label with a blue bottom
  // indicator (the primary-fill blue under-rule), transparent fill.
  tabs: {
    activeText: acColor.blue[500], // #1460aa active label (UI blue)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.75rem", // 12px (--spacing-150)
    paddingInline: "1rem", // 16px (--spacing-200)
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // blue underline on the bottom edge
    indicatorMode: "border" // a real bottom border indicator
  },
  // Air Canada pagination: borderless blue link text; active page = filled blue
  // box (the primary fill) with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: acColor.blue[500], // #1460aa link text (UI blue)
    activeBackground: acColor.blue[500], // #1460aa filled active page (primary blue)
    activeText: acColor.white, // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Air Canada breadcrumb: blue links, grey trail, black current page, grey
  // separators.
  breadcrumb: {
    linkText: acColor.blue[500], // #1460aa (--colour-text-link)
    text: acColor.grey.secondary, // #6d6d6f trail text (--colour-text-secondary)
    currentText: acColor.ink.black, // #000000 current page (--colour-text-primary)
    separator: acColor.grey.secondary, // #6d6d6f
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "600" // current page is emphasised
  },
  // Air Canada notice / alert: a tinted box with a coloured left filet matching the
  // severity (measured `--colour-bg-fill-error/success/warning/information` tints).
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0", // left border collapses (filet instead)
    filetWidth: "0.25rem", // 4px ::before accent bar
    paddingTop: "1rem", // 16px (--spacing-200)
    paddingRight: "1rem", // 16px
    paddingBottom: "1rem", // 16px
    paddingLeft: "1.25rem", // 20px (clears the left filet)
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Air Canada accordion / disclosure: a semibold black summary trigger, mildly
  // rounded, grey-separated.
  accordion: {
    text: acColor.ink.black, // #000000 summary label (--colour-text-primary)
    paddingBlock: "1rem", // 16px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "600", // Air Canada summary triggers are semibold
    lineHeight: "1.5rem" // 24px
  },
  // Air Canada tag: a small chip with a faint panel-grey fill and black ink (4px
  // brand radius, not a pill — the brand has minimal rounding).
  tag: {
    radius: "4px", // measured 4px brand radius
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: acColor.grey[100], // #eff0f2 panel grey (--colour-bg-secondary)
    neutralText: acColor.ink.black // #000000 black
  },
  // Air Canada badge: a small filled badge — UI blue fill / white text.
  badge: {
    radius: "4px", // measured 4px brand radius
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "600",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: acColor.blue[500], // #1460aa primary UI blue
    infoText: acColor.white // white on blue
  },
  // Air Canada checkbox/radio label: regular black type at base size.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: acColor.ink.black // #000000 black (--colour-text-primary)
  },
  // Air Canada search input: a boxed grey-stroked field, base type.
  search: {
    paddingBlock: "0.75rem", // 12px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Air Canada toggle / switch label: regular black type.
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.5rem", // 24px
    textColor: acColor.ink.black // #000000 black
  }
} as const;

// --- semantic (AIR CANADA-specific role mapping) ----------------------------
const semantic = {
  surface: {
    default: acColor.white, // #ffffff (--colour-bg-surface)
    subtle: acColor.grey[50], // #f9f9f9 page grey (--colour-bg-primary)
    raised: acColor.white, // #ffffff (--colour-bg-fill-secondary)
    inverse: acColor.ink.nav, // #1e1e1e dark reversed surface (footer / nav active)
    overlay: "rgb(0 0 0 / 0.3)" // measured --overlay-scrim rgba(0,0,0,.302)
  },
  text: {
    primary: acColor.ink.black, // #000000 (--colour-text-primary)
    secondary: acColor.grey.secondary, // #6d6d6f (--colour-text-secondary)
    muted: acColor.grey.secondary, // #6d6d6f
    inverse: acColor.white, // white on dark/blue surfaces (--colour-text-inverse)
    link: acColor.blue[500] // #1460aa UI blue link (--colour-text-link)
  },
  border: {
    subtle: acColor.grey[300], // #c9cacc divider / field stroke (--colour-border-divider)
    strong: acColor.grey.secondary, // #6d6d6f stronger control border (everyday grey)
    interactive: acColor.blue[500] // #1460aa primary UI blue (--colour-border-primary)
  },
  action: {
    primary: acColor.blue[500], // #1460aa THE Air Canada UI blue CTA (--colour-bg-fill-primary)
    primaryHover: acColor.blue[600], // #003d78 blue hover (--colour-bg-fill-primary-hover)
    primaryText: acColor.white, // white text on blue
    secondary: acColor.grey[100], // #eff0f2 grey secondary surface
    secondaryHover: acColor.grey[200], // #e2e3e5
    secondaryText: acColor.ink.black, // #000000 black secondary label
    danger: acColor.red.error // #851109 deep brand error red (--colour-text-error)
  },
  feedback: {
    success: acColor.system.success, // #20842f
    warning: acColor.system.warning, // #996600
    error: acColor.system.error, // #851109
    info: acColor.system.info // #78a1b4
  },
  status: {
    pending: acColor.system.warning, // #996600
    processing: acColor.system.info, // #78a1b4
    completed: acColor.system.success, // #20842f
    failed: acColor.system.error // #851109
  },
  // Categorical data-vis palette. Air Canada does not publish a single categorical
  // token list; the eight categories below are seeded from the measured Compass
  // hexes (blue lead, maple red, deep blue, secondary grey, success green, amber,
  // steel-info, deep blue) to give a legible brand-true scale.
  // See MAPPING.md, "à confirmer" — this is an assembled scale.
  data: {
    category1: acColor.blue[500], // #1460aa UI blue
    category2: acColor.red[500], // #d8292f maple red
    category3: acColor.blue[600], // #003d78 deep blue
    category4: acColor.grey.secondary, // #6d6d6f secondary grey
    category5: acColor.system.success, // #20842f success green
    category6: acColor.system.warningIcon, // #eb9c00 amber
    category7: acColor.system.info, // #78a1b4 steel info blue
    category8: acColor.blue[700] // #002345 deepest blue
  }
} as const;

/**
 * The AIR CANADA theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Air Canada-specific (blue-primary / maple-red
 * brand airline) values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so Air Canada's blue CTA, black ink,
 * boxed fields, square corners and double-ring focus reach the components (buttons,
 * tabs, pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const airCanadaTheme: TenantTheme = {
  id: "air-canada",
  label: "Air Canada",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default airCanadaTheme;
