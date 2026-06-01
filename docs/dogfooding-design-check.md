# WP11 — Dogfooding `design check` sur la documentation Sent Tech

Date : 2026-06-01  
Branche : `main`  
Moteur : `@sentropic/design-system-skills` local, 25 règles actives

## Cadrage

Objectif : exécuter le ruleset WP8 sur des pages réelles de notre documentation générée, puis consigner les résultats sans modifier les pages `apps/docs`.

Périmètre audité :

- Build statique complet : `npm run build`, sortie `apps/docs/build`.
- 85 pages HTML réelles sous `apps/docs/build`, hors `404.html`.
- Spot-check CLI : `node packages/skills/dist/cli.js check apps/docs/build/compare.html --tech`.
- Agrégation full-site : API `audit({ kind: "file" })` sur chaque fichier HTML généré, avec le même `defaultRules`.

Le spot-check CLI retourne le code `1`, attendu parce que des findings sont présents. Sur `compare.html`, le résumé CLI est : 14 findings, `high:14 medium:0 low:0`, `score:44/100`.

## Résultat global

| Mesure | Valeur |
|---|---:|
| Pages auditées | 85 |
| Règles actives | 25 |
| Findings totaux | 145 |
| High | 145 |
| Medium | 0 |
| Low | 0 |

### Répartition par règle

| Règle | Findings |
|---|---:|
| `single-font` | 85 |
| `no-em-dash` | 60 |
| 23 autres règles actives | 0 |

Lecture : les deux dettes basses remontées par les nouvelles règles (`h1-inline-badge`, `status-indicator-label`) restent à 0 sur le build docs, les faux positifs `line-length-cap` sont fermés par la lecture des stylesheets liés locaux, `no-em-dash` ne duplique plus les ancêtres des nœuds de texte fautifs et `no-bare-hex` ignore désormais les déclarations/fallbacks tokenisés (`--*`, `var(...)`). Les findings restants sont éditoriaux/fondation : single-font global et tirets cadratins de microcopy.

## Pages les plus signalées

| Page | Findings | Règles dominantes |
|---|---:|---|
| `compare.html` | 14 | `no-em-dash` 13, `single-font` 1 |
| `components/force-graph.html` | 5 | `no-em-dash` 4, `single-font` 1 |
| `components/button.html` | 4 | `no-em-dash` 3, `single-font` 1 |
| `components/header.html` | 4 | `no-em-dash` 3, `single-font` 1 |
| `components/input.html` | 4 | `no-em-dash` 3, `single-font` 1 |
| `components/menu-popover.html` | 4 | `no-em-dash` 3, `single-font` 1 |
| `components/modal.html` | 4 | `no-em-dash` 3, `single-font` 1 |
| `components/drawer.html` | 3 | `no-em-dash` 2, `single-font` 1 |
| `components/dropdown.html` | 3 | `no-em-dash` 2, `single-font` 1 |
| `components/empty-state.html` | 3 | `no-em-dash` 2, `single-font` 1 |

## Exemples de findings

| Page | Règle | Localisation | Message |
|---|---|---|---|
| `compare.html` | `single-font` | `head/style \| inline-style` | Une seule famille typographique principale est détectée. |
| `compare.html` | `no-em-dash` | `h1[text=Banc de fidélité — notre...]` | Em dash détecté dans la copy. |

## Synthèse opérationnelle

- WP8 est maintenant au palier demandé : 25 règles actives, avec traçabilité `rule -> principle -> finding WP7`.
- WP11 dogfooding confirme que le ruleset s'exécute sur le vrai build docs et produit des findings exploitables.
- Les dettes `h1-inline-badge`, `status-indicator-label` et `line-length-cap` sont corrigées sur le build docs et restent couvertes par fixtures dédiées.
- `no-em-dash` signale maintenant uniquement les éléments propriétaires d'un texte direct fautif et ignore `script/style`; le total dogfooding passe de 580 à 231 findings sans masquer la dette éditoriale réelle.
- `no-bare-hex` ne signale plus les variables CSS ni les fallbacks `var(...)`, ce qui supprime 86 faux positifs dogfooding tout en gardant les usages directs comme `background:#fff` couverts par test.
- La dette détectée prioritaire reste éditoriale et fondation globale : introduire une vraie hiérarchie typographique display/body, puis réduire les `—` restants.

## Limites

- L'audit est statique via `jsdom`; il ne remplace pas une passe navigateur avec styles calculés et viewports.
- La règle `line-length-cap` lit les styles inline, les blocs `<style>` et les stylesheets liés locaux pour reconnaître les bornes de lecture sur un build statique.
- Les warnings Svelte restants du build portent uniquement sur les slots Svelte legacy de `ChatComposer`; les warnings charts SVG focusables, ancres manquantes, `aria-invalid` sur `Radio` et sélecteurs CSS inutilisés ne se reproduisent plus.
- Les fichiers générés `apps/docs/build/**` ne sont pas versionnés dans ce rapport.
