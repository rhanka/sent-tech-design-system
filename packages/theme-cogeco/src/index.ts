import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Cogeco (cogeco.com — Cogeco Inc., the Québec-based telecommunications &
 * media group) theme for the Sentropic token structure.
 *
 * Cogeco publishes no public design-token file; the values below are MEASURED
 * from the live corporate site's computed CSS (https://corpo.cogeco.com,
 * inspected in a real browser). The site is heavily JS-rendered, so the font
 * stack in particular is INFERRED and flagged "à confirmer" throughout. We only
 * ever reference the font *names* here, never font binaries. Sources and the
 * full mapping table are in MAPPING.md.
 *
 * Cogeco's identity is a CORPORATE TELECOM system: a deep, confident navy as the
 * primary brand colour (CTAs, the masthead band, inverse surfaces) warmed by a
 * single CORAL accent reserved for data highlights and emphasis. Body text is a
 * near-black ink on white, structure is drawn with cool blue-greys, and feedback
 * states use restrained, AA-legible system hues. Modern, gently-rounded controls
 * (6px on inputs/buttons, 12px on cards) with a crisp navy focus outline.
 *
 * Cogeco colour reference (measured, light theme):
 *   Deep navy (action / CTA / inverse)   #001e62   measured primary navy (theme-color #ffffff)
 *   Navy hover                           #00154a   darker navy on hover/press
 *   White (surface default)              #ffffff   page background
 *   Coral (accent / data / highlight)    #ff6d70   measured warm coral accent
 *   Ink — primary text                   #1a1a1a   near-black body text
 *   Secondary text                       #555a66   cool blue-grey secondary
 *   Muted text                           #8a90a0   cool blue-grey muted
 *   Subtle fill surface                  #f4f5f8   light cool fill
 *   Subtle / field border                #d7dbe2   light cool hairline
 *   Danger / error                       #d72020   measured red feedback accent
 */

// --- Cogeco raw colour palette (measured from live computed CSS) ------------
const cogecoColor = {
  // The brand / CTA colour is a deep, confident navy. Cogeco uses it for the
  // primary call-to-action, the masthead band and inverse surfaces.
  navy: "#001e62", // CTA fill / masthead / inverse surface (measured deep navy)
  navyHover: "#00154a", // darker navy on hover / press (measured)
  white: "#ffffff", // page background — surface default
  // The single warm accent: a coral reserved for data highlights and emphasis.
  coral: "#ff6d70", // measured warm coral accent (data / highlight)
  // Cool ink scale (measured from real elements). Body text is a near-black ink.
  ink: {
    primary: "#1a1a1a", // near-black body text (measured)
    secondary: "#555a66", // cool blue-grey secondary text (measured)
    muted: "#8a90a0" // cool blue-grey muted text (measured)
  },
  // Neutral cool surface / line greys.
  grey: {
    subtle: "#f4f5f8", // light cool fill surface (measured)
    border: "#d7dbe2" // light cool hairline border (measured)
  },
  // Feedback hues. The danger red is MEASURED from the live error/alert accent;
  // success / warning / info have no measured Cogeco source and are restrained,
  // AA-legible system colours chosen to sit calmly against the navy/coral brand
  // (all "à confirmer" except danger).
  system: {
    danger: "#d72020", // measured red — error / danger accent
    success: "#1f7a40", // muted green — à confirmer (no Cogeco source)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#001e62" // Cogeco would use its brand navy, not a generic blue — à confirmer
  }
} as const;

// --- foundation (Cogeco-specific values) ------------------------------------
const foundation = {
  color: {
    // The Sentropic "blue" role family (action / primary / link) maps onto
    // Cogeco's brand navy — the primary action IS the deep navy.
    blue: {
      10: cogecoColor.grey.subtle, // #f4f5f8 lightest cool tint
      60: cogecoColor.navy, // #001e62 primary action (Cogeco navy CTA)
      80: cogecoColor.navyHover // #00154a darker navy step
    },
    // The Sentropic "cyan" accent slot carries Cogeco's measured CORAL accent —
    // the one warm highlight in the system.
    cyan: {
      10: cogecoColor.grey.subtle, // #f4f5f8 light cool tint
      50: cogecoColor.coral, // #ff6d70 measured coral accent
      70: cogecoColor.navy // #001e62 navy as the deep end of the accent ramp
    },
    // Sentropic "slate" role family mapped onto Cogeco's cool ink/grey scale.
    slate: {
      0: cogecoColor.white, // #ffffff white
      10: cogecoColor.grey.subtle, // #f4f5f8 subtle cool fill surface
      20: cogecoColor.grey.border, // #d7dbe2 hairline / subtle border
      60: cogecoColor.ink.secondary, // #555a66 secondary text
      80: cogecoColor.ink.primary, // #1a1a1a primary text (near-black)
      90: cogecoColor.navy // #001e62 darkest brand anchor (navy)
    },
    feedback: {
      success: cogecoColor.system.success,
      warning: cogecoColor.system.warning,
      error: cogecoColor.system.danger,
      info: cogecoColor.system.info
    }
  },
  // Cogeco's corporate site is JS-rendered, so the exact font stack could not be
  // read with confidence — the measured/typical stack is an Inter-led sans with
  // Helvetica/Arial fallbacks ("à confirmer"). We reference the *names* only.
  // Mono is not part of Cogeco — the Sentropic / Simons mono stack is kept.
  font: {
    sans: "'Inter', Helvetica, Arial, sans-serif", // à confirmer (JS-rendered site)
    display: "'Inter', Helvetica, Arial, sans-serif", // à confirmer (JS-rendered site)
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. Cogeco's raw spacing steps are not strongly
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
  // Cogeco uses MODERN rounding — gentle on controls (~6px on buttons/inputs)
  // and softer on cards (~12px). Not square, not pill. (Exact steps à confirmer;
  // pill kept at 999px for completeness.)
  radius: {
    none: "0", // square slot
    sm: "2px", // smallest controls — tiny rounding
    md: "6px", // button / input / tabs — modern 6px (measured)
    lg: "12px", // cards — soft 12px (measured)
    pill: "999px" // tags / pills
  },
  // Cogeco elevation is restrained corporate — soft, low shadows on raised
  // elements over hairlines and whitespace. Kept conservative and navy-tinted
  // ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 30 98 / 0.06)",
    medium: "0 4px 12px rgb(0 30 98 / 0.10)",
    floating: "0 8px 24px rgb(0 30 98 / 0.14)"
  },
  // Cogeco animates with short, standard eases (≈ 150ms transitions). Durations
  // not fully tokenised publicly; kept aligned with the base.
  motion: {
    fast: "120ms",
    normal: "150ms", // measured button transition duration (à confirmer)
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Cogeco-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Cogeco) -----------------------------------------
  // Cogeco borders are thin LIGHT COOL-GREY hairlines (#d7dbe2 @1px). Encoded as
  // 1px thin / 2px thick.
  borderWidth: {
    none: "0",
    thin: "1px", // Cogeco hairline (#d7dbe2)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Cogeco control density. CTA buttons sit ~44px tall with generous horizontal
  // padding; nav/body text is mid-sized sans. md targets a ~44px touch height;
  // sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // Cogeco typography = the inferred Inter-led sans. Control labels are mid-weight
  // sans; body/field text is sentence case. (Letter-spacing / transform à
  // confirmer — defaults kept conservative.)
  typography: {
    control: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "600", lineHeight: "1.2", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Cogeco links are navy at rest; the hover affordance is an underline.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // Cogeco dims disabled controls
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // Cogeco FOCUS = a crisp navy OUTLINE (~2px solid #001e62). We encode the
  // navy outline strategy.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: cogecoColor.navy, // #001e62 — Cogeco focuses in brand navy
    inset: "0"
  },
  // Cogeco form fields are BOXED (outline): a white fill with a thin cool-grey
  // hairline border and a gentle 6px radius. `style: "outline"` makes the builder
  // draw four equal borders from `surface.default` + `border.subtle`. Measured
  // input/select border = #d7dbe2 @1px hairline.
  field: {
    style: "outline",
    fillBg: cogecoColor.white, // #ffffff
    underlineColor: cogecoColor.grey.border, // #d7dbe2 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the secondary ink with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23555a66' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cogeco cards: modern 12px rounding, a thin cool-grey hairline rather than a
  // heavy box, with a faint hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: cogecoColor.grey.subtle // #f4f5f8 faint hover tint
  },
  // Cogeco secondary button = a soft cool-grey filled chip (light #f4f5f8 fill,
  // ink text, slightly darker grey on hover) — the quiet alternative to the
  // filled navy primary.
  buttonSecondary: {
    background: cogecoColor.grey.subtle, // #f4f5f8 soft fill
    border: cogecoColor.grey.border, // #d7dbe2 light hairline
    hoverBackground: cogecoColor.grey.border // #d7dbe2 on hover
  },
  // Cogeco tabs / sub-nav: active tab = navy label with a navy bottom underline
  // (the indicator), transparent fill.
  tabs: {
    activeText: cogecoColor.navy, // #001e62
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem", // 18px
    indicatorSide: "bottom", // navy underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline (not a box-shadow filet)
  },
  // Cogeco pagination: borderless navy text links; active page = filled navy box
  // with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: cogecoColor.navy, // #001e62 link text
    activeBackground: cogecoColor.navy, // #001e62 filled active page
    activeText: cogecoColor.white, // white on navy
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // Cogeco breadcrumb: navy links, grey trail, navy current page, grey
  // separators — all sans type.
  breadcrumb: {
    linkText: cogecoColor.navy, // #001e62
    text: cogecoColor.ink.secondary, // #555a66 trail text
    currentText: cogecoColor.navy, // #001e62 current page
    separator: cogecoColor.ink.muted, // #8a90a0
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.125rem", // 18px
    currentWeight: "600" // current page is emphasised
  },
  // Cogeco notice / alert: a minimal box — a thin coloured left filet on a white
  // box, no fill. The severity accent is a slim left bar.
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
  // Cogeco accordion / disclosure: an ink, medium-weight sans summary trigger,
  // gentle rounding, hairline separated.
  accordion: {
    text: cogecoColor.ink.primary, // #1a1a1a summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // rows are flush to the column
    fontSize: "0.875rem", // 14px
    fontWeight: "500", // medium weight sans
    lineHeight: "1.25rem" // 20px
  },
  // Cogeco tag: a small soft cool-grey chip with gentle rounding.
  tag: {
    radius: "6px", // gentle rounding (matches md)
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: cogecoColor.grey.subtle, // #f4f5f8 subtle fill
    neutralText: cogecoColor.ink.primary // #1a1a1a
  },
  // Cogeco badge: a small filled badge — navy fill / white text, gentle rounding.
  badge: {
    radius: "6px", // gentle rounding
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: cogecoColor.navy, // #001e62 (Cogeco "info" = brand navy)
    infoText: cogecoColor.white // white on navy
  },
  // Cogeco checkbox/radio label: small ink sans.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: cogecoColor.ink.primary // #1a1a1a
  },
  // Cogeco search input: a boxed light cool hairline field, sans type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Cogeco toggle / switch label: small ink sans.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: cogecoColor.ink.primary // #1a1a1a
  }
} as const;

// --- semantic (Cogeco-specific role mapping) --------------------------------
const semantic = {
  surface: {
    default: cogecoColor.white, // #ffffff white
    subtle: cogecoColor.grey.subtle, // #f4f5f8 subtle cool fill surface
    raised: cogecoColor.white, // #ffffff white
    inverse: cogecoColor.navy, // #001e62 deep-navy inverse surface (masthead band tone)
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop — black @50%
  },
  text: {
    primary: cogecoColor.ink.primary, // #1a1a1a (measured near-black body text)
    secondary: cogecoColor.ink.secondary, // #555a66
    muted: cogecoColor.ink.muted, // #8a90a0
    inverse: cogecoColor.white, // white on navy / dark surfaces
    link: cogecoColor.navy // #001e62 — Cogeco links are brand navy
  },
  border: {
    subtle: cogecoColor.grey.border, // #d7dbe2 light cool hairline (field / divider)
    strong: cogecoColor.ink.muted, // #8a90a0 stronger border
    interactive: cogecoColor.navy // #001e62 focus / interactive
  },
  action: {
    primary: cogecoColor.navy, // #001e62 primary button (the navy CTA)
    primaryHover: cogecoColor.navyHover, // #00154a darker navy on hover
    primaryText: cogecoColor.white, // white text on navy
    secondary: cogecoColor.grey.subtle, // #f4f5f8 secondary surface
    secondaryHover: cogecoColor.grey.border, // #d7dbe2
    secondaryText: cogecoColor.ink.primary, // #1a1a1a
    danger: cogecoColor.system.danger // #d72020
  },
  feedback: {
    success: cogecoColor.system.success,
    warning: cogecoColor.system.warning,
    error: cogecoColor.system.danger,
    info: cogecoColor.system.info
  },
  status: {
    pending: cogecoColor.system.warning,
    processing: cogecoColor.system.info,
    completed: cogecoColor.system.success,
    failed: cogecoColor.system.danger
  },
  // Categorical data-vis palette. Cogeco publishes no data-vis scale; this is a
  // coherent proposal anchored on the brand pair (navy + coral) then extended
  // with the cool greys and the restrained system hues, drawn to honour the
  // corporate identity (see MAPPING.md, "à confirmer" — not an official scale).
  data: {
    category1: cogecoColor.navy, // #001e62 brand navy
    category2: cogecoColor.coral, // #ff6d70 brand coral accent
    category3: cogecoColor.ink.secondary, // #555a66 cool grey
    category4: cogecoColor.ink.muted, // #8a90a0 cool grey
    category5: cogecoColor.grey.border, // #d7dbe2 light cool
    category6: cogecoColor.system.success, // restrained green (à confirmer)
    category7: cogecoColor.system.warning, // restrained amber (à confirmer)
    category8: cogecoColor.system.danger // restrained red (à confirmer)
  }
} as const;

/**
 * The Cogeco theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Cogeco-specific (deep-navy + coral telecom)
 * values, and the `component` layer is REBUILT from this theme's own semantic/
 * foundation via `createComponent` — so Cogeco's navy-on-white identity reaches
 * the components (buttons, tabs, pagination, chat bubbles…), not just the
 * elements that read semantic vars directly.
 */
export const cogecoTheme: TenantTheme = {
  id: "cogeco",
  label: "Cogeco",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default cogecoTheme;
