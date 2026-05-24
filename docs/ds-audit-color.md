# Audit DS — WP7 Cluster B (Color)

**Statut** : `🟡 en cours`  
**Date de démarrage** : 2026-05-22  
**Cluster source** : `color-and-contrast`, `colorize`, `bolder`, `quieter`

## Sources

- `docs/ds-audit-report.md`
- `docs/known-issues-and-fixes.md`

## Portée

- `apps/docs/src/app.css`
- Réutilisation de tokens `@sentropic/design-system-tokens` et `@sentropic/design-system-themes`

## Findings prioritaires

### P0

1. **P0-1** — Couleurs hard-codées (`#fff`, `#000`, hex directs)  
- **Constat** : usage large de valeurs littérales, rupture du contrat “OKLCH + tokens”.  
- **Cible** : `apps/docs/src/app.css` (références nombreuses).  
- **Action WP7-C** : convertir en variables DS `--st-*` et retirer toute couleur hex non tokenisée.

2. **P0-2** — Contraste / alignement chromatique incohérent sur textes clairs/sombres  
- **Constat** : `#000`/`#fff` utilisés sur fonds saturés, avec tonalité froide/chaude incohérente.  
- **Cible** : `apps/docs/src/app.css` + exemples dans `apps/docs/src/routes/+page.svelte` et pages composants.  
- **Action WP7-C** : aligner les paliers texte/nuance sur la palette marque, éviter “blanc pur” et “noir pur”.

### P2

1. **P2-1** — Démonstration dark mode absente sur la vitrine docs  
- **Constat** : composants capables de thème sombre mais doc layout figé en clair.  
- **Cible** : `apps/docs/src/routes/+layout.svelte`.  
- **Action WP7-C** : créer une bascule démonstrative et valider un second état visuel.

## Références

- `docs/ds-audit-report.md` sections `Findings P0` et `Findings P2`
- `known-issues-and-fixes.md` : pattern déjà identifié sur `Toast`/`Alert`.
