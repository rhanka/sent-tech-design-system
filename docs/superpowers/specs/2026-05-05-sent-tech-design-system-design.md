# Sent Tech Design System Design

Date: 2026-05-05

## Objectif

Créer un design system Sent Tech complet, inspiré de la rigueur Carbon, avec composants Svelte, documentation bilingue FR/EN, support marque blanche, thèmes runtime par tenant, export CSS build-time, et adaptateurs de compatibilité avec des design systems externes comme Airbus.

Le système doit être compatible en priorité avec `../sentech-forge` et `../entropic`, puis couvrir progressivement `../graphify`, `../spa-transpose-cv` et `../nc-fullstack`.

## Contexte Observé

Le repo cible contient seulement `PLAN.md` et n'est pas encore un repo Git initialisé correctement. Le plan existant visait surtout `top-ai-ideas-fullstack` et `sentech-forge`; il est remplacé par ce cadrage plus large.

`sentech-forge` fournit la meilleure base de tokens actuels: Svelte 5, Tailwind v4, variables CSS HSL, thèmes light/dark, gradients, ombres, navigation, hero, sections marketing, blog, CTA et contenu bilingue.

`entropic` fournit la couverture applicative la plus riche: SvelteKit, Tailwind v3, navigation dense, auth, workspace/org settings, formulaires, menus, popovers, toasts, panels, badges, data views, collaboration, extension Chrome, webview VS Code, queue monitor, chat et streaming. Le Chat UI est en refactoring; il doit être traité comme une surface d'incubation.

`spa-transpose-cv` ajoute les contraintes white-label les plus visibles: thèmes tenant, génération de page client, upload/dropzone, mot de passe session, sélection modèle IA, streaming SSE, résultats DOCX, preview modale et export de marque.

`nc-fullstack` ajoute une UI métier legacy dense: header fixe, rail, drawer, document/PDF viewer, listes, assistant docké/flottant, Source Sans Pro, surfaces rectangulaires, style proche application industrielle.

`graphify` n'est pas une app Svelte, mais impose des besoins de design pour ses exports HTML et rapports: graphe interactif sombre, panneau latéral, recherche, légende, communautés, inspecteur de noeuds, code/report typography et data-viz colors.

## Architecture Retenue

L'architecture retenue est un noyau Sent Tech avec adaptateurs de compatibilité.

Les composants Sent Tech restent la base. Ils consomment des tokens sémantiques et ne codent pas une marque. La compatibilité externe se fait d'abord par mapping tokens/thèmes, puis par délégation ou wrappers de composants pour les surfaces critiques lorsqu'un design system externe l'exige.

Structure cible:

- `packages/tokens`: tokens foundation, semantic et component, exportés en JSON, TypeScript et CSS variables.
- `packages/themes`: thèmes Sent Tech, Forge, Entropic, white-label tenant et adaptateurs externes.
- `packages/components-svelte`: composants Svelte 5 accessibles et stylés par tokens.
- `packages/adapters`: adapters Tailwind v3/v4, runtime tenant, export CSS build-time, design systems externes.
- `apps/docs`: documentation bilingue FR/EN type Carbon, alimentée par les composants réels.
- `apps/playground`: hors V1 stable; espace de test à créer dès que le runtime tenant accepte des thèmes JSON arbitraires.

## Tokens Et Thèmes

La taxonomie de tokens a trois niveaux.

### Foundation Tokens

Valeurs primitives non consommées directement par les composants:

- couleurs: palettes OKLCH/HSL, neutres, brand, accent, feedback, data-viz
- typographie: familles, tailles, graisses, line-height
- spacing: échelle compacte, défaut, spacious
- radius: aucun, sm, md, lg, pill
- ombres: subtle, medium, floating, overlay
- motion: durations, easings, enter/exit, hover
- layout: containers, gutters, breakpoints
- couches: z-index shell, overlay, toast, modal, chat
- opacités et focus rings

### Semantic Tokens

Contrat public principal:

- `surface.default`, `surface.subtle`, `surface.raised`, `surface.overlay`
- `text.primary`, `text.secondary`, `text.muted`, `text.inverse`
- `border.subtle`, `border.strong`, `border.interactive`
- `action.primary`, `action.secondary`, `action.danger`, `action.ghost`
- `feedback.success`, `feedback.warning`, `feedback.error`, `feedback.info`
- `status.pending`, `status.processing`, `status.completed`, `status.failed`
- `shell.header`, `shell.rail`, `shell.drawer`
- `form.field`, `form.focus`, `form.error`
- `chat.userBubble`, `chat.assistantBubble`, `chat.composer`, `chat.toolCall`
- `data.category.1` à `data.category.12`
- `graph.node`, `graph.edge`, `graph.community`, `graph.inspector`

### Component Tokens

Niveau utilisé seulement quand un composant a besoin d'un réglage fin:

- `button.primary.background`
- `card.shadow`
- `modal.backdrop`
- `popover.surface`
- `input.focusRing`
- `rail.activeIndicator`
- `toast.success.surface`
- `chat.composer.surface`
- `graph.node.community1`

### Runtime Tenant Et Build-Time

Un thème tenant est défini dans un format JSON validé par schéma. Ce JSON peut être chargé à l'exécution pour une instance multi-tenant et compilé vers des CSS variables injectées dans un scope tenant.

La même source de thème peut aussi générer un export CSS statique pour les sites ou bundles isolés, notamment `sentech-forge` et les exports de marque blanche.

## Composants

Chaque composant a un statut explicite: `stable`, `beta`, `experimental` ou `deprecated`.

### Socle Stable V1

Fondations UI:

- `Button`
- `IconButton`
- `Link`
- `Badge`
- `Tag`
- `StatusBadge`
- `Tooltip`
- `Spinner`
- `Progress`
- `Skeleton`
- `Divider`
- `Avatar`

Layout et navigation:

- `AppShell`
- `Header`
- `SideRail`
- `Drawer`
- `Tabs`
- `Breadcrumb`
- `LanguageSwitcher`
- `TenantProvider`
- `ThemeProvider`
- `ResponsiveNav`

Formulaires:

- `TextInput`
- `Textarea`
- `Select`
- `SegmentedControl`
- `Checkbox`
- `Radio`
- `Switch`
- `FileDropzone`
- `Field`
- `FormSection`
- `InlineEditable`

Surfaces et feedback:

- `Card`
- `Panel`
- `Modal`
- `Popover`
- `Menu`
- `Toast`
- `Alert`
- `EmptyState`
- `LoadingState`

Contenu et data:

- `Markdown`
- `RichTextEditor` wrapper
- `DataTable` simple
- `ScoreCard`
- `Stat`
- `Timeline`
- `DocumentPreview`
- `CodeBlock`

### Chat UI En Incubation

Le Chat UI a beaucoup de valeur côté Entropic, mais il est en refactoring. La V1 doit donc extraire les tokens et contrats, sans figer l'API des composants avant la fin du refactor.

Contrats à documenter maintenant:

- modes `floating`, `docked`, `sidepanel`, `embedded`
- conversation, message, rôle, statut, streaming
- composer, attachments, model selector, stop/retry
- tool calls, permissions, checkpoint choices
- queue/job monitor, progress, terminal status
- runtime events, reasoning steps, generated files
- host adapters pour web app, Chrome extension et VS Code webview
- accessibilité clavier/focus et screen reader

Composants incubés possibles:

- `ChatShell`
- `ChatMessage`
- `ChatComposer`
- `StreamEvent`
- `QueueMonitor`
- `ToolCallCard`
- `RuntimeStatus`

Ces composants vivent en `experimental/chat` ou dans un package dédié `chat-svelte` avec statut `experimental`.

### Graphify Et Dataviz

La V1 doit prévoir les tokens et composants auxiliaires:

- `GraphLegend`
- `GraphInspectorPanel`
- `SearchFilterPanel`
- `CommunityBadge`

Le rendu graphe/canvas peut rester spécifique à Graphify au départ. Le design system fournit les tokens, panneaux, légendes, badges et interactions périphériques.

## Documentation Bilingue

La documentation doit être un produit du design system, pas une vitrine secondaire.

Chaque composant documenté doit avoir:

- une page FR et EN
- aperçu interactif
- variantes
- états disabled, loading, error, active, focus
- API props/events/slots
- tokens utilisés
- règles d'accessibilité
- matrice de compatibilité thème
- exemples Forge, Entropic et white-label si pertinent
- statut de maturité

Les noms d'API, props et fichiers restent en anglais. Le contenu éditorial, les exemples fonctionnels et les guides sont localisés.

## Compatibilité Externe

Le système doit permettre la compatibilité avec un design system externe comme Airbus sans réécrire les produits.

Ordre de compatibilité:

1. mapping foundation tokens externes vers Sent Tech foundation tokens
2. mapping semantic tokens externes vers Sent Tech semantic tokens
3. adaptation component tokens quand le mapping semantic ne permet pas d'atteindre la conformité visuelle demandée
4. wrappers ou délégation composant quand un client impose le comportement exact d'un composant externe

Cette approche évite de lier tout le design system à un fournisseur tout en permettant une conformité forte quand un client l'exige.

## Migration Produits

Priorité 1: `sentech-forge` et `entropic`.

Forge sert de référence pour:

- taxonomie de tokens
- documentation bilingue
- pages marketing
- contenu éditorial
- light-first et export build-time

Entropic sert de référence pour:

- app shell dense
- formulaires
- popovers, menus, toasts, modales
- status badges
- collaboration
- dark mode
- extension Chrome et VS Code webview
- contrats Chat UI en incubation

Priorité 2: `spa-transpose-cv`, `nc-fullstack`, `graphify`.

Ces produits valident la marque blanche, les tenants runtime, les UIs legacy, les documents, le streaming de traitement et la dataviz.

## Qualité

Aucun composant ne passe `stable` sans:

- documentation FR/EN
- exemples interactifs
- tokens listés
- états principaux couverts
- clavier/focus vérifiés
- contraste et accessibilité vérifiés
- tests unitaires ou component tests
- snapshot visuel par thèmes critiques
- build package validé
- compatibilité Tailwind v3/v4 si le composant cible des produits Tailwind

Tests attendus:

- unit tests pour utilitaires tokens/thèmes
- component tests Svelte
- visual regression sur thèmes Sent Tech, Forge, Entropic et white-label
- axe/accessibility checks
- build ESM/package exports
- génération docs
- génération CSS runtime/build-time

## Décisions Validées

- Architecture: noyau Sent Tech + adaptateurs de compatibilité.
- Marque blanche: runtime par tenant avec export build-time possible.
- Documentation: bilingue FR/EN dès le départ.
- Composants: socle stable V1 large, Chat UI en incubation.
- Priorité produits: `sentech-forge` et `entropic` d'abord.

## Hors Périmètre Initial

- Migration complète de tous les produits vers le design system.
- Remplacement immédiat du Chat UI Entropic avant la fin du refactor.
- Adoption native d'un design system externe comme dépendance obligatoire.
- Rendu graphe complet Graphify dans le package Svelte V1.
