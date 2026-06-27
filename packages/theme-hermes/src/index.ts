import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Hermès corporate design system theme for the Sentropic token structure.
 *
 * MEASURED CLONE — the neutral palette, typography, radius, focus and CTA
 * signatures below are measured from the PUBLIC compiled CSS of hermes.com
 * (live stylesheet `hermes.620c038483fabdf1.css` + the /us/en/ homepage HTML,
 * June 2026). We only reference the font *names* (Manrope, EB Garamond, Overpass
 * Mono — the webfonts actually loaded by the site), never the binaries. Sources
 * and every derived ("à confirmer") value are documented in MAPPING.md.
 *
 * Key fact measured on the live site: the Hermès UI chrome is PURE BLACK-ON-CREAM
 * — `body{background-color:#f6f1eb;color:#000}` — and there is ZERO orange in the
 * compiled CSS. The famous Hermès orange lives only in photography/packaging, so
 * the brand orange `#f37021` is sourced from public brand charts (à confirmer)
 * and used here as the primary accent (orange CTAs on cream), mirroring how the
 * real brand reserves orange for emphasis. Square corners (`border-radius: 0`),
 * a 2px solid-black focus outline (offset 3px) and uppercase tracked CTAs are the
 * measured signature anatomy.
 *
 * Hermès colour reference (light theme):
 *   Signature cream (background alt)   #f6f1eb   (body background-color — measured)
 *   Lighter cream (content surface)    #fffcf7   (measured, cards/sections)
 *   Mid cream (surface)                #fcf7f1   (measured)
 *   White (raised / field fill)        #ffffff   (measured)
 *   Black ink (text / focus / buttons) #000000   (body color / outline — measured)
 *   Hermès orange (primary accent)     #f37021   (Pantone 158 C — brand charts, à confirmer)
 */

// --- Hermès raw colour palette (measured on hermes.com unless noted) --------
const hermesColor = {
  // Hermès orange — the iconic brand accent. NOT present in the live site CSS
  // (the UI chrome is pure black-on-cream); sourced from public brand charts.
  orange: {
    main: "#f37021", // Hermès Orange — Pantone 158 C / rgb(243 112 33) (brandcolorcode.com — à confirmer, chart-derived)
    light: "#fbe2d3", // light orange tint (derived — à confirmer)
    dark: "#d85f15" // darker orange for hover/active (derived — à confirmer)
  },
  // Warm cream neutrals — the SIGNATURE Hermès backgrounds (measured on live CSS).
  cream: {
    bg: "#f6f1eb", // body{background-color:#f6f1eb} — the signature page cream (measured)
    mid: "#fcf7f1", // lighter cream surface (measured — cards/sections)
    light: "#fffcf7", // lightest cream (measured — content surface / inline HTML)
    hairline: "#e3dccf" // warm taupe hairline border (derived — à confirmer)
  },
  // Ink / black + white (measured on live CSS).
  ink: {
    black: "#000000", // body{color:#000} — pure black ink: text + buttons + focus (measured)
    charcoal: "#2e2d2d", // near-black charcoal (measured in DOM editorial styles — à confirmer)
    white: "#ffffff" // #fff — inverted surfaces / field fill (measured)
  },
  // Grey scale (from inline DOM editorial styles — present but not core tokens).
  grey: {
    light: "#f5f5f5", // background-color:#f5f5f5 (measured)
    muted: "#696969", // mid grey (DOM — à confirmer)
    dark: "#444444", // dark grey (DOM — à confirmer)
    taupe: "#b0a18a" // warm taupe (data accent — derived, à confirmer)
  },
  // System / status colours. Hermès publishes NONE — these are derived to clear
  // WCAG AA on white/cream and tuned to the warm luxury palette (all à confirmer).
  system: {
    success: "#3f7344", // derived forest green (à confirmer — Hermès publishes none)
    warning: "#a8620f", // derived amber (à confirmer)
    error: "#9d2a1e", // derived brick red (à confirmer — a #9d2a1e brick appears in the DOM)
    info: "#2f5d7c" // derived slate blue (à confirmer)
  }
} as const;

// --- foundation (Hermès-specific values) -----------------------------------
const foundation = {
  color: {
    // Sentropic "blue" primary-role family → the Hermès INK (the real UI primary
    // on the live site is black ink, not a colour).
    blue: {
      10: hermesColor.cream.bg, // #f6f1eb cream (lightest)
      60: hermesColor.ink.charcoal, // #2e2d2d near-black
      80: hermesColor.ink.black // #000000 ink
    },
    // Hermès has no cyan; the brand accent is the famous ORANGE, so the Sentropic
    // "cyan" accent slot is mapped to the Hermès orange family.
    cyan: {
      10: hermesColor.orange.light, // #fbe2d3 light orange tint (derived)
      50: hermesColor.orange.main, // #f37021 Hermès orange (à confirmer)
      70: hermesColor.orange.dark // #d85f15 darker orange (derived)
    },
    // Sentropic "slate" neutral family → the Hermès cream + grey neutrals.
    slate: {
      0: hermesColor.ink.white, // #ffffff white
      10: hermesColor.cream.bg, // #f6f1eb cream background alt (measured)
      20: hermesColor.cream.hairline, // #e3dccf warm hairline (derived)
      60: hermesColor.grey.muted, // #696969 muted grey (à confirmer)
      80: hermesColor.ink.charcoal, // #2e2d2d charcoal (à confirmer)
      90: hermesColor.ink.black // #000000 ink (measured)
    },
    feedback: {
      success: hermesColor.system.success,
      warning: hermesColor.system.warning,
      error: hermesColor.system.error,
      info: hermesColor.system.info
    }
  },
  // Hermès loads OPEN-SOURCE webfonts (not a single proprietary face): the live
  // CSS declares `--font-primary:"Manrope","Roboto",sans-serif` (UI/body),
  // `--font-edito:"EBGaramond","Bell MT",...` (editorial display serif) and
  // `--font-secondary:"Overpass Mono",...` (small labels/meta). We reference the
  // font *names* only, never the woff2 binaries. (Specialty display faces such as
  // Filosofia / Akkurat load only on specific editorial pages — see MAPPING.md.)
  font: {
    sans: "'Manrope', 'Roboto', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'EB Garamond', 'Bell MT', Georgia, 'Times New Roman', serif",
    mono: "'Overpass Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; hermes.com uses a comparable rem scale).
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
  // Hermès aesthetic is SQUARED. The live CSS resolves controls/cards to
  // `border-radius: 0` (only `0` and `50%` for circular dots appear). Luxury
  // minimalism — only pills use the full radius.
  radius: {
    none: "0",
    sm: "0", // controls square
    md: "0", // button / input / tabs — square
    lg: "0", // cards — square
    pill: "999px" // tags / pills
  },
  // Hermès uses very light, neutral elevation (ink-tinted). The editorial site is
  // largely flat with thin rules — exact shadow specs derived ("à confirmer").
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 10px 30px rgb(0 0 0 / 0.14)"
  },
  // Hermès motion: the live CSS shows transitions of `.4s` with easings
  // `cubic-bezier(.25,.8,.25,1)` / `cubic-bezier(0,0,.2,1)`. Those curves are the
  // Angular Material defaults the site is built on, so they are MEASURED but
  // framework-derived; `fast`/`slow` are derived steps (à confirmer).
  motion: {
    fast: "200ms", // derived step (à confirmer)
    normal: "400ms", // measured (.4s transition) — framework default (à confirmer)
    slow: "600ms", // derived step (à confirmer)
    easing: "cubic-bezier(0.25, 0.8, 0.25, 1)" // measured (framework default — à confirmer)
  },
  // z-index roles are not Hermès-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Hermès) -----------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Hermès control density: generous, editorial. Heights/paddings are derived to
  // express the brand's airy luxury rhythm (à confirmer — the editorial home
  // exposes few bordered controls to measure directly).
  density: {
    sm: { controlHeight: "2.5rem", paddingBlock: "0", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "0.8125rem" },
    md: { controlHeight: "3rem", paddingBlock: "0.75rem", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3rem", fontSize: "0.875rem" },
    lg: { controlHeight: "3.5rem", paddingBlock: "0", paddingInline: "2.25rem", gap: "0.5rem", minWidth: "3.5rem", fontSize: "1rem" }
  },
  // Hermès typography. CTAs are the brand signature: UPPERCASE labels with light
  // tracking (measured `text-transform:uppercase` widely + `letter-spacing:0.5–1px`
  // on caps). Manrope for UI/CTA/fields; small uppercase tracked labels.
  typography: {
    control: { family: "'Manrope', system-ui, sans-serif", size: "0.875rem", weight: "600", lineHeight: "1.2", letterSpacing: "0.04em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Manrope', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Manrope', system-ui, sans-serif", size: "0.75rem", weight: "600", lineHeight: "1.25", letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Hermès links: black, no permanent underline; a thin underline appears on
    // hover (editorial luxury convention — offset/thickness à confirmer).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // Hermès dims disabled controls (à confirmer)
  // Transition uses the measured Hermès easing; duration kept snappy for hovers.
  transition: { property: "background-color, border-color, color, outline-color", duration: "200ms", easing: "cubic-bezier(0.25, 0.8, 0.25, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.5rem" },
  // Hermès FOCUS = a 2px solid OUTLINE in pure black, offset 3px. Measured on the
  // live CSS: `outline:2px solid #000` + `outline-offset:3px`.
  focus: {
    strategy: "outline",
    width: "2px", // measured (`outline:2px solid`)
    offset: "3px", // measured (`outline-offset:3px`)
    color: hermesColor.ink.black, // #000000 black outline
    inset: "0"
  },
  // Hermès form fields: minimal SQUARED boxes (white fill, 1px hairline, radius 0).
  // The editorial home exposes few bordered inputs to measure, so the exact field
  // treatment is "à confirmer" — `outline` + square corners matches the measured
  // minimalism. Native <select> chevron redrawn in black ink.
  field: {
    style: "outline",
    fillBg: hermesColor.ink.white, // #ffffff
    underlineColor: hermesColor.ink.black, // #000000 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23000000' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Hermès cards: a thin 1px hairline border, square corners, cream hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: hermesColor.cream.bg // #f6f1eb
  },
  // Hermès secondary button = OUTLINED (transparent fill, black border + text,
  // cream fill on hover).
  buttonSecondary: {
    background: "transparent",
    border: hermesColor.ink.black, // #000000 stroke
    hoverBackground: hermesColor.cream.bg // #f6f1eb cream fill on hover
  },
  // Hermès tabs / nav: active tab = bold black label with a bottom underline.
  // (`createComponent` draws the indicator filet in the brand accent = orange.)
  tabs: {
    activeText: hermesColor.ink.black, // #000000
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom", // underline on the bottom edge
    indicatorMode: "border" // a real bottom border
  },
  // Hermès pagination: borderless black text links; active page = filled orange.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: hermesColor.ink.black, // #000000 link text
    activeBackground: hermesColor.orange.main, // #f37021 filled active page (accent)
    activeText: hermesColor.ink.black, // #000000 black on orange (AA)
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem" // 24px
  },
  // Hermès breadcrumb: grey links, black current page, grey separators.
  breadcrumb: {
    linkText: hermesColor.grey.muted, // #696969
    text: hermesColor.grey.muted, // #696969 trail text
    currentText: hermesColor.ink.black, // #000000 current page
    separator: hermesColor.grey.muted, // #696969
    fontSize: "0.75rem", // 12px
    lineHeight: "1.25rem", // 20px
    currentWeight: "700"
  },
  // Hermès notice / alert: a coloured LEFT accent filet on a transparent box.
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
  // Hermès details: a black bold summary trigger.
  accordion: {
    text: hermesColor.ink.black, // #000000 summary label
    paddingBlock: "1rem", // 16px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    fontWeight: "600",
    lineHeight: "1.5rem" // 24px
  },
  // Hermès tag: a small SQUARED cream chip (radius 0, luxury minimalism).
  tag: {
    radius: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    fontSize: "0.75rem", // 12px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: hermesColor.cream.bg, // #f6f1eb
    neutralText: hermesColor.ink.black // #000000
  },
  // Hermès badge: a SQUARED filled badge, uppercase label.
  badge: {
    radius: "0",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.6875rem", // 11px
    fontWeight: "700",
    lineHeight: "1.25rem", // 20px
    textTransform: "uppercase",
    minHeight: "1.25rem", // 20px
    infoBackground: hermesColor.ink.black, // #000000
    infoText: hermesColor.cream.light // #fffcf7 cream on black
  },
  // Hermès checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: hermesColor.ink.black // #000000
  },
  // Hermès search input.
  search: {
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Hermès toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: hermesColor.ink.black // #000000
  }
} as const;

// --- semantic (Hermès-specific role mapping) -------------------------------
const semantic = {
  surface: {
    default: hermesColor.cream.light, // #fffcf7 lightest cream content surface (measured)
    subtle: hermesColor.cream.bg, // #f6f1eb signature body cream — recessed alt bg (measured)
    raised: hermesColor.ink.white, // #ffffff white card raised above cream (measured)
    inverse: hermesColor.ink.black, // #000000 black inverse surface (measured)
    overlay: "rgb(0 0 0 / 0.6)" // modal backdrop (ink tint)
  },
  text: {
    primary: hermesColor.ink.black, // #000000 (body{color:#000}) measured
    secondary: hermesColor.grey.dark, // #444444 (à confirmer — DOM)
    muted: hermesColor.grey.muted, // #696969 (à confirmer — DOM)
    inverse: hermesColor.cream.light, // #fffcf7 warm cream on dark / coloured surfaces
    link: hermesColor.ink.black // #000000 black links (editorial underline-on-hover)
  },
  border: {
    subtle: hermesColor.cream.hairline, // #e3dccf warm hairline (derived)
    strong: hermesColor.ink.black, // #000000 black hairline rules (measured minimal)
    interactive: hermesColor.ink.black // #000000 black interactive / focus border (measured)
  },
  action: {
    primary: hermesColor.orange.main, // #f37021 Hermès orange primary accent (à confirmer)
    primaryHover: hermesColor.orange.dark, // #d85f15 darker orange hover (derived)
    primaryText: hermesColor.ink.black, // #000000 black text on orange (AA ~7:1)
    secondary: hermesColor.cream.bg, // #f6f1eb cream secondary surface (measured)
    secondaryHover: hermesColor.cream.hairline, // #e3dccf warm hover (derived)
    secondaryText: hermesColor.ink.black, // #000000 black text
    danger: hermesColor.system.error // #9d2a1e brick red (derived)
  },
  feedback: {
    success: hermesColor.system.success, // #3f7344 forest green (derived)
    warning: hermesColor.system.warning, // #a8620f amber (derived)
    error: hermesColor.system.error, // #9d2a1e brick red (derived)
    info: hermesColor.system.info // #2f5d7c slate blue (derived)
  },
  status: {
    pending: hermesColor.system.warning, // amber
    processing: hermesColor.system.info, // slate blue
    completed: hermesColor.system.success, // forest green
    failed: hermesColor.system.error // brick red
  },
  // Categorical data-vis palette built from the Hermès brand + derived hues.
  // (Hermès publishes no sequential scale — see MAPPING.md "à confirmer".)
  data: {
    category1: hermesColor.orange.main, // #f37021 Hermès orange
    category2: hermesColor.ink.black, // #000000 black ink
    category3: hermesColor.system.success, // #3f7344 forest green
    category4: hermesColor.system.info, // #2f5d7c slate blue
    category5: hermesColor.system.error, // #9d2a1e brick red
    category6: hermesColor.system.warning, // #a8620f amber
    category7: hermesColor.grey.muted, // #696969 grey
    category8: hermesColor.grey.taupe // #b0a18a warm taupe
  }
} as const;

/**
 * The Hermès theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Hermès-specific measured values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Hermès brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const hermesTheme: TenantTheme = {
  id: "hermes",
  label: "Hermès",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default hermesTheme;
