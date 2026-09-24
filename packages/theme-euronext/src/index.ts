import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Euronext brand theme for the Sentropic token structure.
 *
 * Euronext publishes no tokenised design system, but www.euronext.com and
 * live.euronext.com serve themed stylesheets (live served with
 * `theme=euronext_live`) whose brand-owned utility classes name the palette
 * explicitly (`.btn-brand-teal-green`, `.bg-brand-*`, `.btn-ui-*`,
 * `.text-*`, `.badge--*`). The two hosts DISAGREE on the colour of action:
 * `.bg-primary`, `.text-primary`, `.btn-primary` and `.badge--primary` are
 * `#008d7f` on live but `#00685e` on corporate, and `a{color:}` is
 * `#007aff` on live but `#00685e` on corporate (see MAPPING.md for the
 * per-host counts and the tie-break). This package is a MEASURED-CLONE
 * mapping: the teal-green action colour (#008d7f, union winner), the
 * hunter/kelly greens, the primary-dark ink (#252631), the ui-blue link
 * (#007aff, live) and the ui-grey ramp are read from those brand-owned
 * rules, and we reference the brand font *name* (Inter, the `body`
 * typeface) only — never font binaries. Sources and exact provenance are
 * documented in MAPPING.md. Where the brand publishes no usable value
 * (overlay backdrop, readable text steps of vivid hues), the closest
 * derived value is used and the choice is noted "à confirmer" in
 * MAPPING.md. Control geometry IS published by the brand (see `density`
 * below) but this package keeps the reference theme package's geometry
 * for component-grid fidelity.
 *
 * Euronext colour reference (light theme):
 *   White (surface default)            #ffffff   (surface default)
 *   Lightest grey (ui-grey-5)          #f8fafb   (raised tint — brand)
 *   Page background (ui-grey-4)        #f2f4f6   (body background — brand)
 *   Hairline (grey-3)                #e8ecef   (.border on live, search underline — brand)
 *   Field stroke (ui-grey-6)         #c8d1da   (.form-control border — brand)
 *   Mid grey (ui-grey-2)               #98a9bc   (brand)
 *   Grey text (ui-grey-1)              #778ca2   (.timestamp — brand)
 *   Dark grey (ui-grey-0)              #3b4b5d   (brand)
 *   Ink / primary-dark                 #252631   (body color — brand)
 *   Near-black input text              #1b1e24   (.form-control:focus color — brand)
 *   Teal green (brand action)          #008d7f   (.btn-brand-teal-green — brand)
 *   Teal hover                         #00675d   (.btn-brand-teal-green:hover — brand)
 *   Teal hover border                  #005a51   (.btn-brand-teal-green:hover — brand)
 *   Hunter green                       #00685e   (.btn-brand-hunter-green — brand)
 *   Kelly green (success)              #009639   (.btn-brand-kelly-green — brand)
 *   Sky blue                           #41b6e6   (.btn-brand-sky-blue — brand)
 *   Spring green                       #79d100   (.btn-brand-spring-green — brand)
 *   Link / ui blue                     #007aff   (a, .btn-ui-blue — brand)
 *   Light green tint                   #ebf6f5   (.btn-ui-light-green — brand)
 *   Light blue tint                    #f1fafe   (.btn-ui-foam-blue — brand)
 *   Badge info tint                    #eafcfe   (.badge--info — brand)
 *   Muted grey                         #676767   (.text-muted — brand)
 *   Warning amber                      #ffab2b   (.bg-warning — brand)
 *   Error red                          #fe4d6a   (.bg-danger — brand)
 *   Info cyan                          #2ce5f6   (.bg-info — brand)
 *   Readable link blue                 #006ee6   (derived 1-step darkening — à confirmer)
 *   Readable secondary grey            #5d7289   (derived 2-step darkening — à confirmer)
 *   Readable success green             #007c2f   (derived 1-step darkening — à confirmer)
 *   Readable warning amber             #aa6700   (derived 5-step darkening — à confirmer)
 *   Readable error red                 #e40126   (derived 4-step darkening — à confirmer)
 *   Readable info cyan                 #067983   (derived 6-step darkening — à confirmer)
 */

// --- Euronext raw colour palette --------------------------------------------
const euronextColor = {
  // Brand greens. Teal green is the colour of action (`.btn-primary`,
  // `.bg-primary`, `.text-primary`); hunter/kelly are sibling brand greens.
  brand: {
    teal: "#008d7f", // .btn-brand-teal-green{background-color:#008d7f} (action / brand)
    tealHover: "#00675d", // .btn-brand-teal-green:hover{background-color:#00675d}
    tealHoverBorder: "#005a51", // .btn-brand-teal-green:hover{border-color:#005a51}
    hunter: "#00685e", // .btn-brand-hunter-green{background-color:#00685e} — also the corporate host action colour (.bg-primary/.text-primary/.btn-primary/a on www)
    kelly: "#009639", // .btn-brand-kelly-green{background-color:#009639}
    sky: "#41b6e6", // .btn-brand-sky-blue{background-color:#41b6e6}
    spring: "#79d100", // .btn-brand-spring-green{background-color:#79d100}
    primaryDark: "#252631" // body{color:#252631} / .btn-brand-primary-dark
  },
  // Link / ui blue family. Live host: `a{color:#007aff}` and
  // `.btn-ui-blue{background-color:#007aff}`; corporate host serves
  // `a{color:#00685e}` instead (see MAPPING.md host disagreement).
  blue: {
    ui: "#007aff", // live a{color:#007aff} / .btn-ui-blue{background-color:#007aff}
    link: "#006ee6", // derived readable link blue, 1 stop-rule step (à confirmer)
    foam: "#f1fafe" // .btn-ui-foam-blue{background-color:#f1fafe}
  },
  // Neutral ui-grey ramp (`.btn-ui-grey-*`) plus body/input ink.
  slate: {
    0: "#ffffff", // white / surface default
    50: "#f8fafb", // .btn-ui-grey-5{background-color:#f8fafb} (both hosts)
    100: "#f2f4f6", // live body{background-color:#f2f4f6} / .btn-ui-grey-4 (both hosts; www body is #fff)
    200: "#e8ecef", // live .border{border:1px solid #e8ecef} / .btn-ui-grey-3 (both hosts; www .border is Bootstrap default #dee2e6)
    300: "#98a9bc", // .btn-ui-grey-2{background-color:#98a9bc}
    400: "#778ca2", // .timestamp{color:#778ca2} / .btn-ui-grey-1
    500: "#3b4b5d", // .btn-ui-grey-0{background-color:#3b4b5d}
    600: "#c8d1da", // .form-control{border:1px solid #c8d1da} / .btn-ui-grey-6 (brand override of Bootstrap #ced4da)
    800: "#252631", // body{color:#252631} (primary text / dark inverse surface)
    900: "#1b1e24" // .form-control:focus{color:#1b1e24} (general form control, least-scoped rule)
  },
  // Light tints published as named ui/badge backgrounds.
  tint: {
    green: "#ebf6f5", // .btn-ui-light-green{background-color:#ebf6f5}
    info: "#eafcfe" // .badge--info{background-color:#eafcfe}
  },
  // System / status colours: brand-published vivid hues plus their readable
  // text steps (stop-rule darkenings, à confirmer).
  system: {
    success: "#009639", // .text-success{color:#009639} / .bg-success (brand fill)
    successText: "#007c2f", // derived readable success text, 1 step (à confirmer)
    warning: "#ffab2b", // .bg-warning{background-color:#ffab2b} (brand fill)
    warningText: "#aa6700", // derived readable warning text, 5 steps (à confirmer)
    error: "#fe4d6a", // .bg-danger{background-color:#fe4d6a} (brand fill)
    errorText: "#e40126", // derived readable error text, 4 steps (à confirmer)
    info: "#2ce5f6", // .bg-info{background-color:#2ce5f6} (brand fill)
    infoText: "#067983", // derived readable info text, 6 steps (à confirmer)
    muted: "#676767" // .text-muted{color:#676767}
  }
} as const;

// --- foundation (Euronext-specific values) ----------------------------------
const foundation = {
  color: {
    // Euronext has no dominant brand BLUE in the Sentropic sense; the
    // Sentropic "blue" role family carries the link/ui blue.
    blue: {
      10: euronextColor.tint.green, // #ebf6f5 lightest tint (.btn-ui-light-green)
      60: euronextColor.blue.ui, // #007aff ui blue (a, .btn-ui-blue)
      80: euronextColor.blue.link // #006ee6 readable link blue (à confirmer)
    },
    // The Sentropic "cyan" accent slot carries the brand sky/info family.
    cyan: {
      10: euronextColor.tint.info, // #eafcfe badge info tint (.badge--info)
      50: euronextColor.brand.sky, // #41b6e6 sky blue (.btn-brand-sky-blue)
      70: euronextColor.system.infoText // #067983 readable info text (à confirmer)
    },
    // Sentropic "slate" role family mapped onto the ui-grey ramp.
    slate: {
      0: euronextColor.slate[0], // white
      10: euronextColor.slate[100], // page background
      20: euronextColor.slate[200], // hairlines / field stroke
      60: euronextColor.slate[400], // grey text (.timestamp)
      80: euronextColor.slate[800], // primary text (body color)
      90: euronextColor.slate[900] // near-black input text
    },
    feedback: {
      success: euronextColor.system.successText, // #007c2f readable (à confirmer)
      warning: euronextColor.system.warningText, // #aa6700 readable (à confirmer)
      error: euronextColor.system.errorText, // #e40126 readable (à confirmer)
      info: euronextColor.system.infoText // #067984 readable (à confirmer)
    }
  },
  // Euronext's typeface is Inter: `body{font-family:Inter-regular,...}` with
  // Inter-medium/bold/light weights across 100+ declarations. mono is the
  // system stack declared by the brand stylesheet. We reference the font
  // *names* only, not binaries.
  font: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    display: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; the brand publishes no spacing tokens).
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
  // Euronext controls carry a 4px radius (`.btn-input,.form-control{
  // border-radius:4px}` — brand rule; `.btn{border-radius:.25rem}` alone is
  // the intact Bootstrap 4 default and is not cited as brand proof); no card
  // radius is published, so `lg` stays aligned with the reference theme
  // package's geometry (à confirmer).
  radius: {
    none: "0",
    sm: "0.25rem", // 4px — buttons / inputs (measured)
    md: "0.25rem", // 4px — button / input / tabs (measured)
    lg: "0.5rem", // 8px — cards (à confirmer)
    pill: "999px" // tags / pills
  },
  // Elevation tinted with the brand ink. Exact specs "à confirmer" (aligned
  // with the reference theme package's geometry).
  shadow: {
    subtle: "0 1px 2px rgb(37 38 49 / 0.10)", // (à confirmer)
    medium: "0 4px 12px rgb(37 38 49 / 0.14)", // (à confirmer)
    floating: "0 8px 24px rgb(37 38 49 / 0.18)" // (à confirmer)
  },
  // Motion durations are not tokenised publicly; kept aligned with the
  // reference theme package's geometry ("à confirmer").
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
  // --- Anatomy primitives (Euronext) ----------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // live .border{border:1px solid #e8ecef} / search underline 1px
    thick: "2px" // .table tbody+tbody{border-top:2px solid #e8ecef}; brand 2px also in .btn{border:2px solid transparent} (Bootstrap override of 1px)
  },
  borderStyle: { solid: "solid" },
  // Control density. The brand DOES publish control geometry:
  // `.btn-input,.form-control{height:52px}`,
  // `.form-control{padding:.375rem .75rem}`,
  // `.form-control-lg{height:calc(2.875rem + 2px);padding:.5rem 1rem}`,
  // `.form-control-sm{height:calc(1.8125rem + 2px);padding:.25rem .5rem}`,
  // `.custom-file-label{height:52px;padding:.75rem 1rem}`,
  // `.btn-lg{padding-top:10.5px;padding-bottom:10.5px}`,
  // `.modal-filters-inner .btn-primary{min-width:125px}`,
  // `.btn-cta{padding:14.5px 56px 14.5px 26px}` (measured 52px ≈ 3.25rem
  // at a 16px root). This block deliberately keeps the reference theme
  // package's geometry for component-grid fidelity ("à confirmer"); only
  // controlHeight/iconSize match the Sentropic base.
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.5rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" }, // (à confirmer)
    md: { controlHeight: "2.5rem", paddingBlock: "0.375rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" }, // (à confirmer)
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" } // (à confirmer)
  },
  // Euronext typography: Inter for interactive/fields/labels and display.
  // Button labels use a medium weight (500), no transform.
  typography: {
    control: { family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", size: "1rem", weight: "500", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Brand links are the readable ui blue #006ee6 (the published #007aff
    // fails AA as text), not underlined at rest (`a{text-decoration:none}`),
    // underlined on hover (`a:hover{text-decoration:underline}`).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // disabled controls dim to 0.5 (à confirmer)
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "ease-in-out" }, // (à confirmer)
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // FOCUS = a teal RING drawn as a box-shadow (live host):
  // `.form-control:focus{border-color:#0effe7;box-shadow:0 0 0 .2rem
  // rgba(0,141,127,.25)}` (rgba(0,141,127) = #008d7f) and
  // `.btn-primary:focus{box-shadow:0 0 0 .2rem rgba(0,141,127,.5)}`.
  // Corporate (www) serves `border-color:#00e8d1` with
  // `rgba(0,104,94,.25)` instead. The `focus.color` primitive carries no
  // alpha, so the opaque teal below is the closest encodable value — the
  // rendered ring will read stronger than the brand's translucent ring.
  focus: {
    strategy: "ring",
    width: "0.2rem",
    offset: "0",
    color: euronextColor.brand.teal, // #008d7f teal focus ring (opaque encoding of the measured rgba ring)
    inset: "0"
  },
  // Form fields are BOXED (outline): the general brand control is a white
  // box with four equal borders
  // (`.form-control{background-color:#fff;border:1px solid #c8d1da}` with
  // `.btn-input,.form-control{border-radius:4px;height:52px}`, confirmed by
  // `.form-control.is-invalid{border-color:#fe4d6a}` /
  // `.is-valid{border-color:#009639}`). `#c8d1da` is a brand override
  // (Bootstrap ships `#ced4da`). `.search input{border:none;border-bottom:
  // 1px solid #e8ecef}` is a search-widget exception (like
  // `.header__form .form-control{border:none;height:22px}`), not the general
  // field anatomy. `style: "outline"` makes the builder draw four equal
  // borders.
  field: {
    style: "outline",
    fillBg: euronextColor.slate[0], // #ffffff
    underlineColor: euronextColor.slate[600], // #c8d1da measured field stroke (kept for provenance; unused by the outline builder)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the brand teal with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23008d7f' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem" // 40px gutter (à confirmer)
  },
  // Cards: a subtle 1px hairline border + radius, light hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: euronextColor.slate[100] // #f2f4f6
  },
  // Secondary button = OUTLINED in the brand teal: transparent fill, teal
  // border + text, light green fill on hover
  // (`.btn-outline-ui-*` pattern; fill `.btn-ui-light-green`).
  buttonSecondary: {
    background: "transparent",
    border: euronextColor.brand.teal, // #008d7f stroke
    hoverBackground: euronextColor.tint.green // #ebf6f5 light fill on hover
  },
  // Tabs / top-nav: active tab = ink label with a bottom teal underline
  // (the indicator colour derives from `action.primary`).
  tabs: {
    activeText: euronextColor.brand.primaryDark, // #252631 ink label
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
  // Pagination: borderless ink text links; active page = filled brand teal
  // with white text (the brand button pattern:
  // `.btn-brand-teal-green{color:#fff}`).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: euronextColor.brand.primaryDark, // #252631 link text
    activeBackground: euronextColor.brand.teal, // #008d7f filled active page
    activeText: "#ffffff", // white text on the brand teal (brand pattern)
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb: readable-blue links, ink current page, grey separators.
  breadcrumb: {
    linkText: euronextColor.blue.link, // #006ee6 (à confirmer)
    text: euronextColor.slate[400], // #778ca2 trail text
    currentText: euronextColor.slate[800], // #252631 current page
    separator: euronextColor.slate[400], // #778ca2
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
  // Accordion / details: an ink bold summary trigger.
  accordion: {
    text: euronextColor.slate[800], // #252631 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "700",
    lineHeight: "1.5rem" // 24px
  },
  // Tag: a small 4px-radius grey chip.
  tag: {
    radius: "4px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: euronextColor.slate[100], // #f2f4f6
    neutralText: euronextColor.slate[800] // #252631
  },
  // Badge: a 4px-radius filled badge in the brand teal with white text
  // (`.badge--primary{background-color:#008d7f;color:#fff}`).
  badge: {
    radius: "4px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: euronextColor.brand.teal, // #008d7f
    infoText: "#ffffff" // white on the brand teal (brand pattern)
  },
  // Checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: euronextColor.slate[800] // #252631
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
    textColor: euronextColor.slate[800] // #252631
  }
} as const;

// --- semantic (Euronext-specific role mapping) -------------------------------
const semantic = {
  surface: {
    default: euronextColor.slate[0], // white
    subtle: euronextColor.slate[100], // #f2f4f6 body background
    raised: euronextColor.slate[0], // white
    inverse: euronextColor.slate[800], // #252631 primary-dark inverse surface
    overlay: "rgb(37 38 49 / 0.6)" // modal backdrop, brand-ink tint (à confirmer)
  },
  text: {
    primary: euronextColor.slate[800], // #252631 (body color)
    // The published grey text #778ca2 (3.47:1) and link blue #007aff (4.02:1)
    // fail AA as text: both roles use their first passing stop-rule step.
    // `secondary` is 4.96:1 on surface.default #ffffff but 4.50:1 on
    // surface.subtle #f2f4f6 (the live body background); section 9 anchors
    // on surface.default, so the role is conforming.
    secondary: "#5d7289", // derived from #778ca2, 2 steps, 4.96:1 (à confirmer)
    muted: euronextColor.system.muted, // #676767 (.text-muted, 5.66:1)
    inverse: euronextColor.slate[0], // white on dark / coloured surfaces
    link: euronextColor.blue.link // #006ee6, from live #007aff, 1 step, 4.80:1 (à confirmer)
  },
  border: {
    subtle: euronextColor.slate[200], // #e8ecef (.border)
    strong: euronextColor.slate[400], // #778ca2 (ui-grey-1)
    interactive: euronextColor.brand.teal // #008d7f brand teal (4.10:1, line role)
  },
  action: {
    primary: euronextColor.brand.teal, // #008d7f brand teal primary (union winner; corporate action is #00685e)
    primaryHover: euronextColor.brand.tealHover, // #00675d measured hover
    primaryText: "#ffffff", // measured brand pairing .btn-brand-teal-green{color:#fff} (4.10:1, kept unaltered per the brand-fill rule)
    secondary: euronextColor.slate[100], // #f2f4f6 secondary surface
    secondaryHover: euronextColor.slate[200], // #e8ecef
    secondaryText: euronextColor.brand.primaryDark, // #252631
    danger: euronextColor.system.error // #fe4d6a brand error red fill (white text 3.24:1; black text 6.48:1 — brand fill kept unaltered)
  },
  feedback: {
    success: euronextColor.system.successText, // #007c2f readable (à confirmer)
    warning: euronextColor.system.warningText, // #aa6700 readable (à confirmer)
    error: euronextColor.system.errorText, // #e40126 readable (à confirmer)
    info: euronextColor.system.infoText // #067984 readable (à confirmer)
  },
  status: {
    pending: euronextColor.system.warningText, // #aa6700 (à confirmer)
    processing: euronextColor.system.infoText, // #067984 (à confirmer)
    completed: euronextColor.system.successText, // #007c2f (à confirmer)
    failed: euronextColor.system.errorText // #e40126 (à confirmer)
  },
  // Categorical data-vis palette built from the brand hues. Euronext
  // publishes no 8-colour sequential scale, so this is a coherent proposal
  // drawn from the brand palette (see MAPPING.md, "à confirmer").
  data: {
    category1: euronextColor.brand.teal, // #008d7f brand teal
    category2: euronextColor.brand.primaryDark, // #252631 primary-dark
    category3: euronextColor.blue.ui, // #007aff ui blue
    category4: euronextColor.system.warning, // #ffab2b amber
    category5: euronextColor.system.error, // #fe4d6a red
    category6: euronextColor.brand.kelly, // #009639 kelly green
    category7: euronextColor.slate[400], // #778ca2 grey
    category8: euronextColor.brand.sky // #41b6e6 sky blue
  }
} as const;

/**
 * The Euronext theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Euronext-specific values, and
 * the `component` layer is REBUILT from this theme's own semantic/foundation
 * via `createComponent` — so the brand teal reaches the components
 * (buttons, tabs, pagination, chat bubbles…), not just the elements that
 * read semantic vars directly.
 */
export const euronextTheme: TenantTheme = {
  id: "euronext",
  label: "Euronext",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default euronextTheme;
