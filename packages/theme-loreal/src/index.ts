import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * L'Oréal (groupe L'Oréal) theme for the Sentropic token structure.
 *
 * Measured-clone: every value below is taken from the PUBLIC L'Oréal corporate
 * site CSS (loreal.com — `/themes/LorealCorp/css/bundle.css`) or, where noted,
 * from the published L'Oréal master-brand charter (black / white / gold). We
 * reference font *names* only (Helvetica Now Display, Halesworth), never the
 * binaries. Sources and every derived value are documented in MAPPING.md.
 *
 * L'Oréal colour reference (corporate site, light theme):
 *   Ink (body text / links / controls)   #3d3d3d   (body{color} / a{color})
 *   Brand / wordmark black + focus        #000000   (:focus-visible outline / master logo)
 *   Warm taupe CTA + ::selection          #cdc4ba   (.btn background / ::selection bg)
 *   Taupe dark (radio dot)                #afa192   (input__radio label:before)
 *   Cream warm off-white surface          #edecea   (warm surface tint)
 *   Page background grey                  #e5e5e5   (body{background})
 *   Subtle light surface                  #f5f5f5   (light section background)
 *   Border grey                           #d8d8d8   (rule / border)
 *   Strong border / muted text            #8e8e8e   (border / muted)
 *   Secondary text                        #6c6c6c   (secondary copy)
 *   Gold accent (master charter)          #c09853   (L'Oréal brand gold — charte)
 *   Success / error / info / warning      #299929 / #c2013a / #014f6c / #e3a635
 */

// --- L'Oréal raw colour palette (measured on the public corporate CSS) ------
const lorealColor = {
  // L'Oréal "ink" — the near-black the corporate site uses for ALL text, links
  // and interactive controls. The master wordmark itself is pure black.
  ink: {
    base: "#3d3d3d", // body{color} / a{color} — dominant ink (MEASURED)
    black: "#000000", // :focus-visible outline + master wordmark black (MEASURED + charte)
    soft: "#565655" // softer ink variant (MEASURED)
  },
  // Warm taupe / sand — the corporate CTA pill, choice-group fill and the text
  // selection colour. This is L'Oréal-corp's signature warm neutral.
  taupe: {
    base: "#cdc4ba", // .btn background / ::selection / .field-radio bg (MEASURED)
    dark: "#afa192", // input__radio label:before (radio dot) (MEASURED)
    cream: "#edecea" // warm off-white surface tint (MEASURED)
  },
  // Gold accent — the L'Oréal master-brand gold. Sourced from the published
  // brand charter (the corporate site itself leans black/taupe); site usage of
  // an exact gold is à confirmer.
  gold: {
    base: "#c09853", // L'Oréal brand gold (charte)
    light: "#f4ead6", // light gold tint (derived — à confirmer)
    dark: "#9a743a" // darker gold for hover/active (derived — à confirmer)
  },
  // Neutral grey scale (measured on the corporate CSS).
  grey: {
    0: "#ffffff", // white surfaces
    50: "#f5f5f5", // subtle light surface (MEASURED)
    100: "#e5e5e5", // page background (MEASURED body{background})
    200: "#d8d8d8", // border grey (MEASURED)
    400: "#8e8e8e", // strong border / muted text (MEASURED)
    600: "#6c6c6c", // secondary text (MEASURED)
    900: "#1a1a1a" // darkest neutral (derived — à confirmer)
  },
  // System / status colours (measured on the corporate site; warning AA on white
  // à confirmer). L'Oréal master purple kept for the categorical data palette.
  system: {
    success: "#299929", // green (MEASURED)
    error: "#c2013a", // deep red (MEASURED — AA on white)
    warning: "#e3a635", // amber / gold (MEASURED — AA caveat à confirmer)
    info: "#014f6c", // teal / dark blue (MEASURED)
    purple: "#46166b" // L'Oréal master purple (charte / site accent)
  }
} as const;

// --- foundation (L'Oréal-specific values) ----------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family = L'Oréal's primary/action ink (black/white).
    blue: {
      10: lorealColor.grey[200], // light ink tint
      60: lorealColor.ink.base, // #3d3d3d primary ink
      80: lorealColor.ink.black // #000000 wordmark black
    },
    // L'Oréal has no cyan; the closest brand accent is the master gold, so the
    // Sentropic "cyan" accent slot is mapped to the L'Oréal gold family.
    cyan: {
      10: lorealColor.gold.light, // light gold tint
      50: lorealColor.gold.base, // #c09853 brand gold accent
      70: lorealColor.gold.dark // darker gold
    },
    // Sentropic "slate" role family mapped onto the L'Oréal grey scale.
    slate: {
      0: lorealColor.grey[0], // white
      10: lorealColor.grey[50], // subtle light surface
      20: lorealColor.grey[200], // borders / contrast background
      60: lorealColor.grey[600], // secondary text
      80: lorealColor.ink.base, // #3d3d3d primary text ink
      90: lorealColor.grey[900] // darkest
    },
    feedback: {
      success: lorealColor.system.success,
      warning: lorealColor.system.warning,
      error: lorealColor.system.error,
      info: lorealColor.system.info
    }
  },
  // L'Oréal corporate UI/body face is Helvetica Now Display; the brand serif
  // Halesworth is used for editorial display. Font *names* only, no binaries.
  font: {
    sans: "'HelveticaNowDisplay', Arial, Helvetica, sans-serif",
    display: "'Halesworth', 'Times New Roman', Times, serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace" // no brand mono — à confirmer
  },
  // Standard rem spacing scale (L'Oréal uses a comparable rem scale; kept aligned
  // with the Sentropic base for component-grid fidelity — à confirmer exact steps).
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
  // L'Oréal-corp is gently rounded: controls carry small radii, CTAs go pill,
  // and rect CTAs add a single asymmetric corner (a signature; see MAPPING.md).
  radius: {
    none: "0",
    sm: "0.25rem", // 4px — :focus-visible border-radius (MEASURED)
    md: "0.5rem", // 8px — input / control soft corner
    lg: "1rem", // 16px — cards
    pill: "999px" // .btn border-radius:1.375rem → pill CTAs (MEASURED signature)
  },
  // L'Oréal elevation is a warm-grey soft shadow (the form container drops a
  // -1px 2px 6px #c7c0c0). Other steps derived from the ink — à confirmer.
  shadow: {
    subtle: "0 1px 2px rgb(61 61 61 / 0.10)",
    medium: "-1px 2px 6px 2px rgb(199 192 192 / 0.45)", // form-main-container (MEASURED #c7c0c0)
    floating: "0 8px 24px rgb(61 61 61 / 0.18)"
  },
  // L'Oréal motion: the brand transition is .3s with a distinctive ease
  // (cubic-bezier(.63,.37,.55,.9)) — MEASURED on .btn / a transitions.
  motion: {
    fast: "150ms",
    normal: "300ms", // MEASURED .3s
    slow: "450ms",
    easing: "cubic-bezier(0.63, 0.37, 0.55, 0.9)" // MEASURED
  },
  // z-index roles are not brand-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (L'Oréal) ----------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // L'Oréal control density. Inputs run a ~42px line-height; CTAs sit a touch
  // tighter. sm/md/lg follow the brand size feel (exact steps à confirmer).
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0", paddingInline: "2rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1.125rem" }
  },
  // L'Oréal typography: Helvetica Now Display throughout the UI. Buttons carry a
  // slight tracking (.btn letter-spacing:.05rem) and fields a finer tracking
  // (input letter-spacing:.0375rem) — both MEASURED.
  typography: {
    control: { family: "'HelveticaNowDisplay', Arial, sans-serif", size: "1rem", weight: "500", lineHeight: "1.5", letterSpacing: "0.05rem", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'HelveticaNowDisplay', Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0.0375rem", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'HelveticaNowDisplay', Arial, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // L'Oréal links are NOT underlined by default (a{text-decoration:none}); they
    // are ink with a colour transition (animated underline on hover — à confirmer).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.08em", decorationOffsetHover: "0.15em"
    }
  },
  disabledOpacity: "0.5", // dim disabled controls (à confirmer)
  transition: { property: "background-color, border-color, color, outline-color", duration: "300ms", easing: "cubic-bezier(0.63, 0.37, 0.55, 0.9)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // L'Oréal FOCUS = a thin pure-black OUTLINE offset off the control.
  // MEASURED: `:focus-visible { outline: 1px solid #000; outline-offset: 4px }`.
  focus: {
    strategy: "outline",
    width: "1px",
    offset: "4px",
    color: lorealColor.ink.black, // #000000
    inset: "0"
  },
  // L'Oréal form fields are MINIMAL / FILLED with a faint rule — not a boxed
  // outline. MEASURED: `input { border:none; border-top:.0625rem solid
  // rgba(61,61,61,.15); border-radius:0 0 0 .9375rem; padding:0 1rem }`. Modelled
  // here as `filled-underline`: a light fill + a single faint rule, soft corners.
  field: {
    style: "filled-underline",
    fillBg: lorealColor.grey[50], // #f5f5f5 light fill
    underlineColor: lorealColor.grey[200], // #d8d8d8 faint rule (≈ rgba(61,61,61,.15))
    underlineWidth: "1px",
    radiusTop: "4px", // soft top corners
    underlineMode: "border", // a real bottom rule
    // Native <select>: redraw the chevron in L'Oréal ink with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%233d3d3d' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // L'Oréal cards: warm separation — a faint border + soft warm shadow on hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: lorealColor.grey[50] // #f5f5f5
  },
  // L'Oréal secondary button = the signature TAUPE PILL (warm taupe fill, ink
  // text), darkening to the taupe-dark on hover. MEASURED: `.btn { background:
  // #cdc4ba; color:#3d3d3d; border-radius:1.375rem }`.
  buttonSecondary: {
    background: lorealColor.taupe.base, // #cdc4ba taupe fill
    border: "transparent",
    hoverBackground: lorealColor.taupe.dark // #afa192 darker taupe on hover
  },
  // L'Oréal tabs / nav: active tab = bold ink label with a bottom ink underline.
  tabs: {
    activeText: lorealColor.ink.base, // #3d3d3d
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // L'Oréal pagination: borderless ink links; active page = filled ink.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: lorealColor.ink.base, // #3d3d3d
    activeBackground: lorealColor.ink.base, // #3d3d3d filled active page
    activeText: lorealColor.grey[0], // white on ink
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // L'Oréal breadcrumb: ink links, dark current page, grey separators.
  breadcrumb: {
    linkText: lorealColor.ink.base, // #3d3d3d
    text: lorealColor.grey[600], // #6c6c6c trail text
    currentText: lorealColor.ink.base, // #3d3d3d current page
    separator: lorealColor.grey[400], // #8e8e8e
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem", // 24px
    currentWeight: "700"
  },
  // L'Oréal notice / alert: a coloured LEFT accent filet on a transparent box.
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
  // L'Oréal details: a dark bold summary trigger.
  accordion: {
    text: lorealColor.ink.base, // #3d3d3d summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "700",
    lineHeight: "1.5rem" // 24px
  },
  // L'Oréal tag: a small warm cream chip.
  tag: {
    radius: "4px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: lorealColor.taupe.cream, // #edecea warm chip
    neutralText: lorealColor.ink.base // #3d3d3d
  },
  // L'Oréal badge: a small ink-filled badge.
  badge: {
    radius: "4px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: lorealColor.ink.base, // #3d3d3d
    infoText: lorealColor.grey[0] // white
  },
  // L'Oréal checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: lorealColor.ink.base // #3d3d3d
  },
  // L'Oréal search input.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // L'Oréal toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: lorealColor.ink.base // #3d3d3d
  }
} as const;

// --- semantic (L'Oréal-specific role mapping) ------------------------------
const semantic = {
  surface: {
    default: lorealColor.grey[0], // white
    subtle: lorealColor.grey[50], // #f5f5f5 light surface
    raised: lorealColor.grey[0], // white
    inverse: lorealColor.ink.black, // #000000 dark sections / footer (master black)
    overlay: "rgb(0 0 0 / 0.6)" // modal backdrop (brand black tint)
  },
  text: {
    primary: lorealColor.ink.base, // #3d3d3d (body / a colour)
    secondary: lorealColor.grey[600], // #6c6c6c
    muted: lorealColor.grey[400], // #8e8e8e
    inverse: lorealColor.grey[0], // white on dark surfaces
    link: lorealColor.ink.base // #3d3d3d (links are ink, no default underline)
  },
  border: {
    subtle: lorealColor.grey[200], // #d8d8d8
    strong: lorealColor.grey[400], // #8e8e8e
    interactive: lorealColor.ink.base // #3d3d3d
  },
  action: {
    primary: lorealColor.ink.base, // #3d3d3d primary (L'Oréal ink)
    primaryHover: lorealColor.ink.black, // #000000 darken to wordmark black
    primaryText: lorealColor.grey[0], // white text on ink
    secondary: lorealColor.grey[50], // #f5f5f5 secondary surface
    secondaryHover: lorealColor.grey[200], // #d8d8d8
    secondaryText: lorealColor.ink.base, // #3d3d3d
    danger: lorealColor.system.error // #c2013a
  },
  feedback: {
    success: lorealColor.system.success,
    warning: lorealColor.system.warning,
    error: lorealColor.system.error,
    info: lorealColor.system.info
  },
  status: {
    pending: lorealColor.system.warning,
    processing: lorealColor.system.info,
    completed: lorealColor.system.success,
    failed: lorealColor.system.error
  },
  // Categorical data-vis palette from the L'Oréal master + corporate hues.
  // L'Oréal does not publish an 8-colour sequential scale, so this is a coherent
  // proposal drawn from the brand palette (see MAPPING.md, "à confirmer").
  data: {
    category1: lorealColor.ink.base, // ink
    category2: lorealColor.gold.base, // gold
    category3: lorealColor.taupe.dark, // taupe
    category4: lorealColor.system.info, // teal
    category5: lorealColor.system.purple, // L'Oréal purple
    category6: lorealColor.system.success, // green
    category7: lorealColor.system.error, // red
    category8: lorealColor.system.warning // amber
  }
} as const;

/**
 * The L'Oréal theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry the measured L'Oréal values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the L'Oréal brand reaches every component (buttons,
 * tabs, pagination, fields…), not just the elements reading semantic vars.
 */
export const lorealTheme: TenantTheme = {
  id: "loreal",
  label: "L'Oréal",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default lorealTheme;
