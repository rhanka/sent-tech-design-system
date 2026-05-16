<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLFieldsetAttributes } from "svelte/elements";

  type FormGroupProps = Omit<HTMLFieldsetAttributes, "class"> & {
    legend?: string;
    helperText?: string;
    disabled?: boolean;
    class?: string;
    children: Snippet;
  };

  let {
    legend,
    helperText,
    disabled = false,
    class: className,
    children,
    ...rest
  }: FormGroupProps = $props();

  const classes = () => ["st-form-group", className].filter(Boolean).join(" ");
</script>

<fieldset {...rest} class={classes()} {disabled}>
  {#if legend}<legend class="st-form-group__legend">{legend}</legend>{/if}
  <div class="st-form-group__body">
    {@render children()}
  </div>
  {#if helperText}
    <p class="st-form-group__help">{helperText}</p>
  {/if}
</fieldset>

<style>
  .st-form-group {
    border: 1px solid
      var(--st-component-formGroup-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-formGroup-radius, 0.5rem);
    color: var(--st-semantic-text-primary);
    display: grid;
    gap: var(--st-component-formGroup-gap, 1rem);
    margin: 0;
    padding: var(--st-component-formGroup-padding, 1rem);
  }

  .st-form-group__legend {
    font-size: 0.875rem;
    font-weight: 600;
    padding: 0 0.25rem;
  }

  .st-form-group__body {
    display: grid;
    gap: var(--st-component-formGroup-fieldGap, 1rem);
  }

  .st-form-group__help {
    color: var(
      --st-component-formGroup-helpText,
      var(--st-semantic-text-secondary)
    );
    font-size: 0.8125rem;
    line-height: 1.4;
    margin: 0;
  }

  .st-form-group:disabled {
    opacity: 0.6;
  }
</style>
