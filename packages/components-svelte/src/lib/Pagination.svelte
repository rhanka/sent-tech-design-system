<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type PaginationProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    page: number;
    pageCount: number;
    previousLabel?: string;
    nextLabel?: string;
    class?: string;
    onpagechange?: (page: number) => void;
  };

  let {
    page,
    pageCount,
    previousLabel = "Previous",
    nextLabel = "Next",
    class: className,
    onpagechange,
    ...rest
  }: PaginationProps = $props();

  const classes = () => ["st-pagination", className].filter(Boolean).join(" ");
  const pages = () => Array.from({ length: pageCount }, (_, index) => index + 1);
  const go = (target: number) => {
    if (target >= 1 && target <= pageCount && target !== page) onpagechange?.(target);
  };
</script>

<nav {...rest} class={classes()} aria-label="Pagination">
  <button type="button" disabled={page <= 1} onclick={() => go(page - 1)}>{previousLabel}</button>
  {#each pages() as item}
    <button
      type="button"
      class:st-pagination__page--active={item === page}
      aria-label={`Page ${item}`}
      aria-current={item === page ? "page" : undefined}
      onclick={() => go(item)}
    >
      {item}
    </button>
  {/each}
  <button type="button" disabled={page >= pageCount} onclick={() => go(page + 1)}>{nextLabel}</button>
</nav>

<style>
  .st-pagination {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-pagination button {
    background: var(--st-component-pagination-background, var(--st-semantic-surface-default));
    border: 1px solid var(--st-component-pagination-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-pagination-radius, 0.375rem);
    color: var(--st-component-pagination-text, var(--st-semantic-text-primary));
    cursor: pointer;
    font: inherit;
    min-height: 2.25rem;
    min-width: 2.25rem;
    padding: 0 0.75rem;
  }

  .st-pagination__page--active {
    background: var(--st-component-pagination-activeBackground, var(--st-semantic-action-primary));
    color: var(--st-component-pagination-activeText, var(--st-semantic-action-primaryText));
  }

  .st-pagination button:disabled {
    color: var(--st-component-pagination-disabledText, var(--st-semantic-text-muted));
    cursor: not-allowed;
    opacity: 0.65;
  }
</style>
