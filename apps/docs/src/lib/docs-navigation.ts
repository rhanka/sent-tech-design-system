import {
  CATEGORY_LABELS,
  COMPONENTS,
  componentHref,
  groupByCategory,
  type ComponentStatus
} from "./components-catalog";
import type { Locale } from "./i18n";
import pkg from "../../package.json";

// Source unique : la version affichée dérive du package.json du docs (aligné sur
// la version du DS), pour ne plus jamais diverger (ex. v0.7.0 figé alors que le
// DS était en 0.9.0).
export const DOCS_VERSION = `v${pkg.version}`;
/** Version du DS Sentropic ciblée (dépendance épinglée). */
export const DS_VERSION = pkg.dependencies["@sentropic/design-system-themes"];

export interface DocsNavItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface ComponentNavItem extends DocsNavItem {
  slug: string;
  status: ComponentStatus;
}

export interface ComponentNavGroup {
  label: string;
  items: ComponentNavItem[];
}

export interface ViewNavItem extends DocsNavItem {
  slug: string;
}

export interface ViewNavGroup {
  label: string;
  items: ViewNavItem[];
}

interface DocsNavDefinition {
  label: Record<Locale, string>;
  href: string;
  external?: boolean;
}

// Premier niveau UNIQUE et aligné (barre horizontale = sidebar) : 3 pistes.
// Documentation regroupe fondations/tokens/thèmes/contrats/aperçu (sous-nav) ;
// Composants ouvre le catalogue ; Vues ouvre la galerie de patrons par domaine.
const DOCS_TOP_NAV_DEFINITIONS: DocsNavDefinition[] = [
  { label: { fr: "Documentation", en: "Documentation" }, href: "/" },
  { label: { fr: "Composants", en: "Components" }, href: "/#components" },
  { label: { fr: "Vues", en: "Views" }, href: "/views" }
];

export const DOCS_UTILITY_NAV: DocsNavItem[] = [
  {
    label: "GitHub",
    href: "https://github.com/rhanka/sent-tech-design-system",
    external: true
  }
];

// Sous-nav de la piste « Documentation » : sections de la page d'accueil +
// l'aperçu multi-framework. Tout ce qui était jadis top-level (Contrats, Aperçu)
// reste accessible ici — premier niveau réduit à 3 pistes sans rien orpheliner.
const DOCS_FOUNDATION_NAV_DEFINITIONS: DocsNavDefinition[] = [
  { label: { fr: "Vue d'ensemble", en: "Overview" }, href: "/" },
  { label: { fr: "Fondations", en: "Foundations" }, href: "/#foundations" },
  { label: { fr: "Tokens", en: "Tokens" }, href: "/#tokens" },
  { label: { fr: "Thèmes", en: "Themes" }, href: "/#themes" },
  { label: { fr: "Contrats", en: "Contracts" }, href: "/#contracts" },
  { label: { fr: "Aperçu multi-framework", en: "Multi-framework preview" }, href: "/preview" }
];

function localizeNavItems(items: DocsNavDefinition[], locale: Locale): DocsNavItem[] {
  return items.map((item) => ({
    label: item.label[locale],
    href: item.href,
    external: item.external
  }));
}

export function buildTopNav(locale: Locale = "fr"): DocsNavItem[] {
  return localizeNavItems(DOCS_TOP_NAV_DEFINITIONS, locale);
}

export function buildFoundationNav(locale: Locale = "fr"): DocsNavItem[] {
  return localizeNavItems(DOCS_FOUNDATION_NAV_DEFINITIONS, locale);
}

export const DOCS_TOP_NAV: DocsNavItem[] = buildTopNav("fr");
export const DOCS_FOUNDATION_NAV: DocsNavItem[] = buildFoundationNav("fr");

const ROOT_LABEL: Record<Locale, string> = { fr: "Catalogue", en: "Catalog" };
const PREVIEW_LABEL: Record<Locale, string> = {
  fr: "Aperçu multi-framework",
  en: "Preview"
};
const COMPONENTS_LABEL: Record<Locale, string> = { fr: "Composants", en: "Components" };
const COMPONENT_FALLBACK_LABEL: Record<Locale, string> = { fr: "Composant", en: "Component" };
const VIEWS_LABEL: Record<Locale, string> = { fr: "Vues", en: "Views" };
const VIEW_FALLBACK_LABEL: Record<Locale, string> = { fr: "Vue", en: "View" };

interface ViewNavDefinition {
  slug: string;
  label: Record<Locale, string>;
}

interface ViewNavGroupDefinition {
  label: Record<Locale, string>;
  views: ViewNavDefinition[];
}

// Galerie de vues regroupée par DOMAINE métier (pas par marque — aucune citation
// de produit). Chaque vue est un patron applicatif neutre, décliné des composants
// et patrons du DS. Source unique : alimente la sous-nav latérale « Vues » ET les
// libellés de fil d'Ariane.
const DOCS_VIEWS_NAV_DEFINITIONS: ViewNavGroupDefinition[] = [
  {
    label: { fr: "CRM & Ventes", en: "CRM & Sales" },
    views: [
      { slug: "pipeline-crm", label: { fr: "Pipeline CRM", en: "CRM Pipeline" } },
      { slug: "kanban", label: { fr: "Tableau Kanban", en: "Kanban Board" } }
    ]
  },
  {
    label: { fr: "ERP & Gestion", en: "ERP & Operations" },
    views: [
      { slug: "facture", label: { fr: "Facture client", en: "Customer Invoice" } },
      { slug: "object-page", label: { fr: "Page objet", en: "Object Page" } },
      { slug: "list-report", label: { fr: "Liste rapport", en: "List Report" } },
      { slug: "master-detail", label: { fr: "Maître-détail", en: "Master-Detail" } }
    ]
  },
  {
    label: { fr: "Support", en: "Support" },
    views: [{ slug: "file-tickets", label: { fr: "File de tickets", en: "Ticket Queue" } }]
  },
  {
    label: { fr: "Dashboards & BI", en: "Dashboards & BI" },
    views: [
      { slug: "dashboard", label: { fr: "Dashboard exécutif", en: "Executive Dashboard" } },
      { slug: "data-explorer", label: { fr: "Explorateur de données", en: "Data Explorer" } },
      { slug: "import-mapping", label: { fr: "Import / mappage", en: "Data Import / Mapping" } }
    ]
  },
  {
    label: { fr: "Fondations d'application", en: "Application Shell" },
    views: [
      { slug: "app-shell", label: { fr: "App Shell", en: "App Shell" } },
      { slug: "login", label: { fr: "Connexion", en: "Sign-in" } },
      { slug: "settings", label: { fr: "Paramètres", en: "Settings" } },
      { slug: "wizard", label: { fr: "Assistant", en: "Wizard" } }
    ]
  }
];

// Libellés de fil d'Ariane dérivés de la même source que la sous-nav.
const VIEW_LABELS: Record<string, Record<Locale, string>> = Object.fromEntries(
  DOCS_VIEWS_NAV_DEFINITIONS.flatMap((group) =>
    group.views.map((view) => [view.slug, view.label] as const)
  )
);

export function buildViewsNav(locale: Locale = "fr"): ViewNavGroup[] {
  return DOCS_VIEWS_NAV_DEFINITIONS.map((group) => ({
    label: group.label[locale],
    items: group.views.map((view) => ({
      label: view.label[locale],
      href: `/views/${view.slug}`,
      slug: view.slug
    }))
  }));
}

export function buildComponentNavGroups(locale: Locale = "fr"): ComponentNavGroup[] {
  return groupByCategory(COMPONENTS).map((group) => ({
    label: CATEGORY_LABELS[group.category][locale],
    items: group.components.map((component) => ({
      label: component.name,
      href: componentHref(component),
      slug: component.slug,
      status: component.status
    }))
  }));
}

export function resolveBreadcrumb(pathname: string, locale: Locale = "fr"): DocsNavItem[] {
  if (pathname === "/") {
    return [{ label: ROOT_LABEL[locale], href: "/" }];
  }

  if (pathname === "/preview") {
    return [
      { label: ROOT_LABEL[locale], href: "/" },
      { label: PREVIEW_LABEL[locale], href: "/preview" }
    ];
  }

  if (pathname.startsWith("/components/")) {
    const slug = pathname.split("/").filter(Boolean).at(-1);
    const component = COMPONENTS.find(
      (entry) => entry.slug === slug || entry.groupSlug === slug
    );

    return [
      { label: ROOT_LABEL[locale], href: "/" },
      { label: COMPONENTS_LABEL[locale], href: "/#components" },
      {
        label: component?.name ?? COMPONENT_FALLBACK_LABEL[locale],
        href: pathname
      }
    ];
  }

  if (pathname === "/views") {
    return [
      { label: ROOT_LABEL[locale], href: "/" },
      { label: VIEWS_LABEL[locale], href: "/views" }
    ];
  }

  if (pathname.startsWith("/views/")) {
    const slug = pathname.split("/").filter(Boolean).at(-1);
    return [
      { label: ROOT_LABEL[locale], href: "/" },
      { label: VIEWS_LABEL[locale], href: "/views" },
      {
        label: VIEW_LABELS[slug ?? ""]?.[locale] ?? slug ?? VIEW_FALLBACK_LABEL[locale],
        href: pathname
      }
    ];
  }

  return [{ label: ROOT_LABEL[locale], href: "/" }];
}
