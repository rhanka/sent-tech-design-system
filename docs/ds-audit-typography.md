# Audit DS — WP7 Cluster A (Typography & Writing)

**Statut** : `🟡 en cours`  
**Date de démarrage** : 2026-05-22  
**Cluster source** : `typography`, `ux-writing`

## Sources

- `docs/ds-audit-report.md` (source consolidée, exécution `npx impeccable detect` + revue manuelle)
- `docs/known-issues-and-fixes.md`
- `docs/chat-ui-contract.md`

## Scope

- `docs/ds-audit-report.md`
- Pages `apps/docs/src/routes/+page.svelte`, `apps/docs/src/routes/+layout.svelte`, `apps/docs/src/app.css`

## Findings en cours (prioritaires)

### P0

1. **P0-5** — `single-font` + `overused-font`
- **Constat** : `font-family` uniforme (`Inter`) et palette typographique aplatie.
- **Cible** : `apps/docs/src/app.css`
- **Action WP7-B** : proposer un axe `font-family` de rupture (headline/body via tokens) sans casser les composants existants.

2. **P0-4** — lignes textuelles > 75ch (ex : 96 caractères)
- **Constat** : `max-width` trop large (`48rem`) sur paragraphes hero/sections.
- **Cible** : `apps/docs/src/app.css`
- **Action WP7-B** : aligner la cap sur 65–75ch pour les zones de lecture.

### P1

1. **P1-1** — échelle typographique trop dense (écarts faibles entre paliers)
- **Constat** : plus de 10 paliers sans progression cohérente de hiérarchie.
- **Cible** : `apps/docs/src/app.css`
- **Action WP7-B** : définir une échelle de ratio 1.25 minimum entre paliers critiques (kicker/title/body/note).

2. **P1-3** — em dash (`—`) en microcopy
- **Constat** : occurrences visibles sur pages composants.
- **Action WP7-B** : supprimer les tirets cadratins des labels en faveur de `:`, `;`, `.` ou parenthèses.

## Références croisées (format attendu pour cluster A)

- `docs/ds-audit-report.md` sections "Findings P0" et "Findings P1".
- `known-issues-and-fixes.md` (corrélations side-tab/rounded, etc.).
- `impeccable-roadmap.md` (cible `no-em-dash`, `line-length`, `single-font`).
