<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  export type SurveyQuestionCardProps = Omit<HTMLAttributes<HTMLDivElement>, "class" | "title"> & {
    /** 1-based question number displayed in the counter badge. */
    index: number;
    /** Total number of questions in the survey. */
    total: number;
    /** Optional heading rendered above the question control when the child does not provide its own. */
    title?: string;
    /** Heading tag used when `title` is provided. */
    headingAs?: "h2" | "h3" | "h4";
    /** Optional section or keynote moment tag displayed in the card header. */
    sectionTag?: string;
    /** Marks the question as required. */
    required?: boolean;
    /** Visible badge text when `required` is true (e.g. "Obligatoire" / "Required"). */
    requiredLabel?: string;
    /** Visible badge text when `required` is false (e.g. "Optionnel" / "Optional"). */
    optionalLabel?: string;
    /** Localized prefix for the question counter (default "Question"). */
    counterLabel?: string;
    /** Validation message announced immediately via `role="alert"`. */
    errorText?: string;
    /** Optional trailing header slot (e.g. draft countdown tag). */
    headerTrailing?: Snippet;
    class?: string;
    children?: Snippet;
  };
</script>

<script lang="ts">
  import { AlertCircle } from "@lucide/svelte";
  import Badge from "./Badge.svelte";
  import Card from "./Card.svelte";
  import Tag from "./Tag.svelte";
  import Typography from "./Typography.svelte";

  let {
    index,
    total,
    title,
    headingAs = "h3",
    sectionTag,
    required = false,
    requiredLabel,
    optionalLabel,
    counterLabel = "Question",
    errorText,
    headerTrailing,
    class: className,
    children,
    ...rest
  }: SurveyQuestionCardProps = $props();

  const classes = $derived(["st-surveyQuestionCard", className].filter(Boolean).join(" "));
</script>

<div
  {...rest}
  class={classes}
  data-invalid={errorText ? "true" : undefined}
  data-required={required ? "true" : undefined}
>
  <Card class="st-surveyQuestionCard__card">
    <div class="st-surveyQuestionCard__inner">
      <header class="st-surveyQuestionCard__header">
        <div class="st-surveyQuestionCard__meta">
          <Badge tone="neutral" size="sm" class="st-surveyQuestionCard__counter">
            {counterLabel} {index} / {total}
          </Badge>
          {#if sectionTag}
            <Tag tone="info" size="sm">{sectionTag}</Tag>
          {/if}
          {#if required && requiredLabel}
            <Badge tone="warning" size="sm">{requiredLabel}</Badge>
          {:else if !required && optionalLabel}
            <Badge tone="neutral" size="sm">{optionalLabel}</Badge>
          {/if}
        </div>
        {#if headerTrailing}
          <div class="st-surveyQuestionCard__trailing">
            {@render headerTrailing()}
          </div>
        {/if}
      </header>

      {#if title}
        <Typography variant="h4" as={headingAs} class="st-surveyQuestionCard__title">
          {title}
        </Typography>
      {/if}

      <div class="st-surveyQuestionCard__body">
        {@render children?.()}
      </div>

      {#if errorText}
        <div class="st-surveyQuestionCard__error" role="alert">
          <AlertCircle
            size={18}
            strokeWidth={2.25}
            aria-hidden="true"
            class="st-surveyQuestionCard__errorIcon"
          />
          <span>{errorText}</span>
        </div>
      {/if}
    </div>
  </Card>
</div>

<style>
  .st-surveyQuestionCard {
    container-type: inline-size;
    width: 100%;
  }

  .st-surveyQuestionCard :global(.st-surveyQuestionCard__card) {
    padding: var(--st-spacing-4, 1rem);
  }

  .st-surveyQuestionCard[data-invalid="true"] :global(.st-surveyQuestionCard__card) {
    border-color: var(--st-semantic-feedback-error, #dc2626);
  }

  .st-surveyQuestionCard__inner {
    display: grid;
    gap: var(--st-spacing-4, 1rem);
  }

  .st-surveyQuestionCard__header {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: space-between;
  }

  .st-surveyQuestionCard__meta {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-surveyQuestionCard :global(.st-surveyQuestionCard__counter) {
    font-variant-numeric: tabular-nums;
  }

  .st-surveyQuestionCard__trailing {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-surveyQuestionCard__body {
    display: grid;
    gap: var(--st-spacing-3, 0.75rem);
    min-width: 0;
  }

  .st-surveyQuestionCard__error {
    align-items: flex-start;
    background: color-mix(
      in srgb,
      var(--st-semantic-feedback-error, #dc2626) 8%,
      var(--st-semantic-surface-default, #ffffff)
    );
    border: 1px solid var(--st-semantic-feedback-error, #dc2626);
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-semantic-text-primary, #1f2437);
    display: flex;
    font-size: 0.875rem;
    font-weight: 600;
    gap: var(--st-spacing-2, 0.5rem);
    line-height: 1.45;
    padding: var(--st-spacing-3, 0.75rem);
  }

  .st-surveyQuestionCard :global(.st-surveyQuestionCard__errorIcon) {
    color: var(--st-semantic-feedback-error, #dc2626);
    flex: 0 0 auto;
    margin-top: 0;
  }

  @container (min-width: 25rem) {
    .st-surveyQuestionCard :global(.st-surveyQuestionCard__card) {
      padding: var(--st-spacing-6, 1.5rem);
    }
  }
</style>
