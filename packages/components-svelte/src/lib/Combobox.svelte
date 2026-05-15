<script lang="ts" module>
  export interface ComboboxOption {
    label: string;
    value: string;
    disabled?: boolean;
  }
</script>

<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  type ComboboxProps = Omit<
    HTMLInputAttributes,
    "class" | "size" | "type" | "value" | "onchange"
  > & {
    label?: string;
    helperText?: string;
    errorText?: string;
    invalid?: boolean;
    size?: "sm" | "md" | "lg";
    options: ComboboxOption[];
    value?: string;
    placeholder?: string;
    allowCustomValue?: boolean;
    noResultsLabel?: string;
    clearLabel?: string;
    toggleLabel?: string;
    listLabel?: string;
    class?: string;
    onselect?: (value: string) => void;
    onchange?: (value: string) => void;
  };

  let {
    label,
    helperText,
    errorText,
    invalid = false,
    size = "md",
    options,
    value = $bindable(""),
    placeholder = "Select or type",
    allowCustomValue = true,
    noResultsLabel = "No results",
    clearLabel = "Clear selection",
    toggleLabel = "Toggle options",
    listLabel,
    disabled,
    class: className,
    onselect,
    onchange,
    ...rest
  }: ComboboxProps = $props();

  let expanded = $state(false);
  let activeIndex = $state(-1);

  const fieldClasses = () => ["st-field", className].filter(Boolean).join(" ");
  const groupClasses = () => ["st-combobox", `st-combobox--${size}`].join(" ");
  const isInvalid = () => invalid || Boolean(errorText);

  const filtered = $derived.by(() => {
    const q = value?.trim().toLowerCase() ?? "";
    if (!q) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  });

  function open() {
    if (disabled) return;
    expanded = true;
  }

  function close() {
    expanded = false;
    activeIndex = -1;
  }

  function selectOption(option: ComboboxOption) {
    if (option.disabled) return;
    value = option.label;
    close();
    onselect?.(option.value);
    onchange?.(option.value);
  }

  function onInput(event: Event) {
    value = (event.currentTarget as HTMLInputElement).value;
    expanded = true;
    activeIndex = -1;
    if (allowCustomValue) onchange?.(value);
  }

  function clear() {
    value = "";
    onchange?.("");
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      expanded = true;
      const max = filtered.length;
      if (max === 0) return;
      activeIndex = (activeIndex + 1) % max;
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      expanded = true;
      const max = filtered.length;
      if (max === 0) return;
      activeIndex = (activeIndex - 1 + max) % max;
    } else if (event.key === "Enter") {
      if (expanded && activeIndex >= 0 && filtered[activeIndex]) {
        event.preventDefault();
        selectOption(filtered[activeIndex]);
      }
    } else if (event.key === "Escape") {
      if (expanded) {
        event.preventDefault();
        close();
      }
    }
  }

  function onBlur() {
    setTimeout(() => {
      expanded = false;
      activeIndex = -1;
    }, 120);
  }
</script>

<div class={fieldClasses()}>
  <label class="st-field__control">
    {#if label}<span class="st-field__label">{label}</span>{/if}
    <span class={groupClasses()}>
      <input
        {...rest}
        type="text"
        class="st-combobox__control"
        role="combobox"
        aria-expanded={expanded ? "true" : "false"}
        aria-autocomplete="list"
        aria-controls="st-combobox-list"
        aria-invalid={isInvalid() ? "true" : undefined}
        {placeholder}
        {disabled}
        bind:value
        oninput={onInput}
        onfocus={open}
        onblur={onBlur}
        onkeydown={onKeyDown}
      />
      {#if value}
        <button
          type="button"
          class="st-combobox__clear"
          aria-label={clearLabel}
          {disabled}
          onclick={clear}
        >
          <span aria-hidden="true">×</span>
        </button>
      {/if}
      <button
        type="button"
        class="st-combobox__toggle"
        aria-label={toggleLabel}
        aria-expanded={expanded ? "true" : "false"}
        {disabled}
        onclick={() => (expanded = !expanded)}
      >
        <span aria-hidden="true">▾</span>
      </button>
    </span>
  </label>
  {#if expanded}
    <div
      id="st-combobox-list"
      class="st-combobox__list"
      role="listbox"
      aria-label={listLabel ?? label ?? "Options"}
    >
      {#if filtered.length === 0}
        <div class="st-combobox__empty" role="option" aria-selected="false" aria-disabled="true">
          {noResultsLabel}
        </div>
      {:else}
        {#each filtered as option, i (option.value)}
          <button
            class="st-combobox__option"
            class:st-combobox__option--active={i === activeIndex}
            type="button"
            role="option"
            aria-selected={value === option.label ? "true" : "false"}
            aria-disabled={option.disabled ? "true" : undefined}
            disabled={option.disabled}
            onmousedown={(e) => {
              e.preventDefault();
              selectOption(option);
            }}
          >
            {option.label}
          </button>
        {/each}
      {/if}
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

  .st-field__control {
    display: grid;
    gap: var(--st-component-field-gap, 0.5rem);
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

  .st-combobox {
    align-items: center;
    background: var(--st-component-control-background, var(--st-semantic-surface-default));
    border: 1px solid var(--st-component-control-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-control-radius, 0.375rem);
    color: var(--st-component-control-text, var(--st-semantic-text-primary));
    display: inline-flex;
    transition:
      border-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      box-shadow var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    width: 100%;
  }

  .st-combobox--sm {
    min-height: var(--st-component-control-smHeight, 2rem);
  }

  .st-combobox--md {
    min-height: var(--st-component-control-mdHeight, 2.5rem);
  }

  .st-combobox--lg {
    min-height: var(--st-component-control-lgHeight, 3rem);
  }

  .st-combobox:hover:not(:has(input:disabled)) {
    border-color: var(--st-component-control-hoverBorder, var(--st-semantic-border-strong));
  }

  .st-combobox:focus-within {
    border-color: var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    box-shadow: 0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
  }

  .st-combobox:has([aria-invalid="true"]) {
    border-color: var(--st-component-control-invalidBorder, var(--st-semantic-feedback-error));
  }

  .st-combobox__control {
    background: transparent;
    border: 0;
    color: inherit;
    flex: 1 1 auto;
    font: inherit;
    min-width: 0;
    padding: 0 0.75rem;
    width: 100%;
  }

  .st-combobox__control:focus {
    outline: none;
  }

  .st-combobox__control::placeholder {
    color: var(--st-component-control-placeholderText, var(--st-semantic-text-muted));
  }

  .st-combobox__control:disabled {
    color: var(--st-component-control-disabledText, var(--st-semantic-text-muted));
    cursor: not-allowed;
  }

  .st-combobox__clear,
  .st-combobox__toggle {
    align-items: center;
    background: transparent;
    border: 0;
    color: var(--st-semantic-text-secondary);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    font: inherit;
    height: 100%;
    justify-content: center;
    padding: 0 0.5rem;
    transition: background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-combobox__clear:hover:not(:disabled),
  .st-combobox__toggle:hover:not(:disabled) {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }

  .st-combobox__clear:focus-visible,
  .st-combobox__toggle:focus-visible {
    outline: 2px solid var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline-offset: -2px;
  }

  .st-combobox__clear:disabled,
  .st-combobox__toggle:disabled {
    cursor: not-allowed;
  }

  .st-combobox__list {
    background: var(--st-component-dropdown-background, var(--st-semantic-surface-default));
    border: 1px solid var(--st-component-dropdown-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-dropdown-radius, 0.375rem);
    box-shadow: var(--st-component-dropdown-shadow, 0 8px 24px rgb(15 23 42 / 0.14));
    display: grid;
    left: 0;
    margin-top: var(--st-spacing-1, 0.25rem);
    max-height: 16rem;
    overflow-y: auto;
    position: absolute;
    right: 0;
    top: 100%;
    z-index: var(--st-component-popover-zIndex, 80);
  }

  .st-combobox__empty {
    color: var(--st-semantic-text-muted);
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
  }

  .st-combobox__option {
    background: transparent;
    border: 0;
    color: var(--st-component-dropdown-text, var(--st-semantic-text-primary));
    cursor: pointer;
    font: inherit;
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
    text-align: left;
  }

  .st-combobox__option:hover:not(:disabled),
  .st-combobox__option--active {
    background: var(
      --st-component-dropdown-optionHoverBackground,
      var(--st-semantic-surface-subtle)
    );
  }

  .st-combobox__option[aria-selected="true"] {
    background: var(--st-component-dropdown-selectedBackground, var(--st-semantic-action-primary));
    color: var(--st-component-dropdown-selectedText, var(--st-semantic-action-primaryText));
  }

  .st-combobox__option:disabled {
    color: var(--st-semantic-text-muted);
    cursor: not-allowed;
  }
</style>
