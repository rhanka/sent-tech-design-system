import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * LG2 (lg2.com — Montréal's largest independent advertising agency) theme for
 * the Sentropic token structure.
 *
 * LG2 publishes no design-token file; the values below are MEASURED from the
 * live site's computed CSS (https://lg2.com, inspected in a real browser).
 * We only reference the font *names* here — LG2's site is driven by a MONOSPACE
 * typeface ("'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Consolas,
 * 'Liberation Mono', 'Courier New', monospace") — never font binaries. Sources
 * and the full mapping table are in MAPPING.md.
 *
 * LG2's identity is a BRUTALIST MONOSPACE EDITORIAL system: a vivid red-orange
 * brand mark on a stark black/white canvas, set entirely in a monospace
 * typeface. Corners are SHARP (no rounding anywhere — radius 0 across the
 * board). The accent is a single loud red-orange (#ff2300, measured 13
 * occurrences) used for CTAs, focus, active tabs/pagination/breadcrumb and the
 * first data category; everything else is black, white and graded greys plus the
 * restrained system hues. Where Sentropic needs a role LG2 never colours
 * (feedback states, a second accent), the closest measured neutral or a
 * restrained system colour is used and the choice is noted "à confirmer" in
 * MAPPING.md.
 *
 * LG2 colour reference (measured, light theme):
 *   Red-orange (action / CTA / brand)  #ff2300   measured, 13 occurrences
 *   Red-orange hover                   #cc1c00   darker CTA hover (à confirmer)
 *   White (CTA text / surface)         #ffffff   page background / on-accent text
 *   Ink — primary text                 #1a1a1a   near-black body text
 *   Secondary text                     #454545   measured secondary ink
 *   Muted text                         #a0a0a0   measured muted ink
 *   Inverse surface                    #111111   black band (theme-color #000)
 *   Danger / system red                #d32f2f   error / danger state
 *   Link blue                          #007aff   measured link colour
 *   Subtle fill surface                #f4f4f4   light fill
 *   Subtle / field border              #d8d8d8   light hairline
 */

// --- LG2 raw colour palette (measured from live computed CSS) ---------------
const lg2Color = {
  // The brand / CTA is a single vivid RED-ORANGE — measured #ff2300, the most
  // frequent accent on the live site (13 occurrences). LG2 uses it for the
  // primary call-to-action, focus, and every "active" indicator.
  redOrange: "#ff2300", // CTA fill / brand / focus / active accent (measured)
  redOrangeHover: "#cc1c00", // darker red-orange on hover (à confirmer)
  white: "#ffffff", // page background / on-accent CTA text — surface default
  // Monochrome ink scale (each value measured from a real element). LG2 sets body
  // text in a hard near-black (#1a1a1a) over white.
  ink: {
    // Primary body text — a hard near-black.
    primary: "#1a1a1a", // near-black — body text colour
    // Secondary text.
    secondary: "#454545", // rgb(69,69,69) — secondary text (measured)
    // Muted text.
    muted: "#a0a0a0" // rgb(160,160,160) — muted text (measured)
  },
  // Inverse / black band. LG2's theme-color is #000; the dark band tone measures
  // ~#111111.
  black: "#111111", // inverse surface / black band (theme-color #000)
  // Neutral surface / line greys.
  grey: {
    subtle: "#f4f4f4", // rgb(244,244,244) — subtle fill surface
    border: "#d8d8d8" // rgb(216,216,216) — subtle / field hairline border
  },
  // LG2's measured link colour is the system blue.
  link: "#007aff", // measured link colour (iOS-style blue)
  // LG2 shows essentially no decorative palette beyond the red-orange, so it
  // publishes no success/warning/info hues. The danger red is a measured
  // error/system red; the rest are restrained, legible (WCAG AA on white) system
  // colours and are "à confirmer" — LG2 has no measured equivalent.
  system: {
    danger: "#d32f2f", // error / danger / system red (measured)
    success: "#2e7d32", // muted green — à confirmer (no LG2 source)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#007aff" // measured link blue reused for "info" (à confirmer)
  }
} as const;

// --- foundation (LG2-specific values) ---------------------------------------
const foundation = {
  color: {
    // LG2's brand is the red-orange. The Sentropic "blue" role family (action /
    // primary / link) is mapped onto the red-orange + ink scale — the LG2
    // primary action IS the red-orange.
    blue: {
      10: lg2Color.grey.subtle, // #f4f4f4 lightest neutral tint
      60: lg2Color.redOrange, // #ff2300 primary action (LG2 red-orange CTA)
      80: lg2Color.redOrangeHover // #cc1c00 darker CTA step (hover)
    },
    // LG2 has no decorative cyan/accent. The Sentropic "cyan" accent slot is
    // mapped onto the red-orange/ink scale (no second decorative accent exists).
    // (à confirmer.)
    cyan: {
      10: lg2Color.grey.subtle, // #f4f4f4 light neutral tint
      50: lg2Color.redOrange, // #ff2300 the only accent LG2 has is the red-orange
      70: lg2Color.redOrangeHover // #cc1c00
    },
    // Sentropic "slate" role family mapped onto the LG2 monochrome ink/grey scale.
    slate: {
      0: lg2Color.white, // #ffffff white
      10: lg2Color.grey.subtle, // #f4f4f4 subtle fill surface
      20: lg2Color.grey.border, // #d8d8d8 hairline / subtle border
      60: lg2Color.ink.secondary, // #454545 secondary text
      80: lg2Color.ink.primary, // #1a1a1a primary text (near-black)
      90: lg2Color.black // #111111 darkest (black band)
    },
    feedback: {
      success: lg2Color.system.success,
      warning: lg2Color.system.warning,
      error: lg2Color.system.danger,
      info: lg2Color.system.info
    }
  },
  // LG2 sets its UI in a MONOSPACE typeface — the site is monospace-driven, so
  // BOTH sans and display map to the same monospace stack ("'IBM Plex Mono',
  // ui-monospace, …"). We reference the *names* only. Mono keeps the same
  // monospace stack.
  font: {
    sans: "'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace",
    display: "'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace",
    mono: "'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. LG2's grid is editorial/generous but its raw
  // spacing steps are not strongly tokenised publicly; kept aligned with the
  // Sentropic base 4px scale ("à confirmer" exact steps).
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
  // LG2 is BRUTALIST — corners are SHARP everywhere. Every radius step is 0,
  // including pill (no rounded chips). This is the defining structural signature.
  radius: {
    none: "0", // square
    sm: "0", // smallest controls — square (brutalist)
    md: "0", // button / input / tabs — square (brutalist)
    lg: "0", // cards — square (brutalist)
    pill: "0" // tags / pills — square too (no rounding anywhere)
  },
  // LG2 elevation is flat/brutalist — it relies on hard edges and the red-orange
  // accent, not soft shadows. Kept conservative and black-tinted ("à confirmer"
  // exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.14)"
  },
  // LG2 animates with short, standard eases (≈150ms transitions). Durations not
  // fully tokenised publicly; kept aligned with the base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "150ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not LG2-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (LG2) --------------------------------------------
  // LG2 borders are thin LIGHT-GREY hairlines (#d8d8d8 @1px). Encoded as 1px
  // thin / 2px thick.
  borderWidth: {
    none: "0",
    thin: "1px", // LG2 hairline (#d8d8d8)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // LG2 control density. Measured CTA buttons sit ~44px tall with generous
  // horizontal padding; nav/body text is mid-sized monospace. md targets a ~44px
  // touch height; sm/lg bracket it ("à confirmer" exact steps).
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // LG2 typography = the monospace stack across controls, fields, labels and
  // links. Control labels are mid-weight mono, often UPPERCASE-tracked on the
  // live site (measured letter-spacing on CTAs); body/field text is sentence
  // case.
  typography: {
    control: { family: "'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace", size: "0.9375rem", weight: "500", lineHeight: "1.2", letterSpacing: "0.04em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace", size: "0.875rem", weight: "400", lineHeight: "1.4", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // LG2 links are the measured blue; the hover affordance is an underline. Set
    // the link family to the monospace stack too (the whole site is mono).
    link: {
      family: "'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // LG2 dims disabled controls
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // LG2 FOCUS = a crisp RED-ORANGE OUTLINE (~2px solid #ff2300). We encode the
  // outline strategy with the brand colour.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: lg2Color.redOrange, // #ff2300 — LG2 focuses in its brand red-orange
    inset: "0"
  },
  // LG2 form fields are BOXED (outline): a white fill with a thin light-grey
  // hairline border and SQUARE corners. `style: "outline"` makes the builder
  // draw four equal borders from `surface.default` + `border.subtle`. Measured
  // input/select border = #d8d8d8 @1px hairline.
  field: {
    style: "outline",
    fillBg: lg2Color.white, // #ffffff
    underlineColor: lg2Color.grey.border, // #d8d8d8 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the primary ink with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%231a1a1a' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // LG2 cards: SQUARE corners (brutalist), a thin light-grey hairline rather than
  // a heavy box, with a faint hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: lg2Color.grey.subtle // #f4f4f4 faint hover tint
  },
  // LG2 secondary button = a soft-grey filled chip (light #f4f4f4 fill, ink text,
  // slightly darker grey on hover) — the quiet alternative to the filled
  // red-orange primary.
  buttonSecondary: {
    background: lg2Color.grey.subtle, // #f4f4f4 soft fill
    border: lg2Color.grey.border, // #d8d8d8 light hairline
    hoverBackground: lg2Color.grey.border // #d8d8d8 on hover
  },
  // LG2 tabs / sub-nav: active tab = red-orange bold mono label with a red-orange
  // bottom underline (the brand indicator), transparent fill.
  tabs: {
    activeText: lg2Color.redOrange, // #ff2300
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem", // 18px
    indicatorSide: "bottom", // red-orange underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline (not a box-shadow filet)
  },
  // LG2 pagination: borderless ink text links; active page = filled red-orange
  // box with white text (the brand fill), square corners.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: lg2Color.ink.primary, // #1a1a1a link text
    activeBackground: lg2Color.redOrange, // #ff2300 filled active page
    activeText: lg2Color.white, // white on red-orange
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // LG2 breadcrumb: ink links, grey trail, red-orange current page, grey
  // separators — all monospace type.
  breadcrumb: {
    linkText: lg2Color.ink.primary, // #1a1a1a
    text: lg2Color.ink.secondary, // #454545 trail text
    currentText: lg2Color.redOrange, // #ff2300 current page (brand accent)
    separator: lg2Color.ink.secondary, // #454545
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.125rem", // 18px
    currentWeight: "500" // current page is mildly emphasised
  },
  // LG2 notice / alert: a minimal box — a thin coloured left filet on a white
  // box, no fill. The severity accent is a slim left bar.
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0", // left border collapses (filet instead)
    filetWidth: "0.125rem", // 2px ::before accent bar (thin, minimal)
    paddingTop: "0.875rem", // 14px
    paddingRight: "1rem", // 16px
    paddingBottom: "0.875rem", // 14px
    paddingLeft: "1.125rem", // 18px (clears the left filet)
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // LG2 accordion / disclosure: an ink, plain-weight mono summary trigger, square
  // corners, hairline separated.
  accordion: {
    text: lg2Color.ink.primary, // #1a1a1a summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // rows are flush to the column
    fontSize: "0.875rem", // 14px
    fontWeight: "400", // regular weight mono
    lineHeight: "1.25rem" // 20px
  },
  // LG2 tag: a small soft-grey chip with SQUARE corners (brutalist).
  tag: {
    radius: "0", // square (brutalist — no rounding)
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "400",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: lg2Color.grey.subtle, // #f4f4f4 subtle fill
    neutralText: lg2Color.ink.primary // #1a1a1a
  },
  // LG2 badge: a small filled badge — red-orange fill / white text, uppercase,
  // SQUARE corners.
  badge: {
    radius: "0", // square (brutalist)
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    textTransform: "uppercase", // LG2 labels are often uppercase
    minHeight: "1.25rem", // 20px
    infoBackground: lg2Color.redOrange, // #ff2300 (LG2 "info" = the brand red-orange)
    infoText: lg2Color.white // white on red-orange
  },
  // LG2 checkbox/radio label: small ink mono.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: lg2Color.ink.primary // #1a1a1a
  },
  // LG2 search input: a boxed light hairline field, mono type, square corners.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // LG2 toggle / switch label: small ink mono.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: lg2Color.ink.primary // #1a1a1a
  }
} as const;

// --- semantic (LG2-specific role mapping) -----------------------------------
const semantic = {
  surface: {
    default: lg2Color.white, // #ffffff white
    subtle: lg2Color.grey.subtle, // #f4f4f4 subtle fill surface
    raised: lg2Color.white, // #ffffff white
    inverse: lg2Color.black, // #111111 black band inverse surface (theme-color #000)
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop — black @50%
  },
  text: {
    primary: lg2Color.ink.primary, // #1a1a1a (near-black body text)
    secondary: lg2Color.ink.secondary, // #454545 (measured)
    muted: lg2Color.ink.muted, // #a0a0a0 (measured)
    inverse: lg2Color.white, // white on black / dark surfaces
    link: lg2Color.link // #007aff measured link blue
  },
  border: {
    subtle: lg2Color.grey.border, // #d8d8d8 light hairline (field / divider)
    strong: lg2Color.ink.secondary, // #454545 stronger border
    interactive: lg2Color.redOrange // #ff2300 focus / interactive (brand accent)
  },
  action: {
    primary: lg2Color.redOrange, // #ff2300 primary button (the red-orange CTA)
    primaryHover: lg2Color.redOrangeHover, // #cc1c00 darker red-orange on hover
    primaryText: lg2Color.white, // white text on red-orange
    secondary: lg2Color.grey.subtle, // #f4f4f4 secondary surface
    secondaryHover: lg2Color.grey.border, // #d8d8d8
    secondaryText: lg2Color.ink.primary, // #1a1a1a
    danger: lg2Color.system.danger // #d32f2f
  },
  feedback: {
    success: lg2Color.system.success,
    warning: lg2Color.system.warning,
    error: lg2Color.system.danger,
    info: lg2Color.system.info
  },
  status: {
    pending: lg2Color.system.warning,
    processing: lg2Color.system.info,
    completed: lg2Color.system.success,
    failed: lg2Color.system.danger
  },
  // Categorical data-vis palette. LG2 publishes no data-vis scale; the identity
  // is the red-orange over a black/grey monochrome. category1 is the brand
  // red-orange, category2 the black band, then graded greys plus the restrained
  // system hues (see MAPPING.md, "à confirmer" — not an official scale).
  data: {
    category1: lg2Color.redOrange, // #ff2300 brand red-orange
    category2: lg2Color.black, // #111111 black band
    category3: lg2Color.ink.secondary, // #454545
    category4: lg2Color.ink.muted, // #a0a0a0
    category5: lg2Color.grey.border, // #d8d8d8
    category6: lg2Color.system.danger, // restrained red (à confirmer)
    category7: lg2Color.system.success, // restrained green (à confirmer)
    category8: lg2Color.system.warning // restrained amber (à confirmer)
  }
} as const;

/**
 * The LG2 theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry LG2-specific (brutalist monospace editorial)
 * values, and the `component` layer is REBUILT from this theme's own semantic/
 * foundation via `createComponent` — so LG2's red-orange-on-black/white monospace
 * identity reaches the components (buttons, tabs, pagination, chat bubbles…), not
 * just the elements that read semantic vars directly.
 */
export const lg2Theme: TenantTheme = {
  id: "lg2",
  label: "LG2",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default lg2Theme;
