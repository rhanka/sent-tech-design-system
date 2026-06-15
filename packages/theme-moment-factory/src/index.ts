import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * MOMENT FACTORY (momentfactory.com — the Montréal immersive-media /
 * multimedia-entertainment studio) theme for the Sentropic token structure.
 *
 * Moment Factory's storefront runs on Shopify (the "Nova / Ordinal" theme). Its
 * design is driven by a small set of CSS custom properties resolved per colour
 * scheme: `--layout-background-color` / `--layout-text-color` (an RGB-triplet
 * pair that INVERTS between schemes), `--accent-button-color`, `--button-radius`,
 * `--base-font-family` / `--base-font-weight`. Every value below is MEASURED from
 * the live site's stylesheets and inline theme settings (fetched from
 * https://www.momentfactory.com/ and its /cdn/shop/t/107/assets/*.css bundle).
 * Shopify's wishlist plug-in ships Polaris defaults (#5c6ac4) — those are NOT the
 * brand and are deliberately ignored. We reference font NAMES only ("Calibre",
 * the brand's proprietary sans — measured `--base-font-family: "Calibre"`), never
 * font binaries. Sources and the full mapping table are in MAPPING.md.
 *
 * Moment Factory's identity is BOLD, MINIMAL and HIGH-CONTRAST: the site renders
 * its hero and header on a BLACK ground (`color_scheme` background #000000, text
 * #FFFFFF), and the one vivid accent is an electric YELLOW — #FFEA00 — measured as
 * the floating-action button fill AND the `::selection` highlight
 * (`background-color: #ffea0066`). Buttons are SQUARE (measured
 * `--button-radius: 0px`), UPPERCASE (`text-transform: uppercase`) and INVERT on
 * hover (solid CTA swaps background↔text). Body type is heavy (measured
 * `--base-font-weight: 700`), headings track open (`letter-spacing: .02em`).
 * This is therefore a DARK-FIRST theme: `mode: "dark"`, black surfaces, white
 * text, electric-yellow accent. Form fields are borderless and SHARP (measured
 * `input { border: none; background: transparent; border-radius: 0 }`); only
 * textareas round (`--textarea-radius: 24px`). Focus is an accessible YELLOW ring
 * on the brand accent. Where Sentropic needs a role Moment Factory does not
 * publish, the closest measured value is used and noted "à confirmer" in
 * MAPPING.md.
 *
 * Moment Factory colour reference (measured):
 *   Black (page / stage)         #000000   color_scheme background / --color-black
 *   White (text on dark)         #FFFFFF   color_scheme text
 *   Electric yellow (THE accent) #FFEA00   floating-button fill / ::selection (#ffea0066)
 *   Link blue                    #2F80ED   --color-link
 *   (no published grey ramp — neutral steps derived, see "à confirmer")
 */

// --- MOMENT FACTORY raw colour palette (measured) ---------------------------
const momentFactoryColor = {
  // The black stage. Moment Factory's hero + header render on pure black; white
  // is the inverted text/ink. These are the two poles of the measured
  // `--layout-background-color` / `--layout-text-color` triplet pair.
  black: "#000000", // color_scheme background / --color-black: rgb(0,0,0)
  white: "#ffffff", // color_scheme text — white ink on the black stage
  // The single vivid brand accent — electric yellow. Measured as the floating
  // action-button fill (`floating_button_background_color: #FFEA00`) and the text
  // selection highlight (`::selection { background-color: #ffea0066 }`). Black
  // text reads on it (measured `floating_button_text_color: #000000`).
  yellow: "#ffea00", // #FFEA00 — THE Moment Factory accent
  // Measured link hue (`--color-link: #2F80ED`), reused as the info/cool role.
  blue: "#2f80ed", // --color-link
  // Moment Factory publishes no neutral ramp (the theme drives everything from the
  // inverting black/white pair). The grey steps below are DERIVED tints/shades of
  // the black↔white axis for surfaces, borders and muted text — see MAPPING.md
  // "à confirmer".
  grey: {
    1: "#e6e6e6", // à confirmer — lightest neutral (inverse-surface border)
    2: "#b3b3b3", // à confirmer — secondary text on dark
    3: "#8a8a8a", // à confirmer — muted text
    4: "#4d4d4d", // à confirmer — strong border on dark
    5: "#2a2a2a", // à confirmer — subtle divider on dark
    6: "#161616", // à confirmer — raised dark surface (cards/panels over black)
    7: "#0d0d0d" // à confirmer — subtle panel just above black
  },
  // System / status colours. Moment Factory exposes no semantic status palette;
  // these are AA-grade defaults on the dark stage — à confirmer.
  system: {
    success: "#2e9e6b", // à confirmer — no measured Moment Factory hex
    warning: "#e0a800", // à confirmer — no measured Moment Factory hex
    error: "#e02424", // à confirmer — no measured Moment Factory hex
    info: "#2f80ed" // --color-link blue reused as info
  }
} as const;

// --- foundation (MOMENT FACTORY-specific values) ----------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (action / primary / link). Moment Factory's
    // PRIMARY ACCENT is the electric yellow, so the action steps map to the yellow
    // accent; the lightest step is a soft yellow tint, the dark step the brand
    // yellow. (à confirmer: the brand action is yellow, not blue.)
    blue: {
      10: "#fff8cc", // à confirmer — soft yellow tint of #ffea00
      60: momentFactoryColor.yellow, // #ffea00 THE accent (primary action)
      80: "#ccbb00" // à confirmer — deeper yellow (pressed/hover ground)
    },
    // Sentropic "cyan" accent slot. Moment Factory's only published cool hue is
    // the link blue; mapped here as the cool accent family. (à confirmer.)
    cyan: {
      10: "#d6e6fb", // à confirmer — light tint of #2f80ed
      50: momentFactoryColor.blue, // #2f80ed measured link blue
      70: momentFactoryColor.yellow // #ffea00 yellow as the warm accent
    },
    // Sentropic "slate" neutral family mapped onto the black↔white axis (dark-first:
    // 0 is the lightest ink, 90 is the black stage). The mid greys are derived.
    slate: {
      0: momentFactoryColor.white, // #ffffff white (lightest ink)
      10: momentFactoryColor.grey[1], // #e6e6e6 light neutral (à confirmer)
      20: momentFactoryColor.grey[4], // #4d4d4d strong border on dark (à confirmer)
      60: momentFactoryColor.grey[3], // #8a8a8a muted text (à confirmer)
      80: momentFactoryColor.grey[6], // #161616 raised dark surface (à confirmer)
      90: momentFactoryColor.black // #000000 the black stage (darkest)
    },
    feedback: {
      success: momentFactoryColor.system.success,
      warning: momentFactoryColor.system.warning,
      error: momentFactoryColor.system.error,
      info: momentFactoryColor.system.info
    }
  },
  // Moment Factory serves its proprietary "Calibre" across the whole site (measured
  // `--base-font-family: "Calibre", Arial, sans-serif` for body AND headings).
  // We reference the NAME only, with a sans-serif fallback. Body/UI weight is heavy
  // (measured `--base-font-weight: 700`); the accent/control weight is 400. Mono is
  // not part of Moment Factory — the Sentropic mono stack is kept.
  font: {
    sans: "'Calibre', Arial, sans-serif",
    display: "'Calibre', Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Moment Factory spacing follows the Shopify section scale (measured
  // `--section-padding` ramp 24 / 32 / 48 / 64 / 80 / 96px). Aligned here to the
  // Sentropic step keys; the small control steps are derived. (à confirmer for the
  // sub-16px steps.)
  spacing: {
    0: "0",
    1: "0.25rem", // 4px (à confirmer)
    2: "0.5rem", // 8px (à confirmer)
    3: "0.75rem", // 12px (à confirmer)
    4: "1rem", // 16px (measured section min-padding)
    6: "1.5rem", // 24px (--section-padding compact)
    8: "2rem", // 32px (--section-padding compact)
    12: "3rem", // 48px (--section-padding)
    16: "4rem" // 64px (--section-padding)
  },
  // Moment Factory is SHARP — measured `--button-radius: 0px` (square buttons /
  // controls) and `input { border-radius: 0 }`. The one rounded element is the
  // textarea (measured `--textarea-radius: 24px`), mapped to the lg slot. Small
  // chips fall back to a hairline 2px; the pill role is reserved for the rare
  // rounded surface.
  radius: {
    none: "0", // measured --button-radius / input radius — square
    sm: "0", // controls stay sharp
    md: "0", // --button-radius: 0px — controls / inputs / tabs are square
    lg: "24px", // --textarea-radius: 24px — the one rounded field surface
    pill: "9999px" // reserved (à confirmer — Moment Factory rarely rounds)
  },
  // Moment Factory elevation is minimal and graphic — flat black panels with faint
  // dark shadows (the site leans on contrast, not depth).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.40)",
    medium: "0 4px 12px rgb(0 0 0 / 0.50)",
    floating: "0 8px 24px rgb(0 0 0 / 0.60)"
  },
  // Moment Factory transitions are short and standard (measured `transition` on
  // buttons/links resolves to ~.2–.3s ease). Kept aligned with the Sentropic base.
  motion: {
    fast: "120ms",
    normal: "200ms",
    slow: "300ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Moment Factory-specific; kept aligned with the base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (MOMENT FACTORY) ---------------------------------
  // Moment Factory dividers/outlines are hairline (measured `--line-width` border
  // on the header underline; outlined buttons stroke `var(--outline-thickness)`).
  borderWidth: {
    none: "0",
    thin: "1px", // header underline / dividers
    thick: "2px" // outlined-button / checkbox stroke
  },
  borderStyle: { solid: "solid" },
  // Moment Factory control density. The brand CTAs are square, uppercase and
  // generous; md targets a comfortable ~44px control, sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.625rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0.75rem", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1.125rem" }
  },
  // Moment Factory typography = "Calibre". CTA/control labels are UPPERCASE and
  // medium-bold (measured buttons `text-transform: uppercase`, link buttons
  // `font-weight: 500`); body/field text is heavy (measured `--base-font-weight:
  // 700`). Base type is 16px; headings track open (measured `letter-spacing:
  // .02em`).
  typography: {
    control: { family: "'Calibre', Arial, sans-serif", size: "1rem", weight: "500", lineHeight: "1", letterSpacing: "0.02em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Calibre', Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Calibre', Arial, sans-serif", size: "0.75rem", weight: "400", lineHeight: "1.33", letterSpacing: "0.02em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Moment Factory links animate an UNDERLINE on hover (measured
    // `link-animation--underline` draws a bottom line in the accent on hover);
    // not underlined at rest.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // à confirmer — no single measured disabled token
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "200ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // MOMENT FACTORY FOCUS = an accessible YELLOW RING on the brand accent. The live
  // site largely suppresses outlines (`outline: none`) and relies on :focus-visible;
  // for accessibility we render a clean 2px ring in the electric yellow (#ffea00),
  // which stays visible on the black stage. (Ring technique à confirmer — the brand
  // does not publish an explicit focus indicator.)
  focus: {
    strategy: "ring",
    width: "2px",
    offset: "2px",
    color: momentFactoryColor.yellow, // #ffea00 — accessible yellow focus ring
    inset: "0"
  },
  // MOMENT FACTORY form fields are BORDERLESS and SHARP (measured `input { border:
  // none; background: transparent; border-radius: 0 }`). `style: "outline"` with a
  // square radius and a hairline underline-less box is the closest match — the
  // field reads as a flat, square control on the dark ground. The native <select>
  // chevron is redrawn in white with a 36px right gutter.
  field: {
    style: "outline",
    radius: "0", // measured input border-radius: 0 — square fields
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23ffffff' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.25rem"
  },
  // Moment Factory cards: flat raised dark surface over the black stage, square
  // corners, a hairline divider and a subtle lift on hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: momentFactoryColor.grey[5] // #2a2a2a faint lift on the dark card
  },
  // Moment Factory secondary button = OUTLINED ghost: transparent fill, white
  // border + text, inverting to a solid white fill / black text on hover (measured
  // outlined-button hover fills the stroke colour).
  buttonSecondary: {
    background: "transparent",
    border: momentFactoryColor.white, // #ffffff white stroke
    hoverBackground: momentFactoryColor.white // inverts to solid white on hover
  },
  // Moment Factory tabs / sub-nav: active tab = white bold label with a yellow
  // bottom indicator (the brand accent underline), transparent fill on the dark
  // stage.
  tabs: {
    activeText: momentFactoryColor.white, // #ffffff active label on dark
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // yellow underline on the bottom edge
    indicatorMode: "border"
  },
  // Moment Factory pagination: borderless white link text on the dark stage; active
  // page = filled yellow square (the brand accent) with black text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: momentFactoryColor.white, // #ffffff link text on dark
    activeBackground: momentFactoryColor.yellow, // #ffea00 filled active page (brand accent)
    activeText: momentFactoryColor.black, // black on yellow
    activeBorderWidth: "0",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Moment Factory breadcrumb: white links, muted trail, white current page, grey
  // separators — on the dark stage.
  breadcrumb: {
    linkText: momentFactoryColor.white, // #ffffff
    text: momentFactoryColor.grey[2], // #b3b3b3 trail text (à confirmer)
    currentText: momentFactoryColor.white, // #ffffff current page
    separator: momentFactoryColor.grey[3], // #8a8a8a (à confirmer)
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "700"
  },
  // Moment Factory notice / alert: a flat dark box with a coloured left filet
  // matching the severity, over the black stage.
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
    paddingLeft: "1.25rem", // 20px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Moment Factory accordion / disclosure: a bold white summary trigger on a flat
  // dark row, square.
  accordion: {
    text: momentFactoryColor.white, // #ffffff summary label on dark
    paddingBlock: "1rem", // 16px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "700",
    lineHeight: "1.5rem" // 24px
  },
  // Moment Factory tag: a small SQUARE chip — flat dark fill, white text (the brand
  // avoids rounded shapes; chips stay sharp).
  tag: {
    radius: "0", // square — measured --button-radius: 0
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "700",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: momentFactoryColor.grey[5], // #2a2a2a dark chip fill
    neutralText: momentFactoryColor.white // #ffffff text
  },
  // Moment Factory badge: a small filled SQUARE — brand yellow fill / black text.
  badge: {
    radius: "0", // square
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "700",
    lineHeight: "1.25rem", // 20px
    textTransform: "uppercase", // Moment Factory labels are uppercase
    minHeight: "1.25rem", // 20px
    infoBackground: momentFactoryColor.yellow, // #ffea00 brand accent
    infoText: momentFactoryColor.black // black on yellow
  },
  // Moment Factory checkbox/radio label: regular white type at base size. The
  // measured checkbox is a 24px square (border-radius 3px) that fills with the
  // brand accent when checked.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: momentFactoryColor.white // #ffffff label on dark
  },
  // Moment Factory search input: a borderless, square field on the dark stage.
  search: {
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Moment Factory toggle / switch label: regular white type; the checked track is
  // the brand yellow (measured checked controls fill the accent).
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.5rem", // 24px
    textColor: momentFactoryColor.white // #ffffff
  }
} as const;

// --- semantic (MOMENT FACTORY-specific role mapping, DARK-first) ------------
const semantic = {
  surface: {
    default: momentFactoryColor.black, // #000000 the black stage (color_scheme background)
    subtle: momentFactoryColor.grey[7], // #0d0d0d subtle panel just above black (à confirmer)
    raised: momentFactoryColor.grey[6], // #161616 raised cards/panels (à confirmer)
    inverse: momentFactoryColor.white, // #ffffff inverse (light) surface
    overlay: "rgb(0 0 0 / 0.72)" // modal backdrop over the dark stage
  },
  text: {
    primary: momentFactoryColor.white, // #ffffff white ink on the black stage
    secondary: momentFactoryColor.grey[2], // #b3b3b3 secondary text on dark (à confirmer)
    muted: momentFactoryColor.grey[3], // #8a8a8a muted text (à confirmer)
    inverse: momentFactoryColor.black, // #000000 text on light/yellow surfaces
    link: momentFactoryColor.white // #ffffff links (underline animates in on hover)
  },
  border: {
    subtle: momentFactoryColor.grey[5], // #2a2a2a subtle divider on dark (à confirmer)
    strong: momentFactoryColor.grey[4], // #4d4d4d stronger border on dark (à confirmer)
    interactive: momentFactoryColor.yellow // #ffea00 yellow interactive accent
  },
  action: {
    primary: momentFactoryColor.yellow, // #ffea00 THE electric-yellow CTA
    primaryHover: "#ffd400", // à confirmer — slightly deeper yellow on hover
    primaryText: momentFactoryColor.black, // black text on yellow (measured floating-button text)
    secondary: momentFactoryColor.white, // #ffffff white secondary surface (ghost inverts to white)
    secondaryHover: momentFactoryColor.grey[1], // #e6e6e6 (à confirmer)
    secondaryText: momentFactoryColor.black, // black secondary label on the inverted white fill
    danger: momentFactoryColor.system.error // #e02424 (à confirmer)
  },
  feedback: {
    success: momentFactoryColor.system.success, // #2e9e6b (à confirmer)
    warning: momentFactoryColor.system.warning, // #e0a800 (à confirmer)
    error: momentFactoryColor.system.error, // #e02424 (à confirmer)
    info: momentFactoryColor.system.info // #2f80ed (--color-link)
  },
  status: {
    pending: momentFactoryColor.system.warning, // #e0a800 (à confirmer)
    processing: momentFactoryColor.system.info, // #2f80ed
    completed: momentFactoryColor.system.success, // #2e9e6b (à confirmer)
    failed: momentFactoryColor.system.error // #e02424 (à confirmer)
  },
  // Categorical data-vis palette. Moment Factory publishes no data-vis scale; this
  // is a coherent proposal led by the brand yellow, the link blue and AA-grade
  // system hues, drawn to honour the high-contrast yellow-on-black identity (see
  // MAPPING.md "à confirmer" — not an official categorical token list).
  data: {
    category1: momentFactoryColor.yellow, // #ffea00 brand yellow
    category2: momentFactoryColor.blue, // #2f80ed link blue
    category3: "#ff5c00", // à confirmer — warm orange complement
    category4: momentFactoryColor.system.success, // #2e9e6b success green
    category5: momentFactoryColor.white, // #ffffff white
    category6: "#a855f7", // à confirmer — violet
    category7: momentFactoryColor.system.error, // #e02424 red
    category8: momentFactoryColor.grey[3] // #8a8a8a neutral grey
  }
} as const;

/**
 * The MOMENT FACTORY theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Moment Factory-specific
 * (yellow-on-black, dark-first, sharp/square, uppercase) values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the electric-yellow CTA, white ink, square borderless
 * fields and accessible yellow focus ring reach the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly. `mode: "dark"` because the brand site renders its hero and header on
 * a black stage.
 */
export const momentFactoryTheme: TenantTheme = {
  id: "moment-factory",
  label: "Moment Factory",
  mode: "dark",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default momentFactoryTheme;
