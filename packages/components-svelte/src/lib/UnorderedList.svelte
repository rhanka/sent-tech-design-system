<script lang="ts" module>
  import type { Snippet } from "svelte";

  export interface UnorderedListItem {
    content: string | Snippet;
    children?: UnorderedListItem[];
  }

  export type UnorderedListInput = string | UnorderedListItem;
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type UnorderedListProps = Omit<HTMLAttributes<HTMLUListElement>, "class"> & {
    items: UnorderedListInput[];
    nested?: boolean;
    class?: string;
  };

  let {
    items,
    nested = false,
    class: className,
    ...rest
  }: UnorderedListProps = $props();

  const classes = () =>
    [
      "st-unorderedList",
      nested ? "st-unorderedList--nested" : null,
      className
    ]
      .filter(Boolean)
      .join(" ");

  function normalize(item: UnorderedListInput): UnorderedListItem {
    if (typeof item === "string") return { content: item };
    return item;
  }

  function isSnippet(value: string | Snippet): value is Snippet {
    return typeof value === "function";
  }
</script>

<ul {...rest} class={classes()}>
  {#each items as raw, index (index)}
    {@const item = normalize(raw)}
    <li class="st-unorderedList__item">
      {#if isSnippet(item.content)}
        {@render item.content()}
      {:else}
        {item.content}
      {/if}
      {#if item.children && item.children.length > 0}
        <ul class="st-unorderedList st-unorderedList--nested">
          {#each item.children as childRaw, childIndex (childIndex)}
            {@const child = normalize(childRaw)}
            <li class="st-unorderedList__item">
              {#if isSnippet(child.content)}
                {@render child.content()}
              {:else}
                {child.content}
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </li>
  {/each}
</ul>

<style>
  .st-unorderedList {
    color: var(--st-semantic-text-primary);
    display: grid;
    gap: var(--st-spacing-1, 0.25rem);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .st-unorderedList--nested {
    gap: var(--st-spacing-1, 0.25rem);
    margin-block-start: var(--st-spacing-1, 0.25rem);
    margin-inline-start: var(--st-spacing-4, 1rem);
  }

  .st-unorderedList__item {
    line-height: 1.5;
    padding-inline-start: var(--st-spacing-4, 1rem);
    position: relative;
  }

  .st-unorderedList__item::before {
    background: currentColor;
    border-radius: 50%;
    content: "";
    display: block;
    height: 0.3125rem;
    inset-block-start: 0.5625rem;
    inset-inline-start: var(--st-spacing-1, 0.25rem);
    opacity: 0.65;
    position: absolute;
    width: 0.3125rem;
  }
</style>
