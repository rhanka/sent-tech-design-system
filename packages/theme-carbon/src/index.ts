import { component } from "@sentropic/design-system-themes";
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
  // Carbon corners are nearly square. $spacing tokens drive most radii;
  // Carbon uses very small radii (most components are square).
  radius: {
    none: "0", // square (Carbon default for most components)
    sm: "0.125rem", // 2px
    md: "0.25rem", // 4px  (Carbon button/tile small radius)
    lg: "0.5rem", // 8px
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
    primaryText: carbonColor.gray[0], // $text-on-color (White)
    secondary: carbonColor.gray[80], // $button-secondary (Gray 80)
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
    // The `component` layer is structural (it wires component roles to the
    // semantic/foundation roles above) and is not Carbon-specific, so the
    // Sentropic base `component` tokens are reused unchanged — same pattern as
    // the forge/entropic themes in @sentropic/design-system-themes.
    component
  }
};

export default carbonTheme;
