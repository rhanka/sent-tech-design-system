import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Aéroports de Paris (Groupe ADP) brand theme for the Sentropic token structure.
 *
 * Groupe ADP runs Paris airports under two public hosts which resolve to one
 * site: `adp.fr` answers `301` to `https://www.parisaeroport.fr/`, and that
 * host sits behind an Incapsula/Imperva bot wall (Distil challenge, no usable
 * content over plain fetch). This package is a MEASURED-CLONE mapping built
 * from dated archived copies of the brand's own stylesheets (see MAPPING.md):
 * the current Next.js + Tailwind bundle (2026-07-03) with its `:root` token
 * block (`--tangerine-color`, `--blue-100/600-color`), and the previous
 * corporate theme `ADPInternetTheme/css/desktop.min.css` (2024-01-23) whose
 * named themes spell the brand decision out: `main` = deep blue `#031f73`,
 * `submain` = orange-red, `groupe` = mid blue `#376db3`, `fid` = petrol green
 * `#004650`. Both stylesheets read at a 16px root (no `font-size` on `html`).
 *
 * The headline facts: the action colour is the deep blue, not the tangerine
 * (white on tangerine `#f32518` is 4.13:1, under the 4.5:1 text floor, and the
 * brand's own nomenclature calls the blue `main`); links inherit the body
 * colour and are never underlined (`a{text-decoration:none!important}`); the
 * geometry is squared (`border-radius:0` on buttons, inputs, alerts); focus
 * is a Tailwind ring (`focus-visible:ring-[--focus-ring]`); the current
 * typeface is Montserrat (the 2024 theme used Century Gothic).
 *
 * Aéroports de Paris colour reference:
 *   Main deep blue (action / titles)    #031f73   (theme-main, footer, h1/h2)
 *   Main hover (white-veil derivation)  #354c8f   (derived — à confirmer)
 *   Tangerine (brand accent)            #f32518   (:root --tangerine-color)
 *   Tangerine hover                     #CF1F14   (--tangerine-hover)
 *   Tangerine focus                     #980000   (--tangerine-focus)
 *   Tangerine tint                      #fee5e3   (derived — à confirmer)
 *   Legacy submain red                  #e73f0d   (2024 theme-submain, no role)
 *   Groupe mid blue                     #376db3   (2024 theme-groupe)
 *   Fid petrol green                    #004650   (2024 theme-fid)
 *   Jade / malachite universe greens    #1a604b #428873 #00323c #286e78
 *   Prism icon green                    #5fa691   (--icon-prism-text)
 *   Blue tint scale                     #e6e9f1 #cdd2e3 #b3bcd5 #95a1c2 #818fb9 #6575a8
 *   Body text grey                      #272727   (body color)
 *   Surtitle grey                       #4a4a4a   (--surtitle-text)
 *   Legend grey-blue                    #848fb2   (.text-legend)
 *   Field/filter border grey            #aaaaaa   (.search-input, filters)
 *   Section hairline blue-grey          #d9deea   (.bordered)
 *   Page greys                          #f7f7f7 (current body) #f5f5f5 (fil-ariane)
 *   Alert level-2 yellow                #f3dd6d   (no Sentropic role)
 */

// --- Aéroports de Paris raw colour palette ----------------------------------
const adpColor = {
  // Main deep blue — the brand's colour of action (`theme-main`, footer
  // background, h1/h2, titles and icons on the current site).
  main: {
    primary: "#031f73", // theme-main / --title-color / --icon-color / --blue-focus
    hover: "#354c8f" // derived: primary under the measured 20% white hover veil (à confirmer)
  },
  // Tangerine — the current brand accent (:root token, 24 var() references).
  tangerine: {
    primary: "#f32518", // :root --tangerine-color
    hover: "#CF1F14", // --tangerine-hover
    focus: "#980000", // --tangerine-focus (focus ring colour)
    light: "#fee5e3" // derived 12% tint on white, consistently rounded (à confirmer)
  },
  // Legacy red (2024 `theme-submain`, footer `a:hover`). Superseded by the
  // tangerine on the current site; kept for provenance, with no role.
  legacy: {
    submain: "#e73f0d" // 2024 theme-submain — no Sentropic role
  },
  // Named corporate hues (2024 themes, still live as accents).
  corporate: {
    groupe: "#376db3", // theme-groupe — mid blue (tags, filter labels)
    fid: "#004650" // theme-fid — petrol green
  },
  // Universe greens (current site state tokens, all consumed).
  universe: {
    jadeHover: "#428873", // --jade-hover
    jadeFocus: "#1A604B", // --jade-focus
    malachiteHover: "#286E78", // --malachite-hover
    malachiteFocus: "#00323C", // --malachite-focus
    prism: "#5fa691" // --icon-prism-text
  },
  // Blue tint scale (current :root tokens, all consumed via var()).
  blue: {
    100: "#e6e9f1", // --blue-100-color
    200: "#cdd2e3", // --blue-200-color
    300: "#b3bcd5", // --blue-300-color
    400: "#95a1c2", // --blue-400-color
    500: "#818fb9", // --blue-500-color
    600: "#6575a8" // --blue-600-color
  },
  // Neutral / text / hairline scale (both stylesheets).
  slate: {
    0: "#ffffff", // white — content surfaces, cards, modal, header
    10: "#f7f7f7", // current body background
    20: "#d9deea", // section hairlines (.bordered)
    50: "#f5f5f5", // fil-ariane background
    200: "#aaaaaa", // field and filter borders (.search-input)
    500: "#4a4a4a", // surtitles (--surtitle-text)
    600: "#848fb2", // legends (.text-legend)
    800: "#272727" // body text
  },
  // Alert level-2 background (2024 headerAlert). A pale yellow fill with no
  // Sentropic severity role; kept for provenance, with no role.
  alertLevel2: "#f3dd6d", // bloc_infos_niveau_2 — no Sentropic role
  // System / status colours. The brand publishes no feedback scale, so these
  // are derived values that clear 4.5:1 on white (à confirmer).
  system: {
    success: "#1e7e34", // derived (5.14:1 on white)
    warning: "#9a6700", // derived (4.87:1 on white)
    error: "#c81e1e", // derived (5.74:1 on white)
    info: "#1d4ed8" // derived (6.70:1 on white)
  }
} as const;

// --- foundation (Aéroports de Paris values) ----------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the measured blue ramp: the
    // lightest current tint, the corporate mid blue, the main deep blue.
    blue: {
      10: adpColor.blue[100], // #e6e9f1 lightest blue tint
      60: adpColor.corporate.groupe, // #376db3 corporate mid blue
      80: adpColor.main.primary // #031f73 main deep blue
    },
    // Sentropic "cyan" accent slot carries the tangerine family.
    cyan: {
      10: adpColor.tangerine.light, // #fee5e3 derived tint (à confirmer)
      50: adpColor.tangerine.primary, // #f32518 tangerine accent
      70: adpColor.tangerine.focus // #980000 deep tangerine
    },
    // Sentropic "slate" role family mapped onto the measured neutral scale;
    // the deepest step is the main blue, the darkest measured ink.
    slate: {
      0: adpColor.slate[0], // white
      10: adpColor.slate[10], // #f7f7f7 current page background
      20: adpColor.slate[20], // #d9deea section hairlines
      60: adpColor.slate[600], // #848fb2 legends
      80: adpColor.slate[800], // #272727 body text
      90: adpColor.main.primary // #031f73 darkest measured ink
    },
    feedback: {
      success: adpColor.system.success,
      warning: adpColor.system.warning,
      error: adpColor.system.error,
      info: adpColor.system.info
    }
  },
  // The current site loads Montserrat only (400/700, normal/italic) and sets
  // it as the document face (`html{font-family:var(--font-montserrat)}`); the
  // 2024 theme used Century Gothic (superseded — see MAPPING.md). Arial is the
  // measured historical fallback. Mono is the Tailwind preflight system stack
  // (vendor default retained). Names only, never binaries.
  font: {
    sans: "'Montserrat', Arial, sans-serif",
    display: "'Montserrat', Arial, sans-serif",
    mono: "ui-monospace, 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale (the brand publishes no spacing scale of its
  // own; kept aligned with the Sentropic base — à confirmer).
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
  // Squared geometry: buttons, inputs, alerts and dropdowns all declare
  // `border-radius:0`; full circles (`50%`/`100%`) survive for dots only.
  radius: {
    none: "0",
    sm: "0", // squared controls
    md: "0", // squared buttons / inputs
    lg: "0", // squared cards
    pill: "999px" // circular dots
  },
  // Elevation tinted with the main ink. The brand publishes no shadow scale
  // (the only measured shadow is a tooltip); derived — à confirmer.
  shadow: {
    subtle: "0 1px 2px rgb(3 31 115 / 0.10)",
    medium: "0 4px 12px rgb(3 31 115 / 0.14)",
    floating: "0 8px 24px rgb(3 31 115 / 0.18)"
  },
  // Motion durations measured per component: 150ms links, 200ms buttons and
  // accordion, 500ms `redirection-grille` + `frontTools .mentions` (not the
  // tooltip — see MAPPING.md). Easing `ease-in-out` from the buttons (the
  // current accordion's `ease-out` is a likely framework default — MAPPING.md).
  motion: {
    fast: "150ms",
    normal: "200ms",
    slow: "500ms",
    easing: "ease-in-out"
  },
  // z-index roles are not transposable (the brand uses 2/12/-1 on its own
  // scale); kept aligned with the Sentropic base (à confirmer).
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Aéroports de Paris) -------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // every measured brand border is 1px
    thick: "2px" // Sentropic base (the brand declares only 1px borders — à confirmer)
  },
  borderStyle: { solid: "solid" },
  // Control density. The brand publishes no density scale; the Sentropic base
  // is kept, corroborated three times at 40px (2.5rem): `.search-input`,
  // `.fil-ariane` and `.menu-header` are all `height:40px` (à confirmer).
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.75rem", gap: "0.375rem", minWidth: "2rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.5rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "3rem" }
  },
  // Montserrat everywhere (current face). Buttons are bold with a tight
  // line-height and no transform; labels follow the measured legend; links are
  // never underlined, at rest or on hover.
  typography: {
    control: { family: "'Montserrat', Arial, sans-serif", size: "0.875rem", weight: "700", lineHeight: "1", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Montserrat', Arial, sans-serif", size: "1.0625rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" }, // lineHeight 1.5 is the Sentropic base (à confirmer)
    label: { family: "'Montserrat', Arial, sans-serif", size: "0.875rem", weight: "400", lineHeight: "1.5714", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Brand links inherit the body colour (`a` declares no colour) and are
    // never underlined; hover repaints them (red text on footer/firstPage,
    // petrol on two fullpage CTAs — see MAPPING.md) without underlining either.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "none", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.55", // Sentropic base (the brand consumes .disabled:opacity-50 = .5 plus disabled colour tokens — 0.55 retained as a base-derived arbitration, à confirmer, see MAPPING.md)
  transition: { property: "all", duration: "200ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" }, // Sentropic base; disabled:not-allowed is the consumed .disabled:cursor-not-allowed utility (preflight :disabled{cursor:default} is the vendor default — à confirmer, see MAPPING.md)
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" }, // Sentropic base (à confirmer)
  // FOCUS = a Tailwind RING in the deep tangerine: the current site paints
  // `focus-visible:ring-[--focus-ring]` with `--tw-ring-color`. The consumed
  // focus-scoped widths are `ring-2` (calc 2px) and `ring-offset-2` (2px);
  // the bare `.ring` 3px is unscoped and the 0px is the preflight init
  // (vendor defaults retained, not brand decisions). The colour is an
  // arbitration for `--tangerine-focus` across thirteen equal `--focus-ring`
  // aliases (see MAPPING.md): the accent, also aliased by white.
  focus: {
    strategy: "ring",
    width: "2px",
    offset: "2px",
    color: adpColor.tangerine.focus, // #980000 (8.99:1 on white — documented arbitration, see MAPPING.md)
    inset: "0"
  },
  // Form fields are BOXED (outline): the measured search field is a 1px `#aaa`
  // box, 40px tall. `style: "outline"` draws four equal borders from
  // `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: adpColor.slate[0], // #ffffff
    underlineColor: adpColor.slate[200], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the main deep blue with a 40px
    // right gutter (the brand styles no native select; transcription — à confirmer).
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23031F73' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: squared, 1px hairline (`.bordered`), quiet hover on the page grey.
  // The base publishes no `card` block: lineHeight/hoverBackground are aligned
  // with the reference theme packages' geometry (à confirmer, see MAPPING.md).
  card: {
    borderWidth: "1px", // measured `.bordered` hairline
    lineHeight: "1.5", // reference-package geometry (à confirmer)
    hoverBackground: adpColor.slate[10] // #f7f7f7 page grey (à confirmer)
  },
  // Secondary button = OUTLINED in the main blue: transparent fill, blue
  // border + text (`.theme-white-main`), inverting to a solid main-blue fill
  // on hover with white text (measured `.btn.theme-white-main:hover`; the
  // hover-text inversion has no primitive — see MAPPING.md).
  buttonSecondary: {
    background: "transparent",
    border: adpColor.main.primary, // #031f73 stroke
    hoverBackground: adpColor.main.primary // #031f73 measured hover inversion
  },
  // Tabs: the brand publishes no tab component (empty greps cited in
  // MAPPING.md). Active tab = bold main-blue label, bottom indicator filet —
  // transcription of the primary (à confirmer).
  tabs: {
    activeText: adpColor.main.primary, // #031f73 (à confirmer)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px (à confirmer)
    paddingInline: "1rem", // 16px (à confirmer)
    fontSize: "1rem", // 16px (à confirmer)
    lineHeight: "1.5rem", // 24px (à confirmer)
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // Pagination: the brand publishes no pagination component. Borderless
  // main-blue links; active page = filled main blue with white text —
  // transcription of the primary (à confirmer).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: adpColor.main.primary, // #031f73 (à confirmer)
    activeBackground: adpColor.main.primary, // #031f73 (à confirmer)
    activeText: "#ffffff", // white on the main blue (14.51:1) (à confirmer)
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px (à confirmer)
    paddingInline: "0.75rem", // 12px (à confirmer)
    minSize: "2.25rem", // 36px (à confirmer)
    fontSize: "1rem", // 16px (à confirmer)
    lineHeight: "1.5rem" // 24px (à confirmer)
  },
  // Breadcrumb: the `.fil-ariane` bar (40px tall, 17px text, `#f5f5f5` fill)
  // with main-blue links, body-grey trail and grey separators.
  breadcrumb: {
    linkText: adpColor.main.primary, // #031f73
    text: adpColor.slate[800], // #272727 trail text
    currentText: adpColor.main.primary, // #031f73 current page
    separator: adpColor.slate[200], // #aaaaaa
    fontSize: "1.0625rem", // 17px
    lineHeight: "2.5rem", // 40px
    currentWeight: "700" // unmeasured (`.fil-ariane` declares no weight — à confirmer)
  },
  // Alert / notice: the squared `.headerAlert` bar (10px gutters, 12px text,
  // white level-1 fill, no accent filet).
  alert: {
    background: adpColor.slate[0], // #ffffff level-1 fill
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0", // no accent bar measured
    paddingTop: "0.625rem", // 10px
    paddingRight: "0.625rem", // 10px
    paddingBottom: "0.625rem", // 10px
    paddingLeft: "1.25rem", // 20px (the measured 7.5% is not transposable — à confirmer)
    fontSize: "0.75rem", // 12px
    lineHeight: "1.5rem" // 24px (à confirmer)
  },
  // Accordion / details: the current accordion fills `--Accordion-bg`
  // (blue-200 `#cdd2e3` or white, both measured); the trigger text is the
  // body grey — transcription (à confirmer).
  accordion: {
    text: adpColor.slate[800], // #272727 (à confirmer)
    paddingBlock: "0.75rem", // 12px (à confirmer)
    paddingInline: "1rem", // 16px (à confirmer)
    fontSize: "1rem", // 16px (à confirmer)
    fontWeight: "700", // (à confirmer)
    lineHeight: "1.5rem" // 24px (à confirmer)
  },
  // Tag: measured uppercase 12px/18px label in corporate blue on a squared
  // chip; the chip fill transcribes the pale breadcrumb grey (à confirmer).
  tag: {
    radius: "0",
    paddingBlock: "0.25rem", // 4px (à confirmer)
    paddingInline: "0.5rem", // 8px (à confirmer)
    fontSize: "0.75rem", // 12px
    fontWeight: "400",
    lineHeight: "1.125rem", // 18px
    minHeight: "1.5rem", // 24px (à confirmer)
    neutralBackground: adpColor.slate[50], // #f5f5f5 (à confirmer)
    neutralText: adpColor.corporate.groupe, // #376db3 tag text
    textTransform: "uppercase"
  },
  // Badge: squared filled badge in the main blue with white text —
  // transcription of the primary (à confirmer).
  badge: {
    radius: "0",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px (à confirmer)
    fontSize: "0.875rem", // 14px (à confirmer)
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px (à confirmer)
    textTransform: "none",
    minHeight: "1.5rem", // 24px (à confirmer)
    infoBackground: adpColor.main.primary, // #031f73 (à confirmer)
    infoText: "#ffffff" // white on the main blue (14.51:1) (à confirmer)
  },
  // Checkbox/radio label: corporate-blue labels (`.label-filter label` in
  // `listeProjets`; the actus twin at `#e73f0d` stays live — arbitration, see
  // MAPPING.md), 17px inherited size.
  choice: {
    labelFontSize: "1.0625rem", // 17px inherited (à confirmer)
    labelLineHeight: "1.5rem", // 24px (à confirmer)
    radioLineHeight: "1.5rem", // 24px (à confirmer)
    labelColor: adpColor.corporate.groupe // #376db3
  },
  // Search input: the measured `.search-input` (1px `#aaa` box, 40px tall,
  // 17px inherited text); paddings transcribed (à confirmer).
  search: {
    paddingBlock: "0.375rem", // 6px (à confirmer)
    paddingInline: "0.75rem", // 12px (à confirmer)
    fontSize: "1.0625rem", // 17px inherited (à confirmer)
    lineHeight: "1.5rem" // 24px (à confirmer)
  },
  // Toggle / switch label: the brand publishes none (empty greps cited in
  // MAPPING.md) — transcription (à confirmer).
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px (à confirmer)
    textColor: adpColor.slate[800] // #272727 (à confirmer)
  }
} as const;

// --- semantic (Aéroports de Paris role mapping) ------------------------------
const semantic = {
  surface: {
    default: adpColor.slate[0], // white — content surfaces (arbitration, see MAPPING.md)
    subtle: adpColor.slate[10], // #f7f7f7 current page background
    raised: adpColor.slate[0], // white — cards, modal content, header
    inverse: adpColor.main.primary, // #031f73 footer fill
    overlay: "rgb(0 0 0 / 0.6)" // modal backdrop (.modal-landing)
  },
  text: {
    primary: adpColor.slate[800], // #272727 body (14.94:1 on white)
    secondary: adpColor.slate[500], // #4a4a4a surtitles (8.86:1 on white — documented arbitration, double declaration, see MAPPING.md)
    muted: adpColor.slate[600], // #848fb2 legends (3.20:1 on white — documented arbitration)
    inverse: adpColor.slate[0], // white on dark / coloured surfaces
    link: adpColor.slate[800] // #272727 inherited, never underlined (hover repaints red)
  },
  border: {
    subtle: adpColor.slate[200], // #aaaaaa hairlines (2.32:1 — decorative, see MAPPING.md)
    strong: adpColor.slate[600], // #848fb2 (3.20:1)
    interactive: adpColor.main.primary // #031f73 (14.51:1)
  },
  action: {
    primary: adpColor.main.primary, // #031f73 theme-main
    primaryHover: adpColor.main.hover, // #354c8f derived veil (à confirmer)
    primaryText: "#ffffff", // white on the main blue (14.51:1)
    secondary: adpColor.blue[100], // #e6e9f1 lightest blue tint
    secondaryHover: adpColor.blue[200], // #cdd2e3
    secondaryText: adpColor.main.primary, // #031f73 (11.95:1 on secondary)
    danger: adpColor.system.error // #c81e1e derived (à confirmer)
  },
  feedback: {
    success: adpColor.system.success,
    warning: adpColor.system.warning,
    error: adpColor.system.error,
    info: adpColor.system.info
  },
  status: {
    pending: adpColor.system.warning,
    processing: adpColor.system.info,
    completed: adpColor.system.success,
    failed: adpColor.system.error
  },
  // Categorical data-vis palette built only from measured brand hues: the
  // tangerine accent, the main blue, the corporate greens and blues, and the
  // universe greens. No official 8-colour scale exists, so the SET is a
  // coherent proposal from measured hues (see MAPPING.md, "à confirmer").
  data: {
    category1: adpColor.tangerine.primary, // #f32518 tangerine
    category2: adpColor.main.primary, // #031f73 main blue
    category3: adpColor.corporate.fid, // #004650 petrol green
    category4: adpColor.corporate.groupe, // #376db3 corporate blue
    category5: adpColor.universe.jadeFocus, // #1A604B jade
    category6: adpColor.universe.malachiteHover, // #286E78 malachite
    category7: adpColor.universe.jadeHover, // #428873 light jade
    category8: adpColor.universe.prism // #5fa691 prism green
  }
} as const;

/**
 * The Aéroports de Paris theme as a Sentropic `TenantTheme`. The `tokens` tree
 * is complete: `foundation` and `semantic` carry brand-specific values, and
 * the `component` layer is REBUILT from this theme's own semantic/foundation
 * via `createComponent` — so the main blue reaches the components (buttons,
 * tabs, pagination, chat bubbles…), not just the elements that read semantic
 * vars directly.
 */
export const aeroportsDeParisTheme: TenantTheme = {
  id: "aeroports-de-paris",
  label: "Aéroports de Paris",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default aeroportsDeParisTheme;
