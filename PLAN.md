# Sent Tech / Sentropic Design System — Plan vivant

> Source de vérité de l'avancement. À mettre à jour à chaque session : cocher
> ce qui est livré, ajouter une référence PR/commit à droite quand pertinent,
> déplacer les items entre phases au fil de l'évolution réelle.

## Identité produit

- Scope npm courant : `@sentropic/design-system-tokens`, `@sentropic/design-system-themes`, `@sentropic/design-system-svelte` (v0.7.0 — Phase 4 complete, 55 composants).
- Convention nommage : `@sentropic/design-system-{tokens,themes,svelte}` (préfixe `design-system-` pour réserver l'espace `@sentropic` à d'autres familles de packages futurs).
- Évolution prévue : `@sentropic/design-system-svelte` reste le bundle complet ; ouverture future possible vers `@sentropic/design-system-svelte-core` + `@sentropic/design-system-svelte-{component}` (opt-in granulaire par composant).
- Scope npm legacy : `@sent-tech/*` (déprécié après le publish `@sentropic/design-system-{tokens,themes,svelte}@0.3.0`).
- Stack : Svelte 5, Tailwind v4, build Vite, publish via npm Trusted Publishing.
- Inspiration : IBM Carbon. White-label / multi-tenant via theming runtime CSS variables.
- Repo Git : `sent-tech-design-system` (nom de repo conservé pour l'instant).

> **Phase 4 100 % terminée** — couverture Carbon complète (AspectRatio,
> CodeSnippet, StructuredList, TileGroup, UnorderedList livrés en batch
> priorité basse).

## État actuel (synthèse)

- Composants Svelte livrés : 55.
- Consommateurs DS `0.7.0` observés : sent-tech/ui, spa-transpose-cv/ui, openerp/apps/web, Sentropic/top-ai UI (`sent-tech/external/top-ai-ideas-fullstack/ui`).
- Périmètre courant du suivi : repo design system uniquement.
- Priorités consommateurs à suivre côté DS : `nc-fullstack/ui`, Sentropic/top-ai chat-ui, Onyxia theme, OpenERP web, spa-transpose-cv/ui.
- Couverture vs Carbon : ~55 / ~55 composants. Phase 4 priorité haute + moyenne + basse 100 % livrées.

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

### Priorité haute (chat + transpose-cv + formulaires riches)

- [x] DataTable — tri, pagination intégrée, sélection ligne, cellules custom (vs notre `Table` minimal) (DS PR Phase 4 DataTable).
- [x] FileUploader — drag-drop, multi-fichiers, validation `maxSizeBytes`, liste retirable, type `FileUploadItem` exposé pour évolution progress (DS PR Phase 4 FileUploader).
- [x] Combobox — recherche dans la liste (DS PR Phase 4 batch 2).
- [x] MultiSelect — sélection multiple avec recherche (DS PR Phase 4 batch 2).
- [x] Search — pattern Carbon dédié (DS PR Phase 4 batch 1).
- [x] NumberInput — increment/decrement, min/max (DS PR Phase 4 batch 1).
- [x] DatePicker — single + range, FR/EN, bornes min/max, locale-aware via `Intl.DateTimeFormat` (DS PR Phase 4 DatePicker).
- [x] Slider — range + plage, tooltip valeur (DS PR Phase 4 batch 2).
- [x] Tag — entité fermable (vs `Badge` en lecture seule) (DS PR Phase 4 batch 1).
- [x] PasswordInput — toggle visibility (DS PR Phase 4 batch 1).

**Priorité haute Phase 4 = 100% livrée.**

### Priorité moyenne

- [x] Accordion (DS PR Phase 4 batch 2).
- [x] ContentSwitcher — segmented control role=tablist + nav clavier ←/→/Home/End (DS PR #14 batch 4).
- [x] CopyButton — clipboard write avec feedback visuel + label swap (DS PR #14 batch 4).
- [x] Form + FormGroup — `<form>` wrapper async (submitting/submitted/error) + `<fieldset>`/`<legend>` (DS PR Phase 4 Form).
- [x] InlineLoading — spinner+label, status active/success/error/inactive (DS PR #14 batch 4).
- [x] OverflowMenu — trigger ⋯ + menu d'actions, danger variant, click outside + Esc (DS PR Phase 4 batch 5).
- [x] PaginationNav — navigation numérotée avec ellipses, siblings configurables, bornes désactivées (DS PR Phase 4 batch 5).
- [x] ProgressBar — value/max + indeterminate, tones, sizes, full aria (DS PR #11).
- [x] ProgressIndicator — steps horizontaux/verticaux, statuts complete/current/upcoming/invalid/disabled (DS PR Phase 4 batch 5).
- [x] SkeletonText — placeholder texte animé, lines/heading/paragraph (DS PR #14 batch 4).
- [x] Toggle — vs `Switch`, ajoute label latéral on/off (DS PR #11).
- [x] Toggletip — clic-toggled vs hover Tooltip, Esc ferme (DS PR #14 batch 4).
- [x] UI Shell Header — banner sticky avec slots logo/navigation/actions (DS PR Phase 4 batch 5).

### Priorité basse / utilité à challenger

- [x] AspectRatio — wrapper CSS `aspect-ratio` configurable (DS PR Phase 4 batch low).
- [x] CodeSnippet — bloc `<pre><code>` copiable (CopyButton intégré) + variante `inline` (DS PR Phase 4 batch low).
- [x] StructuredList — `<dl>`/`<dt>`/`<dd>` key-value, bordures optionnelles (DS PR Phase 4 batch low).
- [x] TileGroup — `<fieldset>` de tiles cliquables (radio-group, label + description) (DS PR Phase 4 batch low).
- [x] UnorderedList — `<ul>` stylé avec puce custom, support nesting 1 niveau (DS PR Phase 4 batch low).

**Priorité basse Phase 4 = 100% livrée. Phase 4 globale 100 % terminée.**

## Phase 5 — Intégrations consommateur DS

Pré-requis : Phase 3 livrée. Phase 4 complète disponible via les packages `@sentropic/design-system-{tokens,themes,svelte}@0.7.0`.

- [x] `sent-tech/ui` (site Sent Tech principal — distinct de Forge). Stack : Svelte 5 + SvelteKit + Vite 5. PR sent-tech #2 mergée : bridge thème via `app.html`+`app.css`+`ThemeProvider`, MissionForm (Input+Textarea+Button), ExportPanel (Select+Button+Link), AssetList (Card+Badge), OfferComposer (Select+MultiSelect+Button), routes harmonisées (Link/Button). A déclenché DS PR #13 fix bindable Input/Textarea/Select + release v0.4.1.
- [x] `spa-transpose-cv/ui` (Scalian transpose CV). Stack : Svelte 5 + SvelteKit + Vite 6. DS `0.7.0` présent dans `ui/package.json`; composants DS observés dans UploadPage, SessionPage, TenantBuilderForm, ModelSelector et `ThemeProvider`. Repo local sale, donc ne pas conclure sur l'état PR sans vérif dédiée.
- [x] `openerp/apps/web`. DS `0.7.0` présent dans `apps/web/package.json`; composants DS observés sur login, layout, register-passkey, admin users/roles/audit/settings/approvals. Repo local sale sur des fichiers API/tests, donc à vérifier avant de dire "ok" en release.
- [x] `nc-fullstack/ui` — priorité. DS bumpé en `@sentropic/design-system-{tokens,themes,svelte}@^0.7.0`; `ui/src/routes/Input.svelte` garde le comportement inline (largeur dynamique) et le marquage des placeholders `[ ... ]` tout en utilisant `Input` DS. Vérif : `npm run check` échoue encore sur 167 erreurs / 42 warnings historiques hors `Input.svelte` (typage JS/TS legacy, imports `.ts`, etc.).
- [ ] Sentropic/top-ai (`top-ai` == Sentropic dans ce suivi). `sent-tech/external/top-ai-ideas-fullstack/ui` consomme `@sentropic/design-system-{tokens,themes,svelte}@^0.7.0`; diff local sur `Toast.svelte` + `node_modules/` non suivi. Le thread Sentropic chat-ui en développement doit consommer le DS (`design-system-svelte` + thème `entropic.css`/contrat chat) et ne doit pas recréer de primitives visuelles.
- [x] Onyxia theme. `@sentropic/design-system-themes` bumpé à `0.7.0`; `SENTROPIC_THEME_VERSION` par défaut `v0.7.0`; logo/favicon optionnels, `none` ou env absent => asset local neutre `/icons/home.svg` pour éviter le dragon. Vérif : `npm test` dans `helm-chart/examples/gke-ephemeral/theme` passe (19 tests).
- [x] Documentation DS : `docs/chat-ui-contract.md` garde le contrat expérimental et ajoute le packet d'échange Sentropic/chat-ui <-> DS (packages, theme, inventaire composants, runtime schema, a11y, décisions de promotion).
- [ ] Vérification release : maintenir `docs/release.md` aligné avec les versions publiées courantes.

## Phase 6 — Ménage

- [x] `sentech-forge.tar.gz` (snapshot orphelin du 2026-04-26) supprimé.
- [ ] Décider sort de `/home/antoinefa/src/top-ai-ideas` (React+Radix legacy, distinct du track actif Sentropic/top-ai).
- [ ] Décider sort de `/home/antoinefa/src/scalian-transpose-cv` (pas un repo git, pas de `package.json` — orphelin).
- [ ] `sentech-forge/PLAN.md` — plan SEO P0 daté 2026-02-23, quasi terminé sur le code mais cases pas cochées : valider/cocher les 6 items résiduels ou supprimer si obsolète.

---

## Décisions ouvertes

- **CSS vars** : prefix `--st-*` reste pour 0.3.0. À reconsidérer en v1.0.0 (renommage = breaking pour tous les consommateurs et tous les overrides).
- **DS React** : pas de besoin identifié à date, les consommateurs actifs sont Svelte. Le repo legacy React `/home/antoinefa/src/top-ai-ideas` est distinct du track actif Sentropic/top-ai et ne doit pas être confondu avec lui.
- **Repo Git** : `sent-tech-design-system` conservé. Renommer le repo casserait les redirects GitHub vers les vieilles PRs/issues + remote URLs des dev locaux.

## Méta

- Format : cases à cocher, mises à jour à chaque session.
- Conventions commit : Conventional Commits, atomiques, pas de `--no-verify`.
- Anti co-author : 0 trace de Claude/Anthropic dans les commits — vérifier `git log --format='%H %s%n%b' main..HEAD | grep -iE 'co-auth|claude|anthropic'` doit retourner vide.
- Vérifs Forge avant commit : `npm run lint && npm run theme:verify && npm run build`.
- Vérifs DS avant commit : `npm run verify` (lint + tests + build de tous les packages).
