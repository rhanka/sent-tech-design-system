import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Amundi brand theme for the Sentropic token structure.
 *
 * Amundi publishes no tokenised design system; the brand system is the `awf`
 * theme of its corporate site (about.amundi.com, reached from amundi.com),
 * which declares an `--awf-color-*` RGB-triplet token set on `:root`. This
 * package is a MEASURED-CLONE mapping: every value is read from the brand's
 * public stylesheets and we reference the brand font *name* (Noto Sans, the
 * `--awf-font-family`) only — never font binaries. Sources and exact
 * provenance are documented in MAPPING.md. Values the brand does not publish
 * (the categorical data scale, the small density, link hover) are marked
 * "à confirmer" here and in MAPPING.md.
 *
 * Amundi colour reference (light, default colorway):
 *   White (page / card / modal)          #ffffff   (surface default)
 *   Snow (alt surface)                   #faf8f8   (surface subtle)
 *   Alice blue (light tint)              #e6f5fc   (pale blue)
 *   Light grey (input borders)           #d2d2d2   (subtle border)
 *   Storm grey (placeholders)            #717680   (muted text, 4.56:1)
 *   Dark grey (secondary text)           #4f4f4f   (secondary text, 8.19:1)
 *   Cyan (links / tertiary / focus)      #009ee0   (link blue, 3.01:1 lines)
 *   Cerulean (theme / primary buttons)   #0294d1   (action, 3.41:1 lines)
 *   Persian blue (deep action)           #0073a3   (legible blue, 5.27:1)
 *   Prussian blue (body text / footer)   #001c4b   (primary text, 16.57:1)
 *   Midnight (button text / darkest)     #050719   (on-primary text)
 *   Orange (warning)                     #f07d00   (feedback warning)
 *   Green (success)                      #28c878   (feedback success)
 *   Red (error / badges)                 #dc2626   (feedback error — vendor default retained)
 */

// --- Amundi raw colour palette -------------------------------------------
// Triplets (`--awf-color-*:R G B`) are transcribed as lowercase 6-digit hex;
// 8-digit literals are kept 8-digit. Counts below are `var()` references over
// the shipped corporate bundle (which carries the theme base twice — both
// copies count) plus literal occurrences in the brand region; see MAPPING.md.
const amundiColor = {
  // Brand blues — `--awf-color-*` triplets on `:root` (corporate bundle).
  brand: {
    prussianBlue: "#001c4b", // --awf-color-prussian-blue:0 28 75 — body text, footer, select chevron
    midnight: "#050719", // --awf-color-midnight:5 7 25 — primary-button text, menu text
    cyan: "#009ee0", // --awf-color-cyan:0 158 224 — editorial links, tertiary buttons, toggle, focus
    cerulean: "#0294d1", // --awf-color-cerulean:2 148 209 — `--awf-color-theme` default: primary buttons, input borders, checkbox accent
    persianBlue: "#0073a3", // --awf-color-persian-blue:0 115 163 — deep action blue (stepper bullets, showcase)
    reflexBlue: "#0048ff", // --awf-color-reflex-blue:0 72 255 — progress-bar fill, gradient stop
    aliceBlue: "#e6f5fc", // --awf-color-alice-blue:230 245 252 — light sections, autocomplete hover
    glacier: "#7ea4c3" // --awf-color-glacier:126 164 195 — grey colorway + hero picto fill
  },
  // Section colorways + message hues. Orange/green are painted (warning /
  // status) and carry feedback roles; purple/turquoise resolve only inside
  // the `[data-awf-theme-color]` mappings, are painted nowhere, and carry no
  // Sentropic role.
  colorway: {
    orange: "#f07d00", // --awf-color-orange:240 125 0 — message-warning, info-box warning
    green: "#28c878", // --awf-color-green:40 200 120 — message-status, success text
    purple: "#6a4fb8", // --awf-color-purple:106 79 184 — mapping-only: no role
    turquoise: "#37b2b5" // --awf-color-turquoise:55 178 181 — mapping-only: no role
  },
  // Neutral scale.
  grey: {
    white: "#ffffff", // --awf-color-white:255 255 255 — page, card, modal, inverse text
    snow: "#faf8f8", // --awf-color-snow:250 248 248 — alt surface, disabled submit fill
    light: "#d2d2d2", // --awf-color-light-grey:210 210 210 — input borders, dividers
    storm: "#717680", // --awf-color-storm-grey:113 118 128 — placeholders via --awf-color-input-placeholder
    dark: "#4f4f4f", // --awf-color-dark-grey:79 79 79 — secondary text, menu borders, back button
    beige: "#faf6ef", // --awf-color-beige:250 246 239 — parsimony section fill: no core role
    mako: "#414651", // --awf-color-mako:65 70 81 — PAP stepper label: no core role
    arsenic: "#373947", // --awf-color-arsenic:55 57 71 — dark-mode variant-5 only: no role
    black: "#000000" // --awf-color-black:0 0 0 — gradient stops + showcase only, zero direct paint: no role
  },
  // System / warning colours.
  system: {
    red: "#dc2626", // --awf-color-red:220 38 38 — error, badges, input-error; vendor default retained (Tailwind red-600)
    warningBlueLight: "#e5f5fc", // --awf-color-warning-blue-light:229 245 252 — warning banner: no core role
    warningBlueDark: "#0e284b", // --awf-color-warning-blue-dark:14 40 75 — dark-mode warning: no role
    warningRedLight: "#fcd0d4", // --awf-color-warning-red-light:252 208 212 — warning banner: no core role
    warningRedDark: "#981939" // --awf-color-warning-red-dark:152 25 57 — dark-mode warning: no role
  },
  // Shared top-bar chrome (metanav.css `--mv-*`) + the theme's live override.
  chrome: {
    barBackground: "#37394c", // --awf-metanav-color-bg:55 57 76 — live override of the bar fill
    barAccent: "#1db2e9", // --awf-metanav-color-accent:29 178 233 — live override of the bar accent
    mvBackground: "#f5f5f5", // --mv-color-bg / --mv-color-menu-separator — bar default (live-overridden) + dropdown separators (painted)
    mvForeground: "#4d4d4f", // --mv-color-fg / --mv-color-accent / --mv-color-menu-fg — bar text + accent defaults (live-overridden) + dropdown text (painted)
    mvSeparator: "#e0e0e0", // --mv-color-separator / --mv-color-menu-tab-separator — painted separators
    mvBackdrop: "#00000066" // --mv-color-menu-backdrop — painted menu backdrop, black 40%
  },
  // Scoped / literal paints (no Sentropic role).
  scoped: {
    shadow: "#3838381a", // literal shadow tint on buttons, tables, account CTAs (12 occurrences)
    wesaveOutline: "#d5d7da" // --awf-wesave-outline-color — WeSave-section focus outline only
  }
} as const;

// --- foundation (Amundi-specific values) ----------------------------------
const foundation = {
  color: {
    // The Sentropic "blue" action family carries the theme blue: pale alice,
    // action cerulean (primary buttons), deep persian.
    blue: {
      10: amundiColor.brand.aliceBlue, // #e6f5fc pale action tint
      60: amundiColor.brand.cerulean, // #0294d1 `--awf-color-theme`: primary buttons
      80: amundiColor.brand.persianBlue // #0073a3 deep action blue
    },
    // The Sentropic "cyan" accent slot carries the token NAMED cyan (links),
    // on the same pale tint and the same deep step.
    cyan: {
      10: amundiColor.brand.aliceBlue, // #e6f5fc pale link tint
      50: amundiColor.brand.cyan, // #009ee0 editorial links, tertiary buttons
      70: amundiColor.brand.persianBlue // #0073a3 deep link-azure step
    },
    // Sentropic "slate" role family mapped onto the neutral scale.
    slate: {
      0: amundiColor.grey.white, // page surface
      10: amundiColor.grey.snow, // alt surface
      20: amundiColor.grey.light, // input borders / dividers
      60: amundiColor.grey.dark, // secondary text
      80: amundiColor.brand.prussianBlue, // primary text
      90: amundiColor.brand.midnight // darkest
    },
    feedback: {
      success: amundiColor.colorway.green, // --awf-color-message-status
      warning: amundiColor.colorway.orange, // --awf-color-message-warning
      error: amundiColor.system.red, // --awf-color-message-error (vendor default retained)
      info: amundiColor.brand.cerulean // --awf-color-message-info
    }
  },
  // Amundi ships Noto Sans (weights 400-900, `--awf-font-family`) for body,
  // controls, fields, labels and headings alike; mono is the system stack (no
  // brand monospace is published). Montserrat (account CTAs) and Arial
  // (meta-nav reset) are scoped to those components and carry no font role.
  // We reference the font *names* only, not binaries.
  font: {
    sans: "'Noto Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Noto Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // The brand builds on the same 4px rem system at a 16px root
  // (`html{font-size:16px}`), so the base spacing scale is reused as-is.
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
  // Measured radius steps: squared back button / meta-nav (0), modal + chips
  // (.25rem), inputs + cards (.5rem), `--awf-radius-image` (1rem: images,
  // dialog, autocomplete), pill buttons + search + pagers (9999px).
  radius: {
    none: "0",
    sm: "0.25rem", // 4px — modal body, logout button, quote highlight
    md: "0.5rem", // 8px — inputs, selects, cards
    lg: "1rem", // 16px — `--awf-radius-image`
    pill: "9999px" // buttons, search, pager nav, toggle
  },
  // Brand-authored small shadow in a literal `#383838` tint; the larger two
  // are the consumed Tailwind stock shadows, byte-identical in value.
  shadow: {
    subtle: "0 1px 2px #3838381a",
    medium: "0 10px 15px -3px rgb(0 0 0 / .1), 0 4px 6px -4px rgb(0 0 0 / .1)", // toast + dialog shadow — vendor default retained (Tailwind shadow-lg; brand bytes)
    floating: "0 20px 25px -5px rgb(0 0 0 / .1), 0 8px 10px -6px rgb(0 0 0 / .1)" // nav dropdown shadow — vendor default retained (Tailwind shadow-xl; brand bytes)
  },
  // Measured durations: .15s (6 rules: arrows, toggle, tabled nav), .3s
  // (4 rules incl. the modal), .5s max (single alto-cubes use). The easing is
  // the Tailwind default, declared literally 14 times by brand rules.
  motion: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
    easing: "cubic-bezier(.4,0,.2,1)" // vendor default retained (Tailwind ease-in-out; brand bytes)
  },
  // Only the toast level is published (`[data-drupal-messages]` at z 100);
  // the rest is the Sentropic base.
  z: {
    header: 50,
    toast: 100,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Amundi) ----------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // inputs, messages, cards, pager nav
    thick: "2px" // toggle slider, icon rings, focus outlines
  },
  borderStyle: { solid: "solid" }, // disclaimer divider, DS swatches
  // Control density. The brand publishes no sm/lg control system: md is the
  // measured input geometry, lg the measured button geometry, sm the base.
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.75rem", gap: "0.375rem", minWidth: "2rem", fontSize: "0.875rem" }, // à confirmer (Sentropic base — the brand publishes no small controls; `--small` only narrows one input)
    md: { controlHeight: "2.5rem", paddingBlock: "0.5rem", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" }, // inputs: 2.5rem box, .5rem/1rem padding, 16px text; checkbox gap .5rem (minWidth: à confirmer, base — no generic min-width published)
    lg: { controlHeight: "3.125rem", paddingBlock: "0.25rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1rem" } // buttons: `--awf-btn-min-height` 3.125rem, inner 1.5rem/.25rem, 16px text (gap/minWidth: à confirmer, base)
  },
  // Amundi typography: Noto Sans everywhere. Buttons 16/900, inputs and
  // labels 16/400, editorial links 16/900 in cyan with no rest underline.
  typography: {
    control: { family: "'Noto Sans', system-ui, sans-serif", size: "1rem", weight: "900", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Noto Sans', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Noto Sans', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Brand links are 16/900 cyan, explicitly not underlined at rest (CK body
    // + EDM file link); no link hover is published.
    link: {
      family: "'Noto Sans', system-ui, sans-serif", size: "1rem", weight: "900", lineHeight: "1.5", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", // à confirmer (no link hover published — underline is the coherent stand-in)
      decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.3", // icon nav buttons dim to 0.3 (3 rules; the submit restyles + 0.5 instead — see MAPPING.md)
  transition: { property: "all", duration: "150ms", easing: "cubic-bezier(.4,0,.2,1)" }, // `all` ×9; .15s most common; easing vendor-retained (see motion)
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" }, // button arrows 1rem, message icons 1.25rem, check-list 1.5rem
  // FOCUS = a high-contrast OUTLINE: 2px, 2px offset, cyan. The account CTA
  // draws the same outline in theme-cerulean; fields suppress the outline and
  // recolour their border instead.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: amundiColor.brand.cyan, // #009ee0 toggle-block focus-visible (3.01:1 — line floor)
    inset: "0"
  },
  // Form fields are BOXED (outline): transparent fill over white, 1px
  // light-grey borders on all four sides, .5rem radius; hover/focus recolour
  // the border to theme-cerulean. `style: "outline"` draws the four equal
  // borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: amundiColor.grey.white, // #ffffff (no fill declared — transparent over the white page)
    underlineColor: amundiColor.grey.light, // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: appearance none + prussian 12×10 chevron, 2.25rem
    // right gutter, drawn 13px off the right edge.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3csvg%20width='12'%20height='10'%20viewBox='0%200%2012%2010'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M1.5%203L6%207L10.5%203'%20stroke='%23001C4B'%20stroke-width='1.5'%20stroke-linecap='round'/%3e%3c/svg%3e\") no-repeat right 13px center",
    selectPaddingRight: "2.25rem"
  },
  // Cards: white fill, 1px light-grey stroke (.5rem radius via radius.md);
  // hover recolours the border to cyan (no leaf) and never the fill.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5" // card copy inherits the brand 150% (EDM title/size set it explicitly)
  },
  // Secondary button = OUTLINED in prussian: transparent fill, 1px
  // variant-1 border + text; hover fill unpublished (snow stand-in).
  buttonSecondary: {
    background: "transparent",
    border: amundiColor.brand.prussianBlue, // #001c4b variant-1 in light mode
    hoverBackground: amundiColor.grey.snow // unpublished hover — snow is the coherent neutral stand-in
  },
  // Tabs: 16/900 text tabs with a bottom indicator bar (alto pattern, light
  // translation: prussian text; the component draws the bar in the accent).
  tabs: {
    activeText: amundiColor.brand.prussianBlue, // light translation of the alto active tab (white on dark upstream)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "900",
    paddingBlock: "1.5rem", // 24px nav padding
    paddingInline: "0", // no inline padding (brand reset)
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom",
    indicatorMode: "shadow" // drawn bar, not a border (DSFR-precedent mapping)
  },
  // Pagination: 2.5rem circle pager (tabled nav) — white fill, 1px prussian
  // ring; active page = theme fill (hover pattern) with midnight numbers so
  // the text clears 4.5:1 (the brand's white-on-theme is icon-context).
  pagination: {
    background: amundiColor.grey.white, // variant-2 in light mode
    border: amundiColor.brand.prussianBlue, // variant-1 ring
    borderWidth: "1px",
    radius: "9999px",
    activeBackground: amundiColor.brand.cerulean, // hover-fill pattern
    activeText: amundiColor.brand.midnight, // 5.86:1 on the fill
    activeBorderWidth: "0", // hover drops the ring (border-style:none)
    paddingBlock: "0",
    paddingInline: "0",
    minSize: "2.5rem" // tabled nav box (carousel arrows are 2.75rem)
  },
  // No breadcrumb is published; metrics follow the 14px nav text, colours the
  // measured roles via the defaults.
  breadcrumb: {
    fontSize: "0.875rem", // 14px nav text
    lineHeight: "1.3125rem", // 21px (150%)
    currentWeight: "900" // nav-link weight
  },
  // Alert = factory-messages: white box, 1px light-grey@20% stroke, 3rem
  // severity accent bar, midnight text; toast context adds the lg shadow.
  alert: {
    background: amundiColor.grey.white, // message-bg
    text: amundiColor.brand.midnight, // message-caption-text
    borderTop: "1px solid rgb(210 210 210 / 0.2)", // message-border at .2 opacity
    borderRight: "1px solid rgb(210 210 210 / 0.2)",
    borderBottom: "1px solid rgb(210 210 210 / 0.2)",
    accentWidth: "3rem", // severity accent bar
    filetWidth: "0",
    paddingTop: "0.75rem", // message body block padding
    paddingRight: "0.5rem", // actions inset
    paddingBottom: "0.75rem",
    paddingLeft: "4.5rem", // 3rem accent + 1.5rem gap
    fontSize: "1rem", // inherited body size (toast context pins 14px)
    lineHeight: "1.5rem" // 24px
  },
  // Accordion: flush trigger (no padding) with a 28/900 title; open titles
  // recolour to theme.
  accordion: {
    text: amundiColor.brand.prussianBlue, // inherited body text
    paddingBlock: "0", // no trigger padding (brand reset)
    paddingInline: "0",
    fontSize: "1.75rem", // 28px title
    fontWeight: "900",
    lineHeight: "2.625rem" // 42px (150%)
  },
  // Tag = article-teaser tag: a bare 14/900 blue text run, no pill. The blue
  // is routed to persian so the text clears 4.5:1 (brand paints cerulean).
  tag: {
    radius: "0", // no pill (brand reset)
    paddingBlock: "0",
    paddingInline: "0",
    fontSize: "0.875rem", // 14px
    fontWeight: "900",
    lineHeight: "1.3125rem", // 21px (150%)
    minHeight: "0",
    neutralBackground: "transparent",
    neutralText: amundiColor.brand.persianBlue // 5.27:1 (see text.link routing)
  },
  // Badge = unread pill: red fill, white 12px text, 1.25rem box. The brand's
  // sole badge is red; it is applied to the info tone (DSFR precedent).
  badge: {
    radius: "1rem",
    paddingBlock: "0", // top 0 measured; bottom 2px has no leaf (see MAPPING.md)
    paddingInline: "0.25rem", // 4px
    fontSize: "0.75rem", // 12px
    lineHeight: "1.125rem", // 18px
    minHeight: "1.25rem", // 20px box
    infoBackground: amundiColor.system.red, // unread-pill fill
    infoText: amundiColor.grey.white // 4.83:1
  },
  // Checkbox/radio label: 16/400 prussian (native boxes use theme accent).
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px (same label rhythm)
    labelColor: amundiColor.brand.prussianBlue // variant-1 in light mode
  },
  // Search = pill input-text: 3.5rem box, 3.5rem icon gutter, .5rem/16px type.
  search: {
    paddingBlock: "0.5rem", // 8px (input base)
    paddingInline: "1rem", // 16px (input base)
    paddingLeft: "3.5rem", // icon gutter
    paddingRight: "1rem",
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // The brand ships no switch — a segmented agree/disagree control (cyan
  // track, white slider, 50px radius) instead; unmapped leaves omitted.
  toggle: {
    trackRadius: "50px",
    lineHeight: "1.5rem", // brand 150% convention
    textColor: amundiColor.brand.prussianBlue, // label-side text (choice-label analogy)
    trackCheckedColor: amundiColor.brand.cyan, // measured on-state track
    thumbColor: amundiColor.grey.white // measured slider
  }
} as const;

// --- semantic (Amundi-specific role mapping) ------------------------------
const semantic = {
  surface: {
    default: amundiColor.grey.white, // page
    subtle: amundiColor.grey.snow, // #faf8f8 alt surface
    raised: amundiColor.grey.white, // cards, modal, dropdowns
    inverse: amundiColor.brand.prussianBlue, // #001c4b footer
    overlay: "rgb(0 0 0 / 0.4)" // modal scrim (metanav #00000066 corroborates)
  },
  text: {
    primary: amundiColor.brand.prussianBlue, // #001c4b body (16.57:1)
    secondary: amundiColor.grey.dark, // #4f4f4f (8.19:1)
    muted: amundiColor.grey.storm, // #717680 placeholders (4.56:1 — clears 4.5)
    inverse: amundiColor.grey.white, // footer, badges, dark sections
    link: amundiColor.brand.persianBlue // #0073a3 (5.27:1) — routed: brand links are cyan at 3.01:1
  },
  border: {
    subtle: amundiColor.grey.light, // #d2d2d2 input borders, dividers
    strong: amundiColor.grey.dark, // #4f4f4f menu borders
    interactive: amundiColor.brand.cerulean // #0294d1 input hover/focus borders (3.41:1 — line floor)
  },
  action: {
    primary: amundiColor.brand.cerulean, // #0294d1 `--awf-color-theme`
    primaryHover: amundiColor.brand.cerulean, // no button hover published — hover keeps rest
    primaryText: amundiColor.brand.midnight, // #050719 dark on cerulean (5.86:1)
    secondary: amundiColor.grey.snow, // #faf8f8 secondary surface
    secondaryHover: amundiColor.grey.light, // #d2d2d2 (10.96:1 with secondaryText)
    secondaryText: amundiColor.brand.prussianBlue, // outlined-button text
    danger: amundiColor.system.red // #dc2626 vendor default retained
  },
  feedback: {
    success: amundiColor.colorway.green,
    warning: amundiColor.colorway.orange,
    error: amundiColor.system.red,
    info: amundiColor.brand.cerulean
  },
  status: {
    pending: amundiColor.colorway.orange,
    processing: amundiColor.brand.cerulean,
    completed: amundiColor.colorway.green,
    failed: amundiColor.system.red
  },
  // Categorical data-vis palette. The brand publishes no chart scale (the
  // only `chart` match is an unstyled web-component host), so this is a
  // coherent proposal drawn from the measured hues (see MAPPING.md).
  data: {
    category1: amundiColor.brand.cerulean, // #0294d1 theme (à confirmer)
    category2: amundiColor.brand.prussianBlue, // #001c4b navy (à confirmer)
    category3: amundiColor.colorway.orange, // #f07d00 (à confirmer)
    category4: amundiColor.colorway.green, // #28c878 (à confirmer)
    category5: amundiColor.system.red, // #dc2626 (à confirmer)
    category6: amundiColor.colorway.purple, // #6a4fb8 (à confirmer)
    category7: amundiColor.colorway.turquoise, // #37b2b5 (à confirmer)
    category8: amundiColor.brand.glacier // #7ea4c3 (à confirmer)
  }
} as const;

/**
 * The Amundi theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Amundi-specific values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the cerulean/prussian brand reaches the components.
 */
export const amundiTheme: TenantTheme = {
  id: "amundi",
  label: "Amundi",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default amundiTheme;
