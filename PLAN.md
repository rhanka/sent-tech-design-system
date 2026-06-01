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
- Track React ouvert en cadrage (2026-05-30) : pas encore de package React dans ce repo. Codex prend l'owner du périmètre React ; Claude garde les tracks Svelte/docs/themes/release/fidelity en cours. Toute modification croisée passe par h2a avant edit.
- Track thème Airbus ouvert (2026-05-30) : Codex prend l'owner du portage `../airbus-design-system` en thème Sentropic. Package `packages/theme-airbus` initié ; publication npm bloquée tant que la stratégie de version/release n'est pas tranchée.

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
- [x] Trusted Publishers GitHub Actions configurés sur les 4 packages (y compris `@sentropic/design-system-skills`, repo `rhanka/sent-tech-design-system`, workflow `npm-publish.yml`). Les prochains tags `v*` publieront automatiquement via OIDC sans token.
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

## Phase 5B — Portage React du design system

Objectif : ouvrir une surface React du DS sans perturber le socle Svelte. Le portage React doit consommer les mêmes packages `tokens` / `themes` / CSS variables et ne doit pas forker l'identité visuelle.

### Scope et ownership

| Zone | Owner | Statut | Règle de collision |
|---|---|---|---|
| Cadrage React, inventaire composants à porter, API React cible | Codex | 🟡 à formaliser | Codex édite le plan et les futurs fichiers React ; Claude ne touche pas sans message h2a. |
| Futur package `packages/components-react` | Codex | ⚪ pas créé | Créer isolé, sans modifier `packages/components-svelte` hors contrat partagé explicitement validé. |
| Docs React dans le site DS | Codex | ⚪ pas créé | Ajouter sous une entrée dédiée React ; ne pas réécrire les pages Svelte en cours de travail par Claude. |
| Svelte, thèmes DSFR/Carbon, banc fidelity, release `0.10.2` / `0.2.2` | Claude | 🟡 en cours | Claude continue ; Codex ne touche pas ces fichiers sauf demande explicite. |
| Legacy `/home/antoinefa/src/top-ai-ideas` React+Radix | Audit only | ⚪ à décider | Source d'inventaire possible, pas cible de migration directe, et hors repo DS. |

### Séquence

1. [ ] Consigner l'état initial React : aucun package React dans le repo, seules traces locales = legacy `/home/antoinefa/src/top-ai-ideas`.
2. [ ] Définir le MVP React : primitives prioritaires, API props, stratégie CSS/theme, dépendances acceptées (`react`, `react-dom`, `lucide-react` si nécessaire).
3. [ ] Créer un scaffold isolé `packages/components-react` seulement après stabilisation des travaux Claude en cours sur release/docs/fidelity.
4. [ ] Ajouter tests/build du package React sans changer les contrats Svelte existants.
5. [ ] Ajouter docs React dédiées ou onglets React/Svelte avec migration progressive, sans retirer les pages Svelte.
6. [ ] Valider avec Claude via h2a avant tout changement partagé (`package-lock.json`, scripts racine, navigation docs, release tags).

## Phase 5C — Portage thème Airbus

Objectif : porter `../airbus-design-system` comme thème Sentropic sans importer de composants Airbus, et sans modifier le repo source Airbus. Le portage doit rester un mapping `TenantTheme` fondé sur les tokens Airbus et compatible avec les composants Svelte existants.

### Scope et ownership

| Zone | Owner | Statut | Règle de collision |
|---|---|---|---|
| Déclaration h2a auprès des agents DS/Airbus | Codex | 🟢 fait | Messages envoyés à `claude:sent-tech-design-system` et `claude:airbus-design-system`. |
| Source `../airbus-design-system` | Read-only | 🟢 inspectée | Ne pas modifier ; uniquement lire tokens/styles comme référence. |
| Package `packages/theme-airbus` | Codex | 🟡 initié | Package public-ready, export `airbusTheme`, test de contrat, mapping initial tokens/anatomie. |
| Documentation mapping | Codex | 🟡 initiée | `packages/theme-airbus/MAPPING.md`; compléter au fil des passes fidélité. |
| Publication / distribution | À trancher | ⏸️ bloqué | Client theme : ne pas publier npm tant que version, release tag et nommage ne sont pas validés. |

### Séquence

1. [x] Se déclarer via h2a et annoncer l'ownership du portage Airbus.
2. [x] Créer le package `@sentropic/design-system-theme-airbus`.
3. [x] Ajouter un test de contrat theme + compilation CSS.
4. [x] Mapper le noyau Airbus : couleurs, typographie, espacements, radius, elevation, focus, Button/Input/Tabs/Card.
5. [ ] Étendre le mapping aux composants restants selon le banc fidélité (`/compare`) et les pages docs.
6. [ ] Décider la stratégie de publication : version, tag de release et inclusion éventuelle dans le workflow npm.

## Phase 6 — Ménage

- [x] `sentech-forge.tar.gz` (snapshot orphelin du 2026-04-26) supprimé.
- [ ] Décider sort de `/home/antoinefa/src/top-ai-ideas` (React+Radix legacy, distinct du track actif Sentropic/top-ai). Depuis le cadrage React DS : utilisable comme inventaire historique, pas comme package DS React.
- [ ] Décider sort de `/home/antoinefa/src/scalian-transpose-cv` (pas un repo git, pas de `package.json` — orphelin).
- [ ] `sentech-forge/PLAN.md` — plan SEO P0 daté 2026-02-23, quasi terminé sur le code mais cases pas cochées : valider/cocher les 6 items résiduels ou supprimer si obsolète.

---

## Décisions ouvertes

- **CSS vars** : prefix `--st-*` reste pour 0.3.0. À reconsidérer en v1.0.0 (renommage = breaking pour tous les consommateurs et tous les overrides).
- **DS React** : besoin rouvert en cadrage. Codex owner du portage React ; Claude owner du reste des chantiers DS actifs. Le repo legacy React `/home/antoinefa/src/top-ai-ideas` reste distinct du track actif Sentropic/top-ai et ne doit pas être confondu avec un package DS React.
- **Thème Airbus** : portage initié en package public-ready. Ne pas publier tant que la stratégie de version/release et les contraintes de distribution Airbus ne sont pas validées.
- **Repo Git** : `sent-tech-design-system` conservé. Renommer le repo casserait les redirects GitHub vers les vieilles PRs/issues + remote URLs des dev locaux.

## Méta

- Format : cases à cocher, mises à jour à chaque session.
- Conventions commit : Conventional Commits, atomiques, pas de `--no-verify`.
- Anti co-author : 0 trace de Claude/Anthropic dans les commits — vérifier `git log --format='%H %s%n%b' main..HEAD | grep -iE 'co-auth|claude|anthropic'` doit retourner vide.
- Vérifs Forge avant commit : `npm run lint && npm run theme:verify && npm run build`.
- Vérifs DS avant commit : `npm run verify` (lint + tests + build de tous les packages).
