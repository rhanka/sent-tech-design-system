# Chat UI Incubation Contract

Status: experimental component boundary, stable token and runtime contracts.

The Entropic Chat UI is in active refactoring. The design system provides stable tokens and integration contracts now, but does not freeze Svelte chat component APIs until the Entropic refactor has landed.

## Scope

This contract is the review surface between Entropic and the design system:

- stable chat token names and semantic status tokens
- host/runtime event names for streaming, tools, permissions, and checkpoints
- allowed shell modes for web apps, browser panels, and embedded surfaces
- accessibility and white-label constraints for future chat components

It is not a final component catalog. Components can move from `experimental` to `beta` only after Entropic exposes a settled API for message rendering, composer state, queue status, tool permissions, host adapters, and extension or webview modes.

## Modes

- `floating`: detached panel with launcher button.
- `docked`: side panel that resizes the application content.
- `sidepanel`: browser extension or host-owned panel.
- `embedded`: inline chat surface inside a product view.

## Required Token Groups

- `component.chat.userBubbleBackground`
- `component.chat.userBubbleText`
- `component.chat.assistantBubbleBackground`
- `component.chat.assistantBubbleText`
- `component.chat.composerSurface`
- `component.chat.toolCallSurface`
- `semantic.status.pending`
- `semantic.status.processing`
- `semantic.status.completed`
- `semantic.status.failed`

## Event Contract

```ts
export type ChatRuntimeEvent =
  | { type: "message.delta"; messageId: string; delta: string }
  | { type: "message.completed"; messageId: string }
  | { type: "tool.started"; toolCallId: string; toolName: string }
  | { type: "tool.completed"; toolCallId: string; status: "success" | "error" }
  | { type: "permission.requested"; toolCallId: string; choices: string[] }
  | { type: "checkpoint.requested"; checkpointId: string; label: string };
```

## Data Contract

```ts
export type ChatMessageRole = "user" | "assistant" | "system" | "tool";

export type ChatMessageStatus = "pending" | "processing" | "completed" | "failed";

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  status: ChatMessageStatus;
  createdAt: string;
  blocks: ChatMessageBlock[];
}

export type ChatMessageBlock =
  | { type: "text"; text: string }
  | { type: "tool-call"; toolCallId: string; toolName: string; status: ChatMessageStatus }
  | { type: "permission"; toolCallId: string; choices: string[] };
```

## Accessibility Contract

- Streaming regions must expose polite live updates.
- Tool permission controls must be keyboard reachable and labelled by action.
- Composer submit must remain available through keyboard-only interaction.
- Reduced-motion preferences must disable non-essential streaming and loading animation.

## White-Label Contract

Chat UI surfaces must consume only semantic and component variables. Tenant and external design-system adapters, including Airbus-like compatibility adapters, should override tokens before component APIs are forked.
