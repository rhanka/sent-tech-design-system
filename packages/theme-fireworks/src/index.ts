import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Fireworks AI theme for the Sentropic token structure.
 *
 * Every colour below is MEASURED on Fireworks AI's PUBLIC website CSS
 * (fireworks.ai) — the Tailwind v4 OKLCH design-token palette shipped in the
 * site stylesheet (`--color-purple-*`, `--color-neutrals-*`, `--color-marine-*`,
 * `--color-red-*`, `--color-success-*`, `--color-warning-*`, `--color-blue-*`,
 * and the dark `--background` token). The OKLCH values are converted to sRGB hex.
 * We only reference the font *names* (Aspekta — the app's primary UI typeface,
 * loaded in 4 weights; Favorit — the display accent; Inter — the fallback),
 * never font binaries. Sources are documented in MAPPING.md. Where Fireworks
 * publishes no direct equivalent for a Sentropic role, the closest measured
 * token is used and the choice is noted "à confirmer".
 *
 * The Fireworks brand (2024 Monogram redesign) is "inherently dark": a near-black
 * developer stage with a single vivid, electric "Fireworks Purple" accent and a
 * cool marine-teal secondary. This is therefore a DARK-FIRST clone (`mode:
 * "dark"`), mapping the site's dark surfaces + the purple brand accent onto the
 * Sentropic semantic layer. The light end of the measured ramp is kept for the
 * inverse surface.
 *
 * Fireworks colour reference (OKLCH tokens decoded to hex):
 *   Background  (dark app stage)  oklch(17.8% .0048 274.69) #101113 (--background)
 *   Neutrals 900 (deepest panel)  oklch(21% .01 264.38)     #16181d
 *   Neutrals 800 (card surface)   oklch(22% .01 285.92)     #1a1a1f
 *   Neutrals 700 (border / hover) oklch(28% .01 285.93)     #28282e
 *   Neutrals 600 (strong border)  oklch(35% .01 285.95)     #3a3a40
 *   Neutrals 400 (muted text)     oklch(52% 0 0)            #696969
 *   Neutrals 200 (secondary text) oklch(79% 0 0)            #bababa
 *   Neutrals 50  (primary text)   oklch(96% 0 0)            #f2f2f2
 *   Purple 400   (BRAND accent)   oklch(52% .28 284.9)      #6726fe (--color-purple-400)
 *   Purple 300   (bright purple)  oklch(58% .25 291.29)     #8349fe
 *   Purple 200   (light purple)   oklch(66% .2 294.66)      #9d72fe
 *   Purple 100   (lighter purple) oklch(74% .15 297.15)     #b695fd
 *   Purple 600   (deep purple)    oklch(35% .18 287)        #3c1590
 *   Marine 500   (teal secondary) oklch(83% .15 180.67)     #00e6cc (--color-marine-500)
 *   Marine 400 / 700              oklch(89% .16 181.63) / oklch(64% .11 180.47) #00fce2 / #1da28f
 *   Red 500      (error / danger) oklch(64% .21 28.54)      #f14539
 *   Success 400  (success, dark)  oklch(77% .18 155.5)      #26d581
 *   Warning 400  (warning, dark)  oklch(81% .16 75.65)      #fcb02a
 *   Blue 300     (info blue)      oklch(54% .26 263.91)     #1756ff
 */

// --- Fireworks raw colour palette (public fireworks.ai OKLCH tokens) --------
const fireworksColor = {
  // The vivid "Fireworks Purple" brand family — the single saturated brand hue
  // (--color-purple-*, the most-used accent on the site).
  purple: {
    100: "#b695fd", // --color-purple-100 — lightest brand tint
    200: "#9d72fe", // --color-purple-200 — light purple (links / tab labels on dark)
    300: "#8349fe", // --color-purple-300 — bright purple (primary hover)
    400: "#6726fe", // --color-purple-400 — THE Fireworks Purple brand accent
    500: "#501bc4", // --color-purple-500
    600: "#3c1590", // --color-purple-600 — deep brand purple
    900: "#1b0052" // --color-purple-900 — darkest brand purple
  },
  // Marine / teal — the cool secondary accent.
  marine: {
    400: "#00fce2", // --color-marine-400 — brightest teal
    500: "#00e6cc", // --color-marine-500 — secondary teal accent
    600: "#00d1b8", // --color-marine-600
    700: "#1da28f" // --color-marine-700 — darker teal
  },
  // Neutral ramp (the near-black developer stage → off-white text).
  neutral: {
    0: "#ffffff",
    50: "#f2f2f2", // --color-neutrals-50 — primary text on dark
    100: "#e8e8e8", // --color-neutrals-100
    200: "#bababa", // --color-neutrals-200 — secondary text
    300: "#ababab", // --color-neutrals-300
    400: "#696969", // --color-neutrals-400 — muted / placeholder text
    600: "#3a3a40", // --color-neutrals-600 — strong border
    700: "#28282e", // --color-neutrals-700 — subtle border / secondary hover
    800: "#1a1a1f", // --color-neutrals-800 — card / raised surface
    900: "#16181d", // --color-neutrals-900 — subtle / deepest panel
    bg: "#101113" // --background (oklch 17.8%) — the dark app stage
  },
  // Cool info blue (measured blue ramp — reserved for info / data-vis).
  blue: {
    300: "#1756ff", // --color-blue-300 — vivid info blue
    400: "#174ce0", // --color-blue-400
    500: "#143fc4" // --color-blue-500
  },
  // System / status colours — measured ramp, the lighter "400" steps chosen so
  // text/icons read on the near-black stage.
  system: {
    success: "#26d581", // --color-success-400
    warning: "#fcb02a", // --color-warning-400
    error: "#f14539", // --color-red-500
    info: "#00e6cc" // --color-marine-500 — teal info accent on dark (à confirmer)
  }
} as const;

// --- foundation (Fireworks-specific values) --------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family carries the BRAND action family here — mapped
    // onto the Fireworks Purple ramp (the brand's primary interactive hue).
    blue: {
      10: fireworksColor.purple[100], // #b695fd lightest brand tint
      60: fireworksColor.purple[400], // #6726fe Fireworks Purple (primary)
      80: fireworksColor.purple[600] // #3c1590 deep brand purple
    },
    // Sentropic "cyan" accent slot maps onto the Fireworks marine-teal secondary.
    cyan: {
      10: fireworksColor.marine[400], // #00fce2 bright teal
      50: fireworksColor.marine[500], // #00e6cc teal accent
      70: fireworksColor.marine[700] // #1da28f darker teal
    },
    // Sentropic "slate" role family mapped onto the Fireworks neutral ramp
    // (light → dark); the dark semantic layer pulls the blacks from the bottom.
    slate: {
      0: fireworksColor.neutral[0], // #ffffff
      10: fireworksColor.neutral[50], // #f2f2f2 off-white text / light surface
      20: fireworksColor.neutral[200], // #bababa secondary text / light border
      60: fireworksColor.neutral[400], // #696969 muted text / strong border
      80: fireworksColor.neutral[800], // #1a1a1f card surface on dark
      90: fireworksColor.neutral.bg // #101113 dark app stage
    },
    feedback: {
      success: fireworksColor.system.success,
      warning: fireworksColor.system.warning,
      error: fireworksColor.system.error,
      info: fireworksColor.system.info
    }
  },
  // Fireworks ships "Aspekta" (its primary UI typeface — loaded in weights
  // 400/550/700/900) for body & headings, "Favorit" (550) as the display accent,
  // and "Inter" as the system fallback. Mono uses IBM Plex Mono (the platform's
  // code voice — à confirmer). Font *names* only, never binaries.
  font: {
    sans: "'Aspekta', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Favorit', 'Aspekta', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace"
  },
  // Fireworks is built on a 4px-based rem scale (Tailwind). Aligned with the
  // Sentropic base for component-grid fidelity.
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
  // Fireworks (Tailwind v4) radii: moderately rounded controls/cards, pill CTAs.
  // Mapped from the measured `--radius*` scale (sm .25rem, md .375rem, lg .5rem,
  // xl .75rem); exact per-component radii approximate ("à confirmer").
  radius: {
    none: "0",
    sm: "0.375rem", // 6px
    md: "0.5rem", // 8px — button / input / tabs
    lg: "0.75rem", // 12px — cards
    pill: "999px" // chips / pill CTAs
  },
  // Dark elevation: soft, low-opacity black shadows. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.40)",
    medium: "0 4px 12px rgb(0 0 0 / 0.50)",
    floating: "0 8px 30px rgb(0 0 0 / 0.60)"
  },
  // Motion: the measured Tailwind standard easing (`--ease-in-out:
  // cubic-bezier(.4,0,.2,1)`). Durations kept aligned with the Sentropic base
  // ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Fireworks-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Fireworks) --------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Fireworks control density: comfortable. md targets ~40px with generous
  // horizontal padding; sm 32px, lg 48px ("à confirmer").
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.875rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.0625rem" }
  },
  // Fireworks typography: Aspekta throughout; labels/controls medium (550 → 500),
  // body/fields regular (400).
  typography: {
    control: { family: "'Aspekta', 'Inter', system-ui, sans-serif", size: "0.9375rem", weight: "500", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Aspekta', 'Inter', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Aspekta', 'Inter', system-ui, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Fireworks links are NOT underlined at rest (purple text); underline on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // dims disabled controls to ~50% on dark
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // Fireworks FOCUS = a soft box-shadow RING in the brand purple around the box
  // (the brand-accent focus technique on the dark stage). Exact spec "à confirmer".
  focus: {
    strategy: "ring",
    width: "3px",
    offset: "2px",
    color: fireworksColor.purple[400], // #6726fe Fireworks Purple focus ring
    inset: "0"
  },
  // Fireworks form fields are BOXED (outline): a recessed dark fill (neutrals-800)
  // with a 1px border and the rounded control radius. `style: "outline"` makes the
  // builder draw four equal borders from `surface.default` + `border.subtle`; the
  // focus ring (above) tints the border purple on focus.
  field: {
    style: "outline",
    fillBg: fireworksColor.neutral[800], // #1a1a1f recessed dark input
    underlineColor: fireworksColor.neutral[600], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the off-white text colour, 40px gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23f2f2f2' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Fireworks card on dark = the neutrals-800 surface with a subtle neutrals-700
  // hairline + 12px radius; hover lifts to the neutrals-700 tint.
  card: {
    borderWidth: "1px",
    background: fireworksColor.neutral[800], // #1a1a1f card surface
    hoverBackground: fireworksColor.neutral[700], // #28282e
    lineHeight: "1.5"
  },
  // Fireworks secondary button = a minimal GHOST button: transparent fill, a 1px
  // neutral outline + off-white text, with a subtle fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: fireworksColor.neutral[600], // #3a3a40 outline
    hoverBackground: fireworksColor.neutral[800] // #1a1a1f subtle fill on hover
  },
  // Fireworks tabs: active tab = light-purple label with a bottom indicator bar,
  // inactive tabs are muted grey.
  tabs: {
    activeText: fireworksColor.purple[200], // #9d72fe light brand purple
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "500",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // indicator on the bottom edge
    indicatorMode: "border" // a real bottom border in the brand purple
  },
  // Fireworks pagination: borderless purple links; active page = filled purple.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: fireworksColor.purple[200], // #9d72fe link text
    activeBackground: fireworksColor.purple[400], // #6726fe filled active page
    activeText: fireworksColor.neutral[0], // white on purple
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Fireworks breadcrumb: purple links, off-white current page, muted separators.
  breadcrumb: {
    linkText: fireworksColor.purple[200], // #9d72fe
    text: fireworksColor.neutral[400], // #696969 trail text
    currentText: fireworksColor.neutral[50], // #f2f2f2 current page
    separator: fireworksColor.neutral[400], // #696969
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "500" // current page is emphasised
  },
  // Fireworks callout / note = a TINTED dark panel (no border, no left filet): a
  // subtle neutrals-800 fill, off-white text, generous padding.
  alert: {
    background: fireworksColor.neutral[800], // #1a1a1f tinted panel
    text: fireworksColor.neutral[50], // #f2f2f2
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0", // whole box is tinted, no left bar
    filetWidth: "0",
    paddingTop: "0.875rem", // 14px
    paddingRight: "1rem", // 16px
    paddingBottom: "0.875rem", // 14px
    paddingLeft: "1rem", // 16px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Fireworks accordion / details: an off-white medium summary trigger.
  accordion: {
    text: fireworksColor.neutral[50], // #f2f2f2 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "0", // flush trigger
    fontSize: "0.9375rem", // 15px
    fontWeight: "500", // medium
    lineHeight: "1.5rem" // 24px
  },
  // Fireworks tag / chip: a pill-rounded subtle dark chip.
  tag: {
    radius: "999px", // pill
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.625rem", // 10px
    fontSize: "0.8125rem", // 13px
    fontWeight: "500",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: fireworksColor.neutral[800], // #1a1a1f
    neutralText: fireworksColor.neutral[50] // #f2f2f2
  },
  // Fireworks badge: a small rounded filled badge in the brand purple.
  badge: {
    radius: "0.375rem", // 6px
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: fireworksColor.purple[400], // #6726fe Fireworks Purple badge
    infoText: fireworksColor.neutral[0] // white on purple
  },
  // Fireworks checkbox/radio label.
  choice: {
    labelFontSize: "0.9375rem", // 15px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: fireworksColor.neutral[50] // #f2f2f2
  },
  // Fireworks search input.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Fireworks toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: fireworksColor.neutral[50] // #f2f2f2
  }
} as const;

// --- semantic (Fireworks dark role mapping) --------------------------------
const semantic = {
  surface: {
    default: fireworksColor.neutral.bg, // #101113 dark app stage (--background)
    subtle: fireworksColor.neutral[900], // #16181d subtle / hover surface
    raised: fireworksColor.neutral[800], // #1a1a1f card / elevated surface
    inverse: fireworksColor.neutral[50], // #f2f2f2 off-white inverse surface
    overlay: "rgb(16 17 19 / 0.7)" // dark stage backdrop
  },
  text: {
    primary: fireworksColor.neutral[50], // #f2f2f2 primary text
    secondary: fireworksColor.neutral[200], // #bababa secondary text
    muted: fireworksColor.neutral[400], // #696969 muted / placeholder text
    inverse: fireworksColor.neutral[900], // #16181d text on light surfaces
    link: fireworksColor.purple[200] // #9d72fe light brand-purple link
  },
  border: {
    subtle: fireworksColor.neutral[700], // #28282e dark divider
    strong: fireworksColor.neutral[600], // #3a3a40 stronger border
    interactive: fireworksColor.purple[400] // #6726fe brand interactive / focus
  },
  action: {
    primary: fireworksColor.purple[400], // #6726fe Fireworks Purple primary button
    primaryHover: fireworksColor.purple[300], // #8349fe brighter purple hover (dark)
    primaryText: fireworksColor.neutral[0], // #ffffff white text on purple
    secondary: fireworksColor.neutral[800], // #1a1a1f dark secondary surface
    secondaryHover: fireworksColor.neutral[700], // #28282e lighter on hover
    secondaryText: fireworksColor.neutral[50], // #f2f2f2 off-white text
    danger: fireworksColor.system.error // #f14539
  },
  feedback: {
    success: fireworksColor.system.success, // #26d581
    warning: fireworksColor.system.warning, // #fcb02a
    error: fireworksColor.system.error, // #f14539
    info: fireworksColor.system.info // #00e6cc teal
  },
  status: {
    pending: fireworksColor.system.warning, // #fcb02a
    processing: fireworksColor.system.info, // #00e6cc
    completed: fireworksColor.system.success, // #26d581
    failed: fireworksColor.system.error // #f14539
  },
  // Categorical data-vis palette built from the Fireworks brand + accent ramp.
  // Fireworks publishes no ordered 8-colour sequential scale, so the ordering is a
  // coherent proposal drawn from the measured tokens (see MAPPING.md, "à confirmer").
  data: {
    category1: fireworksColor.purple[400], // #6726fe Fireworks Purple
    category2: fireworksColor.marine[500], // #00e6cc marine teal
    category3: fireworksColor.blue[300], // #1756ff info blue
    category4: fireworksColor.system.success, // #26d581 green
    category5: fireworksColor.system.warning, // #fcb02a amber
    category6: "#fa7066", // --color-red-400 coral
    category7: fireworksColor.purple[200], // #9d72fe light purple
    category8: fireworksColor.neutral[300] // #ababab neutral grey
  }
} as const;

/**
 * The Fireworks AI theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Fireworks-specific (dark) values,
 * and the `component` layer is REBUILT from this theme's own semantic/foundation
 * via `createComponent` — so the Fireworks brand reaches the components (buttons,
 * tabs, pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const fireworksTheme: TenantTheme = {
  id: "fireworks",
  label: "Fireworks AI",
  mode: "dark",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default fireworksTheme;
