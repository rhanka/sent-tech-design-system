# Work packages — Sent Tech Design System

Doc vivant qui consolide les tracks en cours, leur état d'avancement et les axes parallelisables. Mis a jour a chaque livraison majeure (commit + push). Voir `docs/known-issues-and-fixes.md` pour le detail des bugs ouverts.

## Legende

- 🟢 Done — shippe et verifie sur `main`
- 🟡 In progress — travail demarre, partiel sur `main`
- 🔵 Ready — debloque, prochain item a lancer
- ⏸️ Blocked — necessite une decision ou une dependance externe
- ⚪ Planned — pas demarre

## Suivi Antigravity — reprise header docs 2026-05-24

### Fait

| Track | Finalite | Etat | Avancement | Fait |
|---|---|---:|---:|---|
| A — Header docs | Reprendre le header valide par l'utilisateur, pas l'ancien wordmark publie. | 🟢 | 100% | Logo carre `SENT-logo-squared.svg`, titre `Sentropic`, sous-titre `Design System`, GitHub icone, lien `sent-tech.ca` retire du header. |
| B — Socle controles droits | Aligner hauteur et densite de base des controles header. | 🟢 | 100% | Token `--docs-header-control-height`, version neutre, langue et GitHub sur socle commun; compte factice retire du vrai header. |
| C — Garde contractuelle | Empêcher une regression vers l'ancien logo ou l'ancien lien header. | 🟢 | 100% | Test `header-contract` verifie logo carre, libelle service, GitHub iconise, absence de `SENT-logo.svg` et absence de `sent-tech.ca` dans la nav utilitaire. |
| D — Publication | Forcer un deploiement Pages reel, pas seulement une modification de doc. | 🟢 | 100% | Commit `8ace58a` publie; workflow `Docs` `26366918988` vert; URL publique cache-bustee verifiee. |
| E — Suivi | Retablir le mode multi-track `Fait / A faire / Attendus`. | 🟢 | 100% | Ce bloc remplace le suivi implicite et retire les statuts `commit courant` non actionnables. |
| H — Hover GitHub | Faire partager a GitHub le meme affordance hover/focus que langue. | 🟢 | 100% | GitHub utilise `docs-header-menuButton`; tooltips natifs retires pour eviter le hover different. |
| I — Compte header | Retirer le faux menu compte du vrai header tant qu'il n'y a pas de session reelle. | 🟢 | 100% | Trigger/popover/auth fictifs retires du layout; les etats anonyme/initiales/photo sont documentes dans `/components/header`. |

### A faire

| Track | Finalite | Avancement | Prochaine action | Owner |
|---|---|---:|---|---|
| F — Footer | Reprendre le footer moche sans bloquer la correction header. | 10% | Ouvrir un item dedie apres publication header; `sent-tech.ca` peut y revenir si utile. | Backlog |
| G — A11y menus | Durcir clavier/focus au-dela du correctif rapide. | 65% | Tester focus trap/roving focus si les popovers deviennent des menus DS reutilisables. | Backlog DS |

### Attendus

| Track | Critere attendu | Verification |
|---|---|---|
| Header public | Le header public affiche le logo carre + `Sentropic` / `Design System`, jamais le wordmark complet. | Capture navigateur desktop/mobile + recherche reseau sans `/SENT-logo.svg`. |
| Zone droite | Version reste neutre/inert; GitHub, langue et futur compte partagent hauteur, alignement, couleur de base et affordance hover/focus. | Capture desktop + hover/focus GitHub/langue. |
| Compte header | Aucun faux compte, faux email ou fausse URL de login dans le vrai header public. | Test `header-contract` + inspection DOM; demo auth uniquement dans les pages composants. |
| Navigation utilitaire | Le header ne contient plus de lien `sent-tech.ca`; GitHub est iconise. | Test `header-contract` + inspection DOM. |
| Publication | Le workflow `Docs` passe et deploie le SHA courant. | `gh run watch` + URL cache-bustee `https://design-system.sent-tech.ca/?cb=<SHA>`. |

## WP1 — DS Core (primitives Svelte)

**Statut global** : 🟢 sweep Sentropic + Lucide epuise.

| Item | Statut | Commits | Notes |
|---|---|---|---|
| IconButton | 🟢 | `29cb1af`, `e225bb3` | primitive 32-36 px Lucide |
| MenuTriggerButton | 🟢 | `0946a41`, `2d99041` | wrapper IconButton avec aria-haspopup/aria-expanded |
| Menu + OverflowMenu enrichis | 🟢 | `a3dfaf2`, `dd37e3c`, `4786dd2` | union discriminee item/divider/group + icone |
| MenuPopover | 🟢 | `245cc07`, `efa0621` | placement, outside-click, Escape |
| CopyButton Lucide | 🟢 | `1c0391f`, `4ee01b5` | |
| Search Lucide | 🟢 | `d2f9df8`, `40af34d` | + role redondant retire |
| PasswordInput Lucide | 🟢 | `aa7a0aa`, `c1c85da` | Eye / EyeOff |
| InlineLoading Lucide | 🟢 | `9146e9c`, `dd7956b` | spinner respecte prefers-reduced-motion |
| ProgressIndicator Lucide | 🟢 | `7048990`, `1cc8b54` | Check + X |
| PaginationNav Lucide | 🟢 | `a24fe7e`, `6b03782` | commit 2 repris manuellement apres hang |
| Tag Lucide | 🟢 | `8e0fcbf`, `cdcdf87` | X pour dismiss |
| FileUploader Lucide | 🟢 | `e2ad6c9`, `bd50588` | nouveau prop `items` controle |

**Dependances** : aucune.
**Parallelisable avec** : tous les autres WP (composants disjoints).

## WP2 — Site docs UX

**Statut global** : 🟡 base alignee, deux re-passes restantes.

| Item | Statut | Commits | Notes |
|---|---|---|---|
| Sidebar rectangulaire actif + densite groupes | 🟢 | `15d9690`, `ce3bfdc`, `dbdd1be` | |
| Header docs aligne contrat (logo SENT + langue) | 🟢 | `94e5fce`, `45dd0c8`, `defb1b7` | |
| Reprise header docs publie + garde contractuelle | 🟢 | `8ace58a` | Logo carre + `Sentropic` / `Design System`, GitHub icone, sent-tech.ca retire du header, controles langue/compte harmonises, test `header-contract` |
| Home i18n complete | 🟢 | `55781c1`, `40b4b98` | catalogue descriptions bilingues |
| Plan-completion hero shelf + contexte demos | 🟢 | `824a2b7` | |
| Re-passe `/components/overlays` | ⚪ | — | bloque par WP6 (z-index Toast / OverflowMenu) |
| Audit visuel pages composants restantes | ⚪ | — | apres WP6 |
| Inventaire couverture docs composants | 🟢 | — | 59 entrees catalogue, 66 exports publics, 9 stubs restants, 7 exports absents, 22 pages partiellement couvertes par pages famille |
| Stubs P1 composants | 🟡 | — | Batch 1 ferme: `combobox`, `number-input`, `slider`, `toggle`, `header`, `badge`, `data-table`, `progress-bar`, `skeleton-text`; restants Forms: 4, Navigation: 2, Overlay: 1, Layout: 2 |
| Exports absents du catalogue | 🟡 | — | `AspectRatio`, `CodeSnippet`, `Sparkline`, `StructuredList`, `TileGroup`, `UnorderedList`; `ThemeProvider` exclu intentionnellement |

**Dependances** : WP6 pour la re-passe overlays.
**Parallelisable avec** : tous, sauf overlay tant que WP6 pas fait.

### Suivi WP2

| Vue | Track | Finalite | Etat | Avancement | Detail |
|---|---|---|---:|---:|---|
| Fait | Inventaire docs | Eviter les stubs invisibles et les exports oublies | 🟢 | 100% | Audit agent Spark xhigh initial: 18 stubs, 7 exports absents, 22 partiels; catalogue reajuste apres batch 1. |
| Fait | Pages dediees batch 1 | Fermer les stubs P1 les plus visibles | 🟢 | 100% | 9 routes dediees ajoutees et sorties du statut stub: forms 4, header 1, feedback/data 4. |
| A faire | S1 Forms | Documenter les controles complexes P1 | 🟡 | 50% | Restent `form`, `form-group`, `date-picker`, `multi-select`; `combobox`, `number-input`, `slider`, `toggle` documentes. |
| A faire | S2-S5 UI | Fermer navigation, overlays, feedback/data, layout | 🟡 | 50% | Restent `overflow-menu`, `content-switcher`, `toggletip`, `accordion`, `card`; `header`, `badge`, `data-table`, `progress-bar`, `skeleton-text` documentes. |
| A faire | Catalogue absents | Ajouter les exports publics manquants au flux docs | 🔵 | 0% | 6 composants UI absents + decision confirmee pour `ThemeProvider` infra. |
| Attendu | Couverture publique | Aucun composant exporte ne doit etre invisible ou stub sans owner | 🟡 | 65% | 9 stubs restants + 6 exports absents; poursuivre par batch 2 avant fermeture WP2. |

## WP3 — Contrat header cross-site et applications

**Statut global** : 🟢 cote DS ; application Sentropic/NC déléguée à l'utilisateur.

| Item | Statut | Commits | Notes |
|---|---|---|---|
| Contrat `docs/header-alignment-contract.md` | 🟢 | `44c4871` | 4 decisions validees + avenant 2026-05-24: logo carre et libelle de service dans le header |
| Application sur docs site | 🟢 | inclus WP2 | |
| Application sur Sentropic (`../sentropic`) | ➡️ user | — | **Décidé 2026-05-22** : l'utilisateur applique lui-même. Le DS ne touche pas. |
| Application sur NC (`../nc-fullstack`) | ➡️ user | — | idem |
| Mise a jour `docs/sentropic-alignment-inventory.md` | ⚪ | — | mesurer ecart restant une fois apppliqué |

**Dependances** : aucune côté DS, le contrat est public.
**Parallelisable avec** : tous.

## WP4 — Chat-UI primitives

**Statut global** : 🟢 livré pour la tranche docs ciblée (API + documentation dédiée pour 6 primitives chat).

**Décidé 2026-05-22** : **DS purement visuel**. ChatMessage expose props role/status + slot content. Le consommateur orchestre le rendu des blocks (markdown, code, tool I/O).

| Item | Statut | Commits | Notes |
|---|---|---|---|
| Roadmap `docs/chat-ui-roadmap.md` | 🟢 | `721474e` | top 5 primitives identifiees |
| API décidée : DS visuel | 🟢 | — | enveloppe seule, slot content |
| ChatMessage | 🟢 | — | P0 |
| ChatThread | 🟢 | — | P0, scroll + auto-scroll + aria-live |
| ChatComposer | 🟢 | — | P0, textarea + slots actions |
| MessageStatusBadge | 🟢 | — | P1, mappage status → badge |
| StreamingMessage | 🟢 | — | P1, mirroir StreamMessage Sentropic |
| MessageActions | 🟢 | — | P1, rangee IconButton |

**Dependances** : aucune.
**Parallelisable avec** : tous.

## WP5 — Graphics / Charts primitives

**Statut global** : 🔵 décision foundation prise, prêt à lancer.

**Décidé 2026-05-22** : **C hand-rolled intégral**. Aucune dépendance, full control, white-label parfait. Chaéchelles/axes/tooltips/légendes/a11y écrits par nous.

| Item | Statut | Commits | Notes |
|---|---|---|---|
| Roadmap `docs/graphics-roadmap.md` | 🟢 | `76703c3` | base de référence |
| Foundation décidée : C hand-rolled | 🟢 | — | |
| Sparkline | 🔵 | — | P0, trivial, premier shipped |
| BarChart | 🔵 | — | P0, scales + axes minimalistes |
| LineChart | 🔵 | — | P0, scales + axes + smoothing optionnel |
| AreaChart | ⚪ | — | P1 |
| StackedBar | ⚪ | — | P1 |
| DonutChart | ⚪ | — | P1 |
| ScatterPlot | ⚪ | — | P2 |

**Estimé** : 15-20j pour 6 charts P0/P1, mais Sparkline et BarChart livrables dès la première semaine.

**Dependances** : aucune.
**Parallelisable avec** : tous.

## WP6 — Fix-plan (bugs DS visuels et comportementaux)

**Statut global** : 🟡 bugs corrigés, retest visuel overlays/plan-completion restant.

| Bug | Statut | Surface | Severity |
|---|---|---|---|
| Toast / Alert rail gauche + container arrondi | 🟢 | `Toast.svelte`, `Alert.svelte` | corrigé `a85a379`; retest visuel overlays restant |
| OverflowMenu z-index < Toast | 🟢 | `OverflowMenu.svelte`, `Toast.svelte` | corrigé `d85ca6e`; retest visuel overlays restant |
| Drawer click intercepte par Menu | 🟢 | `Menu.svelte` | corrigé `de0c059`; retest `/components/plan-completion` restant |

Detail dans `docs/known-issues-and-fixes.md`.

**Dependances** : aucune.
**Parallelisable avec** : tous (composants disjoints).
**Bloque** : WP2 re-passe overlays tant que le retest visuel n'est pas consigné.

## WP7 — Audit DS large (37 références upstream, 5 clusters parallèles)

**Statut global** : 🟡 65% — audit/reporting consolidé, couverture et fermeture des clusters à prouver.

Objectif : appliquer les bonnes pratiques de design à NOTRE design system, couverture complète des 37 références upstream `pbakaus/impeccable`.

**Décidé 2026-05-22** : couverture complète des 37 références via 5 agents par cluster d'axes + 1 consolidateur en fin de cycle. Sortie : un rapport par axe + un master consolidé + commits de fixes P0 atomiques au fur et à mesure.

| Cluster | Références upstream | Statut | Sortie |
|---|---|---|---|
| A. Typography & writing | `typography`, `typeset`, `ux-writing`, `clarify`, `cognitive-load` | 🟡 70% | `docs/ds-audit-typography.md` |
| B. Color & contrast | `color-and-contrast`, `colorize`, `bolder`, `quieter` | 🟡 70% | `docs/ds-audit-color.md` |
| C. Spatial & responsive | `spatial-design`, `layout`, `responsive-design`, `shape` | 🟡 70% | `docs/ds-audit-spatial.md` |
| D. Motion & interaction | `motion-design`, `animate`, `delight`, `overdrive` | 🟡 65% | `docs/ds-audit-motion.md` |
| E. Audit/critique/polish | `audit`, `critique`, `polish`, `harden`, `optimize`, `extract`, `distill`, `craft` | 🟡 60% | `docs/ds-audit-meta.md` |
| F. Consolidateur | merge des 5 + dédupe vs `docs/known-issues-and-fixes.md` + priorisation P0/P1/P2 | 🟢 100% | `docs/ds-audit-consolidated-v2.md` (master) |
| Application des fixes critiques (P0) | — | 🟡 45% | WP6 corrigé, retest overlays + fixes P0 docs restant |
| Capacité "audit on push" via workflow GitHub | — | ⚪ 0% | hook CI post-MVP |

### Suivi WP7

| Vue | Track | Finalite | Etat | Avancement | Detail |
|---|---|---|---:|---:|---|
| Fait | Audit V1/V2 | Consolider les findings DS en source exploitable | 🟢 | 100% | Audit V1, 5 rapports clusters, master V2, 8 règles prioritaires transmises à WP8. |
| A faire | Couverture | Prouver la couverture complète des 37 références upstream | 🟡 | 45% | Fermer les statuts A-E et documenter la matrice de couverture. |
| A faire | Traçabilité | Relier `finding WP7 -> règle WP8 -> test` | 🟡 | 35% | Nécessaire avant extension ruleset WP8 P2. |
| Attendu | Séparation WP7/WP8 | WP7 reste le chantier audit, WP8 reste le moteur | 🟢 | 100% | Toute règle WP8 doit référencer une entrée WP7 V2. |

**Dépendances** : WP8 consomme WP7 pour les règles ; WP6 ne bloque plus WP7 mais impose un retest visuel overlays/plan-completion.

## WP8 — Moteur `design` (CLI 5 verbes) + knowledge base + skill multi-harness

> **Définition canonique (à ne plus driffer).** WP8 = le **moteur `design`** : ré-implémentation maison des capacités de la skill upstream `pbakaus/impeccable` (un « design language » aux dizaines de méthodes), packagée comme **module du design system**. Spec autoritative : `docs/wp8-design-cli-lean-proposal-v3.md`. Origine : session Claude `de3013d2` (22 mai) — « quelque chose de similaire **sans cloner** ».
>
> **Nom du package = `@sentropic/design-system-skills`** (le nom décidé à l'origine). Le rename Codex `→ -impeccable` (commit `3f3cfb6`) est **annulé** : aucun produit ne doit s'appeler « impeccable » (nom de la source).
>
> La CLI `design` factorise 17-19 méthodes en **5 verbes** : `init` · `build <feature>` · `check <target>` · `align <target>` · `polish <target>`. **L'audit n'est qu'1 verbe** = `design check --tech`. Ne jamais réduire le moteur `design` à « audit ».

**Statut global** : 🟢 cœur livré — les 5 verbes `init`/`build`/`check`/`align`/`polish` sont réels ou honnêtement expérimentaux (plus aucun faux succès), 12 tests verts ; package renommé `@sentropic/design-system-skills`, **publié `0.1.0` sur npm via OIDC Trusted Publishing**.

**Périmètre V1 livré** : `design check --tech <target>` retourne un rapport JSON, codes `0/1/2`, sans Playwright. C'est 1 des 5 verbes — pas « la CLI ». Les 4 autres verbes sont le cœur du reste de WP8.

**Constaté** : `design build` et `design polish` restent des stubs à messages ; `design check --human` est une simulation fixe. Ne pas présenter la CLI comme un moteur complet tant que ces flux ne sont pas réels.

| Phase | Item | Statut | Notes |
|---|---|---|---|
| P0 Contrat V1 | `design audit <target>`, aliases, codes retour, README/tests | 🟢 100% | binaire `design`, subcommand `audit`, wrapper skill aligne, `check --technical/--heuristics` testes, `--personas` refuse explicitement |
| P1 Moteur statique | `packages/skills` API `audit`, CLI, JSON, jsdom | 🟢 100% | moteur compile et expose `AuditReport` |
| P2 Ruleset initial | 10-15 règles depuis WP7 | 🟡 60% | 7 règles actives; suggestions tokens realignees; prochaines: `cramped-padding`, `motion-subtle`, `padding-scale-token` |
| P3 Knowledge base | `docs/principles/*` reliés aux règles | 🟡 60% | principes présents, liens règle/finding à écrire |
| P4 Skill multi-harness | wrapper unique Claude/Codex/Gemini, zéro logique métier | 🟡 60% | skill local + script unique sur `design audit`; adapters Codex/Gemini à compléter |
| P5 Distribution/CI/npm | lint CI, publication, règles token-aware | 🟢 90% | DS `0.8.0` + `@sentropic/design-system-skills@0.1.0` publiés via OIDC Trusted Publishing (provenance SLSA). Workflows `npm-publish.yml` (DS, tag `v*`) et `skills-publish.yml` (skills, tag `skills-v*`). |

### Suivi WP8

| Vue | Track | Finalite | Etat | Avancement | Detail |
|---|---|---|---:|---:|---|
| Fait | Scaffold moteur | Disposer d'un moteur local deterministe | 🟢 | 100% | `packages/skills`, API `audit`, CLI, 7 règles, build TypeScript. |
| Fait | Knowledge base | Capturer les principes DS | 🟢 | 100% | `docs/principles/*` initialisés. |
| Fait | Skill V1 | Exécuter le moteur depuis un harness agent | 🟡 | 85% | `tools/skills/sent-tech-skills/scripts/audit.mjs` appelle le contrat canonique. |
| Fait | Alignement CLI/themes | Mapper les corrections CLI vers les vrais tokens publies | 🟢 | 100% | `design align --tones` remplace vers `--st-semantic-*`; les themes exportent `--st-foundation-*`; tests ajoutes. |
| A faire | Ruleset | Passer de 7 à 10-15 règles initiales | 🟡 | 55% | Piloté par `docs/ds-audit-consolidated-v2.md`. |
| A faire | Promesse CLI | Nettoyer ou rendre reels `build`, `polish`, `init --extract`, `check --human` | 🟡 | 35% | Eviter les faux succes et la confusion avec la CLI Impeccable upstream. |
| A faire | Traçabilité | Lier règle, principe et finding WP7 | 🟡 | 35% | Matrice à ajouter avant CI. |
| Fait | Release npm DS | Publier les 3 packages DS | 🟢 | 100% | `@sentropic/design-system-{tokens,themes,svelte}@0.8.0` publiés via OIDC + provenance (run `26422110851`). |
| Fait | Release moteur `design` | Publier le module skills | 🟢 | 100% | `@sentropic/design-system-skills@0.1.0` publié (run `26476030707`) ; Trusted Publishing OIDC configuré (rhanka/sent-tech-design-system + skills-publish.yml) ; token bootstrap retiré et révoqué. |
| Attendu | Contrat V1 | Même résultat quel que soit le harness | 🟢 | 100% | `stdout` JSON, `stderr` résumé, exit `0/1/2`, aucune logique métier wrapper. |
| Attendu | Verite produit | Les commandes exposees doivent faire ce qu'elles annoncent | 🟡 | 50% | `audit/check --tech/align --tones` sont concrets; `build/polish/human` restent a durcir ou documenter comme experimentaux. |

**Dépendances** : P0/P1 autonomes. P2+ consomme WP7 et doit citer `docs/ds-audit-consolidated-v2.md`.
**Parallélisable avec** : WP7 et tous les autres.

## WP9 — Surface Chat / Agent (re-scope + bug d'alignement)

**Statut global** : 🔵 cadré (2026-05-26) — déclenché par un bug visible : les composants chat sont rangés sous « Formulaire » et désalignés.

**Décidé 2026-05-26** : sortir le chat du topic « Formulaire » et créer un topic dédié **« Chat » / « Agent »** dans le catalogue docs. Réaligner les notions du domaine agentique.

| Item | Statut | Notes |
|---|---|---|
| Topic catalogue « Chat / Agent » | 🔵 | Recatégoriser ChatMessage/Thread/Composer/StreamingMessage/MessageActions/MessageStatusBadge hors `form` |
| Input chat multiligne auto-resize | ⚪ | ChatComposer : textarea qui grandit en multilignes (cap hauteur + scroll) |
| Réalignement notions agentiques | ⚪ | streaming, **reasoning**, **tool calling** : nomenclature + primitives/états cohérents (manque reasoning + tool I/O explicites) |
| Page docs dédiée « Chat / Agent » | ⚪ | Démos contextualisées : conversation live, streaming, reasoning, appels d'outils |

**Dépendances** : WP4 (primitives existantes) ; WP2 (catégorisation catalogue).
**Parallélisable avec** : WP10, WP12.

## WP10 — Theming via le moteur `design` (skills) — **AVANT WP7**

**Statut global** : ⚪ cadré (2026-05-26). **Priorité explicite : à faire avant WP7.**

**Décidé 2026-05-26** : deux features du moteur `design` autour du theming.

| Item | Statut | Notes |
|---|---|---|
| `design` applique le DS Sentropic | ⚪ | Choisir un thème existant, ou en **créer un de façon assistée** |
| `design` mappe un DS tiers → thème | ⚪ | Génère un thème Sentropic à partir d'un DS externe (tokens/couleurs/typo/espacements) |
| Thème `@sentropic/design-system-theme-dsfr` | ⚪ | DSFR (design system de l'État FR) — cas de **test** du mapping, à publier |
| Thème `@sentropic/design-system-theme-carbon` | ⚪ | IBM Carbon — à publier |
| Thèmes clients : Airbus / Scalian / CGI | ⚪ | Airbus fourni par l'utilisateur ; Scalian à récupérer ; CGI aussi. Non publics a priori |

**Dépendances** : WP8 (moteur `design` + `packages/themes`).
**Parallélisable avec** : WP9, WP12.

## WP11 — Dogfooding du moteur publié (complément WP7)

**Statut global** : ⚪ cadré (2026-05-26).

**Décidé 2026-05-26** : utiliser le package **publié** `@sentropic/design-system-skills` pour auditer/aligner **notre propre repo et site** (dogfooding). Complète WP7 par une boucle réelle « le moteur sur lui-même ».

| Item | Statut | Notes |
|---|---|---|
| Installer la lib publiée si nécessaire | ⚪ | `npm i -D @sentropic/design-system-skills` (ou `npx`) ; signaler à l'utilisateur |
| `design check` sur le site/docs DS | ⚪ | Exécuter sur les pages réelles, consigner les findings |
| Boucler findings → corrections | ⚪ | Rejoint WP6 (bugs) et WP7 (couverture) |

**Dépendances** : WP8 (package publié).
**Parallélisable avec** : tous.

## WP12 — Templates docs & présentations slides (ESN)

**Statut global** : ⚪ cadré (2026-05-26) — nouveau périmètre à valider.

**Décidé 2026-05-26** : ajouter un périmètre **templates de documents** et **présentations slides** (typologie ESN). Decks Scalian / CGI fournis par l'utilisateur **comme référence de typologie de slides** (pas la colorimétrie).

| Item | Statut | Notes |
|---|---|---|
| Cadrage périmètre | ⚪ | Statuer : est-ce dans le scope d'un design system ? format de sortie (HTML/MD/pptx/Slidev ?) |
| Typologie slides ESN | ⚪ | Couverture, sommaire, sections, contenu, comparatif, closing… à partir des decks Scalian/CGI |
| Templates docs | ⚪ | Gabarits de documents (rapport, proposition) cohérents avec le DS |

**Dépendances** : à préciser (probablement tokens/themes pour la cohérence visuelle).
**Parallélisable avec** : tous.

## Plan de bataille parallele

A tout instant on peut tenir 3 a 4 agents en parallele sans conflit de fichiers. **Priorité actuelle (révisée 2026-05-26, cœur WP8 livré + 4 packages publiés)** :

1. **WP9 Chat/Agent** — bug le plus visible : sortir le chat du formulaire, topic dédié, input multiligne, réalignement streaming/reasoning/tool-calling.
2. **WP10 theming via `design`** — appliquer DS Sentropic + mapper DS tiers → thèmes ; livrer `theme-dsfr` + `theme-carbon`. **Explicitement avant WP7.**
3. **WP6 fix-plan** — retest visuel Playwright overlays + plan-completion (débloque la re-passe WP2).
4. **WP11 dogfooding** — moteur publié sur notre propre site (complément WP7).
5. **WP7 audit DS** — après WP10 ; committer la matrice de couverture, combler les trous règle/test.
6. Fond : **WP5 charts**, **WP8 ruleset 7→15**, **WP12 templates/slides** (à cadrer).

## Decisions ouvertes à trancher

1. **WP12** : les templates docs / slides relèvent-ils du périmètre DS ? format de sortie (HTML / Slidev / pptx) ?
2. **WP10** : stratégie de thème — un thème par client (Airbus/Scalian/CGI) publié ou privé ? convention de nommage `@sentropic/design-system-theme-<x>`.
3. **WP9** : faut-il de nouvelles primitives (ReasoningBlock, ToolCall) ou enrichir les existantes ?
4. WP8 : adapters multi-harness (`.codex` / `.gemini`) — implémenter ou rester en wrapper unique.

## Hygiene de ce doc

Maj attendue apres chaque commit majeur. Owner : main agent. Tracks orphelins ou termines basculent en \"Acheve\" en bas du doc une fois entierement shippe.
