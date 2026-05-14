import { component, semantic } from "@sentropic/tokens";
import type { TenantTheme } from "../schema.js";

export const forgeTheme: TenantTheme = {
  id: "forge",
  label: "Sent Tech Forge",
  mode: "light",
  tokens: {
    semantic: {
      ...semantic,
      action: {
        ...semantic.action,
        primary: "hsl(215 70% 25%)",
        primaryText: "hsl(0 0% 100%)"
      }
    },
    component
  }
};
