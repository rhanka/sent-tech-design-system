# WP11 — Dogfooding `design check` sur la documentation Sent Tech

Date : 2026-05-31  
Branche : `codex-wp8-wp11-design-dogfooding`  
Moteur : `@sentropic/design-system-skills` local, 15 règles actives

## Cadrage

Objectif : exécuter le ruleset WP8 sur des pages réelles de notre documentation générée, puis consigner les résultats sans modifier les pages `apps/docs`.

Périmètre audité :

- Build statique complet : `npm run build`, sortie `apps/docs/build`.
- 85 pages HTML réelles sous `apps/docs/build`, hors `404.html`.
- Spot-check CLI : `node packages/skills/dist/cli.js check apps/docs/build/compare.html --tech`.
- Agrégation full-site : API `audit({ kind: "file" })` sur chaque fichier HTML généré, avec le même `defaultRules`.

Le spot-check CLI retourne le code `1`, attendu parce que des findings sont présents. Sur `compare.html`, le résumé CLI est : 29 findings, `high:29 medium:0 low:0`.

## Résultat global

| Mesure | Valeur |
|---|---:|
| Pages auditées | 85 |
| Règles actives | 15 |
| Findings totaux | 582 |
| High | 572 |
| Medium | 10 |
| Low | 0 |

### Répartition par règle

| Règle | Findings |
|---|---:|
| `no-em-dash` | 401 |
| `no-bare-hex` | 86 |
| `single-font` | 85 |
| `line-length-cap` | 10 |
| `side-tab-on-rounded` | 0 |
| `touch-target-44` | 0 |
| `heading-hierarchy` | 0 |
| `underline-hardcoded-border` | 0 |
| `cramped-padding` | 0 |
| `motion-subtle` | 0 |
| `padding-scale-token` | 0 |
| `rail-vs-radius-consistency` | 0 |
| `grid-variance` | 0 |
| `contrast-token-pair` | 0 |
| `typography-scale-token` | 0 |

Lecture : les nouvelles règles WP8 ne remontent pas de régression sur le HTML statique généré. Les findings restants proviennent surtout de dette documentaire déjà visible : tirets cadratins de microcopy, hex dans certains blocs `<style>`, single-font global, et quelques blocs texte longs.

## Pages les plus signalées

| Page | Findings | Règles dominantes |
|---|---:|---|
| `components/streaming-message.html` | 33 | `no-em-dash` 31, `no-bare-hex` 1, `single-font` 1 |
| `compare.html` | 29 | `no-em-dash` 26, `no-bare-hex` 2, `single-font` 1 |
| `components/menu-popover.html` | 21 | `no-em-dash` 18, `line-length-cap` 1, `no-bare-hex` 1, `single-font` 1 |
| `components/force-graph.html` | 20 | `no-em-dash` 17, `line-length-cap` 1, `no-bare-hex` 1, `single-font` 1 |
| `components/header.html` | 20 | `no-em-dash` 17, `line-length-cap` 1, `no-bare-hex` 1, `single-font` 1 |
| `components/input.html` | 20 | `no-em-dash` 18, `no-bare-hex` 1, `single-font` 1 |
| `components/button.html` | 19 | `no-em-dash` 17, `no-bare-hex` 1, `single-font` 1 |

## Exemples de findings

| Page | Règle | Localisation | Message |
|---|---|---|---|
| `compare.html` | `single-font` | `head/style \| inline-style` | Une seule famille typographique principale est détectée. |
| `compare.html` | `no-bare-hex` | `head > style[2]` | Détection de couleurs hexadécimales dans un bloc `<style>`. |
| `compare.html` | `no-bare-hex` | `head > style[4]` | Détection de couleurs hexadécimales dans un bloc `<style>`. |
| `compare.html` | `no-em-dash` | `h1[text=Banc de fidélité — notre...]` | Em dash détecté dans la copy. |
| `components/menu-popover.html` | `line-length-cap` | paragraphe dense | Bloc texte long sans borne de largeur explicite. |

## Synthèse opérationnelle

- WP8 est maintenant au palier demandé : 15 règles actives, avec traçabilité `rule -> principle -> finding WP7`.
- WP11 dogfooding confirme que le ruleset s'exécute sur le vrai build docs et produit des findings exploitables.
- Les nouvelles règles ajoutées ne créent pas de bruit sur le build docs actuel ; elles restent couvertes par fixtures dédiées.
- La dette détectée prioritaire reste éditoriale et fondation globale : réduire les `—`, supprimer les hex restants, introduire une vraie hiérarchie typographique display/body, puis borner les rares blocs de texte longs.

## Limites

- L'audit est statique via `jsdom`; il ne remplace pas une passe navigateur avec styles calculés et viewports.
- Les warnings Svelte du build sur ancres manquantes (`/#legal`, `/#privacy`, `/compare#cmp`, `/components/tile#tile`) sont hors périmètre de ce job et n'ont pas été modifiés.
- Les fichiers générés `apps/docs/build/**` ne sont pas versionnés dans ce rapport.
