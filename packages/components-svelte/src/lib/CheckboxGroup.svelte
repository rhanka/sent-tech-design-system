<script lang="ts" module>
  export interface CheckboxGroupOption {
    label: string;
    value: string;
    disabled?: boolean;
    helperText?: string;
    description?: string;
  }

  export type CheckboxGroupVariant = "list" | "card";
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import Checkbox from "./Checkbox.svelte";

  type CheckboxGroupProps = Omit<HTMLAttributes<HTMLFieldSetElement>, "class" | "onchange"> & {
    legend: string;
    /** Valeurs cochées (liste contrôlée). */
    value?: string[];
    onchange?: (value: string[]) => void;
    orientation?: "vertical" | "horizontal";
    /** Presentation density: list rows (default) or >= 48px choice cards. */
    variant?: CheckboxGroupVariant;
    /** Optional 2-column grid on wide containers (>= 520px) for card variant. */
    columns?: 1 | 2;
    /** Nom partagé par les cases (utile pour la soumission de formulaire). */
    name?: string;
    options?: CheckboxGroupOption[];
    /** Option values mutually exclusive with all other options (e.g. ["none"]). */
    exclusiveValues?: string[];
    /** Advisory minimum number of selections. */
    minSelections?: number;
    /** Maximum number of non-exclusive selections allowed. */
    maxSelections?: number;
    /** Optional localized status message shown when maxSelections is set. */
    maxSelectionsMessage?: string;
    /** Description optionnelle affichée sous la légende. */
    helperText?: string;
    errorText?: string;
    /** Marque le groupe comme requis. */
    required?: boolean;
    /** Accessible screen-reader text announced when required is set. */
    requiredLabel?: string;
    invalid?: boolean;
    disabled?: boolean;
    class?: string;
    /** Contenu libre rendu en plus des options. */
    children?: Snippet;
  };

  let {
    legend,
    value = $bindable<string[]>([]),
    onchange,
    orientation = "vertical",
    variant = "list",
    columns = 1,
    name,
    options = [],
    exclusiveValues = [],
    minSelections,
    maxSelections,
    maxSelectionsMessage,
    helperText,
    errorText,
    required = false,
    requiredLabel = "required",
    invalid = false,
    disabled = false,
    class: className,
    children,
    ...rest
  }: CheckboxGroupProps = $props();

  const uid = $props.id();
  const helpId = `${uid}-help`;
  const limitId = `${uid}-limit`;
  const errorId = `${uid}-error`;

  const exclusiveSet = $derived(new Set(exclusiveValues));
  const nonExclusiveCount = $derived(value.filter((v) => !exclusiveSet.has(v)).length);
  const atMax = $derived(
    maxSelections !== undefined && maxSelections > 0 && nonExclusiveCount >= maxSelections
  );
  const isInvalid = $derived(invalid || Boolean(errorText));
  const hasLimitHint = $derived(maxSelections !== undefined && maxSelections > 0);
  const limitText = $derived(
    maxSelections === undefined
      ? ""
      : maxSelectionsMessage
        ? `${nonExclusiveCount} / ${maxSelections} — ${maxSelectionsMessage}`
        : `${nonExclusiveCount} / ${maxSelections}`
  );

  const describedBy = $derived(
    [
      rest["aria-describedby"],
      helperText ? helpId : null,
      hasLimitHint ? limitId : null,
      errorText ? errorId : null
    ]
      .filter(Boolean)
      .join(" ") || undefined
  );

  const classes = $derived(
    [
      "st-checkboxGroup",
      `st-checkboxGroup--${orientation}`,
      variant === "card" ? "st-checkboxGroup--card" : null,
      columns === 2 ? "st-checkboxGroup--cols-2" : null,
      className
    ]
      .filter(Boolean)
      .join(" ")
  );

  function toggle(optionValue: string, checked: boolean) {
    let next: string[];
    if (!checked) {
      next = value.filter((v) => v !== optionValue);
    } else if (exclusiveSet.has(optionValue)) {
      next = [optionValue];
    } else {
      const base = value.filter((v) => !exclusiveSet.has(v));
      if (base.includes(optionValue)) return;
      if (maxSelections !== undefined && maxSelections > 0 && base.length >= maxSelections) {
        return;
      }
      next = [...base, optionValue];
    }
    value = next;
    onchange?.(next);
  }
</script>

<fieldset
  {...rest}
  class={classes}
  {disabled}
  aria-describedby={describedBy}
  data-invalid={isInvalid ? "true" : undefined}
  data-required={required ? "true" : undefined}
  data-min-selections={minSelections}
  data-max-selections={maxSelections}
>
  <legend class="st-checkboxGroup__legend">
    {legend}{#if required}<span class="st-checkboxGroup__required" aria-hidden="true"> *</span><span class="st-visually-hidden"> ({requiredLabel})</span>{/if}
  </legend>
  {#if helperText}
    <p class="st-checkboxGroup__help" id={helpId}>{helperText}</p>
  {/if}
  {#if hasLimitHint}
    <p class="st-checkboxGroup__limit" id={limitId} aria-live="polite">{limitText}</p>
  {/if}
  <div class="st-checkboxGroup__options">
    {#each options as option (option.value)}
      {@const isChecked = value.includes(option.value)}
      {@const isExclusive = exclusiveSet.has(option.value)}
      {@const isCapped = !isChecked && !isExclusive && atMax}
      <Checkbox
        label={option.label}
        description={option.description}
        helperText={option.helperText}
        {variant}
        {name}
        value={option.value}
        checked={isChecked}
        disabled={Boolean(option.disabled || isCapped)}
        invalid={isInvalid}
        aria-describedby={describedBy}
        onchange={(event) => toggle(option.value, event.currentTarget.checked)}
      />
    {/each}
    {@render children?.()}
  </div>
  {#if errorText}
    <p class="st-checkboxGroup__error" id={errorId} role="alert">{errorText}</p>
  {/if}
</fieldset>

<style>
  .st-checkboxGroup {
    border: 0;
    container-type: inline-size;
    margin: 0;
    min-width: 0;
    padding: 0;
  }

  .st-checkboxGroup__legend {
    color: var(--st-component-field-labelText, var(--st-semantic-text-primary, #1f2437));
    font-size: var(--st-component-selection-legendFontSize, 0.9375rem);
    font-weight: 650;
    line-height: 1.3;
    padding: 0;
  }

  .st-checkboxGroup__required {
    color: var(--st-component-field-errorText, var(--st-semantic-feedback-error, #dc2626));
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

  .st-checkboxGroup__help,
  .st-checkboxGroup__limit {
    color: var(--st-component-field-helpText, var(--st-semantic-text-secondary, #444455));
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
    margin: 0.25rem 0 0;
  }

  .st-checkboxGroup__error {
    color: var(--st-component-field-errorText, var(--st-semantic-feedback-error, #dc2626));
    font-size: 0.8125rem;
    line-height: 1.4;
    margin: var(--st-spacing-2, 0.5rem) 0 0;
  }

  .st-checkboxGroup__options {
    display: flex;
    gap: var(--st-spacing-3, 0.75rem);
    margin-top: var(--st-spacing-2, 0.5rem);
  }

  .st-checkboxGroup--vertical .st-checkboxGroup__options {
    flex-direction: column;
  }

  .st-checkboxGroup--horizontal .st-checkboxGroup__options {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .st-checkboxGroup--card .st-checkboxGroup__options {
    display: grid;
    gap: var(--st-spacing-2, 0.5rem);
    grid-template-columns: 1fr;
  }

  @container (min-width: 520px) {
    .st-checkboxGroup--card.st-checkboxGroup--cols-2 .st-checkboxGroup__options,
    .st-checkboxGroup--card.st-checkboxGroup--horizontal .st-checkboxGroup__options {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
