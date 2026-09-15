/**
 * Ephemeral cross-panel hover channel.
 *
 * `createHoverChannel` returns a tiny observable container for a hovered
 * datum key (`string | null`). Multiple chart panels can share one channel
 * instance to synchronise a crosshair: when the user hovers a data point in
 * panel A, it calls `set(key)`, and every other panel that has called
 * `subscribe` is notified synchronously.
 *
 * Design constraints:
 * - **Ephemeral** — hover state is transient UI; it is intentionally *not*
 *   part of {@link DashboardState} and must never be included in bookmark
 *   serialisation.
 * - **No-op on unchanged value** — calling `set` with the same key that is
 *   already current is a no-op; subscribers are not re-notified.
 * - **Synchronous notify** — subscribers are called inline during `set`, in
 *   insertion order.
 * - **Dependency-free** — no framework, no design-system imports.
 *
 * Usage:
 * ```ts
 * const channel = createHoverChannel();
 *
 * const unsubscribe = channel.subscribe((key) => {
 *   // re-render crosshair for `key`
 * });
 *
 * // On mouse-enter a data point:
 * channel.set('2024-Q3');
 *
 * // On mouse-leave:
 * channel.set(null);
 *
 * // Cleanup:
 * unsubscribe();
 * ```
 */

/** The public interface of a hover channel. */
export interface HoverChannel {
  /** Return the currently hovered key (`null` when nothing is hovered). */
  get(): string | null;
  /**
   * Update the hovered key. Notifies all subscribers synchronously.
   * No-op if `key` is strictly equal to the current value.
   */
  set(key: string | null): void;
  /**
   * Subscribe to hover changes. The listener is called with the new key every
   * time `set` is called with a different value.
   *
   * Returns an unsubscribe function. Calling it more than once is safe.
   */
  subscribe(listener: (key: string | null) => void): () => void;
}

/**
 * Create a new, independent hover channel.
 *
 * Each call returns a fresh channel; there is no global singleton. Callers
 * that want a shared channel across panels should create one at dashboard
 * mount time and pass it down.
 */
export function createHoverChannel(): HoverChannel {
  let current: string | null = null;
  // Use an array (not a Set) so the same function reference can be added
  // multiple times as independent subscriptions, each with its own unsubscribe.
  const listeners: Array<(key: string | null) => void> = [];

  return {
    get(): string | null {
      return current;
    },

    set(key: string | null): void {
      if (key === current) return;
      current = key;
      // Snapshot before iterating so in-flight unsubscribes do not affect this
      // notification pass.
      for (const listener of listeners.slice()) {
        listener(current);
      }
    },

    subscribe(listener: (key: string | null) => void): () => void {
      listeners.push(listener);
      let removed = false;
      return (): void => {
        if (removed) return;
        removed = true;
        // Remove only the first occurrence so that duplicate subscriptions of
        // the same function each get their own independent unsubscribe handle.
        const idx = listeners.indexOf(listener);
        if (idx !== -1) listeners.splice(idx, 1);
      };
    },
  };
}

/**
 * Extract the hover key from a datum record.
 *
 * A convenience helper for chart implementations that hold a typed datum
 * object and need a plain string key to pass to the channel. Returns `null`
 * when `datum` is `null`/`undefined` or the field is absent.
 *
 * @param datum  A plain data row or `null`/`undefined` (e.g. on mouse-leave).
 * @param keyField  The field name to read from the datum.
 */
export function hoverKeyOf(
  datum: Record<string, unknown> | null | undefined,
  keyField: string,
): string | null {
  if (datum == null) return null;
  const value = datum[keyField];
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return null;
}
