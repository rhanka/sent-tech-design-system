import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * ArcelorMittal brand theme for the Sentropic token structure.
 *
 * ArcelorMittal publishes no tokenised public design system; the values below
 * are MEASURED from the brand's official corporate stylesheet
 * (`corporate.arcelormittal.com/assets/css/main.css`, read via the archived
 * copy dated 2025-01-01 because the live hosts answer Cloudflare challenges).
 * The signature is the brand orange `#ff3700` (101 declarations: buttons,
 * nav anchors, logo fill, bullets, text selection). The brand typeface is
 * Gilroy (`Gilroy Standard` body, `Gilroy Standard-SemiBold` headings and
 * interactive labels) — we reference the font *names* only, never binaries.
 * Sources and exact provenance are documented in MAPPING.md. Where the
 * stylesheet publishes no direct equivalent for a Sentropic role (feedback
 * hues beyond info blue, the light orange tint, geometry), the closest
 * derived value is used and the choice is noted "à confirmer" in MAPPING.md.
 *
 * ArcelorMittal colour reference (light theme):
 *   White (surface default)            #ffffff   (surface default)
 *   Disabled-input fill                #e6eaef   (surface subtle / secondary)
 *   Card / key-figure border grey      #979797   (subtle border)
 *   Dark navy list-rule                #001626   (strong border)
 *   Logo wordmark grey                 #4c4c4c   (secondary text)
 *   Body text                          #2a2a2a   (primary text)
 *   Header / nav near-black            #151515   (inverse surface / darkest)
 *   Brand orange                       #ff3700   (action / interactive / focus)
 *   Pressed darker orange              #d92f00   (hover / legible orange labels)
 *   Gradient light orange              #fe6b45   (accent)
 *   Gradient purple                    #840d81   (accent / data)
 *   Dialog slate-blue                  #5c7f92   (map / modal surface)
 *   Section blue                       #0070c0   (info)
 *   Muted grey                         #646464   (derived via the stop rule — à confirmer)
 *   Success green                      #2f9e44   (derived — à confirmer)
 *   Warning amber                      #e8890c   (derived — à confirmer)
 *   Error red                          #d13438   (derived — à confirmer)
 */

// --- ArcelorMittal raw colour palette ---------------------------------------
const arcelorMittalColor = {
  // Brand orange family. `#ff3700` is the signature (101 declarations in
  // main.css: solid buttons with white text, `.primary-link--dark` border,
  // `.logo__logo` fill, nav-back anchors, card anchors, active mega-panel
  // anchors, list bullets, `::selection` tint `rgba(255,55,0,.4)`).
  // `#d92f00` is the measured pressed state (`.primary-link--dark:active`,
  // `.olympics__language-modal-button:active`); it also clears AA as text
  // (4.82:1 on white) so it carries the legible orange label roles.
  orange: {
    primary: "#ff3700", // brand orange (101 declarations in main.css)
    hover: "#d92f00", // pressed-state orange (active rules in main.css)
    light: "#fe6b45", // gradient end (`linear-gradient(90deg,#840d81,#fe6b45)`)
    tint: "#ffede6" // derived light orange tint (à confirmer)
  },
  // Decorative gradient purple, measured in the primary-link underline
  // gradient (`from(#840d81),to(#fe6b45)`, 6 declarations).
  purple: {
    accent: "#840d81" // gradient start in main.css
  },
  // Section blue, measured in brand section backgrounds (`.page-header`,
  // `.featured-insights`, `.banner__call-to-action`, `.locations-header`)
  // and the pull-quote left rule (`border-left:4px solid #0070c0`).
  blue: {
    info: "#0070c0" // section / quote blue (8 declarations in main.css)
  },
  // Dialog slate-blue, measured in the map/modal dialog backgrounds
  // (`.content__modal .dialog`, `.modal-dialog--mapbox .dialog`).
  slateBlue: {
    dialog: "#5c7f92" // dialog background (4 declarations in main.css)
  },
  // Neutral scale, measured in main.css brand rules.
  slate: {
    0: "#ffffff", // white / body background (159 declarations)
    50: "#e6eaef", // disabled calculator-input fill (4 declarations)
    200: "#979797", // key-figure / calendar card borders (16 declarations)
    300: "#001626", // press-release list rules (6 declarations)
    500: "#4c4c4c", // logo wordmark fill + tag text (3 declarations)
    600: "#646464", // derived muted grey via the stop rule (à confirmer)
    800: "#2a2a2a", // body text color (25 declarations)
    900: "#151515" // header / nav near-black text (15 declarations)
  },
  // Black, measured in form strokes (multiselect `border-bottom:2px solid
  // #000`, calculator `border:1px solid #000`) and input text.
  black: "#000000",
  // System / status colours. Only info blue is measured; the rest is derived
  // (Swiper/Bootstrap palette remnants in the bundle are excluded — à confirmer).
  system: {
    success: "#2f9e44", // derived success green
    warning: "#e8890c", // derived warning amber
    error: "#d13438", // derived error red
    info: "#0070c0" // measured section blue
  }
} as const;

// --- foundation (ArcelorMittal-specific values) ------------------------------
const foundation = {
  color: {
    // ArcelorMittal has no dominant brand BLUE; the Sentropic "blue" role
    // family (primary action / link / interactive) carries the brand orange —
    // the brand's colour of action.
    blue: {
      10: arcelorMittalColor.orange.tint, // #ffede6 derived light tint (à confirmer)
      60: arcelorMittalColor.orange.primary, // #ff3700 brand orange
      80: arcelorMittalColor.orange.hover // #d92f00 pressed orange
    },
    // The Sentropic "cyan" accent slot carries the brand's gradient accent
    // (light orange `#fe6b45`) between a derived tint and the pressed orange.
    cyan: {
      10: arcelorMittalColor.orange.tint, // derived light tint (à confirmer)
      50: arcelorMittalColor.orange.light, // #fe6b45 gradient end
      70: arcelorMittalColor.orange.hover // #d92f00 pressed orange
    },
    // Sentropic "slate" role family mapped onto the measured neutral scale.
    slate: {
      0: arcelorMittalColor.slate[0], // white
      10: arcelorMittalColor.slate[50], // disabled-input fill
      20: arcelorMittalColor.slate[200], // card borders
      60: arcelorMittalColor.slate[500], // logo wordmark grey
      80: arcelorMittalColor.slate[800], // body text
      90: arcelorMittalColor.slate[900] // header near-black
    },
    feedback: {
      success: arcelorMittalColor.system.success,
      warning: arcelorMittalColor.system.warning,
      error: arcelorMittalColor.system.error,
      info: arcelorMittalColor.system.info
    }
  },
  // ArcelorMittal's brand typeface is Gilroy: `Gilroy Standard` for body and
  // `Gilroy Standard-SemiBold` for headings and interactive labels (37+
  // declarations in main.css). mono is the system stack. We reference the
  // font *names* only, not binaries.
  font: {
    sans: "'Gilroy Standard', Arial, Helvetica, sans-serif",
    display: "'Gilroy Standard-SemiBold', Arial, Helvetica, sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; the brand stylesheet is not spacing-tokenised).
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
  // ArcelorMittal aesthetic is sharp: brand form inputs are square
  // (`.calculator-tool .form-group input,select{border-radius:0}`), so
  // controls carry no radius; cards keep a slightly larger derived radius
  // (à confirmer).
  radius: {
    none: "0",
    sm: "0", // square brand inputs (border-radius:0 in main.css)
    md: "0", // square buttons / tabs
    lg: "0.5rem", // 8px — cards (à confirmer)
    pill: "999px" // dots / pills
  },
  // Light, neutral elevation tinted with the brand near-black. Exact specs
  // "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(21 21 21 / 0.10)",
    medium: "0 4px 12px rgb(21 21 21 / 0.14)",
    floating: "0 8px 24px rgb(21 21 21 / 0.18)"
  },
  // Motion durations are not tokenised by the brand stylesheet publicly; kept
  // aligned with the Sentropic base ("à confirmer").
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
  // --- Anatomy primitives (ArcelorMittal) -----------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // calculator input border 1px
    thick: "2px" // multiselect bottom stroke 2px
  },
  borderStyle: { solid: "solid" },
  // Control density. The brand publishes no site-wide control geometry (the
  // calculator widget's 60px inputs are widget-specific), so the Sentropic
  // base values are reused explicitly ("à confirmer").
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.5rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.375rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" }
  },
  // ArcelorMittal typography: Gilroy Standard for interactive/fields, Gilroy
  // Standard-SemiBold for display and labels. Buttons render uppercase in the
  // brand (solid orange buttons carry `text-transform:uppercase`).
  typography: {
    control: { family: "'Gilroy Standard-SemiBold', Arial, Helvetica, sans-serif", size: "1rem", weight: "600", lineHeight: "1.5", letterSpacing: "0", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Gilroy Standard', Arial, Helvetica, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Gilroy Standard-SemiBold', Arial, Helvetica, sans-serif", size: "1rem", weight: "600", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Brand links are the pressed orange #d92f00 (AA-legible), underlined at
    // rest (the brand `a` draws a 2px gradient underline) and on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "2px", decorationOffset: "2px",
      textDecorationHover: "underline", decorationThicknessHover: "2px", decorationOffsetHover: "2px"
    }
  },
  disabledOpacity: "0.5", // disabled controls dim to 0.5 (à confirmer)
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // FOCUS = a high-contrast OUTLINE in the brand orange. No focus technique is
  // published in main.css (only `outline:none` resets), so the technique is
  // derived (à confirmer); the colour clears the 3:1 line threshold (3.62:1).
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: arcelorMittalColor.orange.primary, // #ff3700 brand orange (à confirmer)
    inset: "0"
  },
  // Form fields are UNDERLINED (filled-underline): the site-wide signature is
  // the bottom stroke — header search inputs (`border:0;border-bottom:1px
  // solid #fff`) and module dropdowns (`.multiselect{border-bottom:2px solid
  // #000}`) — drawn as a `border-bottom`, hence `underlineMode: "border"`.
  // `style: "filled-underline"` with a white fill. The calculator widget's
  // boxed inputs are recorded in MAPPING.md.
  field: {
    style: "filled-underline",
    fillBg: arcelorMittalColor.slate[0], // #ffffff
    underlineColor: arcelorMittalColor.black, // #000000 measured bottom stroke
    underlineWidth: "2px",
    underlineMode: "border",
    // Native <select>: redraw the chevron in the brand orange with a 40px
    // right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23ff3700' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: a 1px grey border (`.key-figure{border:1px solid #979797}`) with a
  // light hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: arcelorMittalColor.slate[50] // #e6eaef
  },
  // Secondary button = OUTLINED in the brand orange
  // (`.primary-link--dark{border-color:#ff3700;color:#2a2a2a}`): transparent
  // fill, orange border + dark text, light orange fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: arcelorMittalColor.orange.primary, // #ff3700 stroke
    hoverBackground: arcelorMittalColor.orange.tint // #ffede6 light fill on hover (à confirmer)
  },
  // Tabs / top-nav: active tab = legible pressed-orange label with a bottom
  // orange underline (mega-panel active anchors are orange; nav indicators
  // draw a 2px orange rule).
  tabs: {
    activeText: arcelorMittalColor.orange.hover, // #d92f00 legible orange label
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
  // Pagination: pressed-orange text links; active page = filled brand orange
  // with white text (the brand's own solid-button pairing).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: arcelorMittalColor.orange.hover, // #d92f00 link text
    activeBackground: arcelorMittalColor.orange.primary, // #ff3700 filled active page
    activeText: "#ffffff", // white on the brand orange (brand pairing)
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb: pressed-orange links, dark current page, grey separators.
  breadcrumb: {
    linkText: arcelorMittalColor.orange.hover, // #d92f00
    text: arcelorMittalColor.slate[500], // #4c4c4c trail text
    currentText: arcelorMittalColor.slate[800], // #2a2a2a current page
    separator: arcelorMittalColor.slate[200], // #979797
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem", // 24px
    currentWeight: "600"
  },
  // Alert / notice: a coloured LEFT accent filet on a transparent box (the
  // brand draws 4px left rules, e.g. the pull-quote `border-left:4px solid`).
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
  // Accordion / details: a dark semibold summary trigger.
  accordion: {
    text: arcelorMittalColor.slate[800], // #2a2a2a summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "600",
    lineHeight: "1.5rem" // 24px
  },
  // Tag: a sharp 14px Gilroy label in the logo wordmark grey
  // (`.tags-list-item__tag{color:#4c4c4c;...font-size:14px}`).
  tag: {
    radius: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: arcelorMittalColor.slate[50], // #e6eaef
    neutralText: arcelorMittalColor.slate[800] // #2a2a2a
  },
  // Badge: a sharp filled badge in the brand orange with white text (the
  // brand's solid-button pairing).
  badge: {
    radius: "0",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "600",
    lineHeight: "1.5rem", // 24px
    textTransform: "uppercase",
    minHeight: "1.5rem", // 24px
    infoBackground: arcelorMittalColor.orange.primary, // #ff3700
    infoText: "#ffffff" // white on the brand orange (brand pairing)
  },
  // Checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: arcelorMittalColor.slate[800] // #2a2a2a
  },
  // Search input (`.search-bar__input`: 16px Gilroy).
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
    textColor: arcelorMittalColor.slate[800] // #2a2a2a
  }
} as const;

// --- semantic (ArcelorMittal-specific role mapping) --------------------------
const semantic = {
  surface: {
    default: arcelorMittalColor.slate[0], // white
    subtle: arcelorMittalColor.slate[50], // #e6eaef disabled-input fill
    raised: arcelorMittalColor.slate[0], // white
    inverse: arcelorMittalColor.slate[900], // #151515 header near-black
    overlay: "rgb(21 21 21 / 0.6)" // modal backdrop (brand near-black tint)
  },
  text: {
    primary: arcelorMittalColor.slate[800], // #2a2a2a (body color)
    secondary: arcelorMittalColor.slate[500], // #4c4c4c (logo wordmark, 8.59:1)
    muted: arcelorMittalColor.slate[600], // #646464 derived via the stop rule (à confirmer)
    inverse: arcelorMittalColor.slate[0], // white on dark / coloured surfaces
    link: arcelorMittalColor.orange.hover // #d92f00 legible orange link (4.82:1)
  },
  border: {
    subtle: arcelorMittalColor.slate[200], // #979797 (card borders)
    strong: arcelorMittalColor.slate[300], // #001626 (press-release rules)
    interactive: arcelorMittalColor.orange.primary // #ff3700 brand orange (3.62:1 line)
  },
  action: {
    primary: arcelorMittalColor.orange.primary, // #ff3700 brand orange
    primaryHover: arcelorMittalColor.orange.hover, // #d92f00 pressed orange
    primaryText: "#ffffff", // white on the brand orange — the brand's own solid-button pairing in main.css
    secondary: arcelorMittalColor.slate[50], // #e6eaef fill
    secondaryHover: "#d7dde4", // derived darker fill (à confirmer)
    secondaryText: arcelorMittalColor.slate[800], // #2a2a2a
    danger: arcelorMittalColor.system.error // #d13438 derived error red (à confirmer)
  },
  feedback: {
    success: arcelorMittalColor.system.success,
    warning: arcelorMittalColor.system.warning,
    error: arcelorMittalColor.system.error,
    info: arcelorMittalColor.system.info
  },
  status: {
    pending: arcelorMittalColor.system.warning,
    processing: arcelorMittalColor.system.info,
    completed: arcelorMittalColor.system.success,
    failed: arcelorMittalColor.system.error
  },
  // Categorical data-vis palette built from the measured brand hues (orange,
  // pressed orange, section blue, gradient purple, gradient light orange,
  // dialog slate-blue, near-black, body grey). The brand publishes no
  // 8-colour sequential scale, so this is a coherent proposal (à confirmer).
  data: {
    category1: arcelorMittalColor.orange.primary, // #ff3700 brand orange
    category2: arcelorMittalColor.blue.info, // #0070c0 section blue
    category3: arcelorMittalColor.purple.accent, // #840d81 gradient purple
    category4: arcelorMittalColor.orange.hover, // #d92f00 pressed orange
    category5: arcelorMittalColor.orange.light, // #fe6b45 light orange
    category6: arcelorMittalColor.slateBlue.dialog, // #5c7f92 dialog slate-blue
    category7: arcelorMittalColor.slate[900], // #151515 near-black
    category8: arcelorMittalColor.slate[500] // #4c4c4c wordmark grey
  }
} as const;

/**
 * The ArcelorMittal theme as a Sentropic `TenantTheme`. The `tokens` tree
 * is complete: `foundation` and `semantic` carry ArcelorMittal-specific
 * values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so the brand orange reaches
 * the components (buttons, tabs, pagination, chat bubbles…), not just the
 * elements that read semantic vars directly.
 */
export const arcelorMittalTheme: TenantTheme = {
  id: "arcelormittal",
  label: "ArcelorMittal",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default arcelorMittalTheme;
