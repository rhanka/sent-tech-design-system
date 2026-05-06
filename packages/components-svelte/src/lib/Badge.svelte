<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "class"> & {
    tone?: "neutral" | "success" | "warning" | "error" | "info";
    class?: string;
    children?: Snippet;
  };

  let { tone = "neutral", class: className, children, ...rest }: BadgeProps = $props();

  const classes = () => ["st-badge", `st-badge--${tone}`, className].filter(Boolean).join(" ");
</script>

<span {...rest} class={classes()}>
  {@render children?.()}
</span>

<style>
  .st-badge {
    display: inline-flex;
    align-items: center;
    border-radius: var(--st-radius-pill, 999px);
    font-size: 0.75rem;
    font-weight: 650;
    line-height: 1;
    padding: 0.25rem 0.5rem;
  }

  .st-badge--neutral {
    background: var(--st-semantic-surface-subtle);
    color: var(--st-semantic-text-secondary);
  }

  .st-badge--success {
    background: color-mix(in srgb, var(--st-semantic-feedback-success) 14%, white);
    color: var(--st-semantic-feedback-success);
  }

  .st-badge--warning {
    background: color-mix(in srgb, var(--st-semantic-feedback-warning) 14%, white);
    color: var(--st-semantic-feedback-warning);
  }

  .st-badge--error {
    background: color-mix(in srgb, var(--st-semantic-feedback-error) 14%, white);
    color: var(--st-semantic-feedback-error);
  }

  .st-badge--info {
    background: color-mix(in srgb, var(--st-semantic-feedback-info) 14%, white);
    color: var(--st-semantic-feedback-info);
  }
</style>
