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
 *   Pink (brand / focus border / indicators)     #e4575e   (--pink)
 *   Pink dark (primary fills / hover)            #c9444b   (--pink-dark)
 *   Pink tint (secondary hover / tints)           #fbe5e7   (--pink-tint)
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
    draftGrey: "#f2f3f3", // sampled Draft badge bg (otter 1791840827 @ 966,396; badge cluster n=109 median, centre exact #f5f2f2)
    approvalYellow: "#fcfcc4", // sampled Business Approval badge bg (@ 975,433; badge cluster n=146 median, centre exact #fcfac3)
    closedOrange: "#fdecd5", // sampled Application Closed badge bg (@ 996,475; badge cluster n=106 quant=(256,240,208) median, centre exact #faebd4 — pass-2 review)
    activeGreen: "#dffeeb", // sampled Active badge bg (@ 970,511; badge cluster n=86 median, centre exact #e0feec)
    completedBlue: "#dce9fc", // sampled Completed badge bg (@ 956,629; badge cluster n=141 quant=(224,240,256) median, centre exact #d9eafd — pass-2 review)
    postedPurple: "#eee5fd", // sampled Posted badge bg (collab 1791840502 @ 1011,543; badge cluster n=140 median)
    navPill: "#d84761", // sampled active nav pill (1791840827 @ 100,308; pill cluster n=327 quant=(224,64,96) median, centre exact #d84760 — pass-2 review)
    banner: "#fe9900", // sampled impersonation banner (17-34-30 @ 813,20; cluster n=625 median, centre exact #fe9900)
    allChip: "#0e0d42" // sampled dark "All" chip (17-14-37 @ 240,168; chip cluster n=321 quant=(16,16,64) median, centre exact #0f0c47 — pass-2 review)
  },
  // System / status colours. Only error is a measured literal (#c0392b);
  // the text tones are darkened from the sampled badge tints so the RENDERED
  // pairs reach WCAG AA — badge CSS mixes each tone at 14% over white, so the
  // foregrounds are validated against that mix, not plain white (sol review).
  system: {
    success: "#177245", // Active green darkened (4.86 on its badge mix, 5.95 on white)
    error: "#c0392b", // measured error literal (fills + danger button: white on it is 5.44)
    errorText: "#a93226", // error darkened for TEXT on its badge mix (5.29 on the mix, 6.62 on white)
    warning: "#9a5200", // Closed orange darkened for TEXT on its badge mix (4.80 on the mix, 5.86 on white)
    info: "#2f5da8", // Completed blue darkened (5.25 on its mix, 6.46 on white)
    pending: "#7d6600", // Business Approval yellow darkened for AA on white (7.37)
    // Accessible interactive rose: --pink-dark darkened so text set in it
    // reaches AA on white (6.26), page (6.04), subtle (5.87) and tint (5.21).
    // Used for link text/hover, secondary text and the primary hover fill
    // (white on it is 6.26). Derived for contrast — à confirmer.
    interact: "#a83a44"
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
  // FIELD density (shared control scale). The md padding and the sm inline
  // padding are measured (`.field input`: 12px block / 16px inline — the
  // components read md.paddingBlock for the vertical padding and
  // sm.paddingInline for the horizontal padding, so sm.paddingInline carries
  // the measured 16px); other sm/lg leaves (heights, minimum widths, gaps,
  // font sizes, sm/lg block and lg inline paddings) are unmeasured for
  // fields — à confirmer (kept from the button metrics so the shape stays
  // coherent). Buttons never read this scale (they read buttonDensity below).
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.65rem", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.9rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.75rem", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.95rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0.95rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1rem" }
  },
  // BUTTON density (F9 override): the button reads ONLY this scale, so the
  // measured marketing-site `.btn` geometry never leaks into the fields.
  // Measured: default `.btn` padding .85rem 1.75rem at .95rem; small `.btn`
  // .65rem 1.3rem at .9rem; full-width `.btn` .95rem 1.5rem at 1rem.
  buttonDensity: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.65rem", paddingInline: "1.3rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.9rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.85rem", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "0.95rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0.95rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1rem" }
  },
  // Montserrat 700 for controls/labels, Poppins for body/fields.
  typography: {
    control: { family: "'Montserrat', 'Segoe UI', system-ui, sans-serif", size: "0.95rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Poppins', 'Segoe UI', system-ui, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Poppins', 'Segoe UI', system-ui, sans-serif", size: "0.875rem", weight: "600", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Resting underline (departure: no underline observed on the measured
    // sources — à confirmer): link/body contrast is 1.38:1 inside
    // secondary-tone Typography/captions, so colour alone cannot distinguish
    // links (WCAG 1.4.1). Hover thickens since rest and hover share the same
    // accessible-rose text colour.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.12em", decorationOffsetHover: "0.15em"
    }
  },
  disabledOpacity: "0.55", // not tokenised publicly (à confirmer)
  transition: { property: "background-color, border-color, color, outline-color", duration: "150ms", easing: "ease" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // Influnified FOCUS = a thick OUTLINE plus a pink border. The measured
  // outline (`3px solid var(--pink-tint)`, no offset) only reaches 1.13–3.0:1
  // against the surfaces it sits on, so the COLOUR departs from the measured
  // source: --ink reaches ≥ 3:1 on white (18.97), page (18.29), subtle (17.79),
  // primary (3.99) and primary-hover (3.03). Width/offset stay measured (sol review).
  focus: {
    strategy: "outline",
    width: "3px",
    offset: "0",
    color: influnifiedColor.ink.ink, // #070541 --ink (departure: --pink-tint fails non-text contrast)
    inset: "0"
  },
  // Influnified form fields are BOXED (outline): white fill, 1px
  // --border-strong stroke, 12px radius (measured `.field input`).
  // `style: "outline"` makes the builder draw four equal borders; the corner
  // overrides pin the measured 12px (the builder default is the 20px card
  // radius) and the stroke is re-mapped to --border-strong after the build
  // (the builder wires outline strokes to border.subtle).
  field: {
    style: "outline",
    fillBg: influnifiedColor.canvas.surface, // #ffffff
    radiusTop: "0.75rem", // 12px measured `.field input` corners
    radiusBottom: "0.75rem", // 12px measured `.field input` corners
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
    activeBackground: influnifiedColor.pink.dark, // #c9444b filled active page (white on it is 4.76)
    activeText: influnifiedColor.canvas.surface, // white on pink-dark
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "0.95rem", // 15.2px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb treatment not observed (à confirmer); accessible rose links,
  // ink current. The trail can sit on subtle surfaces, where --pink-dark is
  // 4.46:1 — the accessible rose (#a83a44) is 5.87:1 there (pass-2 review).
  breadcrumb: {
    linkText: influnifiedColor.system.interact, // #a83a44 (departure: --pink-dark is 4.46:1 on subtle)
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
    infoBackground: influnifiedColor.pink.dark, // #c9444b (white on it is 4.76; --pink is 3.61:1)
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
    inverse: influnifiedColor.ink.ink, // #070541 (≈ sampled dark "All" chip #0e0d42)
    overlay: "rgb(7 5 65 / 0.6)" // modal backdrop (ink tint)
  },
  text: {
    primary: influnifiedColor.ink.ink, // #070541 (--ink headings)
    secondary: influnifiedColor.ink.body, // #4a4869 (--body)
    muted: influnifiedColor.ink.muted, // #6e6c8a (--muted)
    inverse: influnifiedColor.canvas.surface, // white on dark / pink surfaces
    link: influnifiedColor.system.interact // #a83a44 (departure: --pink-dark is 4.46:1 on subtle; this is 5.87)
  },
  border: {
    subtle: influnifiedColor.canvas.border, // #ece8f0 (--border)
    strong: influnifiedColor.canvas.borderStrong, // #ddd7e6 (--border-strong)
    interactive: influnifiedColor.pink.main // #e4575e (measured focus border-color)
  },
  action: {
    // Text-bearing primary surfaces use the darker --pink-dark step: white on
    // #e4575e is 3.61:1, white on #c9444b is 4.76:1 (sol review). The brand
    // pink stays on non-text surfaces (focus border, indicators).
    primary: influnifiedColor.pink.dark, // #c9444b (departure: --pink is 3.61:1 with white text)
    primaryHover: influnifiedColor.system.interact, // #a83a44 (white on it is 6.26; measured hover #c9444b is now the rest fill)
    primaryText: influnifiedColor.canvas.surface, // white text on pink-dark (4.76 rest, 6.26 hover)
    secondary: influnifiedColor.canvas.surface, // #ffffff (à confirmer — no secondary button observed)
    secondaryHover: influnifiedColor.pink.tint, // #fbe5e7
    secondaryText: influnifiedColor.system.interact, // #a83a44 (departure: #c9444b is 3.96:1 on the hover tint; this is 5.21)
    danger: influnifiedColor.system.error // #c0392b measured literal (white on it is 5.44)
  },
  feedback: {
    success: influnifiedColor.system.success,
    warning: influnifiedColor.system.warning,
    error: influnifiedColor.system.errorText, // text tone (badge text sits on the 14% mix: 5.29)
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
const builtComponent = createComponent(semantic, foundation);

// Two rendered states need a correction the builder inputs cannot express,
// so they are re-mapped on the built layer (emitted as component tokens and
// consumed by Link / Input / Select / Textarea — verified in the test):
//  - link hover: the builder wires both the flat hoverText AND the anatomy
//    hover text to action.primary (#c9444b), which is 4.46:1 on subtle
//    surfaces. Link.svelte prefers the anatomy variable over the flat leaf,
//    so both are re-mapped to the accessible rose (#a83a44, 5.87:1 on
//    subtle — pass-2 review).
//  - field stroke: the builder wires boxed inputs to border.subtle (#ece8f0),
//    but the measured `.field input` stroke is --border-strong (#ddd7e6).
const component = {
  ...builtComponent,
  link: {
    ...builtComponent.link,
    hoverText: influnifiedColor.system.interact, // #a83a44 (builder default action.primary is 4.46:1 on subtle)
    anatomy: {
      ...builtComponent.link.anatomy,
      states: {
        ...builtComponent.link.anatomy.states,
        hover: {
          ...builtComponent.link.anatomy.states?.hover,
          text: influnifiedColor.system.interact // #a83a44: the consumer resolves this var first (pass-2 review)
        }
      }
    }
  },
  control: {
    ...builtComponent.control,
    anatomy: {
      ...builtComponent.control.anatomy,
      field: {
        ...builtComponent.control.anatomy.field,
        borderTop: `1px solid ${influnifiedColor.canvas.borderStrong}`,
        borderRight: `1px solid ${influnifiedColor.canvas.borderStrong}`,
        borderBottom: `1px solid ${influnifiedColor.canvas.borderStrong}`,
        borderLeft: `1px solid ${influnifiedColor.canvas.borderStrong}`
      }
    }
  }
} as const;

export const influnifiedTheme: TenantTheme = {
  id: "influnified",
  label: "Influnified",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component
  }
};

export default influnifiedTheme;
