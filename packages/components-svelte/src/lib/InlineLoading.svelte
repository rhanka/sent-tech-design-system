<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type InlineLoadingProps = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    label?: string;
    status?: "active" | "success" | "error" | "inactive";
    class?: string;
  };

  let {
    label,
    status = "active",
    class: className,
    ...rest
  }: InlineLoadingProps = $props();

  const classes = () =>
    ["st-inlineLoading", `st-inlineLoading--${status}`, className].filter(Boolean).join(" ");

  const role = () => (status === "error" ? "alert" : "status");
</script>

<div {...rest} class={classes()} role={role()} aria-live="polite">
  <span class="st-inlineLoading__icon" aria-hidden="true">
    {#if status === "active"}
      <svg viewBox="0 0 16 16" width="16" height="16">
        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.2" />
        <path d="M14 8a6 6 0 0 0-6-6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="0.9s" repeatCount="indefinite" />
        </path>
      </svg>
    {:else if status === "success"}
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" width="14" height="14">
        <path d="m3 8 3.5 3.5L13 5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    {:else if status === "error"}
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" width="14" height="14">
        <path d="M4 4l8 8M12 4l-8 8" stroke-linecap="round" />
      </svg>
    {/if}
  </span>
  {#if label}<span class="st-inlineLoading__label">{label}</span>{/if}
</div>

<style>
  .st-inlineLoading {
    align-items: center;
    color: var(--st-semantic-text-secondary);
    display: inline-flex;
    font-size: 0.875rem;
    gap: 0.5rem;
  }

  .st-inlineLoading__icon {
    align-items: center;
    display: inline-flex;
    justify-content: center;
  }

  .st-inlineLoading--active .st-inlineLoading__icon {
    color: var(--st-semantic-action-primary);
  }

  .st-inlineLoading--success {
    color: var(--st-semantic-feedback-success);
  }

  .st-inlineLoading--error {
    color: var(--st-semantic-feedback-error);
  }

  .st-inlineLoading--inactive {
    color: var(--st-semantic-text-muted);
  }

  @media (prefers-reduced-motion: reduce) {
    .st-inlineLoading__icon svg path animateTransform {
      display: none;
    }
  }
</style>
