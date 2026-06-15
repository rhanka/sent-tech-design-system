import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Mirego (mirego.com — the Montréal digital product studio) theme for the
 * Sentropic token structure.
 *
 * Mirego ships no published design-token file; the values below are MEASURED
 * from the live site's served CSS (https://www.mirego.com, asset bundle
 * `mirego-*.css`, inspected directly). We only reference the font *names* here
 * ("Almirego" and "Almirego Display" — Mirego's own bespoke typefaces, plus the
 * "Newsreader" editorial serif used for italic accents), never font binaries.
 * Sources and the full mapping table are in MAPPING.md.
 *
 * Mirego's identity is MINIMAL / EDITORIAL: near-black ink on a warm cream
 * canvas, generous whitespace, soft rounded corners, and a single periwinkle
 * accent. The signature palette (measured frequency in the bundle):
 *   Ink (text / action / brand)        #050307  body color, 142 occurrences
 *   Cream (signature surface)          #f7edde  --primary-color, 37 occurrences
 *   White (page background)            #ffffff  --page-background, 103 occurrences
 *   Periwinkle accent (signature)      #b5a6ff  ::selection + accent fills, 30×
 *   Orange-red accent (pop / error)    #ff4524  highlight/CTA pop, 24×
 *   Deep red (error border)            #d52a0b  input error border-color, 9×
 *   Near-black grey                    #211e25  dark surface tone, 8×
 *   Mid grey                           #a5a4a6  input border (rgb 165), 6×
 *   Slate grey text                    #5b5b5b  secondary text, 6×
 *   Charcoal                           #242424  dark UI, 5×
 *   Faint border grey                  #e0dfe0  hairline border, 3×
 *   Warm taupe                         #948e85  muted warm grey, 3×
 * Where Sentropic needs a role Mirego never colours (feedback states, a data-vis
 * ramp), the closest measured hue is used (the orange-red/teal pops, or a
 * restrained system colour) and the choice is noted "à confirmer" in MAPPING.md.
 */

// --- Mirego raw colour palette (measured from live served CSS) --------------
const miregoColor = {
  // The "brand" is near-black ink. Mirego uses it for body text, primary
  // actions (the filled CTA `background:#050307;color:#fff`), and brand strokes.
  ink: "#050307", // body{color:#050307} — text, action, brand (142×, dominant)
  white: "#ffffff", // --page-background:#fff — page background (103×)
  // Cream is Mirego's signature surface tone (the warm editorial canvas).
  cream: "#f7edde", // --primary-color:#f7edde — signature surface/background (37×)
  // Periwinkle is Mirego's one decorative accent (::selection + accent fills).
  periwinkle: "#b5a6ff", // ::selection{background:#b5a6ff} + accent fills (30×)
  // Orange-red is the editorial "pop" (highlight links / accent CTA / error).
  orange: "#ff4524", // color/background:#ff4524 editorial pop (24×)
  red: "#d52a0b", // input error border-color:#d52a0b (9×) — error
  // Measured warm/neutral grey scale (each value from a real element).
  grey: {
    100: "#e0dfe0", // rgb(224,223,224) — faint hairline border
    200: "#c6beb2", // rgb(198,190,178) — warm card border (border:1px solid #c6beb2)
    300: "#a5a4a6", // rgb(165,164,166) — input border (border:1px solid #a5a4a6)
    400: "#948e85", // rgb(148,142,133) — muted warm grey
    500: "#5b5b5b", // rgb(91,91,91) — secondary text
    700: "#242424", // rgb(36,36,36) — charcoal dark UI
    800: "#211e25" // rgb(33,30,37) — near-black dark surface tone
  },
  // Mirego's editorial secondary hues, measured from quote gradients / accents.
  teal: "#2e6d5d", // color:#2e6d5d quote/editorial teal
  tealDeep: "#113b31", // --quote-gradient-right-color:#113b31 deep teal
  tealSoft: "#83c3b0", // --quote-gradient-left-color:#83c3b0 soft teal
  violet: "#6d6499", // background:#6d6499 editorial violet
  blueTint: "#eaf0f6", // --column-background:#eaf0f6 cool tint surface
  // Mirego shows no published success/warning/info hues. These are restrained
  // values chosen to stay legible (WCAG AA) on white/cream without breaking the
  // editorial palette; success/warning reuse the measured teal/orange family.
  // Noted "à confirmer" — no measured Mirego source for the semantic roles.
  system: {
    success: "#2e6d5d", // measured editorial teal, reused as success — à confirmer
    error: "#d52a0b", // measured input error red — à confirmer (form error only)
    warning: "#9a6700", // dark amber, AA on white/cream — à confirmer (no source)
    info: "#6d6499" // measured editorial violet, reused as info — à confirmer
  }
} as const;

// --- foundation (Mirego-specific values) ------------------------------------
const foundation = {
  color: {
    // Mirego has no brand blue. The Sentropic "blue" role family (action /
    // primary / link) is mapped onto the ink scale — the Mirego primary action
    // IS near-black ink. (à confirmer: Mirego has no blue at all.)
    blue: {
      10: miregoColor.cream, // #f7edde lightest warm tint
      60: miregoColor.ink, // #050307 primary action / link (Mirego ink)
      80: miregoColor.ink // #050307 (no darker step — ink is terminal)
    },
    // Mirego's one decorative accent is periwinkle. The Sentropic "cyan" accent
    // slot carries that signature lavender rather than a literal cyan.
    cyan: {
      10: miregoColor.cream, // #f7edde light warm tint
      50: miregoColor.periwinkle, // #b5a6ff Mirego's signature accent
      70: miregoColor.violet // #6d6499 deeper editorial violet
    },
    // Sentropic "slate" role family mapped onto Mirego's warm neutral scale.
    slate: {
      0: miregoColor.white, // #ffffff white
      10: miregoColor.cream, // #f7edde cream surface
      20: miregoColor.grey[100], // #e0dfe0 hairline / subtle border
      60: miregoColor.grey[500], // #5b5b5b secondary text
      80: miregoColor.ink, // #050307 primary text
      90: miregoColor.ink // #050307 darkest (terminal ink)
    },
    feedback: {
      success: miregoColor.system.success,
      warning: miregoColor.system.warning,
      error: miregoColor.system.error,
      info: miregoColor.system.info
    }
  },
  // Mirego ships two bespoke typefaces: "Almirego" (the body/UI grotesque, 57
  // uses, served as Almirego Light/Regular/Bold) and "Almirego Display" (the
  // editorial display face for headings, 48 uses). The site's measured fallback
  // is `serif`. "Newsreader" is an editorial serif used for italic accents. We
  // reference the *names* only. Mono is not part of Mirego — the Sentropic mono
  // stack is kept.
  font: {
    sans: "Almirego, 'Almirego Fallback', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif",
    display: "'Almirego Display', 'Almirego Display Fallback', Almirego, Newsreader, Georgia, 'Times New Roman', serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale. Mirego's grid is whitespace-heavy but its raw
  // spacing steps are not strongly tokenised publicly; kept aligned with the
  // Sentropic base 4px scale ("à confirmer" exact steps).
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
  // Mirego is SOFTLY ROUNDED. Inputs/small controls measure border-radius 6px
  // (--border-radius default); CTAs measure 9.5px; cards and panels use generous
  // 24px / 32px / 44px radii; pills use 500px. We map the control radii to the
  // measured small/medium values and keep the pill for the large rounded shapes.
  radius: {
    none: "0",
    sm: "6px", // --border-radius:6px measured on inputs/small controls
    md: "9.5px", // --cta-border-radius:9.5px measured on the CTA button
    lg: "24px", // border-radius:24px measured on cards/panels (dominant large)
    pill: "500px" // border-radius:500px measured on Mirego's pill shapes
  },
  // Mirego elevation is soft and editorial — it relies on cream/white contrast
  // and whitespace more than heavy shadows. Measured overlays sit on rgba(5,3,7)
  // ink at low alpha. Kept conservative and ink-tinted ("à confirmer" exact).
  shadow: {
    subtle: "0 1px 2px rgb(5 3 7 / 0.06)",
    medium: "0 4px 12px rgb(5 3 7 / 0.10)",
    floating: "0 8px 24px rgb(5 3 7 / 0.14)"
  },
  // Mirego animates with smooth, slightly long eases. Measured transitions use
  // 0.3s cubic-bezier(.215,.61,.355,1) (an ease-out-cubic) on inputs and 0.3s
  // ease on accent fills. Encoded here; durations otherwise kept near the base.
  motion: {
    fast: "150ms",
    normal: "300ms", // measured input/accent transition duration (.3s)
    slow: "500ms", // measured longer transition (.5s ease-in on accents)
    easing: "cubic-bezier(0.215, 0.61, 0.355, 1)" // measured ease-out-cubic
  },
  // z-index roles are not Mirego-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Mirego) -----------------------------------------
  // Mirego borders are thin 1px hairlines; some emphasis strokes measure 1.5px
  // (border:1.5px solid #050307) and a few heavy editorial frames use 4px.
  borderWidth: {
    none: "0",
    thin: "1px", // Mirego hairline (border:1px solid …)
    thick: "2px" // emphasis (source 1.5px–4px — à confirmer)
  },
  borderStyle: { solid: "solid" },
  // Mirego control density. Measured form inputs are 64px tall with generous
  // padding (12px / 10px 16px); the small CTA measures 32px. md targets a
  // comfortable ~48px control with roomy horizontal padding (Mirego is airy).
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "3rem", paddingBlock: "0.625rem", paddingInline: "1.25rem", gap: "0.625rem", minWidth: "3rem", fontSize: "1rem" },
    lg: { controlHeight: "4rem", paddingBlock: "0.75rem", paddingInline: "1.5rem", gap: "0.75rem", minWidth: "4rem", fontSize: "1.125rem" }
  },
  // Mirego typography = Almirego for UI/body, Almirego Display for headings. The
  // measured CTA uses Almirego Display 17px weight 400 with letter-spacing .34px;
  // body inputs use Almirego 18px. Labels measured ~0.9375rem (--label-font-size).
  typography: {
    control: { family: "'Almirego Display', Almirego, Georgia, serif", size: "1.0625rem", weight: "400", lineHeight: "1.2", letterSpacing: "0.02em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "Almirego, 'Helvetica Neue', Helvetica, Arial, sans-serif", size: "1.125rem", weight: "400", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "Almirego, 'Helvetica Neue', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.4", letterSpacing: "0.01em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Mirego links are NOT underlined at rest; the editorial hover affordance is
    // an underline appearing on hover (measured link styling, weight 700 accents).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.06em", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.4", // Mirego dims disabled controls (minimal, near-ghost)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "300ms", easing: "cubic-bezier(0.215, 0.61, 0.355, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.75rem" },
  // Mirego FOCUS = a crisp solid OUTLINE offset off the control. Measured
  // :focus-visible{outline-style:solid;outline-width:2px;outline-offset:4px}
  // (some controls use offset:3px). We encode the ink-coloured outline strategy.
  focus: {
    strategy: "outline",
    width: "2px", // measured outline-width:2px
    offset: "4px", // measured outline-offset:4px
    color: miregoColor.ink, // #050307 — Mirego focuses in ink
    inset: "0"
  },
  // Mirego form fields are BOXED (outline): a translucent white fill, a thin warm
  // grey hairline border, and a SOFT 6px radius. Measured input:
  // `border:1px solid rgba(165,164,166,.3); border-radius:6px;
  // background:rgba(255,255,255,.5); color ink`. Error state border = #d52a0b.
  field: {
    style: "outline",
    fillBg: miregoColor.white, // #ffffff (measured rgba(255,255,255,.5) translucent)
    underlineColor: miregoColor.grey[300], // #a5a4a6 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in ink with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23050307' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Mirego cards: a soft rounded panel with a warm hairline border and a faint
  // cream hover tint (Mirego separates editorial cards with #c6beb2/#e0dfe0
  // hairlines on white/cream).
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: miregoColor.cream // #f7edde faint warm hover tint
  },
  // Mirego secondary button = OUTLINED (transparent fill, ink hairline border +
  // ink text, faint cream fill on hover). The editorial alternative to the
  // filled ink primary.
  buttonSecondary: {
    background: "transparent",
    border: miregoColor.ink, // #050307 hairline stroke
    hoverBackground: miregoColor.cream // #f7edde faint warm fill on hover
  },
  // Mirego tabs / filters: active tab = ink bold label with an ink underline
  // (the minimal indicator), transparent fill. (--active::after{background:#050307})
  tabs: {
    activeText: miregoColor.ink, // #050307
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.875rem", // 14px
    fontSize: "0.9375rem", // 15px (--label-font-size analogue)
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom", // ink underline on the bottom edge
    indicatorMode: "border" // a real bottom hairline (measured ::after bar)
  },
  // Mirego pagination: borderless ink text links; active page = filled ink pill
  // with cream/white text (the editorial equivalent of the ink CTA).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: miregoColor.ink, // #050307 link text
    activeBackground: miregoColor.ink, // #050307 filled active page
    activeText: miregoColor.white, // white on ink
    activeBorderWidth: "0",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.25rem" // 20px
  },
  // Mirego breadcrumb: ink links, warm grey trail, ink current page, warm grey
  // separators — all Almirego.
  breadcrumb: {
    linkText: miregoColor.ink, // #050307
    text: miregoColor.grey[500], // #5b5b5b trail text
    currentText: miregoColor.ink, // #050307 current page
    separator: miregoColor.grey[400], // #948e85
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "700" // current page is emphasised (Mirego links are bold)
  },
  // Mirego notice / alert: a soft rounded box — a thin warm hairline accent on a
  // cream/white box. The severity accent is a coloured left filet (kept slim).
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0", // left border collapses (filet instead)
    filetWidth: "0.1875rem", // 3px ::before accent bar
    paddingTop: "1rem", // 16px
    paddingRight: "1.125rem", // 18px
    paddingBottom: "1rem", // 16px
    paddingLeft: "1.25rem", // 20px (clears the left filet)
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.5rem" // 24px
  },
  // Mirego accordion / disclosure: an ink, bold summary trigger, soft-rounded,
  // hairline separated (Mirego's expandable editorial sections).
  accordion: {
    text: miregoColor.ink, // #050307 summary label
    paddingBlock: "1rem", // 16px
    paddingInline: "0", // accordion rows are flush to the column
    fontSize: "1rem", // 16px
    fontWeight: "700", // Mirego summary labels are bold
    lineHeight: "1.5rem" // 24px
  },
  // Mirego tag: a small SOFT-ROUNDED pill chip. Measured tag tokens flip ink/
  // white (--tag-color:#050307 / --tag-text-color:#fff). Periwinkle-tinted
  // neutral fill keeps the editorial accent.
  tag: {
    radius: "500px", // Mirego tags are rounded pills (border-radius:500px)
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    fontSize: "0.8125rem", // 13px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: miregoColor.cream, // #f7edde warm fill
    neutralText: miregoColor.ink // #050307
  },
  // Mirego badge: a small filled pill — ink fill / white text (the editorial
  // emphasis), small.
  badge: {
    radius: "500px", // rounded pill
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.6875rem", // 11px
    fontWeight: "700",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: miregoColor.ink, // #050307 (Mirego "info" emphasis = ink)
    infoText: miregoColor.white // white on ink
  },
  // Mirego checkbox/radio label: Almirego ink text.
  choice: {
    labelFontSize: "0.9375rem", // 15px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: miregoColor.ink // #050307
  },
  // Mirego search input: a soft-rounded hairline box (matches the field anatomy).
  search: {
    paddingBlock: "0.75rem", // 12px (measured input padding)
    paddingInline: "1rem", // 16px
    fontSize: "1.125rem", // 18px (measured input font-size)
    lineHeight: "1.5rem" // 24px
  },
  // Mirego toggle / switch label: Almirego ink text (measured ink/periwinkle UI).
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: miregoColor.ink // #050307
  }
} as const;

// --- semantic (Mirego-specific role mapping) --------------------------------
const semantic = {
  surface: {
    default: miregoColor.white, // #ffffff white (--page-background)
    subtle: miregoColor.cream, // #f7edde cream signature surface (--primary-color)
    raised: miregoColor.white, // #ffffff white
    inverse: miregoColor.ink, // #050307 ink inverse surface (footer/CTA tone)
    overlay: "rgb(5 3 7 / 0.5)" // modal backdrop — measured rgba(5,3,7,.5)
  },
  text: {
    primary: miregoColor.ink, // #050307 (measured body color)
    secondary: miregoColor.grey[500], // #5b5b5b secondary text
    muted: miregoColor.grey[400], // #948e85 muted warm grey
    inverse: miregoColor.white, // white on ink / dark surfaces
    link: miregoColor.ink // #050307 — Mirego links are ink, accented on hover
  },
  border: {
    subtle: miregoColor.grey[100], // #e0dfe0 faint hairline divider
    strong: miregoColor.grey[300], // #a5a4a6 input / field border (rgb 165)
    interactive: miregoColor.ink // #050307 focus / interactive
  },
  action: {
    primary: miregoColor.ink, // #050307 primary button (the filled ink CTA)
    primaryHover: miregoColor.grey[800], // #211e25 — slightly lifted ink on hover (à confirmer)
    primaryText: miregoColor.white, // white text on ink
    secondary: miregoColor.cream, // #f7edde cream secondary surface
    secondaryHover: miregoColor.grey[100], // #e0dfe0
    secondaryText: miregoColor.ink, // #050307
    danger: miregoColor.system.error // #d52a0b (measured input error red)
  },
  feedback: {
    success: miregoColor.system.success,
    warning: miregoColor.system.warning,
    error: miregoColor.system.error,
    info: miregoColor.system.info
  },
  status: {
    pending: miregoColor.system.warning,
    processing: miregoColor.system.info,
    completed: miregoColor.system.success,
    failed: miregoColor.system.error
  },
  // Categorical data-vis palette. Mirego publishes no data-vis scale; this is a
  // coherent proposal built from Mirego's measured editorial hues (ink, the
  // periwinkle accent, the orange-red pop, the teal/violet quote-gradient
  // colours) plus restrained warm greys, honouring the editorial identity
  // (see MAPPING.md, "à confirmer" — not an official scale).
  data: {
    category1: miregoColor.ink, // #050307
    category2: miregoColor.periwinkle, // #b5a6ff signature accent
    category3: miregoColor.orange, // #ff4524 editorial pop
    category4: miregoColor.teal, // #2e6d5d quote-gradient teal
    category5: miregoColor.violet, // #6d6499 editorial violet
    category6: miregoColor.tealSoft, // #83c3b0 soft teal
    category7: miregoColor.grey[400], // #948e85 warm grey
    category8: miregoColor.system.warning // restrained amber (à confirmer)
  }
} as const;

/**
 * The Mirego theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Mirego-specific (ink-on-cream, periwinkle-
 * accented) values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so Mirego's minimal editorial
 * identity reaches the components (buttons, tabs, pagination, chat bubbles…),
 * not just the elements that read semantic vars directly.
 */
export const miregoTheme: TenantTheme = {
  id: "mirego",
  label: "Mirego",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default miregoTheme;
