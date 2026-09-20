// Accès aux thèmes tiers : la porte Ctrl+Shift+X, en logique pure.
//
// Pourquoi un module séparé du layout : la régression d'origine (le sélecteur
// du bouton d'en-tête recevait le catalogue complet) vivait dans une poignée de
// `$state`/`$derived` noyés dans 3 800 lignes de gabarit. On ne pouvait
// l'attraper qu'en cherchant des chaînes dans la source — c'est-à-dire pas du
// tout. Ici l'invariant est une fonction : « pour un état d'accès donné, voici
// la liste que le sélecteur reçoit », et il se teste par son comportement.
//
// Trois règles tiennent tout :
//  1. L'état d'accès est PUREMENT EN MÉMOIRE. Aucune persistance, donc chaque
//     chargement de page repart masqué et le geste doit être refait. Un
//     rechargement en pleine démonstration perd le thème privé : c'est le sens
//     d'une porte.
//  2. Seul le raccourci élargit la portée au catalogue complet. Toute ouverture
//     par un bouton la ramène à la liste publique, et toute fermeture aussi —
//     même celle déclenchée depuis l'intérieur du sélecteur (Échap, ✕, fond).
//  3. Fermer ne détruit rien : `demoMode` n'est jamais rabaissé par une
//     fermeture, sinon refermer le panneau redessinerait toute la page. Le
//     remasquage est l'affaire du chargement suivant (règle 1).

import { isPrivateTheme } from "./theme-catalog";

/** Étendue de ce que le sélecteur montre : la liste publique, ou tout. */
export type PickerScope = "public" | "all";

export interface ThemeAccess {
  /** Ce que le sélecteur ouvert doit montrer. */
  readonly scope: PickerScope;
  /** Le sélecteur est-il ouvert. */
  readonly open: boolean;
  /** Le masquage des marques privées est-il levé pour CE chargement de page. */
  readonly demoMode: boolean;
}

/** L'état de tout nouveau chargement de page : masqué, fermé, public. */
export function createThemeAccess(): ThemeAccess {
  return { scope: "public", open: false, demoMode: false };
}

/** Ouverture par une surface publique (bouton d'en-tête, chrome tiers). */
export function openPicker(state: ThemeAccess): ThemeAccess {
  return { ...state, scope: "public", open: true };
}

/** Ouverture par le raccourci : la seule transition qui élargit la portée. */
export function openDemoPicker(state: ThemeAccess): ThemeAccess {
  return { ...state, scope: "all", open: true, demoMode: true };
}

/**
 * Fermeture, d'où qu'elle vienne (Échap, ✕, clic sur le fond, re-pression du
 * raccourci, sélection d'un thème). Elle referme et rétrécit la portée, mais
 * ne touche PAS à `demoMode` : le geste demandé est « ferme ce panneau », pas
 * « rends-moi le thème par défaut ».
 */
export function closePicker(state: ThemeAccess): ThemeAccess {
  return { ...state, scope: "public", open: false };
}

/** Ctrl+Shift+X : ouvre le catalogue complet, ou referme s'il est déjà ouvert. */
export function toggleDemoPicker(state: ThemeAccess): ThemeAccess {
  return state.open && state.scope === "all" ? closePicker(state) : openDemoPicker(state);
}

/**
 * Sélection d'un thème. Choisir une marque privée lève le masquage pour ce
 * chargement — sans quoi la garde du layout annulerait la sélection dans la
 * foulée. Choisir un thème public ne lève rien.
 */
export function pickTheme(state: ThemeAccess, id: string): ThemeAccess {
  return closePicker(isPrivateTheme(id) ? { ...state, demoMode: true } : state);
}

/** L'invariant : la liste que le sélecteur reçoit pour un état donné. */
export function themesForPicker<T extends { id: string }>(
  state: ThemeAccess,
  catalog: readonly T[]
): T[] {
  return state.scope === "all" ? [...catalog] : catalog.filter((theme) => !isPrivateTheme(theme.id));
}

/**
 * Un identifiant privé venu de l'extérieur (URL, localStorage) est-il
 * acceptable dans cet état ? Passé à `enforceThemePrivacy`, c'est ce qui rend
 * un `?theme=cossette` inerte sur un chargement masqué.
 */
export function allowsPrivateTheme(state: ThemeAccess): boolean {
  return state.demoMode;
}
