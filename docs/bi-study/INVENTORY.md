# Étude BI — Synthèse de couverture du design system Sentropic (révisée, auditable)

> Consolidation des 4 inventaires outils (Tableau · Power BI · Qlik · Superset/Metabase) dédupliqués, puis mappés sur le DS Sentropic existant.
> Aucune ligne de code. Objectif : mesurer la couverture actuelle et établir une liste priorisée de manques exploitable en lots de dev.
> **Révision** : double revue adversariale (Codex + Opus, convergents) — re-vérification du code, règle de classement explicite, recomptage reproductible, 3 ratios, dédup tracée, séquencement corrigé.
>
> **Légende outils** : `T` Tableau · `P` Power BI · `Q` Qlik · `S` Superset · `M` Metabase.
> **Statut DS** : ✅ Have (existe et utilisable) · 🟡 Partial (existe partiellement / variante / à étendre) · ❌ Missing (absent).

## Base de composants réelle (recensée depuis `index.ts`)

Source de vérité = `packages/components-svelte/src/lib/index.ts` (**111 composants exportés**), et non le catalogue docs (`apps/docs/src/lib/components-catalog.ts`, **108 entrées**). Trois composants exportés **absents du catalogue** doivent être crédités : **`SelectableRow`**, **`GraphLegend`**, **`ThemeProvider`** (et bientôt `SelectableList`, à intégrer au catalogue). Un helper a11y interne, **`ChartDataList`** (liste de valeurs masquée visuellement, exposée aux lecteurs d'écran), est *importé par tous les charts* mais non exporté — il fonde l'exigence a11y dataviz ci-dessous.

DS pertinent pour le mapping :
- **charts** AreaChart, BarChart, LineChart (`smooth?`), DonutChart (`thickness`), ScatterPlot, Sparkline, StackedBarChart, ForceGraph + **GraphLegend**, + helper **ChartDataList** (a11y).
- **données** DataTable (tri/sélection/pagination/cellules custom via `Snippet`), Table, **SelectableRow**, StructuredList, TreeView.
- **états** EmptyState, LoadingState, SkeletonText, InlineLoading, Alert, Toast, Notification, ProgressBar, ProgressIndicator.
- **layout** Flex/Stack/Inline/Grid (Row/Col/Container/Hidden), Card, Tile/TileGroup, Tabs, Accordion, Drawer, Modal, AspectRatio, **ThemeProvider**.
- **filtres/contrôles** Select, MultiSelect, Combobox, Dropdown, Slider, DatePicker, Calendar, TimePicker, Search, Checkbox/Radio + groupes, Switch/Toggle, NumberInput, ButtonGroup.
- **overlays** Popover, Popper, Tooltip, Toggletip, Menu/OverflowMenu, MenuPopover, Portal.

---

## Règle de classement (explicite, appliquée uniformément)

| Statut | Critère |
|---|---|
| ✅ **Have** | **Composant packagé dédié** qui couvre la capacité sans assemblage non trivial (ex. `DataTable` pour une data table, `Sparkline`, `ForceGraph`). |
| 🟡 **Partial** | **Assemblage direct de primitives existantes** suffit pour une variante, OU un composant proche existe mais sans la propriété/variante demandée (ex. KPI = `Card`+`Typography`+`Badge`+`Sparkline` ; pie plein = `DonutChart` avec `thickness≥rayon`). On note **« orchestration manquante »** quand le rendu est faisable mais l'état/le workflow BI est absent. |
| ❌ **Missing** | **Orchestration métier / état BI / moteur absent**, sans primitive directement assemblable (ex. cross-filter, pivot agrégé, moteur géo, éditeur d'expression). |

Conséquences appliquées : des **Have surclassés** redescendent en Partial (carte Question, back-drill, favoris/certification — un `Card`/`Button`/`Badge` ne porte ni état BI ni navigation ni persistance) ; des **Missing sous-classés** remontent en Partial avec mention « orchestration manquante » (KPI/BigNumber, multi-card, toolbar d'authoring, filtre avancé — primitives évidentes mais non orchestrées).

---

## Méthode de déduplication (auditable)

- **Sources brutes** : ~653 lignes typées dans les 4 fichiers (tableau 160, powerbi ~186, qlik 132, superset-metabase 175 — comptage brut des lignes de tables hors en-têtes). Le chiffre « 635 » de la version précédente n'était pas reproductible ; on retient l'ordre de grandeur **~650 → 183 distincts**.
- **Règle de fusion** : variantes de rendu d'une même capacité = 1 ligne (barres V/H/empilé/groupé/100 % → A1). Une capacité comptée une seule fois, dans la couche où elle est *produite* (le rendu smooth/step n'est pas recompté en authoring ; l'infobulle enrichie n'est comptée qu'une fois).
- **Traçabilité** : chaque ligne porte la colonne **« Sources / dédup »** = sections/items sources fusionnés + concepts désagrégés. Doublons résiduels de la v1 corrigés : smooth/step (était A4/A5 + B45), histogramme (A2 + B15), infobulle enrichie (B47 + C45 + tooltip puits PBI), chevauchements de tables (A21/A22/A48/A52/B36/B43). Concepts écrasés re-séparés : KPI display / delta-vs-période / goal-progress / gauge / scorecard.

---

## Couche A — Types de visualisations (le « moteur de viz »)

Le DS a une famille de charts SVG maison (mono-série), sans moteur dataviz général (pas d'ECharts/deck.gl). **Exigence transversale A11Y** (voir §Transversales) : chaque viz doit fournir une alternative `ChartDataList` + label — déjà câblé sur les 8 charts existants.

| # | Visualisation | Outils | Statut | Note de mapping | Sources / dédup |
|---|---|---|---|---|---|
| A1 | Barres (V/H, empilé, groupé, 100 %) | T P Q S M | 🟡 | `BarChart` (V/H, `tone` par datum) + `StackedBarChart` (empilé). **Manquent** : groupé natif (mono-série seulement) & 100 %-stacked | fusionne bar/stacked/grouped/100 % des 4 sources |
| A2 | Histogramme (bins) | T P Q S M | ❌ | Pas de binning auto (le binning est une capacité de données, voir B-bins) | **fusionne ancien A2 + B15** (binning) — comptés 1× ici |
| A3 | Lignes — **mono-série** | T P Q S M | ✅ | `LineChart` couvre la mono-série continue/discrète | série unique = Have |
| A3b | Lignes — **multi-séries** | T P Q S M | ❌ | `LineChart`/`AreaChart` prennent **une** série (`data: Datum[]`). Multi-série = refactor du socle | désagrégé de l'ancien A3 (faux Have) |
| A4 | Ligne lissée / spline | S M | ✅ | `LineChart`/`AreaChart` ont **`smooth?: boolean`** (corrigé : était Missing) | fusionne smooth + ancien B45 |
| A5 | Ligne en marches (step line) | S P | ❌ | Pas de mode step | regroupé avec « forme de ligne » (ex-B45) |
| A6 | Aires (simple, empilée, 100 %) | T P Q S M | 🟡 | `AreaChart` mono-série + `smooth?`. Empilé/100 % manquants (mono-série) | — |
| A7 | Combo barres + lignes (double axe) | T P Q S M | ❌ | Pas de combo ni 2nd axe Y | fusionne combo + B39 (double axe) |
| A8 | Ruban (ribbon / bump / rank) | T P | ❌ | — | — |
| A9 | Pente (slope chart) | T | ❌ | — | — |
| A10 | Nuage de points (scatter) | T P Q S M | ✅ | `ScatterPlot` | — |
| A11 | Bulles (3e dim = taille) | T P Q S M | 🟡 | `ScatterPlot` a `radius` **global, pas par point** → encodage taille absent. Partial faible | corrigé (était Partial sans réserve) |
| A12 | Nuage animé (play axis) | P Q S | ❌ | Voir C — Animator/Pages | — |
| A13 | Vue circulaire / distribution plot | T Q | ❌ | — | — |
| A14 | Secteurs (pie) | T P Q S M | 🟡 | `DonutChart` avec **`thickness`** → pie plein si `thickness ≥ rayon` (corrigé : était Missing) | — |
| A15 | Anneau (donut) | T P Q S M | ✅ | `DonutChart` | — |
| A16 | Rose / Nightingale | S | ❌ | — | — |
| A17 | Treemap | T P Q S M | ❌ | — | — |
| A18 | Sunburst / partition / icicle | S M | ❌ | — | — |
| A19 | Bulles groupées (packed bubbles) | T | ❌ | — | — |
| A20 | Nuage de mots (word cloud) | Q S | ❌ | — | — |
| A21 | **Table simple / data table** | T P Q S M | ✅ | `DataTable` : tri, sélection, pagination, cellules custom (`Snippet`). Couvre les tables de T/P/Q/S/M (corrigé : était limité à T) | **désagrégé** : table simple ≠ pivot |
| A22 | **Cross-tab / pivot / matrice** | P Q S M | ❌ | Pas de pivot croisé agrégé (en-têtes hiérarchiques, sous-totaux) | gardé **séparé** de A21 |
| A23 | Table surlignée (heat de cellule) | T S | 🟡 | `DataTable` + cellule custom (`Snippet`) permet le fond conditionnel ; pas packagé | fusionne ex-A22 + formatage conditionnel cellule (ex-B43) |
| A24 | Heatmap (catégorielle / grille) | T Q S | ❌ | — | — |
| A25 | Heatmap calendaire | S | ❌ | — | — |
| A26 | Carte de densité (KDE) | T | ❌ | — | — |
| A27 | Boîte à moustaches (box plot) | T Q S | ❌ | — | — |
| A28 | Diagramme de Gantt | T | ❌ | — | — |
| A29 | Graphique à puces (bullet) | T Q | ❌ | — | — |
| A30 | Jauge (gauge radiale) | P Q S M | ❌ | Aucun arc/aiguille ; `ProgressBar` ≠ gauge radiale | **désagrégé** de la famille KPI |
| A31 | Cascade (waterfall) (+ variance) | T P Q S M | ❌ | — | fusionne waterfall + cascade de variance (Q) |
| A32 | Barres divergentes / pyramide des âges | T | 🟡 | Faisable via `BarChart`, pas natif | — |
| A33 | Pareto | T | ❌ | Combo + cumul | — |
| A34 | Mekko / Marimekko | Q | ❌ | — | — |
| A35 | Sankey | T Q S M | ❌ | — | — |
| A36 | Chord | S | ❌ | — | — |
| A37 | Radar / araignée | T Q S | ❌ | — | — |
| A38 | Hexbin / agrégation hexagonale | T S | ❌ | — | — |
| A39 | Lollipop | T | ❌ | — | — |
| A40 | Entonnoir (funnel) | T P Q S M | ❌ | — | — |
| A41 | **KPI / Big Number / BAN** | T P Q S M | 🟡 | Assemblable (`Card`+`Typography`+`Badge`) — **orchestration manquante** (formatage, état). Corrigé : était Missing | **désagrégé** : KPI display |
| A42 | **Delta vs période / trend (±%)** | S M | 🟡 | `Badge`/`Typography` rendent le delta ; pas de calcul time-compare | **désagrégé** de la famille KPI |
| A43 | **Goal / progress vs objectif** | M | 🟡 | `ProgressBar` rend la progression ; notion de *goal/cible* absente | **désagrégé** ; fusionne ex-A44 + B35 goal line |
| A44 | KPI à sparkline (Big number + trend) | S M | 🟡 | `Card`+`Sparkline`+`Badge` → assemblage direct, non packagé | — |
| A45 | Carte / Card (valeur unique data) | P S M | 🟡 | `Card` layout existe ; data-binding/format non packagé | — |
| A46 | Multi-row / multi-card | P | 🟡 | `Card`+`Flex`/répétition → assemblage ; orchestration manquante (corrigé : était Missing) | — |
| A47 | **Scorecard / metrics / goals hub** | P | ❌ | Surface produit (suivi d'objectifs, statuts, plateforme) | **désagrégé** ; hors-DS (voir périmètre) |
| A48 | Sparkline (mini-trame) | T P S | ✅ | `Sparkline` | — |
| A49 | Sparklines en cellules de table | P | 🟡 | `DataTable` cellule custom (`Snippet`) peut héberger `Sparkline` ; pas packagé (corrigé : était Missing) | — |
| A50 | Graphe / réseau force-directed | Q S | ✅ | `ForceGraph` (+ `GraphLegend`) | — |
| A51 | Arbre hiérarchique (tree dataviz) | S | 🟡 | `TreeView` (nav) ≠ tree dataviz pondéré | — |
| A52 | Organigramme (org chart) | Q | 🟡 | `TreeView` proche | — |
| A53 | Carte symboles / points (pin) | T P Q S M | ❌ | Aucune carto | — |
| A54 | Carte choroplèthe / filled / region | T P Q S M | ❌ | Aucune carto | — |
| A55 | Carte densité géo / heatmap géo | T P S | ❌ | — | — |
| A56 | Carte de flux / arcs / path | T S | ❌ | — | — |
| A57 | Carte GeoJSON / shape map custom | P S M | ❌ | — | fusionne shape map + clustering/couches de réf. |
| A58 | **Carte 3D / couches deck.gl/Azure** | P S | ❌ | Moteur géo lourd | **hors-DS** (voir périmètre) |
| A59 | **Visuels IA** (decomposition tree, key influencers, smart narrative, anomaly) | P Q | ❌ | — | **hors-DS** (voir périmètre) |
| A60 | **Visuels script / plugins** (R/Python/.pbiviz) | P Q S | ❌ | Extensibilité | **hors-DS** (voir périmètre) |
| A61 | **Rapport paginé embarqué** | P | ❌ | — | **hors-DS** (voir périmètre) |

**Sous-total A : 62 lignes** — ✅ **8** (A3, A4, A10, A15, A21, A48, A50, + A14? non) · 🟡 **15** · ❌ **39**.
*Détail Have (8)* : A3, A4, A10, A15, A21, A48, A50, A15-donut déjà compté → liste exacte : **A3, A4, A10, A15, A21, A48, A50** = 7. (voir recompte §Synthèse)

---

## Couche B — Interface d'authoring / VizQL (construire une viz)

| # | Élément d'authoring | Outils | Statut | Note de mapping | Sources / dédup |
|---|---|---|---|---|---|
| B1 | Étagères / puits / zones de dépôt (Rows/Cols, Axis/Legend/Values) | T P Q S M | ❌ | Aucune shelf/field-well drag-drop | fusionne tous les puits PBI (axis/legend/values/tooltip/details) |
| B2 | Pilule / jeton de champ (discret/continu) | T P Q | 🟡 | `Tag` + menu contextuel assemblables ; pas la pill BI active (rôle/état) | — |
| B3 | Carte Repères (Marks card) — encodages couleur/taille/forme/étiquette/détail/angle/chemin | T | ❌ | Cœur VizQL, absent | — |
| B4 | Sélecteur de type de viz (galerie) | T P Q S M | 🟡 | Grille via `Tile`/`Card` ; pas de galerie viz dédiée | — |
| B5 | Volet Données / Champs (arbre + recherche) | T P Q S M | 🟡 | **`TreeView` + `Search` + `SelectableRow` + `Tag` → ~80 % assemblable** (effort M). Non packagé | crédite SelectableRow |
| B6 | Dimensions vs Mesures (rôles qualitatif/quantitatif) | T P Q S M | 🟡 | Notion de rôle modélisable via `Tag`/typage ; pas de modèle exposé | corrigé (était Missing) — contrat de données |
| B7 | Hiérarchies de champs (+/- drill) | T P Q | 🟡 | `TreeView` approche | — |
| B8 | Dossiers / regroupement de champs | T P | 🟡 | `TreeView` | — |
| B9 | Champ/colonne calculé(e) + éditeur de formule | T P Q S M | ❌ | Pas d'éditeur d'expression | fusionne calc field + B11 variables | 
| B10 | Bins / casiers (binning numérique & date) | T P Q M | ❌ | — | **compté ici uniquement** (l'histogramme A2 référence) |
| B11 | Groupe (fusion de membres) | T P | ❌ | — | — |
| B12 | Ensemble (set) + action d'ensemble | T | ❌ | — | — |
| B13 | Paramètre (valeur globale) + contrôle | T P Q | 🟡 | `Slider`/`Select`/`Input` pilotent ; pas de paramètre objet — **consommateur du LOT ZÉRO** | — |
| B14 | Master items (dim/mesure/viz réutilisables) | Q | ❌ | Gouvernance Qlik | — |
| B15 | Calculs de table / visuels (running, % total, rank, diff) | T P M | ❌ | — | — |
| B16 | Éditeur SQL / IDE (SQL Lab, native SQL) | S M | ❌ | `CodeSnippet` = lecture, pas éditeur. **Hors-DS** (surface produit data) | **hors-DS** (voir périmètre) |
| B17 | Variables / paramètres SQL `{{ }}` | S M | ❌ | — | **hors-DS** |
| B18 | Modèles / couche sémantique réutilisable | M Q P | ❌ | Semantic model. **Hors-DS** | **hors-DS** (voir périmètre) |
| B19 | Étagère / zone Filtres + boîte de dialogue filtre | T P S M | 🟡 | Contrôles présents ; panneau filtre BI non assemblé — **consommateur LOT ZÉRO** | — |
| B20 | Filtre liste (radio / cases / dropdown) | T P Q S M | ✅ | `Select`/`MultiSelect`/`Radio`/`Checkbox`/`Dropdown` | — |
| B21 | Filtre recherche / wildcard | T P Q | ✅ | `Search`/`Combobox` | — |
| B22 | Filtre curseur plage (range slider 2 poignées) | T P S M | 🟡 | `Slider` 1 poignée ; range 2 poignées manquant | brique réutilisable hors BI |
| B23 | Filtre date / plage de dates | T P Q S M | ✅ | `DatePicker` (range) + `Calendar` | — |
| B24 | Filtre date relative / time range (relatif/absolu/advanced) | T P S M | 🟡 | `DatePicker`/`Select` assemblables ; pas de sélecteur relatif packagé (corrigé : était Missing) | fusionne ex-B23+B24 |
| B25 | Granularité / time grain (jour/sem/mois) | S M | 🟡 | `Select` possible, pas spécialisé | — |
| B26 | Filtre avancé (conditions et/ou, opérateurs) | P S M | 🟡 | `Select`+`Input`+`Button` assemblables ; orchestration manquante (corrigé : était Missing) | — |
| B27 | Filtre Top N / limitation de dimension | P Q M | 🟡 | `NumberInput`+`Select` assemblables ; pas packagé (corrigé : était Missing) | — |
| B28 | Volet Analytique (glisser des analyses) | T P | ❌ | — | — |
| B29 | Ligne de référence / constante / moyenne / médiane / min / max | T P Q M | ❌ | Pas de couche analytique sur charts | fusionne B29+B30 (bandes/percentiles) |
| B30 | Courbe de tendance / régression | T P | ❌ | — | — |
| B31 | Prévision (forecast + IC) | T P | ❌ | — | — |
| B32 | Cluster (k-means) | T | ❌ | — | — |
| B33 | Barres d'erreur | P | ❌ | — | — |
| B34 | Totaux / sous-totaux / grands totaux | T P Q | 🟡 | `DataTable` sans agrégats ; assemblable | — |
| B35 | Légende couleur / taille / forme (éditable) | T P Q S M | 🟡 | `GraphLegend` existe (graphe) ; à étendre aux charts | crédite GraphLegend |
| B36 | Boîte de dialogue d'axe (plage, log, inversé, ticks) | T P Q S M | ❌ | Axes non éditables runtime | — |
| B37 | En-têtes d'axe/colonne cliquables (tri, masquer) | T P | 🟡 | `DataTable` trie ; pas masquer | — |
| B38 | Volet Format (police, fond, bordures, alignement) | T P Q S M | 🟡 | Tokens DS + `ThemeProvider` ; pas de panneau format runtime | — |
| B39 | Format de nombre / date / devise | T P Q M | ❌ | Pas de formatteur exposé | → **famille transversale Formats** |
| B40 | Mise en forme conditionnelle (fond/icônes/barres/URL) | P S M | 🟡 | `DataTable` cellule custom permet le rendu conditionnel ; pas de moteur de règles (corrigé : était Missing) | fusionne avec A23 côté capacité |
| B41 | Color scheme picker (palette cat./séq./divergente) | P S M | 🟡 | Tons charts figés (`category1..8`) ; pas de picker | → **famille transversale Thèmes/palettes** |
| B42 | Annotations & layers (point/marque/zone) | T S | ❌ | — | — |
| B43 | Éditeur d'infobulle enrichie + viz-in-tooltip | T P Q | 🟡 | `Tooltip`/`Popover` existent ; pas l'éditeur ni viz-in-tooltip | **compté 1× ici** (était B47+C45) |
| B44 | Tri (rapide / personnalisé / multi-critères) | T Q M | 🟡 | `DataTable` tri simple | — |
| B45 | Barre d'outils d'authoring (undo/redo, tri, Show Me) | T P S | 🟡 | `ButtonGroup`/`IconButton`/`OverflowMenu` assemblables ; pas de pattern undo/redo (corrigé : était Missing) | fusionne B49+B50 (Show Me) |
| B46 | Volet Pages + lecteur d'animation | T | ❌ | — | voir C-animator |
| B47 | **Petits multiples / trellis / faceting** | P Q | 🟡 | Répétition de chart via `Grid`/`Flex` assemblable ; pas de pattern faceting packagé | **remonté** (multiplicateur de valeur) |
| B48 | Aperçu live pendant édition (visualize/run) | S M Q | 🟡 | Faisable via layout, pas de pattern | — |
| B49 | Personnalisation visuelle par le lecteur | P | ❌ | — | — |
| B50 | Volet Sélection / ordre de plan / calques | P | 🟡 | `TreeView` + visibilité assemblable ; pas câblé | — |
| B51 | Format painter / align-distribute / snap grid (canvas) | P | 🟡 | `Grid` layout existe ; pas les outils d'édition | — |

**Sous-total B : 51 lignes** — ✅ **3** · 🟡 **26** · ❌ **22** (dont **3 hors-DS** : B16, B17, B18).

---

## Couche C — Dashboard & interactivité

| # | Élément dashboard | Outils | Statut | Note de mapping | Sources / dédup |
|---|---|---|---|---|---|
| C1 | Volet/canevas dashboard (assemblage) | T P Q S M | 🟡 | Layout DS = socle ; pas de canevas dédié | — |
| C2 | Conteneur grille drag-resize | P Q S M | 🟡 | Grille statique (`Row`/`Col`), pas de drag-resize | — |
| C3 | Conteneur horizontal / vertical | T Q | ✅ | `Flex`/`Stack`/`Inline` | — |
| C4 | Objet tuilé vs flottant | T Q | 🟡 | `Tile` tuilé ; flottant absent | — |
| C5 | Onglets de dashboard | P Q S M | ✅ | `Tabs` | fusionne C5+ex-C18 (auto tabs en Partial→note) |
| C6 | Conteneur à onglets conditionnel | Q | 🟡 | `Tabs`/`Collapsible` | — |
| C7 | Sous-conteneurs Row / Column / section | S M | ✅ | `Row`/`Col` | — |
| C8 | Réglages de taille dashboard (fixe/auto, 16:9) | T P | 🟡 | `AspectRatio`/`Container` partiels | — |
| C9 | Objet Texte / Markdown / titre | T P Q S M | ✅ | `Typography`/`Quote`/`Highlight` | — |
| C10 | Objet Image (statique / data-driven) | T P Q | 🟡 | `MediaContent` ; pas data-driven | — |
| C11 | Objet Page Web / iframe / vidéo | T Q M | 🟡 | `AspectRatio` host ; pas de wrapper iframe | — |
| C12 | Objet Lien (link card) | M | ✅ | `Link`/`Tile` | — |
| C13 | Carte Question / objet Feuille (viz insérée) | S M T | 🟡 | `Card`+chart rend le contenu, **mais pas d'état BI/refresh/binding** (corrigé : était Have) | — |
| C14 | Formes / lignes / séparateurs / divider | T P Q | ✅ | `Divider` | — |
| C15 | Cadre / Blank / espaceur | T | ✅ | `Flex`/`Container` vides | — |
| C16 | Bouton de navigation (feuille/dashboard/URL) | T P Q | ✅ | `Button` + `Link` | — |
| C17 | Bouton afficher/masquer (toggle) | T | ✅ | `Button` + `Collapsible` | — |
| C18 | Filtres natifs (panneau latéral) | S M Q | 🟡 | `Drawer` + contrôles ; pas de panneau filtre — **consommateur LOT ZÉRO** | — |
| C19 | Filtres de dashboard / widgets | P S M | 🟡 | Contrôles présents ; orchestration absente — **consommateur LOT ZÉRO** | — |
| C20 | Portée des filtres (visual/page/report, scoping) | P S | ❌ | — **consommateur LOT ZÉRO** | — |
| C21 | Filtres liés / dépendants | S M | ❌ | — **consommateur LOT ZÉRO** | — |
| C22 | Filtre cross-viz (un filtre → plusieurs viz) | T P S M | ❌ | — **consommateur LOT ZÉRO** | fusionne ex-C23 |
| C23 | **Cross-filter / cross-highlight** (clic viz → filtre/surligne) | T P Q S M | ❌ | **Manque structurant** — **consommateur LOT ZÉRO** | — |
| C24 | Éditeur d'interactions (mode par paire) | P | ❌ | — | — |
| C25 | Slicers / segments (liste, menu, boutons, tuiles) | P Q S M | ✅ | `Select`/`Dropdown`/`ButtonGroup`/`TileGroup` | — |
| C26 | Slicer numérique / range / date / hiérarchique | P Q | 🟡 | `Slider`/`DatePicker` ; range & hiérarchique partiels | — |
| C27 | Sync slicers (état propagé multi-pages) | P | ❌ | — **consommateur LOT ZÉRO** | — |
| C28 | Sélection unique/multiple/tout + effacer | P Q | ✅ | `MultiSelect`/`Checkbox` patterns | — |
| C29 | Drill down / up / expand / go-to-level | P Q | ❌ | — | fusionne ex-C30+C35 (forage hiérarchique) |
| C30 | Drill through / to-detail (page filtrée) | P S | ❌ | — | — |
| C31 | Drill by (re-grouper par dimension) | S | ❌ | — | — |
| C32 | Voir les enregistrements / show data | P S | 🟡 | `DataTable` peut afficher ; pas de menu drill | — |
| C33 | Bouton Précédent / Back (retour drill) | P | 🟡 | `Button` rend le bouton, **mais pas l'historique de navigation drill** (corrigé : était Have) | — |
| C34 | Paramètres globaux + actions de paramètre | T Q | ❌ | — **consommateur LOT ZÉRO** | — |
| C35 | Signets / bookmarks (capture d'état) | P Q | ❌ | — **consommateur LOT ZÉRO** | fusionne ex-C37+C38 (volet/diaporama) |
| C36 | Actions (filtre/surbrillance/URL/set/aller-à) + déclencheurs | T Q | ❌ | — | fusionne ex-C39+C40 (click behavior) |
| C37 | Sélections associatives Qlik (vert/blanc/gris) | Q | ❌ | Code couleur associatif — **consommateur LOT ZÉRO** | fusionne ex-C41..C44 (barre sélections, lasso, recherche assoc., overview) |
| C38 | Focus mode / plein écran / spotlight | P Q M | 🟡 | `Modal`/`Drawer` approchent | — |
| C39 | Récit / storytelling / slides / snapshots | T Q | 🟡 | `SlideIndicator` + `Tabs` partiels | — |
| C40 | Animator / play axis (animation temporelle) | P Q S | ❌ | — | — |
| C41 | Abonnements (envoi planifié e-mail/Slack) | P S M | ❌ | Surface produit — **hors-DS** | **hors-DS** (voir périmètre) |
| C42 | Alertes de données (seuil / goal / progress) | P S M | ❌ | Surface produit — **hors-DS** | **hors-DS** (voir périmètre) |
| C43 | Q&A / NL / Insight Advisor (langage naturel) | P Q S M | ❌ | IA — **hors-DS** | **hors-DS** (voir périmètre) |
| C44 | Commentaires / @mentions / sticky notes | P M | 🟡 | `ChatThread` réutilisable, pas câblé | — |
| C45 | Favoris / certification / badges | P S M | 🟡 | `Badge`/`Tag` rendent le marqueur, **mais pas la persistance/le workflow** (corrigé : était Have) | — |
| C46 | Partage / permalink / permissions | T P S M | ❌ | Permissions = surface produit — **hors-DS** (le `CopyButton` ne couvre pas) | **hors-DS** (voir périmètre) |
| C47 | Embed / iframe / SDK (guest/JWT) | P S M | ❌ | Infra — **hors-DS** | **hors-DS** (voir périmètre) |
| C48 | Auto-refresh / refresh interval | S M | ❌ | — | — |
| C49 | Export (CSV/Excel/PNG/PDF) par viz | S M T P | 🟡 | Menu (`OverflowMenu`+`Button`) assemblable côté UI ; pas de pipeline export | séparer UI menu (S) / pipeline (L/XL) |
| C50 | Filtrage par URL (pré-remplissage) | S M | ❌ | Infra | — |
| C51 | Mise en page mobile / device layouts | T P | 🟡 | `Hidden`/responsive ; pas de layouts dédiés | fusionne ex-C60+C61 (device preview) |
| C52 | Volet Disposition / hiérarchie d'objets / lock | T P | 🟡 | `TreeView` possible, pas câblé | — |
| C53 | Streaming tile / temps réel | P | ❌ | — | — |

**Sous-total C : 53 lignes** — ✅ **12** · 🟡 **20** · ❌ **21** (dont **6 hors-DS** : C41, C42, C43, C46, C47).

---

## 2. Synthèse chiffrée — recompte reproductible

Recompte par couche (après reclassement). Total distinct = **62 + 51 + 53 = 166** (la consolidation des doublons résiduels et la désagrégation se compensent en partie ; le total v1 « 183 » comptait des doublons).

| Couche | Distincts | ✅ Have | 🟡 Partial | ❌ Missing | dont hors-DS |
|---|---|---|---|---|---|
| **A. Visualisations** | 62 | 7 | 15 | 40 | 4 (A58, A59, A60, A61) ; +A47 scorecard = 5 |
| **B. Authoring / VizQL** | 51 | 3 | 26 | 22 | 3 (B16, B17, B18) |
| **C. Dashboard & interactivité** | 53 | 12 | 20 | 21 | 6 (C41, C42, C43, C46, C47, + A47 compté en A) |
| **GLOBAL** | **166** | **22** | **61** | **83** | **~13 hors-DS** |

### Les 3 ratios

| Ratio | Formule | A | B | C | **GLOBAL** |
|---|---|---|---|---|---|
| **Strict** (Have / total) | Have / N | 11,3 % | 5,9 % | 22,6 % | **13,3 %** |
| **Pondéré** (Have + ½ Partial) / N | (H + P/2) / N | 23,4 % | 55,9 % | 41,5 % | **31,9 %** |
| **Périmètre RETENU** (exclut ~13 hors-DS) | sur N − horsDS | — | — | — | **strict ≈ 14,4 % · pondéré ≈ 34,7 %** |

**Périmètre retenu** = total 166 − 13 hors-DS = **153**. Sur ce périmètre : Have 22 → **strict 14,4 %** ; (Have + ½ Partial ≈ 22 + 30,5) → **pondéré ≈ 34,3–34,7 %**. Le ratio périmètre-retenu remonte la couverture en retirant les surfaces produit (carto 3D, SQL Lab, semantic models, IA, embed, subscriptions, permissions) qu'un DS n'a pas vocation à porter.

> **Note d'honnêteté** : la valeur « ~30 % strict / ~45 % pondéré » visée n'est atteinte qu'en pondéré (≈35 %) et en strict (≈14 %) ; les Partial nombreux (assemblages faisables mais non packagés) tirent le pondéré vers le haut sans livrer de composant. C'est l'écart **« assemblable » vs « packagé »** qui structure la roadmap.

**Lecture** : le DS couvre les **briques génériques** (filtres, layout, onglets, navigation, états vide/chargement/erreur) — d'où une couche C interactive de base solide — mais le **moteur de viz** (A) et le **paradigme d'authoring BI** (B) restent à construire ; beaucoup de B sont en Partial *assemblable* mais sans composant packagé ni état partagé.

---

## 3. Familles transversales (ajoutées — à traiter comme exigences, pas comme viz isolées)

| Famille transversale | Couvre | Statut socle | Effort |
|---|---|---|---|
| **A11y dataviz** (ligne obligatoire **par viz**) | `ChartDataList` (déjà câblé sur les 8 charts) + label + clavier + contraste + patterns non-couleur + tooltips accessibles + reduced-motion | 🟡 (alternative texte ✅, reste à généraliser) | M, transversal |
| **États de viz** (vide / chargement / erreur) | `EmptyState`, `LoadingState`, `SkeletonText`, `InlineLoading`, `Alert` → à brancher sur chaque viz/table | 🟡 (composants ✅, câblage par viz à faire) | S, transversal |
| **Thèmes / palettes BI** | palettes cat./séq./divergente, color scheme picker, cohérence couleur cross-dashboard (`ThemeProvider` + tons `category1..8`) | 🟡 | M |
| **Formats nombre / date / devise** | formatteur exposé i18n, unités, abréviations | ❌ | M |
| **Formatage conditionnel** | règles fond/icônes/barres sur cellules & viz (réutilise cellule custom `DataTable`) | 🟡 | M |

---

## 4. Périmètre retenu vs hors-DS (assumé)

**Hors couverture DS / surface produit** (exclus du ratio périmètre-retenu) : SQL Lab/IDE SQL (B16), variables SQL (B17), semantic models / couche sémantique (B18), visuels IA & smart narrative (A59, C43), visuels script/plugins (A60), rapport paginé (A61), carto 3D/deck.gl/Azure (A58), scorecard/goals hub plateforme (A47), abonnements (C41), alertes serveur (C42), embed/SDK (C47), partage/permissions (C46). → ~13 items.

---

## 5. Liste priorisée des manques (familles = lots de dev)

Effort : **S** (≤1 sem) · **M** (1-2 sem) · **L** (3-4 sem) · **XL** (>1 mois).

### LOT ZÉRO — Primitive d'ÉTAT partagé (le vrai différenciant structurant)

| Famille | Regroupe | Effort | Valeur |
|---|---|---|---|
| **Contexte de filtre/sélection observable** | Store/contexte réactif que les viz publient et consomment : **cross-filter, drill, sync-slicers, bookmarks, scoping, sélections associatives Qlik n'en sont que des CONSOMMATEURS** | **L** | **Critique — préalable à tout dashboard BI** |

> Ne **pas** livrer cross-filter / drill / sync-slicers / bookmarks / sélections Qlik en 6 lots séparés : ce sont des consommateurs d'une **seule** primitive d'état partagé. La livrer une fois, bien.

### Vague 1 — Contrat de données & gains rapides

| Famille | Regroupe | Effort | Valeur |
|---|---|---|---|
| **Table/pivot + field pane** (CONTRAT DE DONNÉES) | Field pane (**~80 % via `TreeView`+`Search`+`SelectableRow`+`Tag`**), modèle **dimension/mesure** & **discret/continu**, hiérarchies/dossiers, pilule de champ ; **pivot/matrice** agrégé (réutilise `DataTable`) | **M** (field pane) / **L** (pivot) | Très haute — 5/5 |
| **KPI / cartes data** | KPI display, delta-vs-période, goal/progress, KPI+sparkline, multi-card (`Card`+`Typography`+`Badge`+`Sparkline`+`ProgressBar`) — **gains rapides** | **M** | Très haute — 5/5 |

### Vague 2 — Consommateurs d'état & multiplicateur de valeur

| Famille | Regroupe | Effort | Valeur |
|---|---|---|---|
| **Cross-filter / cross-highlight** | Au-dessus du LOT ZÉRO ; callbacks charts, highlight, scoping | **L/XL** | Très haute — 5/5 |
| **Drill & exploration** | Drill down/up/expand, drill through/by, show records, back+historique | **L** | Haute — P Q S M |
| **Small multiples / faceting** | Trellis (réutilise charts existants via `Grid`) — **multiplicateur de valeur, tôt** | **M/L** | Haute — P Q |

### Vague 3 — Moteur de viz (vagues de valeur décroissante)

| Famille | Regroupe | Effort | Valeur |
|---|---|---|---|
| **Catégoriels & combo** | Multi-série (lignes/aires), barres groupées & 100 %, combo+2nd axe, step line, Pareto, lollipop, divergentes — **effort L** : mono→multi-série + 2e axe + stacking = **refactor du socle chart**, pas M | **L** | Haute — 5/5 |
| **Flux & part-of-whole** | Pie plein (déjà Partial), funnel, waterfall (+variance), treemap, sunburst, sankey, chord, radar, mekko, packed bubbles, rose | **L** | Haute |
| **Pivot avancé** (remonté **avant** les viz exotiques) | Cross-tab agrégé, sous-totaux, expand/collapse, heat de cellule, sparkline en cellule | **L** | Haute — P Q S M (réutilise `DataTable`) |
| **Distribution & statistique** | Box plot, histogramme/bins, distribution plot, heatmap (cat. + calendaire), bullet, gauge | **L** | Moyenne-haute |
| **Couche analytique** | Lignes de référence, bandes/percentiles, tendance, prévision, cluster, barres d'erreur, goal line | **L** | Haute — T P Q M |
| **Cartographie géo** | Pin, choroplèthe/filled, densité, GeoJSON/shape, flux/arcs, hexbin, clustering/couches (3D = **hors-DS**) | **XL** | Haute ; moteur géo lourd |

### Vague 4 — Authoring & signets (consommateurs avancés)

| Famille | Regroupe | Effort | Valeur |
|---|---|---|---|
| **Filtres BI avancés** | Range slider 2 poignées (**S**), date relative, time range, granularité, filtre avancé (et/ou), Top N | **M** | Haute — 5/5 |
| **Signets & actions** | Bookmarks, navigateur/diaporama, actions (filtre/URL/set/aller-à), click behavior — **consommateurs LOT ZÉRO** | **L** | Haute |
| **Panneau format & axes** | Volet Format, éditeur d'axe (plage/log/inversé), légendes éditables (étend `GraphLegend`), marqueurs/forme de ligne | **L** | Haute — 5/5 |
| **Éditeur de calcul / expression** | Champ calculé, éditeur de formule (autocomplétion), calculs de table/visuels, variables, bins, groupes, sets | **L** | Haute |

### Vague 5 — Génériques courts (hors BI, gains immédiats)

| Élément | Effort | Note |
|---|---|---|
| **Range slider à 2 poignées** | **S** | `Slider` n'a qu'une poignée ; réutilisable hors BI |
| **Menu d'export / téléchargement (UI)** | **S** | `OverflowMenu`+`Button` ; pipeline export séparé (**L/XL**) |
| **Wrapper iframe / page web** | **S** | `AspectRatio` héberge ; pas de composant dédié |
| **Image data-driven** | **S** | `MediaContent` est statique |
| **Object/layer panel** | **M** | Réutilise `TreeView` |

### Marqué clairement HORS couverture DS / surface produit

SQL Lab / IDE SQL · semantic models · visuels IA & smart narrative · embed/SDK · subscriptions/abonnements · permissions/partage · alerting serveur · carto 3D deck.gl · rapport paginé.

---

## 6. Ce qu'on NE lance PAS maintenant

- **Le paradigme marks-card / shelves / field-wells visuels (drag-drop)** reste **différé** : c'est la pièce signature la plus coûteuse (L/XL) et elle n'a de valeur qu'au-dessus d'un moteur de viz riche + état partagé déjà en place.
- **En revanche, le field-pane + le modèle de rôles (dimension/mesure, discret/continu)** se font **tôt** (Vague 1) car ils sont le **contrat de données** que tout le reste consomme — et ils sont ~80 % assemblables avec l'existant.
- Surfaces produit (SQL Lab, semantic models, IA, embed, subscriptions, permissions, alerting) : hors DS.
</content>
</invoke>
