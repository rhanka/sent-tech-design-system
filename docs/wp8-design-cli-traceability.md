# Traçabilité WP8 — CLI `design`

Ce document relie le ruleset déterministe `@sentropic/design-system-skills` aux principes de la CLI `design` et aux findings WP7 consolidés.

## Cadre

- Package npm : `@sentropic/design-system-skills`.
- Binaire : `design`.
- Commande d'audit déterministe : `design check <target> --tech` ou `design audit <target>`.
- Source WP7 : `docs/ds-audit-consolidated-v2.md`.
- Moteur : `packages/skills/src/rules/index.ts`.
- Contrat : 15 règles actives, toutes token-aware et traçables par `Rule.principle` / `Rule.wp7Finding`.

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

## Garde-fous token-aware

Les règles WP8 privilégient les tokens Sent Tech (`var(--st-*)`) et évitent de signaler les cas déjà portés par le système :

- Couleur : `no-bare-hex` et `contrast-token-pair` ignorent les couples texte/surface tokenisés.
- Espacement : `cramped-padding` et `padding-scale-token` ignorent les valeurs tokenisées et vérifient les valeurs brutes contre le rythme 4px/8px.
- Typographie : `typography-scale-token` ignore les tokens typographiques et contrôle uniquement les tailles brutes.
- Motion : `motion-subtle` accepte les durées tokenisées avec garde `prefers-reduced-motion`.
- Layout : `grid-variance` accepte les grilles exprimées par token de layout.

## Couverture tests

`packages/skills/test-fixtures/skills.test.js` couvre :

- Le contrat public `audit()` et la CLI `check --technical`.
- Les 15 règles actives via tests directs.
- Les 7 règles ajoutées en WP8 avec un couple positif/négatif chacune.
- La garde de traçabilité : chaque règle de `defaultRules` doit exposer `principle` et `wp7Finding`.

## Limites connues

- Le moteur reste statique (`jsdom`) : il ne calcule pas les styles post-hydratation ni les dimensions de viewport réelles.
- Les règles CSS lisent les styles inline et les blocs `<style>` du HTML audité ; elles ne remplacent pas une passe navigateur Playwright.
- Certains findings WP7 restent hors règles déterministes : dark-mode absent, badge inline dans H1, labels mineurs sans coût informationnel, statut docs sans légende, z-index `OverflowMenu`, conflit Drawer/menu close.
