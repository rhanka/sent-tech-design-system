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

## Exchange Packet

Sentropic/chat-ui and the design system should exchange these artifacts before component promotion:

- `package contract`: chat-ui depends on `@sentropic/design-system-svelte`, `@sentropic/design-system-themes`, and `@sentropic/design-system-tokens` at `^0.7.0` or a pinned `0.7.x` release.
- `theme contract`: chat-ui imports `@sentropic/design-system-themes/css/entropic.css` or wraps the app in `ThemeProvider` with `entropicTheme`, and sets `data-st-theme="entropic"` at the app shell boundary.
- `component inventory`: list every chat surface as `DS primitive`, `chat-ui local component`, or `missing DS gap`.
- `runtime schema`: provide sample payloads for streaming messages, tool calls, permission requests, checkpoints, errors, and retry states.
- `a11y matrix`: keyboard path, focus return, live-region behavior, reduced-motion behavior, and labels for each interactive state.
- `release decision`: for each local chat-ui component, decide `keep app-local`, `promote to experimental DS`, or `wait for another consumer`.

## Ownership Split

- Design system owns tokens, CSS variables, primitive controls, shell modes, spacing/radius/motion defaults, and accessibility baseline behavior.
- Sentropic/chat-ui owns runtime state, streaming assembly, provider adapters, message persistence, tool execution, permission decisions, checkpoints, and product copy.
- Design system should not absorb provider-specific data models, tool names, workspace orchestration, or agent lifecycle logic.
- Chat-ui should not recreate Button/Input/Menu/Toast/Drawer/Tabs/DataTable-like primitives. Missing primitives must be reported as DS gaps with a concrete use case.

## Handoff Checklist

- Verify all hardcoded colors, radii, shadows, and focus styles are either removed or mapped to `--st-*` variables.
- Verify composer, message list, tool-call cards, permission cards, citations, attachments, and checkpoint UI each declare their DS dependency or gap.
- Provide one smoke route showing: user message, assistant streaming, tool running, permission requested, tool completed, checkpoint requested, and failed message.
- Provide host-mode expectations for `floating`, `docked`, `sidepanel`, and `embedded`; choose the default mode before API freeze.
- Confirm dark/light and white-label behavior with the Entropic theme and one override tenant.

## Recommended Decisions

- Default shell mode: `docked` for the full Sentropic web app, `sidepanel` for browser/extension surfaces, `embedded` only for product-specific inline assistants.
- Message API: exchange normalized `ChatMessage` + `ChatRuntimeEvent` objects at the DS boundary; keep provider-specific payloads behind chat-ui adapters.
- Promotion rule: promote only generic visual surfaces after two concrete consumers need them. Keep orchestration-heavy pieces local to chat-ui.

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
