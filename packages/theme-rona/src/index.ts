import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * RONA (rona.ca — the Québec home-improvement / hardware retailer) theme for the
 * Sentropic token structure.
 *
 * RONA publishes no public design-token file; the values below are MEASURED from
 * the live site's computed CSS (https://www.rona.ca, inspected in a real
 * browser) after the lg2 rebrand. We only reference the font *names* here
 * ("'Roboto', Helvetica, Arial, sans-serif" — Roboto is the measured dominant
 * family), never font binaries. Sources and the full mapping table are in
 * MAPPING.md.
 *
 * RONA's identity is a MODERN RETAIL system: a confident RONA blue wordmark and
 * primary CTA (#0046AD), near-black ink body text on white, modern square-ish
 * rounding (0 on small controls, 4px on buttons/inputs, 8px on cards), boxed
 * outline form fields, and a blue focus outline. The signature brand twist is a
 * high-energy CHARTREUSE accent (#e1fa00) used on hero highlights and data/accent
 * roles ONLY — it deliberately fails text contrast as a button background, so it
 * is never used as an action fill. Where Sentropic needs a role RONA never
 * colours (some feedback states), a restrained legible system colour is used and
 * the choice is noted "à confirmer" in MAPPING.md.
 *
 * RONA colour reference (measured, light theme):
 *   Blue (action / CTA / brand)        #0046AD   RONA blue wordmark / primary CTA
 *   Blue hover                         #003886   darker blue on CTA hover
 *   White (surface default)            #ffffff   page background
 *   Ink — primary text                 #111827   rgb(17,24,39) near-black ink
 *   Secondary text                     #666666   rgb(102,102,102)
 *   Muted text                         #8a8f98   rgb(138,143,152)
 *   Subtle fill surface                #f4f4f4   light fill
 *   Subtle / field border              #d8dadf   light hairline
 *   Accent — chartreuse                #e1fa00   hero highlight / data accent only
 *   Danger / error red                 #d32f2f   error / system danger
 */

// --- RONA raw colour palette (measured from live computed CSS) --------------
const ronaColor = {
  // The brand / CTA blue. RONA uses it for the wordmark, the primary call-to-
  // action, tab/pagination/breadcrumb active states and the focus outline.
  blue: "#0046AD", // RONA blue — primary action / brand
  blueHover: "#003886", // darker blue — primary action hover
  white: "#ffffff", // page background — surface default
  // RONA's signature high-energy accent. Measured on hero highlights (the site
  // hero sits in the #f2ff61 family); used in data/accent roles ONLY. It fails
  // contrast as a button background, so it is NEVER an action fill.
  accent: "#e1fa00", // chartreuse — hero highlight / data accent (not a CTA bg)
  // Ink scale (each value measured from a real element). RONA body text is a
  // near-black slate ink (#111827), not pure #000.
  ink: {
    // Primary body text — measured near-black ink rgb(17,24,39).
    primary: "#111827", // rgb(17,24,39) — body text colour / inverse surface
    // Secondary text.
    secondary: "#666666", // rgb(102,102,102) — secondary text (measured)
    // Muted text.
    muted: "#8a8f98" // rgb(138,143,152) — muted text
  },
  // Neutral surface / line greys.
  grey: {
    subtle: "#f4f4f4", // subtle fill surface
    border: "#d8dadf" // subtle / field hairline border
  },
  // RONA shows little decorative colour beyond blue + chartreuse. The danger red
  // is measured (error / system danger). The remaining feedback hues are
  // restrained, legible (WCAG AA on white) system colours chosen to stay
  // coherent with the modern retail aesthetic — "à confirmer", RONA has no
  // measured equivalent.
  system: {
    danger: "#d32f2f", // red — error / system danger (measured)
    success: "#2e7d32", // muted green — à confirmer (no RONA source)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#0046AD" // RONA would use its brand blue, not a separate info hue
  }
} as const;

// --- foundation (RONA-specific values) --------------------------------------
const foundation = {
  color: {
    // RONA's brand action family IS the RONA blue. The Sentropic "blue" role
    // family (action / primary / link) maps onto the measured blue scale.
    blue: {
      10: ronaColor.grey.subtle, // #f4f4f4 lightest neutral tint
      60: ronaColor.blue, // #0046AD primary action (RONA blue CTA)
      80: ronaColor.blueHover // #003886 darker hover step
    },
    // The Sentropic "cyan" accent slot maps onto RONA's chartreuse accent — the
    // one decorative brand hue (used in data/accent contexts only).
    cyan: {
      10: ronaColor.grey.subtle, // #f4f4f4 light neutral tint
      50: ronaColor.accent, // #e1fa00 chartreuse accent
      70: ronaColor.ink.primary // #111827 (no darker chartreuse step — ink terminal)
    },
    // Sentropic "slate" role family mapped onto the RONA ink / grey scale.
    slate: {
      0: ronaColor.white, // #ffffff white
      10: ronaColor.grey.subtle, // #f4f4f4 subtle fill surface
      20: ronaColor.grey.border, // #d8dadf hairline / subtle border
      60: ronaColor.ink.secondary, // #666666 secondary text
      80: ronaColor.ink.primary, // #111827 primary text (near-black ink)
      90: ronaColor.ink.primary // #111827 darkest (RONA inverse is the ink, not pure black)
    },
    feedback: {
      success: ronaColor.system.success,
      warning: ronaColor.system.warning,
      error: ronaColor.system.danger,
      info: ronaColor.system.info
    }
  },
  // RONA sets its UI in Roboto — measured "'Roboto', Helvetica, Arial,
  // sans-serif" as the dominant family across headings and body, giving the
  // modern retail tone. We reference the *names* only. Mono is not part of RONA —
  // the Sentropic mono stack is kept.
  font: {
    sans: "'Roboto', Helvetica, Arial, sans-serif",
    display: "'Roboto', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. RONA's grid is not strongly tokenised publicly;
  // kept aligned with the Sentropic base 4px scale ("à confirmer" exact steps).
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
  // RONA rounding is MODERN: square on small controls, gentle 4px on buttons /
  // inputs / tabs, 8px on cards. Not boxy-zero everywhere, not pill. (Pill kept
  // at 999px for completeness.)
  radius: {
    none: "0", // square slot
    sm: "0", // smallest controls — square
    md: "4px", // button / input / tabs — gentle 4px (measured)
    lg: "8px", // cards — soft 8px (measured)
    pill: "999px" // tags / pills
  },
  // RONA elevation is restrained — modern soft, low shadows on raised elements
  // over a white retail canvas. Kept conservative and black-tinted ("à confirmer"
  // exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.14)"
  },
  // RONA animates with short, standard eases (measured ≈ 150ms transitions).
  // Durations not fully tokenised publicly; kept aligned with the base.
  motion: {
    fast: "120ms",
    normal: "150ms", // measured button transition duration
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not RONA-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (RONA) -------------------------------------------
  // RONA borders are thin LIGHT-GREY hairlines (#d8dadf @1px). Encoded as 1px
  // thin / 2px thick.
  borderWidth: {
    none: "0",
    thin: "1px", // RONA hairline (#d8dadf)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // RONA control density. Measured CTA buttons sit ~44px tall with generous
  // horizontal padding; nav/body text is mid-sized sans. md targets a ~44px
  // touch height; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // RONA typography = Roboto. Control labels are mid-weight sans; body/field text
  // is sentence case. CTAs are sentence/title case on the live site (no measured
  // uppercase tracking on the primary buttons — à confirmer).
  typography: {
    control: { family: "'Roboto', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "500", lineHeight: "1.2", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Roboto', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Roboto', Helvetica, Arial, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // RONA links are blue ink at rest; the hover affordance is an underline.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // RONA dims disabled controls
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // RONA FOCUS = a crisp blue OUTLINE (~2px solid #0046AD). We encode the blue
  // outline strategy.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: ronaColor.blue, // #0046AD — RONA focuses in its brand blue
    inset: "0"
  },
  // RONA form fields are BOXED (outline): a white fill with a thin light-grey
  // hairline border and a gentle 4px radius. `style: "outline"` makes the builder
  // draw four equal borders from `surface.default` + `border.subtle`. Measured
  // input/select border = #d8dadf @1px hairline.
  field: {
    style: "outline",
    fillBg: ronaColor.white, // #ffffff
    underlineColor: ronaColor.grey.border, // #d8dadf (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the near-black ink with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23111827' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // RONA cards: gentle 8px rounding, a thin light-grey hairline rather than a
  // heavy box, with a faint hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: ronaColor.grey.subtle // #f4f4f4 faint hover tint
  },
  // RONA secondary button = a soft-grey filled chip (light #f4f4f4 fill, ink
  // text, slightly darker grey hairline) — the quiet alternative to the filled
  // blue primary.
  buttonSecondary: {
    background: ronaColor.grey.subtle, // #f4f4f4 soft fill
    border: ronaColor.grey.border, // #d8dadf light hairline
    hoverBackground: ronaColor.grey.border // #d8dadf on hover
  },
  // RONA tabs / sub-nav: active tab = blue bold sans label with a blue bottom
  // underline (the modern indicator), transparent fill.
  tabs: {
    activeText: ronaColor.blue, // #0046AD
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
  // RONA pagination: borderless ink text links; active page = filled blue box
  // with white text (the brand fill).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: ronaColor.ink.primary, // #111827 link text
    activeBackground: ronaColor.blue, // #0046AD filled active page
    activeText: ronaColor.white, // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // RONA breadcrumb: ink links, grey trail, blue current page, grey separators —
  // all sans type.
  breadcrumb: {
    linkText: ronaColor.ink.primary, // #111827
    text: ronaColor.ink.secondary, // #666666 trail text
    currentText: ronaColor.blue, // #0046AD current page (brand blue)
    separator: ronaColor.ink.secondary, // #666666
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.125rem", // 18px
    currentWeight: "500" // current page is mildly emphasised
  },
  // RONA notice / alert: a minimal box — a thin coloured left filet on a white
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
  // RONA accordion / disclosure: an ink, plain-weight sans summary trigger,
  // gentle rounding, hairline separated.
  accordion: {
    text: ronaColor.ink.primary, // #111827 summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // rows are flush to the column
    fontSize: "0.875rem", // 14px
    fontWeight: "500", // mid weight sans
    lineHeight: "1.25rem" // 20px
  },
  // RONA tag: a small soft-grey chip with gentle 4px rounding.
  tag: {
    radius: "4px", // gentle rounding (matches md)
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: ronaColor.grey.subtle, // #f4f4f4 subtle fill
    neutralText: ronaColor.ink.primary // #111827
  },
  // RONA badge: a small filled badge — blue fill / white text, gentle 4px
  // rounding.
  badge: {
    radius: "4px", // gentle rounding
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "none", // RONA labels are sentence case (à confirmer)
    minHeight: "1.25rem", // 20px
    infoBackground: ronaColor.blue, // #0046AD (RONA "info" = brand blue)
    infoText: ronaColor.white // white on blue
  },
  // RONA checkbox/radio label: small ink sans.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: ronaColor.ink.primary // #111827
  },
  // RONA search input: a boxed light hairline field, sans type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // RONA toggle / switch label: small ink sans.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: ronaColor.ink.primary // #111827
  }
} as const;

// --- semantic (RONA-specific role mapping) ----------------------------------
const semantic = {
  surface: {
    default: ronaColor.white, // #ffffff white
    subtle: ronaColor.grey.subtle, // #f4f4f4 subtle fill surface
    raised: ronaColor.white, // #ffffff white
    inverse: ronaColor.ink.primary, // #111827 navy-black inverse surface (footer tone)
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop — black @50%
  },
  text: {
    primary: ronaColor.ink.primary, // #111827 (measured near-black ink)
    secondary: ronaColor.ink.secondary, // #666666 (measured)
    muted: ronaColor.ink.muted, // #8a8f98
    inverse: ronaColor.white, // white on dark surfaces
    link: ronaColor.blue // #0046AD — RONA links are brand blue
  },
  border: {
    subtle: ronaColor.grey.border, // #d8dadf light hairline (field / divider)
    strong: ronaColor.ink.secondary, // #666666 stronger border
    interactive: ronaColor.blue // #0046AD focus / interactive
  },
  action: {
    primary: ronaColor.blue, // #0046AD primary button (the RONA blue CTA)
    primaryHover: ronaColor.blueHover, // #003886 darker blue on hover
    primaryText: ronaColor.white, // white text on blue
    secondary: ronaColor.grey.subtle, // #f4f4f4 secondary surface
    secondaryHover: ronaColor.grey.border, // #d8dadf
    secondaryText: ronaColor.ink.primary, // #111827
    danger: ronaColor.system.danger // #d32f2f
  },
  feedback: {
    success: ronaColor.system.success,
    warning: ronaColor.system.warning,
    error: ronaColor.system.danger,
    info: ronaColor.system.info
  },
  status: {
    pending: ronaColor.system.warning,
    processing: ronaColor.system.info,
    completed: ronaColor.system.success,
    failed: ronaColor.system.danger
  },
  // Categorical data-vis palette. RONA publishes no data-vis scale; this is a
  // coherent proposal built on the two brand hues (blue + chartreuse accent)
  // followed by neutral greys and the restrained system hues, drawn to honour
  // the modern retail identity (see MAPPING.md, "à confirmer" — not an official
  // scale).
  data: {
    category1: ronaColor.blue, // #0046AD RONA blue
    category2: ronaColor.accent, // #e1fa00 chartreuse accent
    category3: ronaColor.ink.secondary, // #666666
    category4: ronaColor.ink.muted, // #8a8f98
    category5: ronaColor.grey.border, // #d8dadf
    category6: ronaColor.system.danger, // restrained red (à confirmer)
    category7: ronaColor.system.success, // restrained green (à confirmer)
    category8: ronaColor.system.warning // restrained amber (à confirmer)
  }
} as const;

/**
 * The RONA theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry RONA-specific (modern blue + chartreuse
 * accent) values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so RONA's blue-on-white retail
 * identity reaches the components (buttons, tabs, pagination, chat bubbles…),
 * not just the elements that read semantic vars directly.
 */
export const ronaTheme: TenantTheme = {
  id: "rona",
  label: "RONA",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default ronaTheme;
