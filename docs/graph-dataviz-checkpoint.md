# Checkpoint — Rapatriement graph/dataviz

Date : 2026-09-15. Branche : `feat/graph-dataviz-repatriation`. **Programme ouvert. M0 produit ; premier sous-lot M1 réalisé.**

## Livré

- **M0 :** 3 547 couples package/export des six bibliothèques, 1 517 exports DS + 3 entrées DiagramAnnotator. Chaque ligne a source, destination, décision et ID Track effectif. 13 capacités graphify hors package restent distinguées des exports publiés.
- **Réconciliation :** WP20 reste `partial/unverified` au niveau contrat adopté. Heatmap présent DS mais non transmis ; deux DashboardGrid avec contrats différents ; hover/crosshair livré ne prouve pas nearest-X. Anciennes clôtures conservées, critères supplémentaires sur les vrais items.
- **Architecture :** deux diagrammes Mermaid, DAG à 16 nœuds/39 arêtes sans cycles, séparation document/vues/projection/scène/sources, profils natifs, pivots et rapports de conversion, commandes/transactions/ports et frontières des packages.
- **Couverture :** 21 algorithmes ELK, 60 groupes, 286 entrées options/279 IDs, 10 Graphviz, 186 apps/recettes JointJS, 15 entrées Sentropic. 578 références, 106 sources HTTP datées/empreintées. Ce catalogue ne constitue pas une implémentation.
- **M1 initial :** `packages/graph` et `packages/dataviz-core` intégrés au workspace, 200 fichiers source/licence tracés. Runtime/tests source inchangés ; quatre adaptations de packaging. Tarballs locaux vérifiés, aucune version préexistante du lockfile modifiée.
- **Track :** 21 items créés, 5 existants enrichis, 4 dossiers pending, 26 critères et 4 liens de preuves ; 119 événements supplémentaires, tous attribués à l’agent. 1 555 événements valides. Rejeu après livraison : zéro opération.

## Preuves et limites

- Core : 646 tests PASS ; build/typecheck et consommateur TypeScript sans DOM PASS.
- Graph : 330 tests rapportés PASS ; les 133 golden inclus ont été rejoués avec Chrome/WebGL obligatoires et PASS. Préflight WebGL2/readPixels PASS. Builds ESM/CJS/types et parité des 211 exports déclarés PASS.
- DS ciblé : 256 tests PASS (Svelte 118, React/Vue 138) ; aucun test Angular ni build global de tous les packages DS.
- Pack isolé : graph 138 valeurs/211 déclarations et core 174 valeurs/495 déclarations, résolution depuis deux `.tgz` sans workspace. Benchmark 100k nœuds/200k arêtes consigné, une mesure locale sans budget ratifié.
- Quatre items ont une réalisation `done` (M0 réconciliation, M0 étude, M1 graph, M1 core) ; **acceptation Track `unknown`**, preuves liées sans run d’acceptation ou recette owner inventés. `done` de l’étude ne signifie pas design public ratifié. Les dépendances utilisent `linked-accepted` : leurs gates restent visibles.
- Historique h2a ancien : rapprochement fondé sur handover, traces consignées en spec/track, code/tests/commits ; le message original du bus de juin n’a pas été relu. Il n’est pas présenté comme une nouvelle attestation.

## Restant

- **M1 :** les quatre adaptateurs, compatibilité GeoMap→GeoChart, résolution workspace DS, CSS/assets, smoke global/release/OIDC et versions de publication.
- **M2–M6 :** extraction force/hierarchy/workers ; contrats formels et scène/canevas ; tranche SVG/WebGL/HTML et profils BPMN/ArchiMate ; codecs qualifiés ; couverture algorithmes/apps ; adoption et retrait des anciennes implémentations.
- **Revue et restitution :** fable 5.1 + gemini 3.7 demandés au conducteur ; aucun résultat reçu à ce checkpoint. Le passage de l’étude à EVOL et les décisions owner restent ouverts. Le cycle astra/fable puis sol xhigh/gemini 3.8 prescrit n’est pas déclaré réalisé.

## Blocages et hypothèses

- **Aucun accès source refusé.** Cache npm global inaccessible résolu par cache dédié ; Chromium Snap indisponible remplacé par le binaire Playwright installé ; aucun blocage environnement résiduel pour les gates exécutés.
- **Écart M1 avéré :** imports géo dataviz encore GeoMap alors que DS main expose GeoChart. Adapter sans renommer les exports publics dataviz.
- **Avant publication :** politique de versions/publisher et seuil Angular à arbitrer, droits registry non vérifiés. Le package Angular sera rapatrié même si sa publication reste différée.
- **Sources de référence :** ELK current non rattaché avec certitude au tag ; pages individuelles JointJS BPMN/ArchiMate HTTP 403 ; index/catalogue accessibles. Comportements tiers non exécutés.
- **Étude et décisions :** hypotheses réversibles explicites, aucun contrat persistant public figé. Aucune décision owner, signature ou compréhension h2a fabriquée.

## IDs Track

Les parents permanents ont été retrouvés dans le journal ; aucun stream n’a été recréé. Propriétaire principal courant des items du programme : `codex:.repat-wt:b943adbe6d5c` (agent Astra), sous conduite `design-system`. Les attributions préexistantes sont conservées lorsqu’elles existent.

| Stream | ID effectif |
|---|---|
| S1 · Cœur & Composants | `01KW85QZ8EXVA1A3NW828N0XG2` |
| S2 · Frameworks & Parité | `01KW8609WHKK20XE3HVQ7C6AS5` |
| S3 · Theming & Marques | `01KW860A52N3P1BRCVTAQK59DN` |
| S4 · Dataviz / BI | `01KW860AE02142WK477SGQCFY9` |
| S5 · Docs & Site | `01KW860AN79KF4WN4RVX2PH727` |
| S6 · Moteur, Outillage & Release | `01KW860ATXPNDVSCVHT92KB6P2` |
| S7 · Application & QA Consommateurs | `01KW860AZTVXKZ50J9R3EBB9K9` |

| Clé stable | Item effectif | Parent propriétaire | Réemploi |
|---|---|---|---|
| `GD-M0-RECONCILE` | `01M2KJTWY380VGDMTXT2EWKMHR` | S4 | créé |
| `GD-M0-ARCHITECTURE` | `01M2KJTX336AE0HD4E190GHFHV` | S4 | créé |
| `GD-M1-GRAPH` | `01M2KJTX6SMQ140A0Q547W1VSV` | S4 | créé |
| `GD-M1-DATAVIZ-CORE` | `01M2KJTX8XWWZASR34ZA26BC2F` | S4 | créé |
| `GD-M1-DATAVIZ-SVELTE` | `01M2KJTXB6901X592XE2ABHDJX` | S2 | créé |
| `GD-M1-DATAVIZ-REACT` | `01M2KJTXDADHA0AHA1NY3YN9Z0` | S2 | créé |
| `GD-M1-DATAVIZ-VUE` | `01M2KJTXFHSFBRE5W4Z7Q3A09C` | S2 | créé |
| `GD-M1-DATAVIZ-ANGULAR` | `01M2KJTXHS0JY6T1FGETHQ8P77` | S2 | créé |
| `GD-M1-PACKAGING` | `01M2KJTXM16G2D1YRE2S2CR5EK` | S6 | créé |
| `GD-WP20-HEATMAP` | `01KTV0000000000000000010` | S4 | existant enrichi |
| `GD-WP20-GRID` | `01KTV0000000000000000020` | S4 | existant enrichi |
| `GD-WP20-FR3` | `01KTV0000000000000000030` | S4 | existant enrichi |
| `GD-M2-MODEL` | `01M2KJTXXTKMDR04Z336GMM533` | S4 | créé |
| `GD-M2-PROCESSING` | `01M2KJTXZY6QDSVGB2HV4M2NJ5` | S4 | créé |
| `GD-M2-WORKERS` | `01M2KJTY266FZ1HNXGE1ZMF9WH` | S6 | créé |
| `GD-M2-DS-PRESENTATION` | `01M2KJTY4JQ9F8EVFR63HFB46B` | S1 | créé |
| `GD-M2-CANVAS` | `01M2KJTY6V3DC5N6ZBVG13808F` | S1 | créé |
| `GD-M2-PARITY` | `01M2KJTY950VZE61KCYBT87TBP` | S2 | créé |
| `GD-M2-THEMES` | `01M2KJTYBKP72M7HK2FJ8Y1MQY` | S3 | créé |
| `GD-M3-SLICE` | `01M2KJTYE8AX2VWQWTD852TKRK` | S4 | créé |
| `GD-M4-CODECS` | `01M2KJTYGT602QQGBT2BTKA9GM` | S4 | créé |
| `GD-M5-PROCESSING` | `01M2KJTYK26HHQ0G81FJ62TT34` | S4 | créé |
| `GD-M5-APPS` | `01M2KJTYNB7V12JYDE4J0TZ2PK` | S5 | créé |
| `GD-M6-GRAPHIFY` | `01KW860Y8HHXFHG4Z27BW58CWP` | S7 | existant enrichi |
| `GD-M6-DATAVIZ` | `01KW860YF3330RKT7BP16GFTM1` | S7 | existant enrichi |
| `GD-M6-SENTROPIC` | `01M2KJTYW80VY3YPTNWJXQW89R` | S7 | créé |

## Questions de décision

Les [quatre dossiers autoportants](../spec/SPEC_DECISIONS_GRAPH_DATAVIZ_REPATRIATION.md) comprennent contexte/source, enjeux, A/B/C, conséquences, recommandation provisoire et meilleure objection. Ils restent **Incomplete — revue prescrite pending**. Le JSON compagnon alimente Track/Focus ; aucune option sélectionnée.

| Dossier | Question | ID décision |
|---|---|---|
| D1 | Contrat persistant : noyau typé/profils, modèles natifs séparés ou sources maîtres ? | `01M2KK5XMT167FA4389ZJMRV39` |
| D2 | Releases : familles graph/dataviz/DS, lockstep global ou packages indépendants ? | `01M2KK5XPJCP07FDBQBX16TV08` |
| D3 | Pivots : sous-ensembles qualifiés, dialectes pilotes approfondis ou import lecture initial ? | `01M2KK5XQSHM5Y7WB2TCAW6D8T` |
| D4 | Angular : tranche complète à quatre frameworks, catalogue entier ou seam expérimental avant public ? | `01M2KK5XS2SXGMSSQPAVCF2XJ4` |

## Prochaine action

**Conducteur :** challenger les quatre dossiers avec fable 5.1 et gemini 3.7, réconcilier puis présenter via h2a-focus + DS. **Exécution suivante :** poursuivre M1 avec les quatre adaptateurs après adaptation des imports géo ; conserver les deux contrats Grid jusqu’à leur convergence testée. Les coordonnées et corps des dossiers Track sont prêts ; `track focus <ID> --workspace streams --format html` a été vérifié sur D1 (fragment brut, pas une présentation DS effectuée à l’owner).

## Livrables et rejeu

- [Correspondance source](graph-dataviz-source-map.md) + JSON + vérificateur source.
- [Audit DS et historique WP20](graph-dataviz-ds-audit.md) + JSON des exports DS.
- [Catalogue de capacités](graph-dataviz-reference-catalog.md) + JSON daté/versionné.
- [Architecture et modèle formel](../spec/SPEC_STUDY_GRAPH_DATAVIZ_REPATRIATION.md).
- [Plan M0–M6](../plan/10-BRANCH_graph-dataviz-repatriation.md).
- [Vérification M1 et provenance](graph-dataviz-m1-verification.md).
- [Opérations Track](../plan/graph-dataviz-track-operations.json), [rejeu supporté](../plan/replay-graph-dataviz-track.mjs), [résultat/IDs](graph-dataviz-track-sync.json).

Depuis ce worktree : `node docs/graph-dataviz-source-map.audit.mjs`, `node docs/graph-dataviz-verify.mjs`, `node plan/replay-graph-dataviz-track.mjs` (preview), puis `--apply` seulement pour le writer désigné. L’API publique Track est utilisée car le CLI 0.94.3 force une identité `human:` ; aucune écriture directe des événements/hashes. La synchronisation est **effectuée dans ce worktree**, pas dans le checkout du conducteur. Un import générique du plan recréerait des items ; utiliser les clés/IDs du rejeu fourni.

Aucune source `.astra-inputs/`, sortie de test PNG ou dépendance installée ne fait partie des livrables Git. Les messages au conducteur ont été remis via le plugin h2a ; cela ne vaut ni review ni décision owner.
