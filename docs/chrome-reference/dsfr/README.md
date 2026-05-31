# DSFR Chrome Reference

## Forme Cible

Le chrome DSFR doit reproduire la structure de documentation publique :

- Header blanc, bloc marque République Française à gauche.
- Titre `Système de Design de l'État` associé au bloc marque.
- Zone outils à droite avec lien d'information, version, contrôles Sent Tech et recherche.
- Barre de navigation horizontale sous le header, item actif souligné en Bleu France.
- Sidebar blanche, item actif en bloc bleu clair avec rail gauche Bleu France.
- Fil d'Ariane obligatoire au-dessus du contenu.

## Assets

- `assets/logo-rf-marianne.svg` : bloc marque vectoriel committable pour le chrome de référence.

## Notes D'intégration

Le shell existant `ChromeDsfr.svelte` est structurellement aligné. Les points de fidélité à préserver :

- header desktop à deux étages ;
- search group 40px avec bouton Bleu France ;
- nav horizontale soulignée, pas en pills ;
- sidebar active en fond `#e3e3fd` + rail 4px ;
- breadcrumb avant le contenu.
