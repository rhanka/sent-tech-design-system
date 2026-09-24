# SPEC EVOL — GD-M2-PROCESSING : rapatrier le calcul de mise en page dans `@sentropic/graph`

Statut : cadrage, 2026-09-24 ; révisé le même jour après revue adversariale croisée (trois bloquants corrigés).
Programme : [étude](SPEC_STUDY_GRAPH_DATAVIZ_REPATRIATION.md), [décisions](SPEC_DECISIONS_GRAPH_DATAVIZ_REPATRIATION.md),
[plan](../plan/10-BRANCH_graph-dataviz-repatriation.md), [M1](SPEC_EVOL_GD_M1_MERGE.md), [M2-MODEL](SPEC_EVOL_GD_M2_MODEL.md)
(ce dernier arrive avec la PR #68 ; le lien est mort tant qu'elle n'est pas fusionnée).
Cible : une PR vers `main`, branche `feat/gd-m2-processing`.

## 1. Constat (vérifié le 2026-09-24, ligne par ligne)

- Dans `@sentropic/graph` 0.3.0, l'identifiant `"force"` est un **passe-plat** :
  `layout-registry.ts:150` est `export const forceLayout: LayoutFn = (graph) =>` suivi de
  `copyPositions(graph.positions, graph.nodeIds.length)`. L'en-tête du fichier le dit (ligne 13) :
  « `"force"` — the DEFAULT. Passthrough of the already-baked positions (the deterministic
  Barnes-Hut FA2 force layout runs OFF this path — `src/graph-layout.ts` …) ». Le paquet publié ne
  sait donc pas calculer une mise en page de force.
- **Contrat de sortie réel** : `layout-registry.ts:41` est
  `export type LayoutFn = (graph: RenderGraphBuffers, options?: LayoutOptions) => Float32Array;`.
  `PositionFrame` (`types.ts:194`) n'apparaît **pas** dans `LayoutFn` : il n'est produit que par
  `createLayoutEngine` (`layout-registry.ts:134-135`, `yield createPositionFrame(fn(graph, options), …)`).
  Les **sept** identifiants enregistrés (`layout-registry.ts:430-436` : `force`, `typed-layer`,
  `time-oriented`, `git-flow`, `radial`, `grid`, `metro`) rendent tous un `Float32Array`.
- Le calcul réel vit en amont, dans `rhanka/graphify` (`origin/main`, fichiers identiques à
  `8f19554c` — voir §2.1) : `src/graph-layout.ts` (433 lignes : `computeLayout` l.242,
  `defaultLayoutIterations` l.223, `fastLayoutEnabled` l.388, `attachLayoutPositions` l.410),
  `src/hierarchy-layout.ts` (506 lignes, `computeHierarchyAwarePositions` l.283),
  `src/scene-layout.ts` (292 lignes), avec `tests/graph-layout.test.ts` (263 lignes) et
  `tests/scene-hierarchy-aware-layout.test.ts` (266 lignes).
- **Signatures amont, mesurées** — elles ne sont pas celles de `LayoutFn` :
  - `computeLayout(nodes: { id, fx?, fy? }[], edges: { source, target }[], options) => LayoutResult[]`,
    résultat indexé par `id` et non par ordre de nœud ; `LayoutResult` (`src/graph-layout.ts:58`) est
    `{ id; x; y }`.
  - `computeHierarchyAwarePositions(nodes, hierarchies, options) => HierarchyAwareLayoutResult`, dont
    les positions sont un **`Float64Array`**, avec un second argument `hierarchies` obligatoire que
    `LayoutOptions` ne transporte pas.
  - Côté DS, `RenderGraphBuffers` (`types.ts:88-97`) porte `nodeIds`, `idToIndex`, `positions`
    (`Float32Array`) et `edges` (`Uint32Array`).
- **Graine** : `ComputeLayoutOptions` (`src/graph-layout.ts:37-56`) n'a **aucun champ `seed`** ; la
  graine est dérivée en interne par `stableSeed(ids triés)` (FNV-1a, l.65) puis `mulberry32` (l.259).
  À l'inverse, `LayoutOptions` du DS porte `seed?: string | number` (`types.ts:202`), qu'aucune de ces
  fonctions ne lit.
- **Aucun code applicatif à embarquer** (mesuré, ce n'est plus un risque) : `graph-layout.ts` et
  `hierarchy-layout.ts` n'ont **zéro** ligne d'`import` ; `scene-layout.ts` n'importe que
  `./graph-layout.js`. Un seul couplage d'environnement : `fastLayoutEnabled()` lit
  `process.env.GRAPHIFY_FAST_LAYOUT` (l.388-394), consulté par `attachLayoutPositions` quand
  `options.iterations` est absent (l.418).
- Les six autres mises en page du DS ont leurs suites dans `packages/graph/tests/`
  (`layout-grid`, `layout-metro`, `layout-radial`, `layout-gitflow`, `layout-typed-layer`,
  `layout-time-oriented`).

## 2. Travail demandé

### 2.1 Déplacement avec provenance

Copier les trois modules et leurs tests dans `packages/graph/src/processing/` et
`packages/graph/tests/processing/`, **sans changement de comportement**, et enregistrer leur
provenance (dépôt, commit, chemin d'origine, sha256) comme M1 l'a fait pour les six paquets :
`node tools/graph-dataviz-provenance/verify.mjs` doit couvrir les nouveaux fichiers et rester à zéro
écart (il rend aujourd'hui `provenance OK: 738 entries, 738 tracked files covered`).

**Ancrage** : épingler le commit `origin/main` de graphify au moment de la copie, pas `8f19554c`
(qui n'est pas sur `main` : 140 commits de retard, accessible seulement via
`origin/chore/point-to-design-system`). Les quatre fichiers concernés y sont octet pour octet
identiques à `main` — l'équivalence est consignée dans la provenance.

### 2.2 Sous-chemin sans DOM

`packages/graph/src/processing/` n'importe ni `renderer.ts`, ni `webgl-*.ts`, ni aucune API DOM.
Exposer un sous-chemin public `@sentropic/graph/processing` (`exports` du manifeste, qui ne porte
aujourd'hui que `"."`) ; la racine publique reste **inchangée** depuis M1 : aucun export retiré,
aucun renommé. Un test échoue si un module de `processing/` importe le rendu ; un test importe le
sous-chemin dans Node sans jsdom.

### 2.3 Registre : le passe-plat reste le défaut

- `DEFAULT_LAYOUT_ID = "force"` garde **exactement** son comportement actuel (passe-plat des
  positions cuites) : des consommateurs en dépendent, et changer le défaut serait une rupture
  silencieuse.
- Le calcul FA2 est enregistré sous `"force-fa2"` et la mise en page hiérarchique sous
  `"hierarchy-aware"`, tous deux documentés dans l'en-tête du registre.
- `resolveLayout` continue de ne jamais lever : un identifiant inconnu dégrade vers le défaut.

### 2.4 Module d'adaptation, résultats riches, compatibilité

Les modules amont ne satisfont pas `LayoutFn` (§1). L'adaptation est donc **un module écrit dans ce
dépôt**, `packages/graph/src/processing/register.ts`, hors des copies à provenance (qui restent
octet pour octet) :

- projection `RenderGraphBuffers` → `{ id, fx?, fy? }[]` et `{ source, target }[]` ;
- reprojection de `LayoutResult[]` (indexé par `id`) sur l'ordre de `graph.nodeIds`, avec diagnostic
  explicite pour un `id` absent ou en trop ;
- conversion `Float64Array` → `Float32Array` pour la hiérarchie : **narrowing avec perte**, assumé et
  testé pour lui-même (le critère d'acceptation 8 porte sur la reproductibilité de la sortie
  `Float32Array`, pas sur une égalité avec la sortie 64 bits) ;
- transport de la forêt `hierarchies` que `LayoutOptions` ne porte pas : l'option est ajoutée au type
  d'options du DS ou passée par une signature dédiée à `hierarchy-aware` — la tranche est faite dans
  la PR et justifiée.

`LayoutOutcome` ajoute les résultats riches : `{ positions: Float32Array, nodes?, groups?, ports?,
constraints?, inverse? }` où `inverse` est la correspondance origine → index de projection → résultat.
`LayoutFn` accepte `Float32Array | LayoutOutcome` en retour ; `toPositions(x)` normalise vers
`Float32Array` et `createLayoutEngine` continue d'envelopper le résultat avec `createPositionFrame`.
Le nom `LayoutResult` de graphify n'est pas repris tel quel au barrel : s'il est copié, il reste
local au module de provenance et la raison est consignée.

### 2.5 Déterminisme, graine et limites

- **Graine** : la PR tranche explicitement entre (a) câbler `LayoutOptions.seed` sur la dérivation
  interne (`stableSeed`/`mulberry32`) et (b) documenter que `force-fa2` ignore `seed` et dérive sa
  graine des identifiants triés. Dans les deux cas, un test nomme la valeur effectivement utilisée.
- Mêmes entrées → mêmes positions, à l'octet sur la sérialisation du `Float32Array` rendu, sur deux
  exécutions successives et deux processus distincts.
- `defaultLayoutIterations` et `fastLayoutEnabled()` sont documentés avec leur effet mesuré. La
  variable `GRAPHIFY_FAST_LAYOUT` ne peut pas vivre sous ce nom dans un paquet `@sentropic/*` : la PR
  retient un nom de variable du scope et son repli, ou supprime la lecture d'environnement au profit
  d'une option — la tranche est nommée et testée, et une option explicite prime toujours sur
  l'environnement.
- Mesures à consigner dans la PR : temps de `computeLayout` à 100, 1 000, 5 000 et 20 000 nœuds, et
  l'écart avec la ligne de base mesurée dans graphify au même commit.

## 3. Hors périmètre

Les workers (`GD-M2-WORKERS`), le noyau sémantique (`GD-M2-MODEL`), le canevas, les codecs.
**Aucune modification de `rhanka/graphify`** : l'adoption par l'amont (retirer ses copies locales,
passer sa plage `@sentropic/graph` de `^0.2.0` — incompatible avec 0.3.0, vérifié sur son `main` et
sur `8f19554c` — à la version publiée) relève de `GD-M6-SENTROPIC` et suppose une publication, donc
un geste du propriétaire.

## 4. Critères d'acceptation (tous exécutés et consignés)

1. **Périmètre** : le diff ne touche que `packages/graph/**`, `tools/graph-dataviz-provenance/**`,
   `spec/**`, `plan/**`, `docs/graph-dataviz-*`, `.track/**` via Track. Les *Branch Scope Boundaries*
   du plan autorisent `spec/*GRAPH_DATAVIZ*` mais pas `spec/SPEC_EVOL_GD_M2_*` ni `tools/**` : la PR
   d'implémentation élargit le périmètre du plan explicitement, dans le même commit.
2. **Portes** : `npm ci`, `npm run build`, `npm run check`, `npm test`, `npm run licensing:check`,
   `npm run pack:smoke` — exit 0. Le vérifieur `pack-smoke` de `@sentropic/graph` couvre le nouveau
   sous-chemin (import depuis le tarball, pas depuis la source).
3. **Lignes de base** : les suites copiées de graphify passent avec le même nombre de tests qu'à la
   source (`tests/graph-layout.test.ts`, `tests/scene-hierarchy-aware-layout.test.ts`), comptes
   avant/après dans la PR. Un échec pour raison étrangère est consigné, pas contourné.
4. **Provenance** : `verify.mjs` à zéro écart, nouveaux fichiers inclus, commit amont épinglé sur
   `origin/main`.
5. **Racine publique inchangée** : un test compare la liste des exports du barrel racine à celle de
   `main` et échoue sur toute suppression ou renommage.
6. **Sans DOM et sans rendu** : les deux tests du §2.2 sont verts.
7. **Compatibilité** : un test appelle les **sept** identifiants enregistrés avec le code appelant
   d'aujourd'hui et assère que le retour est un `Float32Array` de longueur `2 * graph.nodeIds.length` ;
   un test vérifie `toPositions` sur un `LayoutOutcome` et `createLayoutEngine` sur les deux formes
   de retour.
8. **Déterminisme** : deux exécutions successives et deux processus distincts produisent la même
   sérialisation du `Float32Array` rendu ; le test nomme la graine effective (§2.5).
9. **Adaptation** : un test par transformation du §2.4 — reprojection par `id`, `id` manquant,
   `id` en trop, narrowing 64→32 bits, transport de `hierarchies`.
10. **Mesures** : les temps du §2.5 figurent dans le corps de la PR, avec la machine et la version de Node.
11. **Forme** : commits en anglais avec corps mesuré ; aucun trailer d'attribution ; aucun Python.

## 5. Inconnues et risques

- **Poids du paquet** : FA2 et la hiérarchie ajoutent ~1 200 lignes ; le sous-chemin évite de les
  charger pour un consommateur qui ne fait que rendre. À vérifier par la taille du tarball
  avant/après, consignée dans la PR.
- **Perte du narrowing 64→32 bits** : la hiérarchie calcule en `Float64Array` ; la sortie du DS est en
  `Float32Array`. La perte est admise, mesurée sur une fixture, et ne doit pas être présentée comme
  une équivalence.
- **Dérive amont** : graphify garde ses copies jusqu'à M6 ; jusque-là deux exemplaires coexistent.
  La provenance et le hash sont ce qui rend la divergence détectable.
