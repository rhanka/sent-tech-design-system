import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Énergir (energir.com — the Québec natural-gas / energy utility, formerly
 * Gaz Métro) theme for the Sentropic token structure.
 *
 * Énergir publishes no public design-token file; the values below are MEASURED
 * from the live site's computed CSS (https://www.energir.com, inspected in a
 * real browser). We only reference the font *names* here ("Arial, Helvetica,
 * sans-serif" — the measured web-safe Arial stack Énergir ships), never font
 * binaries. Sources and the full mapping table are in MAPPING.md.
 *
 * Énergir's identity is a BLUE + DEEP-NAVY institutional utility system: a
 * confident corporate blue CTA (#0047bb), a deep navy (#002855) used for the
 * hover state and the inverse/footer band, and a cyan accent (#009fdf) drawn
 * from the brand's energy/gas-flame graphic language. Body text is a soft near
 * black (#1a1a1a) over white with a measured grey secondary ink (#58595b),
 * thin cool-blue hairlines (#d2dcea), and institutional (low) rounding. Where
 * Sentropic needs a role Énergir never colours (extra data categories, some
 * feedback states), the closest measured value is used and the choice is noted
 * "à confirmer" in MAPPING.md.
 *
 * Énergir colour reference (measured, light theme):
 *   Énergir blue (action / CTA)        #0047bb   measured primary blue CTA
 *   Deep navy (hover / inverse)        #002855   measured deep navy band / hover
 *   Cyan accent                        #009fdf   measured energy/gas cyan accent
 *   White (surface default)            #ffffff   page background
 *   Ink — primary text                 #1a1a1a   near-black body text
 *   Secondary text                     #58595b   measured rgb(88,89,91) grey ink
 *   Muted text                         #8a8f96   muted grey (à confirmer)
 *   Subtle fill surface                #f1f5fb   pale cool-blue fill
 *   Subtle / field border              #d2dcea   thin cool-blue hairline
 *   Danger / error                     #d72020   error / alert red
 */

// --- Énergir raw colour palette (measured from live computed CSS) -----------
const energirColor = {
  // The emphasis / CTA "brand" is Énergir's corporate blue. Used for the
  // primary call-to-action, links, active tabs/pagination/breadcrumb.
  blue: "#0047bb", // measured primary blue CTA / link / active accent
  // Deep navy — the hover state of the blue CTA and the inverse/footer band.
  navy: "#002855", // measured deep navy — primaryHover + inverse surface
  // Cyan accent drawn from the brand's energy/gas-flame graphic language.
  cyan: "#009fdf", // measured cyan accent
  white: "#ffffff", // page background — surface default
  // Soft ink scale (each value measured from a real element). Énergir sets body
  // text in a soft near-black (#1a1a1a), not pure #000.
  ink: {
    // Primary body text — a soft near-black.
    primary: "#1a1a1a", // near-black body text colour
    // Secondary text — measured cool grey.
    secondary: "#58595b", // rgb(88,89,91) — measured secondary text
    // Muted text.
    muted: "#8a8f96" // muted grey (à confirmer — no exact measured token)
  },
  // Neutral surface / line greys (cool, blue-tinted to match the brand).
  grey: {
    subtle: "#f1f5fb", // pale cool-blue subtle fill surface
    border: "#d2dcea" // thin cool-blue hairline / field border
  },
  // Énergir shows a measured danger red; the remaining feedback hues are
  // restrained, legible (WCAG AA on white) system colours chosen to sit with
  // the institutional blue aesthetic. The danger red is measured; the rest are
  // "à confirmer" — Énergir has no measured equivalent.
  system: {
    danger: "#d72020", // measured error / alert red
    success: "#2e7d32", // muted green — à confirmer (no Énergir source)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#0047bb" // Énergir would use its brand blue for info — à confirmer
  }
} as const;

// --- foundation (Énergir-specific values) -----------------------------------
const foundation = {
  color: {
    // The Sentropic "blue" role family (action / primary / link) maps directly
    // onto Énergir's corporate blue → deep navy ramp.
    blue: {
      10: energirColor.grey.subtle, // #f1f5fb lightest cool-blue tint
      60: energirColor.blue, // #0047bb primary action (Énergir blue CTA)
      80: energirColor.navy // #002855 darkest step (deep navy hover/inverse)
    },
    // The Sentropic "cyan" accent slot maps onto Énergir's measured cyan accent.
    cyan: {
      10: energirColor.grey.subtle, // #f1f5fb light cool tint
      50: energirColor.cyan, // #009fdf measured cyan accent
      70: energirColor.navy // #002855 deepened toward navy
    },
    // Sentropic "slate" role family mapped onto Énergir's ink/grey neutral scale.
    slate: {
      0: energirColor.white, // #ffffff white
      10: energirColor.grey.subtle, // #f1f5fb subtle fill surface
      20: energirColor.grey.border, // #d2dcea hairline / subtle border
      60: energirColor.ink.secondary, // #58595b secondary text
      80: energirColor.ink.primary, // #1a1a1a primary text (near-black)
      90: energirColor.navy // #002855 darkest (deep navy)
    },
    feedback: {
      success: energirColor.system.success,
      warning: energirColor.system.warning,
      error: energirColor.system.danger,
      info: energirColor.system.info
    }
  },
  // Énergir sets its UI in the web-safe Arial stack — measured "Arial,
  // Helvetica, sans-serif" across headings and body. We reference the *names*
  // only (no binaries — Arial is system-resident). Mono is not part of Énergir —
  // the Sentropic mono stack is kept.
  font: {
    sans: "Arial, Helvetica, sans-serif",
    display: "Arial, Helvetica, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. Énergir's raw spacing steps are not strongly
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
  // Énergir uses INSTITUTIONAL (low) rounding — measured ~2px on small controls,
  // ~4px on buttons/inputs, ~8px on cards; corporate-clean, not boxy, not pill.
  radius: {
    none: "0", // square slot
    sm: "2px", // smallest controls (measured)
    md: "4px", // button / input / tabs (measured)
    lg: "8px", // cards (measured)
    pill: "999px" // tags / pills
  },
  // Énergir elevation is restrained corporate — soft, low, cool-tinted shadows
  // on raised elements, leaning on hairlines and whitespace ("à confirmer"
  // exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 40 85 / 0.06)",
    medium: "0 4px 12px rgb(0 40 85 / 0.10)",
    floating: "0 8px 24px rgb(0 40 85 / 0.14)"
  },
  // Énergir animates with short, standard eases (measured ≈ 150–200ms
  // transitions). Durations not fully tokenised publicly; kept aligned with the
  // base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "150ms", // measured button transition duration
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Énergir-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Énergir) ----------------------------------------
  // Énergir borders are thin cool-blue hairlines (#d2dcea @1px). Encoded as 1px
  // thin / 2px thick.
  borderWidth: {
    none: "0",
    thin: "1px", // Énergir hairline (#d2dcea)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Énergir control density. Measured CTA buttons sit ~44px tall with generous
  // horizontal padding; nav/body text is mid-sized sans. md targets a ~44px
  // touch height; sm/lg bracket it ("à confirmer" exact steps).
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // Énergir typography = the Arial sans. Control labels are mid-weight; body/
  // field text is sentence case. CTAs are sentence/normal case on the live site
  // (no measured uppercase tracking on primary buttons).
  typography: {
    control: { family: "Arial, Helvetica, sans-serif", size: "0.9375rem", weight: "700", lineHeight: "1.2", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "Arial, Helvetica, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "Arial, Helvetica, sans-serif", size: "0.875rem", weight: "700", lineHeight: "1.4", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Énergir links are brand-blue and underlined on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // Énergir dims disabled controls
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // Énergir FOCUS = a brand-blue OUTLINE (~2px solid #0047bb). We encode the
  // blue outline strategy.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: energirColor.blue, // #0047bb — Énergir focuses in its brand blue
    inset: "0"
  },
  // Énergir form fields are BOXED (outline): a white fill with a thin cool-blue
  // hairline border and a 4px radius. `style: "outline"` makes the builder draw
  // four equal borders from `surface.default` + `border.subtle`. Measured input/
  // select border = #d2dcea @1px hairline.
  field: {
    style: "outline",
    fillBg: energirColor.white, // #ffffff
    underlineColor: energirColor.grey.border, // #d2dcea (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the brand blue with a 40px gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%230047bb' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Énergir cards: 8px rounding, a thin cool-blue hairline rather than a heavy
  // box, with a faint cool hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: energirColor.grey.subtle // #f1f5fb faint cool hover tint
  },
  // Énergir secondary button = an outlined blue button (white fill, blue text/
  // border, faint blue tint on hover) — the quiet alternative to the filled
  // blue primary. Encoded here via the subtle fill family.
  buttonSecondary: {
    background: energirColor.white, // #ffffff white fill
    border: energirColor.blue, // #0047bb blue outline
    hoverBackground: energirColor.grey.subtle // #f1f5fb faint blue tint on hover
  },
  // Énergir tabs / sub-nav: active tab = blue bold label with a blue bottom
  // underline (the indicator), transparent fill.
  tabs: {
    activeText: energirColor.blue, // #0047bb
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem", // 18px
    indicatorSide: "bottom", // blue underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline (not a box-shadow filet)
  },
  // Énergir pagination: borderless ink text links; active page = filled blue box
  // with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: energirColor.ink.primary, // #1a1a1a link text
    activeBackground: energirColor.blue, // #0047bb filled active page
    activeText: energirColor.white, // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // Énergir breadcrumb: ink links, grey trail, blue current page, grey
  // separators — all Arial sans type.
  breadcrumb: {
    linkText: energirColor.ink.primary, // #1a1a1a
    text: energirColor.ink.secondary, // #58595b trail text
    currentText: energirColor.blue, // #0047bb current page
    separator: energirColor.ink.secondary, // #58595b
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.125rem", // 18px
    currentWeight: "700" // current page emphasised
  },
  // Énergir notice / alert: a box with a slim coloured left filet, no fill. The
  // severity accent is a slim left bar.
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
  // Énergir accordion / disclosure: an ink, bold-weight sans summary trigger,
  // gentle rounding, hairline separated.
  accordion: {
    text: energirColor.ink.primary, // #1a1a1a summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // rows are flush to the column
    fontSize: "0.875rem", // 14px
    fontWeight: "700", // bold sans summary
    lineHeight: "1.25rem" // 20px
  },
  // Énergir tag: a small pale cool-blue chip with gentle rounding.
  tag: {
    radius: "4px", // gentle rounding (matches md)
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "400",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: energirColor.grey.subtle, // #f1f5fb subtle fill
    neutralText: energirColor.ink.primary // #1a1a1a
  },
  // Énergir badge: a small filled badge — blue fill / white text, gentle 4px
  // rounding.
  badge: {
    radius: "4px", // gentle rounding
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "700",
    lineHeight: "1rem", // 16px
    textTransform: "none", // Énergir labels are sentence case
    minHeight: "1.25rem", // 20px
    infoBackground: energirColor.blue, // #0047bb (Énergir "info" = brand blue)
    infoText: energirColor.white // white on blue
  },
  // Énergir checkbox/radio label: small ink sans.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: energirColor.ink.primary // #1a1a1a
  },
  // Énergir search input: a boxed cool-blue hairline field, sans type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Énergir toggle / switch label: small ink sans.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: energirColor.ink.primary // #1a1a1a
  }
} as const;

// --- semantic (Énergir-specific role mapping) -------------------------------
const semantic = {
  surface: {
    default: energirColor.white, // #ffffff white
    subtle: energirColor.grey.subtle, // #f1f5fb pale cool-blue fill surface
    raised: energirColor.white, // #ffffff white
    inverse: energirColor.navy, // #002855 deep navy inverse surface (footer/header band)
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop — black @50%
  },
  text: {
    primary: energirColor.ink.primary, // #1a1a1a near-black body text
    secondary: energirColor.ink.secondary, // #58595b (measured)
    muted: energirColor.ink.muted, // #8a8f96 (à confirmer)
    inverse: energirColor.white, // white on navy / dark surfaces
    link: energirColor.blue // #0047bb — Énergir links are brand blue
  },
  border: {
    subtle: energirColor.grey.border, // #d2dcea cool-blue hairline (field / divider)
    strong: energirColor.ink.secondary, // #58595b stronger border
    interactive: energirColor.blue // #0047bb focus / interactive
  },
  action: {
    primary: energirColor.blue, // #0047bb primary button (the blue CTA)
    primaryHover: energirColor.navy, // #002855 deep navy on hover (measured)
    primaryText: energirColor.white, // white text on blue
    secondary: energirColor.grey.subtle, // #f1f5fb secondary surface
    secondaryHover: energirColor.grey.border, // #d2dcea
    secondaryText: energirColor.blue, // #0047bb secondary action is blue-labelled
    danger: energirColor.system.danger // #d72020
  },
  feedback: {
    success: energirColor.system.success,
    warning: energirColor.system.warning,
    error: energirColor.system.danger,
    info: energirColor.system.info
  },
  status: {
    pending: energirColor.system.warning,
    processing: energirColor.system.info,
    completed: energirColor.system.success,
    failed: energirColor.system.danger
  },
  // Categorical data-vis palette. Énergir publishes no data-vis scale, so this
  // is a coherent proposal built on the brand blue/navy/cyan ramp plus neutral
  // greys and the restrained system hues, drawn to honour the institutional
  // identity (see MAPPING.md, "à confirmer" — not an official scale).
  data: {
    category1: energirColor.blue, // #0047bb brand blue
    category2: energirColor.cyan, // #009fdf cyan accent
    category3: energirColor.navy, // #002855 deep navy
    category4: energirColor.ink.secondary, // #58595b grey
    category5: energirColor.ink.muted, // #8a8f96 muted grey
    category6: energirColor.system.danger, // restrained red (à confirmer)
    category7: energirColor.system.success, // restrained green (à confirmer)
    category8: energirColor.system.warning // restrained amber (à confirmer)
  }
} as const;

/**
 * The Énergir theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Énergir-specific (blue + deep-navy
 * institutional) values, and the `component` layer is REBUILT from this theme's
 * own semantic/foundation via `createComponent` — so Énergir's blue-on-white
 * Arial identity reaches the components (buttons, tabs, pagination, chat
 * bubbles…), not just the elements that read semantic vars directly.
 */
export const energirTheme: TenantTheme = {
  id: "energir",
  label: "Énergir",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default energirTheme;
