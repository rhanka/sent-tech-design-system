import { component, semantic } from "@sentropic/design-system-tokens";
import type { TenantTheme } from "../schema.js";

export const entropicTheme: TenantTheme = {
  id: "entropic",
  label: "Entropic",
  mode: "light",
  tokens: {
    semantic: {
      ...semantic,
      action: {
        ...semantic.action,
        primary: "oklch(50% 0.134 242.749)",
        primaryText: "#ffffff"
      }
    },
    component: {
      ...component,
      chat: {
        ...component.chat,
        composerSurface: "#ffffff",
        toolCallSurface: "#f8fafc"
      }
    }
  }
};
