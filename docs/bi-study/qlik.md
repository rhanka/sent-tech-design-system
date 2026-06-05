# Étude de surface graphique — Qlik Sense (et Qlik View)

> Inventaire exhaustif de la surface graphique de **Qlik Sense** en vue d'une reproduction à 100 % par un design system. Aucune ligne de code : inventaire structuré.
> Source : documentation Qlik (help.qlik.com, novembre 2025) + Qlik Cloud. Référence Qlik View signalée le cas échéant.
> Type ∈ { **générique** (composant UI réutilisable hors BI), **viz** (graphique / représentation de données), **spécialisé-BI** (artefact propre à l'analytique / au moteur associatif) }.

---

## 1. Types de visualisations

### 1.1 Graphiques natifs (chart picker)

| Élément | Description courte | Type |
| --- | --- | --- |
| Graphique en barres (Bar chart) | Barres comparant une mesure sur une ou plusieurs dimensions ; vertical/horizontal, empilé/groupé | viz |
| Graphique en lignes (Line chart) | Lignes reliant des valeurs ; tendances dans le temps, multi-séries | viz |
| Graphique en aires (Area chart) | Variante de la ligne avec aires remplies, empilables | viz |
| Graphique combiné (Combo chart) | Combine barres + lignes avec deux axes Y (ex. sommes vs pourcentages) | viz |
| Secteurs (Pie chart) | Relation d'une dimension à une mesure, parts d'un tout | viz |
| Anneau (Donut) | Variante du camembert avec centre évidé | viz |
| Nuage de points (Scatter plot) | Deux mesures en X/Y, 3e mesure en taille de bulle, compression de gros volumes | viz |
| Treemap (carte proportionnelle) | Données hiérarchiques en rectangles imbriqués proportionnels | viz |
| Jauge (Gauge) | Une mesure unique sans dimension, plages qualitatives colorées | viz |
| Boîte à moustaches (Box plot) | Étendue et distribution (quartiles, médiane, moustaches, valeurs aberrantes) | viz |
| Carte de distribution (Distribution plot) | Points de valeurs le long d'un axe pour montrer étendue/densité | viz |
| Histogramme (Histogram) | Distribution de données numériques continues en classes/bins | viz |
| Graphique en cascade (Waterfall) | Effet cumulé de valeurs positives/négatives sur une valeur initiale | viz |
| Mekko (Marimekko) | Comparaison de groupes et d'items de catégories (largeur + hauteur variables) | viz |
| Graphique à puces (Bullet chart) | Performance vs cible et plages qualitatives | viz |
| Carte (Map) | Données géospatiales + mesures ; couches point/zone/ligne/densité/graphique/contexte/arrière-plan | viz |
| KPI | Chiffre(s) de performance central(aux), conditions de couleur, liens vers feuille | spécialisé-BI |
| Table (Straight table) | Tableau de données détaillées, pagination, totaux, mini-graphes | viz |
| Table pivot (Pivot table) | Dimensions/mesures en lignes et colonnes, regroupement/expansion | spécialisé-BI |
| Texte et image (Text & Image) | Texte riche, images, mesures inline, liens web | générique |
| Panneau de filtres (Filter pane) | Plusieurs dimensions en listes pour filtrer les autres viz | spécialisé-BI |
| NL Insights | Insights en langage naturel générés sur les données | spécialisé-BI |

### 1.2 Objets de tableau de bord (chart picker, non-data)

| Élément | Description courte | Type |
| --- | --- | --- |
| Bouton (Button) | Action(s) + navigation (sélections, signets, variables, feuilles, liens) | générique |
| Conteneur à onglets (Tab/container natif) | Affiche/masque des viz selon conditions, onglets pour économiser l'espace | générique |
| Menu de navigation (Navigation menu) | Navigation entre feuilles intégrée à la feuille | générique |
| Ligne (Line — natif) | Lignes décoratives verticales/horizontales de séparation | générique |
| Conteneur de mise en page (Layout container — natif) | Superposition/positionnement libre de viz | générique |
| Saisie de variable (Variable input — natif) | Curseur/champ/boutons pour piloter une variable | spécialisé-BI |
| Date picker (natif) | Sélection d'une date ou d'une plage depuis un calendrier | générique |

### 1.3 Visualization bundle (extensions livrées, actives)

| Élément | Description courte | Type |
| --- | --- | --- |
| Entonnoir (Funnel chart) | Étapes connectées d'un processus linéaire | viz |
| Grille (Grid chart) | Données comparatives, valeurs représentées par des couleurs (heatmap-like) | viz |
| Graphique de réseau (Network chart) | Diagramme de clusters (nœuds/arêtes), type réseau | viz |
| Organigramme (Org chart) | Arbre organisationnel à structure hiérarchique | viz |
| P&L pivot | Table pivot stylable pour reporting profits & pertes | spécialisé-BI |
| Pivot table (bundle) | Table pivot avec options de style absentes du pivot natif | spécialisé-BI |
| Radar (Radar chart) | Graphe 2D à axes radiaux, scoring d'une mesure | viz |
| Sankey | Diagramme de flux mettant en évidence transferts majeurs | viz |
| Conteneur en treillis (Trellis container) | Petits multiples à partir d'une visualisation maître | viz |
| Cascade de variance (Variance waterfall) | Variance entre deux mesures sur les valeurs d'une dimension | viz |
| Nuage de mots (Word cloud) | Mots dimensionnés selon une valeur de mesure | viz |

### 1.4 Dashboard bundle (contrôles livrés, actifs)

| Élément | Description courte | Type |
| --- | --- | --- |
| Animator | Anime les changements de valeurs d'une viz sur une plage (ex. temps) | spécialisé-BI |
| Date range picker | Sélection d'une date unique ou d'une plage depuis un calendrier | générique |
| Layout container (bundle) | Ajout/agencement de viz dans un conteneur de mise en page | générique |
| Line (bundle) | Lignes verticales/horizontales ajoutées à une feuille | générique |
| On-Demand reporting button | Bouton générant un rapport NPrinting selon les sélections (hors SaaS) | spécialisé-BI |
| Text (bundle) | Objet texte riche éditable et formatable | générique |
| Variable input control | Définit la valeur d'une variable (curseur/bouton/saisie) | spécialisé-BI |
| Video player | Intègre une vidéo dans la feuille | générique |

### 1.5 Extensions dépréciées / héritage (signalées pour exhaustivité)

| Élément | Description courte | Type |
| --- | --- | --- |
| Multi KPI (déprécié) | Plusieurs KPI dans un même objet, mise en page riche | spécialisé-BI |
| Heatmap (bundle, déprécié) | Carte de chaleur à deux dimensions colorée par mesure | viz |
| Bar & area chart (bundle, déprécié) | Barres/aires combinées de l'ancien bundle | viz |
| Bullet chart (bundle, déprécié) | Variante bullet de l'ancien bundle (remplacé par natif) | viz |
| Straight table (bundle, déprécié) | Table simple de l'ancien bundle | viz |
| Container / Tabbed / Show-hide (dashboard, dépréciés) | Conteneurs hérités remplacés par conteneurs natifs (retrait ~2027) | générique |
| Share button / Navigation button (dépréciés) | Boutons hérités remplacés par actions natives | générique |
| Qlik View — list box / multi box / table box (héritage) | Objets de sélection QlikView, équivalents au filter pane / table de Sense | spécialisé-BI |
| Extensions tierces (Qlik Branch / Open Source) | Viz custom déposées dans le hub (D3, etc.) via API d'extension | viz |

---

## 2. Interface d'authoring (panneau de propriétés & ressources)

### 2.1 Volet Données (Data)

| Élément | Description courte | Type |
| --- | --- | --- |
| Section Dimensions | Liste ordonnable des dimensions, libellé, lien master item | spécialisé-BI |
| Ajout de dimension | Depuis Champs/Master items ou via expression | spécialisé-BI |
| Dimension calculée | Dimension définie par une expression (ouvre l'éditeur d'expression) | spécialisé-BI |
| Dimension cyclique / drill-down | Groupe de dimensions navigable (forage hiérarchique) | spécialisé-BI |
| Section Mesures | Liste ordonnable des mesures, expression d'agrégation, libellé | spécialisé-BI |
| Champ Expression (mesure) | Ouvre l'éditeur d'expression, expression affichée par défaut | spécialisé-BI |
| Formatage des nombres | Auto / nombre / monnaie / date / durée / personnalisé | générique |
| Limitation de dimension | Top N / valeurs exactes / valeurs relatives, affichage des autres | spécialisé-BI |
| Lier / délier master item | Édition impossible tant qu'un item est lié à un master (champ Dimension/Mesure) | spécialisé-BI |
| Données additionnelles | Lignes alternatives, valeurs nulles, gestion des dimensions vides | spécialisé-BI |

### 2.2 Volet Tri (Sorting)

| Élément | Description courte | Type |
| --- | --- | --- |
| Ordre de priorité de tri | Glisser-déposer des dimensions/mesures (numéros de priorité) | générique |
| Tri interne | Auto / numérique / alphabétique / par expression / par ordre de chargement | spécialisé-BI |
| Sens croissant/décroissant | Bascule par critère de tri | générique |

### 2.3 Volet Apparence (Appearance)

| Élément | Description courte | Type |
| --- | --- | --- |
| Général | Titre/sous-titre/note de bas de page, afficher titres, détails (description) | générique |
| Présentation | Orientation, empilé/groupé, grille, valeurs, lignes de référence, barre de défilement | viz |
| Couleurs et légende | Couleur unique / par dimension / par mesure / par expression / par master ; auto vs custom | spécialisé-BI |
| Légende | Afficher/masquer, position, titre de légende | générique |
| Axe X (dimension) | Étiquettes et titre, continu vs discret, plage, échelle, graduations | viz |
| Axe Y (mesure) | Étiquettes et titre, position, échelle (linéaire/log), min/max, graduations | viz |
| Étiquettes de données (data labels) | Affichage des valeurs sur les points/barres, auto/activé/désactivé | viz |
| Info-bulle (tooltip) | Tooltip de base ou personnalisée (mesures, graphique miniature, image, masquer lignes) | spécialisé-BI |
| Lignes de référence | Lignes/bandes horizontales/verticales par valeur ou expression | viz |
| Style avancé (styling) | Polices, couleurs de fond, bordures, espacement (selon objet) | générique |

### 2.4 Bibliothèque & ressources (assets panel)

| Élément | Description courte | Type |
| --- | --- | --- |
| Volet Champs (Fields) | Liste des champs du modèle de données, glisser vers une viz | spécialisé-BI |
| Master items — Dimensions | Dimensions maîtres réutilisables (libellé, couleur, drill-down) | spécialisé-BI |
| Master items — Mesures | Mesures maîtres (expression, format, couleur, conditions) réutilisables | spécialisé-BI |
| Master items — Visualisations | Visualisations maîtres réutilisables (base du trellis, copie sur feuilles) | spécialisé-BI |
| Volet Graphiques (Charts) | Sélecteur de types de graphiques (natifs + bundles + custom) | générique |
| Objets personnalisés (Custom objects) | Extensions installées (visualization/dashboard bundle, tierces) | spécialisé-BI |
| Éditeur d'expression | Constructeur d'expressions : champs, fonctions, agrégations, variables, set analysis | spécialisé-BI |
| Color by (sélecteur de couleur) | Source de couleur : unique / dimension / mesure / expression / par master item | spécialisé-BI |
| Variables | Volet de variables (valeur, expression) pilotant les expressions | spécialisé-BI |
| Recherche de ressources | Recherche dans champs/master items/feuilles | générique |
| Aperçu / prévisualisation de viz | Rendu en direct pendant l'édition (chart suggestions) | générique |

---

## 3. Tableau de bord & interactivité

### 3.1 Modèle associatif & sélections

| Élément | Description courte | Type |
| --- | --- | --- |
| État sélectionné (vert, ✓) | Valeurs activement sélectionnées incluses dans l'analyse | spécialisé-BI |
| État possible (blanc) | Valeurs associées encore disponibles après les sélections courantes | spécialisé-BI |
| État alternatif (gris clair) | Valeurs de la même dimension non sélectionnées (sélectionnables) | spécialisé-BI |
| État exclu (gris foncé) | Valeurs incompatibles avec les sélections courantes | spécialisé-BI |
| Sélectionné-exclu (gris foncé, ✓) | Valeur choisie devenue incompatible suite à d'autres sélections | spécialisé-BI |
| Barre de sélections (selections bar) | Bandeau au-dessus des feuilles listant tous les filtres actifs | spécialisé-BI |
| Pas en avant/arrière + reset | Historique de sélection (step back/forward, effacer tout) | spécialisé-BI |
| Outil de sélection (Selections tool) | Vue d'ensemble de tous les champs et de leur état pour sélectionner | spécialisé-BI |
| État de sélection global | Une sélection dans une viz met à jour toutes les viz/feuilles | spécialisé-BI |
| Sélection au lasso / par plage | Sélection graphique (lasso, drag sur axe, plage) dans les viz | spécialisé-BI |
| Recherche associative | Recherche textuelle dans un champ révélant valeurs associées/exclues | spécialisé-BI |
| Smart Search | Recherche globale en langage naturel sur tous les champs de l'app | spécialisé-BI |
| Menu contextuel de sélection | Confirmer/annuler, sélectionner possibles/exclus/alternatifs | spécialisé-BI |
| Indicateur d'état de données | Glyphe montrant données associées vs hors filtre | spécialisé-BI |

### 3.2 Feuilles, mise en page, conteneurs

| Élément | Description courte | Type |
| --- | --- | --- |
| Feuille (Sheet) | Page d'analyse contenant des viz, grille de mise en page | générique |
| Grille de mise en page (snap grid) | Aimantation/redimensionnement des objets, espacement | générique |
| Conteneur (Container) | Onglets empilant plusieurs viz dans un même cadre | générique |
| Layout container | Positionnement libre / superposition d'objets | générique |
| Titres et navigation de feuille | En-tête de feuille, vignettes, ordre, feuilles publiques/privées/communautaires | générique |
| Responsive / petits écrans | Réagencement automatique, vue mobile, viz masquées sous un seuil de taille | générique |
| Mode édition vs analyse | Bascule entre construction de feuille et consommation | générique |
| Bouton de plein écran / agrandir | Agrandir une viz, mode exploration | générique |

### 3.3 Actions, signets, narration, génération

| Élément | Description courte | Type |
| --- | --- | --- |
| Bouton + actions | Appliquer/effacer sélections, set variable, signet, naviguer, lien, recharger | spécialisé-BI |
| Signets (Bookmarks) | Sauvegarde nommée d'un état de sélection, partageable | spécialisé-BI |
| Volet de signets | Liste/recherche/application de signets | spécialisé-BI |
| Narration / Data storytelling | Récit en diapositives à partir de captures et de feuilles live | spécialisé-BI |
| Snapshots | Captures datées d'une viz, avec effets d'emphase | spécialisé-BI |
| Slides / timeline | Diapositives (snapshots, texte, formes, images, feuille live) en chronologie | spécialisé-BI |
| Effets et styles de récit | Emphase visuelle, formes, texte, styles sur les snapshots | générique |
| Insight Advisor (recherche) | Génération auto de graphes via recherche en langage naturel + business logic | spécialisé-BI |
| Insight Advisor — types d'analyse | Le moteur cognitif choisit le meilleur type d'analyse/viz selon les données | spécialisé-BI |
| Chart suggestions | Suggestion auto de dimensions/mesures/type en sélectionnant des champs | spécialisé-BI |
| Insight Advisor Chat | Assistant conversationnel de BI (questions en langage naturel) | spécialisé-BI |
| Feuille Insights / Manager dashboard | Feuilles générées automatiquement à partir des insights | spécialisé-BI |

### 3.4 Filtres & contrôles d'interaction

| Élément | Description courte | Type |
| --- | --- | --- |
| Panneau de filtres (Filter pane) | Plusieurs listes de dimensions regroupées pour filtrer | spécialisé-BI |
| Liste (list box) | Liste de valeurs d'une dimension avec état coloré et recherche | spécialisé-BI |
| Date range picker | Sélection de date/plage par calendrier | générique |
| Variable input | Contrôle (curseur/boutons/champ) pilotant une variable | spécialisé-BI |
| Animator | Lecture animée des changements sur une plage de valeurs | spécialisé-BI |
| Forage (drill-down) | Navigation hiérarchique via dimension de forage | spécialisé-BI |
| Menu contextuel de viz | Explorer, plein écran, copier le lien, ajouter à un récit, télécharger | générique |

---

## Spécificités Qlik

- **Moteur associatif (QIX)** : tout repose sur l'associativité — chaque sélection propage instantanément les états (vert/blanc/gris) à toutes les viz et feuilles, sans jointures prédéfinies façon requête. Le code couleur (sélectionné/possible/exclu/alternatif) est l'ADN visuel à reproduire ; il pénètre listes, tables, filtres, et les états de survol/sélection des graphiques.
- **États alternatifs (alternate states)** : plusieurs jeux de sélections indépendants coexistent dans une même app, permettant des analyses comparatives (ex. comparer deux périodes côte à côte) ; chaque objet peut être affecté à un état.
- **Set analysis** : syntaxe d'expression définissant un sous-ensemble de données indépendant des sélections courantes ; cœur des mesures avancées (ex. comparaisons année/année), édité via l'éditeur d'expression.
- **Master items** : dimensions, mesures et visualisations maîtres centralisées et réutilisables, porteuses de couleur, format, drill-down et conditions ; fondement de la gouvernance et du trellis.
- **Insight Advisor & business logic** : couche cognitive générant automatiquement des graphes « best practice » à partir d'une recherche en langage naturel et d'un modèle logique (business logic), avec chat conversationnel et feuilles auto-générées.
- **Distinction visuelle clé pour le DS** : les états de sélection colorés, l'info-bulle enrichie (mini-graphe), les master items, la barre de sélections et le storytelling sont **spécialisés-BI** et n'ont pas d'équivalent dans un DS générique ; les boutons, conteneurs, date pickers, texte/image et la grille de mise en page sont **génériques** et réutilisables tels quels.

---

### Sources
- [Visualizations — Qlik Sense November 2025](https://help.qlik.com/en-US/sense/November2025/Subsystems/Hub/Content/Sense_Hub/Visualizations/creating-visualization.htm)
- [Visualization bundle](https://help.qlik.com/en-US/sense/November2025/Subsystems/Hub/Content/Sense_Hub/Visualizations/VisualizationBundle/visualization-bundle.htm)
- [Dashboard bundle](https://help.qlik.com/en-US/sense/November2025/Subsystems/Hub/Content/Sense_Hub/Visualizations/DashboardBundle/dashboard-bundle.htm)
- [Selection states](https://help.qlik.com/en-US/cloud-services/Subsystems/Hub/Content/Sense_Hub/Selections/selection-states.htm)
- [Properties panel](https://help.qlik.com/en-US/sense/November2021/Subsystems/Hub/Content/Sense_Hub/Properties/properties-panel.htm)
- [Data storytelling](https://help.qlik.com/en-US/sense/November2025/Subsystems/Hub/Content/Sense_Hub/StoryTelling/use-data-storytelling.htm)
- [Insight Advisor analysis types](https://help.qlik.com/en-US/cloud-services/Subsystems/Hub/Content/Sense_Hub/Insights/insight-analysis-types.htm)
- [Insight Advisor & business logic](https://help.qlik.com/en-US/sense/November2025/Subsystems/Hub/Content/Sense_Hub/BusinessLogic/Tutorial/tutorial-what-is-insight-advisor.htm)
