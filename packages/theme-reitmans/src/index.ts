import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Reitmans (reitmans.com — the Montréal-founded women's fashion retailer, part
 * of Reitmans Canada) theme for the Sentropic token structure.
 *
 * Reitmans publishes no design-token file; the values below are MEASURED from the
 * live site's computed CSS (https://www.reitmans.com, inspected in a real
 * browser). We only reference the font *names* here, never font binaries: the
 * live site renders its UI in 'SuisseIntl' (a licensed face we cannot ship), so
 * we substitute the visually closest widely-available grotesque, Inter, as
 * "'Inter', Helvetica, Arial, sans-serif" (à confirmer — the SuisseIntl → Inter
 * substitution is an inferred match, not a measured token). Sources and the full
 * mapping table are in MAPPING.md.
 *
 * Reitmans' identity is a RED + NAVY system on WARM CREAM surfaces: a bold
 * Reitmans red call-to-action, a navy secondary accent, near-black editorial
 * text on a warm off-white/cream subtle surface, light warm-grey hairlines, and
 * a SHARP / minimal rounding language (fashion-flat: 0–4px). Focus is rendered
 * as a crisp near-black outline. Where Sentropic needs a role Reitmans never
 * colours (e.g. extra accents, some feedback states), the closest measured value
 * is reused (red for danger) or a restrained system colour is chosen and the
 * choice is noted "à confirmer" in MAPPING.md.
 *
 * Reitmans colour reference (measured, light theme):
 *   Reitmans red (action / CTA / danger)   #e70404   bold primary call-to-action
 *   Red hover                              #c00303   darker red on hover (measured)
 *   Navy accent                            #34459c   secondary brand accent
 *   White (surface default)                #ffffff   page background
 *   Warm cream (subtle surface)            #f8f3ec   measured warm off-white fill
 *   Ink — primary text                     #1a1a1a   near-black editorial text
 *   Secondary text                         #5a5550   warm grey body/secondary text
 *   Muted text                             #8a857e   warm muted grey
 *   Border / hairline                      #e7e4e1   warm light hairline
 *   Inverse surface                        #1a1a1a   near-black inverse band
 */

// --- Reitmans raw colour palette (measured from live computed CSS) ----------
const reitmansColor = {
  // The Reitmans red — the bold primary call-to-action colour. Reused for the
  // danger/error role (Reitmans signals errors and sale with the same red).
  red: "#e70404", // primary CTA / danger (measured)
  redHover: "#c00303", // darker red on hover (measured)
  // The navy secondary accent — links, secondary emphasis, second data category.
  navy: "#34459c", // navy accent (measured)
  white: "#ffffff", // page background — surface default
  // Warm monochrome ink scale (each value measured from a real element). The body
  // text is a near-black #1a1a1a; secondary/muted greys are warm-toned.
  ink: {
    primary: "#1a1a1a", // near-black editorial body text (measured)
    secondary: "#5a5550", // warm grey secondary text (measured)
    muted: "#8a857e" // warm muted grey (measured)
  },
  // Warm neutral surface / line greys.
  grey: {
    cream: "#f8f3ec", // measured warm CREAM subtle fill surface
    border: "#e7e4e1" // measured warm light hairline border
  },
  // Reitmans' decorative palette is essentially red + navy; it publishes no
  // success/warning/info hues. The danger red is the measured brand red; the rest
  // are restrained, legible (WCAG AA on white) system colours chosen to sit
  // quietly beside the red/navy identity — "à confirmer" (no Reitmans source).
  system: {
    danger: "#e70404", // Reitmans red — error / sale accent (measured)
    success: "#2e7d32", // muted green — à confirmer (no Reitmans source)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#34459c" // Reitmans navy stands in for "info" — à confirmer
  }
} as const;

// --- foundation (Reitmans-specific values) ----------------------------------
const foundation = {
  color: {
    // The Sentropic "blue" role family (action / primary / link) is mapped onto
    // the Reitmans RED — the Reitmans primary action IS the red CTA. (à confirmer:
    // Reitmans' "blue" is really its red; navy serves as the secondary accent.)
    blue: {
      10: reitmansColor.grey.cream, // #f8f3ec lightest warm tint
      60: reitmansColor.red, // #e70404 primary action (Reitmans red CTA)
      80: reitmansColor.redHover // #c00303 darker red step (hover/pressed)
    },
    // The Sentropic "cyan" accent slot is mapped to the Reitmans NAVY — the only
    // true secondary accent the brand uses.
    cyan: {
      10: reitmansColor.grey.cream, // #f8f3ec light warm tint
      50: reitmansColor.navy, // #34459c navy accent
      70: reitmansColor.navy // #34459c (no darker measured navy step — à confirmer)
    },
    // Sentropic "slate" role family mapped onto the Reitmans warm ink/grey scale.
    slate: {
      0: reitmansColor.white, // #ffffff white
      10: reitmansColor.grey.cream, // #f8f3ec warm cream fill surface
      20: reitmansColor.grey.border, // #e7e4e1 warm hairline / subtle border
      60: reitmansColor.ink.secondary, // #5a5550 secondary text
      80: reitmansColor.ink.primary, // #1a1a1a primary text (near-black)
      90: reitmansColor.ink.primary // #1a1a1a darkest (near-black)
    },
    feedback: {
      success: reitmansColor.system.success,
      warning: reitmansColor.system.warning,
      error: reitmansColor.system.danger,
      info: reitmansColor.system.info
    }
  },
  // Reitmans sets its UI in 'SuisseIntl' (measured), a licensed grotesque we
  // cannot ship. We substitute Inter — the closest widely-available match — and
  // reference *names* only. Mono is not part of Reitmans; the Sentropic / Simons
  // mono stack is kept. (à confirmer: the SuisseIntl → Inter substitution.)
  font: {
    sans: "'Inter', Helvetica, Arial, sans-serif",
    display: "'Inter', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. Reitmans' grid is whitespace-generous but its raw
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
  // Reitmans rounding is SHARP / minimal — fashion-flat. Controls and inputs are
  // square or near-square; only the largest surfaces get a soft 4px. Pills stay
  // fully rounded for tags. (Measured: mostly square edges with subtle 2–4px.)
  radius: {
    none: "0", // square
    sm: "0", // smallest controls — square
    md: "2px", // button / input / tabs — barely-softened 2px (measured)
    lg: "4px", // cards — gentle 4px (measured)
    pill: "999px" // tags / pills
  },
  // Reitmans elevation is restrained — hairlines and whitespace, with soft, low
  // shadows on raised elements. Kept conservative ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.14)"
  },
  // Reitmans animates with short, standard eases (≈ 150ms transitions). Durations
  // not fully tokenised publicly; kept aligned with the base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "150ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Reitmans-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Reitmans) ---------------------------------------
  // Reitmans borders are thin warm-grey hairlines (#e7e4e1 @1px). Encoded as 1px
  // thin / 2px thick.
  borderWidth: {
    none: "0",
    thin: "1px", // Reitmans hairline (#e7e4e1)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Reitmans control density. Measured CTA buttons sit ~44px tall with generous
  // horizontal padding; nav/body text is mid-sized sans. md targets a ~44px touch
  // height; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // Reitmans typography = the substituted Inter grotesque. CTAs are UPPERCASE with
  // measured letter-spacing; body/field text is sentence case.
  typography: {
    control: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "600", lineHeight: "1.2", letterSpacing: "0.04em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.4", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Reitmans links are plain ink at rest; the hover affordance is an underline.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // Reitmans dims disabled controls
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // Reitmans FOCUS = a crisp near-black OUTLINE (~2px solid #1a1a1a). We encode
  // the near-black outline strategy.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: reitmansColor.ink.primary, // #1a1a1a — Reitmans focuses in near-black, not the red
    inset: "0"
  },
  // Reitmans form fields are BOXED (outline): a white fill with a thin warm-grey
  // hairline border and a near-square (2px) radius. `style: "outline"` makes the
  // builder draw four equal borders from `surface.default` + `border.subtle`.
  // Measured input/select border = #e7e4e1 @1px hairline.
  field: {
    style: "outline",
    fillBg: reitmansColor.white, // #ffffff
    underlineColor: reitmansColor.grey.border, // #e7e4e1 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the near-black ink with a 40px gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%231a1a1a' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Reitmans cards: gentle 4px rounding, a thin warm-grey hairline rather than a
  // heavy box, with a faint warm hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: reitmansColor.grey.cream // #f8f3ec faint warm hover tint
  },
  // Reitmans secondary button = a warm-cream filled chip (light #f8f3ec fill, ink
  // text, slightly darker warm grey on hover) — the quiet alternative to the bold
  // red primary.
  buttonSecondary: {
    background: reitmansColor.grey.cream, // #f8f3ec soft warm fill
    border: reitmansColor.grey.border, // #e7e4e1 warm hairline
    hoverBackground: reitmansColor.grey.border // #e7e4e1 on hover
  },
  // Reitmans tabs / sub-nav: active tab = red label with a red bottom underline
  // (the brand indicator), transparent fill.
  tabs: {
    activeText: reitmansColor.red, // #e70404 active red
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem", // 18px
    indicatorSide: "bottom", // red underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline (not a box-shadow filet)
  },
  // Reitmans pagination: borderless ink text links; active page = filled red box
  // with white text (the brand fill).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: reitmansColor.ink.primary, // #1a1a1a link text
    activeBackground: reitmansColor.red, // #e70404 filled active page (red)
    activeText: reitmansColor.white, // white on red
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // Reitmans breadcrumb: ink links, warm-grey trail, red current page, warm-grey
  // separators — all sans type.
  breadcrumb: {
    linkText: reitmansColor.ink.primary, // #1a1a1a
    text: reitmansColor.ink.secondary, // #5a5550 trail text
    currentText: reitmansColor.red, // #e70404 current page (red)
    separator: reitmansColor.ink.secondary, // #5a5550
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.125rem", // 18px
    currentWeight: "600" // current page is emphasised
  },
  // Reitmans notice / alert: a minimal box — a thin coloured left filet on a white
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
  // Reitmans accordion / disclosure: an ink, mid-weight sans summary trigger,
  // gentle rounding, hairline separated.
  accordion: {
    text: reitmansColor.ink.primary, // #1a1a1a summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // rows are flush to the column
    fontSize: "0.875rem", // 14px
    fontWeight: "500", // mid weight sans
    lineHeight: "1.25rem" // 20px
  },
  // Reitmans tag: a small soft warm-cream chip with near-square rounding.
  tag: {
    radius: "2px", // near-square rounding (matches md)
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: reitmansColor.grey.cream, // #f8f3ec warm cream fill
    neutralText: reitmansColor.ink.primary // #1a1a1a
  },
  // Reitmans badge: a small filled badge — red fill / white text, uppercase,
  // near-square 2px rounding.
  badge: {
    radius: "2px", // near-square rounding
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "uppercase", // Reitmans labels are often uppercase
    minHeight: "1.25rem", // 20px
    infoBackground: reitmansColor.red, // #e70404 (Reitmans "info" badge = brand red)
    infoText: reitmansColor.white // white on red
  },
  // Reitmans checkbox/radio label: small ink sans.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: reitmansColor.ink.primary // #1a1a1a
  },
  // Reitmans search input: a boxed warm hairline field, sans type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Reitmans toggle / switch label: small ink sans.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: reitmansColor.ink.primary // #1a1a1a
  }
} as const;

// --- semantic (Reitmans-specific role mapping) ------------------------------
const semantic = {
  surface: {
    default: reitmansColor.white, // #ffffff white
    subtle: reitmansColor.grey.cream, // #f8f3ec measured warm CREAM subtle surface
    raised: reitmansColor.white, // #ffffff white
    inverse: reitmansColor.ink.primary, // #1a1a1a near-black inverse surface
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop — black @50%
  },
  text: {
    primary: reitmansColor.ink.primary, // #1a1a1a (measured near-black text)
    secondary: reitmansColor.ink.secondary, // #5a5550 warm grey secondary text
    muted: reitmansColor.ink.muted, // #8a857e warm muted grey
    inverse: reitmansColor.white, // white on dark surfaces
    link: reitmansColor.navy // #34459c — Reitmans links read in the navy accent
  },
  border: {
    subtle: reitmansColor.grey.border, // #e7e4e1 warm light hairline (field / divider)
    strong: reitmansColor.ink.secondary, // #5a5550 stronger border
    interactive: reitmansColor.red // #e70404 focus / interactive (brand red)
  },
  action: {
    primary: reitmansColor.red, // #e70404 primary button (the Reitmans red CTA)
    primaryHover: reitmansColor.redHover, // #c00303 darker red on hover (measured)
    primaryText: reitmansColor.white, // white text on red
    secondary: reitmansColor.grey.cream, // #f8f3ec secondary surface (warm cream)
    secondaryHover: reitmansColor.grey.border, // #e7e4e1
    secondaryText: reitmansColor.ink.primary, // #1a1a1a
    danger: reitmansColor.system.danger // #e70404 (Reitmans danger = brand red)
  },
  feedback: {
    success: reitmansColor.system.success,
    warning: reitmansColor.system.warning,
    error: reitmansColor.system.danger,
    info: reitmansColor.system.info
  },
  status: {
    pending: reitmansColor.system.warning,
    processing: reitmansColor.system.info,
    completed: reitmansColor.system.success,
    failed: reitmansColor.system.danger
  },
  // Categorical data-vis palette. Reitmans publishes no data-vis scale; this is a
  // coherent proposal led by the two brand hues (red, navy) then warm greys plus
  // the restrained system hues, drawn to honour the identity (see MAPPING.md,
  // "à confirmer" — not an official scale).
  data: {
    category1: reitmansColor.red, // #e70404 Reitmans red
    category2: reitmansColor.navy, // #34459c navy accent
    category3: reitmansColor.ink.secondary, // #5a5550 warm grey
    category4: reitmansColor.ink.muted, // #8a857e muted warm grey
    category5: reitmansColor.grey.border, // #e7e4e1 warm hairline grey
    category6: reitmansColor.redHover, // #c00303 deep red (à confirmer)
    category7: reitmansColor.system.success, // restrained green (à confirmer)
    category8: reitmansColor.system.warning // restrained amber (à confirmer)
  }
} as const;

/**
 * The Reitmans theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Reitmans-specific (red + navy on warm cream)
 * values, and the `component` layer is REBUILT from this theme's own semantic/
 * foundation via `createComponent` — so Reitmans' red-on-cream identity reaches
 * the components (buttons, tabs, pagination, chat bubbles…), not just the
 * elements that read semantic vars directly.
 */
export const reitmansTheme: TenantTheme = {
  id: "reitmans",
  label: "Reitmans",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default reitmansTheme;
