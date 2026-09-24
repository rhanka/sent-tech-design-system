import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Michelin brand theme for the Sentropic token structure.
 *
 * Michelin ships its corporate identity as design tokens in the public
 * stylesheets of michelin.com (`/public/themes/michelin-corporate/
 * theme-michelin-corporate.css`): a `:root` block declares `--color-primary`
 * (#27509b, Michelin blue), `--color-tertiary-01` (#00205b, deep navy),
 * `--color-primary-lighten-01` (#d4e7fa), the `--color-is-*` status hues and
 * the `--font-family-primary/secondary` names ("Noto Sans" /
 * "Michelin Unit Titling"). This package is a MEASURED-CLONE mapping of those
 * public values onto the Sentropic tokens; we reference the font *names* only,
 * never font binaries. Sources and exact provenance are documented in
 * MAPPING.md. Where the brand publishes no direct equivalent for a Sentropic
 * role (the modal overlay alpha, the warning text hue, control geometry), the
 * closest derived value is used and flagged "à confirmer" in MAPPING.md.
 *
 * Michelin colour reference (light theme):
 *   White (main background)              #ffffff   (:root --color-main-background)
 *   Light grey (secondary surface)       #f2f2f2   (:root --color-light-05)
 *   Pale grey (secondary hover)          #e5e5e5   (:root --color-light-10)
 *   Border grey (card base border)       #cccccc   (:root --color-light-20)
 *   Secondary text grey                  #404040   (:root --color-dark-60)
 *   Muted / focus grey                   #666666   (:root --color-dark-40, focus outline)
 *   Body / primary text                  #1a1a1a   (:root --color-main-text)
 *   Darkest                              #000000   (:root --color-dark)
 *   Michelin blue (brand / action)       #27509b   (:root --color-primary)
 *   Michelin blue hover                  #3a61a6   (:root --color-primary-darken-03)
 *   Mid blue accent                      #6182bb   (:root --color-primary-darken-02)
 *   Light blue tint                      #d4e7fa   (:root --color-primary-lighten-01)
 *   Pale blue tint                       #c1d6ef   (:root --color-primary-lighten-02)
 *   Deep navy (tertiary / inverse)       #00205b   (:root --color-tertiary-01)
 *   Purple accent (tertiary)             #582c83   (:root --color-tertiary-02)
 *   Michelin yellow (card accent)        #fce500   (.ds__card-panel secondary skin)
 *   Success green                        #2e7d32   (:root --color-is-valid)
 *   Warning amber (derived AA text)      #9a6104   (stop rule from #f9a825 — à confirmer)
 *   Error red                            #b71c1c   (:root --color-is-error)
 *   Info blue                            #27509b   (:root --color-is-info)
 */

// --- Michelin raw colour palette --------------------------------------------
const michelinColor = {
  // Michelin blue — the brand signature, declared as `:root{--color-primary:
  // #27509b}` in theme-michelin-corporate.css and consumed as the primary
  // button fill by `.ds__btn[data-ui-skin=primary]` (`--button-color-background:
  // var(--color-primary,inherit)`).
  blue: {
    primary: "#27509b", // :root --color-primary (brand blue, action / links)
    hover: "#3a61a6", // :root --color-primary-darken-03; also the inline primary-button hover fill
    mid: "#6182bb", // :root --color-primary-darken-02 (mid blue accent)
    light: "#d4e7fa", // :root --color-primary-lighten-01 (light blue tint)
    pale: "#c1d6ef" // :root --color-primary-lighten-02 (pale blue tint)
  },
  // Deep navy + purple tertiary accents, declared as `:root{
  // --color-tertiary-01:#00205b}` and `:root{--color-tertiary-02:#582c83}`.
  navy: "#00205b", // :root --color-tertiary-01 (deep navy, inverse surfaces)
  purple: "#582c83", // :root --color-tertiary-02 (purple accent)
  // Michelin yellow — the brand's second accent, declared by the brand-owned
  // rule `.ds__card-panel[data-ui-skin=secondary]{--card-color-background:
  // #fce500;--card-color-text:#000;--card-color-border:#fce500}` (yellow fill
  // carrying black text, exactly how the brand uses it).
  yellow: "#fce500", // .ds__card-panel secondary skin (accent fill)
  // Neutral scale from the brand `:root` dark/light ramps.
  neutral: {
    0: "#ffffff", // :root --color-main-background / --color-light
    50: "#f2f2f2", // :root --color-light-05 (secondary surface)
    100: "#e5e5e5", // :root --color-light-10
    200: "#cccccc", // :root --color-light-20 (card base border)
    500: "#404040", // :root --color-dark-60 (secondary text)
    600: "#666666", // :root --color-dark-40 (muted text, focus outline)
    800: "#1a1a1a", // :root --color-main-text / --color-dark-80 (body text)
    900: "#000000" // :root --color-dark (darkest)
  },
  // System / status colours from the brand `:root --color-is-*` tokens, except
  // the warning text step which is derived (à confirmer).
  system: {
    success: "#2e7d32", // :root --color-is-valid
    warning: "#9a6104", // derived AA warning text via the stop rule from :root --color-is-warning #f9a825 (à confirmer)
    error: "#b71c1c", // :root --color-is-error
    info: "#27509b" // :root --color-is-info (Michelin blue)
  }
} as const;

// --- foundation (Michelin-specific values) ----------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family carries Michelin's PRIMARY blue scale
    // (pale tint → brand blue → hover blue).
    blue: {
      10: michelinColor.blue.light, // #d4e7fa light blue tint
      60: michelinColor.blue.primary, // #27509b Michelin blue (primary)
      80: michelinColor.blue.hover // #3a61a6 hover blue
    },
    // Sentropic "cyan" accent slot parked on measured Michelin tints: the pale
    // blue, the mid blue and the purple tertiary accent (role assignment
    // à confirmer — the brand publishes no cyan ramp).
    cyan: {
      10: michelinColor.blue.pale, // #c1d6ef pale blue tint
      50: michelinColor.blue.mid, // #6182bb mid blue accent
      70: michelinColor.purple // #582c83 purple tertiary accent (à confirmer)
    },
    // Sentropic "slate" role family mapped onto the Michelin neutral scale.
    slate: {
      0: michelinColor.neutral[0], // white
      10: michelinColor.neutral[50], // secondary surface
      20: michelinColor.neutral[200], // card base border
      60: michelinColor.neutral[500], // secondary text
      80: michelinColor.neutral[800], // primary text
      90: michelinColor.neutral[900] // darkest
    },
    feedback: {
      success: michelinColor.system.success,
      warning: michelinColor.system.warning,
      error: michelinColor.system.error,
      info: michelinColor.system.info
    }
  },
  // Michelin declares `:root{--font-family-primary:"Noto Sans",Arial,
  // sans-serif;--font-family-secondary:"Michelin Unit Titling",Helvetica,
  // sans-serif}` in theme-michelin-corporate.css (confirmed identical on
  // michelin.fr). Body/controls use Noto Sans, display titles use Michelin
  // Unit Titling (also set per-heading via `.ds__heading:where(h1){
  // --heading-font:"Michelin Unit Titling",Helvetica,sans-serif}`). Mono is
  // the system stack. We reference the font *names* only, not binaries.
  font: {
    sans: "'Noto Sans', Arial, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Michelin Unit Titling', Helvetica, 'Noto Sans', sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; the brand scale is rem-based too).
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
  // Michelin geometry is rounded at 0.8rem: `.ds__btn,.ds__btn-icon{
  // border-radius:.8rem}`, `.ds__input{...border-radius:.8rem}` and
  // `[data-ui-card-base]{border-radius:.8rem}`; small elements (link-sm,
  // focus ring) use .4rem.
  radius: {
    none: "0",
    sm: "0.4rem", // small elements / focus ring
    md: "0.8rem", // buttons / inputs
    lg: "0.8rem", // cards
    pill: "999px" // tags / pills
  },
  // Light, neutral elevation tinted with the brand ink. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(26 26 26 / 0.10)",
    medium: "0 4px 12px rgb(26 26 26 / 0.14)", // aligned with the reference theme package's geometry (à confirmer)
    floating: "0 8px 24px rgb(26 26 26 / 0.18)" // aligned with the reference theme package's geometry (à confirmer)
  },
  // Motion durations are not tokenised by Michelin publicly; kept aligned
  // with the reference theme package's geometry ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)" // aligned with the reference theme package's geometry (à confirmer)
  },
  // z-index roles are not brand-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Michelin) ----------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // field border .1rem
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Control density. The brand publishes no usable control-height geometry, so
  // controlHeight/iconSize reuse the Sentropic base values while the remaining
  // density keys are aligned with the reference theme package's geometry
  // (à confirmer).
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.5rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" }, // aligned with the reference theme package's geometry (à confirmer)
    md: { controlHeight: "2.5rem", paddingBlock: "0.375rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" }, // aligned with the reference theme package's geometry (à confirmer)
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" } // aligned with the reference theme package's geometry (à confirmer)
  },
  // Michelin typography: Noto Sans for interactive/fields/labels, Michelin
  // Unit Titling for display titles. Button labels carry no transform.
  typography: {
    control: { family: "'Noto Sans', Arial, system-ui, sans-serif", size: "1rem", weight: "500", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Noto Sans', Arial, system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Noto Sans', Arial, system-ui, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Brand links are Michelin blue #27509b (`.ds__link[data-ui-skin=
    // tertiary][data-ui-selected=true]{--link-color-text:#27509b}` and
    // `.ds__lang-selector ...{--link-color-text:#27509b}`), not underlined at
    // rest (`.ds__link{...text-decoration:none}`); hover underline is
    // à confirmer.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto" // à confirmer
    }
  },
  disabledOpacity: "0.5", // aligned with the reference theme package's geometry (à confirmer)
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "ease-in-out" }, // aligned with the reference theme package's geometry (à confirmer)
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // FOCUS = a brand OUTLINE: `.ds__btn-icon:focus,.ds__breadcrumb
  // .ds__btn-icon:focus-visible{...outline:.2rem dashed #666}` — a 2px dashed
  // grey outline (the dashed style is noted here; the strategy enum carries
  // the technique). Offset is not published (à confirmer).
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px", // à confirmer
    color: michelinColor.neutral[600], // #666666 dashed brand outline
    inset: "0"
  },
  // Form fields are BOXED (outline): `.ds__input{background-color:#fff;
  // border:.1rem solid var(--form-input-border,#1a1a1a);border-radius:.8rem;
  // ...}` — a white fill with four equal side borders. `style: "outline"`
  // makes the builder draw them from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: michelinColor.neutral[0], // #ffffff
    underlineColor: michelinColor.neutral[200], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in Michelin blue with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2327509b' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: a subtle 1px grey border + 0.8rem radius, light hover tint
  // (`[data-ui-card-base]{border-radius:.8rem;--card-color-background:#fff;
  // --card-base-border-color:var(--color-light-20)}`).
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: michelinColor.neutral[50] // #f2f2f2
  },
  // Secondary button = OUTLINED in Michelin blue: transparent fill (brand
  // `.ds__btn[data-ui-skin=secondary]` sets `--button-color-background:
  // transparent`), blue border + navy text, light blue fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: michelinColor.blue.primary, // #27509b stroke
    hoverBackground: michelinColor.blue.light // #d4e7fa light fill on hover
  },
  // Tabs / top-nav: active tab = Michelin-blue label with a bottom blue
  // underline (selected tertiary links declare `--link-color-text:#27509b`).
  tabs: {
    activeText: michelinColor.blue.primary, // #27509b selected blue label
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
  // Pagination: borderless blue text links; active page = filled Michelin blue
  // with white text for AA contrast (7.76:1).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: michelinColor.blue.primary, // #27509b link text
    activeBackground: michelinColor.blue.primary, // #27509b filled active page
    activeText: "#ffffff", // white on Michelin blue (7.76:1)
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb: blue links, dark current page, grey separators.
  breadcrumb: {
    linkText: michelinColor.blue.primary, // #27509b
    text: michelinColor.neutral[600], // #666666 trail text
    currentText: michelinColor.neutral[800], // #1a1a1a current page
    separator: michelinColor.neutral[600], // #666666
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
  // Accordion / details: a dark bold summary trigger.
  accordion: {
    text: michelinColor.neutral[800], // #1a1a1a summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "700",
    lineHeight: "1.5rem" // 24px
  },
  // Tag: a small 0.8rem-radius grey chip (brand radius).
  tag: {
    radius: "0.8rem",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: michelinColor.neutral[50], // #f2f2f2
    neutralText: michelinColor.neutral[800] // #1a1a1a
  },
  // Badge: a 0.8rem-radius filled badge in Michelin blue with white text
  // (7.76:1).
  badge: {
    radius: "0.8rem",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: michelinColor.blue.primary, // #27509b
    infoText: "#ffffff" // white on Michelin blue (7.76:1)
  },
  // Checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: michelinColor.neutral[800] // #1a1a1a
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
    textColor: michelinColor.neutral[800] // #1a1a1a
  }
} as const;

// --- semantic (Michelin-specific role mapping) -------------------------------
const semantic = {
  surface: {
    default: michelinColor.neutral[0], // white
    subtle: michelinColor.neutral[50], // #f2f2f2 secondary surface
    raised: michelinColor.neutral[0], // white
    inverse: michelinColor.navy, // #00205b deep navy reverse surface
    overlay: "rgb(26 26 26 / 0.6)" // derived modal backdrop from the brand overlay ink #1a1a1a (à confirmer)
  },
  text: {
    primary: michelinColor.neutral[800], // #1a1a1a (body color)
    secondary: michelinColor.neutral[500], // #404040 (secondary)
    muted: michelinColor.neutral[600], // #666666 (muted)
    inverse: michelinColor.neutral[0], // white on dark / coloured surfaces
    link: michelinColor.blue.primary // #27509b Michelin blue link (7.76:1)
  },
  border: {
    subtle: michelinColor.neutral[200], // #cccccc (card base border)
    strong: michelinColor.neutral[600], // #666666
    interactive: michelinColor.blue.primary // #27509b Michelin blue interactive (7.76:1)
  },
  action: {
    primary: michelinColor.blue.primary, // #27509b Michelin blue primary
    primaryHover: michelinColor.blue.hover, // #3a61a6 darker hover
    primaryText: "#ffffff", // white on Michelin blue (7.76:1)
    secondary: michelinColor.neutral[50], // #f2f2f2 secondary surface
    secondaryHover: michelinColor.neutral[100], // #e5e5e5
    secondaryText: michelinColor.navy, // #00205b deep navy
    danger: michelinColor.system.error // #b71c1c error red
  },
  feedback: {
    success: michelinColor.system.success,
    warning: michelinColor.system.warning,
    error: michelinColor.system.error,
    info: michelinColor.system.info
  },
  status: {
    pending: michelinColor.system.warning,
    processing: michelinColor.system.info,
    completed: michelinColor.system.success,
    failed: michelinColor.system.error
  },
  // Categorical data-vis palette built from the brand hues: Michelin blue,
  // deep navy, purple accent, Michelin yellow (fill with dark text), mid blue,
  // plus the status hues. The brand publishes no 8-colour sequential scale,
  // so the combination is a coherent proposal (see MAPPING.md, "à confirmer").
  data: {
    category1: michelinColor.blue.primary, // #27509b Michelin blue
    category2: michelinColor.navy, // #00205b deep navy
    category3: michelinColor.purple, // #582c83 purple accent
    category4: michelinColor.yellow, // #fce500 Michelin yellow
    category5: michelinColor.blue.mid, // #6182bb mid blue
    category6: michelinColor.system.success, // #2e7d32 green
    category7: michelinColor.system.error, // #b71c1c red
    category8: michelinColor.neutral[500] // #404040 grey
  }
} as const;

/**
 * The Michelin theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Michelin-specific values, and
 * the `component` layer is REBUILT from this theme's own semantic/foundation
 * via `createComponent` — so the Michelin blue brand reaches the components
 * (buttons, tabs, pagination, chat bubbles…), not just the elements that read
 * semantic vars directly.
 */
export const michelinTheme: TenantTheme = {
  id: "michelin",
  label: "Michelin",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default michelinTheme;
