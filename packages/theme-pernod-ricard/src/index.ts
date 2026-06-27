import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Pernod Ricard corporate design system theme for the Sentropic token structure.
 *
 * MEASURED CLONE — all colour values below are measured from the PUBLIC compiled
 * CSS of pernod-ricard.com (Drupal 10 theme `pr2021_front`, SCSS compiled to
 * `assets/css/app.css`, June 2026). The theme exposes no CSS custom properties;
 * the palette is hard-coded hex in the compiled stylesheet, so each comment cites
 * the real declaration (and line where useful). We only reference the font *names*
 * (Weave, Noto Sans), never the binaries. Sources and any derived ("à confirmer")
 * values are documented in MAPPING.md.
 *
 * Pernod Ricard's identity is a deep corporate NAVY `#0c294e` (footers, hero
 * overlays, headers — 63 occurrences) with a bright interactive BLUE `#0057d9`
 * for active states / links / CTAs. Buttons are SQUARE (no radius), form inputs
 * carry a 4px radius, cards 8px. The display face is the proprietary "Weave"; the
 * body face is "Noto Sans".
 *
 * Pernod Ricard colour reference (measured, light theme):
 *   White (background default)        #ffffff   (body background, app.css l.4046)
 *   Off-white (background alt)        #f9f8f7   (soft surface, 13×)
 *   Subtle border tint                #ebeced   (light hairline, 5×)
 *   Input border grey                 #d3d5d7   (input border, l.14719)
 *   Mid grey                          #979797   (4×)
 *   Secondary text (accessible)       #767676   (placeholder / secondary, l.9530)
 *   Primary text (warm slate)         #222d38   (body color, l.4045, 129×)
 *   Corporate navy (primary / brand)  #0c294e   (footer/hero/header bg, l.845)
 *   Interactive blue (action/link)    #0057d9   (active tab / link / CTA, l.6344/17006)
 *   Light decorative blue (accent)    #5fa4d0   (filter/tab underlines, l.7363)
 *   Soft focus blue                   #5f9cf6   (age-gate :focus-visible, l.17815)
 *   Module link blue                  #2d8efb   (editorial module links, l.6339)
 *   Success green                     #00d490   (.messages--success, l.12764)
 *   Error rust                        #d05428   (.messages--error, l.12771)
 *   Warning amber                     #f5a623   (.messages--warning, l.12778)
 */

// --- Pernod Ricard raw colour palette (measured on pernod-ricard.com app.css) -
const pernodRicardColor = {
  // Deep corporate navy — the dominant Pernod Ricard brand / primary family.
  navy: {
    main: "#0c294e", // app.css l.845 — footer/hero/header background (brand primary)
    tint: "#e6ecf3" // light navy tint for low-emphasis surfaces (derived — à confirmer)
  },
  // Bright interactive blue — active states, links, CTAs (the action accent).
  blue: {
    bright: "#0057d9", // app.css l.6344 / l.17006 — active tab underline, link, CTA fill
    focusBorder: "#015fcc", // app.css l.14710 — input border colour on :focus
    light: "#5fa4d0", // app.css l.7363 — decorative light blue (filter/tab at rest)
    softFocus: "#5f9cf6", // app.css l.17815 — age-gate :focus-visible ring blue
    module: "#2d8efb" // app.css l.6339 / l.9095 — editorial module link blue
  },
  // Warm slate — the Pernod Ricard primary text colour.
  ink: "#222d38", // app.css l.4045 — body text colour (primary text, 129×)
  // Neutral grey scale (compiled hex; no greyscale tokens published).
  grey: {
    0: "#ffffff", // body background (l.4046)
    offWhite: "#f9f8f7", // soft off-white surface (13×)
    50: "#ebeced", // very-light hairline border tint (5×)
    200: "#d3d5d7", // input border (l.14719)
    400: "#979797", // mid grey (4×)
    500: "#767676", // accessible secondary text / placeholder (l.9530)
    600: "#555555", // text grey (13×)
    900: "#212121" // near-black dotted focus outline (l.17816)
  },
  // System / status colours (Drupal `.messages--*` block, l.12762-12781).
  system: {
    success: "#00d490", // .messages--success (l.12764)
    error: "#d05428", // .messages--error rust-orange (l.12771)
    errorForm: "#e74c3c", // age-gate form validation red (l.17712) — alt error
    warning: "#f5a623", // .messages--warning amber (l.12778)
    info: "#0057d9" // no dedicated info colour; the interactive blue plays the role
  }
} as const;

// --- foundation (Pernod Ricard-specific values) ----------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the Pernod Ricard blues:
    // bright interactive blue as the mid primary, deep navy as the darkest.
    blue: {
      10: pernodRicardColor.navy.tint, // #e6ecf3 lightest navy tint (derived)
      60: pernodRicardColor.blue.bright, // #0057d9 bright interactive blue
      80: pernodRicardColor.navy.main // #0c294e deep corporate navy
    },
    // Pernod Ricard has no cyan / gold accent; the only secondary hue is the
    // light decorative blue, so the Sentropic "cyan" accent slot is mapped onto
    // the light-blue family (role fit "à confirmer").
    cyan: {
      10: pernodRicardColor.navy.tint, // #e6ecf3 light tint
      50: pernodRicardColor.blue.light, // #5fa4d0 light decorative blue
      70: pernodRicardColor.blue.module // #2d8efb module blue
    },
    // Sentropic "slate" role family mapped onto the measured grey scale.
    slate: {
      0: pernodRicardColor.grey[0], // #ffffff white
      10: pernodRicardColor.grey.offWhite, // #f9f8f7 off-white (background alt)
      20: pernodRicardColor.grey[50], // #ebeced subtle borders
      60: pernodRicardColor.grey[500], // #767676 secondary text
      80: pernodRicardColor.grey[600], // #555555 strong text grey
      90: pernodRicardColor.ink // #222d38 primary text (darkest)
    },
    feedback: {
      success: pernodRicardColor.system.success,
      warning: pernodRicardColor.system.warning,
      error: pernodRicardColor.system.error,
      info: pernodRicardColor.system.info
    }
  },
  // Pernod Ricard ships "Weave" (proprietary display face, alias `pr_headings`,
  // @font-face `Weave-Bold-Pro.woff2`) for headings and "Noto Sans" (alias
  // `pr_body`, `NotoSans-Regular.woff2`) for body. Measured @font-face fallbacks:
  // Weave → Lucida Sans family; Noto Sans → Arial. No mono face shipped; the
  // Sentropic mono stack is kept. Font *names* only — never the binaries.
  font: {
    sans: "'Noto Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
    display: "'Weave', 'Lucida Sans', 'Lucida Sans Unicode', 'Lucida Grande', sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; pernod-ricard.com uses a comparable rem scale).
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
  // Pernod Ricard aesthetic: SHARP angles. Buttons are square (`.btn-old` carries
  // no radius, l.6150); inputs carry a 4px radius (l.14720); cards 8px. Pills use
  // a 40px radius (measured on rounded tags). `md` = 0 keeps buttons square; the
  // field box overrides back to 4px via `field.radiusTop/radiusBottom`.
  radius: {
    none: "0",
    sm: "0.25rem", // 4px — selection controls (matches the field register)
    md: "0", // 0 — buttons square (measured `.btn-old`)
    lg: "0.5rem", // 8px — cards (measured)
    pill: "2.5rem" // 40px — pills / rounded tags (measured)
  },
  // Pernod Ricard uses light, neutral elevation (navy-tinted). Exact specs are
  // not strongly tokenised publicly — derived ("à confirmer").
  shadow: {
    subtle: "0 1px 2px rgb(12 41 78 / 0.08)",
    medium: "0 4px 12px rgb(12 41 78 / 0.12)",
    floating: "0 8px 24px rgb(12 41 78 / 0.16)"
  },
  // Motion durations are not strongly tokenised by Pernod Ricard publicly (the
  // site mostly animates opacity on links); kept aligned with the Sentropic base
  // ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "200ms",
    slow: "300ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Pernod Ricard-specific; kept aligned with the base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Pernod Ricard) ----------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Pernod Ricard control density: airy. The compiled inputs use generous
  // padding (1.25rem 1.375rem) and a large body size; exact control heights are
  // not directly exposed, so the height/padding steps are derived ("à confirmer").
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0", paddingInline: "2rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1.125rem" }
  },
  // Pernod Ricard typography: Weave (display) for interactive/labels, Noto Sans
  // for body/fields. The exact CTA/label font-family is not directly measured;
  // pairing the display face with controls mirrors the heading-led brand voice
  // ("à confirmer").
  typography: {
    control: { family: "'Weave', 'Lucida Sans', sans-serif", size: "1rem", weight: "700", lineHeight: "1.3", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Noto Sans', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.3", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Weave', 'Lucida Sans', sans-serif", size: "1rem", weight: "700", lineHeight: "1.3", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Pernod Ricard links inherit the text colour and reveal an underline on
    // hover (measured: `body a` only transitions opacity; hover styling is
    // per-component). Underline thickness/offset are derived ("à confirmer").
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.08em", decorationOffsetHover: "0.15em"
    }
  },
  disabledOpacity: "0.5", // dims disabled controls (derived — à confirmer)
  transition: { property: "background-color, border-color, color, outline-color", duration: "200ms", easing: "ease" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // Pernod Ricard FOCUS = an OUTLINE. The site default is a thin dotted near-black
  // outline (`outline: 0.0625rem dotted #212121`); the only intentional designed
  // `:focus-visible` (age-gate) is a 2px solid soft-blue ring, offset 2px —
  // adopted here as the brand focus.
  focus: {
    strategy: "outline",
    width: "2px", // measured (age-gate `:focus-visible` outline 2px)
    offset: "2px", // measured (age-gate `outline-offset: 2px`)
    color: pernodRicardColor.blue.softFocus, // #5f9cf6 age-gate :focus-visible ring
    inset: "0"
  },
  // Pernod Ricard form fields are BOXED (outline): white fill, 1px grey border
  // (#d3d5d7) and a 4px radius (l.14710-14726). `radiusTop/Bottom` pin the field
  // back to 4px even though the theme's `radius.md` is 0 (square buttons). On
  // focus the border turns blue (#015fcc, handled by the focus ring). Native
  // <select> chevron redrawn in the corporate navy.
  field: {
    style: "outline",
    fillBg: pernodRicardColor.grey[0], // #ffffff
    underlineColor: pernodRicardColor.grey[200], // #d3d5d7 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    radiusTop: "0.25rem", // 4px — measured input radius (l.14720)
    radiusBottom: "0.25rem", // 4px
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%230c294e' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Pernod Ricard cards: a thin 1px hairline border, 8px radius, off-white hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: pernodRicardColor.grey.offWhite // #f9f8f7
  },
  // Pernod Ricard secondary button = OUTLINED (transparent fill, navy border +
  // text, off-white fill on hover).
  buttonSecondary: {
    background: "transparent",
    border: pernodRicardColor.navy.main, // #0c294e navy stroke
    hoverBackground: pernodRicardColor.grey.offWhite // #f9f8f7 off-white fill on hover
  },
  // Pernod Ricard tabs / filters: active tab = bold label with a bottom blue
  // underline (measured: `border-bottom: 3px solid #0057d9`, l.17006).
  tabs: {
    activeText: pernodRicardColor.blue.bright, // #0057d9
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // blue underline on the bottom edge
    indicatorMode: "border" // a real bottom border (3px filet)
  },
  // Pernod Ricard pagination: borderless blue links; active page = filled navy.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: pernodRicardColor.blue.bright, // #0057d9 link text
    activeBackground: pernodRicardColor.navy.main, // #0c294e filled active page
    activeText: pernodRicardColor.grey[0], // white on navy
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Pernod Ricard breadcrumb: links inherit the text colour (coloured on hover),
  // current page is the dark ink, grey separators.
  breadcrumb: {
    linkText: pernodRicardColor.ink, // #222d38 (links inherit text)
    text: pernodRicardColor.grey[500], // #767676 trail text
    currentText: pernodRicardColor.ink, // #222d38 current page
    separator: pernodRicardColor.grey[400], // #979797
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem", // 24px
    currentWeight: "700" // current page emphasised
  },
  // Pernod Ricard notice / alert: a coloured LEFT border accent on a tinted box
  // (measured: `.messages--*` carry `border-left-color` + a light rgba fill).
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0.25rem", // 4px coloured left border (measured `border-left`)
    filetWidth: "0",
    paddingTop: "1rem", // 16px
    paddingRight: "1rem", // 16px
    paddingBottom: "1rem", // 16px
    paddingLeft: "1.25rem", // 20px (clears the left accent)
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Pernod Ricard details: a dark bold summary trigger.
  accordion: {
    text: pernodRicardColor.ink, // #222d38 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "700", // bold summary
    lineHeight: "1.5rem" // 24px
  },
  // Pernod Ricard tag: a rounded (pill) light chip.
  tag: {
    radius: "2.5rem", // 40px pill (measured)
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: pernodRicardColor.grey.offWhite, // #f9f8f7
    neutralText: pernodRicardColor.ink // #222d38
  },
  // Pernod Ricard badge: a 4px-radius filled badge in the interactive blue.
  badge: {
    radius: "0.25rem", // 4px
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: pernodRicardColor.blue.bright, // #0057d9
    infoText: pernodRicardColor.grey[0] // white
  },
  // Pernod Ricard checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: pernodRicardColor.ink // #222d38
  },
  // Pernod Ricard search input.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Pernod Ricard toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: pernodRicardColor.ink // #222d38
  }
} as const;

// --- semantic (Pernod Ricard-specific role mapping) ------------------------
const semantic = {
  surface: {
    default: pernodRicardColor.grey[0], // #ffffff white
    subtle: pernodRicardColor.grey.offWhite, // #f9f8f7 off-white background alt
    raised: pernodRicardColor.grey[0], // #ffffff white
    inverse: pernodRicardColor.navy.main, // #0c294e deep navy inverse (header/footer)
    overlay: "rgb(12 41 78 / 0.6)" // modal backdrop (navy tint)
  },
  text: {
    primary: pernodRicardColor.ink, // #222d38 (body text)
    secondary: pernodRicardColor.grey[500], // #767676 accessible secondary
    muted: pernodRicardColor.grey[400], // #979797
    inverse: pernodRicardColor.grey[0], // white on dark / coloured surfaces
    link: pernodRicardColor.blue.bright // #0057d9 interactive blue
  },
  border: {
    subtle: pernodRicardColor.grey[50], // #ebeced
    strong: pernodRicardColor.grey[200], // #d3d5d7 (input border)
    interactive: pernodRicardColor.blue.bright // #0057d9 interactive / focus
  },
  action: {
    primary: pernodRicardColor.navy.main, // #0c294e corporate navy primary
    primaryHover: pernodRicardColor.blue.bright, // #0057d9 brightens to interactive blue
    primaryText: pernodRicardColor.grey[0], // white text on navy
    secondary: pernodRicardColor.grey.offWhite, // #f9f8f7 secondary surface
    secondaryHover: pernodRicardColor.grey[50], // #ebeced
    secondaryText: pernodRicardColor.navy.main, // #0c294e
    danger: pernodRicardColor.system.error // #d05428
  },
  feedback: {
    success: pernodRicardColor.system.success, // #00d490
    warning: pernodRicardColor.system.warning, // #f5a623
    error: pernodRicardColor.system.error, // #d05428
    info: pernodRicardColor.system.info // #0057d9
  },
  status: {
    pending: pernodRicardColor.system.warning,
    processing: pernodRicardColor.system.info,
    completed: pernodRicardColor.system.success,
    failed: pernodRicardColor.system.error
  },
  // Categorical data-vis palette built from the measured Pernod Ricard hues.
  // (Pernod Ricard publishes no 8-colour sequential scale — see MAPPING.md
  // "à confirmer".)
  data: {
    category1: pernodRicardColor.navy.main, // #0c294e corporate navy
    category2: pernodRicardColor.blue.bright, // #0057d9 interactive blue
    category3: pernodRicardColor.system.success, // #00d490 green
    category4: pernodRicardColor.blue.light, // #5fa4d0 light blue
    category5: pernodRicardColor.system.warning, // #f5a623 amber
    category6: pernodRicardColor.blue.module, // #2d8efb module blue
    category7: pernodRicardColor.grey[500], // #767676 grey
    category8: pernodRicardColor.system.error // #d05428 rust
  }
} as const;

/**
 * The Pernod Ricard theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Pernod Ricard-specific measured
 * values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so the brand reaches the
 * components (buttons, tabs, pagination, chat bubbles…), not just the elements
 * that read semantic vars directly.
 */
export const pernodRicardTheme: TenantTheme = {
  id: "pernod-ricard",
  label: "Pernod Ricard",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default pernodRicardTheme;
