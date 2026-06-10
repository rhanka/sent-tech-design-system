/**
 * semantic.dark — dark-mode counterpart to the base semantic tokens.
 * Vit dans le package THEMES (le dark est une décision de thème, pas un token
 * core) : évite d'ajouter des exports au package tokens (lien workspace fragile).
 * Values follow the OKLCH inversion table in docs/dark-mode-spec.md.
 * status.* derives from feedback.* automatically (mirrors light-mode pattern).
 * data.category* are the Tableau-10 palette lightened ~15 L-points.
 */
export const semanticDark = {
  surface: {
    default: "oklch(15% 0.012 250)",
    subtle: "oklch(19% 0.014 250)",
    raised: "oklch(21% 0.015 250)",
    inverse: "oklch(96% 0.005 250)",
    overlay: "rgb(2 4 8 / 0.66)"
  },
  text: {
    primary: "oklch(96% 0.005 250)",
    secondary: "oklch(78% 0.012 250)",
    muted: "oklch(66% 0.018 250)",
    inverse: "oklch(15% 0.012 250)",
    link: "oklch(72% 0.13 242)"
  },
  border: {
    subtle: "oklch(28% 0.014 250)",
    strong: "oklch(42% 0.016 250)",
    interactive: "oklch(72% 0.13 242)"
  },
  action: {
    primary: "oklch(62% 0.15 242)",
    primaryHover: "oklch(70% 0.15 242)",
    primaryText: "oklch(17% 0.012 250)",
    secondary: "oklch(24% 0.015 250)",
    secondaryHover: "oklch(28% 0.014 250)",
    secondaryText: "oklch(96% 0.005 250)",
    danger: "oklch(64% 0.19 25)"
  },
  feedback: {
    success: "oklch(70% 0.17 150)",
    warning: "oklch(76% 0.15 75)",
    error: "oklch(64% 0.19 25)",
    info: "oklch(68% 0.15 250)"
  },
  status: {
    pending: "oklch(76% 0.15 75)",
    processing: "oklch(68% 0.15 250)",
    completed: "oklch(70% 0.17 150)",
    failed: "oklch(64% 0.19 25)"
  },
  data: {
    category1: "oklch(60% 0.08 242)",
    category2: "oklch(75% 0.14 67)",
    category3: "oklch(68% 0.16 23)",
    category4: "oklch(73% 0.09 195)",
    category5: "oklch(68% 0.14 148)",
    category6: "oklch(83% 0.13 90)",
    category7: "oklch(65% 0.10 320)",
    category8: "oklch(78% 0.12 15)"
  }
} as const;
