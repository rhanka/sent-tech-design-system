<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  type RadioProps = Omit<HTMLInputAttributes, "class" | "type"> & {
    label: string;
    helperText?: string;
    invalid?: boolean;
    class?: string;
  };

  let { label, helperText, invalid = false, class: className, ...rest }: RadioProps = $props();
  const classes = () => ["st-choice", className].filter(Boolean).join(" ");
</script>

<label class={classes()}>
  <input {...rest} class="st-choice__input" type="radio" data-invalid={invalid ? "true" : undefined} />
  <span class="st-choice__content">
    <span class="st-choice__label">{label}</span>
    {#if helperText}<span class="st-choice__help">{helperText}</span>{/if}
  </span>
</label>

<style>
  .st-choice {
    align-items: start;
    color: var(--st-component-field-labelText, var(--st-semantic-text-primary));
    display: inline-grid;
    gap: 0.625rem;
    grid-template-columns: auto 1fr;
  }

  .st-choice__input {
    height: 1rem;
    margin: 0.125rem 0 0;
    width: 1rem;
  }

  .st-choice__content {
    display: grid;
    gap: 0.25rem;
  }

  .st-choice__label {
    font-size: 0.9375rem;
  }

  .st-choice__help {
    color: var(--st-component-field-helpText, var(--st-semantic-text-secondary));
    font-size: 0.8125rem;
  }
</style>
