# Contrat d'alignement du header commun Sent Tech

Perimetre: contrat visuel et fonctionnel du header partage entre toutes les surfaces Sent Tech (site principal, design system docs, Sentropic, NC, et tout produit a venir). Cible une experience uniforme avec `www.sent-tech.ca` plutot que des familles separees `site public` vs `app shell`.

## Decisions de cadrage

| Sujet            | Decision                                                                 |
|------------------|--------------------------------------------------------------------------|
| Famille          | Un seul contrat commun. Pas de variante `app shell` pour l'instant.      |
| Reference visuelle | Etat blanc de `sent-tech.ca/#blog`. Le hero transparent est une variation de fond, pas une autre famille. |
| Logo             | Logo SENT officiel uniforme partout. La sous-marque produit (`Design System`, `Sentropic`, `NC`) apparait en breadcrumb ou sous-titre discret hors header, pas dans le logo lui-meme. |
| Favicon          | `SENT-logo-squared.svg` sur toutes les surfaces. Pas de favicon dedie par produit. |
| Zone droite      | `Langue` visible partout. `Connexion` uniquement sur les surfaces avec authentification. |
| Burger mobile    | Toujours à droite (validé). Uniforme sur toutes les surfaces publiques et applicatives. Les rails applicatifs latéraux (ex: NC) sont ouverts par un contrôle interne à la page. |
| Nav centrale     | Contextuelle par surface. Seuls le pattern visuel (typo, espacement, alignement, hover) et le slot horizontal sont partages. Libelles par surface a valider. |

## Anatomie

Trois zones horizontales:

1. `Gauche` - logo SENT + sous-titre produit. Cliquable, ramene au point d'entree du produit.
2. `Centre` - nav contextuelle horizontale. Les libelles dependent du produit.
3. `Droite` - utilitaires: langue, version optionnelle, lien externe principal, connexion si applicable.

En desktop, les trois zones s'alignent sur une seule ligne. En mobile, le centre se replie dans le menu deroule par le burger a droite, la zone droite reste accessible si possible (au moins la langue).

## Tokens et metriques

- Hauteur standard desktop: `5rem` (80px). Variable: `--sent-header-height`. Aligne sur `www.sent-tech.ca` (`h-20` Tailwind). Le docs actuel est a `4rem` et doit migrer.
- Hauteur standard mobile (<640px): `4rem` (64px) si la nav centrale tient encore en haut, sinon header en flux normal (`position: static`) et hauteur naturelle.
- Padding horizontal: `1.5rem` desktop, `1rem` mobile.
- Fond `sticky-blanc`: `rgb(255 255 255 / 0.96)` avec `border-bottom: 1px solid var(--sent-border-subtle, #e2e8f0)`.
- Fond `hero-transparent`: transparent jusqu'au depart du hero, transition `background-color 200ms ease` au scroll vers `sticky-blanc`. Le contour, la typo et le layout restent identiques.
- z-index header: `30` minimum, doit rester au-dessus des contenus de page et en-dessous des overlays modaux.

## Logo

Structure standard, uniforme sur toutes les surfaces:

```
[Logo SENT officiel]
```

- Asset: `SENT-logo.svg` (wordmark complet) ou `SENT-logo.png` selon dispo locale, hauteur `2rem` desktop / `1.75rem` mobile.
- Sur fond transparent du hero (variante `hero-transparent`), filtre `brightness(0) invert(1)` pour passer en blanc; sur fond `sticky-blanc`, couleur native.
- Le logo est dans un `<a>` qui pointe vers le point d'entree du produit local.
- **Intégrité Visuelle du Logo** : Il est strictement interdit d'appliquer un rognage arrondi (`border-radius`) ou un recadrage sur l'icône ou le wordmark de marque SENT. Le logo conserve ses proportions rectangulaires ou carrées d'origine sans aucune altération de ses angles.
- **Pas de sous-titre produit dans le header**: la sous-marque (`Design System`, `Sentropic`, `NC`) apparait dans le breadcrumb directement sous le header ou dans le titre de page, jamais accole au logo. Le but est que toutes les surfaces aient un header visuellement identique au niveau brand.

### Favicon

`SENT-logo-squared.svg` sur toutes les surfaces, declare via `<link rel="icon" href="/SENT-logo-squared.svg" type="image/svg+xml" />` dans le `app.html` / `index.html` correspondant. Pas de favicon `Design System` ou `Sentropic` dedie.

## Nav centrale

- **Pattern de style strict (Validé)** :
  - **Forme** : Style strictement carré, sans aucun arrondi (`border-radius: 0`).
  - **État Sélectionné / Actif** : L'item sélectionné est mis en valeur de manière élégante par un **soulignement** (bordure inférieure d'accent colorée de 2px, `border-bottom: 2px solid var(--st-semantic-action-accent, #2563eb)`).
  - Hover : Léger fond translucide `--sent-surface-subtle` sans arrondi.
- Largeur des libelles: courts, un seul mot ou deux quand possible.
- Le contenu de la nav est defini par chaque surface. Pas de cross-link inter-produits dans la nav centrale au moment de ce contrat - eventuellement ajoute plus tard via un dropdown `Produits SENT` dans la zone droite.

Inventaire actuel des nav centrales par surface (etat 2026-05):

| Surface                | Items                                                                 |
|------------------------|-----------------------------------------------------------------------|
| `www.sent-tech.ca`     | Services, Secteurs, Valeurs, Blog, A propos, Contact                  |
| `design-system.sent-tech.ca` | Fondations, Composants, Tokens, Themes, Contrats                  |
| `top-ai-ideas.sent-tech.ca` (Sentropic) | Accueil, Dossiers, Organisations, Cas d'usage, Matrice, Tableau de bord |
| `nc.sent-tech.ca`      | Defini par l'application (sections internes).                          |

## Zone droite

Ordre canonique de gauche a droite:

1. `Version` (optionnel) - badge compact pour les surfaces qui exposent un numero de version pertinent (Design System, Sentropic).
2. `Liens utilitaires externes` (optionnels) - typiquement un lien vers le site principal et/ou GitHub.
3. `Langue` (obligatoire) - Sélecteur sous forme de menu popover dropdown (Globe + Chevron) assurant l'évolutivité multi-langues. Visible sur toutes les surfaces.
4. `Connexion / Compte` (conditionnelle) - Système orienté **icône dynamique + menu popover** (sans label textuel visible dans le header). 
   *   **Icône dynamique** : Varie selon l'état d'authentification (ex: icône `User` standard si non connecté ; avatar/pastille utilisateur avec badge check ou pastille d'activité si connecté).
   *   **Popover de compte** : Au clic sur l'icône, déploie un popover contenant les actions contextuelles (ex: "Se connecter", "S'inscrire" si anonyme ; "Mon profil", "Administration", "Se déconnecter" si connecté).
   *   **Accessibilité (A11y)** : Un label au survol (`aria-label` et `title` dynamiques : "Se connecter" ou "Mon compte (Connecté)") est obligatoire.

Pas de slot vide quand `Connexion` n'est pas applicable: l'espace est repris par les autres elements.

## Burger mobile

- Position: toujours a droite, alignee verticalement au logo.
- Icone: `Menu` Lucide, `aria-label="Menu"` localise.
- Ouverture: drawer plein ecran ou panneau deroulant sous le header. Contenu: la nav centrale + les utilitaires droits en pile verticale.
- Pas de second burger ou de toggle gauche. Un futur rail applicatif lateral serait declenche par un bouton dans la page, pas par un element du header.

## Variations de fond

- `sticky-blanc` (defaut) - fond blanc opaque, applique sur toutes les pages sauf eventuellement le tout debut d'un hero plein bord.
- `hero-transparent` (optionnel) - fond transparent par-dessus le hero. Transition vers `sticky-blanc` au scroll, declenchee via un observer sur le bord bas du hero ou via `IntersectionObserver`. Pas une autre famille de header, seulement une couche de fond differente.
- L'utilisation de `hero-transparent` est limitee au site principal et eventuellement aux pages marketing futures. Les surfaces applicatives gardent `sticky-blanc`.

## Responsive

- `>= 920px`: layout trois zones complet.
- `640px <= largeur < 920px`: la nav centrale peut se compresser ou se replier dans le burger selon densite. La zone droite garde au moins `Langue` visible.
- `< 640px`: header en flux normal (`position: static`), logo + burger visibles, le reste dans le menu deroule.

## Questions encore ouvertes

A trancher avant implementation:

- Burger mobile : Validé (Toujours à droite).
- Libelles de nav centrale par surface: valider l'inventaire actuel ou ajuster (par exemple harmoniser `A propos` / `About`, ordre, regroupements).

## Hors perimetre

- Cross-linking inter-produits via la nav centrale.
- Header "small" pour applications gourmandes.
- Personnalisation tenant white-label du header lui-meme.

Ces points pourront etre adresses dans des avenants ulterieurs.

## Sources et fichiers de reference

- Design system docs: `apps/docs/src/routes/+layout.svelte`, `apps/docs/src/app.css`.
- Sentropic: `../sentropic/ui/src/lib/components/Header.svelte`.
- NC: `../nc-fullstack/ui/src/routes/Header.svelte`, `../nc-fullstack/ui/src/routes/Menu.svelte`.
- Sent Tech Forge (site principal): `../sentech-forge/src/components/Navigation.svelte`, `../sentech-forge/src/components/LanguageSwitcher.svelte`.

## Prochaines etapes

1. Decliner ce contrat dans un composant `Header` du design system avec slots typiques (`brand`, `nav`, `utility`).
2. Aligner progressivement chaque surface sur le composant DS ou sur le contrat, en commencant par le design system docs.
3. Mesurer l'ecart sur Sentropic, NC et Forge dans une mise a jour de `docs/sentropic-alignment-inventory.md`.
