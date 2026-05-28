<script lang="ts" module>
  export interface TabItem {
    value: string;
    label: string;
    content: string;
    disabled?: boolean;
  }
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type TabsProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    items: TabItem[];
    activeValue?: string;
    label?: string;
    class?: string;
    onchange?: (value: string) => void;
  };

  let {
    items,
    activeValue,
    label = "Tabs",
    class: className,
    onchange,
    ...rest
  }: TabsProps = $props();

  let selected = $state<string | undefined>(undefined);
  let current = $derived(
    selected ?? activeValue ?? items.find((item) => !item.disabled)?.value ?? items[0]?.value
  );
  const classes = () => ["st-tabs", className].filter(Boolean).join(" ");
  const activeItem = () => items.find((item) => item.value === current) ?? items[0];

  function select(value: string): void {
    selected = value;
    onchange?.(value);
  }
</script>

<section {...rest} class={classes()}>
  <div class="st-tabs__list" role="tablist" aria-label={label}>
    {#each items as item}
      <button
        class="st-tabs__tab"
        class:st-tabs__tab--active={item.value === current}
        type="button"
        role="tab"
        disabled={item.disabled}
        aria-selected={item.value === current ? "true" : "false"}
        onclick={() => select(item.value)}
      >
        {item.label}
      </button>
    {/each}
  </div>
  <div class="st-tabs__panel" role="tabpanel">
    {activeItem()?.content}
  </div>
</section>

<style>
  .st-tabs {
    color: var(--st-component-tabs-activeText, var(--st-semantic-text-primary));
    display: grid;
    gap: var(--st-spacing-4, 1rem);
  }

  .st-tabs__list {
    border-bottom: 1px solid var(--st-component-tabs-border, var(--st-semantic-border-subtle));
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-tabs__tab {
    background: transparent;
    border: 0;
    border-bottom-width: var(--st-component-tabs-anatomy-shape-borderWidth, 2px);
    border-bottom-style: var(--st-component-tabs-anatomy-shape-borderStyle, solid);
    border-bottom-color: transparent;
    color: var(--st-component-tabs-inactiveText, var(--st-semantic-text-secondary));
    cursor: var(--st-cursor-interactive, pointer);
    font-family: var(--st-component-tabs-anatomy-typography-family, inherit);
    font-weight: var(--st-component-tabs-anatomy-typography-weight, 600);
    line-height: var(--st-component-tabs-anatomy-typography-lineHeight, 1.2);
    letter-spacing: var(--st-component-tabs-anatomy-typography-letterSpacing, 0);
    text-transform: var(--st-component-tabs-anatomy-typography-textTransform, none);
    padding: 0.75rem 0.25rem;
  }

  .st-tabs__tab--active {
    border-bottom-color: var(--st-component-tabs-indicator, var(--st-semantic-action-primary));
    color: var(--st-component-tabs-anatomy-states-hover-text, var(--st-component-tabs-activeText, var(--st-semantic-text-primary)));
  }

  /* a11y (non-negotiable): tabs previously had NO visible focus ring. The
     shared focus mixin restores keyboard visibility per theme. */
  .st-tabs__tab:focus-visible {
    outline: var(--st-component-tabs-anatomy-focus-outline, 2px solid var(--st-semantic-border-interactive));
    outline-offset: var(--st-component-tabs-anatomy-focus-offset, 2px);
    box-shadow: var(--st-component-tabs-anatomy-focus-boxShadow, none);
    border-radius: var(--st-component-tabs-anatomy-shape-radius, 0);
  }

  .st-tabs__tab:disabled {
    cursor: var(--st-cursor-disabled, not-allowed);
    opacity: var(--st-component-tabs-anatomy-states-disabled-opacity, 0.55);
  }

  .st-tabs__panel {
    background: var(--st-component-tabs-panelBackground, var(--st-semantic-surface-default));
    line-height: 1.5;
  }
</style>
