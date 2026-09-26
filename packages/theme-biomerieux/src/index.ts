import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * bioMérieux brand theme for the Sentropic token structure.
 *
 * bioMérieux publishes no tokenised public design system; the brand values
 * below are MEASURED from the official site stylesheet
 * (`clientlib-site.min.css` served from www.biomerieux.com — source (b) of
 * the method). The signature is the deep corporate blue
 * (`--color-blue-primary: #00427f`, 311 `var()` references + 3 literal
 * occurrences in the brand region) carried by links, buttons, titles and
 * form focus, with a lime secondary (`--color-green-bitter-lemon: #cddb2e`)
 * for secondary buttons and active tabs. We reference the brand font *name*
 * (Arial, declared `font-family: Arial, sans-serif` on `html`) only — never
 * font binaries. Sources and exact provenance are documented in MAPPING.md.
 * Where the brand publishes no direct equivalent for a Sentropic role, the
 * closest measured value is used and the assignment is documented; geometry
 * with no brand source is aligned with the reference theme package's
 * geometry and marked "à confirmer" in MAPPING.md.
 *
 * Counting convention (applies to every figure cited in this file):
 * counts are case-insensitive matches over the brand region of the single
 * measured stylesheet; short hex forms are expanded before counting
 * (`#ccc` and `#cccccc` count as one colour); 8-digit alpha forms
 * (`#0000001f`) are counted separately; `rgb()`/`rgba()` equivalents are
 * reported apart, never merged. A "reference" is one `var(--token)`
 * occurrence; an "occurrence" is one literal hex in a declaration.
 *
 * bioMérieux colour reference (light theme):
 *   White (background default)        #ffffff   (surface default)
 *   Grey background (section alt)     #ebebeb   (surface subtle)
 *   Light blue tint (current page)    #d9e3ec   (pagination active)
 *   Field border / divider silver     #cccccc   (subtle border / field stroke)
 *   Strong divider grey               #b7b7b7   (strong border)
 *   Breadcrumb / secondary nav grey   #777777   (muted text — arbitration)
 *   Tabs description grey             #333333   (secondary text)
 *   Body text (near-black)            #444444   (primary text)
 *   Corporate blue (brand / action)   #00427f   (links, buttons, focus)
 *   Button hover blue                 #00325f   (primary hover)
 *   Dark corporate blue (inverse)     #00305d   (inverse surface)
 *   Info blue                         #0a7feb   (info accents)
 *   Gradient blue                     #4ec3e0   (gradients / cyan accent)
 *   Brand green (hover / accents)     #3c9845   (success / link hover)
 *   Pear green (gradient / variant)   #bfd630   (secondary variant)
 *   Bitter-lemon (secondary button)   #cddb2e   (secondary action)
 *   Rio green (secondary hover)       #bdcb22   (secondary hover)
 *   Highlight yellow                  #f6e420   (warning / active markers)
 *   Lemon yellow                      #ffdd37   (secondary gradient end)
 *   Error red                         #d00000   (danger / form errors)
 */

// --- bioMérieux raw colour palette ------------------------------------------
const biomerieuxColor = {
  // Corporate blue family — declared `:root` tokens of clientlib-site.min.css.
  // `--color-blue-primary` is consumed 311 times via `var()` (links, buttons,
  // titles, checkbox/radio strokes, focus) with 3 literal occurrences.
  blue: {
    primary: "#00427f", // --color-blue-primary: corporate blue (action / brand)
    hover: "#00325f", // --color-blue-prussian-hover: button hover (17 references)
    prussian: "#00305d", // --color-blue-prussian: dark corporate blue (4 references)
    light: "#d9e3ec", // --color-blue-light: current-page pill, light tint (5 references)
    seaSerpent: "#4ec3e0", // --color-blue-sea-serpent: gradient blue (27 references)
    fresh: "#0a7feb" // --color-blue-fresh: search-highlight border (1 reference + 2 literals)
  },
  // Green family — `--color-green` (120 references: link hover, pretitles,
  // play-button hover) is the operative green; pear/bitter-lemon/rio carry
  // gradients, secondary buttons and their hover.
  green: {
    brand: "#3c9845", // --color-green: brand green (120 references)
    pear: "#bfd630", // --color-green-pear: gradient green (40 references)
    bitterLemon: "#cddb2e", // --color-green-bitter-lemon: secondary button (29 references)
    rio: "#bdcb22" // --color-green-rio: secondary hover (12 references)
  },
  // Yellow accents — `--color-yellow` (13 references: carousel markers,
  // hotspot headers, pretitle bars); lemon (5 references) ends gradients.
  yellow: {
    brand: "#f6e420", // --color-yellow: highlight yellow (13 references)
    lemon: "#ffdd37" // --color-yellow-lemon: lemon yellow (5 references)
  },
  // Neutral grey scale — declared `:root` tokens; short forms (`#ccc`,
  // `#333`, `#444`, `#777`, `#ddd`) are transcribed expanded.
  slate: {
    0: "#ffffff", // --color-white (204 references + 55 literal occurrences)
    50: "#fafafa", // --color-grey-abalaster (3 references + 1 literal occurrence)
    100: "#f2f2f2", // --color-grey-smoke: filter/aside surfaces (17 references)
    150: "#ebebeb", // --color-grey-mercury: background-grey sections (12 references)
    200: "#cccccc", // --color-grey-silver: dividers + field strokes (40 references)
    300: "#d9d9d9", // --color-grey-light (9 references)
    400: "#b7b7b7", // strong divider grey, 8 literal occurrences in brand rules
    500: "#777777", // --color-grey-dark: breadcrumb links (21 references)
    600: "#333333", // --color-grey-darker: tabs descriptions (2 references + 3 literals)
    800: "#444444", // --color-black: html body colour (33 references)
    900: "#00305d" // darkest brand surface reuses the dark corporate blue
  },
  // System / status colours.
  system: {
    success: "#3c9845", // --color-green, the operative brand green (120 references)
    warning: "#f6e420", // --color-yellow highlight (13 references; fill only)
    error: "#d00000", // --color-red: form errors, alerts (8 references)
    info: "#0a7feb" // --color-blue-fresh (1 reference + 2 literals)
  }
} as const;

// --- foundation (bioMérieux-specific values) --------------------------------
const foundation = {
  color: {
    // The Sentropic "blue" role family carries the corporate blue —
    // the brand's colour of action, links and focus.
    blue: {
      10: biomerieuxColor.blue.light, // #d9e3ec lightest blue tint
      60: biomerieuxColor.blue.primary, // #00427f corporate blue (primary)
      80: biomerieuxColor.blue.hover // #00325f darker interactive blue
    },
    // No brand cyan; the accent slot carries the measured gradient blues.
    cyan: {
      10: biomerieuxColor.blue.light, // #d9e3ec light tint (role assignment documented)
      50: biomerieuxColor.blue.seaSerpent, // #4ec3e0 gradient blue (27 references)
      70: biomerieuxColor.blue.fresh // #0a7feb info blue
    },
    // Sentropic "slate" role family mapped onto the measured grey scale.
    slate: {
      0: biomerieuxColor.slate[0], // white
      10: biomerieuxColor.slate[100], // smoke surface grey
      20: biomerieuxColor.slate[200], // silver borders / field stroke
      60: biomerieuxColor.slate[500], // dark grey text
      80: biomerieuxColor.slate[800], // body text
      90: biomerieuxColor.slate[600] // darker tabs grey
    },
    feedback: {
      success: biomerieuxColor.system.success,
      warning: biomerieuxColor.system.warning,
      error: biomerieuxColor.system.error,
      info: biomerieuxColor.system.info
    }
  },
  // bioMérieux declares `font-family: Arial, sans-serif` on `html` and
  // `--arial: Arial, sans-serif` for body text (`--font-body` resolves to it).
  // We use Arial for body/controls and display; mono is the system stack.
  // We reference the font *names* only, not binaries.
  font: {
    sans: "'Arial', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Arial', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity — à confirmer).
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
  // Radii measured in brand rules: pill buttons 50px (`--border-radius`),
  // form token 2px (`--border-radius-form`), effective text-input radius 5px
  // (`.cmp-form-text input{border-radius:5px}` wins over the 2px class rule),
  // alert/dialog boxes 10px (8 literal occurrences).
  radius: {
    none: "0",
    sm: "0.125rem", // 2px — form token
    md: "0.3125rem", // 5px — effective text-input radius
    lg: "0.625rem", // 10px — alerts / dialogs
    pill: "50px" // pill buttons
  },
  // Elevation measured from brand shadow tokens and filter/dialog shadows:
  // `--box-shadow: 6px 4px 6px var(--color-box-shadow)` (#0000001f),
  // hover variant #00000061, filter cards `0 3px 12px rgba(0,0,0,.161)`.
  shadow: {
    subtle: "6px 4px 6px rgb(0 0 0 / 0.12)",
    medium: "6px 4px 6px rgb(0 0 0 / 0.38)",
    floating: "0 3px 12px rgb(0 0 0 / 0.16)"
  },
  // Motion measured in brand rules: `transition: all .3s ease-in-out` (32
  // declarations), `transition: color .2s ease` (18 declarations).
  motion: {
    fast: "200ms",
    normal: "300ms",
    slow: "450ms", // aligned with the reference theme package's geometry (à confirmer)
    easing: "ease-in-out"
  },
  // z-index roles are not brand-specific; kept aligned with the Sentropic
  // base (à confirmer).
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (bioMérieux) --------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // field borders and dividers
    thick: "2px" // checkbox/radio strokes, form focus outline
  },
  borderStyle: { solid: "solid" },
  // Control density measured in brand rules: text inputs `min-height: 40px`
  // with `padding: 0 8px` (`.cmp-form-text__text`), buttons
  // `min-height: 50px` with `padding: 0 32px`
  // (`.cmp-form-button, .cmp-teaser__action-link`), teaser buttons
  // `min-height: 3.625rem` (58px). Gaps and font sizes follow the standard
  // size scale (à confirmer).
  density: {
    sm: { controlHeight: "2.5rem", paddingBlock: "0", paddingInline: "0.5rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "0.875rem" },
    md: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "2rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" },
    lg: { controlHeight: "3.625rem", paddingBlock: "0", paddingInline: "2rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" }
  },
  // bioMérieux typography: Arial everywhere; buttons bold (700); body text
  // 1.125rem (`--font-text-rg`) with 1.333 line height (`--line-height-body`).
  typography: {
    control: { family: "'Arial', system-ui, sans-serif", size: "1.125rem", weight: "700", lineHeight: "1.333", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Arial', system-ui, sans-serif", size: "1.125rem", weight: "400", lineHeight: "1.333", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Arial', system-ui, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Brand links are the corporate blue #00427f, not underlined at rest
    // (`a{color:var(--color-blue-primary);text-decoration:none}`) and not
    // underlined on hover either (`a:hover` carries no underline; only the
    // pager underlines, which is pagination's own rule).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "none", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.55", // aligned with the Sentropic base (à confirmer)
  transition: { property: "background-color, border-color, color, box-shadow", duration: "200ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" }, // Sentropic base (à confirmer)
  // FOCUS = a corporate-blue OUTLINE on form controls:
  // `.cmp-form-options__field--checkbox:focus-visible, ... {outline: 2px
  // solid var(--color-blue-primary); outline-offset: 2px}`. The five
  // `outline: none` rules are component-scoped removals (accordion, timeline,
  // language nav), never the general control rule; no box-shadow ring is
  // drawn on focus anywhere in the brand region.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: biomerieuxColor.blue.primary, // #00427f corporate blue
    inset: "0"
  },
  // Form fields are BOXED (outline): no filled background, a 1px silver
  // border (`.cmp-form-text__text{border:1px solid var(--color-grey-silver)}`)
  // and the effective 5px radius. `style: "outline"` makes the builder draw
  // four equal borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: biomerieuxColor.slate[0], // #ffffff
    underlineColor: biomerieuxColor.slate[200], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: the brand strips native styling (`appearance: none`,
    // 24 declarations) but ships no SVG chevron of its own, so the chevron
    // below redraws the indicator in the corporate blue (à confirmer).
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2300427f' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: a subtle 1px silver border with a light hover tint from the
  // measured background-grey surface.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: biomerieuxColor.slate[150] // #ebebeb background-grey surface
  },
  // Secondary button = LIME: bitter-lemon fill with corporate-blue text
  // (6.60:1 — white would be 1.53:1, so the brand pairs blue text),
  // hovering to rio (`.cmp-button--secondary`, `:focus-visible` rio).
  buttonSecondary: {
    background: biomerieuxColor.green.bitterLemon, // #cddb2e secondary fill
    border: biomerieuxColor.green.bitterLemon, // #cddb2e stroke
    hoverBackground: biomerieuxColor.green.rio // #bdcb22 hover fill
  },
  // Tabs: the active tab carries the bitter-lemon fill with corporate-blue
  // text (`.cmp-tabs__tab--active{background-color:
  // var(--color-green-bitter-lemon);color:var(--color-blue-primary)}`).
  tabs: {
    activeText: biomerieuxColor.blue.primary, // #00427f active tab label
    activeBackground: biomerieuxColor.green.bitterLemon, // #cddb2e active fill
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px (à confirmer)
    paddingInline: "1rem", // 16px (à confirmer)
    fontSize: "1rem", // 16px (à confirmer)
    lineHeight: "1.5rem", // 24px (à confirmer)
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // Pagination: borderless bold links in body black, hover/focus in
  // corporate blue underlined; the current page is a light-blue pill
  // (`.cmp-articlelist__page-current{background-color:
  // var(--color-blue-light);border-radius:1rem}` — no colour declared, so
  // the text inherits the body black).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: biomerieuxColor.slate[800], // #444444 page links
    activeBackground: biomerieuxColor.blue.light, // #d9e3ec current pill
    activeText: biomerieuxColor.slate[800], // #444444 inherited body text
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px (à confirmer)
    paddingInline: "0.5rem", // 8px (measured pill padding)
    minSize: "2.25rem", // 36px (à confirmer)
    fontSize: "1.125rem", // 18px body size (measured breadcrumb/item size)
    lineHeight: "1.5rem" // 24px (à confirmer)
  },
  // Breadcrumb: dark-grey links (`.cmp-breadcrumb__item-link{color:
  // var(--color-grey-dark)}`), body-black current page (nothing declared —
  // inherits), blue arrow-image separators (measured
  // `arrow-full-right-blue.svg`, expressed as the corporate blue).
  breadcrumb: {
    linkText: biomerieuxColor.slate[500], // #777777 trail links
    text: biomerieuxColor.slate[500], // #777777 trail text
    currentText: biomerieuxColor.slate[800], // #444444 inherited body text
    separator: biomerieuxColor.blue.primary, // #00427f blue arrow separators
    fontSize: "1.125rem", // 18px (measured `.cmp-breadcrumb__item` size)
    lineHeight: "1.5rem", // 24px (à confirmer)
    currentWeight: "700"
  },
  // Alert / notice: the measured brand alert is a red box
  // (`.cmp-contactform__alert{background-color:var(--color-red);
  // border-radius:10px;color:var(--color-grey-light)}`); the anatomy below
  // keeps the neutral filet shape with reference-geometry paddings
  // (à confirmer) and the red reserved for the danger roles.
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0.25rem", // 4px ::before accent bar (à confirmer)
    paddingTop: "1rem", // 16px (à confirmer)
    paddingRight: "1rem", // 16px (à confirmer)
    paddingBottom: "1rem", // 16px (à confirmer)
    paddingLeft: "1.25rem", // 20px (à confirmer)
    fontSize: "1rem", // 16px (à confirmer)
    lineHeight: "1.5rem" // 24px (à confirmer)
  },
  // Accordion: corporate-blue summary titles
  // (`.cmp-accordion__button--navlink
  // .cmp-accordion__title{color:var(--color-blue-primary)}`).
  accordion: {
    text: biomerieuxColor.blue.primary, // #00427f summary label
    paddingBlock: "0.75rem", // 12px (à confirmer)
    paddingInline: "1rem", // 16px (à confirmer)
    fontSize: "1.125rem", // 18px body size (role assignment documented)
    fontWeight: "700",
    lineHeight: "1.5rem" // 24px (à confirmer)
  },
  // Tag: a small neutral chip on the smoke surface (aligned with the
  // reference theme package's geometry — à confirmer).
  tag: {
    radius: "4px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: biomerieuxColor.slate[100], // #f2f2f2
    neutralText: biomerieuxColor.slate[800] // #444444
  },
  // Badge: corporate-blue fill with white text (10.07:1), 4px radius
  // (aligned with the reference theme package's geometry — à confirmer).
  badge: {
    radius: "4px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: biomerieuxColor.blue.primary, // #00427f
    infoText: "#ffffff" // white on corporate blue (measured button pairing)
  },
  // Checkboxes/radios: 24px boxes with a 2px corporate-blue stroke
  // (`border:2px solid var(--color-blue-primary);height:24px`, 3px radius
  // for boxes, 50% for radios); labels inherit the body text.
  choice: {
    labelFontSize: "1.125rem", // 18px body size
    labelLineHeight: "1.5rem", // 24px (à confirmer)
    radioLineHeight: "1.5rem", // 24px (à confirmer)
    labelColor: biomerieuxColor.slate[800] // #444444
  },
  // Search input (aligned with the reference theme package's geometry —
  // à confirmer; the brand's full-dialog search variant at 70px/1.5rem is
  // overlay-scoped, not the site-wide value).
  search: {
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    fontSize: "1.125rem", // 18px body size
    lineHeight: "1.5rem" // 24px
  },
  // Toggle / switch label inherits the body text.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px (à confirmer)
    textColor: biomerieuxColor.slate[800] // #444444
  }
} as const;

// --- semantic (bioMérieux-specific role mapping) -----------------------------
const semantic = {
  surface: {
    default: biomerieuxColor.slate[0], // white
    subtle: biomerieuxColor.slate[150], // #ebebeb background-grey sections
    raised: biomerieuxColor.slate[0], // white
    inverse: biomerieuxColor.slate[900], // #00305d dark corporate blue
    overlay: "rgba(0, 0, 0, 0.8)" // --color-backdrop via .dialog__backdrop (form normalised)
  },
  text: {
    primary: biomerieuxColor.slate[800], // #444444 html body colour (9.74:1)
    secondary: biomerieuxColor.slate[600], // #333333 tabs descriptions (12.63:1)
    muted: biomerieuxColor.slate[500], // #777777 breadcrumb links (4.48:1, arbitration)
    inverse: biomerieuxColor.slate[0], // white on dark / coloured surfaces
    link: biomerieuxColor.blue.primary // #00427f brand link blue (10.07:1)
  },
  border: {
    subtle: biomerieuxColor.slate[200], // #cccccc dividers / field stroke
    strong: biomerieuxColor.slate[400], // #b7b7b7 strong dividers (8 literals)
    interactive: biomerieuxColor.blue.primary // #00427f control strokes (10.07:1)
  },
  action: {
    primary: biomerieuxColor.blue.primary, // #00427f corporate blue
    primaryHover: biomerieuxColor.blue.hover, // #00325f button hover
    primaryText: "#ffffff", // white on corporate blue (measured button pairing, 10.07:1)
    secondary: biomerieuxColor.green.bitterLemon, // #cddb2e secondary button fill
    secondaryHover: biomerieuxColor.green.rio, // #bdcb22 secondary hover
    secondaryText: biomerieuxColor.blue.primary, // #00427f on lime (6.60:1)
    danger: biomerieuxColor.system.error // #d00000 error red (5.70:1)
  },
  feedback: {
    success: biomerieuxColor.system.success,
    warning: biomerieuxColor.system.warning,
    error: biomerieuxColor.system.error,
    info: biomerieuxColor.system.info
  },
  status: {
    pending: biomerieuxColor.system.warning,
    processing: biomerieuxColor.system.info,
    completed: biomerieuxColor.system.success,
    failed: biomerieuxColor.system.error
  },
  // Categorical data-vis palette built from the measured brand hues. The
  // brand publishes no 8-colour sequential scale, so this is a coherent
  // proposal drawn from measured tokens (see MAPPING.md, "à confirmer").
  data: {
    category1: biomerieuxColor.blue.primary, // #00427f corporate blue
    category2: biomerieuxColor.green.brand, // #3c9845 brand green
    category3: biomerieuxColor.yellow.brand, // #f6e420 highlight yellow
    category4: biomerieuxColor.blue.seaSerpent, // #4ec3e0 gradient blue
    category5: biomerieuxColor.system.error, // #d00000 red
    category6: biomerieuxColor.blue.fresh, // #0a7feb info blue
    category7: biomerieuxColor.slate[500], // #777777 grey
    category8: biomerieuxColor.slate[900] // #00305d dark blue
  }
} as const;

/**
 * The bioMérieux theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry bioMérieux-specific values,
 * and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so the corporate blue reaches
 * the components (buttons, tabs, pagination, chat bubbles…), not just the
 * elements that read semantic vars directly.
 */
export const biomerieuxTheme: TenantTheme = {
  id: "biomerieux",
  label: "bioMérieux",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default biomerieuxTheme;
