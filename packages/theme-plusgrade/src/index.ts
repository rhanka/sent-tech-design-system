import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Plusgrade (plusgrade.com — the Montréal travel-tech company that powers
 * ancillary-revenue / upgrade products for airlines, hotels, rail and financial
 * partners) theme for the Sentropic token structure.
 *
 * Plusgrade publishes no design-token file; the values below are MEASURED from
 * the live site's computed CSS (https://www.plusgrade.com, inspected in a real
 * browser). We only reference the font *names* here ("'Inter', Helvetica, Arial,
 * sans-serif" — a modern geometric grotesk Plusgrade uses across its marketing
 * site; à confirmer), never font binaries. Sources and the full mapping table
 * are in MAPPING.md.
 *
 * Plusgrade's identity is a MODERN STARTUP system: a vivid deep-ORANGE brand
 * accent (the CTA / upgrade colour) set against a near-black navy canvas, on a
 * clean white content surface. Body copy is the same near-black navy; structure
 * is carried by soft cool greys with generous (rounded) corners. The brand
 * "colour" is the orange — used for the primary call-to-action, active tab /
 * pagination / breadcrumb indicators and the first data category. Where Sentropic
 * needs a role Plusgrade never colours (feedback states, secondary accents), a
 * restrained system colour is used and the choice is noted "à confirmer" in
 * MAPPING.md.
 *
 * Plusgrade colour reference (measured, light theme):
 *   Orange (action / CTA / brand)       #ff5722   vivid deep orange CTA (measured)
 *   Orange hover                        #e64a19   darker orange on hover
 *   White (surface default)             #ffffff   page / content background
 *   Ink — primary text                  #000414   near-black navy body text (measured)
 *   Secondary text                      #4a4f5a   cool slate-grey secondary text
 *   Muted text                          #8a909a   cool muted grey
 *   Subtle fill surface                 #f4f5f7   very light cool grey fill
 *   Subtle / field border               #d8dce2   light cool hairline
 *   Dark canvas (inverse)               #000414   near-black navy inverse surface (measured)
 */

// --- Plusgrade raw colour palette (measured from live computed CSS) ---------
const plusgradeColor = {
  // The brand / CTA is a vivid deep ORANGE. Plusgrade uses it for the primary
  // call-to-action ("upgrade") and active indicators.
  orange: "#ff5722", // primary CTA fill / brand accent (measured vivid deep orange)
  orangeHover: "#e64a19", // darker orange on hover
  white: "#ffffff", // page / content background — surface default
  // Cool monochrome ink scale. Plusgrade sets body text in a near-black navy
  // (#000414), not pure black.
  ink: {
    // Primary body text — a near-black navy.
    primary: "#000414", // near-black navy — body text colour (measured)
    // Secondary text — cool slate grey.
    secondary: "#4a4f5a", // cool slate-grey — secondary text
    // Muted text — cool muted grey.
    muted: "#8a909a" // cool muted grey — muted text
  },
  // Neutral surface / line greys (cool-toned to match the navy ink).
  grey: {
    subtle: "#f4f5f7", // very light cool grey — subtle fill surface
    border: "#d8dce2" // light cool hairline — subtle / field border
  },
  // Plusgrade shows essentially no decorative feedback colour on its marketing
  // surface, so it publishes no success/warning/info hues. These are restrained,
  // legible (WCAG AA on white) system colours. The danger red is a measured
  // error accent; the rest are "à confirmer" — Plusgrade has no measured
  // equivalent.
  system: {
    danger: "#d32f2f", // deep red — error / danger accent (measured)
    success: "#2e7d32", // muted green — à confirmer (no Plusgrade source)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#1565c0" // blue, AA on white — à confirmer (Plusgrade has no info blue)
  }
} as const;

// --- foundation (Plusgrade-specific values) ---------------------------------
const foundation = {
  color: {
    // Plusgrade's primary action IS the vivid orange. The Sentropic "blue" role
    // family (action / primary / link) is mapped onto the orange brand scale.
    // (à confirmer: Plusgrade has no brand blue — orange is the only accent.)
    blue: {
      10: plusgradeColor.grey.subtle, // #f4f5f7 lightest neutral tint
      60: plusgradeColor.orange, // #ff5722 primary action (Plusgrade orange CTA)
      80: plusgradeColor.orangeHover // #e64a19 darker orange (hover / pressed)
    },
    // Plusgrade has no cyan/teal accent. The Sentropic "cyan" accent slot is
    // mapped to the orange brand scale (the only accent Plusgrade has).
    // (à confirmer.)
    cyan: {
      10: plusgradeColor.grey.subtle, // #f4f5f7 light neutral tint
      50: plusgradeColor.orange, // #ff5722 the only "accent" Plusgrade has is orange
      70: plusgradeColor.orangeHover // #e64a19
    },
    // Sentropic "slate" role family mapped onto the Plusgrade cool navy/grey
    // ink scale.
    slate: {
      0: plusgradeColor.white, // #ffffff white
      10: plusgradeColor.grey.subtle, // #f4f5f7 subtle fill surface
      20: plusgradeColor.grey.border, // #d8dce2 hairline / subtle border
      60: plusgradeColor.ink.secondary, // #4a4f5a secondary text
      80: plusgradeColor.ink.primary, // #000414 primary text (near-black navy)
      90: plusgradeColor.ink.primary // #000414 darkest (near-black navy — terminal)
    },
    feedback: {
      success: plusgradeColor.system.success,
      warning: plusgradeColor.system.warning,
      error: plusgradeColor.system.danger,
      info: plusgradeColor.system.info
    }
  },
  // Plusgrade sets its UI in a modern geometric grotesk — "'Inter', Helvetica,
  // Arial, sans-serif" across headings and body (à confirmer: exact font face).
  // We reference the *names* only. Mono is not part of Plusgrade — the Sentropic
  // / Simons mono stack is kept.
  font: {
    sans: "'Inter', Helvetica, Arial, sans-serif",
    display: "'Inter', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. Plusgrade's grid is whitespace-generous but its
  // raw spacing steps are not strongly tokenised publicly; kept aligned with the
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
  // Plusgrade is a MODERN STARTUP look — clearly ROUNDED corners. Measured
  // ~6px on controls/inputs and ~12px on cards; buttons read soft, not boxy.
  // (Exact steps à confirmer; pill kept at 999px for chips / round CTAs.)
  radius: {
    none: "0", // square slot
    sm: "2px", // smallest controls — barely rounded
    md: "6px", // button / input / tabs — rounded 6px (measured)
    lg: "12px", // cards — soft 12px (measured)
    pill: "999px" // tags / pills / round CTAs
  },
  // Plusgrade elevation is modern and soft — low, cool shadows on raised
  // elements over the white surface. Kept conservative ("à confirmer" exact
  // specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.14)"
  },
  // Plusgrade animates with short, standard eases (measured ≈ 150ms
  // transitions). Durations not fully tokenised publicly; kept aligned with the
  // base.
  motion: {
    fast: "120ms",
    normal: "150ms", // measured button transition duration (à confirmer)
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Plusgrade-specific; kept aligned with the Sentropic
  // base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Plusgrade) --------------------------------------
  // Plusgrade borders are thin LIGHT-COOL-GREY hairlines (#d8dce2 @1px). Encoded
  // as 1px thin / 2px thick.
  borderWidth: {
    none: "0",
    thin: "1px", // Plusgrade hairline (#d8dce2)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Plusgrade control density. Measured CTA buttons sit ~44px tall with generous
  // horizontal padding; nav/body text is mid-sized grotesk. md targets a ~44px
  // touch height; sm/lg bracket it. (à confirmer: exact step heights.)
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "1rem" }
  },
  // Plusgrade typography = the modern grotesk. Control labels are mid-weight,
  // sentence case (modern startups avoid uppercase tracking on buttons); body /
  // field text is sentence case. (à confirmer: exact tracking / casing.)
  typography: {
    control: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "600", lineHeight: "1.2", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Inter', Helvetica, Arial, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Plusgrade links are orange-tinted on the brand colour; the hover
    // affordance is an underline. (à confirmer.)
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // Plusgrade dims disabled controls (à confirmer)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // Plusgrade FOCUS = a crisp ORANGE OUTLINE (~2px solid #ff5722). We encode the
  // orange outline strategy — focus tracks the brand colour.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: plusgradeColor.orange, // #ff5722 — Plusgrade focuses in the brand orange
    inset: "0"
  },
  // Plusgrade form fields are BOXED (outline): a white fill with a thin light-
  // cool-grey hairline border and a rounded 6px radius. `style: "outline"` makes
  // the builder draw four equal borders from `surface.default` + `border.subtle`.
  // Measured input/select border = #d8dce2 @1px hairline.
  field: {
    style: "outline",
    fillBg: plusgradeColor.white, // #ffffff
    underlineColor: plusgradeColor.grey.border, // #d8dce2 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the secondary ink with a 40px right
    // gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%234a4f5a' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Plusgrade cards: rounded 12px corners, a thin light-cool-grey hairline with a
  // faint hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: plusgradeColor.grey.subtle // #f4f5f7 faint hover tint
  },
  // Plusgrade secondary button = a soft-grey filled chip (light #f4f5f7 fill, ink
  // text, slightly darker grey on hover) — the quiet alternative to the filled
  // orange primary.
  buttonSecondary: {
    background: plusgradeColor.grey.subtle, // #f4f5f7 soft fill
    border: plusgradeColor.grey.border, // #d8dce2 light hairline
    hoverBackground: plusgradeColor.grey.border // #d8dce2 on hover
  },
  // Plusgrade tabs / sub-nav: active tab = orange label with an orange bottom
  // underline (the brand indicator), transparent fill.
  tabs: {
    activeText: plusgradeColor.orange, // #ff5722
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem", // 18px
    indicatorSide: "bottom", // orange underline on the bottom edge
    indicatorMode: "border" // a real bottom border (not a box-shadow filet)
  },
  // Plusgrade pagination: borderless ink text links; active page = filled orange
  // box with white text (the brand fill).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: plusgradeColor.ink.primary, // #000414 link text
    activeBackground: plusgradeColor.orange, // #ff5722 filled active page
    activeText: plusgradeColor.white, // white on orange
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // Plusgrade breadcrumb: ink links, grey trail, orange current page, grey
  // separators — all grotesk type.
  breadcrumb: {
    linkText: plusgradeColor.ink.primary, // #000414
    text: plusgradeColor.ink.secondary, // #4a4f5a trail text
    currentText: plusgradeColor.orange, // #ff5722 current page (brand)
    separator: plusgradeColor.ink.secondary, // #4a4f5a
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.125rem", // 18px
    currentWeight: "600" // current page is emphasised
  },
  // Plusgrade notice / alert: a minimal box — a thin coloured left filet on a
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
  // Plusgrade accordion / disclosure: an ink, mid-weight grotesk summary
  // trigger, gentle rounding, hairline separated.
  accordion: {
    text: plusgradeColor.ink.primary, // #000414 summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // rows are flush to the column
    fontSize: "0.875rem", // 14px
    fontWeight: "500", // mid-weight grotesk
    lineHeight: "1.25rem" // 20px
  },
  // Plusgrade tag: a small soft-grey chip with rounded corners.
  tag: {
    radius: "6px", // rounded (matches md)
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: plusgradeColor.grey.subtle, // #f4f5f7 subtle fill
    neutralText: plusgradeColor.ink.primary // #000414
  },
  // Plusgrade badge: a small filled badge — orange fill / white text, rounded
  // 6px (à confirmer: Plusgrade info badge colour — orange used as brand).
  badge: {
    radius: "6px", // rounded
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "none", // Plusgrade labels are sentence case
    minHeight: "1.25rem", // 20px
    infoBackground: plusgradeColor.orange, // #ff5722 (Plusgrade "info" = brand orange, à confirmer)
    infoText: plusgradeColor.white // white on orange
  },
  // Plusgrade checkbox/radio label: small ink grotesk.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: plusgradeColor.ink.primary // #000414
  },
  // Plusgrade search input: a boxed light hairline field, grotesk type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Plusgrade toggle / switch label: small ink grotesk.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: plusgradeColor.ink.primary // #000414
  }
} as const;

// --- semantic (Plusgrade-specific role mapping) -----------------------------
const semantic = {
  surface: {
    default: plusgradeColor.white, // #ffffff white
    subtle: plusgradeColor.grey.subtle, // #f4f5f7 subtle fill surface
    raised: plusgradeColor.white, // #ffffff white
    inverse: plusgradeColor.ink.primary, // #000414 near-black navy inverse surface (dark canvas, measured)
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop — black @50%
  },
  text: {
    primary: plusgradeColor.ink.primary, // #000414 (measured near-black navy body text)
    secondary: plusgradeColor.ink.secondary, // #4a4f5a
    muted: plusgradeColor.ink.muted, // #8a909a
    inverse: plusgradeColor.white, // white on dark canvas
    link: plusgradeColor.orange // #ff5722 — Plusgrade links tint to the brand orange (à confirmer)
  },
  border: {
    subtle: plusgradeColor.grey.border, // #d8dce2 light hairline (field / divider)
    strong: plusgradeColor.ink.secondary, // #4a4f5a stronger border
    interactive: plusgradeColor.orange // #ff5722 focus / interactive (brand)
  },
  action: {
    primary: plusgradeColor.orange, // #ff5722 primary button (the orange CTA)
    primaryHover: plusgradeColor.orangeHover, // #e64a19 darker orange on hover
    primaryText: plusgradeColor.white, // white text on orange
    secondary: plusgradeColor.grey.subtle, // #f4f5f7 secondary surface
    secondaryHover: plusgradeColor.grey.border, // #d8dce2
    secondaryText: plusgradeColor.ink.primary, // #000414
    danger: plusgradeColor.system.danger // #d32f2f
  },
  feedback: {
    success: plusgradeColor.system.success,
    warning: plusgradeColor.system.warning,
    error: plusgradeColor.system.danger,
    info: plusgradeColor.system.info
  },
  status: {
    pending: plusgradeColor.system.warning,
    processing: plusgradeColor.system.info,
    completed: plusgradeColor.system.success,
    failed: plusgradeColor.system.danger
  },
  // Categorical data-vis palette. Plusgrade publishes no data-vis scale, so this
  // is a coherent proposal led by the brand orange and near-black navy, then the
  // cool greys and restrained system hues, drawn to honour the identity (see
  // MAPPING.md, "à confirmer" — not an official scale).
  data: {
    category1: plusgradeColor.orange, // #ff5722 brand orange
    category2: plusgradeColor.ink.primary, // #000414 near-black navy
    category3: plusgradeColor.ink.secondary, // #4a4f5a cool slate grey
    category4: plusgradeColor.ink.muted, // #8a909a cool muted grey
    category5: plusgradeColor.grey.border, // #d8dce2 light cool hairline
    category6: plusgradeColor.system.danger, // restrained red (à confirmer)
    category7: plusgradeColor.system.success, // restrained green (à confirmer)
    category8: plusgradeColor.system.warning // restrained amber (à confirmer)
  }
} as const;

/**
 * The Plusgrade theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Plusgrade-specific (vivid-orange-
 * on-near-black, modern-startup) values, and the `component` layer is REBUILT
 * from this theme's own semantic/foundation via `createComponent` — so
 * Plusgrade's orange-on-navy grotesk identity reaches the components (buttons,
 * tabs, pagination, chat bubbles…), not just the elements that read semantic
 * vars directly.
 */
export const plusgradeTheme: TenantTheme = {
  id: "plusgrade",
  label: "Plusgrade",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default plusgradeTheme;
