# Revue adversariale a11y — 2ᵉ passe (deep-fix non commité)

Reviewer : Opus 4.8, lecture seule. Aucun fichier composant/test modifié, aucun commit.
Monorepo : `packages/components-svelte`. Branche `main`, deep-fix dans le working tree (non commité).

## Méthode

- Lecture du `git diff` des 7 composants + des 4 (en réalité 5) suites de tests modifiées.
- Exécution réelle des suites en **`--no-cache`** (un premier run en cache a produit un faux « 14 failures » — voir note d'avertissement plus bas).
- `svelte-check` + `vite-plugin-svelte` pour les warnings a11y statiques.
- Test de diagnostic ad-hoc (supprimé après usage) pour isoler la cause racine du bug SelectableList.

Résultat d'exécution faisant foi (run propre, sans cache) sur
`SelectableList.test.ts + SelectableRow.test.ts + TimePicker.test.ts + Positioning.test.ts + Specialized.test.ts` :

```
Test Files  2 failed | 3 passed (5)
     Tests  3 failed | 142 passed (145)
```

Les 3 échecs portent **directement sur des affirmations à vérifier** du deep-fix.

> Avertissement métrologique : lancer plusieurs runs vitest en parallèle sur ce repo
> corrompt le cache de transform (j'ai observé un run « 14 failed » avec des **noms de
> tests périmés**, ex. « renders with role=option » alors que la source dit « role=button »).
> **Toujours valider ce deep-fix avec `--no-cache` et un seul run à la fois.** Le résultat
> faisant foi est 3 échecs / 142 succès.

---

## Tableau de revue

| Composant | Constat | Sévérité | Correction |
|---|---|---|---|
| **TimePicker — ArrowUp/Home/End depuis valeur sélectionnée** | `openList()` positionne `activeIndex` sur `slots.indexOf(value)` ; ArrowUp/Home/End sur liste ouverte décrémentent/cadrent correctement ; le focus reste sur l'input, `aria-activedescendant` suit. Tests dédiés verts (Bug 1 régression Codex). | OK | — |
| **TimePicker — activation au click** | `onclick` sur l'option appelle `pick()` → `onChange` ; ferme la liste. Test « click sur option » vert. | OK | — |
| **TimePicker — activation au mousedown** | **FAUX.** Le handler `onmousedown` ne fait QUE `e.preventDefault()` (ligne 325) ; il **n'appelle pas `pick()`**. Seul `click` sélectionne. Les 2 tests de `Specialized.test.ts` que le deep-fix a lui-même **réécrits** pour utiliser `fireEvent.mouseDown(option)` échouent : `onChange` appelé **0 fois** (« emits the selected slot as HH:mm », « renders 12h format… »). L'affirmation « activables au click ET mousedown » est contredite par le code ET par les tests livrés rouges. | **Bloquant** | Soit (a) ajouter l'appel `pick(slot)` dans `onmousedown` (et garder `preventDefault`), soit (b) revenir à `fireEvent.click` dans ces 2 tests et retirer la promesse « mousedown ». Cohérent : (a) si l'invariant « mousedown active » est voulu, sinon (b). |
| **Popper — trapFocus déplace le focus à l'ouverture** | `$effect` (l.315) `focusable[0].focus()` ou panel ; test « opening moves focus to first child » vert. Ordre des effets correct (snapshot pre-focus défini AVANT le move-focus → capture le vrai déclencheur). | OK | — |
| **Popper — focusin rattrape le focus échappé** | `$effect` document `focusin` (l.331) ramène au 1ᵉʳ focusable si la cible sort du panel. Test vert. | OK | — |
| **Popper — Escape sur document ferme** | `$effect` `keydown` sur document (l.358) appelle `onClose`. Tests « Escape on document » et « Escape on panel » verts ; `closeOnEscape=false` respecté. | OK | — |
| **Popper — restoreFocus uniquement si trapFocus** | Snapshot `preFocusEl` seulement si `trapFocus` ; restauration gardée par `trapFocus && document.contains(...)`. Test « NOT restored when trapFocus is false » vert : pas de vol de focus en non-modal. | OK | — |
| **Popper — pas de loop réactif / fuite listener / SSR** | `preFocusEl` est une variable simple (pas `$state`) ⇒ lecture non trackée, pas de boucle. Lectures dans `untrack()`. Tous les effets gardés `typeof window === "undefined"`. Cleanups `removeEventListener` présents. | OK | — |
| **Popper — nouveau warning a11y introduit** | `tabindex={trapFocus ? -1 : undefined}` sur le `<div>` panel déclenche `a11y_no_noninteractive_tabindex` (Popper.svelte:407). **Nouveau** warning non présent avant le deep-fix ; **non couvert** par les `svelte-ignore` existants (l.405-406 visent d'autres règles). Faux positif fonctionnel (la valeur est -1), mais bruit de build à chaque compilation. Le prompt annonçait « 2 warnings restants » ; il y en a **3**. | Mineur | Ajouter `<!-- svelte-ignore a11y_no_noninteractive_tabindex -->` au-dessus du `<div>` panel (le compilateur ne peut pas prouver statiquement que le ternaire vaut -1). |
| **Calendar — exactement 1 cellule focusable (nav ‹/›, value, month, min/max)** | Invariant tenu via `clampToMonth`/`initialFocusDate` + effets de resync `focusDate`. Les tests « nav bouton ‹/› → exactement 1 tabindex=0 », « focusDate hors-bornes », « min rend antérieurs disabled » sont **verts**. | OK | — |
| **Calendar — role=row exposé (pas display:contents)** | `.st-calendar__week { display:grid }` ; test `getComputedStyle(...).display !== "contents"` vert. | OK | — |
| **Calendar — le focus DOM suit (setTimeout robuste ?)** | Le **tabindex** roving suit (vérifié vert). MAIS les tests Calendar n'assertent **jamais `document.activeElement`** — ils ne vérifient que `tabIndex===0`. Le déplacement réel du focus DOM passe par `setTimeout(focusActiveCell, 0)` ; non couvert. `focusActiveCell` requête `[data-date=...]` après rendu : raisonnable, mais la garantie « le focus DOM suit » n'est **pas testée** (contrairement à SlideIndicator/Rating qui, eux, assertent `document.activeElement`). Risque résiduel si le cell n'est pas encore monté au tick suivant (ex. nav inter-mois). | Mineur | Ajouter au moins 1 test asyncrone vérifiant `document.activeElement` après ArrowRight/PageDown (avec `vi.useFakeTimers()`/`await tick()`), pour couvrir le `setTimeout`. Le code est plausiblement correct mais non prouvé. |
| **Rating — roving radio qui FOCUS le radio cible** | `radioRefs[targetStar].focus()` après `commit`. Tests ArrowRight/ArrowLeft/Home/End assertent `document.activeElement` = la bonne étoile. **Verts.** | OK | — |
| **Rating — Home→1 jamais 0** | `next = allowHalf ? 0 : 1` ; ArrowLeft borne à `Math.max(1, …)` en mode entier. Tests « Home → étoile 1 », « ArrowLeft sur étoile 1 reste » verts. | OK | — |
| **Rating — slider focus-visible** | `role="slider" tabindex=0` + CSS `[role="slider"].st-rating:focus-visible`. Test tabindex vert. | OK | — |
| **SlideIndicator — flèches FOCUS le bouton cible** | `buttonRefs[target].focus()` dans `onKeyDown`. Tests ArrowRight/ArrowLeft/Home/End assertent `document.activeElement`. **Verts.** | OK | — |
| **SelectableList — focus transféré quand la row courante devient disabled** | **NON FONCTIONNEL.** Le test (ajouté par le deep-fix lui-même) échoue : après désactivation de la row focalisée, `document.activeElement` **reste sur la row disabled** (vérifié : `active=a` avant ET après). Pire, le roving stop atterrit sur la **mauvaise** row : `r0=-1 r1=-1 r2=0` (Gamma) au lieu de Beta. Cause racine isolée : à la ré-inscription de la row (son `$effect` de `register` re-tourne car `disabled` change), le **cleanup d'unregister fait `if (tabStopEl === el) tabStopEl = null`** (l.94). L'effet de transfert (l.111-121) voit alors `tabStopEl === null` → `return` anticipé, et `effectiveTabStop` recalcule un stop incohérent. | **Bloquant** | Ne pas remettre `tabStopEl = null` quand la row se ré-inscrit (distinguer un vrai unmount d'une simple mise à jour de `disabled`). Sinon, gérer le transfert de focus dans un effet qui lit l'ancien `tabStopEl` AVANT qu'il soit nullifié (ex. mémoriser `lastFocusedEl` indépendamment du registre). |
| **SelectableRow standalone — role=button (pas option orphelin), aria-pressed** | Défaut `role="button"` ; `aria-selected` seulement si `option`, `aria-pressed` si `button` (l.169-170). `SelectableRow.test.ts` : **15/15 vert** en run propre. (Un faux « 11 failed » observé sous cache périmé — voir avertissement.) | OK | — |
| **Warning svelte-a11y TimePicker:317** (`a11y_click_events_have_key_events`) | `<div role="option" onclick/onmousedown>` sans `onkeydown`. **Faux positif** : l'option est `tabindex=-1`, jamais focalisée ; le clavier est géré au niveau input/listbox via `aria-activedescendant`. MAIS **aucun `svelte-ignore`** ne le supprime → bruit de build permanent. | Mineur | Ajouter un `<!-- svelte-ignore a11y_click_events_have_key_events -->` ciblé avec justification (pattern combobox/activedescendant). |
| **Warning svelte-a11y Calendar:408** (`a11y_interactive_supports_focus`) | `<div role="grid" onkeydown>` non focusable. **Faux positif** pour le pattern WAI-ARIA grid (handler sur le conteneur, focus roving sur les `gridcell`). Non suppressé. | Mineur | `svelte-ignore` ciblé justifié (pattern grid roving), ou déplacer le handler sur la cellule active. |

---

## Synthèse

### Nombre par sévérité (constats ≠ OK)

- **Bloquant : 2**
  1. SelectableList — focus NON transféré quand la row focalisée devient disabled (régression d'invariant a11y + roving stop incohérent).
  2. TimePicker — mousedown ne sélectionne pas (l'affirmation « click ET mousedown » est fausse ; 2 tests livrés rouges).
- **Mineur : 5**
  - Popper : nouveau warning `a11y_no_noninteractive_tabindex` (407) non suppressé.
  - Calendar : « le focus DOM suit » non prouvé (aucun test n'assertent `document.activeElement` ; `setTimeout` non couvert).
  - Warnings TimePicker:317 et Calendar:408 : faux positifs **mais non suppressés** (bruit de build).
- **OK : 13** affirmations confirmées réellement fonctionnelles (TimePicker ArrowUp/Home/End + click ; tout Popper sauf le warning ; Calendar roving/role=row ; Rating ; SlideIndicator ; SelectableRow standalone).

### Régressions introduites par le deep-fix

1. **2 tests TimePicker rouges** (`Specialized.test.ts`) : le deep-fix a réécrit ces tests pour `fireEvent.mouseDown` alors que le composant ne sélectionne que sur `click` → incohérence livrée non testée au vert.
2. **1 test SelectableList rouge** : le test d'invariant ajouté par le deep-fix échoue (le fix ne fonctionne pas).
3. **1 nouveau warning** de compilation (Popper:407).

### Verdict : **NON PUBLIABLE EN L'ÉTAT**

La suite des composants concernés est **rouge (3 échecs / 145)**, dont deux qui invalident directement des invariants a11y revendiqués (transfert de focus, activation d'option). Publier laisserait le `npm test` cassé et deux comportements a11y défectueux.

### Top 3 à corriger avant publication

1. **SelectableList — transfert de focus (Bloquant).** Empêcher `tabStopEl = null` à la ré-inscription d'une row qui change d'état `disabled` ; garantir que le focus quitte la row disabled vers la prochaine row enabled (et que le roving stop atterrit sur celle-ci). Un utilisateur clavier/SR reste sinon piégé sur un élément disabled.
2. **TimePicker — activation mousedown (Bloquant).** Trancher : soit ajouter `pick(slot)` dans `onmousedown` (en gardant `preventDefault`), soit revenir à `fireEvent.click` dans les 2 tests et abandonner la promesse « mousedown ». Le code et les tests doivent concorder.
3. **Suppressions de warnings (Mineur, mais hygiène de build).** Ajouter les 3 `svelte-ignore` ciblés justifiés (TimePicker:317, Calendar:408, Popper:407) — et, en complément, couvrir « le focus DOM suit » du Calendar par un test `document.activeElement` pour ne pas laisser le `setTimeout` non prouvé.
