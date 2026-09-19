# CHECKPOINT — lane DESIGN graph + dataviz

Conducteur : design-system. Décisions D1=A, D2=C, D3=A, D4=C′, D5=B, D6=C, D7=A appliquées. Revue fable : **à effectuer**.

## Livré

- [Étude fonctionnelle et énumérations](graph-dataviz-functional-coverage.md), avec [JSON](graph-dataviz-functional-coverage.json).
- [Architecture et nommage](../spec/SPEC_EVOL_GRAPH_DATAVIZ_PACKAGES.md), fiches individuelles, table aire→package et deux diagrammes Mermaid.
- [Allocation inverse exhaustive](graph-dataviz-study/package-coverage.md), [modules et exports](graph-dataviz-study/source-modules.md), preuves HTTP/locales et scripts de collecte/vérification.

**1 820 entrées de couverture** de granularités distinctes, dont les **578 entrées initiales conservées**. Ce total n’est pas un nombre de fonctions indépendantes. Les **3 547 couples package/export** des six bibliothèques sont cartographiés, sans renommage public.

## Exhaustivité prouvée et limites

| Ensemble | Preuve |
|---|---|
| ELK | 21 algorithmes, 60 groupes, 286 fiches d’options / 279 IDs ; index et détails recoupés, membres de groupes et options supportées vérifiés. |
| Graphviz | 10 moteurs, 177 attributs ; 65 paramètres de sortie issus de 36 pages, alias/variantes/surfaces distingués. |
| JointJS | 186 URL, égalité des deux galeries paginées avec le sitemap ; besoin et features par fiche, 61 features distinctes ; aucune vue omise. |
| Sentropic | Surfaces des six packages ; 34 entrées moteurs/calculs, neuf ponts/producteurs explicites, 455 modules et 371 couples framework/export DS pour 93 composants/helpers graphiques. |
| Allocation | Chaque entrée possède un package cible ; DAG de 30 packages sans cycle ; 1 887 vérifications d’artefacts passent, 835 fichiers source recontrôlés. |

Les 186 fiches JointJS sont accessibles. Deux applications embarquées renvoient 404 : **AI Mind Map Generator** (`resources.jointjs.com/demos/rappid/apps/ChatGPT`) et **Zoomable User Interface** (`resources.jointjs.com/demos/rappid/apps/ZUI/`). `scale-svgmarker` n’a pas de liste de features détaillée : la galerie documente `Custom shapes`. Les catégories sont analytiques ; leur appartenance aux tags taxonomiques officiels n’est pas récupérée.

Les options ELK ont des métadonnées documentaires vérifiées ; leurs interactions/runtime restent à qualifier. Les démos commerciales JointJS+ n’ont pas fourni leur code. Aucun moteur upstream ni scénario UI n’a été exécuté dans cette lane. L’inventaire n’atteste pas une conformité normative ni une migration terminée.

## Packages nommés et périmètres

24 packages graph/dataviz : **18 nouveaux**, **6 noms existants préservés**. Les six socles DS supplémentaires sont recensés après eux pour montrer toutes les dépendances du DAG. Versions indépendantes et tags préfixés pour chaque nom ; les pins attendent les preuves de compatibilité D6.

| Nom exact | Périmètre | Statut du nom |
|---|---|---|
| `@sentropic/graph-model` | Document, références, vues/occurrences, commandes et ports | nouveau, cible de design |
| `@sentropic/graph-profiles` | Profils métier typés et versionnés | nouveau, cible de design |
| `@sentropic/graph-scene` | Géométrie, buffers, caméra, picking, texte et identités | nouveau, cible de design |
| `@sentropic/graph-codecs` | Modèles/sources interopérables, AST/CST et rapports de pertes | nouveau, cible de design |
| `@sentropic/graph-processing` | Topologie, parcours, chemins et projections | nouveau, cible de design |
| `@sentropic/graph-routing` | Routes visuelles, ports, obstacles, labels, link-to-link | nouveau, cible de design |
| `@sentropic/graph-layout` | Placement, registre, phases, algorithmes/options ELK/Graphviz et calculs Sentropic | nouveau, cible de design |
| `@sentropic/graph-worker` | Exécution sur snapshots, annulation et rejet de résultats périmés | nouveau, cible de design |
| `@sentropic/graph-compiler` | Compilateur unique document/vue/profil→scène | nouveau, cible de design |
| `@sentropic/graph` | WebGL2/Canvas2D et façade des API publiées | préservé |
| `@sentropic/graph-svg` | Backend et sérialisation SVG | nouveau, cible de design |
| `@sentropic/graph-dom` | Nœuds HTML, mesure/focus/IME et composition hybride | nouveau, cible de design |
| `@sentropic/graph-canvas` | Contrôleur édition, outils, sélection, undo/redo et annotations | nouveau, cible de design |
| `@sentropic/graph-export` | Artefacts SVG/raster/PDF/PPTX/HTML/print et sorties additionnelles | nouveau, cible de design |
| `@sentropic/graph-recipes` | 186 recettes identifiées, scénarios et compositions d’applications | nouveau, cible de design |
| `@sentropic/graph-svelte` | Binding svelte du compilateur/canvas/rendu et outils DS | nouveau, cible de design |
| `@sentropic/graph-react` | Binding react du compilateur/canvas/rendu et outils DS | nouveau, cible de design |
| `@sentropic/graph-vue` | Binding vue du compilateur/canvas/rendu et outils DS | nouveau, cible de design |
| `@sentropic/graph-angular` | Binding angular du compilateur/canvas/rendu et outils DS | nouveau, cible de design |
| `@sentropic/dataviz-core` | État inter-vues, filtres/crossfilter, calculs, builders et sérialisations BI | préservé |
| `@sentropic/dataviz-svelte` | Bridge store et totalité des wrappers/dashboard svelte | préservé |
| `@sentropic/dataviz-react` | Bridge store et totalité des wrappers/dashboard react | préservé |
| `@sentropic/dataviz-vue` | Bridge store et totalité des wrappers/dashboard vue | préservé |
| `@sentropic/dataviz-angular` | Bridge store et totalité des wrappers/dashboard angular ; seam sous next sur ligne distincte | préservé |
| `@sentropic/design-system-svelte` | Composants présentationnels DS svelte, réutilisés sans store BI/canvas imposé | préservé |
| `@sentropic/design-system-react` | Composants présentationnels DS react, réutilisés sans store BI/canvas imposé | préservé |
| `@sentropic/design-system-vue` | Composants présentationnels DS vue, réutilisés sans store BI/canvas imposé | préservé |
| `@sentropic/design-system-angular` | Composants présentationnels DS angular, réutilisés sans store BI/canvas imposé | préservé |
| `@sentropic/design-system-tokens` | Contrats de tokens existants | préservé |
| `@sentropic/design-system-themes` | Thèmes portables existants ; dépend de tokens | préservé |

## Arbitrages owner et suite

**Aucun re-vote D1–D7 requis.** Les détails D5 sont prêts pour la revue fable. Une nouvelle décision owner serait nécessaire uniquement si la réalisation proposait une nouvelle dépendance runtime tierce, une réduction du périmètre exhaustif ou une perte de fidélité acceptée comme engagement produit. Ces écarts ne sont pas autorisés par le présent dossier.

Le conducteur peut intégrer l’allocation aux items existants S1–S7, puis réaliser M1/M2 avec qualification progressive. Les versions npm/pins, les seuils de performance et la fidélité par dialecte sont des preuves à compléter, pas des acquis de cette étude. Les IDs Track hérités sont des références de rapprochement : **aucune écriture Track ni acceptation n’a été fabriquée**.

Code produit et dépendances runtime inchangés. Aucun commit, merge ou publication effectué. Les scripts livrés collectent les sources et contrôlent le dossier ; ils ne constituent pas l’implémentation des capacités.
