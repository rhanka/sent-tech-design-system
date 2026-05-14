# Sent Tech / Sentropic Design System — Plan vivant

> Source de vérité de l'avancement. À mettre à jour à chaque session : cocher
> ce qui est livré, ajouter une référence PR/commit à droite quand pertinent,
> déplacer les items entre phases au fil de l'évolution réelle.

## Identité produit

- Scope npm courant : `@sentropic/*` (cible v0.3.0, en cours de release).
- Scope npm legacy : `@sent-tech/*` (dernier publish v0.2.0 le 2026-05-13, à déprécier post-publish v0.3.0).
- Stack : Svelte 5, Tailwind v4, build Vite, publish via npm Trusted Publishing.
- Inspiration : IBM Carbon. White-label / multi-tenant via theming runtime CSS variables.
- Repo Git : `sent-tech-design-system` (nom de repo conservé pour l'instant).

## État actuel (synthèse)

- Composants Svelte livrés : 26.
- Consommateurs migrés : 1 (sentech-forge).
- Consommateurs Svelte connus restant à migrer : 4 (sent-tech/ui, sent-tech/external/top-ai-ideas-fullstack/ui, nc-fullstack/ui, spa-transpose-cv/ui).
- Couverture vs Carbon : ~26 / ~40 composants (gaps majeurs : DataTable riche, FileUploader, MultiSelect, DatePicker, NumberInput, Slider, Search…).

---

## Phase 0 — Foundations & socle

- [x] Décision make/buy : *make* custom, inspiration Carbon — implicite, validée par les phases suivantes.
- [x] Tokens 3 niveaux foundation/semantic/component — `packages/tokens`.
- [x] Themes par produit (sent-tech, forge, entropic) — `packages/themes`.
- [x] CSS vars prefix `--st-*`.
- [x] ThemeProvider Svelte.
- [x] Build pipeline + npm publish via Trusted Publishing — release v0.2.0 (DS PRs #2, #3, tag v0.2.0).

## Phase 1 — Composants Svelte primitives

- [x] Alert, Badge, Breadcrumb, Button, Card, Checkbox, Drawer, Dropdown.
- [x] EmptyState, Input, Link, LoadingState, Menu, Modal.
- [x] Pagination, Popover, Radio, Select, SideNav, Switch.
- [x] Table, Tabs, Textarea, Toast, Tooltip.
- [x] ThemeProvider.
- [x] Showcase form primitives (DS PR #1).

## Phase 2 — Premier consommateur (Forge)

- [x] Migration BlogPost, Hero, Navigation, About, Footer, Marketing, Blog cards (commits Forge `1a4345f` et antérieurs).
- [x] Migration NotFound + LanguageSwitcher (Forge PR #8).
- [x] Visual regression CI Playwright (Forge PR #8).
- [x] Consommation `@sent-tech/*@^0.2.0` depuis npm registry (Forge PR #10).
- [x] Découplage CI Forge du checkout DS local : script `theme:verify`, workflows `ci.yml` + `visual-regression.yml`, lockfile (Forge PR #11).

## Phase 3 — Rebrand `@sent-tech` → `@sentropic` (en cours)

Périmètre exact : scope npm + dépendances internes + imports source + docs + workflows publish. Hors périmètre pour cette release : prefix CSS vars `--st-*` (gardé en l'état), nom du repo Git.

- [x] Audit exhaustif des occurrences `@sent-tech` (ripgrep) dans DS.
- [x] PR DS — branche `feat/rebrand-sentropic` :
  - [x] Renommer `name` dans les 4 `package.json` packages (`tokens`, `themes`, `components-svelte`, `apps/docs`) + root.
  - [x] Renommer la dépendance interne `@sent-tech/themes` (et autres) dans les `dependencies`.
  - [x] Renommer les imports source dans `apps/docs/`, tests, exemples.
  - [x] Mettre à jour README, docs/release.md, docs/integration/forge-low-coupling.md.
  - [x] Mettre à jour `.github/workflows/npm-publish.yml` (workspaces ciblés + post-publish-check).
  - [x] Bumper toutes versions à `0.3.0`.
  - [ ] Régénérer `package-lock.json`, `.graphify/` artefacts.
  - [ ] Vérifs : `npm run verify`, build de chaque package, tests showcase.
- [ ] Tag `v0.3.0` + publish npm `@sentropic/{tokens,themes,components-svelte}@0.3.0`.
  - [ ] **Pré-requis manuel npm-side** : enregistrer les 3 nouveaux packages `@sentropic/*` dans Trusted Publishing GitHub Actions sur npmjs.com (le workflow ne peut pas se créer ses propres droits).
- [ ] `npm deprecate @sent-tech/{tokens,themes,components-svelte}` avec message « renamed to @sentropic/* ».
- [ ] PR Forge — branche `feat/consume-sentropic-0.3.0` : swap `@sent-tech/*@^0.2.0` → `@sentropic/*@^0.3.0`. CI verte. Merge.

## Phase 4 — Compléter la couverture Carbon

Composants présents dans Carbon, absents du DS, requis pour les consommateurs riches.

### Priorité haute (chat Entropic + transpose-cv + nc-fullstack form-heavy)

- [ ] DataTable — tri, pagination intégrée, sélection ligne, cellules custom (vs notre `Table` minimal).
- [ ] FileUploader — drag-drop, multi, progress.
- [ ] Combobox — recherche dans la liste.
- [ ] MultiSelect — sélection multiple avec recherche.
- [ ] Search — pattern Carbon dédié.
- [ ] NumberInput — increment/decrement, min/max.
- [ ] DatePicker — single + range, FR/EN.
- [ ] Slider — range + plage, tooltip valeur.
- [ ] Tag — entité fermable (vs `Badge` en lecture seule).
- [ ] PasswordInput — toggle visibility, indicateur force.

### Priorité moyenne

- [ ] Accordion.
- [ ] ContentSwitcher.
- [ ] CopyButton.
- [ ] Form — orchestration : group, fieldset, helper text, validation.
- [ ] InlineLoading.
- [ ] OverflowMenu.
- [ ] PaginationNav (vs `Pagination` simple).
- [ ] ProgressBar.
- [ ] ProgressIndicator (steps).
- [ ] SkeletonText.
- [ ] Toggle (vs `Switch` — Carbon distingue).
- [ ] Toggletip — clic vs hover.
- [ ] UI Shell Header — DS a `SideNav`, manque le Header complet.

### Priorité basse / utilité à challenger

- [ ] AspectRatio.
- [ ] CodeSnippet.
- [ ] StructuredList.
- [ ] TileGroup.
- [ ] UnorderedList.

## Phase 5 — Migration des consommateurs Svelte restants

Pré-requis : Phase 3 livrée. Phase 4 partielle suffit selon les besoins de chaque app.

- [ ] `sent-tech/ui` (site Sent Tech principal — distinct de Forge). Stack : Svelte 5 + SvelteKit + Vite 5.
- [ ] `sent-tech/external/top-ai-ideas-fullstack/ui` (chat conversationnel, ex « top-ai-ideas »). Stack : Svelte 5 + SvelteKit + Vite 6. Form-heavy + chat → priorité Phase 4 haute.
- [ ] `nc-fullstack/ui` (NC Svelte gen-AI). Stack : Svelte 5 + SvelteKit + Vite 6.
- [ ] `spa-transpose-cv/ui` (Scalian transpose CV). Stack : Svelte 5 + SvelteKit + Vite 6.

## Phase 6 — Ménage

- [x] `sentech-forge.tar.gz` (snapshot orphelin du 2026-04-26) supprimé.
- [ ] Décider sort de `/home/antoinefa/src/top-ai-ideas` (vite_react_shadcn_ts, version React+Radix legacy — la nouvelle vit dans `sent-tech/external/top-ai-ideas-fullstack`).
- [ ] Décider sort de `/home/antoinefa/src/scalian-transpose-cv` (pas un repo git, pas de `package.json` — orphelin).
- [ ] `sentech-forge/PLAN.md` — plan SEO P0 daté 2026-02-23, quasi terminé sur le code mais cases pas cochées : valider/cocher les 6 items résiduels ou supprimer si obsolète.

---

## Décisions ouvertes

- **CSS vars** : prefix `--st-*` reste pour 0.3.0. À reconsidérer en v1.0.0 (renommage = breaking pour tous les consommateurs et tous les overrides).
- **DS React** : pas de besoin identifié, tous les consommateurs sont Svelte. Le repo legacy `top-ai-ideas` (React+Radix) sera retiré en Phase 6, pas migré.
- **Repo Git** : `sent-tech-design-system` conservé. Renommer le repo casserait les redirects GitHub vers les vieilles PRs/issues + remote URLs des dev locaux.

## Méta

- Format : cases à cocher, mises à jour à chaque session.
- Conventions commit : Conventional Commits, atomiques, pas de `--no-verify`.
- Anti co-author : 0 trace de Claude/Anthropic dans les commits — vérifier `git log --format='%H %s%n%b' main..HEAD | grep -iE 'co-auth|claude|anthropic'` doit retourner vide.
- Vérifs Forge avant commit : `npm run lint && npm run theme:verify && npm run build`.
- Vérifs DS avant commit : `npm run verify` (lint + tests + build de tous les packages).
