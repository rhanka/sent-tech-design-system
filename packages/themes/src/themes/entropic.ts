import { component, foundation, semantic } from "@sentropic/design-system-tokens";
import type { TenantTheme } from "../schema.js";

export const entropicTheme: TenantTheme = {
  id: "entropic",
  label: "Entropic",
  mode: "light",
  tokens: {
    foundation,
    semantic: {
      ...semantic,
      action: {
        ...semantic.action,
        primary: "oklch(50% 0.134 242.749)",
        primaryText: semantic.action.primaryText
      }
    },
    component: {
      ...component,
      chat: {
        ...component.chat,
        composerSurface: semantic.surface.raised,
        toolCallSurface: semantic.surface.subtle
      }
    }
  }
};
