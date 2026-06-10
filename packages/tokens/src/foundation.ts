export type TokenValue = string | number;
export interface TokenTree {
  // `undefined` is permitted so that strictly-typed sub-trees with OPTIONAL
  // leaves (e.g. ComponentAnatomy state deltas) still satisfy the index
  // signature. The flattener skips `undefined`, so no empty CSS var is emitted.
  [key: string]: TokenValue | TokenTree | undefined;
}

export const foundation = {
  color: {
    blue: {
      10: "oklch(97% 0.02 242)",
      60: "oklch(50% 0.134 242.749)",
      80: "oklch(32% 0.11 242)"
    },
    cyan: {
      10: "oklch(96% 0.04 195)",
      50: "oklch(70.4% 0.14 182.503)",
      70: "oklch(48% 0.12 190)"
    },
    slate: {
      0: "#ffffff",
      10: "#f8fafc",
      20: "#e2e8f0",
      60: "#475569",
      80: "#1e293b",
      90: "#0f172a"
    },
    feedback: {
      success: "#16a34a",
      warning: "#d97706",
      error: "#dc2626",
      info: "#2563eb"
    }
  },
  font: {
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "Inter, system-ui, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
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
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    pill: "999px"
  },
  shadow: {
    subtle: "0 1px 2px rgb(15 23 42 / 0.08)",
    medium: "0 8px 24px rgb(15 23 42 / 0.12)",
    floating: "0 18px 45px rgb(15 23 42 / 0.18)"
  },
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.16, 1, 0.3, 1)"
  },
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Phase 1) ----------------------------------------
  // Border weights — controls how heavy outlines/dividers read per theme.
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  // Default stroke style for control borders.
  borderStyle: {
    solid: "solid"
  },
  // Density grid: control geometry per size token. controlHeight is the target
  // box height; paddingBlock/Inline are intrinsic insets; gap is the inline
  // gap between icon + label; minWidth is the smallest allowed control width.
  density: {
    sm: {
      controlHeight: "2rem", // 32px
      paddingBlock: "0",
      paddingInline: "0.75rem",
      gap: "0.375rem",
      minWidth: "2rem"
    },
    md: {
      controlHeight: "2.5rem", // 40px
      paddingBlock: "0",
      paddingInline: "1rem",
      gap: "0.5rem",
      minWidth: "2.5rem"
    },
    lg: {
      controlHeight: "3rem", // 48px
      paddingBlock: "0",
      paddingInline: "1.25rem",
      gap: "0.5rem",
      minWidth: "3rem"
    }
  },
  // Typography by role. Each role is a self-contained set of text properties so
  // a theme can re-shape headings/labels/links without touching components.
  typography: {
    // Buttons / interactive control labels.
    control: {
      family: "var(--st-font-sans)",
      size: "0.9375rem", // 15px
      weight: "600",
      lineHeight: "1.2",
      letterSpacing: "0",
      textTransform: "none",
      textDecoration: "none",
      decorationThickness: "auto",
      decorationOffset: "auto"
    },
    // Form field input text.
    field: {
      family: "var(--st-font-sans)",
      size: "1rem", // 16px
      weight: "400",
      lineHeight: "1.5",
      letterSpacing: "0",
      textTransform: "none",
      textDecoration: "none",
      decorationThickness: "auto",
      decorationOffset: "auto"
    },
    // Field labels / form group legends.
    label: {
      family: "var(--st-font-sans)",
      size: "0.875rem", // 14px
      weight: "600",
      lineHeight: "1.4",
      letterSpacing: "0",
      textTransform: "none",
      textDecoration: "none",
      decorationThickness: "auto",
      decorationOffset: "auto"
    },
    // Hyperlinks.
    link: {
      family: "inherit",
      size: "inherit",
      weight: "inherit",
      lineHeight: "inherit",
      letterSpacing: "0",
      textTransform: "none",
      textDecoration: "underline",
      decorationThickness: "auto",
      decorationOffset: "0.18em"
    }
  },
  // Multiplier applied to disabled controls.
  disabledOpacity: "0.55",
  // Shared interaction transition tokens (consumed by anatomy `transition`).
  transition: {
    property: "background-color, border-color, color, box-shadow, outline-color",
    duration: "120ms",
    easing: "cubic-bezier(0.16, 1, 0.3, 1)"
  },
  // Pointer affordance roles.
  cursor: {
    interactive: "pointer",
    disabled: "not-allowed",
    text: "text"
  },
  // Inline icon sizing per control size token.
  iconSize: {
    sm: "1rem",
    md: "1.125rem",
    lg: "1.25rem"
  },
  // FOCUS STRATEGY = first-class primitive. The `strategy` selects WHICH CSS
  // technique a shared mixin uses (outline | ring | inset | double); the other
  // fields parametrise it. This is what lets DSFR (offset outline), Carbon
  // (inset box-shadow) and the base differ by *technique*, not just values.
  focus: {
    strategy: "outline", // outline | ring | inset | double
    width: "2px",
    offset: "2px",
    color: "var(--st-semantic-border-interactive)",
    inset: "0" // inset distance used by the `inset` strategy
  },
  // FIELD STYLE = first-class primitive (anatomy v1.2.0). Selects how form
  // fields are drawn: `outline` (boxed, 4 equal borders — the base Sent Tech
  // look) vs `filled-underline` (filled background + a single bottom rule —
  // the DSFR/Carbon signature). `fillBg`/`underlineColor`/`underlineWidth` are
  // only consumed when style = filled-underline; for `outline` the builder uses
  // surface.default + border.subtle. Themes override this block to switch style.
  field: {
    style: "outline", // outline | filled-underline
    fillBg: "var(--st-semantic-surface-default)",
    underlineColor: "var(--st-semantic-border-strong)",
    underlineWidth: "1px"
  }
} as const satisfies TokenTree;
