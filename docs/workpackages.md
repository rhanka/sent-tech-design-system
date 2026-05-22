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

**Statut global** : 🔵 décision API prise, prêt à lancer.

**Décidé 2026-05-22** : **DS purement visuel**. ChatMessage expose props role/status + slot content. Le consommateur orchestre le rendu des blocks (markdown, code, tool I/O).

| Item | Statut | Commits | Notes |
|---|---|---|---|
| Roadmap `docs/chat-ui-roadmap.md` | 🟢 | `721474e` | top 5 primitives identifiees |
| API décidée : DS visuel | 🟢 | — | enveloppe seule, slot content |
| ChatMessage | 🔵 | — | P0 |
| ChatThread | 🔵 | — | P0, scroll + auto-scroll + aria-live |
| ChatComposer | 🔵 | — | P0, textarea + slots actions |
| StreamingMessage | 🔵 | — | P1, mirroir StreamMessage Sentropic |
| MessageActions | 🔵 | — | P1, rangee IconButton |

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

## WP7-A — **Audit DS via skills design (priorité 1)**

**Statut global** : 🔵 top priorité, pas encore lancé. **Le plus important.**

Objectif : appliquer les bonnes pratiques de design à NOTRE design system. Audit du docs site + des composants Svelte + des tokens via des skills de design (impeccable upstream, frontend-design Anthropic, ou équivalents) pour identifier ce qui ne respecte pas les standards, puis corriger.

| Item | Statut | Notes |
|---|---|---|
| Roadmap `docs/impeccable-roadmap.md` | 🟢 | `1ef0051`, base pour la démarche |
| Installer skill `pbakaus/impeccable` (et frontend-design Anthropic si complémentaire) | 🔵 | `npx skills add pbakaus/impeccable` |
| Audit `/impeccable audit` sur docs site (toutes les pages) | 🔵 | rapport écrit dans `docs/ds-audit-report.md` |
| Audit `/impeccable critique` sur captures clés | 🔵 | screenshots vs principes design |
| Audit `npx impeccable detect` sur le live docs URL | 🔵 | 27 anti-patterns déterministes |
| Compilation des findings priorité (P0/P1/P2) | 🔵 | match avec les bugs déjà connus dans `docs/known-issues-and-fixes.md` |
| Application des fixes critiques (P0) | 🔵 | commits atomiques au fur et à mesure |
| Capacité \"audit on push\" via workflow GitHub | ⚪ | hook CI post-MVP |

**Dependances** : aucune.
**Parallelisable avec** : tous (audit ne modifie pas les composants tant que les fixes ne sont pas lancés).

## WP7-B — Module DS impeccable-équivalent (priorité secondaire)

**Statut global** : ⚪ planifié, post-WP7-A.

**Décidé 2026-05-22** : **C réimplémentation, mais refactorée** (parité fonctionnelle, périmètre réduit — pas forcément 27 règles).

Objectif : shipper notre propre librairie de règles design (`@sentropic/design-system-impeccable`), indépendante de l'upstream, avec un périmètre ciblé plutôt qu'une copie 1:1 d'impeccable. Refactor du moteur upstream, pas un fork. Capable de pousser des règles Sent Tech spécifiques (rail+arrondi, hiérarchie z-index, token-usage).

| Item | Statut | Notes |
|---|---|---|
| Décision : réimplémentation refactorée | 🟢 | scope réduit, pas de course à la parité numérique |
| Audit du périmètre upstream — quelles règles garder | ⚪ | sélectionner ~10-15 règles essentielles vs 27 |
| Architecture du moteur (Puppeteer vs JSDOM vs autre) | ⚪ | après audit périmètre |
| Packaging `packages/impeccable/` (workspace) | ⚪ | npm package + CLI |
| Règles essentielles (parité fonctionnelle) | ⚪ | ~10-15 règles |
| Règles Sent Tech spécifiques | ⚪ | rail+arrondi, z-index, token-usage |
| Capacité différenciante (mieux qu'impeccable upstream) | ⚪ | post-parité |

**Estimé** : 10-15j pour parité réduite (~10-15 règles bien choisies) + 3-5j de règles Sent Tech.

**Dependances** : sortie de WP7-A (l'audit nous dira quelles règles importent vraiment chez nous).
**Parallelisable avec** : tous une fois WP7-A bien avancé.

## Plan de bataille parallele

A tout instant on peut tenir 3 a 4 agents en parallele sans conflit de fichiers. Priorité actuelle :

1. **WP7-A audit DS** — priorité 1, applique les bonnes pratiques de design sur notre propre DS d'abord.
2. **WP6 fix-plan** — corrige les 3 bugs déjà connus en série (Toast/Alert, OverflowMenu, Menu).
3. **WP5 Sparkline + BarChart** — démarrer les charts hand-rolled, premiers shippés dans la semaine.
4. **WP4 ChatMessage + ChatThread** — démarrer les chat primitives.

WP7-A peut surfacer d'autres findings qui se mélangent avec WP6 — attendre son rapport avant de lancer WP6 pourrait éviter du gachis.

## Decisions ouvertes à trancher

Aucune à ce stade. Les 4 décisions du 2026-05-22 sont consignées dans chaque WP. Prochaine décision attendue : choix des ~10-15 règles essentielles pour WP7-B (post-audit WP7-A).

## Hygiene de ce doc

Maj attendue apres chaque commit majeur. Owner : main agent. Tracks orphelins ou termines basculent en \"Acheve\" en bas du doc une fois entierement shippe.
