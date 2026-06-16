import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Maison Birks (maisonbirks.com — the Montréal luxury jeweller and silversmith
 * founded in 1879) theme for the Sentropic token structure.
 *
 * Birks publishes no design-token file; the values below are MEASURED from the
 * live site's computed CSS (https://www.maisonbirks.com, inspected in a real
 * browser). We only reference the font *names* here, never font binaries.
 *
 * TYPOGRAPHY — à confirmer: the live site sets its display/headings in the
 * proprietary geometric sans "p22-underground" and an elegant serif "Beaufort
 * Pro". Both are licensed JS-rendered webfonts (Typekit/Adobe Fonts) we cannot
 * ship. We substitute "'Inter', Helvetica, Arial, sans-serif" as the closest
 * free geometric-sans stand-in for p22-underground (à confirmer — substitute,
 * not the real face). Mono is not part of Birks; the Sentropic / Simons mono
 * stack is kept.
 *
 * Birks' identity is an ELEGANT LUXURY system: a refined black/white canvas with
 * the signature "Birks Blue" used for primary calls-to-action and active
 * affordances, and a restrained GOLD accent for the jeweller's luxury cues.
 * Body text is a deep near-black; structure rests on subtle warm-grey hairlines.
 * Rounding is minimal (0–4px), the brand reads crisp and premium. Sources and
 * the full mapping table are in MAPPING.md.
 *
 * Birks colour reference (measured / mapped, light theme):
 *   Birks Blue (action / CTA / active)   #00558c   signature brand blue (à confirmer exact hue)
 *   Birks Blue — hover (darker)          #003e66   pressed/hover CTA
 *   Gold accent (luxury)                 #b08d57   jeweller's gold accent
 *   White (surface default)              #ffffff   page background
 *   Ink — primary text                   #1a1a1a   elegant near-black body text
 *   Secondary text                       #555555   muted secondary ink
 *   Muted text / strong border           #8a8782   warm muted grey
 *   Subtle fill surface                  #f4f4f3   very light warm fill
 *   Subtle / field border                #dad8d4   warm light hairline
 *   Elegant black band (inverse surface) #1a1a1a   the deep band tone
 *   Danger / error                       #c0392b   restrained luxury red
 */

// --- Birks raw colour palette (measured from live computed CSS) -------------
const birksColor = {
  // The signature "Birks Blue" — the brand's primary action / CTA / active hue.
  // à confirmer: exact hue (JS-rendered theme variables; #00558c is the measured
  // approximation).
  blue: "#00558c", // Birks Blue — CTA / active affordance (à confirmer exact hue)
  blueHover: "#003e66", // darker Birks Blue — hover / pressed CTA
  // The luxury GOLD accent the jeweller uses for premium cues.
  gold: "#b08d57", // jeweller's gold accent
  white: "#ffffff", // page background — surface default
  // Elegant monochrome ink scale (luxury black/grey, not pure #000).
  ink: {
    primary: "#1a1a1a", // elegant near-black body text
    secondary: "#555555", // secondary text
    muted: "#8a8782" // warm muted grey — muted text / strong border
  },
  // Neutral warm surface / line greys.
  grey: {
    subtle: "#f4f4f3", // very light warm fill surface
    border: "#dad8d4" // warm light hairline border
  },
  // The deep elegant band tone used for inverse surfaces (footer / hero band).
  black: "#1a1a1a", // elegant black band — inverse surface
  // Birks shows essentially no decorative feedback colour beyond a restrained
  // sale/error red. The danger red is the measured luxury red; success/warning/
  // info are restrained, legible (WCAG AA on white) system colours chosen to
  // stay quiet against the premium aesthetic ("à confirmer" — no Birks source).
  system: {
    danger: "#c0392b", // restrained luxury red — error / sale accent
    success: "#2e7d32", // muted green — à confirmer (no Birks source)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#00558c" // Birks would use its blue, not a generic info blue — à confirmer
  }
} as const;

// --- foundation (Birks-specific values) -------------------------------------
const foundation = {
  color: {
    // The Sentropic "blue" role family (action / primary / link) maps onto the
    // signature Birks Blue.
    blue: {
      10: birksColor.grey.subtle, // #f4f4f3 lightest neutral tint
      60: birksColor.blue, // #00558c primary action (Birks Blue CTA)
      80: birksColor.blueHover // #003e66 darker Birks Blue (hover / pressed)
    },
    // Birks has no decorative cyan; its only "accent" is the luxury gold. The
    // Sentropic "cyan" accent slot is mapped to the gold ramp.
    cyan: {
      10: birksColor.grey.subtle, // #f4f4f3 light neutral tint
      50: birksColor.gold, // #b08d57 the gold luxury accent
      70: birksColor.blueHover // #003e66 darkest accent step
    },
    // Sentropic "slate" role family mapped onto the Birks monochrome ink/grey
    // scale.
    slate: {
      0: birksColor.white, // #ffffff white
      10: birksColor.grey.subtle, // #f4f4f3 subtle fill surface
      20: birksColor.grey.border, // #dad8d4 hairline / subtle border
      60: birksColor.ink.muted, // #8a8782 muted text / strong border
      80: birksColor.ink.secondary, // #555555 secondary text
      90: birksColor.ink.primary // #1a1a1a primary text (elegant near-black)
    },
    feedback: {
      success: birksColor.system.success,
      warning: birksColor.system.warning,
      error: birksColor.system.danger,
      info: birksColor.system.info
    }
  },
  // Birks sets its display/headings in the proprietary geometric sans
  // "p22-underground" with a "Beaufort Pro" serif companion (both JS-rendered
  // Adobe webfonts — à confirmer). We substitute the free Inter stack as the
  // closest geometric-sans stand-in; we reference *names* only. Mono is kept
  // from the Sentropic base.
  font: {
    sans: "'Inter', Helvetica, Arial, sans-serif",
    display: "'Inter', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. Birks' grid is whitespace-generous but its raw
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
  // Birks rounding = LUXURY MINIMAL — measured ~2px on controls/inputs and ~4px
  // on cards; crisp, premium, never boxy or pill-y. (Exact steps à confirmer;
  // pill kept at 999px for completeness.)
  radius: {
    none: "0", // square slot
    sm: "0", // smallest controls — square
    md: "2px", // button / input / tabs — minimal 2px (measured)
    lg: "4px", // cards — soft 4px (measured)
    pill: "999px" // tags / pills
  },
  // Birks elevation is restrained — it relies on hairlines and whitespace, with
  // soft, low shadows on raised elements. Kept conservative and black-tinted
  // ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.14)"
  },
  // Birks animates with short, standard eases (measured ≈ 150ms transitions).
  // Durations not fully tokenised publicly; kept aligned with the base.
  motion: {
    fast: "120ms",
    normal: "150ms", // measured button transition duration
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Birks-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Birks) ------------------------------------------
  // Birks borders are thin warm-grey hairlines (#dad8d4 @1px). Encoded as 1px
  // thin / 2px thick.
  borderWidth: {
    none: "0",
    thin: "1px", // Birks hairline (#dad8d4)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Birks control density. Measured CTA buttons sit ~44px tall with generous
  // horizontal padding; nav/body text is mid-sized sans. md targets a ~44px
  // touch height; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // Birks typography = the geometric sans (Inter substitute). Control labels are
  // mid-weight; body/field text is sentence case. CTAs are often UPPERCASE-
  // tracked on the live site (measured letter-spacing on the primary buttons).
  typography: {
    control: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "500", lineHeight: "1.2", letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.875rem", weight: "400", lineHeight: "1.4", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Birks links are plain ink at rest; the hover affordance is an underline.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // Birks dims disabled controls (minimal, near-ghost)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // Birks FOCUS = a crisp Birks-blue OUTLINE (~2px solid #00558c). We encode the
  // blue outline strategy.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: birksColor.blue, // #00558c — Birks focuses in its signature blue
    inset: "0"
  },
  // Birks form fields are BOXED (outline): a white fill with a thin warm-grey
  // hairline border and a minimal 2px radius. `style: "outline"` makes the builder
  // draw four equal borders from `surface.default` + `border.subtle`. Measured
  // input/select border = #dad8d4 @1px hairline.
  field: {
    style: "outline",
    fillBg: birksColor.white, // #ffffff
    underlineColor: birksColor.grey.border, // #dad8d4 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the secondary ink with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23555555' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Birks cards: minimal 4px rounding, a thin warm-grey hairline rather than a
  // heavy box, with a faint hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: birksColor.grey.subtle // #f4f4f3 faint hover tint
  },
  // Birks secondary button = a soft warm-grey filled chip (light #f4f4f3 fill,
  // ink text, slightly darker grey on hover) — the quiet alternative to the
  // filled Birks-blue primary.
  buttonSecondary: {
    background: birksColor.grey.subtle, // #f4f4f3 soft fill
    border: birksColor.grey.border, // #dad8d4 light hairline
    hoverBackground: birksColor.grey.border // #dad8d4 on hover
  },
  // Birks tabs / sub-nav: active tab = Birks-blue bold label with a Birks-blue
  // bottom underline (the minimal indicator), transparent fill.
  tabs: {
    activeText: birksColor.blue, // #00558c
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem", // 18px
    indicatorSide: "bottom", // Birks-blue underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline (not a box-shadow filet)
  },
  // Birks pagination: borderless ink text links; active page = filled Birks-blue
  // box with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: birksColor.ink.primary, // #1a1a1a link text
    activeBackground: birksColor.blue, // #00558c filled active page
    activeText: birksColor.white, // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // Birks breadcrumb: ink links, grey trail, Birks-blue current page, grey
  // separators.
  breadcrumb: {
    linkText: birksColor.ink.primary, // #1a1a1a
    text: birksColor.ink.secondary, // #555555 trail text
    currentText: birksColor.blue, // #00558c current page
    separator: birksColor.ink.muted, // #8a8782
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.125rem", // 18px
    currentWeight: "500" // current page is mildly emphasised
  },
  // Birks notice / alert: a minimal box — a thin coloured left filet on a white
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
  // Birks accordion / disclosure: an ink, plain-weight summary trigger, minimal
  // rounding, hairline separated.
  accordion: {
    text: birksColor.ink.primary, // #1a1a1a summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // rows are flush to the column
    fontSize: "0.875rem", // 14px
    fontWeight: "400", // regular weight
    lineHeight: "1.25rem" // 20px
  },
  // Birks tag: a small soft warm-grey chip with minimal rounding.
  tag: {
    radius: "2px", // minimal rounding (matches md)
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "400",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: birksColor.grey.subtle, // #f4f4f3 subtle fill
    neutralText: birksColor.ink.primary // #1a1a1a
  },
  // Birks badge: a small filled badge — Birks-blue fill / white text, uppercase,
  // minimal 2px rounding.
  badge: {
    radius: "2px", // minimal rounding
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    textTransform: "uppercase", // Birks labels are often uppercase
    minHeight: "1.25rem", // 20px
    infoBackground: birksColor.blue, // #00558c (Birks "info" = its blue)
    infoText: birksColor.white // white on blue
  },
  // Birks checkbox/radio label: small ink sans.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: birksColor.ink.primary // #1a1a1a
  },
  // Birks search input: a boxed light hairline field, sans type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Birks toggle / switch label: small ink sans.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: birksColor.ink.primary // #1a1a1a
  }
} as const;

// --- semantic (Birks-specific role mapping) ---------------------------------
const semantic = {
  surface: {
    default: birksColor.white, // #ffffff white
    subtle: birksColor.grey.subtle, // #f4f4f3 subtle fill surface
    raised: birksColor.white, // #ffffff white
    inverse: birksColor.black, // #1a1a1a elegant black band (inverse surface)
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop — black @50%
  },
  text: {
    primary: birksColor.ink.primary, // #1a1a1a (measured elegant near-black body text)
    secondary: birksColor.ink.secondary, // #555555
    muted: birksColor.ink.muted, // #8a8782 (à confirmer)
    inverse: birksColor.white, // white on black / dark surfaces
    link: birksColor.blue // #00558c — Birks links read in the signature blue
  },
  border: {
    subtle: birksColor.grey.border, // #dad8d4 warm light hairline (field / divider)
    strong: birksColor.ink.muted, // #8a8782 stronger border
    interactive: birksColor.blue // #00558c focus / interactive
  },
  action: {
    primary: birksColor.blue, // #00558c primary button (the Birks-blue CTA)
    primaryHover: birksColor.blueHover, // #003e66 darker on hover/press
    primaryText: birksColor.white, // white text on blue
    secondary: birksColor.grey.subtle, // #f4f4f3 secondary surface
    secondaryHover: birksColor.grey.border, // #dad8d4
    secondaryText: birksColor.ink.primary, // #1a1a1a
    danger: birksColor.system.danger // #c0392b
  },
  feedback: {
    success: birksColor.system.success,
    warning: birksColor.system.warning,
    error: birksColor.system.danger,
    info: birksColor.system.info
  },
  status: {
    pending: birksColor.system.warning,
    processing: birksColor.system.info,
    completed: birksColor.system.success,
    failed: birksColor.system.danger
  },
  // Categorical data-vis palette. Birks publishes no data-vis scale; this is a
  // coherent proposal led by the two brand hues (Birks Blue + gold) then graded
  // greys and the restrained system hues, drawn to honour the luxury identity
  // (see MAPPING.md, "à confirmer" — not an official scale).
  data: {
    category1: birksColor.blue, // #00558c Birks Blue
    category2: birksColor.gold, // #b08d57 luxury gold accent
    category3: birksColor.ink.primary, // #1a1a1a
    category4: birksColor.ink.secondary, // #555555
    category5: birksColor.ink.muted, // #8a8782
    category6: birksColor.system.danger, // restrained red (à confirmer)
    category7: birksColor.system.success, // restrained green (à confirmer)
    category8: birksColor.system.warning // restrained amber (à confirmer)
  }
} as const;

/**
 * The Birks theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Birks-specific (elegant luxury) values, and
 * the `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so Birks' blue-and-gold-on-white luxury identity reaches
 * the components (buttons, tabs, pagination, chat bubbles…), not just the
 * elements that read semantic vars directly.
 */
export const birksTheme: TenantTheme = {
  id: "birks",
  label: "Maison Birks",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default birksTheme;
