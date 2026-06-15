import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Quebecor (quebecor.com — the Montréal media & telecommunications group, parent
 * of Vidéotron, TVA and Le Journal de Montréal) theme for the Sentropic token
 * structure.
 *
 * Quebecor publishes no design-token file; the values below are MEASURED from the
 * live corporate site's computed CSS (https://www.quebecor.com, inspected in a
 * real browser). We only reference the font *names* here (the measured stack is
 * "Montserrat,Gotham,sans-serif" — we keep "'Montserrat', Helvetica, Arial,
 * sans-serif" as the portable equivalent), never font binaries. Sources and the
 * full mapping table are in MAPPING.md.
 *
 * Quebecor's identity is a CORPORATE STEEL-BLUE / NAVY system set in Montserrat:
 * an interactive steel-blue used for CTAs and links, a deep navy for hovers and
 * inverse bands, a brighter light blue for accents / data highlights, charcoal
 * body text on white, and quiet structural greys. Rounding is corporate-modest
 * (4px controls, 8px cards). Focus is a steel-blue outline. Where Sentropic needs
 * a role Quebecor never colours (success/warning/info feedback), a restrained,
 * legible system colour is used and the choice is noted "à confirmer" in
 * MAPPING.md.
 *
 * Quebecor colour reference (measured, light theme):
 *   Steel blue (action / CTA / link)   #4d7fa7   measured interactive blue
 *   Dark navy (primary hover / inverse) #18364d  measured dark navy band
 *   Light blue (accent / data)         #64a7dc   measured highlight blue
 *   Charcoal — primary text            #263238   measured body text
 *   Secondary text                     #656e76   measured secondary ink
 *   Muted text                         #8a929c   measured muted grey
 *   Subtle fill surface                #edeef2   measured light fill
 *   Border / hairline                  #d3d8e0   measured subtle border
 *   White (surface default)            #ffffff   page background
 *   Danger / error red                 #c0392b   error / system danger
 */

// --- Quebecor raw colour palette (measured from live computed CSS) ----------
const quebecorColor = {
  // The interactive / CTA "brand" is a measured steel-blue. Quebecor uses it for
  // the primary call-to-action, links and active indicators.
  steelBlue: "#4d7fa7", // measured interactive blue — CTA / link / active
  // Deep navy: the measured primary-hover tone and the inverse band colour.
  navy: "#18364d", // measured dark navy — primaryHover / inverse surface
  // Brighter light blue: the measured accent used for data / highlights.
  lightBlue: "#64a7dc", // measured highlight blue — accent / data category
  white: "#ffffff", // page background — surface default
  // Charcoal / grey ink scale (each value measured from a real element).
  ink: {
    primary: "#263238", // measured charcoal — body text colour
    secondary: "#656e76", // measured secondary ink
    muted: "#8a929c" // measured muted grey
  },
  // Neutral surface / line greys.
  grey: {
    subtle: "#edeef2", // measured light fill surface
    border: "#d3d8e0" // measured subtle / field hairline border
  },
  // Quebecor surfaces little decorative feedback colour beyond the danger red,
  // which is measured. success/warning/info are restrained, legible (WCAG AA on
  // white) system colours chosen to sit quietly against the corporate palette;
  // they are "à confirmer" — Quebecor has no measured equivalent.
  system: {
    danger: "#c0392b", // measured error / system danger red
    success: "#2e7d32", // muted green — à confirmer (no Quebecor source)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#4d7fa7" // reuse the steel-blue for "info" — à confirmer
  }
} as const;

// --- foundation (Quebecor-specific values) ----------------------------------
const foundation = {
  color: {
    // The Sentropic "blue" role family (action / primary / link) maps onto
    // Quebecor's measured steel-blue → navy scale.
    blue: {
      10: quebecorColor.grey.subtle, // #edeef2 lightest neutral tint
      60: quebecorColor.steelBlue, // #4d7fa7 primary action (steel-blue CTA)
      80: quebecorColor.navy // #18364d dark navy (hover / strong)
    },
    // The Sentropic "cyan" accent slot maps to Quebecor's measured light blue.
    cyan: {
      10: quebecorColor.grey.subtle, // #edeef2 light neutral tint
      50: quebecorColor.lightBlue, // #64a7dc accent / data highlight
      70: quebecorColor.steelBlue // #4d7fa7
    },
    // Sentropic "slate" role family mapped onto the Quebecor charcoal/grey scale.
    slate: {
      0: quebecorColor.white, // #ffffff white
      10: quebecorColor.grey.subtle, // #edeef2 subtle fill surface
      20: quebecorColor.grey.border, // #d3d8e0 hairline / subtle border
      60: quebecorColor.ink.secondary, // #656e76 secondary text
      80: quebecorColor.ink.primary, // #263238 primary text (charcoal)
      90: quebecorColor.navy // #18364d darkest (navy)
    },
    feedback: {
      success: quebecorColor.system.success,
      warning: quebecorColor.system.warning,
      error: quebecorColor.system.danger,
      info: quebecorColor.system.info
    }
  },
  // Quebecor sets its UI in MONTSERRAT — the measured stack is
  // "Montserrat,Gotham,sans-serif"; we keep a portable
  // "'Montserrat', Helvetica, Arial, sans-serif". We reference the *names* only.
  // Display reuses the same Montserrat. Mono is not part of Quebecor — the
  // Sentropic mono stack (kept from the Simons template) is retained.
  font: {
    sans: "'Montserrat', Helvetica, Arial, sans-serif",
    display: "'Montserrat', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. Quebecor's raw spacing steps are not strongly
  // tokenised publicly; kept aligned with the Sentropic base 4px scale
  // ("à confirmer" exact steps).
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
  // Quebecor rounding is CORPORATE-MODEST — measured ~4px on controls/inputs and
  // ~8px on cards; not square, not pill. (Exact steps à confirmer; pill kept at
  // 999px for completeness.)
  radius: {
    none: "0", // square slot
    sm: "0", // smallest controls — square
    md: "4px", // button / input / tabs — corporate 4px (measured)
    lg: "8px", // cards — soft 8px (measured)
    pill: "999px" // tags / pills
  },
  // Quebecor elevation is restrained corporate — soft, low, slightly cool
  // shadows on raised elements. Kept conservative ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.14)"
  },
  // Quebecor animates with short, standard eases (≈ 150ms transitions). Durations
  // not fully tokenised publicly; kept aligned with the base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "150ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Quebecor-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Quebecor) ---------------------------------------
  // Quebecor borders are thin cool-grey hairlines (#d3d8e0 @1px). Encoded as 1px
  // thin / 2px thick.
  borderWidth: {
    none: "0",
    thin: "1px", // Quebecor hairline (#d3d8e0)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Quebecor control density. Measured CTA buttons sit ~44px tall with generous
  // horizontal padding; nav/body text is mid-sized Montserrat. md targets a ~44px
  // touch height; sm/lg bracket it ("à confirmer" exact steps).
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // Quebecor typography = Montserrat. Control labels are mid-weight; body/field
  // text is sentence case. CTAs are commonly UPPERCASE-tracked on the live site
  // (measured letter-spacing on the primary buttons).
  typography: {
    control: { family: "'Montserrat', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "600", lineHeight: "1.2", letterSpacing: "0.04em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Montserrat', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Montserrat', Helvetica, Arial, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.4", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Quebecor links are steel-blue at rest; the hover affordance is an underline.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // Quebecor dims disabled controls
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // Quebecor FOCUS = a crisp steel-blue OUTLINE (~2px solid #4d7fa7). We encode
  // the outline strategy with the measured steel-blue.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: quebecorColor.steelBlue, // #4d7fa7 — Quebecor focuses in steel-blue
    inset: "0"
  },
  // Quebecor form fields are BOXED (outline): a white fill with a thin cool-grey
  // hairline border and a 4px radius. `style: "outline"` makes the builder draw
  // four equal borders from `surface.default` + `border.subtle`. Measured input/
  // select border = #d3d8e0 @1px hairline.
  field: {
    style: "outline",
    fillBg: quebecorColor.white, // #ffffff
    underlineColor: quebecorColor.grey.border, // #d3d8e0 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the charcoal ink with a 40px gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23263238' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Quebecor cards: 8px rounding, a thin cool-grey hairline rather than a heavy
  // box, with a faint hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: quebecorColor.grey.subtle // #edeef2 faint hover tint
  },
  // Quebecor secondary button = a soft-grey filled chip (light #edeef2 fill, ink
  // text, slightly darker grey on hover) — the quiet alternative to the filled
  // steel-blue primary.
  buttonSecondary: {
    background: quebecorColor.grey.subtle, // #edeef2 soft fill
    border: quebecorColor.grey.border, // #d3d8e0 light hairline
    hoverBackground: quebecorColor.grey.border // #d3d8e0 on hover
  },
  // Quebecor tabs / sub-nav: active tab = steel-blue label with a steel-blue
  // bottom underline (the indicator), transparent fill.
  tabs: {
    activeText: quebecorColor.steelBlue, // #4d7fa7
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem", // 18px
    indicatorSide: "bottom", // steel-blue underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline (not a box-shadow filet)
  },
  // Quebecor pagination: borderless ink text links; active page = filled
  // steel-blue box with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: quebecorColor.ink.primary, // #263238 link text
    activeBackground: quebecorColor.steelBlue, // #4d7fa7 filled active page
    activeText: quebecorColor.white, // white on steel-blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // Quebecor breadcrumb: ink links, grey trail, steel-blue current page, grey
  // separators — all Montserrat.
  breadcrumb: {
    linkText: quebecorColor.ink.primary, // #263238
    text: quebecorColor.ink.secondary, // #656e76 trail text
    currentText: quebecorColor.steelBlue, // #4d7fa7 current page
    separator: quebecorColor.ink.secondary, // #656e76
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.125rem", // 18px
    currentWeight: "600" // current page is emphasised
  },
  // Quebecor notice / alert: a minimal box — a thin coloured left filet on a
  // white box, no fill. The severity accent is a slim left bar.
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
  // Quebecor accordion / disclosure: an ink, mid-weight Montserrat summary
  // trigger, gentle rounding, hairline separated.
  accordion: {
    text: quebecorColor.ink.primary, // #263238 summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // rows are flush to the column
    fontSize: "0.875rem", // 14px
    fontWeight: "500", // mid-weight Montserrat
    lineHeight: "1.25rem" // 20px
  },
  // Quebecor tag: a small soft-grey chip with 4px rounding.
  tag: {
    radius: "4px", // matches md
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: quebecorColor.grey.subtle, // #edeef2 subtle fill
    neutralText: quebecorColor.ink.primary // #263238
  },
  // Quebecor badge: a small filled badge — steel-blue fill / white text,
  // uppercase, 4px rounding.
  badge: {
    radius: "4px", // matches md
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "uppercase", // Quebecor labels are often uppercase
    minHeight: "1.25rem", // 20px
    infoBackground: quebecorColor.steelBlue, // #4d7fa7 (Quebecor "info" = steel-blue)
    infoText: quebecorColor.white // white on steel-blue
  },
  // Quebecor checkbox/radio label: small charcoal Montserrat.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: quebecorColor.ink.primary // #263238
  },
  // Quebecor search input: a boxed cool-grey hairline field, Montserrat type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Quebecor toggle / switch label: small charcoal Montserrat.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: quebecorColor.ink.primary // #263238
  }
} as const;

// --- semantic (Quebecor-specific role mapping) ------------------------------
const semantic = {
  surface: {
    default: quebecorColor.white, // #ffffff white
    subtle: quebecorColor.grey.subtle, // #edeef2 subtle fill surface
    raised: quebecorColor.white, // #ffffff white
    inverse: quebecorColor.navy, // #18364d navy inverse band
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop — black @50%
  },
  text: {
    primary: quebecorColor.ink.primary, // #263238 (measured charcoal body text)
    secondary: quebecorColor.ink.secondary, // #656e76 (measured)
    muted: quebecorColor.ink.muted, // #8a929c (measured muted grey)
    inverse: quebecorColor.white, // white on navy / dark surfaces
    link: quebecorColor.steelBlue // #4d7fa7 — Quebecor links are steel-blue
  },
  border: {
    subtle: quebecorColor.grey.border, // #d3d8e0 light hairline (field / divider)
    strong: quebecorColor.ink.secondary, // #656e76 stronger border
    interactive: quebecorColor.steelBlue // #4d7fa7 focus / interactive
  },
  action: {
    primary: quebecorColor.steelBlue, // #4d7fa7 primary button (steel-blue CTA)
    primaryHover: quebecorColor.navy, // #18364d dark navy on hover (measured)
    primaryText: quebecorColor.white, // white text on steel-blue
    secondary: quebecorColor.grey.subtle, // #edeef2 secondary surface
    secondaryHover: quebecorColor.grey.border, // #d3d8e0
    secondaryText: quebecorColor.ink.primary, // #263238
    danger: quebecorColor.system.danger // #c0392b
  },
  feedback: {
    success: quebecorColor.system.success,
    warning: quebecorColor.system.warning,
    error: quebecorColor.system.danger,
    info: quebecorColor.system.info
  },
  status: {
    pending: quebecorColor.system.warning,
    processing: quebecorColor.system.info,
    completed: quebecorColor.system.success,
    failed: quebecorColor.system.danger
  },
  // Categorical data-vis palette. Quebecor publishes no data-vis scale; this is a
  // coherent proposal led by the measured brand blues (steel → light → navy) then
  // a grey ramp plus the restrained system hues, drawn to honour the corporate
  // identity (see MAPPING.md, "à confirmer" — not an official scale).
  data: {
    category1: quebecorColor.steelBlue, // #4d7fa7 (measured steel-blue)
    category2: quebecorColor.lightBlue, // #64a7dc (measured light blue)
    category3: quebecorColor.navy, // #18364d (measured navy)
    category4: quebecorColor.ink.secondary, // #656e76 grey
    category5: quebecorColor.grey.border, // #d3d8e0 light grey
    category6: quebecorColor.system.danger, // restrained red (à confirmer)
    category7: quebecorColor.system.success, // restrained green (à confirmer)
    category8: quebecorColor.system.warning // restrained amber (à confirmer)
  }
} as const;

/**
 * The Quebecor theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Quebecor-specific (corporate steel-blue /
 * navy Montserrat) values, and the `component` layer is REBUILT from this theme's
 * own semantic/foundation via `createComponent` — so Quebecor's steel-blue
 * identity reaches the components (buttons, tabs, pagination, chat bubbles…), not
 * just the elements that read semantic vars directly.
 */
export const quebecorTheme: TenantTheme = {
  id: "quebecor",
  label: "Quebecor",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default quebecorTheme;
