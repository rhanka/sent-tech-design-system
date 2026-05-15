<script lang="ts" module>
  export interface MultiSelectOption {
    label: string;
    value: string;
    disabled?: boolean;
  }
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type MultiSelectProps = Omit<HTMLAttributes<HTMLDivElement>, "class" | "onchange"> & {
    label?: string;
    helperText?: string;
    errorText?: string;
    invalid?: boolean;
    size?: "sm" | "md" | "lg";
    options: MultiSelectOption[];
    selected?: string[];
    placeholder?: string;
    searchPlaceholder?: string;
    noResultsLabel?: string;
    toggleLabel?: string;
    removeLabel?: string;
    listLabel?: string;
    disabled?: boolean;
    class?: string;
    onchange?: (selected: string[]) => void;
  };

  let {
    label,
    helperText,
    errorText,
    invalid = false,
    size = "md",
    options,
    selected = $bindable([]),
    placeholder = "Select items",
    searchPlaceholder = "Filter",
    noResultsLabel = "No results",
    toggleLabel = "Toggle options",
    removeLabel = "Remove",
    listLabel,
    disabled = false,
    class: className,
    onchange,
    ...rest
  }: MultiSelectProps = $props();

  let expanded = $state(false);
  let query = $state("");

  const fieldClasses = () => ["st-field", className].filter(Boolean).join(" ");
  const groupClasses = () => ["st-multiSelect", `st-multiSelect--${size}`].join(" ");
  const isInvalid = () => invalid || Boolean(errorText);

  const filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  });

  const selectedOptions = $derived(
    selected
      .map((value) => options.find((opt) => opt.value === value))
      .filter((opt): opt is MultiSelectOption => Boolean(opt))
  );

  function toggleOption(option: MultiSelectOption) {
    if (option.disabled) return;
    const next = selected.includes(option.value)
      ? selected.filter((v) => v !== option.value)
      : [...selected, option.value];
    selected = next;
    onchange?.(next);
  }

  function removeOption(value: string) {
    const next = selected.filter((v) => v !== value);
    selected = next;
    onchange?.(next);
  }

  function toggleOpen() {
    if (disabled) return;
    expanded = !expanded;
  }

  function onContainerKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape" && expanded) {
      event.preventDefault();
      expanded = false;
    }
  }
</script>

<div
  {...rest}
  class={fieldClasses()}
  role="group"
  aria-label={label}
  onkeydown={onContainerKeyDown}
>
  {#if label}<span class="st-field__label">{label}</span>{/if}
  {#if selectedOptions.length > 0}
    <span class="st-multiSelect__tags">
      {#each selectedOptions as option (option.value)}
        <span class="st-multiSelect__tag">
          <span class="st-multiSelect__tagLabel">{option.label}</span>
          <button
            type="button"
            class="st-multiSelect__tagRemove"
            aria-label={`${removeLabel} ${option.label}`}
            {disabled}
            onclick={() => removeOption(option.value)}
          >
            <span aria-hidden="true">×</span>
          </button>
        </span>
      {/each}
    </span>
  {/if}
  <span class={groupClasses()} data-invalid={isInvalid() ? "true" : undefined}>
    <button
      type="button"
      class="st-multiSelect__trigger"
      aria-haspopup="listbox"
      aria-expanded={expanded ? "true" : "false"}
      {disabled}
      onclick={toggleOpen}
    >
      {#if selectedOptions.length === 0}
        <span class="st-multiSelect__placeholder">{placeholder}</span>
      {:else}
        <span class="st-multiSelect__count">{selectedOptions.length} selected</span>
      {/if}
      <span class="st-multiSelect__caret" aria-hidden="true">▾</span>
      <span class="st-visually-hidden">{toggleLabel}</span>
    </button>
  </span>
  {#if expanded}
    <div class="st-multiSelect__panel">
      <input
        type="search"
        class="st-multiSelect__search"
        placeholder={searchPlaceholder}
        bind:value={query}
        aria-label={searchPlaceholder}
      />
      <div class="st-multiSelect__list" role="listbox" aria-label={listLabel ?? label ?? "Options"} aria-multiselectable="true">
        {#if filtered.length === 0}
          <div class="st-multiSelect__empty">{noResultsLabel}</div>
        {:else}
          {#each filtered as option (option.value)}
            {@const isSelected = selected.includes(option.value)}
            <button
              class="st-multiSelect__option"
              type="button"
              role="option"
              aria-selected={isSelected ? "true" : "false"}
              aria-disabled={option.disabled ? "true" : undefined}
              disabled={option.disabled}
              onclick={() => toggleOption(option)}
            >
              <span class="st-multiSelect__check" aria-hidden="true">
                {#if isSelected}✓{/if}
              </span>
              <span>{option.label}</span>
            </button>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
  {#if errorText}
    <span class="st-field__error">{errorText}</span>
  {:else if helperText}
    <span class="st-field__help">{helperText}</span>
  {/if}
</div>

<style>
  .st-field {
    color: var(--st-component-field-labelText, var(--st-semantic-text-primary));
    display: grid;
    gap: var(--st-component-field-gap, 0.5rem);
    max-width: var(--st-component-field-maxWidth, 28rem);
    position: relative;
  }

  .st-field__label {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .st-field__help,
  .st-field__error {
    font-size: 0.8125rem;
    line-height: 1.4;
  }

  .st-field__help {
    color: var(--st-component-field-helpText, var(--st-semantic-text-secondary));
  }

  .st-field__error {
    color: var(--st-component-field-errorText, var(--st-semantic-feedback-error));
  }

  .st-visually-hidden {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }

  .st-multiSelect {
    display: inline-flex;
    width: 100%;
  }

  .st-multiSelect--sm .st-multiSelect__trigger {
    min-height: var(--st-component-control-smHeight, 2rem);
  }

  .st-multiSelect--md .st-multiSelect__trigger {
    min-height: var(--st-component-control-mdHeight, 2.5rem);
  }

  .st-multiSelect--lg .st-multiSelect__trigger {
    min-height: var(--st-component-control-lgHeight, 3rem);
  }

  .st-multiSelect__trigger {
    align-items: center;
    background: var(--st-component-control-background, var(--st-semantic-surface-default));
    border: 1px solid var(--st-component-control-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-control-radius, 0.375rem);
    color: var(--st-component-control-text, var(--st-semantic-text-primary));
    cursor: pointer;
    display: flex;
    flex-wrap: wrap;
    font: inherit;
    gap: 0.375rem;
    padding: 0.25rem 0.5rem 0.25rem 0.75rem;
    transition:
      border-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      box-shadow var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    width: 100%;
  }

  .st-multiSelect__trigger:hover:not(:disabled) {
    border-color: var(--st-component-control-hoverBorder, var(--st-semantic-border-strong));
  }

  .st-multiSelect__trigger:focus-visible {
    border-color: var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    box-shadow: 0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline: none;
  }

  .st-multiSelect[data-invalid="true"] .st-multiSelect__trigger {
    border-color: var(--st-component-control-invalidBorder, var(--st-semantic-feedback-error));
  }

  .st-multiSelect__trigger:disabled {
    background: var(--st-component-control-disabledBackground, var(--st-semantic-surface-subtle));
    color: var(--st-component-control-disabledText, var(--st-semantic-text-muted));
    cursor: not-allowed;
  }

  .st-multiSelect__placeholder {
    color: var(--st-component-control-placeholderText, var(--st-semantic-text-muted));
    flex: 1 1 auto;
    text-align: start;
  }

  .st-multiSelect__count {
    color: var(--st-semantic-text-secondary);
    flex: 1 1 auto;
    font-size: 0.875rem;
    text-align: start;
  }

  .st-multiSelect__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .st-multiSelect__tag {
    align-items: center;
    background: var(--st-semantic-surface-subtle);
    border-radius: var(--st-radius-pill, 999px);
    color: var(--st-semantic-text-primary);
    display: inline-flex;
    font-size: 0.75rem;
    font-weight: 600;
    gap: 0.25rem;
    line-height: 1;
    padding: 0.25rem 0.5rem;
  }

  .st-multiSelect__tagLabel {
    line-height: 1;
  }

  .st-multiSelect__tagRemove {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: 50%;
    color: inherit;
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-size: 1em;
    height: 1.25em;
    justify-content: center;
    line-height: 1;
    padding: 0;
    width: 1.25em;
  }

  .st-multiSelect__tagRemove:hover:not(:disabled) {
    background: color-mix(in srgb, currentColor 18%, transparent);
  }

  .st-multiSelect__tagRemove:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 1px;
  }

  .st-multiSelect__caret {
    align-items: center;
    color: var(--st-semantic-text-secondary);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.875rem;
    margin-inline-start: auto;
    padding-inline-start: 0.25rem;
  }

  .st-multiSelect__panel {
    background: var(--st-component-dropdown-background, var(--st-semantic-surface-default));
    border: 1px solid var(--st-component-dropdown-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-dropdown-radius, 0.375rem);
    box-shadow: var(--st-component-dropdown-shadow, 0 8px 24px rgb(15 23 42 / 0.14));
    display: grid;
    left: 0;
    margin-top: var(--st-spacing-1, 0.25rem);
    position: absolute;
    right: 0;
    top: 100%;
    z-index: var(--st-component-popover-zIndex, 80);
  }

  .st-multiSelect__search {
    background: transparent;
    border: 0;
    border-bottom: 1px solid var(--st-component-control-border, var(--st-semantic-border-subtle));
    color: inherit;
    font: inherit;
    padding: 0.5rem 0.75rem;
    width: 100%;
  }

  .st-multiSelect__search:focus {
    outline: none;
  }

  .st-multiSelect__list {
    display: grid;
    max-height: 14rem;
    overflow-y: auto;
  }

  .st-multiSelect__empty {
    color: var(--st-semantic-text-muted);
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
  }

  .st-multiSelect__option {
    align-items: center;
    background: transparent;
    border: 0;
    color: var(--st-component-dropdown-text, var(--st-semantic-text-primary));
    cursor: pointer;
    display: flex;
    font: inherit;
    gap: 0.5rem;
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
    text-align: left;
  }

  .st-multiSelect__option:hover:not(:disabled),
  .st-multiSelect__option:focus-visible {
    background: var(
      --st-component-dropdown-optionHoverBackground,
      var(--st-semantic-surface-subtle)
    );
    outline: none;
  }

  .st-multiSelect__option[aria-selected="true"] {
    background: color-mix(in srgb, var(--st-semantic-action-primary) 12%, transparent);
  }

  .st-multiSelect__option:disabled {
    color: var(--st-semantic-text-muted);
    cursor: not-allowed;
  }

  .st-multiSelect__check {
    color: var(--st-semantic-action-primary);
    display: inline-flex;
    font-weight: 700;
    justify-content: center;
    width: 1rem;
  }
</style>
