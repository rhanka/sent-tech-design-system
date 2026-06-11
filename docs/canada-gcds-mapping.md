# GC Design System (GCDS) → Sent Tech Design System — inventaire & mapping

Source : [GC Design System](https://design-system.canada.ca/) (composants `gcds-*`, tokens `--gcds-*`,
open source). Recensement des **34 composants** GCDS et correspondance avec le DS Sent Tech.
Objectif : confirmer la couverture et **compléter les manques** avant de livrer le thème Canada.

## Couverture (34 composants GCDS)

| # | GCDS | Rôle | Équivalent DS Sent Tech | Statut |
|---|------|------|--------------------------|--------|
| 1 | Breadcrumbs | fil d'Ariane | `Breadcrumb` | ✅ couvert |
| 2 | Button | action | `Button` / `IconButton` | ✅ couvert |
| 3 | Card | bloc de contenu | `Card` | ✅ couvert |
| 4 | Checkboxes | cases à cocher | `Checkbox` / `CheckboxGroup` | ✅ couvert |
| 5 | Container | conteneur largeur fixe | `Container` | ✅ couvert |
| 6 | Date input | saisie de date (j/m/a) | `DatePicker` | ✅ couvert |
| 7 | Date modified | horodatage MAJ page | (chrome / `Typography`) | ➖ chrome |
| 8 | Details | révéler/masquer | `Accordion` / `Collapsible` | ✅ couvert |
| 9 | Error message | message d'erreur champ | `Form` / `FormGroup` (erreur) | ✅ couvert |
| 10 | Error summary | liste d'erreurs de page | — | ⛔ **gap → ErrorSummary** |
| 11 | Fieldset | groupe de champs | `FormGroup` | ✅ couvert |
| 12 | File uploader | téléversement | `FileUploader` | ✅ couvert |
| 13 | Footer | pied GC | `Footer` (+ ChromeCanada) | ✅ couvert |
| 14 | Grid | grille responsive | `Grid` | ✅ couvert |
| 15 | Header | en-tête GC | `Header` / `AppHeader` (+ ChromeCanada) | ✅ couvert |
| 16 | Heading | titre hiérarchique | `Typography` | ✅ couvert |
| 17 | Icon | symbole | `IconButton` / lucide | ✅ couvert |
| 18 | Input | champ court | `Input` | ✅ couvert |
| 19 | Language toggle | bascule FR/EN | `LanguageToggle` / `LanguageSelector` | ✅ couvert |
| 20 | Link | lien | `Link` | ✅ couvert |
| 21 | Notice | message proéminent | `Alert` / `Notification` | ✅ couvert |
| 22 | Pagination | sélecteur de pages | `Pagination` / `PaginationNav` | ✅ couvert |
| 23 | Radios | choix unique | `Radio` / `RadioGroup` | ✅ couvert |
| 24 | Screenreader-only | texte lecteur d'écran | utilitaire `.sr-only` | ➖ utilitaire |
| 25 | Search | recherche | `Search` | ✅ couvert |
| 26 | Select | liste déroulante | `Select` | ✅ couvert |
| 27 | Side navigation | nav latérale | `SideNav` | ✅ couvert |
| 28 | Signature | identité FIP GC | (ChromeCanada — branding) | ➖ chrome |
| 29 | Stepper | étapes | `Stepper` / `ProgressIndicator` | ✅ couvert |
| 30 | Table | tableau | `Table` / `DataTable` | ✅ couvert |
| 31 | Text | paragraphe | `Typography` | ✅ couvert |
| 32 | Textarea | champ long | `Textarea` | ✅ couvert |
| 33 | Theme and topic menu | méga-menu tâches GC | `Menu` / `OverflowMenu` (+ chrome) | ✅ couvert |
| 34 | Top navigation | nav horizontale | `Header` nav / `Tabs` | ✅ couvert |

## Synthèse

- **Couverts** : 29/34 directement par des composants DS existants.
- **Spécifiques au chrome** (pas des composants génériques, traités dans `ChromeCanada.svelte`) :
  Date modified, Signature (identité FIP) — et le rendu fidèle de Header/Footer/Theme menu GC.
- **Utilitaire** : Screenreader-only (classe `.sr-only`, déjà disponible).
- **Gap réel à compléter** : **Error summary** → nouveau composant `ErrorSummary` (liste agrégée
  des erreurs d'un formulaire, chaque entrée reliée au champ fautif). Livré tri-framework
  (React/Svelte/Vue) + page docs + entrée catalogue + tests, conforme à GCDS « Error summary ».

Le thème Canada (palette/typo/anatomie GCDS) s'applique ensuite à l'ensemble via les CSS vars,
sans fork des composants.
