<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import { Search as SearchIcon, X } from "@lucide/svelte";

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
        <SearchIcon size={16} strokeWidth={2} aria-hidden="true" />
      </span>
      <input
        {...rest}
        type="search"
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
          <X size={16} strokeWidth={2} aria-hidden="true" />
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
    font-family: var(--st-component-field-labelTypography-family, inherit);
    font-size: var(--st-component-field-labelTypography-size, 0.875rem);
    font-weight: var(--st-component-field-labelTypography-weight, 600);
    line-height: var(--st-component-field-labelTypography-lineHeight, 1.4);
    letter-spacing: var(--st-component-field-labelTypography-letterSpacing, 0);
    text-transform: var(--st-component-field-labelTypography-textTransform, none);
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

  /* Field box = resolved field anatomy (v1.2.0), same as Input. */
  .st-search {
    align-items: center;
    background: var(--st-component-control-anatomy-field-fillBg, var(--st-component-control-background, var(--st-semantic-surface-default)));
    border-top: var(--st-component-control-anatomy-field-borderTop, var(--st-component-control-anatomy-shape-borderWidth, 1px) var(--st-component-control-anatomy-shape-borderStyle, solid) var(--st-component-control-border, var(--st-semantic-border-subtle)));
    border-right: var(--st-component-control-anatomy-field-borderRight, var(--st-component-control-anatomy-shape-borderWidth, 1px) var(--st-component-control-anatomy-shape-borderStyle, solid) var(--st-component-control-border, var(--st-semantic-border-subtle)));
    border-bottom: var(--st-component-control-anatomy-field-borderBottom, var(--st-component-control-anatomy-shape-borderWidth, 1px) var(--st-component-control-anatomy-shape-borderStyle, solid) var(--st-component-control-border, var(--st-semantic-border-subtle)));
    border-left: var(--st-component-control-anatomy-field-borderLeft, var(--st-component-control-anatomy-shape-borderWidth, 1px) var(--st-component-control-anatomy-shape-borderStyle, solid) var(--st-component-control-border, var(--st-semantic-border-subtle)));
    /* Top corners ride the shared field `radiusTop` (DSFR rounds top 4px, like
       the Input field box); bottom corners keep the field shape radius. */
    border-top-left-radius: var(--st-component-control-anatomy-field-radiusTop, var(--st-component-control-anatomy-shape-radius, 0.375rem));
    border-top-right-radius: var(--st-component-control-anatomy-field-radiusTop, var(--st-component-control-anatomy-shape-radius, 0.375rem));
    border-bottom-right-radius: var(--st-component-control-anatomy-field-radiusBottom, var(--st-component-control-anatomy-shape-radius, 0.375rem));
    border-bottom-left-radius: var(--st-component-control-anatomy-field-radiusBottom, var(--st-component-control-anatomy-shape-radius, 0.375rem));
    color: var(--st-component-control-text, var(--st-semantic-text-primary));
    display: inline-flex;
    /* P-D: field-box padding + input typography per theme. Default = the prior
       render (0 padding on the wrapper, inherited 16px / `normal` typography);
       DSFR pads 8/16px, Carbon 0/40px to match the measured reference input. */
    padding: var(--st-component-search-paddingBlock, 0)
      var(--st-component-search-paddingRight, var(--st-component-search-paddingInline, 0))
      var(--st-component-search-paddingBlock, 0)
      var(--st-component-search-paddingLeft, var(--st-component-search-paddingInline, 0));
    font-size: var(--st-component-search-fontSize, 1rem);
    line-height: var(--st-component-search-lineHeight, normal);
    letter-spacing: var(--st-component-search-letterSpacing, normal);
    transition:
      border-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      box-shadow var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    width: 100%;
  }

  .st-search--sm {
    min-height: var(--st-component-control-smHeight, 2rem);
    font-size: 0.8125rem;
  }

  .st-search--md {
    min-height: var(--st-component-control-mdHeight, 2.5rem);
    font-size: 0.875rem;
  }

  .st-search--lg {
    min-height: var(--st-component-control-lgHeight, 3rem);
    font-size: 1rem;
  }

  .st-search:hover:not(:has(input:disabled)) {
    border-color: var(--st-component-control-hoverBorder, var(--st-semantic-border-strong));
  }

  .st-search:focus-within {
    border-color: var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline: var(--st-component-control-anatomy-focus-outline, none);
    outline-offset: var(--st-component-control-anatomy-focus-offset, 0);
    box-shadow: var(--st-component-control-anatomy-focus-boxShadow,
      0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive)));
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
    border-radius: var(--st-component-control-anatomy-shape-radius, 0.375rem);
    color: var(--st-semantic-text-secondary);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    font: inherit;
    height: 1.5rem;
    justify-content: center;
    line-height: 1;
    margin-inline-end: 0.25rem;
    padding: 0 0.25rem;
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
