<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";

  export type SurveyNavProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    /** Whether the Previous button is rendered (default true). */
    canGoPrevious?: boolean;
    /** Disables the Next / Submit primary button. */
    nextDisabled?: boolean;
    /** On the final question, replaces Next with the explicit submit CTA. */
    isLast?: boolean;
    /** Disables submit actions while an explicit submission is in progress. */
    submitting?: boolean;
    /** Label for Previous button. */
    previousLabel?: string;
    /** Label for Next button. */
    nextLabel?: string;
    /** Label for the final explicit submit button. */
    submitLabel?: string;
    /** Optional ghost action label (e.g. "Quitter" / "Leave"). */
    leaveLabel?: string;
    /** Shows the explicit partial-submit trigger backed by a confirmation Modal. */
    allowPartialSubmit?: boolean;
    /** Disables the partial-submit trigger. */
    partialSubmitDisabled?: boolean;
    /** Answered count for default partial-submit formatting and modal context. */
    answeredCount?: number;
    /** Total questions for default partial-submit formatting and modal context. */
    totalQuestions?: number;
    /** Label for the partial-submit trigger button. */
    partialSubmitLabel?: string;
    /** Title of the partial-submit confirmation modal. */
    partialConfirmTitle?: string;
    /** Description shown inside the partial-submit confirmation modal. */
    partialConfirmDescription?: string;
    /** Confirm button label inside the partial-submit modal. */
    partialConfirmLabel?: string;
    /** Cancel button label inside the partial-submit modal. */
    partialCancelLabel?: string;
    /** Accessible close button label on the confirmation modal. */
    partialCloseLabel?: string;
    /** Accessible label for the navigation landmark. */
    ariaLabel?: string;
    /** Pins navigation to the bottom on narrow mobile viewports with safe-area padding. */
    stickyMobile?: boolean;
    onprevious?: () => void;
    onnext?: () => void;
    onsubmit?: () => void;
    onpartialsubmit?: () => void;
    onleave?: () => void;
    class?: string;
  };
</script>

<script lang="ts">
  import { tick } from "svelte";
  import Button from "./Button.svelte";
  import Modal from "./Modal.svelte";

  let {
    canGoPrevious = true,
    nextDisabled = false,
    isLast = false,
    submitting = false,
    previousLabel = "Previous",
    nextLabel = "Next",
    submitLabel = "Submit answers",
    leaveLabel,
    allowPartialSubmit = false,
    partialSubmitDisabled = false,
    answeredCount,
    totalQuestions,
    partialSubmitLabel,
    partialConfirmTitle = "Submit answered questions?",
    partialConfirmDescription,
    partialConfirmLabel = "Confirm submission",
    partialCancelLabel = "Keep answering",
    partialCloseLabel = "Close",
    ariaLabel = "Survey navigation",
    stickyMobile = false,
    onprevious,
    onnext,
    onsubmit,
    onpartialsubmit,
    onleave,
    class: className,
    ...rest
  }: SurveyNavProps = $props();

  let navEl: HTMLElement | undefined = $state();
  let confirmOpen = $state(false);

  const classes = $derived(
    [
      "st-surveyNav",
      stickyMobile ? "st-surveyNav--stickyMobile" : null,
      className
    ]
      .filter(Boolean)
      .join(" ")
  );

  const resolvedPartialLabel = $derived(
    partialSubmitLabel ??
      (answeredCount != null && totalQuestions != null
        ? `Submit these only (${answeredCount}/${totalQuestions})`
        : "Submit these only")
  );

  const resolvedConfirmDescription = $derived(
    partialConfirmDescription ??
      (answeredCount != null && totalQuestions != null
        ? `${answeredCount} of ${totalQuestions} questions answered will be submitted.`
        : "Only your answered questions will be submitted.")
  );

  const hasSecondaryBar = $derived(Boolean(leaveLabel) || allowPartialSubmit);

  function handlePrimaryClick() {
    if (submitting || nextDisabled) return;
    if (isLast) {
      onsubmit?.();
    } else {
      onnext?.();
    }
  }

  function openPartialConfirm() {
    if (submitting || partialSubmitDisabled) return;
    confirmOpen = true;
  }

  function restorePartialFocus(onlyIfLost = false) {
    tick().then(() => {
      if (onlyIfLost && document.activeElement && document.activeElement !== document.body) {
        return;
      }
      const trigger = navEl?.querySelector<HTMLButtonElement>(".st-surveyNav__btn--partial");
      if (trigger && !trigger.disabled) {
        trigger.focus();
      }
    });
  }

  function cancelPartialConfirm() {
    if (!confirmOpen) return;
    confirmOpen = false;
    restorePartialFocus(false);
  }

  function confirmPartialSubmit() {
    if (submitting) return;
    confirmOpen = false;
    onpartialsubmit?.();
    restorePartialFocus(true);
  }
</script>

<nav {...rest} bind:this={navEl} class={classes} aria-label={ariaLabel}>
  <div class="st-surveyNav__inner">
    <div class="st-surveyNav__primary">
      {#if canGoPrevious}
        <Button
          variant="secondary"
          size="lg"
          type="button"
          disabled={submitting}
          class="st-surveyNav__btn st-surveyNav__btn--prev"
          onclick={() => onprevious?.()}
        >
          {previousLabel}
        </Button>
      {/if}
      <Button
        variant="primary"
        size="lg"
        type="button"
        disabled={nextDisabled || submitting}
        class="st-surveyNav__btn st-surveyNav__btn--next"
        onclick={handlePrimaryClick}
      >
        {isLast ? submitLabel : nextLabel}
      </Button>
    </div>

    {#if hasSecondaryBar}
      <div class="st-surveyNav__secondary">
        {#if leaveLabel}
          <Button
            variant="ghost"
            size="lg"
            type="button"
            disabled={submitting}
            class="st-surveyNav__btn st-surveyNav__btn--leave"
            onclick={() => onleave?.()}
          >
            {leaveLabel}
          </Button>
        {/if}
        {#if allowPartialSubmit}
          <Button
            variant="secondary"
            size="lg"
            type="button"
            disabled={partialSubmitDisabled || submitting}
            class="st-surveyNav__btn st-surveyNav__btn--partial"
            onclick={openPartialConfirm}
          >
            {resolvedPartialLabel}
          </Button>
        {/if}
      </div>
    {/if}
  </div>
</nav>

{#if allowPartialSubmit}
  <Modal
    open={confirmOpen}
    class="st-surveyNav__modal"
    title={partialConfirmTitle}
    description={resolvedConfirmDescription}
    closeLabel={partialCloseLabel}
    onclose={cancelPartialConfirm}
  >
    {#snippet footer()}
      <div class="st-surveyNav__modalFooter">
        <Button
          variant="secondary"
          size="lg"
          type="button"
          class="st-surveyNav__modalBtn"
          onclick={cancelPartialConfirm}
        >
          {partialCancelLabel}
        </Button>
        <Button
          variant="primary"
          size="lg"
          type="button"
          disabled={submitting}
          class="st-surveyNav__modalBtn"
          onclick={confirmPartialSubmit}
        >
          {partialConfirmLabel}
        </Button>
      </div>
    {/snippet}
  </Modal>
{/if}

<style>
  .st-surveyNav {
    border-radius: 0;
    container-type: inline-size;
    width: 100%;
  }

  .st-surveyNav__inner {
    display: grid;
    gap: var(--st-spacing-3, 0.75rem);
  }

  .st-surveyNav__primary,
  .st-surveyNav__secondary {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: space-between;
  }

  .st-surveyNav__primary > :only-child {
    margin-inline-start: auto;
  }

  .st-surveyNav__secondary {
    border-radius: 0;
    border-top: 1px solid var(--st-semantic-border-subtle, #d6d9ea);
    padding-top: var(--st-spacing-3, 0.75rem);
  }

  .st-surveyNav :global(.st-surveyNav__btn),
  .st-surveyNav__modalFooter :global(.st-surveyNav__modalBtn) {
    min-height: 2.75rem;
  }

  :global(.st-surveyNav__modal .st-modal__close) {
    height: 2.75rem;
    min-height: 2.75rem;
    min-width: 2.75rem;
    width: 2.75rem;
  }

  .st-surveyNav__modalFooter {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: flex-end;
    width: 100%;
  }

  @container (max-width: 25rem) {
    .st-surveyNav__primary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(8.5rem, 1fr));
    }

    .st-surveyNav__primary > :only-child {
      margin-inline-start: 0;
    }

    .st-surveyNav__secondary {
      display: grid;
      grid-template-columns: 1fr;
    }

    .st-surveyNav :global(.st-surveyNav__btn) {
      width: 100%;
    }

    .st-surveyNav--stickyMobile {
      background: var(--st-semantic-surface-default, #ffffff);
      border-radius: 0;
      border-top: 1px solid var(--st-semantic-border-subtle, #d6d9ea);
      bottom: 0;
      padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
      padding-top: var(--st-spacing-3, 0.75rem);
      position: sticky;
      z-index: var(--st-z-header, 50);
    }
  }

  @media (max-width: 25rem) {
    .st-surveyNav--stickyMobile {
      background: var(--st-semantic-surface-default, #ffffff);
      border-radius: 0;
      border-top: 1px solid var(--st-semantic-border-subtle, #d6d9ea);
      bottom: 0;
      padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
      padding-top: var(--st-spacing-3, 0.75rem);
      position: sticky;
      z-index: var(--st-z-header, 50);
    }
  }
</style>
