# Lot A0 — harnais de mesure CSP (elkjs, bpmn-js)

Ce harnais mesure, dans un navigateur réel, ce que des dépendances de diagramme
font sous la CSP stricte visée par le design system. Il existe parce que le
spike xyflow qui l'a précédé n'a laissé au dépôt que sa conclusion, sans fixture
ni journal : sa mesure n'était pas rejouable, donc pas contestable.

## Ce qui est mesuré

La CSP est servie **en en-tête HTTP**, pas en `<meta>` : une CSP en balise ne
couvre pas les mêmes cas et n'aurait pas la même valeur de preuve. Les
violations sont captées côté page par `securitypolicyviolation`, et les erreurs
console sont relevées en parallèle par le pilote.

Politique appliquée par `serve-and-measure.mjs` :

```
default-src 'self'; script-src 'self'; style-src 'self'; style-src-attr 'none';
img-src 'self' data:; font-src 'self' data:; connect-src 'self';
worker-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'
```

`worker-src 'none'` et l'absence d'`unsafe-eval` ne sont pas décoratifs : ils
transforment « la bibliothèque n'a pas l'air d'ouvrir de worker ni d'évaluer du
code » en preuve d'exécution.

## Le témoin positif est obligatoire

`control.html` applique un style des deux façons : par `setAttribute('style', …)`
et par écriture CSSOM. La première **doit** produire une violation
`style-src-attr` et ne pas s'appliquer ; la seconde doit s'appliquer.

Un run où le témoin ne signale rien est un run invalide, quels que soient les
autres résultats : il veut dire que le harnais ne détecte pas les violations,
pas que les pages en sont exemptes. On ne lit jamais les autres pages avant
d'avoir lu le témoin.

## Les pages

| Page | Ce qu'elle exerce |
|---|---|
| `control.html` | témoin positif et négatif (voir ci-dessus) |
| `elk.html` | elkjs `elk.bundled.js`, layered, groupes imbriqués, rendu SVG à classes |
| `bpmn.html` | bpmn-js Viewer : import XML, fit-viewport, relevé du filigrane bpmn.io |
| `bpmn-modeler.html` | bpmn-js Modeler sur le chemin interactif : sélection, `appendShape`, `directEditing`, `saveXML` |
| `focus.html` | couture Focus : consomme une vue **déjà placée** (`public/placed-view.json`), sans embarquer de placeur |

`server-layout.mjs` produit cette vue placée en Node, hors navigateur. C'est la
moitié serveur de la démonstration « Focus consomme, il ne calcule pas ».

## Rejouer

```bash
npm install                 # elkjs et bpmn-js sont épinglés exactement
npm run spike               # placement serveur, build, puis mesure
```

Le pilote ne télécharge aucun navigateur. Il prend `playwright-core` à la racine
du dépôt et, si le binaire par défaut n'est pas celui installé, on le désigne :

```bash
PLAYWRIGHT_CORE=/chemin/node_modules/playwright-core/index.js \
CHROMIUM_PATH=~/.cache/ms-playwright/chromium-<build>/chrome-linux64/chrome \
npm run measure
```

La sortie est un JSON : politique appliquée, version du navigateur, et par page
le résultat fonctionnel, les violations et les erreurs console.

## Preuves conservées

`evidence/` garde les runs datés, avec la version exacte de Chromium. Un
résultat sans version de navigateur ne vaut rien : la CSP est implémentée par le
navigateur, et son comportement bouge.

Portée de ce qui est mesuré ici : Chromium seul, rendu par défaut des
bibliothèques, sans thème ni extension du design system. Nos propres extensions
peuvent réintroduire des violations — c'est notre code qu'il faudra remesurer,
pas le leur.

## O3 — poids, premier rendu et SSR du repli « SVG statique »

Extension du harnais pour instruire le repli v1 « SVG statique » face aux moteurs
interactifs, maintenant que la CSP ne le justifie plus (§10 du dossier A0). Même CSP,
même témoin positif, même pilote ; le détail des résultats est au §12 du dossier.

```bash
npm ci
TMPDIR=$HOME/pw-tmp \
PLAYWRIGHT_CORE=/chemin/node_modules/playwright-core/index.js \
CHROMIUM_PATH=/snap/bin/chromium \
npm run o3            # RUNS=30 et SSR_RUNS=30 par défaut
```

Une seule commande enchaîne :

1. `o3/scene.mjs` — scènes déterministes (35 et 200 nœuds), placées par elkjs **en Node** ;
   la même vue placée alimente tous les candidats, et le BPMN (DI comprise) en est dérivé ;
2. build de production Vite (une entrée HTML par candidat, CSS découpée par page), puis build SSR ;
3. `o3/ssr.mjs` — rendu serveur `svelte/server` (repli statique, xyflow), bpmn-js en Node nu
   et sous jsdom (processus isolés), placement elkjs en Node ; écrit les pages SSR à hydrater ;
4. `o3/browser.mjs` — Chromium, CSP en en-tête : témoin positif, poids réellement chargé
   (réponses réseau, pesées brut et gzip niveau 6), puis `RUNS` tours de premier rendu, ordre
   mélangé à chaque tour, contexte neuf (cache vide) à chaque exécution ; pages SSR chargées
   aussi sans JavaScript et sans CSP (témoins) ;
5. `o3/run.mjs` — preuve datée `evidence/<date>-o3-chromium-<version>.json` (machine,
   versions, échantillons bruts) et résumé Markdown sur la sortie standard.

| Page (`o3/pages/`) | Candidat |
|---|---|
| `static-vanilla` | repli statique, rendu DOM sans framework (plancher) |
| `static-svelte` | repli statique, composant `StaticScene.svelte` |
| `ssr-static` | le même, rendu serveur puis hydraté |
| `elk-client` | placeur embarqué : elkjs place dans le navigateur, puis même rendu |
| `xyflow` | `@xyflow/svelte`, configuration CSP-sûre (sans MiniMap) |
| `ssr-xyflow`, `-sized`, `-sized-handles` | xyflow rendu serveur : par défaut, avec dimensions, avec dimensions et poignées |
| `bpmn-viewer`, `bpmn-modeler` | bpmn-js |
| `svelte-empty` | page Svelte vide, pour isoler le coût marginal d'un composant |

Chronométrage (`o3/src/common.js`), en ms depuis le début de navigation : `tReady` quand
la scène est complète dans le DOM, mise en page forcée ; `tRender` = `tReady` moins l'appel
du moteur (données déjà chargées). Pour xyflow, « complète » veut dire tous les nœuds mesurés
et visibles, toutes les arêtes tracées, `fitView` appliqué — observé par `MutationObserver`,
donc sans quantification par les trames. Serveur local : le poids n'intervient pas dans le
temps mesuré ici.
