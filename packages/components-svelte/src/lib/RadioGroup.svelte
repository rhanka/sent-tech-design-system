<script lang="ts" module>
  export interface RadioGroupOption {
    label: string;
    value: string;
    disabled?: boolean;
    helperText?: string;
  }
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
    /** Nom partagé garantissant l'exclusivité radio. Requis. */
    name: string;
    options?: RadioGroupOption[];
    helperText?: string;
    disabled?: boolean;
    class?: string;
    children?: Snippet;
  };

  let {
    legend,
    value,
    onchange,
    orientation = "vertical",
    name,
    options = [],
    helperText,
    disabled = false,
    class: className,
    children,
    ...rest
  }: RadioGroupProps = $props();

  const classes = $derived(
    ["st-radioGroup", `st-radioGroup--${orientation}`, className].filter(Boolean).join(" ")
  );

  function select(optionValue: string) {
    if (optionValue === value) return;
    onchange?.(optionValue);
  }
</script>

<fieldset {...rest} class={classes} {disabled}>
  <legend class="st-radioGroup__legend">{legend}</legend>
  {#if helperText}
    <p class="st-radioGroup__help">{helperText}</p>
  {/if}
  <div class="st-radioGroup__options">
    {#each options as option (option.value)}
      <Radio
        label={option.label}
        helperText={option.helperText}
        {name}
        value={option.value}
        checked={value === option.value}
        disabled={option.disabled}
        onchange={() => select(option.value)}
      />
    {/each}
    {@render children?.()}
  </div>
</fieldset>

<style>
  .st-radioGroup {
    border: 0;
    margin: 0;
    min-width: 0;
    padding: 0;
  }

  .st-radioGroup__legend {
    color: var(--st-component-field-labelText, var(--st-semantic-text-primary));
    font-size: 0.9375rem;
    font-weight: 650;
    line-height: 1.3;
    padding: 0;
  }

  .st-radioGroup__help {
    color: var(--st-component-field-helpText, var(--st-semantic-text-secondary));
    font-size: 0.8125rem;
    margin: 0.25rem 0 0;
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
</style>
