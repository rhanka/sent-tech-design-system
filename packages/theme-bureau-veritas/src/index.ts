import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Bureau Veritas brand theme for the Sentropic token structure.
 *
 * Bureau Veritas (group.bureauveritas.com, bureauveritas.fr — identical theme
 * bundles) publishes no tokenised design system; the brand values below are
 * MEASURED from the public site stylesheet (the `bureauveritasbase` Drupal
 * theme aggregate). The signature is the deep brand blue `#00049e` (filled
 * buttons, links, section fills, form accents). The brand ships three
 * proprietary display faces (`BureauVeritas-*`) and a Source Sans body face;
 * we reference the font *names* only — never font binaries. Sources and exact
 * provenance are documented in MAPPING.md. Values with no published brand
 * equivalent carry `à confirmer` inline and a MAPPING.md row.
 *
 * Bureau Veritas colour reference (light theme):
 *   White (page / filled-button hover)  #ffffff   (surface default)
 *   Zebra / section alt grey            #eaeaea   (subtle surface)
 *   Pending / disabled grey             #bbbbbb   (pending status)
 *   Input text / border grey            #808080   (field underline)
 *   Strong warm grey                    #706f6f   (strong borders)
 *   Body / description text             #333333   (primary text)
 *   Darkest (bullets / CTA text)        #000000   (darkest)
 *   Brand deep blue (action)            #00049e   (primary / links / inverse)
 *   Derived darker blue                 #000385   (hover — à confirmer)
 *   Bright status blue                  #2c32ff   (processing / info)
 *   Sky category blue                   #00b0f0   (data)
 *   Cyan category blue                  #00b4c4   (data)
 *   Green category                      #82ca9c   (data)
 *   Purple category                     #9185be   (data)
 *   Lavender (nav current fill)         #b9baff   (light tint)
 *   Teal (completed / success)          #00a49a   (success)
 *   Lime category                       #b6ff4e   (data context)
 *   Amber (requested / warning)         #ffc82c   (warning)
 *   Derived error red                   #e60000   (error — à confirmer: brand `red` #ff0000 4.00:1, 1 stop-rule step, 4.81:1)
 */

// --- Bureau Veritas raw colour palette --------------------------------------
const bureauVeritasColor = {
  // Brand deep blue — the Bureau Veritas signature. Filled buttons
  // (`.button-filled`), general links (`ul.links a`), breadcrumb current page,
  // form checkbox/radio accents and dark section fills
  // (`.background-color-second .paragraph-wysiwyg--content`).
  brand: {
    primary: "#00049e", // brand deep blue (action / links / inverse)
    hover: "#000385", // derived darker blue for hover (à confirmer)
    bright: "#2c32ff", // bright blue — tag gradients anchor, confirmed states
    sky: "#00b0f0", // category c-2 blue
    cyanBlue: "#00b4c4", // category c-3 blue
    green: "#82ca9c", // category c-4 green (also new/top teaser titles)
    purple: "#9185be", // category c-6 purple
    lavender: "#b9baff", // current-nav fill + category c-7
    teal: "#00a49a", // completed/invoiced/issued states (success)
    lime: "#b6ff4e", // category c-9 (data context)
    amber: "#ffc82c" // requested/submitted states (warning)
  },
  // Neutral scale, all brand-published (see MAPPING.md for each declaration).
  slate: {
    0: "#ffffff", // page background / filled-button hover
    50: "#eaeaea", // table zebra striping / section alt
    200: "#bbbbbb", // pending states / disabled button fill / tab links
    400: "#808080", // form input text + resting border (`gray`)
    500: "#706f6f", // third-variant section borders / fills
    800: "#333333", // descriptions / focus borders / tag text
    900: "#000000" // list markers / product CTA text
  },
  // System / status colours.
  system: {
    success: "#00a49a", // `.tag-states.completed` etc. (3.10:1 on white)
    warning: "#ffc82c", // `.tag-states.requested,.submitted` (1.55:1)
    // Brand error red `red` (#ff0000, 4.00:1 on white — fails 4.5:1) carried
    // one step down the stop rule (HSL H=0 S=100% L 50%→45%) to the first
    // passing hex (à confirmer).
    error: "#e60000", // derived from brand `red`, 4.81:1 (à confirmer)
    info: "#2c32ff" // `.tag-states.confirmed,.inprogress,.validated`
  }
} as const;

// --- foundation (Bureau-Veritas-specific values) -----------------------------
const foundation = {
  color: {
    // Bureau Veritas has no light "blue" tint scale; the Sentropic "blue"
    // role family carries the brand deep blue, the lavender nav-current fill
    // as its light tint, and the derived darker hover.
    blue: {
      10: bureauVeritasColor.brand.lavender, // #b9baff vertical-nav current fill
      60: bureauVeritasColor.brand.primary, // #00049e brand deep blue
      80: bureauVeritasColor.brand.hover // #000385 derived darker hover (à confirmer)
    },
    // The Sentropic "cyan" accent slot carries the brand's categorical
    // cyan/sky blues and teal.
    cyan: {
      10: bureauVeritasColor.brand.lavender, // #b9baff lightest cool tint
      50: bureauVeritasColor.brand.cyanBlue, // #00b4c4 category blue
      70: bureauVeritasColor.brand.teal // #00a49a teal
    },
    // Sentropic "slate" role family mapped onto the measured neutral scale.
    slate: {
      0: bureauVeritasColor.slate[0], // white
      10: bureauVeritasColor.slate[50], // zebra / alt surface
      20: bureauVeritasColor.slate[200], // pending grey
      60: bureauVeritasColor.slate[500], // strong warm grey
      80: bureauVeritasColor.slate[800], // primary text
      90: bureauVeritasColor.slate[900] // darkest
    },
    feedback: {
      success: bureauVeritasColor.system.success,
      warning: bureauVeritasColor.system.warning,
      error: bureauVeritasColor.system.error,
      info: bureauVeritasColor.system.info
    }
  },
  // Bureau Veritas ships proprietary faces (declared in `@font-face` in the
  // brand stylesheet): `Source-Sans-RegularPro` for body/inputs,
  // `BureauVeritas-ExtBdUltraCond` for headings and buttons. Mono is the
  // system stack (the brand publishes no monospace face). Names only.
  font: {
    sans: "'Source-Sans-RegularPro', Arial, sans-serif",
    display: "'BureauVeritas-ExtBdUltraCond', Arial, sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale, kept aligned with the Sentropic base
  // (verified against packages/tokens/src/foundation.ts); the brand lays out
  // in px (12/20/30px gutters) without publishing a rem step scale.
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
  // Bureau Veritas is sharp-cornered: inputs and buttons declare
  // `border-radius:0`; product surfaces (image, CTA) use 10px.
  radius: {
    none: "0",
    sm: "0", // `form button…{border-radius:0}` / inputs `border-radius:0`
    md: "0", // buttons / inputs
    lg: "10px", // `.product--picture img` / `.product--cta .button-action`
    pill: "999px" // Sentropic base (verified); brand status chips use 100px
  },
  // The brand publishes no elevation shadows (buttons and boxes declare
  // `box-shadow:none`); geometry aligned with the reference theme package,
  // tint re-anchored on the brand's own near-black `#333333`
  // (à confirmer).
  shadow: {
    subtle: "0 1px 2px rgb(51 51 51 / 0.10)", // à confirmer
    medium: "0 4px 12px rgb(51 51 51 / 0.14)", // à confirmer
    floating: "0 8px 24px rgb(51 51 51 / 0.18)" // à confirmer
  },
  // Brand transitions are ease-out, most commonly `.25s` (buttons, links)
  // with `.35s` fades; fast has no published value (à confirmer).
  motion: {
    fast: "150ms", // à confirmer
    normal: "250ms", // `.button-filled` / links `transition:… .25s ease-out`
    slow: "350ms", // `.needs-select:after` `transition:opacity .35s`
    easing: "ease-out" // brand easing (no cubic-bezier published)
  },
  // z-index roles are not brand-specific; Sentropic base values (verified
  // against packages/tokens/src/foundation.ts).
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Bureau Veritas) ----------------------------------
  // Sentropic base weights (verified): the brand uses 1px checkbox/radio
  // boxes and 2px button/field/tag borders.
  borderWidth: {
    none: "0",
    thin: "1px", // checkbox/radio boxes
    thick: "2px" // buttons / tags / tab underline
  },
  borderStyle: { solid: "solid" }, // Sentropic base (verified)
  // Control density. Inputs declare `height:40px` + `padding:12px`; buttons
  // declare `padding:20px` with no height. The brand answered in part:
  // `.button-action.small` / `.button-filled.small` share the fluid small
  // font-size rule capped at `1rem`, `.button-filled.x-small` /
  // `.button-action.x-small` read `line-height:1;padding:3px 3px 1px`, and
  // `.advanced-search-field.small` carries its own font steps — but no
  // complete sm/lg geometry (heights, paddings, gaps, min-widths), so sm/lg
  // stay aligned with the reference theme package's geometry (à confirmer) —
  // their controlHeight 2rem/3rem coincide with the Sentropic base.
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.5rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" }, // à confirmer
    md: { controlHeight: "2.5rem", paddingBlock: "0.75rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1.25rem" }, // height/padding/font-size measured; gap/minWidth à confirmer
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" } // à confirmer
  },
  // Bureau Veritas typography: condensed uppercase display face for buttons
  // and headings, Source Sans for fields, Source Sans Bold for labels;
  // body links are underlined, signature links carry an arrow instead.
  // Buttons share the uppercase display-face rule (line-height 1.25) but the
  // later padding rules (`.button-action` and `.button-filled` exact members,
  // equal specificity, no later reset except the `.x-small` variants at
  // line-height 1) set the effective button line-height to .9 — transcribed.
  typography: {
    control: { family: "'BureauVeritas-ExtBdUltraCond', Arial, sans-serif", size: "1.563rem", weight: "400", lineHeight: "0.9", letterSpacing: "0", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Source-Sans-RegularPro', Arial, sans-serif", size: "1.25rem", weight: "400", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Source-Sans-BoldPro', Arial, sans-serif", size: "1.25rem", weight: "400", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Body links (`ul.links a`) are brand blue; running-text links
    // (`.description a`) are underlined at rest and stay underlined on hover
    // (hover only shifts colour to the brand blue).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  // Disabled treatment differs by control kind: class-based disabled buttons
  // read `.button.is-disabled{opacity:.5;cursor:default}` (transcribed), while
  // natively disabled submit controls read `opacity:.7!important` with
  // `pointer-events:none!important` (noted context, see MAPPING.md).
  disabledOpacity: "0.5", // `.button.is-disabled{opacity:.5}`
  // No brand transition shorthand published as a whole: buttons declare
  // `transition:border .25s ease-out`, others `transition:all .25s ease-out`;
  // this set is carried from the measured parts (à confirmer).
  transition: { property: "background-color, border-color, color", duration: "250ms", easing: "ease-out" }, // à confirmer
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" }, // Sentropic base (verified)
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" }, // Sentropic base (verified)
  // FOCUS: the brand removes the outline on inputs and selects (`outline:0`)
  // and thickens the underline to 2px in `#333`, but it KEEPS published
  // outlines at focus: `form textarea:focus{outline:auto}` (least-scoped
  // general rule, later than `outline:0` at equal specificity, so it wins),
  // `.advanced-search-field…:focus` and `.content-filters…:focus`
  // (`outline:auto` / `outline:solid`, each cancelling the thickening with
  // `border-bottom-width:inherit`), plus the keyboard search-tool state
  // (`outline:auto`). The only shadow-based focus
  // (`.site-logo--inner a:focus{box-shadow:inset 0 0 0 4px #000}`) is
  // logo-scoped and inset, so `strategy: "outline"` is the measured
  // technique — not the closest carrier. `width: 2px` and `color: #333333`
  // transpose the measured border technique: the published outlines declare
  // neither width nor colour.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "0",
    color: bureauVeritasColor.slate[800], // #333333 measured focus colour
    inset: "0"
  },
  // Form fields are UNDERLINED: transparent fill over the white page, a
  // bottom-only 1px grey stroke (`border-width:0 0 1px`, `border-color:gray`)
  // and square corners. `style: "filled-underline"` with `fillBg` = the
  // surface default and the measured grey underline.
  field: {
    style: "filled-underline",
    fillBg: bureauVeritasColor.slate[0], // #ffffff page surface
    underlineColor: bureauVeritasColor.slate[400], // #808080 resting field stroke
    underlineWidth: "1px",
    underlineMode: "border", // `border-width:0 0 1px` (not an inset shadow)
    // Native <select> (`appearance:none` on `form select`): the brand draws
    // its own chevron — `form select` is the exact last member of the
    // `background-image:url("data:image/svg+xml;base64,…")` rule whose SVG
    // decodes to `fill="#333"`; the inverted variant (`.content-filters
    // select` group) decodes to `fill="#fff"`. Grey is coherent: the custom
    // `.needs-select--inner:after` caret reads `border-color:gray`.
    // Position measured (`background-position:calc(100% - 12px) 50%`).
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='8' viewBox='0 0 13 8'%3E%3Cpath fill='%23333333' d='M13.1.5c-.4-.4-1.1-.4-1.5 0L6.9 5.2 2.1.5C1.7.1 1 .1.7.5.3.9.3 1.6.7 2l5.5 5.5c.2.2.5.3.7.3.3 0 .5-.1.7-.3L13.1 2c.4-.5.4-1.1 0-1.5z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem" // à confirmer (gutter width unpublished)
  },
  // Cards: the brand publishes no card component (no card border, no card
  // line-height — the published body line-height is 1.25, not 1.5);
  // geometry aligned with the reference theme package (à confirmer).
  // Hover tint reuses the measured subtle surface (à confirmer).
  card: {
    borderWidth: "1px", // à confirmer (no brand card border published)
    lineHeight: "1.5", // à confirmer (brand body line-height is 1.25)
    hoverBackground: bureauVeritasColor.slate[50] // #eaeaea (à confirmer)
  },
  // Secondary button = OUTLINED in the brand blue: `.button-action` carries
  // a transparent fill with a 2px `#00049e` border and text; hover only
  // clears the border, the fill stays transparent.
  buttonSecondary: {
    background: "transparent",
    border: bureauVeritasColor.brand.primary, // #00049e stroke
    hoverBackground: "transparent" // hover keeps the transparent fill
  },
  // Tabs: `.tabs ul.primary` draws a bottom 2px rule
  // (`border-width:0 0 2px`); links read `#bbb`. That markup is Drupal
  // local-tasks restyled inside the brand aggregate — the same kind of basis
  // as the excluded `.messages` alert default (see MAPPING.md for the
  // boundary rationale). No active-label colour is published — the active
  // label is routed to the brand action blue (à confirmer); geometry aligned
  // with the reference package (à confirmer).
  tabs: {
    activeText: bureauVeritasColor.brand.primary, // #00049e (à confirmer)
    activeBackground: "transparent", // à confirmer
    inactiveBackground: "transparent", // à confirmer
    activeWeight: "700", // à confirmer
    paddingBlock: "0.75rem", // 12px (à confirmer)
    paddingInline: "1rem", // 16px (à confirmer)
    fontSize: "1rem", // 16px (à confirmer)
    lineHeight: "1.5rem", // 24px (à confirmer)
    indicatorSide: "bottom", // `.tabs ul.primary{border-width:0 0 2px}` (à confirmer — Drupal local-tasks basis, see MAPPING.md)
    indicatorMode: "border" // à confirmer (same basis)
  },
  // Pagination: `.pager a:hover{color:#00049e}`; the active page fill and its
  // white label are routed to the brand blue pair (à confirmer); geometry
  // aligned with the reference package (à confirmer).
  pagination: {
    background: "transparent", // à confirmer
    border: "transparent", // à confirmer
    borderWidth: "0", // à confirmer
    text: bureauVeritasColor.brand.primary, // #00049e pager link colour
    activeBackground: bureauVeritasColor.brand.primary, // #00049e (à confirmer)
    activeText: "#ffffff", // white on the brand blue, 13.90:1 (à confirmer)
    activeBorderWidth: "0", // à confirmer
    paddingBlock: "0.25rem", // 4px (à confirmer)
    paddingInline: "0.75rem", // 12px (à confirmer)
    minSize: "2.25rem", // 36px page box (à confirmer)
    fontSize: "1rem", // 16px (à confirmer)
    lineHeight: "1.5rem" // 24px (à confirmer)
  },
  // Breadcrumb: hover and current page read `#00049e`
  // (`.breadcrumb li a:hover,.breadcrumb li span`); separators draw in
  // currentColor. Sizes aligned with the reference package (à confirmer).
  breadcrumb: {
    linkText: bureauVeritasColor.brand.primary, // #00049e breadcrumb links
    text: bureauVeritasColor.slate[800], // #333333 trail text (à confirmer)
    currentText: bureauVeritasColor.brand.primary, // #00049e current page
    separator: bureauVeritasColor.slate[200], // #bbbbbb (à confirmer)
    fontSize: "0.875rem", // 14px (à confirmer)
    lineHeight: "1.5rem", // 24px (à confirmer)
    currentWeight: "700" // à confirmer
  },
  // Alert / notice: the brand publishes no alert accent (Drupal `.messages`
  // is a CMS default and excluded); aligned with the reference theme
  // package's geometry (à confirmer).
  alert: {
    background: "transparent", // à confirmer
    borderTop: "none", // à confirmer
    borderRight: "none", // à confirmer
    borderBottom: "none", // à confirmer
    accentWidth: "0", // à confirmer
    filetWidth: "0.25rem", // 4px ::before accent bar (à confirmer)
    paddingTop: "1rem", // 16px (à confirmer)
    paddingRight: "1rem", // 16px (à confirmer)
    paddingBottom: "1rem", // 16px (à confirmer)
    paddingLeft: "1.25rem", // 20px (clears the left filet) (à confirmer)
    fontSize: "1rem", // 16px (à confirmer)
    lineHeight: "1.5rem" // 24px (à confirmer)
  },
  // Accordion: the brand colours accordion bodies by variant
  // (`.accordion-color-second` = brand blue, `-third` = warm grey) but
  // publishes no trigger-label colour; routed to the default text
  // (à confirmer); geometry aligned with the reference package (à confirmer).
  accordion: {
    text: bureauVeritasColor.slate[800], // #333333 (à confirmer)
    paddingBlock: "0.75rem", // 12px (à confirmer)
    paddingInline: "1rem", // 16px (à confirmer)
    fontSize: "1rem", // 16px (à confirmer)
    fontWeight: "700", // à confirmer
    lineHeight: "1.5rem" // 24px (à confirmer)
  },
  // Tag: the `.tag-states` status chips are 100px-radius bordered pills
  // (`border-radius:100px;padding:0 6px;font-size:10px;font-weight:700`)
  // with the label in `.tag-std` near-black.
  tag: {
    radius: "100px",
    paddingBlock: "0",
    paddingInline: "0.375rem", // 6px
    fontSize: "0.625rem", // 10px
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px (à confirmer)
    minHeight: "1.5rem", // 24px (à confirmer)
    neutralBackground: "transparent",
    neutralText: bureauVeritasColor.slate[800] // #333333 tag label
  },
  // Badge: the brand publishes no badge; aligned with the reference theme
  // package's geometry (à confirmer), filled with the brand blue pair.
  badge: {
    radius: "4px", // à confirmer
    paddingBlock: "0", // à confirmer
    paddingInline: "0.5rem", // 8px (à confirmer)
    fontSize: "0.875rem", // 14px (à confirmer)
    fontWeight: "700", // à confirmer
    lineHeight: "1.5rem", // 24px (à confirmer)
    textTransform: "none", // à confirmer
    minHeight: "1.5rem", // 24px (à confirmer)
    infoBackground: bureauVeritasColor.brand.primary, // #00049e (à confirmer)
    infoText: "#ffffff" // white on the brand blue, 13.90:1 (à confirmer)
  },
  // Checkbox/radio labels share the fluid body size; colour routed to the
  // default text (à confirmer).
  choice: {
    labelFontSize: "1.25rem", // 20px fluid endpoint
    labelLineHeight: "1.25",
    radioLineHeight: "1.25",
    labelColor: bureauVeritasColor.slate[800] // #333333 (à confirmer)
  },
  // Search input follows the general field rule (40px box, 12px padding).
  search: {
    paddingBlock: "0.75rem", // 12px
    paddingInline: "0.75rem", // 12px
    fontSize: "1.25rem", // 20px fluid endpoint
    lineHeight: "1.25"
  },
  // Toggle / switch: the brand publishes no switch; aligned with the
  // reference theme package's geometry (à confirmer).
  toggle: {
    trackPadding: "0", // à confirmer
    lineHeight: "1.5rem", // 24px (à confirmer)
    textColor: bureauVeritasColor.slate[800] // #333333 (à confirmer)
  }
} as const;

// --- semantic (Bureau-Veritas-specific role mapping) -------------------------
const semantic = {
  surface: {
    default: bureauVeritasColor.slate[0], // white page
    subtle: bureauVeritasColor.slate[50], // #eaeaea zebra / alt surface
    raised: bureauVeritasColor.slate[0], // white
    inverse: bureauVeritasColor.brand.primary, // #00049e dark section fill
    overlay: "rgb(51 51 51 / 0.7)" // `.main-menu--overlay` / `.burger-menu--overlay`
  },
  text: {
    primary: bureauVeritasColor.slate[800], // #333333 descriptions (12.63:1)
    secondary: bureauVeritasColor.slate[500], // #706f6f brand grey (5.01:1)
    muted: bureauVeritasColor.slate[400], // #808080 — the brand's own input text grey (`gray`), 3.95:1. Section-9 routing: the brand writes its de-emphasized text in #bbbbbb (1.92:1), which fails every threshold including the 3:1 line floor, so the role takes the brand's next measured text grey rather than a neutral of ours
    inverse: bureauVeritasColor.slate[0], // white on the brand blue (13.90:1)
    link: bureauVeritasColor.brand.primary // #00049e `ul.links a` (13.90:1)
  },
  border: {
    subtle: bureauVeritasColor.slate[50], // #eaeaea hairlines / grid lines
    strong: bureauVeritasColor.slate[500], // #706f6f third-variant borders
    interactive: bureauVeritasColor.brand.primary // #00049e (13.90:1)
  },
  action: {
    primary: bureauVeritasColor.brand.primary, // #00049e `.button-filled`
    primaryHover: bureauVeritasColor.brand.hover, // #000385 derived hover (à confirmer)
    primaryText: "#ffffff", // white on the brand blue (13.90:1)
    secondary: bureauVeritasColor.slate[50], // #eaeaea subtle surface
    secondaryHover: bureauVeritasColor.slate[200], // #bbbbbb measured grey
    secondaryText: bureauVeritasColor.brand.primary, // #00049e `.button-action`
    danger: bureauVeritasColor.system.error // #e60000 derived from brand `red` (à confirmer)
  },
  feedback: {
    success: bureauVeritasColor.system.success,
    warning: bureauVeritasColor.system.warning,
    error: bureauVeritasColor.system.error,
    info: bureauVeritasColor.system.info
  },
  status: {
    pending: bureauVeritasColor.slate[200], // #bbbbbb `.tag-states.pending`
    processing: bureauVeritasColor.brand.bright, // #2c32ff `.tag-states.inprogress`
    completed: bureauVeritasColor.brand.teal, // #00a49a `.tag-states.completed`
    failed: bureauVeritasColor.system.error // #e60000 derived from brand `red` (à confirmer)
  },
  // Categorical palette measured from the brand's nine tag gradients
  // (`.tag-std.c-1-c-N:after` / `.tag-highlighted` border-images, c-1 to
  // c-8; c-9 lime documented in MAPPING.md).
  data: {
    category1: bureauVeritasColor.brand.bright, // #2c32ff c-1 anchor blue
    category2: bureauVeritasColor.brand.sky, // #00b0f0 c-2
    category3: bureauVeritasColor.brand.cyanBlue, // #00b4c4 c-3
    category4: bureauVeritasColor.brand.green, // #82ca9c c-4
    category5: bureauVeritasColor.brand.primary, // #00049e c-5
    category6: bureauVeritasColor.brand.purple, // #9185be c-6
    category7: bureauVeritasColor.brand.lavender, // #b9baff c-7
    category8: bureauVeritasColor.brand.teal // #00a49a c-8
  }
} as const;

/**
 * The Bureau Veritas theme as a Sentropic `TenantTheme`. The `tokens` tree
 * is complete: `foundation` and `semantic` carry Bureau-Veritas-specific
 * values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so the brand deep blue reaches
 * the components (buttons, tabs, pagination, chat bubbles…), not just the
 * elements that read semantic vars directly.
 */
export const bureauVeritasTheme: TenantTheme = {
  id: "bureau-veritas",
  label: "Bureau Veritas",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default bureauVeritasTheme;
