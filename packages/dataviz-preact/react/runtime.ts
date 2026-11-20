/**
 * React twin of `src/runtime.ts`. The React emission copies this file over the
 * Preact adapter, so component modules keep importing `./runtime.js` unchanged.
 */
import type { ChangeEvent, ElementType, FocusEvent, InputEvent, KeyboardEvent, MouseEvent, PointerEvent, ReactElement, ReactNode, WheelEvent } from "react";

export { forwardRef, useInsertionEffect, useSyncExternalStore } from "react";
export type { ForwardedRef } from "react";

/** Anything renderable. `ComponentChildren` in Preact, `ReactNode` in React. */
export type ComponentChildren = ReactNode;

/** What a component returns. `VNode` in Preact, `ReactElement` in React. */
export type ComponentElement = ReactElement;

/** Element type accepted by polymorphic `as`. `JSX.ElementType` in Preact, `React.ElementType` in React. */
export type { ElementType };

/** Event types handed to DOM handlers. */
export type TargetedEvent<T extends EventTarget> = ChangeEvent<T & Element>;
export type TargetedFocusEvent<T extends EventTarget> = FocusEvent<T>;
export type TargetedInputEvent<T extends EventTarget> = InputEvent<T>;
export type TargetedKeyboardEvent<T extends EventTarget> = KeyboardEvent<T>;
export type TargetedMouseEvent<T extends EventTarget> = MouseEvent<T>;
export type TargetedPointerEvent<T extends EventTarget> = PointerEvent<T>;
export type TargetedWheelEvent<T extends EventTarget> = WheelEvent<T>;

export function textInput<T extends HTMLInputElement | HTMLTextAreaElement>(
  handler: (value: string) => void,
): { onChange: (event: ChangeEvent<T>) => void } {
  return { onChange: (event) => handler(event.currentTarget.value) };
}

export function textChange<T extends HTMLInputElement | HTMLTextAreaElement>(
  handler: (event: ChangeEvent<T>) => void,
  onInput?: (event: InputEvent<T>) => void,
): { onChange: (event: ChangeEvent<T>) => void; onInput?: (event: InputEvent<T>) => void } {
  return onInput ? { onChange: handler, onInput } : { onChange: handler };
}

export function dblClick<T extends EventTarget>(
  handler: (event: MouseEvent<T>) => void,
): { onDoubleClick: (event: MouseEvent<T>) => void } {
  return { onDoubleClick: handler };
}

export function focusWithin<T extends EventTarget>(
  handler: (event: FocusEvent<T>) => void,
): { onFocus: (event: FocusEvent<T>) => void } {
  return { onFocus: handler };
}

export function focusOut<T extends EventTarget>(
  handler: (event: FocusEvent<T>) => void,
): { onBlur: (event: FocusEvent<T>) => void } {
  return { onBlur: handler };
}
