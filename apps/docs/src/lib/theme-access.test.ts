import { describe, expect, it } from "vitest";
import { PUBLIC_THEMES, THEMES, isPrivateTheme } from "./theme-catalog";
import { enforceThemePrivacy } from "./url-state";
import {
  allowsPrivateTheme,
  closePicker,
  createThemeAccess,
  openDemoPicker,
  openPicker,
  pickTheme,
  themesForPicker,
  toggleDemoPicker,
  type ThemeAccess
} from "./theme-access";

// Ces tests décrivent des GESTES, pas la forme du code : « ouvrir par le
// bouton », « ouvrir par le raccourci », « fermer », « choisir un thème »,
// « recharger ». Chacun échoue si la logique d'accès ment sur ce que le
// sélecteur reçoit ou sur ce qu'un chargement autorise — c'est exactement ce
// qu'une assertion sur la source du layout ne sait pas voir.

const PRIVATE_BRAND = "cossette";
const PUBLIC_BRAND = "dsfr";

const ids = (themes: readonly { id: string }[]) => themes.map((theme) => theme.id);
const privateOnesIn = (themes: readonly { id: string }[]) => ids(themes).filter(isPrivateTheme);

describe("theme access — la porte Ctrl+Shift+X", () => {
  it("starts every page load masked, closed, and scoped to the public list", () => {
    const fresh = createThemeAccess();

    expect(fresh.open).toBe(false);
    expect(allowsPrivateTheme(fresh)).toBe(false);
    // Au repos, avant tout geste, le sélecteur ne connaît que la liste publique.
    expect(privateOnesIn(themesForPicker(fresh, THEMES))).toEqual([]);
    expect(ids(themesForPicker(fresh, THEMES))).toEqual(ids(PUBLIC_THEMES));
  });

  it("never lets the header button reach a private brand — first click or after a demo", () => {
    const firstClick = openPicker(createThemeAccess());
    expect(firstClick.open).toBe(true);
    expect(ids(themesForPicker(firstClick, THEMES))).toEqual(ids(PUBLIC_THEMES));

    // Démonstration complète : raccourci, choix d'une marque privée, fermeture.
    // Le bouton d'en-tête ne doit pas être devenu une seconde porte.
    const afterDemo = closePicker(pickTheme(openDemoPicker(createThemeAccess()), PRIVATE_BRAND));
    expect(privateOnesIn(themesForPicker(openPicker(afterDemo), THEMES))).toEqual([]);
  });

  it("reaches the whole catalogue only through the shortcut", () => {
    const demo = openDemoPicker(createThemeAccess());

    expect(demo.open).toBe(true);
    expect(ids(themesForPicker(demo, THEMES))).toEqual(ids(THEMES));
    expect(ids(themesForPicker(demo, THEMES))).toContain(PRIVATE_BRAND);

    // Le raccourci pressé sur un sélecteur déjà ouvert par un bouton élargit,
    // il ne referme pas : le geste demandé est « montre-moi tout ».
    const widened = toggleDemoPicker(openPicker(createThemeAccess()));
    expect(widened.open).toBe(true);
    expect(ids(themesForPicker(widened, THEMES))).toEqual(ids(THEMES));
  });

  it("closes without ever changing which theme is allowed", () => {
    const demo = pickTheme(openDemoPicker(createThemeAccess()), PRIVATE_BRAND);
    expect(enforceThemePrivacy(PRIVATE_BRAND, allowsPrivateTheme(demo))).toBe(PRIVATE_BRAND);

    // Échap / ✕ / clic sur le fond, et re-pression du raccourci : mêmes effets.
    const byEscape = closePicker(demo);
    const byShortcut = toggleDemoPicker(openDemoPicker(demo));

    for (const closed of [byEscape, byShortcut]) {
      expect(closed.open).toBe(false);
      expect(closed.scope).toBe("public");
      // Fermer un panneau ne redessine pas la page.
      expect(enforceThemePrivacy(PRIVATE_BRAND, allowsPrivateTheme(closed))).toBe(PRIVATE_BRAND);
    }
  });

  it("re-masks on the next page load, whatever happened during the demo", () => {
    const duringDemo = closePicker(pickTheme(openDemoPicker(createThemeAccess()), PRIVATE_BRAND));
    expect(allowsPrivateTheme(duringDemo)).toBe(true);

    // Rien n'est persisté : le chargement suivant repart d'un état neuf, et un
    // `?theme=cossette` laissé dans une URL partagée redevient inerte.
    const nextLoad = createThemeAccess();
    expect(allowsPrivateTheme(nextLoad)).toBe(false);
    expect(enforceThemePrivacy(PRIVATE_BRAND, allowsPrivateTheme(nextLoad))).toBe("sent-tech");
  });

  it("narrows a wide-open picker back to the public list when a button reopens it", () => {
    // La démonstration est EN COURS : le sélecteur est ouvert sur les 127, rien
    // n'a été fermé. Si le bouton d'en-tête (ou un chrome tiers) rouvre à ce
    // moment-là, il doit rétrécir la portée lui-même — et non compter sur la
    // remise à zéro d'une fermeture qui n'a pas eu lieu.
    const stillWide = openDemoPicker(createThemeAccess());
    expect(ids(themesForPicker(stillWide, THEMES))).toEqual(ids(THEMES));

    const reopenedByButton = openPicker(stillWide);
    expect(reopenedByButton.open).toBe(true);
    expect(reopenedByButton.scope).toBe("public");
    expect(privateOnesIn(themesForPicker(reopenedByButton, THEMES))).toEqual([]);
    expect(ids(themesForPicker(reopenedByButton, THEMES))).toEqual(ids(PUBLIC_THEMES));
  });

  it("treats the shortcut itself as the unlock, before any theme is chosen", () => {
    // Sémantique VOULUE : le geste EST le déverrouillage. Ctrl+Shift+X seul,
    // sans rien sélectionner, ouvre l'autorité des deep-links privés pour tout
    // le chargement — c'est ce qui rend une démonstration utilisable (coller un
    // ?theme=cossette après avoir fait le geste). L'éphémère vient du
    // chargement suivant, pas d'une fermeture.
    const justTheGesture = openDemoPicker(createThemeAccess());
    expect(justTheGesture.demoMode).toBe(true);
    expect(allowsPrivateTheme(justTheGesture)).toBe(true);
    expect(enforceThemePrivacy(PRIVATE_BRAND, allowsPrivateTheme(justTheGesture))).toBe(
      PRIVATE_BRAND
    );

    // Même geste par le raccourci lui-même (toggle), même verdict.
    const byShortcut = toggleDemoPicker(createThemeAccess());
    expect(allowsPrivateTheme(byShortcut)).toBe(true);

    // Et l'autorité survit à la fermeture, tandis que le sélecteur, lui,
    // retombe à la liste publique : fermer n'est pas remasquer.
    const closed = closePicker(justTheGesture);
    expect(allowsPrivateTheme(closed)).toBe(true);
    expect(ids(themesForPicker(openPicker(closed), THEMES))).toEqual(ids(PUBLIC_THEMES));
  });

  it("never lets the picker's scope alone authorise a private theme", () => {
    // « Montrer » et « autoriser » sont deux choses : `scope` dit ce que le
    // panneau affiche, `demoMode` dit ce qu'un identifiant venu de l'URL ou du
    // stockage a le droit d'être. Aucune transition ne produit aujourd'hui cet
    // état, et c'est justement l'invariant à épingler : si une future
    // transition élargissait la portée sans lever le masquage, l'autorisation
    // ne devrait pas suivre en douce.
    const widenedButMasked: ThemeAccess = { scope: "all", open: true, demoMode: false };

    expect(allowsPrivateTheme(widenedButMasked)).toBe(false);
    expect(enforceThemePrivacy(PRIVATE_BRAND, allowsPrivateTheme(widenedButMasked))).toBe(
      "sent-tech"
    );
  });

  it("keeps masking in place when the chosen theme is a public one", () => {
    const afterPublicPick = pickTheme(openPicker(createThemeAccess()), PUBLIC_BRAND);

    expect(afterPublicPick.open).toBe(false);
    expect(allowsPrivateTheme(afterPublicPick)).toBe(false);
    expect(enforceThemePrivacy(PUBLIC_BRAND, allowsPrivateTheme(afterPublicPick))).toBe(PUBLIC_BRAND);
    expect(enforceThemePrivacy(PRIVATE_BRAND, allowsPrivateTheme(afterPublicPick))).toBe("sent-tech");
  });
});
