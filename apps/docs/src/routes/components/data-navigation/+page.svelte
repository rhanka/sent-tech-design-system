<script lang="ts">
  import {
    Badge,
    Breadcrumb,
    Header,
    Pagination,
    PaginationNav,
    ProgressIndicator,
    SideNav,
    Table,
    Tabs
  } from "@sentropic/design-system-svelte";
  import { t, type Locale } from "$lib/i18n";

  let locale = $state<Locale>("fr");
  let demoPage = $state(6);

  const copy = {
    fr: {
      home: "Accueil",
      components: "Composants",
      data: "Donnees",
      forms: "Formulaires",
      overlays: "Overlays",
      dataAndNavigation: "Donnees et navigation",
      overview: "Vue d'ensemble",
      usage: "Usage",
      overviewContent: "Primitives de donnees stables pour les ecrans produit.",
      usageContent: "Conserver le tri et le chargement dans l'application hote.",
      products: "Produits",
      name: "Nom",
      status: "Statut",
      uiShellHeader: "Header d'application",
      progressIndicator: "Indicateur de progression"
    },
    en: {
      home: "Home",
      components: "Components",
      data: "Data",
      forms: "Forms",
      overlays: "Overlays",
      dataAndNavigation: "Data & Navigation",
      overview: "Overview",
      usage: "Usage",
      overviewContent: "Stable data primitives for product screens.",
      usageContent: "Use data props first; keep sorting and fetching in the host app.",
      products: "Products",
      name: "Name",
      status: "Status",
      uiShellHeader: "UI Shell Header",
      progressIndicator: "Progress Indicator"
    }
  } as const;

  const text = () => copy[locale];
  const rows = $derived(
    locale === "fr"
      ? [
          { id: "forge", name: "Forge", status: "Actif" },
          { id: "entropic", name: "Entropic", status: "Refonte" },
          { id: "graphify", name: "Graphify", status: "Exploration" }
        ]
      : [
          { id: "forge", name: "Forge", status: "Active" },
          { id: "entropic", name: "Entropic", status: "Refactor" },
          { id: "graphify", name: "Graphify", status: "Discovery" }
        ]
  );
</script>

<div class="docs-page">
  <div class="docs-language" role="group" aria-label="Language">
    <button type="button" aria-pressed={locale === "fr"} onclick={() => (locale = "fr")}>FR</button>
    <button type="button" aria-pressed={locale === "en"} onclick={() => (locale = "en")}>EN</button>
  </div>

  <section class="docs-hero">
    <p class="docs-hero-kicker">Famille · Données et navigation</p>
    <h1>
      {t(locale, "dataNavigationTitle")}
      <Badge tone="success">{t(locale, "statusStable")}</Badge>
    </h1>
    <p>{t(locale, "dataNavigationIntro")}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "navigation")}</h2>
    <div class="docs-example docs-example--stack">
      <Breadcrumb
        items={[
          { label: text().home, href: "/" },
          { label: text().components, href: "/components/button" },
          { label: text().data, current: true }
        ]}
      />
      <SideNav
        label={text().components}
        items={[
          { label: text().forms, href: "/components/forms" },
          { label: text().overlays, href: "/components/overlays" },
          { label: text().dataAndNavigation, href: "/components/data-navigation", active: true }
        ]}
      />
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "dataDisplay")}</h2>
    <div class="docs-example docs-example--stack">
      <Tabs
        items={[
          { value: "overview", label: text().overview, content: text().overviewContent },
          { value: "usage", label: text().usage, content: text().usageContent }
        ]}
      />
      <Table
        caption={text().products}
        columns={[
          { key: "name", label: text().name },
          { key: "status", label: text().status }
        ]}
        {rows}
      />
      <Pagination page={1} pageCount={3} />
      <PaginationNav bind:page={demoPage} pageCount={20} siblings={1} />
    </div>
  </section>

  <section class="docs-section">
    <h2>{text().uiShellHeader}</h2>
    <div class="docs-example docs-example--stack">
      <Header title="Sentropic Console" sticky={false} />
    </div>
  </section>

  <section class="docs-section">
    <h2>{text().progressIndicator}</h2>
    <div class="docs-example docs-example--stack">
      <ProgressIndicator
        items={[
          { value: "intake", label: "Intake", status: "complete" },
          {
            value: "review",
            label: "Review",
            description: "QA + design sign-off",
            status: "current"
          },
          { value: "publish", label: "Publish", status: "upcoming" }
        ]}
      />
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Component</th><th>Primary props</th><th>Semantics</th></tr>
      </thead>
      <tbody>
        <tr><td><code>Table</code></td><td><code>columns</code>, <code>rows</code>, <code>caption</code></td><td>native table</td></tr>
        <tr><td><code>Tabs</code></td><td><code>items</code>, <code>activeValue</code>, <code>onchange</code></td><td><code>tablist</code>, <code>tab</code>, <code>tabpanel</code></td></tr>
        <tr><td><code>Pagination</code></td><td><code>page</code>, <code>pageCount</code>, <code>onpagechange</code></td><td><code>aria-current="page"</code></td></tr>
        <tr><td><code>PaginationNav</code></td><td><code>page</code>, <code>pageCount</code>, <code>siblings</code>, <code>onPageChange</code></td><td><code>aria-current="page"</code>, ellipses</td></tr>
        <tr><td><code>ProgressIndicator</code></td><td><code>items</code>, <code>vertical</code></td><td><code>list</code> + <code>aria-current="step"</code></td></tr>
        <tr><td><code>Breadcrumb</code></td><td><code>items</code></td><td><code>aria-current="page"</code></td></tr>
        <tr><td><code>SideNav</code></td><td><code>items</code>, <code>label</code></td><td><code>nav</code>, active link current page</td></tr>
        <tr><td><code>Header</code></td><td><code>title</code>, <code>logo</code>, <code>navigation</code>, <code>actions</code></td><td><code>banner</code> landmark</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-dataTable-headerBackground</code></li>
      <li><code>--st-component-dataTable-border</code></li>
      <li><code>--st-component-tabs-indicator</code></li>
      <li><code>--st-component-pagination-activeBackground</code></li>
      <li><code>--st-component-breadcrumb-currentText</code></li>
      <li><code>--st-component-sideNav-activeBackground</code></li>
    </ul>
  </section>
</div>
