---
name: sent-tech-design
description: "Run @sentropic/design-system-skills against a target and return findings as JSON for DS linting."
argument-hint: "audit <url | file.html | inline-html> | fidelity [--theme …] [--component …]"
user-invocable: true
allowed-tools:
  - Bash(node scripts/audit.mjs *)
  - Bash(node scripts/fidelity.mjs *)
---

Lightweight DS lint skill for Sentinel/Doc contexts. Two commands :
`audit` (lint statique jsdom, sans navigateur) et `fidelity` (comparaison
pixel-perfect bord par bord vs les vrais composants officiels DSFR / Carbon).

## Commande `audit` (lint statique)

- `node scripts/audit.mjs <target>`
  - `<target>` supporte une URL, un chemin de fichier ou du HTML inline.
  - Le wrapper relaie vers le contrat workspace `design audit <target>`.
  - Linter **statique jsdom** (25 règles actives, aucun navigateur requis).

### Sortie `audit`

- JSON `AuditReport` sur stdout.
- Codes de sortie : `0` (propre), `1` (findings), `2` (incident runtime).

## Commande `fidelity` (comparaison par bord)

- `node scripts/fidelity.mjs [options]`
  - Compare **bord par bord** NOS composants mappés aux **vrais composants
    officiels** DSFR / Carbon (CSS officiel chargé depuis le CDN dans un
    `<iframe srcdoc>` sur la page `/compare`), via styles calculés réels.
  - Options : `--theme <dsfr|carbon>`, `--component <Button|Input|Textarea|`
    `Select|Link|Card|Tabs>`, `--json`, `--date <YYYY-MM-DD>`,
    `--fail-under <pct>`, `--keep-server`, `-h|--help`.
  - Sans argument : tous les thèmes, tous les composants.

### Prérequis `fidelity`

- **Chrome système** (`/usr/bin/google-chrome`) — piloté par puppeteer-core,
  headless, aucun téléchargement de navigateur.
- **Build des docs** : `npm run --workspace apps/docs build` (sert le build
  statique sur un port dédié, **jamais 5173**).
- Le wrapper résout le repo via `SENT_TECH_DS_ROOT` (défaut = chemin absolu de
  l'install) puis lance `tools/compare/fidelity.mjs`.

### Sortie `fidelity`

- Rapport humain : `docs/compare-fidelity-report.md` (par thème / composant).
- JSON brut : `tools/compare/last-report.json` (réutilisable en CI).
- `--json` imprime aussi le JSON sur stdout.
- Codes de sortie : `0` (rapport généré), `1` (`--fail-under` non atteint),
  `1` (échec runtime).

## Reference

- `reference/theme-mapping.md` — procédure rodée pour mapper un design system
  tiers (public ou client) vers un thème Sentropic (`TenantTheme`). Exemples
  livrés : `packages/theme-dsfr`, `packages/theme-carbon`.
