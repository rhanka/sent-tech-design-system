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

Le spot-check CLI retourne le code `1`, attendu parce que des findings sont présents. Sur `compare.html`, le résumé CLI est : 40 findings, `high:38 medium:0 low:2`, `score:0/100`.

## Résultat global

| Mesure | Valeur |
|---|---:|
| Pages auditées | 85 |
| Règles actives | 25 |
| Findings totaux | 622 |
| High | 580 |
| Medium | 10 |
| Low | 32 |

### Répartition par règle

| Règle | Findings |
|---|---:|
| `no-em-dash` | 409 |
| `no-bare-hex` | 86 |
| `single-font` | 85 |
| `status-indicator-label` | 32 |
| `line-length-cap` | 10 |
| 19 autres règles actives | 0 |

Lecture : le passage à 25 règles expose une dette de statut encore visible (`status-indicator-label`) sans créer de bruit sur les règles structurelles restantes. La dette `h1-inline-badge` est ramenée à 0 par la sortie des badges de statut hors des H1 des pages composants. Les findings dominants restent éditoriaux/fondation : tirets cadratins de microcopy, hex dans certains blocs `<style>`, single-font global, indicateurs de statut sans libellé et rares blocs texte longs.

## Pages les plus signalées

| Page | Findings | Règles dominantes |
|---|---:|---|
| `compare.html` | 40 | `no-em-dash` 35, `no-bare-hex` 2, `status-indicator-label` 2, `single-font` 1 |
| `components/streaming-message.html` | 32 | `no-em-dash` 30, `no-bare-hex` 1, `single-font` 1 |
| `components/progress-indicator.html` | 22 | `status-indicator-label` 19, `line-length-cap` 1, `no-bare-hex` 1, `single-font` 1 |
| `components/menu-popover.html` | 21 | `no-em-dash` 18, `line-length-cap` 1, `no-bare-hex` 1, `single-font` 1 |
| `components/force-graph.html` | 20 | `no-em-dash` 17, `line-length-cap` 1, `no-bare-hex` 1, `single-font` 1 |
| `components/header.html` | 20 | `no-em-dash` 17, `line-length-cap` 1, `no-bare-hex` 1, `single-font` 1 |
| `components/input.html` | 20 | `no-em-dash` 18, `no-bare-hex` 1, `single-font` 1 |

## Exemples de findings

| Page | Règle | Localisation | Message |
|---|---|---|---|
| `compare.html` | `single-font` | `head/style \| inline-style` | Une seule famille typographique principale est détectée. |
| `compare.html` | `no-bare-hex` | `head > style[2]` | Détection de couleurs hexadécimales dans un bloc `<style>`. |
| `compare.html` | `no-bare-hex` | `head > style[4]` | Détection de couleurs hexadécimales dans un bloc `<style>`. |
| `compare.html` | `no-em-dash` | `h1[text=Banc de fidélité — notre...]` | Em dash détecté dans la copy. |
| `compare.html` | `status-indicator-label` | `span.st-toggle__state` | Indicateur de statut sans libellé explicite. |
| `components/menu-popover.html` | `line-length-cap` | paragraphe dense | Bloc texte long sans borne de largeur explicite. |

## Synthèse opérationnelle

- WP8 est maintenant au palier demandé : 25 règles actives, avec traçabilité `rule -> principle -> finding WP7`.
- WP11 dogfooding confirme que le ruleset s'exécute sur le vrai build docs et produit des findings exploitables.
- La dette `h1-inline-badge` issue des nouvelles règles est corrigée sur les pages composants; `status-indicator-label` reste couvert par fixtures dédiées et ouvert.
- La dette détectée prioritaire reste éditoriale et fondation globale : réduire les `—`, supprimer les hex restants, introduire une vraie hiérarchie typographique display/body, libeller les indicateurs de statut, puis borner les rares blocs de texte longs.

## Limites

- L'audit est statique via `jsdom`; il ne remplace pas une passe navigateur avec styles calculés et viewports.
- Les warnings Svelte restants du build portent sur les charts SVG focusables, les slots Svelte legacy de `ChatComposer`, deux sélecteurs CSS inutilisés et `aria-invalid` sur `Radio`; les warnings d'ancres manquantes ne se reproduisent plus.
- Les fichiers générés `apps/docs/build/**` ne sont pas versionnés dans ce rapport.
