<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import ChatMessage, {
    type ChatMessageRole,
    type ChatMessageStatus
  } from "./ChatMessage.svelte";

  export type StreamingMessageEvent =
    | { type: "message.delta"; messageId?: string; delta: string }
    | { type: "message.completed"; messageId?: string }
    | { type: "reasoning.delta"; messageId?: string; delta: string }
    | { type: "reasoning.completed"; messageId?: string }
    | { type: "tool.started"; toolCallId: string; toolName: string; messageId?: string }
    | {
        type: "tool.completed";
        toolCallId: string;
        status: "success" | "error";
        toolName?: string;
        messageId?: string;
      }
    | {
        type: "permission.requested";
        toolCallId: string;
        choices: string[];
        messageId?: string;
      }
    | {
        type: "checkpoint.requested";
        checkpointId: string;
        label: string;
        messageId?: string;
      };

  export type StreamingMessageMode = "live" | "passive";

  type ToolCallState = {
    toolCallId: string;
    toolName: string;
    status: "pending" | "processing" | "success" | "error";
  };

  type StreamingMessageProps = Omit<
    HTMLAttributes<HTMLElement>,
    "class" | "children" | "role"
  > & {
    role?: ChatMessageRole;
    status?: ChatMessageStatus;
    streamId?: string;
    initialEvents?: StreamingMessageEvent[];
    events?: StreamingMessageEvent[];
    finalContent?: string;
    mode?: StreamingMessageMode;
    placeholder?: string;
    showTrail?: boolean;
    class?: string;
    footer?: Snippet;
    actions?: Snippet;
  };

  let {
    role = "assistant",
    status = "processing",
    streamId,
    initialEvents = [],
    events = [],
    finalContent,
    mode = "live",
    placeholder = "Streaming en cours…",
    showTrail = true,
    class: className,
    footer,
    actions,
    ...rest
  }: StreamingMessageProps = $props();

  const classes = () => ["st-streamingMessage", className].filter(Boolean).join(" ");

  const mergedEvents = () => [...initialEvents, ...events];

  const resolvedContent = () => {
    if (finalContent) return finalContent;
    return mergedEvents()
      .filter((event) => event.type === "message.delta")
      .map((event) => event.delta)
      .join("");
  };

  const resolvedReasoning = () =>
    mergedEvents()
      .filter((event) => event.type === "reasoning.delta")
      .map((event) => event.delta)
      .join("");

  const reasoningCompleted = () =>
    mergedEvents().some((event) => event.type === "reasoning.completed");

  const hasAnyEvent = () => mergedEvents().length > 0;

  const toolCalls = (): ToolCallState[] => {
    const byId = new Map<string, ToolCallState>();

    for (const event of mergedEvents()) {
      if (event.type === "tool.started") {
        byId.set(event.toolCallId, {
          toolCallId: event.toolCallId,
          toolName: event.toolName,
          status: "processing"
        });
      }

      if (event.type === "tool.completed") {
        const current =
          byId.get(event.toolCallId) ??
          ({
            toolCallId: event.toolCallId,
            toolName: event.toolName ?? "tool",
            status: "pending"
          } as ToolCallState);

        byId.set(event.toolCallId, {
          ...current,
          status: event.status === "error" ? "error" : "success"
        });
      }
    }

    return [...byId.values()];
  };

  const permissionRequests = () =>
    mergedEvents().filter((event) => event.type === "permission.requested");

  const checkpoints = () =>
    mergedEvents().filter((event) => event.type === "checkpoint.requested");

  const eventLabel = (event: StreamingMessageEvent) => {
    switch (event.type) {
      case "message.delta":
        return "message.delta";
      case "message.completed":
        return "message.completed";
      case "reasoning.delta":
        return "reasoning.delta";
      case "reasoning.completed":
        return "reasoning.completed";
      case "tool.started":
        return `${event.toolName} démarré (${event.toolCallId})`;
      case "tool.completed":
        return `${event.toolName ?? "tool"} terminé (${event.status})`;
      case "permission.requested":
        return `permission demandée (${event.toolCallId})`;
      case "checkpoint.requested":
        return `checkpoint demandé (${event.label})`;
      default:
        return "event";
    }
  };

  const streamIdLabel = () =>
    streamId ? `Flux : ${streamId}` : "Flux de streaming";
</script>

<ChatMessage
  {...rest}
  role={role}
  {status}
  class={classes()}
  data-stream-id={streamId}
  footer={footer}
  actions={actions}
>
  {#if resolvedReasoning()}
    <details class="st-streamingMessage__reasoning" open={!reasoningCompleted()}>
      <summary class="st-streamingMessage__reasoningToggle">
        Raisonnement{reasoningCompleted() ? "" : "…"}
      </summary>
      <p class="st-streamingMessage__reasoningText">{resolvedReasoning()}</p>
    </details>
  {/if}

  {#if resolvedContent()}
    <p class="st-streamingMessage__text">{resolvedContent()}</p>
  {:else}
    <p class="st-streamingMessage__text st-streamingMessage__text--muted">
      {placeholder}
    </p>
  {/if}

  <p class="st-streamingMessage__meta">({streamIdLabel()})</p>

  {#if (toolCalls().length > 0 || permissionRequests().length > 0 || checkpoints().length > 0) && mode === "live"}
    <details class="st-streamingMessage__trail">
      <summary class="st-streamingMessage__trailToggle">Détails du stream</summary>
      <ul class="st-streamingMessage__trailList">
        {#if toolCalls().length > 0}
          <li class="st-streamingMessage__trailSection">
            <strong>Outils</strong>
            <ul class="st-streamingMessage__subList">
              {#each toolCalls() as toolCall}
                <li>
                  <span>{toolCall.toolName}</span>
                  <span> — {toolCall.status}</span>
                </li>
              {/each}
            </ul>
          </li>
        {/if}

        {#if permissionRequests().length > 0}
          <li class="st-streamingMessage__trailSection">
            <strong>Permissions</strong>
            <ul class="st-streamingMessage__subList">
              {#each permissionRequests() as permissionEvent}
                <li>{permissionEvent.toolCallId}: {permissionEvent.choices.join(", ")}</li>
              {/each}
            </ul>
          </li>
        {/if}

        {#if checkpoints().length > 0}
          <li class="st-streamingMessage__trailSection">
            <strong>Checkpoints</strong>
            <ul class="st-streamingMessage__subList">
              {#each checkpoints() as checkpointEvent}
                <li>{checkpointEvent.label} ({checkpointEvent.checkpointId})</li>
              {/each}
            </ul>
          </li>
        {/if}

        {#if hasAnyEvent() && showTrail}
          <li class="st-streamingMessage__trailSection">
            <strong>Derniers events</strong>
            <ul class="st-streamingMessage__subList">
              {#each mergedEvents().slice(-6) as event}
                <li>{eventLabel(event)}</li>
              {/each}
            </ul>
          </li>
        {/if}
      </ul>
    </details>
  {/if}
</ChatMessage>

<style>
  :global(.st-streamingMessage) {
    position: relative;
  }

  .st-streamingMessage__text {
    font-family: var(--st-component-chatMessage-font, var(--st-typography-fontFamilyBody, inherit));
    margin: 0;
    white-space: pre-wrap;
  }

  .st-streamingMessage__text--muted {
    color: var(--st-semantic-text-muted);
    font-style: italic;
  }

  .st-streamingMessage__reasoning {
    background: var(--st-component-chatMessage-reasoningBackground, var(--st-semantic-surface-subtle));
    border-left: 2px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-component-control-radius, 0.375rem);
    margin: 0 0 0.5rem;
    padding: 0.4rem 0.6rem;
  }

  .st-streamingMessage__reasoningToggle {
    color: var(--st-semantic-text-muted);
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .st-streamingMessage__reasoningText {
    color: var(--st-semantic-text-secondary);
    font-size: 0.8125rem;
    font-style: italic;
    margin: 0.35rem 0 0;
    white-space: pre-wrap;
  }

  .st-streamingMessage__meta {
    color: var(--st-semantic-text-muted);
    font-size: 0.75rem;
    margin: 0.35rem 0 0;
  }

  .st-streamingMessage__trail {
    margin-top: 0.5rem;
  }

  .st-streamingMessage__trailToggle {
    color: var(--st-component-chatMessage-actionText, var(--st-semantic-text-secondary));
    cursor: pointer;
    font-size: 0.75rem;
  }

  .st-streamingMessage__trailList,
  .st-streamingMessage__subList {
    margin: 0.4rem 0 0 1rem;
    padding: 0;
  }

  .st-streamingMessage__trailSection {
    margin-bottom: 0.45rem;
  }

  .st-streamingMessage__trailSection strong {
    color: var(--st-semantic-text-secondary);
    font-size: 0.75rem;
    font-weight: 600;
  }

  .st-streamingMessage__trailSection :global(li) {
    color: var(--st-semantic-text-primary);
    font-size: 0.75rem;
    line-height: 1.4;
    list-style: none;
  }

  .st-streamingMessage__trailSection :global(li + li) {
    margin-top: 0.2rem;
  }

  .st-streamingMessage__trailSection :global(li::before) {
    content: "• ";
    color: var(--st-semantic-text-muted);
  }

  @media (max-width: 640px) {
    .st-streamingMessage__trail {
      margin-top: 0.35rem;
    }
  }
</style>
