/**
 * Signals adapter, Preact implementation (decision K4: signals at the edges,
 * hooks inside). This is the only module allowed to import `@preact/signals`.
 *
 * A prop typed `MaybeSignal<T>` accepts a plain value or a signal. Components
 * read it once at the edge with `useValue` and keep ordinary hooks inside.
 *
 * React twin: `react/signals.ts`, where `MaybeSignal<T>` is `T`, so the emitted
 * React props are the ones `@sentropic/dataviz-react` publishes today.
 */
import { Signal } from "@preact/signals";
import type { ReadonlySignal } from "@preact/signals";

export type MaybeSignal<T> = T | ReadonlySignal<T>;

export function isSignal<T>(input: MaybeSignal<T>): input is ReadonlySignal<T> {
  return input instanceof Signal;
}

/**
 * Tracked read, for the render body: the component re-renders when the signal
 * changes (importing `@preact/signals` installs that tracking).
 */
export function useValue<T>(input: MaybeSignal<T>): T {
  return isSignal(input) ? input.value : input;
}

/** Untracked read, for event handlers and effects. */
export function unwrap<T>(input: MaybeSignal<T>): T {
  return isSignal(input) ? input.peek() : input;
}
