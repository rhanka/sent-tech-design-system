import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Influnified theme for the Sentropic token structure.
 *
 * All values below are measured from the PUBLIC Influnified marketing site
 * (custom properties `--pink`, `--ink`, … in the saved homepage) and, for
 * app-only colours, sampled from app screenshots. We only reference the font
 * *names* (Montserrat, Poppins) here, never font binaries. Sources are
 * documented in MAPPING.md. Where the site has no direct equivalent for a
 * Sentropic role, the closest token is used and the choice is noted
 * "à confirmer" in MAPPING.md. No dark theme was observed (site or app), so
 * this theme ships `mode: "light"` only, as theme-canada/quebec do.
 *
 * Influnified colour reference (public site CSS custom properties):
 *   Pink (brand / primary buttons / active nav)  #e4575e   (--pink)
 *   Pink dark (hover)                            #c9444b   (--pink-dark)
 *   Pink tint (focus ring / tints)               #fbe5e7   (--pink-tint)
 *   Tint (subtle surfaces)                       #fdf6f6   (--tint)
 *   Ink (headings / inverse)                     #070541   (--ink)
 *   Body (text)                                  #4a4869   (--body)
 *   Muted                                        #6e6c8a   (--muted)
 *   Page (warm off-white background)             #fffaf5   (--page)
 *   Surface                                      #ffffff   (--surface)
 *   Border / strong border             #ece8f0 / #ddd7e6   (--border / --border-strong)
 *   Panel gradient  linear-gradient(120deg, #ffe3e3 0%, #e7e5ff 100%)  (--gradient-panel)
 *   Radii  1.25rem / 1.75rem                     (--radius / --radius-lg)
 *   Shadows  0 10px 40px rgba(7,5,65,.06) / 0 16px 44px rgba(7,5,65,.1)
 *   Error literal                                #c0392b
 */

// --- Influnified raw colour palette (public site tokens) --------------------
const influnifiedColor = {
  // Brand pink — primary actions, active nav pill, links-on-focus.
  pink: {
    main: "#e4575e", // --pink (brand accent, primary buttons, active nav)
    dark: "#c9444b", // --pink-dark (hover/pressed)
    tint: "#fbe5e7", // --pink-tint (focus ring, light tints)
    mist: "#fdf6f6" // --tint (subtle surfaces)
  },
  // Warm neutral ink scale (headings → body → muted).
  ink: {
    ink: "#070541", // --ink (headings)
    body: "#4a4869", // --body (text)
    muted: "#6e6c8a" // --muted
  },
  // Canvas scale: warm off-white page, white raised surfaces.
  canvas: {
    page: "#fffaf5", // --page (background, warm off-white)
    surface: "#ffffff", // --surface
    border: "#ece8f0", // --border
    borderStrong: "#ddd7e6" // --border-strong
  },
  // Sidebar panel gradient stops (both literals measured in --gradient-panel).
  panel: {
    from: "#ffe3e3", // --gradient-panel stop 0%
    to: "#e7e5ff" // --gradient-panel stop 100%
  },
  // App-only sampled tones (screenshots, all à confirmer — see MAPPING.md).
  app: {
    draftGrey: "#f2f3f3", // sampled Draft badge bg (otter 1791840827 @ 966,396)
    approvalYellow: "#fcfcc4", // sampled Business Approval badge bg (@ 975,433)
    closedOrange: "#fcecd5", // sampled Application Closed badge bg (@ 996,475)
    activeGreen: "#dffeeb", // sampled Active badge bg (@ 970,511)
    completedBlue: "#dceafc", // sampled Completed badge bg (@ 956,629)
    postedPurple: "#eee5fd", // sampled Posted badge bg (collab 1791840502 @ 1011,543)
    navPill: "#d94762", // sampled active nav pill (1791840827 @ 100,308)
    banner: "#fe9900", // sampled impersonation banner (17-34-30 @ 813,20)
    allChip: "#0e0d44" // sampled dark "All" chip (17-14-37 @ 240,168)
  },
  // System / status colours. Only error is a measured literal (#c0392b);
  // the text tones are darkened from the sampled badge tints to keep
  // WCAG AA on white (à confirmer).
  system: {
    success: "#177245", // Active green darkened for AA on white
    error: "#c0392b", // measured error literal
    warning: "#a85a00", // Application Closed orange darkened for AA on white
    info: "#2f5da8", // Completed blue darkened for AA on white
    pending: "#7d6600" // Business Approval yellow darkened for AA on white
  }
} as const;

// --- foundation (Influnified-specific values) --------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the brand pink (the primary
    // action family, as quebec maps "blue" onto its primary blue).
    blue: {
      10: influnifiedColor.pink.tint, // lightest pink tint
      60: influnifiedColor.pink.main, // #e4575e primary
      80: influnifiedColor.pink.dark // #c9444b hover
    },
    // Influnified has no cyan; the closest accent is the sidebar panel
    // lavender/purple family (measured gradient stop + sampled Posted tone).
    cyan: {
      10: influnifiedColor.panel.to, // #e7e5ff gradient stop (measured)
      50: "#8f84d8", // mid lavender (derived — à confirmer)
      70: "#55518f" // dark lavender (derived — à confirmer)
    },
    // Sentropic "slate" role family mapped onto the warm neutral scale.
    slate: {
      0: influnifiedColor.canvas.surface, // white
      10: influnifiedColor.pink.mist, // #fdf6f6 subtle tint
      20: influnifiedColor.canvas.border, // #ece8f0 subtle borders
      60: influnifiedColor.ink.muted, // #6e6c8a muted text
      80: influnifiedColor.ink.body, // #4a4869 body text
      90: influnifiedColor.ink.ink // #070541 headings / darkest
    },
    feedback: {
      success: influnifiedColor.system.success,
      warning: influnifiedColor.system.warning,
      error: influnifiedColor.system.error,
      info: influnifiedColor.system.info
    }
  },
  // Influnified ships "Montserrat" for headings/controls and "Poppins" for
  // body/fields (--font-heading / --font-body). We reference the font *names*
  // only, not the binaries. No monospace face observed (à confirmer).
  font: {
    sans: "'Poppins', 'Segoe UI', system-ui, sans-serif",
    display: "'Montserrat', 'Segoe UI', system-ui, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity).
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
  // Influnified is very round: pill CTAs, 12px inputs, 1.25rem/1.75rem cards.
  radius: {
    none: "0",
    sm: "0.75rem", // 12px — measured .field input radius
    md: "1.25rem", // --radius — cards
    lg: "1.75rem", // --radius-lg — large panels
    pill: "999px" // measured .btn radius — pill CTAs, nav pill, chips
  },
  // Soft ink-tinted elevation, measured on the public site.
  shadow: {
    subtle: "0 10px 40px rgba(7, 5, 65, 0.06)", // --shadow-soft
    medium: "0 16px 44px rgba(7, 5, 65, 0.1)", // --shadow-lift
    floating: "0 16px 44px rgba(7, 5, 65, 0.1)" // no third elevation measured — reuses --shadow-lift (à confirmer)
  },
  // Motion durations are not tokenised publicly; kept aligned with the
  // Sentropic base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not brand-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Influnified) --------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // measured .field input 1px stroke
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Control density from the measured marketing-site controls: default
  // `.btn` padding .85rem 1.75rem at .95rem; small `.btn` .65rem 1.3rem at
  // .9rem; full-width `.btn` .95rem 1.5rem at 1rem.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.65rem", paddingInline: "1.3rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.9rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.85rem", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.95rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0.95rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1rem" }
  },
  // Montserrat 700 for controls/labels, Poppins for body/fields.
  typography: {
    control: { family: "'Montserrat', 'Segoe UI', system-ui, sans-serif", size: "0.95rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Poppins', 'Segoe UI', system-ui, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Poppins', 'Segoe UI', system-ui, sans-serif", size: "0.875rem", weight: "600", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Link underline treatment not observed on the measured sources (à confirmer).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.08em", decorationOffsetHover: "0.15em"
    }
  },
  disabledOpacity: "0.55", // not tokenised publicly (à confirmer)
  transition: { property: "background-color, border-color, color, outline-color", duration: "150ms", easing: "ease" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // Influnified FOCUS = a thick pink-tint OUTLINE plus a pink border
  // (measured: `.field input:focus { outline: 3px solid var(--pink-tint);
  // border-color: var(--pink); }` — no outline-offset declared).
  focus: {
    strategy: "outline",
    width: "3px",
    offset: "0",
    color: influnifiedColor.pink.tint, // #fbe5e7 --pink-tint
    inset: "0"
  },
  // Influnified form fields are BOXED (outline): white fill, 1px
  // --border-strong stroke, 12px radius (measured `.field input`).
  // `style: "outline"` makes the builder draw four equal borders.
  field: {
    style: "outline",
    fillBg: influnifiedColor.canvas.surface, // #ffffff
    underlineColor: influnifiedColor.canvas.borderStrong, // --border-strong (measured input stroke; unused for outline)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in brand pink with a 40px right
    // gutter (chevron colour not measured — à confirmer).
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23e4575e' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Influnified cards: large radius (--radius/--radius-lg), 1px light border,
  // soft ink-tinted shadow; hover tint unmeasured (à confirmer).
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: influnifiedColor.pink.mist // #fdf6f6
  },
  // No secondary button observed on the measured sources; secondary = white
  // fill, pink stroke + dark-pink text, pink-tint hover (à confirmer).
  buttonSecondary: {
    background: influnifiedColor.canvas.surface, // #ffffff
    border: influnifiedColor.pink.main, // #e4575e stroke
    hoverBackground: influnifiedColor.pink.tint // #fbe5e7 fill on hover
  },
  // App segmented control (Brief/Creators/Results) + underline sub-tabs
  // (Legal): active segment = ink label on white; track = pink tint;
  // underline variant = bottom pink filet (colours/weights à confirmer).
  tabs: {
    activeText: influnifiedColor.ink.ink, // #070541
    activeBackground: influnifiedColor.canvas.surface, // #ffffff
    inactiveBackground: influnifiedColor.pink.tint, // #fbe5e7 track
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.95rem", // 15.2px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // underline sub-tab variant sits on the bottom edge
    indicatorMode: "border" // a real bottom border (not a box-shadow filet)
  },
  // Pagination treatment not observed (à confirmer); neutral pagination with
  // a pink filled active page, coherent with the brand.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: influnifiedColor.ink.body, // #4a4869 page links
    activeBackground: influnifiedColor.pink.main, // #e4575e filled active page
    activeText: influnifiedColor.canvas.surface, // white on pink
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "0.95rem", // 15.2px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb treatment not observed (à confirmer); pink links, ink current.
  breadcrumb: {
    linkText: influnifiedColor.pink.dark, // #c9444b (AA on white)
    text: influnifiedColor.ink.muted, // #6e6c8a trail text
    currentText: influnifiedColor.ink.ink, // #070541 current page
    separator: influnifiedColor.canvas.borderStrong, // #ddd7e6
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem", // 24px
    currentWeight: "700" // current page is emphasised
  },
  // Alert treatment not observed (à confirmer); coloured left accent filet.
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
    fontSize: "0.95rem", // 15.2px
    lineHeight: "1.5rem" // 24px
  },
  // Accordion treatment not observed (à confirmer); ink bold trigger.
  accordion: {
    text: influnifiedColor.ink.ink, // #070541 trigger label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.95rem", // 15.2px
    fontWeight: "700",
    lineHeight: "1.5rem" // 24px
  },
  // App status/filter chips are fully rounded pills (observed).
  tag: {
    radius: "999px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    fontWeight: "500",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: influnifiedColor.pink.tint, // #fbe5e7
    neutralText: influnifiedColor.ink.body // #4a4869
  },
  // App status badges are fully rounded pills (observed); info = brand pink.
  badge: {
    radius: "999px",
    paddingBlock: "0",
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    fontWeight: "600",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: influnifiedColor.pink.main, // #e4575e
    infoText: influnifiedColor.canvas.surface // white
  },
  // Choice label treatment not observed (à confirmer); ink body label.
  choice: {
    labelFontSize: "0.9375rem", // 15px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: influnifiedColor.ink.body // #4a4869
  },
  // Search input follows the boxed field (measured `.field input` metrics).
  search: {
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.5rem" // 24px
  },
  // Toggle treatment not observed (à confirmer); body text label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: influnifiedColor.ink.body // #4a4869
  }
} as const;

// --- semantic (Influnified-specific role mapping) ---------------------------
const semantic = {
  surface: {
    default: influnifiedColor.canvas.page, // #fffaf5 warm off-white page
    subtle: influnifiedColor.pink.mist, // #fdf6f6 tint
    raised: influnifiedColor.canvas.surface, // #ffffff cards
    inverse: influnifiedColor.ink.ink, // #070541 (≈ sampled dark "All" chip #0e0d44)
    overlay: "rgb(7 5 65 / 0.6)" // modal backdrop (ink tint)
  },
  text: {
    primary: influnifiedColor.ink.ink, // #070541 (--ink headings)
    secondary: influnifiedColor.ink.body, // #4a4869 (--body)
    muted: influnifiedColor.ink.muted, // #6e6c8a (--muted)
    inverse: influnifiedColor.canvas.surface, // white on dark / pink surfaces
    link: influnifiedColor.pink.dark // #c9444b --pink-dark (AA on white; brand pink #e4575e is 3.61:1)
  },
  border: {
    subtle: influnifiedColor.canvas.border, // #ece8f0 (--border)
    strong: influnifiedColor.canvas.borderStrong, // #ddd7e6 (--border-strong)
    interactive: influnifiedColor.pink.main // #e4575e (measured focus border-color)
  },
  action: {
    primary: influnifiedColor.pink.main, // #e4575e (measured .btn)
    primaryHover: influnifiedColor.pink.dark, // #c9444b (measured .btn:hover)
    primaryText: influnifiedColor.canvas.surface, // white text on pink
    secondary: influnifiedColor.canvas.surface, // #ffffff (à confirmer — no secondary button observed)
    secondaryHover: influnifiedColor.pink.tint, // #fbe5e7
    secondaryText: influnifiedColor.pink.dark, // #c9444b (AA on white)
    danger: influnifiedColor.system.error // #c0392b measured literal
  },
  feedback: {
    success: influnifiedColor.system.success,
    warning: influnifiedColor.system.warning,
    error: influnifiedColor.system.error,
    info: influnifiedColor.system.info
  },
  status: {
    pending: influnifiedColor.system.pending, // Business Approval yellow darkened
    processing: influnifiedColor.system.info, // Completed blue darkened
    completed: influnifiedColor.system.success, // Active green darkened
    failed: influnifiedColor.system.error
  },
  // Categorical data-vis palette built from the brand hues. The site publishes
  // no 8-colour scale, so this is a coherent proposal drawn from the measured
  // pink/ink scale plus the sampled app badge tones (see MAPPING.md, "à confirmer").
  data: {
    category1: influnifiedColor.pink.main, // brand pink
    category2: influnifiedColor.pink.dark, // pink dark
    category3: influnifiedColor.system.success, // app green
    category4: influnifiedColor.system.info, // app blue
    category5: "#8f84d8", // app lavender (derived — à confirmer)
    category6: influnifiedColor.system.warning, // app orange
    category7: influnifiedColor.ink.body, // body plum
    category8: influnifiedColor.ink.muted // muted lavender-grey
  }
} as const;

/**
 * The Influnified theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Influnified-specific values, and
 * the `component` layer is REBUILT from this theme's own semantic/foundation
 * via `createComponent` — so the brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 *
 * No dark theme was observed (site or app): this theme ships `mode: "light"`
 * only, as theme-canada/quebec do for themes without a measured dark mode.
 * The sidebar panel gradient (`--gradient-panel`) has no token slot in the
 * token model, so it is recorded in MAPPING.md (à confirmer) rather than
 * encoded here.
 */
export const influnifiedTheme: TenantTheme = {
  id: "influnified",
  label: "Influnified",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default influnifiedTheme;
