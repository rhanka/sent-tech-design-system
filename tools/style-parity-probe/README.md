# Sonde de parité de style entre cibles d'export

Mesure **ce qu'une cible conserve réellement au rendu**, et non ce que sa
documentation annonce. Elle existe parce que l'exigence « la même carte se rend
avec exactement le même style sur toutes les cibles » ne peut pas s'arbitrer sur
des impressions : il faut savoir, propriété par propriété, laquelle survit.

## Méthode

Un style de carte plausible est poussé vers la cible, la cible rend, et les
propriétés sont relevées **sur la sortie produite**, pas sur l'entrée. Une
propriété qui n'apparaît pas dans le rendu est une propriété perdue, quelle que
soit la façon dont la cible la documente.

## Usage

```bash
npm install
npm run measure:mermaid
CHROMIUM_PATH=~/.cache/ms-playwright/chromium-<build>/chrome-linux64/chrome npm run measure:mermaid
```

`PLAYWRIGHT_CORE` désigne le module si celui de la racine du dépôt ne convient
pas. Aucun navigateur n'est téléchargé.

## Ce que la sonde a établi

mermaid conserve les neuf propriétés qui décrivent un rôle de texte et un
remplissage — famille, taille, graisse, couleur, alignement, remplissage, trait,
épaisseur, pointillés — et perd le **rayon d'angle**, qui n'y est pas une
propriété de style mais un choix de forme.

C'est le genre d'écart qui contraint la **forme** des tokens et pas seulement
leurs valeurs : un rayon doit alors être une énumération projetable sur un choix
de forme, pas un nombre continu.

## Ce qui manque

Le versant mxGraph n'est pas couvert : il demande un rendu draw.io vérifiable.
Tant qu'il manque, une matrice de capacités ne doit pas prétendre le couvrir.
