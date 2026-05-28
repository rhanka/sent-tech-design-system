import { createComponent, foundation, semantic } from "@sentropic/design-system-tokens";
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
  }
};
