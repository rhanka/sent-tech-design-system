<script lang="ts">
  type ContentSwitcherItem = {
    value: string;
    label: string;
    disabled?: boolean;
  };

  type ContentSwitcherProps = {
    items: ContentSwitcherItem[];
    value?: string;
    label?: string;
    size?: "sm" | "md" | "lg";
    onchange?: (value: string) => void;
    class?: string;
  };

  let {
    items,
    value = $bindable(""),
    label,
    size = "md",
    onchange,
    class: className
  }: ContentSwitcherProps = $props();

  const groupClasses = () =>
    ["st-contentSwitcher", `st-contentSwitcher--${size}`, className].filter(Boolean).join(" ");

  function select(item: ContentSwitcherItem) {
    if (item.disabled) return;
    if (value === item.value) return;
    value = item.value;
    onchange?.(item.value);
  }

  function onKeydown(event: KeyboardEvent, index: number) {
    const last = items.length - 1;
    let target = -1;
    if (event.key === "ArrowRight") target = index === last ? 0 : index + 1;
    else if (event.key === "ArrowLeft") target = index === 0 ? last : index - 1;
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = last;
    if (target < 0) return;
    event.preventDefault();
    const item = items[target];
    if (item) select(item);
  }
</script>

<div class={groupClasses()} role="tablist" aria-label={label}>
  {#each items as item, i (item.value)}
    {@const selected = value === item.value}
    <button
      type="button"
      class="st-contentSwitcher__option"
      class:st-contentSwitcher__option--selected={selected}
      role="tab"
      aria-selected={selected ? "true" : "false"}
      aria-disabled={item.disabled ? "true" : undefined}
      tabindex={selected ? 0 : -1}
      disabled={item.disabled}
      onclick={() => select(item)}
      onkeydown={(event) => onKeydown(event, i)}
    >
      {item.label}
    </button>
  {/each}
</div>

<style>
  .st-contentSwitcher {
    background: var(--st-semantic-surface-subtle);
    border-radius: var(--st-component-control-radius, 0.375rem);
    display: inline-flex;
    padding: 0.125rem;
  }

  .st-contentSwitcher__option {
    background: transparent;
    border: 0;
    border-radius: var(--st-component-control-radius, 0.375rem);
    color: var(--st-semantic-text-secondary);
    cursor: pointer;
    font: inherit;
    font-weight: 500;
    padding: 0 0.875rem;
    transition:
      background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-contentSwitcher--sm .st-contentSwitcher__option {
    font-size: 0.75rem;
    min-height: 1.75rem;
  }

  .st-contentSwitcher--md .st-contentSwitcher__option {
    font-size: 0.875rem;
    min-height: 2.25rem;
  }

  .st-contentSwitcher--lg .st-contentSwitcher__option {
    font-size: 0.9375rem;
    min-height: 2.75rem;
  }

  .st-contentSwitcher__option:hover:not([disabled]):not(.st-contentSwitcher__option--selected) {
    color: var(--st-semantic-text-primary);
  }

  .st-contentSwitcher__option:focus-visible {
    outline: 2px solid var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline-offset: 1px;
  }

  .st-contentSwitcher__option--selected {
    background: var(--st-semantic-surface-default);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
    color: var(--st-semantic-text-primary);
  }

  .st-contentSwitcher__option:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
</style>
