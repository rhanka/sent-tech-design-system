# WP11 — Dogfooding `design check` sur la documentation Sent Tech

Date : 2026-06-01  
Branche : `main`  
Moteur : `@sentropic/design-system-skills` local, 27 règles actives

## Cadrage

Objectif : exécuter le ruleset WP8 sur des pages réelles de notre documentation générée, corriger les dettes exploitables, puis consigner le résultat sur la sortie statique.

Périmètre audité :

- Build statique complet : `npm run build`, sortie `apps/docs/build`.
- 86 pages HTML réelles sous `apps/docs/build`, hors `404.html`.
- Spot-check CLI : `node packages/skills/dist/cli.js check apps/docs/build/compare.html --tech`.
- Agrégation full-site : API `audit({ kind: "file" })` sur chaque fichier HTML généré, avec le même `defaultRules`.

Le spot-check CLI retourne le code `0`. Sur `compare.html`, le résumé CLI est : 0 finding, `high:0 medium:0 low:0`, `score:100/100`.

## Résultat global

| Mesure | Valeur |
|---|---:|
| Pages auditées | 86 |
| Règles actives | 27 |
| Findings totaux | 0 |
| High | 0 |
| Medium | 0 |
| Low | 0 |

### Répartition par règle

| Règle | Findings |
|---|---:|
| 27 règles actives | 0 |

Lecture : les deux dettes basses remontées par les nouvelles règles (`h1-inline-badge`, `status-indicator-label`) restent à 0 sur le build docs, les faux positifs `line-length-cap` sont fermés par la lecture des stylesheets liés locaux, `no-em-dash` ne duplique plus les ancêtres des nœuds de texte fautifs, `no-bare-hex` ignore les déclarations/fallbacks tokenisés (`--*`, `var(...)`) et `single-font` ignore `@font-face` tout en lisant les stylesheets liés locaux. La dette éditoriale `no-em-dash` détectée sur 60 occurrences est corrigée dans les pages docs et le build package Svelte consommé par la doc.

## Pages les plus signalées

| Page | Findings | Règles dominantes |
|---|---:|---|
| Aucune | 0 | Aucune |

## Exemples de findings

| Page | Règle | Localisation | Message |
|---|---|---|---|
| Aucune | Aucune | Aucune | Aucun finding restant. |

## Synthèse opérationnelle

- WP8 est maintenant au palier demandé : 27 règles actives, avec traçabilité `rule -> principle -> finding WP7`.
- WP11 dogfooding confirme que le ruleset s'exécute sur le vrai build docs, produit des findings exploitables, puis valide leur fermeture.
- Les dettes `h1-inline-badge`, `status-indicator-label` et `line-length-cap` sont corrigées sur le build docs et restent couvertes par fixtures dédiées.
- `no-em-dash` signale maintenant uniquement les éléments propriétaires d'un texte direct fautif et ignore `script/style`; le total dogfooding passe de 580 à 231 findings sans masquer la dette éditoriale réelle.
- `no-bare-hex` ne signale plus les variables CSS ni les fallbacks `var(...)`, ce qui supprime 86 faux positifs dogfooding tout en gardant les usages directs comme `background:#fff` couverts par test.
- `single-font` ignore `@font-face` et lit les stylesheets liés locaux; les 85 findings précédents étaient liés aux polices chargées globalement, pas à une absence prouvée de hiérarchie sur les pages.
- La dette éditoriale `no-em-dash` restante est fermée sur le build statique audité : 0 finding full-site.

## Limites

- L'audit est statique via `jsdom`; il ne remplace pas une passe navigateur avec styles calculés et viewports.
- La règle `line-length-cap` lit les styles inline, les blocs `<style>` et les stylesheets liés locaux pour reconnaître les bornes de lecture sur un build statique.
- Les warnings Svelte restants du build portent uniquement sur les slots Svelte legacy de `ChatComposer`; les warnings charts SVG focusables, ancres manquantes, `aria-invalid` sur `Radio` et sélecteurs CSS inutilisés ne se reproduisent plus.
- Les fichiers générés `apps/docs/build/**` ne sont pas versionnés dans ce rapport.
