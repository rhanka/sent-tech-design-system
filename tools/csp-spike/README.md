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
