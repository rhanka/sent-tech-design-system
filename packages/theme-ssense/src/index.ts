import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * SSENSE (ssense.com — the Montréal luxury fashion e-commerce house) theme for
 * the Sentropic token structure.
 *
 * SSENSE has no published design-token file; the values below are MEASURED from
 * the live site's computed CSS (https://www.ssense.com/en-us, inspected in a
 * real browser). We only reference the font *names* here ("interFont" and
 * "regularFont", SSENSE's own webfont aliases — a grotesque/Helvetica-like
 * sans), never font binaries. Sources and the full mapping table are in
 * MAPPING.md. SSENSE's identity is an ULTRA-MINIMAL monochrome system: there is
 * no decorative colour at all — text is pure black, surfaces are pure white,
 * corners are perfectly square (radius 0), borders are thin hairlines, and focus
 * is a crisp black outline. The brand "colour" IS black. Where Sentropic needs a
 * role SSENSE never colours (a brand hue, an accent, feedback states), the
 * closest monochrome value is used (or a restrained system colour for feedback)
 * and the choice is noted "à confirmer" in MAPPING.md.
 *
 * SSENSE colour reference (measured, light theme):
 *   Black (text / action / brand)      #000000   body color (rgb 0,0,0), 3548 els
 *   White (surface default)            #ffffff   html background (rgb 255,255,255)
 *   Grey muted text / strong border    #888888   rgb(136,136,136) secondary text
 *   Hairline divider (subtle border)   #f3f3f3   rgb(243,243,243) @0.8px (20 els — dominant rule)
 *   Field / input border               #b6b6b6   rgb(182,182,182) @0.8px
 *   Mid grey border                    #cccccc   rgb(204,204,204) @0.8px
 *   Subtle fill / contrast surface     #e8e8e8   rgb(232,232,232) background
 *   Faint alt surface                  #fbfbfb   rgb(251,251,251) background
 *   Overlay (modal backdrop)           oklab(0 0 0 / 0.5) = black @50%
 */

// --- SSENSE raw colour palette (measured from live computed CSS) ------------
const ssenseColor = {
  // The "brand" is pure black. SSENSE uses black for text, primary actions, the
  // famous filled CTA ("Add to Bag"), and brand hairlines.
  black: "#000000", // body/html color rgb(0,0,0) — text, action, brand
  white: "#ffffff", // html background rgb(255,255,255) — surface default
  // Monochrome grey scale (each value measured from a real element).
  grey: {
    // Near-white / faint alt surfaces.
    50: "#fbfbfb", // rgb(251,251,251) — faint alt surface background
    100: "#f3f3f3", // rgb(243,243,243) — dominant hairline divider (subtle border)
    200: "#e8e8e8", // rgb(232,232,232) — subtle contrast fill surface
    300: "#cccccc", // rgb(204,204,204) — mid hairline border
    400: "#b6b6b6", // rgb(182,182,182) — field / input border
    600: "#888888" // rgb(136,136,136) — secondary / muted text, strong border
  },
  // SSENSE shows NO decorative colour, so it publishes no success/warning/error/
  // info hues. These are restrained, near-neutral system colours chosen to stay
  // legible (WCAG AA) on white while not breaking the monochrome aesthetic.
  // Entirely "à confirmer" — SSENSE has no measured equivalent.
  system: {
    success: "#1a7f4b", // muted green — à confirmer (no SSENSE source)
    error: "#c0202e", // muted red — à confirmer (no SSENSE source)
    warning: "#9a6700", // dark amber, AA on white — à confirmer
    info: "#000000" // SSENSE would use black, not blue — à confirmer
  }
} as const;

// --- foundation (SSENSE-specific values) ------------------------------------
const foundation = {
  color: {
    // SSENSE has no brand blue. The Sentropic "blue" role family (action /
    // primary / link) is mapped onto the monochrome black scale — the SSENSE
    // primary action IS black. (à confirmer: SSENSE has no blue at all.)
    blue: {
      10: ssenseColor.grey[100], // #f3f3f3 lightest neutral tint
      60: ssenseColor.black, // #000000 primary action / link (SSENSE black)
      80: ssenseColor.black // #000000 (no darker step — SSENSE black is terminal)
    },
    // SSENSE has no cyan/accent. The Sentropic "cyan" accent slot is also mapped
    // to the monochrome scale (no decorative accent exists). (à confirmer.)
    cyan: {
      10: ssenseColor.grey[100], // #f3f3f3 light neutral tint
      50: ssenseColor.grey[600], // #888888 the only "accent" SSENSE has is grey
      70: ssenseColor.black // #000000
    },
    // Sentropic "slate" role family mapped onto the SSENSE monochrome grey scale.
    slate: {
      0: ssenseColor.white, // #ffffff white
      10: ssenseColor.grey[50], // #fbfbfb faint alt surface
      20: ssenseColor.grey[100], // #f3f3f3 hairline / subtle border
      60: ssenseColor.grey[600], // #888888 secondary text
      80: ssenseColor.black, // #000000 primary text
      90: ssenseColor.black // #000000 darkest (terminal black)
    },
    feedback: {
      success: ssenseColor.system.success,
      warning: ssenseColor.system.warning,
      error: ssenseColor.system.error,
      info: ssenseColor.system.info
    }
  },
  // SSENSE serves two webfont aliases: "interFont" (the primary grotesque, an
  // Inter-like neo-grotesque used for nearly all UI text) and "regularFont"
  // (a secondary face used for some uppercase labels). We reference the *names*
  // only. The base type is famously tiny (11px / 15px line-height). Mono is not
  // part of SSENSE — the Sentropic mono stack is kept.
  font: {
    sans: "interFont, 'interFont Fallback', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif",
    display: "regularFont, 'regularFont Fallback', interFont, system-ui, 'Helvetica Neue', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. SSENSE's grid is whitespace-heavy but its raw
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
  // SSENSE is SQUARE. Every measured element renders border-radius 0 — no
  // rounding was found anywhere on controls, cards, inputs or buttons. Only the
  // generic "pill" slot keeps a radius (SSENSE has no pills, but the token must
  // exist; kept 999px as a safe default — à confirmer, SSENSE shows none).
  radius: {
    none: "0", // SSENSE default — perfectly square corners
    sm: "0", // controls square
    md: "0", // button / input / tabs — square
    lg: "0", // cards — square
    pill: "999px" // tags / pills (SSENSE shows none; kept for completeness)
  },
  // SSENSE elevation is almost flat — it relies on hairlines and whitespace, not
  // shadows. Buttons measured a very faint 0 1px 2px black/6% shadow. Kept
  // conservative and black-tinted ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.14)"
  },
  // SSENSE animates with short, standard eases (measured button transition
  // ≈ 150ms). Durations not fully tokenised publicly; kept aligned with the base.
  motion: {
    fast: "120ms",
    normal: "150ms", // measured button transition duration
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not SSENSE-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (SSENSE) -----------------------------------------
  // SSENSE borders are sub-pixel HAIRLINES. Real elements render 0.8px solid
  // strokes (the site uses 0.8px, not 1px, for its thin rules). We encode the
  // signature thin stroke as 1px (the finest the token allows cleanly); the
  // 0.8px source is documented in MAPPING.md.
  borderWidth: {
    none: "0",
    thin: "1px", // SSENSE hairline (source 0.8px — à confirmer)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // SSENSE control density. Measured CTA buttons range 44–50px tall (the bag/
  // checkout buttons are 44px and 50px), nav text rows are ~15px. md targets a
  // ~44px touch height with generous horizontal padding (measured 0 20px on the
  // header CTA). sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.8125rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.875rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "0.9375rem" }
  },
  // SSENSE typography = the interFont grotesque. The site's base type is very
  // small (11px). Control labels are often UPPERCASE (measured text-transform:
  // uppercase on the bag/checkout buttons); body/field text is sentence case.
  typography: {
    control: { family: "interFont, 'Helvetica Neue', Helvetica, Arial, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.2", letterSpacing: "0.02em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "interFont, 'Helvetica Neue', Helvetica, Arial, sans-serif", size: "0.875rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "interFont, 'Helvetica Neue', Helvetica, Arial, sans-serif", size: "0.8125rem", weight: "400", lineHeight: "1.4", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // SSENSE links are NOT underlined at rest — they are plain black text; the
    // hover affordance is an underline (background-underline) appearing on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // SSENSE dims disabled controls heavily (minimal, near-ghost)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // SSENSE FOCUS = a crisp black OUTLINE. Measured outline-width 2.4px solid in
  // rgb(0,0,0) on interactive anchors (the checkbox uses an inset 1px black box-
  // shadow). We encode the black outline strategy (width rounded to 2px).
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: ssenseColor.black, // #000000 — SSENSE focuses in black, not a colour
    inset: "0"
  },
  // SSENSE form fields are BOXED (outline): a white fill with a thin hairline
  // border and NO radius (square). `style: "outline"` makes the builder draw four
  // equal borders from `surface.default` + `border.subtle`. Measured input/select
  // border = #b6b6b6 (rgb 182) @0.8px hairline; checkbox = inset 1px black box.
  field: {
    style: "outline",
    fillBg: ssenseColor.white, // #ffffff
    underlineColor: ssenseColor.grey[400], // #b6b6b6 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in pure black with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23000000' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // SSENSE cards: no rounding, a thin hairline divider rather than a heavy box;
  // the product grid separates with #f3f3f3 hairlines. Keep a 1px border (the
  // builder draws it from border.subtle = #f3f3f3) and a faint hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: ssenseColor.grey[50] // #fbfbfb faint hover tint
  },
  // SSENSE secondary button = OUTLINED (transparent fill, black hairline border +
  // black text, faint grey fill on hover). The minimal monochrome alternative to
  // the filled black primary.
  buttonSecondary: {
    background: "transparent",
    border: ssenseColor.black, // #000000 hairline stroke
    hoverBackground: ssenseColor.grey[100] // #f3f3f3 faint fill on hover
  },
  // SSENSE tabs / sub-nav: active tab = black bold label with a black bottom
  // underline (the minimal indicator), transparent fill.
  tabs: {
    activeText: ssenseColor.black, // #000000
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.8125rem", // 13px (SSENSE small type)
    lineHeight: "1rem", // 16px
    indicatorSide: "bottom", // black underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline (not a box-shadow filet)
  },
  // SSENSE pagination: borderless black text links; active page = filled black
  // square with white text (the monochrome equivalent of a brand fill).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: ssenseColor.black, // #000000 link text
    activeBackground: ssenseColor.black, // #000000 filled active page
    activeText: ssenseColor.white, // white on black
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.8125rem", // 13px
    lineHeight: "1rem" // 16px
  },
  // SSENSE breadcrumb: black links, grey trail, black current page, grey
  // separators — all small grotesque type.
  breadcrumb: {
    linkText: ssenseColor.black, // #000000
    text: ssenseColor.grey[600], // #888888 trail text
    currentText: ssenseColor.black, // #000000 current page
    separator: ssenseColor.grey[600], // #888888
    fontSize: "0.75rem", // 12px
    lineHeight: "1rem", // 16px
    currentWeight: "500" // current page is mildly emphasised
  },
  // SSENSE notice / alert: a minimal box — a thin hairline accent on a white box,
  // no fill. The severity accent is a coloured left filet (kept slim).
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0", // left border collapses (filet instead)
    filetWidth: "0.125rem", // 2px ::before accent bar (thin, SSENSE-minimal)
    paddingTop: "0.875rem", // 14px
    paddingRight: "1rem", // 16px
    paddingBottom: "0.875rem", // 14px
    paddingLeft: "1.125rem", // 18px (clears the left filet)
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.25rem" // 20px
  },
  // SSENSE accordion / disclosure (the famous "Womenswear/Menswear" expanders):
  // a black, plain-weight summary trigger, square, hairline separated.
  accordion: {
    text: ssenseColor.black, // #000000 summary label
    paddingBlock: "0.875rem", // 14px (measured --accordion-padding analogue)
    paddingInline: "0", // SSENSE accordion rows are flush to the column
    fontSize: "0.8125rem", // 13px small type
    fontWeight: "400", // SSENSE summary is regular weight, not bold
    lineHeight: "1.25rem" // 20px
  },
  // SSENSE tag: a small SQUARE grey chip (no rounding — radius 0).
  tag: {
    radius: "0", // SSENSE is square — tags are not pills
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.6875rem", // 11px (SSENSE base type)
    fontWeight: "400",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: ssenseColor.grey[200], // #e8e8e8 subtle fill
    neutralText: ssenseColor.black // #000000
  },
  // SSENSE badge: a SQUARE filled badge — black fill / white text (the only
  // "filled" emphasis SSENSE uses), uppercase, small.
  badge: {
    radius: "0", // square
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px (tiny)
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    textTransform: "uppercase", // SSENSE labels are often uppercase
    minHeight: "1.25rem", // 20px
    infoBackground: ssenseColor.black, // #000000 (SSENSE "info" = black, not blue)
    infoText: ssenseColor.white // white on black
  },
  // SSENSE checkbox/radio label: small black grotesque (measured checkbox is a
  // 12px appearance-none box with an inset 1px black border).
  choice: {
    labelFontSize: "0.8125rem", // 13px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: ssenseColor.black // #000000
  },
  // SSENSE search input: a square hairline box, small type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.25rem" // 20px
  },
  // SSENSE toggle / switch label: small black grotesque (measured switch track
  // ≈ 32×20px; the label is small black text).
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: ssenseColor.black // #000000
  }
} as const;

// --- semantic (SSENSE-specific role mapping) --------------------------------
const semantic = {
  surface: {
    default: ssenseColor.white, // #ffffff white
    subtle: ssenseColor.grey[50], // #fbfbfb faint alt surface
    raised: ssenseColor.white, // #ffffff white
    inverse: ssenseColor.black, // #000000 black inverse surface (the CTA/footer tone)
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop — measured oklab(0 0 0 / 0.5)
  },
  text: {
    primary: ssenseColor.black, // #000000 (measured body color rgb 0,0,0)
    secondary: ssenseColor.grey[600], // #888888 (rgb 136 secondary text)
    muted: ssenseColor.grey[600], // #888888
    inverse: ssenseColor.white, // white on black / dark surfaces
    link: ssenseColor.black // #000000 — SSENSE links are black, not coloured
  },
  border: {
    subtle: ssenseColor.grey[100], // #f3f3f3 dominant hairline divider (rgb 243)
    strong: ssenseColor.grey[400], // #b6b6b6 field / input border (rgb 182)
    interactive: ssenseColor.black // #000000 focus / interactive
  },
  action: {
    primary: ssenseColor.black, // #000000 primary button (the famous black CTA)
    primaryHover: ssenseColor.grey[600], // #888888 — slightly lifted black on hover (à confirmer)
    primaryText: ssenseColor.white, // white text on black
    secondary: ssenseColor.grey[100], // #f3f3f3 secondary surface
    secondaryHover: ssenseColor.grey[200], // #e8e8e8
    secondaryText: ssenseColor.black, // #000000
    danger: ssenseColor.system.error // #c0202e (à confirmer — no SSENSE source)
  },
  feedback: {
    success: ssenseColor.system.success,
    warning: ssenseColor.system.warning,
    error: ssenseColor.system.error,
    info: ssenseColor.system.info
  },
  status: {
    pending: ssenseColor.system.warning,
    processing: ssenseColor.system.info,
    completed: ssenseColor.system.success,
    failed: ssenseColor.system.error
  },
  // Categorical data-vis palette. SSENSE publishes no data-vis scale and uses no
  // decorative colour, so this is a coherent MONOCHROME proposal (a black→grey
  // ramp) plus the restrained system hues, drawn to honour the no-colour identity
  // (see MAPPING.md, "à confirmer" — not an official scale).
  data: {
    category1: ssenseColor.black, // #000000
    category2: ssenseColor.grey[600], // #888888
    category3: ssenseColor.grey[400], // #b6b6b6
    category4: ssenseColor.grey[300], // #cccccc
    category5: ssenseColor.grey[200], // #e8e8e8
    category6: ssenseColor.system.error, // restrained red (à confirmer)
    category7: ssenseColor.system.success, // restrained green (à confirmer)
    category8: ssenseColor.system.warning // restrained amber (à confirmer)
  }
} as const;

/**
 * The SSENSE theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry SSENSE-specific (monochrome) values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so SSENSE's black-on-white minimal identity reaches the
 * components (buttons, tabs, pagination, chat bubbles…), not just the elements
 * that read semantic vars directly.
 */
export const ssenseTheme: TenantTheme = {
  id: "ssense",
  label: "SSENSE",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default ssenseTheme;
