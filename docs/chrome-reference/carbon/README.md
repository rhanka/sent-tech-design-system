# Carbon Chrome Reference

## Forme Cible

Carbon doit lire comme une documentation IBM Carbon :

- Masthead noir plein écran, hauteur 48px.
- Zone marque à gauche alignée sur la largeur de sidebar, 256px.
- Wordmark blanc `Carbon Design System` dans IBM Plex Sans.
- Navigation header horizontale, item actif par bordure bleue basse de 3px.
- Actions à droite sous forme de boutons carrés 48px, hover gris foncé.
- Sidebar gauche gris clair, arbre documentaire dense, item actif avec fond `#e0e0e0` et rail bleu `#0f62fe`.

## Assets

- `assets/carbon-wordmark.svg` : wordmark committable pour remplacer le placeholder actuel.

## Notes D'intégration

Le shell existant `ChromeCarbon.svelte` est déjà proche de cette structure. Les remplacements attendus sont surtout :

- remplacer le SVG placeholder de flamme par le wordmark du kit ;
- conserver la hauteur header 48px ;
- conserver la sidebar à 256px ;
- éviter les radius et cartes flottantes dans le chrome.
