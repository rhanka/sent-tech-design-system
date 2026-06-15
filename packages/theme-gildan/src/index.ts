import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Gildan (gildan.com — Gildan Activewear, the Montréal-headquartered global
 * apparel manufacturer) theme for the Sentropic token structure.
 *
 * Gildan publishes no public design-token file; the values below are MEASURED
 * from the live corporate site's computed CSS (https://www.gildan.com, inspected
 * in a real browser) and otherwise inferred from the brand mark. We only
 * reference the font *names* here, never font binaries. Sources and the full
 * mapping table are in MAPPING.md.
 *
 * Gildan's identity is a CORPORATE near-black/charcoal system: an editorial
 * charcoal-ink-on-white look (measured body ink #313131, a soft charcoal rather
 * than pure black), a strong ROYAL-BLUE primary action drawn from the brand mark
 * (#003087, à confirmer — the exact hue is inferred), a deep navy inverse band
 * (#00205a), thin light-grey hairlines, gentle corporate rounding (4px controls /
 * 8px cards), and a blue focus outline. The measured type stack reads system-ui;
 * we substitute the closest documentary face, Inter (à confirmer), keeping the
 * inherited Sentropic monospace stack.
 *
 * Gildan colour reference (measured / inferred, light theme):
 *   Royal blue (action / CTA)          #003087   brand-mark blue CTA (à confirmer)
 *   Royal blue hover                   #00205a   darker navy press state
 *   White (surface default)            #ffffff   page background
 *   Ink — primary text                 #313131   measured charcoal body ink
 *   Secondary text                     #5e5e5e   secondary text
 *   Muted text                         #8a8a8a   muted text
 *   Deep navy (inverse band)           #00205a   inverse surface / footer band
 *   Subtle fill surface                #f4f4f4   light fill
 *   Subtle / field border              #d8d8d8   light hairline
 *   Danger / error                     #c0392b   error / destructive accent
 */

// --- Gildan raw colour palette (measured from live CSS / inferred from mark) -
const gildanColor = {
  // The primary / CTA "brand" is Gildan's royal blue, taken from the brand mark.
  // The exact hue is inferred (à confirmer) — #003087 is the closest royal blue.
  blue: "#003087", // primary call-to-action / brand blue (à confirmer exact hue)
  blueHover: "#00205a", // darker navy press / hover state (also the inverse band)
  navy: "#00205a", // deep navy inverse band / footer tone
  white: "#ffffff", // page background — surface default
  // Soft monochrome ink scale (charcoal, not pure black). Gildan sets body text
  // in a measured charcoal #313131.
  ink: {
    // Primary body text — measured corporate charcoal.
    primary: "#313131", // measured charcoal body ink
    // Secondary text & strong borders.
    secondary: "#5e5e5e", // secondary text / strong border
    // Muted text.
    muted: "#8a8a8a" // muted text
  },
  // Neutral surface / line greys.
  grey: {
    subtle: "#f4f4f4", // subtle fill surface
    border: "#d8d8d8" // subtle / field hairline border
  },
  // Gildan shows little decorative colour beyond the brand blue; it publishes no
  // success/warning/info hues. The danger red is matched to a measured error /
  // destructive accent; the remaining feedback hues are restrained, legible
  // (WCAG AA on white) choices flagged "à confirmer" — Gildan has no measured
  // equivalent.
  system: {
    danger: "#c0392b", // error / destructive accent
    success: "#2e7d32", // muted green — à confirmer (no Gildan source)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#003087" // Gildan would use its royal blue, not a generic info blue — à confirmer
  }
} as const;

// --- foundation (Gildan-specific values) ------------------------------------
const foundation = {
  color: {
    // Gildan's brand colour IS a royal blue, so the Sentropic "blue" role family
    // (action / primary / link) maps onto the measured/inferred blue scale.
    blue: {
      10: gildanColor.grey.subtle, // #f4f4f4 lightest neutral tint
      60: gildanColor.blue, // #003087 primary action (Gildan royal blue CTA)
      80: gildanColor.navy // #00205a darker navy step
    },
    // Gildan has no distinct cyan/accent. The Sentropic "cyan" accent slot is
    // mapped onto the brand blue/navy scale (no separate decorative accent
    // exists). (à confirmer.)
    cyan: {
      10: gildanColor.grey.subtle, // #f4f4f4 light neutral tint
      50: gildanColor.blue, // #003087 — the only "accent" Gildan has is its blue
      70: gildanColor.navy // #00205a
    },
    // Sentropic "slate" role family mapped onto the Gildan charcoal ink/grey
    // scale.
    slate: {
      0: gildanColor.white, // #ffffff white
      10: gildanColor.grey.subtle, // #f4f4f4 subtle fill surface
      20: gildanColor.grey.border, // #d8d8d8 hairline / subtle border
      60: gildanColor.ink.secondary, // #5e5e5e secondary text
      80: gildanColor.ink.primary, // #313131 primary text (charcoal)
      90: gildanColor.navy // #00205a darkest (deep navy)
    },
    feedback: {
      success: gildanColor.system.success,
      warning: gildanColor.system.warning,
      error: gildanColor.system.danger,
      info: gildanColor.system.info
    }
  },
  // Gildan's measured type stack reads system-ui; we substitute the closest
  // documentary sans, Inter (à confirmer), for both sans and display so the
  // corporate tone reads consistently. We reference the *names* only. Mono is
  // not part of Gildan — the inherited Sentropic mono stack is kept.
  font: {
    sans: "'Inter', Helvetica, Arial, sans-serif",
    display: "'Inter', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. Gildan's corporate grid is whitespace-generous
  // but its raw spacing steps are not strongly tokenised publicly; kept aligned
  // with the Sentropic base 4px scale ("à confirmer" exact steps).
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
  // Gildan uses CORPORATE rounding — square hairline controls with a gentle 4px
  // on buttons/inputs/tabs and 8px on cards. Not pill, not fully square.
  // (Exact steps à confirmer; pill kept at 999px for completeness.)
  radius: {
    none: "0", // square slot
    sm: "0", // smallest controls — square
    md: "4px", // button / input / tabs — corporate 4px
    lg: "8px", // cards — soft 8px
    pill: "999px" // tags / pills
  },
  // Gildan elevation is restrained corporate — hairlines and whitespace with
  // soft, low shadows on raised elements. Kept conservative and black-tinted
  // ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.14)"
  },
  // Gildan animates with short, standard eases (≈ 150ms transitions). Durations
  // not fully tokenised publicly; kept aligned with the base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "150ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Gildan-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Gildan) -----------------------------------------
  // Gildan borders are thin LIGHT-GREY hairlines (#d8d8d8 @1px). Encoded as 1px
  // thin / 2px thick.
  borderWidth: {
    none: "0",
    thin: "1px", // Gildan hairline (#d8d8d8)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Gildan control density. Corporate CTA buttons sit ~44px tall with generous
  // horizontal padding; nav/body text is mid-sized sans. md targets a ~44px
  // touch height; sm/lg bracket it ("à confirmer" exact metrics).
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // Gildan typography = the corporate sans (Inter substitute). Control labels are
  // mid-weight; body/field text is sentence case. CTAs read uppercase-tracked on
  // the live site (à confirmer letter-spacing).
  typography: {
    control: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "600", lineHeight: "1.2", letterSpacing: "0.02em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.4", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Gildan links are royal-blue ink; the hover affordance is an underline.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // Gildan dims disabled controls (corporate ghost)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // Gildan FOCUS = a crisp royal-blue OUTLINE (~2px solid #003087). We encode the
  // blue outline strategy.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: gildanColor.blue, // #003087 — Gildan focuses in its royal blue
    inset: "0"
  },
  // Gildan form fields are BOXED (outline): a white fill with a thin light-grey
  // hairline border and a gentle 4px radius. `style: "outline"` makes the builder
  // draw four equal borders from `surface.default` + `border.subtle`. Measured
  // input/select border = #d8d8d8 @1px hairline.
  field: {
    style: "outline",
    fillBg: gildanColor.white, // #ffffff
    underlineColor: gildanColor.grey.border, // #d8d8d8 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the charcoal ink with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23313131' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Gildan cards: gentle 8px rounding, a thin light-grey hairline rather than a
  // heavy box, with a faint hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: gildanColor.grey.subtle // #f4f4f4 faint hover tint
  },
  // Gildan secondary button = a soft-grey filled chip (light #f4f4f4 fill, ink
  // text, slightly darker grey on hover) — the quiet alternative to the filled
  // royal-blue primary.
  buttonSecondary: {
    background: gildanColor.grey.subtle, // #f4f4f4 soft fill
    border: gildanColor.grey.border, // #d8d8d8 light hairline
    hoverBackground: gildanColor.grey.border // #d8d8d8 on hover
  },
  // Gildan tabs / sub-nav: active tab = royal-blue bold label with a royal-blue
  // bottom underline (the corporate indicator), transparent fill.
  tabs: {
    activeText: gildanColor.blue, // #003087
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem", // 18px
    indicatorSide: "bottom", // blue underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline (not a box-shadow filet)
  },
  // Gildan pagination: borderless ink text links; active page = filled royal-blue
  // box with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: gildanColor.ink.primary, // #313131 link text
    activeBackground: gildanColor.blue, // #003087 filled active page
    activeText: gildanColor.white, // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // Gildan breadcrumb: ink links, grey trail, royal-blue current page, grey
  // separators — all corporate sans type.
  breadcrumb: {
    linkText: gildanColor.ink.primary, // #313131
    text: gildanColor.ink.secondary, // #5e5e5e trail text
    currentText: gildanColor.blue, // #003087 current page
    separator: gildanColor.ink.secondary, // #5e5e5e
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.125rem", // 18px
    currentWeight: "600" // current page is emphasised
  },
  // Gildan notice / alert: a minimal corporate box — a thin coloured left filet on
  // a white box, no fill. The severity accent is a slim left bar.
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0", // left border collapses (filet instead)
    filetWidth: "0.1875rem", // 3px ::before accent bar (corporate)
    paddingTop: "0.875rem", // 14px
    paddingRight: "1rem", // 16px
    paddingBottom: "0.875rem", // 14px
    paddingLeft: "1.125rem", // 18px (clears the left filet)
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Gildan accordion / disclosure: an ink, plain-weight sans summary trigger,
  // gentle rounding, hairline separated.
  accordion: {
    text: gildanColor.ink.primary, // #313131 summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // rows are flush to the column
    fontSize: "0.875rem", // 14px
    fontWeight: "500", // mid weight sans
    lineHeight: "1.25rem" // 20px
  },
  // Gildan tag: a small soft-grey chip with gentle 4px rounding.
  tag: {
    radius: "4px", // gentle rounding (matches md)
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: gildanColor.grey.subtle, // #f4f4f4 subtle fill
    neutralText: gildanColor.ink.primary // #313131
  },
  // Gildan badge: a small filled badge — royal-blue fill / white text, uppercase,
  // gentle 4px rounding.
  badge: {
    radius: "4px", // gentle rounding
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "uppercase", // Gildan labels often uppercase
    minHeight: "1.25rem", // 20px
    infoBackground: gildanColor.blue, // #003087 (Gildan "info" = royal blue)
    infoText: gildanColor.white // white on blue
  },
  // Gildan checkbox/radio label: small ink sans.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: gildanColor.ink.primary // #313131
  },
  // Gildan search input: a boxed light hairline field, sans type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Gildan toggle / switch label: small ink sans.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: gildanColor.ink.primary // #313131
  }
} as const;

// --- semantic (Gildan-specific role mapping) --------------------------------
const semantic = {
  surface: {
    default: gildanColor.white, // #ffffff white
    subtle: gildanColor.grey.subtle, // #f4f4f4 subtle fill surface
    raised: gildanColor.white, // #ffffff white
    inverse: gildanColor.navy, // #00205a deep navy inverse band (footer / hero tone)
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop — black @50%
  },
  text: {
    primary: gildanColor.ink.primary, // #313131 (measured charcoal body ink)
    secondary: gildanColor.ink.secondary, // #5e5e5e
    muted: gildanColor.ink.muted, // #8a8a8a
    inverse: gildanColor.white, // white on navy / dark surfaces
    link: gildanColor.blue // #003087 — Gildan links are royal blue
  },
  border: {
    subtle: gildanColor.grey.border, // #d8d8d8 light hairline (field / divider)
    strong: gildanColor.ink.secondary, // #5e5e5e stronger border
    interactive: gildanColor.blue // #003087 focus / interactive
  },
  action: {
    primary: gildanColor.blue, // #003087 primary button (the royal-blue CTA)
    primaryHover: gildanColor.blueHover, // #00205a — darker navy on hover
    primaryText: gildanColor.white, // white text on blue
    secondary: gildanColor.grey.subtle, // #f4f4f4 secondary surface
    secondaryHover: gildanColor.grey.border, // #d8d8d8
    secondaryText: gildanColor.ink.primary, // #313131
    danger: gildanColor.system.danger // #c0392b
  },
  feedback: {
    success: gildanColor.system.success,
    warning: gildanColor.system.warning,
    error: gildanColor.system.danger,
    info: gildanColor.system.info
  },
  status: {
    pending: gildanColor.system.warning,
    processing: gildanColor.system.info,
    completed: gildanColor.system.success,
    failed: gildanColor.system.danger
  },
  // Categorical data-vis palette. Gildan publishes no data-vis scale, so this is
  // a coherent proposal led by the brand blue and charcoal ink, then greys and
  // the restrained system hues, drawn to honour the corporate identity (see
  // MAPPING.md, "à confirmer" — not an official scale).
  data: {
    category1: gildanColor.blue, // #003087 royal blue
    category2: gildanColor.ink.primary, // #313131 charcoal
    category3: gildanColor.ink.secondary, // #5e5e5e
    category4: gildanColor.ink.muted, // #8a8a8a
    category5: gildanColor.grey.border, // #d8d8d8
    category6: gildanColor.system.danger, // restrained red (à confirmer)
    category7: gildanColor.system.success, // restrained green (à confirmer)
    category8: gildanColor.system.warning // restrained amber (à confirmer)
  }
} as const;

/**
 * The Gildan theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Gildan-specific (corporate charcoal +
 * royal-blue) values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so Gildan's charcoal-on-white,
 * royal-blue-accented identity reaches the components (buttons, tabs, pagination,
 * chat bubbles…), not just the elements that read semantic vars directly.
 */
export const gildanTheme: TenantTheme = {
  id: "gildan",
  label: "Gildan",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default gildanTheme;
