<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  /** A single field error: `href` points to the offending control, `text` is the message. */
  export type ErrorSummaryItem = { href: string; text: string };

  type ErrorSummaryProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    /** Summary heading. */
    heading?: string;
    /** The list of errors, each linking to the field that needs attention. */
    errors?: ErrorSummaryItem[];
    class?: string;
  };

  let {
    heading = "There was a problem",
    errors = [],
    class: className,
    ...rest
  }: ErrorSummaryProps = $props();

  const classes = () => ["st-error-summary", className].filter(Boolean).join(" ");
</script>

<!--
  ErrorSummary — GCDS « Error summary »: an aggregated list of a form's errors,
  each entry linking to the field that needs attention. role="alert" + tabindex
  so it can take focus when shown after a failed submission.
-->
<section {...rest} class={classes()} role="alert" tabindex="-1">
  <h2 class="st-error-summary__heading">{heading}</h2>
  {#if errors.length > 0}
    <ul class="st-error-summary__list">
      {#each errors as error (error.href)}
        <li class="st-error-summary__item">
          <a class="st-error-summary__link" href={error.href}>{error.text}</a>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .st-error-summary {
    background: var(--st-semantic-surface-default);
    border: 2px solid var(--st-semantic-feedback-error);
    border-radius: var(--st-radius-md, 0.25rem);
    color: var(--st-semantic-text-primary);
    padding: var(--st-spacing-4, 1rem);
  }

  .st-error-summary__heading {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0 0 var(--st-spacing-2, 0.5rem);
  }

  .st-error-summary__list {
    display: grid;
    gap: var(--st-spacing-1, 0.25rem);
    margin: 0;
    padding-left: var(--st-spacing-4, 1rem);
  }

  .st-error-summary__link {
    color: var(--st-semantic-feedback-error);
    font-weight: 600;
    text-decoration: underline;
  }

  .st-error-summary__link:hover,
  .st-error-summary__link:focus-visible {
    text-decoration: none;
  }
</style>
