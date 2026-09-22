# Pourquoi « xyflow échoue la CSP » était une mauvaise attribution

Le dossier portait l'énoncé « xyflow interactif ne passe PAS `style-src-attr 'none'`
(1 violation au load) », sans cause identifiée. Cette sonde trouve la cause. Ce
n'est pas xyflow.

## Bissection

Même CSP stricte, même témoin positif que `tools/csp-spike`, Chromium 151 :

| MiniMap | Interaction | Violations |
|---|---|---:|
| non | non | **0** |
| non | oui — glisser, molette, panoramique | **0** |
| oui | non | **1** `style-src-attr` |
| oui | oui | **1** |

Le canevas, les nœuds, les liaisons, le fond, les contrôles, le glisser et le
zoom passent tous à zéro violation. **MiniMap est la cause unique**, et elle la
produit sans qu'on touche à rien.

## La cause profonde

Le gabarit fautif, extrait du bundle, est `style="display: contents"`. Il ne
vient pas de xyflow mais du **compilateur Svelte** : quand un composant reçoit
une propriété CSS personnalisée, Svelte émet un élément enveloppe portant un
attribut `style` littéral, instancié par `innerHTML` — donc bloqué par
`style-src-attr 'none'`.

`repro-svelte/` le prouve sans xyflow, avec un composant trivial :

- `<Carte titre="…" />` → **0 violation**, aucune enveloppe ;
- `<Carte --st-fond="#cfe" titre="…" />` → **1 violation**, et l'attribut relevé
  dans le DOM est `display: contents; --st-fond: #cfe;`.

## Ce qu'il faut en retenir

L'incompatibilité n'appartient pas à xyflow, elle appartient à un **idiome
Svelte**. Tout composant, de n'importe quelle bibliothèque y compris les nôtres,
tombe sur le même mur dès qu'on lui passe une propriété CSS personnalisée.

Vérifié au moment de l'écriture : **aucun composant du design system ni la
documentation n'emploie cet idiome**. Nous ne sommes pas exposés — c'est un piège
à connaître, pas une dette à solder.

Conséquence pour le repli « v1 = SVG statique » : il était motivé par la CSP, et
**ce motif est réfuté**. Les motifs restants invoqués — simplicité, rendu serveur,
poids — et leurs mesures figurent au §12 de
[`docs/a0-csp-dependency-qualification.md`](../../docs/a0-csp-dependency-qualification.md).

## Rejouer

```bash
npm install
npm run bisect     # les quatre combinaisons
```

Comme les autres sondes, le pilote ne télécharge aucun navigateur ;
`PLAYWRIGHT_CORE` et `CHROMIUM_PATH` désignent le module et le binaire.
