<script lang="ts">
  import { page } from "$app/state";
  import { browser } from "$app/environment";
  import { replaceState } from "$app/navigation";
  import { untrack } from "svelte";
  import "../app.css";
  // CSS global des composants (classes .st-*) pour styler les îles React/Vue :
  // le Svelte a ses styles scoped, mais les rendus React/Vue n'ont que les classes
  // sans règles tant que ce stylesheet global (identique entre frameworks) n'est pas chargé.
  import "@sentropic/design-system-react/styles.css";
  import { Boxes, ChevronDown, Github, Globe, Menu, Palette, User, X } from "@lucide/svelte";
  import { Header, IdentityMenu } from "@sentropic/design-system-svelte";
  import { auth } from "$lib/auth/auth.svelte";
  import {
    sentTechTheme,
    compileTheme,
    type TenantTheme
  } from "@sentropic/design-system-themes";
  import { dsfrTheme } from "@sentropic/design-system-theme-dsfr";
  import { carbonTheme } from "@sentropic/design-system-theme-carbon";
  import { airbusTheme } from "@sentropic/design-system-theme-airbus";
  import {
    DOCS_FOUNDATION_NAV,
    DOCS_TOP_NAV,
    DOCS_UTILITY_NAV,
    DOCS_VERSION,
    buildComponentNavGroups,
    resolveBreadcrumb,
    type ComponentNavItem
  } from "$lib/docs-navigation";
  import { locale } from "$lib/locale.svelte";
  import {
    FRAMEWORKS,
    framework,
    FRAMEWORK_STORAGE_KEY,
    DEFAULT_FRAMEWORK
  } from "$lib/framework.svelte";
  import {
    readUrlParams,
    resolveTheme,
    resolveFramework,
    buildUpdatedSearch,
    DEFAULT_THEME_ID,
    type ThemeId as UrlThemeId
  } from "$lib/url-state";
  import CompareButton from "$lib/compare/CompareButton.svelte";
  import CompareTriptych from "$lib/compare/CompareTriptych.svelte";
  import ChatWidget from "$lib/chat/ChatWidget.svelte";
  // Chromes thématisés — importés conditionnellement côté client uniquement.
  import ChromeCarbon from "$lib/chrome/ChromeCarbon.svelte";
  import ChromeDsfr from "$lib/chrome/ChromeDsfr.svelte";
  import ChromeAirbus from "$lib/chrome/ChromeAirbus.svelte";


  let { children } = $props();

  const componentGroups = buildComponentNavGroups();
  const breadcrumbs = $derived(resolveBreadcrumb(page.url.pathname));
  // Le sélecteur de framework n'a d'effet que là où des composants sont rendus
  // (pages composant + galerie /preview). Ailleurs (home, fondations, tokens,
  // thèmes, contrats) il ne bascule rien -> on le masque pour ne pas paraître cassé.
  const showFrameworkSwitcher = $derived(
    page.url.pathname.startsWith("/components") ||
    page.url.pathname === "/preview" ||
    page.url.pathname.startsWith("/views")
  );

  // Thèmes proposés : le DS Sentropic de référence + les 2 mappings tiers
  // (DSFR/Carbon) + le thème client Airbus (port d'anatomie).
  // (forge/entropic sont des tenants de démo internes — exclus du sélecteur.)
  const THEMES: TenantTheme[] = [sentTechTheme, dsfrTheme, carbonTheme, airbusTheme];
  const THEME_STORAGE_KEY = "st-docs-theme";
  // Balise <style> du thème de base, injectée en SSR pour le premier rendu.
  // (Construite dans le script pour éviter un littéral <style> dans le markup.)
  const baseThemeStyle = `<style data-st-base-theme>${compileTheme(sentTechTheme, { selector: ":root" })}</style>`;

  let activeThemeId = $state(sentTechTheme.id);
  const activeTheme = $derived(
    THEMES.find((theme) => theme.id === activeThemeId) ?? sentTechTheme
  );

  // Sync ENTRANTE URL -> state. Réactif à page.url.search ($app/state) pour couvrir :
  //  • le montage initial (priorité URL > localStorage > défaut) ;
  //  • la navigation arrière/avant (popstate) qui change l'URL sans re-monter le layout.
  // L'URL fait autorité : sur un back vers une URL sans param, on retombe sur la
  // valeur par défaut (param omis = défaut), pas sur localStorage, pour rester aligné
  // avec ce que l'URL exprime. localStorage ne sert que de repli au tout 1er chargement.
  let urlStateInitialized = $state(false);
  $effect(() => {
    if (!browser) return;
    // Dépendance réactive explicite : tout changement d'URL relit l'état.
    void page.url.search;
    const { theme: urlTheme, framework: urlFramework } = readUrlParams();

    // Lecture/écriture de l'état dans untrack() : cet effet ne doit dépendre QUE de
    // page.url.search. Sans untrack, lire framework.value/activeThemeId ici les rend
    // dépendances réactives -> cliquer un onglet (qui change framework.value) re-déclenche
    // cet effet AVANT que replaceState n'ait écrit l'URL, relit une URL encore vide et
    // réinitialise au défaut (boucle de feedback : le clic était écrasé en svelte).
    untrack(() => {
      if (!urlStateInitialized) {
        // 1er chargement : URL > localStorage > défaut.
        activeThemeId = resolveTheme(urlTheme, THEME_STORAGE_KEY);
        framework.value = resolveFramework(urlFramework, FRAMEWORK_STORAGE_KEY);
        urlStateInitialized = true;
        return;
      }
      // Navigations ultérieures (back/forward) : l'URL fait autorité.
      // Param absent => valeur par défaut. On n'écrit que si différent (anti-boucle).
      const nextTheme = urlTheme ?? DEFAULT_THEME_ID;
      if (nextTheme !== activeThemeId) activeThemeId = nextTheme;
      const nextFramework = urlFramework ?? DEFAULT_FRAMEWORK;
      if (nextFramework !== framework.value) framework.value = nextFramework;
    });
  });

  // Applique le thème actif sur :root via un <style> géré (réactif et fiable),
  // et persiste le choix.
  $effect(() => {
    const STYLE_ID = "st-docs-active-theme";
    let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = compileTheme(activeTheme, { selector: ":root" });
    document.documentElement.setAttribute("data-st-theme", activeThemeId);
    localStorage.setItem(THEME_STORAGE_KEY, activeThemeId);
  });

  // Reflète le framework actif sur <html data-st-framework> et persiste le choix.
  $effect(() => {
    framework.value; // dépendance explicite pour la réactivité
    framework.persist();
  });

  // Synchronise l'URL (theme + framework) via replaceState (pas d'entrée historique).
  // Déclenché à chaque changement de thème ou de framework, après l'init.
  $effect(() => {
    // Dépendances réactives EXPLICITES et UNIQUES : thème + framework. On ne lit
    // PAS `page` ici (le replaceState ci-dessous le modifie -> sinon l'effet se
    // re-déclenche sur sa propre écriture et « consomme » le tracking de
    // framework.value : depuis le défaut svelte (param omis), le 1er clic vers
    // react n'écrivait jamais l'URL). pathname via window.location (non réactif),
    // page.state lu en untrack.
    const theme = activeThemeId as UrlThemeId;
    const fw = framework.value;
    if (!browser) return;
    const newSearch = buildUpdatedSearch(theme, fw);
    if (newSearch !== window.location.search) {
      untrack(() => replaceState(window.location.pathname + newSearch, page.state));
    }
  });

  let isOpen = $state(false);
  let isThemeOpen = $state(false);
  let isFrameworkOpen = $state(false);
  let isMobileMenuOpen = $state(false);
  let isSidebarOpen = $state(false);

  // ── Identité (OAuth RP, phase 1) ──────────────────────────────────────────
  // Mappe le store auth (clé d'identité = iss+sub) vers la forme attendue par
  // l'IdentityMenu du DS (affichage uniquement). L'email n'est que décoratif.
  const identityUser = $derived(
    auth.user
      ? { displayName: auth.user.name ?? auth.user.sub, email: auth.user.email, id: auth.user.sub }
      : null
  );

  function isActive(href: string): boolean {
    const pathname = page.url.pathname;
    const hash = page.url.hash;

    if (href === "/") {
      return pathname === "/";
    }

    if (href === "/#components") {
      return pathname.startsWith("/components") || (pathname === "/" && hash === "#components");
    }

    if (href.startsWith("/#")) {
      return pathname === "/" && hash === href.slice(1);
    }

    const route = href.split("#")[0];
    return pathname === route || (route !== "/" && pathname.startsWith(route));
  }

  function isComponentActive(item: ComponentNavItem): boolean {
    return page.url.pathname === `/components/${item.slug}`;
  }

  function isSidebarDocActive(href: string): boolean {
    if (href === "/") {
      return page.url.pathname === "/" && !page.url.hash;
    }

    if (href.startsWith("/#")) {
      return page.url.pathname === "/" && page.url.hash === href.slice(1);
    }

    return isActive(href);
  }

  function isGroupOpen(items: ComponentNavItem[]): boolean {
    return items.some((item) => isComponentActive(item));
  }

  // ── Mode compare (Lot 2) ─────────────────────────────────────────────────
  // Toute la logique compare est CLIENT-ONLY : les query params ne sont pas
  // présents au SSR (prerender=true → page canonique sans params).
  // On utilise browser pour éviter tout accès localStorage/URL au SSR.

  const compareActive = $derived(
    browser && page.url.searchParams.get("compare") === "1"
  );
  const compareThemeId = $derived(
    browser ? (page.url.searchParams.get("theme") ?? null) : null
  );
  const compareScenarioId = $derived(
    browser ? (page.url.searchParams.get("scenario") ?? null) : null
  );
  const compareComponent = $derived(
    (() => {
      const match = page.url.pathname.match(/\/components\/([^/]+)/);
      if (!match) return null;
      return match[1].charAt(0).toUpperCase() + match[1].slice(1);
    })()
  );

  // ── Chrome par thème ────────────────────────────────────────────────────
  // SSR rend toujours le chrome sent-tech (pas d'accès localStorage).
  // Côté client, activeThemeId est restauré depuis localStorage et le chrome
  // bascule réactivement.
  // Les chromes Carbon/DSFR/Airbus encapsulent leur propre header + sidebar.
  // Le chrome sent-tech utilise le Header du composant DS + la sidebar existante.
  const useCustomChrome = $derived(
    browser && (activeThemeId === "carbon" || activeThemeId === "dsfr" || activeThemeId === "airbus")
  );
</script>

<svelte:window onclick={(e) => {
  const target = e.target as Element | null;
  if (isOpen && target && !target.closest(".docs-locale-wrapper")) {
    isOpen = false;
  }
  if (isThemeOpen && target && !target.closest(".docs-theme-wrapper")) {
    isThemeOpen = false;
  }
  if (isFrameworkOpen && target && !target.closest(".docs-framework-wrapper")) {
    isFrameworkOpen = false;
  }
}} onkeydown={(e) => {
  if (e.key === "Escape") {
    isOpen = false;
    isThemeOpen = false;
    isFrameworkOpen = false;
    isMobileMenuOpen = false;
    isSidebarOpen = false;
  }
}} />

<svelte:head>
  {@html baseThemeStyle}
</svelte:head>

{#snippet docsBrand()}
  <a class="docs-brand" href="/" aria-label="Sentropic Design System">
    <img class="docs-brand-mark" src="/SENT-logo-squared.svg" alt="" aria-hidden="true" />
    <span class="docs-brand-copy">
      <span class="docs-brand-name">Sentropic</span>
      <span class="docs-brand-product">Design System</span>
    </span>
  </a>
{/snippet}

{#snippet docsTopNav()}
  <nav class="docs-top-nav" aria-label="Documentation principale">
    {#each DOCS_TOP_NAV as item (item.href)}
      <a href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>
        {item.label}
      </a>
    {/each}
  </nav>
{/snippet}

{#snippet docsUtilityNav()}
  <nav class="docs-utility-nav" aria-label="Liens utiles">
    {#if showFrameworkSwitcher}
      {@render frameworkSelector()}
    {/if}

    {@render themeSelector()}

    <!-- Bouton Compare — client-only, visible ssi thème d'import + page composant -->
    <CompareButton activeThemeId={activeThemeId} pathname={page.url.pathname} />

    {@render langSelector()}

    <!-- Identité (contrat header §3 droite) : en anonyme un CONTRÔLE DU SOCLE
         (icône User, même densité que thème/langue), pas un bouton plein qui
         casse l'homogénéité. Connecté -> menu compte (IdentityMenu). -->
    {#if auth.status === "authed"}
      <IdentityMenu isAuthenticated={true} user={identityUser} onLogout={() => auth.logout()} />
    {:else}
      <button
        type="button"
        class="docs-header-control docs-header-menuButton docs-login-trigger"
        onclick={() => auth.login()}
        aria-label={locale.value === "fr" ? "Se connecter" : "Sign in"}
      >
        <User size={16} strokeWidth={2.1} aria-hidden="true" />
      </button>
    {/if}
  </nav>

  <button
    type="button"
    class="docs-mobile-menu-trigger"
    onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    aria-expanded={isMobileMenuOpen}
    aria-label="Menu principal"
  >
    {#if isMobileMenuOpen}
      <X size={20} />
    {:else}
      <Menu size={20} />
    {/if}
  </button>
{/snippet}

<!-- ── Snippet partagé : sélecteur de thème ──────────────────────────── -->
{#snippet themeSelector()}
  <div class="docs-theme-wrapper">
    <button
      type="button"
      class="docs-header-control docs-header-menuButton docs-locale-trigger docs-theme-trigger"
      onclick={() => (isThemeOpen = !isThemeOpen)}
      aria-expanded={isThemeOpen}
      aria-haspopup="true"
      aria-label={locale.value === "fr" ? "Changer le thème" : "Change theme"}
    >
      <Palette size={14} aria-hidden="true" />
      <span>{activeTheme.label}</span>
      <ChevronDown size={12} class="docs-locale-trigger-chevron {isThemeOpen ? 'rotated' : ''}" aria-hidden="true" />
    </button>

    {#if isThemeOpen}
      <div class="docs-locale-menu" role="menu">
        {#each THEMES as theme (theme.id)}
          <button
            type="button"
            class="docs-locale-item"
            class:active={activeThemeId === theme.id}
            role="menuitem"
            onclick={() => { activeThemeId = theme.id; isThemeOpen = false; }}
          >
            <span class="locale-check">{#if activeThemeId === theme.id}✓{/if}</span>
            <span>{theme.label}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

<!-- ── Snippet partagé : sélecteur de framework (Svelte/React/Vue) ────── -->
{#snippet frameworkSelector()}
  <div class="docs-framework-wrapper">
    <button
      type="button"
      class="docs-header-control docs-header-menuButton docs-locale-trigger docs-framework-trigger"
      onclick={() => (isFrameworkOpen = !isFrameworkOpen)}
      aria-expanded={isFrameworkOpen}
      aria-haspopup="true"
      aria-label={locale.value === "fr" ? "Changer de framework" : "Change framework"}
    >
      <Boxes size={14} aria-hidden="true" />
      <span>{framework.option.label}</span>
      <ChevronDown size={12} class="docs-locale-trigger-chevron {isFrameworkOpen ? 'rotated' : ''}" aria-hidden="true" />
    </button>

    {#if isFrameworkOpen}
      <div class="docs-locale-menu" role="menu">
        {#each FRAMEWORKS as option (option.id)}
          <button
            type="button"
            class="docs-locale-item"
            class:active={framework.value === option.id}
            role="menuitem"
            onclick={() => { framework.value = option.id; isFrameworkOpen = false; }}
          >
            <span class="locale-check">{#if framework.value === option.id}✓{/if}</span>
            <span>{option.label}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

<!-- ── Snippet partagé : sélecteur de langue ─────────────────────────── -->
{#snippet langSelector()}
  <div class="docs-locale-wrapper">
    <button
      type="button"
      class="docs-header-control docs-header-menuButton docs-locale-trigger"
      onclick={() => (isOpen = !isOpen)}
      aria-expanded={isOpen}
      aria-haspopup="true"
      aria-label={locale.value === "fr" ? "Changer la langue" : "Change language"}
    >
      <Globe size={14} class="docs-locale-trigger-icon" aria-hidden="true" />
      <span>{locale.value.toUpperCase()}</span>
      <ChevronDown size={12} class="docs-locale-trigger-chevron {isOpen ? 'rotated' : ''}" aria-hidden="true" />
    </button>

    {#if isOpen}
      <div class="docs-locale-menu" role="menu">
        <button
          type="button"
          class="docs-locale-item"
          class:active={locale.value === "fr"}
          role="menuitem"
          onclick={() => { locale.value = "fr"; isOpen = false; }}
        >
          <span class="locale-check">{#if locale.value === "fr"}✓{/if}</span>
          <span>Français</span>
        </button>
        <button
          type="button"
          class="docs-locale-item"
          class:active={locale.value === "en"}
          role="menuitem"
          onclick={() => { locale.value = "en"; isOpen = false; }}
        >
          <span class="locale-check">{#if locale.value === "en"}✓{/if}</span>
          <span>English</span>
        </button>
      </div>
    {/if}
  </div>
{/snippet}

<!-- ── Snippet partagé : bouton Compare (passé aux chromes tiers) ─────── -->
{#snippet sharedCompareButton()}
  <CompareButton activeThemeId={activeThemeId} pathname={page.url.pathname} />
{/snippet}

<!-- ── Contenu de page (encapsulé avec le mode compare Lot 2) ────────── -->
{#snippet pageContent()}
  <div class="docs-content-area" class:docs-content-area--compare={compareActive}>
    <nav class="docs-breadcrumb" aria-label="Fil d'Ariane">
      <ol>
        {#each breadcrumbs as crumb, index (crumb.href)}
          <li>
            {#if index === breadcrumbs.length - 1}
              <span aria-current="page">{crumb.label}</span>
            {:else}
              <a href={crumb.href}>{crumb.label}</a>
            {/if}
          </li>
        {/each}
      </ol>
    </nav>

    {#if compareActive && compareThemeId && compareScenarioId && compareComponent}
      <!-- Mode compare : triptyque plein-écran sous la breadcrumb.
           Le panneau (a) rend le contenu normal de la page (notre composant live).
           Le panneau (b) rend l'iframe officielle CDN (visuelle uniquement).
           Le panneau (c) = rail de gaps lus du registre JSON. -->
      <div class="docs-compare-wrap">
        {#snippet ourLive()}
          <main class="docs-main docs-main--compare" id="main-content">
            {@render children()}
          </main>
        {/snippet}
        <CompareTriptych
          themeId={compareThemeId}
          scenarioId={compareScenarioId}
          component={compareComponent}
          pathname={page.url.pathname}
          liveSlot={ourLive}
        />
      </div>
    {:else}
      <main class="docs-main" id="main-content">
        {@render children()}
      </main>
    {/if}
  </div>
{/snippet}

<!-- ═══════════════════════════════════════════════════════════════════════
     RENDU : chrome tiers (Carbon/DSFR/Airbus) ou chrome sent-tech par défaut.
     Le chrome tiers encapsule entièrement header + sidebar + contenu.
     Le chrome sent-tech conserve exactement la structure d'origine.
     ═══════════════════════════════════════════════════════════════════════ -->

{#if useCustomChrome && activeThemeId === "carbon"}
  <div data-st-theme={activeThemeId}>
    <ChromeCarbon
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeCarbon>
  </div>

{:else if useCustomChrome && activeThemeId === "dsfr"}
  <div data-st-theme={activeThemeId}>
    <ChromeDsfr
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeDsfr>
  </div>

{:else if useCustomChrome && activeThemeId === "airbus"}
  <div data-st-theme={activeThemeId}>
    <ChromeAirbus
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeAirbus>
  </div>

{:else}
  <!-- ── Chrome sent-tech par défaut (SSR + thème sent-tech) ── -->
  <a class="docs-skip-link" href="#main-content">Aller au contenu</a>
  <div class="docs-shell" data-st-theme={activeThemeId}>
    <!-- Barre du haut : composant Header complet et porté (logo + navigation + actions). -->
    <Header
      class="docs-header"
      label="En-tête de la documentation Sentropic"
      logo={docsBrand}
      navigation={docsTopNav}
      actions={docsUtilityNav}
    />

    {#if isMobileMenuOpen}
      <nav class="docs-mobile-nav" aria-label="Menu mobile">
        <div class="docs-mobile-nav-section">
          <span class="docs-mobile-nav-label">Navigation</span>
          {#each DOCS_TOP_NAV as item (item.href)}
            <a
              href={item.href}
              onclick={() => (isMobileMenuOpen = false)}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {#if item.label === "GitHub"}
                <Github size={15} strokeWidth={2.1} aria-hidden="true" />
              {/if}
              <span>{item.label}</span>
            </a>
          {/each}
        </div>
        <div class="docs-mobile-nav-section">
          <span class="docs-mobile-nav-label">Liens utiles</span>
          <span class="docs-header-control docs-version docs-mobile-version">{DOCS_VERSION}</span>
          {#each DOCS_UTILITY_NAV as item (item.href)}
            <a
              href={item.href}
              onclick={() => (isMobileMenuOpen = false)}
              rel={item.external ? "noreferrer" : undefined}
              target={item.external ? "_blank" : undefined}
            >
              {item.label}
            </a>
          {/each}

          <span class="docs-mobile-nav-label">Framework</span>
          <div class="docs-mobile-locale-switcher docs-mobile-framework-switcher">
            {#each FRAMEWORKS as option (option.id)}
              <button
                type="button"
                class="docs-mobile-locale-btn"
                class:active={framework.value === option.id}
                onclick={() => { framework.value = option.id; isMobileMenuOpen = false; }}
              >
                {option.label}
              </button>
            {/each}
          </div>

          <span class="docs-mobile-nav-label">{locale.value === "fr" ? "Thème" : "Theme"}</span>
          <div class="docs-mobile-locale-switcher docs-mobile-theme-switcher">
            {#each THEMES as theme (theme.id)}
              <button
                type="button"
                class="docs-mobile-locale-btn"
                class:active={activeThemeId === theme.id}
                onclick={() => { activeThemeId = theme.id; isMobileMenuOpen = false; }}
              >
                {theme.label}
              </button>
            {/each}
          </div>

          <div class="docs-mobile-locale-switcher">
            <button
              type="button"
              class="docs-mobile-locale-btn"
              class:active={locale.value === "fr"}
              onclick={() => { locale.value = "fr"; isMobileMenuOpen = false; }}
            >
              Français
            </button>
            <button
              type="button"
              class="docs-mobile-locale-btn"
              class:active={locale.value === "en"}
              onclick={() => { locale.value = "en"; isMobileMenuOpen = false; }}
            >
              English
            </button>
          </div>

          <span class="docs-mobile-nav-label">{locale.value === "fr" ? "Identité" : "Identity"}</span>
          {#if auth.status === "authed"}
            <IdentityMenu
              variant="accordion"
              isAuthenticated={true}
              user={identityUser}
              onLogout={() => { auth.logout(); isMobileMenuOpen = false; }}
            />
          {:else}
            <button
              type="button"
              class="docs-header-control docs-header-menuButton docs-locale-trigger"
              onclick={() => auth.login()}
              aria-label={locale.value === "fr" ? "Se connecter" : "Sign in"}
            >
              <User size={16} aria-hidden="true" />
              <span>{locale.value === "fr" ? "Se connecter" : "Sign in"}</span>
            </button>
          {/if}
        </div>
      </nav>
    {/if}


    <div class="docs-body">
      <!-- Déclencheur "Sommaire" visible uniquement sur mobile (≤ 768px) -->
      <div class="docs-sidebar-mobile-trigger-wrap">
        <button
          type="button"
          class="docs-sidebar-mobile-trigger"
          onclick={() => (isSidebarOpen = !isSidebarOpen)}
          aria-expanded={isSidebarOpen}
          aria-controls="docs-sidebar"
        >
          <span>{isSidebarOpen ? "▲" : "▼"}</span>
          <span>{isSidebarOpen ? "Masquer le sommaire" : "Sommaire / Table des matières"}</span>
        </button>
      </div>
      <aside class="docs-sidebar" id="docs-sidebar" class:docs-sidebar--open={isSidebarOpen}>
        <nav class="docs-side-nav" aria-label="Navigation de la documentation">
          <section class="docs-side-section" aria-labelledby="docs-foundations-heading">
            <h2 id="docs-foundations-heading">Documentation</h2>
            <ul>
              {#each DOCS_FOUNDATION_NAV as item (item.href)}
                <li>
                  <a
                    class="docs-side-link docs-side-link--docs"
                    href={item.href}
                    aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              {/each}
            </ul>
          </section>

          <section class="docs-side-section" aria-labelledby="docs-components-heading">
            <h2 id="docs-components-heading">Composants</h2>
            {#each componentGroups as group (group.label)}
              <details class="docs-side-group" open={isGroupOpen(group.items)}>
                <summary>
                  <ChevronDown class="docs-side-group-icon" size={16} strokeWidth={2.25} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul>
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="docs-side-link docs-side-link--component"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >
                        <span
                          class:docs-side-status--documented={item.status === "documented"}
                          class="docs-side-status"
                          aria-hidden="true"
                        ></span>
                        <span>{item.label}</span>
                      </a>
                    </li>
                  {/each}
                </ul>
              </details>
            {/each}
          </section>
        </nav>

        <!-- Pied de barre latérale : version + lien GitHub (déplacés du header). -->
        <div class="docs-sidebar-footer">
          <span class="docs-sidebar-version">{DOCS_VERSION}</span>
          {#each DOCS_UTILITY_NAV as item (item.href)}
            <a
              class="docs-sidebar-github"
              href={item.href}
              rel={item.external ? "noreferrer" : undefined}
              target={item.external ? "_blank" : undefined}
              aria-label={item.label}
            >
              {#if item.label === "GitHub"}
                <Github size={16} strokeWidth={2.1} aria-hidden="true" />
              {/if}
              <span>{item.label}</span>
            </a>
          {/each}
        </div>
      </aside>

      {@render pageContent()}
    </div>
  </div>
{/if}

<!-- Widget de chat « light-auth » — persistant sur toutes les routes/thèmes.
     Client-only (rendu gardé par `browser`), positionné en fixed bottom-right. -->
<ChatWidget />
