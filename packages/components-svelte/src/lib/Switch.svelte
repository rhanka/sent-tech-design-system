<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  type SwitchProps = Omit<HTMLInputAttributes, "class" | "role" | "type"> & {
    label: string;
    helperText?: string;
    class?: string;
  };

  let { label, helperText, checked = false, class: className, ...rest }: SwitchProps = $props();
  const classes = () => ["st-switch", className].filter(Boolean).join(" ");
</script>

<label class={classes()}>
  <input {...rest} class="st-switch__input" type="checkbox" role="switch" {checked} aria-checked={checked ? "true" : "false"} />
  <span class="st-switch__track" aria-hidden="true">
    <span class="st-switch__thumb"></span>
  </span>
  <span class="st-switch__content">
    <span class="st-switch__label">{label}</span>
    {#if helperText}<span class="st-switch__help">{helperText}</span>{/if}
  </span>
</label>

<style>
  .st-switch {
    align-items: center;
    color: var(--st-component-field-labelText, var(--st-semantic-text-primary));
    display: inline-grid;
    gap: 0.75rem;
    grid-template-columns: auto 1fr;
    position: relative;
  }

  .st-switch__input {
    height: 1.25rem;
    margin: 0;
    opacity: 0;
    position: absolute;
    width: 2.25rem;
  }

  .st-switch__track {
    align-items: center;
    background: var(--st-component-selection-switchTrack, var(--st-semantic-border-strong));
    border-radius: var(--st-radius-pill, 999px);
    display: inline-flex;
    height: 1.25rem;
    padding: 0.125rem;
    transition: background var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    width: 2.25rem;
  }

  .st-switch__thumb {
    background: var(--st-component-selection-switchThumb, var(--st-semantic-surface-default));
    border-radius: var(--st-radius-pill, 999px);
    height: 1rem;
    transform: translateX(0);
    transition: transform var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    width: 1rem;
  }

  .st-switch__input:checked + .st-switch__track {
    background: var(--st-component-selection-switchTrackChecked, var(--st-semantic-action-primary));
  }

  .st-switch__input:checked + .st-switch__track .st-switch__thumb {
    transform: translateX(1rem);
  }

  .st-switch__input:focus-visible + .st-switch__track {
    box-shadow: 0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
  }

  .st-switch__content {
    display: grid;
    gap: 0.25rem;
  }

  .st-switch__label {
    font-size: 0.9375rem;
  }

  .st-switch__help {
    color: var(--st-component-field-helpText, var(--st-semantic-text-secondary));
    font-size: 0.8125rem;
  }
</style>
