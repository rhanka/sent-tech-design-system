import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * OpenAI / ChatGPT theme for the Sentropic token structure.
 *
 * All values below are measured on the PUBLIC OpenAI surfaces (openai.com and
 * chatgpt.com) — the visible CSS and the ChatGPT theming CSS custom properties
 * (`--main-surface-*`, `--message-surface`, `--text-*`). We only reference the
 * font *names* (OpenAI Sans, Söhne, Söhne Mono) here, never font binaries.
 * Sources are documented in MAPPING.md. Where OpenAI exposes no formal token for
 * a Sentropic role, the closest measured value is used and the choice is noted
 * "à confirmer" in MAPPING.md.
 *
 * OpenAI / ChatGPT colour reference (light theme):
 *   White (main surface)              #ffffff   (--main-surface-primary)
 *   Light grey (sidebar / alt)        #f9f9f9   (--main-surface-secondary)
 *   User-bubble / hover surface       #f4f4f4   (light user message surface)
 *   Divider / border                  #ececec   (light divider — à confirmer exact)
 *   Tertiary text / placeholder       #8f8f8f   (--text-tertiary)
 *   Secondary text                    #5d5d5d   (--text-secondary)
 *   Primary text / brand ink          #0d0d0d   (--text-primary, near-black brand)
 *   Pure black (openai.com CTA)       #000000   (primary button / max contrast)
 *   Charcoal (legacy dark sidebar)    #202123   (inverse surface)
 *   ChatGPT brand green (accent)      #10a37f   (logo / accent green)
 */

// --- OpenAI raw colour palette (public surfaces) ---------------------------
const openaiColor = {
  // Near-black "ink" — the OpenAI / ChatGPT monochrome brand + primary action.
  ink: {
    black: "#000000", // openai.com pure black (max-contrast primary CTA)
    900: "#0d0d0d", // ChatGPT --text-primary (near-black brand ink / primary action)
    charcoal: "#202123", // legacy ChatGPT dark sidebar / message surface (inverse)
    700: "#343541" // legacy ChatGPT dark chat background (derived — à confirmer)
  },
  // ChatGPT brand green — the iconic accent (logo mark).
  green: {
    main: "#10a37f", // ChatGPT brand green (accent)
    dark: "#0d8a6c", // darker green for hover/active (derived — à confirmer)
    light: "#d9f2ea", // light green tint for low-emphasis surfaces (derived — à confirmer)
    seaNymph: "#74aa9c" // lighter brand-green variant ("Sea Nymph")
  },
  // Neutral grey scale (ChatGPT light theme surfaces / text).
  grey: {
    0: "#ffffff", // --main-surface-primary (white)
    50: "#f9f9f9", // --main-surface-secondary / light sidebar
    100: "#f4f4f4", // user message bubble / hover surface (light)
    200: "#ececec", // divider / subtle border (light — à confirmer exact)
    400: "#cdcdcd", // strong border (derived — à confirmer)
    500: "#8f8f8f", // --text-tertiary (muted text / placeholder)
    600: "#5d5d5d", // --text-secondary
    800: "#2d2d2d", // strong text on light (derived — à confirmer)
    900: "#0d0d0d" // --text-primary (near-black ink)
  },
  // System / status colours. OpenAI does not publish a formal status scale;
  // these are ChatGPT-flavoured values (success reuses the brand green; the rest
  // are picked for WCAG AA on white and noted "à confirmer").
  system: {
    success: "#10a37f", // ChatGPT brand green (success)
    error: "#e02e2a", // destructive red (à confirmer)
    warning: "#d97706", // amber, darkened for AA on white (à confirmer)
    info: "#2563eb" // info blue (à confirmer)
  }
} as const;

// --- foundation (OpenAI-specific values) -----------------------------------
const foundation = {
  color: {
    // OpenAI is monochrome: the Sentropic "blue" role family (which feeds the
    // primary action) is mapped onto the near-black brand ink, NOT a blue.
    blue: {
      10: openaiColor.grey[100], // #f4f4f4 lightest ink tint (low-emphasis fill)
      60: openaiColor.grey[900], // #0d0d0d near-black (primary action ink)
      80: openaiColor.ink.black // #000000 pure black (darker / hover)
    },
    // OpenAI has no cyan; the closest accent is the ChatGPT brand green, so the
    // Sentropic "cyan" accent slot is mapped to the green family.
    cyan: {
      10: openaiColor.green.light, // #d9f2ea light green tint
      50: openaiColor.green.main, // #10a37f ChatGPT green accent
      70: openaiColor.green.dark // #0d8a6c darker green
    },
    // Sentropic "slate" role family mapped onto the ChatGPT grey scale.
    slate: {
      0: openaiColor.grey[0], // white
      10: openaiColor.grey[50], // background alt / sidebar
      20: openaiColor.grey[200], // subtle border / contrast background
      60: openaiColor.grey[600], // secondary text
      80: openaiColor.grey[800], // strong text
      90: openaiColor.grey[900] // primary text / near-black
    },
    feedback: {
      success: openaiColor.system.success,
      warning: openaiColor.system.warning,
      error: openaiColor.system.error,
      info: openaiColor.system.info
    }
  },
  // OpenAI ships "OpenAI Sans" (2024 rebrand) for the brand UI; ChatGPT/openai.com
  // long shipped Klim's "Söhne" for body and "Söhne Mono" for code (Signifier is
  // the editorial serif, used for research papers — not the product UI). We
  // reference the font *names* only, never the binaries.
  font: {
    sans: "'OpenAI Sans', 'Söhne', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    display: "'OpenAI Sans', 'Söhne', ui-sans-serif, system-ui, -apple-system, sans-serif",
    mono: "'Söhne Mono', ui-monospace, 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace"
  },
  // Standard 4px-based rem spacing scale (kept aligned with the Sentropic base
  // for component-grid fidelity; ChatGPT uses a comparable 4px scale).
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
  // OpenAI aesthetic is lightly rounded with strong contrast: controls/inputs
  // carry a small radius (~8px), cards a larger 16px; chat affordances and CTAs
  // can go pill (999px). (Exact per-element radii "à confirmer".)
  radius: {
    none: "0",
    sm: "0.375rem", // 6px
    md: "0.5rem", // 8px — button / input / tabs
    lg: "1rem", // 16px — cards / panels
    pill: "999px" // pills / chips / circular send button
  },
  // OpenAI uses very light, neutral elevation (near-black tinted, low opacity).
  // Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.05)",
    medium: "0 4px 16px rgb(0 0 0 / 0.10)",
    floating: "0 12px 32px rgb(0 0 0 / 0.16)"
  },
  // Motion durations are not strongly tokenised by OpenAI publicly; kept aligned
  // with the Sentropic base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not OpenAI-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (OpenAI) -----------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // OpenAI control density. ChatGPT controls target ~40px (md) with sm 32px and
  // lg 48px; horizontal padding is moderate. Exact metrics "à confirmer".
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.5rem", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1rem" }
  },
  // OpenAI typography = OpenAI Sans / Söhne. Button labels are medium weight,
  // no transform; body/fields are regular.
  typography: {
    control: { family: "'OpenAI Sans', 'Söhne', ui-sans-serif, system-ui, sans-serif", size: "0.9375rem", weight: "500", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'OpenAI Sans', 'Söhne', ui-sans-serif, system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'OpenAI Sans', 'Söhne', ui-sans-serif, system-ui, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // OpenAI links are subtle near-black underlines; hover keeps the underline.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "0.06em", decorationOffset: "0.15em",
      textDecorationHover: "underline", decorationThicknessHover: "0.1em", decorationOffsetHover: "0.15em"
    }
  },
  disabledOpacity: "0.5", // OpenAI dims disabled controls (~0.5)
  transition: { property: "background-color, border-color, color, outline-color", duration: "150ms", easing: "ease" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // OpenAI FOCUS = a subtle high-contrast RING in the near-black brand ink.
  // (The product uses a focus-visible ring; exact width/colour "à confirmer".)
  focus: {
    strategy: "ring",
    width: "2px",
    offset: "2px",
    color: openaiColor.grey[900], // #0d0d0d near-black ring
    inset: "0"
  },
  // OpenAI form fields are BOXED (outline): a white fill, a 1px light-grey border
  // and a small radius (not a filled-underline). `style: "outline"` makes the
  // builder draw four equal borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: openaiColor.grey[0], // #ffffff
    underlineColor: openaiColor.grey[200], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in near-black ink with a 40px gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%230d0d0d' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // OpenAI cards: a 1px light border + 16px radius, subtle hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: openaiColor.grey[50] // #f9f9f9
  },
  // OpenAI secondary button = a light grey ghost (transparent fill, light border,
  // light-grey fill on hover).
  buttonSecondary: {
    background: "transparent",
    border: openaiColor.grey[200], // #ececec hairline stroke
    hoverBackground: openaiColor.grey[100] // #f4f4f4 light fill on hover
  },
  // OpenAI tabs / settings nav: active = bold near-black label with a light
  // selected fill; bottom rule indicator. (à confirmer technique.)
  tabs: {
    activeText: openaiColor.grey[900], // #0d0d0d
    activeBackground: openaiColor.grey[100], // #f4f4f4 selected fill
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // OpenAI pagination: borderless near-black text links; active page = filled ink.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: openaiColor.grey[900], // #0d0d0d
    activeBackground: openaiColor.grey[900], // #0d0d0d filled active page
    activeText: openaiColor.grey[0], // white on ink
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem" // 24px
  },
  // OpenAI breadcrumb: grey trail links, near-black current page.
  breadcrumb: {
    linkText: openaiColor.grey[600], // #5d5d5d
    text: openaiColor.grey[600], // #5d5d5d trail text
    currentText: openaiColor.grey[900], // #0d0d0d current page
    separator: openaiColor.grey[400], // #cdcdcd
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem", // 24px
    currentWeight: "500"
  },
  // OpenAI notice / alert: a soft light-grey filled box (rounded, no accent rule).
  alert: {
    background: openaiColor.grey[50], // #f9f9f9
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0",
    paddingTop: "1rem", // 16px
    paddingRight: "1rem", // 16px
    paddingBottom: "1rem", // 16px
    paddingLeft: "1rem", // 16px
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.5rem" // 24px
  },
  // OpenAI disclosure: a near-black medium-weight summary trigger.
  accordion: {
    text: openaiColor.grey[900], // #0d0d0d summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "500", // OpenAI summary weight
    lineHeight: "1.5rem" // 24px
  },
  // OpenAI tag/chip: a small rounded grey chip.
  tag: {
    radius: "8px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    fontSize: "0.8125rem", // 13px
    fontWeight: "500",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: openaiColor.grey[100], // #f4f4f4
    neutralText: openaiColor.grey[900] // #0d0d0d
  },
  // OpenAI badge: a small rounded filled badge.
  badge: {
    radius: "6px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "600",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: openaiColor.grey[900], // #0d0d0d ink badge
    infoText: openaiColor.grey[0] // white
  },
  // OpenAI checkbox/radio label.
  choice: {
    labelFontSize: "0.9375rem", // 15px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: openaiColor.grey[900] // #0d0d0d
  },
  // OpenAI search input.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.5rem" // 24px
  },
  // OpenAI toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: openaiColor.grey[900] // #0d0d0d
  }
} as const;

// --- semantic (OpenAI-specific role mapping) -------------------------------
const semantic = {
  surface: {
    default: openaiColor.grey[0], // white (--main-surface-primary)
    subtle: openaiColor.grey[50], // #f9f9f9 sidebar / alt background
    raised: openaiColor.grey[0], // white
    inverse: openaiColor.ink.charcoal, // #202123 legacy ChatGPT dark surface
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop
  },
  text: {
    primary: openaiColor.grey[900], // #0d0d0d (--text-primary)
    secondary: openaiColor.grey[600], // #5d5d5d (--text-secondary)
    muted: openaiColor.grey[500], // #8f8f8f (--text-tertiary)
    inverse: openaiColor.grey[0], // white on dark / coloured surfaces
    link: openaiColor.grey[900] // #0d0d0d near-black links (à confirmer)
  },
  border: {
    subtle: openaiColor.grey[200], // #ececec
    strong: openaiColor.grey[400], // #cdcdcd
    interactive: openaiColor.grey[900] // #0d0d0d near-black interactive
  },
  action: {
    primary: openaiColor.grey[900], // #0d0d0d near-black primary button
    primaryHover: openaiColor.ink.black, // #000000 darker hover
    primaryText: openaiColor.grey[0], // white text on ink
    secondary: openaiColor.grey[100], // #f4f4f4 secondary surface
    secondaryHover: openaiColor.grey[200], // #ececec
    secondaryText: openaiColor.grey[900], // #0d0d0d
    danger: openaiColor.system.error // #e02e2a
  },
  feedback: {
    success: openaiColor.system.success,
    warning: openaiColor.system.warning,
    error: openaiColor.system.error,
    info: openaiColor.system.info
  },
  status: {
    pending: openaiColor.system.warning,
    processing: openaiColor.system.info,
    completed: openaiColor.system.success,
    failed: openaiColor.system.error
  },
  // Categorical data-vis palette built from the OpenAI brand hues. OpenAI does
  // not publish an 8-colour sequential scale, so this is a coherent proposal
  // drawn from the brand palette (see MAPPING.md, "à confirmer").
  data: {
    category1: openaiColor.green.main, // ChatGPT green
    category2: openaiColor.grey[900], // near-black ink
    category3: openaiColor.green.seaNymph, // sea nymph (light green)
    category4: openaiColor.ink.charcoal, // charcoal
    category5: openaiColor.system.info, // blue
    category6: openaiColor.grey[500], // grey
    category7: openaiColor.ink[700], // dark slate (#343541)
    category8: openaiColor.system.warning // amber
  }
} as const;

/**
 * The OpenAI / ChatGPT theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry OpenAI-specific values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the OpenAI brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const openaiTheme: TenantTheme = {
  id: "openai",
  label: "OpenAI",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default openaiTheme;
