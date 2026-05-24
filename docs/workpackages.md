# Work packages — Sent Tech Design System

Doc vivant qui consolide les tracks en cours, leur état d'avancement et les axes parallelisables. Mis a jour a chaque livraison majeure (commit + push). Voir `docs/known-issues-and-fixes.md` pour le detail des bugs ouverts.

## Legende

- 🟢 Done — shippe et verifie sur `main`
- 🟡 In progress — travail demarre, partiel sur `main`
- 🔵 Ready — debloque, prochain item a lancer
- ⏸️ Blocked — necessite une decision ou une dependance externe
- ⚪ Planned — pas demarre

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
| Home i18n complete | 🟢 | `55781c1`, `40b4b98` | catalogue descriptions bilingues |
| Plan-completion hero shelf + contexte demos | 🟢 | `824a2b7` | |
| Re-passe `/components/overlays` | ⚪ | — | bloque par WP6 (z-index Toast / OverflowMenu) |
| Audit visuel pages composants restantes | ⚪ | — | apres WP6 |

**Dependances** : WP6 pour la re-passe overlays.
**Parallelisable avec** : tous, sauf overlay tant que WP6 pas fait.

## WP3 — Contrat header cross-site et applications

**Statut global** : 🟢 cote DS ; application Sentropic/NC déléguée à l'utilisateur.

| Item | Statut | Commits | Notes |
|---|---|---|---|
| Contrat `docs/header-alignment-contract.md` | 🟢 | `44c4871` | 4 decisions validees (logo SENT + langue partout + connexion conditionnelle + burger droite + nav contextuelle) |
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

**Statut global** : 🔵 3 bugs documentes, pret a lancer.

| Bug | Statut | Surface | Severity |
|---|---|---|---|
| Toast / Alert rail gauche + container arrondi | 🔵 | `Toast.svelte`, `Alert.svelte` | haute (anti-pattern visuel signale plusieurs fois) |
| OverflowMenu z-index < Toast | 🔵 | `OverflowMenu.svelte`, `Toast.svelte` | haute |
| Drawer click intercepte par Menu | 🔵 | `Menu.svelte` (manque outside-click + Escape) | haute |

Detail dans `docs/known-issues-and-fixes.md`.

**Dependances** : aucune.
**Parallelisable avec** : tous (composants disjoints).
**Bloque** : WP2 re-passe overlays.

## WP7 — Audit DS large (37 références upstream, 5 clusters parallèles)

**Statut global** : 🟡 relancée et consolidée en V2 (master dédié disponible), suivi d'implémentation WP7-B en cours.

Objectif : appliquer les bonnes pratiques de design à NOTRE design system, couverture complète des 37 références upstream `pbakaus/impeccable`.

**Décidé 2026-05-22** : couverture complète des 37 références via 5 agents par cluster d'axes + 1 consolidateur en fin de cycle. Sortie : un rapport par axe + un master consolidé + commits de fixes P0 atomiques au fur et à mesure.

| Cluster | Références upstream | Statut | Sortie |
|---|---|---|---|
| A. Typography & writing | `typography`, `typeset`, `ux-writing`, `clarify`, `cognitive-load` | 🟡 en cours | `docs/ds-audit-typography.md` |
| B. Color & contrast | `color-and-contrast`, `colorize`, `bolder`, `quieter` | 🟡 en cours | `docs/ds-audit-color.md` |
| C. Spatial & responsive | `spatial-design`, `layout`, `responsive-design`, `shape` | 🟡 en cours | `docs/ds-audit-spatial.md` |
| D. Motion & interaction | `motion-design`, `animate`, `interaction-design`, `delight`, `overdrive` | 🟡 en cours | `docs/ds-audit-motion.md` |
| E. Audit/critique/polish | `audit`, `critique`, `polish`, `harden`, `optimize`, `extract`, `distill`, `craft` | 🟡 en cours | `docs/ds-audit-meta.md` |
| F. Consolidateur | merge des 5 + dédupe vs `docs/known-issues-and-fixes.md` + priorisation P0/P1/P2 | 🟢 post-clusters | `docs/ds-audit-consolidated-v2.md` (master) |
| Application des fixes critiques (P0) | — | ⚪ après master | commits atomiques au fil de l'eau |
| Capacité "audit on push" via workflow GitHub | — | ⚪ post-MVP | hook CI |

**Dépendances** : les 5 clusters parallèles ; le consolidateur attend leur sortie.

## WP8 — Librairie maison `lint-ds` + knowledge base + skill multi-harness

**Statut global** : 🟡 v1 scaffold WP8 actif (`packages/impeccable`), cible de revue verrouillée via `docs/wp8-multi-harness-target-review.md`.

**Décidé 2026-05-22** : parité fonctionnelle large (~40-50 règles, ~10 axes) + knowledge base markdown sous `docs/principles/` (les principes Sent Tech) + skill multi-harness installable pour **Claude, Codex et Gemini** (squelette d'abord, puis étoffé). Architecture moteur : statique (PostCSS AST + regex + token lookup) en priorité, runtime (Playwright) en option pour ce qui ne se mesure pas statiquement.

| Phase | Item | Statut | Notes |
|---|---|---|---|
| 1. Scaffold cœur | `packages/impeccable/` (moteur, CLI, types, registry) | 🟢 | TypeScript, ESM, jsdom/PostCSS pour parser, sortie JSON+pretty |
| 1. Scaffold cœur | 10-15 règles initiales bien choisies | 🔵 | mix de règles évidentes (`no-bare-hex`, `single-font`, `no-em-dash`, `side-tab-on-rounded`, `line-length-cap`, `touch-target-44`) |
| 1. Knowledge base | `docs/principles/` (5-7 .md alignement Sent Tech) | 🟢 | typography, color, spatial, motion, ux-writing, interaction, responsive |
| 1. Skill scaffold | `tools/skills/sent-tech-impeccable/` pour Claude | 🟢 | `SKILL.md` + reference + scripts entry |
| 2. Extension règles | ~30-35 règles additionnelles au fil de WP7 | ⚪ | une règle par finding récurrent |
| 2. Multi-harness | `.codex/` et `.gemini/` adapters | 🟡 | cible de revue définie, implémentation suivante |
| 3. Capacité différenciante | règles propres Sent Tech > upstream | ⚪ | post-parité |

**Estimé** : 1 semaine pour Phase 1 (scaffold + 10-15 règles + knowledge base squelette + skill Claude), puis 3-4 semaines d'extension pilotée par WP7.

**Dépendances** : aucune en Phase 1. Phase 2 enrichit selon les findings WP7.

## WP8 — Module DS impeccable-équivalent (librairie maison, parallèle de WP7)

**Statut global** : 🟡 en alignement V1, prêt pour livraison incrémentale.

**Décidé 2026-05-22** : **réimplémentation refactorée, parité fonctionnelle** sur un périmètre réduit. Pas une copie 1:1 des 27 règles upstream — on sélectionne les règles essentielles, on les écrit propres, on ajoute les règles Sent Tech (rail+arrondi, hiérarchie z-index, token-usage).

Objectif : shipper `@sentropic/design-system-impeccable` (workspace dans `packages/impeccable/`) : moteur maison, CLI, règles essentielles, indépendant de l'upstream.

| Item | Statut | Notes |
|---|---|---|
| Décision : réimplémentation refactorée parité fonctionnelle | 🟢 | scope réduit, ~10-15 règles bien choisies |
| Squelette `packages/impeccable/` (workspace, package.json, build) | 🟢 | npm package + CLI binaire |
| Architecture du moteur (Puppeteer vs JSDOM vs autre) | 🟢 | choisir, documenter dans le package README |
| ~10-15 règles essentielles (parité fonctionnelle) | 🟡 | sélectionnées via lecture de l'upstream, pas blocage sur WP7 |
| Règles Sent Tech spécifiques | 🔵 | rail+arrondi, z-index, token-usage |
| Capacité différenciante (mieux qu'impeccable upstream) | ⚪ | post-parité |

**Estimé** : 10-15j pour parité réduite + 3-5j de règles Sent Tech.

**Dépendances** : aucune dure. WP7 (l'audit) viendra enrichir/valider la sélection des règles essentielles mais ne bloque pas le squelette + architecture.
**Parallélisable avec** : WP7 et tous les autres.

## Plan de bataille parallele

A tout instant on peut tenir 3 a 4 agents en parallele sans conflit de fichiers. Priorité actuelle :

1. **WP7 audit DS** — priorité 1, applique les bonnes pratiques de design sur notre propre DS.
2. **WP8 librairie impeccable maison** — parallèle à WP7, démarre le squelette + architecture sans attendre.
3. **WP6 fix-plan** — corrige les 3 bugs déjà connus en série (Toast/Alert, OverflowMenu, Menu).
4. **WP5 Sparkline + BarChart** — démarrer les charts hand-rolled, premiers shippés dans la semaine.
5. **WP4 ChatMessage + ChatThread** — docs dédiées livrées, stabilisation visuelle si besoin.

WP7 et WP8 sont délibérément parallèles : WP7 audite ce qui existe, WP8 construit le moteur ; les deux convergent quand WP7 livre des règles affinées que WP8 intègre.

## Decisions ouvertes à trancher

1. Validation finale de la cible WP8 de revue (commande + contract JSON).
2. Implémentation immédiate des adapters multi-harness (`.codex` / `.gemini`) ou bascule en V1.
3. Ordonnancement d’implantation des règles WP7-B (P0 puis P1).

## Hygiene de ce doc

Maj attendue apres chaque commit majeur. Owner : main agent. Tracks orphelins ou termines basculent en \"Acheve\" en bas du doc une fois entierement shippe.
