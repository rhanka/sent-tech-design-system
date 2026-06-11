# Feature: WP20 — Thème Gouvernement du Canada (GC Design System)

## Objective
Ajouter le thème **Gouvernement du Canada** (GC Design System / GCDS — https://design-system.canada.ca)
au design system, en clonant l'approche des thèmes d'import existants (DSFR, Carbon, Airbus) :
un package `@sentropic/design-system-theme-canada` qui mappe la palette/typo/anatomie GCDS **publique**
sur la structure de tokens Sentropic (`TenantTheme`), + un chrome documentaire fidèle au site GC
(signature FIP, bande rouge, langue, wordmark Canada en pied) + enregistrement dans l'app docs.
Précédé d'un **inventaire des composants GCDS** mappé sur le DS, complétant les manques.
Statut dans les sous-bullets (PAS dans les titres → import idempotent).

## Scope / Guardrails
- Valeurs **publiques** GCDS uniquement (tokens open source) ; ne référencer que les *noms* de police (Lato, Noto Sans).
- Cloner strictement le pattern theme-dsfr (foundation + semantic + `createComponent`), pas de divergence d'archi.
- Chrome = imite le vrai header/footer GC (signature, bande, langue, wordmark) ; pas de rail gauche + container arrondi (anti-pattern proscrit).
- Parité : le thème agit via CSS vars `:root`, aucun fork des composants tri-framework.
- Gate = suite complète des packages touchés (lint hex, anatomy, build, tests), pas seulement le nouveau.

## Plan / Todo (lot-based)
- [ ] **Lot CA-INVENTORY — inventaire + mapping composants GCDS**
  - 34 composants GCDS recensés et mappés sur le DS (cf. docs/canada-gcds-mapping.md).
  - Couverts par le DS : Breadcrumbs, Button, Card, Checkboxes, Container, Date input, Details,
    Fieldset, File uploader, Footer, Grid, Header, Heading, Icon, Input, Language toggle, Link,
    Notice (Alert), Pagination, Radios, Search, Select, Side navigation, Stepper, Table, Text,
    Textarea, Top navigation, Theme/topic menu.
  - Gaps identifiés à compléter : **Error summary** (liste d'erreurs reliées aux champs).
  - Spécifiques chrome (pas composants génériques) : Signature, Date modified, Screenreader-only.
- [ ] **Lot CA-COMPLETE — complétion DS (gaps GCDS)**
  - ErrorSummary tri-framework (React/Svelte/Vue) + page docs + entrée catalogue + tests.
- [ ] **Lot CA-THEME — package theme-canada**
  - package.json + tsconfig + MAPPING.md + src/index.ts (canadaTheme) + src/index.test.ts.
  - Palette GCDS : blue-muted #26374a (bg primaire), blue-700 #1f497a (action/lien), texte #333333,
    danger #b3192e, vert #1f7a40 ; polices Lato (titres) + Noto Sans (corps).
- [ ] **Lot CA-DOCS — intégration app docs**
  - Enregistrer canadaTheme (layout THEMES + url-state ThemeId + deps + predev/prebuild),
    référence de comparaison (CDN GCDS), ChromeCanada.svelte (header/footer GC fidèles).
- [ ] **Lot CA-VERIFY — vérification & livraison**
  - build + check + tests verts ; audit visuel docs ; rebase origin/main ; push main ; CI verte.
