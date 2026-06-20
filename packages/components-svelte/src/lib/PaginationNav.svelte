<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { ChevronLeft, ChevronRight, Ellipsis } from "@lucide/svelte";

  type PaginationNavProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    page: number;
    pageCount: number;
    siblings?: number;
    locale?: string;
    label?: string;
    previousLabel?: string;
    nextLabel?: string;
    class?: string;
    onPageChange?: (page: number) => void;
  };

  let {
    page = $bindable(1),
    pageCount,
    siblings = 1,
    locale = "fr-FR",
    label = "Pagination",
    previousLabel,
    nextLabel,
    class: className,
    onPageChange,
    ...rest
  }: PaginationNavProps = $props();

  const isFr = $derived(locale.toLowerCase().startsWith("fr"));
  const resolvedPreviousLabel = $derived(previousLabel ?? (isFr ? "Page précédente" : "Previous page"));
  const resolvedNextLabel = $derived(nextLabel ?? (isFr ? "Page suivante" : "Next page"));

  type Slot = number | "ellipsis-start" | "ellipsis-end";

  const classes = () => ["st-paginationNav", className].filter(Boolean).join(" ");

  const slots = $derived.by<Slot[]>(() => {
    const total = Math.max(0, Math.floor(pageCount));
    if (total <= 0) return [];

    const current = Math.min(Math.max(1, Math.floor(page)), total);
    const sib = Math.max(0, Math.floor(siblings));

    // Minimum: first, last, current, sib left, sib right, two ellipses
    const minSlots = sib * 2 + 5;
    if (total <= minSlots) {
      return Array.from({ length: total }, (_, i) => i + 1) as Slot[];
    }

    const leftSibling = Math.max(current - sib, 1);
    const rightSibling = Math.min(current + sib, total);
    const showLeftEllipsis = leftSibling > 2;
    const showRightEllipsis = rightSibling < total - 1;

    const result: Slot[] = [];

    if (!showLeftEllipsis && showRightEllipsis) {
      const leftItemCount = 3 + sib * 2;
      for (let i = 1; i <= leftItemCount; i += 1) result.push(i);
      result.push("ellipsis-end");
      result.push(total);
    } else if (showLeftEllipsis && !showRightEllipsis) {
      result.push(1);
      result.push("ellipsis-start");
      const rightItemCount = 3 + sib * 2;
      for (let i = total - rightItemCount + 1; i <= total; i += 1) result.push(i);
    } else if (showLeftEllipsis && showRightEllipsis) {
      result.push(1);
      result.push("ellipsis-start");
      for (let i = leftSibling; i <= rightSibling; i += 1) result.push(i);
      result.push("ellipsis-end");
      result.push(total);
    } else {
      for (let i = 1; i <= total; i += 1) result.push(i);
    }

    return result;
  });

  function go(target: number) {
    const total = Math.max(0, Math.floor(pageCount));
    if (target < 1 || target > total || target === page) return;
    page = target;
    onPageChange?.(target);
  }
</script>

<nav {...rest} class={classes()} aria-label={label}>
  <ul class="st-paginationNav__list">
    <li>
      <button
        type="button"
        class="st-paginationNav__nav"
        aria-label={resolvedPreviousLabel}
        disabled={page <= 1 || pageCount <= 0}
        onclick={() => go(page - 1)}
      >
        <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
      </button>
    </li>
    {#each slots as slot, index (typeof slot === "number" ? `p-${slot}` : `${slot}-${index}`)}
      <li>
        {#if slot === "ellipsis-start" || slot === "ellipsis-end"}
          <span class="st-paginationNav__ellipsis" aria-hidden="true">
            <Ellipsis size={16} strokeWidth={2} aria-hidden="true" />
          </span>
        {:else}
          <button
            type="button"
            class="st-paginationNav__page"
            class:st-paginationNav__page--active={slot === page}
            aria-label={`Page ${slot}`}
            aria-current={slot === page ? "page" : undefined}
            onclick={() => go(slot)}
          >
            {slot}
          </button>
        {/if}
      </li>
    {/each}
    <li>
      <button
        type="button"
        class="st-paginationNav__nav"
        aria-label={resolvedNextLabel}
        disabled={page >= pageCount || pageCount <= 0}
        onclick={() => go(page + 1)}
      >
        <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
      </button>
    </li>
  </ul>
</nav>

<style>
  .st-paginationNav {
    color: var(--st-component-paginationNav-text, var(--st-semantic-text-primary));
    display: inline-block;
  }

  .st-paginationNav__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-1, 0.25rem);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .st-paginationNav__page,
  .st-paginationNav__nav {
    align-items: center;
    background: var(--st-component-paginationNav-background, var(--st-semantic-surface-default));
    border: 1px solid var(--st-component-paginationNav-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-paginationNav-radius, 0.375rem);
    color: var(--st-component-paginationNav-text, var(--st-semantic-text-primary));
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-size: 0.875rem;
    height: 2.25rem;
    justify-content: center;
    min-width: 2.25rem;
    padding: 0 0.5rem;
  }

  .st-paginationNav__page:hover:not(:disabled),
  .st-paginationNav__nav:hover:not(:disabled) {
    background: var(
      --st-component-control-hoverBackground,
      var(--st-component-paginationNav-hoverBackground, var(--st-semantic-surface-subtle))
    );
  }

  /* Focus = stratégie d'anatomie partagée (outline DSFR / inset Carbon / ring base). */
  .st-paginationNav__page:focus-visible,
  .st-paginationNav__nav:focus-visible {
    border-color: var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline: var(--st-component-control-anatomy-focus-outline, none);
    outline-offset: var(--st-component-control-anatomy-focus-offset, 0);
    box-shadow: var(--st-component-control-anatomy-focus-boxShadow,
      0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive)));
  }

  .st-paginationNav__page--active {
    background: var(--st-component-paginationNav-activeBackground, var(--st-semantic-action-primary));
    border-color: var(--st-component-paginationNav-activeBackground, var(--st-semantic-action-primary));
    color: var(--st-component-paginationNav-activeText, var(--st-semantic-action-primaryText));
  }

  .st-paginationNav__page--active:hover {
    background: var(--st-component-paginationNav-activeBackground, var(--st-semantic-action-primary));
  }

  .st-paginationNav__page:disabled,
  .st-paginationNav__nav:disabled {
    color: var(--st-component-paginationNav-disabledText, var(--st-semantic-text-muted));
    cursor: not-allowed;
    opacity: 0.6;
  }

  .st-paginationNav__ellipsis {
    align-items: center;
    color: var(--st-component-paginationNav-ellipsisText, var(--st-semantic-text-muted));
    display: inline-flex;
    height: 2.25rem;
    justify-content: center;
    min-width: 2.25rem;
    padding: 0 0.25rem;
  }
</style>
