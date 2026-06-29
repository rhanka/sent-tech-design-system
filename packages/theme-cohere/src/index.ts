import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Cohere theme for the Sentropic token structure.
 *
 * All values below are MEASURED on Cohere's PUBLIC website CSS (cohere.com — a
 * Next.js / Tailwind build) and the published Pentagram brand palette. We only
 * reference the font *names* (CohereText, CohereVariable, CohereHeadline,
 * CohereMono) here, never the font binaries (the typeface is proprietary).
 * Sources are documented in MAPPING.md. Where Cohere publishes no direct
 * equivalent for a Sentropic role, the closest brand token is used and the
 * choice is noted "à confirmer" in MAPPING.md.
 *
 * Cohere colour reference (light theme — measured on cohere.com CSS):
 *   Alabaster (page background)        #fafafa   (body background-color)
 *   White (raised cards)               #ffffff
 *   Light grey surface                 #f2f2f2   (--tw-ring-offset / fills)
 *   Warm beige divider (signature)     #d7cfc1   (border-color, 4×)
 *   Volcanic black (primary text)      #17171c   (color, 11×)
 *   Mine Shaft (primary dark)          #212121   (brand dark / gradients)
 *   Secondary text grey                #616161   (color, 6×)
 *   Warm stone grey (muted)            #8d8d86   (docs.cohere.com)
 *   Bittersweet / simulated coral      #ff7759   (accent, color 6× + gradients)
 *   Coral / rust (hover, darker)       #ca492d   (gradient-from)
 *   Light coral tint                   #ffd9d0   (gradient-from)
 *   Acrylic blue (focus ring / info)   #4c6ee6   (--tw-ring-color #4c6ee680)
 *   Acrylic blue dark                  #2d4cb9   (gradient-from)
 *   Coniferous green                   #355146   (gradient)
 *   Quartz purple                      #9b60aa   (color / background-color)
 *   Error red                          #b30000   (color, 3×)
 *
 * Cohere is a WARM, light brand: a cream (#fafafa) canvas, near-black volcanic
 * text, the signature coral accent, and a single synthetic "acrylic blue" used
 * for focus rings / interactive states.
 */

// --- Cohere raw colour palette (measured public CSS + Pentagram brand) ------
const cohereColor = {
  // Coral — "Bittersweet" / "simulated coral" — the brand accent (primary action).
  coral: {
    main: "#ff7759", // Bittersweet accent — primary action / link / highlight
    dark: "#ca492d", // darker coral / rust — hover/active (gradient-from)
    light: "#ffd9d0", // light coral tint (gradient-from)
    pale: "#ffe5e5" // palest coral wash (background-color)
  },
  // Acrylic blue — the synthetic secondary accent: focus rings + interactive + info.
  blue: {
    main: "#4c6ee6", // acrylic blue — focus ring (--tw-ring-color #4c6ee680), interactive
    dark: "#2d4cb9", // darker acrylic blue (gradient-from)
    light: "#8fa6f9", // light acrylic blue (gradient-from)
    pale: "#e5ebff", // palest blue tint (gradient-from)
    navy: "#142253" // deep navy (gradient-to) — data accent
  },
  // Warm neutral scale — cream → stone → volcanic black.
  neutral: {
    0: "#ffffff", // white — raised cards
    cream: "#fafafa", // Alabaster — page background (measured body bg)
    100: "#f2f2f2", // light grey surface / hover fill
    border: "#d7cfc1", // warm beige divider — signature Cohere border (4×)
    500: "#8d8d86", // warm stone grey — muted / placeholder (docs.cohere.com)
    600: "#616161", // secondary text (color, 6×)
    700: "#2e2e2e", // dark grey (color, 4×)
    mine: "#212121", // Mine Shaft — brand "Primary Dark"
    900: "#17171c" // volcanic black — primary text / dark inverse surface (11×)
  },
  // Secondary brand hues (pinks, purples, greens, neon) — used for data-vis.
  accent: {
    purple: "#9b60aa", // quartz purple (color / background-color)
    purpleLight: "#d18ee2", // light orchid (border-color / outline)
    green: "#355146", // coniferous green (gradient)
    greenBright: "#5ea538", // brighter green (gradient)
    sage: "#b2bbb6" // mushroom grey / sage (gradient-from)
  },
  // System / status colours (AA-checked on white where used as text).
  system: {
    success: "#355146", // coniferous green (dark, AA on white)
    error: "#b30000", // measured error red (color, 3×)
    warning: "#ca492d", // coral/rust — warm warning, AA ≈ 4.6 on white
    info: "#4c6ee6" // acrylic blue
  }
} as const;

// --- foundation (Cohere-specific values) -----------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the Cohere CORAL (the primary
    // brand accent / action). The slot name is historical; the values are coral.
    blue: {
      10: cohereColor.coral.light, // #ffd9d0 light coral tint
      60: cohereColor.coral.main, // #ff7759 Bittersweet (primary)
      80: cohereColor.coral.dark // #ca492d darker coral (interactive)
    },
    // Cohere's secondary synthetic accent is the "acrylic blue"; the Sentropic
    // "cyan" accent slot maps to it (focus rings / interactive / info).
    cyan: {
      10: cohereColor.blue.pale, // #e5ebff palest acrylic blue
      50: cohereColor.blue.main, // #4c6ee6 acrylic blue accent
      70: cohereColor.blue.dark // #2d4cb9 darker acrylic blue
    },
    // Sentropic "slate" role family mapped onto the warm Cohere neutral scale.
    slate: {
      0: cohereColor.neutral[0], // white
      10: cohereColor.neutral.cream, // #fafafa Alabaster background
      20: cohereColor.neutral.border, // #d7cfc1 warm beige border / contrast
      60: cohereColor.neutral[600], // #616161 secondary text
      80: cohereColor.neutral[700], // #2e2e2e strong text
      90: cohereColor.neutral[900] // #17171c volcanic black (primary text)
    },
    feedback: {
      success: cohereColor.system.success,
      warning: cohereColor.system.warning,
      error: cohereColor.system.error,
      info: cohereColor.system.info
    }
  },
  // Cohere ships a custom Pentagram/NaN typeface: "CohereVariable" / "CohereHeadline"
  // for display, "CohereText" for body/UI, "CohereMono" for code. Measured from the
  // cohere.com `font-family` stacks. Font *names* only, never binaries.
  font: {
    sans: "'CohereText', 'Unica77 Cohere Web', Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'CohereVariable', 'CohereHeadline', 'Space Grotesk', Inter, system-ui, -apple-system, sans-serif",
    mono: "'CohereMono', ui-monospace, 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', monospace"
  },
  // Standard 4px-based rem spacing scale (aligned with the Sentropic base for
  // component-grid fidelity; Cohere's Tailwind build uses the same 4px unit).
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
  // Cohere is gently ROUNDED ("slightly rounded corners… warmth", per Pentagram).
  // Measured Tailwind radii: rounded-sm 4px, rounded-md 6.8px, rounded-lg 12px,
  // rounded-xl 22px, rounded-full 9999px. The most common explicit radius is 8px
  // (8×) / 12px (7×). Controls land on 8px, cards on 12px.
  radius: {
    none: "0",
    sm: "0.25rem", // 4px (rounded-sm)
    md: "0.5rem", // 8px — button / input / tabs (most-used explicit radius)
    lg: "0.75rem", // 12px — cards (rounded-lg)
    pill: "999px" // chips / pills (rounded-full)
  },
  // Cohere uses soft, neutral, low-opacity shadows on a warm canvas. Exact specs
  // are not tokenised publicly ("à confirmer"); tinted with the volcanic black.
  shadow: {
    subtle: "0 1px 2px rgb(23 23 28 / 0.08)",
    medium: "0 4px 12px rgb(23 23 28 / 0.12)",
    floating: "0 8px 24px rgb(23 23 28 / 0.18)"
  },
  // Motion durations / standard easing — not tokenised publicly ("à confirmer"),
  // kept aligned with the Sentropic base.
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Cohere-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Cohere) -----------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Cohere control density: md targets ~40px with generous horizontal padding;
  // sm (32px) / lg (48px) follow the standard scale. Exact paddings "à confirmer".
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" }
  },
  // Cohere typography: CohereText for body/fields/labels; control labels medium.
  // Measured body = 16px / line-height 1.5 / weight 400.
  typography: {
    control: { family: "'CohereText', 'Unica77 Cohere Web', Inter, sans-serif", size: "0.9375rem", weight: "500", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'CohereText', 'Unica77 Cohere Web', Inter, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'CohereText', 'Unica77 Cohere Web', Inter, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Cohere links (coral) are not underlined at rest; underline appears on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.4", // dimmed disabled state ("à confirmer" exact value)
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // Cohere FOCUS = a soft box-shadow RING in the acrylic blue. Measured on
  // cohere.com (`--tw-ring-color:#4c6ee680` — a 50%-alpha acrylic-blue ring,
  // offset from the control). We use the solid acrylic blue for the token.
  focus: {
    strategy: "ring",
    width: "3px",
    offset: "2px",
    color: cohereColor.blue.main, // #4c6ee6 acrylic-blue focus ring
    inset: "0"
  },
  // Cohere form fields are BOXED & gently ROUNDED (outline): a white fill, a warm
  // 1px border and the 8px control radius. `style: "outline"` draws four equal
  // borders from `surface.default` + `border.subtle`; the acrylic-blue ring tints
  // the field on focus.
  field: {
    style: "outline",
    fillBg: cohereColor.neutral[0], // #ffffff crisp white input on the cream canvas
    underlineColor: cohereColor.neutral.border, // #d7cfc1 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the volcanic black with a 40px gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2317171c' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cohere card: a warm 1px beige outline + 12px radius, subtle hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: cohereColor.neutral[100] // #f2f2f2
  },
  // Cohere secondary button = a ghost/outlined button: transparent fill, warm
  // beige stroke + volcanic text, light grey state fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: cohereColor.neutral.border, // #d7cfc1 warm beige stroke
    hoverBackground: cohereColor.neutral[100] // #f2f2f2 light fill on hover
  },
  // Cohere tabs: active tab = coral label with a 2px coral bottom indicator.
  tabs: {
    activeText: cohereColor.coral.main, // #ff7759 coral active label + indicator
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "500",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom",
    indicatorMode: "border" // a real 2px bottom border in coral
  },
  // Cohere pagination: borderless dark text links; active page = filled coral
  // with volcanic black text (AA on coral).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: cohereColor.neutral[900], // #17171c resting page link text
    activeBackground: cohereColor.coral.main, // #ff7759 filled active page
    activeText: cohereColor.neutral[900], // #17171c dark text on coral (AA)
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Cohere breadcrumb: coral links, dark current page, stone separators.
  breadcrumb: {
    linkText: cohereColor.coral.main, // #ff7759
    text: cohereColor.neutral[600], // #616161 trail text
    currentText: cohereColor.neutral[900], // #17171c current page
    separator: cohereColor.neutral[500], // #8d8d86
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "500" // current page emphasised
  },
  // Cohere banner / notice: a coloured LEFT accent filet on a transparent box.
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
  // Cohere expansion panel: a dark medium summary trigger.
  accordion: {
    text: cohereColor.neutral[900], // #17171c summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.875rem", // 14px
    fontWeight: "500",
    lineHeight: "1.25rem" // 20px
  },
  // Cohere chip: a pill-rounded warm neutral chip.
  tag: {
    radius: "999px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    fontWeight: "500",
    lineHeight: "1.25rem", // 20px
    minHeight: "2rem", // 32px chip height
    neutralBackground: cohereColor.neutral[100], // #f2f2f2
    neutralText: cohereColor.neutral[900] // #17171c
  },
  // Cohere badge: a small 4px-radius filled badge (acrylic blue info).
  badge: {
    radius: "4px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1rem", // 16px
    infoBackground: cohereColor.blue.main, // #4c6ee6 acrylic blue
    infoText: cohereColor.neutral[0] // white
  },
  // Cohere checkbox/radio label.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: cohereColor.neutral[900] // #17171c
  },
  // Cohere search input.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Cohere toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: cohereColor.neutral[900] // #17171c
  }
} as const;

// --- semantic (Cohere-specific role mapping) -------------------------------
const semantic = {
  surface: {
    default: cohereColor.neutral.cream, // #fafafa Alabaster page background (measured body bg)
    subtle: cohereColor.neutral[100], // #f2f2f2 light grey surface / hover fill
    raised: cohereColor.neutral[0], // #ffffff raised cards pop white on the cream canvas
    inverse: cohereColor.neutral[900], // #17171c volcanic black dark surface
    overlay: "rgb(23 23 28 / 0.7)" // modal backdrop (volcanic black tint, measured #17171ccc ≈ 80%)
  },
  text: {
    primary: cohereColor.neutral[900], // #17171c volcanic black (most-used text colour)
    secondary: cohereColor.neutral[600], // #616161 secondary text
    muted: cohereColor.neutral[500], // #8d8d86 warm stone muted / placeholder
    inverse: cohereColor.neutral.cream, // #fafafa cream text on dark / coloured surfaces
    link: cohereColor.coral.main // #ff7759 coral link
  },
  border: {
    subtle: cohereColor.neutral.border, // #d7cfc1 warm beige divider (signature)
    strong: cohereColor.neutral[600], // #616161 stronger border
    interactive: cohereColor.blue.main // #4c6ee6 acrylic-blue focus / interactive
  },
  action: {
    primary: cohereColor.coral.main, // #ff7759 coral primary button
    primaryHover: cohereColor.coral.dark, // #ca492d darker coral hover
    primaryText: cohereColor.neutral[900], // #17171c volcanic black text on coral (AA ≈ 6.9)
    secondary: cohereColor.neutral[100], // #f2f2f2 secondary surface
    secondaryHover: cohereColor.neutral.border, // #d7cfc1 warm beige hover
    secondaryText: cohereColor.neutral[900], // #17171c
    danger: cohereColor.system.error // #b30000
  },
  feedback: {
    success: cohereColor.system.success,
    warning: cohereColor.system.warning,
    error: cohereColor.system.error,
    info: cohereColor.system.info
  },
  status: {
    pending: cohereColor.system.warning,
    processing: cohereColor.system.info,
    completed: cohereColor.system.success,
    failed: cohereColor.system.error
  },
  // Categorical data-vis palette built from the Cohere secondary brand hues
  // (coral, acrylic blue, coniferous green, quartz purple, orchid, sage, navy).
  // Cohere does not publish an 8-colour sequential data-vis scale, so this is a
  // coherent proposal (see MAPPING.md, "à confirmer").
  data: {
    category1: cohereColor.coral.main, // #ff7759 coral
    category2: cohereColor.blue.main, // #4c6ee6 acrylic blue
    category3: cohereColor.accent.green, // #355146 coniferous green
    category4: cohereColor.accent.purple, // #9b60aa quartz purple
    category5: cohereColor.accent.purpleLight, // #d18ee2 orchid
    category6: cohereColor.accent.greenBright, // #5ea538 bright green
    category7: cohereColor.blue.dark, // #2d4cb9 deep acrylic blue
    category8: cohereColor.accent.sage // #b2bbb6 mushroom/sage
  }
} as const;

/**
 * The Cohere theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Cohere-specific values, and the `component`
 * layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Cohere brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const cohereTheme: TenantTheme = {
  id: "cohere",
  label: "Cohere",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default cohereTheme;
