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
  import { Archive, Copy, Pencil, Share2, Trash2 } from "@lucide/svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  let drawerOpen = $state(false);
  let popoverOpen = $state(false);
  let selectedAction = $state("edit");
  let selectedProduct = $state("forge");
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Lot · Complétion V1</p>
    <div class="docs-hero-title">
      <h1>{t(locale.value, "completionTitle")}</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{t(locale.value, "completionIntro")}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "actionsAndLinks")}</h2>
    <div class="docs-demo-stack">
      <article class="docs-demo-block">
        <h3>Link</h3>
        <p class="docs-demo-context">Lien stylé cohérent avec le DS, sans logique métier.</p>
        <div class="docs-demo-inline">
          <Link href="/components/data-navigation">Data navigation docs</Link>
        </div>
      </article>

      <article class="docs-demo-block">
        <h3>Alert</h3>
        <p class="docs-demo-context">Bandeau persistant pour les messages contextuels — pour les notifications éphémères, voir Toast.</p>
        <Alert tone="warning" title="Migration note" message="Keep product-specific workflow logic outside the base design system." />
      </article>

      <article class="docs-demo-block">
        <h3>Menu</h3>
        <p class="docs-demo-context">Menu d'actions avec icônes Lucide, groupes, séparateurs et item destructif.</p>
        <Menu
          label="Actions"
          items={[
            { kind: "group", label: "Edit" },
            { label: "Edit", value: "edit", icon: Pencil },
            { label: "Duplicate", value: "duplicate", icon: Copy },
            { kind: "divider" },
            { kind: "group", label: "Distribute" },
            { label: "Share", value: "share", icon: Share2 },
            { label: "Archive", value: "archive", icon: Archive },
            { kind: "divider" },
            { label: "Delete", value: "delete", icon: Trash2, danger: true }
          ]}
          onselect={(value) => (selectedAction = value)}
        />
        <p class="docs-demo-note">Selected action: <code>{selectedAction}</code></p>
      </article>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "disclosure")}</h2>
    <div class="docs-demo-stack">
      <article class="docs-demo-block">
        <h3>Dropdown</h3>
        <p class="docs-demo-context">Sélecteur de valeur unique dans une liste (listbox).</p>
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
      </article>

      <article class="docs-demo-block">
        <h3>Popover</h3>
        <p class="docs-demo-context">Détail compact ancré à un déclencheur, sans bloquer le flux.</p>
        <Popover open={popoverOpen} label="Service details">
          {#snippet trigger()}
            <Button variant="secondary" onclick={() => (popoverOpen = !popoverOpen)}>
              Service details
            </Button>
          {/snippet}
          <p>Popover content is for compact contextual detail, not full workflows.</p>
        </Popover>
      </article>

      <article class="docs-demo-block">
        <h3>Drawer</h3>
        <p class="docs-demo-context">Workflow secondaire latéral, sans quitter l'écran courant.</p>
        <div class="docs-demo-inline">
          <Button variant="secondary" onclick={() => (drawerOpen = true)}>Open drawer</Button>
        </div>
        <Drawer
          open={drawerOpen}
          title="Service details"
          description="Drawers hold secondary workflows without leaving the current screen."
          onclose={() => (drawerOpen = false)}
        >
          <p>Use drawers for inspection, configuration and side-by-side review tasks.</p>
        </Drawer>
      </article>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "operationalStates")}</h2>
    <div class="docs-demo-stack">
      <article class="docs-demo-block">
        <h3>EmptyState</h3>
        <p class="docs-demo-context">État vide avec une action principale claire vers la suite.</p>
        <EmptyState title="No service configured" message="Create the first service before publishing the tenant workspace.">
          {#snippet action()}
            <Button>Create service</Button>
          {/snippet}
        </EmptyState>
      </article>

      <article class="docs-demo-block">
        <h3>LoadingState</h3>
        <p class="docs-demo-context">Indicateur de chargement plein bloc ou squelette typographique.</p>
        <div class="docs-demo-stack">
          <LoadingState label="Loading services" />
          <LoadingState label="Preparing skeleton" variant="skeleton" />
        </div>
      </article>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
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
    <h2>{t(locale.value, "tokensTitle")}</h2>
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
