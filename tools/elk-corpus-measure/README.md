# Mesure de lisibilité atteignable d'une scène ELK

Répond à une question précise : **une scène peut-elle atteindre un plancher de
lisibilité par le placement, ou est-ce géométriquement impossible ?**

La distinction compte, parce que les deux cas appellent des remèdes opposés.
Une scène qui échoue par gaspillage d'espace se corrige en réglant le placement.
Une scène dont les cartes font deux fois l'aire du cadre ne se corrige pas du
tout par le placement : il faut décider de la découper, et c'est un arbitrage,
pas un réglage.

## Ce qui est calculé

Pour chaque vue, à partir de l'entrée ELK sérialisée telle que le placeur la
consomme :

- **occupation** — aire cumulée des cartes rapportée à la boîte produite par
  ELK. Invariante à l'échelle, donc comparable d'une vue à l'autre.
- **échelle ajustée** — facteur appliqué pour faire tenir la boîte dans le cadre.
- **plafond d'empaquetage** — échelle qu'on obtiendrait si les cartes étaient
  collées bord à bord, sans aucun espacement. `√(aire du cadre / aire des cartes)`.
  **Un plafond inférieur à 1 signifie que les cartes ne tiennent pas dans le
  cadre, quel que soit le placement.**
- **police source requise** pour rendre un plancher donné, à l'échelle ajustée
  puis au plafond. Cette formulation ne dépend pas de la typographie réelle des
  cartes, donc elle se vérifie sans connaître la chaîne qui a produit la scène.

Le plafond d'empaquetage ignore les couloirs de routage et l'écart de rapport
d'aspect : c'est une borne inatteignable. Elle sert à écarter l'impossible, pas
à fixer un objectif.

## Usage

```bash
npm install
CORPUS=/chemin/vers/le/corpus npm run measure
# ou
node measure.mjs /chemin/vers/le/corpus
```

Le dossier doit contenir un `*.elk.json` par vue, chacun exposant `elkInput`,
le graphe exact passé à `elk.layout`. Le cadre de référence est 1 440 × 900,
zone ratifiée par le design system.

`evidence/` conserve les runs datés.
