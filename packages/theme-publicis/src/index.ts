import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Publicis Groupe brand theme for the Sentropic token structure.
 *
 * Publicis Groupe (the French communications/advertising holding) runs a
 * high-contrast, editorial identity: a near-black corporate colour
 * ("Publicis Black") on white, with a single prestige accent ("Publicis Gold").
 * All values below are mapped from Publicis Groupe's PUBLIC brand colours, taken
 * from the official Media Kit brand guidelines (publicisgroupe.com/en/media-kit)
 * and cross-checked against published brand-colour references. We only reference
 * the font *names* (Gotham Narrow, ITC New Baskerville) here, never font
 * binaries. Sources and exact provenance are documented in MAPPING.md. Where
 * Publicis Groupe does not publish a UI value (the full neutral scale, hover/
 * tint steps, and product feedback colours), the closest derived value is used
 * and the choice is flagged "à confirmer" in MAPPING.md.
 *
 * Publicis Groupe colour reference (official Media Kit palette):
 *   Publicis Black (primary corporate)   #212129   (PUBLICIS BLACK — action / text / inverse)
 *   Publicis Grey  (light surface/border)#e7e7e7   (PUBLICIS GREY — subtle borders / surfaces)
 *   Publicis Gold  (signature accent)    #9d833e   (PUBLICIS GOLD — focus / links / indicators)
 *   Publicis Blue  (secondary accent)    #16abe0   (PUBLICIS BLUE — data-vis / info family)
 *   Publicis Pink  (secondary accent)    #d93d7a   (PUBLICIS PINK — data-vis)
 *   Publicis Turquoise (secondary accent)#00b0a3   (PUBLICIS TURQUOISE — data-vis)
 */

// --- Publicis Groupe raw colour palette (official Media Kit) ----------------
const publicisColor = {
  // Publicis Black — the corporate PRIMARY (primary action, body text, inverse
  // header/footer surfaces). The Publicis identity is black on white.
  black: {
    main: "#212129", // PUBLICIS BLACK (Media Kit) — primary action / text / inverse
    hover: "#3a3a45", // derived lighter near-black for primary-button hover (à confirmer)
    darkest: "#16161c" // derived darkest neutral (à confirmer)
  },
  // Publicis Gold — the single signature ACCENT. The measured gold (#9d833e)
  // clears WCAG AA only as a non-text/UI accent (≈3.66:1 on white); for accent
  // TEXT on white a darker derived gold (#7d6831 ≈ 5.4:1) is used.
  gold: {
    main: "#9d833e", // PUBLICIS GOLD (Media Kit) — focus ring / interactive border / indicators
    deep: "#7d6831", // derived darker gold for AA accent TEXT on white (à confirmer)
    light: "#f3efe4" // derived light gold tint for low-emphasis surfaces (à confirmer)
  },
  // Neutral grey scale. Only "Publicis Grey" #e7e7e7 is published; the other
  // steps are derived to build a coherent neutral ramp (à confirmer).
  grey: {
    0: "#ffffff", // white — surface default
    50: "#f4f4f5", // background alt (derived — à confirmer)
    200: "#e7e7e7", // PUBLICIS GREY (Media Kit) — subtle borders / secondary surface
    400: "#c7c7cc", // mid grey (derived — à confirmer)
    500: "#6e6e78", // muted text / strong border (derived — à confirmer)
    600: "#52525b", // secondary text (derived — à confirmer)
    800: "#212129", // = Publicis Black — primary text / inverse
    900: "#16161c" // darkest (derived — à confirmer)
  },
  // Secondary brand accents (Media Kit) — Publicis Blue / Pink / Turquoise.
  // These are real published brand colours, parked for data-vis and the info
  // family (interactive UI stays Black + Gold).
  accent: {
    blue: "#16abe0", // PUBLICIS BLUE (Media Kit)
    blueDeep: "#0e7fb0", // derived darker blue for AA-as-text / info (à confirmer)
    blueLight: "#e3f5fc", // derived light blue tint (à confirmer)
    pink: "#d93d7a", // PUBLICIS PINK (Media Kit)
    turquoise: "#00b0a3" // PUBLICIS TURQUOISE (Media Kit)
  },
  // System / status colours. Publicis Groupe is a holding-company brand and does
  // NOT publish product UI feedback colours; these are derived to read clearly
  // and keep WCAG AA on white (à confirmer). `info` is drawn from the measured
  // Publicis Blue.
  system: {
    success: "#1f7a52", // derived green (à confirmer)
    warning: "#b35900", // derived amber, AA on white (à confirmer)
    error: "#c62828", // derived red (à confirmer)
    info: "#0e7fb0" // derived from Publicis Blue #16abe0 for AA (à confirmer)
  }
} as const;

// --- foundation (Publicis Groupe-specific values) ---------------------------
const foundation = {
  color: {
    // The Sentropic "blue" role family carries the measured Publicis Blue
    // secondary accent (Publicis interactive UI is Black + Gold, not blue).
    blue: {
      10: publicisColor.accent.blueLight, // light blue tint
      60: publicisColor.accent.blue, // #16abe0 Publicis Blue
      80: publicisColor.accent.blueDeep // darker blue
    },
    // The Sentropic "cyan" accent slot carries the signature Publicis Gold.
    cyan: {
      10: publicisColor.gold.light, // light gold tint
      50: publicisColor.gold.main, // #9d833e Publicis Gold
      70: publicisColor.gold.deep // darker gold (AA text)
    },
    // Sentropic "slate" role family mapped onto the grey scale.
    slate: {
      0: publicisColor.grey[0], // white
      10: publicisColor.grey[50], // background alt
      20: publicisColor.grey[200], // subtle borders / secondary surface
      60: publicisColor.grey[500], // muted / strong border
      80: publicisColor.grey[800], // primary text (Publicis Black)
      90: publicisColor.grey[900] // darkest
    },
    feedback: {
      success: publicisColor.system.success,
      warning: publicisColor.system.warning,
      error: publicisColor.system.error,
      info: publicisColor.system.info
    }
  },
  // Publicis Groupe pairs "Gotham Narrow" (headlines / display & UI chrome) with
  // "ITC New Baskerville" (a serif for body copy) — an editorial sans+serif
  // pairing per the Media Kit. font.sans (body prose) is therefore the serif;
  // display titles and the UI control/field/label typography use the Gotham
  // sans (see typography.* below). We reference font *names* only, no binaries.
  font: {
    sans: "'ITC New Baskerville', 'Baskerville', 'Libre Baskerville', Georgia, 'Times New Roman', serif",
    display: "'Gotham Narrow', 'Gotham', 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; Publicis does not publish a spacing scale).
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
  // Publicis editorial aesthetic is sharp/minimal: controls and inputs carry an
  // almost-square 2px radius, cards a restrained 4px. Exact radii are not
  // published (à confirmer).
  radius: {
    none: "0",
    sm: "0.125rem", // 2px
    md: "0.125rem", // 2px — button / input / tabs
    lg: "0.25rem", // 4px — cards
    pill: "999px" // tags / pills
  },
  // Light, neutral elevation tinted with the corporate black. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(33 33 41 / 0.10)",
    medium: "0 4px 12px rgb(33 33 41 / 0.14)",
    floating: "0 8px 24px rgb(33 33 41 / 0.18)"
  },
  // Motion durations are not tokenised publicly by Publicis; kept aligned with
  // the Sentropic base ("à confirmer").
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
  // --- Anatomy primitives (Publicis Groupe) --------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // field border 1px
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Control density. ~40px medium controls with 0.75rem inline padding; sm/lg
  // follow the standard size scale ("à confirmer").
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.5rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.375rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" }
  },
  // Publicis typography: Gotham Narrow (sans) for interactive controls, fields
  // and labels; the editorial serif (ITC New Baskerville) is reserved for body
  // prose via font.sans. Button labels use Gotham, no transform.
  typography: {
    control: { family: "'Gotham Narrow', 'Gotham', 'Montserrat', system-ui, sans-serif", size: "1rem", weight: "600", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Gotham Narrow', 'Gotham', 'Montserrat', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Gotham Narrow', 'Gotham', 'Montserrat', system-ui, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Brand links are the deep Publicis Gold #7d6831 (AA on white), not
    // underlined at rest, underlined on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // disabled controls dim to 0.5 (à confirmer)
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // FOCUS = a high-contrast OUTLINE in the measured Publicis Gold #9d833e
  // (≈3.66:1 on white — clears WCAG 1.4.11 non-text 3:1 for focus indicators).
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: publicisColor.gold.main, // #9d833e Publicis Gold focus outline
    inset: "0"
  },
  // Form fields are BOXED (outline): a white fill, a 1px grey border (#e7e7e7)
  // and a sharp 2px radius. `style: "outline"` makes the builder draw four equal
  // borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: publicisColor.grey[0], // #ffffff
    underlineColor: publicisColor.grey[200], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in Publicis Black with a 40px gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23212129' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: a subtle 1px grey border + slight radius, light hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: publicisColor.grey[50] // #f4f4f5
  },
  // Secondary button = OUTLINED in Publicis Black: transparent fill, black
  // border + text, light grey fill on hover (editorial outlined button).
  buttonSecondary: {
    background: "transparent",
    border: publicisColor.black.main, // #212129 stroke
    hoverBackground: publicisColor.grey[50] // #f4f4f5 light fill on hover
  },
  // Tabs / top-nav: active tab = bold deep-gold label with a bottom gold
  // underline (the Gold accent marks the active state).
  tabs: {
    activeText: publicisColor.gold.deep, // #7d6831 (AA bold accent text)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // Pagination: borderless deep-gold links; active page = filled Publicis Black.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: publicisColor.gold.deep, // #7d6831 link text
    activeBackground: publicisColor.black.main, // #212129 filled active page
    activeText: publicisColor.grey[0], // white on black
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb: deep-gold links, black current page, grey separators.
  breadcrumb: {
    linkText: publicisColor.gold.deep, // #7d6831
    text: publicisColor.grey[600], // #52525b trail text
    currentText: publicisColor.grey[800], // #212129 current page
    separator: publicisColor.grey[500], // #6e6e78
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem", // 24px
    currentWeight: "700"
  },
  // Alert / notice: a coloured LEFT accent filet on a transparent box.
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
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Accordion / details: a black bold summary trigger.
  accordion: {
    text: publicisColor.grey[800], // #212129 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "700",
    lineHeight: "1.5rem" // 24px
  },
  // Tag: a small sharp 2px-radius grey chip.
  tag: {
    radius: "2px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: publicisColor.grey[50], // #f4f4f5
    neutralText: publicisColor.grey[800] // #212129
  },
  // Badge: a sharp 2px-radius filled badge.
  badge: {
    radius: "2px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: publicisColor.black.main, // #212129 corporate black badge
    infoText: publicisColor.grey[0] // white
  },
  // Checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: publicisColor.grey[800] // #212129
  },
  // Search input.
  search: {
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: publicisColor.grey[800] // #212129
  }
} as const;

// --- semantic (Publicis Groupe-specific role mapping) -----------------------
const semantic = {
  surface: {
    default: publicisColor.grey[0], // white
    subtle: publicisColor.grey[50], // #f4f4f5 background alt
    raised: publicisColor.grey[0], // white
    inverse: publicisColor.black.main, // #212129 Publicis Black inverse (header/footer)
    overlay: "rgb(33 33 41 / 0.6)" // modal backdrop (corporate black tint)
  },
  text: {
    primary: publicisColor.grey[800], // #212129 Publicis Black (body text)
    secondary: publicisColor.grey[600], // #52525b
    muted: publicisColor.grey[500], // #6e6e78
    inverse: publicisColor.grey[0], // white on dark / coloured surfaces
    link: publicisColor.gold.deep // #7d6831 deep Publicis Gold (AA on white)
  },
  border: {
    subtle: publicisColor.grey[200], // #e7e7e7 Publicis Grey (field stroke)
    strong: publicisColor.grey[500], // #6e6e78
    interactive: publicisColor.gold.main // #9d833e Publicis Gold focus / interactive
  },
  action: {
    primary: publicisColor.black.main, // #212129 Publicis Black primary button
    primaryHover: publicisColor.black.hover, // #3a3a45 lighter near-black hover (à confirmer)
    primaryText: publicisColor.grey[0], // white text on black
    secondary: publicisColor.grey[50], // #f4f4f5 secondary surface
    secondaryHover: publicisColor.grey[200], // #e7e7e7
    secondaryText: publicisColor.grey[800], // #212129 (outlined black secondary button)
    danger: publicisColor.system.error // #c62828 error red (à confirmer)
  },
  feedback: {
    success: publicisColor.system.success,
    warning: publicisColor.system.warning,
    error: publicisColor.system.error,
    info: publicisColor.system.info
  },
  status: {
    pending: publicisColor.system.warning,
    processing: publicisColor.system.info,
    completed: publicisColor.system.success,
    failed: publicisColor.system.error
  },
  // Categorical data-vis palette built from the real, measured Publicis Groupe
  // Media Kit palette (Black, Gold, Blue, Pink, Turquoise) plus derived steps.
  // Publicis does not publish an 8-colour sequential scale, so the ORDER is a
  // coherent proposal (see MAPPING.md, "à confirmer").
  data: {
    category1: publicisColor.black.main, // #212129 Publicis Black
    category2: publicisColor.gold.main, // #9d833e Publicis Gold
    category3: publicisColor.accent.blue, // #16abe0 Publicis Blue
    category4: publicisColor.accent.pink, // #d93d7a Publicis Pink
    category5: publicisColor.accent.turquoise, // #00b0a3 Publicis Turquoise
    category6: publicisColor.gold.deep, // #7d6831 deep gold
    category7: publicisColor.grey[500], // #6e6e78 grey
    category8: publicisColor.accent.blueDeep // #0e7fb0 deep blue
  }
} as const;

/**
 * The Publicis Groupe theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Publicis-specific values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Publicis brand (Black + Gold) reaches the
 * components (buttons, tabs, pagination, chat bubbles…), not just the elements
 * that read semantic vars directly.
 */
export const publicisTheme: TenantTheme = {
  id: "publicis",
  label: "Publicis Groupe",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default publicisTheme;
