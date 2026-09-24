# SPEC EVOL — GD-M2-PROCESSING : rapatrier le calcul de mise en page dans `@sentropic/graph`

Statut : cadrage, 2026-09-24.
Programme : [étude](SPEC_STUDY_GRAPH_DATAVIZ_REPATRIATION.md), [décisions](SPEC_DECISIONS_GRAPH_DATAVIZ_REPATRIATION.md),
[plan](../plan/10-BRANCH_graph-dataviz-repatriation.md), [M1](SPEC_EVOL_GD_M1_MERGE.md), [M2-MODEL](SPEC_EVOL_GD_M2_MODEL.md).
Cible : une PR vers `main`, branche `feat/gd-m2-processing`.

## 1. Constat (vérifié le 2026-09-24)

- Dans `@sentropic/graph` 0.3.0, l'identifiant de mise en page `"force"` est un **passe-plat** :
  `layout-registry.ts:150` renvoie les positions déjà cuites (`forceLayout`), et le commentaire du
  fichier le dit — « the deterministic Barnes-Hut FA2 force layout runs off the render path ».
  Le paquet publié ne sait donc pas calculer une mise en page de force.
- Le calcul réel vit en amont, dans `rhanka/graphify` à `8f19554c` :
  `src/graph-layout.ts` (433 lignes, FA2 Barnes-Hut, `computeLayout`, `defaultLayoutIterations`,
  `fastLayoutEnabled`, `attachLayoutPositions`), `src/hierarchy-layout.ts` (506 lignes,
  `computeHierarchyAwarePositions`), `src/scene-layout.ts` (292 lignes, assemblage),
  avec `tests/graph-layout.test.ts` (263 lignes) et `tests/scene-hierarchy-aware-layout.test.ts`.
- Les mises en page déjà présentes côté DS (`layout-grid`, `layout-metro`, `layout-radial`,
  `layout-gitflow`, `typed-layer`, `time-oriented`) ont leurs suites dans `packages/graph/tests/`.
- Contrat de sortie actuel : `LayoutFn = (graph: RenderGraphBuffers, options?) => PositionFrame`
  (`layout-registry.ts:41`), `PositionFrame` = `{ positions: Float32Array, ...meta }`.
- Collision de noms à traiter : graphify exporte déjà une interface `LayoutResult`
  (`src/graph-layout.ts:58`) dont la forme n'est pas celle visée ici.

## 2. Travail demandé

### 2.1 Déplacement avec provenance

Copier les trois modules et leurs tests dans `packages/graph/src/processing/` et
`packages/graph/tests/processing/`, **sans changement de comportement**, et enregistrer leur
provenance (dépôt, commit, chemin d'origine, sha256) comme M1 l'a fait pour les six paquets :
`node tools/graph-dataviz-provenance/verify.mjs` doit couvrir les nouveaux fichiers et rester à
zéro écart. Toute adaptation nécessaire est nommée et justifiée fichier par fichier
(`adapted-*`), sur le modèle de M1.

### 2.2 Sous-chemin sans DOM

`packages/graph/src/processing/` n'importe ni `renderer.ts`, ni `webgl-*.ts`, ni aucune API DOM.
Exposer un sous-chemin public `@sentropic/graph/processing` (`exports` du manifeste) ; la racine
publique du paquet reste **inchangée** depuis M1 : aucun export retiré, aucun renommé.
Un test échoue si un module de `processing/` importe le rendu, et un test importe le sous-chemin
dans Node sans jsdom.

### 2.3 Registre : le passe-plat reste le défaut

- `DEFAULT_LAYOUT_ID = "force"` garde **exactement** son comportement actuel (passe-plat des
  positions cuites) : des consommateurs en dépendent, et changer le défaut serait une rupture
  silencieuse.
- Le calcul FA2 est enregistré sous un identifiant explicite (`"force-fa2"`) et la mise en page
  hiérarchique sous `"hierarchy-aware"`, tous deux documentés dans l'en-tête du registre.
- `resolveLayout` continue de ne jamais lever : un identifiant inconnu dégrade vers le défaut.

### 2.4 Résultats riches, compatibilité `PositionFrame`

Introduire `LayoutOutcome` : `{ frame: PositionFrame, nodes?, groups?, ports?, constraints?,
inverse? }` où `inverse` est la correspondance origine → index de projection → résultat.
`LayoutFn` accepte désormais `PositionFrame | LayoutOutcome` en retour ; `toPositionFrame(x)`
normalise. Tous les appelants existants, qui attendent un `PositionFrame`, continuent de
fonctionner sans modification : c'est un critère d'acceptation, pas un espoir. Le nom
`LayoutResult` de graphify n'est pas repris tel quel ; s'il est copié, il est renommé
localement et la raison est consignée.

### 2.5 Déterminisme et limites

- Même graine et mêmes entrées → mêmes positions, à l'octet sur la sérialisation du `Float32Array`.
- Le nombre d'itérations par défaut (`defaultLayoutIterations`) et l'interrupteur
  `fastLayoutEnabled()` sont documentés avec leur effet mesuré ; si `fastLayoutEnabled` lit une
  variable d'environnement, ce couplage est rendu explicite (paramètre d'options prioritaire sur
  l'environnement) et testé.
- Mesures à consigner dans la PR : temps de `computeLayout` à 100, 1 000, 5 000 et 20 000 nœuds,
  et l'écart avec la ligne de base mesurée dans graphify au même commit.

## 3. Hors périmètre

Les workers (`GD-M2-WORKERS`), le noyau sémantique (`GD-M2-MODEL`), le canevas, les codecs.
**Aucune modification de `rhanka/graphify`** : l'adoption par l'amont (retirer ses copies locales,
passer sa plage `@sentropic/graph` de `^0.2.0` — incompatible avec 0.3.0 — à la version publiée)
relève de `GD-M6-SENTROPIC` et suppose une publication, donc un geste du propriétaire.

## 4. Critères d'acceptation (tous exécutés et consignés)

1. **Périmètre** : le diff ne touche que `packages/graph/**`, `tools/graph-dataviz-provenance/**`,
   `spec/**`, `plan/**`, `docs/graph-dataviz-*`, `.track/**` via Track.
2. **Portes** : `npm ci`, `npm run build`, `npm run check`, `npm test`, `npm run licensing:check`,
   `npm run pack:smoke` — exit 0. Le vérifieur `pack-smoke` de `@sentropic/graph` couvre le nouveau
   sous-chemin (import depuis le tarball, pas depuis la source).
3. **Lignes de base** : les suites copiées de graphify passent avec le même nombre de tests qu'à la
   source (`tests/graph-layout.test.ts` et la suite hiérarchie), comptes avant/après dans la PR.
   Un échec pour raison étrangère est consigné, pas contourné, et la PR le porte explicitement.
4. **Provenance** : `verify.mjs` à zéro écart, nouveaux fichiers inclus.
5. **Racine publique inchangée** : un test compare la liste des exports du barrel racine à celle de
   `main` et échoue sur toute suppression ou renommage.
6. **Sans DOM et sans rendu** : les deux tests du §2.2 sont verts.
7. **Compatibilité** : un test appelle `getLayout("force")` et les six mises en page existantes avec
   le code appelant d'aujourd'hui, et vérifie que le retour reste un `PositionFrame` exploitable ;
   un test vérifie `toPositionFrame` sur un `LayoutOutcome`.
8. **Déterminisme** : deux exécutions successives et deux processus distincts produisent la même
   sérialisation ; un test nomme la graine.
9. **Mesures** : les temps du §2.5 figurent dans le corps de la PR, avec la machine et la version de Node.
10. **Forme** : commits en anglais avec corps mesuré ; aucun trailer d'attribution ; aucun Python.

## 5. Inconnues et risques

- **Frontière du calcul** : si `graph-layout.ts` importe des modules graphify hors mise en page
  (journalisation, configuration produit), le port s'arrête et consigne au lieu d'embarquer un
  morceau d'application dans une bibliothèque.
- **Poids du paquet** : FA2 et la hiérarchie ajoutent ~1 200 lignes au paquet ; le sous-chemin évite
  de les charger pour un consommateur qui ne fait que rendre. À vérifier par la taille du tarball
  avant/après, consignée dans la PR.
- **Dérive amont** : graphify garde ses copies jusqu'à M6 ; jusque-là deux exemplaires coexistent.
  La provenance et le hash sont ce qui rend la divergence détectable.
