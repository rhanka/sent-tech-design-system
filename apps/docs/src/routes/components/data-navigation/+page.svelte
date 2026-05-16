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

  const rows = [
    { id: "forge", name: "Forge", status: "Active" },
    { id: "entropic", name: "Entropic", status: "Refactor" },
    { id: "graphify", name: "Graphify", status: "Discovery" }
  ];
</script>

<div class="docs-page">
  <div class="docs-language" role="group" aria-label="Language">
    <button type="button" aria-pressed={locale === "fr"} onclick={() => (locale = "fr")}>FR</button>
    <button type="button" aria-pressed={locale === "en"} onclick={() => (locale = "en")}>EN</button>
  </div>

  <section class="docs-hero">
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
          { label: "Home", href: "/" },
          { label: "Components", href: "/components/button" },
          { label: "Data", current: true }
        ]}
      />
      <SideNav
        label="Components"
        items={[
          { label: "Forms", href: "/components/forms" },
          { label: "Overlays", href: "/components/overlays" },
          { label: "Data & Navigation", href: "/components/data-navigation", active: true }
        ]}
      />
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "dataDisplay")}</h2>
    <div class="docs-example docs-example--stack">
      <Tabs
        items={[
          { value: "overview", label: "Overview", content: "Stable data primitives for product screens." },
          { value: "usage", label: "Usage", content: "Use data props first; keep sorting and fetching in the host app." }
        ]}
      />
      <Table
        caption="Products"
        columns={[
          { key: "name", label: "Name" },
          { key: "status", label: "Status" }
        ]}
        {rows}
      />
      <Pagination page={1} pageCount={3} />
      <PaginationNav bind:page={demoPage} pageCount={20} siblings={1} />
    </div>
  </section>

  <section class="docs-section">
    <h2>UI Shell Header</h2>
    <div class="docs-example docs-example--stack">
      <Header title="Sentropic Console" sticky={false} />
    </div>
  </section>

  <section class="docs-section">
    <h2>Progress Indicator</h2>
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
