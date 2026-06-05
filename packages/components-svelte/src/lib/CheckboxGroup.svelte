<script lang="ts" module>
  export interface CheckboxGroupOption {
    label: string;
    value: string;
    disabled?: boolean;
    helperText?: string;
  }
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
    /** Nom partagé par les cases (utile pour la soumission de formulaire). */
    name?: string;
    options?: CheckboxGroupOption[];
    /** Description optionnelle affichée sous la légende. */
    helperText?: string;
    /** Marque le groupe comme requis. */
    disabled?: boolean;
    class?: string;
    /** Contenu libre rendu en plus des options. */
    children?: Snippet;
  };

  let {
    legend,
    value = [],
    onchange,
    orientation = "vertical",
    name,
    options = [],
    helperText,
    disabled = false,
    class: className,
    children,
    ...rest
  }: CheckboxGroupProps = $props();

  const classes = $derived(
    ["st-checkboxGroup", `st-checkboxGroup--${orientation}`, className].filter(Boolean).join(" ")
  );

  function toggle(optionValue: string, checked: boolean) {
    const next = checked
      ? [...value, optionValue]
      : value.filter((v) => v !== optionValue);
    onchange?.(next);
  }
</script>

<fieldset {...rest} class={classes} {disabled}>
  <legend class="st-checkboxGroup__legend">{legend}</legend>
  {#if helperText}
    <p class="st-checkboxGroup__help">{helperText}</p>
  {/if}
  <div class="st-checkboxGroup__options">
    {#each options as option (option.value)}
      <Checkbox
        label={option.label}
        helperText={option.helperText}
        {name}
        value={option.value}
        checked={value.includes(option.value)}
        disabled={option.disabled}
        onchange={(event) => toggle(option.value, event.currentTarget.checked)}
      />
    {/each}
    {@render children?.()}
  </div>
</fieldset>

<style>
  .st-checkboxGroup {
    border: 0;
    margin: 0;
    min-width: 0;
    padding: 0;
  }

  .st-checkboxGroup__legend {
    color: var(--st-component-field-labelText, var(--st-semantic-text-primary));
    font-size: 0.9375rem;
    font-weight: 650;
    line-height: 1.3;
    padding: 0;
  }

  .st-checkboxGroup__help {
    color: var(--st-component-field-helpText, var(--st-semantic-text-secondary));
    font-size: 0.8125rem;
    margin: 0.25rem 0 0;
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
</style>
