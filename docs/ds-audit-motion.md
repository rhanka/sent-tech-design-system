# Audit DS — WP7 Cluster D (Motion & Interaction)

**Statut** : `🟡 en cours`  
**Date de démarrage** : 2026-05-22  
**Cluster source** : `motion-design`, `animate`, `interaction-design`, `delight`, `overdrive`

## Sources

- `docs/ds-audit-report.md`

## Portée

- `apps/docs/src/app.css`
- Transitions des composants de démonstration docs (header/menus/carte)

## Findings prioritaires

### P1

1. **P1-6** — Absence de système motion visible  
- **Constat** : hors une transition de transition token, pas de mouvement signifiant ni progression visuelle.  
- **Cible** : `apps/docs/src/app.css` (sur toute la surface).  
- **Action WP7-D** : exposer quelques transitions cohérentes (`focus/hover/overlay`) en gardant un style sobre.

### P2

1. **P2-5** — Aucun query `prefers-reduced-motion` dédié  
- **Constat** : règle a11y recommandée absente.  
- **Cible** : `apps/docs/src/app.css`.  
- **Action WP7-D** : intégrer les réductions de mouvement au minimum sur les transitions existantes.

## Références

- `known-issues-and-fixes.md`
- `impeccable-roadmap.md` (alignement sur motion primitives DS).
