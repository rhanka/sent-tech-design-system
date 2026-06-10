import { compileTheme, type TenantTheme } from "@sentropic/design-system-themes";

/**
 * Émet les CSS variables d'un thème en 3 blocs (light + dark auto via @media +
 * dark explicite via [data-color-mode="dark"]), en n'utilisant QUE `compileTheme`
 * (export publié du package themes). Le dark vient de `theme.tokensDark` (ajouté
 * au niveau themes). On évite ainsi de dépendre d'un export themes non encore
 * publié (themes est tag-publié) — ce que le check CT du docs résolvait depuis le
 * registre, sans le nouvel export.
 */
export function compileThemeModes(
  theme: TenantTheme,
  { selector = ":root" }: { selector?: string } = {}
): string {
  const light = `${compileTheme(theme, { selector })}\n${selector} { color-scheme: light; }`;
  const dark = (theme as TenantTheme & { tokensDark?: TenantTheme["tokens"] }).tokensDark;
  if (!dark) return light;
  const darkTheme = { ...theme, tokens: dark } as TenantTheme;
  const autoSel = `${selector}:not([data-color-mode="light"])`;
  const toggleSel = `${selector}[data-color-mode="dark"]`;
  const auto = `@media (prefers-color-scheme: dark) {\n${compileTheme(darkTheme, { selector: autoSel })}\n${autoSel} { color-scheme: dark; }\n}`;
  const toggle = `${compileTheme(darkTheme, { selector: toggleSel })}\n${toggleSel} { color-scheme: dark; }`;
  return [light, auto, toggle].join("\n");
}
