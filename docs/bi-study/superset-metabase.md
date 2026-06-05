# Étude BI — Surface graphique d'Apache Superset & Metabase

> Inventaire exhaustif de la surface graphique de deux outils BI open-source, en vue de déterminer les composants design nécessaires pour les reproduire à 100 %.
>
> **Type** ∈ { **générique** (composant DS standard : table, onglets, champ, modale…), **viz** (graphique/dataviz, souvent ECharts/deck.gl/D3), **spécialisé-BI** (composant métier propre à la BI : pivot, sélecteur de plage temporelle, panneau de métriques, cross-filter…) }.
>
> Sources : doc Apache Superset (Explore, deck.gl, Alerts & Reports), doc Metabase (visualizations, query builder, dashboards, embedding), catalogues ECharts/deck.gl.

---

## Superset

### 1. Types de visualisations

| Élément | Description courte | Type |
| --- | --- | --- |
| Big Number / KPI | Valeur unique mise en avant, avec sous-titre optionnel | spécialisé-BI |
| Big Number with Trendline | KPI accompagné d'une sparkline de tendance | viz |
| Table | Tableau de données trié/paginé, mise en forme conditionnelle | générique |
| Pivot Table (v2) | Tableau croisé dynamique, sous-totaux, heatmap/barres en cellule | spécialisé-BI |
| Time-series Line Chart | Courbe(s) sur axe temporel | viz |
| Time-series Bar Chart | Barres sur axe temporel (groupées/empilées) | viz |
| Time-series Area Chart | Aires empilées/normalisées sur axe temporel | viz |
| Time-series Scatter | Nuage de points sur axe temporel | viz |
| Time-series Smooth Line | Courbe lissée (spline) | viz |
| Time-series Step Line | Courbe en marches d'escalier | viz |
| Mixed / Generic Chart | Combinaison line + bar + area sur axes multiples | viz |
| Bar Chart | Barres catégorielles (verticales) | viz |
| Bar Chart (horizontal) | Barres horizontales | viz |
| Pie Chart | Camembert / anneau (donut) | viz |
| Nightingale / Rose Chart | Camembert polaire (aires proportionnelles au rayon) | viz |
| Funnel Chart | Entonnoir d'étapes (conversion) | viz |
| Gauge Chart | Jauge type compteur de vitesse | viz |
| Radar Chart | Toile / radar multi-axes | viz |
| Heatmap | Carte de chaleur catégorielle | viz |
| Calendar Heatmap | Heatmap sur grille calendaire (jours/semaines) | viz |
| Treemap (v2) | Pavage hiérarchique par aire | viz |
| Sunburst | Anneaux concentriques hiérarchiques | viz |
| Partition Chart | Icicle / partition hiérarchique (rectangles imbriqués) | viz |
| Sankey Diagram | Flux pondérés entre nœuds | viz |
| Chord Diagram | Relations circulaires entre catégories | viz |
| Graph / Force-directed | Réseau de relations many-to-many, nœuds dimensionnés | viz |
| Tree Chart | Arbre hiérarchique nœuds/enfants | viz |
| Word Cloud | Nuage de mots dimensionnés par fréquence | viz |
| Box Plot | Boîte à moustaches (quartiles/outliers) | viz |
| Histogram | Distribution par classes (bins) | viz |
| Bubble Chart | Nuage de points à 3e dimension (taille) | viz |
| Scatter Plot | Nuage de points X/Y | viz |
| deck.gl Scatterplot | Points géolocalisés (lat/long) sur fond carto | viz |
| deck.gl Arc | Arcs reliant deux points géographiques | viz |
| deck.gl Grid (3D) | Agrégation en cellules carrées extrudées | viz |
| deck.gl 3D Hexagon | Agrégation hexagonale extrudée (hexbin) | viz |
| deck.gl Screen Grid | Grille de densité en pixels écran | viz |
| deck.gl Heatmap | Carte de chaleur géospatiale | viz |
| deck.gl GeoJSON | Couche GeoJSON arbitraire | viz |
| deck.gl Polygon | Polygones géographiques (choroplèthe) | viz |
| deck.gl Path | Tracés / lignes géographiques | viz |
| deck.gl Contour | Lignes/zones de contour (isodensité) | viz |
| deck.gl Multiple Layers | Superposition de plusieurs couches deck.gl | viz |
| Country Map | Choroplèthe par régions d'un pays | viz |
| World Map | Carte du monde par pays (bulles/choroplèthe) | viz |
| MapBox | Points sur fond Mapbox | viz |

### 2. Interface d'authoring (Explore + SQL Lab)

| Élément | Description courte | Type |
| --- | --- | --- |
| Vue Explore (no-code) | Constructeur visuel 3 colonnes : sélecteur de viz, panneau de contrôle, aperçu | spécialisé-BI |
| Sélecteur de type de visualisation | Galerie/grille de tous les types de charts | spécialisé-BI |
| Sélecteur de Dataset | Choix du jeu de données source | spécialisé-BI |
| Onglet Data (panneau Query) | Configuration des données : dimensions, métriques, filtres | spécialisé-BI |
| Zone Dimensions / Group by | Glisser-déposer des colonnes de regroupement | spécialisé-BI |
| Zone Metrics | Métriques avec éditeur d'agrégat (SUM/AVG/COUNT…) | spécialisé-BI |
| Éditeur de métrique personnalisée | Métrique SQL libre (saved/ad-hoc) | spécialisé-BI |
| Colonne calculée | Expression de colonne dérivée au niveau dataset | spécialisé-BI |
| Sélecteur de plage temporelle (Time Range) | Plages relatives (Last week…), absolues, custom, advanced | spécialisé-BI |
| Sélecteur de granularité temporelle | Time grain (jour/semaine/mois…) | spécialisé-BI |
| Constructeur de filtres (WHERE/HAVING) | Filtres ad-hoc avec opérateurs et valeurs | spécialisé-BI |
| Row limit / Sort | Limite de lignes et tri du résultat | générique |
| Onglet Customize | Mise en forme : couleurs, axes, légende, étiquettes | spécialisé-BI |
| Color Scheme picker | Choix de palette catégorielle / séquentielle / linéaire | spécialisé-BI |
| Réglages d'axes (X/Y) | Bornes, format, titre, échelle log | spécialisé-BI |
| Réglages de légende | Position, type, affichage | générique |
| Étiquettes de données (data labels) | Format des valeurs, pourcentages | spécialisé-BI |
| Éditeur d'options ECharts (JSON) | Override JSON brut de la config ECharts | spécialisé-BI |
| Annotations & Layers | Lignes/zones d'annotation, événements, formules | spécialisé-BI |
| Bouton Run / Query | Exécution et rafraîchissement de l'aperçu | générique |
| View results / View samples | Affichage du résultat tabulaire / échantillon sous le chart | spécialisé-BI |
| Bouton Save (chart) | Sauvegarde, ajout à un dashboard | générique |
| SQL Lab (IDE SQL) | Éditeur SQL multi-onglets avec autocomplétion | spécialisé-BI |
| Schema/Table browser (SQL Lab) | Explorateur base/schéma/table latéral | spécialisé-BI |
| Résultats SQL Lab | Grille de résultats, export CSV, vers Explore | spécialisé-BI |
| Saved Queries | Bibliothèque de requêtes enregistrées | générique |
| Jinja / SQL Templating | Macros et paramètres dans les requêtes | spécialisé-BI |
| Dataset éditeur (métriques/colonnes) | Modale d'édition des métriques, colonnes, types | spécialisé-BI |

### 3. Dashboard & interactivité

| Élément | Description courte | Type |
| --- | --- | --- |
| Dashboard (grille drag-resize) | Mise en page par grille redimensionnable | spécialisé-BI |
| Onglets de dashboard (Tabs) | Organisation du dashboard en onglets | générique |
| Conteneurs Row / Column | Sous-conteneurs de disposition | générique |
| Composant Markdown / Text | Bloc de texte riche / titre | générique |
| Composant Header / Divider | En-tête de section, séparateur | générique |
| Native Filters (panneau latéral) | Filtres natifs interactifs (value/range/time…) | spécialisé-BI |
| Filter Sets / scoping | Portée des filtres par chart, dépendances entre filtres | spécialisé-BI |
| Cross-filtering | Clic sur un chart pour filtrer les autres | spécialisé-BI |
| Drill to Detail | Clic droit → lignes détaillées sous-jacentes | spécialisé-BI |
| Drill By | Clic droit → re-grouper par une autre dimension | spécialisé-BI |
| Color consistency | Cohérence des couleurs d'une catégorie sur tout le dashboard | spécialisé-BI |
| Custom CSS | Personnalisation CSS du dashboard | générique |
| Filtrage par URL | Pré-remplissage des filtres via paramètres d'URL | spécialisé-BI |
| Refresh interval / auto-refresh | Rafraîchissement périodique du dashboard | générique |
| Menu d'export chart (CSV/Excel/image) | Export et téléchargement par chart | générique |
| Alerts (seuil SQL) | Alerte si une requête KPI franchit un seuil (opérateurs <,>,==…) | spécialisé-BI |
| Reports (envoi planifié) | Envoi planifié de dashboards/charts par e-mail / Slack (screenshot, CSV, PDF) | spécialisé-BI |
| Partage public / permalink | Lien partageable du dashboard | générique |
| Embedded SDK / iframe | Intégration dans une app tierce (guest token) | spécialisé-BI |
| Favoris / certification | Marquage favori, badge de certification dataset/chart | générique |

---

## Metabase

### 1. Types de visualisations

| Élément | Description courte | Type |
| --- | --- | --- |
| Table | Tableau versatile : tri, formatage conditionnel, mini-barres | générique |
| Bar Chart | Barres (colonnes) catégorielles, empilées/groupées/normalisées | viz |
| Row Chart | Barres horizontales (catégories nombreuses) | viz |
| Line Chart | Courbe de tendance temporelle | viz |
| Area Chart | Aires (empilées / proportionnelles) | viz |
| Combo Chart | Barres + lignes (ou aires) combinées, double axe | viz |
| Pie / Donut Chart | Camembert / anneau par une dimension | viz |
| Sunburst | Camembert multi-anneaux (dimensions imbriquées) | viz |
| Scatter / Bubble | Corrélation deux variables (+ taille de bulle) | viz |
| Histogram | Distribution par classes numériques (bins) | viz |
| Waterfall | Barres cumulatives positives/négatives | viz |
| Funnel | Entonnoir d'étapes avec % de variation | viz |
| Sankey | Flux à travers des étapes multi-dimensionnelles | viz |
| Trend | Comparaison de la valeur actuelle vs période précédente (+ delta %) | spécialisé-BI |
| Number / Big Number | Valeur unique en grand | spécialisé-BI |
| Gauge | Nombre dans des plages colorées définies | viz |
| Progress Bar | Comparaison d'un nombre à un objectif (goal) | spécialisé-BI |
| Detail | Affichage 2 colonnes d'un enregistrement unique | spécialisé-BI |
| Pivot Table | Tableau croisé : permutation lignes/colonnes, sous-totaux | spécialisé-BI |
| Map — Region (choroplèthe) | Distribution agrégée par régions (pays/états) | viz |
| Map — Pin | Marqueurs de points individuels non agrégés | viz |
| Map — Grid (heat) | Carte en grille/densité pour données agrégées | viz |
| Map — Custom GeoJSON | Régions personnalisées via fichier GeoJSON (URL) | viz |

### 2. Interface d'authoring (Query Builder + SQL + Visualization settings)

| Élément | Description courte | Type |
| --- | --- | --- |
| Notebook editor | Constructeur de requête visuel en étapes empilées | spécialisé-BI |
| Étape Data (source) | Sélection table / modèle / question source | spécialisé-BI |
| Étape Join | Jointures (left/right/inner/full) via sélecteur de colonnes + diagramme de Venn | spécialisé-BI |
| Étape Filter | Filtres avec opérateurs, valeurs, expressions personnalisées | spécialisé-BI |
| Étape Summarize (métriques) | Agrégats (count/sum/avg…) à choisir | spécialisé-BI |
| Étape Group by (breakout) | Regroupement par dimension(s), binning de dates/nombres | spécialisé-BI |
| Étape Sort | Tri ascendant/descendant par colonne | générique |
| Étape Limit / Row limit | Limite de lignes (ex. top-10) | générique |
| Custom Column | Colonne dérivée via expression (calcul/texte) | spécialisé-BI |
| Custom Expression editor | Éditeur de formules (fonctions, opérateurs) | spécialisé-BI |
| Éditeur SQL natif | IDE SQL avec coloration et exécution | spécialisé-BI |
| Variables / Paramètres SQL | `{{variable}}` → widgets texte/nombre/date/champ | spécialisé-BI |
| Field filter / Optional clauses | Filtres liés à un champ, blocs `[[ ... ]]` optionnels | spécialisé-BI |
| Data Reference (browser) | Panneau d'exploration des tables/colonnes | spécialisé-BI |
| Sélecteur de visualisation | Bouton/menu de choix du type de viz | spécialisé-BI |
| Visualization settings — Axes | Titres, bornes, échelle, format d'axes | spécialisé-BI |
| Visualization settings — Series | Couleurs, nom, type par série, double axe | spécialisé-BI |
| Visualization settings — Display | Étiquettes de données, valeurs, totaux, style | spécialisé-BI |
| Goal line / Objectifs | Ligne d'objectif sur graphiques temporels | spécialisé-BI |
| Conditional formatting | Mise en forme conditionnelle (tables) | spécialisé-BI |
| Column formatting | Format nombre/date/devise, libellés | générique |
| Aperçu (Visualize / résultats) | Affichage en direct du résultat | générique |
| Bouton Save (question) | Sauvegarde en question / collection | générique |
| Models | Couche sémantique réutilisable au-dessus des données | spécialisé-BI |
| X-ray | Génération automatique de charts d'exploration | spécialisé-BI |

### 3. Dashboard & interactivité

| Élément | Description courte | Type |
| --- | --- | --- |
| Dashboard (grille) | Mise en page par grille de cartes redimensionnables | spécialisé-BI |
| Onglets de dashboard (Tabs) | Organisation par onglets thématiques | générique |
| Carte Question | Carte affichant une question/visualisation | spécialisé-BI |
| Carte Texte (Text card) | Bloc Markdown, peut contenir une variable | générique |
| Carte Titre / Heading | Titre de section | générique |
| Carte Lien (Link card) | Lien vers une URL / ressource | générique |
| Filtres / Paramètres de dashboard | Widgets de filtre (texte/nombre/date/localisation/ID) | spécialisé-BI |
| Linked filters | Filtres dépendants (un filtre restreint les valeurs d'un autre) | spécialisé-BI |
| Click behavior | Comportement au clic personnalisé par carte | spécialisé-BI |
| Drill-through menu | Menu d'exploration au clic (zoom, voir détails, filtrer) | spécialisé-BI |
| Cross-filtering | Clic sur un chart pour mettre à jour un filtre du dashboard | spécialisé-BI |
| Custom destinations | Clic → autre dashboard/question/URL avec passage de valeurs | spécialisé-BI |
| Auto-refresh | Rafraîchissement périodique | générique |
| Fullscreen / Night mode | Affichage plein écran, mode sombre | générique |
| Export carte (CSV/Excel/PNG) | Téléchargement des résultats d'une carte | générique |
| Dashboard Subscriptions | Envoi planifié e-mail/Slack (filtres par groupe) | spécialisé-BI |
| Alerts | Alerte sur résultat / ligne d'objectif franchie / progress bar | spécialisé-BI |
| Public links | Lien public chart/dashboard sans compte | générique |
| Static embedding | iframe sécurisé par JWT signé (params verrouillés) | spécialisé-BI |
| Interactive embedding | App Metabase complète embarquée (SSO, sandbox, self-service) | spécialisé-BI |
| Modular / Embedded SDK | Composants embarquables (dashboards, query builder) | spécialisé-BI |

---

## Spécificités open-source (Superset / Metabase)

| Élément | Description courte | Type |
| --- | --- | --- |
| Moteur ECharts (Superset) | La plupart des charts modernes (line/bar/pie/gauge/radar/treemap/graph/sankey…) reposent sur Apache ECharts ; éditeur d'options JSON brut exposé | viz |
| Moteur deck.gl (Superset) | Couches géospatiales WebGL 2D/3D (scatter, arc, grid, hexagon, polygon, path, contour, screen grid, heatmap, GeoJSON) | viz |
| Plugin architecture (Superset) | Catalogue de viz extensible par plugins (au-delà des ~40 natifs) | spécialisé-BI |
| SQL-first / SQL Lab (Superset) | IDE SQL, datasets virtuels, templating Jinja comme socle de l'authoring | spécialisé-BI |
| Notebook query builder (Metabase) | Construction de requêtes par étapes empilées sans SQL, conversion vers SQL | spécialisé-BI |
| Native SQL + variables (Metabase) | Éditeur SQL avec widgets de paramètres `{{ }}` et clauses optionnelles `[[ ]]` | spécialisé-BI |
| Modèles / couche sémantique (Metabase) | Modèles réutilisables, X-ray d'exploration automatique | spécialisé-BI |
| Embedding (les deux) | Superset : Embedded SDK + guest token ; Metabase : public link, static (JWT), interactive, modular SDK | spécialisé-BI |
| Cartographie (les deux) | Superset : deck.gl/Mapbox + Country/World Map ; Metabase : region/pin/grid + GeoJSON personnalisé | viz |
| Alerting & reporting (les deux) | Superset : alertes seuil SQL + reports planifiés (Celery, screenshots Playwright, e-mail/Slack) ; Metabase : subscriptions + alerts (résultat/goal/progress) e-mail/Slack/webhook | spécialisé-BI |
| Cross-filter & drill (les deux) | Cross-filtering, drill-to-detail/drill-by (Superset), drill-through/click behavior/custom destinations (Metabase) | spécialisé-BI |
| Color consistency / schemes | Palettes catégorielles/séquentielles/linéaires, cohérence des couleurs par catégorie sur tout le dashboard | spécialisé-BI |
