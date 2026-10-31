/**
 * The internal themed root every wrapper renders (§6.3, §6.4): one action
 * that (1) registers the element's runtime (so `element.state`,
 * `element.diagnostics` and `element.ready` work), (2) adopts the scoped
 * theme sheet in the shadow root, and (3) sweeps and observes the shadow
 * root for Svelte's injected `<style>` elements, converting each into a
 * constructable stylesheet — the §6.4 strict-CSP fallback: under
 * `style-src` without `'unsafe-inline'` the browser refuses the injected
 * element, the wrapper re-applies the same bytes through the CSSOM, and the
 * rendered output is styled.
 */

import { registerRuntime } from "./element-api.js";
import type { ElementRuntime } from "./element-runtime.svelte.js";
import { adoptThemeSheet, normalizeThemeId, removeThemeSheet, type ThemeId } from "./theme.js";

/** The action's reactive parameter. */
export interface ThemedRootOptions {
  readonly runtime: ElementRuntime;
  readonly theme: unknown;
  readonly colorScheme: unknown;
}

/** The explicit color mode; `auto` (or absent) keeps the media-driven block. */
function colorMode(colorScheme: unknown): string | undefined {
  return colorScheme === "light" || colorScheme === "dark" ? colorScheme : undefined;
}

/**
 * Convert every `<style>` in the shadow root into an adopted stylesheet and
 * remove the element. Runs on the existing children and then observes the
 * root, so styles Svelte injects after the action's mount are converted
 * too. Never throws: on a browser without `CSSStyleSheet` the `<style>`
 * element is left in place (the pilot CSP accepts it).
 */
function adoptInjectedStyles(shadowRoot: ShadowRoot): () => void {
  const convert = (): void => {
    for (const style of [...shadowRoot.querySelectorAll("style")]) {
      const css = style.textContent ?? "";
      try {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        const own = shadowRoot.adoptedStyleSheets.filter((existing) => existing !== sheet);
        shadowRoot.adoptedStyleSheets = [...own, sheet];
        style.remove();
      } catch {
        /* keep the <style> element: this browser or CSP mode cannot construct sheets */
      }
    }
  };
  convert();
  const observer = new MutationObserver(convert);
  observer.observe(shadowRoot, { childList: true });
  return () => observer.disconnect();
}

/** The internal themed root action of every wrapper component. */
export function themedRoot(node: HTMLElement, options: ThemedRootOptions): {
  update: (options: ThemedRootOptions) => void;
  destroy: () => void;
} {
  const root = node.getRootNode();
  const shadowRoot = root instanceof ShadowRoot ? root : undefined;
  const host = shadowRoot?.host;
  if (host instanceof HTMLElement) registerRuntime(host, options.runtime);
  let currentTheme = normalizeThemeId(options.theme);
  let stopStyleObserver: (() => void) | undefined;
  if (shadowRoot !== undefined) {
    void adoptThemeSheet(shadowRoot, currentTheme);
    stopStyleObserver = adoptInjectedStyles(shadowRoot);
  }
  return {
    update(next: ThemedRootOptions) {
      const nextTheme = normalizeThemeId(next.theme);
      if (nextTheme !== currentTheme) {
        if (shadowRoot !== undefined) {
          removeThemeSheet(shadowRoot, currentTheme);
          void adoptThemeSheet(shadowRoot, nextTheme);
        }
        currentTheme = nextTheme;
      }
    },
    destroy() {
      stopStyleObserver?.();
    },
  };
}

/** The theme id for the internal root's attribute (normalized, §6.5). */
export function themeIdOf(theme: unknown): ThemeId {
  return normalizeThemeId(theme);
}

/** The color mode for the internal root's attribute. */
export function colorModeOf(colorScheme: unknown): string | undefined {
  return colorMode(colorScheme);
}
