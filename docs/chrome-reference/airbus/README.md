# Airbus Chrome Reference

## Forme Cible

Le chrome Airbus doit rester plus sobre et plus produit que Carbon/DSFR :

- Header blanc de 64px avec filet bas corporate navy `#00205B`.
- Logo Airbus officiel à gauche, rendu à 28-32px de haut.
- Navigation header horizontale, item actif par bordure basse navy de 3px.
- Actions à droite compactes, contrôles bordés en gris clair.
- Sidebar blanche avec active item en bleu clair `#E3F2FD` et rail navy 3px.
- Fil d'Ariane présent au-dessus du contenu, séparateur `/`.

## Assets Versionnés

Les logos Airbus utilisés par le chrome docs sont versionnés après décision de redistribution locale (2026-05-31).

Assets docs :

- `apps/docs/static/chrome/airbus/logo.svg`
- `apps/docs/static/chrome/airbus/logo-dark.svg`
- `apps/docs/static/chrome/airbus/logo-white.svg`

Sources :

- `/home/antoinefa/src/airbus-design-system/packages/design-tokens/assets/airbus_dark.svg`
- `/home/antoinefa/src/airbus-design-system/packages/design-tokens/assets/airbus.svg`

## Notes D'intégration

Le shell `ChromeAirbus.svelte` consomme `logo-white.svg` pour le header navy. Les futures retouches doivent préserver la structure actuelle (header navy, wordmark blanc, navigation horizontale, sidebar active avec rail) et ne remplacer les assets que si une référence validée est fournie.
