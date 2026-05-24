<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  export type ChatMessageRole = "user" | "assistant" | "system" | "tool";
  export type ChatMessageStatus = "pending" | "processing" | "completed" | "failed";
  type ChatMessageLegacyStatus = "idle" | "streaming" | "error";

  type ChatMessageProps = Omit<HTMLAttributes<HTMLElement>, "class" | "role"> & {
    role: ChatMessageRole;
    status?: ChatMessageStatus | ChatMessageLegacyStatus;
    timestamp?: string;
    class?: string;
    avatar?: Snippet;
    children: Snippet;
    footer?: Snippet;
    actions?: Snippet;
  };

  let {
    role,
    status = "completed",
    timestamp,
    class: className,
    avatar,
    children,
    footer,
    actions,
    ...rest
  }: ChatMessageProps = $props();

  const normalizedStatus = () => {
    if (status === "idle" || status === "streaming") return "processing";
    if (status === "error") return "failed";
    return status;
  };

  const isStreaming = () => normalizedStatus() === "processing";

  const classes = () =>
    [
      "st-chatMessage",
      `st-chatMessage--${role}`,
      `st-chatMessage--${normalizedStatus()}`,
      className
    ]
      .filter(Boolean)
      .join(" ");

  const alignment = $derived(role === "user" ? "end" : "start");
</script>

<article
  {...rest}
  class={classes()}
  data-role={role}
  data-status={normalizedStatus()}
  data-align={alignment}
  aria-live={isStreaming() ? "polite" : undefined}
>
  {#if avatar}
    <div class="st-chatMessage__avatar" aria-hidden="true">
      {@render avatar()}
    </div>
  {/if}
  <div class="st-chatMessage__body">
    <div class="st-chatMessage__bubble">
      <div class="st-chatMessage__content">
        {@render children()}
      </div>
      {#if isStreaming()}
        <span class="st-chatMessage__pulse" aria-hidden="true"></span>
      {/if}
    </div>
    {#if footer || timestamp}
      <div class="st-chatMessage__footer">
        {#if footer}{@render footer()}{:else if timestamp}<span class="st-chatMessage__timestamp">{timestamp}</span>{/if}
      </div>
    {/if}
    {#if actions}
      <div class="st-chatMessage__actions">
        {@render actions()}
      </div>
    {/if}
  </div>
</article>

<style>
  .st-chatMessage {
    align-items: flex-start;
    color: var(--st-semantic-text-primary);
    display: flex;
    gap: var(--st-component-chatMessage-gap, 0.5rem);
    width: 100%;
  }

  .st-chatMessage[data-align="end"] {
    flex-direction: row-reverse;
  }

  .st-chatMessage__avatar {
    align-items: center;
    background: var(--st-component-chatMessage-avatarBackground, var(--st-semantic-surface-subtle));
    border-radius: 999px;
    color: var(--st-semantic-text-secondary);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.75rem;
    height: var(--st-component-chatMessage-avatarSize, 1.75rem);
    justify-content: center;
    overflow: hidden;
    width: var(--st-component-chatMessage-avatarSize, 1.75rem);
  }

  .st-chatMessage__body {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
    max-width: var(--st-component-chatMessage-maxWidth, min(42rem, 100%));
  }

  .st-chatMessage[data-align="end"] .st-chatMessage__body {
    align-items: flex-end;
  }

  .st-chatMessage__bubble {
    border: 1px solid transparent;
    border-radius: var(--st-component-chatMessage-radius, 0.75rem);
    line-height: 1.5;
    padding: var(--st-component-chatMessage-padding, 0.625rem 0.875rem);
    position: relative;
    word-break: break-word;
  }

  .st-chatMessage__content :global(p) {
    margin: 0;
  }
  .st-chatMessage__content :global(p + p),
  .st-chatMessage__content :global(* + p),
  .st-chatMessage__content :global(* + ul),
  .st-chatMessage__content :global(* + ol),
  .st-chatMessage__content :global(* + pre) {
    margin-top: 0.5rem;
  }

  .st-chatMessage--user .st-chatMessage__bubble {
    background: var(
      --st-component-chatMessage-userBackground,
      var(--st-component-chat-userBubbleBackground, var(--st-semantic-action-primary, #2563eb))
    );
    color: var(
      --st-component-chatMessage-userText,
      var(--st-component-chat-userBubbleText, #ffffff)
    );
  }

  .st-chatMessage--assistant .st-chatMessage__bubble {
    background: var(
      --st-component-chatMessage-assistantBackground,
      var(--st-component-chat-assistantBubbleBackground, var(--st-semantic-surface-subtle, #f8fafc))
    );
    color: var(
      --st-component-chatMessage-assistantText,
      var(--st-component-chat-assistantBubbleText, var(--st-semantic-text-primary))
    );
  }

  .st-chatMessage--system .st-chatMessage__bubble {
    background: var(
      --st-component-chatMessage-systemBackground,
      var(--st-semantic-surface-default, #ffffff)
    );
    border-color: var(
      --st-component-chatMessage-systemBorder,
      var(--st-semantic-border-subtle)
    );
    color: var(
      --st-component-chatMessage-systemText,
      var(--st-semantic-text-secondary)
    );
    font-size: 0.875rem;
  }

  .st-chatMessage--tool .st-chatMessage__bubble {
    background: var(
      --st-component-chatMessage-toolBackground,
      var(--st-component-chatMessage-assistantBackground, var(--st-component-chat-assistantBubbleBackground, var(--st-semantic-surface-subtle, #f8fafc)))
    );
    color: var(
      --st-component-chatMessage-toolText,
      var(--st-component-chatMessage-assistantText, var(--st-component-chat-assistantBubbleText, var(--st-semantic-text-primary)))
    );
    border-color: var(
      --st-component-chatMessage-toolBorder,
      var(--st-semantic-border-subtle)
    );
    font-style: italic;
  }

  .st-chatMessage--pending .st-chatMessage__bubble {
    border-color: var(
      --st-component-chatMessage-pendingBorder,
      var(--st-semantic-status-pending, #d97706)
    );
  }

  .st-chatMessage--processing .st-chatMessage__bubble {
    border-color: var(
      --st-component-chatMessage-processingBorder,
      var(--st-semantic-status-processing, #2563eb)
    );
  }

  .st-chatMessage--failed .st-chatMessage__bubble {
    border-color: var(
      --st-component-chatMessage-errorBorder,
      var(--st-semantic-feedback-danger, #b91c1c)
    );
  }

  .st-chatMessage__pulse {
    background: currentColor;
    border-radius: 999px;
    display: inline-block;
    height: 0.5rem;
    margin-left: 0.5rem;
    opacity: 0.65;
    vertical-align: middle;
    width: 0.5rem;
    animation: st-chatMessage-pulse 1.1s ease-in-out infinite;
  }

  @keyframes st-chatMessage-pulse {
    0%,
    100% {
      opacity: 0.25;
      transform: scale(0.85);
    }
    50% {
      opacity: 0.9;
      transform: scale(1.05);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .st-chatMessage__pulse {
      animation: none;
      opacity: 0.6;
    }
  }

  .st-chatMessage__footer {
    color: var(--st-semantic-text-secondary);
    font-size: 0.75rem;
    line-height: 1.3;
  }

  .st-chatMessage__timestamp {
    font-variant-numeric: tabular-nums;
  }

  .st-chatMessage__actions {
    display: flex;
    gap: 0.25rem;
  }

  .st-chatMessage[data-align="end"] .st-chatMessage__actions {
    justify-content: flex-end;
  }
</style>
