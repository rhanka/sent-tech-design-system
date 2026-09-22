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
PLAYWRIGHT_CORE=/chemin/vers/node_modules/playwright-core/index.js \
CHROMIUM_PATH=/snap/bin/chromium \
npm run o3
```

Les valeurs ci-dessus sont des exemples, ceux de la mesure consignée. `CHROMIUM_PATH`
désigne n'importe quel Chromium. Avec le Chromium en snap, `TMPDIR` doit pointer sous
`$HOME` : le confinement snap ne voit pas le `/tmp` de l'hôte, où playwright-core crée
le profil du navigateur. `PLAYWRIGHT_CORE` vaut par défaut `node_modules/playwright-core`
à la racine du dépôt.

Variables :

| Variable | Défaut | Rôle |
|---|---|---|
| `RUNS` | 30 | tours de premier rendu |
| `SSR_RUNS` | 30 | rendus serveur chronométrés par cas |
| `ELK_COLD_RUNS` | 10 | processus neufs pour le placement elkjs à froid |
| `O3_OUT` | `evidence/<date>-o3-chromium-<version>.json` | chemin de la preuve ; à fixer pour rejouer sans écraser la preuve suivie du même jour |
| `O3_VERBOSE` | 1 | progression sur la sortie d'erreur (`0` pour la couper) |

Version de Node : jsdom 30.1.1 et ses dépendances `@asamuzakjp/*` déclarent
`node ^22.22.2 || ^24.15.0 || >=26.0.0`. La mesure consignée a tourné en Node 22.22.1 :
`npm ci` émet un avertissement `EBADENGINE`, sans erreur, et jsdom n'intervient que dans
l'essai bpmn-js sous DOM émulé.

Une seule commande enchaîne :

1. `o3/scene.mjs` — scènes déterministes (35 et 200 nœuds), placées par elkjs **en Node** ;
   la même vue placée fournit à tous les candidats les positions des nœuds, et le BPMN
   (DI comprise) en est dérivé ;
2. build de production Vite (une entrée HTML par candidat, CSS découpée par page), puis build SSR ;
3. `o3/ssr.mjs` — rendu serveur `svelte/server` (SVG statique, xyflow), bpmn-js en Node nu
   et sous jsdom (processus isolés), placement elkjs en Node ; écrit les pages SSR à hydrater ;
4. `o3/browser.mjs` — Chromium, CSP en en-tête : témoin positif, poids chargé (réponses
   réseau hors document HTML et données de scène, pesées brut et gzip niveau 6), puis
   `RUNS` tours de premier rendu, ordre mélangé à chaque tour, contexte neuf (cache vide)
   à chaque exécution ; pages SSR chargées aussi sans JavaScript et sans CSP (témoins) ;
5. `o3/run.mjs` — preuve datée (machine, versions, échantillons bruts) et résumé Markdown
   sur la sortie standard.

Pages, par ordre alphabétique :

| Page (`o3/pages/`) | Candidat |
|---|---|
| `bpmn-modeler`, `bpmn-viewer` | bpmn-js |
| `control` | témoin positif CSP |
| `elk-client` | elkjs place dans le navigateur, puis même rendu SVG que `static-vanilla` |
| `ssr-static` | SVG statique, composant Svelte rendu serveur puis hydraté (données inline) |
| `ssr-xyflow`, `-sized`, `-sized-handles` | xyflow rendu serveur : par défaut, avec dimensions, avec dimensions et poignées |
| `static-svelte` | SVG statique, composant `StaticScene.svelte` |
| `static-vanilla` | SVG statique, rendu DOM sans framework ni runtime |
| `svelte-empty` | référence : page Svelte vide, runtime seul, pour isoler le coût marginal d'un composant |
| `xyflow` | `@xyflow/svelte`, configuration CSP-sûre (sans MiniMap) |

Chronométrage (`o3/src/common.js`), en ms depuis le début de navigation :

- `tReady` : scène complète dans le DOM, mise en page forcée. Pour les pages hors xyflow,
  pris dès que le rendu est terminé, sans attendre de trame. xyflow n'est complet qu'après au
  moins une trame : il mesure ses nœuds par `ResizeObserver`, puis applique `fitView`. Le
  `MutationObserver` qui détecte cette complétude n'ajoute pas d'attente de trame, mais la
  complétude elle-même en dépend : les deux définitions diffèrent d'autant.
- `tPainted` : deux `requestAnimationFrame` après `tReady`, pris de la même façon pour
  tous ; quantifié par les trames (~16,7 ms).
- `tRender` : `tReady` moins l'appel du moteur (données déjà chargées).

Serveur local : le transfert n'entre pas dans les temps. L'analyse et la compilation du
JS chargé, elles, y entrent.
