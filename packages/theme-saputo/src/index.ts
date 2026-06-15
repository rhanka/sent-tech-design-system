import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * SAPUTO (saputo.com — Saputo Inc., the Montréal-HQ global dairy company) theme
 * for the Sentropic token structure.
 *
 * Saputo's corporate site is a Sitecore build whose brand stylesheet
 * (`mainmin.css`) uses LITERAL hex values (no CSS custom properties). Every value
 * below is MEASURED from the live site's stylesheet, fetched directly via curl
 * (the homepage `https://www.saputo.com/en` and its `mainmin.css` bundle): the
 * brand button rules (`.cta-container .button`, `button.secondary-cta`), the
 * `input[type=text]` / `select` field rules, `font-family` declarations, and the
 * frequency-ranked hex palette of the whole sheet. We reference font *names* only
 * ("Open Sans" body/UI/headings + "FlamaSemicondensed" hero display, both measured
 * from the site's `font-family` declarations), never font binaries. Sources and the
 * full mapping are in MAPPING.md.
 *
 * Saputo's identity is a CONFIDENT RED-ON-WHITE food brand: the signature SAPUTO
 * RED (#e31c23 — the single most-used brand hex, 88 occurrences) drives every
 * primary CTA, link and brand accent; a scarlet SECONDARY RED (#e33225 — 64×) is
 * the accent variant (the 4px menu under-rule, "new" chips, secondary borders);
 * primary ink is PURE BLACK (#000 — Saputo sets body text and headings in black);
 * surfaces are WHITE on faint grey; headings are BOLD UPPERCASE Open Sans; corners
 * are SQUARISH (measured CTA `border-radius: 3px`, content `5px`; only chips round
 * fully to a pill); form fields are BOXED outlines (transparent→white fill, a 1px
 * black stroke, 4px radius) and focus is encoded as a RED OUTLINE (the brand red
 * #e31c23 — Saputo's native field focus is a soft grey border + glow and a
 * `1px dotted` outline on choice controls; we surface the brand red as a clearly
 * visible accessible focus indicator). Where Sentropic needs a role Saputo does
 * not publish, the closest measured hex is used and the choice is noted
 * "à confirmer" in MAPPING.md.
 *
 * Saputo colour reference (measured hex, mainmin.css):
 *   Brand red (action / brand / link)   #e31c23   .button background / 88× brand hex — THE Saputo red
 *   Brand red hover / active            #d3281b   .cta-container .button:hover (rgb 211,40,27)
 *   Scarlet secondary red (accent)      #e33225   menu 4px under-rule / chips / secondary borders (64×)
 *   Steel-blue (secondary CTA / link)   #0464ac   alternate CTA fill / link accent
 *   Deep wine (dark surface ground)     #4f0710   dark promo band background
 *   Pure black (text primary / ink)     #000000   primary text + headings (body color:#000)
 *   Dark grey (secondary text)          #333333   secondary / caption text (26× color:#333)
 *   Mid grey (muted text)               #666666   muted text
 *   Light grey (muted / placeholder)    #999999   placeholder / faint text
 *   Stone / taupe (warm neutral)        #988b83    warm stone accent neutral
 *   White (surface default)             #ffffff   surface default / CTA text
 *   Faint grey (subtle surface)         #f5f5f5   faint page grey
 *   Light grey (subtle surface alt)     #ededed   light neutral fill (chips, 14×)
 *   Border grey (divider)               #e5e5e5   divider / hairline (9×)
 *   Border grey alt (field/divider)     #dedede   secondary divider
 *   Success green                       #5d993c   confirmation / success fill (AA on white)
 *   Success bright                      #04aa6d   bright confirmation accent green
 *   Info blue                           #0464ac   info / steel-blue accent
 *   Warning amber (derived, AA)         #8a6d00   accessible amber (no published warning hex)
 *   Danger red                          #e31c23   validation-error border / danger fill
 */

// --- SAPUTO raw colour palette (measured hex, mainmin.css) ------------------
const saputoColor = {
  // The brand IS the Saputo red. Used for the brand mark, every primary CTA
  // (.cta-container .button), links and red accents.
  red: {
    500: "#e31c23", // .button background / 88× brand hex — THE Saputo red
    hover: "#d3281b", // .cta-container .button:hover (measured rgb 211,40,27 → #d3281b)
    scarlet: "#e33225", // scarlet secondary red — menu 4px under-rule / chips / borders (64×)
    100: "#fdecec" // faint red tint (derived for soft fills — à confirmer)
  },
  // Steel-blue accent (alternate CTA fill / link accent).
  blue: {
    500: "#0464ac" // alternate CTA fill / steel-blue link accent
  },
  // Deep wine — Saputo's dark promo-band ground.
  wine: {
    900: "#4f0710" // dark promo band background
  },
  // Neutral ink scale. Saputo sets body text and headings in PURE BLACK.
  ink: {
    default: "#000000", // primary text / headings (body color:#000) — THE Saputo ink
    secondary: "#333333", // secondary / caption text (26× color:#333)
    muted: "#666666", // muted text
    faint: "#999999" // placeholder / faint text
  },
  // Warm stone / taupe accent neutral (measured #988b83).
  stone: "#988b83",
  // Grey neutral scale (faint page greys + divider strokes).
  grey: {
    50: "#f9f9f9", // faintest page grey
    100: "#f5f5f5", // page grey
    150: "#ededed", // light neutral fill (chips, 14×)
    200: "#e5e5e5", // divider / hairline (9×)
    300: "#dedede" // secondary divider
  },
  white: "#ffffff", // surface default / CTA text
  // System / status colours (measured fills + one derived AA amber).
  system: {
    error: "#e31c23", // validation-error border / danger fill (input-validation-error)
    success: "#5d993c", // success fill (AA on white)
    successBright: "#04aa6d", // bright confirmation accent green
    warning: "#8a6d00", // derived accessible amber (no published warning hex — à confirmer)
    info: "#0464ac" // steel-blue info accent
  }
} as const;

// --- foundation (SAPUTO-specific values) ------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (action / primary / link). Saputo's PRIMARY
    // ACTION is RED, so the action steps are mapped to the red scale; the lightest
    // step is the faint red tint.
    blue: {
      10: saputoColor.red[100], // #fdecec faint red tint
      60: saputoColor.red[500], // #e31c23 THE Saputo red (primary action)
      80: saputoColor.red.hover // #d3281b deep red (hover/active ground)
    },
    // Sentropic "cyan" accent slot. Saputo's cool accent is the steel-blue
    // (#0464ac); mapped here so a distinct cool accent survives (à confirmer).
    cyan: {
      10: "#e8ebf4", // faint steel/lilac tint (measured panel tint #e8ebf4)
      50: saputoColor.blue[500], // #0464ac steel-blue accent
      70: saputoColor.wine[900] // #4f0710 deep wine (dark ground)
    },
    // Sentropic "slate" neutral family mapped onto the Saputo black ink and grey ramp.
    slate: {
      0: saputoColor.white, // #ffffff white
      10: saputoColor.grey[100], // #f5f5f5 page grey
      20: saputoColor.grey[200], // #e5e5e5 divider / subtle border
      60: saputoColor.ink.muted, // #666666 muted text
      80: saputoColor.ink.default, // #000000 primary text (pure black)
      90: saputoColor.ink.default // #000000 strongest ink
    },
    feedback: {
      success: saputoColor.system.success,
      warning: saputoColor.system.warning,
      error: saputoColor.system.error,
      info: saputoColor.system.info
    }
  },
  // Saputo serves "Open Sans" across body/UI/controls AND headings (headings are
  // bold UPPERCASE Open Sans — measured `h1,h2,.headline{font-family:"Open Sans";
  // font-weight:bold;text-transform:uppercase}`); the large hero/banner display
  // face is "FlamaSemicondensed" (measured `.hero …{font-family:"FlamaSemicondensed"}`).
  // We reference family NAMES only. Mono is not part of Saputo — the Sentropic mono
  // stack is kept.
  font: {
    sans: "'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    display: "'FlamaSemicondensed', 'Open Sans', Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Saputo spacing: the brand sheet is a 4/8px-based ramp (measured CTA padding
  // 8px 30px / 7px 10px, field padding 0 12px). Aligned to the Sentropic step keys.
  spacing: {
    0: "0",
    1: "0.25rem", // 4px
    2: "0.5rem", // 8px (measured CTA inline padding)
    3: "0.75rem", // 12px (measured field inline padding)
    4: "1rem", // 16px
    6: "1.5rem", // 24px
    8: "2rem", // 32px
    12: "3rem", // 48px
    16: "4rem" // 64px
  },
  // Saputo corners are SQUARISH: measured CTA `border-radius:3px`, the most common
  // content radius `5px`, fields `4px`; only chips round fully (measured `17.5px` /
  // `100px` pill). md targets the field radius (4px); the pill is the chip signature.
  radius: {
    none: "0", // square (legacy controls border-radius:0)
    sm: "3px", // measured CTA radius
    md: "4px", // measured field/input radius
    lg: "12px", // measured card/menu radius (border-radius:12px)
    pill: "100px" // measured chip pill (border-radius:100px)
  },
  // Saputo elevation (measured menu/card box-shadows: dropdown `0 5px 5px
  // rgba(0,0,0,0.1)`, mega-menu `0 5px 10px rgba(0,0,0,0.15)`, focus glow
  // `0 0 10px 1px rgba(0,0,0,0.1)`). Mapped to the three Sentropic slots.
  shadow: {
    subtle: "0 1px 3px rgb(0 0 0 / 0.12)",
    medium: "0 5px 5px rgb(0 0 0 / 0.10)", // measured dropdown shadow
    floating: "0 5px 10px rgb(0 0 0 / 0.15), 0 2px 4px rgb(0 0 0 / 0.10)" // measured mega-menu shadow
  },
  // Saputo transitions are short and standard (measured `transition: all 250ms
  // ease` on CTAs, `300ms ease` on menus). Exact step ramp not separately
  // tokenised; kept aligned with the base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "250ms", // measured CTA transition
    slow: "320ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Saputo-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (SAPUTO) -----------------------------------------
  // Saputo divider strokes measured at 1px solid #e5e5e5; field stroke 1px solid
  // #000; brand accents 2px #e31c23 (CTA border). thick 2px = the brand CTA border.
  borderWidth: {
    none: "0",
    thin: "1px", // measured divider + field stroke
    thick: "2px" // measured CTA border (2px solid #e31c23)
  },
  borderStyle: { solid: "solid" },
  // Saputo control density. Measured CTA = ~40px tall (.cta-container .button
  // height:40px, padding 8px 30px, 13px bold uppercase Open Sans label); input =
  // 35px (padding 0 12px, 16px text). md targets a comfortable ~44px control;
  // sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.8125rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.875rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.875rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0.75rem", paddingInline: "2rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1rem" }
  },
  // Saputo typography = "Open Sans" everywhere. CTA labels are BOLD (700) UPPERCASE
  // Open Sans at ~13px (measured `.button{font-weight:bold;text-transform:uppercase}`);
  // field text is Open Sans 16px black; labels semibold. Base type ~15px.
  typography: {
    control: { family: "'Open Sans', Arial, sans-serif", size: "0.8125rem", weight: "700", lineHeight: "1.05", letterSpacing: "0", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Open Sans', Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.3", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Open Sans', Arial, sans-serif", size: "0.875rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Saputo links: brand red, bold, underline on hover (measured anchor
    // `a{font-weight:bold;color:#e31c23}`, no underline at rest).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.4", // Saputo disables controls at ≈ 40% (à confirmer — no published disabled token)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "250ms", easing: "ease" }, // measured CTA transition all 250ms ease
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // SAPUTO FOCUS = a brand-RED OUTLINE. Saputo's native field focus is a soft grey
  // border (`hsl(0,0%,77%)`) + glow `0 0 10px 1px rgba(0,0,0,0.1)`, and choice
  // controls use a `1px dotted` outline. We surface the brand red #e31c23 as a
  // clearly visible 2px accessible focus indicator (brand-forward).
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: saputoColor.red[500], // #e31c23 — Saputo brand red focus indicator
    inset: "0"
  },
  // SAPUTO form fields are BOXED (outline): a white fill with a thin black stroke
  // (measured `input[type=text]{border:1px solid #000;border-radius:4px}`) and a
  // 4px radius. `style: "outline"` makes the builder draw four equal borders from
  // `surface.default` + `border.subtle`. The native <select> chevron is redrawn in
  // black with a 36px right gutter (appearance: none — measured
  // `select{-webkit-appearance:none}`).
  field: {
    style: "outline",
    fillBg: saputoColor.white, // #ffffff
    underlineColor: saputoColor.ink.default, // #000000 (measured field stroke; kept for completeness)
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23000000' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.25rem"
  },
  // Saputo cards: white surface, mildly rounded (12px), a soft grey border and a
  // faint grey hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: saputoColor.grey[100] // #f5f5f5 faint grey hover
  },
  // Saputo secondary button = OUTLINED: white fill, red text + red border, fills
  // red with white text on hover (measured `button.secondary-cta{border-color:
  // #e31c23;color:#e31c23;background-color:#fff}` → red fill on hover).
  buttonSecondary: {
    background: saputoColor.white, // #ffffff white fill
    border: saputoColor.red[500], // #e31c23 red stroke
    hoverBackground: saputoColor.red[500] // #e31c23 fill on hover (white text)
  },
  // Saputo tabs / sub-nav: active tab = scarlet bold label with a scarlet bottom
  // indicator (the measured 2px/4px scarlet under-rule), transparent fill.
  tabs: {
    activeText: saputoColor.red.scarlet, // #e33225 active label (scarlet under-rule colour)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom", // scarlet underline on the bottom edge
    indicatorMode: "border" // a real bottom border indicator
  },
  // Saputo pagination: borderless red link text; active page = filled red pill
  // (the brand fill) with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: saputoColor.red[500], // #e31c23 link text (brand red)
    activeBackground: saputoColor.red[500], // #e31c23 filled active page (brand red)
    activeText: saputoColor.white, // white on red
    activeBorderWidth: "0",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Saputo breadcrumb: red links, grey trail, black current page, grey separators.
  breadcrumb: {
    linkText: saputoColor.red[500], // #e31c23
    text: saputoColor.ink.secondary, // #333333 trail text
    currentText: saputoColor.ink.default, // #000000 current page (black)
    separator: saputoColor.ink.muted, // #666666
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.25rem", // 20px
    currentWeight: "700" // current page is emphasised (bold)
  },
  // Saputo notice / alert: a tinted box with a coloured left filet matching the
  // severity.
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0.25rem", // 4px ::before accent bar (matches the 4px scarlet under-rule language)
    paddingTop: "1rem", // 16px
    paddingRight: "1rem", // 16px
    paddingBottom: "1rem", // 16px
    paddingLeft: "1.25rem", // 20px (clears the left filet)
    fontSize: "0.9375rem", // 15px (Saputo base type)
    lineHeight: "1.4rem"
  },
  // Saputo accordion / disclosure: a bold black summary trigger, mildly rounded,
  // grey-separated.
  accordion: {
    text: saputoColor.ink.default, // #000000 summary label (black)
    paddingBlock: "1rem", // 16px
    paddingInline: "1rem", // 16px
    fontSize: "0.9375rem", // 15px
    fontWeight: "700", // Saputo triggers are bold
    lineHeight: "1.4rem"
  },
  // Saputo tag: a small PILL chip with a faint grey fill and black ink (measured
  // chip `background-color:#ededed;border-radius:100px`).
  tag: {
    radius: "100px", // Saputo chips round fully (measured pill)
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: saputoColor.grey[150], // #ededed faint grey fill
    neutralText: saputoColor.ink.default // #000000 black
  },
  // Saputo badge: a small filled badge — scarlet fill / white text (the "new" chip).
  badge: {
    radius: "100px", // pill
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "700",
    lineHeight: "1.25rem", // 20px
    textTransform: "uppercase",
    minHeight: "1.25rem", // 20px
    infoBackground: saputoColor.red.scarlet, // #e33225 scarlet ("new" chip)
    infoText: saputoColor.white // white on scarlet
  },
  // Saputo checkbox/radio label: regular black type at base size.
  choice: {
    labelFontSize: "0.9375rem", // 15px
    labelLineHeight: "1.4rem",
    radioLineHeight: "1.4rem",
    labelColor: saputoColor.ink.default // #000000 black
  },
  // Saputo search input: a boxed black-stroked field, base type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px (measured search font-size:16px)
    lineHeight: "1.4rem"
  },
  // Saputo toggle / switch label: regular black type.
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.4rem",
    textColor: saputoColor.ink.default // #000000 black
  }
} as const;

// --- semantic (SAPUTO-specific role mapping) --------------------------------
const semantic = {
  surface: {
    default: saputoColor.white, // #ffffff white
    subtle: saputoColor.grey[100], // #f5f5f5 page grey
    raised: saputoColor.white, // #ffffff white
    inverse: saputoColor.wine[900], // #4f0710 deep wine reversed surface (brand dark ground)
    overlay: "rgb(0 0 0 / 0.5)" // measured modal backdrop rgba(0,0,0,.5)
  },
  text: {
    primary: saputoColor.ink.default, // #000000 pure black (primary text + headings)
    secondary: saputoColor.ink.secondary, // #333333 secondary text
    muted: saputoColor.ink.muted, // #666666 muted text
    inverse: saputoColor.white, // white on dark/red surfaces
    link: saputoColor.red[500] // #e31c23 link red (Saputo links are brand red)
  },
  border: {
    subtle: saputoColor.grey[200], // #e5e5e5 divider / hairline
    strong: saputoColor.grey[300], // #dedede stronger control border
    interactive: saputoColor.red[500] // #e31c23 brand red (interactive accent)
  },
  action: {
    primary: saputoColor.red[500], // #e31c23 THE Saputo red CTA
    primaryHover: saputoColor.red.hover, // #d3281b red hover/active
    primaryText: saputoColor.white, // white text on red
    secondary: saputoColor.grey[150], // #ededed grey secondary surface
    secondaryHover: saputoColor.grey[200], // #e5e5e5
    secondaryText: saputoColor.ink.default, // #000000 black secondary label
    danger: saputoColor.system.error // #e31c23 danger red
  },
  feedback: {
    success: saputoColor.system.success, // #5d993c
    warning: saputoColor.system.warning, // #8a6d00
    error: saputoColor.system.error, // #e31c23
    info: saputoColor.system.info // #0464ac
  },
  status: {
    pending: saputoColor.system.warning, // #8a6d00
    processing: saputoColor.system.info, // #0464ac
    completed: saputoColor.system.success, // #5d993c
    failed: saputoColor.system.error // #e31c23
  },
  // Categorical data-vis palette. Saputo does not publish a single categorical
  // token list; the eight categories below are seeded from the measured brand hexes
  // (red lead, scarlet, steel-blue, wine, success green, stone, secondary ink) to
  // give a legible brand-true scale. See MAPPING.md, "à confirmer".
  data: {
    category1: saputoColor.red[500], // #e31c23 brand red
    category2: saputoColor.blue[500], // #0464ac steel-blue
    category3: saputoColor.red.scarlet, // #e33225 scarlet
    category4: saputoColor.system.success, // #5d993c success green
    category5: saputoColor.wine[900], // #4f0710 deep wine
    category6: saputoColor.stone, // #988b83 warm stone
    category7: saputoColor.ink.secondary, // #333333 dark grey
    category8: saputoColor.ink.muted // #666666 mid grey
  }
} as const;

/**
 * The SAPUTO theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Saputo-specific (red-on-white food brand)
 * values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so Saputo's red CTA, black ink,
 * boxed fields, scarlet accents and squarish radii reach the components (buttons,
 * tabs, pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const saputoTheme: TenantTheme = {
  id: "saputo",
  label: "Saputo",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default saputoTheme;
