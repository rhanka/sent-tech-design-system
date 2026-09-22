# M1 initial — Rapatriement conservatoire graph et dataviz-core

Date : 2026-09-15. Worktree `feat/graph-dataviz-repatriation`, base DS `422776869847079891a5be49a8e14313ea1c25a8`. **Sous-lot initial réalisé ; M1 global reste ouvert.** Aucun consommateur externe basculé, aucune publication npm effectuée.

## Changement et provenance

200 fichiers suivis/licences ont été repris depuis les blobs Git des sources auditées : `graphify@8f19554cea3a4397fd66a90c7e9fd5ea54c81626` et `dataviz@0869ae5b59bb308be7d43fbe0de58c5487e11f25`. [Manifeste fichier par fichier](graph-dataviz-m1-provenance.json) avec commit, blob et SHA-256 ; aucun runtime ni test source modifié.

Les quatre adaptations concernent uniquement la distribution :

- `packages/graph/package.json` : repository DS, licence incluse au pack, devDependencies `tsup` et `typescript` auparavant héritées de la racine graphify, script `check`.
- `packages/graph/tsconfig.json` : base du workspace DS et options effectives du compilateur d'origine (dont `noUncheckedIndexedAccess`) ; `verbatimModuleSyntax:false` conserve la sémantique de compilation source.
- `packages/graph/PUBLISHING.md` : notice identifiant la procédure historique et le transfert de publisher encore à effectuer.
- `packages/dataviz-core/package.json` : repository DS ; nom, version, scripts et surface exportée conservés.

Le `.gitignore` du package graph exclut les sorties PNG `tests/golden/__out__/`. Le lockfile ajoute les deux workspaces et le nécessaire de build/golden. **Aucune version de dépendance préexistante n'a changé, aucune entrée préexistante n'a été supprimée.** Les deux packages gardent zéro dépendance runtime. `npm ci --ignore-scripts` avec cache dédié réussit (517 packages, 3 s).

Versions conservées : graph 0.2.0, core 0.4.52. Ce sont des candidats locaux de migration, pas de nouvelles versions publiées. Le transfert OIDC et la prochaine version relèvent de D2/S6. Le script global de build découvre les deux workspaces ; `smoke-pack.mjs` a encore une liste fermée qui n'inclut pas ces noms. Les preuves pack ci-dessous sont explicites et distinctes de ce script global, dont l'extension reste sous `GD-M1-PACKAGING`.

## Vérifications exécutées

Environnement : Node 22.22.1, Linux x64, TypeScript 5.9.3, Vitest 4.1.6, tsup 8.5.1. Tests sur le worktree, sans modification du code des dépôts sources.

| Vérification | Résultat | Limite |
|---|---|---|
| `npm run check` puis `npm run build`, chacun avec `-w @sentropic/dataviz-core` | PASS | compilation du package |
| `npm test -w @sentropic/dataviz-core -- --no-cache --no-file-parallelism` | **68 fichiers / 646 tests PASS**, 11,36 s | tests hérités ; pas adoption d'application |
| `npm run build` puis `npm run check`, chacun avec `-w @sentropic/graph` | PASS : ESM, CJS, `.d.ts`, `.d.cts` | distribution locale |
| `npm test -w @sentropic/graph -- --no-cache --no-file-parallelism` | **23 fichiers / 330 tests rapportés PASS**, 65,78 s | premier essai : Chromium Snap indisponible ; certains golden peuvent retourner sans assertions ; ne suffit pas comme preuve navigateur |
| préflight WebGL2 avec Chromium Playwright | **PASS** : SwiftShader, WebGL2 réel, clear rouge + readPixels | contexte logiciel, pas GPU matériel |
| mêmes sources golden avec `GOLDEN_REQUIRE_CHROME=1 GOLDEN_ENABLE_WEBGL=1` | **5 fichiers / 133 tests PASS**, 6,14 s | sous-ensemble des 330, ne pas additionner deux fois |
| `npm pack -w` des deux noms, installation des `.tgz` dans un projet `/tmp` sans dépendance workspace | **PASS** | aucune publication registry |
| comparaison des exports depuis ce consommateur isolé | graph **138 valeurs / 211 déclarations**, ESM et CJS identiques ; core **174 valeurs / 495 déclarations** | comparaison exacte avec carte source M0 |
| TypeScript du consommateur core, `lib:[ES2022]`, `types:[]`, strict, sans DOM | **PASS** | noyau dataviz ; façade historique graph expose encore des types DOM |
| tests existants de l'ordonnanceur workspace | **2 PASS** : ordre local et rejet de cycles | pas de build global de tous les composants DS |
| audit DS ciblé | **256 tests PASS** : React/Vue 138 + Svelte 118 | voir [audit DS](graph-dataviz-ds-audit.md), Angular/non-ciblé unverified |

Les logs et résultats détaillés sont dans [graph-dataviz-evidence](graph-dataviz-evidence/). Le premier échec npm venait d'un fichier de cache global inaccessible ; un cache dédié a suffi. Le premier échec préflight venait du lanceur Snap (`cannot create transient scope`), résolu en désignant le Chromium déjà installé. Aucun seuil de test ni timeout modifié.

### Commandes reproductibles golden

Depuis ce worktree, avec un binaire Chromium installé :

```sh
CHROME_BIN=/chemin/vers/chrome npm run golden:webgl:preflight -w @sentropic/graph
CHROME_BIN=/chemin/vers/chrome GOLDEN_REQUIRE_CHROME=1 GOLDEN_ENABLE_WEBGL=1 npm test -w @sentropic/graph -- tests/golden --no-cache --no-file-parallelism
```

Le binaire utilisé ici est `/home/antoinefa/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome`. Le contrôle explicite est nécessaire : la suite héritée peut passer en l'absence de Chrome. Les scripts `test:golden*` hérités reconstruisent avec `--no-dts` ; relancer `npm run build -w @sentropic/graph` avant un pack si ces scripts ont été utilisés, car ce build nettoie `dist`.

## Mesure de performance

`node packages/graph/bench/buffers-bench.mjs` : 100 000 nœuds, 200 000 arêtes, 0 arête rejetée. Construction 50,74 ms ; styles 36,88 ms ; géométrie droite 5,22 ms ; arcs 12,92 ms. Buffers positions 800 000 octets, indices 1 600 000, styles 3 400 000, sommets droits 3 200 000, arcs 12 800 000. **Une mesure de cette machine**, sans baseline comparatif ni budget performance ratifié. Ce n'est pas un benchmark de frame time interactif.

## Restant M1 et programme

Les quatre adaptateurs ne sont pas encore déplacés. Résoudre leurs imports `GeoMap` vers la surface `GeoChart` sans renommer leurs exports publics, puis configurer la résolution locale DS/core, les assets/CSS et les gates pack/SSR de chaque framework. Angular reste privé et sa parité partielle explicitement inventoriée. Faire converger ensuite les deux grilles via une façade conservant le contrat riche dataviz ; ne pas substituer les composants immédiatement.

Les fonctions source rapatriées ne réalisent pas le futur modèle sémantique, les codecs ou les nouveaux backends. Barnes-Hut/hierarchy et workers hors package restent en M2 ; consommateurs/publishers/retrait des copies restent en M6. Les décisions fable/gemini ne sont pas encore ratifiées.
