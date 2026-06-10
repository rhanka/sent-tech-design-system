import { component, foundation, semantic } from "@sentropic/design-system-tokens";
import { semanticDark } from "../semantic.dark.js";
import { foundationDark } from "../foundation.dark.js";
import { componentDark } from "../component.dark.js";
import type { TenantTheme } from "../schema.js";

export const sentTechTheme: TenantTheme = {
  id: "sent-tech",
  label: "Sent Tech",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component
  },
  tokensDark: {
    foundation: foundationDark,
    semantic: semanticDark,
    component: componentDark
  }
};
