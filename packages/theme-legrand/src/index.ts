import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Legrand brand theme for the Sentropic token structure.
 *
 * Legrand publishes no tokenised public design system; the values below are
 * MEASURED from the public stylesheets of legrand.fr (default
 * `[data-js-theme="part"]` universe) and legrandgroup.com. The signature is
 * the "particuliers" brand orange (#d54401, the `[data-js-theme=part]`
 * `--theme-color`) used for primary buttons and interactive accents over a
 * monochrome black-led chrome. We reference the brand font *names* (Roboto
 * for body/controls/fields/labels, Acumin for display/headings — the
 * legrand.fr `@font-face` families) only — never font binaries. Sources and exact
 * provenance are documented in MAPPING.md. Where the public stylesheets
 * publish no direct equivalent for a Sentropic role (the warning hue, the
 * sm/lg density steps, elevation, motion), the closest derived value is used
 * and the choice is noted "à confirmer" in MAPPING.md.
 *
 * Legrand colour reference (legrand.fr, part universe):
 *   White (background default)        #ffffff   (surface default)
 *   Light grey surface                #f0f1f2   (surface subtle / tag bg)
 *   Field border subtle               #e2e4e6   (subtle border / field stroke)
 *   Secondary / caption grey          #52575c   (secondary text / captions)
 *   Muted grey                        #73757b   (muted text)
 *   Body / primary text (near-black)  #1f1f20   (primary text / button hover)
 *   Darkest (default theme)           #000000   (default :root theme color)
 *   Brand orange (action)             #d54401   ([data-js-theme=part] theme color)
 *   Dark orange                       #be3c0d   (part theme-color-dark)
 *   Light orange tint                 #fae8e0   (part theme-color-light)
 *   Pro teal accent                   #00798f   ([data-js-theme=pro] theme color)
 *   Deep teal                         #006274   (pro theme-color-dark)
 *   Light teal tint                   #e3eef0   (pro theme-color-light)
 *   Error brick                       #961e16   (form error text)
 *   Error border red                  #f75c53   (form error border)
 *   Success green                     #0c732e   (derived AA step from #0e8a37 — à confirmer)
 *   Warning amber                     #a76800   (measured .c-text--warning — AA on white)
 */

// --- Legrand raw colour palette ------------------------------------------------
const legrandColor = {
  // Brand orange — the legrand.fr "particuliers" universe accent
  // ([data-js-theme=part] --theme-color). Used as the action / brand family.
  brand: {
    primary: "#d54401", // [data-js-theme=part] --theme-color (action / brand)
    hover: "#1f1f20", // .c-button--part --button-hover (primary hover)
    dark: "#be3c0d", // [data-js-theme=part] --theme-color-dark
    light: "#fae8e0" // [data-js-theme=part] --theme-color-light
  },
  // Pro teal — the legrand.fr "pro" universe accent
  // ([data-js-theme=pro] --theme-color). Used as the Sentropic cyan slot.
  teal: {
    primary: "#00798f", // [data-js-theme=pro] --theme-color
    dark: "#006274", // [data-js-theme=pro] --theme-color-dark
    light: "#e3eef0" // [data-js-theme=pro] --theme-color-light
  },
  // Neutral / dark scale, measured from the legrand.fr chrome.
  slate: {
    0: "#ffffff", // white / input background
    10: "#f0f1f2", // light grey surface / tag bg (--tag-bg)
    20: "#e2e4e6", // subtle border / field stroke (--form-field-border-color)
    60: "#52575c", // secondary text / captions (--tag-color)
    80: "#1f1f20", // body text (rgb(31 31 32)) / button hover
    90: "#000000" // darkest (:root --theme-color default)
  },
  // Muted grey — the default-universe light theme step
  // (:root --theme-color-light).
  muted: "#73757b", // :root --theme-color-light (muted text)
  // System / status colours.
  system: {
    success: "#0c732e", // derived AA step from the measured #0e8a37 (.c-text--success, à confirmer)
    warning: "#a76800", // measured .c-text--warning{color:#a76800} (AA on white)
    error: "#961e16", // measured form error text (--form-field-text-color error)
    errorBorder: "#f75c53", // measured form error border (--form-field-border-color error)
    info: "#00798f" // measured pro teal (AA on white)
  }
} as const;

// --- foundation (Legrand-specific values) --------------------------------------
const foundation = {
  color: {
    // Legrand has no dominant brand BLUE; the Sentropic "blue" role family
    // (primary action / link / interactive) carries the brand orange.
    blue: {
      10: legrandColor.brand.light, // #fae8e0 lightest orange tint
      60: legrandColor.brand.primary, // #d54401 brand orange (primary)
      80: legrandColor.brand.dark // #be3c0d dark orange
    },
    // The Sentropic "cyan" accent slot carries the legrand.fr "pro"
    // universe teal accent (measured).
    cyan: {
      10: legrandColor.teal.light, // #e3eef0 light teal tint
      50: legrandColor.teal.primary, // #00798f pro teal accent
      70: legrandColor.teal.dark // #006274 deep teal
    },
    // Sentropic "slate" role family mapped onto the measured neutral scale.
    slate: {
      0: legrandColor.slate[0], // white
      10: legrandColor.slate[10], // light grey surface
      20: legrandColor.slate[20], // subtle borders / field stroke
      60: legrandColor.slate[60], // secondary text
      80: legrandColor.slate[80], // primary text
      90: legrandColor.slate[90] // darkest
    },
    feedback: {
      success: legrandColor.system.success,
      warning: legrandColor.system.warning,
      error: legrandColor.system.error,
      info: legrandColor.system.info
    }
  },
  // legrand.fr sets the body/controls type in Roboto
  // (`body,html{…font-family:Roboto,sans-serif…}` — inputs inherit it) and
  // reserves Acumin (AcuminProCond woff2 via @font-face in main.css) for
  // headings/titles/buttons. mono is the system stack. We reference the
  // font *names* only, not binaries; the fallback stacks are a faithful
  // expression (à confirmer).
  font: {
    sans: "'Roboto', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", // à confirmer (fallbacks)
    display: "'Acumin', 'Acumin Pro', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", // à confirmer (fallbacks)
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity).
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
  // Legrand / legrand.fr aesthetic is squared: form fields carry a 0 radius
  // (.c-form__field --form-field-rounded: 0); the 9999px pill is measured on
  // .c-button--rounded-full, .c-pagination__link and .c-checkbox[type=radio]
  // (.c-tag publishes no border-radius).
  radius: {
    none: "0",
    sm: "0", // squared fields (measured --form-field-rounded)
    md: "0", // squared controls (measured --form-field-rounded)
    lg: "0.5rem", // 8px — cards (à confirmer)
    pill: "9999px" // measured pill radius (buttons / pagination / radio)
  },
  // Light, neutral elevation tinted with the brand ink. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(31 31 32 / 0.10)",
    medium: "0 4px 12px rgb(31 31 32 / 0.14)",
    floating: "0 8px 24px rgb(31 31 32 / 0.18)"
  },
  // Motion durations are not tokenised publicly by Legrand; kept aligned
  // with the Sentropic base ("à confirmer").
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
  // --- Anatomy primitives (Legrand) --------------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // field border 1px
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Control density. The md height (46px) and field padding (0.75rem) are
  // measured (--form-field-height, input padding); sm/lg follow the standard
  // size scale ("à confirmer").
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.5rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.875rem", paddingBlock: "0.75rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" }
  },
  // Legrand typography: Roboto for body/controls/fields (inherited from
  // `body,html{…font-family:Roboto,sans-serif…}`), Roboto uppercase for
  // labels/captions (measured caption group). Button labels use a medium
  // weight (500).
  typography: {
    control: { family: "'Roboto', system-ui, sans-serif", size: "1rem", weight: "500", lineHeight: "1.35", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" }, // à confirmer (weight/size assignment)
    field: { family: "'Roboto', system-ui, sans-serif", size: "1rem", weight: "300", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" }, // à confirmer (weight/size assignment)
    label: { family: "'Roboto', system-ui, sans-serif", size: "0.75rem", weight: "500", lineHeight: "1.35", letterSpacing: "0.24px", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" }, // measured caption group (.c-form__label, .c-tag…); desktop size
    // Brand links sit in the body ink at rest (`a{color:inherit}`) and stay
    // UNDERLINED at rest (1px); on hover they take the current theme color
    // (`a:focus-visible,a:hover{color:var(--current-color)}`, measured).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "1px", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "1px", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // disabled controls dim to 0.5 (à confirmer)
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "ease-in-out" }, // à confirmer (not tokenised publicly)
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" }, // à confirmer (not tokenised publicly)
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" }, // à confirmer (not tokenised publicly)
  // FOCUS = a strong 4px OUTLINE in currentColor
  // (`html :focus-visible{outline:4px solid currentColor}`, measured). The
  // orange only holds where the focused element also sets
  // `color:var(--current-color)` (links, buttons); elsewhere currentColor is
  // the body ink. Fields carry their own rule (`.c-form__select:focus,…{
  // border-color:var(--current-color);outline:2px solid transparent;
  // outline-offset:2px}`, measured).
  focus: {
    strategy: "outline",
    width: "4px",
    offset: "0",
    color: legrandColor.brand.primary, // #d54401 current theme color (part universe) — derived from currentColor (à confirmer)
    inset: "0"
  },
  // Form fields are BOXED (outline): a white fill, a 1px light-grey border
  // (#e2e4e6) and squared corners. `style: "outline"` makes the builder draw
  // four equal borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: legrandColor.slate[0], // #ffffff
    underlineColor: legrandColor.slate[20], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the measured field icon colour
    // (.c-form__field --form-icon-text-color:#1f1f20); the 40px right gutter
    // is a coherent stand-in (à confirmer).
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%231f1f20' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem" // à confirmer (gutter)
  },
  // Cards: legrand.fr publishes no card border/hover spec (`.c-card` only
  // sets theme-coloured border-color); coherent stand-in (à confirmer).
  card: {
    borderWidth: "1px", // à confirmer (no published card border-width)
    lineHeight: "1.5", // à confirmer (no published card spec)
    hoverBackground: legrandColor.slate[10] // #f0f1f2 (à confirmer — no published card hover)
  },
  // Secondary button = OUTLINED in the brand orange: transparent fill, orange
  // border + text. The light-orange hover fill generalises the
  // `.c-button--push` hover (`--button-bg-hover:var(--theme-color-light)`,
  // measured); a `.c-button--bordered.c-button--part` hover instead resolves
  // `--button-bg-hover:#1f1f20` (à confirmer).
  buttonSecondary: {
    background: "transparent", // measured .c-button--bordered background-color
    border: legrandColor.brand.primary, // #d54401 stroke (measured .c-button--bordered border-color)
    hoverBackground: legrandColor.brand.light // #fae8e0 light fill on hover (à confirmer — push-variant hover generalised)
  },
  // Tabs / top-nav: legrand.fr publishes NO tabs component (à confirmer —
  // explicit derivation). The active orange label generalises the hover
  // current-color (`a:hover/button:hover{color:var(--current-color)}`,
  // measured); the only published active-indicator analogue is the ink
  // 2px bottom border
  // (`.c-product-viewer__thumbnail[aria-current=true]{
  // border-bottom-width:2px;border-color:rgb(31 31 32)}`, measured).
  tabs: {
    activeText: legrandColor.brand.primary, // #d54401 current-color label (à confirmer — derived, no tabs component published)
    activeBackground: "transparent", // à confirmer (no tabs component published)
    inactiveBackground: "transparent", // à confirmer (no tabs component published)
    activeWeight: "700", // à confirmer (no tabs component published)
    paddingBlock: "0.75rem", // 12px (à confirmer — no tabs component published)
    paddingInline: "1rem", // 16px (à confirmer — no tabs component published)
    fontSize: "1rem", // 16px (à confirmer — no tabs component published)
    lineHeight: "1.5rem", // 24px (à confirmer — no tabs component published)
    indicatorSide: "bottom", // à confirmer (thumbnail analogue is a bottom border)
    indicatorMode: "border" // à confirmer (thumbnail analogue is a bottom border)
  },
  // Pagination: white round page links (measured `.c-pagination__link{
  // background-color:rgb(255 255 255);border-radius:9999px;padding:.625rem}`);
  // the active page takes the part-universe light fill + dark text (measured
  // `.c-pagination__link[aria-current],…:hover{
  // background-color:var(--theme-color-light);color:var(--theme-color-dark)}`,
  // i.e. #fae8e0 / #be3c0d — 4.60:1, passes AA, no rerouting).
  pagination: {
    background: "#ffffff", // measured .c-pagination__link background
    border: "transparent", // à confirmer (no published pagination border)
    borderWidth: "0", // à confirmer (no published pagination border)
    text: legrandColor.slate[80], // #1f1f20 link text (inherited body ink)
    activeBackground: "#fae8e0", // measured .c-pagination__link[aria-current] fill
    activeText: legrandColor.brand.dark, // #be3c0d measured .c-pagination__link[aria-current] text
    activeBorderWidth: "0", // à confirmer (no published pagination border)
    paddingBlock: "0.625rem", // measured .c-pagination__link padding
    paddingInline: "0.625rem", // measured .c-pagination__link padding
    minSize: "2.25rem", // 36px page box (à confirmer — no published page-box size)
    fontSize: "1rem", // 16px (à confirmer — no published pagination type size)
    lineHeight: "1.5rem" // 24px (à confirmer — no published pagination type size)
  },
  // Breadcrumb: dark-orange links, near-black current page, grey separators.
  breadcrumb: {
    linkText: legrandColor.brand.dark, // #be3c0d (à confirmer — role assignment, hex is the measured part dark orange)
    text: legrandColor.slate[60], // #52575c trail text (à confirmer — no published breadcrumb spec)
    currentText: legrandColor.slate[80], // #1f1f20 current page (à confirmer — no published breadcrumb spec)
    separator: legrandColor.slate[60], // #52575c (à confirmer — no published breadcrumb spec)
    fontSize: "0.875rem", // 14px (à confirmer — no published breadcrumb spec)
    lineHeight: "1.5rem", // 24px (à confirmer — no published breadcrumb spec)
    currentWeight: "700" // à confirmer (no published breadcrumb spec)
  },
  // Alert / notice: legrand.fr publishes NO `.c-alert` / `.c-notice`
  // component (zero match in main.css) — coherent stand-in (à confirmer).
  alert: {
    background: "transparent", // à confirmer (no published alert component)
    borderTop: "none", // à confirmer (no published alert component)
    borderRight: "none", // à confirmer (no published alert component)
    borderBottom: "none", // à confirmer (no published alert component)
    accentWidth: "0", // à confirmer (no published alert component)
    filetWidth: "0.25rem", // 4px ::before accent bar (à confirmer — no published alert component)
    paddingTop: "1rem", // 16px (à confirmer — no published alert component)
    paddingRight: "1rem", // 16px (à confirmer — no published alert component)
    paddingBottom: "1rem", // 16px (à confirmer — no published alert component)
    paddingLeft: "1.25rem", // 20px, clears the left filet (à confirmer — no published alert component)
    fontSize: "1rem", // 16px (à confirmer — no published alert component)
    lineHeight: "1.5rem" // 24px (à confirmer — no published alert component)
  },
  // Accordion / details: legrand.fr publishes no accordion component, but
  // `details{--padding:12px}` (measured) corroborates the 12px block padding.
  accordion: {
    text: legrandColor.slate[80], // #1f1f20 summary label (à confirmer — no published accordion component)
    paddingBlock: "0.75rem", // 12px (measured details --padding)
    paddingInline: "1rem", // 16px (à confirmer — no published accordion component)
    fontSize: "1rem", // 16px (à confirmer — no published accordion component)
    fontWeight: "700", // à confirmer (no published accordion component)
    lineHeight: "1.5rem" // 24px (à confirmer — no published accordion component)
  },
  // Tag: measured `.c-tag{…background-color:var(--tag-bg);color:var(--tag-color);
  // line-height:100%;margin:0;max-width:100%;padding:.375rem;width:auto}` with
  // `.c-tag{--tag-color:#52575c;--tag-bg:#f0f1f2}`; type is the Roboto caption
  // group (`.625rem/500`, `.75rem` at ≥1024px). No border-radius is published,
  // so the squared brand default applies (à confirmer).
  tag: {
    radius: "0", // à confirmer (no published tag radius — squared default)
    paddingBlock: "0.375rem", // measured .c-tag padding
    paddingInline: "0.375rem", // measured .c-tag padding
    fontSize: "0.625rem", // measured caption group (.75rem at ≥1024px)
    fontWeight: "500", // measured caption group
    lineHeight: "100%", // measured .c-tag line-height
    minHeight: "1.5rem", // 24px (à confirmer — no published tag min-height)
    neutralBackground: legrandColor.slate[10], // #f0f1f2 measured .c-tag --tag-bg
    neutralText: legrandColor.slate[60] // #52575c measured .c-tag --tag-color
  },
  // Badge: legrand.fr publishes no badge component — coherent stand-in built
  // from the brand orange (à confirmer).
  badge: {
    radius: "999px", // à confirmer (no published badge component)
    paddingBlock: "0", // à confirmer (no published badge component)
    paddingInline: "0.5rem", // 8px (à confirmer — no published badge component)
    fontSize: "0.875rem", // 14px (à confirmer — no published badge component)
    fontWeight: "700", // à confirmer (no published badge component)
    lineHeight: "1.5rem", // 24px (à confirmer — no published badge component)
    textTransform: "none", // à confirmer (no published badge component)
    minHeight: "1.5rem", // 24px (à confirmer — no published badge component)
    infoBackground: legrandColor.brand.primary, // #d54401 (à confirmer — no published badge component)
    infoText: "#ffffff" // white text on the brand orange (à confirmer — no published badge component)
  },
  // Checkbox/radio label: legrand.fr publishes no choice-label spec —
  // coherent stand-in (à confirmer).
  choice: {
    labelFontSize: "1rem", // 16px (à confirmer — no published choice spec)
    labelLineHeight: "1.5rem", // 24px (à confirmer — no published choice spec)
    radioLineHeight: "1.5rem", // 24px (à confirmer — no published choice spec)
    labelColor: legrandColor.slate[80] // #1f1f20 (à confirmer — no published choice spec)
  },
  // Search input: legrand.fr publishes NO `.c-search*` rule (zero match in
  // main.css) — coherent stand-in (à confirmer).
  search: {
    paddingBlock: "0.375rem", // 6px (à confirmer — no published search component)
    paddingInline: "0.75rem", // 12px (à confirmer — no published search component)
    fontSize: "1rem", // 16px (à confirmer — no published search component)
    lineHeight: "1.5rem" // 24px (à confirmer — no published search component)
  },
  // Toggle / switch label: legrand.fr publishes no toggle spec — coherent
  // stand-in (à confirmer).
  toggle: {
    trackPadding: "0", // à confirmer (no published toggle spec)
    lineHeight: "1.5rem", // 24px (à confirmer — no published toggle spec)
    textColor: legrandColor.slate[80] // #1f1f20 (à confirmer — no published toggle spec)
  }
} as const;

// --- semantic (Legrand-specific role mapping) ----------------------------------
const semantic = {
  surface: {
    default: legrandColor.slate[0], // white
    subtle: legrandColor.slate[10], // #f0f1f2 light grey surface
    raised: legrandColor.slate[0], // white
    inverse: legrandColor.slate[80], // #1f1f20 dark ink inverse surface
    overlay: "rgb(31 31 32 / 0.6)" // brand-ink modal backdrop (à confirmer — no modal backdrop published in main.css)
  },
  text: {
    primary: legrandColor.slate[80], // #1f1f20 (body color rgb(31 31 32))
    secondary: legrandColor.slate[60], // #52575c (caption color)
    muted: legrandColor.muted, // #73757b (default-universe light theme step)
    inverse: legrandColor.slate[0], // white on dark / coloured surfaces
    link: legrandColor.brand.primary // #d54401 hover current-color generalised to the link role (à confirmer — rest state is the body ink); AA on white
  },
  border: {
    subtle: legrandColor.slate[20], // #e2e4e6 (field stroke)
    strong: legrandColor.slate[60], // #52575c
    interactive: legrandColor.brand.primary // #d54401 brand orange interactive
  },
  action: {
    primary: legrandColor.brand.primary, // #d54401 brand orange primary
    primaryHover: legrandColor.brand.hover, // #1f1f20 dark hover (.c-button--part --button-hover)
    primaryText: "#ffffff", // white text on the brand orange for AA contrast (.c-button--part --button-contrasted)
    secondary: legrandColor.slate[10], // #f0f1f2 secondary surface
    secondaryHover: legrandColor.slate[20], // #e2e4e6 (à confirmer — role assignment, hex is the measured field-stroke grey)
    secondaryText: legrandColor.brand.dark, // #be3c0d (à confirmer — role assignment, hex is the measured part dark orange)
    danger: legrandColor.system.error // #961e16 error brick
  },
  feedback: {
    success: legrandColor.system.success,
    warning: legrandColor.system.warning,
    error: legrandColor.system.error,
    info: legrandColor.system.info
  },
  status: {
    pending: legrandColor.system.warning,
    processing: legrandColor.system.info,
    completed: legrandColor.system.success,
    failed: legrandColor.system.error
  },
  // Categorical data-vis palette built from the brand hues. Legrand publishes
  // no 8-colour sequential scale, so this is a coherent proposal drawn from
  // the brand palette (see MAPPING.md, "à confirmer").
  data: {
    category1: legrandColor.brand.primary, // #d54401 brand orange
    category2: legrandColor.slate[80], // #1f1f20 dark ink
    category3: legrandColor.system.info, // #00798f pro teal
    category4: legrandColor.system.warning, // #a76800 amber
    category5: legrandColor.system.error, // #961e16 brick
    category6: legrandColor.teal.dark, // #006274 deep teal
    category7: legrandColor.slate[60], // #52575c grey
    category8: legrandColor.brand.dark // #be3c0d dark orange
  }
} as const;

/**
 * The Legrand theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Legrand-specific values, and
 * the `component` layer is REBUILT from this theme's own semantic/foundation
 * via `createComponent` — so the brand orange reaches the components
 * (buttons, tabs, pagination, chat bubbles…), not just the elements that
 * read semantic vars directly.
 */
export const legrandTheme: TenantTheme = {
  id: "legrand",
  label: "Legrand",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default legrandTheme;
