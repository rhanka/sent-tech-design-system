<script lang="ts">
  import { Badge, AppChrome } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = $derived(locale.value === "fr");

  // Démo « live » entièrement contrôlée : la page pilote l'état des contrôles
  // et reçoit les callbacks, exactement comme le ferait dataviz.sent-tech.ca.
  const themes = [
    { id: "sent-tech", label: "Sentropic" },
    { id: "forge", label: "Forge" },
    { id: "entropic", label: "Entropic" },
    { id: "carbon", label: "Carbon" },
    { id: "dsfr", label: "DSFR" },
    { id: "airbus", label: "Airbus" }
  ];

  let demoTheme = $state("sent-tech");
  let demoColorMode = $state<"light" | "dark" | "auto">("light");
  let demoLocale = $state<"fr" | "en">("fr");
  let demoMenuOpen = $state(false);

  const demoNav = $derived([
    { label: fr ? "Vues" : "Views", href: "#views", active: true },
    { label: fr ? "Données" : "Data", href: "#data" },
    { label: fr ? "Réglages" : "Settings", href: "#settings" }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Navigation · Coque applicative" : "Navigation · Application shell"}</p>
    <div class="docs-hero-title">
      <h1>AppChrome</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr
        ? "Coque de navigation complète : la barre du haut assemblée de design-system.sent-tech.ca, publiée comme un composant unique et paramétrable. Elle compose AppHeader et ajoute les contrôles utilitaires (sélecteur de thème, bascule clair/sombre, sélecteur de langue, lien GitHub, zone identité) plus le burger et le tiroir mobile. Entièrement CONTRÔLÉE : on passe le produit, la nav, le titre et l'état + callbacks des contrôles ; aucune logique de routage ni de persistance n'est embarquée."
        : "Full navigation shell: the assembled top bar of design-system.sent-tech.ca, published as a single parameterized component. It composes AppHeader and adds the utility controls (theme selector, light/dark toggle, language selector, GitHub link, identity zone) plus the mobile burger and drawer. Fully CONTROLLED: you pass product, nav, title and the controls' state + callbacks; no routing or persistence logic is embedded."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <div class="docs-appChrome-demo">
      <AppChrome
        brandName="Sentropic"
        productName="dataviz"
        logoSrc="/SENT-logo-squared.svg"
        brandHref="#"
        nav={demoNav}
        themes={themes}
        theme={demoTheme}
        onThemeChange={(id) => (demoTheme = id)}
        colorMode={demoColorMode}
        onColorModeChange={(mode) => (demoColorMode = mode)}
        locale={demoLocale}
        onLocaleChange={(value) => (demoLocale = value)}
        githubHref="https://github.com/rhanka/sent-tech-design-system"
        mobileMenuOpen={demoMenuOpen}
        onMobileMenuToggle={() => (demoMenuOpen = !demoMenuOpen)}
      >
        {#snippet extraSelectors()}
          <span style="font-size: 0.75rem; padding: 0.2rem 0.5rem; background: var(--st-semantic-surface-subtle); border-radius: var(--st-radius-xs, 0.25rem); color: var(--st-semantic-text-secondary);">v2.0</span>
        {/snippet}
      </AppChrome>
    </div>
    <p class="docs-appChrome-state">
      {fr ? "État courant" : "Current state"}, {fr ? "thème" : "theme"}: <code>{demoTheme}</code>,
      {fr ? "mode couleur" : "color mode"}: <code>{demoColorMode}</code>,
      {fr ? "langue" : "locale"}: <code>{demoLocale}</code>
    </p>
    <p>
      {fr
        ? "dataviz.sent-tech.ca obtient un chrome byte-identique en ne fournissant que product=\"dataviz\", sa nav, le titre et l'état/callbacks des contrôles. Le markup, les classes (st-appChrome*) et les tokens sont identiques entre Svelte, React, Vue et Angular."
        : "dataviz.sent-tech.ca gets a byte-identical chrome by supplying only product=\"dataviz\", its nav, the title and the controls' state/callbacks. The markup, classes (st-appChrome*) and tokens are identical across Svelte, React and Vue."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>brandName</code></td><td><code>string</code></td><td><code>"Sentropic"</code></td></tr>
        <tr><td><code>productName</code></td><td><code>string</code></td><td><em>–</em></td></tr>
        <tr><td><code>logoSrc</code></td><td><code>string</code></td><td><em>–</em></td></tr>
        <tr><td><code>brandHref</code></td><td><code>string</code></td><td><code>"/"</code></td></tr>
        <tr><td><code>nav</code></td><td><code>{`{ label, href, active? }[]`}</code></td><td><code>[]</code></td></tr>
        <tr><td><code>themes</code></td><td><code>{`{ id, label }[]`}</code></td><td><code>[]</code></td></tr>
        <tr><td><code>theme</code> / <code>onThemeChange</code></td><td><code>{`string / (id) => void`}</code></td><td><em>–</em></td></tr>
        <tr><td><code>colorMode</code> / <code>onColorModeChange</code></td><td><code>{`"light"|"dark"|"auto" / (m) => void`}</code></td><td><em>–</em></td></tr>
        <tr><td><code>locale</code> / <code>onLocaleChange</code></td><td><code>{`"fr"|"en" / (l) => void`}</code></td><td><em>–</em></td></tr>
        <tr><td><code>githubHref</code></td><td><code>string</code></td><td><em>–</em></td></tr>
        <tr><td><code>identity</code></td><td><code>Snippet | ReactNode | slot</code></td><td><em>–</em></td></tr>
        <tr><td><code>extraSelectors</code></td><td><code>Snippet | ReactNode | slot</code></td><td><em>–</em></td></tr>
        <tr><td><code>mobileMenuOpen</code> / <code>onMobileMenuToggle</code></td><td><code>{`boolean / () => void`}</code></td><td><code>false</code></td></tr>
      </tbody>
    </table>
    <p>
      {fr
        ? "Les contrôles sont contrôlés : passer la prop d'état sans son callback fige le contrôle ; omettre l'état masque le contrôle (ex. pas de colorMode → pas de bascule)."
        : "Controls are controlled: passing the state prop without its callback freezes the control; omitting the state hides the control (e.g. no colorMode → no toggle)."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <p>
      {fr
        ? "AppChrome est token-only (zéro hex) : surfaces, bordures, textes et liens lisent les tokens sémantiques (--st-semantic-surface-*, --st-semantic-border-*, --st-semantic-text-*). Il réutilise les classes publiées d'AppHeader (st-appHeader__navLink, st-appHeader__control) pour le style canonique de la nav et des contrôles."
        : "AppChrome is token-only (zero hex): surfaces, borders, text and links read semantic tokens (--st-semantic-surface-*, --st-semantic-border-*, --st-semantic-text-*). It reuses AppHeader's published classes (st-appHeader__navLink, st-appHeader__control) for the canonical nav and control styling."}
    </p>
  </section>
</div>

<style>
  .docs-appChrome-demo {
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: var(--st-radius-md, 0.5rem);
    overflow: hidden;
  }

  .docs-appChrome-state {
    color: var(--st-semantic-text-secondary, #475569);
    font-size: 0.875rem;
  }
</style>
