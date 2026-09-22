import { describe, expect, it } from "vitest";
import { PUBLIC_THEMES, THEMES, isPrivateTheme } from "./theme-catalog";
import { enforceThemePrivacy } from "./url-state";
import {
  DEMO_MODE_STORAGE_KEY,
  allowsPrivateTheme,
  closePicker,
  createThemeAccess,
  openPicker,
  persistDemoMode,
  readDemoMode,
  themesForPicker,
  toggleDemoMode
} from "./theme-access";

// Ces tests décrivent des GESTES, pas la forme du code : « ouvrir par le
// bouton », « Ctrl+Shift+X », « fermer », « recharger ». Chacun échoue si la
// logique d'accès ment sur ce que le sélecteur reçoit ou sur ce qu'un
// chargement autorise.

const PRIVATE_BRAND = "cossette";

const ids = (themes: readonly { id: string }[]) => themes.map((theme) => theme.id);
const privateOnesIn = (themes: readonly { id: string }[]) => ids(themes).filter(isPrivateTheme);

/** Un localStorage réduit à ce que le module lit et écrit. */
function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    values
  };
}

describe("theme access — l'interrupteur Ctrl+Shift+X", () => {
  it("starts a load without a persisted reveal masked, closed, on the public list", () => {
    const fresh = createThemeAccess(readDemoMode(memoryStorage()));

    expect(fresh.open).toBe(false);
    expect(allowsPrivateTheme(fresh)).toBe(false);
    expect(privateOnesIn(themesForPicker(fresh, THEMES))).toEqual([]);
    expect(ids(themesForPicker(fresh, THEMES))).toEqual(ids(PUBLIC_THEMES));
  });

  it("gives the header button the public list when masked, the whole catalogue when revealed", () => {
    const masked = openPicker(createThemeAccess());
    expect(masked.open).toBe(true);
    expect(ids(themesForPicker(masked, THEMES))).toEqual(ids(PUBLIC_THEMES));

    const revealed = openPicker(toggleDemoMode(createThemeAccess()));
    expect(revealed.open).toBe(true);
    expect(ids(themesForPicker(revealed, THEMES))).toEqual(ids(THEMES));
    expect(ids(themesForPicker(revealed, THEMES))).toContain(PRIVATE_BRAND);
  });

  it("toggles the reveal without ever opening the picker", () => {
    const once = toggleDemoMode(createThemeAccess());
    expect(once.demoMode).toBe(true);
    expect(once.open).toBe(false);

    const twice = toggleDemoMode(once);
    expect(twice.demoMode).toBe(false);
    expect(twice.open).toBe(false);
  });

  it("lets an open picker's list follow the shortcut, without closing it", () => {
    const open = openPicker(createThemeAccess());
    expect(ids(themesForPicker(open, THEMES))).toEqual(ids(PUBLIC_THEMES));

    const revealed = toggleDemoMode(open);
    expect(revealed.open).toBe(true);
    expect(ids(themesForPicker(revealed, THEMES))).toEqual(ids(THEMES));

    const masked = toggleDemoMode(revealed);
    expect(masked.open).toBe(true);
    expect(ids(themesForPicker(masked, THEMES))).toEqual(ids(PUBLIC_THEMES));
  });

  it("closes without changing the reveal", () => {
    for (const demoMode of [false, true]) {
      const closed = closePicker(openPicker(createThemeAccess(demoMode)));
      expect(closed.open).toBe(false);
      expect(closed.demoMode).toBe(demoMode);
    }
  });

  it("persists the reveal under the original key and values, and restores it on the next load", () => {
    const storage = memoryStorage();

    const revealed = toggleDemoMode(createThemeAccess(readDemoMode(storage)));
    persistDemoMode(storage, revealed);
    expect(storage.values.get(DEMO_MODE_STORAGE_KEY)).toBe("true");
    expect(DEMO_MODE_STORAGE_KEY).toBe("st-docs-demo-mode");

    // Rechargement : toujours révélé, catalogue complet.
    const reloaded = createThemeAccess(readDemoMode(storage));
    expect(allowsPrivateTheme(reloaded)).toBe(true);
    expect(ids(themesForPicker(openPicker(reloaded), THEMES))).toEqual(ids(THEMES));

    // Ctrl+Shift+X à nouveau : masqué, et le rechargement suivant aussi.
    persistDemoMode(storage, toggleDemoMode(reloaded));
    expect(storage.values.get(DEMO_MODE_STORAGE_KEY)).toBe("false");
    expect(allowsPrivateTheme(createThemeAccess(readDemoMode(storage)))).toBe(false);
  });

  it("reads anything but \"true\" as masked", () => {
    for (const stored of [undefined, "false", "1", "TRUE", ""]) {
      const storage = memoryStorage(stored === undefined ? {} : { [DEMO_MODE_STORAGE_KEY]: stored });
      expect(readDemoMode(storage)).toBe(false);
    }
  });

  it("accepts a private theme from the URL or storage only while revealed", () => {
    const masked = createThemeAccess(false);
    expect(enforceThemePrivacy(PRIVATE_BRAND, allowsPrivateTheme(masked))).toBe("sent-tech");
    expect(enforceThemePrivacy("dsfr", allowsPrivateTheme(masked))).toBe("dsfr");

    const revealed = createThemeAccess(true);
    expect(enforceThemePrivacy(PRIVATE_BRAND, allowsPrivateTheme(revealed))).toBe(PRIVATE_BRAND);

    // Quitter le mode révélé retire l'autorisation : le layout revient alors
    // au thème par défaut.
    expect(enforceThemePrivacy(PRIVATE_BRAND, allowsPrivateTheme(toggleDemoMode(revealed)))).toBe(
      "sent-tech"
    );
  });
});
