import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Replicate theme for the Sentropic token structure.
 *
 * All values below are MEASURED from Replicate's PUBLIC site CSS
 * (replicate.com — the compiled `root-*.css`). Replicate is built on the Radix
 * UI colour scales (gray / tomato / green / yellow / indigo) plus a small
 * `branding-*` palette (red → pink → blush gradient), with a strictly
 * monochrome, SQUARE, high-contrast aesthetic: the primary action is BLACK on
 * WHITE, links are near-black and turn the brand red on hover, and saturated
 * hues are reserved for status / data-vis. We only reference the font *names*
 * (`basier-square`, `rb-freigeist-neue`, `jetbrains-mono`) here, never the font
 * binaries. Sources & provenance are documented in MAPPING.md. Where Replicate
 * publishes no direct equivalent for a Sentropic role, the closest measured
 * token is used and the choice is noted "à confirmer" in MAPPING.md.
 *
 * Replicate colour reference (light theme — measured `--gray-*` Radix sRGB fallbacks,
 * `branding-*` brand hexes, Radix accent solids, Tailwind form defaults):
 *   White (surface default)                #ffffff
 *   Gray 1 (subtle alt surface)            #fcfcfc
 *   Gray 2 (subtle surface / control hover)#f9f9f9
 *   Gray 3 (hover fill / secondary hover)  #f0f0f0
 *   Gray 6 (default border)                #d9d9d9
 *   Gray 9 (muted / placeholder text)      #8d8d8d
 *   Gray 11 (secondary text)               #646464
 *   Gray 12 (primary text / focus ring)    #202020
 *   Gray 1 dark (inverse surface)          #111111
 *   Pure black (primary button)            #000000
 *   Field border (Tailwind gray-500)       #6b7280
 *   Input focus ring (Tailwind blue-600)   #2563eb  (form fields only — see MAPPING)
 *   Branding red (brand accent / link hover)#ea2804
 *   Branding pinkDarker (gradient mid)     #e54fe2
 *   Branding pink (gradient bright)        #ff6bfc
 *   Branding blush (gradient end)          #f97e82
 *   Branding blushDarker                   #ed686c
 *   Branding yellow                        #f6f47f
 *   Tomato 9 / 11 (danger solid / AA text) #e54d2e / #d13415
 *   Green 9 / 11 (success solid / AA text) #30a46c / #218358
 *   Yellow 9 / 11 (warning solid / AA text)#ffe629 / #9e6c00
 *   Indigo 9 / 11 (info solid / AA text)   #3e63dd / #3a5bc7
 *
 * Brand gradient: #ea2804 → #e54fe2 → #ed686c (the animated `.r8-btn--brand`).
 * TenantTheme has no gradient token, so the stops live in `data.category1/5/...`
 * and are documented in MAPPING.md ("Signatures anatomiques").
 */

// --- Replicate raw colour palette (measured public CSS) --------------------
const replicateColor = {
  // Radix gray scale (light sRGB fallbacks) — the monochrome backbone.
  grey: {
    0: "#ffffff", // pure white — surface default
    50: "#fcfcfc", // gray-1 — subtle alt surface
    75: "#f9f9f9", // gray-2 — subtle surface / control hover fill
    100: "#f0f0f0", // gray-3 — hover fill / secondary-button hover
    200: "#d9d9d9", // gray-6 — default component border / divider
    400: "#8d8d8d", // gray-9 — muted / placeholder text
    700: "#646464", // gray-11 — secondary text
    900: "#202020", // gray-12 — primary text / focus ring / interactive black
    950: "#111111", // gray-1 (dark) — inverse / dark canvas surface
    1000: "#000000" // pure black — iconic Replicate primary button
  },
  // Field-specific neutrals (Tailwind form defaults measured on inputs).
  field: {
    border: "#6b7280", // Tailwind gray-500 — measured input/select/textarea border
    focus: "#2563eb" // Tailwind blue-600 — measured input focus ring (fields only)
  },
  // Replicate `branding-*` palette — the brand red→pink→blush gradient.
  brand: {
    red: "#ea2804", // branding-red — THE brand accent (link hover, gradient start, brand ring)
    pinkDarker: "#e54fe2", // branding-pinkDarker — gradient mid
    pink: "#ff6bfc", // branding-pink — gradient bright
    blush: "#f97e82", // branding-blush — gradient soft
    blushDarker: "#ed686c", // branding-blushDarker — gradient end
    yellow: "#f6f47f", // branding-yellow
    redDark: "#c1370f" // darker brand red (derived — à confirmer)
  },
  // Radix tomato — danger / destructive.
  tomato: {
    main: "#e54d2e", // tomato-9 — solid tomato (danger fill / data-vis)
    text: "#d13415", // tomato-11 — AA danger text on white
    light: "#feebe7" // tomato-3 — light red tint
  },
  // Radix green — success.
  green: {
    main: "#30a46c", // green-9 — solid green (data-vis)
    text: "#218358" // green-11 — AA success text on white
  },
  // Radix yellow — warning.
  yellow: {
    main: "#ffe629", // yellow-9 — solid yellow (data-vis)
    text: "#9e6c00" // yellow-11 — AA warning/amber text on white
  },
  // Radix indigo — the bluish "info" accent (used in info badges / callouts).
  indigo: {
    main: "#3e63dd", // indigo-9 — solid indigo (info / data-vis)
    text: "#3a5bc7", // indigo-11 — AA info text on white
    dark: "#3358d4", // indigo-10 — darker interactive
    light: "#edf2fe" // indigo-3 — light indigo tint
  },
  // System / status colours (Radix steps, AA-checked on white where used as text).
  system: {
    success: "#218358", // green-11
    error: "#d13415", // tomato-11
    warning: "#9e6c00", // yellow-11 (amber; brand yellow #ffe629 fails contrast as text)
    info: "#3a5bc7" // indigo-11
  }
} as const;

// --- foundation (Replicate-specific values) --------------------------------
const foundation = {
  color: {
    // Replicate has no "blue" interactive accent (its interactive colour is
    // BLACK); the nearest systematic blue is the Radix indigo used for info.
    blue: {
      10: replicateColor.indigo.light, // indigo-3 light tint
      60: replicateColor.indigo.main, // indigo-9 (info accent)
      80: replicateColor.indigo.dark // indigo-10 (darker)
    },
    // Replicate has no cyan; the signature non-neutral accent is the brand red
    // (the branding red→pink gradient), so the Sentropic "cyan" slot maps to it.
    cyan: {
      10: replicateColor.tomato.light, // light red/blush tint (tomato-3)
      50: replicateColor.brand.red, // #ea2804 brand red accent
      70: replicateColor.brand.redDark // darker brand red (à confirmer)
    },
    // Sentropic "slate" role family mapped onto the Radix gray scale.
    slate: {
      0: replicateColor.grey[0], // white
      10: replicateColor.grey[50], // gray-1 subtle alt surface
      20: replicateColor.grey[200], // gray-6 default border
      60: replicateColor.grey[400], // gray-9 muted text / strong border
      80: replicateColor.grey[700], // gray-11 secondary text
      90: replicateColor.grey[900] // gray-12 primary text
    },
    feedback: {
      success: replicateColor.system.success,
      warning: replicateColor.system.warning,
      error: replicateColor.system.error,
      info: replicateColor.system.info
    }
  },
  // Replicate ships "Basier Square" (UI / body), "RB Freigeist Neue" (editorial
  // display headings) and "JetBrains Mono" (code). These are the exact
  // @font-face family names measured in the site CSS. Font *names* only, never
  // binaries.
  font: {
    sans: "'basier-square', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'rb-freigeist-neue', 'basier-square', ui-sans-serif, system-ui, -apple-system, sans-serif",
    mono: "'jetbrains-mono', ui-monospace, 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', monospace"
  },
  // Standard 4px-based rem spacing scale (Tailwind grid; aligned with the
  // Sentropic base for component-grid fidelity).
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
  // Replicate aesthetic is SQUARE / crisp: inputs are border-radius 0 (measured),
  // controls use a hairline 2–4px, cards/popovers ~6px, only chips/avatars/pills
  // read as pills. (Measured component radii: 0, .125rem, .25rem, .375rem, 9999px.)
  radius: {
    none: "0",
    sm: "0.125rem", // 2px — small focus radius (measured)
    md: "0.25rem", // 4px — button / tabs (near-square; fields forced to 0 below)
    lg: "0.375rem", // 6px — cards / popovers / segmented containers (measured)
    pill: "9999px" // chips / avatars / pill badges (measured `--round` / rounded-full)
  },
  // Replicate elevation: soft, neutral, low-opacity shadows. `medium` is the
  // measured `.r8-btn--brand:hover` Tailwind shadow-md; others "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.06)",
    medium: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    floating: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"
  },
  // Replicate motion: the measured `.r8-btn--brand` transition (.15s, standard
  // ease); other durations kept aligned with the Sentropic base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Replicate-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Replicate) --------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Replicate control density (measured `.r8-btn--sm/md/lg`): button gap .5rem,
  // input padding .5rem .75rem, icon-button md 36px / lg 48px.
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0.375rem", paddingInline: "0.625rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "1rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0.75rem", paddingInline: "1rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" }
  },
  // Replicate typography: Basier Square throughout. UI labels read at 14px /
  // medium; body & fields at 16px / regular (measured input font-size 1rem).
  typography: {
    control: { family: "'basier-square', sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'basier-square', sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'basier-square', sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Replicate prose links are near-black, UNDERLINED at rest with a 4px
    // underline offset (measured `.r8-link-underline`), and turn the brand red
    // on hover. The colour shift is carried by `text.link` + a hover state; the
    // decoration signature (underline + 4px offset) lives here.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "auto", decorationOffset: "4px",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "4px"
    }
  },
  disabledOpacity: "0.5", // dimmed disabled controls (à confirmer)
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" }, // (à confirmer)
  // Replicate FOCUS = a box-shadow RING in near-black gray-12 #202020 (the
  // measured technique on buttons, links and select items: `outline-offset: 2px`
  // + a 2px gray-12 ring), NOT a coloured native outline. (Raw form inputs use a
  // Tailwind blue #2563eb ring — documented as a field-only divergence in MAPPING.)
  focus: {
    strategy: "ring",
    width: "2px",
    offset: "2px",
    color: replicateColor.grey[900], // #202020 near-black focus ring
    inset: "0"
  },
  // Replicate form fields are BOXED & SQUARE (outline): white fill, a 1px grey
  // border and border-radius 0 (measured `input/select/textarea`). `style:
  // "outline"` draws four equal borders from `surface.default` + `border.subtle`;
  // `radiusTop/Bottom: "0"` forces the square corners regardless of `radius.md`.
  field: {
    style: "outline",
    fillBg: replicateColor.grey[0], // #ffffff measured input fill
    underlineColor: replicateColor.field.border, // #6b7280 measured field border (kept for completeness)
    underlineWidth: "1px",
    radiusTop: "0", // square — measured border-radius:0
    radiusBottom: "0", // square — measured border-radius:0
    // Native <select>: redraw the chevron in near-black with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23202020' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Replicate card: a 1px grey border + 6px radius, subtle grey hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: replicateColor.grey[75] // #f9f9f9
  },
  // Replicate secondary button = OUTLINED: white fill, a 1px near-black border +
  // near-black text, with a subtle grey fill on hover (measured `.r8-btn--outlined`).
  buttonSecondary: {
    background: replicateColor.grey[0], // #ffffff
    border: replicateColor.grey[900], // #202020 near-black stroke
    hoverBackground: replicateColor.grey[100] // #f0f0f0 subtle fill on hover
  },
  // Replicate tabs: active tab = near-black label with a 2px near-black bottom
  // indicator (monochrome), inactive tabs grey. (Metrics à confirmer.)
  tabs: {
    activeText: replicateColor.grey[900], // #202020
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "500",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom", // indicator on the bottom edge
    indicatorMode: "border" // a real 2px bottom border (near-black)
  },
  // Replicate pagination: borderless grey text links; active page = filled black.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: replicateColor.grey[700], // #646464 grey link text
    activeBackground: replicateColor.grey[1000], // #000000 filled active page
    activeText: replicateColor.grey[0], // white on black
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    minSize: "2rem", // 32px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Replicate breadcrumb: grey links, near-black current page, grey separators.
  breadcrumb: {
    linkText: replicateColor.grey[700], // #646464
    text: replicateColor.grey[700], // #646464 trail text
    currentText: replicateColor.grey[900], // #202020 current page
    separator: replicateColor.grey[400], // #8d8d8d
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "500" // current page is emphasised
  },
  // Replicate callout / note: a coloured LEFT accent filet on a transparent box.
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
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Replicate accordion: a near-black medium summary trigger.
  accordion: {
    text: replicateColor.grey[900], // #202020 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "0", // flush trigger
    fontSize: "0.875rem", // 14px
    fontWeight: "500", // medium
    lineHeight: "1.25rem" // 20px
  },
  // Replicate chip / badge: a low-radius subtle-grey chip (measured 6px badge radius).
  tag: {
    radius: "0.375rem", // 6px (measured `.r8-tabs__badge`)
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    minHeight: "1.25rem", // 20px
    neutralBackground: replicateColor.grey[100], // #f0f0f0
    neutralText: replicateColor.grey[900] // #202020
  },
  // Replicate badge: a low-radius filled badge (info = indigo).
  badge: {
    radius: "0.375rem", // 6px
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: replicateColor.indigo.main, // #3e63dd
    infoText: replicateColor.grey[0] // white
  },
  // Replicate checkbox/radio label.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: replicateColor.grey[900] // #202020
  },
  // Replicate search input (measured input metrics).
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Replicate toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: replicateColor.grey[900] // #202020
  }
} as const;

// --- semantic (Replicate-specific role mapping) ----------------------------
const semantic = {
  surface: {
    default: replicateColor.grey[0], // white
    subtle: replicateColor.grey[75], // #f9f9f9 (gray-2) — subtle surface / control hover
    raised: replicateColor.grey[0], // white
    inverse: replicateColor.grey[950], // #111111 dark canvas (gray-1 dark)
    overlay: "rgb(0 0 0 / 0.6)" // modal backdrop (black tint)
  },
  text: {
    primary: replicateColor.grey[900], // #202020 (gray-12)
    secondary: replicateColor.grey[700], // #646464 (gray-11)
    muted: replicateColor.grey[400], // #8d8d8d (gray-9 placeholder)
    inverse: replicateColor.grey[0], // white on dark / coloured surfaces
    link: replicateColor.grey[900] // #202020 near-black link (turns brand red on hover)
  },
  border: {
    subtle: replicateColor.grey[200], // #d9d9d9 (gray-6 default border)
    strong: replicateColor.field.border, // #6b7280 (measured field/Tailwind border)
    interactive: replicateColor.grey[900] // #202020 near-black focus / interactive
  },
  action: {
    primary: replicateColor.grey[1000], // #000000 iconic black primary button
    primaryHover: "#383838", // dark-grey hover (à confirmer)
    primaryText: replicateColor.grey[0], // white text on black
    secondary: replicateColor.grey[0], // #ffffff secondary surface (outlined button)
    secondaryHover: replicateColor.grey[100], // #f0f0f0
    secondaryText: replicateColor.grey[900], // #202020 near-black text
    danger: replicateColor.system.error // #d13415 (tomato-11, AA)
  },
  feedback: {
    success: replicateColor.system.success,
    warning: replicateColor.system.warning,
    error: replicateColor.system.error,
    info: replicateColor.system.info
  },
  status: {
    pending: replicateColor.system.warning,
    processing: replicateColor.system.info,
    completed: replicateColor.system.success,
    failed: replicateColor.system.error
  },
  // Categorical data-vis palette built from the Replicate brand gradient stops +
  // the Radix accent solids. Replicate publishes no 8-colour sequential data-vis
  // scale, so this is a coherent proposal (see MAPPING.md, "à confirmer"). The
  // brand gradient #ea2804 → #e54fe2 → #ed686c lives in category1 / 5 / ...
  data: {
    category1: replicateColor.brand.red, // #ea2804 brand red (gradient start)
    category2: replicateColor.indigo.main, // #3e63dd indigo
    category3: replicateColor.green.main, // #30a46c green
    category4: replicateColor.yellow.main, // #ffe629 yellow
    category5: replicateColor.brand.pinkDarker, // #e54fe2 brand pink (gradient mid)
    category6: replicateColor.brand.blush, // #f97e82 brand blush
    category7: replicateColor.grey[700], // #646464 neutral grey
    category8: replicateColor.brand.pink // #ff6bfc bright pink
  }
} as const;

/**
 * The Replicate theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Replicate-specific values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Replicate brand reaches the components (buttons,
 * tabs, pagination, chat bubbles…), not just the elements that read semantic
 * vars directly.
 */
export const replicateTheme: TenantTheme = {
  id: "replicate",
  label: "Replicate",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default replicateTheme;
