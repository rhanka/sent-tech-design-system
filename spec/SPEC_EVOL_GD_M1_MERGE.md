# SPEC EVOL — GD-M1 : les six paquets graph/dataviz dans `main`, publiables depuis le DS

Statut : cadrage, 2026-09-22. Programme : [mandat et étude](SPEC_STUDY_GRAPH_DATAVIZ_REPATRIATION.md),
[décisions](SPEC_DECISIONS_GRAPH_DATAVIZ_REPATRIATION.md), [plan](../plan/10-BRANCH_graph-dataviz-repatriation.md).
Branche : `feat/gd-m1-merge`, dérivée de `feat/graph-dataviz-repatriation` (c4280e2c). Cible : une PR vers `main`.

## 1. Décisions owner (2026-09-22)

| Sujet | Décision |
|---|---|
| Périmètre de la première fusion | **Les six paquets d'un coup** : `@sentropic/graph`, `@sentropic/dataviz-core`, `-svelte`, `-react`, `-vue`, `-angular`. |
| Publication | **Préparée dès cette PR** (workflows, versions, contrôles). Aucun tag ni aucune publication dans la PR : le tag reste un geste de l'owner. |
| D2 — politique de versions | **A** : `graph` a sa propre ligne ; les cinq `dataviz-*` avancent en lockstep ; les paquets DS existants gardent leurs lignes. |
| D4 — `dataviz-angular` | **Publié** (fin du `private: true`). |
| Numéros | `@sentropic/graph` **0.3.0** ; les cinq `@sentropic/dataviz-*` **0.5.0**. |
| Exécution | Cadrage et revue du build : Claude. Build : muse 1.3 (effort xhigh). Revue de cette spec : muse 1.3 (effort max). Recours ponctuel : fable 5.1. |

Règles dures du mandat, rappelées : aucun trailer d'attribution IA sur les commits ; jamais le mot « honnête » ni ses dérivés ;
noms `@sentropic/graph` et `@sentropic/dataviz-*` conservés ; séparation des responsabilités (noyaux TS sans DOM, adaptateurs par framework) ;
tiers de layout (ELK, Graphviz, diagram-js, JointJS) = références de couverture, pas dépendances runtime implicites ; aucun `LICENSE`
ni champ `license` à la racine du dépôt.

## 2. Point de départ (vérifié le 2026-09-22)

- `feat/graph-dataviz-repatriation` contient déjà `packages/graph` (depuis graphify `8f19554c`) et `packages/dataviz-core`
  (depuis dataviz `0869ae5`), avec leur provenance dans `docs/graph-dataviz-m1-provenance.json`, plus les documents d'étude,
  les specs, le plan et les harnais `tools/*`. Elle a **29 commits de retard** sur `origin/main`.
- Sources des quatre adaptateurs : `/home/antoinefa/src/dataviz` au commit **`0869ae5`** (HEAD, trois commits après le tag
  `v0.4.52` ; même snapshot que `dataviz-core`). Ne copier que les fichiers suivis par git (`git ls-files`), jamais `node_modules`,
  `dist` ni fichiers non suivis.

| Paquet | npm aujourd'hui | Source | Build | Tests |
|---|---|---|---|---|
| `@sentropic/graph` | 0.2.0 | déjà copié | (existant sur la branche) | suites `tests/*.test.ts`, golden, bench |
| `@sentropic/dataviz-core` | 0.4.52 | déjà copié | (existant sur la branche) | `src/*.test.ts` |
| `@sentropic/dataviz-svelte` | 0.4.52 | dataviz `0869ae5` | `svelte-package --input src` | vitest, 37 fichiers |
| `@sentropic/dataviz-react` | 0.4.52 | idem | `tsc -p tsconfig.json` | vitest, 38 fichiers |
| `@sentropic/dataviz-vue` | 0.4.52 | idem | `tsc -p tsconfig.json` | vitest, 37 fichiers |
| `@sentropic/dataviz-angular` | jamais publié (`private`) | idem | `ngc -p tsconfig.lib.json` | vitest, 5 fichiers |

- Versions DS sur `main` : tokens 0.11.0, themes 0.11.0, svelte 0.35.0, react 0.37.0, vue 0.37.0, angular 0.37.1.
  Les adaptateurs sources épinglent des versions anciennes (svelte 0.34.62, react/vue 0.36.49, angular par **tarball local**
  `file:../../vendor/sentropic-design-system-angular-0.36.51.tgz`) et importent `GeoMap`, que `main` a renommé `GeoChart`
  (commit `2d5e9d66` ; la classe CSS `.st-geoMap` reste le nom interne stable).

## 3. Travail demandé

### 3.1 Mise à jour de la branche
Fusionner `origin/main` dans `feat/gd-m1-merge` (merge, pas de rebase de l'historique publié). Résoudre les conflits sans perte
de part et d'autre ; lister chaque conflit résolu dans le message du commit de fusion.

### 3.2 Rapatriement des quatre adaptateurs
- Copier `packages/dataviz-{svelte,react,vue,angular}` depuis dataviz `0869ae5`, fichiers suivis uniquement.
- Étendre `docs/graph-dataviz-m1-provenance.json` pour chaque fichier : dépôt, commit, source, destination, blob git, sha256,
  statut `copied-byte-identical` ou `adapted-<raison>` avec `destinationSha256`. Mettre à jour son champ `scope`.
- Adaptations **minimales**, chacune justifiée dans la provenance (statut `adapted-*`) et dans le message de commit :
  1. dépendances vers les paquets du workspace : `@sentropic/dataviz-core` → `0.5.0` ; DS → versions actuelles de `main`
     (svelte 0.35.0, react 0.37.0, vue 0.37.0, angular 0.37.1, themes 0.11.0) ; supprimer le tarball local d'Angular ;
  2. `GeoMap` → `GeoChart` dans les imports des adaptateurs, sans réintroduire d'alias `GeoMap` dans le DS ;
  3. scripts de build/test alignés sur le monorepo : l'ordre de build doit passer par `scripts/run-workspaces.mjs`
     (dataviz-core avant les adaptateurs, paquets DS avant les adaptateurs) ; retirer les appels `npm run build -w …` imbriqués
     s'ils deviennent redondants ; conserver les commandes de test d'origine ;
  4. `dataviz-angular` : retirer `private: true`, ajouter `publishConfig.access: public`, et ce qu'exige la publication
     (champs `files`, `exports`, `peerDependencies`) sans changer son API.
- Aucune autre modification de code source : refactor, dédoublonnage avec les composants DS, renommage d'API, etc. sont
  **hors périmètre** (M2+). Si un test source échoue pour une raison étrangère aux adaptations ci-dessus, le consigner
  (`unverified` / cause mesurée) au lieu de modifier le code.

### 3.3 Versions
`packages/graph` → **0.3.0**. Les cinq `packages/dataviz-*` → **0.5.0**, et toute dépendance interne entre eux à 0.5.0.
`package-lock.json` régénéré en ne changeant que ce qui est nécessaire (`npm install --package-lock-only`, cache npm local).

### 3.4 Licences
Chaque paquet porte `LICENSE` (MIT, texte et titulaire d'origine), le champ `license: "MIT"` et un `LICENSE.THIRD-PARTY.md`
généré par `npm run notices:generate`. Compléter `scripts/third-party-sources.json` si le générateur l'exige (dépendances
d'exécution comme `jspdf`, `svg2pdf.js`, leurs dépendances transitives et optionnelles). `npm run licensing:check` doit passer
pour les 17 paquets publiables (11 existants + 6).

### 3.5 Publication (D2-A), préparée mais non déclenchée
- **`graph-publish.yml`**, tag `graph-v<version>` ; **`dataviz-publish.yml`**, tag `dataviz-v<version>` pour les cinq paquets.
- Modèle : `.github/workflows/angular-publish.yml` (jobs `verify`, `release-guard`, `publish`, `post-publish-check`) :
  - `verify` : `npm ci`, builds nécessaires, tests des paquets concernés, `npm run build`, `npm run pack:smoke` ;
  - `release-guard` : commit tagué ancêtre de la branche par défaut ; **chaque** version publiée égale au tag ;
  - `publish` : Trusted Publishing OIDC (`id-token: write`, npm 11.6.2 comme l'existant), `--access public` ;
    dataviz : publier dans l'ordre des dépendances (`dataviz-core` d'abord) ;
  - `post-publish-check` : attente de propagation `npm view <nom>@<version>` pour chaque paquet.
- Aucun autre workflow ne doit publier ces noms : vérifier que `npm-publish.yml` et les autres gardent leurs listes explicites.
- `scripts/smoke-pack.mjs` : couvrir les six paquets selon ses conventions (tarball, installation isolée, imports nommés,
  types), en respectant son chargement paresseux par shard.
- `docs/release.md` : documenter les deux nouvelles familles, leurs tags, l'ordre de publication dataviz, et les **prérequis owner**
  avant le premier tag : déclarer sur npmjs.com le dépôt `rhanka/sent-tech-design-system` et le fichier de workflow comme éditeur
  de confiance pour chacun des six noms ; arrêter la publication de ces noms depuis graphify et dataviz (suivi M6, hors de ce dépôt).

### 3.6 CI et monorepo
- Les six paquets sont des workspaces (`packages/*`) construits et testés par `npm run build` / `npm test` / `npm run check`
  via `scripts/run-workspaces.mjs`, et sélectionnés par `scripts/ci-affected-workspaces.mjs` dans `verify.yml`.
- `verify.yml`, `design-quality-gate.yml` et `docs.yml` restent verts. `apps/docs` ne consomme pas encore ces paquets :
  aucune intégration dans le site dans cette PR.
- Environnement : les goldens WebGL de `graph` distinguent les échecs d'environnement (préflight existant) ; ne pas les
  transformer en échecs bloquants ni les désactiver silencieusement.

## 4. Hors périmètre
M2 et suivants (contrats document/vues/scène, refactors, dédoublonnage avec ForceGraph et consorts), intégration au site de docs,
modifications dans les dépôts graphify et dataviz, bascule des consommateurs (M6), tout tag ou publication, la matrice de parité
d'Angular au-delà de ce qu'exige la publication de l'API actuelle.

## 5. Critères d'acceptation (tous exécutés et consignés)
1. `git diff --name-only origin/main...feat/gd-m1-merge` : uniquement `packages/{graph,dataviz-*}/**`, `package-lock.json`,
   `package.json` racine si nécessaire, `scripts/{smoke-pack.mjs,third-party-sources.json,ci-affected-workspaces.mjs}` si
   nécessaire, `.github/workflows/{graph,dataviz}-publish.yml` (+ `verify.yml` si nécessaire), `docs/release.md`,
   `THIRD-PARTY-NOTICES.md` si le générateur le modifie, et les fichiers du programme déjà présents sur la branche
   (`docs/graph-dataviz-*`, `docs/a0-*`, `spec/*`, `plan/*`, `tools/*`). Aucun `LICENSE` racine.
2. `npm ci` (cache npm local), `npm run licensing:check`, `npm run build`, `npm run check`, `npm test`, `npm run pack:smoke` : verts.
   Tests par paquet : nombre de fichiers et de tests passés, comparés à la source dataviz/graphify au même commit (mêmes résultats
   attendus, écarts expliqués).
3. Provenance complète : chaque fichier des six paquets figure dans `docs/graph-dataviz-m1-provenance.json` ; chaque `adapted-*` est
   justifié ; un script (ou une commande documentée) recalcule les sha256 et confirme la correspondance.
4. Versions : 0.3.0 et 0.5.0 exactement ; `dataviz-angular` publiable ; aucune dépendance `file:` ni tarball local.
5. `npm pack --dry-run` de chacun des six : contenu listé, sans `node_modules`, sources de test ou fichiers inattendus.
6. Simulation de `release-guard` pour `graph-v0.3.0` et `dataviz-v0.5.0` (versions = tag) ; aucun autre workflow ne publie ces noms.
7. CI de la PR verte (30+ checks), y compris les shards qui sélectionnent les nouveaux workspaces.
8. Commits sans trailer d'attribution ; aucun « honnête » ; messages en anglais, style du dépôt.

## 6. Inconnues et risques
- **Éditeurs de confiance npm** : configuration actuelle des six noms (graphify et dataviz publient-ils encore ?) — `unknown` ;
  action owner obligatoire avant le premier tag.
- **Snapshot dataviz** : `0869ae5` contient trois commits postérieurs à `v0.4.52` ; la 0.5.0 les embarque.
- **API `GeoChart`** : supposée identique à `GeoMap` (renommage seul, commit `2d5e9d66`) — à vérifier par les tests des adaptateurs.
- **Angular** : compatibilité de `dataviz-angular` avec DS Angular 0.37.1 et l'Angular du monorepo ; liaison AOT (le DS publie en
  compilation partielle).
- **Dépendances d'export PDF** (`jspdf`, `svg2pdf.js`) : licences et dépendances optionnelles à couvrir par les notices.
- **Temps de CI** : coût des suites graph/dataviz dans `verify.yml`, à mesurer.
