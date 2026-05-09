<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type LoadingStateProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    label?: string;
    variant?: "spinner" | "skeleton";
    class?: string;
  };

  let { label = "Loading", variant = "spinner", class: className, ...rest }: LoadingStateProps =
    $props();

  const classes = () =>
    ["st-loading", `st-loading--${variant}`, className].filter(Boolean).join(" ");
</script>

<section {...rest} class={classes()} role="status" aria-label={label} aria-busy="true">
  {#if variant === "spinner"}
    <span class="st-loading__spinner" aria-hidden="true"></span>
  {:else}
    <span class="st-loading__skeleton" aria-hidden="true"></span>
  {/if}
  <span class="st-loading__label">{label}</span>
</section>

<style>
  .st-loading {
    align-items: center;
    color: var(--st-component-loadingState-text, var(--st-semantic-text-secondary));
    display: inline-flex;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-loading__spinner {
    animation: st-loading-spin 800ms linear infinite;
    border: 2px solid var(--st-component-loadingState-track, var(--st-semantic-surface-subtle));
    border-radius: var(--st-component-loadingState-radius, 9999px);
    border-top-color: var(--st-component-loadingState-indicator, var(--st-semantic-action-primary));
    display: inline-block;
    height: 1.25rem;
    width: 1.25rem;
  }

  .st-loading__skeleton {
    background: linear-gradient(
      90deg,
      var(--st-component-loadingState-track, var(--st-semantic-surface-subtle)),
      var(--st-component-loadingState-indicator, var(--st-semantic-action-primary)),
      var(--st-component-loadingState-track, var(--st-semantic-surface-subtle))
    );
    background-size: 200% 100%;
    border-radius: var(--st-component-loadingState-radius, 9999px);
    display: inline-block;
    height: 0.75rem;
    width: 8rem;
  }

  .st-loading--skeleton .st-loading__skeleton {
    animation: st-loading-skeleton 1200ms ease-in-out infinite;
  }

  .st-loading__label {
    font-size: 0.875rem;
  }

  @keyframes st-loading-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes st-loading-skeleton {
    to {
      background-position: -200% 0;
    }
  }
</style>
