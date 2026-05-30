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
  /* P-C: per-theme badge anatomy. Every var falls back to the prior base literal,
     so a theme that emits no `--st-component-badge-*` renders byte-identically. */
  .st-badge {
    display: inline-flex;
    align-items: center;
    border-radius: var(--st-component-badge-radius, var(--st-radius-pill, 999px));
    font-size: var(--st-component-badge-fontSize, 0.75rem);
    font-weight: var(--st-component-badge-fontWeight, 650);
    letter-spacing: var(--st-component-badge-letterSpacing, normal);
    line-height: var(--st-component-badge-lineHeight, 1);
    min-height: var(--st-component-badge-minHeight, 0);
    padding: var(--st-component-badge-paddingBlock, 0.25rem)
      var(--st-component-badge-paddingInline, 0.5rem);
    text-transform: var(--st-component-badge-textTransform, none);
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
    background: var(
      --st-component-badge-infoBackground,
      color-mix(in srgb, var(--st-semantic-feedback-info) 14%, white)
    );
    color: var(--st-component-badge-infoText, var(--st-semantic-feedback-info));
  }
</style>
