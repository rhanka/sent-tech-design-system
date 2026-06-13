import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * NATIONAL BANK OF CANADA (bnc.ca / nbc.ca — Banque Nationale du Canada, the
 * Montréal-HQ chartered bank) theme for the Sentropic token structure.
 *
 * National Bank's public site is an Adobe Experience Manager build whose brand
 * layer (`theme.min.css`) uses LITERAL hex values (no CSS custom properties).
 * Every value below is MEASURED from the live storefront's stylesheets, fetched
 * directly via curl (the brand `theme.min.css`, the React `clientlib-base.min.css`
 * and `clientlib.min.css`): the brand button family (`btnRTE1/2/3`), the modern
 * `input` / MUI `MuiTextField` field rules, `@font-face` family names, and the
 * frequency-ranked hex palette of the whole brand sheet. We reference font
 * *names* only ("Gilroy" body + "Korolev" display — the brand's proprietary sans
 * + condensed display faces, measured from the site's `@font-face` declarations),
 * never font binaries. Sources and the full mapping are in MAPPING.md.
 *
 * National Bank's identity is a CONFIDENT RED-ON-NAVY bank system: the signature
 * NATIONAL BANK RED (#e41c23 — the single most-used brand hex, 108 occurrences)
 * drives every primary CTA and brand accent; a deep NAVY (#00314d — the most-used
 * text colour, 240 `color:` occurrences) is the primary ink and heading colour;
 * surfaces are WHITE on faint grey; corners are FULLY ROUNDED on buttons (the
 * measured CTA radius is 58px → pill), form fields are BOXED outlines (white fill,
 * thin grey #e1e1e1 stroke, 6px radius) and focus is an accessible BLUE
 * (#1572c5 — the measured MUI focused-field outline) — deliberately a different
 * hue from the red brand so the focus indicator never blends into a red control.
 * Where Sentropic needs a role National Bank does not publish, the closest
 * measured hex is used and the choice is noted "à confirmer" in MAPPING.md.
 *
 * National Bank colour reference (measured hex, brand theme.min.css):
 *   Brand red (action / brand)         #e41c23   btnRTE3 background / 108× brand hex — THE National Bank red
 *   Brand red hover / active           #be171d   btnRTE3:hover / btnRTE-error
 *   Brand red alt (hover variant)      #cb191e   btnRTE1:hover background
 *   Brand red bright (border accent)   #eb212e   border/accent red
 *   Deep navy (text primary / ink)     #00314d   primary text + headings (240× color:)
 *   Darkest navy (btn ink)             #001e2e   btnRTE3 base font colour
 *   Slate-blue secondary ink           #425865   secondary heading / accent ink (56× color:)
 *   Steel-blue (links / focus alt)     #1572c5   modern focused-field outline / link accent
 *   Deep blue (link)                   #105797   anchor / link accent
 *   Ink near-black                     #303030   body dark ink (29× color:)
 *   Ink darkest                        #121212   strongest ink / dark surface
 *   Secondary / muted text             #565656   secondary text (107× color:)
 *   White (surface default)            #ffffff   surface default / CTA text
 *   Page grey (subtle surface)         #f5f5f5   faint page grey
 *   Faint grey (subtle surface alt)    #f1f1f1   faint neutral fill
 *   Field border / divider             #e1e1e1   modern input stroke (1px)
 *   Border grey (legacy field)         #d2d2d2   secondary control border
 *   Focus / steel blue                 #1572c5   accessible focused-field outline
 *   Success green                      #3c763d   alert-success text (Bootstrap-grade, AA on white)
 *   Success bright                     #01b64b   confirmation accent green
 *   Warning amber ink                  #8a6d3b   alert-warning text
 *   Danger red ink                     #a94442   alert-danger text
 *   Danger red strong                  #d0011b   strong error red
 *   Info blue ink                      #31708f   alert-info text
 */

// --- NATIONAL BANK raw colour palette (measured hex, brand theme.min.css) -----
const nbcColor = {
  // The brand IS the National Bank red. Used for the brand mark, every primary
  // CTA (btnRTE3) and red accents.
  red: {
    500: "#e41c23", // btnRTE3 background / 108× brand hex — THE National Bank red
    hover: "#cb191e", // btnRTE1:hover background (slightly darker red on hover)
    600: "#be171d", // btnRTE3:hover / active deepening
    400: "#eb212e", // bright red border/accent variant
    700: "#d0011b", // strong error red
    100: "#fdecec" // faint red tint (derived for soft fills — à confirmer)
  },
  // Deep navy ink — National Bank's second pillar. Primary text + headings.
  navy: {
    500: "#00314d", // primary text / headings (240× color:) — THE National Bank navy
    600: "#001e2e", // darkest navy (btnRTE3 base ink)
    slate: "#425865" // slate-blue secondary heading / accent ink (56× color:)
  },
  // Steel / link blues (links + the accessible focused-field outline).
  blue: {
    focus: "#1572c5", // modern MUI focused-field outline — accessible focus blue
    link: "#105797" // anchor / link accent (deep blue)
  },
  // Neutral ink scale (National Bank never uses pure black for body text).
  ink: {
    default: "#303030", // body dark ink (29× color:)
    secondary: "#565656", // secondary / muted text (107× color:)
    contrast: "#121212" // strongest ink / dark surface
  },
  // Grey neutral scale (faint page greys + field/divider strokes).
  grey: {
    50: "#f8f8f8", // faintest page grey
    100: "#f5f5f5", // page grey
    150: "#f1f1f1", // faint neutral fill
    200: "#e1e1e1", // modern input stroke / divider (1px)
    300: "#d2d2d2" // secondary control border
  },
  white: "#ffffff", // surface default / CTA text
  // System / status colours (measured alert text/border hexes).
  system: {
    error: "#d0011b", // strong error red (form-error / danger fill ground)
    errorInk: "#a94442", // alert-danger text
    success: "#3c763d", // alert-success text (AA on white)
    successBright: "#01b64b", // confirmation accent green
    warning: "#8a6d3b", // alert-warning text (AA-grade amber)
    info: "#31708f" // alert-info text
  }
} as const;

// --- foundation (NATIONAL BANK-specific values) -----------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (action / primary / link). National Bank's
    // PRIMARY ACTION is RED, so the action steps are mapped to the red scale;
    // the lightest step is the faint red tint.
    blue: {
      10: nbcColor.red[100], // #fdecec faint red tint
      60: nbcColor.red[500], // #e41c23 THE National Bank red (primary action)
      80: nbcColor.red[600] // #be171d deep red (hover/active ground)
    },
    // Sentropic "cyan" accent slot. National Bank's cool accent is the steel/navy
    // blue family; mapped here so a distinct cool accent survives (à confirmer).
    cyan: {
      10: "#eef6fb", // faint steel tint (measured panel tint)
      50: nbcColor.blue.focus, // #1572c5 steel blue accent
      70: nbcColor.navy[500] // #00314d deep navy
    },
    // Sentropic "slate" neutral family mapped onto the National Bank navy ink and
    // grey ramp.
    slate: {
      0: nbcColor.white, // #ffffff white
      10: nbcColor.grey[100], // #f5f5f5 page grey
      20: nbcColor.grey[200], // #e1e1e1 divider / subtle border
      60: nbcColor.ink.secondary, // #565656 secondary text
      80: nbcColor.navy[500], // #00314d primary text (deep navy)
      90: nbcColor.ink.contrast // #121212 strongest ink
    },
    feedback: {
      success: nbcColor.system.success,
      warning: nbcColor.system.warning,
      error: nbcColor.system.error,
      info: nbcColor.system.info
    }
  },
  // National Bank serves its proprietary "Gilroy" sans across body/UI/controls and
  // its "Korolev" condensed display face on headings (both measured from the
  // site's `@font-face` declarations: Gilroy-Light/Regular/Medium/SemiBold/Bold,
  // Korolev-Medium/Bold). We reference the family NAMES only, with the brand's own
  // Arial fallback chain. Mono is not part of National Bank — the Sentropic mono
  // stack is kept.
  font: {
    sans: "'Gilroy', 'Gilroy-Regular', Arial, sans-serif",
    display: "'Korolev', 'Korolev-Medium', 'Gilroy', Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // National Bank spacing: the brand sheet is a 4/8px-based ramp (measured button
  // padding 10px 24px, field padding 0 10px). Aligned to the Sentropic step keys.
  spacing: {
    0: "0",
    1: "0.25rem", // 4px
    2: "0.5rem", // 8px
    3: "0.75rem", // 12px
    4: "1rem", // 16px
    6: "1.5rem", // 24px (measured CTA inline padding)
    8: "2rem", // 32px
    12: "3rem", // 48px
    16: "4rem" // 64px
  },
  // National Bank rounds its BUTTONS FULLY (measured btnRTE2/3 `border-radius:58px`
  // → pill) but keeps fields and cards mildly rounded (measured modern input
  // `border-radius:6px`, MUI field 4px). Controls (input) use 6px; the pill is the
  // brand button signature.
  radius: {
    none: "0", // square (legacy form-control border-radius:0)
    sm: "2px", // measured small chips
    md: "6px", // measured modern input/control radius
    lg: "8px", // cards / larger surfaces (measured 8px)
    pill: "999px" // btnRTE2/3 fully-rounded button (measured 58px → pill)
  },
  // National Bank elevation (measured button/card box-shadows: the CTA hover
  // `0 4px 8px 0 rgba(0,0,0,0.1)`, field inset `inset 0 1px 3px rgba(12,3,3,0.14)`).
  // Mapped to the three Sentropic slots.
  shadow: {
    subtle: "0 1px 3px rgb(0 0 0 / 0.12)",
    medium: "0 4px 8px rgb(0 0 0 / 0.10)", // measured CTA hover shadow
    floating: "0 8px 24px rgb(0 0 0 / 0.16), 0 2px 4px rgb(0 0 0 / 0.10)"
  },
  // National Bank transitions are short and standard (measured field transition
  // `border-color/box-shadow ease-in-out .15s`). Exact step ramp not separately
  // tokenised; kept aligned with the base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "200ms",
    slow: "320ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not National Bank-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (NATIONAL BANK) ----------------------------------
  // National Bank modern field/divider strokes measured at 1px solid #e1e1e1;
  // brand accent borders 1px #e41c23. thick 2px kept for emphasis.
  borderWidth: {
    none: "0",
    thin: "1px", // measured input + divider stroke
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // National Bank control density. Measured CTA = ~40px tall (padding 10px 24px,
  // 16px/Gilroy-Medium label); modern input = 40px (padding 0 10px, 16px text).
  // md targets a comfortable ~44px control; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.625rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0.75rem", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1rem" }
  },
  // National Bank typography = "Gilroy" (body/controls) + "Korolev" (display).
  // CTA labels are medium-weight Gilroy at 16px with a measured .5px letter
  // spacing; field text is Gilroy-SemiBold 16px navy. Base type is 16px.
  typography: {
    control: { family: "'Gilroy', 'Gilroy-Medium', Arial, sans-serif", size: "1rem", weight: "500", lineHeight: "1.125", letterSpacing: "0.5px", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Gilroy', 'Gilroy-Regular', Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.25", letterSpacing: "0.3px", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Gilroy', 'Gilroy-SemiBold', Arial, sans-serif", size: "1rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // National Bank links: steel/deep blue, underline on hover (measured anchor
    // `text-decoration:none` at rest, underline on the brand red text buttons on
    // hover — links resolve to the blue accent).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.4", // National Bank disables controls at ≈ 40% (measured greyed states)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" }, // measured field transition .15s ease-in-out
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // NATIONAL BANK FOCUS = an accessible BLUE OUTLINE. The legacy brand sheet uses
  // the Bootstrap focus ring; the modern React layer focuses fields with a
  // measured steel-blue border `#1572c5`. We encode a 2px blue outline — the focus
  // hue is deliberately blue (not the red brand) so the indicator never blends
  // into a red control.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: nbcColor.blue.focus, // #1572c5 — accessible steel-blue focus indicator
    inset: "0"
  },
  // NATIONAL BANK form fields are BOXED (outline): a white fill with a thin grey
  // stroke (measured modern input `1px solid #e1e1e1`) and a 6px radius. `style:
  // "outline"` makes the builder draw four equal borders from `surface.default` +
  // `border.subtle`. The native <select> chevron is redrawn in the deep navy ink
  // with a 36px right gutter (appearance: none).
  field: {
    style: "outline",
    fillBg: nbcColor.white, // #ffffff
    underlineColor: nbcColor.grey[200], // #e1e1e1 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2300314d' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.25rem"
  },
  // National Bank cards: white surface, mildly rounded (8px), a soft grey border
  // and a faint grey hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: nbcColor.grey[100] // #f5f5f5 faint grey hover
  },
  // National Bank secondary button = OUTLINED: transparent fill, red text + red
  // border, faint red fill (white text) on hover (measured btnRTE2).
  buttonSecondary: {
    background: "transparent",
    border: nbcColor.red[500], // #e41c23 red stroke (btnRTE2 border)
    hoverBackground: nbcColor.red[500] // #e41c23 fill on hover (btnRTE2:hover → red bg, white text)
  },
  // National Bank tabs / sub-nav: active tab = red bold label with a red bottom
  // indicator (the brand red accent bar, measured 2px red under-rule), transparent
  // fill.
  tabs: {
    activeText: nbcColor.red[500], // #e41c23 active label (brand red)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px (National Bank base type)
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // red underline on the bottom edge
    indicatorMode: "border" // a real bottom border indicator
  },
  // National Bank pagination: borderless blue link text; active page = filled red
  // pill (the brand fill) with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: nbcColor.blue.link, // #105797 link text
    activeBackground: nbcColor.red[500], // #e41c23 filled active page (brand red)
    activeText: nbcColor.white, // white on red
    activeBorderWidth: "0",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // National Bank breadcrumb: blue links, grey trail, navy current page, grey
  // separators.
  breadcrumb: {
    linkText: nbcColor.blue.link, // #105797
    text: nbcColor.ink.secondary, // #565656 trail text
    currentText: nbcColor.navy[500], // #00314d current page (navy)
    separator: nbcColor.ink.secondary, // #565656
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "600" // current page is emphasised
  },
  // National Bank notice / alert: a tinted box with a coloured left filet matching
  // the severity (the measured alert-success/-danger/-warning/-info tones).
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
  // National Bank accordion / disclosure: a semibold navy summary trigger, mildly
  // rounded, grey-separated.
  accordion: {
    text: nbcColor.navy[500], // #00314d summary label (navy)
    paddingBlock: "1rem", // 16px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "600", // National Bank summary triggers are semibold
    lineHeight: "1.5rem" // 24px
  },
  // National Bank tag: a small PILL chip with a faint grey fill and navy ink.
  tag: {
    radius: "999px", // National Bank chips round fully (pill button language)
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: nbcColor.grey[150], // #f1f1f1 faint grey fill
    neutralText: nbcColor.navy[500] // #00314d navy
  },
  // National Bank badge: a small filled badge — brand red fill / white text.
  badge: {
    radius: "999px", // pill
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "600",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: nbcColor.red[500], // #e41c23 brand red
    infoText: nbcColor.white // white on red
  },
  // National Bank checkbox/radio label: regular navy type at base size.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: nbcColor.navy[500] // #00314d navy
  },
  // National Bank search input: a boxed grey-stroked field, base type.
  search: {
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // National Bank toggle / switch label: regular navy type.
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.5rem", // 24px
    textColor: nbcColor.navy[500] // #00314d navy
  }
} as const;

// --- semantic (NATIONAL BANK-specific role mapping) -------------------------
const semantic = {
  surface: {
    default: nbcColor.white, // #ffffff white
    subtle: nbcColor.grey[100], // #f5f5f5 page grey
    raised: nbcColor.white, // #ffffff white
    inverse: nbcColor.navy[500], // #00314d deep navy reversed surface (brand dark)
    overlay: "rgb(0 0 0 / 0.6)" // modal backdrop
  },
  text: {
    primary: nbcColor.navy[500], // #00314d deep navy (primary text + headings)
    secondary: nbcColor.ink.secondary, // #565656 secondary text
    muted: nbcColor.ink.secondary, // #565656
    inverse: nbcColor.white, // white on dark/red surfaces
    link: nbcColor.blue.link // #105797 link blue
  },
  border: {
    subtle: nbcColor.grey[200], // #e1e1e1 divider / input stroke
    strong: nbcColor.grey[300], // #d2d2d2 stronger control border
    interactive: nbcColor.red[500] // #e41c23 brand red (interactive accent)
  },
  action: {
    primary: nbcColor.red[500], // #e41c23 THE National Bank red CTA
    primaryHover: nbcColor.red[600], // #be171d red hover/active
    primaryText: nbcColor.white, // white text on red
    secondary: nbcColor.grey[150], // #f1f1f1 grey secondary surface
    secondaryHover: nbcColor.grey[200], // #e1e1e1
    secondaryText: nbcColor.navy[500], // #00314d navy secondary label
    danger: nbcColor.system.error // #d0011b strong error red
  },
  feedback: {
    success: nbcColor.system.success, // #3c763d
    warning: nbcColor.system.warning, // #8a6d3b
    error: nbcColor.system.error, // #d0011b
    info: nbcColor.system.info // #31708f
  },
  status: {
    pending: nbcColor.system.warning, // #8a6d3b
    processing: nbcColor.system.info, // #31708f
    completed: nbcColor.system.success, // #3c763d
    failed: nbcColor.system.error // #d0011b
  },
  // Categorical data-vis palette. National Bank does not publish a single
  // categorical token list; the eight categories below are seeded from the
  // measured brand hexes (red lead, navy, steel/link blues, slate, success green,
  // amber, secondary ink) to give a legible brand-true scale.
  // See MAPPING.md, "à confirmer" — this is an assembled scale.
  data: {
    category1: nbcColor.red[500], // #e41c23 brand red
    category2: nbcColor.navy[500], // #00314d deep navy
    category3: nbcColor.blue.focus, // #1572c5 steel blue
    category4: nbcColor.navy.slate, // #425865 slate-blue
    category5: nbcColor.blue.link, // #105797 deep blue
    category6: nbcColor.system.success, // #3c763d success green
    category7: nbcColor.system.warning, // #8a6d3b amber
    category8: nbcColor.ink.secondary // #565656 secondary ink
  }
} as const;

/**
 * The NATIONAL BANK theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry National Bank-specific (red-on-navy
 * bank) values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so National Bank's red CTA, navy
 * ink, pill buttons, boxed fields and accessible blue focus reach the components
 * (buttons, tabs, pagination, chat bubbles…), not just the elements that read
 * semantic vars directly.
 */
export const nationalBankTheme: TenantTheme = {
  id: "national-bank",
  label: "National Bank",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default nationalBankTheme;
