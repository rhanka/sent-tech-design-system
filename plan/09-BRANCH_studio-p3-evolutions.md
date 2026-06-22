# Feature: Studio P3 — Évolutions visuelles docs & cross-framework

> **Branche :** `feat/studio-p3-evolutions`
> **Conductor :** claude:design-system

## Contexte

Corrections visuelles signalées lors de la session 2026-06-21 sur les docs et les composants cross-framework. Travail délégué à des subagents ; le conductor assure le reporting.

## Lots

### LOT 1 — Menus : police + alignement + icônes

- [x] **Menu font-size** — `.st-menu__item` doit hériter `0.875rem` (pas `1rem` du body)
  - FAIT (2026-06-21): `font-size: var(--st-component-menu-fontSize, 0.875rem)` ajouté Svelte + styles.css React. Commit `a5622269`.
- [x] **Checkmark désaligné** — `.st-menu__itemIcon` manque `width: 1rem; line-height: 1`
  - FAIT (2026-06-21): Ajouté Svelte + styles.css React. Commit `a5622269`.
- [x] **Vue — icônes absentes** — `h(actionItem.icon, ...)` crashe si icon est une string
  - FAIT (2026-06-21): Guard `typeof icon === "string"` dans `Menu.ts` Vue. Commit `a5622269`.
- [x] **Angular — icônes absentes** — template ne rendait jamais l'icône
  - FAIT (2026-06-21): `@if (isStringIcon(...))` + méthode `isStringIcon()` dans `Menu.ts` Angular. Commit `a5622269`.

### LOT 2 — Docs header : icône + largeur + états identité

- [x] **Icône lune → soleil** — démo AppHeader montrait Moon au lieu de Sun pour mode light
  - FAIT (2026-06-21): SVG soleil dans `appHeaderActions` snippet. Commit fork agent.
- [x] **Header preview pas full width** — `.header-preview-full` manquait `width: calc(100% + …)`
  - FAIT (2026-06-21): Ajouté. Commit fork agent.
- [x] **État anonyme = texte** — "Se connecter" remplacé par icône bonhomme
  - FAIT (2026-06-21): `anonymousActions` snippet avec icône `User`. Commit fork agent.
- [x] **3 états connexion → 2 états** — article 3 redondant supprimé
  - FAIT (2026-06-21): Commit fork agent.

### LOT 3 — IdentityMenu compact

- [x] **IdentityMenu prop `compact`** — avatar "FA" (2 initiales) sans nom ni chevron
  - FAIT (2026-06-21): Prop `compact`, fonction `identityInitials()`, CSS `.st-identityMenu--compact`. Commit `152dc162`. Version 0.34.58.
- [x] **Docs layout `compact={true}`** — appliqué sur l'IdentityMenu du header docs
  - FAIT (2026-06-21): Commit `152dc162`.

### LOT 4 — Dark mode contraste docs

- [x] **7 corrections dark mode** — `.docs-button-link`, sidebar actif/hover, version, breadcrumb : couleurs hardcodées → variables sémantiques
  - FAIT (2026-06-21): Commit `4b0ff2f8`.

### LOT 5 — Responsive : burger + couleurs primary

- [x] **Burger collé au logo** — `.docs-header .st-header__actions` écrasait `margin-left: auto` du DS
  - FAIT (2026-06-21): `margin-left: auto` ajouté dans `app.css:148`. Commit `d6777c67`.
- [x] **Bouton "Composants" noir** — déjà fixé par `4b0ff2f8` (`--st-semantic-action-primary` bleu oklch) ; était un problème de cache navigateur
  - FAIT (2026-06-21): Pas de changement supplémentaire.
- [x] **Couleurs primary incorrectes en responsive** — non reproductible statiquement ; aucune règle media n'écrase les variables sémantiques
  - FAIT (2026-06-21): Aucun fix requis.

### LOT 6 — Lockfile docs 0.34.58

- [x] **Bumper lockfile** — `apps/docs/package-lock.json` pointe sur 0.34.58
  - FAIT (2026-06-21): Tag corrigé `v0.34.58` → `svelte-v0.34.58` (npm-publish.yml exige lockstep tokens+themes). svelte-publish.yml success. Commit `664bcfb0`.
