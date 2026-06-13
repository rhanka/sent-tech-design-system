import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * CIRQUE DU SOLEIL (cirquedusoleil.com — the Montréal-HQ live-entertainment
 * company) theme for the Sentropic token structure.
 *
 * Cirque du Soleil ships an in-page design system whose CSS custom properties
 * are prefixed `--color-*`, `--radius-*`, `--spacing-*`, `--text-*` and the
 * font aliases `--primary-font` / `--secondary-font`. Every value below is
 * MEASURED from the live site's stylesheet (https://www.cirquedusoleil.com/ →
 * /dist/v3/cds/ver20260414/css/app.cds.css, fetched directly). We reference the
 * font *name* only ("Cds Sans", the brand's proprietary sans — measured
 * `--primary-font: "Cds Sans"`), never font binaries. Sources and the full
 * mapping table are in MAPPING.md.
 *
 * Cirque du Soleil's identity is THEATRICAL and BOLD: the site renders on a
 * DARK / near-black stage (`#site--dark` => `background-color: #000`; cards and
 * panels lift to "night sky" #191a1a), every primary CTA glows in the brand's
 * "GOLDEN HOUR" gold (#dca85d — the sun of the Cirque logo), CTAs invert on
 * hover to a brighter "yellow sunrise" (#f8d248), body copy is light gold/white
 * on black, titles are heavy (700). This is therefore a DARK-FIRST theme:
 * `mode: "dark"`, dark surfaces, light text, gold action. Corners are softly
 * rounded (CTAs are near-pill at 30px; the radius ramp is 4/8/16/24px). Form
 * fields are FILLED on a dark ground with a thin bottom underline (the search /
 * city-selector inputs render `background: #191a1a` + `border-bottom: 1px solid
 * #1b1b1b`, gold-light text). Focus is an accessible BLUE outline (#0163da) —
 * deliberately a different hue from the gold brand so the indicator never blends
 * into a gold control. Where Sentropic needs a role Cirque does not publish, the
 * closest measured `--color-*` token is used and the choice is noted
 * "à confirmer" in MAPPING.md.
 *
 * Cirque du Soleil colour reference (measured `--color-*`, dark theme):
 *   Black (page / stage)               #000000   --color-black / #site--dark background
 *   Night sky (raised dark surface)    #191a1a   --color-night-sky (rgb 25,26,26) — cards/panels
 *   Grey-8 (darkest panel)             #1b1b1b   --color-grey-8 — accordion / field underline
 *   Golden hour (THE gold accent)      #dca85d   --color-golden-hour / --color-gold / --highlight-color
 *   Yellow sunrise (CTA hover / link)  #f8d248   --color-yellow / --color-yellow-sunrise
 *   Golden light (light gold ink)      #f2e7bb   --color-golden-light / --color-light-gold
 *   Purple (secondary brand accent)    #6349e9   --color-purple
 *   White (text on dark)               #ffffff   --color-white
 *   Grey-1 … Grey-7                    #e9e9e9 … #282828  --color-grey-1..7 (neutral ramp)
 *   Destructive (danger)               #ec091a   --color-destructive
 *   Red                                #c50714   --color-red
 *   Success                            #2d816a   --color-success (deep teal-green)
 *   Focus blue                         #0163da   --color-btn-focus (outline)
 */

// --- CIRQUE DU SOLEIL raw colour palette (measured `--color-*` tokens) -------
const cirqueColor = {
  // The brand IS the "golden hour" sun gold — every primary CTA, brand title and
  // accent. On hover the gold brightens to "yellow sunrise". Golden light is the
  // soft ink used for body copy and descriptions on the dark stage.
  gold: {
    golden: "#dca85d", // --color-golden-hour / --color-gold / --highlight-color — THE Cirque gold
    yellow: "#f8d248", // --color-yellow / --color-yellow-sunrise — CTA hover + link hover
    light: "#f2e7bb" // --color-golden-light / --color-light-gold — light-gold body ink
  },
  // Cirque's secondary brand accent (banners, badges, glow shadows).
  purple: "#6349e9", // --color-purple
  // The dark stage. Pure black is the page; "night sky" lifts panels/cards.
  black: "#000000", // --color-black — page / stage background (#site--dark)
  nightSky: "#191a1a", // --color-night-sky — raised dark surface (cards, panels, inputs)
  white: "#ffffff", // --color-white — text on dark
  // Neutral grey ramp (measured `--color-grey-1..8`, light→dark).
  grey: {
    1: "#e9e9e9", // --color-grey-1 — lightest neutral
    2: "#cbcbcb", // --color-grey-2
    3: "#989898", // --color-grey-3 — mid grey (disabled/ghost text)
    4: "#767676", // --color-grey-4 — secondary text / borders on light
    5: "#5c5c5c", // --color-grey-5
    6: "#454545", // --color-grey-6 — subtle border on dark
    7: "#282828", // --color-grey-7 — divider on dark
    8: "#1b1b1b" // --color-grey-8 — darkest panel / field underline
  },
  // System / status colours (measured `--color-*` semantic tokens).
  system: {
    error: "#ec091a", // --color-destructive — danger
    red: "#c50714", // --color-red
    success: "#2d816a", // --color-success — deep teal-green (AA on black)
    // Cirque exposes only --color-warning-dark / --color-warning-light aliases
    // (no measured hex). This AA-grade amber is a sensible default — à confirmer.
    warning: "#d8a200", // à confirmer — no measured Cirque hex
    info: "#0163da" // --color-btn-focus blue, reused as the info hue
  },
  // Accessible focus blue — deliberately NOT the gold/yellow brand, so the focus
  // ring stays visible on gold controls.
  focus: "#0163da" // --color-btn-focus
} as const;

// --- foundation (CIRQUE DU SOLEIL-specific values) --------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (action / primary / link). Cirque's PRIMARY
    // ACTION is the gold sun, so the action steps map to the gold scale; the
    // lightest step is the light-gold ink. (à confirmer: Cirque action is gold,
    // not blue.)
    blue: {
      10: cirqueColor.gold.light, // #f2e7bb light-gold tint
      60: cirqueColor.gold.golden, // #dca85d THE Cirque gold (primary action)
      80: cirqueColor.gold.yellow // #f8d248 brighter yellow (hover ground)
    },
    // Sentropic "cyan" accent slot. Cirque's distinct secondary accent is the
    // purple; mapped here as the cool accent family. (à confirmer.)
    cyan: {
      10: cirqueColor.gold.light, // #f2e7bb light tint
      50: cirqueColor.purple, // #6349e9 Cirque purple accent
      70: cirqueColor.gold.golden // #dca85d gold as the warm accent
    },
    // Sentropic "slate" neutral family mapped onto the Cirque dark stage + grey
    // ramp (dark-first: 0 is the lightest text, 90 is the black stage).
    slate: {
      0: cirqueColor.white, // #ffffff white (lightest)
      10: cirqueColor.gold.light, // #f2e7bb light-gold body ink
      20: cirqueColor.grey[6], // #454545 subtle border on dark
      60: cirqueColor.grey[3], // #989898 secondary/muted text
      80: cirqueColor.nightSky, // #191a1a night-sky raised surface
      90: cirqueColor.black // #000000 the black stage (darkest)
    },
    feedback: {
      success: cirqueColor.system.success,
      warning: cirqueColor.system.warning,
      error: cirqueColor.system.error,
      info: cirqueColor.system.info
    }
  },
  // Cirque serves its proprietary "Cds Sans" across the whole site (measured
  // `--primary-font: "Cds Sans"`; body, headings, controls and fields all
  // resolve to it). We reference the NAME only, with a sans-serif fallback.
  // Titles/CTAs are bold (700); some display titles go to 900. Mono is not part
  // of Cirque — the Sentropic mono stack is kept.
  font: {
    sans: "'Cds Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    display: "'Cds Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Cirque spacing scale (measured `--spacing-*`): 2 / 4 / 8 / 16 / 24 / 32 / 40
  // / 48 / 56 / 64 / 72 / 80px. Aligned here to the Sentropic step keys.
  spacing: {
    0: "0",
    1: "0.25rem", // 4px  (--spacing-05)
    2: "0.5rem", // 8px  (--spacing-1)
    3: "0.75rem", // 12px (--spacing-105)
    4: "1rem", // 16px (--spacing-2)
    6: "1.5rem", // 24px (--spacing-3)
    8: "2rem", // 32px (--spacing-4)
    12: "3rem", // 48px (--spacing-6)
    16: "4rem" // 64px (--spacing-8)
  },
  // Cirque rounds SOFTLY — measured `--radius-*` ramp is 4 / 8 / 16 / 24 / 120px
  // (pill). CTAs render an explicit `border-radius: 30px` (near-pill); the icon
  // radius is 4px and the generic box-corner is 15px. Mapped to the Sentropic
  // slots; controls land on the base 16px, cards step up to 24px.
  radius: {
    none: "0", // square
    sm: "4px", // --radius-xs — icons / small chips
    md: "16px", // --radius-base — controls / inputs / tabs
    lg: "24px", // --radius-lg — cards / larger surfaces
    pill: "120px" // --radius-pill — pills / CTAs (the 30px CTA reads as a pill)
  },
  // Cirque elevation is theatrical — soft dark shadows, and a signature PURPLE
  // glow on sticky/active surfaces (measured `0 0 50px #6349e9`). Mapped to the
  // three Sentropic slots; the floating slot carries the purple stage-glow.
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.40)",
    medium: "0 4px 12px rgb(0 0 0 / 0.48)",
    floating: "0 8px 24px rgb(0 0 0 / 0.56), 0 0 50px rgb(99 73 233 / 0.40)" // purple stage-glow
  },
  // Cirque transitions are short and standard (measured `transition: all .2s/.3s
  // ease`). Exact durations are not separately tokenised; kept aligned with base.
  motion: {
    fast: "120ms",
    normal: "200ms", // measured CTA/icon transition (.2s ease)
    slow: "300ms", // measured input/select transition (.3s ease)
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Cirque-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (CIRQUE DU SOLEIL) -------------------------------
  // Cirque field underlines measured at 1px solid #1b1b1b; emphasis strokes 2px.
  borderWidth: {
    none: "0",
    thin: "1px", // field underline / dividers
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Cirque control density. Measured CTA = 40px tall with 16px horizontal padding
  // and a bold label; the brand CTAs are near-pill. md targets a comfortable
  // ~44px control; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.625rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0.75rem", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1.125rem" }
  },
  // Cirque typography = "Cds Sans". CTA labels are BOLD (measured CTA font-weight
  // 700), body/field text is regular (400). Base type is 16px; the brand uses big
  // display titles (32–88px). Headings/CTAs are heavy.
  typography: {
    control: { family: "'Cds Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif", size: "1rem", weight: "700", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Cds Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Cds Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif", size: "0.875rem", weight: "700", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Cirque links are gold/light at rest and brighten to yellow-sunrise on hover
    // (measured `--link:hover { color: #f8d248 }`); not underlined at rest.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // measured `--highlighted:disabled { opacity: .5 }`
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "200ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // CIRQUE FOCUS = an accessible BLUE OUTLINE (`--color-btn-focus #0163da`).
  // Measured `outline: 2px solid #0163da; outline-offset: 4px` on buttons/links/
  // selects. The focus hue is deliberately blue (not the gold brand) so the
  // indicator never blends into a gold control.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "4px",
    color: cirqueColor.focus, // #0163da — accessible blue focus indicator
    inset: "0"
  },
  // CIRQUE form fields are FILLED on a dark ground with a thin bottom UNDERLINE
  // (measured search/city inputs: `background: #191a1a` + `border-bottom: 1px
  // solid #1b1b1b`, gold-light text, golden-hour placeholder). `style:
  // "filled-underline"` makes the builder render a dark fill with a bottom filet
  // rather than four equal borders. The native <select> chevron is redrawn in the
  // gold ink with a 36px right gutter.
  field: {
    style: "filled-underline",
    underlineMode: "border", // a real 1px bottom border (#1b1b1b), not a box-shadow filet
    fillBg: cirqueColor.nightSky, // #191a1a night-sky dark fill
    underlineColor: cirqueColor.grey[8], // #1b1b1b measured border-bottom colour
    underlineWidth: "1px",
    radiusTop: "4px", // soft top corners on the filled field
    radiusBottom: "0", // underline edge stays flush
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23dca85d' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.25rem"
  },
  // Cirque cards: night-sky dark surface, softly rounded (24px), a faint grey-7
  // border and a subtle lift on hover (the measured card background is #191a1a
  // with a faint gold-tint wash on hover).
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: cirqueColor.grey[7] // #282828 faint lift on the dark card
  },
  // Cirque secondary button = OUTLINED ("ghost-light"): transparent fill, light
  // border + text, turning gold/yellow on hover (measured `.ghost-light:hover {
  // border-color: #f8d248; color: #f8d248 }`).
  buttonSecondary: {
    background: "transparent",
    border: cirqueColor.gold.golden, // #dca85d gold stroke
    hoverBackground: "transparent" // ghost — fill stays transparent, border/text turn yellow
  },
  // Cirque tabs / sub-nav: active tab = gold bold label with a gold bottom
  // indicator, transparent fill on the dark stage.
  tabs: {
    activeText: cirqueColor.gold.golden, // #dca85d active label (the brand gold)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px (Cirque base type)
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // gold underline on the bottom edge
    indicatorMode: "border" // a real bottom border indicator
  },
  // Cirque pagination: borderless light link text on the dark stage; active page
  // = filled gold pill (the brand fill) with black text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: cirqueColor.white, // #ffffff link text on dark
    activeBackground: cirqueColor.gold.golden, // #dca85d filled active page (brand gold)
    activeText: cirqueColor.black, // black on gold
    activeBorderWidth: "0",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Cirque breadcrumb: gold links, light-gold trail, white current page, grey
  // separators — on the dark stage.
  breadcrumb: {
    linkText: cirqueColor.gold.golden, // #dca85d
    text: cirqueColor.gold.light, // #f2e7bb trail text
    currentText: cirqueColor.white, // #ffffff current page
    separator: cirqueColor.grey[3], // #989898
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "700" // current page is emphasised
  },
  // Cirque notice / alert: a tinted dark box with a coloured left filet matching
  // the severity (success/destructive/purple/warning surfaces over the stage).
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0", // left border collapses (filet instead)
    filetWidth: "0.25rem", // 4px ::before accent bar
    paddingTop: "1rem", // 16px
    paddingRight: "1rem", // 16px
    paddingBottom: "1rem", // 16px
    paddingLeft: "1.25rem", // 20px (clears the left filet)
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Cirque accordion / disclosure ("practical infos"): a bold light summary
  // trigger on a night-sky row, softly rounded.
  accordion: {
    text: cirqueColor.white, // #ffffff summary label on dark
    paddingBlock: "1rem", // 16px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "700", // Cirque summary triggers are bold
    lineHeight: "1.5rem" // 24px
  },
  // Cirque tag: a small PILL chip — the measured card tag uses a bright purple
  // fill (#ce79f1) with dark text; here the neutral chip is the purple brand.
  tag: {
    radius: "120px", // Cirque tags/pills round fully
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "700",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: cirqueColor.grey[7], // #282828 dark chip fill
    neutralText: cirqueColor.gold.light // #f2e7bb light-gold text
  },
  // Cirque badge: a small filled pill — brand gold fill / black text.
  badge: {
    radius: "120px", // pill
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "700",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: cirqueColor.gold.golden, // #dca85d brand gold
    infoText: cirqueColor.black // black on gold
  },
  // Cirque checkbox/radio label: regular light type at base size on the dark stage.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: cirqueColor.gold.light // #f2e7bb light-gold label on dark
  },
  // Cirque search input: a dark-filled, bottom-underlined field, base type.
  search: {
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Cirque toggle / switch label: regular light type; the checked track is the
  // brand gold (measured animation-killswitch toggle handle is gold-light).
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.5rem", // 24px
    textColor: cirqueColor.gold.light // #f2e7bb
  }
} as const;

// --- semantic (CIRQUE DU SOLEIL-specific role mapping, DARK-first) ----------
const semantic = {
  surface: {
    default: cirqueColor.black, // #000000 the black stage (#site--dark background)
    subtle: cirqueColor.nightSky, // #191a1a night-sky subtle panel
    raised: cirqueColor.nightSky, // #191a1a raised cards/panels
    inverse: cirqueColor.white, // #ffffff inverse (light) surface
    overlay: "rgb(0 0 0 / 0.64)" // modal backdrop over the dark stage
  },
  text: {
    primary: cirqueColor.gold.light, // #f2e7bb light-gold body ink on the dark stage
    secondary: cirqueColor.grey[2], // #cbcbcb secondary text on dark
    muted: cirqueColor.grey[3], // #989898 muted text
    inverse: cirqueColor.black, // #000000 text on light/gold surfaces
    link: cirqueColor.gold.golden // #dca85d gold links (brighten to yellow on hover)
  },
  border: {
    subtle: cirqueColor.grey[7], // #282828 subtle divider on dark
    strong: cirqueColor.grey[5], // #5c5c5c stronger border on dark
    interactive: cirqueColor.gold.golden // #dca85d gold interactive accent
  },
  action: {
    primary: cirqueColor.gold.golden, // #dca85d THE Cirque gold CTA
    primaryHover: cirqueColor.gold.yellow, // #f8d248 brighter yellow-sunrise on hover (measured)
    primaryText: cirqueColor.black, // black text on gold (measured CTA text colour)
    secondary: cirqueColor.nightSky, // #191a1a night-sky secondary surface
    secondaryHover: cirqueColor.grey[7], // #282828
    secondaryText: cirqueColor.gold.golden, // #dca85d gold secondary label
    danger: cirqueColor.system.error // #ec091a (--color-destructive)
  },
  feedback: {
    success: cirqueColor.system.success, // #2d816a
    warning: cirqueColor.system.warning, // #d8a200 (à confirmer)
    error: cirqueColor.system.error, // #ec091a
    info: cirqueColor.system.info // #0163da
  },
  status: {
    pending: cirqueColor.system.warning, // #d8a200
    processing: cirqueColor.system.info, // #0163da
    completed: cirqueColor.system.success, // #2d816a
    failed: cirqueColor.system.error // #ec091a
  },
  // Categorical data-vis palette. Cirque publishes no data-vis scale; this is a
  // coherent proposal led by the brand gold, plus the purple accent and the
  // measured system hues, drawn to honour the theatrical gold-on-black identity
  // (see MAPPING.md, "à confirmer" — not an official categorical token list).
  data: {
    category1: cirqueColor.gold.golden, // #dca85d brand gold
    category2: cirqueColor.purple, // #6349e9 purple accent
    category3: cirqueColor.gold.yellow, // #f8d248 yellow sunrise
    category4: cirqueColor.system.success, // #2d816a success teal
    category5: cirqueColor.gold.light, // #f2e7bb light gold
    category6: cirqueColor.system.info, // #0163da focus blue
    category7: cirqueColor.system.error, // #ec091a destructive red
    category8: cirqueColor.grey[3] // #989898 neutral grey
  }
} as const;

/**
 * The CIRQUE DU SOLEIL theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Cirque-specific (gold-on-black,
 * dark-first, theatrical) values, and the `component` layer is REBUILT from this
 * theme's own semantic/foundation via `createComponent` — so Cirque's glowing
 * gold CTA, light-gold ink, dark filled-underline fields and accessible blue
 * focus reach the components (buttons, tabs, pagination, chat bubbles…), not just
 * the elements that read semantic vars directly. `mode: "dark"` because the
 * brand site renders on a near-black stage.
 */
export const cirqueDuSoleilTheme: TenantTheme = {
  id: "cirque-du-soleil",
  label: "Cirque du Soleil",
  mode: "dark",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default cirqueDuSoleilTheme;
