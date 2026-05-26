# sent-tech-impeccable reference

Ce skill encapsule le moteur maison `@sentropic/design-system-skills`.

## Objectif

- Exposer la qualité visuelle/design DS dans les sessions agent (Claude / Codex / Gemini / autres).
- Réutiliser la même CLI interne déjà publiée dans `packages/skills`.

## Usage attendu

### Audit principal

```bash
sent-tech-impeccable audit <url|file.html|inline-html>
```

Alias techniques possibles (selon harness):

- `design audit <target>`
- `node tools/skills/sent-tech-skills/scripts/audit.mjs <target>`

## Output

- `exit 0` si aucune anomalie trouvée.
- `exit 1` si findings détectés.
- `exit 2` si erreur d’exécution.

Le résultat est le JSON brut du moteur:
- `target`
- `findings[]`
- `durationMs`

## Limites actuelles

- Pas de mode Playwright dans le skill, uniquement le moteur statique du workspace.
- Pas d’autres subcommandes que `audit` pour l’instant.
