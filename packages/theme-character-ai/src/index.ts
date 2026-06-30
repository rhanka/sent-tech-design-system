import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Character.AI theme for the Sentropic token structure.
 *
 * All values below were MEASURED from the PUBLIC Character.AI website
 * (character.ai, light theme `html.light`) by reading the live computed CSS
 * custom properties (the `--G*` neutral scale, the `--*-refresh` design-system
 * roles, and the measured button / input / heading geometry). We only reference
 * the font *names* (atHauss, characterSans, Inter) here, never font binaries.
 * Sources + provenance are documented in MAPPING.md. Where Character.AI has no
 * direct equivalent for a Sentropic role, the closest brand token is used and
 * the choice is noted "à confirmer" in MAPPING.md.
 *
 * Character.AI identity = PLAYFUL: a near-neutral greyscale UI (the `--G*`
 * ramp) with vivid coloured accents — brand blue `#195eff` (interactive /
 * focus), a playful green `#1ebe53` and purple `#b460eb` — and heavy rounding
 * (pill buttons `30px`/`9999px`, `--radius: 2rem` containers). The primary CTA
 * is a DARK pill `#202024`, with blue reserved for interaction.
 *
 * Character.AI colour reference (light theme, measured):
 *   White (background / cards)        #ffffff   (--background-refresh / --card)
 *   Grey 100 (page background)        #f4f4f5   (--G100 / --background)
 *   Grey 150 (subtle surface)         #ececee   (--G150 / --brand-bg)
 *   Grey 200 (divider / border)       #e4e4e7   (--G200 / --border-divider)
 *   Grey 250 (outline border)         #d9d9df   (--G250 / --border-outline / --secondary)
 *   Grey 300 (accent / stronger)      #c8c8cf   (--G300 / --accent)
 *   Grey 400 (muted)                  #a2a2ac   (--G400 / --muted)
 *   Grey 500 (placeholder)            #7c7c87   (--G500 / --placeholder)
 *   Grey 600 (secondary text)         #585962   (--G600 / --muted-foreground)
 *   Grey 800 (primary text / icon)    #26272b   (--G800 / --foreground)
 *   Grey 850 (primary CTA / inverse)  #202024   (--G850 / --primary)
 *   Grey 950 (darkest button)         #131316   (--G950 / --button-background)
 *   Brand blue (interactive/focus)    #195eff   (--primary-refresh / --primary-blue)
 *   Link blue                         #3e87f3   (--link)
 *   Brand green (playful accent)      #1ebe53   (--secondary-refresh / --secondary-green)
 *   Brand purple (playful accent)     #b460eb   (--tertiary-refresh)
 *   Error red                         #cc3434   (--error / --Error)
 *   Warning orange                    #ff9800   (--warning / --Warning)
 */

// --- Character.AI raw colour palette (measured public CSS) ------------------
const characterAiColor = {
  // Brand blue — the interactive / focus / accent family (NOT the primary CTA).
  blue: {
    primary: "#195eff", // --primary-refresh / --primary-blue (#1a5eff) — interactive + focus
    link: "#3e87f3", // --link — link text (lighter blue)
    light: "#a0c9ff", // --link-light — light blue tint
    plus: "#138eed", // --plus-blue — Plus / upsell blue
    dark: "#1448d6" // darker brand blue for hover/active (derived — à confirmer)
  },
  // Playful green accent.
  green: {
    main: "#1ebe53" // --secondary-refresh / --secondary-green (rgba(30,190,83,1))
  },
  // Playful purple accent (mapped to the Sentropic "cyan" accent slot).
  purple: {
    main: "#b460eb", // --tertiary-refresh — playful purple
    light: "#e5dfeb", // --G175 / --brand-off-white-refresh — lavender tint
    dark: "#8550ff" // --labs-gradient mid stop — deeper violet
  },
  // System / status colours (measured brand tokens).
  system: {
    success: "#1ebe53", // brand green (fills/accents; see MAPPING for AA note)
    error: "#cc3434", // --error / --Error
    warning: "#ff9800", // --warning / --Warning (fills/icons; AA note in MAPPING)
    info: "#195eff" // brand blue
  },
  // Neutral greyscale — the measured `--G*` ramp (Character.AI's core neutrals).
  grey: {
    0: "#ffffff", // white — backgrounds / cards
    50: "#fafafa", // --G50 / --surface-base
    100: "#f4f4f5", // --G100 / --background (page bg)
    150: "#ececee", // --G150 / --brand-bg / --surface-elevation-1
    200: "#e4e4e7", // --G200 / --border-divider / --surface-variant
    250: "#d9d9df", // --G250 / --border-outline / --secondary
    300: "#c8c8cf", // --G300 / --accent
    400: "#a2a2ac", // --G400 / --muted
    500: "#7c7c87", // --G500 / --placeholder / --tertiary
    600: "#585962", // --G600 / --muted-foreground / --icon-secondary
    700: "#3f3f46", // --G700
    800: "#26272b", // --G800 / --foreground / --icon-primary (body text)
    850: "#202024", // --G850 / --primary (primary CTA + inverted brand bg)
    900: "#18181b", // --G900
    950: "#131316" // --G950 / --button-background (darkest)
  }
} as const;

// --- foundation (Character.AI-specific values) -----------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the Character.AI brand blue.
    blue: {
      10: characterAiColor.blue.light, // #a0c9ff light blue tint
      60: characterAiColor.blue.primary, // #195eff brand blue (interactive)
      80: characterAiColor.blue.dark // #1448d6 darker interactive (à confirmer)
    },
    // Character.AI has no cyan; the signature non-blue accent is the playful
    // purple, so the Sentropic "cyan" accent slot maps to the Character purple.
    cyan: {
      10: characterAiColor.purple.light, // #e5dfeb lavender tint
      50: characterAiColor.purple.main, // #b460eb playful purple accent
      70: characterAiColor.purple.dark // #8550ff deeper violet
    },
    // Sentropic "slate" role family mapped onto the measured `--G*` greyscale.
    slate: {
      0: characterAiColor.grey[0], // white
      10: characterAiColor.grey[100], // #f4f4f5 page background
      20: characterAiColor.grey[200], // #e4e4e7 borders / dividers
      60: characterAiColor.grey[600], // #585962 secondary text
      80: characterAiColor.grey[800], // #26272b primary text
      90: characterAiColor.grey[950] // #131316 darkest
    },
    feedback: {
      success: characterAiColor.system.success,
      warning: characterAiColor.system.warning,
      error: characterAiColor.system.error,
      info: characterAiColor.system.info
    }
  },
  // Character.AI ships "atHauss" (the primary UI / display / body grotesque),
  // "characterSans" (custom brand sans), and "Inter" as a fallback. Font *names*
  // only, never binaries. Character.AI publishes no brand monospace (à confirmer).
  font: {
    sans: "'atHauss', 'characterSans', Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'atHauss', 'characterSans', Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // Measured 4px-based spacing scale (--spacing-xxs 4 → --spacing-xl 24). Kept on
  // the Sentropic rem scale for component-grid fidelity.
  spacing: {
    0: "0",
    1: "0.25rem", // 4px (--spacing-xxs)
    2: "0.5rem", // 8px (--spacing-xs)
    3: "0.75rem", // 12px (--spacing-s)
    4: "1rem", // 16px (--spacing-m)
    6: "1.5rem", // 24px (--spacing-xl)
    8: "2rem", // 32px
    12: "3rem", // 48px
    16: "4rem" // 64px
  },
  // Character.AI aesthetic is HEAVILY ROUNDED (playful). Controls/inputs carry
  // the 12px control radius, cards 16px, containers up to `--radius: 2rem`, and
  // buttons/chips/avatars read as pills.
  radius: {
    none: "0",
    sm: "0.5rem", // 8px (--nextui-radius-small)
    md: "0.75rem", // 12px — button / input / tabs (--nextui-radius-medium)
    lg: "1rem", // 16px — cards (containers go to 2rem; à confirmer)
    pill: "999px" // pills / chips / avatars (buttons 30px / 9999px)
  },
  // Measured Character.AI elevation: soft, neutral, low-opacity shadows.
  shadow: {
    subtle: "0px 1px 1px rgba(0,0,0,0.12), 0px 2px 5px rgba(103,110,118,0.08)", // --shadow-refresh-control
    medium: "0px 0px 15px 0px rgb(0 0 0/0.03), 0px 2px 30px 0px rgb(0 0 0/0.08), 0px 0px 1px 0px rgb(0 0 0/0.3)", // --nextui-box-shadow-medium
    floating: "0px 15px 35px rgba(103,110,118,0.08), 0px 5px 15px rgba(0,0,0,0.12)" // --shadow-refresh-floating
  },
  // Motion durations are not exposed by Character.AI publicly; kept aligned with
  // the Sentropic base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Character-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Character.AI) -----------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // measured strokes are a 0.6px hairline; rounded to 1px (à confirmer)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Character.AI control density (measured): small pill buttons / inputs ≈ 40px
  // (md), large stacked OAuth buttons ≈ 50px (lg), with 16px horizontal padding.
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.5rem", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "0.875rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // Character.AI typography: atHauss everywhere (UI, body, headings). Measured —
  // buttons 14px / fields 16px / headings (h1) 36px weight 600 tracking -0.02em.
  typography: {
    control: { family: "'atHauss', Inter, system-ui, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.43", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'atHauss', Inter, system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'atHauss', Inter, system-ui, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.43", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Character.AI links are NOT underlined at rest (measured `text-decoration:
    // none`); underline on hover (à confirmer).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // --nextui-disabled-opacity
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // Character.AI FOCUS = the control outline RECOLORS to brand blue (measured
  // `--shadow-refresh-control-primary` = a `0 0 0 1px #195eff` stroke). Encoded
  // as a soft box-shadow ring in the brand blue.
  focus: {
    strategy: "ring",
    width: "2px",
    offset: "0",
    color: characterAiColor.blue.primary, // #195eff
    inset: "0"
  },
  // Character.AI form fields are BOXED (outline): white fill + a thin grey border
  // + the 12px control radius (measured input: white bg, 0.6px #c1c1c1 border).
  // Not a filled-underline. `style: "outline"` makes the builder draw four equal
  // borders from `surface.default` + `border.subtle`; focus tints them blue.
  field: {
    style: "outline",
    fillBg: characterAiColor.grey[0], // #ffffff
    underlineColor: characterAiColor.grey[300], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron as a neutral dark arrow, 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2326272b' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Character.AI card: a 1px grey border + 16px radius, subtle hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: characterAiColor.grey[50] // #fafafa
  },
  // Character.AI secondary button = OUTLINED (transparent fill, grey border +
  // dark text, light grey fill on hover). Measured "Se connecter" button.
  buttonSecondary: {
    background: "transparent",
    border: characterAiColor.grey[250], // #d9d9df stroke (--secondary)
    hoverBackground: characterAiColor.grey[150] // #ececee light fill on hover
  },
  // Character.AI tabs: active tab = brand-blue label with a bottom indicator
  // (the playful blue accent on the otherwise-neutral nav; à confirmer).
  tabs: {
    activeText: characterAiColor.blue.primary, // #195eff
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "500",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // Character.AI pagination: borderless blue links; active page = filled blue.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: characterAiColor.blue.primary, // #195eff link text
    activeBackground: characterAiColor.blue.primary, // #195eff filled active page
    activeText: characterAiColor.grey[0], // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Character.AI breadcrumb: blue links, dark current page, grey separators.
  breadcrumb: {
    linkText: characterAiColor.blue.primary, // #195eff
    text: characterAiColor.grey[600], // #585962 trail text
    currentText: characterAiColor.grey[800], // #26272b current page
    separator: characterAiColor.grey[400], // #a2a2ac
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "500" // current page is emphasised
  },
  // Character.AI notice / alert: a coloured LEFT accent filet on a transparent box.
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
  // Character.AI disclosure: a dark medium summary trigger.
  accordion: {
    text: characterAiColor.grey[800], // #26272b summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.875rem", // 14px
    fontWeight: "500", // medium
    lineHeight: "1.25rem" // 20px
  },
  // Character.AI tag: a pill-rounded grey chip (playful rounding).
  tag: {
    radius: "999px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    fontWeight: "500",
    lineHeight: "1.25rem", // 20px
    minHeight: "2rem", // 32px chip height
    neutralBackground: characterAiColor.grey[200], // #e4e4e7
    neutralText: characterAiColor.grey[800] // #26272b
  },
  // Character.AI badge: a small rounded filled badge.
  badge: {
    radius: "8px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1rem", // 16px
    infoBackground: characterAiColor.blue.primary, // #195eff
    infoText: characterAiColor.grey[0] // white
  },
  // Character.AI checkbox/radio label.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: characterAiColor.grey[800] // #26272b
  },
  // Character.AI search input.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Character.AI toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: characterAiColor.grey[800] // #26272b
  }
} as const;

// --- semantic (Character.AI-specific role mapping) -------------------------
const semantic = {
  surface: {
    default: characterAiColor.grey[0], // white (--background-refresh / --card)
    subtle: characterAiColor.grey[100], // #f4f4f5 page background / hover fill
    raised: characterAiColor.grey[0], // white
    inverse: characterAiColor.grey[850], // #202024 dark inverse surface (--brand-bg-inverted)
    overlay: "rgb(19 22 22 / 0.8)" // modal backdrop (--scrim-80)
  },
  text: {
    primary: characterAiColor.grey[800], // #26272b body text (--foreground)
    secondary: characterAiColor.grey[600], // #585962 (--muted-foreground)
    muted: characterAiColor.grey[500], // #7c7c87 placeholder (--placeholder)
    inverse: characterAiColor.grey[50], // #fafafa on dark / coloured surfaces
    link: characterAiColor.blue.primary // #195eff brand blue link
  },
  border: {
    subtle: characterAiColor.grey[200], // #e4e4e7 divider (--border-divider)
    strong: characterAiColor.grey[300], // #c8c8cf stronger (--accent)
    interactive: characterAiColor.blue.primary // #195eff focus / interactive
  },
  action: {
    primary: characterAiColor.grey[850], // #202024 primary CTA (dark pill, --primary)
    primaryHover: characterAiColor.grey[950], // #131316 darker (--button-background)
    primaryText: characterAiColor.grey[50], // #fafafa text on dark button
    secondary: characterAiColor.grey[200], // #e4e4e7 secondary surface
    secondaryHover: characterAiColor.grey[250], // #d9d9df
    secondaryText: characterAiColor.grey[850], // #202024 dark text
    danger: characterAiColor.system.error // #cc3434
  },
  feedback: {
    success: characterAiColor.system.success,
    warning: characterAiColor.system.warning,
    error: characterAiColor.system.error,
    info: characterAiColor.system.info
  },
  status: {
    pending: characterAiColor.system.warning,
    processing: characterAiColor.system.info,
    completed: characterAiColor.system.success,
    failed: characterAiColor.system.error
  },
  // Categorical data-vis palette built from the Character.AI playful accent set
  // (brand blue / green / purple) plus the measured system + secondary blues.
  // Character.AI publishes no 8-colour sequential scale, so this is a coherent
  // proposal (see MAPPING.md, "à confirmer").
  data: {
    category1: characterAiColor.blue.primary, // #195eff brand blue
    category2: characterAiColor.green.main, // #1ebe53 playful green
    category3: characterAiColor.purple.main, // #b460eb playful purple
    category4: characterAiColor.system.warning, // #ff9800 orange
    category5: characterAiColor.system.error, // #cc3434 red
    category6: characterAiColor.blue.link, // #3e87f3 link blue
    category7: characterAiColor.blue.plus, // #138eed plus blue
    category8: characterAiColor.grey[500] // #7c7c87 neutral grey
  }
} as const;

/**
 * The Character.AI theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Character.AI-specific values, and
 * the `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Character.AI brand reaches the components (buttons,
 * tabs, pagination, chat bubbles…), not just the elements that read semantic
 * vars directly.
 */
export const characterAiTheme: TenantTheme = {
  id: "character-ai",
  label: "Character.AI",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default characterAiTheme;
