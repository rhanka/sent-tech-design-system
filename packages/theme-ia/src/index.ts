import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * iA Financial Group (ia.ca — iA Groupe financier, the Québec City insurance &
 * wealth-management group) theme for the Sentropic token structure.
 *
 * iA publishes no public design-token file; the values below are MEASURED from
 * the live site's computed CSS (https://ia.ca, inspected in a real browser).
 * We only reference the font *names* here ("Verdana, Arial, Helvetica,
 * sans-serif" — Verdana is the measured web-safe system face iA uses across its
 * corporate UI), never font binaries. Sources and the full mapping table are in
 * MAPPING.md.
 *
 * iA's identity is a STRONG CORPORATE system: a confident iA blue CTA, a red
 * accent for emphasis/feedback, a gold highlight, soft near-white blue-tinted
 * greys for structure, and a square/lightly-rounded corporate radius. The brand
 * "colour" is the blue (#064dd9); the red (#cc0000) is the secondary accent and
 * doubles as the danger/system hue; the gold (#f5de32) is a highlight. Where
 * Sentropic needs a role iA never colours explicitly (success/warning/info
 * feedback, exact spacing/elevation steps), the closest restrained value is
 * used and the choice is noted "à confirmer" in MAPPING.md.
 *
 * iA colour reference (measured, light theme):
 *   iA blue (action / CTA / inverse band) #064dd9   measured primary CTA (40 occ.)
 *   iA blue hover                          #0540b0   darker CTA hover
 *   iA red (accent / danger)               #cc0000   measured red accent
 *   Gold highlight                         #f5de32   measured gold highlight
 *   White (surface default)                #ffffff   page background
 *   Ink — primary text                     #1a1a1a   near-black body text
 *   Secondary text                         #555555   measured secondary text
 *   Muted text                             #8c8c87   measured muted text
 *   Subtle fill surface                    #f3f5fb   measured pale blue-grey fill
 *   Subtle / field border                  #d4dcf2   measured pale blue hairline
 */

// --- iA raw colour palette (measured from live computed CSS) ----------------
const iaColor = {
  // The emphasis / CTA "brand" is the strong iA blue. iA uses it for the primary
  // call-to-action, the inverse band and interactive accents (measured, the most
  // frequent brand value on the site — 40 occurrences).
  blue: {
    base: "#064dd9", // primary CTA / brand blue / inverse band (measured)
    hover: "#0540b0" // darker CTA hover (measured)
  },
  white: "#ffffff", // page background — surface default
  // The iA red accent — a strong, saturated red used for emphasis and feedback.
  // It doubles as the danger / error / system-danger hue.
  red: "#cc0000", // red accent / danger / error (measured)
  // The iA gold highlight — a bright warm yellow used for highlights/markers.
  gold: "#f5de32", // gold highlight (measured)
  // Soft ink scale (each value measured from a real element).
  ink: {
    primary: "#1a1a1a", // near-black body text colour (measured)
    secondary: "#555555", // secondary text (measured)
    muted: "#8c8c87" // muted text (measured)
  },
  // Neutral surface / line greys — note iA's are subtly blue-tinted.
  grey: {
    subtle: "#f3f5fb", // pale blue-grey subtle fill surface (measured)
    border: "#d4dcf2" // pale blue hairline / field border (measured)
  },
  // iA colours feedback states sparingly. The danger red is the measured red
  // accent (#cc0000); success/warning/info have no measured iA equivalent, so
  // they are restrained, legible (WCAG AA on white) system colours chosen to sit
  // quietly with the corporate blue identity — flagged "à confirmer".
  system: {
    danger: "#cc0000", // iA red — error / danger accent (measured)
    success: "#2e7d32", // muted green — à confirmer (no iA source)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#064dd9" // iA would use its blue for info, not a separate hue — à confirmer
  }
} as const;

// --- foundation (iA-specific values) ----------------------------------------
const foundation = {
  color: {
    // iA's brand IS a blue. The Sentropic "blue" role family (action / primary /
    // link) maps directly onto the measured iA blue scale.
    blue: {
      10: iaColor.grey.subtle, // #f3f5fb lightest blue-grey tint
      60: iaColor.blue.base, // #064dd9 primary action (iA blue CTA)
      80: iaColor.blue.hover // #0540b0 darker hover step
    },
    // iA's secondary accent is the red. The Sentropic "cyan" accent slot is
    // mapped onto the iA red accent (iA's true "accent" is red, not cyan).
    cyan: {
      10: iaColor.grey.subtle, // #f3f5fb light neutral tint
      50: iaColor.red, // #cc0000 the iA accent is red
      70: iaColor.red // #cc0000 (no darker measured red step)
    },
    // Sentropic "slate" role family mapped onto the iA ink/grey scale.
    slate: {
      0: iaColor.white, // #ffffff white
      10: iaColor.grey.subtle, // #f3f5fb subtle fill surface
      20: iaColor.grey.border, // #d4dcf2 hairline / subtle border
      60: iaColor.ink.secondary, // #555555 secondary text
      80: iaColor.ink.primary, // #1a1a1a primary text (near-black)
      90: iaColor.ink.primary // #1a1a1a darkest (iA body ink is terminal)
    },
    feedback: {
      success: iaColor.system.success,
      warning: iaColor.system.warning,
      error: iaColor.system.danger,
      info: iaColor.system.info
    }
  },
  // iA sets its corporate UI in VERDANA — measured "Verdana, Arial, Helvetica,
  // sans-serif" across headings and body, the web-safe system face giving the
  // legible institutional tone. We reference the *names* only. Mono is not part
  // of iA — the Sentropic mono stack (as used by Simons) is kept.
  font: {
    sans: "Verdana, Arial, Helvetica, sans-serif",
    display: "Verdana, Arial, Helvetica, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. iA's grid is whitespace-generous but its raw
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
  // iA uses a CORPORATE radius — controls/inputs are essentially square (0),
  // buttons a gentle 4px, cards a soft 8px; pills fully rounded. (Exact steps à
  // confirmer; pill kept at 999px for completeness.)
  radius: {
    none: "0", // square slot
    sm: "0", // smallest controls — square
    md: "4px", // button / input / tabs — gentle 4px (measured)
    lg: "8px", // cards — soft 8px (measured)
    pill: "999px" // tags / pills
  },
  // iA elevation is restrained corporate — soft, low shadows on raised elements,
  // relying mostly on the blue-tinted hairlines and whitespace. Kept conservative
  // ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.14)"
  },
  // iA animates with short, standard eases (measured ≈ 150ms transitions).
  // Durations not fully tokenised publicly; kept aligned with the base.
  motion: {
    fast: "120ms",
    normal: "150ms", // measured button transition duration
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not iA-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (iA) ---------------------------------------------
  // iA borders are thin pale-blue hairlines (#d4dcf2 @1px). Encoded as 1px thin /
  // 2px thick.
  borderWidth: {
    none: "0",
    thin: "1px", // iA hairline (#d4dcf2)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // iA control density. Measured CTA buttons sit ~44px tall with generous
  // horizontal padding; nav/body text is mid-sized Verdana. md targets a ~44px
  // touch height; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // iA typography = the corporate Verdana. Control labels are mid-weight; body/
  // field text is sentence case. (Verdana is wide; letter-spacing kept tight.)
  typography: {
    control: { family: "Verdana, Arial, Helvetica, sans-serif", size: "0.9375rem", weight: "700", lineHeight: "1.2", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "Verdana, Arial, Helvetica, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "Verdana, Arial, Helvetica, sans-serif", size: "0.875rem", weight: "700", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // iA links are blue at rest; the hover affordance is an underline.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // iA dims disabled controls
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // iA FOCUS = a crisp blue OUTLINE (~2px solid #064dd9). We encode the blue
  // outline strategy (focus.color = the iA blue).
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: iaColor.blue.base, // #064dd9 — iA focuses in its brand blue
    inset: "0"
  },
  // iA form fields are BOXED (outline): a white fill with a thin pale-blue
  // hairline border and a gentle 4px radius. `style: "outline"` makes the builder
  // draw four equal borders from `surface.default` + `border.subtle`. Measured
  // input/select border = #d4dcf2 @1px hairline.
  field: {
    style: "outline",
    fillBg: iaColor.white, // #ffffff
    underlineColor: iaColor.grey.border, // #d4dcf2 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the iA blue with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23064dd9' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // iA cards: gentle 8px rounding, a thin pale-blue hairline rather than a heavy
  // box, with a faint blue-grey hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: iaColor.grey.subtle // #f3f5fb faint blue-grey hover tint
  },
  // iA secondary button = a soft blue-grey filled chip (light #f3f5fb fill, ink
  // text, slightly darker pale-blue on hover) — the quiet alternative to the
  // filled blue primary.
  buttonSecondary: {
    background: iaColor.grey.subtle, // #f3f5fb soft fill
    border: iaColor.grey.border, // #d4dcf2 pale hairline
    hoverBackground: iaColor.grey.border // #d4dcf2 on hover
  },
  // iA tabs / sub-nav: active tab = blue bold label with a blue bottom underline
  // (the indicator), transparent fill.
  tabs: {
    activeText: iaColor.blue.base, // #064dd9
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem", // 18px
    indicatorSide: "bottom", // blue underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline (not a box-shadow filet)
  },
  // iA pagination: borderless ink text links; active page = filled blue box with
  // white text (the brand fill).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: iaColor.ink.primary, // #1a1a1a link text
    activeBackground: iaColor.blue.base, // #064dd9 filled active page
    activeText: iaColor.white, // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // iA breadcrumb: ink links, grey trail, blue current page, grey separators —
  // all Verdana type.
  breadcrumb: {
    linkText: iaColor.ink.primary, // #1a1a1a
    text: iaColor.ink.secondary, // #555555 trail text
    currentText: iaColor.blue.base, // #064dd9 current page (blue active)
    separator: iaColor.ink.secondary, // #555555
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.125rem", // 18px
    currentWeight: "700" // current page is emphasised
  },
  // iA notice / alert: a minimal box — a thin coloured left filet on a white box,
  // no fill. The severity accent is a slim left bar.
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
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // iA accordion / disclosure: an ink, bold-weight Verdana summary trigger,
  // gentle rounding, hairline separated.
  accordion: {
    text: iaColor.ink.primary, // #1a1a1a summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // rows are flush to the column
    fontSize: "0.875rem", // 14px
    fontWeight: "700", // bold Verdana
    lineHeight: "1.25rem" // 20px
  },
  // iA tag: a small soft blue-grey chip with gentle rounding.
  tag: {
    radius: "4px", // gentle rounding (matches md)
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "400",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: iaColor.grey.subtle, // #f3f5fb subtle fill
    neutralText: iaColor.ink.primary // #1a1a1a
  },
  // iA badge: a small filled badge — blue fill / white text, gentle 4px rounding.
  badge: {
    radius: "4px", // gentle rounding
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "700",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: iaColor.blue.base, // #064dd9 (iA "info" = the brand blue)
    infoText: iaColor.white // white on blue
  },
  // iA checkbox/radio label: small ink Verdana.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: iaColor.ink.primary // #1a1a1a
  },
  // iA search input: a boxed pale-blue hairline field, Verdana type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // iA toggle / switch label: small ink Verdana.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: iaColor.ink.primary // #1a1a1a
  }
} as const;

// --- semantic (iA-specific role mapping) ------------------------------------
const semantic = {
  surface: {
    default: iaColor.white, // #ffffff white
    subtle: iaColor.grey.subtle, // #f3f5fb pale blue-grey subtle fill surface
    raised: iaColor.white, // #ffffff white
    inverse: iaColor.blue.base, // #064dd9 iA blue inverse band/surface
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop — black @50%
  },
  text: {
    primary: iaColor.ink.primary, // #1a1a1a (measured near-black body text)
    secondary: iaColor.ink.secondary, // #555555 (measured)
    muted: iaColor.ink.muted, // #8c8c87 (measured)
    inverse: iaColor.white, // white on blue / dark surfaces
    link: iaColor.blue.base // #064dd9 — iA links are blue
  },
  border: {
    subtle: iaColor.grey.border, // #d4dcf2 pale blue hairline (field / divider)
    strong: iaColor.ink.secondary, // #555555 stronger border
    interactive: iaColor.blue.base // #064dd9 focus / interactive
  },
  action: {
    primary: iaColor.blue.base, // #064dd9 primary button (the iA blue CTA)
    primaryHover: iaColor.blue.hover, // #0540b0 darker blue on hover (measured)
    primaryText: iaColor.white, // white text on blue
    secondary: iaColor.grey.subtle, // #f3f5fb secondary surface
    secondaryHover: iaColor.grey.border, // #d4dcf2
    secondaryText: iaColor.ink.primary, // #1a1a1a
    danger: iaColor.system.danger // #cc0000 iA red
  },
  feedback: {
    success: iaColor.system.success,
    warning: iaColor.system.warning,
    error: iaColor.system.danger,
    info: iaColor.system.info
  },
  status: {
    pending: iaColor.system.warning,
    processing: iaColor.system.info,
    completed: iaColor.system.success,
    failed: iaColor.system.danger
  },
  // Categorical data-vis palette. iA publishes no data-vis scale; this is a
  // coherent proposal led by the three measured brand colours (blue / red /
  // gold) then graded greys and the restrained system hues, drawn to honour the
  // corporate identity (see MAPPING.md, "à confirmer" — not an official scale).
  data: {
    category1: iaColor.blue.base, // #064dd9 iA blue
    category2: iaColor.red, // #cc0000 iA red
    category3: iaColor.gold, // #f5de32 iA gold highlight
    category4: iaColor.ink.secondary, // #555555
    category5: iaColor.grey.border, // #d4dcf2
    category6: iaColor.system.success, // restrained green (à confirmer)
    category7: iaColor.system.warning, // restrained amber (à confirmer)
    category8: iaColor.ink.muted // #8c8c87 (à confirmer)
  }
} as const;

/**
 * The iA theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry iA-specific (corporate blue/red/gold
 * Verdana) values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so iA's blue-CTA-on-white identity
 * reaches the components (buttons, tabs, pagination, chat bubbles…), not just
 * the elements that read semantic vars directly.
 */
export const iaTheme: TenantTheme = {
  id: "ia",
  label: "iA Groupe financier",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default iaTheme;
