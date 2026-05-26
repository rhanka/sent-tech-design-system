# Roadmap module Impeccable — design system Sent Tech

Périmètre : adopter le skill `pbakaus/impeccable` pour le DS et concevoir un module DS équivalent (ou supérieur) pour shipper cette capacité aux consommateurs.

## Ce que fait `pbakaus/impeccable`

`pbakaus/impeccable` est un **skill « design language » multi-harness** (Claude Code, Cursor, OpenCode, Codex, Gemini CLI, Copilot, Pi, Trae, Rovo, Qoder, Kiro) construit par Paul Bakaus au-dessus du skill officiel `anthropics/skills/frontend-design`. Son ambition explicite : sortir les IA des « tells » SaaS génériques (Inter partout, dégradé violet-bleu, cartes dans des cartes, gris sur fond coloré, tuile arrondie d'icône au-dessus de chaque titre).

Capacités emballées :

- **7 références de domaine** chargées à chaque commande — `typography.md`, `color-and-contrast.md` (OKLCH, neutres teintés, dark mode, a11y), `spatial-design.md`, `motion-design.md` (easing, stagger, reduced motion), `interaction-design.md` (focus, formulaires, loading), `responsive-design.md` (mobile-first, fluide, container queries), `ux-writing.md` (labels, errors, empty states).
- **23 sous-commandes** sous `/impeccable`: `craft`, `teach` (one-time setup qui écrit `PRODUCT.md` + `DESIGN.md`), `document` (génère `DESIGN.md` depuis du code existant), `extract` (extrait composants/tokens vers le DS), `shape`, `critique`, `audit`, `polish`, `bolder`, `quieter`, `distill`, `harden`, `onboard`, `animate`, `colorize`, `typeset`, `layout`, `delight`, `overdrive`, `clarify`, `adapt`, `optimize`, `live` (variantes visuelles dans le navigateur). `pin <cmd>` crée un raccourci court (`/audit`).
- **27 anti-patterns déterministes** + **12 règles de critique LLM**, branchés à un guidage textuel ciblé.
- Une **CLI standalone `npx impeccable detect`** capable de scanner un dossier, un fichier HTML ou une URL (via Puppeteer), avec sortie `--json` et mode `--fast` regex-only. Détecte 24 issues (« side-tab borders », purple gradients, bounce easing, dark glows, lignes trop longues, padding cramped, cibles tactiles trop petites, niveaux de heading sautés, etc.) — **fonctionne sans clé API ni harness IA**.
- Structure du skill côté repo : `skill/SKILL.md` (frontmatter `name`, `description`, `argument-hint`, `user-invocable`, `allowed-tools: Bash(npx impeccable *)`), dossiers `skill/reference/`, `skill/agents/`, `skill/scripts/` (loaders Node ESM type `load-context.mjs`, `live.mjs`). Builds harness-spécifiques sous `dist/<harness>/.{claude,cursor,opencode,...}/`.
- Setup attendu côté projet : deux fichiers à la racine ou dans `.agents/context/` / `docs/` — `PRODUCT.md` (users, brand, tone, anti-references, principes stratégiques) et `DESIGN.md` (couleurs, typo, élévations, composants). Une variable d'env `IMPECCABLE_CONTEXT_DIR` override le chemin.

Licence Apache 2.0, dérivé attribué de `anthropics/skills/frontend-design` (cf. `NOTICE.md`).

## Plan d'application au DS Sent Tech (adoption tel quel)

**Surfaces qui en bénéficient le plus** :

1. `apps/docs/` — la vitrine SvelteKit. C'est là que `audit`, `critique`, `polish` ont le plus de valeur immédiate (hero, plan-completion demos, blog/changelog si présent, theme switcher).
2. `packages/components-svelte/src/` — primitives. Cibles naturelles de `extract`, `harden`, `clarify`, `animate`.
3. `packages/themes` + `packages/tokens` — `colorize`, `typeset` peuvent contester ou raffermir les choix OKLCH / typo.
4. Les éléments visuels signalés en mémoire utilisateur (anti-pattern « rail gauche + container arrondi », hero shelf déjà retiré) gagnent un garde-fou automatique via la CLI déterministe.

**Artefacts consommés par le skill** :

- `PRODUCT.md` et `DESIGN.md` à la racine — Sent Tech a déjà `PLAN.md`, `README.md`, `docs/chat-ui-contract.md` qui peuvent alimenter une première version générée par `/impeccable teach` ou `/impeccable document`.
- Pour `audit` sur URL : un dev server (`npm run docs:dev`) ou un build statique (`npm run docs:build`, `apps/docs/build/`). La CLI `npx impeccable detect <url>` est headless via Puppeteer — **utilisable en CI** sur le build statique servi en preview.
- Pour `live` : session interactive avec Playwright/navigateur (déjà disponible via MCP `playwright` dans ce workspace).

**Mode d'invocation** :

- Les commandes longues (`craft`, `shape`, `critique`, `audit`, `polish`) supposent une **session Claude interactive** — pas headless.
- La CLI `npx impeccable detect` est **purement headless, sans IA**, et peut tourner en CI ou en pre-commit. C'est le sous-ensemble réutilisable côté pipeline.

**Coût d'intégration (adoption brute)** :

1. `cp -r dist/claude-code/.claude/* ~/.claude/` (global) ou `cp -r dist/claude-code/.claude .claude/` dans le repo (project-scoped). Choisir le scope projet pour committer la version dans le repo et garantir la repro.
2. Écrire `PRODUCT.md` (vision Sent Tech, ton, anti-references — l'anti-pattern « rail gauche + arrondi » y a sa place explicite) et `DESIGN.md` (tokens OKLCH, échelle typo, easings, breakpoints).
3. Ajouter `npx impeccable detect apps/docs/build --json` à un script npm (`lint:impeccable`) et au workflow GitHub Actions existant.
4. (Optionnel) `/impeccable pin audit polish critique` pour des raccourcis fréquents.

Effort réel estimé : **1 demi-journée** pour l'installation + premier `PRODUCT.md`/`DESIGN.md`, **1 jour** supplémentaire pour les itérations sur le DS Sent Tech avec `/impeccable audit docs` et `/impeccable extract` sur les primitives.

## Conception du module DS équivalent

Objectif : transformer la capacité « audit + langage de design partagé » en livrable Sent Tech, distribuable aux consommateurs du DS (équipes internes, intégrateurs externes), avec valeur ajoutée propre (tokens OKLCH Sent Tech, primitives Svelte 5, contrats `chat-ui-contract.md`).

### Stratégies de modularisation évaluées

#### Option A. Package npm `@sentropic/design-system-skills`

**Forme** : nouveau workspace `packages/skills/` aligné sur `packages/tokens`, `packages/themes`, `packages/components-svelte`. Expose une CLI (`bin: { "sentech-impeccable": "./dist/cli.js" }`) + une lib programmatique (`import { audit, critique } from '@sentropic/design-system-skills'`).

**Contenu** :

- Règles déterministes Sent Tech (anti-pattern « rail gauche + container arrondi », « hero shelf », mauvaise utilisation des tokens `--color-*`, classes Tailwind hors palette, easings hors `motion.json`).
- Adapter qui mappe les composants `@sentropic/design-system-svelte` à des règles spécifiques (ex. `<Button variant="ghost">` interdit dans une `<Toolbar>` dense).
- Hooks pour lire `tokens/dist` et valider qu'un projet consommateur utilise bien les tokens publiés.

**Pros** : distribution npm standard ; versionné avec le reste du DS ; consommable par n'importe quel projet sans Claude ; intégration CI triviale ; aligné sur la convention `@sentropic/*` existante.

**Cons** : ne porte pas par lui-même la dimension « langage de design IA-aware » du skill original ; nécessite un effort d'écriture de règles (sinon c'est juste un linter).

**Consommateurs** : équipes internes Sent Tech, intégrateurs externes, CI du DS lui-même.

#### Option B. Skill Claude versionné dans le repo

**Forme** : `tools/skills/sent-tech-skills/SKILL.md` + `tools/skills/sent-tech-skills/reference/*.md` + `tools/skills/sent-tech-skills/scripts/*.mjs`. README explique `cp -r tools/skills/sent-tech-skills ~/.claude/skills/` ou symlink.

**Contenu** :

- `SKILL.md` avec frontmatter `name: sent-tech-impeccable`, `description`, `allowed-tools: Bash(npm run lint:impeccable *)`.
- `reference/tokens.md` (OKLCH Sent Tech, conventions de naming), `reference/primitives.md` (catalogue Svelte 5 et anti-patterns Sent Tech-spécifiques), `reference/chat-ui.md` (résumé de `docs/chat-ui-contract.md`).
- Scripts qui chargent `PLAN.md`, `docs/known-issues-and-fixes.md`, `docs/chat-ui-contract.md` comme contexte par défaut.

**Pros** : zéro friction pour qui travaille avec Claude Code ; versionné dans le repo, donc reproductible ; permet de cristalliser les conventions Sent Tech (anti-pattern rail gauche, etc.) en langage exploitable par un agent.

**Cons** : ne marche **que** pour les utilisateurs Claude Code (ou portage manuel vers d'autres harness) ; pas d'usage CI ; pas de capacité déterministe hors IA ; donc pas un livrable DS au sens strict.

**Consommateurs** : devs Sent Tech utilisant Claude Code, contributeurs externes prêts à installer Claude Code.

#### Option C. CLI binaire dédiée

**Forme** : `packages/cli/` avec `bin: { "sentech": "./dist/cli.js" }`. Sous-commande `sentech impeccable audit|critique|polish ...`. Possiblement la même implémentation interne que l'Option A, juste exposée comme un binaire global plutôt qu'un sous-paquet.

**Pros** : UX en ligne de commande très propre ; place pour d'autres sous-commandes DS futures (`sentech tokens diff`, `sentech themes preview`).

**Cons** : duplique l'option A si on ne packages-pas autre chose en parallèle ; la valeur dépend d'avoir d'autres outils CLI à grouper.

**Consommateurs** : devs en local + CI.

#### Option D. Plugin Vite/SvelteKit

**Forme** : `packages/vite-plugin-impeccable/`. S'attache au build `apps/docs` et à tout consommateur SvelteKit du DS. Émet des warnings/errors au moment du build sur les anti-patterns détectés dans le HTML rendu et les CSS générés.

**Pros** : feedback immédiat pendant le `vite dev` (HMR-friendly) ; cible naturellement les consommateurs SvelteKit du DS.

**Cons** : couplé Vite/SvelteKit, donc inutile aux consommateurs React/Vue/HTML pur ; rejoue beaucoup de la valeur d'`impeccable detect` standalone ; surface d'API plus difficile à stabiliser ; ne porte pas la dimension « langage de design IA ».

**Consommateurs** : projets SvelteKit utilisant déjà le DS.

### Recommandation

**Combiner A (cœur) + B (langage IA), dans cet ordre.** A délivre le livrable DS au sens propre : un package npm `@sentropic/design-system-skills` qui encode les règles Sent Tech et tourne sans IA, en local et en CI, consommable par n'importe quel projet (Svelte, vanilla, etc.). B vient en complément naturel, parce que les références (`tokens.md`, `primitives.md`, `chat-ui.md`) sont une cristallisation des conventions Sent Tech qui sert aussi bien le linter déterministe que les agents qui travaillent sur le DS. C est reporté tant qu'il n'y a pas d'autres sous-commandes à grouper sous un `sentech` global ; D est reporté car il restreint l'audience au sous-ensemble SvelteKit.

## Plan d'implémentation (phasé)

### Phase 0 — adoption

**Scope** :

- Installer `pbakaus/impeccable` en mode project-scoped sous `.claude/skills/impeccable/` (versionné dans le repo).
- Générer un premier `PRODUCT.md` et `DESIGN.md` à la racine via `/impeccable teach` ou `/impeccable document`, en récupérant le contenu existant de `PLAN.md`, `README.md`, `docs/chat-ui-contract.md`, `docs/known-issues-and-fixes.md`.
- Ajouter `npx impeccable detect apps/docs/build --json` à un nouveau script `npm run lint:impeccable`, branché dans le workflow GitHub Actions à titre informatif (non bloquant au début).
- Lancer un premier passage `/impeccable audit docs` et consigner les findings dans `docs/known-issues-and-fixes.md`.

**Dépendances** : aucune (juste accès à `npx`, Node, et Claude Code).

**Output** : `PRODUCT.md`, `DESIGN.md`, `.claude/skills/impeccable/`, script `lint:impeccable`, premier rapport d'audit.

### Phase 1 — squelette du module DS

**Scope** :

- Créer `packages/skills/` (workspace npm), aligné sur `packages/tokens` (TypeScript, `tsc -p tsconfig.json`, publishConfig public, scope `@sentropic`).
- Exposer `bin: { "sentech-impeccable": "./dist/cli.js" }` + une API programmatique `audit(target, options)`.
- Réutiliser **en interne** la CLI `impeccable` upstream comme dépendance (`dependencies: { impeccable: "^x.y.z" }`) pour les règles génériques, et ajouter une couche de configuration Sent Tech (preset `sentech-defaults`).
- Tests Vitest, build `svelte-package`-compatible, smoke pack via `scripts/smoke-pack.mjs`.

**Dépendances** : Phase 0 (pour avoir une base de règles validée à porter).

**Output** : `packages/skills/` publiable, version `0.7.0` (alignée), une release npm 0.8.0 du DS.

### Phase 2 — capacités équivalentes

**Scope** :

- Ajouter les règles déterministes spécifiques Sent Tech : anti-pattern « rail gauche + container arrondi » (déjà signalé en mémoire utilisateur), « hero shelf », utilisation de couleurs hors `@sentropic/design-system-tokens`, easings hors `motion`, classes hors design system, niveaux de heading sautés, line-height insuffisant.
- Adapter qui lit `@sentropic/design-system-tokens/dist` et `@sentropic/design-system-themes/dist` et valide la cohérence dans le projet scanné.
- Versionner les références (`reference/tokens.md`, `reference/primitives.md`, `reference/chat-ui.md`, `reference/anti-patterns-sent-tech.md`) sous `packages/skills/skill/` ET publier le même contenu sous `.claude/skills/sent-tech-impeccable/` (Option B greffée à A).
- Documenter dans `apps/docs` une page « Impeccable Sent Tech » qui présente les règles avec exemples avant/après.

**Dépendances** : Phase 1.

**Output** : `@sentropic/design-system-skills` 0.9.0 avec règles propres Sent Tech, skill Claude associé, page de docs.

### Phase 3 — capacités supérieures (différenciation)

**Scope** :

- **Audit token-aware** : pour chaque violation, suggérer le token Sent Tech le plus proche (mapping couleur OKLCH, mapping spacing).
- **Diff de conformité** entre deux versions du DS : `sentech-impeccable diff @0.8 @0.9` génère un rapport des nouvelles violations introduites par une montée de version dans un projet consommateur.
- **Chat-UI guard** : règles dérivées de `docs/chat-ui-contract.md` qui valident la conformité d'une intégration chat (slots requis, états `loading`/`error`/`empty` couverts, focus order).
- **MCP server optionnel** : exposer l'API d'audit via un serveur MCP stdio (`sentech-impeccable --mcp`), de sorte que n'importe quel agent (pas seulement Claude) puisse interroger le linter en temps réel pendant une session.
- **Visual regression hook** : intégration optionnelle avec Playwright (déjà disponible via MCP dans ce workspace) pour capturer des screenshots avant/après une commande `polish` et les commiter dans `docs/`.

**Dépendances** : Phase 2.

**Output** : `@sentropic/design-system-skills` 1.0.0, capacités MCP + diff + chat-UI guard documentées, premier projet consommateur tiers en bêta.

## Décisions ouvertes

- **A vs A+B vs A+B+C** : valider si on veut shipper aussi un skill Claude versionné dès la Phase 2 (recommandation ci-dessus) ou rester strictement sur le package npm.
- **Scope d'installation `pbakaus/impeccable` en Phase 0** : project-scoped (commit dans `.claude/skills/`) ou user-global (`~/.claude/skills/`) ? La règle utilisateur « pas de modification sous `.claude/` sans accord » suggère de demander avant de committer.
- **Dépendance upstream** : le package DS dépend-il de `impeccable` npm (réutilisation, mais couplage à un projet tiers) ou ré-implémente-t-il son cœur en interne (autonomie, mais coût de maintenance) ? Licence Apache 2.0 permet les deux.
- **Format des fichiers de contexte** : adopter le nommage `PRODUCT.md`/`DESIGN.md` à la racine (convention upstream) ou les ranger sous `docs/impeccable/` pour ne pas polluer la racine déjà chargée (`PLAN.md`, `README.md`, `handover.md`).
- **Périmètre du linter CI** : informatif (warn only) ou bloquant ? Recommandé warn-only en Phase 0/1, bloquant à partir de la Phase 2 sur les règles « critiques » (rail gauche + arrondi, hero shelf, tokens hors DS).
- **Anti-patterns prioritaires** : valider la liste initiale des règles Sent Tech-spécifiques (cf. Phase 2) avec le designer/utilisateur avant codage.
- **Publication npm** : publier `@sentropic/design-system-skills` sur le même cadencement que les autres packages (`tokens`, `themes`, `components-svelte`) ou en cycle indépendant ?
- **Versioning** : aligner sur la version du DS (`0.7.0`, `0.8.0`...) ou versioning sémantique propre ?
