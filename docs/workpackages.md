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
| B — Controles droits | Aligner langue, compte, GitHub et version sur une meme grille visuelle. | 🟢 | 100% | Token `--docs-header-control-height`, version neutre, boutons langue/compte sur socle commun, hover/expanded identiques pour les menus. |
| C — Garde contractuelle | Empêcher une regression vers l'ancien logo ou l'ancien lien header. | 🟢 | 100% | Test `header-contract` verifie logo carre, libelle service, GitHub iconise, absence de `SENT-logo.svg` et absence de `sent-tech.ca` dans la nav utilitaire. |
| D — Publication | Forcer un deploiement Pages reel, pas seulement une modification de doc. | 🟢 | 100% | Commit `8ace58a` publie; workflow `Docs` `26366918988` vert; URL publique cache-bustee verifiee. |
| E — Suivi | Retablir le mode multi-track `Fait / A faire / Attendus`. | 🟢 | 100% | Ce bloc remplace le suivi implicite et retire les statuts `commit courant` non actionnables. |

### A faire

| Track | Finalite | Avancement | Prochaine action | Owner |
|---|---|---:|---|---|
| F — Footer | Reprendre le footer moche sans bloquer la correction header. | 10% | Ouvrir un item dedie apres publication header; `sent-tech.ca` peut y revenir si utile. | Backlog |
| G — A11y menus | Durcir clavier/focus au-dela du correctif rapide. | 65% | Tester focus trap/roving focus si les popovers deviennent des menus DS reutilisables. | Backlog DS |

### Attendus

| Track | Critere attendu | Verification |
|---|---|---|
| Header public | Le header public affiche le logo carre + `Sentropic` / `Design System`, jamais le wordmark complet. | Capture navigateur desktop/mobile + recherche reseau sans `/SENT-logo.svg`. |
| Zone droite | Version, GitHub, langue et compte partagent hauteur, alignement, couleur de base et densite. | Capture desktop + hover/focus sur langue et compte. |
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

**Dependances** : WP6 pour la re-passe overlays.
**Parallelisable avec** : tous, sauf overlay tant que WP6 pas fait.

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

## WP8 — Moteur `design audit` + knowledge base + skill multi-harness

**Statut global** : 🟡 50% — V1 scaffold actif, contrat `design audit <target>` verrouillé localement.

**Décidé 2026-05-24** : une seule WP8 active. Périmètre V1 strict = `design audit <target>` qui retourne un `AuditReport` JSON, codes `0/1/2`, sans Playwright et sans suite complète `design init/build/align/polish` dans le scope actif. Les docs CLI larges restent exploration future.

| Phase | Item | Statut | Notes |
|---|---|---|---|
| P0 Contrat V1 | `design audit <target>`, aliases, codes retour, README/tests | 🟢 100% | binaire `design`, subcommand `audit`, wrapper skill aligné, tests package verts |
| P1 Moteur statique | `packages/impeccable` API `audit`, CLI, JSON, jsdom | 🟢 100% | moteur compile et expose `AuditReport` |
| P2 Ruleset initial | 10-15 règles depuis WP7 | 🟡 55% | 7 règles actives; prochaines: `cramped-padding`, `motion-subtle`, `padding-scale-token` |
| P3 Knowledge base | `docs/principles/*` reliés aux règles | 🟡 60% | principes présents, liens règle/finding à écrire |
| P4 Skill multi-harness | wrapper unique Claude/Codex/Gemini, zéro logique métier | 🟡 55% | skill local + script unique sur `design audit`; adapters Codex/Gemini à compléter |
| P5 Distribution/CI | lint CI, publication, règles token-aware | ⚪ 10% | post-V1 |

### Suivi WP8

| Vue | Track | Finalite | Etat | Avancement | Detail |
|---|---|---|---:|---:|---|
| Fait | Scaffold moteur | Disposer d'un moteur local deterministe | 🟢 | 100% | `packages/impeccable`, API `audit`, CLI, 7 règles, build TypeScript. |
| Fait | Knowledge base | Capturer les principes DS | 🟢 | 100% | `docs/principles/*` initialisés. |
| Fait | Skill V1 | Exécuter le moteur depuis un harness agent | 🟡 | 85% | `tools/skills/sent-tech-impeccable/scripts/audit.mjs` appelle le contrat canonique. |
| A faire | Ruleset | Passer de 7 à 10-15 règles initiales | 🟡 | 55% | Piloté par `docs/ds-audit-consolidated-v2.md`. |
| A faire | Traçabilité | Lier règle, principe et finding WP7 | 🟡 | 35% | Matrice à ajouter avant CI. |
| Attendu | Contrat V1 | Même résultat quel que soit le harness | 🟢 | 100% | `stdout` JSON, `stderr` résumé, exit `0/1/2`, aucune logique métier wrapper. |

**Dépendances** : P0/P1 autonomes. P2+ consomme WP7 et doit citer `docs/ds-audit-consolidated-v2.md`.
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
