import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * LIGHTSPEED (lightspeedhq.com — the Montréal-HQ point-of-sale / commerce SaaS,
 * Lightspeed Commerce Inc.) theme for the Sentropic token structure.
 *
 * Lightspeed DOES publish design tokens as CSS custom properties on its live
 * marketing site. The values below are MEASURED from the site's actual
 * stylesheets:
 *   - .../themes/ls/prod/css/main.css   (the legacy "gb-" design system, a
 *     `:root{--color--…; --font-…; --transition__…}` token block)
 *   - .../themes/ls/dist/css/tailwind-style.css  (the newer Tailwind layer,
 *     `--tw-color-red-60`, `--tw-color-wg-20`, etc.)
 * We reference the font *names* only ("lsRegular", "lsBold", "lsMedium",
 * "lsOblique" — Lightspeed's own webfont aliases over a HelveticaNeue fallback),
 * never font binaries. Sources and the full mapping table are in MAPPING.md.
 *
 * Lightspeed's identity is a BOLD RED commerce SaaS look: a vivid red primary
 * action (`#e81c1c`, darkening to `#c7141f` on hover/active), near-black warm
 * ink (`#191513` charcoal / `#000`), a warm-grey neutral scale, white surfaces.
 * The signature shapes are PILL buttons (border-radius 30–50px, 2px solid
 * border) and 6px-rounded containers/cards, with boxed (outline) form fields
 * carrying a thin grey ring that thickens to a black 2px ring on focus, and a
 * RED native-select chevron. Where Sentropic needs a role Lightspeed never
 * colours (a brand blue, a cyan accent), the closest measured value is used and
 * the choice is noted "à confirmer" in MAPPING.md.
 *
 * Lightspeed colour reference (measured, light theme):
 *   Brand red (highlight / action)     #e81c1c   --color--highlight = --tw-color-red-60
 *   Red darker (hover / active / focus)#c7141f   --color--highlight--darker
 *   Red deep (data ramp)               #c6010d   --tw-color-red-52
 *   Charcoal / warm ink (inverse)      #191513   --tw-color-wg-20 (charcoal)
 *   Near-black (text primary)          #000000   --color--darkest
 *   Dark mid                           #2b2b2b   --color--darkmid
 *   Dark (warm)                        #413c3a   --tw-color-wg-36
 *   Grey mid (secondary / field ring)  #757575   --color--mid / --tw-color-neutral-80
 *   Grey lightmid (border)             #dddddd   --color--lightmid / --tw-color-neutral-60
 *   Grey light (subtle fill)           #f0f0f0   --color--light
 *   Warm grey 92 (raised tint)         #e9e3e0   --tw-color-wg-92
 *   Warm grey 96 (faint surface)       #f7f0ed   --tw-color-wg-96
 *   Neutral 50 (faint alt surface)     #f6f4f3   --tw-color-neutral-50
 *   White (surface default)            #ffffff   --color--lightest / --tw-color-white
 *   Valid green (success)              #0ead30   --color--valid
 *   Invalid amber (warning)            #ea891e   --color--invalid
 *   Invalid amber darker               #7a4000   --color--invalid--darker
 *   Accent deep blue (info)            #1270f0   --tw-color-accent-deep-blue
 */

// --- LIGHTSPEED raw colour palette (measured from live CSS custom props) -----
const lightspeedColor = {
  // The brand IS red. Lightspeed uses `--color--highlight` for the primary CTA
  // fill, ::selection, the focus filet and the select chevron; the darker step
  // is the hover/active/focus colour.
  red: "#e81c1c", // --color--highlight / --tw-color-red-60 — primary action
  redDarker: "#c7141f", // --color--highlight--darker — hover / active / focus
  redDeep: "#c6010d", // --tw-color-red-52 — deeper red (data ramp)
  // Warm near-black ink scale.
  charcoal: "#191513", // --tw-color-wg-20 (charcoal) — warm inverse surface
  black: "#000000", // --color--darkest — primary text, focus ring
  darkmid: "#2b2b2b", // --color--darkmid — dark hover background
  darker: "#323232", // --color--darker — dark text alt
  wg36: "#413c3a", // --tw-color-wg-36 — warm dark
  // Warm-grey neutral scale (each value measured from a real token).
  grey: {
    mid: "#757575", // --color--mid / --tw-color-neutral-80 — secondary text, field ring
    lightmid: "#dddddd", // --color--lightmid / --tw-color-neutral-60 — borders
    light: "#f0f0f0", // --color--light — subtle fill surface
    wg92: "#e9e3e0", // --tw-color-wg-92 — warm raised tint
    neutral50: "#f6f4f3", // --tw-color-neutral-50 — faint alt surface
    wg96: "#f7f0ed", // --tw-color-wg-96 — faint warm surface
    white: "#ffffff" // --color--lightest / --tw-color-white — surface default
  },
  // System / feedback hues (Lightspeed publishes these as tokens).
  system: {
    success: "#0ead30", // --color--valid — green
    warning: "#ea891e", // --color--invalid — amber (validation)
    warningDarker: "#7a4000", // --color--invalid--darker — AA-on-white amber text
    error: "#e81c1c", // Lightspeed has no distinct error hue; it reuses the brand red
    info: "#1270f0" // --tw-color-accent-deep-blue — the closest measured blue (à confirmer)
  }
} as const;

// --- foundation (LIGHTSPEED-specific values) ---------------------------------
const foundation = {
  color: {
    // The Sentropic "blue" role family (action / primary / link) is mapped onto
    // Lightspeed's RED — the Lightspeed primary action IS red, not blue.
    // (à confirmer: Lightspeed has no brand blue; deep-blue #1270f0 exists only
    // as a minor accent, not the action colour.)
    blue: {
      10: lightspeedColor.grey.wg96, // #f7f0ed lightest warm tint
      60: lightspeedColor.red, // #e81c1c primary action / link (Lightspeed red)
      80: lightspeedColor.redDarker // #c7141f darker red step (hover/active)
    },
    // Lightspeed has no cyan. The Sentropic "cyan" accent slot is mapped to the
    // red family (the only accent Lightspeed has). (à confirmer.)
    cyan: {
      10: lightspeedColor.grey.wg96, // #f7f0ed light warm tint
      50: lightspeedColor.red, // #e81c1c red accent
      70: lightspeedColor.redDarker // #c7141f darker red
    },
    // Sentropic "slate" role family mapped onto the Lightspeed warm neutral scale.
    slate: {
      0: lightspeedColor.grey.white, // #ffffff white
      10: lightspeedColor.grey.neutral50, // #f6f4f3 faint alt surface
      20: lightspeedColor.grey.lightmid, // #dddddd hairline / subtle border
      60: lightspeedColor.grey.mid, // #757575 secondary text
      80: lightspeedColor.black, // #000000 primary text
      90: lightspeedColor.charcoal // #191513 warm darkest (inverse)
    },
    feedback: {
      success: lightspeedColor.system.success,
      warning: lightspeedColor.system.warning,
      error: lightspeedColor.system.error,
      info: lightspeedColor.system.info
    }
  },
  // Lightspeed serves webfont aliases: "lsRegular" (body / fields), "lsBold"
  // (buttons / display), "lsMedium" and "lsOblique". We reference the *names*
  // only, with Lightspeed's own HelveticaNeue fallback chain. Mono is not part
  // of Lightspeed — the Sentropic mono stack is kept.
  font: {
    sans: "lsRegular, HelveticaNeue, 'Helvetica Neue', Helvetica, Arial, sans-serif",
    display: "lsBold, HelveticaNeue, 'Helvetica Neue', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. Lightspeed's grid spacing is not strongly
  // tokenised as a public scale; kept aligned with the Sentropic 4px base
  // (form gaps measured 6–12px, button padding 24–36px). ("à confirmer" steps.)
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
  // Lightspeed's signature shapes: PILL buttons + 6px-rounded containers. The
  // dominant container radius measured across the site is 6px (28 occurrences);
  // small chips/inputs use 3px; buttons are pills (30px regular, 50px form,
  // rounded to a 999px pill in the token). The native select uses 3px.
  radius: {
    none: "0",
    sm: "0.1875rem", // 3px — inputs / small chips (measured select & field radius)
    md: "0.375rem", // 6px — buttons-as-boxes / inputs / tabs (dominant container radius)
    lg: "0.375rem", // 6px — cards (the dominant container radius)
    pill: "999px" // pill buttons — measured border-radius 30–50px on CTAs
  },
  // Lightspeed elevation is soft and modern. Dropdowns/menus measured a diffuse
  // 0 0 25px -5px black/20% shadow; cards use light shadows. Kept conservative
  // ("à confirmer" exact specs beyond the measured dropdown shadow).
  shadow: {
    subtle: "0 1px 3px rgb(0 0 0 / 0.10)",
    medium: "0 4px 16px rgb(0 0 0 / 0.12)",
    floating: "0 0 25px -5px rgb(0 0 0 / 0.20)" // measured dropdown shadow
  },
  // Lightspeed transition tokens (measured `--transition__duration--*` and the
  // signature ease-out curve `cubic-bezier(0,0.6,0.6,1)`).
  motion: {
    fast: "120ms", // --transition__duration--fastest 0.12s
    normal: "240ms", // --transition__duration--fast 0.24s (the workhorse duration)
    slow: "480ms", // --transition__duration--slow 0.48s
    easing: "cubic-bezier(0, 0.6, 0.6, 1)" // --transition__easing--out
  },
  // z-index roles are not Lightspeed-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (LIGHTSPEED) -------------------------------------
  // Lightspeed buttons render a real 2px solid border (measured `border:2px
  // solid` on the CTA classes); field rings are 1px box-shadows. We encode the
  // signature button stroke as the 2px "thick" step.
  borderWidth: {
    none: "0",
    thin: "1px", // measured select/field border 1px solid #ddd / #757575 ring
    thick: "2px" // measured CTA border 2px solid
  },
  borderStyle: { solid: "solid" },
  // Lightspeed control density. Measured CTA heights: regular 36px, form 46px,
  // inline pill 50–60px; inputs 42–48px. md targets ~46px with generous
  // horizontal padding (measured 24–36px on CTAs); sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.875rem", paddingBlock: "0.5rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.875rem", fontSize: "1rem" },
    lg: { controlHeight: "3.5rem", paddingBlock: "0", paddingInline: "2.25rem", gap: "0.5rem", minWidth: "3.5rem", fontSize: "1.0625rem" }
  },
  // Lightspeed typography = the ls webfonts. Buttons use lsBold; body/fields use
  // lsRegular. Control labels are sentence case (measured letter-spacing 0.02em
  // on inline CTAs). Field text ~16px (measured 1rem on inputs).
  typography: {
    control: { family: "lsBold, HelveticaNeue, 'Helvetica Neue', Helvetica, Arial, sans-serif", size: "1rem", weight: "700", lineHeight: "1.22", letterSpacing: "0.02em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "lsRegular, HelveticaNeue, 'Helvetica Neue', Helvetica, Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "lsRegular, HelveticaNeue, 'Helvetica Neue', Helvetica, Arial, sans-serif", size: "0.875rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Lightspeed links are red (the brand action colour), underlined on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.08em", decorationOffsetHover: "0.16em"
    }
  },
  disabledOpacity: "0.5", // Lightspeed disables to a flat grey (#757575 fill); 0.5 approximates the dim
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "240ms", easing: "cubic-bezier(0, 0.6, 0.6, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
  // LIGHTSPEED FOCUS = a black double ring. Measured input focus renders
  // `box-shadow: 0 0 0 2px #000, 0 0 0 2px #000` (a crisp 2px black ring, no
  // outline). Some dismiss buttons use `outline: 1px solid #e81c1c` (a red
  // outline). We encode the dominant black 2px ring strategy.
  focus: {
    strategy: "ring",
    width: "2px",
    offset: "0",
    color: lightspeedColor.black, // #000000 — the input focus ring is black
    inset: "0"
  },
  // LIGHTSPEED form fields are BOXED (outline): white fill, a thin grey ring
  // (measured `box-shadow: 0 0 0 1px #757575`, the native select uses
  // `border:1px solid #ddd`) and a SMALL 3px radius. `style: "outline"` makes
  // the builder draw four equal borders from `surface.default` + `border.subtle`.
  // The native <select> chevron is REDRAWN in Lightspeed RED.
  field: {
    style: "outline",
    fillBg: lightspeedColor.grey.white, // #ffffff measured field background
    underlineColor: lightspeedColor.grey.mid, // #757575 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: Lightspeed redraws the chevron as a RED chevron (measured
    // stroke rgba(232,28,28,0.9)) with appearance:none and a right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23e81c1c' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Lightspeed cards: 6px-rounded boxes with a thin grey border and a soft
  // shadow; hover lifts to a faint warm tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: lightspeedColor.grey.neutral50 // #f6f4f3 faint warm hover tint
  },
  // Lightspeed secondary button = OUTLINED (transparent fill, 2px dark border +
  // dark text, dark fill on hover). The "on-light" CTA variant measured a
  // transparent fill with a solid border.
  buttonSecondary: {
    background: "transparent",
    border: lightspeedColor.charcoal, // #191513 warm dark 2px stroke
    hoverBackground: lightspeedColor.darkmid // #2b2b2b dark fill on hover (measured)
  },
  // Lightspeed tabs / sub-nav: the active item is marked with a RED underline
  // (the nav uses #e81c1c for the active/hover indicator).
  tabs: {
    activeText: lightspeedColor.black, // #000000 active label
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700", // lsBold active
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px nav type
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // red underline on the bottom edge
    indicatorMode: "border" // a real bottom border (the measured nav :after rule)
  },
  // Lightspeed pagination: borderless dark text links; active page = filled RED
  // pill with white text (the brand fill).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: lightspeedColor.charcoal, // #191513 link text
    activeBackground: lightspeedColor.red, // #e81c1c filled active page (brand red)
    activeText: lightspeedColor.grey.white, // white on red
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Lightspeed breadcrumb: dark links, grey trail, dark current page, grey
  // separators.
  breadcrumb: {
    linkText: lightspeedColor.charcoal, // #191513
    text: lightspeedColor.grey.mid, // #757575 trail text
    currentText: lightspeedColor.black, // #000000 current page
    separator: lightspeedColor.grey.mid, // #757575
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "700" // current page in lsBold
  },
  // Lightspeed notice / alert: a soft 6px box with a coloured left filet for the
  // severity accent (the brand uses left-accented notices).
  alert: {
    background: lightspeedColor.grey.wg96, // #f7f0ed faint warm fill
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0.25rem", // 4px ::before accent bar
    paddingTop: "1rem", // 16px
    paddingRight: "1.25rem", // 20px
    paddingBottom: "1rem", // 16px
    paddingLeft: "1.25rem", // 20px (clears the left filet)
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.5rem" // 24px
  },
  // Lightspeed accordion / disclosure (FAQ expanders): a dark, bold summary
  // trigger, 6px-soft, hairline separated.
  accordion: {
    text: lightspeedColor.charcoal, // #191513 summary label
    paddingBlock: "1rem", // 16px
    paddingInline: "0",
    fontSize: "1.0625rem", // 17px summary type
    fontWeight: "700", // lsBold summary
    lineHeight: "1.5rem" // 24px
  },
  // Lightspeed tag: a small ROUNDED warm-grey chip (6px radius — matches the
  // container radius, not a hard pill).
  tag: {
    radius: "0.375rem", // 6px — rounded chip
    paddingBlock: "0.1875rem", // 3px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "700",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: lightspeedColor.grey.light, // #f0f0f0 subtle fill
    neutralText: lightspeedColor.charcoal // #191513
  },
  // Lightspeed badge: a small ROUNDED filled badge — RED fill / white text (the
  // brand emphasis colour).
  badge: {
    radius: "0.375rem", // 6px rounded
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.6875rem", // 11px
    fontWeight: "700",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: lightspeedColor.red, // #e81c1c (Lightspeed emphasis = red)
    infoText: lightspeedColor.grey.white // white on red
  },
  // Lightspeed checkbox/radio label: dark warm grotesque text. The check icon is
  // the measured `--icon--checkmark--lightest` white tick on a filled box.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: lightspeedColor.charcoal // #191513
  },
  // Lightspeed search input: a boxed field, body type.
  search: {
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Lightspeed toggle / switch label: dark text; the measured switch focus uses
  // a 4px grey/25% box-shadow glow.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: lightspeedColor.charcoal // #191513
  }
} as const;

// --- semantic (LIGHTSPEED-specific role mapping) -----------------------------
const semantic = {
  surface: {
    default: lightspeedColor.grey.white, // #ffffff white
    subtle: lightspeedColor.grey.neutral50, // #f6f4f3 faint warm alt surface
    raised: lightspeedColor.grey.white, // #ffffff white
    inverse: lightspeedColor.charcoal, // #191513 warm charcoal inverse (footer / dark sections)
    overlay: "rgb(0 0 0 / 0.5)" // modal backdrop (à confirmer exact alpha)
  },
  text: {
    primary: lightspeedColor.black, // #000000 (measured input/body color #000)
    secondary: lightspeedColor.grey.mid, // #757575 (--color--mid)
    muted: lightspeedColor.grey.mid, // #757575
    inverse: lightspeedColor.grey.white, // white on charcoal / dark surfaces
    link: lightspeedColor.red // #e81c1c — Lightspeed links/actions are red
  },
  border: {
    subtle: lightspeedColor.grey.lightmid, // #dddddd (--color--lightmid, select border)
    strong: lightspeedColor.grey.mid, // #757575 (field ring colour)
    interactive: lightspeedColor.red // #e81c1c brand red interactive accent
  },
  action: {
    primary: lightspeedColor.red, // #e81c1c the bold red CTA
    primaryHover: lightspeedColor.redDarker, // #c7141f measured hover/active red
    primaryText: lightspeedColor.grey.white, // white text on red
    secondary: lightspeedColor.grey.light, // #f0f0f0 secondary surface
    secondaryHover: lightspeedColor.grey.wg92, // #e9e3e0 warm hover
    secondaryText: lightspeedColor.charcoal, // #191513
    danger: lightspeedColor.red // #e81c1c — Lightspeed's danger reuses the brand red
  },
  feedback: {
    success: lightspeedColor.system.success, // #0ead30
    warning: lightspeedColor.system.warning, // #ea891e
    error: lightspeedColor.system.error, // #e81c1c
    info: lightspeedColor.system.info // #1270f0 (à confirmer)
  },
  status: {
    pending: lightspeedColor.system.warning, // #ea891e
    processing: lightspeedColor.system.info, // #1270f0
    completed: lightspeedColor.system.success, // #0ead30
    failed: lightspeedColor.system.error // #e81c1c
  },
  // Categorical data-vis palette. Lightspeed publishes no data-vis scale; this
  // is a coherent proposal anchored on the brand red and warm neutrals plus the
  // system hues (see MAPPING.md "à confirmer" — not an official scale).
  data: {
    category1: lightspeedColor.red, // #e81c1c brand red
    category2: lightspeedColor.charcoal, // #191513 charcoal
    category3: lightspeedColor.system.info, // #1270f0 accent blue
    category4: lightspeedColor.system.success, // #0ead30 green
    category5: lightspeedColor.system.warning, // #ea891e amber
    category6: lightspeedColor.redDeep, // #c6010d deep red
    category7: lightspeedColor.grey.mid, // #757575 grey
    category8: lightspeedColor.wg36 // #413c3a warm dark
  }
} as const;

/**
 * The LIGHTSPEED theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Lightspeed-specific (bold-red,
 * warm-neutral) values, and the `component` layer is REBUILT from this theme's
 * own semantic/foundation via `createComponent` — so Lightspeed's red-on-white
 * identity reaches the components (buttons, tabs, pagination, chat bubbles…),
 * not just the elements that read semantic vars directly.
 */
export const lightspeedTheme: TenantTheme = {
  id: "lightspeed",
  label: "Lightspeed",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default lightspeedTheme;
