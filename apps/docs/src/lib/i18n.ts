export type Locale = "fr" | "en";

const copy = {
  fr: {
    title: "Sent Tech Design System",
    subtitle: "Composants Svelte, tokens, marque blanche et thèmes tenant.",
    overview: "Fondations",
    overviewBody:
      "La V1 expose des tokens stables, un compilateur de thèmes runtime/build-time et des primitives Svelte prêtes pour Forge et Entropic.",
    components: "Composants",
    areaChartTitle: "AreaChart",
    areaChartIntro: "Graphique d'aire interactif pour visualiser des séries de données temporelles ou numériques avec lissage optionnel et différentes tonalités.",
    areaChartKicker: "Composant · Visualisation",
    buttonTitle: "Button",
    buttonIntro: "Action principale, secondaire, fantôme ou destructive.",
    iconButtonTitle: "IconButton",
    iconButtonIntro:
      "Bouton icône compact 32-36 px pour les actions secondaires, avec aria-label obligatoire et icône Lucide.",
    menuTriggerButtonTitle: "MenuTriggerButton",
    menuTriggerButtonIntro:
      "Bouton icône carré préconfiguré pour ouvrir un menu, avec aria-haspopup et aria-expanded câblés, et chevron Lucide par défaut.",
    menuPopoverTitle: "MenuPopover",
    menuPopoverIntro:
      "Panneau flottant positionné autour d'un déclencheur externe, avec placement bottom/top × start/end, fermeture au clic extérieur et à Escape, et même surface visuelle que le Menu.",
    copyButtonTitle: "CopyButton",
    copyButtonIntro:
      "Bouton dédié à la copie d'une valeur dans le presse-papier, avec retour visuel temporaire et icônes Lucide.",
    searchTitle: "Search",
    searchIntro:
      "Champ de recherche avec icône loupe, bouton clear et tailles sm/md/lg, basé sur `<input type=\"search\">` et icônes Lucide.",
    passwordInputTitle: "PasswordInput",
    passwordInputIntro:
      "Champ mot de passe avec bascule de visibilité, tailles sm/md/lg, états helper/erreur et icônes Lucide `Eye` / `EyeOff`.",
    inlineLoadingTitle: "InlineLoading",
    inlineLoadingIntro:
      "Indicateur de chargement compact avec libellé, statuts active/success/error/inactive et icônes Lucide `LoaderCircle`, `CircleCheck` et `CircleAlert`.",
    progressIndicatorTitle: "ProgressIndicator",
    progressIndicatorIntro:
      "Suite d’étapes ordonnées avec statuts complete/current/upcoming/invalid/disabled, orientation horizontale ou verticale, et icônes Lucide `Check` et `X`.",
    paginationNavTitle: "PaginationNav",
    paginationNavIntro:
      "Pagination étendue avec pages numérotées, ellipses et contrôles précédent/suivant, propulsée par les icônes Lucide `ChevronLeft`, `ChevronRight` et `Ellipsis`.",
    tagTitle: "Tag",
    tagIntro:
      "Chip compact avec tonalités neutral/success/warning/error/info, tailles sm/md et option dismissible propulsée par l’icône Lucide `X`.",
    fileUploaderTitle: "FileUploader",
    fileUploaderIntro:
      "Zone de dépôt et liste de fichiers avec statuts idle/uploading/complete/error, propulsée par les icônes Lucide `Upload`, `File`, `LoaderCircle`, `CircleCheck`, `CircleAlert` et `X`.",
    formsTitle: "Forms",
    formsIntro:
      "Champs, sélections et contrôles binaires pour interfaces produit denses et white-label.",
    overlaysTitle: "Overlays",
    overlaysIntro:
      "Dialogues, infobulles et notifications pour actions ponctuelles sans couplage produit.",
    dataNavigationTitle: "Data & Navigation",
    dataNavigationIntro:
      "Tables, onglets, pagination et navigation latérale pour écrans de données et dashboards.",
    completionTitle: "Plan completion",
    completionIntro:
      "Composants restants du plan initial: liens, alertes, menus, popovers, dropdowns, drawers, empty states et loading states.",
    statusStable: "Stable",
    examplesTitle: "Exemples",
    apiTitle: "API",
    tokensTitle: "Tokens utilisés",
    tokenPolicyTitle: "Contrats",
    tokenPolicyBody:
      "Le contrat marque blanche repose sur des variables sémantiques et component tokens afin de pouvoir adapter un tenant ou un design system externe sans réécrire les composants.",
    variants: "Variantes",
    sizes: "Tailles",
    states: "États",
    validation: "Validation",
    selectionControls: "Contrôles de sélection",
    feedback: "Feedback",
    navigation: "Navigation",
    dataDisplay: "Affichage de données",
    actionsAndLinks: "Actions et liens",
    disclosure: "Disclosure",
    operationalStates: "États opérationnels",
    homeHeroKicker: "SENT-tech · Infrastructure de design produit",
    metricReleasePublished: "release publiée",
    metricExportedComponents: "composants Svelte exportés",
    metricDocumented: "pages documentées en détail",
    metricStubs: "stubs à compléter",
    foundationSemanticTokensTitle: "Tokens sémantiques",
    foundationSemanticTokensBody:
      "Surface, texte, bordures, actions, feedback et statuts sont exposés comme contrat stable.",
    foundationTenantThemesTitle: "Thèmes tenant",
    foundationTenantThemesBody:
      "Sent Tech, Forge et Entropic partagent la même API de thème et restent remplaçables.",
    foundationSvelteComponentsTitle: "Composants Svelte",
    foundationSvelteComponentsBody:
      "Les primitives restent découplées du produit et prêtes pour Forge, Onyxia et Chat UI.",
    componentsCatalogIntro:
      "Catalogue opérationnel des exports `@sentropic/design-system-svelte`, groupé par usage pour retrouver vite le composant et son niveau de documentation.",
    tokensSectionTitle: "Tokens",
    tokensSectionIntro:
      "Le design system publie des tokens foundation, semantic et component. Les composants ne consomment pas les couleurs brutes : ils lisent les variables sémantiques et les component tokens.",
    contractFoundationTitle: "Foundation",
    contractFoundationBody: "Palette, typographie et échelles de base.",
    contractSemanticTitle: "Semantic",
    contractSemanticBody: "Surface, texte, action, feedback, statut.",
    contractComponentTitle: "Component",
    contractComponentBody: "Variables propres aux composants et aux patterns produit.",
    themesSectionTitle: "Thèmes",
    themesSectionIntro:
      "Le package `@sentropic/design-system-themes` expose les thèmes Sent Tech, Forge et Entropic. Les consommateurs peuvent utiliser le `ThemeProvider` Svelte ou le CSS build-time selon leur intégration.",
    contractProductAppsTitle: "Applications produit",
    contractProductAppsBody:
      "Import des composants Svelte et du thème tenant, sans logique métier dans le DS.",
    contractExternalThemesTitle: "Thèmes externes",
    contractExternalThemesBody:
      "Mapping CSS ou runtime depuis les variables sémantiques existantes.",
    contractChatUiTitle: "Chat UI Sentropic",
    contractChatUiBody:
      "Contrat `entropicTheme`, tokens chat et styles consommables sans fork produit.",
    cliSectionTitle: "CLI `design` & Audit Visuel",
    cliSectionIntro: "La CLI `@sentropic/design-system-skills` est un outil en ligne de commande (CLI) autonome en TypeScript/NodeJS sous licence **MIT**. Elle permet d'assurer la conformité visuelle et l'accessibilité stricts du code directement en local ou en intégration continue (CI/CD).",
    cliSectionQuestion: "**Note didactique :** Il s'agit d'une CLI locale exécutable via `npx` (ou scripts NPM). Elle ne dépend d'aucun service cloud pour son moteur technique (`--tech`), garantissant une rapidité instantanée et une confidentialité totale du code source. Pour les diagnostics qualitatifs fins (`--human`), elle s'interface sous forme de contexte structuré pour alimenter des agents de codage comme Antigravity ou Claude Code."
  },
  en: {
    title: "Sent Tech Design System",
    subtitle: "Svelte components, tokens, white-labeling, and tenant themes.",
    overview: "Foundations",
    overviewBody:
      "V1 exposes stable tokens, a runtime/build-time theme compiler, and Svelte primitives ready for Forge and Entropic.",
    components: "Components",
    areaChartTitle: "AreaChart",
    areaChartIntro: "Interactive area chart to visualize temporal or numeric data series with optional smoothing and different color tones.",
    areaChartKicker: "Component · Visualization",
    buttonTitle: "Button",
    buttonIntro: "Primary, secondary, ghost, or destructive action.",
    iconButtonTitle: "IconButton",
    iconButtonIntro:
      "Compact 32-36 px icon-only button for secondary actions, with mandatory aria-label and Lucide icon.",
    menuTriggerButtonTitle: "MenuTriggerButton",
    menuTriggerButtonIntro:
      "Square icon button preconfigured to open a menu, with aria-haspopup and aria-expanded wired, and a default Lucide chevron icon.",
    menuPopoverTitle: "MenuPopover",
    menuPopoverIntro:
      "Floating panel positioned around an external trigger, with bottom/top × start/end placement, outside-click and Escape close, sharing the Menu visual surface.",
    copyButtonTitle: "CopyButton",
    copyButtonIntro:
      "Button dedicated to copying a value to the clipboard, with temporary visual feedback and Lucide icons.",
    searchTitle: "Search",
    searchIntro:
      "Search field with a magnifier icon, clear button, and sm/md/lg sizes, built on `<input type=\"search\">` with Lucide icons.",
    passwordInputTitle: "PasswordInput",
    passwordInputIntro:
      "Password field with a visibility toggle, sm/md/lg sizes, helper/error states, and Lucide `Eye` / `EyeOff` icons.",
    inlineLoadingTitle: "InlineLoading",
    inlineLoadingIntro:
      "Compact loading indicator paired with a label, with active/success/error/inactive statuses and Lucide `LoaderCircle`, `CircleCheck`, and `CircleAlert` icons.",
    progressIndicatorTitle: "ProgressIndicator",
    progressIndicatorIntro:
      "Ordered step sequence with complete/current/upcoming/invalid/disabled statuses, horizontal or vertical orientation, and Lucide `Check` and `X` icons.",
    paginationNavTitle: "PaginationNav",
    paginationNavIntro:
      "Extended pagination with numbered pages, ellipses, and previous/next controls, powered by Lucide `ChevronLeft`, `ChevronRight`, and `Ellipsis` icons.",
    tagTitle: "Tag",
    tagIntro:
      "Compact chip with neutral/success/warning/error/info tones, sm/md sizes, and an optional dismissible affordance powered by the Lucide `X` icon.",
    fileUploaderTitle: "FileUploader",
    fileUploaderIntro:
      "Dropzone and file list with idle/uploading/complete/error statuses, powered by Lucide `Upload`, `File`, `LoaderCircle`, `CircleCheck`, `CircleAlert`, and `X` icons.",
    formsTitle: "Forms",
    formsIntro: "Fields, selections, and binary controls for dense white-label product UIs.",
    overlaysTitle: "Overlays",
    overlaysIntro: "Dialogs, tooltips, and notifications for focused product interactions.",
    dataNavigationTitle: "Data & Navigation",
    dataNavigationIntro:
      "Tables, tabs, pagination, and side navigation for data-heavy dashboard screens.",
    completionTitle: "Plan completion",
    completionIntro:
      "Remaining components from the initial plan: links, alerts, menus, popovers, dropdowns, drawers, empty states, and loading states.",
    statusStable: "Stable",
    examplesTitle: "Examples",
    apiTitle: "API",
    tokensTitle: "Used tokens",
    tokenPolicyTitle: "Contracts",
    tokenPolicyBody:
      "The white-label contract relies on semantic variables and component tokens, so a tenant or external design system can be adapted without rewriting components.",
    variants: "Variants",
    sizes: "Sizes",
    states: "States",
    validation: "Validation",
    selectionControls: "Selection controls",
    feedback: "Feedback",
    navigation: "Navigation",
    dataDisplay: "Data display",
    actionsAndLinks: "Actions and links",
    disclosure: "Disclosure",
    operationalStates: "Operational states",
    homeHeroKicker: "SENT-tech · Product design infrastructure",
    metricReleasePublished: "published release",
    metricExportedComponents: "exported Svelte components",
    metricDocumented: "fully documented pages",
    metricStubs: "stubs to complete",
    foundationSemanticTokensTitle: "Semantic tokens",
    foundationSemanticTokensBody:
      "Surface, text, borders, actions, feedback, and status are exposed as a stable contract.",
    foundationTenantThemesTitle: "Tenant themes",
    foundationTenantThemesBody:
      "Sent Tech, Forge, and Entropic share the same theme API and stay swappable.",
    foundationSvelteComponentsTitle: "Svelte components",
    foundationSvelteComponentsBody:
      "Primitives remain decoupled from the product and ready for Forge, Onyxia, and Chat UI.",
    componentsCatalogIntro:
      "Operational catalog of `@sentropic/design-system-svelte` exports, grouped by usage so each component and its documentation status are easy to find.",
    tokensSectionTitle: "Tokens",
    tokensSectionIntro:
      "The design system publishes foundation, semantic, and component tokens. Components never consume raw colors: they read semantic variables and component tokens.",
    contractFoundationTitle: "Foundation",
    contractFoundationBody: "Palette, typography, and base scales.",
    contractSemanticTitle: "Semantic",
    contractSemanticBody: "Surface, text, action, feedback, status.",
    contractComponentTitle: "Component",
    contractComponentBody: "Variables specific to components and product patterns.",
    themesSectionTitle: "Themes",
    themesSectionIntro:
      "The `@sentropic/design-system-themes` package exposes Sent Tech, Forge, and Entropic themes. Consumers can use the Svelte `ThemeProvider` or build-time CSS depending on their integration.",
    contractProductAppsTitle: "Product applications",
    contractProductAppsBody:
      "Import Svelte components and the tenant theme, with no business logic inside the DS.",
    contractExternalThemesTitle: "External themes",
    contractExternalThemesBody:
      "CSS or runtime mapping from existing semantic variables.",
    contractChatUiTitle: "Sentropic Chat UI",
    contractChatUiBody:
      "`entropicTheme` contract, chat tokens, and consumable styles without product fork.",
    cliSectionTitle: "`design` CLI & Visual Audit",
    cliSectionIntro: "The `@sentropic/design-system-skills` CLI is a standalone TypeScript/NodeJS command line tool under the **MIT** license. It allows developers to enforce strict visual compliance and accessibility directly in local environments or during continuous integration (CI/CD).",
    cliSectionQuestion: "**Didactic note:** This is a local CLI executable via `npx` (or NPM scripts). It does not rely on any cloud service for its technical scanner (`--tech`), ensuring instant execution and absolute code privacy. For advanced reviews (`--human`), it can interface with coding agents like Antigravity or Claude Code."
  }
} as const;

export function t(locale: Locale, key: keyof typeof copy.fr): string {
  return copy[locale][key];
}
