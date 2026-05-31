# Airbus Chrome Reference

## Forme Cible

Le chrome Airbus doit rester plus sobre et plus produit que Carbon/DSFR :

- Header blanc de 64px avec filet bas corporate navy `#00205B`.
- Logo Airbus officiel à gauche, rendu à 28-32px de haut.
- Navigation header horizontale, item actif par bordure basse navy de 3px.
- Actions à droite compactes, contrôles bordés en gris clair.
- Sidebar blanche avec active item en bleu clair `#E3F2FD` et rail navy 3px.
- Fil d'Ariane présent au-dessus du contenu, séparateur `/`.

## Assets Privés

Les logos Airbus ne sont pas committés.

Copies locales préparées :

- `/tmp/sent-tech-wp14-chrome-private/airbus/logo.svg`
- `/tmp/sent-tech-wp14-chrome-private/airbus/logo-inverse.svg`

Sources :

- `/home/antoinefa/src/airbus-design-system/packages/design-tokens/assets/airbus_dark.svg`
- `/home/antoinefa/src/airbus-design-system/packages/design-tokens/assets/airbus.svg`

## Notes D'intégration

Le shell existant `ChromeAirbus.svelte` contient encore un placeholder. Pour l'implémentation chrome, remplacer uniquement le visuel par l'asset privé local et garder les assets Airbus dans une zone gitignorée ou hors repo. Ne pas écrire le logo Airbus officiel dans un fichier committable.
