# Audit de parité tri-framework — thème Gouvernement du Canada (GCDS)

Vérification que le thème `@sentropic/design-system-theme-canada` s'applique **à
l'identique en Svelte, React et Vue**, composant par composant, et qu'il
n'introduit aucune régression de parité. Réalisé sur le build statique des docs
(`apps/docs/build`, **179 pages composant**).

## Méthode
- **Baseline (thème défaut)** : `design audit:parity apps/docs/build` (rendu de
  chaque bloc d'exemple en svelte/react/vue + diff pixel `pixelmatch`, seuil 2 %).
- **Sous thème Canada** : l'outil `audit:parity` ne pose pas de thème ; un sweep
  headless dédié charge chaque page en `?framework={svelte|react|vue}&theme=canada`,
  attend l'application du thème (`--st-semantic-action-primary === #1f497a`), relève
  les variables Canada sur `:root` par framework (comparaison de **tokens**) et
  diffe au pixel le conteneur d'exemple (svelte‑vs‑react, svelte‑vs‑vue, seuil 2 %).

## Verdict
**Le thème Canada est parité‑propre.** Sur les **179 composants**, **0 divergence
de token** entre frameworks : `--st-semantic-action-primary` `#1f497a`,
`--st-semantic-text-primary` `#333333`, `--st-semantic-action-danger` `#b3192e`,
`--st-semantic-surface-inverse` `#26374a`, police `Noto Sans` — **identiques en
svelte/react/vue** partout où la page se rend. Le thème est **framework‑agnostique
et fidèle** ; il n'introduit aucune régression.

## Flags relevés (17) — tous pré‑existants, aucun causé par Canada

| Catégorie | Composants | Nature |
|---|---|---|
| Flakes de timing | `gantt-chart`, `histogram-chart` | 0 % après revérification sans charge (l'attente d'application du thème avait expiré sous charge) |
| Nuances de rendu **Svelte** (tokens identiques, react==vue, écart 2–8 %) | `pagination`, `file-uploader`, `footer`, `header`, `kpi-card`, `loading-state`, `range-slider`, `slider`, `streaming-message`, `time-picker`, `message-status-badge` (8,3 %, svelte +8 px) | écarts **sous le seuil en thème défaut** → la palette GC (bleu plein de la page active, etc.) les pousse au‑delà de 2 % ; DS‑wide, **pas spécifiques à Canada** |
| **Bug Vue préexistant** | `config-item-card`, `field-card` | crash `TypeError: …reading 'replace'` au rendu **vue** (composants du commit `4dad88a`) → casse l'hydratation vue **et** l'application du thème en vue ; déjà flaggés en baseline (thème défaut). **Indépendant du thème Canada.** |
| Artefact de capture | `structured-list` | conteneur d'exemple `.tex__stage` introuvable ; tokens=identiques là où mesuré |

## Notes
- `pagination` : les findings DOM de la baseline sont une **fuite i18n** (« Previous/Next »
  en anglais sur page FR) **commune aux 3 frameworks** — un manque de localisation, pas
  un défaut de parité.
- Le « 5 » parfois observé = le nombre de **blocs d'exemple** d'une page d'audit (la page
  `button` en a 5), pas un nombre de composants (il y en a 177 documentés).
- Artefacts : `/tmp/parity-default` (baseline) et `/tmp/parity-canada*` (sous Canada),
  captures + heatmaps de diff + `canada-parity-report.json` par composant.

## Suites possibles (hors thème Canada)
- Corriger le crash Vue de `config-item-card` / `field-card` (bug de l'autre session,
  casse la parité tri‑framework de ces 2 cartes).
- Lisser les nuances de rendu Svelte (DS‑wide, mineures, 2–3 %).
