import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * LVMH (Moët Hennessy Louis Vuitton) corporate design system theme for the
 * Sentropic token structure.
 *
 * MEASURED CLONE — all colour values below are measured from the PUBLIC compiled
 * CSS of lvmh.com (Next.js Tailwind build, /_next/static/css/*.css, June 2026).
 * The brand exposes its palette as named Tailwind utilities (e.g.
 * `corporate-darkBlue`, `thematique-yellow`, `utility-accessibilityBlue`); each
 * comment cites the real utility token and its resolved `rgb()` value. We only
 * reference the font *names* (LVMH proprietary typefaces), never the binaries.
 * Sources and any derived ("à confirmer") values are documented in MAPPING.md.
 *
 * LVMH is NOT pure black on white — its primary is a very deep navy
 * `corporate-darkBlue` #030f2b on a WARM off-white `#f7f3ed`, with a gold /
 * champagne accent (`thematique-yellow` #bb8e24). Square corners (the brand
 * uses `border-radius: 0`), uppercase wide-tracked CTAs, and a slow elegant
 * 600ms easing are the signature anatomy.
 *
 * LVMH colour reference (measured, light theme):
 *   Warm off-white (background alt)   #f7f3ed   (corporate-ultraLightWarmWhite)
 *   White (background default)        #ffffff   (basic-white)
 *   Deep navy (primary / text)        #030f2b   (corporate-darkBlue, rgb 3 15 43)
 *   Navy graph 2 (hover / strong)     #2b364f   (corporate-darkBlueGraph-2)
 *   Grey-blue (secondary text)        #55626e   (thematique-greyBlue)
 *   Grey dark (muted text)            #656b7a   (basic-greyDark)
 *   Grey ultra-light (subtle border)  #e0e5f0   (basic-greyUltraLight)
 *   Gold (accent / warning)           #bb8e24   (thematique-yellow)
 *   Champagne (accent light)          #e5d8ac   (thematique-yellowLight)
 *   Olive green (success)             #5a6046   (thematique-greenEnvironment)
 *   Error red                         #db2327   (basic-error)
 *   Innovation blue (info)            #576ddd   (thematique-blueInnovation)
 *   Focus blue                        #0071f0   (utility-accessibilityBlue, :focus outline)
 */

// --- LVMH raw colour palette (measured on lvmh.com compiled CSS) ------------
const lvmhColor = {
  // Deep corporate navy — the LVMH primary / brand / action family.
  navy: {
    main: "#030f2b", // corporate-darkBlue — rgb(3 15 43) — primary text + bg + action
    graph2: "#2b364f", // corporate-darkBlueGraph-2 — rgb(43 54 79) — hover / strong text
    graph3: "#465067", // corporate-darkBlueGraph-3 — rgb(70 80 103)
    extraLight: "#8d93ab" // corporate-extraLightBlue — rgb(141 147 171)
  },
  // Warm white / beige neutrals — the signature LVMH "warm" backgrounds.
  warm: {
    ultraLight: "#f7f3ed", // corporate-ultraLightWarmWhite — rgb(247 243 237) — background alt
    light: "#e0d6c8", // corporate-lightWarmWhite — rgb(224 214 200) — beige surface
    dark: "#8f8a80" // corporate-darkWarmWhite — rgb(143 138 128) — taupe / greige
  },
  // Gold / champagne — the LVMH luxury accent (Sentropic "cyan" accent slot).
  gold: {
    main: "#bb8e24", // thematique-yellow — rgb(187 142 36) — gold accent
    light: "#e5d8ac", // thematique-yellowLight — rgb(229 216 172) — champagne
    dark: "#8f6e1b" // darker gold for hover/active (derived — à confirmer)
  },
  // Cool grey scale (basic-* utilities).
  grey: {
    0: "#ffffff", // basic-white — rgb(255 255 255)
    ultraLight: "#e0e5f0", // basic-greyUltraLight — rgb(224 229 240) — subtle borders / contrast bg
    light: "#ced5e4", // basic-greyLight — rgb(206 213 228)
    dark: "#656b7a" // basic-greyDark — rgb(101 107 122) — muted text
  },
  // System / status colours (basic-error + thematique-* brand hues).
  system: {
    success: "#5a6046", // thematique-greenEnvironment — rgb(90 96 70) — olive green
    error: "#db2327", // basic-error — rgb(219 35 39)
    warning: "#bb8e24", // thematique-yellow — rgb(187 142 36) — gold (used as warning accent)
    info: "#576ddd", // thematique-blueInnovation — rgb(87 109 221)
    greyBlue: "#55626e", // thematique-greyBlue — rgb(85 98 110) — secondary text
    redRh: "#984126", // thematique-redRh — rgb(152 65 38)
    focus: "#0071f0" // utility-accessibilityBlue — :focus outline-color
  }
} as const;

// --- foundation (LVMH-specific values) -------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the corporate navy.
    blue: {
      10: lvmhColor.grey.ultraLight, // #e0e5f0 lightest blue-grey tint
      60: lvmhColor.navy.main, // #030f2b deep navy (primary)
      80: lvmhColor.navy.graph2 // #2b364f darker interactive navy
    },
    // LVMH has no cyan; its accent is the gold / champagne, so the Sentropic
    // "cyan" accent slot is mapped to the LVMH gold family.
    cyan: {
      10: lvmhColor.gold.light, // #e5d8ac champagne tint
      50: lvmhColor.gold.main, // #bb8e24 gold accent
      70: lvmhColor.gold.dark // #8f6e1b darker gold (derived — à confirmer)
    },
    // Sentropic "slate" role family mapped onto the LVMH neutral scale (mix of
    // warm whites and cool greys, both measured on lvmh.com).
    slate: {
      0: lvmhColor.grey[0], // #ffffff white
      10: lvmhColor.warm.ultraLight, // #f7f3ed warm off-white (background alt)
      20: lvmhColor.grey.ultraLight, // #e0e5f0 subtle borders / contrast bg
      60: lvmhColor.system.greyBlue, // #55626e secondary text
      80: lvmhColor.navy.graph2, // #2b364f strong text
      90: lvmhColor.navy.main // #030f2b darkest / primary text
    },
    feedback: {
      success: lvmhColor.system.success,
      warning: lvmhColor.system.warning,
      error: lvmhColor.system.error,
      info: lvmhColor.system.info
    }
  },
  // LVMH ships three PROPRIETARY typefaces, exposed on lvmh.com as the CSS
  // variables --font-LVMH (editorial display, used italic for key figures &
  // subtitles), --font-LVMH-sans (UI / CTA / menu body) and --font-LVMH-air (a
  // lighter display cut). We reference the font *names* only, never the woff2
  // binaries. The display fallback is an elegant serif (the editorial face reads
  // high-contrast/italic); the official metric-fallback is Arial — see MAPPING.md.
  font: {
    sans: "'LVMH Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
    display: "'LVMH', 'LVMH Air', Georgia, 'Times New Roman', serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; lvmh.com uses a comparable Tailwind 4px scale).
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
  // LVMH aesthetic is SQUARED. lvmh.com resolves controls to `border-radius: 0`
  // (utilities `rounded-none` / `border-radius:0!important`); only pills use the
  // full radius. Controls and cards carry NO radius (luxury minimalism).
  radius: {
    none: "0",
    sm: "0", // controls square
    md: "0", // button / input / tabs — square
    lg: "0", // cards — square
    pill: "999px" // tags / pills (rounded-full = 9999px)
  },
  // LVMH uses very light, neutral elevation (navy-tinted). Exact specs derived
  // ("à confirmer") — the editorial site relies on flat surfaces + thin rules.
  shadow: {
    subtle: "0 1px 2px rgb(3 15 43 / 0.08)",
    medium: "0 4px 12px rgb(3 15 43 / 0.12)",
    floating: "0 10px 30px rgb(3 15 43 / 0.16)"
  },
  // LVMH motion: the measured `.search-button` transition is 600ms with the
  // easing `cubic-bezier(.69,0,.34,1)` (a slow, elegant luxury curve). `slow`
  // and `easing` are MEASURED; `fast`/`normal` are derived steps (à confirmer).
  motion: {
    fast: "200ms", // derived step (à confirmer)
    normal: "400ms", // derived step (à confirmer)
    slow: "600ms", // measured (.search-button transition duration)
    easing: "cubic-bezier(0.69, 0, 0.34, 1)" // measured (.search-button timing function)
  },
  // z-index roles are not LVMH-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (LVMH) -------------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // LVMH control density: generous, editorial. Heights/paddings are derived to
  // express the brand's airy luxury rhythm (à confirmer — the editorial home
  // exposes few bordered controls to measure directly).
  density: {
    sm: { controlHeight: "2.5rem", paddingBlock: "0", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "0.8125rem" },
    md: { controlHeight: "3rem", paddingBlock: "0.75rem", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3rem", fontSize: "0.875rem" },
    lg: { controlHeight: "3.5rem", paddingBlock: "0", paddingInline: "2.25rem", gap: "0.5rem", minWidth: "3.5rem", fontSize: "1rem" }
  },
  // LVMH typography. CTAs are the brand signature: measured `.typo-cta-regular`
  // = LVMH Sans, 0.875rem / line-height 1, letter-spacing 0.04em, and CTAs are
  // UPPERCASE (text-transform:uppercase, 15 occurrences). Fields/labels use the
  // sans face; labels are small uppercase (consistent with the CTA tracking).
  typography: {
    control: { family: "'LVMH Sans', system-ui, sans-serif", size: "0.875rem", weight: "400", lineHeight: "1", letterSpacing: "0.04em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'LVMH Sans', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'LVMH Sans', system-ui, sans-serif", size: "0.8125rem", weight: "600", lineHeight: "1.25", letterSpacing: "0.02em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // LVMH links: navy, no permanent underline; a thin underline appears on
    // hover (editorial luxury convention — offset/thickness à confirmer).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // LVMH dims disabled controls (à confirmer)
  // Transition uses the measured LVMH easing + slow 600ms curve.
  transition: { property: "background-color, border-color, color, outline-color", duration: "600ms", easing: "cubic-bezier(0.69, 0, 0.34, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.5rem" },
  // LVMH FOCUS = a 2px solid OUTLINE in the accessibility blue, offset 2px.
  // Measured: `.outline-utility-accessibilityBlue:focus{outline-color:#0071f0}`
  // + `outline-style:solid` + `outline-offset:2px`.
  focus: {
    strategy: "outline",
    width: "2px", // measured (`outline:2px solid`)
    offset: "2px", // measured (`outline-offset:2px`)
    color: lvmhColor.system.focus, // #0071f0 utility-accessibilityBlue
    inset: "0"
  },
  // LVMH form fields: minimal SQUARED boxes (white fill, 1px hairline border,
  // radius 0). The editorial home exposes few bordered inputs to measure, so the
  // exact field treatment is "à confirmer" — `outline` + square corners matches
  // the brand's minimalism. Native <select> chevron redrawn in the navy.
  field: {
    style: "outline",
    fillBg: lvmhColor.grey[0], // #ffffff
    underlineColor: lvmhColor.grey.dark, // #656b7a (unused for outline, kept for completeness)
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23030f2b' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // LVMH cards: a thin 1px hairline border, square corners, warm-white hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: lvmhColor.warm.ultraLight // #f7f3ed
  },
  // LVMH secondary button = OUTLINED (transparent fill, navy border + text,
  // warm-white fill on hover).
  buttonSecondary: {
    background: "transparent",
    border: lvmhColor.navy.main, // #030f2b stroke
    hoverBackground: lvmhColor.warm.ultraLight // #f7f3ed warm fill on hover
  },
  // LVMH tabs / nav: active tab = bold navy label with a bottom navy underline.
  tabs: {
    activeText: lvmhColor.navy.main, // #030f2b
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom", // navy underline on the bottom edge
    indicatorMode: "border" // a real bottom border
  },
  // LVMH pagination: borderless navy text links; active page = filled navy.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: lvmhColor.navy.main, // #030f2b link text
    activeBackground: lvmhColor.navy.main, // #030f2b filled active page
    activeText: lvmhColor.warm.ultraLight, // #f7f3ed warm white on navy
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem" // 24px
  },
  // LVMH breadcrumb: grey-blue links, navy current page, grey separators.
  breadcrumb: {
    linkText: lvmhColor.system.greyBlue, // #55626e
    text: lvmhColor.system.greyBlue, // #55626e trail text
    currentText: lvmhColor.navy.main, // #030f2b current page
    separator: lvmhColor.grey.dark, // #656b7a
    fontSize: "0.75rem", // 12px
    lineHeight: "1.25rem", // 20px
    currentWeight: "700"
  },
  // LVMH notice / alert: a coloured LEFT accent filet on a transparent box.
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0.1875rem", // 3px ::before accent bar (thin luxury filet)
    paddingTop: "1rem", // 16px
    paddingRight: "1rem", // 16px
    paddingBottom: "1rem", // 16px
    paddingLeft: "1.25rem", // 20px (clears the left filet)
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem" // 24px
  },
  // LVMH details: a dark navy bold summary trigger.
  accordion: {
    text: lvmhColor.navy.main, // #030f2b summary label
    paddingBlock: "1rem", // 16px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    fontWeight: "600",
    lineHeight: "1.5rem" // 24px
  },
  // LVMH tag: a small SQUARED warm chip (radius 0, luxury minimalism).
  tag: {
    radius: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    fontSize: "0.75rem", // 12px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: lvmhColor.warm.ultraLight, // #f7f3ed
    neutralText: lvmhColor.navy.main // #030f2b
  },
  // LVMH badge: a SQUARED filled badge, uppercase label.
  badge: {
    radius: "0",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.6875rem", // 11px
    fontWeight: "700",
    lineHeight: "1.25rem", // 20px
    textTransform: "uppercase",
    minHeight: "1.25rem", // 20px
    infoBackground: lvmhColor.navy.main, // #030f2b
    infoText: lvmhColor.warm.ultraLight // #f7f3ed warm white
  },
  // LVMH checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: lvmhColor.navy.main // #030f2b
  },
  // LVMH search input.
  search: {
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // LVMH toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: lvmhColor.navy.main // #030f2b
  }
} as const;

// --- semantic (LVMH-specific role mapping) ---------------------------------
const semantic = {
  surface: {
    default: lvmhColor.grey[0], // #ffffff white
    subtle: lvmhColor.warm.ultraLight, // #f7f3ed warm off-white background alt
    raised: lvmhColor.grey[0], // #ffffff white
    inverse: lvmhColor.navy.main, // #030f2b deep navy inverse surface (footer/dark sections)
    overlay: "rgb(3 15 43 / 0.6)" // modal backdrop (navy tint)
  },
  text: {
    primary: lvmhColor.navy.main, // #030f2b (corporate-darkBlue, primary text)
    secondary: lvmhColor.system.greyBlue, // #55626e (thematique-greyBlue)
    muted: lvmhColor.grey.dark, // #656b7a (basic-greyDark)
    inverse: lvmhColor.warm.ultraLight, // #f7f3ed warm white on dark / coloured surfaces
    link: lvmhColor.navy.main // #030f2b navy links
  },
  border: {
    subtle: lvmhColor.grey.ultraLight, // #e0e5f0 (basic-greyUltraLight)
    strong: lvmhColor.grey.dark, // #656b7a (basic-greyDark)
    interactive: lvmhColor.navy.main // #030f2b navy interactive
  },
  action: {
    primary: lvmhColor.navy.main, // #030f2b deep navy primary button
    primaryHover: lvmhColor.navy.graph2, // #2b364f lighter navy hover
    primaryText: lvmhColor.warm.ultraLight, // #f7f3ed warm white on navy
    secondary: lvmhColor.warm.ultraLight, // #f7f3ed warm secondary surface
    secondaryHover: lvmhColor.warm.light, // #e0d6c8 beige hover
    secondaryText: lvmhColor.navy.main, // #030f2b navy text
    danger: lvmhColor.system.error // #db2327
  },
  feedback: {
    success: lvmhColor.system.success, // #5a6046 olive green
    warning: lvmhColor.system.warning, // #bb8e24 gold
    error: lvmhColor.system.error, // #db2327
    info: lvmhColor.system.info // #576ddd innovation blue
  },
  status: {
    pending: lvmhColor.system.warning, // gold
    processing: lvmhColor.system.info, // innovation blue
    completed: lvmhColor.system.success, // olive green
    failed: lvmhColor.system.error // red
  },
  // Categorical data-vis palette built from the measured LVMH brand hues.
  // (LVMH publishes no 8-colour sequential scale — see MAPPING.md "à confirmer".)
  data: {
    category1: lvmhColor.navy.main, // #030f2b deep navy
    category2: lvmhColor.gold.main, // #bb8e24 gold
    category3: lvmhColor.system.success, // #5a6046 olive green
    category4: lvmhColor.system.info, // #576ddd innovation blue
    category5: lvmhColor.system.redRh, // #984126 terracotta
    category6: lvmhColor.navy.extraLight, // #8d93ab extra-light blue
    category7: lvmhColor.warm.dark, // #8f8a80 taupe
    category8: lvmhColor.system.greyBlue // #55626e grey-blue
  }
} as const;

/**
 * The LVMH theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry LVMH-specific measured values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so LVMH's brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const lvmhTheme: TenantTheme = {
  id: "lvmh",
  label: "LVMH",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default lvmhTheme;
