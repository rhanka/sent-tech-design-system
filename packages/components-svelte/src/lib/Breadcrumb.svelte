<script lang="ts" module>
  export interface BreadcrumbItem {
    label: string;
    href?: string;
    current?: boolean;
  }
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type BreadcrumbProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    items: BreadcrumbItem[];
    label?: string;
    class?: string;
  };

  let { items, label = "Breadcrumb", class: className, ...rest }: BreadcrumbProps = $props();
  const classes = () => ["st-breadcrumb", className].filter(Boolean).join(" ");
</script>

<nav {...rest} class={classes()} aria-label={label}>
  <ol>
    {#each items as item, index}
      <li>
        {#if item.href && !item.current}
          <a href={item.href}>{item.label}</a>
        {:else}
          <span aria-current={item.current ? "page" : undefined}>{item.label}</span>
        {/if}
        {#if index < items.length - 1}<span class="st-breadcrumb__separator" aria-hidden="true">/</span>{/if}
      </li>
    {/each}
  </ol>
</nav>

<style>
  .st-breadcrumb ol {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-2, 0.5rem);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .st-breadcrumb li {
    align-items: center;
    color: var(--st-component-breadcrumb-text, var(--st-semantic-text-secondary));
    display: inline-flex;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-breadcrumb a {
    color: var(--st-component-breadcrumb-linkText, var(--st-semantic-text-link));
  }

  .st-breadcrumb [aria-current="page"] {
    color: var(--st-component-breadcrumb-currentText, var(--st-semantic-text-primary));
    font-weight: 600;
  }

  .st-breadcrumb__separator {
    color: var(--st-component-breadcrumb-separator, var(--st-semantic-text-muted));
  }
</style>
