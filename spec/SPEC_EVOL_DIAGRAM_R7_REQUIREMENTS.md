# SPEC_EVOL_DIAGRAM_R7 — Requirements specification (exigences owner, diagrammes r7)

> **Purpose.** Source unique et tracée des exigences de l'owner pour l'évolution diagrammes r7 du design system (DS). Chaque exigence est un élément `REQ-R7-NN` avec son verbatim daté, un critère d'acceptation observable, son lot et sa vague, son statut factuel et ses écarts connus. Une demande owner sans id ici n'est pas encore une exigence : elle entre ici avant tout plan, brief ou PR.
>
> **Snapshot.** 2026-11-20, 21:00 EST (révision r5, voir « Revisions » ; r1 : 11:50 EST ; r2 : 14:16 EST ; r3 : 14:38 EST ; r4 : 19:13 EST). Dépôt DS lu en lecture seule (`origin/main` après fusion des PR #314 (`b303096b9`) et #319, branches et tags distants, `.track/events.jsonl` de la copie de travail locale, lu par `track item show`) ; PR lues via `gh`. Le `.track/events.jsonl` d'`origin/main` s'arrête au 07/11 (UTC) : les items track cités ici (12/11 à 20/11, dates UTC) n'existent que dans la copie locale, non committée. État au 20/11 21:00 EST : PR #314 fusionnée et wave 1.1 en cours de publication sous GO owner (diagram-core 0.4.1, diagram-canvas 0.3.1, tokens / themes 0.15.1, svelte 0.43.1, vue 0.41.0-next.9) ; PR #315 ouverte en tournée de correctifs 2 ; PR #317 et #318 ouvertes ; `design-system-svelte` 0.43.0 publié ; `review-core` 0.1.0 et 0.1.1 publiés.

## Décision du 21/11 sur le zoom et l’ajustement

> « L'utilisateur a les boutons de zoom et autolayout. Par défaut quand on redimensionne on autolayout zoom intégral + plancher à 30 % ».

- [REQ-R7-09](#req-r7-09) retient `minReadableScale = 0.30` et `maxDisplayScale = 0.62`. L’indicateur affiche le zoom relatif au plafond.
- [REQ-R7-30](#req-r7-30) demande de cadrer toute la figure au premier rendu, au pli et au dépli, au redimensionnement de la fenêtre ou du conteneur et au chargement des polices. Le défilement repart de l’origine. Le zoom manuel reste actif jusqu’au prochain réajustement. Si la figure exige une échelle inférieure à 0,30, elle défile à 0,30 sur les axes qui débordent et tout son contenu reste accessible.
- Cette décision clôt D-11 pour le correctif V1-patch dans les deux hôtes, Svelte et Vue. Le snapshot du 20/11 ci-dessous conserve le comportement de référence de la vague 1.1. Item Track `01M7Z0EP2JGX2D4BF0NJP1WEDY`.

## Conventions

- **Quotes.** « … » = verbatim owner. *Relayed* = texte consigné par un tiers (d2d-cond, conducteur engram, note DS, plan DS, item track), cité tel qu'enregistré, en anglais quand la source est en anglais. Verbatim owner direct absent des sources = `missing source`.
- **Status vocabulary.**
  - `fait-publié (versions)` : publié sur npm par tag de release.
  - `en construction` : code sur une branche ou une PR ouverte, non publié.
  - `planifié` : lot décrit dans `PLAN-r3.md`, aucun code.
  - `non prévu` : aucun lot.
  - `corrigé (PR #314 fusionnée, wave 1.1 en cours de publication sous GO owner)` : cassé par la vague 1 d'après `REGRESSION-AUDIT-wave1.md`, ou signalé comme régression par l'owner hors de cet audit (REQ-R7-30) ; correctif porté par la PR #314 fusionnée dans `origin/main` (`b303096b9`), versions wave 1.1 en cours de publication sous GO owner séparé — état au 20/11 21:00 EST.
  - Un statut composé (publié + effets de bord, par exemple) est écrit en entier.
- **Waves.** V1 = DE-1 (publiée) ; V1-patch = correctif des régressions V1 (PR #314, hors `PLAN-r3.md`) ; V2 = DE-2 + E1 + E2 ; étape 0 = gel du vocabulaire `ds-layout-hints@2` (en parallèle de V2) ; V3 = H2 ; V4 = N2 (temps 2). GO owner séparé par vague, jamais groupé (`PLAN-r3.md` §3).
- **Tuple V1 publié** (19-20/11, intégrités dans `WAVE1-TUPLE.md`) : `@sentropic/diagram-core 0.4.0`, `@sentropic/diagram-canvas 0.3.0`, `@sentropic/design-system-tokens 0.15.0`, `@sentropic/design-system-themes 0.15.0`, `@sentropic/design-system-svelte 0.42.0`, `@sentropic/design-system-vue 0.41.0-next.8`.
- **Change control.** Ajout ou modification = nouvel id ou nouvelle révision datée de l'exigence ; aucune suppression silencieuse.
- **Confidentialité.** Aucun contenu client. Aucun chemin d'espace client ouvert pour ce document.

## Revisions

| Révision | Date | Changements |
|---|---|---|
| r1 | 20/11, 11:50 EST | création : REQ-R7-01 à REQ-R7-28, scénarios S1 à S3, décisions D-1 à D-9 |
| r2 | 20/11, 14:16 EST | intégration d'une revue indépendante (`ACCEPT WITH CHANGES`, 6 constats). (1) PR #314 : la revue mesurait le head `90aa6dd81` (8 commits, CI 33/36, bumps manquants, corps obsolète) ; au snapshot r2, head `570093c3a` (9 commits, CI 36/36, corps réécrit, bumps toujours manquants) : état du dépôt, REQ-R7-01, REQ-R7-04, REQ-R7-06 à REQ-R7-10, REQ-R7-28, « Cross-cutting known gaps » §1. (2) REQ-R7-29 créée (DE-1b) ; REQ-R7-01, REQ-R7-02, REQ-R7-06, REQ-R7-11, REQ-R7-20 et REQ-R7-21 complétées depuis `PLAN-r3.md`. (3) items track diagrammes recensés (état du dépôt, REQ-R7-06, REQ-R7-21, REQ-R7-26, §4) ; date de REQ-R7-26 ramenée à `missing source`. (4) critères observables de REQ-R7-15, REQ-R7-24 et REQ-R7-25 ; portée réelle des tests CI dans REQ-R7-05, REQ-R7-13 et REQ-R7-26. (5) colonnes « À regarder » et « Item track » dans les 4 tableaux de scénarios. (6) dépendance de N2 à H2 dans S2 (nouvelle décision D-10), budget de V2 et coûts jusqu'à fin V3 et fin V4 par scénario. Aucune exigence supprimée. |
| r3 | 20/11, 14:38 EST | ajout de REQ-R7-30 (verbatim owner du 20/11, 14:10, `OWNER-ADDENDA.md:36-38` ; item track `01M7X6P2X37V4HK1ZPQ7HJZZA9`) dans « Index » et « Wave 1 » ; définition du statut `régression à corriger (PR #314)` étendue à une régression signalée par l'owner hors audit ; « Sources » : `refit-unfold.md` et dossier h-cond antérieur à v7 (svelte 0.41.5 publié). Faits de REQ-R7-30 lus à 14:38 EST (PR #314 toujours au head `570093c3a`). « Repository state at snapshot », « Cross-cutting known gaps », « Open owner decisions » et « Scénarios » restent au snapshot r2 : ils ne citent ni REQ-R7-30 ni son item track. Aucune exigence supprimée. |
| r4 | 20/11, 19:13 EST | deux revues indépendantes (`NOT MERGEABLE`) : intégration complète des constats. (1) Attribution agent retirée ; « revue indépendante » partout ; ancres explicites `<a id="req-r7-nn">` pour les 30 exigences. (2) Snapshot rafraîchi : PR #314 (tournée de correctifs 4, head `2a60db8ee`, 12 commits, CI 36/36) avec `d84dc6c8e` (REQ-R7-30), `0363185c5` (bumps diagram-core 0.4.1 et tokens / themes 0.15.1, cascade refaite) et `2a60db8ee` (survol `v1` identique à 0.41.5, `W1-12` limité à `surface2`) ; PR #315 (tournée de correctifs, head `a64d48116`, 17 commits) avec `d937fb1cd` (0 conflit sur tous les états de pli), `8c23d804c` (pointes `@4` réduites à `arrow | none`, scènes first-paint r7), `60a892b3d` (parité Vapor au runtime), `a64d48116` (retour des effets de bord non demandés) ; PR #317 (E2, `61c02984b`) et PR #318 (E1, `20e3cd129`) ouvertes : REQ-R7-19 et REQ-R7-20 passent « en construction » ; PR #319 fusionnée, `origin/main` `4e02910aa`, review-core 0.1.1 non encore publié. (3) `main` : svelte 0.43.0 publié (tag `svelte-v0.43.0`), review-core 0.1.0 publié. (4) REQ-R7-30 réalignée sur le code : réajustement à chaque pli / dépli (zoom explicite remis à zéro), D-5 close, D-11 (Z-7 et plancher 0,45) ; `main`, cross-cutting, scénarios et track mis à jour (5 items r7, 30 items par exigence). Aucune exigence supprimée. |
| r5 | 20/11, 21:00 EST | deux revues indépendantes (`NOT MERGEABLE`) : intégration complète des constats. (1) Toute donnée volatile (heads de PR, comptes de commits, états CI, états de publication en cours) est remplacée par « état au 20/11 21:00 EST » et par les faits stables seuls : PR #314 fusionnée (`b303096b9`), PR #319 fusionnée, `review-core` 0.1.0 et 0.1.1 publiés, `design-system-svelte` 0.43.0 publié, wave 1.1 (diagram-core 0.4.1, diagram-canvas 0.3.1, tokens / themes 0.15.1, svelte 0.43.1, vue 0.41.0-next.9) en cours de publication sous GO owner, PR #315 ouverte en tournée de correctifs 2, PR #317 et #318 ouvertes. (2) Statuts REQ-R7-04, REQ-R7-06 à REQ-R7-10, REQ-R7-28 à REQ-R7-30, « Repository state at snapshot », base commune et « Cross-cutting known gaps » alignés sur la fusion de PR #314 et la publication wave 1.1. (3) REQ-R7-01 : `REQ-R7-30` ajoutée à « Owner looks at » ; REQ-R7-11 : écart de CI supprimé ; REQ-R7-26 : `design-system-svelte` 0.43.0. Aucune exigence supprimée. |
| r6 | 21/11 | décision de l’owner pour le correctif V1-patch. REQ-R7-09 fixe le plancher à 0,30 et conserve le plafond à 0,62. REQ-R7-30 cadre la figure entière au premier rendu, au pli et au dépli, au redimensionnement et au chargement des polices. D-11 est close pour ce correctif. |

## Sources

| Source | Content used |
|---|---|
| `OWNER-ADDENDA.md` (notes de vague, dépôt de travail) | verbatims owner 18/11 et 20/11, décisions 19/11, 9 demandes génériques d2d (18/11), relais engram (4 frameworks, emphase G6), items track du 20/11 |
| `PLAN-r3.md` (notes de vague, dépôt de travail) | lots DE-1 (dont DE-1b), DE-2, E1, E2, H2, N2 ; vagues ; ordre des tags et cascade du workspace ; heures ; risques |
| `PLAN.md` (notes de vague, dépôt de travail) | plan r1 (18/11) : DE-1b, mode « sans pli » (`foldable: false`, réserve `66 px`), `compared_panels { sync_headers, sync_rows }`, aides `bracePath` / `rulerPath` (REQ-R7-24, REQ-R7-25, REQ-R7-29) |
| `D2D-PIPELINE-DS-ANSWER.md` (notes de vague, dépôt de travail) | état des cibles au 18/11 ; limites de la chaîne v10 |
| `ds-position-engine.md` (note DS du 15/11, dossier kits r7) | demandes du kit r7 (note DS du 15/11) |
| `DOSSIER.md` (notes de vague, dépôt de travail) | analyse ISO r7 v10 : options A/B/C, coûts, retour arrière, question ouverte |
| `REGRESSION-AUDIT-wave1.md` (notes de vague, dépôt de travail) | audit V1 : 60 lignes `W1-01` à `W1-60` |
| `WAVE1-TUPLE.md`, `regress-fix.md`, `regress-fix2.md`, `regress-fix3.md` (et `.out`), `refit-unfold.md` (notes de vague, dépôt de travail) | tuple publié V1 ; consignes des correctifs PR #314 (correctifs, extension, reprise de la CI, réajustement au dépli de REQ-R7-30) |
| Revue indépendante (révision r1, `ACCEPT WITH CHANGES`, 6 constats), intégrée en r2 | revue r1 de cette spécification, deux revues indépendantes (`NOT MERGEABLE`), intégrées en r4 |
| `V7-REPORT.md` (re-rendu h-cond, dossier kits r7) | re-rendu h-cond sur le tuple V1 (taux de repli, 38 états de pli) |
| dossier h-cond antérieur à v7 (dossier kits r7) | dossier antérieur à v7 : `@sentropic/design-system-svelte 0.41.5` et `@sentropic/diagram-canvas 0.2.5` publiés (`node_modules`, `dist/DiagramSceneFigure.svelte`) ; `src/themes.js` (échelle forcée `0,474`) ; REQ-R7-30 |
| `framework.decision-dossier.v4.json` (notes de vague, dépôt de travail) | verbatims owner du 12/11 sur les frameworks (contexte de REQ-R7-26) |
| Dépôt DS (lecture seule) | `origin/main`, `origin/fix/r7-v1-regressions` (PR #314), `origin/feat/diagram-de2` (PR #315), `origin/feat/diagram-codecs` (PR #317), `origin/feat/diagram-e1` (PR #318), CI des PR (`gh pr checks`), tags distants, `.track/events.jsonl` (copie de travail locale) |

## Repository state at snapshot

| Item | Fact |
|---|---|
| V1 (DE-1) | publiée (tuple ci-dessus) ; PR #308 fusionnée (20/11 02:59 UTC) ; re-rendu h-cond (`V7-REPORT.md`) : 6 figures, 38 états de pli, 130 bascules, PASS |
| PR #314 `fix/r7-v1-regressions` | **fusionnée** (`b303096b9` sur `origin/main`) ; correctifs V1-patch : alignement, bouton `+/-` et variables d'en-tête `v2`, tests de zoom, `W1-02`, `W1-12`, surface de zone non héritée, groupe 5, champs `anchor` des tests d'en-tête, réajustement caméra et hauteur de cadre au pli / dépli sans débordement (REQ-R7-30, tests Svelte et Vue), diagram-core 0.4.1 et tokens / themes 0.15.1 avec cascade du workspace refaite, survol `+/-` `v1` / `surface1` identique à 0.41.5 et `W1-12` limité à `surface2` ; corps de PR réécrit le 20/11 (tableau des 26 lignes de l'audit, « Encore différent volontairement », commits par groupe), qui documente les bumps et REQ-R7-30. État au 20/11 21:00 EST |
| PR #315 `feat/diagram-de2` | ouverte, tournée de correctifs 2 (étapes DE-2 1 à 8, cascade, 0 conflit sur tous les états de pli, styles de connecteurs et géométrie au dépli, pointes `@4` `arrow | none` et scènes first-paint r7, parité Vapor au runtime, retour des effets de bord non demandés, harnais de pli first-paint et largeurs de fit initial, retrait de CSS hex brut et fixture marqueur SSR Svelte) ; vise diagram-core 0.5.0, diagram-canvas 0.4.0, tokens + themes 0.16.0, svelte 0.44.0, vue 0.41.0-next.9 ; ne contient pas les commits de PR #314 fusionnée. État au 20/11 21:00 EST |
| PR #317 `feat/diagram-codecs` | ouverte (E2) ; paquet neuf, plomberie publish, README, vérifieur smoke, au-dessus de l'historique DE-2 partagé ; aucun tag `diagram-codecs-v*`. État au 20/11 21:00 EST |
| PR #318 `feat/diagram-e1` | ouverte (E1) ; fixture et doc chaîne, parité 3 cibles, pli / dépli vivant canvas, Svelte et Vue, au-dessus de l'historique DE-2 partagé. État au 20/11 21:00 EST |
| PR #319 `fix/review-b5-element-anchors` | fusionnée sur `origin/main` (review-core bumpé 0.1.1). État au 20/11 21:00 EST |
| H2, N2 | aucune branche ; aucun tag `diagram-codecs-v*` |
| `main` | `design-system-svelte` 0.43.0 **publié** (tag distant `svelte-v0.43.0`) ; `review-core` 0.1.0 et 0.1.1 **publiés** (tags distants `review-core-v0.1.0`, `review-core-v0.1.1`) ; wave 1.1 en cours de publication sous GO owner (diagram-core 0.4.1, diagram-canvas 0.3.1, tokens / themes 0.15.1, svelte 0.43.1, vue 0.41.0-next.9). État au 20/11 21:00 EST |
| Track | Items diagrammes recensés (date de création UTC, état de réalisation). **r7 (20/11, `to-do`)** : `01M7WJN7NM6DXX9GSMPCXGZTAR` (centrage `v1`), `01M7WJN7TP4WTKTSK3M0H064EQ` (taille du `+/-`), `01M7WJN7ZTQRQZ441VF9J35599` (zoom et taille maximale), `01M7WJN8595HFTM982VRNHJVYB` (ISO r7 v10), `01M7X6P2X37V4HK1ZPQ7HJZZA9` (REQ-R7-30, débordement au dépliage). **Par exigence (20/11, `to-do`, table « Track trace »)** : 30 items `01M7X7G*` et `01M7WJN*`, un par `REQ-R7-01` à `REQ-R7-30`. **Antérieurs, liés aux exigences r7** : `01M7H1MQK9CZKY6Z1G2JV3XF45` (16/11, centrage du corps sous le titre, `done`, REQ-R7-06) ; `01M7EGPAJE9KZKJ9E91DKC0F3E` (15/11, publication de `ds-layout-hints@1` par diagram-core, `to-do`, REQ-R7-21) ; `01M77RSBEGJX68Y8P7VMK626GJ` (12/11, bibliothèque diagrammes Vue Vapor P1, `in-progress`, REQ-R7-26) ; `01M77RSBKPZ9458JS0K13D69S7` (12/11, bibliothèque diagrammes Preact+Signals P2, `to-do`, REQ-R7-26). **Autres items diagrammes, hors parcours r7 (12-13/11, `to-do`)** : `01M780VAJXF6KGTM1CPDRMNKGR` (notation `erd@1`), `01M78MWRF2YJXW2NWWWN9X5PFD` et `01M78T94C2Z6NXDBKWD2PRNX9N` (DC-2c), `01M7966970267AAR2ZEX4628TM` (DC-2d), `01M79668YAG5J230DCQCVY7XT3` (inventaire JointJS + GoJS). Aucun item par lot DE-2, H2, N2 (E1 et E2 couverts par les PR #318 et #317) ; aucun item Angular diagramme |

## Index

| id | Exigence | Lot / vague | Statut |
|---|---|---|---|
| REQ-R7-01 | Lancer l'évolution r7 au plus vite (temps 1) | DE-1 V1 · DE-2+E1+E2 V2 · H2 V3 | en construction (V1 fait-publié) |
| REQ-R7-02 | Complément ArchiMate ARD/HLDD en temps 2 | N2 · V4 | planifié |
| REQ-R7-03 | Cadrage : parcours DS, d2d utilisateur parmi d'autres, aucun contenu client | transverse | en construction |
| REQ-R7-04 | Gris alternés un niveau sur deux, clair et sombre | DE-1 · V1 | fait-publié ; effets de bord : corrigé (PR #314 fusionnée, wave 1.1 en cours de publication sous GO owner) |
| REQ-R7-05 | Garder le pli/dépli | chaque lot | fait-publié (V1) ; en construction (V2, PR #315 ouverte — état au 20/11 21:00 EST) |
| REQ-R7-06 | Carte compacte, corps centré sous le titre | DE-1 · V1 | fait-publié ; défaut `createView()` : corrigé (PR #314 fusionnée, wave 1.1 en cours de publication sous GO owner) |
| REQ-R7-07 | Pas de centrage sur les cartes complètes | V1-patch | corrigé (PR #314 fusionnée, wave 1.1 en cours de publication sous GO owner) |
| REQ-R7-08 | Bouton `+/-` inchangé, survol « bouton classique » | V1-patch | corrigé (PR #314 fusionnée, wave 1.1 en cours de publication sous GO owner) |
| REQ-R7-09 | Taille maximale de la figure et zoom inchangés | V1-patch | corrigé (PR #314 fusionnée, wave 1.1 en cours de publication sous GO owner) |
| REQ-R7-10 | Titre une ligne, icône optionnelle sans perte de texte | DE-1 · V1 | fait-publié ; effets de bord : corrigé (PR #314 fusionnée, wave 1.1 en cours de publication sous GO owner) |
| REQ-R7-11 | Coudes arrondis, flèches plus épaisses | DE-2 · V2 | en construction (PR #315 ouverte — état au 20/11 21:00 EST) |
| REQ-R7-12 | Légende automatique ancrée à droite | DE-2 · V2 | en construction (PR #315 ouverte — état au 20/11 21:00 EST) |
| REQ-R7-13 | Espacement minimal des routes et contrôle géométrique | DE-2 · V2 | en construction (PR #315 ouverte — état au 20/11 21:00 EST) |
| REQ-R7-14 | Une seule gouttière entre zones sœurs | DE-2 · V2 | en construction (PR #315 ouverte — état au 20/11 21:00 EST) |
| REQ-R7-15 | Sens des flèches : source = initiateur | DE-2 · V2 | en construction (PR #315 ouverte — état au 20/11 21:00 EST) |
| REQ-R7-16 | Pas d'acronyme opaque comme étiquette de zone | DE-2 · V2 | en construction (PR #315 ouverte — état au 20/11 21:00 EST) |
| REQ-R7-17 | Emphase de lien : ensemble fermé, aucune couleur libre | DE-2 · V2 | en construction (PR #315 ouverte — état au 20/11 21:00 EST) |
| REQ-R7-18 | Ajustement à la fenêtre | DE-2 · V2 | en construction (PR #315 ouverte — état au 20/11 21:00 EST) |
| REQ-R7-19 | Chaîne E1 : modèle engram → Svelte / Vue / SVG | E1 · V2 | en construction (PR #318 ouverte — état au 20/11 21:00 EST) |
| REQ-R7-20 | E2 : `@sentropic/diagram-codecs`, export draw.io statique | E2 · V2 | en construction (PR #317 ouverte — état au 20/11 21:00 EST) |
| REQ-R7-21 | Préférences de placement `ds-layout-hints@2` | H2 · V3 | planifié |
| REQ-R7-22 | Option de ratio cible 16:9 | H2 · V3 | planifié |
| REQ-R7-23 | ISO r7 v10 : placement et flèches, en restant repliable | exact : NON PRÉVU · préférences H2 V3 · style des flèches DE-2 V2 | non prévu (exact) ; planifié (préférences) |
| REQ-R7-24 | Panneaux comparés, annotations | N2 · V4 | planifié |
| REQ-R7-25 | Mode de rendu « sans pli » pour les dossiers | NON PRÉVU | non prévu |
| REQ-R7-26 | Quatre cibles framework | Svelte, Vue : V1–V4 · Preact, Angular : à ajouter | Svelte, Vue : fait-publié ; Preact, Angular : non prévu |
| REQ-R7-27 | Règle de présentation et de validation | transverse, à ajouter | en construction |
| REQ-R7-28 | Tout changement non demandé est une régression | transverse, à ajouter | V1 : corrigé (PR #314 fusionnée, wave 1.1 en cours de publication sous GO owner) ; V2 : non prévu |
| REQ-R7-29 | Libellé d'inclusion localisable dans le texte de repli (DE-1b) | DE-1 · V1 ; effet de bord : V1-patch | fait-publié ; effet de bord `W1-28` : corrigé (PR #314 fusionnée, wave 1.1 en cours de publication sous GO owner) |
| REQ-R7-30 | Aucun débordement au dépliage : la figure se réajuste | correctif (PR #314 fusionnée) · V1-patch | corrigé (PR #314 fusionnée, wave 1.1 en cours de publication sous GO owner) |

## Requirements

### Frame

<a id="req-r7-01"></a>

#### REQ-R7-01 — Lancer l'évolution diagrammes r7 au plus vite (temps 1)

- **Owner verbatim (18/11)** : « on en est où du dossier diagramme r7 ; j'aimerais lancer au plus vite l'évolution pour les diagrammes, quitte à faire un complément pour la partie ARD/HLDD ArchiMate dans un temps 2 »
- **Acceptance criterion** : le temps 1 est livré en trois vagues publiées l'une après l'autre, chacune après un GO owner séparé, sans attendre ArchiMate : V1 (DE-1), V2 (DE-2 + E1 + E2), V3 (H2). Une vague (V1-patch compris) n'est taguée qu'après la cascade du workspace, porte de chaque vague : `spacing.generated.ts` (`scripts/sync-diagram-spacing.mjs`), pins des `~160` consommateurs du workspace, `package-lock.json`, `component-index`, `destinationSha256` de `m1-provenance.json`, artefacts `.graphify` ; ordre des tags `diagram-core-v*` → `diagram-canvas-v*` → `core-v*` (`tokens` + `themes` en lockstep) → `svelte-v*` / `vue-v*-next.*` → `diagram-codecs-v*`, jamais de tag nu `v*` pour Svelte. Après chaque vague, le dossier h-cond est re-rendu sur les versions publiées, contournements retirés (pas de jeton d'échelle, pas d'abus de bordure de zone, pas de légende de page, pas d'états SVG statiques). Un écart restant devient un blocage exact, jamais un correctif de page.
  - *Owner looks at* : le dossier re-rendu de la vague et la note de changement visuel (avant / après) ; la conformité aux exigences de la vague (REQ-R7-04 à REQ-R7-23, REQ-R7-29, REQ-R7-30).
- **Covering lot / wave** : DE-1 (V1) ; DE-2 + E1 + E2 (V2) ; H2 (V3).
- **Status** : en construction — V1 fait-publié (tuple V1) ; V1-patch corrigé (PR #314 fusionnée `b303096b9`, wave 1.1 en cours de publication sous GO owner : diagram-core 0.4.1, diagram-canvas 0.3.1, tokens / themes 0.15.1, svelte 0.43.1, vue 0.41.0-next.9) ; V2 en construction (PR #315 ouverte pour DE-2, PR #318 ouverte pour E1, PR #317 ouverte pour E2) ; V3 planifié. État au 20/11 21:00 EST.
- **Known gaps** : V1 rejetée par l'owner le 20/11 (REQ-R7-07, -08, -09, -23) ; aucun item track par lot DE-2, H2, N2 ; recouvrement de versions entre PR #314 fusionnée et PR #315 (`vue 0.41.0-next.9`) ; V1-patch fusionné (diagram-core 0.4.1, tokens et themes 0.15.1, cascade refaite) et en cours de publication sous GO owner ; PR #317 et #318 branchées sur l'historique DE-2 partagé, à remettre à jour sur `main` avec la wave 1.1 après PR #315.
- **Trace** : `OWNER-ADDENDA.md:2` ; `PLAN-r3.md:71-84` (cascade et tags : `PLAN-r3.md:80-81`).

<a id="req-r7-02"></a>

#### REQ-R7-02 — Complément ArchiMate (ARD/HLDD) en temps 2

- **Owner verbatim (18/11)** : même phrase que REQ-R7-01 : « … quitte à faire un complément pour la partie ARD/HLDD ArchiMate dans un temps 2 »
- **Acceptance criterion** :
  1. `diagram-notation@2` est publié une seule fois, en N2 ; le digest de `@1` ne change pas ;
  2. N2 livre `validateNotation`, `validateViewNotation` et `resolveNotation`, absents aujourd'hui (`notation.ts:19`) ;
  3. les types d'éléments par couche (62 déclarations de types natifs d'`archimate@2`, `archimate2.ts:3-4` : l'abstrait `element` et les 61 concepts du catalogue épinglé) et les 11 types de relation déclarés dans `archimate2.ts:21-33` (dont `influence`), plus `groupingContainment`, sont des données de registre résolues vers les tokens DE-2 ;
  4. chaque relation porte son extrémité ArchiMate (losanges pleins et creux, triangles creux, etc.), identique sur SVG, Svelte, Vue et `toDrawio` ;
  5. les bandes de couches réutilisent le solveur H2 ; le pli/dépli reste actif.
  - *Owner looks at* : les vues ArchiMate de référence sur les quatre cibles ; le symbole de chaque relation ; replier une couche.
- **Covering lot / wave** : N2, V4 (temps 2) ; dépend de DE-2, H2 et E2.
- **Status** : planifié (60–95 h, à affiner au lancement du temps 2).
- **Known gaps** : aucun symbole ArchiMate avant N2 (`D2D-PIPELINE-DS-ANSWER.md` (e)) ; icônes limitées aux 8 glyphes génériques gelés, sans icônes éditeur ; PR #315 avait ajouté `open-triangle` et `filled-triangle` au registre de la vue `@4` ; la tournée de correctifs les retire (`8c23d804c` : `arrow | none`), les triangles creux restent réservés à N2 (D-5 close) ; liste des vues de référence ARD/HLDD : `missing source`.
- **Trace** : `PLAN-r3.md:66-69` ; `packages/diagram-core/src/profiles/archimate2.ts:3-4,21-33` ; `packages/diagram-core/src/notation.ts:19`.

<a id="req-r7-03"></a>

#### REQ-R7-03 — Cadrage : parcours diagrammes r7 du DS, d2d utilisateur parmi d'autres

- **Owner decision (19/11, consignée en anglais, `OWNER-ADDENDA.md:19`)** : *"Framing: this is NOT a workflow « for d2d ». It is the DS r7 diagram workflow; d2d is one user of it; its feedback is capitalised (e.g. alternating grey every other layer)."* Verbatim owner direct : `missing source`.
- **Acceptance criterion** : chaque demande générique d'un utilisateur devient une règle du moteur ou un token DS, jamais un réglage de page ; aucun contenu client dans les commits, fixtures et goldens ; le DS n'ouvre aucun espace de travail utilisateur et n'importe pas `engram` ; la figure de référence est celle du DS.
  - *Owner looks at* : les noms et contenus des fixtures et goldens de chaque PR (génériques) ; la note de vague qui liste les demandes capitalisées.
- **Covering lot / wave** : transverse (`PLAN-r3.md` §1).
- **Status** : en construction (règle appliquée vague par vague).
- **Known gaps** : contrôle automatique « aucun contenu client » côté DS non identifié (`unverified`).
- **Trace** : `PLAN-r3.md:7` ; `DOSSIER.md` annexe 4.

### Wave 1 — cards, zones, folding (DE-1 and V1-patch)

<a id="req-r7-04"></a>

#### REQ-R7-04 — Gris alternés un niveau d'imbrication sur deux

- **Owner verbatim (18/11)** : « il faut prendre les dernières demandes de modification génériques demandées côté D2D, essentiellement pour des niveaux de gris 1 layer sur deux dans les cartes en gigogne. et je veux garder le côté repliable »
- **Relayed (d2d-cond, 18/11, demande 1)** : *"Alternating backgrounds by nesting depth: one engine rule computing a background per depth parity for ZONES and nested groups (light grey / white alternating), top level white when it must be, page background may be light grey; selectable parity; semantic card tints (legend colours, « managed service » white) never change; engine may flag a white card sitting on a white zone. Dark mode: two surface tokens per theme (surface-1 / surface-2)."*
- **Acceptance criterion** :
  1. chaque zone, dépliée ou repliée en carte, est peinte en `surface1` ou `surface2` selon la parité de sa profondeur, en clair et en sombre, sur les 3 thèmes cœur, sans code de page ;
  2. `depthParityStart` (0 ou 1) choisit la parité de départ ;
  3. les teintes sémantiques des cartes ne changent pas ;
  4. le diagnostic opt-in `zone-surface-same` signale une carte blanche non teintée sur une zone blanche ;
  5. les surfaces sont ré-estampillées après chaque pli/dépli ;
  6. aucun autre élément ne change de couleur (REQ-R7-28).
  - *Owner looks at* : une figure à 3 niveaux, en clair puis en sombre : blanc / gris clair / blanc ; la même figure après repli d'une zone intermédiaire ; le survol du `+/-` sur une zone grise (REQ-R7-08).
- **Covering lot / wave** : DE-1, V1 ; effets de bord : V1-patch.
- **Status** : fait-publié (tokens + themes 0.15.0, diagram-canvas 0.3.0, svelte 0.42.0, vue 0.41.0-next.8) ; effets de bord : corrigé (PR #314 fusionnée `b303096b9`, wave 1.1 en cours de publication sous GO owner). État au 20/11 21:00 EST.
- **Known gaps** (corrigés par PR #314 fusionnée, wave 1.1 en cours de publication sous GO owner ; « Repository state at snapshot ») : `W1-12` : `surface2` a exactement la couleur du fond de survol du bouton `+/-`, le survol devient invisible (REQ-R7-08) ; le survol `v1` / `surface1` est restauré identique à 0.41.5 (`diagram-anatomy.v1.json` 0 diff) et `W1-12` est limité à `surface2` ; `W1-35` : le SVG autonome déclare des valeurs claires en dur qui écrasent un thème sombre hôte ; valeurs limitées à `svg:root` ; `W1-14` : les 150 thèmes de marque ne publient pas les nouveaux tokens (repli sur les fallbacks) ; seul un test de compilation d'un thème de marque (`packages/themes/src/compile.test.ts`) est ajouté, aucun CSS de `packages/theme-*` n'est régénéré. Hors PR : l'écart de luminance entre `#ffffff` et `#f8fafc` en clair est faible : lisibilité de l'alternance à valider à l'œil par l'owner.
- **Trace** : audit `W1-11`, `W1-24`, `W1-25`, `W1-32`, `W1-34` (progrès), `W1-12`, `W1-14`, `W1-35` ; tests `diagramDepthStamping.test.ts:186`, `diagram-parity.test.ts:131`.

<a id="req-r7-05"></a>

#### REQ-R7-05 — Garder le pli/dépli sur le chemin de rendu r7

- **Owner verbatim (18/11)** : « … et je veux garder le côté repliable »
- **Owner decision (19/11, consignée en anglais, `OWNER-ADDENDA.md:21`)** : *"Do not lose folding/unfolding: it was lost with the r7 kit but existed before; the r7 rendering path must keep fold/unfold with relayout and link recompute (DiagramSceneFigure behaviour), tested."* Relais d2d (18/11) : *"Folding kept."*
- **Acceptance criterion** : sur toute scène r7 (anatomie compacte, imbrication) :
  1. chaque conteneur repliable se replie et se déplie avec relayout des voisins, recalcul et regroupement des liens ;
  2. replier un ancêtre masque tous ses descendants (cartes, zones, ports, liens) ;
  3. moteur et hôte concordent à 1/64 px ; les surfaces de profondeur sont ré-estampillées ; `aria-expanded` et le focus sont conservés ; animation de 240 ms qui respecte reduced-motion (comportement actuel de `DiagramSceneFigure`) ;
  4. à partir de V2 : la légende suit l'état de pli ; le contrôle d'espacement reste à 0 conflit dans les 38 états de pli de l'ensemble de référence ;
  5. à partir de V3 : bandes et colonnes conservées à l'état replié ;
  6. Svelte et Vue identiques. Un lot qui rend r7 de façon statique n'est pas terminé.
  - *Owner looks at* : dans le dossier re-rendu, replier puis déplier un conteneur externe d'une figure imbriquée ; mêmes gestes en Svelte et en Vue, à la souris et au clavier (Entrée, Espace).
- **Covering lot / wave** : chaque lot (DE-1 V1, DE-2 V2, H2 V3, N2 V4).
- **Status** : fait-publié pour V1 (correctif du pli imbriqué `W1-36` : diagram-canvas 0.3.0, svelte 0.42.0, vue 0.41.0-next.8) ; en construction pour V2 (PR #315 ouverte — état au 20/11 21:00 EST).
- **Known gaps** : la CI DS de PR #315 énumère désormais tous les états de pli visibles des scènes de référence (84 états, déplié compris : `d937fb1cd` exige 0 conflit partout, dont l'état déplié qui tolérait des `info`) ; les 38 états de l'ensemble h-cond de référence restent vérifiés côté h-cond, sur le tuple V1 (`V7-REPORT.md` §3) ; `toDrawio` est statique par conception ; Preact et Angular n'ont aucun composant diagramme (REQ-R7-26).
- **Trace** : `PLAN-r3.md:8,19,38` ; tests `DiagramSceneFigure.test.ts:823` (Svelte), `diagram-parity.test.ts:493` (Svelte et Vue), `diagramAnatomyV2.test.ts:433` (canvas), `linkLegend.test.ts` (PR #315).

<a id="req-r7-06"></a>

#### REQ-R7-06 — Carte compacte et corps centré sous le titre

- **Relayed (note DS, demandes du kit r7, 15/11, `ds-position-engine.md:23-28`)** : *"smaller default card (−20 to −30 %); body text centred horizontally and vertically under the title"*, avec *"These change rendering for every consumer, so they ship as a versioned anatomy change (a minor version with a visual-change note)"*.
- **Relayed (item track `01M7H1MQK9CZKY6Z1G2JV3XF45`, créé le 16/11 UTC, `done`)** : *"Owner request (via engram, 15/11, secondary): on every diagram card, centre the body text (e.g. …) horizontally and vertically in the area remaining under the title, instead of top-left. Card anatomy change (renderCardSvg / DiagramCard), Svelte and Vue identical, frozen 460x200 card size unchanged, first-paint and anatomy gates updated."* (exemple élidé). Verbatim owner direct : `missing source` ; la demande owner du 15/11 sur le centrage du corps n'est connue que par ce relais engram ; la carte compacte renvoie au choix de l'owner dans le dossier conjoint.
- **Acceptance criterion** :
  1. les nouvelles vues r7 rendent des cartes `352 × 154`, soit environ −23 % par côté face à `460 × 200` ;
  2. le bloc corps est centré horizontalement et verticalement sous le titre (comportement présent depuis diagram-canvas 0.2.5, conservé) ;
  3. les vues existantes restent en `v1` `460 × 200` au pixel près ; `diagram-anatomy.v1.json` inchangé octet pour octet ;
  4. en cas de débordement, repli par boîte sur `v1` sans perte de texte ; taux de repli `0` sur les six figures de référence ;
  5. rendu tenu à `1440 × 900` et à `390 × 844` ;
  6. `align: "left" | "center"` n'existe que dans le contrat `diagram-presentation@2` ; `diagram-presentation@1` est inchangé et un `align` sous pin `@1` échoue à la validation (`PLAN-r3.md:17-18`, audit `W1-04`, `W1-05`).
  - *Owner looks at* : les six figures de référence re-rendues, en desktop et en téléphone : cartes compactes, corps centré, aucune carte basculée en `460 × 200` ; une vue existante : inchangée.
- **Covering lot / wave** : DE-1, V1 ; défaut de création de vue : V1-patch.
- **Status** : fait-publié (diagram-core 0.4.0 pour `diagram-presentation@2`, diagram-canvas 0.3.0, svelte 0.42.0, vue 0.41.0-next.8) ; défaut `createView()` : corrigé (PR #314 fusionnée `b303096b9`, wave 1.1 en cours de publication sous GO owner). État au 20/11 21:00 EST.
- **Known gaps** :
  - `W1-02` : en 0.4.0, `DEFAULT_PRESENTATION` porte `anatomy: "v2"`, donc toute vue créée par `createView()` sans `presentation` (y compris `erd.ts`) passe en compact. Corrigé par PR #314 fusionnée (`DEFAULT_PRESENTATION` = `{ camera }` sans `anatomy`, `v2` en opt-in explicite), wave 1.1 en cours de publication sous GO owner (diagram-core 0.4.1, cascade refaite) ; le correctif retient l'option « opt-in explicite » de D-2, à valider par l'owner.
  - Taux de repli non nul : 26 cartes sur 39 basculent en `460 × 200` sur les six figures h-cond (`V7-REPORT.md` §2). Cause : `v2` garde les polices de `v1` (22 / 32 / 24 px) et il manque `0,5625 px` pour deux lignes de corps sous un sur-titre. Aucun lot ne le traite (à ajouter, décision D-9).
  - Centrage du titre en `v2` : `PLAN-r3.md` DE-1 fixe `align` par défaut à `center` en `v2` ; PR #314 fusionnée le rend opt-in (`align: "center"` explicite). Décision D-1.
  - `W1-09` : taille relative du `+/-` en `v2` (REQ-R7-08) ; `W1-10` : retrait corps / icône inversé en `v2`, corrigé (token `diagramCardCompact.bodyInsetFromBar` à `10px` dans `component.ts` et les 3 CSS cœur, tokens et themes non incrémentés).
- **Trace** : track `01M7H1MQK9CZKY6Z1G2JV3XF45` ; audit `W1-01`, `W1-04`, `W1-05`, `W1-08`, `W1-15`, `W1-18`, `W1-20`, `W1-22`, `W1-29`, `W1-30`, `W1-33` (progrès), `W1-02`, `W1-09`, `W1-10` ; `PLAN-r3.md:17-19`.

<a id="req-r7-07"></a>

#### REQ-R7-07 — Pas de centrage sur les cartes complètes

- **Owner verbatim (20/11)** : « … et y a des changements non souhaités : centrage quand il y a le mode carte "complete" = non … »
- **Acceptance criterion** : sur toute carte complète (`v1`, ou `fallback-v1` dans une vue compacte) et sur toute zone dépliée sans `align: "center"` explicite :
  1. sur-titre, titre et pied alignés à gauche (`anchor: "start"`), sans classe `st-diagramCard--center` ni `st-diagramZone--center`, comme en svelte 0.41.5 et vue 0.41.0-next.7 ;
  2. le bloc corps garde son centrage de 0.41.5 ;
  3. `align: "center"` est ignoré sur `v1` et sur `fallback-v1` ;
  4. `diagram-anatomy.v1.json` : 0 diff face au tag `diagram-canvas-v0.2.5` ; golden `v2` régénéré avec `anchor: "start"` sur `fallback-v1`.
  - *Owner looks at* : dans une figure compacte, une carte longue (sur-titre et corps sur 2 lignes) qui passe en `460 × 200` : titre à gauche comme avant ; la même carte en Svelte et en Vue.
- **Covering lot / wave** : V1-patch (PR #314 fusionnée), hors `PLAN-r3.md`.
- **Status** : corrigé (PR #314 fusionnée `b303096b9`, wave 1.1 en cours de publication sous GO owner) — `W1-16`, `W1-17`, `W1-37`, `W1-39`, `W1-43`, `W1-51`, `W1-54` ; « Repository state at snapshot » ; versions diagram-canvas 0.3.1, svelte 0.43.1, vue 0.41.0-next.9. État au 20/11 21:00 EST.
- **Known gaps** : PR #315 ne contient pas ce correctif : elle doit être remise à jour sur `main` avec la wave 1.1 avant fusion, sinon elle republierait la régression ; collision sur `vue 0.41.0-next.9`.
- **Trace** : track `01M7WJN7NM6DXX9GSMPCXGZTAR` ; tests `DiagramCard.test.ts` (« never applies st-diagramCard--center on v1, fallback-v1, or unaligned v2 cards … »), `DiagramZone.test.ts`, `diagramAlign.test.ts`, `diagramAnatomyV2.test.ts` (« fall back per box to frozen v1 keeping the full body and 0.41.5 alignment … »).

<a id="req-r7-08"></a>

#### REQ-R7-08 — Bouton `+/-` inchangé, y compris son survol « bouton classique »

- **Owner verbatim (20/11)** : « … et des +/- qui ont changé de taille … » ; et « y avait un hover bouton avec le bouton classique » (20/11, cité par le brief d'audit `audit-wave1.md` et par `REGRESSION-AUDIT-wave1.md` `W1-12`).
- **Acceptance criterion** :
  1. sur cartes et zones `v1` ou `fallback-v1` : bouton de 32 px (`st-iconButton--sm`, `variant="ghost"`), glyphe `0.875rem`, position `x = 420, y = 8` sur une carte de 460 px et `x + width − 40, y + 8` sur une zone, bord droit d'en-tête `containerPadding ?? contentInsetInline` : valeurs de svelte 0.41.5 et vue 0.41.0-next.7 ;
  2. aucune variable d'en-tête `v2` (`--st-component-diagramCard-iconSize`, `--st-component-diagramCard-iconTextGap`, `--st-component-diagramZone-headerInset`) ni la surface de profondeur (`--st-component-diagramZone-surface`) n'est héritée par une carte ou une zone enfant ;
  3. au survol, un fond de survol visible sur `surface1` et sur `surface2`, en clair et en sombre, en Svelte et en Vue, sur les 3 thèmes cœur ;
  4. sur les cartes compactes `v2`, taille apparente du `+/-` validée par l'owner (D-3).
  - *Owner looks at* : survoler le `+/-` d'une zone grise puis d'une zone blanche, en clair puis en sombre ; comparer la taille du `+/-` avec une capture 0.41.5 de la même figure.
- **Covering lot / wave** : V1-patch (PR #314 fusionnée).
- **Status** : corrigé (PR #314 fusionnée `b303096b9`, wave 1.1 en cours de publication sous GO owner) — taille et placement `v1` (`W1-44`, `W1-55`) et isolation des variables d'en-tête `v2` (`W1-45`, `W1-56`, partie en-tête) corrigés ; surface `--st-component-diagramZone-surface` non héritée (`W1-45`, `W1-56`, partie surface : fond non hérité) ; survol (`W1-12`) : le survol `v1` / `surface1` est restauré identique à 0.41.5 ; position verticale (`W1-46`, `W1-58`) corrigée. État au 20/11 21:00 EST.
- **Known gaps** : `W1-12` : survol invisible en 0.42.0 (`#f8fafc` sur `#f8fafc` en clair, `oklch(19% 0.014 250)` sur lui-même en sombre) ; `a749e2483` passe le survol du `+/-` sur `--st-component-button-secondaryHoverBackground` (`#e2e8f0` en clair, `oklch(28% 0.014 250)` en sombre) avec la bordure `--st-component-control-border`, puis `2a60db8ee` restaure le survol `v1` / `surface1` identique à 0.41.5 (`diagram-anatomy.v1.json` 0 diff) et limite le nouveau survol à `surface2` : rendu `surface2` à valider par l'owner face au « bouton classique » de 0.41.5 ; `W1-09` : en `v2`, le `+/-` garde 32 px sur une carte réduite d'environ 23 % et le zoom de fit monte jusqu'à +30 %, il paraît donc plus grand ; la consigne actuelle est de le garder et de le faire valider par l'owner ; `W1-46` / `W1-58` : la position verticale ne dépend plus d'une variable CSS héritée (calcul depuis `headerInset` / `toggleTopOffset`, `90aa6dd81`).
- **Trace** : track `01M7WJN7TP4WTKTSK3M0H064EQ` ; tests `DiagramZone.test.ts` (« pins v1 card and zone fold toggle placement and size to 0.41.5 … »), `diagram-parity.test.ts` (« pin v1 expanded zone header inset and toggle geometry to 0.41.5 / next.7 … »), `diagramAnatomyV2.test.ts` (« pin v1 and fallback-v1 fold toggle size and placement … ») ; tests ajoutés par `a749e2483` (survol, 3 thèmes, clair et sombre, Svelte et Vue) et `0f8354fd2` (composition imbriquée sans fuite de surface ni de variable d'en-tête, Svelte et Vue).

<a id="req-r7-09"></a>

#### REQ-R7-09 — Taille maximale de la figure et zoom inchangés

- **Owner verbatim (20/11)** : « … et la taille max de viz/zoom qui va pas. »
- **Acceptance criterion** : pour une vue existante (`v1`) :
  1. `maxDisplayScale = 0.62` : une carte s'affiche au plus en `285 × 124 px` CSS ;
  2. `minReadableScale = 0.45` ; cadre de fit `min(largeur × 9/16, 0,85 × hauteur de fenêtre)` ; `fitHeight = 126 px` pour une carte `460 × 200` ;
  3. contrôles de zoom `+`, `-` et `0` inchangés ;
  4. aucune vue existante ne bascule en compact (sinon la carte plafonne à `218 × 95 px` CSS) ;
  5. valeurs identiques à svelte 0.41.5 et vue 0.41.0-next.7, épinglées par test.
  - *Owner looks at* : la même figure en 0.41.5 et après correctif, à `1440 × 900` : même hauteur de cadre, même taille de carte au zoom maximal.
- **Covering lot / wave** : V1-patch (PR #314 fusionnée).
- **Status** : corrigé (PR #314 fusionnée `b303096b9`, wave 1.1 en cours de publication sous GO owner) — tests d'épinglage ajoutés (Svelte, Vue, canvas) ; cause racine `W1-02` corrigée (`createView()` revient en `v1`, tests d'épinglage en diagram-core, canvas, Svelte et Vue) ; diagram-core 0.4.1 en cours de publication (cascade refaite). État au 20/11 21:00 EST.
- **Known gaps** : `W1-02` (REQ-R7-06) ; pour les vues compactes voulues, `0.62`, calibré pour `460 × 200`, plafonne la carte compacte à `218 × 95 px` CSS : calibrage `v2` à décider (D-3, `W1-13`) ; échelles relevées par h-cond sur le tuple V1 : 0,568 à 0,62 à 1440 px, 0,45 à 390 px.
- **Trace** : track `01M7WJN7ZTQRQZ441VF9J35599` ; tests « pin v1 figure max size and zoom bounds … to 0.41.5 values » dans `DiagramSceneFigure.test.ts`, `diagram-parity.test.ts`, `diagramSceneModel.test.ts` ; audit `W1-02`, `W1-13`.

<a id="req-r7-10"></a>

#### REQ-R7-10 — Titre sur une ligne, icône optionnelle sans perte de texte, débordement signalé

- **Relayed (d2d-cond, 18/11, demande 8)** : *"Card anatomy: one-line title priority, optional icon without text loss, or reported overflow."*
- **Acceptance criterion** :
  1. le titre tient sur une ligne en priorité ;
  2. `icon: "none"` récupère la largeur d'en-tête, sans faux `unknown` ;
  3. aucun caractère coupé sans diagnostic ; un débordement réel est signalé (`card-overflow` ou `zone-overflow`, avec son slot) ;
  4. un repli propre (`reason: "fallback-v1"`) n'est signalé comme troncature ni dans le DOM ni dans le SVG.
  - *Owner looks at* : une carte à titre long, avec puis sans icône : titre entier, ou débordement signalé ; une carte repliée proprement en `460 × 200` : aucune marque de débordement.
- **Covering lot / wave** : DE-1, V1 ; effets de bord : V1-patch.
- **Status** : fait-publié (diagram-canvas 0.3.0, svelte 0.42.0, vue 0.41.0-next.8 ; h-cond : 0 texte coupé, 45 icônes visibles sur les 6 figures) ; effets de bord : corrigé (PR #314 fusionnée `b303096b9`, wave 1.1 en cours de publication sous GO owner). État au 20/11 21:00 EST.
- **Known gaps** : `W1-19` / `W1-40` / `W1-52` : `data-card-overflow` posé sur une carte `fallback-v1` sans troncature ; `W1-23` : sous-titre de zone repliée `v2` plus étroit (288 px), donc plus de replis ; `W1-31` : clés de légende figées à 428 px en `v2`. Corrigés par PR #314 fusionnée (diagnostic `info` `fallback-v1` conservé sans attribut `data-card-overflow` / `data-zone-overflow` ; sous-titre de zone repliée `v2` porté à 304 px ; clés de légende dimensionnées par `cardWidthOf`), wave 1.1 en cours de publication sous GO owner.
- **Trace** : audit `W1-15`, `W1-18`, `W1-25` (a), `W1-41`, `W1-53` (progrès) ; `PLAN-r3.md:17`.

<a id="req-r7-29"></a>

#### REQ-R7-29 — Libellé d'inclusion localisable dans le texte de repli (DE-1b)

- **Relayed (plan DS : `PLAN.md:47-49`, 18/11 ; `PLAN-r3.md:17-18`, 19/11)** : *"DE-1b — Folding / recomposition hardening"* : *"the accessible fallback text names inclusions with the English word `contains`, which the engine currently refuses to relabel (fix: locale-aware inclusion label, screen-hidden text only)"* ; *"DE-1b folded in: locale-aware inclusion label replacing hard-coded `contains`."* Verbatim owner direct : `missing source` ; exigence de plan, rattachée au pli/dépli (REQ-R7-05) et classée progrès demandé de V1 par l'audit (`REGRESSION-AUDIT-wave1.md:18`).
- **Acceptance criterion** :
  1. dans `.st-diagramSceneFigure-fallback`, une inclusion `contains` est nommée par le libellé localisable `DiagramSceneFigureLabels.contains` (défaut `"includes"`), passé à `sceneTextRows`, en Svelte et en Vue ; aucun `"contains"` codé en dur ne reste ;
  2. libellé par défaut et libellé surchargé testés dans les deux hôtes ;
  3. sans effet de bord (REQ-R7-28, audit `W1-28`) : une relation raffinée (par exemple `type: "owns"` avec `baseType: "contains"`) garde son propre nom ; un objet typé `DiagramSceneFigureLabels` sans `contains` compile toujours ;
  4. texte masqué à l'écran seulement : aucune géométrie ni aucun rendu visible ne change.
  - *Owner looks at* : le texte de repli d'une figure imbriquée (lecteur d'écran ou DOM), avec le libellé par défaut puis avec un libellé surchargé, en Svelte et en Vue ; une relation raffinée y garde son nom.
- **Covering lot / wave** : DE-1 (DE-1b intégré), V1 ; effet de bord : V1-patch.
- **Status** : fait-publié (diagram-canvas 0.3.0, svelte 0.42.0, vue 0.41.0-next.8 : `DEFAULT_SCENE_LABELS.contains = "includes"`) ; effet de bord `W1-28` : corrigé (PR #314 fusionnée `b303096b9`, wave 1.1 en cours de publication sous GO owner) — substitution limitée à `relation.type === "contains"`, champ `contains` optionnel. État au 20/11 21:00 EST.
- **Known gaps** : `W1-28` publié en V1 : rupture TypeScript pour un `DiagramSceneFigureLabels` typé sans `contains`, et une relation raffinée (`owns`) affichée sous le libellé générique ; le critère 3 est atteint sur `main` après la fusion de PR #314.
- **Trace** : `PLAN.md:47-49` ; `PLAN-r3.md:17-18,20,97` ; audit `W1-47`, `W1-59` (progrès), `W1-28` (effet de bord) ; tests `DiagramSceneFigure.test.ts:809` (Svelte), `diagram-parity.test.ts:610` (Vue), `diagramAnatomyV2.test.ts:678,742` (canvas) ; test `W1-28` ajouté par `90aa6dd81` dans `diagramAnatomyV2.test.ts` (« refined subtype "owns" keeps its own type name »).

<a id="req-r7-30"></a>

#### REQ-R7-30 — Aucun débordement au dépliage : la figure se réajuste

- **Owner verbatim (20/11, 14:10, `OWNER-ADDENDA.md:37`)** : « j'espère que tu auras pas oublié les contraintes de type : je veux pas d'overflow (faut resizer le diag quand on déplie ... régression supplémentaire) »
- **Relayed (note DS, 20/11, `OWNER-ADDENDA.md:38`)** : *"Requirement: unfolding a zone never leaves part of the figure outside the frame; the figure refits (resizes) to show the whole unfolded diagram, folding refits back."*
- **Acceptance criterion** : sur toute figure r7 (`DiagramSceneFigure`, Svelte et Vue), après **chaque** pli ou dépli, une fois la transition terminée (240 ms ; immédiatement sous reduced-motion) — sans condition de caméra au fit avant la bascule : un zoom explicite posé avant la bascule est remis à zéro (« may be kept only until the next fold toggle », `refit-unfold.md`) :
  1. aucune partie hors du cadre : la boîte englobante peinte (cartes, zones, ports, liens et libellés ; légende à partir de V2, REQ-R7-12), mesurée dans le DOM, tient dans la zone visible du cadre à 0,5 px CSS près (tolérance de `scenePlacement`) ; aucune barre de défilement ; `data-pans="false"` ;
  2. réajustement dans les deux sens : le zoom appliqué (`data-zoom`) est le fit de cette boîte, soit le plus grand zoom, au plus `0,62` et au quantum `0,001`, qui la fait tenir dans le cadre maximal ; la hauteur du cadre est celle de la boîte à ce zoom, encart de 1 px de chaque côté compris, plafonnée au cadre maximal, à 1/64 px près (`cameraFit`) ; au repli : ni bande vide, ni zoom resté à celui de l'état déplié ;
  3. bornes de 0.41.5 inchangées (REQ-R7-09) : zoom de `0,45` à `0,62`, cadre maximal `min(largeur × 9/16, 0,85 × hauteur de fenêtre)` ; seule exception au critère 1 : un état dont le fit tomberait sous `0,45` reste à `0,45` et défile depuis son début (`cameraFit`), l'étendue de défilement couvrant toute la boîte peinte, sans partie inaccessible ;
  4. Svelte et Vue identiques, épinglés par un test de régression par hôte : dépli de la plus grande zone d'une scène de référence (boîte peinte dans le cadre), puis repli (réajustement) ;
  5. au re-rendu h-cond du correctif, à `1440 × 900` : 0 partie hors du cadre dans les 38 états de pli des six figures de référence, hors états dont le fit tombe sous `0,45` (listés dans le rapport).
  - *Owner looks at* : à `1440 × 900`, en Svelte puis en Vue, une figure imbriquée de référence au fit : déplier sa plus grande zone : toute la figure reste visible dans le cadre, sans carte ni lien coupé au bord et sans barre de défilement ; la replier : la figure se resserre sur le contenu replié, sans bande vide ; à `390 × 844`, la figure défile (plancher `0,45`) sans partie inaccessible.
- **Covering lot / wave** : correctif (PR #314 fusionnée), vague V1-patch, hors `PLAN-r3.md`.
- **Status** : corrigé (PR #314 fusionnée `b303096b9`, wave 1.1 en cours de publication sous GO owner) — régression signalée par l'owner le 20/11 à 14:10, absente des 60 lignes de `REGRESSION-AUDIT-wave1.md` ; correctif (« refit camera and frame height on fold/unfold without overflow »), avec tests Svelte et Vue épinglés par hôte ; consigne de correctif : `refit-unfold.md` (20/11). État au 20/11 21:00 EST.
- **Known gaps** :
  - Règle Z-7, antérieure à V1 : à chaque bascule de pli, l'hôte fige le zoom courant (Svelte `toggleFold` : `requestedZoom = zoom`, `atFit = false` ; Vue : `holdZoom`, `useDiagramSceneViewport.ts`, lu sur la branche de PR #315) ; ce zoom reste tant qu'il est dans la nouvelle plage, et la figure dépliée défile jusqu'au bouton `0`. Sur la branche de PR #315, le test Svelte « Z-7 a fold relayout reclamps the zoom into the new range; a zoom inside the range is preserved » l'épingle (« The cap is inside the unfolded range: preserved, the drawing now pans. »). svelte 0.41.5 publié a la même règle (`dist/DiagramSceneFigure.svelte:873-875`, aucun autre retour au fit que le changement de document et le bouton `0`) et `camera.ts` est inchangé de diagram-canvas 0.2.5 à 0.3.0 (`W1-13`) : le correctif (PR #314 fusionnée) change la règle Z-7, il ne rétablit pas un comportement de 0.41.5, contrairement à la prémisse de `refit-unfold.md` ; il est à classer « progrès demandé (REQ-R7-30) » dans l'audit de V1-patch (REQ-R7-28), test Z-7 modifié compris ; vue 0.41.0-next.7 non lu (`unverified`). Décision D-11.
  - Écart perçu par l'owner (« régression supplémentaire ») : cause `unverified`. Faits : le dossier h-cond antérieur à v7 (svelte 0.41.5) fixait `maxDisplayScale` et `minReadableScale` à `0,474` (`dossier/scenekit/src/themes.js:9,14`), plage de zoom réduite à un point ; v7 retire ce forçage (`V7-REPORT.md` §1) ; à `1440` px, 4 des 6 figures y sont au plafond `0,62` dans leur état par défaut (§2), zoom que la règle Z-7 garde au dépli.
  - Zoom explicite avant la bascule : la règle retenue est le réajustement à chaque bascule (`refit-unfold.md` : *"may be kept only until the next fold toggle"*), portée par PR #314 fusionnée ; garder la règle Z-7 reste l'option alternative (D-11), à valider par l'owner.
  - Plancher `0,45` : à `390 × 844`, les six figures de référence sont déjà à `0,45` dans leur état par défaut (`V7-REPORT.md` §2) : le critère 1 n'y est pas atteignable dans les bornes de REQ-R7-09 ; défilement sans partie inaccessible, à valider par l'owner face à « je veux pas d'overflow ».
  - La CI DS ne couvrira que la plus grande zone d'une scène de référence (consigne `refit-unfold.md`) ; les 38 états ne sont vérifiés qu'au re-rendu h-cond (critère 5, comme REQ-R7-05).
  - PR #315 ne contient pas les commits de PR #314 fusionnée (« Cross-cutting known gaps » §1) : critère à re-vérifier en V2 après sa remise à jour sur `main` avec la wave 1.1, légende (REQ-R7-12) et `fitToWindow` (REQ-R7-18) compris.
  - Lot : « correctif 0.42.1 » est le nom du patch V1 dans l'audit (`REGRESSION-AUDIT-wave1.md:25-26`) ; PR #314 fusionnée porte svelte 0.43.1 en cours de publication ; le correctif change la règle Z-7 en « progrès demandé (REQ-R7-30) », à classer au GO de V1-patch (REQ-R7-28).
- **Trace** : `OWNER-ADDENDA.md:36-38` ; track `01M7X6P2X37V4HK1ZPQ7HJZZA9` (créé le 20/11 à 19:24 UTC, `bug`, *"r7 regression: unfolding must never overflow — the figure refits (resizes) to show the whole unfolded diagram"*, `to-do` : aucune transition dans `.track/events.jsonl`) ; `refit-unfold.md` ; `packages/diagram-canvas/src/camera.ts` (`fitBox`, `cameraFit`) ; `scenePlacement` (`packages/diagram-canvas/src/presentation/diagramSceneModel.ts`) ; attributs `data-zoom`, `data-zoom-readout` et `data-pans` des deux hôtes ; test Z-7 de `DiagramSceneFigure.test.ts` (Svelte) ; exigences liées : REQ-R7-05, REQ-R7-09, REQ-R7-12, REQ-R7-18.

### Wave 2 — links, chain, export (DE-2, E1, E2)

<a id="req-r7-11"></a>

#### REQ-R7-11 — Coudes arrondis et flèches plus épaisses

- **Relayed (note DS, kit r7, 15/11, `ds-position-engine.md:26`)** : *"rounded elbows and a slightly thicker default stroke."* Verbatim owner direct : `missing source`.
- **Acceptance criterion** :
  1. chaque connecteur est un chemin arrondi (rayon `12`, plafonné à la moitié du segment le plus court) qui touche ses deux ancrages, produit par un seul constructeur partagé par SVG, Svelte et Vue ;
  2. les largeurs viennent des seuls tokens de lien `2.5 / 3.0 / 3.5 px` (aujourd'hui `1,5 px`, lié à la bordure de zone) ;
  3. le style de trait du schéma de vue `@4` admet `solid | dashed | dotted` ; `dashed` et `dotted` sont réellement peints ; les pointes viennent du registre ; les octets de `diagram-view-schema-3` ne changent pas ;
  4. la taille des libellés d'arête vient du token `edgeLabelSize` (`18px`) ; ils font au moins 8 px CSS à l'échelle de référence ;
  5. ces règles tiennent dans chaque état de pli ;
  6. la suite first-paint (`tools/diagram-first-paint/fixtures.js`) gagne les trois scènes de référence de style r7 (environ `36 → 48` cas).
  - *Owner looks at* : la même figure avant / après : coudes arrondis, traits plus épais, flèches au contact des cartes, pliée et dépliée.
- **Covering lot / wave** : DE-2, V2.
- **Status** : en construction (PR #315 ouverte, étapes 1 à 3 ; non publiée). État au 20/11 21:00 EST.
- **Known gaps** : le registre est réduit aux 2 pointes du plan (`arrow | none`) : D-5 close ; les 3 scènes first-paint r7 sont ajoutées (critère 6 atteint sur PR #315) ; les chemins sont routés : tracé identique à la référence r7 v10 non garanti (REQ-R7-23) ; changement visible sur toutes les figures existantes (progrès demandé, à présenter selon REQ-R7-27) ; aucun audit de régression V2 (REQ-R7-28).
- **Trace** : `PLAN-r3.md:28-31,38-39` ; sur PR #315 : `packages/diagram-core/src/connector-registry.ts:13` (`STROKE_STYLES` = `solid | dashed | dotted`), `packages/tokens/src/component.ts:1978` (`edgeLabelSize: "18px"`), `packages/diagram-core/schemas/diagram-view-schema-3.{json,sha256}` sans diff face à `origin/main` ; test `connectorPath.test.ts:79`.

<a id="req-r7-12"></a>

#### REQ-R7-12 — Légende automatique ancrée à droite

- **Relayed (note DS, kit r7, 15/11)** : *"an automatic link-style legend: the legend is generated from the styles actually used."* **Relayed (d2d-cond, 18/11, demande 4)** : *"Legend anchored on an edge (right by default), outside the flow of functional zones."*
- **Acceptance criterion** : la légende liste exactement les styles de lien présents, dans un ordre fixe, sur une bande de bord (à droite par défaut) hors du flux des zones fonctionnelles ; elle est incluse dans les bornes et le fit et recalculée à chaque pli, sans code de page ; aucune légende pour un style unique ou avec `legend: "none"`.
  - *Owner looks at* : une figure à plusieurs styles : légende à droite ; replier une zone jusqu'à ne laisser qu'un style : la légende disparaît ; déplier : elle revient à l'identique.
- **Covering lot / wave** : DE-2, V2.
- **Status** : en construction (PR #315 ouverte, étape 4). État au 20/11 21:00 EST.
- **Known gaps** : suivi de la légende sur les 38 états de référence non vérifié en CI DS ; la légende de page du dossier h-cond reste à retirer au re-rendu V2.
- **Trace** : `PLAN-r3.md:32` ; tests `linkLegend.test.ts`, `DiagramSceneFigure.connectors.test.ts:146` (PR #315).

<a id="req-r7-13"></a>

#### REQ-R7-13 — Espacement minimal entre routes et contrôle géométrique intégré

- **Relayed (d2d-cond, 18/11, demande 2)** : *"Minimum spacing between routes in the edge router: parallel segments, neighbouring elbows, ports and arrowheads ≥ a token (ref. 24 px at 4800 px width), link to border ≥ a token (ref. 15 px), no overlapping segments; built-in geometric check counting conflicts."*
- **Acceptance criterion** :
  1. tokens `routeSpacing` (24) et `routeBorderClearance` (15) ;
  2. `checkRouteSpacing` compte les conflits : segments parallèles, coudes voisins, ports et pointes, distance au bord, chevauchements ;
  3. 0 conflit sur les scènes de référence dans tous leurs états de pli (38), avec une porte CI bloquante bornée à ces scènes ;
  4. au-delà de la capacité d'un canal : diagnostic non bloquant, gouttière inchangée.
  - *Owner looks at* : sur les figures de référence, aucune paire de liens collés ou superposés, dans chaque état de pli ; le compteur de conflits à 0 dans le rapport de vague.
- **Covering lot / wave** : DE-2, V2.
- **Status** : en construction (PR #315 ouverte, étape 5). État au 20/11 21:00 EST.
- **Known gaps** : la porte à 0 conflit couvre tous les états de pli visibles des scènes de référence (84 états, déplié compris) : critère 3 atteint sur PR #315 ; la capacité d'un canal est finie (2 à 3 voies dans 72–96 px, risque 1 de `PLAN-r3.md`).
- **Trace** : `PLAN-r3.md:33,39,89`.

<a id="req-r7-14"></a>

#### REQ-R7-14 — Une seule gouttière entre zones sœurs

- **Relayed (d2d-cond, 18/11, demande 3)** : *"One gutter token between sibling zones; routing adapts instead of widening the gutter."*
- **Acceptance criterion** : un token unique `zoneGutter` (au moins 96) sur les deux axes ; la gouttière ne s'élargit jamais (trafic, libellés, pli) ; le routeur subdivise la gouttière en voies espacées de `routeSpacing` ; un dépassement de capacité produit un diagnostic, jamais un élargissement.
  - *Owner looks at* : toutes les gouttières entre zones sœurs ont la même largeur, y compris entre zones très reliées, pliées et dépliées.
- **Covering lot / wave** : DE-2, V2.
- **Status** : en construction (PR #315 ouverte, étape 6). État au 20/11 21:00 EST.
- **Known gaps** : la géométrie des figures existantes change visiblement (les canaux s'élargissent aujourd'hui jusqu'à 240 px) ; oracles `dc2a` et `m1d` régénérés : changements à présenter (REQ-R7-27).
- **Trace** : `PLAN-r3.md:34` ; test `routeSpacing.test.ts:419`.

<a id="req-r7-15"></a>

#### REQ-R7-15 — Sens des flèches : la source est l'initiateur de l'action

- **Relayed (d2d-cond, 18/11, demande 5)** : *"Arrow direction convention documented: source = initiator of the action; optional check."*
- **Acceptance criterion** :
  1. la convention « `source` = initiateur de l'action, `target` = receveur » est documentée dans `packages/diagram-canvas/README.md`, section « Diagram conventions and opt-in lints (DE-2) » ;
  2. le diagnostic `arrow-direction-convention` est opt-in (`conventions: { arrowDirection: true }`), de sévérité `info`, non bloquant ;
  3. il n'évalue que les liens orientés (`arrowhead !== "none"`) qui déclarent un initiateur : attribut texte `attributes.initiator` de la relation sémantique, ou table `conventions.initiators` (clé : id d'occurrence ou de relation) ; sans métadonnée, aucun diagnostic ;
  4. une flèche dont l'initiateur déclaré est la cible produit un diagnostic (`reason: "source-not-initiator"`) ; un initiateur qui n'est aucune des deux extrémités aussi (`reason: "initiator-not-endpoint"`) ; testé activé et désactivé.
  - *Owner looks at* : la section de convention du README ; sur une scène annotée (`attributes.initiator`), une flèche inversée produit un diagnostic `info` ; sans annotation, aucun diagnostic.
- **Covering lot / wave** : DE-2, V2.
- **Status** : en construction (PR #315 ouverte, étape 7). État au 20/11 21:00 EST.
- **Known gaps** : indécidable sans marqueur sémantique : sans métadonnée d'initiateur (déclaration par engram `unverified`), aucun contrôle ; le sens des flèches de la référence r7 v10 n'est pas vérifié automatiquement.
- **Trace** : `PLAN-r3.md:35` ; sur PR #315 : `packages/diagram-canvas/README.md:441-450`, `packages/diagram-canvas/src/layout/conventions.ts:44-53,177-211`, `conventions.test.ts:151`.

<a id="req-r7-16"></a>

#### REQ-R7-16 — Pas d'acronyme opaque comme étiquette de zone

- **Relayed (d2d-cond, 18/11, demande 6)** : *"No opaque acronym as zone tag; acronym only with its label."*
- **Acceptance criterion** : un sigle d'étiquette de zone n'apparaît qu'avec son libellé ; diagnostic opt-in `zone-tag-opaque-acronym`, non bloquant par défaut, avec une liste d'autorisation couvrant les sur-titres produit existants (`DLR-315`).
  - *Owner looks at* : sur les figures de référence, aucune étiquette de zone réduite à un sigle.
- **Covering lot / wave** : DE-2, V2.
- **Status** : en construction (PR #315 ouverte, étape 7). État au 20/11 21:00 EST.
- **Known gaps** : opt-in et non bloquant : sans activation par la page ou par la chaîne E1, rien n'empêche un sigle opaque.
- **Trace** : `PLAN-r3.md:36`.

<a id="req-r7-17"></a>

#### REQ-R7-17 — Emphase de lien : ensemble fermé, aucune couleur libre

- **Relayed (décision du conducteur engram, G6, non datée, `OWNER-ADDENDA.md:28-29`)** : *"Emphasis is NOT a dash style (dashes already mean « proposed »): it is a distinct link stroke token (colour + width) from DS tokens; engram carries it as an intent, never a style. => DE-2 link token registry must include an « emphasis » stroke token."* Verbatim owner direct : `missing source`.
- **Acceptance criterion** :
  1. l'emphase est un mot fermé (`default | emphasis`) porté par l'occurrence de relation ;
  2. elle se résout vers les tokens `linkEmphasisStroke` (couleur) et `linkEmphasisStrokeWidth` (3,5 px), jamais vers un style de tirets ;
  3. toute couleur, largeur, dash-array ou géométrie littérale en entrée est refusée par la validation ;
  4. la légende distingue l'emphase.
  - *Owner looks at* : un lien en emphase : même couleur et même épaisseur partout, en clair et en sombre ; une couleur libre en entrée : refus avec message.
- **Covering lot / wave** : DE-2, V2.
- **Status** : en construction (PR #315 ouverte, étapes 2 et 3 : `LINK_EMPHASIS_KINDS` dans `connector-registry.ts` ; refus « is not a closed link-emphasis registry word » dans `measured.ts`). État au 20/11 21:00 EST.
- **Known gaps** : un seul niveau d'emphase ; décision portée par le conducteur engram, sans verbatim owner.
- **Trace** : `OWNER-ADDENDA.md:28-29`.

<a id="req-r7-18"></a>

#### REQ-R7-18 — Ajustement à la fenêtre (pages hôtes et pages de comparaison)

- **Relayed (d2d-cond, 18/11, demande 9)** : *"Host/comparison pages: fit to window by default (max-height calc(100vh - 24px), max-width 100%, centred)."*
- **Acceptance criterion** :
  1. sur les pages hôtes et de comparaison (`tools/diagram-first-paint/`, vitrine) ou avec la prop opt-in `fitToWindow` : figure entière visible, `max-height: calc(100vh − 24px)`, `max-width: 100%`, centrée ;
  2. le défaut du composant ne change pas (`0,85 ×` la hauteur de fenêtre, `Z-3 / AC-23` vert) : aucune intégration existante ne change (REQ-R7-09).
  - *Owner looks at* : la page de comparaison à `1440 × 900` et à `390 × 844` : figure entière dans la fenêtre, centrée ; une page existante sans la prop : identique.
- **Covering lot / wave** : DE-2, V2.
- **Status** : en construction (PR #315 ouverte, étape 8 ; `fitToWindow = false` par défaut). État au 20/11 21:00 EST.
- **Known gaps** : la demande dit « by default » ; seul le défaut des pages hôtes DS change, chaque page consommatrice doit activer la prop.
- **Trace** : `PLAN-r3.md:37`.

<a id="req-r7-19"></a>

#### REQ-R7-19 — Chaîne E1 : modèle projeté engram → placement → Svelte / Vue / SVG

- **Owner decision (19/11, consignée en anglais, `OWNER-ADDENDA.md:22`)** : *"Publication: E1 (engram model -> Svelte/Vue/SVG) and E2 (draw.io export) ship WITH the DE-2 wave."*
- **Acceptance criterion** :
  1. chaîne documentée : sortie de forme `projectArchiCards` → `layoutMeasured` (`@1`) → `resolveScene` → Svelte `DiagramSceneFigure` (`latest`), Vue (`next`), `renderSceneSvg` ;
  2. une fixture statique conforme aux schémas DS donne un seul `SceneModel`, rendu à l'identique par les 3 cibles (cartes compactes, surfaces de profondeur, `icon: "none"`, liens et légende DE-2) ;
  3. pli/dépli vivant en Svelte et en Vue ;
  4. aucun script local de placement ou de rendu ; aucune dépendance à `engram`, ni au runtime ni en test.
  - *Owner looks at* : la même scène côte à côte en Svelte, Vue et SVG : mêmes positions, mêmes liens ; replier une zone en Svelte puis en Vue.
- **Covering lot / wave** : E1, V2 (avec DE-2).
- **Status** : en construction (PR #318 ouverte ; non publiée). État au 20/11 21:00 EST.
- **Known gaps** : sous `@1`, seul `auto-pack` s'exécute sur une vue projetée typée : placement en rangées, pas ISO (REQ-R7-23) ; Vue reste sur le tag `next` ; la qualification du rendu SVG statique (5e lot de la note DS du 15/11) n'a pas de critère propre et est rattachée ici.
- **Trace** : `PLAN-r3.md:44-48` ; `D2D-PIPELINE-DS-ANSWER.md` (e).

<a id="req-r7-20"></a>

#### REQ-R7-20 — E2 : paquet `@sentropic/diagram-codecs`, export draw.io statique

- **Owner decision (19/11, consignée en anglais, `OWNER-ADDENDA.md:22-23`)** : *"Export package name: @sentropic/diagram-codecs (as in the architecture doc), toDrawio(scene, options) with an optional opaque metadata field for engram.archi-carrier/1; first npm publish needs the owner's 2FA trusted-publisher setup."* et *"E2 (draw.io export) ship WITH the DE-2 wave."*
- **Acceptance criterion** :
  1. paquet pur chaîne, sans DOM, avec un pin exact sur `@sentropic/diagram-canvas` et sans dépendance à `engram` ;
  2. `toDrawio(scene, options)` produit un `<mxfile>` depuis la sortie de `resolveScene` : rectangles arrondis teintés, zones en conteneurs, liens avec points de passage, marqueurs et tirets du registre DE-2, ids source et cible conservés ;
  3. `options.metadata` est écrit tel quel et relu intact ; `toSvg` réexporte `renderSceneSvg` ; sortie stable à l'octet ;
  4. l'export d'un état replié et celui d'un état déplié sont tous deux valides ; l'export est statique : un seul état de vue, ni pli vivant, ni relayout.
  - *Owner looks at* : ouvrir l'export de la fixture E1 dans draw.io : formes éditables, imbrication correcte, liens connectés.
- **Covering lot / wave** : E2, V2 (avec DE-2).
- **Status** : en construction (PR #317 ouverte ; aucun tag `diagram-codecs-v*` ; heures 20–30 h, `unverified`). État au 20/11 21:00 EST.
- **Known gaps** : premier publish : jeton npm temporaire fourni par l'owner, puis déclaration 2FA du trusted publisher sur le paquet créé, puis publish OIDC `0.1.1` sous 48 h ; `PLAN-r3.md:82` prévoit de publier le reste de V2 sans E2 si le jeton manque au GO, ce qui s'écarte de la décision « with the DE-2 wave » (D-6) ; arête `["diagram-codecs", "diagram-canvas"]` à ajouter au DAG d'architecture ; E2 ne s'arrête pas à V2 : le pin exact sur `@sentropic/diagram-canvas` (`verify-deps-published.test.mjs:57-62,107`) impose en V3 un patch obligatoire `diagram-codecs 0.1.1 → 0.1.2` re-épinglé sur `diagram-canvas 0.5.0`, avec son tag `diagram-codecs-v*` (REQ-R7-21) ; draw.io ne garde pas le pli vivant (par conception).
- **Trace** : `PLAN-r3.md:50-58,64,82`.

### Wave 3 — placement (H2)

<a id="req-r7-21"></a>

#### REQ-R7-21 — Préférences de placement `ds-layout-hints@2` : bandes, colonnes périphériques, piles

- **Owner decision (19/11, `OWNER-ADDENDA.md:20`)** : « je veux 1 + 2 », consignée ainsi : *"Placement: automatic placement (@1) first, AND the 16:9 solver (ds-layout-hints@2: bands, peripheral columns, stacks without folding) is wanted too."* **Relayed (note DS, kit r7, 15/11)** : *"stage columns and transverse bands with aligned titles."*
- **Acceptance criterion** :
  1. étape 0 : vocabulaire `@2` figé avec engram ; tableau « chaque bande, colonne et ordre de la référence → la contrainte qui l'exprime » et liste des écarts inexprimables ;
  2. engram déclare des intentions, jamais de coordonnées ; le DS publie `./schemas/ds-layout-hints-2.{json,sha256}` à côté de `@1` ;
  3. le solveur produit des bandes horizontales (`transverse_bands`), des groupes périphériques en colonnes verticales, des piles qui ne passent jamais en étagères, `stage-columns`, `fanIn: "comb"` ;
  4. les vues `@1` restent identiques à l'octet ; pli/dépli actif dans les bandes et colonnes ; 0 conflit d'espacement ;
  5. V3 publie aussi le patch obligatoire `diagram-codecs 0.1.2`, épinglé exactement sur `diagram-canvas 0.5.0` (`0.1.1` seulement si la publication de validation OIDC de V2 ne l'a pas consommé), avec son tag `diagram-codecs-v*`, après la cascade du workspace (REQ-R7-01).
  - *Owner looks at* : la scène d'architecture de référence à côté de la référence statique : deux bandes strictes, colonnes périphériques ; replier chaque conteneur : bandes et colonnes conservées.
- **Covering lot / wave** : H2, V3 (étape 0 en parallèle de V2, 4–8 h).
- **Status** : planifié (60–90 h, plus l'étape 0) ; étape 0 non exécutée (`DOSSIER.md` annexe 6).
- **Known gaps** : des préférences ne sont pas des positions exactes (REQ-R7-23) ; « stacks without folding » est interprété par `PLAN-r3.md` comme « piles sans retour en étagères, pli actif » (voir REQ-R7-25) ; la « bus spine » de la note du 15/11 n'est pas nommée dans `PLAN-r3.md` (couverture par `fanIn: "comb"` `unverified`) ; dépend du gel du vocabulaire par engram (risque 3).
- **Trace** : `PLAN-r3.md:10,60-64` (patch `diagram-codecs` : `PLAN-r3.md:64,93`) ; `ds-position-engine.md:15-22` ; item track `01M7EGPAJE9KZKJ9E91DKC0F3E` (`ds-layout-hints@1`, base de `@2`).

<a id="req-r7-22"></a>

#### REQ-R7-22 — Option de ratio cible 16:9

- **Relayed (d2d-cond, 18/11, demande 7)** : *"Target aspect ratio option (e.g. 16:9 for slides): peripheral groups move to vertical columns."*
- **Acceptance criterion** : option de ratio cible (par exemple `16:9`) ; la scène de référence dépliée tient `16:9 ± 2 %` sans code de page, avec les groupes périphériques en colonnes ; aux états repliés, bandes, colonnes et 0 conflit sont conservés, le ratio n'est pas exigé.
  - *Owner looks at* : la scène de référence dépliée dans un cadre de diapositive 16:9 : ni bande vide ni débordement ; repliée : structure conservée.
- **Covering lot / wave** : H2, V3.
- **Status** : planifié.
- **Known gaps** : 16:9 garanti seulement à l'état déplié ; l'actuel `FIT_ASPECT = 16/9` de la caméra est un cadre d'affichage, pas une cible de placement.
- **Trace** : `PLAN-r3.md:62-63`.

<a id="req-r7-23"></a>

#### REQ-R7-23 — ISO r7 v10 : placement et flèches identiques à la référence, en restant repliable

- **Owner verbatim (20/11)** : « tant que c'est pas conforme avec mes requis (iso r7 dont flèches et placement + repliable) ça me va pas. »
- **Acceptance criterion (as stated by the owner)** : au repos (déplié), la figure vivante place chaque boîte et trace chaque flèche comme la figure statique de référence r7 v10, et chaque conteneur reste repliable (REQ-R7-05).
  - *Owner looks at* : la figure vivante superposée à la référence r7 v10 ; puis replier et déplier chaque conteneur.
- **Explicit statement** :
  - **Le placement exact n'est PAS prévu.** Le plan ne livre que des préférences (H2 : REQ-R7-21 et REQ-R7-22), « aussi proche que les contraintes le permettent ».
  - Le moteur refuse toute coordonnée en entrée (`x`, `y`, `width`, `height` dans `DS_LAYOUT_FORBIDDEN_HINTS`, `layout-hints.ts:42-56`) et recalcule toute la géométrie à chaque transition.
  - Flèches : le style est prévu (DE-2) ; le chemin reste calculé par le routeur dans toutes les options, donc un tracé identique à la référence est `unverified`.
  - **Les épingles (positions de boîtes écrites à la main) relèvent d'une décision owner** (options A ou C de `DOSSIER.md`) ; elles ne figurent dans aucun lot.
- **Covering lot / wave** : placement exact : NON PRÉVU ; épingles : NON PRÉVU (décision owner, D-4) ; préférences : H2, V3 ; style des flèches : DE-2, V2.
- **Status** : non prévu (placement exact) ; planifié (préférences) ; en construction (style des flèches, PR #315).
- **Known gaps** : question ouverte de `DOSSIER.md` : échéance impérative avant la fin de V3, oui (avec date) ou non ; dossier ISO incomplet (étape 0, revues indépendantes et rendu Focus manquants) ; le titre de l'item track `01M7WJN8595HFTM982VRNHJVYB` (« … pinned geometry input + DE-2 arrows ») préjuge A ou C et sera réaligné sur la décision ; la part de la référence exprimable en contraintes `@2` est `unknown` avant l'étape 0.
- **Trace** : `DOSSIER.md` (question, options, annexes 1, 3, 5 et 6) ; `OWNER-ADDENDA.md:32,34`.

### Wave 4 and beyond

<a id="req-r7-24"></a>

#### REQ-R7-24 — Panneaux comparés et annotations (accolades, curseur gradué)

- **Relayed (note DS, kit r7, 15/11)** : *"compared panels (before/after) with shared axis alignment; brace and graduated-cursor annotations."* Verbatim owner direct : `missing source`.
- **Acceptance criterion** :
  1. deux panneaux avant / après (`compared_panels`) dont les en-têtes et les rangées sont alignés sur un axe commun (`sync_headers`, `sync_rows`, `PLAN.md:42`) à `1/64 px` près, tolérance moteur / hôte de REQ-R7-05 ;
  2. accolades et curseur gradué déclarés en intentions (références d'entités `from` / `to`, aides `bracePath` / `rulerPath`, `PLAN.md:43`) et rendus par le DS, sans coordonnées ;
  3. même rendu sur les 4 cibles de N2 : SVG, Svelte, Vue et `toDrawio` (`PLAN-r3.md:68`) ;
  4. le pli/dépli reste actif dans chaque panneau, avec relayout (REQ-R7-05) ; l'alignement du critère 1 est re-vérifié après chaque pli.
  - *Owner looks at* : une vue avant / après de référence sur les 4 cibles : en-têtes et rangées alignés d'un panneau à l'autre ; une accolade et un curseur gradué ; replier une zone d'un panneau puis la déplier.
- **Covering lot / wave** : N2, V4 (`compared_panels`, aides accolade et règle).
- **Status** : planifié.
- **Known gaps** : exclu de H2 (`PLAN-r3.md:62`) ; aucun critère d'acceptation propre dans `PLAN-r3.md` : la tolérance, les 4 cibles et la tenue au pli sont fixées ici, à reporter au plan N2 ; vue avant / après de référence : `missing source`.
- **Trace** : `PLAN-r3.md:62,68` ; `PLAN.md:42-43`.

<a id="req-r7-25"></a>

#### REQ-R7-25 — Mode de rendu « sans pli » pour les dossiers

- **Relayed (note DS, kit r7, 15/11, `ds-position-engine.md:21`)** : *"a « no folding » rendering mode for dossiers."* Verbatim owner direct : `missing source`.
- **Acceptance criterion** : à confirmer par l'owner (D-7). S'il est retenu :
  1. une option opt-in `foldable: false` (mot réservé du brouillon `ds-layout-hints@2`, `PLAN.md:43`) rend la figure sans contrôle de pli : aucun bouton `+/-`, aucun attribut `aria-expanded` ;
  2. la réserve du bouton est rendue au texte d'en-tête : `66 px` sur les cartes (`toggleAllocation`, `PLAN.md:43`, `diagramCardModel.ts:70-75`) et `86 px` sur les zones (`diagramCardModel.ts:1235-1236`) ;
  3. le mode par défaut garde le pli (REQ-R7-05) ; Svelte et Vue identiques.
  - *Owner looks at* : une figure de dossier en mode sans pli : aucun `+/-`, titres plus larges ; la même figure en mode par défaut : pli intact.
- **Covering lot / wave** : NON PRÉVU.
- **Status** : non prévu.
- **Known gaps** : `PLAN-r3.md` interprète « stacks without folding » (19/11) comme « piles sans retour en étagères, pli actif » et n'a pas de lot pour ce mode ; `PLAN.md:43` (18/11) le prévoyait comme un drapeau dans DE-1 si le dossier en avait besoin, sinon en temps 2 avec le solveur, et `PLAN-r3.md` ne l'a pas repris ; à clarifier (D-7).
- **Trace** : `ds-position-engine.md:21` ; `PLAN.md:43` ; `PLAN-r3.md:62`.

<a id="req-r7-26"></a>

#### REQ-R7-26 — Quatre cibles framework : Svelte, Vue+Vapor, Preact+Signals, Angular

- **Owner verbatim (relayé par engram, commentaire 9 de simple-diagrams ; date : `missing source`)** : « … et ça doit se faire en svelte, vue+vapor, preact+signal, et angular. »
- **Agreed sequencing (`OWNER-ADDENDA.md:27`)** : *"waves 1-4 = Svelte, Vue (next/vapor), SVG, draw.io; then Preact+Signals and Angular in their own lots (none dropped)."*
- **Acceptance criterion** : la même scène r7 (fixture E1) est rendue avec la même géométrie (à 1/64 px), le même pli/dépli, les mêmes liens et la même légende en Svelte, en Vue (y compris l'entrée `/vapor`), en Preact+Signals et en Angular ; un test de parité par cible. SVG et `toDrawio` sont des cibles de rendu en plus, pas des frameworks.
  - *Owner looks at* : la même figure dans les 4 frameworks, pliée et dépliée.
- **Covering lot / wave** : Svelte et Vue : V1 à V4 ; Preact+Signals et Angular : à ajouter (aucun lot dans `PLAN-r3.md`).
- **Status** : Svelte : fait-publié (design-system-svelte 0.43.0) ; Vue+Vapor : fait-publié sur `next` (design-system-vue 0.41.0-next.8, dont l'entrée `/vapor` exporte `DiagramSceneFigure`), wave 1.1 0.41.0-next.9 en cours de publication sous GO owner ; Preact+Signals : non prévu (`design-system-preact` 0.0.0-p0.0, non publié, `@preact/signals` 2.11.4, aucun composant diagramme) ; Angular : non prévu (`design-system-angular` sans composant diagramme). État au 20/11 21:00 EST.
- **Known gaps** : Vapor : la base `v1` est testée au runtime (`vapor-runtime.test.ts:116,156,175` monte `DiagramCard`, `DiagramZone` et `DiagramSceneFigure` depuis `dist/vapor/index.js`, sans `anatomy`, profondeur ni pli imbriqué) ; les apports r7 (`v2`, profondeur, pli imbriqué) ne sont testés en Vapor qu'à la compilation (`diagram-parity.test.ts:263`, `compiler.parse` de chaque SFC) sur `main` ; PR #315 ouverte ajoute des tests de parité Vapor au runtime : parité runtime présente sur PR #315 ; items track hors du parcours r7 : `01M77RSBEGJX68Y8P7VMK626GJ` « Diagram library in Vue (Vapor-ready template SFCs, WebGL via Vue+signals pattern) — P1 ASAP » (12/11, `in-progress`), `01M77RSBKPZ9458JS0K13D69S7` « Diagram library in Preact+Signals — P2 » (12/11, `to-do`), programme `01M77Q9MZ87FBF0C60Q7YPMFN1` « Programme Preact+Signals baseline + Vue Vapor … (owner 12/11) » (`in-progress`) ; aucun item Angular diagramme ; contexte owner du 12/11 : « priorité à vue+vapor dans l'ensemble des chantiers » et « on prendra preact+signal comme baseline dorénavant » (`framework.decision-dossier.v4.json`).
- **Trace** : `OWNER-ADDENDA.md:25-27` ; `DOSSIER.md` annexe 4.

### Process (every wave)

<a id="req-r7-27"></a>

#### REQ-R7-27 — Règle de présentation et de validation de chaque étape

- **Owner verbatim (20/11)** : « fais-moi valider les changements stp et précise ce que je dois regarder à chaque fois que tu fais une étape et que tu me présentes qqchose : exactement ce qui a été ajouté, ce qui a été cassé temporairement mais sciemment après ton propre test, que tu vas rétablir dans une prochaine phase et que tu vas tracer pour cette prochaine phase »
- **Acceptance criterion** : toute présentation à l'owner (PR, demande de GO, dossier, rapport de re-rendu) contient 5 rubriques :
  1. exactement quoi regarder : figure, état de pli, endroit, largeur d'écran ;
  2. ce qui a été ajouté (ids `REQ-R7-NN`) ;
  3. ce qui est sciemment cassé ou différent après notre propre test ;
  4. la phase qui le rétablit ;
  5. l'item track qui le trace pour cette phase.

  Aucune publication sans GO owner explicite, vague par vague, jamais groupé.
  - *Owner looks at* : les 5 rubriques dans chaque présentation ; un item track existant pour chaque ligne de la rubrique 3.
- **Covering lot / wave** : transverse, toutes les vagues ; à ajouter à `PLAN-r3.md` (antérieur au 20/11).
- **Status** : en construction — PR #314 (fusionnée) : corps réécrit le 20/11 (tableau « ID audit | ce que l'owner regarde | avant → après | test qui l'épingle » pour les 26 lignes de l'audit, section « Encore différent volontairement », commits par groupe) : rubriques 1 à 4 présentes ; rubrique 5 partielle : `W1-09` et `W1-13` tracés par `01M7WJN7TP4WTKTSK3M0H064EQ` et `01M7WJN7ZTQRQZ441VF9J35599`, écarts ISO par `01M7WJN8595HFTM982VRNHJVYB`, lots Preact+Signals et Angular sans item ; le corps documente les bumps et REQ-R7-30 ; PR #315 ouverte : aucune des 5 rubriques ; PR #317 et #318 ouvertes : corps sans rubriques ; `DOSSIER.md` annexe 1 l'applique aux phases ISO ; les tableaux « Scénarios » de ce document portent les 5 rubriques depuis r2. État au 20/11 21:00 EST.
- **Known gaps** : aucun gabarit de PR n'impose les 5 rubriques ; pas d'item track par écart (les Scénarios marquent « à créer avant GO » chaque écart sans item).
- **Trace** : `OWNER-ADDENDA.md:32-33` ; `PLAN-r3.md:71` (GO par vague).

<a id="req-r7-28"></a>

#### REQ-R7-28 — Tout changement qui n'est pas exactement un progrès demandé sans effet de bord est une régression

- **Owner verbatim (20/11, `REGRESSION-AUDIT-wave1.md:4`)** : « tout changement est une régression si ce n'est pas une modification correspondant exactement à un progrès sans effet de bord »
- **Acceptance criterion** :
  1. avant chaque GO : audit exhaustif des changements entre tags publiés (règles CSS, props par défaut, tokens, constantes de layout, contrats, comportements), chaque ligne classée « progrès demandé (`REQ-R7-NN`) », « RÉGRESSION » ou « effet de bord d'un progrès » ;
  2. GO seulement avec 0 RÉGRESSION et 0 effet de bord non accepté par l'owner ;
  3. chaque correctif est épinglé par un test sur les valeurs de la version précédente, en Svelte et en Vue.
  - *Owner looks at* : le tableau d'audit de la vague et la liste des écarts restants, chacun avec sa phase.
- **Covering lot / wave** : transverse ; à ajouter à `PLAN-r3.md` comme porte de chaque vague.
- **Status** : V1 : corrigé (PR #314 fusionnée `b303096b9`, wave 1.1 en cours de publication sous GO owner) — audit fait (60 lignes : 34 progrès, 14 RÉGRESSIONS, 12 effets de bord) ; V2 : non prévu (aucun audit de PR #315). État au 20/11 21:00 EST.
- **Known gaps** :
  - corrigés par PR #314 fusionnée, wave 1.1 en cours de publication sous GO owner : RÉGRESSIONS `W1-16`, `W1-17`, `W1-37`, `W1-39`, `W1-43`, `W1-51`, `W1-54`, `W1-44`, `W1-55` et la partie en-tête de `W1-45`, `W1-56`, `W1-02`, `W1-12` (restauré sur `v1` / `surface1`), la partie surface de `W1-45`, `W1-56` ; effets de bord `W1-10`, `W1-14` (test de compilation seul, aucun CSS de thème de marque régénéré), `W1-19`, `W1-23`, `W1-28`, `W1-31`, `W1-35`, `W1-40`, `W1-46`, `W1-52`, `W1-58` ; `W1-13` épinglé par tests ; bumps diagram-core 0.4.1 et tokens / themes 0.15.1 en cours de publication (cascade refaite).
  - restant : RÉGRESSION `W1-09` (taille du `+/-` en `v2`, conservée, à valider par l'owner, D-3) ; la consigne d'extension (`regress-fix2.md`) cite « 16 RÉGRESSION, 14 effet de bord » alors que l'audit en compte 14 et 12 ; « W1-14 » sans CSS de thème régénéré.
  - avant GO de V1-patch : publication wave 1.1 sur `main` ; le corps de PR documente les bumps et REQ-R7-30.
  - PR #315 contenait un changement hors de la liste DE-2 (plafond de la contribution des badges de flux numérotés à `labelLimit`) : réverti sur la tournée de correctifs ; audit V2 toujours à faire.
- **Trace** : `REGRESSION-AUDIT-wave1.md` ; `regress-fix.md` ; `regress-fix2.md`.

## Cross-cutting known gaps

1. **Ordre de fusion et versions.** État au 20/11 21:00 EST : PR #314 fusionnée (`b303096b9` sur `origin/main`) ; `@sentropic/design-system-vue 0.41.0-next.9` est porté par la wave 1.1 en cours de publication sous GO owner ; PR #315 ouverte ne contient pas les commits de PR #314 fusionnée. Les bumps bloquants sont sur `main` (diagram-core 0.4.1, tokens / themes 0.15.1, cascade du workspace refaite, corps de PR qui documente les bumps et REQ-R7-30). Reste : PR #315 remise à jour sur `main` avec la wave 1.1 et re-versionnée avant fusion ; sinon V2 republie les régressions V1. PR #317 et #318 ouvertes partagent l'historique DE-2 partagé et ne contiennent pas les correctifs de PR #314 fusionnée ni la tournée de correctifs de PR #315 : même remise à jour après PR #315.
2. **Svelte 0.43.0 et review-core.** `design-system-svelte` 0.43.0 est **publié** (tag distant `svelte-v0.43.0`) ; `review-core` 0.1.0 et 0.1.1 sont **publiés** (tags distants `review-core-v0.1.0`, `review-core-v0.1.1`) après la fusion de la PR #319. La wave 1.1 fusionnée porte svelte 0.43.1 en cours de publication et PR #315 vise 0.44.0, et non 0.42.1 et 0.43.0 comme dans `PLAN-r3.md`. État au 20/11 21:00 EST.
3. **Plan antérieur au 20/11.** `PLAN-r3.md` (19/11) n'a ni lot pour REQ-R7-07 à REQ-R7-09 (V1-patch), ni porte pour REQ-R7-27 et REQ-R7-28, ni lot Preact+Signals ou Angular (REQ-R7-26).
4. **Track.** Items diagrammes recensés dans « Repository state at snapshot » : 5 items r7 du 20/11 (`to-do`, dont `01M7X6P2X37V4HK1ZPQ7HJZZA9` pour REQ-R7-30), 30 items par exigence (`REQ-R7-01` à `REQ-R7-30`, table « Track trace »), 4 items antérieurs rattachés à REQ-R7-06, REQ-R7-21 et REQ-R7-26, 5 items diagrammes hors parcours r7 ; aucun item par lot DE-2, H2, N2 (E1 et E2 couverts par les PR #318 et #317) ; aucun agrégat `decision` pour l'ISO (`DOSSIER.md` annexe 6) ; `01M7EGPAJE9KZKJ9E91DKC0F3E` reste `to-do` alors que `ds-layout-hints@1` est publié dans diagram-core 0.3.0 (`ds-position-engine.md:16`) ; ces items n'existent que dans la copie locale de `.track/events.jsonl`, celle d'`origin/main` s'arrêtant au 07/11 (UTC).

## Open owner decisions

| id | Décision | Exigences | Options connues |
|---|---|---|---|
| D-1 | Centrage du titre sur carte compacte `v2` | REQ-R7-06, REQ-R7-07 | défaut `center` (`PLAN-r3.md` DE-1) ; opt-in `align: "center"` (PR #314 fusionnée) |
| D-2 | Mode d'entrée de l'anatomie compacte | REQ-R7-06, REQ-R7-09 | opt-in explicite `anatomy: "v2"`, `createView()` reste en `v1` (correctif `W1-02`, porté par PR #314 fusionnée) ; `v2` par défaut pour toute nouvelle vue (état 0.42.0) |
| D-3 | Taille du `+/-` et zoom maximal en `v2` | REQ-R7-08, REQ-R7-09 | garder 32 px et `0.62` ; calibrer pour `352 × 154` |
| D-4 | Placement ISO r7 v10 | REQ-R7-23, Scénarios | A épingles ; B contraintes (orientation provisoire du dossier) ; C épingles privées puis contraintes ; échéance avant la fin de V3 : oui (date) ou non |
| D-5 | Pointes `filled-triangle` et `open-triangle` livrées en DE-2 | REQ-R7-11, REQ-R7-02 | **close** : retirées sur PR #315 (registre `@4` réduit à `arrow | none`), triangles creux réservés à N2 ; les deux options ci-dessous restent consignées comme historique : les garder en V2 ; les retirer et les réserver à N2 |
| D-6 | E2 si le jeton npm manque au GO de V2 | REQ-R7-20 | bloquer V2 jusqu'au jeton ; publier V2 sans E2 (`PLAN-r3.md:82`) |
| D-7 | Mode « sans pli » pour les dossiers | REQ-R7-25 | voulu comme option ; abandonné |
| D-8 | Lots Preact+Signals et Angular | REQ-R7-26 | les créer après V4 (séquence convenue) ; autre ordre |
| D-9 | Taux de repli `v2` (polices et marges) | REQ-R7-06 | ajouter un correctif DE-1 (changement visible, à valider) ; accepter le repli |
| D-10 | N2 dans S2, où H2 n'est pas engagé (N2 dépend de H2 : `PLAN-r3.md:68-69`) | REQ-R7-02, REQ-R7-24, Scénarios (S2) | livrer H2 avant N2 (+64–98 h) ; étendre les épingles aux bandes de couches ArchiMate et aux panneaux comparés (hors plan, heures `unknown`) |
| D-11 | Réajustement au pli / dépli (règle Z-7) et plancher de zoom `0,45` | REQ-R7-05, REQ-R7-09, REQ-R7-30, Scénarios | réajuster à chaque bascule, zoom explicite remis à zéro (porté par PR #314 fusionnée) ; garder la règle Z-7 (zoom figé tant qu'il reste dans la plage). Plancher `0,45` de REQ-R7-09 conservé : au fit sous `0,45`, défilement sans partie inaccessible |

## Scénarios

Trois scénarios de feuille de route à valider. V1-patch et V2 sont communs aux trois. Chaque ligne porte les 5 rubriques de REQ-R7-27 : (1) « À regarder » (figure, état de pli, endroit, largeur d'écran) ; (2) ce que l'owner obtient ; (3) ce qui est sciemment différent après test DS ; (4) la phase qui le rétablit ; (5) l'item track qui trace chaque écart, « à créer avant GO » quand il n'existe pas. Le pli/dépli (REQ-R7-05) est exigé à chaque phase. Heures : estimations DS hors tours de revue ; [FACT] et [JUDGMENT] repris de `DOSSIER.md` ; les coûts jusqu'à fin V4 ajoutent N2 (60–95 h, à affiner au lancement du temps 2, `PLAN-r3.md:69`) ; les lots Preact+Signals et Angular restent `unknown`.

### Base commune (V1-patch et V2)

| Vague | À regarder | Ce que l'owner obtient | Sciemment différent après test DS | Rétabli en | Item track |
|---|---|---|---|---|---|
| V1-patch (PR #314 fusionnée `b303096b9` ; heures `unknown` ; bumps sur `main`, ordre de fusion « Cross-cutting known gaps » §1). État au 20/11 21:00 EST | à `1440 × 900`, en clair puis en sombre, en Svelte et en Vue : une carte longue d'une figure compacte qui passe en `460 × 200` (titre à gauche) ; le survol du `+/-` sur une zone grise puis sur une zone blanche ; la taille du `+/-` et la hauteur du cadre au zoom maximal d'une vue existante, face à une capture 0.41.5 de la même figure ; la plus grande zone d'une figure imbriquée dépliée : toute la figure reste dans le cadre (REQ-R7-30), puis repliée | REQ-R7-07, -08 et -09 : cartes complètes alignées à gauche, `+/-` et survol comme en 0.41.5, taille maximale et zoom de 0.41.5 sur les vues existantes ; REQ-R7-30 : réajustement à chaque pli / dépli, sans partie hors du cadre (plancher `0,45`) ; effets de bord V1 corrigés (REQ-R7-04, REQ-R7-06, REQ-R7-10, REQ-R7-29) | taille du `+/-` et zoom maximal des cartes compactes non recalibrés (D-3) ; taux de repli `v2` inchangé (D-9) ; règle Z-7 remplacée par le réajustement (D-11, « progrès demandé ») et plancher `0,45` au petit écran : défilement sans partie inaccessible | V1-patch si D-3 et D-9 sont tranchées avant ; sinon phase à fixer et à tracer | correctifs : `01M7WJN7NM6DXX9GSMPCXGZTAR` (REQ-R7-07), `01M7WJN7TP4WTKTSK3M0H064EQ` (REQ-R7-08), `01M7WJN7ZTQRQZ441VF9J35599` (REQ-R7-09), `01M7X6P2X37V4HK1ZPQ7HJZZA9` (REQ-R7-30) ; écart D-3 : les deux derniers, comme dans le corps de PR #314 (`W1-09`, `W1-13`), à garder ouverts jusqu'à la décision ; écart D-9 : à créer avant GO |
| V2 : DE-2 (PR #315 ouverte) + E1 (PR #318 ouverte) + E2 (PR #317 ouverte, heures sous le tableau). État au 20/11 21:00 EST | la même figure avant / après, dépliée puis pliée, à `1440 × 900` et à `390 × 844` : coudes arrondis au contact des cartes, épaisseurs, emphase, légende à droite qui suit le pli, gouttières égales ; la même scène côte à côte en Svelte, Vue et SVG ; l'export de la fixture E1 ouvert dans draw.io | REQ-R7-11 à REQ-R7-20 : coudes arrondis, traits de 2,5 à 3,5 px, emphase, tirets et pointes, légende à droite, espacement des routes, gouttière fixe, conventions, ajustement à la fenêtre ; même scène en Svelte, Vue et SVG ; export draw.io statique | placement automatique en rangées (`auto-pack @1`), non ISO ; chemins de flèches calculés par le routeur | placement : selon le scénario ; chemins exacts : `unverified` dans les trois scénarios | placement et flèches : `01M7WJN8595HFTM982VRNHJVYB` ; E1 et E2 : aucun item (couverts par PR #318 et #317) |

- Budget initial de V2 : 108–166 h [FACT] (DE-2 76–118 h, E1 12–18 h, E2 20–30 h), dont E2 `unverified` (`PLAN-r3.md:89`).
- Reste à livrer pour V2 : E1 (PR #318 ouverte) et E2 (PR #317 ouverte), 32–48 h (E2 `unverified`), en construction ; les étapes 1 à 8 de DE-2 sont codées sur PR #315 ouverte (non publiée), porte sur tous les états de pli et 3 scènes first-paint compris ; reste au moins l'audit V2 (REQ-R7-28), puis remise à jour des trois branches sur `main` avec la wave 1.1 et publication. État au 20/11 21:00 EST.

### S1 — Tel quel, avec préférences (orientation B du dossier ISO)

| Vague | À regarder | Ce que l'owner obtient | Sciemment différent après test DS | Rétabli en | Item track |
|---|---|---|---|---|---|
| V1-patch, V2 | base commune | base commune | base commune | base commune | base commune |
| Étape 0 (en parallèle de V2, 4–8 h) | le tableau « chaque bande, colonne et ordre de la référence → contrainte » et la liste des écarts inexprimables | tableau « référence → contraintes » et liste des écarts inexprimables | rien de visible | — | — |
| V3 : H2 (60–90 h) | la scène d'architecture de référence dépliée dans un cadre 16:9, à côté de la référence statique r7 v10 ; puis chaque conteneur replié : bandes et colonnes conservées | REQ-R7-21 et REQ-R7-22 : bandes, colonnes périphériques, piles, 16:9 ± 2 % déplié, figure vivante à côté de la référence ; pli conservé | 16:9 seulement déplié ; écarts résiduels à la référence listés et mesurés ; positions exactes non garanties | nouvelle décision si écart | écarts résiduels et positions exactes : `01M7WJN8595HFTM982VRNHJVYB` ; 16:9 replié : aucun (par conception, `PLAN-r3.md:63`) |
| V4 : N2 (60–95 h) | les vues ArchiMate de référence (liste `missing source`) sur SVG, Svelte, Vue et `toDrawio` : le symbole de chaque relation, une couche repliée ; une vue avant / après de référence | REQ-R7-02 et REQ-R7-24 : notation ArchiMate et marqueurs sur les 4 cibles, panneaux comparés, annotations | — | — | — |
| Après V4 | la même figure dans les 4 frameworks, pliée et dépliée | REQ-R7-26 : lots Preact+Signals et Angular (à créer, heures `unknown`) | — | — | lots : `01M77RSBKPZ9458JS0K13D69S7` (Preact+Signals) ; Angular : à créer avant GO |

- Coût après V2 : jusqu'à fin V3, 64–98 h [FACT] (étape 0 et H2) ; jusqu'à fin V4, 124–193 h (plus N2 60–95 h) ; lots Preact+Signals et Angular : `unknown`. La règle « aucune géométrie écrite à la main » est tenue.
- Retour arrière : `ds-layout-hints@1` reste intact ; si `@2` échoue, les heures et les versions publiées sont perdues, perte bornée par l'étape 0.
- Adapté si : pas d'échéance avant la fin de V3 et aucune exigence de placement inexprimable à l'étape 0.

### S2 — Épingles pour les figures de référence (option A)

| Vague | À regarder | Ce que l'owner obtient | Sciemment différent après test DS | Rétabli en | Item track |
|---|---|---|---|---|---|
| V1-patch, V2 | base commune | base commune | base commune | base commune | base commune |
| Phase épingles (après V2, 30–50 h [JUDGMENT], hors plan) | chaque figure de référence au repos, superposée à la référence r7 v10 ; puis replier et déplier chaque conteneur : l'épingle cède | boîtes placées exactement au repos sur les figures de référence, flèches routées ; environ 2 fois plus tôt que S1 | au pli, l'épingle cède (voisins replacés, liens re-routés) ; règle « aucune coordonnée » rompue ; tracé des flèches `unverified` | — (choix assumé) | `01M7WJN8595HFTM982VRNHJVYB` |
| V3 : H2 | — (non engagé) | non engagé : le « 2 » de « je veux 1 + 2 » est reporté ; le reprendre ajoute 64–98 h, et il devient requis avant V4 si D-10 retient H2 | les autres figures restent en placement automatique | décision ultérieure | à créer avant GO |
| V4 : N2 | comme S1 | REQ-R7-02 et REQ-R7-24 comme S1, à condition de lever la dépendance de N2 à H2 (`PLAN-r3.md:68-69` : bandes de couches ArchiMate sur le solveur H2, `compared_panels` du vocabulaire `ds-layout-hints@2`) : H2 livré avant N2, ou épingles étendues aux bandes ArchiMate et aux panneaux comparés (D-10) | sans H2 ni extension des épingles, N2 n'est pas livrable | décision D-10 | à créer avant GO (D-10) |
| Après V4 | comme S1 | lots Preact+Signals et Angular | — | — | comme S1 |

- Coût après V2 : jusqu'à la fin de la phase épingles (V3 non engagé), 30–50 h [JUDGMENT] ; jusqu'à fin V4, 154–243 h si D-10 retient H2 avant N2 (30–50 + 64–98 + 60–95), ou 90–145 h plus l'extension des épingles aux bandes ArchiMate (`unknown`) si D-10 retient les épingles ; lots Preact+Signals et Angular : `unknown`.
- Prérequis : décisions owner D-4 et D-10 ; épingles entrées dans un schéma publié, gelé ensuite ; item track `01M7WJN8595HFTM982VRNHJVYB` réaligné.
- Retour arrière : nouvelle version de schéma, dépréciation, migration des figures épinglées.
- Adapté si : l'exactitude au repos est exigée tôt, ou si la référence n'est pas exprimable en bandes et colonnes.

### S3 — Épingles privées, puis préférences (option C)

| Vague | À regarder | Ce que l'owner obtient | Sciemment différent après test DS | Rétabli en | Item track |
|---|---|---|---|---|---|
| V1-patch, V2 | base commune | base commune | base commune | base commune | base commune |
| Phase épingles privées (après V2) | comme S2, plus la marque de l'entrée interne dans le rendu | placement exact au repos sur les seules figures de référence, par une entrée interne hors schéma publié et hors contrat npm, signalée dans le rendu | au pli, comme S2 ; épingles provisoires | V3 et retrait | `01M7WJN8595HFTM982VRNHJVYB` ; retrait des épingles : à créer avant GO |
| Étape 0, puis V3 : H2 | comme S1 | comme S1 | comme S1 | comme S1 | comme S1 |
| Retrait des épingles (6–12 h) | les figures de référence sur le seul solveur, superposées à la référence r7 v10 : écarts résiduels mesurés | figures de référence sur le seul solveur | les écarts résiduels éventuels réapparaissent | nouvelle décision | `01M7WJN8595HFTM982VRNHJVYB` |
| V4 : N2 ; après V4 | comme S1 | comme S1 | — | — | comme S1 |

- Coût après V2 : jusqu'à fin V3 et retrait des épingles, 100–160 h [JUDGMENT] (A 30–50 h, B 64–98 h, retrait et migration 6–12 h) ; jusqu'à fin V4, 160–255 h (plus N2 60–95 h) ; lots Preact+Signals et Angular : `unknown`.
- Risque : le provisoire reste ; si les épingles devenaient publiques, S3 porterait le même gel que S2.
- Adapté si (renversement prévu par le dossier) : échéance avant la fin de V3, ou écarts inexprimables révélés à l'étape 0.

**Ce que l'owner valide :** (1) S1, S2 ou S3 ; (2) l'échéance avant la fin de V3 : oui (avec date) ou non ; (3) les décisions D-1 à D-11 (D-5 close), au fil des vagues. Rien n'est publié sans GO de vague (REQ-R7-27).

## Track trace

| Requirement | Track item (workspace `wp-canvas-collab`) |
|---|---|
| REQ-R7-01 | `01M7X7G8VK2BJD3F27HRAQJTRT` |
| REQ-R7-02 | `01M7X7G95CY202R7FF22MWZXVP` |
| REQ-R7-03 | `01M7X7G9EYCWJ6H7EV11W6GWHC` |
| REQ-R7-04 | `01M7X7G9QRY2RZVNZA10J4HYWP` |
| REQ-R7-05 | `01M7X7GA1YK0A804B4FCAQQWP3` |
| REQ-R7-06 | `01M7X7GACPXT34EH3QSC448Z8X` |
| REQ-R7-07 | `01M7WJN7NM6DXX9GSMPCXGZTAR` |
| REQ-R7-08 | `01M7WJN7TP4WTKTSK3M0H064EQ` |
| REQ-R7-09 | `01M7WJN7ZTQRQZ441VF9J35599` |
| REQ-R7-10 | `01M7X7GB2ADH6M0HXBD7R375J8` |
| REQ-R7-11 | `01M7X7GBB74W0YN80MWXZDGDP0` |
| REQ-R7-12 | `01M7X7GBMH0S2P6W08Y6DRVJK4` |
| REQ-R7-13 | `01M7X7GC3KB25NJKJPFQ7SS72G` |
| REQ-R7-14 | `01M7X7GCEGV9QGZZTPZEBF99T9` |
| REQ-R7-15 | `01M7X7GCQ6A2MQ99YV8CNSGMWV` |
| REQ-R7-16 | `01M7X7GCZQMSBW8Y4K51ZVNTPD` |
| REQ-R7-17 | `01M7X7GD8YMNMNFM3H1EF4S4RD` |
| REQ-R7-18 | `01M7X7GDHH7ARWKZRGQ5JRA6HE` |
| REQ-R7-19 | `01M7X7GDTPFJZ27CM3JEENDNP2` |
| REQ-R7-20 | `01M7X7GE3QYD95CADMQW353MC0` |
| REQ-R7-21 | `01M7X7GEC8RNXYY8V0YZK9B1GP` |
| REQ-R7-22 | `01M7X7GEMTW01K6GES6P3WFFKD` |
| REQ-R7-23 | `01M7WJN8595HFTM982VRNHJVYB` |
| REQ-R7-24 | `01M7X7GEXDJ43MHA1J8YBDW176` |
| REQ-R7-25 | `01M7X7GF6BCF40YEK9Y27JYF87` |
| REQ-R7-26 | `01M7X7GFEXK2DSVWVM8NAPYX2A` |
| REQ-R7-27 | `01M7X7GFQGVSY23EW11Q0ZFJQ0` |
| REQ-R7-28 | `01M7X7GG01NTG3MNN8W583AKS1` |
| REQ-R7-29 | `01M7X7GG8FM05MF62D75ATNXW7` |
| REQ-R7-30 | `01M7X6P2X37V4HK1ZPQ7HJZZA9` |
