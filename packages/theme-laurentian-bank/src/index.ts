import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Banque Laurentienne / Laurentian Bank (banquelaurentienne.ca — the Montréal
 * bank founded in 1846) theme for the Sentropic token structure.
 *
 * Laurentian publishes no public design-token file; the values below are
 * MEASURED from the live site's computed CSS (https://www.banquelaurentienne.ca,
 * inspected in a real browser). We only reference the font *names* here
 * ("Verdana, Arial, Helvetica, sans-serif" — the measured web-safe system sans
 * the bank sets its UI in), never font binaries. Sources and the full mapping
 * table are in MAPPING.md.
 *
 * Laurentian's identity is a BLUE + NAVY banking system with a GOLD accent: a
 * Laurentian-blue primary CTA (#0068b8) deepening to navy on hover (#004070),
 * a darker navy (#003054) for emphasis bands and inverse surfaces, a warm gold
 * (#fdb813) as the single decorative accent, and a light-blue tint (#9fd5fc)
 * for soft fills/illustration. Body text is a soft near-black on white over a
 * cool blue-grey structure (subtle #f2f6fb, borders #cfdcea). Feedback uses a
 * legible red (#d72020). Where Sentropic needs a role Laurentian never colours,
 * the closest measured value is used and noted "à confirmer" in MAPPING.md.
 *
 * Laurentian colour reference (measured, light theme):
 *   Laurentian blue (action / CTA / link)  #0068b8   rgb(0,104,184) primary CTA
 *   Blue hover (CTA pressed)                #004070   rgb(0,64,112) deep hover
 *   Navy (emphasis / inverse band)          #003054   rgb(0,48,84) navy band/footer
 *   Gold accent                             #fdb813   rgb(253,184,19) warm accent
 *   Light-blue tint                         #9fd5fc   rgb(159,213,252) soft fill
 *   White (surface default)                 #ffffff   page background
 *   Ink — primary text                      #1a1a1a   rgb(26,26,26) near-black body
 *   Secondary text                          #555a63   rgb(85,90,99) cool grey
 *   Subtle fill surface                     #f2f6fb   rgb(242,246,251) cool blue-grey
 *   Subtle / field border                   #cfdcea   rgb(207,220,234) cool hairline
 *   Danger / error                          #d72020   rgb(215,32,32) legible red
 */

// --- Laurentian raw colour palette (measured from live computed CSS) --------
const laurentianColor = {
  // The Laurentian-blue primary "brand" — used for the primary call-to-action,
  // links, active tabs/pagination/breadcrumb and the focus outline.
  blue: "#0068b8", // rgb(0,104,184) — Laurentian-blue primary CTA (measured)
  // The CTA deepens toward navy on hover/press.
  blueHover: "#004070", // rgb(0,64,112) — deep blue hover (measured)
  // Navy — the bank's emphasis band / footer / inverse surface tone.
  navy: "#003054", // rgb(0,48,84) — navy emphasis / inverse surface (measured)
  // Gold — the single warm decorative accent (rule, highlight, illustration).
  gold: "#fdb813", // rgb(253,184,19) — gold accent (measured)
  // Light-blue tint — soft fills / illustration backgrounds.
  lightBlue: "#9fd5fc", // rgb(159,213,252) — light-blue tint (measured)
  white: "#ffffff", // page background — surface default
  // Cool ink scale (each value measured from a real element). Body text is a
  // soft near-black (#1a1a1a), secondary copy a cool blue-grey (#555a63).
  ink: {
    primary: "#1a1a1a", // rgb(26,26,26) — body text colour (measured)
    secondary: "#555a63", // rgb(85,90,99) — secondary text (measured)
    muted: "#8a8f99" // muted text (à confirmer — no exact measured equivalent)
  },
  // Neutral surface / line greys (cool, blue-tinted to match the banking look).
  grey: {
    subtle: "#f2f6fb", // rgb(242,246,251) — subtle cool fill surface (measured)
    border: "#cfdcea" // rgb(207,220,234) — subtle / field cool hairline (measured)
  },
  // System / feedback hues. The danger red is measured from the site's error /
  // form-validation accent; success/warning/info have no measured Laurentian
  // equivalent and are restrained, legible (WCAG AA on white) values flagged
  // "à confirmer" in MAPPING.md.
  system: {
    danger: "#d72020", // rgb(215,32,32) — error / danger accent (measured)
    success: "#1e7d34", // muted green — à confirmer (no Laurentian source)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#0068b8" // Laurentian would use its blue for info — à confirmer
  }
} as const;

// --- foundation (Laurentian-specific values) --------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (action / primary / link) maps onto the
    // measured Laurentian-blue → navy scale — the primary action IS Laurentian
    // blue, deepening to navy.
    blue: {
      10: laurentianColor.grey.subtle, // #f2f6fb lightest cool tint
      60: laurentianColor.blue, // #0068b8 primary action (Laurentian blue)
      80: laurentianColor.navy // #003054 darkest emphasis (navy)
    },
    // Sentropic "cyan" accent slot maps onto the light-blue tint → blue —
    // Laurentian's nearest decorative cool accent.
    cyan: {
      10: laurentianColor.grey.subtle, // #f2f6fb light cool tint
      50: laurentianColor.lightBlue, // #9fd5fc light-blue tint accent
      70: laurentianColor.blue // #0068b8
    },
    // Sentropic "slate" role family mapped onto the Laurentian cool ink/grey
    // scale.
    slate: {
      0: laurentianColor.white, // #ffffff white
      10: laurentianColor.grey.subtle, // #f2f6fb subtle cool fill surface
      20: laurentianColor.grey.border, // #cfdcea cool hairline / subtle border
      60: laurentianColor.ink.secondary, // #555a63 secondary text
      80: laurentianColor.ink.primary, // #1a1a1a primary text (near-black)
      90: laurentianColor.navy // #003054 darkest (navy)
    },
    feedback: {
      success: laurentianColor.system.success,
      warning: laurentianColor.system.warning,
      error: laurentianColor.system.danger,
      info: laurentianColor.system.info
    }
  },
  // Laurentian sets its UI in the web-safe system sans — measured
  // "Verdana, Arial, Helvetica, sans-serif" across headings and body. We
  // reference the *names* only (Verdana is a web-safe system font; no binary).
  // Mono is not part of Laurentian — the Sentropic mono stack is kept.
  font: {
    sans: "Verdana, Arial, Helvetica, sans-serif",
    display: "Verdana, Arial, Helvetica, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. Laurentian's raw spacing steps are not strongly
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
  // Laurentian rounding is CORPORATE — measured square edges on the smallest
  // controls, a modest 4px on buttons/inputs/tabs and 8px on cards. Not pill,
  // not heavily rounded. (pill kept at 999px for tags/chips.)
  radius: {
    none: "0", // square slot
    sm: "0", // smallest controls — square (measured)
    md: "4px", // button / input / tabs — modest 4px (measured)
    lg: "8px", // cards — 8px (measured)
    pill: "999px" // tags / pills
  },
  // Laurentian elevation is restrained corporate — soft, low, cool shadows on
  // raised elements over hairlines and whitespace ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 48 84 / 0.06)",
    medium: "0 4px 12px rgb(0 48 84 / 0.10)",
    floating: "0 8px 24px rgb(0 48 84 / 0.14)"
  },
  // Laurentian animates with short, standard eases (measured ≈ 150ms
  // transitions). Durations not fully tokenised publicly; kept aligned with the
  // base.
  motion: {
    fast: "120ms",
    normal: "150ms", // measured button transition duration
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Laurentian-specific; kept aligned with the Sentropic
  // base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Laurentian) -------------------------------------
  // Laurentian borders are thin cool blue-grey hairlines (#cfdcea @1px). Encoded
  // as 1px thin / 2px thick.
  borderWidth: {
    none: "0",
    thin: "1px", // Laurentian cool hairline (#cfdcea)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Laurentian control density. Measured CTA buttons sit ~44px tall with
  // generous horizontal padding; nav/body text is mid-sized sans. md targets a
  // ~44px touch height; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // Laurentian typography = the Verdana system sans. Control labels are
  // mid-weight; body/field text is sentence case. CTAs are sentence case (not
  // tracked uppercase — measured plain on the live buttons).
  typography: {
    control: { family: "Verdana, Arial, Helvetica, sans-serif", size: "0.9375rem", weight: "600", lineHeight: "1.2", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "Verdana, Arial, Helvetica, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "Verdana, Arial, Helvetica, sans-serif", size: "0.875rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Laurentian links are Laurentian-blue at rest; hover affordance is an
    // underline.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // Laurentian dims disabled controls
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // Laurentian FOCUS = a crisp blue OUTLINE (~2px solid #0068b8). We encode the
  // blue outline strategy.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: laurentianColor.blue, // #0068b8 — Laurentian focuses in its blue
    inset: "0"
  },
  // Laurentian form fields are BOXED (outline): a white fill with a thin cool
  // blue-grey hairline border and a modest 4px radius. `style: "outline"` makes
  // the builder draw four equal borders from `surface.default` + `border.subtle`.
  // Measured input/select border = #cfdcea @1px hairline.
  field: {
    style: "outline",
    fillBg: laurentianColor.white, // #ffffff
    underlineColor: laurentianColor.grey.border, // #cfdcea (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the Laurentian blue with a 40px
    // right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%230068b8' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Laurentian cards: 8px rounding, a thin cool hairline rather than a heavy
  // box, with a faint cool hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: laurentianColor.grey.subtle // #f2f6fb faint cool hover tint
  },
  // Laurentian secondary button = a soft cool-grey filled chip (light #f2f6fb
  // fill, ink text, slightly darker cool grey on hover) — the quiet alternative
  // to the filled blue primary.
  buttonSecondary: {
    background: laurentianColor.grey.subtle, // #f2f6fb soft cool fill
    border: laurentianColor.grey.border, // #cfdcea cool hairline
    hoverBackground: laurentianColor.grey.border // #cfdcea on hover
  },
  // Laurentian tabs / sub-nav: active tab = blue label with a blue bottom
  // underline (the indicator), transparent fill.
  tabs: {
    activeText: laurentianColor.blue, // #0068b8 active tab text
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
  // Laurentian pagination: borderless ink text links; active page = filled blue
  // box with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: laurentianColor.ink.primary, // #1a1a1a link text
    activeBackground: laurentianColor.blue, // #0068b8 filled active page
    activeText: laurentianColor.white, // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // Laurentian breadcrumb: ink links, grey trail, blue current page, grey
  // separators — all Verdana type.
  breadcrumb: {
    linkText: laurentianColor.ink.primary, // #1a1a1a
    text: laurentianColor.ink.secondary, // #555a63 trail text
    currentText: laurentianColor.blue, // #0068b8 current page
    separator: laurentianColor.ink.secondary, // #555a63
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.125rem", // 18px
    currentWeight: "600" // current page is emphasised
  },
  // Laurentian notice / alert: a box with a coloured left filet on a faint cool
  // fill. The severity accent is a slim left bar.
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
  // Laurentian accordion / disclosure: an ink, semi-bold sans summary trigger,
  // gentle rounding, hairline separated.
  accordion: {
    text: laurentianColor.ink.primary, // #1a1a1a summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // rows are flush to the column
    fontSize: "0.875rem", // 14px
    fontWeight: "600", // semi-bold sans
    lineHeight: "1.25rem" // 20px
  },
  // Laurentian tag: a small soft cool-grey chip with modest rounding.
  tag: {
    radius: "4px", // modest rounding (matches md)
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "400",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: laurentianColor.grey.subtle, // #f2f6fb subtle cool fill
    neutralText: laurentianColor.ink.primary // #1a1a1a
  },
  // Laurentian badge: a small filled badge — blue fill / white text, modest 4px
  // rounding.
  badge: {
    radius: "4px", // modest rounding
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "none", // Laurentian labels are sentence case
    minHeight: "1.25rem", // 20px
    infoBackground: laurentianColor.blue, // #0068b8 (Laurentian "info" = blue)
    infoText: laurentianColor.white // white on blue
  },
  // Laurentian checkbox/radio label: small ink sans.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: laurentianColor.ink.primary // #1a1a1a
  },
  // Laurentian search input: a boxed cool hairline field, sans type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Laurentian toggle / switch label: small ink sans.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: laurentianColor.ink.primary // #1a1a1a
  }
} as const;

// --- semantic (Laurentian-specific role mapping) ----------------------------
const semantic = {
  surface: {
    default: laurentianColor.white, // #ffffff white
    subtle: laurentianColor.grey.subtle, // #f2f6fb subtle cool fill surface
    raised: laurentianColor.white, // #ffffff white
    inverse: laurentianColor.navy, // #003054 navy inverse surface (band/footer)
    overlay: "rgb(0 48 84 / 0.5)" // modal backdrop — navy @50%
  },
  text: {
    primary: laurentianColor.ink.primary, // #1a1a1a (measured near-black body)
    secondary: laurentianColor.ink.secondary, // #555a63 cool grey
    muted: laurentianColor.ink.muted, // #8a8f99 (à confirmer)
    inverse: laurentianColor.white, // white on navy / dark surfaces
    link: laurentianColor.blue // #0068b8 — Laurentian links are blue
  },
  border: {
    subtle: laurentianColor.grey.border, // #cfdcea cool hairline (field / divider)
    strong: laurentianColor.ink.secondary, // #555a63 stronger border
    interactive: laurentianColor.blue // #0068b8 focus / interactive
  },
  action: {
    primary: laurentianColor.blue, // #0068b8 primary button (Laurentian-blue CTA)
    primaryHover: laurentianColor.blueHover, // #004070 deep blue on hover (measured)
    primaryText: laurentianColor.white, // white text on blue
    secondary: laurentianColor.grey.subtle, // #f2f6fb secondary surface
    secondaryHover: laurentianColor.grey.border, // #cfdcea
    secondaryText: laurentianColor.ink.primary, // #1a1a1a
    danger: laurentianColor.system.danger // #d72020
  },
  feedback: {
    success: laurentianColor.system.success,
    warning: laurentianColor.system.warning,
    error: laurentianColor.system.danger,
    info: laurentianColor.system.info
  },
  status: {
    pending: laurentianColor.system.warning,
    processing: laurentianColor.system.info,
    completed: laurentianColor.system.success,
    failed: laurentianColor.system.danger
  },
  // Categorical data-vis palette. Laurentian publishes no data-vis scale; this
  // is a coherent proposal built from the measured brand hues — blue, navy and
  // gold lead, then cool greys and the restrained system hues (see MAPPING.md,
  // "à confirmer" — not an official scale).
  data: {
    category1: laurentianColor.blue, // #0068b8 Laurentian blue
    category2: laurentianColor.navy, // #003054 navy
    category3: laurentianColor.gold, // #fdb813 gold accent
    category4: laurentianColor.ink.secondary, // #555a63 cool grey
    category5: laurentianColor.grey.border, // #cfdcea light cool grey
    category6: laurentianColor.system.danger, // restrained red (à confirmer)
    category7: laurentianColor.system.success, // restrained green (à confirmer)
    category8: laurentianColor.system.warning // restrained amber (à confirmer)
  }
} as const;

/**
 * The Laurentian Bank theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Laurentian-specific (blue + navy
 * with gold accent, Verdana) values, and the `component` layer is REBUILT from
 * this theme's own semantic/foundation via `createComponent` — so Laurentian's
 * blue-on-white banking identity reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const laurentianBankTheme: TenantTheme = {
  id: "laurentian-bank",
  label: "Banque Laurentienne",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default laurentianBankTheme;
