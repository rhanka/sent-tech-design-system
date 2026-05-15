<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  type ToggleProps = Omit<HTMLInputAttributes, "class" | "role" | "type" | "size"> & {
    label: string;
    labelOn?: string;
    labelOff?: string;
    helperText?: string;
    size?: "sm" | "md";
    checked?: boolean;
    class?: string;
  };

  let {
    label,
    labelOn = "On",
    labelOff = "Off",
    helperText,
    size = "md",
    checked = $bindable(false),
    class: className,
    ...rest
  }: ToggleProps = $props();

  const classes = () =>
    ["st-toggle", `st-toggle--${size}`, className].filter(Boolean).join(" ");
</script>

<label class={classes()}>
  <span class="st-toggle__label">{label}</span>
  <span class="st-toggle__row">
    <input
      {...rest}
      class="st-toggle__input"
      type="checkbox"
      role="switch"
      bind:checked
      aria-checked={checked ? "true" : "false"}
    />
    <span class="st-toggle__track" aria-hidden="true">
      <span class="st-toggle__thumb"></span>
    </span>
    <span class="st-toggle__state" aria-hidden="true">{checked ? labelOn : labelOff}</span>
  </span>
  {#if helperText}<span class="st-toggle__help">{helperText}</span>{/if}
</label>

<style>
  .st-toggle {
    color: var(--st-component-field-labelText, var(--st-semantic-text-primary));
    display: inline-grid;
    gap: 0.375rem;
  }

  .st-toggle__label {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .st-toggle__row {
    align-items: center;
    display: inline-flex;
    gap: 0.625rem;
    position: relative;
  }

  .st-toggle__input {
    height: var(--st-toggle-trackHeight, 1.25rem);
    margin: 0;
    opacity: 0;
    position: absolute;
    width: var(--st-toggle-trackWidth, 2.25rem);
  }

  .st-toggle__track {
    align-items: center;
    background: var(--st-component-selection-switchTrack, var(--st-semantic-border-strong));
    border-radius: var(--st-radius-pill, 999px);
    display: inline-flex;
    flex: 0 0 auto;
    height: var(--st-toggle-trackHeight, 1.25rem);
    padding: 0.125rem;
    transition: background var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    width: var(--st-toggle-trackWidth, 2.25rem);
  }

  .st-toggle__thumb {
    background: var(--st-component-selection-switchThumb, var(--st-semantic-surface-default));
    border-radius: var(--st-radius-pill, 999px);
    height: var(--st-toggle-thumbSize, 1rem);
    transform: translateX(0);
    transition: transform var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    width: var(--st-toggle-thumbSize, 1rem);
  }

  .st-toggle__input:checked + .st-toggle__track {
    background: var(--st-component-selection-switchTrackChecked, var(--st-semantic-action-primary));
  }

  .st-toggle__input:checked + .st-toggle__track .st-toggle__thumb {
    transform: translateX(calc(var(--st-toggle-trackWidth, 2.25rem) - var(--st-toggle-thumbSize, 1rem) - 0.25rem));
  }

  .st-toggle__input:focus-visible + .st-toggle__track {
    box-shadow: 0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
  }

  .st-toggle__input:disabled + .st-toggle__track {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .st-toggle__state {
    color: var(--st-semantic-text-secondary);
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
  }

  .st-toggle__help {
    color: var(--st-component-field-helpText, var(--st-semantic-text-secondary));
    font-size: 0.8125rem;
  }

  .st-toggle--sm {
    --st-toggle-trackHeight: 1rem;
    --st-toggle-trackWidth: 1.875rem;
    --st-toggle-thumbSize: 0.75rem;
  }

  .st-toggle--md {
    --st-toggle-trackHeight: 1.25rem;
    --st-toggle-trackWidth: 2.25rem;
    --st-toggle-thumbSize: 1rem;
  }
</style>
