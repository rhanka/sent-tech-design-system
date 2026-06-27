import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Orange brand theme for the Sentropic token structure.
 *
 * All values below are measured from Orange's PUBLIC, OPEN-SOURCE design system
 * "Boosted" (boosted.orange.com, Orange-OpenSource/Orange-Boosted-Bootstrap) —
 * its Sass tokens (`scss/_variables.scss`, the ODS colour palette) and the
 * Boosted component docs. We only reference font *names* (the Helvetica Neue
 * system stack) here, never font binaries: Orange's licensed "HelvNeueOrange"
 * is NOT shipped or network-loaded. Sources and exact provenance are documented
 * in MAPPING.md. Where Boosted has no published token for a Sentropic role, the
 * closest measured value is used and the choice is noted "à confirmer".
 *
 * SIGNATURE — Orange Boosted is SQUARE. `$enable-rounded: false` flattens every
 * box corner (buttons, inputs, cards, tabs, badges, tags → radius 0); only
 * genuinely circular controls (radios, switches, avatars) keep `radius.pill`.
 * Borders are high-contrast BLACK (`$border-color: $black`), the primary button
 * is BRIGHT ORANGE with BLACK text, and focus is a DOUBLE ring (black outer +
 * white inner separator) for visibility on any background.
 *
 * Orange Boosted colour reference (light theme, scss/_variables.scss + ODS):
 *   White (body-bg / surface default)   #ffffff   ($white / $ods-white-100)
 *   Light surface                        #f6f6f6   ($gray-200)
 *   Field stroke (border-color-subtle)   #cccccc   ($gray-500 / $ods-gray-400)
 *   Mid grey                             #999999   ($gray-600 / $ods-gray-500)
 *   Secondary text (body-secondary)      #666666   ($gray-700 / $ods-gray-600)
 *   Muted dark grey                      #595959   ($gray-800 / $ods-gray-700)
 *   Dark grey                            #333333   ($gray-900 / $ods-gray-800)
 *   Near-black                           #141414   ($ods-gray-900)
 *   Body text / borders / inverse        #000000   ($black / $ods-black-900)
 *   Brand orange (action / active)       #ff7900   ($supporting-orange / $ods-orange-100)
 *   Orange dark (AA text / link / focus) #f16e00   ($orange / $primary / $ods-orange-200)
 *   Functional green (success)           #228722   ($green / $ods-forest-200)
 *   Functional yellow (warning)          #ffcc00   ($yellow / $ods-sun-100, a.k.a. #fc0)
 *   Functional red (danger / error)      #cd3c14   ($red / $ods-fire-200)
 *   Functional blue (info)               #4170d8   ($blue / $ods-water-200)
 *   Supporting purple                    #a885d8   ($ods-purple-300, data-vis only)
 *   Supporting pink                      #ffb4e6   ($ods-pink-300, data-vis only)
 */

// --- Orange raw colour palette (Orange Boosted / ODS) ----------------------
const orangeColor = {
  // The Orange brand orange. Boosted ships two oranges: the BRIGHT brand orange
  // (#ff7900, ods-orange-100) drives action / active components; the DARKER orange
  // (#f16e00, ods-orange-200 = Boosted's $primary) is the AA-safe interactive hue
  // for text/links/focus on white.
  orange: {
    bright: "#ff7900", // $supporting-orange / $ods-orange-100 — primary action, active state
    dark: "#f16e00", // $orange / $primary / $ods-orange-200 — AA-safe link/focus/hover
    tint: "#fff2e6", // derived light orange tint (à confirmer)
    darker: "#cc5d00" // derived darker orange (à confirmer)
  },
  // Neutral grey scale. Boosted maps the Bootstrap grey ramp onto the ODS greys;
  // these hexes are measured from scss/_variables.scss + the ODS colour palette.
  grey: {
    white: "#ffffff", // $white / $ods-white-100 — surface default
    100: "#f6f6f6", // $gray-200 — light surface
    200: "#eeeeee", // $gray-300 / $ods-gray-200
    300: "#dddddd", // $gray-400 / $ods-gray-300
    400: "#cccccc", // $gray-500 / $ods-gray-400 — border-color-subtle (field stroke)
    500: "#999999", // $gray-600 / $ods-gray-500
    600: "#666666", // $gray-700 / $ods-gray-600 — body-secondary-color
    700: "#595959", // $gray-800 / $ods-gray-700 — muted dark grey
    800: "#333333", // $gray-900 / $ods-gray-800
    900: "#141414", // $ods-gray-900 — near-black
    black: "#000000" // $black / $ods-black-900 — body text, borders, inverse surface
  },
  // System / functional colours (Boosted $green/$yellow/$red/$blue = the ODS
  // functional palette) plus two supporting hues reserved for data-vis.
  system: {
    success: "#228722", // $green / $functional-green / $ods-forest-200
    warning: "#ffcc00", // $yellow / $functional-yellow / $ods-sun-100 (#fc0)
    error: "#cd3c14", // $red / $functional-red / $ods-fire-200
    info: "#4170d8", // $blue / $functional-blue / $ods-water-200
    purple: "#a885d8", // $ods-purple-300 (supporting) — data-vis only
    pink: "#ffb4e6" // $ods-pink-300 (supporting) — data-vis only
  }
} as const;

// --- foundation (Orange-specific values) -----------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family carries Orange's PRIMARY action ramp: the
    // bright brand orange #ff7900 with its AA-safe darker step #f16e00.
    blue: {
      10: orangeColor.orange.tint, // light orange tint (à confirmer)
      60: orangeColor.orange.bright, // #ff7900 brand orange — primary action
      80: orangeColor.orange.dark // #f16e00 darker interactive orange
    },
    // No second brand hue in Orange's identity: the "cyan" accent slot stays
    // monochrome-orange (the darker orange family) rather than introducing a blue.
    cyan: {
      10: orangeColor.orange.tint, // light orange tint (à confirmer)
      50: orangeColor.orange.dark, // #f16e00 ods-orange-200 accent
      70: orangeColor.orange.darker // #cc5d00 derived darker orange (à confirmer)
    },
    // Sentropic "slate" role family mapped onto the Boosted/ODS grey ramp.
    slate: {
      0: orangeColor.grey.white, // white
      10: orangeColor.grey[100], // #f6f6f6 light surface
      20: orangeColor.grey[400], // #cccccc field stroke (border-color-subtle)
      60: orangeColor.grey[600], // #666666 secondary text
      80: orangeColor.grey[800], // #333333 dark grey
      90: orangeColor.grey[900] // #141414 near-black
    },
    feedback: {
      success: orangeColor.system.success,
      warning: orangeColor.system.warning,
      error: orangeColor.system.error,
      info: orangeColor.system.info
    }
  },
  // Boosted `$font-family-sans-serif` is "HelvNeueOrange", "Helvetica Neue",
  // Helvetica, "Noto Sans", "Liberation Sans", Arial, sans-serif. HelvNeueOrange
  // is Orange's licensed binary and is deliberately NOT loaded; we reference the
  // public Helvetica Neue system stack only. Display and body share the sans
  // family (Boosted uses one type family); mono is the system stack.
  font: {
    sans: "'Helvetica Neue', Helvetica, Arial, 'Noto Sans', 'Liberation Sans', sans-serif",
    display: "'Helvetica Neue', Helvetica, Arial, 'Noto Sans', 'Liberation Sans', sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base; Boosted's
  // spacer ramp is comparable).
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
  // SIGNATURE — Boosted `$enable-rounded: false` flattens every box corner to 0.
  // Buttons, inputs, cards, tabs, tags and badges are SQUARE. `radius.pill` stays
  // round so genuinely circular controls (radios, switches, avatars) survive.
  radius: {
    none: "0",
    sm: "0", // $enable-rounded:false — squared
    md: "0", // $enable-rounded:false — squared (controls / inputs / tabs)
    lg: "0", // $enable-rounded:false — squared (cards)
    pill: "999px" // circular controls only (radios / switches / avatars)
  },
  // Neutral black-tinted elevation. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.10)",
    medium: "0 4px 12px rgb(0 0 0 / 0.15)",
    floating: "0 8px 24px rgb(0 0 0 / 0.20)"
  },
  // Motion durations are not strongly tokenised by Boosted publicly; kept aligned
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
  // --- Anatomy primitives (Orange) -----------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // 1px field / card / outline-button border
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Control density. Boosted inputs/buttons measure 2.5rem (40px) medium, 3.125rem
  // (50px) large, 1.875rem (30px) small. Inline padding ~0.75rem (Bootstrap base).
  density: {
    sm: { controlHeight: "1.875rem", paddingBlock: "0", paddingInline: "0.5rem", gap: "0.5rem", minWidth: "1.875rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.375rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1.125rem" }
  },
  // Orange typography: Helvetica Neue stack for controls/fields/labels/display.
  // Labels are bold; button labels keep regular weight, no transform.
  typography: {
    control: { family: "'Helvetica Neue', Helvetica, Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Helvetica Neue', Helvetica, Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Helvetica Neue', Helvetica, Arial, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Boosted links are UNDERLINED at rest ($link-decoration: underline); the rest
    // colour is black with an orange hover. We surface the AA-safe orange #f16e00
    // as the link role and keep the underline.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // disabled controls dim to 0.5 (à confirmer)
  transition: { property: "background-color, border-color, color, box-shadow, outline-color", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // FOCUS = a DOUBLE ring (Boosted accessible focus-visible). Boosted exposes
  // `$focus-visible-outer-color: $black` and `$focus-visible-inner-color: $white`:
  // a black outer outline wrapped in a white separator halo, visible on any
  // background. Encoded as the double-ring strategy with the black outer colour.
  focus: {
    strategy: "double",
    width: "2px", // outer ring width
    offset: "2px",
    color: orangeColor.grey.black, // #000000 outer ring (white inner drawn by the builder)
    inset: "0"
  },
  // Form fields are BOXED (outline): a white fill, a 1px subtle-grey border
  // (#cccccc = $border-color-subtle) and SQUARE corners. `style:"outline"` makes
  // the builder draw four equal borders from `surface.default` + `border.subtle`.
  // The native <select> chevron is redrawn in black with a 40px right gutter.
  field: {
    style: "outline",
    fillBg: orangeColor.grey.white, // #ffffff ($input-bg = body-bg)
    underlineColor: orangeColor.grey[400], // #cccccc (unused for outline, kept for completeness)
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23000000' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: a 1px BLACK border ($border-color = $black), square corners, light hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: orangeColor.grey[100] // #f6f6f6
  },
  // Secondary button = SOLID BLACK (Boosted `.btn-secondary` = $secondary = $black,
  // white text), darkening on hover.
  buttonSecondary: {
    background: orangeColor.grey.black, // #000000 black fill
    border: orangeColor.grey.black, // #000000 border
    hoverBackground: orangeColor.grey[800] // #333333 darker on hover (à confirmer)
  },
  // Tabs / top-nav: active tab = bold orange label with a bottom orange underline.
  tabs: {
    activeText: orangeColor.orange.dark, // #f16e00 AA-safe orange
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
  // Pagination: square black-bordered page boxes; active page = filled bright
  // orange with BLACK text (Boosted active = $supporting-orange + $black).
  pagination: {
    background: "transparent",
    border: orangeColor.grey.black, // #000000 1px black box border
    borderWidth: "1px",
    text: orangeColor.grey.black, // #000000 page link text (hover orange)
    activeBackground: orangeColor.orange.bright, // #ff7900 filled active page
    activeText: orangeColor.grey.black, // #000000 black on orange
    activeBorderWidth: "1px",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb: orange links, dark current page, grey separators.
  breadcrumb: {
    linkText: orangeColor.orange.dark, // #f16e00
    text: orangeColor.grey[600], // #666666 trail text
    currentText: orangeColor.grey.black, // #000000 current page
    separator: orangeColor.grey[600], // #666666
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
    text: orangeColor.grey.black, // #000000 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "700",
    lineHeight: "1.5rem" // 24px
  },
  // Tag: a small SQUARE grey chip (radius 0 — Boosted flattens pills/tags).
  tag: {
    radius: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: orangeColor.grey[200], // #eeeeee
    neutralText: orangeColor.grey.black // #000000
  },
  // Badge: a SQUARE filled badge (radius 0). Info variant = functional blue.
  badge: {
    radius: "0",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: orangeColor.system.info, // #4170d8 functional blue
    infoText: orangeColor.grey.white // white on blue
  },
  // Checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: orangeColor.grey.black // #000000
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
    textColor: orangeColor.grey.black // #000000
  }
} as const;

// --- semantic (Orange-specific role mapping) -------------------------------
const semantic = {
  surface: {
    default: orangeColor.grey.white, // white ($body-bg)
    subtle: orangeColor.grey[100], // #f6f6f6 light surface
    raised: orangeColor.grey.white, // white
    inverse: orangeColor.grey.black, // #000000 black inverse surface (Orange's signature black panels)
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop (black tint)
  },
  text: {
    primary: orangeColor.grey.black, // #000000 body text ($body-color = $black)
    secondary: orangeColor.grey[700], // #595959 muted dark grey
    muted: orangeColor.grey[600], // #666666 ($body-secondary-color)
    inverse: orangeColor.grey.white, // white on dark / coloured surfaces
    link: orangeColor.orange.dark // #f16e00 AA-safe orange (Boosted link rest = black + underline, hover orange)
  },
  border: {
    subtle: orangeColor.grey[400], // #cccccc field stroke ($border-color-subtle)
    strong: orangeColor.grey.black, // #000000 high-contrast border ($border-color = $black)
    interactive: orangeColor.orange.bright // #ff7900 active / interactive
  },
  action: {
    primary: orangeColor.orange.bright, // #ff7900 brand orange primary button
    primaryHover: orangeColor.orange.dark, // #f16e00 darker orange on hover
    primaryText: orangeColor.grey.black, // #000000 BLACK text on orange (Boosted signature)
    secondary: orangeColor.grey.black, // #000000 black secondary button ($secondary = $black)
    secondaryHover: orangeColor.grey[800], // #333333
    secondaryText: orangeColor.grey.white, // white text on black secondary
    danger: orangeColor.system.error // #cd3c14 functional red
  },
  feedback: {
    success: orangeColor.system.success,
    warning: orangeColor.system.warning,
    error: orangeColor.system.error,
    info: orangeColor.system.info
  },
  status: {
    pending: orangeColor.system.warning,
    processing: orangeColor.system.info,
    completed: orangeColor.system.success,
    failed: orangeColor.system.error
  },
  // Categorical data-vis palette built from the Boosted functional + supporting
  // hues. Boosted does not publish an 8-colour sequential scale, so this is a
  // coherent proposal drawn from the palette (see MAPPING.md, "à confirmer").
  data: {
    category1: orangeColor.orange.bright, // #ff7900 orange
    category2: orangeColor.system.info, // #4170d8 blue
    category3: orangeColor.system.success, // #228722 green
    category4: orangeColor.system.warning, // #ffcc00 yellow
    category5: orangeColor.system.error, // #cd3c14 red
    category6: orangeColor.system.purple, // #a885d8 purple
    category7: orangeColor.system.pink, // #ffb4e6 pink
    category8: orangeColor.grey[600] // #666666 grey
  }
} as const;

/**
 * The Orange theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Orange (Boosted) values, and the `component`
 * layer is REBUILT from this theme's own semantic/foundation via `createComponent`
 * — so the Orange brand (square corners, black borders, orange-with-black-text
 * buttons, double-ring focus) reaches the components, not just the elements that
 * read semantic vars directly.
 */
export const orangeTheme: TenantTheme = {
  id: "orange",
  label: "Orange",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default orangeTheme;
