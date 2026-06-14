import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * UBISOFT (ubisoft.com — the global game publisher, whose largest studio is
 * Ubisoft Montréal) theme for the Sentropic token structure.
 *
 * Ubisoft ships a real, in-page design system — "UDS" (Ubisoft Design System) —
 * whose CSS custom properties are prefixed `--color-semantic-*`, `--color-brand-*`,
 * `--color-surface-*`, `--color-text-*`, `--color-neutral-*`, `--radius-*`,
 * `--border-*` and `--size-*`. Every value below is MEASURED from the live site's
 * stylesheets (https://www.ubisoft.com/en-us → the Next.js `_next/static/css/*`
 * bundles, fetched directly). We reference the font *names* only ("Ubisoft Sans",
 * the brand's proprietary face — measured `font-family: Ubisoft Sans,Roboto,
 * sans-serif`; and "Open Sans", the body webfont — measured `font-family: Open
 * Sans,Open Sans Alt,sans-serif`), never font binaries. Sources and the full
 * mapping table are in MAPPING.md.
 *
 * Ubisoft's UDS default theme is DARK-FIRST and STARK: the page sits on a near-
 * pure-black stage (`--color-surface-0: #0d0d0d`); text is WHITE applied at
 * decreasing opacities over that black (heading .975, body .825, caption .6);
 * neutral surfaces and borders are white-with-alpha (`--color-neutral-main-1..5`,
 * .075→.375); and the single interactive accent is the unmistakable UBISOFT BLUE
 * (`--color-semantic-interactive-main / --color-brand-primary-main: #006ef5`),
 * with a lighter variant `#3da2ff` used for hovers, field borders and the focus
 * ring. This is therefore a DARK theme: `mode: "dark"`, dark surfaces, white text,
 * blue action. Corners are SUBTLE (the radius ramp is 4/8/16/24/…px; controls and
 * fields land on `--radius-2: 8px`; pills use `--radius-full`). Form fields are
 * BOXED (outline) — a `border-radius: 8px` field box on the dark stage whose
 * border turns to the blue variant when active (`border: 2px solid #3da2ff`).
 * Focus is a BLUE OUTLINE (`outline: 2px solid #3da2ff` — the brand-primary
 * variant). The semantic alpha-over-black greys are pre-blended to flat hex here
 * (the token tree is hex-based); the source `hsla(0,0%,100%,α)` is documented in
 * MAPPING.md. Where Sentropic needs a role UDS does not publish, the closest
 * measured `--color-*` token is used and the choice is noted "à confirmer".
 *
 * Ubisoft (UDS) colour reference (measured tokens, dark theme):
 *   Surface-0 (the black stage)        #0d0d0d   --color-surface-0 / --color-overlay-rgb 13,13,13
 *   Ubisoft blue (THE accent)          #006ef5   --color-brand-primary-main / --color-semantic-interactive-main
 *   Ubisoft blue variant (hover/focus) #3da2ff   --color-brand-primary-variant / --color-semantic-interactive-variant
 *   Link hover                         #5ab0ff   --color-link-hover
 *   Link active                        #77beff   --color-link-active
 *   White full                         #ffffff   --color-neutral-main-full
 *   Text heading (white @ .975)        #f9f9f9   --color-text-heading hsla(0,0%,100%,.975) over #0d0d0d
 *   Text body (white @ .825)           #d5d5d5   --color-text-body    hsla(0,0%,100%,.825)
 *   Text caption (white @ .6)          #9e9e9e   --color-text-caption hsla(0,0%,100%,.6)
 *   Neutral-1 (subtle surface, .075)   #1f1f1f   --color-neutral-main-1 / --color-surface-1
 *   Neutral-2 (raised/border, .15)     #313131   --color-neutral-main-2 / --color-surface-2
 *   Neutral-4 (strong border, .3)      #565656   --color-neutral-main-4
 *   Positive (success)                 #2d8656   --color-semantic-positive-main
 *   Warning                            #bd5b05   --color-semantic-warning-main
 *   Negative (danger/error)            #cc2828   --color-semantic-negative-main
 */

// --- UBISOFT (UDS) raw colour palette (measured `--color-*` tokens) ----------
const ubisoftColor = {
  // The brand IS Ubisoft blue — every primary CTA, link, interactive accent and
  // focus ring. The lighter "variant" is used for hovers, active field borders
  // and the focus outline (measured `--color-brand-primary-variant`).
  blue: {
    main: "#006ef5", // --color-brand-primary-main / --color-semantic-interactive-main — THE Ubisoft blue
    variant: "#3da2ff", // --color-brand-primary-variant / --color-semantic-interactive-variant — hover / focus / field border
    linkHover: "#5ab0ff", // --color-link-hover
    linkActive: "#77beff" // --color-link-active
  },
  // The dark stage. UDS surface-0 is the near-black page; surfaces 1/2 lift via
  // white-with-alpha (pre-blended to flat hex over #0d0d0d — see MAPPING.md).
  black: "#0d0d0d", // --color-surface-0 / --color-overlay-rgb 13,13,13 — the stage
  pureBlack: "#000000", // --color-neutral-variant-full — text on the blue CTA / light surfaces
  white: "#ffffff", // --color-neutral-main-full — pure white
  // Text ramp: white applied over #0d0d0d at decreasing opacity (measured
  // `--color-text-*`), pre-blended to flat hex.
  text: {
    heading: "#f9f9f9", // --color-text-heading  hsla(0,0%,100%,.975) over #0d0d0d
    body: "#d5d5d5", // --color-text-body     hsla(0,0%,100%,.825)
    caption: "#9e9e9e" // --color-text-caption  hsla(0,0%,100%,.6)
  },
  // Neutral ramp: white-with-alpha lifts over the black stage (measured
  // `--color-neutral-main-1..5`), pre-blended to flat hex over #0d0d0d.
  neutral: {
    1: "#1f1f1f", // --color-neutral-main-1 / --color-surface-1  (.075) subtle surface
    2: "#313131", // --color-neutral-main-2 / --color-surface-2  (.15)  raised surface / subtle border
    3: "#434343", // --color-neutral-main-3 (.225)
    4: "#565656", // --color-neutral-main-4 (.3)  strong border
    5: "#686868" // --color-neutral-main-5 (.375)
  },
  // System / status colours (measured `--color-semantic-*` main + variant).
  system: {
    success: "#2d8656", // --color-semantic-positive-main
    successVariant: "#3bb071", // --color-semantic-positive-variant
    warning: "#bd5b05", // --color-semantic-warning-main
    error: "#cc2828", // --color-semantic-negative-main
    errorVariant: "#f17474", // --color-semantic-negative-variant
    info: "#006ef5" // UDS reuses the interactive blue as the info hue (à confirmer — no distinct info token)
  },
  // UDS categorical `--color-palette-*` scale (measured main steps). A real,
  // published 11-hue data-vis palette — used directly for `data.*`.
  palette: {
    blue: "#1f7ead", // --color-palette-blue-main
    indigo: "#3043e8", // --color-palette-indigo-main
    violet: "#6f43ef", // --color-palette-violet-main
    pink: "#d317aa", // --color-palette-pink-main
    red: "#e6194c", // --color-palette-red-main
    orange: "#dc3318", // --color-palette-orange-main
    ginger: "#b65620", // --color-palette-ginger-main
    yellow: "#9a6f19", // --color-palette-yellow-main
    olive: "#637a1f", // --color-palette-olive-main
    green: "#18862a", // --color-palette-green-main
    turquoise: "#218371" // --color-palette-turquoise-main
  }
} as const;

// --- foundation (UBISOFT-specific values) -----------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (action / primary / link). Ubisoft's PRIMARY
    // ACTION is the brand blue, so these map directly to the measured UDS blue
    // (the lightest step is the lighter variant tint).
    blue: {
      10: ubisoftColor.blue.variant, // #3da2ff light blue tint
      60: ubisoftColor.blue.main, // #006ef5 THE Ubisoft blue (primary action / link)
      80: ubisoftColor.blue.linkActive // #77beff brighter active blue
    },
    // Sentropic "cyan" accent slot. UDS has no separate cyan; the closest cool
    // accent is the lighter blue variant + a palette turquoise. (à confirmer.)
    cyan: {
      10: ubisoftColor.blue.variant, // #3da2ff light tint
      50: ubisoftColor.palette.turquoise, // #218371 UDS palette turquoise (cool accent)
      70: ubisoftColor.blue.main // #006ef5 brand blue as the warm-cool accent
    },
    // Sentropic "slate" neutral family mapped onto the UDS dark stage + neutral
    // ramp (dark-first: 0 is the lightest text, 90 is the black stage).
    slate: {
      0: ubisoftColor.white, // #ffffff white (lightest)
      10: ubisoftColor.text.body, // #d5d5d5 body ink (white @ .825 over black)
      20: ubisoftColor.neutral[4], // #565656 strong border on dark
      60: ubisoftColor.text.caption, // #9e9e9e secondary / muted text (white @ .6)
      80: ubisoftColor.neutral[1], // #1f1f1f subtle raised surface (.075)
      90: ubisoftColor.black // #0d0d0d the black stage (darkest)
    },
    feedback: {
      success: ubisoftColor.system.success,
      warning: ubisoftColor.system.warning,
      error: ubisoftColor.system.error,
      info: ubisoftColor.system.info
    }
  },
  // Ubisoft serves its proprietary "Ubisoft Sans" for headings, brand titles and
  // controls (measured `font-family: Ubisoft Sans,Roboto,sans-serif`) and "Open
  // Sans" for body/UI text (measured `font-family: Open Sans,Open Sans Alt,
  // sans-serif`, the dominant body face). We reference the NAMES only, with
  // sans-serif fallbacks. Mono is not part of UDS — the Sentropic mono stack is
  // kept.
  font: {
    sans: "'Open Sans', 'Open Sans Alt', 'Ubisoft Sans', system-ui, Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif",
    display: "'Ubisoft Sans', Roboto, 'Open Sans', system-ui, 'Helvetica Neue', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // UDS border/spacing scale (measured `--border-*`): 0/1/2/3/4/5/6/8/10px. The
  // Sentropic rem steps are aligned to the closest UDS pixel steps.
  spacing: {
    0: "0",
    1: "0.25rem", // 4px  (--border-4)
    2: "0.5rem", // 8px  (--radius-2 / --size-1)
    3: "0.75rem", // 12px
    4: "1rem", // 16px (--font-size-body-medium)
    6: "1.5rem", // 24px (--radius-4)
    8: "2rem", // 32px (--radius-5)
    12: "3rem", // 48px (--radius-7 / --size-11)
    16: "4rem" // 64px (--radius-9 / --size-13)
  },
  // UDS rounds SUBTLY — measured `--radius-*` ramp is 0 / 4 / 8 / 16 / 24 / 32 /
  // 40 / 48 / 56 / 64px and `--radius-full: 10000px` (pill). Controls, inputs and
  // tabs land on `--radius-2: 8px`; cards step up to `--radius-3: 16px`.
  radius: {
    none: "0", // --radius-0
    sm: "4px", // --radius-1 — small chips / icons
    md: "8px", // --radius-2 — buttons / inputs / tabs (the UDS control radius)
    lg: "16px", // --radius-3 — cards / larger surfaces
    pill: "10000px" // --radius-full — pills / circular controls
  },
  // UDS elevation is dark and soft (measured `--color-shadow-*`: black at .075 /
  // .15 / .225, plus `--color-shadow-over-content: rgba(0,0,0,.6)`). Mapped to the
  // three Sentropic slots, black-tinted for the dark stage.
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.30)", // --color-shadow-small .075 → lifted for the dark stage
    medium: "0 4px 12px rgb(0 0 0 / 0.45)", // --color-shadow-medium .15
    floating: "0 8px 24px rgb(0 0 0 / 0.60)" // --color-shadow-large .225 / over-content .6
  },
  // UDS transitions are short and standard (measured control transitions ≈ .2s
  // ease). Exact durations are not separately tokenised; kept aligned with base.
  motion: {
    fast: "120ms",
    normal: "200ms", // measured control/hover transition (.2s ease)
    slow: "300ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not UDS-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (UBISOFT / UDS) ----------------------------------
  // UDS strokes: the focus/active border and the field border are `--border-2`
  // (2px); thin dividers are `--border-1` (1px). The UDS "control border" is the
  // distinctive 2px.
  borderWidth: {
    none: "0", // --border-0
    thin: "1px", // --border-1 — thin dividers
    thick: "2px" // --border-2 — UDS field / focus / secondary-button border
  },
  borderStyle: { solid: "solid" },
  // UDS control density. Measured `--size-*` control heights: --size-9 36px,
  // --size-10 40px, --size-11 48px. md targets a comfortable ~44–48px control
  // (UDS controls are tall); sm/lg bracket it. Body type is 16px.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.625rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0.75rem", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" }
  },
  // UDS typography: "Ubisoft Sans" for headings/controls, "Open Sans" for body/
  // fields. Control labels are regular-to-semibold weight (UDS CTAs are not
  // uppercase); base type is 16px (--font-size-body-medium).
  typography: {
    control: { family: "'Ubisoft Sans', Roboto, 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif", size: "1rem", weight: "600", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Open Sans', 'Open Sans Alt', 'Helvetica Neue', Helvetica, Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Open Sans', 'Open Sans Alt', 'Helvetica Neue', Helvetica, Arial, sans-serif", size: "0.875rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // UDS links are the brand blue at rest (measured `--color-semantic-interactive
    // -main`), brightening to `--color-link-hover #5ab0ff` on hover; not underlined
    // at rest.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.4", // UDS dims disabled controls (à confirmer — exact opacity not isolated)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "200ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // UDS FOCUS = a BLUE OUTLINE (measured `outline: var(--border-2) solid
  // var(--color-brand-primary-variant)` = `2px solid #3da2ff`). The indicator is
  // the lighter blue variant so it reads on both the dark stage and on a filled
  // blue control. (UDS also exposes a high-contrast `2px solid #fd0` accessibility
  // mode; the default brand focus is the blue variant.)
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: ubisoftColor.blue.variant, // #3da2ff — UDS brand-primary-variant focus
    inset: "0"
  },
  // UDS form fields are BOXED (outline): a field box with `border-radius:
  // var(--radius-2)` (8px) on the dark stage; the border turns to the blue variant
  // when active/focused (measured `.textfield { border-radius: 8px }` + active
  // `border: 2px solid #3da2ff`; error `box-shadow: 0 0 0 2px #f17474`). `style:
  // "outline"` makes the builder draw four equal borders from `surface` + `border`.
  // The native <select> chevron is redrawn in the blue variant with a 36px gutter.
  field: {
    style: "outline",
    fillBg: ubisoftColor.neutral[1], // #1f1f1f subtle surface fill on the dark stage
    underlineColor: ubisoftColor.blue.variant, // #3da2ff (unused for outline, kept for completeness)
    underlineWidth: "2px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%233da2ff' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.25rem"
  },
  // UDS cards: a subtle raised surface on the dark stage (neutral-1/2 lift),
  // softly rounded (16px), a faint neutral border and a lift on hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: ubisoftColor.neutral[2] // #313131 faint lift on the dark card
  },
  // UDS secondary button = OUTLINED: transparent fill, a 2px white (text-heading)
  // border + white text (measured `.uds-button.uds-secondary { border: 2px solid
  // var(--color-text-heading); background: transparent }`). The "quiet" variant
  // fills with neutral-2 on hover.
  buttonSecondary: {
    background: "transparent",
    border: ubisoftColor.text.heading, // #f9f9f9 white (text-heading) 2px stroke
    hoverBackground: ubisoftColor.neutral[2] // #313131 quiet fill on hover
  },
  // UDS tabs / sub-nav: active tab = white bold label with a blue bottom indicator,
  // transparent fill on the dark stage.
  tabs: {
    activeText: ubisoftColor.text.heading, // #f9f9f9 active label (near-white heading ink)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px (UDS base type)
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // blue underline on the bottom edge
    indicatorMode: "border" // a real bottom border indicator
  },
  // UDS pagination: borderless light link text on the dark stage; active page =
  // filled blue (the brand fill) with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: ubisoftColor.text.body, // #d5d5d5 link text on dark
    activeBackground: ubisoftColor.blue.main, // #006ef5 filled active page (brand blue)
    activeText: ubisoftColor.white, // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box (--size-10)
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // UDS breadcrumb: blue links, body trail, white current page, muted separators —
  // on the dark stage.
  breadcrumb: {
    linkText: ubisoftColor.blue.main, // #006ef5
    text: ubisoftColor.text.body, // #d5d5d5 trail text
    currentText: ubisoftColor.text.heading, // #f9f9f9 current page
    separator: ubisoftColor.text.caption, // #9e9e9e
    fontSize: "0.875rem", // 14px (--font-size-body-small)
    lineHeight: "1.25rem", // 20px
    currentWeight: "600" // current page is emphasised
  },
  // UDS notice / alert: a tinted dark box with a coloured left filet matching the
  // severity (positive/warning/negative surfaces over the stage).
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0", // left border collapses (filet instead)
    filetWidth: "0.25rem", // 4px ::before accent bar (--border-4)
    paddingTop: "1rem", // 16px
    paddingRight: "1rem", // 16px
    paddingBottom: "1rem", // 16px
    paddingLeft: "1.25rem", // 20px (clears the left filet)
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // UDS accordion / disclosure: a semibold heading-ink summary trigger on a subtle
  // raised row, softly rounded.
  accordion: {
    text: ubisoftColor.text.heading, // #f9f9f9 summary label on dark
    paddingBlock: "1rem", // 16px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "600", // UDS summary triggers are semibold
    lineHeight: "1.5rem" // 24px
  },
  // UDS tag: a small SUBTLE chip — a neutral-2 fill with body ink, 8px radius
  // (matching the UDS control radius; UDS tags are not full pills by default).
  tag: {
    radius: "8px", // --radius-2 (UDS subtle rounding)
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px (--font-size-body-small)
    fontWeight: "600",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: ubisoftColor.neutral[2], // #313131 dark chip fill
    neutralText: ubisoftColor.text.body // #d5d5d5 body ink
  },
  // UDS badge: a small filled pill — brand blue fill / white text (the "info"
  // emphasis), pill-rounded (--radius-full).
  badge: {
    radius: "10000px", // --radius-full pill
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px (--font-size-body-xsmall)
    fontWeight: "700",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: ubisoftColor.blue.main, // #006ef5 brand blue
    infoText: ubisoftColor.white // white on blue
  },
  // UDS checkbox/radio label: regular body ink at base size on the dark stage.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: ubisoftColor.text.body // #d5d5d5 body label on dark
  },
  // UDS search input: a boxed, 8px-radius field on the dark stage, base type.
  search: {
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // UDS toggle / switch label: regular body ink; the checked track is the brand
  // blue (the interactive accent).
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.5rem", // 24px
    textColor: ubisoftColor.text.body // #d5d5d5
  }
} as const;

// --- semantic (UBISOFT / UDS role mapping, DARK-first) ----------------------
const semantic = {
  surface: {
    default: ubisoftColor.black, // #0d0d0d the black stage (--color-surface-0)
    subtle: ubisoftColor.neutral[1], // #1f1f1f subtle surface (--color-surface-1 / neutral-main-1 .075)
    raised: ubisoftColor.neutral[2], // #313131 raised surface (--color-surface-2 / neutral-main-2 .15)
    inverse: ubisoftColor.white, // #ffffff inverse (light) surface
    overlay: "rgb(0 0 0 / 0.60)" // modal backdrop — measured --color-shadow-over-content rgba(0,0,0,.6)
  },
  text: {
    primary: ubisoftColor.text.heading, // #f9f9f9 heading ink (white @ .975 over black)
    secondary: ubisoftColor.text.body, // #d5d5d5 body ink (white @ .825)
    muted: ubisoftColor.text.caption, // #9e9e9e caption ink (white @ .6)
    inverse: ubisoftColor.pureBlack, // #000000 text on light / blue surfaces
    link: ubisoftColor.blue.main // #006ef5 Ubisoft-blue links (brighten to #5ab0ff on hover)
  },
  border: {
    subtle: ubisoftColor.neutral[2], // #313131 subtle divider on dark (neutral-main-2 .15)
    strong: ubisoftColor.neutral[4], // #565656 stronger border (neutral-main-4 .3)
    interactive: ubisoftColor.blue.variant // #3da2ff blue interactive / focus accent
  },
  action: {
    primary: ubisoftColor.blue.main, // #006ef5 THE Ubisoft-blue CTA (--color-semantic-interactive-main)
    primaryHover: ubisoftColor.blue.variant, // #3da2ff lighter blue variant on hover (measured)
    primaryText: ubisoftColor.white, // #ffffff white text on the blue CTA (measured `color:#fff`)
    secondary: ubisoftColor.neutral[2], // #313131 neutral secondary surface
    secondaryHover: ubisoftColor.neutral[3], // #434343
    secondaryText: ubisoftColor.text.heading, // #f9f9f9 white secondary label
    danger: ubisoftColor.system.error // #cc2828 (--color-semantic-negative-main)
  },
  feedback: {
    success: ubisoftColor.system.success, // #2d8656
    warning: ubisoftColor.system.warning, // #bd5b05
    error: ubisoftColor.system.error, // #cc2828
    info: ubisoftColor.system.info // #006ef5 (interactive blue reused — à confirmer)
  },
  status: {
    pending: ubisoftColor.system.warning, // #bd5b05
    processing: ubisoftColor.system.info, // #006ef5
    completed: ubisoftColor.system.success, // #2d8656
    failed: ubisoftColor.system.error // #cc2828
  },
  // Categorical data-vis palette. UDS publishes a REAL 11-hue `--color-palette-*`
  // scale; the first 8 categories below map directly to its measured "main" steps
  // (blue/indigo/violet/pink/orange/green/turquoise/yellow) — an official UDS
  // categorical token list, not a guess.
  data: {
    category1: ubisoftColor.palette.blue, // #1f7ead --color-palette-blue-main
    category2: ubisoftColor.palette.indigo, // #3043e8 --color-palette-indigo-main
    category3: ubisoftColor.palette.violet, // #6f43ef --color-palette-violet-main
    category4: ubisoftColor.palette.pink, // #d317aa --color-palette-pink-main
    category5: ubisoftColor.palette.orange, // #dc3318 --color-palette-orange-main
    category6: ubisoftColor.palette.green, // #18862a --color-palette-green-main
    category7: ubisoftColor.palette.turquoise, // #218371 --color-palette-turquoise-main
    category8: ubisoftColor.palette.yellow // #9a6f19 --color-palette-yellow-main
  }
} as const;

/**
 * The UBISOFT theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Ubisoft-specific (blue-on-black, dark-first,
 * UDS) values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so Ubisoft's blue CTA, near-white
 * heading ink on the #0d0d0d stage, boxed 8px-radius fields and blue focus outline
 * reach the components (buttons, tabs, pagination, chat bubbles…), not just the
 * elements that read semantic vars directly. `mode: "dark"` because the UDS default
 * theme renders on a near-pure-black stage.
 */
export const ubisoftTheme: TenantTheme = {
  id: "ubisoft",
  label: "Ubisoft",
  mode: "dark",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default ubisoftTheme;
