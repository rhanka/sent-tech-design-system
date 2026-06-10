import { createComponent, foundation, semantic } from "@sentropic/design-system-tokens";
import { semanticDark } from "../semantic.dark.js";
import { foundationDark } from "../foundation.dark.js";
import type { TenantTheme } from "../schema.js";

const entropicSemantic = {
  ...semantic,
  action: {
    ...semantic.action,
    primary: "oklch(50% 0.134 242.749)",
    primaryText: semantic.action.primaryText
  }
};

const entropicComponent = createComponent(entropicSemantic, foundation);

// Dark variant keeps the same hue, lifted in lightness for dark backgrounds.
const entropicSemanticDark = {
  ...semanticDark,
  action: {
    ...semanticDark.action,
    primary: "oklch(62% 0.15 242.749)",
    primaryText: semanticDark.action.primaryText
  }
};

const entropicComponentDark = createComponent(entropicSemanticDark, foundationDark);

export const entropicTheme: TenantTheme = {
  id: "entropic",
  label: "Entropic",
  mode: "light",
  tokens: {
    foundation,
    semantic: entropicSemantic,
    component: {
      ...entropicComponent,
      chat: {
        ...entropicComponent.chat,
        composerSurface: entropicSemantic.surface.raised,
        toolCallSurface: entropicSemantic.surface.subtle
      }
    }
  },
  tokensDark: {
    foundation: foundationDark,
    semantic: entropicSemanticDark,
    component: {
      ...entropicComponentDark,
      chat: {
        ...entropicComponentDark.chat,
        composerSurface: entropicSemanticDark.surface.raised,
        toolCallSurface: entropicSemanticDark.surface.subtle
      }
    }
  }
};
