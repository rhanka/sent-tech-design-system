# Un placeur serveur peut-il dimensionner les boîtes ?

ELK place des boîtes dont la taille dépend du texte. Un serveur Node n'a ni DOM
ni métriques de police *par défaut* — d'où la question : faut-il une table de
métriques versionnée, connue du placeur en nombres, ou le serveur peut-il
mesurer lui-même ?

Cette sonde tranche par la mesure, en comparant les deux moteurs sur les mêmes
chaînes, avec **le même fichier de police enregistré des deux côtés**.

## Résultat

Écart maximal **0,005 px** sur 10 chaînes et 3 corps (12, 14, 18 px), entre
`@napi-rs/canvas` côté Node et `measureText` côté Chromium. La mesure SVG
`getComputedTextLength` s'en écarte d'au plus 0,02 px.

**La table de métriques est donc une commodité, pas une nécessité** — à une
condition qui devient la vraie exigence : **le fichier de police doit être
épinglé et disponible au placeur**. Ce n'est pas une table de nombres qu'il faut
versionner, c'est une police. Sans la même fonte, l'accord disparaît et la table
redevient obligatoire.

## Portée de ce qui est mesuré

Largeurs d'avance, une seule police, sans chaîne de repli, sans `letter-spacing`
ni `font-feature-settings`. Dès que le texte utilise une fonte web avec repli, la
mesure serveur ne vaut que si le repli est identique des deux côtés.

## Usage

```bash
npm install
npm run measure:node
CHROMIUM_PATH=… npm run measure:browser
```

Les deux sorties se comparent chaîne à chaîne. `evidence/` conserve les relevés.
