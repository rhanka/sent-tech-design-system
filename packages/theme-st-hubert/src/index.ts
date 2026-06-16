import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * St-Hubert (st-hubert.com — the iconic Québec rotisserie restaurant chain,
 * founded in Montréal in 1951) theme for the Sentropic token structure.
 *
 * St-Hubert's public site is JS-RENDERED (the computed CSS is not statically
 * scrapeable), so the values below are drawn from St-Hubert's WELL-KNOWN brand
 * identity rather than from a measured token file — every colour is therefore
 * flagged "à confirmer" against a live measurement. We only reference the font
 * *names* here, never font binaries. Sources and the full mapping table are in
 * MAPPING.md.
 *
 * St-Hubert's identity is a WARM, APPETISING system: the signature St-Hubert RED
 * as the brand/CTA colour, a warm sunny YELLOW as the secondary accent, soft
 * near-black ink for body text, warm-grey neutrals (a faintly beige paper tint),
 * friendly rounded corners, and a red focus outline. The brand red also doubles
 * as the danger/error hue — St-Hubert does not introduce a separate alarm red.
 *
 * St-Hubert colour reference (brand-known, light theme — à confirmer):
 *   St-Hubert red (action / CTA / brand)  #e2231a   the signature rotisserie red
 *   Red hover (darker red)                #b81b14   pressed/hover state
 *   Warm yellow (accent)                  #ffcd00   sunny secondary accent
 *   White (surface default)               #ffffff   page background
 *   Ink — primary text                    #1a1a1a   warm near-black body text
 *   Secondary text                        #555555   secondary copy / strong border
 *   Muted text / warm-grey                 #8a8580   warm muted grey (à confirmer)
 *   Subtle fill surface                   #f5f3f1   faint warm paper tint
 *   Subtle / field border                 #e0dcd8   warm hairline border
 */

// --- St-Hubert raw colour palette (brand-known, à confirmer) ----------------
const stHubertColor = {
  // The St-Hubert brand / CTA red — the signature rotisserie red. Used for the
  // primary call-to-action, brand marks, active indicators, AND danger/error
  // (the brand red doubles as the alarm hue).
  red: "#e2231a", // signature St-Hubert red — CTA / brand / danger
  redHover: "#b81b14", // darker red — hover / pressed CTA state
  // Warm sunny yellow — the secondary accent (used for highlights / garnishes
  // in the brand's warm palette).
  yellow: "#ffcd00", // warm yellow accent
  white: "#ffffff", // page background — surface default
  // Warm monochrome ink scale.
  ink: {
    // Primary body text — a warm, soft near-black (not pure #000).
    primary: "#1a1a1a", // warm near-black — body text colour
    // Secondary text & strong borders.
    secondary: "#555555", // secondary text / strong border
    // Muted text — a warm grey echoing the paper tint.
    muted: "#8a8580" // warm muted grey (à confirmer)
  },
  // Neutral surface / line greys — faintly warm (beige-leaning) to match the
  // appetising, paper-like brand feel.
  grey: {
    subtle: "#f5f3f1", // faint warm paper tint — subtle fill surface
    border: "#e0dcd8" // warm hairline / field border
  },
  // St-Hubert publishes no explicit success/warning/info hues. Danger reuses the
  // BRAND RED (the brand red doubles as the alarm colour). The remaining states
  // are restrained, legible (WCAG AA on white) system colours, all "à confirmer"
  // — St-Hubert has no measured equivalent.
  system: {
    danger: "#e2231a", // brand red doubles as danger / error
    success: "#2e7d32", // muted green — à confirmer (no St-Hubert source)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#555555" // St-Hubert would use ink, not blue — à confirmer
  }
} as const;

// --- foundation (St-Hubert-specific values) ---------------------------------
const foundation = {
  color: {
    // St-Hubert's brand colour is RED, not blue. The Sentropic "blue" role family
    // (action / primary / link) is mapped onto the St-Hubert red scale — the
    // St-Hubert primary action IS red. (à confirmer: St-Hubert has no blue.)
    blue: {
      10: stHubertColor.grey.subtle, // #f5f3f1 lightest neutral tint
      60: stHubertColor.red, // #e2231a primary action (St-Hubert red CTA)
      80: stHubertColor.redHover // #b81b14 darker red (pressed)
    },
    // St-Hubert's accent is the warm YELLOW. The Sentropic "cyan" accent slot is
    // mapped onto the yellow. (à confirmer.)
    cyan: {
      10: stHubertColor.grey.subtle, // #f5f3f1 light neutral tint
      50: stHubertColor.yellow, // #ffcd00 warm yellow accent
      70: stHubertColor.redHover // #b81b14 deepest accent step
    },
    // Sentropic "slate" role family mapped onto the St-Hubert warm ink/grey scale.
    slate: {
      0: stHubertColor.white, // #ffffff white
      10: stHubertColor.grey.subtle, // #f5f3f1 subtle fill surface
      20: stHubertColor.grey.border, // #e0dcd8 hairline / subtle border
      60: stHubertColor.ink.secondary, // #555555 secondary text
      80: stHubertColor.ink.primary, // #1a1a1a primary text (warm near-black)
      90: stHubertColor.ink.primary // #1a1a1a darkest ink
    },
    feedback: {
      success: stHubertColor.system.success,
      warning: stHubertColor.system.warning,
      error: stHubertColor.system.danger,
      info: stHubertColor.system.info
    }
  },
  // St-Hubert sets its UI in a clean humanist SANS. We reference the *names* only
  // ("'Inter', Helvetica, Arial, sans-serif" — à confirmer; the live site is
  // JS-rendered). Mono is not part of St-Hubert — the Simons/Sentropic mono stack
  // is kept.
  font: {
    sans: "'Inter', Helvetica, Arial, sans-serif",
    display: "'Inter', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale, aligned with the Sentropic base 4px scale
  // ("à confirmer" exact steps — JS-rendered site).
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
  // St-Hubert reads FRIENDLY / WARM — generous rounding on controls and cards,
  // not boxy. (Exact steps à confirmer; pill kept at 999px for completeness.)
  radius: {
    none: "0", // square slot
    sm: "2px", // smallest controls
    md: "8px", // button / input / tabs — friendly rounding
    lg: "12px", // cards — warm, soft corners
    pill: "999px" // tags / pills
  },
  // St-Hubert elevation is soft and warm — gentle low shadows on raised elements.
  // Kept conservative ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.14)"
  },
  // St-Hubert animates with short, standard eases. Durations not tokenised
  // publicly; kept aligned with the base.
  motion: {
    fast: "120ms",
    normal: "150ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not St-Hubert-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (St-Hubert) --------------------------------------
  // St-Hubert borders are thin warm-grey hairlines (#e0dcd8 @1px). Encoded as 1px
  // thin / 2px thick.
  borderWidth: {
    none: "0",
    thin: "1px", // St-Hubert warm hairline (#e0dcd8)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // St-Hubert control density. CTA buttons sit ~44px tall with generous
  // horizontal padding; md targets a ~44px touch height; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // St-Hubert typography = the clean humanist sans. Control labels are mid-weight;
  // body/field text is sentence case. CTAs read as a friendly bold sans.
  typography: {
    control: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "600", lineHeight: "1.2", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.4", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // St-Hubert links are red ink at rest; the hover affordance is an underline.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // St-Hubert dims disabled controls
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // St-Hubert FOCUS = a crisp RED OUTLINE (~2px solid #e2231a). We encode the red
  // outline strategy.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: stHubertColor.red, // #e2231a — St-Hubert focuses in brand red
    inset: "0"
  },
  // St-Hubert form fields are BOXED (outline): a white fill with a thin warm-grey
  // hairline border and friendly rounding. `style: "outline"` makes the builder
  // draw four equal borders from `surface.default` + `border.subtle`. Field
  // border = #e0dcd8 @1px hairline (à confirmer).
  field: {
    style: "outline",
    fillBg: stHubertColor.white, // #ffffff
    underlineColor: stHubertColor.grey.border, // #e0dcd8 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the soft ink with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%231a1a1a' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // St-Hubert cards: friendly 12px rounding, a thin warm-grey hairline rather than
  // a heavy box, with a faint warm hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: stHubertColor.grey.subtle // #f5f3f1 faint warm hover tint
  },
  // St-Hubert secondary button = a soft warm-grey filled chip (light #f5f3f1 fill,
  // ink text, slightly darker warm grey on hover) — the quiet alternative to the
  // filled red primary.
  buttonSecondary: {
    background: stHubertColor.grey.subtle, // #f5f3f1 soft warm fill
    border: stHubertColor.grey.border, // #e0dcd8 warm hairline
    hoverBackground: stHubertColor.grey.border // #e0dcd8 on hover
  },
  // St-Hubert tabs / sub-nav: active tab = red bold label with a red bottom
  // underline (the brand indicator), transparent fill.
  tabs: {
    activeText: stHubertColor.red, // #e2231a
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
  // St-Hubert pagination: borderless ink text links; active page = filled red box
  // with white text (the brand fill).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: stHubertColor.ink.primary, // #1a1a1a link text
    activeBackground: stHubertColor.red, // #e2231a filled active page
    activeText: stHubertColor.white, // white on red
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // St-Hubert breadcrumb: ink links, grey trail, red current page, grey
  // separators.
  breadcrumb: {
    linkText: stHubertColor.ink.primary, // #1a1a1a
    text: stHubertColor.ink.secondary, // #555555 trail text
    currentText: stHubertColor.red, // #e2231a current page (brand red)
    separator: stHubertColor.ink.secondary, // #555555
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.125rem", // 18px
    currentWeight: "600" // current page is emphasised
  },
  // St-Hubert notice / alert: a minimal box — a thin coloured left filet on a
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
  // St-Hubert accordion / disclosure: an ink, plain-weight summary trigger,
  // friendly rounding, hairline separated.
  accordion: {
    text: stHubertColor.ink.primary, // #1a1a1a summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // rows are flush to the column
    fontSize: "0.875rem", // 14px
    fontWeight: "500", // medium weight sans
    lineHeight: "1.25rem" // 20px
  },
  // St-Hubert tag: a small soft warm-grey chip with friendly rounding.
  tag: {
    radius: "8px", // friendly rounding (matches md)
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: stHubertColor.grey.subtle, // #f5f3f1 subtle fill
    neutralText: stHubertColor.ink.primary // #1a1a1a
  },
  // St-Hubert badge: a small filled badge — red fill / white text, friendly
  // rounding.
  badge: {
    radius: "8px", // friendly rounding
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: stHubertColor.red, // #e2231a (St-Hubert "info" = brand red)
    infoText: stHubertColor.white // white on red
  },
  // St-Hubert checkbox/radio label: small ink sans.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: stHubertColor.ink.primary // #1a1a1a
  },
  // St-Hubert search input: a boxed warm hairline field.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // St-Hubert toggle / switch label: small ink sans.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: stHubertColor.ink.primary // #1a1a1a
  }
} as const;

// --- semantic (St-Hubert-specific role mapping) -----------------------------
const semantic = {
  surface: {
    default: stHubertColor.white, // #ffffff white
    subtle: stHubertColor.grey.subtle, // #f5f3f1 subtle warm fill surface
    raised: stHubertColor.white, // #ffffff white
    inverse: stHubertColor.ink.primary, // #1a1a1a warm near-black inverse surface
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop — black @50%
  },
  text: {
    primary: stHubertColor.ink.primary, // #1a1a1a (warm near-black body text)
    secondary: stHubertColor.ink.secondary, // #555555
    muted: stHubertColor.ink.muted, // #8a8580 (à confirmer)
    inverse: stHubertColor.white, // white on dark surfaces
    link: stHubertColor.red // #e2231a — St-Hubert links are brand red
  },
  border: {
    subtle: stHubertColor.grey.border, // #e0dcd8 warm hairline (field / divider)
    strong: stHubertColor.ink.secondary, // #555555 stronger border
    interactive: stHubertColor.red // #e2231a focus / interactive
  },
  action: {
    primary: stHubertColor.red, // #e2231a primary button (the red CTA)
    primaryHover: stHubertColor.redHover, // #b81b14 darker red on hover
    primaryText: stHubertColor.white, // white text on red
    secondary: stHubertColor.grey.subtle, // #f5f3f1 secondary surface
    secondaryHover: stHubertColor.grey.border, // #e0dcd8
    secondaryText: stHubertColor.ink.primary, // #1a1a1a
    danger: stHubertColor.system.danger // #e2231a (brand red doubles as danger)
  },
  feedback: {
    success: stHubertColor.system.success,
    warning: stHubertColor.system.warning,
    error: stHubertColor.system.danger,
    info: stHubertColor.system.info
  },
  status: {
    pending: stHubertColor.system.warning,
    processing: stHubertColor.system.info,
    completed: stHubertColor.system.success,
    failed: stHubertColor.system.danger
  },
  // Categorical data-vis palette. St-Hubert publishes no data-vis scale; this is a
  // coherent proposal built on the brand red + warm yellow, then the warm greys
  // and restrained system hues (see MAPPING.md, "à confirmer" — not an official
  // scale).
  data: {
    category1: stHubertColor.red, // #e2231a brand red
    category2: stHubertColor.yellow, // #ffcd00 warm yellow accent
    category3: stHubertColor.ink.secondary, // #555555
    category4: stHubertColor.ink.muted, // #8a8580
    category5: stHubertColor.grey.border, // #e0dcd8
    category6: stHubertColor.redHover, // #b81b14 deep red (à confirmer)
    category7: stHubertColor.system.success, // restrained green (à confirmer)
    category8: stHubertColor.system.warning // restrained amber (à confirmer)
  }
} as const;

/**
 * The St-Hubert theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry St-Hubert-specific (warm red +
 * yellow) values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so St-Hubert's appetising
 * red-on-white identity reaches the components (buttons, tabs, pagination, chat
 * bubbles…), not just the elements that read semantic vars directly.
 */
export const stHubertTheme: TenantTheme = {
  id: "st-hubert",
  label: "St-Hubert",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default stHubertTheme;
