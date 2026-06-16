import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Dynamite (dynamiteclothing.com — Groupe Dynamite's chic Montréal women's-
 * fashion brand, founded in Montréal in 1975) theme for the Sentropic token
 * structure.
 *
 * Dynamite publishes no design-token file and the live site is JS-rendered, so
 * the values below are INFERRED from Dynamite's sophisticated, minimal identity
 * (confident near-black on white with a warm blush accent) rather than read off
 * a static stylesheet. Because they are brand-inferred rather than measured from
 * computed CSS, they are flagged "à confirmer" generously here and in MAPPING.md.
 * We only reference font *names* ("'Inter', Helvetica, Arial, sans-serif" — the
 * clean modern sans the brand's minimal fashion editorial tone implies), never
 * font binaries.
 *
 * Dynamite's identity is a MINIMAL FASHION system: a confident near-black CTA on
 * a white page, warm-neutral subtle fills (a faint blush-tinted off-white), a
 * single warm BLUSH ROSE accent (#b76e79) used sparingly, sharp/near-square
 * rounding (fashion-minimal: 0–4px), thin warm-grey hairlines and a crisp black
 * focus outline. Where Sentropic needs a role Dynamite never colours (a brand
 * hue beyond the blush accent, feedback states), the closest neutral/system
 * value is used and the choice is noted "à confirmer" in MAPPING.md.
 *
 * Dynamite colour reference (brand-inferred, light theme — all à confirmer):
 *   Confident near-black (action / CTA / inverse) #1a1a1a   primary CTA / inverse
 *   Pure black (CTA hover)                         #000000   hover deepen
 *   White (surface default)                        #ffffff   page background
 *   Blush rose (accent)                            #b76e79   the single warm accent
 *   Ink — primary text                             #1a1a1a   confident near-black
 *   Secondary text                                 #555050   warm grey ink
 *   Muted text                                     #8a857f   warm grey (à confirmer)
 *   Subtle fill surface                            #f7f3f1   warm blush-neutral
 *   Subtle / field border                          #e6e2df   warm hairline
 *   Danger / error                                 #c0392b   restrained brick red
 */

// --- Dynamite raw colour palette (brand-inferred — all à confirmer) ----------
const dynamiteColor = {
  // The emphasis / CTA "brand" is a confident near-black. Dynamite uses it for
  // the primary call-to-action, the header band and inverse surfaces.
  black: "#1a1a1a", // CTA fill / inverse surface (confident near-black) — à confirmer
  blackHover: "#000000", // pure black — CTA hover deepen — à confirmer
  white: "#ffffff", // page background — surface default
  // The single warm BLUSH ROSE accent — used sparingly for highlights/accent.
  blush: "#b76e79", // warm blush rose accent — à confirmer
  // Warm monochrome ink scale (each value brand-inferred). Dynamite body text is
  // a confident near-black (#1a1a1a), with warm-grey secondary/muted greys.
  ink: {
    // Primary body text — the confident near-black.
    primary: "#1a1a1a", // confident near-black body text — à confirmer
    // Secondary text — a warm grey ink.
    secondary: "#555050", // warm grey secondary text — à confirmer
    // Muted text — a lighter warm grey.
    muted: "#8a857f" // warm grey muted text — à confirmer
  },
  // Neutral surface / line greys — warm-toned to match the blush identity.
  grey: {
    subtle: "#f7f3f1", // warm blush-neutral subtle fill surface — à confirmer
    border: "#e6e2df" // warm hairline border — à confirmer
  },
  // Dynamite shows essentially no decorative colour beyond the blush accent, so
  // it publishes no success/warning/error/info hues. These are restrained,
  // legible (WCAG AA on white) system colours chosen to stay quiet against the
  // minimal aesthetic. The danger red is the brief's restrained brick red; the
  // rest are "à confirmer" — Dynamite has no inferred equivalent.
  system: {
    danger: "#c0392b", // restrained brick red — error / sale accent — à confirmer
    success: "#2e7d32", // muted green — à confirmer (no Dynamite source)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#1a1a1a" // Dynamite would use its confident near-black, not blue — à confirmer
  }
} as const;

// --- foundation (Dynamite-specific values) -----------------------------------
const foundation = {
  color: {
    // Dynamite has no brand blue. The Sentropic "blue" role family (action /
    // primary / link) is mapped onto the near-black/ink scale — the Dynamite
    // primary action IS the confident near-black. (à confirmer: no blue at all.)
    blue: {
      10: dynamiteColor.grey.subtle, // #f7f3f1 lightest warm neutral tint
      60: dynamiteColor.black, // #1a1a1a primary action (confident near-black CTA)
      80: dynamiteColor.blackHover // #000000 darker step (CTA hover deepen)
    },
    // The Sentropic "cyan" accent slot is mapped to the single warm BLUSH ROSE
    // accent Dynamite has — the one decorative hue in the identity. (à confirmer.)
    cyan: {
      10: dynamiteColor.grey.subtle, // #f7f3f1 light warm neutral tint
      50: dynamiteColor.blush, // #b76e79 the warm blush accent
      70: dynamiteColor.black // #1a1a1a
    },
    // Sentropic "slate" role family mapped onto the Dynamite warm ink/grey scale.
    slate: {
      0: dynamiteColor.white, // #ffffff white
      10: dynamiteColor.grey.subtle, // #f7f3f1 warm subtle fill surface
      20: dynamiteColor.grey.border, // #e6e2df warm hairline / subtle border
      60: dynamiteColor.ink.secondary, // #555050 secondary text
      80: dynamiteColor.ink.primary, // #1a1a1a primary text (confident near-black)
      90: dynamiteColor.blackHover // #000000 darkest (pure black)
    },
    feedback: {
      success: dynamiteColor.system.success,
      warning: dynamiteColor.system.warning,
      error: dynamiteColor.system.danger,
      info: dynamiteColor.system.info
    }
  },
  // Dynamite's minimal fashion editorial tone implies a clean modern SANS —
  // "'Inter', Helvetica, Arial, sans-serif" across headings and body. We
  // reference the *names* only (à confirmer; the JS-rendered site's exact stack
  // could not be read). Mono is not part of Dynamite — the Sentropic mono stack
  // (kept from the Simons structural template) is preserved.
  font: {
    sans: "'Inter', Helvetica, Arial, sans-serif",
    display: "'Inter', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. Dynamite's grid is whitespace-generous but its
  // raw spacing steps are not tokenised publicly; kept aligned with the Sentropic
  // base 4px scale ("à confirmer" exact steps).
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
  // Dynamite reads SHARP / fashion-minimal — near-square rounding. Controls are
  // square or barely rounded; cards take a gentle 4px at most. (Inferred steps;
  // pill kept at 999px for completeness — à confirmer.)
  radius: {
    none: "0", // square slot
    sm: "0", // smallest controls — square
    md: "2px", // button / input / tabs — barely rounded 2px (inferred)
    lg: "4px", // cards — gentle 4px (inferred)
    pill: "999px" // tags / pills
  },
  // Dynamite elevation is restrained — it relies on hairlines and whitespace,
  // with soft, low shadows on raised elements. Kept conservative and black-tinted
  // ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.14)"
  },
  // Dynamite animates with short, standard eases (inferred ≈ 150ms transitions).
  // Durations not tokenised publicly; kept aligned with the base.
  motion: {
    fast: "120ms",
    normal: "150ms", // inferred button transition duration
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Dynamite-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Dynamite) ---------------------------------------
  // Dynamite borders are thin WARM-GREY hairlines (#e6e2df @1px). Encoded as 1px
  // thin / 2px thick.
  borderWidth: {
    none: "0",
    thin: "1px", // Dynamite warm hairline (#e6e2df)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Dynamite control density. Inferred CTA buttons sit ~44px tall with generous
  // horizontal padding; nav/body text is mid-sized sans. md targets a ~44px touch
  // height; sm/lg bracket it (à confirmer).
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // Dynamite typography = the clean modern sans. Control labels are mid-weight;
  // body/field text is sentence case. Fashion CTAs are often UPPERCASE-tracked
  // (inferred letter-spacing on the primary buttons — à confirmer).
  typography: {
    control: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "500", lineHeight: "1.2", letterSpacing: "0.04em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.875rem", weight: "400", lineHeight: "1.4", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Dynamite links are plain ink at rest; the hover affordance is an underline.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // Dynamite dims disabled controls (minimal, near-ghost)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // Dynamite FOCUS = a crisp near-black OUTLINE (~2px solid #1a1a1a). We encode
  // the black outline strategy. focus.color = #1a1a1a.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: dynamiteColor.black, // #1a1a1a — Dynamite focuses in near-black, not a colour
    inset: "0"
  },
  // Dynamite form fields are BOXED (outline): a white fill with a thin warm-grey
  // hairline border and a barely-there 2px radius. `style: "outline"` makes the
  // builder draw four equal borders from `surface.default` + `border.subtle`.
  // Inferred input/select border = #e6e2df @1px hairline (à confirmer).
  field: {
    style: "outline",
    fillBg: dynamiteColor.white, // #ffffff
    underlineColor: dynamiteColor.grey.border, // #e6e2df (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the near-black with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%231a1a1a' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Dynamite cards: gentle 4px rounding, a thin warm-grey hairline rather than a
  // heavy box, with a faint warm hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: dynamiteColor.grey.subtle // #f7f3f1 faint warm hover tint
  },
  // Dynamite secondary button = a soft warm-grey filled chip (light #f7f3f1 fill,
  // ink text, slightly darker warm grey on hover) — the quiet alternative to the
  // filled near-black primary.
  buttonSecondary: {
    background: dynamiteColor.grey.subtle, // #f7f3f1 soft warm fill
    border: dynamiteColor.grey.border, // #e6e2df warm hairline
    hoverBackground: dynamiteColor.grey.border // #e6e2df on hover
  },
  // Dynamite tabs / sub-nav: active tab = near-black bold label with a near-black
  // bottom underline (the minimal indicator), transparent fill.
  tabs: {
    activeText: dynamiteColor.black, // #1a1a1a
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem", // 18px
    indicatorSide: "bottom", // near-black underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline (not a box-shadow filet)
  },
  // Dynamite pagination: borderless ink text links; active page = filled near-
  // black box with white text (the monochrome equivalent of a brand fill).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: dynamiteColor.ink.primary, // #1a1a1a link text
    activeBackground: dynamiteColor.black, // #1a1a1a filled active page
    activeText: dynamiteColor.white, // white on near-black
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // Dynamite breadcrumb: ink links, warm-grey trail, near-black current page,
  // warm-grey separators.
  breadcrumb: {
    linkText: dynamiteColor.ink.primary, // #1a1a1a
    text: dynamiteColor.ink.secondary, // #555050 trail text
    currentText: dynamiteColor.black, // #1a1a1a current page
    separator: dynamiteColor.ink.secondary, // #555050
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.125rem", // 18px
    currentWeight: "500" // current page is mildly emphasised
  },
  // Dynamite notice / alert: a minimal box — a thin coloured left filet on a
  // white box, no fill. The severity accent is a slim left bar.
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
  // Dynamite accordion / disclosure: an ink, plain-weight sans summary trigger,
  // gentle rounding, hairline separated.
  accordion: {
    text: dynamiteColor.ink.primary, // #1a1a1a summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // rows are flush to the column
    fontSize: "0.875rem", // 14px
    fontWeight: "400", // regular weight sans
    lineHeight: "1.25rem" // 20px
  },
  // Dynamite tag: a small soft warm-grey chip with very gentle rounding.
  tag: {
    radius: "2px", // gentle rounding (matches md)
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "400",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: dynamiteColor.grey.subtle, // #f7f3f1 subtle warm fill
    neutralText: dynamiteColor.ink.primary // #1a1a1a
  },
  // Dynamite badge: a small filled badge — near-black fill / white text,
  // uppercase, gentle 2px rounding.
  badge: {
    radius: "2px", // gentle rounding
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    textTransform: "uppercase", // Dynamite labels are often uppercase
    minHeight: "1.25rem", // 20px
    infoBackground: dynamiteColor.black, // #1a1a1a (Dynamite "info" = near-black, not blue)
    infoText: dynamiteColor.white // white on near-black
  },
  // Dynamite checkbox/radio label: small ink sans.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: dynamiteColor.ink.primary // #1a1a1a
  },
  // Dynamite search input: a boxed warm hairline field, sans type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Dynamite toggle / switch label: small ink sans.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: dynamiteColor.ink.primary // #1a1a1a
  }
} as const;

// --- semantic (Dynamite-specific role mapping) -------------------------------
const semantic = {
  surface: {
    default: dynamiteColor.white, // #ffffff white
    subtle: dynamiteColor.grey.subtle, // #f7f3f1 warm subtle fill surface
    raised: dynamiteColor.white, // #ffffff white
    inverse: dynamiteColor.black, // #1a1a1a confident near-black inverse surface (CTA/header tone)
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop — black @50%
  },
  text: {
    primary: dynamiteColor.ink.primary, // #1a1a1a (confident near-black body text)
    secondary: dynamiteColor.ink.secondary, // #555050 warm grey
    muted: dynamiteColor.ink.muted, // #8a857f (à confirmer)
    inverse: dynamiteColor.white, // white on near-black / dark surfaces
    link: dynamiteColor.ink.primary // #1a1a1a — Dynamite links are ink, not coloured
  },
  border: {
    subtle: dynamiteColor.grey.border, // #e6e2df warm hairline (field / divider)
    strong: dynamiteColor.ink.secondary, // #555050 stronger border
    interactive: dynamiteColor.black // #1a1a1a focus / interactive
  },
  action: {
    primary: dynamiteColor.black, // #1a1a1a primary button (the confident near-black CTA)
    primaryHover: dynamiteColor.blackHover, // #000000 — deepened to pure black on hover
    primaryText: dynamiteColor.white, // white text on near-black
    secondary: dynamiteColor.grey.subtle, // #f7f3f1 secondary surface
    secondaryHover: dynamiteColor.grey.border, // #e6e2df
    secondaryText: dynamiteColor.ink.primary, // #1a1a1a
    danger: dynamiteColor.system.danger // #c0392b
  },
  feedback: {
    success: dynamiteColor.system.success,
    warning: dynamiteColor.system.warning,
    error: dynamiteColor.system.danger,
    info: dynamiteColor.system.info
  },
  status: {
    pending: dynamiteColor.system.warning,
    processing: dynamiteColor.system.info,
    completed: dynamiteColor.system.success,
    failed: dynamiteColor.system.danger
  },
  // Categorical data-vis palette. Dynamite publishes no data-vis scale and uses
  // little decorative colour, so this is a coherent proposal: the confident
  // near-black + the warm blush accent lead, then warm greys, then the restrained
  // system hues — drawn to honour the minimal identity (see MAPPING.md,
  // "à confirmer" — not an official scale).
  data: {
    category1: dynamiteColor.black, // #1a1a1a confident near-black
    category2: dynamiteColor.blush, // #b76e79 warm blush accent
    category3: dynamiteColor.ink.secondary, // #555050 warm grey
    category4: dynamiteColor.ink.muted, // #8a857f warm grey
    category5: dynamiteColor.grey.border, // #e6e2df warm hairline grey
    category6: dynamiteColor.system.danger, // restrained red (à confirmer)
    category7: dynamiteColor.system.success, // restrained green (à confirmer)
    category8: dynamiteColor.system.warning // restrained amber (à confirmer)
  }
} as const;

/**
 * The Dynamite theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Dynamite-specific (minimal-fashion confident
 * near-black + warm blush accent) values, and the `component` layer is REBUILT
 * from this theme's own semantic/foundation via `createComponent` — so Dynamite's
 * confident-near-black-on-white sans identity reaches the components (buttons,
 * tabs, pagination, chat bubbles…), not just the elements that read semantic
 * vars directly.
 */
export const dynamiteTheme: TenantTheme = {
  id: "dynamite",
  label: "Dynamite",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default dynamiteTheme;
