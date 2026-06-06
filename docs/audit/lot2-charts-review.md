# Revue adversariale — Lot 2 BI charts (Heatmap / Sankey / BoxPlot / Histogram / Radar / Sunburst)

Reviewer: Opus 4.8 (lecture seule). Worktree: `/tmp/sent-tech-bi2` (branche `codex-bi-charts-2`, NON commité).
Cibles: `packages/components-{svelte,react,vue}/src` + tests + pages docs.

## Résultat des gardes-fous demandés

- **(a) Tokens inventés** : PASS. `grep -E "feedback-danger|surface-muted|st-spacing-(100|200|300)"` sur les 6 composants des 3 frameworks = **vide**. Couleurs via `--st-semantic-data-category1..8` réels (Tableau 10 : `#4E79A7 #F28E2B #E15759 #76B7B2 #59A14F #EDC948 #B07AA1 #FF9DA7`), espacements via `--st-spacing-{2,4}` réels. (Les seuls hits `feedback-danger` du repo sont IconButton/ChatMessage préexistants, hors lot.)
- **(b) Algos** : globalement corrects SAUF conservation Sankey (max au lieu de somme) — voir #1.
- **(c) NaN/Infini/vide/négatifs** : majoritairement gardés, **une fuite NaN dans React Heatmap** — voir #3.
- **(d) Contraste labels** : **échec WCAG dans Sunburst Svelte** (texte blanc sur fills clairs) — voir #2.
- **(e) A11y** : `role="img"`+`aria-label`, `ChartDataList` masqué (clip-rect) et `aria-hidden` sur SVG : tous présents et corrects. **MAIS `prefers-reduced-motion` absent des 6 composants** alors que tous les charts du lot 1 (Area/Combo/Funnel/Waterfall/Treemap/Gauge) l'ont — voir #4.
- **(f) Parité** : **échec massif** — 3 implémentations divergentes (props, défauts, algos, rendu) — voir #1/#2/#5/#6/#7/#8.

## Top 8

| # | Composant | Constat | Sévérité | Correction |
|---|-----------|---------|----------|------------|
| 1 | **Sankey** (3 fw) | **Conservation de flux violée** : la hauteur de nœud dérive de `Math.max` des valeurs de liens (`valuesByNode.set(src, Math.max(prev, link.value))`), pas de la **somme** des flux entrants/sortants. Un nœud qui agrège 3 flux de 10 paraît aussi « gros » qu'un flux unique de 10. Un Sankey dont les épaisseurs ne se somment pas est faux par définition. | **Bloquant** | Calculer `valueIn = Σ liens entrants`, `valueOut = Σ liens sortants`, hauteur = `max(in,out)`. Aligner les 3 fw sur la même formule. |
| 2 | **Sunburst Svelte** | **Contraste WCAG** : `.st-sunburstChart__label { fill: var(--st-semantic-surface-default) }` = texte **blanc** dessiné sur les fills d'arcs. Sur category2 `#F28E2B` (~2.2:1), category4 `#76B7B2` (~2.0:1), category5 `#59A14F` (~2.6:1), category6 `#EDC948` (~1.4:1), category8 `#FF9DA7` (~1.8:1) → **échec 4.5:1 (et même 3:1)** sur 5 tons/8. Identique au défaut du lot 1. React/Vue **ne rendent aucun label d'arc** → ils esquivent le bug mais créent une divergence (cf #6). | **Bloquant** | Utiliser un token texte à contraste garanti sur fills catégoriels (ou retirer le label de l'arc et le mettre en infobulle, comme React/Vue). Trancher une seule approche pour les 3 fw. |
| 3 | **Heatmap React** | **Fuite NaN** : `minValue/maxValue = Math.min/Math.max(...data.map(d=>d.value))` **sans `.filter(Number.isFinite)`**. Une seule valeur `NaN` ⇒ min/max = `NaN` ⇒ `toneForValue` calcule un index `NaN` ⇒ `TONES[NaN] = undefined` ⇒ classe `st-heatmapChart__cell--undefined` (cellule incolore). Svelte **et** Vue filtrent (`if (!Number.isFinite(value) || max<=min) return "category1"`). React est le seul non gardé. | **Élevé** | Filtrer les non-finis avant min/max et garder `max<=min`, comme Vue/Svelte. |
| 4 | **Tous (6)** | **`prefers-reduced-motion` absent.** Chaque composant pose `transition: opacity 120ms ease` (cellules/liens/barres/boîtes/arcs) mais **aucun** bloc `@media (prefers-reduced-motion: reduce)`. Les 6 charts du lot 1 (Area/Combo/Funnel/Waterfall/Treemap/Gauge) l'incluent : c'est une régression du pattern maison. | **Élevé** | Ajouter le `@media (prefers-reduced-motion: reduce){ transition: none }` aux 6, parité Svelte/React/Vue (styles.css). |
| 5 | **Sankey** (parité) | **3 algos différents.** Défauts : Svelte `560×280` / React+Vue `520×260`. NODE_WIDTH : Svelte 14 / React+Vue 18. Épaisseur lien : Svelte `max(2, v/m·18)`, React `max(3, 3+v/m·14)`, **Vue `2+v/m·12` (aucun plancher → trait quasi nul possible)**. Hauteur nœud : 3 formules distinctes. Placement X : React `depth/maxDepth·plotWidth` vs Vue `level/maxLevel·(plotWidth−nodeWidth)`. **Vue `flatMap` supprime les liens à extrémité manquante** → désync entre indices survolés et `ChartDataList`. | **Élevé** | Factoriser une seule routine de layout (constantes + formules partagées) ; ne pas drop silencieusement les liens orphelins. |
| 6 | **Sunburst** (parité) | **Rendus incompatibles.** Svelte : pas de cercle racine, `ringCount=maxDepth`, **labels blancs sur arcs**, infobulle `", "`. React : **rend un `<circle>` racine**, `depthCount=maxDepth+1`, **aucun label**, infobulle `" -> "`. Vue : pas de racine, `toneIndex` = **compteur global séquentiel** (coloration différente du `siblingIndex` Svelte / `index%8` React), infobulle `" · "`, et **API `size` unique au lieu de `width`/`height`** (cf #7). Trois graphiques visuellement différents pour la même donnée. | **Élevé** | Aligner géométrie (racine ? nb anneaux), stratégie de tons, et libellés des infobulles. |
| 7 | **Sunburst / Radar** (API) | **Noms de props divergents — casse le code consommateur.** Sunburst : Vue expose `size` (Number, 280) ; React/Svelte exposent `width`/`height` (320/320). Radar : **Svelte = `maxValue`**, React/Vue = `max`. Un même usage ne compile/rend pas d'un fw à l'autre. De plus Radar React/Vue **forcent un domaine plancher de 100** (`max(100, …)`), pas Svelte (`max(1, …)`) → échelles de polygones différentes pour données identiques. | **Élevé** | Uniformiser les noms (`width`/`height`, `maxValue`) et la règle de domaine (plancher 100 ou non) sur les 3 fw. |
| 8 | **Histogram** (parité) / **BoxPlot** (validation) | Histogram : **bins par défaut divergents** — Svelte `10`, Vue `10`, **React `ceil(√n)`** (dépend de la donnée) → nombre de barres différent pour la même entrée. BoxPlot : aucune validation d'ordre des quartiles ; si `q1>q3` ou `min>max` en entrée, rendu via `abs()` sans signaler l'incohérence (rendu plausible mais trompeur). | **Moyen** | Aligner le défaut de bins (10 partout, ou √n partout). Optionnel : garde-fou sur l'ordre min≤q1≤median≤q3≤max (clamp + avert.). |

## Comptage par sévérité

- **Bloquant : 2** (#1 conservation Sankey, #2 contraste Sunburst Svelte)
- **Élevé : 5** (#3 NaN React Heatmap, #4 reduced-motion absent, #5 parité Sankey, #6 parité Sunburst, #7 props divergentes Sunburst/Radar)
- **Moyen : 1** (#8 bins Histogram / validation BoxPlot)

## Verdict

**NON PUBLIABLE en l'état.** Le grep tokens passe (a) et les algos noyau (bins/quartiles/arcs/échelles) sont corrects en isolé, mais deux défauts bloquants demeurent — un Sankey qui viole la conservation des flux (faux par construction) et le même piège de contraste blanc-sur-clair que le lot 1 (Sunburst Svelte) — et la **parité Svelte/React/Vue n'est pas tenue** : props, défauts et rendus divergent au point que ce sont, par endroits (Sankey, Sunburst, Radar), trois composants distincts sous un nom commun. Corriger #1–#7 avant publication ; #8 peut suivre.

## Top 5 (priorité de correction)

1. **Sankey — conservation de flux** : hauteur de nœud = somme des flux, pas le max (3 fw).
2. **Sunburst Svelte — contraste WCAG** : labels blancs sur fills catégoriels clairs (5/8 tons échouent).
3. **Heatmap React — fuite NaN** : filtrer les non-finis avant min/max (Vue/Svelte le font déjà).
4. **reduced-motion absent des 6 composants** : ajouter le `@media` comme le lot 1.
5. **Parité props/algos** : `size`→`width`/`height` (Sunburst Vue), `max`/`maxValue` (Radar), bins (Histogram), unifier les layouts Sankey/Sunburst.
