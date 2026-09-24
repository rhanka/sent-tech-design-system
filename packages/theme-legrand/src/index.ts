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
 * monochrome black-led chrome. We reference the brand font *names* (Acumin
 * for body/headings, Roboto for labels/captions — the legrand.fr
 * `@font-face` families) only — never font binaries. Sources and exact
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
 *   Warning amber                     #a76800   (measured — AA on white)
 */

// --- Legrand raw colour palette ------------------------------------------------
const legrandColor = {
  // Brand orange — the legrand.fr "particuliers" universe accent
  // ([data-js-theme=part] --theme-color). Used as the action / brand family.
  brand: {
    primary: "#d54401", // [data-js-theme=part] --theme-color (action / brand)
    hover: "#1f1f20", // [data-js-theme=part] --button-hover (primary hover)
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
    success: "#0c732e", // derived AA step from the measured #0e8a37 (à confirmer)
    warning: "#a76800", // measured warning-adjacent hue (AA on white)
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
  // legrand.fr loads Acumin (AcuminProCond woff2) for body and headings and
  // Roboto for labels/captions (both via @font-face in main.css); we use
  // Acumin for body/controls and display. mono is the system stack. We
  // reference the font *names* only, not binaries.
  font: {
    sans: "'Acumin', 'Acumin Pro', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Acumin', 'Acumin Pro', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
  // (--form-field-rounded: 0); pills stay fully rounded (à confirmer).
  radius: {
    none: "0",
    sm: "0", // squared fields (measured --form-field-rounded)
    md: "0", // squared controls (measured --form-field-rounded)
    lg: "0.5rem", // 8px — cards (à confirmer)
    pill: "9999px" // pills / tags (measured pill radius)
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
  // Legrand typography: Acumin for interactive/fields, Roboto uppercase for
  // labels/captions. Button labels use a medium weight (500).
  typography: {
    control: { family: "'Acumin', 'Acumin Pro', system-ui, sans-serif", size: "1rem", weight: "500", lineHeight: "1.35", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Acumin', 'Acumin Pro', system-ui, sans-serif", size: "1rem", weight: "300", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Roboto', system-ui, sans-serif", size: "0.75rem", weight: "400", lineHeight: "1.35", letterSpacing: "0.24px", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Brand links inherit the body colour and stay UNDERLINED at rest (1px);
    // on hover they take the current theme color (measured).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "1px", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "1px", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // disabled controls dim to 0.5 (à confirmer)
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // FOCUS = a strong 4px OUTLINE in the current theme color
  // (`html :focus-visible{outline:4px solid currentColor}`).
  focus: {
    strategy: "outline",
    width: "4px",
    offset: "0",
    color: legrandColor.brand.primary, // #d54401 current theme color (part universe)
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
    // Native <select>: redraw the chevron in the brand ink with a 40px right gutter (à confirmer).
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%231f1f20' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: a subtle 1px grey border, light hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: legrandColor.slate[10] // #f0f1f2
  },
  // Secondary button = OUTLINED in the brand orange: transparent fill, orange
  // border + text, light orange fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: legrandColor.brand.primary, // #d54401 stroke
    hoverBackground: legrandColor.brand.light // #fae8e0 light fill on hover
  },
  // Tabs / top-nav: active tab = brand-orange label with a bottom orange
  // underline.
  tabs: {
    activeText: legrandColor.brand.primary, // #d54401 current-color label
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
  // Pagination: borderless dark-ink text links; active page = filled brand
  // orange with white text for AA contrast.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: legrandColor.slate[80], // #1f1f20 link text
    activeBackground: legrandColor.brand.primary, // #d54401 filled active page
    activeText: "#ffffff", // white text on the brand orange for AA contrast (measured --button-contrasted)
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb: dark-ink links, near-black current page, grey separators.
  breadcrumb: {
    linkText: legrandColor.brand.dark, // #be3c0d
    text: legrandColor.slate[60], // #52575c trail text
    currentText: legrandColor.slate[80], // #1f1f20 current page
    separator: legrandColor.slate[60], // #52575c
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
  // Accordion / details: a dark bold summary trigger.
  accordion: {
    text: legrandColor.slate[80], // #1f1f20 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "700",
    lineHeight: "1.5rem" // 24px
  },
  // Tag: a small pill chip in the measured light grey with caption-grey text.
  tag: {
    radius: "999px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: legrandColor.slate[10], // #f0f1f2 measured --tag-bg
    neutralText: legrandColor.slate[60] // #52575c measured --tag-color
  },
  // Badge: a pill badge in the brand orange with white text.
  badge: {
    radius: "999px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: legrandColor.brand.primary, // #d54401
    infoText: "#ffffff" // white text on the brand orange for AA contrast (measured --button-contrasted)
  },
  // Checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: legrandColor.slate[80] // #1f1f20
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
    textColor: legrandColor.slate[80] // #1f1f20
  }
} as const;

// --- semantic (Legrand-specific role mapping) ----------------------------------
const semantic = {
  surface: {
    default: legrandColor.slate[0], // white
    subtle: legrandColor.slate[10], // #f0f1f2 light grey surface
    raised: legrandColor.slate[0], // white
    inverse: legrandColor.slate[80], // #1f1f20 dark ink inverse surface
    overlay: "rgb(31 31 32 / 0.6)" // modal backdrop (brand ink tint)
  },
  text: {
    primary: legrandColor.slate[80], // #1f1f20 (body color rgb(31 31 32))
    secondary: legrandColor.slate[60], // #52575c (caption color)
    muted: legrandColor.muted, // #73757b (default-universe light theme step)
    inverse: legrandColor.slate[0], // white on dark / coloured surfaces
    link: legrandColor.brand.primary // #d54401 current theme color on hover (AA on white)
  },
  border: {
    subtle: legrandColor.slate[20], // #e2e4e6 (field stroke)
    strong: legrandColor.slate[60], // #52575c
    interactive: legrandColor.brand.primary // #d54401 brand orange interactive
  },
  action: {
    primary: legrandColor.brand.primary, // #d54401 brand orange primary
    primaryHover: legrandColor.brand.hover, // #1f1f20 dark hover (measured --button-hover)
    primaryText: "#ffffff", // white text on the brand orange for AA contrast — Legrand uses white contrasted text (measured --button-contrasted)
    secondary: legrandColor.slate[10], // #f0f1f2 secondary surface
    secondaryHover: legrandColor.slate[20], // #e2e4e6
    secondaryText: legrandColor.brand.dark, // #be3c0d
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
