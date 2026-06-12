# Système de design gouvernemental (SDG) du Québec → Sent Tech Design System — inventaire & mapping

Source : [Système de design gouvernemental](https://design.quebec.ca/)
(composants `src/sdg/components/*`, repo open source MIT `Quebecca/qc_trousse_sdg`).
Recensement des **21 composants** SDG et correspondance avec le DS Sentropic.
Objectif : confirmer la couverture et lister les manques avant de livrer le thème Québec.

## Couverture (21 composants SDG)

| # | Composant SDG | Rôle | Équivalent DS Sent Tech | Statut |
|---|---------------|------|--------------------------|--------|
| 1 | Alert | bandeau d'alerte contextuel | `Alert` / `Notification` | ✅ couvert |
| 2 | Button | action principale / secondaire | `Button` / `IconButton` | ✅ couvert |
| 3 | Checkbox | case à cocher | `Checkbox` / `CheckboxGroup` | ✅ couvert |
| 4 | ChoiceGroup | groupe de choix (radio ou case) | `RadioGroup` / `CheckboxGroup` | ✅ couvert |
| 5 | DropdownList | liste déroulante de navigation | `Dropdown` / `Select` | ✅ couvert |
| 6 | ExternalLink | lien avec indicateur externe | `Link` | ✅ couvert |
| 7 | Fieldset | regroupement de champs | `FormGroup` | ✅ couvert |
| 8 | FormError | message d'erreur de champ | `Form` / `FormGroup` (erreur inline) | ✅ couvert |
| 9 | FormfieldRow | rangée label + champ | `FormGroup` / `Form` | ✅ couvert |
| 10 | IconButton | bouton icône seul | `IconButton` | ✅ couvert |
| 11 | Label | étiquette de champ | `FormGroup` / `Input` (label intégré) | ✅ couvert |
| 12 | Notice | message proéminent (info/avertissement) | `Alert` / `Notification` | ✅ couvert |
| 13 | PivFooter | pied de page PIV Québec | `Footer` (+ ChromeQuebec) | ➖ chrome |
| 14 | PivHeader | en-tête PIV Québec (signature fleurdelisée) | `AppHeader` / `Header` (+ ChromeQuebec) | ➖ chrome |
| 15 | RadioButton | choix unique | `Radio` / `RadioGroup` | ✅ couvert |
| 16 | Scrollbar | barre de défilement stylisée | (`ScrollArea` — utilitaire CSS) | ➖ utilitaire |
| 17 | SearchBar | barre de recherche complète | `Search` | ✅ couvert |
| 18 | SearchInput | champ de recherche simple | `Input` (type search) / `Search` | ✅ couvert |
| 19 | TextField | champ de texte court | `Input` | ✅ couvert |
| 20 | ToggleSwitch | interrupteur on/off | `Switch` / `Toggle` | ✅ couvert |
| 21 | Tooltip | infobulle | `Tooltip` / `Toggletip` | ✅ couvert |
| 22 | ToTop | lien « retour en haut » | `BackToTop` | ✅ couvert |

## Synthèse

- **Couverts** : 17/22 directement par des composants DS existants.
- **Spécifiques au chrome** (identité PIV, traités dans `ChromeQuebec.svelte`) :
  PivHeader (signature fleurdelisée, bande bleue PIV) et PivFooter (bandeau bleu + signature blanche).
- **Utilitaire** : Scrollbar (règles CSS sur la scrollbar, pas un composant autonome).
- **Gap réel** : aucun.

## Gaps à livrer (QC-COMPLETE)

0 gap — SDG ⊂ DS
