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

2. **P1-7** — Motion de retour sur les zones de contenu (entrée et menus)  
- **Constat** : la page docs manque d'une animation de retour cohérente au chargement des sections et du menu mobile.
- **Cible** : `apps/docs/src/app.css` (`.docs-page`, `.docs-hero`, `.docs-section`, `.docs-mobile-nav`).
- **Action WP7-D** : ajouter des micro-animations tokenisées + garde `prefers-reduced-motion` pour désactiver proprement l'animation.

### P2

1. **P2-5** — Aucun query `prefers-reduced-motion` dédié  
- **Constat** : règle a11y recommandée absente.  
- **Cible** : `apps/docs/src/app.css`.  
- **Action WP7-D** : intégrer les réductions de mouvement au minimum sur les transitions existantes.

2. **Statut WP7-D** — `P2-5` traité
- **Constat** : le guard réduit-motion est actif sur transitions + animations.
- **Cible** : `apps/docs/src/app.css`.
- **Action WP7-D** : finaliser la couverture P2 avec une règle globale de fallback réduit-motion.

## Références

- `known-issues-and-fixes.md`
- `impeccable-roadmap.md` (alignement sur motion primitives DS).
