// Synchronisation SORTANTE de l'URL (store -> URL) pour le thème et le framework.
//
// L'URL reste la source de vérité ; ce module ne fait que la RÉÉCRIRE quand
// l'état change (clic sur un onglet ou un sélecteur) ou quand une navigation
// interne « nue » l'a vidée. Le calcul (`buildUpdatedSearch`) et le filtre de
// confidentialité (`enforceThemePrivacy`, appliqué en amont à l'amorce et à la
// sync entrante) restent dans $lib/url-state : ici, on n'écrit que l'état déjà
// filtré, jamais une valeur lue dans l'URL.
//
// ── Pourquoi une garde « routeur prêt » ──────────────────────────────────────
// `replaceState` de `$app/navigation` fait `history.replaceState(...)` PUIS
// `root.$set(...)` sur le composant racine de SvelteKit. Or ce composant n'est
// affecté à `root` qu'au RETOUR de son constructeur, et ce constructeur vide
// déjà toute la file d'effets (`flushSync`) : un `$effect` qui appelle
// `replaceState` à son tout premier passage le fait donc avant que `root`
// existe. En production : `TypeError: Cannot read properties of undefined
// (reading '$set')`, le flush d'effets s'interrompt (les `onMount` suivants —
// dont l'enregistrement des `afterNavigate` — ne s'exécutent jamais), le
// routeur ne démarre pas et les onglets cessent de répondre. Déclencheur :
// tout chargement dont l'URL diverge de l'état amorcé, typiquement un
// paramètre que l'état retire (`?framework=svelte`, `?theme=sent-tech`,
// `?framework=zzz`, thème privé rejeté).
//
// La garde se lève au PREMIER `afterNavigate` (navigation initiale) : à ce
// moment `root` est affecté, et SvelteKit pose `started = true` juste après les
// callbacks, de façon synchrone. Lever la garde ne réécrit rien sur-le-champ :
// cela planifie l'effet, que Svelte exécute au flush suivant (microtâche), donc
// routeur démarré — même la vérification du mode dev (« before router is
// initialized ») est satisfaite. `onMount` ne suffirait pas : il s'exécute dans
// ce même premier flush, `root` encore indéfini.

import { untrack } from "svelte";
import type { FrameworkId } from "./framework.svelte";
import { buildUpdatedSearch, type ThemeId } from "./url-state";

export interface OutboundUrlSyncDeps {
  /** Thème actif, déjà filtré par `enforceThemePrivacy` (lu réactivement). */
  theme: () => ThemeId;
  /** Framework actif (lu réactivement). */
  framework: () => FrameworkId;
  /** `replaceState` de `$app/navigation` (injecté : testable sans routeur). */
  replaceState: (url: string, state: App.PageState) => void;
  /** `page.state` courant, relu à chaque écriture (jamais tracké). */
  pageState: () => App.PageState;
  /** `afterNavigate` de `$app/navigation`. */
  afterNavigate: (callback: () => void) => void;
}

/**
 * Câble la sync sortante. À appeler pendant l'initialisation d'un composant
 * (elle crée un `$effect` et enregistre un `afterNavigate`).
 */
export function syncUrlOutbound(deps: OutboundUrlSyncDeps): void {
  let routerReady = $state(false);

  function write(theme: ThemeId, fw: FrameworkId): void {
    const newSearch = buildUpdatedSearch(theme, fw);
    // Écriture seulement si différente : l'effet ne dépend pas de l'URL, et
    // `replaceState` ne modifie pas `page.url` : aucune boucle possible.
    if (newSearch !== window.location.search) {
      deps.replaceState(window.location.pathname + newSearch, deps.pageState());
    }
  }

  // Sync à la NAVIGATION. Les liens internes (sidebar/top-nav) sont des href
  // STATIQUES sans param : après navigation, l'URL les perd, et on y ré-inscrit
  // l'état courant (replaceState, pas d'entrée d'historique).
  deps.afterNavigate(() => {
    if (!routerReady) {
      // Navigation initiale : le routeur finit de démarrer à la sortie de ce
      // callback. On lève la garde, et l'effet ci-dessous — seul écrivain au
      // démarrage — nettoie l'URL au flush suivant.
      routerReady = true;
      return;
    }
    untrack(() => write(deps.theme(), deps.framework()));
  });

  // Sync au CHANGEMENT de thème/framework : un clic sur un sélecteur ne navigue
  // pas, donc `afterNavigate` ne se déclenche pas. Dépendances EXPLICITES :
  // thème + framework + garde, et PAS l'URL (la suivre ici a déjà fait perdre
  // le premier clic de svelte vers react).
  $effect(() => {
    const theme = deps.theme();
    const fw = deps.framework();
    if (!routerReady) return;
    untrack(() => write(theme, fw));
  });
}
