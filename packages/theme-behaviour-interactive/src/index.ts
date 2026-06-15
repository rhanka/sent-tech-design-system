import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Behaviour Interactive (bhvr.com — the Montréal video-game studio behind
 * Dead by Daylight) theme for the Sentropic token structure.
 *
 * Behaviour Interactive publishes no design-token file; the values below are
 * MEASURED from the live site's computed CSS (https://www.bhvr.com, inspected in
 * a real browser). We only reference the font *names* here, never font binaries.
 * Sources and the full mapping table are in MAPPING.md. Behaviour's identity is a
 * BOLD GAMING system: a near-monochrome black-and-white shell punctuated by a
 * single, aggressive BLOOD RED accent (#cc0000 — measured on 13 elements, the
 * brand's signature horror/action hue). Surfaces are white, ink is pure black,
 * the inverse/dark shell tone is a near-black #161616, corners are nearly square
 * (radius 0–4px), and focus is a crisp red outline. The brand "colour" IS blood
 * red on black-and-white. Where Sentropic needs a role Behaviour never colours
 * (an accent blue, some feedback states), the closest measured value is used (or
 * a restrained system colour) and the choice is noted "à confirmer" in MAPPING.md.
 *
 * Behaviour Interactive colour reference (measured, light theme):
 *   Blood red (action / brand)         #cc0000   action.primary (13 els) — signature red
 *   Dark red (primary hover)           #700707   measured darker red on hover
 *   Black (text primary)               #000000   body color rgb(0,0,0) — ink
 *   Near-black (dark shell / inverse)  #161616   dark surface / footer / inverse
 *   Secondary text                     #4f4f4f   rgb(79,79,79) secondary ink
 *   Muted text                         #8c8c8c   rgb(140,140,140) muted ink
 *   White (surface default)            #ffffff   html background rgb(255,255,255)
 *   Subtle surface                     #f4f4f4   faint alt surface (à confirmer)
 *   Subtle border                      #d9d9d9   hairline divider (à confirmer)
 *   Overlay (modal backdrop)           black @50%
 */

// --- Behaviour Interactive raw colour palette (measured from live CSS) -------
const bhvrColor = {
  // The signature accent is BLOOD RED — used for primary actions, the brand
  // mark, and aggressive call-to-action emphasis (Dead by Daylight horror tone).
  red: "#cc0000", // action.primary rgb(204,0,0) — measured on 13 elements
  redHover: "#700707", // measured darker red on hover (rgb 112,7,7)
  // Near-monochrome black-and-white shell.
  black: "#000000", // body/html color rgb(0,0,0) — primary text / ink
  dark: "#161616", // near-black dark shell tone — inverse surface / footer
  white: "#ffffff", // html background rgb(255,255,255) — surface default
  // Monochrome grey scale (each value measured or à confirmer).
  grey: {
    100: "#f4f4f4", // faint alt surface (subtle) — à confirmer
    200: "#e6e6e6", // secondary action hover fill
    300: "#d9d9d9", // hairline divider (subtle border) — à confirmer
    500: "#8c8c8c", // rgb(140,140,140) — muted text
    700: "#4f4f4f" // rgb(79,79,79) — secondary text
  },
  // Restrained system colours for feedback. Behaviour is near-monochrome + red,
  // so success/warning/info have no strong measured equivalent and are kept
  // legible (WCAG AA) on white. Error reuses the brand blood red. (à confirmer.)
  system: {
    success: "#2e7d32", // measured/restrained green — à confirmer
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    error: "#cc0000", // brand blood red doubles as danger/error
    info: "#2f80ed" // restrained blue — à confirmer (Behaviour has no brand blue)
  }
} as const;

// --- foundation (Behaviour Interactive-specific values) ----------------------
const foundation = {
  color: {
    // Behaviour's accent is blood red, not blue. The Sentropic "blue" role family
    // (action / primary / link) is mapped onto the red + monochrome scale — the
    // Behaviour primary action IS blood red. (à confirmer: no brand blue exists.)
    blue: {
      10: bhvrColor.grey[100], // #f4f4f4 lightest neutral tint
      60: bhvrColor.red, // #cc0000 primary action (Behaviour blood red)
      80: bhvrColor.redHover // #700707 darker red step (hover)
    },
    // Behaviour has no cyan/accent beyond red. The Sentropic "cyan" accent slot is
    // mapped to the red + monochrome scale (no separate decorative accent). (à confirmer.)
    cyan: {
      10: bhvrColor.grey[100], // #f4f4f4 light neutral tint
      50: bhvrColor.red, // #cc0000 the only "accent" Behaviour has is red
      70: bhvrColor.redHover // #700707
    },
    // Sentropic "slate" role family mapped onto the Behaviour monochrome scale.
    slate: {
      0: bhvrColor.white, // #ffffff white
      10: bhvrColor.grey[100], // #f4f4f4 faint alt surface
      20: bhvrColor.grey[300], // #d9d9d9 hairline / subtle border
      60: bhvrColor.grey[500], // #8c8c8c muted text
      80: bhvrColor.grey[700], // #4f4f4f secondary text
      90: bhvrColor.black // #000000 primary text (terminal black)
    },
    feedback: {
      success: bhvrColor.system.success,
      warning: bhvrColor.system.warning,
      error: bhvrColor.system.error,
      info: bhvrColor.system.info
    }
  },
  // Behaviour's site font was not isolated; the live UI reads as a clean Inter-like
  // neo-grotesque. We reference the *name* only ("Inter" with a system fallback).
  // Mono is not part of Behaviour — the Sentropic mono stack is kept. (à confirmer.)
  font: {
    sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    display: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale; Behaviour's raw steps are not strongly tokenised
  // publicly, kept aligned with the Sentropic base 4px scale ("à confirmer").
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
  // Behaviour is NEARLY SQUARE — a hard-edged gaming aesthetic. Controls render a
  // tiny 2px radius, cards 4px, with no decorative rounding. (à confirmer exact steps.)
  radius: {
    none: "0", // hard square corners
    sm: "0", // small controls square
    md: "2px", // button / input / tabs — minimal hard edge
    lg: "4px", // cards — slight softening
    pill: "999px" // tags / pills (kept for completeness)
  },
  // Behaviour elevation is mostly flat — it relies on the bold red + black-on-white
  // contrast, not heavy shadows. Kept conservative ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.08)",
    medium: "0 4px 12px rgb(0 0 0 / 0.12)",
    floating: "0 8px 24px rgb(0 0 0 / 0.16)"
  },
  // Short, standard eases. Durations not fully tokenised publicly; aligned with base.
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "300ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Behaviour-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Behaviour Interactive) --------------------------
  // Behaviour borders are thin 1px hairlines on white surfaces.
  borderWidth: {
    none: "0",
    thin: "1px", // hairline divider
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Behaviour control density. A bold gaming shell with confident touch targets:
  // md targets a ~44px height with generous horizontal padding; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.8125rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.875rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "0.9375rem" }
  },
  // Behaviour typography = a clean Inter-like neo-grotesque. Action labels read as
  // confident UPPERCASE on the bold red CTAs; body/field text is sentence case.
  typography: {
    control: { family: "'Inter', system-ui, Helvetica, Arial, sans-serif", size: "0.875rem", weight: "600", lineHeight: "1.2", letterSpacing: "0.02em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Inter', system-ui, Helvetica, Arial, sans-serif", size: "0.875rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Inter', system-ui, Helvetica, Arial, sans-serif", size: "0.8125rem", weight: "500", lineHeight: "1.4", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Behaviour links are plain ink at rest; the hover affordance is an underline.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4",
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "180ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // Behaviour FOCUS = a crisp RED outline (the brand blood red). We encode the red
  // outline strategy (2px). (à confirmer — measured as the brand accent treatment.)
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: bhvrColor.red, // #cc0000 — Behaviour focuses in the brand blood red
    inset: "0"
  },
  // Behaviour form fields are BOXED (outline): a white fill with a thin hairline
  // border and a minimal 2px radius. `style: "outline"` makes the builder draw four
  // equal borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: bhvrColor.white, // #ffffff
    underlineColor: bhvrColor.grey[300], // #d9d9d9 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in ink with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23161616' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Behaviour cards: a thin hairline divider, slight 4px softening, faint hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: bhvrColor.grey[100] // #f4f4f4 faint hover tint
  },
  // Behaviour secondary button = a light neutral fill (#f4f4f4) with dark ink text,
  // the restrained alternative to the bold red filled primary.
  buttonSecondary: {
    background: bhvrColor.grey[100], // #f4f4f4 light neutral fill
    border: bhvrColor.grey[300], // #d9d9d9 hairline stroke
    hoverBackground: bhvrColor.grey[200] // #e6e6e6 fill on hover
  },
  // Behaviour tabs / sub-nav: active tab = bold ink label with a RED bottom
  // underline (the brand accent as the active indicator), transparent fill.
  tabs: {
    activeText: bhvrColor.black, // #000000
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.8125rem", // 13px
    lineHeight: "1rem", // 16px
    indicatorSide: "bottom", // red underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline (not a box-shadow filet)
  },
  // Behaviour pagination: borderless ink text links; active page = filled RED
  // square with white text (the brand accent fill).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: bhvrColor.black, // #000000 link text
    activeBackground: bhvrColor.red, // #cc0000 filled active page (brand red)
    activeText: bhvrColor.white, // white on red
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.8125rem", // 13px
    lineHeight: "1rem" // 16px
  },
  // Behaviour breadcrumb: ink links, grey trail, ink current page, grey separators.
  breadcrumb: {
    linkText: bhvrColor.black, // #000000
    text: bhvrColor.grey[500], // #8c8c8c trail text
    currentText: bhvrColor.black, // #000000 current page
    separator: bhvrColor.grey[500], // #8c8c8c
    fontSize: "0.75rem", // 12px
    lineHeight: "1rem", // 16px
    currentWeight: "600" // current page is emphasised
  },
  // Behaviour notice / alert: a minimal box with a coloured left filet accent.
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0", // left border collapses (filet instead)
    filetWidth: "0.1875rem", // 3px ::before accent bar
    paddingTop: "0.875rem", // 14px
    paddingRight: "1rem", // 16px
    paddingBottom: "0.875rem", // 14px
    paddingLeft: "1.125rem", // 18px (clears the left filet)
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.25rem" // 20px
  },
  // Behaviour accordion / disclosure: a bold ink summary trigger, hairline separated.
  accordion: {
    text: bhvrColor.black, // #000000 summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0",
    fontSize: "0.8125rem", // 13px
    fontWeight: "600", // Behaviour summary reads bold (gaming confidence)
    lineHeight: "1.25rem" // 20px
  },
  // Behaviour tag: a small near-square grey chip (2px radius, hard-edged).
  tag: {
    radius: "2px", // hard-edged, minimally softened
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.6875rem", // 11px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: bhvrColor.grey[100], // #f4f4f4 subtle fill
    neutralText: bhvrColor.black // #000000
  },
  // Behaviour badge: a near-square filled badge — RED fill / white text (the brand
  // emphasis), uppercase, small.
  badge: {
    radius: "2px", // hard-edged
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "uppercase",
    minHeight: "1.25rem", // 20px
    infoBackground: bhvrColor.red, // #cc0000 (Behaviour emphasis = brand red)
    infoText: bhvrColor.white // white on red
  },
  // Behaviour checkbox/radio label: small ink grotesque.
  choice: {
    labelFontSize: "0.8125rem", // 13px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: bhvrColor.black // #000000
  },
  // Behaviour search input: a near-square hairline box, small type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.25rem" // 20px
  },
  // Behaviour toggle / switch label: small ink text.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: bhvrColor.black // #000000
  }
} as const;

// --- semantic (Behaviour Interactive-specific role mapping) ------------------
const semantic = {
  surface: {
    default: bhvrColor.white, // #ffffff white
    subtle: bhvrColor.grey[100], // #f4f4f4 faint alt surface (à confirmer)
    raised: bhvrColor.white, // #ffffff white
    inverse: bhvrColor.dark, // #161616 near-black dark shell (footer/inverse tone)
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop — black @50%
  },
  text: {
    primary: bhvrColor.black, // #000000 (measured body color rgb 0,0,0)
    secondary: bhvrColor.grey[700], // #4f4f4f (rgb 79 secondary text)
    muted: bhvrColor.grey[500], // #8c8c8c (rgb 140 muted text)
    inverse: bhvrColor.white, // white on dark surfaces
    link: bhvrColor.red // #cc0000 — Behaviour links read in the brand blood red
  },
  border: {
    subtle: bhvrColor.grey[300], // #d9d9d9 hairline divider (à confirmer)
    strong: bhvrColor.grey[500], // #8c8c8c stronger divider
    interactive: bhvrColor.red // #cc0000 focus / interactive (brand red)
  },
  action: {
    primary: bhvrColor.red, // #cc0000 primary button (the bold blood-red CTA)
    primaryHover: bhvrColor.redHover, // #700707 measured darker red on hover
    primaryText: bhvrColor.white, // white text on red
    secondary: bhvrColor.grey[100], // #f4f4f4 secondary surface
    secondaryHover: bhvrColor.grey[200], // #e6e6e6
    secondaryText: bhvrColor.dark, // #161616 dark ink on the light secondary
    danger: bhvrColor.red // #cc0000 (Behaviour danger = brand blood red)
  },
  feedback: {
    success: bhvrColor.system.success,
    warning: bhvrColor.system.warning,
    error: bhvrColor.system.error,
    info: bhvrColor.system.info
  },
  status: {
    pending: bhvrColor.system.warning,
    processing: bhvrColor.system.info,
    completed: bhvrColor.system.success,
    failed: bhvrColor.system.error
  },
  // Categorical data-vis palette. Behaviour publishes no data-vis scale; this is a
  // coherent proposal led by the brand blood red, a black→grey ramp, plus the
  // restrained system hues (see MAPPING.md, "à confirmer" — not an official scale).
  data: {
    category1: bhvrColor.red, // #cc0000 brand red leads
    category2: bhvrColor.black, // #000000
    category3: bhvrColor.grey[700], // #4f4f4f
    category4: bhvrColor.grey[500], // #8c8c8c
    category5: bhvrColor.grey[300], // #d9d9d9
    category6: bhvrColor.system.info, // restrained blue (à confirmer)
    category7: bhvrColor.system.success, // restrained green (à confirmer)
    category8: bhvrColor.system.warning // restrained amber (à confirmer)
  }
} as const;

/**
 * The Behaviour Interactive theme as a Sentropic `TenantTheme`. The `tokens` tree
 * is complete: `foundation` and `semantic` carry Behaviour-specific (bold blood-red
 * on black-and-white) values, and the `component` layer is REBUILT from this
 * theme's own semantic/foundation via `createComponent` — so Behaviour's identity
 * reaches the components (buttons, tabs, pagination, chat bubbles…), not just the
 * elements that read semantic vars directly.
 */
export const behaviourInteractiveTheme: TenantTheme = {
  id: "behaviour-interactive",
  label: "Behaviour Interactive",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default behaviourInteractiveTheme;
