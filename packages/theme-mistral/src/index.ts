import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Mistral AI (mistral.ai + chat.mistral.ai "Le Chat") theme for the Sentropic
 * token structure.
 *
 * Mistral's 2025 rebrand (Sylvain Boyer Studio) deliberately trades the cool
 * blue/purple "AI screen" aesthetic for a WARM, golden-hour identity: a pale
 * cream stage, near-black ink, sharp (0px) corners, and the unmistakable
 * "Mistral Block Gradient" — a flame ramp that flows yellow → gold → amber →
 * orange → flame → Mistral-orange. The values below are MEASURED from the
 * brand's PUBLIC site CSS / documented design tokens; we reference the font
 * *names* only (Inter / Arial system stack), never the binaries. Sources and
 * the full mapping are in MAPPING.md. Where Mistral publishes no token for a
 * Sentropic role (the cool feedback colours, the 8-step data scale, motion,
 * z-index), the closest measured value is used and flagged "à confirmer".
 *
 * Mistral colour reference (measured / documented, light theme):
 *   Warm Ivory (background default)     #fffaeb   the signature cream stage
 *   Cream (background subtle / sec btn) #fff0c2
 *   Pure White (raised cards / fields)  #ffffff
 *   Mistral Black (ink / inverse)       #1f1f1f
 *   Black Tint (secondary text)         #3d3d3d   hsl(0 0% 24%)
 *   Input border                        #e4e4e7   hsl(240 5.9% 90%)
 *   Mistral Orange (primary / brand)    #fa520f   hsl(17 96% 52%) — "Accent Orange"
 *   Mistral Flame                       #fb6424
 *   Block Orange                        #ff8105
 *   Sunshine 900 / 700 / 500 / 300      #ff8a00 / #ffa110 / #ffb83e / #ffd06a
 *   Block Gold                          #ffe295
 *   Bright Yellow                       #ffd900
 *   Mistral Red (gradient red end)      #e10500   rgb(225 5 0) — danger / error
 */

// --- Mistral raw colour palette (measured / documented brand tokens) --------
const mistralColor = {
  // The "Mistral Block Gradient" — the flame ramp that IS the brand. Mistral
  // Orange is the reddest/darkest end (the documented "Accent Orange",
  // hsl(17 96% 52%)) and the primary action colour; the yellow end closes the
  // ramp. Used for the primary CTA, links, focus ring, and the data-vis scale.
  flame: {
    orange: "#fa520f", // Mistral Orange — primary brand / "Accent Orange" hsl(17 96% 52%)
    hover: "#e1450a", // darker orange for primary :hover (derived — à confirmer)
    flame: "#fb6424", // Mistral Flame
    blockOrange: "#ff8105", // Block Orange
    sunshine900: "#ff8a00", // Sunshine 900
    sunshine700: "#ffa110", // Sunshine 700 (amber)
    sunshine500: "#ffb83e", // Sunshine 500
    sunshine300: "#ffd06a", // Sunshine 300
    gold: "#ffe295", // Block Gold (lightest flame tint)
    yellow: "#ffd900" // Bright Yellow (gradient top)
  },
  // Brand red — the red end of the gradient (rgb 225 5 0). Mistral publishes no
  // dedicated "error" token, so this measured red carries danger/error.
  red: "#e10500", // rgb(225 5 0)
  // Warm neutral surfaces — the cream "golden hour" stage.
  cream: {
    ivory: "#fffaeb", // Warm Ivory — background default (the signature cream)
    cream: "#fff0c2", // Cream — background subtle / secondary button fill
    white: "#ffffff" // Pure White — raised cards / field fill
  },
  // Ink scale. Mistral Black is the title/ink colour; the lighter steps are
  // measured (black tint, input border) or derived neutrals (à confirmer).
  ink: {
    black: "#1f1f1f", // Mistral Black — primary text / inverse surface
    tint: "#3d3d3d", // hsl(0 0% 24%) "Black Tint" — secondary text
    muted: "#6b6b6b", // muted / placeholder text (derived — à confirmer)
    border: "#e4e4e7" // hsl(240 5.9% 90%) — measured input/border colour
  },
  // System / status colours. Mistral publishes only the warm brand ramp + the
  // gradient red; success/warning/info are derived to read on the cream stage
  // (warning kept warm; info is a conventional accessible blue — à confirmer).
  system: {
    success: "#15803d", // green-700 (derived — Mistral has no success token)
    warning: "#b45309", // burnt amber, darkened for AA on cream (derived)
    error: "#e10500", // Mistral red (gradient red end)
    info: "#1f6feb" // conventional info blue (derived — Mistral has no info token)
  }
} as const;

// --- foundation (Mistral-specific values) ----------------------------------
const foundation = {
  color: {
    // Sentropic "blue" primary family mapped onto the flame ORANGE end (Mistral
    // has no blue — the primary action IS the flame).
    blue: {
      10: mistralColor.cream.cream, // light cream tint for low-emphasis surfaces
      60: mistralColor.flame.orange, // Mistral Orange (primary)
      80: mistralColor.flame.hover // darker interactive orange
    },
    // Sentropic "cyan" accent family mapped onto the flame AMBER/yellow end so
    // the accent slot carries the warmer half of the gradient.
    cyan: {
      10: mistralColor.flame.gold, // Block Gold (light amber tint)
      50: mistralColor.flame.sunshine700, // Sunshine 700 amber accent
      70: mistralColor.flame.blockOrange // Block Orange (darker amber)
    },
    // Sentropic "slate" neutral family mapped onto the warm cream + ink scale.
    slate: {
      0: mistralColor.cream.white, // white
      10: mistralColor.cream.ivory, // warm ivory (background alt)
      20: mistralColor.ink.border, // #e4e4e7 subtle borders / contrast background
      60: mistralColor.ink.muted, // muted / secondary-ish neutral text
      80: mistralColor.ink.tint, // strong text (black tint #3d3d3d)
      90: mistralColor.ink.black // title / primary ink (#1f1f1f)
    },
    feedback: {
      success: mistralColor.system.success,
      warning: mistralColor.system.warning,
      error: mistralColor.system.error,
      info: mistralColor.system.info
    }
  },
  // Mistral's deployed type ramp reads as a neutral grotesque sans at a single
  // weight (400 carries even the 82px display). The documented stack leads with
  // Inter (OFL) over an Arial / system fallback; mono is not a published Mistral
  // token (kept as a generic stack — à confirmer). Font *names* only.
  font: {
    sans: "'Inter', Arial, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Inter', Arial, ui-sans-serif, system-ui, -apple-system, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // Mistral spacing is an 8px base grid expressed in rem.
  spacing: {
    0: "0",
    1: "0.25rem", // 4px
    2: "0.5rem", // 8px (base unit)
    3: "0.75rem", // 12px
    4: "1rem", // 16px
    6: "1.5rem", // 24px
    8: "2rem", // 32px
    12: "3rem", // 48px
    16: "4rem" // 64px
  },
  // Mistral's aesthetic is SHARP: border-radius 0 across controls, fields and
  // cards (a measured brand signature). Only pill-shaped controls (the switch)
  // keep a full radius so they stay legible as toggles.
  radius: {
    none: "0",
    sm: "0", // controls square
    md: "0", // button / input / tabs — square
    lg: "0", // cards — square
    pill: "999px" // switch / pill toggles only
  },
  // Mistral's signature "golden hour" elevation: warm amber-tinted shadows
  // (the multi-layer cascade uses rgb(127 99 21 / …)). Exact stack "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(127 99 21 / 0.10)",
    medium: "0 4px 16px rgb(127 99 21 / 0.14)",
    floating: "0 12px 40px rgb(127 99 21 / 0.18)"
  },
  // Motion: documented instant/fast/standard steps (0 / 150 / 250ms), standard
  // easing, no bounce. `slow` extends the ramp (à confirmer).
  motion: {
    fast: "150ms",
    normal: "250ms",
    slow: "350ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Mistral-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Mistral) ----------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Mistral control density. Buttons/fields target a ~40px (md) box; sm/lg
  // bracket it. Mistral's measured button padding is tight (~12px); inline
  // padding here is kept generous for CTAs (exact paddings "à confirmer").
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.5rem", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" }
  },
  // Mistral typography = the neutral sans at WEIGHT 400 — size, not weight,
  // carries hierarchy (the brand signature: 400 even at 82px). Labels take a
  // mild 500 for form legibility (à confirmer). No transforms.
  typography: {
    control: { family: "'Inter', Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Inter', Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Inter', Arial, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.43", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Mistral links: the warm orange accent, underlined.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "0.08em", decorationOffset: "0.15em",
      textDecorationHover: "underline", decorationThicknessHover: "0.12em", decorationOffsetHover: "0.15em"
    }
  },
  disabledOpacity: "0.5", // disabled controls are dimmed (à confirmer)
  transition: { property: "background-color, border-color, color, outline-color", duration: "150ms", easing: "ease" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // Mistral FOCUS = an accent-orange RING (documented "accent color ring").
  focus: {
    strategy: "ring",
    width: "2px",
    offset: "2px",
    color: mistralColor.flame.orange, // #fa520f flame ring
    inset: "0"
  },
  // Mistral form fields are BOXED (outline): a white fill, a 1px #e4e4e7 border
  // and SQUARE corners (radius 0). Native <select> chevron redrawn in Mistral
  // Black with a 40px right gutter.
  field: {
    style: "outline",
    fillBg: mistralColor.cream.white, // #ffffff field fill
    underlineColor: mistralColor.ink.border, // #e4e4e7 (kept for completeness)
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%231f1f1f' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Mistral cards: a white tile on the cream stage with a 1px subtle border and
  // square corners; warm shadow does the lifting.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: mistralColor.cream.ivory // #fffaeb warm hover
  },
  // Mistral secondary button = a FILLED CREAM tile (no stroke), black label,
  // deepening to gold on hover.
  buttonSecondary: {
    background: mistralColor.cream.cream, // #fff0c2 cream fill
    border: "transparent",
    hoverBackground: mistralColor.flame.gold // #ffe295 gold on hover
  },
  // Mistral tabs: active tab = flame-orange bold-ish label with a bottom
  // orange underline; inactive tabs are transparent.
  tabs: {
    activeText: mistralColor.flame.orange, // #fa520f
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "500",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // Mistral pagination: borderless ink-text links; active page = filled black
  // (echoing the dark primary CTA on the marketing site).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: mistralColor.ink.black, // #1f1f1f link text
    activeBackground: mistralColor.ink.black, // #1f1f1f filled active page
    activeText: mistralColor.cream.ivory, // warm ivory on black
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem" // 24px
  },
  // Mistral breadcrumb: muted grey trail, black current page, orange links.
  breadcrumb: {
    linkText: mistralColor.flame.orange, // #fa520f link
    text: mistralColor.ink.muted, // #6b6b6b trail
    currentText: mistralColor.ink.black, // #1f1f1f current page
    separator: mistralColor.ink.muted, // #6b6b6b
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem", // 24px
    currentWeight: "500"
  },
  // Mistral alert: a coloured LEFT filet on a transparent box (square corners).
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
    paddingLeft: "1.25rem", // 20px (clears the filet)
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Mistral accordion: a dark summary trigger.
  accordion: {
    text: mistralColor.ink.black, // #1f1f1f
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "500",
    lineHeight: "1.5rem" // 24px
  },
  // Mistral tag: a SQUARE (radius 0) cream chip.
  tag: {
    radius: "0", // Mistral corners are sharp
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: mistralColor.cream.cream, // #fff0c2 cream chip
    neutralText: mistralColor.ink.black // #1f1f1f
  },
  // Mistral badge: a SQUARE (radius 0) filled badge.
  badge: {
    radius: "0",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "500",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: mistralColor.ink.black, // #1f1f1f
    infoText: mistralColor.cream.ivory // warm ivory text
  },
  // Mistral checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: mistralColor.ink.black // #1f1f1f
  },
  // Mistral search input wrapper.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Mistral toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: mistralColor.ink.black // #1f1f1f
  }
} as const;

// --- semantic (Mistral-specific role mapping) ------------------------------
const semantic = {
  surface: {
    default: mistralColor.cream.ivory, // #fffaeb warm ivory stage
    subtle: mistralColor.cream.cream, // #fff0c2 cream
    raised: mistralColor.cream.white, // #ffffff white cards / fields
    inverse: mistralColor.ink.black, // #1f1f1f Mistral Black inverse surface
    overlay: "rgb(31 31 31 / 0.6)" // modal backdrop (ink tint)
  },
  text: {
    primary: mistralColor.ink.black, // #1f1f1f Mistral Black ink
    secondary: mistralColor.ink.tint, // #3d3d3d black tint
    muted: mistralColor.ink.muted, // #6b6b6b
    inverse: mistralColor.cream.ivory, // warm ivory on dark surfaces
    link: mistralColor.flame.orange // #fa520f flame links
  },
  border: {
    subtle: mistralColor.ink.border, // #e4e4e7 (measured input border)
    strong: mistralColor.ink.muted, // #6b6b6b
    interactive: mistralColor.flame.orange // #fa520f focus / interactive
  },
  action: {
    primary: mistralColor.flame.orange, // #fa520f Mistral Orange primary
    primaryHover: mistralColor.flame.hover, // #e1450a darker orange
    primaryText: mistralColor.cream.white, // white on orange
    secondary: mistralColor.cream.cream, // #fff0c2 cream secondary surface
    secondaryHover: mistralColor.flame.gold, // #ffe295 gold on hover
    secondaryText: mistralColor.ink.black, // #1f1f1f
    danger: mistralColor.system.error // #e10500 Mistral red
  },
  feedback: {
    success: mistralColor.system.success,
    warning: mistralColor.system.warning,
    error: mistralColor.system.error,
    info: mistralColor.system.info
  },
  status: {
    pending: mistralColor.system.warning,
    processing: mistralColor.system.info,
    completed: mistralColor.system.success,
    failed: mistralColor.system.error
  },
  // Categorical data-vis palette = the Mistral Block Gradient (the flame ramp)
  // closed by the brand red and ink. Mistral does not publish an 8-step data
  // scale, but the gradient IS the brand's defining sequence (see MAPPING.md).
  data: {
    category1: mistralColor.flame.orange, // #fa520f Mistral Orange
    category2: mistralColor.flame.flame, // #fb6424 Flame
    category3: mistralColor.flame.blockOrange, // #ff8105 Block Orange
    category4: mistralColor.flame.sunshine700, // #ffa110 Amber
    category5: mistralColor.flame.yellow, // #ffd900 Bright Yellow
    category6: mistralColor.flame.gold, // #ffe295 Block Gold
    category7: mistralColor.red, // #e10500 Mistral Red
    category8: mistralColor.ink.black // #1f1f1f Mistral Black
  }
} as const;

/**
 * The Mistral AI theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Mistral-specific values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so Mistral's warm flame brand reaches the components
 * (buttons, tabs, pagination, chat bubbles…), not just the elements that read
 * semantic vars directly.
 */
export const mistralTheme: TenantTheme = {
  id: "mistral",
  label: "Mistral AI",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default mistralTheme;
