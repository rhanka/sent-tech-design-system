/**
 * The theme adoption of the elements package (§6.3, §6.5, §15 AC-L2): the
 * element reads the theme id from `hostConfig` (NEVER from the envelope —
 * §6.5: only the host writes `hostConfig`), loads the committed stylesheet
 * of `@sentropic/design-system-themes`, re-scopes its dark blocks to the
 * internal root (`scopeThemeCss`, `src/element/theme`), and adopts the
 * result through a constructable stylesheet — which also survives a strict
 * CSP that refuses Svelte's injected `<style>` (§6.4 strict row).
 *
 * `sent-tech` is the default theme and rides in the core chunk (a page that
 * renders nothing but bar charts pays no other theme); `forge` and
 * `entropic` load as lazy chunks (§6.6) so an unused theme costs nothing.
 */

import sentTechCss from "@sentropic/design-system-themes/css/sent-tech.css?raw";
import { scopeThemeCss } from "../theme/theme-scoping.js";

/** The themes the committed package ships (§6.3). */
export const THEME_IDS = ["sent-tech", "forge", "entropic"] as const;
export type ThemeId = (typeof THEME_IDS)[number];

/** The lazy loaders; sent-tech is static (core), the others are chunks. */
const THEME_SOURCES: Record<ThemeId, () => Promise<string>> = {
  "sent-tech": async () => sentTechCss,
  forge: async () => (await import("@sentropic/design-system-themes/css/forge.css?raw")).default,
  entropic: async () => (await import("@sentropic/design-system-themes/css/entropic.css?raw")).default,
};

const sheetCache = new Map<string, CSSStyleSheet>();

/** Resolve one theme id; an unknown id falls back to the default theme. */
export function normalizeThemeId(theme: unknown): ThemeId {
  return typeof theme === "string" && (THEME_IDS as readonly string[]).includes(theme)
    ? (theme as ThemeId)
    : "sent-tech";
}

/**
 * The scoped, constructed sheet of one theme. Cached per theme id: two
 * elements on a page with the same theme share one sheet instance.
 */
export async function loadThemeSheet(themeId: ThemeId): Promise<CSSStyleSheet> {
  const cached = sheetCache.get(themeId);
  if (cached !== undefined) return cached;
  const css = await THEME_SOURCES[themeId]();
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(scopeThemeCss(css, themeId));
  sheetCache.set(themeId, sheet);
  return sheet;
}

/**
 * Adopt the theme sheet into one shadow root, keeping any sheet the element
 * itself constructed (the Svelte style fallback, see element-action.ts).
 */
export async function adoptThemeSheet(shadowRoot: ShadowRoot, themeId: ThemeId): Promise<void> {
  const themeSheet = await loadThemeSheet(themeId);
  const own = shadowRoot.adoptedStyleSheets.filter((sheet) => sheet !== themeSheet);
  shadowRoot.adoptedStyleSheets = [...own, themeSheet];
}

/** Remove the theme sheet from one shadow root (theme switch cleanup). */
export function removeThemeSheet(shadowRoot: ShadowRoot, themeId: ThemeId): void {
  const themeSheet = sheetCache.get(themeId);
  shadowRoot.adoptedStyleSheets = shadowRoot.adoptedStyleSheets.filter(
    (sheet) => sheet !== themeSheet,
  );
}
