<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { LoaderCircle, CircleCheck, CircleAlert } from "@lucide/svelte";

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
      <span class="st-inlineLoading__spinner">
        <LoaderCircle size={16} strokeWidth={2} aria-hidden="true" />
      </span>
    {:else if status === "success"}
      <CircleCheck size={16} strokeWidth={2} aria-hidden="true" />
    {:else if status === "error"}
      <CircleAlert size={16} strokeWidth={2} aria-hidden="true" />
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

  .st-inlineLoading__spinner {
    align-items: center;
    animation: st-inlineLoading-spin 0.9s linear infinite;
    display: inline-flex;
    justify-content: center;
    line-height: 0;
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

  @keyframes st-inlineLoading-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .st-inlineLoading__spinner {
      animation: none;
    }
  }
</style>
