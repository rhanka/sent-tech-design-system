# SPEC EVOL — GD-M2-WORKERS : sortir le calcul du fil principal, sans servir un résultat périmé

Statut : cadrage, 2026-09-24.
Programme : [étude](SPEC_STUDY_GRAPH_DATAVIZ_REPATRIATION.md), [plan](../plan/10-BRANCH_graph-dataviz-repatriation.md),
[processing](SPEC_EVOL_GD_M2_PROCESSING.md), [noyau sémantique](SPEC_EVOL_GD_M2_MODEL.md).
Cible : une PR vers `main`, branche `feat/gd-m2-workers`.

## 1. Constat (vérifié le 2026-09-24)

- Depuis #77, `@sentropic/graph/processing` calcule réellement une mise en page : `computeLayout` mesuré à
  **26 ms pour 100 nœuds, 297 ms pour 1 000, 1 884 ms pour 5 000 et 11 490 ms pour 20 000** (deux arêtes
  par nœud, Node 22). À cette échelle, un calcul sur le fil principal gèle l'interface pendant onze secondes.
- Le paquet ne contient **aucun worker** : la seule mention est un commentaire de `processing/graph-layout.ts`
  annonçant « reused by the runtime Web Worker for on-demand re-layout (P2) ».
- L'amont en a un, mais minimal, et **ce lot n'est donc pas un rapatriement** : `studio/src/lib/layoutWorker.js`
  fait 20 lignes (un `onmessage`, un `try/catch`, un `postMessage`) et `studio/src/lib/forceLayoutClient.js`
  85 lignes (une `Map` de requêtes en attente indexée par `id`, `new Worker(new URL(…), { type: "module" })`,
  repli synchrone quand `Worker` est absent, `terminate()` sur erreur). Il n'y a **ni version de snapshot,
  ni annulation, ni rejet de résultat périmé** — les propriétés que le plan demande. Deux de ces absences sont
  des défauts, mesurés en revue : `terminateForceWorker()` détruit le worker et vide sa `Map` **sans rejeter**
  les promesses en vol, qui restent éternellement non résolues ; et une réponse périmée **résout quand même sa
  promesse**, si bien qu'un appelant qui redemande reçoit les deux réponses dans l'ordre d'arrivée sans pouvoir
  distinguer la périmée. L'`id` amont est une identité de requête, pas une version d'instantané. L'amont
  importe d'ailleurs `@graphify/graph-layout`, pas `@sentropic/graph`.
- Le sous-chemin `processing` est garanti **sans DOM** par trois gardes — mais elles n'interdisent que
  `document`, `window` et `navigator`, et `packages/graph/tsconfig.json` inclut déjà `DOM` dans `lib`. Un
  module référençant `Worker` derrière un `typeof Worker !== "undefined"` y passerait donc les gardes telles
  quelles : la contrainte technique que la première version de ce cadrage invoquait **n'existe pas** (mesuré
  en revue).

## 2. Décision de découpage (réversible, prise ici)

Deux nouveaux sous-chemins, parce que les deux moitiés n'ont pas le même environnement :

- **`@sentropic/graph/worker`** : le point d'entrée exécuté *dans* le worker. Il parle `self.onmessage` et
  `self.postMessage`, importe le calcul depuis `processing`, et ne touche à rien d'autre.
- **`@sentropic/graph/layout-client`** : l'appelant. Il crée le worker quand `Worker` existe, retombe sur le
  calcul synchrone sinon (SSR, jsdom, Node), et expose une API qui ne dit pas laquelle des deux voies a servi.

Le motif du découpage n'est donc pas une impossibilité technique, c'est que le client fait
`new Worker(new URL("./worker.js", import.meta.url))` et **émet une référence d'actif visible de
l'empaqueteur**, qu'une entrée de calcul pur n'a pas à porter. Pour que la frontière soit appliquée et pas
seulement affirmée, la garde de `processing` est **étendue pour y interdire `Worker`** ; sans cela rien
n'empêcherait un client de revenir s'y glisser. Elle ne s'étend pas aux deux nouveaux sous-chemins ; en
revanche un test assère que **ni l'un ni l'autre n'importe le rendu** (`renderer.ts`, `webgl-*.ts`), et que
`processing` n'importe ni l'un ni l'autre — la dépendance va du client vers le calcul, jamais l'inverse.

## 3. Travail demandé

### 3.1 Le protocole, versionné par snapshot

Une requête porte `{ snapshotId, version, nodes, edges, options }`. `snapshotId` identifie le graphe d'entrée,
`version` est un entier croissant par `snapshotId`. Le worker répond `{ snapshotId, version, positions }` ou
`{ snapshotId, version, error }`.

Invariants, chacun testé :

1. **Rejet du périmé** : un résultat dont la `version` est inférieure à la dernière version demandée pour ce
   `snapshotId` est **écarté par le client**, pas transmis à l'appelant. C'est la propriété qui manque à
   l'amont et qui, à 11 s de calcul, décide ce que l'utilisateur voit.
2. **Annulation** : demander une nouvelle version pour un `snapshotId` annule les précédentes ; une annulation
   explicite existe aussi. Une requête annulée ne résout ni ne rejette l'appelant avec une erreur — elle est
   close comme annulée, ce que le type de retour rend explicite.
3. **Un seul worker** pour toutes les requêtes, réutilisé ; `terminate()` sur erreur de worker, puis repli
   synchrone pour les requêtes suivantes plutôt que des échecs en série.
4. **Égalité des deux voies** : pour les mêmes entrées, la voie worker et la voie synchrone produisent des
   positions **identiques à l'octet** sur la sérialisation du `Float32Array`. Le déterminisme démontré en #77
   n'a de valeur que si le passage par worker ne l'altère pas.
5. **Aucune promesse de progression dans ce lot**, pour la raison mesurée en revue et non celle que la
   première version donnait. Un point d'observation **existe** sans toucher la copie gelée :
   `computeLayout` accepte `iterations` et `initialPositions`, donc un appelant peut découper le calcul en
   tranches et rapporter entre elles. Mais le découpage **ne reproduit pas** le résultat d'un appel unique :
   mesuré sur 200 nœuds, six tranches de 50 itérations contre un appel de 300 donnent un écart maximal de
   **400,6 px**. La progression coûterait donc le déterminisme que ce programme protège depuis #77. C'est ce
   qui la disqualifie, pas l'absence d'un point de rappel.

### 3.2 Résolution du worker dans le paquet publié

C'est l'exigence la plus facile à manquer : un worker qui marche en développement et pas depuis le tarball.

- La forme retenue est `new Worker(new URL("./worker.js", import.meta.url), { type: "module" })`, celle que les
  empaqueteurs savent réécrire, et celle de l'amont.
- Le manifeste expose le sous-chemin `./worker` dans `exports`, et le fichier construit est présent dans le
  tarball : le vérifieur de `pack:smoke` pour `@sentropic/graph` l'exige explicitement, comme il exige déjà
  `processing`.
- Un test importe le sous-chemin **depuis le tarball** et vérifie que l'URL du worker se résout.

### 3.3 Mesures à consigner

Temps mural perçu par l'appelant, voie worker et voie synchrone, à 1 000, 5 000 et 20 000 nœuds ; nombre de
résultats écartés comme périmés dans un scénario de trois demandes rapprochées ; et le surcoût de sérialisation
du passage de messages, mesuré et non estimé.

## 4. Hors périmètre

Le rapport de progression (§3.1.5), les workers pour le rendu, `GD-M2-CANVAS`, `GD-M2-DS-PRESENTATION`, toute
modification d'une copie à provenance, et toute publication npm.

## 5. Critères d'acceptation (tous exécutés et consignés)

1. **Périmètre** : le diff ne touche que `packages/graph/**`, `scripts/smoke-pack*`, `spec/**`, `plan/**`,
   `docs/graph-dataviz-*` et `.track/**` via Track. Les **copies à provenance restent inchangées**, et les
   **nouveaux fichiers locaux reçoivent leur entrée `local-*`** au registre : sans cette précision, ce critère
   rendrait le critère 2 insatisfaisable, puisque tout fichier suivi de `packages/graph/**` dépourvu d'entrée
   fait échouer le vérifieur.
2. **Portes** : `npm ci`, `npm run build`, `npm run check`, `npm test`, `npm run licensing:check`,
   `npm run pack:smoke`, `node --test scripts/*.test.mjs`, `node tools/graph-dataviz-provenance/verify.mjs`.
3. **Racine publique inchangée** : le test de ligne de base des exports racine reste vert, et les deux nouveaux
   sous-chemins ne sont pas réexportés par la racine.
4. **Rejet du périmé** : un test enchaîne trois versions d'un même `snapshotId` et assère que l'appelant ne
   reçoit que la dernière, les deux autres étant écartées avec la raison.
5. **Annulation** : un test annule une requête en vol et assère qu'elle se clôt comme annulée, sans erreur.
6. **Repli** : un test dans un environnement sans `Worker` assère que le calcul a lieu et que l'appelant ne
   peut pas distinguer la voie ; un test assère qu'une erreur de worker termine le worker et bascule les
   requêtes suivantes sur le repli.
7. **Égalité des voies** : positions identiques à l'octet entre worker et synchrone, sur au moins deux tailles.
8. **Tarball** : `pack:smoke` importe `@sentropic/graph/worker` et `@sentropic/graph/layout-client` depuis le
   tarball, et le vérifieur exige leurs fichiers.
9. **Sens des dépendances** : un test assère que `processing` n'importe ni le client ni le worker, et que ni le
   client ni le worker n'importe le rendu.
10. **Mesures** : celles du §3.3 dans le corps de la PR, avec la machine et la version de Node.
11. **Forme** : commits en anglais avec corps mesuré ; aucun trailer d'attribution ; aucun Python.

## 6. Inconnues et risques

- **Le coût de sérialisation peut annuler le gain** aux petites tailles : passer 1 000 nœuds dans un message
  puis recevoir un `Float32Array` n'est pas gratuit. Le §3.3 le mesure ; si le worker est plus lent en dessous
  d'un seuil, le client doit choisir la voie synchrone sous ce seuil, et le seuil est une valeur mesurée
  inscrite dans le code, pas devinée.
- **Un `Float32Array` transférable** évite une copie mais vide le tampon source. Si le transfert est retenu, il
  doit être testé contre une réutilisation accidentelle du tampon côté worker.
- **Les environnements de test** : jsdom n'a pas de `Worker` utilisable et Node en a un différent
  (`worker_threads`). Le lot doit dire lequel il couvre et lequel il déclare hors mesure, plutôt que de laisser
  croire à une couverture universelle.
