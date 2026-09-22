# Comment porter un jeton jusqu'à un composant, sous CSP stricte

La sonde du dossier parent établit que passer une **propriété CSS personnalisée
à un composant** fait échouer `style-src-attr 'none'`. Or c'est l'idiome vers
lequel on tend naturellement quand on veut thématiser un composant par jeton.
Il fallait donc mesurer les chemins de remplacement, pas seulement nommer le
chemin interdit.

## Résultat mesuré

CSP stricte en en-tête, même politique que les autres sondes. A–D : Chromium 151 le 2026-09-20,
rejoués à l'identique en Chromium 153 le 2026-09-21 ; E, E' et témoin SVG : Chromium 153, 2026-09-21.

| Chemin | Violations | Enveloppe | Jeton appliqué |
|---|---:|---:|---|
| **A** — propriété CSS passée au composant | **1** | 1 `<svelte-css-wrapper>` | oui |
| **B** — variable posée sur un élément ancêtre (`style:--x={…}`) | **0** | 0 | oui |
| **C** — thématisation par classe | **0** | 0 | oui |
| **D** — CSSOM après montage (`setProperty`) | **0** | 0 | oui |
| **E** — même idiome qu'en A, dans l'espace de noms SVG | **0** | 0 (un `<g>`) | oui — `fill` calculé `rgb(204, 255, 238)` |
| **E'** — idem, peinture par règle CSS du composant au lieu de l'attribut `fill` | **0** | 0 (un `<g>`) | oui — `rgb(204, 255, 238)` |
| Témoin SVG — composant de E sans propriété CSS | **0** | 0 | non, repli `rgb(238, 238, 238)` : la lecture distingue bien jeton et repli |

**Les trois remplacements fonctionnent et appliquent bien le jeton.** Le chemin
interdit n'a donc aucune justification fonctionnelle : il n'apporte rien que B,
C ou D n'apportent.

Sur E, remesuré le 2026-09-21 (Chromium 153, preuve `../evidence/2026-09-21-chemins-jeton-svg.jsonl`) :
la première sonde lisait `backgroundColor` sur un `<rect>`, propriété qui vaut toujours
transparent en SVG. La propriété qui peint est `fill`. Lue correctement, elle vaut le jeton
(`#cfe`), et le témoin sans propriété CSS vaut le repli (`#eee`). Le compilateur émet `<g>` au
lieu de `<svelte-css-wrapper>` et y pose la variable **par CSSOM** après montage (`<g>` porte
ensuite `style="--st-fond: #cfe;"`, sans violation) : E fonctionne en rendu client.

Réserve, en rendu serveur : `svelte/server` sérialise ce même `<g>` avec un attribut `style`
littéral (`<g style="--st-fond: #cfe;">`, relevé par `run.sh`). Servi sous `style-src-attr 'none'`,
un tel attribut est bloqué à l'analyse du HTML — mécanisme mesuré pour xyflow en SSR dans
`tools/csp-spike/o3`. Pour E lui-même, le chargement SSR sous CSP n'est pas mesuré.

## La règle qui en découle

> Un composant destiné à tourner sous CSP stricte **ne reçoit pas ses jetons par
> propriété CSS personnalisée passée en attribut**. Il les reçoit par une
> variable posée sur un ancêtre, par une classe, ou par le CSSOM après montage.

Elle ne concerne pas les diagrammes : elle concerne **tout composant** écrit en
Svelte sous CSP stricte.

## Comment la rendre exécutoire

Les règles de `@sentropic/design-system-skills` s'appliquent au **DOM rendu**,
pas à la source. La forme naturelle est donc une règle qui signale tout élément
portant un attribut `style` littéral dans le rendu — ce qui attrape cette classe
de défaut, et les autres du même genre, sans avoir à reconnaître un idiome de
compilateur.

## Rejouer

```bash
cd .. && npm install && cd token-paths
PLAYWRIGHT_CORE=/chemin/node_modules/playwright-core/index.js CHROMIUM_PATH=/chemin/chromium ./run.sh
```

Une ligne JSON par variante, puis le HTML rendu serveur des variantes A et E. La variante A,
qui doit produire une violation, tient lieu de témoin positif dans le même run.
