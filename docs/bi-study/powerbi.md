# Étude BI — Surface graphique de Power BI (Desktop + Service)

> Objectif : inventaire EXHAUSTIF de la surface graphique de Power BI pour évaluer les composants de design system nécessaires à une reproduction à 100 %.
> Source : connaissance + Microsoft Learn (overview des visuels, cartes, volet Analyses, volet Format, signets/sélection, sync slicers) — vérifié juin 2026.
>
> **Type** : `générique` (composant UI réutilisable hors-BI) · `viz` (graphique/visualisation de données) · `spécialisé-BI` (propre au domaine décisionnel).

---

## 1. Types de visualisations

### Comparaison & tendances

| Élément | Description courte | Type |
|---|---|---|
| Histogramme empilé (Stacked column) | Colonnes verticales segmentées par catégorie | viz |
| Histogramme groupé (Clustered column) | Colonnes côte à côte par catégorie | viz |
| Histogramme 100 % empilé (100% stacked column) | Colonnes normalisées à 100 % | viz |
| Barres empilées (Stacked bar) | Barres horizontales segmentées | viz |
| Barres groupées (Clustered bar) | Barres horizontales côte à côte | viz |
| Barres 100 % empilées (100% stacked bar) | Barres horizontales normalisées | viz |
| Courbe (Line chart) | Tendance de valeurs continues dans le temps | viz |
| Aire (Area chart) | Courbe avec zone remplie sous la ligne | viz |
| Aire empilée (Stacked area chart) | Aires cumulées superposées | viz |
| Combiné colonne empilée + courbe (Line and stacked column) | Double axe Y, colonnes + ligne | viz |
| Combiné colonne groupée + courbe (Line and clustered column) | Double axe Y, colonnes groupées + ligne | viz |
| Graphique en ruban (Ribbon chart) | Classement par période, rang le plus haut en tête | viz |
| Graphique en cascade (Waterfall chart) | Total courant additions/soustractions, ventilation | viz |

### Relations parties/tout

| Élément | Description courte | Type |
|---|---|---|
| Secteurs (Pie chart) | Camembert parts d'un tout | viz |
| Anneau (Donut chart) | Camembert à centre vide (label/icône central) | viz |
| Treemap | Rectangles imbriqués hiérarchiques dimensionnés par valeur | viz |
| Entonnoir (Funnel chart) | Étapes séquentielles d'un processus (pipeline, conversion) | viz |

### Distribution & corrélations

| Élément | Description courte | Type |
|---|---|---|
| Nuage de points (Scatter chart) | Points à l'intersection de deux valeurs numériques | viz |
| Bulles (Bubble chart) | Nuage avec 3e dimension = taille de bulle | viz |
| Nuage de points animé (Play axis) | Axe de lecture temporel animant les points | viz |
| Tracé en points / dot plot | Valeurs catégorielles sur l'axe X | viz |

### Tables & matrices

| Élément | Description courte | Type |
|---|---|---|
| Table (Table) | Grille lignes/colonnes, valeurs exactes | générique |
| Matrice (Matrix) | Table croisée avec agrégation, drill et mises en page échelonnées | spécialisé-BI |

### Cartes géographiques

| Élément | Description courte | Type |
|---|---|---|
| Carte de base / bulles (Bing Map) | Points/bulles géocodés via Bing (déprécation planifiée) | viz |
| Carte choroplèthe (Filled map / Bing) | Régions colorées par intensité de valeur | viz |
| Azure Maps | Visuel cartographique entreprise (bulles, colonnes 3D, heatmap, filled, marqueurs, tracés, couches de référence, clustering) | viz |
| ArcGIS for Power BI (Esri) | Analyse spatiale avancée, thèmes intelligents, infographies, isochrones | spécialisé-BI |
| Carte de formes (Shape map, preview) | Régions par couleur via TopoJSON (cartogramme, plans personnalisés) | viz |

### Cartes (cards), KPI, jauges

| Élément | Description courte | Type |
|---|---|---|
| Carte / Card (single) | Valeur unique mise en avant (total, part) | générique |
| Carte à plusieurs lignes (Multi-row card) | Plusieurs faits empilés sur une carte | générique |
| Nouvelle carte (New card, multi-card + images) | Carte multi-cellules avec images et valeurs de référence | spécialisé-BI |
| KPI | Progression vers un objectif mesurable + tendance | spécialisé-BI |
| Jauge radiale (Radial gauge) | Aiguille/cible + plage de progression d'une mesure | viz |
| Objectifs (Goals / scorecards / metrics) | Tableau de bord d'objectifs, cibles, statut coloré | spécialisé-BI |

### Visuels pilotés par IA

| Élément | Description courte | Type |
|---|---|---|
| Arbre de décomposition (Decomposition tree) | Ventilation multidimensionnelle drill ad hoc + IA (high/low) | spécialisé-BI |
| Influenceurs clés (Key influencers) | Facteurs contribuant à un résultat sélectionné | spécialisé-BI |
| Récit intelligent (Smart narrative) | Texte généré décrivant tendances et points saillants | spécialisé-BI |
| Détection d'anomalies (Anomaly detection) | Repère pics/creux inattendus sur courbe | spécialisé-BI |
| Visuel Q&A (Q&A visual) | Question en langage naturel → visuel auto (déprécation déc. 2026) | spécialisé-BI |

### Filtrage sur canevas

| Élément | Description courte | Type |
|---|---|---|
| Segment liste (Slicer list) | Liste de cases à cocher de valeurs | générique |
| Segment menu déroulant (Slicer dropdown) | Sélecteur déroulant compact | générique |
| Segment boutons / tuiles (Slicer button/tile) | Valeurs en boutons cliquables | générique |
| Segment curseur numérique (Numeric range slider) | Plage min/max par poignées | générique |
| Segment date / plage de dates (Date range slicer) | Curseur ou champs entre/avant/après dates | générique |
| Segment relatif date/heure (Relative date/time slicer) | « N derniers jours/mois… » glissant | spécialisé-BI |
| Segment hiérarchique (Hierarchy slicer) | Segment multi-niveaux dépliable | spécialisé-BI |

### Autres visuels & éléments de canevas

| Élément | Description courte | Type |
|---|---|---|
| Image (Image visual) | Image statique ou dynamique pilotée par données | générique |
| Zone de texte (Text box) | Texte riche, titres, valeurs liées aux données | générique |
| Formes (Shapes) | Rectangle, ovale, ligne, flèche pour structurer | générique |
| Bouton (Button) | Déclenche action (navigation, signet, URL, drill-through, back) | générique |
| Navigateur de pages (Page navigator) | Onglets de navigation auto entre pages | générique |
| Navigateur de signets (Bookmark navigator) | Boutons auto pour parcourir les signets | spécialisé-BI |
| Visuel de rapport paginé (Paginated report visual) | Rapport pixel-perfect imprimable embarqué | spécialisé-BI |
| Visuel R (R visual) | Graphique généré par script R | spécialisé-BI |
| Visuel Python (Python visual) | Graphique généré par script Python | spécialisé-BI |
| Visuel Power Apps | Application Power Apps embarquée (write-back) | spécialisé-BI |

### Visuels personnalisés / AppSource

| Élément | Description courte | Type |
|---|---|---|
| Visuels personnalisés (Custom visuals .pbiviz) | Visuels tiers ou maison importés | spécialisé-BI |
| Marketplace AppSource | Galerie d'import de visuels (organisationnels/certifiés) | générique |
| Visuels en préversion (Preview visuals) | Visuels marqués « (Preview) », activés via options | spécialisé-BI |

---

## 2. Interface d'authoring

### Volet Visualisations — sélecteur & puits de champs

| Élément | Description courte | Type |
|---|---|---|
| Galerie d'icônes de visuels | Grille des types de visuels (par défaut + importés) | générique |
| Personnalisation du volet | Ajout/retrait d'icônes, restauration par défaut | générique |
| Puits Axe (Axis / X / Catégorie) | Champ de catégorie de l'axe | spécialisé-BI |
| Puits Légende (Legend) | Champ de série/découpage couleur | spécialisé-BI |
| Puits Valeurs (Values) | Mesures/colonnes agrégées affichées | spécialisé-BI |
| Puits Info-bulles (Tooltips) | Champs supplémentaires au survol | spécialisé-BI |
| Puits Petits multiples (Small multiples) | Champ découpant le visuel en grille (trellis) | spécialisé-BI |
| Puits Détails / Taille / Lecture (scatter) | Détails, taille de bulle, axe de lecture | spécialisé-BI |
| Puits Lignes/Colonnes/Valeurs (matrice) | Hiérarchies d'en-têtes de la matrice | spécialisé-BI |
| Glisser-déposer de champ dans un puits | Affectation champ → rôle visuel | générique |
| Calculs visuels (Visual calculations) | DAX défini sur le visuel (running total, % du total…) | spécialisé-BI |
| Personnalisation visuelle par l'utilisateur (Personalize visual) | Le lecteur modifie le visuel (perspective) | spécialisé-BI |

### Volet Champs (Data / Fields)

| Élément | Description courte | Type |
|---|---|---|
| Arborescence des tables | Liste des tables du modèle sémantique | spécialisé-BI |
| Colonnes (Columns) | Champs de données, icônes par type | spécialisé-BI |
| Mesures (Measures) | Champs calculés DAX (icône calculatrice) | spécialisé-BI |
| Hiérarchies (Hierarchies) | Niveaux empilés drillables | spécialisé-BI |
| Groupes / casiers (Groups & bins) | Regroupements et tranches de valeurs | spécialisé-BI |
| Recherche de champ | Barre de recherche dans le volet | générique |
| Cases à cocher d'ajout au visuel | Coche → ajout au puits par défaut | générique |

### Volet Filtres (Filters)

| Élément | Description courte | Type |
|---|---|---|
| Filtres au niveau visuel (Visual-level) | Portée limitée à un visuel | spécialisé-BI |
| Filtres au niveau page (Page-level) | Portée toute la page | spécialisé-BI |
| Filtres au niveau rapport (Report-level) | Portée tout le rapport | spécialisé-BI |
| Filtres au niveau d'exploration (Drillthrough) | Champs passés à la page cible | spécialisé-BI |
| Filtrage de base (Basic filtering) | Cases à cocher de valeurs | générique |
| Filtrage avancé (Advanced filtering) | Conditions (contient, est, > <, et/ou) | générique |
| Filtre Top N | N premières/dernières valeurs par mesure | spécialisé-BI |
| Filtre de date relative (Relative date) | Fenêtre glissante de dates | spécialisé-BI |
| Filtre d'heure relative (Relative time) | Fenêtre glissante d'heures | spécialisé-BI |
| Verrouillage / masquage de filtre | Lock & hide d'une carte de filtre | générique |
| Mise en forme du volet Filtres | Couleurs, thème, état développé/réduit | générique |

### Volet Format — catégories Général

| Élément | Description courte | Type |
|---|---|---|
| Onglets Visual / General | Bascule réglages spécifiques vs container | générique |
| Recherche de réglage | Barre filtrant les cartes de format | générique |
| Propriétés (Taille, position, X/Y, largeur/hauteur) | Géométrie du conteneur | générique |
| Effet : Arrière-plan (Background) | Couleur/transparence du fond | générique |
| Effet : Bordure (Border) | Couleur, rayon, épaisseur | générique |
| Effet : Ombre (Shadow) | Ombre portée du conteneur | générique |
| Effet : Verre / Glow (Visual glow, preview) | Halo/effet de verre du conteneur | générique |
| En-tête de visuel (Header icons) | Icônes survol (focus, filtres, options) | générique |
| Info-bulles (Tooltips, type & page) | Par défaut ou page de rapport | spécialisé-BI |
| Texte de remplacement (Alt text) | Accessibilité lecteur d'écran | générique |
| Titre / sous-titre / séparateur | Texte d'en-tête du visuel | générique |

### Volet Format — catégories Visual (spécifiques)

| Élément | Description courte | Type |
|---|---|---|
| Axe X / Axe Y (Axes) | Échelle, type, plage, titre, unités | viz |
| Axe Y secondaire | Second axe des combos | viz |
| Quadrillage (Gridlines) | Lignes de repère horizontales/verticales | viz |
| Étiquettes de données (Data labels) | Valeurs sur points/barres, position, unités | viz |
| Étiquettes de total (Total labels) | Totaux des séries empilées | viz |
| Étiquettes détaillées (Detail labels) | Catégorie+valeur+% (camembert/anneau) | viz |
| Légende (Legend) | Position, titre, style des séries | viz |
| Couleurs des données / par série | Palette des barres, lignes, secteurs | viz |
| Couleurs par catégorie / Series colors | Override couleur par valeur | viz |
| Marqueurs (Markers) | Points sur les courbes, forme/taille | viz |
| Forme de la ligne (Line: stepped/smooth) | Lissage/escalier des courbes | viz |
| Plot area / zone de tracé | Image ou couleur de fond du tracé | viz |
| Rayon intérieur (Donut inner radius) | Trou de l'anneau | viz |
| Style/grille de table & matrice | Style prédéfini, bordures de grille, espacement | générique |
| Mise en forme conditionnelle | Couleur fond/police, barres de données, icônes, URL web | spécialisé-BI |
| Sparklines (table/matrice) | Mini-courbes dans les cellules | viz |
| En-têtes de colonnes / sous-totaux / totaux | Affichage et style des agrégats | spécialisé-BI |
| Curseur de zoom (Zoom slider) | Zoom interactif sur axe cartésien | viz |
| Petits multiples (réglages grille) | Lignes/colonnes, bordures, titres de panneaux | viz |

### Volet Analyses (Analytics)

| Élément | Description courte | Type |
|---|---|---|
| Ligne constante X / Y (Constant line) | Valeur fixe de référence | viz |
| Ligne min (Min line) | Plus basse valeur | viz |
| Ligne max (Max line) | Plus haute valeur | viz |
| Ligne moyenne (Average line) | Moyenne des données | viz |
| Ligne médiane (Median line) | Valeur médiane | viz |
| Ligne de percentile (Percentile line) | Seuil au percentile X | viz |
| Ligne de tendance (Trend line) | Régression de la série temporelle | viz |
| Ombrage de symétrie (Symmetry shading) | Zone d'égalité X=Y (scatter) | viz |
| Prévision (Forecast) | Extrapolation + intervalle de confiance | spécialisé-BI |
| Barres d'erreur (Error bars) | Variabilité/incertitude (absolu/relatif) | viz |
| Ratio line (rapport) | Ligne de ratio dynamique | viz |

### Thème, signets, navigation, outils

| Élément | Description courte | Type |
|---|---|---|
| Thème de rapport (Report theme) | Couleurs/polices/fonds globaux, import/export JSON | générique |
| Galerie de thèmes intégrés | Thèmes prédéfinis sélectionnables | générique |
| Personnalisation de thème (dialog) | Éditeur couleurs/texte/visuels/pages/filtres | générique |
| Volet Sélection (Selection pane) | Liste des objets, visibilité, ordre de plan, calques | générique |
| Ordre des onglets / regroupement | Tab order, groupes d'objets | générique |
| Volet Signets (Bookmarks pane) | Capture d'états (données, affichage, page courante) | spécialisé-BI |
| Diaporama de signets (Bookmark view) | Lecture séquentielle des signets | générique |
| Volet Sync slicers | Synchronisation des segments entre pages | spécialisé-BI |
| Reproduire la mise en forme (Format painter) | Copie de mise en forme entre visuels | générique |
| Volet Commentaires / Sticky notes | Annotations sur le canevas | générique |
| Volet Performance Analyzer | Mesure du temps de rendu (Desktop) | spécialisé-BI |
| Quadrillage & magnétisme (Gridlines/Snap) | Grille de canevas + alignement | générique |
| Outils d'alignement / distribution | Aligner, répartir, espacer les objets | générique |
| Volet d'affichage (View) | Taille de page, ajustement, marges | générique |

---

## 3. Dashboard & interactivité

### Pages de rapport vs tableau de bord (service)

| Élément | Description courte | Type |
|---|---|---|
| Pages de rapport (Report pages) | Onglets multi-pages d'un rapport | générique |
| Tableau de bord du service (Dashboard) | Toile d'épinglage cross-rapports (service) | spécialisé-BI |
| Vignettes épinglées (Tiles) | Visuels/pages épinglés sur le dashboard | spécialisé-BI |
| Vignette d'image/texte/web/vidéo | Contenu statique épinglé | générique |
| Vignette en temps réel (streaming tile) | Données live push/streaming | spécialisé-BI |
| Plein écran / mode focus (Focus mode) | Agrandissement d'un visuel/vignette | générique |
| Spotlight | Mise en avant d'un visuel, reste grisé | générique |

### Interactions entre visuels

| Élément | Description courte | Type |
|---|---|---|
| Filtrer (cross-filter) | Sélection filtre les autres visuels | spécialisé-BI |
| Mettre en évidence (cross-highlight) | Sélection surligne dans les autres visuels | spécialisé-BI |
| Aucune (no interaction) | Visuel non affecté par les sélections | spécialisé-BI |
| Éditeur d'interactions (Edit interactions) | Définit le mode par paire de visuels | spécialisé-BI |

### Drill & exploration

| Élément | Description courte | Type |
|---|---|---|
| Drill down / drill up | Descente/remontée dans une hiérarchie | spécialisé-BI |
| Drill suivant niveau (Expand) | Développe tous les enfants | spécialisé-BI |
| Aller au niveau suivant (Go to next level) | Saut au niveau hiérarchique suivant | spécialisé-BI |
| Exploration (Drill through) | Saut vers page de détail filtrée | spécialisé-BI |
| Bouton Précédent (Back button) | Retour depuis la page d'exploration | générique |
| Voir les enregistrements (See records / Show data) | Détail des lignes derrière un point | spécialisé-BI |
| Explorer (Explore this data) | Exploration ad hoc d'un visuel | spécialisé-BI |

### Segments & slicers (interactivité)

| Élément | Description courte | Type |
|---|---|---|
| Segment liste / menu / curseur / date / hiérarchie | Voir §1 — contrôles de filtrage sur canevas | générique |
| Synchronisation de segments (Sync) | Même sélection propagée multi-pages | spécialisé-BI |
| Sélection unique / multiple / tout sélectionner | Modes de sélection du segment | générique |
| Recherche dans le segment | Barre de recherche de valeurs | générique |
| Effacer les sélections (Clear) | Réinitialisation du segment | générique |

### Info-bulles & narration

| Élément | Description courte | Type |
|---|---|---|
| Info-bulle par défaut (Default tooltip) | Valeurs du point au survol | viz |
| Info-bulle de page de rapport (Report page tooltip) | Page entière affichée au survol | spécialisé-BI |
| Info-bulle modale / drill | Carte de détail enrichie | spécialisé-BI |

### Service : partage, alertes, abonnements

| Élément | Description courte | Type |
|---|---|---|
| Favoris (Favorites) | Marquer rapports/dashboards favoris | générique |
| Abonnements (Subscriptions) | Envoi d'instantanés par e-mail planifiés | spécialisé-BI |
| Alertes de données (Data alerts) | Notification au franchissement de seuil (cards/KPI/jauges) | spécialisé-BI |
| Métriques / scorecards | Suivi d'objectifs partagés (Goals hub) | spécialisé-BI |
| Q&A (service) | Question langage naturel sur dataset | spécialisé-BI |
| Insights rapides / Get insights | Analyses auto générées | spécialisé-BI |
| Commentaires & @mentions | Fil de discussion sur visuel/page | générique |
| Partage / permissions / apps | Diffusion de contenus | générique |

### Mise en page & disposition

| Élément | Description courte | Type |
|---|---|---|
| Mise en page mobile (Mobile layout) | Vue téléphone dédiée, grille d'objets | générique |
| Mise en page mobile dashboard | Réagencement vignettes pour mobile | spécialisé-BI |
| Quadrillage & magnétisme | Snap-to-grid du canevas | générique |
| Alignement / distribution / ordre de plan | Aligner, répartir, avancer/reculer | générique |
| Verrouillage des objets (Lock objects) | Empêche le déplacement | générique |
| Taille/format de page (Page settings) | 16:9, 4:3, personnalisé, hauteur dynamique | générique |
| Pages masquées / info-bulle / drill | Statut de page non navigable | spécialisé-BI |
| Arrière-plan de page / fond (Wallpaper) | Image/couleur hors-canevas | générique |

---

## Spécificités Power BI

| Spécificité | Pourquoi c'est propre à Power BI |
|---|---|
| **Modèle sémantique piloté par DAX** | Mesures, colonnes calculées, groupes de calcul ; toute valeur de visuel découle d'un moteur tabulaire — pas un simple jeu de données plat. |
| **Calculs visuels (Visual calculations)** | DAX exécuté dans le contexte de lignes/colonnes du visuel (running total, moving average, % du total, rang) sans toucher le modèle. |
| **Mise en forme conditionnelle data-driven** | Fond, police, barres de données, icônes, URL pilotés par règles/échelles/valeurs de champ dans tables, matrices et propriétés de visuels. |
| **Sync slicers** | Propagation de l'état d'un segment entre pages via volet dédié et groupes de synchronisation. |
| **Signets + Sélection + Navigateurs** | Capture d'états (données/affichage/page), composables en boutons, navigateurs et diaporamas — base de l'UX « application » sans code. |
| **Interactions cross-filter / cross-highlight / aucune** | Modèle d'interaction par paire de visuels propre au BI, éditable visuel par visuel. |
| **Drill down/up + Drill through + See records** | Navigation hiérarchique et vers pages de détail filtrées par contexte. |
| **Info-bulles de page de rapport** | Une page entière sert d'info-bulle riche au survol d'un point. |
| **Petits multiples (trellis)** | Découpage automatique d'un visuel en grille par champ. |
| **Visuels IA** | Decomposition tree (drill IA), Key influencers, Smart narrative, Anomaly detection, Q&A langage naturel — analytique augmentée intégrée. |
| **Volet Analyses** | Lignes de référence statistiques + prévision (lissage exponentiel) + barres d'erreur ajoutées sans code. |
| **Thèmes JSON** | Thème de rapport importable/exportable en JSON, gouvernance de marque à l'échelle org. |
| **Service vs Desktop** | Dashboards (épinglage cross-rapports), vignettes streaming, abonnements, alertes de données, métriques/scorecards, favoris — surface distincte du canevas de rapport. |
| **Écosystème de visuels personnalisés** | API .pbiviz + AppSource (certifiés/organisationnels) + visuels R/Python/Power Apps — surface graphique extensible quasi illimitée. |
| **Translytical task flows / write-back** | Actions déclenchées depuis le rapport mettant à jour les données (au-delà de la lecture). |

---

### Sources

- [Overview of visualizations in Power BI — Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualizations-overview)
- [Overview of Map Visualizations in Power BI — Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-map-visualizations-overview)
- [Use the Analytics pane in Power BI — Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-analytics-pane)
- [Customize the Visualizations Pane — Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-report-visualizations)
- [Introducing the New Format Pane — Power BI Blog](https://powerbi.microsoft.com/en-us/blog/introducing-the-new-format-pane-preview/)
- [Create report bookmarks / Selection pane — Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-bookmarks)
