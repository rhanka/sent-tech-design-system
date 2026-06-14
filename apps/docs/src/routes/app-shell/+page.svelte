<script lang="ts">
  // PRÉVISUALISATION A/B du header unique <sentropic-app-shell> dans le site docs.
  // Rendue DANS le +layout existant => le vieux header (référence) est en haut de
  // page, le NOUVEAU shell juste en dessous : comparaison inline, mêmes tokens.
  // Le sélecteur de thème du shell est autonome ici (CSS du thème injecté scopé à
  // `.app-shell-preview` via compileThemeModes), pour démontrer la theme-stability
  // sur les thèmes PUBLICS uniquement (pas de clone de marque privée).
  import AppShell from "@sentropic/app-shell/svelte";
  import type { SiteConfig } from "@sentropic/app-shell/site-config";
  import { compileThemeModes } from "$lib/compile-modes";
  import { sentTechTheme, type TenantTheme } from "@sentropic/design-system-themes";
  import { dsfrTheme } from "@sentropic/design-system-theme-dsfr";
  import { canadaTheme } from "@sentropic/design-system-theme-canada";
  import { quebecTheme } from "@sentropic/design-system-theme-quebec";
  import { buildTopNav } from "$lib/docs-navigation";
  import { locale } from "$lib/locale.svelte";
  import { framework, FRAMEWORKS, type FrameworkId } from "$lib/framework.svelte";

  const PUBLIC_THEMES: TenantTheme[] = [sentTechTheme, dsfrTheme, canadaTheme, quebecTheme];

  let activeThemeId = $state(sentTechTheme.id);
  const activeTheme = $derived(PUBLIC_THEMES.find((t) => t.id === activeThemeId) ?? sentTechTheme);
  const previewThemeCss = $derived(compileThemeModes(activeTheme, { selector: ".app-shell-preview" }));

  const fr = $derived(locale.value === "fr");

  const config = $derived<SiteConfig>({
    schemaVersion: 1,
    brand: { name: "Sentropic", productName: "Design System", logoSrc: "/SENT-logo-squared.svg", href: "/" },
    nav: buildTopNav(locale.value).map((i) => ({ label: i.label, href: i.href })),
    search: {
      enabled: true,
      mode: "callback",
      placeholder: fr ? "Rechercher…" : "Search…",
      onSearch: (q) => console.log("[app-shell preview] search:", q),
    },
    frameworkSwitcher: {
      enabled: true,
      current: framework.value,
      available: FRAMEWORKS.map((f) => ({ id: f.id, label: f.label })),
      mode: "callback",
      onChange: (id) => (framework.value = id as FrameworkId),
    },
    theming: {
      themes: PUBLIC_THEMES.map((t) => ({ id: t.id, label: t.label })),
      theme: activeThemeId,
      colorMode: "light",
      onThemeChange: (id) => (activeThemeId = id),
      themeLabel: fr ? "Changer le thème" : "Change theme",
    },
    locale: {
      current: locale.value,
      available: [{ code: "fr", label: "Français" }, { code: "en", label: "English" }],
      onChange: (code) => (locale.value = code as "fr" | "en"),
    },
    identity: { state: "anonymous", onSignIn: () => console.log("[app-shell preview] sign in") },
  });
</script>

<svelte:head>
  <title>{fr ? "Aperçu app-shell" : "App-shell preview"} · Sentropic Design System</title>
  {@html `<style>${previewThemeCss}</style>`}
</svelte:head>

<section class="app-shell-page">
  <header class="app-shell-page__intro">
    <h1>{fr ? "Aperçu : header unique « app-shell »" : "Preview: single « app-shell » header"}</h1>
    <p>
      {fr
        ? "Le bloc ci-dessous est le NOUVEAU header partagé (<sentropic-app-shell>, composant DS unique). Le header en haut de page est l'ACTUEL (référence). Compare-les, et change le thème via le sélecteur du nouveau header : la structure ne bouge pas, seuls les tokens recolorent."
        : "The block below is the NEW shared header (<sentropic-app-shell>, single DS component). The header at the top of the page is the CURRENT one (reference). Compare them, and switch theme via the new header's selector: the structure stays put, only tokens recolor."}
    </p>
  </header>

  <!-- Le wrapper porte data-st-theme + le CSS scopé => le shell (Shadow DOM) hérite des --st-*. -->
  <div class="app-shell-preview" data-st-theme={activeThemeId}>
    <AppShell {config} />
  </div>
</section>

<style>
  .app-shell-page { display: flex; flex-direction: column; gap: var(--st-spacing-6, 1.5rem); padding: var(--st-spacing-8, 2rem) var(--st-spacing-6, 1.5rem); max-width: 72rem; margin: 0 auto; }
  .app-shell-page__intro h1 { margin: 0 0 var(--st-spacing-2, 0.5rem); color: var(--st-semantic-text-primary); font-size: var(--st-font-size-2xl, 1.75rem); }
  .app-shell-page__intro p { margin: 0; color: var(--st-semantic-text-secondary); max-width: 52rem; }
  .app-shell-preview { border: 1px solid var(--st-semantic-border-subtle, #e2e8f0); border-radius: var(--st-radius-lg, 0.75rem); overflow: hidden; background: var(--st-semantic-surface-default); }
</style>
