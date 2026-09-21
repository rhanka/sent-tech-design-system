// Accès aux thèmes tiers : l'interrupteur Ctrl+Shift+X, en logique pure.
//
// Pourquoi un module séparé du layout : la logique d'accès vivait dans une
// poignée de `$state`/`$derived` noyés dans 3 800 lignes de gabarit. On ne
// pouvait la vérifier qu'en cherchant des chaînes dans la source — c'est-à-dire
// pas du tout. Ici l'invariant est une fonction : « pour un état d'accès donné,
// voici la liste que le sélecteur reçoit », et il se teste par son comportement.
//
// Deux choses indépendantes :
//  1. Le mode révélé (`demoMode`). Ctrl+Shift+X le bascule, et c'est la seule
//     transition qui le change. Il est persisté dans
//     localStorage["st-docs-demo-mode"] ("true"/"false") : un rechargement le
//     conserve, jusqu'au Ctrl+Shift+X suivant.
//  2. Le sélecteur de thèmes (`open`), avec sa recherche. Il s'ouvre par le
//     bouton d'en-tête et montre la liste qui correspond au mode : le catalogue
//     complet si le mode révélé est actif, la liste publique sinon. Le
//     raccourci ne l'ouvre pas ; s'il est déjà ouvert, sa liste suit le mode.

import { isPrivateTheme } from "./theme-catalog";

/** Clé et valeurs ("true"/"false") d'origine du mode révélé. */
export const DEMO_MODE_STORAGE_KEY = "st-docs-demo-mode";

export interface ThemeAccess {
  /** Le sélecteur est-il ouvert. */
  readonly open: boolean;
  /** Le masquage des marques privées est-il levé (Ctrl+Shift+X). */
  readonly demoMode: boolean;
}

/** L'état d'un chargement de page : sélecteur fermé, mode révélé persisté. */
export function createThemeAccess(demoMode = false): ThemeAccess {
  return { open: false, demoMode };
}

/** Le mode révélé persisté : seule la valeur "true" lève le masquage. */
export function readDemoMode(storage: Pick<Storage, "getItem">): boolean {
  return storage.getItem(DEMO_MODE_STORAGE_KEY) === "true";
}

/** Persiste le mode révélé, avec les valeurs d'origine "true"/"false". */
export function persistDemoMode(storage: Pick<Storage, "setItem">, state: ThemeAccess): void {
  storage.setItem(DEMO_MODE_STORAGE_KEY, state.demoMode ? "true" : "false");
}

/** Ouverture du sélecteur (bouton d'en-tête, chrome tiers). */
export function openPicker(state: ThemeAccess): ThemeAccess {
  return { ...state, open: true };
}

/**
 * Fermeture, d'où qu'elle vienne (Échap, ✕, clic sur le fond, sélection d'un
 * thème, navigation). Elle ne touche PAS au mode révélé.
 */
export function closePicker(state: ThemeAccess): ThemeAccess {
  return { ...state, open: false };
}

/** Ctrl+Shift+X : bascule le mode révélé, sans ouvrir ni fermer le sélecteur. */
export function toggleDemoMode(state: ThemeAccess): ThemeAccess {
  return { ...state, demoMode: !state.demoMode };
}

/** L'invariant : la liste que le sélecteur (et toute surface de thèmes) reçoit. */
export function themesForPicker<T extends { id: string }>(
  state: ThemeAccess,
  catalog: readonly T[]
): T[] {
  return state.demoMode ? [...catalog] : catalog.filter((theme) => !isPrivateTheme(theme.id));
}

/**
 * Un identifiant privé venu de l'extérieur (URL, localStorage) est-il
 * acceptable dans cet état ? Passé à `enforceThemePrivacy`, c'est ce qui rend
 * un `?theme=cossette` inerte hors mode révélé.
 */
export function allowsPrivateTheme(state: ThemeAccess): boolean {
  return state.demoMode;
}
