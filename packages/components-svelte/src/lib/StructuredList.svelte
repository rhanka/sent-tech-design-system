<script lang="ts" module>
  import type { Snippet } from "svelte";

  export interface StructuredListItem {
    key: string;
    value: string | Snippet;
  }
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type StructuredListProps = Omit<HTMLAttributes<HTMLDListElement>, "class"> & {
    items: StructuredListItem[];
    bordered?: boolean;
    class?: string;
  };

  let {
    items,
    bordered = true,
    class: className,
    ...rest
  }: StructuredListProps = $props();

  const classes = () =>
    ["st-structuredList", bordered ? "st-structuredList--bordered" : null, className]
      .filter(Boolean)
      .join(" ");

  function isSnippet(value: string | Snippet): value is Snippet {
    return typeof value === "function";
  }
</script>

<dl {...rest} class={classes()}>
  {#each items as item (item.key)}
    <div class="st-structuredList__row">
      <dt class="st-structuredList__term">{item.key}</dt>
      <dd class="st-structuredList__definition">
        {#if isSnippet(item.value)}
          {@render item.value()}
        {:else}
          {item.value}
        {/if}
      </dd>
    </div>
  {/each}
</dl>

<style>
  .st-structuredList {
    color: var(--st-semantic-text-primary);
    display: grid;
    margin: 0;
    width: 100%;
  }

  .st-structuredList--bordered {
    border-block-start: 1px solid
      var(--st-component-structuredList-border, var(--st-semantic-border-subtle));
  }

  .st-structuredList__row {
    align-items: baseline;
    display: grid;
    gap: var(--st-spacing-3, 0.75rem);
    grid-template-columns: minmax(8rem, 1fr) 2fr;
    padding: 0.75rem 0;
  }

  .st-structuredList--bordered .st-structuredList__row {
    border-block-end: 1px solid
      var(--st-component-structuredList-border, var(--st-semantic-border-subtle));
  }

  .st-structuredList__term {
    color: var(--st-semantic-text-secondary);
    font-weight: 600;
    margin: 0;
  }

  .st-structuredList__definition {
    margin: 0;
  }
</style>
