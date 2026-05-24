<script lang="ts">
  import { Send, Square } from "@lucide/svelte";
  import type { HTMLFormAttributes } from "svelte/elements";
  import Button from "./Button.svelte";

  type ChatComposerSubmitEvent = (payload: {
    message: string;
    source: "submit" | "keyboard";
    event?: SubmitEvent | KeyboardEvent;
  }) => void | Promise<void>;

  type ChatComposerProps = Omit<HTMLFormAttributes, "class" | "onsubmit"> & {
    value?: string;
    placeholder?: string;
    autosize?: boolean;
    maxRows?: number;
    submitDisabled?: boolean;
    class?: string;
    sendLabel?: string;
    stopLabel?: string;
    sendAriaLabel?: string;
    stopAriaLabel?: string;
    inputAriaLabel?: string;
    disabled?: boolean;
    busy?: boolean;
    stoppable?: boolean;
    clearOnSubmit?: boolean;
    onsubmit?: ChatComposerSubmitEvent;
    onstop?: () => void;
  };

  let {
    value = $bindable(""),
    placeholder = "Écrire un message...",
    autosize = true,
    maxRows = 8,
    submitDisabled = false,
    class: className,
    sendLabel = "Envoyer",
    stopLabel = "Arrêter",
    sendAriaLabel = "Envoyer le message",
    stopAriaLabel = "Arrêter l’envoi",
    inputAriaLabel = "Composer de message",
    disabled = false,
    busy = false,
    stoppable = false,
    clearOnSubmit = true,
    onsubmit,
    onstop,
    ...rest
  }: ChatComposerProps = $props();

  let textarea: HTMLTextAreaElement | undefined = $state();
  let isSubmitting = $state(false);

  const classes = () => ["st-chatComposer", className].filter(Boolean).join(" ");

  const hasActivity = () => busy || isSubmitting;

  const isSendable = () =>
    !disabled &&
    !hasActivity() &&
    !submitDisabled &&
    value.trim().length > 0;

  $effect(() => {
    if (autosize) resizeTextarea();
  });

  function resizeTextarea() {
    const node = textarea;
    if (!node || !autosize) return;
    node.style.height = "auto";
    const style = getComputedStyle(node);
    const lineHeight = parseFloat(style.lineHeight || "20");
    const maxHeight = Math.max(lineHeight * (maxRows || 1), lineHeight * 2);
    const nextHeight = Math.min(node.scrollHeight, maxHeight);
    node.style.height = `${Math.max(lineHeight * 1.5, nextHeight)}px`;
    node.style.overflowY = node.scrollHeight > maxHeight ? "auto" : "hidden";
  }

  async function submitComposer(event?: SubmitEvent | KeyboardEvent, source: "submit" | "keyboard" = "submit") {
    const trimmed = value.trim();
    if (!isSendable() || !onsubmit || !trimmed) return;

    event?.preventDefault();
    isSubmitting = true;
    try {
      await onsubmit({ event, message: trimmed, source });
      if (clearOnSubmit) value = "";
    } finally {
      isSubmitting = false;
      resizeTextarea();
    }
  }

  async function handleSubmit(event: SubmitEvent) {
    await submitComposer(event, "submit");
  }

  async function handleTextareaKeydown(event: KeyboardEvent) {
    if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
    await submitComposer(event, "keyboard");
  }

  function handleStop() {
    onstop?.();
  }
</script>

<form
  {...rest}
  class={classes()}
  onsubmit={handleSubmit}
  novalidate
>
  <div class="st-chatComposer__body">
    <div class="st-chatComposer__inputShell">
      <textarea
        bind:this={textarea}
        class="st-chatComposer__textarea"
        bind:value
        placeholder={placeholder}
        rows="2"
        aria-label={inputAriaLabel}
        aria-disabled={disabled ? "true" : undefined}
        disabled={disabled}
        oninput={resizeTextarea}
        onkeydown={handleTextareaKeydown}
      ></textarea>
    </div>
    <slot name="attachments"></slot>
  </div>

  <div class="st-chatComposer__toolbar">
    <div class="st-chatComposer__actions st-chatComposer__actions--left">
      <slot name="actions-left"></slot>
    </div>
    <div class="st-chatComposer__actions st-chatComposer__actions--right">
      <slot name="actions-right"></slot>
      {#if hasActivity() && stoppable && onstop}
        <Button type="button" variant="danger" onclick={handleStop} aria-label={stopAriaLabel}>
          <Square size={16} strokeWidth={2} aria-hidden="true" />
          <span>{stopLabel}</span>
        </Button>
      {/if}
      <Button
        type="submit"
        aria-label={sendAriaLabel}
        disabled={!isSendable()}
      >
        <Send size={16} strokeWidth={2} aria-hidden="true" />
        {sendLabel}
      </Button>
    </div>
  </div>
</form>

<style>
  .st-chatComposer {
    background: var(--st-component-chat-composerSurface, var(--st-semantic-surface-raised, #ffffff));
    border: 1px solid var(--st-component-control-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-control-radius, 0.375rem);
    display: grid;
    gap: var(--st-spacing-3, 0.75rem);
    padding: var(--st-spacing-3, 0.75rem);
    width: 100%;
  }

  .st-chatComposer__body {
    display: grid;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-chatComposer__inputShell {
    display: grid;
    gap: 0.25rem;
  }

  .st-chatComposer__textarea {
    background: var(--st-component-control-background, var(--st-semantic-surface-default));
    border: 1px solid var(--st-component-control-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-control-radius, 0.375rem);
    color: var(--st-component-control-text, var(--st-semantic-text-primary));
    font: inherit;
    min-height: 2.5rem;
    max-height: 16rem;
    overflow-y: hidden;
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
    resize: none;
    width: 100%;
  }

  .st-chatComposer__textarea:focus-visible {
    border-color: var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    box-shadow: 0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline: none;
  }

  .st-chatComposer__textarea[aria-disabled="true"] {
    background: var(--st-component-control-disabledBackground, var(--st-semantic-surface-subtle));
    color: var(--st-component-control-disabledText, var(--st-semantic-text-muted));
    cursor: not-allowed;
  }

  .st-chatComposer__toolbar {
    align-items: center;
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: space-between;
  }

  .st-chatComposer__actions {
    align-items: center;
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-chatComposer__actions--right {
    margin-left: auto;
  }

  @media (max-width: 640px) {
    .st-chatComposer__toolbar {
      align-items: stretch;
      flex-wrap: wrap;
      justify-content: flex-start;
    }

    .st-chatComposer__actions {
      width: 100%;
    }

    .st-chatComposer__actions--right {
      margin-left: 0;
    }
  }
</style>
