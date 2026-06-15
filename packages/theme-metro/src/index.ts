import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * METRO (metro.ca — the Québec grocery & pharmacy retailer) theme for the
 * Sentropic token structure.
 *
 * Metro's identity is a CLEAN RED-ON-WHITE GROCERY system: the signature METRO
 * RED (#D81E05 — the brand red, measured 17× across metro.ca CSS) drives every
 * primary CTA, link and brand accent; ink is a dark grey #333333 on white
 * surfaces with a faint grey #f5f5f5 page tint; and a set of warm "department"
 * hues (a produce green, citrus yellow/orange, a magenta and a blue) form the
 * categorical data palette. The red, ink, greys and borders below are MEASURED
 * from metro.ca's stylesheets; the radii, the focus radius, hover red and the
 * status/feedback hues are DERIVED and flagged "à confirmer" in MAPPING.md.
 *
 * Form fields are BOXED outlines (white fill, thin grey #e3e3e3 stroke); focus is
 * a 2px red outline in the brand red #D81E05. Typography is Roboto (the measured
 * roboto-regular family — names only, not sourced from a font binary). Where
 * Sentropic needs a role Metro does not publish, the closest measured hex is used
 * and the choice is noted "à confirmer" in MAPPING.md.
 *
 * Metro colour reference (measured from metro.ca CSS, derived noted):
 *   Brand red (action / brand / link)   #D81E05   measured Metro red (17×)
 *   Brand red hover / active            #b01804   darker red on hover (à confirmer)
 *   Dept green (produce)                #199B6F   department green (data + success)
 *   Dept yellow (citrus)                #FAB32C   department yellow (data)
 *   Dept orange                         #F18E00   department orange (data + warning)
 *   Dept orange-red                     #F24A16   department orange-red (data)
 *   Dept magenta                        #D74B9D   department magenta (data)
 *   Dept blue                           #3387e6   department blue (data + info)
 *   Dark grey ink (text primary)        #333333   measured primary ink (à confirmer)
 *   Secondary text                      #5a5a5a   measured secondary text
 *   Muted text                          #a0a0a0   muted text
 *   White (surface default)             #ffffff   surface default / raised / CTA text
 *   Subtle surface (page grey)          #f5f5f5   measured faint page grey
 *   Field border / divider              #e3e3e3   measured subtle border
 *   Strong border                       #737373   measured strong border
 *   Reversed surface                    #292929   measured dark reversed surface (à confirmer)
 */

// --- METRO raw colour palette (measured hex from metro.ca CSS) ---------------
const metroColor = {
  // The brand IS the Metro red. Used for the brand mark, every primary CTA,
  // links and red accents. (measured brand red — appears 17× in the CSS)
  red: {
    500: "#D81E05", // measured Metro brand red — THE Metro red
    600: "#b01804", // darker red on hover/active (à confirmer)
    100: "#fcebe8" // faint red tint (derived for soft fills — à confirmer)
  },
  // "Department" hues from metro.ca's category styling. These drive the
  // categorical data palette (and a few feedback roles).
  dept: {
    green: "#199B6F", // produce green
    yellow: "#FAB32C", // citrus yellow
    orange: "#F18E00", // department orange
    orangeRed: "#F24A16", // department orange-red
    magenta: "#D74B9D", // department magenta
    blue: "#3387e6" // department blue
  },
  // Neutral ink scale (Metro body ink is a dark grey, not pure black).
  ink: {
    default: "#333333", // measured primary ink (à confirmer)
    secondary: "#5a5a5a", // measured secondary text
    muted: "#a0a0a0", // muted text
    reverse: "#292929" // measured dark reversed surface (à confirmer)
  },
  // Grey neutral scale (faint page greys + field/divider strokes).
  grey: {
    100: "#f5f5f5", // measured faint page grey
    200: "#e3e3e3", // measured subtle border / divider
    600: "#737373" // measured strong border
  },
  white: "#ffffff", // surface default / raised / CTA text
  // System / status colours (mostly drawn from the measured department hues).
  system: {
    success: "#199B6F", // feedback success (department green — measured)
    warning: "#F18E00", // feedback warning (department orange — measured)
    error: "#D81E05", // feedback error (brand red — measured)
    info: "#3387e6" // feedback info (department blue — measured-ish, à confirmer)
  }
} as const;

// --- foundation (METRO-specific values) -------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (action / primary / link). Metro's PRIMARY
    // ACTION is RED, so the action steps are mapped to the red scale; the lightest
    // step is the faint red tint.
    blue: {
      10: metroColor.red[100], // #fcebe8 faint red tint
      60: metroColor.red[500], // #D81E05 THE Metro red (primary action)
      80: metroColor.red[600] // #b01804 deep red (hover/active ground)
    },
    // Sentropic "cyan" accent slot. Metro's clearest cool accent is the
    // department blue; mapped here so a distinct accent survives (à confirmer).
    cyan: {
      10: "#e6f0fc", // faint blue tint (derived — à confirmer)
      50: metroColor.dept.blue, // #3387e6 department blue accent
      70: "#1f6fd0" // deeper blue (derived — à confirmer)
    },
    // Sentropic "slate" neutral family mapped onto the Metro ink and grey ramp.
    slate: {
      0: metroColor.white, // #ffffff white
      10: metroColor.grey[100], // #f5f5f5 page grey
      20: metroColor.grey[200], // #e3e3e3 divider / subtle border
      60: metroColor.ink.secondary, // #5a5a5a secondary text
      80: metroColor.ink.default, // #333333 primary ink
      90: metroColor.ink.reverse // #292929 strongest ink / reversed surface
    },
    feedback: {
      success: metroColor.system.success,
      warning: metroColor.system.warning,
      error: metroColor.system.error,
      info: metroColor.system.info
    }
  },
  // Metro's site type is Roboto (measured roboto-regular). We reference the
  // Roboto family by NAME only with an Arial/Helvetica fallback. Mono is not part
  // of Metro — the Sentropic mono stack is kept.
  font: {
    sans: "'Roboto', Arial, Helvetica, sans-serif",
    display: "'Roboto', Arial, Helvetica, sans-serif",
    mono: "ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Metro spacing: a standard 4/8px-based ramp aligned to the Sentropic step
  // keys (exact paddings not separately tokenised — "à confirmer").
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
  // Metro radii (à confirmer — not separately measured): mildly rounded grocery
  // controls. md 4px for controls, lg 8px for cards, sm 2px for chips.
  radius: {
    none: "0",
    sm: "2px", // small chips (à confirmer)
    md: "4px", // controls / inputs (à confirmer) — drives button.radius
    lg: "8px", // cards / larger surfaces (à confirmer)
    pill: "999px" // fully-rounded pill (tags / badges)
  },
  // Metro elevation (à confirmer — mapped to the three Sentropic slots from a
  // standard light-surface elevation ramp).
  shadow: {
    subtle: "0 1px 3px rgb(0 0 0 / 0.12)",
    medium: "0 4px 8px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.16), 0 2px 4px rgb(0 0 0 / 0.10)"
  },
  // Metro transitions (à confirmer — kept aligned with the base).
  motion: {
    fast: "120ms",
    normal: "200ms",
    slow: "320ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Metro-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (METRO) ------------------------------------------
  // Metro field/divider strokes 1px solid #e3e3e3 (measured); brand accent
  // borders 1px #D81E05. thick 2px kept for emphasis.
  borderWidth: {
    none: "0",
    thin: "1px", // input + divider stroke (measured #e3e3e3)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Metro control density (à confirmer — a comfortable ~44px md control with
  // sm/lg brackets, standard retail sizing).
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.625rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0.75rem", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1rem" }
  },
  // Metro typography = Roboto (measured roboto-regular, family name only). Base
  // type 16px.
  typography: {
    control: { family: "'Roboto', Arial, Helvetica, sans-serif", size: "1rem", weight: "700", lineHeight: "1.125", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Roboto', Arial, Helvetica, sans-serif", size: "1rem", weight: "400", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Roboto', Arial, Helvetica, sans-serif", size: "1rem", weight: "700", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Metro links: brand red, underline on hover (à confirmer).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.4", // controls disabled at ≈ 40% (à confirmer)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // METRO FOCUS = a 2px RED OUTLINE in the brand red #D81E05 (focus.strategy
  // "outline", 2px). The red brand drives the focus indicator on this grocery UI.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: metroColor.red[500], // #D81E05 — brand red focus indicator
    inset: "0"
  },
  // METRO form fields are BOXED (outline): a white fill with a thin grey stroke
  // (1px solid #e3e3e3, measured). `style: "outline"` makes the builder draw four
  // equal borders from `surface.default` + `border.subtle`. The native <select>
  // chevron is redrawn in the dark ink with a 36px right gutter.
  field: {
    style: "outline",
    fillBg: metroColor.white, // #ffffff
    underlineColor: metroColor.grey[200], // #e3e3e3 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23333333' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.25rem"
  },
  // Metro cards: white surface, mildly rounded (8px), a soft grey border and a
  // faint grey hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: metroColor.grey[100] // #f5f5f5 faint grey hover
  },
  // Metro secondary button = grey fill (measured action.secondary #f5f5f5),
  // dark reversed ink, slightly darker grey on hover.
  buttonSecondary: {
    background: metroColor.grey[100], // #f5f5f5 grey secondary surface
    border: metroColor.grey[200], // #e3e3e3 stroke
    hoverBackground: metroColor.grey[200] // #e3e3e3 hover
  },
  // Metro tabs / sub-nav: active tab = red bold label with a red bottom
  // indicator, transparent fill.
  tabs: {
    activeText: metroColor.red[500], // #D81E05 active label (brand red)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // red underline on the bottom edge
    indicatorMode: "border" // a real bottom border indicator
  },
  // Metro pagination: borderless link text; active page = filled red pill with
  // white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: metroColor.red[500], // #D81E05 link text (brand red)
    activeBackground: metroColor.red[500], // #D81E05 filled active page (brand red)
    activeText: metroColor.white, // white on red
    activeBorderWidth: "0",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Metro breadcrumb: red links, grey trail, dark current page, grey separators.
  breadcrumb: {
    linkText: metroColor.red[500], // #D81E05
    text: metroColor.ink.secondary, // #5a5a5a trail text
    currentText: metroColor.ink.default, // #333333 current page (ink)
    separator: metroColor.ink.secondary, // #5a5a5a
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "700" // current page is emphasised
  },
  // Metro notice / alert: a tinted box with a coloured left filet matching the
  // severity.
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
  // Metro accordion / disclosure: a bold dark summary trigger, mildly rounded,
  // grey-separated.
  accordion: {
    text: metroColor.ink.default, // #333333 summary label (ink)
    paddingBlock: "1rem", // 16px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "700", // summary triggers are bold
    lineHeight: "1.5rem" // 24px
  },
  // Metro tag: a small PILL chip with a faint grey fill and dark ink.
  tag: {
    radius: "999px", // pill
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: metroColor.grey[100], // #f5f5f5 faint grey fill
    neutralText: metroColor.ink.default // #333333 ink
  },
  // Metro badge: a small filled badge — brand red fill / white text.
  badge: {
    radius: "999px", // pill
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "700",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: metroColor.red[500], // #D81E05 brand red
    infoText: metroColor.white // white on red
  },
  // Metro checkbox/radio label: regular dark type at base size.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: metroColor.ink.default // #333333 ink
  },
  // Metro search input: a boxed grey-stroked field, base type.
  search: {
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Metro toggle / switch label: regular dark type.
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.5rem", // 24px
    textColor: metroColor.ink.default // #333333 ink
  }
} as const;

// --- semantic (METRO-specific role mapping) ---------------------------------
const semantic = {
  surface: {
    default: metroColor.white, // #ffffff white
    subtle: metroColor.grey[100], // #f5f5f5 page grey
    raised: metroColor.white, // #ffffff white
    inverse: metroColor.ink.reverse, // #292929 dark reversed surface (à confirmer)
    overlay: "rgb(0 0 0 / 0.6)" // modal backdrop
  },
  text: {
    primary: metroColor.ink.default, // #333333 measured primary ink (à confirmer)
    secondary: metroColor.ink.secondary, // #5a5a5a measured secondary text
    muted: metroColor.ink.muted, // #a0a0a0 muted text
    inverse: metroColor.white, // white on dark/red surfaces
    link: metroColor.red[500] // #D81E05 link (brand red)
  },
  border: {
    subtle: metroColor.grey[200], // #e3e3e3 divider / input stroke (measured)
    strong: metroColor.grey[600], // #737373 stronger border (measured)
    interactive: metroColor.red[500] // #D81E05 brand red (interactive accent)
  },
  action: {
    primary: metroColor.red[500], // #D81E05 THE Metro red CTA
    primaryHover: metroColor.red[600], // #b01804 red hover/active (à confirmer)
    primaryText: metroColor.white, // white text on red
    secondary: metroColor.grey[100], // #f5f5f5 grey secondary surface
    secondaryHover: metroColor.grey[200], // #e3e3e3
    secondaryText: metroColor.ink.reverse, // #292929 dark secondary label
    danger: metroColor.red[500] // #D81E05 danger (brand red)
  },
  feedback: {
    success: metroColor.system.success, // #199B6F department green (measured)
    warning: metroColor.system.warning, // #F18E00 department orange (measured)
    error: metroColor.system.error, // #D81E05 brand red
    info: metroColor.system.info // #3387e6 department blue (à confirmer)
  },
  status: {
    pending: metroColor.system.warning, // #F18E00
    processing: metroColor.system.info, // #3387e6
    completed: metroColor.system.success, // #199B6F
    failed: metroColor.system.error // #D81E05
  },
  // Categorical data-vis palette. Metro's "department" hues (green, yellow,
  // orange, orange-red, magenta, blue) lead, with the brand red and a secondary
  // ink rounding out the eight categories. See MAPPING.md.
  data: {
    category1: metroColor.red[500], // #D81E05 brand red
    category2: metroColor.dept.green, // #199B6F produce green
    category3: metroColor.dept.blue, // #3387e6 department blue
    category4: metroColor.dept.yellow, // #FAB32C citrus yellow
    category5: metroColor.dept.magenta, // #D74B9D department magenta
    category6: metroColor.dept.orange, // #F18E00 department orange
    category7: metroColor.dept.orangeRed, // #F24A16 department orange-red
    category8: metroColor.ink.secondary // #5a5a5a secondary ink
  }
} as const;

/**
 * The METRO theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Metro-specific (red-on-white grocery) values,
 * and the `component` layer is REBUILT from this theme's own semantic/foundation
 * via `createComponent` — so Metro's red CTA, dark-grey ink, boxed fields and red
 * focus reach the components (buttons, tabs, pagination, chat bubbles…), not just
 * the elements that read semantic vars directly.
 */
export const metroTheme: TenantTheme = {
  id: "metro",
  label: "Metro",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default metroTheme;
