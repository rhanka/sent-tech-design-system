<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLFormAttributes } from "svelte/elements";

  type FormStatus = "idle" | "submitting" | "submitted" | "error";

  type FormProps = Omit<HTMLFormAttributes, "class" | "onsubmit"> & {
    onsubmit?: (event: SubmitEvent) => void | Promise<void>;
    helperText?: string;
    errorText?: string;
    successText?: string;
    submitting?: boolean;
    noNoscript?: boolean;
    class?: string;
    children: Snippet;
  };

  let {
    onsubmit,
    helperText,
    errorText,
    successText,
    submitting = $bindable(false),
    noNoscript = false,
    class: className,
    children,
    ...rest
  }: FormProps = $props();

  let status = $state<FormStatus>("idle");
  let internalError = $state<string | undefined>(undefined);

  const classes = () => ["st-form", className].filter(Boolean).join(" ");

  async function handleSubmit(event: SubmitEvent) {
    if (!onsubmit) return;
    event.preventDefault();
    internalError = undefined;
    status = "submitting";
    submitting = true;
    try {
      await onsubmit(event);
      status = "submitted";
    } catch (err) {
      status = "error";
      internalError = err instanceof Error ? err.message : String(err);
    } finally {
      submitting = false;
    }
  }

  const resolvedErrorText = () => errorText ?? internalError;
  const showError = () => status === "error" && Boolean(resolvedErrorText());
  const showSuccess = () => status === "submitted" && Boolean(successText);
  const showHelper = () =>
    Boolean(helperText) && !showError() && !showSuccess();
</script>

<form
  {...rest}
  class={classes()}
  onsubmit={handleSubmit}
  aria-busy={status === "submitting" ? "true" : undefined}
>
  <div class="st-form__body">
    {@render children()}
  </div>
  {#if showError()}
    <p class="st-form__message st-form__message--error" role="alert">
      {resolvedErrorText()}
    </p>
  {:else if showSuccess()}
    <p class="st-form__message st-form__message--success" role="status">
      {successText}
    </p>
  {:else if showHelper()}
    <p class="st-form__message st-form__message--help">{helperText}</p>
  {/if}
  {#if !noNoscript}
    <noscript>
      <p class="st-form__message st-form__message--error">
        JavaScript is required to submit this form.
      </p>
    </noscript>
  {/if}
</form>

<style>
  .st-form {
    display: grid;
    gap: var(--st-component-form-gap, 1rem);
    width: 100%;
  }

  .st-form__body {
    display: grid;
    gap: var(--st-component-form-fieldGap, 1rem);
  }

  .st-form__message {
    font-size: 0.8125rem;
    line-height: 1.4;
    margin: 0;
  }

  .st-form__message--help {
    color: var(--st-component-form-helpText, var(--st-semantic-text-secondary));
  }

  .st-form__message--error {
    color: var(--st-component-form-errorText, var(--st-semantic-feedback-error));
  }

  .st-form__message--success {
    color: var(--st-component-form-successText, var(--st-semantic-feedback-success));
  }
</style>
