import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Getlink brand theme for the Sentropic token structure.
 *
 * Getlink SE publishes no tokenised design system; this package is a
 * MEASURED-CLONE mapping read from the public stylesheets of
 * `https://www.getlinkgroup.com/` — the theme stylesheet
 * `content/themes/getlink/resources/assets/css/style.css` (193843 bytes,
 * fetched 2026-09-25, bare curl 200 3/3) plus the Google Fonts `Open Sans`
 * link the homepage declares. Only public values and font *names* are
 * referenced — no font binaries. Sources and exact provenance are documented
 * in MAPPING.md. Where the brand publishes no usable value for a Sentropic
 * role, the closest coherent stand-in is used and flagged "à confirmer" both
 * inline and in MAPPING.md.
 *
 * Counting convention (counts below are per this convention): one occurrence
 * is one declaration of the hex (a property value containing the hex,
 * case-normalised; a rule carrying the hex twice counts twice), counted over
 * the BRAND region of style.css — the sheet expanded to one rule per line
 * (`sed 's/}/}/\\n/g'`, 2002 lines) minus the vendor ranges 1–66
 * (normalize.css v7.0.0 + base reset), 160–193 (slick + WordPress defaults),
 * 644–702 (Choices.js stock), 875–1186 (Video.js + skin) and 1992–1998
 * (Choices media + print) — 1524 brand rules. `var()` references are 0 for
 * every hex (the sheet declares no custom properties), so operability rests
 * on literal paintings. Short forms (`#000`, `#fff`, `#03f`, `#eee`, `#333`)
 * are transcribed expanded and the expansion is noted. `rgb()/rgba()/hsl()`
 * equivalents are reported separately in MAPPING.md, never merged into a hex
 * count. Whole-file counts equal brand-region counts for every promoted
 * LONG hex; the short forms `#fff` (145 whole-file / 108 brand) and `#000`
 * (62 / 50) also occur in vendor ranges (normalize, Choices, Video.js).
 *
 * Getlink colour reference (light theme):
 *   White (background default)        #ffffff   (surface default — `#fff`, 108)
 *   Light grey (header / `.grey`)     #f5f5f5   (surface subtle — 6)
 *   Pale blue tint (`.lblue`)         #e8f6fe   (light tint — 3)
 *   Hairline grey (tables, news)      #e9e9e9   (border subtle — 13)
 *   Input border grey                 #d9d9d9   (border strong — 8)
 *   Primary navy (buttons, links)     #00205b   (action primary — 29)
 *   Primary hover blue                #1a5c9e   (action hover — 4)
 *   Form / focus blue                 #004a93   (interactive / info — 12)
 *   Deep navy (chrome, menus)         #000050   (inverse surface — 33)
 *   Dark navy (secondary buttons)     #00072b   (buttonSecondary — 7)
 *   Footer navy                       #0d1630   (footer bg — 3)
 *   Body black                        #000000   (primary text — `#000`, 50)
 *   Secondary grey (breadcrumb)       #707070   (secondary text — 3)
 *   Meta grey (documents, prices)     #787878   (muted text — 8)
 *   Brand red (numbers, accents)      #e63027   (accent — 16)
 *   Error red (validation)            #f03130   (danger fill — 13)
 *   Focus red (`red` keyword)         #ff0000   (red keyword — 9)
 *   Success green (confirmation)      #61c05e   (measured — 4)
 *   Derived success green             #368434   (stop rule, 4 steps — à confirmer)
 *   Derived warning amber             #bd3f07   (stop rule, 3 steps — à confirmer)
 *   Derived error red (text)          #dd1110   (stop rule, 2 steps — à confirmer)
 */

// --- Getlink raw colour palette --------------------------------------------
const getlinkColor = {
  // Brand blues. The site's action colour is the deep corporate navy #00205b
  // (buttons, links, table headers, section fills); #000050 is the darker
  // chrome navy (menus, gradients, slider); #004a93 is the form blue (submit
  // buttons, input focus borders, checkboxes).
  brand: {
    primary: "#00205b", // `.btn-blue{background-color:#00205b}` (style.css:297, 29 declarations)
    hover: "#1a5c9e", // `.btn-blue:hover{background-color:#1a5c9e}` (:298, 4) + link hover (:115)
    form: "#004a93", // `.gform_button{background-color:#004a93}` (:420, 12) + input :focus border (:427)
    deep: "#000050", // `.blue{background-color:#000050}` (:135, 33) + header menu text (:1546)
    dark: "#00072b", // `.btn__border.header-btn{border-color:#00072b}` (:158, 7)
    footer: "#0d1630", // `.footer{background-color:#0d1630}` (:217, 3)
    navy: "#001d39", // `.cookie-banner__body{background:#001d39}` (:470, 2) + donut legend (:1337)
    sky: "#009fe3", // `.btn-white:hover{color:#009fe3}` (:296, 4) + history period-4 (:624)
    bright: "#0133ff", // date/share-price text + sub-menu fill (:291…, 13)
    vivid: "#0033ff", // `#03f` expanded — gradient stop (:96…, 14)
    indigo: "#101c6f", // gradient stop (:96…, 14)
    steel: "#003b75", // document shadow (:819, 1)
    ink: "#043c74", // news-title underline gradient (:1809, 4)
    filter: "#091537" // checked filter pill (:641, 1)
  },
  // Accent hues. #e63027 is the brand red accent (card numbers, accordion
  // titles, button decorations); #f03130 is the error red (invalid fields,
  // validation messages, timeline period-3); the `red` keyword is the site's
  // focus-outline colour; the rest are history-timeline period hues and
  // key-number gradient stops.
  accent: {
    red: "#e63027", // `.card-numbers .number{color:#e63027}` (:280, 16)
    error: "#f03130", // `.was-focused:invalid{border-color:#f03130}` (:428, 13)
    focus: "#ff0000", // `red` keyword — `a,button:focus-visible{outline:2px solid red}` (:89, 9)
    success: "#61c05e", // `.gform_confirmation_message{color:#61c05e}` (:447, 4)
    greenDeep: "#00825d", // gradient-green-dark stop (:722…, 3)
    mint: "#00eaa0", // gradient-green-dark stop (:722…, 3)
    jade: "#09be80", // gradient-green-dark stop (:722…, 3)
    orange: "#f75e19", // history period-6 (:630…, 3)
    amber: "#ff8b00", // gradient-orange-yellow stop (:721…, 3)
    rust: "#e15727", // gradient-orange-yellow stop (:721…, 3)
    sand: "#ffdf85", // gradient-orange-yellow stop (:721…, 3)
    pale: "#ffe2cf", // (:1)
    purple: "#8c3f91", // history period-5 (:628…, 3)
    magenta: "#9400ab", // gradient purple stop (:719…, 6)
    lilac: "#ac7cb5", // gradient-purple stop (:723…, 3)
    teal: "#63c1c8", // history period-2 (:618…, 3)
    tealAlt: "#64c1c7", // (:1 — 1 unit off #63c1c8, kept distinct)
    crimson: "#fb0000", // gradient-red-blue stop (:719…, 3)
    scarlet: "#fd0d2d", // gradient-red-dark stop (:720…, 3)
    wine: "#c70236", // gradient-red-dark stop (:720…, 3)
    plum: "#95023e", // gradient-red-dark stop (:720…, 3)
    electric: "#0000fb" // gradient-red-blue stop (:719…, 3)
  },
  // Neutral grey scale, light to dark. #000 (transcribed #000000) is the body
  // text black, painted as text in brand rules (breadcrumb current, labels,
  // dropdown items, newsletter); the brand declares no `body{color}` rule —
  // the inheritance path runs through normalize's `html{color:#000}`.
  grey: {
    0: "#ffffff", // `#fff` expanded (108)
    50: "#fcfbfb", // floating-menu body (:378, 1)
    55: "#fbfbfb", // header-lang pill (:1896, 1)
    100: "#fafafa", // accordion hover wash (:524, 3)
    150: "#f5f5f5", // `.grey{background-color:#f5f5f5}` (:136, 6) + header (:1877)
    200: "#efefef", // floating-menu close (:373, 6)
    250: "#eeeeee", // `#eee` expanded — `.bloc.grey` (:250, 9)
    300: "#ececec", // history wrapper rules (:564, 2)
    350: "#e9e9e9", // `.table{border:1px solid #e9e9e9}` (:534, 13)
    400: "#e2e2e2", // `.breadcrumb{background-color:#e2e2e2}` (:251, 5)
    450: "#d9d9d9", // input `border:1px solid #d9d9d9` (:426, 8)
    500: "#d4d4d4", // underline track (:153, 2)
    550: "#cacaca", // socialshare rules (:1390, 2)
    600: "#c2c2c2", // footer text on #0d1630 (:231, 7) + pagination current (:1372)
    650: "#a3a2a2", // floating-menu chevron (:385, 1)
    700: "#787878", // `.document__meta{color:#787878}` (:805, 8)
    750: "#707070", // `.breadcrumb{color:#707070}` (:251, 3)
    800: "#383838", // `.editor a{color:#383838}` (:398, 5)
    850: "#333333", // `#333` expanded — header-lang active (:1898, 2)
    900: "#000000" // `#000` expanded — `.gfield_label{color:#000}` (:425, 50)
  },
  // Light blue surface tints. Tied 3–3; #e8f6fe carries the site's own
  // "light blue" utility name (`.lblue`) and wins the tie.
  tint: {
    blue: "#e8f6fe", // `.lblue{background-color:#e8f6fe}` (:137, 3)
    blueAlt: "#e9f6fe" // `.history-post-full{background:#e9f6fe}` (:605, 3)
  },
  // System / status colours. The brand paints success green and error red as
  // text that fails 4.5:1 (#61c05e at 2.28, #f03130 at 4.05), and publishes no
  // warning amber: the text roles below are stop-rule derivations (chains in
  // MAPPING.md), while the measured reds stay on fill/accent roles.
  system: {
    success: "#368434", // derived from #61c05e (2.28), 4 steps, 4.66 (à confirmer)
    warning: "#bd3f07", // derived from #f75e19 (3.20), 3 steps, 5.42 (à confirmer)
    error: "#dd1110", // derived from #f03130 (4.05), 2 steps, 5.05 (à confirmer)
    info: "#004a93" // form blue, 8.75 on white (measured — see brand.form)
  }
} as const;

// --- foundation (Getlink-specific values) -----------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (primary action / link / interactive)
    // carries the Getlink corporate navy ramp.
    blue: {
      10: getlinkColor.tint.blue, // #e8f6fe palest blue tint
      60: getlinkColor.brand.primary, // #00205b primary action navy
      80: getlinkColor.brand.deep // #000050 deep chrome navy
    },
    // Sentropic "cyan" accent slot carries the Getlink light-blue accent
    // family (hover sky, form blue).
    cyan: {
      10: getlinkColor.tint.blue, // #e8f6fe palest blue tint
      50: getlinkColor.brand.sky, // #009fe3 hover sky (2.97 — accent fill only)
      70: getlinkColor.brand.form // #004a93 form blue
    },
    // Sentropic "slate" role family mapped onto the measured neutral scale.
    slate: {
      0: getlinkColor.grey[0], // white
      10: getlinkColor.grey[150], // #f5f5f5 header / `.grey` surface
      20: getlinkColor.grey[350], // #e9e9e9 hairline borders
      60: getlinkColor.grey[750], // #707070 secondary text (4.95 on white)
      80: getlinkColor.grey[900], // #000000 primary text
      90: getlinkColor.brand.deep // #000050 darkest brand navy
    },
    feedback: {
      success: getlinkColor.system.success,
      warning: getlinkColor.system.warning,
      error: getlinkColor.system.error,
      info: getlinkColor.system.info
    }
  },
  // Body text is Open Sans (the Google Fonts link the homepage declares,
  // weights 300–700; `body,html{font-family:Open Sans,sans-serif}` at
  // style.css:87). Headings are Outfit, self-hosted via @font-face and always
  // paired with a `serif` fallback (`font-family:Outfit,serif`), transcribed
  // verbatim. Campton labels form labels/legends (noted in MAPPING.md);
  // Obviously is @font-face-declared but never used in any rule. Mono is the
  // system stack. We reference the font *names* only, not binaries.
  font: {
    sans: "'Open Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Outfit', serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // The brand publishes no spacing scale (ad-hoc px/rem values); the Sentropic
  // base scale is reused explicitly.
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
  // Split personality, one token each: inputs are near-square (2px,
  // style.css:426), buttons are full pills (48px), cards are square (no radius
  // declared). `md` feeds both buttons and inputs in createComponent, so the
  // input value is transcribed (the square 0–3px family covers inputs, select,
  // tags and validation across 5 control types) and the pill CTA is recorded
  // as an unmapped signature in MAPPING.md.
  radius: {
    none: "0",
    sm: "2px", // small-control radius (input family)
    md: "2px", // input `border-radius:2px` (style.css:426)
    lg: "0", // cards declare no radius (`.card`, style.css:257)
    pill: "999px" // full pill (brand pills are 48px/50%/100% — equivalent)
  },
  // The brand's dominant shadow idiom is hard-offset (`5px 5px 0 0`) and rings
  // (`0 0 0 3px`); only two soft shadows exist and both are transcribed.
  shadow: {
    subtle: "0 1px 3px rgba(0,0,0,.22)", // donut-legend cursor (style.css:1332)
    medium: "0 5px 20px rgba(0,0,0,.1)", // dropdown menu (style.css:743)
    floating: "0 18px 45px rgba(0,0,0,.18)" // base floating geometry, brand black tint (à confirmer)
  },
  // `.3s` dominates transition/animation declarations (78 duration-token
  // occurrences in the brand region; `.2s` ×17, `.4s` ×13, `.5s` ×10 — one
  // occurrence is one duration token inside a transition/animation
  // declaration, shorthands and `*-delay`/`*-duration` longhands included).
  // Easing is the default `ease` (bare `.3s` + explicit `ease`).
  motion: {
    fast: "200ms", // `.2s` transcribed
    normal: "300ms", // `.3s` transcribed
    slow: "500ms", // `.5s` transcribed
    easing: "ease"
  },
  // z-index roles are not brand-specific; kept aligned with the Sentropic base
  // (the brand's header z-50 matches the base; its modal wrapper z-25 sits
  // under the header and is not transcribed — see MAPPING.md).
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Getlink) -----------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // input border (style.css:426)
    thick: "2px" // input :focus border-width (style.css:427)
  },
  borderStyle: { solid: "solid" },
  // Control density. Text inputs are 52px with 1rem inline padding and 14px
  // text (style.css:426/431); buttons run 48px. The brand publishes a single
  // control size, so sm/lg bracket md (à confirmer); gaps and minWidths are
  // unpublished at every size (à confirmer — square-minimum convention).
  density: {
    sm: { controlHeight: "2.75rem", paddingBlock: "0", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.875rem" },
    md: { controlHeight: "3.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "0.875rem" },
    lg: { controlHeight: "3.75rem", paddingBlock: "0", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "3.75rem", fontSize: "1rem" }
  },
  // Getlink typography: Open Sans for controls/fields/labels (inherited body
  // face), uppercase 600 buttons and 700 labels; links underline at rest and
  // clear on hover. Line-heights 1.75 are inherited from `body,html`
  // (style.css:87) where the rule declares none.
  typography: {
    control: { family: "'Open Sans', system-ui, sans-serif", size: "0.875rem", weight: "600", lineHeight: "1.75", letterSpacing: "0", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Open Sans', system-ui, sans-serif", size: "0.875rem", weight: "400", lineHeight: "1.75", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Open Sans', system-ui, sans-serif", size: "0.75rem", weight: "700", lineHeight: "1", letterSpacing: "0", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Brand links are primary navy #00205b (15.47 on white), underlined at
    // rest (style.css:114), clearing to hover blue #1a5c9e with no underline
    // on hover (style.css:115).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "none", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // `.cookie-banner__checkbox.disabled{opacity:.5}` (style.css:491; pagination uses .3 — see MAPPING.md)
  // The general control transition is the input's: `transition:.3s` refined by
  // the later `transition-property:border,color` in the same rule
  // (style.css:426 — the later longhand wins); buttons use a
  // background-color variant (noted in MAPPING.md).
  transition: { property: "border, color", duration: "300ms", easing: "ease" },
  // `pointer` is published (labels, menus); no disabled or text cursor is
  // (`not-allowed` occurs only in vendor Choices stock, style.css:649-691).
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" }, // disabled + text à confirmer
  // No icon-size system is published (ad-hoc 8–80px icons); Sentropic base.
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // FOCUS = a 2px OUTLINE in pure red (`red` keyword → #ff0000, 4.00 on
  // white), the least-scoped brand rule `a,button:focus-visible`
  // (style.css:89); no offset is published. Form controls instead recolour
  // their border to #004a93 at :focus with `outline:none` (style.css:427);
  // the white `border:2px solid #fff` halo has no primitive and is recorded
  // in MAPPING.md.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "0",
    color: getlinkColor.accent.focus, // #ff0000 focus red
    inset: "0"
  },
  // Form fields are BOXED (outline): an unfilled/white box with four equal
  // `1px solid #d9d9d9` borders and a 2px radius (style.css:426); the select
  // agrees (`background-color:#fff`, same border, style.css:709). `style:
  // "outline"` draws four equal borders from `surface.default` +
  // `border.strong`.
  field: {
    style: "outline",
    fillBg: getlinkColor.grey[0], // #ffffff
    underlineColor: getlinkColor.grey[450], // #d9d9d9 input border (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: the brand draws its chevron from chevron.svg (12×10,
    // `M11 2.5L6 7.5L1 2.5`, black stroke) at right:16px (style.css:704);
    // redrawn as a black data-URI with a 2.25rem gutter (16px offset + 10px
    // chevron + 10px gap).
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='10' viewBox='0 0 12 10'%3E%3Cpath d='M11 2.5L6 7.5L1 2.5' fill='none' stroke='%23000'/%3E%3C/svg%3E\") no-repeat right 1rem center",
    selectPaddingRight: "2.25rem"
  },
  // Cards are borderless white boxes with 30px padding and 14px/24px body
  // text (style.css:257/290); the brand publishes no card hover (grep
  // `.card:hover` over the brand region: 0), so the hover is inert, and the
  // 8px-bordered `.card.bordered` variant has no primitive (see MAPPING.md).
  card: {
    borderWidth: "0",
    lineHeight: "1.5rem", // 24px card paragraph
    hoverBackground: getlinkColor.grey[0] // #ffffff inert (nothing published — à confirmer)
  },
  // Secondary button = the OUTLINED header pill: transparent fill, 1px dark
  // navy border + text, filling navy with white text on hover
  // (style.css:158-159).
  buttonSecondary: {
    background: "transparent",
    border: getlinkColor.brand.dark, // #00072b stroke
    hoverBackground: getlinkColor.brand.dark // #00072b fill on hover
  },
  // Tabs: the brand publishes no tab component (grep `\\.tab` over the brand
  // region: table styles only) — geometry aligned with the reference theme
  // package (à confirmer), active text in the brand action navy.
  tabs: {
    activeText: getlinkColor.brand.primary, // #00205b (à confirmer)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px (à confirmer)
    paddingInline: "1rem", // 16px (à confirmer)
    fontSize: "1rem", // 16px (à confirmer)
    lineHeight: "1.5rem", // 24px (à confirmer)
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // Pagination: borderless 36px circular page boxes in 12px/600 type
  // (style.css:1371), current page filled #c2c2c2 (style.css:1372); text
  // inherits black. Circularity has no primitive (radius.md = 2px serves the
  // inputs) — see MAPPING.md.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: getlinkColor.grey[900], // #000000 inherited
    activeBackground: getlinkColor.grey[600], // #c2c2c2 filled current page
    activeText: getlinkColor.grey[900], // #000000 inherited
    activeBorderWidth: "0",
    paddingBlock: "0",
    paddingInline: "0",
    minSize: "2.25rem", // 36px page box
    fontSize: "0.75rem", // 12px
    lineHeight: "1.75" // inherited from body (no value declared)
  },
  // Breadcrumb: #707070 14px/600 trail on #e2e2e2 with a black current page
  // (style.css:251/255/256); links inherit the trail colour and the brand
  // publishes no separator glyph (gap only), so the separator reuses the
  // trail colour (à confirmer).
  breadcrumb: {
    linkText: getlinkColor.grey[750], // #707070 inherited trail
    text: getlinkColor.grey[750], // #707070 trail text
    currentText: getlinkColor.grey[900], // #000000 current page
    separator: getlinkColor.grey[750], // #707070 (à confirmer)
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem", // 18px
    currentWeight: "600" // inherited from li (style.css:255)
  },
  // Alert / notice: the brand publishes no generic alert component (only the
  // form-scoped `.validation_error` box) — geometry aligned with the
  // reference theme package (à confirmer).
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
  // Accordion: 24px Outfit 600 toggle, 30px line, 30px vertical padding with
  // a 1px #eee top rule (style.css:102/523); toggle text inherits black and
  // the hover washes #fafafa full-bleed (style.css:524).
  accordion: {
    text: getlinkColor.grey[900], // #000000 inherited toggle text
    paddingBlock: "1.875rem", // 30px
    paddingInline: "0",
    fontSize: "1.5rem", // 24px
    fontWeight: "600",
    lineHeight: "1.875rem" // 30px
  },
  // Tag: a square (no radius) 11px/600 uppercase label with 2.2px tracking on
  // #e9e9e9, padded 4px/12px (style.css:1293/1365); text inherits black. The
  // tracking + uppercase have no primitive (see MAPPING.md).
  tag: {
    radius: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.6875rem", // 11px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    minHeight: "1.5rem", // 24px = 4 + 16 + 4
    neutralBackground: getlinkColor.grey[350], // #e9e9e9
    neutralText: getlinkColor.grey[900] // #000000 inherited
  },
  // Badge: the brand publishes no badge — pill geometry aligned with the
  // reference theme package (à confirmer), info tone in brand action navy
  // with readable white (15.47).
  badge: {
    radius: "999px", // (à confirmer)
    paddingBlock: "0", // (à confirmer)
    paddingInline: "0.5rem", // 8px (à confirmer)
    fontSize: "0.875rem", // 14px (à confirmer)
    fontWeight: "700", // (à confirmer)
    lineHeight: "1.5rem", // 24px (à confirmer)
    textTransform: "none", // (à confirmer)
    minHeight: "1.5rem", // 24px (à confirmer)
    infoBackground: getlinkColor.brand.primary, // #00205b (à confirmer)
    infoText: getlinkColor.grey[0] // #ffffff (à confirmer)
  },
  // Checkbox/radio label: 16px/300 Campton consent label, 20px line, black
  // inherited text (style.css:434); no radio published, so the radio line
  // reuses the checkbox value (à confirmer).
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px (à confirmer)
    labelColor: getlinkColor.grey[900] // #000000 inherited
  },
  // Search input: the 24px Outfit 700 header search with 15px vertical
  // padding and a 1px primary-navy bottom rule (style.css:213).
  search: {
    paddingBlock: "0.9375rem", // 15px
    paddingInline: "0",
    fontSize: "1.5rem", // 24px
    lineHeight: "1.75" // inherited from body (no value declared)
  },
  // Toggle: the banner's 42×20 consent switch with a 14px knob
  // (style.css:485/489) and an 18px/600 Campton label on 22px
  // (style.css:487). The measured label is white-on-dark-banner-only, so the
  // light-theme text is a coherent stand-in (à confirmer).
  toggle: {
    trackPadding: "2px", // approximated from the 42×20/14px switch (à confirmer)
    lineHeight: "1.375rem", // 22px
    textColor: getlinkColor.grey[900] // #000000 (à confirmer)
  }
} as const;

// --- semantic (Getlink-specific role mapping) -------------------------------
const semantic = {
  surface: {
    default: getlinkColor.grey[0], // white
    subtle: getlinkColor.grey[150], // #f5f5f5 `.grey` / header surface
    raised: getlinkColor.grey[0], // white
    inverse: getlinkColor.brand.deep, // #000050 deep navy chrome (33)
    overlay: "rgb(0 0 0 / 0.85)" // `.popin-wrapper{background-color:rgba(0,0,0,.85)}` (style.css:450, syntax converted)
  },
  text: {
    primary: getlinkColor.grey[900], // #000000 body black (50)
    secondary: getlinkColor.grey[750], // #707070 breadcrumb/meta (4.95 on white)
    muted: getlinkColor.grey[700], // #787878 document meta (4.42 on white — documented arbitration)
    inverse: getlinkColor.grey[0], // white on dark / coloured surfaces
    link: getlinkColor.brand.primary // #00205b underlined link (15.47 on white)
  },
  border: {
    subtle: getlinkColor.grey[350], // #e9e9e9 hairlines (13)
    strong: getlinkColor.grey[450], // #d9d9d9 input borders (8)
    interactive: getlinkColor.brand.form // #004a93 input :focus border (8.75 on white)
  },
  action: {
    primary: getlinkColor.brand.primary, // #00205b `.btn-blue` (15.47 with white text)
    primaryHover: getlinkColor.brand.hover, // #1a5c9e (6.84 on white)
    primaryText: getlinkColor.grey[0], // white on the primary navy
    secondary: getlinkColor.grey[400], // #e2e2e2 active filter pill (style.css:1533)
    secondaryHover: getlinkColor.grey[450], // #d9d9d9 darker step (hover role à confirmer)
    secondaryText: getlinkColor.brand.dark, // #00072b pill text (style.css:1533)
    danger: getlinkColor.accent.error // #f03130 error red fill (white text 4.05 — brand fill, never altered)
  },
  feedback: {
    success: getlinkColor.system.success,
    warning: getlinkColor.system.warning,
    error: getlinkColor.system.error,
    info: getlinkColor.system.info
  },
  status: {
    pending: getlinkColor.system.warning,
    processing: getlinkColor.system.info,
    completed: getlinkColor.system.success,
    failed: getlinkColor.system.error
  },
  // Categorical data-vis palette: the brand's own 6-era timeline system
  // (periods 1–6, style.css:614–631) plus the measured success green and the
  // primary navy as the dark category.
  data: {
    category1: getlinkColor.brand.form, // #004a93 period-1
    category2: getlinkColor.accent.teal, // #63c1c8 period-2
    category3: getlinkColor.accent.error, // #f03130 period-3
    category4: getlinkColor.brand.sky, // #009fe3 period-4
    category5: getlinkColor.accent.purple, // #8c3f91 period-5
    category6: getlinkColor.accent.orange, // #f75e19 period-6
    category7: getlinkColor.accent.success, // #61c05e measured green
    category8: getlinkColor.brand.primary // #00205b primary navy
  }
} as const;

/**
 * The Getlink theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Getlink-specific values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Getlink navy brand reaches the components
 * (buttons, tabs, pagination, chat bubbles…), not just the elements that read
 * semantic vars directly.
 */
export const getlinkTheme: TenantTheme = {
  id: "getlink",
  label: "Getlink",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default getlinkTheme;
