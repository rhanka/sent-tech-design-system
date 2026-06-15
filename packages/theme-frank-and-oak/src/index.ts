import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Frank And Oak (frankandoak.com — the Montréal fashion / lifestyle house) theme
 * for the Sentropic token structure.
 *
 * Frank And Oak publishes no design-token file; the values below are MEASURED
 * from the live site's computed CSS (https://www.frankandoak.com, inspected in a
 * real browser). We only reference the font *name* here ("CircularStd", Frank And
 * Oak's brand geometric sans, with a Helvetica-family fallback stack), never a
 * font binary. Sources and the full mapping table are in MAPPING.md. Frank And
 * Oak's identity is a MINIMAL black / grey / white fashion system: text is a near-
 * black ink (#292929), surfaces are pure white, corners are mostly square (a 2px
 * hairline rounding on controls), borders are thin neutral hairlines, and the CTA
 * is a solid black button. The brand "colour" IS black. Where Sentropic needs a
 * role Frank And Oak never colours (a brand hue, an accent, feedback states), the
 * closest monochrome or restrained system value is used and the choice is noted
 * "à confirmer" in MAPPING.md.
 *
 * Frank And Oak colour reference (measured, light theme):
 *   Black (action / CTA / link)          #000000   black CTA fill / links
 *   Black hover                          #202020   measured CTA hover / inverse tone
 *   Ink (primary text)                   #292929   measured body color
 *   Secondary text                       #6A6A6A   74× dominant grey / strong border
 *   Muted text                           #7A7A7A   measured muted grey
 *   White (surface default)              #ffffff   page background
 *   Subtle surface                       #f7f7f7   faint alt surface (à confirmer)
 *   Subtle border / field border         #CFCFCF   measured 1px hairline
 *   Overlay (modal backdrop)             black @50%
 */

// --- Frank And Oak raw colour palette (measured from live computed CSS) ------
const foaColor = {
  // The "brand" is pure black. Frank And Oak uses black for primary actions, the
  // filled CTA ("Add to Cart") and links; the body ink is a soft near-black.
  black: "#000000", // black CTA fill / link color — action, brand
  blackHover: "#202020", // measured CTA hover / dark inverse surface tone
  ink: "#292929", // measured body color — primary text
  white: "#ffffff", // page background rgb(255,255,255) — surface default
  // Monochrome grey scale (each value measured from a real element).
  grey: {
    50: "#f7f7f7", // faint alt subtle surface background (à confirmer)
    200: "#CFCFCF", // measured field / input / subtle border 1px hairline
    500: "#7A7A7A", // measured muted grey text
    600: "#6A6A6A" // 74× dominant secondary text / strong border
  },
  // Frank And Oak shows essentially NO decorative colour, so it publishes no
  // success/warning/error/info hues. These are restrained system colours chosen
  // to stay legible (WCAG AA) on white while not breaking the minimal aesthetic.
  // Entirely "à confirmer" — no measured Frank And Oak equivalent.
  system: {
    success: "#2e7d32", // muted green — à confirmer (no FOA source)
    error: "#c0202e", // muted red — à confirmer (no FOA source)
    warning: "#b26a00", // dark amber, AA on white — à confirmer
    info: "#3a6ea5" // muted blue — à confirmer (no FOA source)
  }
} as const;

// --- foundation (Frank And Oak-specific values) -----------------------------
const foundation = {
  color: {
    // Frank And Oak has no brand blue. The Sentropic "blue" role family (action /
    // primary / link) is mapped onto the monochrome black scale — the primary
    // action IS black. (à confirmer: Frank And Oak has no blue at all.)
    blue: {
      10: foaColor.grey[50], // #f7f7f7 lightest neutral tint
      60: foaColor.black, // #000000 primary action / link (FOA black)
      80: foaColor.blackHover // #202020 darker step (CTA hover)
    },
    // Frank And Oak has no cyan/accent. The Sentropic "cyan" accent slot is also
    // mapped to the monochrome scale (no decorative accent exists). (à confirmer.)
    cyan: {
      10: foaColor.grey[50], // #f7f7f7 light neutral tint
      50: foaColor.grey[600], // #6A6A6A the only "accent" FOA has is grey
      70: foaColor.black // #000000
    },
    // Sentropic "slate" role family mapped onto the FOA monochrome grey scale.
    slate: {
      0: foaColor.white, // #ffffff white
      10: foaColor.grey[50], // #f7f7f7 faint alt surface
      20: foaColor.grey[200], // #CFCFCF hairline / subtle border
      60: foaColor.grey[600], // #6A6A6A secondary text
      80: foaColor.ink, // #292929 primary text (soft ink)
      90: foaColor.black // #000000 darkest (terminal black)
    },
    feedback: {
      success: foaColor.system.success,
      warning: foaColor.system.warning,
      error: foaColor.system.error,
      info: foaColor.system.info
    }
  },
  // Frank And Oak serves "CircularStd" (the Circular geometric sans) as its brand
  // face for nearly all UI text, with a Helvetica-family fallback stack. We
  // reference the *name* only. Mono is not part of Frank And Oak — the Sentropic
  // mono stack is kept.
  font: {
    sans: "'CircularStd', 'Helvetica Neue', Arial, sans-serif",
    display: "'CircularStd', 'Helvetica Neue', Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. Frank And Oak's grid is whitespace-led but its raw
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
  // Frank And Oak is a minimal fashion system — mostly SQUARE with a tiny 2px
  // softening on controls / inputs and a 4px on cards. (à confirmer — measured
  // values are subtle; the brand reads square.)
  radius: {
    none: "0", // FOA default — square corners
    sm: "0", // controls square
    md: "2px", // button / input / tabs — barely-rounded
    lg: "4px", // cards — slightly softened
    pill: "999px" // tags / pills (kept for completeness)
  },
  // Frank And Oak elevation is almost flat — it relies on hairlines and whitespace,
  // not shadows. Kept conservative and black-tinted ("à confirmer" exact specs).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 12px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.14)"
  },
  // Frank And Oak animates with short, standard eases. Durations not fully
  // tokenised publicly; kept aligned with the base.
  motion: {
    fast: "120ms",
    normal: "150ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not FOA-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Frank And Oak) ----------------------------------
  // Frank And Oak borders are thin neutral HAIRLINES. Real elements render 1px
  // solid #CFCFCF strokes.
  borderWidth: {
    none: "0",
    thin: "1px", // FOA hairline (measured 1px #CFCFCF)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Frank And Oak control density. CTA buttons sit ~44px tall with generous
  // horizontal padding; nav text rows are small. md targets a ~44px touch height.
  // sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.8125rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.875rem" },
    lg: { controlHeight: "3.125rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.125rem", fontSize: "0.9375rem" }
  },
  // Frank And Oak typography = the CircularStd geometric sans. Control labels are
  // commonly UPPERCASE on CTAs; body/field text is sentence case.
  typography: {
    control: { family: "'CircularStd', 'Helvetica Neue', Arial, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.2", letterSpacing: "0.02em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'CircularStd', 'Helvetica Neue', Arial, sans-serif", size: "0.875rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'CircularStd', 'Helvetica Neue', Arial, sans-serif", size: "0.8125rem", weight: "400", lineHeight: "1.4", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Frank And Oak links are plain ink text; the hover affordance is an underline.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // FOA dims disabled controls heavily (minimal, near-ghost)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // Frank And Oak FOCUS = a crisp black OUTLINE (width 2px, black). Encodes the
  // black outline strategy.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: foaColor.black, // #000000 — FOA focuses in black, not a colour
    inset: "0"
  },
  // Frank And Oak form fields are BOXED (outline): a white fill with a thin
  // hairline border and a barely-there 2px radius. `style: "outline"` makes the
  // builder draw four equal borders from `surface.default` + `border.subtle`.
  // Measured input/select border = #CFCFCF @1px hairline, square box.
  field: {
    style: "outline",
    fillBg: foaColor.white, // #ffffff
    underlineColor: foaColor.grey[200], // #CFCFCF (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in pure black with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23000000' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Frank And Oak cards: minimal rounding, a thin hairline rather than a heavy
  // box. Keep a 1px border (the builder draws it from border.subtle = #CFCFCF) and
  // a faint hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: foaColor.grey[50] // #f7f7f7 faint hover tint
  },
  // Frank And Oak secondary button = OUTLINED (transparent fill, black hairline
  // border + ink text, faint grey fill on hover). The minimal alternative to the
  // filled black primary.
  buttonSecondary: {
    background: "transparent",
    border: foaColor.black, // #000000 hairline stroke
    hoverBackground: foaColor.grey[50] // #f7f7f7 faint fill on hover
  },
  // Frank And Oak tabs / sub-nav: active tab = ink bold label with a black bottom
  // underline (the minimal indicator), transparent fill.
  tabs: {
    activeText: foaColor.ink, // #292929
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.8125rem", // 13px (FOA small type)
    lineHeight: "1rem", // 16px
    indicatorSide: "bottom", // black underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline (not a box-shadow filet)
  },
  // Frank And Oak pagination: borderless ink text links; active page = filled
  // black square with white text (the monochrome equivalent of a brand fill).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: foaColor.ink, // #292929 link text
    activeBackground: foaColor.black, // #000000 filled active page
    activeText: foaColor.white, // white on black
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.8125rem", // 13px
    lineHeight: "1rem" // 16px
  },
  // Frank And Oak breadcrumb: ink links, grey trail, ink current page, grey
  // separators — all small geometric sans.
  breadcrumb: {
    linkText: foaColor.ink, // #292929
    text: foaColor.grey[600], // #6A6A6A trail text
    currentText: foaColor.ink, // #292929 current page
    separator: foaColor.grey[600], // #6A6A6A
    fontSize: "0.75rem", // 12px
    lineHeight: "1rem", // 16px
    currentWeight: "500" // current page is mildly emphasised
  },
  // Frank And Oak notice / alert: a minimal box — a thin hairline accent on a
  // white box, no fill. The severity accent is a slim coloured left filet.
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0", // left border collapses (filet instead)
    filetWidth: "0.125rem", // 2px ::before accent bar (thin, FOA-minimal)
    paddingTop: "0.875rem", // 14px
    paddingRight: "1rem", // 16px
    paddingBottom: "0.875rem", // 14px
    paddingLeft: "1.125rem", // 18px (clears the left filet)
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.25rem" // 20px
  },
  // Frank And Oak accordion / disclosure (the footer/menu expanders): an ink,
  // plain-weight summary trigger, square, hairline separated.
  accordion: {
    text: foaColor.ink, // #292929 summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "0", // FOA accordion rows are flush to the column
    fontSize: "0.8125rem", // 13px small type
    fontWeight: "400", // FOA summary is regular weight
    lineHeight: "1.25rem" // 20px
  },
  // Frank And Oak tag: a small barely-rounded grey chip.
  tag: {
    radius: "2px", // FOA controls carry a tiny 2px rounding
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.6875rem", // 11px
    fontWeight: "400",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: foaColor.grey[50], // #f7f7f7 subtle fill
    neutralText: foaColor.ink // #292929
  },
  // Frank And Oak badge: a barely-rounded filled badge — black fill / white text
  // (the only "filled" emphasis FOA uses), uppercase, small.
  badge: {
    radius: "2px", // barely rounded
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px (tiny)
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    textTransform: "uppercase", // FOA labels are often uppercase
    minHeight: "1.25rem", // 20px
    infoBackground: foaColor.black, // #000000 (FOA "info" = black, not blue)
    infoText: foaColor.white // white on black
  },
  // Frank And Oak checkbox/radio label: small ink geometric sans.
  choice: {
    labelFontSize: "0.8125rem", // 13px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: foaColor.ink // #292929
  },
  // Frank And Oak search input: a barely-rounded hairline box, small type.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.25rem" // 20px
  },
  // Frank And Oak toggle / switch label: small ink geometric sans.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: foaColor.ink // #292929
  }
} as const;

// --- semantic (Frank And Oak-specific role mapping) -------------------------
const semantic = {
  surface: {
    default: foaColor.white, // #ffffff white
    subtle: foaColor.grey[50], // #f7f7f7 faint alt surface
    raised: foaColor.white, // #ffffff white
    inverse: foaColor.blackHover, // #202020 dark inverse surface (the footer tone)
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop — black @50%
  },
  text: {
    primary: foaColor.ink, // #292929 (measured body color)
    secondary: foaColor.grey[600], // #6A6A6A (74× dominant secondary text)
    muted: foaColor.grey[500], // #7A7A7A measured muted grey
    inverse: foaColor.white, // white on black / dark surfaces
    link: foaColor.black // #000000 — FOA links are black, not coloured
  },
  border: {
    subtle: foaColor.grey[200], // #CFCFCF measured 1px hairline
    strong: foaColor.grey[600], // #6A6A6A strong border
    interactive: foaColor.black // #000000 focus / interactive
  },
  action: {
    primary: foaColor.black, // #000000 primary button (the black CTA)
    primaryHover: foaColor.blackHover, // #202020 measured CTA hover
    primaryText: foaColor.white, // white text on black
    secondary: "#f2f2f2", // light secondary surface (à confirmer)
    secondaryHover: "#e6e6e6", // (à confirmer)
    secondaryText: foaColor.ink, // #292929
    danger: foaColor.system.error // #c0202e (à confirmer — no FOA source)
  },
  feedback: {
    success: foaColor.system.success,
    warning: foaColor.system.warning,
    error: foaColor.system.error,
    info: foaColor.system.info
  },
  status: {
    pending: foaColor.system.warning,
    processing: foaColor.system.info,
    completed: foaColor.system.success,
    failed: foaColor.system.error
  },
  // Categorical data-vis palette. Frank And Oak publishes no data-vis scale and
  // uses no decorative colour, so this is a coherent MONOCHROME proposal (a
  // black→grey ramp) plus the restrained system hues, drawn to honour the minimal
  // identity (see MAPPING.md, "à confirmer" — not an official scale).
  data: {
    category1: foaColor.black, // #000000
    category2: foaColor.grey[600], // #6A6A6A
    category3: foaColor.grey[500], // #7A7A7A
    category4: foaColor.grey[200], // #CFCFCF
    category5: foaColor.grey[50], // #f7f7f7
    category6: foaColor.system.error, // restrained red (à confirmer)
    category7: foaColor.system.success, // restrained green (à confirmer)
    category8: foaColor.system.warning // restrained amber (à confirmer)
  }
} as const;

/**
 * The Frank And Oak theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Frank And Oak-specific (minimal
 * monochrome) values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so Frank And Oak's black-on-white
 * minimal identity reaches the components (buttons, tabs, pagination, chat
 * bubbles…), not just the elements that read semantic vars directly.
 */
export const frankAndOakTheme: TenantTheme = {
  id: "frank-and-oak",
  label: "Frank And Oak",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default frankAndOakTheme;
