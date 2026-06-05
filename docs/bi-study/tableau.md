# Tableau — Inventaire exhaustif de la surface graphique (focus authoring VizQL)

> Étude design system Sentropic. Objectif : recenser tout ce qu'il faudrait pour reproduire l'interface Tableau à 100 %.
> Type ∈ { **générique** = composant DS standard · **viz** = visualisation/graphe · **spécialisé-BI** = widget propre à la BI }.
> Sources : doc officielle help.tableau.com (Show Me, Marks, Shelves, Analytics Pane, Data Pane, Dashboards, Actions, Device Designer).

---

## 1. Types de visualisations

| Élément | Description courte | Type |
| --- | --- | --- |
| Barres (vertical) | Barres simples comparant une mesure par catégorie | viz |
| Barres horizontales | Barres orientées horizontalement | viz |
| Barres empilées (stacked) | Segments empilés par dimension dans une même barre | viz |
| Barres côte à côte | Barres juxtaposées par sous-catégorie | viz |
| Histogramme | Distribution d'une mesure par paliers (bins) | viz |
| Lignes (continu) | Tendance d'une mesure dans le temps | viz |
| Lignes (discret) | Lignes sur axe catégoriel discret | viz |
| Aires (area) | Lignes remplies, empilées et non chevauchantes | viz |
| Combinaison double axe (dual combo) | Barres + lignes sur deux axes synchronisés ou non | viz |
| Nuage de points (scatter) | Deux mesures croisées en X/Y | viz |
| Vue circulaire (circle view) | Cercles alignés par catégorie pour distribution | viz |
| Cercles côte à côte | Circle view ventilé par sous-catégorie | viz |
| Table de texte (cross-tab) | Tableau croisé de valeurs textuelles | viz |
| Table surlignée (highlight table) | Cross-tab avec fond coloré selon la mesure | viz |
| Carte de chaleur (heat map) | Carrés colorés/dimensionnés à l'intersection de 2 dimensions | viz |
| Carte de densité (density) | Heatmap continue de points superposés (KDE) | viz |
| Secteurs (pie) | Parts d'un tout en angles | viz |
| Anneau (donut) | Pie évidé (double axe) | viz |
| Arbre (treemap) | Rectangles imbriqués proportionnels | viz |
| Bulles groupées (packed bubbles) | Cercles tassés dimensionnés/colorés | viz |
| Carte de symboles (symbol map) | Points géographiques (cercles/formes) | viz |
| Carte remplie / choroplèthe (filled map) | Polygones géographiques colorés par ratio | viz |
| Carte à secteurs / bulles (map + pie) | Marques composites superposées sur carte | viz |
| Carte double-axe / en couches (dual-axis map) | Deux jeux géo superposés (rempli + points) | viz |
| Carte de chaleur géo (density map) | Densité de points sur fond cartographique | viz |
| Lignes de flux / chemins (path map) | Trajectoires reliant des points géo | viz |
| Boîte à moustaches (box plot) | Médiane, quartiles, min/max, valeurs aberrantes | viz |
| Diagramme de Gantt | Barres dont la longueur encode une durée continue | viz |
| Graphique à puces (bullet graph) | Mesure vs cible avec bandes de référence | viz |
| Jauge (gauge) | Cadran indicateur (construit, non natif Show Me) | viz |
| Cascade (waterfall) | Variations cumulées positives/négatives (Gantt) | viz |
| Entonnoir (funnel) | Étapes décroissantes d'un processus | viz |
| Pyramide des âges (diverging bars) | Barres divergentes autour d'un axe central | viz |
| Pareto | Barres + ligne cumulée (double axe) | viz |
| Sparkline | Mini-lignes multiples en petite trame | viz |
| Lignes en pente (slope chart) | Comparaison de deux instants par segments | viz |
| Bump chart | Évolution de classements dans le temps | viz |
| Lollipop chart | Tige + point combinant barre et cercle | viz |
| KPI / BAN (big number) | Texte de valeur unique mis en avant | viz |
| Polygone / forme personnalisée | Marque polygonale (données construites) | viz |
| Diagramme de Sankey | Flux pondérés (technique avancée, polygones) | viz |
| Radar / chart en araignée | Axes radiaux (construit manuellement) | viz |
| Hexbin | Agrégation par cellules hexagonales | viz |

---

## 2. Interface d'authoring VizQL

| Élément | Description courte | Type |
| --- | --- | --- |
| Étagère Colonnes | Zone de dépôt définissant les en-têtes/axes horizontaux | spécialisé-BI |
| Étagère Lignes | Zone de dépôt définissant les en-têtes/axes verticaux | spécialisé-BI |
| Pilule (pill) bleue/verte | Jeton de champ discret (bleu) / continu (vert) | spécialisé-BI |
| Menu contextuel de pilule | Agrégation, tri, format, calcul rapide, conversion D/C | menu |
| Carte Repères (Marks card) | Conteneur des propriétés visuelles des marques | spécialisé-BI |
| Sélecteur de type de marque | Liste : Automatique, Barre, Ligne, Aire, Carré, Cercle, Forme, Texte, Carte, Secteurs, Gantt, Polygone, Densité | liste |
| Propriété Couleur | Affecte une couleur (+ palette, opacité, bordure, halo) | spécialisé-BI |
| Propriété Taille | Module la taille des marques (slider + plage) | spécialisé-BI |
| Propriété Étiquette/Texte | Affiche du texte sur la marque (alignement, police) | spécialisé-BI |
| Propriété Détail | Éclate les marques par membres sans encoder | spécialisé-BI |
| Propriété Infobulle | Modèle d'infobulle au survol | spécialisé-BI |
| Propriété Forme | Assigne une forme par membre (palette de formes) | spécialisé-BI |
| Propriété Angle | Encode l'angle (secteurs/donut) | spécialisé-BI |
| Propriété Chemin | Ordre de tracé (lignes/polygones) | spécialisé-BI |
| Cartes Repères multiples | Une carte par mesure en double/multi-axe | spécialisé-BI |
| Volet Données | Panneau latéral listant champs/objets | générique |
| Section Dimensions | Champs qualitatifs (au-dessus de la ligne grise) | spécialisé-BI |
| Section Mesures | Champs quantitatifs agrégés | spécialisé-BI |
| Hiérarchies | Champs imbriqués (+/- pour explorer) | spécialisé-BI |
| Dossiers | Regroupement manuel de champs | générique |
| Champ calculé | Formule créée par l'utilisateur | spécialisé-BI |
| Éditeur de calcul | Boîte de formule + autocomplétion + liste de fonctions | générique |
| Paramètre | Valeur globale saisie/sélectionnée par l'utilisateur | spécialisé-BI |
| Contrôle de paramètre | Widget (liste/curseur/saisie) pilotant un paramètre | générique |
| Ensemble (set) | Sous-ensemble dynamique/constant de membres | spécialisé-BI |
| Action d'ensemble (set control) | Widget In/Out pilotant un set | spécialisé-BI |
| Groupe | Fusion de membres en sous-catégorie | spécialisé-BI |
| Bins (paliers) | Buckets numériques pour histogramme | spécialisé-BI |
| Champ géographique | Rôle géo (lat/long généré) | spécialisé-BI |
| Source de données / connexions | Bandeau onglets de sources de données | générique |
| Volet Pages | Décompose la vue en pages animables | spécialisé-BI |
| Contrôle de lecture Pages | Lecteur avant/arrière + vitesse + historique | spécialisé-BI |
| Étagère Filtres | Réceptacle des champs filtrants | spécialisé-BI |
| Boîte de dialogue Filtre | Onglets Général/Caractères génériques/Condition/Limite | générique |
| Filtre liste valeur unique | Boutons radio | générique |
| Filtre liste multi-valeurs | Cases à cocher (défaut) | générique |
| Filtre déroulant (single/multi) | Menu déroulant compact | menu |
| Filtre curseur valeur unique | Slider à une poignée | slider |
| Filtre plage de valeurs | Slider à deux poignées + min/max | slider |
| Filtre « au moins / au plus » | Slider à une borne | slider |
| Filtre Recherche / caractères génériques | Champ texte avec * | générique |
| Filtre date relative | Précédents N jours/mois/années, etc. | spécialisé-BI |
| Filtre plage de dates | Deux poignées de dates | spécialisé-BI |
| Filtre relatif à maintenant | Plage dynamique recalculée à l'ouverture | spécialisé-BI |
| Contrôle de filtre (carte) | Carte de filtre interactive sur la feuille | générique |
| Volet Analytique | Onglet de glisser-déposer des analyses | spécialisé-BI |
| Ligne de référence | Valeur/moyenne/médiane sur un axe | spécialisé-BI |
| Bande de référence | Zone ombrée entre deux valeurs | spécialisé-BI |
| Distribution de référence | Percentiles/écart-type/quantiles | spécialisé-BI |
| Boîte à moustaches (analytique) | Box plot ajouté via le volet | spécialisé-BI |
| Ligne constante | Valeur fixe sur un axe | spécialisé-BI |
| Ligne moyenne | Moyenne automatique | spécialisé-BI |
| Courbe de tendance | Linéaire/log/exponentielle/polynomiale | spécialisé-BI |
| Prévision (forecast) | Lissage exponentiel + intervalle de confiance | spécialisé-BI |
| Cluster (k-means) | Regroupement automatique des marques | spécialisé-BI |
| Totaux / sous-totaux | Grands totaux lignes/colonnes | spécialisé-BI |
| Barre d'outils | Annuler/refaire, tri, Show Me, présentation, etc. | générique |
| Bouton Show Me | Galerie de types de vues suggérés/grisés | spécialisé-BI |
| Onglets de feuilles | Navigation feuilles/tableaux de bord/récits | onglet |
| Pelliculage / pellicule de feuilles | Aperçus miniatures en bas | générique |
| Légende de couleur | Mappage valeur→couleur (édition palette) | spécialisé-BI |
| Légende de taille | Échelle des tailles | spécialisé-BI |
| Légende de forme | Mappage membre→forme | spécialisé-BI |
| Légende de carte (mesure) | Échelle de la carte choroplèthe | spécialisé-BI |
| Boîte de dialogue d'axe | Édition plage/échelle/log/inversé/ticks | générique |
| Double axe | Deux mesures superposées sur deux axes | spécialisé-BI |
| Synchroniser l'axe | Aligne les échelles des deux axes | spécialisé-BI |
| En-têtes d'axe / de colonne | Libellés cliquables (tri, masquer) | générique |
| Volet Format | Police, ombrage, alignement, lignes, bordures, séparateurs | générique |
| Format de nombre/date | Modèles d'affichage des valeurs | générique |
| Lignes de quadrillage / zéro / repère | Réglages de lignes de la vue | générique |
| Annotation (point/marque/zone) | Texte ancré à un point/marque/région | spécialisé-BI |
| Éditeur d'infobulle enrichie | Mise en forme + insertion de champs dynamiques | générique |
| Viz-in-tooltip | Mini-feuille intégrée dans l'infobulle | spécialisé-BI |
| Calcul de table (quick table calc) | % du total, différence, running, rank, etc. | spécialisé-BI |
| Tri (rapide / personnalisé) | Boutons et dialogue de tri | générique |
| Curseur Total/Niveau de détail | Réglage d'agrégation/granularité | spécialisé-BI |
| Carte Hauteur/Ajustement de vue | Standard / Ajuster largeur / hauteur / vue entière | générique |

---

## 3. Dashboard & interactivité

| Élément | Description courte | Type |
| --- | --- | --- |
| Volet Tableau de bord | Panneau d'assemblage (feuilles + objets) | générique |
| Liste des feuilles | Feuilles disponibles à glisser | générique |
| Conteneur horizontal | Dispose les objets côte à côte | générique |
| Conteneur vertical | Empile les objets verticalement | générique |
| Objet tuilé (tiled) | Placement en grille, sans chevauchement | générique |
| Objet flottant (floating) | Position/ taille libres, superposables | générique |
| Réglages de taille du dashboard | Fixe / plage / automatique | générique |
| Objet Texte | Bloc de texte/titre formaté | générique |
| Objet Image | Image avec ajustement, lien URL, alt-text | générique |
| Objet Page Web | Iframe d'une URL | générique |
| Objet Feuille (viz) | Insertion d'une feuille existante | viz |
| Bouton Navigation | Va vers feuille/dashboard/URL | bouton |
| Bouton Afficher/Masquer | Bascule la visibilité d'un objet/conteneur | bouton |
| Objet Extension | Composant tiers (sandbox/réseau) | spécialisé-BI |
| Objet Ask Data / Pulse (selon version) | Saisie en langage naturel | spécialisé-BI |
| Cadre / Blank | Espaceur vide | générique |
| Action de filtre | Sélection d'une marque filtre une autre feuille | spécialisé-BI |
| Action de surbrillance | Met en évidence les marques liées | spécialisé-BI |
| Action Aller à l'URL | Hyperlien dynamique avec champs | spécialisé-BI |
| Action de paramètre | Une sélection change un paramètre | spécialisé-BI |
| Action d'ensemble (set action) | Une sélection met à jour un set | spécialisé-BI |
| Action Aller à la feuille | Navigue vers une feuille via marque/menu | spécialisé-BI |
| Déclencheur d'action | Survol / sélection / menu | générique |
| Boîte de dialogue Actions | Gestion centrale des actions | générique |
| Filtre appliqué à plusieurs feuilles | « Appliquer aux feuilles » (sélection/toutes) | spécialisé-BI |
| Carte de filtre interactive | Filtre exposé et utilisable par le lecteur | générique |
| Légende interactive (highlight) | Clic sur légende = surbrillance | spécialisé-BI |
| Sélecteur de paramètre (dashboard) | Contrôle de paramètre exposé | générique |
| Sélecteur d'ensemble (dashboard) | Contrôle In/Out exposé | spécialisé-BI |
| Barre d'outils de feuille (au survol) | Tri/garder/exclure/voir données/exporter | générique |
| Menu déroulant d'objet | Options par objet (titre, légendes, exporter) | menu |
| Disposition par appareil (device layouts) | Variantes Bureau / Tablette / Téléphone | spécialisé-BI |
| Aperçu appareil (device preview) | Modèles iPhone/iPad + cadre/échelle | générique |
| Mode d'ajustement appareil | « Ajuster tout » / « Ajuster largeur » | générique |
| Volet Disposition (Layout) | Position/taille/marges/bordure/arrière-plan d'objet | générique |
| Hiérarchie des éléments (item hierarchy) | Arbre des conteneurs/objets imbriqués | générique |
| Viz-in-tooltip (interactif) | Mini-viz filtrable dans l'infobulle | spécialisé-BI |
| Récit (Story) | Séquence de points narratifs | spécialisé-BI |
| Navigateur de points de récit | Cases/onglets de navigation entre slides | onglet |

---

## Spécificités Tableau à ne pas oublier

- **Modèle pilules bleu (discret) / vert (continu)** : la couleur encode le rôle du champ, omniprésent dans toute l'UI.
- **Carte Repères** : encodages visuels par glisser-déposer (couleur/taille/forme/angle/chemin/détail/étiquette/infobulle) — cœur du paradigme VizQL.
- **Étagères Lignes/Colonnes** : grammaire spatiale en croix qui génère la requête VizQL.
- **Show Me** : galerie qui grise dynamiquement les vues impossibles selon les champs sélectionnés.
- **Glisser-déposer partout** : champs, analyses (volet Analytique), objets de dashboard.
- **Sets, Groupes, Bins, Hiérarchies, Paramètres, Champs calculés** : objets de données natifs distincts des composants visuels.
- **Calculs de table** et **calculs rapides** : transformations contextuelles attachées à une pilule.
- **Pages** + lecteur d'animation (différent des filtres).
- **Double axe + synchronisation d'axes** : superposition de cartes Repères indépendantes.
- **Actions** (filtre/surbrillance/URL/paramètre/set/aller-à) avec déclencheurs survol/sélection/menu.
- **Viz-in-tooltip** : une feuille entière rendue dans une infobulle.
- **Device Designer** : layouts Bureau/Tablette/Téléphone dérivés d'un dashboard parent par défaut.
- **Conteneurs tuilés vs flottants** : deux modèles de mise en page coexistants.
- **Cartes géographiques natives** : géocodage automatique, symboles/choroplèthes/densité/couches.
- **Annotations ancrées** (point/marque/zone) propres à la BI.
- **Récits (Stories)** : format narratif séquencé au-delà du simple dashboard.
- **Barre d'outils au survol des marques/feuilles** : garder seulement / exclure / voir les données / regrouper.
