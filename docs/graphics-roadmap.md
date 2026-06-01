# Graphics / charts roadmap pour le design system Sent Tech

Périmètre : primitives de visualisation de données à ajouter au DS pour les besoins Sentropic, NC, et futurs produits (Forge, Entropic).

> Note 2026-06-01 : ce document conserve la baseline de cadrage initiale. État courant : le DS expose Sparkline, BarChart, LineChart, AreaChart, DonutChart, ScatterPlot et StackedBarChart dans `@sentropic/design-system-svelte@0.10.3`; les exports, pages docs catalogue et tests a11y sont en place.

## Baseline initiale

### DS Sent Tech (`packages/components-svelte/src/lib/`)
- Aucune brick chart. ~50 primitives livrées (Accordion → UnorderedList) couvrent layout, formulaires, navigation, feedback. Pas de Sparkline, BarChart, LineChart, DonutChart, ScatterPlot, Heatmap, Gauge, Treemap.
- Aucune dépendance chart dans `packages/components-svelte/package.json` (deps : `@lucide/svelte`, `@sentropic/design-system-themes`).
- En revanche les tokens **sont déjà prêts** : `semantic.data.category1..category8` (palette catégorielle 8 couleurs type Tableau 10) + `semantic.feedback` (success / warning / error / info) existent dans `packages/tokens/src/semantic.ts`. Les charts du DS peuvent les consommer immédiatement.

### Sentropic (`/home/antoinefa/src/sentropic/ui/`)
- Une seule visualisation dans le produit : `ui/src/lib/components/InitiativeScatterPlot.svelte` (~2300 lignes).
- Stack : `chart.js` ^4.4.0 + `chartjs-plugin-datalabels` ^2.2.0 + `@types/d3` ^7.4.3 (types seulement, pas d'import d3 réel).
- Couleurs : **hardcodées** (`const THEME_BLUE = '#475569'`, `rgba(...)` inline). Ne consomme pas les tokens DS. Les statuts utilisent un `getStatusColorInfo()` produit-spécifique, pas `semantic.status.*`.
- Pas d'autre canvas / svg chart dans le repo. Le reste est tableaux (`ScoreTable`, `ScoreCard`), badges (`MaturityStageBadge`, `StarRating`).

### NC (`/home/antoinefa/src/nc-fullstack/ui/`)
- **Aucun chart, aucune dépendance dataviz**. `package.json` consomme déjà le DS (`@sentropic/design-system-svelte ^0.7.0`) mais n'a ni chart.js, ni d3, ni layercake, ni @carbon/charts.
- Pas de fichier `*Chart*`, `*Graph*`, `*Plot*` dans `src/`.
- Implication : NC est un futur consommateur "vierge", pas une contrainte de rétrocompat.

## Stratégies de fondation évaluées

### A. Adopter `@carbon/charts-svelte` directement
**Pros**
- Couverture large prête à l'emploi : line, area, stacked area, bar (simple/group/stack), donut, pie, gauge, sparkline, scatter, heatmap, treemap, alluvial, network, radar, meter.
- Accessibilité (focus, ARIA, navigation clavier, tooltip) packagée, alignée WAI ARIA Authoring Practices.
- Wrapper Svelte officiel maintenu par IBM, suit la cadence Carbon.

**Cons / blockers**
- **Poids** : `@carbon/charts` + `d3` (peer dep) ajoutent ~250-300 kB gzipped au bundle final. Sentropic SPA, NC SSR, c'est lourd pour des produits qui n'utilisent qu'un scatter aujourd'hui.
- **Thèmage** : les charts Carbon consomment les tokens **Carbon** (`$ui-01`, `$text-01`, palette IBM). Les surcharger pour pointer sur `--sds-semantic-data-category1..8` demande soit un script de mapping SCSS au build, soit un `themeProvider` Carbon shim — friction réelle pour la promesse white-label runtime.
- **Svelte 5 compat à valider** : `@carbon/charts-svelte` 1.x est officiellement Svelte 4. Version Svelte 5 native pas encore stable au moment d'écrire (à vérifier au moment d'implémenter ; un `legacy` plugin Vite est requis si on reste en 1.x).
- **API verbeuse** : `data + options` à la Chart.js / d3, peu idiomatique Svelte 5 / runes.

### B. Wrapper léger autour de `layercake` (ou `pancake-charts`)
**Pros**
- `layercake` est une **toolkit Svelte-native** (par Russell Goldenberg, NYT) qui fournit le layout (scales, dimensions, padding) et laisse l'auteur composer ses propres `<Line>`, `<Bar>`, `<Axis>` en Svelte pur. ~15 kB.
- Tokens-friendly : on écrit `<rect fill="var(--sds-semantic-data-category1)" />` — pas de mapping SCSS, le runtime theming marche out-of-the-box.
- Le DS expose des primitives stables (`<LineChart>`, `<BarChart>`...) qui en interne composent layercake. Les produits ne voient jamais layercake.
- Svelte 5 friendly (layercake 8.x supporte Svelte 5).

**Cons**
- Tooltips, légendes, axes formattés, accessibilité clavier, brushing : **à écrire nous-mêmes**, layercake ne les livre pas. Estimation V1 : 4-6 j-h par primitive complexe (line/area/bar/stacked) une fois la fondation posée.
- Pas de chart "exotique" prêt (gauge, alluvial, treemap, heatmap) — soit on les ajoute progressivement, soit on les laisse hors périmètre.
- Russell Goldenberg maintient layercake en solo : moins de garanties long-terme que Carbon.

### C. Primitives hand-rolled Svelte 5 (sans dépendance dataviz)
**Pros**
- Zéro dépendance, contrôle total sur tokens, animation, SSR.
- Pour des primitives simples (Sparkline, BarChart linéaire, DonutChart d'un seul segment), c'est ~150-300 lignes Svelte chacune.
- Aligné avec l'esprit "hand-roll if simple, wrap if complex" déjà appliqué dans le DS (Tooltip, ProgressBar).

**Cons**
- Calcul de scales (linéaire, ordinale, temporelle), ticks, label rotation, log scales : à réimplémenter. Cela existe déjà dans d3-scale / layercake.
- Accessibilité (lecture séquentielle des points, focus visible, `role="img" aria-label`) à designer maison.
- À l'échelle de 8-10 primitives, on réinvente une partie non triviale de d3 ; risque de bugs et de drift API entre primitives.

## Recommandation

**Stratégie B : wrapper layercake pour les primitives standard (Line/Area/Bar/Stacked/Donut/Scatter), hand-roll pur (C) pour Sparkline et les cas triviaux.** Rationale : layercake donne le layout et les scales (la partie pénible) tout en laissant le SVG entièrement sous contrôle Svelte, donc les couleurs, polices, espacements **consomment directement les tokens `--sds-*`** — c'est ce qui rend la promesse white-label runtime tenable. Carbon (A) casse ce contrat (palette IBM en dur dans la lib) et alourdit le bundle de ~250 kB pour des produits qui ne dessinent aujourd'hui qu'un scatter. Pure hand-roll (C) sous-estime le coût d-axes/ticks/scales et conduit à du drift entre primitives. On garde Carbon comme plan B documenté si on découvre un besoin de chart exotique (treemap, alluvial) qui ne justifie pas son implémentation maison.

## Plan V1 (primitives proposées)

Ordre de priorité = combinaison (demande Sentropic/NC court terme + simplicité d'implémentation).

1. **`Sparkline`** — micro-courbe inline pour KPI / score trend. Props : `values: number[]`, `width?`, `height?`, `variant?: "line"|"area"|"bar"`. Hand-roll pur (C), pas de layercake.
2. **`BarChart`** — barres verticales/horizontales simples. Props : `data: {label, value}[]`, `orientation?: "vertical"|"horizontal"`, `color?: string`, `showValues?: boolean`. Couvre score cards Sentropic.
3. **`LineChart`** — séries temporelles ou ordinales. Props : `series: {name, points: {x, y}[]}[]`, `xType?: "time"|"linear"|"ordinal"`, `legend?: boolean`. Base pour usage analytique NC / Sentropic.
4. **`DonutChart`** — répartition catégorielle + label central optionnel. Props : `slices: {label, value, color?}[]`, `centerLabel?: string`, `centerValue?: string`. Remplace les `<div>` "pseudo-donut" qu'on voit dans `ScoreCard`.
5. **`AreaChart`** — variante stack/non-stack de LineChart. Props : `series: ...`, `stack?: boolean`. Réutilise la machinerie LineChart.
6. **`StackedBarChart`** — barres empilées multi-séries. Props : `data: {label, segments: {key, value}[]}[]`, `legend?: boolean`.
7. **`ScatterPlot`** — remplace progressivement `InitiativeScatterPlot.svelte` de Sentropic. Props : `points: {x, y, label?, color?, id?}[]`, `xLabel?`, `yLabel?`, `quadrants?: {xThreshold, yThreshold}`, `onPointClick?`. Le placement de labels avancé (anti-overlap recuit simulé) reste **côté produit** dans un wrapper Sentropic ; le DS livre le scatter de base.
8. **`Heatmap`** — grille catégorielle x catégorielle x valeur. Props : `rows: string[]`, `cols: string[]`, `values: number[][]`, `colorScale?: "sequential"|"diverging"`.
9. **`ChartLegend`** — primitive partagée (cases + libellés cliquables) consommée par tous les charts. Props : `items: {label, color, active?}[]`, `onToggle?`.
10. **`ChartTooltip`** — primitive partagée positionnée au pointeur, réutilise `Tooltip` du DS si possible. Props : `x`, `y`, `title?`, `entries: {label, value, color}[]`.

`ChartLegend` et `ChartTooltip` (9, 10) sont des **sous-primitives transverses** : à livrer dès que la première primitive chart en a besoin (probablement BarChart).

## Tokens et thèmes

Les chart primitives consomment uniquement des CSS custom properties — jamais de couleur hardcodée. Les tokens à utiliser :

- **Palette catégorielle** : `--sds-semantic-data-category1` à `--sds-semantic-data-category8` (déjà définis dans `packages/tokens/src/semantic.ts`). Les couleurs des séries / segments / slices viennent de là, cyclique au-delà de 8.
- **Feedback / statuts** : `--sds-semantic-feedback-success|warning|error|info` pour les charts à sémantique (seuil dépassé en rouge, etc.).
- **Surface chart** : `--sds-semantic-surface-background`, `--sds-semantic-surface-elevated` pour le fond du chart et des tooltips.
- **Texte** : `--sds-semantic-text-primary` (titre/valeur), `--sds-semantic-text-secondary` (axes, légende), `--sds-semantic-text-disabled` (séries masquées).
- **Bordures / grilles** : `--sds-semantic-border-subtle` (lignes de grille), `--sds-semantic-border-strong` (axes).
- **Typo** : `--sds-typography-body-sm` ou un nouveau token `--sds-typography-chart-label` à introduire (à arbitrer en revue tokens). Pas de `font-family` codée en dur.

À ajouter (proposition pour `component.ts`) :
- `chart.axis.color`, `chart.axis.label.color`, `chart.grid.color`, `chart.tooltip.background`, `chart.tooltip.text`, `chart.legend.text`, `chart.legend.indicator.size`. Ces tokens component encapsulent les choix par-chart et restent surchargeables par thème (Sent Tech, Forge, Entropic, tenant white-label).

## Hors périmètre V1

- Charts 3D, gauges radiales animées, jauges aiguille type voiture.
- Alluvial / Sankey, treemap, network graphs, calendar heatmap : à reconsidérer en V2 si besoin produit avéré, sinon plan B = délégation à `@carbon/charts-svelte` ponctuelle.
- Animation d'entrée complexe (morphing, staggered). V1 = simple fade/opacity.
- Brushing / zoom / pan interactif. V1 = tooltip au hover + clic optionnel.
- Export PNG / SVG / CSV depuis la primitive. Restera côté produit (Sentropic fait son propre `getDocxBitmapSnapshot` aujourd'hui).
- Time-series très volumineuses (>10 000 points). Pas l'usage Sentropic/NC court terme ; si besoin, canvas-based à part.
- Layout responsive automatique aux container queries : V1 = `width` / `height` props ou ResizeObserver simple.
