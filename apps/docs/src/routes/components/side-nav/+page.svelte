<script lang="ts">
  import { Badge, Header, SideNav } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = (frText: string, enText: string) =>
    locale.value === "fr" ? frText : enText;

  const sideNavItems = [
    { label: fr("Vue d’ensemble", "Overview"), href: "/components" },
    { label: fr("Composants", "Components"), href: "/components/button" },
    { label: fr("Thèmes", "Themes"), href: "/#themes", active: true },
    { label: fr("Contrats", "Contracts"), href: "/#contracts" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Navigation", "Component · Navigation")}</p>
    <div class="docs-hero-title">
      <h1>SideNav</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr(
        "Navigation verticale persistante pour les pages, basée sur une liste de liens natives.",
        "Persistent vertical page navigation built from a native link list."
      )}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr("Quand l’utiliser", "When to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Pour une navigation principale ou secondaire de type panneau.", "For a primary or secondary panel-style navigation.")}</li>
      <li>{fr("Quand la structure de pages doit rester visible pendant la navigation.", "When site structure should stay visible while navigating.")}</li>
      <li>{fr("Quand un état visuel clair de page active doit être maintenu.", "When a clear current-page state needs to be visible.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <div class="docs-example" aria-label={fr("Exemple side nav", "SideNav example")}>
      <Header title={fr("Sentropic", "Sentropic")} />
      <SideNav items={sideNavItems} label={fr("Navigation principale", "Primary navigation")} />
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{fr("Défaut", "Default")}</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr><td><code>items</code></td><td><code>SideNavItem[]</code></td><td><em>required</em></td><td>{fr("Liste de liens avec label/href/active", "List of links with label/href/active.")}</td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td>Navigation</td><td>{fr("Libellé ARIA du panneau <code>nav</code>.", "ARIA label for the <code>nav</code> element.")}</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td><td>{fr("Classe sur le wrapper <code>nav</code>.", "Class on the wrapper <code>nav</code>.")}</td></tr>
        <tr><td>{fr("Autres attributs", "Other attributes")}</td><td><code>HTMLAttributes&lt;HTMLElement&gt;</code></td><td>N/A</td><td>{fr("Propagés sur l’élément <code>nav</code>.", "Spread on the <code>nav</code> element.")}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-sideNav-background</code></li>
      <li><code>--st-component-sideNav-border</code></li>
      <li><code>--st-component-sideNav-width</code></li>
      <li><code>--st-component-sideNav-itemText</code></li>
      <li><code>--st-component-sideNav-activeBackground</code></li>
      <li><code>--st-component-sideNav-activeText</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
    </ul>
  </section>
</div>
