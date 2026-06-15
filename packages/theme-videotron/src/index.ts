import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * VIDÉOTRON (videotron.com — the Québecor-owned Québec telecom: internet, mobile,
 * TV) theme for the Sentropic token structure.
 *
 * Vidéotron's public storefront is a Drupal "dxp_front" build. The brand layer
 * (the aggregated `css_*.css` delta sheets) uses LITERAL hex values plus a few
 * `--bf-border-radius-*` design-system custom properties. Every value below is
 * MEASURED from the live storefront's stylesheets, fetched directly via curl (the
 * homepage + the two aggregated brand sheets, delta 0 and delta 1): the brand
 * button rules (`.btn`, `.btn-primary`), the `.form-control` field rules, the
 * `:focus` ring, the Bootstrap-grade feedback tokens, the `font-family`
 * declarations and the frequency-ranked hex palette of the whole brand sheet. We
 * reference font *names* only ("Urbanist" + "BlenderPro" display + "Nunito Sans"
 * body — measured from the site's `font-family` declarations), never font
 * binaries. Sources and the full mapping are in MAPPING.md.
 *
 * Vidéotron's identity is a BOLD YELLOW-ON-CHARCOAL telecom system: the signature
 * VIDÉOTRON YELLOW (#ffd200 — the single most-used brand hex, 306 occurrences)
 * drives every primary CTA and brand accent; a near-black CHARCOAL (#2a2a27 — the
 * most-used ink, 134× and the literal label colour ON the yellow button) is the
 * primary ink; surfaces are WHITE on a warm faint grey (#f2f2f0); corners are
 * MILDLY ROUNDED (measured `.btn` + `.form-control` `border-radius:4px`, the
 * `--bf-border-radius-small` token); form fields are BOXED outlines (white fill,
 * 1px warm-grey #bebeb7 stroke, 4px radius) and focus is a YELLOW RING (the
 * measured `box-shadow:0 0 0 .2rem rgba(255,210,0,.5)` Bootstrap-grade glow in the
 * brand yellow). Notably Vidéotron's whole neutral ramp is WARM (greys carry a
 * faint yellow-green cast: #e0e0da, #9b9b95, #bebeb7) and even its "danger" tone
 * is a warm ORANGE-BROWN (#cc6002, 251× — the measured `.text-danger`/invalid
 * colour) rather than red. Where Sentropic needs a role Vidéotron does not
 * publish, the closest measured hex is used and the choice is noted "à confirmer"
 * in MAPPING.md.
 *
 * Vidéotron colour reference (measured hex, brand css_*.css):
 *   Brand yellow (action / brand)       #ffd200   .btn-primary background / 306× brand hex — THE Vidéotron yellow
 *   Brand yellow deep (hover/active)    #e0b400   darker yellow (hover ground, 123×) — à confirmer as exact hover
 *   Brand yellow bright (accent)        #ffdd2a   bright yellow accent variant
 *   Charcoal ink (text / btn label)     #2a2a27   primary ink + yellow-button label colour (134×)
 *   Charcoal darkest                    #1e1e1b   strongest ink (78×)
 *   Near-black (links / strong ink)     #050504   anchor / strong ink (19×)
 *   Warm slate (secondary text)         #575754   secondary text + field text (89×)
 *   Warm grey muted                     #9b9b95   muted / placeholder text (193×)
 *   Warm grey field border              #bebeb7   .form-control stroke (1px, 91×)
 *   Warm grey border alt                #c4c4bf   secondary control border (76×)
 *   Warm divider grey                   #e0e0da   divider / subtle border (161×)
 *   Warm faint surface                  #f2f2f0   subtle page surface (97×)
 *   Warm faintest surface               #f4f3f2   faintest neutral fill (21×)
 *   White (surface default)             #ffffff   surface default
 *   Success green                       #0b8339   valid / success accent (124×, AA on white)
 *   Success bright                      #2eb800   bright confirmation green (129×)
 *   Warning amber                       #ff9c0a   warning / caution amber (122×)
 *   Danger orange-brown                 #cc6002   .text-danger / invalid colour (251×) — warm, not red
 *   Info blue                           #0689d8   measured accent blue (homepage) — à confirmer as info role
 */

// --- VIDÉOTRON raw colour palette (measured hex, brand css_*.css) -------------
const vtColor = {
  // The brand IS the Vidéotron yellow. Used for the brand mark, every primary CTA
  // (.btn-primary) and yellow accents.
  yellow: {
    500: "#ffd200", // .btn-primary background / 306× brand hex — THE Vidéotron yellow
    600: "#e0b400", // darker yellow (hover/active ground, 123×) — à confirmer as exact hover
    400: "#ffdd2a", // bright yellow accent variant
    100: "#fff2b8" // faint yellow tint (measured soft fill #fff2b8 / #ffed9f family)
  },
  // Charcoal ink scale — Vidéotron's second pillar. The yellow button's label is
  // charcoal, and charcoal is the primary heading/body ink (never pure black).
  ink: {
    default: "#2a2a27", // primary ink + yellow-button label (134×)
    contrast: "#1e1e1b", // strongest ink (78×)
    black: "#050504", // anchor / strong ink (19×)
    secondary: "#575754" // secondary text + field text (89×)
  },
  // Warm grey neutral scale (Vidéotron's greys carry a faint yellow-green cast).
  grey: {
    100: "#f4f3f2", // faintest warm surface
    150: "#f2f2f0", // subtle page surface (97×)
    200: "#e0e0da", // divider / subtle border (161×)
    300: "#c4c4bf", // secondary control border (76×)
    350: "#bebeb7", // .form-control stroke (1px, 91×)
    500: "#9b9b95" // muted / placeholder text (193×)
  },
  white: "#ffffff", // surface default
  // System / status colours (measured Bootstrap-grade feedback tokens). Note the
  // warm "danger" is orange-brown, not red — Vidéotron's measured invalid colour.
  system: {
    success: "#0b8339", // valid / success accent (124×, AA on white)
    successBright: "#2eb800", // bright confirmation green (129×)
    warning: "#ff9c0a", // warning / caution amber (122×)
    danger: "#cc6002", // .text-danger / invalid colour (251×) — warm orange-brown
    info: "#0689d8" // measured accent blue (homepage) — à confirmer as info role
  }
} as const;

// --- foundation (VIDÉOTRON-specific values) ---------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (action / primary / link). Vidéotron's PRIMARY
    // ACTION is YELLOW, so the action steps are mapped to the yellow scale; the
    // lightest step is the faint yellow tint.
    blue: {
      10: vtColor.yellow[100], // #fff2b8 faint yellow tint
      60: vtColor.yellow[500], // #ffd200 THE Vidéotron yellow (primary action)
      80: vtColor.yellow[600] // #e0b400 deep yellow (hover/active ground)
    },
    // Sentropic "cyan" accent slot. Vidéotron has no cyan; the only measured cool
    // accent is the homepage info blue, mapped here so a distinct cool accent
    // survives (à confirmer).
    cyan: {
      10: "#e6f3fb", // faint blue tint (derived from #0689d8 — à confirmer)
      50: vtColor.system.info, // #0689d8 accent blue
      70: vtColor.ink.default // #2a2a27 charcoal (deepest cool slot → ink)
    },
    // Sentropic "slate" neutral family mapped onto the Vidéotron charcoal ink and
    // warm grey ramp.
    slate: {
      0: vtColor.white, // #ffffff white
      10: vtColor.grey[150], // #f2f2f0 subtle warm surface
      20: vtColor.grey[200], // #e0e0da divider / subtle border
      60: vtColor.ink.secondary, // #575754 secondary text
      80: vtColor.ink.default, // #2a2a27 primary ink (charcoal)
      90: vtColor.ink.contrast // #1e1e1b strongest ink
    },
    feedback: {
      success: vtColor.system.success,
      warning: vtColor.system.warning,
      error: vtColor.system.danger,
      info: vtColor.system.info
    }
  },
  // Vidéotron serves "Nunito Sans" across body/UI (89× font-family) and a condensed
  // display face — "Urbanist" on modern headings (64×) and the legacy "BlenderPro"
  // on uppercase buttons. We reference the family NAMES only, with the brand's own
  // system fallback chain. Mono is not part of Vidéotron — the Sentropic mono stack
  // is kept.
  font: {
    sans: "'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    display: "'Urbanist', 'BlenderPro', 'Nunito Sans', Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Vidéotron spacing: the brand sheet is a rem-based ramp (measured button padding
  // .7rem 3rem, field padding .5rem 1rem). Aligned to the Sentropic step keys.
  spacing: {
    0: "0",
    1: "0.25rem", // 4px
    2: "0.5rem", // 8px (measured field paddingBlock)
    3: "0.75rem", // 12px
    4: "1rem", // 16px (measured field paddingInline)
    6: "1.5rem", // 24px
    8: "2rem", // 32px
    12: "3rem", // 48px (measured CTA inline padding 3rem)
    16: "4rem" // 64px
  },
  // Vidéotron rounds mildly: the measured `.btn` and `.form-control`
  // `border-radius:4px` (the `--bf-border-radius-small` token), with an 8px medium
  // (`--bf-border-radius-medium`) for larger surfaces. No pill button language —
  // the brand keeps a tight 4px corner; `pill` is reserved for chips/badges.
  radius: {
    none: "0", // square (measured border-radius:0 utilities)
    sm: "2px", // measured small chips (border-radius:2px)
    md: "4px", // --bf-border-radius-small — measured btn + form-control radius
    lg: "8px", // --bf-border-radius-medium — cards / larger surfaces
    pill: "999px" // fully-rounded chips/badges
  },
  // Vidéotron elevation (measured `box-shadow:none` on buttons; soft card shadows
  // elsewhere). Mapped to the three Sentropic slots.
  shadow: {
    subtle: "0 1px 3px rgb(0 0 0 / 0.12)",
    medium: "0 4px 8px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.16), 0 2px 4px rgb(0 0 0 / 0.10)"
  },
  // Vidéotron transitions are short and standard (measured `.btn`/`.form-control`
  // transition `.15s ease-in-out`). Exact step ramp not separately tokenised; kept
  // aligned with the base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "200ms",
    slow: "320ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Vidéotron-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (VIDÉOTRON) --------------------------------------
  // Vidéotron field/divider strokes measured at 1px solid #bebeb7; warm divider
  // #e0e0da. thick 2px kept for emphasis.
  borderWidth: {
    none: "0",
    thin: "1px", // measured .form-control + divider stroke
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Vidéotron control density. Measured CTA = padding .7rem 3rem, .875rem/700
  // uppercase label; .form-control = padding .5rem 1rem, 1rem text → ~40px control.
  // md targets a comfortable ~44px control; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.625rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0.75rem", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1rem" }
  },
  // Vidéotron typography = "Nunito Sans" (body) + condensed display ("Urbanist" /
  // legacy "BlenderPro"). CTA labels are the measured UPPERCASE, 700-weight,
  // .875rem display face with 1px letter-spacing; field text is Nunito Sans 1rem in
  // warm slate. Base type is 1rem.
  typography: {
    control: { family: "'Urbanist', 'BlenderPro', Arial, sans-serif", size: "0.875rem", weight: "700", lineHeight: "1.5", letterSpacing: "1px", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Nunito Sans', Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Nunito Sans', Arial, sans-serif", size: "1rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Vidéotron links: charcoal/near-black, underline on hover (measured anchor
    // `text-decoration:none` at rest, underline on hover).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.65", // Vidéotron disables controls at .65 (measured Bootstrap-grade .btn:disabled opacity)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" }, // measured .form-control/.btn transition .15s ease-in-out
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // VIDÉOTRON FOCUS = a YELLOW RING. The brand sheet focuses controls with a
  // measured `box-shadow:0 0 0 .2rem rgba(255,210,0,.5)` Bootstrap-grade glow in
  // the brand yellow. We encode that as a 3px (≈ .2rem) ring in the brand yellow —
  // the focus hue IS the brand yellow, matching the real technique.
  focus: {
    strategy: "ring",
    width: "3px", // ≈ .2rem measured ring spread
    offset: "0",
    color: vtColor.yellow[500], // #ffd200 — brand-yellow focus glow
    inset: "0"
  },
  // VIDÉOTRON form fields are BOXED (outline): a white fill with a thin warm-grey
  // stroke (measured `.form-control` `1px solid #bebeb7`) and a 4px radius. `style:
  // "outline"` makes the builder draw four equal borders from `surface.default` +
  // `border.subtle`. The native <select> chevron is redrawn in the charcoal ink
  // with a 48px right gutter (measured `.form-control` `padding-right:3rem`,
  // appearance: none).
  field: {
    style: "outline",
    fillBg: vtColor.white, // #ffffff
    underlineColor: vtColor.grey[350], // #bebeb7 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%232a2a27' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 1rem center",
    selectPaddingRight: "3rem"
  },
  // Vidéotron cards: white surface, mildly rounded (8px medium), a warm grey border
  // and a faint warm grey hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: vtColor.grey[150] // #f2f2f0 faint warm grey hover
  },
  // Vidéotron secondary button = OUTLINED: transparent fill, yellow border, charcoal
  // text, yellow fill on hover (measured `.btn-outline-*` → yellow border + yellow
  // fill on hover).
  buttonSecondary: {
    background: "transparent",
    border: vtColor.yellow[500], // #ffd200 yellow stroke
    hoverBackground: vtColor.yellow[500] // #ffd200 fill on hover
  },
  // Vidéotron tabs / sub-nav: active tab = charcoal bold label with a yellow bottom
  // indicator (the brand yellow accent bar), transparent fill.
  tabs: {
    activeText: vtColor.ink.default, // #2a2a27 active label (charcoal)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px (Vidéotron base type)
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // yellow underline on the bottom edge
    indicatorMode: "border" // a real bottom border indicator
  },
  // Vidéotron pagination: borderless charcoal link text; active page = filled yellow
  // box (the brand fill) with charcoal text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: vtColor.ink.default, // #2a2a27 link text (charcoal)
    activeBackground: vtColor.yellow[500], // #ffd200 filled active page (brand yellow)
    activeText: vtColor.ink.default, // #2a2a27 charcoal on yellow
    activeBorderWidth: "0",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Vidéotron breadcrumb: charcoal links, warm grey trail, charcoal current page,
  // warm grey separators.
  breadcrumb: {
    linkText: vtColor.ink.default, // #2a2a27
    text: vtColor.ink.secondary, // #575754 trail text
    currentText: vtColor.ink.default, // #2a2a27 current page (charcoal)
    separator: vtColor.grey[500], // #9b9b95
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "700" // current page is emphasised
  },
  // Vidéotron notice / alert: a tinted box with a coloured left filet matching the
  // severity (the measured success-green / danger-orange / warning-amber tones).
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
  // Vidéotron accordion / disclosure: a bold charcoal summary trigger, mildly
  // rounded, warm-grey-separated.
  accordion: {
    text: vtColor.ink.default, // #2a2a27 summary label (charcoal)
    paddingBlock: "1rem", // 16px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "700", // Vidéotron summary triggers are bold
    lineHeight: "1.5rem" // 24px
  },
  // Vidéotron tag: a small PILL chip with a faint warm grey fill and charcoal ink.
  tag: {
    radius: "999px", // chips round fully
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: vtColor.grey[150], // #f2f2f0 faint warm grey fill
    neutralText: vtColor.ink.default // #2a2a27 charcoal
  },
  // Vidéotron badge: a small filled badge — brand yellow fill / charcoal text.
  badge: {
    radius: "999px", // pill
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "700",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: vtColor.yellow[500], // #ffd200 brand yellow
    infoText: vtColor.ink.default // #2a2a27 charcoal on yellow
  },
  // Vidéotron checkbox/radio label: regular charcoal type at base size.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: vtColor.ink.default // #2a2a27 charcoal
  },
  // Vidéotron search input: a boxed warm-grey-stroked field, base type.
  search: {
    paddingBlock: "0.5rem", // 8px (measured .form-control)
    paddingInline: "1rem", // 16px (measured .form-control)
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Vidéotron toggle / switch label: regular charcoal type.
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.5rem", // 24px
    textColor: vtColor.ink.default // #2a2a27 charcoal
  }
} as const;

// --- semantic (VIDÉOTRON-specific role mapping) -----------------------------
const semantic = {
  surface: {
    default: vtColor.white, // #ffffff white
    subtle: vtColor.grey[150], // #f2f2f0 subtle warm surface
    raised: vtColor.white, // #ffffff white
    inverse: vtColor.ink.default, // #2a2a27 charcoal reversed surface (brand dark)
    overlay: "rgb(0 0 0 / 0.6)" // modal backdrop
  },
  text: {
    primary: vtColor.ink.default, // #2a2a27 charcoal (primary text + headings)
    secondary: vtColor.ink.secondary, // #575754 secondary text
    muted: vtColor.grey[500], // #9b9b95 muted / placeholder text
    inverse: vtColor.white, // white on dark/yellow surfaces
    link: vtColor.ink.black // #050504 link (near-black)
  },
  border: {
    subtle: vtColor.grey[200], // #e0e0da divider
    strong: vtColor.grey[350], // #bebeb7 field / stronger control border
    interactive: vtColor.yellow[500] // #ffd200 brand yellow (interactive accent)
  },
  action: {
    primary: vtColor.yellow[500], // #ffd200 THE Vidéotron yellow CTA
    primaryHover: vtColor.yellow[600], // #e0b400 deep yellow hover/active
    primaryText: vtColor.ink.default, // #2a2a27 charcoal text on yellow
    secondary: vtColor.grey[150], // #f2f2f0 warm grey secondary surface
    secondaryHover: vtColor.grey[200], // #e0e0da
    secondaryText: vtColor.ink.default, // #2a2a27 charcoal secondary label
    danger: vtColor.system.danger // #cc6002 warm danger (orange-brown)
  },
  feedback: {
    success: vtColor.system.success, // #0b8339
    warning: vtColor.system.warning, // #ff9c0a
    error: vtColor.system.danger, // #cc6002
    info: vtColor.system.info // #0689d8
  },
  status: {
    pending: vtColor.system.warning, // #ff9c0a
    processing: vtColor.system.info, // #0689d8
    completed: vtColor.system.success, // #0b8339
    failed: vtColor.system.danger // #cc6002
  },
  // Categorical data-vis palette. Vidéotron does not publish a single categorical
  // token list; the eight categories below are seeded from the measured brand hexes
  // (yellow lead, charcoal, success green, warning amber, danger orange, info blue,
  // bright green, muted grey) to give a legible brand-true scale.
  // See MAPPING.md, "à confirmer" — this is an assembled scale.
  data: {
    category1: vtColor.yellow[500], // #ffd200 brand yellow
    category2: vtColor.ink.default, // #2a2a27 charcoal
    category3: vtColor.system.success, // #0b8339 success green
    category4: vtColor.system.warning, // #ff9c0a warning amber
    category5: vtColor.system.danger, // #cc6002 danger orange
    category6: vtColor.system.info, // #0689d8 info blue
    category7: vtColor.system.successBright, // #2eb800 bright green
    category8: vtColor.grey[500] // #9b9b95 muted grey
  }
} as const;

/**
 * The VIDÉOTRON theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Vidéotron-specific (yellow-on-charcoal telecom)
 * values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so Vidéotron's yellow CTA, charcoal
 * ink, 4px corners, boxed warm fields and yellow focus ring reach the components
 * (buttons, tabs, pagination, chat bubbles…), not just the elements that read
 * semantic vars directly.
 */
export const videotronTheme: TenantTheme = {
  id: "videotron",
  label: "Vidéotron",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default videotronTheme;
