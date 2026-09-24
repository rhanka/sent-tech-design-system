import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * LaTeX typographic identity theme for the Sentropic token structure.
 *
 * LaTeX is not a website: there is no CSS to measure. Lengths below are
 * transcribed from the `article` / `book` class source (`classes.dtx` on
 * CTAN), link colours from the `hyperref` source (`hyperref.dtx` on CTAN),
 * and only font *names* are referenced (Latin Modern family, `lm` package
 * on CTAN) — never font binaries, never class files. Sources are documented
 * in MAPPING.md. Where LaTeX publishes no equivalent for a Sentropic role
 * (inputs, focus, hover, status palette, shadows, motion), the closest
 * coherent value is used and the choice is noted "à confirmer" in MAPPING.md.
 *
 * LICENSING — UPSTREAM ATTRIBUTION. This transcription code is published
 * under MIT (see LICENSE). It cites its sources and claims no right over
 * them:
 *   - Upstream: the LaTeX Project (https://www.latex-project.org),
 *     distributed under the LaTeX Project Public License (LPPL).
 *   - Upstream: the Latin Modern family by the GUST e-foundry
 *     (https://ctan.org/pkg/lm), distributed under the GUST Font License.
 * This package redistributes neither LaTeX class files nor font files; as
 * strings it ships measured lengths, colour values and font names only.
 *
 * LaTeX measured reference (10pt `article`, the Overleaf default):
 *   paper white                       #ffffff   (white stock, no tint)
 *   ink black                         #000000   (default text colour)
 *   \parindent                        15pt      (classes.dtx, 10pt option)
 *   \textwidth (article)              345pt     (classes.dtx, 10pt option)
 *   \baselineskip (normalsize 10pt)   12pt      (classes.dtx \@xpt\@xiipt)
 *   \parskip                          0pt+1pt   (classes.dtx)
 *   \arrayrulewidth / \fboxrule       0.4pt     (classes.dtx)
 *   \fboxsep                          3pt       (classes.dtx)
 *   default \hrule thickness          0.4pt     (tex.web default_rule)
 *   hyperref link / cite / file / url red / green / cyan / magenta
 */

// --- LaTeX raw palette ------------------------------------------------------
const latexColor = {
  // Paper and ink — the whole LaTeX page: white stock, black text.
  paper: "#ffffff", // white stock (article/book default page, Overleaf render)
  ink: "#000000", // default text colour (TeX black)
  // hyperref classic palette (hyperref.dtx `\Hy@temp` defaults, colorlinks).
  link: "#FF0000", // \Hy@temp{link}{red} — hyperref default linkcolor
  cite: "#00FF00", // \Hy@temp{cite}{green} — hyperref default citecolor
  file: "#00FFFF", // \Hy@temp{file}{cyan} — hyperref default filecolor
  url: "#FF00FF", // \Hy@temp{url}{magenta} — hyperref default urlcolor
  // Readable variants produced by the section-9 stop rule (see MAPPING.md).
  readableRed: "#e60000", // stop rule, 1 step from #FF0000 (4.81:1 on white)
  hoverRed: "#cc0000", // stop rule, 2 steps from #FF0000 (5.89:1 on white)
  success: "#107636", // stop rule, 2 steps from base #16a34a (5.73:1 on white)
  warning: "#a75c05", // stop rule, 2 steps from base #d97706 (5.03:1 on white)
  error: "#dc2626", // Sentropic base error (4.83:1 on white — derived, à confirmer)
  info: "#2563eb", // Sentropic base info (5.17:1 on white — derived, à confirmer)
  // Neutral ramp — LaTeX publishes no greys, so these stand-ins for
  // secondary surfaces and hairlines are derived (à confirmer).
  grey: {
    100: "#f5f5f5", // subtle surface tint (derived — à confirmer)
    200: "#e5e5e5", // hairline / hover tint (derived — à confirmer)
    600: "#475569", // secondary text (derived, 7.58:1 — à confirmer)
    500: "#64748b", // muted text (derived, 4.76:1 — à confirmer)
    dark: "#262626" // near-ink slate step (derived — à confirmer)
  },
  // Light tints of the hyperref hues for low-emphasis slots (derived).
  redTint: "#fde8e8", // light red tint (derived — à confirmer)
  redDark: "#800000", // dark red depth step (derived — à confirmer)
  cyanTint: "#e0fbfb", // light cyan tint (derived — à confirmer)
  cyanDark: "#006b75" // darkened file cyan, 6.25:1 (derived — à confirmer)
} as const;

// --- foundation (LaTeX-specific values) -------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the hyperref red family:
    // LaTeX publishes no blue, and red is the primary chromatic signal.
    blue: {
      10: latexColor.redTint, // light red tint (derived — à confirmer)
      60: latexColor.readableRed, // readable hyperref red (measured, stop rule)
      80: latexColor.redDark // dark red depth step (derived — à confirmer)
    },
    // Sentropic "cyan" accent slot mapped onto the hyperref file cyan.
    cyan: {
      10: latexColor.cyanTint, // light cyan tint (derived — à confirmer)
      50: latexColor.file, // #00FFFF \Hy@temp{file}{cyan} (measured)
      70: latexColor.cyanDark // darkened cyan (derived — à confirmer)
    },
    // Sentropic "slate" role family mapped onto paper, ink and the
    // derived neutral ramp (LaTeX publishes no grey scale).
    slate: {
      0: latexColor.paper, // white stock (measured)
      10: latexColor.grey[100], // subtle tint (derived — à confirmer)
      20: latexColor.grey[200], // hairline tint (derived — à confirmer)
      60: latexColor.grey[600], // secondary text (derived — à confirmer)
      80: latexColor.grey.dark, // near-ink step (derived — à confirmer)
      90: latexColor.ink // ink black (measured)
    },
    feedback: {
      success: latexColor.success, // stop rule from base #16a34a
      warning: latexColor.warning, // stop rule from base #d97706
      error: latexColor.error, // base #dc2626 (derived — à confirmer)
      info: latexColor.info // base #2563eb (derived — à confirmer)
    }
  },
  // LaTeX body and titles are both serif (Latin Modern Roman); monospace is
  // Latin Modern Mono. We reference the font *names* only, not the binaries:
  // lmroman / lmsans / lmmono in the `lm` package on CTAN (GUST metrics).
  font: {
    sans: "'Latin Modern Roman', Georgia, 'Times New Roman', serif",
    display: "'Latin Modern Roman', Georgia, 'Times New Roman', serif",
    mono: "'Latin Modern Mono', 'Courier New', Courier, monospace"
  },
  // LaTeX publishes no spacing scale for screens; the standard rem scale is
  // kept aligned with the Sentropic base for component-grid fidelity
  // (derived — à confirmer). Measured TeX lengths (\parindent 15pt,
  // \textwidth 345pt) are documented in MAPPING.md, not transcribed here.
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
  // LaTeX is resolutely unrounded: \fbox boxes and rules have sharp
  // corners, and no rounding primitive exists in the classes (measured).
  radius: {
    none: "0",
    sm: "0", // sharp boxes (measured: no rounding in classes.dtx)
    md: "0", // sharp boxes (measured: no rounding in classes.dtx)
    lg: "0", // sharp boxes (measured: no rounding in classes.dtx)
    pill: "0" // no pill shapes in print (measured: no rounding)
  },
  // Print has no elevation: flat ink on flat paper (derived — à confirmer).
  shadow: {
    subtle: "none",
    medium: "none",
    floating: "none"
  },
  // Print has no motion: state changes are instantaneous
  // (derived — à confirmer).
  motion: {
    fast: "0ms",
    normal: "0ms",
    slow: "0ms",
    easing: "linear"
  },
  // Print has no stacking contexts; kept aligned with the Sentropic base
  // (derived — à confirmer).
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (LaTeX) -------------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // measured: \arrayrulewidth / \fboxrule 0.4pt -> 0.53px, 1px hairline minimum
    thick: "2px" // double-rule emphasis (derived — à confirmer)
  },
  borderStyle: { solid: "solid" }, // TeX rules are solid strokes (measured)
  // LaTeX publishes no control geometry (no CSS): the Sentropic base
  // density is reused explicitly (method section 8, second path).
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.75rem", gap: "0.375rem", minWidth: "2rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.5rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "3rem" }
  },
  // LaTeX typography: normalsize 10pt on a 12pt baseline
  // (classes.dtx `\@setfontsize\normalsize\@xpt\@xiipt`: 10pt TeX = 13.28px
  // = 0.83rem, leading 12/10 = 1.2). Titles are serif and bold
  // (`\bfseries` in `\@startsection`).
  typography: {
    control: { family: "'Latin Modern Sans', system-ui, sans-serif", size: "0.83rem", weight: "700", lineHeight: "1.2", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Latin Modern Roman', Georgia, serif", size: "0.83rem", weight: "400", lineHeight: "1.2", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Latin Modern Roman', Georgia, serif", size: "0.83rem", weight: "700", lineHeight: "1.2", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // hyperref `colorlinks` colours links without underlining them
    // (measured: coloured text, no underline, no decoration).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto"
    }
  },
  disabledOpacity: "0.55", // kept aligned with the Sentropic base (derived — à confirmer)
  transition: { property: "background-color, border-color, color, box-shadow, outline-color", duration: "0ms", easing: "linear" }, // no motion in print (derived — à confirmer)
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" }, // no geometry published; base values reused (derived — à confirmer)
  // LaTeX has no focus indicator (print): the technique is derived — a
  // plain outline, the TeX box idiom (\fbox analogy) — while the colour is
  // the measured hyperref red (4.00:1 on white, passes the 3:1 line floor).
  focus: {
    strategy: "outline", // derived technique (à confirmer)
    width: "2px", // derived (à confirmer)
    offset: "2px", // derived (à confirmer)
    color: latexColor.link, // #FF0000 hyperref red (measured)
    inset: "0"
  },
  // LaTeX boxes are full frames: \fbox / \framebox draw four equal 0.4pt
  // rules (classes.dtx), so fields are `outline`, not filled-underline.
  field: {
    style: "outline",
    fillBg: latexColor.paper, // #ffffff paper (measured)
    underlineColor: latexColor.ink, // unused for outline, kept for completeness
    underlineWidth: "1px", // measured: 0.4pt rule -> 1px hairline minimum
    // Native <select>: redraw the chevron in ink with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23000000' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // LaTeX cards: a thin ink frame on paper, sharp corners, no hover state.
  card: {
    borderWidth: "1px", // measured: 0.4pt rule -> 1px hairline minimum
    lineHeight: "1.2", // measured: normalsize leading 12/10
    hoverBackground: latexColor.paper // #ffffff, no hover in print (derived — à confirmer)
  },
  // LaTeX secondary button = framed ink box (the \fbox idiom): transparent
  // fill, ink border, paper fill on hover (derived — à confirmer).
  buttonSecondary: {
    background: "transparent",
    border: latexColor.ink, // #000000 ink stroke (measured idiom)
    hoverBackground: latexColor.grey[100] // #f5f5f5 (derived — à confirmer)
  },
  // LaTeX section heads: black, bold, serif. The active tab carries that
  // voice with a bottom ink rule in border mode (derived — à confirmer).
  tabs: {
    activeText: latexColor.ink, // #000000 section-head voice (measured idiom)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700", // measured: \bfseries in \@startsection
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.83rem", // measured: normalsize 10pt TeX
    lineHeight: "1.2", // measured: leading 12/10
    indicatorSide: "bottom", // rule under the active title (derived — à confirmer)
    indicatorMode: "border" // a real border rule, the \hrule idiom (derived — à confirmer)
  },
  // LaTeX folio: plain page numbers; the current page is set solid ink.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: latexColor.ink, // #000000
    activeBackground: latexColor.ink, // #000000 solid current page (derived — à confirmer)
    activeText: latexColor.paper, // white on ink
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "0.83rem", // measured: normalsize 10pt TeX
    lineHeight: "1.2" // measured: leading 12/10
  },
  // Running heads / trails: red links, grey trail, black current page.
  breadcrumb: {
    linkText: latexColor.readableRed, // #e60000 readable hyperref red
    text: latexColor.grey[600], // #475569 trail text (derived — à confirmer)
    currentText: latexColor.ink, // #000000 current page
    separator: latexColor.grey[500], // #64748b (derived — à confirmer)
    fontSize: "0.75rem", // 12px small trail (derived — à confirmer)
    lineHeight: "1.2", // measured: leading 12/10
    currentWeight: "700" // current page is emphasised (measured: \bfseries idiom)
  },
  // LaTeX publishes no notice boxes: a transparent box with a left ink
  // filet, sharp corners (derived — à confirmer).
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0.25rem", // 4px ::before accent bar
    paddingTop: "1rem", // 16px
    paddingRight: "1rem", // 16px
    paddingBottom: "1rem", // 16px
    paddingLeft: "1.25rem", // 20px (clears the left filet)
    fontSize: "0.83rem", // measured: normalsize 10pt TeX
    lineHeight: "1.2" // measured: leading 12/10
  },
  // LaTeX sectioning voice: black bold serif trigger.
  accordion: {
    text: latexColor.ink, // #000000 (measured idiom)
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.83rem", // measured: normalsize 10pt TeX
    fontWeight: "700", // measured: \bfseries idiom
    lineHeight: "1.2" // measured: leading 12/10
  },
  // Marginal note chip: sharp corners (no rounding in print), paper-grey
  // fill, ink text (derived — à confirmer).
  tag: {
    radius: "0", // measured: no rounding in the classes
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px (derived — à confirmer)
    fontWeight: "400",
    lineHeight: "1.2", // measured: leading 12/10
    minHeight: "1.5rem", // 24px
    neutralBackground: latexColor.grey[100], // #f5f5f5 (derived — à confirmer)
    neutralText: latexColor.ink // #000000
  },
  // Footnote-mark badge: sharp, solid ink, white mark (derived).
  badge: {
    radius: "0", // measured: no rounding in the classes
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px (derived — à confirmer)
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: latexColor.ink, // #000000 (derived — à confirmer)
    infoText: latexColor.paper // white on ink
  },
  // Choice label in the normalsize serif voice.
  choice: {
    labelFontSize: "0.83rem", // measured: normalsize 10pt TeX
    labelLineHeight: "1.2", // measured: leading 12/10
    radioLineHeight: "1.2", // measured: leading 12/10
    labelColor: latexColor.ink // #000000
  },
  // Search input in the normalsize serif voice.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "0.83rem", // measured: normalsize 10pt TeX
    lineHeight: "1.2" // measured: leading 12/10
  },
  // Toggle label in the normalsize serif voice.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.2", // measured: leading 12/10
    textColor: latexColor.ink // #000000
  }
} as const;

// --- semantic (LaTeX-specific role mapping) ---------------------------------
const semantic = {
  surface: {
    default: latexColor.paper, // white stock (measured)
    subtle: latexColor.grey[100], // #f5f5f5 tint (derived — à confirmer)
    raised: latexColor.paper, // white stock (measured)
    inverse: latexColor.ink, // ink-black inverse plate (derived — à confirmer)
    overlay: "rgb(0 0 0 / 0.5)" // black veil; no backdrop in print (derived — à confirmer)
  },
  text: {
    primary: latexColor.ink, // ink black (measured)
    secondary: latexColor.grey[600], // #475569, 7.58:1 (derived — à confirmer)
    muted: latexColor.grey[500], // #64748b, 4.76:1 (derived — à confirmer)
    inverse: latexColor.paper, // white on ink plates
    link: latexColor.readableRed // #e60000, stop rule 1 step from #FF0000
  },
  border: {
    subtle: latexColor.grey[200], // #e5e5e5 hairline tint (derived — à confirmer)
    strong: latexColor.ink, // rules are ink (measured: 0.4pt rules are black)
    interactive: latexColor.link // #FF0000 hyperref red, 4.00:1 passes 3:1 (measured)
  },
  action: {
    primary: latexColor.readableRed, // #e60000 readable hyperref red
    primaryHover: latexColor.hoverRed, // #cc0000 one step darker (derived — à confirmer)
    primaryText: latexColor.paper, // white on red, 4.81:1
    secondary: latexColor.paper, // paper fill, ink frame
    secondaryHover: latexColor.grey[200], // #e5e5e5 (derived — à confirmer)
    secondaryText: latexColor.ink, // ink on paper, 21:1
    danger: latexColor.error // #dc2626 (derived — à confirmer)
  },
  feedback: {
    success: latexColor.success,
    warning: latexColor.warning,
    error: latexColor.error,
    info: latexColor.info
  },
  status: {
    pending: latexColor.warning,
    processing: latexColor.info,
    completed: latexColor.success,
    failed: latexColor.error
  },
  // LaTeX publishes no categorical data scale: a coherent proposal from the
  // hyperref hues (darkened for legibility on white), ink, and the neutral
  // ramp (derived — à confirmer).
  data: {
    category1: latexColor.readableRed, // #e60000 hyperref link red
    category2: latexColor.success, // #107636 hyperref cite green, darkened
    category3: "#a000a0", // hyperref url magenta, darkened, 6.99:1 (derived — à confirmer)
    category4: latexColor.cyanDark, // #006b75 hyperref file cyan, darkened (derived — à confirmer)
    category5: latexColor.ink, // #000000 ink
    category6: "#525252", // neutral ramp mid, 7.81:1 (derived — à confirmer)
    category7: "#8c8c8c", // neutral ramp light, 3.36:1 (derived — à confirmer)
    category8: latexColor.info // #2563eb xcolor blue (derived — à confirmer)
  }
} as const;

/**
 * The LaTeX typographic identity as a Sentropic `TenantTheme`. The `tokens`
 * tree is complete: `foundation` and `semantic` carry LaTeX-specific values,
 * and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so the LaTeX identity (paper,
 * ink, hairlines, serif voice, sharp boxes) reaches the components, not
 * just the elements that read semantic vars directly.
 */
export const latexTheme: TenantTheme = {
  id: "latex",
  label: "LaTeX",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default latexTheme;
