# Audit DS — WP7 Cluster C (Spatial & Responsive)

**Statut** : `🟡 en cours`  
**Date de démarrage** : 2026-05-22  
**Cluster source** : `spatial-design`, `layout`, `responsive-design`, `shape`

## Sources

- `docs/ds-audit-report.md`
- `docs/known-issues-and-fixes.md`

## Portée

- `apps/docs/src/app.css`
- `apps/docs/src/routes/+page.svelte`
- `apps/docs/src/routes/components/file-uploader/+page.svelte`

## Findings prioritaires

### P0

1. **P0-3** — Monotonie de grilles (`card grids`) sur la home  
- **Constat** : 4 blocs de cartes de même patron visuel, rythme trop répétitif.  
- **Cible** : home + sections de mise en avant (`apps/docs/src/routes/+page.svelte`, `apps/docs/src/app.css`).  
- **Action WP7-C** : casser l’identité “pattern uniforme” avec 1-2 sections au format alterné.

### P1

1. **P1-2** — Cibles interactives sous 44×44 (desktop)  
- **Constat** : tailles trop compactes pour boutons/lang selectors; amélioration partielle via media query coarse only.  
- **Cible** : `apps/docs/src/app.css` (`min-height/min-width` bas).  
- **Action WP7-C** : normaliser les cibles de base à 44px en priorité (ou justification claire côté desktop).

2. **P1-5** — Rail + container arrondi mélangés dans des zones voisines  
- **Constat** : incohérence “rail d’indicateur” vs surfaces arrondies.  
- **Cible** : `apps/docs/src/app.css` + sidebar composants.  
- **Action WP7-C** : soit rail rectiligne + angle nul, soit cartes arrondies sans rail.

3. **P1-7** — Échelle de padding incohérente  
- **Constat** : 23 valeurs de padding observées, bruit de rythme.  
- **Cible** : `apps/docs/src/app.css`.  
- **Action WP7-C** : aligner sur base de tokens 4/8 et réduire la dispersion.

## Références

- `known-issues-and-fixes.md` (bug side-tab + z-index)
- `impeccable-roadmap.md` (objectifs de rythme spatial).
