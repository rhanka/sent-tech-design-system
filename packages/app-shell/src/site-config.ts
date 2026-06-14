// ─────────────────────────────────────────────────────────────────────────────
// CONTRAT `siteConfig` de `<sentropic-app-shell>` — source unique de paramétrage.
//
// Principe anti-dérive : TOUT ce qui doit être pixel-perfect est une DONNÉE de ce
// contrat (rendu par le shell), JAMAIS un slot bricolé en aval. Recherche, switcher
// framework et identité sont first-class ici — ce sont eux qui dérivaient quand ils
// vivaient hors du composant partagé.
//
// Tolérance de version (skew) : le shell IGNORE les clés inconnues et applique des
// défauts aux clés absentes ; il ne throw jamais. Un site sur shell vN recevant une
// config vN+1 ne casse pas (clés futures ignorées) ; l'inverse dégrade gracieusement.
//
// Contrôlé, jamais propriétaire de l'état : le shell SIGNALE (callbacks/`navigate`),
// l'hôte APPLIQUE (router, auth, bascule + chargement du CSS de thème). Cohérent avec
// « URL = source de vérité thème+framework » et « DS contrôlé/présentationnel ».
// ─────────────────────────────────────────────────────────────────────────────

/** Deux modes pour toute action navigable : `callback` (SPA riche) ou `navigate`
 *  (lien `href`, marche en HTML pur / site vitrine sans JS applicatif). */
export type ActionMode = "callback" | "navigate";

export interface NavItem {
  label: string;
  href: string;
  /** Marqué actif (souligné, aria-current=page). Sinon dérivé de `activePath`. */
  active?: boolean;
  /** Sous-navigation optionnelle. */
  children?: NavItem[];
}

export interface ThemeOption {
  id: string; // ex. "sent-tech", "carbon", "dsfr", "airbus", "canada", "quebec"
  label: string;
}

export type ColorMode = "light" | "dark" | "auto";

export interface SiteConfig {
  /** Version de schéma du contrat (info ; le shell ne throw jamais sur écart). */
  schemaVersion?: number;

  // ── Marque (structurellement invariante, recolorée par tokens) ───────────────
  brand: {
    name: string; // "Sentropic"
    productName?: string; // sous-titre produit ("dataviz", "Design System"…)
    logoSrc?: string; // URL ou SVG inline — PAS de logo par thème ici (invariance)
    href?: string; // défaut "/"
    label?: string; // aria-label (sinon dérivé name + productName)
  };

  // ── Navigation principale ────────────────────────────────────────────────────
  nav?: NavItem[];
  /** Chemin courant : calcule `active` si non fourni explicitement par item. */
  activePath?: string;
  navLabel?: string;

  // ── Recherche (first-class) ──────────────────────────────────────────────────
  search?: {
    enabled: boolean;
    placeholder?: string;
    mode: ActionMode;
    onSearch?: (query: string) => void; // mode "callback"
    hrefTemplate?: string; // mode "navigate", ex. "/search?q={q}"
    /** Le shell ouvre une palette (popover top-layer). L'hôte fournit le panneau de
     *  résultats via le slot `search-results`, ou laisse le shell afficher l'input seul. */
  };

  // ── Thème (contrôlé ; structure invariante, seuls les tokens changent) ────────
  theming: {
    themes: ThemeOption[];
    theme: string; // id actif
    colorMode?: ColorMode; // undefined => toggle masqué
    onThemeChange?: (id: string) => void; // l'hôte applique data-st-theme + charge le CSS du thème
    onColorModeChange?: (mode: ColorMode) => void;
    themeLabel?: string;
    colorModeLabels?: { light: string; dark: string; auto: string };
  };

  // ── Langue ───────────────────────────────────────────────────────────────────
  locale?: {
    current: string; // "fr" | "en" | …
    available: Array<{ code: string; label: string }>;
    mode?: ActionMode;
    onChange?: (code: string) => void;
    hrefTemplate?: string;
    label?: string;
  };

  // ── Switcher de framework (first-class ; docs/dataviz multi-fw) ───────────────
  frameworkSwitcher?: {
    enabled: boolean;
    current: string; // "svelte" | "react" | "vue" | "html"
    available: Array<{ id: string; label: string }>;
    mode: ActionMode;
    onChange?: (id: string) => void;
    hrefTemplate?: string;
  };

  // ── Identité / login (le bout qui casse aujourd'hui → first-class) ───────────
  identity?: {
    state: "anonymous" | "authenticated";
    user?: { name: string; avatarSrc?: string };
    signInHref?: string; // mode lien (HTML pur)
    onSignIn?: () => void; // mode callback (SPA)
    onSignOut?: () => void;
    menu?: Array<{ label: string; href?: string; onClick?: () => void }>;
    label?: string;
  };

  // ── Liens utilitaires ────────────────────────────────────────────────────────
  links?: { github?: string };

  // ── Soupapes contrôlées (slots nommés) — HORS garantie pixel-perfect ─────────
  // À utiliser avec parcimonie : tout DOM injecté par l'hôte échappe au shell.
  slots?: {
    extraActions?: boolean; // active <slot name="extra-actions">
    searchResults?: boolean; // active <slot name="search-results"> dans la palette
  };
}

/** Token contract : les `--st-*` que le shell CONSOMME (doivent être fournis par le
 *  thème actif de l'hôte ; fallback CSS sinon, jamais de trou visuel). Sert de
 *  référence de découplage shell ⇄ thèmes. */
export const SHELL_TOKEN_CONTRACT = [
  "--st-semantic-surface-default",
  "--st-semantic-text-primary",
  "--st-semantic-text-secondary",
  "--st-semantic-border-subtle",
  "--st-font-sans",
  "--st-spacing-4",
  "--st-spacing-6",
  "--st-shadow-lg",
] as const;
