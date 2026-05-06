import type { TokenTree } from "@sent-tech/tokens";

export type ThemeMode = "light" | "dark";

export interface TenantTheme {
  id: string;
  label: string;
  mode: ThemeMode;
  tokens: TokenTree;
}

export function assertTenantTheme(input: unknown): asserts input is TenantTheme {
  if (!input || typeof input !== "object") {
    throw new Error("Theme must be an object");
  }
  const theme = input as Record<string, unknown>;
  if (typeof theme.id !== "string" || theme.id.trim().length === 0) {
    throw new Error("Theme id is required");
  }
  if (typeof theme.label !== "string" || theme.label.trim().length === 0) {
    throw new Error("Theme label is required");
  }
  if (theme.mode !== "light" && theme.mode !== "dark") {
    throw new Error("Theme mode must be light or dark");
  }
  if (!theme.tokens || typeof theme.tokens !== "object") {
    throw new Error("Theme tokens are required");
  }
}
