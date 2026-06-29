import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Vercel Geist design system theme for the Sentropic token structure.
 *
 * All values below are taken from Vercel's PUBLIC Geist design system (the open
 * Geist colour scales `--ds-*`, the Geist Sans / Geist Mono typefaces and the
 * documented control metrics). We only reference the font *names* (Geist Sans,
 * Geist Mono) here, never the font binaries. Sources are documented in
 * MAPPING.md. Where Geist publishes no direct equivalent for a Sentropic role,
 * the closest Geist token is used and the choice is noted "à confirmer" in
 * MAPPING.md.
 *
 * The Geist signature is an ultra-minimal, HIGH-CONTRAST monochrome look: the
 * primary action is pure BLACK (#000) on WHITE (#fff), the UI is built on the
 * Geist gray scale, and saturated hues (blue / red / amber / green / teal /
 * purple / pink) are reserved for status, links, focus and data-vis accents.
 *
 * Geist colour reference (light theme — `--ds-*` scales):
 *   White (background-100, default)     #ffffff
 *   Background-200 (alt surface)        #fafafa
 *   Gray 100 (subtle surface / hover)   #f2f2f2
 *   Gray 400 (default border)           #eaeaea
 *   Gray 500 (hover border)             #c9c9c9
 *   Gray 700 (muted text / strong)      #8f8f8f
 *   Gray 900 (secondary text)           #4d4d4d
 *   Gray 1000 (primary text)            #171717
 *   Pure black (primary action button)  #000000
 *   Blue 700 (links / focus / info)     #006bff
 *   Blue 800 (link hover)               #0059ec
 *   Red 800 (error / danger)            #ea001d
 *   Amber 700 (warning solid)           #ffae00  (darkened to #aa4d00 for AA text)
 *   Green 700 (success solid)           #28a948  (darkened to #107d32 for AA text)
 *   Purple 700 (signature accent)       #a000f8
 *   Teal 700                            #00ac96
 *   Pink 700                            #f22782
 */

// --- Geist raw colour palette (public `--ds-*` scales, light theme) --------
const vercelColor = {
  // Geist gray scale — the monochrome backbone of the whole UI.
  grey: {
    0: "#ffffff", // background-100 — default surface (white)
    50: "#fafafa", // background-200 — alt / subtle surface
    100: "#f2f2f2", // gray-100 — subtle surface / hover fill
    200: "#eaeaea", // gray-400 — default border
    400: "#c9c9c9", // gray-500 — hover border
    500: "#8f8f8f", // gray-700 — muted / placeholder text, strong border
    700: "#4d4d4d", // gray-900 — secondary text / icons
    900: "#171717", // gray-1000 — primary text / icons
    1000: "#000000" // pure black — iconic Vercel primary button / inverse surface
  },
  // Geist blue — links, focus ring and the "info" status accent.
  blue: {
    10: "#f0f7ff", // blue-100 — lightest blue tint
    700: "#006bff", // blue-700 — link / focus / info solid
    800: "#0059ec" // blue-800 — link hover / darker interactive
  },
  // Geist purple — the signature non-blue accent (the pink→purple→blue brand
  // gradient lives here); mapped to the Sentropic "cyan" accent slot.
  purple: {
    10: "#faf0ff", // purple-100 — light purple tint
    700: "#a000f8", // purple-700 — purple accent
    800: "#8500d1" // purple-800 — darker purple
  },
  // Geist red — error / destructive.
  red: {
    10: "#ffeeef", // red-100 — light red tint
    700: "#fc0035", // red-700 — vivid red solid
    800: "#ea001d" // red-800 — error / danger (AA ≈ 4.5 on white)
  },
  // Geist amber — warning.
  amber: {
    10: "#fff6de", // amber-100 — light amber tint
    700: "#ffae00", // amber-700 — amber solid fill
    900: "#aa4d00" // amber-900 — darkened amber for AA warning text on white
  },
  // Geist green — success.
  green: {
    10: "#ecfdec", // green-100 — light green tint
    700: "#28a948", // green-700 — green solid fill
    900: "#107d32" // green-900 — darkened green for AA success text on white
  },
  // Extra Geist accents used in the categorical data-vis scale.
  teal: "#00ac96", // teal-700
  pink: "#f22782", // pink-700
  // System / status colours (AA-checked on white where used as text).
  system: {
    success: "#107d32", // green-900 (AA on white)
    error: "#ea001d", // red-800 (AA ≈ 4.5 on white)
    warning: "#aa4d00", // amber-900 (AA on white; Geist amber solid = #ffae00)
    info: "#006bff" // blue-700 (Geist link/info blue)
  }
} as const;

// --- foundation (Geist-specific values) ------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the Geist blue (links / focus / info).
    blue: {
      10: vercelColor.blue[10], // blue-100
      60: vercelColor.blue[700], // blue-700 (primary blue)
      80: vercelColor.blue[800] // blue-800 (darker interactive)
    },
    // Geist has no cyan; the signature non-blue accent is the Geist purple (the
    // pink→purple→blue brand gradient), so the Sentropic "cyan" slot maps to it.
    cyan: {
      10: vercelColor.purple[10], // light purple tint
      50: vercelColor.purple[700], // purple accent
      70: vercelColor.purple[800] // darker purple
    },
    // Sentropic "slate" role family mapped onto the Geist gray scale.
    slate: {
      0: vercelColor.grey[0], // white
      10: vercelColor.grey[50], // background alt
      20: vercelColor.grey[200], // default border
      60: vercelColor.grey[500], // muted text / strong border
      80: vercelColor.grey[700], // secondary text
      90: vercelColor.grey[900] // primary text (gray-1000)
    },
    feedback: {
      success: vercelColor.system.success,
      warning: vercelColor.system.warning,
      error: vercelColor.system.error,
      info: vercelColor.system.info
    }
  },
  // Geist ships "Geist Sans" (UI / display / interactive) and "Geist Mono"
  // (code). When loaded via the `geist` npm package the CSS family resolves to
  // "Geist" / "Geist Mono". Font *names* only, never binaries.
  font: {
    sans: "'Geist Sans', Geist, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Geist Sans', Geist, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'Geist Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // Geist spacing is a 4px-based scale (4 → 96px). Aligned with the Sentropic
  // base for component-grid fidelity.
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
  // Geist aesthetic is LOW-RADIUS / crisp: controls use ~6px, cards ~12px, only
  // chips/avatars read as pills. (Geist radii: sm 6px, md 12px, full 9999px.)
  radius: {
    none: "0",
    sm: "0.25rem", // 4px
    md: "0.375rem", // 6px — button / input / tabs (Geist control radius)
    lg: "0.75rem", // 12px — cards (Geist md radius)
    pill: "9999px" // chips / avatars / pill badges
  },
  // Geist elevation: soft, neutral, low-opacity shadows. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.08)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 30px rgb(0 0 0 / 0.12)"
  },
  // Geist motion is not strongly tokenised publicly; kept aligned with the
  // Sentropic base with a standard ease ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Geist-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Geist) ------------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Geist control density (compact / high-density). Buttons: sm 32px, md 40px,
  // lg 48px (documented control heights) with tight horizontal padding.
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.625rem", gap: "0.375rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.5rem", paddingInline: "0.875rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "0.875rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1rem" }
  },
  // Geist typography: Geist Sans throughout. UI labels read at 14px / medium;
  // body & fields at 14px / regular.
  typography: {
    control: { family: "'Geist Sans', Geist, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Geist Sans', Geist, sans-serif", size: "0.875rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Geist Sans', Geist, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Geist links are NOT underlined at rest (blue or inherited text); the
    // underline appears on hover. Decoration offsets "à confirmer".
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.4", // Geist dims disabled controls to ~40%
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "ease" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1rem", lg: "1.25rem" }, // Geist icons 16/16/20px
  // Geist FOCUS = a soft box-shadow RING in the Geist blue (blue is the
  // documented focus colour), not a native offset outline. Exact technique
  // "à confirmer".
  focus: {
    strategy: "ring",
    width: "2px",
    offset: "2px",
    color: vercelColor.blue[700], // #006bff Geist focus blue
    inset: "0"
  },
  // Geist form fields are BOXED (outline): a white fill with a 1px light-grey
  // border (gray-400 #eaeaea) and a 6px radius — the crisp Geist input look.
  // `style: "outline"` makes the builder draw four equal borders from
  // `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: vercelColor.grey[0], // #ffffff
    underlineColor: vercelColor.grey[200], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in near-black with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23171717' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Geist card: a 1px light-grey border + 12px radius, subtle hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: vercelColor.grey[50] // #fafafa
  },
  // Geist secondary button = OUTLINED / "tertiary": transparent fill, a 1px
  // light-grey border, near-black text, with a subtle grey fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: vercelColor.grey[200], // #eaeaea light stroke
    hoverBackground: vercelColor.grey[100] // #f2f2f2 subtle fill on hover
  },
  // Geist tabs: active tab = near-black bold-ish label with a 2px near-black
  // bottom indicator (monochrome), inactive tabs are grey.
  tabs: {
    activeText: vercelColor.grey[900], // #171717
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "500",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom", // Geist indicator on the bottom edge
    indicatorMode: "border" // a real 2px bottom border (near-black)
  },
  // Geist pagination: borderless grey text links; active page = filled black.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: vercelColor.grey[700], // #4d4d4d grey link text
    activeBackground: vercelColor.grey[1000], // #000000 filled active page
    activeText: vercelColor.grey[0], // white on black
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Geist breadcrumb: grey links, near-black current page, grey separators.
  breadcrumb: {
    linkText: vercelColor.grey[500], // #8f8f8f
    text: vercelColor.grey[500], // #8f8f8f trail text
    currentText: vercelColor.grey[900], // #171717 current page
    separator: vercelColor.grey[500], // #8f8f8f
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "500" // current page is emphasised
  },
  // Geist callout / note: a coloured LEFT accent filet on a transparent box.
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
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Geist accordion: a near-black medium summary trigger.
  accordion: {
    text: vercelColor.grey[900], // #171717 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "0", // Geist accordion trigger is flush
    fontSize: "0.875rem", // 14px
    fontWeight: "500", // Geist medium
    lineHeight: "1.25rem" // 20px
  },
  // Geist badge / chip: a pill-rounded subtle-grey chip.
  tag: {
    radius: "9999px", // Geist badges are pill-rounded
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: vercelColor.grey[100], // #f2f2f2
    neutralText: vercelColor.grey[900] // #171717
  },
  // Geist badge: a pill-rounded filled badge.
  badge: {
    radius: "9999px",
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: vercelColor.blue[700], // #006bff
    infoText: vercelColor.grey[0] // white
  },
  // Geist checkbox/radio label.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: vercelColor.grey[900] // #171717
  },
  // Geist search input.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.875rem", // 14px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Geist toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: vercelColor.grey[900] // #171717
  }
} as const;

// --- semantic (Geist-specific role mapping) --------------------------------
const semantic = {
  surface: {
    default: vercelColor.grey[0], // white (background-100)
    subtle: vercelColor.grey[50], // #fafafa (background-200)
    raised: vercelColor.grey[0], // white
    inverse: vercelColor.grey[1000], // #000000 pure-black inverse surface
    overlay: "rgb(0 0 0 / 0.6)" // modal backdrop (pure black tint)
  },
  text: {
    primary: vercelColor.grey[900], // #171717 (gray-1000)
    secondary: vercelColor.grey[700], // #4d4d4d (gray-900)
    muted: vercelColor.grey[500], // #8f8f8f (gray-700 placeholder)
    inverse: vercelColor.grey[0], // white on dark / coloured surfaces
    link: vercelColor.blue[700] // #006bff Geist blue link
  },
  border: {
    subtle: vercelColor.grey[200], // #eaeaea (gray-400 default border)
    strong: vercelColor.grey[500], // #8f8f8f (gray-700 strong border)
    interactive: vercelColor.blue[700] // #006bff focus / interactive
  },
  action: {
    primary: vercelColor.grey[1000], // #000000 iconic black primary button
    primaryHover: "#383838", // dark-grey hover (à confirmer)
    primaryText: vercelColor.grey[0], // white text on black
    secondary: vercelColor.grey[0], // #ffffff secondary surface (outlined button)
    secondaryHover: vercelColor.grey[100], // #f2f2f2
    secondaryText: vercelColor.grey[900], // #171717 near-black text
    danger: vercelColor.system.error // #ea001d
  },
  feedback: {
    success: vercelColor.system.success,
    warning: vercelColor.system.warning,
    error: vercelColor.system.error,
    info: vercelColor.system.info
  },
  status: {
    pending: vercelColor.system.warning,
    processing: vercelColor.system.info,
    completed: vercelColor.system.success,
    failed: vercelColor.system.error
  },
  // Categorical data-vis palette built from the Geist accent scales. Geist does
  // not publish an 8-colour sequential data-vis scale, so this is a coherent
  // proposal drawn from the Geist accent hues (see MAPPING.md, "à confirmer").
  data: {
    category1: vercelColor.blue[700], // blue-700
    category2: vercelColor.purple[700], // purple-700
    category3: vercelColor.green[700], // green-700
    category4: vercelColor.amber[700], // amber-700
    category5: vercelColor.pink, // pink-700
    category6: vercelColor.teal, // teal-700
    category7: vercelColor.red[700], // red-700
    category8: vercelColor.grey[500] // gray-700 (neutral)
  }
} as const;

/**
 * The Vercel Geist theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Geist-specific values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Geist brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const vercelTheme: TenantTheme = {
  id: "vercel",
  label: "Vercel",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default vercelTheme;
