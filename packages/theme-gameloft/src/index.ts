import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Gameloft (gameloft.com — the Montréal-founded mobile-game studio, part of
 * Vivendi) theme for the Sentropic token structure.
 *
 * Gameloft publishes no design-token file; the values below are MEASURED from
 * the live site's computed CSS (https://www.gameloft.com, inspected in a real
 * browser). We only reference the font *names* here (the measured "Montserrat
 * Variable" / "'Montserrat', Helvetica, Arial, sans-serif" geometric sans the
 * site uses for its modern gaming tone), never font binaries. Sources and the
 * full mapping table are in MAPPING.md.
 *
 * Gameloft's identity is a MODERN BLUE GAMING system: a bright, saturated brand
 * blue (#0095f3, the dominant measured CTA colour — 30+ occurrences) driving
 * every call-to-action, link, tab and active state; a lighter sky-blue accent
 * (#2eaeff) as the secondary hue; near-black ink (#1a1a1a) on white for body
 * text; and a dark gaming canvas (#1a1a1a; the site's theme-color meta is pure
 * #000000) for inverse surfaces. Greys are clean and modern; rounding is
 * contemporary (square small controls, 4px buttons/inputs, 8px cards). Where
 * Sentropic needs a role Gameloft never colours (feedback states beyond the
 * brand blue and the danger red), a restrained system colour is used and the
 * choice is noted "à confirmer" in MAPPING.md.
 *
 * Gameloft colour reference (measured, light theme):
 *   Brand blue (action / CTA / link)   #0095f3   rgb(0,149,243) dominant CTA blue
 *   Brand blue hover                   #007ac4   darker hover state
 *   Sky-blue accent (secondary)        #2eaeff   rgb(46,174,255) lighter accent
 *   White (surface default)            #ffffff   page background
 *   Ink — primary text                 #1a1a1a   rgb(26,26,26) near-black body text
 *   Secondary text                     #5f5f5f   rgb(95,95,95)
 *   Muted text                         #989898   rgb(152,152,152)
 *   Subtle fill surface                #f4f4f4   rgb(244,244,244) light fill
 *   Subtle / field border              #d9d9d9   rgb(217,217,217) light hairline
 *   Danger / error red                 #e02424   rgb(224,36,36) error accent
 *   Dark gaming canvas (inverse)       #1a1a1a   rgb(26,26,26) (theme-color #000000)
 */

// --- Gameloft raw colour palette (measured from live computed CSS) ----------
const gameloftColor = {
  // The brand / CTA colour is a bright, saturated blue. Gameloft uses it for the
  // primary call-to-action, links, tabs, pagination and every active indicator.
  blue: {
    primary: "#0095f3", // rgb(0,149,243) — dominant CTA / brand blue (measured, 30+ occurrences)
    hover: "#007ac4", // darker hover state for the primary blue
    accent: "#2eaeff" // rgb(46,174,255) — lighter sky-blue secondary accent
  },
  white: "#ffffff", // page background — surface default
  // Modern ink scale (each value measured from a real element). Gameloft sets
  // body text in a near-black (#1a1a1a), not pure #000.
  ink: {
    // Primary body text — a crisp near-black.
    primary: "#1a1a1a", // rgb(26,26,26) — body text colour (measured)
    // Secondary text & strong borders.
    secondary: "#5f5f5f", // rgb(95,95,95) — secondary text (measured)
    // Muted text.
    muted: "#989898" // rgb(152,152,152) — muted text (measured)
  },
  // Neutral surface / line greys.
  grey: {
    subtle: "#f4f4f4", // rgb(244,244,244) — subtle fill surface (measured)
    border: "#d9d9d9" // rgb(217,217,217) — subtle / field hairline border (measured)
  },
  // Gameloft's dark gaming canvas — used for inverse surfaces. The site's
  // theme-color meta is pure #000000; the measured dark surface tone reads
  // #1a1a1a, which we use as the inverse surface for legibility.
  canvas: "#1a1a1a", // rgb(26,26,26) — dark gaming canvas / inverse surface
  // Gameloft colours feedback chiefly with its brand blue (info) and a measured
  // danger red (#e02424). The remaining success/warning hues are restrained,
  // legible (WCAG AA on white) system colours chosen to sit alongside the modern
  // blue identity; they are "à confirmer" — Gameloft has no measured equivalent.
  system: {
    danger: "#e02424", // rgb(224,36,36) — error / danger accent (measured)
    success: "#2e7d32", // muted green — à confirmer (no Gameloft source)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#0095f3" // Gameloft "info" = its brand blue (measured)
  }
} as const;

// --- foundation (Gameloft-specific values) ----------------------------------
const foundation = {
  color: {
    // The Sentropic "blue" role family (action / primary / link) maps directly
    // onto Gameloft's measured brand-blue scale — the Gameloft primary action IS
    // this bright blue.
    blue: {
      10: gameloftColor.grey.subtle, // #f4f4f4 lightest neutral tint
      60: gameloftColor.blue.primary, // #0095f3 primary action (Gameloft brand blue)
      80: gameloftColor.blue.hover // #007ac4 darker hover step
    },
    // Gameloft's secondary accent is the lighter sky-blue. The Sentropic "cyan"
    // accent slot maps onto it.
    cyan: {
      10: gameloftColor.grey.subtle, // #f4f4f4 light neutral tint
      50: gameloftColor.blue.accent, // #2eaeff lighter sky-blue accent
      70: gameloftColor.blue.primary // #0095f3 brand blue
    },
    // Sentropic "slate" role family mapped onto the Gameloft modern ink/grey
    // scale.
    slate: {
      0: gameloftColor.white, // #ffffff white
      10: gameloftColor.grey.subtle, // #f4f4f4 subtle fill surface
      20: gameloftColor.grey.border, // #d9d9d9 hairline / subtle border
      60: gameloftColor.ink.secondary, // #5f5f5f secondary text
      80: gameloftColor.ink.primary, // #1a1a1a primary text (near-black)
      90: gameloftColor.canvas // #1a1a1a darkest (dark gaming canvas)
    },
    feedback: {
      success: gameloftColor.system.success,
      warning: gameloftColor.system.warning,
      error: gameloftColor.system.danger,
      info: gameloftColor.system.info
    }
  },
  // Gameloft sets its UI in a modern geometric SANS — measured "Montserrat
  // Variable" / "'Montserrat', Helvetica, Arial, sans-serif" across headings and
  // body, giving the contemporary gaming tone. We reference the *names* only.
  // Mono is not part of Gameloft — the Sentropic mono stack is kept.
  font: {
    sans: "'Montserrat', Helvetica, Arial, sans-serif",
    display: "'Montserrat', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. Gameloft's grid is modern and roomy but its raw
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
  // Gameloft uses MODERN rounding — square on the smallest controls, a 4px radius
  // on buttons/inputs/tabs and 8px on cards; contemporary, not boxy, not pill.
  // (Exact steps à confirmer; pill kept at 999px for completeness.)
  radius: {
    none: "0", // square slot
    sm: "0", // smallest controls — square
    md: "4px", // button / input / tabs — modern 4px (measured)
    lg: "8px", // cards — modern 8px (measured)
    pill: "999px" // tags / pills
  },
  // Gameloft elevation is clean and modern — soft, low shadows on raised
  // elements over whitespace and hairlines. Kept conservative and black-tinted
  // ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.14)"
  },
  // Gameloft animates with short, standard eases (measured ≈ 150ms transitions).
  // Durations not fully tokenised publicly; kept aligned with the base.
  motion: {
    fast: "120ms",
    normal: "150ms", // measured button transition duration
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Gameloft-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Gameloft) ---------------------------------------
  // Gameloft borders are thin LIGHT-GREY hairlines (#d9d9d9 @1px). Encoded as 1px
  // thin / 2px thick.
  borderWidth: {
    none: "0",
    thin: "1px", // Gameloft hairline (#d9d9d9)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Gameloft control density. Measured CTA buttons sit ~44px tall with generous
  // horizontal padding; nav/body text is mid-sized sans. md targets a ~44px
  // touch height; sm/lg bracket it. (à confirmer exact steps.)
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // Gameloft typography = the modern geometric sans. Control labels are
  // mid-weight; body/field text is sentence case. CTAs are often UPPERCASE-
  // tracked on the live site (measured letter-spacing on the primary buttons).
  typography: {
    control: { family: "'Montserrat', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "600", lineHeight: "1.2", letterSpacing: "0.04em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Montserrat', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Montserrat', Helvetica, Arial, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.4", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Gameloft links are brand blue at rest; the hover affordance is an underline.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // Gameloft dims disabled controls
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // Gameloft FOCUS = a crisp brand-blue OUTLINE (~2px solid #0095f3). We encode
  // the blue outline strategy.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: gameloftColor.blue.primary, // #0095f3 — Gameloft focuses in its brand blue
    inset: "0"
  },
  // Gameloft form fields are BOXED (outline): a white fill with a thin light-grey
  // hairline border and a modern 4px radius. `style: "outline"` makes the builder
  // draw four equal borders from `surface.default` + `border.subtle`. Measured
  // input/select border = #d9d9d9 @1px hairline.
  field: {
    style: "outline",
    fillBg: gameloftColor.white, // #ffffff
    underlineColor: gameloftColor.grey.border, // #d9d9d9 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the near-black ink with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%231a1a1a' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Gameloft cards: modern 8px rounding, a thin light-grey hairline rather than a
  // heavy box, with a faint hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: gameloftColor.grey.subtle // #f4f4f4 faint hover tint
  },
  // Gameloft secondary button = a soft-grey filled chip (light #f4f4f4 fill, ink
  // text, slightly darker grey on hover) — the quiet alternative to the filled
  // blue primary.
  buttonSecondary: {
    background: gameloftColor.grey.subtle, // #f4f4f4 soft fill
    border: gameloftColor.grey.border, // #d9d9d9 light hairline
    hoverBackground: gameloftColor.grey.border // #d9d9d9 on hover
  },
  // Gameloft tabs / sub-nav: active tab = brand-blue label with a brand-blue
  // bottom underline (the modern indicator), transparent fill.
  tabs: {
    activeText: gameloftColor.blue.primary, // #0095f3
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem", // 18px
    indicatorSide: "bottom", // brand-blue underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline (not a box-shadow filet)
  },
  // Gameloft pagination: borderless ink text links; active page = filled
  // brand-blue box with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: gameloftColor.ink.primary, // #1a1a1a link text
    activeBackground: gameloftColor.blue.primary, // #0095f3 filled active page
    activeText: gameloftColor.white, // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // Gameloft breadcrumb: ink links, grey trail, brand-blue current page, grey
  // separators — all sans type.
  breadcrumb: {
    linkText: gameloftColor.ink.primary, // #1a1a1a
    text: gameloftColor.ink.secondary, // #5f5f5f trail text
    currentText: gameloftColor.blue.primary, // #0095f3 current page
    separator: gameloftColor.ink.secondary, // #5f5f5f
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.125rem", // 18px
    currentWeight: "600" // current page is emphasised
  },
  // Gameloft notice / alert: a minimal box — a thin coloured left filet on a white
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
  // Gameloft accordion / disclosure: an ink, mid-weight sans summary trigger,
  // modern rounding, hairline separated.
  accordion: {
    text: gameloftColor.ink.primary, // #1a1a1a summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // rows are flush to the column
    fontSize: "0.875rem", // 14px
    fontWeight: "500", // mid-weight sans
    lineHeight: "1.25rem" // 20px
  },
  // Gameloft tag: a small soft-grey chip with modern rounding.
  tag: {
    radius: "4px", // modern rounding (matches md)
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: gameloftColor.grey.subtle, // #f4f4f4 subtle fill
    neutralText: gameloftColor.ink.primary // #1a1a1a
  },
  // Gameloft badge: a small filled badge — brand-blue fill / white text,
  // uppercase, modern 4px rounding.
  badge: {
    radius: "4px", // modern rounding
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "uppercase", // Gameloft labels are often uppercase
    minHeight: "1.25rem", // 20px
    infoBackground: gameloftColor.blue.primary, // #0095f3 (Gameloft "info" = brand blue)
    infoText: gameloftColor.white // white on blue
  },
  // Gameloft checkbox/radio label: small ink sans.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: gameloftColor.ink.primary // #1a1a1a
  },
  // Gameloft search input: a boxed light hairline field, sans type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Gameloft toggle / switch label: small ink sans.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: gameloftColor.ink.primary // #1a1a1a
  }
} as const;

// --- semantic (Gameloft-specific role mapping) ------------------------------
const semantic = {
  surface: {
    default: gameloftColor.white, // #ffffff white
    subtle: gameloftColor.grey.subtle, // #f4f4f4 subtle fill surface
    raised: gameloftColor.white, // #ffffff white
    inverse: gameloftColor.canvas, // #1a1a1a dark gaming canvas (theme-color #000000)
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop — black @50%
  },
  text: {
    primary: gameloftColor.ink.primary, // #1a1a1a (measured near-black body text)
    secondary: gameloftColor.ink.secondary, // #5f5f5f (measured)
    muted: gameloftColor.ink.muted, // #989898 (measured)
    inverse: gameloftColor.white, // white on dark surfaces
    link: gameloftColor.blue.primary // #0095f3 — Gameloft links are brand blue
  },
  border: {
    subtle: gameloftColor.grey.border, // #d9d9d9 light hairline (field / divider)
    strong: gameloftColor.ink.secondary, // #5f5f5f stronger border
    interactive: gameloftColor.blue.primary // #0095f3 focus / interactive
  },
  action: {
    primary: gameloftColor.blue.primary, // #0095f3 primary button (the brand-blue CTA)
    primaryHover: gameloftColor.blue.hover, // #007ac4 darker blue on hover (measured)
    primaryText: gameloftColor.white, // #ffffff white text on blue
    secondary: gameloftColor.grey.subtle, // #f4f4f4 secondary surface
    secondaryHover: gameloftColor.grey.border, // #d9d9d9
    secondaryText: gameloftColor.ink.primary, // #1a1a1a
    danger: gameloftColor.system.danger // #e02424
  },
  feedback: {
    success: gameloftColor.system.success,
    warning: gameloftColor.system.warning,
    error: gameloftColor.system.danger,
    info: gameloftColor.system.info
  },
  status: {
    pending: gameloftColor.system.warning,
    processing: gameloftColor.system.info,
    completed: gameloftColor.system.success,
    failed: gameloftColor.system.danger
  },
  // Categorical data-vis palette. Gameloft publishes no data-vis scale, so this
  // is a coherent proposal that honours the modern blue identity: the brand blue
  // and sky-blue accent lead, followed by the grey ink ramp and the restrained
  // system hues (see MAPPING.md, "à confirmer" — not an official scale).
  data: {
    category1: gameloftColor.blue.primary, // #0095f3 brand blue
    category2: gameloftColor.blue.accent, // #2eaeff sky-blue accent
    category3: gameloftColor.ink.secondary, // #5f5f5f
    category4: gameloftColor.ink.muted, // #989898
    category5: gameloftColor.grey.border, // #d9d9d9
    category6: gameloftColor.system.danger, // restrained red (à confirmer)
    category7: gameloftColor.system.success, // restrained green (à confirmer)
    category8: gameloftColor.system.warning // restrained amber (à confirmer)
  }
} as const;

/**
 * The Gameloft theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Gameloft-specific (modern blue gaming)
 * values, and the `component` layer is REBUILT from this theme's own semantic/
 * foundation via `createComponent` — so Gameloft's bright-blue-on-white sans
 * identity reaches the components (buttons, tabs, pagination, chat bubbles…),
 * not just the elements that read semantic vars directly.
 */
export const gameloftTheme: TenantTheme = {
  id: "gameloft",
  label: "Gameloft",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default gameloftTheme;
