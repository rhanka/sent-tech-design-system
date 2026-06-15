<script lang="ts">
  import { Card } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import { buildComponentNavGroups } from "$lib/docs-navigation";

  const groups = $derived(buildComponentNavGroups(locale.value));
  const total = $derived(groups.reduce((n, g) => n + g.items.length, 0));
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {locale.value === "fr" ? "Section · Catalogue" : "Section · Catalog"}
    </p>
    <h1>{locale.value === "fr" ? "Composants" : "Components"}</h1>
    <p>
      {#if locale.value === "fr"}
        Le catalogue des composants du design system, groupés par catégorie. Chaque page composant
        est rendue à l'identique en Svelte, React, Vue et Angular.
      {:else}
        The design system component catalog, grouped by category. Each component page renders
        identically in Svelte, React, Vue, and Angular.
      {/if}
    </p>
    <p class="components-meta">
      {total} {locale.value === "fr" ? "composants" : "components"}
    </p>
  </section>

  {#each groups as group (group.label)}
    <section class="docs-section">
      <h2>{group.label}</h2>
      <div class="components-grid">
        {#each group.items as item (item.slug)}
          <a class="components-card-link" href={item.href}>
            <Card class="components-card" interactive>
              <span
                class:components-card-status--documented={item.status === "documented"}
                class="components-card-status"
                aria-hidden="true"
              ></span>
              <span class="components-card-name">{item.label}</span>
            </Card>
          </a>
        {/each}
      </div>
    </section>
  {/each}
</div>

<style>
  .components-meta {
    color: var(--st-semantic-text-secondary);
    font-size: 0.9375rem;
    margin-top: 0.5rem;
  }

  .components-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
    gap: 0.75rem;
  }

  .components-card-link {
    text-decoration: none;
  }

  .components-card-link :global(.components-card) {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
  }

  .components-card-status {
    background: var(--st-semantic-border-strong, #94a3b8);
    border-radius: 50%;
    flex: 0 0 auto;
    height: 0.5rem;
    width: 0.5rem;
  }

  .components-card-status--documented {
    background: var(--st-semantic-status-success, #16a34a);
  }

  .components-card-name {
    color: var(--st-semantic-text-primary);
    font-size: 0.95rem;
    font-weight: 650;
  }
</style>
