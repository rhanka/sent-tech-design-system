<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  type SearchProps = Omit<HTMLInputAttributes, "class" | "size" | "type" | "value"> & {
    label?: string;
    helperText?: string;
    errorText?: string;
    invalid?: boolean;
    size?: "sm" | "md" | "lg";
    value?: string;
    placeholder?: string;
    clearLabel?: string;
    class?: string;
  };

  let {
    label,
    helperText,
    errorText,
    invalid = false,
    size = "md",
    value = $bindable(""),
    placeholder = "Search",
    clearLabel = "Clear search",
    disabled,
    class: className,
    ...rest
  }: SearchProps = $props();

  const fieldClasses = () => ["st-field", className].filter(Boolean).join(" ");
  const groupClasses = () => ["st-search", `st-search--${size}`].join(" ");
  const isInvalid = () => invalid || Boolean(errorText);

  function clear() {
    value = "";
  }
</script>

<div class={fieldClasses()}>
  <label class="st-field__control">
    {#if label}<span class="st-field__label">{label}</span>{/if}
    <span class={groupClasses()}>
      <span class="st-search__icon" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
          <circle cx="7" cy="7" r="4.5" />
          <path d="m13 13-2.6-2.6" stroke-linecap="round" />
        </svg>
      </span>
      <input
        {...rest}
        type="search"
        role="searchbox"
        class="st-search__control"
        bind:value
        {placeholder}
        {disabled}
        aria-invalid={isInvalid() ? "true" : undefined}
      />
      {#if value}
        <button
          type="button"
          class="st-search__clear"
          aria-label={clearLabel}
          {disabled}
          onclick={clear}
        >
          <span aria-hidden="true">×</span>
        </button>
      {/if}
    </span>
  </label>
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

  .st-search {
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

  .st-search--sm {
    min-height: var(--st-component-control-smHeight, 2rem);
  }

  .st-search--md {
    min-height: var(--st-component-control-mdHeight, 2.5rem);
  }

  .st-search--lg {
    min-height: var(--st-component-control-lgHeight, 3rem);
  }

  .st-search:hover:not(:has(input:disabled)) {
    border-color: var(--st-component-control-hoverBorder, var(--st-semantic-border-strong));
  }

  .st-search:focus-within {
    border-color: var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    box-shadow: 0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
  }

  .st-search:has([aria-invalid="true"]) {
    border-color: var(--st-component-control-invalidBorder, var(--st-semantic-feedback-error));
  }

  .st-search__icon {
    align-items: center;
    color: var(--st-semantic-text-muted);
    display: inline-flex;
    flex: 0 0 auto;
    justify-content: center;
    padding-inline-start: 0.625rem;
  }

  .st-search__control {
    background: transparent;
    border: 0;
    color: inherit;
    flex: 1 1 auto;
    font: inherit;
    min-width: 0;
    padding: 0 0.5rem;
    width: 100%;
  }

  .st-search__control:focus {
    outline: none;
  }

  .st-search__control::placeholder {
    color: var(--st-component-control-placeholderText, var(--st-semantic-text-muted));
  }

  .st-search__control::-webkit-search-cancel-button {
    appearance: none;
  }

  .st-search__control:disabled {
    color: var(--st-component-control-disabledText, var(--st-semantic-text-muted));
    cursor: not-allowed;
  }

  .st-search__clear {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: 50%;
    color: inherit;
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    font: inherit;
    font-size: 1.125rem;
    height: 1.5rem;
    justify-content: center;
    line-height: 1;
    margin-inline-end: 0.375rem;
    padding: 0;
    transition: background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    width: 1.5rem;
  }

  .st-search__clear:hover:not(:disabled) {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }

  .st-search__clear:focus-visible {
    outline: 2px solid var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline-offset: 1px;
  }

  .st-search__clear:disabled {
    cursor: not-allowed;
  }
</style>
