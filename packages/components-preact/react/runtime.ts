/**
 * React twin of `src/runtime.ts`. The React emission copies this file over the
 * Preact adapter, so component modules keep importing `./runtime.js` unchanged.
 */
import type { ChangeEvent, FocusEvent, InputEvent, KeyboardEvent, MouseEvent, PointerEvent, ReactElement, ReactNode } from "react";

export { forwardRef, useInsertionEffect, useSyncExternalStore } from "react";
export type { ForwardedRef } from "react";

/** Anything renderable. `ComponentChildren` in Preact, `ReactNode` in React. */
export type ComponentChildren = ReactNode;

/** What a component returns. `VNode` in Preact, `ReactElement` in React. */
export type ComponentElement = ReactElement;

/** Event types handed to DOM handlers. */
export type TargetedEvent<T extends EventTarget> = ChangeEvent<T & Element>;
export type TargetedFocusEvent<T extends EventTarget> = FocusEvent<T>;
export type TargetedInputEvent<T extends EventTarget> = InputEvent<T>;
export type TargetedKeyboardEvent<T extends EventTarget> = KeyboardEvent<T>;
export type TargetedMouseEvent<T extends EventTarget> = MouseEvent<T>;
export type TargetedPointerEvent<T extends EventTarget> = PointerEvent<T>;

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
 * Controlled change handler of a pass-through text control (twin of the
 * Preact `textChange`, which spreads the handler as `onInput`). React's
 * `onChange` already fires per keystroke, so the consumer handler is spread
 * as `onChange` and the consumer `onInput`, when present, is preserved
 * untouched, exactly as in `components-react` (both handlers via the rest
 * spread).
 */
export function textChange<T extends HTMLInputElement | HTMLTextAreaElement>(
  handler: (event: ChangeEvent<T>) => void,
  onInput?: (event: InputEvent<T>) => void,
): { onChange: (event: ChangeEvent<T>) => void; onInput?: (event: InputEvent<T>) => void } {
  return onInput ? { onChange: handler, onInput } : { onChange: handler };
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

/**
 * Focus-leave handler of a container, spread onto the element: it runs when
 * focus leaves the element or any of its descendants, wherever focus goes.
 * React's `onBlur` already bubbles (it listens to the native `focusout`).
 */
export function focusOut<T extends EventTarget>(
  handler: (event: FocusEvent<T>) => void,
): { onBlur: (event: FocusEvent<T>) => void } {
  return { onBlur: handler };
}
