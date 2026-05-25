import { component, foundation, semantic } from "@sentropic/design-system-tokens";
import type { TenantTheme } from "../schema.js";

export const sentTechTheme: TenantTheme = {
  id: "sent-tech",
  label: "Sent Tech",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component
  }
};
