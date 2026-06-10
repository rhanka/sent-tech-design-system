import { toCssVariables } from "@sentropic/design-system-tokens";
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

/**
 * Compile a theme into 3 CSS blocks when `tokensDark` is present:
 *  1. `:root` (or custom selector) — light tokens + `color-scheme: light`
 *  2. `@media (prefers-color-scheme: dark) :root:not([data-color-mode="light"])` — auto dark
 *  3. `:root[data-color-mode="dark"]` — explicit dark toggle (highest authority)
 *
 * When `tokensDark` is absent, falls back to a single block (backward-compatible).
 * The selector option only applies to block 1; blocks 2–3 always target `:root`
 * because they respond to a global OS/user preference, not a scoped theme attribute.
 */
export function compileThemeWithModes(input: unknown, options: CompileThemeOptions = {}): string {
  assertTenantTheme(input);
  const theme = input as TenantTheme;
  const namespace = options.namespace ?? "st";

  // No dark tokens → backward-compatible single block.
  if (!theme.tokensDark) {
    return compileTheme(theme, options);
  }

  const selector = options.selector ?? `[data-st-theme="${theme.id}"]`;

  // Block 1: light mode (explicit selector, e.g. :root or [data-st-theme="…"])
  const lightBlock = toCssVariables(theme.tokens, selector, namespace)
    .replace(/\{/, `{\n  color-scheme: light;`);

  // Block 2: auto dark (prefers-color-scheme, overrideable by data-color-mode)
  const autoSelector = `@media (prefers-color-scheme: dark) {\n  :root:not([data-color-mode="light"])`;
  const darkVars = toCssVariables(theme.tokensDark, ":root", namespace)
    .replace(/^:root\s*\{/, `${autoSelector} {`)
    .replace(/\{/, `{\n    color-scheme: dark;`);
  // Re-close the @media wrapper
  const autoBlock = darkVars + "\n}";

  // Block 3: explicit dark (data-color-mode=dark, always wins)
  const explicitSelector = `:root[data-color-mode="dark"]`;
  const explicitBlock = toCssVariables(theme.tokensDark, explicitSelector, namespace)
    .replace(/\{/, `{\n  color-scheme: dark;`);

  return [lightBlock, autoBlock, explicitBlock].join("\n\n");
}
