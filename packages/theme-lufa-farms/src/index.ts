import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Lufa Farms (lufa.com — the Montréal urban rooftop-greenhouse company and
 * online grocery marketplace founded in 2009) theme for the Sentropic token
 * structure.
 *
 * Lufa publishes no design-token file, and lufa.com is heavily JS-rendered
 * (its computed CSS is not easily scraped statically), so the values below are
 * INFERRED from Lufa's fresh, organic brand identity rather than measured from a
 * stable stylesheet — every colour is therefore flagged "à confirmer" in
 * MAPPING.md. We only reference font *names* here ("'Inter', Helvetica, Arial,
 * sans-serif" — the clean humanist sans Lufa's interface reads as), never font
 * binaries. Sources and the full mapping table are in MAPPING.md.
 *
 * Lufa's identity is a FRESH / ORGANIC system: a clean white canvas, a vivid
 * leaf-green CTA, a deep forest-green for emphasis, near-black readable body
 * ink with a faintly green-tinted secondary grey, soft greenish hairlines and
 * subtle fills, gentle friendly rounding (8px controls, 12px cards), and a
 * green focus outline. The brand "colour" is the leaf green — used for the
 * primary call-to-action, active tabs/pagination/breadcrumb and the first
 * data-vis category. Where Sentropic needs a role Lufa never colours (an
 * accent, certain feedback states), the closest green/neutral value is used
 * (or a restrained system colour for feedback) and the choice is noted
 * "à confirmer" in MAPPING.md.
 *
 * Lufa colour reference (brand-inferred, light theme — à confirmer):
 *   Leaf green (action / CTA / brand)   #6cb33f   vivid Lufa leaf green CTA
 *   Leaf green hover                     #5a9633   darker leaf on hover
 *   Deep forest green                    #2f5d1e   emphasis / second data category
 *   White (surface default)              #ffffff   clean page canvas
 *   Ink — primary text                   #1a1a1a   near-black readable body text
 *   Secondary text                       #555a52   green-tinted grey
 *   Muted text / border-strong           #8a9384   muted sage grey
 *   Subtle fill surface                  #f4f7f1   faint green-white fill
 *   Subtle / field border                #dce4d6   soft green hairline
 *   Inverse surface                      #1a1a1a   near-black inverse band
 *   Danger / error                       #d72020   sale / error red
 */

// --- Lufa Farms raw colour palette (brand-inferred — à confirmer) -----------
const lufaColor = {
  // The brand / CTA is the vivid Lufa leaf green. Used for the primary
  // call-to-action and the brand accent throughout. (à confirmer — inferred.)
  leaf: "#6cb33f", // primary action / CTA fill — vivid leaf green
  leafHover: "#5a9633", // darker leaf green on hover
  // Deep forest green — used for emphasis and the second data-vis category.
  forest: "#2f5d1e", // deep green — emphasis / strong brand tone
  white: "#ffffff", // page background — surface default
  // Near-black / green-tinted-grey ink scale (brand-inferred).
  ink: {
    // Primary body text — a near-black, highly readable.
    primary: "#1a1a1a", // near-black body text colour
    // Secondary text — a soft green-tinted grey.
    secondary: "#555a52", // green-tinted secondary text grey
    // Muted text — a sage grey.
    muted: "#8a9384" // muted sage grey — muted text / strong border
  },
  // Neutral / green-tinted surface + line greys.
  grey: {
    subtle: "#f4f7f1", // faint green-white subtle fill surface
    border: "#dce4d6" // soft green hairline — subtle / field border
  },
  // Inverse surface tone (near-black band — footer / inverse blocks).
  inverse: "#1a1a1a",
  // Feedback / system hues. Lufa's grocery UI shows a sale/error red; the
  // success role naturally maps onto Lufa's own greens, while warning/info are
  // restrained, AA-on-white choices ("à confirmer" — no measured equivalent).
  system: {
    danger: "#d72020", // red — error / sale accent (à confirmer)
    success: "#2f5d1e", // Lufa forest green doubles as success (à confirmer)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#2f5d1e" // Lufa would use its green, not blue — à confirmer
  }
} as const;

// --- foundation (Lufa Farms-specific values) --------------------------------
const foundation = {
  color: {
    // Lufa has no brand blue. The Sentropic "blue" role family (action / primary
    // / link) is mapped onto the leaf/forest green scale — the Lufa primary
    // action IS leaf green. (à confirmer: Lufa has no blue.)
    blue: {
      10: lufaColor.grey.subtle, // #f4f7f1 lightest neutral tint
      60: lufaColor.leaf, // #6cb33f primary action (Lufa leaf-green CTA)
      80: lufaColor.forest // #2f5d1e deep green (darker action step)
    },
    // Lufa has no cyan/accent. The Sentropic "cyan" accent slot is also mapped
    // onto the green scale (no decorative cyan exists). (à confirmer.)
    cyan: {
      10: lufaColor.grey.subtle, // #f4f7f1 light neutral tint
      50: lufaColor.leaf, // #6cb33f leaf green as the only "accent"
      70: lufaColor.forest // #2f5d1e deep green
    },
    // Sentropic "slate" role family mapped onto the Lufa near-black / green-grey
    // ink + neutral scale.
    slate: {
      0: lufaColor.white, // #ffffff white
      10: lufaColor.grey.subtle, // #f4f7f1 subtle green-white fill
      20: lufaColor.grey.border, // #dce4d6 soft green hairline
      60: lufaColor.ink.secondary, // #555a52 secondary text
      80: lufaColor.ink.primary, // #1a1a1a primary text (near-black)
      90: lufaColor.ink.primary // #1a1a1a darkest
    },
    feedback: {
      success: lufaColor.system.success,
      warning: lufaColor.system.warning,
      error: lufaColor.system.danger,
      info: lufaColor.system.info
    }
  },
  // Lufa's interface reads as a clean humanist SANS — "'Inter', Helvetica, Arial,
  // sans-serif" across headings and body, giving the fresh, modern grocery tone.
  // (à confirmer — JS-rendered, brand-inferred; we reference *names* only.) Mono
  // is not part of Lufa — the Sentropic mono stack (from Simons' template) is kept.
  font: {
    sans: "'Inter', Helvetica, Arial, sans-serif",
    display: "'Inter', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. Lufa's raw spacing steps are not tokenised
  // publicly; kept aligned with the Sentropic base 4px scale ("à confirmer").
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
  // Lufa reads FRESH / FRIENDLY — gentle, soft rounding: ~8px on controls/inputs
  // and ~12px on cards; not square, not pill. (Exact steps à confirmer; pill
  // kept at 999px for completeness.)
  radius: {
    none: "0", // square slot
    sm: "2px", // smallest controls — gentle 2px
    md: "8px", // button / input / tabs — friendly 8px (à confirmer)
    lg: "12px", // cards — soft 12px (à confirmer)
    pill: "999px" // tags / pills
  },
  // Lufa elevation is fresh and light — soft, low shadows on raised cards and
  // menus. Kept conservative ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.14)"
  },
  // Lufa animates with short, standard eases (≈ 150ms transitions, à confirmer).
  motion: {
    fast: "120ms",
    normal: "150ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Lufa-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Lufa Farms) -------------------------------------
  // Lufa borders are thin soft GREEN-GREY hairlines (#dce4d6 @1px). Encoded as
  // 1px thin / 2px thick.
  borderWidth: {
    none: "0",
    thin: "1px", // Lufa soft green hairline (#dce4d6)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Lufa control density. Friendly grocery buttons sit ~44px tall with generous
  // horizontal padding; nav/body text is mid-sized sans. md targets a ~44px
  // touch height; sm/lg bracket it. (à confirmer.)
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // Lufa typography = the clean humanist sans. Control labels are mid-weight
  // sans; body/field text is sentence case. CTAs are sentence/title case (not
  // tracked-uppercase like Simons). (à confirmer.)
  typography: {
    control: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "600", lineHeight: "1.2", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Lufa links are leaf-green text; the hover affordance is an underline.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // Lufa dims disabled controls
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // Lufa FOCUS = a leaf-green OUTLINE (~2px solid #6cb33f). We encode the green
  // outline strategy. (à confirmer.)
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: lufaColor.leaf, // #6cb33f — Lufa focuses in leaf green
    inset: "0"
  },
  // Lufa form fields are BOXED (outline): a white fill with a thin soft
  // green-grey hairline border and a friendly 8px radius. `style: "outline"`
  // makes the builder draw four equal borders from `surface.default` +
  // `border.subtle`. (à confirmer — input/select border #dce4d6 @1px.)
  field: {
    style: "outline",
    fillBg: lufaColor.white, // #ffffff
    underlineColor: lufaColor.grey.border, // #dce4d6 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the leaf green with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%236cb33f' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Lufa cards: friendly 12px rounding, a thin soft green-grey hairline, with a
  // faint green hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: lufaColor.grey.subtle // #f4f7f1 faint green-white hover tint
  },
  // Lufa secondary button = a soft-green chip (light #f4f7f1 fill, ink text,
  // slightly darker green-grey on hover) — the quiet alternative to the filled
  // leaf-green primary.
  buttonSecondary: {
    background: lufaColor.grey.subtle, // #f4f7f1 soft green fill
    border: lufaColor.grey.border, // #dce4d6 light green hairline
    hoverBackground: lufaColor.grey.border // #dce4d6 on hover
  },
  // Lufa tabs / sub-nav: active tab = leaf-green bold label with a leaf-green
  // bottom underline (the indicator), transparent fill.
  tabs: {
    activeText: lufaColor.leaf, // #6cb33f
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem", // 18px
    indicatorSide: "bottom", // leaf-green underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline (not a box-shadow filet)
  },
  // Lufa pagination: borderless ink text links; active page = filled leaf-green
  // box with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: lufaColor.ink.primary, // #1a1a1a link text
    activeBackground: lufaColor.leaf, // #6cb33f filled active page
    activeText: lufaColor.white, // white on leaf green
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // Lufa breadcrumb: ink links, grey trail, leaf-green current page, grey
  // separators — all sans type.
  breadcrumb: {
    linkText: lufaColor.ink.primary, // #1a1a1a
    text: lufaColor.ink.secondary, // #555a52 trail text
    currentText: lufaColor.leaf, // #6cb33f current page (brand accent)
    separator: lufaColor.ink.secondary, // #555a52
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.125rem", // 18px
    currentWeight: "500" // current page is mildly emphasised
  },
  // Lufa notice / alert: a minimal box — a thin coloured left filet on a white
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
  // Lufa accordion / disclosure: an ink, plain-weight sans summary trigger,
  // gentle rounding, hairline separated.
  accordion: {
    text: lufaColor.ink.primary, // #1a1a1a summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // rows are flush to the column
    fontSize: "0.875rem", // 14px
    fontWeight: "500", // medium weight sans
    lineHeight: "1.25rem" // 20px
  },
  // Lufa tag: a small soft-green chip with gentle rounding.
  tag: {
    radius: "8px", // friendly rounding (matches md)
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: lufaColor.grey.subtle, // #f4f7f1 subtle green fill
    neutralText: lufaColor.ink.primary // #1a1a1a
  },
  // Lufa badge: a small filled badge — leaf-green fill / white text, sentence
  // case, gentle rounding.
  badge: {
    radius: "8px", // friendly rounding
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "none", // Lufa labels are sentence case (not uppercase)
    minHeight: "1.25rem", // 20px
    infoBackground: lufaColor.leaf, // #6cb33f (Lufa "info" = leaf green, not blue)
    infoText: lufaColor.white // white on leaf green
  },
  // Lufa checkbox/radio label: small ink sans.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: lufaColor.ink.primary // #1a1a1a
  },
  // Lufa search input: a boxed soft green hairline field, sans type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Lufa toggle / switch label: small ink sans.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: lufaColor.ink.primary // #1a1a1a
  }
} as const;

// --- semantic (Lufa Farms-specific role mapping) ----------------------------
const semantic = {
  surface: {
    default: lufaColor.white, // #ffffff clean white canvas
    subtle: lufaColor.grey.subtle, // #f4f7f1 faint green-white fill surface
    raised: lufaColor.white, // #ffffff white
    inverse: lufaColor.inverse, // #1a1a1a near-black inverse surface
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop — black @50%
  },
  text: {
    primary: lufaColor.ink.primary, // #1a1a1a (near-black body text)
    secondary: lufaColor.ink.secondary, // #555a52 green-tinted secondary
    muted: lufaColor.ink.muted, // #8a9384 muted sage grey (à confirmer)
    inverse: lufaColor.white, // white on dark surfaces
    link: lufaColor.leaf // #6cb33f — Lufa links are leaf green
  },
  border: {
    subtle: lufaColor.grey.border, // #dce4d6 soft green hairline (field / divider)
    strong: lufaColor.ink.muted, // #8a9384 stronger sage border
    interactive: lufaColor.leaf // #6cb33f focus / interactive
  },
  action: {
    primary: lufaColor.leaf, // #6cb33f primary button (the leaf-green CTA)
    primaryHover: lufaColor.leafHover, // #5a9633 darker leaf on hover
    primaryText: lufaColor.white, // white text on leaf green
    secondary: lufaColor.grey.subtle, // #f4f7f1 secondary surface
    secondaryHover: lufaColor.grey.border, // #dce4d6
    secondaryText: lufaColor.ink.primary, // #1a1a1a
    danger: lufaColor.system.danger // #d72020
  },
  feedback: {
    success: lufaColor.system.success,
    warning: lufaColor.system.warning,
    error: lufaColor.system.danger,
    info: lufaColor.system.info
  },
  status: {
    pending: lufaColor.system.warning,
    processing: lufaColor.system.info,
    completed: lufaColor.system.success,
    failed: lufaColor.system.danger
  },
  // Categorical data-vis palette. Lufa publishes no data-vis scale, so this is a
  // coherent proposal led by the two brand greens, then neutral greys and the
  // restrained system hues, drawn to honour the fresh/organic identity (see
  // MAPPING.md, "à confirmer" — not an official scale).
  data: {
    category1: lufaColor.leaf, // #6cb33f leaf green
    category2: lufaColor.forest, // #2f5d1e deep forest green
    category3: lufaColor.ink.secondary, // #555a52 green-tinted grey
    category4: lufaColor.ink.muted, // #8a9384 sage grey
    category5: lufaColor.grey.border, // #dce4d6 soft green hairline grey
    category6: lufaColor.system.danger, // restrained red (à confirmer)
    category7: lufaColor.system.warning, // restrained amber (à confirmer)
    category8: lufaColor.ink.primary // near-black (à confirmer)
  }
} as const;

/**
 * The Lufa Farms theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Lufa-specific (fresh leaf-green)
 * values, and the `component` layer is REBUILT from this theme's own semantic/
 * foundation via `createComponent` — so Lufa's leaf-green-on-white identity
 * reaches the components (buttons, tabs, pagination, chat bubbles…), not just
 * the elements that read semantic vars directly.
 */
export const lufaFarmsTheme: TenantTheme = {
  id: "lufa-farms",
  label: "Lufa Farms",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default lufaFarmsTheme;
