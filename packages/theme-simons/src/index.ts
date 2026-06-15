import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Simons (simons.ca — La Maison Simons, the Québec City fashion retailer founded
 * in 1840) theme for the Sentropic token structure.
 *
 * Simons publishes no design-token file; the values below are MEASURED from the
 * live site's computed CSS (https://www.simons.ca, inspected in a real browser).
 * We only reference the font *names* here ("'Times New Roman', Times, serif" —
 * the measured elegant serif Simons uses for its editorial, boutique tone),
 * never font binaries. Sources and the full mapping table are in MAPPING.md.
 *
 * Simons' identity is a MINIMAL ELEGANT system: an editorial black-on-white look
 * built on a classic serif, soft grey inks rather than pure black body text,
 * a pure-black CTA, thin light-grey hairlines, very gentle rounding (2–4px), and
 * a crisp black focus outline. The brand "colour" is essentially monochrome —
 * black for emphasis/CTAs, graded greys for text and structure. Where Sentropic
 * needs a role Simons never colours (a brand hue, an accent, feedback states),
 * the closest neutral value is used (or a restrained system colour for feedback)
 * and the choice is noted "à confirmer" in MAPPING.md.
 *
 * Simons colour reference (measured, light theme):
 *   Black (action / CTA / inverse)     #010101   near-pure black CTA / footer tone
 *   White (surface default)            #ffffff   page background
 *   Ink — primary text                 #404040   rgb(64,64,64) soft-black body text
 *   Secondary text / strong border     #707070   rgb(112,112,112)
 *   Muted text                         #909090   rgb(144,144,144) (à confirmer)
 *   Subtle fill surface                #f1f1f1   rgb(241,241,241) light fill
 *   Subtle / field border              #d8d8d8   rgb(216,216,216) light hairline
 */

// --- Simons raw colour palette (measured from live computed CSS) ------------
const simonsColor = {
  // The emphasis / CTA "brand" is a near-pure black. Simons uses it for the
  // primary call-to-action, the footer band and inverse surfaces.
  black: "#010101", // CTA fill / footer / inverse surface (near-pure black)
  white: "#ffffff", // page background — surface default
  // Soft monochrome ink scale (each value measured from a real element). Simons
  // deliberately sets body text in a soft black (#404040), not pure #000.
  ink: {
    // Primary body text — a soft, elegant near-black.
    primary: "#404040", // rgb(64,64,64) — body text colour
    // Secondary text & strong borders.
    secondary: "#707070", // rgb(112,112,112) — secondary text / strong border
    // Muted text.
    muted: "#909090" // rgb(144,144,144) — muted text (à confirmer)
  },
  // Neutral surface / line greys.
  grey: {
    subtle: "#f1f1f1", // rgb(241,241,241) — subtle fill surface
    border: "#d8d8d8" // rgb(216,216,216) — subtle / field hairline border
  },
  // Simons shows essentially no decorative colour, so it publishes no success/
  // warning/error/info hues. These are restrained, legible (WCAG AA on white)
  // system colours chosen to stay quiet against the minimal aesthetic. The
  // danger red is matched to a measured sale/error accent; the rest are
  // "à confirmer" — Simons has no measured equivalent.
  system: {
    danger: "#b3001b", // deep red — error / sale accent (à confirmer)
    success: "#2e7d32", // muted green — à confirmer (no Simons source)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#404040" // Simons would use its soft ink, not blue — à confirmer
  }
} as const;

// --- foundation (Simons-specific values) ------------------------------------
const foundation = {
  color: {
    // Simons has no brand blue. The Sentropic "blue" role family (action /
    // primary / link) is mapped onto the monochrome black/ink scale — the Simons
    // primary action IS black. (à confirmer: Simons has no blue at all.)
    blue: {
      10: simonsColor.grey.subtle, // #f1f1f1 lightest neutral tint
      60: simonsColor.black, // #010101 primary action (Simons black CTA)
      80: simonsColor.black // #010101 (no darker step — Simons black is terminal)
    },
    // Simons has no cyan/accent. The Sentropic "cyan" accent slot is also mapped
    // to the monochrome scale (no decorative accent exists). (à confirmer.)
    cyan: {
      10: simonsColor.grey.subtle, // #f1f1f1 light neutral tint
      50: simonsColor.ink.secondary, // #707070 the only "accent" Simons has is grey
      70: simonsColor.black // #010101
    },
    // Sentropic "slate" role family mapped onto the Simons monochrome ink/grey
    // scale.
    slate: {
      0: simonsColor.white, // #ffffff white
      10: simonsColor.grey.subtle, // #f1f1f1 subtle fill surface
      20: simonsColor.grey.border, // #d8d8d8 hairline / subtle border
      60: simonsColor.ink.secondary, // #707070 secondary text
      80: simonsColor.ink.primary, // #404040 primary text (soft black)
      90: simonsColor.black // #010101 darkest (near-pure black)
    },
    feedback: {
      success: simonsColor.system.success,
      warning: simonsColor.system.warning,
      error: simonsColor.system.danger,
      info: simonsColor.system.info
    }
  },
  // Simons sets its UI in an elegant SERIF — measured "'Times New Roman', Times,
  // serif" across headings and body, giving the boutique/editorial tone. We
  // reference the *names* only. Mono is not part of Simons — the Sentropic mono
  // stack is kept.
  font: {
    sans: "'Times New Roman', Times, serif",
    display: "'Times New Roman', Times, serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. Simons' grid is whitespace-generous but its raw
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
  // Simons uses VERY GENTLE rounding — measured ~2px on controls/inputs and ~4px
  // on cards; not square, not pill. The brand reads "soft minimal", not boxy.
  // (Exact steps à confirmer; pill kept at 999px for completeness.)
  radius: {
    none: "0", // square slot
    sm: "0", // smallest controls — square
    md: "2px", // button / input / tabs — gentle 2px (measured)
    lg: "4px", // cards — soft 4px (measured)
    pill: "999px" // tags / pills
  },
  // Simons elevation is restrained — it relies on hairlines and whitespace, with
  // soft, low shadows on raised elements. Kept conservative and black-tinted
  // ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.14)"
  },
  // Simons animates with short, standard eases (measured ≈ 150ms transitions).
  // Durations not fully tokenised publicly; kept aligned with the base.
  motion: {
    fast: "120ms",
    normal: "150ms", // measured button transition duration
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Simons-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Simons) -----------------------------------------
  // Simons borders are thin LIGHT-GREY hairlines (#d8d8d8 @1px). Encoded as 1px
  // thin / 2px thick.
  borderWidth: {
    none: "0",
    thin: "1px", // Simons hairline (#d8d8d8)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Simons control density. Measured CTA buttons sit ~44px tall with generous
  // horizontal padding; nav/body text is mid-sized serif. md targets a ~44px
  // touch height; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // Simons typography = the elegant serif. Control labels are mid-weight serif;
  // body/field text is sentence case. CTAs are often UPPERCASE-tracked on the
  // live site (measured letter-spacing on the primary buttons).
  typography: {
    control: { family: "'Times New Roman', Times, serif", size: "0.9375rem", weight: "500", lineHeight: "1.2", letterSpacing: "0.04em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Times New Roman', Times, serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Times New Roman', Times, serif", size: "0.875rem", weight: "400", lineHeight: "1.4", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Simons links are plain ink at rest; the hover affordance is an underline.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // Simons dims disabled controls (minimal, near-ghost)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // Simons FOCUS = a crisp black OUTLINE (~2px solid #010101). We encode the
  // black outline strategy.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: simonsColor.black, // #010101 — Simons focuses in black, not a colour
    inset: "0"
  },
  // Simons form fields are BOXED (outline): a white fill with a thin light-grey
  // hairline border and a gentle 2px radius. `style: "outline"` makes the builder
  // draw four equal borders from `surface.default` + `border.subtle`. Measured
  // input/select border = #d8d8d8 @1px hairline.
  field: {
    style: "outline",
    fillBg: simonsColor.white, // #ffffff
    underlineColor: simonsColor.grey.border, // #d8d8d8 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the soft ink with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23404040' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Simons cards: gentle 4px rounding, a thin light-grey hairline rather than a
  // heavy box, with a faint hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: simonsColor.grey.subtle // #f1f1f1 faint hover tint
  },
  // Simons secondary button = a soft-grey filled chip (light #f1f1f1 fill, ink
  // text, slightly darker grey on hover) — the quiet alternative to the filled
  // black primary.
  buttonSecondary: {
    background: simonsColor.grey.subtle, // #f1f1f1 soft fill
    border: simonsColor.grey.border, // #d8d8d8 light hairline
    hoverBackground: simonsColor.grey.border // #d8d8d8 on hover
  },
  // Simons tabs / sub-nav: active tab = black bold serif label with a black
  // bottom underline (the minimal indicator), transparent fill.
  tabs: {
    activeText: simonsColor.black, // #010101
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem", // 18px
    indicatorSide: "bottom", // black underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline (not a box-shadow filet)
  },
  // Simons pagination: borderless ink text links; active page = filled black
  // box with white text (the monochrome equivalent of a brand fill).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: simonsColor.ink.primary, // #404040 link text
    activeBackground: simonsColor.black, // #010101 filled active page
    activeText: simonsColor.white, // white on black
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // Simons breadcrumb: ink links, grey trail, black current page, grey
  // separators — all serif type.
  breadcrumb: {
    linkText: simonsColor.ink.primary, // #404040
    text: simonsColor.ink.secondary, // #707070 trail text
    currentText: simonsColor.black, // #010101 current page
    separator: simonsColor.ink.secondary, // #707070
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.125rem", // 18px
    currentWeight: "500" // current page is mildly emphasised
  },
  // Simons notice / alert: a minimal box — a thin coloured left filet on a white
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
  // Simons accordion / disclosure: an ink, plain-weight serif summary trigger,
  // gentle rounding, hairline separated.
  accordion: {
    text: simonsColor.ink.primary, // #404040 summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // rows are flush to the column
    fontSize: "0.875rem", // 14px
    fontWeight: "400", // regular weight serif
    lineHeight: "1.25rem" // 20px
  },
  // Simons tag: a small soft-grey chip with very gentle rounding.
  tag: {
    radius: "2px", // gentle rounding (matches md)
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "400",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: simonsColor.grey.subtle, // #f1f1f1 subtle fill
    neutralText: simonsColor.ink.primary // #404040
  },
  // Simons badge: a small filled badge — black fill / white text, uppercase,
  // gentle 2px rounding.
  badge: {
    radius: "2px", // gentle rounding
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    textTransform: "uppercase", // Simons labels are often uppercase
    minHeight: "1.25rem", // 20px
    infoBackground: simonsColor.black, // #010101 (Simons "info" = black, not blue)
    infoText: simonsColor.white // white on black
  },
  // Simons checkbox/radio label: small ink serif.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: simonsColor.ink.primary // #404040
  },
  // Simons search input: a boxed light hairline field, serif type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Simons toggle / switch label: small ink serif.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: simonsColor.ink.primary // #404040
  }
} as const;

// --- semantic (Simons-specific role mapping) --------------------------------
const semantic = {
  surface: {
    default: simonsColor.white, // #ffffff white
    subtle: simonsColor.grey.subtle, // #f1f1f1 subtle fill surface
    raised: simonsColor.white, // #ffffff white
    inverse: simonsColor.black, // #010101 near-pure black inverse surface (CTA/footer tone)
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop — black @50%
  },
  text: {
    primary: simonsColor.ink.primary, // #404040 (measured soft-black body text)
    secondary: simonsColor.ink.secondary, // #707070
    muted: simonsColor.ink.muted, // #909090 (à confirmer)
    inverse: simonsColor.white, // white on black / dark surfaces
    link: simonsColor.ink.primary // #404040 — Simons links are ink, not coloured
  },
  border: {
    subtle: simonsColor.grey.border, // #d8d8d8 light hairline (field / divider)
    strong: simonsColor.ink.secondary, // #707070 stronger border
    interactive: simonsColor.black // #010101 focus / interactive
  },
  action: {
    primary: simonsColor.black, // #010101 primary button (the black CTA)
    primaryHover: simonsColor.ink.primary, // #404040 — slightly lifted black on hover (à confirmer)
    primaryText: simonsColor.white, // white text on black
    secondary: simonsColor.grey.subtle, // #f1f1f1 secondary surface
    secondaryHover: simonsColor.grey.border, // #d8d8d8
    secondaryText: simonsColor.ink.primary, // #404040
    danger: simonsColor.system.danger // #b3001b
  },
  feedback: {
    success: simonsColor.system.success,
    warning: simonsColor.system.warning,
    error: simonsColor.system.danger,
    info: simonsColor.system.info
  },
  status: {
    pending: simonsColor.system.warning,
    processing: simonsColor.system.info,
    completed: simonsColor.system.success,
    failed: simonsColor.system.danger
  },
  // Categorical data-vis palette. Simons publishes no data-vis scale and uses no
  // decorative colour, so this is a coherent MONOCHROME proposal (a black→grey
  // ramp) plus the restrained system hues, drawn to honour the minimal identity
  // (see MAPPING.md, "à confirmer" — not an official scale).
  data: {
    category1: simonsColor.black, // #010101
    category2: simonsColor.ink.primary, // #404040
    category3: simonsColor.ink.secondary, // #707070
    category4: simonsColor.ink.muted, // #909090
    category5: simonsColor.grey.border, // #d8d8d8
    category6: simonsColor.system.danger, // restrained red (à confirmer)
    category7: simonsColor.system.success, // restrained green (à confirmer)
    category8: simonsColor.system.warning // restrained amber (à confirmer)
  }
} as const;

/**
 * The Simons theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Simons-specific (minimal elegant serif)
 * values, and the `component` layer is REBUILT from this theme's own semantic/
 * foundation via `createComponent` — so Simons' soft-black-on-white serif
 * identity reaches the components (buttons, tabs, pagination, chat bubbles…),
 * not just the elements that read semantic vars directly.
 */
export const simonsTheme: TenantTheme = {
  id: "simons",
  label: "Simons",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default simonsTheme;
