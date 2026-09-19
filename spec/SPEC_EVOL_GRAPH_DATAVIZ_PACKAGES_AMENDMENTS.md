# Amendements à SPEC_EVOL_GRAPH_DATAVIZ_PACKAGES (agréés, à appliquer au build)

Date : 2026-09-16, statut de publication mis à jour le 2026-09-18. Base : SPEC_EVOL_GRAPH_DATAVIZ_PACKAGES.md (astra-gd-arch) + revue fable + ratification owner D1–D8.
Ces deltas sont **agréés** ; ils s'appliquent lors de la réalisation. La cible de publication à 24 packages est remplacée par la consolidation à 14 packages de [la pré-analyse de consolidation](../docs/graph-dataviz-consolidation-preanalysis.md) : les frontières fusionnées sont des sous-chemins à isolation réelle, sans supprimer l’allocation exhaustive des capacités. Le SPEC_EVOL reste le document d'architecture ; ce fichier porte les corrections de la revue. M2 attend les avis indépendants Astra et Fable 5.1 demandés par le propriétaire.

## Contexte décisionnel
- Owner a ratifié D1=A, D2=C, D3=A, D4=C′, D5=B, D6=C, D7=A, **D8=A**.
- **D8=A** (charts légers, séparés du moteur de graphe) : la géométrie des charts reste légère (couche présentation/dataviz), `graph-layout` = uniquement layouts de graphe. AUCUNE dépendance DS→moteur-graphe.
- Revue fable : exhaustivité CONFIRMÉE (186 vues JointJS/ELK/Graphviz vérifiés live), verdict « à amender », 3 défauts + corrections mécaniques.
- Spike CSP mesuré : xyflow interactif ne passe PAS `style-src-attr 'none'` (1 violation au load). v1 = rendu SVG statique sans style inline ; xyflow = éditeur interactif gaté.

## Amendements (deltas)
1. **[D8=A / fable Défaut A+B] Sortir les 14 kernels de charts DS de `graph-layout`.** WordCloud, Venn, GeoChart (projections/hex-binning) et les autres kernels de charts NE sont PAS des layouts de graphe → les reloger dans une couche présentation/dataviz LÉGÈRE (dataviz-core ou un package feuille de géométrie de charts). `graph-layout` = uniquement ELK/Graphviz/force + calculs de layout de graphe. Résultat : aucun composant DS/dashboard ne tire le moteur graphe pour dessiner un chart. Éliminer l'arête `design-system-* → graph-layout/graph-scene`.
2. **[fable Défaut C] Casser `dataviz-* → graph-export`.** Ne pas faire passer les adaptateurs BI de 4 à 13 deps transitives. Option : encodeurs feuille (leaf) OU supprimer l'arête `graph-export → graph-codecs` ; `jspdf`/`svg2pdf.js` en peerDependency OPTIONNELLE (pas hérités par dataviz-angular). dataviz-* garde ses deps légères actuelles.
3. **[fable nommage] Renommer `@sentropic/graph-canvas` → `@sentropic/graph-editor`.** « canvas » est trompeur (lu comme 3e backend à côté de `graph` Canvas2D / `graph-svg` / `graph-dom`) ; « editor » décrit le contrôleur d'édition (outils/sélection/undo-redo/annotations).
4. **[fable nommage] Neutraliser les clés `jointjs/<slug>`** dans le catalogue/allocation (marque tierce embarquée) → clés neutres (ex. `recipe/<slug>`), JointJS = référence de couverture citée en source, pas une clé de contrat.
5. **[fable cohérence] Aligner D4 = C′** partout (le JSON owner disait « C » = l'option C′ « seam sur ligne de version séparée + dist-tag next » de mon dossier ; libellé à uniformiser).
6. **[spike CSP / D2.5] Profil de rendu de scène** : les composants DS de scène (généralisation `ArchitectureNode/Edge/Canvas`) rendent en **SVG statique sans attribut style inline** (classes/CSS-vars) pour v1 (CSP-safe) ; le profil interactif xyflow est séparé et gaté (refactor styles→classes OU dérogation `style-src-attr`, décision owner séparée).

## Invariants préservés (non modifiés)
- Exhaustivité (1820 entrées, 186 vues JointJS, ELK/Graphviz complets), DAG acyclique, noms existants préservés (@sentropic/graph, dataviz-*), D1-D8 ratifiés, D7=A (pas de dep tierce runtime implicite).
- Le SPEC_EVOL reste la référence d'architecture ; le build (M2) applique ces deltas et re-vérifie DAG + couverture.
