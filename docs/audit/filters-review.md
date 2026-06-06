# Revue adversariale — Filtres (FilterPill / FilterBar / SelectionChip)

Reviewer: Opus 4.8 (lecture seule, **rien commité/modifié**).
Cibles (non commitées) : `packages/components-svelte/src/lib/{FilterPill,FilterBar,SelectionChip}.svelte` + `src/Filters.test.ts`.
Référence d'idiomes : `Tag.svelte`, `Button.svelte`, `SelectableRow.svelte`, `Badge.svelte`.
Particularité : **Svelte uniquement** (pas encore de port React/Vue) — les constats « parité » sont prospectifs.

## Résultat des gardes-fous demandés

- **(a) Tokens** — **PASS**. Chaque `var(--st-*)` utilisée existe réellement. Vérifié contre `packages/tokens/src/foundation.ts` + `semantic.ts` et l'alias court émis par `css.ts` (l.28-34 : `foundation-*` → nom court) :
  - Foundation → `--st-radius-pill` (pill `999px`), `--st-radius-md`, `--st-cursor-interactive` (`pointer`), `--st-cursor-disabled` (`not-allowed`), `--st-motion-fast` (`120ms`), `--st-motion-easing` (`cubic-bezier(.4,0,.2,1)`), `--st-spacing-1`/`--st-spacing-2` : **tous présents**.
  - Semantic → `surface-subtle`, `text-secondary`, `text-muted`, `text-link`, `border-interactive`, `action-primary`, `action-primaryHover`, `feedback-success/warning/error/info` : **tous présents** (`semantic.ts`).
  - Tokens **interdits** (`feedback-danger`, `surface-muted`, `spacing-300`) : `grep` = **vide**. Aucun token fantôme. Les `--st-component-filterPill-*` sont théme-fournis avec fallback inline (idiome P-C correct).
- **(b) Contraste de l'état `active`** — **PASS en clair, FAIL latent en sombre** (calcul ci-dessous, #2). En clair l'`active` (texte = `mix(action 78%,black)` sur fond = `mix(action 12%,transparent)`) donne **8,2:1** (sent-tech/entropic) et **11,2:1** (forge) — large. La branche fallback (sans `color-mix`) = **5,2:1**. MAIS le fond `active` utilise `transparent`, donc sur une surface sombre le ratio s'effondre à **1,65:1 / 1,23:1**.
- **(c) A11y réelle** — **un défaut MAJEUR** (#1, nesting interactif) + plusieurs moyens. Clavier Enter **et** Space gérés avec `preventDefault` (anti-scroll) : OK. `aria-pressed` cohérent avec `active` : OK. Suppr/Backspace → `onRemove` **seulement si `removable`** : OK (l.69). Mais : (i) le ✕ est un **vrai `<button>` imbriqué dans un `role="button"`** → anti-pattern WAI-ARIA (#1) ; (ii) **aucun transfert de focus** quand la pilule focalisée devient `disabled` — régression vs `SelectableRow` (#3) ; (iii) keydown ré-implémenté **redondant** sur le ✕ → double-`onRemove` possible sur Space (#4).
- **(d) Événementiel** — ✕ stoppe la propagation (`e.stopPropagation()`, l.57) → pas de déclenchement d'`onClick` : **OK et testé**. Double-fire latent sur Space du ✕ (#4). Enter ne scrolle pas (`preventDefault`) : OK.
- **(e) API canonique (ports React/Vue)** — à figer avant portage (#6) : `active` **défaut `true`** est piégeux (cf. #5), `onClick`/`onRemove`/`onClear` sans argument événement (Tag, lui, passe `MouseEvent` à `onDismiss` → **incohérence d'API dans le DS**).
- **(f) Edge cases** — `count` bien gardé (`Number.isFinite`, `0` affiché, `NaN`/`Infinity` masqués) : **PASS et testé**. `value`/`field` vides → rendu d'une pilule vide sans garde (#7, faible). `operator` absent → correctement omis.

## Suite de tests

`npx vitest run src/Filters.test.ts` → **31/31 PASS** (vérifié). **MAIS les verts sont trompeurs** sur les vrais défauts :
- JSDOM **n'implémente pas** la règle ARIA *children-presentational* → le test `getByRole("button",{name:"Retirer le filtre Pays"})` trouve le ✕ imbriqué alors qu'un vrai lecteur d'écran peut l'**élaguer** (#1). Le test « prouve » une accessibilité que le navigateur ne garantit pas.
- JSDOM ne synthétise pas le `click` natif d'un `<button>` sur Space → le **double-`onRemove`** (#4) est invisible en test.
- Aucun test ne couvre le **transfert de focus à la désactivation** (#3), ni le **conflit `tone` vs `active`** (#5), ni le contraste sur surface sombre (#2).

## Calcul de contraste (sources : `themes/css/*.css`, recompositions sRGB/WCAG)

| Contexte | Fond `active` | Texte `active` | Ratio | Verdict |
|---|---|---|---|---|
| sent-tech/entropic, page **blanche** | `#e0edf5` | `#2e407c` | **8,22:1** | PASS AAA |
| sent-tech, sur `surface-subtle #f8fafc` | `#dae9f2` | `#2e407c` | **7,9:1** | PASS AAA |
| forge, page blanche | `#e3e7ed` | `#0f2c54` | **11,2:1** | PASS AAA |
| fallback (moteur sans `color-mix`) | `#eef2ff` | `action solid` | **5,24:1** | PASS AA |
| **sur page sombre `#0f172a`** (sent) | `#0d2139` | `#2e407c` | **1,65:1** | **FAIL** |
| **sur page sombre `#0f172a`** (forge) | `#0f1b32` | `#0f2c54` | **1,23:1** | **FAIL** |

Note : aucun thème ni la doc ne fournit aujourd'hui de bascule sombre des tokens sémantiques (le bloc `@media (prefers-color-scheme: dark)` de `apps/docs/src/app.css` ne pose que `color-scheme: dark`, sans redéfinir les couleurs). Le **FAIL sombre est donc latent** — il se déclenche dès qu'on pose la pilule sur une surface foncée (ce que `transparent` *invite* à faire).

## Réponse SPÉCIFIQUE : `<button>` dans `role="button"` (nesting interactif)

**Au niveau HTML : ce n'est PAS une erreur de modèle de contenu.** L'élément externe est un `<span>` (contenu de flux), pas un vrai `<button>`. Un `<span>` contenant un `<button>` est du HTML valide. Donc l'`a11y_no_noninteractive_tabindex` ignoré et l'absence d'avertissement Svelte sont « corrects » au sens parseur.

**Au niveau WAI-ARIA : c'est INVALIDE et MAJEUR.** Le rôle `button` est défini avec **« Children Presentational: True »**. Les auteurs **ne doivent pas** placer de descendant interactif dans un élément `role="button"` ; le user agent est censé **élaguer la sémantique** du sous-arbre de l'arbre d'accessibilité. Conséquence concrète : le `<button>` ✕ interne (et son nom « Retirer le filtre {field} ») **n'est pas garanti d'être exposé** aux technologies d'assistance — comportement qui **diverge selon les moteurs** (certains l'exposent, d'autres l'élaguent, ré-énonçant juste « bouton, Pays in France »). C'est l'anti-pattern classique « contrôle dans un contrôle » (équivalent `button` dans `a`/`button`). **Le test JSDOM ne peut pas l'attraper** (pas d'implémentation children-presentational).

**Structure correcte recommandée (A)** — deux boutons **frères** dans un conteneur **non interactif** (pattern « input chip ») :

```html
<span class="st-filterPill" role="group" aria-label="filtre {field} {operator} {value}">
  <button type="button" class="st-filterPill__body"
          aria-pressed={active} disabled={disabled} onClick={handleClick}>
    {field} {operator} {value}
  </button>
  {#if removable}
    <button type="button" class="st-filterPill__remove"
            aria-label="Retirer le filtre {field}" disabled={disabled} onClick={handleRemove}>✕</button>
  {/if}
</span>
```

Le `<span>` externe **n'est plus focusable** et **n'a plus `role="button"`** ; chaque action est un vrai `<button>` natif → plus d'imbrication, les deux contrôles sont atteignables et nommés, **et** on supprime tout le keydown manuel (Enter/Space natifs). Variante (B), si la pilule doit rester un toggle unique : retirer le `<button>` ✕ et ne gérer la suppression que par Suppr/Backspace sur l'unique `role="button"` (perd l'affordance souris — plus faible). **Recommandé : (A).**

## Top 6

| # | Composant | Constat | Sévérité | Correction |
|---|-----------|---------|----------|------------|
| 1 | **FilterPill** | **`<button>` (✕) imbriqué dans un `span role="button"` → violation WAI-ARIA *children-presentational*.** Le nom et la sémantique du ✕ peuvent être élagués par l'AT selon le moteur ; contrôle-dans-contrôle. **Vérifié** : le test JSDOM le « trouve » par fausse-couverture (JSDOM n'élague pas). C'est le défaut structurel central des 3 composants. | **MAJEUR / Bloquant** | Refonte structure (A) : conteneur `span role="group"` non focusable + **deux `<button>` natifs frères** (corps `aria-pressed` + ✕). Supprime aussi le keydown manuel. |
| 2 | **FilterPill** | **Fond `active` = `color-mix(... , transparent)` → contraste effondré sur surface sombre** (1,65:1 sent / 1,23:1 forge, calcul ci-dessus). En clair c'est excellent (8–11:1), donc latent, mais `transparent` invite explicitement à composer sur n'importe quel fond. Texte `active` figé en bleu foncé = illisible dès que le fond passe foncé. | **Moyen** (latent, deviendrait Élevé en thème sombre) | Soit composer le fond sur une surface **opaque** (`mix(action 12%, var(--st-semantic-surface-default))`) et un texte qui suit la surface ; soit fournir un token sombre `--st-component-filterPill-activeText/Background` et documenter que le composant exige une surface claire. |
| 3 | **FilterPill** | **Pas de transfert de focus quand la pilule focalisée devient `disabled`.** `SelectableRow` a un `$effect` dédié (l.101-107) pour re-router le focus vers le prochain élément actif ; FilterPill n'en a aucun. Une pilule focalisée passée `disabled` → `tabindex=-1` **garde le focus DOM** → focus perdu (le `Tab` repart du début du document). Bug déjà signalé sur les lots précédents. | **Moyen** | Ajouter un `$effect` : si `disabled` devient `true` et que `el.contains(document.activeElement)`, déplacer le focus vers un voisin focusable (ou `document.body` à défaut). |
| 4 | **FilterPill + SelectionChip** | **Keydown ré-implémenté redondant sur le ✕ → double-`onRemove`/`onClear` possible sur Space.** Le ✕ est un `<button>` natif : il fait déjà `Enter/Space → click → onclick`. Le `onkeydown={handleRemoveKeydown}` (resp. `handleClearKeydown`) appelle **en plus** `onRemove()`. Sur Enter le `preventDefault` annule le click natif (net = 1), mais sur **Space** la fiabilité dépend du moteur → risque de **2 appels**. JSDOM ne synthétise pas le click natif → invisible en test. | **Moyen** | **Supprimer** `handleRemoveKeydown`/`handleClearKeydown` : laisser le `<button>` natif gérer Enter/Space via `onclick`. (Une fois la structure (A) adoptée, ce code disparaît.) |
| 5 | **FilterPill** | **`tone` neutralisé par `active` (défaut `true`).** `.st-filterPill--active` (l.162) est déclaré **après** les `.st-filterPill--{tone}` à **spécificité égale** (0,1,0) et surcharge `background`+`color`. Comme `active` vaut **`true` par défaut**, `<FilterPill tone="error" />` rend **bleu**, pas rouge — le `tone` est mort sauf si `active=false` explicite. API trompeuse. | **Moyen** | Décider de la priorité : soit `tone` colore et `active` n'ajoute qu'un signal orthogonal (bordure/anneau), soit `active` ne s'applique qu'au ton `neutral`. Sinon, passer `active` à `false` par défaut **et** documenter l'exclusivité. |
| 6 | **3 composants (parité + API)** | **Incohérences à figer avant ports React/Vue.** (i) `onClick/onRemove/onClear` ne reçoivent **aucun event**, alors que `Tag.onDismiss(event: MouseEvent)` en passe un → API hétérogène dans le DS. (ii) `active` défaut `true` (#5) à reconsidérer. (iii) `SelectionChip` met `aria-label="({count})"` sur un span au texte **déjà visible** `({count})` — redondant et bizarrement libellé (parenthèses lues). (iv) `value`/`field`/`label` vides → pilule/chip vide sans garde (faible). Geler noms/types/défauts pour que React/Vue s'alignent. | **Faible / Info** | Harmoniser la signature des callbacks (passer l'event comme Tag, ou documenter l'absence partout) ; retirer l'`aria-label` redondant du count ; choisir un défaut d'`active` ; figer le contrat dans la doc API + tests de sens. |

## Comptage par sévérité

- **Bloquant / Majeur : 1** — #1 (✕ `<button>` imbriqué dans `role="button"` : violation WAI-ARIA children-presentational, présent dans FilterPill ; même pattern conceptuel ✕-dans-conteneur pour SelectionChip mais là le conteneur n'est PAS `role=button`, donc SelectionChip est OK sur ce point précis).
- **Moyen : 4** — #2 (contraste `active` effondré sur fond sombre — latent), #3 (pas de transfert de focus à la désactivation), #4 (double-fire Space sur le ✕), #5 (`tone` neutralisé par `active` défaut `true`).
- **Faible / Info : 1** — #6 (incohérences d'API/parité + `aria-label` redondant + gardes valeurs vides).

## Verdict

**NON publiable en l'état.** Le défaut #1 (nesting interactif `<button>` dans `role="button"`) est **bloquant a11y** sur le composant phare interactif (FilterPill) et invalide la promesse d'accessibilité que les tests « verts » laissent croire (JSDOM masque le problème). #3 (focus perdu) et #5 (`tone` mort par défaut) sont des bugs fonctionnels réels, #4 un double-déclenchement latent, #2 une bombe à retardement contraste dès qu'un thème sombre arrive.

**Conditions de publication** : (1) refondre FilterPill en pattern « input chip » (conteneur non interactif + 2 boutons frères, structure A) — corrige #1 et #4 d'un coup ; (2) ajouter le transfert de focus à la désactivation (#3) ; (3) trancher `tone`×`active` (#5). #2 et #6 peuvent suivre en *follow-up* documenté si l'usage reste sur surfaces claires.

**FilterBar** est sain (vrai `role="group"`, `<button>` natif, tokens valides) — publiable indépendamment.
**SelectionChip** : le ✕ n'est PAS imbriqué dans un `role=button` (le conteneur est un `span` neutre), donc pas de #1 ; reste #4 (double-fire Space) et le détail #6 (aria-label count). Publiable après #4.
