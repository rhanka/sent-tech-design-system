import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Van Houtte (vanhoutte.com — the iconic Québec coffee roaster founded by
 * Albert-Louis Van Houtte in 1919) theme for the Sentropic token structure.
 *
 * Van Houtte publishes no design-token file, and its marketing site is
 * JS-rendered (the computed CSS is not statically scrapable), so the values
 * below are drawn from Van Houtte's WELL-KNOWN coffee-house brand identity —
 * a deep roasted maroon-red call-to-action on a warm coffee-cream canvas, with
 * a discreet gold accent. Because they are reconstructed from the public brand
 * (not measured off a live computed stylesheet), nearly every value is flagged
 * "à confirmer" in MAPPING.md. We reference font *names* only ("'Inter',
 * Helvetica, Arial, sans-serif" — à confirmer), never font binaries.
 *
 * Van Houtte's identity is a WARM, FRIENDLY café system: a deep roasted
 * maroon-red for emphasis / CTAs (the brand's signature coffee-house red),
 * near-black ink on a warm cream surface, warm taupe hairlines (not cool grey),
 * gentle friendly rounding (2–8px), an outline focus ring in the brand maroon,
 * and a small gold accent for highlights. Where Sentropic needs a role Van
 * Houtte never colours (a cyan accent, full feedback states), the closest warm
 * neutral or a restrained system colour is used and noted "à confirmer".
 *
 * Van Houtte colour reference (brand-known, light theme — à confirmer):
 *   Maroon-red (action / CTA / focus)   #9e1b32   deep roasted coffee-house red
 *   Maroon-red hover (darker)           #7d1527   pressed / hover CTA
 *   White (surface default)             #ffffff   page background
 *   Cream (subtle surface)              #f6f0e8   warm coffee-cream fill
 *   Ink — primary text                  #1a1a1a   near-black body text
 *   Secondary text                      #5a5550   warm taupe-grey
 *   Muted text                          #8a8278   warm muted taupe
 *   Warm hairline border                #e6ddd2   warm cream-taupe hairline
 *   Gold accent                         #c8a45c   discreet brand gold highlight
 *   Inverse surface                     #1a1a1a   near-black inverse band
 *   Danger / error                      #c0392b   warm error red
 */

// --- Van Houtte raw colour palette (brand-known; à confirmer) ----------------
const vanHoutteColor = {
  // The emphasis / CTA "brand" is the deep roasted maroon-red of the Van Houtte
  // coffee-house. Used for the primary call-to-action, focus ring, and active
  // indicators across tabs / pagination / breadcrumb.
  maroon: "#9e1b32", // primary CTA / focus / active accent (roasted coffee red)
  maroonHover: "#7d1527", // darker pressed / hover maroon
  white: "#ffffff", // page background — surface default
  // Warm coffee-cream subtle surface — the signature warm canvas tone.
  cream: "#f6f0e8", // warm coffee-cream subtle fill surface
  // Discreet brand gold accent — used sparingly for highlights / second category.
  gold: "#c8a45c", // brand gold accent (à confirmer)
  // Warm ink scale (warm-tinted greys, not cool). Each is brand-known/à confirmer.
  ink: {
    // Primary body text — a near-black.
    primary: "#1a1a1a", // near-black body text colour
    // Secondary text — warm taupe-grey.
    secondary: "#5a5550", // warm secondary text
    // Muted text — warm muted taupe.
    muted: "#8a8278" // warm muted taupe text (à confirmer)
  },
  // Neutral warm surface / line tones.
  grey: {
    subtle: "#f6f0e8", // warm coffee-cream subtle fill surface
    border: "#e6ddd2" // warm cream-taupe hairline border
  },
  // Feedback hues. Van Houtte publishes no full feedback scale; the danger red
  // is a warm error red consistent with the brand; success/warning/info are
  // restrained, legible (WCAG AA on white) choices noted "à confirmer".
  system: {
    danger: "#c0392b", // warm error red — danger / error
    success: "#2e7d32", // muted green — à confirmer (no Van Houtte source)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#5a5550" // Van Houtte would use warm ink, not blue — à confirmer
  }
} as const;

// --- foundation (Van Houtte-specific values) --------------------------------
const foundation = {
  color: {
    // Van Houtte has no brand blue. The Sentropic "blue" role family (action /
    // primary / link) is mapped onto the maroon scale — the Van Houtte primary
    // action IS the roasted maroon-red. (à confirmer: no blue in the brand.)
    blue: {
      10: vanHoutteColor.cream, // #f6f0e8 lightest warm tint
      60: vanHoutteColor.maroon, // #9e1b32 primary action (Van Houtte maroon CTA)
      80: vanHoutteColor.maroonHover // #7d1527 darker pressed maroon
    },
    // Van Houtte's only real secondary accent is the brand gold. The Sentropic
    // "cyan" accent slot is mapped onto the warm gold/cream scale. (à confirmer.)
    cyan: {
      10: vanHoutteColor.cream, // #f6f0e8 light warm tint
      50: vanHoutteColor.gold, // #c8a45c brand gold accent
      70: vanHoutteColor.maroon // #9e1b32
    },
    // Sentropic "slate" role family mapped onto the Van Houtte warm ink/grey
    // scale.
    slate: {
      0: vanHoutteColor.white, // #ffffff white
      10: vanHoutteColor.cream, // #f6f0e8 warm coffee-cream subtle fill
      20: vanHoutteColor.grey.border, // #e6ddd2 warm hairline border
      60: vanHoutteColor.ink.secondary, // #5a5550 secondary text
      80: vanHoutteColor.ink.primary, // #1a1a1a primary text (near-black)
      90: vanHoutteColor.ink.primary // #1a1a1a darkest (near-black)
    },
    feedback: {
      success: vanHoutteColor.system.success,
      warning: vanHoutteColor.system.warning,
      error: vanHoutteColor.system.danger,
      info: vanHoutteColor.system.info
    }
  },
  // Van Houtte's UI is set in a clean humanist SANS — reconstructed as "'Inter',
  // Helvetica, Arial, sans-serif" (à confirmer; JS-rendered site). We reference
  // the *names* only. Mono is not part of Van Houtte — the Sentropic mono stack
  // (kept from the Simons template) is retained.
  font: {
    sans: "'Inter', Helvetica, Arial, sans-serif",
    display: "'Inter', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. Van Houtte's exact spacing steps are not publicly
  // tokenised; kept aligned with the Sentropic base 4px scale ("à confirmer").
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
  // Van Houtte reads WARM and FRIENDLY — gentle, soft rounding rather than boxy
  // or fully pill. Buttons/inputs ~4px, cards ~8px. (Exact steps à confirmer;
  // pill kept at 999px for completeness.)
  radius: {
    none: "0", // square slot
    sm: "2px", // smallest controls — gentle 2px
    md: "4px", // button / input / tabs — friendly 4px
    lg: "8px", // cards — soft 8px
    pill: "999px" // tags / pills
  },
  // Van Houtte elevation is warm and soft — gentle low shadows on raised café
  // surfaces. Kept conservative ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.14)"
  },
  // Standard short eases. Durations not tokenised publicly; aligned with base
  // ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "150ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Van Houtte-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Van Houtte) -------------------------------------
  // Van Houtte borders are thin WARM hairlines (#e6ddd2 @1px). Encoded as 1px
  // thin / 2px thick.
  borderWidth: {
    none: "0",
    thin: "1px", // Van Houtte warm hairline (#e6ddd2)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Van Houtte control density. CTA buttons sit at a comfortable ~44px touch
  // height with generous horizontal padding; nav/body text is mid-sized sans.
  // (à confirmer.)
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // Van Houtte typography = the humanist sans. Control labels are mid-weight;
  // body/field text is sentence case. (à confirmer — JS-rendered site.)
  typography: {
    control: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "600", lineHeight: "1.2", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.4", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Van Houtte links are maroon ink at rest; the hover affordance is an underline.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // Van Houtte dims disabled controls
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // Van Houtte FOCUS = an OUTLINE in the brand maroon (~2px solid #9e1b32). We
  // encode the maroon outline strategy.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: vanHoutteColor.maroon, // #9e1b32 — Van Houtte focuses in the brand maroon
    inset: "0"
  },
  // Van Houtte form fields are BOXED (outline): a white fill with a thin warm
  // hairline border and a gentle radius. `style: "outline"` makes the builder
  // draw four equal borders from `surface.default` + `border.subtle`. Warm
  // input/select border = #e6ddd2 @1px hairline (à confirmer).
  field: {
    style: "outline",
    fillBg: vanHoutteColor.white, // #ffffff
    underlineColor: vanHoutteColor.grey.border, // #e6ddd2 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the warm secondary ink with a right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%235a5550' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Van Houtte cards: soft 8px rounding, a thin warm hairline rather than a heavy
  // box, with a faint warm cream hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: vanHoutteColor.cream // #f6f0e8 faint warm hover tint
  },
  // Van Houtte secondary button = a soft warm-cream filled chip (cream fill, ink
  // text, warm hairline, slightly darker on hover) — the quiet alternative to the
  // filled maroon primary.
  buttonSecondary: {
    background: vanHoutteColor.cream, // #f6f0e8 warm cream fill
    border: vanHoutteColor.grey.border, // #e6ddd2 warm hairline
    hoverBackground: vanHoutteColor.grey.border // #e6ddd2 on hover
  },
  // Van Houtte tabs / sub-nav: active tab = maroon bold label with a maroon
  // bottom underline (the brand indicator), transparent fill.
  tabs: {
    activeText: vanHoutteColor.maroon, // #9e1b32
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem", // 18px
    indicatorSide: "bottom", // maroon underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline (not a box-shadow filet)
  },
  // Van Houtte pagination: borderless ink text links; active page = filled maroon
  // box with white text (the brand fill).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: vanHoutteColor.ink.primary, // #1a1a1a link text
    activeBackground: vanHoutteColor.maroon, // #9e1b32 filled active page
    activeText: vanHoutteColor.white, // white on maroon
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // Van Houtte breadcrumb: ink links, warm trail, maroon current page, warm
  // separators — all sans type.
  breadcrumb: {
    linkText: vanHoutteColor.ink.primary, // #1a1a1a
    text: vanHoutteColor.ink.secondary, // #5a5550 trail text
    currentText: vanHoutteColor.maroon, // #9e1b32 current page
    separator: vanHoutteColor.ink.secondary, // #5a5550
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.125rem", // 18px
    currentWeight: "600" // current page is emphasised
  },
  // Van Houtte notice / alert: a minimal box — a thin coloured left filet on a
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
  // Van Houtte accordion / disclosure: an ink, plain-weight sans summary trigger,
  // gentle rounding, hairline separated.
  accordion: {
    text: vanHoutteColor.ink.primary, // #1a1a1a summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // rows are flush to the column
    fontSize: "0.875rem", // 14px
    fontWeight: "500", // medium weight sans
    lineHeight: "1.25rem" // 20px
  },
  // Van Houtte tag: a small warm-cream chip with gentle rounding.
  tag: {
    radius: "4px", // gentle rounding (matches md)
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: vanHoutteColor.cream, // #f6f0e8 warm cream fill
    neutralText: vanHoutteColor.ink.primary // #1a1a1a
  },
  // Van Houtte badge: a small filled badge — maroon fill / white text, gentle
  // rounding.
  badge: {
    radius: "4px", // gentle rounding
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "none", // Van Houtte labels read sentence/title case
    minHeight: "1.25rem", // 20px
    infoBackground: vanHoutteColor.maroon, // #9e1b32 (Van Houtte "info" = brand maroon, not blue)
    infoText: vanHoutteColor.white // white on maroon
  },
  // Van Houtte checkbox/radio label: small ink sans.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: vanHoutteColor.ink.primary // #1a1a1a
  },
  // Van Houtte search input: a boxed warm hairline field, sans type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Van Houtte toggle / switch label: small ink sans.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: vanHoutteColor.ink.primary // #1a1a1a
  }
} as const;

// --- semantic (Van Houtte-specific role mapping) ----------------------------
const semantic = {
  surface: {
    default: vanHoutteColor.white, // #ffffff white
    subtle: vanHoutteColor.cream, // #f6f0e8 warm coffee-cream subtle fill surface
    raised: vanHoutteColor.white, // #ffffff white
    inverse: vanHoutteColor.ink.primary, // #1a1a1a near-black inverse surface (footer / dark band)
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop — black @50%
  },
  text: {
    primary: vanHoutteColor.ink.primary, // #1a1a1a near-black body text
    secondary: vanHoutteColor.ink.secondary, // #5a5550 warm secondary
    muted: vanHoutteColor.ink.muted, // #8a8278 warm muted (à confirmer)
    inverse: vanHoutteColor.white, // white on dark surfaces
    link: vanHoutteColor.maroon // #9e1b32 — Van Houtte links are brand maroon
  },
  border: {
    subtle: vanHoutteColor.grey.border, // #e6ddd2 warm hairline (field / divider)
    strong: vanHoutteColor.ink.secondary, // #5a5550 stronger border
    interactive: vanHoutteColor.maroon // #9e1b32 focus / interactive
  },
  action: {
    primary: vanHoutteColor.maroon, // #9e1b32 primary button (the maroon CTA)
    primaryHover: vanHoutteColor.maroonHover, // #7d1527 darker maroon on hover
    primaryText: vanHoutteColor.white, // white text on maroon
    secondary: vanHoutteColor.cream, // #f6f0e8 secondary surface (warm cream)
    secondaryHover: vanHoutteColor.grey.border, // #e6ddd2
    secondaryText: vanHoutteColor.ink.primary, // #1a1a1a
    danger: vanHoutteColor.system.danger // #c0392b
  },
  feedback: {
    success: vanHoutteColor.system.success,
    warning: vanHoutteColor.system.warning,
    error: vanHoutteColor.system.danger,
    info: vanHoutteColor.system.info
  },
  status: {
    pending: vanHoutteColor.system.warning,
    processing: vanHoutteColor.system.info,
    completed: vanHoutteColor.system.success,
    failed: vanHoutteColor.system.danger
  },
  // Categorical data-vis palette. Van Houtte publishes no data-vis scale, so this
  // is a coherent WARM proposal: brand maroon and gold lead, then warm greys, then
  // the restrained system hues, drawn to honour the warm café identity (see
  // MAPPING.md, "à confirmer" — not an official scale).
  data: {
    category1: vanHoutteColor.maroon, // #9e1b32 brand maroon
    category2: vanHoutteColor.gold, // #c8a45c brand gold
    category3: vanHoutteColor.ink.secondary, // #5a5550 warm grey
    category4: vanHoutteColor.ink.muted, // #8a8278 warm muted
    category5: vanHoutteColor.grey.border, // #e6ddd2 warm hairline
    category6: vanHoutteColor.system.danger, // warm red (à confirmer)
    category7: vanHoutteColor.system.success, // restrained green (à confirmer)
    category8: vanHoutteColor.system.warning // restrained amber (à confirmer)
  }
} as const;

/**
 * The Van Houtte theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Van Houtte-specific (warm
 * coffee-house) values, and the `component` layer is REBUILT from this theme's
 * own semantic/foundation via `createComponent` — so Van Houtte's
 * maroon-on-cream identity reaches the components (buttons, tabs, pagination,
 * chat bubbles…), not just the elements that read semantic vars directly.
 */
export const vanHoutteTheme: TenantTheme = {
  id: "van-houtte",
  label: "Van Houtte",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default vanHoutteTheme;
