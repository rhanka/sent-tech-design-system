import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * IBM Carbon Design System theme for the Sentropic token structure.
 *
 * All values below are taken from the PUBLIC, open-source IBM Carbon Design
 * System (v11). Sources are documented in MAPPING.md. Where Carbon has no
 * direct equivalent for a Sentropic role, the closest Carbon token is used and
 * the choice is noted in MAPPING.md.
 *
 * Carbon color reference (Gray theme — "White" light theme):
 *   White       #ffffff   Gray 10   #f4f4f4   Gray 20   #e0e0e0
 *   Gray 30     #c6c6c6   Gray 40   #a8a8a8   Gray 50   #8d8d8d
 *   Gray 60     #6f6f6f   Gray 70   #525252   Gray 80   #393939
 *   Gray 90     #262626   Gray 100  #161616
 *   Blue 60     #0f62fe ($interactive / primary)
 *   Blue 70     #0043ce ($support-info, hover)
 *   Cyan 50     #1192e8 (data-vis)
 *   Support:    error #da1e28  success #24a148  warning #f1c21b  info #0043ce
 */

// --- Carbon raw color palette (public, Carbon v11) -------------------------
const carbonColor = {
  // Gray family -> drives surfaces, text and borders
  gray: {
    0: "#ffffff", // White
    10: "#f4f4f4", // Gray 10
    20: "#e0e0e0", // Gray 20
    30: "#c6c6c6", // Gray 30
    50: "#8d8d8d", // Gray 50
    60: "#6f6f6f", // Gray 60
    70: "#525252", // Gray 70
    80: "#393939", // Gray 80
    90: "#262626", // Gray 90
    100: "#161616" // Gray 100
  },
  // Blue family -> interactive / action / link
  blue: {
    10: "#edf5ff", // Blue 10
    60: "#0f62fe", // Blue 60 ($interactive)
    70: "#0043ce", // Blue 70 (hover / $support-info)
    80: "#002d9c" // Blue 80
  },
  // Cyan family -> secondary accent / data-vis
  cyan: {
    10: "#e5f6ff", // Cyan 10
    50: "#1192e8", // Cyan 50
    70: "#00539a" // Cyan 70
  },
  // Support / status colors (Carbon $support-*)
  support: {
    error: "#da1e28", // Red 60   ($support-error)
    success: "#24a148", // Green 50 ($support-success)
    warning: "#f1c21b", // Yellow 30 ($support-warning)
    info: "#0043ce" // Blue 70  ($support-info)
  }
} as const;

// --- foundation (Carbon-specific values) -----------------------------------
const foundation = {
  color: {
    blue: {
      10: carbonColor.blue[10],
      60: carbonColor.blue[60],
      80: carbonColor.blue[80]
    },
    cyan: {
      10: carbonColor.cyan[10],
      50: carbonColor.cyan[50],
      70: carbonColor.cyan[70]
    },
    // Sentropic "slate" role family mapped onto the Carbon Gray scale.
    slate: {
      0: carbonColor.gray[0],
      10: carbonColor.gray[10],
      20: carbonColor.gray[20],
      60: carbonColor.gray[60],
      80: carbonColor.gray[80],
      90: carbonColor.gray[90]
    },
    feedback: {
      success: carbonColor.support.success,
      warning: carbonColor.support.warning,
      error: carbonColor.support.error,
      info: carbonColor.support.info
    }
  },
  // Carbon's product type family is IBM Plex (Sans / Mono).
  // IBM Plex Serif used for the display role.
  font: {
    sans: "'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'IBM Plex Sans', system-ui, sans-serif",
    mono: "'IBM Plex Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // Carbon spacing scale ($spacing-01 .. $spacing-13). Base unit 8px, mini 2px.
  // Mapped to the Sentropic spacing keys by matching pixel values where
  // possible (1rem = 16px). See MAPPING.md for the full scale.
  spacing: {
    0: "0", // 0
    1: "0.25rem", // 4px   ~ $spacing-02
    2: "0.5rem", // 8px   = $spacing-03
    3: "0.75rem", // 12px  = $spacing-04
    4: "1rem", // 16px  = $spacing-05
    6: "1.5rem", // 24px  = $spacing-06
    8: "2rem", // 32px  = $spacing-07
    12: "3rem", // 48px  = $spacing-09
    16: "4rem" // 64px  = $spacing-10
  },
  // Carbon corners are SQUARE for productive components (button/input/tabs).
  // Source: Carbon v11 — most components have 0 radius. Cards/tiles may use a
  // tiny radius in newer guidance, but the pilot keeps controls + cards square.
  radius: {
    none: "0", // square (Carbon default for most components)
    sm: "0", // controls square
    md: "0", // button / input / tabs — square in Carbon
    lg: "0", // cards — square in Carbon
    pill: "999px" // tags / pills
  },
  // Carbon elevation: drop shadows from the public elevation guidance.
  shadow: {
    subtle: "0 1px 2px rgb(22 22 22 / 0.10)",
    medium: "0 2px 6px rgb(22 22 22 / 0.20)",
    floating: "0 8px 16px rgb(22 22 22 / 0.30)"
  },
  // Carbon motion ($duration-* + productive easing).
  motion: {
    fast: "110ms", // $duration-fast-02
    normal: "150ms", // $duration-moderate-01
    slow: "240ms", // $duration-moderate-02
    easing: "cubic-bezier(0.2, 0, 0.38, 0.9)" // Carbon productive standard
  },
  // z-index roles are not Carbon-specific; kept aligned with Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Phase 1, Carbon v11) -----------------------------
  // Carbon control borders: 1px subtle; focus ring is a 2px inset stroke.
  // Source: carbondesignsystem.com (style/themes + component specs).
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Carbon field/button sizes: sm 32px, md(field default) 40px, lg 48px.
  // Source: Carbon "Button" + "Text input" size specs ($spacing scale).
  // Carbon buttons use asymmetric padding (more on the left, label-left), but
  // we keep symmetric inline padding here ("à confirmer" the exact 16/64 split).
  density: {
    // fontSize per size (anatomy v1.1.0). Carbon scales buttons by HEIGHT, not by
    // label size — the label stays $body-compact-01 (0.875rem) across sm/md/lg.
    // Source: Carbon "Button" type spec. (sm/lg "à confirmer" but Carbon keeps it flat.)
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "0.875rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "3rem", fontSize: "0.875rem" }
  },
  // Carbon typography = IBM Plex Sans. Body 0.875rem/1.43 ($body-01),
  // label 0.75rem/1.33 ($label-01). Source: Carbon "Type" scale.
  typography: {
    control: { family: "'IBM Plex Sans', system-ui, sans-serif", size: "0.875rem", weight: "400", lineHeight: "1.29", letterSpacing: "0.16px", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'IBM Plex Sans', system-ui, sans-serif", size: "0.875rem", weight: "400", lineHeight: "1.43", letterSpacing: "0.16px", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'IBM Plex Sans', system-ui, sans-serif", size: "0.75rem", weight: "400", lineHeight: "1.33", letterSpacing: "0.32px", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Carbon links are NOT underlined by default; underline appears on hover.
    // Source: Carbon "Link". Base state: no underline → underline on hover, now
    // tokenised via textDecorationHover (anatomy v1.1.0) instead of a CSS escape.
    link: { family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "0.15em", textDecorationHover: "underline" }
  },
  disabledOpacity: "1", // Carbon disabled = token colours, not opacity
  transition: { property: "background-color, border-color, color, box-shadow", duration: "110ms", easing: "cubic-bezier(0.2, 0, 0.38, 0.9)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1rem", lg: "1.25rem" },
  // Carbon FOCUS = 2px INSET box-shadow in $focus (Blue 60). This is Carbon's
  // signature focus technique (drawn inside the box), NOT a native outline.
  // Source: Carbon "Focus" guidance — $focus #0f62fe, 2px inset.
  focus: {
    strategy: "inset",
    width: "2px",
    offset: "0",
    color: "#0f62fe", // Carbon $focus (Blue 60)
    inset: "0"
  },
  // Carbon « Text input » (White theme) is a FILLED field with a BOTTOM RULE
  // only (not a boxed encadré): $field-01 fill + a single $border-strong bottom
  // border. This is the field-style primitive (anatomy v1.2.0) that makes our
  // input faithful. Source: carbondesignsystem.com / « Text input » (White
  // theme). fillBg = $field-01 Gray 10 #f4f4f4. Bottom rule = $border-strong
  // Gray 50 #8d8d8d, 1px. Carré (radius 0, déjà posé).
  field: {
    style: "filled-underline",
    fillBg: carbonColor.gray[10], // #f4f4f4 ($field-01)
    underlineColor: carbonColor.gray[50], // #8d8d8d ($border-strong)
    underlineWidth: "1px"
  }
} as const;

// --- semantic (Carbon-specific role mapping) -------------------------------
const semantic = {
  surface: {
    default: carbonColor.gray[0], // $background (White theme)
    subtle: carbonColor.gray[10], // $layer-01 / $background-active
    raised: carbonColor.gray[0], // $layer-01 on white
    inverse: carbonColor.gray[90], // $background-inverse (Gray 90)
    overlay: "rgb(22 22 22 / 0.50)" // $overlay
  },
  text: {
    primary: carbonColor.gray[100], // $text-primary (Gray 100)
    secondary: carbonColor.gray[70], // $text-secondary (Gray 70)
    muted: carbonColor.gray[60], // $text-helper (Gray 60)
    inverse: carbonColor.gray[0], // $text-inverse (White)
    link: carbonColor.blue[60] // $link-primary (Blue 60)
  },
  border: {
    subtle: carbonColor.gray[20], // $border-subtle (Gray 20)
    strong: carbonColor.gray[50], // $border-strong (Gray 50)
    interactive: carbonColor.blue[60] // $border-interactive / $focus (Blue 60)
  },
  action: {
    primary: carbonColor.blue[60], // $interactive / $button-primary (Blue 60)
    primaryHover: carbonColor.blue[70], // $button-primary-hover (Blue 70 #0043ce) — anatomy v1.1.0
    primaryText: carbonColor.gray[0], // $text-on-color (White)
    secondary: carbonColor.gray[80], // $button-secondary (Gray 80)
    secondaryHover: carbonColor.gray[90], // $button-secondary-hover (Gray 90)
    secondaryText: carbonColor.gray[0], // $text-on-color (White)
    danger: carbonColor.support.error // $button-danger-primary (Red 60)
  },
  feedback: {
    success: carbonColor.support.success,
    warning: carbonColor.support.warning,
    error: carbonColor.support.error,
    info: carbonColor.support.info
  },
  status: {
    pending: carbonColor.support.warning,
    processing: carbonColor.support.info,
    completed: carbonColor.support.success,
    failed: carbonColor.support.error
  },
  // Carbon categorical data-vis palette (14-color), first 8 colors.
  data: {
    category1: "#6929c4", // Purple 70
    category2: "#1192e8", // Cyan 50
    category3: "#005d5d", // Teal 70
    category4: "#9f1853", // Magenta 70
    category5: "#fa4d56", // Red 50
    category6: "#570408", // Red 90
    category7: "#198038", // Green 60
    category8: "#002d9c" // Blue 80
  }
} as const;

export const carbonTheme: TenantTheme = {
  id: "carbon",
  label: "IBM Carbon",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    // Rebuilt from this theme's own semantic/foundation so Carbon's brand
    // (Blue 60, grays, radii…) reaches the components, not just the elements
    // that read semantic vars directly. Reusing the base `component` would
    // leave components on Sent Tech.
    component: createComponent(semantic, foundation)
  }
};

export default carbonTheme;
