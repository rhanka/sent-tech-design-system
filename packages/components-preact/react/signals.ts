/**
 * React twin of `src/signals.ts`. The emitted React package takes plain values
 * only: `MaybeSignal<T>` collapses to `T`, so its public props stay the ones
 * `@sentropic/design-system-react` publishes, and the adapter costs nothing at
 * run time. Signal-valued props are a Preact-port mapping (PLAN section 2.9).
 */
export type MaybeSignal<T> = T;

export function isSignal(_input: unknown): false {
  return false;
}

export function useValue<T>(input: MaybeSignal<T>): T {
  return input;
}

export function unwrap<T>(input: MaybeSignal<T>): T {
  return input;
}
