<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  export type SurveyQuestionScope = "enterprise" | "personal";

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
    /** Enables the per-question company/personal orientation toggle in the card header. */
    contextual?: boolean;
    /** Active orientation for a contextual question. */
    activeScope?: SurveyQuestionScope;
    /** Label for the company option in the per-question toggle. */
    enterpriseLabel?: string;
    /** Label for the personal option in the per-question toggle. */
    personalLabel?: string;
    /** Accessible group label for the per-question toggle. */
    scopeToggleLabel?: string;
    /** Disables the per-question toggle when read-only. */
    scopeDisabled?: boolean;
    /** Fires when the respondent switches the per-question orientation. */
    onscopechange?: (scope: SurveyQuestionScope) => void;
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
    contextual = false,
    activeScope,
    enterpriseLabel = "Entreprise",
    personalLabel = "Perso",
    scopeToggleLabel = "Contexte de réponse",
    scopeDisabled = false,
    onscopechange,
    errorText,
    headerTrailing,
    class: className,
    children,
    ...rest
  }: SurveyQuestionCardProps = $props();

  let enterpriseBtnEl = $state<HTMLButtonElement | undefined>(undefined);
  let personalBtnEl = $state<HTMLButtonElement | undefined>(undefined);

  const classes = $derived(["st-surveyQuestionCard", className].filter(Boolean).join(" "));
  const showScopeToggle = $derived(Boolean(contextual && activeScope));

  function handleScopeSelect(next: SurveyQuestionScope) {
    if (scopeDisabled || next === activeScope) return;
    onscopechange?.(next);
  }

  function handleScopeKeydown(event: KeyboardEvent, current: SurveyQuestionScope) {
    if (scopeDisabled) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const target: SurveyQuestionScope = current === "enterprise" ? "personal" : "enterprise";
      onscopechange?.(target);
      if (target === "enterprise") {
        enterpriseBtnEl?.focus();
      } else {
        personalBtnEl?.focus();
      }
    }
  }
</script>

<div
  {...rest}
  class={classes}
  data-invalid={errorText ? "true" : rest["data-invalid"]}
  data-required={required ? "true" : undefined}
  data-scope={showScopeToggle ? activeScope : undefined}
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
        {#if showScopeToggle || headerTrailing}
          <div class="st-surveyQuestionCard__trailing">
            {#if showScopeToggle}
              <div
                class="st-surveyQuestionCard__scopeToggle"
                role="group"
                aria-label={scopeToggleLabel}
              >
                <button
                  bind:this={enterpriseBtnEl}
                  type="button"
                  class="st-surveyQuestionCard__scopeBtn"
                  class:st-surveyQuestionCard__scopeBtn--active={activeScope === "enterprise"}
                  aria-pressed={activeScope === "enterprise" ? "true" : "false"}
                  disabled={scopeDisabled}
                  onclick={() => handleScopeSelect("enterprise")}
                  onkeydown={(e) => handleScopeKeydown(e, "enterprise")}
                >
                  {enterpriseLabel}
                </button>
                <button
                  bind:this={personalBtnEl}
                  type="button"
                  class="st-surveyQuestionCard__scopeBtn"
                  class:st-surveyQuestionCard__scopeBtn--active={activeScope === "personal"}
                  aria-pressed={activeScope === "personal" ? "true" : "false"}
                  disabled={scopeDisabled}
                  onclick={() => handleScopeSelect("personal")}
                  onkeydown={(e) => handleScopeKeydown(e, "personal")}
                >
                  {personalLabel}
                </button>
              </div>
            {/if}
            {#if headerTrailing}
              {@render headerTrailing()}
            {/if}
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
    flex-wrap: wrap;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-surveyQuestionCard__scopeToggle {
    background: var(--st-semantic-surface-subtle, #f3f4fb);
    border: 1px solid var(--st-semantic-border-subtle, #d6d9ea);
    border-radius: var(--st-component-control-radius, 0.5rem);
    display: inline-flex;
    padding: 0.125rem;
  }

  .st-surveyQuestionCard__scopeBtn {
    background: transparent;
    border: 0;
    border-radius: calc(var(--st-component-control-radius, 0.5rem) - 0.125rem);
    color: var(--st-semantic-text-secondary, #444455);
    cursor: var(--st-cursor-interactive, pointer);
    font: inherit;
    font-size: 0.875rem;
    font-weight: 600;
    min-height: 2.75rem;
    padding: 0 0.875rem;
    transition:
      background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-surveyQuestionCard__scopeBtn:hover:not(:disabled):not(.st-surveyQuestionCard__scopeBtn--active) {
    color: var(--st-semantic-text-primary, #1f2437);
  }

  .st-surveyQuestionCard__scopeBtn--active {
    background: var(--st-semantic-surface-default, #ffffff);
    box-shadow: inset 0 0 0 1.5px var(--st-semantic-border-interactive, #01055e);
    color: var(--st-semantic-text-primary, #1f2437);
  }

  .st-surveyQuestionCard__scopeBtn:focus-visible {
    outline: var(--st-component-control-anatomy-focus-outline, 2px solid var(--st-component-control-focusRing, #01055e));
    outline-offset: var(--st-component-control-anatomy-focus-offset, 1px);
  }

  .st-surveyQuestionCard__scopeBtn:disabled {
    cursor: var(--st-cursor-disabled, not-allowed);
    opacity: 0.6;
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
    color: var(--st-semantic-feedback-error, #dc2626);
    display: flex;
    font-size: 0.875rem;
    font-weight: 600;
    gap: var(--st-spacing-2, 0.5rem);
    line-height: 1.45;
    padding: var(--st-spacing-3, 0.75rem);
  }

  .st-surveyQuestionCard :global(.st-surveyQuestionCard__errorIcon) {
    flex: 0 0 auto;
    margin-top: 0.0625rem;
  }

  @container (min-width: 520px) {
    .st-surveyQuestionCard :global(.st-surveyQuestionCard__card) {
      padding: var(--st-spacing-6, 1.5rem);
    }
  }
</style>
