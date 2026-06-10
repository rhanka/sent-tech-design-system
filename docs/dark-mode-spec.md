# Spec d'implémentation — Dark mode (Sentropic DS)

Source : deep-research opus 4.8 (2026-06-10). Le DS est **quasi 100% tokenisé** →
le dark mode = un 2e jeu de tokens sémantiques + un sélecteur, **pas une réécriture
composant** : `createComponent(semanticDark, foundationDark)` régénère toute l'anatomie
`--st-component-*` automatiquement.

## Mécanisme (compileTheme)
- Émettre 3 blocs : `:root` (light) + `@media (prefers-color-scheme: dark) :root:not([data-color-mode="light"])` (auto) + `:root[data-color-mode="dark"]` (toggle, autorité).
- `color-scheme: light|dark` par bloc (contrôles natifs). Supprimer le `@media` mort de app.css L84-88.
- Toggle docs **clair/sombre/auto** calqué sur le store thème/framework (localStorage `st-docs-color-mode` + `data-color-mode` sur `<html>` + script anti-FOUC dans app.html).

## Tokens sémantiques à inverser (LIGHT → DARK, OKLCH, hue marque 242, WCAG AA)
| Token | LIGHT | DARK |
|---|---|---|
| surface.default | #ffffff | oklch(15% 0.012 250) |
| surface.subtle | #f8fafc | oklch(19% 0.014 250) |
| surface.raised | #ffffff | oklch(21% 0.015 250) (élévation par luminance, +6%) |
| surface.inverse | #0f172a | oklch(96% 0.005 250) |
| surface.overlay | rgb(15 23 42/.48) | rgb(2 4 8/.66) |
| text.primary | #0f172a | oklch(96% 0.005 250) (~15.5:1) |
| text.secondary | #475569 | oklch(78% 0.012 250) |
| text.muted | #64748b | oklch(66% 0.018 250) (~4.9:1 plancher) |
| text.link | blue60 | oklch(72% 0.13 242) |
| border.subtle | #e2e8f0 | oklch(28% 0.014 250) |
| border.strong | #94a3b8 | oklch(42% 0.016 250) |
| border.interactive | blue60 | oklch(72% 0.13 242) (= focus) |
| action.primary | oklch(50% .134 242) | oklch(62% 0.15 242) |
| action.primaryHover | blue80 (assombrit) | oklch(70% 0.15 242) (éclaircit) |
| action.primaryText | #ffffff | oklch(17% 0.012 250) (à valider vs blanc) |
| action.secondary | #f8fafc | oklch(24% 0.015 250) |
| feedback.success | #16a34a | oklch(70% 0.17 150) |
| feedback.warning | #d97706 | oklch(76% 0.15 75) |
| feedback.error | #dc2626 | oklch(64% 0.19 25) |
| feedback.info | #2563eb | oklch(68% 0.15 250) |
| data.category1..8 | Tableau10 | Tableau10 lighter (+~15% L, hue-stable) |

`status.*` dérive de `feedback.*` → suit automatiquement. `foundation.shadow.*` : recolorer dark (rgb(0 0 0/.5)) ou élévation par luminance.

## Hardcodes à tokeniser AVANT (Lot 0, ~30 min)
- `packages/components-svelte/src/lib/ContentSwitcher.svelte:119` `rgba(0,0,0,0.06)` → `var(--st-shadow-subtle)`
- `packages/components-react/src/styles.css:1418` idem
- `packages/components-vue/src/styles.css:1418` idem
(Aucun `#fff`/`#000` nu ailleurs ; les `var(--st-…, #fff)` ont un fallback supplanté par le token dark.)

## Lots
- **Lot 0** : tokeniser les 3 box-shadows.
- **Lot 1** (packages/tokens) : `semantic.dark.ts` (table ci-dessus) + `foundationDark` (shadow) + `componentDark = createComponent(semanticDark, foundationDark)`, exports.
- **Lot 2** (packages/themes) : `tokensDark?` dans schema, `compileThemeWithModes` (3 blocs + color-scheme), brancher dans build-css.mjs + themes ; tests compile.
- **Lot 3** (apps/docs) : store `color-mode.svelte.ts`, toggle header (desktop+mobile), `compileThemeWithModes` dans +layout, script anti-FOUC app.html, retrait du @media mort.
- **Lot 4** : QA visuel 3 fw dark + câbler `selectableRow *Dark` / `badge infoBackground` ; la rule skills `darkModeRule.ts` doit passer.

> NB publish : tokens/themes sont tag-publiés (themes-v*) ; le dark s'affichera dans les docs (workspace) immédiatement, et atteindra npm au prochain tag themes.
