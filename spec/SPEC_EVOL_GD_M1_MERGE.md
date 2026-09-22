# SPEC EVOL — GD-M1 : les six paquets graph/dataviz dans `main`, publiables depuis le DS

Statut : cadrage, 2026-09-22 ; révisé après revue adversariale muse 1.3 (effort max) du même jour.
Programme : [étude](SPEC_STUDY_GRAPH_DATAVIZ_REPATRIATION.md), [décisions](SPEC_DECISIONS_GRAPH_DATAVIZ_REPATRIATION.md),
[plan](../plan/10-BRANCH_graph-dataviz-repatriation.md).
Branche : `feat/gd-m1-merge`, dérivée de `feat/graph-dataviz-repatriation` (c4280e2c). Cible : une PR vers `main`.

## 1. Décisions owner (2026-09-22)

| Sujet | Décision |
|---|---|
| Périmètre de la première fusion | **Les six paquets d'un coup** : `@sentropic/graph`, `@sentropic/dataviz-core`, `-svelte`, `-react`, `-vue`, `-angular`. |
| Publication | **Préparée dès cette PR** (workflows, versions, contrôles). Aucun tag ni aucune publication dans la PR : le tag reste un geste de l'owner. |
| D2 — politique de versions | **A** : `graph` a sa propre ligne ; les cinq `dataviz-*` avancent en lockstep ; les paquets DS existants gardent leurs lignes. |
| D4 — `dataviz-angular` | **Publié** (fin du `private: true`). Pas d'étiquette « expérimental » ; son README décrit factuellement son périmètre actuel (pont signals et deux composants). |
| Numéros | `@sentropic/graph` **0.3.0** ; les cinq `@sentropic/dataviz-*` **0.5.0**. |
| Exécution | Cadrage et revue du build : Claude. Build : muse 1.3 (effort xhigh). Revue de cette spec : muse 1.3 (effort max). Recours ponctuel : fable 5.1. |

Règles dures du mandat : aucun trailer d'attribution IA sur les commits ; jamais le mot « honnête » ni ses dérivés ;
noms `@sentropic/graph` et `@sentropic/dataviz-*` conservés ; séparation des responsabilités (noyaux TS sans DOM, adaptateurs
par framework) ; tiers de layout (ELK, Graphviz, diagram-js, JointJS) = références de couverture, pas dépendances runtime
implicites ; ni `LICENSE` ni champ `license` à la racine du dépôt.

## 2. Point de départ (vérifié le 2026-09-22)

- `feat/graph-dataviz-repatriation` contient déjà `packages/graph` (graphify `8f19554c`) et `packages/dataviz-core`
  (dataviz `0869ae5`), leur provenance (`docs/graph-dataviz-m1-provenance.json`), les documents d'étude, specs, plan et
  harnais `tools/*`. Les manifestes de ces deux paquets pointent déjà `repository.url` vers le dépôt DS. La branche a
  **29 commits de retard** sur `origin/main`.
- Sources des quatre adaptateurs : `/home/antoinefa/src/dataviz` au commit **`0869ae5`** (HEAD, trois commits après
  `v0.4.52`). Copier uniquement les fichiers suivis (`git ls-files`) : jamais `node_modules`, `dist`, fichiers non suivis,
  ni rien de `vendor/` (tarballs DS et thèmes).

| Paquet | npm | Source | Build d'origine | Tests d'origine |
|---|---|---|---|---|
| `@sentropic/graph` | 0.2.0 | déjà copié | existant sur la branche | `tests/**/*.test.ts` (vitest, goldens compris) ; `bench/` n'est pas une suite |
| `@sentropic/dataviz-core` | 0.4.52 | déjà copié | existant sur la branche | `src/*.test.ts` |
| `@sentropic/dataviz-svelte` | 0.4.52 | dataviz `0869ae5` | `svelte-package --input src && rm -f dist/*.test.* dist/lib/*.test.*` | vitest, 37 fichiers |
| `@sentropic/dataviz-react` | 0.4.52 | idem | `tsc -p tsconfig.json` | vitest, 38 fichiers |
| `@sentropic/dataviz-vue` | 0.4.52 | idem | `tsc -p tsconfig.json` | vitest, 37 fichiers |
| `@sentropic/dataviz-angular` | jamais publié (`private`) | idem | `npm run build -w @sentropic/dataviz-core && ngc -p tsconfig.lib.json` | vitest, 5 fichiers |

- Versions DS sur `main` : tokens 0.11.0, themes 0.11.0, svelte 0.35.0, react 0.37.0, vue 0.37.0, angular 0.37.1
  (Angular 21.2.17 des deux côtés). Les adaptateurs sources épinglent en exact des versions anciennes (svelte 0.34.62,
  react/vue 0.36.49, angular par tarball local `file:../../vendor/…-0.36.51.tgz`). svelte, react et vue importent `GeoMap`
  et ses types, renommés `GeoChart*` sur `main` (commit `2d5e9d66`, renommage pur ; la classe CSS `.st-geoMap` reste le nom
  interne stable). `dataviz-angular` n'importe pas `GeoMap`.
- Les dist de dataviz-svelte/react/vue publient des fichiers imbriqués (`dist/lib/*`).

## 3. Travail demandé

### 3.1 Mise à jour de la branche
Fusionner `origin/main` dans `feat/gd-m1-merge` (merge, pas de rebase). Résoudre les conflits sans perte ; lister chaque
conflit résolu dans le message du commit de fusion.

### 3.2 Rapatriement des quatre adaptateurs
- Copier `packages/dataviz-{svelte,react,vue,angular}` depuis dataviz `0869ae5`, fichiers suivis uniquement.
- Étendre `docs/graph-dataviz-m1-provenance.json` pour chaque fichier copié : dépôt, commit, source, destination, blob git,
  sha256, statut `copied-byte-identical` ou `adapted-<raison>` avec `destinationSha256`. Les fichiers générés
  (`LICENSE.THIRD-PARTY.md`) prennent le statut `generated-notices`, sans source. Mettre à jour le champ `scope`.
- Ajouter `tools/graph-dataviz-provenance/verify.mjs` (sans dépendance) : recalcule les sha256 des six paquets et confirme
  chaque entrée (identique, adapté avec `destinationSha256` exact, généré) ; sortie non nulle au moindre écart ou fichier absent
  de la provenance. Documenter la commande.
- Adaptations **autorisées**, chacune justifiée dans la provenance (`adapted-*`) et dans le message de commit :
  1. dépendances internes en **version exacte** : `@sentropic/dataviz-core` `0.5.0` ; DS aux versions actuelles de `main`
     (svelte 0.35.0, react 0.37.0, vue 0.37.0, angular 0.37.1, themes 0.11.0) ; supprimer le tarball local d'Angular ;
  2. renommage DS `GeoMap` → `GeoChart` : toutes les références aux exports DS renommés (composant et types
     `GeoMapFeature`, `GeoMapFlow`, `GeoMapLayer`, `GeoMapPoint` → `GeoChart*`), **sans** renommer `geoMapLayers.ts`, les
     classes propres `st-geo*Map` ni les sélecteurs `.st-geoMap` des tests ;
  3. scripts : conserver les appels `npm run build -w …` imbriqués existants (convention du dépôt, comme
     `components-angular`), n'en ajouter aucun ; garantir l'ordre via `scripts/run-workspaces.mjs` (dataviz-core, puis paquets DS,
     puis adaptateurs) ;
  4. `dataviz-angular` : retirer `private: true`, ajouter `publishConfig.access: public`, vérifier `files`, `exports` et
     `peerDependencies` pour la publication, sans changer son API ; README : périmètre actuel décrit factuellement ;
  5. `repository.url` (et `directory`) des quatre manifestes → dépôt DS `rhanka/sent-tech-design-system`, comme graph et
     dataviz-core ;
  6. dérive d'API DS entre les versions épinglées et `main` (au-delà de `GeoChart`) : adaptation de l'**usage** côté adaptateur,
     minimale, uniquement si un test régresse par rapport à la ligne de base (§3.2, règle des tests) ; statut
     `adapted-ds-api-drift`, avec le commit DS en cause.
- **Règle des tests** (issue définie) :
  - établir la ligne de base : exécuter les suites de chaque paquet dans le dépôt source au commit `0869ae5` (dataviz) ou
    `8f19554c` (graphify), consigner fichiers et tests passés/échoués ;
  - dans le monorepo, chaque suite doit donner au moins les mêmes succès ; un échec présent dans la ligne de base est
    **préexistant** : consigné, non corrigé, sans bloquer ;
  - toute régression par rapport à la ligne de base se corrige par les adaptations 1 à 6 ; si aucune ne suffit, **la PR est
    bloquée** et le constat remonte à l'owner (cause mesurée, commit en cause, options) ; ne jamais désactiver, sauter ou
    affaiblir un test pour passer.
- Aucune autre modification de code : refactor, dédoublonnage avec les composants DS, renommage d'API = hors périmètre (M2+).

### 3.3 Versions
`packages/graph` → **0.3.0**. Les cinq `packages/dataviz-*` → **0.5.0**, dépendances internes entre eux à `0.5.0` exact.
`package-lock.json` régénéré en ne changeant que le nécessaire (`npm install --package-lock-only`, cache npm local au
scratchpad : le cache par défaut contient des fichiers root).

### 3.4 Licences
- Chaque paquet porte `LICENSE` (MIT, texte et titulaire d'origine : « Copyright (c) 2026 rhanka »), le champ
  `license: "MIT"` et un `LICENSE.THIRD-PARTY.md` généré par `npm run notices:generate`.
- Le générateur dérive les dépendances installées du lockfile : rien à ajouter à `scripts/third-party-sources.json` pour elles ;
  n'y ajouter une `notes` qu'en cas de `source-gap` ou de licence incompatible constatée. Les notices des paquets existants
  peuvent changer si leurs fermetures changent : c'est autorisé et doit être expliqué.
- `scripts/verify-publishable-licensing.test.mjs` fige le nombre de paquets publiables (11) : le porter à **17**.
- `npm run licensing:check` doit passer pour les 17.

### 3.5 Publication (D2-A), préparée mais non déclenchée
- **`graph-publish.yml`**, tag `graph-v<version>` ; **`dataviz-publish.yml`**, tag `dataviz-v<version>` pour les cinq paquets.
- Modèle : les workflows par famille existants, en particulier `react-publish.yml` (verify avec build, **check** et test) et
  `angular-publish.yml` (jobs `release-guard`, `publish`, `post-publish-check`, node 22 pour verify, node 24 et npm 11.6.2 pour
  publish) :
  - `verify` : `npm ci`, builds nécessaires, `check` et tests des paquets concernés, `npm run build`, `npm run pack:smoke` ;
  - `release-guard` : commit tagué ancêtre de la branche par défaut ; **chaque** version publiée égale au tag ; pour dataviz,
    les cinq manifestes et leurs dépendances internes à la même version ;
  - `publish` : Trusted Publishing OIDC (`id-token: write`), `--access public` ; dataviz dans l'ordre `core`, puis
    svelte, react, vue, angular ; prévoir, sur le modèle de `npm-publish.yml`, le chemin d'amorçage par jeton temporaire
    (`NPM_TOKEN`) pour un paquet jamais publié (`dataviz-angular`), inactif quand le secret est absent ;
  - `post-publish-check` : propagation `npm view <nom>@<version>` pour chaque paquet, puis contrôle d'installation depuis npm
    comme `npm-publish.yml`.
- Aucun autre workflow ne publie ces noms : `npm-publish.yml` et les autres gardent leurs listes explicites.
- **`scripts/smoke-pack.mjs`** et **`scripts/smoke-pack-verify-template.mjs`** couvrent les six paquets, selon leurs conventions :
  - entrées dans `packages[]`, `deepVerify` (fermetures et peers), `minExportCounts` ;
  - lecture **récursive** de `dist/` (fichiers `dist/lib/*` compris), y compris la compilation des `.svelte` imbriqués ;
  - vérifieurs par paquet ; le template doit **échouer** sur une cible sans vérifieur au lieu de `continue` ;
  - chargement paresseux par shard respecté.
- **`scripts/ci-affected-workspaces.mjs`** : ajouter les six noms à `smokePackWorkspaces`.
- **`docs/release.md`** : ajouter les deux familles, leurs tags, l'ordre de publication dataviz, et mettre à jour les comptes
  périmés (nombre de workflows, paquets), sans refonte. Documenter les **prérequis owner avant le premier tag** :
  1. confirmer sur npm l'existence des versions DS dont dépendent les adaptateurs (svelte 0.35.0, react/vue 0.37.0,
     angular 0.37.1, themes 0.11.0) ;
  2. `graph`, `dataviz-core`, `-svelte`, `-react`, `-vue` : déclarer le dépôt DS et le fichier de workflow comme éditeur de
     confiance sur npmjs.com ;
  3. `dataviz-angular` (jamais publié) : amorçage par jeton temporaire selon la checklist existante, puis déclaration de
     l'éditeur de confiance et révocation du jeton ;
  4. côté dataviz : retirer l'éditeur de confiance du dépôt `rhanka/dataviz` et geler ses tags `v*` **avant** le premier tag DS
     (sinon un `v0.5.0` source figerait définitivement la 0.5.0 sur npm) ; côté graphify : publication manuelle
     (`PUBLISHING.md`), à cesser par discipline.

### 3.6 CI et monorepo
- Les six paquets sont des workspaces (`packages/*`) construits, vérifiés et testés par `npm run build` / `check` / `test`
  via `scripts/run-workspaces.mjs`, et sélectionnés par `scripts/ci-affected-workspaces.mjs` dans `verify.yml`.
- `verify.yml`, `design-quality-gate.yml` et `docs.yml` restent verts. `apps/docs` ne consomme pas encore ces paquets.
- Goldens WebGL de `graph` (inclus dans `npm test` et dans `prepublishOnly`) : consigner l'état attendu **par suite**
  (passe, ou saut d'environnement par le préflight existant), identique en local et en CI ; ne pas les transformer en échecs
  bloquants ni les désactiver.

## 4. Hors périmètre
M2 et suivants (contrats document/vues/scène, refactors, dédoublonnage avec ForceGraph et consorts), intégration au site de docs,
modifications dans les dépôts graphify et dataviz, bascule des consommateurs (M6), tout tag ou publication, la parité Angular
au-delà de ce qu'exige la publication de son API actuelle.

## 5. Critères d'acceptation (tous exécutés et consignés)
1. `git diff --name-only origin/main...feat/gd-m1-merge` limité à : `packages/{graph,dataviz-*}/**` ;
   `packages/*/LICENSE.THIRD-PARTY.md` régénérés ; `package-lock.json` ; `package.json` racine si nécessaire ;
   `scripts/{smoke-pack.mjs,smoke-pack-verify-template.mjs,ci-affected-workspaces.mjs,verify-publishable-licensing.test.mjs}` ;
   `scripts/third-party-sources.json` si une `notes` est nécessaire ; `.github/workflows/{graph,dataviz}-publish.yml` et
   `verify.yml` si nécessaire ; `docs/release.md` ; `tools/graph-dataviz-provenance/**` ; les fichiers du programme déjà présents
   sur la branche (`docs/graph-dataviz-*`, `docs/a0-*`, `spec/*`, `plan/*`, `tools/*`). Ni `LICENSE` ni champ `license` racine.
2. `npm ci`, `npm run licensing:check`, `npm run build`, `npm run check`, `npm test`, `npm run pack:smoke` : verts.
   Pour chaque paquet : fichiers et tests passés/échoués, comparés à la ligne de base (§3.2), écarts expliqués.
3. `node tools/graph-dataviz-provenance/verify.mjs` : zéro écart.
4. Versions 0.3.0 et 0.5.0 exactement ; `dataviz-angular` publiable ; aucune dépendance `file:` ni tarball ; `repository.url`
   des six vers le dépôt DS.
5. `npm pack --dry-run` des six : contenu listé, sans `node_modules`, tests, `vendor/` ni fichiers inattendus.
6. Simulation de `release-guard` pour `graph-v0.3.0` et `dataviz-v0.5.0` ; aucun autre workflow ne publie ces noms.
7. Tous les checks requis de la PR verts, y compris les shards qui sélectionnent les nouveaux workspaces.
8. Commits sans trailer d'attribution ; aucun « honnête » ; messages en anglais, style du dépôt.

## 6. Inconnues et risques
- **Éditeurs de confiance npm** : configuration actuelle des six noms — `unknown` ; actions owner obligatoires avant le premier tag.
- **Snapshot dataviz** : `0869ae5` contient trois commits postérieurs à `v0.4.52` ; la 0.5.0 les embarque.
- **Dérive d'API DS** entre les versions épinglées (0.34/0.36) et `main` (tokens d'icône, PanelStack, NavSection…) : traitée par
  la règle des tests (§3.2).
- **Angular** : `dataviz-angular` contre DS Angular 0.37.1 ; le DS publie en compilation partielle.
- **Temps de CI** : coût des suites graph/dataviz dans `verify.yml`, à mesurer.
