import { toCssVariables } from "@sentropic/tokens";
import { assertTenantTheme, type TenantTheme } from "./schema.js";

export interface CompileThemeOptions {
  selector?: string;
  namespace?: string;
}

export function compileTheme(input: unknown, options: CompileThemeOptions = {}): string {
  assertTenantTheme(input);
  const theme = input as TenantTheme;
  const selector = options.selector ?? `[data-st-theme="${theme.id}"]`;
  const namespace = options.namespace ?? "st";
  return toCssVariables(theme.tokens, selector, namespace);
}

export function compileThemeStyleTag(input: unknown, options: CompileThemeOptions = {}): string {
  assertTenantTheme(input);
  const theme = input as TenantTheme;
  return `<style data-st-theme-style="${theme.id}">\n${compileTheme(theme, options)}</style>`;
}
