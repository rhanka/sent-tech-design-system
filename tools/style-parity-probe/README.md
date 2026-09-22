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
npm run measure:shadow      # ombre portée : classDef, look neo, sans CSP puis sous CSP stricte
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

## Ombre portée (`measure:shadow`)

Mesuré le 2026-09-21, mermaid 11.17.2, Chromium 153, `securityLevel: 'strict'`, preuve
`evidence/2026-09-21-mermaid-ombre.json`. La page est servie deux fois : sans CSP, puis sous
la CSP stricte du harnais A0 en en-tête. L'ombre est jugée sur les pixels : luminance d'une
bande de 4 px juste à droite et sous un nœud (fond blanc = 255), en ligne et dans un `<img>`.

- `classDef … filter:drop-shadow(…)` : **erreur d'analyse**, avec ou sans virgules
  échappées, et de même `filter:url(#…)`. La grammaire de `classDef` refuse la parenthèse
  (jeton `PS`) : aucune fonction CSS n'y passe.
- `classDef … box-shadow:…` : accepté, émis en attribut `style` sur la forme (`!important`),
  calculé par le navigateur, **aucun pixel peint** (bandes à 255, identiques au témoin) :
  `box-shadow` ne peint pas une forme SVG.
- look `neo`, sans `classDef` : ombre **peinte** (bandes à 226–238), portée par une règle
  `filter: drop-shadow(1px 2px 2px rgba(185, 185, 185, 1))` dans l'élément `<style>` du SVG.
- Sous CSP stricte, SVG inséré dans la page : l'élément `<style>` du SVG est bloqué par
  `style-src-elem`, les attributs `style` par `style-src-attr` ; plus d'ombre, et même le
  remplissage de `classDef` est perdu. Le même SVG servi comme image (`<img>`, `data:`)
  garde l'ombre du look `neo` sous la même CSP.

## Ce qui manque

Le versant mxGraph n'est pas couvert : il demande un rendu draw.io vérifiable.
Tant qu'il manque, une matrice de capacités ne doit pas prétendre le couvrir.
