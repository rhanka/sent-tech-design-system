<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type AlertProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    tone?: "info" | "success" | "warning" | "error";
    title: string;
    message?: string;
    class?: string;
    actions?: Snippet;
    children?: Snippet;
  };

  let {
    tone = "info",
    title,
    message,
    class: className,
    actions,
    children,
    ...rest
  }: AlertProps = $props();

  const classes = () => ["st-alert", `st-alert--${tone}`, className].filter(Boolean).join(" ");
  const role = () => (tone === "error" || tone === "warning" ? "alert" : "status");
</script>

<section {...rest} class={classes()} role={role()}>
  <div class="st-alert__content">
    <h2 class="st-alert__title">{title}</h2>
    {#if message}<p class="st-alert__message">{message}</p>{/if}
    {@render children?.()}
  </div>
  {#if actions}
    <div class="st-alert__actions">
      {@render actions()}
    </div>
  {/if}
</section>

<style>
  .st-alert {
    background: var(--st-component-alert-background, var(--st-semantic-surface-raised));
    /* Per-side box border (P-B): top/right/bottom resolve per theme (base = 1px
       subtle box; DSFR = none; Carbon = none — its only visible edge is the left
       bar). Fallbacks reproduce the prior 1px subtle box. */
    border-top: var(
      --st-component-alert-borderTop,
      1px solid var(--st-component-alert-border, var(--st-semantic-border-subtle))
    );
    border-right: var(
      --st-component-alert-borderRight,
      1px solid var(--st-component-alert-border, var(--st-semantic-border-subtle))
    );
    border-bottom: var(
      --st-component-alert-borderBottom,
      1px solid var(--st-component-alert-border, var(--st-semantic-border-subtle))
    );
    /* Left accent edge: a real left border of `accentWidth` (base 4px / Carbon
       3px), coloured per severity via --alert-accent. DSFR sets accentWidth 0 and
       draws the accent as a ::before filet instead (see below). */
    border-left-style: solid;
    border-left-width: var(--st-component-alert-accentWidth, 0.25rem);
    border-left-color: var(--alert-accent, var(--st-semantic-feedback-info));
    border-radius: 0;
    color: var(--st-component-alert-text, var(--st-semantic-text-primary));
    display: flex;
    font-size: var(--st-component-alert-fontSize, inherit);
    line-height: var(--st-component-alert-lineHeight, normal);
    letter-spacing: var(--st-component-alert-letterSpacing, normal);
    gap: var(--st-spacing-4, 1rem);
    justify-content: space-between;
    position: relative;
    padding: var(--st-component-alert-paddingTop, var(--st-spacing-4, 1rem))
      var(--st-component-alert-paddingRight, var(--st-spacing-4, 1rem))
      var(--st-component-alert-paddingBottom, var(--st-spacing-4, 1rem))
      var(--st-component-alert-paddingLeft, var(--st-spacing-4, 1rem));
  }

  /* Severity filet (DSFR): a left bar drawn as a ::before INSIDE the box, so it
     adds NO measured border (the real `.fr-alert` accent technique). Width 0 by
     default (base/Carbon use a real left border) → the bar is invisible. */
  .st-alert::before {
    background: var(--alert-accent, var(--st-semantic-feedback-info));
    bottom: 0;
    content: "";
    left: 0;
    position: absolute;
    top: 0;
    width: var(--st-component-alert-filetWidth, 0);
  }

  .st-alert--info {
    --alert-accent: var(--st-component-alert-infoBorder, var(--st-semantic-feedback-info));
  }

  .st-alert--success {
    --alert-accent: var(--st-component-alert-successBorder, var(--st-semantic-feedback-success));
  }

  .st-alert--warning {
    --alert-accent: var(--st-component-alert-warningBorder, var(--st-semantic-feedback-warning));
  }

  .st-alert--error {
    --alert-accent: var(--st-component-alert-errorBorder, var(--st-semantic-feedback-error));
  }

  .st-alert__content {
    display: grid;
    gap: var(--st-spacing-1, 0.25rem);
  }

  .st-alert__title {
    font-size: 0.9375rem;
    margin: 0;
  }

  .st-alert__message {
    color: var(--st-semantic-text-secondary);
    font-size: 0.875rem;
    line-height: 1.5;
    margin: 0;
  }

  .st-alert__actions {
    align-items: start;
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
  }
</style>
