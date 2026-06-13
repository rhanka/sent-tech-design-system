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

interface DocsNavDefinition {
  label: Record<Locale, string>;
  href: string;
  external?: boolean;
}

const DOCS_TOP_NAV_DEFINITIONS: DocsNavDefinition[] = [
  { label: { fr: "Fondations", en: "Foundations" }, href: "/#foundations" },
  { label: { fr: "Composants", en: "Components" }, href: "/#components" },
  { label: { fr: "Vues", en: "Views" }, href: "/views" },
  { label: { fr: "Aperçu", en: "Preview" }, href: "/preview" },
  { label: { fr: "Tokens", en: "Tokens" }, href: "/#tokens" },
  { label: { fr: "Thèmes", en: "Themes" }, href: "/#themes" },
  { label: { fr: "Contrats", en: "Contracts" }, href: "/#contracts" }
];

export const DOCS_UTILITY_NAV: DocsNavItem[] = [
  {
    label: "GitHub",
    href: "https://github.com/rhanka/sent-tech-design-system",
    external: true
  }
];

const DOCS_FOUNDATION_NAV_DEFINITIONS: DocsNavDefinition[] = [
  { label: { fr: "Vue d'ensemble", en: "Overview" }, href: "/" },
  { label: { fr: "Fondations", en: "Foundations" }, href: "/#foundations" },
  { label: { fr: "Tokens", en: "Tokens" }, href: "/#tokens" },
  { label: { fr: "Thèmes", en: "Themes" }, href: "/#themes" }
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
const VIEW_LABELS: Record<string, Record<Locale, string>> = {
  dashboard: { fr: "Dashboard exécutif", en: "Executive dashboard" }
};

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
