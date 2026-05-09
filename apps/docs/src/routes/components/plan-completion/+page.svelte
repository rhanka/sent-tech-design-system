<script lang="ts">
  import {
    Alert,
    Badge,
    Button,
    Drawer,
    Dropdown,
    EmptyState,
    Link,
    LoadingState,
    Menu,
    Popover
  } from "@sent-tech/components-svelte";
  import { t, type Locale } from "$lib/i18n";

  let locale = $state<Locale>("fr");
  let drawerOpen = $state(false);
  let selectedAction = $state("edit");
  let selectedProduct = $state("forge");
</script>

<div class="docs-page">
  <div class="docs-language" role="group" aria-label="Language">
    <button type="button" aria-pressed={locale === "fr"} onclick={() => (locale = "fr")}>FR</button>
    <button type="button" aria-pressed={locale === "en"} onclick={() => (locale = "en")}>EN</button>
  </div>

  <section class="docs-hero">
    <h1>
      {t(locale, "completionTitle")}
      <Badge tone="success">{t(locale, "statusStable")}</Badge>
    </h1>
    <p>{t(locale, "completionIntro")}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "actionsAndLinks")}</h2>
    <div class="docs-example docs-example--stack">
      <Link href="/components/data-navigation">Data navigation docs</Link>
      <Alert tone="warning" title="Migration note" message="Keep product-specific workflow logic outside the base design system." />
      <Menu
        label="Actions"
        items={[
          { label: "Edit", value: "edit" },
          { label: "Archive", value: "archive" },
          { label: "Delete", value: "delete", disabled: true }
        ]}
        onselect={(value) => (selectedAction = value)}
      />
      <p>Selected action: <code>{selectedAction}</code></p>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "disclosure")}</h2>
    <div class="docs-example docs-example--stack">
      <Dropdown
        label="Product"
        value={selectedProduct}
        options={[
          { label: "Forge", value: "forge" },
          { label: "Entropic", value: "entropic" },
          { label: "Graphify", value: "graphify" }
        ]}
        onselect={(value) => (selectedProduct = value)}
      />
      <Popover open label="Service details">
        <p>Popover content is for compact contextual detail, not full workflows.</p>
      </Popover>
      <Button variant="secondary" onclick={() => (drawerOpen = true)}>Open drawer</Button>
      <Drawer
        open={drawerOpen}
        title="Service details"
        description="Drawers hold secondary workflows without leaving the current screen."
        onclose={() => (drawerOpen = false)}
      >
        <p>Use drawers for inspection, configuration and side-by-side review tasks.</p>
      </Drawer>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "operationalStates")}</h2>
    <div class="docs-example docs-example--stack">
      <EmptyState title="No service configured" message="Create the first service before publishing the tenant workspace.">
        {#snippet action()}
          <Button>Create service</Button>
        {/snippet}
      </EmptyState>
      <LoadingState label="Loading services" />
      <LoadingState label="Preparing skeleton" variant="skeleton" />
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Component</th><th>Primary props</th><th>Semantics</th></tr>
      </thead>
      <tbody>
        <tr><td><code>Link</code></td><td><code>href</code>, <code>variant</code>, <code>disabled</code>, <code>external</code></td><td>native anchor</td></tr>
        <tr><td><code>Alert</code></td><td><code>tone</code>, <code>title</code>, <code>message</code></td><td><code>role="status"</code> or <code>role="alert"</code></td></tr>
        <tr><td><code>Menu</code></td><td><code>label</code>, <code>items</code>, <code>onselect</code></td><td><code>role="menu"</code>, <code>menuitem</code></td></tr>
        <tr><td><code>Popover</code></td><td><code>open</code>, <code>label</code>, <code>placement</code></td><td><code>role="dialog"</code></td></tr>
        <tr><td><code>Dropdown</code></td><td><code>label</code>, <code>options</code>, <code>value</code>, <code>onselect</code></td><td><code>listbox</code>, <code>option</code></td></tr>
        <tr><td><code>Drawer</code></td><td><code>open</code>, <code>title</code>, <code>side</code>, <code>onclose</code></td><td><code>role="dialog"</code>, <code>aria-modal</code></td></tr>
        <tr><td><code>EmptyState</code></td><td><code>title</code>, <code>message</code>, <code>action</code></td><td>section content</td></tr>
        <tr><td><code>LoadingState</code></td><td><code>label</code>, <code>variant</code></td><td><code>role="status"</code>, <code>aria-busy</code></td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-link-text</code></li>
      <li><code>--st-component-alert-infoBorder</code></li>
      <li><code>--st-component-menu-itemHoverBackground</code></li>
      <li><code>--st-component-popover-background</code></li>
      <li><code>--st-component-dropdown-selectedBackground</code></li>
      <li><code>--st-component-drawer-width</code></li>
      <li><code>--st-component-emptyState-background</code></li>
      <li><code>--st-component-loadingState-indicator</code></li>
    </ul>
  </section>
</div>
