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
  /* F10: breadcrumb typography on the root so the trail/link/separator inherit
     the per-theme size/line-height/tracking. Defaults (inherit / normal) keep
     the base Sent Tech render byte-identical; DSFR/Carbon pin their real metrics
     (DSFR 12px/20px, Carbon 14px/18px/0.16px). */
  .st-breadcrumb {
    font-size: var(--st-component-breadcrumb-fontSize, inherit);
    letter-spacing: var(--st-component-breadcrumb-letterSpacing, normal);
    line-height: var(--st-component-breadcrumb-lineHeight, normal);
  }

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
    font-weight: var(--st-component-breadcrumb-currentWeight, 600);
  }

  .st-breadcrumb__separator {
    color: var(--st-component-breadcrumb-separator, var(--st-semantic-text-muted));
  }
</style>
