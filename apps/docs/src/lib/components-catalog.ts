export type ComponentStatus = "documented" | "stub";

export type ComponentCategory =
  | "action"
  | "form"
  | "chat"
  | "navigation"
  | "overlay"
  | "feedback"
  | "data"
  | "layout"
  | "other";

export interface ComponentEntry {
  /** Display name, matches the exported Svelte component identifier. */
  name: string;
  /** URL slug used under `/components/<slug>/`. */
  slug: string;
  /** Whether a dedicated documentation page exists or only a stub placeholder. */
  status: ComponentStatus;
  /** Functional grouping displayed on the index. */
  category: ComponentCategory;
  /**
   * When `status === "documented"`, the slug of an existing landing page that
   * already covers the component. Lets the catalog link to grouped pages
   * (Forms, Overlays, Plan completion, Data & Navigation) until per-component
   * pages are written.
   */
  groupSlug?: string;
  /** Short one-line description for the catalog card. */
  description: { fr: string; en: string };
}

export const CATEGORY_LABELS: Record<
  ComponentCategory,
  { fr: string; en: string }
> = {
  action: { fr: "Actions", en: "Actions" },
  form: { fr: "Formulaires", en: "Forms" },
  chat: { fr: "Chat & Agent", en: "Chat & Agent" },
  navigation: { fr: "Navigation", en: "Navigation" },
  overlay: { fr: "Overlays", en: "Overlays" },
  feedback: { fr: "Feedback", en: "Feedback" },
  data: { fr: "Données", en: "Data" },
  layout: { fr: "Structure", en: "Layout" },
  other: { fr: "Autres", en: "Other" }
};

export const CATEGORY_ORDER: ComponentCategory[] = [
  "action",
  "form",
  "chat",
  "navigation",
  "overlay",
  "feedback",
  "data",
  "layout",
  "other"
];

/**
 * Canonical catalog of components exported by `@sentropic/design-system-svelte`.
 * Kept in sync manually with `packages/components-svelte/src/lib/index.ts`.
 * `ThemeProvider` is intentionally excluded (infra primitive, not a UI brick).
 */
export const COMPONENTS: ComponentEntry[] = [
  // Actions
  {
    name: "Button",
    slug: "button",
    status: "documented",
    category: "action",
    groupSlug: "button",
    description: {
      fr: "Action primaire, secondaire, fantôme ou destructive.",
      en: "Primary, secondary, ghost, or destructive action."
    }
  },
  {
    name: "CopyButton",
    slug: "copy-button",
    status: "documented",
    category: "action",
    groupSlug: "copy-button",
    description: {
      fr: "Bouton dédié à la copie d’une valeur dans le presse-papier.",
      en: "Button dedicated to copying a value to the clipboard."
    }
  },
  {
    name: "IconButton",
    slug: "icon-button",
    status: "documented",
    category: "action",
    groupSlug: "icon-button",
    description: {
      fr: "Bouton icône compact 32-36 px, aria-label obligatoire, Lucide.",
      en: "Compact 32-36 px icon-only button, mandatory aria-label, Lucide."
    }
  },
  {
    name: "Link",
    slug: "link",
    status: "documented",
    category: "action",
    groupSlug: "link",
    description: {
      fr: "Lien stylé cohérent avec le DS, support disabled/external.",
      en: "Styled link consistent with the DS, disabled/external support."
    }
  },

  // Forms
  {
    name: "Checkbox",
    slug: "checkbox",
    status: "documented",
    category: "form",
    groupSlug: "checkbox",
    description: {
      fr: "Case à cocher avec états error/disabled et helper text.",
      en: "Checkbox with error/disabled states and helper text."
    }
  },
  {
    name: "Combobox",
    slug: "combobox",
    status: "documented",
    category: "form",
    description: {
      fr: "Champ texte autocomplété avec sélection dans une liste.",
      en: "Autocomplete text field with selection from a list."
    }
  },
  {
    name: "Form",
    slug: "form",
    status: "documented",
    category: "form",
    description: {
      fr: "Wrapper formulaire avec statut submitting/error/success.",
      en: "Form wrapper with submitting/error/success status."
    }
  },
  {
    name: "FormGroup",
    slug: "form-group",
    status: "documented",
    category: "form",
    description: {
      fr: "Fieldset/legend groupant des contrôles avec helper text.",
      en: "Fieldset/legend grouping controls with helper text."
    }
  },
  {
    name: "DatePicker",
    slug: "date-picker",
    status: "documented",
    category: "form",
    description: {
      fr: "Sélecteur de date, mode simple ou plage.",
      en: "Date picker, single or range mode."
    }
  },
  {
    name: "Dropdown",
    slug: "dropdown",
    status: "documented",
    category: "form",
    groupSlug: "dropdown",
    description: {
      fr: "Liste déroulante de sélection (listbox).",
      en: "Selection dropdown (listbox)."
    }
  },
  {
    name: "FileUploader",
    slug: "file-uploader",
    status: "documented",
    category: "form",
    groupSlug: "file-uploader",
    description: {
      fr: "Téléversement de fichiers avec états de progression.",
      en: "File upload with progress states."
    }
  },
  {
    name: "Input",
    slug: "input",
    status: "documented",
    category: "form",
    groupSlug: "input",
    description: {
      fr: "Champ texte standard, tailles sm/md/lg.",
      en: "Standard text field, sm/md/lg sizes."
    }
  },
  {
    name: "MultiSelect",
    slug: "multi-select",
    status: "documented",
    category: "form",
    description: {
      fr: "Sélection multiple avec tags filtrables.",
      en: "Multi-select with filterable tags."
    }
  },
  {
    name: "NumberInput",
    slug: "number-input",
    status: "documented",
    category: "form",
    description: {
      fr: "Champ numérique avec incrément/décrément.",
      en: "Numeric field with increment/decrement."
    }
  },
  {
    name: "PasswordInput",
    slug: "password-input",
    status: "documented",
    category: "form",
    groupSlug: "password-input",
    description: {
      fr: "Champ mot de passe avec bascule visibilité.",
      en: "Password field with visibility toggle."
    }
  },
  {
    name: "Radio",
    slug: "radio",
    status: "documented",
    category: "form",
    groupSlug: "radio",
    description: {
      fr: "Bouton radio groupé via `name`.",
      en: "Radio button grouped via `name`."
    }
  },
  {
    name: "Search",
    slug: "search",
    status: "documented",
    category: "form",
    groupSlug: "search",
    description: {
      fr: "Champ de recherche avec icône et bouton clear.",
      en: "Search field with icon and clear button."
    }
  },
  {
    name: "Select",
    slug: "select",
    status: "documented",
    category: "form",
    groupSlug: "select",
    description: {
      fr: "Sélecteur natif stylé, tailles sm/md/lg.",
      en: "Styled native select, sm/md/lg sizes."
    }
  },
  {
    name: "Slider",
    slug: "slider",
    status: "documented",
    category: "form",
    description: {
      fr: "Curseur de valeur continue.",
      en: "Continuous value slider."
    }
  },
  {
    name: "Switch",
    slug: "switch",
    status: "documented",
    category: "form",
    groupSlug: "switch",
    description: {
      fr: "Bascule on/off.",
      en: "On/off switch."
    }
  },
  {
    name: "Textarea",
    slug: "textarea",
    status: "documented",
    category: "form",
    groupSlug: "textarea",
    description: {
      fr: "Champ texte multi-ligne.",
      en: "Multi-line text field."
    }
  },
  {
    name: "ChatComposer",
    slug: "chat-composer",
    status: "documented",
    category: "chat",
    description: {
      fr: "Barre de rédaction avec slots d’actions et envoi/arrêt.",
      en: "Composer with action slots and send/stop handling."
    }
  },
  {
    name: "ChatMessage",
    slug: "chat-message",
    status: "documented",
    category: "chat",
    description: {
      fr: "Bulle de message visuelle avec rôles et statut.",
      en: "Visual chat message bubble with role and status."
    }
  },
  {
    name: "ChatThread",
    slug: "chat-thread",
    status: "documented",
    category: "chat",
    description: {
      fr: "Liste de messages scrollable avec auto-scroll et état vide.",
      en: "Scrollable message list with auto-scroll and empty-state."
    }
  },
  {
    name: "MessageStatusBadge",
    slug: "message-status-badge",
    status: "documented",
    category: "chat",
    description: {
      fr: "Badge de statut de message basé sur les niveaux pending/processing/completed/failed.",
      en: "Message status badge mapped to pending/processing/completed/failed."
    }
  },
  {
    name: "MessageActions",
    slug: "message-actions",
    status: "documented",
    category: "chat",
    description: {
      fr: "Rangée d’actions d’un message avec boutons icône et overflow optionnel.",
      en: "Message action row with icon buttons and optional overflow."
    }
  },
  {
    name: "StreamingMessage",
    slug: "streaming-message",
    status: "documented",
    category: "chat",
    description: {
      fr: "Bulle assistant avec affichage d’événements de streaming (deltas, raisonnement, outils, permissions).",
      en: "Assistant bubble with streaming event rendering (deltas, reasoning, tools, permissions)."
    }
  },
  {
    name: "Toggle",
    slug: "toggle",
    status: "documented",
    category: "form",
    description: {
      fr: "Toggle compact (variante du Switch).",
      en: "Compact toggle (Switch variant)."
    }
  },

  // Navigation
  {
    name: "Breadcrumb",
    slug: "breadcrumb",
    status: "documented",
    category: "navigation",
    groupSlug: "breadcrumb",
    description: {
      fr: "Fil d’Ariane sémantique.",
      en: "Semantic breadcrumb trail."
    }
  },
  {
    name: "Header",
    slug: "header",
    status: "documented",
    category: "navigation",
    description: {
      fr: "En-tête applicatif avec logo, navigation et actions.",
      en: "Application header with logo, navigation, and actions."
    }
  },
  {
    name: "Footer",
    slug: "footer",
    status: "documented",
    category: "navigation",
    description: {
      fr: "Pied de page applicatif : marque, colonnes de liens, copyright et liens légaux.",
      en: "Application footer: brand, link columns, copyright and legal links."
    }
  },
  {
    name: "OverflowMenu",
    slug: "overflow-menu",
    status: "documented",
    category: "navigation",
    description: {
      fr: "Menu d’actions secondaires accessibles via un déclencheur compact.",
      en: "Secondary actions menu accessible through a compact trigger."
    }
  },
  {
    name: "PaginationNav",
    slug: "pagination-nav",
    status: "documented",
    category: "navigation",
    groupSlug: "pagination-nav",
    description: {
      fr: "Pagination étendue avec page numérotée et ellipses.",
      en: "Extended pagination with numbered pages and ellipses."
    }
  },
  {
    name: "ContentSwitcher",
    slug: "content-switcher",
    status: "documented",
    category: "navigation",
    description: {
      fr: "Bascule segmentée entre plusieurs vues.",
      en: "Segmented switcher between multiple views."
    }
  },
  {
    name: "Menu",
    slug: "menu",
    status: "documented",
    category: "navigation",
    groupSlug: "menu",
    description: {
      fr: "Menu d’actions contextuel.",
      en: "Contextual actions menu."
    }
  },
  {
    name: "MenuTriggerButton",
    slug: "menu-trigger-button",
    status: "documented",
    category: "navigation",
    groupSlug: "menu-trigger-button",
    description: {
      fr: "Bouton icône carré préconfiguré pour ouvrir un menu (haspopup/expanded câblés).",
      en: "Square icon button preconfigured to open a menu (haspopup/expanded wired)."
    }
  },
  {
    name: "Pagination",
    slug: "pagination",
    status: "documented",
    category: "navigation",
    groupSlug: "pagination",
    description: {
      fr: "Navigation de pages avec page courante.",
      en: "Page navigation with current page."
    }
  },
  {
    name: "SideNav",
    slug: "side-nav",
    status: "documented",
    category: "navigation",
    groupSlug: "data-navigation",
    description: {
      fr: "Navigation latérale verticale.",
      en: "Vertical side navigation."
    }
  },
  {
    name: "Tabs",
    slug: "tabs",
    status: "documented",
    category: "navigation",
    groupSlug: "tabs",
    description: {
      fr: "Onglets tablist/tab/tabpanel.",
      en: "Tabs with tablist/tab/tabpanel."
    }
  },

  // Overlays
  {
    name: "Drawer",
    slug: "drawer",
    status: "documented",
    category: "overlay",
    groupSlug: "drawer",
    description: {
      fr: "Panneau latéral pour workflows secondaires.",
      en: "Side panel for secondary workflows."
    }
  },
  {
    name: "MenuPopover",
    slug: "menu-popover",
    status: "documented",
    category: "overlay",
    groupSlug: "menu-popover",
    description: {
      fr: "Panneau flottant ancré à un déclencheur externe, avec placement, fermeture extérieure et Escape.",
      en: "Floating panel anchored to an external trigger, with placement, outside-click, and Escape close."
    }
  },
  {
    name: "Modal",
    slug: "modal",
    status: "documented",
    category: "overlay",
    groupSlug: "modal",
    description: {
      fr: "Dialogue modal recentré.",
      en: "Centered modal dialog."
    }
  },
  {
    name: "Popover",
    slug: "popover",
    status: "documented",
    category: "overlay",
    groupSlug: "popover",
    description: {
      fr: "Contenu contextuel compact ancré à un déclencheur.",
      en: "Compact contextual content anchored to a trigger."
    }
  },
  {
    name: "Toggletip",
    slug: "toggletip",
    status: "documented",
    category: "overlay",
    description: {
      fr: "Tooltip activable au clic, persistant.",
      en: "Click-activated, persistent tooltip."
    }
  },
  {
    name: "Tooltip",
    slug: "tooltip",
    status: "documented",
    category: "overlay",
    groupSlug: "tooltip",
    description: {
      fr: "Info contextuelle au survol/focus.",
      en: "Contextual hint on hover/focus."
    }
  },

  // Feedback
  {
    name: "Alert",
    slug: "alert",
    status: "documented",
    category: "feedback",
    groupSlug: "alert",
    description: {
      fr: "Bandeau d’information info/success/warning/error.",
      en: "Info/success/warning/error banner."
    }
  },
  {
    name: "EmptyState",
    slug: "empty-state",
    status: "documented",
    category: "feedback",
    groupSlug: "empty-state",
    description: {
      fr: "État vide avec action principale.",
      en: "Empty state with a primary action."
    }
  },
  {
    name: "InlineLoading",
    slug: "inline-loading",
    status: "documented",
    category: "feedback",
    groupSlug: "inline-loading",
    description: {
      fr: "Indicateur de chargement inline accompagné d’un libellé.",
      en: "Inline loading indicator paired with a label."
    }
  },
  {
    name: "LoadingState",
    slug: "loading-state",
    status: "documented",
    category: "feedback",
    groupSlug: "loading-state",
    description: {
      fr: "Indicateur de chargement plein ou skeleton.",
      en: "Full loading indicator or skeleton."
    }
  },
  {
    name: "ProgressBar",
    slug: "progress-bar",
    status: "documented",
    category: "feedback",
    description: {
      fr: "Barre de progression déterminée ou indéterminée.",
      en: "Determinate or indeterminate progress bar."
    }
  },
  {
    name: "ProgressIndicator",
    slug: "progress-indicator",
    status: "documented",
    category: "feedback",
    groupSlug: "progress-indicator",
    description: {
      fr: "Suite d’étapes avec statut complete/current/upcoming.",
      en: "Step sequence with complete/current/upcoming status."
    }
  },
  {
    name: "SkeletonText",
    slug: "skeleton-text",
    status: "documented",
    category: "feedback",
    description: {
      fr: "Placeholder lignes de texte en chargement.",
      en: "Placeholder text lines while loading."
    }
  },
  {
    name: "Toast",
    slug: "toast",
    status: "documented",
    category: "feedback",
    groupSlug: "toast",
    description: {
      fr: "Notification éphémère success/error.",
      en: "Ephemeral success/error notification."
    }
  },

  // Data
  {
    name: "AreaChart",
    slug: "area-chart",
    status: "documented",
    category: "data",
    groupSlug: "area-chart",
    description: {
      fr: "Graphique d’aire pour visualiser des données temporelles ou numériques.",
      en: "Area chart to visualize temporal or numeric data."
    }
  },
  {
    name: "BarChart",
    slug: "bar-chart",
    status: "documented",
    category: "data",
    groupSlug: "bar-chart",
    description: {
      fr: "Graphique en barres (vertical ou horizontal) avec tons catégoriels.",
      en: "Bar chart (vertical or horizontal) with categorical tones."
    }
  },
  {
    name: "LineChart",
    slug: "line-chart",
    status: "documented",
    category: "data",
    groupSlug: "line-chart",
    description: {
      fr: "Graphique en courbes pour séries temporelles ou numériques.",
      en: "Line chart for temporal or numeric series."
    }
  },
  {
    name: "Sparkline",
    slug: "sparkline",
    status: "documented",
    category: "data",
    groupSlug: "sparkline",
    description: {
      fr: "Mini-graphique en ligne, inline, pour tendances compactes.",
      en: "Compact inline line micro-chart for trends."
    }
  },
  {
    name: "Badge",
    slug: "badge",
    status: "documented",
    category: "data",
    description: {
      fr: "Étiquette compacte avec tonalité (success/warning/...).",
      en: "Compact label with tone (success/warning/...)."
    }
  },
  {
    name: "DataTable",
    slug: "data-table",
    status: "documented",
    category: "data",
    description: {
      fr: "Table avancée: tri, sélection multi-lignes.",
      en: "Advanced table: sorting, multi-row selection."
    }
  },
  {
    name: "Table",
    slug: "table",
    status: "documented",
    category: "data",
    groupSlug: "data-navigation",
    description: {
      fr: "Table HTML stylée colonnes/rows.",
      en: "Styled HTML table with columns/rows."
    }
  },
  {
    name: "Tag",
    slug: "tag",
    status: "documented",
    category: "data",
    groupSlug: "tag",
    description: {
      fr: "Tag/chip à libellé court.",
      en: "Short-label tag/chip."
    }
  },

  // Layout
  {
    name: "Accordion",
    slug: "accordion",
    status: "documented",
    category: "layout",
    description: {
      fr: "Liste de panneaux pliables.",
      en: "List of collapsible panels."
    }
  },
  {
    name: "Card",
    slug: "card",
    status: "documented",
    category: "layout",
    description: {
      fr: "Conteneur surface avec bordure et padding.",
      en: "Surface container with border and padding."
    }
  },
  {
    name: "Tile",
    slug: "tile",
    status: "documented",
    category: "layout",
    description: {
      fr: "Tuile unitaire : présentation, cliquable (lien/bouton) ou sélectionnable (case).",
      en: "Single tile: static, clickable (link/button) or selectable (checkbox)."
    }
  },
  {
    name: "SkipLink",
    slug: "skip-link",
    status: "documented",
    category: "navigation",
    description: {
      fr: "Lien d'évitement (a11y) : hors écran jusqu'au focus clavier.",
      en: "Skip link (a11y): off-screen until keyboard focus."
    }
  },
  {
    name: "Quote",
    slug: "quote",
    status: "documented",
    category: "layout",
    description: {
      fr: "Citation éditoriale (blockquote) avec auteur et source.",
      en: "Editorial blockquote with author and source."
    }
  },
  {
    name: "Highlight",
    slug: "highlight",
    status: "documented",
    category: "layout",
    description: {
      fr: "Mise en avant / encart éditorial, avec tonalité d'accent.",
      en: "Editorial highlight / callout box, with accent tone."
    }
  },
  {
    name: "LanguageSelector",
    slug: "language-selector",
    status: "documented",
    category: "navigation",
    description: {
      fr: "Sélecteur de langue compact (i18n) : langue courante + menu.",
      en: "Compact language switcher (i18n): current locale + menu."
    }
  },
  {
    name: "OrderedList",
    slug: "ordered-list",
    status: "documented",
    category: "data",
    description: {
      fr: "Liste ordonnée numérotée, avec imbrication.",
      en: "Numbered ordered list, with nesting."
    }
  },
  {
    name: "TreeView",
    slug: "tree-view",
    status: "documented",
    category: "navigation",
    description: {
      fr: "Arborescence : expand/collapse, sélection, navigation clavier (flèches).",
      en: "Tree view: expand/collapse, selection, keyboard navigation (arrows)."
    }
  },
  {
    name: "DonutChart",
    slug: "donut-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Graphique en anneau (parts d'un total), tooltip et total au centre.",
      en: "Donut chart (parts of a whole), tooltip and center total."
    }
  },
  {
    name: "ScatterPlot",
    slug: "scatter-plot",
    status: "documented",
    category: "data",
    description: {
      fr: "Nuage de points (deux axes numériques), tooltip, points focusables.",
      en: "Scatter plot (two numeric axes), tooltip, focusable points."
    }
  },
  {
    name: "ForceGraph",
    slug: "force-graph",
    status: "documented",
    category: "data",
    description: {
      fr: "Graphe à force dirigée (nœuds/liens), simulation autonome, nœuds focusables, tooltip.",
      en: "Force-directed graph (nodes/edges), self-contained simulation, focusable nodes, tooltip."
    }
  },
  {
    name: "StackedBarChart",
    slug: "stacked-bar-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Barres empilées (séries), légende, tooltip par segment.",
      en: "Stacked bar chart (series), legend, per-segment tooltip."
    }
  },
  {
    name: "AspectRatio",
    slug: "aspect-ratio",
    status: "documented",
    category: "layout",
    description: {
      fr: "Conteneur à ratio d'aspect fixe (média, embeds).",
      en: "Fixed aspect-ratio container (media, embeds)."
    }
  },
  {
    name: "CodeSnippet",
    slug: "code-snippet",
    status: "documented",
    category: "data",
    description: {
      fr: "Extrait de code inline ou bloc, avec copie.",
      en: "Inline or block code snippet, with copy."
    }
  },
  {
    name: "StructuredList",
    slug: "structured-list",
    status: "documented",
    category: "data",
    description: {
      fr: "Liste clé/valeur structurée (paires terme/définition).",
      en: "Structured key/value list (term/definition pairs)."
    }
  },
  {
    name: "TileGroup",
    slug: "tile-group",
    status: "documented",
    category: "form",
    description: {
      fr: "Groupe de tuiles sélectionnables (radio), avec légende.",
      en: "Selectable tile group (radio), with legend."
    }
  },
  {
    name: "UnorderedList",
    slug: "unordered-list",
    status: "documented",
    category: "data",
    description: {
      fr: "Liste à puces, avec imbrication.",
      en: "Bulleted unordered list, with nesting."
    }
  }
];

export interface CategoryGroup {
  category: ComponentCategory;
  components: ComponentEntry[];
}

export function groupByCategory(entries: ComponentEntry[]): CategoryGroup[] {
  const map = new Map<ComponentCategory, ComponentEntry[]>();
  for (const entry of entries) {
    const bucket = map.get(entry.category) ?? [];
    bucket.push(entry);
    map.set(entry.category, bucket);
  }
  return CATEGORY_ORDER.filter((category) => map.has(category)).map((category) => ({
    category,
    components: (map.get(category) ?? []).slice().sort((a, b) => a.name.localeCompare(b.name))
  }));
}

/** Resolve the docs route for a component entry. */
export function componentHref(entry: ComponentEntry): string {
  if (entry.status === "documented" && entry.groupSlug) {
    return `/components/${entry.groupSlug}`;
  }
  return `/components/${entry.slug}`;
}
