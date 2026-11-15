/**
 * React twin of `src/runtime.ts`. The React emission copies this file over the
 * Preact adapter, so component modules keep importing `./runtime.js` unchanged.
 */
import type { ChangeEvent, FocusEvent, KeyboardEvent, MouseEvent, ReactElement, ReactNode } from "react";

export { forwardRef, useInsertionEffect, useSyncExternalStore } from "react";
export type { ForwardedRef } from "react";

/** Anything renderable. `ComponentChildren` in Preact, `ReactNode` in React. */
export type ComponentChildren = ReactNode;

/** What a component returns. `VNode` in Preact, `ReactElement` in React. */
export type ComponentElement = ReactElement;

/** Event types handed to DOM handlers. */
export type TargetedFocusEvent<T extends EventTarget> = FocusEvent<T>;
export type TargetedKeyboardEvent<T extends EventTarget> = KeyboardEvent<T>;
export type TargetedMouseEvent<T extends EventTarget> = MouseEvent<T>;

/**
 * Per-keystroke handler of a text control, spread onto `<input>` or
 * `<textarea>`. React fires `onChange` on every input event and requires it on
 * a controlled field.
 */
export function textInput<T extends HTMLInputElement | HTMLTextAreaElement>(
  handler: (value: string) => void,
): { onChange: (event: ChangeEvent<T>) => void } {
  return { onChange: (event) => handler(event.currentTarget.value) };
}

/**
 * Focus handler of a container, spread onto the element: it runs when the
 * element or any of its descendants receives focus. React's `onFocus` already
 * bubbles (it listens to the native `focusin`).
 */
export function focusWithin<T extends EventTarget>(
  handler: (event: FocusEvent<T>) => void,
): { onFocus: (event: FocusEvent<T>) => void } {
  return { onFocus: handler };
}
