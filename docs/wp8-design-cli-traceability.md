# Traçabilité WP8 — CLI `design`

Ce document relie le ruleset déterministe `@sentropic/design-system-skills` aux principes de la CLI `design` et aux findings WP7 consolidés.

## Cadre

- Package npm : `@sentropic/design-system-skills`.
- Binaire : `design`.
- Commande d'audit déterministe : `design check <target> --tech` ou `design audit <target>`.
- Source WP7 : `docs/ds-audit-consolidated-v2.md`.
- Moteur : `packages/skills/src/rules/index.ts`.
- Contrat : 25 règles actives, toutes token-aware quand elles portent sur des styles, et traçables par `Rule.principle` / `Rule.wp7Finding`.
- Gate CI : `design check <build-html-dir> --fail-under <score>` agrège les pages HTML statiques et échoue sous le score minimal.

## Règles actives

| `ruleId` | Principe `design` | Finding WP7 source | Niveau |
|---|---|---|---|
| `single-font` | `design align --typo` | P0.5 `single-font` / `overused-font` | high |
| `no-bare-hex` | `design align --tones` | P0.1 hard-coded colors dans la vitrine docs | high |
| `no-em-dash` | `design polish --lucid` | P1.3 em dash en microcopy | high |
| `side-tab-on-rounded` | `design align --spacing` | P1.4 rail gauche + surface arrondie | medium |
| `line-length-cap` | `design align --typo` | P0.4 longueur de ligne trop élevée | medium |
| `touch-target-44` | `design align --a11y` | P1.2 taille de cible tactile sous 44px | low |
| `heading-hierarchy` | `design align --a11y` | P1.1 échelle typographique dense / hiérarchie affaiblie | medium |
| `underline-hardcoded-border` | `design align --spacing` | P1.5 tailles d'espace bruitées / alignement par bord | low |
| `cramped-padding` | `design align --spacing` | P1.7 cramped spacing sur certains blocs docs | medium |
| `motion-subtle` | `design polish --motion` | P1.6 motion quasi absente + P2.5 absence de `prefers-reduced-motion` | medium |
| `padding-scale-token` | `design align --spacing` | P1.5 tailles d'espace bruitées | medium |
| `rail-vs-radius-consistency` | `design align --spacing` | P1.4 rail gauche + surface arrondie | medium |
| `grid-variance` | `design polish --quieter` | P0.3 monotonie des grilles de cartes | low |
| `contrast-token-pair` | `design align --tones` | P0.2 contraste/alignement chromatique incohérent | high |
| `typography-scale-token` | `design align --typo` | P1.1 échelle typographique dense | medium |
| `no-pure-black-white` | `design align --tones` | P0.2 contraste/alignement chromatique incohérent sur fonds colorés | high |
| `raw-color-value` | `design align --tones` | P0.1 hard-coded colors dans la vitrine docs | medium |
| `font-family-token` | `design align --typo` | P0.5 `single-font` / `overused-font` | medium |
| `display-body-font-pair` | `design align --typo` | P0.5 `single-font` / `overused-font` | medium |
| `line-length-max-width` | `design align --typo` | P0.4 longueur de ligne trop élevée | medium |
| `h1-inline-badge` | `design align --typo` | P2.2 badge inline dans le H1 | low |
| `status-indicator-label` | `design clarify --interaction` | P2.4 statut des docs sans légende explicite | low |
| `redundant-url-label` | `design polish --lucid` | P2.3 labels mineurs sans coût informationnel | low |
| `auto-fit-card-grid` | `design polish --quieter` | P0.3 monotonie des grilles de cartes sur la home | low |
| `focus-visible-ring` | `design harden --a11y` | P1.2 taille/cible interactive + affordance focus insuffisante | medium |

## Garde-fous token-aware

Les règles WP8 privilégient les tokens Sent Tech (`var(--st-*)`) et évitent de signaler les cas déjà portés par le système :

- Couleur : `no-bare-hex`, `contrast-token-pair`, `no-pure-black-white` et `raw-color-value` ignorent les couples texte/surface tokenisés.
- Espacement : `cramped-padding` et `padding-scale-token` ignorent les valeurs tokenisées et vérifient les valeurs brutes contre le rythme 4px/8px.
- Typographie : `typography-scale-token`, `font-family-token`, `display-body-font-pair` et `line-length-max-width` ignorent les tokens typographiques ou les bornes de lecture déjà conformes.
- Motion : `motion-subtle` accepte les durées tokenisées avec garde `prefers-reduced-motion`.
- Layout : `grid-variance` et `auto-fit-card-grid` acceptent les grilles exprimées par token de layout.
- Interaction : `focus-visible-ring` accepte les anneaux `:focus-visible` tokenisés.

## Couverture tests

`packages/skills/test-fixtures/skills.test.js` couvre :

- Le contrat public `audit()` et la CLI `check --technical`.
- Les 25 règles actives via tests directs.
- Les 10 règles ajoutées en extension WP8 avec un couple positif/négatif chacune.
- Le gate `design check --fail-under`, y compris l'agrégation d'un dossier HTML.
- La garde de traçabilité : chaque règle de `defaultRules` doit exposer `principle` et `wp7Finding`.

## Limites connues

- Le moteur reste statique (`jsdom`) : il ne calcule pas les styles post-hydratation ni les dimensions de viewport réelles.
- Les règles CSS lisent les styles inline et les blocs `<style>` du HTML audité ; elles ne remplacent pas une passe navigateur Playwright.
- Certains findings WP7 restent hors règles déterministes : dark-mode absent, z-index `OverflowMenu`, conflit Drawer/menu close.
