export type TokenValue = string | number;
export interface TokenTree {
  [key: string]: TokenValue | TokenTree;
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
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  z: {
    header: 50,
    overlay: 80,
    modal: 90,
    toast: 100,
    chat: 110
  }
} as const satisfies TokenTree;
