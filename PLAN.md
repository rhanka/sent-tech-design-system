# Sent Tech / Sentropic Design System — Plan vivant

> Source de vérité de l'avancement. À mettre à jour à chaque session : cocher
> ce qui est livré, ajouter une référence PR/commit à droite quand pertinent,
> déplacer les items entre phases au fil de l'évolution réelle.

## Identité produit

- Scope npm courant : `@sentropic/*` (cible v0.3.0, en cours de release).
- Convention nommage : `@sentropic/design-system-{tokens,themes,svelte}` (préfixe `design-system-` pour réserver l'espace `@sentropic` à d'autres familles de packages futurs).
- Évolution prévue : `@sentropic/design-system-svelte` reste le bundle complet ; ouverture future possible vers `@sentropic/design-system-svelte-core` + `@sentropic/design-system-svelte-{component}` (opt-in granulaire par composant).
- Scope npm legacy : `@sent-tech/*` (dernier publish v0.2.0 le 2026-05-13, à déprécier post-publish v0.3.0).
- Stack : Svelte 5, Tailwind v4, build Vite, publish via npm Trusted Publishing.
- Inspiration : IBM Carbon. White-label / multi-tenant via theming runtime CSS variables.
- Repo Git : `sent-tech-design-system` (nom de repo conservé pour l'instant).

## État actuel (synthèse)

- Composants Svelte livrés : 34.
- Consommateurs migrés : 2 (sentech-forge, spa-transpose-cv).
- Consommateurs Svelte connus restant à migrer : 3 (sent-tech/ui, sent-tech/external/top-ai-ideas-fullstack/ui, nc-fullstack/ui).
- Couverture vs Carbon : ~34 / ~40 composants (gaps majeurs restants : DataTable riche, FileUploader, DatePicker).

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

## Phase 3 — Rebrand `@sent-tech` → `@sentropic`

Périmètre : scope npm + dépendances internes + imports source + docs + workflows publish. Volontairement hors périmètre : préfixe CSS vars `--st-*` (gardé en l'état), nom du repo Git.

- [x] Audit exhaustif des occurrences `@sent-tech` (ripgrep) dans DS.
- [x] PR DS `#4` (rebrand `@sentropic/{tokens,themes,components-svelte,docs}`) puis PR DS `#7` (renommage à la convention `@sentropic/design-system-*`). Tous les `package.json`, deps internes, imports source, workflows, docs prescriptives, lockfile.
- [x] Bump versions à `0.3.0`.
- [x] Publish npm `@sentropic/design-system-{tokens,themes,svelte}@0.3.0` (publish manuel via token bootstrap, première fois nécessaire car npm Trusted Publishing ne supporte pas le pre-publish).
- [x] Trusted Publishers GitHub Actions configurés sur les 3 packages (repo `rhanka/sent-tech-design-system`, workflow `npm-publish.yml`). Les prochains tags `v*` publieront automatiquement via OIDC sans token.
- [x] PR Forge `#14` mergée : Forge consomme `@sentropic/design-system-*@^0.3.0` depuis npm.
- [x] `npm deprecate @sent-tech/{tokens,themes,components-svelte}` avec message « Renamed to @sentropic/design-system-* ». Vérifié via `npm view @sent-tech/<name> deprecated`. Le warning s'affiche sur la page npm de chaque package + à chaque `npm install`.
- [x] Tokens éphémères révoqués (`sentropic-bootstrap-publish-v0.3.0` et `sent-tech-deprecate-bootstrap`). `~/.npmrc` restauré à son état pré-session.

## Phase 4 — Compléter la couverture Carbon

Composants présents dans Carbon, absents du DS, requis pour les consommateurs riches.

### Priorité haute (chat Entropic + transpose-cv + nc-fullstack form-heavy)

- [ ] DataTable — tri, pagination intégrée, sélection ligne, cellules custom (vs notre `Table` minimal).
- [ ] FileUploader — drag-drop, multi, progress.
- [x] Combobox — recherche dans la liste (DS PR Phase 4 batch 2).
- [x] MultiSelect — sélection multiple avec recherche (DS PR Phase 4 batch 2).
- [ ] Search — pattern Carbon dédié.
- [ ] NumberInput — increment/decrement, min/max.
- [ ] DatePicker — single + range, FR/EN.
- [x] Slider — range + plage, tooltip valeur (DS PR Phase 4 batch 2).
- [ ] Tag — entité fermable (vs `Badge` en lecture seule).
- [ ] PasswordInput — toggle visibility, indicateur force.

### Priorité moyenne

- [x] Accordion (DS PR Phase 4 batch 2).
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
- [x] `spa-transpose-cv/ui` (Scalian transpose CV). Stack : Svelte 5 + SvelteKit + Vite 6. PR #16 mergée : bridge thème + TenantBuilderForm (Input/Button/Checkbox/Card) + ModelSelector (Card+radiogroup). Disclaimer + dropzones DOCX/CV laissés custom (FileUploader DS pas livré).

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
