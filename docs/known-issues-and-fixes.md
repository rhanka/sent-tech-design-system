# Bugs et fixes connus du design system

Liste vivante des bugs visuels et comportementaux signalés sur le design system Sent Tech (composants Svelte et site docs). Les entrées en haut sont actives. Les bugs corrigés sont déplacés en bas avec le SHA de commit.

## À corriger

(rien d'ouvert pour l'instant — les trois bugs du 2026-05-22 sont passés en « Corrigés » ci-dessous)

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
- **À retester visuellement** : passer sur `/components/plan-completion` après déploiement pour confirmer que cliquer « Open drawer » ouvre bien le Drawer maintenant que Menu n'intercepte plus rien par défaut.
