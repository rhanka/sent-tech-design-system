# Bugs et fixes connus du design system

Liste vivante des bugs visuels et comportementaux signalés sur le design system Sent Tech (composants Svelte et site docs). Les entrées en haut sont actives. Les bugs corrigés sont déplacés en bas avec le SHA de commit.

## À corriger

### Site docs — thème ET framework oubliés à la navigation/clic thème (signalé 2026-06-11)
Sur le site docs, quand on **clique un thème** ou qu'on **change de composant** (navigation), le **thème sélectionné est oublié** ET le **framework actif (svelte/react/vue) aussi** → retour au défaut. Pourtant la persistance localStorage existe (`+layout.svelte` `THEME_STORAGE_KEY`, `framework.svelte.ts` `FRAMEWORK_STORAGE_KEY`, `color-mode.svelte.ts`). Cause probable : la restauration depuis localStorage n'est pas (ré)appliquée à chaque navigation SvelteKit (state ré-initialisé au défaut au mount, ou flash SSR/hydratation, ou un reset partagé thème↔framework). **Attendu** : thème + framework + color-mode persistés et restaurés de façon stable à travers toute navigation et au reload, sans flash. Fix + test de non-régression (url-state/persistence). [agent lancé 2026-06-11]

## Retest navigateur 2026-06-01

Build vérifié : `npm --workspace apps/docs run build` (succès; 0 warning Svelte de série restante). Les anciennes warnings legacy `ChatComposer` ont été supprimées après migration vers les snippets.

Smoke Chrome headless sur `apps/docs/build` :

| Page | Viewport | Vérification | Résultat |
|---|---|---|---|
| `/components/overlays` | Desktop 1440×1000 | Modal ouvre puis se ferme avec Escape; `OverflowMenu` ouvert au-dessus des Toast. | OK — menu z-index 80 > Toast 60 |
| `/components/overlays` | Mobile 390×844 | Même parcours Modal + OverflowMenu. | OK — menu z-index 80 > Toast 60 |
| `/components/plan-completion` | Desktop 1440×1000 | Popover visible; Drawer ouvre, backdrop `fixed` z-index 100, fermeture Escape. | OK |
| `/components/plan-completion` | Mobile 390×844 | Même parcours Popover + Drawer. | OK |

## Principes DS à formaliser (déclenchés par les bugs ci-dessous)

1. **Pas de rail gauche + container arrondi** — déjà documenté en mémoire de session ; à inscrire dans la doc principes formelle.
2. **Hiérarchie z-index explicite** — drawer/modal > menu/popover > toast > content. À documenter dans le contrat tokens.
3. **Outside-click et Escape obligatoires** sur tout composant flottant (menu, popover, drawer non-modal). Doit faire partie du contrat de chaque overlay.

## Corrigés

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
