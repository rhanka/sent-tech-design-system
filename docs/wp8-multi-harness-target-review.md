# WP8 — Cible de revue : skill multi-harness Sent Tech impeccable

## Contexte

WP8 est découpé en deux couches :

1. **Moteur maison** `@sentropic/design-system-skills` (`packages/skills`) pour l’analyse visuelle.
2. **Skill harness** pour exécuter ce moteur depuis les assistants avec une friction minimale.

Cette passe reste une **version V1 scaffold** et non un clone complet de `pbakaus/impeccable`.

## Atelier de revue — ce qui doit être accepté avant continuation

### Cible finale de la passe (V1)

1. **Commandes supportées**
   - `design audit <target>`
   - `<target>` = `url` | `file.html` | `inline-html`
   - Même signature d’input que l’outil interne, sans transformation de contrat.

2. **Harness unifié**
   - Orchestrateur unique : `tools/skills/sent-tech-skills/scripts/audit.mjs`.
   - Les différents assistants réutilisent ce même appel.

3. **Output contract**
   - `stdout` : JSON brut du rapport `AuditReport`.
   - `stderr` : logs techniques lisibles si la CLI en émet.
   - Codes retour :
     - `0` = OK, aucun finding
     - `1` = findings détectés
     - `2` = erreur d’exécution

4. **Compatibilité**
   - No business logic in wrapper.
   - Aucune dépendance hors workspace.

### Non-objectifs en V1

- Pas de Playwright runtime.
- Pas de commandes frontales supplémentaires (`polish`, `shape`, `craft`, etc.).
- Pas d’internationalisation de la commande.

### Décisions à bloquer explicitement

- **Nom de la commande** : `design` (Validé).
- **Point d’entrée** réel de la skill locale (repo local first).
- **Sortie** : le format reste strictement le JSON de `AuditReport`.

## Preuve de livraison attendue

1. Les fichiers suivants existent :
   - `tools/skills/sent-tech-skills/SKILL.md`
   - `tools/skills/sent-tech-skills/scripts/audit.mjs`
   - `tools/skills/sent-tech-skills/reference/README.md`
   - `docs/wp8-multi-harness-target-review.md`
   - `docs/ds-audit-consolidated-v2.md`
2. Vérification locale :
   ```bash
   node tools/skills/sent-tech-skills/scripts/audit.mjs http://localhost:4173
   ```
   retourne JSON valide + code de sortie conforme.
3. `docs/workpackages.md` et `docs/ds-audit-consolidated-v2.md` sont alignés.
4. Une seule exécution du script produit le même résultat quel que soit le harness.

## Sortie attendue pour WP8

- Cette doc = contrat de revue (évite les ambiguïtés de “on ne sait pas ce qu’on remet”).
- WP7 doit consommer cette V2 et cette checklist comme entrée prioritaire pour le backlog règles.
