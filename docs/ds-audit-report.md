# Audit DS Sent Tech — pratiques design via impeccable

Date : 2026-05-22
Source : skill `pbakaus/impeccable` (commands + CLI `npx impeccable detect`)
Référence : `docs/impeccable-roadmap.md`, `docs/known-issues-and-fixes.md`

> Note : ce rapport correspond à la V1 de consolidation. La source de vérité opérationnelle de WP7 est désormais `docs/ds-audit-consolidated-v2.md`.

## Méthodologie

### Commands utilisées
- `npx impeccable detect <url>` (CLI déterministe, headless Puppeteer) — exécutée avec succès sur les 7 URLs ciblées, en mode texte et JSON.
- `/impeccable audit` (équivalent agent) — appliquée manuellement au matériel listé : `apps/docs/src/routes/+page.svelte`, `apps/docs/src/routes/+layout.svelte`, `apps/docs/src/app.css`, `apps/docs/src/routes/components/icon-button/+page.svelte`. Le routage Skill-tool n'a pas activé le skill (voir « Friction »), donc l'audit a été conduit en chargeant manuellement `reference/audit.md` et les domaines (`typography.md`, `color-and-contrast.md`, `spatial-design.md`, `motion-design.md`, `interaction-design.md`, `responsive-design.md`, `ux-writing.md`).
- `/impeccable critique` (qualitatif) — appliquée en parallèle pour identifier les anti-patterns de catégorie (cards-grid, hero-metric template, identical sections).
- Commands non utilisées : `polish`, `extract`, `live`, `craft`, `shape`, `teach`, `document` (hors périmètre — l'audit ne touche pas au code).

### URLs / fichiers ciblés
- Pages live (`design-system.sent-tech.ca`) : `/`, `/components/button`, `/components/icon-button`, `/components/menu-popover`, `/components/plan-completion`, `/components/overlays`, `/components/file-uploader`.
- Fichiers source : `apps/docs/src/routes/+page.svelte`, `apps/docs/src/routes/+layout.svelte`, `apps/docs/src/app.css`, `apps/docs/src/routes/components/icon-button/+page.svelte`.

### CLI deterministic
7 URLs scannées, 32 occurrences brutes regroupées sous 6 anti-patterns distincts (`line-length`, `cramped-padding`, `overused-font`, `single-font`, `side-tab`, ainsi qu'aucun déclenchement de `gradient-text`, `glassmorphism`, `hero-metric`, `dark-glow`, `bounce-easing`, `skipped-heading`).

## Findings P0 (à corriger maintenant)

| id | finding | location | domain | severity rationale |
|---|---|---|---|---|
| P0-1 | Couleurs hard-codées en hex sur tout le site docs (≥30 occurrences, dont `#ffffff`, `#0f172a`, `#0043ce`, `#16a34a`) au lieu de tokens OKLCH. Bypass total du contrat tokens que la doc elle-même promeut. | `apps/docs/src/app.css` lignes 2, 7, 8, 40, 136, 142–143, 179, 190, 248, 261, 275, 305, 321, 327, 354, 425, 436–437, 442, 449, 480, 516, 526, 554, 591, 639, 650 | color (OKLCH) | Vitrine d'un DS qui ne consomme pas son propre DS — incohérence stratégique, propagation virale (les pages composants héritent du même CSS). |
| P0-2 | `#000`/`#fff` exacts utilisés sur fond coloré (boutons, cartes, header) au lieu de neutres teintés vers le hue de marque (`chroma 0.005–0.01`). | `apps/docs/src/app.css:179,190,425,437,442,480,516,526,554,591,639,650` | color (OKLCH) | Règle explicite impeccable (« never use `#000` or `#fff` »). Sur fond bleu (`#0043ce`), `color: #ffffff` produit un blanc froid non aligné sur la palette tenant. |
| P0-3 | « identical card grids » : 4 grilles `auto-fit minmax(…, 1fr)` consécutives sur le home (métriques, foundations, contracts × 2, composants) — anti-pattern explicite « cartes identiques répétées ». | `apps/docs/src/routes/+page.svelte:43–60, 61–74, 107–120, 131–145` + `app.css:474, 504` | spatial rhythm | Sur la home (vitrine), c'est la première impression. Aucun rythme : 4 blocs de cartes blanches arrondies superposés. Catégorie-reflex « doc SaaS ». |
| P0-4 | Lignes de texte ~96 caractères sur la home et 6 pages composants — au-delà de la limite 65–75ch (CLI : 12 occurrences sur 7 URLs). | Live : `/`, `/components/icon-button`, `/components/menu-popover`, `/components/plan-completion`, `/components/overlays`, `/components/file-uploader`. Source : `apps/docs/src/app.css:405` (`.docs-hero p, .docs-section p { max-width: 48rem }`). | typography | Lecture fatigante : l'œil perd le repère à la ligne suivante. Couvre toutes les pages, donc impact systémique. |
| P0-5 | `single-font` + `overused-font` : Inter à 100 % sur 7/7 pages, aucune hiérarchie typographique entre display et body. | CLI sur les 7 URLs. Source : `apps/docs/src/app.css:4` (`font-family: var(--st-font-sans, Inter, …)`). | typography | Tell AI-slop #1 selon impeccable. Aplatit le H1 (2.75rem Inter) au même grain visuel que les paragraphes. |

## Findings P1 (important, non-bloquant)

| id | finding | location | domain | severity rationale |
|---|---|---|---|---|
| P1-1 | Échelle typographique plate : 0.78 / 0.85 / 0.88 / 0.9 / 0.92 / 0.94 / 0.95 / 0.97 / 0.98 / 1 rem cohabitent (10 paliers dans un ratio 1.28× total). Aucun ratio ≥1.25 entre paliers adjacents. | `apps/docs/src/app.css:88, 95, 119, 165, 217, 255, 269, 338, 382, 402, 461, 468, 490, 498, 564, 571, 585, 613, 658` | typography | Hiérarchie illisible : un sidebar item (0.94rem), une `docs-demo-note` (0.92rem), un `.docs-hero-kicker` (0.88rem) sont indissociables visuellement. |
| P1-2 | `cramped-padding` détecté sur home (0px vertical padding sur `16px` text) et `/components/file-uploader` (2px sur `13px` text). | CLI sur `/` et `/components/file-uploader`. Source probable : `apps/docs/src/routes/+page.svelte` éléments `.docs-hero-meta`, et `apps/docs/src/routes/components/file-uploader/+page.svelte`. | spatial rhythm | Texte collé aux bords du container — rupture du « breathing room » impeccable (≥8px, idéalement 12–16px). |
| P1-3 | Em-dashes en copie produit (`—`), bannis par impeccable UX-writing. | `apps/docs/src/routes/components/plan-completion/+page.svelte:47`, `apps/docs/src/routes/components/menu-popover/+page.svelte:79` | UX writing | Petite touche, mais c'est une règle absolue impeccable (« No em dashes. Use commas, colons, semicolons, periods, or parentheses »). Marqueur AI-aware. |
| P1-4 | Cibles tactiles desktop sous 44×44 px : sidebar (`min-height: 2.05rem` = 33px et `1.95rem` = 31px), locale buttons (`2rem` = 32px), language buttons (`2rem`). Réhaussées à 2.75rem seulement via `@media (pointer: coarse)`. | `apps/docs/src/app.css:256, 270, 167, 644` | interaction / responsive | WCAG 2.5.5 (Target Size — Enhanced) à AAA exige 44px. Sur trackpad/souris c'est tolérable, mais la règle impeccable est universelle. |
| P1-5 | Rail gauche d'indicateur de page active sur la sidebar (`box-shadow: inset 3px 0 0 var(--docs-accent)` sur item radius 0 = OK, mais combiné avec items composants à radius `0.375rem` dans le même panneau). | `apps/docs/src/app.css:254 (radius:0)` vs `app.css:238 (radius:0.375rem)` | spatial rhythm / interaction | Convention mixte dans un même nav. La mémoire utilisateur exige « pas de rail gauche + container arrondi » comme principe DS. La sidebar elle-même n'enfreint pas la règle (radius 0 sur item actif `docs-side-link--docs`), mais le voisinage avec items arrondis crée une inconsistance de langage. |
| P1-6 | Aucun token motion `--st-motion-*` utilisé hormis `transition: transform var(--st-motion-fast, 120ms) var(--st-motion-easing, ease)`. Reste du site sans motion ni transition (focus, hover, active). | `apps/docs/src/app.css:312` (seule occurrence) | motion | Le DS expose des tokens motion mais la vitrine ne montre rien. Vitrine = laboratoire, l'absence de motion communique « DS statique ». |
| P1-7 | Padding scale incohérent : 23 valeurs uniques de padding (0.22rem, 0.32rem, 0.4rem, 0.65rem, 0.75rem, 1rem, 1.15rem, 1.25rem, 1.35rem, 1.4rem, 1.5rem, 2.5rem, 3rem, 6rem…) sans alignement sur une échelle 4/8 ou un token. | `apps/docs/src/app.css` (cf. inventaire `grep -oE "padding:[^;]+;"`) | spatial rhythm | Rythme spatial bruité. Impeccable demande de la variation **délibérée**, pas du bruit. |

## Findings P2 (nice-to-have)

| id | finding | location | domain | severity rationale |
|---|---|---|---|---|
| P2-1 | Pas de mode sombre sur le site docs (alors que les composants supportent dark mode via `ThemeProvider`). | `apps/docs/src/routes/+layout.svelte:64` (un seul thème statique `sentTechTheme`) | color | La vitrine ne démontre pas une capacité réelle du DS. Pas un bug, mais un déficit de démonstration. |
| P2-2 | Hero h1 mêle titre + Badge inline (`.docs-hero h1 { display: flex; }`). Le badge se retrouve à la baseline du h1 (2.75rem) et casse le rythme typographique. | `apps/docs/src/routes/components/icon-button/+page.svelte:11–13` + `apps/docs/src/app.css:388–397` | typography | Mélange registre titre / badge UI. Mieux : badge dans le kicker ou en méta sous le titre. |
| P2-3 | Footer reprend l'URL GitHub en clair (`github.com/rhanka/sent-tech-design-system`) comme libellé — pratique mais redondant avec `href`. | `apps/docs/src/routes/+layout.svelte:182–184` | UX writing | Mineure. La règle « every word earns its place ». |
| P2-4 | Stub status indicator (rond gris/vert dans la sidebar) sans légende visible. L'utilisateur doit deviner. | `apps/docs/src/routes/+layout.svelte:144–148` + `app.css:319–328` | UX writing / interaction | Légende dans un tooltip, un aria-label, ou un mini-onboarding. |
| P2-5 | Aucun `prefers-reduced-motion` query dans `app.css` (alors que `live.md` impeccable exige reduced-motion-aware par défaut). | `apps/docs/src/app.css` (absent) | motion / interaction | Le site n'a quasi pas de motion donc impact faible, mais futur-proof. |

## Cross-référence avec `docs/known-issues-and-fixes.md`

Trois bugs déjà inscrits dans le journal :

1. **« Toast et Alert — barre gauche colorée + container arrondi »** — directement confirmé par le CLI deterministic : `[side-tab] border-left: 4px + border-radius: 8px` détecté **2 fois sur `/components/overlays`** et **1 fois sur `/components/plan-completion`** (Toast rendu en démonstration sur les deux pages). Source : `packages/components-svelte/src/lib/Toast.svelte:34` et `Alert.svelte:45` (`border-left-width: 0.25rem` = 4px sur container avec `border-radius`). **Cette entrée n'est pas dupliquée comme finding ici** ; l'audit la corrobore et étend sa portée (Alert inclus, pas seulement Toast).

2. **« OverflowMenu — z-index trop bas »** — non détecté par la CLI déterministe (les anti-patterns du moteur regex/headless ne testent pas le z-stacking). L'audit agent ne le re-soulève pas non plus, l'entrée connue reste la source canonique.

3. **« Drawer — clic Open drawer ferme le menu »** — non détecté par la CLI déterministe (interaction runtime, hors scope d'un scan statique). Idem, entrée connue reste canonique.

Aucun finding de ce rapport ne duplique les trois bugs ci-dessus.

## Métriques globales

- **Pages auditées** : 7 URLs live + 4 fichiers source.
- **Findings** : **5 P0** + **7 P1** + **5 P2** = **17 findings** (hors duplicats des 3 bugs connus).
- **Domaines les plus touchés** (ranking) :
  1. **color (OKLCH)** — 3 P0 + 1 P2 = règles violées les plus structurelles, touchent toute la vitrine.
  2. **typography** — 2 P0 + 2 P1 + 1 P2 = font monoculture + échelle plate.
  3. **spatial rhythm** — 1 P0 + 3 P1 = grilles identiques + padding bruité + cramped padding.
  4. **interaction / responsive** — 2 P1 + 1 P2 = touch targets desktop, mode démo motion absent.
  5. **UX writing** — 1 P1 + 2 P2 = em-dashes, légendes statut, redondances mineures.
  6. **motion** — 1 P1 + 1 P2 = vitrine sans motion + reduced-motion absent.
- **Anti-pattern-score impeccable (deterministic CLI)** : moyenne 4.6 anti-patterns / page (8 sur la home, 2 sur Button, 5–6 sur les pages overlays / file-uploader).

## Friction d'usage du skill upstream

Honnête, parce que WP7-B en a besoin.

**Ce qui a fonctionné** :
- `npx skills add pbakaus/impeccable` : installation propre, non-interactive auto-détectée (« claude-code agent detected → installing non-interactively »). Skill posé sous `.agents/skills/impeccable/` avec symlink `.claude/skills/impeccable → ../../.agents/skills/impeccable`. **Excellent**.
- `npx impeccable detect <url>` : **fonctionne directement sans configuration**. Puppeteer embarqué, sortie texte et `--json`. 7 URLs scannées en moins de 2 minutes. Vraiment headless. C'est la partie réutilisable la plus solide.
- Le SKILL.md et les 7 références de domaine sont **lisibles, structurés, opinionnés** : on peut les utiliser comme grille de lecture mentale même sans le runtime.

**Ce qui n'a pas fonctionné** :
- **Le skill n'est pas exposé via la Skill tool** dans la session courante. Appel `Skill(skill="impeccable")` → `Unknown skill: impeccable`. Le symlink `.claude/skills/impeccable` existe mais la liste des skills disponibles est figée au démarrage de la session, et `impeccable` n'y figure pas. Conséquence : `/impeccable audit` ne peut pas s'invoquer via la Skill tool ; il a fallu **simuler manuellement** la commande en lisant `reference/audit.md` et en appliquant la checklist. Acceptable mais c'est une perte du « runtime auto-context » que le skill promet.
- **PRODUCT.md et DESIGN.md manquants** au repo root et dans `.agents/context/`. Le SKILL.md exige PRODUCT.md, fallback `/impeccable teach` (interactif). Sans Skill tool active, pas d'opportunité d'exécuter `teach` proprement. Le skill aurait donc bloqué un audit « pur » de toute façon.
- **Loader `load-context.mjs`** : non testé (dépendance au contexte chargé en session, non requis pour la CLI).
- **Mode `live`** : nécessite Playwright + session interactive, non utilisable dans un agent headless one-shot comme celui-ci.
- **Sortie CLI** : les findings sont génériques (file=URL, line=0), pas de selector CSS ni de coordonnée DOM. On sait *qu'il y a* un `side-tab` sur `/components/overlays`, pas *où exactement* dans le markup. Pour le DS Sent Tech qui a peu de surfaces, c'est tolérable ; pour un produit complexe, c'est limitant.
- **Warning npm répété** : `npm warn Unknown builtin config "globalignorefile"` à chaque invocation. Cosmétique, mais salissant pour un usage CI.

**Bilan friction** : install OK, CLI OK, agent commands **partiellement OK** (lisibles, mais routage Skill-tool absent). La CLI déterministe est le sous-ensemble industrialisable. Tout le reste demande une session Claude interactive avec le skill enregistré nativement.

## Recommandations

### Top 3 findings à attaquer en premier

1. **P0-1 + P0-2 — Migrer le CSS du site docs vers les tokens du DS** (`@sentropic/design-system-tokens` / `themes`). Aucune valeur hex ne devrait survivre dans `apps/docs/src/app.css`. C'est la cohérence stratégique la plus visible : on ne peut pas vendre un DS dont la vitrine n'utilise pas ses propres tokens. ROI immédiat — un seul fichier, ~30 remplacements.
2. **P0-4 — Plafonner `.docs-hero p, .docs-section p` à `max-width: 65ch`** (au lieu de 48rem). Une ligne CSS, gain de lisibilité sur 7/7 pages auditées.
3. **P0-3 — Casser la monotonie « 4 grilles de cartes identiques » sur la home**. Au moins une section doit ne pas être des cartes (liste avec dividers, layout asymétrique, ou tableau). C'est le tell catégorie-reflex le plus repérable.

### Recommandation pour WP7-B (librairie maison `@sentropic/impeccable`)

**Périmètre minimal viable (MVP)** : implémenter **8 règles déterministes** (sur les 24 d'impeccable), réparties sur 4 catégories :

| Catégorie | Règle | Source impeccable | Effort |
|---|---|---|---|
| color | `no-bare-hex` : interdire toute valeur hex/rgb hors d'un token `--st-*` | dérivée de « never use #fff/#000 + use OKLCH » | bas (regex CSS) |
| color | `side-tab-on-rounded` : `border-left ≥ 2px` colorée + `border-radius > 0` → fail | `side-tab` impeccable + bug Toast/Alert connu | bas |
| typography | `line-length-cap` : `<p>` sans `max-width` ≤ `75ch` → warn | `line-length` impeccable | moyen (besoin runtime ou parser AST CSS) |
| typography | `single-font` : si un seul `font-family` est exporté pour body+display → warn | `single-font` impeccable | bas |
| spatial | `padding-scale` : padding non aligné sur un token `--st-space-*` → warn | dérivée « spacing rhythm » | moyen |
| interaction | `touch-target-44` : éléments interactifs avec `min-height < 44px` (hors `pointer: coarse`) → warn | « interaction-design.md » | bas |
| ux writing | `no-em-dash` : `—` ou `--` dans une chaîne i18n → fail | « no em dashes » impeccable | bas (grep) |
| motion | `no-bounce-easing` : `cubic-bezier` à overshoot, `ease-out-back/bounce/elastic` → fail | « motion-design.md » | bas |

**Catégories à laisser pour plus tard** (V2) :
- `gradient-text`, `glassmorphism`, `hero-metric`, `nested-cards` (P3 — peu présents chez nous, gain marginal).
- `cramped-padding` runtime (besoin d'un headless browser, conflit avec « zéro Puppeteer en CI Sent Tech »).
- `dark-glow`, `bounce-easing` runtime.

**Architecture proposée** :
- **Sous-ensemble static-only** (regex + AST CSS PostCSS + lookup token JSON) → utilisable en `npm run lint:ds` et en CI Sent Tech sans Puppeteer.
- **Sous-ensemble runtime** (Playwright-based) → optionnel, dans un workflow GHA séparé, comme `npx impeccable detect` le fait, mais branché sur nos tokens et nos URLs preview.
- Pas de tentative de rejouer le côté « agent commands » d'impeccable. Cette dimension reste sous-traitée à `pbakaus/impeccable` (skill upstream installé) pour les sessions Claude des designers ; nous ne le redistribuons pas dans notre lib.

**Effort estimé WP7-B** : 1.5 j pour les 8 règles + 1 j pour l'intégration CI + 0.5 j pour la doc. **3 jours total**, un seul package `packages/lint-ds/`.

**Anti-objectif explicite** : ne pas réécrire `pbakaus/impeccable` en entier. La valeur Sent Tech est ailleurs (alignement avec nos tokens OKLCH, nos primitives Svelte, notre `chat-ui-contract.md`).
