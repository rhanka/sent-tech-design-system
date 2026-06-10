/**
 * color-mode.svelte.ts — store de mode de couleur (clair / sombre / auto).
 *
 * - `auto` : suit `prefers-color-scheme` (l'OS / le navigateur décide).
 *   → retire l'attribut `data-color-mode` sur `<html>`.
 * - `light` : force le mode clair.
 *   → pose `data-color-mode="light"` sur `<html>`.
 * - `dark` : force le mode sombre.
 *   → pose `data-color-mode="dark"` sur `<html>`.
 *
 * Persistance : `localStorage` clé `st-docs-color-mode`.
 * L'anti-FOUC est géré par le script inline dans `app.html`.
 */
import { browser } from "$app/environment";

export type ColorMode = "light" | "dark" | "auto";

const STORAGE_KEY = "st-docs-color-mode";
const VALID_MODES: ColorMode[] = ["light", "dark", "auto"];

function readStorage(): ColorMode {
  if (!browser) return "auto";
  const stored = localStorage.getItem(STORAGE_KEY);
  return (VALID_MODES.includes(stored as ColorMode) ? stored : "auto") as ColorMode;
}

function applyMode(mode: ColorMode): void {
  if (!browser) return;
  const root = document.documentElement;
  if (mode === "auto") {
    root.removeAttribute("data-color-mode");
  } else {
    root.setAttribute("data-color-mode", mode);
  }
}

function createColorModeStore() {
  let _value = $state<ColorMode>("auto");

  // Initialisation côté client — lit localStorage, applique immédiatement.
  function init() {
    if (!browser) return;
    _value = readStorage();
    applyMode(_value);
  }

  function set(mode: ColorMode) {
    _value = mode;
    if (browser) {
      localStorage.setItem(STORAGE_KEY, mode);
      applyMode(mode);
    }
  }

  return {
    get value() { return _value; },
    set value(mode: ColorMode) { set(mode); },
    init
  };
}

export const colorMode = createColorModeStore();
