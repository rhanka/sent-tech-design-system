# Inventaire M0 — @sentropic/graph + capacités génériques de graphe (rhanka/graphify)

READ-ONLY. Aucun fichier des dépôts modifié. Objectif : préparer le rapatriement vers le design system Sentropic.

## 0. Provenance

| Champ | Valeur |
|---|---|
| Dépôt | `/home/antoinefa/src/graphify` |
| Remote | `github.com/rhanka/graphify` |
| Branche | `feat/aclp-ontology-studio` |
| HEAD (SHA) | `8f19554cea3a4397fd66a90c7e9fd5ea54c81626` (2026-08-20) |
| Working tree | dirty, MAIS aucune modif dans `packages/graph/` ni `src/*layout*.ts` (les fichiers inventoriés). Modifs = `.graphify/*`, `.track/*`, `src/workspace/tokens-st-css.generated.ts` ; nombreux fichiers non-suivis (worktrees, spec/, .remote/). `packages/graph/tests/golden/__out__/` = sorties de test non-suivies. |

Note : la branche est `feat/aclp-ontology-studio` (le snapshot git du prompt — `feat/geo-adapter-svelte` — concernait le dépôt courant `sent-tech-design-system`, pas graphify).

---

## 1. `packages/graph` (@sentropic/graph)

### package.json (faits)
- **name** : `@sentropic/graph` — **version** : `0.2.0` — **license** : **MIT**
- **private ?** NON. `publishConfig.access = "public"`. **PUBLIÉ sur npm** : `npm view @sentropic/graph version` → `0.2.0` (vérifié en ligne). Publication = **action manuelle du mainteneur**, PAS branchée dans la CI (voir `packages/graph/PUBLISHING.md`). Le tag-driven publish CI ne publie que `@sentropic/graphify`.
- **type** : `module`. **main** `./dist/index.cjs`, **module** `./dist/index.js`, **types** `./dist/index.d.ts`. Un seul export `"."` (ESM+CJS+types). `sideEffects: false`.
- **files** : `dist`, `README.md`, `FEATURES.md`.
- **dependencies** : **AUCUNE** (zéro dépendance runtime).
- **peerDependencies** : **AUCUNE**.
- **devDependencies** : `@napi-rs/canvas ^1.0.0` (MIT, *unverified in-tree*), `ws ^8.18.0` (MIT) — **uniquement** le harnais de tests golden (rendu hors-navigateur + CDP), pas de couplage runtime.
- Repository directory `packages/graph`, url pointe vers `rhanka/graphify`.

Conséquence : **bibliothèque de rendu de graphe framework-agnostique, zéro dépendance runtime, déjà packagée npm/MIT.** Candidat de rapatriement le plus « propre ».

### Origine
- 1er commit du package : `0ed0fc76d3af8fc9b9f5335351a7a040d5ef1b24` (`feat(graph): add sentropic graph rendering package`).
- Dernier : `34a7e98e` (fix halo box-glyph). 44 commits touchent `packages/graph`.

### Nature technique
- **Rendu** : double backend. Canvas2D (défaut, source de vérité golden) **et** WebGL2 instancié (canari interne, gated `GRAPHIFY_RENDER_BACKEND` / option `instancedShapes`). Buffers typés partout (`Float32Array` positions, `Uint32Array` arêtes, arrays de style typés). Caméra unifiée via mat4 (ortho aujourd'hui, perspective/3D en un point de code plus tard).
- **Géométrie/layout** : géométrie de rendu backend-agnostique (source unique anti-divergence Canvas2D↔WebGL↔hit-test) + cores de layout déterministes (voir §2). Le layout est PRÉCALCULÉ hors du chemin de rendu et « baké » en positions.
- **API publique** : un seul point d'entrée `src/index.ts` qui re-exporte 19 modules.

### Exports publics par module (responsabilité)

| Module | Symboles publics clés | Responsabilité | Couche / rendu |
|---|---|---|---|
| `types.ts` | `NodeId`, `ColorInput`, `GraphNodeShape`, `GraphRendererBackend`, `HighLevelGraph{Node,Edge,Input}`, `RenderGraphBuffers`, `GraphStyleBuffers`, `GraphRenderer`, `GraphRendererOptions/Snapshot`, `CameraState`, `LayoutEngine`, `PositionFrame`, `NodeFlags`, `FitViewOptions` | Contrats de types (scène, rendu, layout, caméra) | **contrats-noyau** |
| `buffers.ts` | `buildRenderGraphBuffers` | Graphe haut-niveau → buffers typés (`nodeIds`, `idToIndex`, positions, arêtes) ; filtre les arêtes pendantes | contrats-noyau / scène-géométrie |
| `styles.ts` | `buildStyleBuffers` | Tailles/couleurs/shapes nœuds + largeur/couleur/dash/courbure arêtes → arrays de style typés ; parsing couleur | scène-géométrie |
| `positions.ts` | `assertPositionArray`, `copyPositions`, `createPositionFrame`, `computePositionBounds` | Validation/utilitaires des buffers de positions | contrats-noyau |
| `edge-geometry.ts` | `buildEdgePolylinePositions` | Polylignes d'arêtes droites + arcs quadratiques | scène-géométrie |
| `shape-geometry.ts` | `shapeCode`, `shapePolygonPoints`, `shapeSvgPath`, `BOX_SHAPE_CODE`, ratios | **Source unique** de la géométrie des glyphes (Canvas2D, WebGL, ET glyphes SVG du rail studio) | scène-géométrie |
| `render-geometry.ts` | `drawnRadius`, `boxDimensions`, `fitLabelToWidth`, `edgeGeometry`, `flowPortEdgeGeometry`, `tessellateEdge`, `nodeGeometry`, route/arrow/dash consts | Math de géométrie de rendu backend-agnostique (rayon dessiné, box metrics, routing d'arêtes, tessellation) — anti-divergence | scène-géométrie / moteurs |
| `mat4.ts` | `identity`, `multiply`, `translate`, `scale`, `ortho`, `transformVec4`, `cameraToViewProjection` | Matrices 4×4 column-major + view-projection caméra (fondation 3D) | scène-géométrie |
| `renderer.ts` (1485 l.) | **`createGraphRenderer`**, `drawBoxLabels2D` | **LE renderer** : `GraphRenderer` (Canvas2D + WebGL2), caméra, `setGraph/setStyle/setPositions/updatePositions/fitView/setCamera/render/snapshot`, picking, hit-test | **moteurs (rendu)** |
| `webgl-shapes.ts` | `createWebGLShapeRenderer`, `buildShapeInstances`, `instancedShapeFamilies`, halo | Renderer WebGL2 instancié des glyphes nœuds | moteurs (rendu) |
| `webgl-edges.ts` | `createWebGLEdgeRenderer`, `buildEdgeInstances` | Renderer WebGL2 instancié des arêtes (capsule SDF, dash arc-length, flèches) | moteurs (rendu) |
| `webgl-boxes.ts` | `createWebGLBoxRenderer`, `buildBoxInstances`, `buildTextAtlas`, `buildBoxTextDraws` | Renderer WebGL2 box-glyph + **texte in-canvas** (rounded-rect SDF + atlas de texte) | moteurs (rendu) |
| `layout.ts` | `createStaticLayoutEngine` | Moteur de layout trivial (une frame statique passthrough) | moteurs (layout) |
| `layout-registry.ts` | `registerLayout`, `getLayout`, `hasLayout`, `listLayouts`, `resolveLayout`, `createLayoutEngine`, `forceLayout`, `typedLayerLayout`, `timeOrientedLayout`, `computeTypedLayerPositions`, `computeTimeOrientedPositions`, ids (`DEFAULT_LAYOUT_ID`…`METRO_LAYOUT_ID`) | Registre de layouts enfichable + cores typed-layer & time-oriented + **passthrough `force`** | moteurs (layout) |
| `layout-gitflow.ts` (854 l.) | `computeGitFlowPositions`, `gitFlowLayout` | Placement git-graph gauche→droite (trunk/branches/lanes/sessions) | moteurs (layout) |
| `layout-grid.ts` | `computeGridPositions`, `gridLayout` | Grille `ceil(√n)` déterministe O(n) | moteurs (layout) |
| `layout-radial.ts` | `computeRadialPositions`, `radialLayout` | Anneaux concentriques BFS depuis le nœud de plus haut degré | moteurs (layout) |
| `layout-metro.ts` | `computeMetroPositions`, `metroLayout` | Lanes BFS grid-snappées (routing octilinéaire différé) | moteurs (layout) |
| `gitflow-labels.ts` (628 l.) | `compactGitFlowLabels`, `placeGitFlowLabels`, `resolveGitFlowLabelTier`, `middleEllipsisPreservingSuffix`, defaults | Politique de lisibilité des labels de branche git-flow (compaction, tiering zoom, placement zéro-overlap) | interaction / dataviz |

### Tests / doc / bench présents
- **Tests** : suite vitest complète (`tests/*.test.ts` : buffers, edge-geometry, gitflow-labels, layouts registry/grid/radial/metro/gitflow/typed-layer/time-oriented, mat4, renderer-api, shape-geometry, styles, webgl-{shapes,edges,boxes}) **+ golden visuels** (`tests/golden/` : harnais CDP navigateur réel, preflight WebGL, diff PNG, fixtures). Maturité **élevée**.
- **Doc** : `README.md`, `FEATURES.md` (roadmap v0.1 MVP + différé), `PUBLISHING.md`.
- **Bench** : `bench/buffers-bench.mjs` (100k nœuds / 200k arêtes ; buffers, style, géométrie droite/arc).

---

## 2. `layout-registry.ts` : layouts déclarés + LES VRAIS moteurs

### Layouts enregistrés (au chargement du module, `layout-registry.ts:430-436`)
| id | Fonction | Nature | Défaut ? |
|---|---|---|---|
| `force` | `forceLayout` | **PASSTHROUGH** — `copyPositions(graph.positions,…)` : renvoie verbatim les positions déjà bakées. Ne calcule RIEN. | **OUI** |
| `typed-layer` | `typedLayerLayout` → `computeTypedLayerPositions` | Swimlane par type, O(n) déterministe | opt-in |
| `time-oriented` | `timeOrientedLayout` → `computeTimeOrientedPositions` | Axe X temporel + lanes par type, O(n) | opt-in |
| `git-flow` | `gitFlowLayout` (layout-gitflow.ts) | Git-graph gauche→droite | opt-in |
| `radial` | `radialLayout` | Anneaux BFS | opt-in |
| `grid` | `gridLayout` | Grille | opt-in |
| `metro` | `metroLayout` | Lanes BFS | opt-in |

### ⚠ Où vit le VRAI calcul de force (hors du registre, hors du package)

Le registre `force` ne fait que **transmettre** des positions précalculées. Le vrai moteur de simulation force vit **dans `src/` racine du dépôt graphify, PAS dans `packages/graph`** :

| Fichier (racine graphify) | Rôle | SHA d'origine |
|---|---|---|
| **`src/graph-layout.ts`** (433 l.) | **LE moteur force** : `computeLayout()` (ligne 242) + `attachLayoutPositions()` (410). **Barnes-Hut FA2 déterministe, O(n log n)**, TS pur sans DOM. Miroir des constantes/seed de l'ancien `ForceGraph.runSimulation` (FNV-1a sur ids triés → stable après merge/reconciliation). Seed mulberry32. Précalcule et « pin » (`fx`/`fy`) dans `scene.json`. | `315ade690067240225ca0c2aaa9b270c5da27997` |
| **`src/hierarchy-layout.ts`** (506 l.) | Moteur `hierarchy-aware` : `computeHierarchyAwarePositions()`. Layout déterministe **sans simulation**, strictement O(n) : radial tidy-tree par hiérarchie + phyllotaxis pour non-hiérarchiques + shelf packing. | `b4d0e02099fcc1622e4d9d26d5f987a6ca84269a` |
| **`src/scene-layout.ts`** (292 l.) | **Wiring/sélection build-time** : `applySceneLayout`, `resolveSceneLayoutId`, `attach{TypedLayer,TimeOriented,HierarchyAware}Positions`. Choisit force/typed-layer/time-oriented/hierarchy-aware (env `GRAPHIFY_LAYOUT`). Délègue à `graph-layout` + `hierarchy-layout` et **importe les cores typed-layer/time-oriented DEPUIS `@sentropic/graph`**. | `e976bbe86be0c5f36782a6c8930783dae21f7b33` |
| `src/typed-layer-layout.ts` (27 l.) | **Shim déprécié** : simple re-export de `@sentropic/graph` (les copies vendored ont été retirées en 0.2.0 après régression #238). | — |

### Exécution off-main-thread (Web Worker) — dans `studio/`, hors package
| Fichier | Rôle |
|---|---|
| `studio/src/lib/layoutWorker.js` | **Web Worker** : exécute `computeLayout` hors du thread principal (re-solve « Spread/Links » sans freeze). |
| `studio/src/lib/forceLayoutClient.js` | Client du worker (`solveForce`) : préfère le worker, **fallback synchrone byte-identique** si pas de Worker (SSR/jsdom). |

**Alias** : les deux importent `computeLayout` via **`@graphify/graph-layout`**, un alias Vite/Vitest → `src/graph-layout.ts` (`studio/vite.config.js:45`, `vitest.config.ts:19`). Ce n'est PAS un package publié ; le vrai moteur reste `src/graph-layout.ts`.

**Résumé §2** : les cores de layout **géométriques/déterministes** (typed-layer, time-oriented, grid, radial, metro, git-flow) sont **dans le package**. Le **moteur de simulation force (Barnes-Hut FA2)**, le moteur **hierarchy-aware**, le **wiring de sélection** et le **Web Worker** sont **hors package** (racine `src/` + `studio/`).

---

## 3. Autres capacités génériques de graphe/rendu réutilisables hors `packages/graph`

| Élément | Chemin | Nature / réutilisabilité |
|---|---|---|
| Moteur force Barnes-Hut | `src/graph-layout.ts` | Générique, TS pur, testé (`tests/graph-layout.test.ts`). Réutilisable. |
| Moteur hierarchy-aware | `src/hierarchy-layout.ts` | Générique (entrée = forêt de hiérarchie), pur, O(n). Réutilisable. |
| Pattern layout off-thread | `studio/src/lib/{layoutWorker,forceLayoutClient}.js` | Worker + fallback sync générique. Réutilisable. |
| Sélection de backend de rendu + fallback WebGL2 + overlay texte | `studio/src/lib/renderBackend.js` (119 l.) | Sélection canvas2d/webgl, fallback gracieux WebGL2→Canvas2D, overlay Canvas2D du texte des box WebGL, toggle Ctrl+Shift+X. Couplé à l'API du renderer du package → réutilisable comme **adaptateur d'interaction**. |
| Adaptateur scène→buffers | `studio/src/lib/graphRendererPayload.js` (65 KB) | Construit `buildRenderGraphBuffers`/`buildStyleBuffers` + choisit le layout via l'API package. Adaptateur (à adapter). |
| Wrapper serveur buffers | `src/studio-render-buffers.ts` (191 l.) | Enveloppe côté build les builders du package. Bridge. |
| Binding Svelte du renderer | `studio/src/components/GraphCanvas.svelte` (`createGraphRenderer`), `TypeShapeGlyph.svelte` (`shapeSvgPath`) | Pont framework — **adaptateur-DS** (déjà un adaptateur Svelte séparé existe : commit récent `geo-svelte`). |
| Benchmark buffers | `packages/graph/bench/buffers-bench.mjs` | 100k/200k. Réutilisable. |
| Harnais golden | `packages/graph/tests/golden/` (CDP, preflight WebGL, diff/png, fixtures) | Réutilisable comme socle de test visuel. |

---

## 4. Bibliothèque réutilisable (rapatrier) VS logique produit graphify (garder)

### À RAPATRIER (bibliothèque générique de graphe/rendu)
- **Tout `packages/graph`** (renderer, WebGL, géométrie, layouts géométriques, registry, labels git-flow, contrats, styles, buffers).
- `src/graph-layout.ts` (moteur force Barnes-Hut) — **moteur générique**.
- `src/hierarchy-layout.ts` (moteur hierarchy-aware) — **moteur générique**.
- `studio/src/lib/{layoutWorker,forceLayoutClient}.js` (exécution off-thread) — **moteur/interaction**.
- `studio/src/lib/renderBackend.js` — **interaction / adaptateur**.
- Bench + harnais golden.

### À ADAPTER (wiring/adaptateurs — logique de colle, pas produit métier)
- `src/scene-layout.ts` (sélection de layout build-time).
- `studio/src/lib/graphRendererPayload.js` (scène→buffers).
- `src/studio-render-buffers.ts` (bridge serveur).
- `GraphCanvas.svelte` / bindings framework.
- `src/typed-layer-layout.ts` (shim déprécié — à supprimer post-migration).

### À GARDER dans graphify (logique produit)
- **Ingestion/extraction** : `src/{extract,extract-git,extract-gh,ingest,detect,detect-changes,pdf-ocr*,pdf-preflight,transcribe,image-*,office-guard,repo-clone,input-scope,configured-dataprep}.ts`.
- **Connaissance/ontologie** : `src/{ontology-*,entity-linking,entity-normalizer,node-descriptions,wiki-*,community-*,cluster,graph-communities,hyperedges,scene-hierarchies*,ontology-hierarchies,semantic-*}.ts`.
- **Evidence/citations** : `src/{citations,cite-grounding,cited-source-refs,citation-policy,source-grounding,converted-provenance}.ts`.
- **Retrieval** : `src/retrieval/{bm25,ppr,rrf,query,answer-pack,edge-weight}.ts`.
- **Stockage** : `src/storage/{neo4j,postgres,spanner,file,registry,config,types}.ts` + `vector/{pgvector,registry,types}.ts`.
- **Orchestration/pipeline** : `src/{pipeline,flows,build,cli,serve,watch,hooks,lifecycle,analyze,report,export,validate,recommend,summary}.ts`.
- **LLM / profils / agent-stats** : `src/{llm-*,direct-llm-extract,provider-registry,profile-*}.ts`, `src/agent-stats/*`.
- **Export/scène produit** : `src/{studio-scene,studio-export,studio-assets,portable-artifacts}.ts`, `studio/src/lib/graphAdapter.js` (mapping `graph.json`→scène, spécifique produit).
- **Workspace UI graphify** : `src/workspace/*`.

### Zone grise (dépendance produit, math générique)
- `layout-gitflow.ts` / `gitflow-labels.ts` : la **math de layout git-graph est générique** (dans le package), mais elle est **alimentée par le modèle project-graph d'agent-stats** (types `Commit/Branch/Session`, relations `commit-parent`…). Rapatrier la math ; le producteur de scène reste produit.

---

## 5. Dépendances tierces présentes (avec licence) — sans jugement

### `packages/graph` : **ZÉRO dépendance runtime**. Dev seulement :
| Paquet | Version | Licence | Usage |
|---|---|---|---|
| `@napi-rs/canvas` | ^1.0.0 | MIT (*non résolu dans l'arbre, `unverified`*) | Rendu Canvas hors-navigateur (golden) |
| `ws` | ^8.18.0 | MIT (vérifié) | WebSocket harnais CDP golden |

### Racine graphify — deps liées au graphe/processing (runtime)
| Paquet | Version | Licence (vérifiée node_modules) | Rôle | Lié au renderer/layout ? |
|---|---|---|---|---|
| `graphology` | ^0.26.0 | MIT | Structure de données graphe | NON (produit : cluster/retrieval) |
| `graphology-communities-louvain` | ^2.0.1 | MIT | Détection de communautés Louvain | NON (produit) |
| `graphology-metrics` | ^2.1.0 | MIT | Métriques de graphe | NON (produit) |
| `graphology-shortest-path` | ^2.1.0 | MIT | Plus courts chemins | NON (produit : retrieval/PPR) |
| `graphology-types` | ^0.24.7 | MIT | Types | NON |

### Moteurs de layout tiers recherchés : **ABSENTS**
Grep `package-lock.json` : **aucun** `d3` / `d3-force`, `elkjs`/`elk`, `dagre`, `cola`/`webcola`, `cytoscape`, `viz.js`/`graphviz`/`@hpcc-js/wasm`, `ngraph`. ⇒ **Le moteur force est écrit à la main (Barnes-Hut maison), pas une lib tierce.** `graphAdapter.js` note explicitement « No DOM, no d3 ».

### `studio/` (SPA Svelte) — deps notables
| Paquet | Version | Licence | Rôle |
|---|---|---|---|
| `svelte` | ^5.53.2 | MIT | Framework SPA |
| `@lucide/svelte` | ^0.562.0 | ISC | Icônes |
| `pdfjs-dist` | ^4.10.38 | Apache-2.0 | Rendu PDF (viewer sources) |
| `@sentropic/cited-source-viewer` | ^0.2.0 | scope privé Sentropic | Viewer sources citées |
| `@sentropic/design-system-svelte` / `-themes` / `-tokens` | — | scope Sentropic | DS (déjà Sentropic) |

---

## 6. Tableau de synthèse migration (par capacité)

| Capacité | Package/export | Origine (SHA) | Consommateurs | Deps (licence) | Framework | Moteur | Maturité | Tests | Doc | Publication | Destination DS proposée | Décision |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Renderer graphe (Canvas2D+WebGL2) | `@sentropic/graph` `createGraphRenderer` | pkg `0ed0fc76` | studio `GraphCanvas.svelte`, tests studio-render-buffers/picking | 0 runtime | agnostique | Canvas2D + WebGL2 instancié | élevée | oui (unit+golden) | README/FEATURES | npm public 0.2.0 | **moteurs (rendu)** | **rapatrier** |
| Contrats scène/rendu/layout | `@sentropic/graph` `types.ts` | pkg `0ed0fc76` | tout le package + studio | 0 | agnostique | — | élevée | via consommateurs | — | npm 0.2.0 | **contrats-noyau** | **rapatrier** |
| Buffers/styles/positions/edge-geometry | `buildRenderGraphBuffers`, `buildStyleBuffers`, `positions.*`, `buildEdgePolylinePositions` | pkg `0ed0fc76` | graphRendererPayload.js, studio-render-buffers.ts | 0 | agnostique | CPU typed-arrays | élevée | oui | FEATURES | npm 0.2.0 | **scène-géométrie** | **rapatrier** |
| Géométrie glyphes (SVG/2D/GL) | `shape-geometry.ts`, `render-geometry.ts`, `mat4.ts` | pkg `0ed0fc76` | renderer, webgl-*, studio rail glyphs | 0 | agnostique | CPU | élevée | oui | — | npm 0.2.0 | **scène-géométrie** | **rapatrier** |
| Renderers WebGL2 (shapes/edges/boxes+text) | `createWebGL{Shape,Edge,Box}Renderer` | pkg `0ed0fc76` | renderer.ts | 0 | agnostique | WebGL2 | moyenne (canari interne) | oui (golden webgl) | headers | npm 0.2.0 | **moteurs (rendu)** | **rapatrier** |
| Registre de layouts | `layout-registry.ts` | pkg | studio graphRendererPayload.js | 0 | agnostique | — | élevée | oui | headers | npm 0.2.0 | **moteurs (layout)** | **rapatrier** |
| Layouts géométriques (typed-layer, time-oriented, grid, radial, metro) | cores dans pkg | pkg | scene-layout.ts, payload | 0 | agnostique | déterministe O(n) | élevée | oui | headers | npm 0.2.0 | **moteurs (layout)** | **rapatrier** |
| Layout git-flow + labels | `layout-gitflow.ts`, `gitflow-labels.ts` | pkg | agent-stats scene builder | 0 | agnostique | déterministe | moyenne/élevée | oui (+golden) | SPEC headers | npm 0.2.0 | **moteurs (layout)** + **dataviz** | **rapatrier (math) ; producteur = produit** |
| **Moteur force Barnes-Hut FA2** | `src/graph-layout.ts` `computeLayout`/`attachLayoutPositions` | `315ade69` | scene-layout.ts, layoutWorker.js, forceLayoutClient.js | 0 | agnostique (TS pur) | **Barnes-Hut maison** | élevée | oui (`graph-layout.test.ts`) | header riche | **non publié** (hors pkg) | **moteurs (layout)** | **rapatrier** |
| Moteur hierarchy-aware | `src/hierarchy-layout.ts` `computeHierarchyAwarePositions` | `b4d0e020` | scene-layout.ts | 0 | agnostique | déterministe O(n) | moyenne | `unverified` (à confirmer) | header riche | non publié | **moteurs (layout)** | **rapatrier** |
| Sélection layout build-time | `src/scene-layout.ts` | `e976bbe8` | studio-export/scene | dépend `@sentropic/graph` | Node | wiring | moyenne | `unverified` | header | non publié | **processing** | **adapter** |
| Layout off-thread (worker+client) | `studio/src/lib/{layoutWorker,forceLayoutClient}.js` | `unverified` (studio) | GraphCanvas / re-solve | alias `@graphify/graph-layout` | Web Worker | Barnes-Hut | moyenne | `forceLayoutClient.test.js` | header | non publié | **moteurs / interaction** | **rapatrier** |
| Sélection backend + fallback WebGL2 + overlay | `studio/src/lib/renderBackend.js` | `unverified` | GraphCanvas.svelte | 0 (API pkg) | agnostique (util) | — | moyenne | testé (mock) | header | non publié | **interaction / adaptateurs-DS** | **rapatrier/adapter** |
| Adaptateur scène→buffers | `studio/src/lib/graphRendererPayload.js` | `unverified` | GraphCanvas | API pkg | JS | — | moyenne | studio tests | — | non publié | **adaptateurs-DS** | **adapter** |
| Mapping graph.json→scène | `studio/src/lib/graphAdapter.js`, `src/studio-scene.ts` | `unverified` | studio/export | graphology (produit) | — | — | élevée | oui | header | non publié | **domaines (produit)** | **laisser** |
| Ingestion/ontologie/citations/retrieval/storage/pipeline | `src/**` (voir §4) | divers | CLI graphify | graphology, ai-sdk, tree-sitter, pg, neo4j… | Node | — | élevée | oui | README/ARCH | `@sentropic/graphify` 0.17.2 | **domaines / processing (produit)** | **laisser** |

---

## 7. Points d'attention pour le rapatriement

1. **`@sentropic/graph@0.2.0` est déjà npm-public et zéro-dep** → rapatriement « propre » possible tel quel ; attention : publication **manuelle non-CI** (dette récurrente documentée dans `PUBLISHING.md`, cf. régression #238 du vendoring).
2. **Le moteur force n'est PAS dans le package** : `src/graph-layout.ts` (racine graphify) est le vrai moteur, exposé aux consommateurs studio via l'alias build `@graphify/graph-layout` (aucun package npm derrière). À rapatrier explicitement — sinon le registre `force` reste un passthrough vide côté DS.
3. **Aucune lib de layout tierce** (d3/elk/dagre/cola/cytoscape/graphviz absents) : tout le calcul de position est maison et déterministe → pas de licence tierce à traiter côté layout ; seul `graphology` (MIT) est tiers, mais côté **produit** (communautés/retrieval), pas côté rendu.
4. **`graphology*` reste produit** (clustering/retrieval), à NE PAS confondre avec la couche rendu/layout à rapatrier.
5. `hierarchy-layout.ts` et `scene-layout.ts` : présence de tests **`unverified`** (non confirmée dans ce passage) — à vérifier avant migration.
6. Origines `studio/src/lib/*` marquées `unverified` (SHA d'origine non extraits ce passage) — à compléter via `git log --reverse` par fichier si nécessaire.
