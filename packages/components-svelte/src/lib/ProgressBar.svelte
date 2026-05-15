<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type ProgressBarProps = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    label?: string;
    helperText?: string;
    value?: number;
    max?: number;
    indeterminate?: boolean;
    tone?: "neutral" | "success" | "warning" | "error";
    size?: "sm" | "md" | "lg";
    showValue?: boolean;
    valueText?: string;
    class?: string;
  };

  let {
    label,
    helperText,
    value = 0,
    max = 100,
    indeterminate = false,
    tone = "neutral",
    size = "md",
    showValue = false,
    valueText,
    class: className,
    ...rest
  }: ProgressBarProps = $props();

  const wrapperClasses = () => ["st-progressBar", className].filter(Boolean).join(" ");
  const trackClasses = () =>
    [
      "st-progressBar__track",
      `st-progressBar__track--${size}`,
      `st-progressBar__track--${tone}`,
      indeterminate ? "st-progressBar__track--indeterminate" : null
    ]
      .filter(Boolean)
      .join(" ");

  const clampedValue = () => {
    if (max <= 0) return 0;
    if (value < 0) return 0;
    if (value > max) return max;
    return value;
  };

  const percent = () => (indeterminate ? 0 : (clampedValue() / max) * 100);
  const displayValue = () => {
    if (valueText) return valueText;
    if (indeterminate) return "";
    return `${Math.round(percent())}%`;
  };
</script>

<div {...rest} class={wrapperClasses()}>
  {#if label || (showValue && !indeterminate)}
    <div class="st-progressBar__header">
      {#if label}<span class="st-progressBar__label">{label}</span>{/if}
      {#if showValue && !indeterminate}
        <span class="st-progressBar__value" aria-hidden="true">{displayValue()}</span>
      {/if}
    </div>
  {/if}
  <div
    class={trackClasses()}
    role="progressbar"
    aria-valuemin={indeterminate ? undefined : 0}
    aria-valuemax={indeterminate ? undefined : max}
    aria-valuenow={indeterminate ? undefined : clampedValue()}
    aria-valuetext={indeterminate ? undefined : displayValue()}
    aria-label={label}
  >
    <div class="st-progressBar__fill" style="--st-progressBar-pct: {percent()}%"></div>
  </div>
  {#if helperText}<span class="st-progressBar__help">{helperText}</span>{/if}
</div>

<style>
  .st-progressBar {
    color: var(--st-semantic-text-primary);
    display: grid;
    gap: 0.375rem;
    width: 100%;
  }

  .st-progressBar__header {
    align-items: baseline;
    display: flex;
    gap: 0.75rem;
    justify-content: space-between;
  }

  .st-progressBar__label {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .st-progressBar__value {
    color: var(--st-semantic-text-secondary);
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
  }

  .st-progressBar__help {
    color: var(--st-component-field-helpText, var(--st-semantic-text-secondary));
    font-size: 0.8125rem;
  }

  .st-progressBar__track {
    background: var(--st-semantic-surface-subtle);
    border-radius: var(--st-radius-pill, 999px);
    overflow: hidden;
    position: relative;
    width: 100%;
  }

  .st-progressBar__track--sm {
    height: 0.25rem;
  }

  .st-progressBar__track--md {
    height: 0.5rem;
  }

  .st-progressBar__track--lg {
    height: 0.75rem;
  }

  .st-progressBar__fill {
    background: var(--st-progressBar-color, var(--st-semantic-action-primary));
    border-radius: inherit;
    height: 100%;
    transform-origin: left center;
    transition: width var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    width: var(--st-progressBar-pct, 0%);
  }

  .st-progressBar__track--neutral .st-progressBar__fill {
    background: var(--st-semantic-action-primary);
  }

  .st-progressBar__track--success .st-progressBar__fill {
    background: var(--st-semantic-feedback-success);
  }

  .st-progressBar__track--warning .st-progressBar__fill {
    background: var(--st-semantic-feedback-warning);
  }

  .st-progressBar__track--error .st-progressBar__fill {
    background: var(--st-semantic-feedback-error);
  }

  .st-progressBar__track--indeterminate .st-progressBar__fill {
    animation: st-progressBar-indeterminate 1.4s ease-in-out infinite;
    width: 30%;
  }

  @keyframes st-progressBar-indeterminate {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(380%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .st-progressBar__track--indeterminate .st-progressBar__fill {
      animation: none;
      width: 100%;
    }
  }
</style>
