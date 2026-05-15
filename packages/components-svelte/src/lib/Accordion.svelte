<script lang="ts" module>
  export interface AccordionItem {
    id: string;
    title: string;
    content: string;
    disabled?: boolean;
  }
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type AccordionProps = Omit<HTMLAttributes<HTMLDivElement>, "class" | "onchange"> & {
    items: AccordionItem[];
    multiple?: boolean;
    open?: string[];
    align?: "start" | "end";
    size?: "sm" | "md" | "lg";
    class?: string;
    onchange?: (open: string[]) => void;
  };

  let {
    items,
    multiple = false,
    open = $bindable<string[]>([]),
    align = "end",
    size = "md",
    class: className,
    onchange,
    ...rest
  }: AccordionProps = $props();

  const classes = () =>
    ["st-accordion", `st-accordion--${size}`, `st-accordion--align-${align}`, className]
      .filter(Boolean)
      .join(" ");

  function isOpen(id: string) {
    return open.includes(id);
  }

  function toggle(id: string, disabled?: boolean) {
    if (disabled) return;
    let next: string[];
    if (open.includes(id)) {
      next = open.filter((v) => v !== id);
    } else {
      next = multiple ? [...open, id] : [id];
    }
    open = next;
    onchange?.(next);
  }
</script>

<div {...rest} class={classes()}>
  {#each items as item (item.id)}
    {@const expanded = isOpen(item.id)}
    <div class="st-accordion__item" class:st-accordion__item--open={expanded}>
      <h3 class="st-accordion__heading">
        <button
          type="button"
          class="st-accordion__trigger"
          aria-expanded={expanded ? "true" : "false"}
          aria-controls={`st-accordion-panel-${item.id}`}
          id={`st-accordion-trigger-${item.id}`}
          disabled={item.disabled}
          onclick={() => toggle(item.id, item.disabled)}
        >
          {#if align === "start"}
            <span class="st-accordion__icon" aria-hidden="true">▾</span>
            <span class="st-accordion__title">{item.title}</span>
          {:else}
            <span class="st-accordion__title">{item.title}</span>
            <span class="st-accordion__icon" aria-hidden="true">▾</span>
          {/if}
        </button>
      </h3>
      {#if expanded}
        <div
          class="st-accordion__panel"
          role="region"
          id={`st-accordion-panel-${item.id}`}
          aria-labelledby={`st-accordion-trigger-${item.id}`}
        >
          {item.content}
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .st-accordion {
    border-block: 1px solid var(--st-component-control-border, var(--st-semantic-border-subtle));
    color: var(--st-semantic-text-primary);
    display: grid;
    width: 100%;
  }

  .st-accordion__item + .st-accordion__item {
    border-top: 1px solid var(--st-component-control-border, var(--st-semantic-border-subtle));
  }

  .st-accordion__heading {
    margin: 0;
  }

  .st-accordion__trigger {
    align-items: center;
    background: transparent;
    border: 0;
    color: inherit;
    cursor: pointer;
    display: flex;
    font: inherit;
    font-weight: 600;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.875rem 0.5rem;
    text-align: start;
    transition: background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    width: 100%;
  }

  .st-accordion--sm .st-accordion__trigger {
    font-size: 0.875rem;
    padding: 0.625rem 0.5rem;
  }

  .st-accordion--lg .st-accordion__trigger {
    font-size: 1rem;
    padding: 1.125rem 0.5rem;
  }

  .st-accordion--align-start .st-accordion__trigger {
    justify-content: flex-start;
  }

  .st-accordion__trigger:hover:not(:disabled) {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }

  .st-accordion__trigger:focus-visible {
    outline: 2px solid var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline-offset: -2px;
  }

  .st-accordion__trigger:disabled {
    color: var(--st-semantic-text-muted);
    cursor: not-allowed;
  }

  .st-accordion__title {
    flex: 1 1 auto;
  }

  .st-accordion--align-start .st-accordion__title {
    flex: 0 1 auto;
  }

  .st-accordion__icon {
    color: var(--st-semantic-text-secondary);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.875rem;
    transition: transform var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-accordion__item--open .st-accordion__icon {
    transform: rotate(180deg);
  }

  .st-accordion__panel {
    color: var(--st-semantic-text-secondary);
    line-height: 1.5;
    padding: 0 0.5rem 0.875rem;
  }

  .st-accordion--sm .st-accordion__panel {
    padding-bottom: 0.625rem;
  }

  .st-accordion--lg .st-accordion__panel {
    padding-bottom: 1.125rem;
  }
</style>
