import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * STMicroelectronics brand theme for the Sentropic token structure.
 *
 * STMicroelectronics publishes no tokenised public design system: no named
 * token/variable file was found, so this package is a MEASURED-CLONE mapping
 * read from the custom CSS of the official newsroom site (newsroom.st.com,
 * theme `st-news-v2`), whose utility classes name the brand palette
 * explicitly (`.stn-bg--primary` = #03234b navy, `.stn-bg--secondary` =
 * #ffd200 yellow). The corporate site (www.st.com) blocks non-browser
 * requests, so no value is read from it. We reference the brand font *names*
 * (Arial for body, ITCLubalinGraphStdMedium for headings) only — never font
 * binaries. Sources and exact provenance are documented in MAPPING.md. Where
 * the newsroom CSS publishes no direct equivalent for a Sentropic role (the
 * feedback greens/ambers, readable link/muted text, geometry), the closest
 * derived value is used and the choice is noted "à confirmer" in MAPPING.md.
 *
 * STMicroelectronics colour reference (light theme):
 *   Primary navy (brand / action)       #03234b   (.stn-bg--primary)
 *   Navy hover                          #042e62   (primary button hover)
 *   Primary-dark surface                #0f182f   (.stn-latest--bg-primary-dark)
 *   Secondary yellow (brand accent)     #ffd200   (.stn-bg--secondary)
 *   Deep yellow                         #cca800   (header border accent)
 *   Light interactive blue              #3cb4e6   (checked controls, focus border)
 *   Interactive blue                    #2b8ec5   (control hover border)
 *   Footer nav hover blue               #b0dcef   (.stn-footer__nav-item:hover)
 *   Pale blue-grey                      #edf1f4   (measured pale blue-grey)
 *   White (surface default)             #ffffff
 *   Body background alt                 #f7f8fa   (body background)
 *   Hover fill grey                     #eeeff1   (dropdown hover fill)
 *   Subtle border                       #dbdee2   (input borders)
 *   Muted grey text                     #767c84   (.font-color--grey-text)
 *   Neutral grey text                   #525a63   (.font-color--grey-neutral-1)
 *   Error red                           #e6007e   (.modal-content .text-red)
 *   Readable muted (darkened)           #6a6f77   (derived — à confirmer)
 *   Readable link blue (darkened)       #22709b   (derived — à confirmer)
 *   Success green                       #1e7e34   (derived — à confirmer)
 *   Warning amber                       #b45309   (derived — à confirmer)
 */

// --- STMicroelectronics raw colour palette ----------------------------------
const stmicroelectronicsColor = {
  // Brand navy scale. #03234b is the ST signature: body text, headings,
  // primary buttons and the `.stn-bg--primary` utility.
  navy: {
    primary: "#03234b", // .stn-bg--primary / body{color} / h1-h6 / primary buttons
    hover: "#042e62", // .stn-button--primary:hover,:focus background
    dark: "#0f182f" // .stn-latest--bg-primary-dark
  },
  // Brand yellow accent. #ffd200 is the ST secondary: `.stn-bg--secondary`,
  // secondary buttons, card label bars.
  yellow: {
    primary: "#ffd200", // .stn-bg--secondary / .stn-button--secondary
    deep: "#cca800" // .stn-header--border-right (darker yellow, coherent hover)
  },
  // Interactive blues: checked/focus states and control hover.
  interactive: {
    light: "#3cb4e6", // checkbox checked / pagination selected border / modal input focus
    base: "#2b8ec5", // checkbox hover border / .color-blue contact boxes
    pale: "#b0dcef", // .stn-footer__nav-item:hover{color:#b0dcef} — footer link hover, reused as the pale tint (role adapted — à confirmer)
    paleBg: "#edf1f4" // measured pale blue-grey (search icon stroke)
  },
  // Neutral grey scale read from the newsroom theme.
  grey: {
    0: "#ffffff", // surface default / card fill
    50: "#f7f8fa", // body{background-color} / .stn-pagination__list li, .stn-header__blockmenu-item, .stn-page-navigation__search-item hovers (submenu hovers are #f7f6f6)
    100: "#eeeff1", // pagination dropdown hover fill
    200: "#dbdee2", // input / pagination borders
    400: "#767c84", // .font-color--grey-text / input placeholders
    500: "#525a63" // .font-color--grey-neutral-1 / card text
  },
  // System / status colours.
  system: {
    error: "#e6007e", // .modal-content .text-red (4.50:1 on white)
    success: "#1e7e34", // derived success green, 5.14:1 on white (à confirmer)
    warning: "#b45309" // derived warning amber, 5.02:1 on white (à confirmer)
  },
  // Readability-darkened stand-ins (H/S kept, stop rule — à confirmer).
  readable: {
    muted: "#6a6f77", // #767c84 darkened to 5.06:1 on white (stop rule, step 1)
    link: "#22709b" // #2b8ec5 darkened to 5.44:1 on white (stop rule, step 2)
  }
} as const;

// --- foundation (STMicroelectronics-specific values) ------------------------
const foundation = {
  color: {
    // ST has no dominant brand BLUE beyond its navy: the Sentropic "blue"
    // role family carries the navy action colour with a pale blue-grey tint.
    blue: {
      10: stmicroelectronicsColor.interactive.paleBg, // #edf1f4 pale tint
      60: stmicroelectronicsColor.navy.primary, // #03234b brand navy
      80: stmicroelectronicsColor.navy.hover // #042e62 navy hover
    },
    // The Sentropic "cyan" accent slot carries the ST interactive light blue.
    cyan: {
      10: stmicroelectronicsColor.interactive.pale, // #b0dcef pale tint
      50: stmicroelectronicsColor.interactive.light, // #3cb4e6 light blue
      70: stmicroelectronicsColor.interactive.base // #2b8ec5 interactive blue
    },
    // Sentropic "slate" role family mapped onto the newsroom neutral scale.
    slate: {
      0: stmicroelectronicsColor.grey[0], // white
      10: stmicroelectronicsColor.grey[50], // body background alt
      20: stmicroelectronicsColor.grey[200], // input borders
      60: stmicroelectronicsColor.grey[500], // neutral grey text
      80: stmicroelectronicsColor.navy.primary, // primary text navy
      90: stmicroelectronicsColor.navy.dark // darkest surface
    },
    feedback: {
      success: stmicroelectronicsColor.system.success,
      warning: stmicroelectronicsColor.system.warning,
      error: stmicroelectronicsColor.system.error,
      info: stmicroelectronicsColor.interactive.base
    }
  },
  // ST body copy is Arial (27 font-family declarations); headings use the
  // brand face ITCLubalinGraphStdMedium (the h6-h1 rule plus section/header
  // rules). Mono is the system stack, aligned with the reference theme
  // package's stack (it differs from the Sentropic base — à confirmer).
  // We reference the font *names* only, not binaries.
  font: {
    sans: "Arial, Helvetica, sans-serif",
    display: "'ITCLubalinGraphStdMedium', Arial, Helvetica, sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" // à confirmer
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base; the
  // newsroom CSS publishes no spacing token scale — à confirmer).
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
  // ST radius is mildly rounded with an asymmetric button signature:
  // cards 3px, control dropdowns .375rem, buttons `.75rem 0`.
  radius: {
    none: "0",
    sm: "3px", // card radius (.stn-card)
    md: "0.375rem", // control dropdown / pagination page radius
    lg: "0.75rem 0", // button signature radius (.stn-button — à confirmer)
    pill: "999px" // no pill radius declared by the brand (the 50px radii are flatpickr — à confirmer)
  },
  // Elevation tinted with the brand navy. The subtle value is the measured
  // card shadow; medium/floating are the reference theme package's geometry
  // re-tinted with the brand navy (à confirmer).
  shadow: {
    subtle: "0 0 4px 0 rgb(3 35 75 / 0.05)", // measured .stn-card shadow
    medium: "0 4px 12px rgb(3 35 75 / 0.14)", // reference geometry, navy tint (à confirmer)
    floating: "0 8px 24px rgb(3 35 75 / 0.18)" // reference geometry, navy tint (à confirmer)
  },
  // Motion read from the newsroom theme: `transition:all .3s ease-in-out`
  // on buttons/controls, `.45s` on modal text-field transitions.
  motion: {
    fast: "150ms", // not published as a token (à confirmer)
    normal: "300ms", // measured .3s control transition
    slow: "450ms", // .modal-content input[type=text]{transition:box-shadow .45s,border-color .45s ease-in-out} — a field transition, not a general duration (à confirmer)
    easing: "ease-in-out" // measured easing
  },
  // z-index roles are not brand-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (STMicroelectronics) ------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // input borders (.stn-form__input)
    thick: "2px" // checkbox box / custom-link rule / selected pagination border
  },
  borderStyle: { solid: "solid" },
  // Control density. The newsroom CSS declares control-specific heights
  // (59px search fields, 2.5rem pagination pages) but no control size scale,
  // so the geometry is aligned with the reference theme package's geometry
  // (à confirmer): only controlHeight matches the Sentropic base; the
  // paddings, gaps and fontSize key differ from it (see MAPPING.md).
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.5rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" }, // à confirmer
    md: { controlHeight: "2.5rem", paddingBlock: "0.375rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" }, // à confirmer
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" } // à confirmer
  },
  // ST typography: Arial everywhere; buttons bold (700, .stn-button),
  // form labels light (300, .stn-form__label), fields regular (400).
  // The measured body size is 1.0625rem; the 1rem field size and the label
  // lineHeight below are coherent stand-ins (à confirmer).
  typography: {
    control: { family: "Arial, Helvetica, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" }, // size measured on .stn-button
    field: { family: "Arial, Helvetica, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" }, // size not declared for fields — à confirmer
    label: { family: "Arial, Helvetica, sans-serif", size: "1rem", weight: "300", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" }, // size/weight measured on .stn-form__label; lineHeight undeclared — à confirmer
    // Brand links read navy with a bottom rule (.stn-custom-link,
    // .stn-latest__browse a) or underlined (card links): underlined at rest
    // and on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.35", // #newsletter-subscription-validation-popup .validation-form .newsletter-submit.disabled{opacity:.35} (a same-valued third-party .swiper-button-disabled exists — this cite is the brand rule)
  transition: { property: "all", duration: "300ms", easing: "ease-in-out" }, // measured transition:all .3s ease-in-out
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" }, // base scale (à confirmer)
  // FOCUS: the only focus colour the brand declares,
  // .modal-content input[type=text]:focus{border-color:#3cb4e6}, fails the
  // 3:1 line floor (2.37:1), so the accessible stand-in is an OUTLINE in the
  // measured interactive (hover) blue #2b8ec5, which clears it (3.63:1) —
  // à confirmer (see MAPPING.md).
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: stmicroelectronicsColor.interactive.base, // #2b8ec5 interactive blue
    inset: "0"
  },
  // Form fields are BOXED (outline): a white fill with a 1px #dbdee2 border
  // (.stn-form__input). `style: "outline"` makes the builder draw four equal
  // borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: stmicroelectronicsColor.grey[0], // #ffffff
    underlineColor: stmicroelectronicsColor.grey[200], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: no brand chevron published (custom .edd dropdowns),
    // so the chevron is redrawn in the brand navy with a 40px right gutter
    // (à confirmer).
    selectAppearance: "none", // à confirmer
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2303234b' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center", // à confirmer
    selectPaddingRight: "2.5rem" // à confirmer
  },
  // Cards: white, 3px radius, navy-tinted shadow, neutral grey text. The
  // measured card hover changes only the shadow
  // (.stn-card:hover{box-shadow:0 3px 3px 0 rgba(3,35,75,.15)}), so the fill
  // is kept at white (à confirmer).
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: stmicroelectronicsColor.grey[0] // #ffffff — hover is shadow-only (à confirmer)
  },
  // Secondary button = solid brand YELLOW with navy text (10.75:1),
  // deep-yellow hover fill.
  buttonSecondary: {
    background: stmicroelectronicsColor.yellow.primary, // #ffd200 fill
    border: stmicroelectronicsColor.yellow.primary, // #ffd200 stroke
    hoverBackground: stmicroelectronicsColor.yellow.deep // #cca800 hover fill (à confirmer)
  },
  // Tabs / top-nav: active tab = navy label with a bottom underline
  // (indicatorSide bottom, indicatorMode border). The block padding is the
  // measured `.stn-page-navigation__tabs a{padding:1rem 0}`; the remaining
  // geometry is aligned with the reference theme package (à confirmer).
  tabs: {
    activeText: stmicroelectronicsColor.navy.primary, // #03234b active label
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "1rem", // measured .stn-page-navigation__tabs a padding
    paddingInline: "1rem", // 16px (à confirmer)
    fontSize: "1rem", // 16px (à confirmer)
    lineHeight: "1.5rem", // 24px (à confirmer)
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // Pagination mirrors .stn-pagination__page (bordered) and
  // .stn-pagination__list a.selected (light-blue filet, subtle fill).
  pagination: {
    background: stmicroelectronicsColor.grey[0], // #ffffff page fill
    border: stmicroelectronicsColor.grey[200], // #dbdee2 page stroke
    borderWidth: "1px",
    text: stmicroelectronicsColor.grey[500], // #525a63 page label
    activeBackground: stmicroelectronicsColor.grey[50], // #f7f8fa selected fill
    activeText: stmicroelectronicsColor.navy.primary, // #03234b selected label
    activeBorderWidth: "2px", // selected 2px light-blue filet
    paddingBlock: "0.25rem", // 4px (à confirmer — aligned with the reference package)
    paddingInline: "0.75rem", // 12px (à confirmer — aligned with the reference package)
    minSize: "2.5rem", // 40px page box (.stn-pagination__page)
    fontSize: "1rem", // 16px (à confirmer — aligned with the reference package)
    lineHeight: "1.5rem" // 24px (à confirmer — aligned with the reference package)
  },
  // Breadcrumb: readable blue links, grey trail, navy current page. The
  // brand breadcrumb is white-on-dark; porting it onto light roles is an
  // adaptation, and the current-page weight is the measured 600 (à confirmer).
  breadcrumb: {
    linkText: stmicroelectronicsColor.readable.link, // #22709b readable blue (à confirmer)
    text: stmicroelectronicsColor.grey[500], // #525a63 trail text
    currentText: stmicroelectronicsColor.navy.primary, // #03234b current page
    separator: stmicroelectronicsColor.grey[400], // #767c84
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem", // 24px
    currentWeight: "600" // .stn-page-header__breadcrumb .page{font-weight:600} (à confirmer)
  },
  // Alert / notice: the newsroom CSS publishes no alert, notice or message
  // rule, so this block is aligned with the reference theme package's
  // geometry (à confirmer).
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0.25rem", // 4px (à confirmer)
    paddingTop: "1rem", // 16px (à confirmer)
    paddingRight: "1rem", // 16px (à confirmer)
    paddingBottom: "1rem", // 16px (à confirmer)
    paddingLeft: "1.25rem", // 20px (à confirmer)
    fontSize: "1rem", // 16px (à confirmer)
    lineHeight: "1.5rem" // 24px (à confirmer)
  },
  // Accordion / details: a navy bold summary trigger.
  accordion: {
    text: stmicroelectronicsColor.navy.primary, // #03234b summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "700",
    lineHeight: "1.5rem" // 24px
  },
  // Tag: a small 3px-radius neutral chip.
  tag: {
    radius: "3px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: stmicroelectronicsColor.grey[100], // #eeeff1
    neutralText: stmicroelectronicsColor.navy.primary // #03234b
  },
  // Badge: a 3px-radius light-blue badge with navy text (6.59:1).
  badge: {
    radius: "3px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: stmicroelectronicsColor.interactive.light, // #3cb4e6
    infoText: stmicroelectronicsColor.navy.primary // #03234b on light blue
  },
  // Checkbox/radio label (measured 17px bold grey choice labels).
  choice: {
    labelFontSize: "1.0625rem", // 17px (.stn-form__checkbox+label)
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: stmicroelectronicsColor.grey[500] // #525a63
  },
  // Search input: the measured search fields carry icon gutters
  // (.stn-form__input{padding:.75rem 3rem .75rem 4rem;height:59px},
  // .stn-page-navigation__search-input .stn-form__input{padding:9px 36px}),
  // which do not fit this symmetric model — so this block is aligned with
  // the reference theme package's geometry (à confirmer).
  search: {
    paddingBlock: "0.375rem", // 6px (à confirmer)
    paddingInline: "0.75rem", // 12px (à confirmer)
    fontSize: "1rem", // 16px (à confirmer)
    lineHeight: "1.5rem" // 24px (à confirmer)
  },
  // Toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: stmicroelectronicsColor.navy.primary // #03234b
  }
} as const;

// --- semantic (STMicroelectronics-specific role mapping) --------------------
const semantic = {
  surface: {
    default: stmicroelectronicsColor.grey[0], // white
    subtle: stmicroelectronicsColor.grey[50], // #f7f8fa body background
    raised: stmicroelectronicsColor.grey[0], // white
    inverse: stmicroelectronicsColor.navy.dark, // #0f182f primary-dark surface
    overlay: "rgb(0 0 0 / 0.5)" // .stn-overlay{background-color:rgba(0,0,0,.5)}
  },
  text: {
    primary: stmicroelectronicsColor.navy.primary, // #03234b (body color)
    secondary: stmicroelectronicsColor.grey[500], // #525a63 (neutral grey)
    muted: stmicroelectronicsColor.readable.muted, // #6a6f76 darkened grey (à confirmer)
    inverse: stmicroelectronicsColor.grey[0], // white on dark surfaces
    link: stmicroelectronicsColor.readable.link // #22709b darkened blue (à confirmer)
  },
  border: {
    subtle: stmicroelectronicsColor.grey[200], // #dbdee2 (input stroke)
    strong: stmicroelectronicsColor.grey[400], // #767c84
    interactive: stmicroelectronicsColor.interactive.base // #2b8ec5 control hover blue
  },
  action: {
    primary: stmicroelectronicsColor.navy.primary, // #03234b primary buttons
    primaryHover: stmicroelectronicsColor.navy.hover, // #042e62 hover fill
    primaryText: "#ffffff", // white text on navy (15.60:1)
    secondary: stmicroelectronicsColor.yellow.primary, // #ffd200 secondary buttons
    secondaryHover: stmicroelectronicsColor.yellow.deep, // #cca800 (à confirmer)
    secondaryText: stmicroelectronicsColor.navy.primary, // #03234b on yellow (10.75:1)
    danger: stmicroelectronicsColor.system.error // #e6007e measured red
  },
  feedback: {
    success: stmicroelectronicsColor.system.success,
    warning: stmicroelectronicsColor.system.warning,
    error: stmicroelectronicsColor.system.error,
    info: stmicroelectronicsColor.readable.link // readable blue (à confirmer)
  },
  status: {
    pending: stmicroelectronicsColor.system.warning,
    processing: stmicroelectronicsColor.readable.link,
    completed: stmicroelectronicsColor.system.success,
    failed: stmicroelectronicsColor.system.error
  },
  // Categorical data-vis palette drawn from the measured brand hues (the
  // success green is the only derived entry — see MAPPING.md, "à confirmer").
  data: {
    category1: stmicroelectronicsColor.navy.primary, // #03234b navy
    category2: stmicroelectronicsColor.yellow.primary, // #ffd200 yellow
    category3: stmicroelectronicsColor.interactive.light, // #3cb4e6 light blue
    category4: stmicroelectronicsColor.interactive.base, // #2b8ec5 blue
    category5: stmicroelectronicsColor.system.error, // #e6007e red
    category6: stmicroelectronicsColor.navy.dark, // #0f182f dark
    category7: stmicroelectronicsColor.grey[500], // #525a63 grey
    category8: stmicroelectronicsColor.system.success // #1e7e34 green (à confirmer)
  }
} as const;

/**
 * The STMicroelectronics theme as a Sentropic `TenantTheme`. The `tokens`
 * tree is complete: `foundation` and `semantic` carry ST-specific values,
 * and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so the navy/yellow brand
 * reaches the components (buttons, tabs, pagination, chat bubbles…), not
 * just the elements that read semantic vars directly.
 */
export const stmicroelectronicsTheme: TenantTheme = {
  id: "stmicroelectronics",
  label: "STMicroelectronics",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default stmicroelectronicsTheme;
