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

export const forgeTheme: TenantTheme = {
  id: "forge",
  label: "Sent Tech Forge",
  mode: "light",
  tokens: {
    foundation,
    semantic: forgeSemantic,
    // Reconstruit la couche component à partir du semantic du thème, sinon les
    // composants resteraient figés sur la base (cf. createComponent).
    component: createComponent(forgeSemantic, foundation)
  },
  tokensDark: {
    foundation: foundationDark,
    semantic: forgeSemanticDark,
    component: createComponent(forgeSemanticDark, foundationDark)
  }
};
