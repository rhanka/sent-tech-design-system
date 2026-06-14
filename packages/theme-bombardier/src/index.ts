import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * BOMBARDIER (bombardier.com — the Montréal-HQ business-jet manufacturer) theme
 * for the Sentropic token structure.
 *
 * Bombardier's public site is a Drupal build (theme `bba8ui_merge`) whose brand
 * layer ships TWO measured token systems in one stylesheet: a modern Material-3
 * style ramp (`--surface`, `--on-surface`, `--secondary-gold`, `--inverse-surface`,
 * `--error`, `--outline-container`…) and a `--bba-legacy-*` brand system that still
 * drives the primary CTA, links and footer. Every value below is MEASURED from the
 * live storefront's brand stylesheet, fetched directly via curl: the legacy brand
 * colours (`--bba-legacy-brand-primary/-secondary/-focus/-error`), the modern
 * surface/secondary/error ramp, the `.btn` + legacy `.bba-btn-primary` button
 * rules, the `.bba-form-field-input` field rules, the `@font-face` family names and
 * the link decoration. We reference font *names* only ("Inter" body/UI + "Trust"
 * and "Display" serif display faces, measured from the site's `@font-face`
 * declarations), never font binaries. Sources and the full mapping are in MAPPING.md.
 *
 * Bombardier's identity is PREMIUM and UNDERSTATED: a deep PETROL-TEAL brand colour
 * (#003e51 — `--bba-legacy-brand-primary`, the primary CTA fill + brand mark) sits
 * against a warm CREAM canvas (#FDFBF3 — `--surface`/`--primary-container`) and a
 * near-black INK (#202020 — `--on-surface`/`--primary-black`, never pure black). A
 * refined GOLD (#d19000 CTA-hover / #C7B289 `--secondary-gold`) is the luxury
 * accent; bronze (#89674A — `--on-surface-variant`) carries link/secondary ink.
 * Buttons are fully ROUNDED pills (measured `.btn` `border-radius:7.14rem`≈100px),
 * UPPERCASE with 1px tracking on the legacy CTA; form fields are SQUARE BOXED
 * outlines (white fill, thin grey #dcdedc stroke, 0px radius — a deliberately sharp
 * luxury feel) and focus is a DARK-TEAL border-colour shift (#00171e —
 * `--bba-legacy-brand-focus`), encoded as an inset indicator. Where Sentropic needs
 * a role Bombardier does not publish, the closest measured hex is used and the
 * choice is noted "à confirmer" in MAPPING.md.
 *
 * Bombardier colour reference (measured hex, brand bba8ui_merge stylesheet):
 *   Brand petrol-teal (action / brand)   #003e51   --bba-legacy-brand-primary — THE Bombardier teal CTA
 *   Brand teal hover (cyan accent)        #0880a5   --bba-shortcut-footer-bg-hover (teal hover accent)
 *   Brand dark focus teal                 #00171e   --bba-legacy-brand-focus (CTA focus / field focus border)
 *   Brand gold (CTA hover / accent)       #d19000   --bba-legacy-brand-secondary (gold hover/accent)
 *   Secondary gold (soft luxury accent)   #c7b289   --secondary-gold
 *   Secondary container gold              #d1c5b2   --secondary-container (button hover fill)
 *   Bronze ink (link / secondary ink)     #89674a   --on-surface-variant / --outline-container-variant
 *   Secondary-on-container ink            #4b4846   --secondary-on-container (hover label ink)
 *   Near-black ink (text primary)         #202020   --on-surface / --primary-black — THE Bombardier ink
 *   Dark gray ink (field text)            #333333   --bba-legacy-gray-xdark (45px field text, weight 300)
 *   Warm cream (signature surface)        #fdfbf3   --surface / --primary-container — THE Bombardier canvas
 *   Bright cream surface                  #fefdf9   --surface-bright
 *   White (raised / CTA text)             #ffffff   --surface-brighter / --primary-white
 *   Dim cream surface                     #f2efe5   --surface-dim
 *   Neutral surface                       #f6f5f3   --surface-neutral
 *   Page grey (faint neutral)             #f5f7f5   --bba-legacy-gray-xlight
 *   Neutral-dim divider                   #e2e2e1   --surface-neutral-dim
 *   Field border grey (1px stroke)        #dcdedc   --bba-legacy-gray-lighter (.bba-form-field-input stroke)
 *   Outline container grey                #9f9e9c   --outline-container (.btn border)
 *   Tertiary bright gold accent           #f3cb02   --tertiary-container (bright gold accent)
 *   Brand error red                       #e70d06   --error / --bba-legacy-brand-error
 *   Error container tint                  #ffd6d4   --error-container (soft error fill)
 *   Success green                         #2e7d32   AA-grade success (not brand-published — à confirmer)
 *   Warning amber ink                     #8a6d3b   AA-grade amber (not brand-published — à confirmer)
 *   Info teal ink                         #0880a5   teal info (from the brand teal hover accent)
 */

// --- BOMBARDIER raw colour palette (measured hex, bba8ui_merge stylesheet) ----
const bombardierColor = {
  // The brand IS the deep petrol-teal. Used for the brand mark, the primary CTA
  // (legacy .bba-btn-primary fill) and brand accents.
  teal: {
    500: "#003e51", // --bba-legacy-brand-primary — THE Bombardier petrol-teal
    accent: "#0880a5", // --bba-shortcut-footer-bg-hover — brighter teal hover/info accent
    focus: "#00171e" // --bba-legacy-brand-focus — darkest teal (focus border)
  },
  // Gold — Bombardier's luxury accent. The legacy CTA hovers to gold; the modern
  // ramp carries a softer gold (--secondary-gold) and a bright tertiary gold.
  gold: {
    500: "#d19000", // --bba-legacy-brand-secondary — gold CTA hover / accent
    soft: "#c7b289", // --secondary-gold — soft luxury gold
    container: "#d1c5b2", // --secondary-container — button hover fill
    bright: "#f3cb02" // --tertiary-container — bright gold accent
  },
  // Warm ink / bronze neutrals (Bombardier never uses pure black for body text).
  ink: {
    default: "#202020", // --on-surface / --primary-black — THE Bombardier ink
    field: "#333333", // --bba-legacy-gray-xdark — field text ink
    bronze: "#89674a", // --on-surface-variant — link / secondary ink (warm bronze)
    bronzeInk: "#4b4846" // --secondary-on-container — hover label ink
  },
  // Warm cream + neutral surface ramp (the signature Bombardier canvas).
  cream: {
    surface: "#fdfbf3", // --surface / --primary-container — THE Bombardier cream canvas
    bright: "#fefdf9", // --surface-bright
    dim: "#f2efe5" // --surface-dim
  },
  // Cool neutral greys (page greys + field/divider strokes + outline).
  grey: {
    neutral: "#f6f5f3", // --surface-neutral
    page: "#f5f7f5", // --bba-legacy-gray-xlight — faint page grey
    dim: "#e2e2e1", // --surface-neutral-dim — divider
    border: "#dcdedc", // --bba-legacy-gray-lighter — field stroke (1px)
    outline: "#9f9e9c" // --outline-container — .btn border / control outline
  },
  white: "#ffffff", // --surface-brighter / --primary-white — raised surface / CTA text
  // System / status colours (measured error; success/warning derived to AA).
  system: {
    error: "#e70d06", // --error / --bba-legacy-brand-error
    errorContainer: "#ffd6d4", // --error-container — soft error fill
    success: "#2e7d32", // AA-grade success green (not brand-published — à confirmer)
    warning: "#8a6d3b", // AA-grade amber ink (not brand-published — à confirmer)
    info: "#0880a5" // teal info (from the brand teal hover accent)
  }
} as const;

// --- foundation (BOMBARDIER-specific values) --------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (action / primary / link). Bombardier's PRIMARY
    // ACTION is the petrol-TEAL, so the action steps are mapped to the teal scale;
    // the lightest step is a faint cream tint.
    blue: {
      10: bombardierColor.cream.surface, // #fdfbf3 faint cream tint
      60: bombardierColor.teal[500], // #003e51 THE Bombardier teal (primary action)
      80: bombardierColor.teal.focus // #00171e darkest teal (focus / active ground)
    },
    // Sentropic "cyan" accent slot. Bombardier's cool accent is the brighter teal
    // hover (#0880a5); mapped here so a distinct cool accent survives (à confirmer).
    cyan: {
      10: "#e6eff2", // faint teal tint (derived panel tint — à confirmer)
      50: bombardierColor.teal.accent, // #0880a5 brighter teal accent
      70: bombardierColor.teal[500] // #003e51 deep petrol-teal
    },
    // Sentropic "slate" neutral family mapped onto the Bombardier warm ink, cream
    // canvas and grey ramp.
    slate: {
      0: bombardierColor.white, // #ffffff white
      10: bombardierColor.cream.surface, // #fdfbf3 cream surface
      20: bombardierColor.grey.border, // #dcdedc field stroke / subtle border
      60: bombardierColor.ink.bronze, // #89674a bronze secondary ink
      80: bombardierColor.ink.default, // #202020 primary ink (near-black)
      90: bombardierColor.teal.focus // #00171e darkest teal
    },
    feedback: {
      success: bombardierColor.system.success,
      warning: bombardierColor.system.warning,
      error: bombardierColor.system.error,
      info: bombardierColor.system.info
    }
  },
  // Bombardier serves "Inter" as its body/UI/control sans (measured
  // `--font-family-base: "Inter"`, the variable font) and a serif display pairing:
  // "Trust" (the brand's proprietary serif, `--font-family-serif`, Trust1A weights
  // 100–900) and "Display" (`--font-family-display`). We reference the family NAMES
  // only, with the brand's own Open Sans / serif fallback chains. Mono is not part
  // of Bombardier — the Sentropic mono stack is kept.
  font: {
    sans: "'Inter', 'Open Sans', Helvetica, Arial, sans-serif",
    display: "'Trust', 'Display', Georgia, 'Times New Roman', serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Bombardier spacing: the brand sheet is a 4/8px-based ramp expressed in rem
  // fractions (measured `.btn` padding .857rem 1.143rem ≈ 12px/16px, field padding
  // 20px 10px 6px 20px). Aligned to the Sentropic step keys.
  spacing: {
    0: "0",
    1: "0.25rem", // 4px
    2: "0.5rem", // 8px
    3: "0.75rem", // 12px (measured CTA block padding ≈ .857rem)
    4: "1rem", // 16px (measured CTA inline padding ≈ 1.143rem)
    6: "1.5rem", // 24px
    8: "2rem", // 32px
    12: "3rem", // 48px
    16: "4rem" // 64px
  },
  // Bombardier rounds its BUTTONS FULLY (measured `.btn` `border-radius:7.143rem` →
  // pill; legacy CTA `border-radius:100px`) but keeps FIELDS SHARP (measured
  // `.bba-form-field-input`/textarea `border-radius:0`) for a luxury feel. Cards /
  // copy-fields step to 8px (measured `.5714rem`). Controls (input) are square.
  radius: {
    none: "0", // square — Bombardier form fields (.bba-form-field-input) are sharp
    sm: "2px", // measured small chips / .2857rem ≈ 4px bracket (smallest soft step)
    md: "4px", // measured small card / chip radius (.2857rem)
    lg: "8px", // cards / copy-field (measured .5714rem)
    pill: "999px" // .btn / legacy CTA fully-rounded pill (measured 100px)
  },
  // Bombardier elevation is restrained (premium, lots of white space). The brand
  // sheet uses soft neutral shadows; mapped to the three Sentropic slots
  // ("à confirmer" — no single published elevation ramp).
  shadow: {
    subtle: "0 1px 3px rgb(32 32 32 / 0.10)",
    medium: "0 4px 12px rgb(32 32 32 / 0.10)",
    floating: "0 12px 32px rgb(32 32 32 / 0.14), 0 2px 6px rgb(32 32 32 / 0.08)"
  },
  // Bombardier transitions are slow and elegant (measured `.btn` + CTA
  // `transition:all 250ms ease-in-out`). Mapped to the Sentropic ramp.
  motion: {
    fast: "150ms",
    normal: "250ms", // measured .btn / CTA transition
    slow: "500ms", // measured link decoration transition (ease .5s)
    easing: "ease-in-out" // measured .btn easing
  },
  // z-index roles are not Bombardier-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (BOMBARDIER) -------------------------------------
  // Bombardier field/divider strokes measured at 1px solid #dcdedc; control
  // outlines 1px #9f9e9c. thick 2px kept for emphasis (measured link underline
  // thickness 2px).
  borderWidth: {
    none: "0",
    thin: "1px", // measured input + divider stroke
    thick: "2px" // measured link underline thickness
  },
  borderStyle: { solid: "solid" },
  // Bombardier control density. Measured `.btn` ≈ 40px tall (padding .857rem
  // 1.143rem, 16px/600 label); measured field height 45px (padding 20px 10px 6px
  // 20px, weight 300). md targets a comfortable ~44px control; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.857rem", paddingInline: "1.143rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "1rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1rem" }
  },
  // Bombardier typography = "Inter" (body/controls) + "Trust"/"Display" serif
  // (display). The legacy CTA label is heavy (measured `font-weight:800`,
  // UPPERCASE, `letter-spacing:1px`); the modern `.btn` label is `600`. Field text
  // is light (measured weight 300) dark-grey. Base type is 16px.
  typography: {
    control: { family: "'Inter', 'Open Sans', Arial, sans-serif", size: "1rem", weight: "600", lineHeight: "1.5", letterSpacing: "1px", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Inter', 'Open Sans', Arial, sans-serif", size: "1rem", weight: "300", lineHeight: "1.2857", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Inter', 'Open Sans', Arial, sans-serif", size: "1rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Bombardier links: bronze ink, UNDERLINED at rest (measured anchor
    // `text-decoration-line:underline; text-decoration-thickness:2px`), underline
    // removed on hover (the brand's distinctive hover-off effect).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "2px", decorationOffset: "auto",
      textDecorationHover: "none", decorationThicknessHover: "2px", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.4", // Bombardier disables controls at ≈ 40% (à confirmer)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "250ms", easing: "ease-in-out" }, // measured .btn transition 250ms ease-in-out
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // BOMBARDIER FOCUS = a DARK-TEAL border shift. The brand sheet sets `outline:0`
  // everywhere and instead focuses fields by changing the border-color to the
  // darkest teal `#00171e` (measured `.bba-form-field-input:focus`); the button
  // focus outline colour is the near-black `--secondary-black`. We encode an INSET
  // indicator in the dark teal — matching the real border-colour technique rather
  // than an offset ring.
  focus: {
    strategy: "inset",
    width: "2px",
    offset: "0",
    color: bombardierColor.teal.focus, // #00171e — darkest teal focus indicator
    inset: "0"
  },
  // BOMBARDIER form fields are BOXED but SQUARE (outline, 0px radius): a white fill
  // with a thin grey stroke (measured `.bba-form-field-input` `1px solid #dcdedc`)
  // and `border-radius:0` (the textarea/input are sharp — a deliberate luxury
  // detail). `style:"outline"` makes the builder draw four equal borders from
  // `surface.default` + `border.subtle`. The native <select> chevron is redrawn in
  // the near-black ink with a 36px right gutter (appearance: none).
  field: {
    style: "outline",
    fillBg: bombardierColor.white, // #ffffff
    underlineColor: bombardierColor.grey.border, // #dcdedc (unused for outline, kept for completeness)
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23202020' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.25rem"
  },
  // Bombardier cards: cream/white surface, mildly rounded (8px), a soft grey border
  // and a faint cream hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: bombardierColor.cream.surface // #fdfbf3 faint cream hover
  },
  // Bombardier secondary button = the modern `.btn`: a white/outlined chip
  // (transparent-ish white fill, grey `#9f9e9c` outline, near-black text) that
  // hovers to the soft-gold container fill (measured `--btn-hover-bg:
  // --secondary-container` #d1c5b2).
  buttonSecondary: {
    background: bombardierColor.white, // #ffffff white .btn fill
    border: bombardierColor.grey.outline, // #9f9e9c outline-container stroke
    hoverBackground: bombardierColor.gold.container // #d1c5b2 soft-gold container hover fill
  },
  // Bombardier tabs / sub-nav: active tab = teal bold label with a teal bottom
  // indicator (the brand accent), transparent fill.
  tabs: {
    activeText: bombardierColor.teal[500], // #003e51 active label (brand teal)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px (Bombardier base type)
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // teal underline on the bottom edge
    indicatorMode: "border" // a real bottom border indicator
  },
  // Bombardier pagination: borderless bronze link text; active page = filled teal
  // pill (the brand fill) with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: bombardierColor.ink.bronze, // #89674a bronze link text
    activeBackground: bombardierColor.teal[500], // #003e51 filled active page (brand teal)
    activeText: bombardierColor.white, // white on teal
    activeBorderWidth: "0",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Bombardier breadcrumb: bronze links, bronze trail, near-black current page,
  // grey separators.
  breadcrumb: {
    linkText: bombardierColor.ink.bronze, // #89674a
    text: bombardierColor.ink.bronze, // #89674a trail text
    currentText: bombardierColor.ink.default, // #202020 current page (near-black)
    separator: bombardierColor.grey.outline, // #9f9e9c
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "600" // current page is emphasised
  },
  // Bombardier notice / alert: a tinted box with a coloured left filet matching the
  // severity (error tint #ffd6d4, teal/gold accents).
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
  // Bombardier accordion / disclosure: a semibold near-black summary trigger,
  // square, grey-separated.
  accordion: {
    text: bombardierColor.ink.default, // #202020 summary label (near-black)
    paddingBlock: "1rem", // 16px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "600", // Bombardier summary triggers are semibold
    lineHeight: "1.5rem" // 24px
  },
  // Bombardier tag: a small PILL chip with a faint cream fill and near-black ink
  // (the brand pill language).
  tag: {
    radius: "999px", // Bombardier chips round fully (pill button language)
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: bombardierColor.cream.dim, // #f2efe5 faint cream fill
    neutralText: bombardierColor.ink.default // #202020 near-black
  },
  // Bombardier badge: a small filled badge — brand teal fill / white text.
  badge: {
    radius: "999px", // pill
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "600",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: bombardierColor.teal[500], // #003e51 brand teal
    infoText: bombardierColor.white // white on teal
  },
  // Bombardier checkbox/radio label: regular near-black type at base size.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: bombardierColor.ink.default // #202020 near-black
  },
  // Bombardier search input: a boxed grey-stroked field, base type.
  search: {
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Bombardier toggle / switch label: regular near-black type.
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.5rem", // 24px
    textColor: bombardierColor.ink.default // #202020 near-black
  }
} as const;

// --- semantic (BOMBARDIER-specific role mapping) ----------------------------
const semantic = {
  surface: {
    default: bombardierColor.white, // #ffffff white (--surface-brighter)
    subtle: bombardierColor.cream.surface, // #fdfbf3 warm cream canvas (--surface)
    raised: bombardierColor.white, // #ffffff white
    inverse: bombardierColor.ink.default, // #202020 near-black reversed surface (--inverse-surface)
    overlay: "rgb(32 32 32 / 0.6)" // modal backdrop (near-black ink, 60%)
  },
  text: {
    primary: bombardierColor.ink.default, // #202020 near-black (--on-surface / primary text)
    secondary: bombardierColor.ink.bronze, // #89674a warm bronze (--on-surface-variant)
    muted: bombardierColor.ink.bronze, // #89674a
    inverse: bombardierColor.cream.surface, // #fdfbf3 cream on dark (--on-inverse-surface)
    link: bombardierColor.ink.bronze // #89674a bronze link ink
  },
  border: {
    subtle: bombardierColor.grey.border, // #dcdedc field stroke / divider
    strong: bombardierColor.grey.outline, // #9f9e9c stronger control outline
    interactive: bombardierColor.teal[500] // #003e51 brand teal (interactive accent)
  },
  action: {
    primary: bombardierColor.teal[500], // #003e51 THE Bombardier teal CTA
    primaryHover: bombardierColor.gold[500], // #d19000 gold hover (legacy CTA hover)
    primaryText: bombardierColor.white, // white text on teal
    secondary: bombardierColor.cream.dim, // #f2efe5 soft cream secondary surface
    secondaryHover: bombardierColor.gold.container, // #d1c5b2 soft-gold hover
    secondaryText: bombardierColor.ink.default, // #202020 near-black secondary label
    danger: bombardierColor.system.error // #e70d06 brand error red
  },
  feedback: {
    success: bombardierColor.system.success, // #2e7d32
    warning: bombardierColor.system.warning, // #8a6d3b
    error: bombardierColor.system.error, // #e70d06
    info: bombardierColor.system.info // #0880a5
  },
  status: {
    pending: bombardierColor.system.warning, // #8a6d3b
    processing: bombardierColor.system.info, // #0880a5
    completed: bombardierColor.system.success, // #2e7d32
    failed: bombardierColor.system.error // #e70d06
  },
  // Categorical data-vis palette. Bombardier does not publish a single categorical
  // token list; the eight categories below are seeded from the measured brand hexes
  // (teal lead, gold, bronze, bright gold, teal accent, success green, amber,
  // near-black) to give a legible brand-true scale.
  // See MAPPING.md, "à confirmer" — this is an assembled scale.
  data: {
    category1: bombardierColor.teal[500], // #003e51 brand teal
    category2: bombardierColor.gold[500], // #d19000 gold
    category3: bombardierColor.ink.bronze, // #89674a bronze
    category4: bombardierColor.gold.bright, // #f3cb02 bright gold
    category5: bombardierColor.teal.accent, // #0880a5 teal accent
    category6: bombardierColor.system.success, // #2e7d32 success green
    category7: bombardierColor.system.warning, // #8a6d3b amber
    category8: bombardierColor.ink.default // #202020 near-black
  }
} as const;

/**
 * The BOMBARDIER theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Bombardier-specific (premium teal-and-gold)
 * values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so Bombardier's teal CTA, near-black
 * ink, gold accents, pill buttons, square boxed fields and dark-teal focus reach the
 * components (buttons, tabs, pagination, chat bubbles…), not just the elements that
 * read semantic vars directly.
 */
export const bombardierTheme: TenantTheme = {
  id: "bombardier",
  label: "Bombardier",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default bombardierTheme;
