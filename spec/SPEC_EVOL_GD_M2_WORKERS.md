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
   synchrone pour les requêtes suivantes plutôt que des échecs en série. Ce paragraphe ne dit rien de la
   requête **en vol** au moment de l'erreur — trou relevé par l'implémentation. L'amont la rejette ; le lot
   la **recalcule sur la voie synchrone**, puisque l'appelant a demandé des positions et non un thread, et
   qu'un échec à sa place serait exactement le comportement en série que cet invariant proscrit. Le lot ajoute
   par ailleurs **une seule requête en vol par client** : la spec exige un worker réutilisé et ne dit rien de
   la concurrence, or un worker vide sa file séquentiellement, donc poster trois requêtes ferait attendre la
   plus récente derrière deux réponses dont personne ne veut : à 20 000 nœuds ≈ 21 s aux 7 089 ms mesurés par
   l'implémentation, ≈ 34 s aux 11 490 ms que rapporte #77. Une requête périmée avant d'avoir été postée ne
   coûte alors rien.
4. **Égalité des deux voies** : pour les mêmes entrées, la voie worker et la voie synchrone produisent des
   positions **identiques à l'octet** sur la sérialisation du `Float32Array`. Le déterminisme démontré en #77
   n'a de valeur que si le passage par worker ne l'altère pas. Précision de l'implémentation : l'égalité n'est
   démontrable qu'à travers un **vrai** second fil ; dans un seul processus les deux voies exécutent les mêmes
   instructions sur le même tas et ne peuvent pas différer, de sorte qu'un test à double en processus n'atteste
   rien ici.
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
- Les deux nouveaux sous-chemins sont publiés **ESM seulement**, contrairement à `.` et `./processing` qui sont
  doubles depuis M1 — précision de l'implémentation, mesurée : compilé en CJS, esbuild avertit
  (`"import.meta" is not available with the "cjs" output format and will be empty`), écrit
  `var import_meta = {}`, et le module obtenu lève `TypeError [ERR_INVALID_URL]` à
  `new URL("./worker.js", undefined)`. Publier une condition `require` qui lève à l'appel qui compte est pire
  que de ne pas en publier ; un consommateur `require()` utilise le sous-chemin de calcul, qui n'a pas d'URL à
  résoudre.

### 3.3 Mesures à consigner

Temps mural perçu par l'appelant, voie worker et voie synchrone, à 1 000, 5 000 et 20 000 nœuds ; nombre de
résultats écartés comme périmés dans un scénario de trois demandes rapprochées ; et le surcoût de sérialisation
du passage de messages, mesuré et non estimé.

Correction de l'implémentation : « le nombre de résultats écartés » suppose une valeur unique, alors qu'il y en
a **deux** selon le régime, et le lot consigne les deux. Trois demandes dans le **même tick** : deux requêtes
closes comme périmées, dont une avant tout envoi, et **un seul** résultat écarté — un seul calcul gaspillé.
Trois demandes **espacées** (chacune déjà postée quand la suivante arrive, ce que produit un glissement) : deux
requêtes closes et **deux** résultats écartés. Le premier régime n'est bon marché que grâce à la requête unique
en vol du §3.1.3.

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

  **La prémisse est fausse, mesurée** (AMD Ryzen AI MAX+ 395, Node 22.22.1, médiane de 11 par taille, worker
  chaud) : le rapport worker/synchrone du temps mural **ne suit pas la taille du graphe**. Il vaut 1,452 à
  50 nœuds, 1,036 à 100, 1,114 à 200, 1,147 à 250, 0,997 à 300, 1,003 à 400, 1,019 à 500, 1,021 à 600, 1,002 à
  700, 1,018 à 800, 1,042 à 1 000, 1,028 à 1 500 ; une autre exécution du même balayage donne 0,864 / 0,912 /
  0,904 / 0,942 / 1,024 / 0,899 / 0,988 / 1,050 / 1,002 / 0,982 / 1,019 / 0,996 sur les mêmes tailles. Le
  rapport erre donc autour de la parité à ±15 % environ, le plus largement à la plus petite taille, et le côté
  où il tombe est une propriété de l'exécution, pas du nombre de nœuds. Ce que les deux exécutions établissent,
  c'est qu'**il n'existe aucune taille en dessous de laquelle le worker est plus lent de façon reproductible**.

  Le surcoût de frontière existe et ne domine jamais. C'est le chiffre le plus bruité du banc — une différence
  de deux horloges mesurées séparément, calcul ramené à son plancher — donc il est rapporté en min/médiane/max
  sur 15 tirs **appariés** et non en médiane unique : **−0,73 / 0,17 / 4,04 ms à 1 000 nœuds, 2,87 / 8,36 /
  18,61 à 5 000, 15,84 / 27,29 / 41,76 à 20 000**, contre des calculs synchrones de ~190-212 / ~1 333-1 407 /
  ~6 856-7 246 ms. À 1 000 nœuds il peut être négatif, parce que la voie synchrone différée paie le plancher
  de 1 ms de `setTimeout` de Node (1,127 ms mesuré) là où un aller-retour worker chaud coûte 0,021 ms. Une
  exécution indépendante sur machine chargée a relevé 5,54 / 56,09 / 44,78 ms, au-dessus des maxima vus ici à
  5 000 nœuds. Une première rédaction de ce paragraphe citait les médianes d'un seul tir tranquille comme
  « au plus 0,5 % » : c'était un meilleur cas présenté comme un plafond.

  Ce qui **justifie** un seuil est le démarrage unique du fil, que ce paragraphe ne considérait pas : 24,4 ms
  sur une exécution, 23,0-27,7 ms sur cinq clients neufs d'une autre, jusqu'à 31,4 ms entre exécutions, et
  33,4 ms sur la mesure indépendante. Correction minimale retenue : le seuil reste exigé et inscrit dans le
  code, mais fondé sur ce coût de démarrage — **250 nœuds**, la plus petite taille balayée dont le calcul
  synchrone le franchit, et il le franchit de peu : 32,1 ms ici, 32,5 ms sur la deuxième exécution, 34,00 ms
  sur l'indépendante, contre des démarrages de 24,4 / 31,4 / 33,4 ms ; la taille juste en dessous — 200 nœuds,
  24,3-24,7 ms — reste sous le démarrage dans les trois cas. La marge est mince par construction : c'est un
  point d'équilibre, pas une falaise, et rien en aval ne dépend de sa valeur exacte, seulement du fait qu'il
  y en ait un.
- **Un `Float32Array` transférable** évite une copie mais vide le tampon source. Si le transfert est retenu, il
  doit être testé contre une réutilisation accidentelle du tampon côté worker.

  Tranche de l'implémentation : le transfert **n'est pas retenu**, parce que la copie qu'il évite est gratuite.
  Mesuré sur un aller-retour `worker_threads` réel, médiane de 40 : transférer au lieu de copier gagne
  **0,001 ms à 1 000 nœuds, 0,004 ms à 5 000, 0,019 ms à 20 000, et rien à 100 000** (−0,009 ms, dans le bruit)
  — 0,07 % des 26,87 ms de coût de frontière à 20 000 nœuds. Payer un risque de tampon détaché et un
  `try`/`catch` de repli pour 0,019 ms est le mauvais arbitrage : le worker poste la copie, et il n'existe donc
  aucun tampon de son côté qu'une requête ultérieure pourrait trouver vidé. Un test assère tout de même ce qui
  compte dans les deux cas — chaque réponse porte un tampon vivant de longueur pleine, et deux réponses n'en
  partagent jamais un.
- **Les environnements de test** : jsdom n'a pas de `Worker` utilisable et Node en a un différent
  (`worker_threads`). Le lot doit dire lequel il couvre et lequel il déclare hors mesure, plutôt que de laisser
  croire à une couverture universelle.

  Réponse de l'implémentation : **couvert**, `node:worker_threads` — un vrai second fil exécutant le vrai
  point d'entrée, atteint par la fabrique de worker injectable du client, puisque Node 22.22.1 n'a aucun
  `Worker` global (`typeof Worker === "undefined"`, mesuré). **Hors mesure**, jsdom : son `Worker` ne charge pas
  un worker de type module, donc une exécution jsdom n'exercerait que le repli, que les tests Node couvrent
  déjà. **Couvert partiellement**, le navigateur : la forme de construction
  `new Worker(new URL("./worker.js", import.meta.url), { type: "module" })` n'est jamais exécutée ; ce qui est
  vérifié depuis le tarball installé, c'est que l'URL qu'elle recevrait se résout sur un fichier publié réel.

  Une conséquence non prévue de l'indistinguabilité des deux voies exigée au §2 : la voie synchrone doit être
  **différée d'une macrotâche**, sinon trois demandes du même tick se résoudraient chacune avec des positions
  avant que la suivante n'existe, ce qui est précisément un moyen de distinguer les voies. Coût mesuré :
  1,104 ms, soit le plancher de `setTimeout(…, 0)` de Node, et jusqu'à ~4 ms dans un navigateur quand les
  minuteurs s'imbriquent. Une microtâche serait moins chère et fausse : elle ne préserverait la péremption que
  pour une salve émise de façon synchrone.
