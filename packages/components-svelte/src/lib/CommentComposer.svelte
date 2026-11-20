<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";
  import type { CollaborationActor } from "@sentropic/design-system-review-core";

  export type CommentComposerProps = Omit<HTMLAttributes<HTMLFormElement>, "class" | "onsubmit"> & {
    author: CollaborationActor;
    sponsor?: CollaborationActor;
    placeholder?: string;
    submitLabel?: string;
    cancelLabel?: string;
    initialBody?: string;
    autofocus?: boolean;
    /** Traps Tab/Shift+Tab within the composer (true by default for floating composers). */
    trapFocus?: boolean;
    disabled?: boolean;
    submitting?: boolean;
    /** Inline anchor-cap or validation error (rejects submission inline per SPEC-r6 §2/§3). */
    anchorError?: string | null;
    /** External submission error displayed inline in role="alert". */
    error?: string | null;
    /** Optional anchor quote preview shown above the textarea. */
    quotePreview?: string;
    /** Accessible name for the composer textarea. */
    label?: string;
    /** Clear the textarea after a successful submission (defaults to true when initialBody is empty). */
    clearOnSubmit?: boolean;
    class?: string;
    onSubmit?: (body: string) => void | Promise<void>;
    onCancel?: () => void;
    onDraftChange?: (body: string) => void;
  };
</script>

<script lang="ts">
  import { tick, untrack } from "svelte";
  import Button from "./Button.svelte";
  import CommentAuthorship from "./CommentAuthorship.svelte";
  import { formatReviewError, handleFocusTrapKeydown } from "./review-markdown.js";

  let {
    author,
    sponsor,
    placeholder = "Add a comment…",
    submitLabel = "Comment",
    cancelLabel = "Cancel",
    initialBody = "",
    autofocus = true,
    trapFocus = true,
    disabled = false,
    submitting = false,
    anchorError = null,
    error = null,
    quotePreview,
    label = "Comment body",
    clearOnSubmit,
    class: className,
    onSubmit,
    onCancel,
    onDraftChange,
    ...rest
  }: CommentComposerProps = $props();

  let formEl: HTMLFormElement | undefined = $state();
  let textareaEl: HTMLTextAreaElement | undefined = $state();
  let body = $state(untrack(() => initialBody));
  let localError = $state<string | null>(null);
  let internalSubmitting = $state(false);
  let didAutofocus = false;

  const uid = $props.id();
  const errorId = `st-review-composer-err-${uid}`;
  const isBusy = $derived(submitting || internalSubmitting);
  const displayedError = $derived(anchorError ?? localError ?? error);
  const shouldClearOnSubmit = $derived(clearOnSubmit ?? initialBody.length === 0);

  const classes = $derived(["st-review-composer", className].filter(Boolean).join(" "));

  $effect(() => {
    if (autofocus && textareaEl && !didAutofocus) {
      didAutofocus = true;
      textareaEl.focus();
    }
  });

  // Attach direct DOM listener on the form so Escape stopPropagation happens BEFORE
  // leaving the composer (Svelte 5 delegates template `onkeydown` to document).
  // Only intercept Escape when `onCancel` is bound so permanent inline reply composers
  // let Escape bubble up to close the enclosing ThreadPanel / bottom-sheet Drawer.
  $effect(() => {
    const node = formEl;
    if (!node) return;
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (onCancel) {
          event.preventDefault();
          event.stopPropagation();
          handleCancel();
        }
        return;
      }
      if (trapFocus && event.key === "Tab") {
        event.stopPropagation();
        handleFocusTrapKeydown(event, node);
      }
    };
    node.addEventListener("keydown", onKeydown);
    return () => node.removeEventListener("keydown", onKeydown);
  });

  function handleInput() {
    if (localError !== null) {
      localError = null;
    }
    onDraftChange?.(body);
  }

  async function submitBody() {
    if (disabled || isBusy) return;

    if (anchorError) {
      return;
    }

    const trimmed = body.trim();
    if (trimmed.length === 0) {
      localError = "Comment cannot be empty.";
      textareaEl?.focus();
      return;
    }

    localError = null;
    if (!onSubmit) return;

    const shouldClear = shouldClearOnSubmit;
    const doc = formEl?.ownerDocument ?? (typeof document !== "undefined" ? document : null);
    let failed = false;
    internalSubmitting = true;
    try {
      await onSubmit(trimmed);
      if (shouldClear) {
        body = "";
        onDraftChange?.("");
      }
    } catch (err) {
      failed = true;
      localError = formatReviewError(err);
    } finally {
      internalSubmitting = false;
    }

    // Wait for `disabled={disabled || isBusy}` to clear before restoring focus.
    // Keep focus in the textarea on error, or on success when the composer remains mounted
    // and focus was dropped to document.body (or stayed inside the form).
    await tick();
    if (textareaEl?.isConnected && !disabled) {
      const active = doc?.activeElement ?? null;
      const focusDroppedOrInside =
        active === null || active === doc?.body || (formEl !== undefined && formEl.contains(active));
      if (failed || focusDroppedOrInside) {
        textareaEl.focus();
      }
    }
  }

  function handleFormSubmit(event: SubmitEvent) {
    event.preventDefault();
    void submitBody();
  }

  function handleCancel() {
    if (isBusy) return;
    onCancel?.();
  }

  function handleTextareaKeydown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && !event.isComposing) {
      event.preventDefault();
      event.stopPropagation();
      void submitBody();
    }
  }
</script>

<form
  {...rest}
  bind:this={formEl}
  class={classes}
  novalidate
  onsubmit={handleFormSubmit}
>
  <div class="st-review-composer__header">
    <CommentAuthorship {author} {sponsor} size="sm" />
  </div>

  {#if quotePreview}
    <p class="st-review-composer__quote">{quotePreview}</p>
  {/if}

  <div class="st-review-composer__field">
    <textarea
      bind:this={textareaEl}
      class="st-review-composer__textarea"
      bind:value={body}
      {placeholder}
      rows="3"
      disabled={disabled || isBusy}
      aria-label={label}
      aria-invalid={displayedError ? "true" : undefined}
      aria-describedby={displayedError ? errorId : undefined}
      oninput={handleInput}
      onkeydown={handleTextareaKeydown}
    ></textarea>
  </div>

  {#if displayedError}
    <div id={errorId} class="st-review-composer__error" role="alert">
      {displayedError}
    </div>
  {/if}

  <div class="st-review-composer__footer">
    <span class="st-review-composer__hint">
      {onCancel ? "Cmd/Ctrl+Enter to submit · Esc to cancel" : "Cmd/Ctrl+Enter to submit"}
    </span>
    <div class="st-review-composer__actions">
      {#if onCancel}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isBusy}
          onclick={handleCancel}
        >
          {cancelLabel}
        </Button>
      {/if}
      <Button
        type="submit"
        variant="primary"
        size="sm"
        disabled={disabled || isBusy}
      >
        {submitLabel}
      </Button>
    </div>
  </div>
</form>

<style>
  .st-review-composer {
    background: var(
      --st-component-review-composer-background,
      var(--st-semantic-surface-raised, #ffffff)
    );
    border: 1px solid
      var(--st-component-review-composer-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-review-composer-radius, var(--st-radius-md, 0.5rem));
    color: var(--st-semantic-text-primary);
    display: grid;
    gap: var(--st-spacing-2, 0.5rem);
    padding: var(--st-spacing-3, 0.75rem);
  }

  .st-review-composer__header {
    align-items: center;
    display: flex;
    justify-content: space-between;
  }

  .st-review-composer__quote {
    background: var(--st-semantic-surface-subtle, #f8fafc);
    border-radius: var(--st-radius-sm, 0.375rem);
    box-shadow: inset 3px 0 0 var(--st-semantic-border-interactive, #2563eb);
    color: var(--st-semantic-text-secondary);
    font-size: 0.8125rem;
    line-height: 1.4;
    margin: 0;
    padding: var(--st-spacing-1, 0.25rem) var(--st-spacing-2, 0.5rem);
  }

  .st-review-composer__field {
    display: grid;
  }

  .st-review-composer__textarea {
    background: var(--st-component-control-background, var(--st-semantic-surface-default));
    border: 1px solid var(--st-component-control-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-control-radius, 0.375rem);
    box-sizing: border-box;
    color: var(--st-component-control-text, var(--st-semantic-text-primary));
    font: inherit;
    font-size: 0.875rem;
    line-height: 1.5;
    min-height: 4.5rem;
    padding: var(--st-spacing-2, 0.5rem);
    resize: vertical;
    width: 100%;
  }

  .st-review-composer__textarea:focus-visible {
    outline: 2px solid
      var(--st-component-review-focusRing, var(--st-semantic-border-interactive, #2563eb));
    outline-offset: 1px;
  }

  .st-review-composer__textarea[aria-invalid="true"] {
    border-color: var(--st-semantic-feedback-danger, #b91c1c);
  }

  .st-review-composer__error {
    color: var(--st-semantic-feedback-danger, #b91c1c);
    font-size: 0.8125rem;
    font-weight: 500;
    line-height: 1.4;
  }

  .st-review-composer__footer {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: space-between;
  }

  .st-review-composer__hint {
    color: var(--st-semantic-text-secondary);
    font-size: 0.75rem;
  }

  .st-review-composer__actions {
    align-items: center;
    display: inline-flex;
    gap: var(--st-spacing-2, 0.5rem);
    margin-left: auto;
  }
</style>
