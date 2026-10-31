/**
 * The §4.6 output events of every element: component callbacks never escape
 * the element (§4.1 — the envelope is data, callbacks cannot ride in it);
 * the element maps them to the standard intent event, dispatched as a
 * composed, bubbling `CustomEvent("st-intent")` on the host element so a
 * page hears it through the shadow boundary. In an MCP Apps host the same
 * detail reaches the server as a `tools/call` of `submit_intent` (§8.2) —
 * that route is the host's, not the element's.
 */

/** The §4.6 intent names the three L2 elements can emit. */
export type IntentName = "select" | "choose-option";

/** The §4.6 intent detail shape (closed). */
export interface IntentDetail {
  readonly event: "intent";
  readonly name: IntentName;
  readonly target: string;
  readonly context: Record<string, unknown>;
}

/** Dispatch one §4.6 intent from the host element. */
export function dispatchIntent(
  element: HTMLElement,
  name: IntentName,
  target: string,
  context: Record<string, unknown> = {},
): void {
  const detail: IntentDetail = { event: "intent", name, target, context };
  element.dispatchEvent(new CustomEvent<IntentDetail>("st-intent", { detail, bubbles: true, composed: true }));
}
