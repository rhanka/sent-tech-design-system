import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Kering (global luxury group — owner of Gucci, Saint Laurent, Bottega Veneta,
 * Balenciaga…) corporate design system theme for the Sentropic token structure.
 *
 * MEASURED CLONE — every colour value below is measured from the PUBLIC compiled
 * CSS of kering.com (the Next.js build served at `/_next/static/css/*.css`,
 * June 2026). The brand exposes its palette as named CSS custom properties
 * (`--black-pure`, `--gray-*`, `--beige-*`, `--blue-100`, the EP&L
 * `--pollution-*` map, …); each comment cites the real source variable. We only
 * reference the font *names* (Kering's proprietary Akzidenz-Grotesk licensing),
 * never the binaries. Sources and any derived ("à confirmer") values are
 * documented in MAPPING.md.
 *
 * Kering is a true MONOCHROME identity: pure black `#000000` ink on white,
 * `--text-color: var(--black-pure)`. The only "brand colour" beyond the
 * black/white core is a family of WARM BEIGES used for hover surfaces and
 * filled inputs (the measured `a:hover{background-color:#f1e4db}` and the warm
 * `--form-input-background`). Square corners (`border-radius: 0`), UPPERCASE
 * wide-tracked nav/CTA labels (measured `letter-spacing: .2em`,
 * `text-transform: uppercase`), and a slow elegant easing
 * `cubic-bezier(.42,0,.36,1.01)` are the signature anatomy. The categorical
 * data palette is Kering's own Environmental P&L ("pollution") scale.
 *
 * Kering colour reference (measured, light theme):
 *   White (background default)        #ffffff   (--white-pure)
 *   Cool light grey (alt surface)     #f2f2f2   (--gray-100)
 *   Warm beige (subtle surface/input) #f8f2ed   (--beige-100 ≈ resolved --form-input-background)
 *   Warm beige hover                  #f1e4db   (--beige-200, measured a:hover background)
 *   Subtle border grey                #e6e6e6   (--gray-400)
 *   Muted text grey                   #7c7c7c   (--gray-500)
 *   Strong grey (radio border)        #575757   (--gray-850)
 *   Near-black                        #323232   (--gray-1100)
 *   Pure black (primary ink/action)   #000000   (--black-pure / --text-color)
 *   EP&L water-pollution blue         #2c578c   (--blue-100 / --pollution-water-pollution)
 *   EP&L waste red                    #c25046   (--red-100 / --pollution-waste)
 *   EP&L land-use green               #7eb57c   (--green-100 / --pollution-land-use)
 *   EP&L CO2 purple                   #944c7c   (--purple-100 / --pollution-co2)
 *   EP&L air amber                    #fcc55e   (--yellow-100 / --pollution-air)
 *   EP&L water-consumption cyan       #7cbeca   (--cyan-100 / --pollution-water-consumption)
 *   Strong red (error)                #af0505   (--red-400)
 */

// --- Kering raw colour palette (measured on kering.com compiled CSS) --------
const keringColor = {
  // Pure black ink — the Kering primary / brand / action family.
  ink: {
    black: "#000000", // --black-pure / --text-color — primary ink, brand, action
    near: "#323232" // --gray-1100 — lifted near-black (button :hover)
  },
  // Cool grey scale (--gray-* utilities).
  grey: {
    0: "#ffffff", // --white-pure
    100: "#f2f2f2", // --gray-100 — cool light alt surface
    400: "#e6e6e6", // --gray-400 — subtle border (also the measured 2px focus outline colour)
    450: "#cacaca", // --gray-450 — --form-dropdown-border
    500: "#7c7c7c", // --gray-500 — muted text
    850: "#575757" // --gray-850 — --radio-input-border / strong grey / secondary text
  },
  // Warm beige neutrals — the signature Kering hover surfaces & filled inputs.
  warm: {
    100: "#f8f2ed", // --beige-100 — warm subtle surface (≈ resolved --form-input-background hsla(25,44%,90%,.5) over white)
    200: "#f1e4db", // --beige-200 — measured a:hover background (secondary surface)
    300: "#ebd5c8", // --beige-300 — deeper beige (secondary hover)
    500: "#d3b6a0", // --beige-500 — warm taupe accent
    700: "#b38b6c" // --beige-1700 — darker warm taupe
  },
  // Kering Environmental P&L ("pollution") categorical scale — the brand's own
  // data-vis palette, measured from the `--pollution-*` → `--*-100` map.
  epl: {
    waterPollution: "#2c578c", // --blue-100 / --pollution-water-pollution
    waste: "#c25046", // --red-100 / --pollution-waste
    landUse: "#7eb57c", // --green-100 / --pollution-land-use
    co2: "#944c7c", // --purple-100 / --pollution-co2
    air: "#fcc55e", // --yellow-100 / --pollution-air
    waterConsumption: "#7cbeca" // --cyan-100 / --pollution-water-consumption
  },
  // System / status colours. Kering's identity is monochrome — feedback hues are
  // taken from the strongest measured red/blue, with green/amber darkened from
  // the EP&L scale to keep WCAG AA on white (see MAPPING.md "à confirmer").
  system: {
    error: "#af0505", // --red-400 (strongest measured red; AA on white)
    info: "#2c578c", // --blue-100 (EP&L water-pollution blue; AA on white)
    success: "#2e7a37", // EP&L land-use green #7eb57c darkened for WCAG AA (à confirmer)
    warning: "#9a6a00" // EP&L air amber #fcc55e darkened for WCAG AA (à confirmer)
  }
} as const;

// --- foundation (Kering-specific values) -----------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the Kering black ink (the brand
    // primary is pure black, not a blue).
    blue: {
      10: keringColor.grey[100], // #f2f2f2 lightest cool tint
      60: keringColor.ink.black, // #000000 primary ink
      80: keringColor.ink.near // #323232 near-black interactive / hover
    },
    // Kering has no cyan brand colour; its only accent beyond the monochrome
    // core is the warm beige / taupe, so the Sentropic "cyan" accent slot is
    // mapped to the Kering warm family (mirrors the LVMH gold mapping).
    cyan: {
      10: keringColor.warm[100], // #f8f2ed lightest warm
      50: keringColor.warm[500], // #d3b6a0 warm taupe accent
      70: keringColor.warm[700] // #b38b6c darker warm taupe
    },
    // Sentropic "slate" role family mapped onto the Kering cool grey scale, with
    // pure black as the darkest ink.
    slate: {
      0: keringColor.grey[0], // #ffffff white
      10: keringColor.grey[100], // #f2f2f2 cool light surface
      20: keringColor.grey[400], // #e6e6e6 subtle borders / contrast bg
      60: keringColor.grey[500], // #7c7c7c muted text
      80: keringColor.grey[850], // #575757 strong / secondary text
      90: keringColor.ink.black // #000000 darkest / primary ink
    },
    feedback: {
      success: keringColor.system.success,
      warning: keringColor.system.warning,
      error: keringColor.system.error,
      info: keringColor.system.info
    }
  },
  // Kering's corporate typeface is the proprietary-licensed Akzidenz-Grotesk
  // Std Ext, exposed on kering.com as `--title-font-family:
  // "Akzidenz-Grotesk Std Ext"` (display) and `--regular-font-family:
  // "Akzidenz-Grotesk Std Ext Regular"` (body). We reference the font *names*
  // only, never the binaries; the fallback is the classic grotesque stack
  // (Helvetica Neue / Arial). Kering ships no monospace — the Sentropic mono
  // stack is kept. (The `Sawarabi Gothic !important` rule on kering.com is a
  // Japanese-locale override, not the brand face.)
  font: {
    sans: "'Akzidenz-Grotesk Std Ext Regular', 'Akzidenz-Grotesk Std', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    display: "'Akzidenz-Grotesk Std Ext', 'Akzidenz-Grotesk Std', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; kering.com uses a comparable 4/8px rhythm).
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
  // Kering aesthetic is SQUARED. The compiled CSS resolves core controls to
  // `border-radius: 0` (the dominant declaration); only circular media and a few
  // decorative shapes use large radii. Controls and cards carry NO radius
  // (luxury minimalism); only pills use the full radius.
  radius: {
    none: "0",
    sm: "0", // controls square
    md: "0", // button / input / tabs — square
    lg: "0", // cards — square
    pill: "999px" // tags / pills
  },
  // Kering uses very light, neutral elevation. Exact specs derived
  // ("à confirmer") — the editorial site relies on flat surfaces + thin rules.
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.08)",
    medium: "0 4px 12px rgb(0 0 0 / 0.12)",
    floating: "0 10px 30px rgb(0 0 0 / 0.16)"
  },
  // Kering motion: measured transition durations are dominated by `.3s`/`.4s`/
  // `.5s`, and the brand's signature easing is `cubic-bezier(.42,0,.36,1.01)`
  // (the most frequent timing function). `a` (nav/CTA) transitions at `.4s`.
  motion: {
    fast: "300ms", // measured (.3s — dominant transition duration)
    normal: "400ms", // measured (a / nav transition duration .4s)
    slow: "500ms", // measured (.5s)
    easing: "cubic-bezier(0.42, 0, 0.36, 1.01)" // measured (signature timing function)
  },
  // z-index roles are not Kering-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Kering) -----------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Kering control density: generous, editorial. Heights/paddings are derived to
  // express the brand's airy luxury rhythm (à confirmer — the corporate home
  // exposes few bordered controls to measure directly).
  density: {
    sm: { controlHeight: "2.5rem", paddingBlock: "0", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "0.75rem" },
    md: { controlHeight: "3rem", paddingBlock: "0.75rem", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3rem", fontSize: "0.8125rem" },
    lg: { controlHeight: "3.5rem", paddingBlock: "0", paddingInline: "2.25rem", gap: "0.5rem", minWidth: "3.5rem", fontSize: "0.875rem" }
  },
  // Kering typography. Nav links / CTAs are the brand signature: measured `a`
  // rules = medium weight, `text-transform: uppercase`, and a very wide
  // `letter-spacing: .2em`. Fields use the regular face at body size; labels are
  // small uppercase with the same wide tracking.
  typography: {
    control: { family: "'Akzidenz-Grotesk Std Ext', system-ui, sans-serif", size: "0.8125rem", weight: "500", lineHeight: "1", letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Akzidenz-Grotesk Std Ext Regular', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Akzidenz-Grotesk Std Ext', system-ui, sans-serif", size: "0.75rem", weight: "500", lineHeight: "1.25", letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Kering links: black, NO underline (measured `a{text-decoration:none}`); the
    // hover convention is an opacity drop / warm-beige background, not an
    // underline. We keep the link role undecorated to match the brand.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "none", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // Kering dims via opacity (measured a:hover opacity .5) — disabled à confirmer
  // Transition uses the measured Kering easing + the nav 400ms duration.
  transition: { property: "background-color, border-color, color, outline-color, opacity", duration: "400ms", easing: "cubic-bezier(0.42, 0, 0.36, 1.01)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.5rem" },
  // Kering FOCUS = a thin 2px solid OUTLINE. The measured raw rule is
  // `outline: 2px solid var(--gray-400)` with `outline-offset: -2px`; that light
  // grey is invisible on white, so we darken the ring to the brand black ink for
  // WCAG AA visibility (technique = 2px solid outline; colour à confirmer).
  focus: {
    strategy: "outline",
    width: "2px", // measured (`outline: 2px solid`)
    offset: "2px", // standard outside ring (measured raw was -2px inset)
    color: keringColor.ink.black, // #000000 brand ink (raw was --gray-400, darkened for AA)
    inset: "0"
  },
  // Kering form fields: a WARM-FILLED square box. Measured
  // `--form-input-background: hsla(25,44%,90%,.5)` (≈ warm beige #f8f2ed over
  // white) with `--form-input-border: 1px solid transparent`, and dropdowns use
  // `--form-dropdown-border: 1px solid var(--gray-450)`. Modelled as
  // `filled-underline`: a warm fill with a single grey bottom rule, square
  // corners (radius 0). Native <select> chevron redrawn in the brand black.
  field: {
    style: "filled-underline",
    fillBg: keringColor.warm[100], // #f8f2ed warm beige fill
    underlineColor: keringColor.grey[450], // #cacaca measured --form-dropdown-border
    underlineWidth: "1px",
    radiusTop: "0", // squared corners (measured border-radius: 0)
    underlineMode: "border", // a real bottom rule (dropdown uses a 1px border)
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23000000' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Kering cards: a thin 1px hairline border, square corners, warm-beige hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: keringColor.warm[100] // #f8f2ed
  },
  // Kering secondary button = OUTLINED (transparent fill, black border + ink,
  // warm-beige fill on hover — measured a:hover background #f1e4db).
  buttonSecondary: {
    background: "transparent",
    border: keringColor.ink.black, // #000000 stroke
    hoverBackground: keringColor.warm[200] // #f1e4db measured warm hover
  },
  // Kering tabs / nav: active tab = black uppercase label with a bottom black
  // underline.
  tabs: {
    activeText: keringColor.ink.black, // #000000
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "500",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom", // black underline on the bottom edge
    indicatorMode: "border" // a real bottom border
  },
  // Kering pagination: borderless black text links; active page = filled black.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: keringColor.ink.black, // #000000 link text
    activeBackground: keringColor.ink.black, // #000000 filled active page
    activeText: keringColor.grey[0], // #ffffff white on black
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.5rem" // 24px
  },
  // Kering breadcrumb: grey links, black current page, grey separators.
  breadcrumb: {
    linkText: keringColor.grey[850], // #575757
    text: keringColor.grey[850], // #575757 trail text
    currentText: keringColor.ink.black, // #000000 current page
    separator: keringColor.grey[500], // #7c7c7c
    fontSize: "0.75rem", // 12px
    lineHeight: "1.25rem", // 20px
    currentWeight: "500"
  },
  // Kering notice / alert: a coloured LEFT accent filet on a transparent box.
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0.1875rem", // 3px ::before accent bar (thin luxury filet)
    paddingTop: "1rem", // 16px
    paddingRight: "1rem", // 16px
    paddingBottom: "1rem", // 16px
    paddingLeft: "1.25rem", // 20px (clears the left filet)
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem" // 24px
  },
  // Kering details: a black bold summary trigger.
  accordion: {
    text: keringColor.ink.black, // #000000 summary label
    paddingBlock: "1rem", // 16px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    fontWeight: "500",
    lineHeight: "1.5rem" // 24px
  },
  // Kering tag: a small SQUARED warm chip (radius 0, luxury minimalism).
  tag: {
    radius: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    fontSize: "0.75rem", // 12px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: keringColor.warm[100], // #f8f2ed warm beige
    neutralText: keringColor.ink.black // #000000
  },
  // Kering badge: a SQUARED filled badge, uppercase label.
  badge: {
    radius: "0",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.6875rem", // 11px
    fontWeight: "500",
    lineHeight: "1.25rem", // 20px
    textTransform: "uppercase",
    minHeight: "1.25rem", // 20px
    infoBackground: keringColor.ink.black, // #000000
    infoText: keringColor.grey[0] // #ffffff
  },
  // Kering checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: keringColor.ink.black // #000000
  },
  // Kering search input.
  search: {
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Kering toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: keringColor.ink.black // #000000
  }
} as const;

// --- semantic (Kering-specific role mapping) -------------------------------
const semantic = {
  surface: {
    default: keringColor.grey[0], // #ffffff white
    subtle: keringColor.warm[100], // #f8f2ed warm beige (signature warm alt surface)
    raised: keringColor.grey[0], // #ffffff white
    inverse: keringColor.ink.black, // #000000 black inverse surface (footer/dark sections)
    overlay: "rgb(10 10 10 / 0.8)" // modal backdrop (measured --video-popup-background hsla(0,0%,4%,.8))
  },
  text: {
    primary: keringColor.ink.black, // #000000 (--text-color: var(--black-pure))
    secondary: keringColor.grey[850], // #575757 (--gray-850)
    muted: keringColor.grey[500], // #7c7c7c (--gray-500)
    inverse: keringColor.grey[0], // #ffffff white on dark / coloured surfaces
    link: keringColor.ink.black // #000000 black links (a{color:inherit})
  },
  border: {
    subtle: keringColor.grey[400], // #e6e6e6 (--gray-400)
    strong: keringColor.grey[850], // #575757 (--gray-850, radio border)
    interactive: keringColor.ink.black // #000000 black interactive
  },
  action: {
    primary: keringColor.ink.black, // #000000 black primary button
    primaryHover: keringColor.ink.near, // #323232 lifted near-black hover
    primaryText: keringColor.grey[0], // #ffffff white on black
    secondary: keringColor.warm[200], // #f1e4db warm secondary surface (measured hover beige)
    secondaryHover: keringColor.warm[300], // #ebd5c8 deeper beige hover
    secondaryText: keringColor.ink.black, // #000000 black text
    danger: keringColor.system.error // #af0505
  },
  feedback: {
    success: keringColor.system.success, // #2e7a37 darkened EP&L green
    warning: keringColor.system.warning, // #9a6a00 darkened EP&L amber
    error: keringColor.system.error, // #af0505
    info: keringColor.system.info // #2c578c EP&L blue
  },
  status: {
    pending: keringColor.system.warning, // amber
    processing: keringColor.system.info, // blue
    completed: keringColor.system.success, // green
    failed: keringColor.system.error // red
  },
  // Categorical data-vis palette = Kering's own Environmental P&L ("pollution")
  // scale (measured `--pollution-*` → `--*-100`), bookended by the brand black
  // and a warm taupe. See MAPPING.md.
  data: {
    category1: keringColor.ink.black, // #000000 brand black
    category2: keringColor.epl.waterPollution, // #2c578c blue
    category3: keringColor.epl.waste, // #c25046 red
    category4: keringColor.epl.landUse, // #7eb57c green
    category5: keringColor.epl.co2, // #944c7c purple
    category6: keringColor.epl.air, // #fcc55e amber
    category7: keringColor.epl.waterConsumption, // #7cbeca cyan
    category8: keringColor.warm[500] // #d3b6a0 warm taupe
  }
} as const;

/**
 * The Kering theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Kering-specific measured values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so Kering's monochrome brand reaches the components
 * (buttons, tabs, pagination, chat bubbles…), not just the elements that read
 * semantic vars directly.
 */
export const keringTheme: TenantTheme = {
  id: "kering",
  label: "Kering",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default keringTheme;
