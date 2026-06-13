import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * DESJARDINS (desjardins.com — Mouvement Desjardins, the Québec cooperative
 * financial group) theme for the Sentropic token structure.
 *
 * Desjardins ships a real, in-page design system whose CSS custom properties are
 * all prefixed `--dsd-*` ("Desjardins Design"). Every value below is MEASURED
 * from the live site's computed CSS (https://www.desjardins.com/qc/fr.html,
 * inspected in a real browser: the `--dsd-color-*`, `--dsd-border-radius-*`,
 * `--dsd-font-*` and `--dsd-spacing-*` token tables, plus computed styles on real
 * buttons, links, headings, inputs and selects). We reference the font *name*
 * only ("Desjardins Sans", the brand's proprietary sans — measured
 * `--dsd-font-main-name`), never font binaries. Sources and the full mapping
 * table are in MAPPING.md.
 *
 * Desjardins's identity is a TRUSTWORTHY COOPERATIVE BANK system: the ICONIC
 * Desjardins GREEN (#00874e) drives every primary action and the brand mark,
 * surfaces are white on a faint grey page, ink is a soft near-black (#2f2f2f,
 * not pure black), corners are MILDLY rounded (4px on controls), form fields are
 * BOXED outlines (1.6px grey border, white fill, redrawn select chevron) and
 * focus is an accessible BLUE outline (#0061cb) — deliberately a different hue
 * from the green brand so the focus indicator never blends into a green control.
 * Where Sentropic needs a role Desjardins does not publish, the closest measured
 * `--dsd-*` token is used and the choice is noted "à confirmer" in MAPPING.md.
 *
 * Desjardins colour reference (measured `--dsd-*`, light theme):
 *   Brand green (action / brand)       #00874e   --dsd-color-background-brand (rgb 0,135,78)
 *   Brand green hover                  #007142   --dsd-button-primary-background-brand-hover
 *   Brand green active                 #00673b   --dsd-button-primary-background-brand-active
 *   Dark green (secondary / border)    #055b37   --boa-brand-secondary-default / border-button-brand
 *   Darkest green                      #053e26   --dsd-color-background-decorative-brand-600
 *   Ink default (text primary)         #2f2f2f   --dsd-color-font-default (soft near-black)
 *   Ink contrast                       #000000   --dsd-color-font-contrast
 *   Text secondary / muted             #6c6c6c   --dsd-color-font-secondary
 *   Tertiary / reversed surface ink    #383838   --dsd-color-font-tertiary / background-reversed
 *   Link blue                          #025aba   --dsd-color-font-link
 *   Link visited (purple)              #663e7b   --dsd-color-font-link-visited
 *   White (surface default)            #ffffff   --dsd-color-background-default
 *   Page grey (subtle surface)         #f4f4f4   --dsd-color-background-page
 *   Graphite-100 (faint border tint)   #f1f2f3   --dsd-color-…-decorative-graphite-100
 *   Graphite-200 (disabled / divider)  #e6e7e8   --dsd-color-background-disabled
 *   Graphite-300 (reversed btn border) #c7c9cc   --dsd-color-border-button-reversed
 *   Graphite-400 (border default)      #6c6c6c   --dsd-color-border-default
 *   Border inactive (field stroke)     #767676   --dsd-color-border-inactive
 *   Focus blue                         #0061cb   --dsd-color-border-focus
 *   Error red (button / form border)   #ca241a   --dsd-color-background-button-error
 *   Error ink                          #960e02   --dsd-color-font-error
 *   Success / confirmation green       #055b37   --dsd-color-background-link-confirmation
 *   Warning ink / border               #443507 / #ad8405  --dsd-color-font-warning / border-warning
 *   Info ink / border                  #1c3a52 / #5791bd  --dsd-color-font-information / border-information
 */

// --- DESJARDINS raw colour palette (measured `--dsd-*` design tokens) --------
const desjardinsColor = {
  // The brand IS the iconic Desjardins green. Used for the logo hexagon, every
  // primary CTA and brand accents.
  green: {
    400: "#00874e", // --dsd-color-background-brand / -accent / -button-brand (rgb 0,135,78) — THE Desjardins green
    hover: "#007142", // --dsd-button-primary-background-brand-hover
    active: "#00673b", // --dsd-button-primary-background-brand-active
    500: "#055b37", // --boa-brand-secondary-default / --dsd-color-border-button-brand / confirmation link
    600: "#053e26", // --dsd-color-background-decorative-brand-600 (darkest green ink)
    100: "#ecf5f0", // --dsd-color-background-decorative-brand-100 (faint green tint)
    200: "#cce7d7", // --dsd-color-background-decorative-brand-200
    300: "#b0d6c6" // --dsd-color-background-decorative-brand-300
  },
  // Soft near-black ink scale (Desjardins never uses pure black for body text).
  ink: {
    default: "#2f2f2f", // --dsd-color-font-default — primary text (soft near-black)
    tertiary: "#383838", // --dsd-color-font-tertiary / --dsd-color-background-reversed
    secondary: "#6c6c6c", // --dsd-color-font-secondary — secondary / muted text
    contrast: "#000000" // --dsd-color-font-contrast — pure black (rare, high-contrast only)
  },
  // Graphite neutral scale (Desjardins "graphite" decorative ramp).
  grey: {
    50: "#f4f4f4", // --dsd-color-background-page — faint page grey
    100: "#f1f2f3", // --dsd-color-…-decorative-graphite-100 — faintest neutral
    200: "#e6e7e8", // --dsd-color-background-disabled / graphite-200 — divider / disabled fill
    300: "#c7c9cc", // --dsd-color-border-button-reversed / graphite-300 — soft border
    400: "#6c6c6c", // --dsd-color-border-default / graphite-400 — default border + secondary ink
    field: "#767676" // --dsd-color-border-inactive — measured field/select stroke (1.6px)
  },
  white: "#ffffff", // --dsd-color-background-default — surface default
  // Link blue (Desjardins links are blue, distinct from the green brand).
  link: "#025aba", // --dsd-color-font-link
  linkVisited: "#663e7b", // --dsd-color-font-link-visited (purple)
  // Accessible focus blue — deliberately NOT the brand green, so the focus ring
  // stays visible on green controls.
  focus: "#0061cb", // --dsd-color-border-focus
  // System / status colours (all measured `--dsd-*` semantic tokens).
  system: {
    error: "#ca241a", // --dsd-color-background-button-error — danger fill / form-error border
    errorInk: "#960e02", // --dsd-color-font-error — error text
    success: "#055b37", // --dsd-color-background-link-confirmation — success green (AA on white)
    successBorder: "#229c69", // --dsd-color-border-confirmation
    warning: "#ad8405", // --dsd-color-border-warning — warning accent (AA-grade amber)
    warningInk: "#443507", // --dsd-color-font-warning — warning text
    info: "#5791bd", // --dsd-color-border-information — info accent
    infoInk: "#1c3a52" // --dsd-color-font-information — info text
  }
} as const;

// --- foundation (DESJARDINS-specific values) --------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (action / primary / link). Desjardins's
    // PRIMARY ACTION is green, so the action steps are mapped to the green scale;
    // the lightest step is the faint green tint.
    blue: {
      10: desjardinsColor.green[100], // #ecf5f0 faint green tint
      60: desjardinsColor.green[400], // #00874e THE Desjardins green (primary action)
      80: desjardinsColor.green[500] // #055b37 dark green (hover/active/border ground)
    },
    // Sentropic "cyan" accent slot. Desjardins has no separate cyan accent; the
    // measured "aqua/petroleum" decorative family is the closest cool accent, but
    // to keep the brand coherent we map it onto the green scale (à confirmer).
    cyan: {
      10: desjardinsColor.green[100], // #ecf5f0 light green tint
      50: desjardinsColor.green[400], // #00874e brand green as the accent
      70: desjardinsColor.green[600] // #053e26 darkest green
    },
    // Sentropic "slate" neutral family mapped onto the Desjardins graphite ramp
    // and soft-black ink.
    slate: {
      0: desjardinsColor.white, // #ffffff white
      10: desjardinsColor.grey[50], // #f4f4f4 page grey
      20: desjardinsColor.grey[200], // #e6e7e8 divider / subtle border
      60: desjardinsColor.ink.secondary, // #6c6c6c secondary text
      80: desjardinsColor.ink.default, // #2f2f2f primary text (soft near-black)
      90: desjardinsColor.ink.contrast // #000000 contrast black
    },
    feedback: {
      success: desjardinsColor.system.success,
      warning: desjardinsColor.system.warning,
      error: desjardinsColor.system.error,
      info: desjardinsColor.system.info
    }
  },
  // Desjardins serves its proprietary "Desjardins Sans" across the whole site
  // (measured `--dsd-font-main-name: "Desjardins Sans"`; body, headings, controls
  // and fields all resolve to it). We reference the NAME only, with the brand's
  // own Arial/Helvetica fallback chain. Headings and CTAs are bold (700);
  // weights light/regular/semibold/bold/extrabold = 300/400/500/700/800. Mono is
  // not part of Desjardins — the Sentropic mono stack is kept.
  font: {
    sans: "'Desjardins Sans', Arial, Helvetica, sans-serif",
    display: "'Desjardins Sans', Arial, Helvetica, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Desjardins spacing scale (measured `--dsd-spacing-rem-padding-*`): a 4px-based
  // ramp (0 / 0.125 / 0.25 / 0.5 / 0.75 / 1 / 1.5 / 2 / 2.5 / 3 / 4 rem). Aligned
  // here to the Sentropic step keys.
  spacing: {
    0: "0",
    1: "0.25rem", // 4px  (--dsd-spacing-rem-padding-150)
    2: "0.5rem", // 8px  (--dsd-spacing-rem-padding-200)
    3: "0.75rem", // 12px (--dsd-spacing-rem-padding-250)
    4: "1rem", // 16px (--dsd-spacing-rem-padding-300)
    6: "1.5rem", // 24px (--dsd-spacing-rem-padding-350)
    8: "2rem", // 32px (--dsd-spacing-rem-padding-400)
    12: "3rem", // 48px (--dsd-spacing-rem-padding-500)
    16: "4rem" // 64px (--dsd-spacing-rem-padding-550)
  },
  // Desjardins rounds MILDLY — the measured `--dsd-border-radius-*` ramp is
  // 0 / 2 / 4 / 8 / 12 / 16 / 24 / 32 / 999(pill). Controls (the measured select)
  // use 4px = radius-150; cards step up to 8px = radius-200.
  radius: {
    none: "0", // --dsd-border-radius-50
    sm: "2px", // --dsd-border-radius-100
    md: "4px", // --dsd-border-radius-150 — measured control (button / input / select)
    lg: "8px", // --dsd-border-radius-200 — cards / larger surfaces
    pill: "999px" // --dsd-border-radius-pill — pills / tags
  },
  // Desjardins elevation (measured `--dsd-elevation-*`). The ramp is dark-tinted
  // and tight; mapped to the three Sentropic slots.
  shadow: {
    subtle: "0px 1px 2px rgb(0 0 0 / 0.48)", // ≈ --dsd-elevation-100 (0px 1px 2px #0000007a)
    medium: "0px 2px 8px rgb(0 0 0 / 0.40)", // ≈ --dsd-elevation-250 (0px 2px 8px #00000066)
    floating: "0px 8px 24px rgb(0 0 0 / 0.32), 0px 2px 2px rgb(0 0 0 / 0.24)" // ≈ --dsd-elevation-350
  },
  // Desjardins transitions are short and standard (`transition: all`, measured).
  // Exact durations are not separately tokenised publicly; kept aligned with base
  // ("à confirmer" exact steps).
  motion: {
    fast: "120ms",
    normal: "200ms",
    slow: "320ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Desjardins-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (DESJARDINS) -------------------------------------
  // Desjardins field/select borders measured at 1.6px solid #767676. We encode
  // the signature 1.6px stroke as the nearest clean 2px "thin" (documented in
  // MAPPING.md); thick is 2px → kept aligned for emphasis.
  borderWidth: {
    none: "0",
    thin: "1px", // body dividers; field stroke is 1.6px (à confirmer — see MAPPING)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Desjardins control density. Measured primary CTA = 64px tall with 24px/20px
  // padding and 14px/700 label; the select = ~40px with 10px/12px padding and
  // 16px text. md targets a comfortable ~44px control; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.625rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0.75rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1rem" }
  },
  // Desjardins typography = "Desjardins Sans". Control labels are BOLD (measured
  // CTA font-weight 700), body/field text is regular (400). Base type is 16px.
  // Headings are heavy (H1 42px/700 letter-spacing -1px, H2 24px/700).
  typography: {
    control: { family: "'Desjardins Sans', Arial, Helvetica, sans-serif", size: "0.875rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Desjardins Sans', Arial, Helvetica, sans-serif", size: "1rem", weight: "400", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Desjardins Sans', Arial, Helvetica, sans-serif", size: "1rem", weight: "500", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Desjardins links are UNDERLINED blue at rest (measured anchor
    // text-decoration: underline, colour #025aba).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.4", // Desjardins disables via --dsd-color-font-disabled #38383866 (≈ 40% alpha)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "200ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // DESJARDINS FOCUS = an accessible BLUE OUTLINE (`--dsd-color-border-focus
  // #0061cb`). Measured outline-width 2.4px solid; encoded as 2px. The focus hue
  // is deliberately blue (not the green brand) so the indicator never blends into
  // a green control.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: desjardinsColor.focus, // #0061cb — accessible blue focus indicator
    inset: "0"
  },
  // DESJARDINS form fields are BOXED (outline): a white fill with a thin grey
  // stroke (measured 1.6px solid #767676) and a 4px radius. `style: "outline"`
  // makes the builder draw four equal borders from `surface.default` +
  // `border.subtle`. The native <select> chevron is redrawn in the soft-black ink
  // with a 36px right gutter (measured padding-right 36px, appearance: none).
  field: {
    style: "outline",
    fillBg: desjardinsColor.white, // #ffffff
    underlineColor: desjardinsColor.grey.field, // #767676 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%232f2f2f' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.25rem"
  },
  // Desjardins cards: white surface, mildly rounded (8px), a soft graphite border
  // and a faint green-tinted hover (the measured table cell hover #ecf5f0).
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: desjardinsColor.green[100] // #ecf5f0 faint green hover (--dsd-table-cell-background-hover)
  },
  // Desjardins secondary button = OUTLINED: transparent fill, green text + green
  // border, faint green fill on hover (measured --dsd-button-secondary-*-brand).
  buttonSecondary: {
    background: "transparent",
    border: desjardinsColor.green[500], // #055b37 dark-green stroke (--dsd-color-border-button-brand)
    hoverBackground: desjardinsColor.green[100] // #ecf5f0 faint green fill on hover
  },
  // Desjardins tabs / sub-nav: active tab = green bold label with a green bottom
  // indicator, transparent fill.
  tabs: {
    activeText: desjardinsColor.green[500], // #055b37 active label (accessible dark green)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px (Desjardins base type)
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // green underline on the bottom edge
    indicatorMode: "border" // a real bottom border indicator
  },
  // Desjardins pagination: borderless blue link text; active page = filled green
  // square (the brand fill) with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: desjardinsColor.link, // #025aba link text
    activeBackground: desjardinsColor.green[400], // #00874e filled active page (brand green)
    activeText: desjardinsColor.white, // white on green
    activeBorderWidth: "0",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Desjardins breadcrumb: blue links, grey trail, soft-black current page, grey
  // separators.
  breadcrumb: {
    linkText: desjardinsColor.link, // #025aba
    text: desjardinsColor.ink.secondary, // #6c6c6c trail text
    currentText: desjardinsColor.ink.default, // #2f2f2f current page
    separator: desjardinsColor.ink.secondary, // #6c6c6c
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "700" // current page is emphasised
  },
  // Desjardins notice / alert: a tinted box with a coloured left filet matching
  // the severity (the measured confirmation/error/warning/information surfaces).
  alert: {
    background: "transparent",
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
  // Desjardins accordion / disclosure: a bold soft-black summary trigger, mildly
  // rounded, graphite-separated.
  accordion: {
    text: desjardinsColor.ink.default, // #2f2f2f summary label
    paddingBlock: "1rem", // 16px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "700", // Desjardins summary triggers are bold
    lineHeight: "1.5rem" // 24px
  },
  // Desjardins tag: a small PILL chip with a faint green fill and dark-green ink
  // (the measured confirmation tag tone).
  tag: {
    radius: "999px", // Desjardins tags/pills round fully
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: desjardinsColor.grey[200], // #e6e7e8 graphite fill
    neutralText: desjardinsColor.ink.default // #2f2f2f
  },
  // Desjardins badge: a small filled badge — brand green fill / white text.
  badge: {
    radius: "999px", // pill
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "700",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: desjardinsColor.green[400], // #00874e brand green
    infoText: desjardinsColor.white // white on green
  },
  // Desjardins checkbox/radio label: regular soft-black type at base size.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: desjardinsColor.ink.default // #2f2f2f
  },
  // Desjardins search input: a boxed grey-stroked field, base type.
  search: {
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Desjardins toggle / switch label: regular soft-black type.
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.5rem", // 24px
    textColor: desjardinsColor.ink.default // #2f2f2f
  }
} as const;

// --- semantic (DESJARDINS-specific role mapping) ----------------------------
const semantic = {
  surface: {
    default: desjardinsColor.white, // #ffffff white (--dsd-color-background-default)
    subtle: desjardinsColor.grey[50], // #f4f4f4 page grey (--dsd-color-background-page)
    raised: desjardinsColor.white, // #ffffff white
    inverse: desjardinsColor.ink.tertiary, // #383838 reversed surface (--dsd-color-background-reversed)
    overlay: "rgb(0 0 0 / 0.6)" // modal backdrop — measured --dsd-color-background-backdrop #00000099
  },
  text: {
    primary: desjardinsColor.ink.default, // #2f2f2f (--dsd-color-font-default, soft near-black)
    secondary: desjardinsColor.ink.secondary, // #6c6c6c (--dsd-color-font-secondary)
    muted: desjardinsColor.ink.secondary, // #6c6c6c
    inverse: desjardinsColor.white, // white on dark/green surfaces
    link: desjardinsColor.link // #025aba (--dsd-color-font-link)
  },
  border: {
    subtle: desjardinsColor.grey[200], // #e6e7e8 divider (graphite-200)
    strong: desjardinsColor.grey.field, // #767676 field / input stroke (--dsd-color-border-inactive)
    interactive: desjardinsColor.green[400] // #00874e brand green (interactive accent)
  },
  action: {
    primary: desjardinsColor.green[400], // #00874e THE Desjardins green CTA
    primaryHover: desjardinsColor.green.hover, // #007142 (--dsd-button-primary-background-brand-hover)
    primaryText: desjardinsColor.white, // white text on green
    secondary: desjardinsColor.grey[100], // #f1f2f3 graphite secondary surface
    secondaryHover: desjardinsColor.grey[200], // #e6e7e8
    secondaryText: desjardinsColor.green[500], // #055b37 dark-green secondary label
    danger: desjardinsColor.system.error // #ca241a (--dsd-color-background-button-error)
  },
  feedback: {
    success: desjardinsColor.system.success, // #055b37
    warning: desjardinsColor.system.warning, // #ad8405
    error: desjardinsColor.system.error, // #ca241a
    info: desjardinsColor.system.info // #5791bd
  },
  status: {
    pending: desjardinsColor.system.warning, // #ad8405
    processing: desjardinsColor.system.info, // #5791bd
    completed: desjardinsColor.system.success, // #055b37
    failed: desjardinsColor.system.error // #ca241a
  },
  // Categorical data-vis palette. Desjardins publishes a rich set of DECORATIVE
  // colour ramps (brand-green, aqua, lime, petroleum, slate, turquoise, graphite);
  // the eight categories below are seeded from the deepest (most legible) step of
  // each measured `--dsd-color-…-decorative-*` family, led by the brand green.
  // See MAPPING.md, "à confirmer" — this is an assembled scale, not one published
  // categorical token list.
  data: {
    category1: desjardinsColor.green[400], // #00874e brand green
    category2: "#00727e", // aqua-500 (--dsd-color-border-decorative-aqua-500)
    category3: "#407520", // lime-500 (--dsd-color-font-decorative-lime-500)
    category4: "#1e4d5d", // petroleum-500 (--dsd-color-font-decorative-petroleum-500)
    category5: "#236f65", // turquoise-500 (--dsd-color-font-decorative-turquoise-500)
    category6: "#414a55", // slate-500 (--dsd-color-font-decorative-slate-500)
    category7: "#055b37", // brand-green-500 (--dsd-color-background-decorative-brand-500)
    category8: "#6c6c6c" // graphite-400 (--dsd-color-…-decorative-graphite-400)
  }
} as const;

/**
 * The DESJARDINS theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Desjardins-specific (green-on-white
 * cooperative-bank) values, and the `component` layer is REBUILT from this
 * theme's own semantic/foundation via `createComponent` — so Desjardins's green
 * CTA, soft-black ink, boxed fields and accessible blue focus reach the
 * components (buttons, tabs, pagination, chat bubbles…), not just the elements
 * that read semantic vars directly.
 */
export const desjardinsTheme: TenantTheme = {
  id: "desjardins",
  label: "Desjardins",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default desjardinsTheme;
