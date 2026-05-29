# Plugin `sent-tech-design` (multi-harness)

Empaquète la skill de lint design-system (`@sentropic/design-system-skills`) pour
les assistants. La skill appelle le moteur buildé du repo (`packages/skills/dist/cli.js`),
résolu via `SENT_TECH_DS_ROOT` (défaut = chemin absolu du repo).

## Installé sur cette machine
- **Claude Code** : `~/.claude/skills/sent-tech-design/`
- **Gemini CLI**  : `~/.gemini/skills/sent-tech-design/`
- **Codex**       : `~/.codex/skills/sent-tech-design/`
- **agy (Antigravity)** : `agy plugin install <ce dossier>` (référence ce chemin)

## Réinstaller / mettre à jour
Convention `skills/<nom>/` pour Claude/Gemini/Codex (copier `skills/sent-tech-design/`).
Pour agy : `agy plugin install <chemin de ce dossier>` puis `agy plugin list`.
Prérequis : moteur buildé — `npm run --workspace packages/skills build`.
