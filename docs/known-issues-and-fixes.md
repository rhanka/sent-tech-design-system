# Bugs et fixes connus du design system

Liste vivante des bugs visuels et comportementaux signalés sur le design system Sent Tech (composants Svelte et site docs). Les entrées en haut sont actives. Les bugs corrigés sont déplacés en bas avec le SHA de commit.

## À corriger

### Toast et Alert — barre gauche colorée + container arrondi
- **Date** : 2026-05-22
- **Surface** : `packages/components-svelte/src/lib/Toast.svelte`, `packages/components-svelte/src/lib/Alert.svelte`
- **Severity** : haute (anti-pattern visuel déjà signalé sur sidebar `Vue d'ensemble`, doit devenir un principe du DS)
- **Symptôme** : le tonal success/error est rendu par un rail gauche coloré combiné à un container avec `border-radius` non nul (cf. capture utilisateur du 2026-05-22 sur `/components/overlays`).
- **Fix attendu** : choisir une seule option par composant :
  - Conserver le rail gauche → passer le container en `border-radius: 0` (coins nets).
  - OU enlever le rail → garder le coins arrondis avec un fond plein tonal et un border 1px subtil.
- **Principe à inscrire dans le DS** : « pas de rail gauche coloré sur un container arrondi ». À documenter dans `docs/header-alignment-contract.md` ou un nouveau `docs/principles.md`.

### OverflowMenu — z-index trop bas par rapport aux Toast
- **Date** : 2026-05-22
- **Surface** : `packages/components-svelte/src/lib/OverflowMenu.svelte`
- **Severity** : haute
- **Symptôme** : sur `/components/overlays`, l'OverflowMenu ouvert passe derrière les Toast `Saved`/`Failed` rendus juste sous.
- **Reproduction** : ouvrir le menu `…` puis observer que les items en bas du dropdown (Delete, séparateur Distribute) sont masqués par les Toast.
- **Cause probable** : `--st-component-popover-zIndex` à `80` mais Toast utilise un z-index supérieur (à vérifier dans `Toast.svelte`).
- **Fix attendu** : aligner les z-index ; un menu utilisateur déclenché par interaction explicite doit toujours être au-dessus d'une notification éphémère contextuelle. Convention proposée : `popover/menu` ≥ `toast/snackbar`.

### Drawer — clic « Open drawer » ferme le menu au lieu d'ouvrir
- **Date** : 2026-05-22
- **Surface** : `packages/components-svelte/src/lib/Drawer.svelte`, ou page demo `apps/docs/src/routes/components/plan-completion/+page.svelte`
- **Severity** : haute
- **Symptôme** : sur `/components/plan-completion`, cliquer sur le bouton `Open drawer` ne déclenche rien ou ferme le menu ouvert au-dessus. Bug de gestion d'événement / pointer.
- **Reproduction** : ouvrir le Menu (Actions), puis cliquer `Open drawer` dans le bloc Drawer.
- **Cause probable** : `Menu` ne se ferme pas sur outside-click (pas câblé), ou son pointerdown handler capture l'événement avant que le bouton Drawer ne le reçoive. Voir comportement déjà câblé sur `OverflowMenu`, à porter sur `Menu`.
- **Fix attendu** :
  - Câbler outside-click + Escape sur `Menu` (en réutilisant la logique d'`OverflowMenu` ou via le futur `MenuPopover`).
  - Vérifier que `Drawer.open` accepte bien une bascule depuis un événement `onclick` distinct de la zone Menu.

## Principes DS à formaliser (déclenchés par les bugs ci-dessus)

1. **Pas de rail gauche + container arrondi** — déjà documenté en mémoire de session ; à inscrire dans la doc principes formelle.
2. **Hiérarchie z-index explicite** — drawer/modal > menu/popover > toast > content. À documenter dans le contrat tokens.
3. **Outside-click et Escape obligatoires** sur tout composant flottant (menu, popover, drawer non-modal). Doit faire partie du contrat de chaque overlay.

## Corrigés

(vide pour l'instant — déplacer les entrées ici avec leur SHA de commit une fois shippé)
