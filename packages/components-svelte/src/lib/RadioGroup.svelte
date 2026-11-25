<script lang="ts" module>
  export interface RadioGroupOption {
    label: string;
    value: string;
    disabled?: boolean;
    helperText?: string;
    description?: string;
  }

  export type RadioGroupVariant = "list" | "card";
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import Radio from "./Radio.svelte";

  type RadioGroupProps = Omit<HTMLAttributes<HTMLFieldSetElement>, "class" | "onchange"> & {
    legend: string;
    /** Valeur sélectionnée (contrôlée). */
    value?: string;
    onchange?: (value: string) => void;
    orientation?: "vertical" | "horizontal";
    /** Presentation density: list rows (default) or >= 48px choice cards. */
    variant?: RadioGroupVariant;
    /** Optional 2-column grid on wide containers (>= 520px) for card variant. */
    columns?: 1 | 2;
    /** Nom partagé garantissant l'exclusivité radio. Requis. */
    name: string;
    options?: RadioGroupOption[];
    helperText?: string;
    errorText?: string;
    required?: boolean;
    invalid?: boolean;
    disabled?: boolean;
    class?: string;
    children?: Snippet;
  };

  let {
    legend,
    value = $bindable<string | undefined>(undefined),
    onchange,
    orientation = "vertical",
    variant = "list",
    columns = 1,
    name,
    options = [],
    helperText,
    errorText,
    required = false,
    invalid = false,
    disabled = false,
    class: className,
    children,
    ...rest
  }: RadioGroupProps = $props();

  const uid = $props.id();
  const helpId = `${uid}-help`;
  const errorId = `${uid}-error`;

  const isInvalid = $derived(invalid || Boolean(errorText));
  const describedBy = $derived(
    [
      rest["aria-describedby"],
      helperText ? helpId : null,
      errorText ? errorId : null
    ]
      .filter(Boolean)
      .join(" ") || undefined
  );

  const classes = $derived(
    [
      "st-radioGroup",
      `st-radioGroup--${orientation}`,
      variant === "card" ? "st-radioGroup--card" : null,
      columns === 2 ? "st-radioGroup--cols-2" : null,
      className
    ]
      .filter(Boolean)
      .join(" ")
  );

  function select(optionValue: string) {
    if (optionValue === value) return;
    value = optionValue;
    onchange?.(optionValue);
  }
</script>

<fieldset
  role="radiogroup"
  {...rest}
  class={classes}
  {disabled}
  aria-describedby={describedBy}
  aria-invalid={isInvalid ? "true" : undefined}
  aria-required={required ? "true" : undefined}
>
  <legend class="st-radioGroup__legend">
    {legend}{#if required}<span class="st-radioGroup__required" aria-hidden="true"> *</span>{/if}
  </legend>
  {#if helperText}
    <p class="st-radioGroup__help" id={helpId}>{helperText}</p>
  {/if}
  <div class="st-radioGroup__options">
    {#each options as option (option.value)}
      <Radio
        label={option.label}
        description={option.description}
        helperText={option.helperText}
        {variant}
        {name}
        value={option.value}
        checked={value === option.value}
        disabled={option.disabled}
        required={required || undefined}
        invalid={isInvalid}
        aria-describedby={describedBy}
        onchange={() => select(option.value)}
      />
    {/each}
    {@render children?.()}
  </div>
  {#if errorText}
    <p class="st-radioGroup__error" id={errorId} role="alert">{errorText}</p>
  {/if}
</fieldset>

<style>
  .st-radioGroup {
    border: 0;
    container-type: inline-size;
    margin: 0;
    min-width: 0;
    padding: 0;
  }

  .st-radioGroup__legend {
    color: var(--st-component-field-labelText, var(--st-semantic-text-primary, #1f2437));
    /* Point d'entrée de personnalisation (même modèle que
       --st-component-selection-choiceLabelFontSize) ; md = rendu actuel.
       Pas de prop `size` : Checkbox/CheckboxGroup n'en ont aucune. */
    font-size: var(--st-component-selection-legendFontSize, 0.9375rem);
    font-weight: 650;
    line-height: 1.3;
    padding: 0;
  }

  .st-radioGroup__required {
    color: var(--st-component-field-errorText, var(--st-semantic-feedback-error, #dc2626));
  }

  .st-radioGroup__help {
    color: var(--st-component-field-helpText, var(--st-semantic-text-secondary, #444455));
    font-size: 0.8125rem;
    margin: 0.25rem 0 0;
  }

  .st-radioGroup__error {
    color: var(--st-component-field-errorText, var(--st-semantic-feedback-error, #dc2626));
    font-size: 0.8125rem;
    line-height: 1.4;
    margin: var(--st-spacing-2, 0.5rem) 0 0;
  }

  .st-radioGroup__options {
    display: flex;
    gap: var(--st-spacing-3, 0.75rem);
    margin-top: var(--st-spacing-2, 0.5rem);
  }

  .st-radioGroup--vertical .st-radioGroup__options {
    flex-direction: column;
  }

  .st-radioGroup--horizontal .st-radioGroup__options {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .st-radioGroup--card .st-radioGroup__options {
    display: grid;
    gap: var(--st-spacing-2, 0.5rem);
    grid-template-columns: 1fr;
  }

  @container (min-width: 520px) {
    .st-radioGroup--card.st-radioGroup--cols-2 .st-radioGroup__options,
    .st-radioGroup--card.st-radioGroup--horizontal .st-radioGroup__options {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
