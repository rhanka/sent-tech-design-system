<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type ChatThreadProps = Omit<HTMLAttributes<HTMLElement>, "class" | "aria-label"> & {
    label: string;
    autoScroll?: boolean;
    class?: string;
    children?: Snippet;
    emptyState?: Snippet;
  };

  let {
    label,
    autoScroll = true,
    class: className,
    children,
    emptyState,
    ...rest
  }: ChatThreadProps = $props();

  let scrollEl: HTMLElement | undefined = $state();
  let listEl: HTMLElement | undefined = $state();
  let hasChildren = $state(true);

  const classes = () => ["st-chatThread", className].filter(Boolean).join(" ");

  function scrollToBottom() {
    const node = scrollEl;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }

  $effect(() => {
    if (!autoScroll) return;
    const node = listEl;
    if (!node) return;
    // Initial scroll on mount and on children change.
    scrollToBottom();
    const observer = new MutationObserver(() => {
      scrollToBottom();
    });
    observer.observe(node, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  });

  $effect(() => {
    const node = listEl;
    if (!node) {
      hasChildren = false;
      return;
    }
    const update = () => {
      hasChildren = node.childElementCount > 0;
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(node, { childList: true });
    return () => observer.disconnect();
  });
</script>

<section
  {...rest}
  bind:this={scrollEl}
  class={classes()}
  role="log"
  aria-label={label}
  aria-live="polite"
  aria-relevant="additions text"
>
  <div bind:this={listEl} class="st-chatThread__list">
    {@render children?.()}
  </div>
  {#if emptyState && !hasChildren}
    <div class="st-chatThread__empty">
      {@render emptyState()}
    </div>
  {/if}
</section>

<style>
  .st-chatThread {
    background: var(--st-component-chatThread-background, transparent);
    border-radius: var(--st-component-chatThread-radius, 0.75rem);
    color: var(--st-semantic-text-primary);
    display: flex;
    flex-direction: column;
    gap: var(--st-component-chatThread-gap, 0.75rem);
    max-height: var(--st-component-chatThread-maxHeight, 32rem);
    min-height: var(--st-component-chatThread-minHeight, 12rem);
    overflow-y: auto;
    padding: var(--st-component-chatThread-padding, 0.75rem);
    position: relative;
    scroll-behavior: smooth;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-chatThread {
      scroll-behavior: auto;
    }
  }

  .st-chatThread__list {
    display: flex;
    flex-direction: column;
    gap: var(--st-component-chatThread-gap, 0.75rem);
    min-height: 0;
  }

  .st-chatThread__empty {
    align-items: center;
    color: var(--st-semantic-text-secondary);
    display: flex;
    flex: 1;
    justify-content: center;
    padding: var(--st-spacing-4, 1rem);
    text-align: center;
  }
</style>
