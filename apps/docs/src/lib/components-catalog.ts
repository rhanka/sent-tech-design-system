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
  description: { fr: string; en: string };
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
    groupSlug: "plan-completion",
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
    groupSlug: "forms",
    description: {
      fr: "Case à cocher avec états error/disabled et helper text.",
      en: "Checkbox with error/disabled states and helper text."
    }
  },
  {
    name: "Combobox",
    slug: "combobox",
    status: "stub",
    category: "form",
    description: {
      fr: "Champ texte autocomplété avec sélection dans une liste.",
      en: "Autocomplete text field with selection from a list."
    }
  },
  {
    name: "Form",
    slug: "form",
    status: "stub",
    category: "form",
    description: {
      fr: "Wrapper formulaire avec statut submitting/error/success.",
      en: "Form wrapper with submitting/error/success status."
    }
  },
  {
    name: "FormGroup",
    slug: "form-group",
    status: "stub",
    category: "form",
    description: {
      fr: "Fieldset/legend groupant des contrôles avec helper text.",
      en: "Fieldset/legend grouping controls with helper text."
    }
  },
  {
    name: "DatePicker",
    slug: "date-picker",
    status: "stub",
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
    groupSlug: "plan-completion",
    description: {
      fr: "Liste déroulante de sélection (listbox).",
      en: "Selection dropdown (listbox)."
    }
  },
  {
    name: "FileUploader",
    slug: "file-uploader",
    status: "stub",
    category: "form",
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
    groupSlug: "forms",
    description: {
      fr: "Champ texte standard, tailles sm/md/lg.",
      en: "Standard text field, sm/md/lg sizes."
    }
  },
  {
    name: "MultiSelect",
    slug: "multi-select",
    status: "stub",
    category: "form",
    description: {
      fr: "Sélection multiple avec tags filtrables.",
      en: "Multi-select with filterable tags."
    }
  },
  {
    name: "NumberInput",
    slug: "number-input",
    status: "stub",
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
    groupSlug: "forms",
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
    groupSlug: "forms",
    description: {
      fr: "Sélecteur natif stylé, tailles sm/md/lg.",
      en: "Styled native select, sm/md/lg sizes."
    }
  },
  {
    name: "Slider",
    slug: "slider",
    status: "stub",
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
    groupSlug: "forms",
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
    groupSlug: "forms",
    description: {
      fr: "Champ texte multi-ligne.",
      en: "Multi-line text field."
    }
  },
  {
    name: "Toggle",
    slug: "toggle",
    status: "stub",
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
    groupSlug: "data-navigation",
    description: {
      fr: "Fil d’Ariane sémantique.",
      en: "Semantic breadcrumb trail."
    }
  },
  {
    name: "Header",
    slug: "header",
    status: "stub",
    category: "navigation",
    description: {
      fr: "En-tête applicatif avec logo, navigation et actions.",
      en: "Application header with logo, navigation, and actions."
    }
  },
  {
    name: "OverflowMenu",
    slug: "overflow-menu",
    status: "stub",
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
    status: "stub",
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
    groupSlug: "plan-completion",
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
    groupSlug: "data-navigation",
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
    groupSlug: "data-navigation",
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
    groupSlug: "plan-completion",
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
    groupSlug: "overlays",
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
    groupSlug: "plan-completion",
    description: {
      fr: "Contenu contextuel compact ancré à un déclencheur.",
      en: "Compact contextual content anchored to a trigger."
    }
  },
  {
    name: "Toggletip",
    slug: "toggletip",
    status: "stub",
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
    groupSlug: "overlays",
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
    groupSlug: "forms",
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
    groupSlug: "plan-completion",
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
    groupSlug: "plan-completion",
    description: {
      fr: "Indicateur de chargement plein ou skeleton.",
      en: "Full loading indicator or skeleton."
    }
  },
  {
    name: "ProgressBar",
    slug: "progress-bar",
    status: "stub",
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
    status: "stub",
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
    groupSlug: "overlays",
    description: {
      fr: "Notification éphémère success/error.",
      en: "Ephemeral success/error notification."
    }
  },

  // Data
  {
    name: "Badge",
    slug: "badge",
    status: "stub",
    category: "data",
    description: {
      fr: "Étiquette compacte avec tonalité (success/warning/...).",
      en: "Compact label with tone (success/warning/...)."
    }
  },
  {
    name: "DataTable",
    slug: "data-table",
    status: "stub",
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
    status: "stub",
    category: "layout",
    description: {
      fr: "Liste de panneaux pliables.",
      en: "List of collapsible panels."
    }
  },
  {
    name: "Card",
    slug: "card",
    status: "stub",
    category: "layout",
    description: {
      fr: "Conteneur surface avec bordure et padding.",
      en: "Surface container with border and padding."
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
