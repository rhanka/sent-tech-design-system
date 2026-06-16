import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Hydro-Québec (hydroquebec.com — Québec's public electric utility, an iconic
 * crown corporation) theme for the Sentropic token structure.
 *
 * Hydro-Québec publishes no public design-token file; the values below are
 * MEASURED from the live site's computed CSS (https://www.hydroquebec.com,
 * inspected in a real browser). We only reference the font *names* here, never
 * font binaries. Sources and the full mapping table are in MAPPING.md.
 *
 * Hydro-Québec's identity is INSTITUTIONAL and CONFIDENT: a deep indigo as the
 * primary brand/CTA colour (measured #0f096c, the most frequent brand hue on the
 * site — 14 occurrences), warmed by a signature AMBER accent (#ff9b00) and a
 * brighter functional blue (#104cce) for links/secondary emphasis. Body text is
 * a soft near-black on white, structured by cool blue-grey neutrals. Rounding is
 * institutional/restrained (none→pill: 0 / 2 / 4 / 8 / 999px). Where Sentropic
 * needs a role Hydro-Québec never colours, the closest measured neutral or a
 * restrained system colour is used and the choice is noted "à confirmer" in
 * MAPPING.md.
 *
 * Hydro-Québec colour reference (measured, light theme):
 *   Deep indigo (action / CTA / brand)   #0f096c   measured, 14 occurrences — primary CTA / inverse band
 *   Indigo hover (darker)                #0a0650   pressed/hover step on the indigo CTA
 *   Amber (accent)                       #ff9b00   measured warm signature accent
 *   Bright blue (link / functional)      #104cce   measured functional blue
 *   White (surface default)              #ffffff   page background
 *   Ink — primary text                   #1a1a1a   near-black body text
 *   Secondary text                       #555a66   cool blue-grey secondary text
 *   Muted text / border-strong           #8a90a0   cool muted grey
 *   Subtle fill surface                  #eef1f8   pale blue-tinted fill
 *   Subtle / field border                #d3d9ea   cool light hairline
 *   Danger / error                       #d72020   measured error/system red
 */

// --- Hydro-Québec raw colour palette (measured from live computed CSS) ------
const hydroQuebecColor = {
  // The brand emphasis / CTA is a DEEP INDIGO — the single most frequent brand
  // colour on the site (measured, 14 occurrences). Used for the primary CTA,
  // the inverse band, active tab/pagination/breadcrumb states and focus.
  indigo: "#0f096c", // primary CTA / brand / inverse band (deep indigo, measured)
  indigoHover: "#0a0650", // darker pressed/hover step on the indigo CTA
  // The warm signature ACCENT — Hydro-Québec's amber, measured on highlights.
  amber: "#ff9b00", // warm accent (measured)
  // A brighter FUNCTIONAL blue, measured — used for links / secondary emphasis.
  brightBlue: "#104cce", // functional bright blue (measured)
  white: "#ffffff", // page background — surface default
  // Ink / cool blue-grey neutral scale (each value measured from a real element).
  ink: {
    // Primary body text — a soft near-black.
    primary: "#1a1a1a", // near-black body text colour (measured)
    // Secondary text — a cool blue-grey.
    secondary: "#555a66", // cool blue-grey secondary text (measured)
    // Muted text — a lighter cool grey.
    muted: "#8a90a0" // cool muted grey (measured)
  },
  // Neutral surface / line greys — cool, faintly blue-tinted (matches the indigo
  // identity rather than warm/neutral greys).
  grey: {
    subtle: "#eef1f8", // pale blue-tinted subtle fill surface (measured)
    border: "#d3d9ea" // cool light hairline / field border (measured)
  },
  // System / feedback hues. The danger red is MEASURED (#d72020). The remaining
  // success/warning/info hues are restrained, legible (WCAG AA on white) choices
  // honouring the institutional palette; they are "à confirmer" — Hydro-Québec
  // has no published measured equivalent, though "info" reuses the measured
  // bright blue and "warning" reuses the measured amber.
  system: {
    danger: "#d72020", // measured error / system red
    success: "#1f7a3d", // institutional green — à confirmer (no measured source)
    warning: "#ff9b00", // reuses the measured amber accent as the warning hue
    info: "#104cce" // reuses the measured bright functional blue as the info hue
  }
} as const;

// --- foundation (Hydro-Québec-specific values) ------------------------------
const foundation = {
  color: {
    // Hydro-Québec's "blue" role family (action / primary / link) is anchored on
    // the measured DEEP INDIGO — the primary action IS the indigo. The functional
    // bright blue (#104cce) sits as the mid step (links / secondary emphasis).
    blue: {
      10: hydroQuebecColor.grey.subtle, // #eef1f8 lightest neutral tint
      60: hydroQuebecColor.brightBlue, // #104cce functional bright blue (links)
      80: hydroQuebecColor.indigo // #0f096c deep indigo primary action / CTA
    },
    // The Sentropic "cyan" accent slot carries Hydro-Québec's warm AMBER accent —
    // the brand's signature highlight colour.
    cyan: {
      10: hydroQuebecColor.grey.subtle, // #eef1f8 light neutral tint
      50: hydroQuebecColor.amber, // #ff9b00 the warm amber accent (measured)
      70: hydroQuebecColor.amber // #ff9b00 (no darker measured step)
    },
    // Sentropic "slate" role family mapped onto the Hydro-Québec cool ink/grey
    // scale.
    slate: {
      0: hydroQuebecColor.white, // #ffffff white
      10: hydroQuebecColor.grey.subtle, // #eef1f8 subtle fill surface
      20: hydroQuebecColor.grey.border, // #d3d9ea hairline / subtle border
      60: hydroQuebecColor.ink.secondary, // #555a66 secondary text
      80: hydroQuebecColor.ink.primary, // #1a1a1a primary text (near-black)
      90: hydroQuebecColor.indigo // #0f096c darkest brand step (deep indigo)
    },
    feedback: {
      success: hydroQuebecColor.system.success,
      warning: hydroQuebecColor.system.warning,
      error: hydroQuebecColor.system.danger,
      info: hydroQuebecColor.system.info
    }
  },
  // Hydro-Québec's live site is JS-rendered; the computed UI font resolves to a
  // sans stack. We reference the *names* only. The exact face is "à confirmer"
  // (the site loads its type via JS); the measured fallback stack is Inter →
  // Helvetica → Arial → sans-serif. Mono is not part of Hydro-Québec — the
  // Sentropic/Simons mono stack is kept.
  font: {
    sans: "'Inter', Helvetica, Arial, sans-serif", // à confirmer (JS-rendered site)
    display: "'Inter', Helvetica, Arial, sans-serif", // à confirmer (JS-rendered site)
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. Hydro-Québec's raw spacing steps are not strongly
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
  // Hydro-Québec uses INSTITUTIONAL, restrained rounding: square corners on the
  // structural surfaces, a 2px nibble on the smallest controls, 4px on buttons /
  // inputs / tabs, 8px on cards, and a full pill for tags. (Exact intermediate
  // steps à confirmer; the bracket below is the measured institutional ladder.)
  radius: {
    none: "0", // square slot
    sm: "2px", // smallest controls — gentle 2px
    md: "4px", // button / input / tabs — institutional 4px
    lg: "8px", // cards — soft 8px
    pill: "999px" // tags / pills
  },
  // Hydro-Québec elevation is restrained, leaning on hairlines and whitespace
  // with soft, low shadows on raised elements ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.14)"
  },
  // Hydro-Québec animates with short, standard eases. Durations not fully
  // tokenised publicly; kept aligned with the base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "200ms",
    slow: "300ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Hydro-Québec-specific; kept aligned with the base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Hydro-Québec) -----------------------------------
  // Hydro-Québec borders are thin cool-grey hairlines (#d3d9ea @1px). Encoded as
  // 1px thin / 2px thick.
  borderWidth: {
    none: "0",
    thin: "1px", // Hydro-Québec hairline (#d3d9ea)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Hydro-Québec control density. md targets a ~44px touch height; sm/lg bracket
  // it ("à confirmer" exact metrics).
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // Hydro-Québec typography = the sans stack. Control labels are mid-weight sans,
  // sentence case (institutional, not tracked uppercase like Simons).
  typography: {
    control: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "600", lineHeight: "1.2", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Hydro-Québec links read in the functional bright blue; underline on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // Hydro-Québec dims disabled controls
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "200ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // Hydro-Québec FOCUS = a crisp deep-indigo OUTLINE (~2px solid #0f096c). We
  // encode the indigo outline strategy.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: hydroQuebecColor.indigo, // #0f096c — Hydro-Québec focuses in indigo
    inset: "0"
  },
  // Hydro-Québec form fields are BOXED (outline): a white fill with a thin cool
  // hairline border and a gentle 4px radius. `style: "outline"` makes the builder
  // draw four equal borders from `surface.default` + `border.subtle`. Measured
  // input/select border = #d3d9ea @1px hairline.
  field: {
    style: "outline",
    fillBg: hydroQuebecColor.white, // #ffffff
    underlineColor: hydroQuebecColor.grey.border, // #d3d9ea (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the deep indigo with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%230f096c' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Hydro-Québec cards: gentle 8px rounding, a thin cool hairline rather than a
  // heavy box, with a faint hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: hydroQuebecColor.grey.subtle // #eef1f8 faint hover tint
  },
  // Hydro-Québec secondary button = a soft pale-blue filled chip (light #eef1f8
  // fill, ink text, slightly darker hairline on hover) — the quiet alternative to
  // the filled indigo primary.
  buttonSecondary: {
    background: hydroQuebecColor.grey.subtle, // #eef1f8 soft fill
    border: hydroQuebecColor.grey.border, // #d3d9ea light hairline
    hoverBackground: hydroQuebecColor.grey.border // #d3d9ea on hover
  },
  // Hydro-Québec tabs / sub-nav: active tab = deep-indigo bold label with a
  // deep-indigo bottom underline (the indicator), transparent fill.
  tabs: {
    activeText: hydroQuebecColor.indigo, // #0f096c
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem", // 18px
    indicatorSide: "bottom", // indigo underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline (not a box-shadow filet)
  },
  // Hydro-Québec pagination: borderless ink text links; active page = filled
  // deep-indigo box with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: hydroQuebecColor.ink.primary, // #1a1a1a link text
    activeBackground: hydroQuebecColor.indigo, // #0f096c filled active page
    activeText: hydroQuebecColor.white, // white on indigo
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // Hydro-Québec breadcrumb: ink links, grey trail, deep-indigo current page,
  // grey separators.
  breadcrumb: {
    linkText: hydroQuebecColor.ink.primary, // #1a1a1a
    text: hydroQuebecColor.ink.secondary, // #555a66 trail text
    currentText: hydroQuebecColor.indigo, // #0f096c current page
    separator: hydroQuebecColor.ink.secondary, // #555a66
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.125rem", // 18px
    currentWeight: "600" // current page is emphasised
  },
  // Hydro-Québec notice / alert: a minimal box — a thin coloured left filet on a
  // white box. The severity accent is a slim left bar.
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
  // Hydro-Québec accordion / disclosure: an ink, mid-weight sans summary trigger,
  // gentle rounding, hairline separated.
  accordion: {
    text: hydroQuebecColor.ink.primary, // #1a1a1a summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // rows are flush to the column
    fontSize: "0.875rem", // 14px
    fontWeight: "500", // mid-weight sans
    lineHeight: "1.25rem" // 20px
  },
  // Hydro-Québec tag: a small soft pale-blue chip with full pill rounding.
  tag: {
    radius: "999px", // pill (institutional pill tags)
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: hydroQuebecColor.grey.subtle, // #eef1f8 subtle fill
    neutralText: hydroQuebecColor.ink.primary // #1a1a1a
  },
  // Hydro-Québec badge: a small filled badge — deep-indigo fill / white text,
  // gentle 4px rounding.
  badge: {
    radius: "4px", // institutional rounding
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "none", // sentence case (institutional)
    minHeight: "1.25rem", // 20px
    infoBackground: hydroQuebecColor.indigo, // #0f096c deep-indigo info badge
    infoText: hydroQuebecColor.white // white on indigo
  },
  // Hydro-Québec checkbox/radio label: small ink sans.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: hydroQuebecColor.ink.primary // #1a1a1a
  },
  // Hydro-Québec search input: a boxed cool hairline field, sans type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Hydro-Québec toggle / switch label: small ink sans.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: hydroQuebecColor.ink.primary // #1a1a1a
  }
} as const;

// --- semantic (Hydro-Québec-specific role mapping) --------------------------
const semantic = {
  surface: {
    default: hydroQuebecColor.white, // #ffffff white
    subtle: hydroQuebecColor.grey.subtle, // #eef1f8 subtle fill surface
    raised: hydroQuebecColor.white, // #ffffff white
    inverse: hydroQuebecColor.indigo, // #0f096c deep-indigo inverse band (brand band tone)
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop — black @50%
  },
  text: {
    primary: hydroQuebecColor.ink.primary, // #1a1a1a (measured near-black body text)
    secondary: hydroQuebecColor.ink.secondary, // #555a66
    muted: hydroQuebecColor.ink.muted, // #8a90a0
    inverse: hydroQuebecColor.white, // white on indigo / dark surfaces
    link: hydroQuebecColor.brightBlue // #104cce — functional bright-blue links
  },
  border: {
    subtle: hydroQuebecColor.grey.border, // #d3d9ea light hairline (field / divider)
    strong: hydroQuebecColor.ink.muted, // #8a90a0 stronger border
    interactive: hydroQuebecColor.indigo // #0f096c focus / interactive
  },
  action: {
    primary: hydroQuebecColor.indigo, // #0f096c primary button (the deep-indigo CTA)
    primaryHover: hydroQuebecColor.indigoHover, // #0a0650 darker indigo on hover
    primaryText: hydroQuebecColor.white, // white text on indigo
    secondary: hydroQuebecColor.grey.subtle, // #eef1f8 secondary surface
    secondaryHover: hydroQuebecColor.grey.border, // #d3d9ea
    secondaryText: hydroQuebecColor.ink.primary, // #1a1a1a
    danger: hydroQuebecColor.system.danger // #d72020
  },
  feedback: {
    success: hydroQuebecColor.system.success,
    warning: hydroQuebecColor.system.warning,
    error: hydroQuebecColor.system.danger,
    info: hydroQuebecColor.system.info
  },
  status: {
    pending: hydroQuebecColor.system.warning,
    processing: hydroQuebecColor.system.info,
    completed: hydroQuebecColor.system.success,
    failed: hydroQuebecColor.system.danger
  },
  // Categorical data-vis palette. Hydro-Québec publishes no data-vis scale; this
  // is a coherent proposal led by the three measured brand hues (deep indigo,
  // amber accent, bright blue), then cool greys and the restrained system hues
  // (see MAPPING.md, "à confirmer" beyond the first three — not an official
  // scale).
  data: {
    category1: hydroQuebecColor.indigo, // #0f096c deep indigo (brand)
    category2: hydroQuebecColor.amber, // #ff9b00 amber accent
    category3: hydroQuebecColor.brightBlue, // #104cce bright blue
    category4: hydroQuebecColor.ink.secondary, // #555a66 cool grey
    category5: hydroQuebecColor.ink.muted, // #8a90a0 muted grey
    category6: hydroQuebecColor.system.danger, // #d72020 red (à confirmer)
    category7: hydroQuebecColor.system.success, // green (à confirmer)
    category8: hydroQuebecColor.grey.border // #d3d9ea light grey (à confirmer)
  }
} as const;

/**
 * The Hydro-Québec theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Hydro-Québec-specific (deep-indigo
 * / amber institutional) values, and the `component` layer is REBUILT from this
 * theme's own semantic/foundation via `createComponent` — so Hydro-Québec's
 * indigo-on-white identity reaches the components (buttons, tabs, pagination,
 * chat bubbles…), not just the elements that read semantic vars directly.
 */
export const hydroQuebecTheme: TenantTheme = {
  id: "hydro-quebec",
  label: "Hydro-Québec",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default hydroQuebecTheme;
