<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  export type DropdownOption = {
    label: string;
    value: string;
    disabled?: boolean;
  };

  type DropdownProps = Omit<HTMLAttributes<HTMLDivElement>, "class" | "onselect"> & {
    label: string;
    options: DropdownOption[];
    value?: string;
    placeholder?: string;
    open?: boolean;
    class?: string;
    onselect?: (value: string) => void;
  };

  let {
    label,
    options,
    value,
    placeholder = "Select",
    open = false,
    class: className,
    onselect,
    ...rest
  }: DropdownProps = $props();

  let expanded = $state(false);
  let currentValue = $state<string | undefined>(undefined);
  let syncedOpen = $state<boolean | undefined>(undefined);
  let syncedValue = $state<string | undefined>(undefined);
  const classes = () => ["st-dropdown", className].filter(Boolean).join(" ");
  const selectedLabel = () => options.find((option) => option.value === currentValue)?.label ?? placeholder;
  const selectOption = (option: DropdownOption) => {
    if (option.disabled) return;
    currentValue = option.value;
    expanded = false;
    onselect?.(option.value);
  };

  $effect(() => {
    if (syncedOpen !== open) {
      expanded = open;
      syncedOpen = open;
    }
  });

  $effect(() => {
    if (syncedValue !== value) {
      currentValue = value;
      syncedValue = value;
    }
  });
</script>

<div {...rest} class={classes()}>
  <button
    class="st-dropdown__button"
    type="button"
    aria-haspopup="listbox"
    aria-expanded={expanded}
    onclick={() => (expanded = !expanded)}
  >
    <span>{label}: {selectedLabel()}</span>
    <span aria-hidden="true">v</span>
  </button>
  {#if expanded}
    <div class="st-dropdown__list" role="listbox" aria-label={label}>
      {#each options as option (option.value)}
        <button
          class="st-dropdown__option"
          type="button"
          role="option"
          aria-selected={option.value === currentValue ? "true" : "false"}
          aria-disabled={option.disabled ? "true" : undefined}
          disabled={option.disabled}
          onclick={() => selectOption(option)}
        >
          {option.label}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .st-dropdown {
    display: inline-grid;
    min-width: 14rem;
    position: relative;
  }

  .st-dropdown__button {
    align-items: center;
    background: var(--st-component-dropdown-background, var(--st-semantic-surface-default));
    border: 1px solid var(--st-component-dropdown-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-dropdown-radius, 0.375rem);
    color: var(--st-component-dropdown-text, var(--st-semantic-text-primary));
    cursor: pointer;
    display: flex;
    font: inherit;
    justify-content: space-between;
    min-height: var(--st-component-control-mdHeight, 2.5rem);
    padding: 0 var(--st-spacing-3, 0.75rem);
  }

  .st-dropdown__button:focus-visible {
    outline: 2px solid var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline-offset: 2px;
  }

  .st-dropdown__list {
    background: var(--st-component-dropdown-background, var(--st-semantic-surface-default));
    border: 1px solid var(--st-component-dropdown-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-dropdown-radius, 0.375rem);
    box-shadow: var(--st-component-dropdown-shadow, 0 8px 24px rgb(15 23 42 / 0.14));
    display: grid;
    left: 0;
    margin-top: var(--st-spacing-1, 0.25rem);
    min-width: 100%;
    overflow: hidden;
    position: absolute;
    top: 100%;
    z-index: var(--st-component-popover-zIndex, 80);
  }

  .st-dropdown__option {
    background: transparent;
    border: 0;
    color: var(--st-component-dropdown-text, var(--st-semantic-text-primary));
    cursor: pointer;
    font: inherit;
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
    text-align: left;
  }

  .st-dropdown__option:hover:not(:disabled),
  .st-dropdown__option:focus-visible {
    background: var(
      --st-component-dropdown-optionHoverBackground,
      var(--st-semantic-surface-subtle)
    );
    outline: none;
  }

  .st-dropdown__option[aria-selected="true"] {
    background: var(--st-component-dropdown-selectedBackground, var(--st-semantic-action-primary));
    color: var(--st-component-dropdown-selectedText, var(--st-semantic-action-primaryText));
  }

  .st-dropdown__option:disabled {
    color: var(--st-semantic-text-muted);
    cursor: not-allowed;
  }
</style>
