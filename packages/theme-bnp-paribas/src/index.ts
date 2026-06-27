import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * BNP Paribas brand theme for the Sentropic token structure.
 *
 * All values below are MEASURED from the PUBLIC BNP Paribas retail website
 * (mabanque.bnpparibas) production CSS — the AEM "socle" client libraries that
 * declare the brand's `--color-*`, `--font-*`, `--space-*`, `--cta-*` and
 * `--radius-*` custom properties. We only reference the font *names* here
 * ("BNP Sans", "BNP Type", "BNP Condensed" are proprietary BNPP typefaces — no
 * binaries are shipped). Sources are documented in MAPPING.md. Where BNP Paribas
 * has no direct equivalent for a Sentropic role, the closest measured token is
 * used and the choice is noted "à confirmer" in MAPPING.md.
 *
 * BNP Paribas colour reference (light, measured `--color-*`):
 *   White (background default)        #ffffff   (--color-neutral-000)
 *   Grey light (background alt)       #f5f5f5   (--color-neutral-200)
 *   Grey border subtle                #e7e7e7   (--color-neutral-300 / --form-color-border)
 *   Grey border input                 #cccccc   (--color-neutral-400 / --input-border)
 *   Grey text muted                   #767676   (--color-neutral-500 / --input-color)
 *   Grey secondary text               #6d6d6d   (--color-neutral-900 / --color-mention)
 *   Near-black text primary           #181d1d   (--color-black / --color-regular)
 *   BNP green (brand primary)         #00915a   (--color-brand-primary)
 *   BNP green hover                   #006d44   (--color-brand-primary-hover)
 *   BNP green (link / CTA siblings)   #007a4c   (--color-green-800 / --color-link)
 *   BNP green (success)               #008250   (--color-green-900)
 *   BNP dark green (inverse surface)  #013222   (--color-green-1000)
 *   Error red                         #ce1e43   (--error-input)
 *   Info magenta                      #a33467   (--color-info)
 *   Focus ring (sky blue)             #00bbff   (outline:3px solid #0bf)
 */

// --- BNP Paribas raw colour palette (measured `--color-*`) ------------------
const bnpColor = {
  // BNP green — the primary brand / action family (measured brand tokens).
  green: {
    primary: "#00915a", // --color-brand-primary (the canonical BNP green)
    primaryHover: "#006d44", // --color-brand-primary-hover
    900: "#008250", // --color-green-900 (CTA / success green)
    800: "#007a4c", // --color-green-800 (--color-link)
    700: "#008854", // --color-green-700
    darkCta: "#005d39", // primary CTA hover (--cta-bg-hover on .btn/.cta)
    darkerCta: "#004a2e", // primary CTA active (--cta-bg-active)
    1000: "#013222", // --color-green-1000 (dark green surface)
    1100: "#001c11", // --color-green-1100 (darkest green)
    100: "#edf0f0", // --color-green-100 (very light green-grey)
    200: "#d6ffe5", // --color-green-200 (light mint)
    mint: "#e5f4ee", // --color-neutral-600 (light mint surface)
    mintHover: "#d8f3e9", // secondary button hover fill (measured --cta-bg-hover)
    validBorder: "#5cc569" // --valid-input (valid field border tint)
  },
  // Neutral grey scale (measured --color-neutral-*).
  grey: {
    0: "#ffffff", // --color-neutral-000
    100: "#f0f0f0", // --color-neutral-100
    200: "#f5f5f5", // --color-neutral-200 (background alt)
    300: "#e7e7e7", // --color-neutral-300 (--form-color-border, subtle border)
    400: "#cccccc", // --color-neutral-400 (--input-border)
    500: "#767676", // --color-neutral-500 (--input-color, muted text)
    900: "#6d6d6d", // --color-neutral-900 (--color-mention, secondary text)
    1000: "#373737", // --color-neutral-1000
    black: "#181d1d", // --color-black / --color-regular (primary text)
    bgBody: "#e0e0e0" // --bg-body (page body background)
  },
  // System / status colours. BNP publishes an error red, a magenta "info" and a
  // valid green; warning is BNP-flavoured amber derived to keep WCAG AA on white
  // (no measured amber token — à confirmer).
  system: {
    success: "#008250", // --color-green-900 (brand success-capable green, AA on white)
    error: "#ce1e43", // --error-input (form error red)
    warning: "#a85a00", // BNP-flavoured amber, darkened for AA on white (à confirmer)
    info: "#a33467" // --color-info (BNP magenta info)
  },
  // Decorative / data-vis hues lifted from the measured site palette.
  data: {
    blue: "#2279e0", // measured decorative blue
    coral: "#ee5842", // measured decorative coral
    purple: "#8051a7", // measured decorative purple
    teal: "#008f9e", // measured decorative teal
    orange: "#ed973c", // measured decorative orange
    pink: "#d262a5", // measured decorative pink
    lightGreen: "#1cbe4c" // measured decorative light green
  },
  // Focus ring colour (measured site-wide accessibility outline).
  focus: "#00bbff" // outline:3px solid #0bf
} as const;

// --- foundation (BNP Paribas-specific values) ------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the BNP green (BNP has no blue
    // brand colour; the brand action family is green, so the Sentropic "blue"
    // action slots carry the BNP green — à confirmer).
    blue: {
      10: bnpColor.green[200], // #d6ffe5 lightest green tint
      60: bnpColor.green.primary, // #00915a BNP green (primary)
      80: bnpColor.green.primaryHover // #006d44 darker interactive green
    },
    // BNP has no cyan; the closest measured accent is the decorative blue, so the
    // Sentropic "cyan" accent slot is mapped to the BNP decorative blue family.
    cyan: {
      10: "#e6f0fb", // light blue tint (derived from #2279e0 — à confirmer)
      50: bnpColor.data.blue, // #2279e0 decorative blue accent
      70: "#1a5fb0" // darker blue (derived — à confirmer)
    },
    // Sentropic "slate" role family mapped onto the BNP neutral grey scale.
    slate: {
      0: bnpColor.grey[0], // white
      10: bnpColor.grey[200], // #f5f5f5 background alt
      20: bnpColor.grey[300], // #e7e7e7 subtle borders / contrast background
      60: bnpColor.grey[900], // #6d6d6d secondary text
      80: bnpColor.grey.black, // #181d1d primary text
      90: bnpColor.green[1100] // #001c11 darkest (BNP darkest green)
    },
    feedback: {
      success: bnpColor.system.success,
      warning: bnpColor.system.warning,
      error: bnpColor.system.error,
      info: bnpColor.system.info
    }
  },
  // BNP Paribas ships "BNP Type" for display/titles and "BNP Sans" for body /
  // interactive (the production body stack also lists "Open Sans" + Arial as web
  // fallbacks). "BNP Condensed" is the numeric/condensed face. No BNPP mono face
  // exists, so the Sentropic mono stack is kept. We reference the font *names*
  // only, never the (proprietary) binaries.
  font: {
    sans: "'BNP Sans', 'Open Sans', Arial, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'BNP Type', 'BNP Sans', 'Open Sans', Arial, system-ui, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity). BNP's own scale is a 4px grid on a 15px root
  // (--space-16 = 1.0667rem ≈ 16px) — comparable spacing in absolute px.
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
  // BNP aesthetic is ROUNDED: buttons carry an 8px radius (--cta-radius
  // 0.5333rem on a 15px root = 8px) and cards/containers a 16px radius
  // (--radius-main 1rem = 15px ≈ 16px). Form fields are nearly square (~3px,
  // .form-control border-radius .2rem). Pills stay fully rounded.
  radius: {
    none: "0",
    sm: "0.1875rem", // 3px — .form-control radius (.2rem on 15px root)
    md: "0.5rem", // 8px — buttons / CTAs (--cta-radius)
    lg: "1rem", // 16px — cards / containers (--radius-main)
    pill: "999px" // tags / pills
  },
  // BNP uses light, neutral elevation on rounded cards. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(24 29 29 / 0.10)",
    medium: "0 4px 12px rgb(24 29 29 / 0.14)",
    floating: "0 8px 24px rgb(24 29 29 / 0.18)"
  },
  // BNP transitions on CTAs are ~0.5s; durations are not strongly tokenised
  // publicly otherwise, so the scale is kept aligned with the base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not BNP-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (BNP Paribas) ------------------------------------
  // BNP borders: fields use a 1px stroke (.0667rem on 15px root); error/valid
  // states thicken to 2px (.1333rem).
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // BNP control density. Measured: primary CTA min-height 56px (3.7333rem),
  // padding 12px/24px (.8rem 1.6rem), font 16px / weight 600; form fields
  // ~48px tall (3.1333rem). md is set to the 48px field height with generous
  // padding; lg lands the 56px CTA; sm follows the BNP size scale.
  density: {
    sm: { controlHeight: "2.5rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "0.875rem" },
    md: { controlHeight: "3rem", paddingBlock: "0.75rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1rem" },
    lg: { controlHeight: "3.5rem", paddingBlock: "0", paddingInline: "2rem", gap: "0.5rem", minWidth: "3.5rem", fontSize: "1.125rem" }
  },
  // BNP typography: "BNP Sans" for interactive/labels/fields, "BNP Type" for
  // display. Measured: CTA label 16px / weight 600 / line-height 1.35; field
  // text 14px / weight 400; label bold.
  typography: {
    control: { family: "'BNP Sans', 'Open Sans', Arial, sans-serif", size: "1rem", weight: "600", lineHeight: "1.35", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'BNP Sans', 'Open Sans', Arial, sans-serif", size: "0.875rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'BNP Sans', 'Open Sans', Arial, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // BNP links are the brand green; underline thickens on hover (base style).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "0.08em", decorationOffset: "0.15em",
      textDecorationHover: "underline", decorationThicknessHover: "0.14em", decorationOffsetHover: "0.15em"
    }
  },
  disabledOpacity: "0.55", // BNP dims disabled controls (--cta-bg-disabled grey + dimmed text)
  transition: { property: "background-color, border-color, color, outline-color", duration: "150ms", easing: "ease" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // BNP FOCUS = a thick high-contrast sky-blue OUTLINE, offset from the control.
  // Measured site-wide: `outline:3px solid #0bf; outline-offset:3px` (#0bf =
  // #00bbff) — a bright sky-blue ring that contrasts the green brand.
  focus: {
    strategy: "outline",
    width: "3px",
    offset: "3px",
    color: bnpColor.focus, // #00bbff measured focus ring
    inset: "0"
  },
  // BNP form fields are BOXED (outline): a white fill with a 1px grey border
  // (#cccccc) and a small ~3px radius (not a filled-underline). `style: "outline"`
  // makes the builder draw four equal borders from `surface.default` +
  // `border.subtle`. Source: measured `.form-control` (mabanque.bnpparibas).
  field: {
    style: "outline",
    fillBg: bnpColor.grey[0], // #ffffff (.form-control background)
    underlineColor: bnpColor.grey[400], // #cccccc (--input-border, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in BNP green with a 40px right gutter
    // (the real .form-control reserves a 3rem right padding for its icon).
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2300915a' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // BNP cards: rounded (16px via radius.lg) with a 1px subtle grey border and a
  // light grey hover tint. Many BNP cards are shadow-based / borderless; the 1px
  // stroke keeps them readable in the docs grid (à confirmer).
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: bnpColor.grey[100] // #f0f0f0
  },
  // BNP secondary button = a white/ghost button with BNP green text and a light
  // mint fill on hover. Measured `.btn-secondary`: bg #fff, text #008250, hover
  // bg #d8f3e9, hover text #007045. The builder draws it as a transparent fill
  // with a green stroke (the stroke reads it as a button; the real one is
  // borderless white — à confirmer) + the measured mint hover.
  buttonSecondary: {
    background: "transparent",
    border: bnpColor.green[900], // #008250 green stroke
    hoverBackground: bnpColor.green.mintHover // #d8f3e9 light mint fill on hover
  },
  // BNP tabs / top-nav: active tab = bold BNP-green label with a bottom green
  // underline (border mode), transparent fill. Tab metrics "à confirmer".
  tabs: {
    activeText: bnpColor.green.primary, // #00915a
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // green underline on the bottom edge
    indicatorMode: "border" // a real bottom border
  },
  // BNP pagination: borderless green text links; active page = filled BNP green.
  // Metrics "à confirmer".
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: bnpColor.green[800], // #007a4c link text
    activeBackground: bnpColor.green.primary, // #00915a filled active page
    activeText: bnpColor.grey[0], // white on green
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // BNP breadcrumb: green links, dark current page, grey separators. Metrics
  // "à confirmer".
  breadcrumb: {
    linkText: bnpColor.green[800], // #007a4c
    text: bnpColor.grey[900], // #6d6d6d trail text
    currentText: bnpColor.grey.black, // #181d1d current page
    separator: bnpColor.grey[400], // #cccccc
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem", // 24px
    currentWeight: "700"
  },
  // BNP notice / alert: a coloured LEFT accent filet on a transparent box (the
  // severity colour comes from the feedback palette). Metrics "à confirmer".
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0.25rem", // 4px ::before accent bar
    paddingTop: "1rem", // 16px
    paddingRight: "1rem", // 16px
    paddingBottom: "1rem", // 16px
    paddingLeft: "1.25rem", // 20px (clears the left filet)
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // BNP accordion: a BNP-green bold summary trigger. Metrics "à confirmer".
  accordion: {
    text: bnpColor.green.primary, // #00915a header label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "600", // BNP CTA/header weight
    lineHeight: "1.5rem" // 24px
  },
  // BNP tag: a small rounded grey chip. Metrics "à confirmer".
  tag: {
    radius: "4px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: bnpColor.grey[100], // #f0f0f0
    neutralText: bnpColor.grey.black // #181d1d
  },
  // BNP badge: a small rounded filled badge in brand green. (BNP's count/alert
  // badge is a magenta #b4174e; the INFO badge is set to the brand green to read
  // as a BNP accent — à confirmer.)
  badge: {
    radius: "4px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: bnpColor.green.primary, // #00915a
    infoText: bnpColor.grey[0] // white
  },
  // BNP checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: bnpColor.grey.black // #181d1d
  },
  // BNP search input.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // BNP toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: bnpColor.grey.black // #181d1d
  }
} as const;

// --- semantic (BNP Paribas-specific role mapping) --------------------------
const semantic = {
  surface: {
    default: bnpColor.grey[0], // white (--color-neutral-000)
    subtle: bnpColor.grey[200], // #f5f5f5 background alt (--color-neutral-200)
    raised: bnpColor.grey[0], // white
    inverse: bnpColor.green[1000], // #013222 BNP dark-green inverse surface
    overlay: "rgb(1 50 34 / 0.6)" // modal backdrop (BNP dark-green tint)
  },
  text: {
    primary: bnpColor.grey.black, // #181d1d (--color-black / --color-regular)
    secondary: bnpColor.grey[900], // #6d6d6d (--color-mention)
    muted: bnpColor.grey[500], // #767676 (--input-color)
    inverse: bnpColor.grey[0], // white on dark / coloured surfaces
    link: bnpColor.green[800] // #007a4c (--color-link / --color-green-800)
  },
  border: {
    subtle: bnpColor.grey[300], // #e7e7e7 (--form-color-border)
    strong: bnpColor.grey[400], // #cccccc (--input-border)
    interactive: bnpColor.green.primary // #00915a brand green
  },
  action: {
    primary: bnpColor.green.primary, // #00915a primary button (--color-brand-primary)
    primaryHover: bnpColor.green.primaryHover, // #006d44 (--color-brand-primary-hover)
    primaryText: bnpColor.grey[0], // white text on green
    secondary: bnpColor.green.mint, // #e5f4ee light mint secondary surface
    secondaryHover: bnpColor.green.mintHover, // #d8f3e9 mint hover
    secondaryText: bnpColor.green[900], // #008250 green text
    danger: bnpColor.system.error // #ce1e43 (--error-input)
  },
  feedback: {
    success: bnpColor.system.success, // #008250
    warning: bnpColor.system.warning, // #a85a00 (à confirmer)
    error: bnpColor.system.error, // #ce1e43
    info: bnpColor.system.info // #a33467 (--color-info)
  },
  status: {
    pending: bnpColor.system.warning,
    processing: bnpColor.system.info,
    completed: bnpColor.system.success,
    failed: bnpColor.system.error
  },
  // Categorical data-vis palette built from the measured BNP decorative hues.
  // BNP does not publish an 8-colour sequential scale, so this is a coherent
  // proposal drawn from measured site colours (see MAPPING.md, "à confirmer").
  data: {
    category1: bnpColor.green.primary, // #00915a BNP green
    category2: bnpColor.data.blue, // #2279e0 blue
    category3: bnpColor.data.coral, // #ee5842 coral
    category4: bnpColor.data.purple, // #8051a7 purple
    category5: bnpColor.data.teal, // #008f9e teal
    category6: bnpColor.data.orange, // #ed973c orange
    category7: bnpColor.data.pink, // #d262a5 pink
    category8: bnpColor.data.lightGreen // #1cbe4c light green
  }
} as const;

/**
 * The BNP Paribas theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry BNP-specific values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the BNP brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const bnpParibasTheme: TenantTheme = {
  id: "bnp-paribas",
  label: "BNP Paribas",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default bnpParibasTheme;
