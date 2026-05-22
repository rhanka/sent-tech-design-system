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

**Statut global** : 🟡 contrat ecrit + applique sur docs ; restent Sentropic et NC.

| Item | Statut | Commits | Notes |
|---|---|---|---|
| Contrat `docs/header-alignment-contract.md` | 🟢 | `44c4871` | 4 decisions validees (logo SENT + langue partout + connexion conditionnelle + burger droite + nav contextuelle) |
| Application sur docs site | 🟢 | inclus WP2 | |
| Application sur Sentropic (`../sentropic`) | ⏸️ | — | besoin accord utilisateur pour toucher `../sentropic` |
| Application sur NC (`../nc-fullstack`) | ⏸️ | — | + slot connexion conditionnelle |
| Mise a jour `docs/sentropic-alignment-inventory.md` | ⚪ | — | mesurer ecart restant apres application |

**Dependances** : accord utilisateur pour toucher les autres surfaces.
**Parallelisable avec** : tous.

## WP4 — Chat-UI primitives

**Statut global** : ⏸️ roadmap pretee, decision API requise.

| Item | Statut | Commits | Notes |
|---|---|---|---|
| Roadmap `docs/chat-ui-roadmap.md` | 🟢 | `721474e` | top 5 primitives identifiees |
| **Decision API : DS visuel OU `blocks: ChatMessageBlock[]`** | ⏸️ | — | recommandation roadmap : option visuelle |
| ChatMessage | ⚪ | — | P0 |
| ChatThread | ⚪ | — | P0 |
| ChatComposer | ⚪ | — | P0 |
| StreamingMessage | ⚪ | — | P1, mirroir StreamMessage Sentropic |
| MessageActions | ⚪ | — | P1, rangee IconButton |
| ToolCallBlock / ToolResultBlock | ⚪ | — | P2 |
| Citation / Source pill | ⚪ | — | P2 |

**Dependances** : decision API.
**Parallelisable avec** : WP3, WP5, WP6, WP7 des debloque.

## WP5 — Graphics / Charts primitives

**Statut global** : ⏸️ roadmap pretee, decision strategie requise.

| Item | Statut | Commits | Notes |
|---|---|---|---|
| Roadmap `docs/graphics-roadmap.md` | 🟢 | `76703c3` | strategie B (layercake) recommandee |
| **Decision foundation : A Carbon Charts / B layercake / C hand-rolled** | ⏸️ | — | reco roadmap : B + Sparkline hand-rolled |
| Sparkline | ⚪ | — | P0, hand-rolled |
| BarChart | ⚪ | — | P0, layercake |
| LineChart | ⚪ | — | P0, layercake |
| AreaChart | ⚪ | — | P1, layercake |
| StackedBar | ⚪ | — | P1, layercake |
| DonutChart | ⚪ | — | P1, layercake |
| ScatterPlot | ⚪ | — | P2, a confirmer avec `InitiativeScatterPlot` Sentropic |

**Dependances** : decision foundation.
**Parallelisable avec** : tous des debloque.

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

## WP7 — Module Impeccable (nouveau track)

**Statut global** : 🟡 etude en cours par agent dedie.

| Item | Statut | Notes |
|---|---|---|
| Etude `pbakaus/impeccable` + strategie de modularisation | 🟡 | agent en cours, produit `docs/impeccable-roadmap.md` |
| Application au DS (skill installe + utilise) | ⚪ | apres etude |
| Module DS equivalent (package npm / skill / CLI / plugin Vite) | ⚪ | strategie a choisir |
| Capacite differenciante (mieux que `impeccable` original) | ⚪ | apres parite |

**Dependances** : sortie de l'etude.
**Parallelisable avec** : tous.

## Plan de bataille parallele

A tout instant on peut tenir 3 a 4 agents en parallele sans conflit de fichiers :

1. **WP6 fix-plan** — enchainer les 3 fixes en commits atomiques sequentiels.
2. **WP3 Sentropic / NC headers** — debloque des accord utilisateur sur `../sentropic` et `../nc-fullstack`.
3. **WP4 chat-UI** OU **WP5 graphics** — debloquer la decision puis lancer.
4. **WP7 impeccable** — agent en cours.

## Decisions ouvertes a trancher

1. **WP4** : DS purement visuel (slot `content` + props role/status) ou API typee `blocks: ChatMessageBlock[]` ?
2. **WP5** : foundation B layercake (reco) ou foundation A `@carbon/charts-svelte` (treemap/alluvial gratuits mais bundle lourd) ?
3. **WP3** : OK pour qu'un agent touche directement `../sentropic` et `../nc-fullstack` ou on attend que les equipes mergent themselves ?
4. **WP6** : enchainement immediat des 3 fixes ou pause pour valider l'approche bug par bug ?

## Hygiene de ce doc

Maj attendue apres chaque commit majeur. Owner : main agent. Tracks orphelins ou termines basculent en "Acheve" en bas du doc une fois entierement shippe.
