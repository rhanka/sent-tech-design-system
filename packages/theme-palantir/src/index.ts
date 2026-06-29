import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Palantir Blueprint theme for the Sentropic token structure.
 *
 * Blueprint is Palantir's OPEN SOURCE design system (Apache-2.0). Every value
 * below is measured on the public Blueprint Sass tokens (`@blueprintjs/colors`
 * `_colors.scss`, `@blueprintjs/core` `_variables.scss` / `_color-aliases.scss`).
 * Blueprint ships no custom typeface — it uses the system font *stack* — so we
 * reference font names only, never binaries. Sources are documented in MAPPING.md.
 * Where Blueprint has no direct equivalent for a Sentropic role, the closest
 * Blueprint token is used and the choice is noted "à confirmer" in MAPPING.md.
 *
 * This is a DARK-FIRST clone: Palantir products (Foundry / Gotham) and the
 * Blueprint `.bp5-dark` skin are navy-dark by default, so `mode: "dark"` maps the
 * Sentropic semantic layer onto Blueprint's dark grays / aliases.
 *
 * Blueprint colour reference (the bits that drive this theme):
 *   App background (dark)      #1c2127  ($pt-dark-app-background-color / $dark-gray1)
 *   Panel / subtle surface     #252a31  ($dark-gray2)
 *   Raised / card surface      #2f343c  ($dark-gray3)
 *   Divider / subtle border    #383e47  ($dark-gray4)
 *   Default button fill        #404854  ($dark-gray5)
 *   Muted text / border        #5f6b7c  ($gray1, $pt-text-color-muted)
 *   Dark text colour           #f6f7f9  ($light-gray5, $pt-dark-text-color)
 *   Intent primary (blue)      #2d72d2  ($blue3, $pt-intent-primary)
 *   Dark link / light blue     #8abbff  ($blue5, $pt-dark-link-color)
 *   Intent success / warn/dang #238551 / #c87619 / #cd4246 ($green3/$orange3/$red3)
 */

// --- Blueprint raw colour palette (public, Apache-2.0) ----------------------
const blueprintColor = {
  // Grayscale ($black → $white).
  black: "#111418", // $black
  darkGray1: "#1c2127", // $dark-gray1 — dark app background / strongest dark surface
  darkGray2: "#252a31", // $dark-gray2 — panel / subtle surface
  darkGray3: "#2f343c", // $dark-gray3 — raised / card surface
  darkGray4: "#383e47", // $dark-gray4 — dark dividers / subtle border
  darkGray5: "#404854", // $dark-gray5 — default (non-intent) button fill on dark
  gray1: "#5f6b7c", // $gray1 — $pt-text-color-muted / strong border
  gray2: "#738091", // $gray2
  gray3: "#8f99a8", // $gray3
  gray4: "#abb3bf", // $gray4 — $pt-dark-text-color-muted
  gray5: "#c5cbd3", // $gray5
  lightGray1: "#d3d8de", // $light-gray1
  lightGray2: "#dce0e5", // $light-gray2
  lightGray3: "#e5e8eb", // $light-gray3
  lightGray4: "#edeff2", // $light-gray4
  lightGray5: "#f6f7f9", // $light-gray5 — $pt-dark-text-color / light app bg
  white: "#ffffff", // $white
  // Core intent ramps (1 = darkest → 5 = lightest).
  blue: {
    1: "#184a90", // $blue1
    2: "#215db0", // $blue2 — $pt-link-color
    3: "#2d72d2", // $blue3 — $pt-intent-primary
    4: "#4c90f0", // $blue4
    5: "#8abbff" // $blue5 — $pt-dark-link-color
  },
  green: {
    3: "#238551", // $green3 — $pt-intent-success
    4: "#32a467", // $green4 — lighter success for dark text/icons
    5: "#72ca9b" // $green5
  },
  orange: {
    3: "#c87619", // $orange3 — $pt-intent-warning
    4: "#ec9a3c", // $orange4 — lighter warning for dark
    5: "#fbb360" // $orange5
  },
  red: {
    3: "#cd4246", // $red3 — $pt-intent-danger
    4: "#e76a6e", // $red4 — lighter danger for dark text/icons
    5: "#fa999c" // $red5
  },
  // Extended ramps (used for the categorical data-vis scale). All official
  // Blueprint palette values; the *4 step is chosen for legibility on dark navy.
  cerulean: { 2: "#0f6894", 3: "#147eb3", 4: "#3fa6da", 5: "#68c1ee" }, // $cerulean* — the closest thing Blueprint has to "cyan"
  turquoise: { 3: "#00a396", 4: "#13c9ba" }, // $turquoise*
  violet: { 3: "#9d3f9d", 4: "#bd6bbd" }, // $violet*
  indigo: { 3: "#7961db", 4: "#9881f3" }, // $indigo*
  gold: { 3: "#d1980b", 4: "#f0b726" } // $gold*
} as const;

// --- foundation (Blueprint-specific values) --------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto Blueprint intent blue.
    blue: {
      10: blueprintColor.blue[5], // #8abbff lightest blue (dark link)
      60: blueprintColor.blue[3], // #2d72d2 intent primary
      80: blueprintColor.blue[2] // #215db0 darker interactive blue
    },
    // Blueprint has no "cyan"; its closest accent ramp is Cerulean, so the
    // Sentropic "cyan" accent slot maps onto Blueprint Cerulean.
    cyan: {
      10: blueprintColor.cerulean[5], // #68c1ee light cerulean
      50: blueprintColor.cerulean[3], // #147eb3 cerulean accent
      70: blueprintColor.cerulean[2] // #0f6894 darker cerulean
    },
    // Sentropic "slate" role family mapped onto the Blueprint neutral ramp
    // (light → dark). The dark semantic layer pulls the dark grays from here.
    slate: {
      0: blueprintColor.white, // #ffffff
      10: blueprintColor.lightGray5, // #f6f7f9 lightest
      20: blueprintColor.lightGray2, // #dce0e5 light borders
      60: blueprintColor.gray1, // #5f6b7c muted text / strong border
      80: blueprintColor.darkGray3, // #2f343c raised dark surface
      90: blueprintColor.darkGray1 // #1c2127 dark app background
    },
    feedback: {
      success: blueprintColor.green[3], // #238551 $pt-intent-success
      warning: blueprintColor.orange[3], // #c87619 $pt-intent-warning
      error: blueprintColor.red[3], // #cd4246 $pt-intent-danger
      info: blueprintColor.blue[3] // #2d72d2 $pt-intent-primary
    }
  },
  // Blueprint ships NO custom font — `$pt-font-family` is the platform system
  // stack; `$pt-font-family-monospace` is `monospace`. We reference names only.
  font: {
    sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', system-ui, sans-serif",
    display: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', system-ui, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace"
  },
  // Blueprint is built on a 4px sub-grid ($pt-grid-size = 10px for layout, but
  // spacing/sizing tokens resolve as 4px multiples). Kept aligned with the
  // Sentropic 4px-based rem scale for component-grid fidelity.
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
  // Blueprint uses a single small radius everywhere: $pt-border-radius = 4px.
  // Round elements (switch, round tag) use the pill radius.
  radius: {
    none: "0",
    sm: "0.125rem", // 2px (à confirmer — Blueprint mostly uses the single 4px)
    md: "0.25rem", // 4px — $pt-border-radius (button / input / tabs)
    lg: "0.25rem", // 4px — cards share the 4px radius
    pill: "999px" // round tag / switch track
  },
  // Blueprint DARK elevation shadows ($pt-dark-elevation-shadow-*): a 1px inset
  // hairline + stacked black drop shadows. Exact dp specs "à confirmer".
  shadow: {
    subtle: "0 0 0 1px rgb(17 20 24 / 0.2), 0 1px 1px rgb(17 20 24 / 0.4)",
    medium: "0 0 0 1px rgb(17 20 24 / 0.2), 0 2px 4px rgb(17 20 24 / 0.4), 0 8px 24px rgb(17 20 24 / 0.4)",
    floating: "0 0 0 1px rgb(17 20 24 / 0.2), 0 4px 8px rgb(17 20 24 / 0.4), 0 18px 46px 6px rgb(17 20 24 / 0.4)"
  },
  // Blueprint motion: $pt-transition-duration = 100ms, ease
  // cubic-bezier(0.4, 1, 0.75, 0.9). normal/slow extrapolated ("à confirmer").
  motion: {
    fast: "100ms",
    normal: "200ms",
    slow: "300ms",
    easing: "cubic-bezier(0.4, 1, 0.75, 0.9)"
  },
  // z-index roles are not Blueprint-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Blueprint) --------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Blueprint control density is DENSE: button/input heights are 24 / 30 / 40px
  // ($pt-*-height-small / default / -large). Horizontal padding ≈ $pt-grid-size
  // (10px) for default, 8px small, 15px large. Default font-size 14px.
  density: {
    sm: { controlHeight: "1.5rem", paddingBlock: "0", paddingInline: "0.5rem", gap: "0.5rem", minWidth: "1.5rem", fontSize: "0.75rem" },
    md: { controlHeight: "1.875rem", paddingBlock: "0", paddingInline: "0.625rem", gap: "0.5rem", minWidth: "1.875rem", fontSize: "0.875rem" },
    lg: { controlHeight: "2.5rem", paddingBlock: "0", paddingInline: "0.9375rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" }
  },
  // Blueprint typography: the system stack at 14px / line-height 1.28581.
  // Buttons & body are weight 400; labels lifted to 600 for hierarchy (à confirmer).
  typography: {
    control: { family: "inherit", size: "0.875rem", weight: "400", lineHeight: "1.28581", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "inherit", size: "0.875rem", weight: "400", lineHeight: "1.28581", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "inherit", size: "0.875rem", weight: "600", lineHeight: "1.28581", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Blueprint links are NOT underlined at rest (coloured text); underline on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // Blueprint disabled controls dim to ~50%
  transition: { property: "background-color, border-color, color, box-shadow", duration: "100ms", easing: "cubic-bezier(0.4, 1, 0.75, 0.9)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1rem", lg: "1.25rem" }, // Blueprint icons 16/20px
  // Blueprint FOCUS = a soft box-shadow RING in the intent blue around inputs
  // (the .bp5-input focus glow), not a native offset outline.
  focus: {
    strategy: "ring",
    width: "2px",
    offset: "2px",
    color: blueprintColor.blue[3], // #2d72d2 intent blue focus ring
    inset: "0"
  },
  // Blueprint form fields are BOXED (outline): a fill + a 1px inset hairline +
  // the 4px radius. On dark the fill is a slightly darker panel (#252a31) than
  // the app surface, giving the recessed-input look. `style: "outline"` makes the
  // builder draw four equal borders from `surface.default` + `border.subtle`;
  // the focus ring (above) tints the border on focus.
  field: {
    style: "outline",
    fillBg: blueprintColor.darkGray2, // #252a31 recessed dark input
    underlineColor: blueprintColor.darkGray4, // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in a light gray with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23abb3bf' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Blueprint .bp5-card on dark = the raised dark-gray3 surface with an elevation
  // shadow and NO 1px stroke; hover lifts to dark-gray4.
  card: {
    borderWidth: "0",
    background: blueprintColor.darkGray3, // #2f343c raised surface
    hoverBackground: blueprintColor.darkGray4, // #383e47
    lineHeight: "1.28581"
  },
  // Blueprint default (non-intent) button = a FILLED dark-gray button (dark-gray4)
  // with light text, lifting to dark-gray5 on hover. Not an outlined ghost button.
  buttonSecondary: {
    background: blueprintColor.darkGray4, // #383e47 filled default button
    border: "transparent",
    hoverBackground: blueprintColor.darkGray5 // #404854 lighter on hover
  },
  // Blueprint .bp5-tab[aria-selected] = intent-blue label with a bottom indicator
  // bar; on dark the selected label uses the lighter blue4 for legibility.
  tabs: {
    activeText: blueprintColor.blue[4], // #4c90f0 (lighter blue on dark)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0", // Blueprint tabs space via gap, no inline padding
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom", // bottom indicator bar
    indicatorMode: "border" // a real bottom border
  },
  // Blueprint ships no Pagination component; modelled from button styles: borderless
  // light links, active page = filled intent blue (à confirmer).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: blueprintColor.lightGray5, // #f6f7f9 light link text
    activeBackground: blueprintColor.blue[3], // #2d72d2 filled active page
    activeText: blueprintColor.white, // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "1.875rem", // 30px page box (Blueprint default control height)
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Blueprint .bp5-breadcrumb: muted gray trail links; the current crumb is the
  // bright heading colour with weight 600.
  breadcrumb: {
    linkText: blueprintColor.gray4, // #abb3bf muted link
    text: blueprintColor.gray4, // #abb3bf trail text
    currentText: blueprintColor.lightGray5, // #f6f7f9 bright current crumb
    separator: blueprintColor.gray1, // #5f6b7c
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "600" // .bp5-breadcrumb-current is weight 600
  },
  // Blueprint .bp5-callout = a TINTED panel (no border, no left filet): a subtle
  // dark-gray2 fill on dark, light text, generous padding.
  alert: {
    background: blueprintColor.darkGray2, // #252a31 tinted callout panel
    text: blueprintColor.lightGray5, // #f6f7f9
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0", // Blueprint callouts tint the whole box, no left bar
    filetWidth: "0",
    paddingTop: "0.625rem", // 10px
    paddingRight: "0.75rem", // 12px
    paddingBottom: "0.625rem", // 10px
    paddingLeft: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Blueprint .bp5-collapse trigger (no dedicated accordion): a medium light label.
  accordion: {
    text: blueprintColor.lightGray5, // #f6f7f9 summary label
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    fontWeight: "600",
    lineHeight: "1.25rem" // 20px
  },
  // Blueprint .bp5-tag: a small 4px-radius chip; default fill = dark-gray5, light
  // text. (The round variant uses the pill radius — not the default here.)
  tag: {
    radius: "0.25rem", // 4px — $pt-border-radius
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.375rem", // 6px
    fontSize: "0.75rem", // 12px
    fontWeight: "400",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px Blueprint tag min-height
    neutralBackground: blueprintColor.darkGray5, // #404854
    neutralText: blueprintColor.lightGray5 // #f6f7f9
  },
  // Badge (no Blueprint primitive): a small 4px-radius intent-blue badge (à confirmer).
  badge: {
    radius: "0.25rem", // 4px
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.75rem", // 12px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1rem", // 16px
    infoBackground: blueprintColor.blue[3], // #2d72d2
    infoText: blueprintColor.white // white
  },
  // Blueprint checkbox/radio label.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: blueprintColor.lightGray5 // #f6f7f9
  },
  // Blueprint search input wrapper padding.
  search: {
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.625rem", // 10px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Blueprint .bp5-switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: blueprintColor.lightGray5 // #f6f7f9
  }
} as const;

// --- semantic (Blueprint dark role mapping) --------------------------------
const semantic = {
  surface: {
    default: blueprintColor.darkGray1, // #1c2127 $pt-dark-app-background-color
    subtle: blueprintColor.darkGray2, // #252a31 panel / hover fill
    raised: blueprintColor.darkGray3, // #2f343c card / elevated surface
    inverse: blueprintColor.lightGray5, // #f6f7f9 light inverse surface (light app bg)
    overlay: "rgb(17 20 24 / 0.7)" // black ($black) backdrop
  },
  text: {
    primary: blueprintColor.lightGray5, // #f6f7f9 $pt-dark-text-color
    secondary: blueprintColor.gray4, // #abb3bf $pt-dark-text-color-muted
    muted: blueprintColor.gray3, // #8f99a8 dimmer muted / placeholder
    inverse: blueprintColor.darkGray1, // #1c2127 text on light surfaces
    link: blueprintColor.blue[5] // #8abbff $pt-dark-link-color
  },
  border: {
    subtle: blueprintColor.darkGray4, // #383e47 dark divider
    strong: blueprintColor.gray1, // #5f6b7c stronger border
    interactive: blueprintColor.blue[3] // #2d72d2 focus / interactive
  },
  action: {
    primary: blueprintColor.blue[3], // #2d72d2 $pt-intent-primary button
    primaryHover: blueprintColor.blue[2], // #215db0 darker hover (Blueprint darkens intents)
    primaryText: blueprintColor.white, // white text on blue
    secondary: blueprintColor.darkGray4, // #383e47 default-button surface
    secondaryHover: blueprintColor.darkGray5, // #404854 lighter on hover
    secondaryText: blueprintColor.lightGray5, // #f6f7f9 light text
    danger: blueprintColor.red[3] // #cd4246 $pt-intent-danger
  },
  // On dark, feedback/status text + icons use the lighter intent steps (*4) for
  // legibility on navy — Blueprint's dark-mode treatment of intent text.
  feedback: {
    success: blueprintColor.green[4], // #32a467
    warning: blueprintColor.orange[4], // #ec9a3c
    error: blueprintColor.red[4], // #e76a6e
    info: blueprintColor.blue[4] // #4c90f0
  },
  status: {
    pending: blueprintColor.orange[4], // #ec9a3c
    processing: blueprintColor.blue[4], // #4c90f0
    completed: blueprintColor.green[4], // #32a467
    failed: blueprintColor.red[4] // #e76a6e
  },
  // Categorical data-vis palette built from the Blueprint extended palette (the
  // *4 steps, tuned for dark backgrounds). Blueprint publishes the ramps but no
  // ordered 8-colour sequential scale, so the ordering is a coherent proposal
  // (see MAPPING.md, "à confirmer").
  data: {
    category1: blueprintColor.blue[4], // #4c90f0 blue
    category2: blueprintColor.green[4], // #32a467 green
    category3: blueprintColor.orange[4], // #ec9a3c orange
    category4: blueprintColor.red[4], // #e76a6e red
    category5: blueprintColor.violet[4], // #bd6bbd violet
    category6: blueprintColor.turquoise[4], // #13c9ba turquoise
    category7: blueprintColor.gold[4], // #f0b726 gold
    category8: blueprintColor.indigo[4] // #9881f3 indigo
  }
} as const;

/**
 * The Palantir Blueprint theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Blueprint-specific (dark) values,
 * and the `component` layer is REBUILT from this theme's own semantic/foundation
 * via `createComponent` — so Blueprint's dark brand reaches the components
 * (buttons, tabs, pagination, chat bubbles…), not just the elements that read
 * semantic vars directly.
 */
export const palantirTheme: TenantTheme = {
  id: "palantir",
  label: "Palantir",
  mode: "dark",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default palantirTheme;
