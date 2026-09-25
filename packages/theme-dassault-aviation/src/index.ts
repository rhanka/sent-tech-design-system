import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Dassault Aviation brand theme for the Sentropic token structure.
 *
 * Dassault Aviation publishes no tokenised design system; the values below
 * are measured from the brand's own compiled theme stylesheet
 * (`wp-content/themes/dassault-aviation-2021/dist/app.*.min.css`, served from
 * dassault-aviation.com and read through a dated archived copy because the
 * live host sits behind an Imperva/Incapsula challenge). The brand's signature
 * is the steel blue `--color: #324b6b` (`:root`), re-scoped per business line
 * (`.tax__color-defense/civil/espace/passion`), on squared (radius 0) chrome
 * with black running text. We reference the brand font *names*
 * (`DassaultAviationSans`, `SantEliaScript`) only — never font binaries.
 * Sources and exact provenance are documented in MAPPING.md. Where the brand
 * publishes no direct equivalent for a Sentropic role, the closest coherent
 * value is used and noted "à confirmer" in MAPPING.md.
 *
 * Dassault Aviation colour reference (light theme):
 *   White (body background)            #ffffff   (#fff, surface default)
 *   Light grey (section alt)           #f3f4f5   (surface subtle)
 *   Grey (menu / interactive fill)     #e8e9ed   (secondary surface / subtle border)
 *   Checkbox / hover grey              #d1d2d5   (secondary hover)
 *   Separator grey                     #a8adb4   (breadcrumb separator, card filet)
 *   Muted grey                         #616a74   (muted text, 5.49:1)
 *   Secondary grey                     #414b56   (secondary text, 8.88:1)
 *   Table / placeholder grey           #333333   (thead, placeholder)
 *   Ink (headings / inverse surface)   #161c25   (headings, footer, inverse)
 *   Darkest (footer bottom)            #10141a   (darkest)
 *   Black (body text / links)          #000000   (running text and links)
 *   Dassault blue (brand / action)     #324b6b   (--color, primary action)
 *   Dassault dark blue (hover)         #273a52   (--color-dark, primary hover)
 *   Dassault light blue (accent)       #415d80   (--color-light, footer/social/h6)
 *   Dassault pale blue (decoration)    #929fb0   (--color-light-alt, decorations)
 *   Dassault slate blue (decoration)   #596d87   (--color-dark-alt, decorations)
 *   Civil green                        #218737   (.tax__color-civil)
 *   Passion red                        #d51a36   (.tax__color-passion)
 *   Espace ochre                       #b05f03   (.tax__color-espace)
 *   Defense olive                      #4c5133   (.tax__color-defense)
 *   Success text / bg                  #264409 / #e6efc2
 *   Warning text / bg                  #514721 / #fff6bf
 *   Error text / bg                    #bd1919 / #fbe3e4
 *   Info text / bg                     #205791 / #d5edf8
 */

// --- Dassault Aviation raw colour palette -----------------------------------
const dassaultAviationColor = {
  // Dassault steel blue — the brand signature (`:root{--color:#324b6b;...}`).
  // Used as the action / brand family.
  brand: {
    primary: "#324b6b", // --color (169 var() + 204 literals in the brand region)
    dark: "#273a52", // --color-dark (43 var() + 52 literals)
    light: "#415d80", // --color-light (13 var() + 15 literals)
    lightAlt: "#929fb0", // --color-light-alt (3 var() + 5 literals, decorations only)
    darkAlt: "#596d87" // --color-dark-alt (3 var() + 5 literals, decorations only)
  },
  // Business-line re-scopings (`.tax__color-*`, brand region lines 75-79).
  // Only the base steps below carry Sentropic roles (data.category2-5);
  // the dark/light steps are kept for provenance — see MAPPING.md.
  taxo: {
    defense: { base: "#4c5133", dark: "#43472c", light: "#757648" },
    civil: { base: "#218737", dark: "#1c752f", light: "#319a48" },
    espace: { base: "#b05f03", dark: "#a65b06", light: "#c77211" },
    passion: { base: "#d51a36", dark: "#be1e36", light: "#e32c47" }
  },
  // Neutral scale, every step measured in brand-owned rules.
  slate: {
    0: "#ffffff", // #fff body background (162 literals, short form only)
    50: "#f3f4f5", // .entry__section--lightgray, cards, checkbox fill
    100: "#e8e9ed", // input/select border, menu + pagination + toggle fills
    200: "#d1d2d5", // checkbox border, radio hover fill
    300: "#a8adb4", // hr, breadcrumb chevron, card bottom filet
    400: "#616a74", // muted text (5.49:1), outline border, input hover
    500: "#414b56", // secondary text (8.88:1), menu + pagination text
    700: "#333333", // table thead, input placeholder
    800: "#161c25", // h1-h4, footer menu, tooltip, inverse surface
    900: "#10141a", // footer bottom
    black: "#000000" // body{color:#000}, links at rest and on hover
  },
  // Feedback system (`.message--*` + `.btn--*` pairs, measured backgrounds
  // kept for provenance; the text hues below carry the Sentropic roles).
  system: {
    success: { text: "#264409", bg: "#e6efc2" },
    warning: { text: "#514721", bg: "#fff6bf" },
    error: { text: "#bd1919", bg: "#fbe3e4" },
    info: { text: "#205791", bg: "#d5edf8" }
  }
} as const;

// --- foundation (Dassault-Aviation-specific values) -------------------------
const foundation = {
  color: {
    // The Sentropic "blue" role family carries the Dassault steel blue —
    // the brand's colour of action. Step 10 is the palest measured member
    // of the family (decorations only, 2.69:1 — never a text role).
    blue: {
      10: dassaultAviationColor.brand.lightAlt, // #929fb0 palest family member
      60: dassaultAviationColor.brand.primary, // #324b6b --color (primary)
      80: dassaultAviationColor.brand.dark // #273a52 --color-dark (hover)
    },
    // The Sentropic "cyan" accent slot carries the light/decoration steps of
    // the Dassault blue family.
    cyan: {
      10: dassaultAviationColor.brand.lightAlt, // #929fb0 decorations
      50: dassaultAviationColor.brand.light, // #415d80 footer/social/h6 accent
      70: dassaultAviationColor.brand.darkAlt // #596d87 decorations
    },
    // Sentropic "slate" role family mapped onto the measured neutral scale.
    slate: {
      0: dassaultAviationColor.slate[0], // white
      10: dassaultAviationColor.slate[50], // section alt
      20: dassaultAviationColor.slate[100], // interactive fills / field stroke
      60: dassaultAviationColor.slate[500], // secondary text
      80: dassaultAviationColor.slate[800], // headings / ink
      90: dassaultAviationColor.slate[900] // darkest
    },
    feedback: {
      success: dassaultAviationColor.system.success.text,
      warning: dassaultAviationColor.system.warning.text,
      error: dassaultAviationColor.system.error.text,
      info: dassaultAviationColor.system.info.text
    }
  },
  // Dassault Aviation ships its own `DassaultAviationSans` webfont (300/400/
  // 700 + italics, 900) used for body, headings, controls and display alike,
  // plus `SantEliaScript` as a script accent on "passion"-line hero titles.
  // `monospace` is the literal `code`/`kbd` stack. Names only, no binaries.
  font: {
    sans: "'DassaultAviationSans', sans-serif",
    display: "'DassaultAviationSans', sans-serif",
    mono: "monospace"
  },
  // No tokenised spacing scale is published (ad-hoc rem values throughout);
  // kept aligned with the Sentropic base ("à confirmer").
  spacing: {
    0: "0",
    1: "0.25rem", // 4px (à confirmer)
    2: "0.5rem", // 8px (à confirmer)
    3: "0.75rem", // 12px (à confirmer)
    4: "1rem", // 16px (à confirmer)
    6: "1.5rem", // 24px (à confirmer)
    8: "2rem", // 32px (à confirmer)
    12: "3rem", // 48px (à confirmer)
    16: "4rem" // 64px (à confirmer)
  },
  // Dassault chrome is SQUARED: radius 0 on buttons, inputs, selects, cards,
  // modals and tabs (16 measured `border-radius:0`); 50% dots only. Pills
  // vary by component on the site (50% / 2rem / 3.125rem / 99rem), so the
  // pill slot below is a coherent stand-in ("à confirmer").
  radius: {
    none: "0",
    sm: "0", // squared controls
    md: "0", // squared inputs / buttons / tabs
    lg: "0", // squared cards (no radius declared)
    pill: "999px" // (à confirmer — site pills vary, see MAPPING.md)
  },
  // A single elevation shadow is published (header on scroll, breadcrumb and
  // toolbox dropdowns); the deeper steps below reuse the Sentropic base
  // ("à confirmer").
  shadow: {
    subtle: "0 0 0.3125rem 0.0625rem rgb(0 0 0 / 0.1)", // header/dropdown shadow
    medium: "0 8px 24px rgb(15 23 42 / 0.12)", // Sentropic base (à confirmer)
    floating: "0 18px 45px rgb(15 23 42 / 0.18)" // Sentropic base (à confirmer)
  },
  // Measured transition durations, in declarations (.2s x52, .3s x28,
  // .5s x9; brand region, durations by value, SVG path-data bytes excluded)
  // with the `ease` easing; the cubic-bezier(.25,1,.5,1) signature drives
  // arrow keyframes.
  motion: {
    fast: ".2s",
    normal: ".3s",
    slow: ".5s",
    easing: "ease"
  },
  // z-index roles are not brand-specific (ad-hoc 1/2/3/5/21/30/100000 on the
  // site); kept aligned with the Sentropic base ("à confirmer").
  z: {
    header: 50, // (à confirmer)
    toast: 60, // (à confirmer)
    overlay: 80, // (à confirmer)
    modal: 100, // (à confirmer)
    chat: 110 // (à confirmer)
  },
  // --- Anatomy primitives (Dassault Aviation) -------------------------------
  borderWidth: {
    none: "0",
    thin: ".0625rem", // 1px field/outline/dropdown borders (brand unit)
    thick: ".125rem" // 2px card/accordion/checkbox accents (brand unit)
  },
  borderStyle: { solid: "solid" },
  // Control density. The brand sizes generic controls by padding (.btn,
  // inputs, selects all pad-driven, no height/min-height on the generic
  // rules — see MAPPING.md for the measured paddings). The heights the
  // sheet does declare are scoped, not generic: the search input (4.375rem,
  // rule 2425), the visually-hidden pattern (.0625rem, rules 153/164/320)
  // and the custom checkbox/radio boxes (rules 155/156/166/167). None fits
  // the fixed-height density model; the whole block below reuses the
  // Sentropic base ("à confirmer").
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.75rem", gap: "0.375rem", minWidth: "2rem" }, // (à confirmer)
    md: { controlHeight: "2.5rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.5rem" }, // (à confirmer)
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "3rem" } // (à confirmer)
  },
  // Dassault typography: DassaultAviationSans everywhere. Buttons are
  // uppercase 700 with 1px tracking; fields are large (1.25rem/1.875rem);
  // labels are small 400; links are black, underlined on hover only.
  typography: {
    control: { family: "'DassaultAviationSans', sans-serif", size: "0.875rem", weight: "700", lineHeight: "1rem", letterSpacing: "0.0625rem", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'DassaultAviationSans', sans-serif", size: "1.25rem", weight: "400", lineHeight: "1.875rem", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'DassaultAviationSans', sans-serif", size: "0.875rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" }, // rule 145 declares no line-height — inherits body 1.4 (rule 195); unitless 1.5 is search-scoped (rule 542)
    // Brand links are black (#000) at rest AND on hover — the underline on
    // hover (plus Dassault blue in editorial content) is what makes a link.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.3", // .btn[disabled]{opacity:.3}
  transition: { property: "all", duration: ".2s", easing: "ease" }, // `all .2s ease` x9, most frequent
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" }, // sm measured (.icon); md/lg Sentropic base (à confirmer)
  // FOCUS = a keyboard-only OUTLINE: 2px solid, 8px offset, currentColor in
  // the general rule, Dassault blue (#324b6b) wherever a colour is named
  // (submit, tabs, accordion, menus, form buttons — most cited explicit).
  focus: {
    strategy: "outline",
    width: ".125rem", // 2px (brand unit)
    offset: ".5rem", // 8px (brand unit)
    color: dassaultAviationColor.brand.primary, // #324b6b most-cited explicit focus colour
    inset: "0"
  },
  // Form fields are BOXED (outline): a white fill, a 1px #e8e9ed border and
  // squared corners. `style: "outline"` makes the builder draw four equal
  // borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: dassaultAviationColor.slate[0], // #ffffff
    underlineColor: dassaultAviationColor.slate[100], // unused for outline, kept for completeness
    underlineWidth: ".0625rem", // 1px (brand unit)
    // Native <select>: chevron redrawn in ink #161C25 with a 60px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='10' fill='none'%3E%3Cpath stroke='%23161C25' stroke-width='2' d='M15 1 8 8 1 1'/%3E%3C/svg%3E\") no-repeat right 1.5rem center",
    selectPaddingRight: "3.75rem"
  },
  // Cards carry no peripheral border (filet-only variants: #f3f4f5 + #a8adb4
  // for related/subpage, #e8e9ed + #324b6b for job); body copy inherits 1.4.
  // No generic card hover is published (hover below à confirmer).
  card: {
    borderWidth: "0",
    lineHeight: "1.4",
    hoverBackground: dassaultAviationColor.slate[0] // #ffffff (à confirmer)
  },
  // Secondary button = OUTLINED in muted grey: transparent fill, #616a74
  // border, black text, transparent hover (border darkens to #4a5158).
  buttonSecondary: {
    background: "transparent",
    border: dassaultAviationColor.slate[400], // #616a74 stroke
    hoverBackground: "transparent" // transparent hover fill
  },
  // Tabs: uppercase 700 labels, transparent fills, active tab in Dassault
  // blue with a bottom filet indicator.
  tabs: {
    activeText: dassaultAviationColor.brand.primary, // #324b6b selected tab
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "1.6875rem", // 27px
    paddingInline: "2rem", // 32px
    fontSize: "1rem", // 16px (last of the .875rem/1rem pair)
    lineHeight: "1.25rem", // 20px (last of the 1rem/1.25rem pair)
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // Pagination: borderless link-style pages in secondary grey, current page
  // in bold Dassault blue; square 3rem prev/next boxes in #e8e9ed with blue
  // chevrons turning white on a blue hover.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: dassaultAviationColor.slate[500], // #414b56 page text
    activeBackground: "transparent", // link-style, no filled active page
    activeText: dassaultAviationColor.brand.primary, // #324b6b current page
    activeBorderWidth: "0",
    paddingBlock: "0",
    paddingInline: "0.3125rem", // 5px
    minSize: "3rem", // 48px prev/next boxes
    fontSize: "1.125rem", // 18px
    lineHeight: "1.375rem" // 22px
  },
  // Breadcrumb: black links under an #e8e9ed rule, current page in Dassault
  // blue, #a8adb4 triangle separators.
  breadcrumb: {
    linkText: dassaultAviationColor.slate.black, // #000000 inherited link colour
    text: dassaultAviationColor.slate.black, // #000000 inherited trail colour
    currentText: dassaultAviationColor.brand.primary, // #324b6b current page
    separator: dassaultAviationColor.slate[300], // #a8adb4 chevron
    fontSize: "1rem", // 16px inherited from body
    lineHeight: "1.4", // inherited from body
    currentWeight: "400" // no weight declared (measured absence)
  },
  // Alert / notice: a coloured LEFT filet (5px) on an unfilled box with
  // 2rem padding; per-severity pastel fills documented in MAPPING.md.
  alert: {
    background: "transparent", // .message declares no fill (measured absence)
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0.3125rem", // 5px left accent bar
    paddingTop: "2rem", // 32px
    paddingRight: "2rem", // 32px
    paddingBottom: "2rem", // 32px
    paddingLeft: "2rem", // 32px
    fontSize: "1rem", // 16px inherited from body
    lineHeight: "1.4" // inherited from body
  },
  // Accordion: a white trigger with a 2px #e8e9ed bottom rule and ink 700
  // label, turning solid Dassault blue with white text on hover/focus.
  accordion: {
    text: dassaultAviationColor.slate[800], // #161c25 trigger label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "0.75rem", // 12px (right gutter clears the skew icon block)
    fontSize: "0.875rem", // 14px
    fontWeight: "700",
    lineHeight: "1rem" // 16px
  },
  // Tag: no tag/chip component is published; squared coherent stand-ins from
  // the card/meta vocabulary (à confirmer).
  tag: {
    radius: "0", // square signature (à confirmer)
    paddingBlock: "0.25rem", // 4px (à confirmer)
    paddingInline: "0.5rem", // 8px (à confirmer)
    fontSize: "0.875rem", // 14px meta size (à confirmer)
    fontWeight: "700", // meta weight (à confirmer)
    lineHeight: "1.25rem", // 20px meta rhythm (à confirmer)
    minHeight: "1.5rem", // 24px (à confirmer)
    neutralBackground: dassaultAviationColor.slate[50], // #f3f4f5 card fill (à confirmer)
    neutralText: dassaultAviationColor.slate[800] // #161c25 card title (à confirmer)
  },
  // Badge: no badge component is published; a squared filled badge in
  // Dassault blue with white text, coherent with the primary button
  // (à confirmer).
  badge: {
    radius: "0", // square signature (à confirmer)
    paddingBlock: "0", // (à confirmer)
    paddingInline: "0.5rem", // 8px (à confirmer)
    fontSize: "0.875rem", // 14px (à confirmer)
    fontWeight: "700", // (à confirmer)
    lineHeight: "1.5rem", // 24px (à confirmer)
    textTransform: "none", // (à confirmer)
    minHeight: "1.5rem", // 24px (à confirmer)
    infoBackground: dassaultAviationColor.brand.primary, // #324b6b (à confirmer)
    infoText: dassaultAviationColor.slate[0] // #ffffff (à confirmer)
  },
  // Checkbox/radio label: Dassault blue, 1rem/1.5rem, semibold.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: dassaultAviationColor.brand.primary // #324b6b choice label
  },
  // Search input: the three search-field variants disagree (white boxed,
  // 3rem right pad, rule 543; transparent borderless, 1.25rem/6.4375rem
  // pads, rule 2066; toolbox input, 5rem right pad + 4.375rem height, rule
  // 2425 — see MAPPING.md), so the generic boxed field metrics below are a
  // coherent stand-in ("à confirmer").
  search: {
    paddingBlock: "0.9375rem", // 15px generic input (à confirmer)
    paddingInline: "1.25rem", // 20px generic input (à confirmer)
    fontSize: "1.25rem", // 20px generic input (à confirmer)
    lineHeight: "1.875rem" // 30px generic input (à confirmer)
  },
  // Toggle / switch: Dassault blue uppercase label over an #e8e9ed pill
  // track turning blue when checked.
  toggle: {
    trackPadding: "0.25rem", // 4px pill inset
    lineHeight: "1.4", // inherited from body (no line-height declared)
    textColor: dassaultAviationColor.brand.primary // #324b6b toggle label
  }
} as const;

// --- semantic (Dassault-Aviation-specific role mapping) ---------------------
const semantic = {
  surface: {
    default: dassaultAviationColor.slate[0], // white body
    subtle: dassaultAviationColor.slate[50], // #f3f4f5 section alt
    raised: dassaultAviationColor.slate[0], // white modal
    inverse: dassaultAviationColor.slate[800], // #161c25 footer/tooltip ink
    overlay: "rgb(0 0 0 / 0.75)" // .modal backdrop rgba(0,0,0,.75)
  },
  text: {
    primary: dassaultAviationColor.slate.black, // #000000 body (21.00:1)
    secondary: dassaultAviationColor.slate[500], // #414b56 (8.88:1)
    muted: dassaultAviationColor.slate[400], // #616a74 (5.49:1)
    inverse: dassaultAviationColor.slate[0], // white on dark/blue surfaces
    link: dassaultAviationColor.slate.black // #000000 links (21.00:1)
  },
  border: {
    subtle: dassaultAviationColor.slate[100], // #e8e9ed field stroke
    strong: dassaultAviationColor.slate[400], // #616a74 outline/hover stroke
    interactive: dassaultAviationColor.brand.primary // #324b6b (8.92:1, line)
  },
  action: {
    primary: dassaultAviationColor.brand.primary, // #324b6b .btn--primary
    primaryHover: dassaultAviationColor.brand.dark, // #273a52 hover/focus
    primaryText: dassaultAviationColor.slate[0], // white on blue (8.92:1)
    secondary: dassaultAviationColor.slate[100], // #e8e9ed menu/page fills
    secondaryHover: dassaultAviationColor.slate[200], // #d1d2d5 radio hover
    secondaryText: dassaultAviationColor.slate.black, // #000000 outline text
    danger: dassaultAviationColor.system.error.text // #bd1919 (6.33:1)
  },
  feedback: {
    success: dassaultAviationColor.system.success.text, // #264409 (10.98:1)
    warning: dassaultAviationColor.system.warning.text, // #514721 (9.24:1)
    error: dassaultAviationColor.system.error.text, // #bd1919 (6.33:1)
    info: dassaultAviationColor.system.info.text // #205791 (7.41:1)
  },
  status: {
    pending: dassaultAviationColor.system.warning.text,
    processing: dassaultAviationColor.system.info.text,
    completed: dassaultAviationColor.system.success.text,
    failed: dassaultAviationColor.system.error.text
  },
  // Categorical data-vis palette: the brand publishes no 8-colour scale, so
  // this is a coherent proposal from the measured hues — Dassault blue, the
  // four business-line colours, ink and neutrals (see MAPPING.md,
  // "à confirmer").
  data: {
    category1: dassaultAviationColor.brand.primary, // #324b6b Dassault blue
    category2: dassaultAviationColor.taxo.civil.base, // #218737 civil green
    category3: dassaultAviationColor.taxo.passion.base, // #d51a36 passion red
    category4: dassaultAviationColor.taxo.espace.base, // #b05f03 espace ochre
    category5: dassaultAviationColor.taxo.defense.base, // #4c5133 defense olive
    category6: dassaultAviationColor.slate[800], // #161c25 ink
    category7: dassaultAviationColor.slate[400], // #616a74 muted grey
    category8: dassaultAviationColor.brand.light // #415d80 light blue
  }
} as const;

/**
 * The Dassault Aviation theme as a Sentropic `TenantTheme`. The `tokens` tree
 * is complete: `foundation` and `semantic` carry Dassault-specific values, and
 * the `component` layer is REBUILT from this theme's own semantic/foundation
 * via `createComponent` — so the Dassault blue reaches the components
 * (buttons, tabs, pagination, chat bubbles…), not just the elements that read
 * semantic vars directly.
 */
export const dassaultAviationTheme: TenantTheme = {
  id: "dassault-aviation",
  label: "Dassault Aviation",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default dassaultAviationTheme;
