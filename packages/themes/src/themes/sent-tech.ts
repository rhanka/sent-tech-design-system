import { component, semantic } from "@sent-tech/tokens";
import type { TenantTheme } from "../schema.js";

export const sentTechTheme: TenantTheme = {
  id: "sent-tech",
  label: "Sent Tech",
  mode: "light",
  tokens: {
    semantic,
    component
  }
};
