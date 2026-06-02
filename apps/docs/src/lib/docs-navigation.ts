import {
  CATEGORY_LABELS,
  COMPONENTS,
  componentHref,
  groupByCategory,
  type ComponentStatus
} from "./components-catalog";
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

export const DOCS_TOP_NAV: DocsNavItem[] = [
  { label: "Fondations", href: "/#foundations" },
  { label: "Composants", href: "/#components" },
  { label: "Tokens", href: "/#tokens" },
  { label: "Thèmes", href: "/#themes" },
  { label: "Contrats", href: "/#contracts" }
];

export const DOCS_UTILITY_NAV: DocsNavItem[] = [
  {
    label: "GitHub",
    href: "https://github.com/rhanka/sent-tech-design-system",
    external: true
  }
];

export const DOCS_FOUNDATION_NAV: DocsNavItem[] = [
  { label: "Vue d'ensemble", href: "/" },
  { label: "Fondations", href: "/#foundations" },
  { label: "Tokens", href: "/#tokens" },
  { label: "Themes tenant", href: "/#themes" },
  { label: "Contrat marque blanche", href: "/#contracts" }
];

export function buildComponentNavGroups(): ComponentNavGroup[] {
  return groupByCategory(COMPONENTS).map((group) => ({
    label: CATEGORY_LABELS[group.category].fr,
    items: group.components.map((component) => ({
      label: component.name,
      href: componentHref(component),
      slug: component.slug,
      status: component.status
    }))
  }));
}

export function resolveBreadcrumb(pathname: string): DocsNavItem[] {
  if (pathname === "/") {
    return [{ label: "Catalogue", href: "/" }];
  }

  if (pathname.startsWith("/components/")) {
    const slug = pathname.split("/").filter(Boolean).at(-1);
    const component = COMPONENTS.find(
      (entry) => entry.slug === slug || entry.groupSlug === slug
    );

    return [
      { label: "Catalogue", href: "/" },
      { label: "Composants", href: "/#components" },
      {
        label: component?.name ?? "Composant",
        href: pathname
      }
    ];
  }

  return [{ label: "Catalogue", href: "/" }];
}
