export type ComponentStatus = "documented" | "stub";

export type ComponentCategory =
  | "action"
  | "form"
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
  description: string;
}

export const CATEGORY_LABELS: Record<
  ComponentCategory,
  { fr: string; en: string }
> = {
  action: { fr: "Actions", en: "Actions" },
  form: { fr: "Formulaires", en: "Forms" },
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
    description: "Action primaire, secondaire, fantôme ou destructive."
  },
  {
    name: "CopyButton",
    slug: "copy-button",
    status: "stub",
    category: "action",
    description: "Bouton dédié à la copie d’une valeur dans le presse-papier."
  },
  {
    name: "Link",
    slug: "link",
    status: "documented",
    category: "action",
    groupSlug: "plan-completion",
    description: "Lien stylé cohérent avec le DS, support disabled/external."
  },

  // Forms
  {
    name: "Checkbox",
    slug: "checkbox",
    status: "documented",
    category: "form",
    groupSlug: "forms",
    description: "Case à cocher avec états error/disabled et helper text."
  },
  {
    name: "Combobox",
    slug: "combobox",
    status: "stub",
    category: "form",
    description: "Champ texte autocomplété avec sélection dans une liste."
  },
  {
    name: "Form",
    slug: "form",
    status: "stub",
    category: "form",
    description: "Wrapper formulaire avec statut submitting/error/success."
  },
  {
    name: "FormGroup",
    slug: "form-group",
    status: "stub",
    category: "form",
    description: "Fieldset/legend groupant des contrôles avec helper text."
  },
  {
    name: "DatePicker",
    slug: "date-picker",
    status: "stub",
    category: "form",
    description: "Sélecteur de date, mode simple ou plage."
  },
  {
    name: "Dropdown",
    slug: "dropdown",
    status: "documented",
    category: "form",
    groupSlug: "plan-completion",
    description: "Liste déroulante de sélection (listbox)."
  },
  {
    name: "FileUploader",
    slug: "file-uploader",
    status: "stub",
    category: "form",
    description: "Téléversement de fichiers avec états de progression."
  },
  {
    name: "Input",
    slug: "input",
    status: "documented",
    category: "form",
    groupSlug: "forms",
    description: "Champ texte standard, tailles sm/md/lg."
  },
  {
    name: "MultiSelect",
    slug: "multi-select",
    status: "stub",
    category: "form",
    description: "Sélection multiple avec tags filtrables."
  },
  {
    name: "NumberInput",
    slug: "number-input",
    status: "stub",
    category: "form",
    description: "Champ numérique avec incrément/décrément."
  },
  {
    name: "PasswordInput",
    slug: "password-input",
    status: "stub",
    category: "form",
    description: "Champ mot de passe avec bascule visibilité."
  },
  {
    name: "Radio",
    slug: "radio",
    status: "documented",
    category: "form",
    groupSlug: "forms",
    description: "Bouton radio groupé via `name`."
  },
  {
    name: "Search",
    slug: "search",
    status: "stub",
    category: "form",
    description: "Champ de recherche avec icône et bouton clear."
  },
  {
    name: "Select",
    slug: "select",
    status: "documented",
    category: "form",
    groupSlug: "forms",
    description: "Sélecteur natif stylé, tailles sm/md/lg."
  },
  {
    name: "Slider",
    slug: "slider",
    status: "stub",
    category: "form",
    description: "Curseur de valeur continue."
  },
  {
    name: "Switch",
    slug: "switch",
    status: "documented",
    category: "form",
    groupSlug: "forms",
    description: "Bascule on/off."
  },
  {
    name: "Textarea",
    slug: "textarea",
    status: "documented",
    category: "form",
    groupSlug: "forms",
    description: "Champ texte multi-ligne."
  },
  {
    name: "Toggle",
    slug: "toggle",
    status: "stub",
    category: "form",
    description: "Toggle compact (variante du Switch)."
  },

  // Navigation
  {
    name: "Breadcrumb",
    slug: "breadcrumb",
    status: "documented",
    category: "navigation",
    groupSlug: "data-navigation",
    description: "Fil d’Ariane sémantique."
  },
  {
    name: "Header",
    slug: "header",
    status: "stub",
    category: "navigation",
    description: "En-tête applicatif avec logo, navigation et actions."
  },
  {
    name: "OverflowMenu",
    slug: "overflow-menu",
    status: "stub",
    category: "navigation",
    description: "Menu d’actions secondaires accessibles via un déclencheur compact."
  },
  {
    name: "PaginationNav",
    slug: "pagination-nav",
    status: "stub",
    category: "navigation",
    description: "Pagination étendue avec page numérotée et ellipses."
  },
  {
    name: "ContentSwitcher",
    slug: "content-switcher",
    status: "stub",
    category: "navigation",
    description: "Bascule segmentée entre plusieurs vues."
  },
  {
    name: "Menu",
    slug: "menu",
    status: "documented",
    category: "navigation",
    groupSlug: "plan-completion",
    description: "Menu d’actions contextuel."
  },
  {
    name: "Pagination",
    slug: "pagination",
    status: "documented",
    category: "navigation",
    groupSlug: "data-navigation",
    description: "Navigation de pages avec page courante."
  },
  {
    name: "SideNav",
    slug: "side-nav",
    status: "documented",
    category: "navigation",
    groupSlug: "data-navigation",
    description: "Navigation latérale verticale."
  },
  {
    name: "Tabs",
    slug: "tabs",
    status: "documented",
    category: "navigation",
    groupSlug: "data-navigation",
    description: "Onglets tablist/tab/tabpanel."
  },

  // Overlays
  {
    name: "Drawer",
    slug: "drawer",
    status: "documented",
    category: "overlay",
    groupSlug: "plan-completion",
    description: "Panneau latéral pour workflows secondaires."
  },
  {
    name: "Modal",
    slug: "modal",
    status: "documented",
    category: "overlay",
    groupSlug: "overlays",
    description: "Dialogue modal recentré."
  },
  {
    name: "Popover",
    slug: "popover",
    status: "documented",
    category: "overlay",
    groupSlug: "plan-completion",
    description: "Contenu contextuel compact ancré à un déclencheur."
  },
  {
    name: "Toggletip",
    slug: "toggletip",
    status: "stub",
    category: "overlay",
    description: "Tooltip activable au clic, persistant."
  },
  {
    name: "Tooltip",
    slug: "tooltip",
    status: "documented",
    category: "overlay",
    groupSlug: "overlays",
    description: "Info contextuelle au survol/focus."
  },

  // Feedback
  {
    name: "Alert",
    slug: "alert",
    status: "documented",
    category: "feedback",
    groupSlug: "forms",
    description: "Bandeau d’information info/success/warning/error."
  },
  {
    name: "EmptyState",
    slug: "empty-state",
    status: "documented",
    category: "feedback",
    groupSlug: "plan-completion",
    description: "État vide avec action principale."
  },
  {
    name: "InlineLoading",
    slug: "inline-loading",
    status: "stub",
    category: "feedback",
    description: "Indicateur de chargement inline accompagné d’un libellé."
  },
  {
    name: "LoadingState",
    slug: "loading-state",
    status: "documented",
    category: "feedback",
    groupSlug: "plan-completion",
    description: "Indicateur de chargement plein ou skeleton."
  },
  {
    name: "ProgressBar",
    slug: "progress-bar",
    status: "stub",
    category: "feedback",
    description: "Barre de progression déterminée ou indéterminée."
  },
  {
    name: "ProgressIndicator",
    slug: "progress-indicator",
    status: "stub",
    category: "feedback",
    description: "Suite d’étapes avec statut complete/current/upcoming."
  },
  {
    name: "SkeletonText",
    slug: "skeleton-text",
    status: "stub",
    category: "feedback",
    description: "Placeholder lignes de texte en chargement."
  },
  {
    name: "Toast",
    slug: "toast",
    status: "documented",
    category: "feedback",
    groupSlug: "overlays",
    description: "Notification éphémère success/error."
  },

  // Data
  {
    name: "Badge",
    slug: "badge",
    status: "stub",
    category: "data",
    description: "Étiquette compacte avec tonalité (success/warning/...)."
  },
  {
    name: "DataTable",
    slug: "data-table",
    status: "stub",
    category: "data",
    description: "Table avancée: tri, sélection multi-lignes."
  },
  {
    name: "Table",
    slug: "table",
    status: "documented",
    category: "data",
    groupSlug: "data-navigation",
    description: "Table HTML stylée colonnes/rows."
  },
  {
    name: "Tag",
    slug: "tag",
    status: "stub",
    category: "data",
    description: "Tag/chip à libellé court."
  },

  // Layout
  {
    name: "Accordion",
    slug: "accordion",
    status: "stub",
    category: "layout",
    description: "Liste de panneaux pliables."
  },
  {
    name: "Card",
    slug: "card",
    status: "stub",
    category: "layout",
    description: "Conteneur surface avec bordure et padding."
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
