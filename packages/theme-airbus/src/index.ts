import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Airbus Design System theme for the Sentropic token structure.
 *
 * The first pass maps the local Airbus token package from ../airbus-design-system:
 * design-tokens/src/core plus the Airbus brand layer. Component anatomy follows
 * the public CSS style functions in packages/styles/src/elements.
 */
const airbusColor = {
  primaryBlue: {
    10: "#e5ecf7",
    60: "#255fcc",
    70: "#063b9e",
    80: "#002d80",
    90: "#00205b",
    100: "#011333"
  },
  skyBlue: {
    10: "#ebf8ff",
    50: "#5fc3ff",
    60: "#3cb7ff",
    80: "#0b78b8"
  },
  turquoise: {
    50: "#16d4f0",
    70: "#00aec7",
    90: "#006775"
  },
  green: {
    80: "#08875b"
  },
  orange: {
    70: "#d56401"
  },
  yellow: {
    70: "#bb8e09"
  },
  purple: {
    70: "#bb35a7"
  },
  red: {
    70: "#e4002b",
    80: "#bb0023"
  },
  coolGrey: {
    10: "#eff1f4",
    20: "#e0e3e9",
    30: "#ced5dd",
    50: "#919cb0",
    60: "#63728a",
    80: "#3c4657",
    100: "#14171d"
  },
  warmGrey: {
    10: "#fafafa",
    20: "#f1f1f1",
    40: "#d4d4d4",
    60: "#a3a3a3",
    100: "#1a1a1a"
  },
  dark: {
    70: "#14171d"
  },
  base: {
    white: "#ffffff"
  }
} as const;

const foundation = {
  color: {
    blue: {
      10: airbusColor.primaryBlue[10],
      60: airbusColor.primaryBlue[60],
      80: airbusColor.primaryBlue[80]
    },
    cyan: {
      10: airbusColor.skyBlue[10],
      50: airbusColor.skyBlue[60],
      70: airbusColor.skyBlue[80]
    },
    slate: {
      0: airbusColor.base.white,
      10: airbusColor.warmGrey[10],
      20: airbusColor.coolGrey[20],
      60: airbusColor.coolGrey[60],
      80: airbusColor.coolGrey[80],
      90: airbusColor.dark[70]
    },
    feedback: {
      success: airbusColor.green[80],
      warning: airbusColor.yellow[70],
      error: airbusColor.red[70],
      info: airbusColor.primaryBlue[60]
    }
  },
  font: {
    sans: "Inter, Arial, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "Inter, Arial, system-ui, sans-serif",
    mono: "'Roboto Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  spacing: {
    0: "0",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    6: "1.5rem",
    8: "2rem",
    12: "3rem",
    16: "4rem"
  },
  radius: {
    none: "0",
    sm: "0.1875rem",
    md: "0.1875rem",
    lg: "0.375rem",
    pill: "62.5rem"
  },
  shadow: {
    subtle: "0 1px 4px 0 rgb(0 0 0 / 0.24)",
    medium: "0 2px 8px 0 rgb(0 0 0 / 0.20)",
    floating: "0 8px 32px 2px rgb(0 0 0 / 0.20)"
  },
  motion: {
    fast: "100ms",
    normal: "150ms",
    slow: "250ms",
    easing: "cubic-bezier(.4,.8,0,.99)"
  },
  z: {
    header: 1100,
    toast: 1200,
    overlay: 1000,
    modal: 1300,
    chat: 1400
  },
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0.25rem", paddingInline: "1rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.5rem", paddingInline: "0.5rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "0.875rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0.75rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1rem" }
  },
  buttonDensity: {
    md: {
      controlHeight: "2.25rem",
      paddingBlock: "0.375rem",
      paddingInline: "1rem"
    }
  },
  typography: {
    control: { family: "Inter, Arial, sans-serif", size: "0.875rem", weight: "700", lineHeight: "1.5rem", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "Inter, Arial, sans-serif", size: "0.875rem", weight: "400", lineHeight: "1.25rem", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "Inter, Arial, sans-serif", size: "0.875rem", weight: "700", lineHeight: "1.25rem", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    link: { family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none", textDecoration: "underline", decorationThickness: "auto", decorationOffset: "0.16em", textDecorationHover: "underline" }
  },
  disabledOpacity: "0.4",
  transition: { property: "background-color, border-color, color, box-shadow", duration: "100ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1rem", lg: "1.5rem" },
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: airbusColor.primaryBlue[60],
    inset: "0"
  },
  field: {
    style: "filled-underline",
    fillBg: airbusColor.warmGrey[10],
    underlineColor: airbusColor.coolGrey[60],
    underlineWidth: "1px",
    radiusTop: "0.1875rem",
    underlineMode: "shadow",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2300205b' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  buttonSecondary: {
    background: airbusColor.base.white,
    border: airbusColor.primaryBlue[90],
    hoverBackground: airbusColor.warmGrey[20]
  },
  card: {
    borderWidth: "0",
    background: airbusColor.base.white,
    fontSize: "0.875rem",
    lineHeight: "1.25rem"
  },
  tabs: {
    activeText: airbusColor.primaryBlue[90],
    activeBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.5rem",
    paddingInline: "1rem",
    fontSize: "0.875rem",
    lineHeight: "1.5rem",
    indicatorSide: "bottom"
  },
  tag: {
    radius: "0.1875rem",
    paddingBlock: "0.25rem",
    paddingInline: "0.5rem",
    fontSize: "0.75rem",
    fontWeight: "700",
    lineHeight: "1rem",
    neutralBackground: airbusColor.coolGrey[10],
    neutralText: airbusColor.dark[70]
  },
  search: {
    paddingBlock: "0.5rem",
    paddingInline: "2.5rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem"
  }
} as const;

const semantic = {
  surface: {
    default: airbusColor.base.white,
    subtle: airbusColor.warmGrey[10],
    raised: airbusColor.base.white,
    inverse: airbusColor.dark[70],
    overlay: "rgb(20 23 29 / 0.48)"
  },
  text: {
    primary: airbusColor.dark[70],
    secondary: airbusColor.coolGrey[60],
    muted: airbusColor.coolGrey[50],
    inverse: airbusColor.base.white,
    link: airbusColor.primaryBlue[60]
  },
  border: {
    subtle: airbusColor.coolGrey[20],
    strong: airbusColor.coolGrey[60],
    interactive: airbusColor.primaryBlue[60]
  },
  action: {
    primary: airbusColor.primaryBlue[90],
    primaryHover: airbusColor.primaryBlue[80],
    primaryText: airbusColor.base.white,
    secondary: airbusColor.base.white,
    secondaryHover: airbusColor.warmGrey[20],
    secondaryText: airbusColor.primaryBlue[90],
    danger: airbusColor.red[70]
  },
  feedback: {
    success: airbusColor.green[80],
    warning: airbusColor.yellow[70],
    error: airbusColor.red[70],
    info: airbusColor.primaryBlue[60]
  },
  status: {
    pending: airbusColor.yellow[70],
    processing: airbusColor.primaryBlue[60],
    completed: airbusColor.green[80],
    failed: airbusColor.red[70]
  },
  data: {
    category1: airbusColor.primaryBlue[90],
    category2: airbusColor.skyBlue[60],
    category3: airbusColor.turquoise[70],
    category4: airbusColor.green[80],
    category5: airbusColor.orange[70],
    category6: airbusColor.yellow[70],
    category7: airbusColor.purple[70],
    category8: airbusColor.red[70]
  }
} as const;

export const airbusTheme: TenantTheme = {
  id: "airbus",
  label: "Airbus",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default airbusTheme;
