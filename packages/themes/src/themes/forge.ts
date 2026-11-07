import { createComponent, foundation, semantic } from "@sentropic/design-system-tokens";
import { semanticDark } from "../semantic.dark.js";
import { foundationDark } from "../foundation.dark.js";
import type { TenantTheme } from "../schema.js";

const forgeSemantic = {
  ...semantic,
  action: {
    ...semantic.action,
    primary: "hsl(215 70% 25%)",
    primaryText: "hsl(0 0% 100%)"
  }
};

// Dark variant: same brand hue but lighter for dark backgrounds.
const forgeSemanticDark = {
  ...semanticDark,
  action: {
    ...semanticDark.action,
    primary: "hsl(215 70% 55%)",
    primaryText: "hsl(0 0% 100%)"
  }
};

// ── Site marketing tokens (additive block) ─────────────────────────────────
// Gradients of the public website (sentech-forge src/index.css --gradient-*),
// exposed as --st-semantic-gradient-*, and the component tokens Hero / Section /
// Badge read (each with a semantic fallback, so other themes render without
// them). Shadows are NOT duplicated: the header and cards use --st-shadow-*.
const forgeGradient = {
  primary: "linear-gradient(135deg, hsl(215 70% 25%), hsl(215 70% 35%))",
  accent: "linear-gradient(135deg, hsl(185 85% 45%), hsl(195 85% 55%))",
  hero: "linear-gradient(135deg, hsl(215 70% 25%) 0%, hsl(215 60% 30%) 50%, hsl(185 70% 40%) 100%)",
  // Values band: from primary/5 to accent/5 (Tailwind bg-gradient-to-br).
  subtle: "linear-gradient(to bottom right, hsl(215 70% 25% / 0.05), hsl(185 85% 45% / 0.05))"
};

const forgeGradientDark = {
  primary: "linear-gradient(135deg, hsl(215 70% 20%), hsl(215 60% 30%))",
  accent: "linear-gradient(135deg, hsl(185 85% 40%), hsl(195 85% 50%))",
  hero: "linear-gradient(135deg, hsl(215 60% 15%) 0%, hsl(215 50% 20%) 50%, hsl(185 60% 30%) 100%)",
  subtle: "linear-gradient(to bottom right, hsl(215 70% 55% / 0.08), hsl(185 85% 45% / 0.08))"
};

const forgeMarketingComponents = {
  hero: {
    overlay: "var(--st-semantic-gradient-hero)",
    overlayOpacity: "0.9"
  },
  section: {
    gradientBackground: "var(--st-semantic-gradient-subtle)",
    inverseBackground: "var(--st-semantic-gradient-primary)"
  },
  badge: {
    brandBackground: "var(--st-semantic-gradient-accent)"
  }
};

function withMarketing<T extends { badge?: object }>(component: T) {
  return {
    ...component,
    hero: forgeMarketingComponents.hero,
    section: forgeMarketingComponents.section,
    badge: { ...component.badge, ...forgeMarketingComponents.badge }
  };
}
// ── end site marketing tokens ───────────────────────────────────────────────

export const forgeTheme: TenantTheme = {
  id: "forge",
  label: "Sent Tech Forge",
  mode: "light",
  tokens: {
    foundation,
    semantic: { ...forgeSemantic, gradient: forgeGradient },
    // Reconstruit la couche component à partir du semantic du thème, sinon les
    // composants resteraient figés sur la base (cf. createComponent).
    component: withMarketing(createComponent(forgeSemantic, foundation))
  },
  tokensDark: {
    foundation: foundationDark,
    semantic: { ...forgeSemanticDark, gradient: forgeGradientDark },
    component: withMarketing(createComponent(forgeSemanticDark, foundationDark))
  }
};
