import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * You.com theme for the Sentropic token structure.
 *
 * Every value below is MEASURED from you.com's public CSS — the live design
 * tokens exposed as `--swatch--*` and `--_theme---*` CSS custom properties on
 * you.com (the brand "Iris" blue scale, the "cherry" violet accent scale, the
 * grey/zinc neutral scale, and the semantic role tokens) — cross-checked against
 * the official You.com brand guidelines (Iris #5368EE, Navy #222B5F,
 * Charcoal #121212, the Lavender/Orchid highlight family, typeface "Lumen Sans"
 * with "Manrope" fallback). Only font *names* are referenced, never binaries.
 * Sources and any derived value are documented in MAPPING.md ("à confirmer").
 *
 * You.com colour reference (light theme), from the live `--swatch--*` tokens:
 *   White (background default)         #ffffff
 *   Grey 50 (background alt)           #fafafa
 *   Zinc 100 / border-1 (subtle)       #f0f0f3
 *   Zinc 200 / menu stroke (border)    #e0e1e6
 *   Grey 200 (stronger border)         #d9d9de
 *   Grey 400 / text2-tertiary (muted)  #92939e
 *   Zinc 500 / text-secondary          #62636b
 *   Grey 600 (secondary text alt)      #5e5f6b
 *   Grey 800                           #42424a
 *   Zinc 900 / Charcoal (primary text) #121212
 *   Brand 100 / card bg (subtle blue)  #f7f9ff
 *   Brand 200 / selection bg           #eef2fe
 *   Brand 500 — Iris (action / link)   #5368ee
 *   Brand 700 (primary hover)          #4757c9
 *   Brand 800 — Navy (brand text)      #222b5f
 *   Cherry 500 (violet accent)         #9170e2
 *   Cherry 700 (deep violet)           #703fc2
 *   ydc toggle-on green                #37cd8f
 *   error                              #f04438
 *
 * Signature: Iris blue primary (#5368ee) with a Navy (#222b5f) brand anchor and
 * a violet "cherry" accent; charcoal text; faint blue card tints; tight-tracked
 * Lumen Sans headings; 6px button radius and pill search inputs.
 */

// --- You.com raw colour palette (measured from live --swatch--* tokens) ------
const youColor = {
  // Brand "Iris" blue family (--swatch--brand-*) — primary / action.
  brand: {
    50: "#fbfcff", // --swatch--brand-50
    100: "#f7f9ff", // --swatch--brand-100 — faint blue card background
    200: "#eef2fe", // --swatch--brand-200 — selection / icon-mute fill
    300: "#d3deff", // --swatch--brand-300
    400: "#acbdfa", // --swatch--brand-400 — light periwinkle
    500: "#5368ee", // --swatch--brand-500 — Iris (primary action / link)
    600: "#5061d5", // --swatch--brand-600
    700: "#4757c9", // --swatch--brand-700 — primary hover
    800: "#222b5f", // --swatch--brand-800 — Navy (brand text)
    900: "#121627", // --swatch--brand-900
    950: "#0d0e12" // --swatch--brand-950
  },
  // "Cherry" violet accent family (--swatch--cherry-*) — the signature non-blue
  // accent (maps onto the Sentropic "cyan" accent slot).
  cherry: {
    50: "#f7f6fd", // --swatch--cherry-50 / background--bg-secondary
    100: "#ecebf4", // --swatch--cherry-100
    200: "#e0dbf9", // --swatch--cherry-200 / border-2
    300: "#c8bef4", // --swatch--cherry-300
    400: "#ad99ec", // --swatch--cherry-400
    500: "#9170e2", // --swatch--cherry-500 — violet accent
    600: "#8051d6", // --swatch--cherry-600
    700: "#703fc2", // --swatch--cherry-700 — deep violet
    800: "#5d34a3", // --swatch--cherry-800
    900: "#4e2c86", // --swatch--cherry-900
    950: "#301b5a" // --swatch--cherry-950
  },
  // Neutral grey / zinc scale (--swatch--grey-* / --swatch--zinc-*).
  grey: {
    0: "#ffffff",
    50: "#fafafa", // --swatch--grey-50 — background alt
    100: "#f0f0f3", // --swatch--zinc-100 / border-1 — subtle surface / border
    200: "#e0e1e6", // --swatch--zinc-200 / menu stroke — border
    300: "#d9d9de", // --swatch--grey-200 — stronger border / secondary hover
    400: "#92939e", // --swatch--grey-400 / text2-tertiary — muted / placeholder
    500: "#62636b", // --swatch--zinc-500 / text-secondary
    600: "#5e5f6b", // --swatch--grey-600 — secondary text (alt)
    800: "#42424a", // --swatch--grey-800 — strong text
    900: "#121212" // --swatch--zinc-900 / Charcoal — primary text / dark surface
  },
  // System / status colours.
  system: {
    error: "#f04438", // --swatch--error
    success: "#14865c", // darkened from the ydc toggle-on mint #37cd8f for AA on white (à confirmer)
    warning: "#b25f00", // amber, derived — no official You.com warning token (à confirmer, AA on white)
    info: "#5368ee", // Iris
    mint: "#37cd8f" // ydc toggle-on / widget green (decorative — used in data scale)
  }
} as const;

// --- foundation (You.com-specific values) ----------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the You.com Iris brand scale.
    blue: {
      10: youColor.brand[200], // #eef2fe light fill / selection
      60: youColor.brand[500], // #5368ee Iris (primary)
      80: youColor.brand[700] // #4757c9 darker interactive / hover
    },
    // You.com has no cyan; the signature non-blue accent is the violet "cherry"
    // scale, so the Sentropic "cyan" accent slot maps onto cherry.
    cyan: {
      10: youColor.cherry[100], // #ecebf4 light violet tint
      50: youColor.cherry[500], // #9170e2 violet accent
      70: youColor.cherry[700] // #703fc2 deep violet
    },
    // Sentropic "slate" role family mapped onto the You.com grey/zinc scale.
    slate: {
      0: youColor.grey[0], // white
      10: youColor.grey[50], // #fafafa background alt
      20: youColor.grey[200], // #e0e1e6 borders
      60: youColor.grey[500], // #62636b secondary text
      80: youColor.grey[800], // #42424a strong text
      90: youColor.grey[900] // #121212 primary text / darkest
    },
    feedback: {
      success: youColor.system.success,
      warning: youColor.system.warning,
      error: youColor.system.error,
      info: youColor.system.info
    }
  },
  // You.com ships the custom "Lumen Sans" typeface (live body/menu font is
  // `"Lumen Sans", Arial, sans-serif`); the brand guidelines name "Manrope" as
  // the documented fallback. Font *names* only, never binaries. You.com publishes
  // no brand monospace, so a neutral system mono stack is used (à confirmer).
  font: {
    sans: "'Lumen Sans', Manrope, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
    display: "'Lumen Sans', Manrope, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace"
  },
  // Standard 4px-based rem spacing scale (aligned with the Sentropic base for
  // component-grid fidelity).
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
  // You.com radii: buttons measured at 6px, search inputs render as pills, cards
  // are softly rounded (~12px, à confirmer).
  radius: {
    none: "0",
    sm: "0.25rem", // 4px
    md: "0.375rem", // 6px — button / input / tabs (measured on you.com)
    lg: "0.75rem", // 12px — cards (à confirmer)
    pill: "999px" // pill search inputs / chips
  },
  // Soft neutral elevation; exact specs not published by You.com (à confirmer).
  shadow: {
    subtle: "0 1px 2px rgb(18 18 18 / 0.06), 0 1px 3px rgb(18 18 18 / 0.10)",
    medium: "0 4px 12px rgb(18 18 18 / 0.08), 0 2px 6px rgb(18 18 18 / 0.06)",
    floating: "0 12px 32px rgb(18 18 18 / 0.14), 0 4px 12px rgb(18 18 18 / 0.10)"
  },
  // Motion durations / easing kept aligned with the Sentropic base (à confirmer).
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not You.com-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (You.com) ----------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // You.com control density — modern compact controls (md ≈ 40px) with generous
  // horizontal padding. Exact heights à confirmer.
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" }
  },
  // You.com typography: Lumen Sans across the board, medium (500) for interactive
  // labels, regular (400) for fields. Headings use tight negative tracking on
  // you.com (h1 ≈ -1.5px) — conveyed via `font.display`.
  typography: {
    control: { family: "'Lumen Sans', Manrope, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.25", letterSpacing: "-0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Lumen Sans', Manrope, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Lumen Sans', Manrope, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // You.com links read as Iris-coloured text, not underlined at rest; underline
    // appears on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.4", // à confirmer
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // You.com FOCUS = an Iris-blue ring/glow around the control (the modern AI-UI
  // technique), not a native offset outline. Exact width à confirmer.
  focus: {
    strategy: "ring",
    width: "3px",
    offset: "2px",
    color: youColor.brand[500], // #5368ee Iris
    inset: "0"
  },
  // You.com form fields are BOXED & ROUNDED (outline): a light fill with a 1px
  // grey border and the 6px control radius; search inputs render as pills. The
  // focus ring (above) tints the border Iris on focus.
  field: {
    style: "outline",
    fillBg: youColor.grey[0], // #ffffff
    underlineColor: youColor.grey[100], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in Iris blue with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%235368ee' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // You.com card: a faint blue fill (brand-100) with a 1px subtle border.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: youColor.brand[100] // #f7f9ff
  },
  // You.com secondary button = a filled light-grey button (zinc-100), dark text,
  // darker grey fill on hover.
  buttonSecondary: {
    background: youColor.grey[100], // #f0f0f3
    border: youColor.grey[100], // #f0f0f3
    hoverBackground: youColor.grey[300] // #d9d9de (button-secondary--background-hover #cdced6, nearest swatch)
  },
  // You.com tabs: active tab = Iris label with a 2px bottom indicator (à confirmer).
  tabs: {
    activeText: youColor.brand[500], // #5368ee
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
  // You.com pagination: borderless Iris links; active page = filled Iris.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: youColor.brand[500], // #5368ee
    activeBackground: youColor.brand[500], // #5368ee filled active page
    activeText: youColor.grey[0], // white on Iris
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // You.com breadcrumb: Iris links, charcoal current page, grey separators.
  breadcrumb: {
    linkText: youColor.brand[500], // #5368ee
    text: youColor.grey[500], // #62636b trail text
    currentText: youColor.grey[900], // #121212 current page
    separator: youColor.grey[400], // #92939e
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "500"
  },
  // Banner / notice: a coloured LEFT accent filet on a transparent box.
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
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Expansion panel: a charcoal medium summary trigger.
  accordion: {
    text: youColor.grey[900], // #121212 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.875rem", // 14px
    fontWeight: "500",
    lineHeight: "1.25rem" // 20px
  },
  // Chip: a pill-rounded light-grey chip.
  tag: {
    radius: "16px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    fontWeight: "500",
    lineHeight: "1.25rem", // 20px
    minHeight: "2rem", // 32px
    neutralBackground: youColor.grey[100], // #f0f0f3
    neutralText: youColor.grey[800] // #42424a
  },
  // Badge: a small 4px-radius filled badge in Iris.
  badge: {
    radius: "4px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1rem", // 16px
    infoBackground: youColor.brand[500], // #5368ee
    infoText: youColor.grey[0] // white
  },
  // Checkbox/radio label.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: youColor.grey[900] // #121212
  },
  // Search input.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Toggle / switch — You.com's "on" track is Iris (--osano-toggle-on-track-color #5368ee).
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: youColor.grey[900] // #121212
  }
} as const;

// --- semantic (You.com-specific role mapping) ------------------------------
const semantic = {
  surface: {
    default: youColor.grey[0], // white
    subtle: youColor.brand[100], // #f7f9ff faint blue card background
    raised: youColor.grey[0], // white
    inverse: youColor.grey[900], // #121212 dark inverse surface (background--bg-dark)
    overlay: "rgb(18 18 18 / 0.45)" // modal backdrop (charcoal tint, matches --osano overlay)
  },
  text: {
    primary: youColor.grey[900], // #121212 primary text
    secondary: youColor.grey[500], // #62636b secondary text (text-secondary)
    muted: youColor.grey[400], // #92939e placeholder / tertiary text
    inverse: youColor.grey[0], // white on dark / coloured surfaces
    link: youColor.brand[500] // #5368ee Iris link (text-accent)
  },
  border: {
    subtle: youColor.grey[100], // #f0f0f3 default border (border-1)
    strong: youColor.grey[300], // #d9d9de stronger border
    interactive: youColor.brand[500] // #5368ee Iris focus / interactive
  },
  action: {
    primary: youColor.brand[500], // #5368ee Iris primary button
    primaryHover: youColor.brand[700], // #4757c9 button-primary--background-hover
    primaryText: youColor.grey[0], // white text on Iris
    secondary: youColor.grey[100], // #f0f0f3 secondary button fill
    secondaryHover: youColor.grey[300], // #d9d9de
    secondaryText: youColor.grey[900], // #121212 dark label on light secondary
    danger: youColor.system.error // #f04438
  },
  feedback: {
    success: youColor.system.success,
    warning: youColor.system.warning,
    error: youColor.system.error,
    info: youColor.system.info
  },
  status: {
    pending: youColor.system.warning,
    processing: youColor.system.info,
    completed: youColor.system.success,
    failed: youColor.system.error
  },
  // Categorical data-vis palette built from the You.com brand families (Iris
  // blue, cherry violet, Navy, ydc mint, coral error). You.com publishes no
  // 8-colour sequential data-vis scale, so this is a coherent proposal
  // (see MAPPING.md, "à confirmer").
  data: {
    category1: youColor.brand[500], // Iris #5368ee
    category2: youColor.cherry[500], // violet #9170e2
    category3: youColor.brand[800], // Navy #222b5f
    category4: youColor.system.mint, // ydc mint #37cd8f
    category5: youColor.system.error, // coral #f04438
    category6: youColor.cherry[700], // deep violet #703fc2
    category7: youColor.brand[400], // light periwinkle #acbdfa
    category8: youColor.grey[400] // grey #92939e
  }
} as const;

/**
 * The You.com theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry You.com-specific values measured from the
 * live you.com CSS, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so the You.com brand reaches the
 * components (buttons, tabs, pagination, chat bubbles…), not just the elements
 * that read semantic vars directly.
 */
export const youTheme: TenantTheme = {
  id: "you",
  label: "You.com",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default youTheme;
