# Inventaire d'alignement Sentropic

Perimetre: points d'alignement observes dans `/home/antoinefa/src/sentropic/ui` a appliquer progressivement a la documentation Sent Tech Design System et aux composants Svelte.

## Patterns source

- Systeme d'icones: Sentropic utilise `@lucide/svelte` (`^0.562.0`) dans `ui/package.json`.
- Affordances de depliage: `ChevronDown` tourne selon l'etat ouvert dans `Header.svelte`, `StreamMessage.svelte` et `ChatPanel.svelte`.
- Boutons icones: boutons carres compacts avec icone Lucide, `aria-label` et `title`, par exemple `Menu`, `X`, `Plus`, `List`, `Eye`, `EyeOff`.
- Declencheur de menu: `MenuTriggerButton.svelte` utilise `ChevronDownCircle` dans un bouton icone carre.
- Enveloppe popover: `MenuPopover.svelte` fournit des panneaux flottants blancs bordes, `rounded-lg`, `shadow-lg`, fermeture outside-click et props de placement/alignement.
- Lignes de menu: `FileMenu.svelte`, `DocumentSourceMenu.svelte` et `ChatPanel.svelte` utilisent `flex items-center gap-2`, une icone Lucide 16px, texte tronque, hover background, opacite disabled et couleur danger.
- Separateurs: Sentropic utilise des separateurs explicites `border-t border-slate-100/200` entre groupes logiques.
- Menus operationnels denses: les menus du composer chat combinent titres de sections, zones scrollables avec max-height, separateurs, lignes local/tool/context avec icones.

## Backlog d'alignement

### P0 - clarte des affordances

- Remplacer les affordances de depliage en caracteres seuls dans les composants DS par des icones Lucide.
- Garantir un chevron visible et une cible hover/focus sur les groupes de navigation docs.
- Garantir une icone d'action reconnaissable sur les triggers overflow/actions.

### P1 - contrat menus et popups

- Remplacer les SVG/croix inline restants par Lucide dans `CopyButton`, `Search`, `PasswordInput`, `InlineLoading`, `ProgressIndicator`, `PaginationNav`, `Tag` et `FileUploader`.
- Ajouter le support optionnel d'icones aux items `Menu` et `OverflowMenu` pour rendre icone + label de maniere homogene.
- Ajouter le support optionnel de separateurs/groupes dans les modeles d'items de menu, au lieu de forcer les consommateurs a bricoler des separateurs.
- Aligner `Popover`, `Dropdown`, `Combobox`, `MultiSelect` et `DatePicker` sur `MenuPopover`: ombres, radius, z-index, max-height et fermeture outside-click.
- Documenter le trigger recommande: bouton icone avec `aria-label`, `title`, cible minimale 32px, etats hover/focus et icone Lucide.

### P2 - exemples de documentation

- Mettre a jour les exemples docs pour montrer boutons icones, menus groupes, lignes destructives et positionnement popup.
- Ajouter un guidage visuel sur l'usage de `ChevronDown`, `ChevronDownCircle`, `Ellipsis`, `Plus`, `X`, `Eye/EyeOff`, `Download`, `Upload`, `Trash2`.
- Ajouter des exemples mobiles pour le placement overlay/menu et le confinement du scroll.

## Passe courante

- Ajout de `@lucide/svelte` a l'app docs DS et au package de composants Svelte.
- Remplacement des glyphes de depliage `Accordion` par `ChevronDown`.
- Remplacement des affordances texte `Dropdown`, `Combobox` et `MultiSelect` par `ChevronDown` Lucide avec rotation a l'ouverture.
- Remplacement des croix texte de `Combobox` et `MultiSelect` par `X` Lucide.
- Remplacement du SVG ellipsis manuel de `OverflowMenu` par `Ellipsis` Lucide.
- Ajout de chevrons Lucide aux groupes de sidebar docs.
- Ajout d'icones Lucide de lien externe aux liens utilitaires docs.
- Ajout fermeture `Escape` et outside-click sur `Dropdown`.
- Ajout focus initial, trap focus minimal et fermeture `Escape` sur `Modal`.
- Correction de la demo `Popover` pour ne plus masquer `Dropdown` et `Drawer`.
- Correction responsive docs: tables API scrollables, navigation composants visible sous tablette, cibles tactiles plus grandes, footer decale hors sidebar desktop.
