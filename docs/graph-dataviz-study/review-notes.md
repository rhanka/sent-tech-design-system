# Revues indépendantes de conception

Deux pairs internes en lecture seule ont examiné des angles distincts conformément au workflow de conception. Leurs observations sont réconciliées ici. Ces lectures ne remplacent pas la revue fable prévue par le conducteur. Elles ne sont pas des preuves d’exécution des bibliothèques ou applications.

| Angle / observation | Traitement dans le livrable |
|---|---|
| Couverture : 36 pages Graphviz ne sont pas 36 formats | Extraction des 64 paramètres de la table + `vt-8up2` documenté dans VT100 ; 65 entrées, chacune avec source et nature. |
| Couverture : cataloguer les vrais calculs DS au-delà des builders dataviz | Quatre simulations ForceGraph, 14 familles géométriques complémentaires, 371 implémentations de 93 composants/helpers, 455 modules source ; ajout de deux layouts d’export graphify. |
| Couverture : catégories JointJS absentes du champ CMS | Catégorie analytique explicite ; labels galerie supplémentaires séparés des features détaillées ; appartenance aux tags taxonomiques officiels source-gap. |
| Couverture : `scale-svgmarker` sans features sur la fiche | Repli galerie `Custom shapes` explicite ; gap de fiche conservé. |
| Couverture : cache et date de génération | Dates HTTP par source, SHA-256 ; `GD_STUDY_REFRESH=1` et cache alternatif documentés. |
| Architecture : `graph-layout` trop large pour Dijkstra/parcours | `graph-processing` séparé, contrat topologique ; layout garde le contrat géométrique. Le coût d’un package supplémentaire est justifié par les consommateurs sans rendu. |
| Architecture : `graph-view` ambigu | Nom `graph-compiler`, vue/occurrence restant dans le modèle. |
| Architecture : recettes statiques insuffisantes pour les apps | Besoins/features individuels, contributeurs et quatre routes de hosts ; acceptation d’un écran et interactions exigée. |
| Architecture : risque codecs/export/BI mélangés | JSON document, JSON scène, JSON Graphviz et JSON dashboard distincts ; codecs sémantiques vs artefacts, CSV futur pure core issu des wrappers. |
| Architecture : worker attire des globals browser ; routing crée un cycle | Ports transport ; `/browser` isolé ; layout→routing seulement ; DAG calculé et vérifié indépendamment. |
| Architecture : versions de profils confondues avec SemVer | Schéma document, profil, protocole worker et package explicitement séparés ; D6 matrice plutôt que pins supposés. |
| Architecture : quatre moteurs ForceGraph deviennent une cinquième copie | Extraction unique puis délégation des APIs DS/graph ; DS imports purs par sous-chemin, aucune dépendance canvas/recipes. |
| Sources historiques : F1/F2 corrigés dans le mandat | Corrections rappelées dans la spec ; aucune non-publication Angular ou omission DashboardGrid déduite d’un inventaire périmé. |

Autres compléments de la lecture source : GraphML, Cypher, Spanner DDL/DML, Obsidian `.canvas`, Markdown wiki et JSON produit explicités ; les projections métier et les opérations de push restent produits. Deux anciennes erreurs 403 de fiches sont résolues pour la lecture ; deux iframes réels renvoient 404 et restent des gaps.

État de revue externe : **fable pending**, sans assimilation à ces lectures internes. Aucun avis owner, aucune acceptation Track ni signature de pair inventés.

Dernière lecture des artefacts : dépendance existante themes→tokens rétablie ; neuf capacités algorithmiques complémentaires reliées à leurs recettes ; profils métier rattachés explicitement ; provenance dashboard étendue à serialize/layout/annotations ; sous-ensemble GraphML existant limité à ses six attributs.
