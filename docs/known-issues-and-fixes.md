# Bugs et fixes connus du design system

Liste vivante des bugs visuels et comportementaux signalés sur le design system Sent Tech (composants Svelte et site docs). Les entrées en haut sont actives. Les bugs corrigés sont déplacés en bas avec le SHA de commit.

## À corriger

_(rien en attente)_

## Retest navigateur 2026-06-01

Build vérifié : `npm --workspace apps/docs run build` (succès; 0 warning Svelte de série restante). Les anciennes warnings legacy `ChatComposer` ont été supprimées après migration vers les snippets.

Smoke Chrome headless sur `apps/docs/build` :

| Page | Viewport | Vérification | Résultat |
|---|---|---|---|
| `/components/overlays` | Desktop 1440×1000 | Modal ouvre puis se ferme avec Escape; `OverflowMenu` ouvert au-dessus des Toast. | OK — menu z-index 80 > Toast 60 |
| `/components/overlays` | Mobile 390×844 | Même parcours Modal + OverflowMenu. | OK — menu z-index 80 > Toast 60 |
| `/components/plan-completion` | Desktop 1440×1000 | Popover visible; Drawer ouvre, backdrop `fixed` z-index 100, fermeture Escape. | OK |
| `/components/plan-completion` | Mobile 390×844 | Même parcours Popover + Drawer. | OK |

## Principes DS formalisés (déclenchés par les bugs ci-dessous)

Tous formalisés dans `docs/principles/` (2026-06-12) :

1. **Pas de rail gauche + container arrondi** — `docs/principles/spatial.md`.
2. **Hiérarchie z-index explicite** — drawer/modal > menu/popover > toast > content — `docs/principles/layering.md`.
3. **Outside-click et Escape obligatoires** sur tout composant flottant — `docs/principles/interaction.md`.

## Corrigés

### Site docs — thème ET framework oubliés à la navigation/clic thème (corrigé 2026-06-11, fix prêt en attente de commit)
- **Cause racine** : les liens de navigation internes (sidebar / top-nav) sont des `href` statiques SANS query params (`/components/button`). En SvelteKit le layout est persistant (pas de re-montage), donc après une navigation `page.url.search` devient vide. L'effet de sync entrante de `+layout.svelte` appliquait la règle « param d'URL absent ⇒ valeur par défaut » (`urlTheme ?? DEFAULT_THEME_ID`, `urlFramework ?? DEFAULT_FRAMEWORK`), ce qui réinitialisait thème + framework au défaut à chaque navigation interne. (Correct pour back/forward, faux pour la nav interne qui ne porte jamais les params.) Le color-mode, géré par son propre store + script anti-FOUC, n'était pas réinitialisé, mais le re-bascule du chrome au retour `sent-tech` donnait l'impression d'un flash.
- **Fix** : règle d'autorité corrigée — un param d'URL fait autorité UNIQUEMENT lorsqu'il est présent (deep-link, partage, back/forward) ; absent, on CONSERVE l'état courant (déjà persisté en localStorage). Logique extraite en fonctions pures testables `reconcileTheme`/`reconcileFramework` (`url-state.ts`). L'effet de sync sortante dépend désormais aussi de `page.url.pathname` (et non `.search`, pour éviter la boucle de feedback) afin que l'URL de la nouvelle page reflète toujours l'état. Anti-FOUC renforcé dans `app.html` : restauration précoce de `data-st-theme` et `data-st-framework` (en plus de `data-color-mode`). Test de non-régression ajouté (`url-state.test.ts`) : nav interne conserve l'état, reload relit localStorage, deep-link l'emporte.

### Toast et Alert — barre gauche colorée + container arrondi (corrigé 2026-05-22, `a85a379`)
- **Cause** : `border-radius` non nul combiné à `border-left` coloré sur le container racine de Toast et Alert.
- **Fix** : option A appliquée — passage en `border-radius: 0` (coins nets), conservation du rail gauche tonal. Pattern rectangulaire aligné DSFR/Carbon.

### OverflowMenu — z-index trop bas par rapport aux Toast (corrigé 2026-05-22, `d85ca6e`)
- **Cause** : Toast utilisait un z-index supérieur au popover-zIndex (80).
- **Fix** : hiérarchie canonique introduite — `modal/drawer ≥ 100`, `menu/popover 80-90`, `toast/snackbar 60-70`. Toast abaissé sous le menu, le menu reste au-dessus des notifications éphémères.

### Drawer — clic « Open drawer » ferme le menu au lieu d'ouvrir (corrigé 2026-05-22, `de0c059`)
- **Cause** : `Menu` n'avait ni outside-click ni Escape câblés, et son comportement inline ne distinguait pas un usage popover d'un usage anchored.
- **Fix** : ajout d'un `open` bindable (default `true` pour préserver l'usage inline existant) et d'un opt-in `dismissOnSelect`. Quand le consommateur active `dismissOnSelect`, Escape et pointerdown extérieur ferment le menu — pattern identique à OverflowMenu. Les usages inline (incluant la page plan-completion) gardent l'ancien comportement « toujours ouvert » sans interception d'événement, ce qui débloque le click sur le bouton Drawer.
- **Retest** : Chrome headless desktop/mobile sur `/components/plan-completion` confirme que « Open drawer » ouvre le Drawer, que le backdrop est `fixed` z-index 100 et que Escape referme le panneau.
