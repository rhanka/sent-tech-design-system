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

**Statut global** : 🟢 couverture publique fermee, retest navigateur cible overlays/plan-completion consigne.

| Item | Statut | Commits | Notes |
|---|---|---|---|
| Sidebar rectangulaire actif + densite groupes | 🟢 | `15d9690`, `ce3bfdc`, `dbdd1be` | |
| Header docs aligne contrat (logo SENT + langue) | 🟢 | `94e5fce`, `45dd0c8`, `defb1b7` | |
| Reprise header docs publie + garde contractuelle | 🟢 | `8ace58a` | Logo carre + `Sentropic` / `Design System`, GitHub icone, sent-tech.ca retire du header, controles langue/compte harmonises, test `header-contract` |
| Home i18n complete | 🟢 | `55781c1`, `40b4b98` | catalogue descriptions bilingues |
| Plan-completion hero shelf + contexte demos | 🟢 | `824a2b7` | |
| Re-passe `/components/overlays` | 🟢 | — | Retest Chrome headless desktop/mobile OK: modal Escape, OverflowMenu z-index 80 > Toast 60. |
| Audit visuel pages composants restantes | 🟢 | — | Retest cible `/components/overlays` + `/components/plan-completion` desktop/mobile OK; validation publique ex post reste a faire en fin de loop. |
| Inventaire couverture docs composants | 🟢 | — | 79 entrees catalogue = 79 exports publics Svelte hors `ThemeProvider`; 0 stub catalogue; garde `docs-navigation.test.ts`. |
| Stubs P1 composants | 🟢 | — | Les routes dediees existent pour les composants precedemment restants: forms, navigation, overlays, feedback/data, layout. |
| Exports absents du catalogue | 🟢 | — | Aucun export UI absent; `ThemeProvider` reste exclu intentionnellement (primitive infra). |
| Backlog composants (gap DSFR/Carbon) | ⚪ | — | `docs/ds-component-gap-analysis.md` (2026-05-26). **P1** : Footer, Tile unitaire. **P2** : notification inline, tree view, skip links, sélecteur de langue, citation, highlight. P3 : patterns/primitives. Différenciateurs maison (charts, chat) hors couverture upstream — à garder |

**Dependances** : aucune pour la couverture docs courante; WP6 retest cible consigne.
**Parallelisable avec** : tous.

### Suivi WP2

| Vue | Track | Finalite | Etat | Avancement | Detail |
|---|---|---|---:|---:|---|
| Fait | Inventaire docs | Eviter les stubs invisibles et les exports oublies | 🟢 | 100% | `COMPONENTS` couvre les 79 exports publics Svelte hors `ThemeProvider`; test de parite ajoute. |
| Fait | Pages dediees | Fermer les stubs P1 visibles et les composants anciennement groupes | 🟢 | 100% | Routes dediees presentes pour forms, navigation, overlays, feedback/data, layout et charts. |
| Fait | Catalogue absents | Ajouter les exports publics manquants au flux docs | 🟢 | 100% | Aucun export UI absent; `ThemeProvider` reste infra et exclu. |
| Fait | Validation navigateur cible | Rejouer le site docs sur desktop/mobile et inspecter overlays + plan-completion | 🟢 | 100% | `npm --workspace apps/docs run build` puis smoke Chrome headless: overlays desktop/mobile (modal Escape, menu z 80 > toast 60), plan-completion desktop/mobile (popover z 80, drawer backdrop fixed z 100, Escape close). Validation publique ex post gardee pour la fin du loop. |
| Attendu | Couverture publique | Aucun composant exporte ne doit etre invisible ou stub sans owner | 🟢 | 100% | Garde automatique: catalogue = exports publics et tous les statuts catalogue sont `documented`. |

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

**Statut global** : 🟢 P0 **publié `0.9.0`** (Sparkline/Bar/Line/Area, consommés par agent-stats) + **P1 livré en local** (Donut/Scatter/StackedBar — `8a9ded0`, à publier via D1).

**Décidé 2026-05-22** : **C hand-rolled intégral**. Aucune dépendance, full control, white-label parfait. Chaéchelles/axes/tooltips/légendes/a11y écrits par nous.

| Item | Statut | Commits | Notes |
|---|---|---|---|
| Roadmap `docs/graphics-roadmap.md` | 🟢 | `76703c3` | base de référence |
| Foundation décidée : C hand-rolled | 🟢 | — | |
| Sparkline | 🟢 | `0.9.0` | exporté + page docs + catalogue |
| BarChart | 🟢 | `0.9.0` | exporté (était caché) + page docs + catalogue ; vertical/horizontal, tons catégoriels |
| LineChart | 🟢 | `0.9.0` | exporté (était caché) + page docs + catalogue ; smooth/area, axe X ordinal ou linéaire |
| AreaChart | 🟢 | — | déjà exporté + page docs |
| StackedBar | ⚪ | — | P1 |
| DonutChart | ⚪ | — | P1 |
| ScatterPlot | ⚪ | — | P2 |

**Estimé** : 15-20j pour 6 charts P0/P1, mais Sparkline et BarChart livrables dès la première semaine.

**Dependances** : aucune.
**Parallelisable avec** : tous.

## WP6 — Fix-plan (bugs DS visuels et comportementaux)

**Statut global** : 🟢 bugs corrigés et retest navigateur cible overlays/plan-completion consigné.

| Bug | Statut | Surface | Severity |
|---|---|---|---|
| Toast / Alert rail gauche + container arrondi | 🟢 | `Toast.svelte`, `Alert.svelte` | corrigé `a85a379`; retest `/components/overlays` desktop/mobile OK |
| OverflowMenu z-index < Toast | 🟢 | `OverflowMenu.svelte`, `Toast.svelte` | corrigé `d85ca6e`; Chrome confirme menu z-index 80 > Toast 60 |
| Drawer click intercepte par Menu | 🟢 | `Menu.svelte` | corrigé `de0c059`; retest `/components/plan-completion` desktop/mobile OK |

Detail dans `docs/known-issues-and-fixes.md`.

**Dependances** : aucune.
**Parallelisable avec** : tous (composants disjoints).
**Bloque** : rien; la re-passe WP2 overlays/plan-completion est consignée.

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
| Fait | Audit V1/V2 | Consolider les findings DS en source exploitable | 🟢 | 100% | Audit V1, 5 rapports clusters, master V2, 25 règles actives transmises à WP8. |
| A faire | Couverture | Prouver la couverture complète des 37 références upstream | 🟡 | 45% | Fermer les statuts A-E et documenter la matrice de couverture. |
| Fait | Traçabilité | Relier `finding WP7 -> règle WP8 -> test` | 🟢 | 100% | `docs/ds-audit-coverage-matrix.md` et `docs/wp8-design-cli-traceability.md` couvrent les 25 règles + tests. |
| Attendu | Séparation WP7/WP8 | WP7 reste le chantier audit, WP8 reste le moteur | 🟢 | 100% | Toute règle WP8 doit référencer une entrée WP7 V2. |

**Dépendances** : WP8 consomme WP7 pour les règles ; WP6 ne bloque plus WP7 mais impose un retest visuel overlays/plan-completion.

## WP8 — Moteur `design` (CLI 5 verbes) + knowledge base + skill multi-harness

> **Définition canonique (à ne plus driffer).** WP8 = le **moteur `design`** : ré-implémentation maison des capacités de la skill upstream `pbakaus/impeccable` (un « design language » aux dizaines de méthodes), packagée comme **module du design system**. Spec autoritative : `docs/wp8-design-cli-lean-proposal-v3.md`. Origine : session Claude `de3013d2` (22 mai) — « quelque chose de similaire **sans cloner** ».
>
> **Nom du package = `@sentropic/design-system-skills`** (le nom décidé à l'origine). Le rename Codex `→ -impeccable` (commit `3f3cfb6`) est **annulé** : aucun produit ne doit s'appeler « impeccable » (nom de la source).
>
> La CLI `design` factorise 17-19 méthodes en **5 verbes** : `init` · `build <feature>` · `check <target>` · `align <target>` · `polish <target>`. **L'audit n'est qu'1 verbe** = `design check --tech`. Ne jamais réduire le moteur `design` à « audit ».

**Statut global** : 🟢 cœur livré — les 5 verbes `init`/`build`/`check`/`align`/`polish` sont réels ou honnêtement expérimentaux (plus aucun faux succès), 75 tests skills verts ; package renommé `@sentropic/design-system-skills`, **publié `0.1.0` sur npm via OIDC Trusted Publishing**.

**Périmètre V1 livré** : `design check --tech <target>` retourne un rapport JSON, codes `0/1/2`, sans Playwright. C'est 1 des 5 verbes — pas « la CLI ». Les 4 autres verbes sont le cœur du reste de WP8.

**Constaté** : `design init --extract`, `design build <feature>`, `design check --tech/--human`, `design align --tones/--spacing` et `design polish --motion/--essence` produisent des effets ou rapports déterministes réels. Les passes non déterministes (`build --propose/--promote/--global`, `polish --bolder/--quieter/--spark/--charm/--lucid`) sont marquées expérimentales et retournent `2` quand aucun artefact CLI n'est produit.

| Phase | Item | Statut | Notes |
|---|---|---|---|
| P0 Contrat V1 | `design audit <target>`, aliases, codes retour, README/tests | 🟢 100% | binaire `design`, subcommand `audit`, wrapper skill aligne, `check --technical/--heuristics` testes, `--personas` refuse explicitement |
| P1 Moteur statique | `packages/skills` API `audit`, CLI, JSON, jsdom | 🟢 100% | moteur compile et expose `AuditReport` |
| P2 Ruleset initial | 25 règles depuis WP7 | 🟢 100% | 25 règles actives, token-aware, tracées `rule -> principle -> finding WP7`; dogfooding WP11 documenté |
| P3 Knowledge base | `docs/principles/*` reliés aux règles | 🟢 85% | principes présents; chaque règle expose `principle`/`wp7Finding`; matrice WP8 mise à jour |
| P4 Skill multi-harness | wrapper unique Claude/Codex/Gemini, zéro logique métier | 🟢 85% | skill local + plugin portable; wrappers acceptent `audit <target>`/`<target>` et `fidelity ...`; installation harness hors repo à maintenir |
| P5 Distribution/CI/npm | lint CI, publication, règles token-aware | 🟢 90% | DS `0.8.0` + `@sentropic/design-system-skills@0.1.0` publiés via OIDC Trusted Publishing (provenance SLSA). Workflows `npm-publish.yml` (DS, tag `v*`) et `skills-publish.yml` (skills, tag `skills-v*`). |

### Suivi WP8

| Vue | Track | Finalite | Etat | Avancement | Detail |
|---|---|---|---:|---:|---|
| Fait | Scaffold moteur | Disposer d'un moteur local deterministe | 🟢 | 100% | `packages/skills`, API `audit`, CLI, 25 règles, build TypeScript. |
| Fait | Knowledge base | Capturer les principes DS | 🟢 | 100% | `docs/principles/*` initialisés. |
| Fait | Skill V1 | Exécuter le moteur depuis un harness agent | 🟢 | 95% | `tools/skills/sent-tech-skills/scripts/audit.mjs` et la copie plugin appellent le contrat canonique; préfixe `audit` optionnel vérifié. |
| Fait | Alignement CLI/themes | Mapper les corrections CLI vers les vrais tokens publies | 🟢 | 100% | `design align --tones` remplace vers `--st-semantic-*`; les themes exportent `--st-foundation-*`; tests ajoutes. |
| Fait | Ruleset | Passer de 7 à 25 règles initiales | 🟢 | 100% | 25 règles actives pilotées par `docs/ds-audit-consolidated-v2.md`; 75 tests skills verts. |
| Fait | Promesse CLI | Nettoyer ou rendre reels `build`, `polish`, `init --extract`, `check --human` | 🟢 | 100% | `init --extract`, `build` craft, `check --human`, `polish --motion/--essence` sont concrets; passes agentiques non déterministes retournent `2`. |
| Fait | Traçabilité | Lier règle, principe et finding WP7 | 🟢 | 100% | `Rule.principle` / `Rule.wp7Finding` obligatoires et documentés dans `docs/wp8-design-cli-traceability.md`. |
| Fait | Release npm DS | Publier les 3 packages DS | 🟢 | 100% | `@sentropic/design-system-{tokens,themes,svelte}@0.8.0` publiés via OIDC + provenance (run `26422110851`). |
| Fait | Release moteur `design` | Publier le module skills | 🟢 | 100% | `@sentropic/design-system-skills@0.1.0` publié (run `26476030707`) ; Trusted Publishing OIDC configuré (rhanka/sent-tech-design-system + skills-publish.yml) ; token bootstrap retiré et révoqué. |
| Attendu | Contrat V1 | Même résultat quel que soit le harness | 🟢 | 100% | `stdout` JSON, `stderr` résumé, exit `0/1/2`, aucune logique métier wrapper. |
| Attendu | Verite produit | Les commandes exposees doivent faire ce qu'elles annoncent | 🟢 | 100% | Les commandes concrètes produisent des artefacts/rapports; les options agentiques sans artefact CLI sont documentées comme expérimentales et sortent en `2`. |

**Dépendances** : P0/P1 autonomes. P2+ consomme WP7 et doit citer `docs/ds-audit-consolidated-v2.md`.
**Parallélisable avec** : WP7 et tous les autres.

## WP9 — Surface Chat / Agent (re-scope + bug d'alignement)

**Statut global** : 🟢 livré (2026-05-27) — topic dédié, reasoning ajouté + **démo docs reasoning**. Reste : publication npm (→ D1). Input auto-resize : présent ; alignement chat-ui = D2.

**Décidé 2026-05-26** : sortir le chat du topic « Formulaire » et créer un topic dédié **« Chat » / « Agent »** dans le catalogue docs. Réaligner les notions du domaine agentique.

| Item | Statut | Notes |
|---|---|---|
| Topic catalogue « Chat & Agent » | 🟢 | Catégorie `chat` créée ; 6 composants déplacés hors form/action (`21334b5`) |
| Input chat multiligne auto-resize | 🟢 | `ChatComposer` le faisait déjà (autosize, Enter/Shift+Enter, cap maxRows + scroll) — vérifié |
| Réalignement notions agentiques | 🟢 | **reasoning ajouté** à StreamingMessage (`reasoning.delta`/`completed` + bloc repliable) ; streaming + tool calling (tool.*/permission/checkpoint) déjà présents (`83d3449`) |
| Page docs dédiée + démo reasoning | 🟢 | Page `streaming-message` documentée avec démo reasoning + tool + permission ; publication npm reste D1 |

**Dépendances** : WP4 (primitives existantes) ; WP2 (catégorisation catalogue).
**Parallélisable avec** : WP10, WP12.

## WP10 — Theming via le moteur `design` (skills) — **AVANT WP7**

**Statut global** : 🟡 **recalibré (2026-05-27)** — cible retargettée « **parité anatomique contrôlée** » (un thème ≠ que des couleurs). Noyau DSFR/Carbon livré et publié dans la ligne 0.10.x ; thème Airbus public-ready sur `main`, non publié. Reste : rollout Phase 2 + gouvernance des thèmes clients tiers.

**Recadrage (2026-05-27)** : le « 2 thèmes publiés 0.1.0 » ne changeait que **les couleurs** (couche `component` figée + tokens `foundation` débranchés des composants). Retargeté → spec `docs/superpowers/specs/2026-05-27-theme-anatomy-clone-design.md` (revu Codex+Opus). Pilote = Button/Input/Link/Card/Tabs × DSFR+Carbon.

| Item | Statut | Notes |
|---|---|---|
| Skill de mapping + **passe QA fidélité obligatoire** | 🟢 | `reference/theme-mapping.md` : confronter au réel (banc), mesurer écarts par côté/état, gate avant publish |
| Socle theming (builder `createComponent` + alias `--st-*`) | 🟢 local | rebranche `foundation` sur tous les composants (bug couleur-only corrigé) |
| Contrat `ComponentAnatomy` **v1.2.0** (focus strategy, states, density, field.style) | 🟢 local | typé+versionné ; gate Phase 2 = schéma figé |
| 5 composants pilote lisent l'anatomie | 🟢 local | Button/Input/Link/Card/Tabs, sans régression Sent Tech |
| Fidélité DSFR/Carbon (noyau) | 🟢 local | input rempli+souligné (Carbon quasi-identique, DSFR proche), résidus tracés matrice |
| Banc `/compare` réel (ours vs DS officiel en iframe) | 🟢 local | thèmes importés only, hauteur égale, langue native, versions DS+thème |
| Sélecteur de thème docs (`:root`) | 🟢 local | switch qui change l'**anatomie** (police/radius/focus/champ) |
| **Publication npm** (DS + thèmes, post-anatomie) | 🟢 | DS/tokens/themes/svelte publiés jusqu'à la ligne 0.10.x; les thèmes clients restent hors publication automatique. |
| Rollout Phase 2 (~55 composants restants) | ⚪ | après schéma figé |
| Thème client Airbus | 🟡 | Package public-ready `packages/theme-airbus` (`airbusTheme`, `airbusDarkTheme`, tests, `MAPPING.md`) sur `main`; publication npm bloquée jusqu'à décision version/release. |
| Thèmes clients : Scalian / CGI | ⚪ | plus tard ; **hors git** tant que non cadrés |

**Dépendances** : WP8 (moteur `design` + `packages/themes`).
**Parallélisable avec** : WP9, WP12.

### Suivi WP10 Airbus

| Vue | Track | Finalite | Etat | Avancement | Detail |
|---|---|---|---:|---:|---|
| Fait | Coordination | Declarer l'ownership du portage Airbus | 🟢 | 100% | Session h2a ouverte comme `codex:sent-tech-design-system`; messages envoyes aux agents DS et Airbus. |
| Fait | Scaffold theme | Isoler le portage dans un package theme dedie | 🟢 | 100% | `packages/theme-airbus`, package public-ready `@sentropic/design-system-theme-airbus`, export `airbusTheme`. |
| Fait | Contrat test | Proteger l'identite minimale du theme | 🟢 | 100% | Test Vitest red/green sur `compileTheme(airbusTheme)` et tokens Airbus clefs. |
| En cours | Fidelity | Comparer les composants pilotes contre Airbus reel | 🟡 | 75% | Anatomie étendue + dark mode + alignements pilotes portés; dernier jalon local annonce 90,3% sur le périmètre mesuré. Vérifié 2026-06-01: build/check/test `packages/theme-airbus` OK, 3 tests verts. Reste référence visuelle redistribuable/pipeline final. |
| A faire | Gouvernance | Decider la distribution du theme client | ⏸️ | 0% | Ne pas publier npm tant que version, nommage et contraintes Airbus ne sont pas valides. |

## WP11 — Dogfooding du moteur publié (complément WP7)

**Statut global** : 🟢 passage WP11 consigné et fermé (2026-06-01), audit full-site à 0 finding sur le build docs.

**Décidé 2026-05-26** : utiliser le package **publié** `@sentropic/design-system-skills` pour auditer/aligner **notre propre repo et site** (dogfooding). Complète WP7 par une boucle réelle « le moteur sur lui-même ».

| Item | Statut | Notes |
|---|---|---|
| Installer la lib publiée si nécessaire | 🟢 | Workspace local utilisé; package publié `@sentropic/design-system-skills@0.1.0` déjà disponible. |
| `design check` sur le site/docs DS | 🟢 | Build docs courant audité: 85 pages, 25 règles, 0 finding après corrections `h1-inline-badge`, `status-indicator-label`, `line-length-cap`, déduplication `no-em-dash`, précision `no-bare-hex`, `single-font` et copy docs; voir `docs/dogfooding-design-check.md`. |
| Boucler findings → corrections | 🟢 | Dette prioritaire `no-em-dash` 60 → 0; `single-font`, `no-bare-hex`, `h1-inline-badge`, `status-indicator-label` et `line-length-cap` restent à 0. |

**Dépendances** : WP8 (package publié).
**Parallélisable avec** : tous.

## WP12 — Templates docs & présentations slides (ESN)

**Statut global** : 🟡 premier kit source livré (2026-06-01) — périmètre DS confirmé en structure/typologie, exports binaires à décider plus tard.

**Décidé 2026-05-26** : ajouter un périmètre **templates de documents** et **présentations slides** (typologie ESN). Decks Scalian / CGI fournis par l'utilisateur **comme référence de typologie de slides** (pas la colorimétrie).

| Item | Statut | Notes |
|---|---|---|
| Cadrage périmètre | 🟢 | Décision opérationnelle: le DS porte la structure, la typologie et les contrats de contenu; les marques client et exports finaux restent côté consommateur. Format source Markdown-first, convertible ensuite en `.docx`, `.pptx`, HTML ou Slidev. |
| Typologie slides ESN | 🟢 | `docs/templates/esn/taxonomy.md` couvre familles documentaires et slides: cover, agenda, situation, problem framing, target state, options, recommendation, roadmap, gouvernance, commercial frame, next steps. |
| Templates docs | 🟢 | `proposal-template.md`, `delivery-report-template.md` et `slide-deck-template.md` livrés comme gabarits neutres. |

**Dépendances** : tokens/themes pour la présentation finale; export `.docx/.pptx` non requis pour le kit source.
**Parallélisable avec** : tous.

## WP13 — DS React (portage cadré, sans collision Svelte)

**Statut global** : 🟢 **port complet intégré sur `main`**. `packages/components-react` couvre les exports publics Svelte via un package public-ready `@sentropic/design-system-react@0.1.0`. Vérifié 2026-06-01 : build/check OK, 95 tests React verts. Reste hors cœur : surface docs React exploitable côté site et release workflow dédié.

**Décidé 2026-05-30** : Codex prend le rôle d'owner React. Claude conserve les chantiers Svelte/docs/themes/release/fidelity en cours. Toute modification de fichiers partagés (`package-lock.json`, scripts racine, navigation docs, release tags) doit être annoncée via h2a avant édition.

| Item | Statut | Owner | Notes |
|---|---|---|---|
| État des lieux React | 🟢 | Codex | Inventaire et périmètre clos; package React présent sur `main`. |
| Contrat React | 🟢 | Codex | API props + CSS variables + peer deps `react`/`react-dom` documentés dans `packages/components-react/README.md`. |
| Scaffold `packages/components-react` | 🟢 | Codex | Package isolé, build TypeScript, styles partagés, exports et tests présents. |
| Docs React | 🟡 | Codex | `REACT_DOCS_SURFACE.md` proposé; intégration dans le site docs à faire sans réécrire les pages Svelte. |
| Tracks Svelte/docs/themes/release/fidelity | 🟢 | Claude | Pas de conflit bloquant restant; release React à traiter comme workflow séparé. |

### Coordination WP13

| Quand | Codex | Claude | Règle |
|---|---|---|---|
| Maintenant | Maintenir `packages/components-react` isolé et ses tests. | Continuer les tracks non React. | Tout fichier partagé reste annoncé avant édition. |
| Avant docs React | Proposer surface docs React incrémentale. | Vérifier navigation/catalogue docs. | Ne pas dupliquer les pages Svelte sans besoin. |
| Avant release | Vérifier build/test React + smoke package. | Vérifier workflow/tags. | Release coordonnée, pas de tag partiel non annoncé. |

**Dépendances** : tokens/themes existants ; stabilisation des changements release/docs/fidelity en cours côté Claude.
**Parallélisable avec** : WP7/WP8/WP10 côté Claude tant que les fichiers partagés sont évités.

## Mise à jour 2026-05-31 — ports React/Airbus intégrés, chrome par thème ouvert

- **ForceGraph 0.10.3** (API sélection : `selectedIds`/`focusId`/`onSelect`/`onOpenEntity`) **publié npm** (lockstep tokens/themes/svelte 0.10.3).
- **Compare-mode** : Lot 1 (socle de vérité partagée) livré sur main ; Lot 2 (UI triptyque, Δ lus du registre) livré sur branche `claude-compare-lot2` (en revue) ; hooks d'overlay local générique = **next step** (Claude).
- **WP13 React** : **port complet intégré sur `main`** (package public-ready, build/check OK, 95 tests verts au 2026-06-01). Reste : surface docs React + release workflow dédié.
- **WP10 Airbus** : **thème complet sur `main`** (palette + anatomie + dark mode `airbusDarkTheme`, package public-ready non publié) ; vérification locale build/check/test OK. Reste : pipeline fidélité final et gouvernance publication.
- **WP14** : chrome documentaire par thème présent sur `main` (ci-dessous), validation visuelle publique gardée pour la fin de loop.

## WP14 — Chrome documentaire par thème (header + barre latérale fidèles au DS)

**Statut global** : 🟢 implémenté sur `main` — Chrome Carbon + DSFR + Airbus + sent-tech livrés. DSFR et Airbus utilisent des assets SVG versionnés; Carbon garde un wordmark placeholder propre. Validation visuelle publique ex post gardée pour la fin de loop.

**Problème (signalé par l'utilisateur — déjà demandé)** : aujourd'hui, basculer de thème ne change **que la police / l'anatomie** (tokens). Le **chrome documentaire** (header avec logo, menu de header, menu de barre latérale) reste le nôtre → « **pas crédible** ». Exigence : quand on passe sur un thème d'import, **tout le chrome des docs doit prendre la FORME du site de documentation réel de ce design system** — **logos pixel-perfect**, forme du header, forme du menu de header, forme du menu latéral. On parle de la **FORME** (header / nav / sidebar), pas du contenu de présentation.

**Références (captures utilisateur 2026-05-31)** :
- **Carbon (IBM)** : header **barre noire** pleine largeur, « Carbon Design System » à gauche, icônes recherche + grille (3×3) à droite ; **barre latérale gauche** = arbre de nav (All about Carbon, What's happening, **Designing** [actif, surbrillance grise], Developing, Contributing, Migrating, puis Elements / Guidelines / Components / Patterns / Community assets / Data visualization / Help, **GitHub** avec icône lien externe). Typo IBM Plex.
- **DSFR (État FR)** : header **blanc**, **logo RF** (bloc « RÉPUBLIQUE FRANÇAISE » + devise) + titre « Système de Design de l'État » ; à droite « Être tenu informé » + sélecteur de version `</> v1.14` + **grande barre de recherche** ; **nav horizontale** (Premiers pas / Fondamentaux / Composants / Modèles / Mesure d'audience / Communauté / Aide / À propos) avec onglet actif **souligné** ; **barre latérale gauche** (item actif en **bloc bleu** + barre latérale d'accent) + **fil d'Ariane**. Typo Marianne.
- **Airbus** : même esprit, **référence extraite de `../airbus-design-system`** par Codex (logo SVG + forme header + barre latérale) — capture fournie plus tard par l'utilisateur.
- **Standard (sent-tech)** : un **chrome standard** de base, propre (le nôtre).

**Doute explicite à lever** : les composants utilisés pour le rendu de la doc (header, menu de header, barre latérale) ne sont peut-être pas assez **paramétrables** pour porter ces formes (« y a que la police qui change ») → audit puis généralisation si besoin.

| Item | Statut | Owner | Notes |
|---|---|---|---|
| Audit du chrome actuel (header/menu/sidebar paramétrables par thème ?) | ✅ | Claude | Fait — chrome non paramétrable → généralisé (3 composants + layout conditionnel). |
| Logos pixel-perfect par DS | 🟡 | Claude + Codex | DSFR + Airbus SVG versionnés dans `apps/docs/static/chrome/`; Carbon reste placeholder propre à remplacer par wordmark officiel si fourni. |
| Chrome **Carbon** (barre noire + sidebar arbre + icônes) | ✅ | Claude | Livré sur `main`; forme documentaire Carbon présente. |
| Chrome **DSFR** (logo RF + nav horizontale soulignée + sidebar bloc actif + fil d'Ariane) | ✅ | Claude | Livré sur `main`; Marianne active (chargée via CDN). |
| Chrome **Airbus** (même esprit) | ✅ | Claude + réf Codex | Livré sur `main` avec header navy, wordmark blanc et sidebar Airbus. À affiner uniquement après nouvelle référence visuelle. |
| Chrome **standard** sent-tech | ✅ | Claude | Chrome d'origine conservé intact (rendu SSR + thème par défaut). |

### Suivi WP14
| Vue | Track | Finalité | État | Avancement | Détail |
|---|---|---|---:|---:|---|
| Fait | Audit chrome | Vérifier la paramétrabilité header/menu/sidebar par thème | ✅ | 100% | Chrome non paramétrable → 3 composants ChromeCarbon/ChromeDsfr/ChromeAirbus + layout conditionnel client-only. |
| Fait | Carbon + DSFR | Reproduire la FORME des 2 sites de doc réels (header + nav + sidebar + logo pixel-perfect) | ✅ | 90% | Forme fidèle livrée; Carbon logo placeholder, DSFR asset versionné. |
| Fait | Airbus + standard | Airbus dans le même esprit + chrome standard sent-tech | ✅ | 85% | Standard intact. Airbus header navy + wordmark blanc + sidebar livrés; affinement futur dépend d'une référence visuelle validée. |
| Attendu | Crédibilité | Basculer le thème change le **chrome entier** (header/logo/nav/sidebar), pas que la police | ✅ | 100% | Implémenté sur `main`; validation visuelle publique ex post à la fin. |

**Dépendances** : thème actif (switcher, WP10) ; réf chrome Airbus (WP10/Codex). **Owner** : Claude (docs). **Parallélisable** : oui (apps/docs, hors `packages/components-react/**` et `packages/theme-airbus/**`).

## Plan de bataille parallele

A tout instant on peut tenir 3 a 4 agents en parallele sans conflit de fichiers. **Priorité actuelle (révisée 2026-05-30, cœur WP8 livré + 4 packages publiés, WP10 Airbus initié, WP13 React cadré)** :

1. **WP10 thème Airbus** — Codex owner : continuer le mapping theme/anatomie depuis `../airbus-design-system`, puis brancher la fidélité visuelle.
2. **WP13 DS React** — cadrage Codex uniquement pour l'instant : état des lieux, contrat MVP, pas de scaffold avant coordination h2a.
3. **WP9 Chat/Agent** — bug le plus visible : sortir le chat du formulaire, topic dédié, input multiligne, réalignement streaming/reasoning/tool-calling.
4. **WP10 theming via `design`** — appliquer DS Sentropic + mapper DS tiers → thèmes ; livrer `theme-dsfr` + `theme-carbon`. **Explicitement avant WP7.**
5. **WP6 fix-plan** — retest visuel Playwright overlays + plan-completion (débloque la re-passe WP2).
6. **WP11 dogfooding** — moteur publié sur notre propre site (complément WP7).
7. **WP7 audit DS** — après WP10 ; committer la matrice de couverture, combler les trous règle/test.
8. Fond : **WP5 charts**, **WP8 ruleset 7→15**, **WP12 templates/slides** (à cadrer).

## Decisions ouvertes à trancher

1. **WP12** : les templates docs / slides relèvent-ils du périmètre DS ? format de sortie (HTML / Slidev / pptx) ?
2. **WP10** ✅ tranché (2026-05-31) : le **port Airbus est committable** (jugé non confidentiel), package public-ready **non publié npm**, présent dans le switcher docs. Les logos chrome Airbus utilisés par la doc sont désormais versionnés; les CSS/références privées futures restent hors-git tant que leur redistribution n'est pas validée (idem futurs Scalian/CGI).
3. **WP9** : faut-il de nouvelles primitives (ReasoningBlock, ToolCall) ou enrichir les existantes ?
4. **WP13** ✅ tranché (2026-05-31) : **couverture large** — port complet des exports publics, **composants React purs** (pas de dép headless), package intégré sur `main`; surface docs React et release workflow dédiés restent à finir.
5. WP8 : adapters multi-harness (`.codex` / `.gemini`) — implémenter ou rester en wrapper unique.

## Hygiene de ce doc

Maj attendue apres chaque commit majeur. Owner : main agent. Tracks orphelins ou termines basculent en \"Acheve\" en bas du doc une fois entierement shippe.
