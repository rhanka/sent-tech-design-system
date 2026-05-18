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
  } from "@sentropic/design-system-svelte";
  import { t, type Locale } from "$lib/i18n";

  let locale = $state<Locale>("fr");
  let drawerOpen = $state(false);
  let popoverOpen = $state(false);
  let selectedAction = $state("edit");
  let selectedProduct = $state("forge");

  const copy = {
    fr: {
      linkTitle: "Lien",
      alertTitle: "Alerte",
      menuTitle: "Menu",
      dropdownTitle: "Liste deroulante",
      popoverTitle: "Popover",
      drawerTitle: "Drawer",
      emptyStateTitle: "Etat vide",
      loadingTitle: "Chargement",
      dataNavigationDocs: "Documentation donnees et navigation",
      migrationNote: "Note de migration",
      migrationBody: "Garder la logique workflow produit hors du design system de base.",
      menuLabel: "Actions",
      edit: "Modifier",
      archive: "Archiver",
      delete: "Supprimer",
      selectedAction: "Action selectionnee",
      productLabel: "Produit",
      serviceDetails: "Details du service",
      popoverBody: "Le popover sert aux details contextuels compacts, pas aux workflows complets.",
      openDrawer: "Ouvrir le drawer",
      drawerDescription: "Les drawers portent des workflows secondaires sans quitter le contexte courant.",
      drawerBody: "Utiliser un drawer pour inspecter, configurer ou comparer en parallele.",
      noServiceTitle: "Aucun service configure",
      noServiceBody: "Creer un premier service avant de publier l'espace tenant.",
      createService: "Creer un service",
      loadingServices: "Chargement des services",
      loadingSkeleton: "Preparation du squelette",
      forge: "Forge",
      entropic: "Entropic",
      graphify: "Graphify"
    },
    en: {
      linkTitle: "Link",
      alertTitle: "Alert",
      menuTitle: "Menu",
      dropdownTitle: "Dropdown",
      popoverTitle: "Popover",
      drawerTitle: "Drawer",
      emptyStateTitle: "EmptyState",
      loadingTitle: "LoadingState",
      dataNavigationDocs: "Data navigation docs",
      migrationNote: "Migration note",
      migrationBody: "Keep product-specific workflow logic outside the base design system.",
      menuLabel: "Actions",
      edit: "Edit",
      archive: "Archive",
      delete: "Delete",
      selectedAction: "Selected action",
      productLabel: "Product",
      serviceDetails: "Service details",
      popoverBody: "Popover content is for compact contextual detail, not full workflows.",
      openDrawer: "Open drawer",
      drawerDescription: "Drawers hold secondary workflows without leaving the current screen.",
      drawerBody: "Use drawers for inspection, configuration and side-by-side review tasks.",
      noServiceTitle: "No service configured",
      noServiceBody: "Create the first service before publishing the tenant workspace.",
      createService: "Create service",
      loadingServices: "Loading services",
      loadingSkeleton: "Preparing skeleton",
      forge: "Forge",
      entropic: "Entropic",
      graphify: "Graphify"
    }
  } as const;

  const text = () => copy[locale];
</script>

<div class="docs-page">
  <div class="docs-language" role="group" aria-label="Language">
    <button type="button" aria-pressed={locale === "fr"} onclick={() => (locale = "fr")}>FR</button>
    <button type="button" aria-pressed={locale === "en"} onclick={() => (locale = "en")}>EN</button>
  </div>

  <section class="docs-hero">
    <p class="docs-hero-kicker">Lot · Complétion V1</p>
    <h1>
      {t(locale, "completionTitle")}
      <Badge tone="success">{t(locale, "statusStable")}</Badge>
    </h1>
    <p>{t(locale, "completionIntro")}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "actionsAndLinks")}</h2>
    <div class="docs-demo-stack">
      <article class="docs-demo-block">
        <h3>{text().linkTitle}</h3>
        <div class="docs-demo-inline">
          <Link href="/components/data-navigation">{text().dataNavigationDocs}</Link>
        </div>
      </article>

      <article class="docs-demo-block">
        <h3>{text().alertTitle}</h3>
        <Alert tone="warning" title={text().migrationNote} message={text().migrationBody} />
      </article>

      <article class="docs-demo-block">
        <h3>{text().menuTitle}</h3>
        <Menu
          label={text().menuLabel}
          items={[
            { label: text().edit, value: "edit" },
            { label: text().archive, value: "archive" },
            { label: text().delete, value: "delete", disabled: true }
          ]}
          onselect={(value) => (selectedAction = value)}
        />
        <p class="docs-demo-note">{text().selectedAction}: <code>{selectedAction}</code></p>
      </article>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "disclosure")}</h2>
    <div class="docs-demo-stack">
      <article class="docs-demo-block">
        <h3>{text().dropdownTitle}</h3>
        <Dropdown
          label={text().productLabel}
          value={selectedProduct}
          options={[
            { label: text().forge, value: "forge" },
            { label: text().entropic, value: "entropic" },
            { label: text().graphify, value: "graphify" }
          ]}
          onselect={(value) => (selectedProduct = value)}
        />
      </article>

      <article class="docs-demo-block">
        <h3>{text().popoverTitle}</h3>
        <Popover open={popoverOpen} label={text().serviceDetails}>
          {#snippet trigger()}
            <Button variant="secondary" onclick={() => (popoverOpen = !popoverOpen)}>
              {text().serviceDetails}
            </Button>
          {/snippet}
          <p>{text().popoverBody}</p>
        </Popover>
      </article>

      <article class="docs-demo-block">
        <h3>{text().drawerTitle}</h3>
        <div class="docs-demo-inline">
          <Button variant="secondary" onclick={() => (drawerOpen = true)}>{text().openDrawer}</Button>
        </div>
        <Drawer
          open={drawerOpen}
          title={text().serviceDetails}
          description={text().drawerDescription}
          onclose={() => (drawerOpen = false)}
        >
          <p>{text().drawerBody}</p>
        </Drawer>
      </article>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "operationalStates")}</h2>
    <div class="docs-demo-stack">
      <article class="docs-demo-block">
        <h3>{text().emptyStateTitle}</h3>
        <EmptyState title={text().noServiceTitle} message={text().noServiceBody}>
          {#snippet action()}
            <Button>{text().createService}</Button>
          {/snippet}
        </EmptyState>
      </article>

      <article class="docs-demo-block">
        <h3>{text().loadingTitle}</h3>
        <div class="docs-demo-stack">
          <LoadingState label={text().loadingServices} />
          <LoadingState label={text().loadingSkeleton} variant="skeleton" />
        </div>
      </article>
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
