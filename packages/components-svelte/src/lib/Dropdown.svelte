<script lang="ts">
  import { ChevronDown } from "@lucide/svelte";
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

  let host: HTMLDivElement | undefined = $state();
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

  function close() {
    expanded = false;
  }

  function onWindowKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && expanded) {
      event.preventDefault();
      close();
    }
  }

  function onWindowPointerDown(event: MouseEvent) {
    if (!expanded) return;
    const target = event.target as Node | null;
    if (host && target && !host.contains(target)) close();
  }

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

<svelte:window onkeydown={onWindowKeydown} onpointerdown={onWindowPointerDown} />

<div {...rest} bind:this={host} class={classes()}>
  <button
    class="st-dropdown__button"
    type="button"
    aria-haspopup="listbox"
    aria-expanded={expanded}
    onclick={() => (expanded = !expanded)}
  >
    <span class="st-dropdown__label">{label}</span>: <span class="st-dropdown__value">{selectedLabel()}</span>
    <ChevronDown
      class={`st-dropdown__icon ${expanded ? "st-dropdown__icon--open" : ""}`}
      size={18}
      strokeWidth={2.25}
      aria-hidden="true"
    />
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

  .st-dropdown__icon {
    color: var(--st-semantic-text-secondary);
    flex: 0 0 auto;
    transition: transform var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-dropdown__icon--open {
    transform: rotate(180deg);
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
      --st-component-control-hoverBackground,
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
