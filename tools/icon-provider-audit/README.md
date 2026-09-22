# Audit des icônes de fournisseurs disponibles

Compte ce qui existe réellement, par fournisseur et par collection iconify, et
relève la licence déclarée de chaque collection.

## Pourquoi ce compte existe

Une attente formulée comme « un jeu d'icônes de fournisseurs à la manière de
draw.io » se vérifie par un nombre, pas par la présence d'un logo. Un fournisseur
peut être « présent » dans une collection tout en n'y ayant que sa marque, sans
aucune icône de service — auquel cas il n'est pas utilisable pour dessiner une
architecture.

Point de comparaison, relevé dans le dépôt draw.io : le stencil `mxgraph.aws4`
compte **1 050 formes**. Toute collection qui en offre quelques dizaines répond à
un autre besoin.

## Le compte ne dit rien des droits de marque

Les collections candidates sont en CC0 ou MIT. Le texte CC0 est explicite :

> No trademark or patent rights held by Affirmer are waived, abandoned,
> surrendered, licensed or otherwise affected by this document.

La licence couvre donc le fichier, pas l'usage de la marque. Les logos de
fournisseurs restent soumis aux conditions de leur propriétaire, distinctes de
la licence du pack. C'est la même structure que la clause de filigrane bpmn.io :
libre de copier, pas libre d'employer comme on veut.

## Usage

```bash
node count-provider-icons.mjs > evidence/$(date +%F)-iconify.json
```

Le script interroge l'API publique iconify. `evidence/` conserve les relevés
datés, parce que le contenu des collections évolue.
