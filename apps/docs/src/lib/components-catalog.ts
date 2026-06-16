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
    name: "RangeSlider",
    slug: "range-slider",
    status: "documented",
    category: "form",
    description: {
      fr: "Curseur à deux poignées pour sélectionner une plage de valeurs.",
      en: "Two-handle slider for selecting a value range."
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
    name: "AppHeader",
    slug: "app-header",
    status: "documented",
    category: "navigation",
    groupSlug: "header",
    description: {
      fr: "En-tête applicatif compact avec burger, navigation et zone d’actions.",
      en: "Compact application header with menu trigger, navigation, and actions."
    }
  },
  {
    name: "AppChrome",
    slug: "app-chrome",
    status: "documented",
    category: "navigation",
    groupSlug: "header",
    description: {
      fr: "Coque de navigation complète et paramétrable : marque, nav, contrôles (thème, mode couleur, langue, GitHub, identité) et tiroir mobile.",
      en: "Full, parameterized navigation shell: brand, nav, controls (theme, color mode, language, GitHub, identity) and mobile drawer."
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
  {
    name: "NavItem",
    slug: "nav-item",
    status: "documented",
    category: "navigation",
    description: {
      fr: "Rangée de navigation canonique : tête (pastille couleur ou ton), titre, caption muette, bulle de compte, profondeur typographique et statut sémantique.",
      en: "Canonical navigation row: leading (color swatch or tone), title, muted caption, count bubble, typographic depth, and semantic status."
    }
  },
  {
    name: "NavSection",
    slug: "nav-section",
    status: "documented",
    category: "navigation",
    description: {
      fr: "En-tête de groupe d'un rail/drawer : libellé small-caps, compteur, action de section et mode repliable (disclosure).",
      en: "Group header for a rail/drawer: small-caps label, count, section action, and a collapsible (disclosure) mode."
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
    name: "ErrorSummary",
    slug: "error-summary",
    status: "documented",
    category: "feedback",
    groupSlug: "error-summary",
    description: {
      fr: "Liste agrégée des erreurs d’un formulaire, chaque entrée reliée au champ fautif.",
      en: "Aggregated list of a form's errors, each entry linked to the offending field."
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
    name: "Notification",
    slug: "notification",
    status: "documented",
    category: "feedback",
    groupSlug: "notification",
    description: {
      fr: "Notification inline/actionable avec tonalités info/success/warning/error.",
      en: "Inline/actionable notification with info/success/warning/error tones."
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
    name: "ConfigItemCard",
    slug: "config-item-card",
    status: "documented",
    category: "data",
    description: {
      fr: "Carte d'item de configuration : nom, clé, description, badge de provenance et actions selon la provenance.",
      en: "Configuration item card: name, key, description, provenance badge and provenance-aware actions."
    }
  },
  {
    name: "FieldCard",
    slug: "field-card",
    status: "documented",
    category: "layout",
    description: {
      fr: "Carte de groupe de champs : en-tête titré, pastille de commentaires optionnelle, variantes bordered / plain / accent.",
      en: "Field group card: titled header, optional comment pill, bordered / plain / accent variants."
    }
  },
  {
    name: "ScoreCard",
    slug: "score-card",
    status: "documented",
    category: "data",
    description: {
      fr: "Carte de score : titre, notation symbolique (étoiles / croix) et score chiffré, types value et complexity.",
      en: "Score card: title, symbolic rating (stars / crosses) and numeric score, value and complexity types."
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
    name: "DisplaySettings",
    slug: "display-settings",
    status: "documented",
    category: "other",
    description: {
      fr: "Préférences d’affichage (taille de texte, contraste, interligne, animations).",
      en: "Display preferences controls (font size, contrast, line spacing, motion)."
    }
  },
  {
    name: "MediaContent",
    slug: "media-content",
    status: "documented",
    category: "other",
    description: {
      fr: "Conteneur de média avec légende, titre et métadonnées associées.",
      en: "Media wrapper with caption, title, and related metadata."
    }
  },
  {
    name: "Embed",
    slug: "embed",
    status: "documented",
    category: "other",
    description: {
      fr: "Iframe contrôlée avec sandbox strict, ratio et chargement configurable.",
      en: "Controlled iframe wrapper with strict sandbox, ratio, and loading control."
    }
  },
  {
    name: "DataImage",
    slug: "data-image",
    status: "documented",
    category: "other",
    description: {
      fr: "Image pilotée par props/état (src, alt, object-fit, dimensions, rayon).",
      en: "Data-driven image controlled by props/state (src, alt, object-fit, sizing, radius)."
    }
  },
  {
    name: "Transcription",
    slug: "transcription",
    status: "documented",
    category: "other",
    description: {
      fr: "Bloc repliable de transcription audio/vidéo avec horodatage et intervenant.",
      en: "Collapsible transcript panel with timestamps and speaker labels."
    }
  },
  {
    name: "TableOfContents",
    slug: "table-of-contents",
    status: "documented",
    category: "navigation",
    description: {
      fr: "Menu d’itinéraire de page avec liens ancres par niveau.",
      en: "Page route menu with anchor links by level."
    }
  },
  {
    name: "BackToTop",
    slug: "back-to-top",
    status: "documented",
    category: "navigation",
    description: {
      fr: "Bouton d’accès rapide qui remonte vers le haut de la page au défilement.",
      en: "Quick-access button to return to the top after scrolling."
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
    name: "LanguageToggle",
    slug: "language-toggle",
    status: "documented",
    category: "navigation",
    groupSlug: "language-selector",
    description: {
      fr: "Bascule de langue contrôlée, en select desktop ou accordéon mobile.",
      en: "Controlled language toggle, as a desktop select or mobile accordion."
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
      fr: "Nuage de points (deux axes numériques), tooltip et liste de valeurs accessible.",
      en: "Scatter plot (two numeric axes), tooltip and accessible value list."
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
    name: "GeoMap",
    slug: "geo-map",
    status: "documented",
    category: "data",
    description: {
      fr: "Carte 2D générique à couches (GeoJSON, choroplèthe, points, densité, flux, hexbin, clusters), projection équirectangulaire ou Mercator, liste de valeurs accessible.",
      en: "Generic layered 2D map (GeoJSON, choropleth, points, density, flows, hexbin, clusters), equirectangular or Mercator projection, accessible value list."
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
    name: "KpiCard",
    slug: "kpi-card",
    status: "documented",
    category: "data",
    description: {
      fr: "Carte indicateur clé avec valeur, delta, tendance et sparkline optionnelle.",
      en: "KPI card with value, delta, trend indicator, and optional sparkline."
    }
  },
  {
    name: "ComboChart",
    slug: "combo-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Graphique combiné barres + courbes, double axe Y, légende.",
      en: "Combo chart with bars and lines, dual Y axis, and legend."
    }
  },
  {
    name: "GaugeChart",
    slug: "gauge-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Jauge semi-circulaire avec seuils colorés, valeur et unité centrées.",
      en: "Semi-circular gauge with color thresholds, centered value and unit."
    }
  },
  {
    name: "SolidGaugeChart",
    slug: "solid-gauge-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Anneau de progression plein : arc rempli proportionnel à la valeur, teinté par seuils, valeur centrale.",
      en: "Solid progress ring: filled arc proportional to value, threshold-tinted, with centered value."
    }
  },
  {
    name: "StateTimelineChart",
    slug: "state-timeline-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Bandes d'états discrets dans le temps : une ligne par série, segments contigus colorés par état.",
      en: "Discrete state bands over time: one lane per series, contiguous segments colored by state."
    }
  },
  {
    name: "StatusHistoryChart",
    slug: "status-history-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Grille temps × entité : chaque cellule encode un statut discret par bucket temporel.",
      en: "Time × entity grid: each cell encodes a discrete status per time bucket."
    }
  },
  {
    name: "EventFeedPanel",
    slug: "event-feed-panel",
    status: "documented",
    category: "data",
    description: {
      fr: "Flux d'événements datés et scrollable : items triés par date, pastille de sévérité, horodatage et message.",
      en: "Scrollable dated event feed: items sorted by time, severity badge, timestamp and message."
    }
  },
  {
    name: "VectorFieldChart",
    slug: "vector-field-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Champ de vecteurs : grille de flèches dont la longueur encode la magnitude et l'orientation la direction.",
      en: "Vector field: grid of arrows whose length encodes magnitude and orientation encodes direction."
    }
  },
  {
    name: "ContourChart",
    slug: "contour-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Contour topographique : grille 2D peinte en bandes de couleur par paliers de valeur (échelle data category1…8).",
      en: "Topographic contour: 2D grid painted as colour bands by value levels (data category1…8 scale)."
    }
  },
  {
    name: "WindBarbChart",
    slug: "wind-barb-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Barbes de vent : une barbe par point le long d'un axe temporel, hampe orientée et barbules encodant la vitesse.",
      en: "Wind barbs: one barb per point along a time axis, oriented shaft and feathers encoding the speed."
    }
  },
  {
    name: "RenkoChart",
    slug: "renko-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Briques Renko : à partir d'une série de prix, empile des briques d'une taille fixe (boxSize) en ignorant le temps régulier.",
      en: "Renko bricks: from a price series, stacks fixed-size bricks (boxSize) while ignoring regular time."
    }
  },
  {
    name: "PointAndFigureChart",
    slug: "point-and-figure-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Point & Figure : colonnes de X (hausse) et de O (baisse) selon le mouvement de prix (boxSize + reversal).",
      en: "Point & Figure: columns of X (up) and O (down) following the price movement (boxSize + reversal)."
    }
  },
  {
    name: "WaffleChart",
    slug: "waffle-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Grille N×M de cellules : la proportion de cellules colorées encode la part de chaque catégorie.",
      en: "N×M cell grid: the share of colored cells encodes each category's proportion."
    }
  },
  {
    name: "ColorSwatch",
    slug: "color-swatch",
    status: "documented",
    category: "data",
    description: {
      fr: "Pastille d'une couleur arbitraire (hex/rgb/oklch/token) avec libellé optionnel : brique d'une palette ou d'une légende.",
      en: "Swatch of an arbitrary color (hex/rgb/oklch/token) with an optional label: a palette or legend building block."
    }
  },
  {
    name: "ColorScaleBar",
    slug: "color-scale-bar",
    status: "documented",
    category: "data",
    description: {
      fr: "Échelle de couleur continue (gradient) à partir de stops arbitraires, avec libellés d'extrémités min/max.",
      en: "Continuous color scale (gradient) from arbitrary stops, with optional min/max end labels."
    }
  },
  {
    name: "Timeline",
    slug: "timeline",
    status: "documented",
    category: "feedback",
    description: {
      fr: "Liste verticale/horizontale d'événements datés : ligne de connexion, pastilles de statut, titre, méta (date) et description par item.",
      en: "Vertical/horizontal list of dated events: a connecting line, status dots, title, meta (date) and description per item."
    }
  },
  {
    name: "RibbonChart",
    slug: "ribbon-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Rang empilé à rubans dans le temps : barres triées par valeur et rubans lissés reliant chaque catégorie d'une période à l'autre.",
      en: "Stacked ribbon ranking over time: bars sorted by value with smoothed ribbons linking each category between periods."
    }
  },
  {
    name: "AnomalySwimLaneChart",
    slug: "anomaly-swim-lane-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Heatmap temps × job : la couleur encode un score d'anomalie continu (gradient d'intensité).",
      en: "Time × job heatmap: color encodes a continuous anomaly score (intensity gradient)."
    }
  },
  {
    name: "FlamegraphChart",
    slug: "flamegraph-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Pile d'appels « icicle » empilée : largeur ∝ valeur, hiérarchie récursive posée niveau par niveau.",
      en: "Stacked icicle call stack: width ∝ value, recursive hierarchy laid out level by level."
    }
  },
  {
    name: "TraceWaterfallChart",
    slug: "trace-waterfall-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Trace de spans distribués : barres start → durée sur l'axe temps, ordonnées et indentées par hiérarchie.",
      en: "Distributed span trace: start → duration bars on the time axis, ordered and indented by hierarchy."
    }
  },
  {
    name: "DecompositionTreeChart",
    slug: "decomposition-tree-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Arbre de décomposition hiérarchique : une mesure totale éclatée niveau par niveau en colonnes de barres reliées au parent.",
      en: "Hierarchical decomposition tree: a total measure broken down level by level into columns of bars linked to their parent."
    }
  },
  {
    name: "Density2DChart",
    slug: "density-2d-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Densité 2D binned sur axes numériques : points (x,y) agrégés en cellules dont la couleur encode la densité.",
      en: "Binned 2D density on numeric axes: (x,y) points aggregated into cells whose color encodes density."
    }
  },
  {
    name: "FunnelChart",
    slug: "funnel-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Entonnoir vertical ou horizontal avec pourcentages de conversion par étape.",
      en: "Vertical or horizontal funnel with per-step conversion percentages."
    }
  },
  {
    name: "WaterfallChart",
    slug: "waterfall-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Graphique en cascade (augmentations, diminutions, totaux) avec connecteurs.",
      en: "Waterfall chart (increases, decreases, totals) with optional connectors."
    }
  },
  {
    name: "TreemapChart",
    slug: "treemap-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Carte proportionnelle hiérarchique (squarified), 1 ou 2 niveaux, labels.",
      en: "Squarified hierarchical treemap, 1 or 2 levels, with optional labels."
    }
  },
  {
    name: "WordCloudChart",
    slug: "word-cloud-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Nuage de mots : taille de police ∝ poids, placement déterministe en spirale d'Archimède sans chevauchement.",
      en: "Word cloud: font size ∝ weight, deterministic Archimedean-spiral placement with no overlap."
    }
  },
  {
    name: "OrganizationChart",
    slug: "organization-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Organigramme hiérarchique : une boîte par nœud disposée par niveau, enfants centrés sous le parent, connecteurs orthogonaux.",
      en: "Hierarchical org chart: one box per node laid out by level, children centred under the parent, with orthogonal connectors."
    }
  },
  {
    name: "TreegraphChart",
    slug: "treegraph-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Arbre/dendrogramme horizontal (gauche→droite) : nœuds circulaires hiérarchiques par profondeur, liens en courbes de Bézier, feuilles réparties verticalement.",
      en: "Horizontal tree/dendrogram (left→right): circular hierarchical nodes by depth, Bézier-curve links, leaves spread vertically."
    }
  },
  {
    name: "HeatmapChart",
    slug: "heatmap-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Matrice colorée pour croiser deux dimensions catégorielles.",
      en: "Colored matrix for crossing two categorical dimensions."
    }
  },
  {
    name: "HistogramChart",
    slug: "histogram-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Histogramme pour afficher des classes explicites ou générées.",
      en: "Histogram for explicit or generated distribution bins."
    }
  },
  {
    name: "BoxPlotChart",
    slug: "box-plot-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Boîtes à moustaches pour comparer des distributions et leurs valeurs atypiques.",
      en: "Box plots for comparing distributions and outliers."
    }
  },
  {
    name: "RoseChart",
    slug: "rose-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Diagramme polaire de Nightingale : rayon proportionnel à la valeur, secteurs d'angle égal.",
      en: "Nightingale polar area chart: radius scales with value, equal-angle sectors."
    }
  },
  {
    name: "ItemChart",
    slug: "item-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Graphe « parlement » / hémicycle : sièges en rangées concentriques, blocs contigus par groupe, taille lue à la longueur de l'arc.",
      en: "Parliament / hemicycle chart: seats in concentric rows, contiguous blocks per group, size read from arc length."
    }
  },
  {
    name: "VariablePieChart",
    slug: "variable-pie-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Camembert à rayon variable : l'angle de chaque part ∝ value, le rayon ∝ une 2e métrique z mappée entre rayon min et max.",
      en: "Variable-radius pie: each slice's angle scales with value, its radius with a 2nd metric z mapped between a min and max radius."
    }
  },
  {
    name: "VennChart",
    slug: "venn-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Diagramme de Venn / Euler : 2 ou 3 ensembles en cercles superposés, intersections étiquetées ; rayon ∝ √(taille de l'ensemble).",
      en: "Venn / Euler diagram: 2 or 3 sets as overlapping circles with labeled intersections; radius scales with √(set size)."
    }
  },
  {
    name: "ViolinChart",
    slug: "violin-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Densité de distribution en miroir par catégorie, avec médiane et quartiles.",
      en: "Mirrored distribution density per category, with median and quartiles."
    }
  },
  {
    name: "LollipopChart",
    slug: "lollipop-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Diagramme en sucette : tige fine et pastille pour comparer des valeurs par catégorie.",
      en: "Lollipop chart: thin stems and dots to compare values across categories."
    }
  },
  {
    name: "ColumnRangeChart",
    slug: "column-range-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Barres d'intervalle bas/haut par catégorie (ex. températures min/max, fourchettes de prix).",
      en: "Low/high range bars per category (e.g. min/max temperatures, price ranges)."
    }
  },
  {
    name: "AreaRangeChart",
    slug: "area-range-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Bande remplie entre une série basse et une série haute le long d'un axe X (ex. fourchette de température jour par jour, min/max boursier).",
      en: "Filled band between a low and a high series along an X axis (e.g. daily temperature range, stock min/max)."
    }
  },
  {
    name: "AreaSplineRangeChart",
    slug: "area-spline-range-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Variante spline d'AreaRange : bande remplie entre une série basse et une série haute le long d'un axe X, contours toujours lissés (ex. fourchette de température, intervalle de confiance).",
      en: "Spline variant of AreaRange: filled band between a low and a high series along an X axis, always-smoothed contours (e.g. temperature range, confidence interval)."
    }
  },
  {
    name: "ColumnPyramidChart",
    slug: "column-pyramid-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Colonnes pyramidales : chaque catégorie est un triangle, base sur l'axe X et sommet à la hauteur de la valeur.",
      en: "Pyramid columns: each category is a triangle, base on the X axis and apex at the value height."
    }
  },
  {
    name: "PolygonChart",
    slug: "polygon-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Polygone fermé rempli reliant des points x/y dans l'ordre fourni (zones/clusters), contour + sommets, axes numériques.",
      en: "Closed filled polygon connecting x/y points in order (zones/clusters), outline + vertices, numeric axes."
    }
  },
  {
    name: "TileMapChart",
    slug: "tile-map-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Carte en tuiles (cartogramme « tilemap ») : grille de cellules carrées posées à des coordonnées (col, row) explicites, colorées par valeur sur une échelle séquentielle.",
      en: "Tile map (\"tilemap\" cartogram): grid of square cells placed at explicit (col, row) coordinates, colored by value on a sequential scale."
    }
  },
  {
    name: "DumbbellChart",
    slug: "dumbbell-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Pour chaque catégorie, une ligne reliant une valeur basse à une valeur haute, avec un cercle teinté à chaque extrémité (ex. avant/après, min/max).",
      en: "Per category, a line connecting a low to a high value with a coloured dot at each end (e.g. before/after, min/max)."
    }
  },
  {
    name: "ErrorBarChart",
    slug: "error-bar-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Pour chaque catégorie, un marqueur au point central (moyenne) et une moustache de la borne basse à la borne haute avec un capuchon à chaque extrémité (intervalle d'incertitude / de confiance).",
      en: "Per category, a marker at the central value (mean) and a whisker from the low to the high bound capped at each end (uncertainty / confidence interval)."
    }
  },
  {
    name: "BellCurveChart",
    slug: "bell-curve-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "À partir d'un échantillon de nombres bruts, calcule la moyenne μ et l'écart-type σ puis trace la densité de la loi normale (courbe en cloche) avec repères à μ et μ±σ, μ±2σ.",
      en: "From a raw sample of numbers, computes the mean μ and standard deviation σ then draws the normal-distribution density (bell curve) with markers at μ and μ±σ, μ±2σ."
    }
  },
  {
    name: "ParetoChart",
    slug: "pareto-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Barres triées décroissantes avec courbe cumulée en pourcentage (loi de Pareto).",
      en: "Descending bars with a cumulative percentage curve (Pareto principle)."
    }
  },
  {
    name: "RadarChart",
    slug: "radar-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Radar polaire pour comparer plusieurs séries sur des axes communs.",
      en: "Polar radar chart for comparing series across shared axes."
    }
  },
  {
    name: "SankeyChart",
    slug: "sankey-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Diagramme de flux pondérés entre nœuds catégoriels.",
      en: "Weighted flow diagram between categorical nodes."
    }
  },
  {
    name: "SunburstChart",
    slug: "sunburst-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Hiérarchie radiale pour explorer les contributions imbriquées.",
      en: "Radial hierarchy for exploring nested contributions."
    }
  },
  {
    name: "ChordDiagram",
    slug: "chord-diagram",
    status: "documented",
    category: "data",
    description: {
      fr: "Diagramme en cordes : flux pondérés entre nœuds répartis sur un cercle.",
      en: "Chord diagram: weighted flows between nodes laid out on a circle."
    }
  },
  {
    name: "DependencyWheelChart",
    slug: "dependency-wheel-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Roue de dépendances : nœuds sur un cercle, rubans pondérés colorés par source.",
      en: "Dependency wheel: nodes on a circle, weighted ribbons coloured by source."
    }
  },
  {
    name: "ArcDiagramChart",
    slug: "arc-diagram-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Diagramme en arcs : nœuds alignés sur un axe, arcs pondérés colorés par source.",
      en: "Arc diagram: nodes on an axis, weighted arcs coloured by source."
    }
  },
  {
    name: "PackedBubblesChart",
    slug: "packed-bubbles-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Bulles tassées dont l'aire est proportionnelle à la valeur.",
      en: "Packed bubbles whose area is proportional to value."
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
    name: "Flex",
    slug: "flex",
    status: "documented",
    category: "layout",
    description: {
      fr: "Boîte flex : direction, gap, alignement et justification.",
      en: "Flex box: direction, gap, alignment, and justification."
    }
  },
  {
    name: "Grid",
    slug: "grid",
    status: "documented",
    category: "layout",
    groupSlug: "container",
    description: {
      fr: "Grille CSS simple : colonnes fixes ou auto-fill responsive.",
      en: "Simple CSS grid: fixed columns or responsive auto-fill."
    }
  },
  {
    name: "Stack",
    slug: "stack",
    status: "documented",
    category: "layout",
    description: {
      fr: "Empilement vertical avec gap homogène (raccourci Flex column).",
      en: "Vertical stack with uniform gap (Flex column shorthand)."
    }
  },
  {
    name: "Inline",
    slug: "inline",
    status: "documented",
    category: "layout",
    description: {
      fr: "Flux horizontal qui passe à la ligne, gap homogène.",
      en: "Wrapping horizontal flow with uniform gap."
    }
  },
  {
    name: "Container",
    slug: "container",
    status: "documented",
    category: "layout",
    description: {
      fr: "Conteneur centré à largeur maximale bornée (sm…full).",
      en: "Centered container with bounded max width (sm…full)."
    }
  },
  {
    name: "Row",
    slug: "row",
    status: "documented",
    category: "layout",
    description: {
      fr: "Ligne d'une grille 12 colonnes, gouttière paramétrable.",
      en: "Row of a 12-column grid with configurable gutter."
    }
  },
  {
    name: "Col",
    slug: "col",
    status: "documented",
    category: "layout",
    description: {
      fr: "Colonne d'une grille 12 (span, offset, surcharges responsives).",
      en: "Column of a 12-grid (span, offset, responsive overrides)."
    }
  },
  {
    name: "Hidden",
    slug: "hidden",
    status: "documented",
    category: "layout",
    description: {
      fr: "Masque son contenu au-dessus/en-dessous d'un breakpoint.",
      en: "Hides its content above/below a breakpoint."
    }
  },
  {
    name: "Divider",
    slug: "divider",
    status: "documented",
    category: "layout",
    description: {
      fr: "Séparateur horizontal/vertical, optionnellement avec libellé.",
      en: "Horizontal/vertical separator, optionally with a label."
    }
  },
  {
    name: "Avatar",
    slug: "avatar",
    status: "documented",
    category: "other",
    description: {
      fr: "Vignette d'identité : initiales colorées ou photo, plusieurs tailles.",
      en: "Identity badge: colored initials or photo, multiple sizes."
    }
  },
  {
    name: "AvatarGroup",
    slug: "avatar-group",
    status: "documented",
    category: "other",
    description: {
      fr: "Pile d'avatars avec recouvrement et jeton de débordement « +N ».",
      en: "Overlapping avatar stack with a “+N” overflow token."
    }
  },
  {
    name: "ButtonGroup",
    slug: "button-group",
    status: "documented",
    category: "action",
    description: {
      fr: "Regroupe des boutons, en segments joints ou espacés.",
      en: "Groups buttons, either attached as segments or spaced."
    }
  },
  {
    name: "CheckboxGroup",
    slug: "checkbox-group",
    status: "documented",
    category: "form",
    description: {
      fr: "Ensemble de cases à cocher avec légende, valeurs multiples.",
      en: "Set of checkboxes with a legend and multiple values."
    }
  },
  {
    name: "RadioGroup",
    slug: "radio-group",
    status: "documented",
    category: "form",
    description: {
      fr: "Choix exclusif parmi plusieurs options, légende et a11y.",
      en: "Exclusive choice among options, with legend and a11y."
    }
  },
  {
    name: "Typography",
    slug: "typography",
    status: "documented",
    category: "other",
    description: {
      fr: "Composant de texte : variantes, poids, ton, alignement.",
      en: "Text component: variants, weight, tone, and alignment."
    }
  },
  {
    name: "Collapsible",
    slug: "collapsible",
    status: "documented",
    category: "layout",
    description: {
      fr: "En-tête cliquable révélant une région de contenu repliable.",
      en: "Clickable header revealing a collapsible content region."
    }
  },
  {
    name: "Stepper",
    slug: "stepper",
    status: "documented",
    category: "navigation",
    description: {
      fr: "Indicateur d'étapes d'un parcours, horizontal ou vertical.",
      en: "Step indicator for a flow, horizontal or vertical."
    }
  },
  {
    name: "Rating",
    slug: "rating",
    status: "documented",
    category: "feedback",
    description: {
      fr: "Note par étoiles, lecture seule ou interactive, demi-étoiles.",
      en: "Star rating, read-only or interactive, with half-stars."
    }
  },
  {
    name: "TimePicker",
    slug: "time-picker",
    status: "documented",
    category: "form",
    description: {
      fr: "Sélection d'une heure parmi des créneaux générés par pas.",
      en: "Time selection from slots generated at a fixed step."
    }
  },
  {
    name: "Calendar",
    slug: "calendar",
    status: "documented",
    category: "form",
    description: {
      fr: "Calendrier mensuel : date unique ou plage, bornes min/max.",
      en: "Monthly calendar: single date or range, with min/max bounds."
    }
  },
  {
    name: "SlideIndicator",
    slug: "slide-indicator",
    status: "documented",
    category: "navigation",
    description: {
      fr: "Points ou barres signalant la diapositive courante d'un carrousel.",
      en: "Dots or bars marking the current slide of a carousel."
    }
  },
  {
    name: "Autosave",
    slug: "autosave",
    status: "documented",
    category: "feedback",
    description: {
      fr: "Indicateur d'enregistrement automatique : en cours, enregistré, échec.",
      en: "Autosave indicator: saving, saved, or failed states."
    }
  },
  {
    name: "Portal",
    slug: "portal",
    status: "documented",
    category: "other",
    description: {
      fr: "Téléporte son contenu ailleurs dans le DOM (par défaut <body>) ; SSR-safe.",
      en: "Teleports its content elsewhere in the DOM (defaults to <body>); SSR-safe."
    }
  },
  {
    name: "Popper",
    slug: "popper",
    status: "documented",
    category: "overlay",
    description: {
      fr: "Positionne un panneau flottant près d'une ancre : flip, shift, arrow.",
      en: "Positions a floating panel next to an anchor: flip, shift, arrow."
    }
  },
  {
    name: "SelectableRow",
    slug: "selectable-row",
    status: "documented",
    category: "form",
    description: {
      fr: "Rangée sélectionnable pleine largeur : surface teintée + texte accentué, slots leading/trailing.",
      en: "Full-width selectable row: tinted surface + accented text, leading/trailing slots."
    }
  },
  {
    name: "SelectableList",
    slug: "selectable-list",
    status: "documented",
    category: "form",
    description: {
      fr: "Listbox accessible pilotant ses rangées : sélection unique ou multiple, navigation clavier.",
      en: "Accessible listbox driving its rows: single or multiple selection, keyboard navigation."
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
  },
  {
    name: "BulletChart",
    slug: "bullet-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Bullet graph : mesure vs cible avec bandes qualitatives.",
      en: "Bullet graph: measure vs target with qualitative range bands."
    }
  },
  {
    name: "MarimekkoChart",
    slug: "marimekko-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Matrice Marimekko : largeur de colonne pondérée, segments en hauteur.",
      en: "Marimekko chart: weighted column width with stacked segments."
    }
  },
  {
    name: "ParallelCoordinatesChart",
    slug: "parallel-coordinates-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Axes parallèles pour comparer des enregistrements multidimensionnels.",
      en: "Parallel coordinates for comparing multi-dimensional records."
    }
  },
  {
    name: "CandlestickChart",
    slug: "candlestick-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Bougies OHLC pour visualiser les cours financiers.",
      en: "OHLC candlestick chart for financial price data."
    }
  },
  {
    name: "OHLCChart",
    slug: "ohlc-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Bâtons OHLC : barre verticale low→high, tick gauche à l'ouverture, tick droite à la clôture.",
      en: "OHLC bars: a vertical low→high bar with a left open tick and a right close tick."
    }
  },
  {
    name: "HLCChart",
    slug: "hlc-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Bâtons HLC : barre verticale low→high, tick droite à la clôture (variante d'OHLC sans tick d'ouverture).",
      en: "HLC bars: a vertical low→high bar with a right close tick (an OHLC variant without an open tick)."
    }
  },
  {
    name: "HollowCandlestickChart",
    slug: "hollow-candlestick-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Chandeliers creux : couleur selon la clôture vs la précédente, corps creux si haussier et plein si baissier.",
      en: "Hollow candlesticks: colour by close vs previous close, hollow body when bullish and filled when bearish."
    }
  },
  {
    name: "HeikinAshiChart",
    slug: "heikin-ashi-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Chandeliers Heikin-Ashi : OHLC lissé par moyennes successives pour faire ressortir la tendance.",
      en: "Heikin-Ashi candlesticks: OHLC smoothed by successive averages to surface the trend."
    }
  },
  {
    name: "TimelineChart",
    slug: "timeline-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Frise chronologique : événements positionnés sur un axe horizontal gradué, marqueurs catégoriels et libellés alternés au-dessus/dessous.",
      en: "Timeline: events positioned on a graduated horizontal axis, categorical markers and labels alternated above/below."
    }
  },
  {
    name: "GanttChart",
    slug: "gantt-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Diagramme de Gantt : une ligne par tâche, barre horizontale start→end sur un axe temporel, couleur par catégorie.",
      en: "Gantt chart: one row per task, a horizontal start→end bar on a time axis, colour by category."
    }
  },
  {
    name: "StreamgraphChart",
    slug: "streamgraph-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Streamgraph (themeriver) : aires empilées et lissées sur une ligne de base centrée « wiggle », pour des séries temporelles.",
      en: "Streamgraph (themeriver): stacked smoothed areas on a centred \"wiggle\" baseline, for time-series data."
    }
  },
  {
    name: "CalendarHeatmapChart",
    slug: "calendar-heatmap-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Grille calendrier GitHub-style pour visualiser l'activité quotidienne.",
      en: "GitHub-style calendar grid for visualizing daily activity."
    }
  },
  {
    name: "BumpChart",
    slug: "bump-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Classements dans le temps : lignes qui montent et descendent.",
      en: "Rankings over time: rising and falling rank lines."
    }
  },
  {
    name: "StepLineChart",
    slug: "step-line-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Courbe en paliers : la valeur reste stable jusqu'au prochain seuil.",
      en: "Step line chart: the value stays flat until the next threshold."
    }
  },
  {
    name: "DivergentBarChart",
    slug: "divergent-bar-chart",
    status: "documented",
    category: "data",
    description: {
      fr: "Barres divergentes positives, négatives et neutres autour d'un axe zéro.",
      en: "Divergent bars (positive, negative, neutral) around a shared zero axis."
    }
  },
  {
    name: "FilterPill",
    slug: "filter-pill",
    status: "documented",
    category: "data",
    description: {
      fr: "Pilule de filtre actif : champ, opérateur, valeur et bouton de retrait.",
      en: "Active filter pill: field, operator, value, and remove button."
    }
  },
  {
    name: "FilterBar",
    slug: "filter-bar",
    status: "documented",
    category: "data",
    description: {
      fr: "Barre regroupant des FilterPill avec action optionnelle « Tout effacer ».",
      en: "Bar grouping FilterPill chips with an optional clear-all action."
    }
  },
  {
    name: "SelectionChip",
    slug: "selection-chip",
    status: "documented",
    category: "data",
    description: {
      fr: "Chip compact affichant une sélection avec compteur et bouton d'effacement.",
      en: "Compact chip showing a selection with count and optional clear button."
    }
  },
  {
    name: "Overline",
    slug: "overline",
    status: "documented",
    category: "other",
    description: {
      fr: "Étiquette de section discrète en petites capitales (libellé de groupe au-dessus d'un bloc).",
      en: "Discreet small-caps section label (group heading above a block)."
    }
  },
  {
    name: "StatusDot",
    slug: "status-dot",
    status: "documented",
    category: "feedback",
    description: {
      fr: "Pastille de statut colorée par tonalité (ou couleur arbitraire), halo « live » optionnel et libellé optionnel.",
      en: "Status dot colored by tone (or arbitrary color), optional “live” halo and optional label."
    }
  },
  {
    name: "NavActionStack",
    slug: "nav-action-stack",
    status: "documented",
    category: "navigation",
    description: {
      fr: "Pile d'actions avec hiérarchie encodée dans le type (une seule primaire) et zone sensible destructrice isolée.",
      en: "Action stack with hierarchy encoded in the type (a single primary) and an isolated destructive danger zone."
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
