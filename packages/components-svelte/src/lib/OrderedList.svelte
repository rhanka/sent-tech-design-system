<script lang="ts" module>
  import type { Snippet } from "svelte";

  export type OrderedListInput = string | OrderedListItem;

  export interface OrderedListItem {
    content: string | Snippet;
    /** Sous-items : chaînes ou objets (normalisés au rendu). */
    children?: OrderedListInput[];
  }
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type OrderedListProps = Omit<HTMLAttributes<HTMLOListElement>, "class"> & {
    items: OrderedListInput[];
    nested?: boolean;
    class?: string;
  };

  let {
    items,
    nested = false,
    class: className,
    ...rest
  }: OrderedListProps = $props();

  const classes = () =>
    ["st-orderedList", nested ? "st-orderedList--nested" : null, className]
      .filter(Boolean)
      .join(" ");

  function normalize(item: OrderedListInput): OrderedListItem {
    if (typeof item === "string") return { content: item };
    return item;
  }

  function isSnippet(value: string | Snippet): value is Snippet {
    return typeof value === "function";
  }
</script>

{#snippet renderItems(list: OrderedListInput[])}
  {#each list as raw, index (index)}
    {@const item = normalize(raw)}
    <li class="st-orderedList__item">
      {#if isSnippet(item.content)}
        {@render item.content()}
      {:else}
        {item.content}
      {/if}
      {#if item.children && item.children.length > 0}
        <ol class="st-orderedList st-orderedList--nested">
          {@render renderItems(item.children)}
        </ol>
      {/if}
    </li>
  {/each}
{/snippet}

<ol {...rest} class={classes()}>
  {@render renderItems(items)}
</ol>

<style>
  .st-orderedList {
    color: var(--st-semantic-text-primary);
    counter-reset: st-ol;
    display: grid;
    gap: var(--st-spacing-1, 0.25rem);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .st-orderedList--nested {
    margin-block-start: var(--st-spacing-1, 0.25rem);
    margin-inline-start: var(--st-spacing-4, 1rem);
  }

  .st-orderedList__item {
    counter-increment: st-ol;
    line-height: 1.5;
    padding-inline-start: var(--st-spacing-8, 2rem);
    position: relative;
  }

  .st-orderedList__item::before {
    color: var(--st-semantic-text-secondary);
    content: counter(st-ol) ".";
    font-variant-numeric: tabular-nums;
    inset-inline-start: 0;
    position: absolute;
    text-align: end;
    width: var(--st-spacing-6, 1.5rem);
  }
</style>
