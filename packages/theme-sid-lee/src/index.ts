import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Sid Lee (sidlee.com — the Montréal-born global creative agency) theme for the
 * Sentropic token structure.
 *
 * Sid Lee publishes no design-token file; the values below are MEASURED from the
 * live site's computed CSS (https://www.sidlee.com/, inspected in a real
 * browser). We only reference the font *names* here ("sang-bleu-kingdom", a
 * high-contrast display serif used for headlines, and "visuelt", a Swiss-grotesk
 * body sans — Sid Lee's own webfont aliases), never font binaries. Sources and
 * the full mapping table are in MAPPING.md.
 *
 * Sid Lee's identity is BOLD CREATIVE: a vivid orange-red brand mark on a
 * near-white / ink palette, an editorial serif/sans pairing, and a small but
 * playful set of accent hues (lavender, lime, olive, blue) used as expressive
 * splashes. The brand "colour" is the orange-red #FF440B. Where Sentropic needs
 * a role Sid Lee never colours (feedback states, the categorical data scale),
 * the playful accents or a restrained system colour are used and the choice is
 * noted "à confirmer" in MAPPING.md.
 *
 * Sid Lee colour reference (measured, light theme):
 *   Orange-red (brand / action)        #FF440B   action colour (11 els)
 *   Ink (text primary)                 #1a1a1a   measured body ink
 *   Inverse surface (dark)             #191919   footer / inverse tone
 *   Secondary text                     #868e96   measured grey
 *   Muted text                         #a8a8a8   measured light grey
 *   Lavender accent                    #D2BBF8   playful accent → data
 *   Lime accent                        #C8FC0F   playful accent → data
 *   Olive accent                       #9EA145   playful accent → data
 *   Blue accent                        #5489F8   playful accent → data / info
 *   Surface default                    #ffffff   white
 *   Surface subtle                     #f5f5f5   faint grey (à confirmer)
 *   Border subtle                      #e0e0e0   hairline (à confirmer)
 *   Border strong                      #868e96   measured grey
 */

// --- Sid Lee raw colour palette (measured from live computed CSS) -----------
const sidLeeColor = {
  // The brand mark is a vivid orange-red. Sid Lee uses it for primary actions,
  // links, and expressive accents across the site.
  orange: "#FF440B", // action colour rgb(255,68,11) — brand / action / link (11 els)
  orangeHover: "#e03808", // slightly darkened brand for hover — à confirmer
  // Ink / inverse neutrals.
  ink: "#1a1a1a", // measured body ink rgb(26,26,26) — text.primary
  inkInverse: "#191919", // footer / inverse surface rgb(25,25,25)
  white: "#ffffff", // surface default rgb(255,255,255)
  // Grey scale (each value measured or sensibly bracketed).
  grey: {
    50: "#f5f5f5", // faint grey subtle surface — à confirmer
    100: "#e0e0e0", // hairline border — à confirmer
    400: "#a8a8a8", // muted text rgb(168,168,168)
    600: "#868e96" // secondary text / strong border rgb(134,142,150)
  },
  // Playful accent palette (measured) — Sid Lee uses these as expressive
  // splashes; mapped onto the Sentropic data-vis scale.
  accent: {
    lavender: "#D2BBF8", // rgb(210,187,248)
    lime: "#C8FC0F", // rgb(200,252,15)
    olive: "#9EA145", // rgb(158,161,69)
    blue: "#5489F8" // rgb(84,137,248) — also feedback.info (à confirmer)
  },
  // System / feedback colours. Sid Lee shows a measured danger red; the
  // success/warning hues are restrained defaults (AA on white), info reuses the
  // measured blue accent. Largely à confirmer.
  system: {
    danger: "#dc3545", // measured danger red rgb(220,53,69)
    success: "#2e7d32", // restrained green, AA on white — à confirmer
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#5489f8" // reuse measured blue accent — à confirmer
  }
} as const;

// --- foundation (Sid Lee-specific values) -----------------------------------
const foundation = {
  color: {
    // Sid Lee has no brand blue; the Sentropic "blue" role family (action /
    // primary / link) is mapped onto the orange-red brand mark — the Sid Lee
    // primary action IS orange-red. (à confirmer: Sid Lee has no blue brand.)
    blue: {
      10: sidLeeColor.grey[50], // #f5f5f5 lightest neutral tint
      60: sidLeeColor.orange, // #FF440B primary action / link (brand mark)
      80: sidLeeColor.orangeHover // #e03808 darker brand step
    },
    // Sid Lee has no cyan; the Sentropic "cyan" accent slot is mapped to the
    // playful blue accent (the closest decorative hue). (à confirmer.)
    cyan: {
      10: sidLeeColor.grey[50], // #f5f5f5 light neutral tint
      50: sidLeeColor.accent.blue, // #5489F8 playful blue accent
      70: sidLeeColor.ink // #1a1a1a ink
    },
    // Sentropic "slate" role family mapped onto the Sid Lee neutral scale.
    slate: {
      0: sidLeeColor.white, // #ffffff white
      10: sidLeeColor.grey[50], // #f5f5f5 faint subtle surface
      20: sidLeeColor.grey[100], // #e0e0e0 hairline / subtle border
      60: sidLeeColor.grey[600], // #868e96 secondary text
      80: sidLeeColor.ink, // #1a1a1a primary text ink
      90: sidLeeColor.inkInverse // #191919 darkest (inverse surface)
    },
    feedback: {
      success: sidLeeColor.system.success,
      warning: sidLeeColor.system.warning,
      error: sidLeeColor.system.danger,
      info: sidLeeColor.system.info
    }
  },
  // Sid Lee serves two webfont aliases: "sang-bleu-kingdom" (a high-contrast
  // display serif used for editorial headlines) and "visuelt" (a Swiss-grotesk
  // body sans for UI / running text). We reference the *names* only. Mono is not
  // part of Sid Lee — the Sentropic mono stack is kept.
  font: {
    sans: "'visuelt', helvetica, arial, sans-serif",
    display: "'sang-bleu-kingdom', Georgia, Times, serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale, aligned with the Sentropic base 4px scale
  // (Sid Lee's exact steps are not strongly tokenised publicly — à confirmer).
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
  // Sid Lee uses subtle, small rounding on controls (not square, not pill). The
  // exact radii are à confirmer; measured a gentle 2–8px on cards/buttons.
  radius: {
    none: "0",
    sm: "2px", // controls — gently rounded
    md: "4px", // button / input / tabs
    lg: "8px", // cards
    pill: "999px" // tags / pills
  },
  // Sid Lee elevation is restrained — editorial layouts rely on whitespace and
  // type more than heavy shadow. Kept conservative (à confirmer exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.14)"
  },
  // Standard eases aligned with the base (durations not fully tokenised — à confirmer).
  motion: {
    fast: "120ms",
    normal: "200ms",
    slow: "320ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Sid Lee-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Sid Lee) ----------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Sid Lee control density — editorial, comfortable touch targets.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.8125rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1rem" }
  },
  // Sid Lee typography = the visuelt grotesk for UI/body, sang-bleu-kingdom serif
  // for display headlines. Control labels are sentence case.
  typography: {
    control: { family: "'visuelt', helvetica, arial, sans-serif", size: "0.9375rem", weight: "500", lineHeight: "1.2", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'visuelt', helvetica, arial, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'visuelt', helvetica, arial, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Sid Lee links are the brand orange-red, underlined on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4",
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "200ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // Sid Lee FOCUS = a brand orange-red OUTLINE (2px). The brand mark is the focus
  // affordance — expressive, on-brand.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: sidLeeColor.orange, // #FF440B — Sid Lee focuses in the brand orange-red
    inset: "0"
  },
  // Sid Lee form fields are BOXED (outline): a white fill with a thin hairline
  // border and a small radius. `style: "outline"` draws four equal borders from
  // `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: sidLeeColor.white, // #ffffff
    underlineColor: sidLeeColor.grey[600], // #868e96 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the brand orange-red.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23FF440B' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Sid Lee cards: gently rounded, hairline border, faint hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: sidLeeColor.grey[50] // #f5f5f5 faint hover tint
  },
  // Sid Lee secondary button = neutral light fill, ink text, slightly darker on hover.
  buttonSecondary: {
    background: sidLeeColor.grey[50], // #f5f5f5
    border: sidLeeColor.grey[100], // #e0e0e0 hairline
    hoverBackground: "#e9e9e9" // measured secondary hover
  },
  // Sid Lee tabs / sub-nav: active tab = ink bold label with a brand orange-red
  // bottom underline (the expressive indicator).
  tabs: {
    activeText: sidLeeColor.ink, // #1a1a1a
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.875rem", // 14px
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom",
    indicatorColor: sidLeeColor.orange, // #FF440B brand underline
    indicatorMode: "border"
  },
  // Sid Lee pagination: borderless ink links; active page = filled orange-red.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: sidLeeColor.ink, // #1a1a1a link text
    activeBackground: sidLeeColor.orange, // #FF440B filled active page
    activeText: sidLeeColor.white, // white on orange-red
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1rem" // 16px
  },
  // Sid Lee breadcrumb: ink links, grey trail, ink current page, grey separators.
  breadcrumb: {
    linkText: sidLeeColor.ink, // #1a1a1a
    text: sidLeeColor.grey[600], // #868e96 trail text
    currentText: sidLeeColor.ink, // #1a1a1a current page
    separator: sidLeeColor.grey[600], // #868e96
    fontSize: "0.8125rem", // 13px
    lineHeight: "1rem", // 16px
    currentWeight: "500"
  },
  // Sid Lee notice / alert: a minimal box with a coloured left filet accent.
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0.1875rem", // 3px ::before accent bar
    paddingTop: "0.875rem", // 14px
    paddingRight: "1rem", // 16px
    paddingBottom: "0.875rem", // 14px
    paddingLeft: "1.125rem", // 18px (clears the left filet)
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Sid Lee accordion / disclosure: ink summary trigger, hairline separated.
  accordion: {
    text: sidLeeColor.ink, // #1a1a1a summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0",
    fontSize: "0.9375rem", // 15px
    fontWeight: "500",
    lineHeight: "1.25rem" // 20px
  },
  // Sid Lee tag: a small rounded grey chip.
  tag: {
    radius: "999px", // Sid Lee tags are pill-rounded
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.625rem", // 10px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: sidLeeColor.grey[50], // #f5f5f5 subtle fill
    neutralText: sidLeeColor.ink // #1a1a1a
  },
  // Sid Lee badge: a small filled badge — brand orange-red fill / white text.
  badge: {
    radius: "999px",
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: sidLeeColor.orange, // #FF440B brand fill
    infoText: sidLeeColor.white // white on orange-red
  },
  // Sid Lee checkbox/radio label: ink grotesk.
  choice: {
    labelFontSize: "0.9375rem", // 15px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: sidLeeColor.ink // #1a1a1a
  },
  // Sid Lee search input: a rounded hairline box.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.25rem" // 20px
  },
  // Sid Lee toggle / switch label: ink grotesk.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: sidLeeColor.ink // #1a1a1a
  }
} as const;

// --- semantic (Sid Lee-specific role mapping) -------------------------------
const semantic = {
  surface: {
    default: sidLeeColor.white, // #ffffff white
    subtle: sidLeeColor.grey[50], // #f5f5f5 faint subtle surface (à confirmer)
    raised: sidLeeColor.white, // #ffffff white
    inverse: sidLeeColor.inkInverse, // #191919 dark inverse surface (footer tone)
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop
  },
  text: {
    primary: sidLeeColor.ink, // #1a1a1a measured ink
    secondary: sidLeeColor.grey[600], // #868e96 measured grey
    muted: sidLeeColor.grey[400], // #a8a8a8 measured light grey
    inverse: sidLeeColor.white, // white on dark surfaces
    link: sidLeeColor.orange // #FF440B brand orange-red link
  },
  border: {
    subtle: sidLeeColor.grey[100], // #e0e0e0 hairline (à confirmer)
    strong: sidLeeColor.grey[600], // #868e96 measured grey
    interactive: sidLeeColor.orange // #FF440B brand focus / interactive
  },
  action: {
    primary: sidLeeColor.orange, // #FF440B brand primary action
    primaryHover: sidLeeColor.orangeHover, // #e03808 darker brand on hover (à confirmer)
    primaryText: sidLeeColor.white, // white text on orange-red
    secondary: sidLeeColor.grey[50], // #f5f5f5 secondary surface
    secondaryHover: "#e9e9e9", // measured secondary hover
    secondaryText: sidLeeColor.ink, // #1a1a1a
    danger: sidLeeColor.system.danger // #dc3545 measured danger red
  },
  feedback: {
    success: sidLeeColor.system.success,
    warning: sidLeeColor.system.warning,
    error: sidLeeColor.system.danger,
    info: sidLeeColor.system.info
  },
  status: {
    pending: sidLeeColor.system.warning,
    processing: sidLeeColor.system.info,
    completed: sidLeeColor.system.success,
    failed: sidLeeColor.system.danger
  },
  // Categorical data-vis palette. Sid Lee publishes no data-vis scale, but its
  // playful accent palette (lavender / lime / olive / blue) is the natural source;
  // rounded out with the brand orange-red, ink, and restrained system hues
  // (see MAPPING.md, "à confirmer" — not an official scale).
  data: {
    category1: sidLeeColor.orange, // #FF440B brand orange-red
    category2: sidLeeColor.accent.lavender, // #D2BBF8 lavender
    category3: sidLeeColor.accent.lime, // #C8FC0F lime
    category4: sidLeeColor.accent.blue, // #5489F8 blue
    category5: sidLeeColor.accent.olive, // #9EA145 olive
    category6: sidLeeColor.ink, // #1a1a1a ink
    category7: sidLeeColor.grey[600], // #868e96 grey
    category8: sidLeeColor.system.success // restrained green (à confirmer)
  }
} as const;

/**
 * The Sid Lee theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Sid Lee-specific (bold-creative) values, and
 * the `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so Sid Lee's orange-red-on-ink identity reaches the
 * components (buttons, tabs, pagination, chat bubbles…), not just the elements
 * that read semantic vars directly.
 */
export const sidLeeTheme: TenantTheme = {
  id: "sid-lee",
  label: "Sid Lee",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default sidLeeTheme;
