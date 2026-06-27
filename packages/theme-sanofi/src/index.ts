import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Sanofi brand theme for the Sentropic token structure.
 *
 * All values below are MEASURED from Sanofi's PUBLIC live design tokens —
 * the custom properties `--elements-*` published in www.sanofi.com's stylesheet
 * (`root-BEz0SzhB.css`) and the component bundle (`AppLayout-*.js`, emotion/MUI
 * literals). We only reference the font *names* (Sanofi Sans, Sanofi Serif)
 * here, never font binaries. Sources are documented in MAPPING.md. Where Sanofi
 * has no direct equivalent for a Sentropic role (e.g. no cyan/second brand hue —
 * the design is monochromatic violet), the closest measured token is used and
 * the choice is noted "à confirmer" in MAPPING.md.
 *
 * Sanofi colour reference (light theme, post-2022 "Play to win" rebrand):
 *   White (background default)        #ffffff   (--elements-color-core-neutral-white)
 *   Neutral 50 (background subtle)    #f5f5f5   (neutral-50 / background-neutral-subtle)
 *   Neutral 100 (divider subtle)      #e4e4e4   (neutral-100)
 *   Neutral 200 (border subtle)       #c9c9c9   (neutral-200 / --border-subtle)
 *   Neutral 600 (helper / secondary)  #5d5d5d   (neutral-600)
 *   Neutral 900 (text default)        #171717   (neutral-900 / text-default)
 *   Brand violet (primary action)     #7a00e6   (--elements-core-brand-base)
 *   Brand dark (primary hover)        #5718b0   (--elements-core-brand-dark)
 *   Brand darker (focus / active)     #3c217b   (--elements-core-brand-darker)
 *   Brand darkest (inverse / emphasis)#23004c   (--elements-core-brand-darkest)
 *   Success #067647  Error #b42318  Warning #b54708  Info #175cd3 (system *-dark)
 */

// --- Sanofi raw colour palette (public live design tokens) -----------------
const sanofiColor = {
  // Brand violet — the primary / action family. Measured --elements-core-brand-*.
  // Sanofi's identity is monochromatic violet: there is NO second brand hue
  // (the measured brand-secondary / brand-tertiary tokens recopy this violet).
  violet: {
    lightest: "#faf5ff", // --elements-core-brand-lightest (subtle violet surface)
    lighter: "#b3a8e6", // --elements-core-brand-lighter (focus on dark / light accent)
    light: "#8966db", // --elements-core-brand-light
    base: "#7a00e6", // --elements-core-brand-base (PRIMARY action + link)
    dark: "#5718b0", // --elements-core-brand-dark (primary hover)
    darker: "#3c217b", // --elements-core-brand-darker (focus / active on light)
    darkest: "#23004c" // --elements-core-brand-darkest (inverse surface / input emphasis)
  },
  // Neutral grey scale (--elements-color-core-neutral-*).
  grey: {
    0: "#ffffff", // neutral-white / background default
    50: "#f5f5f5", // neutral-50 / background-neutral-subtle
    100: "#e4e4e4", // neutral-100 / divider-subtle
    200: "#c9c9c9", // neutral-200 / --border-subtle (measured input border at rest)
    300: "#aeaeae", // neutral-300 / disabled text
    400: "#939393", // neutral-400 (muted / placeholder — derived, à confirmer)
    600: "#5d5d5d", // neutral-600 / helper + secondary text
    800: "#282828", // neutral-800 / accent neutral
    900: "#171717", // neutral-900 / text-default
    950: "#0a0a0a" // neutral-950 (darkest)
  },
  // System / status colours. Sanofi publishes base/dark/light triplets; the
  // "dark" variant is the measured default for accent/text on a light surface
  // (and keeps WCAG AA on white). The "base" (more vivid) variants feed the
  // categorical data-vis palette.
  system: {
    success: "#067647", // success-dark (base #079455)
    error: "#b42318", // error-dark (base #d72b3f)
    warning: "#b54708", // warning-dark (base #ee7404)
    info: "#175cd3", // info-dark (base #1570ef)
    successBase: "#079455", // success-base (vivid)
    errorBase: "#d72b3f", // error-base (vivid)
    warningBase: "#ee7404", // warning-base (vivid)
    infoBase: "#1570ef" // info-base (vivid)
  }
} as const;

// --- foundation (Sanofi-specific values) -----------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the Sanofi brand violet.
    blue: {
      10: sanofiColor.violet.lightest, // lightest violet tint
      60: sanofiColor.violet.base, // brand violet (primary)
      80: sanofiColor.violet.darker // darker interactive violet
    },
    // Sanofi has NO cyan / second brand hue (its identity is monochromatic
    // violet — the measured secondary/tertiary tokens recopy the violet). The
    // Sentropic "cyan" accent slot is therefore mapped to lighter violet tints
    // so the accent stays on-brand. (à confirmer — no distinct accent exists.)
    cyan: {
      10: sanofiColor.violet.lighter, // light violet tint
      50: sanofiColor.violet.light, // mid violet accent
      70: sanofiColor.violet.dark // darker violet
    },
    // Sentropic "slate" role family mapped onto the Sanofi neutral scale.
    slate: {
      0: sanofiColor.grey[0], // white
      10: sanofiColor.grey[50], // background subtle
      20: sanofiColor.grey[200], // subtle borders / contrast background
      60: sanofiColor.grey[600], // secondary / helper text
      80: sanofiColor.grey[800], // accent neutral / strong text
      90: sanofiColor.grey[900] // text default (primary)
    },
    feedback: {
      success: sanofiColor.system.success,
      warning: sanofiColor.system.warning,
      error: sanofiColor.system.error,
      info: sanofiColor.system.info
    }
  },
  // Sanofi ships "Sanofi Sans" (UI sans, body + display token) and "Sanofi
  // Serif" (editorial headline serif), both as @font-face from the brand CDN.
  // We reference the font *names* only, not the binaries. The Sentropic
  // `display` role carries Sanofi Serif to reflect the brand's bold editorial
  // headline identity (the measured CSS `--font-family-display` token itself
  // resolves to the sans pile — see MAPPING.md "à confirmer"). No Sanofi mono
  // exists; the Sentropic generic mono stack is kept.
  font: {
    sans: "'Sanofi Sans', 'Work Sans', 'Raleway', 'Roboto', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Sanofi Serif', 'IBM Plex Serif', Georgia, 'Times New Roman', serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // Sanofi spacing scale (measured root.css tokens: 3xs 2 · 2xs 4 · xs 8 · sm 12
  // · md 16 · lg 20 · xl 24 · 2xl 32 · 4xl 48 · 5xl 64). Mapped to Sentropic keys
  // by px value (4/8/12/16/24/32/48/64 all present in the measured scale).
  spacing: {
    0: "0",
    1: "0.25rem", // 4px  (2xs)
    2: "0.5rem", // 8px  (xs)
    3: "0.75rem", // 12px (sm)
    4: "1rem", // 16px (md)
    6: "1.5rem", // 24px (xl)
    8: "2rem", // 32px (2xl)
    12: "3rem", // 48px (4xl)
    16: "4rem" // 64px (5xl)
  },
  // Sanofi radius scale (measured root.css: none 0 · sm 4 · md 8 · lg 12 · xl 16
  // · rounded 9999). Controls/inputs are moderately rounded (md 8px); cards lg
  // 12px; only round elements use the pill.
  radius: {
    none: "0",
    sm: "0.25rem", // 4px
    md: "0.5rem", // 8px — button / input / tabs (Sanofi md)
    lg: "0.75rem", // 12px — cards (Sanofi lg)
    pill: "9999px" // Sanofi "rounded" (round elements only)
  },
  // Sanofi uses light, neutral elevation. Exact shadow specs are rendered in
  // CSS-in-JS (not the measured stylesheet) — kept conservative ("à confirmer").
  shadow: {
    subtle: "0 1px 2px rgb(23 23 23 / 0.08)",
    medium: "0 4px 12px rgb(23 23 23 / 0.14)",
    floating: "0 8px 24px rgb(23 23 23 / 0.18)"
  },
  // Motion durations are not tokenised in the measured stylesheet; kept aligned
  // with the Sentropic base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Sanofi-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Sanofi) -----------------------------------------
  // Sanofi inputs carry a measured 1px stroke; the brand outline is heavier.
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Sanofi control density. Button/input heights are rendered in CSS-in-JS (not
  // the measured stylesheet) — these follow the measured spacing scale and the
  // typical 36/44/52px size ladder ("à confirmer" against the runtime metrics).
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1.125rem" }
  },
  // Sanofi typography: Sanofi Sans for all UI roles (control/field/label/link).
  // Base 16px / line-height 150% measured. Weights: Regular 400 / Bold 700.
  typography: {
    control: { family: "'Sanofi Sans', 'Work Sans', sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Sanofi Sans', 'Work Sans', sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Sanofi Sans', 'Work Sans', sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Sanofi links: underlined brand violet; hover thickens the underline.
    // (Underline metrics derived — à confirmer.)
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "0.08em", decorationOffset: "0.15em",
      textDecorationHover: "underline", decorationThicknessHover: "0.14em", decorationOffsetHover: "0.15em"
    }
  },
  disabledOpacity: "0.5", // Sanofi dims disabled controls (à confirmer exact value)
  transition: { property: "background-color, border-color, color, outline-color", duration: "150ms", easing: "ease" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // Sanofi FOCUS = a visible solid OUTLINE in the brand focus violet (measured
  // `:focus-visible` + the measured `focus` token `brand-darker #3c217b` on a
  // light surface). Width = `theme.spacing(2)` (~2px, exact px à confirmer).
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: sanofiColor.violet.darker, // #3c217b measured focus colour (light bg)
    inset: "0"
  },
  // Sanofi form fields are BOXED (outline): a white fill with a measured 1px
  // grey border (#c9c9c9, --border-subtle) and a rounded corner. `style:
  // "outline"` makes the builder draw four equal borders from `surface.default`
  // + `border.subtle`. The input emphasis/focus border is brand-darkest #23004c
  // (measured literal) — carried by `focus`/`border.interactive`.
  field: {
    style: "outline",
    fillBg: sanofiColor.grey[0], // #ffffff
    underlineColor: sanofiColor.grey[200], // #c9c9c9 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in brand violet with a 40px gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%237a00e6' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Sanofi cards: a 1px grey border + 12px radius, subtle hover tint. (Exact
  // card border/hover à confirmer — rendered in CSS-in-JS.)
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: sanofiColor.grey[50] // #f5f5f5
  },
  // Sanofi secondary button = OUTLINED (transparent fill, brand violet border +
  // text, light violet fill on hover). (à confirmer against the runtime button.)
  buttonSecondary: {
    background: "transparent",
    border: sanofiColor.violet.base, // #7a00e6 stroke
    hoverBackground: sanofiColor.violet.lightest // #faf5ff light fill on hover
  },
  // Sanofi tabs: active tab has a brand-violet bottom underline + bold violet
  // label, transparent fill. (à confirmer — tabs not isolated in the measured CSS.)
  tabs: {
    activeText: sanofiColor.violet.base, // #7a00e6
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // violet underline on the bottom edge
    indicatorMode: "border" // a real bottom border
  },
  // Sanofi pagination: borderless violet text links; active page = filled violet.
  // (à confirmer — pagination not isolated in the measured CSS.)
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: sanofiColor.violet.base, // #7a00e6 link text
    activeBackground: sanofiColor.violet.base, // #7a00e6 filled active page
    activeText: sanofiColor.grey[0], // white on violet
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Sanofi breadcrumb: violet links, dark current page, grey separators.
  breadcrumb: {
    linkText: sanofiColor.violet.base, // #7a00e6
    text: sanofiColor.grey[600], // #5d5d5d trail text
    currentText: sanofiColor.grey[900], // #171717 current page
    separator: sanofiColor.grey[200], // #c9c9c9
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem", // 24px
    currentWeight: "700" // current page is emphasised
  },
  // Sanofi notice / alert: a coloured LEFT accent filet on a transparent box.
  // (à confirmer — alert anatomy not isolated in the measured CSS.)
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
  // Sanofi accordion: a dark bold summary trigger.
  accordion: {
    text: sanofiColor.grey[900], // #171717 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "700", // bold summary
    lineHeight: "1.5rem" // 24px
  },
  // Sanofi tag: a small 8px-radius grey chip.
  tag: {
    radius: "8px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: sanofiColor.grey[50], // #f5f5f5
    neutralText: sanofiColor.grey[900] // #171717
  },
  // Sanofi badge: an 8px-radius filled badge.
  badge: {
    radius: "8px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: sanofiColor.violet.base, // #7a00e6
    infoText: sanofiColor.grey[0] // white
  },
  // Sanofi checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: sanofiColor.grey[900] // #171717
  },
  // Sanofi search input.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Sanofi toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: sanofiColor.grey[900] // #171717
  }
} as const;

// --- semantic (Sanofi-specific role mapping) -------------------------------
const semantic = {
  surface: {
    default: sanofiColor.grey[0], // white
    subtle: sanofiColor.grey[50], // #f5f5f5 background subtle
    raised: sanofiColor.grey[0], // white
    inverse: sanofiColor.violet.darkest, // #23004c dark violet inverse surface
    overlay: "rgb(35 0 76 / 0.6)" // modal backdrop (dark violet tint)
  },
  text: {
    primary: sanofiColor.grey[900], // #171717 (neutral-900 / text-default)
    secondary: sanofiColor.grey[600], // #5d5d5d (neutral-600 / helper)
    muted: sanofiColor.grey[400], // #939393 (neutral-400, à confirmer)
    inverse: sanofiColor.grey[0], // white on dark / coloured surfaces
    link: sanofiColor.violet.base // #7a00e6 brand link
  },
  border: {
    subtle: sanofiColor.grey[200], // #c9c9c9 (--border-subtle, measured input border)
    strong: sanofiColor.grey[600], // #5d5d5d stronger divider
    interactive: sanofiColor.violet.darkest // #23004c focus / input emphasis (measured literal)
  },
  action: {
    primary: sanofiColor.violet.base, // #7a00e6 primary button
    primaryHover: sanofiColor.violet.dark, // #5718b0 brand hover (measured)
    primaryText: sanofiColor.grey[0], // white text on violet
    secondary: sanofiColor.grey[50], // #f5f5f5 secondary surface
    secondaryHover: sanofiColor.grey[100], // #e4e4e4
    secondaryText: sanofiColor.violet.base, // #7a00e6
    danger: sanofiColor.system.error // #b42318
  },
  feedback: {
    success: sanofiColor.system.success,
    warning: sanofiColor.system.warning,
    error: sanofiColor.system.error,
    info: sanofiColor.system.info
  },
  status: {
    pending: sanofiColor.system.warning,
    processing: sanofiColor.system.info,
    completed: sanofiColor.system.success,
    failed: sanofiColor.system.error
  },
  // Categorical data-vis palette built from the Sanofi brand violet + the vivid
  // system "base" hues. Sanofi does not publish an 8-colour sequential scale, so
  // this is a coherent proposal (see MAPPING.md, "à confirmer").
  data: {
    category1: sanofiColor.violet.base, // brand violet
    category2: sanofiColor.system.infoBase, // info blue
    category3: sanofiColor.system.successBase, // green
    category4: sanofiColor.system.warningBase, // amber
    category5: sanofiColor.violet.light, // mid violet
    category6: sanofiColor.system.errorBase, // red
    category7: sanofiColor.grey[600], // grey
    category8: sanofiColor.violet.darker // dark violet
  }
} as const;

/**
 * The Sanofi theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Sanofi-specific values, and the `component`
 * layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Sanofi brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const sanofiTheme: TenantTheme = {
  id: "sanofi",
  label: "Sanofi",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default sanofiTheme;
