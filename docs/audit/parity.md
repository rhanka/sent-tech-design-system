# Audit de parité Svelte ↔ React ↔ Vue

**Périmètre** : composants ajoutés cette session (Layout, Groupes/identité, Spécialisés, Primitives, UAT8).
**Méthode** : comparaison des SOURCES (`components-svelte/src/lib/*.svelte` vs `components-react/src/*.tsx`|`catalog.tsx` vs `components-vue/src/*.ts`) — jeu de props + défauts, types exportés (`index.ts` ×3), classes `st-*`, présence des règles CSS dans `react`/`vue` `styles.css`, events/callbacks (`onX`), comportement clé.
**Date** : 2026-06-05 — READ-ONLY, aucun commit.

> **Avertissement (re-port en cours)** : au moment de l'audit, un autre agent re-portait activement **SelectableRow / SelectableList (React + Vue)** et **ForceGraph `mergePair` (Vue)**. Plusieurs écarts MAJEURS observés en début de lecture (Vue `SelectableRow` standalone sans contexte de liste, `SelectableList` Vue absent, `mergePair` Vue sans `id`) ont été **corrigés en direct pendant l'audit**. Le tableau ci-dessous reflète l'état **final** lu ; les écarts résiduels sont surtout des fuites d'export et un trou de couverture de tests côté Vue. La sévérité « observé/résolu » est annotée.

---

## Layout

| Composant | Écart constaté | Sévérité | Framework(s) | Correctif |
|---|---|---|---|---|
| Flex / Stack / Inline / Container / Row / Col / Hidden / Divider | Aucun écart. Props, défauts, types, classes `st-*`, règles CSS (`styles.css` react+vue), helpers exportés (`spacingToken`/`alignValue`/`justifyValue`/`spanBasis`/`offsetMargin`) tous alignés. | — | — | RAS |

---

## Groupes / identité

| Composant | Écart constaté | Sévérité | Framework(s) | Correctif |
|---|---|---|---|---|
| RadioGroup | Prop `name` **optionnelle** en Svelte (`name?: string` historiquement) vs **requise** en React/Vue (`name: string` / `required: true`). NB : la source Svelte lue en fin d'audit affichait `name: string` (requis) — convergence probable, à confirmer après stabilisation. | MINEUR | Svelte (si encore optionnel) | Rendre `name` requis dans le type Svelte pour aligner le contrat (exclusivité radio). |
| Avatar / AvatarGroup / ButtonGroup / CheckboxGroup / Typography / Collapsible / Stepper | Aucun écart de props/défauts/classes/CSS. Convention de nommage des callbacks idiomatique (`onchange` Svelte vs `onChange` React/Vue) — attendue, non comptée. | — | — | RAS |

---

## Spécialisés

| Composant | Écart constaté | Sévérité | Framework(s) | Correctif |
|---|---|---|---|---|
| TimePicker | Vue **exporte le type `TimePickerSize`** depuis `index.ts` ; React et Svelte ne l'exportent pas (React n'exporte que `TimePickerProps, TimePickerFormat`, Svelte que `TimePickerFormat`). Le type existe pourtant dans les 3 sources. | MINEUR | React, Svelte (manquant) / ou Vue (en trop) | Harmoniser : ajouter `TimePickerSize` aux exports React+Svelte (ou le retirer de Vue) selon la règle d'API retenue. |
| SlideIndicator | Idem : Vue **exporte `SlideIndicatorSize`**, pas React ni Svelte. | MINEUR | React, Svelte (manquant) / Vue (en trop) | Harmoniser l'export de `SlideIndicatorSize` sur les 3. |
| Rating / Calendar / Autosave | Aucun écart (props, défauts, types, classes `st-*`, CSS, behavior). `value` par défaut traité comme 0/""/null de façon équivalente malgré des défauts littéraux différents (Svelte `value = 0` vs React/Vue `undefined`+coalescence). | — | — | RAS |

---

## Primitives

| Composant | Écart constaté | Sévérité | Framework(s) | Correctif |
|---|---|---|---|---|
| Portal | `resolvePortalTarget` (helper) **exporté depuis `index.ts` uniquement par React**. Svelte le **définit** dans `Portal.svelte` mais ne le **re-exporte pas** depuis l'index ; Vue ne l'a pas (Teleport natif, helper inutile). Surface d'API publique incohérente entre frameworks. | MINEUR | Svelte (défini non ré-exporté), Vue (absent) | Re-exporter `resolvePortalTarget` depuis l'index Svelte ; pour Vue, soit fournir un équivalent, soit documenter l'absence volontaire. |
| Popper | Aucun écart. `computePosition`/`splitPlacement`/`joinPlacement` identiques (géométrie pure), props/défauts (`offset=8`, `flip=true`, `shift=true`, `strategy="absolute"`, `portal=true`), classes `st-popper`/`st-popper__arrow`, `data-popper-placement`/`data-popper-side`, event `onPlacementChange`/`placementChange` alignés. CSS présent (react+vue : 6 règles `st-popper`). | — | — | RAS |

---

## UAT8

| Composant | Écart constaté | Sévérité | Framework(s) | Correctif |
|---|---|---|---|---|
| SelectableRow | **[OBSERVÉ EN DÉBUT → RÉSOLU EN DIRECT]** Vue était la version standalone héritée : pas de prop `accentBar` ni `role`, pas d'intégration au contexte de liste, pas de tabindex « roving » ni de navigation flèches, classe `st-selectableRow--accentBar` absente, CSS Vue obsolète. La source Vue lue en fin d'audit est **alignée** sur Svelte/React (inject de `SELECTABLE_LIST_KEY`, `accentBar`, `role`, roving, navigation). | MAJEUR (résolu) | Vue | Déjà corrigé par le re-port ; valider après stabilisation. |
| SelectableList | **[OBSERVÉ EN DÉBUT → RÉSOLU EN DIRECT]** Le fichier `components-vue/src/SelectableList.ts` était **absent** alors que `index.ts` l'importait déjà (build Vue cassé : import d'exports inexistants `SELECTABLE_LIST_KEY`, `SelectableListContext`, `SelectableList`). En fin d'audit le fichier **existe** et l'implémentation (controlled/uncontrolled, `multiple`, roving, ordre DOM, sémantique listbox) **correspond** à Svelte/React. | BLOQUANT (résolu) | Vue | Déjà corrigé ; relancer `tsc`/build Vue pour confirmer la résolution des imports. |
| SelectableList — tests | **`components-vue/src/SelectableList.test.ts` absent.** Svelte ET React possèdent les deux fichiers de tests (`SelectableList` + `SelectableRow`). Vue n'a que `SelectableRow.test.ts`. | MAJEUR | Vue | Porter le test `SelectableList` (listbox, roving, single/multi, controlled) depuis React/Svelte. |
| SelectableRow — tests | `components-vue/src/SelectableRow.test.ts` ne couvre que le comportement standalone hérité (sélection/`onSelect`) : **aucun test** `accentBar`, contexte de liste, roving tabindex ou navigation clavier (contrairement à React/Svelte mis à jour). | MINEUR | Vue | Étendre le test Vue pour couvrir les nouveaux contrats (rôle forcé `option`, tabindex roving, flèches, `accentBar`). |
| ForceGraph `mergePair` | **[OBSERVÉ EN DÉBUT → RÉSOLU EN DIRECT]** Vue keyait l'animation sur `"${from} ${into}"` (pas de champ `id`), donc **rejouer la même paire ne relançait pas la fusion**, et la signature `mergePair`/`onMergeComplete` omettait `id` (vs `{ id, from, into }` en Svelte/React). En fin d'audit Vue utilise `{ id, from, into }` keyé sur `id` (`handledMergeId`) — **aligné**. | MAJEUR (résolu) | Vue | Déjà corrigé ; vérifier que le test Vue couvre le re-trigger par `id`. |
| ForceGraph — exports | Vue **n'exporte pas** `edgeDashArray` (fonction) ni `ForceGraphEdgeDash` (type) depuis `index.ts`, alors que les deux sont **définis** dans `components-vue/src/ForceGraph.ts` et **exportés** par Svelte et React. Surface d'API incomplète côté Vue. | MINEUR | Vue | Ajouter `export { edgeDashArray }` et `export type { ForceGraphEdgeDash }` à `components-vue/src/index.ts`. |

---

## Top-10 priorisé

1. **[BLOQUANT — résolu, à re-vérifier]** Vue `SelectableList.ts` était manquant alors que `index.ts` l'importait → build Vue cassé. Relancer le build/`tsc` Vue pour confirmer.
2. **[MAJEUR — résolu, à re-vérifier]** Vue `SelectableRow` ré-aligné sur le contrat list-managed (contexte, roving, `accentBar`, `role`). Valider après stabilisation du re-port.
3. **[MAJEUR — résolu, à re-vérifier]** Vue `ForceGraph.mergePair` ré-aligné sur `{ id, from, into }` keyé par `id`. Vérifier le re-trigger même paire.
4. **[MAJEUR]** Tests : créer `components-vue/src/SelectableList.test.ts` (absent ; présent en Svelte+React).
5. **[MINEUR]** Vue : exporter `edgeDashArray` + `ForceGraphEdgeDash` depuis `index.ts` (définis mais non ré-exportés).
6. **[MINEUR]** Étendre `components-vue/src/SelectableRow.test.ts` aux nouveaux contrats (roving/accentBar/navigation).
7. **[MINEUR]** Harmoniser l'export `TimePickerSize` (Vue le sort, pas React/Svelte).
8. **[MINEUR]** Harmoniser l'export `SlideIndicatorSize` (Vue le sort, pas React/Svelte).
9. **[MINEUR]** Re-exporter `resolvePortalTarget` depuis l'index Svelte (défini mais non ré-exporté) ; statuer sur Vue.
10. **[MINEUR]** RadioGroup : confirmer/forcer `name` requis côté Svelte pour aligner sur React/Vue.

---

## Synthèse par sévérité (état final lu)

- **BLOQUANT** : 1 (Vue `SelectableList` manquant / index cassé) — observé puis résolu en direct.
- **MAJEUR** : 4 — dont 3 observés puis résolus en direct (SelectableRow Vue, mergePair Vue) + 1 actif (test `SelectableList` Vue manquant).
- **MINEUR** : 6 (exports `edgeDashArray`/`ForceGraphEdgeDash`, `TimePickerSize`, `SlideIndicatorSize`, `resolvePortalTarget`, RadioGroup `name`, tests SelectableRow Vue).

> Hors re-port en cours, les seuls écarts **stables et actifs** sont des fuites d'export d'API côté Vue et un trou de couverture de tests Vue. Le cœur comportemental (props/défauts/géométrie/CSS) des Layout, Spécialisés et Primitives est en parité complète sur les 3 frameworks.
