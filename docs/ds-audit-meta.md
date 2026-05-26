# Audit DS — WP7 Cluster E (Audit / Critique / Polish)

**Statut** : `🟡 en cours`  
**Date de démarrage** : 2026-05-22  
**Cluster source** : `audit`, `critique`, `polish`, `harden`, `optimize`, `extract`, `distill`, `craft`

## Sources

- `docs/ds-audit-report.md`
- `docs/impeccable-roadmap.md`
- `docs/known-issues-and-fixes.md`
- `.agents/skills/impeccable/reference/live.md`

## Priorités de consolidation

### P0

1. **Aligner la sortie consolidée**  
- Compiler `ds-audit-report.md` + cluster files A/B/C/D en un master unique sans doublons.  
- Référencer explicitement les corrections déjà prises en charge dans `known-issues-and-fixes.md`.

### P1

1. **Rendre la sortie de skill réutilisable CI**  
- Ajouter un rapport unique normalisé (JSON + markdown résumé) quand `packages/skills` atteint 8+ règles.  
- Prévoir un script `npm run lint:impeccable` branchable dans GitHub Actions.

### P2

1. **Améliorer friction skill upstream**  
- `impeccable` fonctionne, mais Skill-tool path peut ne pas être chargé en session.  
- WP7-E documente le contournement opérationnel (`npx impeccable detect`) et la bascule future vers skill maison.

## Mémoire d'audit

- Le plus fort gagnant métier à court terme reste la cohérence token + contraste + rythme spatial ; c’est ce que WP8 priorise pour l’intégration ruleset.
